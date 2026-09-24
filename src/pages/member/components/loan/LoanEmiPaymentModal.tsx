import React, { useState } from 'react';
import { CreditCard, X, Lock } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { formatNPR } from '../../../../utils/nepaliDate';

interface LoanEmiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (amount: number, source?: string) => void;
  defaultAmount?: number;
  savingsBalance?: number;
}

export const LoanEmiPaymentModal: React.FC<LoanEmiPaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirmPayment,
  defaultAmount = 23650,
  savingsBalance = 285600,
}) => {
  const { t, fmtCurrency } = useLanguageStore();
  const [paymentAmount, setPaymentAmount] = useState(defaultAmount);
  const [paymentSource, setPaymentSource] = useState('savings');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-card max-w-md w-full rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="font-headline text-base font-bold text-on-surface">{t('ऋण किस्ता भुक्तानी', 'Pay Loan EMI')}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/15 flex justify-between items-center">
            <div>
              <div className="text-xs text-on-surface-variant font-medium">Monthly Installment (CBS Due)</div>
              <div className="text-xl font-extrabold font-tabular-mono text-primary">NPR {fmtCurrency(defaultAmount, true)}.00</div>
            </div>
            <span className="px-2.5 py-1 bg-status-success/15 text-status-success text-xs font-bold rounded-full">
              On-Time Active
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">
              {t('भुक्तानी स्रोत खाता', 'Debit Source Account')}
            </label>
            <select
              value={paymentSource}
              onChange={(e) => setPaymentSource(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface text-on-surface text-xs sm:text-sm focus:outline-none focus:border-primary"
            >
              <option value="savings">
                {t('नियमित बचत खाता - मौज्दात: रु.', 'Regular Savings - Balance: NPR')} {fmtCurrency(savingsBalance, true)}
              </option>
              <option value="wallet">eSewa / Khalti / ConnectIPS Direct</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">
              {t('भुक्तानी रकम (रु.)', 'Payment Amount (NPR)')}
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface text-on-surface font-tabular-mono font-bold text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={() => onConfirmPayment(paymentAmount, paymentSource)}
              className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              {t('पुष्टि गर्नुहोस्', 'Confirm Payment')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
