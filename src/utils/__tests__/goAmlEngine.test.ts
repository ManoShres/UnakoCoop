import { describe, it, expect } from 'vitest';
import {
  escapeXml,
  validateGoAmlReport,
  generateGoAmlXml,
  buildGoAmlReportFromAlert,
  generateStrInvestigationDossierHtml,
  GoAmlReportData,
  DEFAULT_UNAKO_ENTITY,
  DEFAULT_UNAKO_AMLCO,
} from '../goAmlEngine';
import { AmlAlert } from '../amlCompliance';

describe('FIU-Nepal goAML XML & Regulatory Dispatch Engine', () => {
  const sampleMember = {
    id: 'MEM-001',
    memberNo: 'UKO-2070-08842',
    fullName: 'Hari Prasad Chaudhary',
    fatherName: 'Ram Lal Chaudhary',
    grandfatherName: 'Bishnu Prasad Chaudhary',
    citizenshipNo: '52-01-70-12849',
    nid: '9841298410',
    dateOfBirth: '1985-04-12',
    gender: 'M',
    occupation: 'Agriculture & Local Transport',
    annualIncome: 650000,
    address: 'Gadhawa-05, Dang',
    isPep: false,
    phone: '9847820194',
  };

  const sampleReportData: GoAmlReportData = {
    reportCode: 'STR',
    reportRef: 'GOAML-UNAKO-20260927-TXN001',
    reportDate: '2026-09-27',
    entity: DEFAULT_UNAKO_ENTITY,
    complianceOfficer: DEFAULT_UNAKO_AMLCO,
    subject: sampleMember,
    transactions: [
      {
        transactionId: 'TXN-9021',
        accountNo: '004-10294-88-01',
        amount: 950000,
        date: '2026-09-26',
        valueDate: '2026-09-26',
        mode: 'CASH',
        debitCredit: 'CREDIT',
        purpose: 'Cash deposit just below statutory threshold',
        remarks: 'Smurfing / structuring indicator',
      },
    ],
    suspicionNarrative:
      'Member conducted cash deposit of NPR 950,000 immediately below statutory CTR threshold with vague source of funds.',
    suspicionNarrativeNepali:
      'सदस्यले रु ९,५०,००० को नगद कारोबार थ्रेसहोल्ड सीमामुनि खण्डीकरण गरी पेश गरेको र स्रोत अस्पष्ट रहेको।',
    indicators: ['TRANSACTION_BELOW_STATUTORY_THRESHOLD_PATTERN'],
    internalActionTaken: 'Account tagged for EDD and KYC re-verification initiated.',
    amlcoRecommendation: 'File STR to FIU-Nepal and monitor subsequent inflows.',
  };

  it('escapes XML special characters safely', () => {
    const raw = `Tom & Jerry <cartoon> "Nepal" '2026'`;
    const escaped = escapeXml(raw);
    expect(escaped).toBe('Tom &amp; Jerry &lt;cartoon&gt; &quot;Nepal&quot; &apos;2026&apos;');
  });

  it('validates a complete goAML report successfully', () => {
    const res = validateGoAmlReport(sampleReportData);
    expect(res.isValid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('flags errors when mandatory goAML fields are missing', () => {
    const invalidReport: GoAmlReportData = {
      ...sampleReportData,
      reportRef: '',
      complianceOfficer: { ...DEFAULT_UNAKO_AMLCO, name: '' },
      transactions: [],
      suspicionNarrative: 'Short', // Less than 15 chars
    };

    const res = validateGoAmlReport(invalidReport);
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.includes('Reference number'))).toBe(true);
    expect(res.errors.some((e) => e.includes('AMLCO'))).toBe(true);
    expect(res.errors.some((e) => e.includes('transaction record'))).toBe(true);
    expect(res.errors.some((e) => e.includes('suspicion narrative'))).toBe(true);
  });

  it('generates schema-valid UNODC goAML XML for STR', () => {
    const xml = generateGoAmlXml(sampleReportData);

    expect(xml).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(xml).toContain('<report report_code="STR" submission_code="E"');
    expect(xml).toContain('<rentity_id>COOP-UNAKO-2070</rentity_id>');
    expect(xml).toContain('<reporting_person>');
    expect(xml).toContain('<first_name>Sunil</first_name>');
    expect(xml).toContain('<reason_description>');
    expect(xml).toContain('<transactionnumber>TXN-9021</transactionnumber>');
    expect(xml).toContain('<amount_local>950000.00</amount_local>');
    expect(xml).toContain('<client_number>UKO-2070-08842</client_number>');
    expect(xml).toContain('<id_number>52-01-70-12849</id_number>');
    expect(xml).toContain('</report>');
  });

  it('builds a report data structure from an active AmlAlert', () => {
    const mockAlert: AmlAlert = {
      id: 'AML-STR-TXN123',
      reportType: 'STR',
      severity: 'HIGH',
      memberId: 'MEM-001',
      memberName: 'Hari Prasad Chaudhary',
      memberNo: 'UKO-2070-08842',
      transactionId: 'TXN-123',
      amount: 850000,
      transactionDate: '2026-09-25',
      transactionType: 'DEPOSIT',
      triggerReason: 'Structuring below threshold',
      triggerReasonNepali: 'सीमामुनि खण्डीकरण',
      ruleCode: 'STR_STRUCTURING',
      status: 'PENDING_REVIEW',
    };

    const built = buildGoAmlReportFromAlert(mockAlert, sampleMember);
    expect(built.reportCode).toBe('STR');
    expect(built.transactions[0].amount).toBe(850000);
    expect(built.indicators.length).toBeGreaterThan(0);
    expect(built.suspicionNarrative).toContain('850,000');
  });

  it('generates an official printable STR Investigation Dossier HTML document', () => {
    const html = generateStrInvestigationDossierHtml(sampleReportData);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('उनको बचत तथा ऋण सहकारी संस्था लि.');
    expect(html).toContain('FIU-Nepal goAML STR');
    expect(html).toContain('Hari Prasad Chaudhary');
    expect(html).toContain('TXN-9021');
    expect(html).toContain('९,५०,०००');
    expect(html).toContain('सम्पत्ति शुद्धीकरण अनुपालन अधिकृत (AMLCO)');
  });
});
