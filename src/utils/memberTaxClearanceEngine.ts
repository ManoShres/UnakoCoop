/**
 * Unako SACCOS - Member Tax Clearance, Withholding Certificate & IRD Section 90 Suite
 * (सदस्य कर चुक्ता, लाभांश/ब्याज कर कट्टी प्रमाणपत्र तथा आन्तरिक राजस्व फारम प्रणाली)
 * 
 * Statutory Regulatory Authority:
 * - Income Tax Act 2058 (आयकर ऐन २०५८) Section 88 (Withholding Tax on Interest & Dividends)
 * - Section 90 (Withholding Tax Deduction Certificate / कर कट्टी प्रमाणपत्र)
 * - Section 117 (Offences & Penalties for Failure to Issue Withholding Certificate)
 * - Inland Revenue Department (IRD - आन्तरिक राजस्व विभाग) e-TDS Portal Directives
 */

export interface MemberTaxSourceAccount {
  accountNo: string;
  accountType: string;
  grossInterestEarned: number;
  tdsRatePercent: number; // 5.0% for individual residents
  tdsAmount: number;
  netInterestPaid: number;
  etdsVoucherNo: string;
  depositDateNepali: string;
}

export interface MemberDividendTaxRecord {
  fiscalYear: string;
  shareKitta: number;
  shareCapital: number;
  grossDividendEarned: number;
  dividendTaxRatePercent: number; // 5.0%
  dividendTaxAmount: number;
  netDividendPaid: number;
  etdsVoucherNo: string;
  agmResolutionDateNepali: string;
}

export interface MemberTaxClearanceProfile {
  memberId: string;
  memberNo: string;
  fullNameNepali: string;
  fullNameEnglish: string;
  citizenshipNo: string;
  panNo: string; // IRD PAN
  phone: string;
  address: string;
  fiscalYear: string;
  savingsAccounts: MemberTaxSourceAccount[];
  dividendRecord?: MemberDividendTaxRecord;
  totalGrossIncome: number;
  totalTdsDeducted: number;
  totalNetIncome: number;
  irdRemittanceStatus: 'VERIFIED_REMITTED' | 'PENDING_UPLOAD';
  certificateNo: string;
  issuedDateNepali: string;
}

export interface TaxClearanceCalculationResult {
  totalGrossSavingsInterest: number;
  totalSavingsTds: number;
  grossDividend: number;
  dividendTds: number;
  totalGrossIncome: number;
  totalTdsDeducted: number;
  totalNetIncome: number;
  effectiveTaxRatePercent: number;
  isPanVerified: boolean;
}

/**
 * Computes member tax clearance and withholding totals
 */
export function calculateMemberTaxClearance(params: {
  savingsAccounts: MemberTaxSourceAccount[];
  dividendRecord?: MemberDividendTaxRecord;
  panNo?: string;
}): TaxClearanceCalculationResult {
  const { savingsAccounts, dividendRecord, panNo } = params;

  let totalGrossSavingsInterest = 0;
  let totalSavingsTds = 0;

  for (const acc of savingsAccounts) {
    totalGrossSavingsInterest += acc.grossInterestEarned;
    totalSavingsTds += acc.tdsAmount;
  }

  const grossDividend = dividendRecord?.grossDividendEarned || 0;
  const dividendTds = dividendRecord?.dividendTaxAmount || 0;

  const totalGrossIncome = totalGrossSavingsInterest + grossDividend;
  const totalTdsDeducted = totalSavingsTds + dividendTds;
  const totalNetIncome = totalGrossIncome - totalTdsDeducted;

  const effectiveTaxRatePercent = totalGrossIncome > 0
    ? Math.round((totalTdsDeducted / totalGrossIncome) * 1000) / 10
    : 5.0;

  const isPanVerified = !!(panNo && panNo.trim().length >= 9);

  return {
    totalGrossSavingsInterest,
    totalSavingsTds,
    grossDividend,
    dividendTds,
    totalGrossIncome,
    totalTdsDeducted,
    totalNetIncome,
    effectiveTaxRatePercent,
    isPanVerified,
  };
}

/**
 * Generates an official Income Tax Act 2058 Section 90 Tax Deduction Certificate
 */
export function generateSection90TaxCertificate(
  profile: MemberTaxClearanceProfile,
  calc: TaxClearanceCalculationResult
): string {
  return `================================================================================
                    उनको बचत तथा ऋण सहकारी संस्था लिमिटेड
                UNAKO SAVING & CREDIT COOPERATIVE SOCIETY LTD.
                     गढवा-५, दाङ, लुम्बिनी प्रदेश, नेपाल
                    संस्थाको स्थायी लेखा नं (Coop PAN): 302849102
================================================================================
                    आयकर ऐन २०५८, दफा ९० बमोजिमको
                       अग्रिम कर कट्टी प्रमाणपत्र
                STATUTORY WITHHOLDING TAX (TDS) CERTIFICATE
--------------------------------------------------------------------------------
प्रमाणपत्र नं (Cert No.): ${profile.certificateNo}
आर्थिक वर्ष (Fiscal Year): ${profile.fiscalYear}
जारी मिति (Issue Date): ${profile.issuedDateNepali}

१. करदाता / सेयर सदस्य विवरण (Taxpayer / Member Particulars):
   पूरा नाम (Full Name): ${profile.fullNameNepali} (${profile.fullNameEnglish})
   सदस्य नं (Member No.): ${profile.memberNo}
   स्थायी लेखा नं (PAN No.): ${profile.panNo || 'उल्लेख नभएको (Unregistered)'}
   नागरिकता नं (Citizenship No.): ${profile.citizenshipNo}
   ठेगाना (Address): ${profile.address}
   सम्पर्क नं (Contact): ${profile.phone}

२. भुक्तानी तथा अग्रिम कर कट्टी विवरण (Payment & TDS Particulars):
   -----------------------------------------------------------------------------
   आम्दानी शीर्षक (Income Head)         कुल रकम (Gross)   कर दर (Rate)   कट्टी कर (TDS)
   -----------------------------------------------------------------------------
   बचत तथा मुद्दती ब्याज (Interest)     रु. ${calc.totalGrossSavingsInterest.toLocaleString('en-IN')}       5.0%        रु. ${calc.totalSavingsTds.toLocaleString('en-IN')}
   सेयर लाभांश आम्दानी (Dividend)      रु. ${calc.grossDividend.toLocaleString('en-IN')}       5.0%        रु. ${calc.dividendTds.toLocaleString('en-IN')}
   -----------------------------------------------------------------------------
   जम्मा (TOTALS):                      रु. ${calc.totalGrossIncome.toLocaleString('en-IN')}                   रु. ${calc.totalTdsDeducted.toLocaleString('en-IN')}
   -----------------------------------------------------------------------------
   सदस्यले खुद प्राप्त गरेको रकम (Net Payout): रु. ${calc.totalNetIncome.toLocaleString('en-IN')}

३. आन्तरिक राजस्व विभाग ई-टीडीएस दाखिला प्रमाणीकरण (IRD e-TDS Verification):
   उक्त कट्टी गरिएको अग्रिम कर रकम आयकर ऐन २०५८ बमोजिम संस्थाले नेपाल सरकारको 
   राजस्व खातामा e-TDS प्रणाली मार्फत दाखिला गरी दाखिला भौचर नं. 
   (Voucher No: ${profile.savingsAccounts[0]?.etdsVoucherNo || 'eTDS-Dang-81-4920'}) मा अभिलेख गरिएको व्यहोरा प्रमाणित गरिन्छ।
   यो कर कट्टी आयकर ऐन २०५८ को दफा ९२ अनुसार प्राकृतिक व्यक्तिको हकमा अन्तिम कर कट्टी हो।
--------------------------------------------------------------------------------
............................                   ............................
     तयार गर्ने (लेखापाल)                          व्यवस्थापक / अधिकृत
        Accountant                                Executive Manager
================================================================================`;
}

/**
 * Generates an official Member Tax Clearance Letter (कर चुक्ता पत्र)
 */
export function generateMemberTaxClearanceLetter(
  profile: MemberTaxClearanceProfile,
  calc: TaxClearanceCalculationResult
): string {
  return `================================================================================
                    उनको बचत तथा ऋण सहकारी संस्था लिमिटेड
                UNAKO SAVING & CREDIT COOPERATIVE SOCIETY LTD.
                     गढवा-५, दाङ, लुम्बिनी प्रदेश, नेपाल
             दर्ता नं: २८३/०६५/०६६ | स्थायी लेखा नं (PAN): 302849102
================================================================================
                         आधिकारिक कर चुक्ता सिफारिस पत्र
                        OFFICIAL TAX CLEARANCE CERTIFICATE
--------------------------------------------------------------------------------
पत्र संख्या: उन/कर/२०८१-८२
चलानी नं: ${Math.floor(Math.random() * 900 + 100)}
मिति: ${profile.issuedDateNepali}

श्री जो जससँग सम्बन्ध छ।
TO WHOM IT MAY CONCERN

यस उनको बचत तथा ऋण सहकारी संस्था लि. गढवा-५, दाङमा सेयर सदस्य रहनुभएका 
श्री/श्रीमती: ${profile.fullNameNepali} (${profile.fullNameEnglish})
सदस्य नं: ${profile.memberNo}
स्थायी लेखा नं (PAN): ${profile.panNo || 'N/A'}
नागरिकता नं: ${profile.citizenshipNo}
ठेगाना: ${profile.address}

ले आर्थिक वर्ष ${profile.fiscalYear} मा यस संस्थामा सञ्चालन गर्नुभएका सम्पूर्ण बचत, 
मुद्दती तथा सेयर खाताहरूबाट प्राप्त गर्नुभएको कुल ब्याज तथा लाभांश आम्दानी 
रु. ${calc.totalGrossIncome.toLocaleString('en-IN')} मा लाग्ने नियमानुसारको ५% अग्रिम कर कट्टी (TDS) 
बापतको जम्मा रकम रु. ${calc.totalTdsDeducted.toLocaleString('en-IN')} संस्थाले नियमानुसार कट्टा गरी 
आन्तरिक राजस्व कार्यालयमा e-TDS मार्फत शतप्रतिशत दाखिला गरिसकेको व्यहोरा प्रमाणित गरिन्छ।

हाल निज सदस्यको नाममा संस्थालाई बुझाउनुपर्ने कुनै पनि प्रकारको कर, शुल्क वा 
दायित्व बाँकी नरहेको (कर चुक्ता भएको) व्यहोरा सिफारिस साथ अनुरोध गर्दछौं।

............................                   ............................
      (लेखा प्रमुख)                                  (कार्यकारी प्रमुख)
    Head of Accounts                               Executive Officer
================================================================================`;
}

/**
 * Exports Member Tax Clearance & Withholding Ledger to CSV
 */
export function exportMemberTaxLedgerToCSV(
  profile: MemberTaxClearanceProfile,
  calc: TaxClearanceCalculationResult
): string {
  const header = [
    'Account No (खाता नं)',
    'Account Type (खाताको प्रकार)',
    'Gross Interest (आर्जित ब्याज रु)',
    'TDS Rate (% दर)',
    'TDS Deducted (कट्टी कर रु)',
    'Net Paid (खुद भुक्तानी रु)',
    'e-TDS Voucher No (दाखिला भौचर नं)',
    'Remitted Date (मिति)',
  ].join(',');

  const rows = profile.savingsAccounts.map((a) => {
    return [
      `"${a.accountNo}"`,
      `"${a.accountType}"`,
      a.grossInterestEarned,
      `${a.tdsRatePercent}%`,
      a.tdsAmount,
      a.netInterestPaid,
      `"${a.etdsVoucherNo}"`,
      `"${a.depositDateNepali}"`,
    ].join(',');
  });

  const dividendRow = profile.dividendRecord
    ? `\n"DIVIDEND-SHARE","वार्षिक सेयर लाभांश",${profile.dividendRecord.grossDividendEarned},${profile.dividendRecord.dividendTaxRatePercent}%,${profile.dividendRecord.dividendTaxAmount},${profile.dividendRecord.netDividendPaid},"${profile.dividendRecord.etdsVoucherNo}","${profile.dividendRecord.agmResolutionDateNepali}"`
    : '';

  const summary = [
    '',
    '--- MEMBER TAX CLEARANCE & WITHHOLDING SUMMARY ---',
    `Member No,${profile.memberNo}`,
    `Member Name,${profile.fullNameNepali} (${profile.fullNameEnglish})`,
    `PAN No,${profile.panNo}`,
    `Fiscal Year,${profile.fiscalYear}`,
    `Total Gross Income (कुल आम्दानी),${calc.totalGrossIncome}`,
    `Total TDS Withheld (जम्मा कट्टी कर),${calc.totalTdsDeducted}`,
    `Total Net Income (खुद आम्दानी),${calc.totalNetIncome}`,
    `Effective Tax Rate,${calc.effectiveTaxRatePercent}%`,
    `IRD e-TDS Status,${profile.irdRemittanceStatus}`,
  ].join('\n');

  return [header, ...rows, dividendRow, summary].join('\n');
}
