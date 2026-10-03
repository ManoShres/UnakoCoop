import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react';
import { SavingsAccount, Member } from '../../../../types';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface SavingsAdjustModalProps {
  account: SavingsAccount;
  members: Member[];
  onClose: () => void;
  onSubmit: (adjustAmount: number, adjustType: 'DEPOSIT' | 'WITHDRAWAL', voucherNo: string, reasonCategory: string, note: string) => void;
}

export function SavingsAdjustModal({ account, members, onClose, onSubmit }: SavingsAdjustModalProps) {
  const { t, fmtCurrency } = useLanguageStore();
  const [adjustType, setAdjustType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [adjustAmount, setAdjustAmount] = useState<number>(5000);
  const [adjustNote, setAdjustNote] = useState('');
  const [voucherNo, setVoucherNo] = useState('JV-2081-' + Math.floor(1000 + Math.random() * 9000));
  const [adjustReasonCategory, setAdjustReasonCategory] = useState('CASH_COUNTER_RECON');

  const newBalance =
    adjustType === 'DEPOSIT'
      ? account.balance + adjustAmount
      : account.balance - adjustAmount;
  const isNegative = newBalance < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustAmount <= 0) return;
    onSubmit(adjustAmount, adjustType, voucherNo, adjustReasonCategory, adjustNote);
  };

  const owner = members.find((m) => m.id === account.memberId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
              {t('सीबीएस लेजर अडिट समायोजन', 'CBS LEDGER AUDIT ADJUSTMENT')}
            </div>
            <h3 className="font-bold text-sm">
              {t('खाता रकम समायोजन', 'Adjust Account')}: {account.accountNo}
              {owner ? (
                <span className="font-normal text-xs text-slate-300 ml-2">
                  ({t(owner.nameNepali || owner.name, owner.name)})
                </span>
              ) : null}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* LIVE MATH EQUATION WIDGET */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('मौज्दात हिसाब मिलान', 'Live Balance Reconciliation Equation')}
            </div>
            <div className="flex items-center justify-between gap-1 text-center font-mono">
              <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">{t('हालको मौज्दात', 'Initial')}</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate tabular-nums">
                  {fmtCurrency(account.balance, true)}
                </div>
              </div>

              <div className="text-base font-black px-1 text-slate-400">
                {adjustType === 'DEPOSIT' ? '+' : '−'}
              </div>

              <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">{t('समायोजन रकम', 'Adjust')}</div>
                <div
                  className={`text-xs font-bold truncate tabular-nums ${
                    adjustType === 'DEPOSIT' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {fmtCurrency(adjustAmount, true)}
                </div>
              </div>

              <div className="text-base font-black px-1 text-slate-400">=</div>

              <div
                className={`flex-1 p-2 rounded-lg border ${
                  isNegative
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400'
                }`}
              >
                <div className="text-[10px] text-slate-500">{t('अन्तिम मौज्दात', 'Result')}</div>
                <div
                  className={`text-xs font-black truncate tabular-nums ${
                    isNegative ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {fmtCurrency(newBalance, true)}
                </div>
              </div>
            </div>

            {isNegative && (
              <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 pt-1">
                <AlertCircle className="size-4 shrink-0" />
                <span>{t('चेतावनी: खातामा मौज्दात ऋणात्मक हुँदैछ!', 'Warning: Resulting balance will be negative!')}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('समायोजन दिशा', 'Action Type')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('DEPOSIT')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  adjustType === 'DEPOSIT'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                <ArrowDownLeft className="size-4" />
                <span>{t('जम्मा / क्रेडिट', 'Credit / Deposit')}</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('WITHDRAWAL')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  adjustType === 'WITHDRAWAL'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                <ArrowUpRight className="size-4" />
                <span>{t('भुक्तानी / डेबिट', 'Debit / Withdrawal')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('समायोजन रकम (रु.) *', 'Amount (NPR) *')}
              </label>
              <input
                type="number"
                value={adjustAmount}
                step={100}
                onChange={(e) => setAdjustAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                min={1}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('भौचर नम्बर *', 'Journal Voucher No. *')}
              </label>
              <input
                type="text"
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('समायोजनको कारण वर्ग *', 'Reason Category *')}
            </label>
            <select
              value={adjustReasonCategory}
              onChange={(e) => setAdjustReasonCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
            >
              <option value="CASH_COUNTER_RECON">{t('काउन्टर नगद मिलान', 'Counter Cash Reconciliation')}</option>
              <option value="DIVIDEND_CREDIT">{t('वार्षिक लाभांश समायोजन', 'Dividend Distribution')}</option>
              <option value="LOAN_OFFSET">{t('ऋण किस्ता कट्टा', 'Loan Repayment Offset')}</option>
              <option value="ERROR_CORRECTION">{t('सीबीएस भुल सुधार प्रविष्टि', 'Ledger Error Correction')}</option>
              <option value="FEE_REVERSAL">{t('शुल्क फिर्ता / छुट', 'Fee Reversal')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('विस्तृत अडिट कैफियत / टिप्पणी *', 'Detailed Audit Note *')}
            </label>
            <input
              type="text"
              placeholder={t('जस्तै: काउन्टर भौचर नं. ४४२ अनुसार नगद मिलान', 'e.g. Counter deposit mismatch correction as per slip #442')}
              value={adjustNote}
              onChange={(e) => setAdjustNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              required
            />
          </div>

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
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
            >
              {t('समायोजन प्रविष्टि गर्नुहोस्', 'Post Adjustment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
