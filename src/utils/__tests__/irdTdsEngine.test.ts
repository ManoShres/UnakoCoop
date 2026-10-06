import { describe, it, expect } from 'vitest';
import {
  getStandardTdsRate,
  getRevenueHeadForSection,
  calculateTds,
  isValidNepalPan,
  aggregateTdsBySection,
  generateIrdETdsTextFile,
  generateIrdETdsCsv,
  calculateFilingCompliance,
  generateTdsCertificate,
  calculateSection87AnnualTax,
  calculateSection87MonthlyTds,
  TdsTransactionRecord,
  DEFAULT_UNAKO_TAX_INFO,
} from '../irdTdsEngine';

describe('irdTdsEngine - Nepal Income Tax Act 2058 Statutory TDS Engine', () => {
  describe('getStandardTdsRate', () => {
    it('returns correct rates for individual vs entity interest', () => {
      expect(getStandardTdsRate('SEC_88_INTEREST', 'INDIVIDUAL')).toBe(5.0);
      expect(getStandardTdsRate('SEC_88_INTEREST', 'ENTITY')).toBe(15.0);
    });

    it('returns 5% for member share dividend', () => {
      expect(getStandardTdsRate('SEC_88_DIVIDEND')).toBe(5.0);
    });

    it('returns 10% for house rent', () => {
      expect(getStandardTdsRate('SEC_88_RENT')).toBe(10.0);
    });

    it('returns 1.5% with VAT invoice and 15% without for service fee', () => {
      expect(getStandardTdsRate('SEC_88_SERVICE', 'INDIVIDUAL', true)).toBe(1.5);
      expect(getStandardTdsRate('SEC_88_SERVICE', 'INDIVIDUAL', false)).toBe(15.0);
    });

    it('returns 1.5% for contract payments', () => {
      expect(getStandardTdsRate('SEC_89_CONTRACT')).toBe(1.5);
    });

    it('applies the progressive Section 87 slab instead of a flat 1%', () => {
      // Regression (B15): Sec 87 returned a flat 1%, under-withholding ~11,000/month on
      // a 100,000/month salary. Annual slab: 1%/10%/20%/30%/36%.
      expect(calculateSection87AnnualTax(1200000)).toBe(145000);
      const monthly = calculateSection87MonthlyTds(100000);
      expect(monthly.monthlyTds).toBeCloseTo(12083.33, 2);
      expect(monthly.effectiveRatePercent).toBeCloseTo(12.08, 2);

      // 12,083.33 withheld vs the old flat 1,000 → ~11,000/month more.
      expect(monthly.monthlyTds - 1000).toBeGreaterThan(11000);

      expect(getStandardTdsRate('SEC_87', 'INDIVIDUAL', true, 100000)).toBeCloseTo(12.08, 2);
      // Without an amount only the lowest slab is knowable.
      expect(getStandardTdsRate('SEC_87')).toBe(1.0);
      expect(calculateSection87AnnualTax(0)).toBe(0);
    });
  });

  describe('getRevenueHeadForSection', () => {
    it('maps statutory section codes to Nepal Treasury Revenue Heads', () => {
      expect(getRevenueHeadForSection('SEC_87')).toBe('11111');
      expect(getRevenueHeadForSection('SEC_88_INTEREST')).toBe('11112');
      expect(getRevenueHeadForSection('SEC_88_DIVIDEND')).toBe('11112');
      expect(getRevenueHeadForSection('SEC_88_RENT')).toBe('11113');
      expect(getRevenueHeadForSection('SEC_88_SERVICE')).toBe('11113');
      expect(getRevenueHeadForSection('SEC_89_CONTRACT')).toBe('11113');
    });
  });

  describe('calculateTds', () => {
    it('correctly calculates 5% TDS and net payout for interest', () => {
      const res = calculateTds(10000, 5);
      expect(res.grossAmount).toBe(10000);
      expect(res.tdsRate).toBe(5);
      expect(res.tdsAmount).toBe(500);
      expect(res.netAmount).toBe(9500);
    });

    it('handles zero or negative gross amount safely', () => {
      const res = calculateTds(0, 5);
      expect(res.tdsAmount).toBe(0);
      expect(res.netAmount).toBe(0);
    });
  });

  describe('isValidNepalPan', () => {
    it('validates 9-digit PAN format', () => {
      expect(isValidNepalPan('302948123')).toBe(true);
      expect(isValidNepalPan('601234567')).toBe(true);
      expect(isValidNepalPan('12345678')).toBe(false); // 8 digits
      expect(isValidNepalPan('1234567890')).toBe(false); // 10 digits
      expect(isValidNepalPan('ABC123456')).toBe(false); // alphanumeric
      expect(isValidNepalPan('')).toBe(false);
    });
  });

  const sampleRecords: readonly TdsTransactionRecord[] = [
    {
      id: 'TDS-01',
      transactionDateBS: '2081/08/15',
      fiscalYear: '2081/82',
      monthBS: 'मंसिर',
      sectionCode: 'SEC_88_INTEREST',
      sectionLabel: 'Sec 88(1) - Savings & FD Interest TDS',
      sectionLabelNepali: 'दफा ८८(१) - निक्षेप तथा बचतको ब्याज कर कट्टी',
      revenueHead: '11112',
      deducteeType: 'INDIVIDUAL',
      deducteePan: '601234567',
      deducteeName: 'राम बहादुर चौधरी',
      deducteeMemberId: 'M-102',
      grossPaymentAmount: 50000,
      tdsRatePercent: 5.0,
      tdsAmount: 2500,
      netPaidAmount: 47500,
      bankDepositVoucherNo: 'VCH-RBB-88192',
      treasuryBankName: 'राष्ट्रिय वाणिज्य बैंक, गढवा',
      depositDateBS: '2081/08/20',
      status: 'DEPOSITED',
    },
    {
      id: 'TDS-02',
      transactionDateBS: '2081/08/28',
      fiscalYear: '2081/82',
      monthBS: 'मंसिर',
      sectionCode: 'SEC_88_DIVIDEND',
      sectionLabel: 'Sec 88(2) - Member Share Dividend TDS',
      sectionLabelNepali: 'दफा ८८(२) - सेयर लाभांश कर कट्टी',
      revenueHead: '11112',
      deducteeType: 'INDIVIDUAL',
      deducteePan: '601234567',
      deducteeName: 'राम बहादुर चौधरी',
      deducteeMemberId: 'M-102',
      grossPaymentAmount: 20000,
      tdsRatePercent: 5.0,
      tdsAmount: 1000,
      netPaidAmount: 19000,
      bankDepositVoucherNo: 'VCH-RBB-88192',
      treasuryBankName: 'राष्ट्रिय वाणिज्य बैंक, गढवा',
      depositDateBS: '2081/08/20',
      status: 'DEPOSITED',
    },
    {
      id: 'TDS-03',
      transactionDateBS: '2081/08/25',
      fiscalYear: '2081/82',
      monthBS: 'मंसिर',
      sectionCode: 'SEC_88_RENT',
      sectionLabel: 'Sec 88(1) - House & Office Rent TDS',
      sectionLabelNepali: 'दफा ८८(१) - घरभाडा कर कट्टी',
      revenueHead: '11113',
      deducteeType: 'INDIVIDUAL',
      deducteePan: '300998877',
      deducteeName: 'हरि प्रसाद यादव (घरबेटी)',
      grossPaymentAmount: 30000,
      tdsRatePercent: 10.0,
      tdsAmount: 3000,
      netPaidAmount: 27000,
      status: 'WITHHELD',
    },
  ];

  describe('aggregateTdsBySection', () => {
    it('aggregates gross, TDS, deposited and pending amounts across statutory sections', () => {
      const summary = aggregateTdsBySection(sampleRecords);
      expect(summary.length).toBe(6);

      const interestSec = summary.find((s) => s.sectionCode === 'SEC_88_INTEREST');
      expect(interestSec).toBeDefined();
      expect(interestSec?.transactionCount).toBe(1);
      expect(interestSec?.totalGrossAmount).toBe(50000);
      expect(interestSec?.totalTdsAmount).toBe(2500);
      expect(interestSec?.depositedAmount).toBe(2500);
      expect(interestSec?.pendingDepositAmount).toBe(0);

      const rentSec = summary.find((s) => s.sectionCode === 'SEC_88_RENT');
      expect(rentSec).toBeDefined();
      expect(rentSec?.transactionCount).toBe(1);
      expect(rentSec?.totalGrossAmount).toBe(30000);
      expect(rentSec?.totalTdsAmount).toBe(3000);
      expect(rentSec?.depositedAmount).toBe(0);
      expect(rentSec?.pendingDepositAmount).toBe(3000);
    });
  });

  describe('generateIrdETdsTextFile', () => {
    it('generates tab-delimited IRD portal upload string with correct columns', () => {
      const textOutput = generateIrdETdsTextFile(sampleRecords, '302948123');
      const lines = textOutput.split('\r\n');
      expect(lines.length).toBe(4); // Header + 3 records

      const header = lines[0].split('\t');
      expect(header[0]).toBe('Withholder_PAN');
      expect(header[1]).toBe('Deductee_PAN');
      expect(header[3]).toBe('Section_Code');
      expect(header[9]).toBe('Revenue_Head');

      const firstRow = lines[1].split('\t');
      expect(firstRow[0]).toBe('302948123');
      expect(firstRow[1]).toBe('601234567');
      expect(firstRow[3]).toBe('SEC_88_INTEREST');
      expect(firstRow[4]).toBe('2081.08.15');
      expect(firstRow[5]).toBe('50000.00');
      expect(firstRow[7]).toBe('2500.00');
    });
  });

  describe('generateIrdETdsCsv', () => {
    it('generates valid quoted CSV with headers and row indices', () => {
      const csv = generateIrdETdsCsv(sampleRecords, '302948123');
      expect(csv).toContain('Withholder PAN');
      expect(csv).toContain('"302948123"');
      expect(csv).toContain('"601234567"');
      expect(csv).toContain('"राम बहादुर चौधरी"');
    });
  });

  describe('calculateFilingCompliance', () => {
    it('detects un-deposited tax and calculates overdue fee', () => {
      const compliance = calculateFilingCompliance('मंसिर', '2081/82', sampleRecords);
      expect(compliance.totalTdsWithheld).toBe(6500);
      expect(compliance.totalTdsDeposited).toBe(3500);
      expect(compliance.isFullyDeposited).toBe(false);
      expect(compliance.isOverdue).toBe(true);
      expect(compliance.estimatedLateFee).toBeGreaterThan(100);
    });

    it('marks fully deposited when all records in month are deposited', () => {
      const allDeposited = sampleRecords.map((r) => ({ ...r, status: 'DEPOSITED' as const }));
      const compliance = calculateFilingCompliance('मंसिर', '2081/82', allDeposited);
      expect(compliance.isFullyDeposited).toBe(true);
      expect(compliance.isOverdue).toBe(false);
      expect(compliance.estimatedLateFee).toBe(0);
    });

    it('builds a real next-month 25th BS due date and measures actual delay', () => {
      // Regression (B15): the due date was built as `2081-मंसिर-25` (invalid) and the
      // delay was hardcoded to 15 days with isOverdue always true.
      const dueDateOnly = calculateFilingCompliance('मंसिर', '2081/82', sampleRecords, '2081-09-20');
      expect(dueDateOnly.dueDateBS).toBe('2081-09-25'); // पुष (month 9) 25th
      expect(dueDateOnly.daysDelayed).toBe(0);
      expect(dueDateOnly.isOverdue).toBe(false); // not overdue before the 25th
      expect(dueDateOnly.estimatedLateFee).toBe(0);

      const late = calculateFilingCompliance('मंसिर', '2081/82', sampleRecords, '2081-09-30');
      expect(late.isOverdue).toBe(true);
      expect(late.daysDelayed).toBe(5);
      expect(late.estimatedLateFee).toBeCloseTo(Math.round((6500 * 0.15 * (5 / 365) + 100) * 100) / 100, 2);
    });
  });

  describe('generateTdsCertificate', () => {
    it('generates Form 88 Tax Deduction Certificate for a member with matching records', () => {
      const cert = generateTdsCertificate('601234567', '2081/82', sampleRecords, DEFAULT_UNAKO_TAX_INFO);
      expect(cert).not.toBeNull();
      expect(cert?.certificateNo).toContain('TDS-CERT-2081-82');
      expect(cert?.deductee.pan).toBe('601234567');
      expect(cert?.deductee.name).toBe('राम बहादुर चौधरी');
      expect(cert?.records.length).toBe(2);
      expect(cert?.totalGrossAmount).toBe(70000);
      expect(cert?.totalTdsDeducted).toBe(3500);
      expect(cert?.totalTdsDeposited).toBe(3500);
      expect(cert?.verificationHash).toMatch(/^IRD-VER-[0-9A-F]{8}$/);
    });

    it('returns null if no records match given PAN/MemberId and FY', () => {
      const cert = generateTdsCertificate('999999999', '2081/82', sampleRecords);
      expect(cert).toBeNull();
    });
  });
});
