import { describe, it, expect } from 'vitest';
import {
  toNepaliDigits,
  toWesternDigits,
  formatNPR,
  formatCurrency,
  formatCount,
  formatBSDate,
  getFiscalYear,
  NEPALI_MONTHS_BS,
} from '../nepaliDate';

describe('Nepali Date & Number Utilities', () => {
  it('converts western digits to Nepali Devanagari script', () => {
    expect(toNepaliDigits(1234567890)).toBe('१२३४५६७८९०');
    expect(toNepaliDigits('2081-11-14')).toBe('२०८१-११-१४');
  });

  it('converts Nepali digits back to western digits', () => {
    expect(toWesternDigits('१२३४५६७८९०')).toBe('1234567890');
    expect(toWesternDigits('२०८१-११-१४')).toBe('2081-11-14');
  });

  it('formats NPR currency using South Asian numbering system', () => {
    expect(formatNPR(184500)).toBe('NPR 1,84,500');
    expect(formatNPR(10000000)).toBe('NPR 1,00,00,000');
    expect(formatNPR(500)).toBe('NPR 500');
  });

  it('formats NPR with Nepali script when useNepaliDigits is true', () => {
    expect(formatNPR(184500, true)).toBe('रु १,८४,५००');
    expect(formatNPR(184500, true, 'रकम')).toBe('रकम १,८४,५००');
  });

  it('handles negative amounts and decimals correctly', () => {
    expect(formatNPR(-5000)).toBe('NPR -5,000');
    expect(formatNPR(1250.75)).toBe('NPR 1,250.75');
  });

  it('formats currency with compact mode', () => {
    expect(formatCurrency(1500.8, false, 'NPR', true)).toBe('NPR 1,501');
    expect(formatCurrency(1500.8, true, 'NPR', true)).toBe('रु १,५०१');
  });

  it('formats integer count with Indian/Nepalese comma grouping', () => {
    expect(formatCount(12500, false)).toBe('12,500');
    expect(formatCount(12500, true)).toBe('१२,५००');
    expect(formatCount(250, false)).toBe('250');
  });

  it('formats Bikram Sambat date into readable Nepali and English', () => {
    expect(formatBSDate('2081-11-14', 'np')).toBe('२०८१ फागुन १४');
    expect(formatBSDate('2081-11-14', 'en')).toBe('Falgun 14, 2081 B.S.');
    expect(formatBSDate('invalid-date', 'np')).toBe('invalid-date');
  });

  it('calculates the Nepalese SACCOS fiscal year correctly', () => {
    // Month >= 4 (Shrawan onwards)
    expect(getFiscalYear(2081, 4)).toBe('2081/82');
    expect(getFiscalYear(2081, 11)).toBe('2081/82');
    // Month < 4 (Baisakh to Ashad)
    expect(getFiscalYear(2081, 1)).toBe('2080/81');
    expect(getFiscalYear(2081, 3)).toBe('2080/81');
  });

  it('contains 12 Nepali BS months', () => {
    expect(NEPALI_MONTHS_BS).toHaveLength(12);
    expect(NEPALI_MONTHS_BS[0].en).toBe('Baisakh');
    expect(NEPALI_MONTHS_BS[11].en).toBe('Chaitra');
  });
});
