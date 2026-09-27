import { describe, it, expect } from 'vitest';
import {
  calculateAnnualPremium,
  calculateClaimSettlement,
  validateClaimSubmission,
  aggregateMutualFundMetrics,
  exportPoliciesCsv,
  exportClaimsCsv,
  MicroInsurancePolicy,
  InsuranceClaim,
} from '../memberMicroInsurance';

describe('memberMicroInsurance - Member Micro-Insurance & Mutual Relief Scheme', () => {
  describe('calculateAnnualPremium', () => {
    it('calculates Member Life premium at 0.5% with minimum threshold', () => {
      // 0.5% of 100,000 = 500
      expect(calculateAnnualPremium('MEMBER_LIFE', 100000)).toBe(500);
      // 0.5% of 20,000 = 100 -> min 300 applied
      expect(calculateAnnualPremium('MEMBER_LIFE', 20000)).toBe(300);
    });

    it('calculates Critical Illness premium with flat rate for <= 50,000', () => {
      expect(calculateAnnualPremium('CRITICAL_ILLNESS', 50000)).toBe(500);
      // 1% of 80,000 = 800
      expect(calculateAnnualPremium('CRITICAL_ILLNESS', 80000)).toBe(800);
    });

    it('calculates Livestock premium with standard 5% vs subsidized 3%', () => {
      // Standard: 5% of 60,000 = 3000
      expect(calculateAnnualPremium('LIVESTOCK_AGRICULTURE', 60000, false)).toBe(3000);
      // Subsidized: 3% of 60,000 = 1800
      expect(calculateAnnualPremium('LIVESTOCK_AGRICULTURE', 60000, true)).toBe(1800);
    });

    it('calculates Maternity welfare annual fee at flat Rs. 200', () => {
      expect(calculateAnnualPremium('MATERNITY_NURTURE', 10000)).toBe(200);
    });

    it('returns 0 for non-positive sum assured', () => {
      expect(calculateAnnualPremium('MEMBER_LIFE', 0)).toBe(0);
      expect(calculateAnnualPremium('MEMBER_LIFE', -1000)).toBe(0);
    });
  });

  describe('calculateClaimSettlement', () => {
    it('offsets outstanding loan first, adds funeral grant, and disburses surplus to nominee', () => {
      const result = calculateClaimSettlement({
        claimedAmount: 200000,
        approvedSumAssured: 200000,
        outstandingLoanBalance: 120000,
        bereavementGrant: 20000,
      });

      expect(result.approvedAmount).toBe(200000);
      expect(result.deductedLoanBalance).toBe(120000);
      expect(result.bereavementGrant).toBe(20000);
      // Surplus (200k - 120k = 80k) + grant 20k = 100k
      expect(result.netDisbursedToClaimant).toBe(100000);
      expect(result.isFullyCoveringLoan).toBe(true);
      expect(result.remainingLoanBalance).toBe(0);
    });

    it('handles scenario when loan exceeds approved sum assured', () => {
      const result = calculateClaimSettlement({
        claimedAmount: 250000,
        approvedSumAssured: 150000,
        outstandingLoanBalance: 200000,
        bereavementGrant: 15000,
      });

      expect(result.approvedAmount).toBe(150000);
      expect(result.deductedLoanBalance).toBe(150000);
      expect(result.remainingLoanBalance).toBe(50000);
      expect(result.isFullyCoveringLoan).toBe(false);
      // Only funeral grant disbursed because surplus after loan is 0
      expect(result.netDisbursedToClaimant).toBe(15000);
    });
  });

  describe('validateClaimSubmission', () => {
    it('returns valid when all required fields and documents are present', () => {
      const res = validateClaimSubmission({
        memberId: 'MEM-01',
        policyNo: 'POL-LIFE-001',
        claimantName: 'सुनिता चौधरी (हकवाला)',
        claimedAmount: 150000,
        documentsSubmitted: ['वडा कार्यालय मृत्युदर्ता प्रमाणपत्र', 'ऋण सम्झौता प्रतिलिपि'],
      });
      expect(res.isValid).toBe(true);
      expect(res.errors.length).toBe(0);
    });

    it('detects missing fields and documents', () => {
      const res = validateClaimSubmission({
        memberId: '',
        policyNo: '',
        claimantName: '',
        claimedAmount: 0,
        documentsSubmitted: [],
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.length).toBeGreaterThanOrEqual(4);
    });
  });

  const samplePolicies: readonly MicroInsurancePolicy[] = [
    {
      id: 'POL-1',
      policyNo: 'POL-LIFE-2081-01',
      memberId: 'm-101',
      memberNo: 'M-101',
      memberName: 'राम बहादुर चौधरी',
      schemeType: 'MEMBER_LIFE',
      sumAssured: 200000,
      annualPremium: 1000,
      startDateBS: '2081/01/01',
      endDateBS: '2081/12/30',
      linkedLoanId: 'LN-991',
      outstandingLoanBalance: 120000,
      status: 'ACTIVE',
      nominee: {
        name: 'सुनिता चौधरी',
        relation: 'श्रीमती (Wife)',
        phone: '9847123456',
      },
    },
    {
      id: 'POL-2',
      policyNo: 'POL-LIVE-2081-02',
      memberId: 'm-102',
      memberNo: 'M-102',
      memberName: 'कमल थापा',
      schemeType: 'LIVESTOCK_AGRICULTURE',
      sumAssured: 80000,
      annualPremium: 2400,
      startDateBS: '2081/02/01',
      endDateBS: '2082/01/30',
      status: 'ACTIVE',
      nominee: {
        name: 'विष्णु थापा',
        relation: 'छोरा (Son)',
        phone: '9857999888',
      },
    },
  ];

  const sampleClaims: readonly InsuranceClaim[] = [
    {
      id: 'CLM-1',
      claimNo: 'CLM-2081-01',
      policyId: 'POL-1',
      policyNo: 'POL-LIFE-2081-01',
      memberId: 'm-101',
      memberName: 'राम बहादुर चौधरी',
      claimantName: 'सुनिता चौधरी',
      claimantRelation: 'श्रीमती',
      schemeType: 'MEMBER_LIFE',
      incidentDateBS: '2081/08/10',
      claimedAmount: 200000,
      approvedAmount: 200000,
      deductedLoanBalance: 120000,
      bereavementGrant: 20000,
      netDisbursedToClaimant: 100000,
      documentsSubmitted: ['मृत्युदर्ता'],
      status: 'DISBURSED',
      boardDecisionNo: 'BOD-88-2081',
      disbursementVoucherNo: 'VCH-RELIEF-01',
    },
  ];

  describe('aggregateMutualFundMetrics', () => {
    it('aggregates premiums, claims, loss ratio and fund balance', () => {
      const initialReserve = 500000;
      const metrics = aggregateMutualFundMetrics(samplePolicies, sampleClaims, initialReserve);

      // Premiums = 1000 + 2400 = 3400
      expect(metrics.totalPremiumCollected).toBe(3400);
      // Claims Paid = 200,000 + 20,000 = 220,000
      expect(metrics.totalClaimsPaid).toBe(220000);
      // Balance = 500,000 + 3,400 - 220,000 = 283,400
      expect(metrics.currentFundBalance).toBe(283400);
      expect(metrics.totalActivePolicies).toBe(2);
      expect(metrics.totalSumAssuredActive).toBe(280000);
      expect(metrics.totalClaimsCount).toBe(1);
    });
  });

  describe('exportPoliciesCsv and exportClaimsCsv', () => {
    it('exports policies CSV with quoted headers and rows', () => {
      const csv = exportPoliciesCsv(samplePolicies);
      expect(csv).toContain('POL-LIFE-2081-01');
      expect(csv).toContain('राम बहादुर चौधरी');
      expect(csv).toContain('200000.00');
    });

    it('exports claims CSV with detailed breakdown', () => {
      const csv = exportClaimsCsv(sampleClaims);
      expect(csv).toContain('CLM-2081-01');
      expect(csv).toContain('सुनिता चौधरी');
      expect(csv).toContain('BOD-88-2081');
    });
  });
});
