import React from 'react';
import { useDesignStore } from '../../../store/useDesignStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { ThemeColors, ChatColors } from '../../../types';
import { Sliders, Eye, Sparkles, MessageSquare } from 'lucide-react';

interface ColorDefinition {
  key: keyof ThemeColors;
  name: string;
  nameNepali: string;
  usage: string;
  usageNepali: string;
  defaultHex: string;
}

const COLOR_DEFINITIONS: ColorDefinition[] = [
  {
    key: 'primary',
    name: 'Primary Brand Color',
    nameNepali: 'मुख्य ब्रान्ड रङ',
    usage: 'Navigation bar, primary action buttons, active tabs, main headings, badges',
    usageNepali: 'शीर्ष नेभिगेसन, मुख्य कार्य बटन, सक्रिय ट्याब, शीर्षक र ब्याजहरू',
    defaultHex: '#006b47',
  },
  {
    key: 'primaryContainer',
    name: 'Primary Hover / Container',
    nameNepali: 'बटन होभर तथा कन्टेनर',
    usage: 'Button hover & active states, subtle borders, high-emphasis container accents',
    usageNepali: 'बटन होभर र क्लिक अवस्था, गाढा जोड दिइएका कन्टेनर बोर्डरहरू',
    defaultHex: '#00875a',
  },
  {
    key: 'secondary',
    name: 'Secondary Action Color',
    nameNepali: 'सहायक कार्य रङ',
    usage: 'Secondary buttons, subtitle highlights, category labels, card accents',
    usageNepali: 'सहायक बटन, उपशीर्षक हाइलाइट, विधा लेबल, कार्ड सजावट',
    defaultHex: '#006c49',
  },
  {
    key: 'accent',
    name: 'Vibrant Accent / Lime',
    nameNepali: 'चम्किलो एक्सेन्ट / हरियो',
    usage: 'Status pill dots, success verification badges, live indicator lights, stats',
    usageNepali: 'सफलता ब्याज, प्रमाणीकरण चिह्न, लाइभ इन्डिकेटर बत्ती र तथ्यांक हाइलाइट',
    defaultHex: '#22c55e',
  },
  {
    key: 'accentLight',
    name: 'Accent Light Background',
    nameNepali: 'एक्सेन्ट हल्का पृष्ठभूमि',
    usage: 'Alert notice containers, badge background pills, selected option highlights',
    usageNepali: 'सूचना ब्यानर पृष्ठभूमि, ब्याज पिल र चयन गरिएका विकल्पहरू',
    defaultHex: '#e8f5e9',
  },
  {
    key: 'canvas',
    name: 'Page Canvas Background',
    nameNepali: 'पृष्ठ पृष्ठभूमि क्यानभास',
    usage: 'Main portal page body background, outer application framing',
    usageNepali: 'पोर्टलको मुख्य बाहिरी पृष्ठ पृष्ठभूमि र क्यानभास',
    defaultHex: '#f8fafc',
  },
  {
    key: 'card',
    name: 'Card & Surface Background',
    nameNepali: 'कार्ड तथा सतह पृष्ठभूमि',
    usage: 'Dashboard cards, modal dialog windows, table panels, input backgrounds',
    usageNepali: 'ड्यासबोर्ड कार्ड, मोडल पपअप, तालिका प्यानल र फारम इनपुट पृष्ठभूमि',
    defaultHex: '#ffffff',
  },
];

const CHAT_COLOR_DEFINITIONS: { key: keyof ChatColors; name: string; nameNepali: string; usage: string; usageNepali: string; defaultHex: string }[] = [
  {
    key: 'launcherFrom',
    name: 'Chat Launcher Gradient Start',
    nameNepali: 'च्याट फ्लोटिङ आइकन ग्र्याडियन्ट सुरु',
    usage: 'Floating chat icon background gradient start color + popup header gradient start',
    usageNepali: 'फ्लोटिङ च्याट आइकन पृष्ठभूमि ग्र्याडियन्ट सुरु रङ तथा पपअप हेडर ग्र्याडियन्ट सुरु',
    defaultHex: '#e11d48',
  },
  {
    key: 'launcherTo',
    name: 'Chat Launcher Gradient End',
    nameNepali: 'च्याट फ्लोटिङ आइकन ग्र्याडियन्ट अन्त्य',
    usage: 'Floating chat icon background gradient end color + popup header gradient end',
    usageNepali: 'फ्लोटिङ च्याट आइकन पृष्ठभूमि ग्र्याडियन्ट अन्त्य रङ तथा पपअप हेडर ग्र्याडियन्ट अन्त्य',
    defaultHex: '#f43f5e',
  },
  {
    key: 'launcherHoverFrom',
    name: 'Chat Launcher Hover Gradient Start',
    nameNepali: 'च्याट फ्लोटिङ आइकन होभर ग्र्याडियन्ट सुरु',
    usage: 'Floating chat icon background on hover — gradient start',
    usageNepali: 'फ्लोटिङ च्याट आइकनमा 마우स राख्दा देखिने ग्र्याडियन्ट सुरु रङ',
    defaultHex: '#be123c',
  },
  {
    key: 'launcherHoverTo',
    name: 'Chat Launcher Hover Gradient End',
    nameNepali: 'च्याट फ्लोटिङ आइकन होभर ग्र्याडियन्ट अन्त्य',
    usage: 'Floating chat icon background on hover — gradient end',
    usageNepali: 'फ्लोटिङ च्याट आइकनमा 마우स राख्दा देखिने ग्र्याडियन्ट अन्त्य रङ',
    defaultHex: '#e11d48',
  },
  {
    key: 'badge',
    name: 'Unread Notification Badge',
    nameNepali: 'अइतिरहेको सूचना ब्याज रङ',
    usage: 'Unread count badge on the floating chat icon (red circle with number)',
    usageNepali: 'फ्लोटिङ च्याट आइकनमा अइतिरहेको सन्देश संख्या देखाउने ब्याज (रातो गोलो)',
    defaultHex: '#dc2626',
  },
  {
    key: 'minimizeButton',
    name: 'Popup Minimize Button',
    nameNepali: 'च्याट पपअप ले सिम्पलाइज गर्ने बटन रङ',
    usage: 'Bottom-right minimize chevron button inside the open chat popup',
    usageNepali: 'च्याट पपअप खुल्दा तल दायाँतिर रहेको सिम्पलाइज (तल ળવાનું ચિહ્ન) બટનનો રંગ',
    defaultHex: '#e11d48',
  },
  {
    key: 'minimizeButtonHover',
    name: 'Popup Minimize Button Hover',
    nameNepali: 'च्याट पपअप ले सिम्पलाइज गर्ने बटन होभर रङ',
    usage: 'Minimize button background on hover state',
    usageNepali: 'सिम्पलाइज बटनमा 마우स राख्दा देखिने रङ',
    defaultHex: '#be123c',
  },
];

export const AdvancedColorPicker: React.FC = () => {
  const { settings, updateColor, updateChatColor } = useDesignStore();
  const { lang, t } = useLanguageStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            <span>{t('विस्तृत रङ अनुकूलन (कलर पिकर)', 'Advanced Color Customizer')}</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'प्रणालीका प्रत्येक दृश्य तत्वको रङ र त्यसको प्रयोग क्षेत्र हेर्नुहोस् र आफ्नै रोजाइ अनुसार बदल्नुहोस्।',
              'Review current color values, where they are applied in the portal, and customize to your exact hex codes.'
            )}
          </p>
        </div>

        {settings.selectedPresetId === 'custom' && (
          <span className="self-start sm:self-auto px-2.5 py-1 bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 rounded-full text-[11px] font-bold flex items-center gap-1 border border-amber-300 dark:border-amber-700">
            <Sparkles className="size-3" />
            <span>{t('कस्टम रङ लागू छ', 'Custom Palette Active')}</span>
          </span>
        )}
      </div>

      {/* Grid of Color Controls with Current Value & Where It's Used */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COLOR_DEFINITIONS.map((def) => {
          const currentColor = settings.colors[def.key];
          return (
            <div
              key={def.key}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {lang === 'ne' ? def.nameNepali : def.name}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {currentColor.toUpperCase()}
                  </span>
                </div>

                {/* Where is this used? */}
                <div className="mt-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                    {t('प्रयोग क्षेत्र / Where Applied:', 'Where Applied:')}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                    {lang === 'ne' ? def.usageNepali : def.usage}
                  </p>
                </div>
              </div>

              {/* Color Input Controls */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="relative flex items-center cursor-pointer">
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => updateColor(def.key, e.target.value)}
                    className="sr-only"
                    id={`color-picker-${def.key}`}
                  />
                  <div
                    className="size-8 rounded-lg border-2 border-slate-300 dark:border-slate-600 shadow-inner cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: currentColor }}
                    title={t('रङ छान्न क्लिक गर्नुहोस्', 'Click to choose color')}
                  />
                </label>

                <input
                  type="text"
                  value={currentColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith('#') && val.length <= 9) {
                      updateColor(def.key, val);
                    }
                  }}
                  placeholder="#000000"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                />

                {currentColor.toLowerCase() !== def.defaultHex.toLowerCase() && (
                  <button
                    type="button"
                    onClick={() => updateColor(def.key, def.defaultHex)}
                    className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 transition-colors font-medium"
                    title={t('मौलिक रङमा फर्काउनुहोस्', 'Reset to default')}
                  >
                    {t('रिसेट', 'Reset')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 3: Chat Floating Icon Colors */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="size-4 text-primary" />
              <span>{t('च्याट फ्लोटिङ आइकन रङ सेटिङ', 'Chat Floating Icon Color Settings')}</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('फ्लोटिङ च्याट आइकन र च्याट विन्डोभरको रङ छान्नुहोस्', 'Choose colors for the floating chat icon and chat window elements')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CHAT_COLOR_DEFINITIONS.map((def) => {
            const currentValue = settings.chatColors[def.key];
            return (
              <div key={def.key} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'ne' ? def.nameNepali : def.name}
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                    {lang === 'ne' ? def.usageNepali : def.usage}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={currentValue}
                        onChange={(e) => updateChatColor(def.key, e.target.value)}
                        className="size-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                        style={{ height: '2rem', width: '2rem' }}
                      />
                      <span className="ml-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">{currentValue}</span>
                    </div>
                    {(currentValue !== def.defaultHex) && (
                      <button
                        type="button"
                        onClick={() => updateChatColor(def.key, def.defaultHex)}
                        className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 transition-colors font-medium"
                        title={t('मौलिक रङमा फर्काउनुहोस्', 'Reset to default')}
                      >
                        {t('रिसेट', 'Reset')}
                      </button>
                    )}
                  </div>
                </div>
                <div
                  className="size-10 rounded-lg border border-slate-200 dark:border-slate-600 shrink-0"
                  style={{ backgroundColor: currentValue }}
                  title={currentValue}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Mini Preview Card */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Eye className="size-4 text-primary" />
          <span>{t('प्रत्यक्ष दृश्य पूर्वावलोकन', 'Live UI Preview Component')}</span>
        </div>

        <div
          className="p-4 rounded-xl border shadow-xs transition-colors"
          style={{
            backgroundColor: settings.colors.canvas,
            borderColor: 'var(--color-outline-variant, #bdcac0)',
          }}
        >
          <div
            className="p-4 rounded-xl shadow-sm border transition-colors space-y-3"
            style={{
              backgroundColor: settings.colors.card,
              borderColor: 'rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="size-3 rounded-full animate-pulse"
                  style={{ backgroundColor: settings.colors.accent }}
                />
                <span className="text-xs font-bold" style={{ color: settings.colors.primary }}>
                  {t('उनको बचत तथा ऋण सहकारी संस्था', 'Unako SACCOS Portal')}
                </span>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: settings.colors.accentLight,
                  color: settings.colors.primary,
                }}
              >
                {t('सक्रिय प्रणाली', 'System Live')}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t(
                'यो पूर्वावलोकनले तपाईंले चयन गर्नुभएको रङ संयोजन वास्तविक बटन र कार्डहरूमा कस्तो देखिन्छ भन्ने देखाउँछ।',
                'This preview demonstrates how your chosen palette renders across buttons, badges, and surfaces.'
              )}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all"
                style={{ backgroundColor: settings.colors.primary }}
              >
                {t('प्राथमिक बटन', 'Primary Action')}
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all"
                style={{ backgroundColor: settings.colors.secondary }}
              >
                {t('सहायक बटन', 'Secondary Action')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
