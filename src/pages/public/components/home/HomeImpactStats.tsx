import React from 'react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

export const HomeImpactStats: React.FC = () => {
  const { t, fmtPercent } = useLanguageStore();

  return (
    <section className="w-full bg-surface-canvas py-space-xl px-gutter">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Stat Card 1 */}
          <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-2 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-lg bg-brand-accent-light flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">percent</span>
            </div>
            <div>
              <div className="font-display-stat text-display-stat text-primary font-bold">{fmtPercent(8)}</div>
              <p className="font-headline-sm text-headline-sm text-on-surface">{t('सुरुवाती ब्याजदर', 'Starting Rate')}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t('सहुलियतपूर्ण कृषि तथा लघु कर्जा दर', 'Concessional micro & agro loan rate p.a.')}
              </p>
            </div>
          </div>
          {/* Stat Card 2 */}
          <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-2 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-lg bg-brand-accent-light flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">groups</span>
            </div>
            <div>
              <div className="font-display-stat text-display-stat text-on-surface font-bold">{t('१२,०००+', '12K+')}</div>
              <p className="font-headline-sm text-headline-sm text-on-surface">{t('सक्रिय सदस्यहरू', 'Members')}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t('दाङ र देउखुरीका समुदाय साझेदारहरू', 'Active rural and town cooperative partners')}
              </p>
            </div>
          </div>
          {/* Stat Card 3 */}
          <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-2 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-lg bg-brand-accent-light flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div>
              <div className="font-display-stat text-display-stat text-primary font-bold">{fmtPercent(100)}</div>
              <p className="font-headline-sm text-headline-sm text-on-surface">{t('सुरक्षित निक्षेप', 'Secure')}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t('सुरक्षित कोष र नियमनकारी तरलता', 'Insured deposits and statutory liquidity funds')}
              </p>
            </div>
          </div>
          {/* Stat Card 4 */}
          <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-2 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-lg bg-brand-accent-light flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">account_balance</span>
            </div>
            <div>
              <div className="font-display-stat text-display-stat text-on-surface font-bold">{t('रु. १५ करोड+', 'NPR 150M+')}</div>
              <p className="font-headline-sm text-headline-sm text-on-surface">{t('कुल सम्पत्ति आधार', 'Total Assets')}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t('स्थानीय उद्यमशीलतामा परिचालित पुँजी', 'Capital mobilized for regional entrepreneurship')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
