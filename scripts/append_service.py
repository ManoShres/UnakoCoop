import os
path = 'src/services/operationalService.ts'
content = '''
// ==================== TRANSACTIONS ====================

export const rowToTransaction = (row: any): Transaction => ({
  id: row.id,
  date: row.date,
  type: row.type,
  description: row.description,
  amount: row.amount,
  referenceNo: row.reference_no,
  status: row.status,
});

export const transactionToRow = (t: Omit<Transaction, 'id'>): any => ({
  member_id: t.memberId,
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
'''
with open(path, 'a') as f:
    f.write(content)
print('OK:', os.path.getsize(path))
