import React from 'react';
import { BadgeDollarSign, BookOpen, Calendar, CalendarDays, ChevronRight, Download, IdCard, MapPin, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useDesignStore } from '../../../store/useDesignStore';

interface AgmHeroSectionProps {
  onOpenAgmPassModal: () => void;
}

export function AgmHeroSection({ onOpenAgmPassModal }: AgmHeroSectionProps) {
  const { t } = useLanguageStore();
  const features = useDesignStore((s) => s.settings.features);

  return (
    <>
      {/* Sub-Navigation Header / Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mb-space-xs">
            <span>{t('संस्थागत सुशासन', 'Institutional Governance')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-semibold">{t('वार्षिक साधारण सभा र सहयोग केन्द्र', 'Annual General Meeting & Helpdesk')}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight flex items-center gap-space-sm">
            {t('सहकारी सुशासन तथा सदस्य सहायता केन्द्र', 'Cooperative Governance & Helpdesk')}
            <span className="bg-brand-accent-light text-primary text-label-sm font-label-sm px-space-sm py-0.5 rounded-full uppercase tracking-wider font-bold">
              FY 2080/81
            </span>
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {t(
              'सदस्य नियन्त्रित लोकतान्त्रिक अभ्यास, वित्तीय पारदर्शिता र उत्तरदायी सेवा केन्द्र।',
              'Member-controlled democratic governance, financial transparency, and responsive support portal.'
            )}
          </p>
        </div>
        {/* Quick Stat Pills */}
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="bg-surface-card px-space-md py-space-sm rounded-xl shadow-sm flex items-center gap-space-sm">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">{t('सहकारी ऐन २०७४', 'Cooperative Act 2074')}</p>
              <p className="font-label-md text-label-md font-bold text-on-surface">{t('पूर्ण अनुपालन (१००%)', 'Full Compliance (100%)')}</p>
            </div>
          </div>
          <div className="bg-surface-card px-space-md py-space-sm rounded-xl shadow-sm flex items-center gap-space-sm">
            <div className="h-2.5 w-2.5 rounded-full bg-status-success animate-pulse"></div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">{t('प्रतिनिधि दर्ता', 'Proxy Registration')}</p>
              <p className="font-label-md text-label-md font-bold text-status-success">{t('खुला गरिएको छ', 'Open')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero: 31st Annual General Meeting Showcase */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-dark text-on-tertiary shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-surface-dark via-surface-dark/95 to-primary/40 pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 p-space-lg md:p-space-xl lg:p-space-2xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
          {/* Left Column: Notice & Details */}
          <div className="lg:col-span-7 space-y-space-md">
            <div className="inline-flex items-center gap-space-xs bg-surface-dark-card px-space-md py-space-xs rounded-full">
              <Calendar className="w-4.5 h-4.5 text-brand-accent-lime" />
              <span className="font-label-sm text-label-sm text-surface-canvas font-semibold tracking-wide uppercase">
                {t('आधिकारिक सूचना केन्द्र', 'Official Notice Hub')}
              </span>
            </div>
            <div>
              <span className="font-label-md text-label-md text-brand-accent-lime font-bold">
                {t('३१औं वार्षिक साधारण सभा', '31st Annual General Meeting')}
              </span>
              <h2 className="font-headline-xl text-headline-xl text-surface-canvas font-extrabold tracking-tight mt-1 leading-tight">
                {t('३१औं वार्षिक साधारण सभा', '31st Annual General Meeting (AGM)')}
              </h2>
              <p className="font-body-md text-body-md text-slate-300 mt-2">
                {t(
                  'आदरणीय सेयर सदस्यज्यू, हाम्रो उनको बचत तथा ऋण सहकारी संस्था लि. को ३१औं वार्षिक साधारण सभा तपसिलको मिति, समय र स्थानमा आयोजना हुन गइरहेकोले यहाँको सक्रिय उपस्थितिको लागि हार्दिक आमन्त्रण गर्दछौं।',
                  'Dear Shareholder Member, The 31st Annual General Meeting of Unako Savings and Credit Cooperative Ltd. is scheduled as follows. You are cordially invited to participate.'
                )}
              </p>
            </div>
            {/* Venue & Time Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
              <div className="bg-surface-dark-card p-space-md rounded-xl">
                <CalendarDays className="w-5 h-5 text-brand-accent-lime" />
                <p className="font-label-sm text-label-sm text-slate-400 mt-1">{t('सभा मिति', 'Meeting Date')}</p>
                <p className="font-label-md text-label-md font-bold text-surface-canvas">{t('चैत्र २५, २०८१', 'Apr 07, 2025')}</p>
                <p className="font-label-sm text-label-sm text-slate-400">{t('बिहान ११:०० बजे', '11:00 AM')}</p>
              </div>
              <div className="bg-surface-dark-card p-space-md rounded-xl">
                <MapPin className="w-5 h-5 text-brand-accent-lime" />
                <p className="font-label-sm text-label-sm text-slate-400 mt-1">{t('स्थान', 'Venue')}</p>
                <p className="font-label-md text-label-md font-bold text-surface-canvas">{t('गढवा टाउन हल', 'Gadhwa Town Hall')}</p>
                <p className="font-label-sm text-label-sm text-slate-400">{t('गढवा, देउखुरी, दाङ', 'Gadhwa, Deukhuri, Dang')}</p>
              </div>
              <div className="bg-surface-dark-card p-space-md rounded-xl">
                <BadgeDollarSign className="w-5 h-5 text-brand-accent-lime" />
                <p className="font-label-sm text-label-sm text-slate-400 mt-1">{t('लाभांश प्रस्ताव', 'Proposed Dividend')}</p>
                <p className="font-headline-sm text-headline-sm font-bold text-brand-accent-lime">{t('१२.००%', '12.00%')}</p>
                <p className="font-label-sm text-label-sm text-slate-400">{t('नगद + बोनस सेयर', 'Cash + Bonus Shares')}</p>
              </div>
            </div>
            {/* Call to actions */}
            <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
              {features.enableAgmPass && (
                <button
                  className="bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold px-space-lg py-space-sm rounded-xl transition-all flex items-center gap-space-xs shadow-md"
                  id="open-proxy-modal"
                  onClick={onOpenAgmPassModal}
                >
                  <UserCheck className="w-5 h-5" />
                  <span>{t('डिजिटल उपस्थिति वा प्रोक्सी दर्ता', 'Digital Attendance or Proxy Registration')}</span>
                </button>
              )}
              <a
                className="bg-surface-dark-card hover:bg-slate-700 text-surface-canvas font-label-md text-label-md font-medium px-space-md py-space-sm rounded-xl transition-all flex items-center gap-space-xs"
                href="javascript:void(0)"
                onClick={() => alert(t("सहकारी विधान तथा नियमावली २०८० PDF डाउनलोड हुँदैछ...", "Downloading Cooperative By-Laws PDF..."))}
              >
                <BookOpen className="w-5 h-5" />
                <span>{t('साधारण सभा प्रतिवेदन पुस्तिका', 'AGM Annual Report (PDF)')}</span>
                <Download className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </div>
          {/* Right Column: Visual Photo & Community Presence */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="relative rounded-xl overflow-hidden shadow-lg aspect-video lg:aspect-[4/3]">
              <img
                className="w-full h-full object-cover"
                alt="Cooperative annual general meeting"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGSwSCW9KjmO9DhZDbZCGiaUPchIUb3ylyKpB0ZmBGQq-Ne4r7tQCz63VTb34T3Rk0-Q--w5-U98DM9yWZA2TD7Knm4N5UZlYzPor4nnQAhCRgLFhCvAsVZBFVZYVYIqb4CDb4-4Up2vi9tVMss6_vIy1h36DUx2gyZYpOKrm-8Yp4KsH1BMmA-nBpbXt1gH5U2Qwad38bDMwsN9e6J_ozANzPas0oQebmW4gbDv9sGOz95AZqzBmA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-surface-canvas">
                <span className="bg-surface-dark/80 px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-brand-accent-lime" />
                  {t('अपेक्षित उपस्थिति: २,४००+ सेयर सदस्य', 'Expected Attendance: 2,400+ Members')}
                </span>
                <span className="font-tabular-mono text-slate-300">{t('गढवा मुख्य शाखा', 'Gadhwa Main Branch')}</span>
              </div>
            </div>
            {/* Quick Notice Callout */}
            <div className="bg-surface-dark-card/90 rounded-xl p-space-md flex items-center gap-space-md backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-brand-accent-lime/20 flex items-center justify-center flex-shrink-0">
                <IdCard className="w-5 h-5 text-brand-accent-lime" />
              </div>
              <div className="text-sm">
                <p className="font-label-md text-label-md font-bold text-surface-canvas">{t('सदस्य परिचयपत्र अनिवार्य', 'Member ID Card Mandatory')}</p>
                <p className="font-body-sm text-body-sm text-slate-300">
                  {t('सभास्थल प्रवेशका लागि नागरिकता प्रमाणपत्र वा सहकारी सदस्य पासबुक साथमा ल्याउनुहोला।', 'Please bring your Citizenship certificate or cooperative member passbook for venue entry.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
