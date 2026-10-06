import { create } from 'zustand';
import { Employee, EmployeeAccessRole, Member, UserRole } from '../types';
import { INITIAL_MEMBERS } from '../data/mockData';
import { INITIAL_EMPLOYEES } from './initialData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { restoreMemberSession } from '../services/memberAuthService';
import { fetchActiveEmployeeByAuthUserId } from '../services/employeeService';

export const isDemoMode = (): boolean => {
  return import.meta.env.VITE_DEMO_MODE === 'true';
};

/**
 * Privileged demo presets (the credential-less ADMIN / SUPER_ADMIN viewport
 * switch) are compiled into development builds only.
 *
 * `import.meta.env.DEV` is statically replaced with `false` by Vite for
 * production builds, so in a shipped bundle this gate is permanently closed and
 * `switchToPreset('admin')` can never mint an ADMIN session. It is read at call
 * time (not at module load) so the behaviour is testable.
 */
export const isPrivilegedPresetEnabled = (): boolean => import.meta.env.DEV === true;

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

// In demo mode (VITE_DEMO_MODE === 'true'), a *development* build boots as a
// verified member for easy previewing. Production builds (import.meta.env.DEV
// === false) always boot securely as GUEST - the demo auto-login is compiled
// out so a shipped bundle can never contain a credential-less session.
const runningDemo = import.meta.env.DEV === true && isDemoMode();

const CLEARED_SESSION = {
  role: 'GUEST' as UserRole,
  currentMember: null,
  currentEmployee: null,
  staffRole: null,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  role: runningDemo ? 'MEMBER' : 'GUEST',
  currentMember: runningDemo ? INITIAL_MEMBERS[0] : null,
  currentEmployee: null,
  staffRole: null,
  theme: initialTheme,
  authLoading: isSupabaseConfigured(),
  setRole: (role) => {
    // Fail closed: an ADMIN session must always carry a resolved staff role.
    // Raw promotion without a verified staff record is ignored; use
    // signInStaff() (or the development-only preset) instead.
    if (role === 'ADMIN' && !get().staffRole) return;
    set({ role });
  },
  setCurrentMember: (currentMember) => set({ currentMember }),
  setCurrentEmployee: (currentEmployee) => {
    const staffRole = currentEmployee?.accessRole ?? null;
    // Clearing the employee link must also drop ADMIN authority.
    if (!staffRole && get().role === 'ADMIN') {
      set(CLEARED_SESSION);
      return;
    }
    set({ currentEmployee, staffRole });
  },
  setStaffRole: (staffRole) => {
    // Clearing the staff role while holding ADMIN must demote the session.
    if (!staffRole && get().role === 'ADMIN') {
      set(CLEARED_SESSION);
      return;
    }
    set({ staffRole });
  },
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
    // 'guest' is a de-escalation (logout) and must always be available. Every
    // other preset mints a credential-less session, so it is a development-only
    // affordance and fails closed (no-op) in a production build.
    if (preset !== 'guest' && !isPrivilegedPresetEnabled()) return;

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
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        const { data: emp, error: empErr } = await fetchActiveEmployeeByAuthUserId(userId);

        // A linked employee without a resolved access role is not staff admin:
        // fall through to the secure GUEST default instead of a null staffRole.
        if (!empErr && emp && emp.accessRole) {
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
  signInStaff: (employee) => {
    // Fail closed: an employee record without a resolved access role can never
    // become an ADMIN session (staffRole would otherwise be left null).
    if (!employee?.accessRole) {
      set(CLEARED_SESSION);
      return;
    }
    set({
      role: 'ADMIN',
      currentMember: null,
      currentEmployee: employee,
      staffRole: employee.accessRole,
      authLoading: false,
    });
  },
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
