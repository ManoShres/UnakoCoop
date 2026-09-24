import React from 'react';
import { Link } from 'react-router-dom';
import { useCoopStore } from '../../../../store/useCoopStore';
import { useLanguageStore } from '../../../../store/useLanguageStore';

export const HomeHeroSection: React.FC = () => {
  const { coopSettings } = useCoopStore();
  const { t } = useLanguageStore();

  return (
    <div className="lg:col-span-6 space-y-3.5 sm:space-y-4 lg:space-y-5">
      {/* Trust badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-dark-card shadow-sm text-xs">
        <span className="material-symbols-outlined text-brand-accent-lime text-[18px]">verified_user</span>
        <span className="font-label-sm text-label-sm text-surface-bright">
          {t('दाङ र देउखुरी उपत्यकाका १,०००+ सक्रिय सदस्यहरूको विश्वास', 'Trusted by +1,000 active members in Dang & Deukhuri Valley')}
        </span>
      </div>

      {/* Headline & Subtitle */}
      <div className="space-y-space-md">
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-headline text-surface-bright tracking-tight font-extrabold leading-[1.12]">
          {t('सँगै मिलेर समृद्धि बनाऔं।', 'Grow Wealth')} <span className="text-brand-accent-lime">{t('', 'Together.')}</span>
        </h1>
        <p className="text-sm sm:text-base text-tertiary-fixed-dim max-w-lg leading-relaxed font-normal">
          {t(
            'सामुदायिक विश्वास र आधुनिक वित्तीय प्रविधिको संगम। स्मार्ट बचत, सहज कर्जा र लुम्बिनी प्रदेशमा समुन्नत भविष्य निर्माण गर्नुहोस्।',
            'Experience a cooperative that combines community trust with modern financial tools. Save smarter, borrow easier, and build a flourishing financial future in Lumbini Province.'
          )}
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Link
          to="/member/verification"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm text-surface-dark bg-surface-bright hover:bg-surface-container-high transition-all shadow-md font-bold"
        >
          <span>{t('नयाँ खाता खोल्नुहोस्', 'Open Member Account')}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>

        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-surface-bright bg-surface-dark-card hover:bg-surface-dark-card/80 border border-white/10 transition-all font-semibold"
        >
          <span>{t('सम्पर्क गर्नुहोस्', 'Contact Us')}</span>
        </Link>
      </div>

      {/* Key micro trust props */}
      <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-brand-accent-lime"></span>
          <span className="font-label-sm text-label-sm text-tertiary-fixed-dim">
            {t(`दर्ता नं. ${coopSettings.regNo}`, `Reg No. ${coopSettings.regNo}`)}
          </span>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-brand-accent-lime"></span>
          <span className="font-label-sm text-label-sm text-tertiary-fixed-dim">{t('अडिट प्रमाणित', 'Audit Compliant')}</span>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-brand-accent-lime"></span>
          <span className="font-label-sm text-label-sm text-tertiary-fixed-dim">{t('१००% लोकतान्त्रिक', '100% Democratic')}</span>
        </div>
      </div>
    </div>
  );
};
