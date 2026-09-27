/**
 * Liquidity Stress Testing, Contingency Funding Plan (CFP) & Survival Horizon Engine
 * (तरलता तनाव परीक्षण तथा आकस्मिक कोष योजना प्रणाली)
 * 
 * Complies with:
 * - Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) Section 51 (तरलता अनुपात तथा कोष व्यवस्था)
 * - PEARLS Prudential Standards: L1 (तरलता मौज्दात / कुल निक्षेप: १०% - १५%)
 * - Department of Cooperatives Risk Management & Contingency Liquidity Directives
 */

export type StressScenarioId = 'MILD_STRESS' | 'MODERATE_SHOCK' | 'SEVERE_RUN' | 'CUSTOM_SHOCK';

export type StressTestStatus = 'HEALTHY_PASS' | 'MARGINAL_WARNING' | 'CRITICAL_DEFICIT';

export type CfpActivationTier =
  | 'TIER_1_NORMAL_OPERATION'
  | 'TIER_2_SECONDARY_LIQUIDATION'
  | 'TIER_3_CENTRAL_FUND_DRAWDOWN'
  | 'TIER_4_EMERGENCY_RESCUE';

export interface LiquidityAssetBreakdown {
  cashInVault: number; // Tier 1: Cash in hand
  bankCurrentBalances: number; // Tier 1: A-Class Commercial Bank current accounts
  bankSavingsBalances: number; // Tier 1: A-Class Commercial Bank savings accounts
  commercialBankFixedDeposits: number; // Tier 2: 30-90 day Term deposits
  treasuryBills: number; // Tier 2: Gov/NRB T-Bills
  centralLiquidityFundLine: number; // Tier 3: NEFSCUN / NCBL Liquidity credit line
  unencumberedReserveAssets: number; // Tier 4: Standby guarantees / gold reserves
}

export interface StressTestParameters {
  scenarioId: StressScenarioId;
  scenarioNameNp: string;
  scenarioNameEn: string;
  timeHorizonDays: number;
  depositRunRatePercent: number; // e.g. 5%, 15%, 30%
  loanRecoveryHaircutPercent: number; // e.g. 10%, 30%, 60% reduction in incoming loan EMI
  dailyOperatingExpenses: number; // e.g. NPR 25,000 / day
  newDisbursementsHalted: boolean;
}

export interface StressSimulationResult {
  scenario: StressTestParameters;
  totalDeposits: number;
  totalLoansOutstanding: number;
  expectedDailyLoanRepayment: number;
  // Pre-stress
  baselineLiquidAssets: number;
  baselineL1RatioPercent: number;
  // Post-stress Outflows
  stressedDepositWithdrawal: number;
  stressedLoanInflowReduction: number;
  totalStressedOutflow: number;
  // Post-stress Liquidity
  realizableLiquidityAvailable: number;
  postStressNetPosition: number; // Positive = Surplus, Negative = Deficit
  postStressL1RatioPercent: number;
  survivalHorizonDays: number; // Days cooperative survives before liquidity zero
  status: StressTestStatus;
  activatedCfpTier: CfpActivationTier;
  recommendedActions: string[];
}

export const SCENARIO_PRESETS: Record<StressScenarioId, StressTestParameters> = {
  MILD_STRESS: {
    scenarioId: 'MILD_STRESS',
    scenarioNameNp: 'सामान्य मौसमी चाप (Mild Seasonal Pressure)',
    scenarioNameEn: 'Mild Seasonal Deposit Pressure',
    timeHorizonDays: 7,
    depositRunRatePercent: 5,
    loanRecoveryHaircutPercent: 10,
    dailyOperatingExpenses: 35000,
    newDisbursementsHalted: false,
  },
  MODERATE_SHOCK: {
    scenarioId: 'MODERATE_SHOCK',
    scenarioNameNp: 'मध्यम प्रणालीगत चाप (Moderate Systemic Shock)',
    scenarioNameEn: 'Moderate Systemic Liquidity Shock',
    timeHorizonDays: 15,
    depositRunRatePercent: 15,
    loanRecoveryHaircutPercent: 30,
    dailyOperatingExpenses: 35000,
    newDisbursementsHalted: true,
  },
  SEVERE_RUN: {
    scenarioId: 'SEVERE_RUN',
    scenarioNameNp: 'चरम तरलता संकट / आतंक (Severe Cooperative Run)',
    scenarioNameEn: 'Severe Contagion & Panic Run',
    timeHorizonDays: 30,
    depositRunRatePercent: 30,
    loanRecoveryHaircutPercent: 60,
    dailyOperatingExpenses: 35000,
    newDisbursementsHalted: true,
  },
  CUSTOM_SHOCK: {
    scenarioId: 'CUSTOM_SHOCK',
    scenarioNameNp: 'प्रयोगकर्ता अनुकूलित तनाव परिदृश्य (Custom Scenario)',
    scenarioNameEn: 'Custom Defined Stress Scenario',
    timeHorizonDays: 20,
    depositRunRatePercent: 20,
    loanRecoveryHaircutPercent: 40,
    dailyOperatingExpenses: 35000,
    newDisbursementsHalted: true,
  },
};

export const CFP_TIER_CONFIG: Record<
  CfpActivationTier,
  { nameNp: string; nameEn: string; colorClass: string; actionNp: string }
> = {
  TIER_1_NORMAL_OPERATION: {
    nameNp: 'तह १: सामान्य सञ्चालन (Normal Tier 1)',
    nameEn: 'Tier 1: Normal Operations',
    colorClass: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40',
    actionNp: 'दैनिक काउन्टर नगद तथा ' + 'वाणिज्य बैंक खाताबाट सहज भुक्तानी जारी राख्ने।',
  },
  TIER_2_SECONDARY_LIQUIDATION: {
    nameNp: 'तह २: दोस्रो तहको मुद्दती निक्षेप भुक्तानी (Secondary Liquidation)',
    nameEn: 'Tier 2: Short-term Investment Liquidation',
    colorClass: 'text-amber-700 bg-amber-100 dark:bg-amber-900/40',
    actionNp: 'वाणिज्य बैंकहरूमा रहेका मुद्दती निक्षेप पूर्व-परिपक्व भुक्तानी गरी तरलता पूर्ति गर्ने।',
  },
  TIER_3_CENTRAL_FUND_DRAWDOWN: {
    nameNp: 'तह ३: केन्द्रीय तरलता कोष परिचालन (Central Fund Drawdown)',
    nameEn: 'Tier 3: NEFSCUN / NCBL Liquidity Line',
    colorClass: 'text-orange-700 bg-orange-100 dark:bg-orange-900/40',
    actionNp: 'नेफ्स्कून वा राष्ट्रिय सहकारी बैंकको केन्द्रीय तरलता कोषबाट तत्काल आपतकालीन ऋण सुविधा माग गर्ने।',
  },
  TIER_4_EMERGENCY_RESCUE: {
    nameNp: 'तह ४: आपतकालीन उद्धार तथा रजिष्ट्रार समन्वय (Emergency Rescue)',
    nameEn: 'Tier 4: Regulatory Intervention',
    colorClass: 'text-rose-700 bg-rose-100 dark:bg-rose-900/40',
    actionNp: 'सञ्चालक समिति आपतकालीन बैठक, नयाँ कर्जा पूर्ण रोक्का र सहकारी विभाग/रजिष्ट्रारलाई औपचारिक सूचना।',
  },
};

/**
 * Calculates baseline realizable liquidity from tiered assets.
 */
export function calculateTotalLiquidAssets(assets: LiquidityAssetBreakdown): {
  tier1: number;
  tier2: number;
  tier3: number;
  tier4: number;
  totalRealizable: number;
} {
  const tier1 = assets.cashInVault + assets.bankCurrentBalances + assets.bankSavingsBalances;
  // Apply a small 5% liquidation haircut to term deposits for sudden pre-mature liquidation penalty
  const tier2 = Math.round(assets.commercialBankFixedDeposits * 0.95) + assets.treasuryBills;
  const tier3 = assets.centralLiquidityFundLine;
  const tier4 = assets.unencumberedReserveAssets;

  return {
    tier1,
    tier2,
    tier3,
    tier4,
    totalRealizable: tier1 + tier2 + tier3 + tier4,
  };
}

/**
 * Runs a rigorous stress test simulation for a given scenario.
 */
export function simulateLiquidityStress(
  liquidityAssets: LiquidityAssetBreakdown,
  totalDeposits: number,
  totalLoansOutstanding: number,
  params: StressTestParameters
): StressSimulationResult {
  const liquidTiers = calculateTotalLiquidAssets(liquidityAssets);
  const baselineLiquid = liquidTiers.tier1 + liquidTiers.tier2; // PEARLS L1 standard liquid base
  const baselineL1RatioPercent = totalDeposits > 0 ? Math.round((baselineLiquid / totalDeposits) * 1000) / 10 : 0;

  // Stressed Outflows
  const depositWithdrawal = Math.round((totalDeposits * params.depositRunRatePercent) / 100);
  const totalOperatingCosts = params.dailyOperatingExpenses * params.timeHorizonDays;

  // Expected normal loan EMI inflow: assume 3% of portfolio matures/recovers monthly
  const normalDailyLoanRecovery = Math.round((totalLoansOutstanding * 0.03) / 30);
  const normalTotalLoanInflow = normalDailyLoanRecovery * params.timeHorizonDays;
  const stressedLoanInflow = Math.round(normalTotalLoanInflow * (1 - params.loanRecoveryHaircutPercent / 100));
  const stressedLoanInflowReduction = normalTotalLoanInflow - stressedLoanInflow;

  // Net cash requirement over the stress horizon
  const netRequiredCash = depositWithdrawal + totalOperatingCosts - stressedLoanInflow;

  // Realizable liquidity from Tier 1 + Tier 2 + Tier 3
  const availableLiquidity = liquidTiers.totalRealizable;
  const postStressNetPosition = availableLiquidity - netRequiredCash;

  const remainingDeposits = Math.max(1, totalDeposits - depositWithdrawal);
  const remainingLiquidAssets = Math.max(0, postStressNetPosition);
  const postStressL1RatioPercent = Math.round((remainingLiquidAssets / remainingDeposits) * 1000) / 10;

  // Calculate Survival Horizon in Days
  const dailyNetOutflow = Math.max(
    1,
    Math.round(depositWithdrawal / params.timeHorizonDays + params.dailyOperatingExpenses - stressedLoanInflow / params.timeHorizonDays)
  );
  const survivalHorizonDays = Math.min(365, Math.floor(availableLiquidity / dailyNetOutflow));

  // Determine Status & CFP Tier
  let status: StressTestStatus = 'HEALTHY_PASS';
  let activatedCfpTier: CfpActivationTier = 'TIER_1_NORMAL_OPERATION';
  const recommendedActions: string[] = [];

  if (postStressNetPosition < 0 || survivalHorizonDays < params.timeHorizonDays) {
    status = 'CRITICAL_DEFICIT';
    activatedCfpTier = 'TIER_4_EMERGENCY_RESCUE';
    recommendedActions.push('तत्काल सञ्चालक समिति आपतकालीन बैठक आह्वान गरी आकस्मिक तरलता योजना (CFP) लागू गर्ने।');
    recommendedActions.push('सम्पूर्ण नयाँ कर्जा लगानी तथा गैर-अत्यावश्यक प्रशासनिक खर्च रोक्का गर्ने।');
    recommendedActions.push('नेफ्स्कून / राष्ट्रिय सहकारी बैंकको केन्द्रीय तरलता कोषबाट आपतकालीन सापटी माग गर्ने।');
    recommendedActions.push('सहकारी विभाग तथा जिल्ला सहकारी संघलाई तरलता चाप बारे औपचारिक जानकारी गराउने।');
  } else if (postStressL1RatioPercent < 10) {
    status = 'MARGINAL_WARNING';
    activatedCfpTier = 'TIER_3_CENTRAL_FUND_DRAWDOWN';
    recommendedActions.push('PEARLS L1 तरलता अनुपात १०% भन्दा तल झरेकाले सतर्कता तह ३ सक्रिय गर्ने।');
    recommendedActions.push('वाणिज्य बैंकहरूमा रहेका मुद्दती निक्षेप नगदीकरण गरी चालु खातामा सार्ने।');
    recommendedActions.push('नयाँ कर्जा प्रवाह नियन्त्रित गरी बचत फिर्ता प्राथमिकतामा राख्ने।');
  } else if (depositWithdrawal > liquidTiers.tier1) {
    status = 'HEALTHY_PASS';
    activatedCfpTier = 'TIER_2_SECONDARY_LIQUIDATION';
    recommendedActions.push('तह १ नगद सकिए तापनि दोस्रो तहका मुद्दती निक्षेपबाट भुक्तानी सहजै व्यवस्थापन गर्न सकिने।');
    recommendedActions.push('दैनिक निक्षेप संकलन तथा ऋण असुलीलाई थप प्रभावकारी बनाउने।');
  } else {
    status = 'HEALTHY_PASS';
    activatedCfpTier = 'TIER_1_NORMAL_OPERATION';
    recommendedActions.push('संस्थाको तरलता अवस्था सुदृढ छ र सम्भावित चापलाई सहजै धान्न सक्ने सामर्थ्य छ।');
  }

  return {
    scenario: params,
    totalDeposits,
    totalLoansOutstanding,
    expectedDailyLoanRepayment: normalDailyLoanRecovery,
    baselineLiquidAssets: baselineLiquid,
    baselineL1RatioPercent,
    stressedDepositWithdrawal: depositWithdrawal,
    stressedLoanInflowReduction,
    totalStressedOutflow: netRequiredCash,
    realizableLiquidityAvailable: availableLiquidity,
    postStressNetPosition,
    postStressL1RatioPercent,
    survivalHorizonDays,
    status,
    activatedCfpTier,
    recommendedActions,
  };
}

/**
 * Formats official Inspection Stress Test & CFP Board Resolution Minutes.
 */
export function generateStressTestReportMinutes(
  result: StressSimulationResult,
  liquidityAssets: LiquidityAssetBreakdown,
  coopName: string = 'उनको बचत तथा ऋण सहकारी संस्था लि. (Unako SACCOS)'
): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const sc = result.scenario;
  const tier = CFP_TIER_CONFIG[result.activatedCfpTier];

  return `================================================================================
               ${coopName}
            केन्द्रीय कार्यालय: गढवा-५, दाङ | दर्ता नं: ०७१/०७२
    सञ्चालक समिति तथा ALCO तरलता तनाव परीक्षण प्रतिवेदन (LIQUIDITY STRESS TEST REPORT)
================================================================================
परीक्षण मिति: ${dateStr}
परीक्षण परिदृश्य: ${sc.scenarioNameNp} (${sc.scenarioNameEn})
विश्लेषण समयावधि: ${sc.timeHorizonDays} दिन (Time Horizon)
वर्तमान कुल निक्षेप दायित्व: रु. ${result.totalDeposits.toLocaleString('en-IN')}
वर्तमान कुल लगानीमा रहेको कर्जा: रु. ${result.totalLoansOutstanding.toLocaleString('en-IN')}

[ १. संस्थाको हालको तरलता संरचना (AVAILABLE LIQUIDITY TIERS) ]
१. तह १: तत्काल उपलब्ध नगद तथा बैंक मौज्दात : रु. ${(liquidityAssets.cashInVault + liquidityAssets.bankCurrentBalances + liquidityAssets.bankSavingsBalances).toLocaleString('en-IN')}
   - तिजोरी नगद मौज्दात                     : रु. ${liquidityAssets.cashInVault.toLocaleString('en-IN')}
   - वाणिज्य बैंक चालु तथा बचत खाता         : रु. ${(liquidityAssets.bankCurrentBalances + liquidityAssets.bankSavingsBalances).toLocaleString('en-IN')}
२. तह २: अल्पकालीन मुद्दती तथा ट्रेजरी बिल्स : रु. ${(liquidityAssets.commercialBankFixedDeposits + liquidityAssets.treasuryBills).toLocaleString('en-IN')}
३. तह ३: केन्द्रीय तरलता कोष स्वीकृत ऋण लाइन: रु. ${liquidityAssets.centralLiquidityFundLine.toLocaleString('en-IN')}
४. तह ४: आकस्मिक सञ्चिति तथा सुरक्षण सम्पत्ति: रु. ${liquidityAssets.unencumberedReserveAssets.toLocaleString('en-IN')}
--------------------------------------------------------------------------------
कुल परिचालनयोग्य तरलता (Total Realizable)     : रु. ${result.realizableLiquidityAvailable.toLocaleString('en-IN')}
सुरुको PEARLS L1 तरलता अनुपात                : ${result.baselineL1RatioPercent}% (मापदण्ड: १०%-१५%)

[ २. तनाव परीक्षण (STRESS SHOCK) को प्रभाव ]
१. निक्षेप फिर्ता चाप दर (${sc.depositRunRatePercent}% निक्षेप माग) : रु. ${result.stressedDepositWithdrawal.toLocaleString('en-IN')}
२. कर्जा असुलीमा कमी (${sc.loanRecoveryHaircutPercent}% असुली ढिलाइ)  : रु. ${result.stressedLoanInflowReduction.toLocaleString('en-IN')}
३. दैनिक प्रशासनिक खर्च (${sc.timeHorizonDays} दिन)          : रु. ${(sc.dailyOperatingExpenses * sc.timeHorizonDays).toLocaleString('en-IN')}
--------------------------------------------------------------------------------
कुल आवश्यक नगद बहिर्गमन (Stressed Cash Outflow): रु. ${result.totalStressedOutflow.toLocaleString('en-IN')}
तनाव पछिको खुद तरलता मौज्दात (Surplus/Deficit) : रु. ${result.postStressNetPosition.toLocaleString('en-IN')}
तनाव पछिको PEARLS L1 अनुपात                    : ${result.postStressL1RatioPercent}%
तरलता धान्न सक्ने अवधि (Survival Horizon)       : ${result.survivalHorizonDays} दिन

[ ३. आकस्मिक कोष योजना (CFP) सक्रियता तथा निष्कर्ष ]
परीक्षण नतिजा स्थिति: ${result.status === 'HEALTHY_PASS' ? 'सफल (HEALTHY PASS)' : result.status === 'MARGINAL_WARNING' ? 'चेतावनी (MARGINAL WARNING)' : 'अभाव (CRITICAL DEFICIT)'}
सक्रिय आकस्मिक तह   : ${tier.nameNp}
कारवाही मार्गदर्शन : ${tier.actionNp}

[ ४. ALCO समिति तथा व्यवस्थापनको सिफारिसहरू ]
${result.recommendedActions.map((act, idx) => `  ${idx + 1}. ${act}`).join('\n')}

हस्ताक्षर (ALCO संयोजक / प्रबन्धक): ___________________    हस्ताक्षर (लेखा समिति): ___________________
================================================================================`;
}

/**
 * Realistic default Unako SACCOS liquid asset holdings.
 */
export const DEFAULT_UNAKO_LIQUIDITY_ASSETS: LiquidityAssetBreakdown = {
  cashInVault: 3450000, // 34.5 Lakhs in vault
  bankCurrentBalances: 8500000, // 85 Lakhs in commercial bank current
  bankSavingsBalances: 14200000, // 1.42 Crore in commercial bank savings
  commercialBankFixedDeposits: 25000000, // 2.5 Crore in 90-day bank FDs
  treasuryBills: 5000000, // 50 Lakhs in T-Bills
  centralLiquidityFundLine: 20000000, // 2 Crore NEFSCUN credit line
  unencumberedReserveAssets: 10000000, // 1 Crore unencumbered gold/liquid reserves
};
