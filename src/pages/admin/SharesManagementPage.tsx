import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  PieChart,
  CheckCircle2,
  Sliders,
  X,
  Lock,
} from 'lucide-react';

export function SharesManagementPage() {
  const { sharePool, updateSharePool } = useCoopStore();
  const { t, fmtCurrency, fmtCount } = useLanguageStore();
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [parValue, setParValue] = useState(sharePool.parValue);
  const [totalKitta, setTotalKitta] = useState(sharePool.totalAllottedKitta);
  const [dividendRate, setDividendRate] = useState(sharePool.annualDividendPercent);
  const [patronageBonus, setPatronageBonus] = useState(sharePool.patronageBonusPercent);
  const [isOpen, setIsOpen] = useState(sharePool.sharePurchaseOpen);

  const [fdPlans] = useState([
    { tenure: '1 Year (१ वर्ष मुद्दती)', rate: 10.0, min: 25000, penalty: '2% Pre-break' },
    { tenure: '2 Years (२ वर्ष मुद्दती)', rate: 10.75, min: 50000, penalty: '2% Pre-break' },
    { tenure: '3 Years (३ वर्ष मुद्दती)', rate: 11.25, min: 50000, penalty: '2% Pre-break' },
    { tenure: '5 Years (५ वर्ष मुद्दती)', rate: 12.0, min: 100000, penalty: '2% Pre-break' },
  ]);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveSharePool = (e: React.FormEvent) => {
    e.preventDefault();
    updateSharePool({
      parValue,
      totalAllottedKitta: totalKitta,
      annualDividendPercent: dividendRate,
      patronageBonusPercent: patronageBonus,
      sharePurchaseOpen: isOpen,
    });
    showToastMsg(t('सेयर पुँजी कोष तथा साधारण सभा लाभांश मापदण्ड सफलतापूर्वक अद्यावधिक भयो!', 'Share Capital Pool and AGM Dividend parameters successfully updated!'));
    setShowShareModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
            <PieChart className="size-4" />
            <span>{t('सदस्य सेयर पुँजी तथा मुद्दती निक्षेप', 'MEMBER EQUITY & FIXED DEPOSIT SCHEMES')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('सेयर पुँजी तथा मुद्दती निक्षेप व्यवस्थापन', 'Shares Capital & Fixed Deposit (FD) Suite')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'सहकारी प्रति कित्ता सेयर दर, वार्षिक साधारण सभा लाभांश, संरक्षित पुँजी फिर्ता कोष र मुद्दती निक्षेप दर व्यवस्थापन।',
              'Configure cooperative par value, declare AGM dividend percentages, manage patronage bonus, and update Mudhati FD tenures.'
            )}
          </p>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
          type="button"
        >
          <Sliders className="size-4" />
          <span>{t('सेयर मापदण्ड अद्यावधिक', 'Update Share Parameters')}</span>
        </button>
      </div>

      {/* Share Pool Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase">{t('कुल सेयर पुँजी', 'Total Equity Capital')}</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            रु. {fmtCurrency(sharePool.parValue * sharePool.totalAllottedKitta, true)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {fmtCurrency(sharePool.totalAllottedKitta, true)} {t('कत्ता @ रु. ', 'Kitta @ NPR ')}{sharePool.parValue}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase">{t('वार्षिक लाभांश दर', 'Annual Dividend Declared')}</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 mt-1">
            {sharePool.annualDividendPercent}% p.a.
          </div>
          <div className="text-[11px] text-emerald-500 mt-0.5">{t('साधारण सभा द्वारा स्वीकृत दर', 'Board AGM Approved Rate')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase">{t('संरक्षित पुँजी फिर्ता कोष', 'Patronage Bonus Pool')}</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-blue-600 mt-1">
            {sharePool.patronageBonusPercent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{t('सक्रिय ऋणी तथा कारोबारी सदस्य लक्षित', 'For active cooperative borrowers')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase">{t('सेयर खरिद आवेदन विन्डो', 'Subscription Window')}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`size-2.5 rounded-full ${sharePool.sharePurchaseOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {sharePool.sharePurchaseOpen ? t('सदस्यहरूका लागि खुला', 'Open for Members') : t('सञ्चालक समितिद्वारा बन्द', 'Closed by Board')}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{t('पोर्टलमा खरिद खुला/बन्द', 'Member Portal purchase toggle')}</div>
        </div>
      </div>

      {/* Fixed Deposit (Mudhati) Schemes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="size-4 text-emerald-500" />
              <span>{t('मुद्दती निक्षेप योजना तथा ब्याजदरहरू', 'Mudhati Fixed Deposit Schemes & Term Rates')}</span>
            </h3>
            <p className="text-xs text-slate-400">{t('सहकारी सदस्यहरूका लागि निश्चित अवधिको आकर्षक निक्षेप उपकरणहरू', 'Time-locked deposit instruments for cooperative members')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fdPlans.map((plan, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3"
            >
              <div className="font-bold text-slate-900 dark:text-white text-xs">{plan.tenure}</div>
              <div>
                <div className="text-2xl font-black font-mono text-emerald-600">{plan.rate}%</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('वार्षिक प्रतिफल', 'Annual Yield APY')}</div>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 space-y-1">
                <div>{t('न्यूनतम: रु. ', 'Min: NPR ')}{fmtCurrency(plan.min, true)}</div>
                <div>{t('फिर्ता जरिवाना: ', 'Penalty: ')}{plan.penalty}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UPDATE SHARE PARAMETERS MODAL */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">
                {t('सहकारी सेयर मापदण्ड अद्यावधिक', 'Update Cooperative Share Parameters')}
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSharePool} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('प्रति कित्ता अंकित मूल्य (रु.)', 'Par Value / Unit (NPR)')}
                  </label>
                  <input
                    type="number"
                    value={parValue}
                    onChange={(e) => setParValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('कुल बाँडफाँड कित्ता', 'Total Allotted Kitta')}
                  </label>
                  <input
                    type="number"
                    value={totalKitta}
                    onChange={(e) => setTotalKitta(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('वार्षिक लाभांश प्रतिशत', 'Annual Dividend %')}
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={dividendRate}
                    onChange={(e) => setDividendRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('संरक्षित पुँजी फिर्ता कोष %', 'Patronage Bonus %')}
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={patronageBonus}
                    onChange={(e) => setPatronageBonus(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {t('सदस्य सेयर खरिद खुला/बन्द', 'Member Share Subscription')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t('सदस्य पोर्टलमा थप सेयर खरिद गर्न अनुमति दिनुहोस्', 'Allow members to buy equity shares in portal')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    isOpen ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {isOpen ? t('खुला', 'OPEN') : t('बन्द', 'CLOSED')}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('मापदण्ड सुरक्षित गर्नुहोस्', 'Save Parameters')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
