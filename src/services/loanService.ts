import { supabase } from '../lib/supabase';
import type { Loan, LoanApplication } from '../types';
import {
  CreateLoanApplicationSchema,
  CreateLoanSchema,
  LoanMetadataUpdateSchema,
  MAX_FINANCIAL_AMOUNT,
} from '../schemas/financialSchema';
import type { ServiceResult } from './serviceResult';

const NOT_CONFIGURED =
  'Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).';

/**
 * @deprecated WRITE PATHS — loan disbursement must go through
 * `src/services/ledgerService.ts` (`postLoanDisbursement`), which posts inside the
 * server-side row-locked RPC and derives the transaction type server-side. The
 * create/update/repayment helpers below are retained for schema validation and for
 * environments that still grant direct table writes; they will fail with
 * "permission denied" against a hardened database.
 */
export const LOAN_WRITE_PATH_DEPRECATED =
  'Direct loan writes are deprecated in favour of ledgerService (server-side RPCs).';

// ==================== LOANS ====================

export interface LoanRow {
  id: string;
  member_id: string | null;
  loan_no: string;
  loan_type: Loan['loanType'];
  principal_amount: number;
  remaining_balance: number;
  interest_rate: number;
  tenure_months: number;
  monthly_emi: number;
  disbursed_date: string;
  next_due_date: string;
  status: Loan['status'];
  collateral_description: string;
}

export const rowToLoan = (row: LoanRow): Loan => ({
  id: row.id,
  memberId: row.member_id || undefined,
  loanNo: row.loan_no,
  loanType: row.loan_type,
  principalAmount: row.principal_amount,
  remainingBalance: row.remaining_balance,
  interestRate: row.interest_rate,
  tenureMonths: row.tenure_months,
  monthlyEmi: row.monthly_emi,
  disbursedDate: row.disbursed_date,
  nextDueDate: row.next_due_date,
  status: row.status,
  collateralDescription: row.collateral_description,
});

export const loanToRow = (
  l: Omit<Loan, 'id'>
): Omit<LoanRow, 'id'> => ({
  member_id: l.memberId ?? null,
  loan_no: l.loanNo,
  loan_type: l.loanType,
  principal_amount: l.principalAmount,
  remaining_balance: l.remainingBalance,
  interest_rate: l.interestRate,
  tenure_months: l.tenureMonths,
  monthly_emi: l.monthlyEmi,
  disbursed_date: l.disbursedDate,
  next_due_date: l.nextDueDate,
  status: l.status,
  collateral_description: l.collateralDescription,
});

export const fetchLoansFromSupabase = async (): Promise<
  ServiceResult<Loan[]>
> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('disbursed_date', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: (data as LoanRow[]).map(rowToLoan), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const createLoanInSupabase = async (
  loan: Omit<Loan, 'id'>
): Promise<ServiceResult<Loan>> => {
  // Validate at the service boundary ALWAYS (before the configuration check). The old
  // implementation inserted the payload unvalidated, so negative/absurd amounts reached
  // the database.
  const validation = CreateLoanSchema.safeParse(loan);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      data: null,
      error: `Validation error: ${firstIssue?.path.join('.') ?? 'field'} - ${firstIssue?.message ?? 'invalid input'}`,
    };
  }

  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  try {
    const { data, error } = await supabase
      .from('loans')
      .insert(loanToRow(loan))
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToLoan(data as LoanRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

/** Fields writable through the generic loan update path (never the balance). */
const ALLOWED_LOAN_UPDATE_KEYS = ['status', 'nextDueDate', 'interestRate'] as const;

/**
 * Updates loan metadata only. `remaining_balance` is deliberately NOT writable here:
 * balances move exclusively through {@link recordLoanRepaymentInSupabase}, which forbids
 * increases (and rejects overpayment / negative results).
 */
export const updateLoanInSupabase = async (
  loanNo: string,
  updates: Partial<Loan>
): Promise<ServiceResult<Loan>> => {
  if (typeof loanNo !== 'string' || loanNo.trim().length === 0) {
    return { data: null, error: 'Validation error: loanNo - Loan number is required.' };
  }

  if (updates.remainingBalance !== undefined) {
    return {
      data: null,
      error:
        'Validation error: remainingBalance - the loan balance is only writable through ' +
        'recordLoanRepaymentInSupabase(), which forbids increases.',
    };
  }

  const providedKeys = Object.entries(updates)
    .filter(([, value]) => value !== undefined)
    .map(([key]) => key);
  const disallowedKey = providedKeys.find(
    (key) => !(ALLOWED_LOAN_UPDATE_KEYS as readonly string[]).includes(key)
  );
  if (disallowedKey) {
    return {
      data: null,
      error: `Validation error: ${disallowedKey} - field is not writable through the generic loan update path.`,
    };
  }

  const validation = LoanMetadataUpdateSchema.safeParse(updates);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      data: null,
      error: `Validation error: ${firstIssue?.path.join('.') ?? 'field'} - ${firstIssue?.message ?? 'invalid input'}`,
    };
  }

  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  try {
    const row: Record<string, unknown> = {};
    if (validation.data.status !== undefined) row.status = validation.data.status;
    if (validation.data.nextDueDate !== undefined) row.next_due_date = validation.data.nextDueDate;
    if (validation.data.interestRate !== undefined) row.interest_rate = validation.data.interestRate;

    const { data, error } = await supabase
      .from('loans')
      .update(row)
      .eq('loan_no', loanNo)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToLoan(data as LoanRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

/**
 * Pure repayment arithmetic: a repayment may only DECREASE the outstanding balance.
 * Exported so the invariant is testable without a database.
 */
export function computeRepaymentBalance(
  currentBalance: number,
  amount: number
): { ok: boolean; newBalance: number; error?: string } {
  if (!Number.isFinite(currentBalance) || currentBalance < 0) {
    return { ok: false, newBalance: 0, error: 'Current outstanding balance is invalid.' };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, newBalance: currentBalance, error: 'Repayment amount must be greater than zero.' };
  }
  if (amount > MAX_FINANCIAL_AMOUNT) {
    return { ok: false, newBalance: currentBalance, error: 'Repayment amount exceeds the maximum limit.' };
  }
  if (amount > currentBalance) {
    return {
      ok: false,
      newBalance: currentBalance,
      error: 'Repayment exceeds the outstanding balance; record any excess as a separate credit.',
    };
  }
  return { ok: true, newBalance: Number((currentBalance - amount).toFixed(2)) };
}

/**
 * The ONLY path that may move `remaining_balance`. Reads the current balance, applies the
 * pure repayment arithmetic (monotonic decrease, no overpayment, never negative), then
 * writes the computed value.
 *
 * NOTE: this is a client-side guard; the authoritative, row-locked money path is the
 * server ledger RPC (`src/services/ledgerService.ts` / `supabase/migrations/0001_ledger.sql`).
 */
export const recordLoanRepaymentInSupabase = async (
  loanNo: string,
  amount: number
): Promise<ServiceResult<Loan>> => {
  if (typeof loanNo !== 'string' || loanNo.trim().length === 0) {
    return { data: null, error: 'Validation error: loanNo - Loan number is required.' };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { data: null, error: 'Validation error: amount - Repayment amount must be greater than zero.' };
  }

  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  try {
    const { data: current, error: readError } = await supabase
      .from('loans')
      .select('remaining_balance')
      .eq('loan_no', loanNo)
      .single();
    if (readError) return { data: null, error: readError.message };

    const currentBalance = Number((current as { remaining_balance: number } | null)?.remaining_balance);
    const outcome = computeRepaymentBalance(currentBalance, amount);
    if (!outcome.ok) return { data: null, error: outcome.error ?? 'Invalid repayment.' };

    const { data, error } = await supabase
      .from('loans')
      .update({ remaining_balance: outcome.newBalance })
      .eq('loan_no', loanNo)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToLoan(data as LoanRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

// ==================== LOAN APPLICATIONS ====================

export interface LoanApplicationRow {
  id: string;
  application_no: string;
  member_id: string;
  member_name: string;
  member_no: string;
  loan_type: LoanApplication['loanType'];
  requested_amount: number;
  tenure_months: number;
  monthly_income: number;
  existing_debt: number;
  purpose: string;
  collateral_details: string;
  applied_date: string;
  status: LoanApplication['status'];
  citizenship_uploaded: boolean;
  collateral_proof_uploaded: boolean;
  income_proof_uploaded: boolean;
  committee_notes: string | null;
}

export const rowToLoanApplication = (row: LoanApplicationRow): LoanApplication => ({
  id: row.id,
  applicationNo: row.application_no,
  memberId: row.member_id,
  memberName: row.member_name,
  memberNo: row.member_no,
  loanType: row.loan_type,
  requestedAmount: row.requested_amount,
  tenureMonths: row.tenure_months,
  monthlyIncome: row.monthly_income,
  existingDebt: row.existing_debt,
  purpose: row.purpose,
  collateralDetails: row.collateral_details,
  appliedDate: row.applied_date,
  status: row.status,
  documents: {
    citizenshipUploaded: row.citizenship_uploaded,
    collateralProofUploaded: row.collateral_proof_uploaded,
    incomeProofUploaded: row.income_proof_uploaded,
  },
  committeeNotes: row.committee_notes || undefined,
});

export const loanApplicationToRow = (
  a: Omit<LoanApplication, 'id'>
): Omit<LoanApplicationRow, 'id'> => ({
  application_no: a.applicationNo,
  member_id: a.memberId,
  member_name: a.memberName,
  member_no: a.memberNo,
  loan_type: a.loanType,
  requested_amount: a.requestedAmount,
  tenure_months: a.tenureMonths,
  monthly_income: a.monthlyIncome,
  existing_debt: a.existingDebt,
  purpose: a.purpose,
  collateral_details: a.collateralDetails,
  applied_date: a.appliedDate,
  status: a.status,
  citizenship_uploaded: a.documents.citizenshipUploaded,
  collateral_proof_uploaded: a.documents.collateralProofUploaded,
  income_proof_uploaded: a.documents.incomeProofUploaded,
  committee_notes: a.committeeNotes || null,
});

export const fetchLoanApplicationsFromSupabase = async (): Promise<
  ServiceResult<LoanApplication[]>
> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .order('applied_date', { ascending: false });
    if (error) return { data: null, error: error.message };
    return {
      data: (data as LoanApplicationRow[]).map(rowToLoanApplication),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const createLoanApplicationInSupabase = async (
  app: Omit<LoanApplication, 'id'>
): Promise<ServiceResult<LoanApplication>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  // Validate at service boundary
  const validation = CreateLoanApplicationSchema.safeParse({
    memberId: app.memberId,
    loanSchemeId: app.loanType,
    requestedAmount: app.requestedAmount,
    purpose: app.purpose,
    requestedTermMonths: app.tenureMonths,
  });
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      data: null,
      error: `Validation error: ${firstIssue?.path.join('.') ?? 'field'} - ${firstIssue?.message ?? 'invalid input'}`,
    };
  }

  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .insert(loanApplicationToRow(app))
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return {
      data: rowToLoanApplication(data as LoanApplicationRow),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const updateLoanApplicationInSupabase = async (
  applicationNo: string,
  updates: Partial<LoanApplication>
): Promise<ServiceResult<LoanApplication>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const row: Record<string, unknown> = {};
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.committeeNotes !== undefined)
      row.committee_notes = updates.committeeNotes || null;
    const { data, error } = await supabase
      .from('loan_applications')
      .update(row)
      .eq('application_no', applicationNo)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return {
      data: rowToLoanApplication(data as LoanApplicationRow),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};
