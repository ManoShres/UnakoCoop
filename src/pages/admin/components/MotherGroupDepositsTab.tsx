import React from 'react';
import { Download, CheckCircle2, Clock, Wallet } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import type { MotherGroup, MotherGroupDeposit, Member } from '../../../types';

interface MotherGroupDepositsTabProps {
  motherGroupDeposits: MotherGroupDeposit[];
  motherGroups: MotherGroup[];
  members: Member[];
  onExportDeposits: () => void;
  onPostDeposit: (depositId: string) => void;
  onMarkReconciled: (depositId: string) => void;
}

export function MotherGroupDepositsTab({
  motherGroupDeposits,
  motherGroups,
  members,
  onExportDeposits,
  onPostDeposit,
  onMarkReconciled,
}: MotherGroupDepositsTabProps) {
  const { t, fmtCurrency } = useLanguageStore();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onExportDeposits}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Download className="size-4" />
          {t('CSV निकासा', 'Export CSV')}
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left font-bold">{t('सदस्य', 'Member')}</th>
                <th className="px-4 py-3 text-left font-bold">{t('समूह', 'Group')}</th>
                <th className="px-4 py-3 text-right font-bold">{t('रकम', 'Amount')}</th>
                <th className="px-4 py-3 text-left font-bold">{t('मिति', 'Date')}</th>
                <th className="px-4 py-3 text-left font-bold">{t('दर्ता गर्ने', 'Recorded By')}</th>
                <th className="px-4 py-3 text-center font-bold">{t('स्थिति', 'Status')}</th>
                <th className="px-4 py-3 text-right font-bold">{t('कार्य', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {motherGroupDeposits.map((d) => {
                const grp = motherGroups.find((g) => g.id === d.motherGroupId);
                return (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {(() => {
                          const mem = members.find((x) => x.id === d.memberId || x.memberNo === d.memberNo);
                          return mem ? t(mem.nameNepali || mem.name, mem.name) : d.memberName;
                        })()}
                      </div>
                      <div className="text-xs text-slate-500">{d.memberNo}</div>
                      {d.transactionRef && (
                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {d.transactionRef} · {d.savingsAccountNo}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {grp ? t(grp.nameNepali || grp.name, grp.name) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {fmtCurrency(d.amount, true)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{d.depositDate}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{d.recordedByName ?? d.recordedBy}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          d.status === 'RECONCILED'
                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                            : d.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {d.status === 'PENDING' ? <Clock className="size-3" /> : <CheckCircle2 className="size-3" />}
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {d.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => onPostDeposit(d.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                            title={t('सदस्य खातामा पोस्ट गर्नुहोस्', 'Post to member passbook')}
                          >
                            <CheckCircle2 className="size-4" />
                          </button>
                        )}
                        {d.status === 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => onMarkReconciled(d.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 transition cursor-pointer"
                            title={t('मिलान गर्नुहोस्', 'Mark reconciled')}
                          >
                            <Wallet className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {motherGroupDeposits.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    {t('कुनै जम्मा रेकर्ड छैन।', 'No deposits recorded yet.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
