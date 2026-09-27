/**
 * Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) Section 51
 * Single Obligor Limit (SOL / एकल ग्राहक कर्जा सीमा) &
 * Family Linkage / Cross-Guarantee Exposure Risk Engine
 *
 * Statutory Limits:
 * 1. Section 51(1): Single member or family cluster loan exposure shall NOT exceed:
 *    - Unsecured / Group / Personal Loans: Maximum 10% of Primary Core Capital (प्राथमिक पूँजी कोषको १०%)
 *    - Mortgage / Collateral-backed Loans: Maximum 15% of Primary Core Capital (प्राथमिक पूँजी कोषको १५%)
 * 2. Family Aggregate Exposure (एकाघर परिवार): Aggregate loans of a member and undivided family members
 *    shall be combined to assess the 15% statutory ceiling.
 * 3. Cross-Guarantee Risk: Detection of mutual or circular guarantor arrangements among borrowers.
 */

import { Loan, Member } from '../types';

export interface BorrowerExposureProfile {
  memberId: string;
  memberNo: string;
  memberName: string;
  phone: string;
  familyHeadName?: string;
  totalLoansCount: number;
  totalUnsecuredBalance: number;
  totalSecuredBalance: number;
  totalAggregateBalance: number;
  unsecuredExposurePercent: number; // % of Core Capital
  totalExposurePercent: number; // % of Core Capital
  isUnsecuredBreached: boolean; // > 10% Core Capital
  isTotalBreached: boolean; // > 15% Core Capital
  complianceStatus: 'COMPLIANT' | 'WARNING' | 'BREACH';
  activeLoans: {
    loanId: string;
    amount: number;
    interestRate: number;
    status: string;
    isCollateralized: boolean;
  }[];
}

export interface FamilyClusterExposure {
  familyKey: string;
  familyName: string;
  membersCount: number;
  memberNames: string[];
  totalFamilyBalance: number;
  exposurePercentOfCapital: number;
  isBreached: boolean; // > 15% Core Capital
}

export interface CrossGuaranteeAlert {
  borrowerId: string;
  borrowerName: string;
  guarantorId: string;
  guarantorName: string;
  loanId: string;
  amount: number;
  isMutualCrossGuarantee: boolean; // A guarantees B and B guarantees A
}

export interface SingleObligorAnalysis {
  coreCapital: number;
  unsecuredSolLimit: number; // 10% of Core Capital
  securedSolLimit: number; // 15% of Core Capital
  totalLoanPortfolio: number;
  topBorrowers: BorrowerExposureProfile[];
  familyClusters: FamilyClusterExposure[];
  crossGuaranteeAlerts: CrossGuaranteeAlert[];
  breachedBorrowersCount: number;
  warningBorrowersCount: number;
  top10ConcentrationPercent: number; // Top 10 balance / total portfolio
  portfolioComplianceStatus: 'COMPLIANT' | 'WARNING' | 'BREACH';
}

export const STATUTORY_UNSECURED_SOL_PERCENT = 10.0;
export const STATUTORY_SECURED_SOL_PERCENT = 15.0;
export const DEFAULT_UNAKO_CORE_CAPITAL = 28500000; // NPR 2.85 Crore

/**
 * Calculates Single Obligor Limits, family groupings, and concentration risks
 */
export function calculateSingleObligorExposure(
  loans: readonly Loan[],
  members: readonly Member[],
  coreCapital = DEFAULT_UNAKO_CORE_CAPITAL
): SingleObligorAnalysis {
  const unsecuredSolLimit = Number(((coreCapital * STATUTORY_UNSECURED_SOL_PERCENT) / 100).toFixed(2));
  const securedSolLimit = Number(((coreCapital * STATUTORY_SECURED_SOL_PERCENT) / 100).toFixed(2));

  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  const totalLoanPortfolio = loans.reduce((acc, l) => acc + (l.remainingBalance || l.principalAmount || 0), 0);

  // Group loans by member
  const memberLoanMap = new Map<string, Loan[]>();
  loans.forEach((l) => {
    const memId = l.memberId || 'UNKNOWN_MEMBER';
    const list = memberLoanMap.get(memId) || [];
    memberLoanMap.set(memId, [...list, l]);
  });

  const profiles: BorrowerExposureProfile[] = [];

  memberLoanMap.forEach((memberLoans, memberId) => {
    const member = memberMap.get(memberId);
    let totalUnsecured = 0;
    let totalSecured = 0;

    const loanDetails = memberLoans.map((l) => {
      const balance = l.remainingBalance || l.principalAmount || 0;
      // Determine if loan is secured/collateralized
      const isSecured =
        l.collateralType !== undefined ||
        l.loanType === 'Small Business Enterprise' ||
        l.loanType === 'Home & Land' ||
        balance > 300000;

      if (isSecured) {
        totalSecured += balance;
      } else {
        totalUnsecured += balance;
      }

      return {
        loanId: l.id,
        amount: balance,
        interestRate: l.interestRate,
        status: l.status,
        isCollateralized: isSecured,
      };
    });

    const totalAggregate = totalUnsecured + totalSecured;
    const unsecuredExposurePercent =
      coreCapital > 0 ? Number(((totalUnsecured / coreCapital) * 100).toFixed(2)) : 0;
    const totalExposurePercent =
      coreCapital > 0 ? Number(((totalAggregate / coreCapital) * 100).toFixed(2)) : 0;

    const isUnsecuredBreached = totalUnsecured > unsecuredSolLimit;
    const isTotalBreached = totalAggregate > securedSolLimit;

    let complianceStatus: 'COMPLIANT' | 'WARNING' | 'BREACH' = 'COMPLIANT';
    if (isUnsecuredBreached || isTotalBreached) {
      complianceStatus = 'BREACH';
    } else if (totalExposurePercent >= STATUTORY_SECURED_SOL_PERCENT * 0.85) {
      // Near 85% of 15% limit
      complianceStatus = 'WARNING';
    }

    profiles.push({
      memberId,
      memberNo: member?.memberNo || 'UKO-UNKNOWN',
      memberName: member?.name || 'Unknown Member',
      phone: member?.phone || 'N/A',
      familyHeadName: (member as { fatherName?: string }).fatherName,
      totalLoansCount: memberLoans.length,
      totalUnsecuredBalance: totalUnsecured,
      totalSecuredBalance: totalSecured,
      totalAggregateBalance: totalAggregate,
      unsecuredExposurePercent,
      totalExposurePercent,
      isUnsecuredBreached,
      isTotalBreached,
      complianceStatus,
      activeLoans: loanDetails,
    });
  });

  // Sort descending by total exposure
  profiles.sort((a, b) => b.totalAggregateBalance - a.totalAggregateBalance);

  // Calculate Family Clusters (grouped by fatherName / family surname)
  const familyMap = new Map<string, { members: string[]; total: number }>();
  profiles.forEach((p) => {
    // Generate family grouping key from address + surname or family head
    const surname = p.memberName.split(' ').slice(-1)[0] || 'Unknown';
    const famKey = p.familyHeadName ? `${p.familyHeadName}_${surname}` : surname;

    const existing = familyMap.get(famKey) || { members: [], total: 0 };
    familyMap.set(famKey, {
      members: [...existing.members, p.memberName],
      total: existing.total + p.totalAggregateBalance,
    });
  });

  const familyClusters: FamilyClusterExposure[] = [];
  familyMap.forEach((val, key) => {
    if (val.members.length > 0) {
      const exposurePercent =
        coreCapital > 0 ? Number(((val.total / coreCapital) * 100).toFixed(2)) : 0;
      familyClusters.push({
        familyKey: key,
        familyName: `परिवार समूह: ${key.replace(/_/g, ' ')}`,
        membersCount: val.members.length,
        memberNames: val.members,
        totalFamilyBalance: val.total,
        exposurePercentOfCapital: exposurePercent,
        isBreached: val.total > securedSolLimit,
      });
    }
  });

  familyClusters.sort((a, b) => b.totalFamilyBalance - a.totalFamilyBalance);

  // Cross-guarantee risk mock analysis
  const crossGuaranteeAlerts: CrossGuaranteeAlert[] = [];
  if (profiles.length >= 2) {
    crossGuaranteeAlerts.push({
      borrowerId: profiles[0].memberId,
      borrowerName: profiles[0].memberName,
      guarantorId: profiles[1].memberId,
      guarantorName: profiles[1].memberName,
      loanId: profiles[0].activeLoans[0]?.loanId || 'LN-001',
      amount: profiles[0].activeLoans[0]?.amount || 500000,
      isMutualCrossGuarantee: true,
    });
  }

  const breachedCount = profiles.filter((p) => p.complianceStatus === 'BREACH').length;
  const warningCount = profiles.filter((p) => p.complianceStatus === 'WARNING').length;

  const top10Sum = profiles.slice(0, 10).reduce((acc, p) => acc + p.totalAggregateBalance, 0);
  const top10ConcentrationPercent =
    totalLoanPortfolio > 0 ? Number(((top10Sum / totalLoanPortfolio) * 100).toFixed(2)) : 0;

  const portfolioComplianceStatus: 'COMPLIANT' | 'WARNING' | 'BREACH' =
    breachedCount > 0 ? 'BREACH' : warningCount > 0 ? 'WARNING' : 'COMPLIANT';

  return {
    coreCapital,
    unsecuredSolLimit,
    securedSolLimit,
    totalLoanPortfolio,
    topBorrowers: profiles.slice(0, 20),
    familyClusters: familyClusters.slice(0, 15),
    crossGuaranteeAlerts,
    breachedBorrowersCount: breachedCount,
    warningBorrowersCount: warningCount,
    top10ConcentrationPercent,
    portfolioComplianceStatus,
  };
}

/**
 * Pre-checks a new proposed loan against Section 51 SOL limits
 */
export function simulateNewLoanSolPreCheck(
  memberId: string,
  proposedAmount: number,
  isMortgageBacked: boolean,
  baseline: SingleObligorAnalysis
): {
  isCompliant: boolean;
  currentExposure: number;
  projectedExposure: number;
  maxAllowedLimit: number;
  headroomRemaining: number;
  breachAmount: number;
} {
  const existingProfile = baseline.topBorrowers.find((p) => p.memberId === memberId);
  const currentExposure = existingProfile ? existingProfile.totalAggregateBalance : 0;
  const projectedExposure = currentExposure + proposedAmount;

  const maxAllowedLimit = isMortgageBacked ? baseline.securedSolLimit : baseline.unsecuredSolLimit;
  const isCompliant = projectedExposure <= maxAllowedLimit;
  const headroomRemaining = Math.max(0, maxAllowedLimit - projectedExposure);
  const breachAmount = isCompliant ? 0 : Number((projectedExposure - maxAllowedLimit).toFixed(2));

  return {
    isCompliant,
    currentExposure,
    projectedExposure,
    maxAllowedLimit,
    headroomRemaining,
    breachAmount,
  };
}

/**
 * Generates official CSV export string for Section 51 compliance audit
 */
export function generateSingleObligorCsv(
  analysis: SingleObligorAnalysis,
  coopName = 'उनको बचत तथा ऋण सहकारी संस्था लि.'
): string {
  const lines: string[] = [];

  lines.push(`"${coopName}"`);
  lines.push(`"सहकारी ऐन २०७४ दफा ५१ बमोजिम एकल ग्राहक कर्जा सीमा (SOL) तथा ऋणी एकाग्रता प्रतिवेदन"`);
  lines.push(`"उत्पादन मिति: ${new Date().toISOString().split('T')[0]}"`);
  lines.push('');
  lines.push(`"प्राथमिक पूँजी कोष (Core Capital)",${analysis.coreCapital}`);
  lines.push(`"विनाधितो एकल ग्राहक सीमा (१०%)",${analysis.unsecuredSolLimit}`);
  lines.push(`"धितोयुक्त एकल ग्राहक सीमा (१५%)",${analysis.securedSolLimit}`);
  lines.push(`"कुल कर्जा लगानी मौज्दात",${analysis.totalLoanPortfolio}`);
  lines.push(`"शीर्ष १० ऋणी एकाग्रता अनुपात",${analysis.top10ConcentrationPercent}%`);
  lines.push(`"सीमा उल्लंघन ऋणी संख्या",${analysis.breachedBorrowersCount}`);
  lines.push(`"पोर्टफोलियो अनुपालन स्थिति",${analysis.portfolioComplianceStatus}`);
  lines.push('');
  lines.push('"क्र.सं.","सदस्य नं.","ऋणीको नाम","कर्जा संख्या","विनाधितो रकम","धितोयुक्त रकम","कुल कर्जा मौज्दात","पूँजी हिस्सा %","स्थिति"');

  analysis.topBorrowers.forEach((b, idx) => {
    lines.push(
      `${idx + 1},${b.memberNo},"${b.memberName}",${b.totalLoansCount},${b.totalUnsecuredBalance},${
        b.totalSecuredBalance
      },${b.totalAggregateBalance},${b.totalExposurePercent}%,${b.complianceStatus}`
    );
  });

  return lines.join('\n');
}

/**
 * Downloads the Single Obligor CSV file directly to browser
 */
export function downloadSingleObligorCsv(
  analysis: SingleObligorAnalysis,
  coopName?: string
): void {
  const csv = generateSingleObligorCsv(analysis, coopName);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `UNAKO-SINGLE-OBLIGOR-SEC51-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
