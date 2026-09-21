import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useDesignStore } from '../../store/useDesignStore';
import { LanguageToggle } from '../ui/LanguageToggle';
import { ThemeToggle } from '../ui/ThemeToggle';

export function MemberLayout() {
  const { lang, t } = useLanguageStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { switchToPreset, currentMember } = useAuthStore();
  const customLogoUrl = useDesignStore((s) => s.settings.customLogoUrl);
  const features = useDesignStore((s) => s.settings.features);
  const logoUrl = customLogoUrl || '/unako-logo.png';

  const handleLogout = () => {
    switchToPreset('guest');
    navigate('/login');
  };

  const navItems = [
    {
      to: '/member',
      label: t('ड्यासबोर्ड', 'Dashboard'),
      icon: 'space_dashboard',
      end: true,
      show: true,
    },
    {
      to: '/member/my-accounts-passbook',
      label: t('खाता तथा पासबुक', 'My Accounts & Passbook'),
      icon: 'account_balance_wallet',
      end: false,
      show: true,
    },
    {
      to: '/member/loan-portfolio-repayments',
      label: t('ऋण तथा किस्ता भुक्तानी', 'Loan Portfolio & Repayments'),
      icon: 'real_estate_agent',
      end: false,
      show: true,
    },
    {
      to: '/member/transfers-payments',
      label: t('रकम स्थानान्तरण र भुक्तानी', 'Transfers & Payments'),
      icon: 'payments',
      end: false,
      show: features.enableSavingsTransfer,
    },
    {
      to: '/member/shares-fixed-deposits',
      label: t('शेयर तथा मुद्दती निक्षेप', 'Shares & Fixed Deposits'),
      icon: 'savings',
      end: false,
      show: true,
    },
    {
      to: '/member/annual-statement',
      label: t('वार्षिक वित्तीय विवरण', 'Annual Statement & Tax'),
      icon: 'receipt_long',
      end: false,
      show: true,
    },
    {
      to: '/member/cooperative-governance-support',
      label: t('सहकारी सुशासन र सहयोग', 'Governance & Support'),
      icon: 'how_to_vote',
      end: false,
      show: features.enableEBallot || features.enableAgmPass || features.enableGrievance,
    },
  ].filter((item) => item.show);

  return (
    <div className="bg-surface-canvas text-on-surface font-body-md min-h-screen">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface-card border-b border-outline-variant/30 z-50 flex items-center justify-between px-4 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
            aria-label={t('मेनु टगल गर्नुहोस्', 'Toggle Navigation')}
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Unako Logo" className="h-9 w-auto object-contain" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {features.enableSystemTour && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-system-tutorial'))}
              className="p-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              title={t('प्रणाली प्रयोग निर्देशिका', 'System Guide')}
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
            </button>
          )}
          <LanguageToggle variant="compact" />
          <ThemeToggle variant="compact" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
            title={t('लगआउट', 'Log Out')}
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>{t('लगआउट', 'Exit')}</span>
          </button>
          <Link
            to="/member/profile"
            className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs"
            title={currentMember?.name || 'Member Profile'}
          >
            {currentMember?.name ? currentMember.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'HP'}
          </Link>
        </div>
      </div>

      {/* Desktop / Responsive Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 print:hidden bg-surface-card border-r border-outline-variant/30 transition-transform duration-300 ease-in-out lg:translate-x-0 h-screen flex flex-col justify-between shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Logo & Cooperative Identity */}
          <div className="p-6 border-b border-outline-variant/20 shrink-0">
            <div className="flex items-center justify-center py-2">
              <img src={logoUrl} alt="Unako Cooperative Logo" className="h-12 w-auto object-contain" />
            </div>

            {/* Member Card Widget in Sidebar */}
            <div className="mt-4 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20">
                {currentMember?.name ? currentMember.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'HP'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-on-surface truncate">{currentMember?.name || 'Member'}</p>
                <p className="text-[11px] font-mono text-on-surface-variant truncate">{currentMember?.memberNo || 'UKO-2070'}</p>
              </div>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wide">{t('सक्रिय सदस्य', 'Active Member')}</span>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-on-surface-variant px-1">
              <span className="flex items-center gap-1 text-status-success font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success inline-block"></span>
                CBS Connected
              </span>
              <span className="truncate">{currentMember?.nameNepali ? t('कलंकी-१४, काठमाडौं', currentMember.address) : (currentMember?.address || t('चैनपुर, गढवा-५', 'Chainpur, Gadhwa-5'))}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-label-md transition-all text-xs font-semibold ${
                    isActive
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Member Helpdesk & Support Card */}
          <div className="p-3 border-t border-outline-variant/20 space-y-2 shrink-0 bg-surface-card">
            <div className="p-3 bg-brand-accent-light/50 border border-brand-accent-lime/30 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-accent-lime/20 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-on-surface">{t('सदस्य सहायता कक्ष', 'Member Desk')}</p>
                <p className="text-[11px] text-on-surface-variant font-mono">082-412055</p>
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
                className="text-[11px] font-bold text-primary hover:underline shrink-0 cursor-pointer"
              >
                {t('च्याट', 'Chat')}
              </button>
            </div>

            {/* Prominent Sidebar Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>{t('खाताबाट बाहिरिनुहोस्', 'Log Out of Account')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen print:pl-0 print:min-h-0">
        {/* Sticky Desktop Header */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-surface-card/90 backdrop-blur-md border-b border-outline-variant/30 z-30 flex items-center justify-between px-4 sm:px-8 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-headline font-bold text-base sm:text-lg text-on-surface truncate">
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary rounded-lg border border-primary/30 transition-all cursor-pointer shadow-2xs"
              title={t('प्रणाली प्रयोग निर्देशिका', 'System Tutorial & Guide')}
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span className="hidden sm:inline">{t('निर्देशिका', 'Guide')}</span>
            </button>

            {/* Global Language Toggle Component */}
            <LanguageToggle variant="compact" />
            <ThemeToggle variant="compact" />

            {/* KYC Status Badge */}
            <Link
              to="/member/profile"
              className="hidden md:flex items-center gap-1.5 bg-brand-accent-light px-3 py-1 rounded-full border border-emerald-200/60 hover:shadow-xs transition-shadow"
            >
              <span className="material-symbols-outlined text-status-success text-[16px]">verified</span>
              <span className="text-xs font-bold text-primary">{t('केवाईसी प्रमाणित', 'KYC Verified')}</span>
            </Link>

            {/* Notification Bell */}
            <Link
              to="/member/notifications"
              className="relative p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface flex items-center justify-center"
              title={t('सूचनाहरू', 'Notifications')}
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error"></span>
            </Link>

            {/* Member Profile Avatar */}
            <Link
              to="/member/profile"
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:ring-2 hover:ring-primary/40 transition-all shadow-xs"
              title={currentMember?.name || 'Member Profile'}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </Link>

            {/* Header Direct Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer shadow-xs"
              title={t('लगआउट गर्नुहोस्', 'Log Out of Member Portal')}
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="hidden sm:inline">{t('लगआउट', 'Log Out')}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="w-full pt-16 bg-surface-canvas min-h-screen print:pt-0 print:min-h-0 print:bg-white">
          <Outlet context={{ lang }} />
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
