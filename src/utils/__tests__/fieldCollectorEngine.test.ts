import { describe, it, expect } from 'vitest';
import {
  calculateDenominationTotal,
  reconcileCashHandover,
  generateFieldReceiptNumber,
  formatFieldThermalEscPosReceipt,
  DANG_GADHWA_WARDS,
} from '../fieldCollectorEngine';
import type { CashDenominationCount, FieldCollectionRecord } from '../../types';
import type { CoopSettings } from '../../types';

describe('fieldCollectorEngine - Rural Field Mobility Suite', () => {
  const mockCoopSettings: CoopSettings = {
    name: 'Unako Social Savings & Credit Co-operative Ltd.',
    nameNepali: 'उनाको सामाजिक बचत तथा ऋण सहकारी संस्था लि.',
    address: 'Gadhwa-1, Dang, Lumbini, Nepal',
    phone: '082-560123',
    email: 'info@unako.org',
    regNo: '202/065/066',
    panNo: '300124890',
    openingHours: '10:00 AM - 5:00 PM',
    operatingStatus: 'NORMAL',
    logoUrl: '/unako-logo.png',
  };


  describe('Denomination Calculator', () => {
    it('correctly calculates total physical rupee cash in field collection bag', () => {
      const bag: CashDenominationCount = {
        n1000: 15, // 15,000
        n500: 8,   // 4,000
        n100: 25,  // 2,500
        n50: 10,   // 500
        n20: 15,   // 300
        n10: 20,   // 200
        n5: 10,    // 50
        n2_1: 5,   // 10
      };

      const total = calculateDenominationTotal(bag);
      expect(total).toBe(22560);
    });

    it('returns 0 for empty denominations', () => {
      const bag: CashDenominationCount = {
        n1000: 0,
        n500: 0,
        n100: 0,
        n50: 0,
        n20: 0,
        n10: 0,
        n5: 0,
        n2_1: 0,
      };
      expect(calculateDenominationTotal(bag)).toBe(0);
    });
  });

  describe('Cash Handover Reconciliation', () => {
    it('reports BALANCED status when bag cash matches system collections', () => {
      const bag: CashDenominationCount = {
        n1000: 10, // 10,000
        n500: 2,   // 1,000
        n100: 5,   // 500
        n50: 0,
        n20: 0,
        n10: 0,
        n5: 0,
        n2_1: 0,
      };

      const report = reconcileCashHandover(
        11500, // system total
        bag,
        'EMP-01',
        'Sita Sharma',
        '2081-06-25',
        8
      );

      expect(report.systemTotalAmount).toBe(11500);
      expect(report.cashInBagAmount).toBe(11500);
      expect(report.discrepancy).toBe(0);
      expect(report.status).toBe('BALANCED');
      expect(report.totalReceiptsCount).toBe(8);
    });

    it('detects SHORTAGE when physical cash is less than receipts', () => {
      const bag: CashDenominationCount = {
        n1000: 9, // 9,000
        n500: 2,  // 1,000
        n100: 0,
        n50: 0,
        n20: 0,
        n10: 0,
        n5: 0,
        n2_1: 0,
      };

      const report = reconcileCashHandover(
        10500, // system total
        bag,
        'EMP-01',
        'Sita Sharma',
        '2081-06-25',
        6
      );

      expect(report.cashInBagAmount).toBe(10000);
      expect(report.discrepancy).toBe(-500);
      expect(report.status).toBe('SHORTAGE');
    });

    it('detects SURPLUS when physical cash exceeds receipts', () => {
      const bag: CashDenominationCount = {
        n1000: 12, // 12,000
        n500: 0,
        n100: 0,
        n50: 0,
        n20: 0,
        n10: 0,
        n5: 0,
        n2_1: 0,
      };

      const report = reconcileCashHandover(
        11000,
        bag,
        'EMP-01',
        'Sita Sharma',
        '2081-06-25',
        7
      );

      expect(report.cashInBagAmount).toBe(12000);
      expect(report.discrepancy).toBe(1000);
      expect(report.status).toBe('SURPLUS');
    });
  });

  describe('Receipt Number Generator', () => {
    it('generates standard field receipt identifier with date and sequence', () => {
      const r1 = generateFieldReceiptNumber('2081-06-25', 1);
      const r2 = generateFieldReceiptNumber('2081-06-25', 124);
      expect(r1).toBe('FLD-20810625-0001');
      expect(r2).toBe('FLD-20810625-0124');
    });
  });

  describe('Thermal ESC/POS Slip Formatter', () => {
    it('generates compliant 58mm/80mm receipt text for mobile thermal printers', () => {
      const record: FieldCollectionRecord = {
        id: 'rec-001',
        receiptNo: 'FLD-20810625-0001',
        memberId: 'mem-1',
        memberNo: 'M-00101',
        memberName: 'रामबहादुर चौधरी',
        ward: 'वार्ड नं. १ (गढवा बजार)',
        phone: '9847890123',
        collectorNo: 'EMP-01',
        collectorName: 'सीता शर्मा',
        dateBS: '2081-06-25',
        timestamp: '11:45 AM',
        breakdown: {
          mandatorySavings: 1000,
          optionalSavings: 500,
          loanPrincipal: 3000,
          loanInterest: 450,
          whrStorageFee: 150,
          shareAmount: 0,
        },
        totalAmount: 5100,
        paymentMode: 'CASH',
        synced: false,
      };

      const slip = formatFieldThermalEscPosReceipt(record, mockCoopSettings);
      expect(slip).toContain('उनाको सामाजिक बचत तथा ऋण सहकारी');
      expect(slip).toContain('FLD-20810625-0001');
      expect(slip).toContain('रामबहादुर चौधरी');
      expect(slip).toContain('M-00101');
      expect(slip).toContain('५,१००');
      expect(slip).toContain('सीता शर्मा');
      expect(slip).toContain('वार्ड नं. १ (गढवा बजार)');
      expect(slip).toContain('ऋण साँवा');
      expect(slip).toContain('अन्न गोदाम शुल्क');
    });
  });

  describe('Dang Gadhwa Wards Catalog', () => {
    it('contains all 8 wards of Gadhwa Rural Municipality', () => {
      expect(DANG_GADHWA_WARDS).toHaveLength(8);
      expect(DANG_GADHWA_WARDS[0].wardNumber).toBe(1);
      expect(DANG_GADHWA_WARDS[0].nameNepali).toBe('गढवा बजार');
      expect(DANG_GADHWA_WARDS[7].wardNumber).toBe(8);
      expect(DANG_GADHWA_WARDS[7].nameNepali).toBe('कोईलाबास');
    });
  });
});
