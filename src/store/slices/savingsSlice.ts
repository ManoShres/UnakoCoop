import { StateCreator } from 'zustand';
import { SavingsAccount } from '../../types';
import { INITIAL_SAVINGS } from '../../data/mockData';
import { CoopState, SavingsSlice } from '../storeTypes';

export const createSavingsSlice: StateCreator<CoopState, [], [], SavingsSlice> = (set) => ({
  savings: INITIAL_SAVINGS,

  adjustSavingsBalance: (accountNo, amount, type, note) => {
    set((state) => {
      const targetAcc = state.savings.find((s) => s.accountNo === accountNo);
      const memberId = targetAcc?.memberId;
      const updatedSavings = state.savings.map((s) =>
        s.accountNo === accountNo
          ? {
              ...s,
              balance: type === 'DEPOSIT' ? s.balance + amount : Math.max(0, s.balance - amount),
            }
          : s
      );

      const updatedMembers = memberId
        ? state.members.map((m) =>
            m.id === memberId
              ? {
                  ...m,
                  totalSavings:
                    type === 'DEPOSIT'
                      ? (m.totalSavings || 0) + amount
                      : Math.max(0, (m.totalSavings || 0) - amount),
                }
              : m
          )
        : state.members;

      const desc =
        note ||
        (type === 'DEPOSIT'
          ? 'Deposit: ' + accountNo
          : 'Withdrawal: ' + accountNo);

      const newTx = {
        id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        memberId,
        date: new Date().toISOString().split('T')[0],
        type,
        description: desc,
        amount,
        referenceNo: 'ADJ-' + Math.floor(10000 + Math.random() * 90000),
        status: 'COMPLETED' as const,
      };

      return {
        savings: updatedSavings,
        members: updatedMembers,
        transactions: [newTx, ...state.transactions],
      };
    });
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
