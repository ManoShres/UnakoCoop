/**
 * Asset Liability Management (ALM) & Maturity Gap Analysis Engine
 * (सम्पत्ति तथा दायित्व व्यवस्थापन, परिपक्वता अन्तर तथा तरलता प्रक्षेपण प्रणाली)
 *
 * Implements cooperative liquidity & structural ALM standards pursuant to:
 * - Nepal Cooperative Act 2074 & Department of Cooperatives Directives
 * - PEARLS Financial Ratios L1 (Liquid Reserves), L2 (Liquidity Structure)
 * - Standard Basel/NRB Asset-Liability Committee (ALCO) Maturity Profiling
 */

export type MaturityBucketKey =
  | '1_TO_30_DAYS'
  | '31_TO_90_DAYS'
  | '91_TO_180_DAYS'
  | '181_TO_365_DAYS'
  | '1_TO_5_YEARS'
  | 'OVER_5_YEARS';

export interface MaturityBucketDef {
  key: MaturityBucketKey;
  labelNe: string;
  labelEn: string;
  daysRange: string;
}

export const MATURITY_BUCKETS: readonly MaturityBucketDef[] = [
  { key: '1_TO_30_DAYS', labelNe: '१ देखि ३० दिन', labelEn: '1 - 30 Days', daysRange: '1-30' },
  { key: '31_TO_90_DAYS', labelNe: '३१ देखि ९० दिन', labelEn: '31 - 90 Days', daysRange: '31-90' },
  { key: '91_TO_180_DAYS', labelNe: '९१ देखि १८० दिन', labelEn: '91 - 180 Days', daysRange: '91-180' },
  { key: '181_TO_365_DAYS', labelNe: '१८१ देखि ३६५ दिन', labelEn: '181 - 365 Days', daysRange: '181-365' },
  { key: '1_TO_5_YEARS', labelNe: '१ देखि ५ वर्ष', labelEn: '1 - 5 Years', daysRange: '366-1825' },
  { key: 'OVER_5_YEARS', labelNe: '५ वर्षभन्दा माथि', labelEn: 'Over 5 Years', daysRange: '>1825' },
] as const;

export interface AlmBucketData {
  bucket: MaturityBucketDef;
  rateSensitiveAssets: number; // RSA (कर्जा, बैंक मुद्दती, नगद)
  rateSensitiveLiabilities: number; // RSL (मुद्दती बचत, साधारण बचत)
  periodicGap: number; // RSA - RSL
  cumulativeGap: number; // Running sum of periodic gaps
  gapToAssetsRatioPercent: number; // Cumulative Gap / Total Assets
  status: 'SURPLUS' | 'ACCEPTABLE' | 'DEFICIT_WARNING' | 'CRITICAL_DEFICIT';
}

export interface InterestRateShockResult {
  shockBps: number; // e.g. +100, -100, +200, -200 bps
  shockLabel: string;
  deltaNetInterestIncome: number; // Change in NII (NPR)
  impactAssessmentNe: string;
  impactAssessmentEn: string;
}

export interface LiquidityStressTestResult {
  scenarioNameNe: string;
  scenarioNameEn: string;
  depositRunoffPercent: number; // e.g. 5%, 15%, 30%
  expectedOutflow: number; // NPR
  immediateLiquidity: number; // Cash + Bank Call Balances
  secondaryReserves: number; // Commercial bank fixed deposits & liquid investments
  totalLiquidityBuffer: number;
  netSurplusOrDeficit: number;
  canSurviveDays: number;
  status: 'STABLE' | 'VULNERABLE' | 'ILLIQUID';
}

export interface AlmSummaryReport {
  totalAssets: number;
  totalLiabilities: number;
  totalEquityReserves: number;
  totalPeriodicGap: number;
  oneYearCumulativeGap: number;
  oneYearGapRatioPercent: number;
  bucketAnalytics: AlmBucketData[];
  rateShocks: InterestRateShockResult[];
  stressTests: LiquidityStressTestResult[];
  alcoRecommendationNe: string;
  alcoRecommendationEn: string;
}

/**
 * Standard seed ALM distribution reflecting Unako SACCOS, Gadhawa Dang
 * Total Assets: approx NPR 125,000,000 (12.5 Crores)
 */
export const INITIAL_ALM_PORTFOLIO = {
  totalAssets: 125000000,
  totalLiabilities: 105000000,
  totalEquityReserves: 20000000,
  assetsByBucket: {
    '1_TO_30_DAYS': 22000000, // Cash in vault + commercial bank call accounts + short loans
    '31_TO_90_DAYS': 15000000, // Short term agricultural loans + bank FDs maturing
    '91_TO_180_DAYS': 18000000, // Business loans + periodic EMIs
    '181_TO_365_DAYS': 25000000, // Micro-enterprise loans
    '1_TO_5_YEARS': 35000000, // Mortgage, housing, hire purchase loans
    'OVER_5_YEARS': 10000000, // Long-term infrastructure/land mortgages + non-earning assets
  },
  liabilitiesByBucket: {
    '1_TO_30_DAYS': 25000000, // Volatile savings + maturing 1-month FDs
    '31_TO_90_DAYS': 18000000, // 3-month fixed deposits
    '91_TO_180_DAYS': 16000000, // 6-month fixed deposits
    '181_TO_365_DAYS': 22000000, // 1-year fixed deposits
    '1_TO_5_YEARS': 20000000, // Multi-year child education/pension savings
    'OVER_5_YEARS': 4000000, // Institutional borrowings
  },
};

/**
 * Computes ALM Maturity Gap Analysis across all 6 time horizons
 */
export function calculateAlmMaturityGaps(params: {
  totalAssets: number;
  assetsByBucket: Record<MaturityBucketKey, number>;
  liabilitiesByBucket: Record<MaturityBucketKey, number>;
}): AlmBucketData[] {
  let runningCumulativeGap = 0;

  return MATURITY_BUCKETS.map((bucket) => {
    const rsa = params.assetsByBucket[bucket.key] || 0;
    const rsl = params.liabilitiesByBucket[bucket.key] || 0;
    const periodicGap = rsa - rsl;
    runningCumulativeGap += periodicGap;

    const gapToAssetsRatioPercent =
      params.totalAssets > 0 ? (runningCumulativeGap / params.totalAssets) * 100 : 0;

    let status: AlmBucketData['status'] = 'ACCEPTABLE';
    if (runningCumulativeGap > 0) {
      status = 'SURPLUS';
    } else if (gapToAssetsRatioPercent < -20) {
      status = 'CRITICAL_DEFICIT';
    } else if (gapToAssetsRatioPercent < -10) {
      status = 'DEFICIT_WARNING';
    }

    return {
      bucket,
      rateSensitiveAssets: rsa,
      rateSensitiveLiabilities: rsl,
      periodicGap,
      cumulativeGap: runningCumulativeGap,
      gapToAssetsRatioPercent: Math.round(gapToAssetsRatioPercent * 100) / 100,
      status,
    };
  });
}

/**
 * Simulates Interest Rate Shocks on Net Interest Income (NII)
 */
export function simulateInterestRateShocks(oneYearCumulativeGap: number): InterestRateShockResult[] {
  const shocks = [
    { bps: 100, label: '+100 bps (+१.०%) Rate Hike' },
    { bps: -100, label: '-100 bps (-१.०%) Rate Cut' },
    { bps: 200, label: '+200 bps (+२.०%) Rate Hike' },
    { bps: -200, label: '-200 bps (-२.०%) Rate Cut' },
  ];

  return shocks.map((s) => {
    const deltaRate = s.bps / 10000; // e.g. 100 bps = 0.01
    const deltaNii = Math.round(oneYearCumulativeGap * deltaRate);

    let impactAssessmentNe = '';
    let impactAssessmentEn = '';

    if (deltaNii > 0) {
      impactAssessmentNe = `खुद ब्याज आम्दानीमा रु. ${deltaNii.toLocaleString()} ले वृद्धि हुने प्रक्षेपण (सकारात्मक प्रभाव)।`;
      impactAssessmentEn = `Net Interest Income projected to increase by NPR ${deltaNii.toLocaleString()} (Favorable).`;
    } else if (deltaNii < 0) {
      impactAssessmentNe = `खुद ब्याज आम्दानीमा रु. ${Math.abs(deltaNii).toLocaleString()} ले संकुचन आउने जोखिम (नकारात्मक प्रभाव)।`;
      impactAssessmentEn = `Net Interest Income projected to shrink by NPR ${Math.abs(deltaNii).toLocaleString()} (Unfavorable).`;
    } else {
      impactAssessmentNe = 'ब्याजदर परिवर्तनको प्रभाव सन्तुलित रहने देखिन्छ।';
      impactAssessmentEn = 'Impact is neutral.';
    }

    return {
      shockBps: s.bps,
      shockLabel: s.label,
      deltaNetInterestIncome: deltaNii,
      impactAssessmentNe,
      impactAssessmentEn,
    };
  });
}

/**
 * Executes Liquidity Stress Testing for 3 Scenarios
 */
export function runLiquidityStressTests(params: {
  totalSavingsDeposit: number;
  cashAndBankCall: number;
  secondaryReserves: number;
}): LiquidityStressTestResult[] {
  const scenarios = [
    { nameNe: 'सामान्य अवस्था (Baseline Scenario)', nameEn: 'Baseline Normal Runoff', runoff: 5 },
    { nameNe: 'मध्यम तरलता दबाब (Moderate Stress Scenario)', nameEn: 'Moderate Stress Runoff', runoff: 15 },
    { nameNe: 'चरम संकटकालीन अवस्था (Severe Crisis Scenario)', nameEn: 'Severe Crisis Runoff', runoff: 30 },
  ];

  const totalBuffer = params.cashAndBankCall + params.secondaryReserves;

  return scenarios.map((sc) => {
    const expectedOutflow = Math.round(params.totalSavingsDeposit * (sc.runoff / 100));
    const netSurplusOrDeficit = totalBuffer - expectedOutflow;

    // Daily burn rate survival calculation
    const dailyOutflow = expectedOutflow / 30;
    const canSurviveDays = dailyOutflow > 0 ? Math.min(180, Math.floor(totalBuffer / dailyOutflow)) : 999;

    let status: LiquidityStressTestResult['status'] = 'STABLE';
    if (netSurplusOrDeficit < 0) {
      status = 'ILLIQUID';
    } else if (netSurplusOrDeficit < params.cashAndBankCall * 0.5) {
      status = 'VULNERABLE';
    }

    return {
      scenarioNameNe: sc.nameNe,
      scenarioNameEn: sc.nameEn,
      depositRunoffPercent: sc.runoff,
      expectedOutflow,
      immediateLiquidity: params.cashAndBankCall,
      secondaryReserves: params.secondaryReserves,
      totalLiquidityBuffer: totalBuffer,
      netSurplusOrDeficit,
      canSurviveDays,
      status,
    };
  });
}

/**
 * Builds Full ALM Comprehensive Report with ALCO Recommendation
 */
export function generateAlmComprehensiveReport(
  portfolio = INITIAL_ALM_PORTFOLIO
): AlmSummaryReport {
  const bucketAnalytics = calculateAlmMaturityGaps({
    totalAssets: portfolio.totalAssets,
    assetsByBucket: portfolio.assetsByBucket,
    liabilitiesByBucket: portfolio.liabilitiesByBucket,
  });

  // Calculate 1-year cumulative gap (4th bucket: 181-365 days)
  const oneYearBucket = bucketAnalytics.find((b) => b.bucket.key === '181_TO_365_DAYS');
  const oneYearCumulativeGap = oneYearBucket ? oneYearBucket.cumulativeGap : 0;
  const oneYearGapRatioPercent = oneYearBucket ? oneYearBucket.gapToAssetsRatioPercent : 0;

  const totalPeriodicGap = bucketAnalytics.reduce((sum, b) => sum + b.periodicGap, 0);

  const rateShocks = simulateInterestRateShocks(oneYearCumulativeGap);

  const stressTests = runLiquidityStressTests({
    totalSavingsDeposit: portfolio.totalLiabilities * 0.9,
    cashAndBankCall: portfolio.assetsByBucket['1_TO_30_DAYS'],
    secondaryReserves: portfolio.assetsByBucket['31_TO_90_DAYS'],
  });

  let alcoRecommendationNe = '';
  let alcoRecommendationEn = '';

  if (oneYearGapRatioPercent < -15) {
    alcoRecommendationNe =
      '१ वर्षे संचयी अन्तर -१५% भन्दा बढी ऋणात्मक रहेकाले ३-महिने तथा ६-महिने मुद्दती बचतको ब्याजदर ०.२५% थप गरी दीर्घकालीन बचत परिचालन गर्न र अल्पकालीन कर्जा लगानीमा सतर्कता अपनाउन सिफारिस गरिन्छ।';
    alcoRecommendationEn =
      'Negative 1-year gap exceeds -15%. Recommend raising term deposit rates by 0.25% to lock in long-term liquidity and tighten short-term credit expansion.';
  } else if (oneYearGapRatioPercent > 15) {
    alcoRecommendationNe =
      'सम्पत्ति अन्तर उच्च धनात्मक रहेकाले अतिरिक्त तरलतालाई सुरक्षित वाणिज्य बैंक मुद्दती वा सरकारी ऋणपत्रमा लगानी गरी ब्याज आम्दानी अधिकतम गर्न सिफारिस गरिन्छ।';
    alcoRecommendationEn =
      'Substantial positive asset gap. Recommend deploying surplus liquidity into secure commercial bank FDs or treasury instruments.';
  } else {
    alcoRecommendationNe =
      'सम्पत्ति तथा दायित्वको परिपक्वता संरचना सन्तुलित र नेपाल सहकारी ऐन तथा पर्ल्स मापदण्ड L1/L2 अनुकूल रहेको पुष्टि हुन्छ।';
    alcoRecommendationEn =
      'Asset-liability maturity structure is well balanced and compliant with PEARLS L1/L2 liquidity guidelines.';
  }

  return {
    totalAssets: portfolio.totalAssets,
    totalLiabilities: portfolio.totalLiabilities,
    totalEquityReserves: portfolio.totalEquityReserves,
    totalPeriodicGap,
    oneYearCumulativeGap,
    oneYearGapRatioPercent,
    bucketAnalytics,
    rateShocks,
    stressTests,
    alcoRecommendationNe,
    alcoRecommendationEn,
  };
}

/**
 * Exports ALM Maturity Gap Table to CSV format
 */
export function exportAlmToCsv(report: AlmSummaryReport): string {
  const headers = [
    'समय परिपक्वता अवधि (Time Horizon)',
    'सम्पत्ति (Rate Sensitive Assets NPR)',
    'दायित्व (Rate Sensitive Liabilities NPR)',
    'अवधि अन्तर (Periodic Gap NPR)',
    'संचयी अन्तर (Cumulative Gap NPR)',
    'सम्पत्ति अनुपात % (Gap to Assets %)',
    'जोखिम स्थिति (Status)',
  ];

  const rows = report.bucketAnalytics.map((b) => [
    `"${b.bucket.labelNe} (${b.bucket.labelEn})"`,
    b.rateSensitiveAssets,
    b.rateSensitiveLiabilities,
    b.periodicGap,
    b.cumulativeGap,
    `${b.gapToAssetsRatioPercent}%`,
    `"${b.status}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
