import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useDesignStore } from '../../store/useDesignStore';
import { SharesEquityHero } from './components/SharesEquityHero';
import { ShareCapitalSection } from './components/ShareCapitalSection';
import { FixedDepositsSection } from './components/FixedDepositsSection';
import { ShareCertificateModal } from './components/ShareCertificateModal';
import { SharePurchaseModal } from './components/SharePurchaseModal';
import { FdCertificateLoanModal } from './components/FdCertificateLoanModal';
import { MudhatiBookingModal } from './components/MudhatiBookingModal';

export function SharesFixedDepositsPage() {
  const { t } = useLanguageStore();
  const customLogoUrl = useDesignStore((s) => s.settings.customLogoUrl);
  const logoUrl = customLogoUrl || '/unako-logo.png';

  const [showCertModal, setShowCertModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showFdLoanModal, setShowFdLoanModal] = useState(false);
  const [showMudhatiModal, setShowMudhatiModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSharePurchaseSubmit = () => {
    setShowPurchaseModal(false);
    showToast(t('सेयर खरिद आवेदन दर्ता भयो!', 'Application for Additional Shares Submitted!'));
  };

  const handleMudhatiSubmit = () => {
    setShowMudhatiModal(false);
    showToast(t('मुद्दती खाता सफलतापूर्वक बुक भयो!', 'Term Deposit Booking Complete!'));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-surface-dark text-white px-5 py-3 rounded-xl shadow-2xl border border-primary/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-status-success" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Main Shares & Fixed Deposit View */}
      <div className="flex flex-col w-full max-w-[1280px] mx-auto space-y-space-xl">
        <SharesEquityHero />
        <ShareCapitalSection
          onOpenCertModal={() => setShowCertModal(true)}
          onOpenPurchaseModal={() => setShowPurchaseModal(true)}
        />
        <FixedDepositsSection
          onOpenFdLoanModal={() => setShowFdLoanModal(true)}
          onOpenMudhatiModal={() => setShowMudhatiModal(true)}
        />
      </div>

      {/* Modals */}
      <ShareCertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        logoUrl={logoUrl}
      />
      <SharePurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSubmit={handleSharePurchaseSubmit}
      />
      <FdCertificateLoanModal
        isOpen={showFdLoanModal}
        onClose={() => setShowFdLoanModal(false)}
      />
      <MudhatiBookingModal
        isOpen={showMudhatiModal}
        onClose={() => setShowMudhatiModal(false)}
        onSubmit={handleMudhatiSubmit}
      />
    </div>
  );
}

export default SharesFixedDepositsPage;
