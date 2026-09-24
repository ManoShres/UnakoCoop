import { StateCreator } from 'zustand';
import { LoanApplication, LoanScheme } from '../../types';
import { INITIAL_LOANS, INITIAL_APPLICATIONS } from '../../data/mockData';
import { INITIAL_LOAN_SCHEMES } from '../initialData';
import { formatNPR } from '../../utils/nepaliDate';
import { CoopState, LoanSlice } from '../storeTypes';

export const createLoanSlice: StateCreator<CoopState, [], [], LoanSlice> = (set) => ({
  loans: INITIAL_LOANS,
  applications: INITIAL_APPLICATIONS,
  loanSchemes: INITIAL_LOAN_SCHEMES,

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
});
