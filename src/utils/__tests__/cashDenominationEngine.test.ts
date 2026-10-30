import { describe, it, expect } from 'vitest';
import {
  calculateDenominations,
  validateDenominationMatch,
  getPrintableDenominations,
  NRB_DENOMINATIONS,
} from '../cashDenominationEngine';

describe('cashDenominationEngine', () => {
  it('correctly calculates total for empty or partial denomination counts', () => {
    const res = calculateDenominations({});
    expect(res.grandTotal).toBe(0);
    expect(res.totalNotes).toBe(0);
    expect(res.lines).toHaveLength(NRB_DENOMINATIONS.length);
  });

  it('accurately tallies standard note bundles', () => {
    // 50 x 1000 = 50,000; 20 x 500 = 10,000; 10 x 100 = 1,000 -> Total = 61,000
    const res = calculateDenominations({
      1000: 50,
      500: 20,
      100: 10,
    });

    expect(res.grandTotal).toBe(61000);
    expect(res.totalNotes).toBe(80);
    expect(res.activeDenominationsCount).toBe(3);
  });

  it('validates exact match between cash tally and requested amount', () => {
    const counts = { 1000: 10, 500: 4 }; // 10,000 + 2,000 = 12,000
    const match = validateDenominationMatch(counts, 12000);
    expect(match.matches).toBe(true);
    expect(match.diff).toBe(0);
    expect(match.isOver).toBe(false);
    expect(match.isShort).toBe(false);
  });

  it('detects cash overage and shortage correctly', () => {
    const counts = { 1000: 5 }; // 5,000
    const shortMatch = validateDenominationMatch(counts, 6000);
    expect(shortMatch.matches).toBe(false);
    expect(shortMatch.isShort).toBe(true);
    expect(shortMatch.diff).toBe(-1000);

    const overMatch = validateDenominationMatch(counts, 4000);
    expect(overMatch.matches).toBe(false);
    expect(overMatch.isOver).toBe(true);
    expect(overMatch.diff).toBe(1000);
  });

  it('filters and formats printable lines for thermal receipts', () => {
    const counts = { 1000: 5, 100: 3 };
    const printable = getPrintableDenominations(counts);
    expect(printable).toHaveLength(2);
    expect(printable[0].noteLabel).toBe('रु. 1000');
    expect(printable[0].countStr).toBe('5');
    expect(printable[1].noteLabel).toBe('रु. 100');
    expect(printable[1].countStr).toBe('3');
  });
});

