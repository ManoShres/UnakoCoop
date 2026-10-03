import { describe, it, expect } from 'vitest';
import {
  toTotalKattha,
  toBighaKatthaDhurString,
  calculateCropQuota,
  calculateItemPricing,
  calculateRequisitionTotals,
  generateAgriVoucherNumber,
  formatAgriDeliveryChallan,
  CROP_QUOTA_RATES,
  INPUT_PRICING_CATALOG,
} from '../agriInputEngine';
import type { LandholdingArea, AgriInputRequisition, CoopSettings } from '../../types';

describe('agriInputEngine - Subsidized Fertilizer & Seed Quota Suite', () => {
  const mockCoopSettings: CoopSettings = {
    name: 'Unako Social Savings & Credit Co-operative Ltd.',
    nameNepali: 'उनाको सामाजिक बचत तथा ऋण सहकारी संस्था लि.',
    address: 'Gadhwa-1, Dang, Lumbini, Nepal',
    phone: '082-560123',
    email: 'info@unako.org',
    regNo: '202/065/066',
    panNo: '300124890',
    openingHours: '10:00 AM - 5:00 PM',
    operatingStatus: 'NORMAL',
    logoUrl: '/unako-logo.png',
  };

  describe('Terai Landholding Conversions', () => {
    it('converts Bigha-Kattha-Dhur into total Kattha accurately', () => {
      // 1 Bigha, 5 Kattha, 10 Dhur = 20 + 5 + 0.5 = 25.5 Kattha
      const area: LandholdingArea = { bigha: 1, kattha: 5, dhur: 10 };
      expect(toTotalKattha(area)).toBe(25.5);
    });

    it('formats a readable Nepali Bigha-Kattha-Dhur string', () => {
      const area: LandholdingArea = { bigha: 2, kattha: 12, dhur: 8 };
      const str = toBighaKatthaDhurString(area);
      expect(str).toBe('२ बिघा १२ कठ्ठा ८ धुर');
    });
  });

  describe('Statutory Quota Calculation per Crop', () => {
    it('calculates paddy fertilizer quota for 20 Kattha (1 Bigha)', () => {
      // Rates per Kattha: Urea 4.5, DAP 2.5, Potash 1.5, Seed 1.5
      // 20 Kattha: Urea 90kg, DAP 50kg, Potash 30kg, Seed 30kg
      const quota = calculateCropQuota('PADDY', 20);
      expect(quota.cropType).toBe('PADDY');
      expect(quota.ureaKg).toBe(90);
      expect(quota.dapKg).toBe(50);
      expect(quota.potashKg).toBe(30);
      expect(quota.seedKg).toBe(30);
    });

    it('calculates mustard quota accurately', () => {
      // Rates per Kattha: Urea 2.0, DAP 2.0, Potash 1.0, Seed 0.25
      // 10 Kattha: Urea 20kg, DAP 20kg, Potash 10kg, Seed 2.5kg
      const quota = calculateCropQuota('MUSTARD', 10);
      expect(quota.ureaKg).toBe(20);
      expect(quota.dapKg).toBe(20);
      expect(quota.potashKg).toBe(10);
      expect(quota.seedKg).toBe(2.5);
    });
  });

  describe('Subsidized Pricing & Requisition Totals', () => {
    it('calculates subsidized rate vs market rate for Urea (50kg bag)', () => {
      // Urea subsidized: NPR 18/kg (NPR 900/bag), Market: NPR 35/kg (NPR 1750/bag)
      const item = calculateItemPricing('UREA', 50);
      expect(item.quantityKg).toBe(50);
      expect(item.subsidizedRatePerKg).toBe(18);
      expect(item.totalAmount).toBe(900);
      expect(item.governmentSubsidyAmount).toBe(850); // (35 - 18) * 50
    });

    it('computes total market value, subsidy savings and net payable', () => {
      const item1 = calculateItemPricing('UREA', 50);  // net 900, market 1750, subsidy 850
      const item2 = calculateItemPricing('DAP', 50);   // net 2400, market 4200, subsidy 1800

      const totals = calculateRequisitionTotals([item1, item2]);
      expect(totals.netPayableAmount).toBe(3300);
      expect(totals.totalMarketValue).toBe(5950);
      expect(totals.totalSubsidySavings).toBe(2650);
    });
  });

  describe('Agri Requisition Voucher & Delivery Challan', () => {
    it('generates sequential voucher number with fiscal year format', () => {
      const v1 = generateAgriVoucherNumber('2081-06-25', 1);
      const v2 = generateAgriVoucherNumber('2081-06-25', 85);
      expect(v1).toBe('AGR-20810625-0001');
      expect(v2).toBe('AGR-20810625-0085');
    });

    it('formats an official delivery challan printable receipt', () => {
      const item1 = calculateItemPricing('UREA', 50);
      const item2 = calculateItemPricing('DAP', 50);
      const totals = calculateRequisitionTotals([item1, item2]);

      const req: AgriInputRequisition = {
        id: 'AGR-20810625-0001',
        requisitionNo: 'AGR-20810625-0001',
        memberId: 'mem-1',
        memberNo: 'M-00101',
        memberName: 'रामबहादुर चौधरी',
        ward: 'वार्ड नं. १ (गढवा)',
        cropType: 'PADDY',
        items: [item1, item2],
        ...totals,
        paymentType: 'SEASONAL_CROP_CREDIT',
        creditDueDate: '2081-09-30',
        creditInterestRatePercent: 4.5,
        status: 'PENDING_PICKUP',
        dateBS: '2081-06-25',
        issuedBy: 'EMP-01',
        warehouseLocation: 'गढवा मुख्य गोदाम (Silo A)',
      };

      const challan = formatAgriDeliveryChallan(req, mockCoopSettings);
      expect(challan).toContain('उनाको सामाजिक बचत तथा ऋण सहकारी');
      expect(challan).toContain('AGR-20810625-0001');
      expect(challan).toContain('रामबहादुर चौधरी');
      expect(challan).toContain('रासायनिक मल तथा बीउबिजन वितरण चलानी');
      expect(challan).toContain('युरिया मल');
      expect(challan).toContain('डीएपी मल');
      expect(challan).toContain('३,३००');
      expect(challan).toContain('मौसमी कृषि कर्जा');
    });
  });
});
