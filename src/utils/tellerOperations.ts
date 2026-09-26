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

/**
 * Generates official Day-End Cashier Handover CSV content compliant with Department of Cooperatives audit standards
 */
export function generateDayEndHandoverCsv(
  session: TellerDrawerSession,
  coopSettings: { nameNepali: string; name: string; address: string; regNo: string; panNo: string }
): string {
  const lines: string[] = [];
  lines.push(`"${coopSettings.nameNepali}"`);
  lines.push(`"${coopSettings.name}"`);
  lines.push(`"ठेगाना: ${coopSettings.address} | दर्ता नं: ${coopSettings.regNo} | प्यान: ${coopSettings.panNo}"`);
  lines.push(`"दैनिक काउन्टर नगद मिलान तथा भल्ट दाखिला विवरण (Day-End Cashier Handover Reconciliation)"`);
  lines.push(`"मिति: ${session.sessionDate} B.S. | शाखा: ${session.branch} | क्यासियर: ${session.tellerName}"`);
  lines.push('');
  lines.push('कारोबार सारांश (Transaction Summary),रकम (NPR)');
  lines.push(`बिहानी सुरुवाती मौज्दात (Opening Float),${session.openingFloat}`);
  lines.push(`दिनभर संकलित नगद (Total Cash Received),${session.cashReceived}`);
  lines.push(`दिनभर भुक्तानी भएको नगद (Total Cash Disbursed),${session.cashDisbursed}`);
  lines.push(`सफ्टवेयर अनुसार हुनुपर्ने मौज्दात (Expected Balance),${session.expectedBalance}`);
  lines.push(`गनेको भौतिक नगद (Counted Physical Balance),${session.actualBalance}`);
  lines.push(`फरक रकम (Variance / घाटा वा बचत),${session.variance}`);
  lines.push(`स्थिति (Status),${session.status}`);
  lines.push('');
  lines.push('भौतिक नोट गन्ती विवरण (Denomination Breakdown),दर (Rate),थान (Count),जम्मा रकम (Total NPR)');

  const d = session.denominations;
  lines.push(`रु. १००० नोट,1000,${d.n1000},${d.n1000 * 1000}`);
  lines.push(`रु. ५०० नोट,500,${d.n500},${d.n500 * 500}`);
  lines.push(`रु. १०० नोट,100,${d.n100},${d.n100 * 100}`);
  lines.push(`रु. ५० नोट,50,${d.n50},${d.n50 * 50}`);
  lines.push(`रु. २० नोट,20,${d.n20},${d.n20 * 20}`);
  lines.push(`रु. १० नोट,10,${d.n10},${d.n10 * 10}`);
  lines.push(`रु. ५ नोट,5,${d.n5},${d.n5 * 5}`);
  lines.push(`रु. २ नोट,2,${d.n2},${d.n2 * 2}`);
  lines.push(`रु. १ नोट,1,${d.n1},${d.n1 * 1}`);
  lines.push(`सिक्का (Coins),1,${d.coins},${d.coins}`);
  lines.push(
    `कुल भौतिक मौज्दात (Total Cash),-,${Object.values(d).reduce((a, b) => a + b, 0)},${session.actualBalance}`
  );
  lines.push('');
  lines.push(`"रोहवर प्रबन्धक (Branch Manager Witness): ${session.vaultHandoverWitness || 'N/A'}"`);
  lines.push(`"दाखिला समय (Closed At): ${session.closedAt || new Date().toISOString()}"`);

  return lines.join('\n');
}

/**
 * Initiates browser download of the Day-End Handover CSV
 */
export function downloadDayEndHandoverCsv(
  session: TellerDrawerSession,
  coopSettings: { nameNepali: string; name: string; address: string; regNo: string; panNo: string }
): void {
  const csv = generateDayEndHandoverCsv(session, coopSettings);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `UNAKO-TELLER-CLOSING-${session.sessionDate.replace(/-/g, '')}-${session.id}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

