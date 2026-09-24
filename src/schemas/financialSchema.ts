/**
 * Zod validation schemas for financial operations — Loans, Savings, Transactions.
 */
import { z } from 'zod';

// ────────────────────────────────────────────────────
// Savings Account
// ────────────────────────────────────────────────────
export const SAVINGS_STATUS = ['ACTIVE', 'DORMANT', 'MATURED'] as const;

export const CreateSavingsAccountSchema = z.object({
  memberId: z.string().trim().min(1, 'Member ID is required').optional(),
  accountNo: z.string().trim().min(1, 'Account number is required').max(30),
  accountType: z.string().trim().min(1, 'Account type is required').max(100),
  balance: z.number().min(0, 'Balance cannot be negative').default(0),
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
    .max(100_000_000, 'Amount exceeds maximum limit'),
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
] as const;

export const CreateTransactionSchema = z.object({
  memberId: z.string().trim().min(1, 'Member ID is required'),
  accountId: z.string().trim().min(1, 'Account is required'),
  type: z.enum(TRANSACTION_TYPE),
  amount: z
    .number()
    .positive('Amount must be greater than zero')
    .max(100_000_000, 'Amount exceeds maximum limit'),
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
