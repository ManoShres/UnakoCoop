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

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const BS_EPOCH_AD_UTC = Date.UTC(2024, 3, 13); // BS 2081-01-01 = AD 2024-04-13
const BS_EPOCH_YEAR = 2081;
// Month lengths of BS 2081 (Baisakh..Chaitra). BS leap years carry 366 days.
const BS_MONTH_DAYS: readonly number[] = [31, 31, 32, 31, 31, 31, 30, 30, 30, 30, 29, 30];

/**
 * Convert a Bikram Sambat 'YYYY-MM-DD' date to an approximate Gregorian UTC timestamp.
 *
 * NEEDS SIGN-OFF: precise statutory classification requires a licensed BS calendar
 * table. This implementation anchors on BS 2081-01-01 = AD 2024-04-13 and uses BS 2081
 * month lengths plus a fixed 365-day year, so it can drift by ~1 day per BS leap year
 * (≈±5 days across 2080–2090). Provisioning bucket edges (30/90/180/365 days) can
 * therefore shift by a few days near a boundary. Replace with the server calendar
 * before using this as the authoritative regulatory classification.
 */
export function bsDateToUtcMs(bsDate: string): number | null {
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec((bsDate || '').trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 32) return null;

  let days = 0;
  if (year >= BS_EPOCH_YEAR) {
    days += (year - BS_EPOCH_YEAR) * 365;
  } else {
    days -= (BS_EPOCH_YEAR - year) * 365;
  }
  for (let i = 0; i < month - 1; i += 1) days += BS_MONTH_DAYS[i];
  days += day - 1;

  return BS_EPOCH_AD_UTC + days * MS_PER_DAY;
}

/** Parse an explicit calendar date. Years >= 2070 are treated as Bikram Sambat. */
function toUtcMs(dateString: string | undefined): number | null {
  if (!dateString) return null;
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(dateString.trim());
  if (!match) return null;
  const year = Number(match[1]);
  if (year >= 2070) return bsDateToUtcMs(dateString);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return Date.UTC(year, month - 1, day);
}

/**
 * Real elapsed days past `nextDueDate` as of `asOfDate` (defaults to today).
 * Returns null when the due date cannot be interpreted.
 */
export function computeOverdueDays(
  nextDueDate: string | undefined,
  asOfDate?: string
): number | null {
  const dueMs = toUtcMs(nextDueDate);
  if (dueMs === null) return null;
  let asOfMs: number;
  if (asOfDate) {
    const parsed = toUtcMs(asOfDate);
    if (parsed === null) return null;
    asOfMs = parsed;
  } else {
    const now = new Date();
    asOfMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  }
  return Math.max(0, Math.floor((asOfMs - dueMs) / MS_PER_DAY));
}

/**
 * Classifies an individual loan and calculates required provision in NPR.
 *
 * `simulatedOverdueDays` (when explicitly supplied) always wins. Otherwise the real
 * days past due are computed from `nextDueDate`/`asOfDate`; a regulatory category is
 * NEVER defaulted. An OVERDUE loan without an interpretable due date is a hard error
 * rather than silently being provisioned at an arbitrary tier.
 */
export function classifyLoanItem(
  loan: Loan,
  member?: Member,
  simulatedOverdueDays?: number,
  asOfDate?: string
): ClassifiedLoan {
  let days: number;
  if (simulatedOverdueDays !== undefined) {
    days = Math.max(0, simulatedOverdueDays);
  } else if (loan.status === 'OVERDUE') {
    const computed = computeOverdueDays(loan.nextDueDate, asOfDate);
    if (computed === null) {
      throw new Error(
        `Cannot classify overdue loan ${loan.loanNo}: nextDueDate "${loan.nextDueDate}" is missing or not a valid date.`
      );
    }
    days = computed;
  } else {
    days = 0;
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
  // Coverage ratio numerator must be NPL provisions only — using the whole portfolio's
  // provisions overstated coverage.
  const nplProvision = nplLoans.reduce((sum, l) => sum + l.requiredProvisionAmount, 0);
  const coverageRatioPercent = nplBalance > 0 ? (nplProvision / nplBalance) * 100 : 100;

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
