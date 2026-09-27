import React, { useState, useMemo } from 'react';
import {
  X,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Sliders,
  DollarSign,
  TrendingUp,
  Receipt,
  Users,
  Building2,
  Coins,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import {
  PatronageWeightConfig,
  MemberPatronageMetric,
  MemberPatronageDistribution,
  DEFAULT_PATRONAGE_CONFIG,
  MOCK_PATRONAGE_METRICS,
  calculatePatronageRefund,
  generatePatronageVoucherPayload,
  exportPatronageAuditCsv,
} from '../../utils/patronageRefundEngine';
import { printElement } from '../../utils/printHelper';

interface PatronageRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatronageRefundModal: React.FC<PatronageRefundModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtCount } = useLanguageStore();
  const { coopSettings, members, addTransaction } = useCoopStore();

  const [activeTab, setActiveTab] = useState<'CONFIG' | 'DISTRIBUTION' | 'WARRANT' | 'DISBURSEMENT'>('CONFIG');
  const [config, setConfig] = useState<PatronageWeightConfig>(DEFAULT_PATRONAGE_CONFIG);
  const [metrics, setMetrics] = useState<MemberPatronageMetric[]>(MOCK_PATRONAGE_METRICS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarrantMemberId, setSelectedWarrantMemberId] = useState<string>('mem-1');
  const [batchDisbursed, setBatchDisbursed] = useState(false);
  const [disbursementSuccessMsg, setDisbursementSuccessMsg] = useState<string | null>(null);

  // Calculate distributions dynamically
  const { distributions, summary } = useMemo(() => {
    return calculatePatronageRefund(metrics, config);
  }, [metrics, config]);

  // Selected warrant for print preview
  const selectedDistribution = useMemo(() => {
    return distributions.find((d) => d.memberId === selectedWarrantMemberId) || distributions[0];
  }, [distributions, selectedWarrantMemberId]);

  const selectedMember = useMemo(() => {
    return members.find((m) => m.id === selectedDistribution?.memberId) || members[0];
  }, [members, selectedDistribution]);

  if (!isOpen) return null;

  const totalWeights =
    config.savingsInterestWeight + config.loanInterestWeight + config.dairyBusinessWeight;
  const isWeightsValid = totalWeights === 100;

  const handlePrintWarrant = () => {
    printElement('patronage-refund-warrant-print', {
      format: 'a4',
      title: `Patronage-Warrant-${selectedDistribution.warrantNumber}`,
    });
  };

  const handleExportCsv = () => {
    const csv = exportPatronageAuditCsv(distributions, summary);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Unako_Section41_Patronage_Refund_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBatchDisburseToAccounts = () => {
    if (batchDisbursed) return;

    // Generate CBS deposit transactions for each eligible member
    distributions.forEach((dist) => {
      if (dist.netPatronageRefund > 0) {
        const voucher = generatePatronageVoucherPayload(dist, '2081-06-25');
        addTransaction(voucher);
      }
    });

    setBatchDisbursed(true);
    setDisbursementSuccessMsg(
      t(
        `सफलतापूर्वक ${fmtCount(summary.eligibleMemberCount)} सदस्यहरूको खातामा रु. ${fmtCurrency(summary.totalDistributed, false)} दाखिला गरियो!`,
        `Successfully credited NPR ${fmtCurrency(summary.totalDistributed, false)} to ${fmtCount(summary.eligibleMemberCount)} member accounts!`
      )
    );
  };

  const filteredDistributions = distributions.filter((d) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.memberName.toLowerCase().includes(q) ||
        d.memberNo.toLowerCase().includes(q) ||
        d.warrantNumber.toLowerCase().includes(q) ||
        d.accountNo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Coins className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {t('दफा ४१ संरक्षकता फिर्ता कोष तथा लाभांश पुर्जा व्यवस्थापन', 'Section 41 Patronage Refund & Warrant Desk')}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {t('सहकारी ऐन २०७४', 'Coop Act 2074')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {coopSettings.name} • {t('बचत, ऋण तथा दुग्ध संकलन कारोबारका आधारमा लाभांश फिर्ता', 'Refund distributed based on member transaction volume')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('CONFIG')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CONFIG'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sliders className="size-4" />
            <span>{t('कोष तथा हिस्सा मापदण्ड', 'Pool & Weights')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DISTRIBUTION')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'DISTRIBUTION'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="size-4" />
            <span>{t('सदस्य हिस्सा तालिका', 'Distribution Matrix')}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px]">
              {distributions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WARRANT')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'WARRANT'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt className="size-4" />
            <span>{t('संरक्षकता पुर्जा मुद्रण', 'Official Warrant Slip')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DISBURSEMENT')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'DISBURSEMENT'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="size-4" />
            <span>{t('खाता दाखिला तथा भुक्तानी', 'CBS Account Credit')}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: CONFIG */}
          {activeTab === 'CONFIG' && (
            <div className="space-y-6">
              {/* Pool & Fiscal Year Setup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3">
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                    {t('संरक्षकता फिर्ता कोष कुल रकम (NPR)', 'Total Patronage Fund Pool')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">रु.</span>
                    <input
                      type="number"
                      value={config.totalPoolAmount}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          totalPoolAmount: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-black text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t('वार्षिक खुद बचतको कम्तीमा ४०% रकम संरक्षकता फिर्ता कोषमा राखिन्छ', 'At least 40% of divisible surplus allocated per Section 41')}
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3">
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                    {t('आर्थिक वर्ष (Fiscal Year)', 'Fiscal Year')}
                  </label>
                  <select
                    value={config.fiscalYear}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        fiscalYear: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white"
                  >
                    <option value="२०८०/०८१">आ.व. २०८०/०८१ (२०२३/२४)</option>
                    <option value="२०८१/०८२">आ.व. २०८१/०८२ (२०२४/२५)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">
                    {t('पुर्जा नम्बरमा स्वतः आ.व. कोड समावेश हुनेछ', 'Warrant numbers will automatically incorporate FY code')}
                  </p>
                </div>
              </div>

              {/* 3 Statutory Weights */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {t('कारोबार हिस्सा भार बाँडफाँड (Transaction Volume Weights)', 'Patronage Volume Weights Allocation')}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('सहकारी ऐन अनुसार बचत, ऋण र दुग्ध कारोबारलाई १००% मा विभाजन गर्नुहोस्', 'Allocate 100% across Savings, Loan, and Dairy turnover')}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      isWeightsValid
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {t('कुल भार:', 'Total:')} {totalWeights}% {isWeightsValid ? '✓' : '(१००% हुनुपर्छ)'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {t('बचत कारोबार हिस्सा', 'Savings Interest Volume')}
                      </span>
                      <span className="font-mono font-black text-amber-600">{config.savingsInterestWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.savingsInterestWeight}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          savingsInterestWeight: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-400">
                      {t('कोष रकम:', 'Fund:')} रु. {fmtCurrency(summary.totalSavingsPoolDistributed, false)}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {t('ऋण कारोबार हिस्सा', 'Loan Interest Volume')}
                      </span>
                      <span className="font-mono font-black text-amber-600">{config.loanInterestWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.loanInterestWeight}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          loanInterestWeight: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-400">
                      {t('कोष रकम:', 'Fund:')} रु. {fmtCurrency(summary.totalLoanPoolDistributed, false)}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {t('दुग्ध तथा कृषि संकलन कारोबार', 'Dairy / Produce Volume')}
                      </span>
                      <span className="font-mono font-black text-amber-600">{config.dairyBusinessWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.dairyBusinessWeight}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          dairyBusinessWeight: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-400">
                      {t('कोष रकम:', 'Fund:')} रु. {fmtCurrency(summary.totalDairyPoolDistributed, false)}
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{t('कुल वितरण हुने रकम', 'Total Distributed')}</div>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
                    रु. {fmtCurrency(summary.totalDistributed, false)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{t('योग्य सदस्य संख्या', 'Eligible Members')}</div>
                  <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {fmtCount(summary.eligibleMemberCount)} {t('जना', 'Members')}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{t('औसत संरक्षकता फिर्ता', 'Avg Refund')}</div>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
                    रु. {fmtCurrency(summary.averageRefundPerMember, false)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{t('अधिकतम फिर्ता रकम', 'Max Refund')}</div>
                  <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                    रु. {fmtCurrency(summary.maxRefundAmount, false)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DISTRIBUTION MATRIX */}
          {activeTab === 'DISTRIBUTION' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative">
                  <Search className="size-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('सदस्य, खाता वा पुर्जा नम्बर खोज्नुहोस्...', 'Search member, account or warrant...')}
                    className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white w-72"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileSpreadsheet className="size-4 text-emerald-600" />
                  <span>{t('CSV / Excel डाउनलोड', 'Export Matrix')}</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">{t('पुर्जा नम्बर', 'Warrant No')}</th>
                      <th className="py-2.5 px-3">{t('सदस्य विवरण', 'Member')}</th>
                      <th className="py-2.5 px-3 text-right">{t('बचत हिस्सा (रु)', 'Savings Share')}</th>
                      <th className="py-2.5 px-3 text-right">{t('ऋण हिस्सा (रु)', 'Loan Share')}</th>
                      <th className="py-2.5 px-3 text-right">{t('दुग्ध संकलन हिस्सा (रु)', 'Dairy Share')}</th>
                      <th className="py-2.5 px-3 text-right">{t('कुल फिर्ता रकम (रु)', 'Total Refund')}</th>
                      <th className="py-2.5 px-3 text-center">{t('कार्य', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {filteredDistributions.map((d) => (
                      <tr key={d.memberId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          {d.warrantNumber}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{d.memberName}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {d.memberNo} • {d.accountNo}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-600">
                          {fmtCurrency(d.savingsShareAmount, false)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-blue-600">
                          {fmtCurrency(d.loanShareAmount, false)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-600">
                          {fmtCurrency(d.dairyShareAmount, false)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white">
                          रु. {fmtCurrency(d.netPatronageRefund, false)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-sans">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWarrantMemberId(d.memberId);
                              setActiveTab('WARRANT');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                          >
                            {t('पुर्जा हेर्नुहोस्', 'View Slip')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: WARRANT PRINT */}
          {activeTab === 'WARRANT' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {t('सदस्य पुर्जा छान्नुहोस्:', 'Select Member Slip:')}
                  </label>
                  <select
                    value={selectedWarrantMemberId}
                    onChange={(e) => setSelectedWarrantMemberId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {distributions.map((d) => (
                      <option key={d.memberId} value={d.memberId}>
                        {d.memberName} ({d.memberNo}) - {d.warrantNumber} (रु. {fmtCurrency(d.netPatronageRefund, false)})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handlePrintWarrant}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-600 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="size-4" />
                  <span>{t('संरक्षकता पुर्जा छाप्नुहोस्', 'Print Warrant Slip')}</span>
                </button>
              </div>

              {/* Printable Official Patronage Refund Warrant Slip */}
              <div
                id="patronage-refund-warrant-print"
                data-printable="slip"
                className="p-8 rounded-3xl border-2 border-slate-800 bg-white text-slate-900 max-w-3xl mx-auto space-y-6 shadow-md font-sans"
              >
                {/* Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4">
                  <div className="flex justify-center items-center gap-3 mb-1">
                    <img alt="Unako SACCOS Logo" className="h-12 w-auto object-contain" src="/unako-logo.png" />
                    <div>
                      <h1 className="text-xl font-black tracking-tight text-slate-900">{coopSettings.name}</h1>
                      <div className="text-xs font-bold text-slate-700">
                        {coopSettings.address} • {t('दर्ता नं.', 'Reg No.')} {coopSettings.regNo} • PAN: {coopSettings.panNo}
                      </div>
                    </div>
                  </div>
                  <div className="inline-block px-4 py-1 mt-2 rounded-full border border-slate-900 text-xs font-black uppercase tracking-wider">
                    {t('संरक्षकता फिर्ता कोष भुक्तानी पुर्जा (PATRONAGE REFUND WARRANT)', 'PATRONAGE REFUND WARRANT')}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    {t('सहकारी ऐन २०७४ को दफा ४१ बमोजिम आर्थिक वर्ष', 'Pursuant to Section 41 of Nepal Cooperative Act 2074, Fiscal Year')} {config.fiscalYear}
                  </div>
                </div>

                {/* Member & Warrant Meta */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{t('सदस्यको नाम', 'Member Name')}:</span>{' '}
                      <strong className="text-sm">{selectedDistribution.memberName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{t('सदस्य नम्बर', 'Member ID')}:</span>{' '}
                      <span className="font-mono font-bold">{selectedDistribution.memberNo}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{t('नागरिकता नं.', 'Citizenship')}:</span>{' '}
                      <span className="font-mono">{selectedMember.citizenshipNo || '५२-०१-७२-०३८४२'}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-right">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{t('पुर्जा नम्बर', 'Warrant No')}:</span>{' '}
                      <span className="font-mono font-black text-amber-700">{selectedDistribution.warrantNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{t('दाखिला हुने खाता', 'Deposit A/C')}:</span>{' '}
                      <span className="font-mono font-bold">{selectedDistribution.accountNo}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{t('जारी मिति', 'Issue Date')}:</span>{' '}
                      <span className="font-mono">२०८१/०६/२५ (2024-10-10)</span>
                    </div>
                  </div>
                </div>

                {/* Calculation Breakdown Table */}
                <div className="border border-slate-900 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 border-b border-slate-900 text-[10px] font-black uppercase">
                      <tr>
                        <th className="py-2 px-3">{t('कारोबार आधार (Pillars)', 'Transaction Basis')}</th>
                        <th className="py-2 px-3 text-center">{t('संस्थागत भार', 'Weight')}</th>
                        <th className="py-2 px-3 text-right">{t('प्राप्त फिर्ता रकम (NPR)', 'Refund Amount')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-bold">
                          १. {t('बचत कारोबार हिस्सा (वार्षिक बचत ब्याज)', 'Savings Interest Patronage')}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">{config.savingsInterestWeight}%</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                          रु. {fmtCurrency(selectedDistribution.savingsShareAmount, false)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-bold">
                          २. {t('ऋण कारोबार हिस्सा (वार्षिक भुक्तान ब्याज)', 'Loan Interest Patronage')}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">{config.loanInterestWeight}%</td>
                        <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                          रु. {fmtCurrency(selectedDistribution.loanShareAmount, false)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-bold">
                          ३. {t('दुग्ध तथा कृषि संकलन कारोबार हिस्सा', 'Dairy / Produce Marketing Volume')}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">{config.dairyBusinessWeight}%</td>
                        <td className="py-2.5 px-3 text-right font-bold text-amber-700">
                          रु. {fmtCurrency(selectedDistribution.dairyShareAmount, false)}
                        </td>
                      </tr>
                      <tr className="bg-slate-100 font-black text-sm">
                        <td className="py-3 px-3 font-sans" colSpan={2}>
                          {t('कुल संरक्षकता फिर्ता रकम (Total Net Patronage Refund):', 'Total Net Patronage Refund:')}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-900">
                          रु. {fmtCurrency(selectedDistribution.netPatronageRefund, false)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Statutory Note */}
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-[11px] text-amber-950">
                  <p>
                    <strong>{t('वैधानिक टिप्पणी:', 'Statutory Note:')}</strong>{' '}
                    {t(
                      'यो रकम सहकारी ऐन २०७४ को दफा ४१ अनुसार सदस्यले संस्थासँग गरेको कारोबारको आधारमा प्रदान गरिएको हो। यस रकमबाट कुनै लाभांश कर कट्टा गरिएको छैन र सदस्यको बचत खातामा सिधै दाखिला हुनेछ।',
                      'This amount is disbursed pursuant to Section 41 of Nepal Cooperative Act 2074 based on member transactional patronage. No dividend tax has been withheld, and it will be credited directly to your savings account.'
                    )}
                  </p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-400 text-center text-xs">
                  <div>
                    <div className="h-10"></div>
                    <div className="border-t border-slate-700 pt-1 font-bold">
                      {t('लेखापाल', 'Accountant')}
                    </div>
                  </div>
                  <div>
                    <div className="h-10"></div>
                    <div className="border-t border-slate-700 pt-1 font-bold">
                      {t('व्यवस्थापक / अधिकृत', 'Manager / CEO')}
                    </div>
                  </div>
                  <div>
                    <div className="h-10"></div>
                    <div className="border-t border-slate-700 pt-1 font-bold">
                      {t('प्राप्तकर्ता सदस्य', 'Recipient Member')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DISBURSEMENT */}
          {activeTab === 'DISBURSEMENT' && (
            <div className="space-y-6">
              {/* Batch Action Card */}
              <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-linear-to-r from-amber-50 to-emerald-50 dark:from-amber-950/20 dark:to-emerald-950/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Building2 className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {t('एकमुष्ट सीबीएस बचत खाता दाखिला (Batch CBS Savings Credit)', 'Batch CBS Savings Account Credit')}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {t('सबै योग्य सदस्यहरूको नियमित बचत खातामा सिधै रकम दाखिला गरी कारोबार भौचर जारी गर्नुहोस्', 'Post automated deposits with CBS audit vouchers for all eligible members')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{t('दाखिला हुने सदस्य संख्या', 'Members to Credit')}</span>
                    <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
                      {fmtCount(summary.eligibleMemberCount)} {t('जना', 'Members')}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{t('कुल दाखिला रकम', 'Total Credit Sum')}</span>
                    <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      रु. {fmtCurrency(summary.totalDistributed, false)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{t('भुक्तानी स्थिति', 'Status')}</span>
                    <div className="text-sm font-black mt-1.5">
                      {batchDisbursed ? (
                        <span className="text-emerald-600 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="size-4" /> {t('सम्पन्न (Posted)', 'Posted')}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold">{t('तयार (Pending Action)', 'Ready')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {disbursementSuccessMsg && (
                  <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                    <span>{disbursementSuccessMsg}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBatchDisburseToAccounts}
                    disabled={batchDisbursed || !isWeightsValid}
                    className={`px-5 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer ${
                      batchDisbursed
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                    }`}
                  >
                    <CheckCircle2 className="size-4" />
                    <span>
                      {batchDisbursed
                        ? t('खाता दाखिला सम्पन्न भइसक्यो', 'CBS Credit Completed')
                        : t('एकमुष्ट बचत खाता दाखिला गर्नुहोस्', 'Execute Batch CBS Deposit')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="size-4 text-emerald-600" />
                    <span>{t('बैंक/ConnectIPS भुक्तानी CSV', 'Export Bank / IPS Batch')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
