import { supabase } from '../lib/supabase';
import type { Loan, LoanApplication } from '../types';
import { CreateLoanApplicationSchema } from '../schemas/financialSchema';
import type { ServiceResult } from './serviceResult';

const NOT_CONFIGURED =
  'Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).';

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

export const updateLoanInSupabase = async (
  loanNo: string,
  updates: Partial<Loan>
): Promise<ServiceResult<Loan>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const row: Record<string, unknown> = {};
    if (updates.remainingBalance !== undefined)
      row.remaining_balance = updates.remainingBalance;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.nextDueDate !== undefined) row.next_due_date = updates.nextDueDate;
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
