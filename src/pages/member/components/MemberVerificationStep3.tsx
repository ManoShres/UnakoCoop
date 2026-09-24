import React from 'react';
import { CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface MemberVerificationStep3Props {
  shareKitta: number;
  setShareKitta: (val: number) => void;
  preferredScheme: string;
  setPreferredScheme: (val: string) => void;
  nomineeName: string;
  setNomineeName: (val: string) => void;
  nomineeRelation: string;
  setNomineeRelation: (val: string) => void;
  nomineePhone: string;
  setNomineePhone: (val: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function MemberVerificationStep3({
  shareKitta,
  setShareKitta,
  preferredScheme,
  setPreferredScheme,
  nomineeName,
  setNomineeName,
  nomineeRelation,
  setNomineeRelation,
  nomineePhone,
  setNomineePhone,
  onPrevious,
  onNext,
}: MemberVerificationStep3Props) {
  const { t } = useLanguageStore();

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
        <CreditCard className="size-4 text-emerald-500" />
        <span>{t('३. शेयर खरिद तथा इच्छाएको व्यक्ति', '3. Shares, Scheme & Nominee')}</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('सुरुवाती शेयर खरिद (कम्तिमा १० कित्ता = रु. १,०००) *', 'Initial Share Subscription (Min. 10 shares = NPR 1,000) *')}
          </label>
          <select
            value={shareKitta}
            onChange={(e) => setShareKitta(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="10">{t('१० कित्ता — रु. १,००० (साधारण प्रवेश)', '10 Shares — NPR 1,000 (Standard Entry)')}</option>
            <option value="20">{t('२० कित्ता — रु. २,०००', '20 Shares — NPR 2,000')}</option>
            <option value="50">{t('५० कित्ता — रु. ५,०००', '50 Shares — NPR 5,000')}</option>
            <option value="100">{t('१०० कित्ता — रु. १०,०००', '100 Shares — NPR 10,000')}</option>
          </select>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {t('प्रवेश शुल्क: रु. १०० एकपटकको कानुनी दस्तुर।', 'Entrance Fee: NPR 100 one-time statutory fee.')}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('प्राथमिक बचत योजना *', 'Preferred Initial Savings Scheme *')}
          </label>
          <select
            value={preferredScheme}
            onChange={(e) => setPreferredScheme(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option>{t('साधारण सदस्य बचत (८.०% प्र.व.)', 'General Member Savings (8.0% p.a.)')}</option>
            <option>{t('नारी उत्थान महिला बचत (८.५% प्र.व.)', 'Nari Utthan Mahila Bachat (8.5% p.a.)')}</option>
            <option>{t('बाल भविष्य बचत (९.०% प्र.व.)', 'Child Growth Future Fund (9.0% p.a.)')}</option>
            <option>{t('ऐच्छिक दैनिक बचत (६.०% प्र.व.)', 'Optional Daily Saving (6.0% p.a.)')}</option>
          </select>
        </div>

        <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
            {t('हकवाला / इच्छाएको व्यक्तिको विवरण', 'Nominee Details')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                {t('हकवालाको पूरा नाम *', 'Nominee Full Name *')}
              </label>
              <input
                type="text"
                required
                value={nomineeName}
                onChange={(e) => setNomineeName(e.target.value)}
                placeholder={t('हकवालाको नाम', "Nominee's name")}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                {t('नाता *', 'Relationship *')}
              </label>
              <select
                value={nomineeRelation}
                onChange={(e) => setNomineeRelation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="Spouse">{t('पति/पत्नी', 'Spouse')}</option>
                <option value="Son">{t('छोरा', 'Son')}</option>
                <option value="Daughter">{t('छोरी', 'Daughter')}</option>
                <option value="Father">{t('बुवा', 'Father')}</option>
                <option value="Mother">{t('आमा', 'Mother')}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                {t('हकवालाको फोन नं.', 'Nominee Contact Phone')}
              </label>
              <input
                type="tel"
                value={nomineePhone}
                onChange={(e) => setNomineePhone(e.target.value)}
                placeholder="+977-98XXXXXXXX"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="py-2.5 px-5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>{t('पछाडि', 'Previous')}</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
        >
          <span>{t('अर्को: कागजात प्रमाणहरू', 'Next: Document Proofs')}</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
