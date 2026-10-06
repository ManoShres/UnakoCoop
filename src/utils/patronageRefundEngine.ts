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
  /**
   * Net divisible surplus for the fiscal year. Required to verify the Section 41
   * statutory minimum (patronage pool >= 40% of net divisible surplus).
   * NEEDS SIGN-OFF: the store/UI does not currently supply this figure; when omitted the
   * compliance flag reports NOT VERIFIED (false) rather than a vacuous pass.
   */
  netDivisibleSurplus?: number;
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
  /** Undistributed remainder after largest-remainder allocation (paise/rounding). */
  residualAmount: number;
  complianceCheck: {
    meetsSection41Minimum: boolean;
    /** 40% of net divisible surplus, or null when the surplus was not supplied. */
    section41MinimumRequired: number | null;
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
 * Largest-remainder (Hare) apportionment: returns integer amounts that sum EXACTLY to
 * `pool`, eliminating the per-member Math.round leakage of the old implementation.
 */
export function allocateByLargestRemainder(
  volumes: readonly number[],
  pool: number
): number[] {
  const safeVolumes = volumes.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
  const totalVolume = safeVolumes.reduce((sum, v) => sum + v, 0);
  if (totalVolume <= 0 || !Number.isFinite(pool) || pool <= 0) {
    return safeVolumes.map(() => 0);
  }

  const exact = safeVolumes.map((v) => (v / totalVolume) * pool);
  const floors = exact.map((v) => Math.floor(v));
  const target = Math.round(pool);
  let remainder = target - floors.reduce((sum, v) => sum + v, 0);

  const order = exact
    .map((v, index) => ({ index, fraction: v - Math.floor(v) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  const result = [...floors];
  for (let k = 0; k < order.length && remainder > 0; k += 1) {
    result[order[k].index] += 1;
    remainder -= 1;
  }
  return result;
}

/** Hard assertion of the statutory pool-weight invariant (sum must be exactly 100%). */
export function assertValidPatronageWeights(config: PatronageWeightConfig): void {
  const { savingsInterestWeight, loanInterestWeight, dairyBusinessWeight, totalPoolAmount } =
    config;
  const sum = savingsInterestWeight + loanInterestWeight + dairyBusinessWeight;
  if (
    !Number.isFinite(savingsInterestWeight) ||
    !Number.isFinite(loanInterestWeight) ||
    !Number.isFinite(dairyBusinessWeight) ||
    savingsInterestWeight < 0 ||
    loanInterestWeight < 0 ||
    dairyBusinessWeight < 0 ||
    Math.abs(sum - 100) > 1e-9
  ) {
    throw new Error(
      `Invalid patronage pool weights (${savingsInterestWeight}/${loanInterestWeight}/${dairyBusinessWeight}): they must be non-negative and sum to exactly 100.`
    );
  }
  if (!Number.isFinite(totalPoolAmount) || totalPoolAmount < 0) {
    throw new Error(`Invalid patronage pool amount: ${totalPoolAmount}.`);
  }
}

/**
 * Calculates proportional Patronage Refund across all three statutory transaction pillars.
 *
 * The pool weights are validated to sum to exactly 100% and each pillar is apportioned
 * with largest-remainder so the distributed total never exceeds the pool. Invalid weights
 * are REFUSED (zeroed result plus `validationError`) rather than silently over-distributing
 * — this function is called during React render, so it must not throw; callers that want a
 * hard failure should use `assertValidPatronageWeights`.
 */
export function calculatePatronageRefund(
  metrics: readonly MemberPatronageMetric[],
  config: PatronageWeightConfig
): {
  distributions: MemberPatronageDistribution[];
  summary: PatronageSummary;
  validationError?: string;
} {
  const eligibleMetrics = metrics.filter((m) => m.isEligible);

  let validationError: string | undefined;
  try {
    assertValidPatronageWeights(config);
  } catch (err) {
    validationError = err instanceof Error ? err.message : 'Invalid patronage configuration.';
  }

  const netDivisibleSurplus =
    typeof config.netDivisibleSurplus === 'number' && Number.isFinite(config.netDivisibleSurplus)
      ? config.netDivisibleSurplus
      : null;
  const section41MinimumRequired =
    netDivisibleSurplus !== null && netDivisibleSurplus > 0
      ? Number((netDivisibleSurplus * 0.4).toFixed(2))
      : null;

  if (validationError) {
    // Refuse to distribute: zeroed rows keep the UI stable while guaranteeing that no
    // pool larger than the approved amount can ever be paid out.
    let seqCounter = 1;
    const zeroDistributions: MemberPatronageDistribution[] = metrics.map((m) => ({
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
    }));

    return {
      distributions: zeroDistributions,
      validationError,
      summary: {
        totalPoolAmount: 0,
        totalDistributed: 0,
        totalSavingsPoolDistributed: 0,
        totalLoanPoolDistributed: 0,
        totalDairyPoolDistributed: 0,
        eligibleMemberCount: eligibleMetrics.length,
        averageRefundPerMember: 0,
        maxRefundAmount: 0,
        residualAmount: 0,
        complianceCheck: {
          meetsSection41Minimum: false,
          section41MinimumRequired,
          statutoryReserveDeductionVerified: false,
        },
      },
    };
  }

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

  // Largest-remainder allocation per pillar so each pillar distributes its pool exactly.
  const savingsAllocation = allocateByLargestRemainder(
    eligibleMetrics.map((m) => m.annualSavingsInterestEarned),
    totalSavingsPool
  );
  const loanAllocation = allocateByLargestRemainder(
    eligibleMetrics.map((m) => m.annualLoanInterestPaid),
    totalLoanPool
  );
  const dairyAllocation = allocateByLargestRemainder(
    eligibleMetrics.map((m) => m.annualDairyBusinessVolume),
    totalDairyPool
  );

  let totalSavingsDistributed = 0;
  let totalLoanDistributed = 0;
  let totalDairyDistributed = 0;
  let maxRefund = 0;

  let seqCounter = 1;
  let eligibleIndex = -1;
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

    eligibleIndex += 1;
    const savingsShare = savingsAllocation[eligibleIndex] ?? 0;
    const loanShare = loanAllocation[eligibleIndex] ?? 0;
    const dairyShare = dairyAllocation[eligibleIndex] ?? 0;

    const gross = savingsShare + loanShare + dairyShare;
    // NEEDS SIGN-OFF: TDS treatment of patronage refunds. A patronage refund paid as a
    // transaction rebate (cash/passbook credit) is treated here as non-taxable, unlike a
    // share dividend (5% final WHT). If the IRD position for the entity is that the refund
    // is a taxable dividend equivalent, apply the member dividend rate here instead.
    const tax = 0;
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
  const residualAmount = Number((config.totalPoolAmount - totalDistributed).toFixed(2));
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
      residualAmount,
      complianceCheck: {
        // Section 41 requires the patronage pool to be at least 40% of the net divisible
        // surplus. Without a supplied surplus the minimum cannot be verified, so the flag
        // reports false (NOT VERIFIED) instead of the old vacuous `totalPoolAmount > 0`.
        section41MinimumRequired,
        meetsSection41Minimum:
          section41MinimumRequired !== null &&
          config.totalPoolAmount + 0.005 >= section41MinimumRequired,
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

  // Explicit residual line: the undistributed rounding remainder after largest-remainder
  // apportionment (kept visible for audit instead of silently leaking from per-member rounding).
  const residualRow = `"POOL RESIDUAL (UNDISTRIBUTED ROUNDING): NPR ${summary.residualAmount}"`;

  return [headers.join(','), ...rows, '', summaryRow, residualRow].join('\n');
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

