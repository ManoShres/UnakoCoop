/**
 * Regression tests for the server-side ledger client.
 *
 * These run fully offline: the Supabase client is mocked exactly like the
 * existing auth-service tests, so no network call, no database and no live
 * project is ever touched. What is asserted here is the CLIENT contract — that
 * it validates, forwards exactly what it was given, and above all that it never
 * reports a fabricated success for a money movement.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const { rpcMock, env } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  env: { configured: true },
}));

// Keep the suite offline: no real Supabase client is ever created.
vi.mock('../../lib/supabase', () => ({
  supabase: { rpc: rpcMock },
  isSupabaseConfigured: () => env.configured,
}));

import {
  DIVIDEND_MAX_RATE_PERCENT,
  LEDGER_MAX_AMOUNT,
  fromMinorUnits,
  isLedgerAmountAllowed,
  normalizeMoney,
  newIdempotencyKey,
  postDeposit,
  postDividendPayout,
  postLoanDisbursement,
  postWithdrawal,
  toMinorUnits,
} from '../ledgerService';

const MEMBER_ID = '3f2c6a10-7b1e-4c5d-9a20-1b2c3d4e5f60';
const ACCOUNT_NO = 'SAV-0001';
const LOAN_NO = 'LN-2081-0007';

type LedgerCall = (amount: number) => Promise<{ data: unknown; error: string | null }>;

/** All four posting entry points, driven by the same amount-invalid inputs. */
const amountCallers: ReadonlyArray<readonly [string, LedgerCall]> = [
  ['postDeposit', (amount) => postDeposit({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount })],
  ['postWithdrawal', (amount) => postWithdrawal({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount })],
  [
    'postDividendPayout',
    (amount) =>
      postDividendPayout({
        memberId: MEMBER_ID,
        accountNo: ACCOUNT_NO,
        grossAmount: amount,
        ratePercent: 10,
      }),
  ],
  [
    'postLoanDisbursement',
    (amount) =>
      postLoanDisbursement({ memberId: MEMBER_ID, loanNo: LOAN_NO, accountNo: ACCOUNT_NO, amount }),
  ],
];

const receipt = (overrides: Record<string, unknown> = {}) => ({
  ok: true,
  operation: 'post_deposit',
  idempotency_key: 'idem-0000000000000001',
  transaction_id: 'tx-uuid-1',
  amount: 100,
  balance: 250,
  replayed: false,
  ...overrides,
});

beforeEach(() => {
  rpcMock.mockReset();
  env.configured = true;
});

/* -------------------------------------------------------------------------- */

describe('ledger amount validation (client pre-flight)', () => {
  const invalidAmounts: ReadonlyArray<readonly [string, number]> = [
    ['negative', -1],
    ['negative fraction', -0.01],
    ['zero', 0],
    ['NaN', Number.NaN],
    ['positive infinity', Number.POSITIVE_INFINITY],
    ['negative infinity', Number.NEGATIVE_INFINITY],
    ['oversized', LEDGER_MAX_AMOUNT + 1],
    ['grossly oversized', 1e15],
  ];

  it.each(amountCallers)('%s rejects invalid amounts without calling the RPC', async (_name, call) => {
    for (const [label, amount] of invalidAmounts) {
      const result = await call(amount);
      expect(result.data, `${label} should not return data`).toBeNull();
      expect(result.error, `${label} should return an error`).toBeTruthy();
      expect(rpcMock, `${label} must not reach the database`).not.toHaveBeenCalled();
    }
  });

  it.each(amountCallers)('%s accepts the exact maximum amount', async (_name, call) => {
    rpcMock.mockResolvedValue({ data: receipt({ amount: LEDGER_MAX_AMOUNT }), error: null });
    const result = await call(LEDGER_MAX_AMOUNT);
    expect(result.error).toBeNull();
    expect(rpcMock).toHaveBeenCalledTimes(1);
  });

  it('rejects a member id that is not a UUID before posting', async () => {
    const result = await postDeposit({ memberId: 'm-1', accountNo: ACCOUNT_NO, amount: 100 });
    expect(result.data).toBeNull();
    expect(result.error).toMatch(/memberId/);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('rejects an empty account number before posting', async () => {
    const result = await postDeposit({ memberId: MEMBER_ID, accountNo: '   ', amount: 100 });
    expect(result.data).toBeNull();
    expect(result.error).toMatch(/accountNo/);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('rejects a short idempotency key', async () => {
    const result = await postDeposit({
      memberId: MEMBER_ID,
      accountNo: ACCOUNT_NO,
      amount: 100,
      idempotencyKey: 'abc',
    });
    expect(result.data).toBeNull();
    expect(result.error).toMatch(/idempotencyKey/);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('rejects a dividend rate above the statutory ceiling', async () => {
    const result = await postDividendPayout({
      memberId: MEMBER_ID,
      accountNo: ACCOUNT_NO,
      grossAmount: 1000,
      ratePercent: DIVIDEND_MAX_RATE_PERCENT + 0.01,
    });
    expect(result.data).toBeNull();
    expect(result.error).toMatch(/ratePercent/);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('rejects a negative dividend rate', async () => {
    const result = await postDividendPayout({
      memberId: MEMBER_ID,
      accountNo: ACCOUNT_NO,
      grossAmount: 1000,
      ratePercent: -1,
    });
    expect(result.data).toBeNull();
    expect(result.error).toMatch(/ratePercent/);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('rejects an unknown dividend destination', async () => {
    const result = await postDividendPayout({
      memberId: MEMBER_ID,
      accountNo: ACCOUNT_NO,
      grossAmount: 1000,
      ratePercent: 10,
      // deliberately invalid: the union type is bypassed on purpose
      destination: 'CRYPTO' as unknown as 'SAVINGS',
    });
    expect(result.data).toBeNull();
    expect(result.error).toMatch(/destination/);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('requires an account number when the dividend destination is SAVINGS', async () => {
    const result = await postDividendPayout({
      memberId: MEMBER_ID,
      grossAmount: 1000,
      ratePercent: 10,
      destination: 'SAVINGS',
    });
    expect(result.data).toBeNull();
    expect(result.error).toMatch(/accountNo/);
    expect(rpcMock).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */

describe('unconfigured Supabase never mutates anything', () => {
  it.each(amountCallers)('%s fails closed when Supabase is not configured', async (_name, call) => {
    env.configured = false;

    const result = await call(100);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/not configured/i);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('reports the ledger as unavailable', async () => {
    env.configured = false;
    expect((await postDeposit({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount: 10 })).error).toContain(
      'No client-side money mutation was performed'
    );
  });
});

/* -------------------------------------------------------------------------- */

describe('idempotency key handling', () => {
  beforeEach(() => {
    rpcMock.mockResolvedValue({ data: receipt(), error: null });
  });

  it('forwards a caller-supplied idempotency key unchanged', async () => {
    const key = 'retry-safe-key-000000000001';
    await postDeposit({
      memberId: MEMBER_ID,
      accountNo: ACCOUNT_NO,
      amount: 250.75,
      reference: 'REF-1',
      idempotencyKey: key,
    });

    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith(
      'post_deposit',
      expect.objectContaining({
        p_idempotency_key: key,
        p_member_id: MEMBER_ID,
        p_account_no: ACCOUNT_NO,
        p_amount: 250.75,
        p_reference: 'REF-1',
      })
    );
  });

  it('generates an idempotency key when the caller omits one', async () => {
    await postWithdrawal({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount: 10 });

    const [, args] = rpcMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(typeof args.p_idempotency_key).toBe('string');
    expect((args.p_idempotency_key as string).length).toBeGreaterThanOrEqual(8);
  });

  it('generates unique keys', () => {
    const keys = new Set(Array.from({ length: 25 }, () => newIdempotencyKey()));
    expect(keys.size).toBe(25);
  });

  it('maps each entry point to its own RPC name', async () => {
    await postDeposit({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount: 1 });
    await postWithdrawal({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount: 1 });
    await postDividendPayout({
      memberId: MEMBER_ID,
      accountNo: ACCOUNT_NO,
      grossAmount: 1,
      ratePercent: 5,
    });
    await postLoanDisbursement({
      memberId: MEMBER_ID,
      loanNo: LOAN_NO,
      accountNo: ACCOUNT_NO,
      amount: 1,
    });

    expect(rpcMock.mock.calls.map((call) => call[0])).toEqual([
      'post_deposit',
      'post_withdrawal',
      'post_dividend_payout',
      'post_loan_disbursement',
    ]);
  });

  it('sends nulls rather than undefined for omitted optional arguments', async () => {
    await postDeposit({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount: 5 });

    const [, args] = rpcMock.mock.calls[0] as [string, Record<string, unknown>];
    expect(args.p_reference).toBeNull();
    expect(args.p_description).toBeNull();
  });

  it('allows a non-SAVINGS dividend payout without an account number', async () => {
    await postDividendPayout({
      memberId: MEMBER_ID,
      grossAmount: 1000,
      ratePercent: 10,
      destination: 'CASH',
    });

    expect(rpcMock).toHaveBeenCalledWith(
      'post_dividend_payout',
      expect.objectContaining({ p_destination: 'CASH', p_account_no: null })
    );
  });
});

/* -------------------------------------------------------------------------- */

describe('RPC failures and malformed receipts are never successes', () => {
  it('surfaces a database error verbatim and returns no data', async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { message: 'ledger: insufficient funds on account SAV-0001 (balance 50.00, requested 100.00)' },
    });

    const result = await postWithdrawal({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount: 100 });

    expect(result.data).toBeNull();
    expect(result.error).toContain('insufficient funds');
    expect(result.error).toContain('post_withdrawal');
  });

  it.each(amountCallers)('%s treats a null payload with no error as a failure', async (_name, call) => {
    rpcMock.mockResolvedValue({ data: null, error: null });

    const result = await call(100);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/no valid receipt/i);
  });

  it('rejects a receipt whose ok flag is not true', async () => {
    rpcMock.mockResolvedValue({ data: { ok: false, reason: 'rejected' }, error: null });

    const result = await postDeposit({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount: 100 });

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/UNKNOWN/i);
  });

  it('rejects a non-object payload', async () => {
    rpcMock.mockResolvedValue({ data: 'OK', error: null });

    const result = await postDeposit({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount: 100 });

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it('rejects an array payload', async () => {
    rpcMock.mockResolvedValue({ data: [receipt()], error: null });

    const result = await postDeposit({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount: 100 });

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it('turns a thrown transport error into an UNKNOWN-outcome error, not a success', async () => {
    rpcMock.mockRejectedValue(new Error('network down'));

    const result = await postDeposit({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount: 100 });

    expect(result.data).toBeNull();
    expect(result.error).toContain('network down');
    expect(result.error).toMatch(/UNKNOWN/i);
    expect(result.error).toContain('SAME idempotency key');
  });
});

/* -------------------------------------------------------------------------- */

describe('receipt mapping', () => {
  it('maps a successful deposit receipt from snake_case', async () => {
    rpcMock.mockResolvedValue({ data: receipt({ amount: 100, balance: 350.5, operation: 'post_deposit' }), error: null });

    const result = await postDeposit({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount: 100 });

    expect(result.error).toBeNull();
    expect(result.data?.ok).toBe(true);
    expect(result.data?.operation).toBe('post_deposit');
    expect(result.data?.transactionId).toBe('tx-uuid-1');
    expect(result.data?.amount).toBe(100);
    expect(result.data?.balance).toBe(350.5);
    expect(result.data?.replayed).toBe(false);
  });

  it('maps a replayed receipt and keeps the replayed flag', async () => {
    rpcMock.mockResolvedValue({
      data: receipt({ replayed: true, balance: 350.5 }),
      error: null,
    });

    const result = await postDeposit({
      memberId: MEMBER_ID,
      accountNo: ACCOUNT_NO,
      amount: 100,
      idempotencyKey: 'replayed-key-0000000000001',
    });

    expect(result.data?.replayed).toBe(true);
    expect(result.data?.balance).toBe(350.5);
  });

  it('maps dividend-specific fields', async () => {
    rpcMock.mockResolvedValue({
      data: receipt({
        operation: 'post_dividend_payout',
        amount: 950,
        net_amount: 950,
        gross_applied: 1000,
        gross_requested: 1200,
        capped: true,
        tds: 50,
        accrued_dividend_remaining: 0,
        balance: 1950,
      }),
      error: null,
    });

    const result = await postDividendPayout({
      memberId: MEMBER_ID,
      accountNo: ACCOUNT_NO,
      grossAmount: 1200,
      ratePercent: 10,
    });

    expect(result.data?.tds).toBe(50);
    expect(result.data?.grossApplied).toBe(1000);
    expect(result.data?.capped).toBe(true);
    expect(result.data?.accruedDividendRemaining).toBe(0);
    expect(result.data?.amount).toBe(950);
  });

  it('maps loan disbursement fields and the booked transaction type', async () => {
    rpcMock.mockResolvedValue({
      data: receipt({
        operation: 'post_loan_disbursement',
        amount: 40000,
        loan_no: LOAN_NO,
        transaction_type: 'LOAN_DISBURSEMENT',
        balance: 50000,
      }),
      error: null,
    });

    const result = await postLoanDisbursement({
      memberId: MEMBER_ID,
      loanNo: LOAN_NO,
      accountNo: ACCOUNT_NO,
      amount: 40000,
    });

    expect(result.data?.loanNo).toBe(LOAN_NO);
    expect(result.data?.transactionType).toBe('LOAN_DISBURSEMENT');
    expect(result.data?.transactionType).not.toBe('DEPOSIT');
  });
});

/* -------------------------------------------------------------------------- */

describe('money helpers never do ledger arithmetic in floating point', () => {
  it('round-trips through integer minor units', () => {
    expect(toMinorUnits(123.45)).toBe(12345);
    expect(fromMinorUnits(12345)).toBe(123.45);
    expect(toMinorUnits(0.07)).toBe(7);
    expect(fromMinorUnits(7)).toBe(0.07);
  });

  it('normalises binary floating point dust to 2 decimals', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(normalizeMoney(0.1 + 0.2)).toBe(0.3);
  });

  it('sends the normalised amount to the database', async () => {
    rpcMock.mockResolvedValue({ data: receipt(), error: null });

    await postDeposit({ memberId: MEMBER_ID, accountNo: ACCOUNT_NO, amount: 0.1 + 0.2 });

    expect(rpcMock).toHaveBeenCalledWith(
      'post_deposit',
      expect.objectContaining({ p_amount: 0.3 })
    );
  });

  it('exposes the same amount ceiling the SQL enforces', () => {
    expect(LEDGER_MAX_AMOUNT).toBe(100_000_000);
    expect(isLedgerAmountAllowed(LEDGER_MAX_AMOUNT)).toBe(true);
    expect(isLedgerAmountAllowed(LEDGER_MAX_AMOUNT + 0.01)).toBe(false);
    expect(isLedgerAmountAllowed(0)).toBe(false);
    expect(isLedgerAmountAllowed(-5)).toBe(false);
    expect(isLedgerAmountAllowed(Number.NaN)).toBe(false);
  });
});
