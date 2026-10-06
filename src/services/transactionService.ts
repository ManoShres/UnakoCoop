import { supabase } from '../lib/supabase';
import type { Transaction } from '../types';
import { CreateTransactionSchema, normalizeTransactionType } from '../schemas/financialSchema';
import type { ServiceResult } from './serviceResult';

const NOT_CONFIGURED =
  'Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).';

/**
 * @deprecated WRITE PATH — the database now revokes direct INSERT/UPDATE on
 * `public.transactions` from `authenticated` (see supabase/migrations). A direct insert
 * from this client will therefore fail with "permission denied" against a real database.
 * Money movement must go through `src/services/ledgerService.ts`
 * (`postDeposit` / `postWithdrawal` / `postDividendPayout` / `postLoanDisbursement`),
 * which calls the row-locked SECURITY DEFINER RPCs. The read helpers and the row mappers
 * in this module remain valid.
 */
export const TRANSACTION_WRITE_PATH_DEPRECATED =
  'Direct transaction writes are deprecated in favour of ledgerService (server-side RPCs).';

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

/**
 * Validates and inserts a transaction row.
 *
 * @deprecated The direct INSERT is blocked by RLS for `authenticated`. Use
 * `ledgerService.postDeposit` / `postWithdrawal` / `postDividendPayout` /
 * `postLoanDisbursement` for any money movement. The validation below is retained so this
 * path fails loudly (validation error or permission denied) rather than writing bad data.
 */
export const createTransactionInSupabase = async (
  tx: Omit<Transaction, 'id'>
): Promise<ServiceResult<Transaction>> => {
  // Validate at the service boundary ALWAYS — the old `if (tx.memberId)` wrapper let any
  // member-less transaction bypass CreateTransactionSchema entirely.
  const validation = CreateTransactionSchema.safeParse({
    memberId: tx.memberId,
    accountId: tx.referenceNo || 'GENERAL',
    type: tx.type,
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

  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  // Persist the CANONICAL type using the single shared mapping (legacy LOAN_EMI →
  // LOAN_REPAYMENT), instead of validating a rewritten value but storing the legacy one.
  const canonicalType = normalizeTransactionType(tx.type);
  const rowInput: Omit<Transaction, 'id'> = { ...tx, type: canonicalType };

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionToRow(rowInput))
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
