/**
/**
 * Passbook Security, Barcode/QR Generation, and Line-Printer Desk Engine
 * Unako SACCOS (उनको बचत तथा ऋण सहकारी संस्था लि.)
 * Compliance: Department of Cooperatives Passbook Standards & CBS Counter Directives
 */

import { Transaction } from '../types';

export type PassbookStatus = 'ACTIVE' | 'REPLACED_FULL' | 'LOST_STOLEN' | 'DAMAGED' | 'REVOKED';

export interface PassbookRecord {
  id: string;
  passbookNo: string;
  memberId: string;
  memberNo: string;
  memberName: string;
  accountNo: string;
  accountType: string;
  issueDateBS: string;
  issueDateAD: string;
  issuedBy: string;
  status: PassbookStatus;
  lastPrintedLine: number;
  lastPrintedPage: number;
  lastPrintedDate?: string;
  barcodePayload: string;
  securityChecksum: string;
  replacementFee?: number;
  notes?: string;
}

export interface PassbookPrintLine {
  lineNo: number;
  dateBS: string;
  particulars: string;
  chequeOrVoucherNo: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  initials: string;
  isSpacer?: boolean;
}

export interface PassbookPrintBatch {
  pageNo: number;
  startLine: number;
  linesPerPage: number;
  lines: PassbookPrintLine[];
  totalCredits: number;
  totalDebits: number;
  closingBalance: number;
}

export interface PassbookVerificationResult {
  isValid: boolean;
  status: PassbookStatus | 'UNKNOWN';
  parsedData?: {
    passbookNo: string;
    memberNo: string;
    accountNo: string;
    checksum: string;
  };
  matchedRecord?: PassbookRecord;
  isSecurityMatch: boolean;
  message: string;
  verifiedAt: string;
}

/**
 * Computes deterministic 32-bit CRC-style hex checksum from passbook identity
 */
export function generatePassbookChecksum(
  passbookNo: string,
  memberNo: string,
  accountNo: string
): string {
  const secretSalt = 'UNAKO_SACCOS_CBS_PASSBOOK_2081';
  const combined = `${passbookNo}|${memberNo}|${accountNo}|${secretSalt}`;
  let hash = 0x811c9dc5;

  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  // Convert to 8-character uppercase hex string
  const unsigned = hash >>> 0;
  return unsigned.toString(16).toUpperCase().padStart(8, '0');
}

/**
 * Generates barcode machine-readable payload string
 */
export function generateBarcodePayload(
  passbookNo: string,
  memberNo: string,
  accountNo: string
): string {
  const chk = generatePassbookChecksum(passbookNo, memberNo, accountNo);
  return `PB:${passbookNo}|MEM:${memberNo}|ACC:${accountNo}|CRC:${chk}`;
}

/**
 * Parses and verifies scanned Barcode / QR payload against active passbook records
 */
export function parseAndVerifyBarcode(
  payload: string,
  records: readonly PassbookRecord[]
): PassbookVerificationResult {
  const now = new Date().toISOString();
  const trimmed = payload.trim();

  let passbookNo = '';
  let memberNo = '';
  let accountNo = '';
  let scannedCrc = '';

  if (trimmed.includes('PB:') || trimmed.includes('|')) {
    const parts = trimmed.split('|');
    for (const part of parts) {
      const [key, val] = part.split(':');
      if (key === 'PB') passbookNo = val || '';
      else if (key === 'MEM') memberNo = val || '';
      else if (key === 'ACC') accountNo = val || '';
      else if (key === 'CRC') scannedCrc = val || '';
    }
  } else {
    // Direct passbook number scan
    passbookNo = trimmed;
  }

  if (!passbookNo) {
    return {
      isValid: false,
      status: 'UNKNOWN',
      isSecurityMatch: false,
      message: 'अमान्य बारकोड ढाँचा (Invalid Barcode/QR format)',
      verifiedAt: now,
    };
  }

  const matched = records.find(
    (r) => r.passbookNo.toLowerCase() === passbookNo.toLowerCase()
  );

  if (!matched) {
    return {
      isValid: false,
      status: 'UNKNOWN',
      isSecurityMatch: false,
      message: `पासबुक नं. ${passbookNo} प्रणालीमा फेला परेन (Passbook not found in CBS)`,
      verifiedAt: now,
    };
  }

  const expectedCrc = generatePassbookChecksum(
    matched.passbookNo,
    matched.memberNo,
    matched.accountNo
  );

  const isCrcValid = scannedCrc ? scannedCrc.toUpperCase() === expectedCrc : true;

  if (!isCrcValid) {
    return {
      isValid: false,
      status: matched.status,
      parsedData: {
        passbookNo,
        memberNo: memberNo || matched.memberNo,
        accountNo: accountNo || matched.accountNo,
        checksum: scannedCrc,
      },
      matchedRecord: matched,
      isSecurityMatch: false,
      message: 'प्रमाणीकरण असफल: डिजिटल चेकसम मेल खाएन (Security Checksum Mismatch / Tampered)',
      verifiedAt: now,
    };
  }

  if (matched.status === 'LOST_STOLEN') {
    return {
      isValid: false,
      status: 'LOST_STOLEN',
      matchedRecord: matched,
      isSecurityMatch: true,
      message: 'चेतावनी: यो पासबुक हराएको/चोरी भएको भनी दर्ता भएको छ! (Passbook reported Lost/Stolen)',
      verifiedAt: now,
    };
  }

  if (matched.status === 'REPLACED_FULL') {
    return {
      isValid: false,
      status: 'REPLACED_FULL',
      matchedRecord: matched,
      isSecurityMatch: true,
      message: 'सूचना: यो पासबुक पाना भरिएर नयाँ प्रतिस्थापन भइसकेको छ (Passbook Pages Full & Replaced)',
      verifiedAt: now,
    };
  }

  if (matched.status === 'REVOKED' || matched.status === 'DAMAGED') {
    return {
      isValid: false,
      status: matched.status,
      matchedRecord: matched,
      isSecurityMatch: true,
      message: `चेतावनी: पासबुक निष्क्रिय वा क्षति भएको छ (${matched.status})`,
      verifiedAt: now,
    };
  }

  return {
    isValid: true,
    status: 'ACTIVE',
    parsedData: {
      passbookNo: matched.passbookNo,
      memberNo: matched.memberNo,
      accountNo: matched.accountNo,
      checksum: expectedCrc,
    },
    matchedRecord: matched,
    isSecurityMatch: true,
    message: 'सफल प्रमाणीकरण: सक्रिय आधिकारिक पासबुक (Passbook Verified & Active)',
    verifiedAt: now,
  };
}

/**
 * Standard Code 39 Barcode SVG Generator
 * Generates pure vector SVG containing accurate wide and narrow bars
 */
const CODE39_PATTERNS: Record<string, string> = {
  '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
  '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
  '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
  'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
  'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
  'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
  'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
  'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
  'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
  '-': '010000101', '.': '110000100', ' ': '011000100', '*': '010010100',
  '$': '010101000', '/': '010100010', '+': '010001010', '%': '000101010',
};

export function generateBarcodeSvg(
  text: string,
  height = 50,
  showLabel = true
): string {
  const sanitized = `*${text.toUpperCase().replace(/[^0-9A-Z\-. $/+%]/g, '-') }*`;
  const narrowWidth = 2;
  const wideWidth = 5;
  const interGap = 2;

  let totalWidth = 20; // 10px quiet zone on each side
  const bars: Array<{ x: number; w: number }> = [];
  let currentX = 10;

  for (let c = 0; c < sanitized.length; c++) {
    const char = sanitized[c];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS['-'];

    for (let b = 0; b < 9; b++) {
      const isWide = pattern[b] === '1';
      const width = isWide ? wideWidth : narrowWidth;
      const isBar = b % 2 === 0;

      if (isBar) {
        bars.push({ x: currentX, w: width });
      }
      currentX += width;
    }
    currentX += interGap;
  }

  totalWidth = currentX + 8;
  const svgHeight = showLabel ? height + 18 : height;

  const rects = bars
    .map((bar) => `<rect x="${bar.x}" y="0" width="${bar.w}" height="${height}" fill="#0f172a" />`)
    .join('');

  const label = showLabel
    ? `<text x="${totalWidth / 2}" y="${height + 14}" font-family="monospace" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle" letter-spacing="2">${text}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${svgHeight}" width="${totalWidth}" height="${svgHeight}">${rects}${label}</svg>`;
}

/**
 * Pure Vector QR Code Matrix SVG Generator
 * Includes 3 standard corner finder patterns and timing grid
 */
export function generateQrCodeSvg(text: string, size = 120): string {
  const matrixSize = 25; // 25x25 matrix
  const cellSize = size / matrixSize;

  // Generate deterministic binary grid from input text hash
  const grid: boolean[][] = Array.from({ length: matrixSize }, () =>
    Array(matrixSize).fill(false)
  );

  // Helper to draw 7x7 Finder Pattern at (row, col)
  const drawFinder = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[startRow + r][startCol + c] = isBorder || isInner;
      }
    }
  };

  drawFinder(0, 0); // Top Left
  drawFinder(0, matrixSize - 7); // Top Right
  drawFinder(matrixSize - 7, 0); // Bottom Left

  // Timing lines
  for (let i = 8; i < matrixSize - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Data module hash fill
  let hashVal = 0;
  for (let i = 0; i < text.length; i++) {
    hashVal = (hashVal << 5) - hashVal + text.charCodeAt(i);
    hashVal |= 0;
  }

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Skip finders
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= matrixSize - 8;
      const inBottomLeft = r >= matrixSize - 8 && c < 8;
      const isTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming) {
        const bit = ((hashVal ^ (r * 31 + c * 17)) & (1 << ((r + c) % 16))) !== 0;
        grid[r][c] = bit;
      }
    }
  }

  let rects = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (grid[r][c]) {
        rects += `<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="#0f172a" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#ffffff" />${rects}</svg>`;
}

/**
 * Prepares Passbook continuous line-feed batch
 * Correctly pads spacer lines if starting from mid-page line (startLine > 1)
 */
export function preparePassbookPrintBatch(
  transactions: readonly Transaction[],
  startLine: number,
  linesPerPage = 20,
  initialBalance = 0
): PassbookPrintBatch {
  const safeStartLine = Math.max(1, Math.min(linesPerPage, startLine));
  const availableSlots = linesPerPage - safeStartLine + 1;
  const printTxs = transactions.slice(0, availableSlots);

  const lines: PassbookPrintLine[] = [];
  let currentBalance = initialBalance;
  let totalCredits = 0;
  let totalDebits = 0;

  // 1. Insert blank spacer lines for lines 1 to (safeStartLine - 1)
  for (let l = 1; l < safeStartLine; l++) {
    lines.push({
      lineNo: l,
      dateBS: '',
      particulars: '',
      chequeOrVoucherNo: '',
      debit: null,
      credit: null,
      balance: 0,
      initials: '',
      isSpacer: true,
    });
  }

  // 2. Append actual transactions
  for (let i = 0; i < printTxs.length; i++) {
    const tx = printTxs[i];
    const isCredit = tx.type === 'DEPOSIT' || tx.type === 'DIVIDEND';
    const creditAmt = isCredit ? tx.amount : null;
    const debitAmt = !isCredit ? tx.amount : null;

    if (isCredit) {
      currentBalance += tx.amount;
      totalCredits += tx.amount;
    } else {
      currentBalance -= tx.amount;
      totalDebits += tx.amount;
    }

    lines.push({
      lineNo: safeStartLine + i,
      dateBS: tx.date,
      particulars: tx.description,
      chequeOrVoucherNo: tx.referenceNo || `VCH-${tx.id.slice(-4)}`,
      debit: debitAmt,
      credit: creditAmt,
      balance: currentBalance,
      initials: 'UK',
      isSpacer: false,
    });
  }

  return {
    pageNo: 1,
    startLine: safeStartLine,
    linesPerPage,
    lines,
    totalCredits,
    totalDebits,
    closingBalance: currentBalance,
  };
}

/**
 * Issues a brand new passbook (immutable)
 */
export function issueNewPassbook(
  existingRecords: readonly PassbookRecord[],
  details: {
    memberId: string;
    memberNo: string;
    memberName: string;
    accountNo: string;
    accountType: string;
    issuedBy: string;
    notes?: string;
  },
  issueDateBS: string,
  issueDateAD: string
): { records: PassbookRecord[]; createdRecord: PassbookRecord } {
  const seq = (existingRecords.length + 1).toString().padStart(5, '0');
  const passbookNo = `PB-UNAKO-2081-${seq}`;
  const checksum = generatePassbookChecksum(passbookNo, details.memberNo, details.accountNo);
  const barcodePayload = generateBarcodePayload(passbookNo, details.memberNo, details.accountNo);

  const createdRecord: PassbookRecord = {
    id: `pb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    passbookNo,
    memberId: details.memberId,
    memberNo: details.memberNo,
    memberName: details.memberName,
    accountNo: details.accountNo,
    accountType: details.accountType,
    issueDateBS,
    issueDateAD,
    issuedBy: details.issuedBy,
    status: 'ACTIVE',
    lastPrintedLine: 0,
    lastPrintedPage: 1,
    barcodePayload,
    securityChecksum: checksum,
    replacementFee: 0,
    notes: details.notes || 'Normal issue',
  };

  return {
    records: [createdRecord, ...existingRecords],
    createdRecord,
  };
}

/**
 * Reissues a passbook (Lost/Stolen, Replaced Full, Damaged)
 * Sets old passbook status and charges standard replacement fee (NPR 100 for lost)
 */
export function reissuePassbook(
  existingRecords: readonly PassbookRecord[],
  previousRecordId: string,
  reason: 'LOST_STOLEN' | 'REPLACED_FULL' | 'DAMAGED',
  issuedBy: string,
  issueDateBS: string,
  issueDateAD: string,
  notes?: string
): { records: PassbookRecord[]; createdRecord: PassbookRecord } {
  const oldRec = existingRecords.find((r) => r.id === previousRecordId);
  if (!oldRec) {
    throw new Error(`Passbook record ${previousRecordId} not found.`);
  }

  const fee = reason === 'LOST_STOLEN' || reason === 'DAMAGED' ? 100 : 0;
  const seq = (existingRecords.length + 1).toString().padStart(5, '0');
  const newPassbookNo = `PB-UNAKO-2081-${seq}`;
  const checksum = generatePassbookChecksum(newPassbookNo, oldRec.memberNo, oldRec.accountNo);
  const barcodePayload = generateBarcodePayload(newPassbookNo, oldRec.memberNo, oldRec.accountNo);

  const updatedOldRecord: PassbookRecord = {
    ...oldRec,
    status: reason,
    notes: `${oldRec.notes || ''} | Replaced on ${issueDateBS}: ${reason}`,
  };

  const createdRecord: PassbookRecord = {
    id: `pb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    passbookNo: newPassbookNo,
    memberId: oldRec.memberId,
    memberNo: oldRec.memberNo,
    memberName: oldRec.memberName,
    accountNo: oldRec.accountNo,
    accountType: oldRec.accountType,
    issueDateBS,
    issueDateAD,
    issuedBy,
    status: 'ACTIVE',
    lastPrintedLine: 0,
    lastPrintedPage: reason === 'REPLACED_FULL' ? oldRec.lastPrintedPage + 1 : 1,
    barcodePayload,
    securityChecksum: checksum,
    replacementFee: fee,
    notes: notes || `Reissued due to ${reason}`,
  };

  const updatedRecords = existingRecords.map((r) =>
    r.id === previousRecordId ? updatedOldRecord : r
  );

  return {
    records: [createdRecord, ...updatedRecords],
    createdRecord,
  };
}

/**
 * Updates last printed line and page after physical print run
 */
export function updateLastPrintedState(
  records: readonly PassbookRecord[],
  passbookId: string,
  lastLine: number,
  pageNo: number,
  dateBS: string
): PassbookRecord[] {
  return records.map((r) => {
    if (r.id === passbookId) {
      return {
        ...r,
        lastPrintedLine: lastLine,
        lastPrintedPage: pageNo,
        lastPrintedDate: dateBS,
      };
    }
    return r;
  });
}

/**
 * Exports Passbook Register to CSV for compliance audits
 */
export function exportPassbookRegistryCsv(records: readonly PassbookRecord[]): string {
  const headers = [
    'Passbook No',
    'Member No',
    'Member Name',
    'Account No',
    'Account Type',
    'Status',
    'Issue Date BS',
    'Issue Date AD',
    'Issued By',
    'Last Printed Page',
    'Last Printed Line',
    'Replacement Fee (NPR)',
    'Checksum',
    'Notes',
  ];

  const escapeCell = (str: string | number | undefined | null) => {
    const val = str === null || str === undefined ? '' : String(str);
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const rows = records.map((r) =>
    [
      r.passbookNo,
      r.memberNo,
      r.memberName,
      r.accountNo,
      r.accountType,
      r.status,
      r.issueDateBS,
      r.issueDateAD,
      r.issuedBy,
      r.lastPrintedPage,
      r.lastPrintedLine,
      r.replacementFee || 0,
      r.securityChecksum,
      r.notes || '',
    ]
      .map(escapeCell)
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Realistic Mock Passbook Records for Unako SACCOS
 */
export const MOCK_PASSBOOK_REGISTRY: PassbookRecord[] = [
  {
    id: 'pb-001',
    passbookNo: 'PB-UNAKO-2081-00101',
    memberId: 'mem-1',
    memberNo: 'M-00101',
    memberName: 'रामबहादुर चौधरी',
    accountNo: '004-10294-88-01',
    accountType: 'नियमित बचत (Regular Savings)',
    issueDateBS: '2081-01-15',
    issueDateAD: '2024-04-28',
    issuedBy: 'हेमन्त श्रेष्ठ (Senior Teller)',
    status: 'ACTIVE',
    lastPrintedLine: 6,
    lastPrintedPage: 1,
    lastPrintedDate: '2081-06-10',
    barcodePayload: generateBarcodePayload('PB-UNAKO-2081-00101', 'M-00101', '004-10294-88-01'),
    securityChecksum: generatePassbookChecksum('PB-UNAKO-2081-00101', 'M-00101', '004-10294-88-01'),
    replacementFee: 0,
    notes: 'Initial issue upon registration',
  },
  {
    id: 'pb-002',
    passbookNo: 'PB-UNAKO-2081-00102',
    memberId: 'mem-1',
    memberNo: 'M-00101',
    memberName: 'रामबहादुर चौधरी',
    accountNo: '004-10294-88-02',
    accountType: 'अनिवार्य बचत (Compulsory Monthly)',
    issueDateBS: '2081-01-15',
    issueDateAD: '2024-04-28',
    issuedBy: 'हेमन्त श्रेष्ठ (Senior Teller)',
    status: 'ACTIVE',
    lastPrintedLine: 12,
    lastPrintedPage: 1,
    lastPrintedDate: '2081-06-05',
    barcodePayload: generateBarcodePayload('PB-UNAKO-2081-00102', 'M-00101', '004-10294-88-02'),
    securityChecksum: generatePassbookChecksum('PB-UNAKO-2081-00102', 'M-00101', '004-10294-88-02'),
    replacementFee: 0,
    notes: 'Compulsory passbook',
  },
  {
    id: 'pb-003',
    passbookNo: 'PB-UNAKO-2080-00088',
    memberId: 'mem-2',
    memberNo: 'M-00088',
    memberName: 'सीता देवी यादव',
    accountNo: '004-10294-88-03',
    accountType: 'महिला स्वावलम्बन बचत',
    issueDateBS: '2080-04-10',
    issueDateAD: '2023-07-26',
    issuedBy: 'सुनिता मगर (Teller)',
    status: 'LOST_STOLEN',
    lastPrintedLine: 18,
    lastPrintedPage: 1,
    lastPrintedDate: '2081-02-15',
    barcodePayload: generateBarcodePayload('PB-UNAKO-2080-00088', 'M-00088', '004-10294-88-03'),
    securityChecksum: generatePassbookChecksum('PB-UNAKO-2080-00088', 'M-00088', '004-10294-88-03'),
    replacementFee: 100,
    notes: 'Reported lost by member in market; blocked',
  },
  {
    id: 'pb-004',
    passbookNo: 'PB-UNAKO-2081-00199',
    memberId: 'mem-2',
    memberNo: 'M-00088',
    memberName: 'सीता देवी यादव',
    accountNo: '004-10294-88-03',
    accountType: 'महिला स्वावलम्बन बचत',
    issueDateBS: '2081-03-01',
    issueDateAD: '2024-06-15',
    issuedBy: 'हेमन्त श्रेष्ठ (Senior Teller)',
    status: 'ACTIVE',
    lastPrintedLine: 3,
    lastPrintedPage: 1,
    lastPrintedDate: '2081-06-01',
    barcodePayload: generateBarcodePayload('PB-UNAKO-2081-00199', 'M-00088', '004-10294-88-03'),
    securityChecksum: generatePassbookChecksum('PB-UNAKO-2081-00199', 'M-00088', '004-10294-88-03'),
    replacementFee: 100,
    notes: 'Reissued duplicate passbook after loss report',
  },
];
