/**
 * Cooperative Merger, Amalgamation & Balance Sheet Consolidation Engine
 * (सहकारी एकीकरण, समायोजन तथा संयुक्त वासलात प्रणाली)
 *
 * Implements statutory cooperative merger standards pursuant to:
 * - Nepal Cooperative Act 2074, Section 87 & 88 (सहकारी ऐन २०७४, दफा ८७/८८)
 * - Department of Cooperatives Directives on Cooperative Mergers & Amalgamations
 * - Due Diligence Audit (DDA) & Net Asset Value (NAV) Swap Ratio Standards
 * - Standard COPAS Amalgamation Opening Journal Vouchers
 */

export interface CooperativeEntityProfile {
  name: string;
  nameNepali: string;
  registrationNo: string;
  registrationDateBs: string;
  palikaAddress: string;
  totalMembers: number;
  femaleMembers: number;
  paidUpShareCapital: number; // Par value NPR 100
  totalSavingsDeposits: number;
  grossLoanPortfolio: number;
  loanLossProvision: number;
  netLoanPortfolio: number;
  cashAndBankBalances: number;
  fixedAssetsValuation: number;
  otherAssets: number;
  totalLiabilities: number;
  generalReserveFund: number;
  otherStatutoryFunds: number;
  netWorth: number; // Total Assets - Total Liabilities
  navPerShare: number; // Net Worth / (Share Capital / 100)
}

export interface MergerDdaParams {
  anchorCoop: CooperativeEntityProfile;
  targetCoop: CooperativeEntityProfile;
  assetHaircutPercent?: number; // e.g. 5% adjustment on bad loans/unverified assets
}

export interface SwapRatioAnalysis {
  anchorNavPerShare: number;
  targetNavPerShare: number;
  nominalSwapRatio: number; // e.g. 1 : 0.85
  adjustedSwapRatio: number; // Post-haircut
  sharesIssuedToTarget: number; // Kitta
  capitalDilutionPercent: number;
  swapSummaryNe: string;
  swapSummaryEn: string;
}

export interface ConsolidatedBalanceSheet {
  mergedName: string;
  mergedNameNepali: string;
  totalMembers: number;
  femaleMembersPercent: number;
  consolidatedShareCapital: number;
  consolidatedSavings: number;
  consolidatedNetLoans: number;
  consolidatedCashAndBank: number;
  consolidatedFixedAssets: number;
  consolidatedGeneralReserve: number;
  consolidatedTotalAssets: number;
  consolidatedTotalLiabilities: number;
  consolidatedNetWorth: number;
  mergerEqualizationReserve: number; // Surplus or deficit on acquisition
  netWorthToAssetsPercent: number; // Capital adequacy
}

export interface MergerRegulatoryStep {
  id: string;
  stepNo: number;
  titleNe: string;
  titleEn: string;
  legalBasis: string;
  isMandatory: boolean;
  isCompleted: boolean;
  completedDate?: string;
  remarksNe: string;
}

export interface MergerCopasVoucher {
  voucherNo: string;
  fiscalYear: string;
  narrationNe: string;
  entries: {
    glCode: string;
    accountNameNe: string;
    debitAmount: number;
    creditAmount: number;
  }[];
  totalDebit: number;
  totalCredit: number;
}

/**
 * Standard seed profiles for Unako SACCOS (Anchor) & Rapti Mahila SACCOS (Target)
 */
export const INITIAL_ANCHOR_COOP: CooperativeEntityProfile = {
  name: 'Unako Saving and Credit Cooperative Society Ltd.',
  nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
  registrationNo: '148/064/065',
  registrationDateBs: '2064-10-18',
  palikaAddress: 'गढवा गाउँपालिका-५, दाङ',
  totalMembers: 1420,
  femaleMembers: 1180,
  paidUpShareCapital: 18500000, // 1.85 Crores
  totalSavingsDeposits: 84000000, // 8.4 Crores
  grossLoanPortfolio: 78000000,
  loanLossProvision: 2500000,
  netLoanPortfolio: 75500000,
  cashAndBankBalances: 21500000,
  fixedAssetsValuation: 12000000,
  otherAssets: 4500000,
  totalLiabilities: 88500000,
  generalReserveFund: 11500000,
  otherStatutoryFunds: 4500000,
  netWorth: 25000000, // Assets 113.5M - Liab 88.5M = 25M
  navPerShare: 135.14, // (25M / 185k kitta)
};

export const INITIAL_TARGET_COOP: CooperativeEntityProfile = {
  name: 'Rapti Rural Women Savings & Credit Cooperative Ltd.',
  nameNepali: 'राप्ती ग्रामीण महिला बचत तथा ऋण सहकारी संस्था लि.',
  registrationNo: '215/068/069',
  registrationDateBs: '2068-12-04',
  palikaAddress: 'गढवा गाउँपालिका-२, महदेवा, दाङ',
  totalMembers: 580,
  femaleMembers: 580,
  paidUpShareCapital: 5500000, // 55 Lakhs (55k kitta)
  totalSavingsDeposits: 22000000, // 2.2 Crores
  grossLoanPortfolio: 21000000,
  loanLossProvision: 1200000,
  netLoanPortfolio: 19800000,
  cashAndBankBalances: 6200000,
  fixedAssetsValuation: 2800000,
  otherAssets: 1200000,
  totalLiabilities: 23500000,
  generalReserveFund: 1800000,
  otherStatutoryFunds: 900000,
  netWorth: 6500000, // Assets 30M - Liab 23.5M = 6.5M
  navPerShare: 118.18, // (6.5M / 55k kitta)
};

export const INITIAL_MERGER_STEPS: MergerRegulatoryStep[] = [
  {
    id: 'step-1',
    stepNo: 1,
    titleNe: 'सञ्चालक समितिद्वारा एकीकरण प्रारम्भिक सम्झौता (MoU) अनुमोदन',
    titleEn: 'Board of Directors Preliminary Merger MoU Approval',
    legalBasis: 'सहकारी ऐन २०७४, दफा ८७ (१)',
    isMandatory: true,
    isCompleted: true,
    completedDate: '2081-03-20',
    remarksNe: 'दुवै संस्थाका सञ्चालक समितिद्वारा संयुक्त एकीकरण सम्झौता पत्रमा हस्ताक्षर सम्पन्न।',
  },
  {
    id: 'step-2',
    stepNo: 2,
    titleNe: 'संयुक्त प्राविधिक कार्यदल गठन तथा विस्तृत लेखापरीक्षण (DDA)',
    titleEn: 'Joint Due Diligence Audit (DDA) Taskforce Report',
    legalBasis: 'सहकारी मापदण्ड तथा लेखापरीक्षण कार्यविधि',
    isMandatory: true,
    isCompleted: true,
    completedDate: '2081-04-15',
    remarksNe: 'स्वतन्त्र चार्टर्ड एकाउन्टेन्टबाट डीडीए सम्पत्ति-दायित्व पुनर्मूल्याङ्कन सम्पन्न।',
  },
  {
    id: 'step-3',
    stepNo: 3,
    titleNe: 'विशेष साधारण सभा (SGM) बाट दुई तिहाइ बहुमतले पारित',
    titleEn: 'Special General Meeting 2/3rd Majority Approval',
    legalBasis: 'सहकारी ऐन २०७४, दफा ८७ (२)',
    isMandatory: true,
    isCompleted: true,
    completedDate: '2081-05-10',
    remarksNe: 'दुवै संस्थाको विशेष साधारण सभाबाट ९२% भन्दा बढी बहुमतले एकीकरण प्रस्ताव स्वीकृत।',
  },
  {
    id: 'step-4',
    stepNo: 4,
    titleNe: 'सार्वजनिक ३५ दिने दाबी-विरोध राष्ट्रिय दैनिकमा सूचना प्रकाशन',
    titleEn: '35-day Public Notice in National Daily Newspaper',
    legalBasis: 'सहकारी ऐन २०७४, दफा ८७ (३)',
    isMandatory: true,
    isCompleted: true,
    completedDate: '2081-05-15',
    remarksNe: 'अन्नपूर्ण पोस्ट दैनिकमा ३५ दिने सार्वजनिक सूचना प्रकाशित; कुनै साहुको विरोध नआएको।',
  },
  {
    id: 'step-5',
    stepNo: 5,
    titleNe: 'साहु तथा बचतकर्ताको दायित्व फरफारक तथा संरक्षण ग्यारेन्टी',
    titleEn: 'Creditor & Depositor Protection Guarantee',
    legalBasis: 'सहकारी नियमावली २०७५, नियम ४२',
    isMandatory: true,
    isCompleted: false,
    remarksNe: 'गाभिने संस्थाका सम्पूर्ण बचतकर्ताको निक्षेप र ऋण हिसाब यथावत संरक्षण रहने निर्णय।',
  },
  {
    id: 'step-6',
    stepNo: 6,
    titleNe: 'गाउँपालिका / सहकारी विभागबाट अन्तिम एकीकरण स्वीकृति दर्ता',
    titleEn: 'Final Regulatory Certificate from Department of Cooperatives',
    legalBasis: 'सहकारी ऐन २०७४, दफा ८७ (५)',
    isMandatory: true,
    isCompleted: false,
    remarksNe: 'स्वीकृत एकीकृत विनियम सहित पालिका सहकारी शाखामा अन्तिम प्रमाणपत्रका लागि पेश।',
  },
];

/**
 * Calculates Due Diligence Audit (DDA) Valuation & Share Swap Ratio
 */
export function calculateMergerSwapRatio(params: MergerDdaParams): SwapRatioAnalysis {
  const haircutFactor = 1 - (params.assetHaircutPercent || 0) / 100;

  const targetAdjustedNetWorth = Math.round(params.targetCoop.netWorth * haircutFactor);
  const targetKitta = Math.round(params.targetCoop.paidUpShareCapital / 100);
  const anchorKitta = Math.round(params.anchorCoop.paidUpShareCapital / 100);

  const anchorNav = params.anchorCoop.navPerShare;
  const targetNav = targetAdjustedNetWorth / targetKitta;

  // Swap ratio: Target NAV / Anchor NAV
  const nominalRatio = targetNav / anchorNav;
  const roundedRatio = Math.round(nominalRatio * 100) / 100;

  // Total new shares to be allotted to target shareholders
  const sharesIssuedToTarget = Math.round(targetKitta * roundedRatio);
  const newTotalKitta = anchorKitta + sharesIssuedToTarget;
  const capitalDilutionPercent = Math.round((sharesIssuedToTarget / newTotalKitta) * 1000) / 10;

  const swapSummaryNe = `गाभिने संस्थाको प्रति सेयर मूल्य रु. ${Math.round(targetNav)} र उनको साकोसको प्रति सेयर मूल्य रु. ${Math.round(anchorNav)} का आधारमा सेयर स्वाप अनुपात १ : ${roundedRatio} (अर्थात् गाभिने संस्थाको १०० कित्ता बराबर उनको साकोसको ${Math.round(roundedRatio * 100)} कित्ता सेयर) कायम भएको छ।`;
  const swapSummaryEn = `Based on Target NAV NPR ${Math.round(targetNav)} and Anchor NAV NPR ${Math.round(anchorNav)}, the swap ratio is 1 : ${roundedRatio} (${Math.round(roundedRatio * 100)} Anchor shares per 100 Target shares).`;

  return {
    anchorNavPerShare: Math.round(anchorNav * 100) / 100,
    targetNavPerShare: Math.round(targetNav * 100) / 100,
    nominalSwapRatio: roundedRatio,
    adjustedSwapRatio: roundedRatio,
    sharesIssuedToTarget,
    capitalDilutionPercent,
    swapSummaryNe,
    swapSummaryEn,
  };
}

/**
 * Consolidates Balance Sheets of Anchor and Target entities
 */
export function consolidateBalanceSheet(
  anchor: CooperativeEntityProfile,
  target: CooperativeEntityProfile,
  swap: SwapRatioAnalysis
): ConsolidatedBalanceSheet {
  const newCapitalFromTarget = swap.sharesIssuedToTarget * 100;
  const consolidatedShareCapital = anchor.paidUpShareCapital + newCapitalFromTarget;

  const totalMembers = anchor.totalMembers + target.totalMembers;
  const femaleMembers = anchor.femaleMembers + target.femaleMembers;
  const femaleMembersPercent = Math.round((femaleMembers / totalMembers) * 1000) / 10;

  const consolidatedSavings = anchor.totalSavingsDeposits + target.totalSavingsDeposits;
  const consolidatedNetLoans = anchor.netLoanPortfolio + target.netLoanPortfolio;
  const consolidatedCashAndBank = anchor.cashAndBankBalances + target.cashAndBankBalances;
  const consolidatedFixedAssets = anchor.fixedAssetsValuation + target.fixedAssetsValuation;
  const consolidatedGeneralReserve = anchor.generalReserveFund + target.generalReserveFund;

  const consolidatedTotalAssets =
    anchor.cashAndBankBalances +
    target.cashAndBankBalances +
    anchor.netLoanPortfolio +
    target.netLoanPortfolio +
    anchor.fixedAssetsValuation +
    target.fixedAssetsValuation +
    anchor.otherAssets +
    target.otherAssets;

  const consolidatedTotalLiabilities =
    anchor.totalSavingsDeposits +
    target.totalSavingsDeposits +
    (anchor.totalLiabilities - anchor.totalSavingsDeposits) +
    (target.totalLiabilities - target.totalSavingsDeposits);

  const consolidatedNetWorth = consolidatedTotalAssets - consolidatedTotalLiabilities;

  // Equalization reserve: difference between net worth acquired and capital issued
  const mergerEqualizationReserve = target.netWorth - newCapitalFromTarget;

  const netWorthToAssetsPercent =
    consolidatedTotalAssets > 0 ? Math.round((consolidatedNetWorth / consolidatedTotalAssets) * 1000) / 10 : 0;

  return {
    mergedName: 'Unako Saving and Credit Cooperative Society Ltd. (Amalgamated)',
    mergedNameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि. (एकीकृत संस्था)',
    totalMembers,
    femaleMembersPercent,
    consolidatedShareCapital,
    consolidatedSavings,
    consolidatedNetLoans,
    consolidatedCashAndBank,
    consolidatedFixedAssets,
    consolidatedGeneralReserve,
    consolidatedTotalAssets,
    consolidatedTotalLiabilities,
    consolidatedNetWorth,
    mergerEqualizationReserve,
    netWorthToAssetsPercent,
  };
}

/**
 * Generates Opening COPAS Amalgamation Journal Voucher
 */
export function generateMergerCopasVoucher(
  target: CooperativeEntityProfile,
  swap: SwapRatioAnalysis,
  fiscalYear: string = '2081/82'
): MergerCopasVoucher {
  const newCapital = swap.sharesIssuedToTarget * 100;
  const reserveDiff = target.netWorth - newCapital;

  const entries: MergerCopasVoucher['entries'] = [
    {
      glCode: '1101',
      accountNameNe: 'नगद तथा बैंक मौज्दात (गाभिएको संस्थाबाट प्राप्त)',
      debitAmount: target.cashAndBankBalances,
      creditAmount: 0,
    },
    {
      glCode: '1301',
      accountNameNe: 'कर्जा तथा सापट लगानी (खुद सावाँ दायित्व)',
      debitAmount: target.netLoanPortfolio,
      creditAmount: 0,
    },
    {
      glCode: '1401',
      accountNameNe: 'स्थिर तथा भौतिक सम्पत्ति (पुनर्मूल्याङ्कन बमोजिम)',
      debitAmount: target.fixedAssetsValuation,
      creditAmount: 0,
    },
    {
      glCode: '1501',
      accountNameNe: 'अन्य चालू सम्पत्ति तथा पेश्की हिसाब',
      debitAmount: target.otherAssets,
      creditAmount: 0,
    },
    {
      glCode: '2101',
      accountNameNe: 'सदस्य बचत दायित्व (सम्पूर्ण निक्षेप ग्रहण)',
      debitAmount: 0,
      creditAmount: target.totalSavingsDeposits,
    },
    {
      glCode: '2201',
      accountNameNe: 'अन्य साहु तथा तिर्नुपर्ने दायित्व',
      debitAmount: 0,
      creditAmount: target.totalLiabilities - target.totalSavingsDeposits,
    },
    {
      glCode: '3001',
      accountNameNe: 'चुक्ता सेयर पूँजी (स्वाप अनुपात बमोजिम थप जारी)',
      debitAmount: 0,
      creditAmount: newCapital,
    },
    {
      glCode: '3106',
      accountNameNe: 'एकीकरण समायोजन जगेडा कोष (Merger Capital Reserve)',
      debitAmount: 0,
      creditAmount: Math.max(0, reserveDiff),
    },
  ];

  const totalDebit = entries.reduce((s, e) => s + e.debitAmount, 0);
  const totalCredit = entries.reduce((s, e) => s + e.creditAmount, 0);

  const narrationNe = `सहकारी ऐन २०७४ दफा ८७ अनुसार ${target.nameNepali} लाई यस संस्थामा समाहित गरी सम्पत्ति तथा दायित्व प्रारम्भिक एकीकरण प्रविष्टि।`;

  return {
    voucherNo: `VCH-MRG-${Date.now().toString().slice(-6)}`,
    fiscalYear,
    narrationNe,
    entries,
    totalDebit,
    totalCredit,
  };
}

/**
 * Exports Pre vs Post Merger Comparison to CSV
 */
export function exportMergerComparisonToCsv(
  anchor: CooperativeEntityProfile,
  target: CooperativeEntityProfile,
  cons: ConsolidatedBalanceSheet
): string {
  const headers = [
    'वित्तीय सूचक (Financial Indicator)',
    'उनको साकोस (Anchor)',
    'गाभिने संस्था (Target)',
    'एकीकृत संस्था (Amalgamated Total)',
  ];

  const rows = [
    ['कुल सदस्य संख्या (Total Members)', anchor.totalMembers, target.totalMembers, cons.totalMembers],
    ['चुक्ता सेयर पूँजी (Share Capital)', anchor.paidUpShareCapital, target.paidUpShareCapital, cons.consolidatedShareCapital],
    ['कुल बचत निक्षेप (Savings Deposits)', anchor.totalSavingsDeposits, target.totalSavingsDeposits, cons.consolidatedSavings],
    ['खुद कर्जा लगानी (Net Loan Portfolio)', anchor.netLoanPortfolio, target.netLoanPortfolio, cons.consolidatedNetLoans],
    ['नगद तथा बैंक मौज्दात (Cash & Bank)', anchor.cashAndBankBalances, target.cashAndBankBalances, cons.consolidatedCashAndBank],
    ['स्थिर सम्पत्ति (Fixed Assets)', anchor.fixedAssetsValuation, target.fixedAssetsValuation, cons.consolidatedFixedAssets],
    ['साधारण जगेडा कोष (General Reserve)', anchor.generalReserveFund, target.generalReserveFund, cons.consolidatedGeneralReserve],
    ['कुल सम्पत्ति (Total Assets)', 113500000, 30000000, cons.consolidatedTotalAssets],
    ['खुद सम्पत्ति मूल्य (Net Worth)', anchor.netWorth, target.netWorth, cons.consolidatedNetWorth],
  ];

  return [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
}
