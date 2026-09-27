import { describe, it, expect } from 'vitest';
import {
  calculateMergerSwapRatio,
  consolidateBalanceSheet,
  generateMergerCopasVoucher,
  exportMergerComparisonToCsv,
  INITIAL_ANCHOR_COOP,
  INITIAL_TARGET_COOP,
} from '../coopMergerEngine';

describe('coopMergerEngine', () => {
  describe('calculateMergerSwapRatio', () => {
    it('calculates proper NAV and swap ratio between anchor and target', () => {
      const swap = calculateMergerSwapRatio({
        anchorCoop: INITIAL_ANCHOR_COOP,
        targetCoop: INITIAL_TARGET_COOP,
      });

      // Anchor NAV ~ 135.14, Target NAV ~ 118.18 => Swap ratio ~ 0.87
      expect(swap.anchorNavPerShare).toBeCloseTo(135.14, 1);
      expect(swap.targetNavPerShare).toBeCloseTo(118.18, 1);
      expect(swap.nominalSwapRatio).toBeGreaterThan(0.8);
      expect(swap.nominalSwapRatio).toBeLessThan(1.0);
      expect(swap.sharesIssuedToTarget).toBeGreaterThan(0);
      expect(swap.swapSummaryNe).toContain('सेयर स्वाप अनुपात');
    });

    it('adjusts swap ratio downward when asset haircut is applied', () => {
      const normalSwap = calculateMergerSwapRatio({
        anchorCoop: INITIAL_ANCHOR_COOP,
        targetCoop: INITIAL_TARGET_COOP,
        assetHaircutPercent: 0,
      });

      const haircutSwap = calculateMergerSwapRatio({
        anchorCoop: INITIAL_ANCHOR_COOP,
        targetCoop: INITIAL_TARGET_COOP,
        assetHaircutPercent: 10, // 10% haircut
      });

      expect(haircutSwap.targetNavPerShare).toBeLessThan(normalSwap.targetNavPerShare);
      expect(haircutSwap.sharesIssuedToTarget).toBeLessThan(normalSwap.sharesIssuedToTarget);
    });
  });

  describe('consolidateBalanceSheet', () => {
    it('combines assets, liabilities, and member counts correctly', () => {
      const swap = calculateMergerSwapRatio({
        anchorCoop: INITIAL_ANCHOR_COOP,
        targetCoop: INITIAL_TARGET_COOP,
      });

      const cons = consolidateBalanceSheet(INITIAL_ANCHOR_COOP, INITIAL_TARGET_COOP, swap);

      // Members = 1420 + 580 = 2000
      expect(cons.totalMembers).toBe(2000);
      expect(cons.femaleMembersPercent).toBeGreaterThan(80);

      // Savings = 84M + 22M = 106M
      expect(cons.consolidatedSavings).toBe(106000000);

      // Total Assets = Cash + Loans + Fixed + Other
      expect(cons.consolidatedTotalAssets).toBeGreaterThan(140000000);
      expect(cons.consolidatedNetWorth).toBeGreaterThan(30000000);
      expect(cons.netWorthToAssetsPercent).toBeGreaterThan(15);
    });
  });

  describe('generateMergerCopasVoucher', () => {
    it('generates a balanced double-entry amalgamation voucher', () => {
      const swap = calculateMergerSwapRatio({
        anchorCoop: INITIAL_ANCHOR_COOP,
        targetCoop: INITIAL_TARGET_COOP,
      });

      const voucher = generateMergerCopasVoucher(INITIAL_TARGET_COOP, swap, '2081/82');

      expect(voucher.totalDebit).toBe(voucher.totalCredit);
      expect(voucher.entries.some((e) => e.glCode === '1101' && e.debitAmount > 0)).toBe(true);
      expect(voucher.entries.some((e) => e.glCode === '2101' && e.creditAmount > 0)).toBe(true);
      expect(voucher.entries.some((e) => e.glCode === '3001' && e.creditAmount > 0)).toBe(true);
    });
  });

  describe('exportMergerComparisonToCsv', () => {
    it('produces valid CSV comparison matrix', () => {
      const swap = calculateMergerSwapRatio({
        anchorCoop: INITIAL_ANCHOR_COOP,
        targetCoop: INITIAL_TARGET_COOP,
      });

      const cons = consolidateBalanceSheet(INITIAL_ANCHOR_COOP, INITIAL_TARGET_COOP, swap);
      const csv = exportMergerComparisonToCsv(INITIAL_ANCHOR_COOP, INITIAL_TARGET_COOP, cons);

      expect(csv).toContain('वित्तीय सूचक (Financial Indicator)');
      expect(csv).toContain('कुल सदस्य संख्या');
      expect(csv).toContain('2000');
    });
  });
});
