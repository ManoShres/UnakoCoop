import { describe, it, expect } from 'vitest';
import {
  calculateInterestCertificate,
  generateInterestCertificateCsv,
  InterestCertificateMemberInput,
  InterestAccountInput,
} from '../interestCertificate';

describe('Interest & TDS Certificate Engine (ब्याज तथा ५% कर कट्टी प्रमाणपत्र)', () => {
  const mockMember: InterestCertificateMemberInput = {
    id: 'MEM-001',
    name: 'Sita Devi Sharma',
    memberNo: 'UKO-2078-012',
    panNo: '109283746',
    citizenshipNo: '28-01-75-01928',
    phone: '9847123456',
    address: 'Gadhwa-5, Dang',
  };

  const mockAccounts: InterestAccountInput[] = [
    {
      accountNo: '001-092-SAV-01',
      accountType: 'SAVINGS',
      productName: 'साधारण बचत (Ordinary Savings)',
      balance: 150000,
      interestRate: 7.5,
      grossInterestEarned: 11250,
    },
    {
      accountNo: '001-092-FD-01',
      accountType: 'FIXED_DEPOSIT',
      productName: 'मुद्दती बचत (1-Yr Term Deposit)',
      balance: 500000,
      interestRate: 10.0,
      grossInterestEarned: 50000,
    },
  ];

  it('correctly calculates 5% statutory TDS and net interest for all eligible accounts', () => {
    const cert = calculateInterestCertificate(
      mockMember,
      mockAccounts,
      '२०८०/२०८१',
      '२०८१-०४-०५',
      '2024-07-20'
    );

    expect(cert.memberId).toBe('MEM-001');
    expect(cert.fiscalYear).toBe('२०८०/२०८१');
    expect(cert.earnings).toHaveLength(2);

    // Account 1: 11,250 gross -> 5% TDS = 562.5 (rounded to 563 or exact decimal), net = 10,687.5
    const acc1 = cert.earnings[0];
    expect(acc1.grossInterestEarned).toBe(11250);
    expect(acc1.tdsRatePercent).toBe(5);
    expect(acc1.tdsDeducted).toBe(562.5);
    expect(acc1.netInterestPaid).toBe(10687.5);

    // Account 2: 50,000 gross -> 5% TDS = 2,500, net = 47,500
    const acc2 = cert.earnings[1];
    expect(acc2.grossInterestEarned).toBe(50000);
    expect(acc2.tdsDeducted).toBe(2500);
    expect(acc2.netInterestPaid).toBe(47500);

    // Totals
    expect(cert.totalGrossInterest).toBe(61250);
    expect(cert.totalTdsDeducted).toBe(3062.5);
    expect(cert.totalNetInterest).toBe(58187.5);
    expect(cert.certificateNo).toMatch(/^UNAKO-IC-2080-81-/);
    expect(cert.verificationHash).toBeTruthy();
  });

  it('handles member with zero interest or empty accounts cleanly', () => {
    const cert = calculateInterestCertificate(
      mockMember,
      [],
      '२०८०/२०८१',
      '२०८१-०४-०५',
      '2024-07-20'
    );

    expect(cert.earnings).toHaveLength(0);
    expect(cert.totalGrossInterest).toBe(0);
    expect(cert.totalTdsDeducted).toBe(0);
    expect(cert.totalNetInterest).toBe(0);
  });

  it('generates compliant CSV for tax filings and member audit reporting', () => {
    const cert = calculateInterestCertificate(
      mockMember,
      mockAccounts,
      '२०८०/२०८१',
      '२०८१-०४-०५',
      '2024-07-20'
    );

    const csv = generateInterestCertificateCsv(cert, {
      name: 'Unako SACCOS Ltd.',
      nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
      panNo: '302918274',
    });

    expect(csv).toContain('उनको बचत तथा ऋण सहकारी संस्था लि.');
    expect(csv).toContain('ब्याज आम्दानी तथा अग्रिम कर कट्टी (TDS) प्रमाणपत्र');
    expect(csv).toContain('Sita Devi Sharma');
    expect(csv).toContain('109283746'); // Member PAN
    expect(csv).toContain('61250'); // Total gross interest
    expect(csv).toContain('3062.5'); // Total TDS
    expect(csv).toContain('58187.5'); // Net interest
  });
});
