import { describe, it, expect } from 'vitest';
import {
  calculateMemberDividend,
  calculateBulkDividend,
  calculateBonusShares,
  calculateBulkBonusShares,
  buildDividendTransactionRef,
  buildBonusShareTransactionRef,
  generateDividendRegisterCsv,
  STATUTORY_DIVIDEND_TAX_RATE,
} from '../dividendDistribution';
import { Member } from '../../types';

const makeMockMember = (partial: Partial<Member>): Member => ({
  id: 'm1',
  memberNo: 'UK-001',
  name: 'Test Member',
  email: 'test@example.com',
  phone: '9851000000',
  citizenshipNo: '12345',
  joinedDate: '2020-01-01',
  address: 'Kathmandu',
  status: 'VERIFIED',
  avatarUrl: '',
  shareCapital: 100000,
  shareKitta: 1000,
  totalSavings: 50000,
  activeLoanBalance: 0,
  accruedDividend: 0,
  creditScore: 700,
  bankDetails: { bankName: '', accountNo: '', branch: '', holderName: '' },
  kycDocuments: { citizenshipFront: true, citizenshipBack: true, photo: true, signature: true, utilityBill: true },
  ...partial,
});

describe('Dividend Distribution Calculation Engine', () => {
  it('correctly calculates single-member dividend with 5% statutory TDS', () => {
    const shareCapital = 100000;
    const ratePercent = 14.5; // 14.5%

    const result = calculateMemberDividend(shareCapital, ratePercent, true);

    expect(result.grossAmount).toBe(14500); // 100,000 * 14.5%
    expect(result.taxDeduction).toBe(725); // 14,500 * 5%
    expect(result.netPayable).toBe(13775); // 14,500 - 725
  });

  it('correctly calculates dividend without TDS when tax deduction is toggled off', () => {
    const shareCapital = 50000;
    const ratePercent = 10;

    const result = calculateMemberDividend(shareCapital, ratePercent, false);

    expect(result.grossAmount).toBe(5000);
    expect(result.taxDeduction).toBe(0);
    expect(result.netPayable).toBe(5000);
  });

  it('handles zero or negative share capital safely', () => {
    expect(calculateMemberDividend(0, 12)).toEqual({ grossAmount: 0, taxDeduction: 0, netPayable: 0 });
    expect(calculateMemberDividend(-5000, 12)).toEqual({ grossAmount: 0, taxDeduction: 0, netPayable: 0 });
    expect(calculateMemberDividend(50000, 0)).toEqual({ grossAmount: 0, taxDeduction: 0, netPayable: 0 });
  });

  it('aggregates bulk dividend calculations across multiple members', () => {
    const mockMembers: Member[] = [
      makeMockMember({
        id: 'm1',
        memberNo: 'UK-001',
        name: 'Ram Bahadur',
        email: 'ram@example.com',
        phone: '9851000001',
        citizenshipNo: '123',
        joinedDate: '2020-01-01',
        shareCapital: 100000,
        shareKitta: 1000,
        totalSavings: 50000,
        accruedDividend: 0,
        status: 'VERIFIED',
      }),
      makeMockMember({
        id: 'm2',
        memberNo: 'UK-002',
        name: 'Sita Devi',
        email: 'sita@example.com',
        phone: '9851000002',
        citizenshipNo: '124',
        joinedDate: '2020-01-01',
        shareCapital: 200000,
        shareKitta: 2000,
        totalSavings: 80000,
        accruedDividend: 0,
        status: 'VERIFIED',
      }),
      makeMockMember({
        id: 'm3',
        memberNo: 'UK-003',
        name: 'Inactive Member',
        email: 'inactive@example.com',
        phone: '9851000003',
        citizenshipNo: '125',
        joinedDate: '2020-01-01',
        shareCapital: 0,
        shareKitta: 0,
        totalSavings: 0,
        accruedDividend: 0,
        status: 'REJECTED',
      }),
    ];

    const bulk = calculateBulkDividend(mockMembers, 10, true);

    expect(bulk.rows.length).toBe(2); // Only verified members with shares
    expect(bulk.summary.totalShareCapital).toBe(300000);
    expect(bulk.summary.totalGross).toBe(30000); // 300,000 * 10%
    expect(bulk.summary.totalTaxWithheld).toBe(1500); // 30,000 * 5%
    expect(bulk.summary.totalNet).toBe(28500);
  });
});

describe('Bonus Share Allotment Engine', () => {
  it('computes integer bonus kitta and capital increase', () => {
    const currentKitta = 250;
    const bonusPercent = 10; // 10% bonus share

    const result = calculateBonusShares(currentKitta, bonusPercent, 100);

    expect(result.bonusKitta).toBe(25);
    expect(result.addedCapital).toBe(2500);
    expect(result.newTotalKitta).toBe(275);
    expect(result.newTotalCapital).toBe(27500);
  });

  it('floors fractional bonus kitta to maintain whole share units', () => {
    const currentKitta = 15;
    const bonusPercent = 5; // 15 * 0.05 = 0.75 -> 0 bonus shares

    const result = calculateBonusShares(currentKitta, bonusPercent, 100);

    expect(result.bonusKitta).toBe(0);
    expect(result.addedCapital).toBe(0);
    expect(result.newTotalKitta).toBe(15);
  });

  it('calculates bulk bonus shares for eligible members', () => {
    const mockMembers: Member[] = [
      makeMockMember({
        id: 'm1',
        memberNo: 'UK-001',
        name: 'Ram Bahadur',
        email: 'ram@example.com',
        phone: '9851000001',
        citizenshipNo: '123',
        joinedDate: '2020-01-01',
        shareCapital: 100000,
        shareKitta: 1000,
        totalSavings: 50000,
        accruedDividend: 0,
        status: 'VERIFIED',
      }),
    ];

    const result = calculateBulkBonusShares(mockMembers, 5, 100);

    expect(result.summary.memberCount).toBe(1);
    expect(result.summary.totalBonusKitta).toBe(50); // 1000 * 5%
    expect(result.summary.totalAddedCapital).toBe(5000);
    expect(result.rows[0].newTotalKitta).toBe(1050);
  });
});

describe('Audit Reference Generation & CSV Export', () => {
  it('formats standard audit references with padded sequence numbers', () => {
    expect(buildDividendTransactionRef('2081/82', 42)).toBe('DIV-208182-000042');
    expect(buildBonusShareTransactionRef('2081/82', 105)).toBe('BSH-208182-000105');
  });

  it('generates a valid CSV string with correct headers', () => {
    const rows = [
      {
        memberId: 'm1',
        memberNo: 'UK-88219',
        memberName: 'Ram Bahadur Shrestha',
        shareCapital: 150000,
        shareKitta: 1500,
        grossDividend: 21750,
        dividendAmount: 20662.5,
        patronageAmount: 0,
        taxDeduction: 1087.5,
        netPayable: 20662.5,
        transactionRef: 'DIV-208182-000001',
      },
    ];

    const csv = generateDividendRegisterCsv(rows, '2081/82', 14.5);

    expect(csv).toContain('Member No,Member Name,Share Capital (NPR)');
    expect(csv).toContain('UK-88219');
    expect(csv).toContain('DIV-208182-000001');
  });
});
