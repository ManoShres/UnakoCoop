import { describe, it, expect } from 'vitest';
import {
  calculateInterestSpread,
  simulateRateRevisions,
  generateInterestSpreadCsv,
  ProductRateBucket,
  DEFAULT_PRODUCT_BUCKETS,
  STATUTORY_MAX_SPREAD,
} from '../interestSpreadEngine';

describe('Cooperative Act Section 50 Interest Rate Spread & Reference Rate Engine', () => {
  const customProducts: ProductRateBucket[] = [
    {
      id: 'D1',
      name: 'Ordinary Savings',
      nameNepali: 'साधारण बचत',
      category: 'DEPOSIT',
      principalBalance: 10000000, // 1 Crore
      interestRate: 6.0,
    },
    {
      id: 'D2',
      name: 'Fixed Deposit 1-Year',
      nameNepali: '१ वर्षे मुद्दती',
      category: 'DEPOSIT',
      principalBalance: 10000000, // 1 Crore
      interestRate: 10.0,
    },
    {
      id: 'L1',
      name: 'Agriculture Loan',
      nameNepali: 'कृषि कर्जा',
      category: 'LOAN',
      principalBalance: 10000000, // 1 Crore
      interestRate: 12.0,
    },
    {
      id: 'L2',
      name: 'Business Loan',
      nameNepali: 'व्यापार कर्जा',
      category: 'LOAN',
      principalBalance: 10000000, // 1 Crore
      interestRate: 13.0,
    },
  ];

  it('correctly calculates weighted average deposit and lending rates', () => {
    // Deposits: 1 Crore @ 6% + 1 Crore @ 10% = WADR 8.0%
    // Loans: 1 Crore @ 12% + 1 Crore @ 13% = WALR 12.5%
    // Spread = 12.5 - 8.0 = 4.5%
    const result = calculateInterestSpread(customProducts, 14.75);

    expect(result.totalDepositBalance).toBe(20000000);
    expect(result.totalLoanBalance).toBe(20000000);
    expect(result.weightedAvgDepositRate).toBe(8.0);
    expect(result.weightedAvgLendingRate).toBe(12.5);
    expect(result.spreadRate).toBe(4.5);
    expect(result.isSpreadCompliant).toBe(true);
    expect(result.spreadStatus).toBe('WARNING'); // 4.5% is within 0.25% of 4.75%
  });

  it('flags breach when spread exceeds 4.75% statutory limit', () => {
    const highSpreadProducts: ProductRateBucket[] = [
      {
        id: 'D1',
        name: 'Low Interest Savings',
        nameNepali: 'कम ब्याज बचत',
        category: 'DEPOSIT',
        principalBalance: 10000000,
        interestRate: 5.0,
      },
      {
        id: 'L1',
        name: 'High Interest Loan',
        nameNepali: 'उच्च ब्याज कर्जा',
        category: 'LOAN',
        principalBalance: 10000000,
        interestRate: 12.0, // Spread = 12.0 - 5.0 = 7.0% (> 4.75%)
      },
    ];

    const result = calculateInterestSpread(highSpreadProducts, 14.75);
    expect(result.spreadRate).toBe(7.0);
    expect(result.isSpreadCompliant).toBe(false);
    expect(result.spreadStatus).toBe('BREACH');
  });

  it('identifies loan products violating the Reference Interest Rate ceiling (14.75%)', () => {
    const productsWithCeilingBreach: ProductRateBucket[] = [
      ...customProducts,
      {
        id: 'L-EXCESS',
        name: 'High Risk Micro Loan',
        nameNepali: 'अत्यधिक ब्याज कर्जा',
        category: 'LOAN',
        principalBalance: 5000000,
        interestRate: 15.5, // Exceeds 14.75%
      },
    ];

    const result = calculateInterestSpread(productsWithCeilingBreach, 14.75);
    expect(result.isReferenceRateCompliant).toBe(false);
    expect(result.breachedLoanProducts).toHaveLength(1);
    expect(result.breachedLoanProducts[0].id).toBe('L-EXCESS');
  });

  it('simulates interest rate revisions accurately', () => {
    // Baseline: WADR 8.0%, WALR 12.5%, Spread 4.5%
    // If we lower loan L1 from 12% to 11.5%:
    // New WALR = (11.5 + 13.0) / 2 = 12.25%
    // New Spread = 12.25 - 8.0 = 4.25% (COMPLIANT)
    const simulated = simulateRateRevisions(customProducts, [
      { productId: 'L1', simulatedRate: 11.5 },
    ]);

    expect(simulated.weightedAvgLendingRate).toBe(12.25);
    expect(simulated.spreadRate).toBe(4.25);
    expect(simulated.spreadStatus).toBe('COMPLIANT');
  });

  it('generates a valid CSV export conforming to Department of Cooperatives format', () => {
    const analysis = calculateInterestSpread(DEFAULT_PRODUCT_BUCKETS);
    const csv = generateInterestSpreadCsv(analysis, DEFAULT_PRODUCT_BUCKETS);

    expect(csv).toContain('ब्याजदर अन्तर (Spread Rate) तथा सन्दर्भ दर विवरण');
    expect(csv).toContain('भारित औसत कर्जा ब्याजदर (WALR)%');
    expect(csv).toContain('भारित औसत निक्षेप ब्याजदर (WADR)%');
    expect(csv).toContain(analysis.spreadRate.toString());
    expect(csv).toContain('साधारण बचत');
    expect(csv).toContain('कृषि तथा पशुपालन कर्जा');
  });
});
