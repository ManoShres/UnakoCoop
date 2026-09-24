import React from 'react';
import { PiggyBank, Sliders } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface SavingsHeaderBannerProps {
  onOpenRatesModal: () => void;
}

export function SavingsHeaderBanner({ onOpenRatesModal }: SavingsHeaderBannerProps) {
  const { t } = useLanguageStore();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
          <PiggyBank className="size-4" />
          <span>{t('केन्द्रीय बैंकिङ्ग बचत लेजर', 'CORE BANKING SAVINGS LEDGER')}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('बचत तथा पासबुक खाता व्यवस्थापन मोड्युल', 'Savings & Passbook Accounts Module')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t(
            'सदस्य बचत मौज्दात अडिट, सीबीएसमा रकम समायोजन र वार्षिक ब्याजदर निर्धारण।',
            'Audit member deposit balances, execute manual CBS adjustments, and configure cooperative annual interest rates.'
          )}
        </p>
      </div>

      <button
        onClick={onOpenRatesModal}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
        type="button"
      >
        <Sliders className="size-4 text-emerald-400" />
        <span>{t('ब्याजदर निर्धारण', 'Configure Interest Rates')}</span>
      </button>
    </div>
  );
}
