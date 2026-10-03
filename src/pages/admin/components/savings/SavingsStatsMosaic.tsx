import React from 'react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface SavingsStatsMosaicProps {
  totalDeposits: number;
  activeAccountsCount: number;
}

export function SavingsStatsMosaic({ totalDeposits, activeAccountsCount }: SavingsStatsMosaicProps) {
  const { t, fmtCurrency, fmtCount, fmtPercent } = useLanguageStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="text-xs text-slate-500 font-bold uppercase">{t('कुल सदस्य तरलता', 'Total Member Liquidity')}</div>
        <div className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
          {fmtCurrency(totalDeposits, true)}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">{t('सबै सक्रिय पासबुक खाताहरूमा', 'Across all active passbook ledgers')}</div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="text-xs text-slate-500 font-bold uppercase">{t('साधारण बचत प्रतिफल', 'Regular Savings APY')}</div>
        <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 mt-1">{fmtPercent('8.00')} {t('वार्षिक', 'p.a.')}</div>
        <div className="text-[11px] text-emerald-500 mt-0.5">{t('त्रैमासिक सीबीएस चक्र', 'Quarterly CBS Compound Cycle')}</div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="text-xs text-slate-500 font-bold uppercase">{t('सक्रिय खाता संख्या', 'Active Ledger Accounts')}</div>
        <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
          {fmtCount(activeAccountsCount)} {t('खाताहरू', 'Accounts')}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">{t('शून्य निष्क्रिय दायित्व', 'Zero non-performing liabilities')}</div>
      </div>
    </div>
  );
}
