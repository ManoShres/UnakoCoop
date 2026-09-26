import { describe, it, expect } from 'vitest';
import {
  generateMemberSmartCardPayload,
  verifySmartCardPayload,
  calculateCardCrc16,
  generateBarcodeBars,
  getMemberQrImageUrl,
} from '../memberSmartCard';
import { Member, CoopSettings } from '../../types';

describe('Member Digital Smart Card Engine', () => {
  const mockCoopSettings: CoopSettings = {
    name: 'Unako Saving and Credit Cooperative Ltd.',
    nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
    regNo: '234/065/066',
    panNo: '302847591',
    address: 'Gadhwa-5, Dang, Lumbini, Nepal',
    phone: '+977-82-540123',
    email: 'info@unako.org.np',
    openingHours: '10:00 AM - 4:00 PM',
    operatingStatus: 'NORMAL',
  };

  const mockMember: Member = {
    id: 'm-1',
    memberNo: 'UK-88219',
    name: 'Radha Chaudhary',
    nameNepali: 'राधा चौधरी',
    email: 'radha@example.com',
    phone: '9847123456',
    citizenshipNo: '12-01-75-01234',
    nationalIdNo: 'NID-992182',
    joinedDate: '2075-01-10',
    address: 'Gadhwa Ward 5, Dang',
    wardNo: '5',
    district: 'Dang',
    gender: 'FEMALE',
    status: 'VERIFIED',
    avatarUrl: '',
    shareCapital: 25000,
    totalSavings: 45000,
    activeLoanBalance: 0,
    accruedDividend: 1200,
    creditScore: 820,
    bankDetails: { bankName: '', accountNo: '', branch: '', holderName: '' },
    kycDocuments: { citizenshipFront: true, citizenshipBack: true, photo: true, signature: true, utilityBill: true },
  };

  describe('Checksum & Payload Security', () => {
    it('calculates deterministic 4-character hex CRC16 checksum', () => {
      const crc1 = calculateCardCrc16('234/065/066:UK-88219:12-01-75-01234:VERIFIED');
      const crc2 = calculateCardCrc16('234/065/066:UK-88219:12-01-75-01234:VERIFIED');

      expect(crc1).toBe(crc2);
      expect(crc1.length).toBe(4);
      expect(typeof crc1).toBe('string');
    });

    it('generates a valid structured payload with metadata and checksum', () => {
      const payloadStr = generateMemberSmartCardPayload(mockMember, mockCoopSettings);
      const parsed = JSON.parse(payloadStr);

      expect(parsed.memberNo).toBe('UK-88219');
      expect(parsed.name).toBe('Radha Chaudhary');
      expect(parsed.citizenshipNo).toBe('12-01-75-01234');
      expect(parsed.nationalIdNo).toBe('NID-992182');
      expect(parsed.checksum).toBeDefined();
    });

    it('authenticates untampered card payload successfully', () => {
      const payloadStr = generateMemberSmartCardPayload(mockMember, mockCoopSettings);
      const verification = verifySmartCardPayload(payloadStr, mockCoopSettings.regNo);

      expect(verification.isValid).toBe(true);
      expect(verification.memberData?.memberNo).toBe('UK-88219');
      expect(verification.error).toBeUndefined();
    });

    it('rejects tampered or forged card payload with checksum mismatch', () => {
      const payloadStr = generateMemberSmartCardPayload(mockMember, mockCoopSettings);
      const tamperedObj = JSON.parse(payloadStr);

      // Maliciously change memberNo or status
      tamperedObj.memberNo = 'UK-99999';
      const tamperedStr = JSON.stringify(tamperedObj);

      const verification = verifySmartCardPayload(tamperedStr, mockCoopSettings.regNo);
      expect(verification.isValid).toBe(false);
      expect(verification.error).toContain('Tamper detected');
    });
  });

  describe('Barcode & QR Code Generation', () => {
    it('generates deterministic SVG barcode bars', () => {
      const bars = generateBarcodeBars(mockMember.memberNo, 240);

      expect(bars.length).toBeGreaterThan(5);
      expect(bars[0].x).toBeDefined();
      expect(bars[0].width).toBeGreaterThan(0);
      expect(bars.every((b) => b.x < 240)).toBe(true);
    });

    it('produces valid QR code endpoint URL', () => {
      const url = getMemberQrImageUrl('TEST-DATA', 200);
      expect(url).toContain('https://api.qrserver.com/v1/create-qr-code/');
      expect(url).toContain('size=200x200');
      expect(url).toContain('TEST-DATA');
    });
  });
});
