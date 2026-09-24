import { Member, SavingsAccount, Loan, Transaction } from '../../../../types';

export interface MemberDashboardAccountSummary {
  regularSavings: number;
  compulsorySavings: number;
  shareCapital: number;
  fixedDeposits: number;
  totalNetWorth: number;
  activeLoanBalance: number;
  primaryAccountNo: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  labelNepali: string;
  sub: string;
  iconName: string;
  to?: string;
  onClick?: () => void;
  variant: 'primary' | 'secondary' | 'accent' | 'outline';
}

export type TransactionFilterType = 'all' | 'deposits' | 'debits' | 'loan_emi' | 'interest';
