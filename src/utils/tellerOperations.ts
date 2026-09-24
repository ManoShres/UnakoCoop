/**
 * Teller Operations & Cash Drawer Reconciliation Utilities
 * Complies with dual-control vault & physical denomination cash-desk standards in Nepal.
 */

import { DenominationBreakdown, TellerDrawerSession, DrawerStatus } from '../types';

export const DENOMINATION_MULTIPLIERS = {
  n1000: 1000,
  n500: 500,
  n100: 100,
  n50: 50,
  n20: 20,
  n10: 10,
  n5: 5,
  n2: 2,
  n1: 1,
  coins: 1,
} as const;

export const INITIAL_DENOMINATIONS: DenominationBreakdown = {
  n1000: 0,
  n500: 0,
  n100: 0,
  n50: 0,
  n20: 0,
  n10: 0,
  n5: 0,
  n2: 0,
  n1: 0,
  coins: 0,
};

/**
 * Calculates the total physical cash amount in NPR from denomination quantities.
 */
export function calculatePhysicalTotal(denominations: DenominationBreakdown): number {
  return (
    denominations.n1000 * 1000 +
    denominations.n500 * 500 +
    denominations.n100 * 100 +
    denominations.n50 * 50 +
    denominations.n20 * 20 +
    denominations.n10 * 10 +
    denominations.n5 * 5 +
    denominations.n2 * 2 +
    denominations.n1 * 1 +
    denominations.coins
  );
}

/**
 * Determines drawer status and variance based on physical vs expected cash.
 */
export function reconcileDrawerSession(
  openingFloat: number,
  cashReceived: number,
  cashDisbursed: number,
  denominations: DenominationBreakdown
): {
  expectedBalance: number;
  actualBalance: number;
  variance: number;
  status: DrawerStatus;
} {
  const expectedBalance = openingFloat + cashReceived - cashDisbursed;
  const actualBalance = calculatePhysicalTotal(denominations);
  const variance = actualBalance - expectedBalance;

  let status: DrawerStatus = 'OPEN';
  if (variance === 0 && actualBalance > 0) {
    status = 'BALANCED';
  } else if (variance !== 0) {
    status = 'DISCREPANCY';
  }

  return {
    expectedBalance,
    actualBalance,
    variance,
    status,
  };
}

/**
 * Default mock teller session for interactive demonstration.
 */
export const MOCK_TELLER_SESSION: TellerDrawerSession = {
  id: 'TEL-SESS-2081-089',
  tellerId: 'emp-004',
  tellerName: 'Bikash Karki (वरिष्ठ नगद अधिकृत / Cashier)',
  branch: 'Main Branch - Chabahil, Kathmandu',
  sessionDate: '2081-11-14',
  openingFloat: 150000, // 1.5 Lakhs morning vault float
  cashReceived: 485000, // collections & deposits today
  cashDisbursed: 210000, // withdrawals & disbursements
  expectedBalance: 425000, // 150000 + 485000 - 210000 = 425,000
  actualBalance: 425000,
  variance: 0,
  denominations: {
    n1000: 350, // 350,000
    n500: 120, // 60,000
    n100: 120, // 12,000
    n50: 40, // 2,000
    n20: 30, // 600
    n10: 25, // 250
    n5: 20, // 100
    n2: 15, // 30
    n1: 20, // 20
    coins: 0,
  },
  status: 'BALANCED',
  vaultHandoverWitness: 'Shyam Sundar Shrestha (शाखा प्रबन्धक / Branch Manager)',
  createdAt: '2081-11-14T09:30:00Z',
};
