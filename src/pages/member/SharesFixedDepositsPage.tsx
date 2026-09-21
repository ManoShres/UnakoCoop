import React, { useState } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useDesignStore } from '../../store/useDesignStore';

export function SharesFixedDepositsPage() {
  const { t } = useLanguageStore();
  const customLogoUrl = useDesignStore((s) => s.settings.customLogoUrl);
  const features = useDesignStore((s) => s.settings.features);
  const logoUrl = customLogoUrl || '/unako-logo.png';
  const [showCertModal, setShowCertModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showFdLoanModal, setShowFdLoanModal] = useState(false);
  const [showMudhatiModal, setShowMudhatiModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSharePurchaseSubmit = () => {
    setShowPurchaseModal(false);
    showToast(t('सेयर खरिद आवेदन दर्ता भयो!', 'Application for Additional Shares Submitted!'));
  };

  const handleMudhatiSubmit = () => {
    setShowMudhatiModal(false);
    showToast(t('मुद्दती खाता सफलतापूर्वक बुक भयो!', 'Term Deposit Booking Complete!'));
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

      {/* Main Shares & Fixed Deposit View */}
      <div className="flex flex-col w-full max-w-[1280px] mx-auto space-y-space-xl">
{/*  Top Stat Banner / Equity Summary  */}
<div className="relative overflow-hidden rounded-xl bg-surface-dark text-on-primary-container p-space-xl shadow-xl">
<div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
<div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
<div className="max-w-2xl">
<div className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-dark-card text-brand-accent-lime font-label-sm text-label-sm mb-space-sm">
<span className="inline-block w-2 h-2 rounded-full bg-brand-accent-lime animate-pulse"></span>
<span>{t('सहकारी पुँजी तथा मुद्दती लगानी', 'Cooperative Equity & Term Deposits')}</span>
</div>
<h1 className="font-headline-xl text-headline-xl text-surface-canvas mb-space-xs tracking-tight">
          {t('सदस्य शेयर पूँजी तथा मुद्दती निक्षेप पोर्टफोलियो', 'Member Wealth & Term Holdings')}
        </h1>
<p className="font-body-md text-body-md text-surface-variant max-w-xl">
          {t(
            'सहकारी शेयर पूँजी स्वामित्व, प्रमाणित लाभांश र ११.०% सम्म प्रतिफल दिने मुद्दती निक्षेप पोर्टफोलियो व्यवस्थापन।',
            'Track cooperative equity ownership, certified share dividends, and high-yield Mudhati (Fixed Deposit) portfolios yielding up to 11.0% per annum under Unako SACCOS regulatory security.'
          )}
        </p>
</div>
{/*  Quick Total Value Display  */}
<div className="flex items-center gap-space-md bg-surface-dark-card p-space-md rounded-xl">
<div className="p-space-sm bg-primary/20 rounded-lg text-brand-accent-lime">
<span className="material-symbols-outlined text-[32px]">assured_workload</span>
</div>
<div>
<span className="font-label-sm text-label-sm text-surface-variant block uppercase tracking-wider">{t('कुल शेयर तथा मुद्दती बचत', 'Total Equity & Deposits')}</span>
<div className="flex items-baseline gap-space-xs">
<span className="font-label-md text-label-md text-brand-accent-lime">NPR</span>
<span className="font-headline-lg text-headline-lg font-extrabold text-surface-canvas tracking-tight">90,350</span>
</div>
<span className="font-label-sm text-label-sm text-surface-dim flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-status-success">trending_up</span>
            {t('+१२.०% प्रक्षेपित लाभांश', '+12.0% Projected AGM Yield')}
          </span>
</div>
</div>
</div>
{/*  Cooperative Ownership Perks Strip  */}
<div className="mt-space-lg pt-space-md flex flex-wrap items-center gap-y-3 gap-x-8 text-surface-variant text-body-sm font-body-sm bg-surface-dark/40 rounded-lg px-space-md py-space-sm">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-brand-accent-lime text-[18px]">verified_user</span>
<span>{t('तत्काल कर्जा सुविधा: मुद्दती प्रमाणपत्रको ९०% सम्म', 'Instant Loan Margin: Up to 90% against FD certificate')}</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-brand-accent-lime text-[18px]">how_to_vote</span>
<span>{t('प्रजातान्त्रिक स्वामित्व: १ सदस्य = १ मत', 'Democratic Ownership: 1 Member = 1 Sovereign Vote')}</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-brand-accent-lime text-[18px]">health_and_safety</span>
<span>{t('सदस्य कल्याण तथा स्वास्थ्य सुरक्षा योजना समावेश', 'Automatic Member Welfare & Healthcare Suraksha Coverage')}</span>
</div>
</div>
</div>
{/*  SECTION 1: SHARE CAPITAL MANAGEMENT  */}
<section className="space-y-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
<div>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">{t('खण्ड ०१ • सदस्य सेयर पुँजी', 'Part 01 • Member Share Capital')}</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{t('सेयर पुँजी तथा लाभांश विवरण', 'Share Capital & Dividend Ledgers')}</h2>
</div>
<div className="flex items-center gap-space-sm">
<button className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-card hover:bg-surface-container-high text-on-surface shadow-sm transition-all font-label-md text-label-md cursor-pointer" id="btnViewCert" onClick={() => setShowCertModal(true)}>
<span className="material-symbols-outlined text-[18px] text-primary">badge</span>
<span>{t('डिजिटल प्रमाणपत्र हेर्नुहोस्', 'View Digital Certificate')}</span>
</button>
{features.enableSharePurchase && (
  <button className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm transition-all font-label-md text-label-md cursor-pointer" id="btnOpenShareModal" onClick={() => setShowPurchaseModal(true)}>
  <span className="material-symbols-outlined text-[18px]">add_circle</span>
  <span>{t('थप सेयर खरिद', 'Purchase Additional Shares')}</span>
  </button>
)}
</div>
</div>
{/*  Share Grid  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
{/*  Certificate Card  */}
<div className="lg:col-span-5 bg-surface-card rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden">
<div className="absolute -right-8 -top-8 w-36 h-36 bg-surface-container-low rounded-full pointer-events-none"></div>
<div>
<div className="flex items-center justify-between mb-space-md">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[22px]">workspace_premium</span>
<span className="font-label-md text-label-md font-bold text-on-surface">{t('उनको सेयर स्वामित्व', 'Unako Share Ownership')}</span>
</div>
<span className="px-space-sm py-1 bg-surface-container-low text-primary font-label-sm text-label-sm rounded-full font-semibold">{t('प्रमाणित अभिलेख', 'Verified Ledger')}</span>
</div>
<div className="space-y-space-md my-space-md">
<div className="flex justify-between items-baseline py-space-xs bg-surface-container-low/50 px-space-sm rounded-lg">
<span className="font-body-sm text-body-sm text-on-surface-variant">{t('बाँडफाँट सेयर कित्ता:', 'Allocated Share Count:')}</span>
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">{t('५०० कित्ता', '500 Shares')}</span>
</div>
<div className="flex justify-between items-baseline py-space-xs px-space-sm">
<span className="font-body-sm text-body-sm text-on-surface-variant">{t('प्रति कित्ता दर:', 'Par Value per Share:')}</span>
<span className="font-body-md text-body-md font-semibold text-on-surface">{t('रु. १००.००', 'NPR 100.00')}</span>
</div>
<div className="flex justify-between items-baseline py-space-xs px-space-sm bg-surface-container-low/50 rounded-lg">
<span className="font-body-sm text-body-sm text-on-surface-variant">{t('कुल सेयर पुँजी:', 'Total Share Capital:')}</span>
<span className="font-headline-md text-headline-md font-extrabold text-primary">{t('रु. ५०,०००', 'NPR 50,000')}</span>
</div>
<div className="flex justify-between items-baseline py-space-xs px-space-sm">
<span className="font-body-sm text-body-sm text-on-surface-variant">{t('प्रमाणपत्र दर्ता नं.:', 'Certificate Registry No.:')}</span>
<span className="font-tabular-mono text-tabular-mono text-on-surface-variant font-bold">SC-2070-0419</span>
</div>
<div className="flex justify-between items-baseline py-space-xs px-space-sm bg-surface-container-low/50 rounded-lg">
<span className="font-body-sm text-body-sm text-on-surface-variant">{t('सहकारी सदस्य मिति:', 'Cooperative Member Since:')}</span>
<span className="font-body-sm text-body-sm text-on-surface">{t('२०७० वैशाख १२ (गढवा)', '2070 Baisakh 12 (Gadhwa)')}</span>
</div>
</div>
</div>
<div className="pt-space-md flex items-center justify-between">
<div className="flex items-center gap-space-xs text-on-surface-variant text-label-sm font-label-sm">
<span className="material-symbols-outlined text-[16px] text-status-success">verified</span>
<span>{t('गैर-सदस्यलाई हस्तान्तरण गर्न नमिल्ने', 'Non-transferable to non-members')}</span>
</div>
<button className="font-label-sm text-label-sm text-primary font-bold hover:underline cursor-pointer" onClick={() => setShowCertModal(true)}>
            {t('छाप तथा प्रमाणपत्र हेर्नुहोस् →', 'Preview Seal →')}
          </button>
</div>
</div>
{/*  AGM Dividend History & Chart  */}
<div className="lg:col-span-7 bg-surface-card rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-md">
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">{t('वार्षिक साधारण सभा लाभांश अभिलेख', 'Annual AGM Dividend Records')}</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('सदस्यको बचत खातामा जम्मा भएको ऐतिहासिक नगद लाभांश', 'Historical cash dividend distribution to member savings')}</p>
</div>
<span className="font-label-sm text-label-sm bg-brand-accent-light text-primary px-space-sm py-1 rounded-full font-semibold">
            {t('औसत प्रतिफल: ११.३%', 'Avg. Yield: 11.3%')}
          </span>
</div>
{/*  Dividend Data Table / List  */}
<div className="space-y-space-sm mb-space-md">
{/*  Item 1: Proposed 31st AGM  */}
<div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                ३१
              </div>
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">{t('३१औं साधारण सभा प्रस्तावित लाभांश', '31st AGM Proposed Dividend')}</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('आर्थिक वर्ष २०८०/८१ • आगामी अनुमोदन', 'Fiscal Year 2080/81 • Upcoming Approval')}</p>
</div>
</div>
<div className="text-right">
<div className="font-headline-sm text-headline-sm font-extrabold text-primary">12.0%</div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('अनुमानित रु. ६,०००.००', 'Est. NPR 6,000.00')}</p>
</div>
</div>
{/*  Item 2: FY 2079/80  */}
<div className="flex items-center justify-between p-space-sm bg-surface-canvas rounded-xl">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center font-bold">
                ३०
              </div>
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">{t('३०औं वार्षिक साधारण सभा', '30th Annual General Assembly')}</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('आ.व. २०७९/८० • जम्मा मिति २०८० कार्तिक ०८', 'FY 2079/80 • Credited 2080 Kartik 08')}</p>
</div>
</div>
<div className="text-right">
<div className="font-headline-sm text-headline-sm font-bold text-on-surface">11.2%</div>
<p className="font-label-sm text-label-sm text-status-success font-semibold">{t('+रु. ५,६००.०० जम्मा भयो', '+NPR 5,600.00 Credited')}</p>
</div>
</div>
{/*  Item 3: FY 2078/79  */}
<div className="flex items-center justify-between p-space-sm bg-surface-canvas rounded-xl">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center font-bold">
                २९
              </div>
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">{t('२९औं वार्षिक साधारण सभा', '29th Annual General Assembly')}</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('आ.व. २०७८/७९ • जम्मा मिति २०७९ मंसिर ०२', 'FY 2078/79 • Credited 2079 Mangshir 02')}</p>
</div>
</div>
<div className="text-right">
<div className="font-headline-sm text-headline-sm font-bold text-on-surface">10.8%</div>
<p className="font-label-sm text-label-sm text-status-success font-semibold">{t('+रु. ५,४००.०० जम्मा भयो', '+NPR 5,400.00 Credited')}</p>
</div>
</div>
</div>
{/*  Dividend Trend Sparkline Visualization  */}
<div className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between">
<div className="text-on-surface-variant font-body-sm text-body-sm">
<span className="font-bold text-on-surface">{t('३-वर्षे वृद्धि सूचक:', '3-Year Growth Vector:')}</span> {t('सदस्य कर्जा बचतबाट निरन्तर प्रतिफल भुक्तानी।', 'Consistent payout from member-led loan surpluses.')}
          </div>
{/*  Inline Sparkline SVG  */}
<svg className="w-36 h-8 text-primary overflow-visible" fill="none" viewBox="0 0 120 30">
<path d="M 5 22 Q 40 20 60 14 T 115 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
<circle className="fill-primary" cx="5" cy="22" r="3"></circle>
<circle className="fill-primary" cx="60" cy="14" r="3"></circle>
<circle className="fill-brand-accent-lime stroke-primary" cx="115" cy="6" r="3.5" strokeWidth="2"></circle>
</svg>
</div>
</div>
</div>
</section>
{/*  SECTION 2: FIXED DEPOSIT PORTFOLIO & NEW OPENING WIDGET  */}
<section className="space-y-space-md pt-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
<div>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">{t('खण्ड ०२ • मुद्दती निक्षेप', 'Part 02 • Fixed Term Deposit')}</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{t('सक्रिय मुद्दती निक्षेप तथा बचत वृद्धि', 'Active Term Deposit & Growth Engine')}</h2>
</div>
<div className="flex items-center gap-space-xs text-body-sm font-body-sm text-on-surface-variant">
<span className="material-symbols-outlined text-[18px] text-status-success">lock</span>
<span>{t('निश्चित प्रतिफल • सहकारी ऐन अनुसार सुरक्षित', 'Guaranteed Returns • Regulated under Nepal Cooperative Act')}</span>
</div>
</div>
{/*  Mudhati Bento Grid: Left Active Certificate, Right Interactive Calculator  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
{/*  Current Active FD Certificate  */}
<div className="lg:col-span-5 bg-surface-card rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between pb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[24px]">account_balance</span>
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">{t('मुद्दती प्रमाणपत्र', 'Term Deposit Certificate')}</h3>
<span className="font-tabular-mono text-tabular-mono text-xs text-on-surface-variant font-bold">{t('प्रमाणपत्र: #FD-88219', 'CERT: #FD-88219')}</span>
</div>
</div>
<span className="px-space-sm py-1 rounded-full bg-brand-accent-light text-status-success font-label-sm text-label-sm font-bold flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
              {t('ब्याज आर्जन सक्रिय', 'Earning Active')}
            </span>
</div>
{/*  Principal Figure  */}
<div className="my-space-md p-space-md bg-surface-container-low rounded-xl">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">{t('मुद्दती साँवा रकम', 'Principal Locked Value')}</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-sm text-headline-sm text-primary font-bold">NPR</span>
<span className="font-headline-2xl text-headline-2xl font-extrabold text-on-surface tracking-tight leading-none">40,350</span>
</div>
<div className="mt-space-sm flex items-center justify-between text-body-sm font-body-sm">
<span className="text-on-surface-variant">{t('वार्षिक निश्चित ब्याजदर:', 'Annual Guaranteed Rate:')}</span>
<span className="font-headline-sm text-headline-sm font-bold text-primary">{t('१०.०% वार्षिक', '10.0% p.a.')}</span>
</div>
</div>
{/*  Timeline & Maturity Countdown  */}
<div className="space-y-space-sm">
<div className="flex justify-between items-center text-body-sm font-body-sm">
<span className="text-on-surface-variant">{t('जम्मा मिति:', 'Start Date:')}</span>
<span className="font-semibold text-on-surface">{t('२०८० असोज १५', '2080 Ashoj 15')}</span>
</div>
<div className="flex justify-between items-center text-body-sm font-body-sm">
<span className="text-on-surface-variant">{t('परिपक्वता मिति:', 'Maturity Date:')}</span>
<span className="font-semibold text-on-surface">{t('२०८२ असोज १४ (२ वर्ष)', '2082 Ashoj 14 (2 Years)')}</span>
</div>
<div className="flex justify-between items-center text-body-sm font-body-sm">
<span className="text-on-surface-variant">{t('ब्याज भुक्तानी तालिका:', 'Payout Schedule:')}</span>
<span className="font-semibold text-primary">{t('त्रैमासिक ब्याज भुक्तानी', 'Quarterly Payout')}</span>
</div>
<div className="flex justify-between items-center text-body-sm font-body-sm">
<span className="text-on-surface-variant">{t('हालसम्म आर्जित ब्याज:', 'Accrued Interest to Date:')}</span>
<span className="font-semibold text-status-success">{t('रु. ५,७१६.२५', 'NPR 5,716.25')}</span>
</div>
{/*  Visual Progress Bar  */}
<div className="pt-space-xs">
<div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant mb-1">
<span>{t('व्यतीत अवधि: १७ महिना', 'Tenor Elapsed: 17 Months')}</span>
<span className="font-bold text-primary">{t('७ महिना बाँकी', '7 Months Remaining')}</span>
</div>
<div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{"width":"70%"}}></div>
</div>
</div>
</div>
</div>
{/*  Loan Against FD action  */}
<div className="mt-space-lg pt-space-md bg-surface-canvas p-space-sm rounded-xl flex items-center justify-between">
<div>
<p className="font-label-sm text-label-sm font-bold text-on-surface">{t('तत्काल कर्जा सुविधा', 'Instant Credit Line')}</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('रु. ३६,३१५ (९०%) सम्म ऋण योग्य', 'Eligible for NPR 36,315 loan (90%)')}</p>
</div>
<button className="px-space-sm py-1.5 bg-surface-card hover:bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg font-semibold shadow-xs transition-colors cursor-pointer" onClick={() => setShowFdLoanModal(true)}>
            {t('ऋण लिनुहोस् →', 'Apply Loan →')}
          </button>
</div>
</div>
{/*  Interactive 'Open New Mudhati Fixed Deposit' Module  */}
<div className="lg:col-span-7 bg-surface-dark text-on-primary-container rounded-xl p-space-lg shadow-xl relative flex flex-col justify-between">
<div>
{/*  Header and Frequency switch  */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm">
<div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-brand-accent-lime text-[22px]">savings</span>
<h3 className="font-headline-md text-headline-md text-surface-canvas">{t('नयाँ मुद्दती निक्षेप खोल्नुहोस्', 'Open New Term Deposit')}</h3>
</div>
<p className="font-body-sm text-body-sm text-surface-variant mt-0.5">{t('तपाईंको नियमित बचत खाताबाट सिधै स्वचालित बुक गर्नुहोस्', 'Automated booking directly from your regular savings balance')}</p>
</div>
</div>
{/*  Interactive Calculator Inputs  */}
<div className="space-y-space-md my-space-md">
{/*  Amount Slider Control  */}
<div className="bg-surface-dark-card p-space-md rounded-xl space-y-space-sm">
<div className="flex items-center justify-between">
<label className="font-label-md text-label-md text-surface-variant" htmlFor="depositSlider">{t('मुद्दती रकम छान्नुहोस्', 'Select Deposit Amount')}</label>
<div className="flex items-baseline gap-1 bg-surface-dark px-space-md py-1 rounded-lg">
<span className="font-label-sm text-label-sm text-brand-accent-lime">NPR</span>
<span className="font-headline-sm text-headline-sm font-extrabold text-surface-canvas" id="sliderValueText">100,000</span>
</div>
</div>
<input className="w-full h-2 bg-tertiary-container rounded-lg appearance-none cursor-pointer accent-brand-accent-lime focus:outline-none" id="depositSlider" max="500000" min="25000" step="5000" type="range" defaultValue="100000"/>
<div className="flex justify-between font-label-sm text-label-sm text-surface-variant">
<span>{t('रु. २५,००० (न्यूनतम)', 'NPR 25,000 (Min)')}</span>
<span>{t('रु. २,५०,०००', 'NPR 2,50,000')}</span>
<span>{t('रु. ५,००,००० (अधिकतम)', 'NPR 5,00,000 (Max)')}</span>
</div>
</div>
{/*  Tenor & Rate Selector Chips  */}
<div className="space-y-space-xs">
<label className="font-label-md text-label-md text-surface-variant block">{t('मुद्दती अवधि तथा निश्चित ब्याजदर', 'Deposit Tenor & Guaranteed Yield')}</label>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs" id="tenorGroup">
<button className="tenor-btn p-space-sm rounded-xl bg-surface-dark-card text-left hover:bg-surface-dark-card/80 transition-all flex flex-col justify-between cursor-pointer" data-rate="9.5" data-tenor="1" type="button">
<span className="font-label-sm text-label-sm text-surface-variant">{t('१ वर्ष', '1 Year')}</span>
<div className="mt-1">
<span className="font-headline-sm text-headline-sm text-surface-canvas font-bold">9.5%</span>
<span className="font-label-sm text-label-sm text-surface-dim block">p.a.</span>
</div>
</button>
<button className="tenor-btn p-space-sm rounded-xl bg-primary-container text-on-primary-container text-left transition-all flex flex-col justify-between cursor-pointer" data-rate="10.0" data-tenor="2" type="button">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-surface-dim">{t('२ वर्ष', '2 Years')}</span>
<span className="w-2 h-2 rounded-full bg-brand-accent-lime"></span>
</div>
<div className="mt-1">
<span className="font-headline-sm text-headline-sm text-surface-canvas font-bold">10.0%</span>
<span className="font-label-sm text-label-sm text-surface-dim block">{t('वार्षिक • लोकप्रिय', 'p.a. Popular')}</span>
</div>
</button>
<button className="tenor-btn p-space-sm rounded-xl bg-surface-dark-card text-left hover:bg-surface-dark-card/80 transition-all flex flex-col justify-between cursor-pointer" data-rate="10.5" data-tenor="3" type="button">
<span className="font-label-sm text-label-sm text-surface-variant">{t('३ वर्ष', '3 Years')}</span>
<div className="mt-1">
<span className="font-headline-sm text-headline-sm text-surface-canvas font-bold">10.5%</span>
<span className="font-label-sm text-label-sm text-surface-dim block">p.a.</span>
</div>
</button>
<button className="tenor-btn p-space-sm rounded-xl bg-surface-dark-card text-left hover:bg-surface-dark-card/80 transition-all flex flex-col justify-between cursor-pointer" data-rate="11.0" data-tenor="5" type="button">
<span className="font-label-sm text-label-sm text-surface-variant">{t('५ वर्ष', '5 Years')}</span>
<div className="mt-1">
<span className="font-headline-sm text-headline-sm text-brand-accent-lime font-bold">11.0%</span>
<span className="font-label-sm text-label-sm text-surface-dim block">{t('वार्षिक • उच्चतम', 'p.a. Maximum')}</span>
</div>
</button>
</div>
</div>
{/*  Interest Payout Frequency  */}
<div>
<label className="font-label-md text-label-md text-surface-variant block mb-space-xs">{t('ब्याज भुक्तानी विकल्प', 'Interest Payout Frequency')}</label>
<div className="grid grid-cols-3 gap-space-xs" id="frequencyGroup">
<button className="freq-btn py-2 px-space-sm rounded-lg bg-surface-dark-card text-surface-variant font-label-sm text-label-sm text-center transition-all hover:text-surface-canvas cursor-pointer" data-freq="monthly" type="button">
                  {t('मासिक', 'Monthly')}
                </button>
<button className="freq-btn py-2 px-space-sm rounded-lg bg-surface-container-lowest text-surface-dark font-semibold font-label-sm text-label-sm text-center transition-all cursor-pointer" data-freq="quarterly" type="button">
                  {t('त्रैमासिक', 'Quarterly')}
                </button>
<button className="freq-btn py-2 px-space-sm rounded-lg bg-surface-dark-card text-surface-variant font-label-sm text-label-sm text-center transition-all hover:text-surface-canvas cursor-pointer" data-freq="maturity" type="button">
                  {t('परिपक्वतामा एकमुष्ट', 'At Maturity')}
                </button>
</div>
</div>
</div>
{/*  Dynamic Computation Hero Plate  */}
<div className="bg-surface-dark-card p-space-md rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
<div>
<span className="font-label-sm text-label-sm text-surface-variant uppercase tracking-wider block">{t('परिपक्वतामा अनुमानित कुल प्रतिफल', 'Estimated Total Return at Maturity')}</span>
<div className="flex items-baseline gap-space-xs mt-0.5">
<span className="font-headline-sm text-headline-sm text-brand-accent-lime font-bold">NPR</span>
<span className="font-display-stat text-display-stat font-extrabold text-surface-canvas tracking-tight" id="projectedTotalText">120,000</span>
</div>
<div className="flex items-center gap-space-md text-body-sm font-body-sm mt-1">
<span className="text-surface-variant">{t('आर्जित ब्याज:', 'Interest Earned:')} <strong className="text-brand-accent-lime font-semibold" id="interestEarnedText">NPR 20,000</strong></span>
<span className="text-surface-variant hidden sm:inline">•</span>
<span className="text-surface-variant hidden sm:inline">{t('त्रैमासिक भुक्तानी:', 'Quarterly Payout:')} <strong className="text-surface-canvas font-semibold" id="periodicPayoutText">NPR 2,500</strong></span>
</div>
</div>
{/*  Submit Action  */}
<button className="px-space-lg py-space-md rounded-xl bg-brand-accent-lime hover:bg-status-success text-surface-dark font-bold font-label-md text-label-md flex items-center justify-center gap-space-xs whitespace-nowrap shadow-lg transition-all cursor-pointer" id="btnOpenMudhatiConfirm" onClick={() => setShowMudhatiModal(true)}>
<span>{t('मुद्दती निक्षेप खोल्नुहोस्', 'Create Fixed Deposit')}</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</div>
<div className="mt-space-md flex items-center justify-between text-xs text-surface-variant font-body-sm">
<span>{t('सदस्य बचत खाताबाट सिधै भुक्तानी (उपलब्ध: रु. १,२८,४५०.००)', 'Funded directly from Member Savings (Available: NPR 1,28,450.00)')}</span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-brand-accent-lime">shield_with_heart</span>
            {t('बिमा तथा कोष सुरक्षित', 'Insurance Protected')}
          </span>
</div>
</div>
</div>
</section>
{/*  SECTION 3: COOPERATIVE CAPITAL BENEFIT & GOVERNANCE TILES  */}
<section className="space-y-space-md pt-space-md">
<div>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">{t('खण्ड ०३ • सदस्य सुविधा तथा अधिकार', 'Part 03 • Member Privileges & Rights')}</span>
<h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">{t('सहकारी पुँजीका सुविधाहरू तथा मूल्य मान्यता', 'Cooperative Capital Privileges & Value Metrics')}</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
{/*  Privilege 1  */}
<div className="bg-surface-card rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[26px]">how_to_vote</span>
</div>
<span className="font-headline-xl text-headline-xl font-black text-primary/10 select-none">01</span>
</div>
<div className="my-space-md">
<h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">{t('प्रजातान्त्रिक मत तथा साधारण सभा अधिकार', 'Democratic Voice & AGM Rights')}</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">
            {t(
              'कम्तीमा १०० कित्ता सेयर स्वामित्वले वार्षिक साधारण सभामा मत दिने, प्रस्ताव राख्ने र लेखापरीक्षण समीक्षा गर्ने अधिकार दिन्छ।',
              'Holding at least 100 shares entitles you to vote, table proposals, and audit fiscal statements in annual cooperative elections.'
            )}
          </p>
</div>
<div className="font-label-sm text-label-sm text-primary font-bold flex items-center gap-1">
<span>{t('मतदान योग्यता: पूर्ण योग्य', 'Voting Status: Fully Eligible')}</span>
<span className="material-symbols-outlined text-[16px] text-status-success">check_circle</span>
</div>
</div>
{/*  Privilege 2  */}
<div className="bg-surface-card rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[26px]">real_estate_agent</span>
</div>
<span className="font-headline-xl text-headline-xl font-black text-primary/10 select-none">02</span>
</div>
<div className="my-space-md">
<h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">{t('९०% द्रुत धितो कर्जा सुविधा', '90% Fast-Track Collateral Loan')}</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">
            {t(
              'मुद्दती निक्षेप प्रमाणपत्र धितो राखी १.५% प्रिमियममा बिना कुनै झन्झट तत्काल आकस्मिक कर्जा पाउन सकिन्छ।',
              'Leverage Mudhati Fixed Deposit certificates as digital collateral for emergency liquidity at 1.5% over the deposit rate without paperwork.'
            )}
          </p>
</div>
<div className="font-label-sm text-label-sm text-primary font-bold flex items-center gap-1">
<span>{t('पूर्व-स्वीकृत सीमा: रु. ३६,३१५', 'Pre-approved Limit: NPR 36,315')}</span>
<span className="material-symbols-outlined text-[16px]">bolt</span>
</div>
</div>
{/*  Privilege 3  */}
<div className="bg-surface-card rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[26px]">family_restroom</span>
</div>
<span className="font-headline-xl text-headline-xl font-black text-primary/10 select-none">03</span>
</div>
<div className="my-space-md">
<h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">{t('सदस्य कल्याण तथा राहत कोष सुरक्षा', 'Member Welfare Fund Protection')}</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">
            {t(
              'सहकारी बचत तथा मुनाफाबाट आकस्मिक उपचार, प्रसूति खर्च र काजकिरिया सहयोग बापत रु. ५०,००० सम्म राहत उपलब्ध गराइन्छ।',
              'Cooperative surplus allocation provides up to NPR 50,000 for critical medical support, child maternity grants, and bereavement condolences.'
            )}
          </p>
</div>
<div className="font-label-sm text-label-sm text-status-success font-bold flex items-center gap-1">
<span>{t('सक्रिय सुविधा: उनको कल्याण कोष', 'Active Policy: Unako Kalyan Kosh')}</span>
<span className="material-symbols-outlined text-[16px]">health_and_safety</span>
</div>
</div>
</div>
</section>
</div>


      {/* Digital Share Certificate Modal */}
      {showCertModal && (
        <div onClick={() => setShowCertModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <div className=" fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto" id="shareCertModal">
<div className="bg-surface-card w-full max-w-4xl rounded-2xl shadow-2xl relative overflow- flex flex-col my-auto border border-emerald-900/20 animate-modal-in">
{/*  Modal Top Control Bar  */}
<div className="flex items-center justify-between px-space-lg py-space-sm bg-surface-container-low border-b border-outline-variant/30">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[22px]">verified_user</span>
<div>
<span className="font-label-md text-label-md font-bold text-on-surface">{t('डिजिटल सेयर दर्ता प्रमाणीकरण', 'Digital Share Registry Verification')}</span>
<span className=" sm:inline font-tabular-mono text-xs text-on-surface-variant ml-2 font-semibold">CERT-UKO-2070-0419</span>
</div>
</div>
<div className="flex items-center gap-2">
<div className=" sm:flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
        {t('सीबीएस सिङ्क्रोनाइज्ड', 'CBS Synchronized')}
      </div>
<button className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer" id="btnCloseCertModal" onClick={() => setShowCertModal(false)} title={t('बन्द गर्नुहोस्', 'Close')}>
<span className="material-symbols-outlined text-[22px]">close</span>
</button>
</div>
</div>
{/*  Scrollable Certificate Canvas Container  */}
<div className="p-4 sm:p-8 bg-slate-100 overflow-y-auto max-h-[78vh]">
{/*  Ornate Certificate Surface  */}
<div className="relative bg-[#fffdf9] p-4 sm:p-7 rounded-xl shadow-md border-8 border-[#0c4a34]/15 overflow-">
{/*  Decorative Guilloche/Pattern & Inner Border  */}
<div className="cert-guilloche-pattern p-4 sm:p-6 rounded-lg cert-border-double relative">
{/*  Corner Cornerpiece Embellishments  */}
<div className="absolute top-1 left-1 text-primary text-xs font-serif select-none pointer-events-none opacity-60">❖</div>
<div className="absolute top-1 right-1 text-primary text-xs font-serif select-none pointer-events-none opacity-60">❖</div>
<div className="absolute bottom-1 left-1 text-primary text-xs font-serif select-none pointer-events-none opacity-60">❖</div>
<div className="absolute bottom-1 right-1 text-primary text-xs font-serif select-none pointer-events-none opacity-60">❖</div>
{/*  Watermark Background Logo  */}
<div className="absolute inset-0 flex items-center justify-center opacity-[0.045] pointer-events-none">
<img alt="watermark" className="w-96 h-96 object-contain grayscale" src={logoUrl}/>
</div>
{/*  Header: Cooperative Identity & Registration  */}
<div className="relative z-10 text-center pb-4 border-b border-emerald-800/20">
<div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2">
<img alt="Unako SACCOS Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-sm" src={logoUrl}/>
<div className="text-center sm:text-left">
<span className="text-xs font-semibold text-emerald-800 tracking-wider block uppercase">{t('सहकारी ऐन तथा नियमावली अनुसार स्थापित', 'Established under Cooperative Act & Rules')}</span>
<h2 className="text-xl sm:text-2xl md:text-[26px] font-bold text-[#005235] tracking-tight font-headline-lg">
                {t('उनको बचत तथा ऋण सहकारी संस्था लि.', 'Unako Savings and Credit Co-operative Society Ltd.')}
              </h2>
<p className="text-xs sm:text-sm font-semibold text-on-surface-variant font-label-md">
                Unako Savings and Credit Co-operative Society Ltd.
              </p>
</div>
</div>
<div className="inline-flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant mt-1 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-100">
<span className="font-semibold text-primary">{t('दर्ता नं. ४२१/०६४/०६९', 'Regd. No. 421/064/069')}</span>
<span>•</span>
<span>{t('कार्यक्षेत्र: गढवा गाउँपालिका, देउखुरी, दाङ', 'Work Area: Gadhwa Rural Municipality, Deukhuri, Dang')}</span>
<span>•</span>
<span className="font-tabular-mono text-emerald-900 font-bold">{t('प्यान नं: ३०२४८९१०२', 'PAN No: 302489102')}</span>
</div>
{/*  Certificate Title Ribbon  */}
<div className="mt-4 pt-1">
<div className="inline-block relative">
<span className="inline-block bg-[#006b47] text-white px-6 py-1.5 rounded-md font-headline-sm text-sm sm:text-base md:text-lg font-bold shadow-sm tracking-wide">
                {t('सदस्यता तथा सेयर स्वामित्व प्रमाणपत्र', 'Membership & Share Ownership Certificate')}
              </span>
<span className="block text-[11px] font-semibold text-emerald-900 mt-1 uppercase tracking-wider">
                {t('सेयर स्वामित्व तथा सदस्यताको आधिकारिक प्रमाणपत्र', 'Official Certificate of Share Ownership & Membership')}
              </span>
</div>
</div>
{/*  Top Meta: Reg No and Barcode Hash  */}
<div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-tabular-mono bg-white/80 p-2 rounded-lg border border-emerald-900/10">
<div className="flex items-center gap-1.5">
<span className="text-on-surface-variant font-medium">{t('प्रमाणपत्र नं.:', 'Serial No:')}</span>
<span className="font-bold text-primary text-sm tracking-wider">CERT-UKO-2070-0419</span>
</div>
<div className="flex items-center gap-1.5 text-emerald-950">
<span className="material-symbols-outlined text-[14px] text-status-success">lock</span>
<span className="text-[11px] font-mono">CBS-SHA256: 9f8a42b10c...2081d4</span>
</div>
</div>
</div>
{/*  Section: Member Dossier Information Grid  */}
<div className="relative z-10 mt-4 p-3 sm:p-4 bg-white/90 rounded-xl border border-emerald-900/10 shadow-xs">
<h4 className="text-xs uppercase font-bold text-primary tracking-wider mb-2 flex items-center gap-1">
<span className="material-symbols-outlined text-[15px]">person</span>
            {t('सदस्य विवरण', 'Member Particulars')}
          </h4>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-xs sm:text-sm">
<div className="bg-emerald-50/40 p-2 rounded-lg">
<span className="text-on-surface-variant block text-[11px]">{t('सदस्यको नाम:', 'Member Name:')}</span>
<span className="font-bold text-on-surface text-sm">{t('श्री हरि प्रसाद चौधरी', 'Hari Prasad Chaudhary')}</span>
</div>
<div className="bg-emerald-50/40 p-2 rounded-lg">
<span className="text-on-surface-variant block text-[11px]">{t('सदस्य नं.:', 'Member No.:')}</span>
<span className="font-bold font-tabular-mono text-primary text-sm">UKO-2070-08842</span>
<span className="block text-[11px] text-status-success font-semibold">{t('स्थिति: सक्रिय साधारण सदस्य', 'Status: Active Ordinary Member')}</span>
</div>
<div className="bg-emerald-50/40 p-2 rounded-lg">
<span className="text-on-surface-variant block text-[11px]">{t('नागरिकता नं.:', 'Citizenship No.:')}</span>
<span className="font-semibold text-on-surface font-tabular-mono">{t('५२-०१-६८-०४२९१ (दाङ)', '52-01-68-04291 (Dang)')}</span>
<span className="block text-[11px] text-on-surface-variant">{t('जारी मिति: २०६८/०३/१४', 'Issued: 2068/03/14')}</span>
</div>
<div className="bg-emerald-50/40 p-2 rounded-lg">
<span className="text-on-surface-variant block text-[11px]">{t('बाबु / पतिको नाम:', "Father's Name:")}</span>
<span className="font-semibold text-on-surface">{t('स्व. राम चरण चौधरी', 'Late Ram Charan Chaudhary')}</span>
</div>
<div className="bg-emerald-50/40 p-2 rounded-lg sm:col-span-2">
<span className="text-on-surface-variant block text-[11px]">{t('स्थायी ठेगाना:', 'Permanent Address:')}</span>
<span className="font-semibold text-on-surface">{t('गढवा गाउँपालिका वडा नं. ५, चैनपुर, देउखुरी, दाङ', 'Gadhwa-5, Chainpur, Deukhuri, Dang')}</span>
</div>
</div>
</div>
{/*  Section: Certified Share Capital Allotment Breakdown Table  */}
<div className="relative z-10 mt-4 overflow- rounded-xl border border-emerald-900/15 shadow-xs bg-white">
<div className="bg-primary-container px-3 py-2 text-on-primary-container flex items-center justify-between">
<span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">pie_chart</span>
              {t('प्रमाणित सेयर स्वामित्व विवरण', 'Shareholding Allotment Particulars')}
            </span>
<span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded">{t('साधारण सेयर', 'Ordinary Shares')}</span>
</div>
<table className="w-full text-left text-xs border-collapse">
<thead className="bg-emerald-50/80 text-emerald-950 font-bold border-b border-emerald-100">
<tr>
<th className="p-2 sm:p-2.5">{t('जम्मा कित्ता', 'Total Shares')}</th>
<th className="p-2 sm:p-2.5">{t('कित्ता नम्बर दायरा', 'Share Number Range')}</th>
<th className="p-2 sm:p-2.5 text-right">{t('दर प्रति सेयर', 'Face Value per Share')}</th>
<th className="p-2 sm:p-2.5 text-right">{t('कुल सेयर पुँजी', 'Total Share Capital')}</th>
</tr>
</thead>
<tbody className="divide-y divide-emerald-100/60 font-medium">
<tr className="hover:bg-emerald-50/30 transition-colors">
<td className="p-2.5 font-bold text-on-surface text-sm sm:text-base">
                  {t('५०० कित्ता', '500 Shares')}
</td>
<td className="p-2.5 font-tabular-mono text-primary font-semibold">
                  {t('०२४८५०१ देखि ०२४९००० सम्म', 'From 0248501 To 0249000')}
</td>
<td className="p-2.5 text-right font-tabular-mono text-on-surface font-semibold text-sm">
                  {t('रु. १००.००', 'NPR 100.00')}
</td>
<td className="p-2.5 text-right font-bold text-primary text-base sm:text-lg font-headline-sm">
                  {t('रु. ५०,०००/-', 'NPR 50,000/-')}
</td>
</tr>
</tbody>
</table>
{/*  Amount In Words & Issue Date Banner  */}
<div className="p-3 bg-emerald-50/60 border-t border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
<div>
<span className="text-on-surface-variant font-semibold">{t('अक्षरेपी:', 'In Words:')}</span>
<span className="font-bold text-emerald-900 ml-1">{t('पचास हजार रुपैयाँ मात्र', 'Fifty Thousand Rupees Only')}</span>
</div>
<div className="flex items-center gap-1 font-semibold text-on-surface">
<span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
<span>{t('जारी मिति:', 'Issue Date:')}</span>
<span className="text-primary font-tabular-mono">{t('२०७० वैशाख १२', '2013 April 25 (2070 Baisakh 12)')}</span>
</div>
</div>
</div>
{/*  Section: Signatures & Official Co-op Golden-Green Stamp Seal  */}
<div className="relative z-10 mt-6 pt-2 grid grid-cols-3 gap-2 sm:gap-4 items-end text-center">
{/*  Signature 1: Manager  */}
<div className="flex flex-col items-center">
<div className="h-10 flex items-center justify-center italic text-xs font-serif text-slate-500 select-none">
              Bhojraj Tharu
            </div>
<div className="w-full max-w-[140px] h-[1.5px] bg-emerald-950/40 mb-1"></div>
<span className="text-[11px] sm:text-xs font-bold text-on-surface leading-tight">{t('भोजराज थारु', 'Bhojraj Tharu')}</span>
<span className="text-[10px] text-on-surface-variant block">{t('व्यवस्थापक / शाखा प्रमुख', 'Branch Manager')}</span>
</div>
{/*  Official Stamp Emblem  */}
<div className="flex flex-col items-center justify-center relative">
<div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-emerald-800/80 p-1 flex items-center justify-center bg-emerald-50/40 shadow-inner relative group">
<div className="w-full h-full rounded-full border border-dashed border-emerald-700/60 flex flex-col items-center justify-center text-center p-1 text-emerald-900">
<span className="text-[9px] font-extrabold tracking-tighter uppercase leading-none">{t('उनको साकोस', 'UNAKO SACCOS')}</span>
<img alt="Seal Logo" className="h-7 w-7 object-contain my-0.5" src="/unako-logo.png"/>
<span className="text-[8px] font-extrabold uppercase tracking-tight text-emerald-800">{t('आधिकारिक छाप', 'OFFICIAL SEAL')}</span>
<span className="text-[8px] font-semibold text-emerald-700">{t('देउखुरी दाङ', 'Deukhuri Dang')}</span>
</div>
<div className="absolute -top-1 right-2 bg-emerald-700 text-white rounded-full p-0.5 text-[10px]" title="Cryptographically Verified">
<span className="material-symbols-outlined text-[12px] block">verified</span>
</div>
</div>
</div>
{/*  Signature 3: President  */}
<div className="flex flex-col items-center">
<div className="h-10 flex items-center justify-center italic text-xs font-serif text-slate-500 select-none">
              Ram Bahadur Tharu
            </div>
<div className="w-full max-w-[140px] h-[1.5px] bg-emerald-950/40 mb-1"></div>
<span className="text-[11px] sm:text-xs font-bold text-on-surface leading-tight">{t('राम बहादुर थारु', 'Ram Bahadur Tharu')}</span>
<span className="text-[10px] text-on-surface-variant block">{t('संस्था अध्यक्ष', 'President')}</span>
</div>
</div>
{/*  Statutory Note Footnote  */}
<div className="relative z-10 mt-5 pt-3 border-t border-emerald-800/20 text-[10px] sm:text-[11px] text-on-surface-variant text-center flex flex-col sm:flex-row items-center justify-between gap-1">
<span>{t('* यो प्रमाणपत्र सहकारी नियमावली अनुसार सदस्य बाहेक अरुलाई हस्तान्तरण गर्न पाइने छैन।', '* This certificate is non-transferable to non-members pursuant to cooperative bylaws.')}</span>
<span className="font-tabular-mono text-emerald-900 font-semibold">Secure Token: #9901-2070-UKO-REG</span>
</div>
</div>
</div>
</div>
{/*  Modal Action Footer  */}
<div className="px-space-lg py-space-md bg-surface-card border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3">
<div className="flex items-center gap-2 text-xs text-on-surface-variant">
<span className="inline-flex items-center gap-1 text-primary bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 font-semibold cursor-help" title="Blockchain/CBS cryptographic hash verified">
<span className="material-symbols-outlined text-[15px] text-status-success">verified</span>
        {t('प्रतिलिपि प्रमाणित', 'Copy Verified')}
      </span>
<span className=" md:inline text-slate-400">|</span>
<span className=" md:inline">{t('सहकारी आधिकारिक अभिलेख अनुसार मान्य', 'Valid for Official Cooperative Disclosures')}</span>
</div>
<div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
<button className="px-space-md py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer" onClick={() => window.print()}>
<span className="material-symbols-outlined text-[18px]">print</span>
<span>{t('प्रिन्ट प्रमाणपत्र', 'Print Certificate')}</span>
</button>
<button className="px-space-md py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer" id="btnDownloadCertPdf">
<span className="material-symbols-outlined text-[18px]">download</span>
<span>{t('डाउनलोड PDF', 'Download PDF')}</span>
</button>
</div>
</div>
</div>
</div>
          </div>
        </div>
      )}

      {/* Purchase Additional Shares Modal */}
      {showPurchaseModal && (
        <div onClick={() => setShowPurchaseModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto" id="sharePurchaseModal">
<div className="bg-surface-card w-full max-w-2xl rounded-2xl shadow-2xl border border-emerald-900/20 my-auto overflow- animate-modal-in flex flex-col">
{/*  Header  */}
<div className="px-space-lg py-space-md bg-surface-container-low border-b border-outline-variant/30 flex items-start justify-between">
<div>
<div className="flex items-center gap-2">
<span className="p-1.5 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">savings</span>
</span>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
  {t('थप सेयर खरिद आवेदन', 'Apply for Additional Shares')}
</h3>
<span className=" sm:inline-flex items-center gap-1 text-[11px] bg-brand-accent-light text-primary px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/60">
<span className="material-symbols-outlined text-[13px] text-status-success">verified_user</span>
  {t('सहकारी ऐन २०७४ बमोजिम', 'Per Cooperatives Act 2074')}
</span>
</div>
<p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
  {t('उनको बचत तथा ऋण सहकारी संस्था लि. • सेयर पुँजी अभिवृद्धि योजना (आ.व. २०८१/८२)', 'Unako SACCOS Ltd. • Share Capital Enhancement Scheme (FY 2081/82)')}
</p>
</div>
<button onClick={() => setShowPurchaseModal(false)} className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer" title={t('बन्द गर्नुहोस्', 'Close')}>
<span className="material-symbols-outlined text-[22px]">close</span>
</button>
</div>
{/*  Modal Body  */}
<div className="p-space-lg space-y-space-md overflow-y-auto max-h-[75vh]">
{/*  Member & Current Share Holdings Summary Bar  */}
<div className="bg-emerald-50/60 rounded-xl p-space-md border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
<div>
<span className="text-[11px] text-on-surface-variant block font-medium">{t('सदस्य विवरण', 'Member Profile')}:</span>
<span className="font-bold text-on-surface">{t('श्री हरि प्रसाद चौधरी', 'Mr. Hari Prasad Chaudhary')}</span>
<span className="font-tabular-mono text-primary font-semibold block text-[11px]">UKO-2070-08842 ({t('गढवा-५, दाङ', 'Gadhwa-5, Dang')})</span>
</div>
<div className="h-px sm:h-8 bg-emerald-200/60 w-full sm:w-[1px]"></div>
<div>
<span className="text-[11px] text-on-surface-variant block font-medium">{t('हालको सेयर', 'Current Shares')}:</span>
<span className="font-bold text-emerald-950 font-headline-sm">{t('५०० कित्ता (रु. ५०,०००)', '500 Shares (NPR 50,000)')}</span>
</div>
<div className="h-px sm:h-8 bg-emerald-200/60 w-full sm:w-[1px]"></div>
<div>
<span className="text-[11px] text-on-surface-variant block font-medium">{t('खरिद सीमा', 'Eligible Ceiling')}:</span>
<span className="font-semibold text-primary">{t('अधिकतम २,००० कित्ता बाँकी', 'Max 2,000 shares remaining')}</span>
<span className="text-[10px] text-on-surface-variant block">{t('अधिकतम सीमा: २,५०० कित्ता (१५%)', 'Maximum ceiling: 2,500 shares (15%)')}</span>
</div>
</div>
{/*  Interactive Share Purchase Configuration  */}
<div className="space-y-space-sm">
<div className="flex items-center justify-between">
<label className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1.5" htmlFor="shareQtyInput">
<span>{t('थप सेयर कित्ता सङ्ख्या', 'Quantity of Additional Shares')}</span>
<span className="text-error">*</span>
</label>
<span className="text-xs font-tabular-mono text-on-surface-variant">{t('दर: रु. १००/कित्ता', 'Rate: NPR 100/share')}</span>
</div>
{/*  Quantity Input with Stepper Buttons  */}
<div className="relative flex items-center rounded-xl border border-outline-variant/30 bg-surface-container-low overflow-">
<button className="px-4 py-3 bg-surface-card hover:bg-surface-container-high text-on-surface font-bold text-lg border-r border-outline-variant/30 transition-colors cursor-pointer" type="button">−</button>
<input className="w-full h-12 px-4 bg-transparent text-center font-headline-sm text-headline-sm font-bold text-on-surface focus:outline-none" id="shareQtyInput" max="2000" min="10" step="10" type="number" defaultValue="100"/>
<button className="px-4 py-3 bg-surface-card hover:bg-surface-container-high text-on-surface font-bold text-lg border-l border-outline-variant/30 transition-colors cursor-pointer" type="button">+</button>
</div>
{/*  Quick Select Chips  */}
<div className="flex flex-wrap gap-1.5 pt-1">
<span className="text-xs text-on-surface-variant self-center mr-1">{t('द्रुत छनोट:', 'Quick Select:')}</span>
<button className="px-2.5 py-1 text-xs rounded-lg bg-surface-container-high hover:bg-primary/20 text-on-surface font-semibold transition-colors cursor-pointer" type="button">+{t('१० कित्ता', '10 Shares')}</button>
<button className="px-2.5 py-1 text-xs rounded-lg bg-surface-container-high hover:bg-primary/20 text-on-surface font-semibold transition-colors cursor-pointer" type="button">+{t('५० कित्ता', '50 Shares')}</button>
<button className="px-2.5 py-1 text-xs rounded-lg bg-primary-container text-on-primary-container font-semibold transition-colors cursor-pointer" type="button">+{t('१०० कित्ता', '100 Shares')}</button>
<button className="px-2.5 py-1 text-xs rounded-lg bg-surface-container-high hover:bg-primary/20 text-on-surface font-semibold transition-colors cursor-pointer" type="button">+{t('२५० कित्ता', '250 Shares')}</button>
<button className="px-2.5 py-1 text-xs rounded-lg bg-surface-container-high hover:bg-primary/20 text-on-surface font-semibold transition-colors cursor-pointer" type="button">+{t('५०० कित्ता', '500 Shares')}</button>
</div>
</div>
{/*  Financial Breakdown & Projected Benefits Box  */}
<div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant/30 space-y-2 text-xs sm:text-sm">
<div className="flex justify-between text-on-surface-variant">
<span>{t('प्रति कित्ता दर:', 'Par Value per Share:')}</span>
<span className="font-semibold text-on-surface">{t('रु. १००.०० (बिना कुनै प्रिमियम)', 'NPR 100.00 (Zero Premium)')}</span>
</div>
<div className="flex justify-between text-on-surface-variant">
<span>{t('थप सेयर रकम:', 'Capital Outlay:')}</span>
<span className="font-bold text-on-surface" id="shareBaseAmountText">{t('रु. १०,०००.००', 'NPR 10,000.00')}</span>
</div>
<div className="flex justify-between text-on-surface-variant">
<span>{t('दर्ता तथा प्रमाणीकरण शुल्क:', 'Stamp & Registration Fee:')}</span>
<span className="font-semibold text-status-success">{t('रु. ०.०० (निःशुल्क)', 'NPR 0.00 (Free)')}</span>
</div>
<div className="flex justify-between text-on-surface-variant pt-1 border-t border-outline-variant/30">
<span>{t('नयाँ कुल सेयर स्वामित्व:', 'New Total Share Ownership:')}</span>
<span className="font-bold text-primary" id="newTotalSharesText">{t('६०० कित्ता (रु. ६०,०००.००)', '600 Shares (NPR 60,000.00)')}</span>
</div>
<div className="flex justify-between items-center bg-brand-accent-light p-2 rounded-lg text-primary font-semibold">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-status-success">trending_up</span>
  {t('अनुमानित वार्षिक लाभांश (@ १२.०%):', 'Projected Annual Dividend (@ 12.0%):')}
</span>
<span className="font-bold text-status-success" id="projectedDivText">{t('रु. ७,२०० / वर्ष', 'NPR 7,200 / yr')}</span>
</div>
<div className="flex justify-between items-baseline pt-2 border-t border-outline-variant/30">
<span className="font-bold text-on-surface text-sm sm:text-base">{t('कुल भुक्तानी रकम:', 'Total Payable:')}</span>
<span className="font-headline-md text-headline-md font-extrabold text-primary" id="shareTotalRequired">NPR 10,000.00</span>
</div>
</div>
{/*  Source of Funds Selection  */}
<div className="space-y-2">
<label className="font-label-md text-label-md font-bold text-on-surface block">{t('भुक्तानीको स्रोत', 'Source of Payment')}</label>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
{/*  Option A: Regular Savings (Active default)  */}
<label className="flex flex-col justify-between p-3 rounded-xl border-2 border-primary bg-emerald-50/50 cursor-pointer relative shadow-xs">
<div className="flex items-center justify-between mb-1.5">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-primary">account_balance_wallet</span>
<span className="font-bold text-xs text-on-surface">{t('नियमित बचत खाता', 'Regular Savings')}</span>
</div>
<input defaultChecked={true} className="accent-primary" name="paymentSource" type="radio" value="savings"/>
</div>
<span className="text-[11px] text-on-surface-variant font-medium">{t('मौज्दात: रु. १,८४,५००', 'Balance: NPR 184,500')}</span>
<span className="text-[10px] text-status-success font-semibold mt-1 flex items-center gap-0.5">
<span className="material-symbols-outlined text-[12px]">bolt</span> {t('तुरुन्तै मिलान', 'Instant Clearance')}
</span>
</label>
{/*  Option B: Digital Wallet / ConnectIPS  */}
<label className="flex flex-col justify-between p-3 rounded-xl border border-outline-variant/30 bg-surface-card hover:bg-surface-container-low transition-colors cursor-pointer relative">
<div className="flex items-center justify-between mb-1.5">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-primary">phonelink_ring</span>
<span className="font-bold text-xs text-on-surface">{t('डिजिटल भुक्तानी', 'Digital Gateway')}</span>
</div>
<input className="accent-primary" name="paymentSource" type="radio" value="digital"/>
</div>
<span className="text-[11px] text-on-surface-variant font-medium">eSewa / Khalti / ConnectIPS</span>
<span className="text-[10px] text-on-surface-variant mt-1">{t('नेपाल पे गेटवे', 'NepalPay Rails')}</span>
</label>
{/*  Option C: Bank Voucher Upload  */}
<label className="flex flex-col justify-between p-3 rounded-xl border border-outline-variant/30 bg-surface-card hover:bg-surface-container-low transition-colors cursor-pointer relative">
<div className="flex items-center justify-between mb-1.5">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-primary">receipt_long</span>
<span className="font-bold text-xs text-on-surface">{t('बैंक भौचर दाखिला', 'Bank Voucher')}</span>
</div>
<input className="accent-primary" name="paymentSource" type="radio" value="voucher"/>
</div>
<span className="text-[11px] text-on-surface-variant font-medium">{t('राष्ट्रिय वाणिज्य / कृषि विकास', 'RBB / ADBL Bank')}</span>
<span className="text-[10px] text-on-surface-variant mt-1">{t('भौचर स्लिप अपलोड', 'Voucher Slip Upload')}</span>
</label>
</div>
</div>
{/*  Cooperative Statutory Declaration & Terms  */}
<div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
<label className="flex items-start gap-2.5 cursor-pointer">
<input defaultChecked={true} className="mt-0.5 h-4 w-4 rounded accent-primary text-primary focus:ring-0 cursor-pointer" id="shareTermsAgree" type="checkbox"/>
<span className="text-xs text-on-surface leading-relaxed">
  {t(
    'म सहकारीको विनियम, साधारण सभाको निर्णय तथा सहकारी ऐन २०७४ को अधिनमा रही थप सेयर खरिद गर्न मन्जुर गर्दछु। खरिद गरिएको सेयर गैर-सदस्यलाई हस्तान्तरण गर्न पाइने छैन तथा आगामी साधारण सभा (AGM) को लाभांश वितरणमा गणना हुनेछ।',
    'I agree to subscribe to additional shares pursuant to the cooperative bylaws, AGM decisions, and Cooperatives Act 2074. Shares are non-transferable to non-members and will accrue AGM dividends.'
  )}
</span>
</label>
</div>
</div>
{/*  Modal Footer Actions  */}
<div className="px-space-lg py-space-md bg-surface-card border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3">
<div className="flex items-center gap-1.5 text-xs text-on-surface-variant w-full sm:w-auto">
<span className="material-symbols-outlined text-[16px] text-status-success">lock</span>
<span>{t('२५६-बिट सुरक्षित सहकारी ट्रान्ज्याक्सन', '256-Bit Encrypted Secure Cooperative Rail')}</span>
</div>
<div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
<button onClick={() => setShowPurchaseModal(false)} className="px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs sm:text-sm transition-colors cursor-pointer w-1/3 sm:w-auto text-center" type="button">
  {t('रद्द गर्नुहोस्', 'Cancel')}
</button>
<button className="px-space-lg py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer w-2/3 sm:w-auto" id="btnSubmitShareOrder" onClick={handleSharePurchaseSubmit} type="button">
<span className="material-symbols-outlined text-[18px]">verified</span>
<span id="btnConfirmText">{t('थप सेयर खरिद पुष्टि गर्नुहोस् (रु. १०,०००)', 'Confirm Additional Share Purchase (NPR 10,000)')}</span>
</button>
</div>
</div>
</div>
</div>
          </div>
        </div>
      )}

      {/* FD Certificate & Loan Against FD Modal */}
      {showFdLoanModal && (
        <div onClick={() => setShowFdLoanModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/70 backdrop-blur-sm p-space-md overflow-y-auto" id="fdCertificateLoanModal"><div className="bg-surface-card w-full max-w-3xl rounded-2xl shadow-2xl overflow- flex flex-col my-auto border-2 border-primary/20"><div className="bg-surface-dark text-surface-canvas p-space-md flex items-center justify-between border-b border-primary/30"><div className="flex items-center gap-space-sm"><div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-brand-accent-lime"><span className="material-symbols-outlined text-[24px]">account_balance</span></div><div><div className="flex items-center gap-2"><h3 className="font-headline-sm text-headline-sm font-bold text-surface-canvas">{t('मुद्दती निक्षेप प्रमाणपत्र तथा कर्जा सुविधा', 'Term Deposit Certificate & Credit Line')}</h3><span className="px-2 py-0.5 rounded-full bg-brand-accent-light text-status-success font-label-sm text-xs font-bold">CBS Verified</span></div><p className="font-label-sm text-label-sm text-surface-variant">Fixed Deposit Certificate of Deposit &amp; 90% Credit Line</p></div></div><button onClick={() => setShowFdLoanModal(false)} className="p-1 rounded-full text-surface-variant hover:text-surface-canvas hover:bg-surface-dark-card transition-colors cursor-pointer" ><span className="material-symbols-outlined text-[24px]">close</span></button></div><div className="bg-surface-container-low px-space-md pt-space-xs border-b border-surface-container flex items-center gap-2"><button onClick={() => setShowFdLoanModal(false)} className="px-space-md py-2.5 font-label-md text-label-md font-bold text-primary border-b-2 border-primary flex items-center gap-1.5 bg-surface-card rounded-t-lg cursor-pointer"><span className="material-symbols-outlined text-[18px]">verified</span><span>{t('मुद्दती प्रमाणपत्र', 'E-Certificate View')}</span></button><button className="px-space-md py-2.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"><span className="material-symbols-outlined text-[18px]">bolt</span><span>{t('९०% तत्काल ऋण लिनुहोस्', 'Avail 90% Instant Loan')}</span></button></div><div className="p-space-lg overflow-y-auto max-h-[72vh] space-y-space-md bg-surface-canvas"><div className="bg-[#FBFDF9] p-space-lg rounded-xl border-4 border-double border-primary/40 shadow-sm relative"><div className="flex items-start justify-between border-b-2 border-primary/20 pb-space-sm mb-space-md"><div className="flex items-center gap-space-sm"><img alt="Unako SACCOS Logo" className="h-12 w-auto object-contain" src="/unako-logo.png"/><div><h2 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">उनको बचत तथा ऋण सहकारी संस्था लिमिटेड</h2><p className="font-label-sm text-xs text-on-surface-variant font-semibold">Unako Savings and Credit Co-operative Society Ltd.</p><p className="font-label-sm text-xs text-on-surface-variant">गढवा-५, चैनपुर, देउखुरी, दाङ • दर्ता नं: २०७०-०१ (सहकारी विभाग)</p></div></div><div className="text-right flex flex-col items-end"><div className="w-16 h-16 border-2 border-primary/30 rounded-lg p-1 bg-surface-card flex flex-col items-center justify-center"><span className="material-symbols-outlined text-primary text-[28px]">qr_code_2</span><span className="text-[9px] font-tabular-mono text-on-surface-variant font-bold">SCAN VERIFY</span></div><span className="text-[11px] font-tabular-mono text-primary font-bold mt-1">UKO-FD-2080-88219</span></div></div><div className="text-center mb-space-md"><span className="inline-block px-space-md py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold uppercase tracking-wider mb-1">Official Certificate of Term Deposit</span><h3 className="font-headline-md text-headline-md font-extrabold text-on-surface tracking-tight">{t('मुद्दती निक्षेप प्रमाणपत्र', 'Certificate of Fixed Deposit')}</h3></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm text-body-sm font-body-sm mb-space-md"><div className="bg-surface-card p-space-sm rounded-lg border border-primary/10"><span className="text-on-surface-variant block text-xs">{t('सदस्यको नाम', 'Member Name')}:</span><span className="font-headline-sm text-[16px] font-bold text-on-surface">{t('श्री हरि प्रसाद चौधरी', 'Hari Prasad Chaudhary')}</span><span className="text-xs text-on-surface-variant block font-tabular-mono">UKO-2070-08842</span></div><div className="bg-surface-card p-space-sm rounded-lg border border-primary/10"><span className="text-on-surface-variant block text-xs">{t('ठेगाना', 'Registered Address')}:</span><span className="font-bold text-on-surface">{t('गढवा-५, चैनपुर, दाङ', 'Gadhwa-5, Chainpur, Dang')}</span><span className="text-xs text-on-surface-variant block">९८४७८०००००</span></div><div className="bg-surface-card p-space-sm rounded-lg border border-primary/10 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs"><div className="flex-1"><span className="text-on-surface-variant block text-xs">{t('निक्षेप मूल रकम', 'Principal Locked Deposit')}:</span><div className="flex items-baseline gap-1 mt-0.5"><span className="font-headline-sm text-primary font-bold">NPR</span><span className="font-headline-lg text-headline-lg font-extrabold text-primary">४०,३५०.००</span><span className="text-xs text-on-surface-variant ml-1">({t('रु. चालीस हजार तीन सय पचास मात्र', 'Forty Thousand Three Hundred Fifty Only')})</span></div></div><div className="bg-primary/10 px-space-sm py-1.5 rounded-lg text-right"><span className="text-xs text-primary font-bold block">{t('वार्षिक ब्याजदर', 'Annual Yield')}:</span><span className="font-headline-sm font-extrabold text-primary">१०.०% p.a.</span></div></div><div className="bg-surface-card p-space-sm rounded-lg border border-primary/10"><span className="text-on-surface-variant block text-xs">{t('जम्मा मिति', 'Deposit Date')}:</span><span className="font-semibold text-on-surface">{t('२०८० असोज १५', '2023 Oct 01')}</span></div><div className="bg-surface-card p-space-sm rounded-lg border border-primary/10"><span className="text-on-surface-variant block text-xs">{t('भुक्तानी मिति', 'Maturity Date')}:</span><span className="font-semibold text-on-surface">{t('२०८२ असोज १४ (२ वर्ष)', '2025 Oct 01 (2 Years)')}</span></div><div className="bg-surface-card p-space-sm rounded-lg border border-primary/10"><span className="text-on-surface-variant block text-xs">{t('ब्याज भुक्तानी चक्र', 'Payout Mode')}:</span><span className="font-semibold text-primary">{t('त्रैमासिक (बचत खातामा)', 'Quarterly (To Savings A/C)')}</span></div><div className="bg-surface-card p-space-sm rounded-lg border border-primary/10"><span className="text-on-surface-variant block text-xs">{t('इच्छाएको व्यक्ति', 'Nominee')}:</span><span className="font-semibold text-on-surface">{t('सुनिता कुमारी चौधरी (श्रीमती)', 'Sunita Kumari Chaudhary (Spouse)')}</span></div></div><div className="pt-space-md border-t-2 border-primary/20 flex items-end justify-between"><div className="text-center"><div className="w-28 h-10 mx-auto flex items-center justify-center font-tabular-mono text-xs text-on-surface-variant italic">[Sign]</div><div className="h-0.5 w-32 bg-on-surface-variant/40 mx-auto my-1"></div><span className="font-label-sm text-xs font-bold text-on-surface block">{t('कोषाध्यक्ष', 'Treasurer')}</span></div><div className="w-24 h-24 rounded-full border-2 border-dashed border-primary bg-primary/10 flex items-center justify-center text-primary text-center p-2 shadow-xs"><span className="font-label-sm text-[11px] font-extrabold uppercase leading-tight">उनको साकोस<br/>मुद्दती छाप<br/>OFFICIAL SEAL</span></div><div className="text-center"><div className="w-28 h-10 mx-auto flex items-center justify-center font-tabular-mono text-xs text-on-surface-variant italic">[Sign]</div><div className="h-0.5 w-32 bg-on-surface-variant/40 mx-auto my-1"></div><span className="font-label-sm text-xs font-bold text-on-surface block">{t('कार्यकारी व्यवस्थापक', 'Manager')}</span></div></div></div><div className="bg-surface-dark text-surface-canvas p-space-md rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md shadow-lg"><div className="space-y-1"><div className="flex items-center gap-1.5 text-brand-accent-lime font-label-sm text-label-sm font-bold"><span className="material-symbols-outlined text-[20px]">bolt</span><span>{t('९०% तत्काल मुद्दती कर्जा सुविधा', '90% Instant Loan Against FD')}</span></div><p className="font-body-sm text-body-sm text-surface-variant">{t('तपाईंको यस मुद्दती प्रमाणपत्र धितोमा रु. ३६,३१५ (९०%) सम्म तत्काल कर्जा उपलब्ध छ। ब्याजदर: मुद्दती दर + १.५% मात्र (११.५% p.a.) | बिना धितो मूल्याङ्कन शुल्क।', 'Available credit up to NPR 36,315 (90%) against this FD at FD rate + 1.5% (11.5% p.a.) with zero appraisal fees.')}</p></div><button className="px-space-md py-2.5 rounded-xl bg-brand-accent-lime hover:bg-status-success text-surface-dark font-bold font-label-md text-label-md whitespace-nowrap flex items-center gap-1.5 shadow-md transition-all flex-shrink-0 cursor-pointer" ><span className="material-symbols-outlined text-[18px]">payments</span><span>{t('तत्काल कर्जा निकाल्नुहोस्', 'Avail Instant Loan')}</span></button></div></div><div className="p-space-md bg-surface-card border-t border-surface-container flex flex-wrap items-center justify-between gap-space-sm"><div className="flex items-center gap-space-xs text-xs text-on-surface-variant"><span className="material-symbols-outlined text-[16px] text-status-success">verified_user</span><span>Nepal Cooperative Act 2074 Recognized Digital Security</span></div><div className="flex items-center gap-space-sm"><button className="px-space-md py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors cursor-pointer" onClick={() => window.print()}><span className="material-symbols-outlined text-[18px]">print</span><span>{t('प्रिन्ट', 'Print')}</span></button><button className="px-space-md py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold font-label-md text-label-md flex items-center gap-1.5 shadow-sm transition-all cursor-pointer" ><span>{t('प्रमाणपत्र डाउनलोड PDF', 'Download PDF')}</span></button><button onClick={() => setShowFdLoanModal(false)} className="px-space-md py-2 rounded-xl bg-surface-card border border-outline-variant hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md transition-colors cursor-pointer" ><span>{t('बन्द गर्नुहोस्', 'Close')}</span></button></div></div></div></div>
          </div>
        </div>
      )}

      {/* Mudhati Confirmation Modal */}
      {showMudhatiModal && (
        <div onClick={() => setShowMudhatiModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto" id="mudhatiConfirmModal"><div className="bg-surface-card w-full max-w-3xl rounded-2xl shadow-2xl border border-emerald-900/20 my-auto overflow- flex flex-col"><div className="px-space-lg py-space-md bg-emerald-50/80 border-b border-emerald-100 flex items-start justify-between"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm flex-shrink-0"><span className="material-symbols-outlined text-[24px]">lock</span></div><div><div className="flex items-center gap-2"><h3 className="font-headline-sm text-headline-sm text-emerald-950 font-bold">{t('मुद्दती निक्षेप सम्झौता पुष्टि', 'Confirm Fixed Deposit Booking')}</h3><span className=" sm:inline-flex items-center gap-1 text-[11px] bg-brand-accent-light text-primary px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/60"><span className="material-symbols-outlined text-[13px] text-status-success">verified</span>CBS Synchronized</span></div><p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Fixed Deposit Booking Confirmation • Regulated under Nepal Cooperative Act 2074</p></div></div><button onClick={() => setShowMudhatiModal(false)} className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer" title={t('बन्द गर्नुहोस्', 'Close')}><span className="material-symbols-outlined text-[22px]">close</span></button></div><div className="p-space-lg space-y-space-md overflow-y-auto max-h-[75vh]"><div className="bg-surface-container-low rounded-xl p-space-md border border-emerald-800/20 flex flex-col sm:flex-row items-center justify-between gap-4"><div className="text-center sm:text-left"><div><span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">{t('मुद्दती साँवा रकम', 'Principal Deposit Amount')}</span><div className="flex items-baseline gap-1 mt-0.5"><span className="font-headline-md text-headline-md text-primary font-bold">NPR</span><span className="font-display-stat text-display-stat font-extrabold text-on-surface tracking-tight leading-none">1,00,000.00</span></div><span className="text-[11px] text-emerald-900 font-medium mt-1 block">{t('अक्षरेपी: एक लाख रुपैयाँ मात्र', 'In Words: One Hundred Thousand Rupees Only')}</span></div></div><div className="flex flex-col items-center sm:items-end gap-1.5"><span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold flex items-center gap-1.5 shadow-xs"><span className="material-symbols-outlined text-[16px]">military_tech</span>{t('१०.०% p.a. वार्षिक निश्चित दर', '10.0% p.a. Fixed Rate')}</span><span className="text-xs font-semibold text-on-surface flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-primary">calendar_today</span>{t('अवधि: २ वर्ष (२४ महिना)', 'Tenor: 2 Years (24 Months)')}</span><span className="text-[11px] text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[13px] text-status-success">event_available</span>{t('परिपक्वता: २०८३ फागुन २६', 'Maturity: 10 Mar 2027')}</span></div></div><div className="border border-outline-variant/30 rounded-xl overflow- shadow-xs"><div className="bg-surface-container-high px-space-md py-2 flex items-center justify-between border-b border-outline-variant/30"><span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-primary">pie_chart</span>{t('वित्तीय प्रतिफल तथा भुक्तानी विवरण', 'Financial Yield & Returns')}</span><span className="text-[11px] font-tabular-mono text-primary font-bold">CERT-FD-PROP-2081</span></div><div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-emerald-100/60 bg-surface-card text-xs sm:text-sm"><div className="p-space-md space-y-2.5"><div className="flex justify-between items-center"><span className="text-on-surface-variant">{t('ब्याज भुक्तानी तालिका:', 'Payout Schedule:')}</span><span className="font-bold text-on-surface">{t('त्रैमासिक भुक्तानी', 'Quarterly Payout')}</span></div><div className="flex justify-between items-center"><span className="text-on-surface-variant">{t('त्रैमासिक प्राप्त ब्याज:', 'Quarterly Interest:')}</span><span className="font-headline-sm text-headline-sm font-bold text-primary">NPR 2,500.00</span></div><div className="flex justify-between items-center"><span className="text-on-surface-variant">{t('कुल आर्जित ब्याज:', 'Total Interest:')}</span><span className="font-bold text-on-surface">NPR 20,000.00</span></div><div className="flex justify-between items-center pt-1 border-t border-emerald-100/60"><span className="font-semibold text-emerald-950">{t('परिपक्वतामा कुल भुक्तानी:', 'Total at Maturity:')}</span><span className="font-bold text-status-success font-headline-sm">NPR 1,20,000.00</span></div></div><div className="p-space-md space-y-2.5 bg-surface-container-low/30"><div className="flex justify-between items-center"><span className="text-on-surface-variant">{t('कर कट्टी:', 'Tax Deduction (TDS):')}</span><span className="font-medium text-on-surface">{t('५% अग्रिम कर', '5% Advance Tax')}</span></div><div className="flex justify-between items-center"><span className="text-on-surface-variant">{t('तत्काल कर्जा सुविधा:', 'Instant Credit Line:')}</span><span className="font-bold text-primary">{t('९०% सम्म (रु. ९०,०००)', 'Up to 90% (NPR 90,000)')}</span></div><div className="flex justify-between items-center"><span className="text-on-surface-variant">{t('कर्जा ब्याजदर अधिशेष:', 'Loan Interest Spread:')}</span><span className="font-medium text-on-surface">{t('मुद्दती दर + १.५% मात्र', 'FD Rate + 1.5% only')}</span></div><div className="flex justify-between items-center pt-1 border-t border-emerald-100/60"><span className="text-on-surface-variant">{t('सुरक्षण स्थिति:', 'Security Status:')}</span><span className="text-status-success font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">verified_user</span>{t('संस्थागत कोष सुरक्षित', 'Institutional Fund Guaranteed')}</span></div></div></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm"><div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5 text-xs"><div className="flex items-center gap-1.5 text-primary font-bold mb-1"><span className="material-symbols-outlined text-[16px]">account_balance_wallet</span><span>{t('भुक्तानीको स्रोत', 'Funding Account')}</span></div><div className="flex justify-between"><span className="text-on-surface-variant">{t('स्रोत खाता:', 'Debit Account:')}</span><span className="font-bold text-on-surface">{t('नियमित बचत खाता', 'Regular Savings')}</span></div><div className="flex justify-between"><span className="text-on-surface-variant">{t('खाता नम्बर:', 'Account No:')}</span><span className="font-tabular-mono text-on-surface">004-10294-88-01</span></div><div className="flex justify-between"><span className="text-on-surface-variant">{t('हालको मौज्दात:', 'Current Balance:')}</span><span className="font-tabular-mono text-on-surface">NPR १,८४,५००.००</span></div><div className="flex justify-between pt-1 border-t border-outline-variant/20 font-semibold"><span className="text-emerald-950">{t('कट्टी पछिको बाँकी बचत:', 'Post-Debit Balance:')}</span><span className="font-tabular-mono text-status-success font-bold">NPR ८४,५००.००</span></div></div><div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5 text-xs"><div className="flex items-center gap-1.5 text-primary font-bold mb-1"><span className="material-symbols-outlined text-[16px]">family_restroom</span><span>{t('हकवाला तथा परिपक्वता निर्देशन', 'Nominee & Instructions')}</span></div><div className="flex justify-between"><span className="text-on-surface-variant">{t('इच्छाएको व्यक्ति:', 'Nominee:')}</span><span className="font-bold text-on-surface">{t('सुनिता कुमारी चौधरी', 'Sunita Kumari Chaudhary')}</span></div><div className="flex justify-between"><span className="text-on-surface-variant">{t('सम्बन्ध र नागरिकता:', 'Relation & ID:')}</span><span className="text-on-surface-variant">{t('श्रीमती (५२-०१-७२-०३१४५)', 'Spouse (52-01-72-03145)')}</span></div><div className="flex justify-between"><span className="text-on-surface-variant">{t('परिपक्वता निर्देशन:', 'Maturity Instruction:')}</span><span className="font-medium text-primary">{t('बचत खातामा स्वतः दाखिला', 'Auto-credit to Savings')}</span></div><div className="flex justify-between pt-1 border-t border-outline-variant/20"><span className="text-on-surface-variant">{t('आकस्मिक फिर्ता:', 'Early Exit:')}</span><span className="text-on-surface-variant">{t('३ महिना पश्चात् नियमानुसार', 'After 3 months per bylaws')}</span></div></div></div><div className="p-3 rounded-xl bg-surface-container-low border border-emerald-800/20"><label className="flex items-start gap-2.5 cursor-pointer"><input defaultChecked={true} className="mt-0.5 h-4 w-4 rounded accent-primary text-primary focus:ring-0 cursor-pointer" id="mudhatiTermsAgree" type="checkbox"/><span className="text-xs text-on-surface leading-relaxed">{t('म उनको बचत तथा ऋण सहकारी संस्था लि. को मुद्दती निक्षेप सर्त तथा नियमहरू मन्जुर गर्दछु र उल्लिखित रकम (रु. १,००,०००) मेरो बचत खाताबाट कट्टी गरी मुद्दती प्रमाणपत्र जारी गर्न स्वीकृति दिन्छु।', 'I accept the Unako SACCOS Term Deposit Terms & Conditions and authorize debit of NPR 100,000 from my savings account to issue this deposit certificate.')}</span></label></div></div><div className="px-space-lg py-space-md bg-surface-card border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3"><div className="flex items-center gap-1.5 text-xs text-on-surface-variant w-full sm:w-auto"><span className="material-symbols-outlined text-[16px] text-status-success">security</span><span>{t('सहकारी ऐन २०७४ अन्तर्गत निक्षेप सुरक्षण कोषबाट १००% सुरक्षित', '100% Protected under Cooperative Act 2074 Deposit Security')}</span></div><div className="flex items-center gap-space-sm w-full sm:w-auto justify-end"><button onClick={() => setShowMudhatiModal(false)} className="px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs sm:text-sm transition-colors cursor-pointer w-1/3 sm:w-auto text-center" type="button">{t('रद्द गर्नुहोस्', 'Cancel')}</button><button onClick={handleMudhatiSubmit} className="px-space-lg py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer w-2/3 sm:w-auto" id="btnConfirmMudhatiBooking" type="button"><span className="material-symbols-outlined text-[18px]">verified</span><span>{t('मुद्दती निक्षेप पुष्टि गर्नुहोस् (रु. १,००,०००)', 'Confirm Mudhati Booking (NPR 100,000)')}</span></button></div></div></div></div>
          </div>
        </div>
      )}
    </div>
  );
}
