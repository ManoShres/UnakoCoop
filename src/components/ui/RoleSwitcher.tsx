import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Shield, UserCheck, Clock, Globe, Sun, Moon } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';

export const RoleSwitcher: React.FC = () => {
  const { role, currentMember, switchToPreset, theme, toggleTheme } = useAuthStore();
  const navigate = useNavigate();

  const handleSwitch = (preset: 'verified-member' | 'pending-member' | 'admin' | 'guest') => {
    switchToPreset(preset);
    if (preset === 'admin') {
      navigate('/admin');
    } else if (preset === 'verified-member') {
      navigate('/member');
    } else if (preset === 'pending-member') {
      navigate('/member/verification');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="bg-[#0b1b0e] text-slate-200 text-xs px-4 py-1.5 border-b border-emerald-950 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="inline-block size-2 rounded-full bg-[#13ec37] animate-pulse"></span>
        <span className="font-semibold text-slate-300">DEMO VIEWPORT MODE:</span>
        <span className="font-bold text-[#13ec37] uppercase">
          {role === 'ADMIN'
            ? 'Administrator'
            : role === 'MEMBER'
            ? `${currentMember?.status === 'VERIFIED' ? 'Verified Member' : 'Pending Member'} (${currentMember?.name})`
            : 'Public / Guest'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleSwitch('verified-member')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors font-medium ${
              role === 'MEMBER' && currentMember?.status === 'VERIFIED'
                ? 'bg-[#13ec37] text-black font-bold'
                : 'bg-emerald-900/40 hover:bg-emerald-900/70 text-slate-300'
            }`}
            title="Switch to Verified Member perspective"
          >
            <UserCheck className="size-3.5" />
            <span>Ram (Verified)</span>
          </button>

          <button
            onClick={() => handleSwitch('pending-member')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors font-medium ${
              role === 'MEMBER' && currentMember?.status === 'PENDING'
                ? 'bg-amber-400 text-black font-bold'
                : 'bg-emerald-900/40 hover:bg-emerald-900/70 text-slate-300'
            }`}
            title="Switch to Pending Member perspective"
          >
            <Clock className="size-3.5" />
            <span>Sita (Pending Review)</span>
          </button>

          <button
            onClick={() => handleSwitch('admin')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors font-medium ${
              role === 'ADMIN'
                ? 'bg-blue-500 text-white font-bold'
                : 'bg-emerald-900/40 hover:bg-emerald-900/70 text-slate-300'
            }`}
            title="Switch to Credit Committee Admin perspective"
          >
            <Shield className="size-3.5" />
            <span>Coop Admin</span>
          </button>

          <button
            onClick={() => handleSwitch('guest')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors font-medium ${
              role === 'GUEST'
                ? 'bg-slate-200 text-black font-bold'
                : 'bg-emerald-900/40 hover:bg-emerald-900/70 text-slate-300'
            }`}
            title="Switch to Public Landing perspective"
          >
            <Globe className="size-3.5" />
            <span>Public</span>
          </button>
        </div>

        <div className="h-4 w-px bg-emerald-900/60"></div>

        {/* Global Language Switcher */}
        <LanguageToggle variant="compact" />

        <div className="h-4 w-px bg-emerald-900/60"></div>

        <button
          onClick={toggleTheme}
          className="p-1 rounded hover:bg-emerald-900/40 text-slate-300 hover:text-white"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? <Moon className="size-3.5" /> : <Sun className="size-3.5 text-amber-300" />}
        </button>
      </div>
    </div>
  );
};
