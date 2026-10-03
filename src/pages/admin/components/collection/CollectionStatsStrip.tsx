import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, Landmark } from 'lucide-react';
import { MotherGroupMeeting } from '../../../../types';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface CollectionStatsStripProps {
  entryTotal: number;
  activeMeeting?: MotherGroupMeeting;
  pendingCount: number;
  postedCount: number;
  unlinkedCount: number;
}

export const CollectionStatsStrip: React.FC<CollectionStatsStripProps> = ({
  entryTotal,
  activeMeeting,
  pendingCount,
  postedCount,
  unlinkedCount,
}) => {
  const { t, fmtCurrency, fmtCount } = useLanguageStore();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <Landmark className="size-3.5" /> {t('यो सीटको जम्मा', 'SHEET TOTAL')}
        </div>
        <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{fmtCurrency(entryTotal, true)}</div>
        {activeMeeting && (
          <div className="text-[10px] text-slate-400 mt-1">
            {t('बैठकमा दर्ता:', 'Meeting total: ')}
            {fmtCurrency(activeMeeting.totalCollected, true)}
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <Clock className="size-3.5" /> {t('पेन्डिङ', 'PENDING')}
        </div>
        <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{fmtCount(pendingCount)}</div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5" /> {t('पोस्ट भइसकेका', 'POSTED')}
        </div>
        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{fmtCount(postedCount)}</div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <AlertTriangle className="size-3.5" /> {t('खाता नजोडिएका', 'NO PASSBOOK')}
        </div>
        <div className="text-2xl font-black text-rose-500 dark:text-rose-400">{fmtCount(unlinkedCount)}</div>
      </div>
    </div>
  );
};
