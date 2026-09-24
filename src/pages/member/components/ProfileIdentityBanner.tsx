import React from 'react';
import { BadgeCheck, Landmark, MapPin, ShieldCheck, IdCard, Download, FileEdit } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface ProfileIdentityBannerProps {
  onOpenSmartId: () => void;
  onDownloadDossier: () => void;
  onOpenUpdateModal: () => void;
}

export function ProfileIdentityBanner({
  onOpenSmartId,
  onDownloadDossier,
  onOpenUpdateModal,
}: ProfileIdentityBannerProps) {
  const { t } = useLanguageStore();

  return (
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
              <BadgeCheck className="w-4 h-4 block" />
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
              <span className="text-xs text-slate-500">
                {t('• ११+ वर्ष आबद्ध (२०७० देखि)', '• Member for 11+ yrs (Since 2013)')}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-headline tracking-tight">
              {t('श्री हरि प्रसाद चौधरी', 'Hari Prasad Chaudhary')}
            </h1>

            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-0.5">
              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                <Landmark className="w-4.5 h-4.5 text-emerald-600" />
                {t('गढवा मुख्य शाखा', 'Gadhwa Main Branch')}
              </span>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <MapPin className="w-4.5 h-4.5 text-slate-400" />
                गढवा गाउँपालिका वडा नं ५, चैनपुर, दाङ
              </span>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium whitespace-nowrap">
                <ShieldCheck className="w-4 h-4" />
                {t('नवीकरण: २०८२ आषाढ मसान्त', 'Renewal: Mid-July 2025')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-2 xl:pt-0">
          <button
            type="button"
            onClick={onOpenSmartId}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-sm transition whitespace-nowrap cursor-pointer"
          >
            <IdCard className="w-4.5 h-4.5" />
            <span>{t('डिजिटल परिचयपत्र', 'Digital Smart ID')}</span>
          </button>
          <button
            type="button"
            onClick={onDownloadDossier}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition whitespace-nowrap cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4.5 h-4.5" />
            <span>{t('केवाईसी डसियर', 'KYC Dossier')}</span>
          </button>
          <button
            type="button"
            onClick={onOpenUpdateModal}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-[0.98] text-emerald-800 dark:text-emerald-300 font-semibold text-xs sm:text-sm border border-emerald-300 dark:border-emerald-700/60 transition whitespace-nowrap cursor-pointer shadow-xs"
          >
            <FileEdit className="w-4.5 h-4.5" />
            <span>{t('विवरण सच्याउनुहोस्', 'Update Details')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
