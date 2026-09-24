import React from 'react';
import { Calculator, ShieldCheck, Users } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { LoanOriginationTab } from './LoanOriginationTypes';

interface LoanOriginationTabsNavProps {
  activeTab: LoanOriginationTab;
  onSelectTab: (tab: LoanOriginationTab) => void;
}

export const LoanOriginationTabsNav: React.FC<LoanOriginationTabsNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const { t } = useLanguageStore();

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={() => onSelectTab('SCHEME')}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
          activeTab === 'SCHEME'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
        }`}
      >
        <Calculator className="size-4" />
        <span>{t('१. ऋणी, योजना तथा किस्ता', '1. Scheme & Live EMI')}</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('GUARANTORS')}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
          activeTab === 'GUARANTORS'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
        }`}
      >
        <Users className="size-4" />
        <span>{t('२. जमानी बस्ने सदस्यहरू', '2. Dual Co-Guarantors')}</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('COLLATERAL')}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
          activeTab === 'COLLATERAL'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
        }`}
      >
        <ShieldCheck className="size-4" />
        <span>{t('३. धितो विवरण तथा भुक्तानी', '3. Collateral & Payout')}</span>
      </button>
    </div>
  );
};
