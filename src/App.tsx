import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDesignStore } from './store/useDesignStore';
import { useAuthStore } from './store/useAuthStore';

// Security guards & UI fallbacks
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { ErrorBoundary } from './components/guards/ErrorBoundary';
import { PageLoader } from './components/ui/PageLoader';

// Layouts (eagerly loaded for shell structure)
import { PublicLayout } from './components/layout/PublicLayout';
import { MemberLayout } from './components/layout/MemberLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages (Lazy Loaded)
const HomePage = lazy(() => import('./pages/public/HomePage').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./pages/public/AboutPage').then((m) => ({ default: m.AboutPage })));
const ReportsPage = lazy(() => import('./pages/public/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const ContactPage = lazy(() => import('./pages/public/ContactPage').then((m) => ({ default: m.ContactPage })));
const UnifiedLoginPage = lazy(() => import('./pages/public/UnifiedLoginPage').then((m) => ({ default: m.UnifiedLoginPage })));

// Member Stitch Pages (Lazy Loaded)
const MemberDashboardPage = lazy(() => import('./pages/member/MemberDashboardPage').then((m) => ({ default: m.MemberDashboardPage })));
const PassbookPage = lazy(() => import('./pages/member/PassbookPage').then((m) => ({ default: m.PassbookPage })));
const LoanPortfolioPage = lazy(() => import('./pages/member/LoanPortfolioPage').then((m) => ({ default: m.LoanPortfolioPage })));
const LoanApplyPage = lazy(() => import('./pages/member/LoanApplyPage').then((m) => ({ default: m.LoanApplyPage })));
const TransfersPaymentsPage = lazy(() => import('./pages/member/TransfersPaymentsPage').then((m) => ({ default: m.TransfersPaymentsPage })));
const SharesFixedDepositsPage = lazy(() => import('./pages/member/SharesFixedDepositsPage').then((m) => ({ default: m.SharesFixedDepositsPage })));
const GovernanceSupportPage = lazy(() => import('./pages/member/GovernanceSupportPage').then((m) => ({ default: m.GovernanceSupportPage })));
const CommunityShgDirectoryPage = lazy(() => import('./pages/member/CommunityShgDirectoryPage').then((m) => ({ default: m.CommunityShgDirectoryPage })));
const ProfileSettingsPage = lazy(() => import('./pages/member/ProfileSettingsPage').then((m) => ({ default: m.ProfileSettingsPage })));
const NotificationsPage = lazy(() => import('./pages/member/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const MemberVerificationPage = lazy(() => import('./pages/member/MemberVerificationPage').then((m) => ({ default: m.MemberVerificationPage })));
const AnnualStatementPage = lazy(() => import('./pages/member/AnnualStatementPage').then((m) => ({ default: m.AnnualStatementPage })));

// Admin Pages (Lazy Loaded)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const MemberVerificationQueuePage = lazy(() => import('./pages/admin/MemberVerificationQueuePage').then((m) => ({ default: m.MemberVerificationQueuePage })));
const LoanApplicationQueuePage = lazy(() => import('./pages/admin/LoanApplicationQueuePage').then((m) => ({ default: m.LoanApplicationQueuePage })));
const InquiryManagementPage = lazy(() => import('./pages/admin/InquiryManagementPage').then((m) => ({ default: m.InquiryManagementPage })));
const MemberManagementPage = lazy(() => import('./pages/admin/MemberManagementPage').then((m) => ({ default: m.MemberManagementPage })));
const EmployeeManagementPage = lazy(() => import('./pages/admin/EmployeeManagementPage').then((m) => ({ default: m.EmployeeManagementPage })));
const SavingsManagementPage = lazy(() => import('./pages/admin/SavingsManagementPage').then((m) => ({ default: m.SavingsManagementPage })));
const TransfersManagementPage = lazy(() => import('./pages/admin/TransfersManagementPage').then((m) => ({ default: m.TransfersManagementPage })));
const SharesManagementPage = lazy(() => import('./pages/admin/SharesManagementPage').then((m) => ({ default: m.SharesManagementPage })));
const AnnouncementsGovernancePage = lazy(() => import('./pages/admin/AnnouncementsGovernancePage').then((m) => ({ default: m.AnnouncementsGovernancePage })));
const CoopSettingsPage = lazy(() => import('./pages/admin/CoopSettingsPage').then((m) => ({ default: m.CoopSettingsPage })));
const AdminAuditReportsPage = lazy(() => import('./pages/admin/AdminAuditReportsPage').then((m) => ({ default: m.AdminAuditReportsPage })));
const MotherGroupsPage = lazy(() => import('./pages/admin/MotherGroupsPage').then((m) => ({ default: m.MotherGroupsPage })));
const CollectionEntryPage = lazy(() => import('./pages/admin/CollectionEntryPage').then((m) => ({ default: m.CollectionEntryPage })));
const TradingPLPage = lazy(() => import('./pages/admin/TradingPLPage').then((m) => ({ default: m.TradingPLPage })));
const PearlsAnalysisPage = lazy(() => import('./pages/admin/PearlsAnalysisPage').then((m) => ({ default: m.PearlsAnalysisPage })));
const ReconciliationPage = lazy(() => import('./pages/admin/ReconciliationPage').then((m) => ({ default: m.ReconciliationPage })));
const LoanProvisioningPage = lazy(() => import('./pages/admin/LoanProvisioningPage').then((m) => ({ default: m.LoanProvisioningPage })));
const TellerCounterPage = lazy(() => import('./pages/admin/TellerCounterPage').then((m) => ({ default: m.TellerCounterPage })));
const StatutoryFundsPage = lazy(() => import('./pages/admin/StatutoryFundsPage').then((m) => ({ default: m.StatutoryFundsPage })));
const FieldCollectorPage = lazy(() => import('./pages/field/FieldCollectorPage').then((m) => ({ default: m.FieldCollectorPage })));

// Interactive Widgets (Lazy Loaded)
const SupportChatPopup = lazy(() => import('./components/ui/SupportChatPopup').then((m) => ({ default: m.SupportChatPopup })));
const SystemTutorialModal = lazy(() => import('./components/ui/SystemTutorialModal').then((m) => ({ default: m.SystemTutorialModal })));

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <PublicLayout />
              </ErrorBoundary>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<UnifiedLoginPage />} />
            <Route path="apply" element={<MemberVerificationPage />} />
            <Route path="member/verification" element={<MemberVerificationPage />} />
          </Route>

          {/* Member Portal Routes — guarded: MEMBER + ADMIN can access */}
          <Route
            path="/member"
            element={
              <ProtectedRoute allowedRoles={['MEMBER', 'ADMIN']}>
                <ErrorBoundary>
                  <MemberLayout />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          >
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

          {/* Admin Portal Routes — guarded: ADMIN only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ErrorBoundary>
                  <AdminLayout />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          >
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
            <Route path="loan-provisioning" element={<LoanProvisioningPage />} />
            <Route path="teller-counter" element={<TellerCounterPage />} />
            <Route path="statutory-funds" element={<StatutoryFundsPage />} />
            <Route path="audit-reports" element={<AdminAuditReportsPage />} />
            <Route path="field-collector" element={<FieldCollectorPage />} />
          </Route>

          {/* Dedicated Field Mobility App Mode — mobile-optimized for rural field officers */}
          <Route
            path="/field"
            element={
              <ProtectedRoute
                allowedRoles={['ADMIN']}
                requiredPermission="record_mother_group_meetings"
              >
                <ErrorBoundary>
                  <FieldCollectorPage />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route path="/collector" element={<Navigate to="/field" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/member" replace />} />
        </Routes>

      </Suspense>

      {/* Conditionally Rendered Floating Support & Guide */}
      <Suspense fallback={null}>
        {features.enableSupportChat && <SupportChatPopup />}
        {features.enableSystemTour && <SystemTutorialModal />}
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
