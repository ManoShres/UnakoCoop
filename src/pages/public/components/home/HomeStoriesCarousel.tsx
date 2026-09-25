import React from 'react';
import { Star } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

export const HomeStoriesCarousel: React.FC = () => {
  const { t } = useLanguageStore();

  return (
    <section className="w-full bg-surface-container-low py-space-2xl px-gutter">
      <div className="max-w-7xl mx-auto space-y-space-xl">
        <div className="text-center space-y-space-xs max-w-2xl mx-auto">
          <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
            {t('दाङ उपत्यकाका आवाजहरू', 'Voices of Dang Valley')}
          </span>
          <h2 className="font-headline-2xl text-headline-2xl text-on-surface">
            {t('वास्तविक सदस्य, वास्तविक प्रगति', 'Real Members, Real Growth')}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t(
              'हाम्रो सहकारीले देउखुरीका परिवार र उद्यमीहरूलाई कसरी सशक्त बनाउँदैछ।',
              'How our community cooperative empowers families and entrepreneurs across Deukhuri.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {/* Story 1 */}
          <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md flex flex-col justify-between">
            <div className="space-y-space-sm">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-body-md text-body-md text-on-surface italic">
                {t(
                  '"मैले आफ्नो तोरी तेल मिल २ जनाबाट बढाएर ८ जनालाई रोजगारी दिने बनाएँ। उनको सहकारीले झन्झट बिना मेरो व्यवसायको सम्भावना हेरेर कर्जा दियो।"',
                  '"I expanded my commercial mustard processing mill from a 2-person outfit to 8 employees. Unako evaluated my business feasibility with care, without bureaucratic delays."'
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-space-xs border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-brand-accent-light text-primary flex items-center justify-center font-bold">
                RP
              </div>
              <div>
                <p className="font-headline-sm text-headline-sm text-on-surface text-base">
                  {t('रामप्रसाद चौधरी', 'Ram Prasad Chaudhary')}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {t('गढवा-३, कृषि उद्यमी', 'Gadhwa-3, Agro Entrepreneur')}
                </p>
              </div>
            </div>
          </div>

          {/* Story 2 */}
          <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md flex flex-col justify-between">
            <div className="space-y-space-sm">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-body-md text-body-md text-on-surface italic">
                {t(
                  '"नारी उत्थान योजनामार्फत हाम्रो महिला समूहले नियमित बचत गरेर सिलाई मेसिन किन्यो। अहिले हामी आफ्ना छोराछोरीको पढाइ आफैं धान्न सक्छौं।"',
                  '"Through the Nari Utthan scheme, our women\'s handicraft group saved regularly and secured concessional capital to buy sewing machinery. We now support our kids\' schooling independently."'
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-space-xs border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-brand-accent-light text-primary flex items-center justify-center font-bold">
                SM
              </div>
              <div>
                <p className="font-headline-sm text-headline-sm text-on-surface text-base">
                  {t('शान्ता माया थापा', 'Shanta Maya Thapa')}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {t('चैनपुर, महिला समूह संयोजक', "Chainpur, Women's SHG Leader")}
                </p>
              </div>
            </div>
          </div>

          {/* Story 3 */}
          <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md flex flex-col justify-between">
            <div className="space-y-space-sm">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-body-md text-body-md text-on-surface italic">
                {t(
                  '"अरू बैंकले झन्झटिलो धितो माग्दा उनको सहकारीले मेरी छोरीको नर्सिङ पढाइका लागि साथ दियो। आज उनी स्वास्थ्यकर्मी बनेर सेवा गर्दैछिन्।"',
                  '"When other banks demanded complex collateral, Unako stood beside my family to finance my daughter\'s nursing education. Today she is a registered healthcare professional."'
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-space-xs border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-brand-accent-light text-primary flex items-center justify-center font-bold">
                KP
              </div>
              <div>
                <p className="font-headline-sm text-headline-sm text-on-surface text-base">
                  {t('केशवराज पोखरेल', 'Keshav Raj Pokharel')}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {t('लमही, ज्येष्ठ सदस्य', 'Lamahi, Senior Citizen Member')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
