import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  MaturityBucketKey,
  INITIAL_ALM_PORTFOLIO,
  calculateAlmMaturityGaps,
  simulateInterestRateShocks,
  runLiquidityStressTests,
  generateAlmComprehensiveReport,
  exportAlmToCsv,
} from '../../utils/almMaturityGapEngine';
import { printElement } from '../../utils/printHelper';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  Percent,
  Activity,
  FileSpreadsheet,
  Printer,
  Download,
  X,
  Sparkles,
  SlidersHorizontal,
  AlertTriangle,
  Building,
} from 'lucide-react';

interface AlmMaturityGapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlmMaturityGapModal: React.FC<AlmMaturityGapModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency, fmtPercent, fmtDigits } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'GAP_MATRIX' | 'RATE_SHOCKS' | 'STRESS_TEST' | 'ALCO_MINUTES'>('GAP_MATRIX');
  const [portfolio, setPortfolio] = useState(INITIAL_ALM_PORTFOLIO);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const report = useMemo(() => {
    return generateAlmComprehensiveReport(portfolio);
  }, [portfolio]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportCsv = () => {
    const csv = exportAlmToCsv(report);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Unako_ALM_Maturity_Gap_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t('ALM परिपक्वता प्रतिवेदन CSV डाउनलोड भयो', 'ALM report exported as CSV'));
  };

  const totalAssets = report.totalAssets;
  const totalLiabilities = report.totalLiabilities;
  const oneYearGap = report.oneYearCumulativeGap;
  const oneYearRatio = report.oneYearGapRatioPercent;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-indigo-500 animate-slide-in">
          <ShieldCheck className="size-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Layers className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                  {t('सम्पत्ति तथा दायित्व व्यवस्थापन (ALM & ALCO)', 'ASSET LIABILITY MANAGEMENT & ALCO')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 font-bold">
                  {t('पर्ल्स L1 / L2 तरलता संरचना', 'PEARLS L1 & L2 Structural Liquidity')}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {t('परिपक्वता अन्तर, ब्याजदर संवेदनशीलता तथा तरलता तनाव परीक्षण', 'Maturity Gap, Interest Rate Shocks & Stress Test')}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-900/50 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('GAP_MATRIX')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'GAP_MATRIX'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="size-4" />
            <span>{t('६-अवधि परिपक्वता अन्तर', '6-Bucket Maturity Matrix')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RATE_SHOCKS')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'RATE_SHOCKS'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Percent className="size-4" />
            <span>{t('ब्याजदर संवेदनशीलता', 'Interest Rate Shocks')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STRESS_TEST')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'STRESS_TEST'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Activity className="size-4" />
            <span>{t('तरलता तनाव परीक्षण', 'Liquidity Stress Tests')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ALCO_MINUTES')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ALCO_MINUTES'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Building className="size-4" />
            <span>{t('ALCO उपसमिति निर्णय तथा सिफारिस', 'ALCO Policy Minutes')}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: MATURITY GAP MATRIX */}
          {activeTab === 'GAP_MATRIX' && (
            <div className="space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
                    {t('कुल ब्याज संवेदनशील सम्पत्ति (RSA)', 'Rate Sensitive Assets')}
                  </span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {fmtCurrency(totalAssets, true)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block">
                    {t('कुल ब्याज संवेदनशील दायित्व (RSL)', 'Rate Sensitive Liabilities')}
                  </span>
                  <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                    {fmtCurrency(totalLiabilities, true)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    {t('१-वर्षे संचयी अन्तर (1-Yr Cumulative Gap)', '1-Year Cumulative Gap')}
                  </span>
                  <p className={`text-xl font-black mt-1 ${oneYearGap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {fmtCurrency(oneYearGap, true)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    {t('अन्तर / कुल सम्पत्ति अनुपात', 'Gap-to-Assets Ratio')}
                  </span>
                  <p className={`text-xl font-black mt-1 ${Math.abs(oneYearRatio) <= 15 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {fmtDigits(oneYearRatio)}%
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">मापदण्ड: ±१५% भित्र</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {t('समय परिपक्वता अवधि अनुसार सम्पत्ति-दायित्व अन्तर विश्लेषण (६ बकेट)', '6-Bucket ALM Maturity Gap Table')}
                </h3>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                >
                  <Download className="size-3.5" />
                  <span>{t('CSV निर्यात', 'Export CSV')}</span>
                </button>
              </div>

              {/* Gap Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3 font-semibold">{t('समय परिपक्वता अवधि', 'Time Horizon')}</th>
                      <th className="p-3 font-semibold text-right">{t('सम्पत्ति (RSA)', 'Assets (RSA)')}</th>
                      <th className="p-3 font-semibold text-right">{t('दायित्व (RSL)', 'Liabilities (RSL)')}</th>
                      <th className="p-3 font-semibold text-right">{t('अवधि अन्तर', 'Periodic Gap')}</th>
                      <th className="p-3 font-semibold text-right">{t('संचयी अन्तर', 'Cumulative Gap')}</th>
                      <th className="p-3 font-semibold text-center">{t('सम्पत्ति अनुपात %', 'Gap %')}</th>
                      <th className="p-3 font-semibold text-right">{t('स्थिति', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {report.bucketAnalytics.map((b) => (
                      <tr key={b.bucket.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white">{b.bucket.labelNe}</div>
                          <div className="text-[10px] text-slate-400">{b.bucket.labelEn} ({b.bucket.daysRange} days)</div>
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {fmtCurrency(b.rateSensitiveAssets, true)}
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                          {fmtCurrency(b.rateSensitiveLiabilities, true)}
                        </td>

                        <td className={`p-3 text-right font-mono font-bold ${b.periodicGap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {b.periodicGap > 0 ? '+' : ''}{fmtCurrency(b.periodicGap, true)}
                        </td>

                        <td className={`p-3 text-right font-mono font-black ${b.cumulativeGap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {b.cumulativeGap > 0 ? '+' : ''}{fmtCurrency(b.cumulativeGap, true)}
                        </td>

                        <td className="p-3 text-center font-mono font-bold">
                          {b.gapToAssetsRatioPercent > 0 ? '+' : ''}{fmtDigits(b.gapToAssetsRatioPercent)}%
                        </td>

                        <td className="p-3 text-right">
                          {b.status === 'SURPLUS' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                              बचत तरलता (Surplus)
                            </span>
                          )}
                          {b.status === 'ACCEPTABLE' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
                              सन्तुलित (Balanced)
                            </span>
                          )}
                          {b.status === 'DEFICIT_WARNING' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                              सतर्कता (Deficit Warning)
                            </span>
                          )}
                          {b.status === 'CRITICAL_DEFICIT' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
                              अत्यधिक अन्तर (Critical)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: INTEREST RATE SHOCKS */}
          {activeTab === 'RATE_SHOCKS' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                  <Percent className="size-4" />
                  <span>{t('ब्याजदर परिवर्तनको खुद ब्याज आम्दानी (NII) मा पर्ने संवेदनशीलता प्रभाव', 'Interest Rate Sensitivity Simulation')}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  १-वर्षे संचयी अन्तर (रु. {oneYearGap.toLocaleString()}) का आधारमा ब्याजदर घटबढ हुँदा सहकारीको खुद ब्याज आम्दानी (Net Interest Income) मा आउने उतारचढाव प्रक्षेपण।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {report.rateShocks.map((shock, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                        {shock.shockLabel}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        shock.deltaNetInterestIncome >= 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {shock.deltaNetInterestIncome >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                        <span>{shock.deltaNetInterestIncome >= 0 ? '+' : ''}{fmtCurrency(shock.deltaNetInterestIncome, true)}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {shock.impactAssessmentNe}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LIQUIDITY RUNOFF STRESS TESTS */}
          {activeTab === 'STRESS_TEST' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('तरलता संकट दबाब परीक्षण', 'Liquidity Runoff Stress Tests')}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  आकस्मिक बचत फिर्ता माग हुँदा संस्थाको प्राथमिक तरलता (नगद + बैंक मौज्दात) र दोस्रो तहको तरलताले कति दिन धान्न सक्छ?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {report.stressTests.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{st.scenarioNameNe}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.status === 'STABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : st.status === 'VULNERABLE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {st.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">अनुमानित बचत फिर्ता:</span>
                        <strong className="text-rose-600">{fmtCurrency(st.expectedOutflow, true)} ({st.depositRunoffPercent}%)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">कुल तरलता मौज्दात:</span>
                        <strong className="text-slate-900 dark:text-white">{fmtCurrency(st.totalLiquidityBuffer, true)}</strong>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-bold">
                        <span className="text-slate-500">बाँकी बचत/घाटा:</span>
                        <span className={st.netSurplusOrDeficit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {fmtCurrency(st.netSurplusOrDeficit, true)}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-center">
                      <span className="text-[10px] text-slate-400 block font-medium">धान्न सक्ने दिन</span>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                        {st.canSurviveDays >= 180 ? '१८०+ दिन' : `${fmtDigits(st.canSurviveDays)} दिन`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ALCO POLICY MINUTES */}
          {activeTab === 'ALCO_MINUTES' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('सम्पत्ति दायित्व उपसमिति (ALCO) निर्णय तथा सिफारिस टिपोट', 'ALCO Policy Minutes & Directives')}
                  </h3>
                  <p className="text-xs text-slate-500">सहकारी ऐन २०७४ दफा ६७ तथा सञ्चालक समिति पेशीका लागि आधिकारिक निर्णय।</p>
                </div>

                <button
                  type="button"
                  onClick={() => printElement('alco-minute-statement')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold transition shadow-xs"
                >
                  <Printer className="size-3.5" />
                  <span>{t('निर्णय टिपोट प्रिन्ट', 'Print Minutes')}</span>
                </button>
              </div>

              {/* Printable Document Box */}
              <div
                id="alco-minute-statement"
                className="p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    उनको बचत तथा ऋण सहकारी संस्था लिमिटेड
                  </h4>
                  <p className="text-xs text-slate-500">गढवा-५, दाङ • सम्पत्ति तथा दायित्व उपसमिति (ALCO)</p>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-2">
                    त्रैमासिक परिपक्वता अन्तर तथा तरलता व्यवस्थापन निर्णय टिपोट
                  </h5>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <p>
                    आज मिति <strong>२०८१/०६/०५</strong> गते यस संस्थाको सम्पत्ति तथा दायित्व उपसमिति (ALCO) को बैठक संयोजकको अध्यक्षतामा सम्पन्न भई संस्थाको चालु सम्पत्ति तथा दायित्वको परिपक्वता संरचना, ब्याजदर संवेदनशीलता र तरलता तनाव परीक्षण प्रतिवेदनमाथि विस्तृत छलफल गरियो।
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <strong className="block text-slate-900 dark:text-white">मुख्य वित्तीय सूचकहरू:</strong>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <span>कुल सम्पत्ति (RSA): <strong>रु. {totalAssets.toLocaleString()}</strong></span>
                      <span>कुल दायित्व (RSL): <strong>रु. {totalLiabilities.toLocaleString()}</strong></span>
                      <span>१-वर्षे संचयी अन्तर: <strong>रु. {oneYearGap.toLocaleString()}</strong></span>
                      <span>अन्तर अनुपात: <strong>{oneYearRatio}%</strong></span>
                    </div>
                  </div>

                  <p>
                    <strong>उपसमिति निर्णय तथा सिफारिस:</strong> {report.alcoRecommendationNe}
                  </p>

                  <p>
                    यो निर्णय कार्यान्वयनका लागि प्रमुख कार्यकारी अधिकृत र वित्तीय विभागलाई निर्देशन दिँदै आगामी सञ्चालक समिति बैठकमा अनुमोदनका लागि पेश गर्ने निर्णय गरियो।
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-8 text-center text-[11px] text-slate-500">
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                    लेखा अधिकृत / ALCO सदस्य सचिव
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                    व्यवस्थापक / सदस्य
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                    संयोजक / ALCO उपसमिति
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>{t('नेपाल सहकारी ऐन तथा पर्ल्स मापदण्ड L1/L2 अनुसार प्रमाणित ALM संरचना', 'Complies with Cooperative Act 2074 & PEARLS L1/L2 ALM')}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-bold transition shadow-xs"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
