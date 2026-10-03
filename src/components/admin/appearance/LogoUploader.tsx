import React, { useRef, useState } from 'react';
import { useDesignStore } from '../../../store/useDesignStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { Image, UploadCloud, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

export const LogoUploader: React.FC = () => {
  const { settings, setCustomLogo } = useDesignStore();
  const { t } = useLanguageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentLogo = settings.customLogoUrl || '/unako-logo.png';
  const isCustom = Boolean(settings.customLogoUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 2MB for localStorage safety
    if (file.size > 2 * 1024 * 1024) {
      setError(
        t(
          'तस्बिरको आकार २ एमबी भन्दा सानो हुनुपर्छ।',
          'Logo file size must be less than 2MB for fast loading.'
        )
      );
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError(
        t(
          'कृपया मान्य तस्बिर फाइल (PNG, JPG, SVG, WEBP) मात्र छान्नुहोस्।',
          'Please select a valid image file (PNG, JPG, SVG, WEBP).'
        )
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCustomLogo(base64);
      setSuccess(
        t(
          'नयाँ लोगो सफलतापूर्वक अपलोड गरियो र प्रणालीमा लागू भयो!',
          'Custom logo uploaded and applied across portal!'
        )
      );
      setTimeout(() => setSuccess(null), 3000);
    };
    reader.onerror = () => {
      setError(t('तस्बिर पढ्न सकिएन।', 'Failed to read image file.'));
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setCustomLogo(null);
    setError(null);
    setSuccess(
      t(
        'मौलिक उनको लोगो पुनः स्थापित गरियो!',
        'Default Unako logo restored!'
      )
    );
    setTimeout(() => setSuccess(null), 3000);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Image className="size-4 text-primary" />
          <span>{t('सहकारीको आधिकारिक लोगो', 'Cooperative Official Brand Logo')}</span>
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t(
            'सदस्य पोर्टल, नेभिगेसन बार, वार्षिक प्रतिवेदन र मुद्दती प्रमाणपत्रहरूमा देखिने लोगो बदल्नुहोस्।',
            'Upload a custom cooperative logo for member portals, navigation bars, certificates, and passbooks.'
          )}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 border border-rose-200 dark:border-rose-800">
          <AlertCircle className="size-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="size-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center gap-6">
        {/* Logo Preview Box */}
        <div className="flex flex-col items-center">
          <div className="size-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 shadow-inner">
            <img
              src={currentLogo}
              alt="Cooperative Logo"
              className="max-h-full max-w-full object-contain drop-shadow-xs"
            />
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1.5">
            {isCustom ? t('कस्टम लोगो', 'Custom Upload') : t('पूर्वनिर्धारित', 'Default Brand')}
          </span>
        </div>

        {/* Upload Action Area */}
        <div className="flex-1 space-y-3 w-full">
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              <strong>{t('सिफारिस:', 'Recommendation:')}</strong>{' '}
              {t(
                'पारदर्शी पृष्ठभूमि भएको PNG वा SVG फाइल (५००x५०० पिक्सेल वा सो भन्दा कम, बढीमा २ एमबी)।',
                'Transparent background PNG or SVG recommended (Square or horizontal banner, max 2MB).'
              )}
            </p>
          </div>

          {/* `relative` keeps the sr-only file input (position: absolute) anchored
              inside this card, so it can never inflate the document scroll area. */}
          <div className="relative flex flex-wrap items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/svg+xml, image/webp"
              className="sr-only"
              id="custom-logo-file-input"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <UploadCloud className="size-4" />
              <span>{t('नयाँ लोगो छान्नुहोस्', 'Upload New Logo')}</span>
            </button>

            {isCustom && (
              <button
                type="button"
                onClick={handleResetLogo}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>{t('मौलिक लोगोमा फर्काउनुहोस्', 'Reset to Default')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
