import { describe, it, expect } from 'vitest';
import {
  DEFAULT_GRIEVANCE_RECORDS,
  calculateGrievanceMetrics,
  checkSlaBreach,
  daysRemainingForSla,
  addInvestigationNote,
  escalateGrievance,
  resolveGrievance,
  generateHearingResolutionMinutes,
  exportGrievancesToCSV,
  calculateDaysBetween,
  GrievanceRecord,
} from '../grievanceRedressalEngine';

describe('Institutional Grievance Redressal Engine', () => {
  it('calculates days between dates correctly', () => {
    expect(calculateDaysBetween('2080-11-01', '2080-11-15')).toBe(14);
    expect(calculateDaysBetween('2080-11-15', '2080-11-01')).toBe(0);
    expect(calculateDaysBetween('invalid', 'dates')).toBe(0);
  });

  it('computes metrics from default seed records', () => {
    const metrics = calculateGrievanceMetrics(DEFAULT_GRIEVANCE_RECORDS, '2080-12-20');

    expect(metrics.totalCount).toBe(5);
    expect(metrics.resolvedCount).toBe(2);
    expect(metrics.inquiryCount).toBe(1);
    expect(metrics.hearingScheduledCount).toBe(1);
    expect(metrics.escalatedCount).toBe(1);
    expect(metrics.totalCompensationAmount).toBe(3450);
    expect(metrics.resolutionRatePercent).toBe(40); // 2 of 5 = 40%
    expect(metrics.privacyBreakdown.ANONYMOUS_WHISTLEBLOWER).toBe(1);
    expect(metrics.privacyBreakdown.PUBLIC).toBe(3);
    expect(metrics.privacyBreakdown.CONFIDENTIAL).toBe(1);
  });

  it('accurately detects SLA breaches and remaining days', () => {
    const testRecord: GrievanceRecord = {
      id: 'test-1',
      ticketNumber: 'GRV-TEST-001',
      submissionDate: '2080-12-01',
      complainantName: 'Test Member',
      category: 'TELLER_SERVICE',
      severity: 'LOW',
      privacy: 'PUBLIC',
      title: 'Counter delay',
      description: 'Slow queue',
      branchName: 'Main Branch',
      slaDeadlineDays: 7,
      status: 'SUBMITTED',
      currentTier: 'TIER_1_OFFICER',
      investigationLogs: [],
    };

    // On day 5, not breached, 2 days remaining
    expect(checkSlaBreach(testRecord, '2080-12-06')).toBe(false);
    expect(daysRemainingForSla(testRecord, '2080-12-06')).toBe(2);

    // On day 10, breached by 2 days (7 - 9 = -2)
    expect(checkSlaBreach(testRecord, '2080-12-10')).toBe(true);
    expect(daysRemainingForSla(testRecord, '2080-12-10')).toBe(-2);
  });

  it('adds investigation notes immutably and transitions SUBMITTED to UNDER_INQUIRY', () => {
    const record = DEFAULT_GRIEVANCE_RECORDS[0];
    const initialLogCount = record.investigationLogs.length;

    const updated = addInvestigationNote(record, {
      date: '2080-11-20',
      investigator: 'Audit Officer',
      action: 'File Review',
      notes: 'Reviewed ledgers',
    });

    // Immutability checks
    expect(updated).not.toBe(record);
    expect(record.investigationLogs.length).toBe(initialLogCount);
    expect(updated.investigationLogs.length).toBe(initialLogCount + 1);
    expect(updated.investigationLogs[updated.investigationLogs.length - 1].notes).toBe('Reviewed ledgers');

    // Test transition from SUBMITTED to UNDER_INQUIRY
    const submittedRecord: GrievanceRecord = {
      ...record,
      status: 'SUBMITTED',
      investigationLogs: [],
    };
    const inquiryRecord = addInvestigationNote(submittedRecord, {
      date: '2080-11-20',
      investigator: 'Officer',
      action: 'Initial contact',
      notes: 'Called member',
    });
    expect(inquiryRecord.status).toBe('UNDER_INQUIRY');
  });

  it('escalates grievance to Supervisory Committee (Tier 2) immutably', () => {
    const record = DEFAULT_GRIEVANCE_RECORDS[3]; // UNDER_INQUIRY
    const escalated = escalateGrievance(
      record,
      'TIER_2_AUDIT_COMMITTEE',
      'Unresolved dispute requiring independent ombudsman review',
      'Branch Manager'
    );

    expect(escalated).not.toBe(record);
    expect(escalated.currentTier).toBe('TIER_2_AUDIT_COMMITTEE');
    expect(escalated.status).toBe('ESCALATED_TO_AUDIT');
    expect(escalated.investigationLogs.some((l) => l.action.includes('तह वृद्धि'))).toBe(true);
  });

  it('resolves grievance with compensation immutably', () => {
    const record = DEFAULT_GRIEVANCE_RECORDS[4]; // HEARING_SCHEDULED
    const resolved = resolveGrievance(record, {
      resolvedDate: '2080-12-20',
      decisionSummary: 'Fonepay QR settlement mismatch reconciled and credited back.',
      correctiveActionType: 'FINANCIAL_COMPENSATION',
      compensationAmount: 2100,
      hearingChairedBy: 'General Manager',
      complainantAccepted: true,
    });

    expect(resolved).not.toBe(record);
    expect(resolved.status).toBe('RESOLVED');
    expect(resolved.resolution?.compensationAmount).toBe(2100);
    expect(resolved.resolution?.complainantAccepted).toBe(true);
  });

  it('generates official bilingual Hearing Resolution Minutes protecting anonymous whistleblower identity', () => {
    const whistleblowerRecord = DEFAULT_GRIEVANCE_RECORDS[2];
    const minutes = generateHearingResolutionMinutes(whistleblowerRecord, 'उनको साकोस');

    expect(minutes).toContain('उनको साकोस');
    expect(minutes).toContain('GRV-2080-003');
    // Anonymity check: Complainant details must be concealed
    expect(minutes).toContain('Whistleblower Protected');
    expect(minutes).toContain('[संरक्षित / गोप्य]');
    expect(minutes).toContain('कर्मचारी आचारसंहिता तथा अनियमितता');
  });

  it('exports grievances to standard CSV with headers and data', () => {
    const csv = exportGrievancesToCSV(DEFAULT_GRIEVANCE_RECORDS);

    expect(csv).toContain('Ticket Number,Date,Complainant,Member No,Category,Severity,Privacy,Branch,Status');
    expect(csv).toContain('GRV-2080-001');
    expect(csv).toContain('GRV-2080-002');
    expect(csv).toContain('GRV-2080-003');
    expect(csv).toContain('ANONYMOUS');
  });
});
