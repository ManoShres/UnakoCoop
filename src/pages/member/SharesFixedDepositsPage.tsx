import React, { useState } from 'react';
import { CheckCircle2, Award, Building2, PiggyBank } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useDesignStore } from '../../store/useDesignStore';
import { SharesEquityHero } from './components/SharesEquityHero';
import { ShareCapitalSection } from './components/ShareCapitalSection';
import { FixedDepositsSection } from './components/FixedDepositsSection';
import { ShareCertificateModal } from './components/ShareCertificateModal';
import { SharePurchaseModal } from './components/SharePurchaseModal';
import { FdCertificateLoanModal } from './components/FdCertificateLoanModal';
import { MudhatiBookingModal } from './components/MudhatiBookingModal';

type SharesTab = 'shares' | 'fd' | 'calculator';

export function SharesFixedDepositsPage() {
  const { t } = useLanguageStore();
  const customLogoUrl = useDesignStore((s) => s.settings.customLogoUrl);
  const logoUrl = customLogoUrl || '/unako-logo.png';

  const [activeTab, setActiveTab] = useState<SharesTab>('shares');
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

  const tabItems: Array<{ id: SharesTab; label: string; icon: React.ReactNode; desc: string }> = [
    {
      id: 'shares',
      label: t('सेयर पुँजी तथा लाभांश', 'Share Capital & Dividends'),
      icon: <Award className="w-4 h-4" />,
      desc: t('सदस्य सेयर स्वामित्व र वार्षिक साधारण सभा लाभांश', 'Equity ownership & AGM returns'),
    },
    {
      id: 'fd',
      label: t('सक्रिय मुद्दती निक्षेप', 'Active Fixed Deposits'),
      icon: <Building2 className="w-4 h-4" />,
      desc: t('मुद्दती प्रमाणपत्र तथा ९०% सम्म कर्जा सुविधा', 'Active certificates & loan margin'),
    },
    {
      id: 'calculator',
      label: t('नयाँ मुद्दती / प्रतिफल क्याल्कुलेटर', 'New Mudhati & Calculator'),
      icon: <PiggyBank className="w-4 h-4" />,
      desc: t('११.०% सम्म निश्चित प्रतिफल र स्वचालित बुकिंग', 'High-yield term plans & booking'),
    },
  ];

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
      <div className="flex flex-col w-full max-w-[1280px] mx-auto space-y-6">
        <SharesEquityHero />

        {/* Calm Segmented Tab Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/15">
          {tabItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                type="button"
                className={`flex flex-col text-left px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-surface-card text-on-surface shadow-sm border border-outline-variant/20'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-card/50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <span className={isActive ? 'text-primary' : 'text-on-surface-variant'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span className="text-[11px] text-on-surface-variant/80 mt-1 line-clamp-1">
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: SHARES */}
        {activeTab === 'shares' && (
          <div className="animate-fade-in">
            <ShareCapitalSection
              onOpenCertModal={() => setShowCertModal(true)}
              onOpenPurchaseModal={() => setShowPurchaseModal(true)}
            />
          </div>
        )}

        {/* TAB 2: ACTIVE FIXED DEPOSIT & LOAN */}
        {activeTab === 'fd' && (
          <div className="animate-fade-in">
            <FixedDepositsSection
              viewMode="fd"
              onOpenFdLoanModal={() => setShowFdLoanModal(true)}
              onOpenMudhatiModal={() => setShowMudhatiModal(true)}
            />
          </div>
        )}

        {/* TAB 3: NEW MUDHATI & CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="animate-fade-in">
            <FixedDepositsSection
              viewMode="calculator"
              onOpenFdLoanModal={() => setShowFdLoanModal(true)}
              onOpenMudhatiModal={() => setShowMudhatiModal(true)}
            />
          </div>
        )}
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
