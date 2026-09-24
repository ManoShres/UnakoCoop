import React from 'react';
import { Lock, IdCard, CheckCircle2, Eye, Mountain, MapPinHouse, Fingerprint, History, Check, Shield, Users } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface ProfileVaultSectionProps {
  onViewDoc: (key: 'citizenship' | 'lalpurja' | 'ward' | 'biometric') => void;
}

export function ProfileVaultSection({ onViewDoc }: ProfileVaultSectionProps) {
  const { t } = useLanguageStore();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-headline">
              {t('प्रमाणित कागजात अभिलेख (KYC Document Vault)', 'KYC Document Vault')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t(
              'नेपाल राष्ट्र बैंक तथा सहकारी विभागको मापदण्ड अनुसार प्रमाणीकरण गरिएका आधिकारिक डिजिटल कागजातहरू',
              'Official authenticated digital documents compliant with NRB & Cooperative Department standards'
            )}
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <Lock className="w-4 h-4 text-emerald-600" />
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
                  <IdCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {t('नागरिकता प्रमाणपत्र', 'Citizenship Certificate')}
                  </h3>
                  <p className="text-xs text-slate-500">National Citizenship ID</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                {t('प्रमाणित', 'Verified')}
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
                <span>{t('जारी मिति:', 'Issued Date:')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">२०६८/०७/१४ (Dang)</span>
              </div>
              <div className="flex justify-between">
                <span>{t('प्रणाली प्रमाणीकरण:', 'System Verification:')}</span>
                <span className="font-mono text-emerald-600 font-semibold">२०८०/०३/१२ (CBS Sync)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onViewDoc('citizenship')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
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
                  <Mountain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {t('जग्गाधनी प्रमाणपुर्जा', 'Land Ownership Certificate')}
                  </h3>
                  <p className="text-xs text-slate-500">Land Ownership (Lalpurja)</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                <Lock className="w-3.5 h-3.5" />{' '}
                {t('रोक्का प्रमाणित', 'Mortgage Free')}
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
                <span>{t('उपयोगिता:', 'Purpose:')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('कृषि कर्जा धितो सुरक्षण', 'Agricultural Loan Collateral')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('मालपोत मूल्याङ्कन:', 'Official Valuation:')}</span>
                <span className="font-mono font-bold text-emerald-600">रु. २८,५०,०००/-</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onViewDoc('lalpurja')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              {t('कागजात हेर्नुहोस्', 'View Document')}
            </button>
            <span className="text-[11px] text-slate-400">{t('मालपोत लमही दर्ता', 'Lamahi Land Reg.')}</span>
          </div>
        </div>

        {/* Document 3: Ward Recommendation & Utility Slip */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPinHouse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {t('वडा सिफारिस तथा महसुल', 'Ward Recommendation & Utility Slip')}
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                {t('प्रमाणीकरण', 'Verified')}
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
                <span>{t('ठेगाना पुष्टि:', 'Address Proof:')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">गढवा गा.पा. वडा नं ५</span>
              </div>
              <div className="flex justify-between">
                <span>{t('हालसालै प्रमाणीकरण:', 'Recent Verification:')}</span>
                <span className="font-mono text-emerald-600 font-semibold">२०८१/०१/१५</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onViewDoc('ward')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              {t('कागजात हेर्नुहोस्', 'View Document')}
            </button>
            <span className="text-[11px] text-slate-400">{t('वडा नं ५ सिफारिस', 'Ward 5 Recom.')}</span>
          </div>
        </div>

        {/* Document 4: Biometric & Signature */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {t('औँठाछाप तथा बायोमेट्रिक', 'Live Biometrics & Specimen Signature')}
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                {t('केन्द्रीय डेटाबेस', 'Central Database')}
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
                <span>{t('क्याप्चर मिति:', 'Capture Date:')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">२०८०/०२/०५, ११:३४ बजे</span>
              </div>
              <div className="flex justify-between">
                <span>{t('अधिकारी प्रमाणीकरण:', 'Officer Verification:')}</span>
                <span className="font-semibold text-emerald-600">{t('गढवा मुख्य शाखा (अभिलेख नं ४२)', 'Gadhwa Main Branch')}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onViewDoc('biometric')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
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
            <History className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-headline">
              {t('अनुपालन तथा केवाइसी लेखापरीक्षण इतिहास (Compliance & Audit Log)', 'Compliance & Audit Log')}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {t('अन्तिम अपडेट: ३ दिन अघि', 'Last Updated: 3 days ago')}
          </span>
        </div>

        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {/* Log item 1 */}
          <div className="relative flex items-start gap-4 pl-1">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t('वार्षिक केवाइसी रुजु तथा अद्यावधिक स्वीकृत', 'Annual KYC Audit & Update Approved')}
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">२०८१ वैशाख १५</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {t(
                  'शाखा अधिकृत सीता चौधरीद्वारा स्थलगत निरीक्षण तथा जग्गाधनी विवरण अद्यावधिक गरिएको।',
                  'On-site inspection and land record update verified by Branch Officer Sita Chaudhary.'
                )}
              </p>
            </div>
          </div>

          {/* Log item 2 */}
          <div className="relative flex items-start gap-4 pl-1">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t('सम्पत्ति शुद्धीकरण (AML/CFT) स्क्रिनिङ क्लियरेन्स', 'Anti-Money Laundering (AML/CFT) Clearance')}
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">२०८० पौष २९</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {t(
                  'नेपाल राष्ट्र बैंकको निर्देशिका अनुसार कुनै पनि जोखिम वा कालोसूची सूचीमा नपरेको प्रमाणित।',
                  'Cleared against NRB directives with no risk or blacklisted flags.'
                )}
              </p>
            </div>
          </div>

          {/* Log item 3 */}
          <div className="relative flex items-start gap-4 pl-1">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {t('हकवाला तथा बाल शिक्षा खाता समावेशीकरण', 'Nominee & Child Education Account Inclusion')}
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">२०८० आश्विन १२</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {t(
                  'हकवाला श्रीमती सुनिता कुमारी चौधरी तथा आश्रित छोराछोरीको विवरण कल्याणकारी कोषमा प्रविष्ट।',
                  'Spouse Sunita Kumari Chaudhary and dependent children registered in Welfare Fund.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
