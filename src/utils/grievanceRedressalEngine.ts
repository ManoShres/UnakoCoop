/**
 * Institutional Grievance Redressal, Ombudsman & Regulatory Whistleblower Engine
 * (संस्थागत गुनासो सुनुवाइ, लोकपाल तथा उजुरी छानबिन प्रणाली)
 * 
 * Complies with:
 * - Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) Good Governance & Member Rights
 * - Department of Cooperatives Consumer Protection & Grievance Redressal Directives
 * - Supervisory Committee (लेखा सुपरिवेक्षण समिति) Internal Ombudsman Standards
 */

export type GrievanceCategory =
  | 'TELLER_SERVICE'
  | 'INTEREST_CALCULATION'
  | 'LOAN_APPRAISAL'
  | 'SHARE_DIVIDEND'
  | 'STAFF_MISCONDUCT'
  | 'BOARD_GOVERNANCE'
  | 'DIGITAL_BANKING'
  | 'GENERAL_OTHER';

export type GrievanceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PrivacyMode = 'PUBLIC' | 'CONFIDENTIAL' | 'ANONYMOUS_WHISTLEBLOWER';

export type GrievanceStatus =
  | 'SUBMITTED'
  | 'UNDER_INQUIRY'
  | 'HEARING_SCHEDULED'
  | 'ESCALATED_TO_AUDIT'
  | 'RESOLVED'
  | 'DISMISSED';

export type EscalationTier =
  | 'TIER_1_OFFICER'
  | 'TIER_2_AUDIT_COMMITTEE'
  | 'TIER_3_BOARD_REGISTRAR';

export type CorrectiveActionType =
  | 'FINANCIAL_COMPENSATION'
  | 'SYSTEM_CORRECTION'
  | 'ADMINISTRATIVE_WARNING'
  | 'APOLOGY_EXPLANATION'
  | 'NO_ACTION_REQUIRED';

export interface InvestigationLog {
  id: string;
  date: string;
  investigator: string;
  action: string;
  notes: string;
}

export interface ResolutionDetails {
  resolvedDate: string;
  decisionSummary: string;
  correctiveActionType: CorrectiveActionType;
  compensationAmount?: number;
  hearingChairedBy: string;
  complainantAccepted: boolean;
}

export interface GrievanceRecord {
  id: string;
  ticketNumber: string;
  submissionDate: string;
  complainantName: string;
  memberNumber?: string;
  phone?: string;
  email?: string;
  category: GrievanceCategory;
  severity: GrievanceSeverity;
  privacy: PrivacyMode;
  title: string;
  description: string;
  branchName: string;
  slaDeadlineDays: number;
  status: GrievanceStatus;
  currentTier: EscalationTier;
  investigationLogs: InvestigationLog[];
  resolution?: ResolutionDetails;
  evidenceFiles?: string[];
}

export interface GrievanceMetrics {
  totalCount: number;
  openCount: number;
  inquiryCount: number;
  hearingScheduledCount: number;
  escalatedCount: number;
  resolvedCount: number;
  dismissedCount: number;
  slaBreachCount: number;
  avgResolutionDays: number;
  totalCompensationAmount: number;
  categoryBreakdown: Record<GrievanceCategory, number>;
  severityBreakdown: Record<GrievanceSeverity, number>;
  privacyBreakdown: Record<PrivacyMode, number>;
  resolutionRatePercent: number;
}

export const CATEGORY_LABELS: Record<GrievanceCategory, { np: string; en: string }> = {
  TELLER_SERVICE: { np: 'काउन्टर सेवा तथा कर्मचारी व्यवहार', en: 'Teller & Counter Service' },
  INTEREST_CALCULATION: { np: 'ब्याज हिसाब तथा हर्जना विवाद', en: 'Interest & Penalty Calculation' },
  LOAN_APPRAISAL: { np: 'कर्जा प्रक्रिया तथा धितो विवाद', en: 'Loan Appraisal & Collateral' },
  SHARE_DIVIDEND: { np: 'शेयर लाभांश तथा संरक्षित पूँजी फिर्ता', en: 'Share Dividend & Patronage' },
  STAFF_MISCONDUCT: { np: 'कर्मचारी आचारसंहिता तथा अनियमितता', en: 'Staff Misconduct & Integrity' },
  BOARD_GOVERNANCE: { np: 'सञ्चालक समिति निर्णय तथा स्वार्थको द्वन्द्व', en: 'Board Governance & Ethics' },
  DIGITAL_BANKING: { np: 'मोबाइल बैंकिङ तथा विद्युतीय कारोबार', en: 'Mobile Banking & Electronic Txn' },
  GENERAL_OTHER: { np: 'अन्य साधारण गुनासो', en: 'General Inquiries & Feedback' },
};

export const SEVERITY_CONFIG: Record<GrievanceSeverity, { np: string; en: string; color: string }> = {
  LOW: { np: 'न्यून (सामान्य)', en: 'Low', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
  MEDIUM: { np: 'मध्यम', en: 'Medium', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
  HIGH: { np: 'उच्च (गम्भीर)', en: 'High', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30' },
  CRITICAL: { np: 'अति-गम्भीर (तत्काल छानबिन)', en: 'Critical', color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' },
};

export const STATUS_CONFIG: Record<GrievanceStatus, { np: string; en: string; badgeClass: string }> = {
  SUBMITTED: { np: 'दर्ता भएको', en: 'Submitted', badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
  UNDER_INQUIRY: { np: 'छानबिन प्रक्रियामा', en: 'Under Inquiry', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  HEARING_SCHEDULED: { np: 'सुनुवाइ तोकिएको', en: 'Hearing Scheduled', badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  ESCALATED_TO_AUDIT: { np: 'लेखा समितिमा सिफारिस', en: 'Escalated to Audit', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' },
  RESOLVED: { np: 'समाधान भएको', en: 'Resolved', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  DISMISSED: { np: 'खारेज / प्रमाण नपुगेको', en: 'Dismissed', badgeClass: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
};

export const TIER_CONFIG: Record<EscalationTier, { np: string; en: string }> = {
  TIER_1_OFFICER: { np: 'तह १: गुनासो सुन्ने अधिकृत / शाखा प्रमुख', en: 'Tier 1: Grievance Officer / Branch Manager' },
  TIER_2_AUDIT_COMMITTEE: { np: 'तह २: लेखा सुपरिवेक्षण समिति (आन्तरिक लोकपाल)', en: 'Tier 2: Supervisory & Audit Committee' },
  TIER_3_BOARD_REGISTRAR: { np: 'तह ३: सञ्चालक समिति / सहकारी रजिष्ट्रार कार्यालय', en: 'Tier 3: Board of Directors / Regulating Authority' },
};

/**
 * Calculates calendar day difference between two YYYY-MM-DD date strings.
 */
export function calculateDaysBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();
  if (isNaN(start) || isNaN(end)) return 0;
  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
}

/**
 * Checks if a grievance has exceeded its statutory SLA deadline.
 */
export function checkSlaBreach(record: GrievanceRecord, referenceDate?: string): boolean {
  if (record.status === 'RESOLVED' || record.status === 'DISMISSED') {
    if (!record.resolution?.resolvedDate) return false;
    const daysTaken = calculateDaysBetween(record.submissionDate, record.resolution.resolvedDate);
    return daysTaken > record.slaDeadlineDays;
  }

  const today = referenceDate || new Date().toISOString().split('T')[0];
  const elapsed = calculateDaysBetween(record.submissionDate, today);
  return elapsed > record.slaDeadlineDays;
}

/**
 * Days remaining until SLA breach, or negative days if already breached.
 */
export function daysRemainingForSla(record: GrievanceRecord, referenceDate?: string): number {
  if (record.status === 'RESOLVED' || record.status === 'DISMISSED') {
    return 0;
  }
  const today = referenceDate || new Date().toISOString().split('T')[0];
  const elapsed = calculateDaysBetween(record.submissionDate, today);
  return record.slaDeadlineDays - elapsed;
}

/**
 * Computes institutional metrics across the grievance registry.
 */
export function calculateGrievanceMetrics(
  records: readonly GrievanceRecord[],
  referenceDate?: string
): GrievanceMetrics {
  const initialCategoryBreakdown: Record<GrievanceCategory, number> = {
    TELLER_SERVICE: 0,
    INTEREST_CALCULATION: 0,
    LOAN_APPRAISAL: 0,
    SHARE_DIVIDEND: 0,
    STAFF_MISCONDUCT: 0,
    BOARD_GOVERNANCE: 0,
    DIGITAL_BANKING: 0,
    GENERAL_OTHER: 0,
  };

  const initialSeverityBreakdown: Record<GrievanceSeverity, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  const initialPrivacyBreakdown: Record<PrivacyMode, number> = {
    PUBLIC: 0,
    CONFIDENTIAL: 0,
    ANONYMOUS_WHISTLEBLOWER: 0,
  };

  let openCount = 0;
  let inquiryCount = 0;
  let hearingScheduledCount = 0;
  let escalatedCount = 0;
  let resolvedCount = 0;
  let dismissedCount = 0;
  let slaBreachCount = 0;
  let totalResolutionDays = 0;
  let totalCompensationAmount = 0;

  const categoryBreakdown = { ...initialCategoryBreakdown };
  const severityBreakdown = { ...initialSeverityBreakdown };
  const privacyBreakdown = { ...initialPrivacyBreakdown };

  records.forEach((rec) => {
    categoryBreakdown[rec.category] = (categoryBreakdown[rec.category] || 0) + 1;
    severityBreakdown[rec.severity] = (severityBreakdown[rec.severity] || 0) + 1;
    privacyBreakdown[rec.privacy] = (privacyBreakdown[rec.privacy] || 0) + 1;

    if (rec.status === 'SUBMITTED') openCount += 1;
    else if (rec.status === 'UNDER_INQUIRY') inquiryCount += 1;
    else if (rec.status === 'HEARING_SCHEDULED') hearingScheduledCount += 1;
    else if (rec.status === 'ESCALATED_TO_AUDIT') escalatedCount += 1;
    else if (rec.status === 'RESOLVED') {
      resolvedCount += 1;
      if (rec.resolution?.resolvedDate) {
        totalResolutionDays += calculateDaysBetween(rec.submissionDate, rec.resolution.resolvedDate);
      }
      if (rec.resolution?.compensationAmount) {
        totalCompensationAmount += rec.resolution.compensationAmount;
      }
    } else if (rec.status === 'DISMISSED') {
      dismissedCount += 1;
    }

    if (checkSlaBreach(rec, referenceDate)) {
      slaBreachCount += 1;
    }
  });

  const totalCount = records.length;
  const avgResolutionDays = resolvedCount > 0 ? Math.round((totalResolutionDays / resolvedCount) * 10) / 10 : 0;
  const resolutionRatePercent = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 1000) / 10 : 0;

  return {
    totalCount,
    openCount,
    inquiryCount,
    hearingScheduledCount,
    escalatedCount,
    resolvedCount,
    dismissedCount,
    slaBreachCount,
    avgResolutionDays,
    totalCompensationAmount,
    categoryBreakdown,
    severityBreakdown,
    privacyBreakdown,
    resolutionRatePercent,
  };
}

/**
 * Appends an investigation log note immutably.
 */
export function addInvestigationNote(
  record: GrievanceRecord,
  log: Omit<InvestigationLog, 'id'>
): GrievanceRecord {
  const newLog: InvestigationLog = {
    ...log,
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  };

  return {
    ...record,
    status: record.status === 'SUBMITTED' ? 'UNDER_INQUIRY' : record.status,
    investigationLogs: [...record.investigationLogs, newLog],
  };
}

/**
 * Escalates a grievance to the next tier immutably.
 */
export function escalateGrievance(
  record: GrievanceRecord,
  toTier: EscalationTier,
  reason: string,
  escalatedBy: string
): GrievanceRecord {
  const dateStr = new Date().toISOString().split('T')[0];
  const newLog: InvestigationLog = {
    id: `esc-${Date.now()}`,
    date: dateStr,
    investigator: escalatedBy,
    action: `तह वृद्धि (Escalated to ${toTier})`,
    notes: reason,
  };

  return {
    ...record,
    currentTier: toTier,
    status: toTier === 'TIER_2_AUDIT_COMMITTEE' ? 'ESCALATED_TO_AUDIT' : record.status,
    investigationLogs: [...record.investigationLogs, newLog],
  };
}

/**
 * Resolves a grievance with official decision and optional compensation.
 */
export function resolveGrievance(
  record: GrievanceRecord,
  resolution: ResolutionDetails
): GrievanceRecord {
  const newLog: InvestigationLog = {
    id: `res-${Date.now()}`,
    date: resolution.resolvedDate,
    investigator: resolution.hearingChairedBy,
    action: `गुनासो फर्छ्यौट / निर्णय (Resolution Completed)`,
    notes: `${resolution.decisionSummary} [कार्यवाही: ${resolution.correctiveActionType}${
      resolution.compensationAmount ? `, क्षतिपूर्ति: रु. ${resolution.compensationAmount.toLocaleString()}` : ''
    }]`,
  };

  return {
    ...record,
    status: 'RESOLVED',
    resolution: { ...resolution },
    investigationLogs: [...record.investigationLogs, newLog],
  };
}

/**
 * Formats printable official Hearing Resolution Order / Minutes (निर्णय पर्चा).
 */
export function generateHearingResolutionMinutes(
  record: GrievanceRecord,
  coopName: string = 'उनको बचत तथा ऋण सहकारी संस्था लि. (Unako SACCOS)'
): string {
  const res = record.resolution;
  const isAnonymous = record.privacy === 'ANONYMOUS_WHISTLEBLOWER';
  const complainantDisplayName = isAnonymous ? 'गोप्य उजुरीकर्ता (Whistleblower Protected)' : record.complainantName;
  const categoryLabel = CATEGORY_LABELS[record.category]?.np || record.category;
  const statusLabel = STATUS_CONFIG[record.status]?.np || record.status;
  const tierLabel = TIER_CONFIG[record.currentTier]?.np || record.currentTier;

  return `================================================================================
               ${coopName}
            केन्द्रीय कार्यालय: गढवा-५, दाङ | दर्ता नं: ०७१/०७२
             आन्तरिक लोकपाल तथा गुनासो सुनुवाइ निर्णय पर्चा (HEARING ORDER)
================================================================================

[ १. दर्ता तथा उजुरीको प्रारम्भिक विवरण ]
दर्ता/टिकट नम्बर: ${record.ticketNumber}
दर्ता मिति: ${record.submissionDate}
उजुरीकर्ता: ${complainantDisplayName} ${record.memberNumber && !isAnonymous ? `(सदस्य नं: ${record.memberNumber})` : ''}
सम्पर्क ठेगाना: ${isAnonymous ? '[संरक्षित / गोप्य]' : record.phone || 'उपलब्ध छैन'}
सम्बन्धित शाखा: ${record.branchName}
गुनासोको श्रेणी: ${categoryLabel}
संवेदनशीलता स्तर: ${SEVERITY_CONFIG[record.severity].np}
हालको सुनुवाइ तह: ${tierLabel}
हालको अवस्था: ${statusLabel}

[ २. उजुरी/गुनासोको विषयवस्तु र माग ]
विषय: ${record.title}
विस्तृत व्यहोरा:
${record.description}

[ ३. छानबिन तथा सुनुवाइको संक्षिप्त प्रतिवेदन ]
${record.investigationLogs.length > 0
  ? record.investigationLogs.map((l, idx) => `  ${idx + 1}. [${l.date}] ${l.action} (जाँचकर्ता: ${l.investigator})\n     कैफियत: ${l.notes}`).join('\n')
  : '  कुनै प्रारम्भिक टिप्पणी अभिलेख भएको छैन।'
}

[ ४. आधिकारिक सुनुवाइ निर्णय तथा आदेश ]
${res ? `फर्छ्यौट मिति: ${res.resolvedDate}
सुनुवाइ समिति संयोजक / अधिकृत: ${res.hearingChairedBy}
सुधारात्मक कदमको प्रकृति: ${res.correctiveActionType}
${res.compensationAmount ? `स्वीकृत क्षतिपूर्ति / हिसाब मिलान रकम: रु. ${res.compensationAmount.toLocaleString('en-IN')}` : 'कुनै आर्थिक दाबी/क्षतिपूर्ति समावेश छैन।'}
उजुरीकर्ताद्वारा निर्णय स्वीकार्यता: ${res.complainantAccepted ? 'स्वीकृत (सहमति पत्र प्राप्त)' : 'स्वीकृति पर्खिरहेको'}

निर्णयको पूर्ण व्यहोरा:
${res.decisionSummary}` : 'उजुरी अझै छानबिन/कारवाही प्रक्रियामा रहेको छ। अन्तिम निर्णय हुन बाँकी छ।'}

[ ५. अनुपालन तथा पुनरावेदन अधिकार ]
सहकारी ऐन २०७४ तथा संस्थाको गुनासो व्यवस्थापन कार्यविधि बमोजिम यो निर्णय उपर चित्त नबुझेमा
१५ दिनभित्र संस्थाको लेखा सुपरिवेक्षण समिति वा सहकारी रजिष्ट्रारको कार्यालयमा पुनरावेदन गर्न सकिनेछ।

हस्ताक्षर (संयोजक / सुनुवाइ अधिकृत): ________________________
हस्ताक्षर (उजुरीकर्ता / प्रतिनिधि):   ________________________
मिति: ${res?.resolvedDate || new Date().toISOString().split('T')[0]}
================================================================================`;
}

/**
 * Generates CSV Export data.
 */
export function exportGrievancesToCSV(records: readonly GrievanceRecord[]): string {
  const headers = [
    'Ticket Number',
    'Date',
    'Complainant',
    'Member No',
    'Category',
    'Severity',
    'Privacy',
    'Branch',
    'Status',
    'Current Tier',
    'SLA Days',
    'SLA Status',
    'Resolution Date',
    'Compensation (NPR)',
    'Summary',
  ];

  const rows = records.map((r) => {
    const isAnon = r.privacy === 'ANONYMOUS_WHISTLEBLOWER';
    const isBreached = checkSlaBreach(r);
    return [
      `"${r.ticketNumber}"`,
      `"${r.submissionDate}"`,
      `"${isAnon ? 'ANONYMOUS' : r.complainantName}"`,
      `"${isAnon ? '-' : r.memberNumber || '-'}"`,
      `"${r.category}"`,
      `"${r.severity}"`,
      `"${r.privacy}"`,
      `"${r.branchName}"`,
      `"${r.status}"`,
      `"${r.currentTier}"`,
      r.slaDeadlineDays,
      `"${isBreached ? 'BREACHED' : 'ON_TRACK'}"`,
      `"${r.resolution?.resolvedDate || '-'}"`,
      r.resolution?.compensationAmount || 0,
      `"${r.title.replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Realistic default seed records for Unako SACCOS.
 */
export const DEFAULT_GRIEVANCE_RECORDS: GrievanceRecord[] = [
  {
    id: 'grv-001',
    ticketNumber: 'GRV-2080-001',
    submissionDate: '2080-11-15',
    complainantName: 'रामबहादुर चौधरी',
    memberNumber: 'M-1024',
    phone: '9847800000',
    email: 'ram.chaudhary@example.com',
    category: 'INTEREST_CALCULATION',
    severity: 'MEDIUM',
    privacy: 'PUBLIC',
    title: 'व्यावसायिक कृषि कर्जामा अतिरिक्त २ महिनाको हर्जना ब्याज गणना विवाद',
    description: 'मैले समयमै किस्ता बुझाउँदा पनि प्रणालीमा प्राविधिक कारणले ढिला प्रविष्टि भई रु. ३,४५० हर्जना ब्याज थपिएको छ। हिसाब सच्याई रकम फिर्ता पाऊँ।',
    branchName: 'गढवा मुख्य शाखा',
    slaDeadlineDays: 15,
    status: 'RESOLVED',
    currentTier: 'TIER_1_OFFICER',
    investigationLogs: [
      {
        id: 'log-1',
        date: '2080-11-16',
        investigator: 'सुमन केसी (ऋण अधिकृत)',
        action: 'स्रेस्ता तथा भौचर रुजु',
        notes: 'सदस्यले २०८०/१०/२८ मा बैंकमार्फत दाखिला गरेको भौचर भौचर प्रविष्टि हुन छुटेको पाइयो। प्रणाली प्राविधिक त्रुटि पुष्टि भयो।',
      },
      {
        id: 'log-2',
        date: '2080-11-18',
        investigator: 'दिनेश घिमिरे (शाखा प्रबन्धक)',
        action: 'हर्जना फिर्ता स्वीकृति',
        notes: 'रु. ३,४५० हर्जना ब्याज सदस्यको बचत खातामा फिर्ता गर्ने निर्णय गरियो।',
      },
    ],
    resolution: {
      resolvedDate: '2080-11-18',
      decisionSummary: 'सदस्यको बैंक भौचर समयमै दाखिल भएको यकिन भएकोले अनावश्यक थपिएको हर्जना रु. ३,४५० नियमित बचत खातामा क्रेडिट गरी फर्छ्यौट गरियो।',
      correctiveActionType: 'FINANCIAL_COMPENSATION',
      compensationAmount: 3450,
      hearingChairedBy: 'दिनेश घिमिरे (शाखा प्रबन्धक)',
      complainantAccepted: true,
    },
  },
  {
    id: 'grv-002',
    ticketNumber: 'GRV-2080-002',
    submissionDate: '2080-12-01',
    complainantName: 'सीता कुमारी थापा',
    memberNumber: 'M-0582',
    phone: '9857800000',
    category: 'TELLER_SERVICE',
    severity: 'LOW',
    privacy: 'PUBLIC',
    title: 'काउन्टरमा बचत पासबुक प्रिन्ट नभएको र कर्मचारीबाट ढिलासुस्ती',
    description: 'भाद्र महिनादेखि पासबुक प्रिन्टर बिग्रिएको भन्दै काउन्टरमा हस्तलिखित हिसाब मात्र दिइयो, औपचारिक पासबुक अद्यावधिक हुन सकेन।',
    branchName: 'लमही सेवा केन्द्र',
    slaDeadlineDays: 7,
    status: 'RESOLVED',
    currentTier: 'TIER_1_OFFICER',
    investigationLogs: [
      {
        id: 'log-3',
        date: '2080-12-02',
        investigator: 'प्रकाश यादव (सेवा केन्द्र इन्चार्ज)',
        action: 'उपकरण मर्मत तथा पासबुक जारी',
        notes: 'पासबुक प्रिन्टर नयाँ जडान गरी सदस्यको सम्पूर्ण कारोबार प्रिन्ट गरी हस्तान्तरण गरियो।',
      },
    ],
    resolution: {
      resolvedDate: '2080-12-04',
      decisionSummary: 'नयाँ पासबुक प्रिन्टर जडान गरी सम्पूर्ण रोक्का/बचत विवरण प्रिन्ट गरी सदस्यलाई दिइयो र काउन्टर कर्मचारीलाई शिष्ट व्यवहारका लागि सचेत गराइयो।',
      correctiveActionType: 'SYSTEM_CORRECTION',
      compensationAmount: 0,
      hearingChairedBy: 'प्रकाश यादव (सेवा केन्द्र इन्चार्ज)',
      complainantAccepted: true,
    },
  },
  {
    id: 'grv-003',
    ticketNumber: 'GRV-2080-003',
    submissionDate: '2080-12-10',
    complainantName: 'गोप्य उजुरीकर्ता (सुरक्षित व्हिसलब्लोअर)',
    category: 'STAFF_MISCONDUCT',
    severity: 'CRITICAL',
    privacy: 'ANONYMOUS_WHISTLEBLOWER',
    title: 'दैनिक बचत संकलनकर्ताबाट रसिद नदिई नगद रकम निजी खातामा प्रयोग गरिएको आशंका',
    description: 'हाम्रो वडामा बजार संकलनकर्ताले नियमित बचत रकम लिएपछि संस्थाको आधिकारिक रसिद नदिई हस्तलिखित डायरीमा मात्र सही गर्ने गरेको र रकम संस्थामा दाखिल हुन ढिलाइ भएको आशंका छ।',
    branchName: 'गढवा मुख्य शाखा',
    slaDeadlineDays: 7,
    status: 'ESCALATED_TO_AUDIT',
    currentTier: 'TIER_2_AUDIT_COMMITTEE',
    investigationLogs: [
      {
        id: 'log-4',
        date: '2080-12-12',
        investigator: 'आन्तरिक लेखा परीक्षण अधिकृत',
        action: 'बजार संकलन आकस्मिक अडिट',
        notes: 'सम्बन्धित संकलनकर्ताको क्षेत्रमा २० जना सदस्यको स्थलगत रोक्का रुजु गर्दा रु. ४५,००० रकम २ दिनपछि दाखिला गरेको देखियो। लेखा सुपरिवेक्षण समितिमा सिफारिस।',
      },
    ],
  },
  {
    id: 'grv-004',
    ticketNumber: 'GRV-2080-004',
    submissionDate: '2080-12-15',
    complainantName: 'केशव राज शर्मा',
    memberNumber: 'M-1980',
    phone: '9800000000',
    category: 'LOAN_APPRAISAL',
    severity: 'HIGH',
    privacy: 'CONFIDENTIAL',
    title: 'घरजग्गा धितो मूल्याङ्कनमा ढिलाइ र ऋण उपसमितिको अस्पष्ट निर्णय',
    description: 'धितो मूल्यांकन शुल्क बुझाएको २५ दिन बितिसक्दा पनि फिल्ड रिपोर्ट तयार नभएको र कर्जा स्वीकृत/अस्वीकृतको कुनै आधिकारिक पत्र प्राप्त नभएको।',
    branchName: 'भालुवाङ सेवा केन्द्र',
    slaDeadlineDays: 15,
    status: 'UNDER_INQUIRY',
    currentTier: 'TIER_1_OFFICER',
    investigationLogs: [
      {
        id: 'log-5',
        date: '2080-12-16',
        investigator: 'कर्जा उपसमिति सदस्य-सचिव',
        action: 'फाइल अध्ययन तथा प्राविधिक मूल्यांकनकर्तासँग समन्वय',
        notes: 'सडक पहुँचको बाटो सम्बन्धी नापी नक्सामा कैफियत देखिएकोले नापी कार्यालयको सिफारिस मगाइएको। ३ दिनभित्र प्रतिवेदन पेश गर्न निर्देशन।',
      },
    ],
  },
  {
    id: 'grv-005',
    ticketNumber: 'GRV-2080-005',
    submissionDate: '2080-12-18',
    complainantName: 'उर्मिला देवी चौधरी',
    memberNumber: 'M-0412',
    category: 'DIGITAL_BANKING',
    severity: 'MEDIUM',
    privacy: 'PUBLIC',
    title: 'मोबाइल बैंकिङ क्युआर भुक्तानी गर्दा बचत खाताबाट रकम काटिएको तर पसलमा जम्मा नभएको',
    description: 'मिति २०८०/१२/१७ मा किराना पसलमा रु. २,१०० भुक्तानी गर्दा खाताबाट पैसा घट्यो तर सफल भएको सन्देश आएन र व्यापारीले सामान दिएन। रकम फिर्ता गरिदिनुहोस्।',
    branchName: 'गढवा मुख्य शाखा',
    slaDeadlineDays: 7,
    status: 'HEARING_SCHEDULED',
    currentTier: 'TIER_1_OFFICER',
    investigationLogs: [
      {
        id: 'log-6',
        date: '2080-12-19',
        investigator: 'आइटी अधिकृत',
        action: 'पेमेन्ट गेटवे लग छानबिन',
        notes: 'NCHL / Fonepay गेटवेमा टाइम-आउट देखिएको। सेटलमेन्ट रिपोर्ट अनुसार रकम रिकन्सिलेसन भई संस्थाको पुल खातामा फिर्ता आएको भेटियो।',
      },
    ],
  },
];
