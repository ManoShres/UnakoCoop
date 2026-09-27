/**
 * Cooperative Cheque Management, Inward/Outward Clearing & Dishonour Engine
 * (सहकारी चेक व्यवस्थापन, इनवार्ड/आउटवार्ड क्लियरिङ तथा चेक अनादर/रोक्का प्रणाली)
 *
 * Implements regulatory cheque standards pursuant to:
 * - Negotiable Instruments Act 2034 (विनिमय पत्र ऐन २०३४)
 * - Banking Offences and Punishment Act 2064 (बैंकिङ कसूर तथा सजाय ऐन २०६४)
 * - Nepal Cooperative Act 2074 & Department of Cooperatives Directives
 * - Standard SACCOS Clearing & Settlement Protocols (COPAS Account Clearings)
 */

export type ChequeLeafStatus =
  | 'UNUSED'        // प्रयोग नभएको (Fresh in booklet)
  | 'PRESENTED'     // काउन्टरमा पेश भएको
  | 'CLEARED'       // भुक्तानी सम्पन्न
  | 'STOP_PAYMENT'  // भुक्तानी रोक्का गरिएको
  | 'BOUNCED'       // चेक अनादर (अपर्याप्त मौज्दात वा हस्ताक्षर नमिलेको)
  | 'CANCELLED';    // रद्द गरिएको

export type ChequeClearingType =
  | 'COUNTER_WITHDRAWAL' // काउन्टर नगद भुक्तानी (Member Cash Withdrawal)
  | 'INWARD_CLEARING'    // इनवार्ड क्लियरिङ (Other BFI presenting on Unako SACCOS)
  | 'OUTWARD_CLEARING';  // आउटवार्ड क्लियरिङ (Unako SACCOS presenting bank cheque)

export type StopPaymentReason =
  | 'LOST_OR_STOLEN'        // चेक हराएको वा चोरी भएको
  | 'SIGNATURE_DISPUTE'     // हस्ताक्षर शंकास्पद
  | 'FRAUD_PREVENTION'      // सम्भावित जालसाजी रोकथाम
  | 'LEGAL_FREEZE'          // अदालत वा सरकारी निकायको रोक्का आदेश
  | 'MEMBER_REQUEST';       // सदस्यको लिखित अनुरोध

export interface ChequeBookRecord {
  id: string;
  accountNo: string;
  memberId: string;
  memberNo: string;
  memberName: string;
  startLeafNo: number;
  endLeafNo: number;
  totalLeaves: number;
  issuedDateBs: string;
  issuedDateAd: string;
  issuedByStaffName: string;
  branch: string;
  status: 'ACTIVE' | 'EXHAUSTED' | 'BLOCKED';
}

export interface ChequeTransactionRecord {
  id: string;
  chequeNo: string;
  accountNo: string;
  memberId: string;
  memberNo: string;
  memberName: string;
  payeeName: string;
  amount: number;
  chequeDateBs: string;
  presentedDateBs: string;
  clearingType: ChequeClearingType;
  status: ChequeLeafStatus;
  isAccountPayee: boolean;
  stopReason?: StopPaymentReason;
  bounceReason?: string;
  bounceCount: number; // 1, 2, 3 (triggers CIB reporting)
  clearedByStaffName?: string;
  clearedAt?: string;
  voucherNo?: string;
  remarks?: string;
}

export interface ChequeValidationResult {
  isValid: boolean;
  canClear: boolean;
  isStale: boolean; // > 180 days
  isPostDated: boolean; // date in future
  hasInsufficientFunds: boolean;
  errors: string[];
  warnings: string[];
  recommendedAction: 'CLEAR' | 'REJECT_STALE' | 'REJECT_POST_DATED' | 'BOUNCE_INSUFFICIENT' | 'REJECT_STOPPED';
}

export interface ChequeCopasVoucher {
  voucherNo: string;
  fiscalYear: string;
  dateBs: string;
  narrationNe: string;
  narrationEn: string;
  entries: {
    glCode: string;
    accountNameNe: string;
    accountNameEn: string;
    debitAmount: number;
    creditAmount: number;
  }[];
  totalDebit: number;
  totalCredit: number;
}

/**
 * Initial Mock Cheque Books (Reflecting Unako SACCOS, Gadhawa Dang)
 */
export const INITIAL_CHEQUE_BOOKS: ChequeBookRecord[] = [
  {
    id: 'cb-101',
    accountNo: 'SAV-00101-01',
    memberId: 'm-101',
    memberNo: 'MBR-00101',
    memberName: 'राम बहादुर श्रेष्ठ',
    startLeafNo: 42101,
    endLeafNo: 42125,
    totalLeaves: 25,
    issuedDateBs: '2081-02-15',
    issuedDateAd: '2024-05-28',
    issuedByStaffName: 'सन्तोष यादव (Teller)',
    branch: 'गढवा मुख्य शाखा (Gadhawa Main)',
    status: 'ACTIVE',
  },
  {
    id: 'cb-102',
    accountNo: 'SAV-00102-01',
    memberId: 'm-102',
    memberNo: 'MBR-00102',
    memberName: 'सुनिता कुमारी चौधरी',
    startLeafNo: 58901,
    endLeafNo: 58925,
    totalLeaves: 25,
    issuedDateBs: '2081-03-01',
    issuedDateAd: '2024-06-14',
    issuedByStaffName: 'सन्तोष यादव (Teller)',
    branch: 'गढवा मुख्य शाखा (Gadhawa Main)',
    status: 'ACTIVE',
  },
  {
    id: 'cb-103',
    accountNo: 'SAV-00105-01',
    memberId: 'm-105',
    memberNo: 'MBR-00105',
    memberName: 'अमित कुमार यादव',
    startLeafNo: 61201,
    endLeafNo: 61210,
    totalLeaves: 10,
    issuedDateBs: '2081-04-10',
    issuedDateAd: '2024-07-25',
    issuedByStaffName: 'अनिता चौधरी (Teller)',
    branch: 'गोबरडिहा सेवा केन्द्र (Gobardiha)',
    status: 'ACTIVE',
  },
];

/**
 * Initial Mock Cheque Clearing Transactions
 */
export const INITIAL_CHEQUE_TRANSACTIONS: ChequeTransactionRecord[] = [
  {
    id: 'tx-cq-001',
    chequeNo: '042101',
    accountNo: 'SAV-00101-01',
    memberId: 'm-101',
    memberNo: 'MBR-00101',
    memberName: 'राम बहादुर श्रेष्ठ',
    payeeName: 'कृष्ण खड्का',
    amount: 35000,
    chequeDateBs: '2081-05-10',
    presentedDateBs: '2081-05-12',
    clearingType: 'COUNTER_WITHDRAWAL',
    status: 'CLEARED',
    isAccountPayee: false,
    bounceCount: 0,
    clearedByStaffName: 'सन्तोष यादव',
    clearedAt: '2026-08-27T10:15:00Z',
    voucherNo: 'CQ-VCH-810512',
    remarks: 'काउन्टरबाट नगद भुक्तानी सम्पन्न।',
  },
  {
    id: 'tx-cq-002',
    chequeNo: '042102',
    accountNo: 'SAV-00101-01',
    memberId: 'm-101',
    memberNo: 'MBR-00101',
    memberName: 'राम बहादुर श्रेष्ठ',
    payeeName: 'गंगा ट्रेडर्स गढवा',
    amount: 150000,
    chequeDateBs: '2081-05-20',
    presentedDateBs: '2081-05-22',
    clearingType: 'INWARD_CLEARING',
    status: 'BOUNCED',
    isAccountPayee: true,
    bounceReason: 'अपर्याप्त मौज्दात (Insufficient Funds in Savings Account)',
    bounceCount: 1,
    voucherNo: 'CQ-BNC-810522',
    remarks: 'खातामा मौज्दात अपुग भएकाले प्रथम पटक चेक अनादर पत्र जारी।',
  },
  {
    id: 'tx-cq-003',
    chequeNo: '058905',
    accountNo: 'SAV-00102-01',
    memberId: 'm-102',
    memberNo: 'MBR-00102',
    memberName: 'सुनिता कुमारी चौधरी',
    payeeName: 'दाङ निर्माण सामग्री सप्लायर्स',
    amount: 75000,
    chequeDateBs: '2081-06-01',
    presentedDateBs: '2081-06-02',
    clearingType: 'COUNTER_WITHDRAWAL',
    status: 'STOP_PAYMENT',
    isAccountPayee: true,
    stopReason: 'LOST_OR_STOLEN',
    bounceCount: 0,
    remarks: 'चेक हराएको भनी सदस्यको लिखित निवेदन अनुसार भुक्तानी रोक्का।',
  },
];

/**
 * Validates a Cheque for Clearing Presentation
 */
export function validateChequePresentation(params: {
  chequeNo: string;
  amount: number;
  chequeDateBs: string;
  presentedDateBs: string;
  accountBalance: number;
  chequeStatus?: ChequeLeafStatus;
  stopReason?: StopPaymentReason;
}): ChequeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!params.chequeNo || !params.chequeNo.trim()) {
    errors.push('चेक नम्बर अनिवार्य छ (Cheque number is required).');
  }
  if (!params.amount || params.amount <= 0) {
    errors.push('चेक रकम शून्य भन्दा बढी हुनुपर्छ (Cheque amount must be greater than zero).');
  }

  // Check Stop Payment status
  if (params.chequeStatus === 'STOP_PAYMENT') {
    errors.push(
      `यो चेक नं. ${params.chequeNo} भुक्तानी रोक्का (STOP-PAYMENT) गरिएको छ: ${params.stopReason || 'सदस्य अनुरोध'}`
    );
    return {
      isValid: false,
      canClear: false,
      isStale: false,
      isPostDated: false,
      hasInsufficientFunds: false,
      errors,
      warnings,
      recommendedAction: 'REJECT_STOPPED',
    };
  }

  // Already Cleared check
  if (params.chequeStatus === 'CLEARED') {
    errors.push(`चेक नं. ${params.chequeNo} पहिले नै भुक्तानी (CLEARED) भइसकेको छ।`);
    return {
      isValid: false,
      canClear: false,
      isStale: false,
      isPostDated: false,
      hasInsufficientFunds: false,
      errors,
      warnings,
      recommendedAction: 'REJECT_STOPPED',
    };
  }

  // Date Check (Staleness / Post-dated check)
  const isPostDated = params.chequeDateBs > params.presentedDateBs;
  if (isPostDated) {
    errors.push(`यो पोस्ट-डेटेड चेक (PDC) हो। मिति ${params.chequeDateBs} अगावै भुक्तानी गर्न मिल्दैन।`);
  }

  // Staleness check (Cooperative & Negotiable Instruments Act: 180 days / 6 months)
  // Approximate standard BS difference (e.g. > 6 months in format YYYY-MM-DD)
  const isStale = isChequeDateStale(params.chequeDateBs, params.presentedDateBs);
  if (isStale) {
    errors.push(`यो चेक जारी मितिबाट ६ महिना (१८० दिन) नाघिसकेको पुरानो (STALE) भएकाले भुक्तानी अमान्य छ।`);
  }

  // Insufficient Funds check
  const hasInsufficientFunds = params.accountBalance < params.amount;
  if (hasInsufficientFunds) {
    errors.push(
      `खातामा अपर्याप्त मौज्दात (उपलब्ध: रु. ${params.accountBalance.toLocaleString()}, माग: रु. ${params.amount.toLocaleString()})`
    );
  }

  let recommendedAction: ChequeValidationResult['recommendedAction'] = 'CLEAR';
  if (isStale) {
    recommendedAction = 'REJECT_STALE';
  } else if (isPostDated) {
    recommendedAction = 'REJECT_POST_DATED';
  } else if (hasInsufficientFunds) {
    recommendedAction = 'BOUNCE_INSUFFICIENT';
  }

  const isValid = errors.length === 0;
  const canClear = isValid && !hasInsufficientFunds && !isStale && !isPostDated;

  return {
    isValid,
    canClear,
    isStale,
    isPostDated,
    hasInsufficientFunds,
    errors,
    warnings,
    recommendedAction,
  };
}

/**
 * Checks if a cheque is older than 6 months (180 days)
 */
function isChequeDateStale(chequeDate: string, presentDate: string): boolean {
  if (!chequeDate || !presentDate) return false;
  const [cYear, cMonth, cDay] = chequeDate.split('-').map(Number);
  const [pYear, pMonth, pDay] = presentDate.split('-').map(Number);

  if (!cYear || !pYear) return false;

  const totalMonthsDiff = (pYear - cYear) * 12 + (pMonth - cMonth);
  if (totalMonthsDiff > 6) return true;
  if (totalMonthsDiff === 6 && pDay > cDay) return true;
  return false;
}

/**
 * Issues a new Cheque Book to a member
 */
export function issueChequeBook(params: {
  accountNo: string;
  memberId: string;
  memberNo: string;
  memberName: string;
  startLeafNo: number;
  totalLeaves: 10 | 25 | 50;
  issuedDateBs: string;
  issuedDateAd: string;
  issuedByStaffName: string;
  branch: string;
}): ChequeBookRecord {
  const endLeafNo = params.startLeafNo + params.totalLeaves - 1;
  return {
    id: `cb-${Date.now()}`,
    accountNo: params.accountNo,
    memberId: params.memberId,
    memberNo: params.memberNo,
    memberName: params.memberName,
    startLeafNo: params.startLeafNo,
    endLeafNo,
    totalLeaves: params.totalLeaves,
    issuedDateBs: params.issuedDateBs,
    issuedDateAd: params.issuedDateAd,
    issuedByStaffName: params.issuedByStaffName,
    branch: params.branch,
    status: 'ACTIVE',
  };
}

/**
 * Records a Cheque Dishonour / Bounce under Negotiable Instruments Act 2034
 */
export function processChequeBounce(
  cheque: ChequeTransactionRecord,
  bounceReason: string
): {
  updatedCheque: ChequeTransactionRecord;
  penaltyFee: number;
  legalNoticeNe: string;
  isBlacklistWarningTriggered: boolean;
} {
  const newBounceCount = cheque.bounceCount + 1;
  const penaltyFee = 350; // Standard Cooperative Dishonour Penalty
  const isBlacklistWarningTriggered = newBounceCount >= 3;

  const updatedCheque: ChequeTransactionRecord = {
    ...cheque,
    status: 'BOUNCED',
    bounceReason,
    bounceCount: newBounceCount,
    voucherNo: `CQ-BNC-${Date.now().toString().slice(-6)}`,
  };

  let legalNoticeNe = '';
  if (newBounceCount === 1) {
    legalNoticeNe = `चेक नं. ${cheque.chequeNo} (रकम रु. ${cheque.amount.toLocaleString()}) अपर्याप्त मौज्दातका कारण प्रथम पटक अनादर भएको जानकारी गराइन्छ। कृपया ३ कार्यदिनभित्र मौज्दात व्यवस्थापन गर्नुहोस्।`;
  } else if (newBounceCount === 2) {
    legalNoticeNe = `चेक नं. ${cheque.chequeNo} दोस्रो पटक अनादर भएको छ। विनिमय पत्र ऐन २०३४ बमोजिम चेक वाहकले कानुनी कारबाही अगाडि बढाउन सक्नेछ।`;
  } else {
    legalNoticeNe = `चेक नं. ${cheque.chequeNo} तेस्रो पटक अनादर भएको हुँदा बैंकिङ कसूर तथा सजाय ऐन २०६४ र सहकारी मापदण्ड अनुसार ७ दिने अन्तिम म्याद जारी गरिएको छ। अन्यथा कर्जा सूचना केन्द्र (CIB) को कालोसूचीमा सिफारिस गरिनेछ।`;
  }

  return {
    updatedCheque,
    penaltyFee,
    legalNoticeNe,
    isBlacklistWarningTriggered,
  };
}

/**
 * Generates COPAS Double-Entry Voucher for Cleared Cheque
 */
export function generateChequeCopasVoucher(
  cheque: ChequeTransactionRecord,
  fiscalYear: string = '2081/82'
): ChequeCopasVoucher {
  const voucherNo = cheque.voucherNo || `VCH-CQ-${Date.now().toString().slice(-6)}`;
  const dateBs = cheque.presentedDateBs || '2081-06-05';

  const entries: ChequeCopasVoucher['entries'] = [
    {
      glCode: '2101',
      accountNameNe: `सदस्य बचत खाता (हिसाब नं. ${cheque.accountNo})`,
      accountNameEn: `Member Savings Account (${cheque.accountNo})`,
      debitAmount: cheque.amount,
      creditAmount: 0,
    },
  ];

  if (cheque.clearingType === 'COUNTER_WITHDRAWAL') {
    entries.push({
      glCode: '1101',
      accountNameNe: 'मुख्य ढुकुटी नगद मौज्दात (Counter Cash Vault)',
      accountNameEn: 'Cash in Vault Account',
      debitAmount: 0,
      creditAmount: cheque.amount,
    });
  } else if (cheque.clearingType === 'INWARD_CLEARING') {
    entries.push({
      glCode: '1104',
      accountNameNe: 'अन्तर-बैंक तथा क्लियरिङ हिसाब (Inter-Bank Clearing)',
      accountNameEn: 'Inter-Bank Cheque Clearing Account',
      debitAmount: 0,
      creditAmount: cheque.amount,
    });
  } else {
    entries.push({
      glCode: '1102',
      accountNameNe: 'बैंक मौज्दात (वाणिज्य बैंक क्लियरिङ)',
      accountNameEn: 'Commercial Bank Clearing Account',
      debitAmount: 0,
      creditAmount: cheque.amount,
    });
  }

  const totalDebit = entries.reduce((s, e) => s + e.debitAmount, 0);
  const totalCredit = entries.reduce((s, e) => s + e.creditAmount, 0);

  const narrationNe = `चेक नं. ${cheque.chequeNo} मार्फत सदस्य ${cheque.memberName} को खाताबाट ${cheque.payeeName} लाई भुक्तानी।`;
  const narrationEn = `Payment to ${cheque.payeeName} via cheque ${cheque.chequeNo} from account ${cheque.accountNo}.`;

  return {
    voucherNo,
    fiscalYear,
    dateBs,
    narrationNe,
    narrationEn,
    entries,
    totalDebit,
    totalCredit,
  };
}

/**
 * Exports Cheque Clearing Transactions to CSV
 */
export function exportChequeClearingToCsv(transactions: ChequeTransactionRecord[]): string {
  const headers = [
    'चेक नं. (Cheque No)',
    'खाता नं. (Account No)',
    'सदस्यको नाम (Member Name)',
    'भुक्तानी पाउने (Payee Name)',
    'रकम (Amount NPR)',
    'चेक मिति (Cheque Date)',
    'पेश मिति (Presented Date)',
    'प्रकार (Clearing Type)',
    'स्थिति (Status)',
    'अनादर संख्या (Bounce Count)',
    'भौचर नं. (Voucher No)',
    'कैफियत (Remarks)',
  ];

  const rows = transactions.map((t) => [
    `"${t.chequeNo}"`,
    `"${t.accountNo}"`,
    `"${t.memberName}"`,
    `"${t.payeeName}"`,
    t.amount,
    `"${t.chequeDateBs}"`,
    `"${t.presentedDateBs}"`,
    `"${t.clearingType}"`,
    `"${t.status}"`,
    t.bounceCount,
    `"${t.voucherNo || '-'}"`,
    `"${t.remarks || t.bounceReason || t.stopReason || '-'}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
