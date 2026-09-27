import { describe, it, expect } from 'vitest';
import {
  calculateInterestSubsidySplit,
  validateConcessionalEligibility,
  generateQuarterlySubsidyBatch,
  exportSubsidyClaimCsv,
  createDefaultConcessionalLoans,
  CONCESSIONAL_SCHEME_CONFIG,
} from '../loanInterestSubsidyEngine';

describe('loanInterestSubsidyEngine', () => {
  describe('calculateInterestSubsidySplit', () => {
    it('accurately calculates interest split between borrower and government subsidy', () => {
      // Principal: 1,000,000; Nominal: 12%; Subsidy: 5%; Days: 90
      const result = calculateInterestSubsidySplit({
        principal: 1000000,
        nominalRate: 12.0,
        subsidyRate: 5.0,
        periodDays: 90,
      });

      // Total Nominal: (1,000,000 * 12 * 90) / 36500 = 29589.04
      expect(result.effectiveBorrowerRate).toBe(7.0);
      expect(result.totalNominalInterest).toBeCloseTo(29589.04, 1);
      // Subsidy: (1,000,000 * 5 * 90) / 36500 = 12328.77
      expect(result.governmentSubsidyPayable).toBeCloseTo(12328.77, 1);
      // Member Payable: 29589.04 - 12328.77 = 17260.27
      expect(result.memberPayableInterest).toBeCloseTo(17260.27, 1);
    });

    it('returns zero interest when principal or period days is non-positive', () => {
      const zeroPrincipal = calculateInterestSubsidySplit({
        principal: 0,
        nominalRate: 12.0,
        subsidyRate: 5.0,
        periodDays: 90,
      });
      expect(zeroPrincipal.totalNominalInterest).toBe(0);
      expect(zeroPrincipal.governmentSubsidyPayable).toBe(0);
      expect(zeroPrincipal.memberPayableInterest).toBe(0);

      const zeroDays = calculateInterestSubsidySplit({
        principal: 500000,
        nominalRate: 12.0,
        subsidyRate: 5.0,
        periodDays: 0,
      });
      expect(zeroDays.totalNominalInterest).toBe(0);
    });
  });

  describe('validateConcessionalEligibility', () => {
    it('approves an eligible woman entrepreneur applicant within limit', () => {
      const result = validateConcessionalEligibility({
        schemeType: 'WOMEN_ENTREPRENEURSHIP',
        applicantAge: 32,
        isWoman: true,
        isDalit: false,
        isReturneeMigrant: false,
        hasAcademicDegree: false,
        hasEnterpriseRegistration: true,
        hasLivestockCropInsurance: false,
        requestedAmount: 1000000,
      });

      expect(result.isEligible).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.maxEligibleAmount).toBe(1500000);
    });

    it('rejects male applicant for women entrepreneurship scheme', () => {
      const result = validateConcessionalEligibility({
        schemeType: 'WOMEN_ENTREPRENEURSHIP',
        applicantAge: 35,
        isWoman: false,
        isDalit: false,
        isReturneeMigrant: false,
        hasAcademicDegree: false,
        hasEnterpriseRegistration: true,
        hasLivestockCropInsurance: false,
        requestedAmount: 500000,
      });

      expect(result.isEligible).toBe(false);
      expect(result.errorsNepali.some((e) => e.includes('महिला'))).toBe(true);
    });

    it('validates educated youth scheme requires bachelor degree and age <= 40', () => {
      const overageResult = validateConcessionalEligibility({
        schemeType: 'EDUCATED_YOUTH',
        applicantAge: 45,
        isWoman: false,
        isDalit: false,
        isReturneeMigrant: false,
        hasAcademicDegree: true,
        hasEnterpriseRegistration: true,
        hasLivestockCropInsurance: false,
        requestedAmount: 500000,
      });

      expect(overageResult.isEligible).toBe(false);
      expect(overageResult.errorsNepali.some((e) => e.includes('४० वर्ष'))).toBe(true);

      const noDegreeResult = validateConcessionalEligibility({
        schemeType: 'EDUCATED_YOUTH',
        applicantAge: 28,
        isWoman: false,
        isDalit: false,
        isReturneeMigrant: false,
        hasAcademicDegree: false,
        hasEnterpriseRegistration: true,
        hasLivestockCropInsurance: false,
        requestedAmount: 500000,
      });

      expect(noDegreeResult.isEligible).toBe(false);
      expect(noDegreeResult.errorsNepali.some((e) => e.includes('स्नातक'))).toBe(true);
    });

    it('requires insurance for commercial agriculture loan', () => {
      const noInsurance = validateConcessionalEligibility({
        schemeType: 'COMMERCIAL_AGRICULTURE',
        applicantAge: 40,
        isWoman: false,
        isDalit: false,
        isReturneeMigrant: false,
        hasAcademicDegree: false,
        hasEnterpriseRegistration: true,
        hasLivestockCropInsurance: false,
        requestedAmount: 2000000,
      });

      expect(noInsurance.isEligible).toBe(false);
      expect(noInsurance.errorsNepali.some((e) => e.includes('बीमा'))).toBe(true);
    });

    it('rejects loan amount exceeding statutory ceiling', () => {
      const excessiveAmount = validateConcessionalEligibility({
        schemeType: 'WOMEN_ENTREPRENEURSHIP',
        applicantAge: 30,
        isWoman: true,
        isDalit: false,
        isReturneeMigrant: false,
        hasAcademicDegree: false,
        hasEnterpriseRegistration: true,
        hasLivestockCropInsurance: false,
        requestedAmount: 2500000, // Ceiling is 1,500,000
      });

      expect(excessiveAmount.isEligible).toBe(false);
      expect(excessiveAmount.errors.some((e) => e.includes('exceeds the ceiling'))).toBe(true);
    });
  });

  describe('generateQuarterlySubsidyBatch', () => {
    it('aggregates quarterly claims only for verified active loans with positive balance', () => {
      const sampleLoans = createDefaultConcessionalLoans();
      const { batch, itemCalculations } = generateQuarterlySubsidyBatch({
        claimBatchNo: 'CLAIM-2080-Q2-01',
        fiscalYear: '२०८०/८१',
        quarterBS: 'Q2',
        claimDateBS: '२०८०/०९/३०',
        loans: sampleLoans,
        quarterDays: 90,
      });

      expect(batch.totalEligibleLoans).toBe(sampleLoans.length);
      expect(batch.totalActivePrincipal).toBe(
        sampleLoans.reduce((sum, l) => sum + l.remainingBalance, 0)
      );
      expect(batch.totalSubsidyClaimAmount).toBeGreaterThan(0);
      expect(batch.status).toBe('SUBMITTED_TO_MUNICIPALITY');
      expect(itemCalculations).toHaveLength(sampleLoans.length);
    });
  });

  describe('exportSubsidyClaimCsv', () => {
    it('generates well-formatted CSV with statutory metadata and rows', () => {
      const sampleLoans = createDefaultConcessionalLoans();
      const { batch, itemCalculations } = generateQuarterlySubsidyBatch({
        claimBatchNo: 'CLAIM-2080-Q2-01',
        fiscalYear: '२०८०/८१',
        quarterBS: 'Q2',
        claimDateBS: '२०८०/०९/३०',
        loans: sampleLoans,
      });

      const csv = exportSubsidyClaimCsv(batch, itemCalculations);

      expect(csv).toContain('दाबी ब्याच नं: CLAIM-2080-Q2-01');
      expect(csv).toContain('ऋणीको नाम (Member Name)');
      expect(csv).toContain('शान्ति देवी थारु');
      expect(csv).toContain('गढवा उन्नत तोरी खेती');
      expect(csv).toContain(batch.totalSubsidyClaimAmount.toFixed(2));
    });
  });
});
