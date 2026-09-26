import { describe, it, expect } from 'vitest';
import {
  createCashTransitRequest,
  calculateDenominationTotal,
  generateTransitVoucherCsv,
  CurrencyDenominationItem,
} from '../vaultLiquidity';

describe('Cash-in-Transit (CIT) Movement Voucher & Denomination Engine', () => {
  const mockDenominations: CurrencyDenominationItem[] = [
    { noteValue: 1000, count: 100, total: 100000 },
    { noteValue: 500, count: 80, total: 40000 },
    { noteValue: 100, count: 100, total: 10000 },
  ];

  it('correctly calculates total from denomination breakdowns', () => {
    const total = calculateDenominationTotal(mockDenominations);
    expect(total).toBe(150000);
  });

  it('generates a valid CIT transit request with security OTP and unique ID', () => {
    const cit = createCashTransitRequest(
      'Gadhwa Central Vault (HQ-GDH)',
      'Gobardiha Rural Extension Desk (SC-GBD)',
      150000,
      'Anita Yadav',
      'Bishnu Prasad Sharma',
      'Unako Armed CIT Escort Team',
      'Emergency replenishment'
    );

    expect(cit.id).toMatch(/^CIT-/);
    expect(cit.amount).toBe(150000);
    expect(cit.status).toBe('IN_TRANSIT');
    expect(cit.verificationOtp).toMatch(/^\d{6}$/);
    expect(cit.fromLocation).toContain('HQ-GDH');
  });

  it('generates an official CSV export for regulatory and insurance audit', () => {
    const cit = createCashTransitRequest(
      'Gadhwa Central Vault (HQ-GDH)',
      'Gobardiha Rural Extension Desk (SC-GBD)',
      150000,
      'Anita Yadav',
      'Bishnu Prasad Sharma',
      'Unako Armed CIT Escort Team',
      'Emergency replenishment'
    );

    const csv = generateTransitVoucherCsv(cit, mockDenominations, {
      name: 'Unako SACCOS Ltd.',
      nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
      regNo: '234/065/066',
    });

    expect(csv).toContain('मार्गस्थ नगद कोष चलानी भौचर');
    expect(csv).toContain(cit.id);
    expect(csv).toContain('150000');
    expect(csv).toContain('1000');
    expect(csv).toContain('Anita Yadav');
    expect(csv).toContain('Bishnu Prasad Sharma');
  });
});
