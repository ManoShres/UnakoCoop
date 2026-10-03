import React from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Bell, PhoneCall, CheckCircle, Info, ChevronRight } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

export function MemberStandingAndAdvisory() {
  const { t } = useLanguageStore();

  const standingRules = [
    {
      label: t('अनिवार्य मासिक बचत नियम', 'Compulsory Savings Rule'),
      desc: t('प्रत्येक महिनाको १ गते स्वतः कट्टा', 'Auto-debited on 1st of every BS month'),
      amount: 'रु. २,००० / महिना',
      active: true,
      nextDate: '२०८१ चैत्र १',
    },
    {
      label: t('कृषि कर्जा किस्ता कट्टा #२५', 'Agro Loan EMI Auto-Debit'),
      desc: t('खाता ००४-१०२९४ बाट सिधै फर्छ्यौट', 'Direct settlement from savings A/C'),
      amount: 'रु. ८,६४० / महिना',
      active: true,
      nextDate: '२०८१ चैत्र १५',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Standing Instructions Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="size-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t('स्थायी निर्देशनहरू', 'Standing Auto-Debits')}
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
            {t('२ सक्रिय', '2 Active')}
          </span>
        </div>

        <div className="space-y-2.5">
          {standingRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {rule.label}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {rule.desc}
                </div>
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                  {rule.amount}
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 shrink-0 text-right">
                {rule.nextDate}
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/member/my-accounts-passbook"
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-between pt-1"
        >
          <span>{t('निर्देशनहरू व्यवस्थापन गर्नुहोस्', 'Manage Standing Rules')}</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {/* Advisory & Dividend Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/50 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <Info className="size-4 text-emerald-600" />
          <span>{t('शाखा सूचना तथा लाभांश घोषणा', 'Branch Advisory & Dividend')}</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {t(
            '१२ औं वार्षिक साधारण सभाले १४.२% नगद लाभांश र १.५% बोनस शेयर अनुमोदन गरेको छ। तपाईंको ५०० कित्ताको लाभांश चैत्र १५ गते नियमित बचतमा जम्मा हुनेछ।',
            'The 12th AGM approved a 14.2% Cash Dividend and 1.5% Bonus Share. Dividend on your 500 units will be credited to Regular Savings on Chaitra 15, 2081.'
          )}
        </p>

        <div className="pt-2 border-t border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between text-[11px] text-slate-500">
          <span>{t('सहकारी दर्ता: १२९०/०६७/०६८', 'Reg: 1290/067/068')}</span>
          <span>{t('पान: ३००१२४८९०', 'PAN: 300124890')}</span>
        </div>
      </div>

      {/* Support & Helpline */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
            <PhoneCall className="size-4" />
          </div>
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">
              {t('सदस्य सहायता कक्ष', 'Member Helpline')}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">082-412055</div>
          </div>
        </div>

        <Link
          to="/member/cooperative-governance-support"
          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-slate-700 dark:text-slate-300 transition"
        >
          {t('सम्पर्क', 'Helpdesk')}
        </Link>
      </div>
    </div>
  );
}
