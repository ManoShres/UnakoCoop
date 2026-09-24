import { supabase } from '../lib/supabase';
import type { Member } from '../types';
import { CreateMemberSchema, UpdateMemberSchema } from '../schemas/memberSchema';
import type { ServiceResult } from './serviceResult';
export type { ServiceResult };

const NOT_CONFIGURED =
  'Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).';

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

  // Validate member schema at service boundary before writing to PostgreSQL
  const validation = CreateMemberSchema.safeParse(member);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      data: null,
      error: `Validation error: ${firstIssue?.path.join('.') ?? 'field'} - ${firstIssue?.message ?? 'invalid input'}`,
    };
  }

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

  // Validate partial update at service boundary
  const validation = UpdateMemberSchema.safeParse(updates);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      data: null,
      error: `Validation error: ${firstIssue?.path.join('.') ?? 'field'} - ${firstIssue?.message ?? 'invalid input'}`,
    };
  }

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
