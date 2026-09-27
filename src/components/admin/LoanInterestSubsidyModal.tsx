import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  ConcessionalSchemeType,
  ConcessionalLoanRecord,
  CONCESSIONAL_SCHEME_CONFIG,
  createDefaultConcessionalLoans,
  calculateInterestSubsidySplit,
  validateConcessionalEligibility,
  generateQuarterlySubsidyBatch,
  exportSubsidyClaimCsv,
} from '../../utils/loanInterestSubsidyEngine';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Plus,
  Coins,
  Receipt,
  FileCheck,
  Building,
  Check,
  Percent,
  Sparkles,
} from 'lucide-react';

interface LoanInterestSubsidyModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const LoanInterestSubsidyModal: React.FC<LoanInterestSubsidyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency, fmtCount, fmtPercent } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'REGISTER' | 'CLAIM_INVOICE' | 'ELIGIBILITY' | 'EXPORT'>('REGISTER');
  const [selectedSchemeFilter, setSelectedSchemeFilter] = useState<'ALL' | ConcessionalSchemeType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Master records
  const [concessionalLoans, setConcessionalLoans] = useState<readonly ConcessionalLoanRecord[]>(() =>
    createDefaultConcessionalLoans()
  );

  // Claim batch metadata
  const [fiscalYear, setFiscalYear] = useState('२०८०/८१');
  const [quarterBS, setQuarterBS] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q2');
  const [claimDateBS, setClaimDateBS] = useState('२०८०/०९/३०');
  const [quarterDays, setQuarterDays] = useState(91);

  // Eligibility Calculator State
  const [eligScheme, setEligScheme] = useState<ConcessionalSchemeType>('COMMERCIAL_AGRICULTURE');
  const [eligAge, setEligAge] = useState(34);
  const [eligIsWoman, setEligIsWoman] = useState(true);
  const [eligIsDalit, setEligIsDalit] = useState(false);
  const [eligIsReturnee, setEligIsReturnee] = useState(false);
  const [eligHasDegree, setEligHasDegree] = useState(true);
  const [eligHasEnterprise, setEligHasEnterprise] = useState(true);
  const [eligHasInsurance, setEligHasInsurance] = useState(true);
  const [eligAmount, setEligAmount] = useState(1000000);

  // New loan quick addition state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberNo, setNewMemberNo] = useState('');
  const [newEnterpriseName, setNewEnterpriseName] = useState('');
  const [newPrincipal, setNewPrincipal] = useState(800000);
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  // Calculations
  const activeLoans = useMemo(
    () => concessionalLoans.filter((l) => l.monitoringStatus === 'VERIFIED_ACTIVE'),
    [concessionalLoans]
  );

  const totalActivePrincipal = useMemo(
    () => activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0),
    [activeLoans]
  );

  const avgEffectiveRate = useMemo(() => {
    if (activeLoans.length === 0) return 0;
    const sumRate = activeLoans.reduce((sum, l) => sum + l.effectiveBorrowerRate, 0);
    return Math.round((sumRate / activeLoans.length) * 100) / 100;
  }, [activeLoans]);

  // Current Quarter Claim Batch
  const { batch: currentBatch, itemCalculations } = useMemo(() => {
    return generateQuarterlySubsidyBatch({
      claimBatchNo: `UNAKO-SUB-${fiscalYear.replace('/', '-')}-${quarterBS}-01`,
      fiscalYear,
      quarterBS,
      claimDateBS,
      loans: concessionalLoans,
      quarterDays,
    });
  }, [fiscalYear, quarterBS, claimDateBS, quarterDays, concessionalLoans]);

  // Filtered Loans
  const filteredLoans = useMemo(() => {
    return concessionalLoans.filter((l) => {
      const matchesScheme = selectedSchemeFilter === 'ALL' || l.schemeType === selectedSchemeFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        l.memberName.toLowerCase().includes(q) ||
        l.memberNo.toLowerCase().includes(q) ||
        l.loanNo.toLowerCase().includes(q) ||
        l.enterpriseName.toLowerCase().includes(q);
      return matchesScheme && matchesSearch;
    });
  }, [concessionalLoans, selectedSchemeFilter, searchQuery]);

  // Eligibility Evaluation
  const eligibilityResult = useMemo(() => {
    return validateConcessionalEligibility({
      schemeType: eligScheme,
      applicantAge: eligAge,
      isWoman: eligIsWoman,
      isDalit: eligIsDalit,
      isReturneeMigrant: eligIsReturnee,
      hasAcademicDegree: eligHasDegree,
      hasEnterpriseRegistration: eligHasEnterprise,
      hasLivestockCropInsurance: eligHasInsurance,
      requestedAmount: eligAmount,
    });
  }, [
    eligScheme,
    eligAge,
    eligIsWoman,
    eligIsDalit,
    eligIsReturnee,
    eligHasDegree,
    eligHasEnterprise,
    eligHasInsurance,
    eligAmount,
  ]);

  if (!isOpen) return null;

  const handleExportCsv = () => {
    const csv = exportSubsidyClaimCsv(currentBatch, itemCalculations);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Interest_Subsidy_Claim_${fiscalYear.replace('/', '-')}_${quarterBS}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRegisterConcessionalLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberNo || !newEnterpriseName) return;

    const schemeConf = CONCESSIONAL_SCHEME_CONFIG[eligScheme];
    const nominalRate = 12.0;
    const subsidyRate = schemeConf.defaultSubsidyRate;

    const newRecord: ConcessionalLoanRecord = {
      id: `CONC-2080-00${concessionalLoans.length + 1}`,
      loanId: `ln-conc-0${concessionalLoans.length + 1}`,
      loanNo: `LN-CONC-2080-0${concessionalLoans.length + 1}`,
      memberId: `m-${concessionalLoans.length + 105}`,
      memberNo: newMemberNo,
      memberName: newMemberName,
      schemeType: eligScheme,
      enterpriseName: newEnterpriseName,
      projectLocation: 'गढवा-५, दाङ',
      approvedPrincipal: newPrincipal,
      remainingBalance: newPrincipal,
      nominalAnnualRate: nominalRate,
      subsidyAnnualRate: subsidyRate,
      effectiveBorrowerRate: nominalRate - subsidyRate,
      disbursementDateBS: '२०८०/०९/२५',
      maturityDateBS: '२०८५/०९/२४',
      monitoringStatus: 'VERIFIED_ACTIVE',
      lastInspectionDateBS: '२०८०/०९/२५',
      cumulativeSubsidyReimbursed: 0,
      insurancePolicyNo: schemeConf.insuranceMandatory ? `AGRI-INS-${Math.floor(1000 + Math.random() * 9000)}-2080` : undefined,
    };

    setConcessionalLoans((prev) => [newRecord, ...prev]);
    setShowAddSuccess(true);
    setTimeout(() => setShowAddSuccess(false), 3000);
    setNewMemberName('');
    setNewMemberNo('');
    setNewEnterpriseName('');
  };

  const handleToggleMonitoringStatus = (id: string) => {
    setConcessionalLoans((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const nextStatus =
          l.monitoringStatus === 'VERIFIED_ACTIVE'
            ? 'UNDER_INSPECTION'
            : l.monitoringStatus === 'UNDER_INSPECTION'
            ? 'NON_COMPLIANT'
            : 'VERIFIED_ACTIVE';
        return { ...l, monitoringStatus: nextStatus };
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
              <Percent className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  {t('सहुलियतपूर्ण कर्जा कार्यविधि २०७५', 'Concessional Loan Guidelines 2075')}
                </span>
                <span className="text-xs text-white/80 font-mono">
                  {currentBatch.claimBatchNo}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {t(
                  'सहुलियतपूर्ण कर्जा तथा सरकारी ब्याज अनुदान व्यवस्थापन',
                  'Concessional Loan & Interest Subsidy Gateway'
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

        {/* Global KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 shrink-0 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">{t('सक्रिय सहुलियत ऋणी:', 'Active Subsidized Loans:')}</span>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
              {fmtCount(activeLoans.length)} {t('जना', 'borrowers')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">{t('कुल लगानी बाँकी साँवा:', 'Total Active Principal:')}</span>
            <span className="text-sm font-black text-emerald-600 font-mono">
              {fmtCurrency(totalActivePrincipal)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">{t('चालु त्रैमास अनुदान दाबी:', 'Quarterly Subsidy Claim:')}</span>
            <span className="text-sm font-black text-blue-600 font-mono">
              {fmtCurrency(currentBatch.totalSubsidyClaimAmount)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">{t('ऋणीले तिर्ने औसत खुद दर:', 'Avg Borrower Net Rate:')}</span>
            <span className="text-sm font-black text-amber-600 font-mono">
              {fmtPercent(avgEffectiveRate)}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'REGISTER'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Coins className="size-4" />
            <span>{t('१. सहुलियतपूर्ण कर्जा खाता सूची', '1. Concessional Portfolio')}</span>
          </button>
          <button
            onClick={() => setActiveTab('CLAIM_INVOICE')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'CLAIM_INVOICE'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Receipt className="size-4" />
            <span>{t('२. त्रैमासिक ब्याज अनुदान दाबी बिजक', '2. Subsidy Claim Invoice')}</span>
          </button>
          <button
            onClick={() => setActiveTab('ELIGIBILITY')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'ELIGIBILITY'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="size-4" />
            <span>{t('३. योग्यता परीक्षण तथा नयाँ दर्ता', '3. Eligibility Check & Add')}</span>
          </button>
          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'EXPORT'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Download className="size-4" />
            <span>{t('४. सरकारी अनुगमन तथा CSV निर्यात', '4. Regulatory Export & Norms')}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PORTFOLIO REGISTER */}
          {activeTab === 'REGISTER' && (
            <div className="space-y-4">
              {/* Search & Scheme Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="size-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('ऋणीको नाम, सदस्यता नं, परियोजना...', 'Search member, enterprise...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedSchemeFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      selectedSchemeFilter === 'ALL'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {t('सबै योजना', 'All Schemes')}
                  </button>
                  {(
                    [
                      'COMMERCIAL_AGRICULTURE',
                      'WOMEN_ENTREPRENEURSHIP',
                      'EDUCATED_YOUTH',
                      'RETURNEE_MIGRANT',
                      'DALIT_COMMUNITY',
                      'LOCAL_MUNICIPALITY_AGRI',
                    ] as ConcessionalSchemeType[]
                  ).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedSchemeFilter(st)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                        selectedSchemeFilter === st
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {CONCESSIONAL_SCHEME_CONFIG[st].titleNe.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loans Table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3">{t('ऋणी विवरण', 'Member & Loan')}</th>
                      <th className="p-3">{t('सहुलियतपूर्ण योजना', 'Scheme & Title')}</th>
                      <th className="p-3 text-right">{t('बाँकी साँवा', 'Balance')}</th>
                      <th className="p-3 text-center">{t('ब्याज विभाजन (Split)', 'Interest Split')}</th>
                      <th className="p-3">{t('बीमा / अनुगमन', 'Insurance & Monitoring')}</th>
                      <th className="p-3 text-center">{t('अवस्था', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredLoans.map((l) => {
                      const schemeConf = CONCESSIONAL_SCHEME_CONFIG[l.schemeType];
                      return (
                        <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-white">{l.memberName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {l.memberNo} | {l.loanNo}
                            </div>
                            <div className="text-[10px] text-slate-400">{l.projectLocation}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              {schemeConf.titleNe}
                            </span>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">
                              {l.enterpriseName}
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {fmtCurrency(l.remainingBalance)}
                            <div className="text-[10px] text-slate-400 font-normal">
                              {t('स्वीकृत:', 'Approved:')} {fmtCurrency(l.approvedPrincipal)}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center gap-1 font-mono text-[11px]">
                              <span className="text-slate-400 line-through" title={t('सामान्य दर', 'Nominal')}>
                                {l.nominalAnnualRate}%
                              </span>
                              <span className="text-emerald-600 font-bold" title={t('सरकारी अनुदान', 'Subsidy')}>
                                -{l.subsidyAnnualRate}%
                              </span>
                              <span>=</span>
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
                                {l.effectiveBorrowerRate}%
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {t('ऋणीले तिर्ने खुद दर', 'Net borrower rate')}
                            </div>
                          </td>
                          <td className="p-3">
                            {l.insurancePolicyNo ? (
                              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                                <ShieldCheck className="size-3.5" />
                                <span className="font-mono">{l.insurancePolicyNo}</span>
                              </div>
                            ) : (
                              <div className="text-[11px] text-amber-600">
                                {t('बीमा आवश्यक नभएको', 'Not Mandatory')}
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {t('अन्तिम निरीक्षण:', 'Last Audit:')} {l.lastInspectionDateBS || '-'}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleMonitoringStatus(l.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                                l.monitoringStatus === 'VERIFIED_ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : l.monitoringStatus === 'UNDER_INSPECTION'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {l.monitoringStatus === 'VERIFIED_ACTIVE'
                                ? t('प्रमाणित सक्रिय', 'Verified Active')
                                : l.monitoringStatus === 'UNDER_INSPECTION'
                                ? t('अनुगमनमा', 'Under Inspection')
                                : t('नियम विपरीत', 'Non Compliant')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CLAIM INVOICE */}
          {activeTab === 'CLAIM_INVOICE' && (
            <div className="space-y-6">
              {/* Batch Controls */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-500">{t('आर्थिक वर्ष:', 'FY:')}</span>
                    <input
                      type="text"
                      value={fiscalYear}
                      onChange={(e) => setFiscalYear(e.target.value)}
                      className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-500">{t('त्रैमास:', 'Quarter:')}</span>
                    <select
                      value={quarterBS}
                      onChange={(e) => setQuarterBS(e.target.value as any)}
                      className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
                    >
                      <option value="Q1">{t('प्रथम त्रैमासिक (श्रावण–आश्विन)', 'Q1')}</option>
                      <option value="Q2">{t('दोस्रो त्रैमासिक (कार्तिक–पौष)', 'Q2')}</option>
                      <option value="Q3">{t('तेस्रो त्रैमासिक (माघ–चैत्र)', 'Q3')}</option>
                      <option value="Q4">{t('चौथो त्रैमासिक (वैशाख–असार)', 'Q4')}</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-500">{t('त्रैमास दिन संख्या:', 'Quarter Days:')}</span>
                    <input
                      type="number"
                      value={quarterDays}
                      onChange={(e) => setQuarterDays(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono text-center font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow hover:bg-slate-800 transition"
                  >
                    <Printer className="size-3.5" />
                    <span>{t('दाबी बिजक प्रिन्ट', 'Print Invoice')}</span>
                  </button>
                </div>
              </div>

              {/* Official Invoice Sheet */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 shadow-md space-y-5 print:border-none print:shadow-none">
                <div className="text-center space-y-1 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                    {t('नेपाल सरकार अर्थ मन्त्रालय / गढवा गाउँपालिका कृषि विकास कार्यक्रम', 'Ministry of Finance / Gadhawa Rural Municipality')}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {t('उनको बचत तथा ऋण सहकारी संस्था लिमिटेड', 'UNAKO SAVING & CREDIT COOPERATIVE SOCIETY LTD.')}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {t('सहुलियतपूर्ण कर्जा ब्याज अनुदान सोधभर्ना दाबी विवरण', 'Concessional Loan Interest Subsidy Reimbursement Invoice')}
                  </div>
                  <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                    {currentBatch.claimBatchNo} | {currentBatch.quarterLabelNe}
                  </div>
                </div>

                {/* Claim Items Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="p-2.5">{t('क्र.सं.', 'S.N.')}</th>
                        <th className="p-2.5">{t('ऋणी तथा परियोजना', 'Member & Project')}</th>
                        <th className="p-2.5 text-right">{t('बाँकी साँवा', 'Balance (NPR)')}</th>
                        <th className="p-2.5 text-center">{t('अनुदान दर', 'Subsidy %')}</th>
                        <th className="p-2.5 text-right">{t('कुल पाकेको ब्याज', 'Total Interest')}</th>
                        <th className="p-2.5 text-right">{t('ऋणीले तिर्ने खुद', 'Member Due')}</th>
                        <th className="p-2.5 text-right text-emerald-600 font-bold">
                          {t('सोधभर्ना दाबी (Claim)', 'Reimbursement Claim')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {itemCalculations.map((item, idx) => (
                        <tr key={item.loanRecord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-2.5">
                            <div className="font-bold text-slate-900 dark:text-white">{item.loanRecord.memberName}</div>
                            <div className="text-[10px] text-slate-400">{item.loanRecord.enterpriseName}</div>
                          </td>
                          <td className="p-2.5 text-right font-mono font-medium">{fmtCurrency(item.principal)}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-emerald-600">
                            {item.subsidyAnnualRate}%
                          </td>
                          <td className="p-2.5 text-right font-mono">{fmtCurrency(item.totalNominalInterest)}</td>
                          <td className="p-2.5 text-right font-mono text-blue-600 font-medium">
                            {fmtCurrency(item.memberPayableInterest)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                            {fmtCurrency(item.governmentSubsidyPayable)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border-t border-slate-300 dark:border-slate-700">
                      <tr>
                        <td colSpan={2} className="p-2.5 text-slate-900 dark:text-white">
                          {t('कुल जम्मा (Total Claimable Amount)', 'Grand Total')}
                        </td>
                        <td className="p-2.5 text-right font-mono">{fmtCurrency(currentBatch.totalActivePrincipal)}</td>
                        <td className="p-2.5 text-center font-mono">-</td>
                        <td className="p-2.5 text-right font-mono">
                          {fmtCurrency(
                            itemCalculations.reduce((sum, i) => sum + i.totalNominalInterest, 0)
                          )}
                        </td>
                        <td className="p-2.5 text-right font-mono text-blue-600">
                          {fmtCurrency(
                            itemCalculations.reduce((sum, i) => sum + i.memberPayableInterest, 0)
                          )}
                        </td>
                        <td className="p-2.5 text-right font-mono text-emerald-600 font-black text-sm">
                          {fmtCurrency(currentBatch.totalSubsidyClaimAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Declaration & Signatures */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    <strong>{t('प्रमाणीकरण उद्घोष:', 'Certification Declaration:')}</strong>{' '}
                    {t(
                      'माथि उल्लिखित सहुलियतपूर्ण कर्जा रकम सम्बन्धित सदस्यहरूले तोकिएको कृषि तथा उद्यमशील परियोजनामा सदुपयोग गरेको स्थलगत निरीक्षण गरी यकिन गरिएको छ। सोधभर्ना दाबी रकम सही र यथार्थ रहेको प्रमाणित गर्दछौं।',
                      'We hereby certify that the above concessional loans have been strictly utilized for the approved agricultural and enterprise purposes per field inspection.'
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-6 text-center">
                    <div>
                      <div className="border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 font-bold">
                        {t('दिलीप कुमार थारु', 'Dilip Kumar Tharu')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{t('कर्जा अधिकृत (Loan Officer)', 'Loan Officer')}</div>
                    </div>
                    <div>
                      <div className="border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 font-bold">
                        {t('सीता कुमारी चौधरी', 'Sita Kumari Chaudhary')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{t('लेखापाल (Accountant)', 'Accountant')}</div>
                    </div>
                    <div>
                      <div className="border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 font-bold">
                        {t('अर्जुन प्रसाद शर्मा', 'Arjun Prasad Sharma')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{t('व्यवस्थापक (Manager)', 'Manager')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ELIGIBILITY CHECK & ADD */}
          {activeTab === 'ELIGIBILITY' && (
            <div className="space-y-6">
              {showAddSuccess && (
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="size-4" />
                  <span>{t('सहुलियतपूर्ण कर्जा सफलतापूर्वक दर्ता गरियो!', 'Concessional loan registered successfully!')}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Checker Form */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-4 text-xs">
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="size-4 text-emerald-600" />
                    <span>{t('सहुलियतपूर्ण कर्जा वैधानिक योग्यता परीक्षण', 'Statutory Eligibility Gate')}</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {t('सहुलियतपूर्ण कर्जा योजना छान्नुहोस्', 'Select Scheme')}
                    </label>
                    <select
                      value={eligScheme}
                      onChange={(e) => setEligScheme(e.target.value as ConcessionalSchemeType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                    >
                      {Object.values(CONCESSIONAL_SCHEME_CONFIG).map((sc) => (
                        <option key={sc.code} value={sc.code}>
                          {sc.titleNe} (अनुदान: {sc.defaultSubsidyRate}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {t('आवेदकको उमेर (Age)', 'Age')}
                      </label>
                      <input
                        type="number"
                        min={18}
                        max={70}
                        value={eligAge}
                        onChange={(e) => setEligAge(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {t('माग गरिएको रकम (NPR)', 'Amount')}
                      </label>
                      <input
                        type="number"
                        step={50000}
                        value={eligAmount}
                        onChange={(e) => setEligAmount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Toggle checks */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eligIsWoman}
                        onChange={(e) => setEligIsWoman(e.target.checked)}
                        className="size-4 rounded accent-emerald-600"
                      />
                      <span>{t('महिला उद्यमी / महिला सदस्य', 'Woman Entrepreneur')}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eligHasDegree}
                        onChange={(e) => setEligHasDegree(e.target.checked)}
                        className="size-4 rounded accent-emerald-600"
                      />
                      <span>{t('स्नातक (Bachelor) उत्तीर्ण प्रमाणपत्र उपलब्ध', 'Bachelor Degree Available')}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eligIsReturnee}
                        onChange={(e) => setEligIsReturnee(e.target.checked)}
                        className="size-4 rounded accent-emerald-600"
                      />
                      <span>{t('वैदेशिक रोजगारबाट फर्केको प्रमाण (Returnee Migrant)', 'Returnee Migrant')}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eligIsDalit}
                        onChange={(e) => setEligIsDalit(e.target.checked)}
                        className="size-4 rounded accent-emerald-600"
                      />
                      <span>{t('दलित समुदाय परम्परागत पेशाकर्मी', 'Dalit Traditional Artisan')}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eligHasEnterprise}
                        onChange={(e) => setEligHasEnterprise(e.target.checked)}
                        className="size-4 rounded accent-emerald-600"
                      />
                      <span>{t('व्यवसाय/उद्योग घरेलु वा पालिकामा दर्ता भएको', 'Registered Enterprise')}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eligHasInsurance}
                        onChange={(e) => setEligHasInsurance(e.target.checked)}
                        className="size-4 rounded accent-emerald-600"
                      />
                      <span>{t('बाली वा पशुपन्छी बीमा पोलिसी जारी भएको', 'Insurance Policy Issued')}</span>
                    </label>
                  </div>
                </div>

                {/* Validation Outcome & Quick Registration */}
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-3 ${
                      eligibilityResult.isEligible
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {eligibilityResult.isEligible ? (
                        <>
                          <CheckCircle2 className="size-5 text-emerald-600" />
                          <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                            {t('सहुलियतपूर्ण कर्जाका लागि योग्य (ELIGIBLE)', 'ELIGIBLE')}
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="size-5 text-rose-600" />
                          <span className="font-bold text-sm text-rose-900 dark:text-rose-200">
                            {t('अयोग्य (INELIGIBLE)', 'INELIGIBLE')}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="text-slate-600 dark:text-slate-400">
                      {t('योजनाको अधिकतम वैधानिक सीमा:', 'Max Statutory Ceiling:')}{' '}
                      <strong className="font-mono text-slate-900 dark:text-white">
                        {fmtCurrency(eligibilityResult.maxEligibleAmount)}
                      </strong>
                    </div>

                    {!eligibilityResult.isEligible && (
                      <ul className="list-disc list-inside space-y-1 text-rose-700 dark:text-rose-300">
                        {eligibilityResult.errorsNepali.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Quick Add Form if eligible */}
                  {eligibilityResult.isEligible && (
                    <form
                      onSubmit={handleRegisterConcessionalLoan}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-3 text-xs"
                    >
                      <div className="font-bold text-slate-900 dark:text-white">
                        {t('सहुलियतपूर्ण कर्जा खाता दर्ता गर्नुहोस्', 'Register Subsidized Loan Account')}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">{t('सदस्यता नं *', 'Member No')}</label>
                          <input
                            type="text"
                            placeholder="M-201"
                            value={newMemberNo}
                            onChange={(e) => setNewMemberNo(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">{t('ऋणी सदस्यको नाम *', 'Member Name')}</label>
                          <input
                            type="text"
                            placeholder={t('जस्तै: रीता कुमारी चौधरी', 'e.g. Rita Kumari Chaudhary')}
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 font-bold mb-1">{t('उद्यम/परियोजनाको नाम *', 'Enterprise Title')}</label>
                        <input
                          type="text"
                          placeholder={t('जस्तै: गढवा अर्गानिक च्याउ खेती तथा तरकारी फार्म', 'e.g. Organic Mushroom Farm')}
                          value={newEnterpriseName}
                          onChange={(e) => setNewEnterpriseName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          required
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow transition"
                        >
                          {t('सहुलियत कर्जा खाता खोल्नुहोस्', 'Create Concessional Loan Account')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT & STATUTORY NORMS */}
          {activeTab === 'EXPORT' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                    <Download className="size-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      {t('सोधभर्ना दाबी विवरण CSV डाउनलोड', 'Download Subsidy Claim Schedule CSV')}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {t(
                        'नेपाल सरकार, कृषि विकास मन्त्रालय तथा गढवा गाउँपालिकामा पेश गर्न योग्य पूर्ण दाबी तालिका निर्यात गर्नुहोस्।',
                        'Export the quarterly concessional loan schedule with borrower split and claim amounts.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg transition"
                  >
                    <Download className="size-4" />
                    <span>{t('CSV दाबी अनुसूची डाउनलोड (.csv)', 'Download Subsidy CSV (.csv)')}</span>
                  </button>
                </div>
              </div>

              {/* Statutory Norms Box */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>{t('सहुलियतपूर्ण कर्जा कार्यविधि २०७५ सम्बन्धी मुख्य मापदण्डहरू:', 'Key Concessional Credit Directives:')}</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-400 pl-1 leading-relaxed">
                  <li>
                    <strong>{t('ब्याज अनुदान दर:', 'Subsidy Rates:')}</strong>{' '}
                    {t(
                      'महिला उद्यमशीलतामा ६ प्रतिशत र व्यावसायिक कृषि, शिक्षित युवा स्वरोजगार तथा वैदेशिक रोजगार परियोजनामा ५ प्रतिशत नेपाल सरकारले अनुदान प्रदान गर्दछ।',
                      'Government reimburses 6% for Women Entrepreneurship and 5% for Agri, Educated Youth, and Returnee Migrant schemes.'
                    )}
                  </li>
                  <li>
                    <strong>{t('स्थलगत अनुगमन (दफा १२):', 'Mandatory Inspection (Sec 12):')}</strong>{' '}
                    {t(
                      'कर्जा प्रवाह भएको ३ महिनाभित्र स्थलगत अनुगमन गरी परियोजना सञ्चालन भएको यकिन गर्नुपर्नेछ। परियोजना बन्द वा सदुपयोग नभएमा ब्याज अनुदान रोक्का गरिनेछ।',
                      'On-site project inspection within 3 months of disbursement is mandatory. Misutilized loans forfeit interest subsidies.'
                    )}
                  </li>
                  <li>
                    <strong>{t('बीमा व्यवस्था (दफा ९):', 'Asset Insurance (Sec 9):')}</strong>{' '}
                    {t(
                      'व्यावसायिक कृषि तथा पशुपन्छी कर्जामा ७५% सरकारी अनुदान प्राप्त कृषि/पशुपन्छी बीमा अनिवार्य गरिएको छ।',
                      '75% government-subsidized crop and livestock insurance is strictly compulsory for agricultural credit.'
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
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('उनको साकोस सहुलियतपूर्ण कर्जा गेटवे सक्रिय', 'Unako SACCOS Concessional Gateway Active')}</span>
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
