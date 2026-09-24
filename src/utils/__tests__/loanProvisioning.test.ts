import { describe, it, expect } from 'vitest';
import {
  determineProvisionCategory,
  classifyLoanItem,
  buildProvisionSummaries,
  computePortfolioRiskRatios,
  STATUTORY_PROVISION_RULES,
} from '../loanProvisioning';
import { Loan, Member } from '../../types';

const mockLoan: Loan = {
  id: 'loan-1',
  loanNo: 'LN-2081-01',
  memberId: 'm-1',
  loanType: 'Agricultural & Livestock',
  principalAmount: 200000,
  remainingBalance: 150000,
  interestRate: 14.5,
  tenureMonths: 24,
  monthlyEmi: 9600,
  disbursedDate: '2081-01-15',
  nextDueDate: '2081-11-15',
  status: 'ACTIVE',
  collateralDescription: 'Lalpurja Land 4 Aana',
};

const mockMember: Member = {
  id: 'm-1',
  memberNo: 'UK-001',
  name: 'Sunita Sharma',
  email: 'sunita@example.com',
  phone: '9841234567',
  citizenshipNo: '27-01-70-12345',
  joinedDate: '2079-04-10',
  address: 'Kathmandu, Ward 4',
  status: 'VERIFIED',
  avatarUrl: '',
  shareCapital: 50000,
  totalSavings: 120000,
  activeLoanBalance: 150000,
  accruedDividend: 4500,
  creditScore: 780,
  bankDetails: {
    bankName: 'NIC Asia',
    accountNo: '12345678',
    branch: 'Chabahil',
    holderName: 'Sunita Sharma',
  },
  kycDocuments: {
    citizenshipFront: true,
    citizenshipBack: true,
    photo: true,
    signature: true,
    utilityBill: true,
  },
};

describe('Statutory Loan Loss Provisioning', () => {
  it('categorizes 0 to 30 days overdue as GOOD with 1% provision', () => {
    const rule = determineProvisionCategory(15);
    expect(rule.category).toBe('GOOD');
    expect(rule.provisionPercent).toBe(1);
    expect(rule.isNpl).toBe(false);
  });

  it('categorizes 31 to 90 days overdue as WATCHLIST with 5% provision', () => {
    const rule = determineProvisionCategory(45);
    expect(rule.category).toBe('WATCHLIST');
    expect(rule.provisionPercent).toBe(5);
    expect(rule.isNpl).toBe(false);
  });

  it('categorizes 91 to 180 days overdue as SUBSTANDARD with 25% provision', () => {
    const rule = determineProvisionCategory(120);
    expect(rule.category).toBe('SUBSTAND');
    expect(rule.provisionPercent).toBe(25);
    expect(rule.isNpl).toBe(true);
  });

  it('categorizes 181 to 365 days overdue as DOUBTFUL with 50% provision', () => {
    const rule = determineProvisionCategory(250);
    expect(rule.category).toBe('DOUBTFUL');
    expect(rule.provisionPercent).toBe(50);
    expect(rule.isNpl).toBe(true);
  });

  it('categorizes >365 days overdue as BAD with 100% provision', () => {
    const rule = determineProvisionCategory(400);
    expect(rule.category).toBe('BAD');
    expect(rule.provisionPercent).toBe(100);
    expect(rule.isNpl).toBe(true);
  });

  it('classifies a loan item correctly and computes provision amount in NPR', () => {
    // 150,000 balance with 45 days overdue (Watchlist: 5%)
    const classified = classifyLoanItem(mockLoan, mockMember, 45);
    expect(classified.category).toBe('WATCHLIST');
    expect(classified.provisionPercent).toBe(5);
    expect(classified.requiredProvisionAmount).toBe(7500); // 5% of 150,000
    expect(classified.memberName).toBe('Sunita Sharma');
  });

  it('builds comprehensive summaries across all 5 statutory buckets', () => {
    const l1 = classifyLoanItem(mockLoan, mockMember, 10); // 1% of 150,000 = 1500
    const l2 = classifyLoanItem({ ...mockLoan, id: 'loan-2', remainingBalance: 100000 }, mockMember, 400); // 100% of 100,000 = 100,000

    const summaries = buildProvisionSummaries([l1, l2]);
    expect(summaries.length).toBe(STATUTORY_PROVISION_RULES.length);

    const goodSummary = summaries.find((s) => s.category === 'GOOD');
    expect(goodSummary?.loanCount).toBe(1);
    expect(goodSummary?.totalOutstanding).toBe(150000);
    expect(goodSummary?.provisionAmount).toBe(1500);

    const badSummary = summaries.find((s) => s.category === 'BAD');
    expect(badSummary?.loanCount).toBe(1);
    expect(badSummary?.totalOutstanding).toBe(100000);
    expect(badSummary?.provisionAmount).toBe(100000);
  });

  it('computes portfolio risk ratios accurately (NPL and coverage)', () => {
    const l1 = classifyLoanItem(mockLoan, mockMember, 10); // 150,000 Performing
    const l2 = classifyLoanItem({ ...mockLoan, id: 'loan-2', remainingBalance: 50000 }, mockMember, 120); // 50,000 Substandard (NPL)

    const metrics = computePortfolioRiskRatios([l1, l2]);
    expect(metrics.totalLoansCount).toBe(2);
    expect(metrics.totalPortfolioBalance).toBe(200000);
    expect(metrics.nplLoansCount).toBe(1);
    expect(metrics.nplBalance).toBe(50000);
    expect(metrics.nplRatioPercent).toBe(25); // 50k / 200k = 25%
  });
});
