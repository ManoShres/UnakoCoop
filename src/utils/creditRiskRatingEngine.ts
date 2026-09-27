/**
 * Unako SACCOS - Member Credit Risk Rating & Basel/PEARLS Borrower Scoring Engine
 * (ऋणी सदस्य कर्जा जोखिम रेटिङ तथा क्रेडिट स्कोरिङ प्रणाली)
 *
 * Statutory & Risk Framework:
 * - Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) Section 50 & 51
 *   - Mandatory credit risk assessment before loan sanction.
 *   - Single Borrower Credit Limit: Exposure <= statutory multiple of member share capital / reserve.
 * - PEARLS Protection & Asset Quality Standards (P1, A1, A2).
 * - The 5 Cs of Credit:
 *   1. CHARACTER (चरित्र तथा साख इतिहास - २५%)
 *   2. CAPACITY (ऋण भुक्तानी क्षमता तथा DSTI अनुपात - २५%)
 *   3. CAPITAL (पुँजी, सेयर तथा नियमित बचत अनुपात - १५%)
 *   4. COLLATERAL (धितो सुरक्षण, कभरेज तथा LTV अनुपात - २०%)
 *   5. CONDITIONS (परियोजना सम्भाव्यता तथा स्थानीय बजार अवस्था - १५%)
 */

export type CreditScoringPillar =
  | 'CHARACTER'
  | 'CAPACITY'
  | 'CAPITAL'
  | 'COLLATERAL'
  | 'CONDITIONS';

export type CreditRiskGrade =
  | 'GRADE_A_PRIME'        // 85 - 100 अंक (उत्कृष्ट - न्यूनतम जोखिम, ०.५% छुट योग्य)
  | 'GRADE_B_MODERATE'     // 70 - 84 अंक (सन्तोषप्रद - मानक स्वीकृत)
  | 'GRADE_C_CONDITIONAL'  // 50 - 69 अंक (सशर्त - थप सुरक्षण वा कटौती आवश्यक)
  | 'GRADE_D_REJECTED';    // < 50 अंक (उच्च जोखिम - अस्वीकृत)

export interface BorrowerCreditScoreInput {
  readonly applicantName: string;
  readonly memberNo: string;
  readonly membershipMonths: number;
  readonly requestedAmount: number;
  readonly verifiedMonthlyIncome: number;
  readonly totalMonthlyDebtObligations: number; // Includes proposed EMI
  readonly shareCapitalBalance: number;
  readonly regularSavingsBalance: number;
  readonly collateralAssessedValue: number;
  readonly hasCibDefaultRecord: boolean;
  readonly hasActiveInsurance: boolean;
  readonly hasStrongGuarantor: boolean;
  readonly projectFeasibilityScore: number; // 0 to 15
}

export interface PillarScoreDetail {
  readonly score: number;
  readonly maxScore: number;
  readonly percentage: number;
  readonly commentsNe: string;
}

export interface CreditRiskEvaluationReport {
  readonly applicantName: string;
  readonly memberNo: string;
  readonly requestedAmount: number;
  readonly totalScore: number;
  readonly grade: CreditRiskGrade;
  readonly gradeLabelNe: string;
  readonly gradeLabelEn: string;
  readonly dstiRatio: number; // Debt Service to Income (%)
  readonly ltvRatio: number;  // Loan to Value (%)
  readonly shareMultiplier: number; // Requested Loan / Share Capital
  readonly isCoopAct51Compliant: boolean; // Single borrower limit: <= 10x share capital
  readonly pillarScores: Record<CreditScoringPillar, PillarScoreDetail>;
  readonly recommendedAction: 'APPROVE_PREFERENTIAL' | 'APPROVE_STANDARD' | 'APPROVE_CONDITIONAL' | 'REJECT';
  readonly recommendationNe: string;
  readonly recommendationEn: string;
}

/**
 * Evaluate Borrower Credit Score across the 5 Cs of Credit
 */
export function evaluateBorrowerCreditRisk(
  input: BorrowerCreditScoreInput
): CreditRiskEvaluationReport {
  const {
    applicantName,
    memberNo,
    membershipMonths,
    requestedAmount,
    verifiedMonthlyIncome,
    totalMonthlyDebtObligations,
    shareCapitalBalance,
    regularSavingsBalance,
    collateralAssessedValue,
    hasCibDefaultRecord,
    hasActiveInsurance,
    hasStrongGuarantor,
    projectFeasibilityScore,
  } = input;

  // 1. CHARACTER (Max: 25 points)
  let characterScore = 0;
  let characterComment = '';
  if (hasCibDefaultRecord) {
    characterScore = 0;
    characterComment = 'कर्जा सूचना केन्द्र (CIB) मा कालोसूची वा भाखा नाघेको कैफियत देखियो।';
  } else {
    // Membership longevity (Up to 10 points)
    if (membershipMonths >= 36) characterScore += 10;
    else if (membershipMonths >= 12) characterScore += 7;
    else characterScore += 4;

    // Meeting attendance / cooperative discipline (Up to 8 points)
    characterScore += 8;

    // Past clean repayment record (7 points)
    characterScore += 7;
    characterComment = 'विगतमा सफा कर्जा इतिहास तथा संस्थामा नियमित आवद्धता रहेको।';
  }

  // 2. CAPACITY (Max: 25 points) - DSTI evaluation
  const dstiRatio =
    verifiedMonthlyIncome > 0
      ? Math.round((totalMonthlyDebtObligations / verifiedMonthlyIncome) * 10000) / 100
      : 100;

  let capacityScore = 0;
  let capacityComment = '';
  if (dstiRatio <= 35) {
    capacityScore = 25;
    capacityComment = `उत्कृष्ट ऋण भुक्तानी क्षमता (DSTI: ${dstiRatio}% <= ३५%)।`;
  } else if (dstiRatio <= 50) {
    capacityScore = 18;
    capacityComment = `स्वीकार्य ऋण भुक्तानी क्षमता (DSTI: ${dstiRatio}% <= ५०%)।`;
  } else if (dstiRatio <= 65) {
    capacityScore = 10;
    capacityComment = `उच्च किस्ता भार (DSTI: ${dstiRatio}%)। आम्दानीको ६५% सम्म ऋण दायित्व।`;
  } else {
    capacityScore = 2;
    capacityComment = `असुरक्षित किस्ता भार (DSTI: ${dstiRatio}% > ६५%)। ऋण भुक्तानीमा गम्भीर जोखिम।`;
  }

  // 3. CAPITAL (Max: 15 points) - Share & Savings backing
  const shareMultiplier =
    shareCapitalBalance > 0
      ? Math.round((requestedAmount / shareCapitalBalance) * 100) / 100
      : 999;

  // Under Cooperative Act 2074 Sec 51, single member loan typically capped at 10x share capital
  const isCoopAct51Compliant = shareMultiplier <= 10;

  let capitalScore = 0;
  let capitalComment = '';
  if (shareMultiplier <= 5) {
    capitalScore += 8;
  } else if (shareMultiplier <= 10) {
    capitalScore += 5;
  } else {
    capitalScore += 1;
  }

  // Regular savings balance ratio
  const savingsRatio =
    requestedAmount > 0 ? (regularSavingsBalance / requestedAmount) * 100 : 0;
  if (savingsRatio >= 20) {
    capitalScore += 7;
    capitalComment = `सेयर तथा नियमित बचत अनुपात निकै बलियो (बचत अनुपात ${Math.round(savingsRatio)}%)।`;
  } else if (savingsRatio >= 10) {
    capitalScore += 4;
    capitalComment = `सेयर अनुपात वैधानिक सीमाभित्र, नियमित बचत सन्तोषप्रद।`;
  } else {
    capitalScore += 1;
    capitalComment = `सेयर तथा नियमित बचत कमजोर। ऐनको सीमा अनुपालनमा सतर्कता आवश्यक।`;
  }

  // 4. COLLATERAL (Max: 20 points) - LTV & Security
  const ltvRatio =
    collateralAssessedValue > 0
      ? Math.round((requestedAmount / collateralAssessedValue) * 10000) / 100
      : 100;

  let collateralScore = 0;
  let collateralComment = '';
  if (ltvRatio <= 50) {
    collateralScore += 10;
  } else if (ltvRatio <= 65) {
    collateralScore += 7;
  } else if (ltvRatio <= 80) {
    collateralScore += 4;
  } else {
    collateralScore += 1;
  }

  if (hasActiveInsurance) {
    collateralScore += 5;
  }
  if (hasStrongGuarantor) {
    collateralScore += 5;
  }

  collateralComment = `धितो LTV अनुपात ${ltvRatio}%। ${
    hasActiveInsurance ? 'बीमा पोलिसी संलग्न।' : 'बीमा नभएको।'
  } ${hasStrongGuarantor ? 'सबल व्यक्तिगत जमानीकर्ता रहेको।' : ''}`;

  // 5. CONDITIONS (Max: 15 points) - Project viability & market
  const conditionsScore = Math.min(15, Math.max(0, projectFeasibilityScore));
  let conditionsComment = '';
  if (conditionsScore >= 12) {
    conditionsComment = 'गढवा क्षेत्रको स्थानीय माग अनुसार परियोजना प्राविधिक तथा आर्थिक दृष्टिले उपयुक्त।';
  } else if (conditionsScore >= 8) {
    conditionsComment = 'परियोजना सामान्य सन्तोषप्रद, नियमित बजार अनुगमन आवश्यक।';
  } else {
    conditionsComment = 'परियोजनामा बजार प्रतिस्पर्धा तथा नगद प्रवाह जोखिम देखिएको।';
  }

  // Total Aggregate Score (0 to 100)
  const totalScore = Math.round(
    characterScore + capacityScore + capitalScore + collateralScore + conditionsScore
  );

  // Grade Assignment
  let grade: CreditRiskGrade = 'GRADE_D_REJECTED';
  let gradeLabelNe = 'घ वर्ग (उच्च जोखिम - अस्वीकृत)';
  let gradeLabelEn = 'Grade D (Critical Risk - Rejected)';
  let recommendedAction: CreditRiskEvaluationReport['recommendedAction'] = 'REJECT';
  let recommendationNe = '';
  let recommendationEn = '';

  if (totalScore >= 85 && !hasCibDefaultRecord && isCoopAct51Compliant) {
    grade = 'GRADE_A_PRIME';
    gradeLabelNe = 'क वर्ग (उत्कृष्ट - न्यूनतम जोखिम)';
    gradeLabelEn = 'Grade A (Prime - Low Risk)';
    recommendedAction = 'APPROVE_PREFERENTIAL';
    recommendationNe =
      'कर्जा स्वीकृत गर्न सिफारिस गरिन्छ। उत्कृष्ट क्रेडिट स्कोरिङ भएकाले ०.५% ब्याज छुट प्रदान गर्न सकिनेछ।';
    recommendationEn =
      'Strongly recommended for approval with preferential 0.5% interest rate rebate.';
  } else if (totalScore >= 70 && !hasCibDefaultRecord && isCoopAct51Compliant) {
    grade = 'GRADE_B_MODERATE';
    gradeLabelNe = 'ख वर्ग (सन्तोषप्रद - मानक स्वीकृत)';
    gradeLabelEn = 'Grade B (Satisfactory - Standard)';
    recommendedAction = 'APPROVE_STANDARD';
    recommendationNe = 'मानक सहकारी ऋण नीति बमोजिम स्वीकृत गर्न उपयुक्त।';
    recommendationEn = 'Approved under standard cooperative lending guidelines.';
  } else if (totalScore >= 50 && !hasCibDefaultRecord) {
    grade = 'GRADE_C_CONDITIONAL';
    gradeLabelNe = 'ग वर्ग (सशर्त - मध्यम जोखिम)';
    gradeLabelEn = 'Grade C (Conditional - Moderate Risk)';
    recommendedAction = 'APPROVE_CONDITIONAL';
    recommendationNe =
      'सशर्त स्वीकृति: थप बलियो साक्षी/जमानीकर्ता थप्न वा माग रकमको ७०% मात्र प्रवाह गर्न सिफारिस।';
    recommendationEn =
      'Conditional approval recommended: require additional guarantor or disburse 70% of requested amount.';
  } else {
    grade = 'GRADE_D_REJECTED';
    gradeLabelNe = 'घ वर्ग (उच्च जोखिम - अस्वीकृत)';
    gradeLabelEn = 'Grade D (High Risk - Rejected)';
    recommendedAction = 'REJECT';
    recommendationNe =
      'ऋण प्रवाह अस्वीकृत गर्न सिफारिस। उच्च DSTI वा कमजोर साख इतिहासका कारण जोखिम बहन गर्न नसकिने।';
    recommendationEn =
      'Loan application rejected due to excessive debt burden or adverse credit record.';
  }

  return {
    applicantName,
    memberNo,
    requestedAmount,
    totalScore,
    grade,
    gradeLabelNe,
    gradeLabelEn,
    dstiRatio,
    ltvRatio,
    shareMultiplier,
    isCoopAct51Compliant,
    pillarScores: {
      CHARACTER: {
        score: characterScore,
        maxScore: 25,
        percentage: Math.round((characterScore / 25) * 100),
        commentsNe: characterComment,
      },
      CAPACITY: {
        score: capacityScore,
        maxScore: 25,
        percentage: Math.round((capacityScore / 25) * 100),
        commentsNe: capacityComment,
      },
      CAPITAL: {
        score: capitalScore,
        maxScore: 15,
        percentage: Math.round((capitalScore / 15) * 100),
        commentsNe: capitalComment,
      },
      COLLATERAL: {
        score: collateralScore,
        maxScore: 20,
        percentage: Math.round((collateralScore / 20) * 100),
        commentsNe: collateralComment,
      },
      CONDITIONS: {
        score: conditionsScore,
        maxScore: 15,
        percentage: Math.round((conditionsScore / 15) * 100),
        commentsNe: conditionsComment,
      },
    },
    recommendedAction,
    recommendationNe,
    recommendationEn,
  };
}

/**
 * Export Credit Risk Scoring Evaluations to CSV
 */
export function exportCreditRiskReportCsv(
  evaluations: readonly CreditRiskEvaluationReport[]
): string {
  const metaHeader = [
    '"उनको बचत तथा ऋण सहकारी संस्था लि., गढवा-५, दाङ"',
    '"ऋणी सदस्य कर्जा जोखिम रेटिङ तथा क्रेडिट स्कोरिङ प्रतिवेदन (Credit Risk Scoring Register)"',
    `"कुल मूल्याङ्कित आवेदक संख्या: ${evaluations.length}"`,
    `"उत्पन्न मिति: ${new Date().toISOString().slice(0, 10)}"`,
  ].join('\r\n');

  const headers = [
    'क्र.सं. (S.N.)',
    'सदस्यता नं (Member No)',
    'आवेदकको नाम (Applicant Name)',
    'माग रकम (Requested NPR)',
    'कुल प्राप्ताङ्क (Score 100)',
    'जोखिम वर्ग (Risk Grade)',
    'किस्ता भार (DSTI %)',
    'धितो कभरेज (LTV %)',
    'सेयर अनुपात (Loan/Share)',
    'दफा ५१ अनुपालन (Sec 51)',
    'सिफारिस निर्णय (Decision)',
    'समितिको सुझाव (Recommendation)',
  ].map((h) => `"${h}"`).join(',');

  const rows = evaluations.map((e, idx) => {
    return [
      idx + 1,
      `"${e.memberNo}"`,
      `"${e.applicantName}"`,
      e.requestedAmount.toFixed(2),
      e.totalScore,
      `"${e.gradeLabelNe}"`,
      `${e.dstiRatio}%`,
      `${e.ltvRatio}%`,
      `${e.shareMultiplier}x`,
      `"${e.isCoopAct51Compliant ? 'पास (Pass)' : 'उल्लङ्घन (Fail)'}"`,
      `"${e.recommendedAction}"`,
      `"${e.recommendationNe}"`,
    ].join(',');
  });

  return [metaHeader, '', headers, ...rows].join('\r\n');
}

/**
 * Default Seed Applicants for Credit Scoring in Unako SACCOS
 */
export function createDefaultBorrowerScoreInputs(): readonly BorrowerCreditScoreInput[] {
  return [
    {
      applicantName: 'कमल प्रसाद चौधरी (Kamal Prasad Chaudhary)',
      memberNo: 'M-101',
      membershipMonths: 48,
      requestedAmount: 800000,
      verifiedMonthlyIncome: 75000,
      totalMonthlyDebtObligations: 26000, // DSTI: 34.6%
      shareCapitalBalance: 120000,        // Loan / Share: 6.6x
      regularSavingsBalance: 180000,
      collateralAssessedValue: 1800000,   // LTV: 44.4%
      hasCibDefaultRecord: false,
      hasActiveInsurance: true,
      hasStrongGuarantor: true,
      projectFeasibilityScore: 14,
    },
    {
      applicantName: 'शान्ति देवी थारु (Shanti Devi Tharu)',
      memberNo: 'M-102',
      membershipMonths: 24,
      requestedAmount: 500000,
      verifiedMonthlyIncome: 45000,
      totalMonthlyDebtObligations: 21000, // DSTI: 46.6%
      shareCapitalBalance: 60000,         // Loan / Share: 8.3x
      regularSavingsBalance: 85000,
      collateralAssessedValue: 900000,    // LTV: 55.5%
      hasCibDefaultRecord: false,
      hasActiveInsurance: true,
      hasStrongGuarantor: true,
      projectFeasibilityScore: 12,
    },
    {
      applicantName: 'सुरेश कुमार यादव (Suresh Kumar Yadav)',
      memberNo: 'M-103',
      membershipMonths: 8,
      requestedAmount: 1200000,
      verifiedMonthlyIncome: 50000,
      totalMonthlyDebtObligations: 34000, // DSTI: 68% (High!)
      shareCapitalBalance: 50000,         // Loan / Share: 24x (Violates 10x limit!)
      regularSavingsBalance: 30000,
      collateralAssessedValue: 1400000,   // LTV: 85.7%
      hasCibDefaultRecord: false,
      hasActiveInsurance: false,
      hasStrongGuarantor: false,
      projectFeasibilityScore: 7,
    },
  ];
}
