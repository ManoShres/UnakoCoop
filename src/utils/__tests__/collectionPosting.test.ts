import { describe, it, expect } from 'vitest';
import {
  buildCollectionReference,
  buildCollectionSheet,
  isDuplicateCollection,
  resolveCollectionTarget,
  summariseMeetingDeposits,
} from '../collectionPosting';
import type {
  Member,
  MotherGroupDeposit,
  MotherGroupMember,
  SavingsAccount,
} from '../../types';

const buildMember = (overrides: Partial<Member> = {}): Member => ({
  id: 'm1',
  memberNo: 'UK-88219',
  name: 'Ram Bahadur Shrestha',
  email: 'ram@example.com',
  phone: '9851023456',
  citizenshipNo: '27-01-72-04912',
  joinedDate: '2021-04-12',
  address: 'Gadhwa-5, Dang',
  status: 'VERIFIED',
  avatarUrl: '',
  shareCapital: 150000,
  totalSavings: 485600,
  activeLoanBalance: 320000,
  accruedDividend: 27800,
  creditScore: 785,
  bankDetails: { bankName: 'NIMB', accountNo: '1234', branch: 'Gadhwa', holderName: 'Ram' },
  kycDocuments: {
    citizenshipFront: true,
    citizenshipBack: true,
    photo: true,
    signature: true,
    utilityBill: true,
  },
  ...overrides,
});

const buildSavings = (overrides: Partial<SavingsAccount> = {}): SavingsAccount => ({
  id: 's1',
  memberId: 'm1',
  accountNo: 'SAV-001-88219',
  accountType: 'Regular Savings',
  balance: 100000,
  interestRate: 7.5,
  openedDate: '2021-04-12',
  status: 'ACTIVE',
  ...overrides,
});

const buildDeposit = (overrides: Partial<MotherGroupDeposit> = {}): MotherGroupDeposit => ({
  id: 'mgd-test-1',
  meetingId: 'mgmt-1',
  motherGroupId: 'mg-001',
  memberId: 'm1',
  memberName: 'Ram Bahadur Shrestha',
  memberNo: 'UK-88219',
  amount: 2000,
  depositDate: '2026-09-13',
  recordedBy: 'EMP-1',
  status: 'PENDING',
  createdAt: '2026-09-13',
  ...overrides,
});

const buildRosterMember = (overrides: Partial<MotherGroupMember> = {}): MotherGroupMember => ({
  id: 'mgm-1',
  motherGroupId: 'mg-001',
  memberId: 'm1',
  memberName: 'Ram Bahadur Shrestha',
  memberNo: 'UK-88219',
  joinedDate: '2024-01-15',
  monthlyContribution: 2000,
  isActive: true,
  createdAt: '2024-01-15',
  ...overrides,
});

describe('Collection posting target resolution', () => {
  it('prefers the regular savings account of the linked cooperative member', () => {
    const savings = [
      buildSavings({ id: 's2', accountNo: 'SAV-002-88219', accountType: 'Fixed Deposit (1 Year)' }),
      buildSavings(),
    ];

    const target = resolveCollectionTarget({ memberId: 'm1', memberNo: 'UK-88219' }, [buildMember()], savings);

    expect(target.error).toBeUndefined();
    expect(target.memberId).toBe('m1');
    expect(target.accountNo).toBe('SAV-001-88219');
  });

  it('resolves members by member number when the id is not supplied', () => {
    const target = resolveCollectionTarget({ memberNo: 'uk-88219' }, [buildMember()], [buildSavings()]);

    expect(target.memberId).toBe('m1');
    expect(target.accountNo).toBe('SAV-001-88219');
  });

  it('returns an error for savers who are not cooperative members', () => {
    const target = resolveCollectionTarget(
      { memberNo: 'UK-99102' },
      [buildMember()],
      [buildSavings()]
    );

    expect(target.error).toMatch(/no matching cooperative member/i);
    expect(target.accountNo).toBeUndefined();
  });

  it('returns an error when the member has no active savings account', () => {
    const savings = [buildSavings({ status: 'DORMANT' })];

    const target = resolveCollectionTarget({ memberId: 'm1', memberNo: 'UK-88219' }, [buildMember()], savings);

    expect(target.memberId).toBe('m1');
    expect(target.error).toMatch(/no active savings account/i);
  });
});

describe('Collection reference numbering', () => {
  it('builds MGCOL references with a padded sequence', () => {
    expect(buildCollectionReference('2081/82', 142)).toBe('MGCOL-2081-000142');
  });

  it('accepts plain fiscal labels and clamps invalid sequences', () => {
    expect(buildCollectionReference('2081', 1)).toBe('MGCOL-2081-000001');
    expect(buildCollectionReference('2081/82', -5)).toBe('MGCOL-2081-000001');
  });
});

describe('Duplicate collection detection', () => {
  it('flags identical member + meeting + amount entries', () => {
    const existing = [buildDeposit()];

    expect(
      isDuplicateCollection(
        { motherGroupId: 'mg-001', meetingId: 'mgmt-1', memberNo: 'uk-88219', amount: 2000 },
        existing
      )
    ).toBe(true);
  });

  it('ignores other meetings, amounts and voided rows', () => {
    const existing = [
      buildDeposit({ id: 'a', meetingId: 'mgmt-2' }),
      buildDeposit({ id: 'b', amount: 999 }),
      buildDeposit({ id: 'c', status: 'VOID' }),
    ];

    expect(
      isDuplicateCollection(
        { motherGroupId: 'mg-001', meetingId: 'mgmt-1', memberNo: 'UK-88219', amount: 2000 },
        existing
      )
    ).toBe(false);
  });
});

describe('Meeting collection summaries', () => {
  it('sums non-void collections and counts attendees', () => {
    const deposits = [
      buildDeposit({ id: 'a', amount: 2000 }),
      buildDeposit({ id: 'b', amount: 1500 }),
      buildDeposit({ id: 'c', amount: 5000, status: 'VOID' }),
    ];

    expect(summariseMeetingDeposits(deposits)).toEqual({ totalCollected: 3500, memberCount: 2 });
  });
});

describe('Collection sheet building', () => {
  it('prefills monthly contributions and existing meeting amounts', () => {
    const roster = [
      buildRosterMember(),
      buildRosterMember({
        id: 'mgm-2',
        memberId: 'm3',
        memberNo: 'UK-76102',
        memberName: 'Bikash Rimal',
        monthlyContribution: 1500,
      }),
      buildRosterMember({ id: 'mgm-3', memberNo: 'UK-00001', memberName: 'Inactive Saver', isActive: false }),
    ];
    const deposits = [buildDeposit({ id: 'existing', amount: 2500 })];
    const members = [buildMember(), buildMember({ id: 'm3', memberNo: 'UK-76102', name: 'Bikash Rimal' })];
    const savings = [buildSavings(), buildSavings({ id: 's9', memberId: 'm3', accountNo: 'SAV-009-76102' })];

    const sheet = buildCollectionSheet('mg-001', roster, deposits, 'mgmt-1', members, savings);

    expect(sheet).toHaveLength(2);
    const ram = sheet.find((r) => r.memberNo === 'UK-88219')!;
    expect(ram.amount).toBe(2500);
    expect(ram.depositId).toBe('existing');
    expect(ram.canPost).toBe(true);
    expect(ram.linkedAccountNo).toBe('SAV-001-88219');

    const other = sheet.find((r) => r.memberNo === 'UK-76102')!;
    expect(other.amount).toBe(1500);
    expect(other.depositId).toBeUndefined();
    expect(other.linkedAccountNo).toBe('SAV-009-76102');
  });

  it('marks unregistered savers as not postable', () => {
    const roster = [
      buildRosterMember({
        id: 'mgm-u',
        memberId: undefined,
        memberNo: 'UK-99102',
        memberName: 'Anita Devi Magar',
      }),
    ];

    const sheet = buildCollectionSheet('mg-001', roster, [], 'mgmt-1', [buildMember()], [buildSavings()]);

    expect(sheet[0].canPost).toBe(false);
    expect(sheet[0].linkedAccountNo).toBeUndefined();
  });
});

