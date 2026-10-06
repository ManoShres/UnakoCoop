/**
 * Zod validation schemas for financial operations — Loans, Savings, Transactions.
 */
import { z } from 'zod';
import type { Transaction, TransactionType } from '../types/transaction';

/**
 * Shared money ceiling for every monetary field. Must match the server ledger ceiling
 * (`LEDGER_MAX_AMOUNT` / `ledger_max_amount()` in supabase/migrations/0001_ledger.sql).
 */
export const MAX_FINANCIAL_AMOUNT = 100_000_000;

// ────────────────────────────────────────────────────
// Savings Account
// ────────────────────────────────────────────────────
export const SAVINGS_STATUS = ['ACTIVE', 'DORMANT', 'MATURED'] as const;

export const CreateSavingsAccountSchema = z.object({
  memberId: z.string().trim().min(1, 'Member ID is required').optional(),
  accountNo: z.string().trim().min(1, 'Account number is required').max(30),
  accountType: z.string().trim().min(1, 'Account type is required').max(100),
  // A new account opens EMPTY: a balance may only arrive through a posted deposit
  // (single-entry balance injection was a ledger-integrity defect).
  // NEEDS SIGN-OFF: fixed-deposit accounts that legitimately open funded must use a
  // dedicated funding path, not a caller-supplied opening balance.
  balance: z
    .number()
    .min(0, 'Balance cannot be negative')
    .max(MAX_FINANCIAL_AMOUNT, `Balance must not exceed ${MAX_FINANCIAL_AMOUNT}`)
    .default(0)
    .refine((v) => v === 0, {
      message: 'New savings accounts must open with a zero balance; fund the account via a deposit.',
    }),
  interestRate: z.number().min(0, 'Interest rate cannot be negative').max(100).default(0),
  openedDate: z.string().trim().min(1, 'Opened date is required'),
  maturityDate: z.string().trim().optional(),
  status: z.enum(SAVINGS_STATUS).default('ACTIVE'),
});

// ────────────────────────────────────────────────────
// Loan Application
// ────────────────────────────────────────────────────
export const LOAN_APPLICATION_STATUS = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'DISBURSED',
  'REJECTED',
  'CANCELLED',
] as const;

export const COLLATERAL_TYPE = [
  'LAND_LALPURJA',
  'BUILDING',
  'CASH_FD_PLEDGE',
  'SHARE_PLEDGE',
  'LIVESTOCK',
  'GOLD_JEWELLERY',
  'VEHICLE',
  'GUARANTOR',
  'GROUP_GUARANTEE',
  'OTHER',
] as const;

export const CreateLoanApplicationSchema = z.object({
  memberId: z.string().trim().min(1, 'Member ID is required'),
  loanSchemeId: z.string().trim().min(1, 'Loan scheme is required'),
  requestedAmount: z
    .number()
    .positive('Requested amount must be greater than zero')
    .max(MAX_FINANCIAL_AMOUNT, 'Amount exceeds maximum limit'),
  purpose: z
    .string()
    .trim()
    .min(10, 'Purpose must be at least 10 characters')
    .max(500, 'Purpose must be 500 characters or less'),
  requestedTermMonths: z
    .number()
    .int('Term must be a whole number')
    .min(1, 'Term must be at least 1 month')
    .max(360, 'Term cannot exceed 360 months'),
  collateralType: z.enum(COLLATERAL_TYPE).optional(),
  collateralDescription: z.string().trim().max(500).optional(),
  collateralValue: z.number().min(0).optional(),
  guarantor1Name: z.string().trim().max(100).optional(),
  guarantor1MemberNo: z.string().trim().max(20).optional(),
  guarantor2Name: z.string().trim().max(100).optional(),
  guarantor2MemberNo: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(2000).optional(),
});

// ────────────────────────────────────────────────────
// Transaction
// ────────────────────────────────────────────────────

/**
 * Canonical transaction-type vocabulary — MUST stay in lock-step with the domain
 * `TransactionType` union in `src/types/transaction.ts`. `LOAN_EMI` is a legacy alias
 * that is always normalised to `LOAN_REPAYMENT` before persistence.
 */
export const TRANSACTION_TYPE = [
  'DEPOSIT',
  'WITHDRAWAL',
  'TRANSFER',
  'LOAN_DISBURSEMENT',
  'LOAN_REPAYMENT',
  'INTEREST_CREDIT',
  'FEE',
  'DIVIDEND',
  'SHARE_PURCHASE',
  'SHARE_REFUND',
  'LOAN_EMI',
] as const;

export type CanonicalTransactionType = (typeof TRANSACTION_TYPE)[number];

/** The single shared legacy→canonical mapping used by every service (no ad-hoc rewrites). */
export const LEGACY_TRANSACTION_TYPE_TO_CANONICAL: Record<
  TransactionType,
  CanonicalTransactionType
> = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  TRANSFER: 'TRANSFER',
  LOAN_DISBURSEMENT: 'LOAN_DISBURSEMENT',
  LOAN_REPAYMENT: 'LOAN_REPAYMENT',
  INTEREST_CREDIT: 'INTEREST_CREDIT',
  FEE: 'FEE',
  DIVIDEND: 'DIVIDEND',
  SHARE_PURCHASE: 'SHARE_PURCHASE',
  SHARE_REFUND: 'SHARE_REFUND',
  LOAN_EMI: 'LOAN_REPAYMENT',
};

/** Compile-time guard: the schema vocabulary and the domain union must not drift. */
type DomainTransactionType = Transaction['type'];
const _assertSchemaCoversDomain: Record<DomainTransactionType, CanonicalTransactionType> =
  LEGACY_TRANSACTION_TYPE_TO_CANONICAL;
void _assertSchemaCoversDomain;

/** Normalises any legacy transaction type to its canonical persisted value. */
export function normalizeTransactionType(type: string): CanonicalTransactionType {
  const mapped = LEGACY_TRANSACTION_TYPE_TO_CANONICAL[type as DomainTransactionType];
  if (mapped) return mapped;
  // Unknown values are rejected by CreateTransactionSchema before reaching persistence.
  return type as CanonicalTransactionType;
}

export const CreateTransactionSchema = z.object({
  memberId: z.string().trim().min(1, 'Member ID is required').optional(),
  accountId: z.string().trim().min(1, 'Account is required'),
  type: z.enum(TRANSACTION_TYPE),
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .max(MAX_FINANCIAL_AMOUNT, 'Amount exceeds maximum limit'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  reference: z.string().trim().max(50).optional(),
});

// ────────────────────────────────────────────────────
// Inquiry (public contact form)
// ────────────────────────────────────────────────────
export const CreateInquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().trim().max(20).optional(),
  subject: z
    .string()
    .trim()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be 200 characters or less'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be 5000 characters or less'),
  category: z
    .enum(['GENERAL', 'LOAN', 'SAVINGS', 'MEMBERSHIP', 'COMPLAINT', 'OTHER'])
    .default('GENERAL'),
});

export type CreateSavingsAccountInput = z.infer<typeof CreateSavingsAccountSchema>;
export type CreateLoanApplicationInput = z.infer<typeof CreateLoanApplicationSchema>;
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type CreateInquiryInput = z.infer<typeof CreateInquirySchema>;

// ────────────────────────────────────────────────────
// Loan persistence payloads
// ────────────────────────────────────────────────────
export const LOAN_STATUS = ['ACTIVE', 'UNDER_REVIEW', 'PAID_OFF', 'OVERDUE'] as const;

export const CreateLoanSchema = z
  .object({
    memberId: z.string().trim().min(1, 'Member ID is required').optional(),
    loanNo: z.string().trim().min(1, 'Loan number is required').max(50),
    loanType: z.string().trim().min(1, 'Loan type is required').max(100),
    principalAmount: z
      .number()
      .positive('Principal must be greater than zero')
      .max(MAX_FINANCIAL_AMOUNT, 'Principal exceeds maximum limit'),
    remainingBalance: z
      .number()
      .min(0, 'Remaining balance cannot be negative')
      .max(MAX_FINANCIAL_AMOUNT, 'Remaining balance exceeds maximum limit'),
    interestRate: z.number().min(0, 'Interest rate cannot be negative').max(100),
    tenureMonths: z.number().int('Tenure must be a whole number').min(1).max(360),
    monthlyEmi: z.number().min(0, 'EMI cannot be negative').max(MAX_FINANCIAL_AMOUNT),
    disbursedDate: z.string().trim().min(1, 'Disbursement date is required'),
    nextDueDate: z.string().trim().min(1, 'Next due date is required'),
    status: z.enum(LOAN_STATUS),
    collateralDescription: z.string().trim().max(500),
  })
  .refine((loan) => loan.remainingBalance <= loan.principalAmount, {
    message: 'Remaining balance cannot exceed the principal amount.',
    path: ['remainingBalance'],
  });

/**
 * Metadata-only loan update. `remainingBalance` is deliberately NOT part of this schema:
 * balances move only through the repayment path, which forbids increases.
 */
export const LoanMetadataUpdateSchema = z
  .object({
    status: z.enum(LOAN_STATUS).optional(),
    nextDueDate: z.string().trim().min(1).optional(),
    interestRate: z.number().min(0, 'Interest rate cannot be negative').max(100).optional(),
  })
  .strict();

export type CreateLoanInput = z.infer<typeof CreateLoanSchema>;
export type LoanMetadataUpdateInput = z.infer<typeof LoanMetadataUpdateSchema>;
