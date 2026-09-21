import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';

export const PublicLayout: React.FC = () => {
  const location = useLocation();

  // Pages with their own full-page dedicated forms (Login, Apply, Member Verification)
  const isStandalonePage =
    location.pathname === '/member/verification' ||
    location.pathname === '/apply' ||
    location.pathname === '/login';

  // Public website strictly stays in daylight/light mode for institutional trust & branding
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      {!isStandalonePage && <PublicNavbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isStandalonePage && <PublicFooter />}
    </div>
  );
};
