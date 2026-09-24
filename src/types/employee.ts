/**
 * Employee, Staff, and Field Officer Domain Types
 */

export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';

export type EmployeeAccessRole =
  | 'SUPER_ADMIN'
  | 'BRANCH_MANAGER'
  | 'LOAN_OFFICER'
  | 'TELLER'
  | 'ACCOUNTANT'
  | 'FIELD_OFFICER';

export interface Employee {
  id: string;
  employeeNo: string; // e.g., 'EMP-2081-0042'
  name: string;
  nameNepali?: string;
  designation: string; // e.g., 'Senior Field Supervisor'
  designationNepali?: string;
  department: string;
  branch: string;
  phone: string;
  email: string;
  joinedDate: string;
  status: EmployeeStatus;
  accessRole: EmployeeAccessRole;
  assignedWards: string[];
  avatarUrl: string;
  notes?: string;
}

export interface FieldOfficer {
  id: string;
  name: string;
  nameNepali?: string;
  phone: string;
  email: string;
  role: string;
  roleNepali?: string;
  assignedWards: string[];
  activeUnit: string;
  activeUnitNepali?: string;
  avatarUrl: string;
}
