import { describe, it, expect } from 'vitest';
import {
  calculateEducationFundSummary,
  validateTrainingExpenseAgainstBudget,
  recordTrainingExpense,
  calculateTrainingMetrics,
  generateTrainingCertificate,
  exportTrainingLedgerToCSV,
  DEFAULT_TRAINING_PROGRAMS,
  TrainingProgram,
} from '../coopEducationEngine';

describe('coopEducationEngine - Cooperative Act 2074 Sec 68 Training Ledger', () => {
  const samplePrograms: TrainingProgram[] = [...DEFAULT_TRAINING_PROGRAMS];

  it('calculates fund summary accurately with statutory 5% allocation and in-house split', () => {
    const summary = calculateEducationFundSummary({
      fiscalYear: '2081/82',
      netSurplus: 1500000,
      statutoryAllocationRate: 0.05,
      openingBalance: 200000,
      externalGrantOrSubsidy: 50000,
      programs: samplePrograms,
      unionContributionRemitted: 25000,
    });

    // 5% of 1,500,000 = 75,000
    expect(summary.allocatedSurplusAmount).toBe(75000);
    // Total available = 200,000 + 75,000 + 50,000 = 325,000
    expect(summary.totalAvailableFund).toBe(325000);

    // Sum of expenses in trn-001 (43k), trn-002 (57k), trn-003 (33k), trn-004 (18.5k), trn-005 (0) = 151,500
    expect(summary.inHouseExpenditure).toBe(151500);
    // Total disbursed = 151,500 + 25,000 = 176,500
    expect(summary.totalDisbursed).toBe(176500);
    // Remaining balance = 325,000 - 176,500 = 148,500
    expect(summary.remainingBalance).toBe(148500);
    expect(summary.sec68Compliant).toBe(true);
    expect(summary.inHouseSharePercent).toBeGreaterThanOrEqual(70);
  });

  it('flags statutory non-compliance if allocation rate is less than statutory 3%', () => {
    const summary = calculateEducationFundSummary({
      fiscalYear: '2081/82',
      netSurplus: 1000000,
      statutoryAllocationRate: 0.02, // 2% < 3% minimum
      openingBalance: 100000,
      programs: [],
      unionContributionRemitted: 0,
    });

    expect(summary.sec68Compliant).toBe(false);
    expect(summary.complianceNotes.some((n) => n.includes('न्यूनतम ३%'))).toBe(true);
  });

  it('validates training expense against fund balance and budget limits', () => {
    const program = samplePrograms[0]; // plannedBudget: 45000, current: 43000

    // 1. Negative or zero amount
    const invalidZero = validateTrainingExpenseAgainstBudget(program, 0, 100000);
    expect(invalidZero.isValid).toBe(false);

    // 2. Exceeds fund remaining balance
    const exceedsFund = validateTrainingExpenseAgainstBudget(program, 50000, 30000);
    expect(exceedsFund.isValid).toBe(false);
    expect(exceedsFund.error).toContain('मौज्दात');

    // 3. Exceeds planned program budget (warning issued, but allowed with minute note)
    const budgetOverrun = validateTrainingExpenseAgainstBudget(program, 5000, 100000);
    expect(budgetOverrun.isValid).toBe(true);
    expect(budgetOverrun.warning).toContain('योजनाबद्ध बजेट');

    // 4. Normal within budget and fund
    const normal = validateTrainingExpenseAgainstBudget(program, 1500, 100000);
    expect(normal.isValid).toBe(true);
    expect(normal.warning).toBeUndefined();
  });

  it('immutably records training expense and updates totals', () => {
    const program = samplePrograms[4]; // trn-005, initial totalActualExpense = 0, expenses = []
    const updated = recordTrainingExpense(program, {
      description: 'डिजिटल ब्यानर तथा पर्चा छपाई',
      category: 'STATIONERY_MATERIAL',
      amount: 4500,
      voucherNo: 'JV-81-199',
      invoiceDate: '२०८१-०६-०९',
    });

    expect(updated).not.toBe(program);
    expect(updated.expenses.length).toBe(program.expenses.length + 1);
    expect(updated.totalActualExpense).toBe(4500);
    expect(updated.expenses[0].voucherNo).toBe('JV-81-199');
  });

  it('computes training metrics including female ratio and cost per participant', () => {
    const metrics = calculateTrainingMetrics(samplePrograms, 2000);

    expect(metrics.totalPrograms).toBe(5);
    expect(metrics.completedPrograms).toBe(4);
    expect(metrics.totalParticipants).toBe(157);
    expect(metrics.totalFemaleParticipants).toBe(109);
    // Female ratio: 109 / 157 = ~69.4%
    expect(metrics.femaleRatioPercent).toBeGreaterThan(60);
    expect(metrics.totalMarginalizedParticipants).toBe(60);
    expect(metrics.totalExpenditure).toBe(151500);
    // Cost per participant: 151500 / 157 = ~965
    expect(metrics.averageCostPerParticipant).toBeGreaterThan(900);
    expect(metrics.categoryDistribution.FINANCIAL_LITERACY).toBe(1);
    expect(metrics.categoryDistribution.MICRO_ENTERPRISE).toBe(1);
  });

  it('generates a detailed bilingual training certificate with statutory details', () => {
    const cert = generateTrainingCertificate(samplePrograms[0], 'सुनिता चौधरी', 'M-2041');

    expect(cert).toContain('उनको बचत तथा ऋण सहकारी संस्था लिमिटेड');
    expect(cert).toContain('CERTIFICATE OF PARTICIPATION');
    expect(cert).toContain('सुनिता चौधरी');
    expect(cert).toContain('M-2041');
    expect(cert).toContain('UNAKO-TRN-2081-01');
    expect(cert).toContain('गढवा-५, दाङ');
    expect(cert).toContain('दफा ६८ (३)');
  });

  it('exports training ledger and fund summary to valid CSV format', () => {
    const summary = calculateEducationFundSummary({
      fiscalYear: '2081/82',
      netSurplus: 1200000,
      statutoryAllocationRate: 0.05,
      openingBalance: 150000,
      programs: samplePrograms,
      unionContributionRemitted: 20000,
    });

    const csv = exportTrainingLedgerToCSV(samplePrograms, summary);

    expect(csv).toContain('Program Code (कार्यक्रम कोड)');
    expect(csv).toContain('UNAKO-TRN-2081-01');
    expect(csv).toContain('महिला सदस्य वित्तीय साक्षरता');
    expect(csv).toContain('STATUTORY COOP EDUCATION FUND SUMMARY');
    expect(csv).toContain('2081/82');
    expect(csv).toContain('Section 68 Compliant (वैधानिक अनुकूल),YES');
  });
});
