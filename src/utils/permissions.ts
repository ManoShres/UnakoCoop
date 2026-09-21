/**
 * Role-Based Access Control (RBAC) for Unako SACCOS staff portal.
 *
 * Tellers are the primary counter data-entry operators (cash receipts, mother
 * group meeting collections, deposit posting), accountants own reconciliation
 * and trading ledgers, and managers/admins retain supervisory oversight.
 */

import type { EmployeeAccessRole } from '../types';

export type Permission =
  | 'manage_employees'
  | 'manage_members'
  | 'manage_loans'
  | 'manage_savings'
  | 'process_transactions'
  | 'view_reports'
  | 'manage_mother_groups'
  | 'record_mother_group_meetings'
  | 'record_deposits'
  | 'record_trading'
  | 'reconcile_entries'
  | 'manage_settings'
  | 'export_data'
  | 'view_audit_logs';

export const ROLE_LABELS: Record<EmployeeAccessRole, { ne: string; en: string }> = {
  SUPER_ADMIN: { ne: 'सुपर प्रशासक', en: 'Super Admin' },
  BRANCH_MANAGER: { ne: 'शाखा प्रबन्धक', en: 'Branch Manager' },
  ACCOUNTANT: { ne: 'लेखापाल', en: 'Accountant' },
  TELLER: { ne: 'टेलर (काउन्टर)', en: 'Teller' },
  LOAN_OFFICER: { ne: 'ऋण अधिकृत', en: 'Loan Officer' },
  FIELD_OFFICER: { ne: 'क्षेत्र अधिकृत', en: 'Field Officer' },
};

export const ROLE_PERMISSIONS: Record<EmployeeAccessRole, Permission[]> = {
  SUPER_ADMIN: [
    'manage_employees',
    'manage_members',
    'manage_loans',
    'manage_savings',
    'process_transactions',
    'view_reports',
    'manage_mother_groups',
    'record_mother_group_meetings',
    'record_deposits',
    'record_trading',
    'reconcile_entries',
    'manage_settings',
    'export_data',
    'view_audit_logs',
  ],
  BRANCH_MANAGER: [
    'manage_members',
    'manage_loans',
    'manage_savings',
    'process_transactions',
    'view_reports',
    'manage_mother_groups',
    'record_mother_group_meetings',
    'record_deposits',
    'record_trading',
    'reconcile_entries',
    'export_data',
    'view_audit_logs',
  ],
  ACCOUNTANT: [
    'manage_savings',
    'view_reports',
    'record_trading',
    'reconcile_entries',
    'export_data',
    'view_audit_logs',
  ],
  TELLER: [
    'process_transactions',
    'record_mother_group_meetings',
    'record_deposits',
    'view_reports',
  ],
  LOAN_OFFICER: ['manage_loans', 'process_transactions', 'view_reports'],
  FIELD_OFFICER: ['record_mother_group_meetings', 'view_reports'],
};

/** Returns true when the supplied role holds the requested permission. */
export const hasPermission = (
  role: EmployeeAccessRole | undefined | null,
  permission: Permission
): boolean => {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};

/** Convenience helper: does a role hold at least one of the permissions? */
export const hasAnyPermission = (
  role: EmployeeAccessRole | undefined | null,
  permissions: Permission[]
): boolean => permissions.some((permission) => hasPermission(role, permission));

/**
 * Teller counter pages: reachable by roles that may post counter cash.
 */
export const canRecordDeposits = (role?: EmployeeAccessRole | null): boolean =>
  hasPermission(role, 'record_deposits') || hasPermission(role, 'record_mother_group_meetings');

/** Reconciliation & trading ledgers belong to accountants, managers and admins. */
export const canReconcile = (role?: EmployeeAccessRole | null): boolean =>
  hasPermission(role, 'reconcile_entries');

export const canRecordTrading = (role?: EmployeeAccessRole | null): boolean =>
  hasPermission(role, 'record_trading');

/** Mother group setup (creating/editing the group itself) is supervisory work. */
export const canManageMotherGroups = (role?: EmployeeAccessRole | null): boolean =>
  hasPermission(role, 'manage_mother_groups');

export const roleLabel = (
  role: EmployeeAccessRole,
  lang: 'ne' | 'en'
): string => ROLE_LABELS[role][lang];
