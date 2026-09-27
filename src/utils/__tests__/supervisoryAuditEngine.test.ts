import { describe, it, expect } from 'vitest';
import {
  createDefaultSupervisoryChecklist,
  evaluateSupervisoryAuditScore,
  generateSupervisoryQuarterlyReport,
  exportSupervisoryAuditCsv,
  SupervisoryChecklistItem,
} from '../supervisoryAuditEngine';

describe('supervisoryAuditEngine - Cooperative Internal Audit & Supervisory Committee', () => {
  describe('createDefaultSupervisoryChecklist', () => {
    it('creates standard checklist covering all 5 statutory inspection pillars', () => {
      const items = createDefaultSupervisoryChecklist();
      expect(items.length).toBe(10);

      const pillars = new Set(items.map((i) => i.pillar));
      expect(pillars.has('CASH_VAULT_PHYSICAL')).toBe(true);
      expect(pillars.has('LOAN_COLLATERAL_CUSTODY')).toBe(true);
      expect(pillars.has('RESERVE_LIQUIDITY_COMPLIANCE')).toBe(true);
      expect(pillars.has('GOVERNANCE_BOARD_MINUTES')).toBe(true);
      expect(pillars.has('AML_KYC_SUSPICIOUS')).toBe(true);

      const totalMaxScore = items.reduce((sum, i) => sum + i.maxScore, 0);
      expect(totalMaxScore).toBe(100);
    });

    it('each item has statutory legal references citing Nepal Cooperative Act 2074', () => {
      const items = createDefaultSupervisoryChecklist();
      items.forEach((item) => {
        expect(item.statutoryRef).toBeDefined();
        expect(item.statutoryRef.length).toBeGreaterThan(0);
      });
    });
  });

  describe('evaluateSupervisoryAuditScore', () => {
    it('calculates EXCELLENT rating for score >= 85%', () => {
      const mockItems: SupervisoryChecklistItem[] = [
        {
          id: '1',
          pillar: 'CASH_VAULT_PHYSICAL',
          question: 'Q1',
          questionNepali: 'Q1',
          statutoryRef: 'Sec 49',
          maxScore: 50,
          scoreAwarded: 45,
          status: 'PASS',
        },
        {
          id: '2',
          pillar: 'LOAN_COLLATERAL_CUSTODY',
          question: 'Q2',
          questionNepali: 'Q2',
          statutoryRef: 'Sec 49',
          maxScore: 50,
          scoreAwarded: 45,
          status: 'PASS',
        },
      ];
      // 90 / 100 = 90%
      const res = evaluateSupervisoryAuditScore(mockItems);
      expect(res.scorePercentage).toBe(90);
      expect(res.overallRating).toBe('EXCELLENT');
    });

    it('calculates SATISFACTORY rating for score between 70% and 84%', () => {
      const mockItems: SupervisoryChecklistItem[] = [
        {
          id: '1',
          pillar: 'CASH_VAULT_PHYSICAL',
          question: 'Q1',
          questionNepali: 'Q1',
          statutoryRef: 'Sec 49',
          maxScore: 100,
          scoreAwarded: 75,
          status: 'PASS',
        },
      ];
      const res = evaluateSupervisoryAuditScore(mockItems);
      expect(res.scorePercentage).toBe(75);
      expect(res.overallRating).toBe('SATISFACTORY');
    });

    it('calculates CRITICAL_RISK for score < 50%', () => {
      const mockItems: SupervisoryChecklistItem[] = [
        {
          id: '1',
          pillar: 'CASH_VAULT_PHYSICAL',
          question: 'Q1',
          questionNepali: 'Q1',
          statutoryRef: 'Sec 49',
          maxScore: 100,
          scoreAwarded: 40,
          status: 'FAIL',
        },
      ];
      const res = evaluateSupervisoryAuditScore(mockItems);
      expect(res.scorePercentage).toBe(40);
      expect(res.overallRating).toBe('CRITICAL_RISK');
    });
  });

  describe('generateSupervisoryQuarterlyReport', () => {
    it('compiles full quarterly inspection report with executive summaries and quarter metadata', () => {
      const checklist = createDefaultSupervisoryChecklist();
      const report = generateSupervisoryQuarterlyReport({
        reportNo: 'SUP-2081-Q2',
        fiscalYear: '2081/82',
        quarterBS: 'SECOND_QUARTER',
        inspectionDateBS: '2081/09/15',
        committeeMembers: {
          convener: 'गोविन्द प्रसाद शर्मा (संयोजक)',
          member1: 'राधा चौधरी (सदस्य)',
          member2: 'भीम बहादुर थापा (सदस्य)',
        },
        items: checklist,
        correctiveActions: [
          {
            id: 'CAP-01',
            pillar: 'AML_KYC_SUSPICIOUS',
            findingSummary: 'Old member KYC records missing contact numbers',
            findingSummaryNepali: 'पुराना सदस्यहरूको फोन नम्बर अद्यावधिक नभएको',
            actionRequired: 'Update KYC on next deposit counter visit',
            actionRequiredNepali: 'काउन्टरमा आउँदा अनिवार्य फाराम भराउने',
            assignedTo: 'MANAGER',
            deadlineBS: '2081/10/30',
            status: 'PENDING',
          },
        ],
      });

      expect(report.reportNo).toBe('SUP-2081-Q2');
      expect(report.quarterLabelNepali).toContain('दोस्रो त्रैमासिक');
      expect(report.totalScoreAwarded).toBeGreaterThan(80);
      expect(report.overallRating).toBe('EXCELLENT');
      expect(report.status).toBe('SUBMITTED_TO_BOARD');
      expect(report.correctiveActions.length).toBe(1);
    });
  });

  describe('exportSupervisoryAuditCsv', () => {
    it('exports CSV with metadata and individual checklist audit rows', () => {
      const checklist = createDefaultSupervisoryChecklist();
      const report = generateSupervisoryQuarterlyReport({
        reportNo: 'SUP-2081-Q2',
        fiscalYear: '2081/82',
        quarterBS: 'SECOND_QUARTER',
        inspectionDateBS: '2081/09/15',
        committeeMembers: {
          convener: 'गोविन्द प्रसाद शर्मा',
          member1: 'राधा चौधरी',
          member2: 'भीम बहादुर थापा',
        },
        items: checklist,
        correctiveActions: [],
      });

      const csv = exportSupervisoryAuditCsv(report);
      expect(csv).toContain('प्रतिवेदन नं: SUP-2081-Q2');
      expect(csv).toContain('ढुकुटी नगद तथा भौतिक मौज्दात जाँच');
      expect(csv).toContain('सहकारी ऐन २०७४ दफा ४९(१)(क)');
    });
  });
});
