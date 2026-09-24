import { StateCreator } from 'zustand';
import { Employee } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  fetchEmployeesFromSupabase,
  createEmployeeInSupabase,
  updateEmployeeInSupabase,
  deleteEmployeeInSupabase,
} from '../../services/employeeService';
import { getStoredEmployees, persistEmployees } from '../initialData';
import { CoopState, EmployeeSlice } from '../storeTypes';

export const createEmployeeSlice: StateCreator<CoopState, [], [], EmployeeSlice> = (set, get) => ({
  employees: getStoredEmployees(),
  employeeSync: { source: isSupabaseConfigured() ? 'supabase' : 'local', state: 'idle' },

  addEmployee: (employeeData) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: 'emp-' + Date.now(),
    };
    const nextEmployees = [newEmployee, ...get().employees];
    persistEmployees(nextEmployees);
    set({ employees: nextEmployees });

    if (isSupabaseConfigured()) {
      void createEmployeeInSupabase(newEmployee).then(({ data, error }) => {
        if (error || !data) {
          set({
            employeeSync: {
              source: 'supabase',
              state: 'error',
              message: error || 'Supabase insert failed.',
            },
          });
          return;
        }
        // Reconcile the local temporary id with the PostgreSQL uuid row
        const reconciled = get().employees.map((emp) => (emp.id === newEmployee.id ? data : emp));
        persistEmployees(reconciled);
        set({ employees: reconciled, employeeSync: { source: 'supabase', state: 'synced' } });
      });
    }

    return newEmployee;
  },

  syncEmployees: async () => {
    if (!isSupabaseConfigured()) {
      set({ employeeSync: { source: 'local', state: 'idle' } });
      return;
    }

    set({ employeeSync: { source: 'supabase', state: 'syncing' } });
    const { data, error } = await fetchEmployeesFromSupabase();

    if (error || !data) {
      set({
        employeeSync: {
          source: 'supabase',
          state: 'error',
          message: error || 'Could not load employees from Supabase.',
        },
      });
      return;
    }

    persistEmployees(data);
    set({ employees: data, employeeSync: { source: 'supabase', state: 'synced' } });
  },

  updateEmployee: (employeeId, updates) => {
    const target = get().employees.find((emp) => emp.id === employeeId);
    const nextEmployees = get().employees.map((emp) =>
      emp.id === employeeId ? { ...emp, ...updates } : emp
    );
    persistEmployees(nextEmployees);
    set({ employees: nextEmployees });

    if (isSupabaseConfigured() && target) {
      void updateEmployeeInSupabase(target.employeeNo, updates).then(({ data, error }) => {
        if (error || !data) {
          set({
            employeeSync: {
              source: 'supabase',
              state: 'error',
              message: error || 'Supabase update failed.',
            },
          });
          return;
        }
        const reconciled = get().employees.map((emp) => (emp.id === employeeId ? data : emp));
        persistEmployees(reconciled);
        set({ employees: reconciled, employeeSync: { source: 'supabase', state: 'synced' } });
      });
    }
  },

  removeEmployee: (employeeId) => {
    const target = get().employees.find((emp) => emp.id === employeeId);
    const nextEmployees = get().employees.filter((emp) => emp.id !== employeeId);
    persistEmployees(nextEmployees);
    set({ employees: nextEmployees });

    if (isSupabaseConfigured() && target) {
      void deleteEmployeeInSupabase(target.employeeNo).then(({ error }) => {
        if (error) {
          set({
            employeeSync: {
              source: 'supabase',
              state: 'error',
              message: error || 'Supabase delete failed.',
            },
          });
          return;
        }
        set({ employeeSync: { source: 'supabase', state: 'synced' } });
      });
    }
  },
});
