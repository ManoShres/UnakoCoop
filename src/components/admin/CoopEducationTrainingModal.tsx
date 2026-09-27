import React, { useState, useMemo } from 'react';
import {
  TrainingProgram,
  ExpenseItem,
  DEFAULT_TRAINING_PROGRAMS,
  CATEGORY_LABELS,
  AUDIENCE_LABELS,
  calculateEducationFundSummary,
  calculateTrainingMetrics,
  validateTrainingExpenseAgainstBudget,
  recordTrainingExpense,
  generateTrainingCertificate,
  exportTrainingLedgerToCSV,
  TrainingCategory,
  TargetAudience,
} from '../../utils/coopEducationEngine';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  GraduationCap,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Award,
  PlusCircle,
  Users,
  Search,
  BookOpen,
  Receipt,
  Copy,
  Check,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface CoopEducationTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFundBalance?: number;
}

export const CoopEducationTrainingModal: React.FC<CoopEducationTrainingModalProps> = ({
  isOpen,
  onClose,
  initialFundBalance = 640000,
}) => {
  const { t, fmtCurrency } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'PROGRAMS' | 'SUMMARY' | 'ADD_PROGRAM' | 'CERTIFICATE'>('PROGRAMS');
  const [programs, setPrograms] = useState<TrainingProgram[]>(DEFAULT_TRAINING_PROGRAMS);
  const [fiscalYear, setFiscalYear] = useState('2081/82');
  const [netSurplus, setNetSurplus] = useState<number>(1500000);
  const [allocationRate, setAllocationRate] = useState<number>(0.05);
  const [openingBalance, setOpeningBalance] = useState<number>(initialFundBalance);
  const [unionRemittance, setUnionRemittance] = useState<number>(25000);
  const [externalSubsidy, setExternalSubsidy] = useState<number>(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Expense Recording Modal State
  const [selectedProgramForExpense, setSelectedProgramForExpense] = useState<TrainingProgram | null>(null);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(5000);
  const [expenseCat, setExpenseCat] = useState<ExpenseItem['category']>('FOOD_REFRESHMENT');
  const [expenseVoucher, setExpenseVoucher] = useState(`JV-81-${Math.floor(Math.random() * 800 + 100)}`);
  const [expenseDate, setExpenseDate] = useState('२०८१-०६-१५');
  const [expenseFeedback, setExpenseFeedback] = useState<{ error?: string; warning?: string } | null>(null);

  // Certificate Generator State
  const [certProgramId, setCertProgramId] = useState<string>(DEFAULT_TRAINING_PROGRAMS[0]?.id || '');
  const [certMemberName, setCertMemberName] = useState('शान्ति चौधरी');
  const [certMemberNo, setCertMemberNo] = useState('UNAKO-M-1420');
  const [copiedCert, setCopiedCert] = useState(false);

  // New Program State
  const [newTitleNe, setNewTitleNe] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newCategory, setNewCategory] = useState<TrainingCategory>('FINANCIAL_LITERACY');
  const [newAudience, setNewAudience] = useState<TargetAudience>('WOMEN_GROUPS');
  const [newTrainer, setNewTrainer] = useState('');
  const [newTrainerOrg, setNewTrainerOrg] = useState('');
  const [newVenue, setNewVenue] = useState('उनको साकोस सभाहल, गढवा-५');
  const [newStartDate, setNewStartDate] = useState('२०८१-०७-१०');
  const [newEndDate, setNewEndDate] = useState('२०८१-०७-१२');
  const [newDurationDays, setNewDurationDays] = useState<number>(3);
  const [newDurationHours, setNewDurationHours] = useState<number>(18);
  const [newPlannedBudget, setNewPlannedBudget] = useState<number>(35000);
  const [newMaleCount, setNewMaleCount] = useState<number>(5);
  const [newFemaleCount, setNewFemaleCount] = useState<number>(25);
  const [newMarginalizedCount, setNewMarginalizedCount] = useState<number>(12);
  const [newBoardMinute, setNewBoardMinute] = useState('निर्णय नं. १४/२०८१');

  const [toast, setToast] = useState<string | null>(null);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fundSummary = useMemo(() => {
    return calculateEducationFundSummary({
      fiscalYear,
      netSurplus,
      statutoryAllocationRate: allocationRate,
      openingBalance,
      externalGrantOrSubsidy: externalSubsidy,
      programs,
      unionContributionRemitted: unionRemittance,
    });
  }, [fiscalYear, netSurplus, allocationRate, openingBalance, externalSubsidy, programs, unionRemittance]);

  const metrics = useMemo(() => {
    return calculateTrainingMetrics(programs);
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const matchSearch =
        p.titleNepali.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.programCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.trainerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [programs, searchQuery, categoryFilter]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramForExpense) return;

    const validation = validateTrainingExpenseAgainstBudget(
      selectedProgramForExpense,
      expenseAmount,
      fundSummary.remainingBalance
    );

    if (!validation.isValid) {
      setExpenseFeedback({ error: validation.error });
      return;
    }

    if (validation.warning) {
      setExpenseFeedback({ warning: validation.warning });
    }

    const updatedProgram = recordTrainingExpense(selectedProgramForExpense, {
      description: expenseDesc || 'प्रशिक्षण सञ्चालन खर्च',
      category: expenseCat,
      amount: expenseAmount,
      voucherNo: expenseVoucher,
      invoiceDate: expenseDate,
    });

    setPrograms((prev) =>
      prev.map((p) => (p.id === selectedProgramForExpense.id ? updatedProgram : p))
    );

    showToastMsg(t('खर्च भौचर सफलतापूर्वक प्रविष्ट गरियो!', 'Expense voucher recorded successfully!'));
    setSelectedProgramForExpense(null);
    setExpenseDesc('');
    setExpenseFeedback(null);
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleNe.trim()) {
      showToastMsg(t('कृपया तालिमको शीर्षक नेपालीमा लेख्नुहोस्!', 'Please provide program title!'));
      return;
    }

    const newProg: TrainingProgram = {
      id: `trn-${Date.now()}`,
      programCode: `UNAKO-TRN-2081-${String(programs.length + 1).padStart(2, '0')}`,
      titleNepali: newTitleNe,
      titleEnglish: newTitleEn || newTitleNe,
      category: newCategory,
      targetAudience: newAudience,
      trainerName: newTrainer || 'सहकारी विषय विज्ञ',
      trainerOrganization: newTrainerOrg || 'उनको साकोस',
      venue: newVenue,
      startDateNepali: newStartDate,
      endDateNepali: newEndDate,
      durationDays: newDurationDays,
      durationHours: newDurationHours,
      plannedBudget: newPlannedBudget,
      expenses: [],
      totalActualExpense: 0,
      participantsMale: newMaleCount,
      participantsFemale: newFemaleCount,
      participantsMarginalized: newMarginalizedCount,
      totalParticipants: newMaleCount + newFemaleCount,
      status: 'PLANNED',
      boardMinuteNo: newBoardMinute,
    };

    setPrograms((prev) => [newProg, ...prev]);
    showToastMsg(t('नयाँ तालिम कार्यक्रम सफलतापूर्वक दर्ता भयो!', 'New training program registered!'));
    setActiveTab('PROGRAMS');
    setNewTitleNe('');
    setNewTitleEn('');
  };

  const handleExportCSV = () => {
    const csv = exportTrainingLedgerToCSV(programs, fundSummary);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Unako_Coop_Education_Training_Ledger_${fiscalYear.replace('/', '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastMsg(t('तालिम तथा शिक्षा कोष लेजर डाउनलोड भयो!', 'Training ledger exported to CSV!'));
  };

  const handleCopyCertificate = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
    showToastMsg(t('प्रमाणपत्र क्लिपबोर्डमा प्रतिलिपि गरियो!', 'Certificate copied to clipboard!'));
  };

  const selectedCertProgram = useMemo(() => {
    return programs.find((p) => p.id === certProgramId) || programs[0];
  }, [programs, certProgramId]);

  const certificateText = useMemo(() => {
    if (!selectedCertProgram) return '';
    return generateTrainingCertificate(selectedCertProgram, certMemberName, certMemberNo);
  }, [selectedCertProgram, certMemberName, certMemberNo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-400 mb-1">
              <GraduationCap className="size-4" />
              <span>{t('सहकारी ऐन २०७४, दफा ६८ (३) वैधानिक कोष', 'Cooperative Act 2074 Sec 68(3) Statutory Fund')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t('सहकारी शिक्षा, तालिम तथा क्षमता विकास कोष खाता', 'Cooperative Education & Training Fund Ledger')}
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5 max-w-2xl">
              {t(
                'सदस्य वित्तीय साक्षरता, मातृ समूह सीप, सञ्चालक सुशासन र कर्मचारी पेशागत क्षमता अभिवृद्धि कार्यक्रम खर्च व्यवस्थापन।',
                'Comprehensive tracking of member financial literacy, mother group skills, board governance, and staff training.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="size-4" />
              <span>{t('COPOMIS / CSV डाउनलोड', 'Export CSV')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('कुल उपलब्ध शिक्षा कोष', 'Total Available Fund')}
            </span>
            <div className="text-base font-black text-slate-900 dark:text-white">
              {fmtCurrency(fundSummary.totalAvailableFund, true)}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ५% नाफा + अघिल्लो मौज्दात
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('कुल तालिम खर्च (उपयोग)', 'Total Training Outlay')}
            </span>
            <div className="text-base font-black text-teal-600 dark:text-teal-400">
              {fmtCurrency(fundSummary.totalDisbursed, true)}
            </div>
            <span className="text-[10px] text-slate-500">
              उपयोग दर: {fundSummary.statutoryUtilizationRate}%
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('कोष बाँकी मौज्दात', 'Fund Remaining Balance')}
            </span>
            <div className={`text-base font-black ${fundSummary.remainingBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {fmtCurrency(fundSummary.remainingBalance, true)}
            </div>
            <span className="text-[10px] text-slate-500">
              {fundSummary.sec68Compliant ? '✓ दफा ६८ अनुकूल' : '⚠️ निकासा आवश्यक'}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('प्रशिक्षित सदस्य संख्या', 'Total Trained Members')}
            </span>
            <div className="text-base font-black text-indigo-600 dark:text-indigo-400">
              {metrics.totalParticipants} जना
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
              महिला सहभागिता: {metrics.femaleRatioPercent}%
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
          <button
            onClick={() => setActiveTab('PROGRAMS')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PROGRAMS'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="size-4" />
            <span>{t('तालिम कार्यक्रम तथा खर्च लेजर', 'Training Programs & Ledger')} ({programs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SUMMARY')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SUMMARY'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="size-4" />
            <span>{t('दफा ६८ कोष विनियोजन क्याल्कुलेटर', 'Sec 68 Allocation Calculator')}</span>
          </button>

          <button
            onClick={() => setActiveTab('ADD_PROGRAM')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ADD_PROGRAM'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <PlusCircle className="size-4" />
            <span>{t('+ नयाँ कार्यक्रम दर्ता', '+ Register Program')}</span>
          </button>

          <button
            onClick={() => setActiveTab('CERTIFICATE')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CERTIFICATE'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Award className="size-4" />
            <span>{t('सहभागिता प्रमाणपत्र जारी', 'Certificate Generator')}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: PROGRAMS LIST & LEDGER */}
          {activeTab === 'PROGRAMS' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('तालिम शीर्षक, कोड वा प्रशिक्षक खोज्नुहोस्...', 'Search training title, code, trainer...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <option value="ALL">{t('सबै विषय क्षेत्र (All Categories)', 'All Categories')}</option>
                    {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                      <option key={catKey} value={catKey}>
                        {label.ne}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Programs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPrograms.map((prog) => {
                  const catLabel = CATEGORY_LABELS[prog.category] || { ne: prog.category, en: prog.category };
                  const audLabel = AUDIENCE_LABELS[prog.targetAudience] || { ne: prog.targetAudience, en: prog.targetAudience };
                  const percentBudgetUsed = prog.plannedBudget > 0
                    ? Math.min(100, Math.round((prog.totalActualExpense / prog.plannedBudget) * 100))
                    : 0;

                  return (
                    <div
                      key={prog.id}
                      className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2.5 py-0.5 rounded-md">
                            {prog.programCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              prog.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : prog.status === 'ONGOING'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {prog.status === 'COMPLETED' ? 'सम्पन्न' : prog.status === 'ONGOING' ? 'सञ्चालनमा' : 'योजनामा'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {prog.titleNepali}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {prog.titleEnglish}
                        </p>

                        {/* Meta Tags */}
                        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300">
                            📚 {catLabel.ne}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300">
                            👥 {audLabel.ne}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
                          <div>
                            <span className="font-semibold text-slate-500 block">प्रशिक्षक:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{prog.trainerName}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500 block">मिति / अवधि:</span>
                            <span>{prog.startDateNepali} ({prog.durationDays} दिन)</span>
                          </div>
                          <div className="col-span-2">
                            <span className="font-semibold text-slate-500 block">सहभागी विवरण:</span>
                            <span>
                              कुल: <b>{prog.totalParticipants}</b> (महिला: <b>{prog.participantsFemale}</b>, पुरुष: <b>{prog.participantsMale}</b>, विपन्न/दलित: <b>{prog.participantsMarginalized}</b>)
                            </span>
                          </div>
                        </div>

                        {/* Budget Bar */}
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">
                              खर्च: <b>{fmtCurrency(prog.totalActualExpense, true)}</b>
                            </span>
                            <span className="text-slate-500">
                              बजेट: {fmtCurrency(prog.plannedBudget, true)} ({percentBudgetUsed}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                prog.totalActualExpense > prog.plannedBudget
                                  ? 'bg-rose-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, percentBudgetUsed)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setCertProgramId(prog.id);
                            setActiveTab('CERTIFICATE');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          <Award className="size-3.5" />
                          <span>प्रमाणपत्र</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProgramForExpense(prog);
                            setExpenseFeedback(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition cursor-pointer"
                        >
                          <Receipt className="size-3.5" />
                          <span>+ खर्च भौचर</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: STATUTORY SUMMARY & CALCULATOR */}
          {activeTab === 'SUMMARY' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('सहकारी ऐन २०७४, दफा ६८ (३) कोष विनियोजन क्याल्कुलेटर', 'Sec 68 Fund Allocation Simulator')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('आर्थिक वर्ष (Fiscal Year)', 'Fiscal Year')}
                    </label>
                    <input
                      type="text"
                      value={fiscalYear}
                      onChange={(e) => setFiscalYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('वार्षिक खुद बचत (Net Surplus/Profit)', 'Annual Net Surplus')} (रु)
                    </label>
                    <input
                      type="number"
                      value={netSurplus}
                      onChange={(e) => setNetSurplus(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('शिक्षा कोष विनियोजन दर (Statutory Rate)', 'Statutory Rate')}
                    </label>
                    <select
                      value={allocationRate}
                      onChange={(e) => setAllocationRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    >
                      <option value={0.05}>५.०% (Unako Standard Bylaw)</option>
                      <option value={0.03}>३.०% (Cooperative Act 2074 Minimum)</option>
                      <option value={0.07}>७.०% (Enhanced Education Outreach)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('अघिल्लो वर्षबाट बाँकी मौज्दात (Opening Balance)', 'Opening Fund Balance')} (रु)
                    </label>
                    <input
                      type="number"
                      value={openingBalance}
                      onChange={(e) => setOpeningBalance(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('केन्द्रीय/जिल्ला सहकारी संघमा दाखिला (Union Remittance)', 'Union Remittance')} (रु)
                    </label>
                    <input
                      type="number"
                      value={unionRemittance}
                      onChange={(e) => setUnionRemittance(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('सरकारी/दातृ अनुदान थप (Grants / Subsidy)', 'Grants / Subsidies')} (रु)
                    </label>
                    <input
                      type="number"
                      value={externalSubsidy}
                      onChange={(e) => setExternalSubsidy(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Statutory Fund Ledger Breakdown Table */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('सहकारी शिक्षा तथा तालिम कोष खर्च तथा उपयोग विवरण (Section 68 Statement)', 'Fund Statement')}
                  </h4>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                  <div className="p-3.5 flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">१. अघिल्लो आर्थिक वर्षबाट प्राप्त मौज्दात (Opening Balance)</span>
                    <span className="font-bold text-slate-900 dark:text-white">{fmtCurrency(fundSummary.openingBalance, true)}</span>
                  </div>
                  <div className="p-3.5 flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">
                      २. चालु आ.व. खुद बचत रु. {fundSummary.netSurplus.toLocaleString('en-IN')} बाट {(fundSummary.statutoryAllocationRate * 100).toFixed(1)}% दाखिला
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+{fmtCurrency(fundSummary.allocatedSurplusAmount, true)}</span>
                  </div>
                  {fundSummary.externalGrantOrSubsidy > 0 && (
                    <div className="p-3.5 flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">३. अन्य निकाय वा सरकारी अनुदान सहयोग (External Grants)</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">+{fmtCurrency(fundSummary.externalGrantOrSubsidy, true)}</span>
                    </div>
                  )}
                  <div className="p-3.5 flex justify-between bg-slate-50 dark:bg-slate-900/40 font-bold">
                    <span>कुल उपलब्ध शिक्षा तथा तालिम कोष (Total Available Fund)</span>
                    <span className="text-slate-900 dark:text-white">{fmtCurrency(fundSummary.totalAvailableFund, true)}</span>
                  </div>
                  <div className="p-3.5 flex justify-between text-teal-700 dark:text-teal-300">
                    <span>४. आन्तरिक सदस्य तथा कर्मचारी तालिम खर्च (In-House Training Outlays - Min 70%)</span>
                    <span className="font-bold">-{fmtCurrency(fundSummary.inHouseExpenditure, true)} ({fundSummary.inHouseSharePercent}%)</span>
                  </div>
                  <div className="p-3.5 flex justify-between text-indigo-700 dark:text-indigo-300">
                    <span>५. केन्द्रीय तथा जिल्ला सहकारी संघ कोषमा दाखिला (Union Remittance - Max 30%)</span>
                    <span className="font-bold">-{fmtCurrency(fundSummary.unionContributionRemitted, true)} ({fundSummary.unionSharePercent}%)</span>
                  </div>
                  <div className="p-4 flex justify-between bg-emerald-50 dark:bg-emerald-950/40 border-t border-emerald-200 dark:border-emerald-800 text-sm font-black">
                    <span className="text-emerald-900 dark:text-emerald-200">कोषको अन्तिम बाँकी मौज्दात (Closing Fund Balance)</span>
                    <span className="text-emerald-700 dark:text-emerald-400">{fmtCurrency(fundSummary.remainingBalance, true)}</span>
                  </div>
                </div>
              </div>

              {/* Statutory Compliance Notes */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  {t('वैधानिक अनुपालन समीक्षा (Regulatory Compliance Notes)', 'Statutory Compliance Notes')}
                </span>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {fundSummary.complianceNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: REGISTER NEW PROGRAM */}
          {activeTab === 'ADD_PROGRAM' && (
            <form onSubmit={handleCreateProgram} className="space-y-4 max-w-3xl mx-auto bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="size-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('नयाँ तालिम तथा क्षमता विकास कार्यक्रम दर्ता', 'Register New Training Program')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    तालिमको नाम (नेपालीमा) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. महिला उद्यमी वित्तीय साक्षरता..."
                    value={newTitleNe}
                    onChange={(e) => setNewTitleNe(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    Program Title (in English)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Women Entrepreneur Financial Literacy..."
                    value={newTitleEn}
                    onChange={(e) => setNewTitleEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    विषय क्षेत्र (Category)
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TrainingCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v.ne}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    लक्षित वर्ग (Target Audience)
                  </label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value as TargetAudience)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {Object.entries(AUDIENCE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v.ne}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    मुख्य प्रशिक्षकको नाम
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. सीता पौडेल (सहकारी प्रशिक्षक)"
                    value={newTrainer}
                    onChange={(e) => setNewTrainer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    प्रशिक्षकको संस्था / निकाय
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. नेफ्स्कून / राष्ट्रिय सहकारी महासंघ"
                    value={newTrainerOrg}
                    onChange={(e) => setNewTrainerOrg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    प्रशिक्षण स्थल (Venue)
                  </label>
                  <input
                    type="text"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    स्वीकृत योजनाबद्ध बजेट (रु)
                  </label>
                  <input
                    type="number"
                    value={newPlannedBudget}
                    onChange={(e) => setNewPlannedBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    सञ्चालन मिति (वि.सं.)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="सुरु मिति"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="अन्त्य मिति"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    सहभागी संख्या (महिला / पुरुष / विपन्न)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      title="महिला"
                      placeholder="महिला"
                      value={newFemaleCount}
                      onChange={(e) => setNewFemaleCount(Number(e.target.value))}
                      className="w-1/3 px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center"
                    />
                    <input
                      type="number"
                      title="पुरुष"
                      placeholder="पुरुष"
                      value={newMaleCount}
                      onChange={(e) => setNewMaleCount(Number(e.target.value))}
                      className="w-1/3 px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center"
                    />
                    <input
                      type="number"
                      title="विपन्न/दलित"
                      placeholder="विपन्न"
                      value={newMarginalizedCount}
                      onChange={(e) => setNewMarginalizedCount(Number(e.target.value))}
                      className="w-1/3 px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-500 font-semibold mb-1">
                    सञ्चालक समिति निर्णय नं. / बैठक मिति
                  </label>
                  <input
                    type="text"
                    value={newBoardMinute}
                    onChange={(e) => setNewBoardMinute(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('PROGRAMS')}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  कार्यक्रम सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: CERTIFICATE GENERATOR */}
          {activeTab === 'CERTIFICATE' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">तालिम कार्यक्रम चयन:</label>
                  <select
                    value={certProgramId}
                    onChange={(e) => setCertProgramId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.programCode} - {p.titleNepali.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">सहभागी सदस्यको नाम:</label>
                  <input
                    type="text"
                    value={certMemberName}
                    onChange={(e) => setCertMemberName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">सदस्य परिचयपत्र नं.:</label>
                  <input
                    type="text"
                    value={certMemberNo}
                    onChange={(e) => setCertMemberNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Certificate Canvas Box */}
              <div className="relative p-6 sm:p-8 bg-amber-50/40 dark:bg-slate-950 rounded-2xl border-2 border-amber-300 dark:border-amber-800/60 shadow-xl font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCertificate(certificateText)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    {copiedCert ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                    <span>{copiedCert ? 'प्रतिलिपि भयो' : 'प्रमाणपत्र कपी'}</span>
                  </button>
                </div>
                {certificateText}
              </div>
            </div>
          )}
        </div>

        {/* Expense Voucher Modal Sub-dialog */}
        {selectedProgramForExpense && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    तालिम खर्च भौचर प्रविष्टि (Record Expense Voucher)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedProgramForExpense.titleNepali} ({selectedProgramForExpense.programCode})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProgramForExpense(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="size-4" />
                </button>
              </div>

              {expenseFeedback?.error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{expenseFeedback.error}</span>
                </div>
              )}

              {expenseFeedback?.warning && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{expenseFeedback.warning}</span>
                </div>
              )}

              <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">खर्च विवरण / बिल शीर्षक *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. प्रशिक्षक पारिश्रमिक, खाजा, स्टेशनरी..."
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">खर्च शीर्षक (Category)</label>
                    <select
                      value={expenseCat}
                      onChange={(e) => setExpenseCat(e.target.value as ExpenseItem['category'])}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="TRAINER_HONORARIUM">प्रशिक्षक पारिश्रमिक</option>
                      <option value="FOOD_REFRESHMENT">दिवा खाजा तथा चियापान</option>
                      <option value="STATIONERY_MATERIAL">स्टेशनरी तथा सामग्री</option>
                      <option value="VENUE_LOGISTICS">हल भाडा तथा व्यवस्थापन</option>
                      <option value="TRAVEL_ALLOWANCE">यातायात खर्च</option>
                      <option value="MISCELLANEOUS">विविध खर्च</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">खर्च रकम (रु) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">भौचर नं. (Voucher No)</label>
                    <input
                      type="text"
                      value={expenseVoucher}
                      onChange={(e) => setExpenseVoucher(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">बिल / खर्च मिति (वि.सं.)</label>
                    <input
                      type="text"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProgramForExpense(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    रद्द
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    भौचर प्रविष्ट गर्नुहोस्
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
