import React from 'react';
import { UserPlus, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface TransferAddBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const TransferAddBeneficiaryModal: React.FC<TransferAddBeneficiaryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { t } = useLanguageStore();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-modal-in border border-outline-variant/20"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-outline-variant/15">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface">
              {t('नयाँ लाभार्थी थप्नुहोस्', 'Add New Beneficiary')}
            </h3>
            <p className="font-label-sm text-xs text-on-surface-variant">
              {t('सीबीएस प्रमाणित सहकारी सदस्य खोजी र सुरक्षित', 'CBS-verified cooperative member lookup & save')}
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

        <div className="space-y-4 mb-5">
          <div>
            <label className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              {t('लाभार्थी सदस्य नम्बर', 'Beneficiary Member ID')}
            </label>
            <input
              defaultValue="UKO-2072-04419"
              className="w-full px-4 py-3 rounded-xl border-2 border-primary bg-surface-container-low text-sm font-mono font-bold outline-none"
            />
          </div>

          {/* CBS Preview */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base shadow-xs">
                BT
              </div>
              <div>
                <div className="font-headline text-sm font-bold text-on-surface">Bhojraj Tharu</div>
                <div className="font-label-sm text-xs text-on-surface-variant">
                  UKO-2072-04419 · Gadhwa-5, Deukhuri, Dang
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-success/10 text-status-success text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-status-success" />
                    {t('सीबीएस प्रमाणित सदस्य', 'CBS Verified Member')}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                    Tier-1 Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              {t('सम्बन्ध / उपनाम', 'Relationship / Nickname')}
            </label>
            <input
              defaultValue="Bhojraj Dai - Dairy Supplier"
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-xs outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-surface-container-low text-on-surface font-bold text-xs hover:bg-surface-container transition-colors cursor-pointer"
            type="button"
          >
            {t('रद्द गर्नुहोस्', 'Cancel')}
          </button>
          <button
            className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            type="button"
            onClick={onSave}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('लाभार्थी सुरक्षित गर्नुहोस्', 'Save Beneficiary')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
