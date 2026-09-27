import { describe, it, expect } from 'vitest';
import {
  validateWelfareClaim,
  calculateNomineeSettlement,
  generateWelfareCopasVoucher,
  exportWelfareClaimsToCsv,
  WELFARE_STANDARD_BENEFITS,
  WelfareClaimRecord,
} from '../memberWelfareEngine';

describe('memberWelfareEngine', () => {
  describe('validateWelfareClaim', () => {
    it('validates a correct member death claim with all required fields', () => {
      const validClaim: Partial<WelfareClaimRecord> = {
        memberNo: 'MBR-00104',
        memberName: 'कमल प्रसाद शर्मा',
        claimType: 'MEMBER_DEATH',
        claimAmount: 35000,
        nomineeName: 'राधा शर्मा',
        nomineeRelation: 'श्रीमती (Wife)',
        wardDeathCertNo: 'ग.गा.पा.-५-दर्ता-२१४',
      };

      const result = validateWelfareClaim(validClaim);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects claim when member details are missing', () => {
      const result = validateWelfareClaim({
        claimType: 'MATERNITY_ALLOWANCE',
        claimAmount: 5000,
        nomineeName: 'सुनिता',
        nomineeRelation: 'Self',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('सदस्य नम्बर अनिवार्य छ'))).toBe(true);
      expect(result.errors.some((e) => e.includes('सदस्यको नाम अनिवार्य छ'))).toBe(true);
    });

    it('rejects claim when claim amount exceeds standard maximum limit', () => {
      const maxMaternity = WELFARE_STANDARD_BENEFITS.MATERNITY_ALLOWANCE.maxLimit;
      const result = validateWelfareClaim({
        memberNo: 'MBR-00102',
        memberName: 'सुनिता कुमारी चौधरी',
        claimType: 'MATERNITY_ALLOWANCE',
        claimAmount: maxMaternity + 5000,
        nomineeName: 'सुनिता कुमारी चौधरी',
        nomineeRelation: 'Self',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('अधिकतम मापदण्ड'))).toBe(true);
    });

    it('requires death registration certificate for member death and funeral claims', () => {
      const result = validateWelfareClaim({
        memberNo: 'MBR-00115',
        memberName: 'भेषराज पाण्डे',
        claimType: 'MEMBER_DEATH',
        claimAmount: 35000,
        nomineeName: 'गंगा पाण्डे',
        nomineeRelation: 'छोरा (Son)',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('मृत्यु दर्ता नम्बर उल्लेख हुनुपर्छ'))).toBe(true);
    });

    it('requires hospital or health post name for critical illness relief', () => {
      const result = validateWelfareClaim({
        memberNo: 'MBR-00108',
        memberName: 'दिलमाया गुरुङ',
        claimType: 'CRITICAL_ILLNESS',
        claimAmount: 20000,
        nomineeName: 'दिलमाया गुरुङ',
        nomineeRelation: 'Self',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('अस्पताल वा स्वास्थ्य संस्थाको नाम'))).toBe(true);
    });
  });

  describe('calculateNomineeSettlement', () => {
    it('calculates full deceased member settlement with loan waiver offset correctly', () => {
      const settlement = calculateNomineeSettlement({
        memberId: 'm-104',
        memberNo: 'MBR-00104',
        memberName: 'कमल प्रसाद शर्मा',
        nomineeName: 'राधा शर्मा',
        nomineeRelation: 'श्रीमती (Wife)',
        shareBalance: 50000,
        savingsBalance: 120000,
        accruedInterest: 4500,
        accruedDividend: 6000,
        deathReliefAmount: 35000,
        funeralAllowance: 10000,
        outstandingLoanPrincipal: 60000,
        outstandingLoanInterest: 5000,
        loanWaiverAmount: 65000, // 100% waiver from welfare fund
      });

      // Gross Assets = 50000 + 120000 + 4500 + 6000 + 35000 + 10000 = 225500
      expect(settlement.grossAssetsDue).toBe(225500);
      expect(settlement.grossLoanLiability).toBe(65000);
      expect(settlement.approvedLoanWaiver).toBe(65000);
      expect(settlement.netLoanLiability).toBe(0);
      expect(settlement.netNomineePayable).toBe(225500);
      expect(settlement.lineItems.length).toBeGreaterThan(6);
      expect(settlement.legalNoticeNe).toContain('कमल प्रसाद शर्मा');
      expect(settlement.legalNoticeNe).toContain('राधा शर्मा');
    });

    it('deducts remaining loan liability when loan waiver is partial', () => {
      const settlement = calculateNomineeSettlement({
        memberId: 'm-200',
        memberNo: 'MBR-00200',
        memberName: 'हरि बहादुर थापा',
        nomineeName: 'गीता थापा',
        nomineeRelation: 'श्रीमती',
        shareBalance: 20000,
        savingsBalance: 30000,
        accruedInterest: 1000,
        accruedDividend: 2000,
        deathReliefAmount: 35000,
        funeralAllowance: 10000,
        outstandingLoanPrincipal: 80000,
        outstandingLoanInterest: 10000,
        loanWaiverAmount: 50000, // Partial waiver
      });

      // Gross Assets = 20000 + 30000 + 1000 + 2000 + 35000 + 10000 = 98000
      // Gross Loan = 90000, Waiver = 50000 => Net Loan = 40000
      // Net Payable = 98000 - 40000 = 58000
      expect(settlement.grossAssetsDue).toBe(98000);
      expect(settlement.netLoanLiability).toBe(40000);
      expect(settlement.netNomineePayable).toBe(58000);
    });
  });

  describe('generateWelfareCopasVoucher', () => {
    it('generates a balanced double-entry voucher for cash disbursement', () => {
      const claim: WelfareClaimRecord = {
        id: 'claim-test-1',
        claimNo: 'MW-TEST-001',
        memberId: 'm-115',
        memberNo: 'MBR-00115',
        memberName: 'भेषराज पाण्डे',
        claimType: 'FUNERAL_EXPENSE',
        claimAmount: 10000,
        eventDate: '2081-06-01',
        nomineeName: 'गंगा पाण्डे',
        nomineeRelation: 'छोरा (Son)',
        nomineeCitizenshipNo: '52-01-76-00412',
        nomineeContact: '9809876543',
        status: 'DISBURSED',
        disbursementMethod: 'CASH',
        createdAt: '2026-09-17T14:20:00Z',
      };

      const voucher = generateWelfareCopasVoucher(claim, '2081/82');
      expect(voucher.totalDebit).toBe(10000);
      expect(voucher.totalCredit).toBe(10000);
      expect(voucher.entries.some((e) => e.glCode === '3104' && e.debitAmount === 10000)).toBe(true);
      expect(voucher.entries.some((e) => e.glCode === '1101' && e.creditAmount === 10000)).toBe(true);
    });

    it('generates balanced loan waiver entries when loan liability is settled', () => {
      const claim: WelfareClaimRecord = {
        id: 'claim-test-2',
        claimNo: 'MW-TEST-002',
        memberId: 'm-104',
        memberNo: 'MBR-00104',
        memberName: 'कमल प्रसाद शर्मा',
        claimType: 'MEMBER_DEATH',
        claimAmount: 35000,
        eventDate: '2081-05-02',
        nomineeName: 'राधा शर्मा',
        nomineeRelation: 'श्रीमती (Wife)',
        nomineeCitizenshipNo: '52-01-70-01982',
        nomineeContact: '9867012345',
        loanAccountNo: 'LN-2080-049',
        outstandingLoanBalance: 65000,
        waivedLoanAmount: 65000,
        status: 'DISBURSED',
        disbursementMethod: 'BANK_TRANSFER',
        createdAt: '2026-08-18T11:15:00Z',
      };

      const voucher = generateWelfareCopasVoucher(claim, '2081/82');
      // Total Debit = 35000 (relief) + 65000 (waiver) = 100000
      // Total Credit = 35000 (bank transfer) + 65000 (loan principal credit) = 100000
      expect(voucher.totalDebit).toBe(100000);
      expect(voucher.totalCredit).toBe(100000);
      expect(voucher.entries.some((e) => e.glCode === '3105' && e.debitAmount === 65000)).toBe(true);
      expect(voucher.entries.some((e) => e.glCode === '1301' && e.creditAmount === 65000)).toBe(true);
    });
  });

  describe('exportWelfareClaimsToCsv', () => {
    it('produces valid CSV headers and records', () => {
      const claim: WelfareClaimRecord = {
        id: 'claim-101',
        claimNo: 'MW-2081/82-001',
        memberId: 'm-102',
        memberNo: 'MBR-00102',
        memberName: 'सुनिता कुमारी चौधरी',
        claimType: 'MATERNITY_ALLOWANCE',
        claimAmount: 5000,
        eventDate: '2081-04-12',
        nomineeName: 'सुनिता कुमारी चौधरी',
        nomineeRelation: 'स्वयम् (Self)',
        nomineeCitizenshipNo: '52-01-74-04128',
        nomineeContact: '9847891234',
        status: 'DISBURSED',
        disbursementMethod: 'SAVINGS_ACCOUNT',
        createdAt: '2026-07-28T09:30:00Z',
      };

      const csv = exportWelfareClaimsToCsv([claim]);
      expect(csv).toContain('दाबी नं. (Claim No)');
      expect(csv).toContain('MW-2081/82-001');
      expect(csv).toContain('सुनिता कुमारी चौधरी');
      expect(csv).toContain('5000');
    });
  });
});
