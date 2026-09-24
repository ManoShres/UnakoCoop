import { supabase } from '../lib/supabase';
import type { Transaction } from '../types';
import { CreateTransactionSchema } from '../schemas/financialSchema';
import type { ServiceResult } from './serviceResult';

const NOT_CONFIGURED =
  'Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).';

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

export const rowToTransaction = (row: TransactionRow): Transaction => ({
  id: row.id,
  memberId: row.member_id || undefined,
  date: row.date,
  type: row.type,
  description: row.description,
  amount: row.amount,
  referenceNo: row.reference_no,
  status: row.status,
});

export const transactionToRow = (
  t: Omit<Transaction, 'id'>
): Omit<TransactionRow, 'id'> => ({
  member_id: t.memberId || null,
  date: t.date,
  type: t.type,
  description: t.description,
  amount: t.amount,
  reference_no: t.referenceNo,
  status: t.status,
});

export const fetchTransactionsFromSupabase = async (): Promise<
  ServiceResult<Transaction[]>
> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: (data as TransactionRow[]).map(rowToTransaction), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const createTransactionInSupabase = async (
  tx: Omit<Transaction, 'id'>
): Promise<ServiceResult<Transaction>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  // Validate at service boundary
  if (tx.memberId) {
    const validation = CreateTransactionSchema.safeParse({
      memberId: tx.memberId,
      accountId: tx.referenceNo || 'GENERAL',
      type: tx.type === 'LOAN_EMI' ? 'LOAN_REPAYMENT' : tx.type,
      amount: tx.amount,
      description: tx.description,
      reference: tx.referenceNo,
    });
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      return {
        data: null,
        error: `Validation error: ${firstIssue?.path.join('.') ?? 'field'} - ${firstIssue?.message ?? 'invalid input'}`,
      };
    }
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionToRow(tx))
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToTransaction(data as TransactionRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};
