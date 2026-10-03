import { describe, it, expect } from 'vitest';
import {
  COMMODITY_CATALOG,
  DEFAULT_STORAGE_FEE_PER_QUINTAL_MONTH,
  STATUTORY_MAX_PLEDGE_LTV_PERCENT,
  inspectCommodityQuality,
  calculateWarehouseReceiptValuation,
  calculatePledgeLoanSettlementFigures,
  calculateHarvestLiquidationSettlement,
  generateWarehouseReceiptNo,
  generateCropPledgeLoanNo,
  INITIAL_WAREHOUSE_RECEIPTS,
} from '../warehouseReceiptEngine';

describe('warehouseReceiptEngine', () => {
  it('loads valid commodity specifications for Dang agricultural belt', () => {
    expect(COMMODITY_CATALOG.PADDY_DHAN.currentMarketRatePerQuintal).toBeGreaterThan(0);
    expect(COMMODITY_CATALOG.MUSTARD_TORI.currentMarketRatePerQuintal).toBe(8800);
    expect(COMMODITY_CATALOG.LENTIL_DAAL.standardMoistureMaxPercent).toBe(11.0);
    expect(DEFAULT_STORAGE_FEE_PER_QUINTAL_MONTH).toBe(25);
    expect(STATUTORY_MAX_PLEDGE_LTV_PERCENT).toBe(70);
  });

  describe('inspectCommodityQuality', () => {
    it('approves Grade A when moisture and foreign matter are within standards', () => {
      const result = inspectCommodityQuality('PADDY_DHAN', 13.0, 1.0);
      expect(result.grade).toBe('GRADE_A');
      expect(result.isMoistureAcceptable).toBe(true);
      expect(result.rateAdjustmentFactor).toBe(1.0);
    });

    it('assigns Grade B with 5% deduction when slightly above standard moisture', () => {
      const result = inspectCommodityQuality('PADDY_DHAN', 15.0, 2.5);
      expect(result.grade).toBe('GRADE_B');
      expect(result.isMoistureAcceptable).toBe(true);
      expect(result.rateAdjustmentFactor).toBe(0.95);
    });

    it('assigns Grade C with 12% deduction for higher foreign matter', () => {
      const result = inspectCommodityQuality('PADDY_DHAN', 16.5, 5.0);
      expect(result.grade).toBe('GRADE_C');
      expect(result.isMoistureAcceptable).toBe(true);
      expect(result.rateAdjustmentFactor).toBe(0.88);
    });

    it('rejects moisture higher than standard + 3% to prevent silo rot', () => {
      // Standard for Paddy is 14%. 18% is > 17%
      const result = inspectCommodityQuality('PADDY_DHAN', 18.0, 2.0);
      expect(result.isMoistureAcceptable).toBe(false);
      expect(result.inspectorNotes).toContain('नमीको मात्रा');
    });
  });

  describe('calculateWarehouseReceiptValuation', () => {
    it('accurately calculates market valuation and safe 70% LTV pledge loan ceiling', () => {
      const inspection = {
        moisturePercent: 13.0,
        foreignMatterPercent: 1.0,
        grade: 'GRADE_A' as const,
        isMoistureAcceptable: true,
        rateAdjustmentFactor: 1.0,
        inspectorNotes: 'Good',
      };

      // 50 quintals of paddy at NPR 3,450
      const val = calculateWarehouseReceiptValuation('PADDY_DHAN', 50, inspection, 3450);
      expect(val.effectiveRate).toBe(3450);
      expect(val.totalMarketValuation).toBe(172500); // 50 * 3450
      expect(val.maxEligiblePledgeLoanAmount).toBe(120750); // 172,500 * 0.70
    });

    it('adjusts valuation if Grade B quality factor is applied', () => {
      const inspection = {
        moisturePercent: 15.0,
        foreignMatterPercent: 2.0,
        grade: 'GRADE_B' as const,
        isMoistureAcceptable: true,
        rateAdjustmentFactor: 0.95,
        inspectorNotes: 'Moderate',
      };

      // 10 quintals of mustard at NPR 8,800
      const val = calculateWarehouseReceiptValuation('MUSTARD_TORI', 10, inspection, 8800);
      expect(val.effectiveRate).toBe(8360); // 8800 * 0.95
      expect(val.totalMarketValuation).toBe(83600);
      expect(val.maxEligiblePledgeLoanAmount).toBe(58520); // 83,600 * 0.70
    });
  });

  describe('calculatePledgeLoanSettlementFigures', () => {
    it('computes accurate accrued interest and monthly storage fees', () => {
      // Loan of NPR 50,000 at 8.5% for 4 months, 20 quintals stored at NPR 25/quintal/month
      const fig = calculatePledgeLoanSettlementFigures(50000, 8.5, 20, 25, 4);
      // Interest: (50000 * 8.5 * 4) / 1200 = 1416.66 -> 1417
      expect(fig.accruedInterest).toBe(1417);
      // Storage: 25 * 20 * 4 = 2000
      expect(fig.totalStorageCharge).toBe(2000);
      expect(fig.totalRepayableAmount).toBe(53417);
    });
  });

  describe('calculateHarvestLiquidationSettlement', () => {
    it('reconciles produce sale, deducts loan and storage, and credits member net surplus', () => {
      const mockReceipt = INITIAL_WAREHOUSE_RECEIPTS[0]; // Ram Bahadur Tharu, 30 quintals Paddy
      const mockLoan = {
        id: 'wln-001',
        loanNo: 'CROP-LN-2081-0008',
        receiptId: mockReceipt.id,
        receiptNo: mockReceipt.receiptNo,
        memberId: mockReceipt.memberId,
        memberName: mockReceipt.memberName,
        principalDisbursed: 70000,
        annualInterestRate: 8.5,
        disbursedDate: '2081-06-16',
        dueDate: '2081-12-16',
        tenureMonths: 6,
        monthlyStorageRatePerQuintal: 25,
        savingsAccountNo: 'UKO-SB-1004',
        status: 'ACTIVE' as const,
      };

      // Sold at off-season peak price: NPR 4,100 / quintal
      const settlement = calculateHarvestLiquidationSettlement(
        {
          receipt: mockReceipt,
          pledgeLoan: mockLoan,
          actualSaleRatePerQuintal: 4100,
          saleDate: '2081-09-20',
          buyerName: 'गढवा कृषि थोक बजार संघ (Gadhwa Agri Wholesale)',
        },
        3 // 3 months elapsed
      );

      expect(settlement.grossSaleRevenue).toBe(123000); // 30 * 4100
      expect(settlement.loanPrincipalDeducted).toBe(70000);
      // Interest: (70000 * 8.5 * 3) / 1200 = 1487.5 -> 1488
      expect(settlement.loanInterestDeducted).toBe(1488);
      // Storage: 25 * 30 * 3 = 2250
      expect(settlement.storageChargesDeducted).toBe(2250);
      expect(settlement.totalDeductions).toBe(73738);
      expect(settlement.netSurplusPayableToMember).toBe(49262); // 123,000 - 73,738
      expect(settlement.summaryNe).toContain('बचत खातामा भुक्तानी गरियो');
    });
  });

  describe('serial generators', () => {
    it('generates well-formed WHR and loan serials', () => {
      expect(generateWarehouseReceiptNo(42)).toBe('WHR-2081-0042');
      expect(generateCropPledgeLoanNo(9)).toBe('CROP-LN-2081-0009');
    });
  });
});
