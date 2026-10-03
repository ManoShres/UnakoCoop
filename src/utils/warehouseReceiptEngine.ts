/**
 * Unako SACCOS - Warehouse Receipt Financing & Crop Pledge Engine
 * (अन्न गोदाम रसिद तथा कृषि उपज धितो कर्जा हिसाब प्रणाली)
 *
 * Implements agricultural commodity warehousing, inspection, pledge LTV,
 * and peak market sale liquidation under Nepal Cooperative Act 2074 standards.
 */

import {
  CommodityType,
  CommodityGrade,
  CommoditySpecification,
  QualityInspectionResult,
  WarehouseReceipt,
  WarehousePledgeLoan,
  HarvestLiquidationParams,
  HarvestLiquidationResult,
} from '../types/warehouseReceipt';

export const COMMODITY_CATALOG: Record<CommodityType, CommoditySpecification> = {
  PADDY_DHAN: {
    type: 'PADDY_DHAN',
    nameNepali: 'धान (सोना मन्सुली / सुवर्ण)',
    nameEnglish: 'Paddy (Sona Mansuli / Subarna)',
    standardMoistureMaxPercent: 14.0,
    currentMarketRatePerQuintal: 3450,
    unit: 'QUINTAL',
    standardBagWeightKg: 50,
  },
  MUSTARD_TORI: {
    type: 'MUSTARD_TORI',
    nameNepali: 'तोरी (स्थानीय पहेँलो तोरी)',
    nameEnglish: 'Mustard (Local Yellow Mustard)',
    standardMoistureMaxPercent: 10.0,
    currentMarketRatePerQuintal: 8800,
    unit: 'QUINTAL',
    standardBagWeightKg: 50,
  },
  MAIZE_MAKAI: {
    type: 'MAIZE_MAKAI',
    nameNepali: 'मकै (देउती / हाइब्रिड)',
    nameEnglish: 'Maize (Deuti / Hybrid)',
    standardMoistureMaxPercent: 13.0,
    currentMarketRatePerQuintal: 3200,
    unit: 'QUINTAL',
    standardBagWeightKg: 50,
  },
  WHEAT_GAHU: {
    type: 'WHEAT_GAHU',
    nameNepali: 'गहुँ (विजय / गौतम उन्नत)',
    nameEnglish: 'Wheat (Vijay / Gautam)',
    standardMoistureMaxPercent: 12.0,
    currentMarketRatePerQuintal: 3650,
    unit: 'QUINTAL',
    standardBagWeightKg: 50,
  },
  LENTIL_DAAL: {
    type: 'LENTIL_DAAL',
    nameNepali: 'मुसुरो दाल (दाङ विशेष)',
    nameEnglish: 'Lentils (Dang Special Pulses)',
    standardMoistureMaxPercent: 11.0,
    currentMarketRatePerQuintal: 11500,
    unit: 'QUINTAL',
    standardBagWeightKg: 50,
  },
};

export const DEFAULT_STORAGE_FEE_PER_QUINTAL_MONTH = 25; // NPR 25 per quintal per month
export const DEFAULT_PLEDGE_LOAN_INTEREST_RATE = 8.5; // 8.5% annual concessional agro-rate
export const STATUTORY_MAX_PLEDGE_LTV_PERCENT = 70; // 70% of valuation

/**
 * Inspect commodity physical quality & assign grading
 */
export function inspectCommodityQuality(
  commodity: CommodityType,
  moisturePercent: number,
  foreignMatterPercent: number,
  notes = ''
): QualityInspectionResult {
  const spec = COMMODITY_CATALOG[commodity];
  const maxMoisture = spec.standardMoistureMaxPercent;

  // Unacceptable threshold: > standard + 3% (severe risk of rot/spoilage)
  if (moisturePercent > maxMoisture + 3.0) {
    return {
      moisturePercent,
      foreignMatterPercent,
      grade: 'GRADE_C',
      isMoistureAcceptable: false,
      rateAdjustmentFactor: 0.8,
      inspectorNotes: notes || `नमीको मात्रा (${moisturePercent}%) अधिकतम सीमाभन्दा बढी छ। सुकाएर ल्याउनुपर्ने।`,
    };
  }

  let grade: CommodityGrade = 'GRADE_A';
  let factor = 1.0;

  if (moisturePercent <= maxMoisture && foreignMatterPercent <= 1.5) {
    grade = 'GRADE_A';
    factor = 1.0;
  } else if (moisturePercent <= maxMoisture + 1.5 && foreignMatterPercent <= 3.5) {
    grade = 'GRADE_B';
    factor = 0.95; // 5% price deduction for Grade B
  } else {
    grade = 'GRADE_C';
    factor = 0.88; // 12% price deduction for Grade C
  }

  return {
    moisturePercent,
    foreignMatterPercent,
    grade,
    isMoistureAcceptable: true,
    rateAdjustmentFactor: factor,
    inspectorNotes: notes || `गुणस्तर स्तर: ${grade} (मूल्य समायोजन: ${(factor * 100).toFixed(0)}%)`,
  };
}

/**
 * Calculate market valuation and safe 70% pledge loan ceiling
 */
export function calculateWarehouseReceiptValuation(
  commodity: CommodityType,
  netWeightQuintals: number,
  inspection: QualityInspectionResult,
  customBaseRate?: number
): {
  baseMarketRate: number;
  effectiveRate: number;
  totalMarketValuation: number;
  maxEligiblePledgeLoanAmount: number;
} {
  const baseMarketRate = customBaseRate || COMMODITY_CATALOG[commodity].currentMarketRatePerQuintal;
  const effectiveRate = Math.round(baseMarketRate * inspection.rateAdjustmentFactor);
  const totalMarketValuation = Math.round(netWeightQuintals * effectiveRate);
  const maxEligiblePledgeLoanAmount = Math.floor(
    (totalMarketValuation * STATUTORY_MAX_PLEDGE_LTV_PERCENT) / 100
  );

  return {
    baseMarketRate,
    effectiveRate,
    totalMarketValuation,
    maxEligiblePledgeLoanAmount,
  };
}

/**
 * Calculate accrued interest and storage rent for a pledge loan
 */
export function calculatePledgeLoanSettlementFigures(
  principalAmount: number,
  annualInterestRate: number,
  netWeightQuintals: number,
  storageChargePerQuintalMonth: number,
  elapsedMonths: number
): {
  accruedInterest: number;
  totalStorageCharge: number;
  totalRepayableAmount: number;
} {
  const safeMonths = Math.max(1, elapsedMonths);
  const accruedInterest = Math.round((principalAmount * annualInterestRate * safeMonths) / (100 * 12));
  const totalStorageCharge = Math.round(storageChargePerQuintalMonth * netWeightQuintals * safeMonths);
  const totalRepayableAmount = principalAmount + accruedInterest + totalStorageCharge;

  return {
    accruedInterest,
    totalStorageCharge,
    totalRepayableAmount,
  };
}

/**
 * Settle a warehouse receipt via cooperative market liquidation
 */
export function calculateHarvestLiquidationSettlement(
  params: HarvestLiquidationParams,
  elapsedMonths = 3
): HarvestLiquidationResult {
  const { receipt, pledgeLoan, actualSaleRatePerQuintal } = params;

  const grossSaleRevenue = Math.round(receipt.netWeightQuintals * actualSaleRatePerQuintal);
  const loanPrincipalDeducted = pledgeLoan ? pledgeLoan.principalDisbursed : 0;

  const loanInterestDeducted = pledgeLoan
    ? Math.round(
        (pledgeLoan.principalDisbursed * pledgeLoan.annualInterestRate * Math.max(1, elapsedMonths)) /
          (100 * 12)
      )
    : 0;

  const storageChargesDeducted = Math.round(
    receipt.storageMonthlyChargePerQuintal * receipt.netWeightQuintals * Math.max(1, elapsedMonths)
  );

  const totalDeductions = loanPrincipalDeducted + loanInterestDeducted + storageChargesDeducted;
  const netSurplusPayableToMember = Math.max(0, grossSaleRevenue - totalDeductions);
  const transactionRef = `WH-SETTLE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const summaryNe = `${receipt.memberName} को ${receipt.varietyName} (${receipt.netWeightQuintals} क्विन्टल) रु. ${actualSaleRatePerQuintal}/क्विन्टलका दरले बिक्री गर्दा कुल रु. ${grossSaleRevenue.toLocaleString()} आम्दानी भएकोमा कर्जा र गोदाम शुल्क कट्टा गरी खुद रु. ${netSurplusPayableToMember.toLocaleString()} बचत खातामा भुक्तानी गरियो।`;

  return {
    receiptNo: receipt.receiptNo,
    memberId: receipt.memberId,
    memberName: receipt.memberName,
    netWeightQuintals: receipt.netWeightQuintals,
    saleRatePerQuintal: actualSaleRatePerQuintal,
    grossSaleRevenue,
    loanPrincipalDeducted,
    loanInterestDeducted,
    storageChargesDeducted,
    totalDeductions,
    netSurplusPayableToMember,
    transactionRef,
    summaryNe,
  };
}

/**
 * Generate unique electronic receipt serial number
 */
export function generateWarehouseReceiptNo(seq = 1): string {
  const year = '2081';
  const pad = seq.toString().padStart(4, '0');
  return `WHR-${year}-${pad}`;
}

/**
 * Generate unique crop pledge loan serial number
 */
export function generateCropPledgeLoanNo(seq = 1): string {
  const year = '2081';
  const pad = seq.toString().padStart(4, '0');
  return `CROP-LN-${year}-${pad}`;
}

/**
 * Initial Mock Warehouse Receipts for Gadhwa, Dang Grain Silos
 */
export const INITIAL_WAREHOUSE_RECEIPTS: WarehouseReceipt[] = [
  {
    id: 'whr-001',
    receiptNo: 'WHR-2081-0012',
    memberId: 'mem-1',
    memberName: 'राम बहादुर थारु (Ram B. Tharu)',
    memberNo: 'UKO-081-0104',
    memberPhone: '9847820111',
    commodity: 'PADDY_DHAN',
    varietyName: 'सोना मन्सुली (Sona Mansuli Paddy)',
    bagCount: 60,
    netWeightQuintals: 30, // 30 Quintals (3 Metric Tons)
    storageLocation: 'गढवा मुख्य गोदाम (Silo Bay A-3)',
    qualityInspection: {
      moisturePercent: 13.2,
      foreignMatterPercent: 1.1,
      grade: 'GRADE_A',
      isMoistureAcceptable: true,
      rateAdjustmentFactor: 1.0,
      inspectorNotes: 'उत्कृष्ट गुणस्तर, सुख्खा तथा चम्किलो दाना।',
    },
    baseMarketRatePerQuintal: 3450,
    effectiveRatePerQuintal: 3450,
    totalMarketValuation: 103500, // NPR 1,03,500
    maxEligiblePledgeLoanAmount: 72450, // 70% of valuation
    storageMonthlyChargePerQuintal: 25,
    depositDate: '2081-06-15',
    expiryDate: '2081-12-15',
    status: 'PLEDGED',
    activeLoanId: 'wln-001',
    createdAt: '2024-10-01T10:00:00Z',
  },
  {
    id: 'whr-002',
    receiptNo: 'WHR-2081-0015',
    memberId: 'mem-2',
    memberName: 'सीता कुमारी चौधरी (Sita K. Chaudhary)',
    memberNo: 'UKO-081-0118',
    memberPhone: '9857820222',
    commodity: 'MUSTARD_TORI',
    varietyName: 'स्थानीय पहेँलो तोरी (Local Yellow Mustard)',
    bagCount: 24,
    netWeightQuintals: 12, // 12 Quintals (1.2 Tons)
    storageLocation: 'गढवा मुख्य गोदाम (Cold Stack B-1)',
    qualityInspection: {
      moisturePercent: 9.4,
      foreignMatterPercent: 1.8,
      grade: 'GRADE_B',
      isMoistureAcceptable: true,
      rateAdjustmentFactor: 0.95,
      inspectorNotes: 'नमी सन्तोषजनक, तेलको अंश राम्रो (४२%)।',
    },
    baseMarketRatePerQuintal: 8800,
    effectiveRatePerQuintal: 8360,
    totalMarketValuation: 100320, // NPR 1,00,320
    maxEligiblePledgeLoanAmount: 70224, // 70%
    storageMonthlyChargePerQuintal: 30,
    depositDate: '2081-07-02',
    expiryDate: '2082-01-02',
    status: 'STORED', // Ready to take loan or sell
    createdAt: '2024-10-18T08:30:00Z',
  },
  {
    id: 'whr-003',
    receiptNo: 'WHR-2081-0021',
    memberId: 'mem-3',
    memberName: 'दिलमाया गुरुङ (Dilmaya Gurung)',
    memberNo: 'UKO-081-0135',
    memberPhone: '9847820333',
    commodity: 'MAIZE_MAKAI',
    varietyName: 'देउती उन्नत मकै (Deuti Improved Maize)',
    bagCount: 40,
    netWeightQuintals: 20, // 20 Quintals (2 Tons)
    storageLocation: 'गढवा अन्न भण्डार (Bin C-2)',
    qualityInspection: {
      moisturePercent: 12.8,
      foreignMatterPercent: 1.0,
      grade: 'GRADE_A',
      isMoistureAcceptable: true,
      rateAdjustmentFactor: 1.0,
      inspectorNotes: 'दाना सफा र पोटिलो, कीरा-रोगमुक्त।',
    },
    baseMarketRatePerQuintal: 3200,
    effectiveRatePerQuintal: 3200,
    totalMarketValuation: 64000,
    maxEligiblePledgeLoanAmount: 44800,
    storageMonthlyChargePerQuintal: 25,
    depositDate: '2081-06-28',
    expiryDate: '2081-12-28',
    status: 'STORED',
    createdAt: '2024-10-14T09:15:00Z',
  },
];

export const INITIAL_WAREHOUSE_PLEDGE_LOANS: WarehousePledgeLoan[] = [
  {
    id: 'wln-001',
    loanNo: 'CROP-LN-2081-0008',
    receiptId: 'whr-001',
    receiptNo: 'WHR-2081-0012',
    memberId: 'mem-1',
    memberName: 'राम बहादुर थारु (Ram B. Tharu)',
    principalDisbursed: 70000,
    annualInterestRate: 8.5,
    disbursedDate: '2081-06-16',
    dueDate: '2081-12-16',
    tenureMonths: 6,
    monthlyStorageRatePerQuintal: 25,
    savingsAccountNo: 'UKO-SB-1004',
    status: 'ACTIVE',
    notes: 'धान भण्डारण धितोमा दशैं-तिहार खर्च तथा हिउँदे बाली बीउ खरिदका लागि प्रवाह।',
  },
];
