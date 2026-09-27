/**
 * Unako SACCOS - Inter-Branch & Field Service Center (Sewa Kendra) Daily Cash Reconciliation & Clearing Engine
 * (सहकारी सेवा केन्द्र तथा अन्तर-शाखा दैनिक हिसाब मिलान तथा क्लियरिङ प्रणाली)
 *
 * Regulatory & Governance Framework:
 * - Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) Section 49 & 50 (शाखा/सेवा केन्द्र हिसाब नियन्त्रण)
 * - Standard Accounting Directives for Cooperatives (सहकारी लेखा निर्देशिका)
 * - Inter-Branch Clearing & Central Vault Fund Transfer Protocol
 */

export type SewaKendraCode = 'HQ-GDH' | 'SC-LMH' | 'SC-BLB' | 'SC-GBD' | 'SC-KBL';

export interface DenominationCounts {
  readonly n1000: number;
  readonly n500: number;
  readonly n100: number;
  readonly n50: number;
  readonly n20: number;
  readonly n10: number;
  readonly n5: number;
  readonly coins: number;
}

export const DENOMINATION_VALUES: Record<keyof DenominationCounts, number> = {
  n1000: 1000,
  n500: 500,
  n100: 100,
  n50: 50,
  n20: 20,
  n10: 10,
  n5: 5,
  coins: 1,
};

export interface SewaKendraReceipts {
  readonly savingsDeposit: number;     // सदस्य बचत जम्मा
  readonly loanRepayment: number;      // कर्जा साँवा/ब्याज असुली
  readonly shareAndFees: number;       // सेयर खरिद तथा शुल्क
  readonly remittanceReceived: number; // रेमिट्यान्स भुक्तानीका लागि प्राप्त कोष
  readonly otherReceipts: number;      // अन्य विविध आम्दानी
}

export interface SewaKendraDisbursements {
  readonly savingsWithdrawal: number;  // सदस्य बचत फिर्ता
  readonly loanDisbursement: number;   // कर्जा लगानी भुक्तानी
  readonly remittancePayout: number;   // रेमिट्यान्स सेवाग्राही भुक्तानी
  readonly pettyExpenses: number;      // कार्यालय सञ्चालन तथा विविध खर्च
}

export interface SewaKendraDayBookEntry {
  readonly id: string;
  readonly sewaKendraCode: SewaKendraCode;
  readonly sewaKendraNameNe: string;
  readonly sewaKendraNameEn: string;
  readonly dateBS: string;
  readonly inchargeName: string;
  readonly openingCash: number;
  readonly receipts: SewaKendraReceipts;
  readonly disbursements: SewaKendraDisbursements;
  readonly calculatedClosingBalance: number;
  readonly physicalCashCount: number;
  readonly discrepancyAmount: number; // physical - calculated (0 = balanced, + = surplus, - = deficit)
  readonly reconciliationStatus: 'BALANCED' | 'SURPLUS' | 'DEFICIT';
  readonly transitToCentralVault: number; // केन्द्रीय कार्यालयमा नगद दाखिला
  readonly retainedBranchFloat: number;   // भोलिपल्टका लागि सेवा केन्द्रमा राखिएको सुरु मौज्दात
  readonly denominations: DenominationCounts;
  readonly clearingVoucherNo: string;
  readonly isHeadOfficeApproved: boolean;
  readonly remarks?: string;
}

export interface InterBranchClearingVoucher {
  readonly voucherNo: string;
  readonly dateBS: string;
  readonly fromBranchCode: SewaKendraCode;
  readonly fromBranchNameNe: string;
  readonly toBranchCode: SewaKendraCode;
  readonly toBranchNameNe: string;
  readonly transferAmount: number;
  readonly debitAccountTitle: string;  // e.g. "केन्द्रीय ढुकुटी नगद हिसाब"
  readonly creditAccountTitle: string; // e.g. "अन्तर-शाखा क्लियरिङ हिसाब (गोबरडिहा सेवा केन्द्र)"
  readonly courierCustodian: string;
  readonly authorizedBy: string;
  readonly status: 'PENDING_APPROVAL' | 'APPROVED_TRANSFERRED' | 'RECONCILED';
}

/**
 * Compute the exact total from cash denominations
 */
export function calculateDenominationSum(denoms: DenominationCounts): number {
  return (
    denoms.n1000 * 1000 +
    denoms.n500 * 500 +
    denoms.n100 * 100 +
    denoms.n50 * 50 +
    denoms.n20 * 20 +
    denoms.n10 * 10 +
    denoms.n5 * 5 +
    denoms.coins * 1
  );
}

/**
 * Reconcile Daily Sewa Kendra Cash and Generate Complete Day-Book Audit
 */
export function reconcileSewaKendraDayBook(params: {
  readonly id: string;
  readonly sewaKendraCode: SewaKendraCode;
  readonly sewaKendraNameNe: string;
  readonly sewaKendraNameEn: string;
  readonly dateBS: string;
  readonly inchargeName: string;
  readonly openingCash: number;
  readonly receipts: SewaKendraReceipts;
  readonly disbursements: SewaKendraDisbursements;
  readonly denominations: DenominationCounts;
  readonly transitToCentralVault: number;
  readonly remarks?: string;
}): SewaKendraDayBookEntry {
  const {
    id,
    sewaKendraCode,
    sewaKendraNameNe,
    sewaKendraNameEn,
    dateBS,
    inchargeName,
    openingCash,
    receipts,
    disbursements,
    denominations,
    transitToCentralVault,
    remarks,
  } = params;

  const totalReceipts =
    receipts.savingsDeposit +
    receipts.loanRepayment +
    receipts.shareAndFees +
    receipts.remittanceReceived +
    receipts.otherReceipts;

  const totalDisbursements =
    disbursements.savingsWithdrawal +
    disbursements.loanDisbursement +
    disbursements.remittancePayout +
    disbursements.pettyExpenses;

  const calculatedClosingBalance = openingCash + totalReceipts - totalDisbursements;
  const physicalCashCount = calculateDenominationSum(denominations);
  const discrepancyAmount = Math.round((physicalCashCount - calculatedClosingBalance) * 100) / 100;

  let reconciliationStatus: 'BALANCED' | 'SURPLUS' | 'DEFICIT' = 'BALANCED';
  if (discrepancyAmount > 0) {
    reconciliationStatus = 'SURPLUS';
  } else if (discrepancyAmount < 0) {
    reconciliationStatus = 'DEFICIT';
  }

  const retainedBranchFloat = Math.max(0, physicalCashCount - transitToCentralVault);

  return {
    id,
    sewaKendraCode,
    sewaKendraNameNe,
    sewaKendraNameEn,
    dateBS,
    inchargeName,
    openingCash,
    receipts,
    disbursements,
    calculatedClosingBalance,
    physicalCashCount,
    discrepancyAmount,
    reconciliationStatus,
    transitToCentralVault,
    retainedBranchFloat,
    denominations,
    clearingVoucherNo: `VCH-CLR-${sewaKendraCode}-${dateBS.replace(/\//g, '')}-01`,
    isHeadOfficeApproved: false,
    remarks,
  };
}

/**
 * Generate an official Double-Entry Inter-Branch Clearing Voucher
 */
export function generateInterBranchClearingVoucher(
  entry: SewaKendraDayBookEntry,
  authorizedBy: string = 'अर्जुन प्रसाद शर्मा (व्यवस्थापक)'
): InterBranchClearingVoucher {
  return {
    voucherNo: `IBC-VCH-${entry.sewaKendraCode}-${entry.dateBS.replace(/\//g, '')}`,
    dateBS: entry.dateBS,
    fromBranchCode: entry.sewaKendraCode,
    fromBranchNameNe: entry.sewaKendraNameNe,
    toBranchCode: 'HQ-GDH',
    toBranchNameNe: 'गढवा केन्द्रीय मुख्य कार्यालय तथा तिजोरी',
    transferAmount: entry.transitToCentralVault,
    debitAccountTitle: '१०१०१ - केन्द्रीय ढुकुटी नगद मौज्दात हिसाब (HQ Central Vault Cash A/C)',
    creditAccountTitle: `२०२०२ - अन्तर-शाखा हिसाब (${entry.sewaKendraNameNe} Inter-Branch Clearing A/C)`,
    courierCustodian: `${entry.inchargeName} / सुरक्षित नगद ओसारपसार टोली`,
    authorizedBy,
    status: 'APPROVED_TRANSFERRED',
  };
}

/**
 * Export Inter-Branch Day-Book & Clearing Report to CSV
 */
export function exportSewaKendraClearingCsv(entries: readonly SewaKendraDayBookEntry[]): string {
  const metaHeader = [
    '"उनको बचत तथा ऋण सहकारी संस्था लि., गढवा-५, दाङ"',
    '"सेवा केन्द्र तथा अन्तर-शाखा दैनिक हिसाब मिलान प्रतिवेदन (Inter-Branch Clearing Schedule)"',
    `"कुल सेवा केन्द्र संख्या: ${entries.length}"`,
    `"उत्पन्न मिति: ${entries[0]?.dateBS || '२०८०/०९/२५'}"`,
  ].join('\r\n');

  const headers = [
    'क्र.सं. (S.N.)',
    'सेवा केन्द्र संकेत (Code)',
    'सेवा केन्द्रको नाम (Branch Name)',
    'शाखा इन्चार्ज (In-Charge)',
    'सुरु मौज्दात (Opening NPR)',
    'कुल संकलन/आम्दानी (Total Receipts)',
    'कुल भुक्तानी/खर्च (Total Disbursements)',
    'लेखा अनुसार हुनुपर्ने (Calculated Closing)',
    'भौतिक नगद गन्ती (Physical Count)',
    'कैफियत रकम (+/- Discrepancy)',
    'मिलान अवस्था (Status)',
    'केन्द्रीय कार्यालय दाखिला (Transit to HQ)',
    'सेवा केन्द्रमा बाँकी (Retained Float)',
    'क्लियरिङ भौचर नं (Voucher No)',
  ].map((h) => `"${h}"`).join(',');

  const rows = entries.map((e, idx) => {
    const totalRec =
      e.receipts.savingsDeposit +
      e.receipts.loanRepayment +
      e.receipts.shareAndFees +
      e.receipts.remittanceReceived +
      e.receipts.otherReceipts;

    const totalDisb =
      e.disbursements.savingsWithdrawal +
      e.disbursements.loanDisbursement +
      e.disbursements.remittancePayout +
      e.disbursements.pettyExpenses;

    return [
      idx + 1,
      `"${e.sewaKendraCode}"`,
      `"${e.sewaKendraNameNe}"`,
      `"${e.inchargeName}"`,
      e.openingCash.toFixed(2),
      totalRec.toFixed(2),
      totalDisb.toFixed(2),
      e.calculatedClosingBalance.toFixed(2),
      e.physicalCashCount.toFixed(2),
      e.discrepancyAmount.toFixed(2),
      `"${e.reconciliationStatus}"`,
      e.transitToCentralVault.toFixed(2),
      e.retainedBranchFloat.toFixed(2),
      `"${e.clearingVoucherNo}"`,
    ].join(',');
  });

  return [metaHeader, '', headers, ...rows].join('\r\n');
}

/**
 * Seed Default Daily Records for Unako Service Centers
 */
export function createDefaultSewaKendraRecords(): readonly SewaKendraDayBookEntry[] {
  return [
    {
      id: 'SK-REC-2080-001',
      sewaKendraCode: 'SC-GBD',
      sewaKendraNameNe: 'गोबरडिहा ग्रामीण सेवा केन्द्र',
      sewaKendraNameEn: 'Gobardiha Rural Extension Desk',
      dateBS: '२०८०/०९/२५',
      inchargeName: 'अनिता यादव (Anita Yadav)',
      openingCash: 85000,
      receipts: {
        savingsDeposit: 245000,
        loanRepayment: 180000,
        shareAndFees: 12000,
        remittanceReceived: 50000,
        otherReceipts: 3000,
      },
      disbursements: {
        savingsWithdrawal: 110000,
        loanDisbursement: 150000,
        remittancePayout: 45000,
        pettyExpenses: 2500,
      },
      calculatedClosingBalance: 267500,
      physicalCashCount: 267500,
      discrepancyAmount: 0,
      reconciliationStatus: 'BALANCED',
      transitToCentralVault: 150000,
      retainedBranchFloat: 117500,
      denominations: {
        n1000: 220, // 220,000
        n500: 80,   // 40,000
        n100: 60,   // 6,000
        n50: 20,    // 1,000
        n20: 20,    // 400
        n10: 8,     // 80
        n5: 4,      // 20
        coins: 0,
      },
      clearingVoucherNo: 'VCH-CLR-SC-GBD-20800925-01',
      isHeadOfficeApproved: true,
      remarks: 'महिला समूह बचत सङ्कलन तथा कृषि कर्जा किस्ता पूर्ण मिलान भएको।',
    },
    {
      id: 'SK-REC-2080-002',
      sewaKendraCode: 'SC-LMH',
      sewaKendraNameNe: 'लमही बजार सेवा केन्द्र',
      sewaKendraNameEn: 'Lamahi Market Service Center',
      dateBS: '२०८०/०९/२५',
      inchargeName: 'सुनिता चौधरी (Sunita Chaudhary)',
      openingCash: 250000,
      receipts: {
        savingsDeposit: 620000,
        loanRepayment: 410000,
        shareAndFees: 25000,
        remittanceReceived: 100000,
        otherReceipts: 5000,
      },
      disbursements: {
        savingsWithdrawal: 380000,
        loanDisbursement: 300000,
        remittancePayout: 90000,
        pettyExpenses: 4500,
      },
      calculatedClosingBalance: 635500,
      physicalCashCount: 635500,
      discrepancyAmount: 0,
      reconciliationStatus: 'BALANCED',
      transitToCentralVault: 400000,
      retainedBranchFloat: 235500,
      denominations: {
        n1000: 550, // 550,000
        n500: 150,  // 75,000
        n100: 90,   // 9,000
        n50: 20,    // 1,000
        n20: 20,    // 400
        n10: 9,     // 90
        n5: 2,      // 10
        coins: 0,
      },
      clearingVoucherNo: 'VCH-CLR-SC-LMH-20800925-01',
      isHeadOfficeApproved: true,
      remarks: 'दैनिक बजार बचत तथा व्यापारिक कर्जा असुली रकम केन्द्रीय ढुकुटीमा चलान।',
    },
    {
      id: 'SK-REC-2080-003',
      sewaKendraCode: 'SC-BLB',
      sewaKendraNameNe: 'भालुवाङ राप्ती काउन्टर',
      sewaKendraNameEn: 'Bhalubang Rapti Counter',
      dateBS: '२०८०/०९/२५',
      inchargeName: 'दिपक डाँगी (Dipak Dangi)',
      openingCash: 120000,
      receipts: {
        savingsDeposit: 310000,
        loanRepayment: 195000,
        shareAndFees: 8000,
        remittanceReceived: 60000,
        otherReceipts: 2000,
      },
      disbursements: {
        savingsWithdrawal: 190000,
        loanDisbursement: 120000,
        remittancePayout: 55000,
        pettyExpenses: 1800,
      },
      calculatedClosingBalance: 328200,
      physicalCashCount: 328200,
      discrepancyAmount: 0,
      reconciliationStatus: 'BALANCED',
      transitToCentralVault: 200000,
      retainedBranchFloat: 128200,
      denominations: {
        n1000: 290, // 290,000
        n500: 68,   // 34,000
        n100: 38,   // 3,800
        n50: 6,     // 300
        n20: 4,     // 80
        n10: 2,     // 20
        n5: 0,
        coins: 0,
      },
      clearingVoucherNo: 'VCH-CLR-SC-BLB-20800925-01',
      isHeadOfficeApproved: false,
      remarks: 'राप्ती काउन्टर दैनिक बन्द तथा केन्द्रीय दाखिला प्रतिक्षारत।',
    },
  ];
}
