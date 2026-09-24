import React from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { Camera, FileText, Upload } from 'lucide-react';

interface OnboardingStep3IdentityProps {
  citizenshipNo: string;
  setCitizenshipNo: (val: string) => void;
  citizenshipIssueDateBs: string;
  setCitizenshipIssueDateBs: (val: string) => void;
  citizenshipIssueDistrict: string;
  setCitizenshipIssueDistrict: (val: string) => void;
  nationalIdNo: string;
  setNationalIdNo: (val: string) => void;
  panNo: string;
  setPanNo: (val: string) => void;
  docPhotoUploaded: boolean;
  setDocPhotoUploaded: (val: boolean) => void;
  docCitizenshipFrontUploaded: boolean;
  setDocCitizenshipFrontUploaded: (val: boolean) => void;
  docCitizenshipBackUploaded: boolean;
  setDocCitizenshipBackUploaded: (val: boolean) => void;
  docSignatureUploaded: boolean;
  setDocSignatureUploaded: (val: boolean) => void;
}

export const OnboardingStep3Identity: React.FC<OnboardingStep3IdentityProps> = ({
  citizenshipNo,
  setCitizenshipNo,
  citizenshipIssueDateBs,
  setCitizenshipIssueDateBs,
  citizenshipIssueDistrict,
  setCitizenshipIssueDistrict,
  nationalIdNo,
  setNationalIdNo,
  panNo,
  setPanNo,
  docPhotoUploaded,
  setDocPhotoUploaded,
  docCitizenshipFrontUploaded,
  setDocCitizenshipFrontUploaded,
  docCitizenshipBackUploaded,
  setDocCitizenshipBackUploaded,
  docSignatureUploaded,
  setDocSignatureUploaded,
}) => {
  const { t } = useLanguageStore();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('३. नागरिकता, राष्ट्रिय परिचयपत्र तथा डिजिटल कागजात', '3. Citizenship, National ID & Document Uploads')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('नागरिकता जारी विवरण र स्पष्ट डिजिटल प्रतिलिपि अपलोड', 'Statutory citizenship registry particulars and document attachments.')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('नागरिकता प्रमाणपत्र नं. *', 'Citizenship Certificate No. *')}
          </label>
          <input
            type="text"
            value={citizenshipNo}
            onChange={(e) => setCitizenshipNo(e.target.value)}
            placeholder="५२-०१-७५-०३२१४"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('जारी मिति (वि.सं.) *', 'Issue Date (B.S.) *')}
          </label>
          <input
            type="text"
            value={citizenshipIssueDateBs}
            onChange={(e) => setCitizenshipIssueDateBs(e.target.value)}
            placeholder="२०६६-०२-११"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('जारी जिल्ला *', 'Issuing District *')}
          </label>
          <input
            type="text"
            value={citizenshipIssueDistrict}
            onChange={(e) => setCitizenshipIssueDistrict(e.target.value)}
            placeholder="दाङ (Dang)"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('राष्ट्रिय परिचयपत्र नं. (ऐच्छिक)', 'National ID Number (Optional)')}
          </label>
          <input
            type="text"
            value={nationalIdNo}
            onChange={(e) => setNationalIdNo(e.target.value)}
            placeholder="९८०-XXXX-XXXX"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('स्थायी लेखा नम्बर (PAN नं. - ऐच्छिक)', 'Permanent Account Number (PAN)')}
          </label>
          <input
            type="text"
            value={panNo}
            onChange={(e) => setPanNo(e.target.value)}
            placeholder="६००XXXXXX"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
          />
        </div>
      </div>

      {/* Upload Dropzones */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {/* Photo */}
        <div
          onClick={() => setDocPhotoUploaded(!docPhotoUploaded)}
          className="p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center hover:border-blue-500 transition cursor-pointer"
        >
          <Camera className="size-6 text-blue-500 mx-auto mb-1" />
          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
            {t('पासपोर्ट फोटो', 'Member Photo')}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            {docPhotoUploaded ? '✓ ' + t('संलग्न भयो', 'Attached') : t('अपलोड', 'Upload')}
          </div>
        </div>

        {/* Citizenship Front */}
        <div
          onClick={() => setDocCitizenshipFrontUploaded(!docCitizenshipFrontUploaded)}
          className="p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center hover:border-blue-500 transition cursor-pointer"
        >
          <FileText className="size-6 text-indigo-500 mx-auto mb-1" />
          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
            {t('नागरिकता अगाडि', 'Citizenship Front')}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            {docCitizenshipFrontUploaded ? '✓ ' + t('संलग्न भयो', 'Attached') : t('अपलोड', 'Upload')}
          </div>
        </div>

        {/* Citizenship Back */}
        <div
          onClick={() => setDocCitizenshipBackUploaded(!docCitizenshipBackUploaded)}
          className="p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center hover:border-blue-500 transition cursor-pointer"
        >
          <FileText className="size-6 text-indigo-500 mx-auto mb-1" />
          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
            {t('नागरिकता पछाडि', 'Citizenship Back')}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            {docCitizenshipBackUploaded ? '✓ ' + t('संलग्न भयो', 'Attached') : t('अपलोड', 'Upload')}
          </div>
        </div>

        {/* Signature */}
        <div
          onClick={() => setDocSignatureUploaded(!docSignatureUploaded)}
          className="p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center hover:border-blue-500 transition cursor-pointer"
        >
          <Upload className="size-6 text-emerald-500 mx-auto mb-1" />
          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
            {t('हस्ताक्षर नमुना', 'Signature Sample')}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            {docSignatureUploaded ? '✓ ' + t('संलग्न भयो', 'Attached') : t('अपलोड', 'Upload')}
          </div>
        </div>
      </div>
    </div>
  );
};
