import { create } from 'zustand';
import { formatCurrency, formatCount, toNepaliDigits } from '../utils/nepaliDate';

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
  /** Formats any string or number to Nepali Devanagari digits when `isNepali`. */
  fmtDigits: (value: string | number | undefined | null) => string;
  /** Format a phone number into Nepali digits when `isNepali`. */
  fmtPhone: (phone: string | undefined | null) => string;
  /** Format a percentage into e.g. "१०.५%" or "10.5%" */
  fmtPercent: (rate: number | string | undefined | null, decimals?: number) => string;
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

const initialLang = getInitialLanguage();

export const useLanguageStore = create<LanguageState>((set, get) => ({
  lang: initialLang,
  isNepali: initialLang === 'ne',
  setLang: (lang: Language) => {
    try {
      localStorage.setItem('unako_lang', lang);
    } catch {
      // ignore
    }
    set({ lang, isNepali: lang === 'ne' });
  },
  toggleLang: () => {
    const next: Language = get().lang === 'ne' ? 'en' : 'ne';
    try {
      localStorage.setItem('unako_lang', next);
    } catch {
      // ignore
    }
    set({ lang: next, isNepali: next === 'ne' });
  },
  t: (ne, en) => (get().lang === 'ne' ? ne : en),
  fmtCurrency: (amount: number, compact = false) =>
    formatCurrency(amount, get().lang === 'ne', 'NPR', compact),
  fmtCount: (value: number) => formatCount(value, get().lang === 'ne'),
  fmtDigits: (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return '';
    return get().lang === 'ne' ? toNepaliDigits(value) : String(value);
  },
  fmtPhone: (phone: string | undefined | null) => {
    if (!phone) return '';
    return get().lang === 'ne' ? toNepaliDigits(phone) : phone;
  },
  fmtPercent: (rate: number | string | undefined | null, decimals?: number) => {
    if (rate === undefined || rate === null) return '';
    let valStr = '';
    if (typeof rate === 'number' && decimals !== undefined) {
      valStr = rate.toFixed(decimals);
    } else {
      valStr = String(rate);
    }
    const formatted = get().lang === 'ne' ? toNepaliDigits(valStr) : valStr;
    return `${formatted}%`;
  },
}));
