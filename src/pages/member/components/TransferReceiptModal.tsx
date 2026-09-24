import React from 'react';
import { CheckCircle2, Printer, X } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { PaymentRecord } from './TransferTypes';

interface TransferReceiptModalProps {
  record: PaymentRecord | null;
  onClose: () => void;
}

export const TransferReceiptModal: React.FC<TransferReceiptModalProps> = ({ record, onClose }) => {
  const { t } = useLanguageStore();

  if (!record) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal-in border border-outline-variant/20 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer transition-colors"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pb-4 border-b border-outline-variant/15">
          <div className="w-12 h-12 rounded-full bg-status-success/10 text-status-success mx-auto flex items-center justify-center mb-2 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-headline text-lg font-bold text-on-surface">उनको बचत तथा ऋण सहकारी संस्था लि.</h3>
          <p className="font-label-sm text-xs text-on-surface-variant">Unako SACCOS · Central CBS Transaction Advice</p>
          <div className="font-display-stat text-2xl font-bold text-primary mt-2 font-headline">
            {record.isCredit ? '+' : '-'}NPR {record.amount}
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-success/10 text-status-success text-xs font-bold mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {record.status}
          </span>
        </div>

        <div className="py-4 space-y-2.5 text-xs border-b border-outline-variant/15 font-tabular-mono">
          <div className="flex justify-between">
            <span className="text-on-surface-variant font-sans">Transaction Ref:</span>
            <span className="font-mono font-bold text-on-surface">{record.ref}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant font-sans">Date &amp; Time:</span>
            <span className="font-bold text-on-surface">{record.date} · {record.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant font-sans">Counterparty:</span>
            <span className="font-bold text-on-surface text-right font-sans">{record.counterparty}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant font-sans">Channel:</span>
            <span className="font-bold text-on-surface font-sans">{record.channel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant font-sans">Account:</span>
            <span className="font-bold text-on-surface">{record.account}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant font-sans">Purpose / Remarks:</span>
            <span className="font-bold text-on-surface text-right max-w-[60%] font-sans">{record.sub}</span>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-bold text-xs hover:bg-surface-container transition-colors cursor-pointer"
            type="button"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            type="button"
          >
            <Printer className="w-4 h-4" />
            <span>{t('प्रिन्ट रसिद', 'Print Receipt')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
