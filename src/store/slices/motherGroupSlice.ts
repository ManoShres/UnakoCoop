import { StateCreator } from 'zustand';
import {
  MotherGroup,
  MotherGroupMember,
  MotherGroupMeeting,
  MotherGroupDeposit,
  Transaction,
} from '../../types';
import { INITIAL_MOTHER_GROUPS } from '../../data/motherGroupMockData';
import { INITIAL_MOTHER_GROUP_MEMBERS } from '../../data/motherGroupMembersMockData';
import { INITIAL_MOTHER_GROUP_MEETINGS } from '../../data/motherGroupMeetingsMockData';
import { INITIAL_MOTHER_GROUP_DEPOSITS } from '../../data/motherGroupDepositsMockData';
import {
  buildCollectionReference,
  resolveCollectionTarget,
  summariseMeetingDeposits,
} from '../../utils/collectionPosting';
import { CoopState, MotherGroupSlice } from '../storeTypes';

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

export const createMotherGroupSlice: StateCreator<CoopState, [], [], MotherGroupSlice> = (set, get) => ({
  motherGroups: INITIAL_MOTHER_GROUPS,
  motherGroupMembers: INITIAL_MOTHER_GROUP_MEMBERS,
  motherGroupMeetings: INITIAL_MOTHER_GROUP_MEETINGS,
  motherGroupDeposits: INITIAL_MOTHER_GROUP_DEPOSITS,

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
      id: 'mgmt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
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
      id: 'mgd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
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
});
