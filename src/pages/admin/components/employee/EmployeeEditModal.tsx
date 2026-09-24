import React from 'react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { Employee, EmployeeAccessRole, EmployeeStatus } from '../../../../types';
import { Edit, X } from 'lucide-react';
import { ACCESS_ROLE_IDS, ACCESS_ROLE_LABELS, parseWards } from './EmployeeTypes';

interface EmployeeEditModalProps {
  editingEmployee: Employee | null;
  setEditingEmployee: React.Dispatch<React.SetStateAction<Employee | null>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  editingEmployee,
  setEditingEmployee,
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguageStore();

  if (!editingEmployee) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Edit className="size-4 text-blue-400" />
            <h3 className="font-bold text-sm">
              {t('कर्मचारी विवरण अद्यावधिक', 'Update Employee Record')}:{' '}
              {t(editingEmployee.nameNepali || editingEmployee.name, editingEmployee.name)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('पूरा नाम', 'Full Name')}
              </label>
              <input
                type="text"
                value={editingEmployee.name}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('नाम (नेपाली)', 'Name (Nepali)')}
              </label>
              <input
                type="text"
                value={editingEmployee.nameNepali || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, nameNepali: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('पद / जिम्मेवारी', 'Designation / Post')}
              </label>
              <input
                type="text"
                value={editingEmployee.designation}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('पोर्टल पहुँच भूमिका', 'Portal Access Role')}
              </label>
              <select
                value={editingEmployee.accessRole}
                onChange={(e) =>
                  setEditingEmployee({ ...editingEmployee, accessRole: e.target.value as EmployeeAccessRole })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:border-blue-500"
              >
                {ACCESS_ROLE_IDS.map((role) => (
                  <option key={role} value={role}>
                    {t(ACCESS_ROLE_LABELS[role].ne, ACCESS_ROLE_LABELS[role].en)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('सम्पर्क नम्बर', 'Phone Number')}
              </label>
              <input
                type="text"
                value={editingEmployee.phone}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('इमेल', 'Official Email')}
              </label>
              <input
                type="email"
                value={editingEmployee.email}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('विभाग', 'Department')}
              </label>
              <input
                type="text"
                value={editingEmployee.department}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('शाखा / कार्यस्थल', 'Branch / Posting')}
              </label>
              <input
                type="text"
                value={editingEmployee.branch}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, branch: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('सेवा प्रवेश मिति', 'Joined Date')}
              </label>
              <input
                type="date"
                value={editingEmployee.joinedDate}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, joinedDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('सेवा स्थिति', 'Service Status')}
              </label>
              <select
                value={editingEmployee.status}
                onChange={(e) =>
                  setEditingEmployee({ ...editingEmployee, status: e.target.value as EmployeeStatus })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:border-blue-500"
              >
                <option value="ACTIVE">{t('कार्यरत', 'ACTIVE')}</option>
                <option value="ON_LEAVE">{t('बिदामा', 'ON_LEAVE')}</option>
                <option value="INACTIVE">{t('निष्क्रिय', 'INACTIVE')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('कार्यक्षेत्र वडा', 'Assigned Wards')}
              </label>
              <input
                type="text"
                placeholder={t('वडा ४, वडा ५', 'Ward 4, Ward 5')}
                value={editingEmployee.assignedWards.join(', ')}
                onChange={(e) =>
                  setEditingEmployee({ ...editingEmployee, assignedWards: parseWards(e.target.value) })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('एचआर टिप्पणी', 'HR Remarks')}
            </label>
            <textarea
              value={editingEmployee.notes || ''}
              onChange={(e) => setEditingEmployee({ ...editingEmployee, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs h-16 outline-none focus:border-blue-500"
              placeholder={t(
                'जिम्मेवारी, बढुवा वा हस्तान्तरण सम्बन्धी टिप्पणी...',
                'Record duty changes, promotion or handover remarks...'
              )}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              {t('परिवर्तन सुरक्षित गर्नुहोस्', 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
