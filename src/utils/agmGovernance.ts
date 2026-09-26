/**
 * Cooperative Annual General Meeting (AGM) Attendance, Quorum & Proxy Engine
 *
 * Implements statutory standards under Section 39 (दफा ३९ - साधारण सभा र गणपूरक संख्या)
 * of the Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) requiring >= 51% attendance for legal quorum.
 */

export type AgmAttendanceType = 'PRESENT_IN_PERSON' | 'PROXY_REPRESENTATIVE' | 'ABSENT';
export type ResolutionVote = 'IN_FAVOR' | 'AGAINST' | 'ABSTAIN';

export interface AgmDelegateRow {
  memberId: string;
  memberNo: string;
  memberName: string;
  citizenshipNo: string;
  shareUnits: number;
  attendance: AgmAttendanceType;
  proxyName?: string;
  proxyRelation?: string;
  vote: ResolutionVote;
  checkedInAt?: string;
}

export interface AgmQuorumSummary {
  totalEligibleDelegates: number;
  presentInPersonCount: number;
  proxyCount: number;
  totalPresent: number;
  absentCount: number;
  attendancePercent: number;
  requiredQuorumPercent: number;
  isQuorumAchieved: boolean;
  totalVotingShareUnits: number;
  votesInFavor: number;
  votesAgainst: number;
  votesAbstain: number;
  resolutionStatus: 'PASSED' | 'REJECTED' | 'PENDING';
}

export interface AgmDetailsInput {
  edition: string;
  dateNepali: string;
  venue: string;
}

export interface CoopAgmHeaderInput {
  name: string;
  nameNepali: string;
  regNo: string;
}

/**
 * Calculates statutory quorum and resolution voting tallies under Section 39 of Cooperative Act 2074
 */
export function calculateAgmQuorum(
  roster: readonly AgmDelegateRow[],
  totalEligible: number
): AgmQuorumSummary {
  const totalEligibleDelegates = totalEligible > 0 ? totalEligible : roster.length;

  const presentInPersonCount = roster.filter(
    (r) => r.attendance === 'PRESENT_IN_PERSON'
  ).length;

  const proxyCount = roster.filter(
    (r) => r.attendance === 'PROXY_REPRESENTATIVE'
  ).length;

  const totalPresent = presentInPersonCount + proxyCount;
  const absentCount = Math.max(0, totalEligibleDelegates - totalPresent);

  const attendancePercent =
    totalEligibleDelegates > 0
      ? Math.round((totalPresent / totalEligibleDelegates) * 100 * 10) / 10
      : 0;

  // Statutory quorum requirement: 51% of total voting delegates
  const requiredQuorumPercent = 51;
  const isQuorumAchieved = attendancePercent >= requiredQuorumPercent;

  // Voting metrics
  const activeVoters = roster.filter(
    (r) => r.attendance === 'PRESENT_IN_PERSON' || r.attendance === 'PROXY_REPRESENTATIVE'
  );

  const votesInFavor = activeVoters.filter((r) => r.vote === 'IN_FAVOR').length;
  const votesAgainst = activeVoters.filter((r) => r.vote === 'AGAINST').length;
  const votesAbstain = activeVoters.filter((r) => r.vote === 'ABSTAIN').length;

  const totalVotingShareUnits = activeVoters.reduce(
    (sum, r) => sum + r.shareUnits,
    0
  );

  let resolutionStatus: AgmQuorumSummary['resolutionStatus'] = 'PENDING';
  if (!isQuorumAchieved) {
    resolutionStatus = 'PENDING'; // Without quorum, resolutions cannot legally pass
  } else if (votesInFavor > votesAgainst) {
    resolutionStatus = 'PASSED';
  } else {
    resolutionStatus = 'REJECTED';
  }

  return {
    totalEligibleDelegates,
    presentInPersonCount,
    proxyCount,
    totalPresent,
    absentCount,
    attendancePercent,
    requiredQuorumPercent,
    isQuorumAchieved,
    totalVotingShareUnits,
    votesInFavor,
    votesAgainst,
    votesAbstain,
    resolutionStatus,
  };
}

/**
 * Generates official CSV export of AGM attendance, proxy verification, and resolution tallies
 */
export function generateAgmRosterCsv(
  roster: readonly AgmDelegateRow[],
  summary: AgmQuorumSummary,
  agmDetails: AgmDetailsInput,
  coop: CoopAgmHeaderInput
): string {
  const lines: string[] = [];

  lines.push(`"${coop.nameNepali} (${coop.name})"`);
  lines.push(`"सहकारी ऐन २०७४ को दफा ३९ बमोजिम साधारण सभा उपस्थिति तथा निर्णय पुस्तिका"`);
  lines.push(`"साधारण सभा: ${agmDetails.edition} | मिति: ${agmDetails.dateNepali} | स्थान: ${agmDetails.venue}"`);
  lines.push(
    `"वैधानिक गणपूरक संख्या (Quorum): ${summary.isQuorumAchieved ? 'पुगेको (Achieved)' : 'अपुग (Failed)'} (${summary.attendancePercent}% / आवश्यक ५१%)"`
  );
  lines.push(
    `"कुल उपस्थिति: ${summary.totalPresent}/${summary.totalEligibleDelegates} (स्वयं: ${summary.presentInPersonCount}, वारिस: ${summary.proxyCount}) | प्रस्ताव स्थिति: ${summary.resolutionStatus}"`
  );
  lines.push('');
  lines.push(
    'क्र.सं.,सदस्य नं.,सेयरधनीको नाम,नागरिकता नं.,सेयर कित्ता,उपस्थिति प्रकार,वारिस / प्रतिनिधि,प्रस्ताव मत,चेक-इन समय'
  );

  roster.forEach((r, idx) => {
    lines.push(
      `${idx + 1},${r.memberNo},"${r.memberName}",${r.citizenshipNo},${r.shareUnits},${
        r.attendance
      },"${r.proxyName || '-'}",${r.vote},"${r.checkedInAt || '-'}"`
    );
  });

  lines.push('');
  lines.push(
    `कुल जम्मा (Total),-,${roster.length},-,${summary.totalVotingShareUnits},${summary.totalPresent} उपस्थित (${summary.attendancePercent}%),-,"पक्ष: ${summary.votesInFavor} | विपक्ष: ${summary.votesAgainst}",-`
  );

  return lines.join('\n');
}

/**
 * Initiates browser download of the AGM attendance and proxy CSV
 */
export function downloadAgmRosterCsv(
  roster: readonly AgmDelegateRow[],
  summary: AgmQuorumSummary,
  agmDetails: AgmDetailsInput,
  coop: CoopAgmHeaderInput
): void {
  const csv = generateAgmRosterCsv(roster, summary, agmDetails, coop);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `UNAKO-AGM-ATTENDANCE-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
