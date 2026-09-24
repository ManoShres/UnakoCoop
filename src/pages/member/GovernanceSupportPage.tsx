import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useDesignStore } from '../../store/useDesignStore';
import { AgmHeroSection } from './components/AgmHeroSection';
import { AgmAgendasSection } from './components/AgmAgendasSection';
import { AgmAttendanceSection } from './components/AgmAttendanceSection';
import { AuditReportsSection } from './components/AuditReportsSection';
import { BranchHelpdeskSection } from './components/BranchHelpdeskSection';
import { EballotModal } from './components/EballotModal';
import { GrievanceModal } from './components/GrievanceModal';
import { AgmPassModal } from './components/AgmPassModal';

export function GovernanceSupportPage() {
  const { t } = useLanguageStore();
  const customLogoUrl = useDesignStore((s) => s.settings.customLogoUrl);
  const logoUrl = customLogoUrl || '/unako-logo.png';

  const [showEballotModal, setShowEballotModal] = useState(false);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [showAgmPassModal, setShowAgmPassModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowGrievanceModal(false);
    showToast(t('गुनासो दर्ता भयो!', 'Grievance Ticket Registered!'));
  };

  const handleBallotSubmit = () => {
    setShowEballotModal(false);
    showToast(t('तपाईंको विद्युतीय मत सफलतापूर्वक दर्ता भयो!', 'Your e-Ballot Vote Recorded with Cryptographic Hash!'));
  };

  const handleAttendanceConfirmed = () => {
    showToast(t('तपाईंको अनलाइन उपस्थिति सुरक्षित भयो!', 'Online Attendance Confirmed!'));
  };

  const handleProxySubmitted = () => {
    showToast(t('प्रतिनिधि अधिकारपत्र दर्ता भयो!', 'Proxy Authorization Submitted!'));
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

      {/* Main Governance View */}
      <div className="flex flex-col w-full max-w-[1280px] mx-auto space-y-space-xl">
        <AgmHeroSection onOpenAgmPassModal={() => setShowAgmPassModal(true)} />
        <AgmAgendasSection onOpenBallotModal={() => setShowEballotModal(true)} />
        <AgmAttendanceSection
          onAttendanceConfirmed={handleAttendanceConfirmed}
          onProxySubmitted={handleProxySubmitted}
        />
        <AuditReportsSection />
        <BranchHelpdeskSection
          onGrievanceSubmit={handleGrievanceSubmit}
          onOpenGrievanceModal={() => setShowGrievanceModal(true)}
        />
      </div>

      {/* Modals */}
      <EballotModal
        isOpen={showEballotModal}
        onClose={() => setShowEballotModal(false)}
        onSubmit={handleBallotSubmit}
      />
      <GrievanceModal
        isOpen={showGrievanceModal}
        onClose={() => setShowGrievanceModal(false)}
      />
      <AgmPassModal
        isOpen={showAgmPassModal}
        onClose={() => setShowAgmPassModal(false)}
        logoUrl={logoUrl}
      />
    </div>
  );
}
export default GovernanceSupportPage;
