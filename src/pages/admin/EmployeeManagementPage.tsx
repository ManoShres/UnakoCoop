import React, { useEffect, useState, useMemo } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { Employee, EmployeeStatus } from '../../types';
import { CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { EmployeeDraft, createEmptyDraft, parseWards, DEFAULT_AVATAR } from './components/employee/EmployeeTypes';
import { EmployeeHeaderBanner } from './components/employee/EmployeeHeaderBanner';
import { EmployeeStatsStrip } from './components/employee/EmployeeStatsStrip';
import { EmployeeTableSection } from './components/employee/EmployeeTableSection';
import { EmployeeAddModal } from './components/employee/EmployeeAddModal';
import { EmployeeEditModal } from './components/employee/EmployeeEditModal';
import { EmployeeDeleteModal } from './components/employee/EmployeeDeleteModal';
import { StaffRetirementFundModal } from '../../components/admin/StaffRetirementFundModal';

export function EmployeeManagementPage() {
  const { employees, addEmployee, updateEmployee, removeEmployee, employeeSync, syncEmployees } =
    useCoopStore();
  const { t } = useLanguageStore();

  useEffect(() => {
    void syncEmployees();
  }, [syncEmployees]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EmployeeStatus>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRetirementModalOpen, setIsRetirementModalOpen] = useState(false);
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

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
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
  }, [employees, searchTerm, statusFilter]);

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
      <EmployeeHeaderBanner
        onAddEmployee={() => setShowAddModal(true)}
        onOpenRetirementFund={() => setIsRetirementModalOpen(true)}
        employeeSync={employeeSync}
      />

      {/* HR Summary Stats */}
      <EmployeeStatsStrip
        totalEmployees={employees.length}
        fieldOfficerCount={fieldOfficerCount}
        activeCount={activeCount}
        onLeaveCount={onLeaveCount}
        branchCount={branchCount}
      />

      {/* Filter & Employee Table Section */}
      <EmployeeTableSection
        employees={filteredEmployees}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onEdit={(emp) => setEditingEmployee(emp)}
        onDelete={(emp) => setEmployeeToDelete(emp)}
      />

      {/* Modals */}
      <EmployeeAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        draft={draft}
        setDraft={setDraft}
        onSubmit={handleCreateEmployee}
      />

      <EmployeeEditModal
        editingEmployee={editingEmployee}
        setEditingEmployee={setEditingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSubmit={handleSaveEdit}
      />

      <EmployeeDeleteModal
        employeeToDelete={employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirmDelete={handleDeleteEmployee}
      />

      <StaffRetirementFundModal
        isOpen={isRetirementModalOpen}
        onClose={() => setIsRetirementModalOpen(false)}
        employees={employees}
      />
    </div>
  );
}
