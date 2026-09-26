import { describe, it, expect } from 'vitest';
import {
  calculateAgmQuorum,
  generateAgmRosterCsv,
  AgmDelegateRow,
  AgmDetailsInput,
} from '../agmGovernance';

describe('Cooperative AGM Quorum & Proxy Attendance Engine (साधारण सभा सुशासन)', () => {
  const mockRoster: AgmDelegateRow[] = [
    {
      memberId: 'MEM-001',
      memberNo: 'UKO-2070-08842',
      memberName: 'Hari Prasad Chaudhary',
      citizenshipNo: '38-01-72-04912',
      shareUnits: 500,
      attendance: 'PRESENT_IN_PERSON',
      vote: 'IN_FAVOR',
      checkedInAt: '10:15 AM',
    },
    {
      memberId: 'MEM-002',
      memberNo: 'UKO-2072-01991',
      memberName: 'Bikash Jung Thapa',
      citizenshipNo: '38-01-74-00192',
      shareUnits: 250,
      attendance: 'PROXY_REPRESENTATIVE',
      proxyName: 'Suman Thapa (Brother)',
      vote: 'IN_FAVOR',
      checkedInAt: '10:30 AM',
    },
    {
      memberId: 'MEM-003',
      memberNo: 'UKO-2075-04412',
      memberName: 'Gita Devi Pun',
      citizenshipNo: '38-01-76-04192',
      shareUnits: 150,
      attendance: 'ABSENT',
      vote: 'ABSTAIN',
    },
    {
      memberId: 'MEM-004',
      memberNo: 'UKO-2076-05123',
      memberName: 'Kamala KC',
      citizenshipNo: '38-01-78-01992',
      shareUnits: 100,
      attendance: 'PRESENT_IN_PERSON',
      vote: 'AGAINST',
      checkedInAt: '10:45 AM',
    },
  ];

  it('correctly calculates 51% statutory quorum under Section 39 of Nepal Cooperative Act 2074', () => {
    // 3 present out of 4 = 75% -> Quorum achieved (>= 51%)
    const summary = calculateAgmQuorum(mockRoster, 4);

    expect(summary.totalEligibleDelegates).toBe(4);
    expect(summary.presentInPersonCount).toBe(2);
    expect(summary.proxyCount).toBe(1);
    expect(summary.totalPresent).toBe(3);
    expect(summary.absentCount).toBe(1);
    expect(summary.attendancePercent).toBe(75);
    expect(summary.isQuorumAchieved).toBe(true);
    expect(summary.votesInFavor).toBe(2);
    expect(summary.votesAgainst).toBe(1);
    expect(summary.resolutionStatus).toBe('PASSED');
  });

  it('identifies quorum failure when attendance is below 51%', () => {
    // Only 1 present out of 4 = 25% -> Quorum failed (< 51%)
    const lowAttendanceRoster: AgmDelegateRow[] = [
      {
        memberId: 'MEM-001',
        memberNo: 'UKO-2070-08842',
        memberName: 'Hari Prasad Chaudhary',
        citizenshipNo: '38-01-72-04912',
        shareUnits: 500,
        attendance: 'PRESENT_IN_PERSON',
        vote: 'IN_FAVOR',
      },
      {
        memberId: 'MEM-002',
        memberNo: 'UKO-2072-01991',
        memberName: 'Bikash Jung Thapa',
        citizenshipNo: '38-01-74-00192',
        shareUnits: 250,
        attendance: 'ABSENT',
        vote: 'ABSTAIN',
      },
      {
        memberId: 'MEM-003',
        memberNo: 'UKO-2075-04412',
        memberName: 'Gita Devi Pun',
        citizenshipNo: '38-01-76-04192',
        shareUnits: 150,
        attendance: 'ABSENT',
        vote: 'ABSTAIN',
      },
      {
        memberId: 'MEM-004',
        memberNo: 'UKO-2076-05123',
        memberName: 'Kamala KC',
        citizenshipNo: '38-01-78-01992',
        shareUnits: 100,
        attendance: 'ABSENT',
        vote: 'ABSTAIN',
      },
    ];

    const summary = calculateAgmQuorum(lowAttendanceRoster, 4);
    expect(summary.totalPresent).toBe(1);
    expect(summary.attendancePercent).toBe(25);
    expect(summary.isQuorumAchieved).toBe(false);
    expect(summary.resolutionStatus).toBe('PENDING'); // Cannot pass without legal quorum
  });

  it('generates compliant AGM attendance & proxy CSV for Department of Cooperatives submission', () => {
    const summary = calculateAgmQuorum(mockRoster, 4);
    const agmDetails: AgmDetailsInput = {
      edition: '१४ औं वार्षिक साधारण सभा',
      dateNepali: '२०८१ मंसिर २२',
      venue: 'गढवा उद्योग वाणिज्य संघ हल, दाङ',
    };

    const csv = generateAgmRosterCsv(mockRoster, summary, agmDetails, {
      name: 'Unako SACCOS Ltd.',
      nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
      regNo: '234/065/066',
    });

    expect(csv).toContain('साधारण सभा उपस्थिति तथा निर्णय पुस्तिका');
    expect(csv).toContain('१४ औं वार्षिक साधारण सभा');
    expect(csv).toContain('Hari Prasad Chaudhary');
    expect(csv).toContain('UKO-2070-08842');
    expect(csv).toContain('PRESENT_IN_PERSON');
    expect(csv).toContain('Suman Thapa (Brother)');
    expect(csv).toContain('75%');
  });
});
