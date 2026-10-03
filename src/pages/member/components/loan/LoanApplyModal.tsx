import React, { useState } from 'react';
import { PlusCircle, X, Send } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { formatNPR } from '../../../../utils/nepaliDate';

interface LoanApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplication: (scheme: string, amount: number, tenure: number) => void;
}

export const LoanApplyModal: React.FC<LoanApplyModalProps> = ({
  isOpen,
  onClose,
  onSubmitApplication,
}) => {
  const { t } = useLanguageStore();
  const [loanCategory, setLoanCategory] = useState('कृषि तथा पशुपालन कर्जा (Agriculture Loan)');
  const [loanRequested, setLoanRequested] = useState(150000);
  const [loanTenure, setLoanTenure] = useState(24);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-card max-w-lg w-full rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden max-h-[90vh] flex flex-col animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <PlusCircle className="w-4 h-4" />
            </div>
            <h3 className="font-headline text-base font-bold text-on-surface">{t('नयाँ ऋण आवेदन', 'New Loan Application')}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">{t('ऋण योजना', 'Loan Scheme')}</label>
            <select
              value={loanCategory}
              onChange={(e) => setLoanCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface text-on-surface text-xs sm:text-sm focus:outline-none focus:border-primary"
            >
              <option>कृषि तथा पशुपालन कर्जा (Agriculture & Dairy - 9.5%)</option>
              <option>{t('महिला उद्यमशीलता कर्जा (७.०% अनुदान)', 'Women Entrepreneurship Loan (7.0% Subsidized)')}</option>
              <option>{t('आकस्मिक तथा स्वास्थ्य कर्जा (१०.५%)', 'Emergency & Medical Loan (10.5%)')}</option>
              <option>{t('शैक्षिक कर्जा (८.५%)', 'Education Loan (8.5%)')}</option>
              <option>{t('साना व्यवसाय कर्जा (११.०%)', 'Micro Small Business Loan (11.0%)')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">
              {t('माग गरिएको रकम (रु.)', 'Requested Amount (NPR)')}
            </label>
            <input
              type="number"
              value={loanRequested}
              step="10000"
              onChange={(e) => setLoanRequested(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface text-on-surface font-tabular-mono font-bold text-sm focus:outline-none focus:border-primary"
            />
            <p className="text-[11px] text-on-surface-variant mt-1">
              {t('अधिकतम सीमा: रु. ५,००,०००', 'Max limit: NPR 5,00,000 (Based on Shareholding & Collateral)')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">
              {t('भुक्तानी अवधि (महिना)', 'Repayment Tenure (Months)')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[12, 24, 36, 48].map((tVal) => (
                <button
                  key={tVal}
                  type="button"
                  onClick={() => setLoanTenure(tVal)}
                  className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    loanTenure === tVal
                      ? 'bg-primary text-on-primary border-primary shadow-xs'
                      : 'bg-surface border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {tVal} Months
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-2">
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>{t('अनुमानित मासिक किस्ता', 'Estimated EMI')}</span>
              <span className="font-bold text-on-surface font-tabular-mono">
                NPR {formatNPR(Math.round((loanRequested * 1.095) / loanTenure), true)} / mo
              </span>
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>{t('अनुदानित ब्याजदर', 'Subsidized Interest Rate')}</span>
              <span className="font-bold text-status-success">{t('९.५% वार्षिक', '9.5% p.a.')}</span>
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>{t('सहकारी ऋण बीमा', 'Coop Loan Insurance')}</span>
              <span className="font-bold text-on-surface">Included (0.5%)</span>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={() => onSubmitApplication(loanCategory, loanRequested, loanTenure)}
              className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {t('आवेदन पेश गर्नुहोस्', 'Submit Application')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
