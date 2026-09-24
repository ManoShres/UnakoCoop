import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  ArrowLeftRight,
  PiggyBank,
  FileText,
  Vote,
  Menu,
  X,
  BookOpen,
  Keyboard,
  ShieldCheck,
  Bell,
  User,
  LogOut,
  Headphones,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useDesignStore } from '../../store/useDesignStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { signOutOfSupabase } from '../../services/employeeService';
import { LanguageToggle } from '../ui/LanguageToggle';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { KeyboardShortcutGuide } from '../ui/KeyboardShortcutGuide';

export function MemberLayout() {
  const { lang, t, fmtDigits } = useLanguageStore();
  const { showShortcutGuide, toggleShortcutGuide, closeShortcutGuide } = useKeyboardShortcuts({ context: 'MEMBER' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { role, currentMember, authLoading, switchToPreset } = useAuthStore();
  const customLogoUrl = useDesignStore((s) => s.settings.customLogoUrl);
  const features = useDesignStore((s) => s.settings.features);
  const logoUrl = customLogoUrl || '/unako-logo.png';

  const handleLogout = () => {
    void signOutOfSupabase();
    switchToPreset('guest');
    navigate('/login');
  };

  if (isSupabaseConfigured()) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 animate-pulse">
            {t('सत्र जाँच गर्दै…', 'Checking session…')}
          </span>
        </div>
      );
    }
    if (role !== 'MEMBER' || !currentMember) {
      return <Navigate to="/login" replace />;
    }
  }

  const navItems = [
    {
      to: '/member',
      label: t('ड्यासबोर्ड', 'Dashboard'),
      icon: LayoutDashboard,
      end: true,
      show: true,
    },
    {
      to: '/member/my-accounts-passbook',
      label: t('खाता तथा पासबुक', 'My Accounts & Passbook'),
      icon: Wallet,
      end: false,
      show: true,
    },
    {
      to: '/member/loan-portfolio-repayments',
      label: t('ऋण तथा किस्ता भुक्तानी', 'Loan Portfolio & Repayments'),
      icon: CreditCard,
      end: false,
      show: true,
    },
    {
      to: '/member/transfers-payments',
      label: t('रकम स्थानान्तरण र भुक्तानी', 'Transfers & Payments'),
      icon: ArrowLeftRight,
      end: false,
      show: features.enableSavingsTransfer,
    },
    {
      to: '/member/shares-fixed-deposits',
      label: t('शेयर तथा मुद्दती निक्षेप', 'Shares & Fixed Deposits'),
      icon: PiggyBank,
      end: false,
      show: true,
    },
    {
      to: '/member/annual-statement',
      label: t('वार्षिक वित्तीय विवरण', 'Annual Statement & Tax'),
      icon: FileText,
      end: false,
      show: true,
    },
    {
      to: '/member/cooperative-governance-support',
      label: t('सहकारी सुशासन र सहयोग', 'Governance & Support'),
      icon: Vote,
      end: false,
      show: features.enableEBallot || features.enableAgmPass || features.enableGrievance,
    },
  ].filter((item) => item.show);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 flex items-center justify-between px-4 print:hidden shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={t('मेनु टगल गर्नुहोस्', 'Toggle Navigation')}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Unako Logo" className="h-8 w-auto object-contain" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {features.enableSystemTour && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-system-tutorial'))}
              className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-colors"
              title={t('प्रणाली प्रयोग निर्देशिका', 'System Guide')}
            >
              <BookOpen className="size-4" />
            </button>
          )}
          <LanguageToggle variant="compact" />
          <ThemeToggle variant="compact" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors"
            title={t('लगआउट', 'Log Out')}
          >
            <LogOut className="size-3.5" />
            <span>{t('लगआउट', 'Exit')}</span>
          </button>
          <Link
            to="/member/profile"
            className="size-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs"
            title={currentMember?.name || 'Member Profile'}
          >
            {currentMember?.name ? currentMember.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'HP'}
          </Link>
        </div>
      </div>

      {/* Desktop / Responsive Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 print:hidden bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 h-screen flex flex-col justify-between shrink-0 shadow-sm ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Logo & Cooperative Identity */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center justify-center py-1">
              <img src={logoUrl} alt="Unako Cooperative Logo" className="h-10 w-auto object-contain" />
            </div>

            {/* Member Card Widget in Sidebar */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {currentMember?.name ? currentMember.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'HP'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentMember?.name || 'Member'}</p>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">{currentMember?.memberNo || 'UKO-2070'}</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                {t('सक्रिय', 'Active')}
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                CBS Live
              </span>
              <span className="truncate">
                {fmtDigits(t(currentMember?.addressNepali || currentMember?.address || 'चैनपुर, गढवा-५', currentMember?.address || 'Chainpur, Gadhwa-5'))}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Member Helpdesk & Support Card */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2 shrink-0 bg-white dark:bg-slate-900">
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl flex items-center gap-3">
              <div className="size-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Headphones className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('सदस्य सहायता कक्ष', 'Member Desk')}</p>
                <p className="text-[11px] text-slate-500 font-mono">082-412055</p>
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 cursor-pointer"
              >
                {t('च्याट', 'Chat')}
              </button>
            </div>

            {/* Prominent Sidebar Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer shadow-xs"
            >
              <LogOut className="size-4" />
              <span>{t('खाताबाट बाहिरिनुहोस्', 'Log Out of Account')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen print:pl-0 print:min-h-0">
        {/* Sticky Desktop Header */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-30 flex items-center justify-between px-4 sm:px-8 print:hidden shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {t(
                'उनको बचत तथा ऋण सहकारी संस्था लि. | सदस्य पोर्टल',
                'Unako Saving & Credit Cooperative Ltd. | Member Portal'
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* System Tutorial & Guide Button */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-system-tutorial'))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-white hover:bg-emerald-600 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer"
              title={t('प्रणाली प्रयोग निर्देशिका', 'System Tutorial & Guide')}
            >
              <BookOpen className="size-3.5" />
              <span className="hidden sm:inline">{t('निर्देशिका', 'Guide')}</span>
            </button>

            {/* Keyboard Shortcuts Button */}
            <button
              type="button"
              onClick={toggleShortcutGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title={t('किबोर्ड सर्टकटहरू (?)', 'Keyboard Shortcuts (?)')}
            >
              <Keyboard className="size-3.5" />
              <span className="hidden sm:inline">{t('सर्टकट (?)', 'Shortcuts (?)')}</span>
            </button>

            {/* Global Language Toggle Component */}
            <LanguageToggle variant="compact" />
            <ThemeToggle variant="compact" />

            {/* KYC Status Badge */}
            <Link
              to="/member/profile"
              className="hidden md:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 hover:shadow-xs transition-shadow"
            >
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{t('केवाईसी प्रमाणित', 'KYC Verified')}</span>
            </Link>

            {/* Notification Bell */}
            <Link
              to="/member/notifications"
              className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 flex items-center justify-center"
              title={t('सूचनाहरू', 'Notifications')}
            >
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500"></span>
            </Link>

            {/* Member Profile Avatar */}
            <Link
              to="/member/profile"
              className="size-8 rounded-full bg-emerald-600 flex items-center justify-center text-white hover:ring-2 hover:ring-emerald-400/40 transition-all shadow-xs"
              title={currentMember?.name || 'Member Profile'}
            >
              <User className="size-4" />
            </Link>

            {/* Header Direct Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
              title={t('लगआउट गर्नुहोस्', 'Log Out of Member Portal')}
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">{t('लगआउट', 'Log Out')}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="w-full pt-16 bg-slate-50 dark:bg-slate-950 min-h-screen print:pt-0 print:min-h-0 print:bg-white">
          <Outlet context={{ lang }} />
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/60 z-30 backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Keyboard Shortcut Guide Modal */}
      <KeyboardShortcutGuide isOpen={showShortcutGuide} onClose={closeShortcutGuide} />
    </div>
  );
}
