import { describe, it, expect } from 'vitest';
import {
  toTotalKattha,
  toBighaKatthaDhurString,
  calculateCropQuota,
  calculateRequisitionTotal,
  generateAgriChallanId,
  MOCK_AGRI_QUOTAS,
  INPUT_PRICING_CATALOG,
} from '../agriInputEngine';

describe('Agri-Input Quota Engine & Integration Suite', () => {
  it('correctly converts Terai Bigha-Kattha-Dhur to decimal Kattha units', () => {
    // 1 Bigha = 20 Kattha, 5 Kattha, 0 Dhur = 25 Kattha
    const area1 = { bigha: 1, kattha: 5, dhur: 0 };
    expect(toTotalKattha(area1)).toBe(25);

    // 0 Bigha, 15 Kattha, 10 Dhur = 15.5 Kattha
    const area2 = { bigha: 0, kattha: 15, dhur: 10 };
    expect(toTotalKattha(area2)).toBe(15.5);

    // 2 Bigha, 0 Kattha, 0 Dhur = 40 Kattha
    const area3 = { bigha: 2, kattha: 0, dhur: 0 };
    expect(toTotalKattha(area3)).toBe(40);
  });

  it('formats landholding as authentic Nepali Devanagari string', () => {
    const formatted1 = toBighaKatthaDhurString({ bigha: 1, kattha: 5, dhur: 0 });
    expect(formatted1).toContain('बिघा');
    expect(formatted1).toContain('कठ्ठा');

    const formatted2 = toBighaKatthaDhurString({ bigha: 0, kattha: 0, dhur: 0 });
    expect(formatted2).toBe('० कठ्ठा');
  });

  it('calculates accurate statutory fertilizer & seed quota for Paddy crop (25 Kattha)', () => {
    const quota = calculateCropQuota('PADDY', 25);
    // Rate: Urea: 4.5 kg/Kattha -> 112.5 kg
    // DAP: 2.5 kg/Kattha -> 62.5 kg
    // Potash: 1.5 kg/Kattha -> 37.5 kg
    // Seed: 1.5 kg/Kattha -> 37.5 kg
    expect(quota.ureaKg).toBe(112.5);
    expect(quota.dapKg).toBe(62.5);
    expect(quota.potashKg).toBe(37.5);
    expect(quota.seedKg).toBe(37.5);
  });

  it('computes financial subsidy savings between subsidized and open market pricing', () => {
    const items = [
      {
        itemType: 'UREA' as const,
        quantityKg: 50,
        ratePerKg: INPUT_PRICING_CATALOG.UREA.subsidizedRatePerKg, // 18
        totalNpr: 50 * INPUT_PRICING_CATALOG.UREA.subsidizedRatePerKg, // 900
      },
      {
        itemType: 'DAP' as const,
        quantityKg: 50,
        ratePerKg: INPUT_PRICING_CATALOG.DAP.subsidizedRatePerKg, // 48
        totalNpr: 50 * INPUT_PRICING_CATALOG.DAP.subsidizedRatePerKg, // 2400
      },
    ];

    const result = calculateRequisitionTotal(items);

    expect(result.subsidizedTotal).toBe(3300); // 900 + 2400
    // Market value: Urea 50 * 35 = 1750; DAP 50 * 84 = 4200 -> total 5950
    expect(result.marketValueTotal).toBe(5950);
    // Direct government subsidy savings: 5950 - 3300 = 2650
    expect(result.subsidyAmount).toBe(2650);
  });

  it('generates compliant Challan / Voucher reference format', () => {
    const challanNo = generateAgriChallanId('2081-04-15', 1);
    expect(challanNo).toMatch(/^AGR-\d{8}-\d{4}$/);
  });

  it('provides valid mock quota entries matching registered members', () => {
    expect(MOCK_AGRI_QUOTAS.length).toBeGreaterThanOrEqual(3);
    const ramBahadur = MOCK_AGRI_QUOTAS.find((q) => q.memberId === 'mem-1');
    expect(ramBahadur).toBeDefined();
    expect(ramBahadur?.totalKattha).toBe(25);
    expect(ramBahadur?.creditLimit).toBe(30000);
    expect(ramBahadur?.remaining.ureaKg).toBeGreaterThan(0);
  });
});
