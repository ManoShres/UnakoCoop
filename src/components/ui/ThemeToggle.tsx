import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'compact' | 'pill' | 'minimal';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { theme, toggleTheme } = useAuthStore();
  const { lang, t } = useLanguageStore();

  const isDark = theme === 'dark';
  const label = isDark
    ? t('उज्यालो मोडमा जानुहोस् (Alt+T)', 'Switch to Light Mode (Alt+T)')
    : t('अध्यारो मोडमा जानुहोस् (Alt+T)', 'Switch to Dark Mode (Alt+T)');

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all duration-150 ease-out cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          isDark
            ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 shadow-xs'
            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 shadow-xs'
        } ${className}`}
        title={label}
        aria-label={label}
      >
        {isDark ? (
          <>
            <Sun className="size-3.5 text-amber-300 transition-transform duration-300 hover:rotate-45" />
            <span>{t('उज्यालो', 'Light')}</span>
          </>
        ) : (
          <>
            <Moon className="size-3.5 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
            <span>{t('अध्यारो', 'Dark')}</span>
          </>
        )}
      </button>
    );
  }

  // Default 'compact' (icon button in headers)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`size-8 sm:size-8.5 rounded-xl border transition-all duration-150 ease-out flex items-center justify-center cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-2xs ${
        isDark
          ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 hover:text-amber-200'
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
      } ${className}`}
      title={label}
      aria-label={label}
    >
      {isDark ? (
        <Sun className="size-4 text-amber-300 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="size-4 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};
