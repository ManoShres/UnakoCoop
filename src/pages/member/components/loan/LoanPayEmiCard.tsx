import React, { useState } from 'react';
import {
  Clock,
  Wallet,
  Building2,
  CheckCircle2,
  Lock,
  FileText,
  Download,
  CreditCard,
  Zap,
} from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { Loan } from '../../../../types';
import { printElement } from '../../../../utils/printHelper';

interface LoanPayEmiCardProps {
  onOpenEmiModal: () => void;
  activeLoan?: Loan;
  savingsBalance?: number;
}

export const LoanPayEmiCard: React.FC<LoanPayEmiCardProps> = ({
  onOpenEmiModal,
  activeLoan,
  savingsBalance = 285600,
}) => {
  const { t, fmtCurrency } = useLanguageStore();
  const [source, setSource] = useState<'savings' | 'esewa' | 'connectips'>('savings');

  const monthlyEmi = activeLoan?.monthlyEmi ?? 23650;
  // Estimate principal and interest components
  const interestComponent = Math.round(monthlyEmi * 0.18);
  const principalComponent = monthlyEmi - interestComponent;
  const nextDueDate = activeLoan?.nextDueDate || 'Chaitra 15, 2081';

  return (
    <div className="lg:col-span-5 flex flex-col gap-space-md">
      <div className="bg-surface-dark text-on-primary rounded-2xl p-6 shadow-xl relative overflow-hidden border border-outline-variant/20">
        {/* Subtle Glow */}
        <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent-lime animate-ping"></span>
            <span className="font-label-sm text-xs uppercase tracking-wider text-brand-accent-lime font-bold">
              {t('तत्काल बुझाउनुपर्ने', 'Immediate Due')}
            </span>
          </div>
          <span className="font-tabular-mono text-xs bg-surface-dark-card px-3 py-1 rounded-full text-white/80 font-bold border border-white/10">
            {activeLoan?.loanNo || 'LN-2025-0429'}
          </span>
        </div>

        {/* Due Amount Display */}
        <div className="bg-surface-dark-card/90 rounded-xl p-4 my-4 backdrop-blur border border-white/10">
          <div className="flex items-baseline justify-between">
            <span className="font-label-sm text-xs text-white/70">
              {t('बुझाउनुपर्ने किस्ता रकम', 'Installment Amount Due')}
            </span>
            <span className="font-label-sm text-xs text-brand-accent-lime font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {t('शून्य विलम्ब शुल्क', 'Zero Delay Fine')}
            </span>
          </div>
          <div className="font-display-stat text-3xl font-extrabold text-white my-1 tracking-tight">
            {fmtCurrency(monthlyEmi, true)}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-white/70">
            <div className="flex justify-between bg-surface-dark/60 px-3 py-2 rounded-lg border border-white/5">
              <span>{t('साँवा:', 'Principal:')}</span>
              <span className="text-white font-tabular-mono font-bold">
                {fmtCurrency(principalComponent, true)}
              </span>
            </div>
            <div className="flex justify-between bg-surface-dark/60 px-3 py-2 rounded-lg border border-white/5">
              <span>{t('ब्याज:', 'Interest:')}</span>
              <span className="text-white font-tabular-mono font-bold">
                {fmtCurrency(interestComponent, true)}
              </span>
            </div>
          </div>
        </div>

        {/* Due Date Notification */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-dark-card/60 mb-4 text-xs text-white/80 border border-white/10">
          <Clock className="w-4 h-4 text-brand-accent-lime shrink-0" />
          <span>
            {t('म्याद: ', 'Due on ')}
            <strong className="text-white">{nextDueDate}</strong> • {t('समयमै भुक्तानी गर्नुहोस्', 'Pay on time for subsidy')}
          </span>
        </div>

        {/* Payment Mode Selection */}
        <div className="mb-4">
          <label className="block font-label-sm text-xs text-white/70 uppercase tracking-wider mb-2 font-bold">
            {t('भुक्तानी माध्यम छान्नुहोस्', 'Select Payment Source')}
          </label>
          <div className="space-y-2" id="payment-source-selector">
            {/* Regular Savings Option */}
            <label
              onClick={() => setSource('savings')}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                source === 'savings'
                  ? 'bg-surface-dark-card border-brand-accent-lime/60 shadow-sm'
                  : 'bg-surface-dark-card/50 border-white/10 hover:bg-surface-dark-card/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  checked={source === 'savings'}
                  onChange={() => setSource('savings')}
                  className="accent-brand-accent-lime w-4 h-4 cursor-pointer"
                  name="payment_source"
                  type="radio"
                  value="savings"
                />
                <div>
                  <p className="font-label-md text-xs sm:text-sm text-white font-bold">
                    {t('नियमित बचत', 'Regular Savings')} (CBS Passbook)
                  </p>
                  <p className="font-tabular-mono text-xs text-brand-accent-lime font-bold">
                    Available: {fmtCurrency(savingsBalance, true)}
                  </p>
                </div>
              </div>
              <span className="font-label-sm text-[11px] bg-primary/40 text-brand-accent-lime px-2 py-0.5 rounded-full font-bold">
                Instant
              </span>
            </label>

            {/* eSewa Digital Wallets */}
            <label
              onClick={() => setSource('esewa')}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                source === 'esewa'
                  ? 'bg-surface-dark-card border-brand-accent-lime/60 shadow-sm'
                  : 'bg-surface-dark-card/50 border-white/10 hover:bg-surface-dark-card/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  checked={source === 'esewa'}
                  onChange={() => setSource('esewa')}
                  className="accent-brand-accent-lime w-4 h-4 cursor-pointer"
                  name="payment_source"
                  type="radio"
                  value="esewa"
                />
                <div>
                  <p className="font-label-md text-xs sm:text-sm text-white font-bold">eSewa Mobile Wallet</p>
                  <p className="font-label-sm text-xs text-white/60">Direct wallet checkout</p>
                </div>
              </div>
              <Wallet className="w-4 h-4 text-white/60" />
            </label>

            {/* ConnectIPS Interbank Option */}
            <label
              onClick={() => setSource('connectips')}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                source === 'connectips'
                  ? 'bg-surface-dark-card border-brand-accent-lime/60 shadow-sm'
                  : 'bg-surface-dark-card/50 border-white/10 hover:bg-surface-dark-card/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  checked={source === 'connectips'}
                  onChange={() => setSource('connectips')}
                  className="accent-brand-accent-lime w-4 h-4 cursor-pointer"
                  name="payment_source"
                  type="radio"
                  value="connectips"
                />
                <div>
                  <p className="font-label-md text-xs sm:text-sm text-white font-bold">NCHL / ConnectIPS</p>
                  <p className="font-label-sm text-xs text-white/60">Direct bank account debit</p>
                </div>
              </div>
              <Building2 className="w-4 h-4 text-white/60" />
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenEmiModal}
          className="w-full bg-brand-accent-lime hover:bg-brand-accent-lime/90 text-surface-dark font-label-md text-xs sm:text-sm font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          id="pay-emi-button"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {t(
              `${fmtCurrency(monthlyEmi, true)} अहिले भुक्तानी गर्नुहोस्`,
              `Pay ${fmtCurrency(monthlyEmi, true)} Now`
            )}
          </span>
        </button>

        <p className="font-label-sm text-xs text-center text-white/60 mt-3 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-brand-accent-lime" />
          {t('इन्क्रिप्टेड सहकारी खाता राफसाफ • शून्य सेवा शुल्क', 'Encrypted cooperative ledger settlement • Zero transaction fee')}
        </p>
      </div>

      {/* Quick Summary Mini-card */}
      <div className="bg-surface-card rounded-2xl p-4 shadow-sm flex items-center justify-between border border-outline-variant/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="font-label-md text-xs sm:text-sm text-on-surface font-bold">
              {t('पछिल्लो विवरण', 'Latest Statement')}
            </p>
            <p className="font-label-sm text-xs text-on-surface-variant">
              Monthly Credit Advice (CBS Certified)
            </p>
          </div>
        </div>
        <button
          onClick={() => printElement('schedule')}
          className="text-primary hover:text-primary/80 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all flex items-center gap-1.5 font-label-sm text-xs font-bold cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          PDF / Print
        </button>
      </div>
    </div>
  );
};
