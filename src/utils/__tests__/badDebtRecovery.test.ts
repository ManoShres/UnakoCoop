import { describe, it, expect } from 'vitest';
import {
  generateLegalRecoveryNotice,
  buildCibBlacklistRecord,
  generateCibBlacklistCsv,
  processBadDebtWriteOff,
  calculateAuctionSettlement,
} from '../badDebtRecovery';
import { Loan, Member } from '../../types';

describe('badDebtRecovery utilities', () => {
  const mockMember: Member = {
    id: 'mem-101',
    memberNo: 'UK-M-0142',
    name: 'दिलमाया पुन (Dilmaya Pun)',
    nameNepali: 'दिलमाया पुन',
    email: 'dilmaya@example.com',
    citizenshipNo: '५४-०१-६८-०९२४१',
    phone: '9847123456',
    address: 'गढवा गाउँपालिका वडा नं. ५, दाङ',
    wardNo: '५',
    joinedDate: '2078-01-15',
    status: 'VERIFIED',
    avatarUrl: '',
    shareCapital: 50000,
    totalSavings: 45000,
    activeLoanBalance: 250000,
    accruedDividend: 0,
    creditScore: 580,
    bankDetails: {
      bankName: 'Nepal Bank Ltd',
      accountNo: '0450123992',
      branch: 'Gadhwa',
      holderName: 'Dilmaya Pun',
    },
    kycDocuments: {
      citizenshipFront: true,
      citizenshipBack: true,
      photo: true,
      signature: true,
      utilityBill: true,
    },
  };

  const mockLoan: Loan = {
    id: 'loan-501',
    loanNo: 'LN-2080-045',
    memberId: 'mem-101',
    loanType: 'Agricultural & Livestock',
    principalAmount: 300000,
    remainingBalance: 250000,
    interestRate: 14.0,
    tenureMonths: 24,
    monthlyEmi: 14500,
    disbursedDate: '2079-05-10',
    nextDueDate: '2080-01-10',
    status: 'OVERDUE',
    collateralDescription: 'जग्गा कित्ता नं. ४५२/११, गढवा-५, दाङ',
    collateralValue: 600000,
  };

  it('generates a compliant 35-day public auction notice with legal citations', () => {
    const notice = generateLegalRecoveryNotice(mockLoan, mockMember, 'NOTICE_35_DAYS_PUBLIC_AUCTION');

    expect(notice.noticeType).toBe('NOTICE_35_DAYS_PUBLIC_AUCTION');
    expect(notice.borrowerName).toBe('दिलमाया पुन (Dilmaya Pun)');
    expect(notice.borrowerCitizenshipNo).toBe('५४-०१-६८-०९२४१');
    expect(notice.principalOutstanding).toBe(250000);
    expect(notice.legalNoticeExpenses).toBe(7500);
    expect(notice.totalPayableAmount).toBeGreaterThan(250000);
    expect(notice.statutoryCitation).toContain('सहकारी ऐन २०७४ को दफा ८३ र ८४');
    expect(notice.noticeBodyText).toContain('३५ दिनभित्र');
    expect(notice.collateral.kittaNo).toBeDefined();
    expect(notice.guarantors.length).toBeGreaterThan(0);
  });

  it('generates 15-day and 7-day alternative notices correctly', () => {
    const notice15 = generateLegalRecoveryNotice(mockLoan, mockMember, 'NOTICE_15_DAYS_FINAL_DEMAND');
    expect(notice15.noticeType).toBe('NOTICE_15_DAYS_FINAL_DEMAND');
    expect(notice15.legalNoticeExpenses).toBe(2500);
    expect(notice15.noticeBodyText).toContain('१५ दिनभित्र');

    const notice7 = generateLegalRecoveryNotice(mockLoan, mockMember, 'NOTICE_7_DAYS_SEALED_TENDER');
    expect(notice7.noticeType).toBe('NOTICE_7_DAYS_SEALED_TENDER');
    expect(notice7.noticeBodyText).toContain('७ दिनभित्र');
  });

  it('builds CIB blacklist recommendation record and formats CSV properly', () => {
    const cibRecord = buildCibBlacklistRecord(mockLoan, mockMember, 420, 'BAD');

    expect(cibRecord.borrowerMemberNo).toBe('UK-M-0142');
    expect(cibRecord.loanAccountNo).toBe('LN-2080-045');
    expect(cibRecord.overdueDays).toBe(420);
    expect(cibRecord.provisionCategory).toBe('BAD');
    expect(cibRecord.totalDefaultAmount).toBeGreaterThan(mockLoan.remainingBalance);
    expect(cibRecord.blacklistStatus).toBe('RECOMMENDED');

    const csv = generateCibBlacklistCsv([cibRecord]);
    expect(csv).toContain('Report Date,Member No,Borrower Full Name');
    expect(csv).toContain('UK-M-0142');
    expect(csv).toContain('LN-2080-045');
    expect(csv).toContain('RECOMMENDED');
  });

  it('processes statutory bad debt write-off with double-entry voucher and memorandum registry', () => {
    const voucher = processBadDebtWriteOff(
      mockLoan,
      mockMember,
      'निर्णय नं. ५२ (२०८१/०६/०५)',
      '२०८१-०६-०५',
      'असुली हुन नसकेकोले सञ्चालक समितिबाट अपलेखन गरी बाह्य खातामा प्रविष्टि'
    );

    expect(voucher.loanNo).toBe('LN-2080-045');
    expect(voucher.boardResolutionNo).toBe('निर्णय नं. ५२ (२०८१/०६/०५)');
    expect(voucher.writeOffPrincipalAmount).toBe(250000);
    expect(voucher.debitAccount).toContain('कर्जा नोक्सानी जगेडा');
    expect(voucher.creditAccount).toContain('ऋणी कर्जा हिसाब');
    expect(voucher.memorandumRegisterNo).toBe('MEMO-REC-LN-2080-045');
    expect(voucher.legalClaimPreserved).toBe(true);
    expect(voucher.agmRatificationStatus).toBe('PENDING_NEXT_AGM');
  });

  it('calculates auction settlement waterfall with net surplus to return to borrower', () => {
    // Principal: 200,000, Interest: 20,000, Penalty: 5,000, Legal Cost: 10,000. Total = 235,000
    // Auction proceeds: 300,000 => Net Surplus: 65,000
    const result = calculateAuctionSettlement(
      200000,
      200000 * 0.1, // 20,000
      5000,
      10000,
      300000,
      mockMember.name,
      mockLoan.loanNo
    );

    expect(result.grossAuctionProceeds).toBe(300000);
    expect(result.legalAndAuctionCost).toBe(10000);
    expect(result.penaltySettled).toBe(5000);
    expect(result.interestSettled).toBe(20000);
    expect(result.principalSettled).toBe(200000);
    expect(result.totalSettled).toBe(235000);
    expect(result.netSurplusRefundToMember).toBe(65000);
    expect(result.remainingDeficitToRecover).toBe(0);
    expect(result.isFullySettled).toBe(true);
  });

  it('calculates auction settlement waterfall with partial recovery deficit', () => {
    // Principal: 200,000, Interest: 20,000, Penalty: 5,000, Legal Cost: 10,000. Total = 235,000
    // Auction proceeds: 150,000 => Deficit: 85,000
    const result = calculateAuctionSettlement(
      200000,
      20000,
      5000,
      10000,
      150000,
      mockMember.name,
      mockLoan.loanNo
    );

    expect(result.grossAuctionProceeds).toBe(150000);
    expect(result.legalAndAuctionCost).toBe(10000);
    expect(result.penaltySettled).toBe(5000);
    expect(result.interestSettled).toBe(20000);
    expect(result.principalSettled).toBe(115000); // 150,000 - 35,000 = 115,000
    expect(result.totalSettled).toBe(150000);
    expect(result.netSurplusRefundToMember).toBe(0);
    expect(result.remainingDeficitToRecover).toBe(85000);
    expect(result.isFullySettled).toBe(false);
  });
});
