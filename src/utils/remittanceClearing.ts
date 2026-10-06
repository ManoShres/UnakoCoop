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
 * Security PIN hashing for remittance payout authorisation.
 *
 * The previous implementation was an UNSALTED 32-bit DJB2 hash (`pin_h_<hex>`), which is
 * trivially reversible/brute-forceable and allowed the literal sentinel `hashed_pin` to be
 * accepted as a valid stored hash.
 *
 * Format persisted: `pinh2$<iterations>$<salt>$<digest>` (per-record random salt, iterated mix).
 *
 * NEEDS SIGN-OFF: this is a synchronous client-side KDF — WebCrypto PBKDF2/scrypt is
 * async and cannot be used in this synchronous API. It is strictly stronger than the old
 * hash but is NOT a substitute for server-side verification with a secret-keyed KDF
 * (Argon2id / scrypt / bcrypt) held outside the bundle. Legacy `pin_h_*` and unknown
 * formats FAIL CLOSED (never authorised). PIN hashes must never be shipped in the client
 * bundle — records belong server-side behind a verification endpoint.
 * TODO(security): migrate verification to the server remittance payout API.
 */
export const PIN_HASH_ITERATIONS = 5000;
export const PIN_HASH_PREFIX = 'pinh2';

/** Cryptographically-random per-record salt (16 bytes hex). */
export function generatePinSalt(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  const cryptoObj = typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    cryptoObj.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i += 1) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Iterated mixing over a salted seed (FNV-1a based, 64-bit output). */
function mixIterated(seed: string, rounds: number): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let round = 0; round < rounds; round += 1) {
    for (let i = 0; i < seed.length; i += 1) {
      const c = seed.charCodeAt(i) + round;
      h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ c, 0x85ebca6b) >>> 0;
    }
  }
  return (
    (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0')
  );
}

/**
 * Salted, iterated PIN hash. A fresh salt is generated per record unless one is supplied.
 * Exported so callers/tests can produce verifiable fixtures without a plaintext PIN store.
 */
export function hashSecurityPin(
  pin: string,
  salt: string = generatePinSalt(),
  iterations: number = PIN_HASH_ITERATIONS
): string {
  const digest = mixIterated(`${salt}:${pin}:${iterations}`, iterations);
  return `${PIN_HASH_PREFIX}$${iterations}$${salt}$${digest}`;
}

/** Constant-time string comparison (length differences are not secret here). */
function timingSafeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Verify an entered PIN against a stored hash. Exact, constant-time comparison against the
 * salted iterated hash. Unknown or legacy formats (including the removed `hashed_pin`
 * sentinel) fail closed.
 */
export function verifySecurityPin(storedHash: string, enteredPin: string): boolean {
  if (!storedHash || typeof storedHash !== 'string' || !enteredPin) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== PIN_HASH_PREFIX) return false;
  const iterations = Number(parts[1]);
  const salt = parts[2];
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > 10_000_000 || !salt) {
    return false;
  }
  const expected = hashSecurityPin(enteredPin, salt, iterations);
  return timingSafeEquals(expected, storedHash);
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

  // Exact, constant-time verification against the salted iterated hash. The previous
  // `|| securityPinHash !== 'hashed_pin'` sentinel accepted a literal demo string as a
  // valid hash, so ANY PIN authorised a payout. Unknown formats now fail closed.
  if (!verifySecurityPin(transaction.securityPinHash, enteredPin)) {
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
