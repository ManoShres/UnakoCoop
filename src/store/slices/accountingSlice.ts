import { StateCreator } from 'zustand';
import {
  TradingTransaction,
  BankStatementEntry,
  ReconciliationEntry,
  GeneratedReport,
} from '../../types';
import { INITIAL_TRADING_TRANSACTIONS } from '../../data/tradingMockData';
import { INITIAL_BANK_STATEMENTS } from '../../data/bankStatementsMockData';
import { INITIAL_RECONCILIATION_ENTRIES } from '../../data/reconciliationMockData';
import { INITIAL_GENERATED_REPORTS } from '../../data/generatedReportsMockData';
import { CoopState, AccountingSlice } from '../storeTypes';

export const createAccountingSlice: StateCreator<CoopState, [], [], AccountingSlice> = (set, get) => ({
  tradingTransactions: INITIAL_TRADING_TRANSACTIONS,
  bankStatements: INITIAL_BANK_STATEMENTS,
  reconciliationEntries: INITIAL_RECONCILIATION_ENTRIES,
  generatedReports: INITIAL_GENERATED_REPORTS,

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
});
