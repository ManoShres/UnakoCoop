import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  CooperativeEntityProfile,
  INITIAL_ANCHOR_COOP,
  INITIAL_TARGET_COOP,
  INITIAL_MERGER_STEPS,
  calculateMergerSwapRatio,
  consolidateBalanceSheet,
  generateMergerCopasVoucher,
  exportMergerComparisonToCsv,
} from '../../utils/coopMergerEngine';
import { printElement } from '../../utils/printHelper';
import {
  GitMerge,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  X,
  Building2,
  Users,
  Coins,
  Receipt,
  Scale,
  Sparkles,
  ArrowRight,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

interface CoopMergerConsolidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoopMergerConsolidationModal: React.FC<CoopMergerConsolidationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency, fmtPercent, fmtDigits } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'DDA_SWAP' | 'CONSOLIDATED_BS' | 'REGULATORY_STEPS' | 'RESOLUTION_VOUCHER'>('DDA_SWAP');
  const [anchor] = useState<CooperativeEntityProfile>(INITIAL_ANCHOR_COOP);
  const [target, setTarget] = useState<CooperativeEntityProfile>(INITIAL_TARGET_COOP);
  const [haircutPercent, setHaircutPercent] = useState<number>(5);
  const [steps, setSteps] = useState(INITIAL_MERGER_STEPS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const swapAnalysis = useMemo(() => {
    return calculateMergerSwapRatio({
      anchorCoop: anchor,
      targetCoop: target,
      assetHaircutPercent: haircutPercent,
    });
  }, [anchor, target, haircutPercent]);

  const consolidatedBs = useMemo(() => {
    return consolidateBalanceSheet(anchor, target, swapAnalysis);
  }, [anchor, target, swapAnalysis]);

  const copasVoucher = useMemo(() => {
    return generateMergerCopasVoucher(target, swapAnalysis, '2081/82');
  }, [target, swapAnalysis]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleStep = (stepId: string) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== stepId) return s;
        const nextState = !s.isCompleted;
        return {
          ...s,
          isCompleted: nextState,
          completedDate: nextState ? '2081-06-05' : undefined,
        };
      })
    );
    showToast(t('प्रक्रिया स्थिति अद्यावधिक भयो', 'Merger step status updated'));
  };

  const handleExportCsv = () => {
    const csv = exportMergerComparisonToCsv(anchor, target, consolidatedBs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Unako_Merger_Consolidation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t('एकीकरण तुलनात्मक प्रतिवेदन डाउनलोड भयो', 'Merger comparison matrix exported as CSV'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-indigo-500 animate-slide-in">
          <CheckCircle2 className="size-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-violet-900/10 via-indigo-900/10 to-emerald-900/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
              <GitMerge className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-wider uppercase text-violet-600 dark:text-violet-400">
                  {t('सहकारी एकीकरण तथा समायोजन मोड्युल', 'COOPERATIVE MERGER & AMALGAMATION')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300 font-bold">
                  {t('सहकारी ऐन २०७४ दफा ८७/८८ बमोजिम', 'Cooperative Act 2074 Sec 87/88')}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {t('संस्था एकीकरण (Merger), डीडीए मूल्याङ्कन तथा संयुक्त वासलात', 'Cooperative Merger, DDA Valuation & Consolidated Balance Sheet')}
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
            onClick={() => setActiveTab('DDA_SWAP')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'DDA_SWAP'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Scale className="size-4" />
            <span>{t('डीडीए मूल्याङ्कन तथा स्वाप अनुपात', 'DDA Valuation & Swap Ratio')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CONSOLIDATED_BS')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CONSOLIDATED_BS'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Building2 className="size-4" />
            <span>{t('एकीकृत प्रारम्भिक वासलात (Consolidated)', 'Consolidated Balance Sheet')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REGULATORY_STEPS')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'REGULATORY_STEPS'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <CheckCircle2 className="size-4" />
            <span>{t('कानुनी ६-चरण प्रक्रिया चेकलिस्ट', '6-Step Regulatory Checklist')}</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800">
              {steps.filter((s) => s.isCompleted).length}/{steps.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RESOLUTION_VOUCHER')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'RESOLUTION_VOUCHER'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Receipt className="size-4" />
            <span>{t('संयुक्त सम्झौता पत्र तथा COPAS भौचर', 'MoU Resolution & COPAS Voucher')}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: DDA VALUATION & SWAP RATIO */}
          {activeTab === 'DDA_SWAP' && (
            <div className="space-y-6">
              {/* Swap Ratio Highlight Card */}
              <div className="p-5 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-700 text-white shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-violet-200">
                      {t('स्वतन्त्र डीडीए मूल्याङ्कन निष्कर्ष (DDA Swap Ratio Determination)', 'DDA Swap Determination')}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black mt-0.5">
                      सेयर स्वाप अनुपात: १ : {swapAnalysis.nominalSwapRatio}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                    <Coins className="size-5 text-amber-300" />
                    <div>
                      <span className="text-[10px] text-violet-200 block">थप जारी हुने सेयर (New Shares)</span>
                      <strong className="text-sm font-mono">{fmtDigits(swapAnalysis.sharesIssuedToTarget)} कित्ता</strong>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-violet-100 leading-relaxed bg-black/15 p-3 rounded-xl border border-white/10">
                  {swapAnalysis.swapSummaryNe}
                </p>
              </div>

              {/* Stress Haircut Slider */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Sliders className="size-4 text-violet-500" />
                    <span>{t('कर्जा नोक्सानी तथा सम्पत्ति पुनर्मूल्याङ्कन डिस्काउन्ट (Asset Haircut)', 'Asset Quality Haircut')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    गाभिने संस्थाका खराब कर्जा वा धितो जोखिमका आधारमा खुद सम्पत्तिमा कटौती दर: <strong>{haircutPercent}%</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-64">
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={haircutPercent}
                    onChange={(e) => setHaircutPercent(Number(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                  <span className="font-mono font-bold text-xs text-violet-600 dark:text-violet-400 w-10 text-right">
                    {haircutPercent}%
                  </span>
                </div>
              </div>

              {/* Entity Comparison Side-by-Side Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3 font-semibold">{t('वित्तीय तथा संस्थागत परिसूचक', 'Indicator')}</th>
                      <th className="p-3 font-semibold text-right text-violet-600 dark:text-violet-400">
                        {anchor.nameNepali} ({t('मुख्य संस्था', 'Anchor')})
                      </th>
                      <th className="p-3 font-semibold text-right text-indigo-600 dark:text-indigo-400">
                        {target.nameNepali} ({t('गाभिने संस्था', 'Target')})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-3 font-medium">दर्ता नम्बर तथा ठेगाना</td>
                      <td className="p-3 text-right font-mono">{anchor.registrationNo} • {anchor.palikaAddress}</td>
                      <td className="p-3 text-right font-mono">{target.registrationNo} • {target.palikaAddress}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">कुल सदस्य संख्या (महिला %)</td>
                      <td className="p-3 text-right font-bold">{fmtDigits(anchor.totalMembers)} जना (८३%)</td>
                      <td className="p-3 text-right font-bold">{fmtDigits(target.totalMembers)} जना (१००%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">चुक्ता सेयर पूँजी (Paid-up Capital)</td>
                      <td className="p-3 text-right font-mono font-bold">{fmtCurrency(anchor.paidUpShareCapital, true)}</td>
                      <td className="p-3 text-right font-mono font-bold">{fmtCurrency(target.paidUpShareCapital, true)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">कुल बचत निक्षेप (Savings)</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">{fmtCurrency(anchor.totalSavingsDeposits, true)}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">{fmtCurrency(target.totalSavingsDeposits, true)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">खुद कर्जा लगानी (Net Loan Portfolio)</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(anchor.netLoanPortfolio, true)}</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(target.netLoanPortfolio, true)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">नगद तथा बैंक मौज्दात (Liquid Reserves)</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(anchor.cashAndBankBalances, true)}</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(target.cashAndBankBalances, true)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">साधारण जगेडा कोष (General Reserve)</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(anchor.generalReserveFund, true)}</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(target.generalReserveFund, true)}</td>
                    </tr>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/20 font-bold">
                      <td className="p-3">खुद सम्पत्ति मूल्य (Net Worth)</td>
                      <td className="p-3 text-right font-mono text-indigo-600">{fmtCurrency(anchor.netWorth, true)}</td>
                      <td className="p-3 text-right font-mono text-indigo-600">{fmtCurrency(target.netWorth, true)}</td>
                    </tr>
                    <tr className="bg-violet-50/50 dark:bg-violet-950/20 font-black">
                      <td className="p-3">प्रति सेयर खुद मूल्य (NAV Per Share)</td>
                      <td className="p-3 text-right font-mono text-violet-600 dark:text-violet-400">रु. {fmtDigits(swapAnalysis.anchorNavPerShare)}</td>
                      <td className="p-3 text-right font-mono text-violet-600 dark:text-violet-400">रु. {fmtDigits(swapAnalysis.targetNavPerShare)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CONSOLIDATED BALANCE SHEET */}
          {activeTab === 'CONSOLIDATED_BS' && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/40">
                  <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 block">
                    {t('एकीकृत कुल सदस्य संख्या', 'Consolidated Members')}
                  </span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {fmtDigits(consolidatedBs.totalMembers)} {t('जना', '')}
                  </p>
                  <span className="text-[10px] text-slate-400">महिला: {consolidatedBs.femaleMembersPercent}%</span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
                    {t('एकीकृत चुक्ता सेयर पूँजी', 'Consolidated Share Capital')}
                  </span>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    {fmtCurrency(consolidatedBs.consolidatedShareCapital, true)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                    {t('एकीकृत कुल बचत निक्षेप', 'Consolidated Savings')}
                  </span>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {fmtCurrency(consolidatedBs.consolidatedSavings, true)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block">
                    {t('पूँजी पर्याप्तता अनुपात (PEARLS)', 'Capital Adequacy')}
                  </span>
                  <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                    {fmtDigits(consolidatedBs.netWorthToAssetsPercent)}%
                  </p>
                  <span className="text-[10px] text-slate-400">मापदण्ड: न्यूनतम १०%</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {t('एकीकरण पश्चातको प्रारम्भिक एकीकृत वासलात (Consolidated Balance Sheet)', 'Consolidated Balance Sheet')}
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

              {/* Consolidated Matrix */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3 font-semibold">{t('वासलात शीर्षक (Balance Sheet Head)', 'Balance Sheet Head')}</th>
                      <th className="p-3 font-semibold text-right">{anchor.nameNepali}</th>
                      <th className="p-3 font-semibold text-right">{target.nameNepali}</th>
                      <th className="p-3 font-semibold text-right text-violet-600 dark:text-violet-400 font-bold">
                        {t('संयुक्त एकीकृत वासलात', 'Consolidated Total')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-3 font-medium">नगद तथा बैंक मौज्दात</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(anchor.cashAndBankBalances, true)}</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(target.cashAndBankBalances, true)}</td>
                      <td className="p-3 text-right font-mono font-bold text-violet-600">{fmtCurrency(consolidatedBs.consolidatedCashAndBank, true)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">खुद कर्जा तथा सापट लगानी</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(anchor.netLoanPortfolio, true)}</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(target.netLoanPortfolio, true)}</td>
                      <td className="p-3 text-right font-mono font-bold text-violet-600">{fmtCurrency(consolidatedBs.consolidatedNetLoans, true)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">स्थिर भौतिक सम्पत्ति (भवन, जग्गा)</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(anchor.fixedAssetsValuation, true)}</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(target.fixedAssetsValuation, true)}</td>
                      <td className="p-3 text-right font-mono font-bold text-violet-600">{fmtCurrency(consolidatedBs.consolidatedFixedAssets, true)}</td>
                    </tr>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold">
                      <td className="p-3">कुल सम्पत्ति (Total Assets)</td>
                      <td className="p-3 text-right font-mono">रु. १,१३,५०,०००</td>
                      <td className="p-3 text-right font-mono">रु. ३०,००,०००</td>
                      <td className="p-3 text-right font-mono font-black text-indigo-600">{fmtCurrency(consolidatedBs.consolidatedTotalAssets, true)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">सदस्य बचत तथा निक्षेप दायित्व</td>
                      <td className="p-3 text-right font-mono text-emerald-600">{fmtCurrency(anchor.totalSavingsDeposits, true)}</td>
                      <td className="p-3 text-right font-mono text-emerald-600">{fmtCurrency(target.totalSavingsDeposits, true)}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">{fmtCurrency(consolidatedBs.consolidatedSavings, true)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">साधारण जगेडा कोष</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(anchor.generalReserveFund, true)}</td>
                      <td className="p-3 text-right font-mono">{fmtCurrency(target.generalReserveFund, true)}</td>
                      <td className="p-3 text-right font-mono font-bold">{fmtCurrency(consolidatedBs.consolidatedGeneralReserve, true)}</td>
                    </tr>
                    <tr className="bg-violet-50/50 dark:bg-violet-950/20 font-black">
                      <td className="p-3">कुल खुद सम्पत्ति (Consolidated Net Worth)</td>
                      <td className="p-3 text-right font-mono text-violet-600">{fmtCurrency(anchor.netWorth, true)}</td>
                      <td className="p-3 text-right font-mono text-violet-600">{fmtCurrency(target.netWorth, true)}</td>
                      <td className="p-3 text-right font-mono text-violet-600 dark:text-violet-400">{fmtCurrency(consolidatedBs.consolidatedNetWorth, true)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REGULATORY 6-STEP CHECKLIST */}
          {activeTab === 'REGULATORY_STEPS' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('सहकारी ऐन २०७४ दफा ८७ अनुसार एकीकरणका अनिवार्य ६ कानुनी चरणहरू', 'Statutory 6-Step Merger Roadmap')}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  प्रत्येक चरण सम्पन्न भएपछि चेकबक्स चिन्ह लगाई आधिकारिक मिति तथा निर्णय सुरक्षित गर्नुहोस्।
                </p>
              </div>

              <div className="space-y-3">
                {steps.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => handleToggleStep(st.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      st.isCompleted
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {st.isCompleted ? (
                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <div className="size-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className={`text-xs font-bold ${st.isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          चरण {st.stepNo}: {st.titleNe}
                        </h5>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {st.legalBasis}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {st.remarksNe}
                      </p>

                      {st.isCompleted && st.completedDate && (
                        <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1">
                          सम्पन्न मिति: {fmtDigits(st.completedDate)} B.S.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RESOLUTION & COPAS VOUCHER */}
          {activeTab === 'RESOLUTION_VOUCHER' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('एकीकरण प्रारम्भिक सम्झौता पत्र तथा COPAS लेखा भौचर', 'MoU Resolution & COPAS Opening Voucher')}
                  </h3>
                  <p className="text-xs text-slate-500">सहकारी विभाग तथा स्थानीय तह दर्ताका लागि आधिकारिक प्रतिवेदन।</p>
                </div>

                <button
                  type="button"
                  onClick={() => printElement('merger-resolution-print')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold transition shadow-xs"
                >
                  <Printer className="size-3.5" />
                  <span>{t('सम्झौता पत्र प्रिन्ट', 'Print MoU')}</span>
                </button>
              </div>

              {/* Printable Resolution Declaration */}
              <div
                id="merger-resolution-print"
                className="p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
              >
                <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    सहकारी संस्था एकीकरण (Merger) संयुक्त सम्झौता तथा घोषणा पत्र
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">नेपाल सहकारी ऐन २०७४, दफा ८७ बमोजिम</p>
                </div>

                <div className="space-y-3 leading-relaxed text-slate-700 dark:text-slate-300">
                  <p>
                    आज मिति <strong>२०८१/०६/०५</strong> गते <strong>उनको बचत तथा ऋण सहकारी संस्था लि.</strong> (दर्ता नं. १४८/०६४/०६५, गढवा-५, दाङ) र <strong>राप्ती ग्रामीण महिला बचत तथा ऋण सहकारी संस्था लि.</strong> (दर्ता नं. २१५/०६८/०६९, गढवा-२, दाङ) का सञ्चालक समिति तथा विशेष साधारण सभाको निर्णयानुसार दुवै संस्था एकापसमा गाभिने (एकीकरण हुने) अन्तिम सम्झौता गरिएको छ।
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <strong className="block text-slate-900 dark:text-white">मुख्य एकीकरण सम्झौता सर्तहरू:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      <li>एकीकृत संस्थाको नाम: <strong>उनको बचत तथा ऋण सहकारी संस्था लि.</strong> रहनेछ।</li>
                      <li>सेयर स्वाप अनुपात: <strong>१ : {swapAnalysis.nominalSwapRatio}</strong> का दरले सेयर समायोजन हुनेछ।</li>
                      <li>गाभिने संस्थाका सम्पूर्ण सदस्य, बचत तथा कर्जा दायित्व एकीकृत संस्थाले यथावत दायित्व ग्रहण गर्नेछ।</li>
                      <li>कार्यक्षेत्र: गढवा गाउँपालिका सम्पूर्ण वडामा सेवा केन्द्र विस्तार गरिनेछ।</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 text-center text-[11px] text-slate-500">
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                    अध्यक्ष / व्यवस्थापक<br />
                    <strong>उनको बचत तथा ऋण सहकारी संस्था लि.</strong>
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                    अध्यक्ष / व्यवस्थापक<br />
                    <strong>राप्ती ग्रामीण महिला साकोस लि.</strong>
                  </div>
                </div>
              </div>

              {/* COPAS Amalgamation Opening Voucher */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">भौचर नं.: {copasVoucher.voucherNo}</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {copasVoucher.narrationNe}
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    आ.व. {copasVoucher.fiscalYear}
                  </span>
                </div>

                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400">
                    <tr>
                      <th className="p-2">GL Code</th>
                      <th className="p-2">खाता शीर्षक (Account Head)</th>
                      <th className="p-2 text-right">डेबिट (Dr)</th>
                      <th className="p-2 text-right">क्रेडिट (Cr)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {copasVoucher.entries.map((entry, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-mono font-bold text-violet-600">{entry.glCode}</td>
                        <td className="p-2 font-medium">{entry.accountNameNe}</td>
                        <td className="p-2 text-right font-mono font-bold">
                          {entry.debitAmount > 0 ? fmtCurrency(entry.debitAmount, true) : '-'}
                        </td>
                        <td className="p-2 text-right font-mono font-bold">
                          {entry.creditAmount > 0 ? fmtCurrency(entry.creditAmount, true) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <tr>
                      <td colSpan={2} className="p-2 text-right">कुल रकम (Total Balanced):</td>
                      <td className="p-2 text-right font-mono text-emerald-600">{fmtCurrency(copasVoucher.totalDebit, true)}</td>
                      <td className="p-2 text-right font-mono text-emerald-600">{fmtCurrency(copasVoucher.totalCredit, true)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>{t('नेपाल सहकारी ऐन २०७४ दफा ८७ अनुसार प्रमाणित एकीकरण प्रक्रिया', 'Compliant with Cooperative Act 2074 Sec 87')}</span>
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
