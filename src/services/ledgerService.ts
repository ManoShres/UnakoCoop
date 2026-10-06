/**
 * Server-side transactional ledger client.
 *
 * Every money movement in Unako SACCOS must go through the SECURITY DEFINER
 * functions in `supabase/migrations/0001_ledger.sql` — this module is the ONLY
 * supported client for them. It deliberately has no client-side fallback: when
 * Supabase is not configured the operation fails rather than mutating Zustand
 * mock state, because a browser-side "success" for money is exactly the defect
 * this layer was created to remove.
 *
 * Guarantees this client relies on (all enforced in SQL, not here):
 *   - the destination account must exist AND belong to the member;
 *   - rows are locked with `select ... for update`, so concurrent posts serialise;
 *   - the idempotency key makes retries replay the ORIGINAL receipt instead of
 *     posting twice;
 *   - balances are read and written by PostgreSQL; the client never sends a
 *     balance and never performs ledger arithmetic.
 *
 * The Zod validation here is a fast, friendly pre-flight only. It is NOT the
 * security boundary — the database re-validates every argument.
 */

import { z } from 'zod';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { ServiceResult } from './serviceResult';

/** Must stay in sync with `public.ledger_max_amount()` in 0001_ledger.sql. */
export const LEDGER_MAX_AMOUNT = 100_000_000;

/** Statutory ceiling on a declared dividend rate (%), enforced again in SQL. */
export const DIVIDEND_MAX_RATE_PERCENT = 18;

/** TDS withheld on dividend payouts (%), derived server-side. */
export const DIVIDEND_TDS_PERCENT = 5;

const NOT_CONFIGURED_ERROR =
  'The server-side ledger is unavailable: Supabase is not configured. No client-side ' +
  'money mutation was performed. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and ' +
  'apply supabase/migrations/0001_ledger.sql.';

export type LedgerOperation =
  | 'post_deposit'
  | 'post_withdrawal'
  | 'post_dividend_payout'
  | 'post_loan_disbursement';

export type DividendDestination = 'SAVINGS' | 'CASH' | 'BANK';

/** Server receipt, mapped from the snake_case `jsonb` returned by the RPC. */
export interface LedgerPostResult {
  readonly ok: true;
  readonly operation: LedgerOperation;
  readonly idempotencyKey: string;
  readonly transactionId: string | null;
  /** Amount actually posted (for dividends this is the NET amount). */
  readonly amount: number;
  /** Resulting savings balance, or null when no savings account was credited. */
  readonly balance: number | null;
  /** True when the idempotency key had already been processed and this is the stored receipt. */
  readonly replayed: boolean;
  /** Dividend only. */
  readonly tds?: number;
  readonly grossApplied?: number;
  readonly capped?: boolean;
  readonly accruedDividendRemaining?: number;
  /** Loan disbursement only. */
  readonly loanNo?: string;
  readonly transactionType?: string;
  /** Raw receipt as returned by PostgreSQL, for audit display. */
  readonly raw: Readonly<Record<string, unknown>>;
}

export interface PostDepositInput {
  readonly memberId: string;
  readonly accountNo: string;
  readonly amount: number;
  readonly reference?: string;
  readonly description?: string;
  /** Supply to make an explicit retry safe; generated when omitted. */
  readonly idempotencyKey?: string;
}

export interface PostWithdrawalInput {
  readonly memberId: string;
  readonly accountNo: string;
  readonly amount: number;
  readonly reference?: string;
  readonly description?: string;
  readonly idempotencyKey?: string;
}

export interface PostDividendPayoutInput {
  readonly memberId: string;
  readonly accountNo?: string | null;
  readonly grossAmount: number;
  readonly ratePercent: number;
  readonly destination?: DividendDestination;
  readonly reference?: string;
  readonly idempotencyKey?: string;
}

export interface PostLoanDisbursementInput {
  readonly memberId: string;
  readonly loanNo: string;
  readonly accountNo: string;
  readonly amount: number;
  readonly reference?: string;
  readonly description?: string;
  readonly idempotencyKey?: string;
}

/* -------------------------------------------------------------------------- */
/* Money helpers                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Converts a major-unit amount to integer minor units (paisa).
 * Exposed so callers and tests can reason about money without binary float dust.
 */
export const toMinorUnits = (amount: number): number => Math.round(amount * 100);

/** Converts integer minor units back to a major-unit number. */
export const fromMinorUnits = (minorUnits: number): number => minorUnits / 100;

/**
 * Canonicalises an amount for the wire: no floating-point ledger arithmetic is
 * performed here, the value is only snapped to 2 decimal places so the client
 * and `numeric(14,2)` agree on the exact figure.
 */
export const normalizeMoney = (amount: number): number => fromMinorUnits(toMinorUnits(amount));

/**
 * Generates a caller-side idempotency key so a retried submission cannot
 * double-post. `crypto.randomUUID` when available (browsers, Node >= 19).
 */
export const newIdempotencyKey = (): string => {
  const cryptoApi = globalThis.crypto as Crypto | undefined;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  return `led-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const memberIdSchema = z
  .string()
  .regex(UUID_PATTERN, 'memberId must be a UUID');

const idempotencyKeySchema = z
  .string()
  .min(8, 'idempotencyKey must be at least 8 characters')
  .max(200, 'idempotencyKey must be at most 200 characters');

const accountNoSchema = z
  .string()
  .trim()
  .min(1, 'accountNo is required')
  .max(64, 'accountNo must be at most 64 characters');

const loanNoSchema = z
  .string()
  .trim()
  .min(1, 'loanNo is required')
  .max(64, 'loanNo must be at most 64 characters');

/**
 * Money rule: finite, strictly positive, and capped at the same ceiling the
 * database enforces. `z.number()` rejects NaN; `.positive()` rejects 0 and
 * negatives; `.max()` rejects +Infinity and oversized values.
 */
const amountSchema = z
  .number()
  .positive('amount must be greater than zero')
  .max(LEDGER_MAX_AMOUNT, `amount must not exceed ${LEDGER_MAX_AMOUNT}`);

const ratePercentSchema = z
  .number()
  .min(0, 'ratePercent must not be negative')
  .max(DIVIDEND_MAX_RATE_PERCENT, `ratePercent must not exceed ${DIVIDEND_MAX_RATE_PERCENT}`);

const referenceSchema = z.string().max(120, 'reference must be at most 120 characters').optional();
const descriptionSchema = z.string().max(500, 'description must be at most 500 characters').optional();
const destinationSchema = z.enum(
  ['SAVINGS', 'CASH', 'BANK'],
  'destination must be SAVINGS, CASH or BANK'
);

const depositSchema = z.object({
  memberId: memberIdSchema,
  accountNo: accountNoSchema,
  amount: amountSchema,
  reference: referenceSchema,
  description: descriptionSchema,
  idempotencyKey: idempotencyKeySchema.optional(),
});

const withdrawalSchema = depositSchema;

const dividendSchema = z.object({
  memberId: memberIdSchema,
  accountNo: accountNoSchema.optional(),
  grossAmount: amountSchema,
  ratePercent: ratePercentSchema,
  destination: destinationSchema.optional(),
  reference: referenceSchema,
  idempotencyKey: idempotencyKeySchema.optional(),
});

const disbursementSchema = z.object({
  memberId: memberIdSchema,
  loanNo: loanNoSchema,
  accountNo: accountNoSchema,
  amount: amountSchema,
  reference: referenceSchema,
  description: descriptionSchema,
  idempotencyKey: idempotencyKeySchema.optional(),
});

/** Renders the first Zod issue as a single readable sentence. */
const describeIssues = (error: z.ZodError): string => {
  const issue = error.issues[0];
  if (!issue) return 'Invalid ledger request.';
  const path = issue.path.join('.');
  return path ? `${path}: ${issue.message}` : issue.message;
};

/* -------------------------------------------------------------------------- */
/* RPC plumbing                                                               */
/* -------------------------------------------------------------------------- */

interface RpcResponse {
  readonly data: unknown;
  readonly error: { readonly message: string } | null;
}

interface RpcCaller {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<RpcResponse>;
}

/** Typed view of the (untyped) supabase-js client, kept lazy so mocks work. */
const rpcCaller = (): RpcCaller => supabase as unknown as RpcCaller;

const unavailable = (): ServiceResult<LedgerPostResult> => ({ data: null, error: NOT_CONFIGURED_ERROR });

const isReady = (): boolean => isSupabaseConfigured() && supabase !== null;

const asString = (value: unknown): string | null => (typeof value === 'string' ? value : null);
const asFiniteNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;
const asNullableNumber = (value: unknown): number | null => asFiniteNumber(value) ?? null;

/**
 * Maps a PostgreSQL receipt into `LedgerPostResult`.
 * Returns null when the payload is not a positive confirmation — a missing or
 * malformed receipt must never be reported to the UI as success.
 */
const parseReceipt = (operation: LedgerOperation, data: unknown): LedgerPostResult | null => {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return null;

  const raw = data as Record<string, unknown>;
  if (raw.ok !== true) return null;

  return {
    ok: true,
    operation,
    idempotencyKey: asString(raw.idempotency_key) ?? '',
    transactionId: asString(raw.transaction_id),
    amount: asFiniteNumber(raw.amount) ?? 0,
    balance: asNullableNumber(raw.balance),
    replayed: raw.replayed === true,
    tds: asFiniteNumber(raw.tds),
    grossApplied: asFiniteNumber(raw.gross_applied),
    capped: raw.capped === true ? true : undefined,
    accruedDividendRemaining: asFiniteNumber(raw.accrued_dividend_remaining),
    loanNo: asString(raw.loan_no) ?? undefined,
    transactionType: asString(raw.transaction_type) ?? undefined,
    raw,
  };
};

const executeRpc = async (
  operation: LedgerOperation,
  args: Record<string, unknown>
): Promise<ServiceResult<LedgerPostResult>> => {
  let data: unknown;
  let error: { readonly message: string } | null;

  try {
    const response = await rpcCaller().rpc(operation, args);
    data = response.data;
    error = response.error;
  } catch (thrown) {
    // Network/transport failure: the request may or may not have reached
    // PostgreSQL, so the only safe instruction is "retry with the same key".
    const detail = thrown instanceof Error ? thrown.message : 'unknown transport error';
    return {
      data: null,
      error:
        `Ledger ${operation} could not be completed (${detail}). The outcome is UNKNOWN — ` +
        're-issue the request with the SAME idempotency key.',
    };
  }

  if (error) {
    return { data: null, error: `Ledger ${operation} failed: ${error.message}` };
  }

  const receipt = parseReceipt(operation, data);
  if (!receipt) {
    return {
      data: null,
      error:
        `Ledger ${operation} returned no valid receipt, so the outcome is UNKNOWN. ` +
        'Re-issue the request with the SAME idempotency key: a replay returns the original receipt ' +
        'and cannot double-post.',
    };
  }

  return { data: receipt, error: null };
};

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

/** Credits one savings account that must belong to `memberId`. */
export const postDeposit = async (
  input: PostDepositInput
): Promise<ServiceResult<LedgerPostResult>> => {
  if (!isReady()) return unavailable();

  const parsed = depositSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: describeIssues(parsed.error) };

  const amount = normalizeMoney(parsed.data.amount);

  return executeRpc('post_deposit', {
    p_idempotency_key: parsed.data.idempotencyKey ?? newIdempotencyKey(),
    p_member_id: parsed.data.memberId,
    p_account_no: parsed.data.accountNo,
    p_amount: amount,
    p_reference: parsed.data.reference ?? null,
    p_description: parsed.data.description ?? null,
  });
};

/** Debits one savings account that must belong to `memberId`; no overdraft. */
export const postWithdrawal = async (
  input: PostWithdrawalInput
): Promise<ServiceResult<LedgerPostResult>> => {
  if (!isReady()) return unavailable();

  const parsed = withdrawalSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: describeIssues(parsed.error) };

  const amount = normalizeMoney(parsed.data.amount);

  return executeRpc('post_withdrawal', {
    p_idempotency_key: parsed.data.idempotencyKey ?? newIdempotencyKey(),
    p_member_id: parsed.data.memberId,
    p_account_no: parsed.data.accountNo,
    p_amount: amount,
    p_reference: parsed.data.reference ?? null,
    p_description: parsed.data.description ?? null,
  });
};

/**
 * Pays out accrued dividend. TDS, the rate ceiling and the accrued cap are
 * derived by PostgreSQL; `grossAmount` is only the requested figure.
 */
export const postDividendPayout = async (
  input: PostDividendPayoutInput
): Promise<ServiceResult<LedgerPostResult>> => {
  if (!isReady()) return unavailable();

  const parsed = dividendSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: describeIssues(parsed.error) };

  const grossAmount = normalizeMoney(parsed.data.grossAmount);
  const destination: DividendDestination = parsed.data.destination ?? 'SAVINGS';

  if (destination === 'SAVINGS' && !parsed.data.accountNo) {
    return { data: null, error: 'accountNo is required when destination is SAVINGS.' };
  }

  return executeRpc('post_dividend_payout', {
    p_idempotency_key: parsed.data.idempotencyKey ?? newIdempotencyKey(),
    p_member_id: parsed.data.memberId,
    p_account_no: parsed.data.accountNo ?? null,
    p_gross_amount: grossAmount,
    p_rate_percent: parsed.data.ratePercent,
    p_destination: destination,
    p_reference: parsed.data.reference ?? null,
  });
};

/** Disburses a loan once, into the member's own account. */
export const postLoanDisbursement = async (
  input: PostLoanDisbursementInput
): Promise<ServiceResult<LedgerPostResult>> => {
  if (!isReady()) return unavailable();

  const parsed = disbursementSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: describeIssues(parsed.error) };

  const amount = normalizeMoney(parsed.data.amount);

  return executeRpc('post_loan_disbursement', {
    p_idempotency_key: parsed.data.idempotencyKey ?? newIdempotencyKey(),
    p_member_id: parsed.data.memberId,
    p_loan_no: parsed.data.loanNo,
    p_account_no: parsed.data.accountNo,
    p_amount: amount,
    p_reference: parsed.data.reference ?? null,
    p_description: parsed.data.description ?? null,
  });
};

/** True when the ledger RPCs are reachable (Supabase configured). */
export const isLedgerAvailable = (): boolean => isReady();

/** Exposed for callers that must pre-flight the exact SQL rule. */
export const isLedgerAmountAllowed = (amount: number): boolean =>
  Number.isFinite(amount) && amount > 0 && amount <= LEDGER_MAX_AMOUNT;
