import React, { useState, useMemo, useEffect } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  calculateBulkDividend,
  generateDividendRegisterCsv,
} from '../../utils/dividendDistribution';
import { triggerBrowserDownload } from '../../utils/copomisExport';
import {
  X,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Download,
  AlertCircle,
  Users,
  Search,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BulkDividendDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const BulkDividendDistributionModal: React.FC<BulkDividendDistributionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t, fmtCurrency, fmtPercent, fmtCount } = useLanguageStore();
  const { members, sharePool, executeBulkDividendDistribution } = useCoopStore();

  const [ratePercent, setRatePercent] = useState<number>(sharePool.annualDividendPercent || 14.5);
  const [fiscalYear, setFiscalYear] = useState<string>('2081/82');
  const [deductTax, setDeductTax] = useState<boolean>(true);
  const [destination, setDestination] = useState<'SAVINGS' | 'ACCRUED'>('SAVINGS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const calculation = useMemo(() => {
    return calculateBulkDividend(members, Number(ratePercent) || 0, deductTax);
  }, [members, ratePercent, deductTax]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return calculation.rows;
    return calculation.rows.filter(
      (r) =>
        r.memberName.toLowerCase().includes(q) ||
        r.memberNo.toLowerCase().includes(q)
    );
  }, [calculation.rows, searchQuery]);

  if (!isOpen) return null;

  const handleExecute = () => {
    setIsProcessing(true);
    try {
      const summary = executeBulkDividendDistribution({
        ratePercent: Number(ratePercent),
        fiscalYear,
        deductTax,
        destination,
      });

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore confetti errors in headless/test environments
      }

      onSuccess(
        t(
          `आ.व. ${fiscalYear} को ${ratePercent}% लाभांश सफलतापूर्वक ${summary.memberCount} सदस्यहरूलाई वितरण गरियो (कुल: रु. ${summary.totalNet.toLocaleString()})!`,
          `FY ${fiscalYear} dividend of ${ratePercent}% successfully distributed to ${summary.memberCount} members (Net: NPR ${summary.totalNet.toLocaleString()})!`
        )
      );
      onClose();
    } catch {
      // fallback
    } finally {
      setIsProcessing(false);
      setIsConfirming(false);
    }
  };

  const handleExportCsv = () => {
    const csvContent = generateDividendRegisterCsv(
      calculation.rows,
      fiscalYear,
      Number(ratePercent)
    );
    triggerBrowserDownload(
      csvContent,
      `Unako_Dividend_Distribution_Register_${fiscalYear.replace('/', '_')}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-dividend-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Coins className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="bulk-dividend-title" className="font-bold text-sm sm:text-base">
                  {t('वार्षिक साधारण सभा लाभांश वितरण कन्सोल', 'AGM Annual Dividend Distribution Suite')}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                  <ShieldCheck className="size-3" />
                  {t('दफा ६८ बमोजिम', 'Sec 68 Compliant')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {t(
                  'साधारण सभा स्वीकृत दर बमोजिम सेयर पुँजीमा ५% कर कट्टी गरी एकमुष्ठ लाभांश भुक्तानी।',
                  'Execute bulk dividend crediting directly to member savings accounts or accrued ledgers.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('बन्द गर्नुहोस्', 'Close')}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('लाभांश दर %', 'Dividend Rate %')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="18.0"
                  value={ratePercent}
                  onChange={(e) => setRatePercent(Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-black text-emerald-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isConfirming}
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {t('अधिकतम सीमा: १८%', 'Statutory ceiling: 18%')}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('आर्थिक वर्ष', 'Fiscal Year')}
              </label>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isConfirming}
              >
                <option value="2081/82">FY 2081/82 (हालको आ.व.)</option>
                <option value="2080/81">FY 2080/81</option>
                <option value="2079/80">FY 2079/80</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('५% आयकर कट्टी', '5% Statutory TDS')}
              </label>
              <button
                type="button"
                onClick={() => setDeductTax(!deductTax)}
                disabled={isConfirming}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                  deductTax
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600'
                }`}
              >
                <span>{deductTax ? t('५% कर कट्टी लागू', '5% TDS Enabled') : t('कर छुट / शून्य', 'Exempt (0%)')}</span>
                <span className={`size-2.5 rounded-full ${deductTax ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              </button>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {t('आयकर ऐन २०५८ बमोजिम', 'Per Income Tax Act 2058')}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('भुक्तानी गन्तव्य', 'Payout Destination')}
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value as 'SAVINGS' | 'ACCRUED')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isConfirming}
              >
                <option value="SAVINGS">{t('सिधै सदस्य बचत खाता', 'Direct Member Savings Account')}</option>
                <option value="ACCRUED">{t('सदस्य बक्यौता लगत', 'Accrue to Member Ledger')}</option>
              </select>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {destination === 'SAVINGS'
                  ? t('नियमित बचतमा जम्मा हुनेछ', 'Credited directly to passbooks')
                  : t('दाबी नगरेसम्म सुरक्षित रहनेछ', 'Saved for member claim')}
              </span>
            </div>
          </div>

          {/* Aggregated Payout Mosaic */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                {t('योग्य सदस्यहरू', 'Eligible Shareholders')}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">
                {fmtCount(calculation.summary.memberCount)}
              </span>
              <span className="text-[10px] text-slate-400">
                {t('कुल पुँजी:', 'Total Capital: ')}
                {fmtCurrency(calculation.summary.totalShareCapital, true)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase block">
                {t('कुल स्थूल लाभांश', 'Gross Dividend Pool')}
              </span>
              <span className="text-lg font-black text-blue-700 dark:text-blue-400 mt-1 block font-mono">
                {fmtCurrency(calculation.summary.totalGross, true)}
              </span>
              <span className="text-[10px] text-blue-600/80">
                @{fmtPercent(ratePercent)} {t('दरमा गणना', 'declared rate')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase block">
                {t('५% कर कट्टी (TDS)', '5% TDS Withheld')}
              </span>
              <span className="text-lg font-black text-amber-700 dark:text-amber-400 mt-1 block font-mono">
                {fmtCurrency(calculation.summary.totalTaxWithheld, true)}
              </span>
              <span className="text-[10px] text-amber-600/80">
                {t('आन्तरिक राजस्व खाता', 'Remitted to IRD')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
                {t('खुद वितरण रकम', 'Net Disbursed')}
              </span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1 block font-mono">
                {fmtCurrency(calculation.summary.totalNet, true)}
              </span>
              <span className="text-[10px] text-emerald-600/80">
                {t('सदस्यहरूलाई भुक्तानी हुने', 'Net paid to members')}
              </span>
            </div>
          </div>

          {/* Member Preview Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('सदस्यगत लाभांश वितरण पूर्व-दृश्यावलोकन', 'Individual Member Distribution Preview')}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold">
                  {fmtCount(filteredRows.length)}
                </span>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="size-3 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder={t('सदस्य खोज्नुहोस्...', 'Search member name/no...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100/70 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px] sticky top-0 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">{t('सदस्य विवरण', 'Member')}</th>
                    <th className="py-2.5 px-3 text-right">{t('सेयर पुँजी', 'Share Capital')}</th>
                    <th className="py-2.5 px-3 text-right">{t('स्थूल लाभांश', 'Gross (NPR)')}</th>
                    <th className="py-2.5 px-3 text-right">{t('५% कर', 'Tax (5%)')}</th>
                    <th className="py-2.5 px-3 text-right">{t('खुद भुक्तानी', 'Net (NPR)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {filteredRows.map((row) => (
                    <tr key={row.memberId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-sans">
                        <div className="font-bold text-slate-900 dark:text-white">{row.memberName}</div>
                        <div className="text-[10px] text-blue-600 font-mono">{row.memberNo}</div>
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                        {fmtCurrency(row.shareCapital, true)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                        {fmtCurrency(row.grossDividend, true)}
                      </td>
                      <td className="py-2 px-3 text-right text-amber-600">
                        -{fmtCurrency(row.taxDeduction, true)}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-emerald-600">
                        {fmtCurrency(row.netPayable, true)}
                      </td>
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-sans text-xs">
                        {t('कुनै योग्य सदस्य फेला परेन।', 'No eligible shareholders found.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confirmation Warning if in Confirming State */}
          {isConfirming && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold text-xs">
                <AlertCircle className="size-4 shrink-0 text-amber-600" />
                <span>{t('सावधानी: लाभांश वितरण अन्तिम हो', 'Caution: Dividend Distribution is Final')}</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                {t(
                  `के तपाईं निश्चित हुनुहुन्छ? यो कार्यले ${calculation.summary.memberCount} जना सदस्यहरूको खातामा कुल रु. ${calculation.summary.totalNet.toLocaleString()} रकम तुरुन्त जम्मा गर्नेछ र आधिकारिक DIVIDEND भौचर प्रविष्टि गर्नेछ।`,
                  `Are you sure? This action will immediately credit NPR ${calculation.summary.totalNet.toLocaleString()} across ${calculation.summary.memberCount} members' accounts and append official DIVIDEND vouchers.`
                )}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition"
          >
            <Download className="size-3.5 text-slate-500" />
            <span>{t('CSV बाँडफाँड लगत डाउनलोड', 'Export CSV Register')}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={isConfirming ? () => setIsConfirming(false) : onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition"
              disabled={isProcessing}
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>

            {!isConfirming ? (
              <button
                type="button"
                onClick={() => setIsConfirming(true)}
                disabled={calculation.summary.memberCount === 0}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                <Sparkles className="size-4" />
                <span>{t('लाभांश वितरण अघि बढाउनुहोस्', 'Proceed to Distribute')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExecute}
                disabled={isProcessing}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <CheckCircle2 className="size-4" />
                <span>
                  {isProcessing
                    ? t('वितरण हुँदैछ...', 'Distributing...')
                    : t('प्रमाणित गरी वितरण गर्नुहोस्', 'Confirm & Distribute Now')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
