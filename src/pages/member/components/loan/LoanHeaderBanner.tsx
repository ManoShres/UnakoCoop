import React from 'react';
import { ShieldCheck, Calendar, PlusCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { Loan } from '../../../../types';

interface LoanHeaderBannerProps {
  onOpenApplyModal: () => void;
  activeLoan?: Loan;
}

export const LoanHeaderBanner: React.FC<LoanHeaderBannerProps> = ({
  onOpenApplyModal,
  activeLoan,
}) => {
  const { t } = useLanguageStore();

  const loanNo = activeLoan?.loanNo || 'LN-2025-0429';
  const loanType = activeLoan?.loanType || 'Small Business Enterprise & Dairy';
  const nextDue = activeLoan?.nextDueDate || 'Chaitra 15, 2081';

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md bg-surface-card p-6 rounded-2xl border border-outline-variant/15 shadow-sm">
      <div>
        <div className="flex items-center gap-space-xs mb-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
            {t('सक्रिय ऋण खाता', 'Active Loan Account')}
          </span>
          <span className="text-on-surface-variant font-label-sm text-xs">•</span>
          <span className="font-tabular-mono text-xs text-on-surface-variant font-bold bg-surface-container-low px-2 py-0.5 rounded">
            {loanNo}
          </span>
        </div>
        <h1 className="font-headline text-headline-sm md:text-headline-md font-bold text-on-surface tracking-tight">
          {t('कर्जा तथा पुनर्भुक्तानी पोर्टफोलियो', 'Loan & Repayment Portfolio')}
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
          {loanType} • Unako SACCOS Core CBS Credit Ledger
        </p>
      </div>

      {/* Quick Stats Pill Strip */}
      <div className="flex items-center flex-wrap gap-3">
        <div className="bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-status-success/10 flex items-center justify-center text-status-success shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-label-sm text-[11px] text-on-surface-variant uppercase font-semibold">
              {t('ब्याज छुट सुविधा', 'Rebate Eligibility')}
            </div>
            <div className="text-xs sm:text-sm font-bold text-status-success">
              {t('१.५% ब्याज अनुदान', '1.5% Subsidized')}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-xs">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="font-label-sm text-[11px] text-on-surface-variant uppercase font-semibold">
              {t('अर्को किस्ता मिति', 'Next Due Date')}
            </div>
            <div className="text-xs sm:text-sm font-bold text-on-surface">{nextDue}</div>
          </div>
        </div>

        <button
          onClick={onOpenApplyModal}
          className="bg-primary hover:bg-primary/90 text-on-primary px-4 py-2.5 rounded-xl font-label-md text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('थप ऋण आवेदन', 'Apply Top-up')}</span>
        </button>
      </div>
    </div>
  );
};
