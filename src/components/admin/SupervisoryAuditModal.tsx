import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  InspectionPillar,
  ChecklistItemStatus,
  SupervisoryChecklistItem,
  CorrectiveActionItem,
  PILLAR_METADATA,
  createDefaultSupervisoryChecklist,
  evaluateSupervisoryAuditScore,
  generateSupervisoryQuarterlyReport,
  exportSupervisoryAuditCsv,
} from '../../utils/supervisoryAuditEngine';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Scale,
  Building,
  Check,
  ClipboardList,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface SupervisoryAuditModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const SupervisoryAuditModal: React.FC<SupervisoryAuditModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency, fmtCount, fmtPercent } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'CHECKLIST' | 'REPORT' | 'ACTION_PLAN' | 'EXPORT'>('CHECKLIST');
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<'ALL' | InspectionPillar>('ALL');

  // Report metadata state
  const [fiscalYear, setFiscalYear] = useState('२०८०/८१');
  const [quarterBS, setQuarterBS] = useState<'FIRST_QUARTER' | 'SECOND_QUARTER' | 'THIRD_QUARTER' | 'FOURTH_QUARTER'>('SECOND_QUARTER');
  const [reportNo, setReportNo] = useState('UNAKO-SUP-2080-Q2-01');
  const [inspectionDateBS, setInspectionDateBS] = useState('२०८०/०९/२५');

  // Committee Signatories
  const [convenerName, setConvenerName] = useState('पदम बहादुर चौधरी');
  const [member1Name, setMember1Name] = useState('शान्ति देवी थारु');
  const [member2Name, setMember2Name] = useState('राम कुमार यादव');

  // Interactive Checklist Items
  const [checklistItems, setChecklistItems] = useState<readonly SupervisoryChecklistItem[]>(() =>
    createDefaultSupervisoryChecklist()
  );

  // Corrective Action Plan Items
  const [actionItems, setActionItems] = useState<readonly CorrectiveActionItem[]>([
    {
      id: 'CAP-01',
      pillar: 'LOAN_COLLATERAL_CUSTODY',
      findingSummary: '२ वटा कर्जा फाइलमा धितो दृष्टिबन्धक लिखत मालपोत प्रमाणित पत्र संलग्न हुन बाँकी',
      findingSummaryNepali: '२ वटा कर्जा फाइलमा धितो दृष्टिबन्धक लिखत मालपोत प्रमाणित पत्र संलग्न हुन बाँकी',
      actionRequired: 'कर्जा अधिकृतले मालपोत कार्यालयबाट रोक्का प्रमाणित पत्र झिकाई फाइलमा सुरक्षित राख्ने।',
      actionRequiredNepali: 'कर्जा अधिकृतले मालपोत कार्यालयबाट रोक्का प्रमाणित पत्र झिकाई फाइलमा सुरक्षित राख्ने।',
      assignedTo: 'LOAN_OFFICER',
      deadlineBS: '२०८०/१०/१५',
      status: 'IN_PROGRESS',
    },
    {
      id: 'CAP-02',
      pillar: 'AML_KYC_SUSPICIOUS',
      findingSummary: 'पुराना सदस्यहरूको व्यक्तिगत विवरण तथा तीनपुस्ते अद्यावधिक हुन बाँकी',
      findingSummaryNepali: 'पुराना सदस्यहरूको व्यक्तिगत विवरण तथा तीनपुस्ते अद्यावधिक हुन बाँकी',
      actionRequired: 'बचत तथा नवीकरण गर्दा अनिवार्य नयाँ केवाइसी (KYC) फाराम भराउने।',
      actionRequiredNepali: 'बचत तथा नवीकरण गर्दा अनिवार्य नयाँ केवाइसी (KYC) फाराम भराउने।',
      assignedTo: 'MANAGER',
      deadlineBS: '२०८०/११/३०',
      status: 'PENDING',
    },
  ]);

  // New action plan form state
  const [newActionPillar, setNewActionPillar] = useState<InspectionPillar>('LOAN_COLLATERAL_CUSTODY');
  const [newActionFinding, setNewActionFinding] = useState('');
  const [newActionRequired, setNewActionRequired] = useState('');
  const [newActionAssignedTo, setNewActionAssignedTo] = useState<'MANAGER' | 'LOAN_OFFICER' | 'ACCOUNTANT' | 'BOARD'>('LOAN_OFFICER');
  const [newActionDeadline, setNewActionDeadline] = useState('२०८०/१०/३०');
  const [showAddActionForm, setShowAddActionForm] = useState(false);

  // Evaluation computation
  const auditScore = useMemo(() => {
    return evaluateSupervisoryAuditScore(checklistItems);
  }, [checklistItems]);

  // Pillar scores breakdown
  const pillarScoreBreakdown = useMemo(() => {
    const pillars: InspectionPillar[] = [
      'CASH_VAULT_PHYSICAL',
      'LOAN_COLLATERAL_CUSTODY',
      'RESERVE_LIQUIDITY_COMPLIANCE',
      'GOVERNANCE_BOARD_MINUTES',
      'AML_KYC_SUSPICIOUS',
    ];

    return pillars.map((p) => {
      const itemsInPillar = checklistItems.filter((i) => i.pillar === p);
      const maxScore = itemsInPillar.reduce((acc, curr) => acc + curr.maxScore, 0);
      const awarded = itemsInPillar.reduce((acc, curr) => acc + curr.scoreAwarded, 0);
      const pct = maxScore > 0 ? Math.round((awarded / maxScore) * 100) : 0;
      return {
        pillar: p,
        meta: PILLAR_METADATA[p],
        maxScore,
        awarded,
        percentage: pct,
      };
    });
  }, [checklistItems]);

  // Filtered Checklist
  const filteredChecklist = useMemo(() => {
    if (selectedPillarFilter === 'ALL') return checklistItems;
    return checklistItems.filter((i) => i.pillar === selectedPillarFilter);
  }, [checklistItems, selectedPillarFilter]);

  // Current Compiled Report
  const currentReport = useMemo(() => {
    return generateSupervisoryQuarterlyReport({
      reportNo,
      fiscalYear,
      quarterBS,
      inspectionDateBS,
      committeeMembers: {
        convener: convenerName,
        member1: member1Name,
        member2: member2Name,
      },
      items: checklistItems,
      correctiveActions: actionItems,
    });
  }, [reportNo, fiscalYear, quarterBS, inspectionDateBS, convenerName, member1Name, member2Name, checklistItems, actionItems]);

  if (!isOpen) return null;

  // Handlers
  const handleStatusChange = (itemId: string, newStatus: ChecklistItemStatus) => {
    setChecklistItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        let newScore = item.scoreAwarded;
        if (newStatus === 'PASS') newScore = item.maxScore;
        else if (newStatus === 'PARTIAL') newScore = Math.floor(item.maxScore / 2);
        else if (newStatus === 'FAIL') newScore = 0;
        else if (newStatus === 'NOT_APPLICABLE') newScore = item.maxScore;

        return {
          ...item,
          status: newStatus,
          scoreAwarded: newScore,
        };
      })
    );
  };

  const handleScoreChange = (itemId: string, scoreVal: number) => {
    setChecklistItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const clamped = Math.max(0, Math.min(item.maxScore, scoreVal));
        let calculatedStatus: ChecklistItemStatus = item.status;
        if (clamped === item.maxScore) calculatedStatus = 'PASS';
        else if (clamped === 0) calculatedStatus = 'FAIL';
        else calculatedStatus = 'PARTIAL';

        return {
          ...item,
          scoreAwarded: clamped,
          status: calculatedStatus,
        };
      })
    );
  };

  const handleFindingsChange = (itemId: string, text: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return { ...item, findingsNepali: text };
      })
    );
  };

  const handleAddActionPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionFinding || !newActionRequired) return;

    const newItem: CorrectiveActionItem = {
      id: `CAP-0${actionItems.length + 1}`,
      pillar: newActionPillar,
      findingSummary: newActionFinding,
      findingSummaryNepali: newActionFinding,
      actionRequired: newActionRequired,
      actionRequiredNepali: newActionRequired,
      assignedTo: newActionAssignedTo,
      deadlineBS: newActionDeadline,
      status: 'PENDING',
    };

    setActionItems((prev) => [...prev, newItem]);
    setNewActionFinding('');
    setNewActionRequired('');
    setShowAddActionForm(false);
  };

  const handleToggleActionStatus = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus =
          item.status === 'PENDING'
            ? 'IN_PROGRESS'
            : item.status === 'IN_PROGRESS'
            ? 'RECTIFIED'
            : 'PENDING';
        return { ...item, status: nextStatus };
      })
    );
  };

  const handleExportCsv = () => {
    const csvContent = exportSupervisoryAuditCsv(currentReport);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Supervisory_Audit_${fiscalYear.replace('/', '-')}_${quarterBS}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'EXCELLENT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            {t('उत्कृष्ट स्तर (EXCELLENT)', 'EXCELLENT')}
          </span>
        );
      case 'SATISFACTORY':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            {t('सन्तोषप्रद (SATISFACTORY)', 'SATISFACTORY')}
          </span>
        );
      case 'NEEDS_IMPROVEMENT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            {t('सुधार आवश्यक (NEEDS IMPROVEMENT)', 'NEEDS IMPROVEMENT')}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            {t('उच्च जोखिम (CRITICAL RISK)', 'CRITICAL RISK')}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
              <Scale className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  {t('सहकारी ऐन २०७४ दफा ४८ र ४९', 'Cooperative Act 2074 Sec 48 & 49')}
                </span>
                <span className="text-xs text-white/80 font-mono">
                  {currentReport.reportNo}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {t(
                  'लेखा सुपरीवेक्षण समिति तथा आन्तरिक लेखापरीक्षण प्रणाली',
                  'Internal Audit & Supervisory Committee Engine'
                )}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            title={t('बन्द गर्नुहोस्', 'Close')}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Global Inspection Bar */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">{t('आर्थिक वर्ष:', 'FY:')}</span>
              <input
                type="text"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">{t('त्रैमास:', 'Quarter:')}</span>
              <select
                value={quarterBS}
                onChange={(e) => setQuarterBS(e.target.value as any)}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
              >
                <option value="FIRST_QUARTER">{t('प्रथम त्रैमासिक (श्रावण–आश्विन)', '1st Quarter')}</option>
                <option value="SECOND_QUARTER">{t('दोस्रो त्रैमासिक (कार्तिक–पौष)', '2nd Quarter')}</option>
                <option value="THIRD_QUARTER">{t('तेस्रो त्रैमासिक (माघ–चैत्र)', '3rd Quarter')}</option>
                <option value="FOURTH_QUARTER">{t('चौथो त्रैमासिक (वैशाख–असार)', '4th Quarter')}</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">{t('निरीक्षण मिति:', 'Audit Date:')}</span>
              <input
                type="text"
                value={inspectionDateBS}
                onChange={(e) => setInspectionDateBS(e.target.value)}
                className="w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{t('प्राप्ताङ्क / कुल भार', 'Score / Max')}</div>
              <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                {auditScore.totalScoreAwarded} / {auditScore.maxTotalScore} ({fmtPercent(auditScore.scorePercentage)})
              </div>
            </div>
            <div>{getRatingBadge(auditScore.overallRating)}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('CHECKLIST')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'CHECKLIST'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ClipboardList className="size-4" />
            <span>{t('१. त्रैमासिक निरीक्षण चेकलिस्ट', '1. Inspection Checklist')}</span>
          </button>
          <button
            onClick={() => setActiveTab('REPORT')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'REPORT'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="size-4" />
            <span>{t('२. सुपरीवेक्षण प्रतिवेदन तथा हस्ताक्षर', '2. Audit Report & Signatures')}</span>
          </button>
          <button
            onClick={() => setActiveTab('ACTION_PLAN')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'ACTION_PLAN'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <AlertCircle className="size-4" />
            <span>
              {t('३. सुधारात्मक कार्ययोजना (CAP)', '3. Corrective Action Plan')}{' '}
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px]">
                {actionItems.length}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'EXPORT'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Download className="size-4" />
            <span>{t('४. अभिलेख तथा निर्यात', '4. Regulatory Export & CSV')}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: CHECKLIST */}
          {activeTab === 'CHECKLIST' && (
            <div className="space-y-4">
              {/* Pillar Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedPillarFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedPillarFilter === 'ALL'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {t('सबै क्षेत्र (५ वटै स्तम्भ)', 'All Pillars (5)')}
                </button>
                {(
                  [
                    'CASH_VAULT_PHYSICAL',
                    'LOAN_COLLATERAL_CUSTODY',
                    'RESERVE_LIQUIDITY_COMPLIANCE',
                    'GOVERNANCE_BOARD_MINUTES',
                    'AML_KYC_SUSPICIOUS',
                  ] as InspectionPillar[]
                ).map((p) => {
                  const meta = PILLAR_METADATA[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setSelectedPillarFilter(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedPillarFilter === p
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {meta.labelNe} ({meta.weightPercent}%)
                    </button>
                  );
                })}
              </div>

              {/* Checklist Items List */}
              <div className="space-y-3">
                {filteredChecklist.map((item) => {
                  const meta = PILLAR_METADATA[item.pillar];
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                              {meta.labelNe}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {item.id}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                              {item.statutoryRef}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.questionNepali}
                          </h4>
                          <p className="text-xs text-slate-500">{item.question}</p>
                        </div>

                        {/* Status Toggle & Scoring */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(item.id, 'PASS')}
                              className={`px-2.5 py-1.5 font-bold transition ${
                                item.status === 'PASS'
                                  ? 'bg-emerald-600 text-white'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {t('सम्पन्न (Pass)', 'Pass')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(item.id, 'PARTIAL')}
                              className={`px-2.5 py-1.5 font-bold transition border-l border-r border-slate-200 dark:border-slate-700 ${
                                item.status === 'PARTIAL'
                                  ? 'bg-amber-500 text-white'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {t('आंशिक (Partial)', 'Partial')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(item.id, 'FAIL')}
                              className={`px-2.5 py-1.5 font-bold transition ${
                                item.status === 'FAIL'
                                  ? 'bg-rose-600 text-white'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {t('त्रुटि (Fail)', 'Fail')}
                            </button>
                          </div>

                          <div className="flex items-center gap-1 pl-2">
                            <span className="text-[10px] text-slate-400 font-bold">{t('अङ्क:', 'Score:')}</span>
                            <input
                              type="number"
                              min={0}
                              max={item.maxScore}
                              value={item.scoreAwarded}
                              onChange={(e) => handleScoreChange(item.id, parseInt(e.target.value) || 0)}
                              className="w-12 px-1.5 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold text-center font-mono"
                            />
                            <span className="text-xs text-slate-400 font-mono">/ {item.maxScore}</span>
                          </div>
                        </div>
                      </div>

                      {/* Findings and Recommendation */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {t('स्थलगत देखिएको यथार्थ (Findings):', 'Field Findings:')}
                          </label>
                          <input
                            type="text"
                            value={item.findingsNepali || ''}
                            onChange={(e) => handleFindingsChange(item.id, e.target.value)}
                            placeholder={t('कैफियत वा वास्तविक विवरण...', 'Findings note...')}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {t('समितिको सुझाव (Recommendation):', 'Committee Recommendation:')}
                          </label>
                          <input
                            type="text"
                            value={item.recommendationNepali || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setChecklistItems((prev) =>
                                prev.map((ci) => (ci.id === item.id ? { ...ci, recommendationNepali: val } : ci))
                              );
                            }}
                            placeholder={t('सुधारका लागि निर्देशन...', 'Recommendation for action...')}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: REPORT & SIGNATURES */}
          {activeTab === 'REPORT' && (
            <div className="space-y-6">
              {/* Report Header Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 shadow-md space-y-6 print:border-none print:shadow-none">
                <div className="text-center space-y-1 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    {t('नेपाल सरकार सहकारी विभाग दर्ता नं. २४५/०६४/०६५', 'Approved Cooperative SACCOS Reg. 245/064/065')}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {t('उनको बचत तथा ऋण सहकारी संस्था लिमिटेड', 'UNAKO SAVING & CREDIT COOPERATIVE SOCIETY LTD.')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('गढवा गाउँपालिका वडा नं. ५, दाङ, लुम्बिनी प्रदेश', 'Gadhawa-5, Dang, Lumbini Province, Nepal')}
                  </p>
                  <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('लेखा सुपरीवेक्षण समितिको त्रैमासिक निरीक्षण प्रतिवेदन', 'Quarterly Internal Audit & Supervisory Report')}
                  </div>
                </div>

                {/* Key Metadata Table */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs">
                  <div>
                    <span className="text-slate-400 block">{t('प्रतिवेदन नं:', 'Report No:')}</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{currentReport.reportNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('आर्थिक वर्ष:', 'Fiscal Year:')}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentReport.fiscalYear}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('निरीक्षण अवधि:', 'Inspection Period:')}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentReport.quarterLabelNepali}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('समिति पेश मिति:', 'Submission Date:')}</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{currentReport.inspectionDateBS}</span>
                  </div>
                </div>

                {/* Pillar Breakdown Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {t('स्तम्भगत प्राप्ताङ्क तथा मूल्यांकन (Pillar Breakdown)', 'Pillar Score Evaluation')}
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        <tr>
                          <th className="p-2.5">{t('निरीक्षण क्षेत्र (Pillar)', 'Pillar')}</th>
                          <th className="p-2.5 text-center">{t('भार (Weight)', 'Weight')}</th>
                          <th className="p-2.5 text-center">{t('पूर्णाङ्क', 'Max')}</th>
                          <th className="p-2.5 text-center">{t('प्राप्ताङ्क', 'Score')}</th>
                          <th className="p-2.5 text-center">{t('अनुपालन दर', 'Compliance %')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {pillarScoreBreakdown.map((row) => (
                          <tr key={row.pillar} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 font-medium text-slate-900 dark:text-slate-200">
                              {row.meta.labelNe}
                            </td>
                            <td className="p-2.5 text-center font-mono">{row.meta.weightPercent}%</td>
                            <td className="p-2.5 text-center font-mono">{row.maxScore}</td>
                            <td className="p-2.5 text-center font-bold text-blue-600 font-mono">{row.awarded}</td>
                            <td className="p-2.5 text-center font-bold">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                                  row.percentage >= 85
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : row.percentage >= 70
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {fmtPercent(row.percentage)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border-t border-slate-300 dark:border-slate-700">
                        <tr>
                          <td className="p-2.5">{t('समग्र कुल प्राप्ताङ्क (Total Score)', 'Aggregate Score')}</td>
                          <td className="p-2.5 text-center font-mono">100%</td>
                          <td className="p-2.5 text-center font-mono">{auditScore.maxTotalScore}</td>
                          <td className="p-2.5 text-center font-bold text-blue-600 font-mono">{auditScore.totalScoreAwarded}</td>
                          <td className="p-2.5 text-center font-bold font-mono">{fmtPercent(auditScore.scorePercentage)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
                  <div className="font-bold text-xs text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <FileCheck className="size-4 text-blue-600" />
                    <span>{t('समितिको कार्यकारी निष्कर्ष (Executive Audit Summary):', 'Executive Summary:')}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentReport.executiveSummaryNepali}
                  </p>
                </div>

                {/* Signatories Section */}
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('लेखा सुपरीवेक्षण समिति पदाधिकारीहरू (Supervisory Committee Signatures):', 'Signatures:')}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center space-y-2">
                      <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 flex items-end justify-center pb-1">
                        <span className="text-[11px] font-mono text-emerald-600 font-bold">✓ {t('डिजिटल प्रमाणित', 'Verified')}</span>
                      </div>
                      <input
                        type="text"
                        value={convenerName}
                        onChange={(e) => setConvenerName(e.target.value)}
                        className="text-xs font-bold text-center w-full bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none"
                      />
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{t('संयोजक (Convener)', 'Convener')}</div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center space-y-2">
                      <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 flex items-end justify-center pb-1">
                        <span className="text-[11px] font-mono text-emerald-600 font-bold">✓ {t('डिजिटल प्रमाणित', 'Verified')}</span>
                      </div>
                      <input
                        type="text"
                        value={member1Name}
                        onChange={(e) => setMember1Name(e.target.value)}
                        className="text-xs font-bold text-center w-full bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none"
                      />
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{t('सदस्य (Member)', 'Member')}</div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center space-y-2">
                      <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 flex items-end justify-center pb-1">
                        <span className="text-[11px] font-mono text-emerald-600 font-bold">✓ {t('डिजिटल प्रमाणित', 'Verified')}</span>
                      </div>
                      <input
                        type="text"
                        value={member2Name}
                        onChange={(e) => setMember2Name(e.target.value)}
                        className="text-xs font-bold text-center w-full bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none"
                      />
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{t('सदस्य (Member)', 'Member')}</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow hover:bg-slate-800 transition"
                  >
                    <Printer className="size-4" />
                    <span>{t('प्रतिवेदन प्रिन्ट गर्नुहोस्', 'Print Formal Report')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTION PLAN (CAP) */}
          {activeTab === 'ACTION_PLAN' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('सुधारात्मक कार्ययोजना सूची (Corrective Action Plan Tracker)', 'Action Plan Tracker')}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {t(
                      'निरीक्षणका क्रममा देखिएका कैफियत सुधारका लागि कर्मचारी तथा सञ्चालकहरूलाई तोकिएका जिम्मेवारीहरू',
                      'Specific tasks assigned to management, loan officer, accountant, or board'
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddActionForm(!showAddActionForm)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                >
                  <Plus className="size-3.5" />
                  <span>{t('नयाँ कार्य थप्नुहोस्', 'Add Action')}</span>
                </button>
              </div>

              {/* Add Action Form */}
              {showAddActionForm && (
                <form
                  onSubmit={handleAddActionPlan}
                  className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 space-y-3 text-xs"
                >
                  <div className="font-bold text-blue-900 dark:text-blue-300">
                    {t('नयाँ सुधारात्मक निर्देशन दर्ता गर्नुहोस्', 'Register New Corrective Action')}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                        {t('निरीक्षण क्षेत्र', 'Pillar')}
                      </label>
                      <select
                        value={newActionPillar}
                        onChange={(e) => setNewActionPillar(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="CASH_VAULT_PHYSICAL">{t('ढुकुटी नगद तथा भौतिक मौज्दात', 'Cash Vault')}</option>
                        <option value="LOAN_COLLATERAL_CUSTODY">{t('कर्जा तमसुक तथा धितो लालपुर्जा', 'Loan Collateral')}</option>
                        <option value="RESERVE_LIQUIDITY_COMPLIANCE">{t('अनिवार्य जगेडा कोष तथा तरलता', 'Reserves & Liquidity')}</option>
                        <option value="GOVERNANCE_BOARD_MINUTES">{t('सञ्चालक समिति निर्णय', 'Board Decisions')}</option>
                        <option value="AML_KYC_SUSPICIOUS">{t('शंकास्पद कारोबार तथा सम्पत्ति शुद्धीकरण', 'AML/KYC')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                        {t('जिम्मेवार पदाधिकारी', 'Assigned To')}
                      </label>
                      <select
                        value={newActionAssignedTo}
                        onChange={(e) => setNewActionAssignedTo(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="LOAN_OFFICER">{t('कर्जा अधिकृत (Loan Officer)', 'Loan Officer')}</option>
                        <option value="MANAGER">{t('व्यवस्थापक (Manager)', 'Manager')}</option>
                        <option value="ACCOUNTANT">{t('लेखापाल (Accountant)', 'Accountant')}</option>
                        <option value="BOARD">{t('सञ्चालक समिति (BOD)', 'Board of Directors')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                        {t('सुधार म्याद मिति', 'Deadline BS')}
                      </label>
                      <input
                        type="text"
                        value={newActionDeadline}
                        onChange={(e) => setNewActionDeadline(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                      {t('कैफियत विवरण (Findings)', 'Finding')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('जस्तै: तमसुकमा साक्षीको औंठाछाप अस्पष्ट रहेको...', 'Finding description...')}
                      value={newActionFinding}
                      onChange={(e) => setNewActionFinding(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                      {t('गर्नुपर्ने सुधारात्मक कार्य (Action Required)', 'Action Required')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('जस्तै: ऋणी र साक्षीलाई कार्यालयमा बोलाई पुनः औंठाछाप प्रमाणित गराउने...', 'Required action...')}
                      value={newActionRequired}
                      onChange={(e) => setNewActionRequired(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddActionForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      {t('रद्द गर्नुहोस्', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      {t('कार्ययोजना सुरक्षित गर्नुहोस्', 'Save Action')}
                    </button>
                  </div>
                </form>
              )}

              {/* Table of Action Items */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3">{t('संकेत नं.', 'ID')}</th>
                      <th className="p-3">{t('निरीक्षण क्षेत्र', 'Pillar')}</th>
                      <th className="p-3">{t('स्थलगत देखिएको कैफियत', 'Finding')}</th>
                      <th className="p-3">{t('गर्नुपर्ने सुधार', 'Action Required')}</th>
                      <th className="p-3">{t('तोकिएको पद', 'Assigned To')}</th>
                      <th className="p-3">{t('म्याद मिति', 'Deadline')}</th>
                      <th className="p-3 text-center">{t('अवस्था', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {actionItems.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-slate-500">{act.id}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {PILLAR_METADATA[act.pillar]?.labelNe || act.pillar}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-900 dark:text-white max-w-xs">
                          {act.findingSummaryNepali}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs">
                          {act.actionRequiredNepali}
                        </td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300">
                          {act.assignedTo === 'MANAGER'
                            ? t('व्यवस्थापक', 'Manager')
                            : act.assignedTo === 'LOAN_OFFICER'
                            ? t('कर्जा अधिकृत', 'Loan Officer')
                            : act.assignedTo === 'ACCOUNTANT'
                            ? t('लेखापाल', 'Accountant')
                            : t('सञ्चालक समिति', 'Board')}
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{act.deadlineBS}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActionStatus(act.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                              act.status === 'RECTIFIED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : act.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {act.status === 'RECTIFIED'
                              ? t('✓ सुधार सम्पन्न', 'Rectified')
                              : act.status === 'IN_PROGRESS'
                              ? t('प्रगतिमा', 'In Progress')
                              : t('पेन्डिङ', 'Pending')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT & STATUTORY ARCHIVE */}
          {activeTab === 'EXPORT' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-400/30">
                    <Download className="size-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      {t('नियामक निकाय तथा सञ्चालक समिति अभिलेख डाउनलोड', 'Download Board & Regulatory Audit CSV')}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {t(
                        'सहकारी विभाग, डिभिजन कार्यालय र वार्षिक साधारण सभामा पेश गर्न योग्य पूर्ण अडिट सिट निर्यात गर्नुहोस्।',
                        'Export the quarterly checklist, awarded points, findings, and committee action plans.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg transition"
                  >
                    <Download className="size-4" />
                    <span>{t('CSV अडिट फाइल डाउनलोड (.csv)', 'Download Audit File (.csv)')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentReport, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute('href', dataStr);
                      downloadAnchor.setAttribute('download', `Supervisory_Report_${fiscalYear.replace('/', '-')}_${quarterBS}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition"
                  >
                    <FileText className="size-4" />
                    <span>{t('डिजिटल JSON अभिलेख', 'JSON Archive')}</span>
                  </button>
                </div>
              </div>

              {/* Statutory Framework Information */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>{t('सहकारी ऐन २०७४ अन्तर्गत लेखा सुपरीवेक्षण समितिका मुख्य कानुनी व्यवस्थाहरू:', 'Statutory Provisions under Cooperative Act 2074:')}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1 leading-relaxed">
                  <li>
                    <strong>{t('दफा ४८ (गठन):', 'Sec 48 (Formation):')}</strong>{' '}
                    {t(
                      'साधारण सभाले आफ्ना सदस्यहरू मध्येबाट १ जना संयोजक र २ जना सदस्य रहने गरी ३ सदस्यीय लेखा सुपरीवेक्षण समिति गठन गर्नेछ।',
                      'AGM elects a 3-member independent supervisory committee (1 Convener + 2 Members).'
                    )}
                  </li>
                  <li>
                    <strong>{t('दफा ४९ (काम, कर्तव्य र अधिकार):', 'Sec 49 (Powers & Duties):')}</strong>{' '}
                    {t(
                      'प्रत्येक ३/३ महिनामा संस्थाको आर्थिक कारोबार, ढुकुटीको भौतिक नगद, धितो सुरक्षण तथा हिसाब-किताबको आन्तरिक लेखापरीक्षण गरी सञ्चालक समिति समक्ष प्रतिवेदन पेश गर्ने।',
                      'Conduct mandatory quarterly inspection of cash vault, collateral records, accounts, and submit quarterly reports to the Board.'
                    )}
                  </li>
                  <li>
                    <strong>{t('दफा ५० (प्रतिवेदन पेश गर्ने):', 'Sec 50 (Reporting):')}</strong>{' '}
                    {t(
                      'वार्षिक लेखापरीक्षण प्रतिवेदन तथा आफ्नो वार्षिक सुपरीवेक्षण प्रतिवेदन सिधै साधारण सभामा पेश गर्ने र आवश्यक परे विशेष साधारण सभा बोलाउन सञ्चालक समितिलाई निर्देशन दिने।',
                      'Submit the annual supervisory report directly to the AGM and issue directives to convene special AGM if needed.'
                    )}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('उनको साकोस आन्तरिक सुशासन प्रणाली सक्रिय', 'Unako SACCOS Internal Governance System Active')}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
