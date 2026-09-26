import { describe, it, expect } from 'vitest';
import {
  calculatePhysicalTotal,
  reconcileDrawerSession,
  INITIAL_DENOMINATIONS,
} from '../tellerOperations';

describe('Teller Operations & Denomination Calculations', () => {
  it('correctly calculates total value of physical banknotes and coins', () => {
    const denoms = {
      ...INITIAL_DENOMINATIONS,
      n1000: 10, // 10,000
      n500: 4, // 2,000
      n100: 5, // 500
      n50: 2, // 100
      n10: 1, // 10
      coins: 5, // 5
    };

    expect(calculatePhysicalTotal(denoms)).toBe(12615);
  });

  it('marks drawer as BALANCED when counted cash equals expected cash', () => {
    const openingFloat = 100000;
    const cashReceived = 50000;
    const cashDisbursed = 20000;
    // Expected: 130,000

    const denoms = {
      ...INITIAL_DENOMINATIONS,
      n1000: 130, // 130,000
    };

    const result = reconcileDrawerSession(
      openingFloat,
      cashReceived,
      cashDisbursed,
      denoms
    );

    expect(result.expectedBalance).toBe(130000);
    expect(result.actualBalance).toBe(130000);
    expect(result.variance).toBe(0);
    expect(result.status).toBe('BALANCED');
  });

  it('detects cash shortage (घाटा) when counted cash is less than expected', () => {
    const openingFloat = 100000;
    const cashReceived = 50000;
    const cashDisbursed = 20000;
    // Expected: 130,000

    const denoms = {
      ...INITIAL_DENOMINATIONS,
      n1000: 125, // 125,000 (Shortage of 5,000)
    };

    const result = reconcileDrawerSession(
      openingFloat,
      cashReceived,
      cashDisbursed,
      denoms
    );

    expect(result.expectedBalance).toBe(130000);
    expect(result.actualBalance).toBe(125000);
    expect(result.variance).toBe(-5000);
    expect(result.status).toBe('DISCREPANCY');
  });

  it('detects cash surplus (बचत) when counted cash exceeds expected', () => {
    const openingFloat = 50000;
    const cashReceived = 20000;
    const cashDisbursed = 10000;
    // Expected: 60,000

    const denoms = {
      ...INITIAL_DENOMINATIONS,
      n1000: 61, // 61,000 (Surplus of 1,000)
    };

    const result = reconcileDrawerSession(
      openingFloat,
      cashReceived,
      cashDisbursed,
      denoms
    );

    expect(result.expectedBalance).toBe(60000);
    expect(result.actualBalance).toBe(61000);
    expect(result.variance).toBe(1000);
    expect(result.status).toBe('DISCREPANCY');
  });

  describe('Day-End Handover CSV Export', () => {
    it('generates compliant CSV with denomination rows and headers', async () => {
      const { generateDayEndHandoverCsv, MOCK_TELLER_SESSION } = await import('../tellerOperations');
      const mockSettings = {
        name: 'Unako SACCOS Ltd',
        nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
        address: 'Gadhwa-5, Dang',
        regNo: '234/065/066',
        panNo: '302847591',
      };

      const csv = generateDayEndHandoverCsv(MOCK_TELLER_SESSION, mockSettings);

      expect(csv).toContain('उनको बचत तथा ऋण सहकारी संस्था लि.');
      expect(csv).toContain('234/065/066');
      expect(csv).toContain('रु. १००० नोट');
      expect(csv).toContain('350000');
      expect(csv).toContain('425000');
      expect(csv).toContain('BALANCED');
    });
  });
});
