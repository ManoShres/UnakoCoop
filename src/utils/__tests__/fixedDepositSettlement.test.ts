import { describe, it, expect } from 'vitest';
import {
  calculateFdSettlement,
  calculateFdAutoRenewal,
  generateFdDischargeVoucher,
  generateFdSettlementsCsv,
} from '../fixedDepositSettlement';
import { SavingsAccount, Member } from '../../types';

describe('fixedDepositSettlement engine', () => {
  const mockMember: Member = {
    id: 'm-201',
    memberNo: 'UK-M-0088',
    name: 'रामबहादुर चौधरी (Ram Bahadur Chaudhary)',
    nameNepali: 'रामबहादुर चौधरी',
    email: 'ram@example.com',
    citizenshipNo: '५४-०१-६५-०१२३४',
    phone: '9857812345',
    address: 'गढवा-५, दाङ',
    joinedDate: '2077-01-10',
    status: 'VERIFIED',
    avatarUrl: '',
    shareCapital: 50000,
    totalSavings: 150000,
    activeLoanBalance: 0,
    accruedDividend: 5000,
    creditScore: 720,
    bankDetails: {
      bankName: 'Nepal Bank Ltd',
      accountNo: '12345',
      branch: 'Gadhwa',
      holderName: 'Ram Bahadur Chaudhary',
    },
    kycDocuments: {
      citizenshipFront: true,
      citizenshipBack: true,
      photo: true,
      signature: true,
      utilityBill: true,
    },
  };

  const mockFdAccount: SavingsAccount = {
    id: 'sav-fd-1',
    accountNo: 'FD-2080-0012',
    memberId: 'm-201',
    accountType: 'Fixed Deposit (1 Year)',
    balance: 100000,
    interestRate: 10.0,
    openedDate: '2080-06-01',
    maturityDate: '2081-06-01',
    status: 'ACTIVE',
  };

  it('calculates regular FD maturity settlement with 5% statutory TDS', () => {
    // 100,000 principal at 10% for 12 months (~365 days)
    // Gross Interest: ~10,000
    // 5% TDS: ~500
    // Net Interest: ~9,500
    // Total Payout: ~109,500
    const settlement = calculateFdSettlement(
      100000,
      10.0,
      12,
      'MATURITY',
      365,
      2.0,
      5.0,
      mockMember.name,
      mockMember.memberNo,
      mockFdAccount.accountNo
    );

    expect(settlement.isPremature).toBe(false);
    expect(settlement.principalAmount).toBe(100000);
    expect(settlement.grossInterest).toBe(10000);
    expect(settlement.penaltyAmount).toBe(0);
    expect(settlement.effectiveInterest).toBe(10000);
    expect(settlement.tdsAmount).toBe(500); // 5% of 10,000
    expect(settlement.netInterest).toBe(9500);
    expect(settlement.totalPayoutAmount).toBe(109500);
  });

  it('calculates premature break with 2% penalty markdown and 5% TDS', () => {
    // 100,000 principal, contracted 10%, broken at 180 days with 2% penalty => applied 8%
    // Gross Interest (at 10% for 180 days): round(100,000 * 0.10 * 180 / 365) = 4932
    // Effective Interest (at 8% for 180 days): round(100,000 * 0.08 * 180 / 365) = 3945
    // Penalty: 4932 - 3945 = 987
    // 5% TDS on 3945: round(3945 * 0.05) = 197
    // Net Interest: 3945 - 197 = 3748
    // Total Payout: 100,000 + 3748 = 103,748
    const settlement = calculateFdSettlement(
      100000,
      10.0,
      12,
      'PREMATURE_BREAK',
      180,
      2.0,
      5.0,
      mockMember.name,
      mockMember.memberNo,
      mockFdAccount.accountNo
    );

    expect(settlement.isPremature).toBe(true);
    expect(settlement.appliedRate).toBe(8.0);
    expect(settlement.penaltyAmount).toBeGreaterThan(0);
    expect(settlement.effectiveInterest).toBeLessThan(settlement.grossInterest);
    expect(settlement.tdsAmount).toBe(Math.round(settlement.effectiveInterest * 0.05));
    expect(settlement.totalPayoutAmount).toBe(settlement.principalAmount + settlement.netInterest);
  });

  it('calculates compound auto-renewal rollover correctly', () => {
    // 100,000 principal at 10% for 1 year => Gross Interest: 10,000; TDS: 500; Net Interest: 9,500
    // Compound rollover: new principal = 100,000 + 9,500 = 109,500
    const renewal = calculateFdAutoRenewal(
      mockFdAccount,
      mockMember,
      'COMPOUND_PRINCIPAL_AND_NET_INTEREST',
      1,
      10.5
    );

    expect(renewal.rolloverMode).toBe('COMPOUND_PRINCIPAL_AND_NET_INTEREST');
    expect(renewal.previousPrincipal).toBe(100000);
    expect(renewal.netInterestEarned).toBe(9500);
    expect(renewal.newPrincipalAmount).toBe(109500);
    expect(renewal.interestPayoutToSavings).toBe(0);
    expect(renewal.newAccountNo).toContain('-R1Y');
  });

  it('calculates principal-only auto-renewal with interest paid out to savings', () => {
    const renewal = calculateFdAutoRenewal(
      mockFdAccount,
      mockMember,
      'PRINCIPAL_ONLY',
      2,
      11.0
    );

    expect(renewal.rolloverMode).toBe('PRINCIPAL_ONLY');
    expect(renewal.newPrincipalAmount).toBe(100000);
    expect(renewal.interestPayoutToSavings).toBe(19000); // 2 years net interest
  });

  it('generates discharge voucher and CSV export accurately', () => {
    const settlement = calculateFdSettlement(
      100000,
      10.0,
      12,
      'MATURITY',
      365,
      2.0,
      5.0,
      mockMember.name,
      mockMember.memberNo,
      mockFdAccount.accountNo
    );

    const voucher = generateFdDischargeVoucher(settlement, mockMember, '१ वर्ष मुद्दती निक्षेप');
    expect(voucher.voucherNo).toContain('FD-DIS-');
    expect(voucher.certificateNo).toContain('CERT-TDS-');
    expect(voucher.memberName).toBe(mockMember.name);
    expect(voucher.statutoryTds5Percent).toBe(500);
    expect(voucher.totalDischargedAmount).toBe(109500);

    const csv = generateFdSettlementsCsv([voucher]);
    expect(csv).toContain('Voucher No,Certificate No,Date BS');
    expect(csv).toContain(voucher.voucherNo);
    expect(csv).toContain('109500');
  });
});
