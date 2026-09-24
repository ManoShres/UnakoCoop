import React from 'react';
import { Link } from 'react-router-dom';
import { PiggyBank, CalendarCheck, Coins, Lock, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { MemberDashboardAccountSummary } from './MemberDashboardTypes';

interface MemberAccountsStripProps {
  summary: MemberDashboardAccountSummary;
  shareKitta: number;
}

export function MemberAccountsStrip({ summary, shareKitta }: MemberAccountsStripProps) {
  const { t, fmtCurrency, fmtDigits, fmtPercent } = useLanguageStore();

  const accounts = [
    {
      title: t('नियमित बचत खाता', 'Regular Savings Account'),
      type: t('दैनिक मौज्दात, त्रैमासिक ब्याज', 'Daily product, quarterly APY'),
      amount: summary.regularSavings,
      rate: '8.00%',
      rateLabel: t('८.००% वार्षिक प्रतिफल', '8.00% p.a. APY'),
      meta: t('खाता नं: ००४-१०२९४-८८-०१', 'A/C: 004-10294-88-01'),
      icon: PiggyBank,
      to: '/member/my-accounts-passbook',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: t('अनिवार्य मासिक बचत', 'Compulsory Monthly Savings'),
      type: t('मासिक अनिवार्य रु. २,०००', 'Auto-debited on 1st of month'),
      amount: summary.compulsorySavings,
      rate: '8.50%',
      rateLabel: t('८.५०% उच्च बचत दर', '8.50% p.a. APY'),
      meta: t('अर्को भुक्तानी: चैत्र १, २०८१', 'Next Auto-Debit: Chaitra 1'),
      icon: CalendarCheck,
      to: '/member/my-accounts-passbook',
      badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-300 dark:border-blue-800',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: t('सदस्य शेयर पुँजी', 'Member Share Capital'),
      type: `${fmtDigits(shareKitta)} ${t('कित्ता (प्रमाणपत्र #SC-०४१९)', 'Units (Cert #SC-0419)')}`,
      amount: summary.shareCapital,
      rate: '~12.0%',
      rateLabel: t('अपेक्षित लाभांश: ~१२%', 'Est. Dividend: ~12%'),
      meta: t('अन्तिम लाभांश: ११.२% नगद', 'Last Dividend: 11.2% Paid'),
      icon: Coins,
      to: '/member/shares-fixed-deposits',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      title: t('आवधिक मुद्दती निक्षेप', 'Fixed Deposit (Mudhati)'),
      type: t('१ वर्षे सुरक्षित मुद्दती योजना', '1-Yr Term Deposit'),
      amount: summary.fixedDeposits,
      rate: '10.50%',
      rateLabel: t('१०.५०% मासिक चक्र', '10.50% Monthly Comp.'),
      meta: t('परिपक्वता: २०८२ असार १४', 'Maturity: 2082 Ashad 14'),
      icon: Lock,
      to: '/member/shares-fixed-deposits',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>{t('सहकारी खाता मौज्दात विवरण', 'Cooperative Portfolio Breakdown')}</span>
        </h2>
        <Link
          to="/member/my-accounts-passbook"
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 transition"
        >
          <span>{t('सबै पासबुक हेर्नुहोस्', 'View All Ledgers')}</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acct, idx) => {
          const Icon = acct.icon;
          return (
            <Link
              key={idx}
              to={acct.to}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${acct.iconBg} transition-transform group-hover:scale-105`}>
                    <Icon className="size-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${acct.badgeColor}`}
                  >
                    {acct.rate}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {acct.title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {acct.type}
                </div>

                <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-3">
                  रु. {fmtCurrency(acct.amount, false)}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="truncate">{acct.meta}</span>
                <TrendingUp className="size-3.5 text-emerald-500 shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
