import React from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { Building } from 'lucide-react';
import { MotherGroup } from '../../../types';
import { NEPAL_PROVINCES } from './OnboardingTypes';

interface OnboardingStep2AddressProps {
  province: string;
  setProvince: (val: string) => void;
  district: string;
  setDistrict: (val: string) => void;
  palika: string;
  setPalika: (val: string) => void;
  wardNo: string;
  setWardNo: (val: string) => void;
  tole: string;
  setTole: (val: string) => void;
  sameAsPermanent: boolean;
  setSameAsPermanent: (val: boolean) => void;
  tempAddress: string;
  setTempAddress: (val: string) => void;
  selectedMotherGroup: string;
  setSelectedMotherGroup: (val: string) => void;
  motherGroups: MotherGroup[];
}

export const OnboardingStep2Address: React.FC<OnboardingStep2AddressProps> = ({
  province,
  setProvince,
  district,
  setDistrict,
  palika,
  setPalika,
  wardNo,
  setWardNo,
  tole,
  setTole,
  sameAsPermanent,
  setSameAsPermanent,
  tempAddress,
  setTempAddress,
  selectedMotherGroup,
  setSelectedMotherGroup,
  motherGroups,
}) => {
  const { t } = useLanguageStore();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('२. नेपालको ५-तह स्थायी ठेगाना तथा आमा समूह आवद्धता', '2. 5-Tier Nepalese Address & Self-Help Group Affiliation')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('प्रदेश, जिल्ला, स्थानीय तह, वडा र टोल विवरण तथा कार्यक्षेत्र समूह चयन', 'Permanent residence tiering and mother group assignment.')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('प्रदेश *', 'Province *')}
          </label>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          >
            {NEPAL_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('जिल्ला *', 'District *')}
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="दाङ (Dang)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('नगरपालिका / गाउँपालिका *', 'Municipality / Rural Municipality *')}
          </label>
          <input
            type="text"
            value={palika}
            onChange={(e) => setPalika(e.target.value)}
            placeholder="गढवा गाउँपालिका (Gadhwa)"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('वडा नं. *', 'Ward Number *')}
          </label>
          <input
            type="text"
            value={wardNo}
            onChange={(e) => setWardNo(e.target.value)}
            placeholder="५"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('टोल / बस्ती *', 'Tole / Village *')}
          </label>
          <input
            type="text"
            value={tole}
            onChange={(e) => setTole(e.target.value)}
            placeholder="चेपे (Chepe)"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          />
        </div>
      </div>

      {/* Temporary Address Toggle */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sameAsPermanent}
            onChange={(e) => setSameAsPermanent(e.target.checked)}
            className="size-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('हालको बसोबास स्थायी ठेगानामै हो (Current address same as permanent)', 'Current residence is same as permanent address')}
          </span>
        </label>
        {!sameAsPermanent && (
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('हालको अस्थायी ठेगाना', 'Temporary / Residential Address')}
            </label>
            <input
              type="text"
              placeholder="जस्तै: काठमाडौं-३२, कोटेश्वर"
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>
        )}
      </div>

      {/* Mother Group Assignment */}
      <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 space-y-2">
        <div className="text-xs font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
          <Building className="size-4 text-indigo-600" />
          <span>{t('आमा समूह / केन्द्र आवद्धता (Mother Group Center)', 'Mother Group / Center Affiliation')}</span>
        </div>
        <select
          value={selectedMotherGroup}
          onChange={(e) => setSelectedMotherGroup(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-xs font-bold"
        >
          <option value="">{t('-- सिधा सहकारी सदस्य (कुनै समूहमा नभएको) --', '-- Direct Member (Not affiliated with group) --')}</option>
          {motherGroups.map((mg) => (
            <option key={mg.id} value={mg.id}>
              {mg.name} ({mg.location}) • {mg.meetingDay}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
          {t('महिला समूहमा आवद्ध हुँदा नियमित मासिक बैठक तथा समूह जमानी कर्जा सुविधा प्राप्त हुन्छ।', 'Affiliating with a Mother Group enables regular monthly center deposits and peer group lending.')}
        </p>
      </div>
    </div>
  );
};
