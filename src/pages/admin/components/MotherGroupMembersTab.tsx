import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import type { MotherGroup, MotherGroupMember, Member } from '../../../types';

interface MotherGroupMembersTabProps {
  motherGroupMembers: MotherGroupMember[];
  motherGroups: MotherGroup[];
  members: Member[];
  onOpenMemberModal: () => void;
  onRemoveMember: (id: string) => void;
}

export function MotherGroupMembersTab({
  motherGroupMembers,
  motherGroups,
  members,
  onOpenMemberModal,
  onRemoveMember,
}: MotherGroupMembersTabProps) {
  const { t, fmtCount, fmtCurrency, fmtDigits } = useLanguageStore();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-black text-slate-900 dark:text-white">
          {t('समूह सदस्यहरू', 'Group Members')} ({fmtCount(motherGroupMembers.length)})
        </h2>
        <button
          type="button"
          onClick={onOpenMemberModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold cursor-pointer"
        >
          <Plus className="size-3.5" />
          {t('सदस्य थप्नुहोस्', 'Add Member')}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              {[
                t('समूह', 'Group'),
                t('सदस्य नं.', 'Member No'),
                t('नाम', 'Name'),
                t('मासिक चन्दा', 'Monthly Contribution'),
                '',
              ].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {motherGroupMembers.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                  {(() => {
                    const grp = motherGroups.find((g) => g.id === m.motherGroupId);
                    return grp ? t(grp.nameNepali || grp.name, grp.name) : '—';
                  })()}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{fmtDigits(m.memberNo)}</td>
                <td className="px-4 py-3">
                  {(() => {
                    const mem = members.find((x) => x.id === m.memberId || x.memberNo === m.memberNo);
                    return mem ? t(mem.nameNepali || mem.name, mem.name) : m.memberName;
                  })()}
                </td>
                <td className="px-4 py-3 font-bold text-emerald-600">{fmtCurrency(m.monthlyContribution, true)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onRemoveMember(m.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {motherGroupMembers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  {t('कुनै समूह सदस्य छैन।', 'No group members yet.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
