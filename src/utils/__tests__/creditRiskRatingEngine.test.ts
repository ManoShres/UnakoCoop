import { describe, it, expect } from 'vitest';
import {
  evaluateBorrowerCreditRisk,
  exportCreditRiskReportCsv,
  createDefaultBorrowerScoreInputs,
  BorrowerCreditScoreInput,
} from '../creditRiskRatingEngine';

describe('creditRiskRatingEngine', () => {
  const primeBorrower: BorrowerCreditScoreInput = {
    applicantName: 'कमल प्रसाद चौधरी',
    memberNo: 'M-101',
    membershipMonths: 48,
    requestedAmount: 800000,
    verifiedMonthlyIncome: 80000,
    totalMonthlyDebtObligations: 24000, // DSTI: 30%
    shareCapitalBalance: 120000,        // Loan / Share: 6.6x
    regularSavingsBalance: 200000,      // Savings ratio: 25%
    collateralAssessedValue: 2000000,   // LTV: 40%
    hasCibDefaultRecord: false,
    hasActiveInsurance: true,
    hasStrongGuarantor: true,
    projectFeasibilityScore: 14,
  };

  describe('evaluateBorrowerCreditRisk', () => {
    it('rates a prime borrower as GRADE_A_PRIME with preferential recommendation', () => {
      const evaluation = evaluateBorrowerCreditRisk(primeBorrower);

      expect(evaluation.totalScore).toBeGreaterThanOrEqual(85);
      expect(evaluation.grade).toBe('GRADE_A_PRIME');
      expect(evaluation.recommendedAction).toBe('APPROVE_PREFERENTIAL');
      expect(evaluation.dstiRatio).toBe(30);
      expect(evaluation.ltvRatio).toBe(40);
      expect(evaluation.isCoopAct51Compliant).toBe(true);
      expect(evaluation.pillarScores.CHARACTER.score).toBe(25);
      expect(evaluation.pillarScores.CAPACITY.score).toBe(25);
    });

    it('rates a moderate borrower with 46% DSTI as GRADE_B_MODERATE', () => {
      const moderateBorrower: BorrowerCreditScoreInput = {
        applicantName: 'शान्ति देवी थारु',
        memberNo: 'M-102',
        membershipMonths: 24,
        requestedAmount: 500000,
        verifiedMonthlyIncome: 45000,
        totalMonthlyDebtObligations: 21000, // DSTI: 46.6%
        shareCapitalBalance: 60000,         // Loan / Share: 8.3x
        regularSavingsBalance: 60000,       // 12%
        collateralAssessedValue: 900000,    // LTV: 55.5%
        hasCibDefaultRecord: false,
        hasActiveInsurance: true,
        hasStrongGuarantor: true,
        projectFeasibilityScore: 11,
      };

      const evaluation = evaluateBorrowerCreditRisk(moderateBorrower);

      expect(evaluation.totalScore).toBeGreaterThanOrEqual(70);
      expect(evaluation.totalScore).toBeLessThan(85);
      expect(evaluation.grade).toBe('GRADE_B_MODERATE');
      expect(evaluation.recommendedAction).toBe('APPROVE_STANDARD');
    });

    it('immediately gives 0 character points and rejects any applicant with CIB default record', () => {
      const defaulter: BorrowerCreditScoreInput = {
        ...primeBorrower,
        hasCibDefaultRecord: true,
      };

      const evaluation = evaluateBorrowerCreditRisk(defaulter);

      expect(evaluation.pillarScores.CHARACTER.score).toBe(0);
      expect(evaluation.grade).toBe('GRADE_D_REJECTED');
      expect(evaluation.recommendedAction).toBe('REJECT');
    });

    it('flags non-compliance with Cooperative Act Section 51 when loan exceeds 10x share capital', () => {
      const excessiveLoan: BorrowerCreditScoreInput = {
        ...primeBorrower,
        requestedAmount: 1500000,
        shareCapitalBalance: 50000, // 30x share capital!
      };

      const evaluation = evaluateBorrowerCreditRisk(excessiveLoan);

      expect(evaluation.shareMultiplier).toBe(30);
      expect(evaluation.isCoopAct51Compliant).toBe(false);
      // Non-compliance prevents Grade A Prime status
      expect(evaluation.grade).not.toBe('GRADE_A_PRIME');
    });
  });

  describe('exportCreditRiskReportCsv', () => {
    it('generates institutional CSV report with all evaluation rows and risk grades', () => {
      const defaultInputs = createDefaultBorrowerScoreInputs();
      const evaluations = defaultInputs.map(evaluateBorrowerCreditRisk);

      const csv = exportCreditRiskReportCsv(evaluations);

      expect(csv).toContain('उनको बचत तथा ऋण सहकारी संस्था लि.');
      expect(csv).toContain('ऋणी सदस्य कर्जा जोखिम रेटिङ');
      expect(csv).toContain('कमल प्रसाद चौधरी');
      expect(csv).toContain('शान्ति देवी थारु');
      expect(csv).toContain('DSTI %');
      expect(csv).toContain('LTV %');
    });
  });
});
