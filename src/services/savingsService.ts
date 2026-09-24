import { supabase } from '../lib/supabase';
import type { SavingsAccount } from '../types';
import { CreateSavingsAccountSchema } from '../schemas/financialSchema';
import type { ServiceResult } from './serviceResult';

const NOT_CONFIGURED =
  'Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).';

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

export const fetchSavingsAccountsFromSupabase = async (): Promise<
  ServiceResult<SavingsAccount[]>
> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('savings_accounts')
      .select('*')
      .order('opened_date', { ascending: false });
    if (error) return { data: null, error: error.message };
    return {
      data: (data as SavingsAccountRow[]).map(rowToSavingsAccount),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const createSavingsAccountInSupabase = async (
  account: Omit<SavingsAccount, 'id'>
): Promise<ServiceResult<SavingsAccount>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  // Validate at service boundary
  const validation = CreateSavingsAccountSchema.safeParse(account);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      data: null,
      error: `Validation error: ${firstIssue?.path.join('.') ?? 'field'} - ${firstIssue?.message ?? 'invalid input'}`,
    };
  }

  try {
    const { data, error } = await supabase
      .from('savings_accounts')
      .insert(savingsAccountToRow(account))
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToSavingsAccount(data as SavingsAccountRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};
