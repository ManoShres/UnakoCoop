import { describe, it, expect } from 'vitest';
import type { MemberPatronageMetric, PatronageWeightConfig } from '../patronageRefundEngine';
import {
  calculatePatronageRefund,
  generateWarrantNumber,
  generatePatronageVoucherPayload,
  exportPatronageAuditCsv,
  getMemberPatronageMetric,
  getMemberPatronageDistribution,
  formatPatronageThermalSlip,
  assertValidPatronageWeights,
  allocateByLargestRemainder,
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

    it('refuses weights that do not sum to 100 instead of over-distributing', () => {
      // Regression (B12): 40/40/40 with a 1,000,000 pool distributed 1,200,000.
      const badConfig: PatronageWeightConfig = {
        ...mockConfig,
        savingsInterestWeight: 40,
        loanInterestWeight: 40,
        dairyBusinessWeight: 40,
      };

      expect(() => assertValidPatronageWeights(badConfig)).toThrow(/sum to exactly 100/);

      const { summary, validationError } = calculatePatronageRefund(mockMetrics, badConfig);
      expect(validationError).toBeTruthy();
      expect(summary.totalDistributed).toBe(0);
      expect(summary.totalPoolAmount).toBe(0);
    });

    it('apportions by largest remainder so the pool is distributed exactly (no leakage)', () => {
      const equalMetrics: MemberPatronageMetric[] = ['a', 'b', 'c'].map((id) => ({
        memberId: id,
        memberNo: id,
        memberName: id,
        accountNo: id,
        annualSavingsInterestEarned: 1,
        annualLoanInterestPaid: 0,
        annualDairyBusinessVolume: 0,
        isEligible: true,
      }));

      const { distributions, summary } = calculatePatronageRefund(equalMetrics, {
        fiscalYear: '2081/82',
        totalPoolAmount: 100,
        savingsInterestWeight: 100,
        loanInterestWeight: 0,
        dairyBusinessWeight: 0,
      });

      expect(summary.totalDistributed).toBe(100);
      expect(summary.residualAmount).toBe(0);
      const amounts = distributions.map((d) => d.savingsShareAmount).sort((a, b) => b - a);
      expect(amounts).toEqual([34, 33, 33]);
    });

    it('never distributes more than the approved pool across the pillars', () => {
      const allocations = allocateByLargestRemainder([1, 1, 1, 1, 1, 1, 1], 1000);
      expect(allocations.reduce((s, v) => s + v, 0)).toBe(1000);
      expect(allocations).toEqual([143, 143, 143, 143, 143, 143, 142]);
    });

    it('verifies the Section 41 40% minimum against the net divisible surplus', () => {
      const underfunded = calculatePatronageRefund(mockMetrics, {
        ...mockConfig,
        totalPoolAmount: 100000,
        netDivisibleSurplus: 1000000,
      });
      expect(underfunded.summary.complianceCheck.section41MinimumRequired).toBe(400000);
      expect(underfunded.summary.complianceCheck.meetsSection41Minimum).toBe(false);

      const compliant = calculatePatronageRefund(mockMetrics, {
        ...mockConfig,
        totalPoolAmount: 500000,
        netDivisibleSurplus: 1000000,
      });
      expect(compliant.summary.complianceCheck.meetsSection41Minimum).toBe(true);

      // Without the surplus figure the minimum is NOT VERIFIED (never a vacuous pass).
      const unverified = calculatePatronageRefund(mockMetrics, mockConfig);
      expect(unverified.summary.complianceCheck.section41MinimumRequired).toBeNull();
      expect(unverified.summary.complianceCheck.meetsSection41Minimum).toBe(false);
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

  describe('Member-Centric Patronage Utilities', () => {
    it('retrieves member metric and computes individual distribution', () => {
      const metric = getMemberPatronageMetric('mem-1');
      expect(metric.memberId).toBe('mem-1');
      expect(metric.memberName).toBe('रामबहादुर चौधरी');

      const dist = getMemberPatronageDistribution('mem-1');
      expect(dist.memberId).toBe('mem-1');
      expect(dist.grossPatronageRefund).toBeGreaterThan(0);
      expect(dist.netPatronageRefund).toBe(dist.grossPatronageRefund);
      expect(dist.warrantNumber).toContain('PRF-UNAKO-');
    });

    it('formats 58mm/80mm thermal receipt slip with statutory details', () => {
      const dist = getMemberPatronageDistribution('mem-1');
      const slip = formatPatronageThermalSlip(dist, 'उनाको साकोस');

      expect(slip).toContain('संरक्षित पूँजी फिर्ता पुर्जी');
      expect(slip).toContain('सहकारी ऐन २०७४ दफा ४१ अनुसार');
      expect(slip).toContain(dist.warrantNumber);
      expect(slip).toContain('रामबहादुर चौधरी');
      expect(slip).toContain('बचत ब्याज लाभांश');
    });
  });
});

