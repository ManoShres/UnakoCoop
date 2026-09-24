import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../../../../store/useLanguageStore';

export const HomeHowItWorksSection: React.FC = () => {
  const { t, fmtDigits } = useLanguageStore();

  return (
    <section className="w-full bg-surface-container-low py-space-2xl px-gutter">
      <div className="max-w-7xl mx-auto space-y-space-xl">
        <div className="text-center space-y-space-xs max-w-2xl mx-auto">
          <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
            {t('सहज सदस्यता प्रक्रिया', 'Effortless Membership')}
          </span>
          <h2 className="font-headline-2xl text-headline-2xl text-on-surface font-extrabold tracking-tight">
            {t('यसरी जोडिनुहोस्', 'How It Works')}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t('आर्थिक स्वतन्त्रता र सामुदायिक सहकार्यका तीन सरल चरण।', 'Three simple steps to financial freedom and community solidarity.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {/* Step 1 */}
          <div className="bg-surface-card p-space-xl rounded-2xl shadow-sm space-y-space-md flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-brand-accent-light flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[28px]">person_add</span>
                </div>
                <span className="font-headline-2xl text-headline-2xl text-surface-container-highest font-black group-hover:text-primary-container/20 transition-colors">{fmtDigits('01')}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {t('सदस्य बन्नुहोस्', 'Become a Member')}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t(
                  'अनलाइनबाटै वा हाम्रो गढवा चैनपुर कार्यालयमा आई दर्ता गर्नुहोस्। रु. १०० प्रवेश शुल्कमा आजिवन सदस्यता र मताधिकार प्राप्त गर्नुहोस्।',
                  'Register online or visit our Gadhwa Chainpur office. A small one-time entrance fee of NPR 100 gets you lifetime membership status and voting equity.'
                )}
              </p>
            </div>
            <div className="pt-space-md border-t-0 mt-space-md">
              <Link to="/member/verification" className="inline-flex items-center text-primary font-label-md text-label-md hover:underline font-bold">
                <span>{t('अनलाइन ई-केवाईसी उपलब्ध', 'Online e-KYC available')}</span>
                <span className="material-symbols-outlined text-[18px] ml-1">verified</span>
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-surface-card p-space-xl rounded-2xl shadow-sm space-y-space-md flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-brand-accent-light flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[28px]">schedule</span>
                </div>
                <span className="font-headline-2xl text-headline-2xl text-surface-container-highest font-black group-hover:text-primary-container/20 transition-colors">{fmtDigits('02')}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {t('मासिक बचत गर्नुहोस्', 'Save Monthly')}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t(
                  'नियमित रूपमा बचत गर्नुहोस्। मासिक बचतले कर्जा योग्यता बढाउँछ, आकर्षक ब्याज (१०% सम्म) र वार्षिक लाभांश दिलाउँछ।',
                  'Contribute to your mandatory savings. Consistent monthly deposits build your creditworthiness, accumulate guaranteed interest (up to 10%), and earn annual dividends.'
                )}
              </p>
            </div>
            <div className="pt-space-md border-t-0 mt-space-md">
              <Link to="/login" className="inline-flex items-center text-primary font-label-md text-label-md hover:underline font-bold">
                <span>{t('डिजिटल तथा पासबुक सुविधा', 'Automated bank debits')}</span>
                <span className="material-symbols-outlined text-[18px] ml-1">trending_up</span>
              </Link>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-surface-card p-space-xl rounded-2xl shadow-sm space-y-space-md flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-brand-accent-light flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[28px]">credit_card</span>
                </div>
                <span className="font-headline-2xl text-headline-2xl text-surface-container-highest font-black group-hover:text-primary-container/20 transition-colors">{fmtDigits('03')}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {t('सहज कर्जा पाउनुहोस्', 'Access Loans')}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t(
                  '६ महिनाको नियमित बचतपछि जम्मा रकमको २ देखि ३ गुणासम्म सहुलियतपूर्ण उद्यम कर्जा ४८ घण्टाभित्र प्राप्त गर्नुहोस्।',
                  'Qualify for micro and enterprise loans up to 2x-3x your accumulated savings balance after just 6 months of active membership, approved within 48 hours.'
                )}
              </p>
            </div>
            <div className="pt-space-md border-t-0 mt-space-md">
              <Link to="/member/apply-loan" className="inline-flex items-center text-primary font-label-md text-label-md hover:underline font-bold">
                <span>{t('कुनै लुकेको सेवा शुल्क छैन', 'No hidden appraisal fees')}</span>
                <span className="material-symbols-outlined text-[18px] ml-1">speed</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
