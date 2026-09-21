import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../../store/useLanguageStore';

export function ProfileSettingsPage() {
  const { lang, t } = useLanguageStore();
  const [showIdModal, setShowIdModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeDocKey, setActiveDocKey] = useState<'citizenship' | 'lalpurja' | 'ward' | 'biometric'>('citizenship');
  const [docZoom, setDocZoom] = useState(1.0);
  const [docRotation, setDocRotation] = useState(0);
  const [docFullscreen, setDocFullscreen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const KYC_DOCUMENTS = {
    citizenship: {
      key: 'citizenship' as const,
      title: t('नागरिकता प्रमाणपत्र', 'Citizenship Certificate'),
      id: 'UKO-DOC-CIT-04291',
      image: '/assets/kyc/doc_citizenship.svg',
      type: t('नागरिकता कार्ड', 'Citizenship Card'),
      authority: t('जिल्ला प्रशासन कार्यालय, दाङ', 'District Administration Office, Dang'),
      date: t('२०६०/०३/२२', '2003-07-06'),
      status: t('प्रमाणित', 'CBS Verified'),
      desc: t('ना.प्र.नं: ५२-०१-७२-०४२९१ (वंशज) • गढवा गाउँपालिका वडा नं. ५, दाङ • जारी अधिकृत: प्र.अ. दाङ', 'Citizenship No: 52-01-72-04291 (Descent) • Gadhwa Rural Municipality-5, Dang • Issuing Authority: DAO Dang')
    },
    lalpurja: {
      key: 'lalpurja' as const,
      title: t('जग्गाधनी प्रमाणपुर्जा', 'Land Ownership Certificate'),
      id: 'UKO-DOC-LND-41218',
      image: '/assets/kyc/doc_lalpurja.svg',
      type: t('लालपुर्जा प्रमाणपुर्जा', 'Land Ownership Certificate'),
      authority: t('भूमि सुधार तथा मालपोत कार्यालय, लमही, दाङ', 'Land Revenue Office, Lamahi, Dang'),
      date: t('२०७५/०८/१२', '2018-11-28'),
      status: t('धितो दृष्टिबन्धक', 'Mortgage Hypothecated'),
      desc: t('दर्ता सि.नं: ०२-४१२१८ • कित्ता नं: ४१२ • क्षेत्रफल: ०-४-०-० (४ कठ्ठा) • मालपोत मूल्याङ्कन: रु. २८,५०,०००/-', 'Registration No: 02-41218 • Plot No: 412 • Area: 0-4-0-0 (4 Kattha) • Valuation: NPR 2,850,000')
    },
    ward: {
      key: 'ward' as const,
      title: t('वडा सिफारिस तथा विद्युत् महसुल', 'Ward Recommendation & Utility Slip'),
      id: 'UKO-DOC-WRD-0599',
      image: '/assets/kyc/doc_ward_utility.svg',
      type: t('वडा बसोबास सिफारिस', 'Ward Residence Certificate'),
      authority: t('गढवा गाउँपालिका ५ नं. वडा कार्यालय / नेपाल विद्युत प्राधिकरण', 'Gadhwa-5 Ward Office / NEA'),
      date: t('२०८१/०१/१५', '2024-04-27'),
      status: t('सत्यापित', 'Residence Authenticated'),
      desc: t('चलानी नं: ५९९ (स्थायी बसोबास सिफारिस) • NEA लमही ग्राहक नं: ०२३-११-४०८ (विद्युत् महसुल चुक्ता)', 'Dispatch No: 599 (Residence Verification) • NEA Lamahi Customer No: 023-11-408')
    },
    biometric: {
      key: 'biometric' as const,
      title: t('बायोमेट्रिक तथा हस्ताक्षर', 'Biometrics & Specimen Signature'),
      id: 'UKO-DOC-BIO-9081',
      image: '/assets/kyc/doc_biometric.svg',
      type: t('बायोमेट्रिक कार्ड', 'Biometric Card'),
      authority: t('उनको बचत तथा ऋण सहकारी संस्था लि. केन्द्रीय कार्यालय', 'Unako SACCOS Head Office'),
      date: t('२०८०/०९/२२', '2024-01-07'),
      status: t('सक्रिय प्रमाणीकरण', 'Active Minutiae Match'),
      desc: t('दुवै औंठाछाप र कानूनी हस्ताक्षर नमूना • सुरक्षित डिजिटल सिल', 'Dual Thumbprints (64 Minutiae Points) & Legal Signature Specimen • SHA-256 Cryptographic Seal')
    }
  };

  const currentDoc = KYC_DOCUMENTS[activeDocKey] || KYC_DOCUMENTS.citizenship;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDownloadDossier = () => {
    showToast(t('केवाईसी डसियर डाउनलोड सुरु भयो!', 'KYC Dossier download started!'));
  };

  const handleHomeVisitRequest = () => {
    showToast(t('सहकारी सहजकर्ता घरमै आउने अनुरोध दर्ता भयो!', 'Home visit request registered!'));
  };

  const handleViewDoc = (key: 'citizenship' | 'lalpurja' | 'ward' | 'biometric' | string, _id?: string, _img?: string, _type?: string) => {
    let resolvedKey: 'citizenship' | 'lalpurja' | 'ward' | 'biometric' = 'citizenship';
    if (key === 'lalpurja' || (typeof key === 'string' && key.includes('जग्गाधनी'))) resolvedKey = 'lalpurja';
    else if (key === 'ward' || (typeof key === 'string' && key.includes('वडा'))) resolvedKey = 'ward';
    else if (key === 'biometric' || (typeof key === 'string' && (key.includes('बायोमेट्रिक') || key.includes('हस्ताक्षर')))) resolvedKey = 'biometric';
    setActiveDocKey(resolvedKey);
    setDocZoom(1.0);
    setDocRotation(0);
    setShowDocModal(true);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-modal-in">
          <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* ─── 1. TOP IDENTITY & VERIFICATION BANNER ─── */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 lg:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-20 w-64 h-64 rounded-full bg-emerald-600/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 lg:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 min-w-0 flex-1">
            {/* Member Photo */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-md border-2 border-emerald-600/30 bg-emerald-50 shrink-0">
                <img
                  className="w-full h-full object-cover"
                  src="/assets/kyc/avatar_hari.png"
                  alt="Hari Prasad Chaudhary"
                />
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white p-1 rounded-full shadow-md">
                <span className="material-symbols-outlined text-[15px] block">verified</span>
              </span>
            </div>

            {/* Member Details */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t('सक्रिय (तह-क)', 'Active (Grade-A)')}
                </span>
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  UKO-2070-08842
                </span>
                <span className="text-xs text-slate-500">{t('• ११+ वर्ष आबद्ध (२०७० देखि)', '• Member for 11+ yrs (Since 2013)')}</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-headline tracking-tight">
                {t('श्री हरि प्रसाद चौधरी', 'Hari Prasad Chaudhary')}
              </h1>

              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-0.5">
                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">account_balance</span>
                  {t('गढवा मुख्य शाखा', 'Gadhwa Main Branch')}
                </span>
                <span className="text-slate-400">•</span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">location_on</span>
                  गढवा गाउँपालिका वडा नं ५, चैनपुर, दाङ
                </span>
                <span className="text-slate-400">•</span>
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium whitespace-nowrap">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  {t('नवीकरण: २०८२ आषाढ मसान्त', 'Renewal: Mid-July 2025')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-2 xl:pt-0">
            <button
              onClick={() => setShowIdModal(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-sm transition whitespace-nowrap cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>{t('डिजिटल परिचयपत्र', 'Digital Smart ID')}</span>
            </button>
            <button
              onClick={handleDownloadDossier}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition whitespace-nowrap cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
              <span>{t('केवाईसी डसियर', 'KYC Dossier')}</span>
            </button>
            <button
              onClick={() => setShowUpdateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-[0.98] text-emerald-800 dark:text-emerald-300 font-semibold text-xs sm:text-sm border border-emerald-300 dark:border-emerald-700/60 transition whitespace-nowrap cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">edit_document</span>
              <span>{t('विवरण सच्याउनुहोस्', 'Update Details')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. KEY METRIC STATS STRIP ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">pie_chart</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{t('कुल सेयर पुँजी', 'Total Share Capital')}</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono">रु. ५०,०००</h3>
            <p className="text-[11px] text-emerald-600 font-semibold">{t('५०० कित्ता बाँडफाँड', '500 Units Allotted')}</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">health_and_safety</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">सदस्य कल्याण कोष (WELFARE)</p>
            <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono">सक्रिय (Active)</h3>
            <p className="text-[11px] text-slate-500 font-medium">प्रीमियम चुक्ता (Paid in Full)</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">how_to_vote</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">साधारण सभा मताधिकार</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">योग्य (Eligible)</h3>
            <p className="text-[11px] text-slate-500 font-medium">१ सदस्य १ मत सुरक्षित</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">verified_user</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">केवाइसी प्रमाणीकरण स्कोर</p>
            <h3 className="text-lg font-bold text-emerald-600 font-mono">१००% पूर्ण</h3>
            <p className="text-[11px] text-emerald-600 font-medium">केन्द्रीय सीबीएस सिंक (Live CBS)</p>
          </div>
        </div>
      </div>

      {/* ─── 3. MAIN BENTO GRID (8 COLS LEFT, 4 COLS RIGHT) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT COLUMN (8 COLS): KYC DOCUMENTS & AUDIT TRAIL ── */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-headline">
                  प्रमाणित कागजात अभिलेख (KYC Document Vault)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                नेपाल राष्ट्र बैंक तथा सहकारी विभागको मापदण्ड अनुसार प्रमाणीकरण गरिएका आधिकारिक डिजिटल कागजातहरू
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
              Secure CBS Encrypted
            </span>
          </div>

          {/* 4 Document Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Document 1: Citizenship */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">badge</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">नागरिकता प्रमाणपत्र</h3>
                      <p className="text-xs text-slate-500">National Citizenship ID</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> प्रमाणित
                  </span>
                </div>

                {/* Preview Image Card */}
                <div className="relative mt-4 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 aspect-[16/10] flex items-center justify-center p-2">
                  <img
                    className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                    src="/assets/kyc/doc_citizenship.svg"
                    alt="Citizenship Document"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                    <span className="text-xs text-white font-mono font-semibold">नं: ५२-०१-६८-०४२९१</span>
                    <span className="text-[10px] text-emerald-300 font-semibold bg-slate-900/80 px-2 py-0.5 rounded">दाङ प्रशासन</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>जारी मिति:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">२०६८/०७/१४ (Dang)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>प्रणाली प्रमाणीकरण:</span>
                    <span className="font-mono text-emerald-600 font-semibold">२०८०/०३/१२ (CBS Sync)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                <button
                  onClick={() => handleViewDoc("citizenship")}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  {t('कागजात हेर्नुहोस्', 'View Document')}
                </button>
                <span className="text-[11px] text-slate-400">OCR Verified ✓</span>
              </div>
            </div>

            {/* Document 2: Land Certificate (Lalpurja) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">landscape</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">जग्गाधनी प्रमाणपुर्जा</h3>
                      <p className="text-xs text-slate-500">Land Ownership (Lalpurja)</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <span className="material-symbols-outlined text-[14px]">lock</span> रोक्का प्रमाणित
                  </span>
                </div>

                {/* Preview Image Card */}
                <div className="relative mt-4 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 aspect-[16/10] flex items-center justify-center p-2">
                  <img
                    className="w-full h-full object-cover rounded-lg"
                    src="/assets/kyc/doc_lalpurja.svg"
                    alt="Lalpurja Document"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                    <span className="text-xs text-white font-mono font-semibold">कित्ता नं: ४१२/१८ (४ कठ्ठा)</span>
                    <span className="text-[10px] text-emerald-300 font-semibold bg-slate-900/80 px-2 py-0.5 rounded">गढवा-५ चैनपुर</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>उपयोगिता:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">कृषि कर्जा धितो सुरक्षण</span>
                  </div>
                  <div className="flex justify-between">
                    <span>मालपोत मूल्याङ्कन:</span>
                    <span className="font-mono font-bold text-emerald-600">रु. २८,५०,०००/-</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                <button
                  onClick={() => handleViewDoc("lalpurja")}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  {t('कागजात हेर्नुहोस्', 'View Document')}
                </button>
                <span className="text-[11px] text-slate-400">मालपोत लमही दर्ता</span>
              </div>
            </div>

            {/* Document 3: Ward Recommendation & Utility Slip */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">home_pin</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('वडा सिफारिस तथा महसुल', 'Ward Recommendation & Utility Slip')}</h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> प्रमाणीकरण
                  </span>
                </div>

                {/* Preview Image Card */}
                <div className="relative mt-4 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 aspect-[16/10] flex items-center justify-center p-2">
                  <img
                    className="w-full h-full object-cover rounded-lg"
                    src="/assets/kyc/doc_ward_utility.svg"
                    alt="Ward Utility Slip"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                    <span className="text-xs text-white font-mono font-semibold">NEA Grāhaka: ०२३-११-४०८</span>
                    <span className="text-[10px] text-emerald-300 font-semibold bg-slate-900/80 px-2 py-0.5 rounded">विद्युत् महसुल</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>ठेगाना पुष्टि:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">गढवा गा.पा. वडा नं ५</span>
                  </div>
                  <div className="flex justify-between">
                    <span>हालसालै प्रमाणीकरण:</span>
                    <span className="font-mono text-emerald-600 font-semibold">२०८१/०१/१५</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                <button
                  onClick={() => handleViewDoc("ward")}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  {t('कागजात हेर्नुहोस्', 'View Document')}
                </button>
                <span className="text-[11px] text-slate-400">वडा नं ५ सिफारिस</span>
              </div>
            </div>

            {/* Document 4: Biometric & Signature */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">fingerprint</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('औँठाछाप तथा बायोमेट्रिक', 'Live Biometrics & Specimen Signature')}</h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> केन्द्रीय डेटाबेस
                  </span>
                </div>

                {/* Preview Image Card */}
                <div className="relative mt-4 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-900 aspect-[16/10] flex items-center justify-center p-2">
                  <img
                    className="w-full h-full object-cover rounded-lg"
                    src="/assets/kyc/doc_biometric.svg"
                    alt="Biometric & Sign"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                    <span className="text-xs text-white font-mono font-semibold">Minutiae Match: ९९.८%</span>
                    <span className="text-[10px] text-emerald-300 font-semibold bg-slate-900/80 px-2 py-0.5 rounded">CBS Vault</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>क्याप्चर मिति:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">२०८०/०२/०५, ११:३४ बजे</span>
                  </div>
                  <div className="flex justify-between">
                    <span>अधिकारी प्रमाणीकरण:</span>
                    <span className="font-semibold text-emerald-600">गढवा मुख्य शाखा (अभिलेख नं ४२)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                <button
                  onClick={() => handleViewDoc("biometric")}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  {t('कागजात हेर्नुहोस्', 'View Document')}
                </button>
                <span className="text-[11px] text-slate-400">ISO 19794-2 Format</span>
              </div>
            </div>
          </div>

          {/* Compliance & AML Timeline Audit */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">history</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-headline">
                  अनुपालन तथा केवाइसी लेखापरीक्षण इतिहास (Compliance & Audit Log)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">अन्तिम अपडेट: ३ दिन अघि</span>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {/* Log item 1 */}
              <div className="relative flex items-start gap-4 pl-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      वार्षिक केवाइसी रुजु तथा अद्यावधिक स्वीकृत
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">२०८१ वैशाख १५</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    शाखा अधिकृत सीता चौधरीद्वारा स्थलगत निरीक्षण तथा जग्गाधनी विवरण अद्यावधिक गरिएको।
                  </p>
                </div>
              </div>

              {/* Log item 2 */}
              <div className="relative flex items-start gap-4 pl-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      सम्पत्ति शुद्धीकरण (AML/CFT) स्क्रिनिङ क्लियरेन्स
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">२०८० पौष २९</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    नेपाल राष्ट्र बैंकको निर्देशिका अनुसार कुनै पनि जोखिम वा कालोसूची सूचीमा नपरेको प्रमाणित।
                  </p>
                </div>
              </div>

              {/* Log item 3 */}
              <div className="relative flex items-start gap-4 pl-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">family_restroom</span>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      हकवाला तथा बाल शिक्षा खाता समावेशीकरण
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">२०८० आश्विन १२</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    हकवाला श्रीमती सुनिता कुमारी चौधरी तथा आश्रित छोराछोरीको विवरण कल्याणकारी कोषमा प्रविष्ट।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (4 COLS): NOMINEE, FIELD OFFICER & CHARTER ── */}
        <div className="lg:col-span-4 space-y-8">
          {/* Nominee & Family Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">family_restroom</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-headline">
                  हकवाला विवरण (Nominee)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                १००% हकदार
              </span>
            </div>

            {/* Primary Nominee Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/70 dark:border-slate-700/50 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-600/30 bg-white shrink-0 shadow-sm">
                <img
                  className="w-full h-full object-cover"
                  src="/assets/kyc/avatar_nominee.png"
                  alt="Sunita Kumari Chaudhary"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  मुख्य हकवाला (PRIMARY NOMINEE)
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  श्रीमती सुनिता कुमारी चौधरी
                </h4>
                <p className="text-xs text-slate-500">नाता: श्रीमती (Spouse)</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>नागरिकता नं:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">५२-०१-७२-०३१४५ (Dang)</span>
              </div>
              <div className="flex justify-between">
                <span>सम्पर्क नम्बर:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">९८४७९***** (सत्यापित)</span>
              </div>
              <div className="flex justify-between">
                <span>सेयर तथा बचत हकदाबी:</span>
                <span className="font-semibold text-emerald-600">१००% पूर्ण हकवाला</span>
              </div>
            </div>

            {/* Dependent Children Info */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                आश्रित परिवार तथा बाल शिक्षा बोनस योजना
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">रोहन चौधरी (छोरा - १५ वर्ष)</p>
                    <p className="text-[11px] text-slate-500">जनज्योति मा.वि. कक्षा १० (छात्रवृत्ति पाउने सूचीमा)</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">आबद्ध</span>
                </div>
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">रिया चौधरी (छोरी - ११ वर्ष)</p>
                    <p className="text-[11px] text-slate-500">उनको बाल बचत खाता (Acc: 04-209-12)</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">आबद्ध</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowUpdateModal(true)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              हकवाला वा परिवार विवरण संशोधन अनुरोध
            </button>
          </div>

          {/* Assigned Field Officer Desk Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">support_agent</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-headline">
                  जिम्मेवार फिल्ड अधिकृत तथा डेस्क
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-600/30 bg-emerald-50 shrink-0 shadow-sm">
                <img
                  className="w-full h-full object-cover"
                  src="/assets/kyc/avatar_officer.png"
                  alt="Sita Chaudhary"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  तोकिएको सेवा अधिकृत
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  सीता चौधरी (Sita Chaudhary)
                </h4>
                <p className="text-xs text-slate-500">शाखा फिल्ड सुपरभाइजर (गढवा-५)</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
              <div className="flex justify-between">
                <span>सम्पर्क टेलिफोन:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">०८२-५६०१२३ (Ext: १०४)</span>
              </div>
              <div className="flex justify-between">
                <span>मोबाइल / WhatsApp:</span>
                <span className="font-mono font-semibold text-emerald-600">९८५७८-४०१२३</span>
              </div>
              <div className="flex justify-between">
                <span>उपसमूह (Self-help Unit):</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">गढवा महिला-पुरुष स्वावलम्बी एकाइ #०३</span>
              </div>
              <div className="flex justify-between">
                <span>नियमित बैठक तालिका:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">प्रत्येक महिनाको १५ गते (२:०० बजे)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href="tel:9857840123"
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs text-center transition flex items-center justify-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                प्रत्यक्ष सम्पर्क
              </a>
              <button
                onClick={handleHomeVisitRequest}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">home_work</span>
                घरमै सेवा माग
              </button>
            </div>
          </div>

          {/* Member Charter & Rights Notice */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="material-symbols-outlined text-[22px]">verified</span>
              <h4 className="font-bold text-sm font-headline">सदस्य अधिकार तथा सुरक्षा ग्यारेन्टी</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              उनको बचत तथा ऋण सहकारी संस्था लि. सम्पूर्ण सदस्यहरूको व्यक्तिगत तथा वित्तीय विवरणको गोपनीयता ऐन २०७५ तथा सहकारी नियमावली २०७५ अनुसार अक्षुण्ण राख्न प्रतिबद्ध छ।
            </p>
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
              <span>दर्ता नं: २८/२०५७/०५८</span>
              <span>गढवा, दाङ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. MODALS ─── */}

      {/* ── DIGITAL SMART ID CARD MODAL (Photo 4) ── */}
      {showIdModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-modal-in"
          onClick={() => setShowIdModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-200">badge</span>
                <h3 className="font-bold text-sm font-headline">{t('स्मार्ट सदस्य परिचयपत्र', 'Digital Member Smart ID')}</h3>
              </div>
              <button
                onClick={() => setShowIdModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Smart ID Card Layout */}
            <div className="p-6 space-y-6">
              <div className="relative bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/30 overflow-hidden">
                {/* Chip & Logo Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-800 font-black text-xl shadow">
                      उ
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm tracking-wide">उनको बचत तथा ऋण सहकारी संस्था लि.</h4>
                      <p className="text-[10px] text-emerald-200">UNAKO SAVINGS & CREDIT COOPERATIVE LTD.</p>
                      <p className="text-[9px] text-emerald-300">गढवा-५, दाङ, नेपाल • दर्ता नं: २८/२०५७/०५८</p>
                    </div>
                  </div>
                  <div className="w-9 h-7 rounded-md bg-amber-400/90 border border-amber-300 shadow-inner flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-900 text-sm">memory</span>
                  </div>
                </div>

                {/* Member Body */}
                <div className="mt-5 flex items-center gap-5">
                  <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-white/80 bg-emerald-950 shrink-0 shadow-md">
                    <img
                      className="w-full h-full object-cover"
                      src="/assets/kyc/avatar_hari.png"
                      alt="Hari Prasad Chaudhary"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] text-emerald-300 font-mono">MEMBER ID / सदस्यता नं:</div>
                    <div className="text-xl font-black font-mono tracking-wider text-amber-300">UKO-2070-08842</div>
                    <div className="text-base font-bold text-white leading-tight">श्री हरि प्रसाद चौधरी</div>
                    <div className="text-xs text-emerald-200">HARI PRASAD CHAUDHARY</div>
                    <div className="text-[11px] text-slate-300">शाखा: गढवा मुख्य शाखा (दाङ)</div>
                  </div>
                </div>

                {/* Card Footer with QR & Watermark */}
                <div className="mt-5 pt-3 border-t border-emerald-700/60 flex items-end justify-between">
                  <div className="text-[10px] text-emerald-300 space-y-0.5">
                    <div>जारी मिति: २०७०/०३/१२</div>
                    <div>प्रमाणीकरण: CBS LIVE SYNCED ✓</div>
                  </div>
                  <div className="w-14 h-14 bg-white p-1 rounded-lg shadow shrink-0 flex items-center justify-center">
                    <img
                      className="w-full h-full object-contain"
                      src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=UKO-2070-08842-HARI-PRASAD-CHAUDHARY-UNAKO-CBS"
                      alt="Member QR"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowIdModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('बन्द गर्नुहोस्', 'Close')}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  {t('प्रिन्ट गर्नुहोस्', 'Print ID')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HIGH-RESOLUTION KYC DOCUMENT INSPECTION VIEWER ── */}
      {showDocModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-3 overflow-hidden animate-fade-in"
          onClick={() => setShowDocModal(false)}
        >
          <div
            className={`bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden transition-all duration-200 my-auto ${
              docFullscreen
                ? 'w-[98vw] max-w-[98vw] h-[96vh] max-h-[96vh]'
                : 'w-full max-w-5xl lg:max-w-6xl h-[92vh] max-h-[94vh]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. COMPACT MODAL HEADER WITH TOOLBAR */}
            <div className="px-4 py-2.5 bg-slate-800/95 border-b border-slate-700/80 flex items-center justify-between gap-2 shrink-0 flex-wrap">
              {/* Left: Document Info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs sm:text-sm text-white truncate font-headline">
                      {currentDoc.title}
                    </h3>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 shrink-0">
                      {currentDoc.status}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 truncate">
                    <span>{currentDoc.id}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">{currentDoc.authority}</span>
                  </p>
                </div>
              </div>

              {/* Right: Inspection Toolbar (Zoom, Rotate, Fullscreen, Close) */}
              <div className="flex items-center gap-1.5">
                {/* Zoom Controls */}
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setDocZoom(z => Math.max(0.6, Math.round((z - 0.2) * 100) / 100))}
                    disabled={docZoom <= 0.6}
                    className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Zoom Out (जुम घटाउनुहोस्)"
                  >
                    <span className="material-symbols-outlined text-base">remove</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setDocZoom(1.0); setDocRotation(0); }}
                    className="px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded transition"
                    title="Click to reset 100% Fit (१००% मा रिसेट)"
                  >
                    {Math.round(docZoom * 100)}%
                  </button>

                  <button
                    type="button"
                    onClick={() => setDocZoom(z => Math.min(3.0, Math.round((z + 0.25) * 100) / 100))}
                    disabled={docZoom >= 3.0}
                    className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Zoom In (जुम बढाउनुहोस्)"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                </div>

                {/* Rotate Controls */}
                <div className="hidden sm:flex items-center bg-slate-950 border border-slate-700 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setDocRotation(r => (r - 90 + 360) % 360)}
                    className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    title="Rotate Counter-Clockwise (बायाँ घुमाउनुहोस्)"
                  >
                    <span className="material-symbols-outlined text-base">rotate_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocRotation(r => (r + 90) % 360)}
                    className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    title="Rotate Clockwise (दायाँ घुमाउनुहोस्)"
                  >
                    <span className="material-symbols-outlined text-base">rotate_right</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDocZoom(1.0); setDocRotation(0); }}
                    className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    title="Reset to 100% Fit Screen (पर्दामा मिलाउनुहोस्)"
                  >
                    <span className="material-symbols-outlined text-base">fit_screen</span>
                  </button>
                </div>

                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={() => setDocFullscreen(f => !f)}
                  className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title={docFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                >
                  <span className="material-symbols-outlined text-base">
                    {docFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                  </span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 flex items-center justify-center transition"
                  title="Close (बन्द गर्नुहोस् - ESC)"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>

            {/* 2. COMPACT DOCUMENT SWITCHER TABS */}
            <div className="px-4 py-1.5 bg-slate-800/60 border-b border-slate-700/80 flex items-center gap-1.5 overflow-x-auto shrink-0">
              {[
                { key: 'citizenship', label: 'नागरिकता (Citizenship)', icon: 'badge' },
                { key: 'lalpurja', label: 'जग्गाधनी पुर्जा (Lalpurja)', icon: 'landscape' },
                { key: 'ward', label: 'वडा सिफारिस तथा विद्युत् (Ward Slip)', icon: 'home_pin' },
                { key: 'biometric', label: 'बायोमेट्रिक तथा हस्ताक्षर (Biometric)', icon: 'fingerprint' },
              ].map((docTab) => (
                <button
                  key={docTab.key}
                  type="button"
                  onClick={() => {
                    setActiveDocKey(docTab.key as any);
                    setDocZoom(1.0);
                    setDocRotation(0);
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeDocKey === docTab.key
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{docTab.icon}</span>
                  <span>{docTab.label}</span>
                </button>
              ))}
            </div>

            {/* 3. DOCUMENT CANVAS: 100% FULLY VISIBLE AT 100% ZOOM */}
            <div className="flex-1 min-h-0 bg-slate-950 relative overflow-auto p-2 sm:p-3 flex items-center justify-center">
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-200"
                style={{
                  transform: docZoom !== 1.0 || docRotation !== 0 ? `scale(${docZoom}) rotate(${docRotation}deg)` : undefined,
                  transformOrigin: 'center center',
                }}
              >
                <img
                  src={currentDoc.image}
                  alt={currentDoc.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-slate-700/80 select-none block"
                  style={{
                    margin: 'auto',
                  }}
                />
              </div>

              {/* Floating Helper Pill */}
              <div className="absolute bottom-2 left-3 bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 px-2.5 py-0.5 rounded-full text-[10px] text-slate-400 pointer-events-none flex items-center gap-1 shadow-md">
                <span className="material-symbols-outlined text-[13px] text-emerald-400">check_circle</span>
                <span>१००% दृश्य: पूरा कागजात देखिने गरी मिलाइएको • जुम गर्न टुलबार प्रयोग गर्नुहोस्</span>
              </div>
            </div>

            {/* 4. COMPACT FOOTER WITH DOCUMENT DETAILS & ACTIONS */}
            <div className="px-4 py-2 bg-slate-800/95 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              <div className="min-w-0">
                <div className="text-[11px] text-white font-medium truncate max-w-xl">
                  {currentDoc.desc}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  <span>UNAKO-CBS-STAMP: 2080-VAL-OK • Verified Active</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const printWin = window.open(currentDoc.image, '_blank');
                    if (printWin) {
                      printWin.focus();
                      printWin.print();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">print</span>
                  {t('प्रिन्ट', 'Print')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = currentDoc.image;
                    link.download = `${currentDoc.key}_${currentDoc.id}.svg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast(t(`${currentDoc.title} डाउनलोड भयो!`, `${currentDoc.title} downloaded!`));
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  {t('डाउनलोड', 'Download')}
                </button>

                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
                >
                  {t('बन्द गर्नुहोस्', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── KYC UPDATE MODAL ── */}
      {showUpdateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-modal-in"
          onClick={() => setShowUpdateModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-200">edit_document</span>
                <h3 className="font-bold text-sm font-headline">{t('केवाईसी विवरण अद्यावधिक', 'Update KYC Dossier')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  {t('सम्पर्क नम्बर वा ठेगाना परिवर्तन', 'Select Field to Update')}
                </label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <option>{t('मोबाइल नम्बर', 'Mobile Phone Number')}</option>
                  <option>{t('स्थायी वा हालको ठेगाना', 'Permanent or Current Address')}</option>
                  <option>{t('हकवाला विवरण', 'Nominee & Beneficiary')}</option>
                  <option>{t('पारिवारिक विवरण', 'Family Member Details')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  {t('नयाँ विवरण', 'New Detail / Value')}
                </label>
                <input
                  type="text"
                  placeholder={t('नयाँ विवरण यहाँ प्रविष्ट गर्नुहोस्...', 'Enter new detail here...')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  {t('प्रमाण कागजात दाखिला', 'Upload Supporting Document')}
                </label>
                <input
                  type="file"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    showToast(t('केवाईसी अद्यावधिक अनुरोध शाखा प्रमाणीकरणका लागि पेश भयो!', 'KYC update request submitted for verification!'));
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition"
                >
                  {t('सुरक्षित गरी पेस गर्नुहोस्', 'Save & Submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
