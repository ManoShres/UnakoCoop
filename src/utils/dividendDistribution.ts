import { Member } from '../types';
import { ProfitPayoutLine, DividendPayoutSummary, BonusSharePayoutSummary } from '../types/financial';

/**
 * Statutory Dividend Tax (TDS) rate per Nepal Income Tax Act 2058.
 * Cooperative member cash dividends are subject to 5% final withholding tax.
 */
export const STATUTORY_DIVIDEND_TAX_RATE = 0.05;

export interface SingleMemberDividendResult {
  grossAmount: number;
  taxDeduction: number;
  netPayable: number;
}

/**
 * Calculates single-member dividend with 5% statutory TDS.
 */
export function calculateMemberDividend(
  shareCapital: number,
  ratePercent: number,
  deductTax: boolean = true
): SingleMemberDividendResult {
  if (!shareCapital || shareCapital <= 0 || ratePercent <= 0) {
    return { grossAmount: 0, taxDeduction: 0, netPayable: 0 };
  }

  const grossAmount = Math.round((shareCapital * ratePercent) / 100);
  const taxDeduction = deductTax ? Math.round(grossAmount * STATUTORY_DIVIDEND_TAX_RATE) : 0;
  const netPayable = Math.max(0, grossAmount - taxDeduction);

  return { grossAmount, taxDeduction, netPayable };
}

export interface BulkDividendRow extends ProfitPayoutLine {
  shareKitta: number;
  grossDividend: number;
}

export interface BulkDividendCalculationResult {
  rows: BulkDividendRow[];
  summary: DividendPayoutSummary;
}

/**
 * Computes bulk dividend distribution across all eligible members.
 */
export function calculateBulkDividend(
  members: Member[],
  ratePercent: number,
  deductTax: boolean = true
): BulkDividendCalculationResult {
  const eligibleMembers = members.filter(
    (m) => (m.status === 'VERIFIED' || !m.status) && (m.shareCapital > 0 || (m.shareKitta && m.shareKitta > 0))
  );

  let totalGross = 0;
  let totalTaxWithheld = 0;
  let totalNet = 0;
  let totalShareCapital = 0;

  const rows: BulkDividendRow[] = eligibleMembers.map((m) => {
    const capital = m.shareCapital || (m.shareKitta ? m.shareKitta * 100 : 0);
    const kitta = m.shareKitta || Math.round(capital / 100);
    const { grossAmount, taxDeduction, netPayable } = calculateMemberDividend(capital, ratePercent, deductTax);

    totalGross += grossAmount;
    totalTaxWithheld += taxDeduction;
    totalNet += netPayable;
    totalShareCapital += capital;

    return {
      memberId: m.id,
      memberNo: m.memberNo,
      memberName: m.name,
      shareCapital: capital,
      shareKitta: kitta,
      grossDividend: grossAmount,
      dividendAmount: netPayable,
      patronageAmount: 0,
      taxDeduction,
      netPayable,
    };
  });

  return {
    rows,
    summary: {
      totalGross,
      totalTaxWithheld,
      totalNet,
      totalShareCapital,
      memberCount: rows.length,
    },
  };
}

export interface BonusShareRow {
  memberId: string;
  memberNo: string;
  memberName: string;
  currentKitta: number;
  currentCapital: number;
  bonusKitta: number;
  addedCapital: number;
  newTotalKitta: number;
  newTotalCapital: number;
}

export interface BulkBonusShareCalculationResult {
  rows: BonusShareRow[];
  summary: BonusSharePayoutSummary;
}

/**
 * Calculates bonus share allotment per member (capitalization of dividends/surplus into equity).
 */
export function calculateBonusShares(
  currentKitta: number,
  bonusPercent: number,
  parValue: number = 100
): { bonusKitta: number; addedCapital: number; newTotalKitta: number; newTotalCapital: number } {
  if (currentKitta <= 0 || bonusPercent <= 0) {
    return {
      bonusKitta: 0,
      addedCapital: 0,
      newTotalKitta: currentKitta,
      newTotalCapital: currentKitta * parValue,
    };
  }

  const bonusKitta = Math.floor((currentKitta * bonusPercent) / 100);
  const addedCapital = bonusKitta * parValue;
  const newTotalKitta = currentKitta + bonusKitta;
  const newTotalCapital = newTotalKitta * parValue;

  return { bonusKitta, addedCapital, newTotalKitta, newTotalCapital };
}

/**
 * Computes bulk bonus share distribution across all eligible members.
 */
export function calculateBulkBonusShares(
  members: Member[],
  bonusPercent: number,
  parValue: number = 100
): BulkBonusShareCalculationResult {
  const eligibleMembers = members.filter(
    (m) => (m.status === 'VERIFIED' || !m.status) && (m.shareCapital > 0 || (m.shareKitta && m.shareKitta > 0))
  );

  let totalBonusKitta = 0;
  let totalAddedCapital = 0;

  const rows: BonusShareRow[] = eligibleMembers.map((m) => {
    const kitta = m.shareKitta || Math.round((m.shareCapital || 0) / parValue);
    const { bonusKitta, addedCapital, newTotalKitta, newTotalCapital } = calculateBonusShares(kitta, bonusPercent, parValue);

    totalBonusKitta += bonusKitta;
    totalAddedCapital += addedCapital;

    return {
      memberId: m.id,
      memberNo: m.memberNo,
      memberName: m.name,
      currentKitta: kitta,
      currentCapital: kitta * parValue,
      bonusKitta,
      addedCapital,
      newTotalKitta,
      newTotalCapital,
    };
  });

  return {
    rows,
    summary: {
      totalBonusKitta,
      totalAddedCapital,
      memberCount: rows.length,
    },
  };
}

/**
 * Formats standard audit reference codes for dividend distributions.
 * Example: `DIV-208182-000104`
 */
export function buildDividendTransactionRef(fiscalYear: string, sequence: number): string {
  const cleanFy = (fiscalYear || '2081/82').replace(/[^0-9]/g, '');
  const seqStr = String(sequence).padStart(6, '0');
  return `DIV-${cleanFy}-${seqStr}`;
}

/**
 * Formats standard audit reference codes for bonus share allotments.
 * Example: `BSH-208182-000104`
 */
export function buildBonusShareTransactionRef(fiscalYear: string, sequence: number): string {
  const cleanFy = (fiscalYear || '2081/82').replace(/[^0-9]/g, '');
  const seqStr = String(sequence).padStart(6, '0');
  return `BSH-${cleanFy}-${seqStr}`;
}

/**
 * Generates CSV string for dividend distribution records.
 */
export function generateDividendRegisterCsv(
  rows: BulkDividendRow[],
  fiscalYear: string,
  ratePercent: number
): string {
  const headers = [
    'Member No',
    'Member Name',
    'Share Capital (NPR)',
    'Share Kitta',
    'Dividend Rate (%)',
    'Gross Dividend (NPR)',
    '5% TDS Deduction (NPR)',
    'Net Payable (NPR)',
    'Transaction Reference',
  ];

  const lines = rows.map((r) => [
    r.memberNo,
    `"${r.memberName.replace(/"/g, '""')}"`,
    r.shareCapital.toFixed(2),
    r.shareKitta,
    ratePercent.toFixed(1),
    r.grossDividend.toFixed(2),
    r.taxDeduction.toFixed(2),
    r.netPayable.toFixed(2),
    r.transactionRef || 'PENDING',
  ]);

  return [
    `# Unako SACCOS - Annual Dividend Distribution Register (FY ${fiscalYear})`,
    headers.join(','),
    ...lines.map((l) => l.join(',')),
  ].join('\n');
}
