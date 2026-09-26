/**
 * Non-Banking Assets (NBA) Acquisition & Disposal Settlement Engine
 * (गैर-बैंकिङ्ग सम्पत्ति सकार, मूल्यांकन तथा लिलाम फछ्र्यौट प्रणाली)
 * Unako SACCOS (उनको बचत तथा ऋण सहकारी संस्था लि., गढवा-५, दाङ)
 * Compliant with Nepal Cooperative Act 2074 Section 84 (सहकारी ऐन २०७४ दफा ८४),
 * Cooperative Rules 2075, and Department of Cooperatives / NRB Microfinance Directives.
 */

import { Loan, Member } from '../types';

export type NbaAssetStatus =
  | 'ACQUIRED_IN_POSSESSION'
  | 'SEALED_TENDER_LISTED'
  | 'DISPOSED_LIQUIDATED'
  | 'RELEASED_ON_FULL_SETTLEMENT';

export interface NbaCollateralInfo {
  readonly kittaNo: string;
  readonly sheetNo?: string;
  readonly district: string;
  readonly municipality: string;
  readonly wardNo: string;
  readonly areaDesc: string;
  readonly originalOwnerName: string;
  readonly originalOwnerCitizenship: string;
  readonly boundaries: {
    readonly north: string;
    readonly south: string;
    readonly east: string;
    readonly west: string;
  };
}

export interface NbaAcquisitionAssessment {
  readonly loanId: string;
  readonly loanNo: string;
  readonly borrowerName: string;
  readonly borrowerMemberNo: string;
  readonly outstandingPrincipal: number;
  readonly accruedInterest: number;
  readonly legalAndAuctionExpenses: number;
  readonly totalClaimPayable: number;
  readonly assessedDistressValue: number;
  readonly acquisitionAmount: number;
  readonly statutory100PercentProvision: number;
  readonly surplusEscrowSuspense: number;
  readonly shortfallRemainingDebt: number;
}

export interface NbaJournalVoucherEntry {
  readonly acCode: string;
  readonly acName: string;
  readonly debit: number;
  readonly credit: number;
  readonly narration: string;
}

export interface NbaJournalVoucher {
  readonly voucherNo: string;
  readonly voucherDateBS: string;
  readonly entries: readonly NbaJournalVoucherEntry[];
  readonly totalDebit: number;
  readonly totalCredit: number;
  readonly narration: string;
}

export interface LandRevenueOfficeLetter {
  readonly referenceNo: string;
  readonly officeName: string;
  readonly officeAddress: string;
  readonly subject: string;
  readonly issueDateBS: string;
  readonly borrowerName: string;
  readonly collateralKittaNo: string;
  readonly bodyNepaliText: string;
}

export interface NbaDisposalSettlement {
  readonly nbaBookValue: number;
  readonly saleGrossProceeds: number;
  readonly disposalCosts: number;
  readonly netProceeds: number;
  readonly gainLossOnDisposal: number;
  readonly isGain: boolean;
  readonly provisionReversalAmount: number;
  readonly voucherEntries: readonly NbaJournalVoucherEntry[];
}

export interface NbaRecord {
  readonly assetId: string;
  readonly loanNo: string;
  readonly borrowerName: string;
  readonly borrowerMemberNo: string;
  readonly kittaNo: string;
  readonly areaDesc: string;
  readonly district: string;
  readonly municipality: string;
  readonly acquisitionDateBS: string;
  readonly acquisitionAmount: number;
  readonly statutoryProvisionAmount: number;
  readonly status: NbaAssetStatus;
  readonly holdingExpiryDateBS: string;
}

/**
 * Computes statutory NBA acquisition value, 100% mandatory loan loss provision,
 * surplus escrow suspense, or remaining shortfall debt.
 */
export function computeNbaAcquisition(
  loan: Loan,
  member: Member,
  assessedDistressValue: number,
  legalCosts: number,
  accruedInterest: number
): NbaAcquisitionAssessment {
  const outstandingPrincipal = loan.remainingBalance;
  const safeAccruedInterest = Math.max(0, accruedInterest);
  const safeLegalCosts = Math.max(0, legalCosts);
  const totalClaimPayable = outstandingPrincipal + safeAccruedInterest + safeLegalCosts;

  // The acquisition price booked is min(distressValue, totalClaimPayable)
  const acquisitionAmount = Math.min(assessedDistressValue, totalClaimPayable);

  // Cooperative directives require 100% provision for Non-Banking Assets
  const statutory100PercentProvision = acquisitionAmount;

  // If the asset value exceeds the debt claim, the surplus must be held in escrow suspense
  const surplusEscrowSuspense = Math.max(0, assessedDistressValue - totalClaimPayable);

  // If the asset value is insufficient to cover the debt, the shortfall remains personal debt
  const shortfallRemainingDebt = Math.max(0, totalClaimPayable - assessedDistressValue);

  return {
    loanId: loan.id,
    loanNo: loan.loanNo,
    borrowerName: member.name,
    borrowerMemberNo: member.memberNo,
    outstandingPrincipal,
    accruedInterest: safeAccruedInterest,
    legalAndAuctionExpenses: safeLegalCosts,
    totalClaimPayable,
    assessedDistressValue,
    acquisitionAmount,
    statutory100PercentProvision,
    surplusEscrowSuspense,
    shortfallRemainingDebt,
  };
}

/**
 * Generates balanced double-entry accounting voucher for taking possession of collateral
 * as Non-Banking Asset (NBA) and booking 100% statutory provision.
 */
export function generateNbaJournalVoucher(
  assessment: NbaAcquisitionAssessment,
  voucherDateBS = '2081/06/20'
): NbaJournalVoucher {
  const voucherNo = `JV-NBA-${voucherDateBS.replace(/\//g, '')}-${assessment.loanNo.slice(-4)}`;
  const entries: NbaJournalVoucherEntry[] = [];

  // 1. Debit Non-Banking Asset account
  entries.push({
    acCode: '1201-NBA',
    acName: 'गैर-बैंकिङ्ग सम्पत्ति हिसाब (Non-Banking Asset - NBA A/C)',
    debit: assessment.acquisitionAmount,
    credit: 0,
    narration: `कर्जा नं. ${assessment.loanNo} को धितो लिलाम हुन नसकी ऐनको दफा ८४ बमोजिम सकार गरिएको`,
  });

  // 2. Credit Loan Principal Outstanding
  entries.push({
    acCode: '1105-LOAN-PRINCIPAL',
    acName: 'कर्जा साँवा हिसाब (Loan Principal A/C)',
    debit: 0,
    credit: assessment.outstandingPrincipal,
    narration: `ऋणी ${assessment.borrowerName} को बाँकी साँवा फछ्र्यौट`,
  });

  // 3. Credit Interest Income / Suspense if covered
  const interestCovered = Math.max(
    0,
    assessment.acquisitionAmount - assessment.outstandingPrincipal - assessment.legalAndAuctionExpenses
  );
  if (interestCovered > 0) {
    entries.push({
      acCode: '4101-LOAN-INTEREST-INCOME',
      acName: 'कर्जा पाकेको ब्याज आम्दानी हिसाब (Loan Interest Income A/C)',
      debit: 0,
      credit: interestCovered,
      narration: `धितो सकारबाट असुल भएको ब्याज आम्दानी`,
    });
  }

  // 4. Credit Legal & Auction Recovery Expenses
  if (assessment.legalAndAuctionExpenses > 0) {
    entries.push({
      acCode: '1110-LEGAL-RECOVERY-EXPENSES',
      acName: 'कानूनी असुली खर्च हिसाब (Legal Recovery Expenses A/C)',
      debit: 0,
      credit: assessment.legalAndAuctionExpenses,
      narration: `लिलाम सूचना तथा कानूनी खर्च असुली`,
    });
  }

  // 5. Mandatory 100% Provision for Non-Banking Assets (Debit Expense, Credit Provision Reserve)
  entries.push({
    acCode: '5102-LOAN-LOSS-EXPENSE',
    acName: 'कर्जा तथा गैर-बैंकिङ्ग सम्पत्ति नोक्सानी खर्च हिसाब (Loan/NBA Loss Expense A/C)',
    debit: assessment.statutory100PercentProvision,
    credit: 0,
    narration: `सहकारी विभागको मापदण्ड अनुसार गैर-बैंकिङ्ग सम्पत्तिमा १००% नोक्सानी जगेडा कायम गरिएको`,
  });

  entries.push({
    acCode: '2105-NBA-PROVISION-RESERVE',
    acName: 'गैर-बैंकिङ्ग सम्पत्ति नोक्सानी जगेडा हिसाब (Provision for NBA Reserve A/C)',
    debit: 0,
    credit: assessment.statutory100PercentProvision,
    narration: `सकार गरिएको धितो वापत १००% जगेडा कोष खडा गरिएको`,
  });

  const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);

  const narration = `नेपाल सहकारी ऐन २०७४ को दफा ८४ बमोजिम कर्जा नं. ${assessment.loanNo} को लिलाम सकार गरी गैर-बैंकिङ्ग सम्पत्ति कायम गरिएको र १००% नोक्सानी जगेडा हिसाब बाँधिएको।`;

  return {
    voucherNo,
    voucherDateBS,
    entries,
    totalDebit,
    totalCredit,
    narration,
  };
}

/**
 * Generates official requisition letter to Land Revenue Office (मालपोत कार्यालय)
 * requesting ownership transfer (दाखिला खारेज / नामसारी) to the cooperative.
 */
export function generateLandRevenueTransferLetter(
  assessment: NbaAcquisitionAssessment,
  collateral: NbaCollateralInfo,
  bodMinuteNo: string,
  letterDateBS = '2081/06/25'
): LandRevenueOfficeLetter {
  const referenceNo = `UNAKO/LEGAL/NBA/${letterDateBS.replace(/\//g, '')}/${collateral.kittaNo}`;
  const officeName = `श्री मालपोत कार्यालय, ${collateral.district}`;
  const officeAddress = `${collateral.district}, लुम्बिनी प्रदेश`;
  const subject = `विषय: सहकारी ऐन २०७४ को दफा ८४ बमोजिम धितो लिलाम सकार गरी संस्थाको नाममा दाखिला खारेज (नामसारी) सम्बन्धमा।`;

  const bodyNepaliText = `
उपरोक्त विषयमा यस उनको बचत तथा ऋण सहकारी संस्था लि. (दर्ता नं. १२३/०६८/०६९) बाट कर्जा सुविधा उपभोग गर्नुभएका ऋणी श्री ${assessment.borrowerName} (सदस्य नं. ${assessment.borrowerMemberNo}, ना.प्र.नं. ${collateral.originalOwnerCitizenship}) ले संस्थामा कर्जा चुक्ता नगरेकोले संस्थाको नियमानुसार ३५ दिने तथा १५ दिने सार्वजनिक लिलाम सूचना प्रकाशित गर्दा समेत कसैको बोलपत्र नपरेको व्यहोरा अवगत नै छ।

तसर्थ, नेपाल सहकारी ऐन २०७४ को दफा ८४ तथा सहकारी नियमावली २०७५ को प्रावधान बमोजिम सञ्चालक समितिको निर्णय नं. ${bodMinuteNo} अनुसार तपसिल बमोजिमको धितो सम्पत्ति यस संस्थाले न्यूनतम लिलाम/सकार मूल्य रु. ${assessment.acquisitionAmount.toLocaleString()}/- मा सकार गरी गैर-बैंकिङ्ग सम्पत्ति (NBA) को रूपमा अभिलेख राख्ने निर्णय भएको छ।

तपसिल बमोजिमको अचल सम्पत्ति साविक धितोकर्ता श्री ${collateral.originalOwnerName} को नामबाट कट्टा गरी यस "उनको बचत तथा ऋण सहकारी संस्था लि." को नाममा दाखिला खारेज (नामसारी) गरी नयाँ जग्गाधनी प्रमाण पुर्जा (लालपुर्जा) उपलब्ध गराई दिनुहुन सादर अनुरोध गरिन्छ।

तपसिल:
१. जिल्ला: ${collateral.district}, स्थानीय तह: ${collateral.municipality}, वडा नं: ${collateral.wardNo}
२. कित्ता नं. ${collateral.kittaNo} ${collateral.sheetNo ? `(नक्सा सिट नं: ${collateral.sheetNo})` : ''}
३. क्षेत्रफल: ${collateral.areaDesc}
४. चारकिल्ला: पूर्व-${collateral.boundaries.east}, पश्चिम-${collateral.boundaries.west}, उत्तर-${collateral.boundaries.north}, दक्षिण-${collateral.boundaries.south}
५. साविक जग्गाधनी: श्री ${collateral.originalOwnerName} (ना.प्र.नं. ${collateral.originalOwnerCitizenship})
`.trim();

  return {
    referenceNo,
    officeName,
    officeAddress,
    subject,
    issueDateBS: letterDateBS,
    borrowerName: assessment.borrowerName,
    collateralKittaNo: collateral.kittaNo,
    bodyNepaliText,
  };
}

/**
 * Calculates profit/loss and accounting adjustments upon subsequent disposal / liquidation of NBA.
 */
export function calculateNbaDisposalSettlement(
  nbaBookValue: number,
  saleGrossProceeds: number,
  disposalCosts: number
): NbaDisposalSettlement {
  const netProceeds = Math.max(0, saleGrossProceeds - disposalCosts);
  const gainLossOnDisposal = netProceeds - nbaBookValue;
  const isGain = gainLossOnDisposal >= 0;
  const provisionReversalAmount = nbaBookValue; // Full 100% provision is written back upon cash receipt

  const voucherEntries: NbaJournalVoucherEntry[] = [];

  // Cash / Bank received
  voucherEntries.push({
    acCode: '1001-BANK-CURRENT',
    acName: 'बैंक मौज्दात हिसाब (Bank Balance A/C)',
    debit: netProceeds,
    credit: 0,
    narration: `गैर-बैंकिङ्ग सम्पत्ति लिलाम बिक्रीबाट प्राप्त खुद रकम`,
  });

  // Remove NBA from books
  voucherEntries.push({
    acCode: '1201-NBA',
    acName: 'गैर-बैंकिङ्ग सम्पत्ति हिसाब (Non-Banking Asset A/C)',
    debit: 0,
    credit: nbaBookValue,
    narration: `सम्पत्ति बिक्री भई खाताबाट कट्टा गरिएको`,
  });

  // Book Gain or Loss
  if (isGain && gainLossOnDisposal > 0) {
    voucherEntries.push({
      acCode: '4205-GAIN-ON-NBA-DISPOSAL',
      acName: 'गैर-बैंकिङ्ग सम्पत्ति बिक्री नाफा हिसाब (Gain on NBA Disposal A/C)',
      debit: 0,
      credit: gainLossOnDisposal,
      narration: `गैर-बैंकिङ्ग सम्पत्ति बिक्रीमा भएको पूँजीगत मुनाफा`,
    });
  } else if (!isGain && Math.abs(gainLossOnDisposal) > 0) {
    voucherEntries.push({
      acCode: '5205-LOSS-ON-NBA-DISPOSAL',
      acName: 'गैर-बैंकिङ्ग सम्पत्ति बिक्री नोक्सानी हिसाब (Loss on NBA Disposal A/C)',
      debit: Math.abs(gainLossOnDisposal),
      credit: 0,
      narration: `गैर-बैंकिङ्ग सम्पत्ति बिक्रीमा भएको नोक्सानी`,
    });
  }

  // Provision Reversal (Debit Provision Reserve, Credit Loan Loss Provision Recovery Income)
  voucherEntries.push({
    acCode: '2105-NBA-PROVISION-RESERVE',
    acName: 'गैर-बैंकिङ्ग सम्पत्ति नोक्सानी जगेडा हिसाब (NBA Provision Reserve A/C)',
    debit: provisionReversalAmount,
    credit: 0,
    narration: `सम्पत्ति नगदमा रूपान्तरण भएकाले १००% जगेडा फछ्र्यौट`,
  });

  voucherEntries.push({
    acCode: '4105-PROVISION-WRITEBACK-INCOME',
    acName: 'नोक्सानी जगेडा फिर्ता आम्दानी हिसाब (Provision Write-back Income A/C)',
    debit: 0,
    credit: provisionReversalAmount,
    narration: `नोक्सानी जगेडा नाफा-नोक्सान हिसाबमा फिर्ता`,
  });

  return {
    nbaBookValue,
    saleGrossProceeds,
    disposalCosts,
    netProceeds,
    gainLossOnDisposal,
    isGain,
    provisionReversalAmount,
    voucherEntries,
  };
}

/**
 * Formats NBA Register records into clean CSV for internal audit, Board and COPOMIS.
 */
export function exportNbaRegisterCsv(records: readonly NbaRecord[]): string {
  const headers = [
    'Asset ID',
    'Loan No',
    'Borrower Member No',
    'Borrower Name',
    'Kitta No',
    'Area Description',
    'District',
    'Municipality',
    'Acquisition Date (BS)',
    'Acquisition Amount (NPR)',
    '100% Provision Amount (NPR)',
    'Status',
    'Statutory Holding Expiry (BS)',
  ];

  const rows = records.map((r) => [
    r.assetId,
    r.loanNo,
    r.borrowerMemberNo,
    `"${r.borrowerName.replace(/"/g, '""')}"`,
    `"${r.kittaNo}"`,
    `"${r.areaDesc}"`,
    r.district,
    `"${r.municipality}"`,
    r.acquisitionDateBS,
    r.acquisitionAmount,
    r.statutoryProvisionAmount,
    r.status,
    r.holdingExpiryDateBS,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
