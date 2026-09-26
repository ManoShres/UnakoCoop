import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Landmark,
  ArrowRight,
  Download,
  Printer,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import { generateNepalQrPayload } from '../../utils/nepalQr';
import { printElement } from '../../utils/printHelper';

export interface NepalDynamicQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  titleNepali?: string;
  accountNo: string;
  memberName?: string;
  amount: number;
  remarks?: string;
  onPaymentSuccess?: (referenceNo: string, amount: number) => void;
}

export const NepalDynamicQrModal: React.FC<NepalDynamicQrModalProps> = ({
  isOpen,
  onClose,
  title = 'NepalPay / Fonepay Dynamic QR',
  titleNepali = 'नेपालपे / फोनपे क्युआर भुक्तानी',
  accountNo,
  memberName = 'Unako Shareholder Member',
  amount,
  remarks = 'Digital Deposit',
  onPaymentSuccess,
}) => {
  const { t } = useLanguageStore();
  const { coopSettings } = useCoopStore();

  const [copied, setCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 minutes validity
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Generate unique transaction reference for this session
  const referenceNo = useMemo(() => {
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    return `NPQR-${new Date().getFullYear()}-${randomHex}`;
  }, [isOpen, accountNo, amount]);

  // Generate EMVCo NepalQR compliant payload string
  const qrPayload = useMemo(() => {
    return generateNepalQrPayload({
      merchantName: coopSettings?.name || 'UNAKO SACCOS LTD',
      merchantCity: 'GADHWA',
      pan: coopSettings?.panNo || '300124890',
      amount: amount,
      accountNo: accountNo,
      referenceNo: referenceNo,
      remarks: remarks,
    });
  }, [coopSettings, amount, accountNo, referenceNo, remarks]);

  // Dynamic QR Code image URL
  const qrImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=4&data=${encodeURIComponent(
      qrPayload
    )}`;
  }, [qrPayload]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isCompleted) return;
    setSecondsRemaining(300);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isCompleted]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const handleCopyReference = () => {
    navigator.clipboard.writeText(referenceNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      if (onPaymentSuccess) {
        onPaymentSuccess(referenceNo, amount);
      }
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <QrCode className="size-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-blue-200 font-bold">
                {t('राष्ट्रिय भुक्तानी प्रणाली (NPS NepalQR)', 'NATIONAL PAYMENT SWITCH (NEPALQR)')}
              </div>
              <h3 className="font-black text-sm text-white">
                {t(titleNepali, title)}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {!isCompleted ? (
            <div className="flex flex-col items-center">
              {/* QR Container (Printable) */}
              <div
                id="nepal-qr-slip"
                data-printable
                className="w-full flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-inner"
              >
                {/* Cooperative Badge */}
                <div className="text-center mb-3">
                  <div className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                    {coopSettings?.nameNepali || 'उनको बचत तथा ऋण सहकारी संस्था लि.'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {coopSettings?.addressNepali || 'गढवा-५, चैनपुर, दाङ'} • Merchant ID: {coopSettings?.panNo || '300124890'}
                  </div>
                </div>

                {/* QR Code Frame */}
                <div className="relative p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-md">
                  <img
                    src={qrImageUrl}
                    alt="NepalQR Code"
                    className="size-48 sm:size-52 object-contain"
                  />
                  {/* Center Merchant Logo Shield */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="size-10 bg-white rounded-full p-1 shadow-md border border-slate-200 flex items-center justify-center">
                      <div className="size-8 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center">
                        UKO
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Banner */}
                <div className="mt-3.5 text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('भुक्तानी रकम (Payable Amount)', 'Payable Amount')}
                  </div>
                  <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    रु. {amount.toLocaleString('ne-NP', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Account & Metadata */}
                <div className="w-full mt-3 pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>खाता नं (Account):</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">{accountNo}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>सदस्य (Member):</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200 truncate max-w-[180px]">
                      {memberName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>सन्दर्भ नं (Ref):</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">{referenceNo}</span>
                  </div>
                </div>
              </div>

              {/* Supported Wallets / Rails Bar */}
              <div className="w-full mt-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                <span className="text-emerald-600">● Fonepay</span>
                <span className="text-purple-600">● eSewa</span>
                <span className="text-violet-600">● Khalti</span>
                <span className="text-blue-600">● ConnectIPS</span>
                <span className="text-amber-600">● Mobile Banking</span>
              </div>

              {/* Countdown & Reference Copy */}
              <div className="w-full flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono">
                  <Clock className="size-3.5 text-amber-500 animate-pulse" />
                  <span>
                    {t('म्याद:', 'Expires in:')} <strong className="text-slate-800 dark:text-slate-200">{timeFormatted}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      <span>{t('कपि भयो', 'Copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>{t('सन्दर्भ कपि', 'Copy Ref')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="w-full mt-5 space-y-2">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isProcessing || secondsRemaining === 0}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="size-4" />
                      <span>
                        {t('भुक्तानी पुष्टि गर्नुहोस् (Simulate Payment)', 'Confirm & Record Deposit')}
                      </span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
                  <button
                    type="button"
                    onClick={() => printElement('nepal-qr-slip', { format: 'thermal-80mm', title: `QR-${referenceNo}` })}
                    className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="size-3.5" />
                    <span>{t('८०mm क्युआर छाप्नुहोस्', 'Print Thermal QR')}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Success confirmation screen */
            <div className="flex flex-col items-center py-6 text-center animate-fade-in">
              <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3">
                <CheckCircle2 className="size-10" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {t('भुक्तानी सफलतापूर्वक सम्पन्न भयो!', 'Payment Received Successfully!')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                {t(
                  `रु. ${amount.toLocaleString('ne-NP')} तपाईंको बचत खाता (${accountNo}) मा दाखिला भएको छ।`,
                  `NPR ${amount.toLocaleString()} has been credited to account (${accountNo}).`
                )}
              </p>

              <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300 w-full space-y-1">
                <div className="flex justify-between">
                  <span>रेफरेन्स नं:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{referenceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>च्यानल:</span>
                  <span className="font-bold text-emerald-600">NepalPay / Fonepay NPS</span>
                </div>
              </div>

              <div className="w-full flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => printElement('nepal-qr-slip', { format: 'thermal-80mm' })}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="size-4" />
                  <span>{t('रसिद छाप्नुहोस्', 'Print Receipt')}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  <span>{t('सम्पन्न (Close)', 'Done')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
