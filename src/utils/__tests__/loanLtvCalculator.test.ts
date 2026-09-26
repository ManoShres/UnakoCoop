import { describe, it, expect } from 'vitest';
import {
  STATUTORY_LTV_LIMITS,
  MAX_UNSECURED_LOAN_CEILING,
  calculateLoanEmi,
  evaluateLoanSafetyGate,
  LoanSafetyInput,
} from '../loanLtvCalculator';

describe('Loan Collateral Valuation & LTV Safety Gate Engine', () => {
  describe('EMI Calculation', () => {
    it('calculates reducing balance monthly installment (EMI) accurately', () => {
      // Principal 500,000 at 12% for 36 months: approx 16,607
      const emi = calculateLoanEmi(500000, 12, 36);
      expect(emi).toBeGreaterThan(16000);
      expect(emi).toBeLessThan(17000);
    });

    it('handles zero interest rate gracefully (straight-line division)', () => {
      const emi = calculateLoanEmi(120000, 0, 12);
      expect(emi).toBe(10000);
    });

    it('returns zero for invalid zero principal or tenure', () => {
      expect(calculateLoanEmi(0, 12, 12)).toBe(0);
      expect(calculateLoanEmi(500000, 12, 0)).toBe(0);
    });
  });

  describe('Statutory LTV Limits', () => {
    it('defines mandated LTV thresholds for Nepal cooperatives', () => {
      expect(STATUTORY_LTV_LIMITS.LAND_LALPURJA).toBe(50);
      expect(STATUTORY_LTV_LIMITS.BUILDING).toBe(50);
      expect(STATUTORY_LTV_LIMITS.CASH_FD_PLEDGE).toBe(85);
      expect(STATUTORY_LTV_LIMITS.GOLD_JEWELLERY).toBe(60);
      expect(STATUTORY_LTV_LIMITS.VEHICLE).toBe(50);
      expect(STATUTORY_LTV_LIMITS.LIVESTOCK).toBe(50);
      expect(STATUTORY_LTV_LIMITS.GUARANTOR).toBe(0);
    });
  });

  describe('Safety Gate Evaluation', () => {
    it('approves a safe, fully-collateralized loan with sufficient income', () => {
      const input: LoanSafetyInput = {
        requestedAmount: 600000,
        tenureMonths: 36,
        annualInterestRate: 11.5,
        monthlyIncome: 65000,
        existingDebtMonthlyEmi: 0,
        collateralType: 'LAND_LALPURJA',
        collateralEstimatedValue: 1500000, // 40% LTV <= 50% limit
      };

      const result = evaluateLoanSafetyGate(input);

      expect(result.actualLtvPercent).toBe(40);
      expect(result.statutoryMaxLtvPercent).toBe(50);
      expect(result.isLtvCompliant).toBe(true);
      expect(result.isDstiCompliant).toBe(true);
      expect(result.overallRiskRating).toBe('LOW_RISK');
      expect(result.recommendedAction).toBe('APPROVE');
      expect(result.breachReasons.length).toBe(0);
    });

    it('detects LTV limit breach when loan exceeds 50% of real estate value', () => {
      const input: LoanSafetyInput = {
        requestedAmount: 800000,
        tenureMonths: 36,
        annualInterestRate: 11.5,
        monthlyIncome: 70000,
        existingDebtMonthlyEmi: 0,
        collateralType: 'LAND_LALPURJA',
        collateralEstimatedValue: 1000000, // 80% LTV > 50% limit
      };

      const result = evaluateLoanSafetyGate(input);

      expect(result.actualLtvPercent).toBe(80);
      expect(result.isLtvCompliant).toBe(false);
      expect(result.overallRiskRating).toBe('HIGH_RISK_BREACH');
      expect(result.recommendedAction).toBe('ADDITIONAL_COLLATERAL_REQUIRED');
      expect(result.maxAllowableLoanByCollateral).toBe(500000); // 50% of 1M
      expect(result.breachReasons.some((b) => b.code === 'LTV_EXCEEDED')).toBe(true);
    });

    it('enforces regulatory ceiling of NPR 300,000 on unsecured guarantor loans', () => {
      const input: LoanSafetyInput = {
        requestedAmount: 450000,
        tenureMonths: 24,
        annualInterestRate: 12.0,
        monthlyIncome: 50000,
        collateralType: 'GUARANTOR',
        collateralEstimatedValue: 0,
      };

      const result = evaluateLoanSafetyGate(input);

      expect(result.isUnsecuredLimitCompliant).toBe(false);
      expect(result.breachReasons.some((b) => b.code === 'UNSECURED_CEILING_EXCEEDED')).toBe(true);
      expect(result.suggestedMaxLoanAmount).toBeLessThanOrEqual(MAX_UNSECURED_LOAN_CEILING);
    });

    it('flags DSTI repayment capacity breach when EMI exceeds 50% of net income', () => {
      const input: LoanSafetyInput = {
        requestedAmount: 500000,
        tenureMonths: 12,
        annualInterestRate: 14.0,
        monthlyIncome: 30000, // EMI ~45,000 which is 150% of monthly income!
        collateralType: 'CASH_FD_PLEDGE',
        collateralEstimatedValue: 700000,
      };

      const result = evaluateLoanSafetyGate(input);

      expect(result.isLtvCompliant).toBe(true); // LTV is fine (FD pledge)
      expect(result.isDstiCompliant).toBe(false); // DSTI breached!
      expect(result.breachReasons.some((b) => b.code === 'DSTI_EXCEEDED')).toBe(true);
    });

    it('requires mandatory livestock insurance policy for biological collateral', () => {
      const inputWithoutIns: LoanSafetyInput = {
        requestedAmount: 200000,
        tenureMonths: 24,
        annualInterestRate: 10.0,
        monthlyIncome: 40000,
        collateralType: 'LIVESTOCK',
        collateralEstimatedValue: 450000,
        hasInsurancePolicy: false,
      };

      const resNoIns = evaluateLoanSafetyGate(inputWithoutIns);
      expect(resNoIns.isInsuranceCompliant).toBe(false);
      expect(resNoIns.breachReasons.some((b) => b.code === 'MISSING_LIVESTOCK_INSURANCE')).toBe(true);

      const inputWithIns: LoanSafetyInput = {
        ...inputWithoutIns,
        hasInsurancePolicy: true,
      };
      const resWithIns = evaluateLoanSafetyGate(inputWithIns);
      expect(resWithIns.isInsuranceCompliant).toBe(true);
    });

    it('recommends REJECT when multiple critical breaches are present', () => {
      const input: LoanSafetyInput = {
        requestedAmount: 1000000,
        tenureMonths: 12,
        annualInterestRate: 14.0,
        monthlyIncome: 25000, // severe DSTI breach
        collateralType: 'LAND_LALPURJA',
        collateralEstimatedValue: 800000, // severe LTV breach (125%)
      };

      const result = evaluateLoanSafetyGate(input);

      expect(result.overallRiskRating).toBe('HIGH_RISK_BREACH');
      expect(result.recommendedAction).toBe('REJECT');
      expect(result.breachReasons.length).toBeGreaterThanOrEqual(2);
    });
  });
});
