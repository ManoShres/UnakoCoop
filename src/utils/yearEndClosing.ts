/**
 * Year-End Financial Closing Engine (Asar Masanta / असार मसान्त)
 *
 * Implements statutory year-end profit distribution, interest capitalization,
 * and Tax Deducted at Source (TDS) deduction compliant with:
 * - Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) Section 44 & 45
 * - Inland Revenue Department (IRD) Nepal Income Tax Act 2058 (Section 88)
 */

export interface SavingsInterestResult {
  balance: number;
  annualRatePercent: number;
  days: number;
  grossInterest: number;
  tdsRatePercent: number;
  tdsAmount: number;
  netInterest: number;
}

export interface YearEndAppropriationInput {
  netProfit: number;
  fiscalYear: string;
  shareCapital: number;
  customGeneralReservePercent?: number; // default min 25%
}

export interface StatutoryAppropriationResult {
  fiscalYear: string;
  netProfit: number;
  // Mandatory Funds
  generalReserveFund: number; // min 25% (जगेडा कोष)
  educationFund: number; // 0.5% (सहकारी शिक्षा कोष)
  communityDevelopmentFund: number; // 0.5% (सामुदायिक विकास कोष)
  promotionFund: number; // 0.5% (सहकारी प्रवर्द्धन कोष)
  employeeWelfareFund: number; // 0.5% (कर्मचारी कल्याण कोष)
  totalStatutoryAllocations: number;
  // Surplus
  distributableSurplus: number;
  maxPermissibleDividendAmount: number; // 18% cap on share capital (सहकारी ऐन २०७४)
  patronageRefundAllocation: number; // Recommended 40% of distributable surplus
  dividendAllocationPool: number; // Recommended 60% of distributable surplus
}

export interface TrialBalanceInput {
  totalAssets: number;
  totalLiabilities: number;
  totalEquityAndReserves: number;
}

export interface TrialBalanceValidationResult {
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  variance: number;
  notes: string;
}

/**
 * Calculates interest on savings balance with 5% TDS deduction as per Nepal Tax Act
 */
export function calculateSavingsInterestWithTds(
  balance: number,
  annualRatePercent: number,
  days: number = 365
): SavingsInterestResult {
  if (balance <= 0 || annualRatePercent <= 0 || days <= 0) {
    return {
      balance: Math.max(0, balance),
      annualRatePercent,
      days,
      grossInterest: 0,
      tdsRatePercent: 5.0,
      tdsAmount: 0,
      netInterest: 0,
    };
  }

  // Daily product method interest calculation
  const gross = Math.round(((balance * annualRatePercent) / 100) * (days / 365) * 100) / 100;
  // 5% TDS for natural person cooperative members in Nepal
  const tds = Math.round(gross * 0.05 * 100) / 100;
  const net = Math.round((gross - tds) * 100) / 100;

  return {
    balance,
    annualRatePercent,
    days,
    grossInterest: gross,
    tdsRatePercent: 5.0,
    tdsAmount: tds,
    netInterest: net,
  };
}

/**
 * Computes statutory allocations from net surplus as mandated by Nepal Cooperative Act 2074
 */
export function calculateStatutoryProfitAppropriation(
  input: YearEndAppropriationInput
): StatutoryAppropriationResult {
  const { netProfit, fiscalYear, shareCapital, customGeneralReservePercent = 25 } = input;

  if (netProfit <= 0) {
    return {
      fiscalYear,
      netProfit: 0,
      generalReserveFund: 0,
      educationFund: 0,
      communityDevelopmentFund: 0,
      promotionFund: 0,
      employeeWelfareFund: 0,
      totalStatutoryAllocations: 0,
      distributableSurplus: 0,
      maxPermissibleDividendAmount: 0,
      patronageRefundAllocation: 0,
      dividendAllocationPool: 0,
    };
  }

  // 1. General Reserve Fund: Minimum 25% (Non-negotiable legal buffer)
  const reservePercent = Math.max(25, customGeneralReservePercent);
  const generalReserve = Math.round(netProfit * (reservePercent / 100));

  // 2. Cooperative Education Fund: 0.5%
  const education = Math.round(netProfit * 0.005);

  // 3. Community Development Fund: 0.5%
  const community = Math.round(netProfit * 0.005);

  // 4. Cooperative Promotion Fund: 0.5% (Payable to Central/Govt fund)
  const promotion = Math.round(netProfit * 0.005);

  // 5. Employee Welfare / Capacity Fund: 0.5%
  const employeeWelfare = Math.round(netProfit * 0.005);

  const totalStatutory = generalReserve + education + community + promotion + employeeWelfare;
  const distributable = Math.max(0, netProfit - totalStatutory);

  // Maximum 18% Share Dividend cap under Section 44(2) of Cooperative Act 2074
  const maxDividendAmount = Math.round(shareCapital * 0.18);

  // Standard recommended split of remaining surplus:
  // - 60% for Member Dividend (capped at 18% of capital)
  // - 40% for Patronage Refund (संरक्षकत्व फिर्ता कोष - rewarding members who transact more)
  const recommendedDividend = Math.min(distributable * 0.6, maxDividendAmount);
  const recommendedPatronage = Math.round(distributable * 0.4);

  return {
    fiscalYear,
    netProfit,
    generalReserveFund: generalReserve,
    educationFund: education,
    communityDevelopmentFund: community,
    promotionFund: promotion,
    employeeWelfareFund: employeeWelfare,
    totalStatutoryAllocations: totalStatutory,
    distributableSurplus: distributable,
    maxPermissibleDividendAmount: maxDividendAmount,
    patronageRefundAllocation: recommendedPatronage,
    dividendAllocationPool: recommendedDividend,
  };
}

/**
 * Validates trial balance equality (Assets == Liabilities + Equity)
 */
export function validateYearEndTrialBalance(input: TrialBalanceInput): TrialBalanceValidationResult {
  const { totalAssets, totalLiabilities, totalEquityAndReserves } = input;
  const totalCredit = totalLiabilities + totalEquityAndReserves;
  const variance = Math.abs(totalAssets - totalCredit);
  const isBalanced = variance < 0.01;

  return {
    isBalanced,
    totalDebit: totalAssets,
    totalCredit,
    variance,
    notes: isBalanced
      ? 'Trial balance is verified and fully reconciles.'
      : `Trial balance mismatch of NPR ${variance.toLocaleString('ne-NP')}. Assets must equal Liabilities + Equity.`,
  };
}
