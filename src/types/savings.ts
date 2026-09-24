/**
 * Savings Account Domain Types
 */

export interface SavingsAccount {
  id: string;
  /** Owning member id (nullable when the account has no linked member yet). */
  memberId?: string;
  accountNo: string;
  accountType: 'Regular Savings' | 'Fixed Deposit (1 Year)' | 'Women Empowerment Fund' | 'Child Education Savings' | (string & {});
  balance: number;
  interestRate: number; // percentage, e.g. 8.5
  openedDate: string;
  maturityDate?: string;
  status: 'ACTIVE' | 'DORMANT' | 'MATURED';
}
