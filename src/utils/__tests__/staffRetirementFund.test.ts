/**
 * Staff Statutory Provident Fund (कर्मचारी सञ्चय कोष) & Gratuity (उपदान कोष) Test Suite
 * Unako SACCOS (गढवा-५, दाङ) - Nepal Labor Act 2074 & Cooperative Bylaws
 */
import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPfGratuity,
  checkPfLoanEligibility,
  calculateRetirementSettlement,
  calculateAnnualPfInterest,
  verifyFundSegregation,
  exportStaffRetirementRegisterCsv,
  StaffSalaryRecord,
} from '../staffRetirementFund';

describe('staffRetirementFund utility', () => {
  const mockStaff: StaffSalaryRecord = {
    employeeId: 'emp-101',
    employeeNo: 'EMP-2078-001',
    employeeName: 'अर्जुन थापा मगर',
    designation: 'वरिष्ठ प्रबन्धक (Senior Manager)',
    basicSalary: 40000,
    joinedDateBS: '2075/04/01',
    tenureYears: 6.25,
    accumulatedEmployeePf: 300000,
    accumulatedEmployerPf: 300000,
    accumulatedPfInterest: 85000,
    totalAccumulatedPf: 685000,
    accumulatedGratuity: 208250,
    pfLoanBalance: 150000,
    accumulatedLeaveDays: 24,
  };

  describe('Monthly Payroll Statutory Deduction & Accrual (Labor Act 2074)', () => {
    it('calculates 10% employee PF, 10% employer matching, and 8.33% statutory gratuity', () => {
      const basicSalary = 40000;
      const breakdown = calculateMonthlyPfGratuity(basicSalary);

      // 10% employee deduction
      expect(breakdown.employeePfDeduction).toBe(4000);
      // 10% employer matching
      expect(breakdown.employerPfContribution).toBe(4000);
      // 20% total monthly PF trust deposit
      expect(breakdown.totalMonthlyPfDeposit).toBe(8000);
      // 8.33% statutory gratuity accrual (1 month basic pay / 12 months)
      expect(breakdown.employerGratuityAccrual).toBe(3332);
      // Total cooperative liability burden (10% PF + 8.33% Gratuity = 18.33%)
      expect(breakdown.totalMonthlyEmployerBurden).toBe(7332);
    });
  });

  describe('Staff Loan Against Accumulated Provident Fund', () => {
    it('enforces maximum 90% loan ceiling against total accumulated PF', () => {
      const eligibility = checkPfLoanEligibility(685000, 150000);

      // Max loan limit: 90% of 685,000 = 616,500
      expect(eligibility.maxLoanLimit).toBe(616500);
      expect(eligibility.existingLoanBalance).toBe(150000);
      // Available headroom = 616,500 - 150,000 = 466,500
      expect(eligibility.availableLoanLimit).toBe(466500);
      expect(eligibility.isEligible).toBe(true);
    });

    it('rejects loan eligibility when existing debt reaches 90% threshold', () => {
      const eligibility = checkPfLoanEligibility(100000, 95000);
      expect(eligibility.isEligible).toBe(false);
      expect(eligibility.availableLoanLimit).toBe(0);
    });
  });

  describe('Annual Compounded PF Interest Allocation', () => {
    it('calculates annual interest credited to staff PF trust balance at default 8.5% rate', () => {
      const totalPf = 500000;
      const interest = calculateAnnualPfInterest(totalPf, 8.5);
      expect(interest).toBe(42500); // 500,000 * 8.5%
    });
  });

  describe('Final Retirement & Resignation Settlement Voucher', () => {
    it('computes net settlement with PF, gratuity, leave encashment, and loan deductions', () => {
      const settlement = calculateRetirementSettlement(mockStaff, '2081/06/30');

      expect(settlement.voucherNo).toContain('VCHR-SETTLE-');
      expect(settlement.totalPfPayable).toBe(685000);
      expect(settlement.gratuityPayable).toBe(208250);

      // Leave encashment = 24 days * (40,000 / 30) = 32,000
      expect(settlement.leaveEncashmentPayable).toBe(32000);

      // Gross = 685,000 + 208,250 + 32,000 = 925,250
      expect(settlement.grossSettlement).toBe(925250);

      // Staff PF Loan Deduction = 150,000
      expect(settlement.staffLoanDeduction).toBe(150000);

      // Net Payable = 925,250 - 150,000 = 775,250
      expect(settlement.netPayableToEmployee).toBe(775250);
      expect(settlement.narration).toContain('श्रम ऐन २०७४');
    });
  });

  describe('Ring-Fenced Earmarked Fund Segregation Audit', () => {
    it('verifies whether cooperative has segregated sufficient bank assets matching staff liabilities', () => {
      const totalPfLiabilities = 1500000;
      const totalGratuityLiabilities = 500000;
      // Ring-fenced assets in dedicated FD/bank = 2,200,000
      const ringFencedAssets = 2200000;

      const audit = verifyFundSegregation(
        totalPfLiabilities,
        totalGratuityLiabilities,
        ringFencedAssets
      );

      expect(audit.totalStaffLiability).toBe(2000000); // 1.5M + 0.5M
      expect(audit.isFullyProtected).toBe(true);
      expect(audit.surplusDeficit).toBe(200000); // 2.2M - 2.0M surplus
    });

    it('flags deficit when earmarked assets fail to cover staff retirement liabilities', () => {
      const audit = verifyFundSegregation(2000000, 800000, 2500000);
      expect(audit.totalStaffLiability).toBe(2800000);
      expect(audit.isFullyProtected).toBe(false);
      expect(audit.surplusDeficit).toBe(-300000); // 300,000 shortfall
    });
  });

  describe('CSV Register Export', () => {
    it('exports staff retirement ledger to well-formatted CSV', () => {
      const csv = exportStaffRetirementRegisterCsv([mockStaff]);
      expect(csv).toContain('Employee No,Employee Name,Designation');
      expect(csv).toContain('EMP-2078-001');
      expect(csv).toContain('अर्जुन थापा मगर');
      expect(csv).toContain('685000');
    });
  });
});
