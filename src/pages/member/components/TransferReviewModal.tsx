import React from 'react';
import { ShieldCheck, X, ArrowRight, Lock } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { VerifiedMember } from './TransferTypes';

interface TransferReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  memberId: string;
  verifiedMember: VerifiedMember | null;
  acctType: 'savings' | 'share';
  purpose: string;
  onConfirmSuccess: () => void;
  sourceAccountNo?: string;
}

export const TransferReviewModal: React.FC<TransferReviewModalProps> = ({
  isOpen,
  onClose,
  amount,
  memberId,
  verifiedMember,
  acctType,
  purpose,
  onConfirmSuccess,
  sourceAccountNo = '104-0029-64',
}) => {
  const { t, fmtCurrency } = useLanguageStore();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal-in border border-outline-variant/20"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-outline-variant/15">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface">
              {t('रकम पठाउन प्रमाणीकरण गर्नुहोस्', 'Confirm & Authorize Transfer')}
            </h3>
            <p className="font-label-sm text-xs text-primary font-bold">
              {t('रकम स्थानान्तरण समीक्षा तथा एमपिन सुरक्षा प्रमाणीकरण', 'Transfer Review & MPIN Security Confirmation')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg hover:bg-surface-container cursor-pointer transition-colors text-on-surface-variant"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-5 text-xs">
          {[
            { l: t('स्थानान्तरण रकम', 'Transfer Amount'), v: `NPR ${fmtCurrency(parseInt(amount || '0'), true)}.00` },
            { l: t('निकासी शुल्क', 'Clearing Fee'), v: t('रु. ०.०० (०% अधिभार)', 'NPR 0.00 (0% Surcharge)'), green: true },
            { l: t('स्रोत खाता', 'Debit Account'), v: `${t('साधारण बचत', 'Regular Savings')} - ${sourceAccountNo}` },
            { l: t('प्राप्तकर्ता', 'Recipient'), v: `${verifiedMember?.name || 'Cooperative Member'} (${memberId})` },
            {
              l: t('गन्तव्य खाता', 'Target Account'),
              v: acctType === 'savings' ? t('सदस्य बचत पासबुक', 'Member Savings (Passbook)') : t('शेयर पुँजी कोष', 'Share Capital Pool'),
            },
            { l: t('प्रयोजन / कैफियत', 'Remarks / Purpose'), v: purpose || t('सहकारी स्थानान्तरण', 'Cooperative Transfer') },
          ].map((r, i) => (
            <div key={i} className="flex justify-between py-1.5 border-b border-outline-variant/10">
              <span className="text-on-surface-variant">{r.l}</span>
              <span className={`font-bold text-right max-w-[60%] ${r.green ? 'text-status-success' : 'text-on-surface'}`}>
                {r.v}
              </span>
            </div>
          ))}
        </div>

        {/* MPIN Input */}
        <div className="mb-5">
          <label className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2 text-center">
            {t('४-अङ्कको गोप्य सुरक्षा पिन प्रविष्ट गर्नुहोस्', 'Enter 4-Digit Security PIN (MPIN)')}
          </label>
          <div className="flex gap-3 justify-center mb-2">
            {[0, 1, 2, 3].map(i => (
              <input
                key={i}
                type="password"
                maxLength={1}
                defaultValue={i < 2 ? '•' : ''}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-outline-variant/40 rounded-xl focus:border-primary outline-none bg-surface-container-low"
              />
            ))}
          </div>
          <div className="text-center font-label-sm text-xs text-on-surface-variant flex items-center justify-center gap-1 mt-1">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>{t('एसएमएस ओटिपी कोड:', 'SMS OTP:')} 9898****** → <strong className="font-mono text-on-surface">841-920</strong></span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-surface-container-low text-on-surface font-bold text-xs hover:bg-surface-container transition-colors cursor-pointer"
            type="button"
          >
            {t('रद्द गर्नुहोस्', 'Cancel')}
          </button>
          <button
            className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            type="button"
            onClick={onConfirmSuccess}
          >
            <span>
              {t('रकम पठाउनुहोस्', 'Send Funds')} ({t('रु.', 'NPR')} {fmtCurrency(parseInt(amount || '0'), true)})
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
