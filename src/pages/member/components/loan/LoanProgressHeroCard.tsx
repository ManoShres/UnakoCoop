import React from 'react';
import { Percent, ArrowDown, ShieldCheck } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { Loan } from '../../../../types';

interface LoanProgressHeroCardProps {
  activeLoan?: Loan;
}

export const LoanProgressHeroCard: React.FC<LoanProgressHeroCardProps> = ({ activeLoan }) => {
  const { t, fmtCurrency } = useLanguageStore();

  const sanctioned = activeLoan?.principalAmount ?? 500000;
  const remaining = activeLoan?.remainingBalance ?? 320000;
  const paid = Math.max(0, sanctioned - remaining);
  const clearedRatio = sanctioned > 0 ? paid / sanctioned : 0;
  const clearedPercent = (clearedRatio * 100).toFixed(1);
  const remainingPercent = (100 - parseFloat(clearedPercent)).toFixed(1);

  // SVG ring circumference for r=50 is 2 * PI * 50 ≈ 314.159
  const circumference = 314.159;
  const strokeOffset = circumference - (circumference * Math.min(1, Math.max(0, clearedRatio)));

  const tenure = activeLoan?.tenureMonths ?? 24;
  const paidTenure = Math.round(tenure * clearedRatio);
  const remainingTenure = Math.max(0, tenure - paidTenure);
  const rate = activeLoan?.interestRate ?? 12.5;
  const title = activeLoan?.loanType || 'Small Business Enterprise';
  const collateralDesc = activeLoan?.collateralDescription || 'Commercial inventory pledge + personal guarantees';

  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-sm relative overflow-hidden border border-outline-variant/15">
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/10">
        <div>
          <span className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
            {t('स्वीकृत सुविधा विवरण', 'Approved Facility Details')}
          </span>
          <h2 className="font-headline text-lg sm:text-xl font-bold text-on-surface mt-0.5">
            {title}
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant">
            {activeLoan?.disbursedDate ? `Disbursed: ${activeLoan.disbursedDate}` : 'Active CBS Loan'} • Tenor: {tenure} Months Diminishing
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container text-primary font-label-sm text-xs rounded-full font-bold">
          <Percent className="w-3.5 h-3.5" />
          {rate.toFixed(2)}% p.a. (Diminishing)
        </span>
      </div>

      {/* Progress Ring & Numbers Mosaic */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-4">
        {/* SVG Progress Ring Gauge */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-xl relative border border-outline-variant/15">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                className="text-outline-variant/20"
                cx="60"
                cy="60"
                fill="transparent"
                r="50"
                stroke="currentColor"
                strokeWidth="10"
              />
              <circle
                className="text-primary transition-all duration-1000 ease-out"
                cx="60"
                cy="60"
                fill="transparent"
                r="50"
                stroke="currentColor"
                strokeDasharray="314.159"
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                strokeWidth="10"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-display-stat text-2xl text-on-surface font-extrabold leading-none">
                {clearedPercent}<span className="text-primary font-headline text-sm">%</span>
              </span>
              <span className="font-label-sm text-[11px] text-on-surface-variant mt-1 font-semibold">
                {t('चुक्ता भयो', 'Cleared')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 font-label-sm text-xs text-on-surface font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> {paidTenure} {t('तिरियो', 'Paid')}
            <span className="text-on-surface-variant">•</span>
            <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span> {remainingTenure} {t('बाँकी', 'Left')}
          </div>
        </div>

        {/* Financial Aggregates */}
        <div className="sm:col-span-7 flex flex-col justify-between gap-3 h-full">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15">
            <div className="flex justify-between items-center mb-1">
              <span className="font-label-sm text-xs text-on-surface-variant font-semibold">
                {t('बाँकी साँवा रकम', 'Remaining Balance')}
              </span>
              <span className="font-label-sm text-xs font-bold text-primary">
                {remainingPercent}% Left
              </span>
            </div>
            <div className="font-display-stat text-2xl text-on-surface font-bold tracking-tight">
              {fmtCurrency(remaining, true)}
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-primary h-full rounded-full transition-all duration-700"
                style={{ width: `${clearedPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/15">
              <span className="font-label-sm text-[11px] text-on-surface-variant font-semibold block">
                {t('स्वीकृत साँवा', 'Sanctioned')}
              </span>
              <p className="text-xs sm:text-sm font-bold font-tabular-mono text-on-surface whitespace-nowrap mt-0.5">
                {fmtCurrency(sanctioned, true)}
              </p>
              <span className="font-label-sm text-[10px] text-on-surface-variant">
                {t('प्रारम्भिक साँवा', 'Initial Principal')}
              </span>
            </div>
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/15">
              <span className="font-label-sm text-[11px] text-status-success font-semibold block">
                {t('कुल भुक्तानी', 'Total Paid')}
              </span>
              <p className="text-xs sm:text-sm font-bold font-tabular-mono text-status-success whitespace-nowrap mt-0.5">
                {fmtCurrency(paid, true)}
              </p>
              <span className="font-label-sm text-[10px] text-on-surface-variant">
                {paidTenure} {t('किस्ताहरू', 'Installments')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Collateral & Project Micro Bar */}
      <div className="mt-4 pt-3 border-t border-outline-variant/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-label-md text-xs text-on-surface font-bold">
              {t('धितो सम्झौता', 'Collateral Agreement')}: {collateralDesc}
            </p>
            <p className="font-label-sm text-[11px] text-on-surface-variant">
              Field Inspection: Verified by Credit Officer • Active Pledged Status
            </p>
          </div>
        </div>
        <a
          className="text-primary hover:text-primary/80 font-label-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          href="#schedule"
        >
          {t('किस्ता तालिका हेर्नुहोस्', 'Schedule Details')}
          <ArrowDown className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
