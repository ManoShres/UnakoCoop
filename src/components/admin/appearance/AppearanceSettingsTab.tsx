import React, { useState } from 'react';
import { useDesignStore } from '../../../store/useDesignStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { ThemePresetPicker } from './ThemePresetPicker';
import { AdvancedColorPicker } from './AdvancedColorPicker';
import { LogoUploader } from './LogoUploader';
import { FeatureToggles } from './FeatureToggles';
import { RotateCcw, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AppearanceSettingsTab: React.FC = () => {
  const { resetToDefaults } = useDesignStore();
  const { t } = useLanguageStore();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleReset = () => {
    resetToDefaults();
    setShowConfirmReset(false);
    setToastMsg(
      t(
        'प्रणालीका सम्पूर्ण रङ, थिम र सुविधाहरू पूर्वनिर्धारित अवस्थामा फर्काइयो!',
        'All design tokens, themes, and feature toggles reset to default!'
      )
    );
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-primary/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Top Banner with Quick Status */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <Sparkles className="size-4" />
            <span>{t('प्रत्यक्ष दृश्य इन्जिन', 'Real-time Live Theming Engine')}</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            {t('सहकारी ब्रान्डिङ तथा सुविधाहरू अनुकूलन', 'Cooperative Branding & Feature Management')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
            {t(
              'यहाँ गरिएका परिवर्तनहरू वास्तविक समयमै ब्राउजरमा सुरक्षित हुन्छन् र सदस्य तथा प्रशासक पोर्टलमा तुरुन्तै लागू हुन्छन्।',
              'All styling and feature switches are saved in real time and automatically take effect across the member and staff portals.'
            )}
          </p>
        </div>

        <div>
          {!showConfirmReset ? (
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>{t('सबै पूर्वनिर्धारितमा फर्काउनुहोस्', 'Reset All to Defaults')}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700">
              <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                {t('निश्चिन्त हुनुहुन्छ?', 'Confirm reset?')}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {t('हो, रिसेट गर्नुहोस्', 'Yes, Reset')}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-xs font-bold transition-colors cursor-pointer"
              >
                {t('रद्द', 'Cancel')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section 1: Presets */}
      <ThemePresetPicker />

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Section 2: Advanced Color Customizer */}
      <AdvancedColorPicker />

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Section 3: Official Logo */}
      <LogoUploader />

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Section 4: Feature Inclusion / Exclusion */}
      <FeatureToggles />
    </div>
  );
};
