import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { User, Menu, X, ArrowRight, UserPlus } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import { useDesignStore } from '../../store/useDesignStore';
import { LanguageToggle } from '../ui/LanguageToggle';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguageStore();
  const { coopSettings } = useCoopStore();
  const customLogoUrl = useDesignStore((s) => s.settings.customLogoUrl);
  const logoUrl = customLogoUrl || '/unako-logo.png';

  const navLinks = [
    { to: '/', label: t('गृहपृष्ठ', 'Home'), end: true },
    { to: '/about', label: t('हाम्रो बारेमा', 'About Us'), end: false },
    { to: '/reports', label: t('वित्तीय प्रतिवेदन तथा पारदर्शिता', 'Reports & Transparency'), end: false },
    { to: '/contact', label: t('सम्पर्क', 'Contact'), end: false },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo Emblem */}
        <Link to="/" className="flex items-center group shrink-0" title={t(coopSettings.nameNepali, coopSettings.name)}>
          <img
            src={logoUrl}
            alt={coopSettings.name}
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
          />
        </Link>

        {/* Desktop Navigation Menu (Universal across all public pages) */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive
                  ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-1 transition-colors'
                  : 'text-slate-600 hover:text-emerald-700 pb-1 transition-colors'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Action Controls (No ThemeToggle on public website) */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageToggle variant="pill" />

          <Link
            to="/apply"
            className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors"
          >
            <UserPlus className="size-3.5" />
            <span>{t('सदस्यता आवेदन', 'Apply')}</span>
          </Link>

          <Link
            to="/login"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
          >
            <User className="size-3.5" />
            <span>{t('लगइन / पोर्टल', 'Portal Login')}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageToggle variant="compact" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            aria-label={t('मेनु टगल गर्नुहोस्', 'Toggle Navigation')}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200"
            >
              {t('नयाँ अनलाइन सदस्यता आवेदन', 'Apply for Membership')}
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700"
            >
              {t('सदस्य / कर्मचारी लगइन पोर्टल', 'Member / Staff Login Portal')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
