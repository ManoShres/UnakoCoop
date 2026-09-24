/**
 * Statutory Loan Loss Provisioning Logic for Nepalese SACCOS
 * Complies with Cooperative Act 2074 & NRB Supervisory Directives
 */

import {
  Loan,
  Member,
  LoanProvisionCategory,
  LoanProvisionRule,
  ClassifiedLoan,
  LoanProvisionSummary,
} from '../types';

export const STATUTORY_PROVISION_RULES: readonly LoanProvisionRule[] = [
  {
    category: 'GOOD',
    nameNepali: 'असल कर्जा (Good / Performing)',
    nameEnglish: 'Good / Performing (0-30 Days)',
    minOverdueDays: 0,
    maxOverdueDays: 30,
    provisionPercent: 1,
    badgeColor: 'emerald',
    isNpl: false,
  },
  {
    category: 'WATCHLIST',
    nameNepali: 'सूक्ष्म निगरानी (Watchlist)',
    nameEnglish: 'Watchlist (31-90 Days)',
    minOverdueDays: 31,
    maxOverdueDays: 90,
    provisionPercent: 5,
    badgeColor: 'amber',
    isNpl: false,
  },
  {
    category: 'SUBSTAND',
    nameNepali: 'कमसल कर्जा (Substandard)',
    nameEnglish: 'Substandard (91-180 Days)',
    minOverdueDays: 91,
    maxOverdueDays: 180,
    provisionPercent: 25,
    badgeColor: 'orange',
    isNpl: true,
  },
  {
    category: 'DOUBTFUL',
    nameNepali: 'शंकास्पद कर्जा (Doubtful)',
    nameEnglish: 'Doubtful (181-365 Days)',
    minOverdueDays: 181,
    maxOverdueDays: 365,
    provisionPercent: 50,
    badgeColor: 'purple',
    isNpl: true,
  },
  {
    category: 'BAD',
    nameNepali: 'खराब कर्जा (Bad / Loss - NPA)',
    nameEnglish: 'Bad / Loss (>365 Days)',
    minOverdueDays: 366,
    maxOverdueDays: null,
    provisionPercent: 100,
    badgeColor: 'red',
    isNpl: true,
  },
] as const;

/**
 * Determine the statutory provisioning category from days past due.
 */
export function determineProvisionCategory(overdueDays: number): LoanProvisionRule {
  const normalizedDays = Math.max(0, overdueDays);
  if (normalizedDays <= 30) return STATUTORY_PROVISION_RULES[0];
  if (normalizedDays <= 90) return STATUTORY_PROVISION_RULES[1];
  if (normalizedDays <= 180) return STATUTORY_PROVISION_RULES[2];
  if (normalizedDays <= 365) return STATUTORY_PROVISION_RULES[3];
  return STATUTORY_PROVISION_RULES[4];
}

/**
 * Classifies an individual loan and calculates required provision in NPR.
 */
export function classifyLoanItem(
  loan: Loan,
  member?: Member,
  simulatedOverdueDays?: number
): ClassifiedLoan {
  // If simulatedOverdueDays is provided, use it; otherwise infer from loan status
  let days = simulatedOverdueDays ?? 0;
  if (simulatedOverdueDays === undefined) {
    if (loan.status === 'OVERDUE') {
      days = 45; // Default overdue demo simulation
    } else if (loan.status === 'ACTIVE') {
      days = 0;
    }
  }

  const rule = determineProvisionCategory(days);
  const provisionAmount = Math.round((loan.remainingBalance * rule.provisionPercent) / 100);

  return {
    loanId: loan.id,
    loanNo: loan.loanNo,
    memberId: loan.memberId,
    memberName: member?.name ?? 'Cooperative Member',
    memberNo: member?.memberNo ?? 'UK-MEMBER',
    loanType: loan.loanType,
    principalAmount: loan.principalAmount,
    remainingBalance: loan.remainingBalance,
    overdueDays: days,
    category: rule.category,
    provisionPercent: rule.provisionPercent,
    requiredProvisionAmount: provisionAmount,
    collateralValue: loan.collateralValue,
    lastPaymentDate: loan.disbursedDate,
  };
}

/**
 * Aggregates classified loans into an executive summary table by category.
 */
export function buildProvisionSummaries(
  classifiedLoans: readonly ClassifiedLoan[]
): LoanProvisionSummary[] {
  return STATUTORY_PROVISION_RULES.map((rule) => {
    const matching = classifiedLoans.filter((l) => l.category === rule.category);
    const totalOutstanding = matching.reduce((sum, l) => sum + l.remainingBalance, 0);
    const provisionAmount = matching.reduce((sum, l) => sum + l.requiredProvisionAmount, 0);

    return {
      category: rule.category,
      nameNepali: rule.nameNepali,
      nameEnglish: rule.nameEnglish,
      loanCount: matching.length,
      totalOutstanding,
      provisionPercent: rule.provisionPercent,
      provisionAmount,
      badgeColor: rule.badgeColor,
      isNpl: rule.isNpl,
    };
  });
}

/**
 * Compute key risk metrics: NPL ratio, provision coverage ratio, and total required reserves.
 */
export function computePortfolioRiskRatios(classifiedLoans: readonly ClassifiedLoan[]) {
  const totalBalance = classifiedLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const totalProvision = classifiedLoans.reduce(
    (sum, l) => sum + l.requiredProvisionAmount,
    0
  );

  const nplLoans = classifiedLoans.filter((l) => {
    const rule = determineProvisionCategory(l.overdueDays);
    return rule.isNpl;
  });

  const nplBalance = nplLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const nplRatioPercent = totalBalance > 0 ? (nplBalance / totalBalance) * 100 : 0;
  const coverageRatioPercent = nplBalance > 0 ? (totalProvision / nplBalance) * 100 : 100;

  return {
    totalLoansCount: classifiedLoans.length,
    totalPortfolioBalance: totalBalance,
    totalRequiredProvision: totalProvision,
    nplLoansCount: nplLoans.length,
    nplBalance,
    nplRatioPercent: Number(nplRatioPercent.toFixed(2)),
    coverageRatioPercent: Number(coverageRatioPercent.toFixed(2)),
  };
}
