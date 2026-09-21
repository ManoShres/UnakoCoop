// ---------------------------------------------------------------------------
// Reconciliation Entries mock data
// ---------------------------------------------------------------------------

import { ReconciliationEntry } from '../types';

export const INITIAL_RECONCILIATION_ENTRIES: ReconciliationEntry[] = [
  // Matched entries
  {
    id: 'recon-001',
    transactionId: 't1',
    transactionAmount: 15000,
    transactionDate: '2026-09-05',
    transactionRef: 'TXN-994821',
    statementEntryId: 'bs-001',
    statementAmount: 15000,
    statementDate: '2026-09-05',
    statementRef: 'BNK-DEP-0915-001',
    amount: 15000,
    date: '2026-09-05',
    description: 'Monthly Recurring Savings Deposit',
    referenceNo: 'TXN-994821',
    status: 'MATCHED',
    flaggedAt: '2026-09-16T10:35:00Z',
    createdAt: '2026-09-16T10:30:00Z',
  },
  // Mismatch - amount different
  {
    id: 'recon-002',
    transactionId: 't2',
    transactionAmount: 23650,
    transactionDate: '2026-09-02',
    transactionRef: 'TXN-991204',
    statementEntryId: 'bs-001',
    statementAmount: 23650,
    statementDate: '2026-09-02',
    statementRef: 'BNK-EMI-0902-001',
    amount: 23650,
    date: '2026-09-02',
    description: 'EMI Payment: LN-2025-0429',
    referenceNo: 'TXN-991204',
    status: 'MISMATCH',
    mismatchType: 'AMOUNT_MISMATCH',
    mismatchDetails: 'System shows NPR 23,650 but bank statement shows NPR 23,500. Difference: NPR 150',
    flaggedAt: '2026-09-16T10:40:00Z',
    createdAt: '2026-09-16T10:30:00Z',
  },
  // Missing entry - in system but not in bank statement
  {
    id: 'recon-003',
    transactionId: 't4',
    transactionAmount: 21750,
    transactionDate: '2026-07-28',
    transactionRef: 'TXN-973309',
    amount: 21750,
    date: '2026-07-28',
    description: 'Annual General Meeting Share Dividend Distribution',
    referenceNo: 'TXN-973309',
    status: 'MISMATCH',
    mismatchType: 'MISSING_ENTRY',
    mismatchDetails: 'Transaction exists in system but not found in uploaded bank statement for July 2026',
    flaggedAt: '2026-09-16T10:45:00Z',
    createdAt: '2026-09-16T10:30:00Z',
  },
  // Duplicate detection
  {
    id: 'recon-004',
    amount: 15000,
    date: '2026-09-05',
    description: 'Monthly Recurring Savings Deposit',
    status: 'MISMATCH',
    mismatchType: 'DUPLICATE_ENTRY',
    mismatchDetails: 'Same amount NPR 15,000 on same date found twice in system. IDs: t1, t1-dup',
    flaggedAt: '2026-09-16T10:50:00Z',
    createdAt: '2026-09-16T10:30:00Z',
  },
  // Pending - needs review
  {
    id: 'recon-005',
    amount: 30000,
    date: '2026-07-10',
    description: 'Counter Cash Withdrawal for Emergency Agrochemical Purchase',
    referenceNo: 'TXN-968910',
    status: 'PENDING',
    flaggedAt: '2026-09-16T10:30:00Z',
    createdAt: '2026-09-16T10:30:00Z',
  },
];