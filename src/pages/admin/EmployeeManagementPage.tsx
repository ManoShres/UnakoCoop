import React, { useEffect, useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { Employee, EmployeeAccessRole, EmployeeStatus } from '../../types';
import {
  IdCard,
  UserPlus,
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
  X,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';

const DEFAULT_AVATAR = '/assets/kyc/avatar_officer.png';

const ACCESS_ROLE_LABELS: Record<EmployeeAccessRole, { ne: string; en: string }> = {
  SUPER_ADMIN: { ne: 'सुपर एडमिन', en: 'Super Admin' },
  BRANCH_MANAGER: { ne: 'शाखा प्रबन्धक', en: 'Branch Manager' },
  LOAN_OFFICER: { ne: 'कर्जा अधिकृत', en: 'Loan Officer' },
  TELLER: { ne: 'टेलर / क्यासियर', en: 'Teller' },
  ACCOUNTANT: { ne: 'लेखापाल', en: 'Accountant' },
  FIELD_OFFICER: { ne: 'क्षेत्र सहजकर्ता', en: 'Field Officer' },
};

const ACCESS_ROLE_IDS: EmployeeAccessRole[] = [
  'SUPER_ADMIN',
  'BRANCH_MANAGER',
  'LOAN_OFFICER',
  'TELLER',
  'ACCOUNTANT',
  'FIELD_OFFICER',
];

const STATUS_IDS: EmployeeStatus[] = ['ACTIVE', 'ON_LEAVE', 'INACTIVE'];

interface EmployeeDraft {
  name: string;
  nameNepali: string;
  designation: string;
  designationNepali: string;
  phone: string;
  email: string;
  department: string;
  branch: string;
  accessRole: EmployeeAccessRole;
  status: EmployeeStatus;
  joinedDate: string;
  wardsText: string;
  avatarUrl: string;
  notes: string;
}

const createEmptyDraft = (): EmployeeDraft => ({
  name: '',
  nameNepali: '',
  designation: '',
  designationNepali: '',
  phone: '',
  email: '',
  department: 'Field Operations',
  branch: 'Gadhwa Main Branch',
  accessRole: 'FIELD_OFFICER',
  status: 'ACTIVE',
  joinedDate: new Date().toISOString().split('T')[0],
  wardsText: '',
  avatarUrl: DEFAULT_AVATAR,
  notes: '',
});

const parseWards = (wardsText: string): string[] =>
  wardsText
    .split(',')
    .map((ward) => ward.trim())
    .filter((ward) => ward.length > 0);

export function EmployeeManagementPage() {
  const { employees, addEmployee, updateEmployee, removeEmployee, employeeSync, syncEmployees } =
    useCoopStore();
  const { t, fmtCount, fmtPhone, fmtDigits } = useLanguageStore();

  useEffect(() => {
    void syncEmployees();
  }, [syncEmployees]);

  const syncBadge = (() => {
    if (employeeSync.source === 'local') {
      return {
        label: t('स्थानीय डेमो मोड (सुपाबेस जोडिएको छैन)', 'Local demo mode (Supabase not connected)'),
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
        dot: 'bg-slate-400',
      };
    }
    if (employeeSync.state === 'syncing') {
      return {
        label: t('सुपाबेससँग सिंक हुँदैछ...', 'Syncing with Supabase...'),
        className: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300',
        dot: 'bg-blue-500 animate-pulse',
      };
    }
    if (employeeSync.state === 'error') {
      return {
        label: t('सिंक त्रुटि — स्थानीय प्रतिलिपि देखाइँदै', 'Sync error - showing local copy'),
        className: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300',
        dot: 'bg-rose-500',
      };
    }
    return {
      label: t('सुपाबेस लाइभ जडान सक्रिय', 'Supabase live - connected'),
      className: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    };
  })();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EmployeeStatus>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [draft, setDraft] = useState<EmployeeDraft>(createEmptyDraft());
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!showAddModal && !editingEmployee && !employeeToDelete) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setShowAddModal(false);
        setEditingEmployee(null);
        setEmployeeToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, editingEmployee, employeeToDelete]);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filteredEmployees = employees.filter((emp) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      emp.name.toLowerCase().includes(query) ||
      (emp.nameNepali || '').includes(searchTerm) ||
      emp.employeeNo.toLowerCase().includes(query) ||
      emp.designation.toLowerCase().includes(query) ||
      emp.phone.includes(searchTerm) ||
      emp.email.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = employees.filter((emp) => emp.status === 'ACTIVE').length;
  const onLeaveCount = employees.filter((emp) => emp.status === 'ON_LEAVE').length;
  const fieldOfficerCount = employees.filter((emp) => emp.accessRole === 'FIELD_OFFICER').length;
  const branchCount = new Set(employees.map((emp) => emp.branch)).size;

  const generateEmployeeNo = () =>
    'EMP-2081-' + String(Math.floor(1 + Math.random() * 9999)).padStart(4, '0');

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.designation.trim() || !draft.phone.trim()) {
      alert(
        t(
          'कृपया कर्मचारीको नाम, पद र फोन अनिवार्य भर्नुहोस्।',
          'Please provide the required employee name, designation and phone.'
        )
      );
      return;
    }

    const created = addEmployee({
      employeeNo: generateEmployeeNo(),
      name: draft.name.trim(),
      nameNepali: draft.nameNepali.trim() || undefined,
      designation: draft.designation.trim(),
      designationNepali: draft.designationNepali.trim() || undefined,
      department: draft.department.trim() || 'General Administration',
      branch: draft.branch.trim() || 'Gadhwa Main Branch',
      phone: draft.phone.trim(),
      email:
        draft.email.trim() ||
        draft.name.trim().toLowerCase().replace(/\s+/g, '.') + '@unako.coop.np',
      joinedDate: draft.joinedDate,
      status: draft.status,
      accessRole: draft.accessRole,
      assignedWards: parseWards(draft.wardsText),
      avatarUrl: draft.avatarUrl || DEFAULT_AVATAR,
      notes: draft.notes.trim() || undefined,
    });

    showToastMsg(
      t(
        `कर्मचारी ${created.name} (${created.employeeNo}) दर्ता भयो!`,
        `Employee ${created.name} (${created.employeeNo}) created!`
      )
    );
    setShowAddModal(false);
    setDraft(createEmptyDraft());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    updateEmployee(editingEmployee.id, {
      name: editingEmployee.name,
      nameNepali: editingEmployee.nameNepali,
      designation: editingEmployee.designation,
      designationNepali: editingEmployee.designationNepali,
      department: editingEmployee.department,
      branch: editingEmployee.branch,
      phone: editingEmployee.phone,
      email: editingEmployee.email,
      joinedDate: editingEmployee.joinedDate,
      status: editingEmployee.status,
      accessRole: editingEmployee.accessRole,
      assignedWards: editingEmployee.assignedWards,
      notes: editingEmployee.notes,
    });

    showToastMsg(
      t(
        `कर्मचारी ${editingEmployee.name} को विवरण अद्यावधिक भयो!`,
        `Employee ${editingEmployee.name} successfully updated!`
      )
    );
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = () => {
    if (!employeeToDelete) return;
    const removedName = employeeToDelete.name;
    removeEmployee(employeeToDelete.id);
    showToastMsg(t(`कर्मचारी ${removedName} हटाइयो!`, `Employee ${removedName} removed!`));
    setEmployeeToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
            <IdCard className="size-4" />
            <span>{t('कर्मचारी तथा एचआर केन्द्रीय अभिलेख', 'CENTRAL EMPLOYEE & HR REGISTER')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('कर्मचारी व्यवस्थापन तथा एचआर कन्सोल', 'Employee Management Suite')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'नयाँ कर्मचारी दर्ता, पद तथा शाखा तोकिएको विवरण, पोर्टल पहुँच भूमिका र कार्यक्षेत्र व्यवस्थापन।',
              'Onboard cooperative staff, configure postings, branches, portal access roles and ward coverage.'
            )}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${syncBadge.className}`}
            >
              <span className={`size-2 rounded-full ${syncBadge.dot}`}></span>
              {syncBadge.label}
            </span>
            {employeeSync.state === 'error' && employeeSync.message && (
              <span className="text-[10px] text-rose-500 max-w-xs truncate">{employeeSync.message}</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition shrink-0"
          type="button"
        >
          <UserPlus className="size-4" />
          <span>{t('+ नयाँ कर्मचारी दर्ता', '+ Add New Employee')}</span>
        </button>
      </div>

      {/* HR Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('कुल कर्मचारी', 'Total Employees')}
            </span>
            <IdCard className="size-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{fmtCount(employees.length)}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {t('क्षेत्र सहजकर्ता: ', 'Field officers: ')}{fmtCount(fieldOfficerCount)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('कार्यरत', 'Active On Duty')}
            </span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{fmtCount(activeCount)}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('बिदामा', 'On Leave')}
            </span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{fmtCount(onLeaveCount)}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('शाखा कार्यस्थल', 'Branch Postings')}
            </span>
            <Building className="size-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{fmtCount(branchCount)}</div>
        </div>
      </div>

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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
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
              {filteredEmployees.map((emp) => (
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
                      onClick={() => setEditingEmployee(emp)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold transition"
                    >
                      <Edit className="size-3.5" />
                      <span>{t('सम्पादन', 'Edit')}</span>
                    </button>
                    <button
                      onClick={() => setEmployeeToDelete(emp)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold transition ml-2"
                    >
                      <Trash className="size-3.5" />
                      <span>{t('हटाउनुहोस्', 'Delete')}</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
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

      {/* ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="size-4" />
                <h3 className="font-bold text-sm">
                  {t('नयाँ कर्मचारी दर्ता', 'Onboard New Cooperative Employee')}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white p-1">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('पूरा नाम *', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('जस्तै: सीता चौधरी', 'e.g. Sita Chaudhary')}
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('नाम (नेपाली)', 'Name (Nepali)')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('जस्तै: सीता चौधरी', 'Devanagari name')}
                    value={draft.nameNepali}
                    onChange={(e) => setDraft({ ...draft, nameNepali: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('पद / जिम्मेवारी *', 'Designation / Post *')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('जस्तै: कर्जा अधिकृत', 'e.g. Credit Officer')}
                    value={draft.designation}
                    onChange={(e) => setDraft({ ...draft, designation: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('पोर्टल पहुँच भूमिका', 'Portal Access Role')}
                  </label>
                  <select
                    value={draft.accessRole}
                    onChange={(e) => setDraft({ ...draft, accessRole: e.target.value as EmployeeAccessRole })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
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
                    {t('मोबाइल नम्बर *', 'Mobile Phone *')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('९८५७८-XXXXX', '98578-XXXXX')}
                    value={draft.phone}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('इमेल', 'Official Email')}
                  </label>
                  <input
                    type="email"
                    placeholder="name@unako.coop.np"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
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
                    value={draft.department}
                    onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('शाखा / कार्यस्थल', 'Branch / Posting')}
                  </label>
                  <input
                    type="text"
                    value={draft.branch}
                    onChange={(e) => setDraft({ ...draft, branch: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
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
                    value={draft.joinedDate}
                    onChange={(e) => setDraft({ ...draft, joinedDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('सेवा स्थिति', 'Service Status')}
                  </label>
                  <select
                    value={draft.status}
                    onChange={(e) => setDraft({ ...draft, status: e.target.value as EmployeeStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
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
                    value={draft.wardsText}
                    onChange={(e) => setDraft({ ...draft, wardsText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('एचआर टिप्पणी', 'HR Remarks')}
                </label>
                <textarea
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs h-16"
                  placeholder={t(
                    'जिम्मेवारी, परीक्षणकाल वा हस्तान्तरण सम्बन्धी टिप्पणी...',
                    'Record duty assignment, probation or handover remarks...'
                  )}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('कर्मचारी दर्ता गर्नुहोस्', 'Create Employee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {editingEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setEditingEmployee(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="size-4 text-blue-400" />
                <h3 className="font-bold text-sm">
                  {t('कर्मचारी विवरण अद्यावधिक', 'Update Employee Record')}: {t(editingEmployee.nameNepali || editingEmployee.name, editingEmployee.name)}
                </h3>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('पूरा नाम', 'Full Name')}
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs h-16"
                  placeholder={t(
                    'जिम्मेवारी, बढुवा वा हस्तान्तरण सम्बन्धी टिप्पणी...',
                    'Record duty changes, promotion or handover remarks...'
                  )}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('परिवर्तन सुरक्षित गर्नुहोस्', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE EMPLOYEE CONFIRMATION MODAL */}
      {employeeToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setEmployeeToDelete(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
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
                  onClick={() => setEmployeeToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEmployee}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('हटाउनुहोस्', 'Remove Employee')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
