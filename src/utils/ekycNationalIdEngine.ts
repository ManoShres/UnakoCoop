/**
 * Electronic KYC (e-KYC), Biometric Verification & National ID (DoNIDCR) Regulatory Engine
 * (विद्युतीय ग्राहक पहिचान तथा राष्ट्रिय परिचयपत्र प्रमाणीकरण प्रणाली)
 * 
 * Complies with:
 * - Nepal Cooperative Act 2074 & AML/CFT Directives 2079 (सम्पत्ति शुद्धीकरण निवारण)
 * - Department of National ID and Civil Registration (DoNIDCR - राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभाग)
 * - Financial Information Unit (FIU-Nepal / राष्ट्र बैंक वित्तीय जानकारी इकाई) PEP & Sanctions Screening
 */

export type NidVerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING_API_CALL'
  | 'VERIFIED_DONIDCR'
  | 'MISMATCH_REJECTED'
  | 'BIOMETRIC_FAILED';

export type PepStatus =
  | 'NON_PEP'
  | 'DOMESTIC_PEP'
  | 'FOREIGN_PEP'
  | 'PEP_FAMILY_ASSOCIATE';

export type RiskClassification = 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';

export interface BiometricMatchResult {
  fingerprintMatchScore: number; // 0 to 100%
  facialMatchScore: number; // 0 to 100%
  livenessPassed: boolean;
  timestamp: string;
}

export interface SanctionScreeningResult {
  matchedList?: 'UN_SECURITY_COUNCIL' | 'MOHA_NEGATIVE_LIST' | 'CIB_BLACKLIST';
  isClear: boolean;
  screenedDate: string;
  notes: string;
}

export interface EkycProfile {
  id: string;
  memberId: string;
  memberNo: string;
  fullName: string;
  fullNameNepali: string;
  nationalIdNumber: string; // 10-digit DoNIDCR standard
  citizenshipNumber: string;
  issuingDistrict: string;
  dobBs: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  fatherName: string;
  motherName: string;
  spouseName?: string;
  permanentAddress: {
    province: string;
    district: string;
    municipality: string;
    ward: number;
  };
  occupation: string;
  estimatedAnnualIncome: number;
  nidStatus: NidVerificationStatus;
  pepStatus: PepStatus;
  sanctionCheck: SanctionScreeningResult;
  riskLevel: RiskClassification;
  biometric: BiometricMatchResult;
  reKycDeadlineDate: string;
  verifiedByOfficer?: string;
  verifiedTimestamp?: string;
}

export interface EkycMetrics {
  totalProfiles: number;
  verifiedCount: number;
  pendingCount: number;
  rejectedCount: number;
  pepIdentifiedCount: number;
  highRiskCount: number;
  sanctionFlagCount: number;
  biometricPassedCount: number;
  reKycOverdueCount: number;
  verificationRatePercent: number;
}

export const PEP_LABELS: Record<PepStatus, { np: string; en: string; badgeColor: string }> = {
  NON_PEP: { np: 'गैर-विशिष्ट (सामान्य नागरिक)', en: 'Non-PEP', badgeColor: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
  DOMESTIC_PEP: { np: 'स्वदेशी राजनीतिक विशिष्ट व्यक्ति (PEP)', en: 'Domestic PEP', badgeColor: 'text-amber-700 bg-amber-100 dark:bg-amber-900/40' },
  FOREIGN_PEP: { np: 'विदेशी विशिष्ट व्यक्ति (Foreign PEP)', en: 'Foreign PEP', badgeColor: 'text-rose-700 bg-rose-100 dark:bg-rose-900/40' },
  PEP_FAMILY_ASSOCIATE: { np: 'विशिष्ट व्यक्तिका परिवार/नातेदार', en: 'PEP Associate/Family', badgeColor: 'text-purple-700 bg-purple-100 dark:bg-purple-900/40' },
};

export const RISK_CONFIG: Record<RiskClassification, { np: string; en: string; colorClass: string; reKycPeriodYears: number }> = {
  LOW_RISK: { np: 'न्यून जोखिम (Low)', en: 'Low Risk', colorClass: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40', reKycPeriodYears: 3 },
  MEDIUM_RISK: { np: 'मध्यम जोखिम (Medium)', en: 'Medium Risk', colorClass: 'text-amber-700 bg-amber-100 dark:bg-amber-900/40', reKycPeriodYears: 2 },
  HIGH_RISK: { np: 'उच्च जोखिम (High - EDD आवश्यक)', en: 'High Risk (EDD Required)', colorClass: 'text-rose-700 bg-rose-100 dark:bg-rose-900/40', reKycPeriodYears: 1 },
};

export const NID_STATUS_CONFIG: Record<NidVerificationStatus, { np: string; en: string; badge: string }> = {
  UNVERIFIED: { np: 'प्रमाणीकरण नभएको', en: 'Unverified', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  PENDING_API_CALL: { np: 'प्रणाली रुजुमा', en: 'Pending DoNIDCR Check', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  VERIFIED_DONIDCR: { np: 'राष्ट्रिय परिचयपत्र प्रमाणित', en: 'DoNIDCR Verified', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  MISMATCH_REJECTED: { np: 'विवरण बेमेल / अस्वीकृत', en: 'Mismatch / Rejected', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' },
  BIOMETRIC_FAILED: { np: 'बायोमेट्रिक मेल नखाएको', en: 'Biometric Mismatch', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
};

/**
 * Validates 10-digit National ID format (e.g. "1234567890" or "123-456-7890").
 */
export function validateNationalIdFormat(nid: string): boolean {
  if (!nid) return false;
  const cleaned = nid.replace(/[\s-]/g, '');
  return /^\d{10}$/.test(cleaned);
}

/**
 * Assesses statutory KYC risk according to FIU Nepal & AML Act standards.
 */
export function assessKycRiskLevel(
  pep: PepStatus,
  sanctionClear: boolean,
  occupation: string,
  annualTurnover: number
): RiskClassification {
  if (!sanctionClear || pep === 'DOMESTIC_PEP' || pep === 'FOREIGN_PEP') {
    return 'HIGH_RISK';
  }
  if (pep === 'PEP_FAMILY_ASSOCIATE' || annualTurnover > 5000000) {
    return 'HIGH_RISK';
  }
  const highRiskOccupations = ['घरजग्गा दलाल', 'सुनचाँदी व्यवसायी', 'क्यासिनो/गेमिङ', 'विदेशी मुद्रा'];
  if (highRiskOccupations.some((o) => occupation.includes(o)) || annualTurnover > 1500000) {
    return 'MEDIUM_RISK';
  }
  return 'LOW_RISK';
}

/**
 * Calculates next Re-KYC deadline date based on risk classification.
 */
export function calculateReKycDeadline(baseDate: string, risk: RiskClassification): string {
  const parts = baseDate.split('-');
  if (parts.length < 3) return baseDate;
  const year = parseInt(parts[0], 10);
  const yearsToAdd = RISK_CONFIG[risk].reKycPeriodYears;
  return `${year + yearsToAdd}-${parts[1]}-${parts[2]}`;
}

/**
 * Simulates DoNIDCR e-KYC Verification call immutably.
 */
export function verifyWithDoNidcr(
  profile: EkycProfile,
  officerName: string = 'केवाइसी अधिकृत'
): EkycProfile {
  const isValidNid = validateNationalIdFormat(profile.nationalIdNumber);
  const timestamp = new Date().toISOString();
  const dateStr = timestamp.split('T')[0];

  if (!isValidNid) {
    return {
      ...profile,
      nidStatus: 'MISMATCH_REJECTED',
      verifiedTimestamp: timestamp,
      verifiedByOfficer: officerName,
    };
  }

  const updatedRisk = assessKycRiskLevel(
    profile.pepStatus,
    profile.sanctionCheck.isClear,
    profile.occupation,
    profile.estimatedAnnualIncome
  );

  return {
    ...profile,
    nidStatus: 'VERIFIED_DONIDCR',
    riskLevel: updatedRisk,
    reKycDeadlineDate: calculateReKycDeadline(dateStr, updatedRisk),
    verifiedTimestamp: timestamp,
    verifiedByOfficer: officerName,
  };
}

/**
 * Simulates Live Biometric Scan immutably.
 */
export function captureBiometricScan(
  profile: EkycProfile,
  simulatedFingerprintScore: number = 94,
  simulatedFacialScore: number = 96
): EkycProfile {
  const timestamp = new Date().toISOString();
  const passed = simulatedFingerprintScore >= 70 && simulatedFacialScore >= 70;

  return {
    ...profile,
    biometric: {
      fingerprintMatchScore: simulatedFingerprintScore,
      facialMatchScore: simulatedFacialScore,
      livenessPassed: passed,
      timestamp,
    },
    nidStatus: passed ? profile.nidStatus : 'BIOMETRIC_FAILED',
  };
}

/**
 * Screens member against FIU / MOHA / UN Sanction lists.
 */
export function screenPepAndSanctions(
  profile: EkycProfile,
  pep: PepStatus,
  sanctionMatched?: 'UN_SECURITY_COUNCIL' | 'MOHA_NEGATIVE_LIST' | 'CIB_BLACKLIST'
): EkycProfile {
  const isClear = !sanctionMatched;
  const updatedSanction: SanctionScreeningResult = {
    matchedList: sanctionMatched,
    isClear,
    screenedDate: new Date().toISOString().split('T')[0],
    notes: isClear
      ? 'गृह मन्त्रालय, राष्ट्र बैंक सीआईबी र संयुक्त राष्ट्रसंघ कालोसूचीमा कुनै कैफियत नदेखिएको।'
      : `सम्पत्ति शुद्धीकरण कालोसूची मिलान: ${sanctionMatched} मा नाम समावेश। उच्च छानबिन आवश्यक।`,
  };

  const updatedRisk = assessKycRiskLevel(
    pep,
    isClear,
    profile.occupation,
    profile.estimatedAnnualIncome
  );

  return {
    ...profile,
    pepStatus: pep,
    sanctionCheck: updatedSanction,
    riskLevel: updatedRisk,
  };
}

/**
 * Computes institutional metrics across the e-KYC registry.
 */
export function calculateEkycMetrics(
  profiles: readonly EkycProfile[],
  referenceDate?: string
): EkycMetrics {
  const today = referenceDate || new Date().toISOString().split('T')[0];

  let verifiedCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;
  let pepIdentifiedCount = 0;
  let highRiskCount = 0;
  let sanctionFlagCount = 0;
  let biometricPassedCount = 0;
  let reKycOverdueCount = 0;

  profiles.forEach((p) => {
    if (p.nidStatus === 'VERIFIED_DONIDCR') verifiedCount += 1;
    else if (p.nidStatus === 'UNVERIFIED' || p.nidStatus === 'PENDING_API_CALL') pendingCount += 1;
    else rejectedCount += 1;

    if (p.pepStatus !== 'NON_PEP') pepIdentifiedCount += 1;
    if (p.riskLevel === 'HIGH_RISK') highRiskCount += 1;
    if (!p.sanctionCheck.isClear) sanctionFlagCount += 1;
    if (p.biometric.livenessPassed && p.biometric.fingerprintMatchScore >= 70) biometricPassedCount += 1;

    if (p.reKycDeadlineDate && p.reKycDeadlineDate < today) {
      reKycOverdueCount += 1;
    }
  });

  const totalProfiles = profiles.length;
  const verificationRatePercent = totalProfiles > 0 ? Math.round((verifiedCount / totalProfiles) * 1000) / 10 : 0;

  return {
    totalProfiles,
    verifiedCount,
    pendingCount,
    rejectedCount,
    pepIdentifiedCount,
    highRiskCount,
    sanctionFlagCount,
    biometricPassedCount,
    reKycOverdueCount,
    verificationRatePercent,
  };
}

/**
 * Formats official DoNIDCR e-KYC Verification Certificate.
 */
export function generateDoNidcrCertificate(
  profile: EkycProfile,
  coopName: string = 'उनको बचत तथा ऋण सहकारी संस्था लि. (Unako SACCOS)'
): string {
  const verifiedDate = profile.verifiedTimestamp
    ? profile.verifiedTimestamp.split('T')[0]
    : new Date().toISOString().split('T')[0];

  return `================================================================================
               ${coopName}
            केन्द्रीय कार्यालय: गढवा-५, दाङ | दर्ता नं: ०७१/०७२
   राष्ट्रिय परिचयपत्र तथा विद्युतीय ग्राहक पहिचान प्रमाणीकरण पत्र (e-KYC CERTIFICATE)
================================================================================
प्रमाणीकरण संकेत: DONIDCR-VER-${profile.memberNo}-${verifiedDate}
प्रमाणीकरण मिति: ${verifiedDate}
प्रमाणीकरण अधिकृत: ${profile.verifiedByOfficer || 'अधिकृत प्रणाली'}

[ १. सदस्यको व्यक्तिगत तथा राष्ट्रिय परिचय विवरण ]
सदस्य नम्बर: ${profile.memberNo}
पूरा नाम: ${profile.fullNameNepali} (${profile.fullName})
राष्ट्रिय परिचयपत्र नम्बर (DoNIDCR NID): ${profile.nationalIdNumber}
नागरिकता नम्बर: ${profile.citizenshipNumber} (जारी जिल्ला: ${profile.issuingDistrict})
जन्म मिति (वि.सं.): ${profile.dobBs} | लिङ्ग: ${profile.gender}
बुबाको नाम: ${profile.fatherName}
आमाको नाम: ${profile.motherName}
${profile.spouseName ? `पति/पत्नीको नाम: ${profile.spouseName}` : ''}
स्थायी ठेगाना: ${profile.permanentAddress.province}, ${profile.permanentAddress.district}, ${profile.permanentAddress.municipality}-${profile.permanentAddress.ward}

[ २. DoNIDCR सर्भर प्रमाणीकरण तथा बायोमेट्रिक स्तर ]
राष्ट्रिय परिचयपत्र प्रमाणीकरण स्थिति: ${NID_STATUS_CONFIG[profile.nidStatus].np} (${NID_STATUS_CONFIG[profile.nidStatus].en})
औंठाछाप मिलान दर (Fingerprint Match): ${profile.biometric.fingerprintMatchScore}% (प्रमाणित)
अनुहार पहिचान दर (Facial Match Score): ${profile.biometric.facialMatchScore}% (सफल)
प्रत्यक्ष उपस्थिति जाँच (Liveness Test): ${profile.biometric.livenessPassed ? 'सफल (PASSED)' : 'असफल'}

[ ३. सम्पत्ति शुद्धीकरण (AML/CFT) जोखिम तथा कालोसूची स्क्रिनिङ ]
राजनीतिक रूपमा विशिष्ट व्यक्ति (PEP): ${PEP_LABELS[profile.pepStatus].np}
सम्पत्ति शुद्धीकरण जोखिम वर्ग: ${RISK_CONFIG[profile.riskLevel].np}
कालोसूची तथा प्रतिबन्ध जाँच: ${profile.sanctionCheck.isClear ? 'स्वच्छ (CLEAR - कुनै कालोसूचीमा नभेटिएको)' : `जोखिमयुक्त (${profile.sanctionCheck.matchedList})`}
अर्को केवाइसी नवीकरण म्याद (Re-KYC Due): ${profile.reKycDeadlineDate}

प्रमाणीकरण पुष्टि:
माथि उल्लेखित विवरण नेपाल सरकार, राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभाग (DoNIDCR) को
केन्द्रीय डाटाबेससँग विद्युतीय रूपमा मेल खाएको प्रमाणित गरिन्छ।

हस्ताक्षर (केवाइसी अधिकृत): __________________     हस्ताक्षर (सदस्य): __________________
संस्थाको छाप: 
================================================================================`;
}

/**
 * Exports e-KYC registry to CSV.
 */
export function exportEkycProfilesToCSV(profiles: readonly EkycProfile[]): string {
  const headers = [
    'Member No',
    'Name',
    'Nepali Name',
    'NID Number',
    'Citizenship No',
    'District',
    'Status',
    'PEP Status',
    'Sanction Status',
    'Risk Level',
    'Fingerprint Match %',
    'Re-KYC Deadline',
  ];

  const rows = profiles.map((p) => [
    `"${p.memberNo}"`,
    `"${p.fullName}"`,
    `"${p.fullNameNepali}"`,
    `"${p.nationalIdNumber}"`,
    `"${p.citizenshipNumber}"`,
    `"${p.issuingDistrict}"`,
    `"${p.nidStatus}"`,
    `"${p.pepStatus}"`,
    `"${p.sanctionCheck.isClear ? 'CLEAR' : 'FLAGGED'}"`,
    `"${p.riskLevel}"`,
    p.biometric.fingerprintMatchScore,
    `"${p.reKycDeadlineDate}"`,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Realistic default seed profiles for Unako SACCOS members.
 */
export const DEFAULT_EKYC_PROFILES: EkycProfile[] = [
  {
    id: 'ekyc-001',
    memberId: 'm-1',
    memberNo: 'M-001',
    fullName: 'Shanti Chaudhary',
    fullNameNepali: 'शान्ति चौधरी',
    nationalIdNumber: '8249102948',
    citizenshipNumber: '52-01-72-04521',
    issuingDistrict: 'दाङ (Dang)',
    dobBs: '2042-05-15',
    gender: 'FEMALE',
    fatherName: 'रामप्रसाद चौधरी',
    motherName: 'फुलकुमारी चौधरी',
    spouseName: 'सोमराज चौधरी',
    permanentAddress: {
      province: 'लुम्बिनी प्रदेश',
      district: 'दाङ',
      municipality: 'गढवा गाउँपालिका',
      ward: 5,
    },
    occupation: 'कृषि तथा पशुपालन',
    estimatedAnnualIncome: 450000,
    nidStatus: 'VERIFIED_DONIDCR',
    pepStatus: 'NON_PEP',
    sanctionCheck: {
      isClear: true,
      screenedDate: '2080-11-01',
      notes: 'स्वच्छ विवरण',
    },
    riskLevel: 'LOW_RISK',
    biometric: {
      fingerprintMatchScore: 96,
      facialMatchScore: 98,
      livenessPassed: true,
      timestamp: '2080-11-01T10:15:00Z',
    },
    reKycDeadlineDate: '2083-11-01',
    verifiedByOfficer: 'सुमन केसी (केवाइसी अधिकृत)',
    verifiedTimestamp: '2080-11-01T10:30:00Z',
  },
  {
    id: 'ekyc-002',
    memberId: 'm-2',
    memberNo: 'M-002',
    fullName: 'Ram Bahadur Thapa',
    fullNameNepali: 'राम बहादुर थापा',
    nationalIdNumber: '9120492817',
    citizenshipNumber: '52-01-68-01290',
    issuingDistrict: 'दाङ (Dang)',
    dobBs: '2035-08-20',
    gender: 'MALE',
    fatherName: 'कर्णबहादुर थापा',
    motherName: 'माया देवी थापा',
    spouseName: 'कमला थापा',
    permanentAddress: {
      province: 'लुम्बिनी प्रदेश',
      district: 'दाङ',
      municipality: 'लमही नगरपालिका',
      ward: 3,
    },
    occupation: 'साना खुद्रा व्यापार',
    estimatedAnnualIncome: 750000,
    nidStatus: 'VERIFIED_DONIDCR',
    pepStatus: 'NON_PEP',
    sanctionCheck: {
      isClear: true,
      screenedDate: '2080-10-15',
      notes: 'स्वच्छ विवरण',
    },
    riskLevel: 'LOW_RISK',
    biometric: {
      fingerprintMatchScore: 91,
      facialMatchScore: 92,
      livenessPassed: true,
      timestamp: '2080-10-15T11:00:00Z',
    },
    reKycDeadlineDate: '2083-10-15',
    verifiedByOfficer: 'प्रकाश यादव',
    verifiedTimestamp: '2080-10-15T11:20:00Z',
  },
  {
    id: 'ekyc-003',
    memberId: 'm-3',
    memberNo: 'M-003',
    fullName: 'Bishnu Prasad Sharma',
    fullNameNepali: 'विष्णु प्रसाद शर्मा',
    nationalIdNumber: '7392810482',
    citizenshipNumber: '52-01-65-03498',
    issuingDistrict: 'दाङ (Dang)',
    dobBs: '2030-02-12',
    gender: 'MALE',
    fatherName: 'हरि प्रसाद शर्मा',
    motherName: 'सरस्वती शर्मा',
    permanentAddress: {
      province: 'लुम्बिनी प्रदेश',
      district: 'दाङ',
      municipality: 'गढवा गाउँपालिका',
      ward: 4,
    },
    occupation: 'स्थानीय जनप्रतिनिधि (वडा सदस्य)',
    estimatedAnnualIncome: 1800000,
    nidStatus: 'VERIFIED_DONIDCR',
    pepStatus: 'DOMESTIC_PEP',
    sanctionCheck: {
      isClear: true,
      screenedDate: '2080-09-10',
      notes: 'PEP अभिलेख दर्ता, थप ग्राहक परीक्षण (EDD) सम्पन्न।',
    },
    riskLevel: 'HIGH_RISK',
    biometric: {
      fingerprintMatchScore: 89,
      facialMatchScore: 94,
      livenessPassed: true,
      timestamp: '2080-09-10T14:00:00Z',
    },
    reKycDeadlineDate: '2081-09-10',
    verifiedByOfficer: 'दिनेश घिमिरे (प्रबन्धक)',
    verifiedTimestamp: '2080-09-10T14:45:00Z',
  },
  {
    id: 'ekyc-004',
    memberId: 'm-4',
    memberNo: 'M-004',
    fullName: 'Urmila Yadav',
    fullNameNepali: 'उर्मिला यादव',
    nationalIdNumber: '1092837465',
    citizenshipNumber: '52-01-78-00124',
    issuingDistrict: 'दाङ (Dang)',
    dobBs: '2050-11-05',
    gender: 'FEMALE',
    fatherName: 'शिवनारायण यादव',
    motherName: 'महेन्द्री यादव',
    permanentAddress: {
      province: 'लुम्बिनी प्रदेश',
      district: 'दाङ',
      municipality: 'राप्ती गाउँपालिका',
      ward: 2,
    },
    occupation: 'विद्यार्थी तथा गृहिणी',
    estimatedAnnualIncome: 120000,
    nidStatus: 'UNVERIFIED',
    pepStatus: 'NON_PEP',
    sanctionCheck: {
      isClear: true,
      screenedDate: '2080-12-01',
      notes: 'बायोमेट्रिक स्क्यान बाँकी',
    },
    riskLevel: 'LOW_RISK',
    biometric: {
      fingerprintMatchScore: 0,
      facialMatchScore: 0,
      livenessPassed: false,
      timestamp: '',
    },
    reKycDeadlineDate: '2083-12-01',
  },
];
