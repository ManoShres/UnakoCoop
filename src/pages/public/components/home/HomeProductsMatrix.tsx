import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

export const HomeProductsMatrix: React.FC = () => {
  const { t } = useLanguageStore();

  return (
    <section id="savings-schemes" className="w-full bg-surface-canvas py-space-2xl px-gutter scroll-mt-24">
      <div className="max-w-7xl mx-auto space-y-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="space-y-space-xs">
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
              {t('विशिष्टीकृत वित्तीय सेवाहरू', 'Tailored Financial Portfolio')}
            </span>
            <h2 className="font-headline-xl text-headline-xl text-on-surface">
              {t('बचत तथा कर्जा सुविधाहरू', 'Savings & Loan Solutions')}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              {t(
                'दाङका कृषक, साना व्यवसायी, विद्यार्थी र गृहिणीहरूका लागि उपयुक्त पारदर्शी ब्याजदर।',
                'Transparent interest rates tailored to farmers, micro-traders, students, and household caregivers in Dang district.'
              )}
            </p>
          </div>
          <div className="flex items-center gap-space-sm">
            <Link to="/about" className="font-label-md text-label-md text-primary hover:text-secondary flex items-center gap-1 font-semibold">
              <span>{t('हाम्रो बारेमा विस्तृत हेर्नुहोस्', 'View All 8 Savings Plans')}</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>

        {/* Bento Grid of Schemes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {/* Savings Scheme 1 */}
          <div className="bg-surface-card rounded-xl p-space-lg shadow-sm space-y-space-md flex flex-col justify-between">
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-brand-accent-light text-primary font-semibold">
                  {t('सर्वाधिक लोकप्रिय', 'Most Popular')}
                </span>
                <span className="font-headline-sm text-headline-sm text-primary">
                  {t('८.०% वार्षिक', '8.0% p.a.')}
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {t('साधारण सदस्य बचत', 'General Member Savings')}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t(
                  'दैनिक कारोबारका लागि लचिलो बचत, कुनै न्यूनतम ब्यालेन्सको बाध्यता नभएको र दैनिक ब्याज गणना हुने।',
                  'Everyday flexible deposit plan for all registered members with no minimum balance penalty and daily interest calculation.'
                )}
              </p>
              <ul className="space-y-2 pt-2 font-body-sm text-body-sm text-on-surface-variant">
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                  {t('निःशुल्क पासबुक तथा एसएमएस अलर्ट', 'Free passbook & SMS balance alerts')}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                  {t('त्रैमासिक रूपमा खातामै ब्याज जम्मा', 'Interest credited quarterly')}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                  {t('काउन्टरबाट तत्काल भुक्तानी', 'Instant counter withdrawals')}
                </li>
              </ul>
            </div>
            <Link
              to="/member/verification"
              className="w-full text-center py-2.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors font-bold"
            >
              {t('खाता खोल्नुहोस्', 'Apply for Account')}
            </Link>
          </div>

          {/* Savings Scheme 2 */}
          <div className="bg-surface-card rounded-xl p-space-lg shadow-sm space-y-space-md flex flex-col justify-between">
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-brand-accent-light text-primary font-semibold">
                  {t('उच्च प्रतिफल', 'High Yield')}
                </span>
                <span className="font-headline-sm text-headline-sm text-primary">
                  {t('१०.०% वार्षिक', '10.0% p.a.')}
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {t('मुद्दती निक्षेप योजना', 'Fixed Term Deposit')}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t(
                  '१ देखि ५ वर्षका लागि रकम राखी सुरक्षित उच्च प्रतिफल र त्रैमासिक ब्याज भुक्तानी पाउनुहोस्।',
                  'Lock your funds for 1 to 5 years and lock in guaranteed elevated returns with quarterly compounding payout options.'
                )}
              </p>
              <ul className="space-y-2 pt-2 font-body-sm text-body-sm text-on-surface-variant">
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                  {t('मुद्दतीको ९०% सम्म कर्जा सुविधा', 'Loan against deposit up to 90%')}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                  {t('ज्येष्ठ नागरिकलाई थप ०.५% ब्याज', 'Senior citizen +0.5% incentive')}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                  {t('बजार जोखिमबाट पूर्ण सुरक्षित', 'Safe from market volatility')}
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="w-full text-center py-2.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors font-bold"
            >
              {t('मुद्दती सुरु गर्नुहोस्', 'Start Fixed Term')}
            </Link>
          </div>

          {/* Loan Scheme 3 */}
          <div id="loan-products" className="bg-surface-card rounded-xl p-space-lg shadow-sm space-y-space-md flex flex-col justify-between scroll-mt-24">
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-brand-accent-light text-primary font-semibold">
                  {t('सशक्तिकरण', 'Empowerment')}
                </span>
                <span className="font-headline-sm text-headline-sm text-primary">
                  {t('८.५% वार्षिक', '8.5% p.a.')}
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {t('कृषि तथा लघु उद्यम कर्जा', 'Krishi & Micro-Enterprise Loan')}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t(
                  'देउखुरीका किसान, दुग्ध उत्पादक, कुखुरापालक र घरेलु उद्यमीहरूका लागि सहुलियतपूर्ण कर्जा।',
                  'Subsidized credit tailored for Deukhuri farmers, dairy producers, poultry farmers, and cottage business operators.'
                )}
              </p>
              <ul className="space-y-2 pt-2 font-body-sm text-body-sm text-on-surface-variant">
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                  {t('रु. ३,००,००० सम्म विना धितो समूह जमानी', 'No mortgage up to NPR 300,000')}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                  {t('बाली भित्र्याउने समय अनुसार लचिलो किस्ता', 'Flexible harvest seasonal repayment')}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-primary shrink-0" />
                  {t('४८ घण्टाभित्र छिटो कर्जा स्वीकृति', 'Fast approval within 48 hours')}
                </li>
              </ul>
            </div>
            <Link
              to="/member/apply-loan"
              className="w-full text-center py-2.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors font-bold"
            >
              {t('ऋण आवेदन दिनुहोस्', 'Apply for Loan')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
