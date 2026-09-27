/**
 * Member Demise & Family Welfare Relief Ledger Engine
 * (सदस्य मृत्यु राहत, आश्रित परिवार कल्याण तथा ऋण मिनाहा कोष प्रणाली)
 *
 * Implements cooperative relief standards pursuant to:
 * - Nepal Cooperative Act 2074, Section 67 & 68 (सहकारी ऐन २०७४, दफा ६७/६८)
 * - Standard SACCOS By-Laws (बचत तथा ऋण सहकारी संस्थाको विनियमावली)
 * - Community & Member Welfare Discretionary Fund Policies (सामुदायिक विकास तथा सदस्य राहत कार्यविधि)
 * - COPAS Double-Entry Accounting Standard for Welfare Reserve Disbursements
 */

export type WelfareClaimType =
  | 'MEMBER_DEATH'         // सदस्य मृत्यु राहत (NPR 30,000 - 50,000)
  | 'FUNERAL_EXPENSE'       // काजकिरिया खर्च (NPR 10,000 immediate)
  | 'SPOUSE_DEATH'          // पति/पत्नी मृत्यु राहत (NPR 10,000)
  | 'MATERNITY_ALLOWANCE'   // महिला सदस्य सुत्केरी पोषण भत्ता (NPR 5,000)
  | 'CRITICAL_ILLNESS'      // दीर्घरोग तथा गम्भीर उपचार सहायता (NPR 15,000 - 25,000)
  | 'LOAN_WAIVER';          // मृतक ऋणी कर्जा मिनाहा / दायित्व समायोजन (Up to NPR 100,000)

export type WelfareClaimStatus =
  | 'SUBMITTED'   // दर्ता भएको
  | 'VERIFIED'    // कागजात प्रमाणित
  | 'APPROVED'    // सञ्चालक समिति स्वीकृत
  | 'DISBURSED'   // रकम भुक्तानी सम्पन्न
  | 'REJECTED';   // अस्वीकृत

export interface WelfareClaimRecord {
  id: string;
  claimNo: string;
  memberId: string;
  memberNo: string;
  memberName: string;
  claimType: WelfareClaimType;
  claimAmount: number;
  eventDate: string; // YYYY-MM-DD (BS or AD)
  nomineeName: string;
  nomineeRelation: string;
  nomineeCitizenshipNo: string;
  nomineeContact: string;
  wardDeathCertNo?: string;
  medicalHospitalName?: string;
  loanAccountNo?: string;
  outstandingLoanBalance?: number;
  waivedLoanAmount?: number;
  status: WelfareClaimStatus;
  committeeMinuteNo?: string;
  approvalDate?: string;
  disbursedDate?: string;
  disbursementMethod: 'CASH' | 'BANK_TRANSFER' | 'SAVINGS_ACCOUNT';
  voucherNo?: string;
  remarks?: string;
  createdAt: string;
}

export interface NomineeSettlementParams {
  memberId: string;
  memberNo: string;
  memberName: string;
  nomineeName: string;
  nomineeRelation: string;
  shareBalance: number;
  savingsBalance: number;
  accruedInterest: number;
  accruedDividend: number;
  deathReliefAmount: number;
  funeralAllowance: number;
  outstandingLoanPrincipal: number;
  outstandingLoanInterest: number;
  loanWaiverAmount: number;
}

export interface NomineeSettlementSummary {
  memberNo: string;
  memberName: string;
  nomineeName: string;
  nomineeRelation: string;
  grossAssetsDue: number;
  grossLoanLiability: number;
  approvedLoanWaiver: number;
  netLoanLiability: number;
  netNomineePayable: number;
  lineItems: {
    descriptionNe: string;
    descriptionEn: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
  }[];
  legalNoticeNe: string;
}

export interface WelfareCopasJournalEntry {
  voucherNo: string;
  date: string;
  fiscalYear: string;
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

/** Standard By-law Benefit Guidelines */
export const WELFARE_STANDARD_BENEFITS: Record<
  WelfareClaimType,
  { defaultAmount: number; maxLimit: number; labelNe: string; labelEn: string; documentReqNe: string }
> = {
  MEMBER_DEATH: {
    defaultAmount: 35000,
    maxLimit: 50000,
    labelNe: 'सदस्य मृत्यु राहत अनुदान',
    labelEn: 'Member Demise Relief Grant',
    documentReqNe: 'वडा कार्यालयको मृत्यु दर्ता प्रमाणपत्र, नाता प्रमाणित, हकवाला नागरिकता',
  },
  FUNERAL_EXPENSE: {
    defaultAmount: 10000,
    maxLimit: 15000,
    labelNe: 'काजकिरिया खर्च (तत्काल राहत)',
    labelEn: 'Immediate Bereavement & Funeral Expense',
    documentReqNe: 'मृत्यु सूचना तथा हकवालाको सनाखत फारम',
  },
  SPOUSE_DEATH: {
    defaultAmount: 10000,
    maxLimit: 15000,
    labelNe: 'पति/पत्नी मृत्यु राहत सहयोग',
    labelEn: 'Spouse Demise Relief Allowance',
    documentReqNe: 'पति वा पत्नीको मृत्यु दर्ता र विवाह दर्ता प्रमाणपत्र',
  },
  MATERNITY_ALLOWANCE: {
    defaultAmount: 5000,
    maxLimit: 10000,
    labelNe: 'महिला सदस्य सुत्केरी पोषण भत्ता',
    labelEn: 'Maternity Nutrition Allowance',
    documentReqNe: 'स्वास्थ्य चौकी/अस्पतालको जन्म प्रमाणपत्र र खोप कार्ड',
  },
  CRITICAL_ILLNESS: {
    defaultAmount: 20000,
    maxLimit: 30000,
    labelNe: 'दीर्घरोग तथा गम्भीर स्वास्थ्य उपचार सहयोग',
    labelEn: 'Critical Illness Medical Relief',
    documentReqNe: 'अस्पतालको भर्ना तथा डिस्चार्ज रिपोर्ट, चिकित्सकको सिफारिस',
  },
  LOAN_WAIVER: {
    defaultAmount: 50000,
    maxLimit: 100000,
    labelNe: 'मृतक ऋणी सदस्य कर्जा मिनाहा',
    labelEn: 'Deceased Borrower Loan Waiver Relief',
    documentReqNe: 'ऋण उपसमिति तथा सञ्चालक समितिको विशेष निर्णय प्रतिलिपि',
  },
};

/**
 * Initial Mock Welfare Claims Data (Reflecting Unako SACCOS, Gadhawa Dang)
 */
export const INITIAL_WELFARE_CLAIMS: WelfareClaimRecord[] = [
  {
    id: 'claim-101',
    claimNo: 'MW-2081/82-001',
    memberId: 'm-102',
    memberNo: 'MBR-00102',
    memberName: 'सुनिता कुमारी चौधरी',
    claimType: 'MATERNITY_ALLOWANCE',
    claimAmount: 5000,
    eventDate: '2081-04-12',
    nomineeName: 'सुनिता कुमारी चौधरी',
    nomineeRelation: 'स्वयम् (Self)',
    nomineeCitizenshipNo: '52-01-74-04128',
    nomineeContact: '9847891234',
    medicalHospitalName: 'गढवा गाउँपालिका प्राथमिक स्वास्थ्य केन्द्र',
    status: 'DISBURSED',
    committeeMinuteNo: 'बैठक नं. ४२, निर्णय नं. ३',
    approvalDate: '2081-04-15',
    disbursedDate: '2081-04-16',
    disbursementMethod: 'SAVINGS_ACCOUNT',
    voucherNo: 'WLF-VCH-810416',
    remarks: 'प्रथम सन्तान जन्म पोषण भत्ता बचत खातामा जम्मा गरिएको।',
    createdAt: '2026-07-28T09:30:00Z',
  },
  {
    id: 'claim-102',
    claimNo: 'MW-2081/82-002',
    memberId: 'm-104',
    memberNo: 'MBR-00104',
    memberName: 'कमल प्रसाद शर्मा',
    claimType: 'MEMBER_DEATH',
    claimAmount: 35000,
    eventDate: '2081-05-02',
    nomineeName: 'राधा शर्मा',
    nomineeRelation: 'श्रीमती (Wife)',
    nomineeCitizenshipNo: '52-01-70-01982',
    nomineeContact: '9867012345',
    wardDeathCertNo: 'ग.गा.पा.-५-दर्ता-२१४',
    loanAccountNo: 'LN-2080-049',
    outstandingLoanBalance: 65000,
    waivedLoanAmount: 65000,
    status: 'APPROVED',
    committeeMinuteNo: 'स.स. बैठक नं. ४८, निर्णय नं. १',
    approvalDate: '2081-05-08',
    disbursementMethod: 'BANK_TRANSFER',
    remarks: 'मृत्यु राहत रु. ३५,००० स्वीकृत तथा बाँकी कर्जा रु. ६५,००० राहत कोषबाट मिनाहा निर्णय।',
    createdAt: '2026-08-18T11:15:00Z',
  },
  {
    id: 'claim-103',
    claimNo: 'MW-2081/82-003',
    memberId: 'm-108',
    memberNo: 'MBR-00108',
    memberName: 'दिलमाया गुरुङ',
    claimType: 'CRITICAL_ILLNESS',
    claimAmount: 20000,
    eventDate: '2081-05-20',
    nomineeName: 'दिलमाया गुरुङ',
    nomineeRelation: 'स्वयम् (Self)',
    nomineeCitizenshipNo: '52-01-68-09871',
    nomineeContact: '9812345678',
    medicalHospitalName: 'राप्ती स्वास्थ्य विज्ञान प्रतिष्ठान, दाङ',
    status: 'VERIFIED',
    disbursementMethod: 'SAVINGS_ACCOUNT',
    remarks: 'मुटुरोग शल्यक्रिया उपचार सहायता वडा सिफारिस सहित पेश।',
    createdAt: '2026-09-05T08:45:00Z',
  },
  {
    id: 'claim-104',
    claimNo: 'MW-2081/82-004',
    memberId: 'm-115',
    memberNo: 'MBR-00115',
    memberName: 'भेषराज पाण्डे',
    claimType: 'FUNERAL_EXPENSE',
    claimAmount: 10000,
    eventDate: '2081-06-01',
    nomineeName: 'गंगा पाण्डे',
    nomineeRelation: 'छोरा (Son)',
    nomineeCitizenshipNo: '52-01-76-00412',
    nomineeContact: '9809876543',
    wardDeathCertNo: 'ग.गा.पा.-५-दर्ता-२२८',
    status: 'SUBMITTED',
    disbursementMethod: 'CASH',
    remarks: 'काजकिरिया खर्च तत्काल निकासाका लागि हकवालाबाट आवेदन।',
    createdAt: '2026-09-17T14:20:00Z',
  },
];

/**
 * Validates a Welfare Claim submission
 */
export function validateWelfareClaim(claim: Partial<WelfareClaimRecord>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!claim.memberNo || !claim.memberNo.trim()) {
    errors.push('सदस्य नम्बर अनिवार्य छ (Member number is required).');
  }
  if (!claim.memberName || !claim.memberName.trim()) {
    errors.push('सदस्यको नाम अनिवार्य छ (Member name is required).');
  }
  if (!claim.claimType) {
    errors.push('दाबीको प्रकार चयन गर्नुहोस् (Claim type is required).');
  }
  if (!claim.claimAmount || claim.claimAmount <= 0) {
    errors.push('दाबी रकम शून्य भन्दा बढी हुनुपर्दछ (Claim amount must be greater than zero).');
  } else if (claim.claimType) {
    const limits = WELFARE_STANDARD_BENEFITS[claim.claimType];
    if (claim.claimAmount > limits.maxLimit) {
      errors.push(
        `दाबी रकम अधिकतम मापदण्ड रु. ${limits.maxLimit.toLocaleString()} भन्दा बढी हुन सक्दैन (Amount exceeds statutory limit).`
      );
    }
  }

  if (!claim.nomineeName || !claim.nomineeName.trim()) {
    errors.push('हकवाला वा प्राप्तकर्ताको नाम अनिवार्य छ (Nominee name is required).');
  }
  if (!claim.nomineeRelation || !claim.nomineeRelation.trim()) {
    errors.push('नाता सम्बन्ध खुलाउनुहोस् (Nominee relation is required).');
  }

  // Mandatory Death Registration check
  if ((claim.claimType === 'MEMBER_DEATH' || claim.claimType === 'FUNERAL_EXPENSE') && !claim.wardDeathCertNo) {
    errors.push('वडा कार्यालयको मृत्यु दर्ता नम्बर उल्लेख हुनुपर्छ (Ward death registration cert no is required).');
  }

  // Mandatory Hospital check for Critical Illness
  if (claim.claimType === 'CRITICAL_ILLNESS' && !claim.medicalHospitalName) {
    errors.push('उपचार भएको अस्पताल वा स्वास्थ्य संस्थाको नाम खुलाउनुहोस् (Hospital name is required).');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Computes Full Deceased Member Financial Settlement for the Legal Nominee
 * (हकवालालाई भुक्तानी हुने कुल वित्तीय हिसाब - सेयर, बचत, लाभांश, मृत्यु राहत र ऋण समायोजन)
 */
export function calculateNomineeSettlement(params: NomineeSettlementParams): NomineeSettlementSummary {
  const grossAssetsDue =
    params.shareBalance +
    params.savingsBalance +
    params.accruedInterest +
    params.accruedDividend +
    params.deathReliefAmount +
    params.funeralAllowance;

  const grossLoanLiability = params.outstandingLoanPrincipal + params.outstandingLoanInterest;
  const approvedLoanWaiver = Math.min(grossLoanLiability, Math.max(0, params.loanWaiverAmount));
  const netLoanLiability = Math.max(0, grossLoanLiability - approvedLoanWaiver);
  const netNomineePayable = Math.max(0, grossAssetsDue - netLoanLiability);

  const lineItems: NomineeSettlementSummary['lineItems'] = [
    {
      descriptionNe: 'सेयर पूँजी फिर्ता (Share Capital Refund)',
      descriptionEn: 'Share Capital Refund',
      type: 'CREDIT',
      amount: params.shareBalance,
    },
    {
      descriptionNe: 'बचत मौज्दात फिर्ता (Member Savings Balance)',
      descriptionEn: 'Member Savings Balance',
      type: 'CREDIT',
      amount: params.savingsBalance,
    },
    {
      descriptionNe: 'जम्मा भएको बचत ब्याज (Accrued Savings Interest)',
      descriptionEn: 'Accrued Savings Interest',
      type: 'CREDIT',
      amount: params.accruedInterest,
    },
    {
      descriptionNe: 'अवितरित लाभांश (Accrued Share Dividend)',
      descriptionEn: 'Accrued Share Dividend',
      type: 'CREDIT',
      amount: params.accruedDividend,
    },
    {
      descriptionNe: 'सदस्य मृत्यु राहत अनुदान (Demise Relief Grant)',
      descriptionEn: 'Member Demise Relief Grant',
      type: 'CREDIT',
      amount: params.deathReliefAmount,
    },
    {
      descriptionNe: 'काजकिरिया खर्च सहायता (Funeral Allowance)',
      descriptionEn: 'Funeral & Bereavement Allowance',
      type: 'CREDIT',
      amount: params.funeralAllowance,
    },
  ];

  if (grossLoanLiability > 0) {
    lineItems.push({
      descriptionNe: 'बाँकी ऋण दायित्व (Outstanding Loan Balance)',
      descriptionEn: 'Outstanding Loan Balance',
      type: 'DEBIT',
      amount: grossLoanLiability,
    });

    if (approvedLoanWaiver > 0) {
      lineItems.push({
        descriptionNe: 'कल्याणकारी कोषबाट ऋण मिनाहा (Relief Fund Loan Waiver)',
        descriptionEn: 'Welfare Loan Waiver Credit',
        type: 'CREDIT',
        amount: approvedLoanWaiver,
      });
    }
  }

  const legalNoticeNe = `यस उनको बचत तथा ऋण सहकारी संस्था लि. गढवा-५, दाङको विनियम तथा नेपाल सहकारी ऐन २०७४ अनुसार मृतक सदस्य ${params.memberName} (सदस्य नं. ${params.memberNo}) को सम्पूर्ण सेयर, बचत, लाभांश तथा संस्थागत मृत्यु राहत रकमबाट बाँकी ऋण दायित्व समायोजन गरी खुद रकम रु. ${netNomineePayable.toLocaleString()} हकवाला ${params.nomineeName} (${params.nomineeRelation}) लाई नियमानुसार भुक्तानीका लागि प्रमाणित गरिएको छ।`;

  return {
    memberNo: params.memberNo,
    memberName: params.memberName,
    nomineeName: params.nomineeName,
    nomineeRelation: params.nomineeRelation,
    grossAssetsDue,
    grossLoanLiability,
    approvedLoanWaiver,
    netLoanLiability,
    netNomineePayable,
    lineItems,
    legalNoticeNe,
  };
}

/**
 * Generates Standard COPAS Double-Entry Journal Voucher for Welfare Disbursement
 */
export function generateWelfareCopasVoucher(
  claim: WelfareClaimRecord,
  fiscalYear: string = '2081/82'
): WelfareCopasJournalEntry {
  const voucherNo = claim.voucherNo || `VCH-WLF-${Date.now().toString().slice(-6)}`;
  const date = claim.disbursedDate || new Date().toISOString().split('T')[0];

  const entries: WelfareCopasJournalEntry['entries'] = [
    {
      glCode: '3104',
      accountNameNe: 'सामुदायिक विकास तथा सदस्य राहत कोष हिसाब (खर्च/दाखिला)',
      accountNameEn: 'Community & Member Welfare Reserve Account',
      debitAmount: claim.claimAmount,
      creditAmount: 0,
    },
  ];

  if (claim.disbursementMethod === 'CASH') {
    entries.push({
      glCode: '1101',
      accountNameNe: 'मुख्य ढुकुटी नगद मौज्दात (Main Cash Vault)',
      accountNameEn: 'Cash in Vault Account',
      debitAmount: 0,
      creditAmount: claim.claimAmount,
    });
  } else if (claim.disbursementMethod === 'BANK_TRANSFER') {
    entries.push({
      glCode: '1102',
      accountNameNe: 'बैंक मौज्दात हिसाब (क वर्गका वाणिज्य बैंक)',
      accountNameEn: 'Bank Current Account',
      debitAmount: 0,
      creditAmount: claim.claimAmount,
    });
  } else {
    entries.push({
      glCode: '2101',
      accountNameNe: 'हकवालाको अनिवार्य/साधारण बचत खाता',
      accountNameEn: 'Nominee Member Savings Account',
      debitAmount: 0,
      creditAmount: claim.claimAmount,
    });
  }

  // If there is loan waiver involved
  if (claim.waivedLoanAmount && claim.waivedLoanAmount > 0) {
    entries.push(
      {
        glCode: '3105',
        accountNameNe: 'ऋण नोक्सानी तथा कल्याणकारी कोष (कर्जा मिनाहा)',
        accountNameEn: 'Loan Loss / Welfare Reserve (Waiver Debit)',
        debitAmount: claim.waivedLoanAmount,
        creditAmount: 0,
      },
      {
        glCode: '1301',
        accountNameNe: 'कर्जा तथा सापट लगानी हिसाब (मृतक सदस्य कर्जा चुक्ता)',
        accountNameEn: 'Loan Principal Investment (Settlement Credit)',
        debitAmount: 0,
        creditAmount: claim.waivedLoanAmount,
      }
    );
  }

  const totalDebit = entries.reduce((sum, e) => sum + e.debitAmount, 0);
  const totalCredit = entries.reduce((sum, e) => sum + e.creditAmount, 0);

  const narrationNe = `दाबी नं. ${claim.claimNo} अन्तर्गत मृतक/लाभार्थी सदस्य ${claim.memberName} (हकवाला: ${claim.nomineeName}) लाई ${WELFARE_STANDARD_BENEFITS[claim.claimType].labelNe} बापतको रकम निकासा।`;
  const narrationEn = `Disbursement of ${claim.claimType} benefit under claim ${claim.claimNo} to nominee ${claim.nomineeName}.`;

  return {
    voucherNo,
    date,
    fiscalYear,
    narrationNe,
    narrationEn,
    entries,
    totalDebit,
    totalCredit,
  };
}

/**
 * Exports Welfare Claims to CSV Format
 */
export function exportWelfareClaimsToCsv(claims: WelfareClaimRecord[]): string {
  const headers = [
    'दाबी नं. (Claim No)',
    'सदस्य नं. (Member No)',
    'सदस्यको नाम (Member Name)',
    'राहत प्रकार (Claim Type)',
    'रकम (Amount NPR)',
    'हकवालाको नाम (Nominee)',
    'सम्बन्ध (Relation)',
    'हकवाला नागरिकता (Nominee Citizenship)',
    'सम्पर्क (Contact)',
    'मृत्यु दर्ता नं. (Death Cert No)',
    'अस्पताल (Hospital)',
    'स्थिति (Status)',
    'भुक्तानी माध्यम (Method)',
    'स्वीकृति मिति (Approved Date)',
    'भौचर नं. (Voucher No)',
  ];

  const rows = claims.map((c) => [
    `"${c.claimNo}"`,
    `"${c.memberNo}"`,
    `"${c.memberName}"`,
    `"${WELFARE_STANDARD_BENEFITS[c.claimType]?.labelNe || c.claimType}"`,
    c.claimAmount,
    `"${c.nomineeName}"`,
    `"${c.nomineeRelation}"`,
    `"${c.nomineeCitizenshipNo}"`,
    `"${c.nomineeContact}"`,
    `"${c.wardDeathCertNo || '-'}"`,
    `"${c.medicalHospitalName || '-'}"`,
    `"${c.status}"`,
    `"${c.disbursementMethod}"`,
    `"${c.approvalDate || '-'}"`,
    `"${c.voucherNo || '-'}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
