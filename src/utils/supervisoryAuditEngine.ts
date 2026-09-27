/**
 * Unako SACCOS - Cooperative Internal Audit & Supervisory Committee Engine
 * (लेखा सुपरीवेक्षण समिति त्रैमासिक निरीक्षण तथा आन्तरिक नियन्त्रण प्रणाली)
 *
 * Statutory Framework:
 * - Nepal Cooperative Act 2074 (सहकारी ऐन २०७४)
 *   - Section 48: Formation of Independent Supervisory Committee (लेखा सुपरीवेक्षण समितिको गठन).
 *   - Section 49: Powers, Duties and Functions of Supervisory Committee (लेखा सुपरीवेक्षण समितिको काम, कर्तव्य र अधिकार).
 *   - Directives: Mandatory quarterly inspection, submission of report to BOD, and reporting to AGM.
 *
 * Five Statutory Inspection Pillars:
 * 1. CASH_VAULT_PHYSICAL (ढुकुटी नगद तथा भौतिक मौज्दात जाँच)
 * 2. LOAN_COLLATERAL_CUSTODY (कर्जा तमसुक तथा धितो लालपुर्जा सुरक्षण)
 * 3. RESERVE_LIQUIDITY_COMPLIANCE (अनिवार्य जगेडा कोष तथा तरलता मापदण्ड)
 * 4. GOVERNANCE_BOARD_MINUTES (सञ्चालक समिति निर्णय तथा साधारण सभा कार्यान्वयन)
 * 5. AML_KYC_SUSPICIOUS (शंकास्पद कारोबार तथा सम्पत्ति शुद्धीकरण जाँच)
 */

export type InspectionPillar =
  | 'CASH_VAULT_PHYSICAL'
  | 'LOAN_COLLATERAL_CUSTODY'
  | 'RESERVE_LIQUIDITY_COMPLIANCE'
  | 'GOVERNANCE_BOARD_MINUTES'
  | 'AML_KYC_SUSPICIOUS';

export type ChecklistItemStatus = 'PASS' | 'FAIL' | 'PARTIAL' | 'NOT_APPLICABLE';

export type SupervisoryOverallRating =
  | 'EXCELLENT'          // >= 85%
  | 'SATISFACTORY'       // 70% - 84%
  | 'NEEDS_IMPROVEMENT'  // 50% - 69%
  | 'CRITICAL_RISK';     // < 50%

export interface SupervisoryChecklistItem {
  readonly id: string;
  readonly pillar: InspectionPillar;
  readonly question: string;
  readonly questionNepali: string;
  readonly statutoryRef: string;
  readonly maxScore: number;
  readonly scoreAwarded: number;
  readonly status: ChecklistItemStatus;
  readonly findings?: string;
  readonly findingsNepali?: string;
  readonly recommendation?: string;
  readonly recommendationNepali?: string;
}

export interface CorrectiveActionItem {
  readonly id: string;
  readonly pillar: InspectionPillar;
  readonly findingSummary: string;
  readonly findingSummaryNepali: string;
  readonly actionRequired: string;
  readonly actionRequiredNepali: string;
  readonly assignedTo: 'MANAGER' | 'LOAN_OFFICER' | 'ACCOUNTANT' | 'BOARD';
  readonly deadlineBS: string;
  readonly status: 'PENDING' | 'IN_PROGRESS' | 'RECTIFIED';
  readonly resolutionNote?: string;
}

export interface SupervisoryInspectionReport {
  readonly id: string;
  readonly reportNo: string;
  readonly fiscalYear: string;
  readonly quarterBS: 'FIRST_QUARTER' | 'SECOND_QUARTER' | 'THIRD_QUARTER' | 'FOURTH_QUARTER';
  readonly quarterLabelNepali: string;
  readonly inspectionDateBS: string;
  readonly committeeMembers: {
    readonly convener: string; // संयोजक
    readonly member1: string;  // सदस्य १
    readonly member2: string;  // सदस्य २
  };
  readonly totalScoreAwarded: number;
  readonly maxTotalScore: number;
  readonly scorePercentage: number;
  readonly overallRating: SupervisoryOverallRating;
  readonly items: readonly SupervisoryChecklistItem[];
  readonly correctiveActions: readonly CorrectiveActionItem[];
  readonly executiveSummary: string;
  readonly executiveSummaryNepali: string;
  readonly status: 'DRAFT' | 'SUBMITTED_TO_BOARD' | 'AGM_ADOPTED';
}

export const PILLAR_METADATA: Record<
  InspectionPillar,
  { labelEn: string; labelNe: string; weightPercent: number }
> = {
  CASH_VAULT_PHYSICAL: {
    labelEn: 'Cash Vault & Physical Ledger Balance',
    labelNe: 'ढुकुटी नगद तथा भौतिक मौज्दात जाँच',
    weightPercent: 20,
  },
  LOAN_COLLATERAL_CUSTODY: {
    labelEn: 'Loan Promissory Notes & Collateral Deeds',
    labelNe: 'कर्जा तमसुक तथा धितो लालपुर्जा सुरक्षण',
    weightPercent: 25,
  },
  RESERVE_LIQUIDITY_COMPLIANCE: {
    labelEn: 'Statutory Reserves & Liquidity Band',
    labelNe: 'अनिवार्य जगेडा कोष तथा तरलता मापदण्ड',
    weightPercent: 20,
  },
  GOVERNANCE_BOARD_MINUTES: {
    labelEn: 'Board of Directors Decisions & Bylaws',
    labelNe: 'सञ्चालक समिति निर्णय तथा साधारण सभा कार्यान्वयन',
    weightPercent: 20,
  },
  AML_KYC_SUSPICIOUS: {
    labelEn: 'AML/CFT & Suspicious Transaction Reporting',
    labelNe: 'शंकास्पद कारोबार तथा सम्पत्ति शुद्धीकरण जाँच',
    weightPercent: 15,
  },
};

/**
 * Generate standard default checklist for quarterly internal inspection
 */
export function createDefaultSupervisoryChecklist(): readonly SupervisoryChecklistItem[] {
  return [
    // 1. CASH_VAULT_PHYSICAL
    {
      id: 'CHK-01',
      pillar: 'CASH_VAULT_PHYSICAL',
      question: 'Is surprise physical cash count in vault matching CBS day-end closing cash balance?',
      questionNepali: 'ढुकुटीमा रहेको भौतिक नगद मौज्दात र सीबीएस सफ्टवेयरको नगद लेजर ठ्याक्कै मेल खान्छ?',
      statutoryRef: 'सहकारी ऐन २०७४ दफा ४९(१)(क)',
      maxScore: 10,
      scoreAwarded: 10,
      status: 'PASS',
      findingsNepali: 'ढुकुटी नगद रु. २८,५०,००० सीबीएस लेजरसँग शतप्रतिशत रुजु भएको।',
      recommendationNepali: 'दैनिक नगद सीमा तथा ढुकुटी बिमा पालना कायम राख्ने।',
    },
    {
      id: 'CHK-02',
      pillar: 'CASH_VAULT_PHYSICAL',
      question: 'Is dual-key custody and insurance ceiling of cash in vault strictly maintained?',
      questionNepali: 'ढुकुटीको दोहोरो साँचो व्यवस्था (Dual Custody) र बिमा सीमा भित्र नगद राखिएको छ?',
      statutoryRef: 'आन्तरिक नियन्त्रण मापदण्ड',
      maxScore: 10,
      scoreAwarded: 9,
      status: 'PASS',
      findingsNepali: 'एक साँचो व्यवस्थापक र अर्को साँचो क्यासियरसँग सुरक्षित रहेको।',
    },

    // 2. LOAN_COLLATERAL_CUSTODY
    {
      id: 'CHK-03',
      pillar: 'LOAN_COLLATERAL_CUSTODY',
      question: 'Are borrower promissory notes, land deeds (Lalpurja), and mortgage deeds secured in fireproof safe?',
      questionNepali: 'कर्जा तमसुक, धितो लालपुर्जा, रोक्का पत्र र दृष्टिबन्धक लिखत अग्निरोधक दराजमा सुरक्षित छन्?',
      statutoryRef: 'सहकारी ऐन २०७४ दफा ४९(१)(ख)',
      maxScore: 10,
      scoreAwarded: 9,
      status: 'PASS',
      findingsNepali: 'सबै ऋणीको फाइलमा मालपोत रोक्का पत्र र सक्कल लालपुर्जा सिलबन्दी फेला परेको।',
    },
    {
      id: 'CHK-04',
      pillar: 'LOAN_COLLATERAL_CUSTODY',
      question: 'Are overdue loans classified into correct provisioning categories with required reserves?',
      questionNepali: 'भाखा नाघेका कर्जाको वर्गीकरण (खराब/शंकास्पद) र सो अनुसारको नोक्सानी व्यवस्था गरिएको छ?',
      statutoryRef: 'सहकारी मापदण्ड तथा निर्देशिका',
      maxScore: 15,
      scoreAwarded: 14,
      status: 'PASS',
      findingsNepali: 'एनपीएल ३.१% रहेको र शतप्रतिशत कर्जा नोक्सानी जगेडा कायम गरिएको।',
    },

    // 3. RESERVE_LIQUIDITY_COMPLIANCE
    {
      id: 'CHK-05',
      pillar: 'RESERVE_LIQUIDITY_COMPLIANCE',
      question: 'Is statutory liquid asset ratio maintained above regulatory 15% threshold?',
      questionNepali: 'कुल बचत निक्षेपको कम्तीमा १५% तरल सम्पत्ति (बैंक मौज्दात/मुद्दती) कायम गरिएको छ?',
      statutoryRef: 'सहकारी ऐन २०७४ दफा ४१ र PEARLS E-8',
      maxScore: 10,
      scoreAwarded: 10,
      status: 'PASS',
      findingsNepali: 'हालको तरलता अनुपात २१.४% रहेको, जुन नियामक १५% भन्दा माथि छ।',
    },
    {
      id: 'CHK-06',
      pillar: 'RESERVE_LIQUIDITY_COMPLIANCE',
      question: 'Has 25% statutory profit appropriation (General Reserve, Education, Relief) been transferred?',
      questionNepali: 'खुद बचतबाट २५% साधारण जगेडा, सहकारी शिक्षा तथा राहत कोषमा अनिवार्य छुट्याइएको छ?',
      statutoryRef: 'सहकारी ऐन २०७४ दफा ५० र ५१',
      maxScore: 10,
      scoreAwarded: 10,
      status: 'PASS',
      findingsNepali: 'आषाढ मसान्तको लेखापरीक्षण नाफाबाट जगेडा कोषहरू पूर्ण विनियोजन भएको।',
    },

    // 4. GOVERNANCE_BOARD_MINUTES
    {
      id: 'CHK-07',
      pillar: 'GOVERNANCE_BOARD_MINUTES',
      question: 'Are monthly Board of Directors meetings held with documented quorum and signed minutes?',
      questionNepali: 'सञ्चालक समितिको बैठक महिनाको कम्तीमा एक पटक गणपूरक संख्या पुर्याई निर्णय प्रमाणित गरिएको छ?',
      statutoryRef: 'सहकारी ऐन २०७४ दफा ३४',
      maxScore: 10,
      scoreAwarded: 9,
      status: 'PASS',
      findingsNepali: 'यस त्रैमासमा ३ वटा नियमित बैठक बसी निर्णय पुस्तिकामा सबै सदस्यको हस्ताक्षर रहेको।',
    },
    {
      id: 'CHK-08',
      pillar: 'GOVERNANCE_BOARD_MINUTES',
      question: 'Have the prior general assembly (AGM) resolutions and member dividend payouts been executed?',
      questionNepali: 'विगत वार्षिक साधारण सभाका निर्णयहरू तथा लाभांश वितरण पूर्ण कार्यान्वयन भएका छन्?',
      statutoryRef: 'सहकारी ऐन २०७४ दफा ३९',
      maxScore: 10,
      scoreAwarded: 9,
      status: 'PASS',
      findingsNepali: 'साधारण सभाबाट पारित १०.५% सेयर लाभांश सदस्यहरूको खातामा दाखिला भएको।',
    },

    // 5. AML_KYC_SUSPICIOUS
    {
      id: 'CHK-09',
      pillar: 'AML_KYC_SUSPICIOUS',
      question: 'Are cash transactions >= NPR 10 Lakhs systematically reported to FIU-Nepal via goAML?',
      questionNepali: 'रु. १० लाख वा सोभन्दा माथिका नगद कारोबार वित्तीय जानकारी एकाइ (FIU) मा नियमित प्रतिवेदन हुन्छ?',
      statutoryRef: 'सम्पत्ति शुद्धीकरण निवारण ऐन २०६४',
      maxScore: 10,
      scoreAwarded: 9,
      status: 'PASS',
      findingsNepali: 'त्रैमास भरिका २ वटा १० लाख माथिका कारोबार टीटीआर (TTR) पोर्टलमा दाखिला भएको।',
    },
    {
      id: 'CHK-10',
      pillar: 'AML_KYC_SUSPICIOUS',
      question: 'Are member identity, citizenship verification, and PEP risk screening up to date?',
      questionNepali: 'सदस्यको नागरिकता, तीनपुस्ते, पेशागत विवरण र उच्च पदस्थ व्यक्ति (PEP) पहिचान अद्यावधिक छ?',
      statutoryRef: 'सहकारी सम्पत्ति शुद्धीकरण निर्देशिका',
      maxScore: 5,
      scoreAwarded: 4,
      status: 'PARTIAL',
      findingsNepali: 'केही पुराना सदस्यहरूको ठेगाना तथा फोन नम्बर अद्यावधिक हुन बाँकी।',
      recommendationNepali: 'नवीकरण तथा बचत जम्मा गर्दा अनिवार्य फाराम भराउने।',
    },
  ];
}

/**
 * Evaluate Checklist and Calculate Aggregate Score & Rating
 */
export function evaluateSupervisoryAuditScore(
  items: readonly SupervisoryChecklistItem[]
): {
  totalScoreAwarded: number;
  maxTotalScore: number;
  scorePercentage: number;
  overallRating: SupervisoryOverallRating;
} {
  const maxTotalScore = items.reduce((sum, item) => sum + item.maxScore, 0);
  const totalScoreAwarded = items.reduce((sum, item) => sum + item.scoreAwarded, 0);

  const scorePercentage = maxTotalScore > 0
    ? Math.round(((totalScoreAwarded / maxTotalScore) * 100) * 100) / 100
    : 0;

  let overallRating: SupervisoryOverallRating = 'CRITICAL_RISK';
  if (scorePercentage >= 85) {
    overallRating = 'EXCELLENT';
  } else if (scorePercentage >= 70) {
    overallRating = 'SATISFACTORY';
  } else if (scorePercentage >= 50) {
    overallRating = 'NEEDS_IMPROVEMENT';
  }

  return {
    totalScoreAwarded,
    maxTotalScore,
    scorePercentage,
    overallRating,
  };
}

/**
 * Compile Full Quarterly Inspection Report
 */
export function generateSupervisoryQuarterlyReport(params: {
  reportNo: string;
  fiscalYear: string;
  quarterBS: 'FIRST_QUARTER' | 'SECOND_QUARTER' | 'THIRD_QUARTER' | 'FOURTH_QUARTER';
  inspectionDateBS: string;
  committeeMembers: { convener: string; member1: string; member2: string };
  items: readonly SupervisoryChecklistItem[];
  correctiveActions: readonly CorrectiveActionItem[];
}): SupervisoryInspectionReport {
  const { reportNo, fiscalYear, quarterBS, inspectionDateBS, committeeMembers, items, correctiveActions } = params;
  const scoreResult = evaluateSupervisoryAuditScore(items);

  const quarterLabels: Record<string, string> = {
    FIRST_QUARTER: 'प्रथम त्रैमासिक (श्रावण–आश्विन)',
    SECOND_QUARTER: 'दोस्रो त्रैमासिक (कार्तिक–पौष)',
    THIRD_QUARTER: 'तेस्रो त्रैमासिक (माघ–चैत्र)',
    FOURTH_QUARTER: 'चौथो त्रैमासिक (वैशाख–असार)',
  };

  const quarterLabelNepali = quarterLabels[quarterBS] || 'त्रैमासिक';

  const executiveSummary =
    `The Supervisory Committee conducted the ${quarterBS.replace('_', ' ')} internal audit. Overall institutional health achieved a score of ${scoreResult.scorePercentage}% (${scoreResult.overallRating}). Cash vault and liquidity ratios are compliant. Specific action items have been issued for member KYC renewal.`;

  const executiveSummaryNepali =
    `लेखा सुपरीवेक्षण समितिले सहकारी ऐन २०७४ को दफा ४९ बमोजिम ${quarterLabelNepali} को स्थलगत तथा वित्तीय निरीक्षण सम्पन्न गरेको छ। संस्थाको समग्र आन्तरिक नियन्त्रण प्रणालीले ${scoreResult.scorePercentage}% अङ्क प्राप्त गरी '${scoreResult.overallRating}' स्तर हासिल गरेको छ। ढुकुटी नगद, तरलता तथा कर्जा सुरक्षण संतोषप्रद रहेको र औंल्याइएका केही सुधारहरू कार्यान्वयन गर्न सिफारिस गरिएको छ।`;

  return {
    id: `SUP-REP-${fiscalYear.replace('/', '-')}-${quarterBS}`,
    reportNo,
    fiscalYear,
    quarterBS,
    quarterLabelNepali,
    inspectionDateBS,
    committeeMembers,
    totalScoreAwarded: scoreResult.totalScoreAwarded,
    maxTotalScore: scoreResult.maxTotalScore,
    scorePercentage: scoreResult.scorePercentage,
    overallRating: scoreResult.overallRating,
    items,
    correctiveActions,
    executiveSummary,
    executiveSummaryNepali,
    status: 'SUBMITTED_TO_BOARD',
  };
}

/**
 * Export Supervisory Audit to CSV for Board & Regulatory Archive
 */
export function exportSupervisoryAuditCsv(report: SupervisoryInspectionReport): string {
  const metaHeader = [
    `"प्रतिवेदन नं: ${report.reportNo}"`,
    `"आर्थिक वर्ष: ${report.fiscalYear}"`,
    `"अवधि: ${report.quarterLabelNepali}"`,
    `"निरीक्षण मिति: ${report.inspectionDateBS}"`,
    `"समग्र प्राप्ताङ्क: ${report.scorePercentage}% (${report.overallRating})"`,
  ].join('\r\n');

  const tableHeader = [
    'क्र.सं. (S.N.)',
    'निरीक्षण क्षेत्र (Pillar)',
    'जाँच गरिएको विषय (Audit Checklist)',
    'कानूनी आधार (Legal Ref)',
    'पूर्णाङ्क (Max)',
    'प्राप्ताङ्क (Score)',
    'कैफियत/स्थिति (Status)',
    'स्थलगत देखिएको यथार्थ (Findings)',
    'समितिको सुझाव (Recommendation)',
  ].map((h) => `"${h}"`).join(',');

  const rows = report.items.map((item, idx) => {
    return [
      idx + 1,
      `"${PILLAR_METADATA[item.pillar]?.labelNe || item.pillar}"`,
      `"${item.questionNepali}"`,
      `"${item.statutoryRef}"`,
      item.maxScore,
      item.scoreAwarded,
      `"${item.status}"`,
      `"${item.findingsNepali || '-'}"`,
      `"${item.recommendationNepali || '-'}"`,
    ].join(',');
  });

  return [metaHeader, '', tableHeader, ...rows].join('\r\n');
}
