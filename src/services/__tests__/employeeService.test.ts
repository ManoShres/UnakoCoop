import { describe, it, expect } from 'vitest';
import { EmployeeRow, rowToEmployee, employeeToRow, employeePatchToRow } from '../employeeService';
import { Employee } from '../../types';

const sampleRow: EmployeeRow = {
  id: '7f9c2d10-4b6a-4f2e-9c31-0a1b2c3d4e5f',
  employee_no: 'EMP-2081-0042',
  name: 'Sita Chaudhary',
  name_nepali: 'सीता चौधरी',
  designation: 'Senior Field Supervisor',
  designation_nepali: null,
  department: 'Field Operations',
  branch: 'Gadhwa Main Branch',
  phone: '98578-40123',
  email: 'sita.chaudhary@unako.coop.np',
  joined_date: '2021-07-18',
  status: 'ACTIVE',
  access_role: 'FIELD_OFFICER',
  assigned_wards: ['Ward 4', 'Ward 5'],
  avatar_url: '/assets/kyc/avatar_officer.png',
  notes: null,
};

const sampleEmployee: Omit<Employee, 'id'> = {
  employeeNo: 'EMP-2081-0042',
  name: 'Sita Chaudhary',
  designation: 'Senior Field Supervisor',
  department: 'Field Operations',
  branch: 'Gadhwa Main Branch',
  phone: '98578-40123',
  email: 'sita.chaudhary@unako.coop.np',
  joinedDate: '2021-07-18',
  status: 'ACTIVE',
  accessRole: 'FIELD_OFFICER',
  assignedWards: ['Ward 4', 'Ward 5'],
  avatarUrl: '/assets/kyc/avatar_officer.png',
};

describe('Supabase employee row <-> Employee domain model mapping', () => {
  it('maps a PostgreSQL row into the Employee domain model', () => {
    const employee = rowToEmployee(sampleRow);

    expect(employee.id).toBe(sampleRow.id);
    expect(employee.employeeNo).toBe('EMP-2081-0042');
    expect(employee.joinedDate).toBe('2021-07-18');
    expect(employee.accessRole).toBe('FIELD_OFFICER');
    expect(employee.assignedWards).toEqual(['Ward 4', 'Ward 5']);
    expect(employee.nameNepali).toBe('सीता चौधरी');
    // nullable columns collapse into optional fields
    expect(employee.designationNepali).toBeUndefined();
    expect(employee.notes).toBeUndefined();
  });

  it('maps an Employee into insertable snake_case columns with explicit nulls', () => {
    const row = employeeToRow(sampleEmployee);

    expect(row.employee_no).toBe('EMP-2081-0042');
    expect(row.access_role).toBe('FIELD_OFFICER');
    expect(row.assigned_wards).toEqual(['Ward 4', 'Ward 5']);
    expect(row.joined_date).toBe('2021-07-18');
    // optional values become null so PostgreSQL clears/accepts them
    expect(row.name_nepali).toBeNull();
    expect(row.notes).toBeNull();
  });

  it('patches only the columns present in a partial employee update', () => {
    const patch = employeePatchToRow({ status: 'ON_LEAVE', designation: 'Head Teller' });

    expect(patch).toEqual({ status: 'ON_LEAVE', designation: 'Head Teller' });
    expect('name' in patch).toBe(false);
    expect('employee_no' in patch).toBe(false);
  });

  it('normalises empty optional strings to null on update', () => {
    const patch = employeePatchToRow({ nameNepali: '', notes: '' });

    expect(patch.name_nepali).toBeNull();
    expect(patch.notes).toBeNull();
  });
});
