import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Percent,
  Download,
  Printer,
  Sliders,
  RotateCcw,
  Users,
  Building,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  calculateDepositCeiling,
  simulateDepositExpansion,
  downloadDepositCeilingCsv,
  CapitalComponents,
  DEFAULT_UNAKO_CAPITAL,
  STATUTORY_CORE_CAPITAL_MULTIPLIER,
  SINGLE_DEPOSITOR_LIMIT_PERCENT,
} from '../../utils/depositCeilingEngine';
import { SavingsAccount, Member } from '../../types';

interface DepositCeilingModalProps {
  isOpen: boolean;
  onClose: () => void;
  savings: readonly SavingsAccount[];
  members: readonly Member[];
}

export const DepositCeilingModal: React.FC<DepositCeilingModalProps> = ({
  isOpen,
  onClose,
  savings,
  members,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtPercent, fmtCount } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'CEILING' | 'CONCENTRATION' | 'SIMULATOR' | 'MEMO'>('CEILING');
  const [capital, setCapital] = useState<CapitalComponents>(DEFAULT_UNAKO_CAPITAL);

  // Simulator state
  const [simAdditionalDeposit, setSimAdditionalDeposit] = useState<number>(20000000); // NPR 2 Crore
  const [simAdditionalCapital, setSimAdditionalCapital] = useState<number>(2500000); // NPR 25 Lakhs

  const baseline = useMemo(() => {
    return calculateDepositCeiling(savings, members, capital);
  }, [savings, members, capital]);

  const simulated = useMemo(() => {
    return simulateDepositExpansion(baseline, simAdditionalDeposit, simAdditionalCapital);
  }, [baseline, simAdditionalDeposit, simAdditionalCapital]);

  if (!isOpen) return null;

  const handleExportCsv = () => {
    downloadDepositCeilingCsv(baseline);
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
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/60 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  {t('सहकारी ऐन २०७४ • दफा ४९(१)', 'Coop Act 2074 • Sec 49(1)')}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {t('प्राथमिक पूँजीको १५ गुणा निक्षेप संकलन सीमा', '15x Core Capital Deposit Mobilization Limit')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {t(
                  'निक्षेप संकलन सीमा (१५ गुणा) तथा एकाग्रता अनुगमन पोर्टल',
                  'Deposit Mobilization Ceiling (15x) & Concentration Risk Portal'
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

        {/* Top KPI Banner */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {t('प्राथमिक पूँजी कोष (Core Capital)', 'Primary Core Capital')}
            </span>
            <strong className="text-white text-base block mt-0.5 font-mono">
              {fmtCurrency(baseline.totalCoreCapital, true)}
            </strong>
            <span className="text-[10px] text-slate-400">
              {t('शेयर + जगेडा कोष', 'Share + Reserve Funds')}
            </span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {t('कुल सदस्य निक्षेप दायित्व', 'Total Deposits')}
            </span>
            <strong className="text-white text-base block mt-0.5 font-mono">
              {fmtCurrency(baseline.totalDepositLiability, true)}
            </strong>
            <span className="text-[10px] text-slate-400">
              {fmtCount(savings.length)} {t('बचत खाताहरू', 'Active Accounts')}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl border ${
              baseline.complianceStatus === 'COMPLIANT'
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                : baseline.complianceStatus === 'WARNING'
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            }`}
          >
            <span className="block text-[10px] uppercase font-semibold">
              {t('निक्षेप/पूँजी अनुपात (Ratio)', 'Deposit/Capital Multiplier')}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <strong className="text-base font-mono font-black">
                {baseline.depositToCoreCapitalRatio}x
              </strong>
              <span className="text-[10px] font-bold">/ १५.०x (Max 15x)</span>
            </div>
            <span className="text-[10px] block">
              {baseline.complianceStatus === 'COMPLIANT'
                ? t('कानूनी सीमाभित्र (Compliant)', 'Fully Compliant')
                : baseline.complianceStatus === 'WARNING'
                ? t('सीमा नजिक ९०%+ (Warning)', 'Near Statutory Ceiling')
                : t('कानून उल्लंघन (Breached!)', 'Statutory Breach!')}
            </span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {t('उपलब्ध निक्षेप क्षमता (Headroom)', 'Available Headroom')}
            </span>
            <strong className="text-emerald-400 text-base block mt-0.5 font-mono">
              {fmtCurrency(baseline.headroomCapacity, true)}
            </strong>
            <span className="text-[10px] text-slate-400">
              {t('उपयोग:', 'Utilization:')} {baseline.headroomUtilizationPercent}%
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-5 pt-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('CEILING')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'CEILING'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="size-4" />
              <span>{t('१५ गुणा सीमा तथा पूँजी क्षमता', '15x Ceiling & Headroom')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CONCENTRATION')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'CONCENTRATION'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="size-4" />
              <span>{t('१०% एकल निक्षेपकर्ता एकाग्रता', '10% Depositor Concentration')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('SIMULATOR')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'SIMULATOR'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="size-4" />
              <span>{t('पूँजी विस्तार सिमुलेटर (Simulator)', 'Expansion Simulator')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MEMO')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'MEMO'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="size-4" />
              <span>{t('वैधानिक घोषणापत्र तथा सूचना', 'Statutory Memo')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold border border-emerald-900/60 transition cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>{t('CSV निर्यात', 'Export CSV')}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: 15x Ceiling Details */}
          {activeTab === 'CEILING' && (
            <div className="space-y-4">
              {/* Utilization Progress Bar */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    {t('कानूनी निक्षेप संकलन क्षमता उपयोग (Headroom Utilization):', 'Capacity Utilization:')}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {baseline.headroomUtilizationPercent}% ({baseline.depositToCoreCapitalRatio}x / १५.०x)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      baseline.complianceStatus === 'COMPLIANT'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : baseline.complianceStatus === 'WARNING'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-rose-600 to-red-500'
                    }`}
                    style={{ width: `${Math.min(100, baseline.headroomUtilizationPercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{t('हालको कुल निक्षेप:', 'Current Deposits:')} {fmtCurrency(baseline.totalDepositLiability, true)}</span>
                  <span>{t('अधिकतम कानूनी सीमा:', 'Statutory Ceiling:')} {fmtCurrency(baseline.maxStatutoryDepositCeiling, true)}</span>
                </div>
              </div>

              {/* Core Capital Structure Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Building className="size-4 text-emerald-400" />
                    <span>{t('प्राथमिक पूँजी कोषको संरचना (Core Capital Components)', 'Core Capital Structure')}</span>
                  </h4>

                  <div className="space-y-1.5 divide-y divide-slate-800/80 text-slate-300">
                    <div className="flex items-center justify-between pt-1">
                      <span>{t('१. चुक्ता शेयर पूँजी (Paid-up Share Capital)', 'Paid-up Share Capital')}</span>
                      <strong className="font-mono text-white">{fmtCurrency(capital.paidUpShareCapital, true)}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span>{t('२. साधारण जगेडा कोष (General Statutory Reserve)', 'General Reserve')}</span>
                      <strong className="font-mono text-white">{fmtCurrency(capital.generalReserveFund, true)}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span>{t('३. पूँजीगत जगेडा कोष (Capital Reserve)', 'Capital Reserve')}</span>
                      <strong className="font-mono text-white">{fmtCurrency(capital.capitalReserveFund, true)}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span>{t('४. अविभाजित नाफा/घाटा (Retained Surplus)', 'Retained Surplus')}</span>
                      <strong className="font-mono text-white">{fmtCurrency(capital.undividedProfit, true)}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-2 font-bold text-emerald-300">
                      <span>{t('जम्मा प्राथमिक पूँजी (Total Core Capital):', 'Total Core Capital:')}</span>
                      <strong className="font-mono text-base">{fmtCurrency(baseline.totalCoreCapital, true)}</strong>
                    </div>
                  </div>
                </div>

                {/* Product Distribution */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <PieChart className="size-4 text-sky-400" />
                    <span>{t('निक्षेप योजना अनुसार वितरण (Product Breakdown)', 'Deposit Distribution by Product')}</span>
                  </h4>

                  <div className="space-y-1.5 divide-y divide-slate-800/80 text-slate-300">
                    {baseline.productSummaries.map((p) => (
                      <div key={p.accountType} className="flex items-center justify-between pt-1">
                        <div>
                          <span className="block font-medium text-white">{p.accountType}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {fmtCount(p.accountCount)} {t('खाताहरू', 'accounts')} ({p.sharePercent}%)
                          </span>
                        </div>
                        <strong className="font-mono text-slate-200">{fmtCurrency(p.totalBalance, true)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Depositor Concentration */}
          {activeTab === 'CONCENTRATION' && (
            <div className="space-y-4">
              {baseline.flaggedConcentratedMembersCount > 0 ? (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 flex items-center gap-3">
                  <AlertOctagon className="size-5 text-rose-400 shrink-0" />
                  <div>
                    <strong className="block text-white">
                      {t('निक्षेप एकाग्रता जोखिम चेतावनी!', 'Deposit Concentration Risk Warning!')}
                    </strong>
                    <span className="text-[11px]">
                      {fmtCount(baseline.flaggedConcentratedMembersCount)}{' '}
                      {t(
                        'जना सदस्यको निक्षेप कुल संस्थागत निक्षेपको १०% सीमा भन्दा बढी रहेको छ।',
                        'member(s) hold more than 10% of total cooperative deposit liability.'
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-emerald-300 flex items-center gap-3">
                  <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block text-white">{t('निक्षेप विविधीकरण सन्तोषजनक', 'Deposit Diversification Healthy')}</strong>
                    <span className="text-[11px]">
                      {t(
                        'कुनै पनि एकल सदस्यको निक्षेप कुल दायित्वको १०% सीमाभन्दा बढी छैन। HHI Index: ',
                        'No single member exceeds the 10% deposit concentration ceiling. HHI Index: '
                      )}
                      <span className="font-mono font-bold text-white">{baseline.hhiIndex}</span>
                    </span>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-inner">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5 w-8 text-center">#</th>
                      <th className="p-2.5">{t('सदस्य विवरण', 'Member Particulars')}</th>
                      <th className="p-2.5 text-center">{t('खाता संख्या', 'Accounts')}</th>
                      <th className="p-2.5 text-right">{t('कुल जम्मा निक्षेप (NPR)', 'Deposit Balance')}</th>
                      <th className="p-2.5 text-center">{t('कुल हिस्सा %', 'Share %')}</th>
                      <th className="p-2.5 text-center">{t('१०% सीमा स्थिति', '10% Cap Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {baseline.topDepositors.map((d, idx) => (
                      <tr key={d.memberId} className="hover:bg-slate-900/40">
                        <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-2.5">
                          <div className="font-bold text-white">{d.memberName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{d.memberNo}</div>
                        </td>
                        <td className="p-2.5 text-center font-mono">{d.accountCount}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-white">
                          {fmtCurrency(d.totalDepositBalance, true)}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-sky-400">
                          {d.depositSharePercent}%
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.isConcentrationRisk
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {d.isConcentrationRisk ? t('जोखिम (> १०%)', 'Risk (> 10%)') : t('सामान्य', 'Normal')}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {baseline.topDepositors.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">
                          {t('कुनै निक्षेप खाता भेटिएन।', 'No deposit accounts found.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Simulator */}
          {activeTab === 'SIMULATOR' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sliders className="size-4 text-emerald-400" />
                    <span>{t('निक्षेप वृद्धि तथा पूँजी पर्याप्तता सिमुलेटर', 'Deposit Growth & Capital Headroom Simulator')}</span>
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {t(
                      'नयाँ निक्षेप संकलन अभियान चलाउँदा पूँजीको १५ गुणा सीमा सुरक्षित राख्न आवश्यक थप शेयर पूँजीको प्रक्षेपण गर्नुहोस्।',
                      'Simulate how planned deposit campaigns impact the 15x limit and determine necessary share capital calls.'
                    )}
                  </p>
                </div>
              </div>

              {/* Projected Result Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">{t('प्रक्षेपित अनुपात (Projected Ratio)', 'Projected Ratio')}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <strong
                      className={`text-lg font-mono font-black ${
                        simulated.isCeilingCompliant ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {simulated.depositToCoreCapitalRatio}x
                    </strong>
                    <span className="text-[10px] text-slate-500">(अहिले: {baseline.depositToCoreCapitalRatio}x)</span>
                  </div>
                  <span className="text-[10px] block mt-0.5">
                    {simulated.isCeilingCompliant ? (
                      <span className="text-emerald-400">✓ {t('१५ गुणा सीमाभित्र सुरक्षित', 'Within 15x limit')}</span>
                    ) : (
                      <span className="text-rose-400 font-bold">⚠ {t('१५ गुणा सीमा उल्लंघन!', 'Exceeds 15x Limit!')}</span>
                    )}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">{t('प्रक्षेपित प्राथमिक पूँजी', 'Projected Core Capital')}</span>
                  <strong className="text-white text-lg font-mono block mt-1">
                    {fmtCurrency(simulated.totalCoreCapital, true)}
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    {t('नयाँ १५ गुणा सीमा:', 'New 15x Cap:')} {fmtCurrency(simulated.maxStatutoryDepositCeiling, true)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">{t('प्रक्षेपित उपलब्ध क्षमता', 'Projected Headroom')}</span>
                  <strong className="text-emerald-400 text-lg font-mono block mt-1">
                    {fmtCurrency(simulated.headroomCapacity, true)}
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    {t('क्षमता उपयोग:', 'Utilization:')} {simulated.headroomUtilizationPercent}%
                  </span>
                </div>
              </div>

              {/* Slider Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{t('प्रस्तावित थप निक्षेप संकलन:', 'Additional Planned Deposits:')}</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {fmtCurrency(simAdditionalDeposit, true)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000000"
                    step="5000000"
                    value={simAdditionalDeposit}
                    onChange={(e) => setSimAdditionalDeposit(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    {t('रु ० देखि रु १० करोड सम्म थप निक्षेप अभियान', 'NPR 0 to 10 Crore campaign')}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{t('प्रस्तावित थप शेयर पूँजी आह्वान:', 'Additional Share Capital Call:')}</span>
                    <span className="font-mono font-bold text-indigo-400 text-sm">
                      {fmtCurrency(simAdditionalCapital, true)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20000000"
                    step="500000"
                    value={simAdditionalCapital}
                    onChange={(e) => setSimAdditionalCapital(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    {t('रु ० देखि रु २ करोड सम्म थप शेयर पूँजी आह्वान', 'NPR 0 to 2 Crore share capital call')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Statutory Memo */}
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
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-bold text-xs mt-2 border border-emerald-500/30">
                    {t(
                      'सहकारी ऐन २०७४ दफा ४९(१) बमोजिम निक्षेप संकलन सीमा तथा पूँजी पर्याप्तता घोषणापत्र',
                      'Statutory Declaration of Deposit Mobilization Limits under Cooperative Act 2074 Sec 49(1)'
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs leading-relaxed">
                  <p>
                    {t(
                      `सहकारी ऐन २०७४ को दफा ४९ उपदफा (१) मा भएको व्यवस्था बमोजिम यस संस्थाको प्राथमिक पूँजी कोष तथा सदस्यहरूबाट संकलित बचत निक्षेपको तुलनात्मक विवरण प्रमाणित गरिन्छ।`,
                      `Pursuant to Section 49 Subsection (1) of the Nepal Cooperative Act 2074, this is to certify the comparative analysis of Primary Core Capital and mobilized member deposits:`
                    )}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px]">{t('प्राथमिक पूँजी कोष:', 'Core Capital:')}</span>
                      <strong className="text-white block font-mono text-sm">{fmtCurrency(baseline.totalCoreCapital, true)}</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px]">{t('कुल सदस्य निक्षेप:', 'Total Deposits:')}</span>
                      <strong className="text-white block font-mono text-sm">{fmtCurrency(baseline.totalDepositLiability, true)}</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px]">{t('निक्षेप/पूँजी अनुपात:', 'Multiplier Ratio:')}</span>
                      <strong className="text-emerald-400 block font-mono text-sm">{baseline.depositToCoreCapitalRatio}x</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px]">{t('कानूनी अधिकतम सीमा:', 'Statutory Ceiling:')}</span>
                      <strong className="text-white block font-mono text-sm">१५.० गुणा (Max 15x)</strong>
                    </div>
                  </div>

                  <p className="pt-2 text-slate-400 text-[11px]">
                    {t(
                      `यस संस्थाको निक्षेप संकलन प्राथमिक पूँजी कोषको १५ गुणाको कानूनी सीमाभित्र रहेको र संस्थामा सदस्य बाहेक गैर-सदस्यबाट कुनै निक्षेप संकलन नगरिएको व्यहोरा प्रमाणित गर्दछौं।`,
                      `We hereby certify that mobilized deposits strictly remain within 15 times the primary core capital fund and no deposits are mobilized from non-members.`
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-800 text-center text-xs">
                  <div>
                    <div className="border-t border-slate-700 pt-2 font-bold text-white">
                      {t('वित्त तथा लेखा अधिकृत', 'Finance & Accounts Officer')}
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-slate-700 pt-2 font-bold text-white">
                      {t('प्रमुख कार्यकारी अधिकृत / व्यवस्थापक', 'CEO / Manager')}
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
                  <Printer className="size-4 text-emerald-400" />
                  <span>{t('घोषणापत्र प्रिन्ट गर्नुहोस्', 'Print Declaration')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>{t('सहकारी ऐन २०७४ दफा ४९(१) तथा PEARLS E9 मापदण्ड', 'Coop Act 2074 Sec 49(1) & PEARLS E9 Standard')}</span>
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
