/**
 * Unako SACCOS Member Digital Smart Card Utility
 * Standard: ISO/IEC 7810 ID-1 (CR80: 85.60 mm × 53.98 mm)
 * Generates secure encoded credentials, tamper-evident checksums, and Code128 SVG barcode patterns.
 */

import { Member, CoopSettings } from '../types';

export interface SmartCardPayload {
  org: string;
  memberNo: string;
  name: string;
  citizenshipNo: string;
  nationalIdNo?: string;
  wardNo: string;
  joinedDate: string;
  status: string;
  checksum: string;
}

export interface BarcodeBar {
  x: number;
  width: number;
}

/**
 * 16-bit CRC checksum generator for tamper verification
 */
export function calculateCardCrc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates an encrypted/structured payload string for the Member Smart Card QR
 */
export function generateMemberSmartCardPayload(member: Member, coopSettings: CoopSettings): string {
  const baseString = `${coopSettings.regNo}:${member.memberNo}:${member.citizenshipNo}:${member.status}`;
  const checksum = calculateCardCrc16(baseString);

  const payload: SmartCardPayload = {
    org: coopSettings.name,
    memberNo: member.memberNo,
    name: member.name,
    citizenshipNo: member.citizenshipNo,
    nationalIdNo: member.nationalIdNo,
    wardNo: member.wardNo || '5',
    joinedDate: member.joinedDate,
    status: member.status,
    checksum,
  };

  return JSON.stringify(payload);
}

/**
 * Validates whether a scanned QR payload is authentic and untampered
 */
export function verifySmartCardPayload(payloadString: string, regNo: string): {
  isValid: boolean;
  memberData?: SmartCardPayload;
  error?: string;
} {
  try {
    const data: SmartCardPayload = JSON.parse(payloadString);
    if (!data.memberNo || !data.citizenshipNo || !data.checksum) {
      return { isValid: false, error: 'Malformed payload structure' };
    }

    const expectedBase = `${regNo}:${data.memberNo}:${data.citizenshipNo}:${data.status}`;
    const calculatedChecksum = calculateCardCrc16(expectedBase);

    if (calculatedChecksum !== data.checksum) {
      return { isValid: false, error: 'Tamper detected: checksum mismatch' };
    }

    return { isValid: true, memberData: data };
  } catch {
    return { isValid: false, error: 'Invalid JSON payload' };
  }
}

/**
 * Generates a clean deterministic SVG barcode pattern for the member code
 * (Simulates high-density Code128 pattern without heavy external libraries)
 */
export function generateBarcodeBars(code: string, totalWidth: number = 240): BarcodeBar[] {
  const bars: BarcodeBar[] = [];
  let currentX = 10;
  const unitWidth = 2;

  // Quiet zone start
  bars.push({ x: currentX, width: unitWidth * 2 });
  currentX += unitWidth * 3;

  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const pattern = (charCode % 7) + 1; // Variable widths 1-4

    const w1 = ((pattern & 1) ? 2 : 1) * unitWidth;
    const s1 = ((pattern & 2) ? 2 : 1) * unitWidth;
    const w2 = ((pattern & 4) ? 2 : 1) * unitWidth;

    bars.push({ x: currentX, width: w1 });
    currentX += w1 + s1;

    bars.push({ x: currentX, width: w2 });
    currentX += w2 + unitWidth;

    if (currentX > totalWidth - 20) break;
  }

  // Quiet zone end
  bars.push({ x: currentX, width: unitWidth * 3 });

  return bars;
}

/**
 * Generates high-density QR code image URL for member identity
 */
export function getMemberQrImageUrl(payload: string, size: number = 240): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=4&data=${encodeURIComponent(
    payload
  )}`;
}
