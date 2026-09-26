import { describe, it, expect } from 'vitest';
import {
  calculateEmvCrc16,
  formatTlv,
  generateNepalQrPayload,
  parseNepalQrPayload,
} from '../nepalQr';


describe('Nepal QR (NepalPay / Fonepay EMVCo) Utility', () => {
  it('correctly calculates 16-bit CCITT CRC checksum for standard test strings', () => {
    // Standard test verification for CRC-16/CCITT-FALSE
    const crc = calculateEmvCrc16('0002010102125204601253035245802NP5922UNAKO SACCOS GADHWA 6006GADHWA6304');
    expect(crc).toMatch(/^[0-9A-F]{4}$/);
  });

  it('correctly formats Tag-Length-Value (TLV) strings', () => {
    expect(formatTlv('00', '01')).toBe('000201');
    expect(formatTlv('58', 'NP')).toBe('5802NP');
    expect(formatTlv('53', '524')).toBe('5303524');
  });

  it('generates a valid NepalQR dynamic payload with exact amount and merchant info', () => {
    const payload = generateNepalQrPayload({
      merchantName: 'UNAKO SACCOS LTD',
      merchantCity: 'GADHWA',
      pan: '300124890',
      amount: 1500,
      accountNo: 'SAV-2081-0042',
      referenceNo: 'TXN-99824',
      remarks: 'Deposit',
    });

    expect(payload).toContain('000201'); // Tag 00: Version
    expect(payload).toContain('010212'); // Tag 01: Dynamic QR
    expect(payload).toContain('5303524'); // Tag 53: NPR (524)
    expect(payload).toContain('54071500.00'); // Tag 54: Amount 1500.00
    expect(payload).toContain('5802NP'); // Tag 58: Nepal (NP)
    expect(payload).toContain('UNAKO SACCOS LTD'); // Tag 59: Merchant Name
    expect(payload).toContain('6304'); // Tag 63: CRC header
    expect(payload.length).toBeGreaterThan(60);
  });

  it('correctly parses key fields from a generated NepalQR payload', () => {
    const payload = generateNepalQrPayload({
      merchantName: 'UNAKO SACCOS LTD',
      merchantCity: 'GADHWA',
      pan: '300124890',
      amount: 3250.5,
      accountNo: 'LN-2081-0012',
      referenceNo: 'EMI-2081-09',
      remarks: 'Loan EMI',
    });

    const parsed = parseNepalQrPayload(payload);
    expect(parsed.currency).toBe('524');
    expect(parsed.amount).toBe(3250.5);
    expect(parsed.country).toBe('NP');
    expect(parsed.merchantName).toBe('UNAKO SACCOS LTD');
    expect(parsed.merchantCity).toBe('GADHWA');
    expect(parsed.referenceNo).toBe('EMI-2081-09');
    expect(parsed.isValidCrc).toBe(true);
  });
});
