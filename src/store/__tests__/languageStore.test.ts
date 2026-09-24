import { describe, it, expect, beforeEach, vi } from 'vitest';

const storageMock: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => storageMock[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storageMock[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete storageMock[key];
  }),
  clear: vi.fn(() => {
    Object.keys(storageMock).forEach((k) => delete storageMock[k]);
  }),
  key: vi.fn(() => null),
  length: 0,
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

import { useLanguageStore } from '../useLanguageStore';

describe('useLanguageStore reactivity & localization', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    useLanguageStore.getState().setLang('ne');
  });

  it('initializes with Nepali by default', () => {
    const state = useLanguageStore.getState();
    expect(state.lang).toBe('ne');
    expect(state.isNepali).toBe(true);
  });

  it('updates lang and isNepali reactively when setLang is called', () => {
    useLanguageStore.getState().setLang('en');
    let state = useLanguageStore.getState();
    expect(state.lang).toBe('en');
    expect(state.isNepali).toBe(false);

    useLanguageStore.getState().setLang('ne');
    state = useLanguageStore.getState();
    expect(state.lang).toBe('ne');
    expect(state.isNepali).toBe(true);
  });

  it('toggles language and isNepali flag between ne and en', () => {
    expect(useLanguageStore.getState().lang).toBe('ne');
    expect(useLanguageStore.getState().isNepali).toBe(true);

    useLanguageStore.getState().toggleLang();
    expect(useLanguageStore.getState().lang).toBe('en');
    expect(useLanguageStore.getState().isNepali).toBe(false);

    useLanguageStore.getState().toggleLang();
    expect(useLanguageStore.getState().lang).toBe('ne');
    expect(useLanguageStore.getState().isNepali).toBe(true);
  });

  it('resolves translations dynamically with t()', () => {
    const { t } = useLanguageStore.getState();
    expect(t('सहकारी', 'Cooperative')).toBe('सहकारी');

    useLanguageStore.getState().setLang('en');
    expect(t('सहकारी', 'Cooperative')).toBe('Cooperative');
  });

  it('formats counts in Devanagari when ne and Western digits when en', () => {
    const { fmtCount } = useLanguageStore.getState();
    expect(fmtCount(0)).toBe('०');
    expect(fmtCount(42)).toBe('४२');
    expect(fmtCount(12345)).toBe('१२,३४५');

    useLanguageStore.getState().setLang('en');
    expect(fmtCount(0)).toBe('0');
    expect(fmtCount(42)).toBe('42');
    expect(fmtCount(12345)).toBe('12,345');
  });

  it('formats currency with appropriate prefix and digits reactively', () => {
    const { fmtCurrency } = useLanguageStore.getState();
    expect(fmtCurrency(184500, true)).toBe('रु १,८४,५००');

    useLanguageStore.getState().setLang('en');
    expect(fmtCurrency(184500, true)).toBe('NPR 1,84,500');
  });

  it('formats digits and phone numbers into Nepali digits reactively', () => {
    const { fmtPhone, fmtDigits, fmtPercent } = useLanguageStore.getState();
    expect(fmtPhone('9841234567')).toBe('९८४१२३४५६७');
    expect(fmtPhone('082-412055')).toBe('०८२-४१२०५५');
    expect(fmtDigits('2081-11-15')).toBe('२०८१-११-१५');
    expect(fmtPercent(12)).toBe('१२%');
    expect(fmtPercent(10.75)).toBe('१०.७५%');

    useLanguageStore.getState().setLang('en');
    const enState = useLanguageStore.getState();
    expect(enState.fmtPhone('9841234567')).toBe('9841234567');
    expect(enState.fmtPhone('082-412055')).toBe('082-412055');
    expect(enState.fmtDigits('2081-11-15')).toBe('2081-11-15');
    expect(enState.fmtPercent(12)).toBe('12%');
    expect(enState.fmtPercent(10.75)).toBe('10.75%');
  });

  it('notifies subscribers on language change', () => {
    let callCount = 0;
    let lastLang = '';
    const unsubscribe = useLanguageStore.subscribe((state) => {
      callCount += 1;
      lastLang = state.lang;
    });

    useLanguageStore.getState().setLang('en');
    expect(callCount).toBe(1);
    expect(lastLang).toBe('en');

    useLanguageStore.getState().toggleLang();
    expect(callCount).toBe(2);
    expect(lastLang).toBe('ne');

    unsubscribe();
  });
});

