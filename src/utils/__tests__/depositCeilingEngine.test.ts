import { describe, it, expect } from 'vitest';
import {
  calculateDepositCeiling,
  simulateDepositExpansion,
  generateDepositCeilingCsv,
  CapitalComponents,
} from '../depositCeilingEngine';
import { SavingsAccount, Member } from '../../types';

describe('Cooperative Act 2074 Section 49 Deposit Mobilization Ceiling (15x Limit) Engine', () => {
  const sampleCapital: CapitalComponents = {
    paidUpShareCapital: 10000000, // 1 Crore
    generalReserveFund: 5000000,  // 50 Lakhs
    capitalReserveFund: 1000000,  // 10 Lakhs
    undividedProfit: 4000000,     // 40 Lakhs
    // Total Core Capital = 20,000,000 (2 Crore)
    // 15x Ceiling = 300,000,000 (30 Crore)
  };

  const sampleMembers: Member[] = [
    {
      id: 'MEM-01',
      memberNo: 'UKO-001',
      name: 'Ram Bahadur Thapa',
      phone: '9847111111',
      address: 'Gadhawa-05',
    } as Member,
    {
      id: 'MEM-02',
      memberNo: 'UKO-002',
      name: 'Sita Devi Sharma',
      phone: '9847222222',
      address: 'Gadhawa-04',
    } as Member,
    {
      id: 'MEM-03',
      memberNo: 'UKO-003',
      name: 'Gopal Chaudhary',
      phone: '9847333333',
      address: 'Gadhawa-01',
    } as Member,
  ];

  const sampleSavings: SavingsAccount[] = [
    {
      id: 'SAV-01',
      accountNo: '001-REG',
      memberId: 'MEM-01',
      accountType: 'Regular Savings',
      balance: 15000000, // 1.5 Crore
      interestRate: 7.5,
    } as SavingsAccount,
    {
      id: 'SAV-02',
      accountNo: '002-FIXED',
      memberId: 'MEM-01',
      accountType: 'Fixed Deposit (1 Year)',
      balance: 20000000, // 2 Crore (Total MEM-01 = 3.5 Crore)
      interestRate: 10.5,
    } as SavingsAccount,
    {
      id: 'SAV-03',
      accountNo: '003-REG',
      memberId: 'MEM-02',
      accountType: 'Regular Savings',
      balance: 100000000, // 10 Crore
      interestRate: 7.5,
    } as SavingsAccount,
    {
      id: 'SAV-04',
      accountNo: '004-WOMEN',
      memberId: 'MEM-03',
      accountType: 'Women Empowerment Fund',
      balance: 65000000, // 6.5 Crore
      interestRate: 8.5,
    } as SavingsAccount,
    // Total deposits = 15M + 20M + 100M + 65M = 200,000,000 (20 Crore)
  ];

  it('accurately calculates 15x Core Capital deposit ceiling and headroom', () => {
    const analysis = calculateDepositCeiling(sampleSavings, sampleMembers, sampleCapital);

    expect(analysis.totalCoreCapital).toBe(20000000); // 2 Crore
    expect(analysis.maxStatutoryDepositCeiling).toBe(300000000); // 30 Crore (2 Crore * 15)
    expect(analysis.totalDepositLiability).toBe(200000000); // 20 Crore
    expect(analysis.depositToCoreCapitalRatio).toBe(10.0); // 20 Crore / 2 Crore = 10.0x
    expect(analysis.headroomCapacity).toBe(100000000); // 10 Crore headroom remaining
    expect(analysis.headroomUtilizationPercent).toBe(66.67);
    expect(analysis.isCeilingCompliant).toBe(true);
    expect(analysis.complianceStatus).toBe('COMPLIANT');
  });

  it('detects concentration risk when single member holds > 10% of total deposits', () => {
    // Total deposits = 20 Crore
    // MEM-02 holds 10 Crore (50% of total deposits) -> Flags concentration risk!
    const analysis = calculateDepositCeiling(sampleSavings, sampleMembers, sampleCapital);

    const mem2 = analysis.topDepositors.find((d) => d.memberId === 'MEM-02');
    expect(mem2).toBeDefined();
    expect(mem2?.depositSharePercent).toBe(50.0);
    expect(mem2?.isConcentrationRisk).toBe(true);
    expect(analysis.flaggedConcentratedMembersCount).toBeGreaterThanOrEqual(1);
  });

  it('flags warning when deposits reach 90% of ceiling (>= 13.5x)', () => {
    // Total Core Capital = 20M. 90% of 300M = 270M (13.5x)
    const highSavings: SavingsAccount[] = [
      {
        id: 'SAV-HIGH',
        accountNo: '009-HIGH',
        memberId: 'MEM-01',
        accountType: 'Fixed Deposit (1 Year)',
        balance: 275000000, // 27.5 Crore (Ratio = 13.75x)
        interestRate: 10.0,
      } as SavingsAccount,
    ];

    const analysis = calculateDepositCeiling(highSavings, sampleMembers, sampleCapital);
    expect(analysis.depositToCoreCapitalRatio).toBe(13.75);
    expect(analysis.isCeilingCompliant).toBe(true);
    expect(analysis.complianceStatus).toBe('WARNING');
  });

  it('flags statutory BREACH when deposits exceed 15x Core Capital', () => {
    const breachSavings: SavingsAccount[] = [
      {
        id: 'SAV-BREACH',
        accountNo: '009-BREACH',
        memberId: 'MEM-01',
        accountType: 'Fixed Deposit (1 Year)',
        balance: 320000000, // 32 Crore (> 30 Crore ceiling)
        interestRate: 10.0,
      } as SavingsAccount,
    ];

    const analysis = calculateDepositCeiling(breachSavings, sampleMembers, sampleCapital);
    expect(analysis.depositToCoreCapitalRatio).toBe(16.0);
    expect(analysis.isCeilingCompliant).toBe(false);
    expect(analysis.complianceStatus).toBe('BREACH');
    expect(analysis.headroomCapacity).toBeLessThan(0);
  });

  it('simulates deposit growth and capital injection effects', () => {
    const baseline = calculateDepositCeiling(sampleSavings, sampleMembers, sampleCapital);
    // Baseline: 20 Crore deposits on 2 Crore capital (10x ratio, 30 Crore ceiling)
    // If we add 12 Crore deposits (+120,000,000): total deposits = 32 Crore (breach 16x)
    const simulatedBreach = simulateDepositExpansion(baseline, 120000000, 0);
    expect(simulatedBreach.isCeilingCompliant).toBe(false);
    expect(simulatedBreach.complianceStatus).toBe('BREACH');

    // If we concurrently raise 1 Crore fresh share capital (+10,000,000):
    // New capital = 3 Crore. New 15x ceiling = 45 Crore.
    // 32 Crore deposits on 45 Crore ceiling = 10.67x (COMPLIANT!)
    const simulatedWithCapital = simulateDepositExpansion(baseline, 120000000, 10000000);
    expect(simulatedWithCapital.isCeilingCompliant).toBe(true);
    expect(simulatedWithCapital.complianceStatus).toBe('COMPLIANT');
    expect(simulatedWithCapital.totalCoreCapital).toBe(30000000);
  });

  it('generates a compliant CSV export string', () => {
    const analysis = calculateDepositCeiling(sampleSavings, sampleMembers, sampleCapital);
    const csv = generateDepositCeilingCsv(analysis);

    expect(csv).toContain('सहकारी ऐन २०७४ दफा ४९(१)');
    expect(csv).toContain('प्राथमिक पूँजी कोष (Core Capital)');
    expect(csv).toContain('कानूनी अधिकतम निक्षेप सीमा (१५ गुणा)');
    expect(csv).toContain('10x');
    expect(csv).toContain('Sita Devi Sharma');
  });
});
