import { create } from 'zustand';
import { ThemeColors, ThemePreset, FeatureFlags, DesignSettings, ChatColors } from '../types';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'forest-green',
    name: 'Forest Green (Default)',
    nameNepali: 'हरियो वन (मौलिक उनको)',
    description: 'Original agricultural green reflecting Dang Valley nature and prosperity',
    descriptionNepali: 'दाङ उपत्यकाको हरियाली, कृषि र समृद्धिको प्रतीक मौलिक हरियो थिम',
    colors: {
      primary: '#006b47',
      primaryContainer: '#00875a',
      secondary: '#006c49',
      accent: '#22c55e',
      accentLight: '#e8f5e9',
      canvas: '#f8fafc',
      card: '#ffffff',
    },
  },
  {
    id: 'royal-blue',
    name: 'Royal Navy & Blue',
    nameNepali: 'शाही निलो तथा नेभी',
    description: 'Corporate financial institution blue inspiring trust and stability',
    descriptionNepali: 'आधुनिक वित्तीय संस्थाको विश्वास, सुरक्षा र स्थिरता झल्काउने निलो थिम',
    colors: {
      primary: '#1d4ed8',
      primaryContainer: '#1e40af',
      secondary: '#0284c7',
      accent: '#06b6d4',
      accentLight: '#e0f2fe',
      canvas: '#f8fafc',
      card: '#ffffff',
    },
  },
  {
    id: 'burgundy-crimson',
    name: 'Burgundy Crimson',
    nameNepali: 'रातो कलेजी तथा क्रिम्सन',
    description: 'Warm Nepali rhododendron and festive crimson tone',
    descriptionNepali: 'नेपाली मौलिक लालीगुराँस र न्यानोपन जनाउने उत्कृष्ट कलेजी रातो थिम',
    colors: {
      primary: '#881337',
      primaryContainer: '#9f1239',
      secondary: '#be123c',
      accent: '#f43f5e',
      accentLight: '#ffe4e6',
      canvas: '#fafaf9',
      card: '#ffffff',
    },
  },
  {
    id: 'golden-amber',
    name: 'Golden Harvest & Amber',
    nameNepali: 'सुनौलो फसल तथा अम्बर',
    description: 'Golden paddy harvest symbolizing economic abundance and solar energy',
    descriptionNepali: 'पाकेको पहेँलो धानको बाला र आर्थिक वृद्धिको प्रतीक सुनौलो अम्बर थिम',
    colors: {
      primary: '#b45309',
      primaryContainer: '#92400e',
      secondary: '#d97706',
      accent: '#f59e0b',
      accentLight: '#fef3c7',
      canvas: '#fffbeb',
      card: '#ffffff',
    },
  },
  {
    id: 'modern-indigo',
    name: 'Modern Violet & Indigo',
    nameNepali: 'बैजनी तथा इन्डिगो',
    description: 'Vibrant digital fintech violet with high-contrast UI accents',
    descriptionNepali: 'आधुनिक डिजिटल फिनटेक र प्रविधिमैत्री सेवा झल्काउने बैजनी इन्डिगो थिम',
    colors: {
      primary: '#4338ca',
      primaryContainer: '#3730a3',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      accentLight: '#ede9fe',
      canvas: '#f8fafc',
      card: '#ffffff',
    },
  },
];

export const DEFAULT_CHAT_COLORS: ChatColors = {
  launcherFrom: '#e11d48',
  launcherTo: '#f43f5e',
  launcherHoverFrom: '#be123c',
  launcherHoverTo: '#e11d48',
  badge: '#dc2626',
  minimizeButton: '#e11d48',
  minimizeButtonHover: '#be123c',
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableEBallot: true,
  enableDividendClaim: true,
  enableAgmPass: true,
  enableGrievance: true,
  enableLoanApplication: true,
  enableSharePurchase: true,
  enableSavingsTransfer: true,
  enableSupportChat: true,
  enableSystemTour: true,
};

const STORAGE_KEY = 'unako_portal_design_settings_v2';

export function applyThemeToDOM(colors: ThemeColors) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-container', colors.primaryContainer);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-brand-accent-lime', colors.accent);
  root.style.setProperty('--color-brand-accent-light', colors.accentLight);
  root.style.setProperty('--color-surface-canvas', colors.canvas);
  root.style.setProperty('--color-surface-card', colors.card);
}

function loadSavedSettings(): DesignSettings {
  const defaultColors = THEME_PRESETS[0].colors;
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      selectedPresetId: 'forest-green',
      colors: { ...defaultColors },
      chatColors: { ...DEFAULT_CHAT_COLORS },
      customLogoUrl: null,
      features: { ...DEFAULT_FEATURE_FLAGS },
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        selectedPresetId: 'forest-green',
        colors: { ...defaultColors },
        chatColors: { ...DEFAULT_CHAT_COLORS },
        customLogoUrl: null,
        features: { ...DEFAULT_FEATURE_FLAGS },
      };
    }
    const parsed = JSON.parse(raw) as Partial<DesignSettings>;
    return {
      selectedPresetId: parsed.selectedPresetId || 'forest-green',
      colors: { ...defaultColors, ...(parsed.colors || {}) },
      chatColors: { ...DEFAULT_CHAT_COLORS, ...(parsed.chatColors || {}) },
      customLogoUrl: parsed.customLogoUrl ?? null,
      features: { ...DEFAULT_FEATURE_FLAGS, ...(parsed.features || {}) },
    };
  } catch {
    return {
      selectedPresetId: 'forest-green',
      colors: { ...defaultColors },
      chatColors: { ...DEFAULT_CHAT_COLORS },
      customLogoUrl: null,
      features: { ...DEFAULT_FEATURE_FLAGS },
    };
  }
}

function persistSettings(settings: DesignSettings) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage quota exceeded or disabled
    }
  }
}

interface DesignStoreState {
  settings: DesignSettings;
  applyPreset: (presetId: string) => void;
  updateColor: (colorKey: keyof ThemeColors, value: string) => void;
  updateColors: (colors: Partial<ThemeColors>) => void;
  updateChatColor: (key: keyof ChatColors, value: string) => void;
  updateChatColors: (colors: Partial<ChatColors>) => void;
  toggleFeature: (featureKey: keyof FeatureFlags) => void;
  setFeature: (featureKey: keyof FeatureFlags, enabled: boolean) => void;
  setCustomLogo: (logoUrl: string | null) => void;
  resetToDefaults: () => void;
  initTheme: () => void;
}

export const useDesignStore = create<DesignStoreState>((set, get) => {
  const initial = loadSavedSettings();
  // Apply immediately upon creation
  applyThemeToDOM(initial.colors);

  return {
    settings: initial,

    initTheme: () => {
      applyThemeToDOM(get().settings.colors);
    },

    applyPreset: (presetId: string) => {
      const preset = THEME_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      const newColors: ThemeColors = { ...preset.colors };
      applyThemeToDOM(newColors);

      set((state) => {
        const next: DesignSettings = {
          ...state.settings,
          selectedPresetId: presetId,
          colors: newColors,
          chatColors: { ...DEFAULT_CHAT_COLORS },
        };
        persistSettings(next);
        return { settings: next };
      });
    },

    updateColor: (colorKey: keyof ThemeColors, value: string) => {
      set((state) => {
        const nextColors: ThemeColors = {
          ...state.settings.colors,
          [colorKey]: value,
        };
        applyThemeToDOM(nextColors);
        const next: DesignSettings = {
          ...state.settings,
          selectedPresetId: 'custom',
          colors: nextColors,
        };
        persistSettings(next);
        return { settings: next };
      });
    },

    updateColors: (colors: Partial<ThemeColors>) => {
      set((state) => {
        const nextColors: ThemeColors = {
          ...state.settings.colors,
          ...colors,
        };
        applyThemeToDOM(nextColors);
        const next: DesignSettings = {
          ...state.settings,
          selectedPresetId: 'custom',
          colors: nextColors,
        };
        persistSettings(next);
        return { settings: next };
      });
    },

    updateChatColor: (key: keyof ChatColors, value: string) => {
      set((state) => {
        const nextChatColors: ChatColors = {
          ...state.settings.chatColors,
          [key]: value,
        };
        const next: DesignSettings = {
          ...state.settings,
          chatColors: nextChatColors,
        };
        persistSettings(next);
        return { settings: next };
      });
    },

    updateChatColors: (colors: Partial<ChatColors>) => {
      set((state) => {
        const nextChatColors: ChatColors = {
          ...state.settings.chatColors,
          ...colors,
        };
        const next: DesignSettings = {
          ...state.settings,
          chatColors: nextChatColors,
        };
        persistSettings(next);
        return { settings: next };
      });
    },

    toggleFeature: (featureKey: keyof FeatureFlags) => {
      set((state) => {
        const nextFeatures: FeatureFlags = {
          ...state.settings.features,
          [featureKey]: !state.settings.features[featureKey],
        };
        const next: DesignSettings = {
          ...state.settings,
          features: nextFeatures,
        };
        persistSettings(next);
        return { settings: next };
      });
    },

    setFeature: (featureKey: keyof FeatureFlags, enabled: boolean) => {
      set((state) => {
        const nextFeatures: FeatureFlags = {
          ...state.settings.features,
          [featureKey]: enabled,
        };
        const next: DesignSettings = {
          ...state.settings,
          features: nextFeatures,
        };
        persistSettings(next);
        return { settings: next };
      });
    },

    setCustomLogo: (logoUrl: string | null) => {
      set((state) => {
        const next: DesignSettings = {
          ...state.settings,
          customLogoUrl: logoUrl,
        };
        persistSettings(next);
        return { settings: next };
      });
    },

    resetToDefaults: () => {
      const defaultColors = THEME_PRESETS[0].colors;
      applyThemeToDOM(defaultColors);
      const next: DesignSettings = {
        selectedPresetId: 'forest-green',
        colors: { ...defaultColors },
        chatColors: { ...DEFAULT_CHAT_COLORS },
        customLogoUrl: null,
        features: { ...DEFAULT_FEATURE_FLAGS },
      };
      persistSettings(next);
      set({ settings: next });
    },
  };
});
