import { describe, it, expect } from 'vitest';
import {
  calculateTotalLiquidAssets,
  simulateLiquidityStress,
  generateStressTestReportMinutes,
  SCENARIO_PRESETS,
  DEFAULT_UNAKO_LIQUIDITY_ASSETS,
  LiquidityAssetBreakdown,
} from '../liquidityStressEngine';

describe('Liquidity Stress Testing & Contingency Funding Plan Engine', () => {
  it('correctly calculates tiered realizable liquid assets with term haircut', () => {
    const assets: LiquidityAssetBreakdown = {
      cashInVault: 100000,
      bankCurrentBalances: 200000,
      bankSavingsBalances: 300000,
      commercialBankFixedDeposits: 1000000, // 95% = 950000
      treasuryBills: 500000,
      centralLiquidityFundLine: 400000,
      unencumberedReserveAssets: 200000,
    };

    const tiers = calculateTotalLiquidAssets(assets);

    expect(tiers.tier1).toBe(600000); // 100k + 200k + 300k
    expect(tiers.tier2).toBe(1450000); // 950k + 500k
    expect(tiers.tier3).toBe(400000);
    expect(tiers.tier4).toBe(200000);
    expect(tiers.totalRealizable).toBe(600000 + 1450000 + 400000 + 200000);
  });

  it('accurately simulates Mild Seasonal Stress scenario', () => {
    const totalDeposits = 200000000; // 20 Crores
    const totalLoans = 180000000; // 18 Crores
    const result = simulateLiquidityStress(
      DEFAULT_UNAKO_LIQUIDITY_ASSETS,
      totalDeposits,
      totalLoans,
      SCENARIO_PRESETS.MILD_STRESS
    );

    expect(result.scenario.scenarioId).toBe('MILD_STRESS');
    expect(result.stressedDepositWithdrawal).toBe(10000000); // 5% of 20 Cr = 1 Cr
    expect(result.baselineL1RatioPercent).toBeGreaterThan(10);
    expect(result.postStressNetPosition).toBeGreaterThan(0);
    expect(result.survivalHorizonDays).toBeGreaterThan(7);
  });

  it('accurately simulates Severe Run scenario and evaluates survival horizon', () => {
    const totalDeposits = 250000000; // 25 Crores
    const totalLoans = 200000000; // 20 Crores
    const result = simulateLiquidityStress(
      DEFAULT_UNAKO_LIQUIDITY_ASSETS,
      totalDeposits,
      totalLoans,
      SCENARIO_PRESETS.SEVERE_RUN
    );

    expect(result.scenario.depositRunRatePercent).toBe(30);
    expect(result.stressedDepositWithdrawal).toBe(75000000); // 30% of 25 Cr = 7.5 Cr
    expect(result.totalStressedOutflow).toBeGreaterThan(70000000);
    expect(result.recommendedActions.length).toBeGreaterThan(0);
  });

  it('triggers CRITICAL_DEFICIT and Tier 4 Emergency Rescue under extreme conditions', () => {
    const depletedAssets: LiquidityAssetBreakdown = {
      cashInVault: 10000,
      bankCurrentBalances: 20000,
      bankSavingsBalances: 30000,
      commercialBankFixedDeposits: 50000,
      treasuryBills: 0,
      centralLiquidityFundLine: 0,
      unencumberedReserveAssets: 0,
    };

    const totalDeposits = 50000000;
    const totalLoans = 40000000;

    const result = simulateLiquidityStress(
      depletedAssets,
      totalDeposits,
      totalLoans,
      SCENARIO_PRESETS.SEVERE_RUN
    );

    expect(result.status).toBe('CRITICAL_DEFICIT');
    expect(result.activatedCfpTier).toBe('TIER_4_EMERGENCY_RESCUE');
    expect(result.postStressNetPosition).toBeLessThan(0);
    expect(result.recommendedActions.some((a) => a.includes('सञ्चालक समिति'))).toBe(true);
  });

  it('generates official bilingual ALCO stress inspection report minutes', () => {
    const result = simulateLiquidityStress(
      DEFAULT_UNAKO_LIQUIDITY_ASSETS,
      200000000,
      150000000,
      SCENARIO_PRESETS.MODERATE_SHOCK
    );

    const report = generateStressTestReportMinutes(
      result,
      DEFAULT_UNAKO_LIQUIDITY_ASSETS,
      'उनको साकोस'
    );

    expect(report).toContain('उनको साकोस');
    expect(report).toContain('तरलता तनाव परीक्षण प्रतिवेदन (LIQUIDITY STRESS TEST REPORT)');
    expect(report).toContain('PEARLS L1');
    expect(report).toContain('आकस्मिक कोष योजना (CFP)');
    expect(report).toContain(result.survivalHorizonDays.toString());
  });
});
