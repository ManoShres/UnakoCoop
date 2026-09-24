import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Member, MotherGroupDeposit } from '../../../../types';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface CollectionRecentTableProps {
  groupRecent: MotherGroupDeposit[];
  members: Member[];
  voidingId: string | null;
  onSetVoidingId: (id: string) => void;
}

export const CollectionRecentTable: React.FC<CollectionRecentTableProps> = ({
  groupRecent,
  members,
  voidingId,
  onSetVoidingId,
}) => {
  const { t, fmtCurrency } = useLanguageStore();

  const statusBadge = (status?: string) => {
    if (status === 'COMPLETED' || status === 'RECONCILED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <CheckCircle2 className="size-3" />
          {status}
        </span>
      );
    }
    if (status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          <Clock className="size-3" />
          PENDING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {t('खाली', 'DRAFT')}
      </span>
    );
  };

  if (groupRecent.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <XCircle className="size-4 text-rose-600" />
          <h2 className="text-sm font-black text-slate-900 dark:text-white">
            {t('हालका कलेक्सनहरू (हेर्नु वा रद्द गर्नु)', 'Recent Collections (view / void)')}
          </h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-bold">{t('सदस्य', 'Member')}</th>
              <th className="px-4 py-3 text-left font-bold">{t('बैंक स्लिप', 'Bank Slip')}</th>
              <th className="px-4 py-3 text-right font-bold">{t('रकम (रु)', 'Amount (NPR)')}</th>
              <th className="px-4 py-3 text-center font-bold">{t('स्थिति', 'Status')}</th>
              <th className="px-4 py-3 text-center font-bold">{t('कारोबार रेफ', 'Transaction Ref')}</th>
              <th className="px-4 py-3 text-center font-bold">{t('कार्य', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {groupRecent.map((dep) => {
              const canVoid = dep.status === 'PENDING' && !voidingId;
              return (
                <tr key={dep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {(() => {
                      const m = members.find((mem) => mem.id === dep.memberId || mem.memberNo === dep.memberNo);
                      return m ? t(m.nameNepali || m.name, m.name) : dep.memberName;
                    })()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{dep.bankDepositSlipNo ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold">{fmtCurrency(dep.amount, true)}</td>
                  <td className="px-4 py-3 text-center">{statusBadge(dep.status)}</td>
                  <td className="px-4 py-3 text-center font-mono text-[11px]">
                    {dep.transactionRef ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {canVoid ? (
                      <button
                        onClick={() => onSetVoidingId(dep.id)}
                        className="px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-700 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition"
                      >
                        {t('रद्द गर्नुहोस्', 'Void')}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
