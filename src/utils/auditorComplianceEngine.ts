/**
 * Unako SACCOS - Statutory Auditor Appointment, Audit Compliance & Risk Matrix Engine
 * (सहकारी बाह्य लेखापरीक्षक नियुक्ति, दफा ८७ र ८८ अनुपालन तथा व्यवस्थापन पत्र प्रणाली)
 * 
 * Statutory Authority:
 * - Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) Section 87 (Appointment of Auditor)
 *   (साधारण सभाबाट लेखापरीक्षक नियुक्ति, लगातार ३ कार्यकाल सीमा, स्वार्थको द्वन्द्व निषेध)
 * - Section 88 (Auditor's Duties, Powers & Mandatory Audit Checklist)
 * - Institute of Chartered Accountants of Nepal (ICAN) Cooperative Audit Guidelines
 * - Department of Cooperatives Audit Standards & COPAMIS Classification
 */

export type AuditorCategory = 'CAT_A' | 'CAT_B' | 'CAT_C' | 'CAT_D';

export type AuditOpinionType = 'UNQUALIFIED' | 'QUALIFIED' | 'ADVERSE' | 'DISCLAIMER';

export type ObservationSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type FindingStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface AuditorProfile {
  id: string;
  firmName: string;
  leadAuditorName: string;
  icanRegistrationNo: string;
  category: AuditorCategory;
  consecutiveYearsServed: number; // Max 3 consecutive years under Sec 87
  contactPhone: string;
  contactEmail: string;
  officeAddress: string;
  agmAppointmentDateNepali: string;
  agmMinuteNo: string;
  auditFeeApproved: number; // in NRS
  hasIndependenceConflict: boolean; // Must be false for legal appointment
  independenceNotes?: string;
  fiscalYear: string;
}

export interface StatutoryAuditCheckPoint {
  id: string;
  pointNumber: number;
  categoryNepali: string;
  legalReference: string;
  titleNepali: string;
  titleEnglish: string;
  status: 'COMPLIANT' | 'MINOR_OBSERVATION' | 'MAJOR_DEFICIENCY';
  auditorRemarks: string;
  riskWeight: number; // 1 to 10
}

export interface ManagementLetterItem {
  id: string;
  checkpointId: string;
  title: string;
  severity: ObservationSeverity;
  auditorObservation: string;
  implication: string;
  auditorRecommendation: string;
  managementResponse: string;
  responsibleOfficer: string;
  targetResolutionDateNepali: string;
  status: FindingStatus;
}

export interface AuditEngagementSummary {
  fiscalYear: string;
  auditor: AuditorProfile;
  auditOpinion: AuditOpinionType;
  auditScorePercent: number; // 0 to 100
  totalCheckpoints: number;
  compliantCount: number;
  minorObservationsCount: number;
  majorDeficienciesCount: number;
  isSec87Eligible: boolean;
  sec87RotationWarning: boolean; // true if consecutiveYearsServed >= 3
  managementLetterItems: ManagementLetterItem[];
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  reportDateNepali: string;
}

export const AUDITOR_CATEGORY_LABELS: Record<AuditorCategory, { ne: string; en: string; turnoverLimit: string }> = {
  CAT_A: {
    ne: 'वर्ग "क" (चार्टर्ड एकाउन्ट्यान्ट फर्म)',
    en: 'Category "A" (Chartered Accountants)',
    turnoverLimit: 'रु. ५० करोडभन्दा माथिको कारोबार वा पूँजी',
  },
  CAT_B: {
    ne: 'वर्ग "ख" (अनुभवी लेखापरीक्षक)',
    en: 'Category "B" (Experienced Auditor)',
    turnoverLimit: 'रु. २५ करोड देखि ५० करोडसम्मको कारोबार',
  },
  CAT_C: {
    ne: 'वर्ग "ग" (दर्तावाला लेखापरीक्षक)',
    en: 'Category "C" (Registered Auditor)',
    turnoverLimit: 'रु. १० करोड देखि २५ करोडसम्मको कारोबार',
  },
  CAT_D: {
    ne: 'वर्ग "घ" (प्रारम्भिक लेखापरीक्षक)',
    en: 'Category "D" (Entry Registered Auditor)',
    turnoverLimit: 'रु. १० करोडसम्मको वार्षिक कारोबार',
  },
};

export const OPINION_LABELS: Record<AuditOpinionType, { ne: string; en: string; badgeColor: string }> = {
  UNQUALIFIED: {
    ne: 'विवादरहित स्वच्छ राय (Unqualified Clean Opinion)',
    en: 'Unqualified Clean Opinion',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
  },
  QUALIFIED: {
    ne: 'कैफियत सहितको राय (Qualified Opinion)',
    en: 'Qualified Opinion',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
  },
  ADVERSE: {
    ne: 'प्रतिकूल राय (Adverse Opinion)',
    en: 'Adverse Opinion',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
  },
  DISCLAIMER: {
    ne: 'राय दिन अस्वीकार (Disclaimer of Opinion)',
    en: 'Disclaimer of Opinion',
    badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-400',
  },
};

export const DEFAULT_AUDITOR_PROFILE: AuditorProfile = {
  id: 'aud-2081-01',
  firmName: 'रेग्मी एण्ड एसोसिएट्स, चार्टर्ड एकाउन्टेन्ट्स',
  leadAuditorName: 'सीए. सन्तोष रेग्मी (FCA)',
  icanRegistrationNo: 'ICAN COP No. 1420 / FCA 892',
  category: 'CAT_A',
  consecutiveYearsServed: 2, // 2nd year (eligible for 1 more year under 3-year rotation rule)
  contactPhone: '082-560124 / 9857820450',
  contactEmail: 'audit@regmiassociates.com.np',
  officeAddress: 'घोराही-१५, दाङ (शाखा: गढवा)',
  agmAppointmentDateNepali: '२०८०-०६-२५',
  agmMinuteNo: '१६औं साधारण सभा निर्णय नं. ५',
  auditFeeApproved: 75000,
  hasIndependenceConflict: false,
  independenceNotes: 'सञ्चालक, लेखा समिति वा व्यवस्थापनसँग कुनै पारिवारिक वा आर्थिक स्वार्थ नभएको लिखित घोषणा प्राप्त।',
  fiscalYear: '2081/82',
};

export const DEFAULT_STATUTORY_CHECKPOINTS: StatutoryAuditCheckPoint[] = [
  {
    id: 'chk-01',
    pointNumber: 1,
    categoryNepali: 'पूँजी तथा जगेडा कोष',
    legalReference: 'सहकारी ऐन २०७४, दफा ६८ (१, ३)',
    titleNepali: 'साधारण जगेडा (२५%) र शिक्षा कोष (५%) विनियोजन',
    titleEnglish: 'General Reserve (25%) & Education Fund (5%) Statutory Allocation',
    status: 'COMPLIANT',
    auditorRemarks: 'वार्षिक खुद नाफाबाट साधारण जगेडामा २५% र शिक्षा कोषमा ५% पूर्ण रुपमा विनियोजन गरिएको पाइयो।',
    riskWeight: 10,
  },
  {
    id: 'chk-02',
    pointNumber: 2,
    categoryNepali: 'सेयर पूँजी सीमा',
    legalReference: 'सहकारी ऐन २०७४, दफा ३७',
    titleNepali: 'कुनै एक सदस्यको २०% भन्दा बढी सेयर नभएको प्रमाणीकरण',
    titleEnglish: 'Single-Member 20% Share Capital Ceiling Compliance',
    status: 'COMPLIANT',
    auditorRemarks: 'संस्थाको सेयरधनी दर्ता किताबको परीक्षण गर्दा कुनै पनि सदस्यले २०% सीमा नाघेको पाइएन।',
    riskWeight: 9,
  },
  {
    id: 'chk-03',
    pointNumber: 3,
    categoryNepali: 'तरलता व्यवस्थापन',
    legalReference: 'सहकारी ऐन २०७४, दफा ५१',
    titleNepali: 'न्यूनतम वैधानिक तरलता अनुपात (१०% देखि १५%)',
    titleEnglish: 'Statutory Minimum Liquidity Ratio (10-15%) Maintenance',
    status: 'COMPLIANT',
    auditorRemarks: 'आर्थिक वर्ष भर दैनिक औषत तरलता २४.१% कायम रहेको र कुनै दिन पनि १०% भन्दा तल नगएको।',
    riskWeight: 10,
  },
  {
    id: 'chk-04',
    pointNumber: 4,
    categoryNepali: 'कर्जा जोखिम तथा नोक्सानी व्यवस्था',
    legalReference: 'सहकारी ऐन २०७४, दफा ५२ र मापदण्ड',
    titleNepali: 'कर्जा वर्गीकरण तथा अनिवार्य नोक्सानी व्यवस्था (Provisioning)',
    titleEnglish: 'Loan Classification & Mandatory Loan Loss Provisioning',
    status: 'COMPLIANT',
    auditorRemarks: 'असल (१%), सूक्ष्म निगरानी (५%), कमसल (२५%), शंकास्पद (५०%) र खराब (१००%) वर्गीकरण सही पाइयो।',
    riskWeight: 10,
  },
  {
    id: 'chk-05',
    pointNumber: 5,
    categoryNepali: 'ब्याजदर सीमा तथा अन्तर',
    legalReference: 'सहकारी विभाग सन्दर्भ ब्याजदर निर्देशन',
    titleNepali: 'सन्दर्भ ब्याजदर १६% अधिकतम सीमा तथा ६% स्प्रेड दर पालना',
    titleEnglish: 'Reference Interest Rate Ceiling (16%) & 6% Spread Compliance',
    status: 'COMPLIANT',
    auditorRemarks: 'कर्जाको अधिकतम ब्याजदर १४.७५% रहेको र ब्याज अन्तर (Spread) ४.२५% भित्र सीमित रहेको।',
    riskWeight: 8,
  },
  {
    id: 'chk-06',
    pointNumber: 6,
    categoryNepali: 'सञ्चालक तथा कर्मचारी कर्जा',
    legalReference: 'सहकारी ऐन २०७४, दफा ५०',
    titleNepali: 'सञ्चालक तथा पदाधिकारी गैरकानुनी कर्जा नियन्त्रण',
    titleEnglish: 'Insider Lending & Conflict of Interest Verification',
    status: 'COMPLIANT',
    auditorRemarks: 'सञ्चालकहरूले संस्थाको नियमानुसार बचत धितो बाहेक विना धितो व्यक्तिगत कर्जा नलिएको पुष्टि।',
    riskWeight: 9,
  },
  {
    id: 'chk-07',
    pointNumber: 7,
    categoryNepali: 'सम्पत्ति शुद्धीकरण निवारण',
    legalReference: 'AML/CFT Directives 2079',
    titleNepali: 'ई-केवाइसी, राष्ट्रिय परिचयपत्र प्रमाणीकरण र goAML रिपोर्टिङ',
    titleEnglish: 'e-KYC, National ID Verification & Suspicious Transaction Reporting',
    status: 'MINOR_OBSERVATION',
    auditorRemarks: 'अधिकांश सदस्यको ई-केवाइसी अद्यावधिक छ, तर पुरानो खाता भएका केही सदस्यहरूको राष्ट्रिय परिचयपत्र लिङ्किङ कार्य अझै जारी रहेको।',
    riskWeight: 7,
  },
  {
    id: 'chk-08',
    pointNumber: 8,
    categoryNepali: 'कर तथा टीडीएस कट्टी',
    legalReference: 'आयकर ऐन २०५८, दफा ८८',
    titleNepali: 'बचत ब्याजमा ५% र कर्मचारी पारिश्रमिकमा टीडीएस दाखिला',
    titleEnglish: '5% Withholding Tax on Interest & e-TDS IRD Remittance',
    status: 'COMPLIANT',
    auditorRemarks: 'बचतको ब्याज भुक्तानीमा ५% टीडीएस कट्टी गरी आन्तरिक राजस्व कार्यालयमा समयमै दाखिला भएको।',
    riskWeight: 8,
  },
  {
    id: 'chk-09',
    pointNumber: 9,
    categoryNepali: 'स्थिर सम्पत्ति तथा ह्रासकट्टी',
    legalReference: 'आयकर ऐन २०५८ अनुसूची २ र COPAS',
    titleNepali: 'स्थिर सम्पत्ति भौतिक प्रमाणीकरण तथा आयकर ह्रासकट्टी तालिका',
    titleEnglish: 'Fixed Assets Physical Verification & Schedule 2 Tax Depreciation Pools',
    status: 'COMPLIANT',
    auditorRemarks: 'पूल A, B, C, D अनुसार घट्दो मूल्य विधि (WDV) बाट ह्रासकट्टी गणना दुरुस्त पाइयो।',
    riskWeight: 7,
  },
  {
    id: 'chk-10',
    pointNumber: 10,
    categoryNepali: 'सूचना प्रविधि तथा COPOMIS',
    legalReference: 'सहकारी विभाग COPOMIS मापदण्ड',
    titleNepali: 'COPOMIS प्रणालीमा मासिक तथा वार्षिक तथ्याङ्क प्रविष्टि',
    titleEnglish: 'COPOMIS Monthly/Annual Regulatory Data Synchronization',
    status: 'COMPLIANT',
    auditorRemarks: 'सहकारी विभागको COPOMIS पोर्टलमा वित्तीय विवरण तथा सदस्य विवरण अनलाइन प्रविष्ट भएको।',
    riskWeight: 8,
  },
];

export const DEFAULT_MANAGEMENT_LETTER_ITEMS: ManagementLetterItem[] = [
  {
    id: 'ml-01',
    checkpointId: 'chk-07',
    title: 'पुराना निष्क्रिय सदस्यहरूको राष्ट्रिय परिचयपत्र (NID) ई-केवाइसी अद्यावधिक',
    severity: 'MEDIUM',
    auditorObservation: 'संस्थामा आबद्ध कुल सदस्यहरू मध्ये करिब ८% पुराना सदस्यहरूको राष्ट्रिय परिचयपत्र तथा डिजिटल फोटो बायोमेट्रिक प्रणालीमा अद्यावधिक हुन बाँकी रहेको।',
    implication: 'सहकारी विभागको AML/CFT निर्देशन २०७९ को अनुसूची बमोजिम अनिवार्य विद्युतीय केवाइसी मापदण्डमा प्राविधिक कैफियत देखिन सक्ने।',
    auditorRecommendation: 'मातृ समूह बैठक तथा एसएमएस सन्देश मार्फत सूचना प्रवाह गरी आगामी ३ महिनाभित्र १००% सदस्यको बायोमेट्रिक ई-केवाइसी सम्पन्न गर्न सिफारिस गरिन्छ।',
    managementResponse: 'सहजकर्ता तथा बजार प्रतिनिधि परिचालन गरी आगामी मंसिर मसान्तभित्र सम्पूर्ण पुराना सदस्यहरूको राष्ट्रिय परिचयपत्र नम्बर प्रविष्टि सम्पन्न गरिनेछ।',
    responsibleOfficer: 'सूचना प्रविधि अधिकृत / शाखा प्रमुख',
    targetResolutionDateNepali: '२०८१-०८-३०',
    status: 'IN_PROGRESS',
  },
  {
    id: 'ml-02',
    checkpointId: 'chk-09',
    title: 'शाखा कार्यालयहरूको स्थिर सम्पत्तिमा बारकोड / सम्पत्ति ट्याग लगाउने',
    severity: 'LOW',
    auditorObservation: 'केन्द्रीय कार्यालयमा स्थिर सम्पत्ति ट्यागिङ सम्पन्न भएतापनि सेवाकेन्द्रहरूमा केही कम्प्युटर तथा फर्निचरमा भौतिक सम्पत्ति ट्याग नम्बर देखिन बाँकी रहेको।',
    implication: 'वर्षान्तमा भौतिक गणना गर्दा सम्पत्ति पहिचानमा द्विविधा उत्पन्न हुन सक्ने।',
    auditorRecommendation: 'COPAS मापदण्ड बमोजिम प्रत्येक सम्पत्तिमा विशिष्ट कोड अंकित ट्याग टाँस्न निर्देशन गरिन्छ।',
    managementResponse: 'सम्पत्ति खाता अनुसार नयाँ क्युआर बारकोड ट्याग छपाई गरी १५ दिनभित्र सेवाकेन्द्रहरूमा टाँस्ने कार्य सम्पन्न गरिनेछ।',
    responsibleOfficer: 'प्रशासन तथा जिन्सी शाखा प्रमुख',
    targetResolutionDateNepali: '२०८१-०७-१५',
    status: 'IN_PROGRESS',
  },
];

/**
 * Validates Section 87 auditor eligibility rules
 */
export function validateAuditorEligibility(auditor: AuditorProfile): {
  isEligible: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Rule 1: Section 87 maximum 3 consecutive years
  if (auditor.consecutiveYearsServed >= 3) {
    errors.push('सहकारी ऐन २०७४, दफा ८७ अनुसार एउटै लेखापरीक्षकलाई लगातार तीन कार्यकाल (वर्ष) भन्दा बढी नियुक्त गर्न पाइँदैन। नयाँ लेखापरीक्षक नियुक्त गर्नुपर्नेछ।');
  } else if (auditor.consecutiveYearsServed === 2) {
    warnings.push('यो लेखापरीक्षकको दोस्रो कार्यकाल हो। अर्को वर्ष अनिवार्य रुपमा लेखापरीक्षक परिवर्तन (Rotation) गर्नुपर्नेछ।');
  }

  // Rule 2: Conflict of interest
  if (auditor.hasIndependenceConflict) {
    errors.push('दफा ८७ अनुसार संस्थाको सञ्चालक, लेखा समिति, कर्मचारी वा तिनका नजिकका नातेदारसँग प्रत्यक्ष स्वार्थ भएको व्यक्ति लेखापरीक्षक नियुक्त हुन अयोग्य हुन्छ।');
  }

  // Rule 3: Valid ICAN COP
  if (!auditor.icanRegistrationNo.trim()) {
    errors.push('नेपाल चार्टर्ड एकाउन्टेन्ट्स संस्था (ICAN) बाट जारी वैध प्रमाणपत्र (COP) नम्बर अनिवार्य छ।');
  }

  return {
    isEligible: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculates comprehensive statutory audit engagement score & summary
 */
export function calculateAuditEngagementSummary(params: {
  fiscalYear: string;
  auditor: AuditorProfile;
  checkpoints: StatutoryAuditCheckPoint[];
  managementLetterItems: ManagementLetterItem[];
  reportDateNepali?: string;
}): AuditEngagementSummary {
  const {
    fiscalYear,
    auditor,
    checkpoints,
    managementLetterItems,
    reportDateNepali = '२०८१-०६-२८',
  } = params;

  let totalWeight = 0;
  let earnedScore = 0;
  let compliantCount = 0;
  let minorObservationsCount = 0;
  let majorDeficienciesCount = 0;

  for (const chk of checkpoints) {
    totalWeight += chk.riskWeight;
    if (chk.status === 'COMPLIANT') {
      earnedScore += chk.riskWeight;
      compliantCount++;
    } else if (chk.status === 'MINOR_OBSERVATION') {
      earnedScore += chk.riskWeight * 0.7; // 70% credit
      minorObservationsCount++;
    } else {
      majorDeficienciesCount++;
    }
  }

  const auditScorePercent = totalWeight > 0
    ? Math.round((earnedScore / totalWeight) * 1000) / 10
    : 100;

  // Determine statutory opinion based on score and deficiencies
  let auditOpinion: AuditOpinionType = 'UNQUALIFIED';
  if (majorDeficienciesCount >= 3 || auditScorePercent < 70) {
    auditOpinion = 'ADVERSE';
  } else if (majorDeficienciesCount > 0 || minorObservationsCount >= 3 || auditScorePercent < 88) {
    auditOpinion = 'QUALIFIED';
  }

  const eligibility = validateAuditorEligibility(auditor);
  const sec87RotationWarning = auditor.consecutiveYearsServed >= 3;

  const highRiskCount = managementLetterItems.filter((i) => i.severity === 'HIGH').length;
  const mediumRiskCount = managementLetterItems.filter((i) => i.severity === 'MEDIUM').length;
  const lowRiskCount = managementLetterItems.filter((i) => i.severity === 'LOW').length;

  return {
    fiscalYear,
    auditor,
    auditOpinion,
    auditScorePercent,
    totalCheckpoints: checkpoints.length,
    compliantCount,
    minorObservationsCount,
    majorDeficienciesCount,
    isSec87Eligible: eligibility.isEligible,
    sec87RotationWarning,
    managementLetterItems,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    reportDateNepali,
  };
}

/**
 * Generates official bilingual AGM Auditor Appointment Letter under Section 87
 */
export function generateAuditorAppointmentLetter(auditor: AuditorProfile): string {
  const catLabel = AUDITOR_CATEGORY_LABELS[auditor.category]?.ne || auditor.category;

  return `================================================================================
                    उनको बचत तथा ऋण सहकारी संस्था लिमिटेड
                UNAKO SAVING & CREDIT COOPERATIVE SOCIETY LTD.
                     गढवा-५, दाङ, लुम्बिनी प्रदेश, नेपाल
             दर्ता नं: २८३/०६५/०६६ | सहकारी ऐन २०७४, दफा ८७
================================================================================
                  बाह्य लेखापरीक्षक औपचारिक नियुक्ति पत्र
               STATUTORY AUDITOR APPOINTMENT ENGAGEMENT LETTER
--------------------------------------------------------------------------------
पत्र संख्या: उन/लेखा/२०८१-८२
चलानी नं: ${Math.floor(Math.random() * 800 + 100)}
मिति: ${auditor.agmAppointmentDateNepali}

श्री ${auditor.firmName}
प्रमुख लेखापरीक्षक: ${auditor.leadAuditorName}
प्रमाणपत्र नं (ICAN COP): ${auditor.icanRegistrationNo}
ठेगाना: ${auditor.officeAddress}

विषय: आर्थिक वर्ष ${auditor.fiscalYear} को बाह्य लेखापरीक्षक नियुक्ति सम्बन्धमा।

महोदय,
सहकारी ऐन २०७४ को दफा ८७ तथा संस्थाको विनियम बमोजिम मिति ${auditor.agmAppointmentDateNepali} मा सम्पन्न 
संस्थाको वार्षिक साधारण सभाको ${auditor.agmMinuteNo} अनुसार आर्थिक वर्ष ${auditor.fiscalYear} को 
सम्पूर्ण वित्तीय कारोबारको वैधानिक लेखापरीक्षण गर्न यहाँलाई बाह्य लेखापरीक्षक पदमा 
नियुक्त गरिएको सहर्ष जानकारी गराउँदछौं।

१. लेखापरीक्षणको दायरा तथा सर्तहरू:
   क) सहकारी ऐन २०७४ को दफा ८८ बमोजिमका सम्पूर्ण परीक्षण बुँदाहरू।
   ख) नेपाल चार्टर्ड एकाउन्टेन्ट्स संस्था (ICAN) को नेपाल अडिटिङ स्ट्याण्डर्ड (NAS)।
   ग) सहकारी विभाग, सम्पत्ति शुद्धीकरण अनुसन्धान विभाग र PEARLS मापदण्ड।

२. लेखापरीक्षण पारिश्रमिक:
   स्वीकृत लेखापरीक्षण पारिश्रमिक: रु. ${auditor.auditFeeApproved.toLocaleString('en-IN')}/- (अक्षरेपी पचहत्तर हजार रुपैयाँ मात्र, कर कट्टी प्रयोजन सहित)।

३. कानुनी प्रतिबद्धता (दफा ८७):
   यहाँको यो लगातार ${auditor.consecutiveYearsServed} औं कार्यकाल भएकोले संस्थासँग कुनै स्वार्थको द्वन्द्व 
   नरहेको स्वतन्त्रताको घोषणा सहित यो नियुक्ति पत्र स्वीकार गरी लेखापरीक्षण कार्य 
   अगाडि बढाउनुहुन अनुरोध गरिन्छ।

............................                   ............................
      (लेखा समिति संयोजक)                             (अध्यक्ष / व्यवस्थापक)
 Supervisory Committee Convener                         Chairman / Manager
================================================================================`;
}

/**
 * Exports Audit Checkpoints & Management Letter to CSV
 */
export function exportAuditComplianceToCSV(
  checkpoints: StatutoryAuditCheckPoint[],
  summary: AuditEngagementSummary
): string {
  const header = [
    'S.No (क्र.सं.)',
    'Category (क्षेत्र)',
    'Legal Reference (कानुनी दफा)',
    'Title (परीक्षण बुँदा)',
    'Compliance Status (अवस्था)',
    'Risk Weight (अङ्क)',
    'Auditor Remarks (लेखापरीक्षक कैफियत)',
  ].join(',');

  const rows = checkpoints.map((c) => {
    return [
      c.pointNumber,
      `"${c.categoryNepali}"`,
      `"${c.legalReference}"`,
      `"${c.titleNepali.replace(/"/g, '""')}"`,
      `"${c.status}"`,
      c.riskWeight,
      `"${c.auditorRemarks.replace(/"/g, '""')}"`,
    ].join(',');
  });

  const mlHeader = [
    '',
    '--- MANAGEMENT LETTER OBSERVATIONS (व्यवस्थापन पत्र कैफियतहरू) ---',
    'Issue Title,Severity,Auditor Observation,Management Response,Responsible Officer,Target Date,Status',
  ].join('\n');

  const mlRows = summary.managementLetterItems.map((m) => {
    return [
      `"${m.title.replace(/"/g, '""')}"`,
      m.severity,
      `"${m.auditorObservation.replace(/"/g, '""')}"`,
      `"${m.managementResponse.replace(/"/g, '""')}"`,
      `"${m.responsibleOfficer}"`,
      m.targetResolutionDateNepali,
      m.status,
    ].join(',');
  });

  const summarySection = [
    '',
    '--- STATUTORY AUDIT ENGAGEMENT SUMMARY ---',
    `Fiscal Year,${summary.fiscalYear}`,
    `Audit Firm,${summary.auditor.firmName}`,
    `Lead Auditor,${summary.auditor.leadAuditorName}`,
    `Audit Opinion,${summary.auditOpinion}`,
    `Compliance Score,${summary.auditScorePercent}%`,
    `Compliant Points,${summary.compliantCount} / ${summary.totalCheckpoints}`,
    `Minor Observations,${summary.minorObservationsCount}`,
    `Major Deficiencies,${summary.majorDeficienciesCount}`,
    `Section 87 Eligible,${summary.isSec87Eligible ? 'YES' : 'NO'}`,
  ].join('\n');

  return [header, ...rows, mlHeader, ...mlRows, summarySection].join('\n');
}
