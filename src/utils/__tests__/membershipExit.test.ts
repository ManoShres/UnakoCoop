import { describe, it, expect } from 'vitest';
import {
  verifyMembershipClearance,
  calculateMembershipExitSettlement,
  generateMembershipExitCertificate,
  generateMembershipExitCsv,
} from '../membershipExit';
import { Member, Loan, SavingsAccount } from '../../types';

describe('membershipExit clearance and settlement engine', () => {
  const cleanMember: Member = {
    id: 'mem-301',
    memberNo: 'UK-M-0210',
    name: 'पार्वती चौधरी (Parwati Chaudhary)',
    nameNepali: 'पार्वती चौधरी',
    email: 'parwati@example.com',
    citizenshipNo: '५४-०१-७१-००९१२',
    phone: '9847112233',
    address: 'गढवा गाउँपालिका वडा नं. ५, दाङ',
    joinedDate: '2078-02-10',
    status: 'VERIFIED',
    avatarUrl: '',
    shareCapital: 20000,
    totalSavings: 65000,
    activeLoanBalance: 0,
    accruedDividend: 3200,
    creditScore: 710,
    bankDetails: {
      bankName: 'Nepal Bank Ltd',
      accountNo: '88210',
      branch: 'Gadhwa',
      holderName: 'Parwati Chaudhary',
    },
    kycDocuments: {
      citizenshipFront: true,
      citizenshipBack: true,
      photo: true,
      signature: true,
      utilityBill: true,
    },
  };

  const borrowerMember: Member = {
    ...cleanMember,
    id: 'mem-302',
    memberNo: 'UK-M-0211',
    name: 'श्यामलाल पुन (Shyamlal Pun)',
    activeLoanBalance: 120000,
  };

  const activeLoan: Loan = {
    id: 'loan-301',
    loanNo: 'LN-2080-089',
    memberId: 'mem-302',
    loanType: 'Small Business Enterprise',
    principalAmount: 200000,
    remainingBalance: 120000,
    interestRate: 13.5,
    tenureMonths: 24,
    monthlyEmi: 9800,
    disbursedDate: '2080-04-12',
    nextDueDate: '2081-06-12',
    status: 'ACTIVE',
    collateralDescription: 'Lalpurja Land',
    collateralOwner: 'Shyamlal Pun',
  };

  const overdueGuaranteedLoan: Loan = {
    id: 'loan-302',
    loanNo: 'LN-2079-012',
    memberId: 'mem-999',
    loanType: 'Agricultural & Livestock',
    principalAmount: 300000,
    remainingBalance: 180000,
    interestRate: 14.0,
    tenureMonths: 36,
    monthlyEmi: 11000,
    disbursedDate: '2079-01-10',
    nextDueDate: '2080-01-10',
    status: 'OVERDUE',
    collateralDescription: 'जमानी: पार्वती चौधरी (Parwati Chaudhary)',
    collateralOwner: 'पार्वती चौधरी (Parwati Chaudhary)',
  };

  const mockSavings: SavingsAccount[] = [
    {
      id: 'sav-1',
      accountNo: 'SAV-001',
      memberId: 'mem-301',
      accountType: 'Regular Savings',
      balance: 40000,
      interestRate: 6.5,
      openedDate: '2078-02-10',
      status: 'ACTIVE',
    },
    {
      id: 'sav-2',
      accountNo: 'SAV-002',
      memberId: 'mem-301',
      accountType: 'Compulsory Savings',
      balance: 25000,
      interestRate: 7.0,
      openedDate: '2078-02-10',
      status: 'ACTIVE',
    },
  ];

  it('approves clearance for member with no loans or guarantor exposure', () => {
    const clearance = verifyMembershipClearance(cleanMember, [], mockSavings);

    expect(clearance.canExit).toBe(true);
    expect(clearance.activeLoanBalance).toBe(0);
    expect(clearance.guaranteedLoansCount).toBe(0);
    expect(clearance.blockingReasons.length).toBe(0);
  });

  it('blocks clearance if member has active unpaid loan', () => {
    const clearance = verifyMembershipClearance(borrowerMember, [activeLoan], []);

    expect(clearance.canExit).toBe(false);
    expect(clearance.activeLoanBalance).toBe(120000);
    expect(clearance.blockingReasons.length).toBeGreaterThan(0);
    expect(clearance.blockingReasons[0]).toContain('कर्जा साँवा/ब्याज बक्यौता');
  });

  it('blocks clearance if member is guarantor for an overdue loan', () => {
    const clearance = verifyMembershipClearance(cleanMember, [overdueGuaranteedLoan], mockSavings);

    expect(clearance.canExit).toBe(false);
    expect(clearance.blockingReasons.length).toBeGreaterThan(0);
    expect(clearance.blockingReasons[0]).toContain('भाखा नाघेको कर्जामा व्यक्तिगत/धितो जमानी');
  });

  it('calculates final settlement with shares, savings, 5% TDS and admin fee', () => {
    const settlement = calculateMembershipExitSettlement(cleanMember, mockSavings, 200, 5.0);

    expect(settlement.shareCapitalRefund).toBe(20000);
    expect(settlement.regularSavingsRefund).toBe(40000);
    expect(settlement.compulsorySavingsRefund).toBe(25000);
    expect(settlement.unpaidDividendsAndPatronage).toBe(3200);
    expect(settlement.membershipExitAdminFee).toBe(200);
    expect(settlement.statutoryTdsDeduction).toBeGreaterThan(0);
    expect(settlement.netPayableAmount).toBe(
      settlement.grossRefundableAmount - settlement.totalDeductions
    );
  });

  it('generates exit certificate and CSV export accurately', () => {
    const clearance = verifyMembershipClearance(cleanMember, [], mockSavings);
    const settlement = calculateMembershipExitSettlement(cleanMember, mockSavings);
    const cert = generateMembershipExitCertificate(
      cleanMember,
      clearance,
      settlement,
      'VOLUNTARY_RESIGNATION',
      'CASH_COUNTER'
    );

    expect(cert.certificateNo).toContain('CERT-EXIT-');
    expect(cert.clearanceStatus).toBe('APPROVED');
    expect(cert.committeeClearances.creditCommittee).toBe(true);
    expect(cert.committeeClearances.managerApproval).toBe(true);
    expect(cert.statutoryCitation).toContain('सहकारी ऐन २०७४ को दफा ३१ र ३२');

    const csv = generateMembershipExitCsv([cert]);
    expect(csv).toContain('Certificate No,Voucher No,Date BS');
    expect(csv).toContain(cert.certificateNo);
    expect(csv).toContain('APPROVED');
  });
});
