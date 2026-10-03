import React from 'react';
import { Search, Percent } from 'lucide-react';
import { SavingsAccount, Member } from '../../../../types';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface SavingsAccountsTableProps {
  accounts: SavingsAccount[];
  members: Member[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectAccount: (acct: SavingsAccount) => void;
}

export function SavingsAccountsTable({
  accounts,
  members,
  searchTerm,
  onSearchChange,
  onSelectAccount,
}: SavingsAccountsTableProps) {
  const { t, fmtCurrency, fmtDigits, fmtPercent } = useLanguageStore();

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          type="text"
          placeholder={t('खाता नं. वा प्रकारबाट खोज्नुहोस्...', 'Search by account no or type...')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Accounts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{t('खाता नम्बर', 'Account Number')}</th>
                <th className="py-3 px-4">{t('योजनाको प्रकार', 'Scheme Type')}</th>
                <th className="py-3 px-4">{t('हालको मौज्दात', 'Current Balance')}</th>
                <th className="py-3 px-4">{t('ब्याजदर', 'Interest Rate')}</th>
                <th className="py-3 px-4">{t('स्थिति', 'Status')}</th>
                <th className="py-3 px-4 text-right">{t('मौज्दात समायोजन', 'Adjust Balance')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {accounts.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {fmtDigits(s.accountNo)}
                    </div>
                    {(() => {
                      const owner = members.find((m) => m.id === s.memberId);
                      return owner ? (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                          {t(owner.nameNepali || owner.name, owner.name)}
                        </div>
                      ) : null;
                    })()}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {s.accountType}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {fmtCurrency(s.balance, true)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                      <Percent className="size-3" />
                      {fmtPercent(s.interestRate)} {t('वार्षिक', 'p.a.')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      {s.status === 'ACTIVE' ? t('सक्रिय', 'ACTIVE') : s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectAccount(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold transition"
                    >
                      <span>{t('समायोजन', 'Adjust')}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
