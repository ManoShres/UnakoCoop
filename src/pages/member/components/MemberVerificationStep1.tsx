import React from 'react';
import { User, ArrowRight } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface MemberVerificationStep1Props {
  fullName: string;
  setFullName: (val: string) => void;
  nameNepali: string;
  setNameNepali: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  dob: string;
  setDob: (val: string) => void;
  fatherName: string;
  setFatherName: (val: string) => void;
  motherName: string;
  setMotherName: (val: string) => void;
  mobilePhone: string;
  setMobilePhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  citizenshipNo: string;
  setCitizenshipNo: (val: string) => void;
  citizenshipDistrict: string;
  setCitizenshipDistrict: (val: string) => void;
  onNext: () => void;
}

export function MemberVerificationStep1({
  fullName,
  setFullName,
  nameNepali,
  setNameNepali,
  gender,
  setGender,
  dob,
  setDob,
  fatherName,
  setFatherName,
  motherName,
  setMotherName,
  mobilePhone,
  setMobilePhone,
  email,
  setEmail,
  citizenshipNo,
  setCitizenshipNo,
  citizenshipDistrict,
  setCitizenshipDistrict,
  onNext,
}: MemberVerificationStep1Props) {
  const { t } = useLanguageStore();

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
        <User className="size-4 text-emerald-500" />
        <span>{t('१. व्यक्तिगत तथा परिचय विवरण', '1. Personal & KYC Profile')}</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('पूरा नाम (अंग्रेजीमा) *', 'Full Legal Name (English) *')}
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t('जस्तै: बिक्रम बहादुर थापा', 'e.g. Bikram Bahadur Thapa')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('पूरा नाम (नेपाली देवनागरीमा)', 'Full Legal Name (in Devanagari)')}
          </label>
          <input
            type="text"
            value={nameNepali}
            onChange={(e) => setNameNepali(e.target.value)}
            placeholder={t('जस्तै: बिक्रम बहादुर थापा', 'e.g. बिक्रम बहादुर थापा')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('लिङ्ग *', 'Gender *')}
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="MALE">{t('पुरुष', 'Male')}</option>
            <option value="FEMALE">{t('महिला', 'Female')}</option>
            <option value="OTHER">{t('अन्य', 'Other')}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('जन्म मिति (वि.सं.) *', 'Date of Birth (B.S.) *')}
          </label>
          <input
            type="text"
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            placeholder={t('वर्ष-महिना-गते (जस्तै: २०५२-०४-१५)', 'YYYY-MM-DD (e.g. 2052-04-15)')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('बुवाको पूरा नाम *', "Father's Full Name *")}
          </label>
          <input
            type="text"
            required
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
            placeholder={t("बुवाको नाम (जस्तै: लाल बहादुर थापा)", "Father's full name")}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('आमाको पूरा नाम *', "Mother's Full Name *")}
          </label>
          <input
            type="text"
            required
            value={motherName}
            onChange={(e) => setMotherName(e.target.value)}
            placeholder={t("आमाको नाम (जस्तै: कुन्ती देवी थापा)", "Mother's full name")}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('सम्पर्क मोबाइल नम्बर *', 'Mobile Phone Number *')}
          </label>
          <input
            type="tel"
            required
            value={mobilePhone}
            onChange={(e) => setMobilePhone(e.target.value)}
            placeholder={t('+९७७-९८५७८२९४११', '+977-9857829411')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('इमेल ठेगाना (ऐच्छिक)', 'Email Address (Optional)')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('naam@example.com', 'your.email@example.com')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('नागरिकता प्रमाणपत्र नं. *', 'Citizenship Certificate No *')}
          </label>
          <input
            type="text"
            required
            value={citizenshipNo}
            onChange={(e) => setCitizenshipNo(e.target.value)}
            placeholder={t('जस्तै: २८-०१-७६-०८४९२', 'e.g. 28-01-76-08492')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('नागरिकता जारी जिल्ला *', 'Citizenship Issue District *')}
          </label>
          <input
            type="text"
            required
            value={citizenshipDistrict}
            onChange={(e) => setCitizenshipDistrict(e.target.value)}
            placeholder={t('जस्तै: दाङ', 'e.g. Dang')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
        >
          <span>{t('अर्को: ठेगाना विवरण', 'Next: Address Details')}</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
