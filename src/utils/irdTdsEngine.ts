/**
 * Unako SACCOS - Statutory IRD e-TDS Return & Tax Deduction Engine
 * (नेपाल सरकार आन्तरिक राजस्व विभाग - ई-टिडीएस विवरण तथा कर कट्टी दाखिला प्रणाली)
 *
 * Governing Laws:
 * - Nepal Income Tax Act 2058 (आयकर ऐन २०५८)
 *   - Section 87: Employment Income TDS (पारिश्रमिक कर कट्टी)
 *   - Section 88(1): Interest on Savings & Fixed Deposits (5% Individual, 15% Corporate)
 *   - Section 88(2): Dividend Distribution TDS (5% Final Withholding)
 *   - Section 88(1): House Rent (10%) & Consultancy / Professional Fees (1.5% with VAT, 15% without)
 *   - Section 89: Contract Payments above Rs 50,000 (1.5%)
 *   - Section 117, 119 & 120: Mandatory filing by 25th of following month & late filing fees.
 */

export type TdsSectionCode = 'SEC_87' | 'SEC_88_INTEREST' | 'SEC_88_DIVIDEND' | 'SEC_88_RENT' | 'SEC_88_SERVICE' | 'SEC_89_CONTRACT';

export type RevenueHeadCode = '11111' | '11112' | '11113';

export type TdsDepositStatus = 'WITHHELD' | 'DEPOSITED' | 'FILED_IRD' | 'AMENDED';

export interface TdsTransactionRecord {
  readonly id: string;
  readonly transactionDateBS: string; // YYYY/MM/DD
  readonly fiscalYear: string;         // e.g. "2081/82"
  readonly monthBS: string;             // e.g. "श्रावण", "भाद्र", etc.
  readonly sectionCode: TdsSectionCode;
  readonly sectionLabel: string;
  readonly sectionLabelNepali: string;
  readonly revenueHead: RevenueHeadCode;
  readonly deducteeType: 'INDIVIDUAL' | 'ENTITY';
  readonly deducteePan: string;         // 9 digits or "N/A"
  readonly deducteeName: string;
  readonly deducteeNameNepali?: string;
  readonly deducteeMemberId?: string;
  readonly grossPaymentAmount: number;
  readonly tdsRatePercent: number;
  readonly tdsAmount: number;
  readonly netPaidAmount: number;
  readonly bankDepositVoucherNo?: string;
  readonly treasuryBankName?: string;
  readonly depositDateBS?: string;
  readonly status: TdsDepositStatus;
  readonly remarks?: string;
}

export interface CoopTaxWithholderInfo {
  readonly cooperativeName: string;
  readonly cooperativeNameNepali: string;
  readonly panNumber: string; // 9 digits
  readonly address: string;
  readonly addressNepali: string;
  readonly irdOfficeName: string;
  readonly irdOfficeCode: string; // e.g. "IRO-Dang-401"
}

export interface TdsSummaryBySection {
  readonly sectionCode: TdsSectionCode;
  readonly sectionLabel: string;
  readonly sectionLabelNepali: string;
  readonly revenueHead: RevenueHeadCode;
  readonly transactionCount: number;
  readonly totalGrossAmount: number;
  readonly totalTdsAmount: number;
  readonly totalNetPaid: number;
  readonly depositedAmount: number;
  readonly pendingDepositAmount: number;
}

export interface MonthlyIrdFilingStatus {
  readonly fiscalYear: string;
  readonly monthBS: string;
  readonly dueDateBS: string; // Typically 25th of following month
  readonly totalTdsWithheld: number;
  readonly totalTdsDeposited: number;
  readonly isFullyDeposited: boolean;
  readonly isOverdue: boolean;
  readonly daysDelayed: number;
  readonly estimatedLateFee: number;
}

export interface TdsCertificateData {
  readonly certificateNo: string;
  readonly issueDateBS: string;
  readonly withholder: CoopTaxWithholderInfo;
  readonly deductee: {
    readonly pan: string;
    readonly name: string;
    readonly address?: string;
    readonly memberId?: string;
  };
  readonly fiscalYear: string;
  readonly records: readonly TdsTransactionRecord[];
  readonly totalGrossAmount: number;
  readonly totalTdsDeducted: number;
  readonly totalTdsDeposited: number;
  readonly verificationHash: string;
}

export const DEFAULT_UNAKO_TAX_INFO: CoopTaxWithholderInfo = {
  cooperativeName: 'Unako Saving and Credit Cooperative Society Ltd.',
  cooperativeNameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
  panNumber: '302948123',
  address: 'Gadhwa-5, Dang, Lumbini Province, Nepal',
  addressNepali: 'गढवा गाउँपालिका वडा नं. ५, दाङ, लुम्बिनी प्रदेश',
  irdOfficeName: 'आन्तरिक राजस्व कार्यालय, तुलसीपुर दाङ (IRO Tulsipur)',
  irdOfficeCode: 'IRO-TLS-401',
};

/**
 * Standard TDS Rates defined under Nepal Income Tax Act 2058
 */
export function getStandardTdsRate(
  section: TdsSectionCode,
  deducteeType: 'INDIVIDUAL' | 'ENTITY' = 'INDIVIDUAL',
  hasVatInvoice: boolean = true
): number {
  switch (section) {
    case 'SEC_87':
      // Progressive payroll tax (base deduction average or slab)
      return 1.0;
    case 'SEC_88_INTEREST':
      // 5% for individuals, 15% for entities
      return deducteeType === 'INDIVIDUAL' ? 5.0 : 15.0;
    case 'SEC_88_DIVIDEND':
      // 5% final withholding tax on cash dividends
      return 5.0;
    case 'SEC_88_RENT':
      // 10% rent TDS (local or IRD)
      return 10.0;
    case 'SEC_88_SERVICE':
      // 1.5% with VAT registered invoice, 15% without VAT invoice
      return hasVatInvoice ? 1.5 : 15.0;
    case 'SEC_89_CONTRACT':
      // 1.5% contract TDS on goods/works > 50,000
      return 1.5;
    default:
      return 5.0;
  }
}

/**
 * Map Section Code to Revenue Head (राजस्व शीर्षक)
 */
export function getRevenueHeadForSection(section: TdsSectionCode): RevenueHeadCode {
  switch (section) {
    case 'SEC_87':
      return '11111'; // Employment Income TDS
    case 'SEC_88_INTEREST':
    case 'SEC_88_DIVIDEND':
      return '11112'; // Investment / Interest & Dividend TDS
    case 'SEC_88_RENT':
    case 'SEC_88_SERVICE':
    case 'SEC_89_CONTRACT':
    default:
      return '11113'; // Business / Contract / Service TDS
  }
}

/**
 * Calculate TDS amount with precision rounding
 */
export function calculateTds(
  grossAmount: number,
  ratePercent: number
): { grossAmount: number; tdsRate: number; tdsAmount: number; netAmount: number } {
  if (grossAmount <= 0 || ratePercent <= 0) {
    return { grossAmount: Math.max(0, grossAmount), tdsRate: 0, tdsAmount: 0, netAmount: Math.max(0, grossAmount) };
  }
  const tdsAmount = Math.round((grossAmount * (ratePercent / 100)) * 100) / 100;
  const netAmount = Math.round((grossAmount - tdsAmount) * 100) / 100;
  return {
    grossAmount,
    tdsRate: ratePercent,
    tdsAmount,
    netAmount,
  };
}

/**
 * Aggregate TDS records by statutory section
 */
export function aggregateTdsBySection(
  records: readonly TdsTransactionRecord[]
): readonly TdsSummaryBySection[] {
  const map = new Map<TdsSectionCode, {
    count: number;
    gross: number;
    tds: number;
    net: number;
    deposited: number;
    pending: number;
    label: string;
    labelNepali: string;
    revHead: RevenueHeadCode;
  }>();

  // Initialize all known sections
  const initialSections: readonly { code: TdsSectionCode; label: string; labelNepali: string; revHead: RevenueHeadCode }[] = [
    { code: 'SEC_87', label: 'Sec 87 - Employment Income TDS', labelNepali: 'दफा ८७ - पारिश्रमिक कर कट्टी', revHead: '11111' },
    { code: 'SEC_88_INTEREST', label: 'Sec 88(1) - Savings & FD Interest TDS', labelNepali: 'दफा ८८(१) - निक्षेप तथा बचतको ब्याज कर कट्टी', revHead: '11112' },
    { code: 'SEC_88_DIVIDEND', label: 'Sec 88(2) - Member Share Dividend TDS', labelNepali: 'दफा ८८(२) - सेयर लाभांश कर कट्टी', revHead: '11112' },
    { code: 'SEC_88_RENT', label: 'Sec 88(1) - House & Office Rent TDS', labelNepali: 'दफा ८८(१) - घरभाडा कर कट्टी', revHead: '11113' },
    { code: 'SEC_88_SERVICE', label: 'Sec 88(1) - Professional & Audit Service Fee TDS', labelNepali: 'दफा ८८(१) - लेखापरीक्षण तथा परामर्श सेवा कर कट्टी', revHead: '11113' },
    { code: 'SEC_89_CONTRACT', label: 'Sec 89 - Contract & Supply TDS', labelNepali: 'दफा ८९ - ठेक्का तथा आपूर्ति कर कट्टी', revHead: '11113' },
  ];

  initialSections.forEach((s) => {
    map.set(s.code, {
      count: 0,
      gross: 0,
      tds: 0,
      net: 0,
      deposited: 0,
      pending: 0,
      label: s.label,
      labelNepali: s.labelNepali,
      revHead: s.revHead,
    });
  });

  records.forEach((rec) => {
    const existing = map.get(rec.sectionCode);
    if (existing) {
      const isDeposited = rec.status === 'DEPOSITED' || rec.status === 'FILED_IRD';
      existing.count += 1;
      existing.gross += rec.grossPaymentAmount;
      existing.tds += rec.tdsAmount;
      existing.net += rec.netPaidAmount;
      if (isDeposited) {
        existing.deposited += rec.tdsAmount;
      } else {
        existing.pending += rec.tdsAmount;
      }
    }
  });

  return Array.from(map.entries()).map(([code, val]) => ({
    sectionCode: code,
    sectionLabel: val.label,
    sectionLabelNepali: val.labelNepali,
    revenueHead: val.revHead,
    transactionCount: val.count,
    totalGrossAmount: Math.round(val.gross * 100) / 100,
    totalTdsAmount: Math.round(val.tds * 100) / 100,
    totalNetPaid: Math.round(val.net * 100) / 100,
    depositedAmount: Math.round(val.deposited * 100) / 100,
    pendingDepositAmount: Math.round(val.pending * 100) / 100,
  }));
}

/**
 * Validate PAN format (9 numeric digits for Nepal IRD PAN)
 */
export function isValidNepalPan(pan: string): boolean {
  if (!pan) return false;
  const trimmed = pan.trim();
  return /^[1-9]\d{8}$/.test(trimmed);
}

/**
 * Generate standard IRD e-TDS Text file (Tab-delimited format accepted by IRD portal)
 * Columns:
 * 1. Withholder PAN
 * 2. Deductee PAN
 * 3. Deductee Name
 * 4. Section Code
 * 5. Payment Date (BS YYYY.MM.DD)
 * 6. Gross Amount
 * 7. TDS Rate
 * 8. TDS Amount
 * 9. Voucher No
 * 10. Revenue Head
 */
export function generateIrdETdsTextFile(
  records: readonly TdsTransactionRecord[],
  withholderPan: string = DEFAULT_UNAKO_TAX_INFO.panNumber
): string {
  const header = ['Withholder_PAN', 'Deductee_PAN', 'Deductee_Name', 'Section_Code', 'Payment_Date_BS', 'Gross_Amount', 'TDS_Rate', 'TDS_Amount', 'Deposit_Voucher_No', 'Revenue_Head'].join('\t');
  
  const rows = records.map((r) => {
    const formattedDate = r.transactionDateBS.replace(/\//g, '.');
    const cleanDeducteePan = isValidNepalPan(r.deducteePan) ? r.deducteePan.trim() : '000000000';
    const cleanDeducteeName = r.deducteeName.replace(/[\t\r\n]/g, ' ').trim();
    const voucher = r.bankDepositVoucherNo ? r.bankDepositVoucherNo.trim() : 'PENDING';
    return [
      withholderPan,
      cleanDeducteePan,
      cleanDeducteeName,
      r.sectionCode,
      formattedDate,
      r.grossPaymentAmount.toFixed(2),
      r.tdsRatePercent.toFixed(2),
      r.tdsAmount.toFixed(2),
      voucher,
      r.revenueHead,
    ].join('\t');
  });

  return [header, ...rows].join('\r\n');
}

/**
 * Generate standard e-TDS CSV file for audit and Excel review
 */
export function generateIrdETdsCsv(
  records: readonly TdsTransactionRecord[],
  withholderPan: string = DEFAULT_UNAKO_TAX_INFO.panNumber
): string {
  const header = [
    'क्र.सं. (S.N.)',
    'कर कट्टी गर्ने संस्थाको प्यान (Withholder PAN)',
    'भुक्तानी पाउनेको प्यान (Deductee PAN)',
    'भुक्तानी पाउनेको नाम (Deductee Name)',
    'सदस्य नं. (Member No)',
    'कानूनी दफा (Section)',
    'राजस्व शीर्षक (Revenue Head)',
    'भुक्तानी मिति वि.सं. (Date BS)',
    'कुल रकम रु. (Gross Amount)',
    'कर दर % (TDS Rate)',
    'कट्टी कर रु. (TDS Amount)',
    'खुद भुक्तानी रु. (Net Paid)',
    'दाखिला भौचर नं. (Voucher No)',
    'दाखिला भएको बैंक (Bank)',
    'स्थिति (Status)',
  ].map((h) => `"${h}"`).join(',');

  const rows = records.map((r, idx) => {
    return [
      idx + 1,
      `"${withholderPan}"`,
      `"${r.deducteePan}"`,
      `"${r.deducteeName.replace(/"/g, '""')}"`,
      `"${r.deducteeMemberId || '-'}"`,
      `"${r.sectionCode}"`,
      `"${r.revenueHead}"`,
      `"${r.transactionDateBS}"`,
      r.grossPaymentAmount.toFixed(2),
      r.tdsRatePercent.toFixed(2),
      r.tdsAmount.toFixed(2),
      r.netPaidAmount.toFixed(2),
      `"${r.bankDepositVoucherNo || '-'}"`,
      `"${r.treasuryBankName || '-'}"`,
      `"${r.status}"`,
    ].join(',');
  });

  return [header, ...rows].join('\r\n');
}

/**
 * Check Monthly Filing Compliance & Late Fee Penalty
 * Under Nepal Income Tax Act 2058 Sec 117 & 120:
 * Penalty for failure to furnish statement = higher of 0.1% p.a. or Rs 100/month.
 * Interest for failure to pay withheld tax on time (Sec 119) = 15% p.a.
 */
export function calculateFilingCompliance(
  monthBS: string,
  fiscalYear: string,
  records: readonly TdsTransactionRecord[]
): MonthlyIrdFilingStatus {
  const monthRecords = records.filter((r) => r.monthBS === monthBS && r.fiscalYear === fiscalYear);
  const totalWithheld = monthRecords.reduce((sum, r) => sum + r.tdsAmount, 0);
  const totalDeposited = monthRecords
    .filter((r) => r.status === 'DEPOSITED' || r.status === 'FILED_IRD')
    .reduce((sum, r) => sum + r.tdsAmount, 0);

  const isFullyDeposited = totalWithheld > 0 && totalDeposited >= totalWithheld;

  // Due date is by the 25th of the next month
  const dueDateBS = `${fiscalYear.split('/')[0]}-${monthBS}-25`;

  let daysDelayed = 0;
  let isOverdue = false;
  let estimatedLateFee = 0;

  if (!isFullyDeposited && totalWithheld > 0) {
    // If not deposited, evaluate overdue
    isOverdue = true;
    daysDelayed = 15; // default benchmark
    // Sec 119 interest at 15% p.a.
    const overdueInterest = (totalWithheld * 0.15 * (daysDelayed / 365));
    // Sec 120 penalty minimum Rs 100 per month
    const penalty = 100;
    estimatedLateFee = Math.round((overdueInterest + penalty) * 100) / 100;
  }

  return {
    fiscalYear,
    monthBS,
    dueDateBS,
    totalTdsWithheld: Math.round(totalWithheld * 100) / 100,
    totalTdsDeposited: Math.round(totalDeposited * 100) / 100,
    isFullyDeposited,
    isOverdue,
    daysDelayed,
    estimatedLateFee,
  };
}

/**
 * Generate Official Tax Deduction Certificate (Form 88 / कर कट्टी प्रमाणपत्र)
 */
export function generateTdsCertificate(
  deducteePanOrMemberId: string,
  fiscalYear: string,
  allRecords: readonly TdsTransactionRecord[],
  withholderInfo: CoopTaxWithholderInfo = DEFAULT_UNAKO_TAX_INFO
): TdsCertificateData | null {
  const matches = allRecords.filter((r) =>
    (r.deducteePan === deducteePanOrMemberId || r.deducteeMemberId === deducteePanOrMemberId) &&
    r.fiscalYear === fiscalYear
  );

  if (matches.length === 0) {
    return null;
  }

  const primary = matches[0];
  const totalGross = matches.reduce((sum, r) => sum + r.grossPaymentAmount, 0);
  const totalTds = matches.reduce((sum, r) => sum + r.tdsAmount, 0);
  const totalDeposited = matches
    .filter((r) => r.status === 'DEPOSITED' || r.status === 'FILED_IRD')
    .reduce((sum, r) => sum + r.tdsAmount, 0);

  // Generate deterministic verification token
  const hashPayload = `${withholderInfo.panNumber}-${primary.deducteePan}-${fiscalYear}-${totalTds}`;
  const verificationHash = `IRD-VER-${Math.abs(
    hashPayload.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  ).toString(16).toUpperCase().padStart(8, '0')}`;

  const certNo = `TDS-CERT-${fiscalYear.replace('/', '-')}-${primary.deducteeMemberId || primary.deducteePan}`;

  return {
    certificateNo: certNo,
    issueDateBS: '2081/12/30',
    withholder: withholderInfo,
    deductee: {
      pan: primary.deducteePan,
      name: primary.deducteeName,
      memberId: primary.deducteeMemberId,
    },
    fiscalYear,
    records: matches,
    totalGrossAmount: Math.round(totalGross * 100) / 100,
    totalTdsDeducted: Math.round(totalTds * 100) / 100,
    totalTdsDeposited: Math.round(totalDeposited * 100) / 100,
    verificationHash,
  };
}
