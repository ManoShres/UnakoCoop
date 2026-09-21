import { create } from 'zustand';
import { Member, UserRole } from '../types';
import { INITIAL_MEMBERS } from '../data/mockData';

interface AuthState {
  role: UserRole;
  currentMember: Member | null;
  theme: 'light' | 'dark';
  setRole: (role: UserRole) => void;
  setCurrentMember: (member: Member | null) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  switchToPreset: (preset: 'verified-member' | 'pending-member' | 'admin' | 'guest') => void;
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
  role: 'MEMBER',
  currentMember: INITIAL_MEMBERS[0], // Ram Bahadur Shrestha (Verified)
  theme: initialTheme,
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
}));
