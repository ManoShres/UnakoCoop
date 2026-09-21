import React from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'compact' | 'pill' | 'minimal';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  variant = 'pill',
}) => {
  const { lang, setLang } = useLanguageStore();

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center rounded-lg bg-slate-100 dark:bg-emerald-950/60 p-0.5 border border-slate-200 dark:border-emerald-900/60 text-[11px] font-bold ${className}`}>
        <button
          type="button"
          onClick={() => setLang('ne')}
          className={`px-2 py-0.5 rounded-md transition-all ${
            lang === 'ne'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
          }`}
          title="नेपाली भाषा"
        >
          नेपा
        </button>
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`px-2 py-0.5 rounded-md transition-all ${
            lang === 'en'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
          }`}
          title="English Language"
        >
          EN
        </button>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={() => setLang(lang === 'ne' ? 'en' : 'ne')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 dark:border-emerald-900/60 hover:border-emerald-500 transition-colors ${className}`}
        title={lang === 'ne' ? 'Switch to English' : 'नेपालीमा परिवर्तन गर्नुहोस्'}
      >
        <Globe className="size-3.5 text-emerald-500" />
        <span>{lang === 'ne' ? 'English' : 'नेपाली'}</span>
      </button>
    );
  }

  // Default 'pill'
  return (
    <div className={`inline-flex items-center gap-1 bg-slate-100 dark:bg-emerald-950/70 p-1 rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-inner text-xs font-bold ${className}`}>
      <button
        type="button"
        onClick={() => setLang('ne')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
          lang === 'ne'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
        }`}
        title="नेपाली भाषा चयन गर्नुहोस्"
      >
        <span>🇳🇵</span>
        <span>नेपाली</span>
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
          lang === 'en'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
        }`}
        title="Switch to English"
      >
        <span>🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  );
};
