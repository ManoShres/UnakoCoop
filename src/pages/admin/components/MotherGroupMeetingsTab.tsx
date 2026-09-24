import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import type { MotherGroup, MotherGroupMeeting } from '../../../types';

interface MotherGroupMeetingsTabProps {
  motherGroupMeetings: MotherGroupMeeting[];
  motherGroups: MotherGroup[];
}

export function MotherGroupMeetingsTab({
  motherGroupMeetings,
  motherGroups,
}: MotherGroupMeetingsTabProps) {
  const { t, fmtCurrency } = useLanguageStore();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-900 dark:text-white">
          {t('समूह बैठक इतिहास', 'Meeting History')}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-bold">{t('समूह', 'Group')}</th>
              <th className="px-4 py-3 text-left font-bold">{t('मिति', 'Date')}</th>
              <th className="px-4 py-3 text-left font-bold">{t('सञ्चालक', 'Conducted By')}</th>
              <th className="px-4 py-3 text-right font-bold">{t('संकलित रकम', 'Collected')}</th>
              <th className="px-4 py-3 text-right font-bold">{t('सहभागी', 'Attendees')}</th>
              <th className="px-4 py-3 text-center font-bold">{t('स्थिति', 'Status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {motherGroupMeetings.map((mt) => {
              const grp = motherGroups.find((g) => g.id === mt.motherGroupId);
              return (
                <tr key={mt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {grp ? t(grp.nameNepali || grp.name, grp.name) : '—'}
                    </div>
                    <div className="text-xs text-slate-500">{grp?.location ?? ''}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{mt.meetingDate}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{mt.conductedByName ?? mt.conductedBy}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {fmtCurrency(mt.totalCollected, true)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{mt.memberCount}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <CheckCircle2 className="size-3" />
                      {mt.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {motherGroupMeetings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {t('कुनै बैठक रेकर्ड छैन।', 'No meetings recorded yet.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
