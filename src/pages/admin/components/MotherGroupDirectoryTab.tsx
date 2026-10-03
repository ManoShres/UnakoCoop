import React from 'react';
import { Search, MapPin, Trash2, Users, CalendarDays, Phone } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import type { MotherGroup, MotherGroupMember, MotherGroupDeposit } from '../../../types';

interface MotherGroupDirectoryTabProps {
  query: string;
  setQuery: (val: string) => void;
  filteredGroups: MotherGroup[];
  groupMembers: (groupId: string) => MotherGroupMember[];
  groupDeposits: (groupId: string) => MotherGroupDeposit[];
  onDeleteGroup: (groupId: string) => void;
}

export function MotherGroupDirectoryTab({
  query,
  setQuery,
  filteredGroups,
  groupMembers,
  groupDeposits,
  onDeleteGroup,
}: MotherGroupDirectoryTabProps) {
  const { t, fmtCurrency, fmtPhone } = useLanguageStore();

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('समूह वा स्थान खोज्नुहोस्...', 'Search group or location...')}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredGroups.map((g) => (
          <div
            key={g.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  {g.groupCode && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {g.groupCode}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    {g.isActive ? t('सक्रिय समूह', 'ACTIVE') : t('निष्क्रिय', 'INACTIVE')}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {t(g.nameNepali || g.name, g.name)}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <MapPin className="size-3" />
                  {g.location}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDeleteGroup(g.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition cursor-pointer"
                title={t('मेट्नुहोस्', 'Delete')}
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            {/* Committee Leadership info */}
            {(g.chairpersonName || g.secretaryName || g.treasurerName) && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-[11px] space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider">
                  {t('समिति पदाधिकारीहरू', 'Committee Leadership')}
                </div>
                <div className="text-slate-600 dark:text-slate-300 flex flex-wrap gap-x-2 gap-y-0.5">
                  {g.chairpersonName && (
                    <span>
                      <strong className="text-slate-800 dark:text-white">{t('अध्यक्ष:', 'Chair:')}</strong> {g.chairpersonName}
                    </span>
                  )}
                  {g.secretaryName && (
                    <span>
                      • <strong className="text-slate-800 dark:text-white">{t('सचिव:', 'Sec:')}</strong> {g.secretaryName}
                    </span>
                  )}
                  {g.treasurerName && (
                    <span>
                      • <strong className="text-slate-800 dark:text-white">{t('कोषाध्यक्ष:', 'Treas:')}</strong> {g.treasurerName}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-slate-400" />
                  {groupMembers(g.id).length} {t('सदस्यहरू', 'members')}
                </span>
                {g.mandatoryContributionPerMember && (
                  <span className="font-mono text-[11px] font-bold text-emerald-600">
                    {fmtCurrency(g.mandatoryContributionPerMember, true)} /महिना
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-slate-400" />
                <span>{g.meetingDay || t('निर्धारित छैन', 'Not scheduled')}</span>
                {g.meetingTime && (
                  <span className="font-mono text-slate-400">({g.meetingTime})</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="size-3.5 text-slate-400" />
                {g.contactPerson} · {fmtPhone(g.contactPhone)}
              </div>
              {g.fieldStaffName && (
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  {t('सम्बन्धित कर्मचारी:', 'Field Officer:')} {g.fieldStaffName}
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400">
                  {t('मासिक लक्ष्य', 'MONTHLY TARGET')}
                </div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {fmtCurrency(g.monthlyTargetAmount, true)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400">
                  {t('संकलित', 'COLLECTED')}
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {fmtCurrency(
                    groupDeposits(g.id).reduce((s, d) => s + d.amount, 0),
                    true
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
