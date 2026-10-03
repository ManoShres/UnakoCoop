import { StateCreator } from 'zustand';
import {
  Transaction,
  Inquiry,
  Notification,
  Notice,
  WarehouseReceipt,
  WarehousePledgeLoan,
  HarvestLiquidationParams,
  HarvestLiquidationResult,
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
import {
  INITIAL_WAREHOUSE_RECEIPTS,
  INITIAL_WAREHOUSE_PLEDGE_LOANS,
  generateWarehouseReceiptNo,
  generateCropPledgeLoanNo,
  calculateHarvestLiquidationSettlement,
} from '../../utils/warehouseReceiptEngine';

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
  warehouseReceipts: INITIAL_WAREHOUSE_RECEIPTS,
  warehousePledgeLoans: INITIAL_WAREHOUSE_PLEDGE_LOANS,

  addTransaction: (txData) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: txData.status || 'COMPLETED',
    };

    set((state) => ({
      transactions: [newTx, ...state.transactions],
    }));
  },

  confirmPendingDeposit: (transactionId) => {
    set((state) => {
      const tx = state.transactions.find((t) => t.id === transactionId);
      if (!tx || tx.status !== 'PENDING' || tx.type !== 'DEPOSIT') return state;

      const memberAcc = state.savings.find((s) => s.memberId === tx.memberId) || state.savings[0];
      const accNo = memberAcc ? memberAcc.accountNo : '004-10294-88-01';

      const updatedTxns = state.transactions.map((t) =>
        t.id === transactionId ? { ...t, status: 'COMPLETED' as const } : t
      );

      const updatedSavings = state.savings.map((s) =>
        s.accountNo === accNo ? { ...s, balance: s.balance + tx.amount } : s
      );

      const updatedMembers = tx.memberId
        ? state.members.map((m) =>
            m.id === tx.memberId ? { ...m, totalSavings: (m.totalSavings || 0) + tx.amount } : m
          )
        : state.members;

      return {
        transactions: updatedTxns,
        savings: updatedSavings,
        members: updatedMembers,
      };
    });
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

  issueWarehouseReceipt: (receiptData) => {
    const state = get();
    const id = 'whr-' + Date.now();
    const receiptNo = generateWarehouseReceiptNo(state.warehouseReceipts.length + 1);
    const newReceipt: WarehouseReceipt = {
      ...receiptData,
      id,
      receiptNo,
      status: 'STORED',
      createdAt: new Date().toISOString(),
    };

    const today = new Date().toISOString().split('T')[0];

    set((s) => ({
      warehouseReceipts: [newReceipt, ...s.warehouseReceipts],
      notifications: [
        {
          id: 'notif-' + Date.now(),
          type: 'FINANCE',
          title: 'अन्न गोदाम रसिद जारी भयो',
          message: `${receiptData.varietyName} (${receiptData.netWeightQuintals} क्विन्टल) को गोदाम रसिद ${receiptNo} जारी गरियो।`,
          date: today,
          isRead: false,
        },
        ...s.notifications,
      ],
    }));

    return newReceipt;
  },

  disbursePledgeLoan: ({ receiptId, principalAmount, savingsAccountNo, tenureMonths = 6, notes }) => {
    const state = get();
    const receipt = state.warehouseReceipts.find((r) => r.id === receiptId);
    if (!receipt) throw new Error('Warehouse receipt not found');

    const loanId = 'wln-' + Date.now();
    const loanNo = generateCropPledgeLoanNo(state.warehousePledgeLoans.length + 1);
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + tenureMonths * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const newLoan: WarehousePledgeLoan = {
      id: loanId,
      loanNo,
      receiptId: receipt.id,
      receiptNo: receipt.receiptNo,
      memberId: receipt.memberId,
      memberName: receipt.memberName,
      principalDisbursed: principalAmount,
      annualInterestRate: 8.5,
      disbursedDate: today,
      dueDate,
      tenureMonths,
      monthlyStorageRatePerQuintal: receipt.storageMonthlyChargePerQuintal,
      savingsAccountNo,
      status: 'ACTIVE',
      notes: notes || `कृषि उपज धितो कर्जा (गोदाम रसिद नं. ${receipt.receiptNo})`,
    };

    // Update receipt status
    const updatedReceipts = state.warehouseReceipts.map((r) =>
      r.id === receiptId ? { ...r, status: 'PLEDGED' as const, activeLoanId: loanId } : r
    );

    // Credit member savings
    const updatedSavings = state.savings.map((s) =>
      s.accountNo === savingsAccountNo ? { ...s, balance: s.balance + principalAmount } : s
    );

    // Update member activeLoanBalance
    const updatedMembers = state.members.map((m) =>
      m.id === receipt.memberId ? { ...m, activeLoanBalance: m.activeLoanBalance + principalAmount } : m
    );

    // Record CBS Transaction (Crediting regular savings)
    const newTx: Transaction = {
      id: 'tx-pledge-' + Date.now(),
      memberId: receipt.memberId,
      date: today,
      type: 'DEPOSIT',
      description: `Crop Pledge Loan Disbursed (${receipt.receiptNo} - ${receipt.varietyName})`,
      amount: principalAmount,
      referenceNo: loanNo,
      status: 'COMPLETED',
    };

    set((s) => ({
      warehouseReceipts: updatedReceipts,
      warehousePledgeLoans: [newLoan, ...s.warehousePledgeLoans],
      savings: updatedSavings,
      members: updatedMembers,
      transactions: [newTx, ...s.transactions],
      notifications: [
        {
          id: 'notif-' + Date.now(),
          type: 'FINANCE',
          title: 'कृषि धितो कर्जा निकासा भयो',
          message: `गोदाम रसिद ${receipt.receiptNo} धितोमा रु. ${principalAmount.toLocaleString()} कर्जा बचत खातामा जम्मा भयो।`,
          date: today,
          isRead: false,
        },
        ...s.notifications,
      ],
    }));

    return newLoan;
  },

  settleWarehouseReceipt: (params, elapsedMonths = 3) => {
    const state = get();
    const result = calculateHarvestLiquidationSettlement(params, elapsedMonths);
    const { receipt } = params;

    const updatedReceipts = state.warehouseReceipts.map((r) =>
      r.id === receipt.id ? { ...r, status: 'LIQUIDATED_SOLD' as const } : r
    );

    const updatedLoans = state.warehousePledgeLoans.map((l) =>
      l.receiptId === receipt.id ? { ...l, status: 'SETTLED' as const } : l
    );

    const updatedMembers = state.members.map((m) => {
      if (m.id !== receipt.memberId) return m;
      const newLoanBal = Math.max(0, m.activeLoanBalance - result.loanPrincipalDeducted);
      return { ...m, activeLoanBalance: newLoanBal };
    });

    let updatedSavings = state.savings;
    if (result.netSurplusPayableToMember > 0) {
      updatedSavings = state.savings.map((s) => {
        if (s.memberId === receipt.memberId) {
          return { ...s, balance: s.balance + result.netSurplusPayableToMember };
        }
        return s;
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const newTx: Transaction = {
      id: 'tx-wh-settle-' + Date.now(),
      memberId: receipt.memberId,
      date: today,
      type: 'DEPOSIT',
      description: `Harvest Liquidation Net Surplus (${receipt.receiptNo} - ${receipt.varietyName})`,
      amount: result.netSurplusPayableToMember,
      referenceNo: result.transactionRef,
      status: 'COMPLETED',
    };

    set((s) => ({
      warehouseReceipts: updatedReceipts,
      warehousePledgeLoans: updatedLoans,
      members: updatedMembers,
      savings: updatedSavings,
      transactions: [newTx, ...s.transactions],
      notifications: [
        {
          id: 'notif-' + Date.now(),
          type: 'FINANCE',
          title: 'अन्न बिक्री मिलान तथा नाफा भुक्तानी',
          message: result.summaryNe,
          date: today,
          isRead: false,
        },
        ...s.notifications,
      ],
    }));

    return result;
  },

  releaseWarehouseReceiptCrop: (receiptId, notes) => {
    const state = get();
    const receipt = state.warehouseReceipts.find((r) => r.id === receiptId);
    if (!receipt) return;
    const today = new Date().toISOString().split('T')[0];

    const updatedReceipts = state.warehouseReceipts.map((r) =>
      r.id === receiptId ? { ...r, status: 'RELEASED' as const } : r
    );

    const updatedLoans = state.warehousePledgeLoans.map((l) =>
      l.receiptId === receiptId ? { ...l, status: 'SETTLED' as const } : l
    );

    set((s) => ({
      warehouseReceipts: updatedReceipts,
      warehousePledgeLoans: updatedLoans,
      notifications: [
        {
          id: 'notif-' + Date.now(),
          type: 'FINANCE',
          title: 'गोदामबाट अन्न फिर्ता लगियो',
          message: `गोदाम रसिद ${receipt.receiptNo} अन्तर्गत भण्डारण गरिएको ${receipt.varietyName} किसानले सकुशल फिर्ता लिनुभयो।`,
          date: today,
          isRead: false,
        },
        ...s.notifications,
      ],
    }));
  },
});
