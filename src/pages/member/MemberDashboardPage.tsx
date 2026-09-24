import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Megaphone, ArrowRight } from 'lucide-react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAuthStore } from '../../store/useAuthStore';
import { MemberHeroCard } from './components/dashboard/MemberHeroCard';
import { MemberQuickActions } from './components/dashboard/MemberQuickActions';
import { MemberAccountsStrip } from './components/dashboard/MemberAccountsStrip';
import { MemberLoanHealthCard } from './components/dashboard/MemberLoanHealthCard';
import { MemberActivityFeed } from './components/dashboard/MemberActivityFeed';
import { MemberStandingAndAdvisory } from './components/dashboard/MemberStandingAndAdvisory';
import { MemberDepositModal } from './components/dashboard/MemberDepositModal';
import { MemberEmiPaymentModal } from './components/dashboard/MemberEmiPaymentModal';
import { MemberDashboardAccountSummary } from './components/dashboard/MemberDashboardTypes';

export function MemberDashboardPage() {
  const { currentMember } = useAuthStore();
  const { members, savings, loans, transactions, notices } = useCoopStore();
  const { t, fmtCurrency } = useLanguageStore();

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [emiModalOpen, setEmiModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Resolve current active member or fallback gracefully to first demo member
  const activeMember =
    currentMember ||
    members[0] || {
      id: 'mem-1',
      memberNo: 'UKO-2070-08842',
      name: 'Hari Prasad Chaudhary',
      nameNepali: 'हरि प्रसाद चौधरी',
      phone: '9857840123',
      email: 'hari.chaudhary@unako.coop.np',
      citizenshipNo: '38-01-72-04912',
      joinedDate: '2070-04-12',
      status: 'ACTIVE' as const,
      shareCapital: 50000,
      shareKitta: 500,
      totalSavings: 184500,
      activeLoans: 1,
      role: 'REGULAR' as const,
    };

  // Compute live account balances from store
  const memberSavingsAccounts = savings.filter(
    (s) => s.memberId === activeMember.id || s.accountNo.includes('004-10294')
  );

  const regularSavingsAcct =
    memberSavingsAccounts.find((s) => s.accountType.includes('Regular') || s.accountType.includes('साधारण')) ||
    savings[0];

  const regularSavingsBalance = regularSavingsAcct?.balance || 184500;
  const compulsorySavingsBalance = 68000;
  const shareCapitalBalance = activeMember.shareCapital || 50000;
  const fixedDepositsBalance = 40350;

  const totalNetWorth =
    regularSavingsBalance + compulsorySavingsBalance + shareCapitalBalance + fixedDepositsBalance;

  const primaryAccountNo = regularSavingsAcct?.accountNo || '004-10294-88-01';

  // Active member loan
  const activeLoan = loans.find(
    (l) => l.memberId === activeMember.id || l.loanNo === 'LN-2099-0418' || l.status === 'ACTIVE'
  ) || loans[0];

  // Active notice
  const activeNotice = notices.find((n) => n.isActive) || notices[0];

  // Filter transactions for this member or use cooperative ledger
  const memberTransactions = transactions.filter(
    (tx) => tx.memberId === activeMember.id || tx.memberId === 'mem-1' || !tx.memberId
  );

  const accountSummary: MemberDashboardAccountSummary = {
    regularSavings: regularSavingsBalance,
    compulsorySavings: compulsorySavingsBalance,
    shareCapital: shareCapitalBalance,
    fixedDeposits: fixedDepositsBalance,
    totalNetWorth,
    activeLoanBalance: activeLoan?.remainingBalance || 118420,
    primaryAccountNo,
  };

  const handleDepositSuccess = (amount: number, gateway: string) => {
    showToast(
      t(
        `रु. ${fmtCurrency(amount, true)} ${gateway} मार्फत सफलतापूर्वक बचत खातामा जम्मा भयो!`,
        `NPR ${fmtCurrency(amount, true)} deposited to savings via ${gateway}!`
      )
    );
  };

  const handleEmiSuccess = (amount: number) => {
    showToast(
      t(
        `ऋण किस्ता रु. ${fmtCurrency(amount, true)} सफलतापूर्वक भुक्तानी भयो!`,
        `Loan EMI payment of NPR ${fmtCurrency(amount, true)} processed successfully!`
      )
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Official Cooperative Announcement Ticker */}
      <div className="rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 truncate">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wide shrink-0">
            <Megaphone className="size-3" />
            <span>{t('सहकारी सूचना', 'OFFICIAL NOTICE')}</span>
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
            {activeNotice ? t(activeNotice.titleNepali, activeNotice.title) : 'Unako SACCOS Member Portal Operational'}
          </span>
        </div>

        <Link
          to="/member/cooperative-governance-support"
          className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline shrink-0 flex items-center gap-1"
        >
          <span>{t('विवरण', 'Details')}</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* 1. Hero Virtual Member Card */}
      <MemberHeroCard
        member={activeMember}
        primaryAccountNo={primaryAccountNo}
        totalNetWorth={totalNetWorth}
        regularSavings={regularSavingsBalance}
      />

      {/* 2. Tactile Quick Actions Dock */}
      <MemberQuickActions
        onOpenDepositModal={() => setDepositModalOpen(true)}
        onOpenEmiModal={() => setEmiModalOpen(true)}
      />

      {/* 3. Account Portfolios Strip */}
      <MemberAccountsStrip
        summary={accountSummary}
        shareKitta={activeMember.shareKitta || 500}
      />

      {/* 4. Two-Column Workspace (Activity Feed + Sidebars) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Real-Time Verified Activity Feed (7 cols) */}
        <div className="lg:col-span-7">
          <MemberActivityFeed
            transactions={memberTransactions}
            memberNo={activeMember.memberNo}
          />
        </div>

        {/* Right Column: Active Loan Health Card & Standing Rules (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <MemberLoanHealthCard
            loan={activeLoan}
            onOpenEmiModal={() => setEmiModalOpen(true)}
          />

          <MemberStandingAndAdvisory />
        </div>
      </div>

      {/* Interactive Modals */}
      {depositModalOpen && (
        <MemberDepositModal
          primaryAccountNo={primaryAccountNo}
          onClose={() => setDepositModalOpen(false)}
          onSuccess={handleDepositSuccess}
        />
      )}

      {emiModalOpen && (
        <MemberEmiPaymentModal
          loanNo={activeLoan?.loanNo || 'LN-2099-0418'}
          emiAmount={activeLoan?.monthlyEmi || 8640}
          availableSavings={regularSavingsBalance}
          onClose={() => setEmiModalOpen(false)}
          onSuccess={handleEmiSuccess}
        />
      )}
    </div>
  );
}
