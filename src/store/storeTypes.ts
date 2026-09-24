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
import { EmployeeSyncStatus } from './initialData';
import { CollectionPostingResult } from '../utils/collectionPosting';

export interface MemberSlice {
  members: Member[];
  updateMemberDetails: (memberId: string, updates: Partial<Member>) => void;
  addMember: (memberData: Omit<Member, 'id'>) => Member;
  updateMemberStatus: (memberId: string, status: Member['status'], notes?: string) => void;
  searchMember: (query: string) => Member | undefined;
}

export interface EmployeeSlice {
  employees: Employee[];
  employeeSync: EmployeeSyncStatus;
  addEmployee: (employeeData: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => void;
  removeEmployee: (employeeId: string) => void;
  syncEmployees: () => Promise<void>;
}

export interface LoanSlice {
  loans: Loan[];
  applications: LoanApplication[];
  loanSchemes: LoanScheme[];
  addLoanApplication: (app: Omit<LoanApplication, 'id' | 'applicationNo' | 'appliedDate' | 'status'>) => LoanApplication;
  updateApplicationStatus: (id: string, status: LoanApplication['status'], notes?: string) => void;
  updateLoanScheme: (schemeId: string, updates: Partial<LoanScheme>) => void;
  addLoanScheme: (scheme: Omit<LoanScheme, 'id'>) => void;
  recordLoanRepayment: (loanNo: string, amount: number, note?: string) => void;
}

export interface SavingsSlice {
  savings: SavingsAccount[];
  adjustSavingsBalance: (accountNo: string, amount: number, type: 'DEPOSIT' | 'WITHDRAWAL', note?: string) => void;
  updateSavingsRate: (accountType: string, newRate: number) => void;
  addSavingsAccount: (account: Omit<SavingsAccount, 'id'>) => SavingsAccount;
}

export interface OperationsSlice {
  transactions: Transaction[];
  inquiries: Inquiry[];
  notifications: Notification[];
  notices: Notice[];
  gatewayRails: GatewayRail[];
  sharePool: SharePool;
  agmDetails: AgmDetails;
  fieldOfficers: FieldOfficer[];
  coopSettings: CoopSettings;

  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
  toggleGatewayRail: (gatewayId: string, status: GatewayRail['status']) => void;
  updateGatewayLimit: (gatewayId: string, dailyLimit: number) => void;
  updateSharePool: (updates: Partial<SharePool>) => void;
  issueShareCertificate: (memberId: string, kittaCount: number, certificateNo: string) => void;
  addNotice: (notice: Omit<Notice, 'id' | 'publishedDate'>) => void;
  updateNotice: (id: string, updates: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  updateAgmDetails: (updates: Partial<AgmDetails>) => void;
  updateFieldOfficer: (id: string, updates: Partial<FieldOfficer>) => void;
  addInquiry: (inq: Omit<Inquiry, 'id' | 'date' | 'status'>) => void;
  replyToInquiry: (id: string, reply: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateCoopSettings: (updates: Partial<CoopSettings>) => void;
}

export interface MotherGroupSlice {
  motherGroups: MotherGroup[];
  motherGroupMembers: MotherGroupMember[];
  motherGroupMeetings: MotherGroupMeeting[];
  motherGroupDeposits: MotherGroupDeposit[];

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
  postDepositToMemberAccount: (depositId: string) => CollectionPostingResult;
  postMeetingCollections: (meetingId: string) => { posted: number; failed: number };
  voidMotherGroupDeposit: (depositId: string, reason: string) => void;
  getMemberDepositHistory: (memberId: string) => MotherGroupDeposit[];
  updatePendingCollection: (
    id: string,
    updates: { amount?: number; bankDepositSlipNo?: string; notes?: string }
  ) => void;
}

export interface AccountingSlice {
  tradingTransactions: TradingTransaction[];
  bankStatements: BankStatementEntry[];
  reconciliationEntries: ReconciliationEntry[];
  generatedReports: GeneratedReport[];

  addTradingTransaction: (
    tx: Omit<TradingTransaction, 'id' | 'date' | 'createdAt' | 'status'> & {
      date?: string;
      status?: TradingTransaction['status'];
    }
  ) => TradingTransaction;
  updateTradingTransaction: (id: string, updates: Partial<TradingTransaction>) => void;
  voidTradingTransaction: (id: string) => void;
  getTradingByDateRange: (startDate: string, endDate: string) => TradingTransaction[];

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

  addGeneratedReport: (report: Omit<GeneratedReport, 'id' | 'generatedAt'>) => GeneratedReport;
  removeGeneratedReport: (id: string) => void;
}

export type CoopState = MemberSlice &
  EmployeeSlice &
  LoanSlice &
  SavingsSlice &
  OperationsSlice &
  MotherGroupSlice &
  AccountingSlice;
