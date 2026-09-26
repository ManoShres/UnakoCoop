import { describe, it, expect } from 'vitest';
import {
  generateMeetingLedger,
  calculateLedgerSummary,
  generateMeetingLedgerCsv,
  MeetingLedgerRow,
} from '../motherGroupLedger';
import { MotherGroup, MotherGroupMember, Loan } from '../../types';

describe('Mother Group Meeting Ledger Engine', () => {
  const mockGroup: MotherGroup = {
    id: 'mg-01',
    name: 'Pragati Mahila Bachat Samuha',
    nameNepali: 'प्रगति महिला बचत समूह',
    groupCode: 'MG-GDH-01',
    location: 'Gadhwa-5, Dang',
    contactPerson: 'Sita Chaudhary',
    contactPhone: '9847123456',
    meetingDay: 'Monthly',
    monthlyTargetAmount: 25000,
    totalMembers: 3,
    createdAt: '2080-01-15',
    isActive: true,
    chairpersonName: 'Sita Chaudhary',
    fieldStaffName: 'Bikram Thapa',
    mandatoryContributionPerMember: 500,
  };

  const mockMembers: MotherGroupMember[] = [
    {
      id: 'mgm-1',
      motherGroupId: 'mg-01',
      memberId: 'm-1',
      memberName: 'Sita Chaudhary',
      memberNo: 'UKO-001',
      joinedDate: '2080-01-15',
      monthlyContribution: 500,
      isActive: true,
      createdAt: '2080-01-15',
    },
    {
      id: 'mgm-2',
      motherGroupId: 'mg-01',
      memberId: 'm-2',
      memberName: 'Gita Dangi',
      memberNo: 'UKO-002',
      joinedDate: '2080-01-15',
      monthlyContribution: 500,
      isActive: true,
      createdAt: '2080-01-15',
    },
    {
      id: 'mgm-3',
      motherGroupId: 'mg-01',
      memberId: 'm-3',
      memberName: 'Radha Thapa',
      memberNo: 'UKO-003',
      joinedDate: '2080-01-15',
      monthlyContribution: 500,
      isActive: true,
      createdAt: '2080-01-15',
    },
  ];

  const mockLoans: Loan[] = [
    {
      id: 'ln-1',
      loanNo: 'LN-001',
      memberId: 'm-1',
      loanType: 'Agricultural & Livestock',
      principalAmount: 50000,
      remainingBalance: 30000,
      interestRate: 12,
      tenureMonths: 24,
      monthlyEmi: 2350,
      disbursedDate: '2080-04-01',
      nextDueDate: '2081-08-15',
      status: 'ACTIVE',
      collateralDescription: 'Group Guarantee',
    },
  ];

  describe('Ledger Generation', () => {
    it('generates rows with mandatory savings and linked micro-loans', () => {
      const rows = generateMeetingLedger(mockGroup, mockMembers, mockLoans);

      expect(rows.length).toBe(3);
      expect(rows[0].memberName).toBe('Sita Chaudhary');
      expect(rows[0].mandatorySavings).toBe(500);
      expect(rows[0].loanInterestDue).toBeGreaterThan(0);
      expect(rows[0].totalPayable).toBeGreaterThan(500);

      // Members without loan should only have mandatory savings
      expect(rows[1].loanPrincipalDue).toBe(0);
      expect(rows[1].totalPayable).toBe(500);
    });
  });

  describe('Ledger Summary Calculation', () => {
    it('calculates totals, attendance rate, and collection rate', () => {
      const sampleRows: MeetingLedgerRow[] = [
        {
          id: '1',
          memberId: 'm-1',
          memberName: 'Sita',
          memberNo: 'UKO-001',
          mandatorySavings: 500,
          voluntarySavings: 100,
          loanPrincipalDue: 2000,
          loanInterestDue: 300,
          finePenalty: 0,
          totalPayable: 2900,
          attendance: 'PRESENT',
          isPaid: true,
          paymentMode: 'CASH',
        },
        {
          id: '2',
          memberId: 'm-2',
          memberName: 'Gita',
          memberNo: 'UKO-002',
          mandatorySavings: 500,
          voluntarySavings: 0,
          loanPrincipalDue: 0,
          loanInterestDue: 0,
          finePenalty: 0,
          totalPayable: 500,
          attendance: 'ABSENT',
          isPaid: false,
          paymentMode: 'CASH',
        },
      ];

      const summary = calculateLedgerSummary(sampleRows);

      expect(summary.totalMembers).toBe(2);
      expect(summary.presentCount).toBe(1);
      expect(summary.attendanceRatePercent).toBe(50);
      expect(summary.grandTotalExpected).toBe(3400);
      expect(summary.grandTotalCollected).toBe(2900);
      expect(summary.collectionRatePercent).toBe(85.3);
    });
  });

  describe('CSV Export', () => {
    it('creates formatted CSV with Devanagari headers and totals', () => {
      const rows = generateMeetingLedger(mockGroup, mockMembers, mockLoans);
      const summary = calculateLedgerSummary(rows);
      const csv = generateMeetingLedgerCsv(mockGroup, rows, summary, '2081-08-15');

      expect(csv).toContain('प्रगति महिला बचत समूह');
      expect(csv).toContain('MG-GDH-01');
      expect(csv).toContain('Sita Chaudhary');
      expect(csv).toContain('जम्मा (Total)');
    });
  });
});
