import React from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { ShieldCheck } from 'lucide-react';
import { GenderType, MaritalStatusType, OCCUPATION_OPTIONS } from './OnboardingTypes';

interface OnboardingStep1PersonalProps {
  fullNameNe: string;
  setFullNameNe: (val: string) => void;
  fullNameEn: string;
  setFullNameEn: (val: string) => void;
  gender: GenderType;
  setGender: (val: GenderType) => void;
  maritalStatus: MaritalStatusType;
  setMaritalStatus: (val: MaritalStatusType) => void;
  occupation: string;
  setOccupation: (val: string) => void;
  dobBs: string;
  setDobBs: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  fatherName: string;
  setFatherName: (val: string) => void;
  grandfatherName: string;
  setGrandfatherName: (val: string) => void;
  motherName: string;
  setMotherName: (val: string) => void;
  spouseName: string;
  setSpouseName: (val: string) => void;
}

export const OnboardingStep1Personal: React.FC<OnboardingStep1PersonalProps> = ({
  fullNameNe,
  setFullNameNe,
  fullNameEn,
  setFullNameEn,
  gender,
  setGender,
  maritalStatus,
  setMaritalStatus,
  occupation,
  setOccupation,
  dobBs,
  setDobBs,
  phone,
  setPhone,
  fatherName,
  setFatherName,
  grandfatherName,
  setGrandfatherName,
  motherName,
  setMotherName,
  spouseName,
  setSpouseName,
}) => {
  const { t } = useLanguageStore();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('१. व्यक्तिगत पहिचान तथा ३ पुस्ते पारिवारिक विवरण', '1. Personal Demographics & 3-Generation Lineage')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('सदस्यको कानुनी नाम, जन्म मिति, पेशा र पारिवारिक तीन पुस्ते नाम', 'Enter full legal names, birth particulars, and statutory 3-generation lineage.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('पूरा नाम (नेपालीमा) *', 'Full Legal Name (Nepali) *')}
          </label>
          <input
            type="text"
            placeholder="जस्तै: सुनिता थारु"
            value={fullNameNe}
            onChange={(e) => setFullNameNe(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('पूरा नाम (English मा) *', 'Full Name (in English) *')}
          </label>
          <input
            type="text"
            placeholder="e.g. Sunita Tharu"
            value={fullNameEn}
            onChange={(e) => setFullNameEn(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('लिङ्ग *', 'Gender *')}
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as GenderType)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          >
            <option value="FEMALE">{t('महिला', 'Female')}</option>
            <option value="MALE">{t('पुरुष', 'Male')}</option>
            <option value="OTHER">{t('अन्य', 'Other')}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('वैवाहिक स्थिति *', 'Marital Status *')}
          </label>
          <select
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value as MaritalStatusType)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          >
            <option value="MARRIED">{t('विवाहित', 'Married')}</option>
            <option value="UNMARRIED">{t('अविवाहित', 'Unmarried')}</option>
            <option value="WIDOWED">{t('एकल/विधवा/विदुर', 'Widowed')}</option>
            <option value="DIVORCED">{t('पारपाचुके', 'Divorced')}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('मुख्य पेशा *', 'Primary Occupation *')}
          </label>
          <select
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          >
            {OCCUPATION_OPTIONS.map((occ) => (
              <option key={occ.value} value={occ.value}>
                {t(occ.labelNe, occ.labelEn)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('जन्म मिति (वि.सं. B.S.) *', 'Date of Birth (B.S.) *')}
          </label>
          <input
            type="text"
            value={dobBs}
            onChange={(e) => setDobBs(e.target.value)}
            placeholder="YYYY-MM-DD (जस्तै: २०४८-०४-१५)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('मोबाइल नम्बर *', 'Mobile Number *')}
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98XXXXXXXX"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
          />
        </div>
      </div>

      {/* 3-Generation Lineage Card */}
      <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
        <div className="text-xs font-black text-blue-900 dark:text-blue-300 flex items-center gap-2">
          <ShieldCheck className="size-4 text-blue-600" />
          <span>{t('कानुनी तीन पुस्ते विवरण (3-Generation Lineage)', 'Statutory 3-Generation Lineage')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('बाबुको पूरा नाम *', "Father's Full Name *")}
            </label>
            <input
              type="text"
              placeholder="जस्तै: रामप्रसाद थारु"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('बाजेको पूरा नाम *', "Grandfather's Full Name *")}
            </label>
            <input
              type="text"
              placeholder="जस्तै: मानबहादुर थारु"
              value={grandfatherName}
              onChange={(e) => setGrandfatherName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('आमाको पूरा नाम', "Mother's Full Name")}
            </label>
            <input
              type="text"
              placeholder="जस्तै: कौशिल्या थारु"
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('पति / पत्नीको पूरा नाम (विवाहित भएमा)', 'Spouse Name (If Married)')}
            </label>
            <input
              type="text"
              placeholder="जस्तै: जीवन चौधरी"
              value={spouseName}
              onChange={(e) => setSpouseName(e.target.value)}
              disabled={maritalStatus === 'UNMARRIED'}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
