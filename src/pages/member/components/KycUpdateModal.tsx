import React from 'react';
import { FileEdit, X } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface KycUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function KycUpdateModal({ isOpen, onClose, onSubmit }: KycUpdateModalProps) {
  const { t } = useLanguageStore();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-modal-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold text-sm font-headline">{t('केवाईसी विवरण अद्यावधिक', 'Update KYC Dossier')}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5 text-lg" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              {t('सम्पर्क नम्बर वा ठेगाना परिवर्तन', 'Select Field to Update')}
            </label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              <option>{t('मोबाइल नम्बर', 'Mobile Phone Number')}</option>
              <option>{t('स्थायी वा हालको ठेगाना', 'Permanent or Current Address')}</option>
              <option>{t('हकवाला विवरण', 'Nominee & Beneficiary')}</option>
              <option>{t('पारिवारिक विवरण', 'Family Member Details')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              {t('नयाँ विवरण', 'New Detail / Value')}
            </label>
            <input
              type="text"
              placeholder={t('नयाँ विवरण यहाँ प्रविष्ट गर्नुहोस्...', 'Enter new detail here...')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              {t('प्रमाण कागजात दाखिला', 'Upload Supporting Document')}
            </label>
            <input
              type="file"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition"
            >
              {t('सुरक्षित गरी पेस गर्नुहोस्', 'Save & Submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
