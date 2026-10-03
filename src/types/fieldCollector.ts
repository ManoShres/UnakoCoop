/**
 * Types & Domain Models for Field Mobility App Mode (फिल्ड संकलक मोड)
 * Unako SACCOS - Gadhwa & Dang Rural Ward Collection
 */

export interface CashDenominationCount {
  n1000: number;
  n500: number;
  n100: number;
  n50: number;
  n20: number;
  n10: number;
  n5: number;
  n2_1: number;
}

export const EMPTY_DENOMINATION: CashDenominationCount = {
  n1000: 0,
  n500: 0,
  n100: 0,
  n50: 0,
  n20: 0,
  n10: 0,
  n5: 0,
  n2_1: 0,
};

export interface FieldCollectionBreakdown {
  mandatorySavings: number;
  optionalSavings: number;
  loanPrincipal: number;
  loanInterest: number;
  whrStorageFee: number;
  shareAmount: number;
}

export interface FieldCollectionRecord {
  id: string; // e.g. "FLD-2081-06-0001"
  receiptNo: string;
  memberId: string;
  memberNo: string;
  memberName: string;
  ward: string;
  phone: string;
  collectorNo: string;
  collectorName: string;
  dateBS: string;
  timestamp: string;
  breakdown: FieldCollectionBreakdown;
  totalAmount: number;
  paymentMode: 'CASH' | 'NEPAL_PAY_QR';
  gpsLocation?: {
    latitude: number;
    longitude: number;
    wardName: string;
  };
  synced: boolean;
  syncedAt?: string;
  cbsTxId?: string;
  remarks?: string;
}

export interface FieldHandoverReport {
  dateBS: string;
  collectorNo: string;
  collectorName: string;
  totalReceiptsCount: number;
  systemTotalAmount: number;
  cashInBagAmount: number;
  discrepancy: number; // cashInBagAmount - systemTotalAmount
  status: 'BALANCED' | 'SHORTAGE' | 'SURPLUS';
  denominations: CashDenominationCount;
  verifiedBy?: string;
}
