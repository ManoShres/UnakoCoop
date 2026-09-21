import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../../store/useLanguageStore';

export function LoanApplyPage() {
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(t('सहकारी ऋण आवेदन फारम सफलतापूर्वक दर्ता भयो!', 'Cooperative loan application successfully submitted!'));
    setTimeout(() => {
      navigate('/member/loan-portfolio-repayments');
    }, 2500);
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

      {/* Main Loan Application Form View */}
      <div className="flex flex-col w-full pb-space-2xl">
{/*  Dynamic Notification / Policy Bar  */}
<div className="mb-space-lg bg-surface-container-high rounded-xl p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[22px]">verified_user</span>
<p className="font-body-sm text-body-sm text-on-surface">
<span className="font-semibold text-primary">
  {t('सहकारी ऐन २०७४ र संस्थाको ऋण विनियमावली बमोजिम:', 'Per Cooperatives Act 2074 & Credit Bylaws:')}{' '}
</span>
{t('सदस्य सुरक्षण कोष तथा ३.५% सरकारी ब्याज अनुदान यस कर्जामा समावेश गरिएको छ।', 'Member security fund and government interest subsidy (3.5%) are included.')}
      </p>
</div>
<div className="flex items-center gap-space-xs self-end md:self-auto shrink-0">
<span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
<span className="font-label-sm text-label-sm text-primary font-semibold">
  {t('आवेदन कोड: APP-2081-AG-0419', 'Application Code: APP-2081-AG-0419')}
</span>
</div>
</div>
{/*  Page Header & Stepper Grid  */}
<div className="mb-space-xl grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-end">
<div className="xl:col-span-7">
<div className="flex items-center gap-space-xs text-primary mb-space-xs">
<span className="material-symbols-outlined text-[18px]">agriculture</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
  {t('उत्पादनमूलक कर्जा सेवा', 'Productive Agro Credit Service')}
</span>
</div>
<h1 className="font-headline-xl text-headline-xl text-on-surface font-extrabold tracking-tight">
        {t('सहकारी ऋण आवेदन फारम', 'Cooperative Loan Application Form')}
      </h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">
        {t(
          'सहकारी कर्जा आवेदन तथा धितो प्रमाणीकरण प्रणाली • सदस्य: हरि प्रसाद चौधरी (UKO-2070-08842)',
          'Cooperative Credit Application & Collateral Verification System • Member: Hari Prasad Chaudhary (UKO-2070-08842)'
        )}
      </p>
</div>
<div className="xl:col-span-5 flex flex-wrap items-center justify-start xl:justify-end gap-space-sm">
<button className="px-space-md py-space-sm rounded-xl bg-surface-card text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-all flex items-center gap-space-xs shadow-sm cursor-pointer">
<span className="material-symbols-outlined text-[18px]">bookmark_border</span>
<span>{t('मस्यौदा सुरक्षित राख्नुहोस्', 'Save Draft')}</span>
</button>
<button className="px-space-md py-space-sm rounded-xl bg-surface-card text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-all flex items-center gap-space-xs shadow-sm cursor-pointer">
<span className="material-symbols-outlined text-[18px]">print</span>
<span>{t('प्रिन्ट प्रिभ्यू', 'Print Preview')}</span>
</button>
</div>
</div>
{/*  4-Step Stepper Component  */}
<div className="mb-space-xl bg-surface-card rounded-xl p-space-md shadow-sm">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md relative">
{/*  Step 1: Completed  */}
<div className="flex items-center gap-space-sm bg-surface-container-low p-space-sm rounded-lg">
<div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
<span className="material-symbols-outlined text-[18px]">check</span>
</div>
<div className="min-w-0">
<p className="font-label-sm text-label-sm text-primary font-bold">{t('१. ऋण प्रकार र रकम', '1. Scheme & Amount')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant truncate">{t('रु. ३,००,००० • ९.५%', 'NPR 300,000 • 9.5%')}</p>
</div>
</div>
{/*  Step 2: Active  */}
<div className="flex items-center gap-space-sm bg-primary-container p-space-sm rounded-lg">
<div className="w-9 h-9 rounded-full bg-surface-card flex items-center justify-center text-primary font-bold shrink-0 shadow-sm">
          २
        </div>
<div className="min-w-0">
<p className="font-label-sm text-label-sm text-on-primary font-bold">{t('२. उद्देश्य तथा आयस्रोत', '2. Purpose & Cashflow')}</p>
<p className="font-body-sm text-body-sm text-on-primary/90 truncate">{t('मुर्रा भैंसी तथा गोठ विस्तार', 'Murrah Buffalo & Barn Expansion')}</p>
</div>
</div>
{/*  Step 3: Up Next  */}
<div className="flex items-center gap-space-sm bg-surface-canvas p-space-sm rounded-lg">
<div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold shrink-0">
          ३
        </div>
<div className="min-w-0">
<p className="font-label-sm text-label-sm text-on-surface font-semibold">{t('३. धितो / जमानी कागजात', '3. Collateral & Proofs')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant truncate">{t('लालपुर्जा र दुई साक्षी', 'Land Title & Two Guarantors')}</p>
</div>
</div>
{/*  Step 4: Up Next  */}
<div className="flex items-center gap-space-sm bg-surface-canvas p-space-sm rounded-lg">
<div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold shrink-0">
          ४
        </div>
<div className="min-w-0">
<p className="font-label-sm text-label-sm text-on-surface font-semibold">{t('४. पेश र सिफारिस', '4. Submission & Review')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant truncate">{t('ऋण उप-समिति मूल्याङ्कन', 'Loan Sub-Committee Review')}</p>
</div>
</div>
</div>
</div>
{/*  Primary Workspace: Two Columns  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
{/*  Left Column: Scheme Card & Details (5 Cols)  */}
<div className="lg:col-span-5 flex flex-col gap-space-lg">
{/*  defaultValue="" Loan Scheme Hero Card  */}
<div className="bg-surface-card rounded-xl shadow-md p-space-lg flex flex-col">
<div className="flex items-start justify-between gap-space-sm mb-space-sm">
<div className="bg-brand-accent-light text-primary font-label-sm text-label-sm px-space-sm py-space-xs rounded-full font-bold inline-flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">stars</span>
<span>{t('प्राथमिकता क्षेत्र कर्जा', 'Priority Agro Scheme')}</span>
</div>
<span className="font-tabular-mono text-tabular-mono text-xs text-on-surface-variant">{t('योजना कोड: AGRO-081', 'Scheme Code: AGRO-081')}</span>
</div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
          {t('उन्को कृषि तथा पशुपालन विस्तार कर्जा', 'Unako Agriculture & Livestock Expansion Loan')}
        </h2>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {t('दूध उत्पादक सदस्यहरूका लागि उन्नत पशुपालन तथा गोठ विस्तार धितो कर्जा योजना।', 'Dairy Buffalo & Agro Expansion Collateralized Scheme for Registered Dairy Producers.')}
        </p>
{/*  Scheme Metrics Box  */}
<div className="mt-space-md grid grid-cols-2 gap-space-sm">
<div className="bg-surface-container-low p-space-md rounded-xl">
<span className="font-label-sm text-label-sm text-on-surface-variant">{t('प्रभावकारी ब्याजदर', 'Effective Interest Rate')}</span>
<div className="flex items-baseline gap-1 mt-1">
<span className="font-headline-md text-headline-md text-primary font-black">६.०%</span>
<span className="font-label-sm text-label-sm text-on-surface-variant line-through">९.५%</span>
</div>
<span className="font-label-sm text-label-sm text-status-success font-semibold flex items-center gap-0.5 mt-1">
<span className="material-symbols-outlined text-[14px]">trending_down</span>
              {t('३.५% सरकारी अनुदान', '3.5% Govt Subsidy')}
            </span>
</div>
<div className="bg-surface-container-low p-space-md rounded-xl">
<span className="font-label-sm text-label-sm text-on-surface-variant">{t('अधिकतम भुक्तानी अवधि', 'Max Repayment Period')}</span>
<p className="font-headline-md text-headline-md text-on-surface font-black mt-1">{t('३ वर्ष', '3 Years')}</p>
<span className="font-label-sm text-label-sm text-on-surface-variant font-semibold mt-1 block">
              {t('३६ मासिक किस्ता', '36 Monthly Installments')}
            </span>
</div>
</div>
{/*  Loan Parameter Sliders (Interactive Mini-Calculators)  */}
<div className="mt-space-lg space-y-space-md">
<div>
<div className="flex justify-between text-on-surface mb-1">
<span className="font-label-md text-label-md font-semibold">{t('माग गरिएको ऋण रकम', 'Requested Loan Amount')}</span>
<span className="font-tabular-mono text-tabular-mono font-bold text-primary" id="loan-amount-display">{t('रु. ३,००,००० (३ लाख)', 'NPR 300,000 (3 Lakhs)')}</span>
</div>
<input className="w-full accent-primary h-2 bg-surface-container-high rounded-lg cursor-pointer" id="loan-amount-slider" max="1000000" min="50000" step="25000" type="range" defaultValue="300000"/>
<div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mt-1">
<span>{t('रु. ५०,०००', 'NPR 50,000')}</span>
<span>{t('रु. १०,००,०००', 'NPR 1,000,000')}</span>
</div>
</div>
<div>
<div className="flex justify-between text-on-surface mb-1">
<span className="font-label-md text-label-md font-semibold">{t('कर्जा चुक्ता अवधि', 'Loan Repayment Period')}</span>
<span className="font-tabular-mono text-tabular-mono font-bold text-primary" id="tenure-display">{t('३६ महिना (३ वर्ष)', '36 Months (3 Years)')}</span>
</div>
<input className="w-full accent-primary h-2 bg-surface-container-high rounded-lg cursor-pointer" id="tenure-slider" max="60" min="12" step="6" type="range" defaultValue="36"/>
<div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mt-1">
<span>{t('१ वर्ष (१२ महिना)', '1 Year (12 Mos)')}</span>
<span>{t('५ वर्ष (६० महिना)', '5 Years (60 Mos)')}</span>
</div>
</div>
</div>
{/*  Dark Repayment Estimator Tile  */}
<div className="mt-space-lg bg-surface-dark text-on-primary p-space-md rounded-xl shadow-lg relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-brand-accent-lime font-bold uppercase tracking-wider">{t('अनुमानित मासिक किस्ता', 'Estimated Monthly Installment (EMI)')}</span>
<span className="material-symbols-outlined text-brand-accent-lime text-[20px]">calculate</span>
</div>
<div className="mt-space-xs flex items-baseline gap-2">
<span className="font-display-stat text-display-stat text-on-primary font-black" id="calculated-emi">९,६१०</span>
<span className="font-label-md text-label-md text-slate-300">{t('/ महिना (रु.)', '/ Month (NPR)')}</span>
</div>
<p className="font-body-sm text-body-sm text-slate-300 mt-space-xs">
            {t('घट्दो ब्याज दर पद्धति। मासिक बचतबाट सोझै कट्टा हुने विकल्प उपलब्ध।', 'Diminishing Balance Model. Option available for auto-deduction from monthly savings.')}
          </p>
<div className="mt-space-md pt-space-sm border-t border-slate-700/60 grid grid-cols-2 gap-space-sm text-xs">
<div>
<span className="text-slate-400 block font-label-sm text-label-sm">{t('कुल सावाँ फिर्ता:', 'Total Principal:')}</span>
<span className="text-slate-200 font-tabular-mono text-tabular-mono font-bold" id="calculated-principal">{t('रु. ३,००,०००', 'NPR 300,000')}</span>
</div>
<div>
<span className="text-slate-400 block font-label-sm text-label-sm">{t('अनुमानित कुल ब्याज:', 'Estimated Total Interest:')}</span>
<span className="text-brand-accent-lime font-tabular-mono text-tabular-mono font-bold" id="calculated-interest">{t('रु. २८,८४०', 'NPR 28,840')}</span>
</div>
</div>
</div>
</div>
{/*  Financial Health & Cooperative Standing Card  */}
<div className="bg-surface-card rounded-xl shadow-sm p-space-lg">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-sm flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
<span>{t('संस्थामा सदस्यको वित्तीय हैसियत', "Member's Financial Standing in Cooperative")}</span>
</h3>
<div className="space-y-space-sm">
<div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg">
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">{t('सदस्य सेयर पूँजी', 'Member Share Capital')}</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('न्यूनतम १०% सेयर स्वामित्व कायम', 'Minimum 10% share ownership maintained')}</p>
</div>
<span className="font-tabular-mono text-tabular-mono font-bold text-primary">{t('रु. ३५,०००', 'NPR 35,000')}</span>
</div>
<div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg">
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">{t('नियमित क्रमिक बचत', 'Regular Mandatory Savings')}</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('खाता: UKO-SAV-9932 (मासिक रु. २,०००)', 'Account: UKO-SAV-9932 (NPR 2,000/mo)')}</p>
</div>
<span className="font-tabular-mono text-tabular-mono font-bold text-primary">{t('रु. ६४,५००', 'NPR 64,500')}</span>
</div>
<div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg">
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">{t('विगतको ऋण भुक्तानी इतिहास', 'Past Loan Repayment Track Record')}</p>
<p className="font-label-sm text-label-sm text-status-success font-semibold">{t('उत्कृष्ट (कुनै बक्यौता छैन)', 'Excellent (No Overdue / Zero Default)')}</p>
</div>
<span className="material-symbols-outlined text-status-success text-[20px]">verified</span>
</div>
</div>
</div>
{/*  Agricultural Site Photo Preview  */}
<div className="bg-surface-card rounded-xl shadow-sm p-space-md overflow-hidden">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-label-md text-label-md font-bold text-on-surface">{t('गोठ तथा पशुपालन स्थल फोटो', 'Farm Shed & Cattle Site Photo')}</span>
<span className="font-label-sm text-label-sm text-primary font-semibold">{t('निरीक्षण प्रमाणित', 'Inspection Verified')}</span>
</div>
<div className="relative h-48 w-full rounded-lg overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Dairy buffalo farming shed in rural Terai Nepal" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBH2GymDg5NjoYH8iafyQ1BbshZ0Q7RIguEUUJQ3oJh5S8u6ex2MyHkVKwZURnpRaIHc2ykesubUYRuAX5A3YJ2JkgZO_tsgtRNqdtd1-jceOHLk-O2Grda9qzZORBhD71vR50drFxtx7q3v8V1bNqHifNfoHQDtAKmPDBHDx4TTEiL9y2Gp6IIiRRa10Afrj5GclDzXNJs9ypswSSzlalPJWquVRo6k01uoruaWeitclikGZu3v1cu"/>
<div className="absolute bottom-2 left-2 bg-surface-dark/80 backdrop-blur-md px- space-sm py-1 rounded text-on-primary font-label-sm text-label-sm flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">location_on</span>
<span>{t('गढवा-५ चैनपुर, दाङ (क्षेत्रफल: १० कट्ठा)', 'Gadhwa-5 Chainpur, Dang (Area: 10 Kattha)')}</span>
</div>
</div>
</div>
</div>
{/*  Right Column: Project Details, Uploads & Guarantors (7 Cols)  */}
<div className="lg:col-span-7 flex flex-col gap-space-lg">
{/*  Section 1: Farming Project Details  */}
<div className="bg-surface-card rounded-xl shadow-sm p-space-lg">
<div className="flex items-center gap-space-xs mb-space-md pb-space-xs bg-surface-container-low p-space-sm rounded-lg">
<span className="material-symbols-outlined text-primary text-[22px]">pets</span>
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              {t('परियोजना तथा आम्दानी विवरण', 'Agro Project & Cashflow Details')}
            </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">
  {t('ऋण उपभोगको स्पष्ट प्रयोजन तथा किस्ता तिर्ने मासिक स्रोत खुलाउनुहोस्', 'Specify exact usage of loan and monthly source for installment repayment')}
</p>
</div>
</div>
<div className="space-y-space-md">
<div>
<label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
              {t('परियोजनाको नाम तथा विस्तृत विवरण *', 'Project Name & Detailed Description *')}
            </label>
<div className="bg-surface-canvas p-space-md rounded-xl">
<p className="font-headline-sm text-headline-sm text-primary font-bold">
                {t('उन्नत जातको मुर्रा भैंसी खरिद तथा गोठ सुधार परियोजना', 'High-Yield Murrah Buffalo Purchase & Barn Modernization')}
              </p>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t(
                  'दूध उत्पादन क्षमता दैनिक १८-२२ लिटर भएका २ वटा उन्नत मुर्रा जातका भैंसी भारतको हरियाणाबाट स्थानीय सहकारी समूह मार्फत आयात गरी गोठमा आधुनिक दानापानी र बायो-सुरक्षा संरचना थप गर्ने योजना।',
                  'Plan to procure 2 high-yield Murrah buffaloes (18-22 L/day) via cooperative cluster and construct modern feeding troughs and bio-security sheds.'
                )}
              </p>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div>
<label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                {t('मासिक अनुमानित दूध उत्पादन आम्दानी *', 'Estimated Monthly Milk Revenue *')}
              </label>
<div className="bg-surface-canvas px-space-md py-space-sm rounded-xl">
<span className="font-tabular-mono text-tabular-mono font-bold text-on-surface block">{t('रु. २८,००० - रु. ३५,०००', 'NPR 28,000 - NPR 35,000')}</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">{t('दैनिक २५-३० लिटर बिक्री @ रु. ६०/लि', 'Daily 25-30 Liters sale @ NPR 60/L')}</span>
</div>
</div>
<div>
<label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                {t('बिक्री तथा बजार व्यवस्थापन संयन्त्र *', 'Marketing & Sales Offtake Channel *')}
              </label>
<div className="bg-surface-canvas px-space-md py-space-sm rounded-xl flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
<div className="min-w-0">
<span className="font-label-md text-label-md font-bold text-on-surface block truncate">{t('चौरी दुग्ध उत्पादक सहकारी संकलन केन्द्र', 'Chauri Dairy Producer Cooperative Chilling Center')}</span>
<span className="font-label-sm text-label-sm text-status-success font-semibold">{t('औपचारिक सम्झौता भएको', 'Formal Supply Agreement (MOU Active)')}</span>
</div>
</div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div>
<label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                {t('अन्य पारिवारिक सहायक आम्दानी', 'Other Household Auxiliary Income')}
              </label>
<div className="bg-surface-canvas px-space-md py-space-sm rounded-xl">
<span className="font-tabular-mono text-tabular-mono font-bold text-on-surface block">{t('रु. १५,००० / महिना', 'NPR 15,000 / month')}</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">{t('तरकारी खेती तथा पोल्ट्री बिक्री', 'Vegetable farming and local poultry sales')}</span>
</div>
</div>
<div>
<label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                {t('किस्ता तिर्ने प्राथमिकताको बैंक / सेवा', 'Preferred Installment Repayment Method')}
              </label>
<div className="bg-surface-canvas px-space-md py-space-sm rounded-xl">
<span className="font-label-md text-label-md font-bold text-primary block">{t('उनको बचत खाताबाट स्वतः कट्टा', 'Auto-Debit from Unako Savings Account')}</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">{t('प्रत्येक महिनाको २५ गते', 'Every 25th of the month')}</span>
</div>
</div>
</div>
</div>
</div>
{/*  Section 2: Collateral & Document Upload Center  */}
<div className="bg-surface-card rounded-xl shadow-sm p-space-lg">
<div className="flex items-center justify-between mb-space-md pb-space-xs bg-surface-container-low p-space-sm rounded-lg">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[22px]">folder_shared</span>
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {t('धितो तथा आवश्यक कागजात दाखिला', 'Collateral & Required Documents Submission')}
              </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">
  {t('धितो सुरक्षणको आधिकारिक अभिलेख र मालपोत दाखिला प्रतिलिपि', 'Official land registry records and revenue tax receipts')}
</p>
</div>
</div>
<span className="font-label-sm text-label-sm bg-primary/10 text-primary font-bold px-2 py-1 rounded-full">
  {t('२/२ कागजात अपलोड', '2/2 Documents Uploaded')}
</span>
</div>
<div className="space-y-space-md">
{/*  Document 1: Land Title Deed  */}
<div className="bg-surface-canvas p-space-md rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">description</span>
</div>
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">
  {t('जग्गाको लालपुर्जा र वडाको चारकिल्ला प्रमाणित पत्र *', 'Land Ownership Deed (Lalpurja) & 4-Boundary Cert *')}
</p>
<div className="flex items-center gap-2 mt-0.5">
<span className="font-label-sm text-label-sm text-status-success font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
                    lalpurja_plot412.pdf (2.4 MB)
                  </span>
<span className="text-xs text-on-surface-variant font-tabular-mono text-tabular-mono">• {t('कित्ता नं. ४१२ (चैनपुर-५)', 'Plot No. 412 (Chainpur-5)')}</span>
</div>
</div>
</div>
<div className="flex items-center gap-space-xs self-end sm:self-auto shrink-0">
<button className="px-space-sm py-1 bg-surface-card hover:bg-surface-container-high rounded-lg text-primary font-label-sm text-label-sm font-semibold shadow-sm flex items-center gap-1 transition-all cursor-pointer">
<span className="material-symbols-outlined text-[16px]">visibility</span>
<span>{t('हेर्नुहोस्', 'View')}</span>
</button>
<button className="px-space-sm py-1 bg-surface-card hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-error font-label-sm text-label-sm shadow-sm transition-all flex items-center gap-1 cursor-pointer">
<span className="material-symbols-outlined text-[16px]">swap_horiz</span>
<span>{t('बदल्नुहोस्', 'Replace')}</span>
</button>
</div>
</div>
{/*  Document 2: Land Revenue Tax Receipt  */}
<div className="bg-surface-canvas p-space-md rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">receipt_long</span>
</div>
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">
  {t('मालपोत तिरो तिरेको रसिद (चालु आ.व. २०८०/८१) *', 'Land Revenue Tax Receipt (Current FY 2080/81) *')}
</p>
<div className="flex items-center gap-2 mt-0.5">
<span className="font-label-sm text-label-sm text-status-success font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
                    malpot_tax_receipt_2080_81.pdf (1.1 MB)
                  </span>
<span className="text-xs text-on-surface-variant font-tabular-mono text-tabular-mono">• {t('रसिद नं. ८८३४२', 'Receipt No. 88342')}</span>
</div>
</div>
</div>
<div className="flex items-center gap-space-xs self-end sm:self-auto shrink-0">
<button className="px-space-sm py-1 bg-surface-card hover:bg-surface-container-high rounded-lg text-primary font-label-sm text-label-sm font-semibold shadow-sm flex items-center gap-1 transition-all cursor-pointer">
<span className="material-symbols-outlined text-[16px]">visibility</span>
<span>{t('हेर्नुहोस्', 'View')}</span>
</button>
<button className="px-space-sm py-1 bg-surface-card hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-error font-label-sm text-label-sm shadow-sm transition-all flex items-center gap-1 cursor-pointer">
<span className="material-symbols-outlined text-[16px]">swap_horiz</span>
<span>{t('बदल्नुहोस्', 'Replace')}</span>
</button>
</div>
</div>
{/*  Document 3: Additional Document / Cattle Insurance  */}
<div className="bg-surface-container-low p-space-md rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-card text-on-surface-variant flex items-center justify-center shrink-0 shadow-sm">
<span className="material-symbols-outlined text-[24px]">health_and_safety</span>
</div>
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">
  {t('पशु बीमा पूर्व-स्वीकृति फारम', 'Livestock Insurance Pre-Approval Proposal')}
</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">
  {t('शिखर इन्स्योरेन्स वा नेको इन्स्योरेन्सको पशु स्वास्थ्य प्रमाण (ऐच्छिक)', 'Shikhar or Neco Insurance veterinary health certificate (Optional)')}
</p>
</div>
</div>
<button className="px-space-md py-space-xs bg-surface-card hover:bg-surface-container-high text-primary font-label-md text-label-md font-bold rounded-lg shadow-sm flex items-center gap-1 shrink-0 self-end sm:self-auto transition-all cursor-pointer">
<span className="material-symbols-outlined text-[18px]">cloud_upload</span>
<span>{t('अपलोड थप्नुहोस्', 'Add Upload')}</span>
</button>
</div>
</div>
</div>
{/*  Section 3: Cooperative Member Guarantors (दुई जना सदस्य साक्षी/जमानीकर्ता)  */}
<div className="bg-surface-card rounded-xl shadow-sm p-space-lg">
<div className="flex items-center justify-between mb-space-md pb-space-xs bg-surface-container-low p-space-sm rounded-lg">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[22px]">groups</span>
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {t('दुई जना सदस्य साक्षी / जमानीकर्ता', 'Two Cooperative Member Guarantors')}
              </h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">
  {t('संस्थाका सक्रिय नियमित बचतकर्ता सदस्यहरू जसको ऋण भाका नाघेको छैन', 'Active cooperative members in good standing with zero overdue loans')}
</p>
</div>
</div>
<span className="font-label-sm text-label-sm bg-status-success/10 text-status-success font-bold px-2 py-1 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">done_all</span>
            {t('दुवै प्रमाणीकृत', 'Both Verified')}
          </span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
{/*  Guarantor 1  */}
<div className="bg-surface-canvas p-space-md rounded-xl relative overflow-hidden flex flex-col justify-between">
<div className="flex items-start gap-space-sm">
<div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-headline-sm shrink-0">
                {t('रा', 'R')}
              </div>
<div className="min-w-0">
<div className="flex items-center gap-1">
<h4 className="font-label-md text-label-md font-bold text-on-surface truncate">{t('राम बहादुर चौधरी', 'Ram Bahadur Chaudhary')}</h4>
<span className="material-symbols-outlined text-status-success text-[16px]">verified</span>
</div>
<p className="font-tabular-mono text-tabular-mono text-xs text-on-surface-variant mt-0.5">ID: UKO-2068-01124</p>
<p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{t('ठेगाना: गढवा-५, दाङ', 'Address: Gadhwa-5, Dang')}</p>
</div>
</div>
<div className="mt-space-md pt-space-xs border-t border-slate-200/60 flex items-center justify-between">
<span className="font-label-sm text-label-sm text-status-success font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">check</span>
                {t('सहमति OTP प्रमाणित', 'Consent OTP Verified')}
              </span>
<span className="font-label-sm text-label-sm text-on-surface-variant">{t('सेयर: रु. ४०,०००', 'Shares: NPR 40,000')}</span>
</div>
</div>
{/*  Guarantor 2  */}
<div className="bg-surface-canvas p-space-md rounded-xl relative overflow-hidden flex flex-col justify-between">
<div className="flex items-start gap-space-sm">
<div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-headline-sm shrink-0">
                {t('चे', 'C')}
              </div>
<div className="min-w-0">
<div className="flex items-center gap-1">
<h4 className="font-label-md text-label-md font-bold text-on-surface truncate">{t('चेत नारायण थारु', 'Chet Narayan Tharu')}</h4>
<span className="material-symbols-outlined text-status-success text-[16px]">verified</span>
</div>
<p className="font-tabular-mono text-tabular-mono text-xs text-on-surface-variant mt-0.5">ID: UKO-2071-05521</p>
<p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{t('ठेगाना: गढवा-४, दाङ', 'Address: Gadhwa-4, Dang')}</p>
</div>
</div>
<div className="mt-space-md pt-space-xs border-t border-slate-200/60 flex items-center justify-between">
<span className="font-label-sm text-label-sm text-status-success font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">check</span>
                {t('सहमति OTP प्रमाणित', 'Consent OTP Verified')}
              </span>
<span className="font-label-sm text-label-sm text-on-surface-variant">{t('सेयर: रु. २५,०००', 'Shares: NPR 25,000')}</span>
</div>
</div>
</div>
</div>
{/*  Legal Declaration & Submission Form  */}
<div className="bg-surface-card rounded-xl shadow-sm p-space-lg">
<h4 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider mb-space-sm">
          {t('सदस्यको उद्घोष तथा कानुनी मन्जुरीनामा', 'Legal Member Declaration & Undertaking')}
        </h4>
<div className="p-space-md bg-surface-canvas rounded-xl mb-space-md space-y-space-xs">
<label className="flex items-start gap-space-sm cursor-pointer select-none">
<input defaultChecked={true} className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary accent-primary" id="declaration-check" type="checkbox"/>
<span className="font-body-sm text-body-sm text-on-surface">
              {t(
                'म यस सहकारीको सदस्यका हैसियतले माथि उल्लेखित सबै विवरण, धितो लालपुर्जा तथा परियोजनाको जानकारी सत्य भएको प्रमाणित गर्दछु। ऋण रकम पशुपालन तथा गोठ विस्तार बाहेक अन्यत्र प्रयोग गर्ने छैन। नेपाल सहकारी ऐन २०७४ र संस्थाको कर्जा कार्यविधि अनुसार नियमित मासिक किस्ता तथा ब्याज समयमै बुझाउन मन्जुर गर्दछु।',
                'As a member of this cooperative, I declare that all provided project details, land titles, and financial estimates are true. I agree to utilize funds strictly for dairy expansion and undertake to repay EMI on time per Cooperatives Act 2074.'
              )}
            </span>
</label>
</div>
{/*  Call to Action Buttons  */}
<div className="flex flex-col sm:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-primary text-[18px]">lock</span>
<span>{t('२५६-बिट इन्क्रिप्टेड सुरक्षित सबमिसन', '256-Bit Encrypted Secure Submission')}</span>
</div>
<div className="flex items-center gap-space-sm w-full sm:w-auto">
<button 
  onClick={handleSubmitApplication}
  className="w-full sm:w-auto px-space-xl py-space-sm bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-space-xs cursor-pointer"
>
<span>{t('ऋण आवेदन समितिमा पेश गर्नुहोस्', 'Submit Application to Committee')}</span>
<span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>
</div>
{/*  Interactive JavaScript for Live Loan Calculation & Controls  */}

</div>
    </div>
  );
}
