/**
 * Bad Debt Legal Recovery, CIB Blacklisting & Statutory Write-Off Engine
 * Unako SACCOS (उनको बचत तथा ऋण सहकारी संस्था लि., गढवा-५, दाङ)
 * Compliant with Nepal Cooperative Act 2074 (दफा ८३, ८४) and Cooperative Directives.
 */

import { Loan, Member, LoanProvisionCategory } from '../types';

export type LegalNoticeType =
  | 'NOTICE_35_DAYS_PUBLIC_AUCTION'
  | 'NOTICE_15_DAYS_FINAL_DEMAND'
  | 'NOTICE_7_DAYS_SEALED_TENDER';

export interface CollateralLegalDetail {
  readonly kittaNo: string;
  readonly district: string;
  readonly municipality: string;
  readonly wardNo: string;
  readonly areaDesc: string; // e.g., '०-१०-०-० बिघा' or '०-४-०-० कट्ठा'
  readonly northBoundary: string;
  readonly southBoundary: string;
  readonly eastBoundary: string;
  readonly westBoundary: string;
  readonly ownerName: string;
}

export interface GuarantorLegalDetail {
  readonly name: string;
  readonly memberNo?: string;
  readonly citizenshipNo: string;
  readonly district: string;
  readonly relation: string;
}

export interface LegalRecoveryNotice {
  readonly noticeNo: string;
  readonly noticeType: LegalNoticeType;
  readonly titleNepali: string;
  readonly titleEnglish: string;
  readonly issueDateNepali: string;
  readonly deadlineDateNepali: string;
  readonly loanId: string;
  readonly loanNo: string;
  readonly borrowerName: string;
  readonly borrowerMemberNo: string;
  readonly borrowerCitizenshipNo: string;
  readonly borrowerAddress: string;
  readonly guarantors: readonly GuarantorLegalDetail[];
  readonly collateral: CollateralLegalDetail;
  readonly principalOutstanding: number;
  readonly accruedInterest: number;
  readonly penaltyAmount: number;
  readonly legalNoticeExpenses: number;
  readonly totalPayableAmount: number;
  readonly statutoryCitation: string;
  readonly noticeBodyText: string;
}

export interface CibBlacklistRecord {
  readonly reportDate: string;
  readonly borrowerMemberNo: string;
  readonly borrowerName: string;
  readonly citizenshipNo: string;
  readonly citizenshipDistrict: string;
  readonly loanAccountNo: string;
  readonly loanType: string;
  readonly overdueDays: number;
  readonly provisionCategory: LoanProvisionCategory;
  readonly totalDefaultAmount: number;
  readonly principalAmount: number;
  readonly interestOverdue: number;
  readonly penaltyOverdue: number;
  readonly primaryGuarantorName: string;
  readonly primaryGuarantorCitizenship: string;
  readonly collateralBrief: string;
  readonly blacklistStatus: 'RECOMMENDED' | 'PENDING_SUBMISSION' | 'SUBMITTED_TO_CIB';
}

export interface BadDebtWriteOffVoucher {
  readonly voucherNo: string;
  readonly voucherDateNepali: string;
  readonly loanId: string;
  readonly loanNo: string;
  readonly borrowerName: string;
  readonly memberNo: string;
  readonly boardResolutionNo: string;
  readonly boardResolutionDateNepali: string;
  readonly agmRatificationStatus: 'RATIFIED' | 'PENDING_NEXT_AGM';
  readonly writeOffPrincipalAmount: number;
  readonly writeOffInterestAmount: number;
  readonly totalWriteOffAmount: number;
  readonly debitAccount: string;
  readonly creditAccount: string;
  readonly memorandumRegisterNo: string;
  readonly legalClaimPreserved: boolean;
  readonly notes: string;
}

export interface AuctionSettlementResult {
  readonly loanNo: string;
  readonly borrowerName: string;
  readonly grossAuctionProceeds: number;
  readonly legalAndAuctionCost: number;
  readonly penaltySettled: number;
  readonly interestSettled: number;
  readonly principalSettled: number;
  readonly totalSettled: number;
  readonly netSurplusRefundToMember: number;
  readonly remainingDeficitToRecover: number;
  readonly isFullySettled: boolean;
}

/**
 * Generate official 35-day Public Auction / 15-day / 7-day Recovery Notice
 */
export function generateLegalRecoveryNotice(
  loan: Loan,
  member: Member | undefined,
  noticeType: LegalNoticeType = 'NOTICE_35_DAYS_PUBLIC_AUCTION',
  customCollateral?: Partial<CollateralLegalDetail>,
  customGuarantors?: readonly GuarantorLegalDetail[],
  accruedInterestRate = 0.14,
  penaltyDays = 90
): LegalRecoveryNotice {
  const principal = loan.remainingBalance;
  // Estimate accrued overdue interest (simple calculation for default demo)
  const accruedInterest = Math.round((principal * accruedInterestRate * penaltyDays) / 365);
  const penaltyAmount = Math.round(principal * 0.02); // 2% penalty
  const legalNoticeExpenses = noticeType === 'NOTICE_35_DAYS_PUBLIC_AUCTION' ? 7500 : 2500;
  const totalPayableAmount = principal + accruedInterest + penaltyAmount + legalNoticeExpenses;

  const defaultCollateral: CollateralLegalDetail = {
    kittaNo: '४५२/११',
    district: 'दाङ',
    municipality: 'गढवा गाउँपालिका',
    wardNo: 'वडा नं. ५',
    areaDesc: '०-१०-०-० बिघा/कट्ठा',
    northBoundary: 'रामबहादुर चौधरीको जग्गा',
    southBoundary: 'सहकारी मुल सडक',
    eastBoundary: 'सिंचाइ कुलो',
    westBoundary: 'किता नं ४५१ को जग्गा',
    ownerName: member?.name ?? 'ऋणी स्वयम्',
    ...customCollateral,
  };

  const defaultGuarantors: readonly GuarantorLegalDetail[] = customGuarantors ?? [
    {
      name: 'डिल्लीराज शर्मा',
      citizenshipNo: '५४-०१-७२-०३२१४',
      district: 'दाङ',
      relation: 'व्यक्तिगत जमानीकर्ता',
      memberNo: 'UK-M-0089',
    },
  ];

  let titleNepali = '';
  let titleEnglish = '';
  let deadlineDays = 35;

  switch (noticeType) {
    case 'NOTICE_35_DAYS_PUBLIC_AUCTION':
      titleNepali = '३५ (पैंतीस) दिने सार्वजनिक धितो लिलाम तथा कर्जा चुक्ता सम्बन्धी सार्वजनिक सूचना';
      titleEnglish = '35-Day Statutory Public Auction & Debt Recovery Notice';
      deadlineDays = 35;
      break;
    case 'NOTICE_15_DAYS_FINAL_DEMAND':
      titleNepali = '१५ (पन्ध्र) दिने अन्तिम कर्जा चुक्ता ताकेता सूचना';
      titleEnglish = '15-Day Final Loan Repayment Demand Notice';
      deadlineDays = 15;
      break;
    case 'NOTICE_7_DAYS_SEALED_TENDER':
      titleNepali = '७ (सात) दिने गोप्य शिलबन्दी बोलपत्रद्वारा धितो लिलाम बिक्री सूचना';
      titleEnglish = '7-Day Sealed Bid Collateral Auction Notice';
      deadlineDays = 7;
      break;
  }

  const toNepaliDigits = (n: number | string): string =>
    n.toString().replace(/[0-9]/g, (d) => '०१२३४५६७८९'[parseInt(d, 10)]);

  const deadlineDaysNepali = toNepaliDigits(deadlineDays);

  // Real statutory date arithmetic on the BS calendar. The old implementation clamped the
  // deadline into the same BS month (`Math.min(30, deadlineDays + 1)`), so the "35-day"
  // notice actually expired after 29 days.
  // NEEDS SIGN-OFF: BS month lengths below follow BS 2081; a licensed BS calendar table is
  // required for exact multi-year notice dates.
  const BS_MONTH_DAYS: readonly number[] = [31, 31, 32, 31, 31, 31, 30, 30, 30, 30, 29, 30];
  const addDaysToBsDate = (
    start: { year: number; month: number; day: number },
    days: number
  ): { year: number; month: number; day: number } => {
    let { year, month, day } = start;
    let remaining = Math.max(0, days);
    while (remaining > 0) {
      const monthLength = BS_MONTH_DAYS[month - 1];
      const daysLeftInMonth = monthLength - day;
      if (remaining <= daysLeftInMonth) {
        day += remaining;
        remaining = 0;
      } else {
        remaining -= daysLeftInMonth + 1;
        day = 1;
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
      }
    }
    return { year, month, day };
  };

  // Notice issue date is the template default (BS 2081-06-01).
  const issueDateBs = { year: 2081, month: 6, day: 1 };
  const deadlineBs = addDaysToBsDate(issueDateBs, deadlineDays);
  const deadlineDateNepali = toNepaliDigits(
    `${deadlineBs.year}-${String(deadlineBs.month).padStart(2, '0')}-${String(deadlineBs.day).padStart(2, '0')}`
  );

  const statutoryCitation =
    'सहकारी ऐन २०७४ को दफा ८३ र ८४ तथा संस्थाको कर्जा असुली नियमावली २०७६';

  const noticeNo = `UNAKO/REC/${new Date().getFullYear()}/${loan.loanNo.replace(/[^0-9]/g, '') || '01'}`;

  const noticeBodyText = `यस उनको बचत तथा ऋण सहकारी संस्था लि., गढवा-५ दाङबाट तपसिलमा उल्लेखित ऋणीले माग गरे बमोजिम कर्जा सुविधा उपभोग गरी नियमित रुपमा साँवा तथा ब्याज भुक्तानी नगरी भाखा नाघेको हुँदा पटक-पटक मौखिक तथा लिखित ताकेता गर्दा समेत कर्जा चुक्ता नगरेकाले यो सूचना प्रकाशित गरिएको छ। सूचना प्रकाशित भएको मितिले ${deadlineDaysNepali} दिनभित्र संस्थामा उपस्थित भई सम्पूर्ण साँवा, ब्याज, हर्जाना तथा कानूनी खर्च चुक्ता गर्नुहोला। अन्यथा सहकारी ऐन २०७४ को दफा ८३ र ८४ बमोजिम धितो सुरक्षण राखिएको अचल सम्पत्ति सार्वजनिक लिलाम बिक्री गरी संस्थाको लेना रकम असुल उपर गरिनेछ र नपुग रकम ऋणी तथा जमानीकर्ताहरूको अन्य चल अचल सम्पत्तिबाट समेत असुल उपर गरी कर्जा सूचना केन्द्र (CIB) को कालोसूचीमा समावेश गरिने व्यहोरा सूचित गरिन्छ।`;

  return {
    noticeNo,
    noticeType,
    titleNepali,
    titleEnglish,
    issueDateNepali: '२०८१-०६-०१',
    deadlineDateNepali,
    loanId: loan.id,
    loanNo: loan.loanNo,
    borrowerName: member?.name ?? 'Cooperative Member',
    borrowerMemberNo: member?.memberNo ?? 'UK-MEMBER',
    borrowerCitizenshipNo: member?.citizenshipNo ?? '५४-०१-७०-०१४२५',
    borrowerAddress: member?.address ?? 'गढवा गाउँपालिका वडा नं. ५, दाङ',
    guarantors: defaultGuarantors,
    collateral: defaultCollateral,
    principalOutstanding: principal,
    accruedInterest,
    penaltyAmount,
    legalNoticeExpenses,
    totalPayableAmount,
    statutoryCitation,
    noticeBodyText,
  };
}

/**
 * Generate CIB Nepal Blacklisting recommendation dossier row
 */
export function buildCibBlacklistRecord(
  loan: Loan,
  member: Member | undefined,
  overdueDays: number,
  category: LoanProvisionCategory,
  primaryGuarantor?: GuarantorLegalDetail
): CibBlacklistRecord {
  const principal = loan.remainingBalance;
  // Overdue interest accrues over the ACTUAL overdue period. The old implementation
  // ignored `overdueDays` entirely and booked a flat 12% interest + 3% penalty of
  // principal even for a loan one day past due.
  // NEEDS SIGN-OFF: 12% p.a. contract + 3% p.a. penal are the existing file defaults; the
  // loan's own `interestRate` should ultimately drive the contract component.
  const ANNUAL_OVERDUE_INTEREST_RATE = 0.12;
  const ANNUAL_PENAL_INTEREST_RATE = 0.03;
  const safeOverdueDays = Number.isFinite(overdueDays) ? Math.max(0, overdueDays) : 0;
  const interestOverdue = Math.round(
    (principal * ANNUAL_OVERDUE_INTEREST_RATE * safeOverdueDays) / 365
  );
  const penaltyOverdue = Math.round(
    (principal * ANNUAL_PENAL_INTEREST_RATE * safeOverdueDays) / 365
  );
  const totalDefaultAmount = principal + interestOverdue + penaltyOverdue;

  return {
    reportDate: new Date().toISOString().slice(0, 10),
    borrowerMemberNo: member?.memberNo ?? 'UK-M-UNKNOWN',
    borrowerName: member?.name ?? 'Borrower Member',
    citizenshipNo: member?.citizenshipNo ?? '५४-०१-६५-००१२३',
    citizenshipDistrict: 'दाङ (Dang)',
    loanAccountNo: loan.loanNo,
    loanType: loan.loanType,
    overdueDays: safeOverdueDays,
    provisionCategory: category,
    totalDefaultAmount,
    principalAmount: principal,
    interestOverdue,
    penaltyOverdue,
    primaryGuarantorName: primaryGuarantor?.name ?? 'डिल्लीराज शर्मा (Dilliraj Sharma)',
    primaryGuarantorCitizenship: primaryGuarantor?.citizenshipNo ?? '५४-०१-७२-०३२१४',
    collateralBrief: loan.collateralDescription || 'धितो जग्गा कित्ता नं. ४५२/११ दाङ',
    blacklistStatus: 'RECOMMENDED',
  };
}

/**
 * Generate CIB compliant CSV export string
 */
export function generateCibBlacklistCsv(records: readonly CibBlacklistRecord[]): string {
  const headers = [
    'Report Date',
    'Member No',
    'Borrower Full Name',
    'Citizenship No',
    'District',
    'Loan Account No',
    'Loan Type',
    'Overdue Days',
    'Category',
    'Principal Default (NPR)',
    'Interest Overdue (NPR)',
    'Penalty Overdue (NPR)',
    'Total Default Amount (NPR)',
    'Guarantor Name',
    'Guarantor Citizenship',
    'Collateral Brief',
    'CIB Status',
  ];

  const rows = records.map((r) => [
    r.reportDate,
    r.borrowerMemberNo,
    `"${r.borrowerName}"`,
    r.citizenshipNo,
    `"${r.citizenshipDistrict}"`,
    r.loanAccountNo,
    `"${r.loanType}"`,
    r.overdueDays,
    r.provisionCategory,
    r.principalAmount,
    r.interestOverdue,
    r.penaltyOverdue,
    r.totalDefaultAmount,
    `"${r.primaryGuarantorName}"`,
    r.primaryGuarantorCitizenship,
    `"${r.collateralBrief}"`,
    r.blacklistStatus,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Validate and process a statutory Bad Debt Write-Off under Cooperative Directives
 */
export function processBadDebtWriteOff(
  loan: Loan,
  member: Member | undefined,
  boardResolutionNo: string,
  boardResolutionDateNepali: string,
  notes = 'सञ्चालक समितिको निर्णयानुसार १००% नोक्सानी जगेडाबाट अपलेखन गरी बाह्य खातामा सारिएको'
): BadDebtWriteOffVoucher {
  const principal = loan.remainingBalance;
  const interest = Math.round(principal * 0.08); // uncapitalized interest
  const totalWriteOff = principal + interest;

  const voucherNo = `WO-${new Date().getFullYear()}-${loan.loanNo.replace(/[^0-9]/g, '') || '001'}`;
  const memorandumRegisterNo = `MEMO-REC-${loan.loanNo}`;

  return {
    voucherNo,
    voucherDateNepali: '२०८१-०६-०१',
    loanId: loan.id,
    loanNo: loan.loanNo,
    borrowerName: member?.name ?? 'Cooperative Member',
    memberNo: member?.memberNo ?? 'UK-MEMBER',
    boardResolutionNo: boardResolutionNo.trim() || 'निर्णय नं. ४५ (२०८१/०५/२८)',
    boardResolutionDateNepali: boardResolutionDateNepali.trim() || '२०८१-०५-२८',
    agmRatificationStatus: 'PENDING_NEXT_AGM',
    writeOffPrincipalAmount: principal,
    writeOffInterestAmount: interest,
    totalWriteOffAmount: totalWriteOff,
    debitAccount: 'कर्जा नोक्सानी जगेडा कोष हिसाब (Loan Loss Reserve Account - Dr)',
    creditAccount: `ऋणी कर्जा हिसाब - ${loan.loanNo} (Loan Asset Account - Cr)`,
    memorandumRegisterNo,
    legalClaimPreserved: true,
    notes,
  };
}

/**
 * Calculate auction settlement proceeds allocation waterfall (Section 84 Priority)
 * Priority 1: Legal & Auction Expenses
 * Priority 2: Penalties & Default Charges
 * Priority 3: Accrued Interest
 * Priority 4: Principal Loan Balance
 * Surplus: Return to Member
 * Deficit: Remaining personal liability claim
 */
export function calculateAuctionSettlement(
  principalAmount: number,
  overdueInterest: number,
  penaltyAmount: number,
  legalAndAuctionCost: number,
  grossAuctionProceeds: number,
  borrowerName = 'Cooperative Member',
  loanNo = 'LN-DEFAULT'
): AuctionSettlementResult {
  let remainingProceeds = Math.max(0, grossAuctionProceeds);

  // 1. Settle Legal & Auction Costs
  const legalSettled = Math.min(remainingProceeds, legalAndAuctionCost);
  remainingProceeds -= legalSettled;

  // 2. Settle Penalty
  const penaltySettled = Math.min(remainingProceeds, penaltyAmount);
  remainingProceeds -= penaltySettled;

  // 3. Settle Interest
  const interestSettled = Math.min(remainingProceeds, overdueInterest);
  remainingProceeds -= interestSettled;

  // 4. Settle Principal
  const principalSettled = Math.min(remainingProceeds, principalAmount);
  remainingProceeds -= principalSettled;

  const totalSettled = legalSettled + penaltySettled + interestSettled + principalSettled;
  const netSurplusRefundToMember = remainingProceeds; // anything left over is refunded

  const totalRequired =
    legalAndAuctionCost + penaltyAmount + overdueInterest + principalAmount;
  const remainingDeficitToRecover = Math.max(0, totalRequired - grossAuctionProceeds);

  return {
    loanNo,
    borrowerName,
    grossAuctionProceeds,
    legalAndAuctionCost: legalSettled,
    penaltySettled,
    interestSettled,
    principalSettled,
    totalSettled,
    netSurplusRefundToMember,
    remainingDeficitToRecover,
    isFullySettled: remainingDeficitToRecover === 0,
  };
}
