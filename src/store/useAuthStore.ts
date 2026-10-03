import { create } from 'zustand';
import { Employee, EmployeeAccessRole, Member, UserRole } from '../types';
import { INITIAL_MEMBERS } from '../data/mockData';
import { INITIAL_EMPLOYEES } from './initialData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { restoreMemberSession } from '../services/memberAuthService';
import { rowToEmployee } from '../services/employeeService';

export const isDemoMode = (): boolean => {
  return import.meta.env.VITE_DEMO_MODE === 'true';
};

interface AuthState {
  role: UserRole;
  currentMember: Member | null;
  currentEmployee: Employee | null;
  staffRole: EmployeeAccessRole | null;
  theme: 'light' | 'dark';
  /** True until the persisted Supabase session (if any) is resolved on boot. */
  authLoading: boolean;
  setRole: (role: UserRole) => void;
  setCurrentMember: (member: Member | null) => void;
  setCurrentEmployee: (employee: Employee | null) => void;
  setStaffRole: (staffRole: EmployeeAccessRole | null) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  switchToPreset: (preset: 'verified-member' | 'pending-member' | 'admin' | 'guest') => void;
  /** Resolves the persisted Supabase session into a member / staff / guest role. */
  initAuth: () => Promise<void>;
  /** Stores a freshly authenticated member (live mode login). */
  signInMember: (member: Member) => void;
  /** Stores a freshly authenticated employee (live/staff mode login). */
  signInStaff: (employee: Employee) => void;
  signOut: () => Promise<void>;
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('unako_theme');
    if (saved === 'dark' || saved === 'light') {
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return saved;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      return 'dark';
    }
    document.documentElement.classList.remove('dark');
  }
  return 'light';
};

const initialTheme = getInitialTheme();

// In demo mode (VITE_DEMO_MODE === 'true'), boot as verified member for easy previewing.
// In standard/production mode, boot securely as GUEST (no credentials or auto-login).
const runningDemo = isDemoMode();

export const useAuthStore = create<AuthState>((set, get) => ({
  role: runningDemo ? 'MEMBER' : 'GUEST',
  currentMember: runningDemo ? INITIAL_MEMBERS[0] : null,
  currentEmployee: null,
  staffRole: null,
  theme: initialTheme,
  authLoading: isSupabaseConfigured(),
  setRole: (role) => set({ role }),
  setCurrentMember: (currentMember) => set({ currentMember }),
  setCurrentEmployee: (currentEmployee) => set({ currentEmployee, staffRole: currentEmployee?.accessRole ?? null }),
  setStaffRole: (staffRole) => set({ staffRole }),
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('unako_theme', next);
    }
    set({ theme: next });
  },
  setTheme: (theme: 'light' | 'dark') => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('unako_theme', theme);
    }
    set({ theme });
  },
  switchToPreset: (preset) => {
    switch (preset) {
      case 'verified-member':
        set({
          role: 'MEMBER',
          currentMember: INITIAL_MEMBERS[0],
          currentEmployee: null,
          staffRole: null,
        });
        break;
      case 'pending-member':
        set({
          role: 'MEMBER',
          currentMember: INITIAL_MEMBERS[1],
          currentEmployee: null,
          staffRole: null,
        });
        break;
      case 'admin':
        set({
          role: 'ADMIN',
          currentMember: null,
          currentEmployee: INITIAL_EMPLOYEES[0] ?? null,
          staffRole: INITIAL_EMPLOYEES[0]?.accessRole ?? 'SUPER_ADMIN',
        });
        break;
      case 'guest':
        set({
          role: 'GUEST',
          currentMember: null,
          currentEmployee: null,
          staffRole: null,
        });
        break;
    }
  },
  initAuth: async () => {
    // Offline mode: nothing to restore from Supabase.
    if (!isSupabaseConfigured() || !supabase) {
      set({ authLoading: false });
      return;
    }
    try {
      // 1. Try restoring member session
      const { data, error } = await restoreMemberSession();
      if (!error && data) {
        set({
          role: 'MEMBER',
          currentMember: data,
          currentEmployee: null,
          staffRole: null,
          authLoading: false,
        });
        return;
      }

      // 2. Check if authenticated user is linked to an ACTIVE employee row (S1 / S2)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const { data: empRow, error: empErr } = await supabase
          .from('employees')
          .select('*')
          .eq('auth_user_id', sessionData.session.user.id)
          .eq('status', 'ACTIVE')
          .maybeSingle();

        if (!empErr && empRow) {
          const emp = rowToEmployee(empRow);
          set({
            role: 'ADMIN',
            currentMember: null,
            currentEmployee: emp,
            staffRole: emp.accessRole,
            authLoading: false,
          });
          return;
        }
      }

      // 3. Fallback: Authenticated without an active employee or member row
      // Secure default: GUEST (Never escalate arbitrary unlinked users to ADMIN!)
      set({
        role: 'GUEST',
        currentMember: null,
        currentEmployee: null,
        staffRole: null,
        authLoading: false,
      });
    } catch {
      set({
        role: 'GUEST',
        currentMember: null,
        currentEmployee: null,
        staffRole: null,
        authLoading: false,
      });
    }
  },
  signInMember: (member) =>
    set({
      role: 'MEMBER',
      currentMember: member,
      currentEmployee: null,
      staffRole: null,
      authLoading: false,
    }),
  signInStaff: (employee) =>
    set({
      role: 'ADMIN',
      currentMember: null,
      currentEmployee: employee,
      staffRole: employee.accessRole,
      authLoading: false,
    }),
  signOut: async () => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    set({
      role: 'GUEST',
      currentMember: null,
      currentEmployee: null,
      staffRole: null,
    });
  },
}));
