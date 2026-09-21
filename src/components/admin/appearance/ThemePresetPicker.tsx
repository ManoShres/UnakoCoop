import React from 'react';
import { useDesignStore, THEME_PRESETS } from '../../../store/useDesignStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { Palette, Check } from 'lucide-react';

export const ThemePresetPicker: React.FC = () => {
  const { settings, applyPreset } = useDesignStore();
  const { lang, t } = useLanguageStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="size-4 text-primary" />
            <span>{t('कन्फिगर्ड थिम प्रिसेटहरू', 'Curated Theme Presets')}</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'सहकारीको पहिचान सुहाउँदो रङ संयोजन एक क्लिकमा छनोट गर्नुहोस्।',
              'Select a professionally balanced color scheme for your cooperative with one click.'
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {THEME_PRESETS.map((preset) => {
          const isSelected = settings.selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {lang === 'ne' ? preset.nameNepali : preset.name}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary text-white">
                      <Check className="size-3" />
                      <span>{t('सक्रिय', 'Active')}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                  {lang === 'ne' ? preset.descriptionNepali : preset.description}
                </p>
              </div>

              {/* Color Swatch Preview Bar */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div
                  className="size-6 rounded-md shadow-xs border border-white/20"
                  style={{ backgroundColor: preset.colors.primary }}
                  title={`Primary: ${preset.colors.primary}`}
                />
                <div
                  className="size-6 rounded-md shadow-xs border border-white/20"
                  style={{ backgroundColor: preset.colors.primaryContainer }}
                  title={`Hover: ${preset.colors.primaryContainer}`}
                />
                <div
                  className="size-6 rounded-md shadow-xs border border-white/20"
                  style={{ backgroundColor: preset.colors.secondary }}
                  title={`Secondary: ${preset.colors.secondary}`}
                />
                <div
                  className="size-6 rounded-md shadow-xs border border-white/20"
                  style={{ backgroundColor: preset.colors.accent }}
                  title={`Accent: ${preset.colors.accent}`}
                />
                <div
                  className="size-6 rounded-md shadow-xs border border-slate-300 dark:border-slate-700 ml-auto"
                  style={{ backgroundColor: preset.colors.canvas }}
                  title={`Canvas: ${preset.colors.canvas}`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
