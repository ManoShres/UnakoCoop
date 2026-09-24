import React from 'react';
import { Link } from 'react-router-dom';
import { Send, ArrowDownToLine, CreditCard, BookOpen, FileText } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface MemberQuickActionsProps {
  onOpenDepositModal: () => void;
  onOpenEmiModal: () => void;
}

export function MemberQuickActions({
  onOpenDepositModal,
  onOpenEmiModal,
}: MemberQuickActionsProps) {
  const { t } = useLanguageStore();

  const actions = [
    {
      id: 'transfer',
      label: t('रकम पठाउनुहोस्', 'Transfer Money'),
      sub: t('सहकारी वा वालेट', 'Member or Wallet'),
      to: '/member/transfers-payments',
      icon: Send,
      color: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
      iconColor: 'text-white',
    },
    {
      id: 'deposit',
      label: t('रकम जम्मा गर्नुहोस्', 'Deposit Funds'),
      sub: t('eSewa / Khalti / बैंक', 'eSewa, Khalti, Bank'),
      onClick: onOpenDepositModal,
      icon: ArrowDownToLine,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
      iconColor: 'text-white',
    },
    {
      id: 'emi',
      label: t('ऋण किस्ता भुक्तानी', 'Pay Loan EMI'),
      sub: t('शून्य शुल्क तत्काल चुक्ता', 'Instant EMI Settlement'),
      onClick: onOpenEmiModal,
      icon: CreditCard,
      color: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
      iconColor: 'text-white',
    },
    {
      id: 'passbook',
      label: t('डिजिटल पासबुक', 'Digital Passbook'),
      sub: t('खाता तथा ब्याज विवरण', 'Ledger & Statements'),
      to: '/member/my-accounts-passbook',
      icon: BookOpen,
      color: 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-900/20 dark:bg-slate-800 dark:hover:bg-slate-700',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'statement',
      label: t('वार्षिक वित्तीय विवरण', 'Annual Statement'),
      sub: t('कर तथा लेखा परीक्षण', 'Tax & Compliance'),
      to: '/member/annual-statement',
      icon: FileText,
      color: 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-500/20',
      iconColor: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {actions.map((act) => {
        const Icon = act.icon;
        const buttonContent = (
          <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 shadow-xs hover:shadow-md transition-all duration-200 group h-full justify-between">
            <div
              className={`size-12 rounded-xl flex items-center justify-center mb-2.5 transition-transform duration-200 group-hover:scale-105 shadow-md ${act.color}`}
            >
              <Icon className={`size-5 ${act.iconColor}`} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {act.label}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {act.sub}
              </div>
            </div>
          </div>
        );

        if (act.to) {
          return (
            <Link key={act.id} to={act.to} className="block h-full">
              {buttonContent}
            </Link>
          );
        }

        return (
          <button
            key={act.id}
            type="button"
            onClick={act.onClick}
            className="block w-full text-left h-full"
          >
            {buttonContent}
          </button>
        );
      })}
    </div>
  );
}
