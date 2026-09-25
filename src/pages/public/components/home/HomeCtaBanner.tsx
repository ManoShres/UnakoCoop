import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

export const HomeCtaBanner: React.FC = () => {
  const { t } = useLanguageStore();

  return (
    <section className="w-full py-space-xl px-gutter bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="bg-brand-accent-lime rounded-2xl p-space-xl sm:p-space-2xl text-center space-y-space-md shadow-xl text-surface-dark relative overflow-hidden">
          {/* Subtle concentric decorative pattern */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-surface-bright/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 space-y-space-sm max-w-3xl mx-auto">
            <h2 className="font-headline-2xl text-headline-2xl text-surface-dark font-black tracking-tight leading-tight">
              {t('आजै आफ्नो समृद्धिको यात्रा सुरु गर्नुहोस्', 'Start Your Financial Journey Today')}
            </h2>
            <p className="font-body-lg text-body-lg text-surface-dark/90 font-medium">
              {t(
                'उनको सहकारीसँग सुरक्षित भविष्य निर्माण गरिरहेका १२,०००+ सदस्यहरूसँग जोडिनुहोस्। न्यूनतम शुल्क, उच्च प्रतिफल र सामुदायिक बैंकिङ।',
                'Join over 12,000 members who are building a secure future with Unako Cooperative. Low fees, high returns, and community-first banking.'
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-space-md pt-space-md">
              <Link
                to="/member/verification"
                className="inline-flex items-center gap-space-xs px-space-xl py-3.5 rounded-full font-label-md text-label-md text-surface-bright bg-surface-dark hover:bg-surface-dark/90 transition-all shadow-lg font-bold"
              >
                <span>{t('रु. १०० मा आजै सदस्यता लिनुहोस्', 'Join Now For NPR 100')}</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-space-xs px-space-xl py-3.5 rounded-full font-label-md text-label-md text-surface-dark bg-surface-bright/80 hover:bg-surface-bright transition-all font-bold"
              >
                <span>{t('सम्पर्क गर्नुहोस्', 'Contact Us')}</span>
              </Link>
            </div>
            <p className="font-label-sm text-label-sm text-surface-dark/80 pt-space-xs font-semibold tracking-wide">
              {t('झन्झटरहित प्रक्रिया • छिटो स्वीकृति • एक सदस्य एक मत', 'No credit check required • Instant Approval • One Member, One Vote')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
