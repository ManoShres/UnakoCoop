import { describe, it, expect } from 'vitest';
import {
  calculateSavingsInterestWithTds,
  calculateStatutoryProfitAppropriation,
  validateYearEndTrialBalance,
  YearEndAppropriationInput,
} from '../yearEndClosing';

describe('Year-End Closing (Asar Masanta / असार मसान्त) Engine', () => {
  describe('calculateSavingsInterestWithTds', () => {
    it('accurately computes gross interest, 5% TDS, and net payable interest', () => {
      // e.g. NPR 100,000 balance at 7% annual interest for 1 year
      const result = calculateSavingsInterestWithTds(100000, 7.0, 365);

      expect(result.grossInterest).toBe(7000);
      expect(result.tdsRatePercent).toBe(5.0);
      expect(result.tdsAmount).toBe(350); // 5% of 7000
      expect(result.netInterest).toBe(6650); // 7000 - 350
    });

    it('handles zero or negative balance gracefully', () => {
      const result = calculateSavingsInterestWithTds(0, 8.5);
      expect(result.grossInterest).toBe(0);
      expect(result.tdsAmount).toBe(0);
      expect(result.netInterest).toBe(0);
    });
  });

  describe('calculateStatutoryProfitAppropriation', () => {
    it('appropriates net surplus strictly according to Nepal Cooperative Act 2074', () => {
      const input: YearEndAppropriationInput = {
        netProfit: 1000000, // NPR 10 Lakhs
        fiscalYear: '2081/82',
        shareCapital: 5000000,
      };

      const result = calculateStatutoryProfitAppropriation(input);

      // Mandatory 25% to General Reserve Fund
      expect(result.generalReserveFund).toBe(250000);

      // Cooperative Education Fund (0.5%)
      expect(result.educationFund).toBe(5000);

      // Community Development Fund (0.5%)
      expect(result.communityDevelopmentFund).toBe(5000);

      // Cooperative Promotion Fund (0.5%)
      expect(result.promotionFund).toBe(5000);

      // Employee Welfare Fund (0.5%)
      expect(result.employeeWelfareFund).toBe(5000);

      // Remaining Distributable Surplus: 1,000,000 - (250,000 + 20,000) = 730,000
      expect(result.totalStatutoryAllocations).toBe(270000);
      expect(result.distributableSurplus).toBe(730000);
    });

    it('enforces maximum 18% share dividend cap as per Nepal Cooperative Act 2074', () => {
      const input: YearEndAppropriationInput = {
        netProfit: 5000000,
        fiscalYear: '2081/82',
        shareCapital: 1000000, // NPR 10 Lakhs share capital -> max 18% dividend is 180,000
      };

      const result = calculateStatutoryProfitAppropriation(input);
      expect(result.maxPermissibleDividendAmount).toBe(180000); // 18% of 1,000,000
    });
  });

  describe('validateYearEndTrialBalance', () => {
    it('confirms trial balance health when assets match liabilities and equity', () => {
      const balance = validateYearEndTrialBalance({
        totalAssets: 10000000,
        totalLiabilities: 8000000,
        totalEquityAndReserves: 2000000,
      });

      expect(balance.isBalanced).toBe(true);
      expect(balance.variance).toBe(0);
    });

    it('detects and flags discrepancies in trial balance', () => {
      const balance = validateYearEndTrialBalance({
        totalAssets: 10000000,
        totalLiabilities: 8000000,
        totalEquityAndReserves: 1950000,
      });

      expect(balance.isBalanced).toBe(false);
      expect(balance.variance).toBe(50000);
    });
  });
});
