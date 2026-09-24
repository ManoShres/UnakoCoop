import React, { useState } from 'react';
import { X, CheckCircle2, ArrowDownToLine, Smartphone, Landmark, ShieldCheck } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { useCoopStore } from '../../../../store/useCoopStore';

interface MemberDepositModalProps {
  onClose: () => void;
  primaryAccountNo: string;
  onSuccess: (amount: number, gateway: string) => void;
}

export function MemberDepositModal({ onClose, primaryAccountNo, onSuccess }: MemberDepositModalProps) {
  const { t, fmtCurrency } = useLanguageStore();
  const { adjustSavingsBalance } = useCoopStore();
  const [selectedGateway, setSelectedGateway] = useState<'esewa' | 'khalti' | 'connectips' | 'counter'>('esewa');
  const [amount, setAmount] = useState<number>(5000);
  const [submitting, setSubmitting] = useState(false);

  const gateways = [
    { id: 'esewa', name: 'eSewa Mobile Wallet', fee: t('शून्य शुल्क (Free)', 'Zero Fee'), icon: Smartphone, color: 'text-emerald-500' },
    { id: 'khalti', name: 'Khalti Digital Wallet', fee: t('शून्य शुल्क (Free)', 'Zero Fee'), icon: Smartphone, color: 'text-purple-500' },
    { id: 'connectips', name: 'NCHL / ConnectIPS', fee: t('रु. २-८ प्रति कारोबार', 'NPR 2-8 fee'), icon: Landmark, color: 'text-blue-500' },
    { id: 'counter', name: 'Service Counter Slip', fee: t('काउन्टर नगद दाखिला', 'Counter Cash Deposit'), icon: Landmark, color: 'text-amber-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setSubmitting(true);

    setTimeout(() => {
      adjustSavingsBalance(
        primaryAccountNo,
        amount,
        'DEPOSIT',
        `Digital Deposit via ${selectedGateway.toUpperCase()}`
      );
      setSubmitting(false);
      onSuccess(amount, selectedGateway.toUpperCase());
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
            <ArrowDownToLine className="size-5 text-emerald-400" />
            <div>
              <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                {t('अनलाइन रकम दाखिला', 'ONLINE SAVINGS TOP-UP')}
              </div>
              <h3 className="font-bold text-sm">
                {t('बचत खातामा रकम जम्मा गर्नुहोस्', 'Deposit to Savings Account')}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('भुक्तानी माध्यम छनौट गर्नुहोस् (Select Gateway)', 'Select Payment Gateway')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {gateways.map((gw) => {
                const Icon = gw.icon;
                return (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => setSelectedGateway(gw.id as 'esewa' | 'khalti' | 'connectips' | 'counter')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      selectedGateway === gw.id
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <Icon className={`size-4 ${gw.color}`} />
                      {selectedGateway === gw.id && <CheckCircle2 className="size-3.5 text-emerald-600" />}
                    </div>
                    <div className="text-xs font-bold truncate">{gw.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{gw.fee}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('जम्मा गर्ने रकम (रु.) *', 'Deposit Amount (NPR) *')}
            </label>
            <input
              type="number"
              step={100}
              min={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold"
              required
            />
            {/* Quick Chips */}
            <div className="flex gap-2 mt-2">
              {[1000, 2000, 5000, 10000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                    amount === val
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>{t('दाखिला हुने खाता:', 'Target Account:')}</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{primaryAccountNo}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>{t('सेवा शुल्क:', 'Service Fee:')}</span>
              <span className="font-bold text-emerald-600">रु. ०.०० (Free)</span>
            </div>
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
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition"
            >
              {submitting ? t('प्रक्रियामा...', 'Processing...') : t('जम्मा सुनिश्चित गर्नुहोस्', 'Proceed to Deposit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
