import { describe, it, expect } from 'vitest';
import {
  calculateSingleObligorExposure,
  simulateNewLoanSolPreCheck,
  generateSingleObligorCsv,
  STATUTORY_UNSECURED_SOL_PERCENT,
  STATUTORY_SECURED_SOL_PERCENT,
} from '../singleObligorEngine';
import { Loan, Member } from '../../types';

describe('Cooperative Act 2074 Section 51 Single Obligor Limit (SOL) & Family Exposure Engine', () => {
  const sampleCoreCapital = 20000000; // NPR 2 Crore
  // 10% Unsecured Limit = 2,000,000 (20 Lakhs)
  // 15% Secured Limit = 3,000,000 (30 Lakhs)

  const sampleMembers: Member[] = [
    {
      id: 'MEM-01',
      memberNo: 'UKO-001',
      name: 'Bikram Bahadur Singh',
      phone: '9857111111',
    } as Member,
    {
      id: 'MEM-02',
      memberNo: 'UKO-002',
      name: 'Sunita Singh',
      phone: '9857222222',
    } as Member,
    {
      id: 'MEM-03',
      memberNo: 'UKO-003',
      name: 'Gopal Chaudhary',
      phone: '9857333333',
    } as Member,
  ];

  const sampleLoans: Loan[] = [
    {
      id: 'LN-01',
      loanNo: 'LN-2080-001',
      memberId: 'MEM-01',
      principalAmount: 1500000,
      remainingBalance: 1500000, // 15 Lakhs (Unsecured - within 20L limit)
      interestRate: 13.0,
      tenureMonths: 24,
      monthlyEmi: 70000,
      disbursedDate: '2024-01-01',
      nextDueDate: '2024-02-01',
      status: 'ACTIVE',
      loanType: 'Education & Career',
      collateralDescription: 'Personal Guarantee',
    },
    {
      id: 'LN-02',
      loanNo: 'LN-2080-002',
      memberId: 'MEM-01',
      principalAmount: 1800000,
      remainingBalance: 1800000, // 18 Lakhs (Secured - Total MEM-01 = 33 Lakhs -> Breaches 30L 15% Limit!)
      interestRate: 14.0,
      tenureMonths: 60,
      monthlyEmi: 42000,
      disbursedDate: '2024-02-01',
      nextDueDate: '2024-03-01',
      status: 'ACTIVE',
      loanType: 'Small Business Enterprise',
      collateralType: 'LAND_LALPURJA',
      collateralDescription: 'Land and house mortgage, Gadhawa-5',
      collateralValue: 4500000,
    },
    {
      id: 'LN-03',
      loanNo: 'LN-2080-003',
      memberId: 'MEM-03',
      principalAmount: 800000,
      remainingBalance: 800000, // 8 Lakhs (Safe)
      interestRate: 12.5,
      tenureMonths: 12,
      monthlyEmi: 72000,
      disbursedDate: '2024-03-01',
      nextDueDate: '2024-04-01',
      status: 'ACTIVE',
      loanType: 'Agricultural & Livestock',
      collateralDescription: 'Dairy cattle & crop',
    },
  ];

  it('correctly calculates 10% and 15% Single Obligor Limits on Core Capital', () => {
    const analysis = calculateSingleObligorExposure(sampleLoans, sampleMembers, sampleCoreCapital);

    expect(analysis.coreCapital).toBe(20000000);
    expect(analysis.unsecuredSolLimit).toBe(2000000); // 20 Lakhs
    expect(analysis.securedSolLimit).toBe(3000000); // 30 Lakhs
  });

  it('flags breach when member aggregate loan exceeds 15% Core Capital ceiling', () => {
    const analysis = calculateSingleObligorExposure(sampleLoans, sampleMembers, sampleCoreCapital);

    const mem1 = analysis.topBorrowers.find((b) => b.memberId === 'MEM-01');
    expect(mem1).toBeDefined();
    expect(mem1?.totalAggregateBalance).toBe(3300000); // 33 Lakhs
    expect(mem1?.isTotalBreached).toBe(true);
    expect(mem1?.complianceStatus).toBe('BREACH');
    expect(analysis.breachedBorrowersCount).toBe(1);
    expect(analysis.portfolioComplianceStatus).toBe('BREACH');
  });

  it('correctly pre-checks new loan proposals against SOL headroom', () => {
    const analysis = calculateSingleObligorExposure(sampleLoans, sampleMembers, sampleCoreCapital);

    // MEM-03 has 8 Lakhs loan currently.
    // If MEM-03 applies for 15 Lakhs mortgage loan:
    // Total = 8L + 15L = 23 Lakhs (within 30 Lakhs 15% limit -> COMPLIANT)
    const checkCompliant = simulateNewLoanSolPreCheck('MEM-03', 1500000, true, analysis);
    expect(checkCompliant.isCompliant).toBe(true);
    expect(checkCompliant.projectedExposure).toBe(2300000);
    expect(checkCompliant.headroomRemaining).toBe(700000);
    expect(checkCompliant.breachAmount).toBe(0);

    // If MEM-03 applies for 25 Lakhs mortgage loan:
    // Total = 8L + 25L = 33 Lakhs (exceeds 30 Lakhs limit -> BREACH by 3 Lakhs)
    const checkBreach = simulateNewLoanSolPreCheck('MEM-03', 2500000, true, analysis);
    expect(checkBreach.isCompliant).toBe(false);
    expect(checkBreach.projectedExposure).toBe(3300000);
    expect(checkBreach.breachAmount).toBe(300000);
  });

  it('generates a valid CSV export conforming to Section 51 audit requirements', () => {
    const analysis = calculateSingleObligorExposure(sampleLoans, sampleMembers, sampleCoreCapital);
    const csv = generateSingleObligorCsv(analysis);

    expect(csv).toContain('सहकारी ऐन २०७४ दफा ५१');
    expect(csv).toContain('प्राथमिक पूँजी कोष (Core Capital)');
    expect(csv).toContain('विनाधितो एकल ग्राहक सीमा (१०%)');
    expect(csv).toContain('धितोयुक्त एकल ग्राहक सीमा (१५%)');
    expect(csv).toContain('Bikram Bahadur Singh');
    expect(csv).toContain('BREACH');
  });
});
