import { describe, it, expect } from 'vitest';
import {
  calculateAdditionAbsorption,
  calculatePoolDepreciation,
  calculateComprehensiveDepreciation,
  addFixedAsset,
  disposeFixedAsset,
  generateCopasJournalVoucher,
  exportFixedAssetsToCSV,
  DEFAULT_FIXED_ASSETS,
  FixedAsset,
} from '../fixedAssetEngine';

describe('Fixed Asset & Depreciation Schedule Engine', () => {
  it('correctly calculates statutory addition absorption according to Income Tax Act 2058', () => {
    // Shrawan to Poush: 100% (3/3)
    const shrawan = calculateAdditionAbsorption(90000, 'SHRAWAN_TO_POUSH');
    expect(shrawan.absorbedAmount).toBe(90000);
    expect(shrawan.deferredAmount).toBe(0);

    // Magh to Chaitra: 66.67% (2/3)
    const magh = calculateAdditionAbsorption(90000, 'MAGH_TO_CHAITRA');
    expect(magh.absorbedAmount).toBe(60000);
    expect(magh.deferredAmount).toBe(30000);

    // Baisakh to Ashadh: 33.33% (1/3)
    const baisakh = calculateAdditionAbsorption(90000, 'BAISAKH_TO_ASHADH');
    expect(baisakh.absorbedAmount).toBe(30000);
    expect(baisakh.deferredAmount).toBe(60000);

    // Zero cost
    const zero = calculateAdditionAbsorption(0, 'SHRAWAN_TO_POUSH');
    expect(zero.absorbedAmount).toBe(0);
    expect(zero.deferredAmount).toBe(0);
  });

  it('computes pool-level depreciation accurately for Pool B (25%)', () => {
    const openingWdv = 100000;
    const additions = [
      { cost: 30000, timing: 'SHRAWAN_TO_POUSH' as const }, // 100% = 30000
      { cost: 30000, timing: 'MAGH_TO_CHAITRA' as const }, // 2/3 = 20000, deferred 10000
    ];
    const disposals = 10000;

    // Base = 100000 + 30000 + 20000 - 10000 = 140000
    // Depreciation = 140000 * 0.25 = 35000
    // Closing WDV = 140000 - 35000 + 10000 (deferred) = 115000
    const schedule = calculatePoolDepreciation('POOL_B', openingWdv, additions, disposals);

    expect(schedule.pool).toBe('POOL_B');
    expect(schedule.depreciationRate).toBe(0.25);
    expect(schedule.absorbedAdditions).toBe(50000);
    expect(schedule.unabsorbedAdditions).toBe(10000);
    expect(schedule.depreciationBase).toBe(140000);
    expect(schedule.depreciationAmount).toBe(35000);
    expect(schedule.closingWdv).toBe(115000);
  });

  it('computes comprehensive depreciation report summary across all assets', () => {
    const summary = calculateComprehensiveDepreciation(DEFAULT_FIXED_ASSETS, '२०८०/०८१');

    expect(summary.fiscalYear).toBe('२०८०/०८१');
    expect(summary.totalAssetsCount).toBe(6);
    expect(summary.totalOpeningWdv).toBeGreaterThan(0);
    expect(summary.totalDepreciationExpense).toBeGreaterThan(0);
    expect(summary.totalClosingWdv).toBeGreaterThan(0);

    // Verify all 5 pools are present
    expect(summary.poolSchedules.POOL_A).toBeDefined();
    expect(summary.poolSchedules.POOL_B).toBeDefined();
    expect(summary.poolSchedules.POOL_C).toBeDefined();
    expect(summary.poolSchedules.POOL_D).toBeDefined();
    expect(summary.poolSchedules.POOL_E).toBeDefined();

    // Rates verify
    expect(summary.poolSchedules.POOL_A.depreciationRate).toBe(0.05);
    expect(summary.poolSchedules.POOL_B.depreciationRate).toBe(0.25);
    expect(summary.poolSchedules.POOL_C.depreciationRate).toBe(0.20);
    expect(summary.poolSchedules.POOL_D.depreciationRate).toBe(0.25);
    expect(summary.poolSchedules.POOL_E.depreciationRate).toBe(0.20);
  });

  it('adds fixed asset immutably with initialized WDV', () => {
    const initialCount = DEFAULT_FIXED_ASSETS.length;
    const newAssets = addFixedAsset(DEFAULT_FIXED_ASSETS, {
      assetCode: 'FA-D-010',
      name: 'नयाँ ल्यापटप (अध्यक्ष)',
      category: 'POOL_D',
      purchaseDate: '2080-12-01',
      purchaseCost: 110000,
      additionTiming: 'MAGH_TO_CHAITRA',
      branchName: 'गढवा मुख्य शाखा',
      location: 'सञ्चालक कक्ष',
      status: 'ACTIVE',
    });

    expect(newAssets.length).toBe(initialCount + 1);
    expect(newAssets).not.toBe(DEFAULT_FIXED_ASSETS);

    const added = newAssets[newAssets.length - 1];
    expect(added.assetCode).toBe('FA-D-010');
    expect(added.currentWdv).toBe(110000);
    expect(added.accumulatedDepreciation).toBe(0);
  });

  it('disposes asset immutably and calculates Gain/Loss', () => {
    const targetAsset = DEFAULT_FIXED_ASSETS[2]; // Motorcycle with current WDV = 210000
    const saleProceeds = 180000;
    const disposalDate = '2080-12-25';

    const updatedList = disposeFixedAsset(
      DEFAULT_FIXED_ASSETS,
      targetAsset.id,
      saleProceeds,
      disposalDate
    );

    expect(updatedList).not.toBe(DEFAULT_FIXED_ASSETS);
    const disposed = updatedList.find((a) => a.id === targetAsset.id);
    expect(disposed?.status).toBe('DISPOSED');
    expect(disposed?.disposalDetails?.saleProceeds).toBe(180000);
    // Loss = 180000 - 210000 = -30000
    expect(disposed?.disposalDetails?.gainOrLoss).toBe(-30000);
  });

  it('generates official COPAS depreciation journal voucher', () => {
    const summary = calculateComprehensiveDepreciation(DEFAULT_FIXED_ASSETS);
    const voucher = generateCopasJournalVoucher(summary, 'उनको साकोस');

    expect(voucher).toContain('उनको साकोस');
    expect(voucher).toContain('COPAS स्थिर सम्पत्ति ह्रासकट्टी प्रविष्टि गोश्वारा भौचर');
    expect(voucher).toContain('Dr. ह्रासकट्टी खर्च हिसाब (Depreciation Exp)');
    expect(voucher).toContain('Cr. भवन ह्रासकट्टी कोष');
    expect(voucher).toContain('Cr. कम्प्युटर/आईटी कोष');
    expect(voucher).toContain(summary.totalDepreciationExpense.toLocaleString('en-IN'));
  });

  it('exports fixed asset list to formatted CSV', () => {
    const csv = exportFixedAssetsToCSV(DEFAULT_FIXED_ASSETS);

    expect(csv).toContain('Asset Code,Asset Name,Pool Category,Purchase Date,Purchase Cost (NPR)');
    expect(csv).toContain('FA-A-001');
    expect(csv).toContain('FA-D-001');
    expect(csv).toContain('POOL_A');
  });
});
