import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasAnyPermission,
  canRecordDeposits,
  canReconcile,
  canRecordTrading,
  canManageMotherGroups,
  roleLabel,
  ROLE_PERMISSIONS,
} from '../permissions';
import type { EmployeeAccessRole } from '../../types';

describe('Permissions Utility (RBAC)', () => {
  it('grants SUPER_ADMIN all permissions', () => {
    const allPermissions = ROLE_PERMISSIONS.SUPER_ADMIN;
    allPermissions.forEach((permission) => {
      expect(hasPermission('SUPER_ADMIN', permission)).toBe(true);
    });
  });

  it('denies manage_settings to non-super-admins', () => {
    const roles: EmployeeAccessRole[] = [
      'BRANCH_MANAGER',
      'ACCOUNTANT',
      'TELLER',
      'LOAN_OFFICER',
      'FIELD_OFFICER',
    ];
    roles.forEach((role) => {
      expect(hasPermission(role, 'manage_settings')).toBe(false);
    });
  });

  it('correctly checks canRecordDeposits', () => {
    expect(canRecordDeposits('TELLER')).toBe(true);
    expect(canRecordDeposits('SUPER_ADMIN')).toBe(true);
    expect(canRecordDeposits('BRANCH_MANAGER')).toBe(true);
    expect(canRecordDeposits('FIELD_OFFICER')).toBe(true); // can record meetings
    expect(canRecordDeposits('ACCOUNTANT')).toBe(false);
  });

  it('correctly checks canReconcile', () => {
    expect(canReconcile('ACCOUNTANT')).toBe(true);
    expect(canReconcile('BRANCH_MANAGER')).toBe(true);
    expect(canReconcile('SUPER_ADMIN')).toBe(true);
    expect(canReconcile('TELLER')).toBe(false);
    expect(canReconcile('LOAN_OFFICER')).toBe(false);
  });

  it('correctly checks canRecordTrading', () => {
    expect(canRecordTrading('ACCOUNTANT')).toBe(true);
    expect(canRecordTrading('TELLER')).toBe(false);
  });

  it('correctly checks canManageMotherGroups', () => {
    expect(canManageMotherGroups('SUPER_ADMIN')).toBe(true);
    expect(canManageMotherGroups('BRANCH_MANAGER')).toBe(true);
    expect(canManageMotherGroups('TELLER')).toBe(false);
    expect(canManageMotherGroups('FIELD_OFFICER')).toBe(false);
  });

  it('returns false for undefined or null roles', () => {
    expect(hasPermission(undefined, 'manage_members')).toBe(false);
    expect(hasPermission(null, 'manage_members')).toBe(false);
    expect(hasAnyPermission(undefined, ['manage_members', 'view_reports'])).toBe(false);
  });

  it('checks hasAnyPermission correctly', () => {
    expect(
      hasAnyPermission('LOAN_OFFICER', ['manage_loans', 'manage_settings'])
    ).toBe(true);
    expect(
      hasAnyPermission('TELLER', ['manage_settings', 'export_data'])
    ).toBe(false);
  });

  it('returns bilingual role labels', () => {
    expect(roleLabel('TELLER', 'en')).toBe('Teller');
    expect(roleLabel('TELLER', 'ne')).toBe('टेलर (काउन्टर)');
    expect(roleLabel('SUPER_ADMIN', 'en')).toBe('Super Admin');
    expect(roleLabel('SUPER_ADMIN', 'ne')).toBe('सुपर प्रशासक');
  });
});
