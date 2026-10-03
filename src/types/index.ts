/**
 * Core Types Barrel Export
 *
 * Re-exports all domain types for seamless backwards-compatibility across the app.
 * Domain types are organized under:
 * - member.ts: Member, KYC, and User Roles
 * - savings.ts: SavingsAccount and account types
 * - loan.ts: Loan, Collateral, Schemes, Applications, and Provisioning
 * - transaction.ts: Transaction, GatewayRail, Cash Desk, and Drawer Sessions
 * - employee.ts: Employee, FieldOfficer, and RBAC Roles
 * - motherGroup.ts: MotherGroup, Meetings, Collections, and Deposits
 * - financial.ts: Trading, Reconciliation, Dividends, and Statutory Reserve Funds
 * - governance.ts: Inquiries, Notices, Notifications, Reports, PEARLS, and Theme Settings
 */

// Member & User Identity
export * from './member';

// Savings Accounts
export * from './savings';

// Loans, Collaterals & Provisioning
export * from './loan';

// Transactions & Teller Desk
export * from './transaction';

// Employees & Staff
export * from './employee';

// Mother Groups (SHGs)
export * from './motherGroup';

// Financial, Accounting & Funds
export * from './financial';

// Governance, Reports, Theme & Settings
export * from './governance';

// Warehouse Receipt & Agro-Pledge Financing
export * from './warehouseReceipt';

// Field Mobility & Collector Mode
export * from './fieldCollector';

// Agri-Input Advance & Fertilizer Quotas
export * from './agriInput';


