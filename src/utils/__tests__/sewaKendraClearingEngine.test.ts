import { describe, it, expect } from 'vitest';
import {
  calculateDenominationSum,
  reconcileSewaKendraDayBook,
  generateInterBranchClearingVoucher,
  exportSewaKendraClearingCsv,
  createDefaultSewaKendraRecords,
  DenominationCounts,
} from '../sewaKendraClearingEngine';

describe('sewaKendraClearingEngine', () => {
  const sampleDenoms: DenominationCounts = {
    n1000: 10,  // 10,000
    n500: 4,    // 2,000
    n100: 5,    // 500
    n50: 2,     // 100
    n20: 5,     // 100
    n10: 5,     // 50
    n5: 2,      // 10
    coins: 5,   // 5
  }; // Total = 12,765

  describe('calculateDenominationSum', () => {
    it('computes exact sum from denomination counts', () => {
      const sum = calculateDenominationSum(sampleDenoms);
      expect(sum).toBe(12765);
    });

    it('returns zero when all note counts are zero', () => {
      const zeroDenoms: DenominationCounts = {
        n1000: 0,
        n500: 0,
        n100: 0,
        n50: 0,
        n20: 0,
        n10: 0,
        n5: 0,
        coins: 0,
      };
      expect(calculateDenominationSum(zeroDenoms)).toBe(0);
    });
  });

  describe('reconcileSewaKendraDayBook', () => {
    it('accurately reconciles balanced day-book when physical cash equals calculated cash', () => {
      // Opening: 10,000
      // Receipts: 15,000 (Savings 10,000 + Loan 5,000)
      // Disbursements: 5,000 (Withdrawal 3,000 + Expense 2,000)
      // Expected Closing: 10,000 + 15,000 - 5,000 = 20,000
      const denoms: DenominationCounts = {
        n1000: 20, // 20,000
        n500: 0,
        n100: 0,
        n50: 0,
        n20: 0,
        n10: 0,
        n5: 0,
        coins: 0,
      };

      const result = reconcileSewaKendraDayBook({
        id: 'SK-TEST-01',
        sewaKendraCode: 'SC-GBD',
        sewaKendraNameNe: 'गोबरडिहा ग्रामीण सेवा केन्द्र',
        sewaKendraNameEn: 'Gobardiha Rural Extension Desk',
        dateBS: '२०८०/०९/२५',
        inchargeName: 'अनिता यादव',
        openingCash: 10000,
        receipts: {
          savingsDeposit: 10000,
          loanRepayment: 5000,
          shareAndFees: 0,
          remittanceReceived: 0,
          otherReceipts: 0,
        },
        disbursements: {
          savingsWithdrawal: 3000,
          loanDisbursement: 0,
          remittancePayout: 0,
          pettyExpenses: 2000,
        },
        denominations: denoms,
        transitToCentralVault: 15000,
      });

      expect(result.calculatedClosingBalance).toBe(20000);
      expect(result.physicalCashCount).toBe(20000);
      expect(result.discrepancyAmount).toBe(0);
      expect(result.reconciliationStatus).toBe('BALANCED');
      expect(result.retainedBranchFloat).toBe(5000); // 20,000 - 15,000
      expect(result.clearingVoucherNo).toContain('VCH-CLR-SC-GBD');
    });

    it('flags SURPLUS when physical cash exceeds calculated book balance', () => {
      const denoms: DenominationCounts = {
        n1000: 21, // 21,000 (1,000 surplus)
        n500: 0,
        n100: 0,
        n50: 0,
        n20: 0,
        n10: 0,
        n5: 0,
        coins: 0,
      };

      const result = reconcileSewaKendraDayBook({
        id: 'SK-TEST-02',
        sewaKendraCode: 'SC-LMH',
        sewaKendraNameNe: 'लमही बजार सेवा केन्द्र',
        sewaKendraNameEn: 'Lamahi Market Service Center',
        dateBS: '२०८०/०९/२५',
        inchargeName: 'सुनिता चौधरी',
        openingCash: 10000,
        receipts: {
          savingsDeposit: 10000,
          loanRepayment: 0,
          shareAndFees: 0,
          remittanceReceived: 0,
          otherReceipts: 0,
        },
        disbursements: {
          savingsWithdrawal: 0,
          loanDisbursement: 0,
          remittancePayout: 0,
          pettyExpenses: 0,
        },
        denominations: denoms,
        transitToCentralVault: 10000,
      });

      expect(result.calculatedClosingBalance).toBe(20000);
      expect(result.physicalCashCount).toBe(21000);
      expect(result.discrepancyAmount).toBe(1000);
      expect(result.reconciliationStatus).toBe('SURPLUS');
    });

    it('flags DEFICIT when physical cash is less than calculated book balance', () => {
      const denoms: DenominationCounts = {
        n1000: 19, // 19,000 (1,000 deficit)
        n500: 0,
        n100: 0,
        n50: 0,
        n20: 0,
        n10: 0,
        n5: 0,
        coins: 0,
      };

      const result = reconcileSewaKendraDayBook({
        id: 'SK-TEST-03',
        sewaKendraCode: 'SC-BLB',
        sewaKendraNameNe: 'भालुवाङ राप्ती काउन्टर',
        sewaKendraNameEn: 'Bhalubang Rapti Counter',
        dateBS: '२०८०/०९/२५',
        inchargeName: 'दिपक डाँगी',
        openingCash: 20000,
        receipts: {
          savingsDeposit: 0,
          loanRepayment: 0,
          shareAndFees: 0,
          remittanceReceived: 0,
          otherReceipts: 0,
        },
        disbursements: {
          savingsWithdrawal: 0,
          loanDisbursement: 0,
          remittancePayout: 0,
          pettyExpenses: 0,
        },
        denominations: denoms,
        transitToCentralVault: 0,
      });

      expect(result.calculatedClosingBalance).toBe(20000);
      expect(result.physicalCashCount).toBe(19000);
      expect(result.discrepancyAmount).toBe(-1000);
      expect(result.reconciliationStatus).toBe('DEFICIT');
    });
  });

  describe('generateInterBranchClearingVoucher', () => {
    it('creates double-entry voucher transferring transit cash to Central Head Office', () => {
      const sampleRecords = createDefaultSewaKendraRecords();
      const entry = sampleRecords[0];

      const voucher = generateInterBranchClearingVoucher(entry, 'अर्जुन प्रसाद शर्मा');

      expect(voucher.fromBranchCode).toBe('SC-GBD');
      expect(voucher.toBranchCode).toBe('HQ-GDH');
      expect(voucher.transferAmount).toBe(entry.transitToCentralVault);
      expect(voucher.debitAccountTitle).toContain('केन्द्रीय ढुकुटी नगद मौज्दात');
      expect(voucher.creditAccountTitle).toContain('अन्तर-शाखा हिसाब');
      expect(voucher.status).toBe('APPROVED_TRANSFERRED');
    });
  });

  describe('exportSewaKendraClearingCsv', () => {
    it('formats CSV correctly with institutional header and branch summary rows', () => {
      const records = createDefaultSewaKendraRecords();
      const csv = exportSewaKendraClearingCsv(records);

      expect(csv).toContain('उनको बचत तथा ऋण सहकारी संस्था लि.');
      expect(csv).toContain('सेवा केन्द्र तथा अन्तर-शाखा दैनिक हिसाब मिलान प्रतिवेदन');
      expect(csv).toContain('गोबरडिहा ग्रामीण सेवा केन्द्र');
      expect(csv).toContain('लमही बजार सेवा केन्द्र');
      expect(csv).toContain('भालुवाङ राप्ती काउन्टर');
      expect(csv).toContain('VCH-CLR-SC-GBD');
    });
  });
});
