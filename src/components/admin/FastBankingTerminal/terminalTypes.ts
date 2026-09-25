import { z } from 'zod';

export type TerminalOperationType =
  | 'SAVINGS_DEPOSIT'
  | 'SAVINGS_WITHDRAWAL'
  | 'SAVINGS_BALANCE_INQUIRY'
  | 'LOAN_EMI_PAYMENT'
  | 'LOAN_FULL_SETTLEMENT'
  | 'LOAN_SCHEDULE_INQUIRY'
  | 'SHARE_PURCHASE'
  | 'SHARE_CERTIFICATE_INQUIRY'
  | 'TELLER_DENOMINATION_ENTRY'
  | 'TELLER_DRAWER_RECONCILE';

export interface TerminalNode {
  id: string;
  code: string;
  labelNe: string;
  labelEn: string;
  badge?: string;
  icon?: string;
  descriptionNe?: string;
  descriptionEn?: string;
  operation?: TerminalOperationType;
  children?: TerminalNode[];
}

/**
 * Strict Zod schema for Fast Banking Terminal transactions (ECC Security Standard)
 */
export const FastTransactionSchema = z.object({
  operation: z.enum([
    'SAVINGS_DEPOSIT',
    'SAVINGS_WITHDRAWAL',
    'SAVINGS_BALANCE_INQUIRY',
    'LOAN_EMI_PAYMENT',
    'LOAN_FULL_SETTLEMENT',
    'LOAN_SCHEDULE_INQUIRY',
    'SHARE_PURCHASE',
    'SHARE_CERTIFICATE_INQUIRY',
    'TELLER_DENOMINATION_ENTRY',
    'TELLER_DRAWER_RECONCILE',
  ]),
  accountNo: z
    .string()
    .min(3, 'Account or Member number must be at least 3 characters.')
    .max(50, 'Account number too long.')
    .trim(),
  amount: z
    .number()
    .positive('Amount must be greater than zero.')
    .max(5000000, 'Exceeds single teller authorization limit of NPR 50,00,000.'),
  remarks: z
    .string()
    .max(250, 'Remarks cannot exceed 250 characters.')
    .optional()
    .transform(val => (val ? val.trim() : 'CBS Terminal Transaction')),
});

export type FastTransactionInput = z.infer<typeof FastTransactionSchema>;

export interface FastTransactionReceipt {
  referenceNo: string;
  timestamp: string;
  operation: TerminalOperationType;
  memberName: string;
  memberId: string;
  accountNo: string;
  amount: number;
  newBalance?: number;
  remarks: string;
  tellerName: string;
}
