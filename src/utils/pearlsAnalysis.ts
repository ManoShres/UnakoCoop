/**
 * PEARLS analysis engine for Nepalese SACCOS cooperatives.
 *
 * PEARLS is the standard microfinance/cooperative supervision framework:
 *   P - Protection (loan loss / write-off provisions)
 *   E - Effective financial structure (asset composition)
 *   A - Asset quality (delinquency, non-earning assets)
 *   R - Rates of return (income vs. cost of funds)
 *   L - Liquidity (reserves vs. short-term obligations)
 *   S - Signs of growth (balance sheet & membership growth)
 *
 * The dashboard here reports the E (asset composition "where the money is")
 * view as a percentage breakdown, plus the A/L supervision metrics.
 */

import type {
  Loan,
  Member,
  SavingsAccount,
  PearlsAnalysis,
  PearlsBreakdownItem,
  PearlsTrendPoint,
  TradingTransaction,
  MotherGroupDeposit,
} from '../types';

export interface PearlsInputs {
  members: Member[];
  savings: SavingsAccount[];
  loans: Loan[];
  tradingTransactions: TradingTransaction[];
  motherGroupDeposits: MotherGroupDeposit[];
  period?: string;
  periodNepali?: string;
}

/** Term-deposit products are reported separately from liquid savings. */
const FIXED_DEPOSIT_TYPES = ['Fixed Deposit (1 Year)'];


/**
 * Splits the cooperative's managed assets into PEARLS "E" categories and
 * reports each as a percentage of total assets.
 */
export function buildPearlsBreakdown(inputs: PearlsInputs): {
  breakdown: PearlsBreakdownItem[];
  totalAssets: number;
} {
  const { members, savings, loans, tradingTransactions, motherGroupDeposits } = inputs;

  const shareCapital = sum(members.map((m) => m.shareCapital));

  const regularSavings = sum(
    savings
      .filter((s) => s.status === 'ACTIVE' && !FIXED_DEPOSIT_TYPES.includes(s.accountType))
      .map((s) => s.balance)
  );

  const fixedDeposits = sum(
    savings
      .filter((s) => FIXED_DEPOSIT_TYPES.includes(s.accountType))
      .map((s) => s.balance)
  );

  const activeLoanPortfolio = sum(
    loans
      .filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')
      .map((l) => l.remainingBalance)
  );

  const tradingPortfolio = sum(
    tradingTransactions.filter((tx) => tx.status === 'COMPLETED').map((tx) => tx.amountInNPR)
  );

  const motherGroupPool = sum(
    motherGroupDeposits.filter((d) => d.status !== 'VOID').map((d) => d.amount)
  );

  const totalAssets = round2(
    shareCapital +
      regularSavings +
      fixedDeposits +
      activeLoanPortfolio +
      tradingPortfolio +
      motherGroupPool
  );

  const rows: Omit<PearlsBreakdownItem, 'percentage'>[] = [
    {
      category: 'Active Loan Portfolio',
      categoryNepali: 'सक्रिय ऋण लगानी',
      amount: round2(activeLoanPortfolio),
      color: '#2563eb',
    },
    {
      category: 'Regular Savings',
      categoryNepali: 'नियमित बचत निक्षेप',
      amount: round2(regularSavings),
      color: '#059669',
    },
    {
      category: 'Fixed Deposits',
      categoryNepali: 'मुद्दती निक्षेप',
      amount: round2(fixedDeposits),
      color: '#7c3aed',
    },
    {
      category: 'Share Capital',
      categoryNepali: 'सेयर पुँजी',
      amount: round2(shareCapital),
      color: '#d97706',
    },
    {
      category: 'Trading & Investments',
      categoryNepali: 'ट्रेडिङ तथा लगानी',
      amount: round2(tradingPortfolio),
      color: '#0891b2',
    },
    {
      category: 'Mother Group Collections',
      categoryNepali: 'आमा समूह संकलन',
      amount: round2(motherGroupPool),
      color: '#db2777',
    },
  ];

  return {
    totalAssets,
    breakdown: rows.map((row) => ({
      ...row,
      percentage: percentage(row.amount, totalAssets),
    })),
  };
}

/**
 * Supervision (PEARLS "A" & "L") metrics for the loan book.
 */
export function buildPearlsRiskMetrics(loans: Loan[]) {
  const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const overdueLoans = loans.filter((l) => l.status === 'OVERDUE');

  const totalOutstanding = sum(activeLoans.map((l) => l.remainingBalance));
  const portfolioAtRisk = sum(overdueLoans.map((l) => l.remainingBalance));
  const totalDisbursed = sum(activeLoans.map((l) => l.principalAmount));
  const totalRepaid = sum(
    activeLoans.map((l) => Math.max(l.principalAmount - l.remainingBalance, 0))
  );

  return {
    portfolioAtRisk: round2(portfolioAtRisk),
    portfolioAtRiskPercent: percentage(portfolioAtRisk, totalOutstanding),
    repaymentRate: percentage(totalRepaid, totalDisbursed),
    averageLoanSize: activeLoans.length === 0 ? 0 : round2(totalOutstanding / activeLoans.length),
    totalActiveLoans: activeLoans.length,
    totalDelinquentLoans: overdueLoans.length,
  };
}

/**
 * Builds a rolling monthly trend of savings / loans / shares / mother group
 * collections. Balances are point-in-time, so savings and mother group
 * collections are stepped back month-by-month using their recorded dates.
 */
export function buildAssetTrends(inputs: PearlsInputs, months = 6): PearlsTrendPoint[] {
  const { members, savings, loans, motherGroupDeposits } = inputs;

  const loanTotal = sum(
    loans
      .filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')
      .map((l) => l.remainingBalance)
  );
  const shareTotal = sum(members.map((m) => m.shareCapital));

  const references: { label: string; labelNepali: string; key: string }[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  for (let index = months - 1; index >= 0; index -= 1) {
    const point = new Date(cursor.getFullYear(), cursor.getMonth() - index, 1);
    const label = point.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    references.push({
      label,
      labelNepali: label,
      key: `${point.getFullYear()}-${String(point.getMonth() + 1).padStart(2, '0')}`,
    });
  }

  return references.map((reference) => {
    const savingsAtMonth = sum(
      savings
        .filter((s) => s.openedDate.slice(0, 7) <= reference.key)
        .map((s) => s.balance)
    );
    const depositsAtMonth = sum(
      motherGroupDeposits
        .filter((d) => d.status !== 'VOID' && d.depositDate.slice(0, 7) <= reference.key)
        .map((d) => d.amount)
    );

    return {
      label: reference.label,
      labelNepali: reference.labelNepali,
      savings: round2(savingsAtMonth),
      loans: round2(loanTotal),
      shares: round2(shareTotal),
      deposits: round2(depositsAtMonth),
      total: round2(savingsAtMonth + loanTotal + shareTotal + depositsAtMonth),
    };
  });
}

/**
 * Full PEARLS report: asset composition + risk metrics + trend series.
 */
export function calculatePearlsAnalysis(inputs: PearlsInputs): PearlsAnalysis {
  const { breakdown, totalAssets } = buildPearlsBreakdown(inputs);
  const riskMetrics = buildPearlsRiskMetrics(inputs.loans);

  return {
    period: inputs.period ?? 'Current Period',
    periodNepali: inputs.periodNepali,
    totalAssets,
    breakdown,
    riskMetrics: {
      ...riskMetrics,
      savingsToLoanRatio: percentage(
        sum(
          inputs.savings
            .filter((s) => s.status === 'ACTIVE')
            .map((s) => s.balance)
        ),
        sum(
          inputs.loans
            .filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')
            .map((l) => l.remainingBalance)
        )
      ),
    },
    trends: buildAssetTrends(inputs),
    generatedAt: new Date().toISOString(),
  };
}

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);

const round2 = (value: number): number => Math.round(value * 100) / 100;

export const percentage = (part: number, whole: number): number =>
  whole === 0 ? 0 : round2((part / whole) * 100);
