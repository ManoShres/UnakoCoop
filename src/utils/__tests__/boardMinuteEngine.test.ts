import { describe, it, expect } from 'vitest';
import {
  calculateMeetingMetrics,
  createBoardMeetingRecord,
  generateResolutionExtractHtml,
  generateMeetingAllowanceCsv,
  DEFAULT_UNAKO_BOARD,
  MeetingAttendance,
} from '../boardMinuteEngine';

describe('Cooperative Act 2074 Sections 41, 42 & 43 Board Minute Book & Governance Engine', () => {
  const sampleAttendances: MeetingAttendance[] = [
    {
      memberId: 'DIR-01',
      status: 'PRESENT',
      hasConflictOfInterest: false,
      grossAllowance: 2000,
      tdsAmount: 300, // 15% of 2000
      netAllowance: 1700,
    },
    {
      memberId: 'DIR-02',
      status: 'PRESENT',
      hasConflictOfInterest: false,
      grossAllowance: 1500,
      tdsAmount: 225, // 15% of 1500
      netAllowance: 1275,
    },
    {
      memberId: 'DIR-03',
      status: 'PRESENT',
      hasConflictOfInterest: false,
      grossAllowance: 1800,
      tdsAmount: 270,
      netAllowance: 1530,
    },
    {
      memberId: 'DIR-04',
      status: 'PRESENT',
      hasConflictOfInterest: true, // Recused on specific loan agenda
      conflictReason: 'Applicant is brother-in-law',
      grossAllowance: 1800,
      tdsAmount: 270,
      netAllowance: 1530,
    },
    {
      memberId: 'DIR-05',
      status: 'PRESENT',
      hasConflictOfInterest: false,
      grossAllowance: 1500,
      tdsAmount: 225,
      netAllowance: 1275,
    },
    {
      memberId: 'DIR-06',
      status: 'ABSENT',
      hasConflictOfInterest: false,
      grossAllowance: 0,
      tdsAmount: 0,
      netAllowance: 0,
    },
    {
      memberId: 'DIR-07',
      status: 'ON_LEAVE',
      hasConflictOfInterest: false,
      grossAllowance: 0,
      tdsAmount: 0,
      netAllowance: 0,
    },
  ];

  it('accurately verifies 51% quorum under Section 42', () => {
    // 5 present out of 7 total seats = 71.43% (Quorum Met!)
    const metrics = calculateMeetingMetrics(7, sampleAttendances);

    expect(metrics.presentCount).toBe(5);
    expect(metrics.quorumPercentage).toBe(71.43);
    expect(metrics.isQuorumMet).toBe(true);
  });

  it('correctly fails quorum check when attendance falls below 51%', () => {
    // Only 2 present out of 7 = 28.57% (< 51%)
    const lowAttendance: MeetingAttendance[] = [
      sampleAttendances[0],
      sampleAttendances[1],
      { ...sampleAttendances[2], status: 'ABSENT', grossAllowance: 0, tdsAmount: 0, netAllowance: 0 },
      { ...sampleAttendances[3], status: 'ABSENT', grossAllowance: 0, tdsAmount: 0, netAllowance: 0 },
      { ...sampleAttendances[4], status: 'ABSENT', grossAllowance: 0, tdsAmount: 0, netAllowance: 0 },
    ];

    const metrics = calculateMeetingMetrics(7, lowAttendance);
    expect(metrics.presentCount).toBe(2);
    expect(metrics.quorumPercentage).toBe(28.57);
    expect(metrics.isQuorumMet).toBe(false);
  });

  it('calculates 15% Income Tax TDS on meeting allowances', () => {
    const metrics = calculateMeetingMetrics(7, sampleAttendances);

    // Total gross = 2000 + 1500 + 1800 + 1800 + 1500 = 8600
    // Total TDS = 300 + 225 + 270 + 270 + 225 = 1290 (15% of 8600)
    // Total Net = 8600 - 1290 = 7310
    expect(metrics.totalGrossAllowance).toBe(8600);
    expect(metrics.totalTdsDeducted).toBe(1290);
    expect(metrics.totalNetAllowance).toBe(7310);
  });

  it('creates a validated Board Meeting Record with agendas', () => {
    const meeting = createBoardMeetingRecord({
      id: 'MTG-2081-06',
      meetingNumber: 142,
      committeeType: 'BOARD_OF_DIRECTORS',
      dateNepali: '2081-06-11',
      dateGregorian: '2024-09-27',
      startTime: '11:00 AM',
      endTime: '02:30 PM',
      venue: 'Unako Central Office Board Room, Gadhawa-5',
      chairpersonName: 'Manoj Kumar Sharma',
      secretaryName: 'Bhoj Raj Thapa',
      totalBoardSeats: 7,
      attendances: sampleAttendances,
      agendas: [
        {
          agendaNumber: 1,
          title: 'Review of Previous Meeting Decisions',
          titleNepali: 'गत बैठकको निर्णय कार्यान्वयन समीक्षा',
          discussionSummary: 'Secretary reported 100% execution of previous resolutions.',
          resolution: 'Previous minutes unanimously confirmed and signed.',
          decisionType: 'UNANIMOUS',
        },
        {
          agendaNumber: 2,
          title: 'Approval of Loan Above NPR 25 Lakhs',
          titleNepali: 'रु २५ लाख माथिका कर्जा प्रस्ताव स्वीकृति',
          discussionSummary: 'Discussion on commercial agriculture loan applications.',
          resolution: 'Approved 3 agricultural mortgage loans totaling NPR 85 Lakhs.',
          decisionType: 'MAJORITY',
          conflictedMembers: ['Sunita Pun Magar'],
        },
      ],
      status: 'APPROVED',
    });

    expect(meeting.isQuorumMet).toBe(true);
    expect(meeting.agendas).toHaveLength(2);
    expect(meeting.agendas[1].conflictedMembers).toContain('Sunita Pun Magar');
  });

  it('generates an official printable Resolution Extract HTML document', () => {
    const meeting = createBoardMeetingRecord({
      id: 'MTG-142',
      meetingNumber: 142,
      committeeType: 'BOARD_OF_DIRECTORS',
      dateNepali: '2081-06-11',
      dateGregorian: '2024-09-27',
      startTime: '11:00 AM',
      endTime: '02:30 PM',
      venue: 'Gadhawa-5',
      chairpersonName: 'Manoj Kumar Sharma',
      secretaryName: 'Bhoj Raj Thapa',
      totalBoardSeats: 7,
      attendances: sampleAttendances,
      agendas: [
        {
          agendaNumber: 1,
          title: 'Cooperative Education Fund Allocation',
          titleNepali: 'सहकारी शिक्षा कोष बाँडफाँड',
          discussionSummary: 'Allocation of 3% surplus to training fund.',
          resolution: 'Surplus allocated per Cooperative Act Sec 68.',
          decisionType: 'UNANIMOUS',
        },
      ],
      status: 'APPROVED',
    });

    const html = generateResolutionExtractHtml(meeting, 1);
    expect(html).toContain('निर्णयको आधिकारिक प्रमाणित प्रतिलिपि');
    expect(html).toContain('बैठक नं. 142');
    expect(html).toContain('सहकारी शिक्षा कोष बाँडफाँड');
    expect(html).toContain('Manoj Kumar Sharma');
    expect(html).toContain('Bhoj Raj Thapa');
  });

  it('generates meeting allowance CSV ledger conforming to Income Tax Sec 88(1)', () => {
    const meeting = createBoardMeetingRecord({
      id: 'MTG-142',
      meetingNumber: 142,
      committeeType: 'BOARD_OF_DIRECTORS',
      dateNepali: '2081-06-11',
      dateGregorian: '2024-09-27',
      startTime: '11:00 AM',
      endTime: '02:30 PM',
      venue: 'Gadhawa-5',
      chairpersonName: 'Manoj Kumar Sharma',
      secretaryName: 'Bhoj Raj Thapa',
      totalBoardSeats: 7,
      attendances: sampleAttendances,
      agendas: [],
      status: 'APPROVED',
    });

    const csv = generateMeetingAllowanceCsv([meeting]);
    expect(csv).toContain('सञ्चालक तथा उपसमिति बैठक भत्ता एवं १५% कर कट्टी (TDS) लेजर');
    expect(csv).toContain('142');
    expect(csv).toContain('8600');
    expect(csv).toContain('1290');
    expect(csv).toContain('7310');
  });
});
