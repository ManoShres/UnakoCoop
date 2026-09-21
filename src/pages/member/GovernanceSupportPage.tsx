import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useDesignStore } from '../../store/useDesignStore';

export function GovernanceSupportPage() {
  const { t } = useLanguageStore();
  const customLogoUrl = useDesignStore((s) => s.settings.customLogoUrl);
  const features = useDesignStore((s) => s.settings.features);
  const logoUrl = customLogoUrl || '/unako-logo.png';
  const [showEballotModal, setShowEballotModal] = useState(false);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [showAgmPassModal, setShowAgmPassModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowGrievanceModal(false);
    showToast(t('गुनासो दर्ता भयो!', 'Grievance Ticket Registered!'));
  };

  const handleBallotSubmit = () => {
    setShowEballotModal(false);
    showToast(t('तपाईंको विद्युतीय मत सफलतापूर्वक दर्ता भयो!', 'Your e-Ballot Vote Recorded with Cryptographic Hash!'));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-surface-dark text-white px-5 py-3 rounded-xl shadow-2xl border border-primary/40 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-status-success text-xl">check_circle</span>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Main Governance View */}
      <div className="flex flex-col w-full max-w-[1280px] mx-auto space-y-space-xl">
{/*  Sub-Navigation Header / Context Bar  */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div>
<div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mb-space-xs">
<span>{t('संस्थागत सुशासन', 'Institutional Governance')}</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-semibold">{t('वार्षिक साधारण सभा र सहयोग केन्द्र', 'Annual General Meeting & Helpdesk')}</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight flex items-center gap-space-sm">
        {t('सहकारी सुशासन तथा सदस्य सहायता केन्द्र', 'Cooperative Governance & Helpdesk')}
        <span className="bg-brand-accent-light text-primary text-label-sm font-label-sm px-space-sm py-0.5 rounded-full uppercase tracking-wider font-bold">FY 2080/81</span>
</h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">
        {t(
          'सदस्य नियन्त्रित लोकतान्त्रिक अभ्यास, वित्तीय पारदर्शिता र उत्तरदायी सेवा केन्द्र।',
          'Member-controlled democratic governance, financial transparency, and responsive support portal.'
        )}
      </p>
</div>
{/*  Quick Stat Pills  */}
<div className="flex items-center gap-space-sm flex-wrap">
<div className="bg-surface-card px-space-md py-space-sm rounded-xl shadow-sm flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
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
{/*  Hero: 31st Annual General Meeting Showcase  */}
<div className="relative overflow-hidden rounded-2xl bg-surface-dark text-on-tertiary shadow-xl">
<div className="absolute inset-0 bg-gradient-to-r from-surface-dark via-surface-dark/95 to-primary/40 pointer-events-none"></div>
<div className="absolute -right-20 -bottom-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
<div className="relative z-10 p-space-lg md:p-space-xl lg:p-space-2xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
{/*  Left Column: Notice & Details  */}
<div className="lg:col-span-7 space-y-space-md">
<div className="inline-flex items-center gap-space-xs bg-surface-dark-card px-space-md py-space-xs rounded-full">
<span className="material-symbols-outlined text-brand-accent-lime text-[18px]">event</span>
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
{/*  Venue & Time Cards  */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
<div className="bg-surface-dark-card p-space-md rounded-xl">
<span className="material-symbols-outlined text-brand-accent-lime text-[22px]">calendar_month</span>
<p className="font-label-sm text-label-sm text-slate-400 mt-1">{t('सभा मिति', 'Meeting Date')}</p>
<p className="font-label-md text-label-md font-bold text-surface-canvas">{t('चैत्र २५, २०८१', 'Apr 07, 2025')}</p>
<p className="font-label-sm text-label-sm text-slate-400">{t('बिहान ११:०० बजे', '11:00 AM')}</p>
</div>
<div className="bg-surface-dark-card p-space-md rounded-xl">
<span className="material-symbols-outlined text-brand-accent-lime text-[22px]">pin_drop</span>
<p className="font-label-sm text-label-sm text-slate-400 mt-1">{t('स्थान', 'Venue')}</p>
<p className="font-label-md text-label-md font-bold text-surface-canvas">{t('गढवा टाउन हल', 'Gadhwa Town Hall')}</p>
<p className="font-label-sm text-label-sm text-slate-400">{t('गढवा, देउखुरी, दाङ', 'Gadhwa, Deukhuri, Dang')}</p>
</div>
<div className="bg-surface-dark-card p-space-md rounded-xl">
<span className="material-symbols-outlined text-brand-accent-lime text-[22px]">paid</span>
<p className="font-label-sm text-label-sm text-slate-400 mt-1">{t('लाभांश प्रस्ताव', 'Proposed Dividend')}</p>
<p className="font-headline-sm text-headline-sm font-bold text-brand-accent-lime">{t('१२.००%', '12.00%')}</p>
<p className="font-label-sm text-label-sm text-slate-400">{t('नगद + बोनस सेयर', 'Cash + Bonus Shares')}</p>
</div>
</div>
{/*  Call to actions  */}
<div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
{features.enableAgmPass && (
  <button className="bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold px-space-lg py-space-sm rounded-xl transition-all flex items-center gap-space-xs shadow-md" id="open-proxy-modal" onClick={() => setShowAgmPassModal(true)}>
  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
  <span>{t('डिजिटल उपस्थिति वा प्रोक्सी दर्ता', 'Digital Attendance or Proxy Registration')}</span>
  </button>
)}
<a className="bg-surface-dark-card hover:bg-slate-700 text-surface-canvas font-label-md text-label-md font-medium px-space-md py-space-sm rounded-xl transition-all flex items-center gap-space-xs" href="javascript:void(0)" onClick={() => alert(t("सहकारी विधान तथा नियमावली २०८० PDF डाउनलोड हुँदैछ...", "Downloading Cooperative By-Laws PDF..."))}>
<span className="material-symbols-outlined text-[20px]">menu_book</span>
<span>{t('साधारण सभा प्रतिवेदन पुस्तिका', 'AGM Annual Report (PDF)')}</span>
<span className="material-symbols-outlined text-[16px] text-slate-400">download</span>
</a>
</div>
</div>
{/*  Right Column: Visual Photo & Community Presence  */}
<div className="lg:col-span-5 flex flex-col gap-space-md">
<div className="relative rounded-xl overflow-hidden shadow-lg aspect-video lg:aspect-[4/3]">
<img className="w-full h-full object-cover" data-alt="Modern Nepalese cooperative annual general meeting assembly in Dang Nepal. Attentive local community members, farmers, and women entrepreneurs sitting in a bright civic auditorium decorated with traditional marigold garlands and green cooperative banners. Natural morning documentary photography style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGSwSCW9KjmO9DhZDbZCGiaUPchIUb3ylyKpB0ZmBGQq-Ne4r7tQCz63VTb34T3Rk0-Q--w5-U98DM9yWZA2TD7Knm4N5UZlYzPor4nnQAhCRgLFhCvAsVZBFVZYVYIqb4CDb4-4Up2vi9tVMss6_vIy1h36DUx2gyZYpOKrm-8Yp4KsH1BMmA-nBpbXt1gH5U2Qwad38bDMwsN9e6J_ozANzPas0oQebmW4gbDv9sGOz95AZqzBmA"/>
<div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent"></div>
<div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-surface-canvas">
<span className="bg-surface-dark/80 px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-brand-accent-lime">groups</span> 
{t('अपेक्षित उपस्थिति: २,४००+ सेयर सदस्य', 'Expected Attendance: 2,400+ Members')}
</span>
<span className="font-tabular-mono text-slate-300">{t('गढवा मुख्य शाखा', 'Gadhwa Main Branch')}</span>
</div>
</div>
{/*  Quick Notice Callout  */}
<div className="bg-surface-dark-card/90 rounded-xl p-space-md flex items-center gap-space-md backdrop-blur-sm">
<div className="w-10 h-10 rounded-lg bg-brand-accent-lime/20 flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-brand-accent-lime text-[22px]">badge</span>
</div>
<div className="text-sm">
<p className="font-label-md text-label-md font-bold text-surface-canvas">{t('सदस्य परिचयपत्र अनिवार्य', 'Member ID Card Mandatory')}</p>
<p className="font-body-sm text-body-sm text-slate-300">{t('सभास्थल प्रवेशका लागि नागरिकता प्रमाणपत्र वा सहकारी सदस्य पासबुक साथमा ल्याउनुहोला।', 'Please bring your Citizenship certificate or cooperative member passbook for venue entry.')}</p>
</div>
</div>
</div>
</div>
</div>
{/*  Key Agendas & Voting / Candidate Directory  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
{/*  4 Major Agendas  */}
<div className="lg:col-span-7 bg-surface-card rounded-2xl p-space-lg shadow-sm space-y-space-md">
<div className="flex items-center justify-between pb-space-xs">
<div>
<span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">{t('पारदर्शिता र निर्णय प्रक्रिया', 'Transparency & Decision Process')}</span>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface">{t('साधारण सभाका प्रमुख प्रस्तावहरू', 'Major AGM Agendas')}</h3>
</div>
<span className="material-symbols-outlined text-on-surface-variant text-[28px]">gavel</span>
</div>
<div className="space-y-space-sm">
{/*  Agenda 1  */}
<div className="bg-surface-canvas p-space-md rounded-xl hover:bg-surface-container-low transition-colors">
<div className="flex items-start gap-space-md">
<div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
  {t('१', '1')}
</div>
<div className="flex-1">
<div className="flex items-center justify-between">
<h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-base">{t('आर्थिक वर्ष २०८०/८१ को वार्षिक लेखापरीक्षण तथा प्रतिवेदन अनुमोदन', 'Approval of FY 2080/81 Annual Audit & Report')}</h4>
<span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">{t('प्रस्ताव १', 'Agenda 1')}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
  {t('लेखापरीक्षक भोजराज एण्ड एसोसिएट्सद्वारा सम्पादित वासलात, नाफा-नोक्सान हिसाब र नगद प्रवाह विवरण छलफल तथा पारित गर्ने।', 'Discussion and approval of Balance Sheet, P&L, and Cash Flow audited by Bhojraj & Associates.')}
</p>
</div>
</div>
</div>
{/*  Agenda 2  */}
<div className="bg-surface-canvas p-space-md rounded-xl hover:bg-surface-container-low transition-colors">
<div className="flex items-start gap-space-md">
<div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
  {t('२', '2')}
</div>
<div className="flex-1">
<div className="flex items-center justify-between">
<h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-base">{t('१२% सेयर लाभांश तथा संरक्षित पुँजी फिर्ता कोष वितरण स्वीकृत', 'Approval of 12% Share Dividend & Patronage Refund')}</h4>
<span className="bg-brand-accent-light text-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">{t('लाभांश प्रस्ताव', 'Dividend Proposal')}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
  {t('कुल खुद बचतबाट ७.५% नगद लाभांश तथा ४.५% बोनस सेयर वितरण गरी सेयर पुँजी अभिवृद्धि गर्ने सञ्चालक समितिको सिफारिस।', 'Board recommendation to distribute 7.5% cash dividend and 4.5% bonus shares from net surplus to strengthen capital.')}
</p>
</div>
</div>
</div>
{/*  Agenda 3  */}
<div className="bg-surface-canvas p-space-md rounded-xl hover:bg-surface-container-low transition-colors">
<div className="flex items-start gap-space-md">
<div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
  {t('३', '3')}
</div>
<div className="flex-1">
<div className="flex items-center justify-between">
<h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-base">{t('नयाँ सञ्चालक समिति तथा लेखा सुपरिवेक्षण समिति निर्वाचन', 'Election of New Board of Directors & Supervisory Committee')}</h4>
<span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">{t('निर्वाचन', 'Election')}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
  {t('आगामी ४ वर्षे कार्यकालका लागि अध्यक्ष, उपाध्यक्ष, सचिव, कोषाध्यक्ष सहित ७ सदस्यीय समिति र ३ सदस्यीय लेखा सुपरीवेक्षण निर्वाचन।', 'Election of 7-member Board and 3-member Supervisory Committee for 4-year term.')}
</p>
</div>
</div>
</div>
{/*  Agenda 4  */}
<div className="bg-surface-canvas p-space-md rounded-xl hover:bg-surface-container-low transition-colors">
<div className="flex items-start gap-space-md">
<div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
  {t('४', '4')}
</div>
<div className="flex-1">
<div className="flex items-center justify-between">
<h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-base">{t('संस्थाको विनियम संशोधन र कृषि लगानी विशेष कार्यविधि', 'Amendments to Cooperative By-Laws & Agro Financing Directives')}</h4>
<span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">{t('नीतिगत', 'Policy')}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
  {t('स्थानीय कृषि उद्यमी, मौरीपालन र पशुपालन कर्जा सीमा विस्तार गर्न तथा अनलाइन सेवा विस्तारसम्बन्धी विनियम दफा संशोधन गर्ने।', 'Amending policy clauses to expand credit limits for agro-entrepreneurs, beekeeping, livestock, and online services.')}
</p>
</div>
</div>
</div>
</div>
</div>
{/*  Candidate & Board Manifesto Preview  */}
<div className="lg:col-span-5 bg-surface-card rounded-2xl p-space-lg shadow-sm flex flex-col justify-between space-y-space-md">
<div>
<div className="flex items-center justify-between pb-space-xs">
<div>
<span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">{t('नेतृत्व र सुशासन', 'Leadership & Governance')}</span>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface">{t('निर्वाचन तथा उम्मेदवार विवरण', 'Election & Candidate Profiles')}</h3>
</div>
<span className="material-symbols-outlined text-primary text-[28px]">how_to_vote</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
  {t('संस्थाको निष्पक्ष निर्वाचन कार्यतालिका २०८१ र उम्मेदवारहरूको प्रतिबद्धता पत्र तल अवलोकन गर्नुहोस्:', 'View the fair election schedule 2081 and candidate manifesto commitments below:')}
</p>
{/*  Candidate Cards Mini Bento  */}
<div className="space-y-space-sm mt-space-md">
<div className="flex items-center justify-between p-space-sm bg-surface-canvas rounded-xl hover:bg-surface-container transition-colors">
<div className="flex items-center gap-space-sm">
<img className="w-12 h-12 rounded-full object-cover shadow-sm" data-alt="Portrait of a trustworthy elderly Nepalese male cooperative chairman wearing a traditional Dhaka topi and formal suit with clean office background in Dang Nepal. Warm respectful expression." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAYVlYbC_Ij0IQV9PPvC5_y4Y2hvScpL30FmKh_NvdjIeEpD4DU_k-enAZaGLgCJlH4QCAxQ6_M4lRJn_7Rq60txTT3kNE1QWe-D1p1LQ1e5XMalbR4JaVWAdQ-yl2NON2mySVY9QiLGU6lA5MvCmqpXCTwHtlPPxzmvcFFdFUZwKutYF9xk36jNVYn8CmeLg1_ZdHSd1mIdJiGtthrmspWGUp68WFY1utnfyPKe4vct-p-DGlelf-"/>
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">{t('राम बहादुर थारु', 'Ram Bahadur Tharu')}</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('अध्यक्ष पदका उम्मेदवार | प्यानल A', 'Candidate for Chairperson | Panel A')}</p>
</div>
</div>
<button className="text-primary hover:text-on-secondary-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
<span>{t('घोषणापत्र', 'Manifesto')}</span>
<span className="material-symbols-outlined text-[16px]">visibility</span>
</button>
</div>
<div className="flex items-center justify-between p-space-sm bg-surface-canvas rounded-xl hover:bg-surface-container transition-colors">
<div className="flex items-center gap-space-sm">
<img className="w-12 h-12 rounded-full object-cover shadow-sm" data-alt="Portrait of an empowered Nepalese woman cooperative leader wearing a traditional sari with gentle smile. Professional studio lighting, representing grassroots female leadership in rural microfinance." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA63_qpOWStcsD95zQr5ygKenzK_VIYMNl6e5p4nIxn5WhUsLN-3ZDXgb6y0Yl9PKmCDbF91JjHUiRk11ltzaavZtQO9nQNvCJeIcUr-HHAKY7RMr7eevhovHWWnkFfY0_9pTyy21nLYJyimXd_eVqFoAjLg5aHk4GJJZhEgpsd3JOlUwA4YzwSK_goep3HosmB5Ba7X985Wm0UWnFbUjhfX1RoBhJQwwFZespsJrGHpcOM3gTjjH3-"/>
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">{t('शान्ता चौधरी', 'Shanta Chaudhary')}</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('उपाध्यक्ष पदकी उम्मेदवार | समावेशी प्यानल', 'Candidate for Vice-Chairperson | Inclusive Panel')}</p>
</div>
</div>
<button className="text-primary hover:text-on-secondary-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
<span>{t('घोषणापत्र', 'Manifesto')}</span>
<span className="material-symbols-outlined text-[16px]">visibility</span>
</button>
</div>
<div className="flex items-center justify-between p-space-sm bg-surface-canvas rounded-xl hover:bg-surface-container transition-colors">
<div className="flex items-center gap-space-sm">
<div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold">
<span className="material-symbols-outlined text-[24px]">account_balance</span>
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
{/*  Voting Instructions / Info  */}
<div className="bg-surface-container-low p-space-md rounded-xl">
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 mt-0.5">info</span>
<div className="text-xs text-on-surface-variant leading-relaxed">
<span className="font-bold text-on-surface">{t('मतदान नियम:', 'Voting Rule:')}</span> {t("सहकारी ऐन बमोजिम 'एक सदस्य, एक मत' सिद्धान्त लागू हुनेछ। डिजिटल वा प्रतिनिधि मतका लागि चैत्र २० गतेभित्र फारम प्रमाणीकरण गरिसक्नुपर्नेछ।", "Per Cooperative Act, 'One Member, One Vote' applies. Digital or proxy ballots must be verified by Chaitra 20.")}
</div>
</div>
</div>
</div>
</div>
{/*  Interactive Proxy / Attendance Registration Section (Toggleable Tabbed Interface)  */}
<div className="bg-surface-card rounded-2xl shadow-sm overflow-hidden" id="attendance-section">
<div className="p-space-lg bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div>
<span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">{t('डिजिटल सहभागिता सुविधा', 'Digital Participation')}</span>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mt-0.5">
  {t('साधारण सभा डिजिटल उपस्थिति वा प्रतिनिधि दर्ता', 'AGM Digital Attendance or Proxy Registration')}
</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
  {t(
    'यदि तपाई भौतिक रूपमा उपस्थित हुन असमर्थ हुनुहुन्छ भने आफ्नो तर्फबाट आधिकारिक प्रतिनिधिको नाम दर्ता गर्नुहोस् वा अनलाइन उपस्थिति जनाउनुहोस्।',
    'If you are unable to attend in person, register your authorized proxy or record your digital attendance online.'
  )}
</p>
</div>
{/*  Segmented Plan Switcher  */}
<div className="bg-surface-dark-card p-1 rounded-xl flex items-center self-start md:self-auto">
<button className="px-space-md py-space-xs rounded-lg font-label-sm text-label-sm font-bold bg-primary text-on-primary transition-all" id="tab-self-attendance">
  {t('स्वयं अनलाइन उपस्थिति', 'Self Online Attendance')}
</button>
<button className="px-space-md py-space-xs rounded-lg font-label-sm text-label-sm font-bold text-slate-300 hover:text-surface-canvas transition-all" id="tab-proxy-register">
  {t('प्रतिनिधि चयन', 'Select Proxy')}
</button>
</div>
</div>
{/*  Self Attendance View  */}
<div className="p-space-lg md:p-space-xl" id="view-self">
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
<div className="space-y-space-xs">
<label className="font-label-sm text-label-sm font-semibold text-on-surface">{t('सदस्यको नाम', 'Member Name')}</label>
<input className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-label-md text-label-md text-on-surface font-semibold" disabled={true} type="text" value="Hari Prasad Chaudhary"/>
<p className="text-xs text-on-surface-variant">{t('लगइन गरिएको खाताबाट स्वतः भरिएको', 'Auto-filled from logged-in account')}</p>
</div>
<div className="space-y-space-xs">
<label className="font-label-sm text-label-sm font-semibold text-on-surface">{t('सदस्यता नम्बर', 'Member ID')}</label>
<input className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-tabular-mono text-tabular-mono text-on-surface font-semibold" disabled={true} type="text" value="UKO-2070-08842"/>
<p className="text-xs text-on-surface-variant">{t('शाखा: चैनपुर, गढवा-५, दाङ', 'Branch: Chainpur, Gadhwa-5, Dang')}</p>
</div>
<div className="space-y-space-xs">
<label className="font-label-sm text-label-sm font-semibold text-on-surface">{t('सम्पर्क मोबाइल', 'Verified Mobile')}</label>
<input className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-tabular-mono text-tabular-mono text-on-surface font-semibold" disabled={true} type="text" value="98478***** (Verified)"/>
<p className="text-xs text-status-success font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">check_circle</span> {t('OTP प्रमाणीकरण तयार', 'OTP Verification Ready')}
</p>
</div>
</div>
<div className="mt-space-lg pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm text-sm text-on-surface-variant">
<input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary" id="consent-self" type="checkbox"/>
<label className="font-body-sm text-body-sm" htmlFor="consent-self">
  {t(
    'म चैत्र २५ गते आयोजना हुने ३१औं वार्षिक साधारण सभामा भर्चुअल माध्यमबाट उपस्थित हुने पुष्टि गर्दछु।',
    'I confirm my virtual participation in the 31st AGM scheduled for Chaitra 25.'
  )}
</label>
</div>
<button className="w-full sm:w-auto bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold px-space-xl py-space-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-space-xs">
<span className="material-symbols-outlined text-[20px]">how_to_reg</span>
<span>{t('डिजिटल उपस्थिति दर्ता सुरक्षित गर्नुहोस्', 'Confirm Digital Attendance')}</span>
</button>
</div>
</div>
{/*  Proxy Registration View (Hidden by default, shown via JS)  */}
<div className="p-space-lg md:p-space-xl hidden" id="view-proxy">
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
<div className="space-y-space-xs">
<label className="font-label-sm text-label-sm font-semibold text-on-surface">
  {t('प्रतिनिधिको सदस्यता नं.', 'Proxy Member No.')}
</label>
<input className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder={t('जस्तै: UKO-२०७२-०१९२३', 'e.g. UKO-2072-01923')} type="text"/>
<p className="text-xs text-on-surface-variant">
  {t('प्रतिनिधि अनिवार्य रूपमा संस्थाको सेयर सदस्य हुनुपर्दछ।', 'Proxy must be a registered share member of the cooperative.')}
</p>
</div>
<div className="space-y-space-xs">
<label className="font-label-sm text-label-sm font-semibold text-on-surface">
  {t('प्रतिनिधिको पूरा नाम', 'Proxy Full Name')}
</label>
<input className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder={t('नागरिकता अनुसारको नाम', 'Name as per Citizenship')} type="text"/>
<p className="text-xs text-on-surface-variant">
  {t('नागरिकता वा सदस्यता कार्डसँग मेल खानुपर्ने', 'Must match Citizenship or Member ID card')}
</p>
</div>
<div className="space-y-space-xs">
<label className="font-label-sm text-label-sm font-semibold text-on-surface">
  {t('सम्बन्ध / समूह', 'Relationship / Group')}
</label>
<select className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
<option>{t('पारिवारिक एकाघर सदस्य', 'Immediate Family Member')}</option>
<option>{t('स्थानीय बचत समूह सदस्य', 'Local SHG Group Member')}</option>
<option>{t('अन्य सेयर सदस्य', 'Other Shareholder Member')}</option>
</select>
<p className="text-xs text-on-surface-variant">
  {t('सहकारी ऐनको सीमा भित्र रहने गरी', 'Within Cooperative Act statutory limits')}
</p>
</div>
</div>
<div className="mt-space-lg pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
<p className="font-body-sm text-body-sm text-status-warning font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[18px]">warning</span>
  {t('एक सदस्यले बढीमा ३ जनाको मात्र प्रोक्सी प्रतिनिधित्व गर्न पाउने कानुनी व्यवस्था छ।', 'Statutory rule: A single member may represent a maximum of 3 proxies.')}
</p>
<button className="w-full sm:w-auto bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-bold px-space-xl py-space-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-space-xs">
<span className="material-symbols-outlined text-[20px]">assignment_ind</span>
<span>{t('प्रोक्सी अधिकारपत्र पेस गर्नुहोस्', 'Submit Proxy Authorization')}</span>
</button>
</div>
</div>
</div>
{/*  Institutional Transparency & Financial Reports Downloads  */}
<div className="space-y-space-md">
<div className="flex items-center justify-between">
<div>
<span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">{t('पारदर्शिता र सुशासन', 'Transparency & Governance')}</span>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface">{t('संस्थागत पारदर्शिता तथा प्रतिवेदनहरू', 'Institutional Transparency & Audit Reports')}</h3>
</div>
<a className="hidden sm:flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:underline" href="javascript:void(0)" onClick={() => alert(t("१२औं साधारण सभाको पूर्ण कार्यसूची तयार हुँदैछ...", "AGM agenda and policy documentation in preparation..."))}>
<span>{t('सबै वित्तीय प्रतिवेदन हेर्नुहोस्', 'View All Financial Reports')}</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
</div>
{/*  Publications Grid  */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
{/*  Report 1  */}
<div className="bg-surface-card rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div>
<div className="flex items-center justify-between">
<div className="w-12 h-12 rounded-xl bg-brand-accent-light text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[26px]">account_balance_wallet</span>
</div>
<span className="bg-surface-container text-on-surface font-tabular-mono text-xs px-2.5 py-1 rounded-full font-bold">PDF (4.8 MB)</span>
</div>
<h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-md group-hover:text-primary transition-colors">
  {t('आर्थिक वर्ष २०८०/८१ वार्षिक वैधानिक लेखापरीक्षण प्रतिवेदन', 'FY 2080/81 Annual Statutory Audit Report')}
</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
  {t('भोजराज एण्ड एसोसिएट्स द्वारा सम्पादित स्वतन्त्र लेखापरीक्षण प्रतिवेदन।', 'Independent statutory audit report conducted by Bhojraj & Associates Chartered Accountants.')}
</p>
<div className="mt-space-md p-space-sm bg-surface-canvas rounded-xl space-y-1">
<div className="flex justify-between text-xs">
<span className="text-on-surface-variant">{t('कुल सेयर पुँजी:', 'Total Share Capital:')}</span>
<span className="font-bold text-on-surface">{t('रु. १२,४५,८०,०००/-', 'NPR 124,580,000')}</span>
</div>
<div className="flex justify-between text-xs">
<span className="text-on-surface-variant">{t('कुल बचत संकलन:', 'Total Savings Deposit:')}</span>
<span className="font-bold text-on-surface">{t('रु. ८६,२१,४०,०००/-', 'NPR 862,140,000')}</span>
</div>
<div className="flex justify-between text-xs">
<span className="text-on-surface-variant">{t('निष्कृय कर्जा:', 'Non-Performing Loans (NPL):')}</span>
<span className="font-bold text-status-success">{t('१.२४% (न्यून)', '1.24% (Low)')}</span>
</div>
</div>
</div>
<button className="mt-space-md w-full bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md font-semibold py-space-sm rounded-xl transition-all flex items-center justify-center gap-space-xs">
<span className="material-symbols-outlined text-[18px]">download</span>
<span>{t('अडिट रिपोर्ट डाउनलोड', 'Download Audit Report (PDF)')}</span>
</button>
</div>
{/*  Report 2  */}
<div className="bg-surface-card rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div>
<div className="flex items-center justify-between">
<div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[26px]">monitoring</span>
</div>
<span className="bg-surface-container text-on-surface font-tabular-mono text-xs px-2.5 py-1 rounded-full font-bold">PEARLS Q4</span>
</div>
<h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-md group-hover:text-primary transition-colors">
  {t('पर्ल्स वित्तीय सुशासन प्रणाली तथा सूचकाङ्क', 'PEARLS Monitoring System & Financial Health')}
</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
  {t('विश्व ऋण महासंघ र नेफ्स्कून मापदण्ड अनुसारको त्रैमासिक वित्तीय सूचक प्रतिवेदन।', 'Quarterly financial soundness report compliant with WOCCU & NEFSCUN benchmarks.')}
</p>
<div className="mt-space-md p-space-sm bg-surface-canvas rounded-xl space-y-1">
<div className="flex justify-between text-xs">
<span className="text-on-surface-variant">{t('संस्थागत पुँजी अनुपात:', 'Institutional Capital Ratio (E1):')}</span>
<span className="font-bold text-status-success">{t('१०.८% (मापदण्ड > १०%)', '10.8% (Target > 10%)')}</span>
</div>
<div className="flex justify-between text-xs">
<span className="text-on-surface-variant">{t('तरलता अनुपात:', 'Liquidity Ratio (L1):')}</span>
<span className="font-bold text-status-success">{t('१८.४% (सुरक्षित)', '18.4% (Safe)')}</span>
</div>
<div className="flex justify-between text-xs">
<span className="text-on-surface-variant">{t('कर्जा जोखिम कोष:', 'Loan Loss Provision (P1):')}</span>
<span className="font-bold text-status-success">{t('१०५% कभरेज', '105% Coverage')}</span>
</div>
</div>
</div>
<button className="mt-space-md w-full bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md font-semibold py-space-sm rounded-xl transition-all flex items-center justify-center gap-space-xs">
<span className="material-symbols-outlined text-[18px]">download</span>
<span>{t('पर्ल्स प्रतिवेदन डाउनलोड', 'Download PEARLS Report (PDF)')}</span>
</button>
</div>
{/*  Report 3  */}
<div className="bg-surface-card rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div>
<div className="flex items-center justify-between">
<div className="w-12 h-12 rounded-xl bg-surface-container-low text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[26px]">policy</span>
</div>
<span className="bg-surface-container text-on-surface font-tabular-mono text-xs px-2.5 py-1 rounded-full font-bold">{t('विनियम २०७०', 'By-Laws 2070')}</span>
</div>
<h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-md group-hover:text-primary transition-colors">
  {t('सहकारी विनियम तथा आचारसंहिता', 'Cooperative By-Laws & Code of Conduct')}
</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
  {t('उनको बचत तथा ऋण सहकारी संस्थाको मूल विनियम, सदस्य आचारसंहिता तथा कर्जा तथा बचत नीति २०८१ (परिमार्जित)।', 'Master by-laws, member code of conduct, and revised credit & savings policies 2081.')}
</p>
<div className="mt-space-md p-space-sm bg-surface-canvas rounded-xl space-y-1">
<div className="flex justify-between text-xs">
<span className="text-on-surface-variant">{t('दर्ता नम्बर:', 'Registration No.:')}</span>
<span className="font-bold text-on-surface">{t('४२५/०७०/०७१ (दाङ)', '425/070/071 (Dang)')}</span>
</div>
<div className="flex justify-between text-xs">
<span className="text-on-surface-variant">{t('कार्यक्षेत्र:', 'Operating Area:')}</span>
<span className="font-bold text-on-surface">{t('गढवा, राजपुर, लमही', 'Gadhwa, Rajpur, Lamahi')}</span>
</div>
<div className="flex justify-between text-xs">
<span className="text-on-surface-variant">{t('सञ्चालक समिति बैठक:', 'Board Meeting:')}</span>
<span className="font-bold text-on-surface">{t('मासिक २४ गते नियमित', 'Every 24th of the Month')}</span>
</div>
</div>
</div>
<button className="mt-space-md w-full bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md font-semibold py-space-sm rounded-xl transition-all flex items-center justify-center gap-space-xs">
<span className="material-symbols-outlined text-[18px]">download</span>
<span>{t('विनियम तथा नीति संग्रह', 'Download By-Laws & Policies (PDF)')}</span>
</button>
</div>
</div>
</div>
{/*  Member Grievance & Service Helpdesk (Split Panel Desk & FAQ)  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
{/*  Helpdesk Ticket Submission Form  */}
<div className="lg:col-span-7 bg-surface-card rounded-2xl p-space-lg md:p-space-xl shadow-sm space-y-space-md">
<div className="flex items-center justify-between pb-space-xs">
<div>
<span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">{t('सदस्य सहायता तथा सिधा सम्पर्क', 'Member Support & Direct Contact')}</span>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface">{t('सदस्य गुनासो तथा सहायता डेस्क', 'Member Grievance & Helpdesk')}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
  {t('शाखा प्रबन्धक वा ऋण अधिकृतलाई सिधै आफ्नो समस्या वा जिज्ञासा पठाउनुहोस्। २४ कार्यघण्टाभित्र सम्पर्क गरिनेछ।', 'Send your query or grievance directly to the branch manager or loan officer. We will respond within 24 business hours.')}
</p>
</div>
<div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[28px]">support_agent</span>
</div>
</div>
<form className="space-y-space-md" id="grievance-form" onSubmit={handleGrievanceSubmit}>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
<div className="space-y-space-xs">
<label className="font-label-sm text-label-sm font-semibold text-on-surface">{t('सम्बन्धित अधिकारी', 'Recipient Desk')}</label>
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
<input className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-surface-container file:text-primary hover:file:bg-surface-container-high cursor-pointer" type="file"/>
</div>
<div className="flex items-center gap-space-sm pt-4 sm:pt-0">
<button className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold h-12 rounded-xl transition-all shadow-md flex items-center justify-center gap-space-xs" type="submit">
<span className="material-symbols-outlined text-[20px]">send</span>
<span>{t('गुनासो दर्ता गर्नुहोस्', 'Submit Grievance')}</span>
</button>
</div>
</div>
{/*  Feedback alert  */}
<div className="hidden p-space-md bg-brand-accent-light rounded-xl flex items-center gap-space-sm text-primary" id="ticket-success">
<span className="material-symbols-outlined text-[24px] text-status-success">check_circle</span>
<div className="text-sm">
<p className="font-bold">{t('गुनासो सफलतापूर्वक दर्ता भयो! टिकट नं: #UKO-GRV-8842', 'Grievance submitted successfully! Ticket No: #UKO-GRV-8842')}</p>
<p className="text-on-surface-variant text-xs">{t('शाखा प्रबन्धकले छिट्टै तपाईंको दर्ता मोबाइलमा फोन वा एसएमएसमार्फत जानकारी गराउनुहुनेछ।', 'The branch manager will contact you via phone or SMS shortly.')}</p>
</div>
</div>
</form>
{/*  Staff Contact Strip  */}
<div className="pt-space-md border-t border-transparent bg-surface-canvas p-space-md rounded-xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-12 h-12 rounded-full object-cover shadow-sm" data-alt="South Asian friendly branch manager professional portrait in formal blue cooperative shirt. Warm and approachable banking professional." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9GOgRNPxd8nuOiF0ieun0XTVItD3qZwl3DXkeqG4aMNBYWkEgpWQaZCy5P09zTnZkL6BS74Yvr23WfZ7sV8voY5_4EhhMcx2wXloUIVvCSwENKP521yqCczVgAFuCTaDMdpEhqlmYY1jYJAwk34vd4VNn6kF4XbtuSotlmFSB1z6f2JNaCVPHO-WBiGhFYeBiM9F7hzvgPq82FnCgGfTbwEmUd-eIjmxJvQohGJV9obmw1UDH1UtH"/>
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">{t('भोजराज थारु', 'Bhojraj Tharu')}</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('शाखा प्रबन्धक, चैनपुर मुख्य कार्यालय', 'Branch Manager, Chainpur Main Office')}</p>
</div>
</div>
<div className="flex items-center gap-space-sm">
<a className="bg-surface-card hover:bg-surface-container text-on-surface px-space-md py-space-xs rounded-xl font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-sm" href="tel:+97782412055">
<span className="material-symbols-outlined text-primary text-[18px]">call</span>
<span>०८२-४१२०५५</span>
</a>
<a className="bg-surface-card hover:bg-surface-container text-on-surface px-space-md py-space-xs rounded-xl font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-sm" href="tel:9857821099">
<span className="material-symbols-outlined text-status-success text-[18px]">phone_android</span>
<span>9857821099</span>
</a>
</div>
</div>
</div>
{/*  Right Side: Branch Information & Member FAQs  */}
<div className="lg:col-span-5 space-y-space-md">
{/*  Office Schedule & Contact Plate  */}
<div className="bg-surface-card rounded-2xl p-space-lg shadow-sm space-y-space-sm">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[24px]">store</span>
<div>
<h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t('शाखा कार्यालय विवरण', 'Branch Office Details')}</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('चैनपुर, गढवा गाउँपालिका-५, देउखुरी, दाङ', 'Chainpur, Gadhwa Rural Municipality-5, Deukhuri, Dang')}</p>
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
{/*  Member Frequently Asked Questions (Accordion Style)  */}
<div className="bg-surface-card rounded-2xl p-space-lg shadow-sm space-y-space-sm">
<div className="flex items-center justify-between pb-space-xs">
<h4 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[22px]">quiz</span>
  {t('सदस्यहरूले बारम्बार सोध्ने प्रश्नहरू', 'Frequently Asked Questions')}
</h4>
</div>
{/*  FAQ Item 1  */}
<details className="group bg-surface-canvas rounded-xl p-space-md cursor-pointer transition-all">
<summary className="font-label-md text-label-md font-bold text-on-surface flex items-center justify-between list-none">
<span>{t('१. साधारण सभामा लाभांश कसरी भुक्तानी हुन्छ?', '1. How is dividend paid after the AGM?')}</span>
<span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm pt-space-xs border-t border-transparent leading-relaxed">
  {t('साधारण सभाले १२% लाभांश पारित गरेपश्चात, नगद लाभांश सिधै तपाईंको बचत खातामा जम्मा हुनेछ र बोनस सेयर सेयर प्रमाणपत्र खातामा स्वतः अद्यावधिक गरिनेछ।', 'Once the AGM approves the 12% dividend, cash dividend is credited directly to your savings account (UKO-SAV) and bonus shares are credited to your share certificate.')}
</p>
</details>
{/*  FAQ Item 2  */}
<details className="group bg-surface-canvas rounded-xl p-space-md cursor-pointer transition-all">
<summary className="font-label-md text-label-md font-bold text-on-surface flex items-center justify-between list-none">
<span>{t('२. कृषि तथा पशुधन कर्जामा बीमा दाबी कसरी गर्ने?', '2. How to file insurance claims for agro & livestock loans?')}</span>
<span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm pt-space-xs border-t border-transparent leading-relaxed">
  {t('पशुधनको क्षति भएमा २४ घण्टाभित्र वडाको पशु प्राविधिकबाट मुचुल्का गराई कर्णट्याग सहित संस्थाको ऋण शाखामा सम्पर्क राख्नुपर्छ। हाम्रो बीमा डेस्कले ७ दिनभित्र दाबी भुक्तानी प्रक्रिया सम्पन्न गर्दछ।', 'In case of livestock loss, notify within 24 hours with an assessment from the ward technician along with the ear tag. Our insurance desk settles claims within 7 days.')}
</p>
</details>
{/*  FAQ Item 3  */}
<details className="group bg-surface-canvas rounded-xl p-space-md cursor-pointer transition-all">
<summary className="font-label-md text-label-md font-bold text-on-surface flex items-center justify-between list-none">
<span>{t('३. मेरो व्यक्तिगत केवाईसी नवीकरण गर्न के कागजात चाहिन्छ?', '3. What documents are required to renew my personal KYC?')}</span>
<span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm pt-space-xs border-t border-transparent leading-relaxed">
  {t('नेपाली नागरिकताको प्रतिलिपि, हालसालै खिचिएको २ प्रति पासपोर्ट साइज फोटो, बिजुलीको बिल वा स्थानीय ठेगाना प्रमाणित कागजात लिएर आउनुहोस् वा यसै पोर्टलको प्रोफाइल खण्डबाट अनलाइन अपलोड गर्नुहोस्।', 'Submit a copy of your citizenship certificate, 2 passport-size photos, utility bill or address proof, or upload online via your profile section.')}
</p>
</details>
</div>
{/*  Emergency Hotline Card  */}
<div className="bg-gradient-to-r from-surface-dark to-slate-900 rounded-2xl p-space-lg text-surface-canvas shadow-md">
<div className="flex items-center justify-between">
<div>
<span className="font-label-sm text-label-sm text-brand-accent-lime font-bold uppercase">{t('२४/७ आपतकालीन सहायता', '24/7 Emergency Support')}</span>
<h5 className="font-headline-sm text-headline-sm font-bold text-surface-canvas mt-0.5">{t('मोबाइल बैंकिङ ब्लक वा आकस्मिक सोधपुछ', 'Mobile Banking Block or Emergency Queries')}</h5>
<p className="font-tabular-mono text-tabular-mono text-brand-accent-lime font-bold text-lg mt-1">{t('हटलाइन: +९७७ ९८५७८-२१०९९', 'Hotline: +977 98578-21099')}</p>
</div>
<div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
<span className="material-symbols-outlined text-brand-accent-lime text-[28px]">emergency</span>
</div>
      </div>
    </div>
  </div>
    </div>
  </div>

      {/* e-Ballot Modal */}
      {showEballotModal && (
        <div onClick={() => setShowEballotModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-dark/80 backdrop-blur-sm flex items-center justify-center p-space-sm sm:p-space-md lg:p-space-lg" id="e-ballot-modal">
              <div className="relative w-full max-w-4xl bg-surface-card rounded-2xl shadow-2xl overflow-hidden my-space-md border-t-4 border-primary flex flex-col max-h-[92vh]">
                <div className="bg-surface-dark text-surface-canvas p-space-lg flex items-start justify-between gap-space-md">
                  <div className="space-y-space-xs">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="bg-brand-accent-lime/20 text-brand-accent-lime font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">lock</span> {t('गोप्य विद्युतीय मतपत्र', 'E-Ballot (Secret Digital Ballot)')}
                      </span>
                      <span className="bg-surface-dark-card text-slate-300 font-tabular-mono text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-status-warning">timer</span> {t('मतदान बन्द हुन बाँकी: ०४ घण्टा ३२ मिनेट', 'Polls close in: 04h 32m')}
                      </span>
                    </div>
                    <h2 className="font-headline-md text-headline-md font-bold text-surface-canvas tracking-tight">
                      {t('३१औं साधारण सभा: विद्युतीय गोप्य मतदान प्रणाली', '31st AGM Digital Secret Ballot System')}
                    </h2>
                    <p className="font-label-sm text-label-sm text-slate-300 flex items-center gap-1 flex-wrap">
                      <span className="text-brand-accent-lime font-bold">{t('मतदान योग्य सदस्य:', 'Eligible Voter:')}</span>
                      <span>{t('श्री हरि प्रसाद चौधरी', 'Hari Prasad Chaudhary')} (UKO-2070-08842)</span>
                      <span className="text-slate-400">•</span>
                      <span>{t('१ सदस्य १ मत', '1 Member 1 Vote')}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-status-success">verified_user</span> {t('गोप्य इन्क्रिप्टेड मतपत्र', 'End-to-End Encrypted')}
                      </span>
                    </p>
                  </div>
                  <button onClick={() => setShowEballotModal(false)} className="p-space-xs rounded-full hover:bg-surface-dark-card text-slate-400 hover:text-surface-canvas transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">close</span>
                  </button>
                </div>
                <div className="overflow-y-auto p-space-lg md:p-space-xl space-y-space-xl flex-1 bg-surface-canvas">
                  <div className="bg-brand-accent-light p-space-md rounded-xl flex items-center gap-space-sm text-primary">
                    <span className="material-symbols-outlined text-primary text-[24px] flex-shrink-0">how_to_vote</span>
                    <p className="text-xs md:text-sm font-medium leading-relaxed">
                      <strong className="text-primary">{t('सदस्य निर्देशन:', 'Member Instruction:')}</strong> {t('तलका प्रत्येक पदमा आफूले रोजेको उम्मेदवार छनोट गर्नुहोस्। छनोट सम्पन्न भएपछि पृष्ठको अन्त्यमा रहेको सुरक्षा पिन वा बायोमेट्रिक सुरक्षा कोड प्रविष्ट गरी मतदान सुरक्षित गर्नुहोस्।', 'Select your preferred candidate for each post below. Once selected, enter your MPIN or biometric code at the bottom to submit your secure vote.')}
                    </p>
                  </div>
                  <section className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md">
                    <div className="flex items-center justify-between border-b border-surface-container pb-space-xs">
                      <div>
                        <span className="bg-primary text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded-md font-bold">{t('पद १', 'Post 1')}</span>
                        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">{t('अध्यक्ष पद (१ जना रोज्नुहोस्)', 'Chairperson (Select 1)')}</h3>
                      </div>
                      <span className="font-label-sm text-label-sm text-status-success font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> {t('१ छानियो', '1 Selected')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      <label className="relative flex items-center p-space-md rounded-xl bg-brand-accent-light border-2 border-primary cursor-pointer transition-all">
                        <input defaultChecked={true} className="w-5 h-5 text-primary focus:ring-primary mr-space-md" name="chairperson" type="radio"/>
                        <div className="flex items-center gap-space-sm flex-1">
                          <img alt="राम बहादुर थारु" className="w-12 h-12 rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAYVlYbC_Ij0IQV9PPvC5_y4Y2hvScpL30FmKh_NvdjIeEpD4DU_k-enAZaGLgCJlH4QCAxQ6_M4lRJn_7Rq60txTT3kNE1QWe-D1p1LQ1e5XMalbR4JaVWAdQ-yl2NON2mySVY9QiLGU6lA5MvCmqpXCTwHtlPPxzmvcFFdFUZwKutYF9xk36jNVYn8CmeLg1_ZdHSd1mIdJiGtthrmspWGUp68WFY1utnfyPKe4vct-p-DGlelf-"/>
                          <div>
                            <div className="flex items-center gap-space-xs">
                              <h4 className="font-label-md text-label-md font-bold text-on-surface">{t('राम बहादुर थारु', 'Ram Bahadur Tharu')}</h4>
                              <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded font-bold">{t('प्यानल A', 'Panel A')}</span>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-0.5">{t('चुनाव चिन्ह:', 'Election Symbol:')} <strong className="text-primary">{t('धानको बाला', 'Paddy Ear')}</strong></p>
                            <p className="text-xs text-on-surface-variant">{t('गढवा गाउँपालिका-५, दाङ', 'Gadhwa RM-5, Dang')}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-primary text-[28px]">grain</span>
                      </label>
                      <label className="relative flex items-center p-space-md rounded-xl bg-surface-canvas hover:bg-surface-container border-2 border-transparent cursor-pointer transition-all">
                        <input className="w-5 h-5 text-primary focus:ring-primary mr-space-md" name="chairperson" type="radio"/>
                        <div className="flex items-center gap-space-sm flex-1">
                          <div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-base">लो.ना.</div>
                          <div>
                            <div className="flex items-center gap-space-xs">
                              <h4 className="font-label-md text-label-md font-bold text-on-surface">{t('लोक नारायण श्रेष्ठ', 'Lok Narayan Shrestha')}</h4>
                              <span className="bg-surface-container text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded font-bold">{t('प्यानल B', 'Panel B')}</span>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-0.5">{t('चुनाव चिन्ह:', 'Election Symbol:')} <strong className="text-on-surface">{t('सूर्यमुखी फूल', 'Sunflower')}</strong></p>
                            <p className="text-xs text-on-surface-variant">{t('लमही नगरपालिका-२, दाङ', 'Lamahi Municipality-2, Dang')}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-status-warning text-[28px]">wb_sunny</span>
                      </label>
                    </div>
                  </section>
                  <section className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md">
                    <div className="flex items-center justify-between border-b border-surface-container pb-space-xs">
                      <div>
                        <span className="bg-primary text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded-md font-bold">{t('पद २', 'Post 2')}</span>
                        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">{t('उपाध्यक्ष पद (१ जना रोज्नुहोस्)', 'Vice-Chairperson (Select 1)')}</h3>
                      </div>
                      <span className="font-label-sm text-label-sm text-status-success font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> {t('१ छानियो', '1 Selected')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      <label className="relative flex items-center p-space-md rounded-xl bg-brand-accent-light border-2 border-primary cursor-pointer transition-all">
                        <input defaultChecked={true} className="w-5 h-5 text-primary focus:ring-primary mr-space-md" name="vice_chairperson" type="radio"/>
                        <div className="flex items-center gap-space-sm flex-1">
                          <img alt="शान्ता चौधरी" className="w-12 h-12 rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA63_qpOWStcsD95zQr5ygKenzK_VIYMNl6e5p4nIxn5WhUsLN-3ZDXgb6y0Yl9PKmCDbF91JjHUiRk11ltzaavZtQO9nQNvCJeIcUr-HHAKY7RMr7eevhovHWWnkFfY0_9pTyy21nLYJyimXd_eVqFoAjLg5aHk4GJJZhEgpsd3JOlUwA4YzwSK_goep3HosmB5Ba7X985Wm0UWnFbUjhfX1RoBhJQwwFZespsJrGHpcOM3gTjjH3-"/>
                          <div>
                            <div className="flex items-center gap-space-xs">
                              <h4 className="font-label-md text-label-md font-bold text-on-surface">{t('शान्ता चौधरी', 'Shanta Chaudhary')}</h4>
                              <span className="bg-surface-container text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded font-bold">{t('प्यानल B', 'Panel B')}</span>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-0.5">{t('चुनाव चिन्ह:', 'Election Symbol:')} <strong className="text-primary">{t('कलम', 'Pen')}</strong></p>
                            <p className="text-xs text-on-surface-variant">{t('चैनपुर, गढवा-५', 'Chainpur, Gadhwa-5')}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-primary text-[28px]">edit</span>
                      </label>
                      <label className="relative flex items-center p-space-md rounded-xl bg-surface-canvas hover:bg-surface-container border-2 border-transparent cursor-pointer transition-all">
                        <input className="w-5 h-5 text-primary focus:ring-primary mr-space-md" name="vice_chairperson" type="radio"/>
                        <div className="flex items-center gap-space-sm flex-1">
                          <div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-base">गी.श.</div>
                          <div>
                            <div className="flex items-center gap-space-xs">
                              <h4 className="font-label-md text-label-md font-bold text-on-surface">{t('गीता कुमारी शर्मा', 'Geeta Kumari Sharma')}</h4>
                              <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded font-bold">{t('प्यानल A', 'Panel A')}</span>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-0.5">{t('चुनाव चिन्ह:', 'Election Symbol:')} <strong className="text-on-surface">{t('घण्टी', 'Bell')}</strong></p>
                            <p className="text-xs text-on-surface-variant">{t('गोबरगढ, गढवा-१', 'Gobarghada, Gadhwa-1')}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-500 text-[28px]">notifications_active</span>
                      </label>
                    </div>
                  </section>
                  <section className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs border-b border-surface-container pb-space-xs">
                      <div>
                        <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-md font-bold">{t('पद ३', 'Post 3')}</span>
                        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">{t('सञ्चालक समिति सदस्य (७ पद / बढीमा ७ जना रोज्नुहोस्)', 'Board of Directors (7 Seats / Select up to 7)')}</h3>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary font-bold bg-brand-accent-light px-2.5 py-1 rounded-full">{t('४/७ छानिएको', '4 of 7 Selected')}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                      <label className="flex items-center p-space-sm bg-brand-accent-light border border-primary rounded-xl cursor-pointer">
                        <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mr-space-sm" type="checkbox"/>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('चेत नारायण थारु', 'Chet Narayan Tharu')}</h5>
                            <span className="text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded font-semibold">{t('खुला कोटा', 'Open Quota')}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant">{t('गढवा-५ • चिन्ह: रुख', 'Gadhwa-5 • Symbol: Tree')}</p>
                        </div>
                      </label>
                      <label className="flex items-center p-space-sm bg-brand-accent-light border border-primary rounded-xl cursor-pointer">
                        <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mr-space-sm" type="checkbox"/>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('विमला कुमारी यादव', 'Bimala Kumari Yadav')}</h5>
                            <span className="text-[10px] bg-status-success text-on-primary px-1.5 py-0.5 rounded font-semibold">{t('महिला कोटा', 'Women Quota')}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant">{t('गढवा-३ • चिन्ह: तारा', 'Gadhwa-3 • Symbol: Star')}</p>
                        </div>
                      </label>
                      <label className="flex items-center p-space-sm bg-brand-accent-light border border-primary rounded-xl cursor-pointer">
                        <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mr-space-sm" type="checkbox"/>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('डिल्लीराज पोखरेल', 'Dilliraj Pokharel')}</h5>
                            <span className="text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded font-semibold">{t('खुला कोटा', 'Open Quota')}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant">{t('गढवा-२ • चिन्ह: माछा', 'Gadhwa-2 • Symbol: Fish')}</p>
                        </div>
                      </label>
                      <label className="flex items-center p-space-sm bg-brand-accent-light border border-primary rounded-xl cursor-pointer">
                        <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mr-space-sm" type="checkbox"/>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('सुनिता घर्ती', 'Sunita Gharti')}</h5>
                            <span className="text-[10px] bg-status-success text-on-primary px-1.5 py-0.5 rounded font-semibold">{t('महिला कोटा', 'Women Quota')}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant">{t('गढवा-४ • चिन्ह: गाग्री', 'Gadhwa-4 • Symbol: Water Pot')}</p>
                        </div>
                      </label>
                      <label className="flex items-center p-space-sm bg-surface-canvas hover:bg-surface-container border border-transparent rounded-xl cursor-pointer">
                        <input className="w-5 h-5 rounded text-primary focus:ring-primary mr-space-sm" type="checkbox"/>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('टेक बहादुर पुन', 'Tek Bahadur Pun')}</h5>
                            <span className="text-[10px] bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded font-semibold">{t('जनजाति कोटा', 'Indigenous Quota')}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant">{t('राजपुर-१ • चिन्ह: छाता', 'Rajpur-1 • Symbol: Umbrella')}</p>
                        </div>
                      </label>
                      <label className="flex items-center p-space-sm bg-surface-canvas hover:bg-surface-container border border-transparent rounded-xl cursor-pointer">
                        <input className="w-5 h-5 rounded text-primary focus:ring-primary mr-space-sm" type="checkbox"/>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('महेन्द्र कुमार चौधरी', 'Mahendra Kumar Chaudhary')}</h5>
                            <span className="text-[10px] bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded font-semibold">{t('खुला कोटा', 'Open Quota')}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant">{t('गढवा-६ • चिन्ह: साइकल', 'Gadhwa-6 • Symbol: Bicycle')}</p>
                        </div>
                      </label>
                    </div>
                  </section>
                  <section className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs border-b border-surface-container pb-space-xs">
                      <div>
                        <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-md font-bold">{t('पद ४', 'Post 4')}</span>
                        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">{t('लेखा सुपरिवेक्षण समिति (संयोजक सहित ३ पद)', 'Internal Audit Committee (3 Seats including Coordinator)')}</h3>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary font-bold bg-brand-accent-light px-2.5 py-1 rounded-full">{t('३/३ छानिएको', '3 of 3 Selected')}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                      <label className="p-space-sm bg-brand-accent-light border border-primary rounded-xl flex items-start gap-space-xs cursor-pointer">
                        <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mt-1" type="checkbox"/>
                        <div>
                          <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('अर्जुन प्रसाद भुसाल', 'Arjun Prasad Bhusal')}</h5>
                          <span className="text-[10px] text-primary font-bold block">{t('संयोजक उम्मेदवार (एम.कम / अडिट अनुभव)', 'Coordinator Candidate (M.Com / Audit Exp)')}</span>
                          <p className="text-xs text-on-surface-variant mt-0.5">{t('चिन्ह: तराजु', 'Symbol: Scale')}</p>
                        </div>
                      </label>
                      <label className="p-space-sm bg-brand-accent-light border border-primary rounded-xl flex items-start gap-space-xs cursor-pointer">
                        <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mt-1" type="checkbox"/>
                        <div>
                          <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('कमला भण्डारी', 'Kamala Bhandari')}</h5>
                          <span className="text-[10px] text-primary font-bold block">{t('सदस्य (बिबिएस लेखा)', 'Member (BBS Accountancy)')}</span>
                          <p className="text-xs text-on-surface-variant mt-0.5">{t('चिन्ह: किताब', 'Symbol: Book')}</p>
                        </div>
                      </label>
                      <label className="p-space-sm bg-brand-accent-light border border-primary rounded-xl flex items-start gap-space-xs cursor-pointer">
                        <input defaultChecked={true} className="w-5 h-5 rounded text-primary focus:ring-primary mt-1" type="checkbox"/>
                        <div>
                          <h5 className="font-label-md text-label-md font-bold text-on-surface">{t('राजेश कुमार गुप्ता', 'Rajesh Kumar Gupta')}</h5>
                          <span className="text-[10px] text-primary font-bold block">{t('सदस्य (सिए इन्टर)', 'Member (CA Inter / 5 yr exp)')}</span>
                          <p className="text-xs text-on-surface-variant mt-0.5">{t('चिन्ह: कलम', 'Symbol: Pen')}</p>
                        </div>
                      </label>
                    </div>
                  </section>
                  <section className="bg-surface-card p-space-lg rounded-xl shadow-sm border border-primary/20 space-y-space-md">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[24px]">fingerprint</span>
                      </div>
                      <div>
                        <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t('सुरक्षा पिन / बायोमेट्रिक प्रमाणीकरण', 'MPIN / Biometric Verification')}</h4>
                        <p className="text-xs text-on-surface-variant">{t('सहकारी ४-अङ्कको गोप्य पिन वा औंठाछाप प्रमाणीकरण गर्नुहोस्', 'Enter 4-digit cooperative MPIN or verify fingerprint')}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-space-md pt-space-xs">
                      <div className="flex items-center gap-space-sm">
                        <input className="w-12 h-12 text-center text-xl font-bold bg-surface-canvas rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" maxLength={1} type="password" value="4" readOnly/>
                        <input className="w-12 h-12 text-center text-xl font-bold bg-surface-canvas rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" maxLength={1} type="password" value="8" readOnly/>
                        <input className="w-12 h-12 text-center text-xl font-bold bg-surface-canvas rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" maxLength={1} type="password" value="2" readOnly/>
                        <input className="w-12 h-12 text-center text-xl font-bold bg-surface-canvas rounded-xl focus:ring-2 focus:ring-primary focus:outline-none" maxLength={1} type="password" value="9" readOnly/>
                      </div>
                      <div className="flex items-center gap-space-sm text-xs text-status-success font-semibold">
                        <span className="material-symbols-outlined text-[20px]">verified</span>
                        <span>{t('बायोमेट्रिक टोकन प्रमाणित (#SEC-BIO-8842)', 'Biometric Token Verified (#SEC-BIO-8842)')}</span>
                      </div>
                    </div>
                    <div className="p-space-sm bg-surface-container-low rounded-lg text-xs text-on-surface-variant flex items-start gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">security</span>
                      <p><strong>{t('वैधानिक गोपनीयता सूचना:', 'Statutory Privacy Notice:')}</strong> {t('सहकारी ऐन २०७४ तथा संस्थाको निर्वाचन निर्देशिका अनुसार तपाईंको मतदान पूर्ण रूपमा इन्क्रिप्टेड छ र कसैले पनि तपाईंले कुन उम्मेदवारलाई मत दिनुभयो भनी हेर्न वा खोतल्न सक्नेछैन।', 'Under Cooperative Act 2074 and election bylaws, your vote is fully encrypted end-to-end.')}</p>
                    </div>
                  </section>
                </div>
                <div className="bg-surface-card p-space-lg border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-xs text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-status-success text-[16px]">lock_clock</span>
                    <span>{t('डिजिटल हस्ताक्षर सुरक्षित गरिएको छ • IP: 103.141.***.***', 'Digital Signature Secured • IP: 103.141.***.***')}</span>
                  </div>
                  <div className="flex items-center gap-space-sm w-full sm:w-auto">
                    <button onClick={() => setShowEballotModal(false)} className="w-1/2 sm:w-auto px-space-lg py-space-sm rounded-xl font-label-md text-label-md font-semibold text-on-surface-variant hover:bg-surface-container transition-all">
                      {t('रद्द गर्नुहोस्', 'Cancel')}
                    </button>
                    <button onClick={handleBallotSubmit} className="w-1/2 sm:w-auto px-space-xl py-space-sm rounded-xl font-label-md text-label-md font-bold bg-primary hover:bg-primary-container text-on-primary transition-all shadow-md flex items-center justify-center gap-space-xs">
                      <span className="material-symbols-outlined text-[20px]">how_to_vote</span>
                      <span>{t('गोप्य मतदान पुष्टि गर्नुहोस्', 'Cast Secret Ballot')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grievance Tracker Modal */}
      {showGrievanceModal && (
        <div onClick={() => setShowGrievanceModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-space-sm sm:p-space-md bg-surface-dark/80 backdrop-blur-sm overflow-y-auto" id="grievance-tracker-modal">
              <div className="relative w-full max-w-2xl bg-surface-card rounded-2xl shadow-xl overflow-hidden my-auto border border-surface-container">
                <div className="bg-surface-dark text-surface-canvas p-space-md sm:p-space-lg flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-brand-accent-lime text-[20px]">support_agent</span>
                      <span className="font-label-sm text-label-sm text-brand-accent-lime font-bold uppercase tracking-wide">{t('सदस्य गुनासो तथा सुनुवाइ ट्र्याकर', 'Member Grievance & Helpdesk Status Tracker')}</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-surface-canvas">{t('सदस्य गुनासो तथा हेल्पडेस्क स्थिति ट्र्याकर', 'Member Grievance & Helpdesk Status Tracker')}</h3>
                    <p className="font-body-sm text-body-sm text-slate-300">{t('पारदर्शी छानबिन प्रक्रिया, प्रत्यक्ष अधिकारी टिप्पणी र स्थिति अनुगमन', 'Transparent audit process, direct officer notes, and SLA tracking')}</p>
                  </div>
                  <button onClick={() => setShowGrievanceModal(false)} className="p-space-xs rounded-full hover:bg-surface-dark-card text-slate-300 hover:text-surface-canvas transition-colors">
                    <span className="material-symbols-outlined text-[24px]">close</span>
                  </button>
                </div>
                <div className="p-space-md sm:p-space-lg space-y-space-md overflow-y-auto max-h-[75vh]">
                  <div className="bg-surface-container-low p-space-md rounded-xl space-y-space-xs">
                    <div className="flex flex-wrap items-center justify-between gap-space-xs">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-tabular-mono text-tabular-mono font-bold text-primary text-sm">#GRV-2081-0428</span>
                        <span className="bg-brand-accent-light text-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-status-success animate-pulse"></span>
                          {t('कारबाही प्रक्रियामा / समाधान उन्मुख', 'In Progress / Resolution Pending')}
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{t('दर्ता: २०८१ फागुन १८', 'Registered: Mar 02, 2025')}</span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-base pt-1">{t('विषय: लाभांश तथा बचत ब्याज हिसाब पुनरावलोकन', 'Subject: Dividend & Savings Interest Recalculation')}</h4>
                    <p className="text-xs text-on-surface-variant">{t('शाखा: चैनपुर मुख्य कार्यालय | सम्बन्धित डेस्क: लेखा तथा बचत व्यवस्थापन', 'Branch: Chainpur Main Office | Desk: Accounts & Savings Management')}</p>
                  </div>
                  <div className="space-y-space-sm">
                    <h5 className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary text-[18px]">timeline</span>
                      {t('छानबिन चरण तथा कार्य प्रगति विवरण', 'Audit Steps & SLA Progress Details')}
                    </h5>
                    <div className="space-y-space-xs relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
                      <div className="relative flex items-start gap-space-sm">
                        <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-status-success text-on-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </span>
                        <div>
                          <p className="font-label-sm text-label-sm font-bold text-on-surface">{t('२०८१ फागुन १८, १०:३० AM - गुनासो अनलाइन दर्ता भयो', 'Mar 02, 2025, 10:30 AM - Grievance Registered Online')}</p>
                          <p className="text-xs text-on-surface-variant">{t('प्रणालीमार्फत स्वतः टिकट सृजना भई केन्द्रीय हेल्पडेस्कमा प्रेषित।', 'Ticket automatically generated via core system and routed to helpdesk.')}</p>
                        </div>
                      </div>
                      <div className="relative flex items-start gap-space-sm pt-space-xs">
                        <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-status-success text-on-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </span>
                        <div>
                          <p className="font-label-sm text-label-sm font-bold text-on-surface">{t('२०८१ फागुन १९, ०२:१५ PM - प्रारम्भिक छानबिन सम्पन्न', 'Mar 03, 2025, 02:15 PM - Preliminary Review Completed')}</p>
                          <p className="text-xs text-on-surface-variant">{t('गढवा शाखा अधिकृत सीता चौधरीद्वारा पासबुक र ब्याज दर भौचर रुजु गरियो।', 'Passbook and interest rate vouchers verified by field officer Sita Chaudhary.')}</p>
                        </div>
                      </div>
                      <div className="relative flex items-start gap-space-sm pt-space-xs">
                        <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center animate-pulse">
                          <span className="material-symbols-outlined text-[14px]">pending</span>
                        </span>
                        <div className="bg-surface-canvas p-space-sm rounded-lg w-full border border-primary/20">
                          <p className="font-label-sm text-label-sm font-bold text-primary flex items-center justify-between">
                            <span>{t('२०८१ फागुन २३, ११:०० AM - अन्तिम स्वीकृतिको क्रममा', 'Mar 07, 2025, 11:00 AM - Pending Final Approval')}</span>
                            <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded">{t('हालको अवस्था', 'Current Status')}</span>
                          </p>
                          <p className="text-xs text-on-surface leading-relaxed mt-1">{t('लेखा प्रणालीबाट ब्याज हिसाब मिलान गरी शाखा प्रबन्धक भोजराज थारुसमक्ष स्वीकृतिका लागि पेस गरिएको छ।', 'Interest adjustment prepared in CBS and submitted to Branch Manager Bhojraj Tharu for approval.')}</p>
                        </div>
                      </div>
                      <div className="relative flex items-start gap-space-sm pt-space-xs">
                        <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-xs font-bold">४</span>
                        <div>
                          <p className="font-label-sm text-label-sm font-semibold text-on-surface-variant">{t('फागुन २६ सम्म - अन्तिम समाधान तथा सदस्य खातामा समायोजन', 'By Mar 10 - Final Resolution & Account Adjustment')}</p>
                          <p className="text-xs text-on-surface-variant">{t('संशोधित रकम बचत खातामा क्रेडिट भई एसएमएस अलर्ट पठाइनेछ।', 'Adjusted amount will be credited to UKO-SAV account with SMS alert.')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface-canvas p-space-md rounded-xl space-y-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-primary text-[20px]">rate_review</span>
                      <span className="font-label-sm text-label-sm font-bold text-on-surface">{t('शाखा प्रबन्धकको आधिकारिक टिप्पणी:', 'Branch Manager Official Note:')}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface bg-surface-card p-space-sm rounded-lg italic leading-relaxed">
                      {t('"सदस्य श्री हरि प्रसाद चौधरीको मुद्दती निक्षेपको पछिल्लो त्रैमासिक ब्याज गणनामा ५ दिनको ग्रेस अवधि मिलान गर्नुपर्ने देखिएकोले रु. ४५० समायोजन भौचर तयार गरिएको छ।"', '"Adjustment voucher of NPR 450 prepared to reconcile 5 grace days in quarterly FD interest for member Hari Prasad Chaudhary."')}
                    </p>
                    <div className="flex items-center justify-between pt-space-xs">
                      <span className="text-xs text-on-surface-variant">{t('हस्ताक्षरकर्ता: भोजराज थारु (शाखा प्रबन्धक)', 'Signatory: Bhojraj Tharu (Branch Manager)')}</span>
                      <a className="inline-flex items-center gap-1 text-primary hover:text-on-secondary-container text-xs font-bold bg-surface-card px-space-sm py-1 rounded-md shadow-sm" href="javascript:void(0)" onClick={() => alert(t("Adjustment_Voucher_Draft.pdf डाउनलोड भइरहेको छ...", "Downloading Adjustment_Voucher_Draft.pdf..."))}>
                        <span className="material-symbols-outlined text-[16px]">attachment</span>
                        <span>Adjustment_Voucher_Draft.pdf (1.2 MB)</span>
                        <span className="material-symbols-outlined text-[14px]">download</span>
                      </a>
                    </div>
                  </div>
                  <div className="space-y-space-xs">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">chat</span>
                      {t('थप स्पष्टीकरण वा प्रतिक्रिया पठाउनुहोस्', 'Send Further Clarification / Feedback')}
                    </label>
                    <div className="flex gap-space-xs">
                      <input className="flex-1 h-10 px-space-md bg-surface-canvas rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container" placeholder={t('थप कागजात वा सन्देश यहाँ टाइप गर्नुहोस्...', 'Type additional documents or message here...')} type="text"/>
                      <button className="bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-bold px-space-md h-10 rounded-xl transition-all flex items-center gap-1 shadow-sm" type="button">
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        <span>{t('पठाउनुहोस्', 'Send')}</span>
                      </button>
                    </div>
                  </div>
                  <div className="pt-space-xs border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-xs text-xs text-on-surface-variant">
                      <span className="font-semibold">{t('अघिल्ला उजुरीहरू:', 'Previous Tickets:')}</span>
                      <button className="hover:text-primary underline font-tabular-mono" type="button">#GRV-2080-891 ({t('समाधान भयो', 'Resolved')})</button>
                      <span className="text-outline-variant">•</span>
                      <button className="hover:text-primary underline font-tabular-mono" type="button">#GRV-2080-312 ({t('समाधान भयो', 'Resolved')})</button>
                    </div>
                    <button onClick={() => setShowGrievanceModal(false)} className="w-full sm:w-auto px-space-lg py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold rounded-xl transition-all" type="button">
                      {t('बन्द गर्नुहोस्', 'Close')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AGM Entry Pass Modal */}
      {showAgmPassModal && (
        <div onClick={() => setShowAgmPassModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-surface-dark/80 backdrop-blur-sm overflow-y-auto" id="agm-pass-modal" role="dialog">
              <div className="relative w-full max-w-2xl bg-surface-card rounded-2xl shadow-xl overflow-hidden my-auto border border-outline-variant/30 flex flex-col">
                <div className="bg-gradient-to-r from-primary to-primary-container p-space-md md:p-space-lg text-on-primary flex items-start justify-between relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-10 opacity-15 pointer-events-none">
                    <span className="material-symbols-outlined text-[150px]">verified</span>
                  </div>
                  <div className="flex items-center gap-space-sm z-10">
                    <img alt="Unako SACCOS Logo" className="h-10 w-auto object-contain bg-surface-card p-1 rounded-lg" src={logoUrl}/>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="bg-brand-accent-lime/20 text-brand-accent-lime font-label-sm text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">{t('आधिकारिक प्रवेश पास', 'Official Entry Pass')}</span>
                        <span className="text-xs text-on-primary/80 font-tabular-mono">{t('सुरक्षित टोकन #AGM31-8842', 'Secure Token #AGM31-8842')}</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-primary mt-0.5">{t('३१औं वार्षिक साधारण सभा प्रवेश पास तथा डिजिटल टोकन', '31st AGM Digital Entry Pass & QR Token')}</h3>
                      <p className="font-body-sm text-xs text-on-primary/90">{t('आधिकारिक साधारण सभा प्रवेश पास र गेट स्क्यानर भौचर', 'Official 31st AGM Digital Entry Pass & Gate Scanner Voucher')}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAgmPassModal(false)} aria-label="Close modal" className="text-on-primary/80 hover:text-on-primary p-1 rounded-full hover:bg-surface-card/20 transition-colors z-10">
                    <span className="material-symbols-outlined text-[24px]">close</span>
                  </button>
                </div>
                <div className="p-space-md md:p-space-lg space-y-space-md max-h-[75vh] overflow-y-auto">
                  <div className="bg-surface-canvas p-space-md rounded-xl border border-outline-variant/40 flex flex-col md:flex-row items-center justify-between gap-space-md">
                    <div className="space-y-space-xs flex-1">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                        <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t('श्री हरि प्रसाद चौधरी', 'Hari Prasad Chaudhary')}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-x-space-md gap-y-1 text-xs text-on-surface-variant pt-1">
                        <p><span className="font-medium text-on-surface">{t('सदस्यता नं:', 'Member ID:')}</span> <span className="font-tabular-mono font-bold text-primary">UKO-2070-08842</span></p>
                        <p><span className="font-medium text-on-surface">{t('नागरिकता नं:', 'Citizenship No.:')}</span> <span className="font-tabular-mono">५२-०१-६८-०४२९१</span></p>
                        <p><span className="font-medium text-on-surface">{t('तोकिएको सिट/ब्लक:', 'Seat / Block:')}</span> <span className="font-bold text-on-surface">{t('टाउन हल, ब्लक "ख" (पङ्क्ति B-14)', 'Town Hall, Block "B" (Row B-14)')}</span></p>
                        <p><span className="font-medium text-on-surface">{t('मतदान अधिकार:', 'Voting Rights:')}</span> <span className="font-bold text-status-success">{t('१ मत (योग्य सेयरधनी सदस्य)', '1 Vote (Eligible Shareholder)')}</span></p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center bg-surface-card p-space-sm rounded-xl border border-outline-variant/30 shadow-sm flex-shrink-0 text-center">
                      <div className="w-28 h-28 bg-surface-container-low rounded-lg p-1.5 flex items-center justify-center relative">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                          <rect fill="white" height="100" rx="6" width="100"></rect>
                          <path clipRule="evenodd" d="M10 10h30v30H10V10zm6 6h18v18H16V16zm4 4h10v10H20V20zm40-10h30v30H60V10zm6 6h18v18H66V16zm4 4h10v10H70V20zM10 60h30v30H10V60zm6 6h18v18H16V66zm4 4h10v10H20V70zm45-10h10v5H65v-5zm15 0h10v10H80V60zm-15 15h5v15h-5V75zm10 5h15v10H75V80zm-25-30h10v10H50V50zm10 0h10v10H60V50zm-10-15h10v10H50V35zm-20 5h10v10H30V40z" fill="#006b47" fillRule="evenodd"></path>
                        </svg>
                      </div>
                      <span className="font-label-sm text-[11px] font-bold text-primary mt-1">{t('प्रवेशद्वार स्क्यानर १ मा देखाउनुहोस्', 'Show at Gate Scanner 1')}</span>
                      <span className="font-tabular-mono text-[10px] text-on-surface-variant">AGM31-PASS-UKO-8842-SEC99</span>
                      <span className="text-[10px] text-status-success font-semibold mt-0.5">{t('वैध: २०८१ चैत्र २५, ०९:०० बजे', 'Valid: Apr 07, 2025, 09:00 AM')}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-space-xs">
                      <span className="font-label-sm text-label-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">local_activity</span>
                        {t('संलग्न डिजिटल कुपन तथा सुविधाहरू', 'Attached Digital Coupons & Benefits')}
                      </span>
                      <span className="text-xs text-on-surface-variant">{t('सभास्थलमा स्वतः मान्य', 'Auto-valid at AGM Venue')}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                      <div className="bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/30 flex flex-col justify-between space-y-1">
                        <div className="flex items-center gap-1.5 text-primary">
                          <span className="material-symbols-outlined text-[20px]">coffee</span>
                          <span className="font-label-sm text-label-sm font-bold">{t('खाजा तथा दिवा भोजन', 'Refreshment & Lunch')}</span>
                        </div>
                        <p className="font-body-sm text-xs text-on-surface-variant leading-tight">{t('बिहानी चिया, खाजा र दिवा भोजन कुपन', 'Morning tea, snacks and buffet lunch voucher')}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-tabular-mono text-[11px] font-bold text-primary bg-surface-card px-2 py-0.5 rounded">#RN-491</span>
                          <span className="text-[11px] text-status-success font-semibold">{t('सक्रिय', 'Active')}</span>
                        </div>
                      </div>
                      <div className="bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/30 flex flex-col justify-between space-y-1">
                        <div className="flex items-center gap-1.5 text-primary">
                          <span className="material-symbols-outlined text-[20px]">featured_seasonal_and_gifts</span>
                          <span className="font-label-sm text-label-sm font-bold">{t('उपहार तथा झोला किट', 'Gift & Bag Kit')}</span>
                        </div>
                        <p className="font-body-sm text-xs text-on-surface-variant leading-tight">{t('वार्षिक प्रतिवेदन, डायरी र उपहार प्याकेज', 'Annual report booklet, diary and gift package')}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-tabular-mono text-[11px] font-bold text-primary bg-surface-card px-2 py-0.5 rounded">#GFT-884</span>
                          <span className="text-[11px] text-status-success font-semibold">{t('सक्रिय', 'Active')}</span>
                        </div>
                      </div>
                      <div className="bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/30 flex flex-col justify-between space-y-1">
                        <div className="flex items-center gap-1.5 text-primary">
                          <span className="material-symbols-outlined text-[20px]">payments</span>
                          <span className="font-label-sm text-label-sm font-bold">{t('बैठक यातायात भत्ता', 'Meeting Travel Allowance')}</span>
                        </div>
                        <p className="font-body-sm text-xs text-on-surface-variant leading-tight">{t('रु. ५०० नगद काउन्टर टोकन', 'NPR 500 cash counter token')}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-tabular-mono text-[11px] font-bold text-primary bg-surface-card px-2 py-0.5 rounded">#TRV-500</span>
                          <span className="text-[11px] text-status-success font-semibold">{t('सक्रिय', 'Active')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-brand-accent-light p-space-sm rounded-xl flex items-center gap-space-sm text-primary text-xs">
                    <span className="material-symbols-outlined text-[20px] text-status-success flex-shrink-0">check_circle</span>
                    <p><strong>{t('सुरक्षा जाँच:', 'Security Notice:')}</strong> {t('यो डिजिटल पास स्क्रिनसट वा मोबाइलमै देखाएर प्रवेश गर्न सकिनेछ। पासको दुरुपयोग कानुनतः दण्डनीय हुनेछ।', 'Present this digital pass on your mobile screen at the entrance gate.')}</p>
                  </div>
                </div>
                <div className="bg-surface-canvas p-space-md flex flex-wrap items-center justify-between gap-space-sm border-t border-outline-variant/20">
                  <div className="flex flex-wrap items-center gap-space-xs">
                    <button onClick={() => alert(t("मोबाइल वालेटमा पास सेभ गरियो!", "Pass saved to mobile wallet!"))} className="bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold px-space-md py-space-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">wallet</span>
                      <span>{t('मोबाइल वालेटमा सेभ गर्नुहोस्', 'Save to Mobile Wallet')}</span>
                    </button>
                    <button className="bg-surface-card hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold px-space-md py-space-sm rounded-xl transition-all border border-outline-variant/40 flex items-center gap-1.5" onClick={() => window.print()}>
                      <span className="material-symbols-outlined text-[18px]">print</span>
                      <span>{t('प्रवेश पास प्रिन्ट गर्नुहोस्', 'Print Entry Pass')}</span>
                    </button>
                  </div>
                  <button onClick={() => setShowAgmPassModal(false)} className="text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-semibold px-space-md py-space-sm rounded-xl transition-all">
                    {t('बन्द गर्नुहोस्', 'Close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
