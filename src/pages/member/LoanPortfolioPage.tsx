import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { formatNPR } from '../../utils/nepaliDate';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCoopStore } from '../../store/useCoopStore';
import {
  LoanHeaderBanner,
  LoanProgressHeroCard,
  LoanRepaymentHealthBanner,
  LoanPayEmiCard,
  LoanTopUpCalculator,
  LoanAmortizationTable,
  LoanAdvisoryFootplate,
  LoanEmiPaymentModal,
  LoanApplyModal,
} from './components/loan';

export function LoanPortfolioPage() {
  const { t, fmtCurrency } = useLanguageStore();
  const currentMember = useAuthStore((s) => s.currentMember);
  const loans = useCoopStore((s) => s.loans);
  const savings = useCoopStore((s) => s.savings);
  const recordLoanRepayment = useCoopStore((s) => s.recordLoanRepayment);
  const addLoanApplication = useCoopStore((s) => s.addLoanApplication);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const effectiveMemberId = currentMember?.id || 'm1';
  const memberLoans = loans.filter((l) => l.memberId === effectiveMemberId);
  const activeLoan = memberLoans.find((l) => l.status === 'ACTIVE') || loans[0];
  const regularSavings = savings.find(
    (s) => s.memberId === effectiveMemberId && s.accountType === 'Regular Savings'
  );
  const savingsBalance = regularSavings?.balance ?? 285600;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleEmiPayment = (paymentAmount: number) => {
    setShowEmiModal(false);
    if (activeLoan) {
      recordLoanRepayment(activeLoan.loanNo, paymentAmount, 'Member Portal Instant Repayment');
    }
    showToast(
      t(
        `किस्ता भुक्तानी सफल भयो! (रु. ${formatNPR(paymentAmount, true)})`,
        `EMI Payment of NPR ${formatNPR(paymentAmount, true)} Successful!`
      )
    );
  };

  const handleApplySubmit = (scheme: string, amount: number, tenure: number) => {
    setShowApplyModal(false);
    let validLoanType: import('../../types').LoanType = 'Agricultural & Livestock';
    if (scheme.includes('Business')) validLoanType = 'Small Business Enterprise';
    else if (scheme.includes('Education')) validLoanType = 'Education & Career';
    else if (scheme.includes('Emergency')) validLoanType = 'Emergency Relieve';
    else if (scheme.includes('Home')) validLoanType = 'Home & Land';

    addLoanApplication({
      memberId: effectiveMemberId,
      memberName: currentMember?.name || 'Ram Bahadur Shrestha',
      memberNo: currentMember?.memberNo || 'UKO-2072-04419',
      loanType: validLoanType,
      requestedAmount: amount,
      tenureMonths: tenure,
      monthlyIncome: 65000,
      existingDebt: activeLoan?.remainingBalance ?? 0,
      purpose: 'Agricultural & business growth expansion',
      collateralDetails: 'Member shareholding and group guarantee',
      documents: {
        citizenshipUploaded: true,
        collateralProofUploaded: true,
        incomeProofUploaded: true,
      },
    });
    showToast(
      t(
        'ऋण आवेदन सञ्चालक समिति समीक्षाका लागि पेश भयो!',
        'Loan application submitted for board review!'
      )
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-surface-dark text-white px-5 py-3 rounded-xl shadow-2xl border border-primary/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-status-success" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Main Loan Portfolio View */}
      <div className="flex flex-col w-full">
        <div className="flex flex-col gap-6 w-full max-w-[1280px] mx-auto pb-12">
          {/* Top Status Header & Cooperative Subsidy Banner */}
          <LoanHeaderBanner
            activeLoan={activeLoan}
            onOpenApplyModal={() => setShowApplyModal(true)}
          />

          {/* Loan Overview Bento Grid: Active Progress + Interactive EMI Center */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <LoanProgressHeroCard activeLoan={activeLoan} />
              <LoanRepaymentHealthBanner />
            </div>
            <LoanPayEmiCard
              activeLoan={activeLoan}
              savingsBalance={savingsBalance}
              onOpenEmiModal={() => setShowEmiModal(true)}
            />
          </div>

          {/* Interactive Pre-Approved Top-Up Loan Calculator Section */}
          <LoanTopUpCalculator onApplyInstant={() => setShowApplyModal(true)} />

          {/* Complete Amortization & Repayment Schedule Table */}
          <LoanAmortizationTable
            activeLoan={activeLoan}
            onPayNow={() => setShowEmiModal(true)}
          />

          {/* Cooperative Advisory & Field Officer Contact Footplate */}
          <LoanAdvisoryFootplate />
        </div>
      </div>

      {/* Modals */}
      <LoanEmiPaymentModal
        isOpen={showEmiModal}
        onClose={() => setShowEmiModal(false)}
        onConfirmPayment={handleEmiPayment}
        defaultAmount={activeLoan?.monthlyEmi ?? 23650}
        savingsBalance={savingsBalance}
      />

      <LoanApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSubmitApplication={handleApplySubmit}
      />
    </div>
  );
}

export default LoanPortfolioPage;
