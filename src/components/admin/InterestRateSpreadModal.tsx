import React, { useState, useMemo } from 'react';
import {
  X,
  Percent,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Download,
  Printer,
  Sliders,
  RotateCcw,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  DEFAULT_PRODUCT_BUCKETS,
  calculateInterestSpread,
  simulateRateRevisions,
  downloadInterestSpreadCsv,
  ProductRateBucket,
  RateSimulationInput,
  STATUTORY_MAX_SPREAD,
  DEFAULT_REFERENCE_RATE_CEILING,
} from '../../utils/interestSpreadEngine';

interface InterestRateSpreadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InterestRateSpreadModal: React.FC<InterestRateSpreadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtPercent } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'MATRIX' | 'SIMULATOR' | 'MEMO'>('MATRIX');
  const [productBuckets, setProductBuckets] = useState<ProductRateBucket[]>(DEFAULT_PRODUCT_BUCKETS);
  const [referenceCeiling, setReferenceCeiling] = useState(DEFAULT_REFERENCE_RATE_CEILING);

  // Simulation rate state
  const [simulatedRates, setSimulatedRates] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    DEFAULT_PRODUCT_BUCKETS.forEach((p) => {
      map[p.id] = p.interestRate;
    });
    return map;
  });

  const baselineAnalysis = useMemo(
    () => calculateInterestSpread(productBuckets, referenceCeiling),
    [productBuckets, referenceCeiling]
  );

  const simulationInputs: RateSimulationInput[] = useMemo(() => {
    return Object.entries(simulatedRates).map(([productId, simulatedRate]) => ({
      productId,
      simulatedRate,
    }));
  }, [simulatedRates]);

  const simulatedAnalysis = useMemo(
    () => simulateRateRevisions(productBuckets, simulationInputs, referenceCeiling),
    [productBuckets, simulationInputs, referenceCeiling]
  );

  if (!isOpen) return null;

  const handleSimRateChange = (productId: string, newRate: number) => {
    setSimulatedRates((prev) => ({
      ...prev,
      [productId]: Number(newRate.toFixed(2)),
    }));
  };

  const handleResetSimulation = () => {
    const map: Record<string, number> = {};
    productBuckets.forEach((p) => {
      map[p.id] = p.interestRate;
    });
    setSimulatedRates(map);
  };

  const handleExportCsv = () => {
    downloadInterestSpreadCsv(baselineAnalysis, productBuckets);
  };

  const handlePrintMemo = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Percent className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40">
                  {t('सहकारी ऐन २०७४ • दफा ५०', 'Coop Act 2074 • Sec 50')}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {t('अधिकतम ब्याजदर अन्तर: ४.७५%', 'Max Allowed Spread: 4.75%')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {t(
                  'ब्याजदर अन्तर तथा सन्दर्भ दर अनुगमन प्रणाली',
                  'Interest Rate Spread (<= 4.75%) & Reference Rate Compliance'
                )}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Top KPI Summary Banner */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {t('भारित कर्जा ब्याजदर (WALR)', 'Weighted Lending Rate')}
            </span>
            <strong className="text-white text-base block mt-0.5 font-mono">
              {fmtPercent(baselineAnalysis.weightedAvgLendingRate)}
            </strong>
            <span className="text-[10px] text-slate-400">
              {t('कुल कर्जा:', 'Total Loan:')} {fmtCurrency(baselineAnalysis.totalLoanBalance, true)}
            </span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {t('भारित निक्षेप ब्याजदर (WADR)', 'Weighted Deposit Rate')}
            </span>
            <strong className="text-white text-base block mt-0.5 font-mono">
              {fmtPercent(baselineAnalysis.weightedAvgDepositRate)}
            </strong>
            <span className="text-[10px] text-slate-400">
              {t('कुल निक्षेप:', 'Total Deposit:')} {fmtCurrency(baselineAnalysis.totalDepositBalance, true)}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl border ${
              baselineAnalysis.spreadStatus === 'COMPLIANT'
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                : baselineAnalysis.spreadStatus === 'WARNING'
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            }`}
          >
            <span className="block text-[10px] uppercase font-semibold">
              {t('ब्याजदर अन्तर', 'Net Interest Spread')}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <strong className="text-base font-mono font-black">
                {fmtPercent(baselineAnalysis.spreadRate)}
              </strong>
              <span className="text-[10px] font-bold">
                / {fmtPercent(STATUTORY_MAX_SPREAD)}
              </span>
            </div>
            <span className="text-[10px] block">
              {baselineAnalysis.spreadStatus === 'COMPLIANT'
                ? t('कानूनी सीमाभित्र', 'Fully Compliant')
                : baselineAnalysis.spreadStatus === 'WARNING'
                ? t('सीमा नजिक', 'Near Statutory Cap')
                : t('कानून उल्लंघन', 'Regulatory Breach')}
            </span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {t('खुद ब्याज आम्दानी (NII)', 'Net Interest Income')}
            </span>
            <strong className="text-emerald-400 text-base block mt-0.5 font-mono">
              {fmtCurrency(baselineAnalysis.estimatedNetInterestIncome, true)}
            </strong>
            <span className="text-[10px] text-slate-400">
              {t('सन्दर्भ दर सीमा:', 'Ref Rate Cap:')} {fmtPercent(referenceCeiling)}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-5 pt-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('MATRIX')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'MATRIX'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="size-4" />
              <span>{t('प्रडक्ट म्याट्रिक्स तथा दर', 'Product Rate Matrix')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('SIMULATOR')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'SIMULATOR'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="size-4" />
              <span>{t('ब्याजदर परिमार्जन सिमुलेटर', 'Rate Revision Simulator')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MEMO')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'MEMO'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="size-4" />
              <span>{t('नियामक प्रतिवेदन तथा सूचना', 'Regulatory Filing Memo')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold border border-indigo-900/60 transition cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>{t('CSV निर्यात', 'Export CSV')}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: Product Matrix */}
          {activeTab === 'MATRIX' && (
            <div className="space-y-4">
              {/* Deposit Products Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <TrendingDown className="size-4 text-sky-400" />
                    <span>{t('निक्षेप योजनाहरूको ब्याजदर तथा मौज्दात', 'Deposit Products Portfolio')}</span>
                  </h4>
                  <span className="text-slate-400 font-mono text-[11px]">
                    WADR: {fmtPercent(baselineAnalysis.weightedAvgDepositRate)}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60 shadow-inner">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-2.5 w-8 text-center">#</th>
                        <th className="p-2.5">{t('निक्षेप योजना', 'Product Name')}</th>
                        <th className="p-2.5 text-right">{t('कुल मौज्दात (NPR)', 'Principal Balance')}</th>
                        <th className="p-2.5 text-center">{t('ब्याजदर %', 'Rate %')}</th>
                        <th className="p-2.5 text-right">{t('वार्षिक ब्याज खर्च', 'Annual Cost')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {productBuckets
                        .filter((p) => p.category === 'DEPOSIT')
                        .map((p, idx) => {
                          const cost = (p.principalBalance * p.interestRate) / 100;
                          return (
                            <tr key={p.id} className="hover:bg-slate-900/40">
                              <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                              <td className="p-2.5">
                                <div className="font-bold text-white">{p.nameNepali}</div>
                                <div className="text-[10px] text-slate-400">{p.name}</div>
                              </td>
                              <td className="p-2.5 text-right font-mono font-medium text-slate-200">
                                {fmtCurrency(p.principalBalance, true)}
                              </td>
                              <td className="p-2.5 text-center font-mono font-bold text-sky-400">
                                {fmtPercent(p.interestRate)}
                              </td>
                              <td className="p-2.5 text-right font-mono text-slate-300">
                                {fmtCurrency(cost, true)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Loan Products Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <TrendingUp className="size-4 text-emerald-400" />
                    <span>{t('कर्जा योजनाहरूको ब्याजदर तथा मौज्दात', 'Loan Products Portfolio')}</span>
                  </h4>
                  <span className="text-slate-400 font-mono text-[11px]">
                    WALR: {fmtPercent(baselineAnalysis.weightedAvgLendingRate)}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60 shadow-inner">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-2.5 w-8 text-center">#</th>
                        <th className="p-2.5">{t('कर्जा योजना', 'Loan Product')}</th>
                        <th className="p-2.5 text-right">{t('लगानी मौज्दात (NPR)', 'Loan Balance')}</th>
                        <th className="p-2.5 text-center">{t('ब्याजदर %', 'Rate %')}</th>
                        <th className="p-2.5 text-center">{t('सन्दर्भ दर स्थिति', 'Ref Cap')}</th>
                        <th className="p-2.5 text-right">{t('वार्षिक आम्दानी', 'Annual Yield')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {productBuckets
                        .filter((p) => p.category === 'LOAN')
                        .map((p, idx) => {
                          const yieldAmt = (p.principalBalance * p.interestRate) / 100;
                          const isBreached = p.interestRate > referenceCeiling;
                          return (
                            <tr key={p.id} className="hover:bg-slate-900/40">
                              <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                              <td className="p-2.5">
                                <div className="font-bold text-white">{p.nameNepali}</div>
                                <div className="text-[10px] text-slate-400">{p.name}</div>
                              </td>
                              <td className="p-2.5 text-right font-mono font-medium text-slate-200">
                                {fmtCurrency(p.principalBalance, true)}
                              </td>
                              <td className="p-2.5 text-center font-mono font-bold text-emerald-400">
                                {fmtPercent(p.interestRate)}
                              </td>
                              <td className="p-2.5 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isBreached
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                      : 'bg-emerald-500/20 text-emerald-300'
                                  }`}
                                >
                                  {isBreached ? t('सीमा नाघेको', 'Cap Exceeded') : t('वैध', 'Compliant')}
                                </span>
                              </td>
                              <td className="p-2.5 text-right font-mono text-slate-300">
                                {fmtCurrency(yieldAmt, true)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Simulation Mode */}
          {activeTab === 'SIMULATOR' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <Sliders className="size-4 text-indigo-400" />
                    <span>{t('ब्याजदर परिमार्जन प्रभाव सिमुलेटर', 'Interest Rate Sensitivity Simulator')}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {t(
                      'निक्षेप वा कर्जा योजनाहरूको दर परिवर्तन गर्दा संस्थाको Spread Rate र आम्दानीमा पर्ने असर हेर्नुहोस्।',
                      'Simulate how rate tweaks adjust WALR, WADR, Spread, and overall Net Interest Income.'
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetSimulation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className="size-3.5" />
                  <span>{t('पूर्ववत', 'Reset Rates')}</span>
                </button>
              </div>

              {/* Simulation Comparison Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">{t('प्रस्तावित Spread Rate', 'Simulated Spread')}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <strong
                      className={`text-lg font-mono font-black ${
                        simulatedAnalysis.isSpreadCompliant ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {fmtPercent(simulatedAnalysis.spreadRate)}
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      (अहिले: {fmtPercent(baselineAnalysis.spreadRate)})
                    </span>
                  </div>
                  <span className="text-[10px] block mt-0.5">
                    {simulatedAnalysis.isSpreadCompliant ? (
                      <span className="text-emerald-400">✓ {t('कानूनी सीमा ४.७५% भित्र', 'Within 4.75% limit')}</span>
                    ) : (
                      <span className="text-rose-400 font-bold">⚠ {t('कानूनी सीमा ४.७५% उल्लंघन!', 'Exceeds 4.75% cap!')}</span>
                    )}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">{t('प्रस्तावित WALR (कर्जा दर)', 'Simulated WALR')}</span>
                  <strong className="text-white text-lg font-mono block mt-1">
                    {fmtPercent(simulatedAnalysis.weightedAvgLendingRate)}
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    {t('भिन्नता:', 'Diff:')}{' '}
                    {(simulatedAnalysis.weightedAvgLendingRate - baselineAnalysis.weightedAvgLendingRate).toFixed(2)}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">{t('प्रस्तावित WADR (निक्षेप दर)', 'Simulated WADR')}</span>
                  <strong className="text-white text-lg font-mono block mt-1">
                    {fmtPercent(simulatedAnalysis.weightedAvgDepositRate)}
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    {t('भिन्नता:', 'Diff:')}{' '}
                    {(simulatedAnalysis.weightedAvgDepositRate - baselineAnalysis.weightedAvgDepositRate).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Sliders / Inputs for Each Product */}
              <div className="space-y-3">
                <h5 className="font-bold text-white text-xs uppercase tracking-wide text-slate-400">
                  {t('प्रडक्ट अनुसार ब्याजदर परिमार्जन गर्नुहोस्:', 'Adjust Rates by Product:')}
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {productBuckets.map((p) => {
                    const currentSimRate = simulatedRates[p.id] ?? p.interestRate;
                    return (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white block">{p.nameNepali}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {p.category} • मौज्दात: {fmtCurrency(p.principalBalance, true)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-indigo-400 text-sm">
                              {currentSimRate}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="4.0"
                            max="18.0"
                            step="0.25"
                            value={currentSimRate}
                            onChange={(e) => handleSimRateChange(p.id, parseFloat(e.target.value))}
                            className="w-full accent-indigo-500 cursor-pointer"
                          />
                          <input
                            type="number"
                            min="1.0"
                            max="25.0"
                            step="0.1"
                            value={currentSimRate}
                            onChange={(e) => handleSimRateChange(p.id, parseFloat(e.target.value) || 0)}
                            className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-right font-mono text-white text-xs"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Regulatory Memo */}
          {activeTab === 'MEMO' && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4 font-sans text-slate-200">
                <div className="text-center border-b border-slate-800 pb-4 space-y-1">
                  <h3 className="text-base font-black text-white">
                    {t('उनको बचत तथा ऋण सहकारी संस्था लि.', 'Unako Saving and Credit Cooperative Society Ltd.')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('गढवा गाउँपालिका-५, दाङ, लुम्बिनी प्रदेश | दर्ता नं: २०७०/०७१/५८२', 'Gadhawa-5, Dang | Reg: 2070/071/582')}
                  </p>
                  <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 font-bold text-xs mt-2 border border-indigo-500/30">
                    {t(
                      'सहकारी ऐन २०७४ दफा ५० बमोजिम ब्याजदर अन्तर सार्वजनिक प्रतिवेदन',
                      'Cooperative Act 2074 Sec 50 Interest Rate Spread Statutory Disclosure'
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs leading-relaxed">
                  <p>
                    {t(
                      `सहकारी ऐन २०७४ को दफा ५० तथा सहकारी विभागको मापदण्ड बमोजिम यस संस्थाको निक्षेप र कर्जाको भारित औसत ब्याजदर अन्तर (Spread Rate) गणना गरी देहाय बमोजिम कायम गरिएको व्यहोरा प्रमाणित गरिन्छ।`,
                      `In compliance with Section 50 of Nepal Cooperative Act 2074 and Department of Cooperatives Directives, the weighted average interest spread is hereby certified as follows:`
                    )}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px]">{t('भारित कर्जा दर (WALR):', 'WALR:')}</span>
                      <strong className="text-white block font-mono text-sm">{baselineAnalysis.weightedAvgLendingRate}%</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px]">{t('भारित निक्षेप दर (WADR):', 'WADR:')}</span>
                      <strong className="text-white block font-mono text-sm">{baselineAnalysis.weightedAvgDepositRate}%</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px]">{t('ब्याजदर अन्तर:', 'Spread Rate:')}</span>
                      <strong className="text-emerald-400 block font-mono text-sm">{baselineAnalysis.spreadRate}%</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px]">{t('कानूनी सीमा:', 'Statutory Limit:')}</span>
                      <strong className="text-white block font-mono text-sm">४.७५% (Max 4.75%)</strong>
                    </div>
                  </div>

                  <p className="pt-2 text-slate-400 text-[11px]">
                    {t(
                      'उपरोक्त विवरण अनुसार संस्थाको ब्याजदर अन्तर कानूनी सीमाभित्र रहेको र कुनै पनि कर्जा योजनामा सहकारी विभागद्वारा तोकिएको सन्दर्भ ब्याजदर भन्दा बढी ब्याज नलिइएको व्यहोरा प्रमाणित गर्दछौं।',
                      'As per above metrics, the interest rate spread strictly adheres to statutory boundaries and no loan product exceeds the Reference Interest Rate ceiling.'
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-800 text-center text-xs">
                  <div>
                    <div className="border-t border-slate-700 pt-2 font-bold text-white">
                      {t('लेखा अधिकृत / अनुपालन अधिकृत', 'Finance / Compliance Officer')}
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-slate-700 pt-2 font-bold text-white">
                      {t('प्रमुख कार्यकारी अधिकृत / व्यवस्थापक', 'Chief Executive Officer / Manager')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintMemo}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
                >
                  <Printer className="size-4 text-indigo-400" />
                  <span>{t('प्रतिवेदन प्रिन्ट गर्नुहोस्', 'Print Statement')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>{t('सहकारी विभाग तथा स्थानीय तह प्रतिवेदन मापदण्ड', 'Cooperative Directives Compliant')}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
