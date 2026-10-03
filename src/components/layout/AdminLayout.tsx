import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, Navigate } from 'react-router-dom';
import { useDesignStore } from '../../store/useDesignStore';
import {
  Users,
  ShieldCheck,
  IdCard,
  PiggyBank,
  FileCheck,
  ArrowLeftRight,
  PieChart,
  Megaphone,
  Settings,
  Sparkles,
  BarChart3,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  MessageSquareQuote,
  BookOpen,
  Globe,
  UsersRound,
  TrendingUp,
  ScanSearch,
  Landmark,
  ShieldAlert,
  Banknote,
  Keyboard,
  Terminal,
  Smartphone,
} from 'lucide-react';

import { useCoopStore } from '../../store/useCoopStore';
import { useAuthStore } from '../../store/useAuthStore';
import { signOutOfSupabase } from '../../services/employeeService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LanguageToggle } from '../ui/LanguageToggle';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { KeyboardShortcutGuide } from '../ui/KeyboardShortcutGuide';
import { FastBankingTerminalModal } from '../admin/FastBankingTerminal';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { 
    showShortcutGuide, 
    toggleShortcutGuide, 
    closeShortcutGuide,
    showTerminal,
    toggleTerminal,
    closeTerminal
  } = useKeyboardShortcuts({ context: 'ADMIN' });
  const { members, applications, inquiries } = useCoopStore();
  const openMismatches = useCoopStore((s) =>
    s.reconciliationEntries.filter((entry) => entry.status === 'MISMATCH').length
  );
  const pendingDeposits = useCoopStore((s) =>
    s.motherGroupDeposits.filter((deposit) => deposit.status === 'PENDING').length
  );
  const { role, authLoading, switchToPreset, theme: storedTheme } = useAuthStore();
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, [storedTheme]);
  const { t } = useLanguageStore();

  const pendingMembersCount = members.filter((m) => m.status === 'PENDING' || m.status === 'ACTION_REQUIRED').length;
  const pendingLoansCount = applications.filter((a) => a.status === 'SUBMITTED' || a.status === 'UNDER_COMMITTEE_REVIEW').length;
  const customLogoUrl = useDesignStore((s) => s.settings.customLogoUrl);
  const logoUrl = customLogoUrl || '/unako-logo.png';
  const newInquiriesCount = inquiries.filter((i) => i.status === 'NEW').length;

  // Live (Supabase) mode: the admin console requires an authenticated staff
  // session. Offline demo keeps the original open-access behaviour.
  if (isSupabaseConfigured()) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-surface-canvas flex items-center justify-center">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant animate-pulse">
            {t('सत्र जाँच गर्दै…', 'Checking session…')}
          </span>
        </div>
      );
    }
    if (role !== 'ADMIN') {
      return <Navigate to="/login" replace />;
    }
  }

  const handleLogout = () => {
    void signOutOfSupabase();
    switchToPreset('guest');
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: t('कार्यकारी ड्यासबोर्ड', 'Executive Dashboard'), icon: BarChart3, end: true },
    { to: '/admin/members', label: t('सदस्य सूची तथा विवरण', 'Member Directory & KYC'), icon: Users },
    {
      to: '/admin/verifications',
      label: t('केवाईसी कागजात प्रमाणीकरण', 'KYC Document Queue'),
      icon: ShieldCheck,
      badge: pendingMembersCount > 0 ? pendingMembersCount : undefined,
    },
    { to: '/admin/savings', label: t('बचत खाता व्यवस्थापन', 'Savings & Passbooks'), icon: PiggyBank },
    { to: '/admin/teller-counter', label: t('काउन्टर नगद तथा भल्ट', 'Teller Cash & Vault Desk'), icon: Banknote },
    {
      to: '/admin/loans',
      label: t('ऋण तथा कर्जा समिति', 'Loans & Credit Queue'),
      icon: FileCheck,
      badge: pendingLoansCount > 0 ? pendingLoansCount : undefined,
    },
    { to: '/admin/loan-provisioning', label: t('कर्जा नोक्सानी व्यवस्था', 'Loan Loss Provisioning'), icon: ShieldAlert },
    { to: '/admin/transfers', label: t('कारोबार तथा गेटवे', 'Transfers & Gateways'), icon: ArrowLeftRight },
    { to: '/admin/shares', label: t('शेयर पूँजी तथा मुद्दती', 'Shares Capital & FD'), icon: PieChart },
    {
      to: '/admin/mother-groups',
      label: t('आमा समूह तथा संकलन', 'Mother Groups & Collection'),
      icon: UsersRound,
      badge: pendingDeposits > 0 ? pendingDeposits : undefined,
    },
    { to: '/admin/collection-entry', label: t('कलेक्सन प्रवेश', 'Collection Entry'), icon: TrendingUp, badge: pendingDeposits > 0 ? pendingDeposits : undefined },
    { to: '/admin/field-collector', label: t('फिल्ड संकलक मोड (Mobile)', 'Field Collector Mode'), icon: Smartphone },
    { to: '/admin/trading-pl', label: t('ट्रेडिङ नाफा नोक्सान', 'Trading Profit & Loss'), icon: TrendingUp },

    { to: '/admin/pearls-analysis', label: t('पर्ल्स विश्लेषण', 'PEARLS Analysis'), icon: Landmark },
    { to: '/admin/statutory-funds', label: t('वैधानिक जगेडा कोषहरू', 'Statutory Reserve Funds'), icon: Landmark },
    {
      to: '/admin/reconciliation',
      label: t('बैंक मिलान तथा भिन्नता', 'Reconciliation & Mismatch'),
      icon: ScanSearch,
      badge: openMismatches > 0 ? openMismatches : undefined,
    },
    { to: '/admin/announcements', label: t('सूचना तथा साधारण सभा', 'Announcements & AGM'), icon: Megaphone },
    {
      to: '/admin/inquiries',
      label: t('गुनासो तथा सोधपुछ', 'Inquiries & Grievances'),
      icon: MessageSquareQuote,
      badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
    },
    { to: '/admin/employees', label: t('कर्मचारी तथा एचआर निर्देशिका', 'Staff & Employee Directory'), icon: IdCard },
    { to: '/admin/settings', label: t('सहकारी सेटिङ तथा सीएमएस', 'Coop CMS Settings'), icon: Settings },
    { to: '/admin/audit-reports', label: t('लेखा परीक्षण तथा प्रतिवेदन', 'Audit & Transparency'), icon: Sparkles },
  ];

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-950">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-68 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:h-full shrink-0 print:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <Link to="/admin" className="flex items-center group shrink-0" title="Admin Dashboard">
              <img
                src={logoUrl}
                alt="Unako SACCOS Logo"
                className="h-11 w-auto object-contain shrink-0"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Admin badge */}
          <div className="p-3 mx-3 my-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3 shrink-0">
            <div className="size-9 rounded-full bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 font-bold text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{t('केन्द्रीय प्रशासकीय अधिकार', 'Central Admin Authority')}</h4>
              <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                CBS Live
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 min-h-0 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-slate-950 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800 space-y-1.5 shrink-0 bg-slate-900">
            <Link
              to="/member"
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="size-3.5 text-slate-400" />
                <span>{t('सदस्य दृश्यमा जानुहोस्', 'Switch to Member View')}</span>
              </div>
              <ChevronRight className="size-3.5 text-slate-500" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>{t('प्रशासक पोर्टलबाट बाहिरिनुहोस्', 'Exit Admin Portal (Log Out)')}</span>
            </button>
          </div>
        </aside>

        {/* Main admin content */}
        {/* `relative` makes this column the containing block for absolutely
            positioned descendants (e.g. sr-only inputs) so they stay clipped
            inside the scroll area instead of stretching the document height. */}
        <div className="relative flex-1 flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar">
          <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 print:hidden">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <Menu className="size-5" />
              </button>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('सहकारी केन्द्रीय व्यवस्थापन तथा सुशासन', 'Admin Management & Governance')}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  {t('सीबीएस अडिट तथा सार्वभौम नियन्त्रण कक्ष', 'Universal Configuration & CBS Audit Console')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Fast Banking Terminal Button (F2) */}
              <button
                type="button"
                onClick={toggleTerminal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 rounded-lg shadow-sm border border-blue-500/50 transition-all cursor-pointer animate-pulse-subtle"
                title={t('द्रुत बैंकिङ कन्सोल (F2)', 'Fast Banking Terminal (F2)')}
              >
                <Terminal className="size-3.5 text-blue-200" />
                <span>{t('द्रुत टर्मिनल', 'Fast Terminal')}</span>
                <kbd className="hidden sm:inline px-1 py-0.2 bg-blue-900/80 border border-blue-400/40 rounded text-[10px] font-mono text-blue-200">
                  F2
                </kbd>
              </button>

              {/* Public Website Button */}
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg border border-emerald-200 dark:border-emerald-900/40 transition-colors shadow-2xs"
                title={t('सार्वजनिक वेबसाइट हेर्नुहोस्', 'View Public Website')}
              >
                <Globe className="size-3.5" />
                <span className="hidden sm:inline">{t('सार्वजनिक पोर्टल', 'Public')}</span>
              </Link>

              {/* System Guide Button */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-system-tutorial'))}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg border border-blue-200 dark:border-blue-900/40 transition-colors cursor-pointer"
                title={t('प्रणाली प्रयोग निर्देशिका', 'System Tutorial & Guide')}
              >
                <BookOpen className="size-3.5" />
                <span className="hidden sm:inline">{t('निर्देशिका', 'Guide')}</span>
              </button>

              {/* Keyboard Shortcuts Button */}
              <button
                type="button"
                onClick={toggleShortcutGuide}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                title={t('किबोर्ड सर्टकटहरू (?)', 'Keyboard Shortcuts (?)')}
              >
                <Keyboard className="size-3.5" />
                <span className="hidden sm:inline">{t('सर्टकट (?)', 'Shortcuts (?)')}</span>
              </button>

              {/* Language Switcher */}
              <LanguageToggle variant="compact" />
              <ThemeToggle variant="compact" />

              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 rounded-lg border border-rose-200 dark:border-rose-900/40 transition-colors"
                >
                  <LogOut className="size-3.5" />
                  <span className="hidden sm:inline">{t('लगआउट', 'Log Out')}</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Keyboard Shortcut Guide Modal */}
      <KeyboardShortcutGuide isOpen={showShortcutGuide} onClose={closeShortcutGuide} />

      {/* Fast Banking Terminal Modal (F2) */}
      <FastBankingTerminalModal isOpen={showTerminal} onClose={closeTerminal} />
    </div>
  );
};
