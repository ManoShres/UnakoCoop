/**
 * Nepal Rastra Bank (NRB) Cash Denomination Tally Engine (नगद गद्दी गणना इन्जिन)
 * Designed for CBS counter tellers, cash drawer closing (ढुकुटी मुचुल्का),
 * and thermal deposit slip breakdown.
 */

export const NRB_DENOMINATIONS = [1000, 500, 100, 50, 20, 10, 5, 2, 1] as const;
export type NrbDenomination = (typeof NRB_DENOMINATIONS)[number];

export type DenominationCountMap = Partial<Record<NrbDenomination, number>>;

export interface DenominationLine {
  denomination: NrbDenomination;
  count: number;
  subtotal: number;
}

export interface DenominationSummary {
  lines: DenominationLine[];
  grandTotal: number;
  totalNotes: number;
  activeDenominationsCount: number;
}

/**
 * Pure calculation of denomination counts, subtotals, and total cash
 */
export function calculateDenominations(counts: DenominationCountMap): DenominationSummary {
  let grandTotal = 0;
  let totalNotes = 0;
  let activeDenominationsCount = 0;

  const lines: DenominationLine[] = NRB_DENOMINATIONS.map((denom) => {
    const rawCount = counts[denom];
    const safeCount = typeof rawCount === 'number' && !isNaN(rawCount) && rawCount > 0
      ? Math.floor(rawCount)
      : 0;

    const subtotal = denom * safeCount;
    grandTotal += subtotal;
    totalNotes += safeCount;
    if (safeCount > 0) activeDenominationsCount += 1;

    return {
      denomination: denom,
      count: safeCount,
      subtotal,
    };
  });

  return {
    lines,
    grandTotal,
    totalNotes,
    activeDenominationsCount,
  };
}

/**
 * Validates whether the teller's physical cash count matches the slip transaction amount
 */
export function validateDenominationMatch(
  counts: DenominationCountMap,
  targetAmount: number
): {
  matches: boolean;
  diff: number;
  grandTotal: number;
  isOver: boolean;
  isShort: boolean;
} {
  const { grandTotal } = calculateDenominations(counts);
  const safeTarget = typeof targetAmount === 'number' && !isNaN(targetAmount) ? targetAmount : 0;
  const diff = grandTotal - safeTarget;

  return {
    matches: Math.abs(diff) < 0.001,
    diff,
    grandTotal,
    isOver: diff > 0.001,
    isShort: diff < -0.001,
  };
}

/**
 * Formats non-zero denomination lines for printing on thermal receipts
 */
export function getPrintableDenominations(counts: DenominationCountMap): {
  noteLabel: string;
  countStr: string;
  subtotalStr: string;
}[] {
  const { lines } = calculateDenominations(counts);
  return lines
    .filter((line) => line.count > 0)
    .map((line) => ({
      noteLabel: `रु. ${line.denomination}`,
      countStr: `${line.count}`,
      subtotalStr: `रु. ${line.subtotal.toLocaleString('ne-NP')}`,
    }));
}

