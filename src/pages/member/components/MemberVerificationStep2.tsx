import React from 'react';
import { Building, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface MemberVerificationStep2Props {
  province: string;
  setProvince: (val: string) => void;
  municipality: string;
  setMunicipality: (val: string) => void;
  wardNo: string;
  setWardNo: (val: string) => void;
  tole: string;
  setTole: (val: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function MemberVerificationStep2({
  province,
  setProvince,
  municipality,
  setMunicipality,
  wardNo,
  setWardNo,
  tole,
  setTole,
  onPrevious,
  onNext,
}: MemberVerificationStep2Props) {
  const { t } = useLanguageStore();

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
        <Building className="size-4 text-emerald-500" />
        <span>{t('२. स्थायी तथा वर्तमान ठेगाना', '2. Address & Ward Details')}</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('प्रदेश *', 'Province *')}
          </label>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="Lumbini Province">{t('लुम्बिनी प्रदेश', 'Lumbini Province')}</option>
            <option value="Bagmati Province">{t('बागमती प्रदेश', 'Bagmati Province')}</option>
            <option value="Gandaki Province">{t('गण्डकी प्रदेश', 'Gandaki Province')}</option>
            <option value="Karnali Province">{t('कर्णाली प्रदेश', 'Karnali Province')}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('जिल्ला *', 'District *')}
          </label>
          <input
            type="text"
            required
            value={t('दाङ', 'Dang')}
            readOnly
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-xs font-bold text-slate-700 dark:text-slate-300"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('गाउँपालिका / नगरपालिका *', 'Municipality / Rural Municipality *')}
          </label>
          <select
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="Gadhwa Rural Municipality">{t('गढवा गाउँपालिका', 'Gadhwa Rural Municipality')}</option>
            <option value="Lamahi Municipality">{t('लमही नगरपालिका', 'Lamahi Municipality')}</option>
            <option value="Rajpur Rural Municipality">{t('राजपुर गाउँपालिका', 'Rajpur Rural Municipality')}</option>
            <option value="Rapti Rural Municipality">{t('राप्ती गाउँपालिका', 'Rapti Rural Municipality')}</option>
            <option value="Ghorahi Sub-Metropolitan">{t('घोराही उपमहानगर', 'Ghorahi Sub-Metropolitan')}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('वडा नम्बर *', 'Ward Number *')}
          </label>
          <input
            type="number"
            min="1"
            max="19"
            required
            value={wardNo}
            onChange={(e) => setWardNo(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('टोल / बस्तीको नाम *', 'Tole / Settlement / Village *')}
          </label>
          <input
            type="text"
            required
            value={tole}
            onChange={(e) => setTole(e.target.value)}
            placeholder={t('जस्तै: चैनपुर, देउखुरी', 'e.g. Chainpur, Deukhuri')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
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
          <span>{t('अर्को: सेयर र हकवाला', 'Next: Shares & Nominee')}</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
