// ---------------------------------------------------------------------------
// Bank Statements mock data
// ---------------------------------------------------------------------------

import { BankStatementEntry } from '../types';

export const INITIAL_BANK_STATEMENTS: BankStatementEntry[] = [
  {
    id: 'bs-001',
    statementDate: '2026-09-15',
    description: 'Monthly statement extract from Nabil Bank - Savings Account',
    amount: 250000,
    referenceNo: 'NABIL-SEPT-2026',
    debitOrCredit: 'CREDIT',
    uploadedBy: 'EMP-2080-0038',
    uploadedByName: 'Dipak Bahadur Thapa',
    filePath: '/uploads/statements/nabil-sept-2026.csv',
    uploadedAt: '2026-09-16T10:30:00Z',
  },
  {
    id: 'bs-002',
    statementDate: '2026-08-31',
    description: 'Monthly statement extract from Global IME Bank - Current Account',
    amount: 175000,
    referenceNo: 'GIME-AUG-2026',
    debitOrCredit: 'CREDIT',
    uploadedBy: 'EMP-2080-0038',
    uploadedByName: 'Dipak Bahadur Thapa',
    filePath: '/uploads/statements/gime-aug-2026.csv',
    uploadedAt: '2026-09-01T14:15:00Z',
  },
];