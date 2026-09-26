import { describe, it, expect } from 'vitest';
import {
  MIN_OVERDUE_INTEREST_PAYMENT_RATIO,
  calculateMinInterestPayment,
  checkReschedulingEligibility,
  calculateRescheduledAmortization,
  generateReschedulingDeed,
  calculateRestructuredProvision,
  exportRescheduledLoansCsv,
  DistressReasonCategory,
  ReschedulingTerms,
  RescheduledLoanRecord,
} from '../loanRescheduling';
import { Loan, Member } from '../../types';

describe('loanRescheduling utility', () => {
  const mockMember: Member = {
    id: 'mem-101',
    memberNo: 'M-10023',
    name: 'राम बहादुर चौधरी',
    nameNepali: 'राम बहादुर चौधरी',
    email: 'ram.chaudhary@unako.coop',
    phone: '9844912345',
    citizenshipNo: '५२-०१-७२-०४३२१',
    joinedDate: '2078/04/12',
    address: 'गढवा गाउँपालिका वडा नं. ५, दाङ',
    wardNo: '५',
    status: 'VERIFIED',
    avatarUrl: '',
    shareCapital: 5000,
    totalSavings: 45000,
    activeLoanBalance: 350000,
    accruedDividend: 0,
    creditScore: 610,
    bankDetails: {
      bankName: 'Nepal Bank Ltd',
      accountNo: '0450123992',
      branch: 'Gadhwa',
      holderName: 'Ram Bahadur Chaudhary',
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
    id: 'loan-201',
    loanNo: 'LN-2080-045',
    memberId: 'mem-101',
    loanType: 'Agricultural & Livestock',
    principalAmount: 500000,
    remainingBalance: 350000,
    interestRate: 13.5,
    tenureMonths: 36,
    monthlyEmi: 16965,
    disbursedDate: '2080/01/15',
    nextDueDate: '2081/03/15',
    status: 'OVERDUE',
    collateralDescription: 'जग्गा कित्ता नं. २३४, गढवा-५ दाङ, क्षेत्रफल ०-५-०-० बिघा',
    collateralValue: 800000,
    collateralOwner: 'राम बहादुर चौधरी',
  };

  describe('Eligibility Gate (Cooperative Act 2074 Rules)', () => {
    it('calculates 25% minimum required overdue interest payment', () => {
      const accruedInterest = 40000;
      const minRequired = calculateMinInterestPayment(accruedInterest);
      expect(minRequired).toBe(10000); // 25% of 40,000
      expect(MIN_OVERDUE_INTEREST_PAYMENT_RATIO).toBe(0.25);
    });

    it('rejects eligibility if interest paid is less than 25% of overdue interest', () => {
      const remainingBalance = 350000;
      const accruedInterest = 40000;
      const interestPaid = 8000; // Only 20%
      const distressReason: DistressReasonCategory = 'FLOOD_NATURAL_DISASTER';

      const result = checkReschedulingEligibility(
        remainingBalance,
        accruedInterest,
        interestPaid,
        distressReason,
        true
      );

      expect(result.isEligible).toBe(false);
      expect(result.shortfallAmount).toBe(2000); // 10000 - 8000
      expect(result.reasons.some((r) => r.includes('२५%') || r.includes('25%'))).toBe(true);
    });

    it('rejects eligibility if revival plan is missing or distress reason is not provided', () => {
      const result = checkReschedulingEligibility(
        350000,
        40000,
        15000, // > 25%
        undefined,
        false // missing revival plan
      );

      expect(result.isEligible).toBe(false);
      expect(result.reasons.length).toBeGreaterThanOrEqual(2);
    });

    it('approves eligibility when >=25% interest paid, valid distress reason, and revival plan provided', () => {
      const result = checkReschedulingEligibility(
        350000,
        40000,
        12000, // 30%
        'AGRICULTURAL_LIVESTOCK_LOSS',
        true
      );

      expect(result.isEligible).toBe(true);
      expect(result.shortfallAmount).toBe(0);
      expect(result.interestPaymentRatio).toBeCloseTo(0.3, 2);
    });
  });

  describe('Re-amortization Schedule Calculation', () => {
    it('calculates standard amortization schedule with equal monthly installments (EMI)', () => {
      const principal = 350000;
      const rate = 12.0; // 12% p.a. -> 1% per month
      const tenureMonths = 12;
      const moratoriumMonths = 0;

      const schedule = calculateRescheduledAmortization(
        principal,
        rate,
        tenureMonths,
        moratoriumMonths,
        '2081/07/01'
      );

      expect(schedule.length).toBe(12);
      expect(schedule[0].installmentNo).toBe(1);
      expect(schedule[0].openingBalance).toBe(350000);
      expect(schedule[0].isMoratorium).toBe(false);

      // Verify final installment brings balance to near zero
      const last = schedule[11];
      expect(last.installmentNo).toBe(12);
      expect(last.closingBalance).toBeLessThanOrEqual(1); // rounding tolerance <= NPR 1
    });

    it('supports moratorium grace period where principal repayment is suspended', () => {
      const principal = 300000;
      const rate = 12.0; // 1% per month = 3000 interest
      const tenureMonths = 12;
      const moratoriumMonths = 3;

      const schedule = calculateRescheduledAmortization(
        principal,
        rate,
        tenureMonths,
        moratoriumMonths,
        '2081/07/01',
        'PAY_INTEREST_MONTHLY'
      );

      expect(schedule.length).toBe(12);

      // Months 1, 2, 3 should be moratorium months
      for (let i = 0; i < 3; i++) {
        expect(schedule[i].isMoratorium).toBe(true);
        expect(schedule[i].principalPayment).toBe(0);
        expect(schedule[i].interestPayment).toBe(3000);
        expect(schedule[i].closingBalance).toBe(300000);
      }

      // Month 4 onwards should amortize principal
      expect(schedule[3].isMoratorium).toBe(false);
      expect(schedule[3].principalPayment).toBeGreaterThan(0);
      expect(schedule[11].closingBalance).toBeLessThanOrEqual(1);
    });
  });

  describe('Restructuring Deed Generation', () => {
    it('generates a complete bilingual statutory deed with cooperative governance minutes', () => {
      const terms: ReschedulingTerms = {
        restructuredDate: '2081/07/01',
        restructuredPrincipal: 350000,
        annualInterestRate: 11.5,
        extendedTenureMonths: 24,
        moratoriumMonths: 2,
        moratoriumInterestHandling: 'PAY_INTEREST_MONTHLY',
        distressReason: 'FLOOD_NATURAL_DISASTER',
        distressDescription: 'राप्ती नदीको बाढीले धानबाली र बाख्रा गोठ पूर्ण क्षति भएको।',
        revivalPlanSummary: 'तरकारी खेती र स्थानीय कुखुरा पालनबाट मासिक रु. २५,००० आम्दानी गर्ने योजना।',
        creditCommitteeMinuteNo: 'CC-2081-34',
        bodDecisionMinuteNo: 'BOD-2081-112',
        officerName: 'सुमन शर्मा (ऋण अधिकृत)',
      };

      const schedule = calculateRescheduledAmortization(
        terms.restructuredPrincipal,
        terms.annualInterestRate,
        terms.extendedTenureMonths,
        terms.moratoriumMonths
      );

      const deed = generateReschedulingDeed(mockLoan, mockMember, terms, schedule);

      expect(deed.deedNo).toContain('RESTRUCT');
      expect(deed.borrowerName).toBe(mockMember.name);
      expect(deed.borrowerMemberNo).toBe(mockMember.memberNo);
      expect(deed.distressReasonNepali).toContain('प्राकृतिक प्रकोप');
      expect(deed.creditCommitteeMinuteNo).toBe('CC-2081-34');
      expect(deed.bodDecisionMinuteNo).toBe('BOD-2081-112');
      expect(deed.monthlyEmi).toBeGreaterThan(0);
      expect(deed.bodyNepaliText).toContain('सहकारी ऐन २०७४');
      expect(deed.bodyNepaliText).toContain('राप्ती नदीको बाढी');
    });
  });

  describe('Statutory Provision Calculation upon Restructuring', () => {
    it('applies statutory 12.5% provision for restructured loans under probation', () => {
      const provision = calculateRestructuredProvision(350000, 'SUBSTAND');
      expect(provision.statutoryProvisionPercent).toBe(12.5);
      expect(provision.provisionAmount).toBe(43750); // 350,000 * 12.5%
      expect(provision.probationMonths).toBe(6);
    });

    it('maintains 25% minimum provision if restructured from doubtful or bad debt', () => {
      const provision = calculateRestructuredProvision(350000, 'DOUBTFUL');
      expect(provision.statutoryProvisionPercent).toBe(25.0);
      expect(provision.provisionAmount).toBe(87500); // 350,000 * 25%
    });
  });

  describe('CSV Register Export', () => {
    it('exports rescheduled loans to well-formed CSV with headers and records', () => {
      const records: RescheduledLoanRecord[] = [
        {
          deedNo: 'RESTRUCT-2081-001',
          loanNo: 'LN-2080-045',
          memberNo: 'M-10023',
          memberName: 'राम बहादुर चौधरी',
          distressReason: 'FLOOD_NATURAL_DISASTER',
          oldPrincipal: 350000,
          newPrincipal: 350000,
          newRate: 11.5,
          extendedTenure: 24,
          moratoriumMonths: 2,
          revisedEmi: 16500,
          bodMinuteNo: 'BOD-2081-112',
          restructuredDate: '2081/07/01',
          status: 'ACTIVE_PROBATION',
        },
      ];

      const csv = exportRescheduledLoansCsv(records);
      expect(csv).toContain('Deed No,Loan No,Member No');
      expect(csv).toContain('RESTRUCT-2081-001');
      expect(csv).toContain('राम बहादुर चौधरी');
      expect(csv).toContain('BOD-2081-112');
    });
  });
});
