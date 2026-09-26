import { describe, it, expect } from 'vitest';
import {
  scanTransactionsForAml,
  generateAmlAuditSummary,
  generateFiuGoAmlCsv,
  generateFiuGoAmlJson,
  AmlTransactionInput,
  AmlMemberInput,
} from '../amlCompliance';

describe('AML/CFT & FIU-Nepal goAML Compliance Engine (सम्पत्ति शुद्धीकरण निवारण)', () => {
  const mockMembers: AmlMemberInput[] = [
    {
      id: 'MEM-001',
      memberNo: 'UKO-2070-08842',
      name: 'Hari Prasad Chaudhary',
      isPep: false,
      occupation: 'Agriculture',
      annualIncome: 500000,
    },
    {
      id: 'MEM-002',
      memberNo: 'UKO-2072-01991',
      name: 'Bikash Jung Thapa',
      isPep: true, // Politically Exposed Person
      occupation: 'Public Representative',
      annualIncome: 1200000,
    },
    {
      id: 'MEM-003',
      memberNo: 'UKO-2075-04412',
      name: 'Gita Devi Pun',
      isPep: false,
      occupation: 'Business',
      annualIncome: 800000,
    },
  ];

  const mockTransactions: AmlTransactionInput[] = [
    {
      id: 'TXN-001',
      memberId: 'MEM-001',
      amount: 1250000, // Exceeds NPR 10,00,000 CTR threshold
      type: 'DEPOSIT',
      channel: 'CASH',
      date: '2024-07-15',
      accountNo: '004-10294-88-01',
    },
    {
      id: 'TXN-002',
      memberId: 'MEM-003',
      amount: 850000, // Structuring suspicion 1
      type: 'DEPOSIT',
      channel: 'CASH',
      date: '2024-07-16',
      accountNo: '004-94123-01',
    },
    {
      id: 'TXN-003',
      memberId: 'MEM-003',
      amount: 900000, // Structuring suspicion 2 within 24 hours
      type: 'DEPOSIT',
      channel: 'CASH',
      date: '2024-07-16',
      accountNo: '004-94123-01',
    },
    {
      id: 'TXN-004',
      memberId: 'MEM-002',
      amount: 450000, // PEP transaction requiring Enhanced Due Diligence
      type: 'DEPOSIT',
      channel: 'CASH',
      date: '2024-07-17',
      accountNo: '004-88192-01',
    },
    {
      id: 'TXN-005',
      memberId: 'MEM-001',
      amount: 25000, // Normal small transaction
      type: 'DEPOSIT',
      channel: 'CASH',
      date: '2024-07-18',
      accountNo: '004-10294-88-01',
    },
  ];

  it('flags Cash Transaction Reporting (CTR) for transactions >= NPR 1,000,000', () => {
    const alerts = scanTransactionsForAml(mockTransactions, mockMembers, 1000000);

    const ctrAlerts = alerts.filter((a) => a.ruleCode === 'CTR_THRESHOLD_1M');
    expect(ctrAlerts).toHaveLength(1);
    expect(ctrAlerts[0].transactionId).toBe('TXN-001');
    expect(ctrAlerts[0].amount).toBe(1250000);
    expect(ctrAlerts[0].reportType).toBe('CTR');
    expect(ctrAlerts[0].severity).toBe('CRITICAL');
  });

  it('detects smurfing/structuring Suspicious Transactions (STR) near threshold', () => {
    const alerts = scanTransactionsForAml(mockTransactions, mockMembers, 1000000);

    const structuringAlerts = alerts.filter((a) => a.ruleCode === 'STR_STRUCTURING');
    expect(structuringAlerts.length).toBeGreaterThanOrEqual(1);
    expect(structuringAlerts.some((a) => a.memberId === 'MEM-003')).toBe(true);
    expect(structuringAlerts[0].reportType).toBe('STR');
  });

  it('flags Politically Exposed Persons (PEP) for Enhanced Due Diligence (EDD)', () => {
    const alerts = scanTransactionsForAml(mockTransactions, mockMembers, 1000000);

    const pepAlerts = alerts.filter((a) => a.ruleCode === 'PEP_EDD');
    expect(pepAlerts).toHaveLength(1);
    expect(pepAlerts[0].memberId).toBe('MEM-002');
    expect(pepAlerts[0].memberName).toBe('Bikash Jung Thapa');
  });

  it('calculates comprehensive AML audit summary metrics', () => {
    const alerts = scanTransactionsForAml(mockTransactions, mockMembers, 1000000);
    const summary = generateAmlAuditSummary(alerts, mockTransactions.length);

    expect(summary.totalScannedTransactions).toBe(5);
    expect(summary.ctrAlertsCount).toBe(1);
    expect(summary.strAlertsCount).toBeGreaterThanOrEqual(2);
    expect(summary.totalFlaggedAmount).toBeGreaterThanOrEqual(3000000);
    expect(summary.complianceStatus).toBe('ACTION_REQUIRED');
  });

  it('generates FIU-Nepal goAML compliant CSV export string', () => {
    const alerts = scanTransactionsForAml(mockTransactions, mockMembers, 1000000);
    const csv = generateFiuGoAmlCsv(alerts, {
      name: 'Unako SACCOS Ltd.',
      nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
      regNo: '234/065/066',
    });

    expect(csv).toContain('FIU-Nepal goAML');
    expect(csv).toContain('सम्पत्ति शुद्धीकरण अनुगमन');
    expect(csv).toContain('TXN-001');
    expect(csv).toContain('CTR');
    expect(csv).toContain('Hari Prasad Chaudhary');
  });

  it('generates standard FIU-Nepal REST JSON structure', () => {
    const alerts = scanTransactionsForAml(mockTransactions, mockMembers, 1000000);
    const jsonStr = generateFiuGoAmlJson(alerts, {
      name: 'Unako SACCOS Ltd.',
      nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
      regNo: '234/065/066',
    });

    const parsed = JSON.parse(jsonStr);
    expect(parsed.schemaVersion).toBe('goAML-v2.0-NP');
    expect(parsed.cooperativeRegNo).toBe('234/065/066');
    expect(Array.isArray(parsed.reports)).toBe(true);
    expect(parsed.reports.length).toBe(alerts.length);
  });
});
