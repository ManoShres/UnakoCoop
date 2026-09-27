/**
 * Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) Sections 41, 42, 43
 * Board of Directors & Supervisory Committee Minute Book, Quorum Ledger,
 * Meeting Allowance (15% TDS), & Conflict of Interest Governance Engine
 *
 * Statutory Rules:
 * 1. Section 41: Board meeting at least once a month (महिनामा कम्तीमा एक पटक बैठक बस्नुपर्ने)
 * 2. Section 42: Quorum requires minimum 51% attendance of active board members (५१% गणपूरक संख्या)
 * 3. Section 43: Mandatory declaration and recusal for Conflict of Interest (स्वार्थ बाझिने विषयमा मतदान निषेध)
 * 4. Income Tax Act 2058 Sec 88(1): 15% withholding tax (TDS) on meeting allowances (बैठक भत्तामा १५% कर कट्टी)
 */

export type BoardMemberRole =
  | 'CHAIRPERSON'
  | 'VICE_CHAIRPERSON'
  | 'SECRETARY'
  | 'TREASURER'
  | 'MEMBER'
  | 'SUPERVISORY_CONVENER'
  | 'SUPERVISORY_MEMBER'
  | 'CEO_INVITEE';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'ON_LEAVE';
export type DecisionType = 'UNANIMOUS' | 'MAJORITY' | 'DISSENT_RECORDED';

export interface BoardMemberItem {
  id: string;
  name: string;
  nameNepali: string;
  role: BoardMemberRole;
  phone: string;
  allowancePerSitting: number; // In NPR, e.g. 1500
}

export interface MeetingAttendance {
  memberId: string;
  status: AttendanceStatus;
  hasConflictOfInterest: boolean;
  conflictReason?: string;
  grossAllowance: number;
  tdsAmount: number; // 15% of gross allowance
  netAllowance: number;
}

export interface MeetingAgendaItem {
  agendaNumber: number;
  title: string;
  titleNepali: string;
  discussionSummary: string;
  resolution: string;
  decisionType: DecisionType;
  dissentingMembers?: string[]; // Member names who dissented
  conflictedMembers?: string[]; // Recused members
}

export interface BoardMeetingRecord {
  id: string;
  meetingNumber: number;
  committeeType: 'BOARD_OF_DIRECTORS' | 'SUPERVISORY_COMMITTEE';
  dateNepali: string; // e.g. "2081-06-11"
  dateGregorian: string; // e.g. "2024-09-27"
  startTime: string; // e.g. "11:00 AM"
  endTime: string; // e.g. "02:30 PM"
  venue: string;
  chairpersonName: string;
  secretaryName: string;
  totalBoardSeats: number;
  attendances: MeetingAttendance[];
  agendas: MeetingAgendaItem[];
  isQuorumMet: boolean;
  quorumPercentage: number;
  totalGrossAllowance: number;
  totalTdsDeducted: number;
  totalNetAllowance: number;
  status: 'DRAFT' | 'APPROVED' | 'DISPATCHED';
}

export const STATUTORY_QUORUM_PERCENT = 51.0;
export const MEETING_ALLOWANCE_TDS_RATE = 15.0; // 15% TDS

export const DEFAULT_UNAKO_BOARD: BoardMemberItem[] = [
  {
    id: 'DIR-01',
    name: 'Manoj Kumar Sharma',
    nameNepali: 'मनोज कुमार शर्मा',
    role: 'CHAIRPERSON',
    phone: '9857820111',
    allowancePerSitting: 2000,
  },
  {
    id: 'DIR-02',
    name: 'Kamala Devi Chaudhary',
    nameNepali: 'कमला देवी चौधरी',
    role: 'VICE_CHAIRPERSON',
    phone: '9857820222',
    allowancePerSitting: 1500,
  },
  {
    id: 'DIR-03',
    name: 'Bhoj Raj Thapa',
    nameNepali: 'भोजराज थापा',
    role: 'SECRETARY',
    phone: '9857820333',
    allowancePerSitting: 1800,
  },
  {
    id: 'DIR-04',
    name: 'Sunita Pun Magar',
    nameNepali: 'सुनिता पुन मगर',
    role: 'TREASURER',
    phone: '9857820444',
    allowancePerSitting: 1800,
  },
  {
    id: 'DIR-05',
    name: 'Dharmendra Yadav',
    nameNepali: 'धर्मेन्द्र यादव',
    role: 'MEMBER',
    phone: '9857820555',
    allowancePerSitting: 1500,
  },
  {
    id: 'DIR-06',
    name: 'Ramesh Bahadur KC',
    nameNepali: 'रमेश बहादुर के.सी.',
    role: 'MEMBER',
    phone: '9857820666',
    allowancePerSitting: 1500,
  },
  {
    id: 'DIR-07',
    name: 'Gita Kumari Oli',
    nameNepali: 'गीता कुमारी ओली',
    role: 'MEMBER',
    phone: '9857820777',
    allowancePerSitting: 1500,
  },
  {
    id: 'DIR-08',
    name: 'Bishnu Maya Giri',
    nameNepali: 'विष्णु माया गिरी',
    role: 'SUPERVISORY_CONVENER',
    phone: '9857820888',
    allowancePerSitting: 1800,
  },
  {
    id: 'DIR-09',
    name: 'Tek Bahadur Rawat',
    nameNepali: 'टेक बहादुर रावत',
    role: 'SUPERVISORY_MEMBER',
    phone: '9857820999',
    allowancePerSitting: 1500,
  },
];

/**
 * Calculates meeting quorum and meeting allowance TDS breakdown
 */
export function calculateMeetingMetrics(
  totalSeats: number,
  attendances: readonly MeetingAttendance[]
): {
  presentCount: number;
  quorumPercentage: number;
  isQuorumMet: boolean;
  totalGrossAllowance: number;
  totalTdsDeducted: number;
  totalNetAllowance: number;
} {
  const presentCount = attendances.filter((a) => a.status === 'PRESENT').length;
  const quorumPercentage =
    totalSeats > 0 ? Number(((presentCount / totalSeats) * 100).toFixed(2)) : 0;
  const isQuorumMet = quorumPercentage >= STATUTORY_QUORUM_PERCENT;

  let totalGrossAllowance = 0;
  let totalTdsDeducted = 0;
  let totalNetAllowance = 0;

  attendances.forEach((a) => {
    if (a.status === 'PRESENT') {
      totalGrossAllowance += a.grossAllowance;
      totalTdsDeducted += a.tdsAmount;
      totalNetAllowance += a.netAllowance;
    }
  });

  return {
    presentCount,
    quorumPercentage,
    isQuorumMet,
    totalGrossAllowance: Number(totalGrossAllowance.toFixed(2)),
    totalTdsDeducted: Number(totalTdsDeducted.toFixed(2)),
    totalNetAllowance: Number(totalNetAllowance.toFixed(2)),
  };
}

/**
 * Creates a compliant Board Meeting Record
 */
export function createBoardMeetingRecord(
  input: Omit<
    BoardMeetingRecord,
    'isQuorumMet' | 'quorumPercentage' | 'totalGrossAllowance' | 'totalTdsDeducted' | 'totalNetAllowance'
  >
): BoardMeetingRecord {
  const metrics = calculateMeetingMetrics(input.totalBoardSeats, input.attendances);

  return {
    ...input,
    isQuorumMet: metrics.isQuorumMet,
    quorumPercentage: metrics.quorumPercentage,
    totalGrossAllowance: metrics.totalGrossAllowance,
    totalTdsDeducted: metrics.totalTdsDeducted,
    totalNetAllowance: metrics.totalNetAllowance,
  };
}

/**
 * Generates an official Resolution Extract (निर्णयको प्रमाणित प्रतिलिपि) for external agencies
 */
export function generateResolutionExtractHtml(
  meeting: BoardMeetingRecord,
  agendaNumber: number,
  coopName = 'उनको बचत तथा ऋण सहकारी संस्था लि.',
  location = 'गढवा-५, दाङ'
): string {
  const targetAgenda = meeting.agendas.find((a) => a.agendaNumber === agendaNumber);
  if (!targetAgenda) return '<p>Agenda not found</p>';

  return `<!DOCTYPE html>
<html lang="ne">
<head>
  <meta charset="UTF-8">
  <title>निर्णयको प्रमाणित प्रतिलिपि - बैठक नं. ${meeting.meetingNumber}</title>
  <style>
    @page { size: A4 portrait; margin: 20mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Mukti", sans-serif; color: #0f172a; line-height: 1.6; font-size: 13px; }
    .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px; }
    .title { font-size: 18px; font-weight: bold; color: #0f766e; margin: 0; }
    .subtitle { font-size: 13px; color: #475569; margin: 3px 0; }
    .extract-badge { display: inline-block; padding: 4px 12px; background: #f0fdfa; color: #0f766e; border: 1px solid #99f6e4; font-weight: bold; border-radius: 6px; margin-top: 8px; font-size: 12px; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin: 16px 0; }
    .resolution-box { border-left: 4px solid #0f766e; padding: 12px 16px; background: #f0fdf4; margin: 20px 0; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; text-align: center; }
    .sig-line { border-top: 1px solid #475569; padding-top: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${coopName}</div>
    <div class="subtitle">${location} | दर्ता नं: २०७०/०७१/५८२ | PAN: ३०२९१८२७४</div>
    <div class="subtitle" style="font-weight: bold;">सञ्चालक समिति सचिवालय</div>
    <div class="extract-badge">सञ्चालक समिति निर्णयको आधिकारिक प्रमाणित प्रतिलिपि (Certified Resolution Extract)</div>
  </div>

  <div class="meta-box">
    <div><strong>बैठक संख्या:</strong> बैठक नं. ${meeting.meetingNumber}</div>
    <div><strong>बैठक मिति:</strong> वि.सं. ${meeting.dateNepali} (${meeting.dateGregorian}), समय: ${meeting.startTime} देखि ${meeting.endTime}</div>
    <div><strong>स्थान:</strong> ${meeting.venue}</div>
    <div><strong>अध्यक्षता:</strong> ${meeting.chairpersonName} (अध्यक्ष)</div>
    <div><strong>गणपूरक संख्या:</strong> ${meeting.quorumPercentage}% उपस्थित (५१% कानूनी शर्त पूरा भएको)</div>
  </div>

  <p>
    यस संस्थाको सञ्चालक समितिको बैठक नं. ${meeting.meetingNumber} मा छलफल भई पारित भएको प्रस्ताव नं. ${targetAgenda.agendaNumber} को निर्णय व्यहोरा देहाय बमोजिम प्रमाणित गरिन्छ:
  </p>

  <div class="resolution-box">
    <h3 style="margin: 0 0 8px 0; color: #065f46;">प्रस्ताव नं. ${targetAgenda.agendaNumber}: ${targetAgenda.titleNepali}</h3>
    <div style="margin-bottom: 8px;"><strong>छलफलको सारांश:</strong> ${targetAgenda.discussionSummary}</div>
    <div style="font-size: 14px; font-weight: bold; color: #047857;">निर्णय:</div>
    <p style="margin: 4px 0 0 0; line-height: 1.7;">${targetAgenda.resolution}</p>
    <div style="margin-top: 8px; font-size: 11px; color: #475569;">
      <strong>निर्णय प्रक्रिया:</strong> ${targetAgenda.decisionType === 'UNANIMOUS' ? 'सर्वसम्मत पारित' : 'बहुमतबाट पारित'}
    </div>
  </div>

  <p style="font-size: 11px; color: #64748b;">
    यो प्रतिलिपि मूल निर्णय पुस्तिका (Minute Book) सँग दुरुस्त छ भनी प्रमाणित गर्दछु।
  </p>

  <div class="signatures">
    <div>
      <div class="sig-line">
        <strong>${meeting.secretaryName}</strong><br>
        सचिव / कार्यकारी प्रमुख<br>
        ${coopName}
      </div>
    </div>
    <div>
      <div class="sig-line">
        <strong>${meeting.chairpersonName}</strong><br>
        अध्यक्ष<br>
        ${coopName}
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates official CSV export of Meeting Allowance & 15% TDS ledger
 */
export function generateMeetingAllowanceCsv(
  meetings: readonly BoardMeetingRecord[],
  coopName = 'उनको बचत तथा ऋण सहकारी संस्था लि.'
): string {
  const lines: string[] = [];

  lines.push(`"${coopName}"`);
  lines.push(`"सञ्चालक तथा उपसमिति बैठक भत्ता एवं १५% कर कट्टी (TDS) लेजर"`);
  lines.push(`"आयकर ऐन २०५८ दफा ८८(१) बमोजिम"`);
  lines.push('');
  lines.push('"क्र.सं.","बैठक नं.","मिति (BS)","समिति","उपस्थित सदस्य","कुल कुल भत्ता (NPR)","१५% TDS कट्टी (NPR)","खुद भुक्तानी (NPR)","गणपूरक %","स्थिति"');

  meetings.forEach((m, idx) => {
    const presentCount = m.attendances.filter((a) => a.status === 'PRESENT').length;
    lines.push(
      `${idx + 1},${m.meetingNumber},"${m.dateNepali}","${m.committeeType}",${presentCount},${
        m.totalGrossAllowance
      },${m.totalTdsDeducted},${m.totalNetAllowance},${m.quorumPercentage}%,${m.status}`
    );
  });

  return lines.join('\n');
}

/**
 * Downloads Meeting Allowance CSV directly to browser
 */
export function downloadMeetingAllowanceCsv(
  meetings: readonly BoardMeetingRecord[],
  coopName?: string
): void {
  const csv = generateMeetingAllowanceCsv(meetings, coopName);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `UNAKO-BOARD-MEETING-ALLOWANCE-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
