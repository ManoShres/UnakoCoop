/**
 * Statutory Loan Rescheduling and Restructuring Engine (कर्जा पुनर्तालिकीकरण तथा पुनर्संरचना व्यवस्थापन)
 * Unako SACCOS (उनको बचत तथा ऋण सहकारी संस्था लि., गढवा-५, दाङ)
 * Compliant with Nepal Cooperative Act 2074 (सहकारी ऐन २०७४), Rules 2075,
 * and Department of Cooperatives / NRB Microfinance Supervisory Directives.
 */

import { Loan, Member, LoanProvisionCategory } from '../types';

/**
 * Statutory minimum threshold of overdue accrued interest that must be paid in cash
 * before rescheduling / restructuring can legally take effect (25% rule).
 */
export const MIN_OVERDUE_INTEREST_PAYMENT_RATIO = 0.25;

export type DistressReasonCategory =
  | 'FLOOD_NATURAL_DISASTER'
  | 'AGRICULTURAL_LIVESTOCK_LOSS'
  | 'EPIDEMIC_HEALTH_EMERGENCY'
  | 'BUSINESS_DOWNTURN_MARKET_CRISIS'
  | 'FORCE_MAJEURE_OTHER';

export const DISTRESS_REASONS: Record<
  DistressReasonCategory,
  { labelNepali: string; labelEnglish: string; description: string }
> = {
  FLOOD_NATURAL_DISASTER: {
    labelNepali: 'प्राकृतिक प्रकोप (बाढी, पहिरो, आगलागी)',
    labelEnglish: 'Natural Disaster (Flood, Landslide, Fire)',
    description: 'राप्ती नदी वा स्थानीय बाढी, पहिरो, भूकम्प वा आगलागीबाट भएको क्षति।',
  },
  AGRICULTURAL_LIVESTOCK_LOSS: {
    labelNepali: 'बालीनाली नोक्सानी वा पशुधन क्षति',
    labelEnglish: 'Crop Failure / Livestock Mortality',
    description: 'कीरा, खडेरी, रोग वा आकस्मिक महामारीबाट पशु वा खेतीपातीमा पुगेको हानी।',
  },
  EPIDEMIC_HEALTH_EMERGENCY: {
    labelNepali: 'महामारी वा गम्भीर स्वास्थ्य संकट',
    labelEnglish: 'Epidemic / Critical Health Emergency',
    description: 'ऋणी वा परिवारको मुख्य सदस्यको गम्भीर उपचार वा दुर्घटना खर्च।',
  },
  BUSINESS_DOWNTURN_MARKET_CRISIS: {
    labelNepali: 'व्यापार मन्दी तथा बजार संकट',
    labelEnglish: 'Business Downturn & Market Slump',
    description: 'बजार शिथिलता, कच्चा पदार्थ अभाव वा बिक्री ठप्प भई उत्पन्न नगद प्रवाह संकट।',
  },
  FORCE_MAJEURE_OTHER: {
    labelNepali: 'अन्य काबु बाहिरको परिस्थिति',
    labelEnglish: 'Other Unforeseen Force Majeure',
    description: 'ऋणीको नियन्त्रण बाहिरको मनासिब र प्रमाणित विशेष कारण।',
  },
};

export interface ReschedulingEligibility {
  readonly isEligible: boolean;
  readonly reasons: readonly string[];
  readonly minRequiredInterestPayment: number;
  readonly actualInterestPaid: number;
  readonly interestPaymentRatio: number;
  readonly shortfallAmount: number;
}

export interface ReschedulingTerms {
  readonly restructuredDate: string;
  readonly restructuredPrincipal: number;
  readonly annualInterestRate: number;
  readonly extendedTenureMonths: number;
  readonly moratoriumMonths: number;
  readonly moratoriumInterestHandling: 'PAY_INTEREST_MONTHLY' | 'CAPITALIZE_TO_PRINCIPAL';
  readonly distressReason: DistressReasonCategory;
  readonly distressDescription: string;
  readonly revivalPlanSummary: string;
  readonly creditCommitteeMinuteNo: string;
  readonly bodDecisionMinuteNo: string;
  readonly officerName: string;
}

export interface AmortizationScheduleEntry {
  readonly installmentNo: number;
  readonly dueDate: string;
  readonly isMoratorium: boolean;
  readonly openingBalance: number;
  readonly principalPayment: number;
  readonly interestPayment: number;
  readonly totalEmi: number;
  readonly closingBalance: number;
}

export interface ReschedulingDeed {
  readonly deedNo: string;
  readonly loanId: string;
  readonly loanNo: string;
  readonly borrowerName: string;
  readonly borrowerMemberNo: string;
  readonly citizenshipNo: string;
  readonly address: string;
  readonly originalPrincipal: number;
  readonly restructuredPrincipal: number;
  readonly annualInterestRate: number;
  readonly extendedTenureMonths: number;
  readonly moratoriumMonths: number;
  readonly monthlyEmi: number;
  readonly distressReasonNepali: string;
  readonly distressDescription: string;
  readonly revivalPlanSummary: string;
  readonly creditCommitteeMinuteNo: string;
  readonly bodDecisionMinuteNo: string;
  readonly executionDateNepali: string;
  readonly schedule: readonly AmortizationScheduleEntry[];
  readonly statutoryCitation: string;
  readonly bodyNepaliText: string;
}

export interface RescheduledLoanRecord {
  readonly deedNo: string;
  readonly loanNo: string;
  readonly memberNo: string;
  readonly memberName: string;
  readonly distressReason: DistressReasonCategory;
  readonly oldPrincipal: number;
  readonly newPrincipal: number;
  readonly newRate: number;
  readonly extendedTenure: number;
  readonly moratoriumMonths: number;
  readonly revisedEmi: number;
  readonly bodMinuteNo: string;
  readonly restructuredDate: string;
  readonly status: 'ACTIVE_PROBATION' | 'RESTORED_GOOD' | 'DEFAULTED';
}

/**
 * Calculates 25% minimum required overdue interest payment.
 */
export function calculateMinInterestPayment(accruedInterest: number): number {
  if (accruedInterest <= 0) return 0;
  return Math.round(accruedInterest * MIN_OVERDUE_INTEREST_PAYMENT_RATIO);
}

/**
 * Verifies regulatory eligibility for statutory loan rescheduling and restructuring.
 */
export function checkReschedulingEligibility(
  remainingBalance: number,
  accruedInterest: number,
  interestPaid: number,
  distressReason?: DistressReasonCategory,
  hasRevivalPlan = false
): ReschedulingEligibility {
  const reasons: string[] = [];
  const minRequiredInterestPayment = calculateMinInterestPayment(accruedInterest);
  const actualInterestPaid = Math.max(0, interestPaid);
  const shortfallAmount = Math.max(0, minRequiredInterestPayment - actualInterestPaid);
  const interestPaymentRatio =
    accruedInterest > 0 ? actualInterestPaid / accruedInterest : 1;

  if (remainingBalance <= 0) {
    reasons.push('बाँकी साँवा शून्य रहेकोले पुनर्तालिकीकरण आवश्यक छैन। (No remaining principal)');
  }

  if (actualInterestPaid < minRequiredInterestPayment) {
    reasons.push(
      `सहकारी ऐन अनुसार पाकेको ब्याजको कम्तीमा २५% (रु. ${minRequiredInterestPayment.toLocaleString()}) चुक्ता हुनुपर्छ। रु. ${shortfallAmount.toLocaleString()} अपुग छ।`
    );
  }

  if (!distressReason) {
    reasons.push('प्राकृतिक प्रकोप, रोग वा मन्दी जस्ता मनासिब कारण प्रमाणित भएको हुनुपर्छ। (Distress reason required)');
  }

  if (!hasRevivalPlan) {
    reasons.push('ऋणी सदस्यले आगामी आम्दानी र व्यवसाय पुनरुत्थान कार्ययोजना पेश गरेको हुनुपर्छ। (Revival plan required)');
  }

  const isEligible = reasons.length === 0;

  return {
    isEligible,
    reasons,
    minRequiredInterestPayment,
    actualInterestPaid,
    interestPaymentRatio,
    shortfallAmount,
  };
}

/**
 * Computes revised reducing balance amortization schedule with optional grace/moratorium period.
 */
export function calculateRescheduledAmortization(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  moratoriumMonths = 0,
  startDateBS = '2081/07/01',
  interestHandling: 'PAY_INTEREST_MONTHLY' | 'CAPITALIZE_TO_PRINCIPAL' = 'PAY_INTEREST_MONTHLY'
): AmortizationScheduleEntry[] {
  if (principal <= 0 || tenureMonths <= 0) return [];

  const safeMoratorium = Math.min(Math.max(0, moratoriumMonths), tenureMonths - 1);
  const amortizingMonths = tenureMonths - safeMoratorium;
  const monthlyRate = annualRate / 100 / 12;

  // Standard Reducing Balance EMI calculation: P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyEmi =
    monthlyRate > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, amortizingMonths)) /
        (Math.pow(1 + monthlyRate, amortizingMonths) - 1)
      : principal / amortizingMonths;

  const schedule: AmortizationScheduleEntry[] = [];
  let currentBalance = principal;

  // Split start date to increment months simply
  const parts = startDateBS.split('/');
  const startYear = parseInt(parts[0] || '2081', 10);
  const startMonth = parseInt(parts[1] || '7', 10);
  const startDay = parseInt(parts[2] || '1', 10);

  for (let m = 1; m <= tenureMonths; m++) {
    // Generate BS installment date
    const totalM = startMonth - 1 + (m - 1);
    const yr = startYear + Math.floor(totalM / 12);
    const mo = (totalM % 12) + 1;
    const dueDate = `${yr}/${String(mo).padStart(2, '0')}/${String(startDay).padStart(2, '0')}`;

    const isMoratorium = m <= safeMoratorium;

    if (isMoratorium) {
      const interest = Math.round(currentBalance * monthlyRate);
      if (interestHandling === 'PAY_INTEREST_MONTHLY') {
        schedule.push({
          installmentNo: m,
          dueDate,
          isMoratorium: true,
          openingBalance: currentBalance,
          principalPayment: 0,
          interestPayment: interest,
          totalEmi: interest,
          closingBalance: currentBalance,
        });
      } else {
        // Capitalize
        const newBal = currentBalance + interest;
        schedule.push({
          installmentNo: m,
          dueDate,
          isMoratorium: true,
          openingBalance: currentBalance,
          principalPayment: 0,
          interestPayment: interest,
          totalEmi: 0,
          closingBalance: newBal,
        });
        currentBalance = newBal;
      }
    } else {
      const interestPayment = Math.round(currentBalance * monthlyRate);
      const isLastMonth = m === tenureMonths;
      const principalPayment = isLastMonth ? currentBalance : Math.round(monthlyEmi - interestPayment);
      const closingBalance = Math.max(0, currentBalance - principalPayment);
      const totalEmi = principalPayment + interestPayment;

      schedule.push({
        installmentNo: m,
        dueDate,
        isMoratorium: false,
        openingBalance: currentBalance,
        principalPayment,
        interestPayment,
        totalEmi,
        closingBalance,
      });

      currentBalance = closingBalance;
    }
  }

  return schedule;
}

/**
 * Computes statutory loan loss provision percentage upon restructuring.
 * Rescheduled loans carry a minimum 12.5% provision (or 25% if from Doubtful/Bad)
 * for a minimum probation period of 6 months.
 */
export function calculateRestructuredProvision(
  principal: number,
  previousCategory: LoanProvisionCategory
): {
  statutoryProvisionPercent: number;
  provisionAmount: number;
  probationMonths: number;
} {
  const statutoryProvisionPercent =
    previousCategory === 'DOUBTFUL' || previousCategory === 'BAD' ? 25.0 : 12.5;
  const provisionAmount = Math.round(principal * (statutoryProvisionPercent / 100));

  return {
    statutoryProvisionPercent,
    provisionAmount,
    probationMonths: 6,
  };
}

/**
 * Generates official bilingual legal Restructuring Deed (पुनर्तालिकीकरण तथा पुनर्संरचना तमसुक सम्झौता)
 */
export function generateReschedulingDeed(
  loan: Loan,
  member: Member,
  terms: ReschedulingTerms,
  schedule: readonly AmortizationScheduleEntry[]
): ReschedulingDeed {
  const deedNo = `TAMASSUK-RESTRUCT-${terms.restructuredDate.replace(/\//g, '')}-${loan.loanNo.slice(-4)}`;
  const reasonMeta = DISTRESS_REASONS[terms.distressReason] ?? {
    labelNepali: 'मनासिब कारण',
    labelEnglish: 'Valid Distress',
  };

  const firstAmortEntry = schedule.find((s) => !s.isMoratorium) ?? schedule[0];
  const monthlyEmi = firstAmortEntry ? firstAmortEntry.totalEmi : loan.monthlyEmi;

  const statutoryCitation = 'नेपाल सहकारी ऐन २०७४, नियमावली २०७५ तथा सहकारी विभागको कर्जा पुनर्संरचना सम्बन्धी निर्देशन';

  const bodyNepaliText = `
लिखितम् उनको बचत तथा ऋण सहकारी संस्था लि., गढवा-५, दाङ (यसपछि "संस्था" भनिएको) र ऋणी सदस्य श्री ${member.name} (सदस्य नं. ${member.memberNo}, ना.प्र.नं. ${member.citizenshipNo}, ठेगाना ${member.address}) बीच तपसिल बमोजिम कर्जा पुनर्तालिकीकरण तथा पुनर्संरचना सम्झौता सम्पन्न भयो।

१. पृष्ठभूमि तथा कारण:
ऋणी सदस्यले उपभोग गरेको कर्जा नं. ${loan.loanNo} अन्तर्गतको साँवा दायित्व तिर्न मनासिब कारण (${reasonMeta.labelNepali}) ले कठिनाई उत्पन्न भई ऋणीले पेश गरेको कारण: "${terms.distressDescription}" र व्यवसाय पुनरुत्थान योजना: "${terms.revivalPlanSummary}" को अध्ययन गर्दा साँचो पाइएकोले।

२. ऐन तथा नीतिगत सर्त पालना:
ऋणीले पाकेको ब्याजको कम्तीमा २५% भुक्तान गरिसकेको, ऋण उपसमिति बैठक नं. ${terms.creditCommitteeMinuteNo} को सिफारिस र सञ्चालक समिति निर्णय नं. ${terms.bodDecisionMinuteNo} बमोजिम बाँकी साँवा रु. ${terms.restructuredPrincipal.toLocaleString()} लाई पुनर्तालिकीकरण गरिएको छ।

३. पुनर्संरचना सर्तहरू:
(क) संशोधित कर्जा साँवा: रु. ${terms.restructuredPrincipal.toLocaleString()}
(ख) वार्षिक ब्याजदर: ${terms.annualInterestRate}%
(ग) थपिएको अवधि: ${terms.extendedTenureMonths} महिना
(घ) ग्रेस / किस्ता स्थगन अवधि: ${terms.moratoriumMonths} महिना
(ङ) मासिक किस्ता (EMI): रु. ${monthlyEmi.toLocaleString()}
(च) धितो सुरक्षण: पूर्ववत धितो (${loan.collateralDescription || 'सुरक्षण'}) यस सम्झौतामा यथावत कायम रहनेछ।

४. पालना नगरेको परिणाम:
यस पुनर्तालिकीकरण तालिका बमोजिम नियमित २ किस्तासम्म चुक्ता नगरेमा यो सुविधा स्वतः खारेज भई सहकारी ऐन २०७४ को दफा ८३ र ८४ बमोजिम तत्काल ३५ दिने लिलाम असुली प्रक्रिया र कर्जा सूचना केन्द्र (CIB) कालोसूचीमा सिफारिस गरिनेछ।
`.trim();

  return {
    deedNo,
    loanId: loan.id,
    loanNo: loan.loanNo,
    borrowerName: member.name,
    borrowerMemberNo: member.memberNo,
    citizenshipNo: member.citizenshipNo,
    address: member.address,
    originalPrincipal: loan.principalAmount,
    restructuredPrincipal: terms.restructuredPrincipal,
    annualInterestRate: terms.annualInterestRate,
    extendedTenureMonths: terms.extendedTenureMonths,
    moratoriumMonths: terms.moratoriumMonths,
    monthlyEmi,
    distressReasonNepali: reasonMeta.labelNepali,
    distressDescription: terms.distressDescription,
    revivalPlanSummary: terms.revivalPlanSummary,
    creditCommitteeMinuteNo: terms.creditCommitteeMinuteNo,
    bodDecisionMinuteNo: terms.bodDecisionMinuteNo,
    executionDateNepali: terms.restructuredDate,
    schedule,
    statutoryCitation,
    bodyNepaliText,
  };
}

/**
 * Exports rescheduled loans records to CSV format.
 */
export function exportRescheduledLoansCsv(records: readonly RescheduledLoanRecord[]): string {
  const headers = [
    'Deed No',
    'Loan No',
    'Member No',
    'Member Name',
    'Distress Reason',
    'Old Principal',
    'New Principal',
    'New Interest Rate (%)',
    'Extended Tenure (Mos)',
    'Moratorium (Mos)',
    'Revised EMI (NPR)',
    'BOD Minute No',
    'Restructured Date',
    'Status',
  ];

  const rows = records.map((r) => [
    r.deedNo,
    r.loanNo,
    r.memberNo,
    `"${r.memberName.replace(/"/g, '""')}"`,
    r.distressReason,
    r.oldPrincipal,
    r.newPrincipal,
    r.newRate,
    r.extendedTenure,
    r.moratoriumMonths,
    r.revisedEmi,
    `"${r.bodMinuteNo}"`,
    r.restructuredDate,
    r.status,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
