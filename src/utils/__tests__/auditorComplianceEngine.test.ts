import { describe, it, expect } from 'vitest';
import {
  validateAuditorEligibility,
  calculateAuditEngagementSummary,
  generateAuditorAppointmentLetter,
  exportAuditComplianceToCSV,
  DEFAULT_AUDITOR_PROFILE,
  DEFAULT_STATUTORY_CHECKPOINTS,
  DEFAULT_MANAGEMENT_LETTER_ITEMS,
  AuditorProfile,
} from '../auditorComplianceEngine';

describe('auditorComplianceEngine - Cooperative Act 2074 Sec 87 & 88', () => {
  it('validates auditor eligibility and rotation rules under Section 87', () => {
    // 1. Eligible auditor (2nd year)
    const eligible = validateAuditorEligibility(DEFAULT_AUDITOR_PROFILE);
    expect(eligible.isEligible).toBe(true);
    expect(eligible.errors.length).toBe(0);
    expect(eligible.warnings.length).toBe(1); // warning about next year rotation

    // 2. Ineligible: Served 3 consecutive terms
    const termLimitAuditor: AuditorProfile = {
      ...DEFAULT_AUDITOR_PROFILE,
      consecutiveYearsServed: 3,
    };
    const ineligibleTerm = validateAuditorEligibility(termLimitAuditor);
    expect(ineligibleTerm.isEligible).toBe(false);
    expect(ineligibleTerm.errors.some((e) => e.includes('तीन कार्यकाल'))).toBe(true);

    // 3. Ineligible: Conflict of interest
    const conflictAuditor: AuditorProfile = {
      ...DEFAULT_AUDITOR_PROFILE,
      hasIndependenceConflict: true,
    };
    const ineligibleConflict = validateAuditorEligibility(conflictAuditor);
    expect(ineligibleConflict.isEligible).toBe(false);
    expect(ineligibleConflict.errors.some((e) => e.includes('स्वार्थ'))).toBe(true);
  });

  it('calculates audit engagement score and determines statutory opinion', () => {
    const summary = calculateAuditEngagementSummary({
      fiscalYear: '2081/82',
      auditor: DEFAULT_AUDITOR_PROFILE,
      checkpoints: DEFAULT_STATUTORY_CHECKPOINTS,
      managementLetterItems: DEFAULT_MANAGEMENT_LETTER_ITEMS,
    });

    expect(summary.totalCheckpoints).toBe(10);
    expect(summary.compliantCount).toBe(9);
    expect(summary.minorObservationsCount).toBe(1);
    expect(summary.majorDeficienciesCount).toBe(0);
    // 9 points 100% + 1 point 70% -> score ~97%
    expect(summary.auditScorePercent).toBeGreaterThanOrEqual(95);
    expect(summary.auditOpinion).toBe('UNQUALIFIED');
    expect(summary.mediumRiskCount).toBe(1);
    expect(summary.lowRiskCount).toBe(1);
  });

  it('assigns qualified or adverse opinion when major deficiencies are detected', () => {
    const deficientCheckpoints = DEFAULT_STATUTORY_CHECKPOINTS.map((c, i) =>
      i === 0 ? { ...c, status: 'MAJOR_DEFICIENCY' as const } : c
    );

    const qualifiedSummary = calculateAuditEngagementSummary({
      fiscalYear: '2081/82',
      auditor: DEFAULT_AUDITOR_PROFILE,
      checkpoints: deficientCheckpoints,
      managementLetterItems: DEFAULT_MANAGEMENT_LETTER_ITEMS,
    });

    expect(qualifiedSummary.majorDeficienciesCount).toBe(1);
    expect(qualifiedSummary.auditOpinion).toBe('QUALIFIED');

    // 3 major deficiencies -> ADVERSE opinion
    const adverseCheckpoints = DEFAULT_STATUTORY_CHECKPOINTS.map((c, i) =>
      i < 3 ? { ...c, status: 'MAJOR_DEFICIENCY' as const } : c
    );

    const adverseSummary = calculateAuditEngagementSummary({
      fiscalYear: '2081/82',
      auditor: DEFAULT_AUDITOR_PROFILE,
      checkpoints: adverseCheckpoints,
      managementLetterItems: DEFAULT_MANAGEMENT_LETTER_ITEMS,
    });

    expect(adverseSummary.majorDeficienciesCount).toBe(3);
    expect(adverseSummary.auditOpinion).toBe('ADVERSE');
  });

  it('generates an official bilingual AGM Auditor Appointment Letter', () => {
    const letter = generateAuditorAppointmentLetter(DEFAULT_AUDITOR_PROFILE);

    expect(letter).toContain('उनको बचत तथा ऋण सहकारी संस्था लिमिटेड');
    expect(letter).toContain('STATUTORY AUDITOR APPOINTMENT ENGAGEMENT LETTER');
    expect(letter).toContain('रेग्मी एण्ड एसोसिएट्स, चार्टर्ड एकाउन्टेन्ट्स');
    expect(letter).toContain('ICAN COP No. 1420');
    expect(letter).toContain('दफा ८७');
    expect(letter).toContain('रु. 75,000');
  });

  it('exports audit compliance checkpoints and management letter to CSV', () => {
    const summary = calculateAuditEngagementSummary({
      fiscalYear: '2081/82',
      auditor: DEFAULT_AUDITOR_PROFILE,
      checkpoints: DEFAULT_STATUTORY_CHECKPOINTS,
      managementLetterItems: DEFAULT_MANAGEMENT_LETTER_ITEMS,
    });

    const csv = exportAuditComplianceToCSV(DEFAULT_STATUTORY_CHECKPOINTS, summary);

    expect(csv).toContain('S.No (क्र.सं.)');
    expect(csv).toContain('साधारण जगेडा (२५%) र शिक्षा कोष (५%) विनियोजन');
    expect(csv).toContain('MANAGEMENT LETTER OBSERVATIONS');
    expect(csv).toContain('STATUTORY AUDIT ENGAGEMENT SUMMARY');
    expect(csv).toContain('Audit Opinion,UNQUALIFIED');
  });
});
