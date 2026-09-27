import { describe, it, expect } from 'vitest';
import {
  calculateAlmMaturityGaps,
  simulateInterestRateShocks,
  runLiquidityStressTests,
  generateAlmComprehensiveReport,
  exportAlmToCsv,
  INITIAL_ALM_PORTFOLIO,
  MATURITY_BUCKETS,
} from '../almMaturityGapEngine';

describe('almMaturityGapEngine', () => {
  describe('calculateAlmMaturityGaps', () => {
    it('accurately computes 6 buckets with periodic and cumulative gaps', () => {
      const result = calculateAlmMaturityGaps({
        totalAssets: INITIAL_ALM_PORTFOLIO.totalAssets,
        assetsByBucket: INITIAL_ALM_PORTFOLIO.assetsByBucket,
        liabilitiesByBucket: INITIAL_ALM_PORTFOLIO.liabilitiesByBucket,
      });

      expect(result).toHaveLength(MATURITY_BUCKETS.length);

      // Bucket 1: 1-30 days
      // Assets = 22M, Liabilities = 25M => Periodic Gap = -3M
      expect(result[0].periodicGap).toBe(-3000000);
      expect(result[0].cumulativeGap).toBe(-3000000);

      // Verify running cumulative gap
      let expectedRunning = 0;
      for (let i = 0; i < result.length; i++) {
        expectedRunning += result[i].periodicGap;
        expect(result[i].cumulativeGap).toBe(expectedRunning);
      }
    });

    it('assigns correct risk statuses based on gap ratios', () => {
      const result = calculateAlmMaturityGaps({
        totalAssets: 10000000,
        assetsByBucket: {
          '1_TO_30_DAYS': 1000000,
          '31_TO_90_DAYS': 1000000,
          '91_TO_180_DAYS': 1000000,
          '181_TO_365_DAYS': 1000000,
          '1_TO_5_YEARS': 1000000,
          'OVER_5_YEARS': 1000000,
        },
        liabilitiesByBucket: {
          '1_TO_30_DAYS': 4000000, // Deficit = -3M (-30% of total assets => CRITICAL_DEFICIT)
          '31_TO_90_DAYS': 1000000,
          '91_TO_180_DAYS': 1000000,
          '181_TO_365_DAYS': 1000000,
          '1_TO_5_YEARS': 1000000,
          'OVER_5_YEARS': 1000000,
        },
      });

      expect(result[0].status).toBe('CRITICAL_DEFICIT');
    });
  });

  describe('simulateInterestRateShocks', () => {
    it('calculates positive delta NII for positive gap on rate hike', () => {
      const oneYearGap = 10000000; // 1 Crore positive gap
      const shocks = simulateInterestRateShocks(oneYearGap);

      const hike100 = shocks.find((s) => s.shockBps === 100);
      expect(hike100).toBeDefined();
      expect(hike100?.deltaNetInterestIncome).toBe(100000); // 10M * 0.01 = 100k
      expect(hike100?.impactAssessmentNe).toContain('वृद्धि हुने');

      const cut100 = shocks.find((s) => s.shockBps === -100);
      expect(cut100?.deltaNetInterestIncome).toBe(-100000);
      expect(cut100?.impactAssessmentNe).toContain('संकुचन');
    });
  });

  describe('runLiquidityStressTests', () => {
    it('models 5%, 15%, and 30% deposit outflows', () => {
      const results = runLiquidityStressTests({
        totalSavingsDeposit: 100000000, // 10 Crores
        cashAndBankCall: 20000000, // 2 Crores
        secondaryReserves: 15000000, // 1.5 Crores
      });

      expect(results).toHaveLength(3);

      // Scenario 1: 5% = 5M outflow against 35M buffer => STABLE
      expect(results[0].expectedOutflow).toBe(5000000);
      expect(results[0].netSurplusOrDeficit).toBe(30000000);
      expect(results[0].status).toBe('STABLE');

      // Scenario 3: 30% = 30M outflow against 35M buffer
      expect(results[2].expectedOutflow).toBe(30000000);
      expect(results[2].netSurplusOrDeficit).toBe(5000000);
    });
  });

  describe('generateAlmComprehensiveReport', () => {
    it('generates a complete report with ALCO recommendation', () => {
      const report = generateAlmComprehensiveReport();
      expect(report.totalAssets).toBe(INITIAL_ALM_PORTFOLIO.totalAssets);
      expect(report.bucketAnalytics).toHaveLength(6);
      expect(report.rateShocks).toHaveLength(4);
      expect(report.stressTests).toHaveLength(3);
      expect(report.alcoRecommendationNe).toBeTruthy();
      expect(report.alcoRecommendationEn).toBeTruthy();
    });
  });

  describe('exportAlmToCsv', () => {
    it('generates valid CSV format', () => {
      const report = generateAlmComprehensiveReport();
      const csv = exportAlmToCsv(report);

      expect(csv).toContain('समय परिपक्वता अवधि (Time Horizon)');
      expect(csv).toContain('१ देखि ३० दिन');
      expect(csv).toContain('५ वर्षभन्दा माथि');
    });
  });
});
