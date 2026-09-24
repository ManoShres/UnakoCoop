import React from 'react';
import { ArrowRight, CheckCircle2, ClipboardCheck, Headset, MessageCircle, Phone, Scale, UserCheck, Users } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

export const ShgFieldOfficerSection: React.FC = () => {
  const { t } = useLanguageStore();

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
      {/* Field Officer Card (5 Cols) */}
      <div className="lg:col-span-5 bg-surface-card rounded-2xl p-space-lg shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-space-md">
            <span className="px-space-sm py-1 rounded-full bg-brand-accent-light text-primary font-label-sm text-label-sm font-bold flex items-center gap-1">
              <Headset className="w-4 h-4" />
              {t('जिम्मेवार फिल्ड सुपरभाइजर', 'Designated Field Supervisor')}
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-status-success" title={t('सक्रिय ड्युटीमा', 'On Active Duty')}></span>
          </div>

          <div className="flex items-start gap-space-md mb-space-md">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center font-extrabold text-headline-md shrink-0">
              {t('सी', 'Si')}
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t('सीता चौधरी', 'Sita Chaudhary')}</h3>
              <p className="font-label-md text-label-md text-primary font-medium">{t('वरिष्ठ फिल्ड सुपरभाइजर (गढवा-४ र ५)', 'Senior Field Supervisor (Gadhwa-4 & 5)')}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t('उनको बचत तथा ऋण सहकारी संस्था लि., मुख्य शाखा गढवा', 'Unako Savings & Credit Cooperative Ltd., Main Branch Gadhwa')}
              </p>
            </div>
          </div>

          <div className="space-y-space-xs bg-surface-canvas rounded-xl p-space-md mb-space-md font-body-sm text-body-sm text-on-surface-variant">
            <div className="flex items-center justify-between">
              <span>{t('तोकिएको कार्यक्षेत्र:', 'Assigned Area:')}</span>
              <span className="font-semibold text-on-surface">{t('वडा नं. ४ र ५ (१४ उपसमूह)', 'Ward No. 4 & 5 (14 SHGs)')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('उपसमूह अनुगमन दिन:', 'Monitoring Days:')}</span>
              <span className="font-semibold text-on-surface">{t('प्रत्येक सोमबार र बुधबार', 'Every Monday & Wednesday')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('कार्यालय कोठा नं.:', 'Office Room No.:')}</span>
              <span className="font-semibold text-on-surface">{t('कक्ष नं. ३ (समुदाय विकास शाखा)', 'Room No. 3 (Community Dev Section)')}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-space-sm">
          <a
            className="w-full flex-1 flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all"
            href="tel:9847800000"
          >
            <Phone className="w-4.5 h-4.5" />
            <span>{t('सिधा सम्पर्क', 'Call Supervisor')}</span>
          </a>
          <button className="w-full sm:w-auto px-space-md py-space-sm rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center justify-center gap-space-xs cursor-pointer">
            <MessageCircle className="w-4.5 h-4.5" />
            <span>{t('सन्देश पठाउनुहोस्', 'Send Message')}</span>
          </button>
        </div>
      </div>

      {/* Bylaws & Group Formation Guidelines (7 Cols) */}
      <div className="lg:col-span-7 bg-surface-dark text-surface rounded-2xl p-space-lg shadow-xl relative overflow-hidden flex flex-col justify-between">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex items-center gap-space-xs text-secondary-fixed">
              <Scale className="w-5 h-5" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                {t('सहकारी विनियम तथा कार्यविधि २०८०', 'Cooperative Bylaws & Procedures 2080')}
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-surface-variant">{t('मापदण्ड निर्देशिका', 'Criteria Guidelines')}</span>
          </div>

          <h3 className="font-headline-md text-headline-md text-surface font-bold mb-space-xs">
            {t('नयाँ उपसमूह गठन प्रक्रिया तथा आधारभूत मापदण्ड', 'New SHG Formation Process & Basic Criteria')}
          </h3>
          <p className="font-body-md text-body-md text-surface-variant mb-space-lg">
            {t(
              'तपाईंको टोल वा बस्तीमा स्वावलम्बी उपसमूह गठन गरी नियमित बचत, ऋण तथा सीपमूलक तालिम लिन निम्न प्रक्रिया पूरा गर्नुपर्नेछ:',
              'To form a self-help group in your community for savings, credit, and skill trainings, complete the following steps:'
            )}
          </p>

          {/* 3-Step Process Graphic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-lg">
            <div className="bg-surface-dark-card rounded-xl p-space-md relative overflow-hidden">
              <span className="absolute top-2 right-2 text-headline-lg font-black text-brand-accent-lime/20 font-headline-lg">
                {t('०१', '01')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-brand-accent-lime mb-space-xs">
                <Users className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-label-md text-label-md font-bold text-surface mb-1">
                {t('कम्तीमा १५ सदस्य', 'At least 15 Members')}
              </h4>
              <p className="font-body-sm text-body-sm text-surface-variant">
                {t(
                  'एउटै टोल, बस्ती वा कार्यक्षेत्रका १५ देखि ३० जना स्थानीय बासिन्दाको भेला हुनुपर्नेछ।',
                  'A gathering of 15 to 30 local residents from the same community/ward.'
                )}
              </p>
            </div>

            <div className="bg-surface-dark-card rounded-xl p-space-md relative overflow-hidden">
              <span className="absolute top-2 right-2 text-headline-lg font-black text-brand-accent-lime/20 font-headline-lg">
                {t('०२', '02')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-brand-accent-lime mb-space-xs">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-label-md text-label-md font-bold text-surface mb-1">
                {t('संयोजक छनोट', 'Select Leadership')}
              </h4>
              <p className="font-body-sm text-body-sm text-surface-variant">
                {t(
                  'सर्वसम्मत रूपमा १ संयोजक, १ सह-संयोजक र १ कोषाध्यक्ष चयन गरी माइन्युट उठाउनुपर्ने।',
                  'Unanimously elect 1 coordinator, 1 co-coordinator, and 1 treasurer with signed minutes.'
                )}
              </p>
            </div>

            <div className="bg-surface-dark-card rounded-xl p-space-md relative overflow-hidden">
              <span className="absolute top-2 right-2 text-headline-lg font-black text-brand-accent-lime/20 font-headline-lg">
                {t('०३', '03')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-brand-accent-lime mb-space-xs">
                <ClipboardCheck className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-label-md text-label-md font-bold text-surface mb-1">
                {t('सहकारीमा दर्ता', 'Register with Cooperative')}
              </h4>
              <p className="font-body-sm text-body-sm text-surface-variant">
                {t(
                  'संस्थाको तोकिएको फारम भरी वडा सिफारिस सहित मुख्य शाखा वा फिल्ड सुपरभाइजर समक्ष पेश गर्ने।',
                  'Submit filled application with ward recommendation to the main branch or field officer.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs">
          <p className="font-body-sm text-body-sm text-surface-variant flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-brand-accent-lime" />
            {t(
              'मासिक न्यूनतम रु. ३०० देखि रु. ५०० सामूहिक बचत अनिवार्य',
              'Minimum NPR 300 to NPR 500 mandatory monthly group savings'
            )}
          </p>
          <button className="w-full sm:w-auto px-space-md py-space-sm rounded-xl bg-brand-accent-lime text-surface-dark font-label-md text-label-md font-bold hover:bg-secondary-fixed transition-all flex items-center justify-center gap-space-xs cursor-pointer">
            <span>{t('गठन नियमावली पुस्तिका पढ्नुहोस्', 'Read Formation Bylaws Handbook')}</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
