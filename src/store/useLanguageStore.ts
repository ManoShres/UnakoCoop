import { create } from 'zustand';

export type Language = 'ne' | 'en';

interface LanguageState {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: <T>(ne: T, en: T) => T;
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
}));
