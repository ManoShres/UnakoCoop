import React from 'react';
import { Eye, Gavel, Info, Landmark, Vote } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface AgmAgendasSectionProps {
  onOpenBallotModal?: () => void;
}

export function AgmAgendasSection({ onOpenBallotModal }: AgmAgendasSectionProps) {
  const { t } = useLanguageStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
      {/* 4 Major Agendas */}
      <div className="lg:col-span-7 bg-surface-card rounded-2xl p-space-lg shadow-sm space-y-space-md">
        <div className="flex items-center justify-between pb-space-xs">
          <div>
            <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
              {t('पारदर्शिता र निर्णय प्रक्रिया', 'Transparency & Decision Process')}
            </span>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              {t('साधारण सभाका प्रमुख प्रस्तावहरू', 'Major AGM Agendas')}
            </h3>
          </div>
          <Gavel className="w-5 h-5 text-on-surface-variant" />
        </div>
        <div className="space-y-space-sm">
          {/* Agenda 1 */}
          <div className="bg-surface-canvas p-space-md rounded-xl hover:bg-surface-container-low transition-colors">
            <div className="flex items-start gap-space-md">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                {t('१', '1')}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-base">
                    {t('आर्थिक वर्ष २०८०/८१ को वार्षिक लेखापरीक्षण तथा प्रतिवेदन अनुमोदन', 'Approval of FY 2080/81 Annual Audit & Report')}
                  </h4>
                  <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">
                    {t('प्रस्ताव १', 'Agenda 1')}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  {t(
                    'लेखापरीक्षक भोजराज एण्ड एसोसिएट्सद्वारा सम्पादित वासलात, नाफा-नोक्सान हिसाब र नगद प्रवाह विवरण छलफल तथा पारित गर्ने।',
                    'Discussion and approval of Balance Sheet, P&L, and Cash Flow audited by Bhojraj & Associates.'
                  )}
                </p>
              </div>
            </div>
          </div>
          {/* Agenda 2 */}
          <div className="bg-surface-canvas p-space-md rounded-xl hover:bg-surface-container-low transition-colors">
            <div className="flex items-start gap-space-md">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                {t('२', '2')}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-base">
                    {t('१२% सेयर लाभांश तथा संरक्षित पुँजी फिर्ता कोष वितरण स्वीकृत', 'Approval of 12% Share Dividend & Patronage Refund')}
                  </h4>
                  <span className="bg-brand-accent-light text-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">
                    {t('लाभांश प्रस्ताव', 'Dividend Proposal')}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  {t(
                    'कुल खुद बचतबाट ७.५% नगद लाभांश तथा ४.५% बोनस सेयर वितरण गरी सेयर पुँजी अभिवृद्धि गर्ने सञ्चालक समितिको सिफारिस।',
                    'Board recommendation to distribute 7.5% cash dividend and 4.5% bonus shares from net surplus to strengthen capital.'
                  )}
                </p>
              </div>
            </div>
          </div>
          {/* Agenda 3 */}
          <div className="bg-surface-canvas p-space-md rounded-xl hover:bg-surface-container-low transition-colors">
            <div className="flex items-start gap-space-md">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                {t('३', '3')}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-base">
                    {t('नयाँ सञ्चालक समिति तथा लेखा सुपरिवेक्षण समिति निर्वाचन', 'Election of New Board of Directors & Supervisory Committee')}
                  </h4>
                  <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">
                    {t('निर्वाचन', 'Election')}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  {t(
                    'आगामी ४ वर्षे कार्यकालका लागि अध्यक्ष, उपाध्यक्ष, सचिव, कोषाध्यक्ष सहित ७ सदस्यीय समिति र ३ सदस्यीय लेखा सुपरीवेक्षण निर्वाचन।',
                    'Election of 7-member Board and 3-member Supervisory Committee for 4-year term.'
                  )}
                </p>
              </div>
            </div>
          </div>
          {/* Agenda 4 */}
          <div className="bg-surface-canvas p-space-md rounded-xl hover:bg-surface-container-low transition-colors">
            <div className="flex items-start gap-space-md">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                {t('४', '4')}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-base">
                    {t('संस्थाको विनियम संशोधन र कृषि लगानी विशेष कार्यविधि', 'Amendments to Cooperative By-Laws & Agro Financing Directives')}
                  </h4>
                  <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">
                    {t('नीतिगत', 'Policy')}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  {t(
                    'स्थानीय कृषि उद्यमी, मौरीपालन र पशुपालन कर्जा सीमा विस्तार गर्न तथा अनलाइन सेवा विस्तारसम्बन्धी विनियम दफा संशोधन गर्ने।',
                    'Amending policy clauses to expand credit limits for agro-entrepreneurs, beekeeping, livestock, and online services.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate & Board Manifesto Preview */}
      <div className="lg:col-span-5 bg-surface-card rounded-2xl p-space-lg shadow-sm flex flex-col justify-between space-y-space-md">
        <div>
          <div className="flex items-center justify-between pb-space-xs">
            <div>
              <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                {t('नेतृत्व र सुशासन', 'Leadership & Governance')}
              </span>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {t('निर्वाचन तथा उम्मेदवार विवरण', 'Election & Candidate Profiles')}
              </h3>
            </div>
            {onOpenBallotModal && (
              <button
                type="button"
                onClick={onOpenBallotModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-xl font-bold text-xs shadow-sm hover:bg-primary-container transition-all"
              >
                <Vote className="w-4 h-4" />
                <span>{t('मतदान गर्नुहोस्', 'Vote Now')}</span>
              </button>
            )}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {t('संस्थाको निष्पक्ष निर्वाचन कार्यतालिका २०८१ र उम्मेदवारहरूको प्रतिबद्धता पत्र तल अवलोकन गर्नुहोस्:', 'View the fair election schedule 2081 and candidate manifesto commitments below:')}
          </p>

          {/* Candidate Cards Mini Bento */}
          <div className="space-y-space-sm mt-space-md">
            <div className="flex items-center justify-between p-space-sm bg-surface-canvas rounded-xl hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-space-sm">
                <img
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                  alt="Ram Bahadur Tharu"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAYVlYbC_Ij0IQV9PPvC5_y4Y2hvScpL30FmKh_NvdjIeEpD4DU_k-enAZaGLgCJlH4QCAxQ6_M4lRJn_7Rq60txTT3kNE1QWe-D1p1LQ1e5XMalbR4JaVWAdQ-yl2NON2mySVY9QiLGU6lA5MvCmqpXCTwHtlPPxzmvcFFdFUZwKutYF9xk36jNVYn8CmeLg1_ZdHSd1mIdJiGtthrmspWGUp68WFY1utnfyPKe4vct-p-DGlelf-"
                />
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface">{t('राम बहादुर थारु', 'Ram Bahadur Tharu')}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{t('अध्यक्ष पदका उम्मेदवार | प्यानल A', 'Candidate for Chairperson | Panel A')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert(t("राम बहादुर थारुको घोषणापत्र खुल्दैछ...", "Opening Ram Bahadur Tharu manifesto..."))}
                className="text-primary hover:text-on-secondary-container font-label-sm text-label-sm font-semibold flex items-center gap-1"
              >
                <span>{t('घोषणापत्र', 'Manifesto')}</span>
                <Eye className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-space-sm bg-surface-canvas rounded-xl hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-space-sm">
                <img
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                  alt="Shanta Chaudhary"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA63_qpOWStcsD95zQr5ygKenzK_VIYMNl6e5p4nIxn5WhUsLN-3ZDXgb6y0Yl9PKmCDbF91JjHUiRk11ltzaavZtQO9nQNvCJeIcUr-HHAKY7RMr7eevhovHWWnkFfY0_9pTyy21nLYJyimXd_eVqFoAjLg5aHk4GJJZhEgpsd3JOlUwA4YzwSK_goep3HosmB5Ba7X985Wm0UWnFbUjhfX1RoBhJQwwFZespsJrGHpcOM3gTjjH3-"
                />
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface">{t('शान्ता चौधरी', 'Shanta Chaudhary')}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{t('उपाध्यक्ष पदकी उम्मेदवार | समावेशी प्यानल', 'Candidate for Vice-Chairperson | Inclusive Panel')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert(t("शान्ता चौधरीको घोषणापत्र खुल्दैछ...", "Opening Shanta Chaudhary manifesto..."))}
                className="text-primary hover:text-on-secondary-container font-label-sm text-label-sm font-semibold flex items-center gap-1"
              >
                <span>{t('घोषणापत्र', 'Manifesto')}</span>
                <Eye className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-space-sm bg-surface-canvas rounded-xl hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface">{t('लेखा सुपरीवेक्षण समिति (३ पद)', 'Supervisory Committee (3 Seats)')}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{t('कुल ६ जनाको उम्मेदवारी दर्ता', 'Total 6 Candidates Registered')}</p>
                </div>
              </div>
              <span className="bg-surface-container text-on-surface-variant text-label-sm font-label-sm px-2 py-1 rounded-md">{t('नामावली', 'Nominee List')}</span>
            </div>
          </div>
        </div>

        {/* Voting Instructions / Info */}
        <div className="bg-surface-container-low p-space-md rounded-xl">
          <div className="flex items-start gap-space-sm">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-xs text-on-surface-variant leading-relaxed">
              <span className="font-bold text-on-surface">{t('मतदान नियम:', 'Voting Rule:')}</span>{' '}
              {t(
                "सहकारी ऐन बमोजिम 'एक सदस्य, एक मत' सिद्धान्त लागू हुनेछ। डिजिटल वा प्रतिनिधि मतका लागि चैत्र २० गतेभित्र फारम प्रमाणीकरण गरिसक्नुपर्नेछ।",
                "Per Cooperative Act, 'One Member, One Vote' applies. Digital or proxy ballots must be verified by Chaitra 20."
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
