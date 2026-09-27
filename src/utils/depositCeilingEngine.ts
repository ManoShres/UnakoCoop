/**
 * Cooperative Act 2074 Section 49 & PEARLS Standard (E9/P1)
 * Member Savings Deposit Mobilization Ceiling (15x Core Capital Limit) &
 * Single Depositor Concentration Risk Engine
 *
 * Statutory Mandate:
 * 1. Section 49(1): "सहकारी संस्थाले आफ्नो प्राथमिक पूँजी कोषको पन्ध्र गुणा भन्दा बढी बचत संकलन गर्न पाउने छैन"
 *    - Total Member Deposits must NOT exceed 15 times the Primary (Core) Capital Fund.
 * 2. Department of Cooperatives / PEARLS Concentration Norms:
 *    - No single member deposit shall exceed 10% of total deposit liability to protect liquidity.
 */

import { SavingsAccount, Member } from '../types';

export interface CapitalComponents {
  paidUpShareCapital: number;
  generalReserveFund: number;
  capitalReserveFund: number;
  undividedProfit: number;
}

export interface DepositorProfile {
  memberId: string;
  memberNo: string;
  memberName: string;
  totalDepositBalance: number;
  accountCount: number;
  depositSharePercent: number; // e.g. 4.2%
  isConcentrationRisk: boolean; // True if > 10%
}

export interface ProductDepositSummary {
  accountType: string;
  totalBalance: number;
  accountCount: number;
  sharePercent: number;
}

export interface DepositCeilingAnalysis {
  coreCapital: CapitalComponents;
  totalCoreCapital: number;
  totalDepositLiability: number;
  maxStatutoryDepositCeiling: number; // Core Capital * 15
  depositToCoreCapitalRatio: number; // Deposits / Core Capital (e.g. 11.2x)
  maxAllowedRatio: number; // 15.0x
  headroomCapacity: number; // Ceiling - Deposits
  headroomUtilizationPercent: number; // (Deposits / Ceiling) * 100
  isCeilingCompliant: boolean;
  complianceStatus: 'COMPLIANT' | 'WARNING' | 'BREACH';
  singleDepositorLimitPercent: number; // 10.0%
  topDepositors: DepositorProfile[];
  flaggedConcentratedMembersCount: number;
  hhiIndex: number; // Herfindahl-Hirschman Index
  productSummaries: ProductDepositSummary[];
}

export const STATUTORY_CORE_CAPITAL_MULTIPLIER = 15.0;
export const SINGLE_DEPOSITOR_LIMIT_PERCENT = 10.0;

export const DEFAULT_UNAKO_CAPITAL: CapitalComponents = {
  paidUpShareCapital: 16500000, // NPR 1.65 Crore
  generalReserveFund: 7800000, // NPR 78 Lakhs
  capitalReserveFund: 1800000, // NPR 18 Lakhs
  undividedProfit: 2400000, // NPR 24 Lakhs
};

/**
 * Calculates Section 49 deposit mobilization compliance and concentration metrics
 */
export function calculateDepositCeiling(
  savings: readonly SavingsAccount[],
  members: readonly Member[],
  capital: CapitalComponents = DEFAULT_UNAKO_CAPITAL,
  maxMultiplier = STATUTORY_CORE_CAPITAL_MULTIPLIER,
  singleDepositorCap = SINGLE_DEPOSITOR_LIMIT_PERCENT
): DepositCeilingAnalysis {
  const totalCoreCapital =
    capital.paidUpShareCapital +
    capital.generalReserveFund +
    capital.capitalReserveFund +
    capital.undividedProfit;

  const totalDepositLiability = savings.reduce((acc, s) => acc + s.balance, 0);
  const maxStatutoryDepositCeiling = Number((totalCoreCapital * maxMultiplier).toFixed(2));

  const depositToCoreCapitalRatio =
    totalCoreCapital > 0 ? Number((totalDepositLiability / totalCoreCapital).toFixed(2)) : 0;

  const headroomCapacity = Number((maxStatutoryDepositCeiling - totalDepositLiability).toFixed(2));
  const headroomUtilizationPercent =
    maxStatutoryDepositCeiling > 0
      ? Number(((totalDepositLiability / maxStatutoryDepositCeiling) * 100).toFixed(2))
      : 0;

  const isCeilingCompliant = totalDepositLiability <= maxStatutoryDepositCeiling;

  let complianceStatus: 'COMPLIANT' | 'WARNING' | 'BREACH' = 'COMPLIANT';
  if (!isCeilingCompliant) {
    complianceStatus = 'BREACH';
  } else if (depositToCoreCapitalRatio >= maxMultiplier * 0.9) {
    // Over 90% of statutory ceiling (i.e. >= 13.5x)
    complianceStatus = 'WARNING';
  }

  // Member-wise aggregation for concentration risk
  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  const memberDepositMap = new Map<string, { total: number; count: number }>();
  savings.forEach((s) => {
    const memId = s.memberId || 'UNKNOWN_MEMBER';
    const existing = memberDepositMap.get(memId) || { total: 0, count: 0 };
    memberDepositMap.set(memId, {
      total: existing.total + s.balance,
      count: existing.count + 1,
    });
  });

  const depositors: DepositorProfile[] = [];
  memberDepositMap.forEach((val, memberId) => {
    const mem = memberMap.get(memberId);
    const sharePercent =
      totalDepositLiability > 0
        ? Number(((val.total / totalDepositLiability) * 100).toFixed(2))
        : 0;

    depositors.push({
      memberId,
      memberNo: mem?.memberNo || 'UKO-UNKNOWN',
      memberName: mem?.name || 'Unknown Member',
      totalDepositBalance: val.total,
      accountCount: val.count,
      depositSharePercent: sharePercent,
      isConcentrationRisk: sharePercent > singleDepositorCap,
    });
  });

  // Sort descending by balance
  depositors.sort((a, b) => b.totalDepositBalance - a.totalDepositBalance);

  const flaggedConcentratedMembersCount = depositors.filter((d) => d.isConcentrationRisk).length;

  // Calculate HHI Index
  const hhiIndex = Number(
    depositors.reduce((sum, d) => sum + Math.pow(d.depositSharePercent, 2), 0).toFixed(2)
  );

  // Product-wise breakdown
  const productMap = new Map<string, { total: number; count: number }>();
  savings.forEach((s) => {
    const existing = productMap.get(s.accountType) || { total: 0, count: 0 };
    productMap.set(s.accountType, {
      total: existing.total + s.balance,
      count: existing.count + 1,
    });
  });

  const productSummaries: ProductDepositSummary[] = [];
  productMap.forEach((val, accountType) => {
    const sharePercent =
      totalDepositLiability > 0
        ? Number(((val.total / totalDepositLiability) * 100).toFixed(2))
        : 0;
    productSummaries.push({
      accountType,
      totalBalance: val.total,
      accountCount: val.count,
      sharePercent,
    });
  });

  productSummaries.sort((a, b) => b.totalBalance - a.totalBalance);

  return {
    coreCapital: capital,
    totalCoreCapital,
    totalDepositLiability,
    maxStatutoryDepositCeiling,
    depositToCoreCapitalRatio,
    maxAllowedRatio: maxMultiplier,
    headroomCapacity,
    headroomUtilizationPercent,
    isCeilingCompliant,
    complianceStatus,
    singleDepositorLimitPercent: singleDepositorCap,
    topDepositors: depositors.slice(0, 20),
    flaggedConcentratedMembersCount,
    hhiIndex,
    productSummaries,
  };
}

/**
 * Simulates deposit growth or share capital expansion
 */
export function simulateDepositExpansion(
  baseline: DepositCeilingAnalysis,
  additionalDeposits: number,
  additionalShareCapital = 0
): DepositCeilingAnalysis {
  const revisedCapital: CapitalComponents = {
    ...baseline.coreCapital,
    paidUpShareCapital: baseline.coreCapital.paidUpShareCapital + additionalShareCapital,
  };

  const newTotalCoreCapital =
    revisedCapital.paidUpShareCapital +
    revisedCapital.generalReserveFund +
    revisedCapital.capitalReserveFund +
    revisedCapital.undividedProfit;

  const newTotalDeposits = Math.max(0, baseline.totalDepositLiability + additionalDeposits);
  const newCeiling = Number((newTotalCoreCapital * baseline.maxAllowedRatio).toFixed(2));
  const newRatio =
    newTotalCoreCapital > 0 ? Number((newTotalDeposits / newTotalCoreCapital).toFixed(2)) : 0;
  const newHeadroom = Number((newCeiling - newTotalDeposits).toFixed(2));
  const newUtilization =
    newCeiling > 0 ? Number(((newTotalDeposits / newCeiling) * 100).toFixed(2)) : 0;

  const isCompliant = newTotalDeposits <= newCeiling;
  let status: 'COMPLIANT' | 'WARNING' | 'BREACH' = 'COMPLIANT';
  if (!isCompliant) {
    status = 'BREACH';
  } else if (newRatio >= baseline.maxAllowedRatio * 0.9) {
    status = 'WARNING';
  }

  return {
    ...baseline,
    coreCapital: revisedCapital,
    totalCoreCapital: newTotalCoreCapital,
    totalDepositLiability: newTotalDeposits,
    maxStatutoryDepositCeiling: newCeiling,
    depositToCoreCapitalRatio: newRatio,
    headroomCapacity: newHeadroom,
    headroomUtilizationPercent: newUtilization,
    isCeilingCompliant: isCompliant,
    complianceStatus: status,
  };
}

/**
 * Generates official CSV export string for Department of Cooperatives filing
 */
export function generateDepositCeilingCsv(
  analysis: DepositCeilingAnalysis,
  coopName = 'उनको बचत तथा ऋण सहकारी संस्था लि.'
): string {
  const lines: string[] = [];

  lines.push(`"${coopName}"`);
  lines.push(`"सहकारी ऐन २०७४ दफा ४९(१) बमोजिम निक्षेप संकलन सीमा (१५ गुणा) तथा पूँजी पर्याप्तता प्रतिवेदन"`);
  lines.push(`"उत्पादन मिति: ${new Date().toISOString().split('T')[0]}"`);
  lines.push('');
  lines.push(`"प्राथमिक पूँजी कोष (Core Capital)",${analysis.totalCoreCapital}`);
  lines.push(`"चुक्ता शेयर पूँजी",${analysis.coreCapital.paidUpShareCapital}`);
  lines.push(`"साधारण जगेडा कोष",${analysis.coreCapital.generalReserveFund}`);
  lines.push(`"पूँजीगत जगेडा कोष",${analysis.coreCapital.capitalReserveFund}`);
  lines.push(`"अविभाजित नाफा/घाटा",${analysis.coreCapital.undividedProfit}`);
  lines.push(`"कुल सदस्य निक्षेप दायित्व",${analysis.totalDepositLiability}`);
  lines.push(`"कानूनी अधिकतम निक्षेप सीमा (१५ गुणा)",${analysis.maxStatutoryDepositCeiling}`);
  lines.push(`"हालको निक्षेप-पूँजी अनुपात (Ratio)",${analysis.depositToCoreCapitalRatio}x`);
  lines.push(`"उपलब्ध निक्षेप संकलन क्षमता (Headroom)",${analysis.headroomCapacity}`);
  lines.push(`"क्षमता उपयोग प्रतिशत (Utilization %)",${analysis.headroomUtilizationPercent}%`);
  lines.push(`"कानूनी अनुपालन स्थिति",${analysis.isCeilingCompliant ? 'COMPLIANT' : 'BREACH'}`);
  lines.push('');
  lines.push('"क्र.सं.","सदस्य नं.","सदस्यको नाम","जम्मा निक्षेप रकम (NPR)","खाता संख्या","निक्षेप हिस्सा %","१०% सीमा जोखिम"');

  analysis.topDepositors.forEach((d, idx) => {
    lines.push(
      `${idx + 1},${d.memberNo},"${d.memberName}",${d.totalDepositBalance},${d.accountCount},${
        d.depositSharePercent
      }%,${d.isConcentrationRisk ? 'YES' : 'NO'}`
    );
  });

  return lines.join('\n');
}

/**
 * Triggers browser download of Section 49 Deposit Ceiling CSV
 */
export function downloadDepositCeilingCsv(
  analysis: DepositCeilingAnalysis,
  coopName?: string
): void {
  const csv = generateDepositCeilingCsv(analysis, coopName);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `UNAKO-DEPOSIT-CEILING-SEC49-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
