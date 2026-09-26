import { describe, it, expect } from 'vitest';
import {
  evaluateBranchVaultStatus,
  calculateNetworkLiquidity,
  createCashTransitRequest,
  INITIAL_SERVICE_CENTERS,
  ServiceCenter,
} from '../vaultLiquidity';

describe('Multi-Branch Cash Vault & Liquidity Engine', () => {
  describe('Vault Status Evaluation', () => {
    it('returns NORMAL when cash is within operating corridor', () => {
      const status = evaluateBranchVaultStatus(500000, 200000, 1000000);
      expect(status).toBe('NORMAL');
    });

    it('returns DEFICIT_CRITICAL when cash drops below min reserve', () => {
      const status = evaluateBranchVaultStatus(90000, 150000, 600000);
      expect(status).toBe('DEFICIT_CRITICAL');
    });

    it('returns SURPLUS_WARNING when cash exceeds insurance ceiling', () => {
      const status = evaluateBranchVaultStatus(1500000, 200000, 1000000);
      expect(status).toBe('SURPLUS_WARNING');
    });
  });

  describe('Consolidated Network Liquidity & PEARLS E9 Benchmark', () => {
    const mockBranches: ServiceCenter[] = [
      {
        id: 'b1',
        code: 'HQ',
        name: 'Gadhwa Central',
        nameNepali: 'गढवा केन्द्रीय',
        address: 'Gadhwa',
        custodianName: 'Bishnu Sharma',
        custodianPhone: '9857821001',
        currentVaultCash: 1000000,
        minReserveLimit: 500000,
        maxHoldingCeiling: 2500000,
        status: 'NORMAL',
      },
      {
        id: 'b2',
        code: 'LMH',
        name: 'Lamahi',
        nameNepali: 'लमही',
        address: 'Lamahi',
        custodianName: 'Sunita Chaudhary',
        custodianPhone: '9847812002',
        currentVaultCash: 1200000, // surplus > 1M ceiling
        minReserveLimit: 300000,
        maxHoldingCeiling: 1000000,
        status: 'SURPLUS_WARNING',
      },
      {
        id: 'b3',
        code: 'GBD',
        name: 'Gobardiha',
        nameNepali: 'गोबरडिहा',
        address: 'Gobardiha',
        custodianName: 'Anita Yadav',
        custodianPhone: '9819834004',
        currentVaultCash: 50000, // deficit < 100k
        minReserveLimit: 100000,
        maxHoldingCeiling: 500000,
        status: 'DEFICIT_CRITICAL',
      },
    ];

    it('accurately aggregates network cash and verifies PEARLS compliance', () => {
      const bankBalance = 3750000;
      const memberSavings = 40000000; // 40 Million NPR
      // Total liquid = 1M + 1.2M + 0.05M + 3.75M = 6M
      // Ratio = 6M / 40M = 15.0%

      const result = calculateNetworkLiquidity(mockBranches, bankBalance, memberSavings);

      expect(result.totalPhysicalVaultCash).toBe(2250000);
      expect(result.totalLiquidAssets).toBe(6000000);
      expect(result.liquidityRatioPercent).toBe(15);
      expect(result.isPearlsCompliant).toBe(true);
      expect(result.benchmarkStatus).toBe('OPTIMAL');
      expect(result.surplusBranchesCount).toBe(1);
      expect(result.deficitBranchesCount).toBe(1);
    });

    it('flags BELOW_MINIMUM when liquid reserves drop below 10%', () => {
      const bankBalance = 500000;
      const memberSavings = 40000000;
      // Total liquid = 2.25M + 0.5M = 2.75M -> 6.9% < 10%
      const result = calculateNetworkLiquidity(mockBranches, bankBalance, memberSavings);

      expect(result.liquidityRatioPercent).toBeLessThan(10);
      expect(result.isPearlsCompliant).toBe(false);
      expect(result.benchmarkStatus).toBe('BELOW_MINIMUM');
    });

    it('flags EXCESS_IDLE_CASH when liquidity ratio exceeds 18%', () => {
      const bankBalance = 10000000;
      const memberSavings = 40000000;
      // Total liquid = 2.25M + 10M = 12.25M -> 30.6% > 18%
      const result = calculateNetworkLiquidity(mockBranches, bankBalance, memberSavings);

      expect(result.liquidityRatioPercent).toBeGreaterThan(18);
      expect(result.isPearlsCompliant).toBe(false);
      expect(result.benchmarkStatus).toBe('EXCESS_IDLE_CASH');
    });
  });

  describe('Cash-in-Transit (CIT) Security Dispatch', () => {
    it('generates an audited transit transfer order with 6-digit OTP and timestamp', () => {
      const transit = createCashTransitRequest(
        'Gadhwa Central Vault',
        'Gobardiha Rural Extension Desk',
        100000,
        'Anita Yadav',
        'Bishnu Sharma (Chief Cashier)',
        'Unako Armed Security Patrol Team'
      );

      expect(transit.id).toMatch(/^CIT-\d{8}-\d{4}$/);
      expect(transit.amount).toBe(100000);
      expect(transit.status).toBe('IN_TRANSIT');
      expect(transit.verificationOtp).toMatch(/^\d{6}$/);
      expect(transit.fromLocation).toBe('Gadhwa Central Vault');
      expect(transit.toLocation).toBe('Gobardiha Rural Extension Desk');
    });
  });
});
