import React, { useState, useMemo, useEffect } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { calculateBulkBonusShares } from '../../utils/dividendDistribution';
import {
  X,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BonusShareDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const BonusShareDistributionModal: React.FC<BonusShareDistributionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t, fmtCurrency, fmtCount, fmtPercent } = useLanguageStore();
  const { members, sharePool, executeBonusShareDistribution } = useCoopStore();

  const [bonusPercent, setBonusPercent] = useState<number>(5.0);
  const [fiscalYear, setFiscalYear] = useState<string>('2081/82');
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
    return calculateBulkBonusShares(members, Number(bonusPercent) || 0, sharePool.parValue || 100);
  }, [members, bonusPercent, sharePool.parValue]);

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
      const summary = executeBonusShareDistribution({
        bonusPercent: Number(bonusPercent),
        fiscalYear,
        parValue: sharePool.parValue || 100,
      });

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onSuccess(
        t(
          `आ.व. ${fiscalYear} को ${bonusPercent}% बोनस सेयर (${summary.totalBonusKitta} कित्ता, रु. ${summary.totalAddedCapital.toLocaleString()}) सफलतापूर्वक बाँडफाँड भयो!`,
          `FY ${fiscalYear} bonus shares (${bonusPercent}%, ${summary.totalBonusKitta} kitta, NPR ${summary.totalAddedCapital.toLocaleString()}) successfully allotted!`
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bonus-shares-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Award className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="bonus-shares-title" className="font-bold text-sm sm:text-base">
                  {t('बोनस सेयर कित्ता बाँडफाँड कन्सोल', 'Bonus Share Allotment Console')}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-semibold border border-purple-500/30">
                  <ShieldCheck className="size-3" />
                  {t('पुँजीकरण योजना', 'Equity Capitalization')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {t(
                  'वार्षिक साधारण सभा निर्णय अनुसार बचत/नाफाबाट सदस्यहरूको सेयर कित्ता वृद्धि।',
                  'Capitalize surplus or retained dividends into member share units at par value.'
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('बोनस सेयर प्रतिशत (Bonus Share %)', 'Bonus Share %')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="50.0"
                  value={bonusPercent}
                  onChange={(e) => setBonusPercent(Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-black text-purple-600 focus:ring-2 focus:ring-purple-500 outline-none"
                  disabled={isConfirming}
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {t('साधारण सभा प्रस्ताव अनुसार', 'As approved by AGM')}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('आर्थिक वर्ष', 'Fiscal Year')}
              </label>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                disabled={isConfirming}
              >
                <option value="2081/82">FY 2081/82 (हालको आ.व.)</option>
                <option value="2080/81">FY 2080/81</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('प्रति कित्ता दर', 'Par Value')}
              </label>
              <div className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                NPR {sharePool.parValue || 100} / {t('कित्ता', 'Unit')}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {t('कानूनी अंकित मूल्य', 'Statutory face value')}
              </span>
            </div>
          </div>

          {/* Mosaic Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                {t('योग्य सेयरधनी', 'Eligible Shareholders')}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">
                {fmtCount(calculation.summary.memberCount)}
              </span>
              <span className="text-[10px] text-slate-400">
                {t('सक्रिय सदस्यहरू', 'Active members')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20">
              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase block">
                {t('नयाँ बोनस कित्ता', 'Bonus Kitta Created')}
              </span>
              <span className="text-lg font-black text-purple-700 dark:text-purple-400 mt-1 block font-mono">
                +{fmtCount(calculation.summary.totalBonusKitta)}
              </span>
              <span className="text-[10px] text-purple-600/80">
                {t('थप हुने कित्ता संख्या', 'Additional share units')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
                {t('पुँजी वृद्धि मूल्य', 'Capital Expansion Value')}
              </span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1 block font-mono">
                {fmtCurrency(calculation.summary.totalAddedCapital, true)}
              </span>
              <span className="text-[10px] text-emerald-600/80">
                {t('पुँजीकृत रकम', 'Capitalized into equity')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase block">
                {t('नयाँ कुल सेयर कित्ता', 'New Total Kitta Pool')}
              </span>
              <span className="text-lg font-black text-indigo-700 dark:text-indigo-400 mt-1 block font-mono">
                {fmtCount(sharePool.totalAllottedKitta + calculation.summary.totalBonusKitta)}
              </span>
              <span className="text-[10px] text-indigo-600/80">
                {t('संस्थाको नयाँ कित्ता', 'Coop total pool')}
              </span>
            </div>
          </div>

          {/* Table Preview */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('सदस्यगत बोनस कित्ता बाँडफाँड तालिका', 'Member Bonus Share Allotment Table')}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold">
                  {fmtCount(filteredRows.length)}
                </span>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="size-3 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder={t('सदस्य खोज्नुहोस्...', 'Search member...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100/70 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px] sticky top-0 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">{t('सदस्य विवरण', 'Member')}</th>
                    <th className="py-2.5 px-3 text-right">{t('हालको कित्ता', 'Current Kitta')}</th>
                    <th className="py-2.5 px-3 text-right text-purple-600">{t('बोनस कित्ता (+)', 'Bonus (+)')}</th>
                    <th className="py-2.5 px-3 text-right font-bold">{t('नयाँ जम्मा कित्ता', 'New Total Kitta')}</th>
                    <th className="py-2.5 px-3 text-right">{t('नयाँ सेयर पुँजी', 'New Equity (NPR)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {filteredRows.map((row) => (
                    <tr key={row.memberId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-sans">
                        <div className="font-bold text-slate-900 dark:text-white">{row.memberName}</div>
                        <div className="text-[10px] text-blue-600 font-mono">{row.memberNo}</div>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                        {fmtCount(row.currentKitta)}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-purple-600">
                        +{fmtCount(row.bonusKitta)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {fmtCount(row.newTotalKitta)}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-emerald-600">
                        {fmtCurrency(row.newTotalCapital, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confirm Warning */}
          {isConfirming && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800/80 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200 font-bold text-xs">
                <AlertCircle className="size-4 shrink-0 text-purple-600" />
                <span>{t('बोनस सेयर निष्कासन प्रमाणीकरण', 'Confirm Bonus Share Issuance')}</span>
              </div>
              <p className="text-[11px] text-purple-700 dark:text-purple-300">
                {t(
                  `यस कार्यले कुल ${calculation.summary.totalBonusKitta} कित्ता (रु. ${calculation.summary.totalAddedCapital.toLocaleString()}) नयाँ सेयर सम्पूर्ण सदस्यहरूको नाममा दर्ता गरी सेयर पुँजी अद्यावधिक गर्नेछ।`,
                  `This action will issue ${calculation.summary.totalBonusKitta} new shares (NPR ${calculation.summary.totalAddedCapital.toLocaleString()}) across all shareholder accounts and update cooperative capital.`
                )}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
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
              disabled={calculation.summary.totalBonusKitta === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition cursor-pointer"
            >
              <TrendingUp className="size-4" />
              <span>{t('बोनस सेयर बाँडफाँड अघि बढाउनुहोस्', 'Proceed to Allot Shares')}</span>
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
                  ? t('कित्ता बाँडफाँड हुँदैछ...', 'Allotting Shares...')
                  : t('प्रमाणित गरी बाँडफाँड गर्नुहोस्', 'Confirm & Allot Now')}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
