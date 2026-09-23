import { create } from 'zustand';
import {
  Member,
  LoanApplication,
  Transaction,
  Inquiry,
  Notification,
  SavingsAccount,
  Loan,
  Notice,
  LoanScheme,
  GatewayRail,
  SharePool,
  AgmDetails,
  FieldOfficer,
  Employee,
  CoopSettings,
  MotherGroup,
  MotherGroupMember,
  MotherGroupMeeting,
  MotherGroupDeposit,
  TradingTransaction,
  BankStatementEntry,
  ReconciliationEntry,
  GeneratedReport,
} from '../types';
import {
  INITIAL_MEMBERS,
  INITIAL_SAVINGS,
  INITIAL_LOANS,
  INITIAL_APPLICATIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_INQUIRIES,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import { INITIAL_MOTHER_GROUPS } from '../data/motherGroupMockData';
import { INITIAL_MOTHER_GROUP_MEMBERS } from '../data/motherGroupMembersMockData';
import { INITIAL_MOTHER_GROUP_MEETINGS } from '../data/motherGroupMeetingsMockData';
import { INITIAL_MOTHER_GROUP_DEPOSITS } from '../data/motherGroupDepositsMockData';
import { INITIAL_TRADING_TRANSACTIONS } from '../data/tradingMockData';
import { INITIAL_BANK_STATEMENTS } from '../data/bankStatementsMockData';
import { INITIAL_RECONCILIATION_ENTRIES } from '../data/reconciliationMockData';
import { INITIAL_GENERATED_REPORTS } from '../data/generatedReportsMockData';
import {
  buildCollectionReference,
  resolveCollectionTarget,
  summariseMeetingDeposits,
  type CollectionPostingResult,
} from '../utils/collectionPosting';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchEmployeesFromSupabase,
  createEmployeeInSupabase,
  updateEmployeeInSupabase,
  deleteEmployeeInSupabase,
} from '../services/employeeService';

/** Live status of the Supabase <-> local HR registry bridge. */
export interface EmployeeSyncStatus {
  source: 'supabase' | 'local';
  state: 'idle' | 'syncing' | 'synced' | 'error';
  message?: string;
}

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not-1',
    title: '31st Annual General Meeting (AGM): Asar 1, 2083 - Gadhwa Community Hall, Chainpur-5, Dang',
    titleNepali: '३१औं वार्षिक साधारण सभा (AGM): असार १, २०८३ - गढवा सामुदायिक भवन, चैनपुर-५, दाङ',
    category: 'AGM',
    content: 'All certified shareholder members are formally invited to participate in the 31st AGM. Digital entry passes and QR vouchers are now accessible via Member Portal.',
    publishedDate: '2081-11-01',
    isUrgent: true,
    isActive: true,
  },
  {
    id: 'not-2',
    title: 'Special Agriculture Loan Subsidized Window - 1.5% Ministry of Agriculture Rebate',
    titleNepali: 'विशेष कृषि तथा पशुपालन कर्जा सहुलियत विन्डो - १.५% कृषि मन्त्रालय अनुदान सुविधा',
    category: 'POLICY',
    content: 'Eligible commercial dairy and seed producers can avail subsidized loans at 8.5% interest rate. Contact Branch Officer or apply online.',
    publishedDate: '2081-10-15',
    isUrgent: false,
    isActive: true,
  },
  {
    id: 'not-3',
    title: 'Annual Member Dividend Distribution (14.5%) Credited to Regular Savings',
    titleNepali: 'वार्षिक सेयर लाभांश (१४.५%) सम्पूर्ण सदस्यहरूको ऐच्छिक बचत खातामा जम्मा भयो',
    category: 'DIVIDEND',
    content: 'The 14.5% equity dividend approved by the Board has been credited directly to all active member passbooks.',
    publishedDate: '2081-09-28',
    isUrgent: false,
    isActive: true,
  },
];

export const INITIAL_LOAN_SCHEMES: LoanScheme[] = [
  {
    id: 'sch-1',
    name: 'Agriculture & Dairy Loan',
    nameNepali: 'कृषि तथा पशुपालन कर्जा',
    interestRate: 9.5,
    subsidizedRate: 8.0,
    maxAmount: 500000,
    maxTenureMonths: 36,
    isActive: true,
    desc: 'Low-interest credit facility for livestock purchase, seed procurement, and dairy sheds.',
  },
  {
    id: 'sch-2',
    name: 'Women Entrepreneurship Loan',
    nameNepali: 'महिला उद्यमशीलता कर्जा',
    interestRate: 7.0,
    subsidizedRate: 5.5,
    maxAmount: 300000,
    maxTenureMonths: 24,
    isActive: true,
    desc: 'Collateral-free subsidized micro-credit for female-run cottage enterprises and weaving units.',
  },
  {
    id: 'sch-3',
    name: 'Emergency & Medical Loan',
    nameNepali: 'आकस्मिक तथा स्वास्थ्य कर्जा',
    interestRate: 10.5,
    maxAmount: 150000,
    maxTenureMonths: 18,
    isActive: true,
    desc: 'Fast-track medical and disaster emergency relief disbursed within 4 hours.',
  },
  {
    id: 'sch-4',
    name: 'Higher Education Loan',
    nameNepali: 'उच्च शिक्षा तथा प्राविधिक कर्जा',
    interestRate: 8.5,
    maxAmount: 400000,
    maxTenureMonths: 48,
    isActive: true,
    desc: 'Tuition and technical education credit with grace period during study tenure.',
  },
  {
    id: 'sch-5',
    name: 'Micro Small Business Enterprise',
    nameNepali: 'साना तथा मझौला व्यवसाय कर्जा',
    interestRate: 11.0,
    maxAmount: 1000000,
    maxTenureMonths: 60,
    isActive: true,
    desc: 'Working capital and retail machinery expansion for local Dang Valley merchants.',
  },
];

export const INITIAL_GATEWAY_RAILS: GatewayRail[] = [
  { id: 'gw-1', name: 'eSewa Direct Wallet', type: 'WALLET', status: 'ACTIVE', dailyLimit: 100000, surchargePercent: 0, reconciliationCycle: 'Instant CBS RTGS' },
  { id: 'gw-2', name: 'Khalti Digital Wallet', type: 'WALLET', status: 'ACTIVE', dailyLimit: 100000, surchargePercent: 0, reconciliationCycle: 'Instant CBS RTGS' },
  { id: 'gw-3', name: 'ConnectIPS (NCHL)', type: 'IPS', status: 'ACTIVE', dailyLimit: 500000, surchargePercent: 0, reconciliationCycle: 'National Payment Switch (NPS)' },
  { id: 'gw-4', name: 'NepalPay / Fonepay QR', type: 'QR', status: 'ACTIVE', dailyLimit: 200000, surchargePercent: 0, reconciliationCycle: 'Instant Interbank Merchant Settlement' },
  { id: 'gw-5', name: 'Agricultural Development Bank (ADBL)', type: 'BANK', status: 'ACTIVE', dailyLimit: 1000000, surchargePercent: 0, reconciliationCycle: 'T+0 End-of-Day EOD Batch' },
];

export const INITIAL_SHARE_POOL: SharePool = {
  parValue: 100,
  totalAllottedKitta: 500000,
  totalReserveFund: 18450000,
  annualDividendPercent: 14.5,
  patronageBonusPercent: 3.0,
  sharePurchaseOpen: true,
};

export const INITIAL_AGM_DETAILS: AgmDetails = {
  edition: '३१औं वार्षिक साधारण सभा',
  dateNepali: '२०८१ चैत्र २५',
  dateEnglish: 'April 7, 2025',
  time: '०९:०० बजे',
  venue: 'गढवा सामुदायिक भवन, चैनपुर-५, दाङ',
  totalDelegates: 1250,
  digitalPassEnabled: true,
};

export const INITIAL_FIELD_OFFICERS: FieldOfficer[] = [
  {
    id: 'fo-1',
    name: 'Sita Chaudhary',
    phone: '98578-40123',
    email: 'sita.chaudhary@unako.coop.np',
    role: 'Senior Field Supervisor',
    assignedWards: ['Ward 4', 'Ward 5', 'Ward 6'],
    activeUnit: 'Gadhwa Women-Men Self-help Unit #03',
    avatarUrl: '/assets/kyc/avatar_officer.png',
  },
  {
    id: 'fo-2',
    name: 'Bishnu Prasad Pokhrel',
    phone: '98478-22190',
    email: 'bishnu.pokhrel@unako.coop.np',
    role: 'Credit Assessment Officer',
    assignedWards: ['Ward 1', 'Ward 2', 'Ward 3'],
    activeUnit: 'Lamahi Valley Farmers Collective #01',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-seed-1',
    employeeNo: 'EMP-2078-0011',
    name: 'Aarati Kumari Yadav',
    nameNepali: 'आरती कुमारी यादव',
    designation: 'Branch Manager',
    designationNepali: 'शाखा प्रबन्धक',
    department: 'Branch Operations',
    branch: 'Gadhwa Main Branch',
    phone: '98578-21011',
    email: 'aarati.yadav@unako.coop.np',
    joinedDate: '2021-05-02',
    status: 'ACTIVE',
    accessRole: 'BRANCH_MANAGER',
    assignedWards: ['Ward 4', 'Ward 5'],
    avatarUrl: '/assets/kyc/avatar_officer.png',
    notes: 'Authorised CBS approver for savings, withdrawal and membership certification.',
  },
  {
    id: 'emp-seed-2',
    employeeNo: 'EMP-2078-0014',
    name: 'Sita Chaudhary',
    nameNepali: 'सीता चौधरी',
    designation: 'Senior Field Supervisor',
    designationNepali: 'वरिष्ठ क्षेत्र सुपरभाइजर',
    department: 'Field Operations',
    branch: 'Gadhwa Main Branch',
    phone: '98578-40123',
    email: 'sita.chaudhary@unako.coop.np',
    joinedDate: '2021-07-18',
    status: 'ACTIVE',
    accessRole: 'FIELD_OFFICER',
    assignedWards: ['Ward 4', 'Ward 5', 'Ward 6'],
    avatarUrl: '/assets/kyc/avatar_officer.png',
    notes: 'Leads the Gadhwa Women-Men Self-help Unit #03 savings mobilisation drive.',
  },
  {
    id: 'emp-seed-3',
    employeeNo: 'EMP-2079-0021',
    name: 'Bishnu Prasad Pokhrel',
    nameNepali: 'विष्णु प्रसाद पोख्रेल',
    designation: 'Credit Assessment Officer',
    designationNepali: 'कर्जा मूल्याङ्कन अधिकृत',
    department: 'Credit & Loan',
    branch: 'Lamahi Sub-Branch',
    phone: '98478-22190',
    email: 'bishnu.pokhrel@unako.coop.np',
    joinedDate: '2022-02-09',
    status: 'ACTIVE',
    accessRole: 'LOAN_OFFICER',
    assignedWards: ['Ward 1', 'Ward 2', 'Ward 3'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80',
    notes: 'Prepares appraisal files for the Credit Committee and monitors collateral verification.',
  },
  {
    id: 'emp-seed-4',
    employeeNo: 'EMP-2080-0032',
    name: 'Kamala Devi Sharma',
    nameNepali: 'कमला देवी शर्मा',
    designation: 'Head Teller (Cash Counter)',
    designationNepali: 'प्रमुख क्यासियर',
    department: 'Cash & Counter Services',
    branch: 'Gadhwa Main Branch',
    phone: '98578-33421',
    email: 'kamala.sharma@unako.coop.np',
    joinedDate: '2023-01-16',
    status: 'ON_LEAVE',
    accessRole: 'TELLER',
    assignedWards: ['Ward 5'],
    avatarUrl: '/assets/kyc/avatar_hari.png',
    notes: 'On maternity leave until Kartik; counter duties temporarily re-assigned.',
  },
  {
    id: 'emp-seed-5',
    employeeNo: 'EMP-2080-0038',
    name: 'Dipak Bahadur Thapa',
    nameNepali: 'दिपक बहादुर थापा',
    designation: 'Cooperative Accountant',
    designationNepali: 'सहकारी लेखापाल',
    department: 'Accounts & Audit',
    branch: 'Gadhwa Main Branch',
    phone: '98478-55230',
    email: 'dipak.thapa@unako.coop.np',
    joinedDate: '2023-08-01',
    status: 'ACTIVE',
    accessRole: 'ACCOUNTANT',
    assignedWards: ['Ward 1', 'Ward 6'],
    avatarUrl: '/assets/kyc/avatar_nominee.png',
    notes: 'Handles COPOMIS regulatory returns and annual statutory audit coordination.',
  },
  {
    id: 'emp-seed-6',
    employeeNo: 'EMP-2077-0004',
    name: 'Sunita K.C.',
    nameNepali: 'सुनिता के.सी.',
    designation: 'CBS System Administrator',
    designationNepali: 'सीबीएस प्रणाली प्रशासक',
    department: 'IT & Digital Banking',
    branch: 'Gadhwa Main Branch',
    phone: '98578-10004',
    email: 'admin@unako.coop',
    joinedDate: '2020-11-05',
    status: 'ACTIVE',
    accessRole: 'SUPER_ADMIN',
    assignedWards: [],
    avatarUrl: '/assets/kyc/avatar_officer.png',
    notes: 'Universal configuration authority for portal access, roles and CBS audit console.',
  },
];

export const INITIAL_COOP_SETTINGS: CoopSettings = {
  name: 'Unako Saving & Credit Cooperative Ltd.',
  nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
  regNo: '१२९०/०६७/०६८',
  regNoEnglish: '1290/067/068',
  panNo: '३००१२४८९०',
  address: 'गढवा-५, चैनपुर, दाङ, लुम्बिनी प्रदेश, नेपाल',
  addressNepali: 'गढवा-५, चैनपुर, दाङ, लुम्बिनी प्रदेश, नेपाल',
  addressEnglish: 'Gadhwa-5, Chainpur, Dang, Lumbini Province, Nepal',
  phone: '०८२-४१२०५५ / ९८५७८२१०००',
  phoneEnglish: '+977-82-412055 / +977-9857821000',
  email: 'info@unako.coop.np',
  openingHours: 'आइतबार - शुक्रबार: बिहान १०:०० देखि दिउँसो ४:०० सम्म',
  openingHoursNepali: 'आइतबार - शुक्रबार: बिहान १०:०० देखि दिउँसो ४:०० सम्म',
  openingHoursEnglish: 'Sunday – Friday: 10:00 AM – 04:00 PM',
  operatingStatus: 'NORMAL',
};

const getStoredCoopSettings = (): CoopSettings => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('unako_coop_settings');
      if (saved) {
        return { ...INITIAL_COOP_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
  }
  return INITIAL_COOP_SETTINGS;
};

const EMPLOYEE_STORAGE_KEY = 'unako_employees';

const getStoredEmployees = (): Employee[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(EMPLOYEE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as Employee[];
        }
      }
    } catch {
      // ignore corrupted or unavailable storage
    }
  }
  return INITIAL_EMPLOYEES;
};

const persistEmployees = (employees: Employee[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees));
    } catch {
      // ignore storage quota exceeded or disabled
    }
  }
};

interface CoopState {
  members: Member[];
  savings: SavingsAccount[];
  loans: Loan[];
  applications: LoanApplication[];
  transactions: Transaction[];
  inquiries: Inquiry[];
  notifications: Notification[];
  notices: Notice[];
  loanSchemes: LoanScheme[];
  gatewayRails: GatewayRail[];
  sharePool: SharePool;
  agmDetails: AgmDetails;
  fieldOfficers: FieldOfficer[];
  employees: Employee[];
  coopSettings: CoopSettings;

  // Mother Group state
  motherGroups: MotherGroup[];
  motherGroupMembers: MotherGroupMember[];
  motherGroupMeetings: MotherGroupMeeting[];
  motherGroupDeposits: MotherGroupDeposit[];

  // Trading state
  tradingTransactions: TradingTransaction[];

  // Reconciliation state
  bankStatements: BankStatementEntry[];
  reconciliationEntries: ReconciliationEntry[];

  // Generated Reports state
  generatedReports: GeneratedReport[];

  // Member actions
  updateMemberDetails: (memberId: string, updates: Partial<Member>) => void;
  addMember: (memberData: Omit<Member, 'id'>) => Member;
  updateMemberStatus: (memberId: string, status: Member['status'], notes?: string) => void;

  // Employee / Staff (HR) actions
  addEmployee: (employeeData: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => void;
  removeEmployee: (employeeId: string) => void;
  employeeSync: EmployeeSyncStatus;
  syncEmployees: () => Promise<void>;

  // Loan actions
  addLoanApplication: (app: Omit<LoanApplication, 'id' | 'applicationNo' | 'appliedDate' | 'status'>) => LoanApplication;
  updateApplicationStatus: (id: string, status: LoanApplication['status'], notes?: string) => void;
  updateLoanScheme: (schemeId: string, updates: Partial<LoanScheme>) => void;
  addLoanScheme: (scheme: Omit<LoanScheme, 'id'>) => void;
  recordLoanRepayment: (loanNo: string, amount: number, note?: string) => void;

  // Savings actions
  adjustSavingsBalance: (accountNo: string, amount: number, type: 'DEPOSIT' | 'WITHDRAWAL', note?: string) => void;
  updateSavingsRate: (accountType: string, newRate: number) => void;

  // Transfers & Gateways actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
  toggleGatewayRail: (gatewayId: string, status: GatewayRail['status']) => void;
  updateGatewayLimit: (gatewayId: string, dailyLimit: number) => void;

  // Shares actions
  updateSharePool: (updates: Partial<SharePool>) => void;

  // Notice & Announcements actions
  addNotice: (notice: Omit<Notice, 'id' | 'publishedDate'>) => void;
  updateNotice: (id: string, updates: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;

  // Governance & AGM actions
  updateAgmDetails: (updates: Partial<AgmDetails>) => void;
  updateFieldOfficer: (id: string, updates: Partial<FieldOfficer>) => void;

  // Inquiries actions
  addInquiry: (inq: Omit<Inquiry, 'id' | 'date' | 'status'>) => void;
  replyToInquiry: (id: string, reply: string) => void;

  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Settings actions
  updateCoopSettings: (updates: Partial<CoopSettings>) => void;
  searchMember: (query: string) => Member | undefined;

  // Mother Group actions
  addMotherGroup: (groupData: Omit<MotherGroup, 'id' | 'createdAt'>) => MotherGroup;
  updateMotherGroup: (id: string, updates: Partial<MotherGroup>) => void;
  deleteMotherGroup: (id: string) => void;
  getMotherGroupMembers: (motherGroupId: string) => MotherGroupMember[];
  getMotherGroupById: (id: string) => MotherGroup | undefined;

  addMotherGroupMember: (data: Omit<MotherGroupMember, 'id' | 'joinedDate' | 'createdAt'>) => MotherGroupMember;
  updateMotherGroupMember: (id: string, updates: Partial<MotherGroupMember>) => void;
  removeMotherGroupMember: (id: string) => void;

  recordMeeting: (data: Omit<MotherGroupMeeting, 'id' | 'createdAt'>) => MotherGroupMeeting;
  updateMeeting: (id: string, updates: Partial<MotherGroupMeeting>) => void;

  recordDeposit: (data: Omit<MotherGroupDeposit, 'id' | 'depositDate' | 'createdAt'>) => MotherGroupDeposit;
  updateDepositStatus: (id: string, status: MotherGroupDeposit['status'], notes?: string) => void;
  getDepositsByMeeting: (meetingId: string) => MotherGroupDeposit[];
  getDepositsByGroup: (motherGroupId: string) => MotherGroupDeposit[];
  getPendingDeposits: () => MotherGroupDeposit[];
  /** Posts a single collection into the member's savings passbook (creates the ledger transaction). */
  postDepositToMemberAccount: (depositId: string) => CollectionPostingResult;
  /** Bulk-posts every PENDING collection recorded for a meeting. */
  postMeetingCollections: (meetingId: string) => { posted: number; failed: number };
  /** Voids a collection; already-posted rows also receive a compensating reversal transaction. */
  voidMotherGroupDeposit: (depositId: string, reason: string) => void;
  /** All collections (any status) linked to a member — powers passbook/statement views. */
  getMemberDepositHistory: (memberId: string) => MotherGroupDeposit[];
  /** Updates an editable PENDING collection (amount / slip / notes) before posting. */
  updatePendingCollection: (
    id: string,
    updates: { amount?: number; bankDepositSlipNo?: string; notes?: string }
  ) => void;

  // Trading actions
  addTradingTransaction: (
    tx: Omit<TradingTransaction, 'id' | 'date' | 'createdAt' | 'status'> & {
      date?: string;
      status?: TradingTransaction['status'];
    }
  ) => TradingTransaction;
  updateTradingTransaction: (id: string, updates: Partial<TradingTransaction>) => void;
  voidTradingTransaction: (id: string) => void;
  getTradingByDateRange: (startDate: string, endDate: string) => TradingTransaction[];

  // Reconciliation actions
  addBankStatement: (entry: Omit<BankStatementEntry, 'id' | 'uploadedAt'>) => BankStatementEntry;
  updateBankStatement: (id: string, updates: Partial<BankStatementEntry>) => void;
  addReconciliationEntry: (entry: Omit<ReconciliationEntry, 'id' | 'flaggedAt' | 'createdAt'>) => ReconciliationEntry;
  updateReconciliationStatus: (id: string, status: ReconciliationEntry['status'], notes?: string) => void;
  getReconciliationByStatus: (status: ReconciliationEntry['status']) => ReconciliationEntry[];
  getReconciliationSummary: () => {
    total: number;
    matched: number;
    mismatch: number;
    pending: number;
    resolved: number;
  };

  // Generated report actions
  addGeneratedReport: (report: Omit<GeneratedReport, 'id' | 'generatedAt'>) => GeneratedReport;
  removeGeneratedReport: (id: string) => void;
}

/**
 * Recomputes a meeting's collected total + attendee count from its deposits.
 * Pure helper so it can be reused inside multiple store reducers.
 */
const recomputeMeetingTotals = (
  meetings: MotherGroupMeeting[],
  deposits: MotherGroupDeposit[],
  meetingId: string
): MotherGroupMeeting[] =>
  meetings.map((m) =>
    m.id === meetingId
      ? {
          ...m,
          ...summariseMeetingDeposits(deposits.filter((d) => d.meetingId === meetingId)),
        }
      : m
  );

export const useCoopStore = create<CoopState>((set, get) => ({
  members: INITIAL_MEMBERS,
  savings: INITIAL_SAVINGS,
  loans: INITIAL_LOANS,
  applications: INITIAL_APPLICATIONS,
  transactions: INITIAL_TRANSACTIONS,
  inquiries: INITIAL_INQUIRIES,
  notifications: INITIAL_NOTIFICATIONS,
  notices: INITIAL_NOTICES,
  loanSchemes: INITIAL_LOAN_SCHEMES,
  gatewayRails: INITIAL_GATEWAY_RAILS,
  sharePool: INITIAL_SHARE_POOL,
  agmDetails: INITIAL_AGM_DETAILS,
  fieldOfficers: INITIAL_FIELD_OFFICERS,
  employees: getStoredEmployees(),
  employeeSync: { source: isSupabaseConfigured() ? 'supabase' : 'local', state: 'idle' },
  coopSettings: getStoredCoopSettings(),

  // Mother Group initial state
  motherGroups: INITIAL_MOTHER_GROUPS,
  motherGroupMembers: INITIAL_MOTHER_GROUP_MEMBERS,
  motherGroupMeetings: INITIAL_MOTHER_GROUP_MEETINGS,
  motherGroupDeposits: INITIAL_MOTHER_GROUP_DEPOSITS,

  // Trading initial state
  tradingTransactions: INITIAL_TRADING_TRANSACTIONS,

  // Reconciliation initial state
  bankStatements: INITIAL_BANK_STATEMENTS,
  reconciliationEntries: INITIAL_RECONCILIATION_ENTRIES,

  // Generated Reports initial state
  generatedReports: INITIAL_GENERATED_REPORTS,

  // Member methods (Immutability enforced per project rules)
  updateMemberDetails: (memberId, updates) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, ...updates } : m
      ),
    }));
  },

  addMember: (memberData) => {
    const newMember: Member = {
      ...memberData,
      id: 'mem-' + Date.now(),
    };
    set((state) => ({
      members: [newMember, ...state.members],
    }));
    return newMember;
  },

  updateMemberStatus: (memberId, status, notes) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, status, notes: notes ?? m.notes } : m
      ),
    }));
  },

  // Employee / Staff (HR) methods (immutability + localStorage + Supabase write-through)
  addEmployee: (employeeData) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: 'emp-' + Date.now(),
    };
    const nextEmployees = [newEmployee, ...get().employees];
    persistEmployees(nextEmployees);
    set({ employees: nextEmployees });

    if (isSupabaseConfigured()) {
      void createEmployeeInSupabase(newEmployee).then(({ data, error }) => {
        if (error || !data) {
          set({
            employeeSync: {
              source: 'supabase',
              state: 'error',
              message: error || 'Supabase insert failed.',
            },
          });
          return;
        }
        // Reconcile the local temporary id with the PostgreSQL uuid row
        const reconciled = get().employees.map((emp) => (emp.id === newEmployee.id ? data : emp));
        persistEmployees(reconciled);
        set({ employees: reconciled, employeeSync: { source: 'supabase', state: 'synced' } });
      });
    }

    return newEmployee;
  },

  syncEmployees: async () => {
    if (!isSupabaseConfigured()) {
      set({ employeeSync: { source: 'local', state: 'idle' } });
      return;
    }

    set({ employeeSync: { source: 'supabase', state: 'syncing' } });
    const { data, error } = await fetchEmployeesFromSupabase();

    if (error || !data) {
      set({
        employeeSync: {
          source: 'supabase',
          state: 'error',
          message: error || 'Could not load employees from Supabase.',
        },
      });
      return;
    }

    persistEmployees(data);
    set({ employees: data, employeeSync: { source: 'supabase', state: 'synced' } });
  },

  updateEmployee: (employeeId, updates) => {
    const target = get().employees.find((emp) => emp.id === employeeId);
    const nextEmployees = get().employees.map((emp) =>
      emp.id === employeeId ? { ...emp, ...updates } : emp
    );
    persistEmployees(nextEmployees);
    set({ employees: nextEmployees });

    if (isSupabaseConfigured() && target) {
      void updateEmployeeInSupabase(target.employeeNo, updates).then(({ data, error }) => {
        if (error || !data) {
          set({
            employeeSync: {
              source: 'supabase',
              state: 'error',
              message: error || 'Supabase update failed.',
            },
          });
          return;
        }
        const reconciled = get().employees.map((emp) => (emp.id === employeeId ? data : emp));
        persistEmployees(reconciled);
        set({ employees: reconciled, employeeSync: { source: 'supabase', state: 'synced' } });
      });
    }
  },

  removeEmployee: (employeeId) => {
    const target = get().employees.find((emp) => emp.id === employeeId);
    const nextEmployees = get().employees.filter((emp) => emp.id !== employeeId);
    persistEmployees(nextEmployees);
    set({ employees: nextEmployees });

    if (isSupabaseConfigured() && target) {
      void deleteEmployeeInSupabase(target.employeeNo).then(({ error }) => {
        if (error) {
          set({
            employeeSync: {
              source: 'supabase',
              state: 'error',
              message: error || 'Supabase delete failed.',
            },
          });
          return;
        }
        set({ employeeSync: { source: 'supabase', state: 'synced' } });
      });
    }
  },

  // Loan application methods
  addLoanApplication: (appData) => {
    const newId = 'app-' + Date.now();
    const appNo = 'APP-2026-' + Math.floor(1000 + Math.random() * 9000);
    const newApplication: LoanApplication = {
      ...appData,
      id: newId,
      applicationNo: appNo,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'SUBMITTED',
    };

    set((state) => ({
      applications: [newApplication, ...state.applications],
      notifications: [
        {
          id: 'n-' + Date.now(),
          title: 'Loan Application Submitted (' + appNo + ')',
          message:
            'Your application for NPR ' +
            formatNPR(appData.requestedAmount, false) +
            ' (' +
            appData.loanType +
            ') was received and queued for credit assessment.',
          date: new Date().toISOString().split('T')[0],
          type: 'FINANCE',
          isRead: false,
          actionUrl: '/member/loans',
        },
        ...state.notifications,
      ],
    }));

    return newApplication;
  },

  updateApplicationStatus: (id, status, notes) => {
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, status, committeeNotes: notes ?? app.committeeNotes } : app
      ),
    }));
  },

  updateLoanScheme: (schemeId, updates) => {
    set((state) => ({
      loanSchemes: state.loanSchemes.map((s) =>
        s.id === schemeId ? { ...s, ...updates } : s
      ),
    }));
  },

  addLoanScheme: (schemeData) => {
    const newScheme: LoanScheme = {
      ...schemeData,
      id: 'sch-' + Date.now(),
    };
    set((state) => ({
      loanSchemes: [...state.loanSchemes, newScheme],
    }));
  },

  recordLoanRepayment: (loanNo, amount, note) => {
    set((state) => ({
      loans: state.loans.map((l) =>
        l.loanNo === loanNo
          ? {
              ...l,
              remainingBalance: Math.max(0, l.remainingBalance - amount),
            }
          : l
      ),
      transactions: [
        {
          id: 'tx-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          type: 'LOAN_EMI',
          description: 'Loan EMI Payment - ' + loanNo + (note ? ' (' + note + ')' : ''),
          amount,
          referenceNo: 'EMI-MANUAL-' + Math.floor(10000 + Math.random() * 90000),
          status: 'COMPLETED',
        },
        ...state.transactions,
      ],
    }));
  },

  // Savings methods
  adjustSavingsBalance: (accountNo, amount, type, note) => {
    set((state) => ({
      savings: state.savings.map((s) =>
        s.accountNo === accountNo
          ? {
              ...s,
              balance: type === 'DEPOSIT' ? s.balance + amount : Math.max(0, s.balance - amount),
            }
          : s
      ),
      transactions: [
        {
          id: 'tx-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          type,
          description: (type === 'DEPOSIT' ? 'Admin Cash Deposit: ' : 'Admin Debit Adjustment: ') + accountNo + (note ? ' - ' + note : ''),
          amount,
          referenceNo: 'ADJ-' + Math.floor(10000 + Math.random() * 90000),
          status: 'COMPLETED',
        },
        ...state.transactions,
      ],
    }));
  },

  updateSavingsRate: (accountType, newRate) => {
    set((state) => ({
      savings: state.savings.map((s) =>
        s.accountType === accountType ? { ...s, interestRate: newRate } : s
      ),
    }));
  },

  // Transactions & Gateways
  addTransaction: (txData) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: 'COMPLETED',
    };

    set((state) => ({
      transactions: [newTx, ...state.transactions],
    }));
  },

  toggleGatewayRail: (gatewayId, status) => {
    set((state) => ({
      gatewayRails: state.gatewayRails.map((g) =>
        g.id === gatewayId ? { ...g, status } : g
      ),
    }));
  },

  updateGatewayLimit: (gatewayId, dailyLimit) => {
    set((state) => ({
      gatewayRails: state.gatewayRails.map((g) =>
        g.id === gatewayId ? { ...g, dailyLimit } : g
      ),
    }));
  },

  // Shares pool
  updateSharePool: (updates) => {
    set((state) => ({
      sharePool: { ...state.sharePool, ...updates },
    }));
  },

  // Notices
  addNotice: (noticeData) => {
    const newNotice: Notice = {
      ...noticeData,
      id: 'not-' + Date.now(),
      publishedDate: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      notices: [newNotice, ...state.notices],
    }));
  },

  updateNotice: (id, updates) => {
    set((state) => ({
      notices: state.notices.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
  },

  deleteNotice: (id) => {
    set((state) => ({
      notices: state.notices.filter((n) => n.id !== id),
    }));
  },

  // Governance & AGM
  updateAgmDetails: (updates) => {
    set((state) => ({
      agmDetails: { ...state.agmDetails, ...updates },
    }));
  },

  updateFieldOfficer: (id, updates) => {
    set((state) => ({
      fieldOfficers: state.fieldOfficers.map((fo) =>
        fo.id === id ? { ...fo, ...updates } : fo
      ),
    }));
  },

  // Inquiries
  addInquiry: (inqData) => {
    const newInq: Inquiry = {
      ...inqData,
      id: 'inq-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: 'NEW',
    };

    set((state) => ({
      inquiries: [newInq, ...state.inquiries],
    }));
  },

  replyToInquiry: (id, reply) => {
    set((state) => ({
      inquiries: state.inquiries.map((inq) =>
        inq.id === id ? { ...inq, reply, status: 'RESOLVED' } : inq
      ),
    }));
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  // Settings (Immutability & LocalStorage Persistence)
  updateCoopSettings: (updates) => {
    set((state) => {
      const newSettings = { ...state.coopSettings, ...updates };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('unako_coop_settings', JSON.stringify(newSettings));
        } catch {
          // ignore
        }
      }
      return { coopSettings: newSettings };
    });
  },

  searchMember: (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return undefined;
    return get().members.find(
      (m) =>
        m.memberNo.toLowerCase() === q ||
        m.citizenshipNo.toLowerCase() === q ||
        m.phone.toLowerCase() === q ||
        m.email.toLowerCase() === q ||
        m.name.toLowerCase().includes(q)
    );
  },

  // ============================================================================
  // MOTHER GROUP METHODS
  // ============================================================================

  addMotherGroup: (groupData) => {
    const newGroup: MotherGroup = {
      ...groupData,
      id: 'mg-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      motherGroups: [newGroup, ...state.motherGroups],
    }));
    return newGroup;
  },

  updateMotherGroup: (id, updates) => {
    set((state) => ({
      motherGroups: state.motherGroups.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    }));
  },

  deleteMotherGroup: (id) => {
    set((state) => ({
      motherGroups: state.motherGroups.filter((g) => g.id !== id),
      motherGroupMembers: state.motherGroupMembers.filter((m) => m.motherGroupId !== id),
      motherGroupMeetings: state.motherGroupMeetings.filter((m) => m.motherGroupId !== id),
      motherGroupDeposits: state.motherGroupDeposits.filter((d) => d.motherGroupId !== id),
    }));
  },

  getMotherGroupMembers: (motherGroupId) => {
    return get().motherGroupMembers.filter((m) => m.motherGroupId === motherGroupId && m.isActive);
  },

  getMotherGroupById: (id) => {
    return get().motherGroups.find((g) => g.id === id);
  },

  addMotherGroupMember: (data) => {
    const newMember: MotherGroupMember = {
      ...data,
      id: 'mgm-' + Date.now(),
      joinedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      motherGroupMembers: [newMember, ...state.motherGroupMembers],
    }));
    return newMember;
  },

  updateMotherGroupMember: (id, updates) => {
    set((state) => ({
      motherGroupMembers: state.motherGroupMembers.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  },

  removeMotherGroupMember: (id) => {
    set((state) => ({
      motherGroupMembers: state.motherGroupMembers.filter((m) => m.id !== id),
    }));
  },

  recordMeeting: (data) => {
    const newMeeting: MotherGroupMeeting = {
      ...data,
      id: 'mgmt-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      motherGroupMeetings: [newMeeting, ...state.motherGroupMeetings],
    }));
    return newMeeting;
  },

  updateMeeting: (id, updates) => {
    set((state) => ({
      motherGroupMeetings: state.motherGroupMeetings.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  },

  recordDeposit: (data) => {
    const today = new Date().toISOString().split('T')[0];
    // Teller captures start as PENDING drafts; the passbook entry is only
    // created by postDepositToMemberAccount().
    const referenceNo =
      data.referenceNo ??
      buildCollectionReference(
        String(new Date().getFullYear()),
        get().motherGroupDeposits.length + 101
      );
    const newDeposit: MotherGroupDeposit = {
      ...data,
      referenceNo,
      status: data.status ?? 'PENDING',
      id: 'mgd-' + Date.now(),
      depositDate: today,
      createdAt: today,
    };
    set((state) => ({
      motherGroupDeposits: [newDeposit, ...state.motherGroupDeposits],
    }));
    return newDeposit;
  },

  updateDepositStatus: (id, status, notes) => {
    const deposit = get().motherGroupDeposits.find((d) => d.id === id);
    if (!deposit) return;
    // Posted collections must be reversed through voidMotherGroupDeposit so the
    // compensating ledger entry is always written.
    if (status === 'COMPLETED' && !deposit.transactionRef) return;
    if (status === 'VOID' && !notes) return;

    set((state) => {
      const deposits = state.motherGroupDeposits.map((d) =>
        d.id === id ? { ...d, status, notes: notes ?? d.notes } : d
      );
      return {
        motherGroupDeposits: deposits,
        motherGroupMeetings: recomputeMeetingTotals(
          state.motherGroupMeetings,
          deposits,
          deposit.meetingId
        ),
      };
    });
  },

  getDepositsByMeeting: (meetingId) => {
    return get().motherGroupDeposits.filter((d) => d.meetingId === meetingId);
  },

  getDepositsByGroup: (motherGroupId) => {
    return get().motherGroupDeposits.filter((d) => d.motherGroupId === motherGroupId);
  },

  getPendingDeposits: () => {
    return get().motherGroupDeposits.filter((d) => d.status === 'PENDING');
  },

  postDepositToMemberAccount: (depositId) => {
    const state = get();
    const deposit = state.motherGroupDeposits.find((d) => d.id === depositId);
    if (!deposit) return { ok: false, error: 'Collection not found.' };
    if (deposit.status === 'VOID') {
      return { ok: false, error: 'Voided collections cannot be posted.' };
    }
    // Idempotent: an already-posted collection keeps its original reference.
    if (deposit.transactionRef) return { ok: true, transactionRef: deposit.transactionRef };
    if (deposit.amount <= 0) {
      return { ok: false, error: 'Collection amount must be greater than zero.' };
    }

    const target = resolveCollectionTarget(deposit, state.members, state.savings);
    if (target.error || !target.accountNo) {
      return { ok: false, error: target.error ?? 'No savings account found for this member.' };
    }

    const transactionRef = buildCollectionReference(
      String(new Date().getFullYear()),
      state.motherGroupDeposits.length + 101
    );
    const postedAt = new Date().toISOString();
    const group = state.motherGroups.find((g) => g.id === deposit.motherGroupId);
    const transaction: Transaction = {
      id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      memberId: target.memberId,
      date: deposit.depositDate,
      type: 'DEPOSIT',
      description:
        'Mother Group Collection - ' +
        (group?.name ?? deposit.motherGroupId) +
        (deposit.bankDepositSlipNo ? ' (Slip ' + deposit.bankDepositSlipNo + ')' : ''),
      amount: deposit.amount,
      referenceNo: transactionRef,
      status: 'COMPLETED',
    };

    set((s) => {
      const deposits = s.motherGroupDeposits.map((d) =>
        d.id === depositId
          ? {
              ...d,
              memberId: target.memberId ?? d.memberId,
              savingsAccountNo: target.accountNo,
              transactionRef,
              postedAt,
              status: 'COMPLETED' as const,
            }
          : d
      );
      return {
        motherGroupDeposits: deposits,
        savings: s.savings.map((sa) =>
          sa.accountNo === target.accountNo ? { ...sa, balance: sa.balance + deposit.amount } : sa
        ),
        members: s.members.map((m) =>
          m.id === target.memberId ? { ...m, totalSavings: m.totalSavings + deposit.amount } : m
        ),
        transactions: [transaction, ...s.transactions],
        motherGroupMeetings: recomputeMeetingTotals(
          s.motherGroupMeetings,
          deposits,
          deposit.meetingId
        ),
      };
    });

    return { ok: true, transactionRef };
  },

  postMeetingCollections: (meetingId) => {
    const pending = get().motherGroupDeposits.filter(
      (d) => d.meetingId === meetingId && d.status === 'PENDING' && !d.transactionRef
    );
    let posted = 0;
    let failed = 0;
    pending.forEach((d) => {
      const result = get().postDepositToMemberAccount(d.id);
      if (result.ok) posted += 1;
      else failed += 1;
    });
    return { posted, failed };
  },

  voidMotherGroupDeposit: (depositId, reason) => {
    const state = get();
    const deposit = state.motherGroupDeposits.find((d) => d.id === depositId);
    if (!deposit || deposit.status === 'VOID') return;

    const wasPosted = Boolean(deposit.transactionRef);
    const reversal: Transaction | null = wasPosted
      ? {
          id: 'tx-void-' + Date.now(),
          memberId: deposit.memberId,
          date: new Date().toISOString().split('T')[0],
          type: 'WITHDRAWAL',
          description:
            'Mother Group Collection Void - ' + deposit.memberName + ' (' + reason + ')',
          amount: deposit.amount,
          referenceNo: 'MGVOID-' + Math.floor(10000 + Math.random() * 90000),
          status: 'COMPLETED',
        }
      : null;

    set((s) => {
      const deposits = s.motherGroupDeposits.map((d) =>
        d.id === depositId ? { ...d, status: 'VOID' as const, notes: reason } : d
      );
      return {
        motherGroupDeposits: deposits,
        motherGroupMeetings: recomputeMeetingTotals(
          s.motherGroupMeetings,
          deposits,
          deposit.meetingId
        ),
        savings: wasPosted
          ? s.savings.map((sa) =>
              sa.accountNo === deposit.savingsAccountNo
                ? { ...sa, balance: Math.max(0, sa.balance - deposit.amount) }
                : sa
            )
          : s.savings,
        members:
          wasPosted && deposit.memberId
            ? s.members.map((m) =>
                m.id === deposit.memberId
                  ? { ...m, totalSavings: Math.max(0, m.totalSavings - deposit.amount) }
                  : m
              )
            : s.members,
        transactions: reversal ? [reversal, ...s.transactions] : s.transactions,
      };
    });
  },

  getMemberDepositHistory: (memberId) => {
    const state = get();
    const memberNos = new Set(
      state.motherGroupMembers
        .filter((m) => m.memberId === memberId)
        .map((m) => m.memberNo.trim().toLowerCase())
    );
    return state.motherGroupDeposits.filter(
      (d) => d.memberId === memberId || memberNos.has((d.memberNo ?? '').trim().toLowerCase())
    );
  },

  updatePendingCollection: (id, updates) => {
    const deposit = get().motherGroupDeposits.find((d) => d.id === id);
    if (!deposit || deposit.status !== 'PENDING') return;
    if (updates.amount !== undefined && updates.amount <= 0) return;

    set((state) => {
      const deposits = state.motherGroupDeposits.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      );
      return {
        motherGroupDeposits: deposits,
        motherGroupMeetings: recomputeMeetingTotals(
          state.motherGroupMeetings,
          deposits,
          deposit.meetingId
        ),
      };
    });
  },

  // ============================================================================
  // TRADING METHODS
  // ============================================================================

  addTradingTransaction: (tx) => {
    const today = new Date().toISOString().split('T')[0];
    const newTx: TradingTransaction = {
      ...tx,
      id: 'trd-' + Date.now(),
      date: tx.date || today,
      status: tx.status || 'COMPLETED',
      createdAt: today,
    };
    set((state) => ({
      tradingTransactions: [newTx, ...state.tradingTransactions],
    }));
    return newTx;
  },

  updateTradingTransaction: (id, updates) => {
    set((state) => ({
      tradingTransactions: state.tradingTransactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  voidTradingTransaction: (id) => {
    set((state) => ({
      tradingTransactions: state.tradingTransactions.map((t) =>
        t.id === id ? { ...t, status: 'VOID' } : t
      ),
    }));
  },

  getTradingByDateRange: (startDate, endDate) => {
    return get().tradingTransactions.filter(
      (t) => t.date >= startDate && t.date <= endDate
    );
  },

  // ============================================================================
  // RECONCILIATION METHODS
  // ============================================================================

  addBankStatement: (entry) => {
    const newStatement: BankStatementEntry = {
      ...entry,
      id: 'bs-' + Date.now(),
      uploadedAt: new Date().toISOString(),
    };
    set((state) => ({
      bankStatements: [newStatement, ...state.bankStatements],
    }));
    return newStatement;
  },

  updateBankStatement: (id, updates) => {
    set((state) => ({
      bankStatements: state.bankStatements.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    }));
  },

  addReconciliationEntry: (entry) => {
    const now = new Date().toISOString();
    const newEntry: ReconciliationEntry = {
      ...entry,
      id: 'recon-' + Date.now(),
      flaggedAt: now,
      createdAt: now,
    };
    set((state) => ({
      reconciliationEntries: [newEntry, ...state.reconciliationEntries],
    }));
    return newEntry;
  },

  updateReconciliationStatus: (id, status, notes) => {
    set((state) => ({
      reconciliationEntries: state.reconciliationEntries.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              resolutionNotes: notes ?? r.resolutionNotes,
              resolvedDate:
                status === 'RESOLVED' || status === 'MATCHED'
                  ? new Date().toISOString()
                  : r.resolvedDate,
            }
          : r
      ),
    }));
  },

  getReconciliationByStatus: (status) => {
    return get().reconciliationEntries.filter((r) => r.status === status);
  },

  getReconciliationSummary: () => {
    const entries = get().reconciliationEntries;
    return {
      total: entries.length,
      matched: entries.filter((r) => r.status === 'MATCHED').length,
      mismatch: entries.filter((r) => r.status === 'MISMATCH').length,
      pending: entries.filter((r) => r.status === 'PENDING').length,
      resolved: entries.filter((r) => r.status === 'RESOLVED').length,
    };
  },

  // ============================================================================
  // GENERATED REPORT METHODS
  // ============================================================================

  addGeneratedReport: (report) => {
    const newReport: GeneratedReport = {
      ...report,
      id: 'rep-' + Date.now(),
      generatedAt: new Date().toISOString(),
    };
    set((state) => ({
      generatedReports: [newReport, ...state.generatedReports],
    }));
    return newReport;
  },

  removeGeneratedReport: (id) => {
    set((state) => ({
      generatedReports: state.generatedReports.filter((r) => r.id !== id),
    }));
  },
}));
