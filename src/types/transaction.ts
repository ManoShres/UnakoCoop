/**
 * Transaction and Cash Desk Domain Types
 */

export interface Transaction {
  id: string;
  /** Owning member id (nullable for counter/cash-office transactions). */
  memberId?: string;
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'LOAN_EMI' | 'DIVIDEND' | 'SHARE_PURCHASE';
  description: string;
  amount: number;
  referenceNo: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface GatewayRail {
  id: string;
  name: string;
  type: 'WALLET' | 'BANK' | 'IPS' | 'QR';
  status: 'ACTIVE' | 'MAINTENANCE' | 'DISABLED';
  dailyLimit: number;
  surchargePercent: number;
  reconciliationCycle: string;
}

export interface DenominationBreakdown {
  n1000: number;
  n500: number;
  n100: number;
  n50: number;
  n20: number;
  n10: number;
  n5: number;
  n2: number;
  n1: number;
  coins: number;
}

export type DrawerStatus = 'OPEN' | 'BALANCED' | 'DISCREPANCY' | 'CLOSED_TO_VAULT';

export interface TellerDrawerSession {
  id: string;
  tellerId: string;
  tellerName: string;
  branch: string;
  sessionDate: string; // BS date, e.g. '2081-11-14'
  openingFloat: number;
  cashReceived: number; // total cash in (deposits + loan repayments)
  cashDisbursed: number; // total cash out (withdrawals + loan disbursements)
  expectedBalance: number; // openingFloat + cashReceived - cashDisbursed
  actualBalance: number; // counted physical cash
  variance: number; // actualBalance - expectedBalance (positive = surplus/बचत, negative = shortage/घाटा)
  denominations: DenominationBreakdown;
  status: DrawerStatus;
  notes?: string;
  vaultHandoverWitness?: string;
  closedAt?: string;
  createdAt: string;
}
