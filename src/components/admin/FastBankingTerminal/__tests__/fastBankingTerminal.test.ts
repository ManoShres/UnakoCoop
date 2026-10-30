import { describe, it, expect } from 'vitest';
import { FastTransactionSchema, FastTransactionReceipt } from '../terminalTypes';
import { CBS_TERMINAL_TREE } from '../terminalData';
import { resolveShortcutAction } from '../../../../hooks/useKeyboardShortcuts';
import { numberToWordsNepali } from '../../../../utils/nepaliNumberToWords';
import { getPrintableDenominations } from '../../../../utils/cashDenominationEngine';

describe('FastBankingTerminal - Schema & Security Verification', () => {
  it('validates correct deposit transaction input', () => {
    const input = {
      operation: 'SAVINGS_DEPOSIT',
      accountNo: 'SAV-001',
      amount: 5000,
      remarks: 'Counter Cash Deposit',
    };
    const result = FastTransactionSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(5000);
      expect(result.data.accountNo).toBe('SAV-001');
      expect(result.data.remarks).toBe('Counter Cash Deposit');
    }
  });

  it('rejects zero or negative amounts', () => {
    const zeroResult = FastTransactionSchema.safeParse({
      operation: 'SAVINGS_DEPOSIT',
      accountNo: 'SAV-001',
      amount: 0,
    });
    expect(zeroResult.success).toBe(false);

    const negResult = FastTransactionSchema.safeParse({
      operation: 'SAVINGS_DEPOSIT',
      accountNo: 'SAV-001',
      amount: -100,
    });
    expect(negResult.success).toBe(false);
  });

  it('rejects amounts exceeding single teller authorization limit', () => {
    const exceedResult = FastTransactionSchema.safeParse({
      operation: 'SAVINGS_DEPOSIT',
      accountNo: 'SAV-001',
      amount: 6000000, // 60 Lakhs > 50 Lakhs limit
    });
    expect(exceedResult.success).toBe(false);
  });

  it('rejects invalid or too short account numbers', () => {
    const shortResult = FastTransactionSchema.safeParse({
      operation: 'SAVINGS_DEPOSIT',
      accountNo: 'AB',
      amount: 500,
    });
    expect(shortResult.success).toBe(false);
  });

  it('provides default sanitized remarks when omitted', () => {
    const result = FastTransactionSchema.safeParse({
      operation: 'LOAN_EMI_PAYMENT',
      accountNo: 'LN-001',
      amount: 12500,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.remarks).toBe('CBS Terminal Transaction');
    }
  });
});

describe('FastBankingTerminal - Navigation Tree Integrity', () => {
  it('has all 4 foundational CBS branches', () => {
    const branchIds = CBS_TERMINAL_TREE.map((n) => n.id);
    expect(branchIds).toContain('savings');
    expect(branchIds).toContain('loans');
    expect(branchIds).toContain('shares');
    expect(branchIds).toContain('teller');
  });

  it('ensures each branch has valid numerical 1-9 codes for rapid drill-down', () => {
    for (const root of CBS_TERMINAL_TREE) {
      expect(root.code).toMatch(/^[1-9]$/);
      if (root.children) {
        for (const child of root.children) {
          expect(child.code).toMatch(/^[1-9]$/);
        }
      }
    }
  });

  it('correctly maps leaf nodes to actionable CBS operations', () => {
    const regularSavings = CBS_TERMINAL_TREE.find((n) => n.id === 'savings')
      ?.children?.find((c) => c.id === 'regular-savings');

    expect(regularSavings).toBeDefined();
    const depositLeaf = regularSavings?.children?.find((l) => l.code === '1');
    expect(depositLeaf?.operation).toBe('SAVINGS_DEPOSIT');

    const withdrawalLeaf = regularSavings?.children?.find((l) => l.code === '2');
    expect(withdrawalLeaf?.operation).toBe('SAVINGS_WITHDRAWAL');
  });
});

describe('FastBankingTerminal - Keyboard Shortcut Resolution', () => {
  it('resolves F2 key to TOGGLE_TERMINAL', () => {
    const action = resolveShortcutAction(
      {
        key: 'F2',
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        isInput: false,
      },
      'ADMIN'
    );
    expect(action).toBe('TOGGLE_TERMINAL');
  });

  it('resolves Escape to CLOSE_MODALS', () => {
    const action = resolveShortcutAction(
      {
        key: 'Escape',
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        isInput: false,
      },
      'ADMIN'
    );
    expect(action).toBe('CLOSE_MODALS');
  });
});

describe('FastBankingTerminal - Denomination & In-Words Receipt Integration', () => {
  it('creates receipt with valid Nepali in-words and denomination breakdown', () => {
    const receipt: FastTransactionReceipt = {
      referenceNo: 'CBS-FST-998877',
      timestamp: '10:30:00 2081/06/15',
      operation: 'SAVINGS_DEPOSIT',
      memberName: 'राम प्रसाद शर्मा',
      memberId: 'MEM-001',
      accountNo: 'SAV-001',
      amount: 15500,
      newBalance: 65500,
      remarks: 'मासिक बचत जम्मा',
      tellerName: 'Teller #01',
      denominationCounts: {
        1000: 15,
        500: 1,
      },
    };

    expect(receipt.denominationCounts).toBeDefined();
    const inWords = numberToWordsNepali(receipt.amount);
    expect(inWords).toBe('अक्षरेपी पन्ध्र हजार पाँच सय रुपैयाँ मात्र');

    const printLines = getPrintableDenominations(receipt.denominationCounts!);
    expect(printLines).toHaveLength(2);
    expect(printLines[0].noteLabel).toBe('रु. 1000');
    expect(printLines[0].countStr).toBe('15');
    expect(printLines[1].noteLabel).toBe('रु. 500');
    expect(printLines[1].countStr).toBe('1');
  });
});
