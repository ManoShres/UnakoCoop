import React from 'react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { Employee } from '../../../../types';
import { AlertTriangle } from 'lucide-react';

interface EmployeeDeleteModalProps {
  employeeToDelete: Employee | null;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export const EmployeeDeleteModal: React.FC<EmployeeDeleteModalProps> = ({
  employeeToDelete,
  onClose,
  onConfirmDelete,
}) => {
  const { t } = useLanguageStore();

  if (!employeeToDelete) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-rose-600 text-white flex items-center gap-2">
          <AlertTriangle className="size-4" />
          <h3 className="font-bold text-sm">{t('कर्मचारी हटाउने पुष्टि', 'Confirm Employee Removal')}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="size-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700 shrink-0">
              <img
                src={employeeToDelete.avatarUrl}
                alt={employeeToDelete.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {t(employeeToDelete.nameNepali || employeeToDelete.name, employeeToDelete.name)}
              </div>
              <div className="text-[11px] font-mono text-slate-500">{employeeToDelete.employeeNo}</div>
              <div className="text-[11px] text-slate-500">
                {t(employeeToDelete.designationNepali || employeeToDelete.designation, employeeToDelete.designation)}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              'यो कर्मचारीको अभिलेख एचआर निर्देशिकाबाट स्थायी रूपमा हट्नेछ। के तपाईं पक्का हुनुहुन्छ?',
              'This employee record will be permanently removed from the HR register. Are you sure?'
            )}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={onConfirmDelete}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              {t('हटाउनुहोस्', 'Remove Employee')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
