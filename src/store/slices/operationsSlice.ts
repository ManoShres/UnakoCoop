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
  buildDividendFiscalLockToken,
  STATUTORY_MAX_DIVIDEND_RATE_PERCENT,
} from '../../utils/dividendDistribution';
import {
  INITIAL_WAREHOUSE_RECEIPTS,
  INITIAL_WAREHOUSE_PLEDGE_LOANS,
  generateWarehouseReceiptNo,
  generateCropPledgeLoanNo,
  calculateHarvestLiquidationSettlement,
  STATUTORY_MAX_PLEDGE_LTV_PERCENT,
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

      // LEDGER INTEGRITY: a deposit is only ever credited to the depositor's OWN
      // savings account. There is deliberately NO fallback to `state.savings[0]`
      // (that credited an unrelated member). If no account matches, the deposit
      // stays PENDING and no balance/member total moves.
      const memberAcc = tx.memberId
        ? state.savings.find((s) => s.memberId === tx.memberId)
        : undefined;
      if (!memberAcc) return state;

      const accNo = memberAcc.accountNo;

      const updatedTxns = state.transactions.map((t) =>
        t.id === transactionId ? { ...t, status: 'COMPLETED' as const } : t
      );

      const updatedSavings = state.savings.map((s) =>
        s.accountNo === accNo ? { ...s, balance: s.balance + tx.amount } : s
      );

      // Only touch member totals when the matching account was actually credited.
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
    const ratePercent = Number(params.ratePercent);

    // Statutory guard: dividend rate must be within (0, 18%] of share capital
    // (Cooperative Act 2074 s.44(2)).
    if (
      !Number.isFinite(ratePercent) ||
      ratePercent <= 0 ||
      ratePercent > STATUTORY_MAX_DIVIDEND_RATE_PERCENT
    ) {
      throw new Error(
        `Invalid dividend rate ${params.ratePercent}%: rate must be > 0 and <= the statutory ${STATUTORY_MAX_DIVIDEND_RATE_PERCENT}% ceiling.`
      );
    }

    // Per-fiscal-year idempotency. Every transaction produced by a distribution
    // carries a stable fiscal-year lock token, so re-executing the same year is
    // rejected even after a store reload (the token is persisted with the ledger).
    const lockToken = buildDividendFiscalLockToken(params.fiscalYear);
    if (state.transactions.some((t) => t.description.includes(lockToken))) {
      throw new Error(
        `Dividend distribution for fiscal year ${params.fiscalYear} has already been executed (period locked).`
      );
    }

    const calc = calculateBulkDividend(state.members, ratePercent, deductTax);
    if (calc.validationError) {
      throw new Error(calc.validationError);
    }

    // Cap the aggregate gross payout at the distributable surplus. The client store
    // does not persist a period net profit, so a caller may pass an explicit
    // `distributableSurplus`; otherwise the share pool reserve fund is the only
    // surplus aggregate available client-side.
    // NEEDS SIGN-OFF: the authoritative distributable surplus must come from the
    // year-end closing engine server-side, not from the demo store aggregate.
    const explicitSurplus = (params as { distributableSurplus?: number }).distributableSurplus;
    const distributableSurplus =
      typeof explicitSurplus === 'number' && Number.isFinite(explicitSurplus) && explicitSurplus >= 0
        ? explicitSurplus
        : state.sharePool.totalReserveFund;
    if (distributableSurplus > 0 && calc.summary.totalGross > distributableSurplus) {
      throw new Error(
        `Dividend gross NPR ${calc.summary.totalGross} exceeds the distributable surplus NPR ${distributableSurplus}.`
      );
    }

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
        description: `Annual AGM Dividend (${ratePercent}%) ${lockToken} - ${params.destination === 'SAVINGS' && creditedMemberIds.has(m.id) ? 'Credited to Regular Savings' : 'Accrued to Member Ledger'} [Gross: NPR ${payout.grossDividend.toFixed(2)}, TDS 5%: NPR ${payout.taxDeduction.toFixed(2)}]`,
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
      title: `वार्षिक साधारण सभा लाभांश वितरण (${ratePercent}%) सम्पन्न (Annual Dividend Payout Disbursed)`,
      titleNepali: `वार्षिक साधारण सभा लाभांश वितरण (${ratePercent}%) सम्पन्न`,
      category: 'DIVIDEND',
      content: `आर्थिक वर्ष ${params.fiscalYear} को लागि साधारण सभाद्वारा स्वीकृत ${ratePercent}% सेयर लाभांश ५% कर कट्टी गरी सम्पूर्ण सक्रिय सदस्यहरूको खातामा सफलतापूर्वक जम्मा गरिएको छ।`,
      publishedDate: today,
      isUrgent: true,
      isActive: true,
    };

    const newNotification: Notification = {
      id: 'notif-' + Date.now(),
      title: 'Dividend Distributed / लाभांश वितरण',
      message: `Annual dividend of ${ratePercent}% distributed to ${calc.summary.memberCount} members (Net: NPR ${calc.summary.totalNet.toLocaleString()}).`,
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
        annualDividendPercent: ratePercent,
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

    // LEDGER INTEGRITY: the payable amount is derived from the member's statutory
    // entitlement rather than trusting the caller-supplied figure.
    //   entitlement = min(shareCapital × approved rate, 18% statutory ceiling)
    //                 further capped by the outstanding accrued dividend when one exists.
    // When an accrual exists it is already an approved liability, so the annual-rate
    // bound is relaxed to the hard 18% statutory ceiling.
    // NEEDS SIGN-OFF: the exact rate basis when sharePool.annualDividendPercent is
    // unset (0) but an accrual exists — currently the 18% ceiling bounds the accrual.
    const shareCapital = member.shareCapital || 0;
    const configuredRate = state.sharePool?.annualDividendPercent ?? 0;
    const approvedRate = Math.min(
      Math.max(0, configuredRate),
      STATUTORY_MAX_DIVIDEND_RATE_PERCENT
    );
    const statutoryCeiling = Math.floor(
      (shareCapital * STATUTORY_MAX_DIVIDEND_RATE_PERCENT) / 100
    );
    const computedEntitlement = Math.floor((shareCapital * approvedRate) / 100);
    const accrued = member.accruedDividend || 0;
    const entitlement =
      accrued > 0 ? Math.min(accrued, statutoryCeiling) : computedEntitlement;

    const gross = Math.floor(Number(params.amount));
    if (!Number.isFinite(gross) || gross <= 0 || gross > entitlement) {
      // Hard rejection: no ledger entry, no balance change, no accrued reduction.
      return { transactionRef: '', netAmount: 0, taxDeducted: 0 };
    }

    const deductTax = params.deductTax ?? true;
    const tax = deductTax ? Math.round(gross * 0.05) : 0;
    const net = Math.max(0, gross - tax);
    const ref = buildDividendTransactionRef('2081/82', Math.floor(Math.random() * 900000) + 100000);

    let updatedSavings = state.savings;
    let credited = false;
    if (params.destination === 'SAVINGS') {
      updatedSavings = state.savings.map((s) => {
        if (
          !credited &&
          s.memberId === member.id &&
          (params.savingsAccountNo ? s.accountNo === params.savingsAccountNo : true)
        ) {
          credited = true;
          return { ...s, balance: s.balance + net };
        }
        return s;
      });

      if (!credited) {
        // No matching savings account: never leave a phantom transaction and never
        // zero the member's entitlement.
        return { transactionRef: '', netAmount: 0, taxDeducted: 0 };
      }
    }

    const newTx: Transaction = {
      id: 'tx-div-' + Date.now(),
      memberId: member.id,
      date: today,
      type: 'DIVIDEND',
      description: `Single Member Dividend Payout (${params.destination === 'SAVINGS' ? 'Direct Savings Credit' : 'Cash Counter Disbursement'}) [Gross: NPR ${gross}, TDS 5%: NPR ${tax}]`,
      amount: net,
      referenceNo: ref,
      status: 'COMPLETED',
    };

    // Accrued dividend is reduced by the GROSS entitlement actually paid out (TDS is
    // withheld and remitted); it is only touched after a confirmed credit/disbursement.
    const updatedMembers = state.members.map((m) => {
      if (m.id !== member.id) return m;
      return {
        ...m,
        accruedDividend: Math.max(0, accrued - gross),
        totalSavings: credited ? (m.totalSavings || 0) + net : m.totalSavings,
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

      if (!credited) {
        // LEDGER INTEGRITY: with no matching member savings account the entitlement
        // must NOT be zeroed — the old code silently destroyed the member's dividend.
        // Fall back to "unpaid" (accrual preserved; no ledger entry).
        return { success: false, amountClaimed: 0 };
      }

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

    // (a) Status guard: only a STORED receipt may be pledged. This also makes the
    // operation idempotent — a second disbursement attempt after the receipt moved to
    // PLEDGED throws instead of double-crediting the member.
    if (receipt.status !== 'STORED') {
      throw new Error(
        `Pledge loan rejected: receipt ${receipt.receiptNo} is ${receipt.status}; only STORED receipts can be pledged.`
      );
    }
    if (state.warehousePledgeLoans.some((l) => l.receiptId === receipt.id && l.status === 'ACTIVE')) {
      throw new Error(
        `Pledge loan rejected: receipt ${receipt.receiptNo} already has an active pledge loan.`
      );
    }

    // (b) LTV / valuation cap from the receipt's permitted pledge ceiling.
    const permittedLtvAmount =
      receipt.maxEligiblePledgeLoanAmount > 0
        ? receipt.maxEligiblePledgeLoanAmount
        : Math.floor((receipt.totalMarketValuation * STATUTORY_MAX_PLEDGE_LTV_PERCENT) / 100);
    if (!Number.isFinite(principalAmount) || principalAmount <= 0) {
      throw new Error('Pledge loan rejected: principal amount must be greater than zero.');
    }
    if (principalAmount > permittedLtvAmount) {
      throw new Error(
        `Pledge loan rejected: principal NPR ${principalAmount} exceeds the permitted pledge ceiling NPR ${permittedLtvAmount} (${STATUTORY_MAX_PLEDGE_LTV_PERCENT}% of valuation).`
      );
    }

    // (c) The credit account must belong to the receipt owner.
    const targetAccount = state.savings.find((s) => s.accountNo === savingsAccountNo);
    if (!targetAccount) {
      throw new Error(`Pledge loan rejected: savings account ${savingsAccountNo} not found.`);
    }
    if (targetAccount.memberId !== receipt.memberId) {
      throw new Error(
        `Pledge loan rejected: savings account ${savingsAccountNo} does not belong to receipt owner ${receipt.memberId}.`
      );
    }

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

    // Credit the verified owner's designated savings account only.
    const updatedSavings = state.savings.map((s) =>
      s.accountNo === savingsAccountNo ? { ...s, balance: s.balance + principalAmount } : s
    );

    // Update member activeLoanBalance
    const updatedMembers = state.members.map((m) =>
      m.id === receipt.memberId
        ? { ...m, activeLoanBalance: (m.activeLoanBalance || 0) + principalAmount }
        : m
    );

    // (d) Record the CBS transaction as a LOAN_DISBURSEMENT, never as DEPOSIT —
    // booking it as DEPOSIT inflated deposit liabilities by the loan principal.
    const newTx: Transaction = {
      id: 'tx-pledge-' + Date.now(),
      memberId: receipt.memberId,
      date: today,
      type: 'LOAN_DISBURSEMENT',
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

    // Idempotency guard: a receipt already liquidated must never be settled (and the
    // member credited) twice.
    const currentReceipt = state.warehouseReceipts.find((r) => r.id === receipt.id);
    if (!currentReceipt || currentReceipt.status === 'LIQUIDATED_SOLD') {
      return result;
    }

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

    // Credit exactly ONE savings account of the receipt owner (the old code credited
    // EVERY savings account of the member). When no active account exists the surplus
    // is parked on the member's accrued ledger instead of being silently dropped.
    const surplus = result.netSurplusPayableToMember;
    const creditAccount =
      surplus > 0
        ? state.savings.find((s) => s.memberId === receipt.memberId && s.status === 'ACTIVE')
        : undefined;
    const credited = Boolean(creditAccount);
    const creditedAccountNo = creditAccount?.accountNo;

    const updatedSavings = credited
      ? state.savings.map((s) =>
          s.accountNo === creditedAccountNo ? { ...s, balance: s.balance + surplus } : s
        )
      : state.savings;

    const membersWithTotals = credited
      ? updatedMembers.map((m) =>
          m.id === receipt.memberId
            ? { ...m, totalSavings: (m.totalSavings || 0) + surplus }
            : m
        )
      : surplus > 0
        ? updatedMembers.map((m) =>
            m.id === receipt.memberId
              ? { ...m, accruedDividend: (m.accruedDividend || 0) + surplus }
              : m
          )
        : updatedMembers;

    const today = new Date().toISOString().split('T')[0];
    // Only book a ledger entry when value actually moved to a member account; the
    // accrued fallback is recorded in the notification instead of a phantom deposit.
    const newTx: Transaction | null =
      credited && surplus > 0
        ? {
            id: 'tx-wh-settle-' + Date.now(),
            memberId: receipt.memberId,
            date: today,
            type: 'DEPOSIT',
            description: `Harvest Liquidation Net Surplus (${receipt.receiptNo} - ${receipt.varietyName})`,
            amount: surplus,
            referenceNo: result.transactionRef,
            status: 'COMPLETED',
          }
        : null;

    set((s) => ({
      warehouseReceipts: updatedReceipts,
      warehousePledgeLoans: updatedLoans,
      members: membersWithTotals,
      savings: updatedSavings,
      transactions: newTx ? [newTx, ...s.transactions] : s.transactions,
      notifications: [
        {
          id: 'notif-' + Date.now(),
          type: 'FINANCE',
          title: 'अन्न बिक्री मिलान तथा नाफा भुक्तानी',
          message:
            credited || surplus <= 0
              ? result.summaryNe
              : `${result.summaryNe} (खुद बचत रकम रु. ${surplus.toLocaleString()} सदस्य बचत खाता नभएकोले बक्यौता महाजनीमा राखिएको छ।)`,
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

    // Idempotency: an already released receipt is a no-op (no double settlement).
    if (receipt.status === 'RELEASED') return;

    const today = new Date().toISOString().split('T')[0];

    // A6: releasing the crop must also retire the pledge liability. Settle the
    // outstanding ACTIVE pledge principal through the same arithmetic used by the
    // repayment path (Math.max(0, balance - amount)) and mirror it on the member's
    // activeLoanBalance so no phantom liability is left behind.
    const activePledgeLoans = state.warehousePledgeLoans.filter(
      (l) => l.receiptId === receiptId && l.status === 'ACTIVE'
    );
    const outstandingPledgePrincipal = activePledgeLoans.reduce(
      (sum, l) => sum + l.principalDisbursed,
      0
    );

    const updatedReceipts = state.warehouseReceipts.map((r) =>
      r.id === receiptId ? { ...r, status: 'RELEASED' as const } : r
    );

    const updatedLoans = state.warehousePledgeLoans.map((l) =>
      l.receiptId === receiptId && l.status === 'ACTIVE'
        ? { ...l, status: 'SETTLED' as const }
        : l
    );

    const updatedMembers =
      outstandingPledgePrincipal > 0
        ? state.members.map((m) =>
            m.id === receipt.memberId
              ? {
                  ...m,
                  activeLoanBalance: Math.max(
                    0,
                    (m.activeLoanBalance || 0) - outstandingPledgePrincipal
                  ),
                }
              : m
          )
        : state.members;

    const settlementTx: Transaction | null =
      outstandingPledgePrincipal > 0
        ? {
            id: 'tx-wh-release-' + Date.now(),
            memberId: receipt.memberId,
            date: today,
            type: 'LOAN_EMI',
            description: `Crop Pledge Loan Settled on Receipt Release (${receipt.receiptNo}${notes ? ' - ' + notes : ''})`,
            amount: outstandingPledgePrincipal,
            referenceNo: `WH-RELEASE-${receipt.receiptNo}`,
            status: 'COMPLETED',
          }
        : null;

    set((s) => ({
      warehouseReceipts: updatedReceipts,
      warehousePledgeLoans: updatedLoans,
      members: updatedMembers,
      transactions: settlementTx ? [settlementTx, ...s.transactions] : s.transactions,
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
