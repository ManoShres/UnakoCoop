import React from 'react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

export const HomeWhyChooseSection: React.FC = () => {
  const { t } = useLanguageStore();

  return (
    <section className="w-full bg-surface-dark py-space-2xl px-gutter text-surface-bright">
      <div className="max-w-7xl mx-auto space-y-space-xl">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-end">
          <div className="lg:col-span-8 space-y-space-xs">
            <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-dark-card text-brand-accent-lime font-label-sm text-label-sm">
              <span>{t('किन उनको सहकारी ?', 'WHY CHOOSE UNAKO')}</span>
            </div>
            <h2 className="font-headline-2xl text-headline-2xl text-surface-bright leading-tight">
              {t('बैंकिङ भन्दा उत्तम।', 'Banking, But Better.')}<br />
              <span className="text-brand-accent-lime">{t('किनकि यसको मालिक तपाईं हुनुहुन्छ।', 'Because You Own It.')}</span>
            </h2>
            <p className="font-body-lg text-body-lg text-tertiary-fixed-dim max-w-2xl pt-2">
              {t(
                'वाणिज्य बैंकहरूले नाफा बाहिर लैजान्छन्, तर उनको बचत तथा ऋण सहकारी सदस्यहरूकै स्वामित्वमा सञ्चालित छ। हरेक रुपैयाँ नाफा उच्च प्रतिफल, सस्तो ब्याज र समुदायको विकासमा लगानी हुन्छ।',
                'Unlike commercial banks that prioritize distant corporate shareholders, Unako Savings & Credit Cooperative is owned directly by members. We reinvest every single rupee of profit back into better returns, concessional rates, and regional development.'
              )}
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <div className="bg-surface-dark-card p-space-md rounded-xl space-y-2 max-w-xs">
              <div className="flex items-center gap-2 text-brand-accent-lime">
                <span className="material-symbols-outlined text-[20px]">handshake</span>
                <span className="font-label-md text-label-md">{t('लोकतान्त्रिक नियन्त्रण', 'Democratic Control')}</span>
              </div>
              <p className="font-body-sm text-body-sm text-tertiary-fixed-dim">
                {t(
                  'शेयर जति भए पनि हरेक सदस्यलाई बराबर १ भोटको अधिकार हुन्छ। नेतृत्व चयन साधारण सभामा लोकतान्त्रिक रूपमा गरिन्छ।',
                  'Every member holds equal voting rights regardless of share value. You elect leadership directly at the AGM.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-md">
          {/* Pillar 1 */}
          <div className="bg-surface-dark-card p-space-lg rounded-xl space-y-space-sm hover:bg-surface-dark-card/80 transition-all">
            <div className="w-10 h-10 rounded-lg bg-primary/20 text-brand-accent-lime flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">price_check</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-surface-bright">
              {t('न्यून ब्याजदरको कर्जा', 'Low Interest Loans')}
            </h4>
            <p className="font-body-sm text-body-sm text-tertiary-fixed-dim">
              {t(
                '८% बाट सुरु हुने घट्दो किस्ता कर्जा, कुनै अनावश्यक जरिवाना बिना।',
                'Rates starting as low as 8% p.a. on a diminishing balance method with no surprise penalty traps.'
              )}
            </p>
          </div>
          {/* Pillar 2 */}
          <div className="bg-surface-dark-card p-space-lg rounded-xl space-y-space-sm hover:bg-surface-dark-card/80 transition-all">
            <div className="w-10 h-10 rounded-lg bg-primary/20 text-brand-accent-lime flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-surface-bright">
              {t('वार्षिक लाभांश वितरण', 'Annual Dividends')}
            </h4>
            <p className="font-body-sm text-body-sm text-tertiary-fixed-dim">
              {t(
                'वार्षिक साधारण सभापछि सहकारीको बचत तथा शेयर लाभांश सिधै तपाईंको खातामा जम्मा हुन्छ।',
                'Share in yearly institutional profits directly credited into your member savings account after AGM clearance.'
              )}
            </p>
          </div>
          {/* Pillar 3 */}
          <div className="bg-surface-dark-card p-space-lg rounded-xl space-y-space-sm hover:bg-surface-dark-card/80 transition-all">
            <div className="w-10 h-10 rounded-lg bg-primary/20 text-brand-accent-lime flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-surface-bright">
              {t('पारदर्शी शुल्क प्रणाली', 'Zero Hidden Fees')}
            </h4>
            <p className="font-body-sm text-body-sm text-tertiary-fixed-dim">
              {t(
                '१००% पारदर्शी हिसाबकिताब, सार्वजनिक शुल्क सूची र कुनै लुकेको खाता नवीकरण शुल्क छैन।',
                '100% transparent ledger, public tariff cards, and zero hidden statement or monthly maintenance charges.'
              )}
            </p>
          </div>
          {/* Pillar 4 */}
          <div className="bg-surface-dark-card p-space-lg rounded-xl space-y-space-sm hover:bg-surface-dark-card/80 transition-all">
            <div className="w-10 h-10 rounded-lg bg-primary/20 text-brand-accent-lime flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">how_to_vote</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-surface-bright">
              {t('समुदायद्वारा सञ्चालित', 'Community Led')}
            </h4>
            <p className="font-body-sm text-body-sm text-tertiary-fixed-dim">
              {t(
                'एक सदस्य एक मत। हाम्रा सञ्चालक तथा ऋण उपसमितिका सदस्यहरू यहीँ देउखुरीमै बसोबास गर्नुहुन्छ।',
                'One member, one vote. Our supervisory boards and lending committees live right here in Deukhuri.'
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
