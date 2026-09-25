import React from 'react';
import { Cpu, IdCard, Printer, X } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { printElement } from '../../../utils/printHelper';

interface DigitalSmartIdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DigitalSmartIdModal({ isOpen, onClose }: DigitalSmartIdModalProps) {
  const { t } = useLanguageStore();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-modal-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <IdCard className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold text-sm font-headline">{t('स्मार्ट सदस्य परिचयपत्र', 'Digital Member Smart ID')}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5 text-lg" />
          </button>
        </div>

        {/* Smart ID Card Layout */}
        <div className="p-6 space-y-6 print:p-0">
          <div
            id="digital-smart-id-card"
            data-printable="card"
            className="relative bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/30 overflow-hidden"
          >
            {/* Chip & Logo Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-800 font-black text-xl shadow">
                  उ
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-wide">उनको बचत तथा ऋण सहकारी संस्था लि.</h4>
                  <p className="text-[10px] text-emerald-200">UNAKO SAVINGS & CREDIT COOPERATIVE LTD.</p>
                  <p className="text-[9px] text-emerald-300">गढवा-५, दाङ, नेपाल • दर्ता नं: २८/२०५७/०५८</p>
                </div>
              </div>
              <div className="w-9 h-7 rounded-md bg-amber-400/90 border border-amber-300 shadow-inner flex items-center justify-center">
                <Cpu className="w-5 h-5 text-amber-900 text-sm" />
              </div>
            </div>

            {/* Member Body */}
            <div className="mt-5 flex items-center gap-5">
              <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-white/80 bg-emerald-950 shrink-0 shadow-md">
                <img
                  className="w-full h-full object-cover"
                  src="/assets/kyc/avatar_hari.png"
                  alt="Hari Prasad Chaudhary"
                />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-emerald-300 font-mono">MEMBER ID / सदस्यता नं:</div>
                <div className="text-xl font-black font-mono tracking-wider text-amber-300">UKO-2070-08842</div>
                <div className="text-base font-bold text-white leading-tight">श्री हरि प्रसाद चौधरी</div>
                <div className="text-xs text-emerald-200">HARI PRASAD CHAUDHARY</div>
                <div className="text-[11px] text-slate-300">शाखा: गढवा मुख्य शाखा (दाङ)</div>
              </div>
            </div>

            {/* Card Footer with QR & Watermark */}
            <div className="mt-5 pt-3 border-t border-emerald-700/60 flex items-end justify-between">
              <div className="text-[10px] text-emerald-300 space-y-0.5">
                <div>जारी मिति: २०७०/०३/१२</div>
                <div>प्रमाणीकरण: CBS LIVE SYNCED ✓</div>
              </div>
              <div className="w-14 h-14 bg-white p-1 rounded-lg shadow shrink-0 flex items-center justify-center">
                <img
                  className="w-full h-full object-contain"
                  src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=UKO-2070-08842-HARI-PRASAD-CHAUDHARY-UNAKO-CBS"
                  alt="Member QR"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              {t('बन्द गर्नुहोस्', 'Close')}
            </button>
            <button
              type="button"
              onClick={() => printElement('digital-smart-id-card')}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-5 h-5 text-base" />
              {t('प्रिन्ट गर्नुहोस्', 'Print ID')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
