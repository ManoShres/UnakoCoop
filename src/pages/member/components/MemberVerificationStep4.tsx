import React from 'react';
import { Upload, Check, User, FileCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface MemberVerificationStep4Props {
  docCitizenshipFront: string | null;
  setDocCitizenshipFront: (val: string | null) => void;
  docCitizenshipBack: string | null;
  setDocCitizenshipBack: (val: string | null) => void;
  docPhoto: string | null;
  setDocPhoto: (val: string | null) => void;
  docSignature: string | null;
  setDocSignature: (val: string | null) => void;
  onFileUpload: (type: 'front' | 'back' | 'photo' | 'sig', e: React.ChangeEvent<HTMLInputElement>) => void;
  agreeTerms: boolean;
  setAgreeTerms: (val: boolean) => void;
  isSubmitting: boolean;
  onPrevious: () => void;
}

export function MemberVerificationStep4({
  docCitizenshipFront,
  setDocCitizenshipFront,
  docCitizenshipBack,
  setDocCitizenshipBack,
  docPhoto,
  setDocPhoto,
  docSignature,
  setDocSignature,
  onFileUpload,
  agreeTerms,
  setAgreeTerms,
  isSubmitting,
  onPrevious,
}: MemberVerificationStep4Props) {
  const { t } = useLanguageStore();

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
        <Upload className="size-4 text-emerald-500" />
        <span>{t('४. प्रमाण कागजातहरू अपलोड', '4. KYC Document Uploads')}</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Citizenship Front */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t('नागरिकता अगाडि *', 'Citizenship Front *')}
            </span>
            {docCitizenshipFront && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <Check className="size-3" /> {t('संलग्न भयो', 'Attached')}
              </span>
            )}
          </div>
          {docCitizenshipFront ? (
            <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
              <img src={docCitizenshipFront} alt="Citizenship Front" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setDocCitizenshipFront(null)}
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/80 text-white text-[10px] opacity-0 group-hover:opacity-100 transition"
              >
                {t('हटाउनुहोस्', 'Remove')}
              </button>
            </div>
          ) : (
            <label className="h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition cursor-pointer">
              <Upload className="size-5" />
              <span className="text-[11px] font-medium">{t('फोटो अपलोड गर्न थिच्नुहोस्', 'Click to upload image')}</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => onFileUpload('front', e)}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Citizenship Back */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t('नागरिकता पछाडि *', 'Citizenship Back *')}
            </span>
            {docCitizenshipBack && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <Check className="size-3" /> {t('संलग्न भयो', 'Attached')}
              </span>
            )}
          </div>
          {docCitizenshipBack ? (
            <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
              <img src={docCitizenshipBack} alt="Citizenship Back" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setDocCitizenshipBack(null)}
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/80 text-white text-[10px] opacity-0 group-hover:opacity-100 transition"
              >
                {t('हटाउनुहोस्', 'Remove')}
              </button>
            </div>
          ) : (
            <label className="h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition cursor-pointer">
              <Upload className="size-5" />
              <span className="text-[11px] font-medium">{t('फोटो अपलोड गर्न थिच्नुहोस्', 'Click to upload image')}</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => onFileUpload('back', e)}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Passport Photo */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t('पासपोर्ट साइज फोटो *', 'Passport Size Photo *')}
            </span>
            {docPhoto && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <Check className="size-3" /> {t('संलग्न भयो', 'Attached')}
              </span>
            )}
          </div>
          {docPhoto ? (
            <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
              <img src={docPhoto} alt="Passport Photo" className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={() => setDocPhoto(null)}
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/80 text-white text-[10px] opacity-0 group-hover:opacity-100 transition"
              >
                {t('हटाउनुहोस्', 'Remove')}
              </button>
            </div>
          ) : (
            <label className="h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition cursor-pointer">
              <User className="size-5" />
              <span className="text-[11px] font-medium">{t('फोटो अपलोड गर्नुहोस्', 'Upload photo')}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileUpload('photo', e)}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Signature Specimen */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t('दस्तखत नमुना *', 'Signature Specimen *')}
            </span>
            {docSignature && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <Check className="size-3" /> {t('संलग्न भयो', 'Attached')}
              </span>
            )}
          </div>
          {docSignature ? (
            <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
              <img src={docSignature} alt="Signature" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setDocSignature(null)}
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/80 text-white text-[10px] opacity-0 group-hover:opacity-100 transition"
              >
                {t('हटाउनुहोस्', 'Remove')}
              </button>
            </div>
          ) : (
            <label className="h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition cursor-pointer">
              <FileCheck className="size-5" />
              <span className="text-[11px] font-medium">{t('दस्तखत फोटो अपलोड गर्नुहोस्', 'Upload signature image')}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileUpload('sig', e)}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Bylaws Declaration Checkbox */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-1 size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {t(
              'म यस संस्थाको विनियम, सहकारी ऐन २०७४ र सम्बन्धित नियमहरू पूर्ण रूपमा पालना गर्न मञ्जुर छु। मैले पेश गरेका सम्पूर्ण विवरण तथा कागजातहरू सत्य-तथ्य छन्।',
              'I hereby declare that all information provided is accurate and pledge adherence to Unako SACCOS bylaws and Cooperative Act 2074.'
            )}
          </span>
        </label>
      </div>

      {/* Submit Bar */}
      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="py-2.5 px-5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>{t('पछाडि', 'Previous')}</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="py-3.5 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              <span>{t('सीबीएसमा पेश हुँदैछ...', 'Submitting Application to CBS...')}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-5" />
              <span>{t('सदस्यता आवेदन पेश गर्नुहोस्', 'Submit Membership Application')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
