/**
 * Trading Profit & Loss engine for investment, FX, commodity and fee activity.
 *
 * Classification follows the standard Nepalese SACCOS non-core income ledgers:
 *   INCOME  - FX gain, dividend, interest, capital gain, fee/commission income
 *   COST    - FX loss, capital loss, operating expense
 *   TRADE   - purchase / sale of investment or commodity positions
 */

import type { TradingTransaction, TradingType } from '../types';

export type TradingPLGroup = 'INCOME' | 'COST' | 'TRADE';

export const TRADING_TYPE_GROUP: Record<TradingType, TradingPLGroup> = {
  PURCHASE: 'TRADE',
  SALE: 'TRADE',
  FX_GAIN: 'INCOME',
  FX_LOSS: 'COST',
  DIVIDEND_INCOME: 'INCOME',
  INTEREST_INCOME: 'INCOME',
  CAPITAL_GAIN: 'INCOME',
  CAPITAL_LOSS: 'COST',
  FEE_INCOME: 'INCOME',
  EXPENSE: 'COST',
};

export const TRADING_TYPE_LABELS: Record<TradingType, { ne: string; en: string }> = {
  PURCHASE: { ne: 'खरिद (लगानी)', en: 'Purchase (Investment)' },
  SALE: { ne: 'बिक्री (लगानी)', en: 'Sale (Investment)' },
  FX_GAIN: { ne: 'विदेशी मुद्रा नाफा', en: 'Foreign Exchange Gain' },
  FX_LOSS: { ne: 'विदेशी मुद्रा घाटा', en: 'Foreign Exchange Loss' },
  DIVIDEND_INCOME: { ne: 'लाभांश आय', en: 'Dividend Income' },
  INTEREST_INCOME: { ne: 'ब्याज आय', en: 'Interest Income' },
  CAPITAL_GAIN: { ne: 'पुँजीगत नाफा', en: 'Capital Gain' },
  CAPITAL_LOSS: { ne: 'पुँजीगत घाटा', en: 'Capital Loss' },
  FEE_INCOME: { ne: 'सेवा शुल्क आय', en: 'Fee & Commission Income' },
  EXPENSE: { ne: 'सञ्चालन खर्च', en: 'Operating Expense' },
};

export interface TradingCategoryBreakdown {
  category: string;
  categoryNepali: string;
  income: number;
  cost: number;
  net: number;
  percentage: number;
}

export interface TradingPLSummary {
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalCost: number;
  totalPurchases: number;
  totalSales: number;
  netPL: number;
  /** Net P/L expressed as a return on the cost base (%). */
  plPercent: number;
  transactionCount: number;
  breakdown: TradingCategoryBreakdown[];
}

export interface TradingFilters {
  startDate?: string;
  endDate?: string;
  type?: TradingType | 'ALL';
  category?: TradingTransaction['category'] | 'ALL';
  includeVoid?: boolean;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

const CATEGORY_LABELS: Record<TradingTransaction['category'], string> = {
  INVESTMENT: 'Investment Portfolio',
  FOREIGN_EXCHANGE: 'Foreign Exchange Desk',
  COMMODITY: 'Commodity Trading',
  SERVICE_FEE: 'Service Fee & Commission',
  OPERATING_EXPENSE: 'Operating Expenses',
};

/** Filters transactions by date window, type, category and void status. */
export function filterTradingTransactions(
  transactions: TradingTransaction[],
  filters: TradingFilters = {}
): TradingTransaction[] {
  const { startDate, endDate, type = 'ALL', category = 'ALL', includeVoid = false } = filters;

  return transactions.filter((tx) => {
    if (!includeVoid && tx.status === 'VOID') return false;
    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;
    if (type !== 'ALL' && tx.type !== type) return false;
    if (category !== 'ALL' && tx.category !== category) return false;
    return true;
  });
}

/**
 * Computes the trading Profit & Loss summary for a filtered window.
 *
 * Purchases/sales are reported as turnover and do not enter the P/L line
 * directly; only realised gains, losses, income and expenses do.
 */
export function calculateTradingPL(
  transactions: TradingTransaction[],
  filters: TradingFilters = {}
): TradingPLSummary {
  const rows = filterTradingTransactions(transactions, filters);

  let totalIncome = 0;
  let totalCost = 0;
  let totalPurchases = 0;
  let totalSales = 0;

  const categoryBuckets = new Map<
    TradingTransaction['category'],
    { income: number; cost: number }
  >();

  rows.forEach((tx) => {
    const group = TRADING_TYPE_GROUP[tx.type];
    const amount = Math.abs(tx.amountInNPR);

    if (group === 'TRADE') {
      if (tx.type === 'PURCHASE') totalPurchases += amount;
      else totalSales += amount;
      return;
    }

    const bucket = categoryBuckets.get(tx.category) ?? { income: 0, cost: 0 };
    if (group === 'INCOME') {
      totalIncome += amount;
      bucket.income += amount;
    } else {
      totalCost += amount;
      bucket.cost += amount;
    }
    categoryBuckets.set(tx.category, bucket);
  });

  const netPL = totalIncome - totalCost;

  const breakdown: TradingCategoryBreakdown[] = Array.from(categoryBuckets.entries())
    .map(([category, bucket]) => ({
      category: CATEGORY_LABELS[category],
      categoryNepali: CATEGORY_LABELS_NEPALI[category],
      income: round2(bucket.income),
      cost: round2(bucket.cost),
      net: round2(bucket.income - bucket.cost),
      percentage:
        totalIncome + totalCost === 0
          ? 0
          : round2(((bucket.income + bucket.cost) / (totalIncome + totalCost)) * 100),
    }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));

  return {
    startDate: filters.startDate ?? '',
    endDate: filters.endDate ?? '',
    totalIncome: round2(totalIncome),
    totalCost: round2(totalCost),
    totalPurchases: round2(totalPurchases),
    totalSales: round2(totalSales),
    netPL: round2(netPL),
    plPercent: totalCost === 0 ? 0 : round2((netPL / totalCost) * 100),
    transactionCount: rows.length,
    breakdown,
  };
}

/** CSV export of the trading ledger for the current filter window. */
export function generateTradingCsv(transactions: TradingTransaction[]): string {
  const headers = [
    'Date',
    'Type',
    'Category',
    'Description',
    'Currency',
    'Exchange Rate',
    'Amount (NPR)',
    'Reference No',
    'Recorded By',
    'Status',
  ];
  const rows = transactions.map((tx) => [
    `"${tx.date}"`,
    `"${tx.type}"`,
    `"${tx.category}"`,
    `"${tx.description.replace(/"/g, "'")}"`,
    `"${tx.currency ?? 'NPR'}"`,
    tx.exchangeRate ?? 1,
    tx.amountInNPR,
    `"${tx.referenceNo ?? ''}"`,
    `"${tx.recordedByName ?? tx.recordedBy}"`,
    `"${tx.status}"`,
  ]);
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

const CATEGORY_LABELS_NEPALI: Record<TradingTransaction['category'], string> = {
  INVESTMENT: 'लगानी पोर्टफोलियो',
  FOREIGN_EXCHANGE: 'विदेशी मुद्रा डेस्क',
  COMMODITY: 'जिन्सी वस्तु व्यापार',
  SERVICE_FEE: 'सेवा शुल्क तथा कमिसन',
  OPERATING_EXPENSE: 'सञ्चालन खर्च',
};
