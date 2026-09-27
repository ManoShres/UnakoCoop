/**
 * Unako SACCOS - Concessional Loan & Government Interest Subsidy Engine
 * (सहुलियतपूर्ण कर्जा तथा सरकारी ब्याज अनुदान व्यवस्थापन प्रणाली)
 *
 * Statutory & Regulatory Framework:
 * - Nepal Government Concessional Loan Guidelines 2075
 *   (सहुलियतपूर्ण कर्जाका लागि ब्याज अनुदान सम्बन्धी एकीकृत कार्यविधि, २०७५)
 * - Ministry of Finance (अर्थ मन्त्रालय) & Nepal Rastra Bank Directives
 * - Cooperative Act 2074 Section 50 & 51 (ऋण परिचालन तथा अनुदान कर्जा)
 * - Local Government Operational Act 2074 (गढवा गाउँपालिका कृषि विकास कार्यक्रम)
 */

export type ConcessionalSchemeType =
  | 'COMMERCIAL_AGRICULTURE'    // व्यावसायिक कृषि तथा पशुपन्छी कर्जा (५% अनुदान)
  | 'WOMEN_ENTREPRENEURSHIP'     // महिला उद्यमशील कर्जा (६% अनुदान)
  | 'EDUCATED_YOUTH'            // शिक्षित युवा स्वरोजगार कर्जा (५% अनुदान)
  | 'RETURNEE_MIGRANT'          // विदेशबाट फर्केका युवा परियोजना कर्जा (५% अनुदान)
  | 'DALIT_COMMUNITY'           // दलित समुदाय परम्परागत पेशा व्यवसाय कर्जा (६% अनुदान)
  | 'LOCAL_MUNICIPALITY_AGRI';  // गढवा गाउँपालिका स्थानीय कृषि प्रवर्धन अनुदान (४% अनुदान)

export interface ConcessionalSchemeMetadata {
  readonly code: ConcessionalSchemeType;
  readonly titleEn: string;
  readonly titleNe: string;
  readonly defaultSubsidyRate: number; // e.g. 5.0% or 6.0%
  readonly maxLoanLimitNpr: number;
  readonly targetBeneficiaries: string;
  readonly insuranceMandatory: boolean;
  readonly statutoryRef: string;
}

export const CONCESSIONAL_SCHEME_CONFIG: Record<ConcessionalSchemeType, ConcessionalSchemeMetadata> = {
  COMMERCIAL_AGRICULTURE: {
    code: 'COMMERCIAL_AGRICULTURE',
    titleEn: 'Commercial Agriculture & Livestock Concessional Loan',
    titleNe: 'व्यावसायिक कृषि तथा पशुपन्छी ब्याज अनुदान कर्जा',
    defaultSubsidyRate: 5.0,
    maxLoanLimitNpr: 5000000,
    targetBeneficiaries: 'कृषक तथा कृषि उद्यमी (Agriculture & Livestock Farmers)',
    insuranceMandatory: true,
    statutoryRef: 'एकीकृत कार्यविधि २०७५ दफा ३(१)',
  },
  WOMEN_ENTREPRENEURSHIP: {
    code: 'WOMEN_ENTREPRENEURSHIP',
    titleEn: 'Women Entrepreneurship Special Subsidy Loan',
    titleNe: 'महिला उद्यमशीलता विशेष ब्याज अनुदान कर्जा',
    defaultSubsidyRate: 6.0,
    maxLoanLimitNpr: 1500000,
    targetBeneficiaries: 'महिला सदस्य तथा महिला समूह (Women Entrepreneurs & SHGs)',
    insuranceMandatory: false,
    statutoryRef: 'एकीकृत कार्यविधि २०७५ दफा ३(३)',
  },
  EDUCATED_YOUTH: {
    code: 'EDUCATED_YOUTH',
    titleEn: 'Educated Youth Self-Employment Subsidy Loan',
    titleNe: 'शिक्षित युवा स्वरोजगार ब्याज अनुदान कर्जा',
    defaultSubsidyRate: 5.0,
    maxLoanLimitNpr: 700000,
    targetBeneficiaries: 'कम्तिमा स्नातक उत्तीर्ण युवा (Bachelor Degree Graduates under 40)',
    insuranceMandatory: false,
    statutoryRef: 'एकीकृत कार्यविधि २०७५ दफा ३(२)',
  },
  RETURNEE_MIGRANT: {
    code: 'RETURNEE_MIGRANT',
    titleEn: 'Returnee Migrant Enterprise Project Loan',
    titleNe: 'विदेशबाट फर्केका युवा उद्यमशीलता कर्जा',
    defaultSubsidyRate: 5.0,
    maxLoanLimitNpr: 1000000,
    targetBeneficiaries: 'वैदेशिक रोजगारबाट फर्केका युवा (Returnees from Overseas)',
    insuranceMandatory: false,
    statutoryRef: 'एकीकृत कार्यविधि २०७५ दफा ३(४)',
  },
  DALIT_COMMUNITY: {
    code: 'DALIT_COMMUNITY',
    titleEn: 'Traditional Occupation & Dalit Business Loan',
    titleNe: 'दलित समुदाय परम्परागत पेशा व्यवसाय कर्जा',
    defaultSubsidyRate: 6.0,
    maxLoanLimitNpr: 1000000,
    targetBeneficiaries: 'दलित समुदायका परम्परागत सीप भएका उद्यमी (Traditional Artisans)',
    insuranceMandatory: false,
    statutoryRef: 'एकीकृत कार्यविधि २०७५ दफा ३(५)',
  },
  LOCAL_MUNICIPALITY_AGRI: {
    code: 'LOCAL_MUNICIPALITY_AGRI',
    titleEn: 'Gadhawa Rural Municipality Local Agri Grant Scheme',
    titleNe: 'गढवा गाउँपालिका तोरी तथा डेरी कृषि प्रवर्धन ब्याज अनुदान',
    defaultSubsidyRate: 4.0,
    maxLoanLimitNpr: 500000,
    targetBeneficiaries: 'गढवा गाउँपालिकाका रैथाने कृषक (Gadhawa Local Farmers)',
    insuranceMandatory: true,
    statutoryRef: 'गढवा गाउँपालिका कृषि विकास कोष कार्यविधि २०७९',
  },
};

export interface ConcessionalLoanRecord {
  readonly id: string;
  readonly loanId: string;
  readonly loanNo: string;
  readonly memberId: string;
  readonly memberNo: string;
  readonly memberName: string;
  readonly schemeType: ConcessionalSchemeType;
  readonly enterpriseName: string;
  readonly projectLocation: string; // e.g. 'गढवा-५, दाङ'
  readonly approvedPrincipal: number;
  readonly remainingBalance: number;
  readonly nominalAnnualRate: number; // e.g. 12.0%
  readonly subsidyAnnualRate: number; // e.g. 5.0%
  readonly effectiveBorrowerRate: number; // e.g. 7.0%
  readonly disbursementDateBS: string;
  readonly maturityDateBS: string;
  readonly insurancePolicyNo?: string;
  readonly monitoringStatus: 'VERIFIED_ACTIVE' | 'UNDER_INSPECTION' | 'NON_COMPLIANT';
  readonly lastInspectionDateBS?: string;
  readonly cumulativeSubsidyReimbursed: number;
}

export interface InterestSubsidyCalculationResult {
  readonly periodDays: number;
  readonly principal: number;
  readonly nominalAnnualRate: number;
  readonly subsidyAnnualRate: number;
  readonly effectiveBorrowerRate: number;
  readonly totalNominalInterest: number;
  readonly memberPayableInterest: number;
  readonly governmentSubsidyPayable: number;
}

export interface ConcessionalEligibilityCriteria {
  readonly schemeType: ConcessionalSchemeType;
  readonly applicantAge: number;
  readonly isWoman: boolean;
  readonly isDalit: boolean;
  readonly isReturneeMigrant: boolean;
  readonly hasAcademicDegree: boolean;
  readonly hasEnterpriseRegistration: boolean;
  readonly hasLivestockCropInsurance: boolean;
  readonly requestedAmount: number;
}

export interface SubsidyQuarterlyClaimBatch {
  readonly id: string;
  readonly claimBatchNo: string;
  readonly fiscalYear: string;
  readonly quarterBS: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  readonly quarterLabelNe: string;
  readonly claimDateBS: string;
  readonly totalEligibleLoans: number;
  readonly totalActivePrincipal: number;
  readonly totalSubsidyClaimAmount: number;
  readonly reimbursementAuthority: string;
  readonly status: 'DRAFT' | 'SUBMITTED_TO_MUNICIPALITY' | 'REIMBURSED_CREDITED';
}

/**
 * Calculate the exact interest split between member obligation and government subsidy reimbursement
 * Standard formula: (Principal * Rate% * Days) / (365 * 100)
 */
export function calculateInterestSubsidySplit(params: {
  readonly principal: number;
  readonly nominalRate: number;
  readonly subsidyRate: number;
  readonly periodDays: number;
}): InterestSubsidyCalculationResult {
  const { principal, nominalRate, subsidyRate, periodDays } = params;

  if (principal <= 0 || periodDays <= 0) {
    return {
      periodDays: Math.max(0, periodDays),
      principal: Math.max(0, principal),
      nominalAnnualRate: nominalRate,
      subsidyAnnualRate: subsidyRate,
      effectiveBorrowerRate: Math.max(0, nominalRate - subsidyRate),
      totalNominalInterest: 0,
      memberPayableInterest: 0,
      governmentSubsidyPayable: 0,
    };
  }

  const effectiveBorrowerRate = Math.max(0, Math.round((nominalRate - subsidyRate) * 100) / 100);

  // Exact interest calculation based on 365-day year
  const totalNominalInterest = Math.round(((principal * nominalRate * periodDays) / (365 * 100)) * 100) / 100;
  const governmentSubsidyPayable = Math.round(((principal * subsidyRate * periodDays) / (365 * 100)) * 100) / 100;
  const memberPayableInterest = Math.max(0, Math.round((totalNominalInterest - governmentSubsidyPayable) * 100) / 100);

  return {
    periodDays,
    principal,
    nominalAnnualRate: nominalRate,
    subsidyAnnualRate: subsidyRate,
    effectiveBorrowerRate,
    totalNominalInterest,
    memberPayableInterest,
    governmentSubsidyPayable,
  };
}

/**
 * Validate an applicant's statutory eligibility under Government Concessional Guidelines
 */
export function validateConcessionalEligibility(
  criteria: ConcessionalEligibilityCriteria
): {
  readonly isEligible: boolean;
  readonly errors: readonly string[];
  readonly errorsNepali: readonly string[];
  readonly maxEligibleAmount: number;
} {
  const config = CONCESSIONAL_SCHEME_CONFIG[criteria.schemeType];
  const errors: string[] = [];
  const errorsNepali: string[] = [];

  // 1. Amount limit check
  if (criteria.requestedAmount > config.maxLoanLimitNpr) {
    errors.push(`Requested amount NPR ${criteria.requestedAmount} exceeds the ceiling of NPR ${config.maxLoanLimitNpr}`);
    errorsNepali.push(`माग गरिएको रकम रु. ${criteria.requestedAmount.toLocaleString('en-IN')} अधिकतम सीमा रु. ${config.maxLoanLimitNpr.toLocaleString('en-IN')} भन्दा बढी छ।`);
  }

  if (criteria.requestedAmount <= 0) {
    errors.push('Requested amount must be greater than zero');
    errorsNepali.push('माग गरिएको कर्जा रकम शून्यभन्दा बढी हुनुपर्दछ।');
  }

  // 2. Insurance Requirement Check
  if (config.insuranceMandatory && !criteria.hasLivestockCropInsurance) {
    errors.push('Crop or livestock insurance is mandatory for this agricultural scheme');
    errorsNepali.push('यस कृषि कर्जाका लागि अनिवार्य बाली वा पशुपन्छी बीमा पोलिसी आवश्यक पर्दछ।');
  }

  // 3. Scheme-specific checks
  switch (criteria.schemeType) {
    case 'WOMEN_ENTREPRENEURSHIP':
      if (!criteria.isWoman) {
        errors.push('Applicant must be a woman entrepreneur');
        errorsNepali.push('महिला उद्यमशीलता कर्जाका लागि आवेदक महिला सदस्य हुनु अनिवार्य छ।');
      }
      break;

    case 'EDUCATED_YOUTH':
      if (!criteria.hasAcademicDegree) {
        errors.push('Minimum Bachelor degree required for Educated Youth scheme');
        errorsNepali.push('शिक्षित युवा स्वरोजगारका लागि कम्तिमा स्नातक तह (Bachelor) उत्तीर्ण हुनुपर्दछ।');
      }
      if (criteria.applicantAge > 40 || criteria.applicantAge < 21) {
        errors.push('Age must be between 21 and 40 years');
        errorsNepali.push('उमेर २१ वर्ष पूरा भई ४० वर्ष ननाघेको हुनुपर्दछ।');
      }
      break;

    case 'RETURNEE_MIGRANT':
      if (!criteria.isReturneeMigrant) {
        errors.push('Applicant must have valid overseas employment returnee record (within 3 years)');
        errorsNepali.push('वैदेशिक रोजगारबाट श्रम स्वीकृति लिई स्वदेश फर्केको प्रमाण हुनुपर्दछ।');
      }
      break;

    case 'DALIT_COMMUNITY':
      if (!criteria.isDalit) {
        errors.push('Applicant must belong to the Dalit community with traditional business heritage');
        errorsNepali.push('आवेदक दलित समुदायको परम्परागत सीप तथा पेशाकर्मी हुनुपर्दछ।');
      }
      break;

    default:
      break;
  }

  return {
    isEligible: errors.length === 0,
    errors,
    errorsNepali,
    maxEligibleAmount: config.maxLoanLimitNpr,
  };
}

/**
 * Generate a quarterly interest subsidy reimbursement claim schedule for regulatory submission
 */
export function generateQuarterlySubsidyBatch(params: {
  readonly claimBatchNo: string;
  readonly fiscalYear: string;
  readonly quarterBS: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  readonly claimDateBS: string;
  readonly loans: readonly ConcessionalLoanRecord[];
  readonly quarterDays?: number;
  readonly authority?: string;
}): {
  readonly batch: SubsidyQuarterlyClaimBatch;
  readonly itemCalculations: readonly (InterestSubsidyCalculationResult & { readonly loanRecord: ConcessionalLoanRecord })[];
} {
  const {
    claimBatchNo,
    fiscalYear,
    quarterBS,
    claimDateBS,
    loans,
    quarterDays = 91,
    authority = 'गढवा गाउँपालिका कृषि विकास शाखा तथा नेपाल सरकार अर्थ मन्त्रालय',
  } = params;

  const quarterLabels: Record<string, string> = {
    Q1: 'प्रथम त्रैमासिक (श्रावण–आश्विन)',
    Q2: 'दोस्रो त्रैमासिक (कार्तिक–पौष)',
    Q3: 'तेस्रो त्रैमासिक (माघ–चैत्र)',
    Q4: 'चौथो त्रैमासिक (वैशाख–असार)',
  };

  // Only verified active loans are eligible for quarterly subsidy claim
  const eligibleLoans = loans.filter((l) => l.monitoringStatus === 'VERIFIED_ACTIVE' && l.remainingBalance > 0);

  const itemCalculations = eligibleLoans.map((loan) => {
    const calc = calculateInterestSubsidySplit({
      principal: loan.remainingBalance,
      nominalRate: loan.nominalAnnualRate,
      subsidyRate: loan.subsidyAnnualRate,
      periodDays: quarterDays,
    });
    return {
      ...calc,
      loanRecord: loan,
    };
  });

  const totalActivePrincipal = itemCalculations.reduce((sum, item) => sum + item.principal, 0);
  const totalSubsidyClaimAmount = itemCalculations.reduce(
    (sum, item) => sum + item.governmentSubsidyPayable,
    0
  );

  const batch: SubsidyQuarterlyClaimBatch = {
    id: `SUB-BATCH-${fiscalYear.replace('/', '-')}-${quarterBS}`,
    claimBatchNo,
    fiscalYear,
    quarterBS,
    quarterLabelNe: quarterLabels[quarterBS] || 'त्रैमासिक',
    claimDateBS,
    totalEligibleLoans: itemCalculations.length,
    totalActivePrincipal: Math.round(totalActivePrincipal * 100) / 100,
    totalSubsidyClaimAmount: Math.round(totalSubsidyClaimAmount * 100) / 100,
    reimbursementAuthority: authority,
    status: 'SUBMITTED_TO_MUNICIPALITY',
  };

  return { batch, itemCalculations };
}

/**
 * Export Statutory Concessional Loan Subsidy Claim Schedule to CSV
 */
export function exportSubsidyClaimCsv(
  batch: SubsidyQuarterlyClaimBatch,
  calculations: readonly (InterestSubsidyCalculationResult & { readonly loanRecord: ConcessionalLoanRecord })[]
): string {
  const metaHeader = [
    `"दाबी ब्याच नं: ${batch.claimBatchNo}"`,
    `"आर्थिक वर्ष: ${batch.fiscalYear}"`,
    `"त्रैमास: ${batch.quarterLabelNe}"`,
    `"दाबी मिति: ${batch.claimDateBS}"`,
    `"नियमनकारी निकाय: ${batch.reimbursementAuthority}"`,
    `"कुल योग्य ऋणी संख्या: ${batch.totalEligibleLoans}"`,
    `"कुल दाबी रकम (NPR): ${batch.totalSubsidyClaimAmount.toFixed(2)}"`,
  ].join('\r\n');

  const headers = [
    'क्र.सं. (S.N.)',
    'ऋणी सदस्य नं (Member No)',
    'ऋणीको नाम (Member Name)',
    'कर्जा नं (Loan No)',
    'सहुलियतपूर्ण योजना (Scheme)',
    'उद्यम/परियोजना (Enterprise)',
    'परियोजना स्थल (Location)',
    'बाँकी साँवा (Balance NPR)',
    'वार्षिक सामान्य ब्याज दर (Nominal %)',
    'सरकारी अनुदान दर (Subsidy %)',
    'ऋणीले तिर्ने खुद दर (Effective %)',
    'अवधि दिन (Days)',
    'कुल पाकेको ब्याज (Total Interest)',
    'ऋणीको दायित्व (Member Due)',
    'सरकारसँग सोधभर्ना दाबी रकम (Claim NPR)',
    'बीमा पोलिसी नं (Insurance No)',
  ].map((h) => `"${h}"`).join(',');

  const rows = calculations.map((item, idx) => {
    const l = item.loanRecord;
    const schemeConfig = CONCESSIONAL_SCHEME_CONFIG[l.schemeType];
    return [
      idx + 1,
      `"${l.memberNo}"`,
      `"${l.memberName}"`,
      `"${l.loanNo}"`,
      `"${schemeConfig ? schemeConfig.titleNe : l.schemeType}"`,
      `"${l.enterpriseName}"`,
      `"${l.projectLocation}"`,
      item.principal.toFixed(2),
      item.nominalAnnualRate.toFixed(2),
      item.subsidyAnnualRate.toFixed(2),
      item.effectiveBorrowerRate.toFixed(2),
      item.periodDays,
      item.totalNominalInterest.toFixed(2),
      item.memberPayableInterest.toFixed(2),
      item.governmentSubsidyPayable.toFixed(2),
      `"${l.insurancePolicyNo || '-'}"`,
    ].join(',');
  });

  return [metaHeader, '', headers, ...rows].join('\r\n');
}

/**
 * Default Seed Records for Unako SACCOS Concessional Loans Portfolio
 */
export function createDefaultConcessionalLoans(): readonly ConcessionalLoanRecord[] {
  return [
    {
      id: 'CONC-2080-001',
      loanId: 'ln-agri-01',
      loanNo: 'LN-AGRI-2080-01',
      memberId: 'm-101',
      memberNo: 'M-101',
      memberName: 'शान्ति देवी थारु (Shanti Devi Tharu)',
      schemeType: 'WOMEN_ENTREPRENEURSHIP',
      enterpriseName: 'शान्ति महिला सिलाइकटाइ तथा हस्तकला उद्योग',
      projectLocation: 'गढवा-५, दाङ',
      approvedPrincipal: 600000,
      remainingBalance: 480000,
      nominalAnnualRate: 12.0,
      subsidyAnnualRate: 6.0,
      effectiveBorrowerRate: 6.0,
      disbursementDateBS: '२०८०/०२/१५',
      maturityDateBS: '२०८३/०२/१४',
      monitoringStatus: 'VERIFIED_ACTIVE',
      lastInspectionDateBS: '२०८०/०९/१०',
      cumulativeSubsidyReimbursed: 36000,
    },
    {
      id: 'CONC-2080-002',
      loanId: 'ln-agri-02',
      loanNo: 'LN-AGRI-2080-02',
      memberId: 'm-102',
      memberNo: 'M-102',
      memberName: 'राम बहादुर चौधरी (Ram Bahadur Chaudhary)',
      schemeType: 'COMMERCIAL_AGRICULTURE',
      enterpriseName: 'गढवा उन्नत तोरी खेती तथा तोरी तेल मिल परियोजना',
      projectLocation: 'गढवा-३, दाङ',
      approvedPrincipal: 1500000,
      remainingBalance: 1250000,
      nominalAnnualRate: 12.5,
      subsidyAnnualRate: 5.0,
      effectiveBorrowerRate: 7.5,
      disbursementDateBS: '२०८०/०३/०१',
      maturityDateBS: '२०८५/०२/३०',
      insurancePolicyNo: 'AGRI-INS-7728-2080',
      monitoringStatus: 'VERIFIED_ACTIVE',
      lastInspectionDateBS: '२०८०/०९/१८',
      cumulativeSubsidyReimbursed: 78125,
    },
    {
      id: 'CONC-2080-003',
      loanId: 'ln-agri-03',
      loanNo: 'LN-AGRI-2080-03',
      memberId: 'm-103',
      memberNo: 'M-103',
      memberName: 'प्रकाश वि.क. (Prakash B.K.)',
      schemeType: 'DALIT_COMMUNITY',
      enterpriseName: 'परम्परागत आरन तथा आधुनिक धातु भाँडाकुँडा सुधार उद्योग',
      projectLocation: 'गढवा-५, दाङ',
      approvedPrincipal: 500000,
      remainingBalance: 380000,
      nominalAnnualRate: 12.0,
      subsidyAnnualRate: 6.0,
      effectiveBorrowerRate: 6.0,
      disbursementDateBS: '२०८०/०४/१०',
      maturityDateBS: '२०८३/०४/०९',
      monitoringStatus: 'VERIFIED_ACTIVE',
      lastInspectionDateBS: '२०८०/०९/१२',
      cumulativeSubsidyReimbursed: 28500,
    },
    {
      id: 'CONC-2080-004',
      loanId: 'ln-agri-04',
      loanNo: 'LN-AGRI-2080-04',
      memberId: 'm-104',
      memberNo: 'M-104',
      memberName: 'दिपेश यादव (Dipesh Yadav)',
      schemeType: 'RETURNEE_MIGRANT',
      enterpriseName: 'दाङ आधुनिक गाईभैंसी डेरी फर्म तथा चिलिङ सेन्टर',
      projectLocation: 'गढवा-६, दाङ',
      approvedPrincipal: 1000000,
      remainingBalance: 820000,
      nominalAnnualRate: 12.0,
      subsidyAnnualRate: 5.0,
      effectiveBorrowerRate: 7.0,
      disbursementDateBS: '२०८०/०१/२५',
      maturityDateBS: '२०८४/०१/२४',
      insurancePolicyNo: 'LIVESTOCK-INS-9912-2080',
      monitoringStatus: 'VERIFIED_ACTIVE',
      lastInspectionDateBS: '२०८०/०९/२०',
      cumulativeSubsidyReimbursed: 51250,
    },
  ];
}
