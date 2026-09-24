import React from 'react';
import { XCircle } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface CollectionVoidModalProps {
  voidingId: string | null;
  voidReason: string;
  onVoidReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirmVoid: () => void;
}

export const CollectionVoidModal: React.FC<CollectionVoidModalProps> = ({
  voidingId,
  voidReason,
  onVoidReasonChange,
  onClose,
  onConfirmVoid,
}) => {
  const { t } = useLanguageStore();

  if (!voidingId) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('कलेक्सन रद्द गर्नुहोस्', 'Void Collection')}
      className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="absolute inset-0 flex items-center justify-center p-6" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <XCircle className="size-4 text-rose-600" />
              {t('कलेक्सन रद्द गर्नुहोस्', 'Void Collection')}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <XCircle className="size-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            {t(
              'यो कार्यले यो कलेक्सनको रकमलाई सदस्य खाताबाट वापस लिन्छ (WITHDRAWAL)। यो वाट तपाईंको सहरहस्तलिखित कारण प्रयास गर्नुहोस्।',
              'This will reverse the collection amount from the member account (WITHDRAWAL). Enter a reason below.'
            )}
          </p>
          <textarea
            value={voidReason}
            onChange={(e) => onVoidReasonChange(e.target.value)}
            placeholder={t('रद्द गर्ने कारण (अनिवार्य):', 'Reason for voiding (required):')}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm mb-4 resize-none"
            rows={3}
          />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {t('रद्द गर्नुहोस् (झरिए)', 'Cancel')}
            </button>
            <button
              onClick={onConfirmVoid}
              className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
            >
              {t('पुष्टि गरी रद्द गर्नुहोस्', 'Confirm Void')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
