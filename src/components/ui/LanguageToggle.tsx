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

  const toggleTitle =
    lang === 'ne'
      ? 'नेपाली भाषा सक्रिय छ (सर्टकट: Alt+L)'
      : 'English language active (Shortcut: Alt+L)';

  if (variant === 'compact') {
    return (
      <div
        role="radiogroup"
        aria-label="भाषा चयन / Language Selection"
        className={`inline-flex items-center rounded-xl bg-slate-100/90 dark:bg-slate-800/90 p-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs text-xs font-bold transition-colors select-none ${className}`}
        title={toggleTitle}
      >
        <button
          type="button"
          role="radio"
          aria-checked={lang === 'ne'}
          onClick={() => setLang('ne')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ease-out cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            lang === 'ne'
              ? 'bg-emerald-600 text-white shadow-xs font-extrabold ring-1 ring-emerald-500/30'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
          }`}
          title="नेपाली भाषा चयन गर्नुहोस्"
        >
          <span className="text-[11px] leading-none" aria-hidden="true">🇳🇵</span>
          <span>नेपाली</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={lang === 'en'}
          onClick={() => setLang('en')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 ease-out cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            lang === 'en'
              ? 'bg-emerald-600 text-white shadow-xs font-extrabold ring-1 ring-emerald-500/30'
              : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
          }`}
          title="Switch to English"
        >
          <span className="text-[11px] leading-none" aria-hidden="true">🇬🇧</span>
          <span>EN</span>
        </button>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={() => setLang(lang === 'ne' ? 'en' : 'ne')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-2xs transition-all duration-150 ease-out active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${className}`}
        title={lang === 'ne' ? 'Switch to English (Alt+L)' : 'नेपालीमा परिवर्तन गर्नुहोस् (Alt+L)'}
        aria-label={lang === 'ne' ? 'Switch to English' : 'नेपालीमा परिवर्तन गर्नुहोस्'}
      >
        <Globe className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="font-semibold">{lang === 'ne' ? 'English' : 'नेपाली'}</span>
      </button>
    );
  }

  // Default 'pill' (Public header & login pages)
  return (
    <div
      role="radiogroup"
      aria-label="भाषा चयन / Select Language"
      className={`inline-flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner text-xs font-bold transition-colors select-none ${className}`}
      title={toggleTitle}
    >
      <button
        type="button"
        role="radio"
        aria-checked={lang === 'ne'}
        onClick={() => setLang('ne')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ease-out cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          lang === 'ne'
            ? 'bg-emerald-600 text-white shadow-xs font-extrabold ring-1 ring-emerald-500/30'
            : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
        }`}
        title="नेपाली भाषा चयन गर्नुहोस् (Alt+L)"
      >
        <span className="text-sm leading-none" aria-hidden="true">🇳🇵</span>
        <span>नेपाली</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={lang === 'en'}
        onClick={() => setLang('en')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 ease-out cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          lang === 'en'
            ? 'bg-emerald-600 text-white shadow-xs font-extrabold ring-1 ring-emerald-500/30'
            : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
        }`}
        title="Switch to English (Alt+L)"
      >
        <span className="text-sm leading-none" aria-hidden="true">🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  );
};
