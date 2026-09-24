import React from 'react';
import { CheckCircle2, Clock, UsersRound } from 'lucide-react';
import { Member, MotherGroup } from '../../../../types';
import { CollectionSheetRow } from '../../../../utils/collectionPosting';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { MemberCollectionBreakdown } from './CollectionTypes';

interface CollectionSheetTableProps {
  sheet: CollectionSheetRow[];
  group?: MotherGroup;
  members: Member[];
  amounts: Record<string, string>;
  breakdowns: Record<string, MemberCollectionBreakdown>;
  onUpdateMemberBreakdown: (
    memberId: string,
    field: keyof MemberCollectionBreakdown,
    value: any
  ) => void;
  onSave: (postAfter: boolean) => void;
}

export const CollectionSheetTable: React.FC<CollectionSheetTableProps> = ({
  sheet,
  group,
  members,
  amounts,
  breakdowns,
  onUpdateMemberBreakdown,
  onSave,
}) => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();

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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UsersRound className="size-4 text-blue-600" />
          <h2 className="text-sm font-black text-slate-900 dark:text-white">
            {t('सदस्य-वार कलेक्सन शीट', 'Member-wise Collection Sheet')}
            {group ? ` — ${group.name}` : ''}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSave(false)}
            className="px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition"
          >
            {t('पेन्डिङका रूपमा सुरक्षित', 'Save as Pending')}
          </button>
          <button
            onClick={() => onSave(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
          >
            {t('सुरक्षित गरी सदस्य खातामा पोस्ट गर्नुहोस्', 'Save & Post to Member Accounts')}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-3 py-3 text-left font-bold">{t('सदस्य विवरण', 'Member Details')}</th>
              <th className="px-2 py-3 text-center font-bold">{t('उपस्थिति', 'Attendance')}</th>
              <th className="px-2 py-3 text-right font-bold">{t('अनिवार्य बचत', 'Mandatory')}</th>
              <th className="px-2 py-3 text-right font-bold">{t('ऐच्छिक बचत', 'Optional')}</th>
              <th className="px-2 py-3 text-right font-bold">{t('कर्जा साँवा', 'Loan Prin.')}</th>
              <th className="px-2 py-3 text-right font-bold">{t('कर्जा ब्याज', 'Interest')}</th>
              <th className="px-2 py-3 text-right font-bold">{t('हर्जाना', 'Fine')}</th>
              <th className="px-3 py-3 text-right font-bold text-slate-900 dark:text-white">{t('जम्मा (Total)', 'Total (NPR)')}</th>
              <th className="px-3 py-3 text-center font-bold">{t('स्थिति', 'Status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sheet.map((row) => {
              const posted = row.status === 'COMPLETED' || row.status === 'RECONCILED';
              const b = breakdowns[row.groupMemberId] || {
                attendance: 'PRESENT',
                mandatorySavings: row.amount > 0 ? row.amount : row.monthlyContribution || 500,
                optionalSavings: 0,
                loanPrincipal: 0,
                loanInterest: 0,
                fine: 0,
              };
              const rowTotal =
                (b.mandatorySavings || 0) +
                (b.optionalSavings || 0) +
                (b.loanPrincipal || 0) +
                (b.loanInterest || 0) +
                (b.fine || 0);

              return (
                <tr
                  key={row.groupMemberId}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                    b.attendance === 'ABSENT' ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40' : ''
                  }`}
                >
                  {/* Member */}
                  <td className="px-3 py-3">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      {(() => {
                        const m = members.find((mem) => mem.id === row.memberId || mem.memberNo === row.memberNo);
                        return m ? t(m.nameNepali || m.name, m.name) : row.memberName;
                      })()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{fmtDigits(row.memberNo)}</div>
                    {row.canPost ? (
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        {fmtDigits(row.linkedAccountNo)}
                      </div>
                    ) : (
                      <div className="text-[10px] text-rose-500 font-bold">
                        {t('खाता नजोडिएको', 'No Passbook')}
                      </div>
                    )}
                  </td>

                  {/* Attendance */}
                  <td className="px-2 py-3 text-center">
                    <select
                      value={b.attendance}
                      onChange={(e) =>
                        onUpdateMemberBreakdown(row.groupMemberId, 'attendance', e.target.value)
                      }
                      disabled={posted}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${
                        b.attendance === 'PRESENT'
                          ? 'text-emerald-600'
                          : b.attendance === 'ABSENT'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }`}
                    >
                      <option value="PRESENT">{t('उपस्थित (P)', 'Present')}</option>
                      <option value="ABSENT">{t('अनुपस्थित (A)', 'Absent')}</option>
                      <option value="LATE">{t('ढिलो (L)', 'Late')}</option>
                      <option value="REPRESENTATIVE">{t('प्रतिनिधि (R)', 'Proxy')}</option>
                    </select>
                  </td>

                  {/* Mandatory Savings */}
                  <td className="px-2 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={b.mandatorySavings || ''}
                      onChange={(e) =>
                        onUpdateMemberBreakdown(
                          row.groupMemberId,
                          'mandatorySavings',
                          Number(e.target.value)
                        )
                      }
                      disabled={posted || b.attendance === 'ABSENT'}
                      className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-right text-xs"
                    />
                  </td>

                  {/* Optional Savings */}
                  <td className="px-2 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={b.optionalSavings || ''}
                      onChange={(e) =>
                        onUpdateMemberBreakdown(
                          row.groupMemberId,
                          'optionalSavings',
                          Number(e.target.value)
                        )
                      }
                      disabled={posted || b.attendance === 'ABSENT'}
                      placeholder="0"
                      className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-right text-xs"
                    />
                  </td>

                  {/* Loan Principal */}
                  <td className="px-2 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={b.loanPrincipal || ''}
                      onChange={(e) =>
                        onUpdateMemberBreakdown(
                          row.groupMemberId,
                          'loanPrincipal',
                          Number(e.target.value)
                        )
                      }
                      disabled={posted || b.attendance === 'ABSENT'}
                      placeholder="0"
                      className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-right text-xs"
                    />
                  </td>

                  {/* Loan Interest */}
                  <td className="px-2 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={b.loanInterest || ''}
                      onChange={(e) =>
                        onUpdateMemberBreakdown(
                          row.groupMemberId,
                          'loanInterest',
                          Number(e.target.value)
                        )
                      }
                      disabled={posted || b.attendance === 'ABSENT'}
                      placeholder="0"
                      className="w-18 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-right text-xs"
                    />
                  </td>

                  {/* Fine */}
                  <td className="px-2 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      step={25}
                      value={b.fine || ''}
                      onChange={(e) =>
                        onUpdateMemberBreakdown(row.groupMemberId, 'fine', Number(e.target.value))
                      }
                      disabled={posted}
                      placeholder="0"
                      className="w-16 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-right text-xs"
                    />
                  </td>

                  {/* Row Total */}
                  <td className="px-3 py-3 text-right font-mono font-black text-slate-900 dark:text-white">
                    रु. {fmtCurrency(rowTotal, true)}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3 text-center">{statusBadge(row.status)}</td>
                </tr>
              );
            })}

            {sheet.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                  {t('यो समूहमा सक्रिय सदस्य छैनन्।', 'No active members in this group yet.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
        {t(
          'रकम पोस्ट गर्दा सदस्यको नियमित बचत खातामा DEPOSIT कारोबार सिर्जना हुन्छ (रेफ: MGCOL-…) र बैठकको कुल संकलन स्वतः अद्यावधिक हुन्छ।',
          'Posting creates a DEPOSIT transaction on the member\'s regular savings account (ref: MGCOL-…) and updates the meeting total automatically.'
        )}
      </div>
    </div>
  );
};
