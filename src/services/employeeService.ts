import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Employee, EmployeeAccessRole, EmployeeStatus } from '../types';

/** Snake-case shape of the `public.employees` table (see supabase/schema.sql). */
export interface EmployeeRow {
  id: string;
  employee_no: string;
  name: string;
  name_nepali: string | null;
  designation: string;
  designation_nepali: string | null;
  department: string;
  branch: string;
  phone: string;
  email: string;
  joined_date: string;
  status: EmployeeStatus;
  access_role: EmployeeAccessRole;
  assigned_wards: string[] | null;
  avatar_url: string;
  notes: string | null;
}

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

const NOT_CONFIGURED =
  'Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).';

export const rowToEmployee = (row: EmployeeRow): Employee => ({
  id: row.id,
  employeeNo: row.employee_no,
  name: row.name,
  nameNepali: row.name_nepali || undefined,
  designation: row.designation,
  designationNepali: row.designation_nepali || undefined,
  department: row.department,
  branch: row.branch,
  phone: row.phone,
  email: row.email,
  joinedDate: row.joined_date,
  status: row.status,
  accessRole: row.access_role,
  assignedWards: row.assigned_wards || [],
  avatarUrl: row.avatar_url,
  notes: row.notes || undefined,
});

export const employeeToRow = (employee: Omit<Employee, 'id'>): Omit<EmployeeRow, 'id'> => ({
  employee_no: employee.employeeNo,
  name: employee.name,
  name_nepali: employee.nameNepali || null,
  designation: employee.designation,
  designation_nepali: employee.designationNepali || null,
  department: employee.department,
  branch: employee.branch,
  phone: employee.phone,
  email: employee.email,
  joined_date: employee.joinedDate,
  status: employee.status,
  access_role: employee.accessRole,
  assigned_wards: employee.assignedWards,
  avatar_url: employee.avatarUrl,
  notes: employee.notes || null,
});

/** Converts a partial Employee patch into only the columns that are present. */
export const employeePatchToRow = (updates: Partial<Employee>): Record<string, unknown> => {
  const row: Record<string, unknown> = {};
  if (updates.employeeNo !== undefined) row.employee_no = updates.employeeNo;
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.nameNepali !== undefined) row.name_nepali = updates.nameNepali || null;
  if (updates.designation !== undefined) row.designation = updates.designation;
  if (updates.designationNepali !== undefined)
    row.designation_nepali = updates.designationNepali || null;
  if (updates.department !== undefined) row.department = updates.department;
  if (updates.branch !== undefined) row.branch = updates.branch;
  if (updates.phone !== undefined) row.phone = updates.phone;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.joinedDate !== undefined) row.joined_date = updates.joinedDate;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.accessRole !== undefined) row.access_role = updates.accessRole;
  if (updates.assignedWards !== undefined) row.assigned_wards = updates.assignedWards;
  if (updates.avatarUrl !== undefined) row.avatar_url = updates.avatarUrl;
  if (updates.notes !== undefined) row.notes = updates.notes || null;
  return row;
};

export const isSupabaseReady = isSupabaseConfigured;

/** Loads the HR registry, newest first. */
export const fetchEmployeesFromSupabase = async (): Promise<ServiceResult<Employee[]>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: (data as EmployeeRow[]).map(rowToEmployee), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

/** Inserts one employee and returns the row persisted by PostgreSQL. */
export const createEmployeeInSupabase = async (
  employee: Omit<Employee, 'id'>
): Promise<ServiceResult<Employee>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  try {
    const { data, error } = await supabase
      .from('employees')
      .insert(employeeToRow(employee))
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: rowToEmployee(data as EmployeeRow), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

/** Patches an employee by its unique business key (employee_no). */
export const updateEmployeeInSupabase = async (
  employeeNo: string,
  updates: Partial<Employee>
): Promise<ServiceResult<Employee>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  try {
    const { data, error } = await supabase
      .from('employees')
      .update(employeePatchToRow(updates))
      .eq('employee_no', employeeNo)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: rowToEmployee(data as EmployeeRow), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

/** Deletes an employee by its unique business key (employee_no). */
export const deleteEmployeeInSupabase = async (
  employeeNo: string
): Promise<ServiceResult<true>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  try {
    const { error } = await supabase.from('employees').delete().eq('employee_no', employeeNo);
    if (error) return { data: null, error: error.message };
    return { data: true, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

/** Real staff authentication through Supabase Auth (email + password). */
export const signInStaffWithSupabase = async (
  email: string,
  password: string
): Promise<ServiceResult<{ userId: string | null; email: string | null }>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { data: null, error: error.message };
    return {
      data: { userId: data.user?.id ?? null, email: data.user?.email ?? null },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown network error.' };
  }
};

export const signOutOfSupabase = async (): Promise<void> => {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore – the local demo session still ends
  }
};
