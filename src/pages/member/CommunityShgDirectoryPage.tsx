import React, { useState } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';

export function CommunityShgDirectoryPage() {
  const { t } = useLanguageStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [activeShg, setActiveShg] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDownloadPdf = () => {
    showToast(t('सामुदायिक समूह निर्देशिका डाउनलोड सुरु भयो!', 'SHG Directory PDF download started!'));
  };

  const handleOpenMembers = (shgName: string) => {
    setActiveShg(shgName);
    setShowMembersModal(true);
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

      {/* Main Community SHG Directory */}
      <div className="flex flex-col w-full space-y-space-xl">
{/*  Top Header / Title Banner  */}
<section className="relative overflow-hidden rounded-2xl bg-surface-dark text-on-primary p-space-xl shadow-xl">
<div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
<div className="absolute right-1/3 -bottom-20 w-80 h-80 rounded-full bg-secondary-container/10 blur-2xl pointer-events-none"></div>
<div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg">
<div className="max-w-3xl space-y-space-sm">
<div className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-primary-container/40 text-secondary-fixed">
<span className="material-symbols-outlined text-[18px]">hub</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
  {t('देउखुरी सामुदायिक नेटवर्क • विकेन्द्रीकृत सहकारी सञ्जाल', 'Deukhuri Community Network • Decentralized Cooperative Grid')}
</span>
</div>
<h1 className="font-headline-xl text-headline-xl text-surface font-extrabold tracking-tight">
          {t('सामुदायिक उपसमूह तथा वडा सदस्य निर्देशिका', 'Community SHG & Ward Directory')}
        </h1>
<p className="font-body-lg text-body-lg text-surface-variant font-normal leading-relaxed">
          {t(
            'गढवा, देउखुरी उपत्यका अन्तर्गतका टोल, वडा तथा महिला स्वावलम्बी समूहहरूको एकीकृत सञ्जाल।',
            'Community Self-Help Groups (SHG) & Ward Directory — integrated grassroot cooperative network across Deukhuri Valley.'
          )}
        </p>
</div>
<div className="flex items-center gap-space-md">
<button className="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-dark-card hover:bg-surface-dark text-surface font-label-md text-label-md transition-all shadow-md" id="downloadPdfBtn" onClick={handleDownloadPdf}>
<span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
<span>{t('निर्देशिका डाउनलोड', 'Download Directory (PDF)')}</span>
</button>
<button className="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary-container hover:bg-secondary text-on-primary font-label-md text-label-md transition-all shadow-md" id="openNewShgModal" onClick={() => setShowNewModal(true)}>
<span className="material-symbols-outlined text-[20px]">group_add</span>
<span>{t('नयाँ उपसमूह दर्ता आवेदन', 'Register New SHG Group')}</span>
</button>
</div>
</div>
{/*  Quick Metrics Strip  */}
<div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-xl pt-space-lg">
<div className="bg-surface-dark-card/90 rounded-xl p-space-md shadow-md flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-secondary-fixed">
<span className="material-symbols-outlined text-[26px]">diversity_3</span>
</div>
<div className="min-w-0">
<p className="font-label-sm text-label-sm text-surface-variant uppercase tracking-wider">{t('कुल उपसमूह', 'Total SHGs')}</p>
<div className="flex items-baseline gap-space-xs mt-space-xs">
<span className="font-display-stat text-display-stat-mobile sm:text-display-stat text-surface font-extrabold">{t('३२', '32')}</span>
<span className="font-label-md text-label-md text-secondary-fixed">{t('सक्रिय समूहहरू', 'Active Groups')}</span>
</div>
</div>
</div>
<div className="bg-surface-dark-card/90 rounded-xl p-space-md shadow-md flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-secondary-fixed">
<span className="material-symbols-outlined text-[26px]">groups</span>
</div>
<div className="min-w-0">
<p className="font-label-sm text-label-sm text-surface-variant uppercase tracking-wider">{t('आवद्ध सदस्य', 'Enrolled Members')}</p>
<div className="flex items-baseline gap-space-xs mt-space-xs">
<span className="font-display-stat text-display-stat-mobile sm:text-display-stat text-surface font-extrabold">{t('१,२८०+', '1,280+')}</span>
<span className="font-label-md text-label-md text-surface-variant">{t('शेयर सदस्य', 'Shareholders')}</span>
</div>
</div>
</div>
<div className="bg-surface-dark-card/90 rounded-xl p-space-md shadow-md flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-secondary-fixed">
<span className="material-symbols-outlined text-[26px]">payments</span>
</div>
<div className="min-w-0">
<p className="font-label-sm text-label-sm text-surface-variant uppercase tracking-wider">{t('मासिक सामूहिक बचत', 'Monthly Group Savings')}</p>
<div className="flex items-baseline gap-space-xs mt-space-xs">
<span className="font-headline-lg text-headline-lg text-surface font-bold">{t('रु. १२.४०', 'NPR 12.40')}</span>
<span className="font-label-md text-label-md text-secondary-fixed">{t('लाख / महिना', 'Lakh / Month')}</span>
</div>
</div>
</div>
<div className="bg-surface-dark-card/90 rounded-xl p-space-md shadow-md flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-brand-accent-lime">
<span className="material-symbols-outlined text-[26px]">verified_user</span>
</div>
<div className="min-w-0">
<p className="font-label-sm text-label-sm text-surface-variant uppercase tracking-wider">{t('सामूहिक ऋण असुली दर', 'Group Loan Recovery Rate')}</p>
<div className="flex items-baseline gap-space-xs mt-space-xs">
<span className="font-display-stat text-display-stat-mobile sm:text-display-stat text-brand-accent-lime font-extrabold">९९.४%</span>
<span className="font-label-sm text-label-sm text-secondary-fixed-dim">PAR &lt; ०.६%</span>
</div>
</div>
</div>
</div>
</section>
{/*  Interactive Filter & Search Bar Barricade  */}
<section className="bg-surface-card rounded-2xl p-space-md lg:p-space-lg shadow-sm">
<div className="flex flex-col gap-space-md">
{/*  Search and Views Top Strip  */}
<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
<div className="relative flex-1">
<span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="w-full h-12 pl-12 pr-space-md rounded-xl bg-surface-canvas text-on-surface font-body-md text-body-md focus:bg-surface-card focus:outline-none transition-all" id="shgSearchInput" placeholder={t('उपसमूहको नाम, टोल वा संयोजकको नाम खोज्नुहोस्...', 'Search by group, tole or coordinator...')} type="text"/>
</div>
{/*  View switcher & quick sort  */}
<div className="flex items-center gap-space-sm justify-between md:justify-end">
<div className="flex items-center bg-surface-container-low p-1 rounded-xl">
<button className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-card text-primary font-label-md text-label-md shadow-sm transition-all" id="viewGridBtn">
<span className="material-symbols-outlined text-[18px]">grid_view</span>
<span className="hidden sm:inline">{t('ग्रिड दृश्य', 'Grid View')}</span>
</button>
<button className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all" id="viewTableBtn">
<span className="material-symbols-outlined text-[18px]">table_rows</span>
<span className="hidden sm:inline">{t('तालिका दृश्य', 'Table View')}</span>
</button>
</div>
<div className="flex items-center gap-space-xs text-on-surface-variant text-label-sm font-label-sm bg-surface-container-low px-space-sm py-space-xs rounded-xl">
<span className="material-symbols-outlined text-[16px]">tune</span>
<span className="font-bold text-primary" id="filteredCounterBadge">{t('४ वटा उपसमूह देखाइयो', 'Showing 4 SHG Groups')}</span>
</div>
</div>
</div>
{/*  Category Filter Pills & Ward Selector Strip  */}
<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md pt-space-xs">
{/*  Ward Dropdown & Quick Selector  */}
<div className="flex flex-wrap items-center gap-space-xs">
<span className="font-label-sm text-label-sm text-on-surface-variant mr-space-xs">{t('वडा छान्नुहोस्:', 'Select Ward:')}</span>
<button className="ward-pill px-space-sm py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold transition-all" data-ward="all">
  {t('सबै वडाहरू', 'All Wards')}
</button>
<button className="ward-pill px-space-sm py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high font-label-sm text-label-sm font-medium transition-all" data-ward="w1">
  {t('वडा १ (गोबर्दिहा)', 'Ward 1 (Gobardiha)')}
</button>
<button className="ward-pill px-space-sm py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high font-label-sm text-label-sm font-medium transition-all" data-ward="w2">
  {t('वडा २', 'Ward 2')}
</button>
<button className="ward-pill px-space-sm py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high font-label-sm text-label-sm font-medium transition-all" data-ward="w3">
  {t('वडा ३', 'Ward 3')}
</button>
<button className="ward-pill px-space-sm py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high font-label-sm text-label-sm font-medium transition-all" data-ward="w4">
  {t('वडा ४', 'Ward 4')}
</button>
<button className="ward-pill px-space-sm py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high font-label-sm text-label-sm font-medium transition-all" data-ward="w5">
  {t('वडा ५ (चैनपुर)', 'Ward 5 (Chainpur)')}
</button>
<button className="ward-pill px-space-sm py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high font-label-sm text-label-sm font-medium transition-all" data-ward="w6">
  {t('वडा ६', 'Ward 6')}
</button>
</div>
{/*  Category Types  */}
<div className="flex flex-wrap items-center gap-space-xs">
<span className="font-label-sm text-label-sm text-on-surface-variant mr-space-xs">{t('प्रकार:', 'Type:')}</span>
<button className="cat-pill px-space-sm py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-bold" data-category="all">
  {t('सबै', 'All')}
</button>
<button className="cat-pill px-space-sm py-1 rounded-lg bg-surface-canvas hover:bg-surface-container text-on-surface-variant font-label-sm text-label-sm" data-category="women">
  {t('महिला स्वावलम्बी', 'Women Self-Help')}
</button>
<button className="cat-pill px-space-sm py-1 rounded-lg bg-surface-canvas hover:bg-surface-container text-on-surface-variant font-label-sm text-label-sm" data-category="dairy">
  {t('दुग्ध उत्पादक', 'Dairy Producers')}
</button>
<button className="cat-pill px-space-sm py-1 rounded-lg bg-surface-canvas hover:bg-surface-container text-on-surface-variant font-label-sm text-label-sm" data-category="agro">
  {t('कृषि तथा मौरी', 'Agro & Apiary')}
</button>
</div>
</div>
</div>
</section>
{/*  Notice Highlight: Active User Notice Banner  */}
<div className="rounded-xl bg-surface-container-high/60 p-space-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">event_upcoming</span>
</div>
<div>
<p className="font-label-md text-label-md text-on-surface font-semibold">
  {t('आसन्न मासिक उपसमूह बैठक सूचना: चैनपुर उपसमूह #०३', 'Upcoming Monthly SHG Meeting: Chainpur SHG #03')}
</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">
  {t(
    'मिति २०८१ फागुन १५ गते, दिनको २:०० बजे चैनपुर सामुदायिक भवनमा बैठक बस्दैछ। उपस्थितिका लागि सम्पूर्ण २८ जना सदस्यहरूलाई सूचित गरिन्छ।',
    'Meeting scheduled on Feb 27, 2025 at 2:00 PM at Chainpur Community Hall. All 28 members are requested to attend.'
  )}
</p>
</div>
</div>
<button className="shrink-0 px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-all">
  {t('एजेण्डा हेर्नुहोस्', 'View Agenda')}
</button>
</div>
{/*  Group Cards Grid (View Container)  */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg" id="gridContainer">
{/*  CARD 1: User's Own Group (Featured / High Contrast Priority)  */}
<div className="shg-card bg-surface-card rounded-2xl p-space-lg shadow-md hover:shadow-xl transition-all duration-200 relative flex flex-col justify-between" data-cat="mixed" data-ward="w5">
{/*  Decorative Accent Strip  */}
<div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-brand-accent-lime rounded-t-2xl"></div>
<div>
{/*  Card Header Badges & Title  */}
<div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-sm pt-space-xs">
<div className="flex items-center gap-space-xs flex-wrap">
<span className="px-space-sm py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">account_circle</span>
  {t('तपाईंको उपसमूह', 'Your Group')}
</span>
<span className="px-space-sm py-0.5 rounded-full bg-brand-accent-light text-primary font-label-sm text-label-sm font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">verified</span>
  {t('उत्कृष्ट', 'Grade-A Outstanding')}
</span>
</div>
<span className="font-tabular-mono text-tabular-mono text-xs text-on-surface-variant font-semibold">UKO-SHG-05-003</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
  {t('गढवा महिला-पुरुष स्वावलम्बी उपसमूह #०३', 'Gadhwa SHG #03')}
</h3>
{/*  Location & Meeting Schedule Block  */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm bg-surface-container-low rounded-xl p-space-md mb-space-md">
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">location_on</span>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('स्थान / ठेगाना', 'Location / Address')}</p>
<p className="font-label-md text-label-md font-semibold text-on-surface">{t('गढवा-५, चैनपुर गाउँ', 'Gadhwa-5, Chainpur Village')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('बैठक: चैनपुर सामुदायिक भवन', 'Venue: Chainpur Community Hall')}</p>
</div>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">calendar_month</span>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('नियमित बैठक तालिका', 'Regular Meeting Schedule')}</p>
<p className="font-label-md text-label-md font-semibold text-on-surface">{t('प्रत्येक महिनाको १५ गते', 'Every 15th of the Month')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('समय: दिउँसो ठीक २:०० बजे', 'Time: 2:00 PM Sharp')}</p>
</div>
</div>
</div>
{/*  Coordinator & Demographic Info  */}
<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md p-space-md bg-surface-canvas rounded-xl mb-space-md">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-headline-sm">
  {t('शा', 'Sh')}
</div>
<div>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">{t('संयोजक', 'Coordinator')}</span>
<p className="font-label-md text-label-md font-bold text-on-surface">{t('शान्ता चौधरी', 'Shanta Chaudhary')}</p>
<p className="font-tabular-mono text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">call</span>
  {t('९८६८६-***** (गोप्य)', '98686-***** (Confidential)')}
</p>
</div>
</div>
<div className="text-left sm:text-right bg-surface-card sm:bg-transparent p-space-sm sm:p-0 rounded-lg">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">{t('कुल सदस्य संख्या', 'Total Members')}</span>
<div className="flex items-center sm:justify-end gap-space-xs mt-0.5">
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">{t('२८ जना', '28 Members')}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('महिला: १८ | पुरुष: १०', 'Female: 18 | Male: 10')}</p>
</div>
</div>
{/*  Group Fund & Loan Progress Gauge  */}
<div className="grid grid-cols-2 gap-space-md bg-surface-card p-space-md rounded-xl shadow-inner mb-space-md bg-surface-container/30">
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('सामूहिक बचत कोष', 'Group Fund')}</p>
<p className="font-headline-sm text-headline-sm font-extrabold text-primary mt-1">{t('रु. ४,८५,०००', 'NPR 4,85,000')}</p>
<p className="font-label-sm text-label-sm text-status-success font-medium flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-[14px]">trending_up</span> {t('नियमित मासिक वृद्धि', 'Regular Monthly Growth')}
</p>
</div>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('सक्रिय आन्तरिक ऋण', 'Active Internal Loan')}</p>
<p className="font-headline-sm text-headline-sm font-extrabold text-on-surface mt-1">{t('रु. ३,२०,०००', 'NPR 3,20,000')}</p>
<div className="w-full bg-surface-container rounded-full h-2 mt-2 overflow-hidden">
<div className="bg-primary h-2 rounded-full" style={{"width":"66%"}}></div>
</div>
<p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{t('६६% कोष परिचालित', '66% Fund Mobilized')}</p>
</div>
</div>
</div>
{/*  Action Buttons  */}
<div className="flex flex-wrap items-center gap-space-sm pt-space-sm">
<button className="flex-1 min-w-[140px] px-space-md py-space-sm rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold text-center transition-all shadow-sm flex items-center justify-center gap-space-xs" onClick={() => handleOpenMembers("गढवा स्वावलम्बी समूह")}>
<span className="material-symbols-outlined text-[18px]">group</span>
<span>{t('सदस्य सूची (२८ जना)', 'View 28 Members')}</span>
</button>
<button className="px-space-md py-space-sm rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[18px]">history_edu</span>
<span>{t('बैठक माइन्युट', 'Meeting Minutes')}</span>
</button>
<button className="px-space-md py-space-sm rounded-xl bg-brand-accent-lime text-surface-dark hover:bg-secondary-fixed font-label-md text-label-md font-bold transition-all flex items-center gap-space-xs shadow-sm" onClick={() => showToast(t("सामूहिक बचत जम्मा भौचर खोलियो!", "Group savings deposit voucher opened!"))}>
<span className="material-symbols-outlined text-[18px]">add_card</span>
<span>{t('बचत जम्मा', 'Deposit Savings')}</span>
</button>
</div>
</div>
{/*  CARD 2: Dairy Producers SHG  */}
<div className="shg-card bg-surface-card rounded-2xl p-space-lg shadow-md hover:shadow-xl transition-all duration-200 relative flex flex-col justify-between" data-cat="dairy" data-ward="w5">
<div>
<div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">local_drink</span>
  {t('दुग्ध उत्पादक समूह', 'Dairy Producers Group')}
</span>
<span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">
  Grade-A
</span>
</div>
<span className="font-tabular-mono text-tabular-mono text-xs text-on-surface-variant font-semibold">UKO-SHG-05-012</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
  {t('चौरि दुग्ध उत्पादक सहकारी उपसमूह', 'Chauri Dairy Producers SHG')}
</h3>
{/*  Location & Highlights  */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm bg-surface-container-low rounded-xl p-space-md mb-space-md">
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">location_on</span>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('स्थान / टोल', 'Location / Tole')}</p>
<p className="font-label-md text-label-md font-semibold text-on-surface">{t('गढवा-५, देउखुरी चौरि टोल', 'Gadhwa-5, Deukhuri Chauri Tole')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('संकलन केन्द्र: चौरि डेरी युनिट', 'Collection Center: Chauri Dairy Unit')}</p>
</div>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">event_repeat</span>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('बैठक समय', 'Meeting Schedule')}</p>
<p className="font-label-md text-label-md font-semibold text-on-surface">{t('प्रत्येक महिनाको १ गते', 'Every 1st of the Month')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('बिहान ८:०० बजे', '8:00 AM')}</p>
</div>
</div>
</div>
{/*  Coordinator & Dairy Specific Metric  */}
<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md p-space-md bg-surface-canvas rounded-xl mb-space-md">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-headline-sm">
  {t('भो', 'Bh')}
</div>
<div>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">{t('संयोजक', 'Coordinator')}</span>
<p className="font-label-md text-label-md font-bold text-on-surface">{t('भोजराज थारु', 'Bhojraj Tharu')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('पेशा: उन्नत गाई-भैँसी पालन', 'Occupation: Modern Dairy Farming')}</p>
</div>
</div>
<div className="bg-surface-card sm:bg-transparent p-space-sm sm:p-0 rounded-lg text-left sm:text-right">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">{t('दैनिक संकलन', 'Daily Collection')}</span>
<div className="flex items-baseline sm:justify-end gap-1 mt-0.5">
<span className="font-headline-sm text-headline-sm font-extrabold text-primary">{t('८५०', '850')}</span>
<span className="font-label-sm text-label-sm font-medium">{t('लिटर/दिन', 'Liters / Day')}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('सदस्य: ४२ कृषक परिवार', 'Members: 42 Farming Households')}</p>
</div>
</div>
{/*  Metric Details  */}
<div className="grid grid-cols-2 gap-space-md bg-surface-container-low/50 p-space-md rounded-xl mb-space-md">
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('सक्रिय कृषि कर्जा परिचालन', 'Active Agro Credit')}</p>
<p className="font-headline-sm text-headline-sm font-extrabold text-on-surface mt-1">{t('रु. १८,५०,०००', 'NPR 18,50,000')}</p>
<p className="font-label-sm text-label-sm text-status-success font-medium flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-[14px]">check_circle</span> {t('अनुदान सुलभ ब्याजदर', 'Subsidized Concessional Rate')}
</p>
</div>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('वार्षिक चिलिङ भ्याट क्षमता', 'Annual Chilling Vat Capacity')}</p>
<p className="font-headline-sm text-headline-sm font-extrabold text-primary mt-1">{t('२,००० लि.', '2,000 L')}</p>
<p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{t('सहकारी प्राविधिक सहयोग', 'Cooperative Technical Support')}</p>
</div>
</div>
</div>
{/*  Action Buttons  */}
<div className="flex flex-wrap items-center gap-space-sm pt-space-sm">
<button className="flex-1 min-w-[140px] px-space-md py-space-sm rounded-xl bg-surface-dark hover:bg-surface-dark-card text-surface font-label-md text-label-md font-semibold text-center transition-all shadow-sm flex items-center justify-center gap-space-xs" onClick={() => handleOpenMembers("गढवा स्वावलम्बी समूह")}>
<span className="material-symbols-outlined text-[18px]">group</span>
<span>{t('सदस्य सूची हेर्नुहोस् (४२ जना)', 'View 42 Members')}</span>
</button>
<button className="px-space-md py-space-sm rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[18px]">table_chart</span>
<span>{t('दुग्ध संकलन तालिका', 'Milk Collection Log')}</span>
</button>
</div>
</div>
{/*  CARD 3: Gobardiha Progressive Women SHG  */}
<div className="shg-card bg-surface-card rounded-2xl p-space-lg shadow-md hover:shadow-xl transition-all duration-200 relative flex flex-col justify-between" data-cat="women" data-ward="w1">
<div>
<div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">woman</span>
  {t('महिला स्वावलम्बी उपसमूह', 'Women Self-Help Group')}
</span>
<span className="px-space-sm py-0.5 rounded-full bg-brand-accent-light text-primary font-label-sm text-label-sm font-bold">
  Grade-A
</span>
</div>
<span className="font-tabular-mono text-tabular-mono text-xs text-on-surface-variant font-semibold">UKO-SHG-01-007</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
  {t('गोबर्दिहा प्रगतिशील महिला उपसमूह', 'Gobardiha Progressive Women SHG')}
</h3>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm bg-surface-container-low rounded-xl p-space-md mb-space-md">
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">location_on</span>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('स्थान / वडा', 'Location / Ward')}</p>
<p className="font-label-md text-label-md font-semibold text-on-surface">{t('गढवा-१, गोबर्दिहा बजार', 'Gadhwa-1, Gobardiha Bazaar')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('बैठक: महिला विकास भवन', 'Venue: Women Development Hall')}</p>
</div>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">calendar_month</span>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('मासिक बैठक तालिका', 'Monthly Meeting Schedule')}</p>
<p className="font-label-md text-label-md font-semibold text-on-surface">{t('प्रत्येक महिनाको १० गते', 'Every 10th of the Month')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('दिउँसो १:०० बजे', '1:00 PM')}</p>
</div>
</div>
</div>
<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md p-space-md bg-surface-canvas rounded-xl mb-space-md">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-headline-sm">
  {t('वि', 'Bi')}
</div>
<div>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">{t('संयोजक', 'Coordinator')}</span>
<p className="font-label-md text-label-md font-bold text-on-surface">{t('विमला कुमारी यादव', 'Bimala Kumari Yadav')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('पेशा: सिलाइकटाइ तथा बाख्रापालन', 'Occupation: Tailoring & Goat Farming')}</p>
</div>
</div>
<div className="bg-surface-card sm:bg-transparent p-space-sm sm:p-0 rounded-lg text-left sm:text-right">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">{t('आवद्ध महिला', 'Enrolled Women')}</span>
<div className="flex items-center sm:justify-end gap-space-xs mt-0.5">
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">{t('३५ जना', '35 Members')}</span>
</div>
<p className="font-body-sm text-body-sm text-status-success font-medium">{t('१००% बचत सहभागिता', '100% Savings Participation')}</p>
</div>
</div>
<div className="grid grid-cols-2 gap-space-md bg-surface-container-low/50 p-space-md rounded-xl mb-space-md">
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('कुल सामूहिक बचत कोष', 'Total Group Savings Fund')}</p>
<p className="font-headline-sm text-headline-sm font-extrabold text-primary mt-1">{t('रु. ६,१०,०००', 'NPR 6,10,000')}</p>
<p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{t('आपतकालीन राहत कोष सहित', 'Includes Emergency Relief Fund')}</p>
</div>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('सीप विकास तथा लघु उद्यम', 'Skill & Micro-Enterprise')}</p>
<p className="font-headline-sm text-headline-sm font-extrabold text-on-surface mt-1">{t('१४ उद्यमी', '14 Entrepreneurs')}</p>
<p className="font-label-sm text-label-sm text-status-success font-medium mt-1">{t('सिलाई तथा अगरबत्ती उत्पादन', 'Tailoring & Incense Production')}</p>
</div>
</div>
</div>
<div className="flex flex-wrap items-center gap-space-sm pt-space-sm">
<button className="flex-1 min-w-[140px] px-space-md py-space-sm rounded-xl bg-surface-dark hover:bg-surface-dark-card text-surface font-label-md text-label-md font-semibold text-center transition-all shadow-sm flex items-center justify-center gap-space-xs" onClick={() => handleOpenMembers("गढवा स्वावलम्बी समूह")}>
<span className="material-symbols-outlined text-[18px]">group</span>
<span>{t('सदस्य सूची हेर्नुहोस् (३५ जना)', 'View 35 Members')}</span>
</button>
<button className="px-space-md py-space-sm rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[18px]">receipt_long</span>
<span>{t('बचत विवरण', 'Savings Statement')}</span>
</button>
</div>
</div>
{/*  CARD 4: Lamahi Agro & Beekeeping Group  */}
<div className="shg-card bg-surface-card rounded-2xl p-space-lg shadow-md hover:shadow-xl transition-all duration-200 relative flex flex-col justify-between" data-cat="agro" data-ward="w3">
<div>
<div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">psychiatry</span>
  {t('मौरी तथा तोरी कृषक', 'Apiary & Mustard Farmers')}
</span>
<span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">
  Grade-B+
</span>
</div>
<span className="font-tabular-mono text-tabular-mono text-xs text-on-surface-variant font-semibold">UKO-SHG-03-019</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
  {t('लमही साझा कृषि तथा मौरीपालन समूह', 'Lamahi Shared Agro & Apiary SHG')}
</h3>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm bg-surface-container-low rounded-xl p-space-md mb-space-md">
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">location_on</span>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('स्थान / वडा', 'Location / Ward')}</p>
<p className="font-label-md text-label-md font-semibold text-on-surface">{t('लमही-३, बनगाउँ फाँट', 'Lamahi-3, Bangaun Flat')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('प्राङ्गारिक मह संकलन केन्द्र', 'Organic Honey Collection Center')}</p>
</div>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">calendar_month</span>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('मासिक बैठक तालिका', 'Monthly Meeting Schedule')}</p>
<p className="font-label-md text-label-md font-semibold text-on-surface">{t('प्रत्येक महिनाको २० गते', 'Every 20th of the Month')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('बिहान ७:३० बजे', '7:30 AM')}</p>
</div>
</div>
</div>
<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md p-space-md bg-surface-canvas rounded-xl mb-space-md">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-secondary-fixed-dim text-on-secondary-fixed flex items-center justify-center font-bold text-headline-sm">
  {t('चे', 'Ch')}
</div>
<div>
<span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">{t('संयोजक', 'Coordinator')}</span>
<p className="font-label-md text-label-md font-bold text-on-surface">{t('चेत नारायण थारु', 'Chet Narayan Tharu')}</p>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('पेशा: मौरीपालन तथा तोरी-खेती', 'Occupation: Beekeeping & Mustard Farming')}</p>
</div>
</div>
<div className="bg-surface-card sm:bg-transparent p-space-sm sm:p-0 rounded-lg text-left sm:text-right">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">{t('सदस्य संख्या', 'Total Members')}</span>
<div className="flex items-center sm:justify-end gap-space-xs mt-0.5">
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">{t('२४ जना', '24 Members')}</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">{t('घार संख्या: २८०+ मौरी घार', 'Hives: 280+ Beehives')}</p>
</div>
</div>
<div className="grid grid-cols-2 gap-space-md bg-surface-container-low/50 p-space-md rounded-xl mb-space-md">
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('सामूहिक बचत कोष', 'Group Fund')}</p>
<p className="font-headline-sm text-headline-sm font-extrabold text-primary mt-1">{t('रु. ३,४०,०००', 'NPR 3,40,000')}</p>
<p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{t('उपकरण खरिद कोष सहित', 'Includes Equipment Purchase Fund')}</p>
</div>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">{t('वार्षिक प्राङ्गारिक मह उत्पादन', 'Annual Organic Honey Production')}</p>
<p className="font-headline-sm text-headline-sm font-extrabold text-on-surface mt-1">{t('१,४५० के.जी.', '1,450 kg')}</p>
<p className="font-label-sm text-label-sm text-status-success font-medium mt-1">{t('देउखुरी ब्राण्डिङ अन्तर्गत', 'Under Deukhuri Branding')}</p>
</div>
</div>
</div>
<div className="flex flex-wrap items-center gap-space-sm pt-space-sm">
<button className="flex-1 min-w-[140px] px-space-md py-space-sm rounded-xl bg-surface-dark hover:bg-surface-dark-card text-surface font-label-md text-label-md font-semibold text-center transition-all shadow-sm flex items-center justify-center gap-space-xs" onClick={() => handleOpenMembers("गढवा स्वावलम्बी समूह")}>
<span className="material-symbols-outlined text-[18px]">group</span>
<span>{t('सदस्य सूची हेर्नुहोस् (२४ जना)', 'View 24 Members')}</span>
</button>
<button className="px-space-md py-space-sm rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[18px]">hive</span>
<span>{t('उत्पादन प्रोफाइल', 'Production Profile')}</span>
</button>
</div>
</div>
</div>
{/*  Ward-level Cooperative Summary & Direct Contact Desk  */}
<section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
{/*  Field Officer Card (5 Cols)  */}
<div className="lg:col-span-5 bg-surface-card rounded-2xl p-space-lg shadow-md flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="px-space-sm py-1 rounded-full bg-brand-accent-light text-primary font-label-sm text-label-sm font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">support_agent</span>
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
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t('उनको बचत तथा ऋण सहकारी संस्था लि., मुख्य शाखा गढवा', 'Unako Savings & Credit Cooperative Ltd., Main Branch Gadhwa')}</p>
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
<a className="w-full flex-1 flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all" href="tel:9847800000">
<span className="material-symbols-outlined text-[18px]">call</span>
<span>{t('सिधा सम्पर्क', 'Call Supervisor')}</span>
</a>
<button className="w-full sm:w-auto px-space-md py-space-sm rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center justify-center gap-space-xs">
<span className="material-symbols-outlined text-[18px]">chat</span>
<span>{t('सन्देश पठाउनुहोस्', 'Send Message')}</span>
</button>
</div>
</div>
{/*  Bylaws & Group Formation Guidelines (7 Cols)  */}
<div className="lg:col-span-7 bg-surface-dark text-surface rounded-2xl p-space-lg shadow-xl relative overflow-hidden flex flex-col justify-between">
<div className="absolute right-0 bottom-0 w-64 h-64 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
<div>
<div className="flex items-center justify-between mb-space-md">
<div className="flex items-center gap-space-xs text-secondary-fixed">
<span className="material-symbols-outlined text-[22px]">policy</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">{t('सहकारी विनियम तथा कार्यविधि २०८०', 'Cooperative Bylaws & Procedures 2080')}</span>
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
{/*  3-Step Process Graphic Grid  */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-lg">
{/*  Step 1  */}
<div className="bg-surface-dark-card rounded-xl p-space-md relative overflow-hidden">
<span className="absolute top-2 right-2 text-headline-lg font-black text-brand-accent-lime/20 font-headline-lg">{t('०१', '01')}</span>
<div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-brand-accent-lime mb-space-xs">
<span className="material-symbols-outlined text-[18px]">groups_3</span>
</div>
<h4 className="font-label-md text-label-md font-bold text-surface mb-1">{t('कम्तीमा १५ सदस्य', 'At least 15 Members')}</h4>
<p className="font-body-sm text-body-sm text-surface-variant">{t('एउटै टोल, बस्ती वा कार्यक्षेत्रका १५ देखि ३० जना स्थानीय बासिन्दाको भेला हुनुपर्नेछ।', 'A gathering of 15 to 30 local residents from the same community/ward.')}</p>
</div>
{/*  Step 2  */}
<div className="bg-surface-dark-card rounded-xl p-space-md relative overflow-hidden">
<span className="absolute top-2 right-2 text-headline-lg font-black text-brand-accent-lime/20 font-headline-lg">{t('०२', '02')}</span>
<div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-brand-accent-lime mb-space-xs">
<span className="material-symbols-outlined text-[18px]">how_to_reg</span>
</div>
<h4 className="font-label-md text-label-md font-bold text-surface mb-1">{t('संयोजक छनोट', 'Select Leadership')}</h4>
<p className="font-body-sm text-body-sm text-surface-variant">{t('सर्वसम्मत रूपमा १ संयोजक, १ सह-संयोजक र १ कोषाध्यक्ष चयन गरी माइन्युट उठाउनुपर्ने।', 'Unanimously elect 1 coordinator, 1 co-coordinator, and 1 treasurer with signed minutes.')}</p>
</div>
{/*  Step 3  */}
<div className="bg-surface-dark-card rounded-xl p-space-md relative overflow-hidden">
<span className="absolute top-2 right-2 text-headline-lg font-black text-brand-accent-lime/20 font-headline-lg">{t('०३', '03')}</span>
<div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-brand-accent-lime mb-space-xs">
<span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
</div>
<h4 className="font-label-md text-label-md font-bold text-surface mb-1">{t('सहकारीमा दर्ता', 'Register with Cooperative')}</h4>
<p className="font-body-sm text-body-sm text-surface-variant">{t('संस्थाको तोकिएको फारम भरी वडा सिफारिस सहित मुख्य शाखा वा फिल्ड सुपरभाइजर समक्ष पेश गर्ने।', 'Submit filled application with ward recommendation to the main branch or field officer.')}</p>
</div>
</div>
</div>
<div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs">
<p className="font-body-sm text-body-sm text-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-brand-accent-lime">check_circle</span>
  {t('मासिक न्यूनतम रु. ३०० देखि रु. ५०० सामूहिक बचत अनिवार्य', 'Minimum NPR 300 to NPR 500 mandatory monthly group savings')}
</p>
<button className="w-full sm:w-auto px-space-md py-space-sm rounded-xl bg-brand-accent-lime text-surface-dark font-label-md text-label-md font-bold hover:bg-secondary-fixed transition-all flex items-center justify-center gap-space-xs">
<span>{t('गठन नियमावली पुस्तिका पढ्नुहोस्', 'Read Formation Bylaws Handbook')}</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</div>
</section>
{/*  Interactive Client-side Script for Filtering & Views  */}

</div>

      {/* New SHG Registration Modal */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="bg-surface-card max-w-lg w-full rounded-2xl shadow-2xl border border-primary/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">group_add</span>
                <h3 className="font-headline-sm font-bold text-on-surface">{t('नयाँ स्वावलम्बी समूह दर्ता', 'Register New SHG Group')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  {t('समूहको नाम', 'SHG Name')}
                </label>
                <input
                  type="text"
                  placeholder={t('उदा. गढवा सूर्यमुखी महिला स्वावलम्बी समूह', 'e.g. Gadhwa Suryamukhi Women SHG')}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    {t('वडा नम्बर', 'Ward No.')}
                  </label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm">
                    <option>{t('वडा १ (गोबर्दिहा)', 'Ward 1 (Gobardiha)')}</option>
                    <option>{t('वडा २ (गढवा)', 'Ward 2 (Gadhwa)')}</option>
                    <option>{t('वडा ३ (गोबरडिहा दक्षिण)', 'Ward 3 (Gobardiha South)')}</option>
                    <option>{t('वडा ४ (प्रतापपुर)', 'Ward 4 (Pratappur)')}</option>
                    <option>{t('वडा ५ (चैनपुर मुख्य)', 'Ward 5 (Chainpur Main)')}</option>
                    <option>{t('वडा ६ (गंगापरसपुर)', 'Ward 6 (Gangaparaspar)')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    {t('वर्ग', 'Category')}
                  </label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm">
                    <option>{t('महिला स्वावलम्बी', 'Women Self-Help')}</option>
                    <option>{t('दुग्ध उत्पादक', 'Dairy Producers')}</option>
                    <option>{t('कृषि तथा मौरी', 'Agro & Apiary')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  {t('संयोजक / अध्यक्षको नाम', 'Leader / Coordinator Name')}
                </label>
                <input
                  type="text"
                  placeholder={t('अध्यक्षको पूरा नाम र सम्पर्क नम्बर...', 'Leader full name and contact number...')}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container-low transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewModal(false);
                    showToast(t('नयाँ स्वावलम्बी समूह दर्ता आवेदन पेश भयो!', 'SHG Registration Application Submitted!'));
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-md hover:bg-primary/95 transition"
                >
                  {t('दर्ता गर्नुहोस्', 'Register')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member List Modal */}
      {showMembersModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowMembersModal(false)}
        >
          <div
            className="bg-surface-card max-w-md w-full rounded-2xl shadow-2xl border border-primary/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">groups</span>
                <h3 className="font-headline-sm font-bold text-on-surface text-sm">{t('समूह सदस्य नामावली', 'SHG Member Roster')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMembersModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-xs text-on-surface-variant font-medium">{t('समूह:', 'Group:')} <strong className="text-on-surface">{activeShg}</strong></p>
              <div className="divide-y divide-outline-variant/20 border border-outline-variant/30 rounded-xl overflow-hidden text-xs">
                {[
                  { name: t('सीता देवी चौधरी', 'Sita Devi Chaudhary'), role: t('अध्यक्ष', 'Chair'), id: 'UKO-2070-0112' },
                  { name: t('माया कुमारी थारु', 'Maya Kumari Tharu'), role: t('सचिव', 'Secretary'), id: 'UKO-2071-0842' },
                  { name: t('शान्ति पुन', 'Shanti Pun'), role: t('कोषाध्यक्ष', 'Treasurer'), id: 'UKO-2072-0491' },
                  { name: t('हरि प्रसाद चौधरी', 'Hari Prasad Chaudhary'), role: t('सदस्य', 'Member'), id: 'UKO-2070-08842' },
                  { name: t('अनिता चौधरी', 'Anita Chaudhary'), role: t('सदस्य', 'Member'), id: 'UKO-2073-1029' }
                ].map((m, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-surface-container-low transition">
                    <div>
                      <p className="font-bold text-on-surface">{m.name}</p>
                      <p className="text-[11px] text-on-surface-variant font-tabular-mono">{m.id}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowMembersModal(false)}
                className="w-full py-2.5 mt-2 rounded-xl bg-primary text-on-primary text-xs font-bold transition"
              >
                {t('बन्द गर्नुहोस्', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
