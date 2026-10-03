import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateDenominationTotal,
  reconcileCashHandover,
  generateFieldReceiptNumber,
  formatFieldThermalEscPosReceipt,
  DANG_GADHWA_WARDS,
} from '../fieldCollectorEngine';
import {
  getMemberPatronageMetric,
  getMemberPatronageDistribution,
  formatPatronageThermalSlip,
  calculatePatronageRefund,
  DEFAULT_PATRONAGE_CONFIG,
} from '../patronageRefundEngine';
import {
  getOfflineCollectionQueue,
  enqueueOfflineCollection,
  clearOfflineCollectionQueue,
  syncOfflineCollections,
} from '../offlineCollection';
import type { CashDenominationCount, FieldCollectionRecord, CoopSettings } from '../../types';

describe('Field Collector & Patronage Refund Integration Test', () => {
  const mockCoopSettings: CoopSettings = {
    name: 'Unako Social SACCOS Ltd.',
    nameNepali: 'उनाको सामाजिक बचत तथा ऋण सहकारी संस्था लि.',
    address: 'Gadhwa-1, Dang',
    phone: '082-560123',
    email: 'info@unako.org',
    regNo: '202/065/066',
    panNo: '300124890',
    openingHours: '10:00 AM - 5:00 PM',
    operatingStatus: 'NORMAL',
    logoUrl: '/unako-logo.png',
  };


  beforeEach(() => {
    clearOfflineCollectionQueue();
  });

  describe('Field Collection Lifecycle with Offline Queue', () => {
    it('enqueues a field collection record and syncs with CBS callback', () => {
      const receiptNo = generateFieldReceiptNumber('2081-06-25', 1);
      expect(receiptNo).toBe('FLD-20810625-0001');

      const entry = enqueueOfflineCollection({
        motherGroupId: 'mg-gadhwa-1',
        groupMemberId: 'gm-101',
        memberId: 'mem-1',
        memberName: 'रामबहादुर चौधरी',
        meetingDate: '2081-06-25',
        collectorNo: 'EMP-01',
        collectorName: 'सीता शर्मा',
        totalAmount: 3500,
        breakdown: {
          mandatorySavings: 1000,
          optionalSavings: 500,
          loanPrincipal: 1500,
          loanInterest: 350,
          fine: 150,
        },
        attendance: 'PRESENT',
        slipNo: receiptNo,
        notes: 'Door-to-door ward 1 collection',
      });

      expect(entry.id).toBeDefined();
      expect(entry.synced).toBe(false);

      const queue = getOfflineCollectionQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].totalAmount).toBe(3500);
      expect(queue[0].slipNo).toBe('FLD-20810625-0001');

      // Now sync with CBS
      const { updatedQueue, summary } = syncOfflineCollections(queue, (item) => {
        expect(item.memberId).toBe('mem-1');
        return { success: true, depositId: 'CBS-DEP-9901' };
      });

      expect(summary.syncedCount).toBe(1);
      expect(summary.totalAmountSynced).toBe(3500);
      expect(updatedQueue[0].synced).toBe(true);
      expect(updatedQueue[0].cbsDepositId).toBe('CBS-DEP-9901');
    });

    it('formats a field thermal receipt for 58mm/80mm printer correctly', () => {
      const record: FieldCollectionRecord = {
        id: 'FLD-20810625-0001',
        receiptNo: 'FLD-20810625-0001',
        memberId: 'mem-1',
        memberNo: 'M-00101',
        memberName: 'रामबहादुर चौधरी',
        ward: 'वार्ड नं. १ (गढवा बजार)',
        phone: '9847890123',
        collectorNo: 'EMP-01',
        collectorName: 'सीता शर्मा',
        dateBS: '2081-06-25',
        timestamp: '10:30 AM',
        breakdown: {
          mandatorySavings: 1000,
          optionalSavings: 500,
          loanPrincipal: 2000,
          loanInterest: 300,
          whrStorageFee: 100,
          shareAmount: 0,
        },
        totalAmount: 3900,
        paymentMode: 'CASH',
        synced: true,
      };

      const slip = formatFieldThermalEscPosReceipt(record, mockCoopSettings);
      expect(slip).toContain('FLD-20810625-0001');
      expect(slip).toContain('रामबहादुर चौधरी');
      expect(slip).toContain('३,९००');
      expect(slip).toContain('सीता शर्मा');
      expect(slip).toContain('गढवा बजार');
      expect(slip).toContain('अन्न गोदाम शुल्क');
    });
  });

  describe('Denomination Calculator & Handover Reconciliation', () => {
    it('verifies exact balance when physical notes tally matches receipts', () => {
      const bag: CashDenominationCount = {
        n1000: 5,  // 5000
        n500: 4,   // 2000
        n100: 10,  // 1000
        n50: 4,    // 200
        n20: 5,    // 100
        n10: 10,   // 100
        n5: 0,
        n2_1: 0,
      };

      const bagTotal = calculateDenominationTotal(bag);
      expect(bagTotal).toBe(8400);

      const report = reconcileCashHandover(
        8400,
        bag,
        'EMP-01',
        'सीता शर्मा',
        '2081-06-25',
        4
      );

      expect(report.status).toBe('BALANCED');
      expect(report.discrepancy).toBe(0);
      expect(report.cashInBagAmount).toBe(8400);
      expect(report.systemTotalAmount).toBe(8400);
    });

    it('flags shortage accurately when cash is missing', () => {
      const bag: CashDenominationCount = {
        n1000: 7, // 7000
        n500: 0,
        n100: 0,
        n50: 0,
        n20: 0,
        n10: 0,
        n5: 0,
        n2_1: 0,
      };

      const report = reconcileCashHandover(
        7500, // system total
        bag,
        'EMP-01',
        'सीता शर्मा',
        '2081-06-25',
        3
      );

      expect(report.status).toBe('SHORTAGE');
      expect(report.discrepancy).toBe(-500);
    });
  });

  describe('Section 41 Patronage Refund Allocation & Warrant Verification', () => {
    it('retrieves member metric and computes proportional patronage dividend', () => {
      const metric = getMemberPatronageMetric('mem-1');
      expect(metric.memberName).toBe('रामबहादुर चौधरी');
      expect(metric.annualSavingsInterestEarned).toBe(18450);
      expect(metric.annualLoanInterestPaid).toBe(64200);
      expect(metric.annualDairyBusinessVolume).toBe(245000);

      const dist = getMemberPatronageDistribution('mem-1', DEFAULT_PATRONAGE_CONFIG);
      expect(dist.memberId).toBe('mem-1');
      expect(dist.grossPatronageRefund).toBeGreaterThan(0);
      expect(dist.taxWithholding).toBe(0); // 0% WHT on transaction patronage rebate
      expect(dist.netPatronageRefund).toBe(dist.grossPatronageRefund);
      expect(dist.warrantNumber).toMatch(/^PRF-UNAKO-2080-81-\d{5}$/);

      const thermalSlip = formatPatronageThermalSlip(dist, 'उनाको साकोस');
      expect(thermalSlip).toContain(dist.warrantNumber);
      expect(thermalSlip).toContain('रामबहादुर चौधरी');
      expect(thermalSlip).toContain('बचत ब्याज लाभांश');
      expect(thermalSlip).toContain('ऋण ब्याज लाभांश');
      expect(thermalSlip).toContain('कृषि/दुग्ध लाभांश');
    });
  });
});
