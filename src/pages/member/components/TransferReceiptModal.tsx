import React from 'react';
import { CheckCircle2, Printer, X } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useCoopStore } from '../../../store/useCoopStore';
import { PaymentRecord } from './TransferTypes';
import { printElement } from '../../../utils/printHelper';

interface TransferReceiptModalProps {
  record: PaymentRecord | null;
  onClose: () => void;
}

export const TransferReceiptModal: React.FC<TransferReceiptModalProps> = ({ record, onClose }) => {
  const { t } = useLanguageStore();
  const coopSettings = useCoopStore((s) => s.coopSettings);

  if (!record) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="transfer-receipt-slip"
        data-printable="slip"
        className="bg-white text-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal-in border border-slate-200 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors print:hidden"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pb-4 border-b border-slate-200">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-headline text-lg font-bold text-slate-900">
            {coopSettings?.nameNepali || coopSettings?.name || 'उनको बचत तथा ऋण सहकारी संस्था लि.'}
          </h3>
          <p className="font-label-sm text-xs text-slate-600 font-bold">Unako SACCOS · Central CBS Transaction Advice</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {coopSettings?.addressNepali || coopSettings?.address || 'गढवा-५, दाङ'} • दर्ता नं: {coopSettings?.regNo || '१२९०/०६७/०६८'}
          </p>
          <div className="font-display-stat text-2xl font-black text-emerald-700 mt-2 font-headline">
            {record.isCredit ? '+' : '-'}NPR {record.amount}
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {record.status}
          </span>
        </div>

        <div className="py-4 space-y-2.5 text-xs border-b border-slate-200 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Transaction Ref:</span>
            <span className="font-bold text-slate-900">{record.ref}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Date &amp; Time:</span>
            <span className="font-bold text-slate-900">{record.date} · {record.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Counterparty:</span>
            <span className="font-bold text-slate-900 text-right font-sans">{record.counterparty}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Channel:</span>
            <span className="font-bold text-slate-900 font-sans">{record.channel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Account:</span>
            <span className="font-bold text-slate-900">{record.account}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans">Purpose / Remarks:</span>
            <span className="font-bold text-slate-900 text-right max-w-[60%] font-sans">{record.sub}</span>
          </div>
        </div>

        {/* Official Signature Lines */}
        <div className="pt-6 pb-2 grid grid-cols-2 gap-6 text-[10px] text-center">
          <div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-800">खातावाला / ग्राहक</p>
              <p className="text-slate-500 font-sans">(Account Holder)</p>
            </div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-800">अख्तियारवाला अधिकारी</p>
              <p className="text-slate-500 font-sans">(Authorized Officer)</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            type="button"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
          <button
            onClick={() => printElement('transfer-receipt-slip')}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
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
