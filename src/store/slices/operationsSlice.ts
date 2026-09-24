import { StateCreator } from 'zustand';
import {
  Transaction,
  Inquiry,
  Notification,
  Notice,
} from '../../types';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_INQUIRIES,
  INITIAL_NOTIFICATIONS,
} from '../../data/mockData';
import {
  INITIAL_NOTICES,
  INITIAL_GATEWAY_RAILS,
  INITIAL_SHARE_POOL,
  INITIAL_AGM_DETAILS,
  INITIAL_FIELD_OFFICERS,
  getStoredCoopSettings,
} from '../initialData';
import { CoopState, OperationsSlice } from '../storeTypes';

export const createOperationsSlice: StateCreator<CoopState, [], [], OperationsSlice> = (set) => ({
  transactions: INITIAL_TRANSACTIONS,
  inquiries: INITIAL_INQUIRIES,
  notifications: INITIAL_NOTIFICATIONS,
  notices: INITIAL_NOTICES,
  gatewayRails: INITIAL_GATEWAY_RAILS,
  sharePool: INITIAL_SHARE_POOL,
  agmDetails: INITIAL_AGM_DETAILS,
  fieldOfficers: INITIAL_FIELD_OFFICERS,
  coopSettings: getStoredCoopSettings(),

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

  updateSharePool: (updates) => {
    set((state) => ({
      sharePool: { ...state.sharePool, ...updates },
    }));
  },

  issueShareCertificate: (memberId, kittaCount, certificateNo) => {
    const kittaAmount = kittaCount * 100;
    set((state) => ({
      sharePool: {
        ...state.sharePool,
        totalAllottedKitta: state.sharePool.totalAllottedKitta + kittaCount,
      },
      members: state.members.map((m) =>
        m.id === memberId
          ? {
              ...m,
              shareCapital: m.shareCapital + kittaAmount,
              shareKitta: (m.shareKitta || Math.round(m.shareCapital / 100)) + kittaCount,
            }
          : m
      ),
      transactions: [
        {
          id: 'tx-' + Date.now(),
          memberId,
          date: new Date().toISOString().split('T')[0],
          type: 'SHARE_PURCHASE',
          description: `Share Certificate Allotment (${kittaCount} Kitta, Cert #${certificateNo})`,
          amount: kittaAmount,
          referenceNo: certificateNo,
          status: 'COMPLETED',
        },
        ...state.transactions,
      ],
    }));
  },

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
});
