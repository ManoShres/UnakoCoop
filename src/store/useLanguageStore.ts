import { create } from 'zustand';
import { formatCurrency, formatCount } from '../utils/nepaliDate';

export type Language = 'ne' | 'en';

interface LanguageState {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: <T>(ne: T, en: T) => T;
  /** True when the UI is in Nepali mode — drives Nepali digit rendering. */
  isNepali: boolean;
  /** Format an amount (e.g. 184500) as currency, using Nepali digits when `isNepali`. */
  fmtCurrency: (amount: number, compact?: boolean) => string;
  /** Format a plain count (e.g. member counts) using Nepali digits when `isNepali`. */
  fmtCount: (value: number) => string;
}

const getInitialLanguage = (): Language => {
  try {
    const saved = localStorage.getItem('unako_lang');
    if (saved === 'en' || saved === 'ne') return saved;
  } catch {
    // localStorage not available
  }
  return 'ne';
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  lang: getInitialLanguage(),
  setLang: (lang: Language) => {
    try {
      localStorage.setItem('unako_lang', lang);
    } catch {
      // ignore
    }
    set({ lang });
  },
  toggleLang: () => {
    const next: Language = get().lang === 'ne' ? 'en' : 'ne';
    try {
      localStorage.setItem('unako_lang', next);
    } catch {
      // ignore
    }
    set({ lang: next });
  },
  t: (ne, en) => (get().lang === 'ne' ? ne : en),
  get isNepali() {
    return get().lang === 'ne';
  },
  fmtCurrency: (amount: number, compact = false) =>
    formatCurrency(amount, get().lang === 'ne', 'NPR', compact),
  fmtCount: (value: number) => formatCount(value, get().lang === 'ne'),
}));
