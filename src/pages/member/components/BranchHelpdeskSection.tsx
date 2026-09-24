import React from 'react';
import { Headset, HelpCircle, Phone, RotateCcw, Send, Siren, Smartphone, Store } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface BranchHelpdeskSectionProps {
  onGrievanceSubmit: (e: React.FormEvent) => void;
  onOpenGrievanceModal?: () => void;
}

export function BranchHelpdeskSection({ onGrievanceSubmit, onOpenGrievanceModal }: BranchHelpdeskSectionProps) {
  const { t } = useLanguageStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
      {/* Helpdesk Ticket Submission Form */}
      <div className="lg:col-span-7 bg-surface-card rounded-2xl p-space-lg md:p-space-xl shadow-sm space-y-space-md">
        <div className="flex items-center justify-between pb-space-xs">
          <div>
            <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
              {t('सदस्य सहायता तथा सिधा सम्पर्क', 'Member Support & Direct Contact')}
            </span>
            <div className="flex items-center gap-3">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                {t('सदस्य गुनासो तथा सहायता डेस्क', 'Member Grievance & Helpdesk')}
              </h3>
              {onOpenGrievanceModal && (
                <button
                  type="button"
                  onClick={onOpenGrievanceModal}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-brand-accent-light px-2.5 py-1 rounded-full hover:bg-primary hover:text-on-primary transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('स्थिति ट्र्याक गर्नुहोस्', 'Track Ticket')}</span>
                </button>
              )}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {t(
                'शाखा प्रबन्धक वा ऋण अधिकृतलाई सिधै आफ्नो समस्या वा जिज्ञासा पठाउनुहोस्। २४ कार्यघण्टाभित्र सम्पर्क गरिनेछ।',
                'Send your query or grievance directly to the branch manager or loan officer. We will respond within 24 business hours.'
              )}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center flex-shrink-0">
            <Headset className="w-5 h-5" />
          </div>
        </div>

        <form className="space-y-space-md" id="grievance-form" onSubmit={onGrievanceSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="space-y-space-xs">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                {t('सम्बन्धित अधिकारी', 'Recipient Desk')}
              </label>
              <select className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                <option>{t('भोजराज थारु - शाखा प्रबन्धक', 'Bhojraj Tharu - Branch Manager')}</option>
                <option>{t('सुनिता चौधरी - कर्जा अधिकृत', 'Sunita Chaudhary - Loan Officer')}</option>
                <option>{t('दिपक घिमिरे - बचत तथा नगद काउन्टर प्रमुख', 'Dipak Ghimire - Cash Counter Head')}</option>
                <option>{t('लेखा सुपरिवेक्षण समिति', 'Supervisory / Grievance Committee')}</option>
              </select>
            </div>
            <div className="space-y-space-xs">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                {t('विषयको प्रकार', 'Category')}
              </label>
              <select className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                <option>{t('साधारण सभा तथा लाभांश सम्बन्धी', 'AGM & Dividend Related')}</option>
                <option>{t('ऋण किस्ता र ब्याज गणना सोधपुछ', 'Loan EMI & Interest Inquiries')}</option>
                <option>{t('कृषि बीमा तथा बाली क्षतिपूर्ति दाबी', 'Crop Insurance & Claim Support')}</option>
                <option>{t('मोबाइल बैंकिङ / SMS अलर्ट समस्या', 'Mobile Banking & SMS Alert Issues')}</option>
                <option>{t('अन्य सामान्य सुझाव वा गुनासो', 'General Grievance / Feedback')}</option>
              </select>
            </div>
          </div>
          <div className="space-y-space-xs">
            <label className="font-label-sm text-label-sm font-semibold text-on-surface">
              {t('गुनासो वा सन्देश', 'Grievance / Inquiry Message')}
            </label>
            <textarea
              className="w-full p-space-md bg-surface-canvas rounded-xl font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder={t(
                'तपाईंको समस्या वा जिज्ञासा स्पष्ट शब्दमा लेख्नुहोस् (उदा. मेरो ऋण किस्ता भुक्तानीको भौचर विवरण अद्यावधिक हुन बाँकी छ...)',
                'Write your issue or inquiry clearly (e.g., My loan EMI payment voucher is pending update...)'
              )}
              rows={4}
            ></textarea>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md items-center">
            <div className="space-y-space-xs">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                {t('संलग्न प्रमाण (वैकल्पिक)', 'Attachment (Optional)')}
              </label>
              <input
                className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-surface-container file:text-primary hover:file:bg-surface-container-high cursor-pointer"
                type="file"
              />
            </div>
            <div className="flex items-center gap-space-sm pt-4 sm:pt-0">
              <button
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold h-12 rounded-xl transition-all shadow-md flex items-center justify-center gap-space-xs"
                type="submit"
              >
                <Send className="w-5 h-5" />
                <span>{t('गुनासो दर्ता गर्नुहोस्', 'Submit Grievance')}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Staff Contact Strip */}
        <div className="pt-space-md border-t border-transparent bg-surface-canvas p-space-md rounded-xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <img
              className="w-12 h-12 rounded-full object-cover shadow-sm"
              alt="Branch manager"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9GOgRNPxd8nuOiF0ieun0XTVItD3qZwl3DXkeqG4aMNBYWkEgpWQaZCy5P09zTnZkL6BS74Yvr23WfZ7sV8voY5_4EhhMcx2wXloUIVvCSwENKP521yqCczVgAFuCTaDMdpEhqlmYY1jYJAwk34vd4VNn6kF4XbtuSotlmFSB1z6f2JNaCVPHO-WBiGhFYeBiM9F7hzvgPq82FnCgGfTbwEmUd-eIjmxJvQohGJV9obmw1UDH1UtH"
            />
            <div>
              <p className="font-label-md text-label-md font-bold text-on-surface">{t('भोजराज थारु', 'Bhojraj Tharu')}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {t('शाखा प्रबन्धक, चैनपुर मुख्य कार्यालय', 'Branch Manager, Chainpur Main Office')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <a
              className="bg-surface-card hover:bg-surface-container text-on-surface px-space-md py-space-xs rounded-xl font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-sm"
              href="tel:+97782412055"
            >
              <Phone className="w-4.5 h-4.5 text-primary" />
              <span>०८२-४१२०५५</span>
            </a>
            <a
              className="bg-surface-card hover:bg-surface-container text-on-surface px-space-md py-space-xs rounded-xl font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-sm"
              href="tel:9857821099"
            >
              <Smartphone className="w-4.5 h-4.5 text-status-success" />
              <span>9857821099</span>
            </a>
          </div>
        </div>
      </div>

      {/* Right Side: Branch Information & Member FAQs */}
      <div className="lg:col-span-5 space-y-space-md">
        {/* Office Schedule & Contact Plate */}
        <div className="bg-surface-card rounded-2xl p-space-lg shadow-sm space-y-space-sm">
          <div className="flex items-center gap-space-sm">
            <Store className="w-6 h-6 text-primary" />
            <div>
              <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {t('शाखा कार्यालय विवरण', 'Branch Office Details')}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t('चैनपुर, गढवा गाउँपालिका-५, देउखुरी, दाङ', 'Chainpur, Gadhwa Rural Municipality-5, Deukhuri, Dang')}
              </p>
            </div>
          </div>
          <div className="space-y-space-xs pt-space-xs">
            <div className="flex justify-between py-1.5 px-space-sm bg-surface-canvas rounded-lg text-sm">
              <span className="text-on-surface-variant font-medium">{t('कार्यालय खुल्ने दिन:', 'Office Days:')}</span>
              <span className="font-bold text-on-surface">{t('आइतबार देखि शुक्रबार', 'Sunday to Friday')}</span>
            </div>
            <div className="flex justify-between py-1.5 px-space-sm bg-surface-canvas rounded-lg text-sm">
              <span className="text-on-surface-variant font-medium">{t('कार्यालय समय:', 'Office Hours:')}</span>
              <span className="font-bold text-on-surface">{t('बिहान १०:०० - दिउँसो ४:००', '10:00 AM - 4:00 PM')}</span>
            </div>
            <div className="flex justify-between py-1.5 px-space-sm bg-surface-canvas rounded-lg text-sm">
              <span className="text-on-surface-variant font-medium">{t('नगद काउन्टर समय:', 'Cash Counter Hours:')}</span>
              <span className="font-bold text-on-surface">{t('बिहान १०:१५ - दिउँसो ३:०० सम्म', '10:15 AM - 3:00 PM')}</span>
            </div>
            <div className="flex justify-between py-1.5 px-space-sm bg-surface-canvas rounded-lg text-sm">
              <span className="text-on-surface-variant font-medium">{t('इमेल सम्पर्क:', 'Email Contact:')}</span>
              <span className="font-bold text-primary">info@unako.coop.np</span>
            </div>
          </div>
        </div>

        {/* Member Frequently Asked Questions */}
        <div className="bg-surface-card rounded-2xl p-space-lg shadow-sm space-y-space-sm">
          <div className="flex items-center justify-between pb-space-xs">
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-space-xs">
              <HelpCircle className="w-5 h-5 text-primary" />
              {t('सदस्यहरूले बारम्बार सोध्ने प्रश्नहरू', 'Frequently Asked Questions')}
            </h4>
          </div>
          {/* FAQ Item 1 */}
          <details className="group bg-surface-canvas rounded-xl p-space-md cursor-pointer transition-all">
            <summary className="font-label-md text-label-md font-bold text-on-surface flex items-center justify-between list-none">
              <span>{t('१. साधारण सभामा लाभांश कसरी भुक्तानी हुन्छ?', '1. How is dividend paid after the AGM?')}</span>
              <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">
                expand_more
              </span>
            </summary>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm pt-space-xs leading-relaxed">
              {t(
                'साधारण सभाले १२% लाभांश पारित गरेपश्चात, नगद लाभांश सिधै तपाईंको बचत खातामा जम्मा हुनेछ र बोनस सेयर सेयर प्रमाणपत्र खातामा स्वतः अद्यावधिक गरिनेछ।',
                'Once the AGM approves the 12% dividend, cash dividend is credited directly to your savings account (UKO-SAV) and bonus shares are credited to your share certificate.'
              )}
            </p>
          </details>
          {/* FAQ Item 2 */}
          <details className="group bg-surface-canvas rounded-xl p-space-md cursor-pointer transition-all">
            <summary className="font-label-md text-label-md font-bold text-on-surface flex items-center justify-between list-none">
              <span>{t('२. कृषि तथा पशुधन कर्जामा बीमा दाबी कसरी गर्ने?', '2. How to file insurance claims for agro & livestock loans?')}</span>
              <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">
                expand_more
              </span>
            </summary>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm pt-space-xs leading-relaxed">
              {t(
                'पशुधनको क्षति भएमा २४ घण्टाभित्र वडाको पशु प्राविधिकबाट मुचुल्का गराई कर्णट्याग सहित संस्थाको ऋण शाखामा सम्पर्क राख्नुपर्छ। हाम्रो बीमा डेस्कले ७ दिनभित्र दाबी भुक्तानी प्रक्रिया सम्पन्न गर्दछ।',
                'In case of livestock loss, notify within 24 hours with an assessment from the ward technician along with the ear tag. Our insurance desk settles claims within 7 days.'
              )}
            </p>
          </details>
          {/* FAQ Item 3 */}
          <details className="group bg-surface-canvas rounded-xl p-space-md cursor-pointer transition-all">
            <summary className="font-label-md text-label-md font-bold text-on-surface flex items-center justify-between list-none">
              <span>{t('३. मेरो व्यक्तिगत केवाईसी नवीकरण गर्न के कागजात चाहिन्छ?', '3. What documents are required to renew my personal KYC?')}</span>
              <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">
                expand_more
              </span>
            </summary>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm pt-space-xs leading-relaxed">
              {t(
                'नेपाली नागरिकताको प्रतिलिपि, हालसालै खिचिएको २ प्रति पासपोर्ट साइज फोटो, बिजुलीको बिल वा स्थानीय ठेगाना प्रमाणित कागजात लिएर आउनुहोस् वा यसै पोर्टलको प्रोफाइल खण्डबाट अनलाइन अपलोड गर्नुहोस्।',
                'Submit a copy of your citizenship certificate, 2 passport-size photos, utility bill or address proof, or upload online via your profile section.'
              )}
            </p>
          </details>
        </div>

        {/* Emergency Hotline Card */}
        <div className="bg-gradient-to-r from-surface-dark to-slate-900 rounded-2xl p-space-lg text-surface-canvas shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-brand-accent-lime font-bold uppercase">
                {t('२४/७ आपतकालीन सहायता', '24/7 Emergency Support')}
              </span>
              <h5 className="font-headline-sm text-headline-sm font-bold text-surface-canvas mt-0.5">
                {t('मोबाइल बैंकिङ ब्लक वा आकस्मिक सोधपुछ', 'Mobile Banking Block or Emergency Queries')}
              </h5>
              <p className="font-tabular-mono text-tabular-mono text-brand-accent-lime font-bold text-lg mt-1">
                {t('हटलाइन: +९७७ ९८५७८-२१०९९', 'Hotline: +977 98578-21099')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Siren className="w-5 h-5 text-brand-accent-lime" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
