/**
 * Operational Services Barrel Export
 *
 * Re-exports operational services organized by domain:
 * - memberService: Members, Auth linkage, and KYM validation
 * - savingsService: Savings accounts and voluntary deposit schemes
 * - loanService: Loans and Loan Applications
 * - transactionService: Counter and CBS transactions
 * - communicationService: Notices, Notifications, and Inquiries
 */

// Member Domain Service
export * from './memberService';

// Savings Domain Service
export * from './savingsService';

// Loan Domain Service
export * from './loanService';

// Transaction Domain Service
export * from './transactionService';

// Communication Domain Service
export * from './communicationService';
