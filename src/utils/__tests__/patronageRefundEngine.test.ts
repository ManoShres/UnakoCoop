import { describe, it, expect } from 'vitest';
import {
  calculatePatronageRefund,
  generateWarrantNumber,
  generatePatronageVoucherPayload,
  exportPatronageAuditCsv,
  MemberPatronageMetric,
  PatronageWeightConfig,
} from '../patronageRefundEngine';

describe('patronageRefundEngine - Section 41 Nepal Cooperative Act 2074', () => {
  const mockConfig: PatronageWeightConfig = {
    fiscalYear: '२०८०/०८१',
    totalPoolAmount: 1000000, // NPR 1,000,000 total patronage refund pool
    savingsInterestWeight: 40, // 40% (NPR 400,000)
    loanInterestWeight: 40,    // 40% (NPR 400,000)
    dairyBusinessWeight: 20,   // 20% (NPR 200,000)
  };

  const mockMetrics: MemberPatronageMetric[] = [
    {
      memberId: 'mem-1',
      memberNo: 'M-00101',
      memberName: 'रामबहादुर चौधरी',
      accountNo: '004-10294-88-01',
      annualSavingsInterestEarned: 15000, // 50% of savings pool
      annualLoanInterestPaid: 40000,      // 40% of loan pool
      annualDairyBusinessVolume: 100000,  // 50% of dairy pool
      isEligible: true,
    },
    {
      memberId: 'mem-2',
      memberNo: 'M-00088',
      memberName: 'सीता देवी यादव',
      accountNo: '004-10294-88-02',
      annualSavingsInterestEarned: 15000, // 50% of savings pool
      annualLoanInterestPaid: 60000,      // 60% of loan pool
      annualDairyBusinessVolume: 100000,  // 50% of dairy pool
      isEligible: true,
    },
    {
      memberId: 'mem-3',
      memberNo: 'M-00300',
      memberName: 'गोविन्द श्रेष्ठ',
      accountNo: '004-10294-88-03',
      annualSavingsInterestEarned: 0,
      annualLoanInterestPaid: 0,
      annualDairyBusinessVolume: 0,
      isEligible: false,
    },
  ];

  describe('Weight & Pool Allocation Calculation', () => {
    it('allocates refunds accurately across the three statutory pillars', () => {
      const { distributions, summary } = calculatePatronageRefund(mockMetrics, mockConfig);

      expect(summary.totalPoolAmount).toBe(1000000);
      expect(summary.eligibleMemberCount).toBe(2);

      const mem1 = distributions.find((d) => d.memberId === 'mem-1')!;
      const mem2 = distributions.find((d) => d.memberId === 'mem-2')!;
      const mem3 = distributions.find((d) => d.memberId === 'mem-3')!;

      // Member 1:
      // Savings: 15000 / 30000 * 400000 = 200,000
      // Loan: 40000 / 100000 * 400000 = 160,000
      // Dairy: 100000 / 200000 * 200000 = 100,000
      // Total = 460,000
      expect(mem1.savingsShareAmount).toBe(200000);
      expect(mem1.loanShareAmount).toBe(160000);
      expect(mem1.dairyShareAmount).toBe(100000);
      expect(mem1.grossPatronageRefund).toBe(460000);
      expect(mem1.netPatronageRefund).toBe(460000);

      // Member 2:
      // Savings: 15000 / 30000 * 400000 = 200,000
      // Loan: 60000 / 100000 * 400000 = 240,000
      // Dairy: 100000 / 200000 * 200000 = 100,000
      // Total = 540,000
      expect(mem2.savingsShareAmount).toBe(200000);
      expect(mem2.loanShareAmount).toBe(240000);
      expect(mem2.dairyShareAmount).toBe(100000);
      expect(mem2.grossPatronageRefund).toBe(540000);

      // Inactive Member 3 gets 0
      expect(mem3.grossPatronageRefund).toBe(0);
      expect(mem3.netPatronageRefund).toBe(0);

      // Total distributed matches total pool
      expect(summary.totalDistributed).toBe(1000000);
    });

    it('handles zero pools or empty transaction volume gracefully', () => {
      const zeroConfig: PatronageWeightConfig = {
        ...mockConfig,
        totalPoolAmount: 0,
      };
      const { distributions, summary } = calculatePatronageRefund(mockMetrics, zeroConfig);
      expect(summary.totalDistributed).toBe(0);
      distributions.forEach((d) => {
        expect(d.grossPatronageRefund).toBe(0);
        expect(d.netPatronageRefund).toBe(0);
      });
    });

    it('generates sequential warrant numbers with fiscal year code', () => {
      const w1 = generateWarrantNumber('२०८०/०८१', 1);
      const w2 = generateWarrantNumber('२०८०/०८१', 25);
      expect(w1).toBe('PRF-UNAKO-2080-81-00001');
      expect(w2).toBe('PRF-UNAKO-2080-81-00025');
    });
  });

  describe('CBS Payout Transaction Voucher Generation', () => {
    it('creates CBS deposit transaction for savings account credit', () => {
      const { distributions } = calculatePatronageRefund(mockMetrics, mockConfig);
      const mem1 = distributions[0];
      const voucher = generatePatronageVoucherPayload(mem1, '2081-06-25');

      expect(voucher.type).toBe('DEPOSIT');
      expect(voucher.memberId).toBe('mem-1');
      expect(voucher.amount).toBe(mem1.netPatronageRefund);
      expect(voucher.status).toBe('COMPLETED');
      expect(voucher.description).toContain('दफा ४१ संरक्षकता फिर्ता कोष');
      expect(voucher.referenceNo).toBe(mem1.warrantNumber);
    });
  });

  describe('Compliance Reporting & CSV Export', () => {
    it('exports full patronage refund matrix to CSV with statutory headers', () => {
      const { distributions, summary } = calculatePatronageRefund(mockMetrics, mockConfig);
      const csv = exportPatronageAuditCsv(distributions, summary);

      expect(csv).toContain('Warrant No,Member No,Member Name,Account No,Savings Share (NPR),Loan Share (NPR),Dairy Share (NPR),Gross Refund,Tax (NPR),Net Refund');
      expect(csv).toContain('रामबहादुर चौधरी');
      expect(csv).toContain('सीता देवी यादव');
      expect(csv).toContain('PRF-UNAKO-2080-81-');
    });
  });
});
