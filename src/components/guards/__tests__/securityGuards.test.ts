import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, isDemoMode } from '../../../store/useAuthStore';
import {
  hasPermission,
  hasAnyPermission,
  canRecordDeposits,
  canReconcile,
  canRecordTrading,
  canManageMotherGroups,
  ROLE_PERMISSIONS,
} from '../../../utils/permissions';
import { INITIAL_EMPLOYEES } from '../../../store/initialData';

describe('Security RBAC & Permissions Logic (Phase A)', () => {
  beforeEach(() => {
    useAuthStore.setState({
      role: 'GUEST',
      currentMember: null,
      currentEmployee: null,
      staffRole: null,
      authLoading: false,
    });
  });

  it('verifies that SUPER_ADMIN possesses all defined permissions', () => {
    const allPerms = Object.values(ROLE_PERMISSIONS).flat();
    const uniquePerms = Array.from(new Set(allPerms));

    for (const perm of uniquePerms) {
      expect(hasPermission('SUPER_ADMIN', perm)).toBe(true);
    }
  });

  it('restricts cash collection and field operations to authorized roles only', () => {
    // FIELD_OFFICER and TELLER can record meetings / deposits
    expect(canRecordDeposits('TELLER')).toBe(true);
    expect(canRecordDeposits('FIELD_OFFICER')).toBe(true);
    expect(canRecordDeposits('SUPER_ADMIN')).toBe(true);

    // LOAN_OFFICER cannot record deposits
    expect(canRecordDeposits('LOAN_OFFICER')).toBe(false);
  });

  it('restricts ledger reconciliation and trading P&L exclusively to accounting/management', () => {
    expect(canReconcile('ACCOUNTANT')).toBe(true);
    expect(canReconcile('BRANCH_MANAGER')).toBe(true);
    expect(canReconcile('SUPER_ADMIN')).toBe(true);
    expect(canReconcile('TELLER')).toBe(false);
    expect(canReconcile('FIELD_OFFICER')).toBe(false);

    expect(canRecordTrading('ACCOUNTANT')).toBe(true);
    expect(canRecordTrading('TELLER')).toBe(false);
  });

  it('restricts mother group administration to supervisory management', () => {
    expect(canManageMotherGroups('BRANCH_MANAGER')).toBe(true);
    expect(canManageMotherGroups('SUPER_ADMIN')).toBe(true);
    expect(canManageMotherGroups('FIELD_OFFICER')).toBe(false);
    expect(canManageMotherGroups('TELLER')).toBe(false);
  });

  it('signInStaff assigns exact access role and prevents privilege escalation', () => {
    const tellerEmp = INITIAL_EMPLOYEES.find((e) => e.accessRole === 'TELLER') || {
      id: 'emp-teller',
      employeeNo: 'EMP-TELLER-01',
      name: 'Teller Officer',
      designation: 'Counter Teller',
      department: 'Operations',
      branch: 'Main Branch',
      phone: '9800000000',
      email: 'teller@unako.coop',
      joinedDate: '2024-01-01',
      status: 'ACTIVE' as const,
      accessRole: 'TELLER' as const,
      assignedWards: [],
      avatarUrl: '',
    };

    useAuthStore.getState().signInStaff(tellerEmp);

    const state = useAuthStore.getState();
    expect(state.role).toBe('ADMIN');
    expect(state.staffRole).toBe('TELLER');
    expect(state.currentEmployee?.employeeNo).toBe(tellerEmp.employeeNo);
    expect(state.currentMember).toBeNull();

    // Verify fine-grained permissions for this active staff session
    expect(hasPermission(state.staffRole, 'process_transactions')).toBe(true);
    expect(hasPermission(state.staffRole, 'manage_employees')).toBe(false);
    expect(hasPermission(state.staffRole, 'manage_settings')).toBe(false);
  });

  it('signOut cleanly terminates the staff session and resets to GUEST', async () => {
    useAuthStore.getState().switchToPreset('admin');
    expect(useAuthStore.getState().role).toBe('ADMIN');

    await useAuthStore.getState().signOut();

    const state = useAuthStore.getState();
    expect(state.role).toBe('GUEST');
    expect(state.staffRole).toBeNull();
    expect(state.currentEmployee).toBeNull();
    expect(state.currentMember).toBeNull();
  });
});
