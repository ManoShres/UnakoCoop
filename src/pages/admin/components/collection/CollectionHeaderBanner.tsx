import React from 'react';
import { Download, Wallet } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface CollectionHeaderBannerProps {
  onExportSheet: () => void;
}

export const CollectionHeaderBanner: React.FC<CollectionHeaderBannerProps> = ({ onExportSheet }) => {
  const { t } = useLanguageStore();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
          <Wallet className="size-4" />
          <span>{t('टेलर कलेक्सन कन्सोल', 'TELLER COLLECTION CONSOLE')}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('आमा समूह मासिक कलेक्सन प्रविष्टि', 'Mother Group Meeting Collection Entry')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t(
            'सभामा उठेको रकम प्रविष्ट गरी सदस्यको व्यक्तिगत बचत खातामा पोस्ट गर्नुहोस्।',
            'Enter the amounts collected in the meeting and post them into each member’s personal savings account.'
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onExportSheet}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
        >
          <Download className="size-4" />
          {t('शीट CSV', 'Sheet CSV')}
        </button>
      </div>
    </div>
  );
};
