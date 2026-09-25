import React, { useState } from 'react';
import { CheckCircle2, Vote, UserCheck, FileText, Headphones } from 'lucide-react';
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

type GovernanceTab = 'agm' | 'attendance' | 'reports' | 'helpdesk';

export function GovernanceSupportPage() {
  const { t } = useLanguageStore();
  const customLogoUrl = useDesignStore((s) => s.settings.customLogoUrl);
  const logoUrl = customLogoUrl || '/unako-logo.png';

  const [activeTab, setActiveTab] = useState<GovernanceTab>('agm');
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

  const tabItems: Array<{ id: GovernanceTab; label: string; icon: React.ReactNode; desc: string }> = [
    {
      id: 'agm',
      label: t('साधारण सभा तथा मतदान', '15th AGM & Voting'),
      icon: <Vote className="w-4 h-4" />,
      desc: t('सभा सूचना, कार्यसूची र विद्युतीय मतदान', 'Notices, resolutions & e-ballot'),
    },
    {
      id: 'attendance',
      label: t('उपस्थिति तथा प्रतिनिधि', 'Attendance & Proxy'),
      icon: <UserCheck className="w-4 h-4" />,
      desc: t('अनलाइन उपस्थिति र प्रतिनिधि दर्ता', 'RSVP pass & authorized proxy'),
    },
    {
      id: 'reports',
      label: t('लेखापरीक्षण प्रतिवेदन', 'Audit & Reports'),
      icon: <FileText className="w-4 h-4" />,
      desc: t('वासलात, PEARLS सूचक र प्रतिवेदन', 'Financial statements & disclosures'),
    },
    {
      id: 'helpdesk',
      label: t('गुनासो तथा सहायता डेस्क', 'Support & Helpdesk'),
      icon: <Headphones className="w-4 h-4" />,
      desc: t('गुनासो दर्ता, हटलाइन र शाखा सम्पर्क', 'Grievance desk & branch hotline'),
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

      {/* Main Governance View */}
      <div className="flex flex-col w-full max-w-[1280px] mx-auto space-y-6">
        {/* Calm Segmented Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/15">
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

        {/* TAB 1: AGM & BALLOT */}
        {activeTab === 'agm' && (
          <div className="space-y-6 animate-fade-in">
            <AgmHeroSection onOpenAgmPassModal={() => setShowAgmPassModal(true)} />
            <AgmAgendasSection onOpenBallotModal={() => setShowEballotModal(true)} />
          </div>
        )}

        {/* TAB 2: ATTENDANCE & PROXY */}
        {activeTab === 'attendance' && (
          <div className="animate-fade-in">
            <AgmAttendanceSection
              onAttendanceConfirmed={handleAttendanceConfirmed}
              onProxySubmitted={handleProxySubmitted}
            />
          </div>
        )}

        {/* TAB 3: AUDITED REPORTS & DISCLOSURES */}
        {activeTab === 'reports' && (
          <div className="animate-fade-in">
            <AuditReportsSection />
          </div>
        )}

        {/* TAB 4: HELPDESK & GRIEVANCES */}
        {activeTab === 'helpdesk' && (
          <div className="animate-fade-in">
            <BranchHelpdeskSection
              onGrievanceSubmit={handleGrievanceSubmit}
              onOpenGrievanceModal={() => setShowGrievanceModal(true)}
            />
          </div>
        )}
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
