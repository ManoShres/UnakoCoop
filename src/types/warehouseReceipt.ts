/**
 * Unako SACCOS - Warehouse Receipt Financing & Crop Pledge Domain Types
 * (अन्न गोदाम रसिद तथा कृषि उपज धितो कर्जा प्रणाली)
 *
 * Designed for Dang & Lumbini grain belt smallholder farmers:
 * - Paddy (धान), Mustard (तोरी), Maize (मकै), Wheat (गहुँ), Lentils (मुसुरो)
 * - Safe LTV: Up to 70% of current mandi wholesale market price
 * - Statutory Storage Fee: NPR 25 - 40 / quintal / month
 */

export type CommodityType =
  | 'PADDY_DHAN'      // धान (Subarna / Sona Mansuli / Basmati)
  | 'MUSTARD_TORI'    // तोरी (Yellow / Black Mustard)
  | 'MAIZE_MAKAI'     // मकै (Deuti / Rampur Composite)
  | 'WHEAT_GAHU'      // गहुँ (Vijay / Gautam)
  | 'LENTIL_DAAL';    // मुसुरो / दाल (Lentils)

export type CommodityGrade = 'GRADE_A' | 'GRADE_B' | 'GRADE_C';

export type WarehouseReceiptStatus =
  | 'STORED'            // भण्डारण गरिएको (No loan taken yet)
  | 'PLEDGED'           // धितोमा राखिएको (Active pledge loan taken)
  | 'RELEASED'          // फिर्ता लगिएको (Loan paid, farmer withdrew crop)
  | 'LIQUIDATED_SOLD';  // बजार बिक्री गरिएको (Coop sold at peak, settled loan)

export interface CommoditySpecification {
  readonly type: CommodityType;
  readonly nameNepali: string;
  readonly nameEnglish: string;
  readonly standardMoistureMaxPercent: number; // e.g. 14% for Paddy
  readonly currentMarketRatePerQuintal: number; // In NPR
  readonly unit: 'QUINTAL' | 'KG' | 'BAG';
  readonly standardBagWeightKg: number; // e.g. 50 kg / bag
}

export interface QualityInspectionResult {
  readonly moisturePercent: number;
  readonly foreignMatterPercent: number;
  readonly grade: CommodityGrade;
  readonly isMoistureAcceptable: boolean;
  readonly rateAdjustmentFactor: number; // e.g. 1.0 for Grade A, 0.95 for Grade B, 0.88 for Grade C
  readonly inspectorNotes: string;
}

export interface WarehouseReceipt {
  readonly id: string; // e.g. "whr-001"
  readonly receiptNo: string; // e.g. "WHR-2081-0042"
  readonly memberId: string;
  readonly memberName: string;
  readonly memberNo: string;
  readonly memberPhone: string;
  readonly commodity: CommodityType;
  readonly varietyName: string; // e.g. "सोना मन्सुली (Sona Mansuli)"
  readonly bagCount: number;
  readonly netWeightQuintals: number; // 1 quintal = 100 kg
  readonly storageLocation: string; // e.g. "गढवा केन्द्रीय गोदाम (Silo A-4)"
  readonly qualityInspection: QualityInspectionResult;
  readonly baseMarketRatePerQuintal: number;
  readonly effectiveRatePerQuintal: number;
  readonly totalMarketValuation: number;
  readonly maxEligiblePledgeLoanAmount: number; // 70% of valuation
  readonly storageMonthlyChargePerQuintal: number; // NPR 25 / quintal
  readonly depositDate: string; // YYYY-MM-DD (BS or AD)
  readonly expiryDate: string; // 6 to 9 months valid
  readonly status: WarehouseReceiptStatus;
  readonly activeLoanId?: string;
  readonly createdAt: string;
}

export interface WarehousePledgeLoan {
  readonly id: string; // e.g. "wln-001"
  readonly loanNo: string; // e.g. "CROP-LN-2081-0019"
  readonly receiptId: string;
  readonly receiptNo: string;
  readonly memberId: string;
  readonly memberName: string;
  readonly principalDisbursed: number;
  readonly annualInterestRate: number; // e.g. 8.5%
  readonly disbursedDate: string;
  readonly dueDate: string;
  readonly tenureMonths: number;
  readonly monthlyStorageRatePerQuintal: number;
  readonly savingsAccountNo: string;
  readonly status: 'ACTIVE' | 'SETTLED' | 'DEFAULTED';
  readonly notes?: string;
}

export interface HarvestLiquidationParams {
  readonly receipt: WarehouseReceipt;
  readonly pledgeLoan?: WarehousePledgeLoan;
  readonly actualSaleRatePerQuintal: number;
  readonly saleDate: string;
  readonly buyerName: string;
}

export interface HarvestLiquidationResult {
  readonly receiptNo: string;
  readonly memberId: string;
  readonly memberName: string;
  readonly netWeightQuintals: number;
  readonly saleRatePerQuintal: number;
  readonly grossSaleRevenue: number;
  readonly loanPrincipalDeducted: number;
  readonly loanInterestDeducted: number;
  readonly storageChargesDeducted: number;
  readonly totalDeductions: number;
  readonly netSurplusPayableToMember: number;
  readonly transactionRef: string;
  readonly summaryNe: string;
}
