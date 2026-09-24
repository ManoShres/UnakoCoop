import React from 'react';
import { Calculator, X } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface LoanOriginationHeaderProps {
  onClose: () => void;
}

export const LoanOriginationHeader: React.FC<LoanOriginationHeaderProps> = ({ onClose }) => {
  const { t } = useLanguageStore();

  return (
    <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
          <Calculator className="size-6 text-emerald-300" />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
            {t('सहकारी काउन्टर ऋण आवेदन तथा वित्तीय विश्लेषण', 'Counter Loan Origination & Credit Underwriting')}
          </div>
          <h2 id="loan-origination-title" className="text-lg font-black tracking-tight">
            {t('नयाँ कर्जा आवेदन तथा ईएमआई सिमुलेटर', 'New Loan Origination & Live EMI Simulator')}
          </h2>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label={t('बन्द गर्नुहोस्', 'Close')}
        className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
      >
        <X className="size-5" />
      </button>
    </div>
  );
};
