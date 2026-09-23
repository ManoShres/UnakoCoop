import { create } from 'zustand';
import { Member, UserRole } from '../types';
import { INITIAL_MEMBERS } from '../data/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { restoreMemberSession } from '../services/memberAuthService';

interface AuthState {
  role: UserRole;
  currentMember: Member | null;
  theme: 'light' | 'dark';
  /** True until the persisted Supabase session (if any) is resolved on boot. */
  authLoading: boolean;
  setRole: (role: UserRole) => void;
  setCurrentMember: (member: Member | null) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  switchToPreset: (preset: 'verified-member' | 'pending-member' | 'admin' | 'guest') => void;
  /** Resolves the persisted Supabase session into a member / staff / guest role. */
  initAuth: () => Promise<void>;
  /** Stores a freshly authenticated member (live mode login). */
  signInMember: (member: Member) => void;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  // Offline demo boots straight into the verified-member perspective; live
  // (Supabase) mode overrides this in initAuth() once the session resolves.
  role: 'MEMBER',
  currentMember: INITIAL_MEMBERS[0], // Ram Bahadur Shrestha (Verified)
  theme: initialTheme,
  authLoading: isSupabaseConfigured(),
  setRole: (role) => set({ role }),
  setCurrentMember: (currentMember) => set({ currentMember }),
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
        set({ role: 'MEMBER', currentMember: INITIAL_MEMBERS[0] });
        break;
      case 'pending-member':
        set({ role: 'MEMBER', currentMember: INITIAL_MEMBERS[1] });
        break;
      case 'admin':
        set({ role: 'ADMIN', currentMember: null });
        break;
      case 'guest':
        set({ role: 'GUEST', currentMember: null });
        break;
    }
  },
  initAuth: async () => {
    // Offline demo: nothing to restore.
    if (!isSupabaseConfigured() || !supabase) {
      set({ authLoading: false });
      return;
    }
    try {
      const { data, error } = await restoreMemberSession();
      if (!error && data) {
        set({ role: 'MEMBER', currentMember: data, authLoading: false });
        return;
      }
      // Authenticated without a linked member row => persisted staff session.
      const { data: sessionData } = await supabase.auth.getSession();
      set({
        role: sessionData.session ? 'ADMIN' : 'GUEST',
        currentMember: null,
        authLoading: false,
      });
    } catch {
      set({ role: 'GUEST', currentMember: null, authLoading: false });
    }
  },
  signInMember: (member) =>
    set({ role: 'MEMBER', currentMember: member, authLoading: false }),
}));
