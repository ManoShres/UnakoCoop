import { describe, it, expect } from 'vitest';
import {
  normaliseRef,
  detectDuplicateTransactions,
  reconcileStatementEntry,
  findUnmatchedLedgerEntries,
  countOpenMismatches,
} from '../reconciliation';
import type { BankStatementEntry, Transaction, ReconciliationEntry } from '../../types';

describe('Bank Reconciliation Utility', () => {
  it('normalises references by removing non-alphanumeric characters and uppercasing', () => {
    expect(normaliseRef('nchl-tx-1234')).toBe('NCHLTX1234');
    expect(normaliseRef('  UK / 88219 #01 ')).toBe('UK8821901');
    expect(normaliseRef(undefined)).toBe('');
  });

  it('detects duplicate transactions with same amount, date, reference, and type', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        date: '2024-03-01',
        amount: 5000,
        referenceNo: 'DEP-001',
        type: 'DEPOSIT',
        description: 'First',
        status: 'COMPLETED',
      },
      {
        id: 'tx-2',
        date: '2024-03-01',
        amount: 5000,
        referenceNo: 'dep-001',
        type: 'DEPOSIT',
        description: 'Second (duplicate)',
        status: 'COMPLETED',
      },
      {
        id: 'tx-3',
        date: '2024-03-02',
        amount: 5000,
        referenceNo: 'DEP-002',
        type: 'DEPOSIT',
        description: 'Unique',
        status: 'COMPLETED',
      },
    ];

    const dupes = detectDuplicateTransactions(transactions);
    expect(dupes).toHaveLength(1);
    expect(dupes[0]).toEqual(['tx-1', 'tx-2']);
  });

  it('matches exact statement entry with transaction in ledger', () => {
    const statement: BankStatementEntry = {
      id: 'stmt-1',
      statementDate: '2024-03-01',
      amount: 15000,
      referenceNo: 'TXN-9988',
      description: 'Bank Deposit',
      debitOrCredit: 'CREDIT',
      uploadedBy: 'accountant',
      uploadedAt: '2024-03-01',
    };

    const ledger: Transaction[] = [
      {
        id: 'tx-1',
        date: '2024-03-01',
        amount: 15000,
        referenceNo: 'txn-9988',
        type: 'DEPOSIT',
        description: 'Cash Deposit',
        status: 'COMPLETED',
      },
    ];

    const result = reconcileStatementEntry(statement, ledger);
    expect(result.status).toBe('MATCHED');
    expect(result.transactionId).toBe('tx-1');
    expect(result.mismatchType).toBeUndefined();
  });

  it('identifies AMOUNT_MISMATCH when reference matches but amount differs', () => {
    const statement: BankStatementEntry = {
      id: 'stmt-1',
      statementDate: '2024-03-01',
      amount: 25000,
      referenceNo: 'TXN-REF-100',
      description: 'Transfer',
      debitOrCredit: 'CREDIT',
      uploadedBy: 'acc',
      uploadedAt: '2024-03-01',
    };

    const ledger: Transaction[] = [
      {
        id: 'tx-1',
        date: '2024-03-01',
        amount: 20000,
        referenceNo: 'TXN-REF-100',
        type: 'DEPOSIT',
        description: 'Transfer in',
        status: 'COMPLETED',
      },
    ];

    const result = reconcileStatementEntry(statement, ledger);
    expect(result.status).toBe('MISMATCH');
    expect(result.mismatchType).toBe('AMOUNT_MISMATCH');
  });

  it('identifies WRONG_REFERENCE when amount matches within date window', () => {
    const statement: BankStatementEntry = {
      id: 'stmt-1',
      statementDate: '2024-03-01',
      amount: 10000,
      referenceNo: 'BANK-REF-999',
      description: 'Deposit',
      debitOrCredit: 'CREDIT',
      uploadedBy: 'acc',
      uploadedAt: '2024-03-01',
    };

    const ledger: Transaction[] = [
      {
        id: 'tx-1',
        date: '2024-03-02',
        amount: 10000,
        referenceNo: 'TELLER-REF-111',
        type: 'DEPOSIT',
        description: 'Counter Deposit',
        status: 'COMPLETED',
      },
    ];

    const result = reconcileStatementEntry(statement, ledger);
    expect(result.status).toBe('MISMATCH');
    expect(result.mismatchType).toBe('WRONG_REFERENCE');
  });

  it('identifies MISSING_ENTRY when statement entry has no matching ledger transaction', () => {
    const statement: BankStatementEntry = {
      id: 'stmt-1',
      statementDate: '2024-03-01',
      amount: 999999,
      referenceNo: 'UNKNOWN',
      description: 'Mysterious credit',
      debitOrCredit: 'CREDIT',
      uploadedBy: 'acc',
      uploadedAt: '2024-03-01',
    };

    const ledger: Transaction[] = [];

    const result = reconcileStatementEntry(statement, ledger);
    expect(result.status).toBe('MISMATCH');
    expect(result.mismatchType).toBe('MISSING_ENTRY');
  });

  it('finds unmatched ledger entries', () => {
    const ledger: Transaction[] = [
      {
        id: 'tx-matched',
        date: '2024-03-01',
        amount: 1000,
        referenceNo: 'REF-1',
        type: 'DEPOSIT',
        description: 'Matched',
        status: 'COMPLETED',
      },
      {
        id: 'tx-unmatched',
        date: '2024-03-05',
        amount: 8888,
        referenceNo: 'REF-2',
        type: 'DEPOSIT',
        description: 'Unmatched',
        status: 'COMPLETED',
      },
    ];

    const statements: BankStatementEntry[] = [
      {
        id: 'stmt-1',
        statementDate: '2024-03-01',
        amount: 1000,
        referenceNo: 'REF-1',
        description: 'Statement row',
        debitOrCredit: 'CREDIT',
        uploadedBy: 'acc',
        uploadedAt: '2024-03-01',
      },
    ];

    const unmatched = findUnmatchedLedgerEntries(ledger, statements, ['tx-matched']);
    expect(unmatched).toHaveLength(1);
    expect(unmatched[0].transactionId).toBe('tx-unmatched');
  });

  it('correctly counts open mismatches', () => {
    const entries: ReconciliationEntry[] = [
      {
        id: 'rec-1',
        amount: 1000,
        date: '2024-03-01',
        description: 'Test',
        status: 'MISMATCH',
        flaggedAt: '2024-03-01',
        createdAt: '2024-03-01',
      },
      {
        id: 'rec-2',
        amount: 2000,
        date: '2024-03-01',
        description: 'Test',
        status: 'MATCHED',
        flaggedAt: '2024-03-01',
        createdAt: '2024-03-01',
      },
      {
        id: 'rec-3',
        amount: 3000,
        date: '2024-03-01',
        description: 'Test',
        status: 'PENDING',
        flaggedAt: '2024-03-01',
        createdAt: '2024-03-01',
      },
    ];

    expect(countOpenMismatches(entries)).toBe(2);
  });
});
