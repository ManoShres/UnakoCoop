import { describe, it, expect } from 'vitest';
import {
  checkBlacklistEligibility,
  evaluateCibInquiry,
  generateBlacklistNoticeText,
  generateDelistingClearanceCertificate,
  exportCibBatchCsv,
  CibBlacklistRecord,
} from '../cibRegulatoryEngine';
import { Loan } from '../../types';

describe('cibRegulatoryEngine - Cooperative Credit Information Bureau (CIB)', () => {
  describe('checkBlacklistEligibility', () => {
    it('approves eligibility when loan overdue exceeds 90 days', () => {
      const res = checkBlacklistEligibility({ remainingBalance: 150000, status: 'OVERDUE' }, 120);
      expect(res.isEligible).toBe(true);
      expect(res.reasonNepali).toContain('९० दिन');
    });

    it('denies eligibility when overdue is within regulatory cure period (<90 days)', () => {
      const res = checkBlacklistEligibility({ remainingBalance: 150000, status: 'OVERDUE' }, 45);
      expect(res.isEligible).toBe(false);
      expect(res.reason).toContain('Within regulatory cure period');
    });

    it('denies eligibility when loan balance is zero', () => {
      const res = checkBlacklistEligibility({ remainingBalance: 0, status: 'PAID_OFF' }, 150);
      expect(res.isEligible).toBe(false);
      expect(res.reason).toContain('paid off');
    });
  });

  describe('evaluateCibInquiry', () => {
    it('evaluates clean borrower with high score and low risk', () => {
      const cleanLoans: Loan[] = [
        {
          id: 'L-1',
          loanNo: 'LN-01',
          loanType: 'Agricultural & Livestock',
          principalAmount: 100000,
          remainingBalance: 40000,
          interestRate: 11.5,
          tenureMonths: 24,
          monthlyEmi: 4500,
          disbursedDate: '2080/01/01',
          nextDueDate: '2081/09/01',
          status: 'ACTIVE',
          collateralDescription: 'Lalpurja',
        },
      ];

      const res = evaluateCibInquiry(
        { id: 'm-1', name: 'राम बहादुर', citizenshipNo: '52-01-72-0012' },
        cleanLoans
      );

      expect(res.creditScore).toBeGreaterThanOrEqual(750);
      expect(res.riskGrade).toBe('LOW_RISK');
      expect(res.hasActiveDefault).toBe(false);
      expect(res.isBlacklisted).toBe(false);
    });

    it('flags borrower with active overdue default as critical risk', () => {
      const overdueLoans: Loan[] = [
        {
          id: 'L-2',
          loanNo: 'LN-02',
          loanType: 'Small Business Enterprise',
          principalAmount: 300000,
          remainingBalance: 250000,
          interestRate: 13.5,
          tenureMonths: 36,
          monthlyEmi: 9500,
          disbursedDate: '2079/01/01',
          nextDueDate: '2080/06/01',
          status: 'OVERDUE',
          collateralDescription: 'Shop inventory',
        },
      ];

      const res = evaluateCibInquiry(
        { id: 'm-2', name: 'गोपाल खड्का', citizenshipNo: '52-01-74-0099' },
        overdueLoans
      );

      expect(res.hasActiveDefault).toBe(true);
      expect(res.isBlacklisted).toBe(true);
      expect(res.riskGrade).toBe('CRITICAL_DEFAULT');
      expect(res.inquirySummaryNepali).toContain('कालोसूची');
    });
  });

  const sampleBlacklistRecord: CibBlacklistRecord = {
    id: 'BL-01',
    blacklistNo: 'CIB-BL-2081-01',
    memberId: 'm-99',
    memberNo: 'M-099',
    memberName: 'गोपाल खड्का',
    citizenshipNo: '52-01-74-0099',
    panNo: '601998822',
    loanId: 'L-2',
    loanNo: 'LN-02',
    loanType: 'Small Business Enterprise',
    defaultedPrincipal: 250000,
    accruedInterest: 45000,
    totalOverdueAmount: 295000,
    daysOverdue: 180,
    status: 'NOTICE_ISSUED_35_DAYS',
    boardDecisionNo: 'BOD-RES-92/2081',
    noticePublishedDateBS: '2081/08/15',
    guarantorName: 'हरि शरण खड्का',
    guarantorCitizenship: '52-01-70-0011',
    guarantorPhone: '9847112233',
  };

  describe('generateBlacklistNoticeText', () => {
    it('generates statutory 35-day formal warning notice text', () => {
      const notice = generateBlacklistNoticeText(sampleBlacklistRecord, '35_DAYS');
      expect(notice).toContain('३५ (पैँतिस) दिने');
      expect(notice).toContain('गोपाल खड्का');
      expect(notice).toContain('हरि शरण खड्का');
      expect(notice).toContain('सहकारी ऐन २०७४ को दफा ८१');
    });

    it('generates final 15-day notice text', () => {
      const notice = generateBlacklistNoticeText(sampleBlacklistRecord, '15_DAYS');
      expect(notice).toContain('१५ (पन्ध्र) दिने');
    });
  });

  describe('generateDelistingClearanceCertificate', () => {
    it('generates official Form 82 clearance certificate with valid hash', () => {
      const cert = generateDelistingClearanceCertificate(sampleBlacklistRecord, 295000);
      expect(cert.certificateNo).toContain('CIB-CLR-LN-02-M-099');
      expect(cert.memberName).toBe('गोपाल खड्का');
      expect(cert.totalClearedAmount).toBe(295000);
      expect(cert.verificationHash).toMatch(/^CIB-DELIST-[0-9A-F]{8}$/);
    });
  });

  describe('exportCibBatchCsv', () => {
    it('exports CIB compliant CSV format with properly escaped fields', () => {
      const csv = exportCibBatchCsv([sampleBlacklistRecord]);
      expect(csv).toContain('CIB-BL-2081-01');
      expect(csv).toContain('गोपाल खड्का');
      expect(csv).toContain('250000.00');
      expect(csv).toContain('BOD-RES-92/2081');
    });
  });
});
