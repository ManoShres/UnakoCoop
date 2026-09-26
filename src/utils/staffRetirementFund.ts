/**
 * Staff Statutory Provident Fund (कर्मचारी सञ्चय कोष) & Gratuity (उपदान कोष) Engine
 * Unako SACCOS (उनको बचत तथा ऋण सहकारी संस्था लि., गढवा-५, दाङ)
 * Compliant with Nepal Labor Act 2074 (श्रम ऐन २०७४ दफा ५२, ५३) and Cooperative Employees Service Bylaws.
 */

export interface StaffSalaryRecord {
  readonly employeeId: string;
  readonly employeeNo: string;
  readonly employeeName: string;
  readonly designation: string;
  readonly basicSalary: number;
  readonly joinedDateBS: string;
  readonly tenureYears: number;
  readonly accumulatedEmployeePf: number;
  readonly accumulatedEmployerPf: number;
  readonly accumulatedPfInterest: number;
  readonly totalAccumulatedPf: number;
  readonly accumulatedGratuity: number;
  readonly pfLoanBalance: number;
  readonly accumulatedLeaveDays: number;
}

export interface MonthlyPayrollPfGratuityBreakdown {
  readonly employeePfDeduction: number;
  readonly employerPfContribution: number;
  readonly totalMonthlyPfDeposit: number;
  readonly employerGratuityAccrual: number;
  readonly totalMonthlyEmployerBurden: number;
}

export interface StaffPfLoanEligibility {
  readonly totalAccumulatedPf: number;
  readonly maxLoanLimit: number;
  readonly existingLoanBalance: number;
  readonly availableLoanLimit: number;
  readonly isEligible: boolean;
}

export interface StaffRetirementSettlementVoucher {
  readonly voucherNo: string;
  readonly employeeName: string;
  readonly employeeNo: string;
  readonly designation: string;
  readonly settlementDateBS: string;
  readonly totalPfPayable: number;
  readonly gratuityPayable: number;
  readonly leaveEncashmentPayable: number;
  readonly grossSettlement: number;
  readonly staffLoanDeduction: number;
  readonly netPayableToEmployee: number;
  readonly narration: string;
}

export interface EarmarkedFundReconciliation {
  readonly totalStaffLiability: number;
  readonly totalPfLiability: number;
  readonly totalGratuityLiability: number;
  readonly ringFencedAssets: number;
  readonly surplusDeficit: number;
  readonly isFullyProtected: boolean;
}

/**
 * Calculates monthly 10% employee PF, 10% employer PF matching, and 8.33% statutory gratuity.
 */
export function calculateMonthlyPfGratuity(basicSalary: number): MonthlyPayrollPfGratuityBreakdown {
  const safeSalary = Math.max(0, basicSalary);
  const employeePfDeduction = Math.round(safeSalary * 0.1);
  const employerPfContribution = Math.round(safeSalary * 0.1);
  const totalMonthlyPfDeposit = employeePfDeduction + employerPfContribution;
  const employerGratuityAccrual = Math.round(safeSalary * 0.0833);
  const totalMonthlyEmployerBurden = employerPfContribution + employerGratuityAccrual;

  return {
    employeePfDeduction,
    employerPfContribution,
    totalMonthlyPfDeposit,
    employerGratuityAccrual,
    totalMonthlyEmployerBurden,
  };
}

/**
 * Evaluates staff loan eligibility against accumulated Provident Fund (maximum 90% ceiling).
 */
export function checkPfLoanEligibility(
  totalAccumulatedPf: number,
  currentLoanBalance: number
): StaffPfLoanEligibility {
  const safePf = Math.max(0, totalAccumulatedPf);
  const safeExistingDebt = Math.max(0, currentLoanBalance);
  const maxLoanLimit = Math.round(safePf * 0.9);
  const availableLoanLimit = Math.max(0, maxLoanLimit - safeExistingDebt);
  const isEligible = availableLoanLimit > 0;

  return {
    totalAccumulatedPf: safePf,
    maxLoanLimit,
    existingLoanBalance: safeExistingDebt,
    availableLoanLimit,
    isEligible,
  };
}

/**
 * Calculates annual interest credited to employee's accumulated PF balance (default 8.5% p.a.).
 */
export function calculateAnnualPfInterest(
  totalAccumulatedPf: number,
  annualInterestRate = 8.5
): number {
  if (totalAccumulatedPf <= 0 || annualInterestRate <= 0) return 0;
  return Math.round(totalAccumulatedPf * (annualInterestRate / 100));
}

/**
 * Computes full retirement / resignation final discharge settlement voucher.
 */
export function calculateRetirementSettlement(
  record: StaffSalaryRecord,
  settlementDateBS = '2081/06/30'
): StaffRetirementSettlementVoucher {
  const voucherNo = `VCHR-SETTLE-${settlementDateBS.replace(/\//g, '')}-${record.employeeNo.slice(-4)}`;
  const totalPfPayable = record.totalAccumulatedPf;
  const gratuityPayable = record.accumulatedGratuity;

  // Leave encashment formula: (Basic Salary / 30) * Accumulated Leave Days
  const leaveEncashmentPayable = Math.round((record.basicSalary / 30) * record.accumulatedLeaveDays);
  const grossSettlement = totalPfPayable + gratuityPayable + leaveEncashmentPayable;
  const staffLoanDeduction = record.pfLoanBalance;
  const netPayableToEmployee = Math.max(0, grossSettlement - staffLoanDeduction);

  const narration = `नेपाल श्रम ऐन २०७४ तथा संस्थाको कर्मचारी सेवा विनियमावली अनुसार कर्मचारी श्री ${record.employeeName} (${record.employeeNo}) को सञ्चय कोष रु. ${totalPfPayable.toLocaleString()}, उपदान रु. ${gratuityPayable.toLocaleString()} तथा संचित बिदा बापत रु. ${leaveEncashmentPayable.toLocaleString()} अन्तिम फछ्र्यौट।`;

  return {
    voucherNo,
    employeeName: record.employeeName,
    employeeNo: record.employeeNo,
    designation: record.designation,
    settlementDateBS,
    totalPfPayable,
    gratuityPayable,
    leaveEncashmentPayable,
    grossSettlement,
    staffLoanDeduction,
    netPayableToEmployee,
    narration,
  };
}

/**
 * Audits segregation of staff retirement liabilities against ring-fenced bank assets.
 */
export function verifyFundSegregation(
  totalPfLiabilities: number,
  totalGratuityLiabilities: number,
  ringFencedAssets: number
): EarmarkedFundReconciliation {
  const totalPfLiability = Math.max(0, totalPfLiabilities);
  const totalGratuityLiability = Math.max(0, totalGratuityLiabilities);
  const totalStaffLiability = totalPfLiability + totalGratuityLiability;
  const surplusDeficit = ringFencedAssets - totalStaffLiability;
  const isFullyProtected = surplusDeficit >= 0;

  return {
    totalStaffLiability,
    totalPfLiability,
    totalGratuityLiability,
    ringFencedAssets,
    surplusDeficit,
    isFullyProtected,
  };
}

/**
 * Exports staff retirement register to CSV format.
 */
export function exportStaffRetirementRegisterCsv(
  records: readonly StaffSalaryRecord[]
): string {
  const headers = [
    'Employee No',
    'Employee Name',
    'Designation',
    'Monthly Basic Pay (NPR)',
    'Joined Date (BS)',
    'Tenure (Years)',
    'Employee PF Share (NPR)',
    'Employer PF Share (NPR)',
    'Accumulated Interest (NPR)',
    'Total Accumulated PF (NPR)',
    'Accumulated Gratuity (NPR)',
    'PF Loan Balance (NPR)',
    'Accumulated Leave (Days)',
  ];

  const rows = records.map((r) => [
    r.employeeNo,
    `"${r.employeeName.replace(/"/g, '""')}"`,
    `"${r.designation}"`,
    r.basicSalary,
    r.joinedDateBS,
    r.tenureYears,
    r.accumulatedEmployeePf,
    r.accumulatedEmployerPf,
    r.accumulatedPfInterest,
    r.totalAccumulatedPf,
    r.accumulatedGratuity,
    r.pfLoanBalance,
    r.accumulatedLeaveDays,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
