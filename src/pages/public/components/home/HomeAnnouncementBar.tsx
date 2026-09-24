import React from 'react';
import { useCoopStore } from '../../../../store/useCoopStore';
import { useLanguageStore } from '../../../../store/useLanguageStore';

export const HomeAnnouncementBar: React.FC = () => {
  const { coopSettings } = useCoopStore();
  const { t } = useLanguageStore();

  return (
    <div className="w-full bg-surface-dark text-on-tertiary">
      <div className="max-w-7xl mx-auto px-gutter flex items-center justify-between py-2 text-label-sm font-label-sm">
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-brand-accent-lime"></span>
            <span className="text-surface-bright font-medium">
              {t('ब्याजदर: बचतमा १०% सम्म | कर्जा ८% बाट सुरु', 'Rates: Savings up to 10% p.a. | Loans from 8% p.a.')}
            </span>
          </div>
          <span className="hidden md:inline text-outline-variant">•</span>
          <span className="hidden md:inline text-surface-container-high">
            {t(`दर्ता नं. ${coopSettings.regNo} | सहकारी विभाग`, `Reg No. ${coopSettings.regNoEnglish || coopSettings.regNo} | Department of Cooperatives`)}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-space-lg">
          <span className="text-surface-container-high">{t(coopSettings.addressNepali || coopSettings.address, coopSettings.addressEnglish || coopSettings.address)}</span>
          <a href={`tel:${coopSettings.phone.split('/')[0].trim()}`} className="text-surface-bright font-medium hover:text-brand-accent-lime transition-colors">
            {t('सम्पर्क:', 'Call:')} {t(coopSettings.phone, coopSettings.phoneEnglish || coopSettings.phone)}
          </a>
        </div>
      </div>
    </div>
  );
};
