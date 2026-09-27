import { describe, it, expect } from 'vitest';
import {
  calculateMemberTaxClearance,
  generateSection90TaxCertificate,
  generateMemberTaxClearanceLetter,
  exportMemberTaxLedgerToCSV,
  MemberTaxClearanceProfile,
} from '../memberTaxClearanceEngine';

describe('memberTaxClearanceEngine - Income Tax Act 2058 Sec 88, 90 & 117', () => {
  const sampleProfile: MemberTaxClearanceProfile = {
    memberId: 'mem-101',
    memberNo: 'UKO-2070-08842',
    fullNameNepali: 'हरि प्रसाद चौधरी',
    fullNameEnglish: 'Hari Prasad Chaudhary',
    citizenshipNo: '38-01-72-04912',
    panNo: '109283746',
    phone: '9857840123',
    address: 'गढवा-५, दाङ, नेपाल',
    fiscalYear: '२०८०/८१',
    savingsAccounts: [
      {
        accountNo: 'SAV-001-4491',
        accountType: 'नियमित अनिवार्य बचत (Regular Savings)',
        grossInterestEarned: 12000,
        tdsRatePercent: 5,
        tdsAmount: 600,
        netInterestPaid: 11400,
        etdsVoucherNo: 'eTDS-Dang-81-4920',
        depositDateNepali: '२०८१-०३-३१',
      },
      {
        accountNo: 'FD-002-8812',
        accountType: '२ वर्षे आवधिक मुद्दती (Fixed Deposit)',
        grossInterestEarned: 48000,
        tdsRatePercent: 5,
        tdsAmount: 2400,
        netInterestPaid: 45600,
        etdsVoucherNo: 'eTDS-Dang-81-4920',
        depositDateNepali: '२०८१-०३-३१',
      },
    ],
    dividendRecord: {
      fiscalYear: '२०८०/८१',
      shareKitta: 500,
      shareCapital: 50000,
      grossDividendEarned: 7500,
      dividendTaxRatePercent: 5,
      dividendTaxAmount: 375,
      netDividendPaid: 7125,
      etdsVoucherNo: 'eTDS-Dang-81-5100',
      agmResolutionDateNepali: '२०८०-०६-२५',
    },
    totalGrossIncome: 67500,
    totalTdsDeducted: 3375,
    totalNetIncome: 64125,
    irdRemittanceStatus: 'VERIFIED_REMITTED',
    certificateNo: 'UNAKO-TDS-81-0842',
    issuedDateNepali: '२०८१-०४-१५',
  };

  it('accurately calculates member tax clearance and withholding metrics', () => {
    const calc = calculateMemberTaxClearance({
      savingsAccounts: sampleProfile.savingsAccounts,
      dividendRecord: sampleProfile.dividendRecord,
      panNo: sampleProfile.panNo,
    });

    // Gross Savings Interest = 12000 + 48000 = 60000
    expect(calc.totalGrossSavingsInterest).toBe(60000);
    // Savings TDS = 600 + 2400 = 3000
    expect(calc.totalSavingsTds).toBe(3000);
    // Dividend = 7500, TDS = 375
    expect(calc.grossDividend).toBe(7500);
    expect(calc.dividendTds).toBe(375);
    // Total Gross = 67500, Total TDS = 3375, Net = 64125
    expect(calc.totalGrossIncome).toBe(67500);
    expect(calc.totalTdsDeducted).toBe(3375);
    expect(calc.totalNetIncome).toBe(64125);
    expect(calc.effectiveTaxRatePercent).toBe(5);
    expect(calc.isPanVerified).toBe(true);
  });

  it('generates an official Income Tax Act 2058 Section 90 Withholding Certificate', () => {
    const calc = calculateMemberTaxClearance({
      savingsAccounts: sampleProfile.savingsAccounts,
      dividendRecord: sampleProfile.dividendRecord,
      panNo: sampleProfile.panNo,
    });

    const cert = generateSection90TaxCertificate(sampleProfile, calc);

    expect(cert).toContain('उनको बचत तथा ऋण सहकारी संस्था लिमिटेड');
    expect(cert).toContain('STATUTORY WITHHOLDING TAX (TDS) CERTIFICATE');
    expect(cert).toContain('दफा ९०');
    expect(cert).toContain('Hari Prasad Chaudhary');
    expect(cert).toContain('109283746'); // PAN
    expect(cert).toContain('302849102'); // Coop PAN
    expect(cert).toContain('UNAKO-TDS-81-0842');
    expect(cert).toContain('रु. 3,375');
  });

  it('generates an official Member Tax Clearance Letter', () => {
    const calc = calculateMemberTaxClearance({
      savingsAccounts: sampleProfile.savingsAccounts,
      dividendRecord: sampleProfile.dividendRecord,
      panNo: sampleProfile.panNo,
    });

    const letter = generateMemberTaxClearanceLetter(sampleProfile, calc);

    expect(letter).toContain('आधिकारिक कर चुक्ता सिफारिस पत्र');
    expect(letter).toContain('TO WHOM IT MAY CONCERN');
    expect(letter).toContain('हरि प्रसाद चौधरी');
    expect(letter).toContain('UKO-2070-08842');
    expect(letter).toContain('e-TDS मार्फत शतप्रतिशत दाखिला गरिसकेको');
    expect(letter).toContain('कर चुक्ता भएको');
  });

  it('exports tax clearance ledger to CSV', () => {
    const calc = calculateMemberTaxClearance({
      savingsAccounts: sampleProfile.savingsAccounts,
      dividendRecord: sampleProfile.dividendRecord,
      panNo: sampleProfile.panNo,
    });

    const csv = exportMemberTaxLedgerToCSV(sampleProfile, calc);

    expect(csv).toContain('Account No (खाता नं)');
    expect(csv).toContain('SAV-001-4491');
    expect(csv).toContain('FD-002-8812');
    expect(csv).toContain('MEMBER TAX CLEARANCE & WITHHOLDING SUMMARY');
    expect(csv).toContain('109283746');
    expect(csv).toContain('VERIFIED_REMITTED');
  });
});
