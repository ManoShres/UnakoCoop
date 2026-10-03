import React, { useState, useEffect } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Member } from '../../types';
import {
  X,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  Building,
  Printer,
} from 'lucide-react';

interface MemberDividendPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  member: Member | null;
}

export const MemberDividendPayoutModal: React.FC<MemberDividendPayoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  member,
}) => {
  const { t, fmtCurrency } = useLanguageStore();
  const { savings, sharePool, executeSingleMemberDividend } = useCoopStore();

  const [payoutMode, setPayoutMode] = useState<'ACCRUED' | 'ANNUAL'>('ACCRUED');
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [deductTax, setDeductTax] = useState<boolean>(true);
  const [destination, setDestination] = useState<'SAVINGS' | 'CASH'>('SAVINGS');
  const [selectedSavingsAcc, setSelectedSavingsAcc] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Filter savings accounts for this member
  const memberSavingsAccounts = member
    ? savings.filter((s) => s.memberId === member.id)
    : [];

  useEffect(() => {
    if (!isOpen || !member) return;

    const accrued = member.accruedDividend || 0;
    const annualEst = Math.round((member.shareCapital * (sharePool.annualDividendPercent || 14.5)) / 100);

    if (accrued > 0) {
      setPayoutMode('ACCRUED');
      setCustomAmount(accrued);
    } else {
      setPayoutMode('ANNUAL');
      setCustomAmount(annualEst);
    }

    if (memberSavingsAccounts.length > 0) {
      setSelectedSavingsAcc(memberSavingsAccounts[0].accountNo);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, member, sharePool.annualDividendPercent]);

  if (!isOpen || !member) return null;

  const gross = Number(customAmount) || 0;
  const tax = deductTax ? Math.round(gross * 0.05) : 0;
  const net = Math.max(0, gross - tax);

  const handleDisburse = () => {
    if (gross <= 0) return;
    setIsProcessing(true);

    try {
      const res = executeSingleMemberDividend({
        memberId: member.id,
        amount: gross,
        deductTax,
        destination,
        savingsAccountNo: destination === 'SAVINGS' ? selectedSavingsAcc : undefined,
      });

      onSuccess(
        t(
          `सदस्य ${member.name} लाई लाभांश रकम रु. ${res.netAmount.toLocaleString()} सफलतापूर्वक भुक्तानी गरियो (भौचर: ${res.transactionRef})!`,
          `Dividend payout of NPR ${res.netAmount.toLocaleString()} disbursed to ${member.name} (Voucher: ${res.transactionRef})!`
        )
      );
      onClose();
    } catch {
      // fallback
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-dividend-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-modal-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Coins className="size-5" />
            </span>
            <div>
              <h3 id="member-dividend-title" className="font-bold text-sm sm:text-base">
                {t('व्यक्तिगत लाभांश भुक्तानी', 'Member Dividend Payout Desk')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {member.name} ({member.memberNo})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('बन्द गर्नुहोस्', 'Close')}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Member Card Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('सेयर पुँजी', 'Share Capital')}</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {fmtCurrency(member.shareCapital, true)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('बक्यौता लाभांश', 'Accrued Dividend')}</span>
              <span className="font-mono font-black text-sm text-emerald-600">
                {fmtCurrency(member.accruedDividend || 0, true)}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('भुक्तानी हुने स्थूल रकम', 'Gross Payout Amount (NPR)')}
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              min={1}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* 5% TDS Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                {t('५% आयकर कट्टी (5% Statutory TDS)', '5% Statutory TDS')}
              </span>
              <span className="text-[10px] text-slate-400">
                {t('कर कट्टी रकम:', 'Tax deducted: ')}
                {fmtCurrency(tax, true)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDeductTax(!deductTax)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                deductTax ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {deductTax ? t('लागू', 'ON (5%)') : t('छुट', 'OFF')}
            </button>
          </div>

          {/* Net Calculation Highlight */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {t('सदस्यले पाउने खुद रकम:', 'Net Payable to Member:')}
            </span>
            <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">
              {fmtCurrency(net, true)}
            </span>
          </div>

          {/* Destination Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('भुक्तानी माध्यम', 'Disbursement Method')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDestination('SAVINGS')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  destination === 'SAVINGS'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Building className="size-4" />
                <span>{t('बचत खातामा जम्मा', 'Credit Savings Passbook')}</span>
              </button>

              <button
                type="button"
                onClick={() => setDestination('CASH')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  destination === 'CASH'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Wallet className="size-4" />
                <span>{t('काउन्टर नगद भौचर', 'Cash Desk Voucher')}</span>
              </button>
            </div>

            {destination === 'SAVINGS' && memberSavingsAccounts.length > 0 && (
              <div className="mt-2">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  {t('लक्ष्य बचत खाता रोज्नुहोस्', 'Select Target Savings Account')}
                </label>
                <select
                  value={selectedSavingsAcc}
                  onChange={(e) => setSelectedSavingsAcc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                >
                  {memberSavingsAccounts.map((acc) => (
                    <option key={acc.id} value={acc.accountNo}>
                      {acc.accountNo} - {acc.accountType} ({fmtCurrency(acc.balance, true)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100"
          >
            {t('रद्द गर्नुहोस्', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleDisburse}
            disabled={gross <= 0 || isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <CheckCircle2 className="size-4" />
            <span>
              {isProcessing
                ? t('भुक्तानी हुँदैछ...', 'Processing...')
                : t('लाभांश भुक्तानी गर्नुहोस्', 'Disburse Dividend')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
