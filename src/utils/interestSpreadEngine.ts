/**
 * Cooperative Act 2074 Section 50 & Department of Cooperatives Directives
 * Interest Rate Spread (ब्याजदर अन्तर) & Reference Rate (सन्दर्भ ब्याजदर) Compliance Engine
 *
 * Statutory Rules:
 * 1. Maximum Interest Spread Rate: 4.75% per annum (ब्याजदर अन्तर अधिकतम ४.७५ प्रतिशत)
 *    Spread = Weighted Average Lending Rate (WALR) - Weighted Average Deposit Rate (WADR)
 * 2. Reference Lending Rate Ceiling: Maximum statutory lending rate set by the
 *    Reference Interest Rate Determination Committee (सन्दर्भ ब्याजदर निर्धारण समिति)
 *    Default statutory cap: 14.75% (or 16.0% depending on government gazette)
 */

export interface ProductRateBucket {
  id: string;
  name: string;
  nameNepali: string;
  category: 'DEPOSIT' | 'LOAN';
  principalBalance: number;
  interestRate: number; // In percentage, e.g. 8.5 for 8.5%
  tenureMonths?: number;
}

export interface InterestSpreadAnalysis {
  totalDepositBalance: number;
  weightedAvgDepositRate: number; // WADR (%)
  totalLoanBalance: number;
  weightedAvgLendingRate: number; // WALR (%)
  spreadRate: number; // Spread = WALR - WADR (%)
  maxAllowedSpread: number; // 4.75%
  referenceRateCeiling: number; // e.g. 14.75%
  isSpreadCompliant: boolean;
  isReferenceRateCompliant: boolean;
  spreadStatus: 'COMPLIANT' | 'WARNING' | 'BREACH';
  breachedLoanProducts: ProductRateBucket[];
  estimatedAnnualDepositCost: number;
  estimatedAnnualLoanYield: number;
  estimatedNetInterestIncome: number;
}

export interface RateSimulationInput {
  productId: string;
  simulatedRate: number;
}

export const STATUTORY_MAX_SPREAD = 4.75;
export const DEFAULT_REFERENCE_RATE_CEILING = 14.75;

/**
 * Default Unako SACCOS baseline product buckets
 */
export const DEFAULT_PRODUCT_BUCKETS: ProductRateBucket[] = [
  // Deposit Products
  {
    id: 'DEP-01',
    name: 'Regular Savings',
    nameNepali: 'साधारण बचत',
    category: 'DEPOSIT',
    principalBalance: 32500000,
    interestRate: 6.5,
  },
  {
    id: 'DEP-02',
    name: 'Monthly Recurring & Group Savings',
    nameNepali: 'मासिक क्रमिक तथा आमा समूह बचत',
    category: 'DEPOSIT',
    principalBalance: 24000000,
    interestRate: 7.5,
  },
  {
    id: 'DEP-03',
    name: '1-Year Fixed Deposit (Mudhati)',
    nameNepali: '१ वर्षे मुद्दती निक्षेप',
    category: 'DEPOSIT',
    principalBalance: 45000000,
    interestRate: 9.5,
    tenureMonths: 12,
  },
  {
    id: 'DEP-04',
    name: '2-Year+ Long Term Mudhati',
    nameNepali: '२ वर्षे तथा दीर्घकालीन मुद्दती',
    category: 'DEPOSIT',
    principalBalance: 28500000,
    interestRate: 10.25,
    tenureMonths: 24,
  },
  {
    id: 'DEP-05',
    name: 'Child & Senior Citizen Welfare Savings',
    nameNepali: 'बाल तथा ज्येष्ठ नागरिक कल्याण बचत',
    category: 'DEPOSIT',
    principalBalance: 12000000,
    interestRate: 8.0,
  },

  // Loan Products
  {
    id: 'LOAN-01',
    name: 'Agriculture & Livestock Loan',
    nameNepali: 'कृषि तथा पशुपालन कर्जा',
    category: 'LOAN',
    principalBalance: 42000000,
    interestRate: 12.5,
  },
  {
    id: 'LOAN-02',
    name: 'Microfinance & Women SHG Group Loan',
    nameNepali: 'लघुवित्त तथा महिला समूह कर्जा',
    category: 'LOAN',
    principalBalance: 28000000,
    interestRate: 13.5,
  },
  {
    id: 'LOAN-03',
    name: 'SME & Business Enterprise Loan',
    nameNepali: 'सानाकक्षा तथा व्यवसाय कर्जा',
    category: 'LOAN',
    principalBalance: 39500000,
    interestRate: 14.0,
  },
  {
    id: 'LOAN-04',
    name: 'Housing & Land Mortgage Loan',
    nameNepali: 'घरजग्गा तथा धितो कर्जा',
    category: 'LOAN',
    principalBalance: 21000000,
    interestRate: 14.5,
  },
  {
    id: 'LOAN-05',
    name: 'Emergency & Social Loan',
    nameNepali: 'आपतकालीन तथा सामाजिक कर्जा',
    category: 'LOAN',
    principalBalance: 6500000,
    interestRate: 11.5,
  },
];

/**
 * Calculates weighted average rate and regulatory spread
 */
export function calculateInterestSpread(
  products: readonly ProductRateBucket[],
  referenceCeiling = DEFAULT_REFERENCE_RATE_CEILING,
  maxAllowedSpread = STATUTORY_MAX_SPREAD
): InterestSpreadAnalysis {
  const depositBuckets = products.filter((p) => p.category === 'DEPOSIT');
  const loanBuckets = products.filter((p) => p.category === 'LOAN');

  const totalDepositBalance = depositBuckets.reduce((sum, p) => sum + p.principalBalance, 0);
  const totalLoanBalance = loanBuckets.reduce((sum, p) => sum + p.principalBalance, 0);

  // Weighted Average Deposit Rate (WADR)
  const depositWeightedSum = depositBuckets.reduce(
    (sum, p) => sum + p.principalBalance * p.interestRate,
    0
  );
  const weightedAvgDepositRate =
    totalDepositBalance > 0 ? Number((depositWeightedSum / totalDepositBalance).toFixed(3)) : 0;

  // Weighted Average Lending Rate (WALR)
  const loanWeightedSum = loanBuckets.reduce(
    (sum, p) => sum + p.principalBalance * p.interestRate,
    0
  );
  const weightedAvgLendingRate =
    totalLoanBalance > 0 ? Number((loanWeightedSum / totalLoanBalance).toFixed(3)) : 0;

  // Spread Rate = WALR - WADR
  const spreadRate = Number((weightedAvgLendingRate - weightedAvgDepositRate).toFixed(3));

  // Reference Rate Ceiling check
  const breachedLoanProducts = loanBuckets.filter((p) => p.interestRate > referenceCeiling);
  const isReferenceRateCompliant = breachedLoanProducts.length === 0;

  const isSpreadCompliant = spreadRate <= maxAllowedSpread;

  let spreadStatus: 'COMPLIANT' | 'WARNING' | 'BREACH' = 'COMPLIANT';
  if (!isSpreadCompliant) {
    spreadStatus = 'BREACH';
  } else if (spreadRate >= maxAllowedSpread - 0.25) {
    // Within 0.25% of cap (i.e. 4.50% - 4.75%)
    spreadStatus = 'WARNING';
  }

  const estimatedAnnualDepositCost = Number(
    ((totalDepositBalance * weightedAvgDepositRate) / 100).toFixed(2)
  );
  const estimatedAnnualLoanYield = Number(
    ((totalLoanBalance * weightedAvgLendingRate) / 100).toFixed(2)
  );
  const estimatedNetInterestIncome = Number(
    (estimatedAnnualLoanYield - estimatedAnnualDepositCost).toFixed(2)
  );

  return {
    totalDepositBalance,
    weightedAvgDepositRate,
    totalLoanBalance,
    weightedAvgLendingRate,
    spreadRate,
    maxAllowedSpread,
    referenceRateCeiling: referenceCeiling,
    isSpreadCompliant,
    isReferenceRateCompliant,
    spreadStatus,
    breachedLoanProducts,
    estimatedAnnualDepositCost,
    estimatedAnnualLoanYield,
    estimatedNetInterestIncome,
  };
}

/**
 * Simulates portfolio spread with updated interest rates
 */
export function simulateRateRevisions(
  baseline: readonly ProductRateBucket[],
  revisions: readonly RateSimulationInput[],
  referenceCeiling = DEFAULT_REFERENCE_RATE_CEILING
): InterestSpreadAnalysis {
  const revisionMap = new Map<string, number>();
  revisions.forEach((r) => revisionMap.set(r.productId, r.simulatedRate));

  const updatedProducts = baseline.map((p) => {
    const revisedRate = revisionMap.get(p.id);
    if (revisedRate !== undefined) {
      return { ...p, interestRate: revisedRate };
    }
    return p;
  });

  return calculateInterestSpread(updatedProducts, referenceCeiling);
}

/**
 * Generates official CSV export string for Department of Cooperatives / Local Government submission
 */
export function generateInterestSpreadCsv(
  analysis: InterestSpreadAnalysis,
  products: readonly ProductRateBucket[],
  coopName = 'उनको बचत तथा ऋण सहकारी संस्था लि.'
): string {
  const lines: string[] = [];
  lines.push(`"${coopName}"`);
  lines.push(`"सहकारी ऐन २०७४ दफा ५० बमोजिम ब्याजदर अन्तर (Spread Rate) तथा सन्दर्भ दर विवरण"`);
  lines.push(`"उत्पादन मिति: ${new Date().toISOString().split('T')[0]}"`);
  lines.push('');
  lines.push(`"भारित औसत कर्जा ब्याजदर (WALR)%","${analysis.weightedAvgLendingRate}%"`);
  lines.push(`"भारित औसत निक्षेप ब्याजदर (WADR)%","${analysis.weightedAvgDepositRate}%"`);
  lines.push(`"ब्याजदर अन्तर (Spread Rate)%","${analysis.spreadRate}%"`);
  lines.push(`"कानूनी अधिकतम सीमा%","${analysis.maxAllowedSpread}%"`);
  lines.push(`"अनुपालन स्थिति","${analysis.isSpreadCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}"`);
  lines.push(`"सरकारी सन्दर्भ ब्याजदर सीमा%","${analysis.referenceRateCeiling}%"`);
  lines.push('');
  lines.push('"क्र.सं.","प्रडक्ट कोड","प्रडक्टको नाम","प्रकार","कुल मौज्दात (NPR)","ब्याजदर %","वार्षिक अनुमानित ब्याज"');

  products.forEach((p, idx) => {
    const annualInterest = (p.principalBalance * p.interestRate) / 100;
    lines.push(
      `${idx + 1},${p.id},"${p.nameNepali} (${p.name})",${p.category},${p.principalBalance},${
        p.interestRate
      }%,${annualInterest.toFixed(2)}`
    );
  });

  return lines.join('\n');
}

/**
 * Downloads the Interest Spread CSV directly
 */
export function downloadInterestSpreadCsv(
  analysis: InterestSpreadAnalysis,
  products: readonly ProductRateBucket[],
  coopName?: string
): void {
  const csv = generateInterestSpreadCsv(analysis, products, coopName);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `UNAKO-INTEREST-SPREAD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
