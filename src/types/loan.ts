/**
 * Loan and Credit Facility Domain Types
 */

export type CollateralType =
  | 'LAND_LALPURJA'
  | 'BUILDING'
  | 'CASH_FD_PLEDGE'
  | 'SHARE_PLEDGE'
  | 'LIVESTOCK'
  | 'GOLD_JEWELLERY'
  | 'VEHICLE'
  | 'GUARANTOR'
  | 'GROUP_GUARANTEE'
  | 'OTHER';

export type CollateralCoverStatus = 'PLEDGED' | 'INSURED' | 'RELEASED' | 'UNDER_REVIEW';

export type LoanType =
  | 'Agricultural & Livestock'
  | 'Small Business Enterprise'
  | 'Education & Career'
  | 'Emergency Relieve'
  | 'Home & Land';

export interface LoanSchemeOption {
  type: LoanType;
  labelNe: string;
  labelEn: string;
  defaultRate: number;
  maxTenure: number;
}

export const LOAN_SCHEMES: readonly LoanSchemeOption[] = [
  {
    type: 'Agricultural & Livestock',
    labelNe: 'कृषि तथा पशुपालन कर्जा',
    labelEn: 'Agricultural & Livestock',
    defaultRate: 11.5,
    maxTenure: 36,
  },
  {
    type: 'Small Business Enterprise',
    labelNe: 'साना व्यवसाय उद्यम कर्जा',
    labelEn: 'Small Business Enterprise',
    defaultRate: 13.5,
    maxTenure: 48,
  },
  {
    type: 'Education & Career',
    labelNe: 'शिक्षा तथा वृत्तिविकास कर्जा',
    labelEn: 'Education & Career',
    defaultRate: 10.0,
    maxTenure: 60,
  },
  {
    type: 'Emergency Relieve',
    labelNe: 'आपतकालीन राहत कर्जा',
    labelEn: 'Emergency Relieve',
    defaultRate: 9.0,
    maxTenure: 12,
  },
  {
    type: 'Home & Land',
    labelNe: 'आवास तथा घडेरी कर्जा',
    labelEn: 'Home & Land',
    defaultRate: 12.5,
    maxTenure: 60,
  },
] as const;

export interface Loan {
  id: string;
  loanNo: string;
  /** Owning member id (nullable for legacy rows without a linked member). */
  memberId?: string;
  loanType: LoanType;
  principalAmount: number;
  remainingBalance: number;
  interestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  disbursedDate: string;
  nextDueDate: string;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'PAID_OFF' | 'OVERDUE';
  collateralDescription: string;
  /** Collateral register classification (see CollateralRegisterPage). */
  collateralType?: CollateralType;
  /** Assessed market value of the collateral in NPR. */
  collateralValue?: number;
  /** Registered owner / guarantor of the collateral. */
  collateralOwner?: string;
  /** Livestock / agriculture / asset insurance policy number. */
  insurancePolicyNo?: string;
  collateralStatus?: CollateralCoverStatus;
}

export interface LoanApplication {
  id: string;
  applicationNo: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  loanType: LoanType;
  requestedAmount: number;
  tenureMonths: number;
  monthlyIncome: number;
  existingDebt: number;
  purpose: string;
  collateralDetails: string;
  appliedDate: string;
  status: 'SUBMITTED' | 'UNDER_COMMITTEE_REVIEW' | 'APPROVED' | 'REJECTED' | 'DOCUMENT_REQUIRED';
  documents: {
    citizenshipUploaded: boolean;
    collateralProofUploaded: boolean;
    incomeProofUploaded: boolean;
  };
  committeeNotes?: string;
  interestRate?: number;
  guarantor1Name?: string;
  guarantor1MemberNo?: string;
  guarantor2Name?: string;
  guarantor2MemberNo?: string;
  collateralType?: CollateralType;
  collateralEstimatedValue?: number;
  disbursementMethod?: 'SAVINGS_ACCOUNT' | 'CHEQUE' | 'CASH';
}

export interface LoanScheme {
  id: string;
  name: string;
  nameNepali: string;
  interestRate: number;
  maxAmount: number;
  maxTenureMonths: number;
  subsidizedRate?: number;
  isActive: boolean;
  desc: string;
}

// Statutory Loan Loss Provisioning types (Cooperative Act 2074 & NRB Directives)
export type LoanProvisionCategory = 'GOOD' | 'WATCHLIST' | 'SUBSTAND' | 'DOUBTFUL' | 'BAD';

export interface LoanProvisionRule {
  category: LoanProvisionCategory;
  nameNepali: string;
  nameEnglish: string;
  minOverdueDays: number;
  maxOverdueDays: number | null;
  provisionPercent: number; // 1, 5, 25, 50, 100
  badgeColor: string;
  isNpl: boolean;
}

export interface ClassifiedLoan {
  loanId: string;
  loanNo: string;
  memberId?: string;
  memberName: string;
  memberNo: string;
  loanType: string;
  principalAmount: number;
  remainingBalance: number;
  overdueDays: number;
  category: LoanProvisionCategory;
  provisionPercent: number;
  requiredProvisionAmount: number;
  collateralValue?: number;
  lastPaymentDate?: string;
}

export interface LoanProvisionSummary {
  category: LoanProvisionCategory;
  nameNepali: string;
  nameEnglish: string;
  loanCount: number;
  totalOutstanding: number;
  provisionPercent: number;
  provisionAmount: number;
  badgeColor: string;
  isNpl: boolean;
}
