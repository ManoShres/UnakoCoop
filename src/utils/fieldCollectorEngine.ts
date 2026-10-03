/**
 * Rural Field Collector Mobility Engine
 * Unako SACCOS - Gadhwa, Dang, Lumbini, Nepal
 *
 * Provides core logic for:
 * - Cash denomination counting for collector bags
 * - Cash handover reconciliation against CBS receipts
 * - Official field receipt sequential generation
 * - ESC/POS 58mm / 80mm mobile Bluetooth thermal slip formatting
 */

import {
  CashDenominationCount,
  FieldCollectionRecord,
  FieldHandoverReport,
  CoopSettings,
  EMPTY_DENOMINATION,
} from '../types';

export { EMPTY_DENOMINATION };


export interface WardInfo {
  wardNumber: number;
  nameNepali: string;
  nameEnglish: string;
}

export const DANG_GADHWA_WARDS: WardInfo[] = [
  { wardNumber: 1, nameNepali: 'गढवा बजार', nameEnglish: 'Gadhwa Bazar' },
  { wardNumber: 2, nameNepali: 'बेला', nameEnglish: 'Bela' },
  { wardNumber: 3, nameNepali: 'बनगाउँ', nameEnglish: 'Bangaun' },
  { wardNumber: 4, nameNepali: 'मलमला', nameEnglish: 'Malmala' },
  { wardNumber: 5, nameNepali: 'गोबरडिहा', nameEnglish: 'Gobardiha' },
  { wardNumber: 6, nameNepali: 'गङ्गापरसपुर', nameEnglish: 'Gangaparaspur' },
  { wardNumber: 7, nameNepali: 'खडकपुर', nameEnglish: 'Khadagpur' },
  { wardNumber: 8, nameNepali: 'कोईलाबास', nameEnglish: 'Koilabash' },
];

/**
 * Calculates total physical cash in rupee denominations inside collector bag
 */
export function calculateDenominationTotal(counts: CashDenominationCount): number {
  return (
    (counts.n1000 || 0) * 1000 +
    (counts.n500 || 0) * 500 +
    (counts.n100 || 0) * 100 +
    (counts.n50 || 0) * 50 +
    (counts.n20 || 0) * 20 +
    (counts.n10 || 0) * 10 +
    (counts.n5 || 0) * 5 +
    (counts.n2_1 || 0) * 2
  );
}

/**
 * Reconciles day-end cash handover between bag cash and recorded field receipts
 */
export function reconcileCashHandover(
  systemTotalAmount: number,
  denominations: CashDenominationCount,
  collectorNo: string,
  collectorName: string,
  dateBS: string,
  totalReceiptsCount: number,
  verifiedBy?: string
): FieldHandoverReport {
  const cashInBagAmount = calculateDenominationTotal(denominations);
  const discrepancy = cashInBagAmount - systemTotalAmount;

  let status: 'BALANCED' | 'SHORTAGE' | 'SURPLUS' = 'BALANCED';
  if (discrepancy < 0) {
    status = 'SHORTAGE';
  } else if (discrepancy > 0) {
    status = 'SURPLUS';
  }

  return {
    dateBS,
    collectorNo,
    collectorName,
    totalReceiptsCount,
    systemTotalAmount,
    cashInBagAmount,
    discrepancy,
    status,
    denominations: { ...denominations },
    verifiedBy,
  };
}

/**
 * Generates an official sequential field receipt number
 */
export function generateFieldReceiptNumber(dateBS: string, seq: number): string {
  const cleanDate = dateBS.replace(/[^\d]/g, '');
  const seqFormatted = seq.toString().padStart(4, '0');
  return `FLD-${cleanDate}-${seqFormatted}`;
}

/**
 * Formats ESC/POS 58mm / 80mm thermal receipt slip for field collection
 */
export function formatFieldThermalEscPosReceipt(
  record: FieldCollectionRecord,
  coopSettings: CoopSettings
): string {
  const div = '--------------------------------';
  const lines = [
    coopSettings.nameNepali,
    coopSettings.name,
    coopSettings.address,
    `दर्ता नं: ${coopSettings.regNo} | पान: ${coopSettings.panNo}`,
    div,
    '*** फिल्ड संकलन रसिद (FIELD RECEIPT) ***',
    `रसिद नं: ${record.receiptNo}`,
    `मिति: ${record.dateBS} (${record.timestamp})`,
    `स्थान: ${record.ward}`,
    `संकलक: ${record.collectorName} (${record.collectorNo})`,
    div,
    `सदस्य नं: ${record.memberNo}`,
    `सदस्य: ${record.memberName}`,
    `सम्पर्क: ${record.phone}`,
    div,
    `अनिवार्य बचत  : रु. ${record.breakdown.mandatorySavings.toLocaleString()}`,
    `ऐच्छिक बचत     : रु. ${record.breakdown.optionalSavings.toLocaleString()}`,
    `ऋण साँवा       : रु. ${record.breakdown.loanPrincipal.toLocaleString()}`,
    `ऋण ब्याज       : रु. ${record.breakdown.loanInterest.toLocaleString()}`,
    `अन्न गोदाम शुल्क: रु. ${record.breakdown.whrStorageFee.toLocaleString()}`,
    `सेयर किस्ता    : रु. ${record.breakdown.shareAmount.toLocaleString()}`,
    div,
    `कुल बुझाएको रकम: रु. ${record.totalAmount.toLocaleString('ne-NP')}`,
    `भुक्तानी माध्यम: ${record.paymentMode === 'CASH' ? 'नगद (Cash)' : 'नेपालपे क्यूआर'}`,
    div,
    '* यो अस्थायी फिल्ड संकलन रसिद हो।',
    '  केन्द्रीय सीबीएसमा प्रविष्टि भएपछि',
    '  पासबुकमा प्रमाणित गरिनेछ।',
    '',
    'सदस्यको दस्तखत: ................',
    'संकलकको दस्तखत: ................',
    '',
    'धन्यवाद ! उनाको साकोस परिवार',
  ];

  return lines.join('\n');
}
