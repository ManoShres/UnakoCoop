/**
 * Financial Management Domain Types (Trading, Reconciliation, Profit Distribution, Statutory Funds)
 */

// ---------------------------------------------------------------------------
// Trading types (investment, FX, commodity transactions)
// ---------------------------------------------------------------------------

export type TradingType =
  | 'PURCHASE'
  | 'SALE'
  | 'FX_GAIN'
  | 'FX_LOSS'
  | 'DIVIDEND_INCOME'
  | 'INTEREST_INCOME'
  | 'CAPITAL_GAIN'
  | 'CAPITAL_LOSS'
  | 'FEE_INCOME'
  | 'EXPENSE';

export type TradingCategory = 'INVESTMENT' | 'FOREIGN_EXCHANGE' | 'COMMODITY' | 'SERVICE_FEE' | 'OPERATING_EXPENSE';

export interface TradingTransaction {
  id: string;
  date: string;
  type: TradingType;
  description: string;
  category: TradingCategory;
  buyAmount?: number;
  sellAmount?: number;
  quantity?: number;
  unitPrice?: number;
  currency?: string;
  exchangeRate?: number;
  amountInNPR: number;
  referenceNo?: string;
  recordedBy: string;
  recordedByName?: string;
  status: 'PENDING' | 'COMPLETED' | 'VOID';
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Reconciliation types (bank statement matching)
// ---------------------------------------------------------------------------

export type ReconciliationStatus = 'PENDING' | 'MATCHED' | 'MISMATCH' | 'RESOLVED';
export type MismatchType = 'AMOUNT_MISMATCH' | 'MISSING_ENTRY' | 'DUPLICATE_ENTRY' | 'WRONG_DATE' | 'WRONG_REFERENCE';

export interface BankStatementEntry {
  id: string;
  statementDate: string;
  description: string;
  amount: number;
  referenceNo?: string;
  debitOrCredit: 'DEBIT' | 'CREDIT';
  uploadedBy: string;
  uploadedByName?: string;
  filePath?: string;
  uploadedAt: string;
}

export interface ReconciliationEntry {
  id: string;
  transactionId?: string;
  transactionAmount?: number;
  transactionDate?: string;
  transactionRef?: string;
  statementEntryId?: string;
  statementAmount?: number;
  statementDate?: string;
  statementRef?: string;
  amount: number;
  date: string;
  description: string;
  referenceNo?: string;
  status: ReconciliationStatus;
  mismatchType?: MismatchType;
  mismatchDetails?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedDate?: string;
  resolutionNotes?: string;
  flaggedAt: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Profit distribution types (AGM dividend + patronage appropriation)
// ---------------------------------------------------------------------------

export type ProfitDistributionStatus = 'DRAFT' | 'APPROVED' | 'DISTRIBUTED';

/** One statutory/appropriation line of the profit distribution plan. */
export interface ProfitAllocationLine {
  key:
    | 'GENERAL_RESERVE'
    | 'RISK_FUND'
    | 'MEMBER_DIVIDEND'
    | 'PATRONAGE_BONUS'
    | 'STAFF_BONUS'
    | 'WELFARE_FUND'
    | 'RETAINED_SURPLUS';
  label: string;
  labelNepali: string;
  /** Allocation basis in percent of net distributable profit. */
  percent: number;
  amount: number;
}

/** Per-member payout row (dividend + patronage − dividend tax). */
export interface ProfitPayoutLine {
  memberId?: string;
  memberNo: string;
  memberName: string;
  shareCapital: number;
  dividendAmount: number;
  patronageAmount: number;
  /** Dividend tax withheld (5% per prevailing Nepal practice). */
  taxDeduction: number;
  netPayable: number;
  /** Teller-ledger reference once distributed (DIVIDEND transaction). */
  transactionRef?: string;
}

export interface ProfitDistribution {
  id: string;
  fiscalYear: string; // e.g. '2081/82'
  periodLabel: string; // e.g. 'FY 2081/82 (Shrawan–Asar)'
  netProfit: number; // computed surplus before appropriation
  allocations: ProfitAllocationLine[];
  payouts: ProfitPayoutLine[];
  status: ProfitDistributionStatus;
  createdBy: string;
  createdByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  distributedAt?: string;
  createdAt: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Statutory Reserve Funds types (Cooperative Act 2074 Sec 68)
// ---------------------------------------------------------------------------

export type StatutoryFundType =
  | 'GENERAL_RESERVE'
  | 'COOP_PROMOTION'
  | 'COOP_EDUCATION'
  | 'COMMUNITY_DEVELOPMENT'
  | 'EMPLOYEE_BONUS'
  | 'SHARE_DIVIDEND_STABILIZATION';

export interface StatutoryFundRecord {
  id: string;
  fundType: StatutoryFundType;
  nameNepali: string;
  nameEnglish: string;
  mandatedPercent: string;
  currentBalance: number;
  allocatedThisYear: number;
  utilizedThisYear: number;
  legalBasis: string;
  descriptionNepali: string;
}

export interface SharePool {
  parValue: number;
  totalAllottedKitta: number;
  totalReserveFund: number;
  annualDividendPercent: number;
  patronageBonusPercent: number;
  sharePurchaseOpen: boolean;
}
