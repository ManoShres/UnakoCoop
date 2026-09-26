/**
 * Inter-Branch & Service Center Domestic Remittance Clearing Test Suite
 * Unako SACCOS (गढवा-५, दाङ) - Cooperative Act 2074 & NRB Remittance Directives
 */
import { describe, it, expect } from 'vitest';
import {
  calculateRemittanceFee,
  generateRemittanceControlNo,
  createRemittanceOrder,
  verifyAndDisburseRemittance,
  computeInterBranchClearingLedger,
  exportRemittanceSettlementCsv,
  RemittanceTransaction,
} from '../remittanceClearing';

describe('remittanceClearing utility', () => {
  const mockBranches = [
    { id: 'br-gadhwa', name: 'गढवा मुख्य कार्यालय (Gadhwa Head Office)' },
    { id: 'br-lamahi', name: 'लमही सेवा केन्द्र (Lamahi Service Center)' },
    { id: 'br-bhalubang', name: 'भालुवाङ सेवा केन्द्र (Bhalubang Service Center)' },
  ];

  describe('Remittance Fee & Commission Split Calculation', () => {
    it('applies standard tiered fee schedule and 40/40/20 commission split', () => {
      // Tier 1: <= 25,000 -> NPR 100
      const tier1 = calculateRemittanceFee(20000);
      expect(tier1.fee).toBe(100);
      expect(tier1.senderCommission).toBe(40); // 40%
      expect(tier1.receiverCommission).toBe(40); // 40%
      expect(tier1.headOfficeReserve).toBe(20); // 20%

      // Tier 2: 25,001 to 50,000 -> NPR 150
      const tier2 = calculateRemittanceFee(45000);
      expect(tier2.fee).toBe(150);
      expect(tier2.senderCommission).toBe(60);
      expect(tier2.receiverCommission).toBe(60);
      expect(tier2.headOfficeReserve).toBe(30);

      // Tier 3: 50,001 to 100,000 -> NPR 200
      const tier3 = calculateRemittanceFee(80000);
      expect(tier3.fee).toBe(200);
      expect(tier3.senderCommission).toBe(80);
      expect(tier3.receiverCommission).toBe(80);
      expect(tier3.headOfficeReserve).toBe(40);

      // Tier 4: > 100,000 -> 0.25%
      const tier4 = calculateRemittanceFee(200000);
      expect(tier4.fee).toBe(500); // 0.25% of 200,000
      expect(tier4.senderCommission).toBe(200);
      expect(tier4.receiverCommission).toBe(200);
      expect(tier4.headOfficeReserve).toBe(100);
    });
  });

  describe('Remittance Order Creation & Control Number', () => {
    it('generates a compliant 8-character unique control code', () => {
      const code = generateRemittanceControlNo();
      expect(code).toMatch(/^UNAKO-[A-Z0-9]{6}$/);
    });

    it('creates a pending remittance order with commission shares and secure PIN hash', () => {
      const order = createRemittanceOrder({
        sendingBranchId: 'br-gadhwa',
        sendingBranchName: 'गढवा मुख्य कार्यालय',
        receivingBranchId: 'br-lamahi',
        receivingBranchName: 'लमही सेवा केन्द्र',
        senderMemberNo: 'M-10023',
        senderName: 'राम बहादुर चौधरी',
        senderPhone: '9844912345',
        receiverName: 'सीता देवी चौधरी',
        receiverPhone: '9844954321',
        receiverCitizenshipNo: '५२-०१-७५-०३४२१',
        remitAmount: 30000,
        securityPin: '7829',
        sentTimestampBS: '2081/06/25 10:30',
      });

      expect(order.controlNo).toContain('UNAKO-');
      expect(order.remitAmount).toBe(30000);
      expect(order.serviceFee).toBe(150);
      expect(order.totalPaidBySender).toBe(30150);
      expect(order.status).toBe('SEND_PENDING_PAYOUT');
      expect(order.sendingBranchCommission).toBe(60);
      expect(order.payingBranchCommission).toBe(60);
      expect(order.headOfficeCommission).toBe(30);
    });
  });

  describe('Remittance Payout Verification Gate', () => {
    it('rejects payout if incorrect security PIN is entered', () => {
      const order = createRemittanceOrder({
        sendingBranchId: 'br-gadhwa',
        sendingBranchName: 'गढवा मुख्य कार्यालय',
        receivingBranchId: 'br-lamahi',
        receivingBranchName: 'लमही सेवा केन्द्र',
        senderMemberNo: 'M-10023',
        senderName: 'राम बहादुर चौधरी',
        senderPhone: '9844912345',
        receiverName: 'सीता देवी चौधरी',
        receiverPhone: '9844954321',
        receiverCitizenshipNo: '५२-०१-७५-०३४२१',
        remitAmount: 30000,
        securityPin: '7829',
        sentTimestampBS: '2081/06/25 10:30',
      });

      const payoutAttempt = verifyAndDisburseRemittance(
        order,
        '0000', // wrong PIN
        '५२-०१-७५-०३४२१',
        'TELLER-04',
        '2081/06/25 14:15'
      );

      expect(payoutAttempt.success).toBe(false);
      expect(payoutAttempt.error).toContain('PIN');
    });

    it('approves payout and marks status as PAID_OUT when valid PIN and citizenship provided', () => {
      const order = createRemittanceOrder({
        sendingBranchId: 'br-gadhwa',
        sendingBranchName: 'गढवा मुख्य कार्यालय',
        receivingBranchId: 'br-lamahi',
        receivingBranchName: 'लमही सेवा केन्द्र',
        senderMemberNo: 'M-10023',
        senderName: 'राम बहादुर चौधरी',
        senderPhone: '9844912345',
        receiverName: 'सीता देवी चौधरी',
        receiverPhone: '9844954321',
        receiverCitizenshipNo: '५२-०१-७५-०३४२१',
        remitAmount: 30000,
        securityPin: '7829',
        sentTimestampBS: '2081/06/25 10:30',
      });

      const payoutAttempt = verifyAndDisburseRemittance(
        order,
        '7829', // correct PIN
        '५२-०१-७५-०३४२१',
        'TELLER-04',
        '2081/06/25 14:15'
      );

      expect(payoutAttempt.success).toBe(true);
      expect(payoutAttempt.updatedTransaction?.status).toBe('PAID_OUT');
      expect(payoutAttempt.updatedTransaction?.paidByTellerId).toBe('TELLER-04');
      expect(payoutAttempt.updatedTransaction?.paidTimestampBS).toBe('2081/06/25 14:15');
    });
  });

  describe('Inter-Branch Clearing Matrix & CSV Export', () => {
    it('accurately computes bilateral net receivable/payable and commissions across branches', () => {
      const order1: RemittanceTransaction = {
        controlNo: 'UNAKO-AB12CD',
        sendingBranchId: 'br-gadhwa',
        sendingBranchName: 'गढवा मुख्य कार्यालय',
        receivingBranchId: 'br-lamahi',
        receivingBranchName: 'लमही सेवा केन्द्र',
        senderMemberNo: 'M-10023',
        senderName: 'राम बहादुर चौधरी',
        senderPhone: '9844912345',
        receiverName: 'सीता देवी चौधरी',
        receiverPhone: '9844954321',
        receiverCitizenshipNo: '५२-०१-७५-०३४२१',
        remitAmount: 50000,
        serviceFee: 150,
        totalPaidBySender: 50150,
        sendingBranchCommission: 60,
        payingBranchCommission: 60,
        headOfficeCommission: 30,
        status: 'PAID_OUT',
        securityPinHash: 'hashed_pin',
        sentTimestampBS: '2081/06/25 10:00',
        paidTimestampBS: '2081/06/25 11:30',
      };

      const order2: RemittanceTransaction = {
        controlNo: 'UNAKO-XY98ZT',
        sendingBranchId: 'br-lamahi',
        sendingBranchName: 'लमही सेवा केन्द्र',
        receivingBranchId: 'br-gadhwa',
        receivingBranchName: 'गढवा मुख्य कार्यालय',
        senderMemberNo: 'M-20045',
        senderName: 'गोविन्द श्रेष्ठ',
        senderPhone: '9844998765',
        receiverName: 'माया कुमारी पुन',
        receiverPhone: '9844911223',
        receiverCitizenshipNo: '५२-०१-६९-०११२२',
        remitAmount: 20000,
        serviceFee: 100,
        totalPaidBySender: 20100,
        sendingBranchCommission: 40,
        payingBranchCommission: 40,
        headOfficeCommission: 20,
        status: 'PAID_OUT',
        securityPinHash: 'hashed_pin',
        sentTimestampBS: '2081/06/25 12:00',
        paidTimestampBS: '2081/06/25 13:00',
      };

      const summaries = computeInterBranchClearingLedger(
        [order1, order2],
        mockBranches
      );

      // Gadhwa: Sent 50,000, Paid 20,000 -> Net Payable 30,000 (collected 50k, paid out 20k, owes 30k to Lamahi)
      const gadhwa = summaries.find((s) => s.branchId === 'br-gadhwa');
      expect(gadhwa?.totalSentAmount).toBe(50000);
      expect(gadhwa?.totalPaidAmount).toBe(20000);
      expect(gadhwa?.netBalance).toBe(30000); // positive = net payable to network
      expect(gadhwa?.earnedCommission).toBe(100); // 60 sent + 40 paid

      // Lamahi: Sent 20,000, Paid 50,000 -> Net Receivable -30,000
      const lamahi = summaries.find((s) => s.branchId === 'br-lamahi');
      expect(lamahi?.totalSentAmount).toBe(20000);
      expect(lamahi?.totalPaidAmount).toBe(50000);
      expect(lamahi?.netBalance).toBe(-30000); // negative = net receivable from network
      expect(lamahi?.earnedCommission).toBe(100); // 40 sent + 60 paid
    });

    it('exports remittance settlement register to well-structured CSV', () => {
      const order: RemittanceTransaction = {
        controlNo: 'UNAKO-AB12CD',
        sendingBranchId: 'br-gadhwa',
        sendingBranchName: 'गढवा मुख्य कार्यालय',
        receivingBranchId: 'br-lamahi',
        receivingBranchName: 'लमही सेवा केन्द्र',
        senderMemberNo: 'M-10023',
        senderName: 'राम बहादुर चौधरी',
        senderPhone: '9844912345',
        receiverName: 'सीता देवी चौधरी',
        receiverPhone: '9844954321',
        receiverCitizenshipNo: '५२-०१-७५-०३४२१',
        remitAmount: 50000,
        serviceFee: 150,
        totalPaidBySender: 50150,
        sendingBranchCommission: 60,
        payingBranchCommission: 60,
        headOfficeCommission: 30,
        status: 'PAID_OUT',
        securityPinHash: 'hashed_pin',
        sentTimestampBS: '2081/06/25 10:00',
        paidTimestampBS: '2081/06/25 11:30',
      };

      const csv = exportRemittanceSettlementCsv([order]);
      expect(csv).toContain('Control No,Sending Branch,Receiving Branch');
      expect(csv).toContain('UNAKO-AB12CD');
      expect(csv).toContain('राम बहादुर चौधरी');
      expect(csv).toContain('50000');
    });
  });
});
