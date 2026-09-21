export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'ACTION_REQUIRED' | 'REJECTED';

export type UserRole = 'MEMBER' | 'ADMIN' | 'GUEST';

export interface Member {
  id: string;
  memberNo: string; // e.g., 'UK-88219'
  name: string;
  nameNepali?: string;
  email: string;
  phone: string;
  citizenshipNo: string;
  panNo?: string;
  joinedDate: string;
  address: string;
  status: VerificationStatus;
  avatarUrl: string;
  shareCapital: number;
  totalSavings: number;
  activeLoanBalance: number;
  accruedDividend: number;
  creditScore: number;
  bankDetails: {
    bankName: string;
    accountNo: string;
    branch: string;
    holderName: string;
  };
  kycDocuments: {
    citizenshipFront: boolean;
    citizenshipBack: boolean;
    photo: boolean;
    signature: boolean;
    utilityBill: boolean;
  };
  notes?: string;
}

export interface SavingsAccount {
  id: string;
  /** Owning member id (nullable when the account has no linked member yet). */
  memberId?: string;
  accountNo: string;
  accountType: 'Regular Savings' | 'Fixed Deposit (1 Year)' | 'Women Empowerment Fund' | 'Child Education Savings';
  balance: number;
  interestRate: number; // percentage, e.g. 8.5
  openedDate: string;
  maturityDate?: string;
  status: 'ACTIVE' | 'DORMANT' | 'MATURED';
}

export interface Loan {
  id: string;
  loanNo: string;
  loanType: 'Agricultural & Livestock' | 'Small Business Enterprise' | 'Education & Career' | 'Emergency Relieve' | 'Home & Land';
  principalAmount: number;
  remainingBalance: number;
  interestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  disbursedDate: string;
  nextDueDate: string;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'PAID_OFF' | 'OVERDUE';
  collateralDescription: string;
}

export interface LoanApplication {
  id: string;
  applicationNo: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  loanType: 'Agricultural & Livestock' | 'Small Business Enterprise' | 'Education & Career' | 'Emergency Relieve' | 'Home & Land';
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
}

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

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  category: 'Membership' | 'Loan Request' | 'Savings & Rates' | 'Technical Issue' | 'General';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  date: string;
  reply?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'SYSTEM' | 'FINANCE' | 'ALERT' | 'PROMO';
  isRead: boolean;
  actionUrl?: string;
}

export interface Notice {
  id: string;
  title: string;
  titleNepali: string;
  category: 'AGM' | 'FESTIVAL' | 'DIVIDEND' | 'POLICY' | 'GENERAL';
  content: string;
  publishedDate: string;
  isUrgent: boolean;
  isActive: boolean;
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

export interface GatewayRail {
  id: string;
  name: string;
  type: 'WALLET' | 'BANK' | 'IPS' | 'QR';
  status: 'ACTIVE' | 'MAINTENANCE' | 'DISABLED';
  dailyLimit: number;
  surchargePercent: number;
  reconciliationCycle: string;
}

export interface SharePool {
  parValue: number;
  totalAllottedKitta: number;
  totalReserveFund: number;
  annualDividendPercent: number;
  patronageBonusPercent: number;
  sharePurchaseOpen: boolean;
}

export interface AgmDetails {
  edition: string;
  editionNepali?: string;
  editionEnglish?: string;
  dateNepali: string;
  dateEnglish: string;
  time: string;
  timeNepali?: string;
  timeEnglish?: string;
  venue: string;
  venueNepali?: string;
  venueEnglish?: string;
  totalDelegates: number;
  digitalPassEnabled: boolean;
}

export interface FieldOfficer {
  id: string;
  name: string;
  nameNepali?: string;
  phone: string;
  email: string;
  role: string;
  roleNepali?: string;
  assignedWards: string[];
  activeUnit: string;
  activeUnitNepali?: string;
  avatarUrl: string;
}

export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';

export type EmployeeAccessRole =
  | 'SUPER_ADMIN'
  | 'BRANCH_MANAGER'
  | 'LOAN_OFFICER'
  | 'TELLER'
  | 'ACCOUNTANT'
  | 'FIELD_OFFICER';

export interface Employee {
  id: string;
  employeeNo: string; // e.g., 'EMP-2081-0042'
  name: string;
  nameNepali?: string;
  designation: string; // e.g., 'Senior Field Supervisor'
  designationNepali?: string;
  department: string;
  branch: string;
  phone: string;
  email: string;
  joinedDate: string;
  status: EmployeeStatus;
  accessRole: EmployeeAccessRole;
  assignedWards: string[];
  avatarUrl: string;
  notes?: string;
}

export interface CoopSettings {
  name: string;
  nameNepali: string;
  regNo: string;
  regNoEnglish?: string;
  panNo: string;
  address: string;
  addressNepali?: string;
  addressEnglish?: string;
  phone: string;
  phoneEnglish?: string;
  email: string;
  openingHours: string;
  openingHoursNepali?: string;
  openingHoursEnglish?: string;
  operatingStatus: 'NORMAL' | 'MAINTENANCE';
}

export interface ThemeColors {
  primary: string;
  primaryContainer: string;
  secondary: string;
  accent: string;
  accentLight: string;
  canvas: string;
  card: string;
}

export interface ChatColors {
  /** Floating launcher button gradient start & popup header gradient start */
  launcherFrom: string;
  /** Floating launcher button gradient end & popup header gradient end */
  launcherTo: string;
  /** Floating launcher button hover gradient start */
  launcherHoverFrom: string;
  /** Floating launcher button hover gradient end */
  launcherHoverTo: string;
  /** Notification badge background */
  badge: string;
  /** Popup minimize button background */
  minimizeButton: string;
  /** Popup minimize button hover */
  minimizeButtonHover: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  nameNepali: string;
  description: string;
  descriptionNepali: string;
  colors: ThemeColors;
}

export interface FeatureFlags {
  enableEBallot: boolean;
  enableDividendClaim: boolean;
  enableAgmPass: boolean;
  enableGrievance: boolean;
  enableLoanApplication: boolean;
  enableSharePurchase: boolean;
  enableSavingsTransfer: boolean;
  enableSupportChat: boolean;
  enableSystemTour: boolean;
}

export interface DesignSettings {
  selectedPresetId: string;
  colors: ThemeColors;
  chatColors: ChatColors;
  customLogoUrl: string | null;
  features: FeatureFlags;
}

// ---------------------------------------------------------------------------
// Mother Group types (parent SHG groups that collect & deposit monthly)
// ---------------------------------------------------------------------------

export type MeetingDay = 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'Custom';

export interface MotherGroup {
  id: string;
  name: string;
  nameNepali?: string;
  location: string;
  locationNepali?: string;
  contactPerson: string;
  contactPhone: string;
  meetingDay: string;
  meetingDayNepali?: string;
  monthlyTargetAmount: number;
  totalMembers: number;
  createdAt: string;
  isActive: boolean;
  notes?: string;
}

export interface MotherGroupMember {
  id: string;
  motherGroupId: string;
  /** Linked cooperative member id. Optional: groups also hold unregistered savers. */
  memberId?: string;
  memberName: string;
  memberNo: string;
  joinedDate: string;
  monthlyContribution: number;
  isActive: boolean;
  createdAt: string;
}

export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface MotherGroupMeeting {
  id: string;
  motherGroupId: string;
  meetingDate: string;
  scheduledTime?: string;
  conductedBy: string;
  conductedByName?: string;
  totalCollected: number;
  memberCount: number;
  status: MeetingStatus;
  notes?: string;
  createdAt: string;
}

export type DepositStatus = 'PENDING' | 'COMPLETED' | 'RECONCILED' | 'VOID';

export interface MotherGroupDeposit {
  id: string;
  meetingId: string;
  motherGroupId: string;
  /** Linked cooperative member id. Optional: groups also hold unregistered savers. */
  memberId?: string;
  memberName: string;
  memberNo: string;
  amount: number;
  depositDate: string;
  recordedBy: string;
  recordedByName?: string;
  status: DepositStatus;
  referenceNo?: string;
  /** Free-text note used when a teller updates/voids a deposit. */
  notes?: string;
  createdAt: string;
}

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
// Report types (dynamic generated reports)
// ---------------------------------------------------------------------------

export interface GeneratedReport {
  id: string;
  title: string;
  titleNepali: string;
  category: 'FINANCIAL' | 'REGULATORY' | 'GOVERNANCE' | 'SUPERVISORY' | 'OPERATIONAL';
  fiscalYear: string;
  period: string;
  generatedAt: string;
  generatedBy: string;
  generatedByName?: string;
  data: Record<string, unknown>;
  downloadUrl?: string;
  status: 'READY' | 'GENERATING' | 'ERROR';
}

// ---------------------------------------------------------------------------
// PEARLS analysis types
// ---------------------------------------------------------------------------

export interface PearlsBreakdownItem {
  category: string;
  categoryNepali: string;
  amount: number;
  percentage: number;
  color: string;
  changePercent?: number;
}

export interface PearlsRiskMetrics {
  portfolioAtRisk: number;
  portfolioAtRiskPercent: number;
  repaymentRate: number;
  averageLoanSize: number;
  savingsToLoanRatio: number;
  totalActiveLoans: number;
  totalDelinquentLoans: number;
}

export interface PearlsTrendPoint {
  label: string;
  labelNepali?: string;
  savings: number;
  loans: number;
  shares: number;
  deposits: number;
  total: number;
}

export interface PearlsAnalysis {
  period: string;
  periodNepali?: string;
  totalAssets: number;
  totalAssetsNepali?: string;
  breakdown: PearlsBreakdownItem[];
  riskMetrics: PearlsRiskMetrics;
  trends: PearlsTrendPoint[];
  generatedAt: string;
}

