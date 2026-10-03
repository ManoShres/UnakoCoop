import React from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertCircle, ArrowRight } from 'lucide-react';
import { Member } from '../../../types';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface MemberVerificationTrackTabProps {
  trackQuery: string;
  setTrackQuery: (val: string) => void;
  onSearchTrack: (e: React.FormEvent) => void;
  trackError: string | null;
  trackedResult: Member | null;
}

export function MemberVerificationTrackTab({
  trackQuery,
  setTrackQuery,
  onSearchTrack,
  trackError,
  trackedResult,
}: MemberVerificationTrackTabProps) {
  const { t, fmtCurrency } = useLanguageStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {t('सदस्यता आवेदनको स्थिति हेर्नुहोस्', 'Track Your Membership Application')}
          </h2>
          <p className="text-xs text-slate-500">
            {t(
              'तपाईंको आवेदन नम्बर (जस्तै APP-2081-XXXX), फोन नम्बर वा नागरिकता नम्बर प्रविष्ट गर्नुहोस्',
              'Enter your Application ID (e.g. APP-2081-XXXX), Phone Number, or Citizenship Number'
            )}
          </p>
        </div>

        <form onSubmit={onSearchTrack} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
            <input
              type="text"
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              placeholder={t('जस्तै: UK-92014, APP-2081, वा 28-02-75', 'e.g. UK-92014, APP-2081, or 28-02-75')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            {t('खोजी गर्नुहोस्', 'Search')}
          </button>
        </form>

        {trackError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{trackError}</span>
          </div>
        )}

        {/* Result Preview */}
        {trackedResult && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={trackedResult.avatarUrl}
                  alt=""
                  className="size-11 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{trackedResult.name}</h4>
                  <p className="text-[11px] font-mono text-slate-400">{trackedResult.memberNo}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  trackedResult.status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : trackedResult.status === 'ACTION_REQUIRED'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {trackedResult.status === 'VERIFIED'
                  ? t('स्वीकृत र प्रमाणीकरण सम्पन्न', 'Approved & Verified')
                  : trackedResult.status === 'ACTION_REQUIRED'
                  ? t('कागजात सच्याउन बाँकी', 'Document Action Required')
                  : t('कर्मचारी समीक्षाधीन', 'Under Staff Review')}
              </span>
            </div>

            {/* 4-Step Status Progress Tracker */}
            <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('आवेदन प्रक्रिया चरणहरू', 'Onboarding Pipeline Status')}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs">
                  <div className="size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">{t('आवेदन प्राप्त भयो', 'Application Received')}</p>
                    <p className="text-[11px] text-slate-400">{t('मिति', 'Date')}: {trackedResult.joinedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div
                    className={`size-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      trackedResult.status === 'VERIFIED'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 text-white animate-pulse'
                    }`}
                  >
                    {trackedResult.status === 'VERIFIED' ? '✓' : '2'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {t('कर्मचारी सीबीएस कागजात प्रमाणीकरण', 'Staff CBS Document Verification')}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {trackedResult.status === 'VERIFIED'
                        ? t('शाखा अधिकृतबाट नागरिकता प्रमाणित भयो', 'Citizenship verified by supervisory officer')
                        : t('गढवा शाखा अधिकृतको रुजु बाँकी', 'Pending scrutiny by Gadhwa branch officer')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div
                    className={`size-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      trackedResult.status === 'VERIFIED'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {trackedResult.status === 'VERIFIED' ? '✓' : '3'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">{t('शेयर पुँजी बाँडफाँड', 'Share Capital Allocation')}</p>
                    <p className="text-[11px] text-slate-400">
                      {t('जम्मा पुँजी', 'Pledged')}: <strong className="tabular-nums font-semibold text-slate-700 dark:text-slate-300">{fmtCurrency(trackedResult.shareCapital, true)}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {trackedResult.status === 'VERIFIED' ? (
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition"
                >
                  <span>{t('सदस्य पोर्टलमा लगइन गर्नुहोस्', 'Sign In to Member Portal Now')}</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
                <span>{t('छिटो निकास चाहनुहुन्छ? गढवा शाखा कार्यालयमा सम्पर्क गर्नुहोस्।', 'Need urgent clearance? Visit Gadhwa Branch office.')}</span>
                <a href="tel:+97782412055" className="text-emerald-600 font-bold hover:underline">
                  {t('सम्पर्क: ०८२-४१२०५५', 'Call +977-82-412055')}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
