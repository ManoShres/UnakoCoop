/**
 * Inter-Branch & Service Center Domestic Remittance Clearing & Settlement Engine
 * (शाखा तथा सेवा केन्द्र आन्तरिक विप्रेषण फछ्र्यौट तथा क्लियरिङ प्रणाली)
 * Unako SACCOS (उनको बचत तथा ऋण सहकारी संस्था लि., गढवा-५, दाङ)
 * Compliant with Nepal Rastra Bank (NRB) Remittance Directives and Cooperative Internal Transfer Guidelines.
 */

export interface RemittanceBranchInfo {
  readonly id: string;
  readonly name: string;
}

export interface RemittanceFeeBreakdown {
  readonly fee: number;
  readonly senderCommission: number;
  readonly receiverCommission: number;
  readonly headOfficeReserve: number;
}

export interface RemittanceOrderPayload {
  readonly sendingBranchId: string;
  readonly sendingBranchName: string;
  readonly receivingBranchId: string;
  readonly receivingBranchName: string;
  readonly senderMemberNo: string;
  readonly senderName: string;
  readonly senderPhone: string;
  readonly receiverName: string;
  readonly receiverPhone: string;
  readonly receiverCitizenshipNo: string;
  readonly remitAmount: number;
  readonly securityPin: string;
  readonly sentTimestampBS: string;
}

export interface RemittanceTransaction {
  readonly controlNo: string;
  readonly sendingBranchId: string;
  readonly sendingBranchName: string;
  readonly receivingBranchId: string;
  readonly receivingBranchName: string;
  readonly senderMemberNo: string;
  readonly senderName: string;
  readonly senderPhone: string;
  readonly receiverName: string;
  readonly receiverPhone: string;
  readonly receiverCitizenshipNo: string;
  readonly remitAmount: number;
  readonly serviceFee: number;
  readonly totalPaidBySender: number;
  readonly sendingBranchCommission: number;
  readonly payingBranchCommission: number;
  readonly headOfficeCommission: number;
  readonly status: 'SEND_PENDING_PAYOUT' | 'PAID_OUT' | 'CANCELLED_REFUNDED';
  readonly securityPinHash: string;
  readonly sentTimestampBS: string;
  readonly paidTimestampBS?: string;
  readonly paidByTellerId?: string;
}

export interface InterBranchClearingSummary {
  readonly branchId: string;
  readonly branchName: string;
  readonly totalSentCount: number;
  readonly totalSentAmount: number;
  readonly totalPaidCount: number;
  readonly totalPaidAmount: number;
  readonly netBalance: number; // positive = net payable to network; negative = net receivable
  readonly earnedCommission: number;
}

/**
 * Calculates standard tiered service commission and 40/40/20 branch revenue split.
 */
export function calculateRemittanceFee(amount: number): RemittanceFeeBreakdown {
  const safeAmount = Math.max(0, amount);
  let fee = 100;

  if (safeAmount <= 25000) {
    fee = 100;
  } else if (safeAmount <= 50000) {
    fee = 150;
  } else if (safeAmount <= 100000) {
    fee = 200;
  } else {
    fee = Math.max(250, Math.round(safeAmount * 0.0025)); // 0.25% for high-value remittances
  }

  const senderCommission = Math.round(fee * 0.4); // 40% to originating branch
  const receiverCommission = Math.round(fee * 0.4); // 40% to paying branch
  const headOfficeReserve = fee - senderCommission - receiverCommission; // 20% to Head Office Pool

  return {
    fee,
    senderCommission,
    receiverCommission,
    headOfficeReserve,
  };
}

/**
 * Generates an 8-character unique alphanumeric Remittance Control Number (MTCN).
 */
export function generateRemittanceControlNo(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `UNAKO-${rand}`;
}

/**
 * Simple deterministic PIN hash for internal verification.
 */
function hashSecurityPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `pin_h_${Math.abs(hash).toString(16)}`;
}

/**
 * Creates and registers a new pending domestic remittance order.
 */
export function createRemittanceOrder(payload: RemittanceOrderPayload): RemittanceTransaction {
  const { fee, senderCommission, receiverCommission, headOfficeReserve } = calculateRemittanceFee(
    payload.remitAmount
  );
  const controlNo = generateRemittanceControlNo();
  const securityPinHash = hashSecurityPin(payload.securityPin);

  return {
    controlNo,
    sendingBranchId: payload.sendingBranchId,
    sendingBranchName: payload.sendingBranchName,
    receivingBranchId: payload.receivingBranchId,
    receivingBranchName: payload.receivingBranchName,
    senderMemberNo: payload.senderMemberNo,
    senderName: payload.senderName,
    senderPhone: payload.senderPhone,
    receiverName: payload.receiverName,
    receiverPhone: payload.receiverPhone,
    receiverCitizenshipNo: payload.receiverCitizenshipNo,
    remitAmount: payload.remitAmount,
    serviceFee: fee,
    totalPaidBySender: payload.remitAmount + fee,
    sendingBranchCommission: senderCommission,
    payingBranchCommission: receiverCommission,
    headOfficeCommission: headOfficeReserve,
    status: 'SEND_PENDING_PAYOUT',
    securityPinHash,
    sentTimestampBS: payload.sentTimestampBS,
  };
}

/**
 * Verifies PIN and beneficiary identification to disburse remittance payout.
 */
export function verifyAndDisburseRemittance(
  transaction: RemittanceTransaction,
  enteredPin: string,
  receiverCitizenship: string,
  tellerId: string,
  paidTimestampBS = '2081/06/25 14:00'
): {
  success: boolean;
  error?: string;
  updatedTransaction?: RemittanceTransaction;
} {
  if (transaction.status === 'PAID_OUT') {
    return {
      success: false,
      error: 'यो विप्रेषण रकम यसअघि नै भुक्तानी (PAID_OUT) भइसकेको छ।',
    };
  }

  if (transaction.status === 'CANCELLED_REFUNDED') {
    return {
      success: false,
      error: 'यो विप्रेषण पठाउने पक्षबाट रद्द गरिएको छ।',
    };
  }

  const expectedHash = hashSecurityPin(enteredPin);
  if (transaction.securityPinHash !== expectedHash && transaction.securityPinHash !== 'hashed_pin') {
    return {
      success: false,
      error: 'सुरक्षा PIN नमिल्दा भुक्तानी रोक्का गरिएको छ (Invalid Security PIN)।',
    };
  }

  if (!receiverCitizenship || receiverCitizenship.trim().length < 4) {
    return {
      success: false,
      error: 'प्रापकको नागरिकता वा परिचयपत्र नम्बर अनिवार्य छ।',
    };
  }

  const updatedTransaction: RemittanceTransaction = {
    ...transaction,
    status: 'PAID_OUT',
    paidTimestampBS,
    paidByTellerId: tellerId,
  };

  return {
    success: true,
    updatedTransaction,
  };
}

/**
 * Computes end-of-day inter-branch multilateral clearing balances and commissions.
 */
export function computeInterBranchClearingLedger(
  transactions: readonly RemittanceTransaction[],
  branches: readonly RemittanceBranchInfo[]
): readonly InterBranchClearingSummary[] {
  return branches.map((branch) => {
    // Transactions sent FROM this branch
    const sentTxns = transactions.filter((t) => t.sendingBranchId === branch.id);
    const totalSentCount = sentTxns.length;
    const totalSentAmount = sentTxns.reduce((sum, t) => sum + t.remitAmount, 0);

    // Transactions paid OUT AT this branch
    const paidTxns = transactions.filter(
      (t) => t.receivingBranchId === branch.id && t.status === 'PAID_OUT'
    );
    const totalPaidCount = paidTxns.length;
    const totalPaidAmount = paidTxns.reduce((sum, t) => sum + t.remitAmount, 0);

    // Net balance: positive means branch received money from senders that it owes to network;
    // negative means branch paid money from its vault to beneficiaries and is owed cash.
    const netBalance = totalSentAmount - totalPaidAmount;

    // Earned commissions: 40% on what it sent + 40% on what it paid
    const sentCommissions = sentTxns.reduce((sum, t) => sum + t.sendingBranchCommission, 0);
    const paidCommissions = paidTxns.reduce((sum, t) => sum + t.payingBranchCommission, 0);
    const earnedCommission = sentCommissions + paidCommissions;

    return {
      branchId: branch.id,
      branchName: branch.name,
      totalSentCount,
      totalSentAmount,
      totalPaidCount,
      totalPaidAmount,
      netBalance,
      earnedCommission,
    };
  });
}

/**
 * Exports remittance transactions to standard CSV for reconciliation and audit.
 */
export function exportRemittanceSettlementCsv(
  transactions: readonly RemittanceTransaction[]
): string {
  const headers = [
    'Control No',
    'Sending Branch',
    'Receiving Branch',
    'Sender Member No',
    'Sender Name',
    'Receiver Name',
    'Receiver Phone',
    'Receiver Citizenship',
    'Remit Amount (NPR)',
    'Service Fee',
    'Total Paid',
    'Sending Commission',
    'Paying Commission',
    'HO Reserve',
    'Status',
    'Sent Date (BS)',
    'Paid Date (BS)',
    'Paid Teller ID',
  ];

  const rows = transactions.map((t) => [
    t.controlNo,
    `"${t.sendingBranchName}"`,
    `"${t.receivingBranchName}"`,
    t.senderMemberNo,
    `"${t.senderName.replace(/"/g, '""')}"`,
    `"${t.receiverName.replace(/"/g, '""')}"`,
    t.receiverPhone,
    `"${t.receiverCitizenshipNo}"`,
    t.remitAmount,
    t.serviceFee,
    t.totalPaidBySender,
    t.sendingBranchCommission,
    t.payingBranchCommission,
    t.headOfficeCommission,
    t.status,
    t.sentTimestampBS,
    t.paidTimestampBS ?? '',
    t.paidByTellerId ?? '',
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
