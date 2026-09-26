/**
 * Loan Collateral Valuation & LTV (Loan-to-Value) Safety Gate
 * Complies with Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) & NRB Microfinance Directives
 */

import { CollateralType } from '../types';

/**
 * Statutory Loan-to-Value (LTV) limits prescribed for Cooperatives in Nepal
 */
export const STATUTORY_LTV_LIMITS: Record<CollateralType, number> = {
  LAND_LALPURJA: 50, // Max 50% for land / real estate deeds
  BUILDING: 50, // Max 50% for physical buildings / commercial houses
  CASH_FD_PLEDGE: 85, // Up to 85% for Fixed Deposit receipts
  SHARE_PLEDGE: 50, // Max 50% for cooperative shares
  GOLD_JEWELLERY: 60, // Max 60% of verified bullion value
  VEHICLE: 50, // Max 50% of bluebook depreciated market value
  LIVESTOCK: 50, // Max 50% for insured cattle/buffalo
  GUARANTOR: 0, // Unsecured personal guarantee
  GROUP_GUARANTEE: 0, // Unsecured solidarity group guarantee
  OTHER: 40, // Other miscellaneous physical pledges
};

/** Statutory maximum unsecured loan limit without physical collateral (NPR 3,00,000) */
export const MAX_UNSECURED_LOAN_CEILING = 300000;

/** Maximum allowable Debt-Service-to-Income (DSTI) percentage (50%) */
export const MAX_ALLOWABLE_DSTI_PERCENT = 50;

/** Maximum total debt exposure ratio including existing obligations (60%) */
export const MAX_TOTAL_DEBT_RATIO_PERCENT = 60;

export interface LoanSafetyInput {
  requestedAmount: number;
  tenureMonths: number;
  annualInterestRate: number; // e.g. 11.5
  monthlyIncome: number;
  existingDebtMonthlyEmi?: number;
  collateralType: CollateralType;
  collateralEstimatedValue: number;
  hasInsurancePolicy?: boolean;
}

export interface LoanSafetyEvaluation {
  requestedAmount: number;
  collateralEstimatedValue: number;
  collateralType: CollateralType;
  statutoryMaxLtvPercent: number;
  actualLtvPercent: number;
  maxAllowableLoanByCollateral: number;
  monthlyEmi: number;
  dstiPercent: number;
  totalDebtRatioPercent: number;
  isLtvCompliant: boolean;
  isDstiCompliant: boolean;
  isUnsecuredLimitCompliant: boolean;
  isInsuranceCompliant: boolean;
  overallRiskRating: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK_BREACH';
  recommendedAction: 'APPROVE' | 'REDUCE_AMOUNT' | 'ADDITIONAL_COLLATERAL_REQUIRED' | 'REJECT';
  suggestedMaxLoanAmount: number;
  breachReasons: {
    code: string;
    messageNepali: string;
    messageEnglish: string;
    severity: 'WARNING' | 'CRITICAL';
  }[];
}

/**
 * Calculates standard reducing balance Monthly Installment (EMI)
 */
export function calculateLoanEmi(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualInterestRate <= 0) return Math.round(principal / tenureMonths);

  const monthlyRate = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

/**
 * Evaluates whether a loan application passes statutory LTV and DSTI safety gates
 */
export function evaluateLoanSafetyGate(input: LoanSafetyInput): LoanSafetyEvaluation {
  const {
    requestedAmount,
    tenureMonths,
    annualInterestRate,
    monthlyIncome,
    existingDebtMonthlyEmi = 0,
    collateralType,
    collateralEstimatedValue,
    hasInsurancePolicy = false,
  } = input;

  const statutoryMaxLtvPercent = STATUTORY_LTV_LIMITS[collateralType] ?? 40;
  const isUnsecured = collateralType === 'GUARANTOR' || collateralType === 'GROUP_GUARANTEE';

  // 1. LTV calculation
  const actualLtvPercent =
    collateralEstimatedValue > 0
      ? Math.round((requestedAmount / collateralEstimatedValue) * 100 * 10) / 10
      : isUnsecured
      ? 0
      : 100;

  const maxAllowableLoanByCollateral = isUnsecured
    ? MAX_UNSECURED_LOAN_CEILING
    : Math.floor(collateralEstimatedValue * (statutoryMaxLtvPercent / 100));

  const isLtvCompliant = isUnsecured
    ? requestedAmount <= MAX_UNSECURED_LOAN_CEILING
    : actualLtvPercent <= statutoryMaxLtvPercent;

  // 2. EMI & DSTI calculation
  const monthlyEmi = calculateLoanEmi(requestedAmount, annualInterestRate, tenureMonths);
  const dstiPercent =
    monthlyIncome > 0 ? Math.round((monthlyEmi / monthlyIncome) * 100 * 10) / 10 : 100;

  const totalDebtObligation = monthlyEmi + existingDebtMonthlyEmi;
  const totalDebtRatioPercent =
    monthlyIncome > 0 ? Math.round((totalDebtObligation / monthlyIncome) * 100 * 10) / 10 : 100;

  const isDstiCompliant = dstiPercent <= MAX_ALLOWABLE_DSTI_PERCENT;

  // 3. Unsecured ceiling compliance
  const isUnsecuredLimitCompliant = !isUnsecured || requestedAmount <= MAX_UNSECURED_LOAN_CEILING;

  // 4. Livestock insurance requirement
  const isInsuranceCompliant = collateralType !== 'LIVESTOCK' || hasInsurancePolicy;

  // 5. Breaches and warnings
  const breachReasons: LoanSafetyEvaluation['breachReasons'] = [];

  if (!isLtvCompliant && !isUnsecured) {
    breachReasons.push({
      code: 'LTV_EXCEEDED',
      messageNepali: `धितो सुरक्षा अनुपात (LTV) ${actualLtvPercent}% पुग्यो, जुन वैधानिक सीमा ${statutoryMaxLtvPercent}% भन्दा बढी हो।`,
      messageEnglish: `Loan-to-Value (LTV) is ${actualLtvPercent}%, which exceeds statutory limit of ${statutoryMaxLtvPercent}%.`,
      severity: 'CRITICAL',
    });
  }

  if (isUnsecured && requestedAmount > MAX_UNSECURED_LOAN_CEILING) {
    breachReasons.push({
      code: 'UNSECURED_CEILING_EXCEEDED',
      messageNepali: `विना धितो व्यक्तिगत/समूह जमानी कर्जाको अधिकतम सीमा रु. ${MAX_UNSECURED_LOAN_CEILING.toLocaleString(
        'ne-NP'
      )} नाघेको छ।`,
      messageEnglish: `Unsecured loan exceeds regulatory cap of NPR ${MAX_UNSECURED_LOAN_CEILING.toLocaleString()}.`,
      severity: 'CRITICAL',
    });
  }

  if (!isDstiCompliant) {
    breachReasons.push({
      code: 'DSTI_EXCEEDED',
      messageNepali: `मासिक किस्ता (EMI) सदस्यको प्रमाणित आम्दानीको ${dstiPercent}% छ (स्वीकार्य सीमा: ५०%)।`,
      messageEnglish: `Monthly EMI takes up ${dstiPercent}% of net income (statutory max: 50%).`,
      severity: 'CRITICAL',
    });
  }

  if (totalDebtRatioPercent > MAX_TOTAL_DEBT_RATIO_PERCENT) {
    breachReasons.push({
      code: 'TOTAL_DEBT_RATIO_EXCEEDED',
      messageNepali: `कुल ऋण दायित्व सदस्यको मासिक आम्दानीको ${totalDebtRatioPercent}% छ (अधिकतम सीमा: ६०%)।`,
      messageEnglish: `Total debt service ratio is ${totalDebtRatioPercent}%, exceeding safe cap of 60%.`,
      severity: 'WARNING',
    });
  }

  if (!isInsuranceCompliant) {
    breachReasons.push({
      code: 'MISSING_LIVESTOCK_INSURANCE',
      messageNepali: 'पशुधन धितोको लागि अनिवार्य पशु बीमा पोलिसी संलग्न गरिएको छैन।',
      messageEnglish: 'Mandatory cattle/livestock insurance policy is missing for biological collateral.',
      severity: 'CRITICAL',
    });
  }

  // 6. Max suggested amount considering both collateral and income capacity
  const maxAffordableMonthlyEmi = monthlyIncome * (MAX_ALLOWABLE_DSTI_PERCENT / 100);
  const monthlyRate = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const maxLoanByIncome =
    annualInterestRate > 0 && factor > 1
      ? Math.floor((maxAffordableMonthlyEmi * (factor - 1)) / (monthlyRate * factor))
      : Math.floor(maxAffordableMonthlyEmi * tenureMonths);

  const suggestedMaxLoanAmount = Math.min(maxAllowableLoanByCollateral, maxLoanByIncome);

  // 7. Overall Risk Rating and Recommended Action
  let overallRiskRating: LoanSafetyEvaluation['overallRiskRating'] = 'LOW_RISK';
  let recommendedAction: LoanSafetyEvaluation['recommendedAction'] = 'APPROVE';

  const criticalBreaches = breachReasons.filter((b) => b.severity === 'CRITICAL');

  if (criticalBreaches.length >= 2) {
    overallRiskRating = 'HIGH_RISK_BREACH';
    recommendedAction = 'REJECT';
  } else if (criticalBreaches.length === 1) {
    overallRiskRating = 'HIGH_RISK_BREACH';
    if (!isLtvCompliant) {
      recommendedAction = 'ADDITIONAL_COLLATERAL_REQUIRED';
    } else {
      recommendedAction = 'REDUCE_AMOUNT';
    }
  } else if (breachReasons.length > 0) {
    overallRiskRating = 'MODERATE_RISK';
    recommendedAction = 'REDUCE_AMOUNT';
  }

  return {
    requestedAmount,
    collateralEstimatedValue,
    collateralType,
    statutoryMaxLtvPercent,
    actualLtvPercent,
    maxAllowableLoanByCollateral,
    monthlyEmi,
    dstiPercent,
    totalDebtRatioPercent,
    isLtvCompliant,
    isDstiCompliant,
    isUnsecuredLimitCompliant,
    isInsuranceCompliant,
    overallRiskRating,
    recommendedAction,
    suggestedMaxLoanAmount,
    breachReasons,
  };
}
