/**
 * Dynamic report generation for the Audit & Transparency module.
 *
 * Every report is computed from live cooperative data (members, savings,
 * loans, mother group collections, trading ledger and reconciliation state)
 * instead of static demo rows.
 */

import type {
  BankStatementEntry,
  GeneratedReport,
  Loan,
  Member,
  MotherGroup,
  MotherGroupDeposit,
  MotherGroupMeeting,
  MotherGroupMember,
  ReconciliationEntry,
  SavingsAccount,
  TradingTransaction,
  Transaction,
} from '../types';
import { calculateTradingPL } from '../utils/tradingPL';
import { calculatePearlsAnalysis } from '../utils/pearlsAnalysis';
import { countOpenMismatches } from '../utils/reconciliation';

export interface ReportInputs {
  members: Member[];
  savings: SavingsAccount[];
  loans: Loan[];
  transactions: Transaction[];
  motherGroups: MotherGroup[];
  motherGroupMembers: MotherGroupMember[];
  motherGroupMeetings: MotherGroupMeeting[];
  motherGroupDeposits: MotherGroupDeposit[];
  tradingTransactions: TradingTransaction[];
  bankStatements: BankStatementEntry[];
  reconciliationEntries: ReconciliationEntry[];
  fiscalYear: string;
  period: string;
  generatedBy: string;
  generatedByName?: string;
}

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);
const round2 = (value: number): number => Math.round(value * 100) / 100;

/** 1. Financial summary: assets, deposits and surplus for the period. */
export function buildFinancialSummaryReport(inputs: ReportInputs): Record<string, unknown> {
  const { members, savings, loans, transactions } = inputs;

  const shareCapital = sum(members.map((m) => m.shareCapital));
  const totalSavings = sum(savings.map((s) => s.balance));
  const loanOutstanding = sum(
    loans
      .filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')
      .map((l) => l.remainingBalance)
  );

  const deposits = sum(transactions.filter((t) => t.type === 'DEPOSIT').map((t) => t.amount));
  const withdrawals = sum(
    transactions.filter((t) => t.type === 'WITHDRAWAL').map((t) => t.amount)
  );
  const emiCollected = sum(transactions.filter((t) => t.type === 'LOAN_EMI').map((t) => t.amount));
  const sharePurchases = sum(
    transactions.filter((t) => t.type === 'SHARE_PURCHASE').map((t) => t.amount)
  );

  return {
    totalAssets: round2(totalSavings + loanOutstanding + shareCapital),
    totalSavings: round2(totalSavings),
    totalShareCapital: round2(shareCapital),
    loanOutstanding: round2(loanOutstanding),
    totalDeposits: round2(deposits),
    totalWithdrawals: round2(withdrawals),
    loanEmiCollected: round2(emiCollected),
    sharePurchases: round2(sharePurchases),
    netSurplus: round2(deposits + emiCollected + sharePurchases - withdrawals),
    memberCount: members.length,
    transactionCount: transactions.length,
  };
}

/** 2. Portfolio at Risk (PAR) & delinquency report. */
export function buildPortfolioAtRiskReport(inputs: ReportInputs): Record<string, unknown> {
  const { loans } = inputs;
  const active = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const overdue = loans.filter((l) => l.status === 'OVERDUE');

  const outstanding = sum(active.map((l) => l.remainingBalance));
  const atRisk = sum(overdue.map((l) => l.remainingBalance));
  const disbursed = sum(active.map((l) => l.principalAmount));
  const repaid = sum(active.map((l) => Math.max(l.principalAmount - l.remainingBalance, 0)));

  return {
    grossLoanPortfolio: round2(outstanding),
    totalDisbursed: round2(disbursed),
    totalRepaid: round2(repaid),
    portfolioAtRisk: round2(atRisk),
    portfolioAtRiskPercent: outstanding === 0 ? 0 : round2((atRisk / outstanding) * 100),
    repaymentRate: disbursed === 0 ? 0 : round2((repaid / disbursed) * 100),
    activeLoanCount: active.length,
    delinquentLoanCount: overdue.length,
    averageLoanSize: active.length === 0 ? 0 : round2(outstanding / active.length),
    delinquentLoanNumbers: overdue.map((l) => l.loanNo),
  };
}

/** 3. Savings growth & member activity report. */
export function buildSavingsGrowthReport(inputs: ReportInputs): Record<string, unknown> {
  const { members, savings, transactions } = inputs;

  const byType = new Map<string, { count: number; balance: number }>();
  savings.forEach((account) => {
    const bucket = byType.get(account.accountType) ?? { count: 0, balance: 0 };
    bucket.count += 1;
    bucket.balance += account.balance;
    byType.set(account.accountType, bucket);
  });

  const activeMembers = members.filter((m) => m.status === 'VERIFIED').length;
  const pendingMembers = members.filter(
    (m) => m.status === 'PENDING' || m.status === 'ACTION_REQUIRED'
  ).length;

  const monthlyDeposits = new Map<string, number>();
  transactions
    .filter((t) => t.type === 'DEPOSIT')
    .forEach((tx) => {
      const month = tx.date.slice(0, 7);
      monthlyDeposits.set(month, (monthlyDeposits.get(month) ?? 0) + tx.amount);
    });

  const totalBalance = sum(savings.map((s) => s.balance));

  return {
    totalAccounts: savings.length,
    totalSavingsBalance: round2(totalBalance),
    averageBalance: savings.length === 0 ? 0 : round2(totalBalance / savings.length),
    activeMembers,
    pendingMembers,
    inactiveMembers: members.length - activeMembers - pendingMembers,
    accountTypeBreakdown: Array.from(byType.entries()).map(([accountType, bucket]) => ({
      accountType,
      accountCount: bucket.count,
      balance: round2(bucket.balance),
    })),
    monthlyDepositTrend: Array.from(monthlyDeposits.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month, amount: round2(amount) })),
  };
}

/** 4. Mother group collection & field performance report. */
export function buildMotherGroupReport(inputs: ReportInputs): Record<string, unknown> {
  const { motherGroups, motherGroupMembers, motherGroupMeetings, motherGroupDeposits } = inputs;

  const activeGroups = motherGroups.filter((group) => group.isActive);
  const validDeposits = motherGroupDeposits.filter((d) => d.status !== 'VOID');
  const completedMeetings = motherGroupMeetings.filter((m) => m.status === 'COMPLETED');

  const targetTotal = sum(activeGroups.map((group) => group.monthlyTargetAmount));
  const collectedTotal = sum(validDeposits.map((d) => d.amount));

  const perGroup = activeGroups.map((group) => {
    const groupDeposits = validDeposits.filter((d) => d.motherGroupId === group.id);
    const collected = sum(groupDeposits.map((d) => d.amount));
    const meetings = completedMeetings.filter((m) => m.motherGroupId === group.id);
    return {
      groupId: group.id,
      groupName: group.name,
      location: group.location,
      memberCount: motherGroupMembers.filter((m) => m.motherGroupId === group.id).length,
      meetingsHeld: meetings.length,
      collected: round2(collected),
      monthlyTarget: group.monthlyTargetAmount,
      achievementPercent:
        group.monthlyTargetAmount === 0
          ? 0
          : round2((collected / group.monthlyTargetAmount) * 100),
      pendingDeposits: groupDeposits.filter((d) => d.status === 'PENDING').length,
    };
  });

  return {
    totalGroups: motherGroups.length,
    activeGroups: activeGroups.length,
    totalGroupMembers: motherGroupMembers.length,
    meetingsHeld: completedMeetings.length,
    totalCollected: round2(collectedTotal),
    totalMonthlyTarget: round2(targetTotal),
    collectionEfficiency: targetTotal === 0 ? 0 : round2((collectedTotal / targetTotal) * 100),
    pendingDepositCount: motherGroupDeposits.filter((d) => d.status === 'PENDING').length,
    groupPerformance: perGroup,
  };
}

/** 5. Trading Profit & Loss statement for the period. */
export function buildTradingPLReport(inputs: ReportInputs): Record<string, unknown> {
  const summary = calculateTradingPL(inputs.tradingTransactions);

  return {
    totalIncome: summary.totalIncome,
    totalCost: summary.totalCost,
    totalPurchases: summary.totalPurchases,
    totalSales: summary.totalSales,
    netPL: summary.netPL,
    plPercent: summary.plPercent,
    transactionCount: summary.transactionCount,
    categoryBreakdown: summary.breakdown,
  };
}

/** 6. PEARLS asset composition & supervision metrics. */
export function buildPearlsReport(inputs: ReportInputs): Record<string, unknown> {
  const analysis = calculatePearlsAnalysis({
    members: inputs.members,
    savings: inputs.savings,
    loans: inputs.loans,
    tradingTransactions: inputs.tradingTransactions,
    motherGroupDeposits: inputs.motherGroupDeposits,
    period: inputs.period,
  });

  return {
    totalAssets: analysis.totalAssets,
    breakdown: analysis.breakdown,
    riskMetrics: analysis.riskMetrics,
    trends: analysis.trends,
  };
}

/** 7. Bank reconciliation & entry mismatch compliance report. */
export function buildReconciliationReport(inputs: ReportInputs): Record<string, unknown> {
  const { reconciliationEntries, bankStatements } = inputs;

  const matched = reconciliationEntries.filter((r) => r.status === 'MATCHED');
  const resolved = reconciliationEntries.filter((r) => r.status === 'RESOLVED');
  const mismatched = reconciliationEntries.filter((r) => r.status === 'MISMATCH');
  const pending = reconciliationEntries.filter((r) => r.status === 'PENDING');

  const byType = new Map<string, number>();
  mismatched.forEach((entry) => {
    const key = entry.mismatchType ?? 'UNCLASSIFIED';
    byType.set(key, (byType.get(key) ?? 0) + 1);
  });

  const total = reconciliationEntries.length;

  return {
    statementCount: bankStatements.length,
    totalEntries: total,
    matchedCount: matched.length,
    resolvedCount: resolved.length,
    mismatchCount: mismatched.length,
    pendingCount: pending.length,
    openMismatches: countOpenMismatches(reconciliationEntries),
    reconciliationRate:
      total === 0 ? 0 : round2(((matched.length + resolved.length) / total) * 100),
    unmatchedAmount: round2(sum(mismatched.map((entry) => entry.amount))),
    mismatchTypeBreakdown: Array.from(byType.entries()).map(([mismatchType, count]) => ({
      mismatchType,
      count,
    })),
  };
}

/**
 * Generates the full report registry for a period from live cooperative data.
 */
export function generateReportsForPeriod(inputs: ReportInputs): GeneratedReport[] {
  const yearKey = inputs.fiscalYear.replace(/[^0-9]/g, '');
  const base = {
    fiscalYear: inputs.fiscalYear,
    period: inputs.period,
    generatedAt: new Date().toISOString(),
    generatedBy: inputs.generatedBy,
    generatedByName: inputs.generatedByName,
    status: 'READY' as const,
  };

  return [
    {
      ...base,
      id: `rep-fin-${yearKey}`,
      title: `Financial Summary Statement ${inputs.period}`,
      titleNepali: `वित्तीय सारांश विवरण - ${inputs.period}`,
      category: 'FINANCIAL',
      data: buildFinancialSummaryReport(inputs),
    },
    {
      ...base,
      id: `rep-par-${yearKey}`,
      title: `Portfolio at Risk & Delinquency Report ${inputs.period}`,
      titleNepali: `जोखिममा रहेको साख तथा असुली प्रतिवेदन - ${inputs.period}`,
      category: 'SUPERVISORY',
      data: buildPortfolioAtRiskReport(inputs),
    },
    {
      ...base,
      id: `rep-sav-${yearKey}`,
      title: `Savings Growth & Member Activity ${inputs.period}`,
      titleNepali: `बचत वृद्धि तथा सदस्य सक्रियता - ${inputs.period}`,
      category: 'FINANCIAL',
      data: buildSavingsGrowthReport(inputs),
    },
    {
      ...base,
      id: `rep-mg-${yearKey}`,
      title: `Mother Group Collection & Field Operations ${inputs.period}`,
      titleNepali: `आमा समूह संकलन तथा क्षेत्र सञ्चालन - ${inputs.period}`,
      category: 'OPERATIONAL',
      data: buildMotherGroupReport(inputs),
    },
    {
      ...base,
      id: `rep-trd-${yearKey}`,
      title: `Trading Profit & Loss Statement ${inputs.period}`,
      titleNepali: `ट्रेडिङ नाफा नोक्सान विवरण - ${inputs.period}`,
      category: 'FINANCIAL',
      data: buildTradingPLReport(inputs),
    },
    {
      ...base,
      id: `rep-pearls-${yearKey}`,
      title: `PEARLS Asset Composition Analysis ${inputs.period}`,
      titleNepali: `पर्ल्स सम्पत्ति विश्लेषण - ${inputs.period}`,
      category: 'SUPERVISORY',
      data: buildPearlsReport(inputs),
    },
    {
      ...base,
      id: `rep-recon-${yearKey}`,
      title: `Bank Reconciliation & Entry Mismatch Report ${inputs.period}`,
      titleNepali: `बैंक मिलान तथा प्रविष्टि भिन्नता प्रतिवेदन - ${inputs.period}`,
      category: 'REGULATORY',
      data: buildReconciliationReport(inputs),
    },
  ];
}

import { formatNPR } from '../utils/nepaliDate';

const npr = (value: number | undefined, nepali?: boolean): string => {
  if (nepali) {
    return formatNPR(value ?? 0, true);
  }
  return `NPR ${Math.round(value ?? 0).toLocaleString('en-IN')}`;
};

const pct = (value: number | undefined): string => `${(value ?? 0).toFixed(2)}%`;

/** Human readable one-line summary shown on each report card. */

export function summariseReport(report: GeneratedReport, lang: 'ne' | 'en' = 'en'): string {
  const data = report.data as Record<string, number | undefined>;
  const nepali = lang === 'ne';

  switch (report.category) {
    case 'FINANCIAL':
      if (data.netPL !== undefined) {
        return nepali
          ? `शुद्ध नाफा ${npr(data.netPL, true)} (${pct(data.plPercent)})`
          : `Net P/L ${npr(data.netPL, false)} at ${pct(data.plPercent)}`;
      }
      if (data.totalSavingsBalance !== undefined) {
        return nepali
          ? `कुल बचत ${npr(data.totalSavingsBalance, true)} · ${data.totalAccounts ?? 0} खाता`
          : `Savings ${npr(data.totalSavingsBalance, false)} across ${data.totalAccounts ?? 0} accounts`;
      }
      return nepali
        ? `कुल सम्पत्ति ${npr(data.totalAssets, true)} · ${data.memberCount ?? 0} सदस्य`
        : `Assets ${npr(data.totalAssets, false)} · ${data.memberCount ?? 0} members`;
    case 'SUPERVISORY':
      if (data.portfolioAtRiskPercent !== undefined) {
        return nepali
          ? `जोखिममा साख ${pct(data.portfolioAtRiskPercent)} · असुली दर ${pct(data.repaymentRate)}`
          : `PAR ${pct(data.portfolioAtRiskPercent)} · repayment ${pct(data.repaymentRate)}`;
      }
      return nepali
        ? `कुल सम्पत्ति ${npr(data.totalAssets, true)} को विश्लेषण`
        : `Composition of ${npr(data.totalAssets, false)}`;
    case 'OPERATIONAL':
      return nepali
        ? `${data.activeGroups ?? 0} सक्रिय समूह · संकलन ${npr(data.totalCollected, true)}`
        : `${data.activeGroups ?? 0} active groups · collected ${npr(data.totalCollected, false)}`;
    case 'REGULATORY':
      return nepali
        ? `मिलान दर ${pct(data.reconciliationRate)} · ${data.openMismatches ?? 0} खुला भिन्नता`
        : `Match rate ${pct(data.reconciliationRate)} · ${data.openMismatches ?? 0} open mismatches`;
    default:
      return nepali ? 'प्रतिवेदन तयार छ' : 'Report ready';
  }
}

/** Exports any generated report as a flat CSV for audit filing. */
export function generateReportCsv(report: GeneratedReport): string {
  const data = report.data as Record<string, unknown>;
  const rows: string[] = [
    `"Report ID","${report.id}"`,
    `"Title","${report.title}"`,
    `"Category","${report.category}"`,
    `"Fiscal Year","${report.fiscalYear}"`,
    `"Period","${report.period}"`,
    `"Generated At","${report.generatedAt}"`,
    `"Generated By","${report.generatedByName ?? report.generatedBy}"`,
    '',
  ];

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      rows.push(`"${key}"`);
      value.forEach((item) => {
        if (item && typeof item === 'object') {
          const entries = Object.entries(item as Record<string, unknown>);
          rows.push(`"${entries.map(([k, v]) => `${k}=${String(v)}`).join(' | ')}"`);
        }
      });
    } else {
      rows.push(`"${key}","${String(value)}"`);
    }
  });

  return rows.join('\n');
}
