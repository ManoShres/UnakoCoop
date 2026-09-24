import React from 'react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { Employee, EmployeeStatus } from '../../../../types';
import {
  IdCard,
  Search,
  Edit,
  Trash,
  Phone,
  Mail,
  Building,
  CalendarDays,
  BadgeCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { ACCESS_ROLE_LABELS, STATUS_IDS } from './EmployeeTypes';

interface EmployeeTableSectionProps {
  employees: Employee[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'ALL' | EmployeeStatus;
  setStatusFilter: (status: 'ALL' | EmployeeStatus) => void;
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
}

export const EmployeeTableSection: React.FC<EmployeeTableSectionProps> = ({
  employees,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onEdit,
  onDelete,
}) => {
  const { t, fmtPhone } = useLanguageStore();

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('नाम, कर्मचारी नं. वा पदबाट खोज्नुहोस्...', 'Search by name, staff ID, post...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', ...STATUS_IDS] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL'
                ? t('सबै कर्मचारीहरू', 'All Employees')
                : st === 'ACTIVE'
                ? t('कार्यरत', 'Active')
                : st === 'ON_LEAVE'
                ? t('बिदामा', 'On Leave')
                : t('निष्क्रिय', 'Inactive')}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{t('कर्मचारी विवरण', 'Employee Info')}</th>
                <th className="py-3 px-4">{t('सम्पर्क', 'Contact')}</th>
                <th className="py-3 px-4">{t('पद तथा पहुँच भूमिका', 'Posting & Access Role')}</th>
                <th className="py-3 px-4">{t('स्थिति', 'Status')}</th>
                <th className="py-3 px-4 text-right">{t('कार्य', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Employee Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100">
                        <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {t(emp.nameNepali || emp.name, emp.name)}
                        </div>
                        {emp.nameNepali && (
                          <div className="text-[11px] text-slate-500">
                            {t(emp.name, emp.nameNepali)}
                          </div>
                        )}
                        <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                          {emp.employeeNo}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Phone className="size-3.5 text-slate-400" />
                      <span>{fmtPhone(emp.phone)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mail className="size-3.5 text-slate-400" />
                      <span className="max-w-[170px] truncate inline-block align-bottom">{emp.email}</span>
                    </div>
                  </td>

                  {/* Posting & Access Role */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {t(emp.designationNepali || emp.designation, emp.designation)}
                    </div>
                    <div className="text-[11px] text-slate-500">{emp.department}</div>
                    <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-500">
                      <Building className="size-3 text-slate-400" />
                      <span>{emp.branch}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                      <BadgeCheck className="size-3" />
                      {t(ACCESS_ROLE_LABELS[emp.accessRole].ne, ACCESS_ROLE_LABELS[emp.accessRole].en)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        emp.status === 'ACTIVE'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : emp.status === 'ON_LEAVE'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {emp.status === 'ACTIVE' ? (
                        <CheckCircle2 className="size-3" />
                      ) : emp.status === 'ON_LEAVE' ? (
                        <Clock className="size-3" />
                      ) : (
                        <AlertTriangle className="size-3" />
                      )}
                      {emp.status === 'ACTIVE'
                        ? t('कार्यरत', 'ACTIVE')
                        : emp.status === 'ON_LEAVE'
                        ? t('बिदामा', 'ON_LEAVE')
                        : t('निष्क्रिय', 'INACTIVE')}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <CalendarDays className="size-3" />
                      {t('जोइन: ', 'Joined: ')}{emp.joinedDate}
                    </div>
                    {emp.assignedWards.length > 0 && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {t('क्षेत्र: ', 'Wards: ')}{emp.assignedWards.join(', ')}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onEdit(emp)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold transition cursor-pointer"
                    >
                      <Edit className="size-3.5" />
                      <span>{t('सम्पादन', 'Edit')}</span>
                    </button>
                    <button
                      onClick={() => onDelete(emp)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold transition ml-2 cursor-pointer"
                    >
                      <Trash className="size-3.5" />
                      <span>{t('हटाउनुहोस्', 'Delete')}</span>
                    </button>
                  </td>
                </tr>
              ))}

              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 px-4 text-center text-slate-400">
                    <IdCard className="size-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-medium">
                      {t('दर्ता भएको कुनै कर्मचारी भेटिएन।', 'No employee records match your search.')}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
