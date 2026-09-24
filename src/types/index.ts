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
  addressNepali?: string;
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
  /** Supabase Auth user id linked to this member (live mode only). */
  authUserId?: string | null;

  // Statutory Nepalese KYM (Know Your Member) fields
  gender?: 'FEMALE' | 'MALE' | 'OTHER';
  maritalStatus?: 'UNMARRIED' | 'MARRIED' | 'WIDOWED' | 'DIVORCED' | 'OTHER';
  dobBs?: string;
  dobAd?: string;
  occupation?: string;
  fatherName?: string;
  motherName?: string;
  grandfatherName?: string;
  spouseName?: string;
  province?: string;
  district?: string;
  palika?: string;
  wardNo?: string;
  tole?: string;
  tempAddress?: string;
  motherGroupId?: string;
  citizenshipIssueDateBs?: string;
  citizenshipIssueDistrict?: string;
  nationalIdNo?: string;
  nominee?: {
    name: string;
    relation: string;
    citizenshipNo?: string;
    phone?: string;
    dobBs?: string;
    isMinor?: boolean;
    guardianName?: string;
    guardianRelation?: string;
  };
  shareKitta?: number;
  entranceFee?: number;
  monthlySavingsCommitment?: number;
}

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
  groupCode?: string;
  location: string;
  locationNepali?: string;
  contactPerson: string;
  contactPhone: string;
  meetingDay: string;
  meetingDayNepali?: string;
  meetingTime?: string;
  monthlyTargetAmount: number;
  totalMembers: number;
  createdAt: string;
  isActive: boolean;
  notes?: string;
  chairpersonName?: string;
  secretaryName?: string;
  treasurerName?: string;
  fieldStaffName?: string;
  mandatoryContributionPerMember?: number;
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
  /** Free-text minutes / agenda outcome captured by the conductor. */
  minutes?: string;
  /** Expected members from the group roster at meeting-open time. */
  expectedMembers?: number;
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
  /** Member savings account number the collection was posted into (set on posting). */
  savingsAccountNo?: string;
  /** Teller-ledger transaction reference created when posted (e.g. MGCOL-2081-000142). */
  transactionRef?: string;
  /** Bank deposit slip / voucher number entered by the teller for the group deposit. */
  bankDepositSlipNo?: string;
  /** ISO timestamp when the deposit was posted to the member passbook. */
  postedAt?: string;
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
// Statutory Loan Loss Provisioning types (Cooperative Act 2074 & NRB Directives)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Teller Cash Drawer & Day-End types
// ---------------------------------------------------------------------------

export interface DenominationBreakdown {
  n1000: number;
  n500: number;
  n100: number;
  n50: number;
  n20: number;
  n10: number;
  n5: number;
  n2: number;
  n1: number;
  coins: number;
}

export type DrawerStatus = 'OPEN' | 'BALANCED' | 'DISCREPANCY' | 'CLOSED_TO_VAULT';

export interface TellerDrawerSession {
  id: string;
  tellerId: string;
  tellerName: string;
  branch: string;
  sessionDate: string; // BS date, e.g. '2081-11-14'
  openingFloat: number;
  cashReceived: number; // total cash in (deposits + loan repayments)
  cashDisbursed: number; // total cash out (withdrawals + loan disbursements)
  expectedBalance: number; // openingFloat + cashReceived - cashDisbursed
  actualBalance: number; // counted physical cash
  variance: number; // actualBalance - expectedBalance (positive = surplus/बचत, negative = shortage/घाटा)
  denominations: DenominationBreakdown;
  status: DrawerStatus;
  notes?: string;
  vaultHandoverWitness?: string;
  closedAt?: string;
  createdAt: string;
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


