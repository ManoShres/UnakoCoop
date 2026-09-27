import React, { useState } from 'react';
import {
  StressScenarioId,
  StressTestParameters,
  LiquidityAssetBreakdown,
  DEFAULT_UNAKO_LIQUIDITY_ASSETS,
  SCENARIO_PRESETS,
  CFP_TIER_CONFIG,
  calculateTotalLiquidAssets,
  simulateLiquidityStress,
  generateStressTestReportMinutes,
} from '../../utils/liquidityStressEngine';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import {
  Activity,
  X,
  Printer,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Landmark,
  Layers,
  ArrowRight,
  TrendingDown,
  Clock,
  Coins,
  Building,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

interface LiquidityStressTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiquidityStressTestingModal: React.FC<LiquidityStressTestingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguageStore();
  const { savings, loans } = useCoopStore();

  const [activeTab, setActiveTab] = useState<'simulator' | 'cfp' | 'assets' | 'minutes'>('simulator');
  const [selectedScenarioId, setSelectedScenarioId] = useState<StressScenarioId>('MODERATE_SHOCK');
  const [assets, setAssets] = useState<LiquidityAssetBreakdown>(DEFAULT_UNAKO_LIQUIDITY_ASSETS);

  // Custom scenario sliders
  const [customDays, setCustomDays] = useState<number>(15);
  const [customRunPercent, setCustomRunPercent] = useState<number>(15);
  const [customLoanHaircut, setCustomLoanHaircut] = useState<number>(30);
  const [customHaltDisbursement, setCustomHaltDisbursement] = useState<boolean>(true);

  // Copy state
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Derive deposits and loans from store or realistic fallbacks
  const calculatedTotalDeposits = savings.reduce((sum, s) => sum + s.balance, 0) || 185000000;
  const calculatedTotalLoans = loans.reduce((sum, l) => sum + (l.remainingBalance || l.principalAmount || 0), 0) || 162000000;

  // Active scenario parameters
  const activeParams: StressTestParameters =
    selectedScenarioId === 'CUSTOM_SHOCK'
      ? {
          scenarioId: 'CUSTOM_SHOCK',
          scenarioNameNp: 'अनुकूलित तनाव परिदृश्य (Custom Simulation)',
          scenarioNameEn: 'Custom Defined Stress Scenario',
          timeHorizonDays: customDays,
          depositRunRatePercent: customRunPercent,
          loanRecoveryHaircutPercent: customLoanHaircut,
          dailyOperatingExpenses: 35000,
          newDisbursementsHalted: customHaltDisbursement,
        }
      : SCENARIO_PRESETS[selectedScenarioId];

  const result = simulateLiquidityStress(
    assets,
    calculatedTotalDeposits,
    calculatedTotalLoans,
    activeParams
  );

  const tiers = calculateTotalLiquidAssets(assets);
  const activeCfp = CFP_TIER_CONFIG[result.activatedCfpTier];
  const minutesText = generateStressTestReportMinutes(result, assets);

  const handleCopyMinutes = () => {
    navigator.clipboard.writeText(minutesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl">
              <Activity className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {t(
                    'तरलता तनाव परीक्षण तथा आकस्मिक कोष योजना (CFP)',
                    'Liquidity Stress Testing & Contingency Funding Plan (CFP)'
                  )}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                  सहकारी ऐन २०७४ दफा ५१ / PEARLS L1
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t(
                  'प्रणालीगत निक्षेप चाप, कर्जा असुली गिरावट तथा आकस्मिक तरलता संकट धान्न सक्ने समयावधिको वैज्ञानिक विश्लेषण',
                  'Dynamic ALCO simulation evaluating deposit run shocks, loan recovery freeze, and liquidity survival horizon'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('minutes')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Printer className="size-4" />
              <span>{t('ALCO प्रतिवेदन', 'ALCO Minutes')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Key Metric Banner */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-slate-400 font-semibold block">{t('कुल परिचालनयोग्य तरलता', 'Total Realizable')}</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400">
              रु. {Math.round(result.realizableLiquidityAvailable / 100000).toLocaleString()} लाख
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">रु. {result.realizableLiquidityAvailable.toLocaleString('en-IN')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-slate-400 font-semibold block">{t('सुरुको PEARLS L1 अनुपात', 'Baseline L1 Ratio')}</span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {result.baselineL1RatioPercent}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('मापदण्ड: १०%-१५%', 'Target: 10-15%')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-rose-500 font-semibold block">{t('तनाव निक्षेप माग (Run)', 'Stressed Outflow')}</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400">
              रु. {Math.round(result.stressedDepositWithdrawal / 100000).toLocaleString()} लाख
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{activeParams.depositRunRatePercent}% {t('कुल निक्षेप', 'of Deposits')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-purple-500 font-semibold block">{t('तनाव पछिको L1 अनुपात', 'Post-Stress L1')}</span>
            <span className={`text-base font-black ${result.postStressL1RatioPercent < 10 ? 'text-rose-600' : 'text-purple-600 dark:text-purple-400'}`}>
              {result.postStressL1RatioPercent}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{result.postStressL1RatioPercent >= 10 ? 'मापदण्ड भित्र' : 'न्यूनस्तर'}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-emerald-500 font-semibold block">{t('तरलता धान्ने अवधि', 'Survival Horizon')}</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {result.survivalHorizonDays} {t('दिन', 'Days')}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('निरन्तर भुक्तानी', 'Safe Runway')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-amber-500 font-semibold block">{t('परीक्षण नतिजा स्थिति', 'Test Verdict')}</span>
            <span className={`text-xs font-black inline-block mt-1 px-2 py-0.5 rounded-full ${
              result.status === 'HEALTHY_PASS'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : result.status === 'MARGINAL_WARNING'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
            }`}>
              {result.status === 'HEALTHY_PASS' ? 'सफल (PASS)' : result.status === 'MARGINAL_WARNING' ? 'सतर्कता (WARNING)' : 'अभाव (DEFICIT)'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{activeCfp.nameNp.split(' ')[0]}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'simulator'
                ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sliders className="size-4" />
            <span>{t('तनाव परिदृश्य सिमुलेटर', 'Stress Simulator & Shocks')}</span>
          </button>

          <button
            onClick={() => setActiveTab('cfp')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'cfp'
                ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="size-4" />
            <span>{t('आकस्मिक कोष योजना (CFP ४-तह)', 'CFP 4-Tier Escalation Matrix')}</span>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'assets'
                ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Coins className="size-4" />
            <span>{t('तरलता मौज्दात तथा सम्पत्ति संरचना', 'Liquid Assets & Tiers')}</span>
          </button>

          <button
            onClick={() => setActiveTab('minutes')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'minutes'
                ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Printer className="size-4" />
            <span>{t('ALCO निर्णय प्रतिवेदन', 'Board & ALCO Resolution')}</span>
          </button>
        </div>

        {/* Tab 1: Simulator */}
        {activeTab === 'simulator' && (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Scenario Preset Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                {t('तनाव परीक्षण परिदृश्य चयन गर्नुहोस् (Select Stress Scenario):', 'Select Stress Scenario:')}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {Object.values(SCENARIO_PRESETS).map((sc) => (
                  <button
                    key={sc.scenarioId}
                    type="button"
                    onClick={() => setSelectedScenarioId(sc.scenarioId)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      selectedScenarioId === sc.scenarioId
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">{sc.scenarioNameNp}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{sc.scenarioNameEn}</span>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>निक्षेप फिर्ता: {sc.depositRunRatePercent}%</span>
                      <span>अवधि: {sc.timeHorizonDays} दिन</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Sliders Panel if CUSTOM_SHOCK is selected */}
            {selectedScenarioId === 'CUSTOM_SHOCK' && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="size-4 text-rose-600" />
                  <span>{t('स्वनिर्धारित तनाव प्यारामिटरहरू (Custom Parameters)', 'Custom Simulation Sliders')}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">निक्षेप फिर्ता चाप दर (Deposit Run Rate):</span>
                      <span className="font-bold text-rose-600">{customRunPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={customRunPercent}
                      onChange={(e) => setCustomRunPercent(Number(e.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">विश्लेषण समयावधि (Horizon Days):</span>
                      <span className="font-bold text-blue-600">{customDays} दिन</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="60"
                      value={customDays}
                      onChange={(e) => setCustomDays(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">कर्जा असुली गिरावट (Recovery Delay):</span>
                      <span className="font-bold text-amber-600">{customLoanHaircut}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={customLoanHaircut}
                      onChange={(e) => setCustomLoanHaircut(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Shock Inflow & Outflow Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('१. उपलब्ध कुल तरलता कोष', '1. Realizable Liquidity')}</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 block">
                  रु. {result.realizableLiquidityAvailable.toLocaleString('en-IN')}
                </span>
                <p className="text-[11px] text-slate-500">
                  तिजोरी नगद, बैंक खाता, ट्रेजरी बिल्स र केन्द्रीय तरलता ऋण लाइन सहितको कुल तत्काल परिचालनयोग्य कोष।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-sm">
                <span className="text-[10px] text-rose-500 font-bold uppercase block">{t('२. आवश्यक तनाव बहिर्गमन', '2. Stressed Cash Outflow')}</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400 block">
                  रु. {result.totalStressedOutflow.toLocaleString('en-IN')}
                </span>
                <p className="text-[11px] text-slate-500">
                  निक्षेप फिर्ता (रु. {result.stressedDepositWithdrawal.toLocaleString('en-IN')}) + प्रशासनिक खर्च - घटाइएको कर्जा असुली।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-sm">
                <span className="text-[10px] text-emerald-500 font-bold uppercase block">{t('३. तनाव पछिको खुद मौज्दात', '3. Post-Stress Net Position')}</span>
                <span className={`text-xl font-black block ${result.postStressNetPosition >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  रु. {result.postStressNetPosition.toLocaleString('en-IN')}
                </span>
                <p className="text-[11px] text-slate-500">
                  {result.postStressNetPosition >= 0
                    ? `संस्थासँग रु. ${Math.round(result.postStressNetPosition / 100000)} लाख थप तरलता बचत कायम रहन्छ।`
                    : 'संस्था तरलता घाटामा फस्नेछ, तत्काल आपतकालीन कोष आवश्यक।'}
                </p>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="size-4 text-blue-600" />
                <span>{t('ALCO समिति तथा व्यवस्थापनका लागि अनिवार्य निर्देशनहरू', 'Mandatory ALCO & GM Action Directives')}</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {result.recommendedActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">{idx + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: CFP 4-Tier Matrix */}
        {activeTab === 'cfp' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {Object.entries(CFP_TIER_CONFIG).map(([key, config]) => {
                  const isCurrentActive = result.activatedCfpTier === key;
                  return (
                    <div
                      key={key}
                      className={`p-5 transition-colors ${
                        isCurrentActive
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-l-4 border-rose-600'
                          : 'bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${config.colorClass}`}>
                            {config.nameNp}
                          </span>
                          {isCurrentActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                              हालको परिदृश्यमा सक्रिय (CURRENTLY ACTIVATED)
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{config.nameEn}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {config.actionNp}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Liquid Assets Tiers */}
        {activeTab === 'assets' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3 px-4">{t('तरलता तह तथा शीर्षक', 'Liquidity Tier & Asset')}</th>
                    <th className="py-3 px-3 text-center">{t('नगदीकरण समय', 'Liquidation Speed')}</th>
                    <th className="py-3 px-3 text-center">{t('हेयरकट %', 'Haircut')}</th>
                    <th className="py-3 px-4 text-right">{t('मौज्दात रकम (रु.)', 'Amount (NPR)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  <tr>
                    <td className="py-3 px-4 font-semibold">तह १: तिजोरी नगद मौज्दात (Cash in Vault)</td>
                    <td className="py-3 px-3 text-center text-emerald-600 font-bold">तत्काल (0 hrs)</td>
                    <td className="py-3 px-3 text-center">०%</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{assets.cashInVault.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">तह १: वाणिज्य बैंक चालु तथा बचत खाता</td>
                    <td className="py-3 px-3 text-center text-emerald-600 font-bold">तत्काल (0-2 hrs)</td>
                    <td className="py-3 px-3 text-center">०%</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{(assets.bankCurrentBalances + assets.bankSavingsBalances).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">तह २: वाणिज्य बैंक ९० दिने मुद्दती निक्षेप (FDs)</td>
                    <td className="py-3 px-3 text-center text-blue-600 font-bold">२४ घण्टा (24 hrs)</td>
                    <td className="py-3 px-3 text-center text-rose-600">५% दण्ड कट्टी</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{assets.commercialBankFixedDeposits.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">तह २: नेपाल सरकार / राष्ट्र बैंक ट्रेजरी बिल्स</td>
                    <td className="py-3 px-3 text-center text-blue-600 font-bold">२४-४८ घण्टा</td>
                    <td className="py-3 px-3 text-center">०%</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{assets.treasuryBills.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">तह ३: नेफ्स्कून / NCBL केन्द्रीय तरलता कोष ऋण लाइन</td>
                    <td className="py-3 px-3 text-center text-purple-600 font-bold">४८ घण्टा</td>
                    <td className="py-3 px-3 text-center">०%</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{assets.centralLiquidityFundLine.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">तह ४: आकस्मिक सञ्चिति तथा सुरक्षण सम्पत्ति</td>
                    <td className="py-3 px-3 text-center text-amber-600 font-bold">३-७ दिन</td>
                    <td className="py-3 px-3 text-center">०%</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{assets.unencumberedReserveAssets.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                  <tr>
                    <td colSpan={3} className="py-3 px-4">कुल परिचालनयोग्य तरलता (Total Realizable)</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 text-sm">
                      रु. {result.realizableLiquidityAvailable.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: ALCO Minutes */}
        {activeTab === 'minutes' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {t('सञ्चालक समिति तथा ALCO तरलता तनाव परीक्षण प्रतिवेदन', 'Official Board & ALCO Stress Test Report')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t(
                    'सहकारी ऐन २०७४ र नियमनकारी निकायमा पेश गरिने आधिकारिक ढाँचा',
                    'Statutory compliance report for Board of Directors and Department of Cooperatives'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMinutes}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  <span>{copied ? t('कपी भयो', 'Copied') : t('कपी गर्नुहोस्', 'Copy')}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                >
                  <Printer className="size-3.5" />
                  <span>{t('प्रिन्ट गर्नुहोस्', 'Print Report')}</span>
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
              {minutesText}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
