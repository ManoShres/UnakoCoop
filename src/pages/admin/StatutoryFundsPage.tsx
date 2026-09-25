import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../../store/useLanguageStore';
import { INITIAL_STATUTORY_FUNDS } from '../../data/statutoryFundsMockData';
import { StatutoryFundRecord } from '../../types';
import {
  Landmark,
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  BookOpen,
  HeartHandshake,
  Users,
  Award,
  Sparkles,
  Coins,
  CheckCircle2,
  X,
} from 'lucide-react';

export const StatutoryFundsPage: React.FC = () => {
  const { t, fmtCurrency } = useLanguageStore();

  const [funds, setFunds] = useState<StatutoryFundRecord[]>(INITIAL_STATUTORY_FUNDS);
  const [selectedFund, setSelectedFund] = useState<StatutoryFundRecord | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(50000);
  const [adjustType, setAdjustType] = useState<'ALLOCATE' | 'UTILIZE'>('ALLOCATE');
  const [adjustNote, setAdjustNote] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAppropriationModal, setShowAppropriationModal] = useState(false);
  const [surplusNetProfit, setSurplusNetProfit] = useState<number>(1200000);
  const [surplusFiscalYear, setSurplusFiscalYear] = useState<string>('2081/82');
  const [toast, setToast] = useState<string | null>(null);

  const totalReserves = funds.reduce((sum, f) => sum + f.currentBalance, 0);
  const totalAllocatedThisYear = funds.reduce((sum, f) => sum + f.allocatedThisYear, 0);
  const totalUtilizedThisYear = funds.reduce((sum, f) => sum + f.utilizedThisYear, 0);

  const handleApplyAdjustment = () => {
    if (!selectedFund || adjustAmount <= 0) return;

    setFunds((prev) =>
      prev.map((f) => {
        if (f.id !== selectedFund.id) return f;
        const newBalance =
          adjustType === 'ALLOCATE'
            ? f.currentBalance + adjustAmount
            : Math.max(0, f.currentBalance - adjustAmount);
        const newAllocated =
          adjustType === 'ALLOCATE' ? f.allocatedThisYear + adjustAmount : f.allocatedThisYear;
        const newUtilized =
          adjustType === 'UTILIZE' ? f.utilizedThisYear + adjustAmount : f.utilizedThisYear;

        return {
          ...f,
          currentBalance: newBalance,
          allocatedThisYear: newAllocated,
          utilizedThisYear: newUtilized,
        };
      })
    );

    setShowModal(false);
    setAdjustNote('');
  };

  const getFundIcon = (type: string) => {
    switch (type) {
      case 'GENERAL_RESERVE':
        return <Landmark className="size-5 text-indigo-500" />;
      case 'COOP_PROMOTION':
        return <Award className="size-5 text-amber-500" />;
      case 'COOP_EDUCATION':
        return <BookOpen className="size-5 text-blue-500" />;
      case 'COMMUNITY_DEVELOPMENT':
        return <HeartHandshake className="size-5 text-rose-500" />;
      case 'EMPLOYEE_BONUS':
        return <Users className="size-5 text-emerald-500" />;
      default:
        return <ShieldCheck className="size-5 text-teal-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                {t('सहकारी ऐन २०७४, दफा ६८ बमोजिम', 'Cooperative Act 2074, Section 68')}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                {t('वैधानिक सुरक्षण कोष', 'Statutory Capital Protection')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('वैधानिक जगेडा तथा अन्य कोष खाता (Statutory Reserve Funds)', 'Statutory Reserve Funds Register')}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              {t(
                'वार्षिक खुद बचत (नाफा) बाट दफा ६८ अनुसार छुट्याउनुपर्ने साधारण जगेडा (न्यूनतम २५%), शिक्षा, प्रवर्द्धन, र सामुदायिक राहत कोषहरूको आधिकारिक अभिलेख।',
                'Official tracking of statutory appropriations from annual net surplus into General Reserve (min 25%), Cooperative Education, Promotion, and Community Relief funds.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAppropriationModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm shadow-indigo-500/20 cursor-pointer"
            >
              <Sparkles className="size-4 text-indigo-200" />
              <span>{t('+ नाफा तथा लाभांश विनियोजन', '+ Appropriate Net Surplus')}</span>
            </button>

            <Link
              to="/admin/shares"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              <Coins className="size-4 text-emerald-500" />
              <span>{t('सेयर तथा लाभांश कन्सोल →', 'Shares & Dividends →')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">
            {t('कुल वैधानिक जगेडा कोष मौज्दात', 'Total Statutory Reserves')}
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {fmtCurrency(totalReserves, true)}
          </div>
          <p className="text-xs text-emerald-500 font-semibold">
            {t('पूँजीगत सुरक्षा तथा जोखिम वहन क्षमता', 'Capital protection buffer')}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs text-indigo-500 font-bold uppercase">
            {t('चालु आ.व. बाँडफाँड थप', 'Allocated This Fiscal Year')}
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {fmtCurrency(totalAllocatedThisYear, true)}
          </div>
          <p className="text-xs text-slate-500">
            {t('नाफा बाँडफाँड योजना अनुसार दाखिला', 'Transferred from surplus')}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs text-rose-500 font-bold uppercase">
            {t('चालु आ.व. खर्च / उपयोग', 'Utilized This Fiscal Year')}
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {fmtCurrency(totalUtilizedThisYear, true)}
          </div>
          <p className="text-xs text-slate-500">
            {t('सामुदायिक राहत तथा शिक्षा तालिम खर्च', 'Community & member welfare outlays')}
          </p>
        </div>
      </div>

      {/* Fund Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {funds.map((fund) => (
          <div
            key={fund.id}
            className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {getFundIcon(fund.fundType)}
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-mono">
                  {fund.mandatedPercent}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{fund.nameNepali}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{fund.legalBasis}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  {t('हालको मौज्दात (Current Balance)', 'Current Balance')}
                </span>
                <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                  {fmtCurrency(fund.currentBalance, true)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                  <span className="text-[10px] text-slate-400 block">{t('यस वर्ष थप', 'Allocated')}</span>
                  <span className="font-mono font-bold text-emerald-600">
                    +{fmtCurrency(fund.allocatedThisYear, true)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                  <span className="text-[10px] text-slate-400 block">{t('यस वर्ष खर्च', 'Utilized')}</span>
                  <span className="font-mono font-bold text-rose-600">
                    -{fmtCurrency(fund.utilizedThisYear, true)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2">{fund.descriptionNepali}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedFund(fund);
                setShowModal(true);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="size-3.5" />
              <span>{t('कोष प्रविष्टि / खर्च समायोजन', 'Record Transfer / Expense')}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Fund Adjustment Modal */}
      {showModal && selectedFund && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t('कोष रकम प्रविष्टि / समायोजन', 'Fund Allocation / Expense')}
                </h3>
                <p className="text-xs text-slate-400">{selectedFund.nameNepali}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">
                  {t('प्रविष्टि प्रकार', 'Adjustment Type')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ALLOCATE')}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      adjustType === 'ALLOCATE'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t('+ नाफाबाट थप (Allocate)', '+ Allocate')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('UTILIZE')}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      adjustType === 'UTILIZE'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t('- कोष खर्च (Utilize)', '- Expense / Relief')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">
                  {t('रकम (NPR)', 'Amount in NPR')}
                </label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(0, parseInt(e.target.value || '0', 10)))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">
                  {t('सञ्चालक समिति निर्णय वा भौचर विवरण', 'Committee Decision / Voucher Reference')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. AGM Decision No. 4 / Member Medical Relief"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                {t('रद्द गर्नुहोस्', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleApplyAdjustment}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                {t('पुष्टि गर्नुहोस्', 'Confirm & Post')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROPRIATION MODAL */}
      {showAppropriationModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="approp-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setShowAppropriationModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-400" />
                <h3 id="approp-modal-title" className="font-bold text-sm">
                  {t('वार्षिक साधारण सभा नाफा बाँडफाँड तथा लाभांश विनियोजन', 'AGM Surplus Appropriation & Dividend Allocation')}
                </h3>
              </div>
              <button onClick={() => setShowAppropriationModal(false)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('वार्षिक खुद नाफा (Net Surplus)', 'Annual Net Surplus (NPR)')}
                  </label>
                  <input
                    type="number"
                    value={surplusNetProfit}
                    onChange={(e) => setSurplusNetProfit(Math.max(0, parseInt(e.target.value || '0', 10)))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('आर्थिक वर्ष', 'Fiscal Year')}
                  </label>
                  <input
                    type="text"
                    value={surplusFiscalYear}
                    onChange={(e) => setSurplusFiscalYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Statutory Splits Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 font-bold border-b border-slate-200 dark:border-slate-800 flex justify-between">
                  <span>{t('दफा ६८ वैधानिक कोष बाँडफाँड (Statutory Split)', 'Section 68 Statutory Splits')}</span>
                  <span>{t('रकम (NPR)', 'Amount')}</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px] p-2 space-y-1.5">
                  <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400 font-bold">
                    <span>{t('साधारण जगेडा कोष (२५% न्यूनतम):', 'General Reserve (min 25%):')}</span>
                    <span>{fmtCurrency(Math.round(surplusNetProfit * 0.25), true)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>{t('सहकारी प्रवर्द्धन कोष (०.५%):', 'Coop Promotion Fund (0.5%):')}</span>
                    <span>{fmtCurrency(Math.round(surplusNetProfit * 0.005), true)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>{t('सहकारी शिक्षा कोष (५.०%):', 'Coop Education Fund (5.0%):')}</span>
                    <span>{fmtCurrency(Math.round(surplusNetProfit * 0.05), true)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>{t('सामुदायिक विकास तथा राहत कोष (५.०%):', 'Community Welfare Fund (5.0%):')}</span>
                    <span>{fmtCurrency(Math.round(surplusNetProfit * 0.05), true)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>{t('कर्मचारी बोनस कोष (१०.०%):', 'Employee Bonus Fund (10.0%):')}</span>
                    <span>{fmtCurrency(Math.round(surplusNetProfit * 0.1), true)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600 font-black border-t border-slate-200 dark:border-slate-700 pt-1.5">
                    <span>{t('लाभांश तथा संरक्षित पुँजी फिर्ता कोष (५४.५%):', 'Distributable Dividend & Patronage Pool (54.5%):')}</span>
                    <span>{fmtCurrency(Math.round(surplusNetProfit * 0.545), true)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAppropriationModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {t('रद्द गर्नुहोस्', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFunds((prev) =>
                    prev.map((f) => {
                      if (f.fundType === 'GENERAL_RESERVE') {
                        const added = Math.round(surplusNetProfit * 0.25);
                        return { ...f, currentBalance: f.currentBalance + added, allocatedThisYear: f.allocatedThisYear + added };
                      }
                      if (f.fundType === 'COOP_EDUCATION') {
                        const added = Math.round(surplusNetProfit * 0.05);
                        return { ...f, currentBalance: f.currentBalance + added, allocatedThisYear: f.allocatedThisYear + added };
                      }
                      if (f.fundType === 'COOP_PROMOTION') {
                        const added = Math.round(surplusNetProfit * 0.005);
                        return { ...f, currentBalance: f.currentBalance + added, allocatedThisYear: f.allocatedThisYear + added };
                      }
                      if (f.fundType === 'COMMUNITY_DEVELOPMENT') {
                        const added = Math.round(surplusNetProfit * 0.05);
                        return { ...f, currentBalance: f.currentBalance + added, allocatedThisYear: f.allocatedThisYear + added };
                      }
                      if (f.fundType === 'EMPLOYEE_BONUS') {
                        const added = Math.round(surplusNetProfit * 0.1);
                        return { ...f, currentBalance: f.currentBalance + added, allocatedThisYear: f.allocatedThisYear + added };
                      }
                      return f;
                    })
                  );
                  setShowAppropriationModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="size-4" />
                <span>{t('कोषहरूमा दाखिला गर्नुहोस्', 'Allocate to Statutory Reserves')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
