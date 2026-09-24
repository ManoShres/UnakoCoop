import React from 'react';
import { Building2, TrendingUp, ShieldCheck, Vote, HeartHandshake } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface SharesEquityHeroProps {
  totalEquityAndDeposits?: number;
}

export function SharesEquityHero({ totalEquityAndDeposits = 250000 }: SharesEquityHeroProps) {
  const { t, fmtCurrency } = useLanguageStore();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface-dark text-on-primary-container p-6 sm:p-8 shadow-xl border border-outline-variant/20">
      <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-dark-card text-brand-accent-lime font-label-sm text-xs mb-3 border border-white/10">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-accent-lime animate-pulse"></span>
            <span>{t('सहकारी पुँजी तथा मुद्दती लगानी', 'Cooperative Equity & Term Deposits')}</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl text-surface-canvas mb-2 font-bold tracking-tight">
            {t('सदस्य शेयर पूँजी तथा मुद्दती निक्षेप पोर्टफोलियो', 'Member Wealth & Term Holdings')}
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed">
            {t(
              'सहकारी शेयर पूँजी स्वामित्व, प्रमाणित लाभांश र ११.०% सम्म प्रतिफल दिने मुद्दती निक्षेप पोर्टफोलियो व्यवस्थापन।',
              'Track cooperative equity ownership, certified share dividends, and high-yield Mudhati (Fixed Deposit) portfolios yielding up to 11.0% per annum under Unako SACCOS regulatory security.'
            )}
          </p>
        </div>
        {/* Quick Total Value Display */}
        <div className="flex items-center gap-4 bg-surface-dark-card p-5 rounded-2xl border border-white/10 shrink-0">
          <div className="p-3 bg-primary/20 rounded-xl text-brand-accent-lime shadow-xs">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <span className="font-label-sm text-xs text-white/60 block uppercase tracking-wider font-semibold">
              {t('कुल शेयर तथा मुद्दती बचत', 'Total Equity & Deposits')}
            </span>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="font-label-md text-xs text-brand-accent-lime font-bold">NPR</span>
              <span className="font-headline text-2xl font-extrabold text-white tracking-tight">
                {fmtCurrency(totalEquityAndDeposits, true)}
              </span>
            </div>
            <span className="font-label-sm text-xs text-white/60 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-status-success" />
              {t('+१२.०% प्रक्षेपित लाभांश', '+12.0% Projected AGM Yield')}
            </span>
          </div>
        </div>
      </div>
      {/* Cooperative Ownership Perks Strip */}
      <div className="mt-6 pt-4 flex flex-wrap items-center gap-y-3 gap-x-8 text-white/70 text-xs font-body-sm bg-surface-dark/40 rounded-xl px-4 py-3 border border-white/5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-accent-lime shrink-0" />
          <span>{t('तत्काल कर्जा सुविधा: मुद्दती प्रमाणपत्रको ९०% सम्म', 'Instant Loan Margin: Up to 90% against FD certificate')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Vote className="w-4 h-4 text-brand-accent-lime shrink-0" />
          <span>{t('प्रजातान्त्रिक स्वामित्व: १ सदस्य = १ मत', 'Democratic Ownership: 1 Member = 1 Sovereign Vote')}</span>
        </div>
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-brand-accent-lime shrink-0" />
          <span>{t('सदस्य कल्याण तथा स्वास्थ्य सुरक्षा योजना समावेश', 'Automatic Member Welfare & Healthcare Suraksha Coverage')}</span>
        </div>
      </div>
    </div>
  );
}
