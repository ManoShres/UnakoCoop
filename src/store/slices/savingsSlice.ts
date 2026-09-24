import { StateCreator } from 'zustand';
import { SavingsAccount } from '../../types';
import { INITIAL_SAVINGS } from '../../data/mockData';
import { CoopState, SavingsSlice } from '../storeTypes';

export const createSavingsSlice: StateCreator<CoopState, [], [], SavingsSlice> = (set) => ({
  savings: INITIAL_SAVINGS,

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

  addSavingsAccount: (accountData) => {
    const newAccount: SavingsAccount = {
      ...accountData,
      id: 'sav-' + Date.now(),
    };
    set((state) => ({
      savings: [newAccount, ...state.savings],
    }));
    return newAccount;
  },
});
