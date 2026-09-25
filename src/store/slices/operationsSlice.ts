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
import {
  calculateBulkDividend,
  calculateMemberDividend,
  calculateBulkBonusShares,
  buildDividendTransactionRef,
  buildBonusShareTransactionRef,
} from '../../utils/dividendDistribution';

export const createOperationsSlice: StateCreator<CoopState, [], [], OperationsSlice> = (set, get) => ({
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

  executeBulkDividendDistribution: (params) => {
    const state = get();
    const deductTax = params.deductTax ?? true;
    const calc = calculateBulkDividend(state.members, params.ratePercent, deductTax);
    const today = new Date().toISOString().split('T')[0];
    const newTransactions: Transaction[] = [];
    let seq = 1;

    const payoutMap = new Map(calc.rows.map((r) => [r.memberId, r]));

    const creditedMemberIds = new Set<string>();
    const updatedSavings = state.savings.map((acct) => {
      if (acct.memberId && params.destination === 'SAVINGS' && !creditedMemberIds.has(acct.memberId)) {
        const payout = payoutMap.get(acct.memberId);
        if (payout && payout.netPayable > 0) {
          creditedMemberIds.add(acct.memberId);
          return {
            ...acct,
            balance: acct.balance + payout.netPayable,
          };
        }
      }
      return acct;
    });

    const updatedMembers = state.members.map((m) => {
      const payout = payoutMap.get(m.id);
      if (!payout || payout.netPayable <= 0) return m;

      const ref = buildDividendTransactionRef(params.fiscalYear, seq++);
      newTransactions.push({
        id: 'tx-div-' + Date.now() + '-' + seq,
        memberId: m.id,
        date: today,
        type: 'DIVIDEND',
        description: `Annual AGM Dividend (${params.ratePercent}%) - ${params.destination === 'SAVINGS' && creditedMemberIds.has(m.id) ? 'Credited to Regular Savings' : 'Accrued to Member Ledger'} [Gross: NPR ${payout.grossDividend.toFixed(2)}, TDS 5%: NPR ${payout.taxDeduction.toFixed(2)}]`,
        amount: payout.netPayable,
        referenceNo: ref,
        status: 'COMPLETED',
      });

      if (params.destination === 'SAVINGS' && creditedMemberIds.has(m.id)) {
        return {
          ...m,
          totalSavings: (m.totalSavings || 0) + payout.netPayable,
        };
      } else {
        return {
          ...m,
          accruedDividend: (m.accruedDividend || 0) + payout.netPayable,
        };
      }
    });

    const newNotice: Notice = {
      id: 'not-' + Date.now(),
      title: `वार्षिक साधारण सभा लाभांश वितरण (${params.ratePercent}%) सम्पन्न (Annual Dividend Payout Disbursed)`,
      titleNepali: `वार्षिक साधारण सभा लाभांश वितरण (${params.ratePercent}%) सम्पन्न`,
      category: 'DIVIDEND',
      content: `आर्थिक वर्ष ${params.fiscalYear} को लागि साधारण सभाद्वारा स्वीकृत ${params.ratePercent}% सेयर लाभांश ५% कर कट्टी गरी सम्पूर्ण सक्रिय सदस्यहरूको खातामा सफलतापूर्वक जम्मा गरिएको छ।`,
      publishedDate: today,
      isUrgent: true,
      isActive: true,
    };

    const newNotification: Notification = {
      id: 'notif-' + Date.now(),
      title: 'Dividend Distributed / लाभांश वितरण',
      message: `Annual dividend of ${params.ratePercent}% distributed to ${calc.summary.memberCount} members (Net: NPR ${calc.summary.totalNet.toLocaleString()}).`,
      type: 'FINANCE',
      date: today,
      isRead: false,
    };

    set((state) => ({
      members: updatedMembers,
      savings: updatedSavings,
      transactions: [...newTransactions, ...state.transactions],
      notices: [newNotice, ...state.notices],
      notifications: [newNotification, ...state.notifications],
      sharePool: {
        ...state.sharePool,
        annualDividendPercent: params.ratePercent,
      },
    }));

    return calc.summary;
  },

  executeSingleMemberDividend: (params) => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    const member = state.members.find((m) => m.id === params.memberId);
    if (!member) {
      return { transactionRef: '', netAmount: 0, taxDeducted: 0 };
    }

    const deductTax = params.deductTax ?? true;
    const tax = deductTax ? Math.round(params.amount * 0.05) : 0;
    const net = Math.max(0, params.amount - tax);
    const ref = buildDividendTransactionRef('2081/82', Math.floor(Math.random() * 900000) + 100000);

    const newTx: Transaction = {
      id: 'tx-div-' + Date.now(),
      memberId: member.id,
      date: today,
      type: 'DIVIDEND',
      description: `Single Member Dividend Payout (${params.destination === 'SAVINGS' ? 'Direct Savings Credit' : 'Cash Counter Disbursement'}) [TDS 5%: NPR ${tax}]`,
      amount: net,
      referenceNo: ref,
      status: 'COMPLETED',
    };

    let updatedSavings = state.savings;
    if (params.destination === 'SAVINGS') {
      let credited = false;
      updatedSavings = state.savings.map((s) => {
        if (!credited && s.memberId === member.id && (params.savingsAccountNo ? s.accountNo === params.savingsAccountNo : true)) {
          credited = true;
          return { ...s, balance: s.balance + net };
        }
        return s;
      });
    }

    const updatedMembers = state.members.map((m) => {
      if (m.id !== member.id) return m;
      return {
        ...m,
        accruedDividend: Math.max(0, (m.accruedDividend || 0) - params.amount),
        totalSavings: params.destination === 'SAVINGS' ? (m.totalSavings || 0) + net : m.totalSavings,
      };
    });

    set((state) => ({
      members: updatedMembers,
      savings: updatedSavings,
      transactions: [newTx, ...state.transactions],
    }));

    return { transactionRef: ref, netAmount: net, taxDeducted: tax };
  },

  executeBonusShareDistribution: (params) => {
    const state = get();
    const parValue = params.parValue || 100;
    const calc = calculateBulkBonusShares(state.members, params.bonusPercent, parValue);
    const today = new Date().toISOString().split('T')[0];
    const newTransactions: Transaction[] = [];
    let seq = 1;

    const rowMap = new Map(calc.rows.map((r) => [r.memberId, r]));

    const updatedMembers = state.members.map((m) => {
      const row = rowMap.get(m.id);
      if (!row || row.bonusKitta <= 0) return m;

      const ref = buildBonusShareTransactionRef(params.fiscalYear, seq++);
      newTransactions.push({
        id: 'tx-bsh-' + Date.now() + '-' + seq,
        memberId: m.id,
        date: today,
        type: 'SHARE_PURCHASE',
        description: `Bonus Share Allotment (${row.bonusKitta} Kitta @ ${params.bonusPercent}% AGM Bonus)`,
        amount: row.addedCapital,
        referenceNo: ref,
        status: 'COMPLETED',
      });

      return {
        ...m,
        shareKitta: row.newTotalKitta,
        shareCapital: row.newTotalCapital,
      };
    });

    const newNotice: Notice = {
      id: 'not-' + Date.now(),
      title: `वार्षिक साधारण सभा बोनस सेयर बाँडफाँड (${params.bonusPercent}%) सम्पन्न (Bonus Shares Allotted)`,
      titleNepali: `वार्षिक साधारण सभा बोनस सेयर बाँडफाँड (${params.bonusPercent}%) सम्पन्न`,
      category: 'DIVIDEND',
      content: `आर्थिक वर्ष ${params.fiscalYear} को लागि साधारण सभाद्वारा स्वीकृत ${params.bonusPercent}% बोनस सेयर कित्ता सम्पूर्ण सक्रिय सदस्यहरूको सेयर पुँजीमा सफलतापूर्वक थप गरिएको छ।`,
      publishedDate: today,
      isUrgent: false,
      isActive: true,
    };

    const newNotification: Notification = {
      id: 'notif-' + Date.now(),
      title: 'Bonus Shares Distributed / बोनस सेयर बाँडफाँड',
      message: `Bonus shares of ${params.bonusPercent}% allotted to ${calc.summary.memberCount} members (Total: ${calc.summary.totalBonusKitta} Kitta).`,
      type: 'FINANCE',
      date: today,
      isRead: false,
    };

    set((state) => ({
      members: updatedMembers,
      transactions: [...newTransactions, ...state.transactions],
      notices: [newNotice, ...state.notices],
      notifications: [newNotification, ...state.notifications],
      sharePool: {
        ...state.sharePool,
        totalAllottedKitta: state.sharePool.totalAllottedKitta + calc.summary.totalBonusKitta,
      },
    }));

    return calc.summary;
  },

  claimMemberDividend: (params) => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    const member = state.members.find((m) => m.id === params.memberId);
    if (!member || (member.accruedDividend || 0) <= 0) {
      return { success: false, amountClaimed: 0 };
    }

    const amountToClaim = member.accruedDividend;

    if (params.destination === 'SAVINGS') {
      const ref = buildDividendTransactionRef('2081/82', Math.floor(Math.random() * 900000) + 100000);
      let credited = false;
      const updatedSavings = state.savings.map((s) => {
        if (!credited && s.memberId === member.id && (params.savingsAccountNo ? s.accountNo === params.savingsAccountNo : true)) {
          credited = true;
          return { ...s, balance: s.balance + amountToClaim };
        }
        return s;
      });

      const updatedMembers = state.members.map((m) => {
        if (m.id !== member.id) return m;
        return {
          ...m,
          accruedDividend: 0,
          totalSavings: (m.totalSavings || 0) + amountToClaim,
        };
      });

      const newTx: Transaction = {
        id: 'tx-div-claim-' + Date.now(),
        memberId: member.id,
        date: today,
        type: 'DIVIDEND',
        description: 'Member Portal Accrued Dividend Claim to Regular Savings',
        amount: amountToClaim,
        referenceNo: ref,
        status: 'COMPLETED',
      };

      set((state) => ({
        members: updatedMembers,
        savings: updatedSavings,
        transactions: [newTx, ...state.transactions],
      }));

      return { success: true, amountClaimed: amountToClaim };
    } else {
      // Reinvest in Shares
      const kitta = Math.floor(amountToClaim / 100);
      if (kitta <= 0) {
        return { success: false, amountClaimed: 0 };
      }
      const capitalAdded = kitta * 100;
      const remaining = amountToClaim - capitalAdded;
      const ref = buildBonusShareTransactionRef('2081/82', Math.floor(Math.random() * 900000) + 100000);

      const updatedMembers = state.members.map((m) => {
        if (m.id !== member.id) return m;
        return {
          ...m,
          shareKitta: (m.shareKitta || Math.round(m.shareCapital / 100)) + kitta,
          shareCapital: m.shareCapital + capitalAdded,
          accruedDividend: remaining,
        };
      });

      const newTx: Transaction = {
        id: 'tx-share-reinvest-' + Date.now(),
        memberId: member.id,
        date: today,
        type: 'SHARE_PURCHASE',
        description: `Member Portal Dividend Reinvestment (${kitta} Kitta @ NPR 100)`,
        amount: capitalAdded,
        referenceNo: ref,
        status: 'COMPLETED',
      };

      set((state) => ({
        members: updatedMembers,
        transactions: [newTx, ...state.transactions],
        sharePool: {
          ...state.sharePool,
          totalAllottedKitta: state.sharePool.totalAllottedKitta + kitta,
        },
      }));

      return { success: true, amountClaimed: capitalAdded, newSharesCount: kitta };
    }
  },
});
