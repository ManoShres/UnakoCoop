import React from 'react';
import { Users, Pencil, Headset, Phone, Home, BadgeCheck } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface ProfileNomineeSectionProps {
  onOpenUpdateModal: () => void;
  onRequestHomeVisit: () => void;
}

export function ProfileNomineeSection({
  onOpenUpdateModal,
  onRequestHomeVisit,
}: ProfileNomineeSectionProps) {
  const { t } = useLanguageStore();

  return (
    <div className="space-y-8">
      {/* Nominee & Family Details Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-headline">
              {t('हकवाला विवरण', 'Nominee Details')}
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            {t('१००% हकदार', '100% Entitled')}
          </span>
        </div>

        {/* Primary Nominee Box */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/70 dark:border-slate-700/50 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-600/30 bg-white shrink-0 shadow-sm">
            <img
              className="w-full h-full object-cover"
              src="/assets/kyc/avatar_nominee.png"
              alt="Sunita Kumari Chaudhary"
            />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {t('मुख्य हकवाला (PRIMARY NOMINEE)', 'PRIMARY NOMINEE')}
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {t('श्रीमती सुनिता कुमारी चौधरी', 'Sunita Kumari Chaudhary')}
            </h4>
            <p className="text-xs text-slate-500">{t('नाता: श्रीमती', 'Relation: Spouse')}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>{t('नागरिकता नं:', 'Citizenship No:')}</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">५२-०१-७२-०३१४५ (Dang)</span>
          </div>
          <div className="flex justify-between">
            <span>{t('सम्पर्क नम्बर:', 'Contact No:')}</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">९८४७९***** (सत्यापित)</span>
          </div>
          <div className="flex justify-between">
            <span>{t('सेयर तथा बचत हकदाबी:', 'Share & Savings Claim:')}</span>
            <span className="font-semibold text-emerald-600">{t('१००% पूर्ण हकवाला', '100% Full Entitlement')}</span>
          </div>
        </div>

        {/* Dependent Children Info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('आश्रित परिवार तथा बाल शिक्षा बोनस योजना', 'Dependent Family & Child Education Scheme')}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {t('रोहन चौधरी (छोरा - १५ वर्ष)', 'Rohan Chaudhary (Son - 15 yrs)')}
                </p>
                <p className="text-[11px] text-slate-500">
                  {t('जनज्योति मा.वि. कक्षा १० (छात्रवृत्ति पाउने सूचीमा)', 'Janjyoti Secondary School Grade 10')}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                {t('आबद्ध', 'Enrolled')}
              </span>
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {t('रिया चौधरी (छोरी - ११ वर्ष)', 'Riya Chaudhary (Daughter - 11 yrs)')}
                </p>
                <p className="text-[11px] text-slate-500">
                  {t('उनको बाल बचत खाता (Acc: 04-209-12)', 'Child Savings Account (Acc: 04-209-12)')}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                {t('आबद्ध', 'Enrolled')}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenUpdateModal}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Pencil className="w-4 h-4" />
          {t('हकवाला वा परिवार विवरण संशोधन अनुरोध', 'Request Nominee / Family Revision')}
        </button>
      </div>

      {/* Assigned Field Officer Desk Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Headset className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-headline">
              {t('जिम्मेवार फिल्ड अधिकृत तथा डेस्क', 'Assigned Field Officer Desk')}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-600/30 bg-emerald-50 shrink-0 shadow-sm">
            <img
              className="w-full h-full object-cover"
              src="/assets/kyc/avatar_officer.png"
              alt="Sita Chaudhary"
            />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {t('तोकिएको सेवा अधिकृत', 'ASSIGNED OFFICER')}
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              सीता चौधरी (Sita Chaudhary)
            </h4>
            <p className="text-xs text-slate-500">{t('शाखा फिल्ड सुपरभाइजर (गढवा-५)', 'Branch Field Supervisor (Gadhwa-5)')}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
          <div className="flex justify-between">
            <span>{t('सम्पर्क टेलिफोन:', 'Telephone:')}</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">०८२-५६०१२३ (Ext: १०४)</span>
          </div>
          <div className="flex justify-between">
            <span>{t('मोबाइल / WhatsApp:', 'Mobile / WhatsApp:')}</span>
            <span className="font-mono font-semibold text-emerald-600">९८५७८-४०१२३</span>
          </div>
          <div className="flex justify-between">
            <span>{t('उपसमूह:', 'Self-help Unit:')}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {t('गढवा महिला-पुरुष स्वावलम्बी एकाइ #०३', 'Gadhwa Self-Reliance Unit #03')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t('नियमित बैठक तालिका:', 'Meeting Schedule:')}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {t('प्रत्येक महिनाको १५ गते (२:०० बजे)', 'Every 15th of month (2:00 PM)')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <a
            href="tel:9857840123"
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs text-center transition flex items-center justify-center gap-1 shadow-sm"
          >
            <Phone className="w-4 h-4" />
            {t('प्रत्यक्ष सम्पर्क', 'Direct Call')}
          </a>
          <button
            type="button"
            onClick={onRequestHomeVisit}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            {t('घरमै सेवा माग', 'Home Visit')}
          </button>
        </div>
      </div>

      {/* Member Charter & Rights Notice */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <BadgeCheck className="w-5 h-5" />
          <h4 className="font-bold text-sm font-headline">
            {t('सदस्य अधिकार तथा सुरक्षा ग्यारेन्टी', 'Member Rights & Protection Guarantee')}
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {t(
            'उनको बचत तथा ऋण सहकारी संस्था लि. सम्पूर्ण सदस्यहरूको व्यक्तिगत तथा वित्तीय विवरणको गोपनीयता ऐन २०७५ तथा सहकारी नियमावली २०७५ अनुसार अक्षुण्ण राख्न प्रतिबद्ध छ।',
            'Unako SACCOS Ltd. is committed to upholding member personal and financial data privacy under the Privacy Act 2075 and Cooperative Rules 2075.'
          )}
        </p>
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
          <span>{t('दर्ता नं: २८/२०५७/०५८', 'Reg No: 28/2057/058')}</span>
          <span>{t('गढवा, दाङ', 'Gadhwa, Dang')}</span>
        </div>
      </div>
    </div>
  );
}
