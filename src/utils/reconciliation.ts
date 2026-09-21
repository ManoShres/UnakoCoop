/**
 * Bank reconciliation engine: matches teller-entered counter transactions
 * against uploaded bank statement lines, and flags:
 *   - AMOUNT_MISMATCH  : same reference but different amount
 *   - MISSING_ENTRY    : present in the ledger but absent from the statement
 *                        (or vice versa)
 *   - DUPLICATE_ENTRY  : same amount + date + reference posted more than once
 *   - WRONG_DATE       : amount + reference agree but the dates differ
 *   - WRONG_REFERENCE  : amount + date agree but the references differ
 */

import type {
  BankStatementEntry,
  ReconciliationEntry,
  ReconciliationStatus,
  Transaction,
} from '../types';

/** Tolerance (NPR) under which two amounts are considered equal. */
export const AMOUNT_TOLERANCE = 1;

/** Maximum day gap allowed when matching same-day / next working-day postings. */
export const DATE_WINDOW_DAYS = 3;

const dayDiff = (a: string, b: string): number => {
  const first = new Date(a).getTime();
  const second = new Date(b).getTime();
  if (Number.isNaN(first) || Number.isNaN(second)) return Number.POSITIVE_INFINITY;
  return Math.abs(first - second) / 86_400_000;
};

const amountsMatch = (a: number, b: number): boolean =>
  Math.abs(a - b) <= AMOUNT_TOLERANCE;

export const normaliseRef = (value?: string): string =>
  (value ?? '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

/**
 * Detects ledger transactions that appear to have been posted more than once
 * (same amount, same counter date, same reference number and type).
 */
export function detectDuplicateTransactions(transactions: Transaction[]): string[][] {
  const groups = new Map<string, Transaction[]>();

  transactions.forEach((tx) => {
    const key = `${tx.date}|${tx.amount}|${normaliseRef(tx.referenceNo)}|${tx.type}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(tx);
    groups.set(key, bucket);
  });

  return Array.from(groups.values())
    .filter((bucket) => bucket.length > 1)
    .map((bucket) => bucket.map((tx) => tx.id));
}

/**
 * Runs the automatic reconciliation for a single statement entry against the
 * teller ledger, returning a reconciliation row describing the outcome.
 */
export function reconcileStatementEntry(
  statement: BankStatementEntry,
  ledger: Transaction[],
  alreadyMatchedIds: string[] = []
): Omit<ReconciliationEntry, 'id' | 'flaggedAt' | 'createdAt'> {
  const candidates = ledger.filter((tx) => !alreadyMatchedIds.includes(tx.id));
  const sameAmount = candidates.filter((tx) => amountsMatch(tx.amount, statement.amount));

  // 1. Amount + reference + date all agree -> clean match.
  const exact = sameAmount.find(
    (tx) =>
      dayDiff(tx.date, statement.statementDate) <= DATE_WINDOW_DAYS &&
      normaliseRef(tx.referenceNo) === normaliseRef(statement.referenceNo)
  );

  if (exact) {
    return {
      transactionId: exact.id,
      transactionAmount: exact.amount,
      transactionDate: exact.date,
      transactionRef: exact.referenceNo,
      statementEntryId: statement.id,
      statementAmount: statement.amount,
      statementDate: statement.statementDate,
      statementRef: statement.referenceNo,
      amount: statement.amount,
      date: statement.statementDate,
      description: statement.description,
      referenceNo: statement.referenceNo,
      status: 'MATCHED',
    };
  }

  // 2. Same reference number but a different amount -> amount mismatch.
  const sameReference = candidates.find(
    (tx) =>
      Boolean(statement.referenceNo) &&
      normaliseRef(tx.referenceNo) === normaliseRef(statement.referenceNo)
  );

  if (sameReference) {
    return {
      transactionId: sameReference.id,
      transactionAmount: sameReference.amount,
      transactionDate: sameReference.date,
      transactionRef: sameReference.referenceNo,
      statementEntryId: statement.id,
      statementAmount: statement.amount,
      statementDate: statement.statementDate,
      statementRef: statement.referenceNo,
      amount: statement.amount,
      date: statement.statementDate,
      description: statement.description,
      referenceNo: statement.referenceNo,
      status: 'MISMATCH',
      mismatchType: 'AMOUNT_MISMATCH',
      mismatchDetails: `Ledger posted NPR ${sameReference.amount.toFixed(
        2
      )} against bank NPR ${statement.amount.toFixed(2)} (difference NPR ${(
        statement.amount - sameReference.amount
      ).toFixed(2)}).`,
    };
  }



  // 3. Same amount within the window but different reference -> reference mismatch.
  const sameAmountDifferentRef = sameAmount.find(
    (tx) => dayDiff(tx.date, statement.statementDate) <= DATE_WINDOW_DAYS
  );

  if (sameAmountDifferentRef) {
    return {
      transactionId: sameAmountDifferentRef.id,
      transactionAmount: sameAmountDifferentRef.amount,
      transactionDate: sameAmountDifferentRef.date,
      transactionRef: sameAmountDifferentRef.referenceNo,
      statementEntryId: statement.id,
      statementAmount: statement.amount,
      statementDate: statement.statementDate,
      statementRef: statement.referenceNo,
      amount: statement.amount,
      date: statement.statementDate,
      description: statement.description,
      referenceNo: statement.referenceNo,
      status: 'MISMATCH',
      mismatchType: 'WRONG_REFERENCE',
      mismatchDetails: `Amount matches but reference differs (ledger ${
        sameAmountDifferentRef.referenceNo
      } vs bank ${statement.referenceNo ?? 'blank'}).`,
    };
  }

  // 4. Amount + reference agree but the dates fall outside the window.
  const outOfWindow = candidates.find(
    (tx) =>
      amountsMatch(tx.amount, statement.amount) &&
      Boolean(statement.referenceNo) &&
      normaliseRef(tx.referenceNo) === normaliseRef(statement.referenceNo)
  );

  if (outOfWindow) {
    return {
      transactionId: outOfWindow.id,
      transactionAmount: outOfWindow.amount,
      transactionDate: outOfWindow.date,
      transactionRef: outOfWindow.referenceNo,
      statementEntryId: statement.id,
      statementAmount: statement.amount,
      statementDate: statement.statementDate,
      statementRef: statement.referenceNo,
      amount: statement.amount,
      date: statement.statementDate,
      description: statement.description,
      referenceNo: statement.referenceNo,
      status: 'MISMATCH',
      mismatchType: 'WRONG_DATE',
      mismatchDetails: `Ledger date ${outOfWindow.date} is outside the ${DATE_WINDOW_DAYS}-day posting window of bank date ${statement.statementDate}.`,
    };
  }

  // 5. Nothing found -> the bank line has no teller counterpart.
  return {
    statementEntryId: statement.id,
    statementAmount: statement.amount,
    statementDate: statement.statementDate,
    statementRef: statement.referenceNo,
    amount: statement.amount,
    date: statement.statementDate,
    description: statement.description,
    referenceNo: statement.referenceNo,
    status: 'MISMATCH',
    mismatchType: 'MISSING_ENTRY',
    mismatchDetails: 'No matching teller ledger entry found for this bank statement line.',
  };
}


/**
 * Finds ledger transactions that never appeared on the uploaded bank statement.
 */
export function findUnmatchedLedgerEntries(
  ledger: Transaction[],
  statements: BankStatementEntry[],
  matchedLedgerIds: string[]
): Omit<ReconciliationEntry, 'id' | 'flaggedAt' | 'createdAt'>[] {
  return ledger
    .filter((tx) => !matchedLedgerIds.includes(tx.id))
    .filter(
      (tx) =>
        !statements.some(
          (statement) =>
            amountsMatch(statement.amount, tx.amount) &&
            dayDiff(statement.statementDate, tx.date) <= DATE_WINDOW_DAYS
        )
    )
    .map((tx) => ({
      transactionId: tx.id,
      transactionAmount: tx.amount,
      transactionDate: tx.date,
      transactionRef: tx.referenceNo,
      amount: tx.amount,
      date: tx.date,
      description: tx.description,
      referenceNo: tx.referenceNo,
      status: 'MISMATCH' as ReconciliationStatus,
      mismatchType: 'MISSING_ENTRY' as const,
      mismatchDetails: 'Teller entry has no counterpart on the uploaded bank statement.',
    }));
}

/** Counts open (unresolved) mismatches for dashboard badges. */
export function countOpenMismatches(entries: ReconciliationEntry[]): number {
  return entries.filter((entry) => entry.status === 'MISMATCH' || entry.status === 'PENDING').length;
}
