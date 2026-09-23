import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDesignStore } from './store/useDesignStore';
import { useAuthStore } from './store/useAuthStore';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { MemberLayout } from './components/layout/MemberLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ReportsPage } from './pages/public/ReportsPage';
import { ContactPage } from './pages/public/ContactPage';
import { UnifiedLoginPage } from './pages/public/UnifiedLoginPage';

// Member Stitch Pages
import { MemberDashboardPage } from './pages/member/MemberDashboardPage';
import { PassbookPage } from './pages/member/PassbookPage';
import { LoanPortfolioPage } from './pages/member/LoanPortfolioPage';
import { LoanApplyPage } from './pages/member/LoanApplyPage';
import { TransfersPaymentsPage } from './pages/member/TransfersPaymentsPage';
import { SharesFixedDepositsPage } from './pages/member/SharesFixedDepositsPage';
import { GovernanceSupportPage } from './pages/member/GovernanceSupportPage';
import { CommunityShgDirectoryPage } from './pages/member/CommunityShgDirectoryPage';
import { ProfileSettingsPage } from './pages/member/ProfileSettingsPage';
import { NotificationsPage } from './pages/member/NotificationsPage';
import { MemberVerificationPage } from './pages/member/MemberVerificationPage';
import { AnnualStatementPage } from './pages/member/AnnualStatementPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { MemberVerificationQueuePage } from './pages/admin/MemberVerificationQueuePage';
import { LoanApplicationQueuePage } from './pages/admin/LoanApplicationQueuePage';
import { InquiryManagementPage } from './pages/admin/InquiryManagementPage';
import { MemberManagementPage } from './pages/admin/MemberManagementPage';
import { EmployeeManagementPage } from './pages/admin/EmployeeManagementPage';
import { SavingsManagementPage } from './pages/admin/SavingsManagementPage';
import { TransfersManagementPage } from './pages/admin/TransfersManagementPage';
import { SharesManagementPage } from './pages/admin/SharesManagementPage';
import { AnnouncementsGovernancePage } from './pages/admin/AnnouncementsGovernancePage';
import { CoopSettingsPage } from './pages/admin/CoopSettingsPage';
import { AdminAuditReportsPage } from './pages/admin/AdminAuditReportsPage';
import { MotherGroupsPage } from './pages/admin/MotherGroupsPage';
import { CollectionEntryPage } from './pages/admin/CollectionEntryPage';
import { TradingPLPage } from './pages/admin/TradingPLPage';
import { PearlsAnalysisPage } from './pages/admin/PearlsAnalysisPage';
import { ReconciliationPage } from './pages/admin/ReconciliationPage';
import { SupportChatPopup } from './components/ui/SupportChatPopup';
import { SystemTutorialModal } from './components/ui/SystemTutorialModal';

export function App() {
  const { settings, initTheme } = useDesignStore();
  const { authLoading, initAuth } = useAuthStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Resolve any persisted Supabase session (member / staff) before routing.
  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  const { features } = settings;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface-canvas text-on-surface flex flex-col items-center justify-center gap-3">
        <img
          src="/unako-logo.png"
          alt="Unako SACCOS"
          className="h-14 w-auto object-contain animate-pulse"
        />
        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant animate-pulse">
          Unako SACCOS Portal
        </span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login" element={<UnifiedLoginPage />} />
          <Route path="apply" element={<MemberVerificationPage />} />
          <Route path="member/verification" element={<MemberVerificationPage />} />
        </Route>

        {/* Member Portal Routes - Exact Stitch Architecture */}
        <Route path="/member" element={<MemberLayout />}>
          <Route index element={<MemberDashboardPage />} />
          <Route path="dashboard" element={<Navigate to="/member" replace />} />
          
          {/* Accounts & Passbook */}
          <Route path="my-accounts-passbook" element={<PassbookPage />} />
          <Route path="savings" element={<PassbookPage />} />
          <Route path="passbook" element={<PassbookPage />} />
          
          {/* Loan Portfolio */}
          <Route path="loan-portfolio-repayments" element={<LoanPortfolioPage />} />
          <Route path="loans" element={<LoanPortfolioPage />} />
          <Route
            path="apply-loan"
            element={
              features.enableLoanApplication ? (
                <LoanApplyPage />
              ) : (
                <Navigate to="/member/loan-portfolio-repayments" replace />
              )
            }
          />
          
          {/* Transfers & Payments */}
          <Route
            path="transfers-payments"
            element={
              features.enableSavingsTransfer ? (
                <TransfersPaymentsPage />
              ) : (
                <Navigate to="/member" replace />
              )
            }
          />
          <Route
            path="transfers"
            element={
              features.enableSavingsTransfer ? (
                <TransfersPaymentsPage />
              ) : (
                <Navigate to="/member" replace />
              )
            }
          />
          
          {/* Shares & Fixed Deposits (FD) */}
          <Route path="shares-fixed-deposits" element={<SharesFixedDepositsPage />} />
          <Route path="shares" element={<SharesFixedDepositsPage />} />
          <Route path="fixed-deposits" element={<SharesFixedDepositsPage />} />
          
          {/* Governance & Support */}
          <Route path="cooperative-governance-support" element={<GovernanceSupportPage />} />
          <Route path="governance" element={<GovernanceSupportPage />} />
          <Route path="support" element={<GovernanceSupportPage />} />
          <Route path="shg-directory" element={<CommunityShgDirectoryPage />} />
          <Route path="community-shg" element={<CommunityShgDirectoryPage />} />
          
          {/* Profile & KYC */}
          <Route path="profile" element={<ProfileSettingsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="annual-statement" element={<AnnualStatementPage />} />
          <Route path="statement" element={<AnnualStatementPage />} />
          <Route path="support-chat" element={<Navigate to="/member" replace />} />
          <Route path="chat" element={<Navigate to="/member" replace />} />
        </Route>

        {/* Admin Portal Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="members" element={<MemberManagementPage />} />
          <Route path="employees" element={<EmployeeManagementPage />} />
          <Route path="verifications" element={<MemberVerificationQueuePage />} />
          <Route path="savings" element={<SavingsManagementPage />} />
          <Route path="loans" element={<LoanApplicationQueuePage />} />
          <Route path="transfers" element={<TransfersManagementPage />} />
          <Route path="shares" element={<SharesManagementPage />} />
          <Route path="announcements" element={<AnnouncementsGovernancePage />} />
          <Route path="inquiries" element={<InquiryManagementPage />} />
          <Route path="settings" element={<CoopSettingsPage />} />
          <Route path="mother-groups" element={<MotherGroupsPage />} />
          <Route path="collection-entry" element={<CollectionEntryPage />} />
          <Route path="trading-pl" element={<TradingPLPage />} />
          <Route path="pearls-analysis" element={<PearlsAnalysisPage />} />
          <Route path="reconciliation" element={<ReconciliationPage />} />
          <Route path="audit-reports" element={<AdminAuditReportsPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/member" replace />} />
      </Routes>

      {/* Conditionally Rendered Floating Support & Guide */}
      {features.enableSupportChat && <SupportChatPopup />}
      {features.enableSystemTour && <SystemTutorialModal />}
    </BrowserRouter>
  );
}

export default App;
