/**
 * Fixed Deposit (मुद्दती बचत) Maturity, Auto-Renewal & Premature Liquidation Engine
 * Unako SACCOS (उनको बचत तथा ऋण सहकारी संस्था लि., गढवा-५, दाङ)
 * Fully compliant with Nepal Income Tax Act 2058 Section 88 (5% TDS) & Cooperative Norms.
 */

import { SavingsAccount, Member } from '../types';

export type FdSettlementType = 'MATURITY' | 'PREMATURE_BREAK' | 'AUTO_RENEWAL';
export type FdRolloverMode = 'PRINCIPAL_ONLY' | 'COMPOUND_PRINCIPAL_AND_NET_INTEREST';

export interface FdSettlementCalculation {
  readonly accountNo: string;
  readonly memberName: string;
  readonly memberNo: string;
  readonly settlementType: FdSettlementType;
  readonly principalAmount: number;
  readonly contractedRate: number;
  readonly appliedRate: number;
  readonly tenureMonths: number;
  readonly actualDaysHeld: number;
  readonly penaltyRatePercent: number;
  readonly penaltyAmount: number;
  readonly grossInterest: number;
  readonly effectiveInterest: number;
  readonly tdsRatePercent: number; // 5% statutory TDS
  readonly tdsAmount: number;
  readonly netInterest: number;
  readonly totalPayoutAmount: number;
  readonly isPremature: boolean;
}

export interface FdAutoRenewalResult {
  readonly originalAccountNo: string;
  readonly newAccountNo: string;
  readonly memberName: string;
  readonly rolloverMode: FdRolloverMode;
  readonly previousPrincipal: number;
  readonly netInterestEarned: number;
  readonly newPrincipalAmount: number;
  readonly interestPayoutToSavings: number;
  readonly newRate: number;
  readonly newTenureYears: number;
  readonly renewedDateNepali: string;
  readonly newMaturityDateNepali: string;
  readonly newMaturityDateEnglish: string;
}

export interface FdDischargeVoucher {
  readonly voucherNo: string;
  readonly certificateNo: string;
  readonly issueDateNepali: string;
  readonly memberName: string;
  readonly memberNo: string;
  readonly citizenshipNo: string;
  readonly accountNo: string;
  readonly schemeName: string;
  readonly principalAmount: number;
  readonly grossInterest: number;
  readonly penaltyDeduction: number;
  readonly netTaxableInterest: number;
  readonly statutoryTds5Percent: number;
  readonly netInterestPayable: number;
  readonly totalDischargedAmount: number;
  readonly payoutDestination: 'REGULAR_SAVINGS' | 'CASH_COUNTER';
  readonly panNumber?: string;
  readonly remarks: string;
}

/**
 * Calculate FD Maturity or Premature Liquidation with 5% statutory TDS
 */
export function calculateFdSettlement(
  principal: number,
  contractedRate: number,
  tenureMonths: number,
  settlementType: FdSettlementType = 'MATURITY',
  actualDaysHeld?: number,
  penaltyRatePercent = 2.0,
  tdsRatePercent = 5.0,
  memberName = 'Cooperative Member',
  memberNo = 'UK-MEMBER',
  accountNo = 'FD-DEFAULT'
): FdSettlementCalculation {
  const isPremature = settlementType === 'PREMATURE_BREAK';
  const totalContractDays = Math.round(tenureMonths * 30.416);
  const days = isPremature ? Math.max(1, actualDaysHeld ?? Math.round(totalContractDays * 0.6)) : totalContractDays;

  // For premature break, rate is reduced by penaltyRatePercent (e.g. 10% - 2% = 8%)
  const appliedRate = isPremature
    ? Math.max(4.5, contractedRate - penaltyRatePercent)
    : contractedRate;

  // Simple daily compounding interest: Principal * (Rate / 100) * (Days / 365)
  const grossInterest = Math.round((principal * (contractedRate / 100) * days) / 365);
  const effectiveInterest = isPremature
    ? Math.round((principal * (appliedRate / 100) * days) / 365)
    : grossInterest;

  const penaltyAmount = isPremature ? Math.max(0, grossInterest - effectiveInterest) : 0;

  // 5% TDS on actual interest earned under Section 88 of Income Tax Act 2058
  const tdsAmount = Math.round((effectiveInterest * (tdsRatePercent / 100)));
  const netInterest = Math.max(0, effectiveInterest - tdsAmount);
  const totalPayoutAmount = principal + netInterest;

  return {
    accountNo,
    memberName,
    memberNo,
    settlementType,
    principalAmount: principal,
    contractedRate,
    appliedRate,
    tenureMonths,
    actualDaysHeld: days,
    penaltyRatePercent: isPremature ? penaltyRatePercent : 0,
    penaltyAmount,
    grossInterest,
    effectiveInterest,
    tdsRatePercent,
    tdsAmount,
    netInterest,
    totalPayoutAmount,
    isPremature,
  };
}

/**
 * Calculate FD Auto-Renewal Rollover
 */
export function calculateFdAutoRenewal(
  currentAccount: SavingsAccount,
  member: Member | undefined,
  rolloverMode: FdRolloverMode = 'COMPOUND_PRINCIPAL_AND_NET_INTEREST',
  newTenureYears = 1,
  newRate = 10.0,
  tdsRatePercent = 5.0
): FdAutoRenewalResult {
  const previousPrincipal = currentAccount.balance;
  // Calculate matured interest for previous tenure
  const grossInterest = Math.round(
    (previousPrincipal * (currentAccount.interestRate / 100) * (newTenureYears * 365)) / 365
  );
  const tdsAmount = Math.round(grossInterest * (tdsRatePercent / 100));
  const netInterestEarned = grossInterest - tdsAmount;

  const newPrincipalAmount =
    rolloverMode === 'COMPOUND_PRINCIPAL_AND_NET_INTEREST'
      ? previousPrincipal + netInterestEarned
      : previousPrincipal;

  const interestPayoutToSavings =
    rolloverMode === 'PRINCIPAL_ONLY' ? netInterestEarned : 0;

  const newAccountNo = `${currentAccount.accountNo}-R${newTenureYears}Y`;
  const currentYearBs = 2081;
  const newMaturityYearBs = currentYearBs + newTenureYears;

  return {
    originalAccountNo: currentAccount.accountNo,
    newAccountNo,
    memberName: member?.name ?? 'Cooperative Member',
    rolloverMode,
    previousPrincipal,
    netInterestEarned,
    newPrincipalAmount,
    interestPayoutToSavings,
    newRate,
    newTenureYears,
    renewedDateNepali: `${currentYearBs}-०६-०१`,
    newMaturityDateNepali: `${newMaturityYearBs}-०६-०१`,
    newMaturityDateEnglish: new Date(
      Date.now() + newTenureYears * 365 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 10),
  };
}

/**
 * Generate official Fixed Deposit Settlement Discharge Voucher & TDS Certificate
 */
export function generateFdDischargeVoucher(
  settlement: FdSettlementCalculation,
  member: Member | undefined,
  schemeName = 'Fixed Deposit (1 Year)',
  payoutDestination: 'REGULAR_SAVINGS' | 'CASH_COUNTER' = 'REGULAR_SAVINGS'
): FdDischargeVoucher {
  const voucherNo = `FD-DIS-${new Date().getFullYear()}-${settlement.accountNo.replace(/[^0-9]/g, '').slice(-4) || '001'}`;
  const certificateNo = `CERT-TDS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    voucherNo,
    certificateNo,
    issueDateNepali: '२०८१-०६-०१',
    memberName: settlement.memberName,
    memberNo: settlement.memberNo,
    citizenshipNo: member?.citizenshipNo ?? '५४-०१-७०-०१४२५',
    accountNo: settlement.accountNo,
    schemeName,
    principalAmount: settlement.principalAmount,
    grossInterest: settlement.grossInterest,
    penaltyDeduction: settlement.penaltyAmount,
    netTaxableInterest: settlement.effectiveInterest,
    statutoryTds5Percent: settlement.tdsAmount,
    netInterestPayable: settlement.netInterest,
    totalDischargedAmount: settlement.totalPayoutAmount,
    payoutDestination,
    panNumber: member?.panNo,
    remarks: settlement.isPremature
      ? 'समयपूर्व मुद्दती भुक्तानी (२% जरिवाना कटौती र ५% आयकर कट्टी गरी चुक्ता गरिएको)'
      : 'नियमित परिपक्वता पश्चात ५% आयकर कट्टी गरी फरफारक सम्पन्न',
  };
}

/**
 * Generate CSV export for FD settlements
 */
export function generateFdSettlementsCsv(vouchers: readonly FdDischargeVoucher[]): string {
  const headers = [
    'Voucher No',
    'Certificate No',
    'Date BS',
    'Member No',
    'Member Name',
    'Citizenship No',
    'Account No',
    'Scheme',
    'Principal (NPR)',
    'Gross Interest (NPR)',
    'Penalty (NPR)',
    'Taxable Interest (NPR)',
    'TDS 5% (NPR)',
    'Net Interest (NPR)',
    'Total Discharged (NPR)',
    'Destination',
  ];

  const rows = vouchers.map((v) => [
    v.voucherNo,
    v.certificateNo,
    v.issueDateNepali,
    v.memberNo,
    `"${v.memberName}"`,
    v.citizenshipNo,
    v.accountNo,
    `"${v.schemeName}"`,
    v.principalAmount,
    v.grossInterest,
    v.penaltyDeduction,
    v.netTaxableInterest,
    v.statutoryTds5Percent,
    v.netInterestPayable,
    v.totalDischargedAmount,
    v.payoutDestination,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
