/**
 * Microfinance Self-Help Group (Mother Group) Meeting Ledger & Repayment Engine
 * Generates center collection sheets, attendance tracking, and audit CSV exports
 */

import { MotherGroup, MotherGroupMember, Loan } from '../types';

export type MeetingAttendanceStatus = 'PRESENT' | 'ABSENT' | 'REPRESENTATIVE';

export interface MeetingLedgerRow {
  id: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  mandatorySavings: number;
  voluntarySavings: number;
  loanPrincipalDue: number;
  loanInterestDue: number;
  finePenalty: number;
  totalPayable: number;
  attendance: MeetingAttendanceStatus;
  isPaid: boolean;
  paymentMode: 'CASH' | 'QR_PAYMENT' | 'SAVINGS_TRANSFER';
}

export interface MeetingLedgerSummary {
  totalMembers: number;
  presentCount: number;
  attendanceRatePercent: number;
  totalMandatorySavings: number;
  totalVoluntarySavings: number;
  totalLoanPrincipal: number;
  totalLoanInterest: number;
  grandTotalCollected: number;
  grandTotalExpected: number;
  collectionRatePercent: number;
}

/**
 * Compiles a live meeting collection ledger from group members and active loans
 */
export function generateMeetingLedger(
  group: MotherGroup,
  members: readonly MotherGroupMember[],
  activeLoans: readonly Loan[] = []
): MeetingLedgerRow[] {
  const mandatoryAmt = group.mandatoryContributionPerMember || 500;

  return members.map((m) => {
    // Find if member has an active micro-loan
    const memberLoan = activeLoans.find(
      (l) => l.memberId === m.memberId && l.status === 'ACTIVE'
    );

    let loanPrincipalDue = 0;
    let loanInterestDue = 0;

    if (memberLoan && memberLoan.monthlyEmi > 0) {
      // Estimate 80% principal, 20% interest component
      loanInterestDue = Math.round(memberLoan.remainingBalance * (memberLoan.interestRate / 12 / 100));
      loanPrincipalDue = Math.max(0, memberLoan.monthlyEmi - loanInterestDue);
    }

    const voluntarySavings = 0;
    const finePenalty = 0;
    const totalPayable = mandatoryAmt + voluntarySavings + loanPrincipalDue + loanInterestDue + finePenalty;

    return {
      id: `ROW-${m.id}`,
      memberId: m.memberId || m.id,
      memberName: m.memberName,
      memberNo: m.memberNo,
      mandatorySavings: mandatoryAmt,
      voluntarySavings,
      loanPrincipalDue,
      loanInterestDue,
      finePenalty,
      totalPayable,
      attendance: 'PRESENT',
      isPaid: true,
      paymentMode: 'CASH',
    };
  });
}

/**
 * Calculates meeting collection and attendance summary metrics
 */
export function calculateLedgerSummary(rows: readonly MeetingLedgerRow[]): MeetingLedgerSummary {
  const totalMembers = rows.length;
  if (totalMembers === 0) {
    return {
      totalMembers: 0,
      presentCount: 0,
      attendanceRatePercent: 0,
      totalMandatorySavings: 0,
      totalVoluntarySavings: 0,
      totalLoanPrincipal: 0,
      totalLoanInterest: 0,
      grandTotalCollected: 0,
      grandTotalExpected: 0,
      collectionRatePercent: 0,
    };
  }

  const presentCount = rows.filter(
    (r) => r.attendance === 'PRESENT' || r.attendance === 'REPRESENTATIVE'
  ).length;
  const attendanceRatePercent = Math.round((presentCount / totalMembers) * 100 * 10) / 10;

  let totalMandatorySavings = 0;
  let totalVoluntarySavings = 0;
  let totalLoanPrincipal = 0;
  let totalLoanInterest = 0;
  let grandTotalExpected = 0;
  let grandTotalCollected = 0;

  for (const r of rows) {
    grandTotalExpected += r.totalPayable;
    if (r.isPaid) {
      totalMandatorySavings += r.mandatorySavings;
      totalVoluntarySavings += r.voluntarySavings;
      totalLoanPrincipal += r.loanPrincipalDue;
      totalLoanInterest += r.loanInterestDue;
      grandTotalCollected += r.totalPayable;
    }
  }

  const collectionRatePercent =
    grandTotalExpected > 0
      ? Math.round((grandTotalCollected / grandTotalExpected) * 100 * 10) / 10
      : 100;

  return {
    totalMembers,
    presentCount,
    attendanceRatePercent,
    totalMandatorySavings,
    totalVoluntarySavings,
    totalLoanPrincipal,
    totalLoanInterest,
    grandTotalCollected,
    grandTotalExpected,
    collectionRatePercent,
  };
}

/**
 * Generates an official CSV representation of the center collection ledger
 */
export function generateMeetingLedgerCsv(
  group: MotherGroup,
  rows: readonly MeetingLedgerRow[],
  summary: MeetingLedgerSummary,
  meetingDate: string
): string {
  const lines: string[] = [];
  lines.push(`"उनको बचत तथा ऋण सहकारी संस्था लि. (Unako SACCOS Ltd.)"`);
  lines.push(`"मातृ समूह मासिक बैठक तथा किस्ता संकलन लेजर (Center Meeting Attendance & Collection Ledger)"`);
  lines.push(
    `"समूह: ${group.nameNepali || group.name} (${group.groupCode || 'MG-01'}) | स्थान: ${group.location} | बैठक मिति: ${meetingDate}"`
  );
  lines.push(
    `"अध्यक्ष: ${group.chairpersonName || 'N/A'} | सहजकर्ता: ${group.fieldStaffName || 'N/A'}"`
  );
  lines.push('');
  lines.push(
    'क्र.सं.,सदस्यको नाम,सदस्य नं,अनिवार्य बचत,ऐच्छिक बचत,ऋण सावाँ,ऋण ब्याज,कुल बुझाएको,उपस्थिति,भुक्तानी स्थिति,माध्यम'
  );

  rows.forEach((r, idx) => {
    lines.push(
      `${idx + 1},"${r.memberName}",${r.memberNo},${r.mandatorySavings},${r.voluntarySavings},${
        r.loanPrincipalDue
      },${r.loanInterestDue},${r.totalPayable},${r.attendance},${r.isPaid ? 'PAID' : 'DUE'},${
        r.paymentMode
      }`
    );
  });

  lines.push('');
  lines.push(
    `जम्मा (Total),-,${rows.length},${summary.totalMandatorySavings},${summary.totalVoluntarySavings},${
      summary.totalLoanPrincipal
    },${summary.totalLoanInterest},${summary.grandTotalCollected},${summary.attendanceRatePercent}%,${
      summary.collectionRatePercent
    }%,-`
  );

  return lines.join('\n');
}

/**
 * Initiates browser download of the meeting ledger CSV
 */
export function downloadMeetingLedgerCsv(
  group: MotherGroup,
  rows: readonly MeetingLedgerRow[],
  summary: MeetingLedgerSummary,
  meetingDate: string
): void {
  const csv = generateMeetingLedgerCsv(group, rows, summary, meetingDate);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `UNAKO-SHG-LEDGER-${group.groupCode || 'MG'}-${meetingDate.replace(/-/g, '')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
