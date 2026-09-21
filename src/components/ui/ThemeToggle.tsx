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
  const { lang } = useLanguageStore();

  const isDark = theme === 'dark';
  const label = isDark
    ? lang === 'ne'
      ? 'उज्यालो मोडमा जानुहोस्'
      : 'Switch to Light Mode'
    : lang === 'ne'
    ? 'अध्यारो मोडमा जानुहोस्'
    : 'Switch to Dark Mode';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs border transition-all ${
          isDark
            ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 shadow-xs'
            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 shadow-xs'
        } ${className}`}
        title={label}
        aria-label={label}
      >
        {isDark ? (
          <>
            <Sun className="size-3.5 text-amber-300 animate-spin-once" />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon className="size-3.5 text-slate-600" />
            <span>Dark</span>
          </>
        )}
      </button>
    );
  }

  // Default 'compact' (icon button)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-1.5 rounded-lg border transition-all flex items-center justify-center ${
        isDark
          ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 hover:text-amber-200 shadow-xs'
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900 shadow-xs'
      } ${className}`}
      title={label}
      aria-label={label}
    >
      {isDark ? (
        <Sun className="size-4 text-amber-300 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="size-4 text-slate-600 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};
