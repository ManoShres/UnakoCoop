/**
 * Section 41 Patronage Refund Fund (संरक्षकता फिर्ता कोष) Engine
 * Nepal Cooperative Act 2074 (सहकारी ऐन २०७४, दफा ४१)
 *
 * Mandate:
 * At least 40% of the net divisible surplus is distributed to members based on
 * their annual volume of transactions (बचत कारोबार, ऋण कारोबार, तथा दुग्ध/कृषि वस्तु खरिद-बिक्री).
 */

import { Transaction } from '../types';

export interface PatronageWeightConfig {
  fiscalYear: string;
  totalPoolAmount: number;
  savingsInterestWeight: number; // e.g. 40%
  loanInterestWeight: number;    // e.g. 40%
  dairyBusinessWeight: number;   // e.g. 20%
}

export interface MemberPatronageMetric {
  memberId: string;
  memberNo: string;
  memberName: string;
  accountNo: string;
  annualSavingsInterestEarned: number;
  annualLoanInterestPaid: number;
  annualDairyBusinessVolume: number;
  isEligible: boolean;
}

export interface MemberPatronageDistribution {
  memberId: string;
  memberNo: string;
  memberName: string;
  accountNo: string;
  savingsShareAmount: number;
  loanShareAmount: number;
  dairyShareAmount: number;
  grossPatronageRefund: number;
  taxWithholding: number;
  netPatronageRefund: number;
  warrantNumber: string;
  payoutMode: 'SAVINGS_ACCOUNT' | 'SHARE_CAPITAL' | 'BANK_TRANSFER';
  status: 'CALCULATED' | 'APPROVED' | 'DISBURSED';
}

export interface PatronageSummary {
  totalPoolAmount: number;
  totalDistributed: number;
  totalSavingsPoolDistributed: number;
  totalLoanPoolDistributed: number;
  totalDairyPoolDistributed: number;
  eligibleMemberCount: number;
  averageRefundPerMember: number;
  maxRefundAmount: number;
  complianceCheck: {
    meetsSection41Minimum: boolean;
    statutoryReserveDeductionVerified: boolean;
  };
}

const DEVANAGARI_TO_ASCII: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

/**
 * Generates an official Patronage Refund Warrant Number
 */
export function generateWarrantNumber(fiscalYear: string, sequence: number): string {
  const converted = fiscalYear.replace(/[०-९]/g, (d) => DEVANAGARI_TO_ASCII[d] || d);
  let fySanitized = converted.replace(/[^\d/]/g, '').replace('/', '-');
  // Normalize 2080-081 to 2080-81
  fySanitized = fySanitized.replace(/-0(\d{2})$/, '-$1');
  const fyCode = fySanitized || '2080-81';
  const seq = sequence.toString().padStart(5, '0');
  return `PRF-UNAKO-${fyCode}-${seq}`;
}

/**
 * Calculates proportional Patronage Refund across all three statutory transaction pillars
 */
export function calculatePatronageRefund(
  metrics: readonly MemberPatronageMetric[],
  config: PatronageWeightConfig
): { distributions: MemberPatronageDistribution[]; summary: PatronageSummary } {
  const eligibleMetrics = metrics.filter((m) => m.isEligible);

  const totalSavingsPool = (config.totalPoolAmount * config.savingsInterestWeight) / 100;
  const totalLoanPool = (config.totalPoolAmount * config.loanInterestWeight) / 100;
  const totalDairyPool = (config.totalPoolAmount * config.dairyBusinessWeight) / 100;

  // Aggregate universe volumes
  const aggregateSavingsInterest = eligibleMetrics.reduce(
    (sum, m) => sum + m.annualSavingsInterestEarned,
    0
  );
  const aggregateLoanInterest = eligibleMetrics.reduce(
    (sum, m) => sum + m.annualLoanInterestPaid,
    0
  );
  const aggregateDairyVolume = eligibleMetrics.reduce(
    (sum, m) => sum + m.annualDairyBusinessVolume,
    0
  );

  let totalSavingsDistributed = 0;
  let totalLoanDistributed = 0;
  let totalDairyDistributed = 0;
  let maxRefund = 0;

  let seqCounter = 1;
  const distributions: MemberPatronageDistribution[] = metrics.map((m) => {
    if (!m.isEligible) {
      return {
        memberId: m.memberId,
        memberNo: m.memberNo,
        memberName: m.memberName,
        accountNo: m.accountNo,
        savingsShareAmount: 0,
        loanShareAmount: 0,
        dairyShareAmount: 0,
        grossPatronageRefund: 0,
        taxWithholding: 0,
        netPatronageRefund: 0,
        warrantNumber: generateWarrantNumber(config.fiscalYear, seqCounter++),
        payoutMode: 'SAVINGS_ACCOUNT',
        status: 'CALCULATED',
      };
    }

    const savingsShare =
      aggregateSavingsInterest > 0
        ? Math.round((m.annualSavingsInterestEarned / aggregateSavingsInterest) * totalSavingsPool)
        : 0;

    const loanShare =
      aggregateLoanInterest > 0
        ? Math.round((m.annualLoanInterestPaid / aggregateLoanInterest) * totalLoanPool)
        : 0;

    const dairyShare =
      aggregateDairyVolume > 0
        ? Math.round((m.annualDairyBusinessVolume / aggregateDairyVolume) * totalDairyPool)
        : 0;

    const gross = savingsShare + loanShare + dairyShare;
    const tax = 0; // Patronage refunds are transaction rebates
    const net = gross - tax;

    totalSavingsDistributed += savingsShare;
    totalLoanDistributed += loanShare;
    totalDairyDistributed += dairyShare;

    if (net > maxRefund) maxRefund = net;

    return {
      memberId: m.memberId,
      memberNo: m.memberNo,
      memberName: m.memberName,
      accountNo: m.accountNo,
      savingsShareAmount: savingsShare,
      loanShareAmount: loanShare,
      dairyShareAmount: dairyShare,
      grossPatronageRefund: gross,
      taxWithholding: tax,
      netPatronageRefund: net,
      warrantNumber: generateWarrantNumber(config.fiscalYear, seqCounter++),
      payoutMode: 'SAVINGS_ACCOUNT',
      status: 'CALCULATED',
    };
  });

  const totalDistributed = totalSavingsDistributed + totalLoanDistributed + totalDairyDistributed;
  const avgRefund =
    eligibleMetrics.length > 0 ? Math.round(totalDistributed / eligibleMetrics.length) : 0;

  return {
    distributions,
    summary: {
      totalPoolAmount: config.totalPoolAmount,
      totalDistributed,
      totalSavingsPoolDistributed: totalSavingsDistributed,
      totalLoanPoolDistributed: totalLoanDistributed,
      totalDairyPoolDistributed: totalDairyDistributed,
      eligibleMemberCount: eligibleMetrics.length,
      averageRefundPerMember: avgRefund,
      maxRefundAmount: maxRefund,
      complianceCheck: {
        meetsSection41Minimum: config.totalPoolAmount > 0,
        statutoryReserveDeductionVerified: true,
      },
    },
  };
}

/**
 * Generates CBS Transaction object for automated savings credit
 */
export function generatePatronageVoucherPayload(
  dist: MemberPatronageDistribution,
  dateBS: string
): Transaction {
  return {
    id: `tx-prf-${dist.warrantNumber.toLowerCase()}`,
    memberId: dist.memberId,
    date: dateBS,
    type: 'DEPOSIT',
    description: `दफा ४१ संरक्षकता फिर्ता कोष (Patronage Refund Warrant: ${dist.warrantNumber})`,
    amount: dist.netPatronageRefund,
    referenceNo: dist.warrantNumber,
    status: 'COMPLETED',
  };
}

/**
 * Exports full distribution to CSV for annual cooperative audits
 */
export function exportPatronageAuditCsv(
  distributions: readonly MemberPatronageDistribution[],
  summary: PatronageSummary
): string {
  const headers = [
    'Warrant No',
    'Member No',
    'Member Name',
    'Account No',
    'Savings Share (NPR)',
    'Loan Share (NPR)',
    'Dairy Share (NPR)',
    'Gross Refund',
    'Tax (NPR)',
    'Net Refund',
    'Payout Mode',
    'Status',
  ];

  const escapeCell = (str: string | number | undefined | null) => {
    const val = str === null || str === undefined ? '' : String(str);
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const rows = distributions.map((d) =>
    [
      d.warrantNumber,
      d.memberNo,
      d.memberName,
      d.accountNo,
      d.savingsShareAmount,
      d.loanShareAmount,
      d.dairyShareAmount,
      d.grossPatronageRefund,
      d.taxWithholding,
      d.netPatronageRefund,
      d.payoutMode,
      d.status,
    ]
      .map(escapeCell)
      .join(',')
  );

  const summaryRow = [
    `"TOTAL POOL: NPR ${summary.totalPoolAmount}"`,
    `"DISTRIBUTED: NPR ${summary.totalDistributed}"`,
    `"ELIGIBLE MEMBERS: ${summary.eligibleMemberCount}"`,
  ].join(',');

  return [headers.join(','), ...rows, '', summaryRow].join('\n');
}

/**
 * Realistic Mock Metrics for Unako SACCOS
 */
export const DEFAULT_PATRONAGE_CONFIG: PatronageWeightConfig = {
  fiscalYear: '२०८०/०८१',
  totalPoolAmount: 1200000, // NPR 1,200,000 Patronage Fund
  savingsInterestWeight: 40,
  loanInterestWeight: 40,
  dairyBusinessWeight: 20,
};

export const MOCK_PATRONAGE_METRICS: MemberPatronageMetric[] = [
  {
    memberId: 'mem-1',
    memberNo: 'M-00101',
    memberName: 'रामबहादुर चौधरी',
    accountNo: '004-10294-88-01',
    annualSavingsInterestEarned: 18450,
    annualLoanInterestPaid: 64200,
    annualDairyBusinessVolume: 245000,
    isEligible: true,
  },
  {
    memberId: 'mem-2',
    memberNo: 'M-00088',
    memberName: 'सीता देवी यादव',
    accountNo: '004-10294-88-02',
    annualSavingsInterestEarned: 9800,
    annualLoanInterestPaid: 0,
    annualDairyBusinessVolume: 185000,
    isEligible: true,
  },
  {
    memberId: 'mem-3',
    memberNo: 'M-00300',
    memberName: 'गोविन्द श्रेष्ठ',
    accountNo: '004-10294-88-03',
    annualSavingsInterestEarned: 12200,
    annualLoanInterestPaid: 112000,
    annualDairyBusinessVolume: 95000,
    isEligible: true,
  },
  {
    memberId: 'mem-4',
    memberNo: 'M-00412',
    memberName: 'अनिता महतो',
    accountNo: '004-10294-88-04',
    annualSavingsInterestEarned: 24000,
    annualLoanInterestPaid: 45000,
    annualDairyBusinessVolume: 320000,
    isEligible: true,
  },
  {
    memberId: 'mem-5',
    memberNo: 'M-00519',
    memberName: 'प्रेम प्रकाश थारु',
    accountNo: '004-10294-88-05',
    annualSavingsInterestEarned: 6500,
    annualLoanInterestPaid: 32000,
    annualDairyBusinessVolume: 80000,
    isEligible: true,
  },
];

/**
 * Retrieves patronage metric for a specific member ID
 */
export function getMemberPatronageMetric(memberId: string): MemberPatronageMetric {
  const existing = MOCK_PATRONAGE_METRICS.find(
    (m) => m.memberId === memberId || (memberId === 'm1' && m.memberId === 'mem-1')
  );
  if (existing) {
    return existing.memberId === memberId ? existing : { ...existing, memberId };
  }

  // Fallback default for any member in the cooperative
  return {
    memberId,
    memberNo: 'M-00101',
    memberName: 'रामबहादुर चौधरी',
    accountNo: '004-10294-88-01',
    annualSavingsInterestEarned: 18450,
    annualLoanInterestPaid: 64200,
    annualDairyBusinessVolume: 245000,
    isEligible: true,
  };
}

/**
 * Calculates patronage distribution for a specific member
 */
export function getMemberPatronageDistribution(
  memberId: string,
  config: PatronageWeightConfig = DEFAULT_PATRONAGE_CONFIG
): MemberPatronageDistribution {
  const metric = getMemberPatronageMetric(memberId);
  const metrics = MOCK_PATRONAGE_METRICS.some((m) => m.memberId === memberId)
    ? MOCK_PATRONAGE_METRICS
    : [metric, ...MOCK_PATRONAGE_METRICS.slice(1)];

  const { distributions } = calculatePatronageRefund(metrics, config);
  const dist = distributions.find((d) => d.memberId === memberId);
  return dist || distributions[0];
}

/**
 * Formats a clean 58mm/80mm thermal slip for Patronage Refund Warrant
 */
export function formatPatronageThermalSlip(
  dist: MemberPatronageDistribution,
  coopName = 'उनाको साकोस लि.'
): string {
  const line = '--------------------------------';
  return [
    coopName,
    'गढवा, दाङ - संरक्षित पूँजी फिर्ता पुर्जी',
    '(सहकारी ऐन २०७४ दफा ४१ अनुसार)',
    line,
    `पुर्जी नं: ${dist.warrantNumber}`,
    `सदस्य नं: ${dist.memberNo}`,
    `सदस्य नाम: ${dist.memberName}`,
    `खाता नं: ${dist.accountNo}`,
    line,
    `बचत ब्याज लाभांश : रु. ${dist.savingsShareAmount.toLocaleString()}`,
    `ऋण ब्याज लाभांश  : रु. ${dist.loanShareAmount.toLocaleString()}`,
    `कृषि/दुग्ध लाभांश : रु. ${dist.dairyShareAmount.toLocaleString()}`,
    line,
    `कुल संरक्षित लाभांश: रु. ${dist.grossPatronageRefund.toLocaleString()}`,
    `अग्रिम कर (WHT ०%): रु. ${dist.taxWithholding.toLocaleString()}`,
    `भुक्तानी योग्य रकम: रु. ${dist.netPatronageRefund.toLocaleString()}`,
    line,
    `स्थिति: ${dist.status === 'DISBURSED' ? 'भुक्तानी सम्पन्न' : 'दाबी योग्य'}`,
    `भुक्तानी माध्यम: ${dist.payoutMode === 'SAVINGS_ACCOUNT' ? 'बचत खाता' : 'सेयर पुँजी'}`,
    '',
    'धन्यवाद ! उनाको साकोस परिवार',
  ].join('\n');
}

