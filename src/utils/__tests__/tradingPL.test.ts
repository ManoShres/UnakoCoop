import { describe, it, expect } from 'vitest';
import {
  filterTradingTransactions,
  calculateTradingPL,
  generateTradingCsv,
  TRADING_TYPE_GROUP,
  TRADING_TYPE_LABELS,
} from '../tradingPL';
import type { TradingTransaction } from '../../types';

describe('Trading P&L Utility', () => {
  const sampleTransactions: TradingTransaction[] = [
    {
      id: 'trade-1',
      date: '2024-02-01',
      type: 'FX_GAIN',
      description: 'Remittance USD exchange spread',
      category: 'FOREIGN_EXCHANGE',
      amountInNPR: 45000,
      recordedBy: 'acc-1',
      status: 'COMPLETED',
      createdAt: '2024-02-01',
    },
    {
      id: 'trade-2',
      date: '2024-02-10',
      type: 'EXPENSE',
      description: 'Bank processing fee for RTGS',
      category: 'OPERATING_EXPENSE',
      amountInNPR: 12000,
      recordedBy: 'acc-1',
      status: 'COMPLETED',
      createdAt: '2024-02-10',
    },
    {
      id: 'trade-3',
      date: '2024-02-15',
      type: 'PURCHASE',
      description: 'Government Treasury Bill subscription',
      category: 'INVESTMENT',
      amountInNPR: 500000,
      recordedBy: 'acc-1',
      status: 'COMPLETED',
      createdAt: '2024-02-15',
    },
    {
      id: 'trade-4',
      date: '2024-02-20',
      type: 'DIVIDEND_INCOME',
      description: 'Annual dividend from Nabil Bank shares',
      category: 'INVESTMENT',
      amountInNPR: 80000,
      recordedBy: 'acc-1',
      status: 'VOID',
      createdAt: '2024-02-20',
    },
  ];

  it('filters out VOID transactions by default', () => {
    const filtered = filterTradingTransactions(sampleTransactions);
    expect(filtered).toHaveLength(3);
    expect(filtered.some((tx) => tx.status === 'VOID')).toBe(false);
  });

  it('includes VOID transactions when includeVoid is true', () => {
    const filtered = filterTradingTransactions(sampleTransactions, { includeVoid: true });
    expect(filtered).toHaveLength(4);
  });

  it('filters by category and date range', () => {
    const filtered = filterTradingTransactions(sampleTransactions, {
      category: 'FOREIGN_EXCHANGE',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('trade-1');
  });

  it('calculates trading P&L correctly', () => {
    const pl = calculateTradingPL(sampleTransactions);
    // Income: FX_GAIN (45,000)
    // Cost: EXPENSE (12,000)
    // Net: 45,000 - 12,000 = 33,000
    // Purchases: 500,000
    expect(pl.totalIncome).toBe(45000);
    expect(pl.totalCost).toBe(12000);
    expect(pl.netPL).toBe(33000);
    expect(pl.totalPurchases).toBe(500000);
    expect(pl.totalSales).toBe(0);
    expect(pl.transactionCount).toBe(3);
    expect(pl.plPercent).toBeCloseTo(275, 0); // 33,000 / 12,000 * 100 = 275%
  });

  it('generates well-formed CSV export', () => {
    const csv = generateTradingCsv(sampleTransactions.slice(0, 2));
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Date,Type,Category,Description');
    expect(lines[1]).toContain('FX_GAIN');
    expect(lines[2]).toContain('EXPENSE');
  });

  it('provides bilingual labels and correct PL grouping', () => {
    expect(TRADING_TYPE_GROUP.DIVIDEND_INCOME).toBe('INCOME');
    expect(TRADING_TYPE_GROUP.EXPENSE).toBe('COST');
    expect(TRADING_TYPE_GROUP.PURCHASE).toBe('TRADE');

    expect(TRADING_TYPE_LABELS.FX_GAIN.en).toBe('Foreign Exchange Gain');
    expect(TRADING_TYPE_LABELS.FX_GAIN.ne).toBe('विदेशी मुद्रा नाफा');
  });
});
