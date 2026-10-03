import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ShieldCheck, Sparkles, ArrowRight, Clock, Award } from 'lucide-react';
import { Loan } from '../../../../types';
import { LOAN_SCHEMES } from '../../../../types/loan';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface MemberLoanHealthCardProps {
  loan?: Loan;
  onOpenEmiModal: () => void;
}

export function MemberLoanHealthCard({ loan, onOpenEmiModal }: MemberLoanHealthCardProps) {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();

  const totalSanctioned = loan?.principalAmount || 300000;
  const remaining = loan?.remainingBalance !== undefined ? loan.remainingBalance : 118420;
  const cleared = Math.max(0, totalSanctioned - remaining);
  const percentCleared = Math.min(100, Math.round((cleared / totalSanctioned) * 100));
  const emiAmount = loan?.monthlyEmi || 8640;
  const loanNo = loan?.loanNo || 'LN-2099-0418';

  const matchedScheme = loan?.loanType ? LOAN_SCHEMES.find((s) => s.type === loan.loanType) : undefined;
  const localizedLoanType = matchedScheme
    ? t(matchedScheme.labelNe, matchedScheme.labelEn)
    : loan?.loanType || t('कृषि तथा दुग्ध व्यवसाय कर्जा', 'Krishi & Dairy Entrepreneurship Loan');

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between h-full space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
            <ShieldCheck className="size-3.5" />
            <span>{t('सक्रिय सहुलियत कृषि कर्जा', 'Active Subsidized Agro Loan')}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-bold">
            {loanNo}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {localizedLoanType}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t('चेनपुर दुग्ध संकलन केन्द्र, गढवा क्लस्टर', 'Chainpur Dairy Cooperative Cluster, Gadhwa')}
        </p>
      </div>

      {/* Progress Metric */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600 dark:text-slate-400">
            {t('ऋण फर्छ्यौट प्रगति', 'Repayment Progress')}
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {fmtDigits(percentCleared)}% {t('चुक्ता भयो', 'Cleared')}
          </span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentCleared}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-1">
          <span>{t('स्वीकृत रकम:', 'Sanctioned:')} <strong className="tabular-nums text-slate-700 dark:text-slate-300">{fmtCurrency(totalSanctioned, false)}</strong></span>
          <span>{t('बाँकी साँवा:', 'Balance:')} <strong className="tabular-nums text-slate-700 dark:text-slate-300">{fmtCurrency(remaining, false)}</strong></span>
        </div>
      </div>

      {/* Immediate EMI Card */}
      <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
            <Clock className="size-4 text-amber-600" />
            <span>{t('आसन्न किस्ता भुक्तानी', 'Next Installment Due')}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold">
            {t('किस्ता #२५/३६', '#25 of 36')}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {fmtCurrency(emiAmount, false)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {t('साँवा: रु ७,१२० • ब्याज (७.०%): रु १,५२०', 'Principal: NPR 7,120 • Interest: NPR 1,520')}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenEmiModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <CreditCard className="size-3.5" />
            <span>{t('किस्ता तिर्नुहोस्', 'Pay EMI')}</span>
          </button>
        </div>
      </div>

      {/* Subsidy & Credit Score Footplate */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Award className="size-4 text-emerald-600" />
          <span className="text-slate-600 dark:text-slate-400 text-[11px]">
            {t('१.५% सरकारी ब्याज अनुदान सक्रिय', '1.5% State Interest Rebate Applied')}
          </span>
        </div>
        <Link
          to="/member/loan-portfolio-repayments"
          className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1 hover:underline"
        >
          <span>{t('तालिका', 'Schedule')}</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
