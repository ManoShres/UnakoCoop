import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, QrCode } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { useCoopStore } from '../../../../store/useCoopStore';
import { NepalDynamicQrModal } from '../../../../components/common/NepalDynamicQrModal';

interface MemberEmiPaymentModalProps {
  onClose: () => void;
  loanNo: string;
  emiAmount: number;
  availableSavings: number;
  onSuccess: (amount: number) => void;
}

export function MemberEmiPaymentModal({
  onClose,
  loanNo,
  emiAmount,
  availableSavings,
  onSuccess,
}: MemberEmiPaymentModalProps) {
  const { t, fmtCurrency } = useLanguageStore();
  const { recordLoanRepayment } = useCoopStore();
  const [pin, setPin] = useState(['', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const hasSufficientBalance = availableSavings >= emiAmount;

  const handlePinChange = (idx: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const next = [...pin];
    next[idx] = val;
    setPin(next);

    // auto advance focus
    if (val && idx < 3) {
      const nextInput = document.getElementById(`pin-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      const prevInput = document.getElementById(`pin-${idx - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSufficientBalance) {
      setError(t('साधारण बचत खातामा पर्याप्त मौज्दात छैन।', 'Insufficient balance in Regular Savings account.'));
      return;
    }
    const enteredPin = pin.join('');
    if (enteredPin.length < 4) {
      setError(t('कृपया ४ अंकको सुरक्षा पिन प्रविष्टि गर्नुहोस्।', 'Please enter your 4-digit security MPIN.'));
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      recordLoanRepayment(loanNo, emiAmount, 'Online Member Dashboard Settlement');
      setSubmitting(false);
      onSuccess(emiAmount);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 text-amber-400" />
            <div>
              <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                {t('ऋण किस्ता फर्छ्यौट', 'LOAN EMI CLEARING')}
              </div>
              <h3 className="font-bold text-sm">
                {t('किस्ता भुक्तानी प्रमाणीकरण', 'Authenticate EMI Settlement')}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-center">
            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              {t('भुक्तानी हुने किस्ता रकम', 'EMI Installment Amount')}
            </div>
            <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-1">
              रु. {fmtCurrency(emiAmount, false)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              {loanNo} • {t('किस्ता #२५/३६', 'Installment #25/36')}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">{t('कट्टा हुने खाता (Source):', 'Source Account:')}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {t('नियमित बचत खाता (०१)', 'Regular Savings (01)')}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 font-mono">
              <span className="text-slate-500 font-sans">{t('खातामा उपलब्ध मौज्दात:', 'Available Balance:')}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                रु. {fmtCurrency(availableSavings, false)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">{t('फर्छ्यौट शुल्क (Fee):', 'Settlement Fee:')}</span>
              <span className="font-bold text-emerald-600">रु. ०.०० (Free)</span>
            </div>
          </div>

          {!hasSufficientBalance ? (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-rose-600">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{t('साधारण बचतमा रकम अपुग छ।', 'Insufficient balance in Regular Savings.')}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="w-full sm:w-auto px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <QrCode className="size-3.5" />
                <span>{t('क्युआरबाट सिधै तिर्नुहोस्', 'Pay via NepalQR')}</span>
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <QrCode className="size-3.5" />
                <span>{t('वा नेपालपे / फोनपे क्युआरबाट तिर्नुहोस्', 'Or pay directly via NepalPay QR')}</span>
              </button>
            </div>
          )}

          <div>
            <label className="block text-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('सुरक्षा पिन (४-अंकको MPIN) प्रविष्टि गर्नुहोस्', 'Enter 4-Digit Security MPIN')}
            </label>
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`pin-${idx}`}
                  type="password"
                  maxLength={1}
                  value={pin[idx]}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="size-12 rounded-xl text-center font-mono font-bold text-xl border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 bg-white dark:bg-slate-800 outline-none transition"
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="text-center text-xs text-rose-600 font-semibold">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting || !hasSufficientBalance}
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition"
            >
              {submitting ? t('प्रक्रियामा...', 'Processing...') : t('किस्ता चुक्ता गर्नुहोस्', `Authorize NPR ${emiAmount.toLocaleString()}`)}
            </button>
          </div>
        </form>
      </div>

      <NepalDynamicQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="NepalPay / Fonepay Loan EMI QR"
        titleNepali="नेपालपे / फोनपे कर्जा किस्ता क्युआर"
        accountNo={loanNo}
        amount={emiAmount}
        remarks={`Loan EMI - ${loanNo}`}
        onPaymentSuccess={(ref, paidAmount) => {
          recordLoanRepayment(
            loanNo,
            paidAmount,
            `Direct Loan EMI via NepalPay QR (${ref})`
          );
          setShowQrModal(false);
          onSuccess(paidAmount);
          onClose();
        }}
      />
    </div>
  );
}
