/**
 * Unako SACCOS - Member Micro-Insurance & Mutual Relief Scheme Engine
 * (सदस्य राहत तथा लघु-बीमा कोष व्यवस्थापन प्रणाली)
 *
 * Regulatory Basis:
 * - Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) Section 50, 51 & 67 (Member Welfare & Mutual Protection).
 * - Nepal Department of Cooperatives Micro-Insurance Directives for SACCOS.
 * - Key Protections:
 *   1. MEMBER_LIFE: Loan Protection + Bereavement Grant (ऋण मिनाहा तथा किरिया खर्च).
 *   2. CRITICAL_ILLNESS: Emergency treatment relief for major diseases & accidental injury (घातक रोग तथा दुर्घटना उपचार).
 *   3. LIVESTOCK_AGRICULTURE: Cattle, buffalo, goat loan protection with vet certification (पशुधन सुरक्षण).
 *   4. MATERNITY_NURTURE: Nutrition assistance for newborn mothers (सुत्केरी पोषण राहत).
 */

export type InsuranceSchemeType =
  | 'MEMBER_LIFE'
  | 'CRITICAL_ILLNESS'
  | 'LIVESTOCK_AGRICULTURE'
  | 'MATERNITY_NURTURE';

export type PolicyStatus = 'ACTIVE' | 'EXPIRED' | 'CLAIMED' | 'LAPSED';

export type ClaimStatus =
  | 'SUBMITTED'
  | 'UNDER_INVESTIGATION'
  | 'BOARD_APPROVED'
  | 'REJECTED'
  | 'DISBURSED';

export interface PolicyNominee {
  readonly name: string;
  readonly relation: string;
  readonly citizenshipNo?: string;
  readonly phone: string;
}

export interface MicroInsurancePolicy {
  readonly id: string;
  readonly policyNo: string;
  readonly memberId: string;
  readonly memberNo: string;
  readonly memberName: string;
  readonly memberNameNepali?: string;
  readonly schemeType: InsuranceSchemeType;
  readonly sumAssured: number;
  readonly annualPremium: number;
  readonly startDateBS: string;
  readonly endDateBS: string;
  readonly linkedLoanId?: string;
  readonly outstandingLoanBalance?: number;
  readonly status: PolicyStatus;
  readonly nominee: PolicyNominee;
  readonly livestockTagNo?: string;
  readonly remarks?: string;
}

export interface InsuranceClaim {
  readonly id: string;
  readonly claimNo: string;
  readonly policyId: string;
  readonly policyNo: string;
  readonly memberId: string;
  readonly memberName: string;
  readonly claimantName: string;
  readonly claimantRelation: string;
  readonly schemeType: InsuranceSchemeType;
  readonly incidentDateBS: string;
  readonly claimedAmount: number;
  readonly approvedAmount: number;
  readonly deductedLoanBalance: number;
  readonly bereavementGrant: number;
  readonly netDisbursedToClaimant: number;
  readonly documentsSubmitted: readonly string[];
  readonly status: ClaimStatus;
  readonly boardDecisionNo?: string;
  readonly disbursementVoucherNo?: string;
  readonly disbursementDateBS?: string;
  readonly investigationNotes?: string;
}

export interface ClaimSettlementResult {
  readonly claimedAmount: number;
  readonly approvedAmount: number;
  readonly deductedLoanBalance: number;
  readonly bereavementGrant: number;
  readonly netDisbursedToClaimant: number;
  readonly isFullyCoveringLoan: boolean;
  readonly remainingLoanBalance: number;
}

export interface MutualReliefFundMetrics {
  readonly initialFundReserve: number;
  readonly totalPremiumCollected: number;
  readonly totalClaimsPaid: number;
  readonly currentFundBalance: number;
  readonly totalActivePolicies: number;
  readonly totalSumAssuredActive: number;
  readonly totalClaimsCount: number;
  readonly lossRatioPercent: number; // (Claims Paid / Premium Collected) * 100
  readonly isFundSolvent: boolean;
}

export const SCHEME_LABELS: Record<InsuranceSchemeType, { en: string; np: string; defaultRatePercent: number }> = {
  MEMBER_LIFE: {
    en: 'Member Life & Loan Protection',
    np: 'सदस्य जीवन सुरक्षा तथा ऋण मिनाहा',
    defaultRatePercent: 0.5, // 0.5% of sum assured/loan
  },
  CRITICAL_ILLNESS: {
    en: 'Critical Illness & Medical Relief',
    np: 'घातक रोग तथा उपचार राहत',
    defaultRatePercent: 1.0, // Rs. 500 flat or 1%
  },
  LIVESTOCK_AGRICULTURE: {
    en: 'Livestock & Cattle Protection',
    np: 'पशुधन तथा गाईभैँसी सुरक्षण',
    defaultRatePercent: 5.0, // 5% of livestock value (co-subsidized)
  },
  MATERNITY_NURTURE: {
    en: 'Maternity Nutrition & Child Welfare',
    np: 'सुत्केरी पोषण तथा शिशु स्याहार राहत',
    defaultRatePercent: 0.25, // Fixed annual grant support
  },
};

/**
 * Calculate Annual Premium based on Scheme Type and Sum Assured
 */
export function calculateAnnualPremium(
  schemeType: InsuranceSchemeType,
  sumAssured: number,
  hasSubsidizedTag: boolean = false
): number {
  if (sumAssured <= 0) return 0;

  switch (schemeType) {
    case 'MEMBER_LIFE':
      // 0.5% of loan or sum assured (min Rs. 300)
      return Math.max(300, Math.round((sumAssured * 0.005) * 100) / 100);

    case 'CRITICAL_ILLNESS':
      // Fixed Rs 500 up to 50k, 1% above
      if (sumAssured <= 50000) return 500;
      return Math.round((sumAssured * 0.01) * 100) / 100;

    case 'LIVESTOCK_AGRICULTURE':
      // Standard 5% of animal value, 3% if subsidized by Municipality / Livestock Office
      const rate = hasSubsidizedTag ? 0.03 : 0.05;
      return Math.max(500, Math.round((sumAssured * rate) * 100) / 100);

    case 'MATERNITY_NURTURE':
      // Nominal member welfare fee of Rs. 200 per year
      return 200;

    default:
      return 500;
  }
}

/**
 * Calculate Claim Settlement:
 * Under Member Life Scheme, approved sum assured is used first to write off
 * any outstanding loan of the deceased member, bereavement grant is added,
 * and the balance is handed over to the nominee.
 */
export function calculateClaimSettlement(params: {
  claimedAmount: number;
  approvedSumAssured: number;
  outstandingLoanBalance: number;
  bereavementGrant?: number;
}): ClaimSettlementResult {
  const { claimedAmount, approvedSumAssured, outstandingLoanBalance, bereavementGrant = 0 } = params;

  const validApproved = Math.max(0, Math.min(claimedAmount, approvedSumAssured));
  const validLoan = Math.max(0, outstandingLoanBalance);
  const validGrant = Math.max(0, bereavementGrant);

  // Offset loan first
  const deductedLoan = Math.min(validApproved, validLoan);
  const remainingLoan = Math.max(0, validLoan - deductedLoan);
  const surplusAfterLoan = Math.max(0, validApproved - deductedLoan);

  // Net cash paid to nominee = surplus + bereavement grant
  const netDisbursed = Math.round((surplusAfterLoan + validGrant) * 100) / 100;

  return {
    claimedAmount,
    approvedAmount: validApproved,
    deductedLoanBalance: deductedLoan,
    bereavementGrant: validGrant,
    netDisbursedToClaimant: netDisbursed,
    isFullyCoveringLoan: remainingLoan === 0,
    remainingLoanBalance: remainingLoan,
  };
}

/**
 * Validate Claim Form Fields
 */
export function validateClaimSubmission(claim: Partial<InsuranceClaim>): {
  isValid: boolean;
  errors: readonly string[];
} {
  const errors: string[] = [];

  if (!claim.memberId || !claim.memberId.trim()) {
    errors.push('सदस्य पहिचान नं. (Member ID) अनिवार्य छ।');
  }
  if (!claim.policyNo || !claim.policyNo.trim()) {
    errors.push('बीमा पोलिसी नं. (Policy No) अनिवार्य छ।');
  }
  if (!claim.claimantName || !claim.claimantName.trim()) {
    errors.push('दावीकर्ताको नाम (Claimant Name) अनिवार्य छ।');
  }
  if (!claim.claimedAmount || claim.claimedAmount <= 0) {
    errors.push('दावी रकम (Claim Amount) सकारात्मक हुनुपर्दछ।');
  }
  if (!claim.documentsSubmitted || claim.documentsSubmitted.length === 0) {
    errors.push('कम्तीमा एक आधिकारिक प्रमाण कागजात (सिफारिस, मृत्युदर्ता वा बिल) संलग्न हुनुपर्दछ।');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Aggregate Mutual Relief Fund Health & Loss Ratio
 */
export function aggregateMutualFundMetrics(
  policies: readonly MicroInsurancePolicy[],
  claims: readonly InsuranceClaim[],
  initialFundReserve: number = 850000
): MutualReliefFundMetrics {
  const activePolicies = policies.filter((p) => p.status === 'ACTIVE');
  const totalPremiumCollected = policies.reduce((sum, p) => sum + p.annualPremium, 0);
  const totalSumAssuredActive = activePolicies.reduce((sum, p) => sum + p.sumAssured, 0);

  const disbursedClaims = claims.filter((c) => c.status === 'DISBURSED');
  const totalClaimsPaid = disbursedClaims.reduce((sum, c) => sum + (c.approvedAmount + c.bereavementGrant), 0);

  const currentFundBalance = Math.round((initialFundReserve + totalPremiumCollected - totalClaimsPaid) * 100) / 100;
  const lossRatioPercent = totalPremiumCollected > 0
    ? Math.round(((totalClaimsPaid / totalPremiumCollected) * 100) * 100) / 100
    : 0;

  // Cooperative insurance fund is solvent if fund balance remains positive and loss ratio < 100%
  const isFundSolvent = currentFundBalance > 0 && lossRatioPercent <= 85.0;

  return {
    initialFundReserve,
    totalPremiumCollected: Math.round(totalPremiumCollected * 100) / 100,
    totalClaimsPaid: Math.round(totalClaimsPaid * 100) / 100,
    currentFundBalance,
    totalActivePolicies: activePolicies.length,
    totalSumAssuredActive: Math.round(totalSumAssuredActive * 100) / 100,
    totalClaimsCount: claims.length,
    lossRatioPercent,
    isFundSolvent,
  };
}

/**
 * Export Policies Register to CSV
 */
export function exportPoliciesCsv(policies: readonly MicroInsurancePolicy[]): string {
  const header = [
    'क्र.सं. (S.N.)',
    'पोलिसी नं. (Policy No)',
    'सदस्य नं. (Member No)',
    'सदस्यको नाम (Member Name)',
    'सुरक्षण योजना (Scheme Type)',
    'बीमाङ्क रकम रु. (Sum Assured)',
    'वार्षिक प्रिमियम रु. (Annual Premium)',
    'सुरु मिति (Start Date BS)',
    'समाप्त मिति (End Date BS)',
    'ऋण नं. (Linked Loan)',
    'ऋण बाँकी रु. (Loan Balance)',
    'हकवालाको नाम (Nominee)',
    'हकवाला नाता (Relation)',
    'हकवाला फोन (Phone)',
    'स्थिति (Status)',
  ].map((h) => `"${h}"`).join(',');

  const rows = policies.map((p, idx) => {
    return [
      idx + 1,
      `"${p.policyNo}"`,
      `"${p.memberNo}"`,
      `"${p.memberName}"`,
      `"${SCHEME_LABELS[p.schemeType]?.np || p.schemeType}"`,
      p.sumAssured.toFixed(2),
      p.annualPremium.toFixed(2),
      `"${p.startDateBS}"`,
      `"${p.endDateBS}"`,
      `"${p.linkedLoanId || '-'}"`,
      (p.outstandingLoanBalance || 0).toFixed(2),
      `"${p.nominee.name}"`,
      `"${p.nominee.relation}"`,
      `"${p.nominee.phone}"`,
      `"${p.status}"`,
    ].join(',');
  });

  return [header, ...rows].join('\r\n');
}

/**
 * Export Claims Register to CSV
 */
export function exportClaimsCsv(claims: readonly InsuranceClaim[]): string {
  const header = [
    'क्र.सं. (S.N.)',
    'दावी नं. (Claim No)',
    'पोलिसी नं. (Policy No)',
    'सदस्यको नाम (Member Name)',
    'दावीकर्ताको नाम (Claimant)',
    'नाता (Relation)',
    'योजना (Scheme)',
    'घटना मिति (Incident Date BS)',
    'दावी रकम रु. (Claimed)',
    'स्वीकृत रकम रु. (Approved)',
    'ऋण मिनाहा रु. (Loan Cleared)',
    'किरिया खर्च रु. (Funeral Grant)',
    'खुद भुक्तानी रु. (Net Paid to Nominee)',
    'निर्णय नं. (Board Decision)',
    'भौचर नं. (Voucher)',
    'स्थिति (Status)',
  ].map((h) => `"${h}"`).join(',');

  const rows = claims.map((c, idx) => {
    return [
      idx + 1,
      `"${c.claimNo}"`,
      `"${c.policyNo}"`,
      `"${c.memberName}"`,
      `"${c.claimantName}"`,
      `"${c.claimantRelation}"`,
      `"${SCHEME_LABELS[c.schemeType]?.np || c.schemeType}"`,
      `"${c.incidentDateBS}"`,
      c.claimedAmount.toFixed(2),
      c.approvedAmount.toFixed(2),
      c.deductedLoanBalance.toFixed(2),
      c.bereavementGrant.toFixed(2),
      c.netDisbursedToClaimant.toFixed(2),
      `"${c.boardDecisionNo || '-'}"`,
      `"${c.disbursementVoucherNo || '-'}"`,
      `"${c.status}"`,
    ].join(',');
  });

  return [header, ...rows].join('\r\n');
}
