import { describe, it, expect } from 'vitest';
import {
  validateChequePresentation,
  issueChequeBook,
  processChequeBounce,
  generateChequeCopasVoucher,
  exportChequeClearingToCsv,
  ChequeTransactionRecord,
} from '../chequeClearingEngine';

describe('chequeClearingEngine', () => {
  describe('validateChequePresentation', () => {
    it('validates a normal cheque with sufficient funds', () => {
      const result = validateChequePresentation({
        chequeNo: '042101',
        amount: 25000,
        chequeDateBs: '2081-06-01',
        presentedDateBs: '2081-06-03',
        accountBalance: 50000,
        chequeStatus: 'UNUSED',
      });

      expect(result.isValid).toBe(true);
      expect(result.canClear).toBe(true);
      expect(result.recommendedAction).toBe('CLEAR');
      expect(result.errors).toHaveLength(0);
    });

    it('rejects cheque when marked as STOP_PAYMENT', () => {
      const result = validateChequePresentation({
        chequeNo: '042105',
        amount: 30000,
        chequeDateBs: '2081-06-01',
        presentedDateBs: '2081-06-03',
        accountBalance: 100000,
        chequeStatus: 'STOP_PAYMENT',
        stopReason: 'LOST_OR_STOLEN',
      });

      expect(result.isValid).toBe(false);
      expect(result.canClear).toBe(false);
      expect(result.recommendedAction).toBe('REJECT_STOPPED');
      expect(result.errors.some((e) => e.includes('भुक्तानी रोक्का'))).toBe(true);
    });

    it('rejects already cleared cheques', () => {
      const result = validateChequePresentation({
        chequeNo: '042101',
        amount: 10000,
        chequeDateBs: '2081-06-01',
        presentedDateBs: '2081-06-02',
        accountBalance: 50000,
        chequeStatus: 'CLEARED',
      });

      expect(result.canClear).toBe(false);
      expect(result.errors.some((e) => e.includes('पहिले नै भुक्तानी'))).toBe(true);
    });

    it('identifies post-dated cheques (PDC)', () => {
      const result = validateChequePresentation({
        chequeNo: '042110',
        amount: 20000,
        chequeDateBs: '2081-07-01',
        presentedDateBs: '2081-06-01',
        accountBalance: 80000,
      });

      expect(result.canClear).toBe(false);
      expect(result.isPostDated).toBe(true);
      expect(result.recommendedAction).toBe('REJECT_POST_DATED');
    });

    it('flags stale cheques older than 6 months (180 days)', () => {
      const result = validateChequePresentation({
        chequeNo: '042112',
        amount: 15000,
        chequeDateBs: '2080-11-01',
        presentedDateBs: '2081-06-01', // > 7 months later
        accountBalance: 60000,
      });

      expect(result.canClear).toBe(false);
      expect(result.isStale).toBe(true);
      expect(result.recommendedAction).toBe('REJECT_STALE');
    });

    it('flags insufficient funds for bounce action', () => {
      const result = validateChequePresentation({
        chequeNo: '042115',
        amount: 150000,
        chequeDateBs: '2081-06-01',
        presentedDateBs: '2081-06-02',
        accountBalance: 20000, // Insufficient!
      });

      expect(result.canClear).toBe(false);
      expect(result.hasInsufficientFunds).toBe(true);
      expect(result.recommendedAction).toBe('BOUNCE_INSUFFICIENT');
    });
  });

  describe('issueChequeBook', () => {
    it('computes proper end leaf number and creates active record', () => {
      const book = issueChequeBook({
        accountNo: 'SAV-00101-01',
        memberId: 'm-101',
        memberNo: 'MBR-00101',
        memberName: 'राम बहादुर श्रेष्ठ',
        startLeafNo: 50001,
        totalLeaves: 25,
        issuedDateBs: '2081-06-05',
        issuedDateAd: '2024-09-20',
        issuedByStaffName: 'सन्तोष यादव',
        branch: 'गढवा मुख्य शाखा',
      });

      expect(book.startLeafNo).toBe(50001);
      expect(book.endLeafNo).toBe(50025);
      expect(book.totalLeaves).toBe(25);
      expect(book.status).toBe('ACTIVE');
    });
  });

  describe('processChequeBounce', () => {
    it('increments bounce count and generates proper legal notice', () => {
      const cheque: ChequeTransactionRecord = {
        id: 'tx-test',
        chequeNo: '042120',
        accountNo: 'SAV-00101-01',
        memberId: 'm-101',
        memberNo: 'MBR-00101',
        memberName: 'राम बहादुर श्रेष्ठ',
        payeeName: 'गंगा ट्रेडर्स',
        amount: 80000,
        chequeDateBs: '2081-06-01',
        presentedDateBs: '2081-06-02',
        clearingType: 'COUNTER_WITHDRAWAL',
        status: 'PRESENTED',
        isAccountPayee: false,
        bounceCount: 0,
      };

      // 1st bounce
      const firstBounce = processChequeBounce(cheque, 'अपर्याप्त मौज्दात');
      expect(firstBounce.updatedCheque.bounceCount).toBe(1);
      expect(firstBounce.isBlacklistWarningTriggered).toBe(false);
      expect(firstBounce.legalNoticeNe).toContain('प्रथम पटक');

      // 3rd bounce
      const secondBounceCheque = { ...cheque, bounceCount: 2 };
      const thirdBounce = processChequeBounce(secondBounceCheque, 'अपर्याप्त मौज्दात');
      expect(thirdBounce.updatedCheque.bounceCount).toBe(3);
      expect(thirdBounce.isBlacklistWarningTriggered).toBe(true);
      expect(thirdBounce.legalNoticeNe).toContain('कर्जा सूचना केन्द्र (CIB) को कालोसूची');
    });
  });

  describe('generateChequeCopasVoucher', () => {
    it('generates a balanced double-entry voucher for cash counter withdrawal', () => {
      const cheque: ChequeTransactionRecord = {
        id: 'tx-001',
        chequeNo: '042101',
        accountNo: 'SAV-00101-01',
        memberId: 'm-101',
        memberNo: 'MBR-00101',
        memberName: 'राम बहादुर श्रेष्ठ',
        payeeName: 'कृष्ण खड्का',
        amount: 35000,
        chequeDateBs: '2081-06-01',
        presentedDateBs: '2081-06-02',
        clearingType: 'COUNTER_WITHDRAWAL',
        status: 'CLEARED',
        isAccountPayee: false,
        bounceCount: 0,
      };

      const voucher = generateChequeCopasVoucher(cheque, '2081/82');
      expect(voucher.totalDebit).toBe(35000);
      expect(voucher.totalCredit).toBe(35000);
      expect(voucher.entries.some((e) => e.glCode === '2101' && e.debitAmount === 35000)).toBe(true);
      expect(voucher.entries.some((e) => e.glCode === '1101' && e.creditAmount === 35000)).toBe(true);
    });
  });

  describe('exportChequeClearingToCsv', () => {
    it('generates CSV with required headers and values', () => {
      const cheque: ChequeTransactionRecord = {
        id: 'tx-001',
        chequeNo: '042101',
        accountNo: 'SAV-00101-01',
        memberId: 'm-101',
        memberNo: 'MBR-00101',
        memberName: 'राम बहादुर श्रेष्ठ',
        payeeName: 'कृष्ण खड्का',
        amount: 35000,
        chequeDateBs: '2081-06-01',
        presentedDateBs: '2081-06-02',
        clearingType: 'COUNTER_WITHDRAWAL',
        status: 'CLEARED',
        isAccountPayee: false,
        bounceCount: 0,
      };

      const csv = exportChequeClearingToCsv([cheque]);
      expect(csv).toContain('चेक नं. (Cheque No)');
      expect(csv).toContain('042101');
      expect(csv).toContain('35000');
    });
  });
});
