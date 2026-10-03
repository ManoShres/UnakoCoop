import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  BorrowerCreditScoreInput,
  CreditRiskEvaluationReport,
  CreditRiskGrade,
  evaluateBorrowerCreditRisk,
  exportCreditRiskReportCsv,
  createDefaultBorrowerScoreInputs,
} from '../../utils/creditRiskRatingEngine';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Award,
  Sparkles,
  Search,
  Plus,
  FileText,
  User,
  Building,
  TrendingUp,
  Percent,
} from 'lucide-react';

interface CreditRiskRatingModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const CreditRiskRatingModal: React.FC<CreditRiskRatingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency, fmtCount, fmtDigits, fmtPercent } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'EVALUATOR' | 'APPRAISAL_SHEET' | 'PORTFOLIO_MATRIX' | 'EXPORT'>('EVALUATOR');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | CreditRiskGrade>('ALL');

  // Input profiles state
  const [profiles, setProfiles] = useState<readonly BorrowerCreditScoreInput[]>(() =>
    createDefaultBorrowerScoreInputs()
  );
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);

  // Active form inputs (bound to selected profile)
  const activeInput = profiles[selectedProfileIndex] || profiles[0];

  const [applicantName, setApplicantName] = useState(activeInput.applicantName);
  const [memberNo, setMemberNo] = useState(activeInput.memberNo);
  const [membershipMonths, setMembershipMonths] = useState(activeInput.membershipMonths);
  const [requestedAmount, setRequestedAmount] = useState(activeInput.requestedAmount);
  const [verifiedMonthlyIncome, setVerifiedMonthlyIncome] = useState(activeInput.verifiedMonthlyIncome);
  const [totalMonthlyDebtObligations, setTotalMonthlyDebtObligations] = useState(activeInput.totalMonthlyDebtObligations);
  const [shareCapitalBalance, setShareCapitalBalance] = useState(activeInput.shareCapitalBalance);
  const [regularSavingsBalance, setRegularSavingsBalance] = useState(activeInput.regularSavingsBalance);
  const [collateralAssessedValue, setCollateralAssessedValue] = useState(activeInput.collateralAssessedValue);
  const [hasCibDefaultRecord, setHasCibDefaultRecord] = useState(activeInput.hasCibDefaultRecord);
  const [hasActiveInsurance, setHasActiveInsurance] = useState(activeInput.hasActiveInsurance);
  const [hasStrongGuarantor, setHasStrongGuarantor] = useState(activeInput.hasStrongGuarantor);
  const [projectFeasibilityScore, setProjectFeasibilityScore] = useState(activeInput.projectFeasibilityScore);

  // When selectedProfileIndex changes, sync the state
  const handleSelectProfile = (idx: number) => {
    setSelectedProfileIndex(idx);
    const p = profiles[idx];
    if (p) {
      setApplicantName(p.applicantName);
      setMemberNo(p.memberNo);
      setMembershipMonths(p.membershipMonths);
      setRequestedAmount(p.requestedAmount);
      setVerifiedMonthlyIncome(p.verifiedMonthlyIncome);
      setTotalMonthlyDebtObligations(p.totalMonthlyDebtObligations);
      setShareCapitalBalance(p.shareCapitalBalance);
      setRegularSavingsBalance(p.regularSavingsBalance);
      setCollateralAssessedValue(p.collateralAssessedValue);
      setHasCibDefaultRecord(p.hasCibDefaultRecord);
      setHasActiveInsurance(p.hasActiveInsurance);
      setHasStrongGuarantor(p.hasStrongGuarantor);
      setProjectFeasibilityScore(p.projectFeasibilityScore);
    }
  };

  // Current Evaluation
  const currentEvaluation: CreditRiskEvaluationReport = useMemo(() => {
    return evaluateBorrowerCreditRisk({
      applicantName,
      memberNo,
      membershipMonths,
      requestedAmount,
      verifiedMonthlyIncome,
      totalMonthlyDebtObligations,
      shareCapitalBalance,
      regularSavingsBalance,
      collateralAssessedValue,
      hasCibDefaultRecord,
      hasActiveInsurance,
      hasStrongGuarantor,
      projectFeasibilityScore,
    });
  }, [
    applicantName,
    memberNo,
    membershipMonths,
    requestedAmount,
    verifiedMonthlyIncome,
    totalMonthlyDebtObligations,
    shareCapitalBalance,
    regularSavingsBalance,
    collateralAssessedValue,
    hasCibDefaultRecord,
    hasActiveInsurance,
    hasStrongGuarantor,
    projectFeasibilityScore,
  ]);

  // All Evaluated Reports
  const allEvaluations: readonly CreditRiskEvaluationReport[] = useMemo(() => {
    return profiles.map((p, idx) =>
      idx === selectedProfileIndex ? currentEvaluation : evaluateBorrowerCreditRisk(p)
    );
  }, [profiles, selectedProfileIndex, currentEvaluation]);

  // Filtered Evaluations
  const filteredEvaluations = useMemo(() => {
    if (gradeFilter === 'ALL') return allEvaluations;
    return allEvaluations.filter((e) => e.grade === gradeFilter);
  }, [allEvaluations, gradeFilter]);

  // Aggregate Counts
  const gradeCounts = useMemo(() => {
    return {
      gradeA: allEvaluations.filter((e) => e.grade === 'GRADE_A_PRIME').length,
      gradeB: allEvaluations.filter((e) => e.grade === 'GRADE_B_MODERATE').length,
      gradeC: allEvaluations.filter((e) => e.grade === 'GRADE_C_CONDITIONAL').length,
      gradeD: allEvaluations.filter((e) => e.grade === 'GRADE_D_REJECTED').length,
    };
  }, [allEvaluations]);

  if (!isOpen) return null;

  const handleExportCsv = () => {
    const csv = exportCreditRiskReportCsv(allEvaluations);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Credit_Risk_Scoring_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getGradeBadge = (grade: CreditRiskGrade) => {
    switch (grade) {
      case 'GRADE_A_PRIME':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
            {t('क वर्ग (उत्कृष्ट / Prime)', 'Grade A (Prime)')}
          </span>
        );
      case 'GRADE_B_MODERATE':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300">
            {t('ख वर्ग (सन्तोषप्रद / Moderate)', 'Grade B (Moderate)')}
          </span>
        );
      case 'GRADE_C_CONDITIONAL':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
            {t('ग वर्ग (सशर्त / Conditional)', 'Grade C (Conditional)')}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
            {t('घ वर्ग (अस्वीकृत / Rejected)', 'Grade D (Rejected)')}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-700 via-orange-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
              <Award className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  {t('सहकारी ऐन २०७४ दफा ५० र ५१', 'Coop Act 2074 Sec 50 & 51')}
                </span>
                <span className="text-xs text-white/80 font-mono">
                  {t('5 Cs of Credit', '5 Cs of Credit Scoring')}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {t(
                  'ऋणी सदस्य कर्जा जोखिम रेटिङ तथा क्रेडिट स्कोरिङ प्रणाली',
                  'Member Credit Risk Rating & Borrower Scoring Engine'
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

        {/* Global Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 shrink-0 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">{t('कुल मूल्याङ्कित आवेदक:', 'Evaluated Applicants:')}</span>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
              {fmtCount(allEvaluations.length)} {t('जना', 'members')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">{t('क वर्ग:', 'Grade A (Prime):')}</span>
            <span className="text-sm font-black text-emerald-600 font-mono">
              {fmtCount(gradeCounts.gradeA)} {t('जना', 'members')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">{t('ख वर्ग:', 'Grade B (Standard):')}</span>
            <span className="text-sm font-black text-blue-600 font-mono">
              {fmtCount(gradeCounts.gradeB)} {t('जना', 'members')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">{t('ग वर्ग:', 'Grade C (Conditional):')}</span>
            <span className="text-sm font-black text-amber-600 font-mono">
              {fmtCount(gradeCounts.gradeC)} {t('जना', 'members')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">{t('घ वर्ग (Rejected <50):', 'Grade D (Rejected):')}</span>
            <span className="text-sm font-black text-rose-600 font-mono">
              {fmtCount(gradeCounts.gradeD)} {t('जना', 'members')}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('EVALUATOR')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'EVALUATOR'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="size-4" />
            <span>{t('१. आवेदक कर्जा जोखिम स्कोरिङ', '1. Borrower Risk Scoring')}</span>
          </button>
          <button
            onClick={() => setActiveTab('APPRAISAL_SHEET')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'APPRAISAL_SHEET'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="size-4" />
            <span>{t('२. कर्जा मूल्याङ्कन फाराम', '2. Credit Appraisal Sheet')}</span>
          </button>
          <button
            onClick={() => setActiveTab('PORTFOLIO_MATRIX')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'PORTFOLIO_MATRIX'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Scale className="size-4" />
            <span>{t('३. पोर्टफोलियो जोखिम वर्गीकरण', '3. Risk Grading Matrix')}</span>
          </button>
          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'EXPORT'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Download className="size-4" />
            <span>{t('४. नियामक प्रतिवेदन तथा CSV', '4. Report & CSV Export')}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: EVALUATOR */}
          {activeTab === 'EVALUATOR' && (
            <div className="space-y-4">
              {/* Profile Picker Pill Buttons */}
              <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">{t('नमूना आवेदक छान्नुहोस्:', 'Select Applicant:')}</span>
                {profiles.map((p, idx) => (
                  <button
                    key={p.memberNo}
                    type="button"
                    onClick={() => handleSelectProfile(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedProfileIndex === idx
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {p.applicantName.split(' ')[0]} ({p.memberNo})
                  </button>
                ))}
              </div>

              {/* Two Column Layout: Form Inputs on Left, Real-time Scorecard on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Columns: 5 Cs Form Inputs */}
                <div className="lg:col-span-7 space-y-4 text-xs">
                  {/* Basic & Financial Inputs */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-3">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>{t('आवेदक तथा वित्तीय विवरण', 'Applicant & Financials')}</span>
                      <span className="font-mono text-slate-400">{memberNo}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-500 mb-1">{t('आवेदकको नाम', 'Applicant Name')}</label>
                        <input
                          type="text"
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-500 mb-1">{t('सदस्यता अवधि (महिना)', 'Membership Months')}</label>
                        <input
                          type="number"
                          value={membershipMonths}
                          onChange={(e) => setMembershipMonths(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-500 mb-1">{t('माग कर्जा रकम (NPR)', 'Requested Amount')}</label>
                        <input
                          type="number"
                          step={50000}
                          value={requestedAmount}
                          onChange={(e) => setRequestedAmount(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-500 mb-1">{t('धितो मूल्याङ्कन रकम (NPR)', 'Collateral Value')}</label>
                        <input
                          type="number"
                          step={100000}
                          value={collateralAssessedValue}
                          onChange={(e) => setCollateralAssessedValue(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-500 mb-1">{t('प्रमाणित मासिक आय', 'Monthly Income')}</label>
                        <input
                          type="number"
                          step={5000}
                          value={verifiedMonthlyIncome}
                          onChange={(e) => setVerifiedMonthlyIncome(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-500 mb-1">{t('प्रस्तावित कुल मासिक किस्ता', 'Monthly Debt')}</label>
                        <input
                          type="number"
                          step={2000}
                          value={totalMonthlyDebtObligations}
                          onChange={(e) => setTotalMonthlyDebtObligations(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-500 mb-1">{t('सेयर पुँजी मौज्दात', 'Share Capital')}</label>
                        <input
                          type="number"
                          step={5000}
                          value={shareCapitalBalance}
                          onChange={(e) => setShareCapitalBalance(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-500 mb-1">{t('नियमित बचत मौज्दात', 'Regular Savings')}</label>
                        <input
                          type="number"
                          step={5000}
                          value={regularSavingsBalance}
                          onChange={(e) => setRegularSavingsBalance(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Risk Gate Toggles */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2.5">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {t('साख इतिहास तथा सुरक्षण सर्तहरू', 'Risk Controls')}
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <input
                        type="checkbox"
                        checked={hasCibDefaultRecord}
                        onChange={(e) => setHasCibDefaultRecord(e.target.checked)}
                        className="size-4 rounded accent-rose-600"
                      />
                      <span className="font-bold text-rose-600">
                        {t('CIB मा कालोसूची वा खराब कर्जा इतिहास रहेको', 'CIB Default Flag')}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <input
                        type="checkbox"
                        checked={hasActiveInsurance}
                        onChange={(e) => setHasActiveInsurance(e.target.checked)}
                        className="size-4 rounded accent-emerald-600"
                      />
                      <span>{t('सक्रिय बाली, पशुपन्छी वा धितो बीमा पोलिसी संलग्न', 'Active Insurance Attached')}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <input
                        type="checkbox"
                        checked={hasStrongGuarantor}
                        onChange={(e) => setHasStrongGuarantor(e.target.checked)}
                        className="size-4 rounded accent-emerald-600"
                      />
                      <span>{t('सबल व्यक्तिगत जमानीकर्ता', 'Verifiable Guarantor')}</span>
                    </label>

                    <div className="pt-2">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-slate-500">{t('परियोजना सम्भाव्यता स्कोर:', 'Feasibility:')}</span>
                        <span className="font-mono font-bold text-blue-600">{projectFeasibilityScore} / 15</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={15}
                        value={projectFeasibilityScore}
                        onChange={(e) => setProjectFeasibilityScore(Number(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: Dynamic Scorecard & 5 Cs Breakdown */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Score Hero Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {t('कुल प्राप्ताङ्क', 'Total Score')}
                      </span>
                      {getGradeBadge(currentEvaluation.grade)}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-amber-400 font-mono">
                        {currentEvaluation.totalScore}
                      </span>
                      <span className="text-slate-400 text-sm font-mono">/ 100</span>
                    </div>

                    {/* DSTI and LTV Indicators */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('किस्ता भार (DSTI):', 'DSTI Ratio:')}</span>
                        <span
                          className={`font-mono font-bold text-sm ${
                            currentEvaluation.dstiRatio <= 50 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {currentEvaluation.dstiRatio}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('धितो कभरेज (LTV):', 'LTV Ratio:')}</span>
                        <span
                          className={`font-mono font-bold text-sm ${
                            currentEvaluation.ltvRatio <= 65 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {currentEvaluation.ltvRatio}%
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 text-[11px] leading-relaxed text-slate-300">
                      <strong>{t('निर्णय सिफारिस:', 'Decision:')}</strong>{' '}
                      {currentEvaluation.recommendationNe}
                    </div>
                  </div>

                  {/* 5 Cs Pillar Breakdown List */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-3 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      {t('५ स्तम्भ विश्लेषण (5 Cs Breakdown)', '5 Cs Breakdown')}
                    </div>

                    <div className="space-y-2">
                      {/* Character */}
                      <div>
                        <div className="flex justify-between text-[11px] font-medium">
                          <span>{t('१. चरित्र तथा साख:', 'Character:')}</span>
                          <span className="font-mono font-bold text-blue-600">
                            {currentEvaluation.pillarScores.CHARACTER.score} / 25
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${currentEvaluation.pillarScores.CHARACTER.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Capacity */}
                      <div>
                        <div className="flex justify-between text-[11px] font-medium">
                          <span>{t('२. भुक्तानी क्षमता:', 'Capacity:')}</span>
                          <span className="font-mono font-bold text-emerald-600">
                            {currentEvaluation.pillarScores.CAPACITY.score} / 25
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${currentEvaluation.pillarScores.CAPACITY.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Capital */}
                      <div>
                        <div className="flex justify-between text-[11px] font-medium">
                          <span>{t('३. पुँजी तथा सेयर:', 'Capital:')}</span>
                          <span className="font-mono font-bold text-purple-600">
                            {currentEvaluation.pillarScores.CAPITAL.score} / 15
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${currentEvaluation.pillarScores.CAPITAL.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Collateral */}
                      <div>
                        <div className="flex justify-between text-[11px] font-medium">
                          <span>{t('४. धितो सुरक्षण:', 'Collateral:')}</span>
                          <span className="font-mono font-bold text-amber-600">
                            {currentEvaluation.pillarScores.COLLATERAL.score} / 20
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-amber-600 rounded-full"
                            style={{ width: `${currentEvaluation.pillarScores.COLLATERAL.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Conditions */}
                      <div>
                        <div className="flex justify-between text-[11px] font-medium">
                          <span>{t('५. व्यावसायिक सर्त:', 'Conditions:')}</span>
                          <span className="font-mono font-bold text-teal-600">
                            {currentEvaluation.pillarScores.CONDITIONS.score} / 15
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-teal-600 rounded-full"
                            style={{ width: `${currentEvaluation.pillarScores.CONDITIONS.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPRAISAL SHEET */}
          {activeTab === 'APPRAISAL_SHEET' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 shadow-md space-y-6 print:border-none print:shadow-none text-xs">
                {/* Formal Header */}
                <div className="text-center space-y-1 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                    {t('ऋण उपसमिति मूल्याङ्कन प्रतिवेदन', 'Credit Subcommittee Appraisal')}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {t('उनको बचत तथा ऋण सहकारी संस्था लिमिटेड', 'UNAKO SAVING & CREDIT COOPERATIVE SOCIETY LTD.')}
                  </h3>
                  <div className="text-slate-500">
                    {t('ऋणी सदस्य कर्जा जोखिम रेटिङ तथा सिफारिस फाराम', 'Borrower Credit Risk Rating & Appraisal Sheet')}
                  </div>
                </div>

                {/* Member Particulars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <div>
                    <span className="text-slate-400 block">{t('आवेदकको नाम:', 'Applicant:')}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentEvaluation.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('सदस्यता नं:', 'Member No:')}</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{currentEvaluation.memberNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('माग कर्जा रकम:', 'Requested Amount:')}</span>
                    <span className="font-bold text-emerald-600 font-mono">{fmtCurrency(currentEvaluation.requestedAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('जोखिम वर्ग:', 'Risk Grade:')}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentEvaluation.gradeLabelNe}</span>
                  </div>
                </div>

                {/* Score Breakdown Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="p-3">{t('५ स्तम्भ', '5 Cs Pillar')}</th>
                        <th className="p-3 text-center">{t('पूर्णाङ्क', 'Max')}</th>
                        <th className="p-3 text-center">{t('प्राप्ताङ्क', 'Score')}</th>
                        <th className="p-3">{t('मूल्याङ्कन निष्कर्ष', 'Assessment Summary')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      <tr>
                        <td className="p-3 font-medium text-slate-900 dark:text-white">१. चरित्र (Character)</td>
                        <td className="p-3 text-center font-mono">25</td>
                        <td className="p-3 text-center font-mono font-bold text-blue-600">
                          {currentEvaluation.pillarScores.CHARACTER.score}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">
                          {currentEvaluation.pillarScores.CHARACTER.commentsNe}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-slate-900 dark:text-white">२. भुक्तानी क्षमता (Capacity)</td>
                        <td className="p-3 text-center font-mono">25</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-600">
                          {currentEvaluation.pillarScores.CAPACITY.score}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">
                          {currentEvaluation.pillarScores.CAPACITY.commentsNe}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-slate-900 dark:text-white">३. पुँजी तथा सेयर (Capital)</td>
                        <td className="p-3 text-center font-mono">15</td>
                        <td className="p-3 text-center font-mono font-bold text-purple-600">
                          {currentEvaluation.pillarScores.CAPITAL.score}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">
                          {currentEvaluation.pillarScores.CAPITAL.commentsNe}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-slate-900 dark:text-white">४. धितो सुरक्षण (Collateral)</td>
                        <td className="p-3 text-center font-mono">20</td>
                        <td className="p-3 text-center font-mono font-bold text-amber-600">
                          {currentEvaluation.pillarScores.COLLATERAL.score}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">
                          {currentEvaluation.pillarScores.COLLATERAL.commentsNe}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-slate-900 dark:text-white">५. व्यावसायिक सर्त (Conditions)</td>
                        <td className="p-3 text-center font-mono">15</td>
                        <td className="p-3 text-center font-mono font-bold text-teal-600">
                          {currentEvaluation.pillarScores.CONDITIONS.score}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">
                          {currentEvaluation.pillarScores.CONDITIONS.commentsNe}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border-t border-slate-300 dark:border-slate-700">
                      <tr>
                        <td className="p-3 text-slate-900 dark:text-white">{t('समग्र कुल प्राप्ताङ्क', 'Aggregate Score')}</td>
                        <td className="p-3 text-center font-mono">100</td>
                        <td className="p-3 text-center font-mono font-black text-amber-600 text-sm">
                          {currentEvaluation.totalScore}
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {currentEvaluation.gradeLabelNe}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Signatures */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 font-bold">
                      {t('दिलीप कुमार थारु', 'Dilip Kumar Tharu')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{t('कर्जा अधिकृत', 'Loan Officer')}</div>
                  </div>
                  <div>
                    <div className="border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 font-bold">
                      {t('शान्ति चौधरी', 'Shanti Chaudhary')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{t('ऋण उपसमिति संयोजक', 'Credit Convener')}</div>
                  </div>
                  <div>
                    <div className="border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 font-bold">
                      {t('अर्जुन प्रसाद शर्मा', 'Arjun Prasad Sharma')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{t('व्यवस्थापक', 'General Manager')}</div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow hover:bg-slate-800 transition"
                  >
                    <Printer className="size-4" />
                    <span>{t('प्रतिवेदन प्रिन्ट गर्नुहोस्', 'Print Appraisal Sheet')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PORTFOLIO RISK MATRIX */}
          {activeTab === 'PORTFOLIO_MATRIX' && (
            <div className="space-y-4">
              {/* Grade Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setGradeFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    gradeFilter === 'ALL'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {t('सबै आवेदक', 'All Applicants')}
                </button>
                <button
                  onClick={() => setGradeFilter('GRADE_A_PRIME')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    gradeFilter === 'GRADE_A_PRIME'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  क वर्ग (Prime)
                </button>
                <button
                  onClick={() => setGradeFilter('GRADE_B_MODERATE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    gradeFilter === 'GRADE_B_MODERATE'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  ख वर्ग (Moderate)
                </button>
                <button
                  onClick={() => setGradeFilter('GRADE_C_CONDITIONAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    gradeFilter === 'GRADE_C_CONDITIONAL'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  ग वर्ग (Conditional)
                </button>
                <button
                  onClick={() => setGradeFilter('GRADE_D_REJECTED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    gradeFilter === 'GRADE_D_REJECTED'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  घ वर्ग (Rejected)
                </button>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3">{t('आवेदक विवरण', 'Applicant')}</th>
                      <th className="p-3 text-right">{t('माग रकम', 'Amount')}</th>
                      <th className="p-3 text-center">{t('कुल स्कोर', 'Score')}</th>
                      <th className="p-3 text-center">{t('जोखिम वर्ग', 'Grade')}</th>
                      <th className="p-3 text-center">{t('किस्ता भार (DSTI)', 'DSTI')}</th>
                      <th className="p-3 text-center">{t('धितो कभरेज (LTV)', 'LTV')}</th>
                      <th className="p-3 text-center">{t('दफा ५१ सीमा', 'Sec 51 Cap')}</th>
                      <th className="p-3">{t('निर्णय सिफारिस', 'Decision')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredEvaluations.map((e) => (
                      <tr key={e.memberNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white">{e.applicantName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{e.memberNo}</div>
                        </td>
                        <td className="p-3 text-right font-mono font-bold">{fmtCurrency(e.requestedAmount)}</td>
                        <td className="p-3 text-center font-mono font-black text-amber-600 text-sm">
                          {e.totalScore}
                        </td>
                        <td className="p-3 text-center">{getGradeBadge(e.grade)}</td>
                        <td className="p-3 text-center font-mono">
                          <span
                            className={`font-bold ${
                              e.dstiRatio <= 50 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {e.dstiRatio}%
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono">
                          <span
                            className={`font-bold ${
                              e.ltvRatio <= 65 ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {e.ltvRatio}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              e.isCoopAct51Compliant
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {e.isCoopAct51Compliant ? 'पास (Pass)' : 'उल्लङ्घन (Fail)'}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-600 dark:text-slate-300 max-w-xs">
                          {e.recommendationNe}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT & STATUTORY NORMS */}
          {activeTab === 'EXPORT' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/30">
                    <Download className="size-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      {t('कर्जा जोखिम स्कोरिङ प्रतिवेदन CSV डाउनलोड', 'Download Credit Risk Scoring CSV')}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {t(
                        'ऋण उपसमिति तथा सञ्चालक समिति बैठकमा पेश गर्न योग्य पूर्ण स्कोरिङ पाना तथा निर्णय तालिका निर्यात गर्नुहोस्।',
                        'Export the applicant risk evaluation dataset with DSTI, LTV, and risk grades.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-lg transition"
                  >
                    <Download className="size-4" />
                    <span>{t('क्रेडिट स्कोरिङ CSV डाउनलोड (.csv)', 'Download Credit Scoring CSV (.csv)')}</span>
                  </button>
                </div>
              </div>

              {/* Directives Box */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>{t('सहकारी ऐन २०७४ अन्तर्गत कर्जा जोखिम व्यवस्थापनका प्रमुख व्यवस्थाहरू:', 'Statutory Provisions under Cooperative Act 2074:')}</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-400 pl-1 leading-relaxed">
                  <li>
                    <strong>{t('दफा ५० (ऋण लगानी तथा सुरक्षण):', 'Sec 50 (Loan Security):')}</strong>{' '}
                    {t(
                      'संस्थाले आफ्ना सदस्यहरूलाई ऋण प्रवाह गर्दा पर्याप्त धितो वा भरपर्दो व्यक्तिगत जमानी अनिवार्य लिनुपर्नेछ र ऋण तिर्ने क्षमता यकिन गर्नुपर्नेछ।',
                      'Adequate collateral or reliable personal guarantee is legally mandatory with verified repayment capacity.'
                    )}
                  </li>
                  <li>
                    <strong>{t('दफा ५१ (एक्लो ऋणी सीमा / Single Borrower Limit):', 'Sec 51 (Exposure Limit):')}</strong>{' '}
                    {t(
                      'कुनै एक सदस्य वा निजको एकाघर परिवारलाई संस्थाको प्राथमिक पुँजी (सेयर तथा जगेडा कोष) को तोकिएको प्रतिशतभन्दा बढी ऋण लगानी गर्न पाइने छैन।',
                      'Credit exposure to a single member or family shall not exceed statutory primary capital limits.'
                    )}
                  </li>
                  <li>
                    <strong>{t('DSTI सीमा:', 'DSTI Benchmark:')}</strong>{' '}
                    {t(
                      'ऋणीको कुल आम्दानीको अधिकतम ५०% सम्म मात्र मासिक किस्ता भार कायम हुनुपर्ने PEARLS मापदण्ड कडाइका साथ पालना गर्नुपर्नेछ।',
                      'Debt service ratio must not exceed 50% of verified monthly disposable income.'
                    )}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>{t('उनको साकोस कर्जा जोखिम मूल्याङ्कन प्रणाली सक्रिय', 'Unako SACCOS Credit Scoring Engine Active')}</span>
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
