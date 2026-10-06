/**
 * Regression tests for task-7 group D (service-layer validation).
 *
 * These run with Supabase unconfigured on purpose: validation now happens BEFORE the
 * configuration check, so invalid payloads must be rejected deterministically rather
 * than being masked by "Supabase is not configured".
 */
import { describe, it, expect, vi } from 'vitest';

// Force the "Supabase unconfigured" path so validation (which now runs BEFORE the
// configuration check) is exercised deterministically without any network access.
vi.mock('../../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
  supabaseProjectRef: () => '',
}));

import { createTransactionInSupabase } from '../transactionService';
import {
  createLoanInSupabase,
  updateLoanInSupabase,
  computeRepaymentBalance,
} from '../loanService';
import { createSavingsAccountInSupabase } from '../savingsService';
import {
  CreateSavingsAccountSchema,
  CreateTransactionSchema,
  TRANSACTION_TYPE,
  LEGACY_TRANSACTION_TYPE_TO_CANONICAL,
  normalizeTransactionType,
  MAX_FINANCIAL_AMOUNT,
} from '../../schemas/financialSchema';
import type { Transaction, Loan, SavingsAccount } from '../../types';

const NOT_CONFIGURED_FRAGMENT = 'Supabase is not configured';

const baseTransaction: Omit<Transaction, 'id'> = {
  date: '2026-01-01',
  type: 'DEPOSIT',
  description: 'Counter deposit',
  amount: 1000,
  referenceNo: 'ACC-1',
  status: 'COMPLETED',
};

const baseLoan: Omit<Loan, 'id'> = {
  memberId: 'mem-1',
  loanNo: 'LN-2081-001',
  loanType: 'Agricultural & Livestock',
  principalAmount: 100000,
  remainingBalance: 100000,
  interestRate: 12,
  tenureMonths: 24,
  monthlyEmi: 5000,
  disbursedDate: '2081-01-01',
  nextDueDate: '2081-02-01',
  status: 'ACTIVE',
  collateralDescription: 'Land plot',
};

const baseSavings: Omit<SavingsAccount, 'id'> = {
  memberId: 'mem-1',
  accountNo: 'SAV-001',
  accountType: 'Regular Savings',
  balance: 0,
  interestRate: 8,
  openedDate: '2081-01-01',
  status: 'ACTIVE',
};

describe('D20 transactionService always validates', () => {
  it('rejects a transaction with NO memberId when the amount is invalid', async () => {
    // Regression: validation was wrapped in `if (tx.memberId)`, so member-less rows
    // bypassed CreateTransactionSchema completely.
    const result = await createTransactionInSupabase({ ...baseTransaction, amount: 0 });

    expect(result.data).toBeNull();
    expect(result.error).toContain('Validation error');
    expect(result.error).not.toContain(NOT_CONFIGURED_FRAGMENT);
  });

  it('rejects a member-less transaction with an invalid description', async () => {
    const result = await createTransactionInSupabase({
      ...baseTransaction,
      description: '',
    });

    expect(result.data).toBeNull();
    expect(result.error).toContain('Validation error');
    expect(result.error).not.toContain(NOT_CONFIGURED_FRAGMENT);
  });

  it('rejects an unknown transaction type', async () => {
    const result = await createTransactionInSupabase({
      ...baseTransaction,
      type: 'NOT_A_TYPE' as Transaction['type'],
    });

    expect(result.data).toBeNull();
    expect(result.error).toContain('Validation error');
  });

  it('passes validation for a valid member-less transaction (then reports the ledger is unavailable)', async () => {
    const result = await createTransactionInSupabase({ ...baseTransaction, memberId: undefined });

    expect(result.data).toBeNull();
    expect(result.error).toContain(NOT_CONFIGURED_FRAGMENT);
  });

  it('accepts an optional memberId inside the schema', () => {
    const result = CreateTransactionSchema.safeParse({
      accountId: 'GENERAL',
      type: 'FEE',
      amount: 50,
      description: 'Statement fee',
    });
    expect(result.success).toBe(true);
  });
});

describe('D21 loanService validation and repayment-only balances', () => {
  it('rejects loan creation with an invalid payload', async () => {
    const negativePrincipal = await createLoanInSupabase({
      ...baseLoan,
      principalAmount: -100,
      remainingBalance: 0,
    });
    expect(negativePrincipal.data).toBeNull();
    expect(negativePrincipal.error).toContain('Validation error');

    const balanceAbovePrincipal = await createLoanInSupabase({
      ...baseLoan,
      principalAmount: 1000,
      remainingBalance: 2000,
    });
    expect(balanceAbovePrincipal.data).toBeNull();
    expect(balanceAbovePrincipal.error).toContain('remainingBalance');
  });

  it('passes creation validation for a sane loan (then reports the ledger is unavailable)', async () => {
    const result = await createLoanInSupabase(baseLoan);
    expect(result.data).toBeNull();
    expect(result.error).toContain(NOT_CONFIGURED_FRAGMENT);
  });

  it('rejects any remaining_balance write through the generic update path', async () => {
    const negative = await updateLoanInSupabase('LN-2081-001', { remainingBalance: -5 });
    expect(negative.data).toBeNull();
    expect(negative.error).toContain('remainingBalance');

    const twoBillion = await updateLoanInSupabase('LN-2081-001', { remainingBalance: 2_000_000_000 });
    expect(twoBillion.data).toBeNull();
    expect(twoBillion.error).toContain('remainingBalance');
  });

  it('rejects non-writable fields on the generic update path', async () => {
    const result = await updateLoanInSupabase('LN-2081-001', {
      principalAmount: 5,
    } as Partial<Loan>);
    expect(result.data).toBeNull();
    expect(result.error).toContain('principalAmount');
  });

  it('allows a metadata-only update (then reports the ledger is unavailable)', async () => {
    const result = await updateLoanInSupabase('LN-2081-001', { status: 'OVERDUE' });
    expect(result.data).toBeNull();
    expect(result.error).toContain(NOT_CONFIGURED_FRAGMENT);
  });

  it('repayment arithmetic never increases the balance', () => {
    expect(computeRepaymentBalance(1000, 250)).toEqual({ ok: true, newBalance: 750 });
    expect(computeRepaymentBalance(1000, 1000).newBalance).toBe(0);

    const overpay = computeRepaymentBalance(1000, 1001);
    expect(overpay.ok).toBe(false);
    expect(overpay.newBalance).toBe(1000);

    expect(computeRepaymentBalance(1000, -1).ok).toBe(false);
    expect(computeRepaymentBalance(1000, 0).ok).toBe(false);
    expect(computeRepaymentBalance(-1, 10).ok).toBe(false);
    expect(computeRepaymentBalance(1000, MAX_FINANCIAL_AMOUNT + 1).ok).toBe(false);
  });
});

describe('D22 savings accounts open empty', () => {
  it('rejects a caller-supplied opening balance', async () => {
    const result = await createSavingsAccountInSupabase({ ...baseSavings, balance: 500 });

    expect(result.data).toBeNull();
    expect(result.error).toContain('zero balance');
    expect(result.error).not.toContain(NOT_CONFIGURED_FRAGMENT);
  });

  it('rejects a balance above the shared amount cap', () => {
    const result = CreateSavingsAccountSchema.safeParse({
      ...baseSavings,
      balance: 2_000_000_000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.') === 'balance')).toBe(true);
    }
  });

  it('accepts a zero-balance account then reports the ledger is unavailable', async () => {
    const result = await createSavingsAccountInSupabase(baseSavings);
    expect(result.data).toBeNull();
    expect(result.error).toContain(NOT_CONFIGURED_FRAGMENT);
  });
});

describe('D23 transaction vocabulary is shared and consistent', () => {
  it('normalises the legacy LOAN_EMI alias to LOAN_REPAYMENT', () => {
    expect(normalizeTransactionType('LOAN_EMI')).toBe('LOAN_REPAYMENT');
    expect(normalizeTransactionType('DEPOSIT')).toBe('DEPOSIT');
  });

  it('maps every domain transaction type into the schema vocabulary', () => {
    const domainTypes: Transaction['type'][] = [
      'DEPOSIT',
      'WITHDRAWAL',
      'TRANSFER',
      'LOAN_DISBURSEMENT',
      'LOAN_REPAYMENT',
      'INTEREST_CREDIT',
      'FEE',
      'DIVIDEND',
      'SHARE_PURCHASE',
      'SHARE_REFUND',
      'LOAN_EMI',
    ];

    domainTypes.forEach((type) => {
      const canonical = LEGACY_TRANSACTION_TYPE_TO_CANONICAL[type];
      expect(canonical).toBeDefined();
      expect(TRANSACTION_TYPE).toContain(canonical);
      expect(CreateTransactionSchema.safeParse({
        accountId: 'GENERAL',
        type,
        amount: 10,
        description: 'test',
      }).success).toBe(true);
    });

    // The mapping must be exhaustive for the domain union (no silent gaps).
    expect(Object.keys(LEGACY_TRANSACTION_TYPE_TO_CANONICAL).sort()).toEqual(
      [...domainTypes].sort()
    );
  });

  it('keeps TRANSACTION_TYPE and the domain union in lock-step', () => {
    const canonicalSchemaTypes = TRANSACTION_TYPE.filter((t) => t !== 'LOAN_EMI');
    expect(canonicalSchemaTypes).toEqual([
      'DEPOSIT',
      'WITHDRAWAL',
      'TRANSFER',
      'LOAN_DISBURSEMENT',
      'LOAN_REPAYMENT',
      'INTEREST_CREDIT',
      'FEE',
      'DIVIDEND',
      'SHARE_PURCHASE',
      'SHARE_REFUND',
    ]);
  });
});
