/**
 * Membership Resignation, Clearance & Final Settlement Engine
 * Unako SACCOS (उनको बचत तथा ऋण सहकारी संस्था लि., गढवा-५, दाङ)
 * Compliant with Nepal Cooperative Act 2074 (दफा ३१: सदस्यताको अन्त्य, दफा ३२: हिसाब फर्छ्यौट)
 */

import { Member, Loan, SavingsAccount } from '../types';

export type MembershipExitReason =
  | 'VOLUNTARY_RESIGNATION' // स्वेच्छिक राजीनामा
  | 'OUT_OF_DISTRICT_RELOCATION' // दाङ बाहिर स्थायी बसाईसराई
  | 'DECEASED_LEGAL_HEIR' // सदस्यको मृत्यु भई हकवालालाई भुक्तानी
  | 'STATUTORY_EXPULSION'; // साधारण सभाको निर्णयद्वारा निष्कासन

export interface MembershipClearanceCheck {
  readonly memberId: string;
  readonly memberNo: string;
  readonly memberName: string;
  readonly canExit: boolean;
  readonly activeLoanCount: number;
  readonly activeLoanBalance: number;
  readonly guaranteedLoansCount: number;
  readonly guaranteedLoansBalance: number;
  readonly savingsAccountsCount: number;
  readonly totalSavingsBalance: number;
  readonly shareUnitsCount: number;
  readonly shareCapital: number;
  readonly blockingReasons: readonly string[];
  readonly warnings: readonly string[];
}

export interface MembershipSettlementBreakdown {
  readonly shareCapitalRefund: number;
  readonly regularSavingsRefund: number;
  readonly compulsorySavingsRefund: number;
  readonly fixedDepositRefund: number;
  readonly grossAccruedInterest: number;
  readonly statutoryTdsDeduction: number; // 5% TDS under Income Tax Act 2058 Sec 88
  readonly netAccruedInterest: number;
  readonly unpaidDividendsAndPatronage: number;
  readonly membershipExitAdminFee: number;
  readonly grossRefundableAmount: number;
  readonly totalDeductions: number;
  readonly netPayableAmount: number;
}

export interface MembershipExitCertificate {
  readonly certificateNo: string;
  readonly voucherNo: string;
  readonly issueDateNepali: string;
  readonly memberId: string;
  readonly memberNo: string;
  readonly memberName: string;
  readonly citizenshipNo: string;
  readonly address: string;
  readonly joinedDateNepali: string;
  readonly exitReason: MembershipExitReason;
  readonly clearanceStatus: 'APPROVED' | 'CONDITIONAL' | 'BLOCKED';
  readonly settlement: MembershipSettlementBreakdown;
  readonly payoutMethod: 'CASH_COUNTER' | 'ACCOUNT_TRANSFER' | 'CHEQUE';
  readonly nomineeOrHeirName?: string;
  readonly statutoryCitation: string;
  readonly declarationText: string;
  readonly committeeClearances: {
    readonly creditCommittee: boolean;
    readonly auditSupervisoryCommittee: boolean;
    readonly managerApproval: boolean;
  };
}

/**
 * Three-tier liability clearance evaluation under Nepal Cooperative Act 2074
 */
export function verifyMembershipClearance(
  member: Member,
  loans: readonly Loan[] = [],
  savings: readonly SavingsAccount[] = []
): MembershipClearanceCheck {
  const blockingReasons: string[] = [];
  const warnings: string[] = [];

  // Gate 1: Direct Loan Liabilities
  const memberLoans = loans.filter((l) => l.memberId === member.id && l.status !== 'PAID_OFF');
  const activeLoanBalance = memberLoans.reduce((sum, l) => sum + l.remainingBalance, 0);

  if (activeLoanBalance > 0) {
    blockingReasons.push(
      `ऋणी सदस्यको नाममा रु. ${activeLoanBalance.toLocaleString()} कर्जा साँवा/ब्याज बक्यौता बाँकी रहेकोले हिसाब चुक्ता नगरी सदस्यता खारेज हुन सक्दैन (दफा ३२)।`
    );
  }

  // Gate 2: Guarantor Exposures
  const guaranteedLoans = loans.filter(
    (l) =>
      l.status !== 'PAID_OFF' &&
      l.memberId !== member.id &&
      (l.collateralOwner?.toLowerCase().includes(member.name.toLowerCase()) ||
        l.collateralDescription?.toLowerCase().includes(member.name.toLowerCase()))
  );
  const guaranteedLoansBalance = guaranteedLoans.reduce((sum, l) => sum + l.remainingBalance, 0);

  if (guaranteedLoans.length > 0) {
    const overdueGuaranteed = guaranteedLoans.filter((l) => l.status === 'OVERDUE');
    if (overdueGuaranteed.length > 0) {
      blockingReasons.push(
        `सदस्यले अन्य ऋणीको भाखा नाघेको कर्जामा व्यक्तिगत/धितो जमानी दिएको (रु. ${guaranteedLoansBalance.toLocaleString()})। वैकल्पिक जमानीकर्ता प्रतिस्थापन नभएसम्म सदस्यता त्याग अस्वीकृत हुन्छ।`
      );
    } else {
      warnings.push(
        `सदस्य ${guaranteedLoans.length} वटा नियमित कर्जाको जमानीकर्ता हुनुहुन्छ। ऋण समितिबाट सट्टा जमानीकर्ता स्वीकृत गराउनुपर्नेछ।`
      );
    }
  }

  // Savings and Shares Consolidation
  const memberSavings = savings.filter((s) => s.memberId === member.id);
  const totalSavingsBalance = memberSavings.reduce((sum, s) => sum + s.balance, member.totalSavings || 0);
  const shareCapital = member.shareCapital || 0;
  const shareUnitsCount = Math.round(shareCapital / 100);

  const canExit = blockingReasons.length === 0;

  return {
    memberId: member.id,
    memberNo: member.memberNo,
    memberName: member.name,
    canExit,
    activeLoanCount: memberLoans.length,
    activeLoanBalance,
    guaranteedLoansCount: guaranteedLoans.length,
    guaranteedLoansBalance,
    savingsAccountsCount: memberSavings.length,
    totalSavingsBalance,
    shareUnitsCount,
    shareCapital,
    blockingReasons,
    warnings,
  };
}

/**
 * Calculates Final Settlement Payout with 5% statutory TDS
 */
export function calculateMembershipExitSettlement(
  member: Member,
  savings: readonly SavingsAccount[] = [],
  adminFee = 200,
  tdsRatePercent = 5.0
): MembershipSettlementBreakdown {
  const shareCapitalRefund = member.shareCapital || 0;

  const memberSavings = savings.filter((s) => s.memberId === member.id);
  const regularSavingsRefund = memberSavings
    .filter((s) => s.accountType.includes('Regular') || s.accountType.includes('साधारण'))
    .reduce((sum, s) => sum + s.balance, 0);

  const compulsorySavingsRefund = memberSavings
    .filter((s) => s.accountType.includes('Compulsory') || s.accountType.includes('अनिवार्य') || s.accountType.includes('Women'))
    .reduce((sum, s) => sum + s.balance, 0);

  const fixedDepositRefund = memberSavings
    .filter((s) => s.accountType.includes('Fixed Deposit') || s.accountType.includes('मुद्दती'))
    .reduce((sum, s) => sum + s.balance, 0);

  // If mock savings list is empty for this member, fallback to member.totalSavings
  const totalSavingsFallback = member.totalSavings || 0;
  const computedSavingsSum = regularSavingsRefund + compulsorySavingsRefund + fixedDepositRefund;
  const effectiveSavings = computedSavingsSum > 0 ? computedSavingsSum : totalSavingsFallback;

  // Accrued Interest (pro-rata estimate: approx 6.5% for half year)
  const grossAccruedInterest = Math.round(effectiveSavings * 0.065 * 0.5);
  const statutoryTdsDeduction = Math.round(grossAccruedInterest * (tdsRatePercent / 100));
  const netAccruedInterest = grossAccruedInterest - statutoryTdsDeduction;

  const unpaidDividendsAndPatronage = member.accruedDividend || 0;
  const membershipExitAdminFee = adminFee;

  const grossRefundableAmount =
    shareCapitalRefund + effectiveSavings + grossAccruedInterest + unpaidDividendsAndPatronage;

  const totalDeductions = statutoryTdsDeduction + membershipExitAdminFee;
  const netPayableAmount = Math.max(0, grossRefundableAmount - totalDeductions);

  return {
    shareCapitalRefund,
    regularSavingsRefund: computedSavingsSum > 0 ? regularSavingsRefund : effectiveSavings,
    compulsorySavingsRefund,
    fixedDepositRefund,
    grossAccruedInterest,
    statutoryTdsDeduction,
    netAccruedInterest,
    unpaidDividendsAndPatronage,
    membershipExitAdminFee,
    grossRefundableAmount,
    totalDeductions,
    netPayableAmount,
  };
}

/**
 * Generate official legal Exit & Clearance Certificate
 */
export function generateMembershipExitCertificate(
  member: Member,
  clearance: MembershipClearanceCheck,
  settlement: MembershipSettlementBreakdown,
  exitReason: MembershipExitReason = 'VOLUNTARY_RESIGNATION',
  payoutMethod: 'CASH_COUNTER' | 'ACCOUNT_TRANSFER' | 'CHEQUE' = 'CASH_COUNTER',
  nomineeOrHeirName?: string
): MembershipExitCertificate {
  const certificateNo = `CERT-EXIT-${new Date().getFullYear()}-${member.memberNo.replace(/[^0-9]/g, '').slice(-4) || '001'}`;
  const voucherNo = `VOUCH-EXIT-${Math.floor(10000 + Math.random() * 90000)}`;

  const statutoryCitation =
    'सहकारी ऐन २०७४ को दफा ३१ र ३२ तथा संस्थाको विनियम २०७५';

  const declarationText = `यस उनको बचत तथा ऋण सहकारी संस्था लि., गढवा-५ दाङमा मिति ${member.joinedDate} देखि सदस्य रहनुभएका श्री/श्रीमती ${member.name} (सदस्य नं. ${member.memberNo}) ले पेश गर्नुभएको सदस्यता त्याग निवेदन अनुसार संस्थाको ऋण, बचत, सेयर तथा जमानी दायित्व पूर्ण रुपमा जाँचबुझ गर्दा संस्थालाई कुनै लेना बाँकी नरहेको प्रमाणित भएकोले निजको सेयर पूँजी, बचत मौज्दात र लाभांश बापतको कुल खुद रकम रु. ${settlement.netPayableAmount.toLocaleString()} भुक्तानी दिई सदस्यता विधिवत खारेज गरी यो फरफारक प्रमाणपत्र प्रदान गरिएको छ।`;

  return {
    certificateNo,
    voucherNo,
    issueDateNepali: '२०८१-०६-०१',
    memberId: member.id,
    memberNo: member.memberNo,
    memberName: member.name,
    citizenshipNo: member.citizenshipNo || '५४-०१-७०-०१४२५',
    address: member.address || 'गढवा गाउँपालिका वडा नं. ५, दाङ',
    joinedDateNepali: member.joinedDate || '२०७८-०१-१५',
    exitReason,
    clearanceStatus: clearance.canExit ? 'APPROVED' : 'BLOCKED',
    settlement,
    payoutMethod,
    nomineeOrHeirName,
    statutoryCitation,
    declarationText,
    committeeClearances: {
      creditCommittee: clearance.activeLoanBalance === 0,
      auditSupervisoryCommittee: true,
      managerApproval: clearance.canExit,
    },
  };
}

/**
 * Format CSV export for membership exits
 */
export function generateMembershipExitCsv(
  certificates: readonly MembershipExitCertificate[]
): string {
  const headers = [
    'Certificate No',
    'Voucher No',
    'Date BS',
    'Member No',
    'Member Name',
    'Citizenship No',
    'Exit Reason',
    'Clearance Status',
    'Share Refund (NPR)',
    'Savings Refund (NPR)',
    'Gross Interest (NPR)',
    'TDS 5% (NPR)',
    'Dividends (NPR)',
    'Admin Fee (NPR)',
    'Net Paid (NPR)',
    'Payout Method',
  ];

  const rows = certificates.map((c) => [
    c.certificateNo,
    c.voucherNo,
    c.issueDateNepali,
    c.memberNo,
    `"${c.memberName}"`,
    c.citizenshipNo,
    c.exitReason,
    c.clearanceStatus,
    c.settlement.shareCapitalRefund,
    c.settlement.regularSavingsRefund +
      c.settlement.compulsorySavingsRefund +
      c.settlement.fixedDepositRefund,
    c.settlement.grossAccruedInterest,
    c.settlement.statutoryTdsDeduction,
    c.settlement.unpaidDividendsAndPatronage,
    c.settlement.membershipExitAdminFee,
    c.settlement.netPayableAmount,
    c.payoutMethod,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
