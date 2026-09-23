import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  Member,
  SavingsAccount,
  Loan,
  LoanApplication,
  Transaction,
  Notice,
  LoanScheme,
  GatewayRail,
  Inquiry,
  Notification,
  CoopSettings,
  SharePool,
  AgmDetails,
  FieldOfficer,
} from '../types';

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

const NOT_CONFIGURED =
  'Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).';

// ==================== MEMBERS ====================

export interface MemberRow {
  id: string;
  member_no: string;
  name: string;
  name_nepali: string | null;
  email: string;
  phone: string;
  citizenship_no: string;
  pan_no: string | null;
  joined_date: string;
  address: string;
  status: Member['status'];
  avatar_url: string;
  share_capital: number;
  total_savings: number;
  active_loan_balance: number;
  accrued_dividend: number;
  credit_score: number;
  bank_details: Member['bankDetails'] | null;
  kyc_documents: Member['kycDocuments'] | null;
  auth_user_id: string | null;
  notes: string | null;
}

export const rowToMember = (row: MemberRow): Member => ({
  id: row.id,
  memberNo: row.member_no,
  name: row.name,
  nameNepali: row.name_nepali || undefined,
  email: row.email,
  phone: row.phone,
  citizenshipNo: row.citizenship_no,
  panNo: row.pan_no || undefined,
  joinedDate: row.joined_date,
  address: row.address,
  status: row.status,
  avatarUrl: row.avatar_url,
  shareCapital: row.share_capital,
  totalSavings: row.total_savings,
  activeLoanBalance: row.active_loan_balance,
  accruedDividend: row.accrued_dividend,
  creditScore: row.credit_score,
  bankDetails: row.bank_details ?? {
    bankName: '',
    accountNo: '',
    branch: '',
    holderName: '',
  },
  kycDocuments: row.kyc_documents ?? {
    citizenshipFront: false,
    citizenshipBack: false,
    photo: false,
    signature: false,
    utilityBill: false,
  },
  authUserId: row.auth_user_id,
  notes: row.notes || undefined,
});


export const memberToRow = (
  m: Omit<Member, 'id'>
): Omit<MemberRow, 'id'> => ({
  member_no: m.memberNo,
  name: m.name,
  name_nepali: m.nameNepali || null,
  email: m.email,
  phone: m.phone,
  citizenship_no: m.citizenshipNo,
  pan_no: m.panNo || null,
  joined_date: m.joinedDate,
  address: m.address,
  status: m.status,
  avatar_url: m.avatarUrl,
  share_capital: m.shareCapital,
  total_savings: m.totalSavings,
  active_loan_balance: m.activeLoanBalance,
  accrued_dividend: m.accruedDividend,
  credit_score: m.creditScore,
  bank_details: m.bankDetails,
  kyc_documents: m.kycDocuments,
  auth_user_id: m.authUserId ?? null,
  notes: m.notes || null,
});

export const memberPatchToRow = (
  u: Partial<Member>
): Record<string, unknown> => {
  const r: Record<string, unknown> = {};
  if (u.memberNo !== undefined) r.member_no = u.memberNo;
  if (u.name !== undefined) r.name = u.name;
  if (u.nameNepali !== undefined) r.name_nepali = u.nameNepali || null;
  if (u.email !== undefined) r.email = u.email;
  if (u.phone !== undefined) r.phone = u.phone;
  if (u.citizenshipNo !== undefined) r.citizenship_no = u.citizenshipNo;
  if (u.panNo !== undefined) r.pan_no = u.panNo || null;
  if (u.joinedDate !== undefined) r.joined_date = u.joinedDate;
  if (u.address !== undefined) r.address = u.address;
  if (u.status !== undefined) r.status = u.status;
  if (u.avatarUrl !== undefined) r.avatar_url = u.avatarUrl;
  if (u.shareCapital !== undefined) r.share_capital = u.shareCapital;
  if (u.totalSavings !== undefined) r.total_savings = u.totalSavings;
  if (u.activeLoanBalance !== undefined)
    r.active_loan_balance = u.activeLoanBalance;
  if (u.accruedDividend !== undefined) r.accrued_dividend = u.accruedDividend;
  if (u.creditScore !== undefined) r.credit_score = u.creditScore;
  if (u.bankDetails !== undefined) r.bank_details = u.bankDetails;
  if (u.kycDocuments !== undefined) r.kyc_documents = u.kycDocuments;
  if (u.authUserId !== undefined) r.auth_user_id = u.authUserId;
  if (u.notes !== undefined) r.notes = u.notes || null;
  return r;
};

export const fetchMembersFromSupabase = async (): Promise<
  ServiceResult<Member[]>
> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('joined_date', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: (data as MemberRow[]).map(rowToMember), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const createMemberInSupabase = async (
  member: Omit<Member, 'id'>
): Promise<ServiceResult<Member>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('members')
      .insert(memberToRow(member))
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToMember(data as MemberRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const updateMemberInSupabase = async (
  memberNo: string,
  updates: Partial<Member>
): Promise<ServiceResult<Member>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('members')
      .update(memberPatchToRow(updates))
      .eq('member_no', memberNo)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToMember(data as MemberRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const deleteMemberInSupabase = async (
  memberNo: string
): Promise<ServiceResult<true>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('member_no', memberNo);
    if (error) return { data: null, error: error.message };
    return { data: true, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};



// ==================== MEMBER AUTH LINKAGE ====================

/**
 * Resolves the members row linked to a Supabase Auth user id.
 * Returns `data: null` (no error) when the auth user has no linked member yet.
 */
export const fetchMemberByAuthUserId = async (
  authUserId: string
): Promise<ServiceResult<Member | null>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data: data ? rowToMember(data as MemberRow) : null, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

/**
 * Staff helper: binds (or un-binds) a Supabase Auth account to a member.
 * Also useful manually: update members set auth_user_id = '<uuid>' ...
 */
export const linkMemberAuthUser = async (
  memberNo: string,
  authUserId: string | null
): Promise<ServiceResult<Member>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('members')
      .update({ auth_user_id: authUserId })
      .eq('member_no', memberNo)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToMember(data as MemberRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

// ==================== SAVINGS ACCOUNTS ====================

export interface SavingsAccountRow {
  id: string;
  account_no: string;
  member_id: string | null;
  account_type: SavingsAccount['accountType'];
  balance: number;
  interest_rate: number;
  opened_date: string;
  maturity_date: string | null;
  status: SavingsAccount['status'];
}

export const rowToSavingsAccount = (row: SavingsAccountRow): SavingsAccount => ({
  id: row.id,
  memberId: row.member_id || undefined,
  accountNo: row.account_no,
  accountType: row.account_type,
  balance: row.balance,
  interestRate: row.interest_rate,
  openedDate: row.opened_date,
  maturityDate: row.maturity_date || undefined,
  status: row.status,
});

export const savingsAccountToRow = (
  a: Omit<SavingsAccount, 'id'>
): Omit<SavingsAccountRow, 'id'> => ({
  account_no: a.accountNo,
  member_id: a.memberId || null,
  account_type: a.accountType,
  balance: a.balance,
  interest_rate: a.interestRate,
  opened_date: a.openedDate,
  maturity_date: a.maturityDate || null,
  status: a.status,
});


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


// ==================== TRANSACTIONS ====================

export interface TransactionRow {
  id: string;
  member_id: string | null;
  date: string;
  type: Transaction['type'];
  description: string;
  amount: number;
  reference_no: string;
  status: Transaction['status'];
}

// ==================== TRANSACTIONS ====================

export const rowToTransaction = (row: any): Transaction => ({
  id: row.id,
  memberId: row.member_id || undefined,
  date: row.date,
  type: row.type,
  description: row.description,
  amount: row.amount,
  referenceNo: row.reference_no,
  status: row.status,
});

export const transactionToRow = (t: Omit<Transaction, 'id'>): any => ({
  member_id: t.memberId || null,
  date: t.date,
  type: t.type,
  description: t.description,
  amount: t.amount,
  reference_no: t.referenceNo,
  status: t.status,
});

export const fetchTransactionsFromSupabase = async (): Promise<ServiceResult<Transaction[]>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: (data as any[]).map(rowToTransaction), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

export const createTransactionInSupabase = async (tx: Omit<Transaction, 'id'>): Promise<ServiceResult<Transaction>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase.from('transactions').insert(transactionToRow(tx)).select().single();
    if (error) return { data: null, error: error.message };
    return { data: rowToTransaction(data as any), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

// ==================== INQUIRIES ====================

export const rowToInquiry = (row: any): Inquiry => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  subject: row.subject,
  message: row.message,
  category: row.category,
  status: row.status,
  date: row.date,
  reply: row.reply || undefined,
});

export const inquiryToRow = (i: Omit<Inquiry, 'id' | 'date' | 'status'>): any => ({
  name: i.name,
  email: i.email,
  phone: i.phone,
  subject: i.subject,
  message: i.message,
  category: i.category,
  reply: i.reply || null,
});


export const fetchInquiriesFromSupabase = async (): Promise<ServiceResult<Inquiry[]>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase.from('inquiries').select('*').order('date', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: (data as any[]).map(rowToInquiry), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};


export const createInquiryInSupabase = async (inq: Omit<Inquiry, 'id' | 'date' | 'status'>): Promise<ServiceResult<Inquiry>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase.from('inquiries').insert({ ...inquiryToRow(inq), status: 'NEW', date: new Date().toISOString().split('T')[0] } as any).select().single();
    if (error) return { data: null, error: error.message };
    return { data: rowToInquiry(data as any), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

export const replyToInquiryInSupabase = async (inquiryId: string, reply: string): Promise<ServiceResult<Inquiry>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase.from('inquiries').update({ reply, status: 'RESOLVED' }).eq('id', inquiryId).select().single();
    if (error) return { data: null, error: error.message };
    return { data: rowToInquiry(data as any), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

// ==================== NOTIFICATIONS ====================

export const rowToNotification = (row: any): Notification => ({
  id: row.id,
  title: row.title,
  message: row.message,
  date: row.date,
  type: row.type,
  isRead: row.is_read,
  actionUrl: row.action_url || undefined,
});

export const notificationToRow = (n: Omit<Notification, 'id'>): any => ({
  title: n.title,
  message: n.message,
  date: n.date,
  type: n.type,
  is_read: n.isRead,
  action_url: n.actionUrl || null,
});


export const fetchNotificationsFromSupabase = async (): Promise<ServiceResult<Notification[]>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase.from('notifications').select('*').order('date', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: (data as any[]).map(rowToNotification), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

export const createNotificationInSupabase = async (n: Omit<Notification, 'id'>): Promise<ServiceResult<Notification>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase.from('notifications').insert(notificationToRow(n)).select().single();
    if (error) return { data: null, error: error.message };
    return { data: rowToNotification(data as any), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

export const markNotificationReadInSupabase = async (id: string): Promise<ServiceResult<Notification>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).select().single();
    if (error) return { data: null, error: error.message };
    return { data: rowToNotification(data as any), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

// ==================== NOTICES ====================

export interface NoticeRow {
  id: string;
  title: string;
  title_nepali: string;
  category: Notice['category'];
  content: string;
  published_date: string;
  is_urgent: boolean;
  is_active: boolean;
}

export const rowToNotice = (row: NoticeRow): Notice => ({
  id: row.id,
  title: row.title,
  titleNepali: row.title_nepali,
  category: row.category,
  content: row.content,
  publishedDate: row.published_date,
  isUrgent: row.is_urgent,
  isActive: row.is_active,
});

export const noticeToRow = (
  n: Omit<Notice, 'id' | 'publishedDate'>
): Omit<NoticeRow, 'id' | 'published_date'> => ({
  title: n.title,
  title_nepali: n.titleNepali,
  category: n.category,
  content: n.content,
  is_urgent: n.isUrgent,
  is_active: n.isActive,
});

export const fetchNoticesFromSupabase = async (): Promise<ServiceResult<Notice[]>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase.from('notices').select('*').order('published_date', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: (data as any[]).map(rowToNotice), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

export const createNoticeInSupabase = async (notice: Omit<Notice, 'id' | 'publishedDate'>): Promise<ServiceResult<Notice>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase.from('notices').insert({ ...noticeToRow(notice), published_date: new Date().toISOString().slice(0, 10) } as any).select().single();
    if (error) return { data: null, error: error.message };
    return { data: rowToNotice(data as any), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

export const updateNoticeInSupabase = async (noticeId: string, updates: Partial<Notice>): Promise<ServiceResult<Notice>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const row: any = {};
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.titleNepali !== undefined) row.title_nepali = updates.titleNepali;
    if (updates.category !== undefined) row.category = updates.category;
    if (updates.content !== undefined) row.content = updates.content;
    if (updates.isUrgent !== undefined) row.is_urgent = updates.isUrgent;
    if (updates.isActive !== undefined) row.is_active = updates.isActive;
    const { data, error } = await supabase.from('notices').update(row).eq('id', noticeId).select().single();
    if (error) return { data: null, error: error.message };
    return { data: rowToNotice(data as any), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

export const deleteNoticeInSupabase = async (noticeId: string): Promise<ServiceResult<true>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { error } = await supabase.from('notices').delete().eq('id', noticeId);
    if (error) return { data: null, error: error.message };
    return { data: true, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};
