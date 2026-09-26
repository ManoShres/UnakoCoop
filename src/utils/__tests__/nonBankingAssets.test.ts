/**
 * Non-Banking Assets (NBA) Acquisition & Settlement Test Suite
 * Unako SACCOS (गढवा-५, दाङ) - Cooperative Act 2074 (दफा ८४)
 */
import { describe, it, expect } from 'vitest';
import {
  computeNbaAcquisition,
  generateNbaJournalVoucher,
  generateLandRevenueTransferLetter,
  calculateNbaDisposalSettlement,
  exportNbaRegisterCsv,
  NbaCollateralInfo,
  NbaRecord,
} from '../nonBankingAssets';
import { Loan, Member } from '../../types';

describe('nonBankingAssets utility', () => {
  const mockMember: Member = {
    id: 'mem-202',
    memberNo: 'UK-M-0245',
    name: 'कमल प्रसाद चौधरी',
    nameNepali: 'कमल प्रसाद चौधरी',
    email: 'kamal.chaudhary@example.com',
    citizenshipNo: '५२-०१-७०-०८२३१',
    phone: '9844912345',
    address: 'गढवा गाउँपालिका वडा नं. ५, दाङ',
    wardNo: '५',
    joinedDate: '2077-02-10',
    status: 'VERIFIED',
    avatarUrl: '',
    shareCapital: 10000,
    totalSavings: 20000,
    activeLoanBalance: 600000,
    accruedDividend: 0,
    creditScore: 520,
    bankDetails: {
      bankName: 'Nepal Bank Ltd',
      accountNo: '0450123992',
      branch: 'Gadhwa',
      holderName: 'Kamal Prasad Chaudhary',
    },
    kycDocuments: {
      citizenshipFront: true,
      citizenshipBack: true,
      photo: true,
      signature: true,
      utilityBill: true,
    },
  };

  const mockLoan: Loan = {
    id: 'loan-303',
    loanNo: 'LN-2079-089',
    memberId: 'mem-202',
    loanType: 'Small Business Enterprise',
    principalAmount: 800000,
    remainingBalance: 600000,
    interestRate: 14.0,
    tenureMonths: 36,
    monthlyEmi: 27340,
    disbursedDate: '2079-04-15',
    nextDueDate: '2080-08-15',
    status: 'OVERDUE',
    collateralDescription: 'जग्गा कित्ता नं. ४१२, गढवा-५ दाङ, क्षेत्रफल ०-१०-०-० बिघा',
    collateralValue: 900000,
    collateralOwner: 'कमल प्रसाद चौधरी',
  };

  const mockCollateral: NbaCollateralInfo = {
    kittaNo: '४१२',
    sheetNo: '१२-ख',
    district: 'दाङ',
    municipality: 'गढवा गाउँपालिका',
    wardNo: '५',
    areaDesc: '०-१०-०-० बिघा',
    originalOwnerName: 'कमल प्रसाद चौधरी',
    originalOwnerCitizenship: '५२-०१-७०-०८२३१',
    boundaries: {
      north: 'राम बहादुरको जग्गा',
      south: 'मूल सडक (बाटो)',
      east: 'श्याम थारुको कित्ता',
      west: 'सिंचाई कुलो',
    },
  };

  describe('NBA Acquisition Calculation', () => {
    it('accurately computes acquisition value, 100% provision, and surplus escrow when collateral value exceeds claim', () => {
      const assessedDistressValue = 750000;
      const legalCosts = 25000;
      const accruedInterest = 80000;

      const assessment = computeNbaAcquisition(
        mockLoan,
        mockMember,
        assessedDistressValue,
        legalCosts,
        accruedInterest
      );

      // Total Claim = 600,000 + 80,000 + 25,000 = 705,000
      expect(assessment.totalClaimPayable).toBe(705000);
      expect(assessment.acquisitionAmount).toBe(705000);
      expect(assessment.statutory100PercentProvision).toBe(705000); // 100% provision required
      expect(assessment.surplusEscrowSuspense).toBe(45000); // 750,000 - 705,000 surplus to be held for member
      expect(assessment.shortfallRemainingDebt).toBe(0);
    });

    it('accurately computes shortfall remaining debt when collateral distress value is lower than claim', () => {
      const assessedDistressValue = 650000;
      const legalCosts = 20000;
      const accruedInterest = 90000;

      const assessment = computeNbaAcquisition(
        mockLoan,
        mockMember,
        assessedDistressValue,
        legalCosts,
        accruedInterest
      );

      // Total Claim = 600,000 + 90,000 + 20,000 = 710,000
      expect(assessment.totalClaimPayable).toBe(710000);
      // Acquisition is capped at the distressed collateral value
      expect(assessment.acquisitionAmount).toBe(650000);
      expect(assessment.statutory100PercentProvision).toBe(650000);
      expect(assessment.surplusEscrowSuspense).toBe(0);
      expect(assessment.shortfallRemainingDebt).toBe(60000); // 710,000 - 650,000 unrecovered personal liability
    });
  });

  describe('NBA Journal Voucher Generation', () => {
    it('creates a balanced double-entry accounting voucher with 100% statutory provisioning entries', () => {
      const assessment = computeNbaAcquisition(mockLoan, mockMember, 705000, 25000, 80000);
      const voucher = generateNbaJournalVoucher(assessment, '2081/06/20');

      expect(voucher.voucherNo).toContain('JV-NBA');
      expect(voucher.totalDebit).toBe(voucher.totalCredit);
      expect(voucher.totalDebit).toBeGreaterThan(0);

      // Check debit to NBA asset account
      const nbaDebit = voucher.entries.find((e) => e.acCode === '1201-NBA');
      expect(nbaDebit).toBeDefined();
      expect(nbaDebit?.debit).toBe(assessment.acquisitionAmount);

      // Check credit to Loan Principal
      const loanCredit = voucher.entries.find((e) => e.acCode === '1105-LOAN-PRINCIPAL');
      expect(loanCredit).toBeDefined();
      expect(loanCredit?.credit).toBe(mockLoan.remainingBalance);

      // Check 100% statutory provision booking
      const provDebit = voucher.entries.find((e) => e.acCode === '5102-LOAN-LOSS-EXPENSE');
      const provCredit = voucher.entries.find((e) => e.acCode === '2105-NBA-PROVISION-RESERVE');
      expect(provDebit?.debit).toBe(assessment.statutory100PercentProvision);
      expect(provCredit?.credit).toBe(assessment.statutory100PercentProvision);
    });
  });

  describe('Land Revenue Transfer Letter Generation', () => {
    it('generates formal Malpot Karyalaya requisition letter citing Cooperative Act 2074 Sec 84', () => {
      const assessment = computeNbaAcquisition(mockLoan, mockMember, 705000, 25000, 80000);
      const letter = generateLandRevenueTransferLetter(
        assessment,
        mockCollateral,
        'BOD-2081-125',
        '2081/06/25'
      );

      expect(letter.referenceNo).toContain('UNAKO/LEGAL/');
      expect(letter.officeName).toContain('मालपोत कार्यालय');
      expect(letter.subject).toContain('धितो लिलाम सकार');
      expect(letter.bodyNepaliText).toContain('सहकारी ऐन २०७४ को दफा ८४');
      expect(letter.bodyNepaliText).toContain('कित्ता नं. ४१२');
      expect(letter.bodyNepaliText).toContain('कमल प्रसाद चौधरी');
      expect(letter.bodyNepaliText).toContain('उनको बचत तथा ऋण सहकारी संस्था लि.');
    });
  });

  describe('NBA Subsequent Disposal Settlement', () => {
    it('calculates profit or loss and reversal of 100% provision when NBA is liquidated via tender', () => {
      const nbaBookValue = 700000;
      const saleGrossProceeds = 850000;
      const disposalCosts = 30000;

      const settlement = calculateNbaDisposalSettlement(
        nbaBookValue,
        saleGrossProceeds,
        disposalCosts
      );

      // Net proceeds = 850,000 - 30,000 = 820,000
      expect(settlement.netProceeds).toBe(820000);
      expect(settlement.isGain).toBe(true);
      expect(settlement.gainLossOnDisposal).toBe(120000); // 820,000 - 700,000
      expect(settlement.provisionReversalAmount).toBe(700000); // 100% provision is written back to income
    });
  });

  describe('CSV Export for NBA Register', () => {
    it('exports complete NBA register records to CSV format for audit and COPOMIS', () => {
      const records: NbaRecord[] = [
        {
          assetId: 'NBA-2081-01',
          loanNo: 'LN-2079-089',
          borrowerName: 'कमल प्रसाद चौधरी',
          borrowerMemberNo: 'UK-M-0245',
          kittaNo: '४१२',
          areaDesc: '०-१०-०-० बिघा',
          district: 'दाङ',
          municipality: 'गढवा गाउँपालिका-५',
          acquisitionDateBS: '2081/06/20',
          acquisitionAmount: 705000,
          statutoryProvisionAmount: 705000,
          status: 'ACQUIRED_IN_POSSESSION',
          holdingExpiryDateBS: '2084/06/20',
        },
      ];

      const csv = exportNbaRegisterCsv(records);
      expect(csv).toContain('Asset ID,Loan No,Borrower Member No');
      expect(csv).toContain('NBA-2081-01');
      expect(csv).toContain('कमल प्रसाद चौधरी');
      expect(csv).toContain('705000');
    });
  });
});
