import React from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { HeartHandshake, CreditCard } from 'lucide-react';

interface OnboardingStep4NomineeSharesProps {
  nomineeName: string;
  setNomineeName: (val: string) => void;
  nomineeRelation: string;
  setNomineeRelation: (val: string) => void;
  nomineeCitizenship: string;
  setNomineeCitizenship: (val: string) => void;
  nomineePhone: string;
  setNomineePhone: (val: string) => void;
  nomineeIsMinor: boolean;
  setNomineeIsMinor: (val: boolean) => void;
  nomineeGuardianName: string;
  setNomineeGuardianName: (val: string) => void;
  nomineeGuardianRelation: string;
  setNomineeGuardianRelation: (val: string) => void;
  shareKitta: number;
  setShareKitta: (val: number) => void;
  entranceFee: number;
  setEntranceFee: (val: number) => void;
  monthlySavingsCommitment: number;
  setMonthlySavingsCommitment: (val: number) => void;
  bankName: string;
  setBankName: (val: string) => void;
  bankAccountNo: string;
  setBankAccountNo: (val: string) => void;
  bankBranch: string;
  setBankBranch: (val: string) => void;
}

export const OnboardingStep4NomineeShares: React.FC<OnboardingStep4NomineeSharesProps> = ({
  nomineeName,
  setNomineeName,
  nomineeRelation,
  setNomineeRelation,
  nomineeCitizenship,
  setNomineeCitizenship,
  nomineePhone,
  setNomineePhone,
  nomineeIsMinor,
  setNomineeIsMinor,
  nomineeGuardianName,
  setNomineeGuardianName,
  nomineeGuardianRelation,
  setNomineeGuardianRelation,
  shareKitta,
  setShareKitta,
  entranceFee,
  setEntranceFee,
  monthlySavingsCommitment,
  setMonthlySavingsCommitment,
  bankName,
  setBankName,
  bankAccountNo,
  setBankAccountNo,
  bankBranch,
  setBankBranch,
}) => {
  const { t, fmtCurrency } = useLanguageStore();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('४. कानुनी हकवाला (इच्छाइएको व्यक्ति) तथा प्रारम्भिक सेयर खाता', '4. Statutory Nominee (Haqwala) & Initial Share Account')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('सहकारी विधान अनुसार हकवालाको विवरण र प्रारम्भिक शेयर पुँजी जम्मा', 'Nominee designation, share capital subscription, and banking payout route.')}
        </p>
      </div>

      {/* Nominee Details Card */}
      <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
        <div className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-2">
          <HeartHandshake className="size-4 text-amber-600" />
          <span>{t('इच्छाइएको कानुनी हकवाला (Nominee Information)', 'Designated Legal Nominee')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('हकवालाको पूरा नाम *', 'Nominee Full Name *')}
            </label>
            <input
              type="text"
              placeholder="जस्तै: सुरेश चौधरी"
              value={nomineeName}
              onChange={(e) => setNomineeName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('नाता (Relationship) *', 'Relationship *')}
            </label>
            <select
              value={nomineeRelation}
              onChange={(e) => setNomineeRelation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            >
              <option value="छोरा (Son)">छोरा (Son)</option>
              <option value="छोरी (Daughter)">छोरी (Daughter)</option>
              <option value="पति/पत्नी (Spouse)">पति/पत्नी (Spouse)</option>
              <option value="आमा (Mother)">आमा (Mother)</option>
              <option value="बाबु (Father)">बाबु (Father)</option>
              <option value="भाइ/बहिनी (Sibling)">भाइ/बहिनी (Sibling)</option>
              <option value="अन्य (Other)">अन्य (Other)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('हकवालाको नागरिकता नं.', 'Nominee Citizenship No.')}
            </label>
            <input
              type="text"
              placeholder="५२-०१-८०-XXXXX"
              value={nomineeCitizenship}
              onChange={(e) => setNomineeCitizenship(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('हकवालाको सम्पर्क फोन', 'Nominee Contact Phone')}
            </label>
            <input
              type="text"
              placeholder="९८XXXXXXXX"
              value={nomineePhone}
              onChange={(e) => setNomineePhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
            />
          </div>
        </div>

        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={nomineeIsMinor}
              onChange={(e) => setNomineeIsMinor(e.target.checked)}
              className="size-3.5 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {t('हकवाला १८ वर्ष मुनिको नाबालक छ (Nominee is a minor under 18 years)', 'Nominee is a minor under 18')}
            </span>
          </label>
          {nomineeIsMinor && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <input
                type="text"
                placeholder={t('संरक्षकको नाम (Guardian Name)', 'Guardian Name')}
                value={nomineeGuardianName}
                onChange={(e) => setNomineeGuardianName(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
              <input
                type="text"
                placeholder={t('संरक्षकको नाता (Guardian Relation)', 'Guardian Relation')}
                value={nomineeGuardianRelation}
                onChange={(e) => setNomineeGuardianRelation(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Share Allotment & Financial Setup */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('प्रारम्भिक शेयर कित्ता (दर रु. १००) *', 'Initial Share Kitta (@ NPR 100) *')}
          </label>
          <input
            type="number"
            min={10}
            step={10}
            value={shareKitta}
            onChange={(e) => setShareKitta(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
          />
          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            = रु. {fmtCurrency(shareKitta * 100, true)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('प्रवेश शुल्क (Entrance Fee)', 'Entrance Fee (NPR)')}
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={entranceFee}
            onChange={(e) => setEntranceFee(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
          />
          <div className="text-[10px] text-slate-400 mt-1">
            {t('सहकारी सदस्यता प्रवेश शुल्क', 'One-time admission charge')}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('मासिक अनिवार्य बचत (प्रति महिना)', 'Mandatory Monthly Savings')}
          </label>
          <input
            type="number"
            min={200}
            step={100}
            value={monthlySavingsCommitment}
            onChange={(e) => setMonthlySavingsCommitment(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
          />
          <div className="text-[10px] text-slate-400 mt-1">
            {t('नियमित मासिक बचत खाता', 'Regular monthly recurring fund')}
          </div>
        </div>
      </div>

      {/* Bank Payout Account */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <CreditCard className="size-4 text-blue-500" />
          <span>{t('लाभांश भुक्तानी बैंक खाता (Dividend Payout Bank Account)', 'Dividend Payout Bank Account')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder={t('बैंकको नाम', 'Bank Name')}
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
          <input
            type="text"
            placeholder={t('खाता नम्बर', 'Account Number')}
            value={bankAccountNo}
            onChange={(e) => setBankAccountNo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
          />
          <input
            type="text"
            placeholder={t('शाखा कार्यालय', 'Branch Name')}
            value={bankBranch}
            onChange={(e) => setBankBranch(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
        </div>
      </div>
    </div>
  );
};
