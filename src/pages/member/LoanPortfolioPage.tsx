import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Headset,
  PlusCircle,
  SlidersHorizontal,
  Sparkles,
  Wheat,
  Sprout,
} from 'lucide-react';
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
  MemberWarehousePledgeSection,
  MemberAgriQuotaSection,
} from './components/loan';

export function LoanPortfolioPage() {
  const { t, fmtCurrency } = useLanguageStore();
  const currentMember = useAuthStore((s) => s.currentMember);
  const loans = useCoopStore((s) => s.loans);
  const savings = useCoopStore((s) => s.savings);
  const recordLoanRepayment = useCoopStore((s) => s.recordLoanRepayment);
  const addLoanApplication = useCoopStore((s) => s.addLoanApplication);

  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'topup' | 'advisory' | 'warehouse' | 'agri-quota'>('overview');
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
        `किस्ता भुक्तानी सफल भयो! (${fmtCurrency(paymentAmount, true)})`,
        `EMI Payment of ${fmtCurrency(paymentAmount, true)} Successful!`
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
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-primary/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-status-success" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Main Loan Portfolio View */}
      <div className="flex flex-col w-full max-w-[1280px] mx-auto pb-12 gap-6">
        {/* Top Status Header */}
        <LoanHeaderBanner
          activeLoan={activeLoan}
          onOpenApplyModal={() => setShowApplyModal(true)}
        />

        {/* Clean Segmented Navigation Tabs */}
        <div className="bg-surface-card p-1.5 rounded-2xl border border-outline-variant/15 flex items-center gap-1.5 overflow-x-auto shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{t('समीक्षा तथा किस्ता भुक्तानी', 'Overview & Repayment')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>{t('१२ महिने किस्ता तालिका', 'Amortization Schedule')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('topup')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'topup'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t('थप कर्जा क्यालकुलेटर', 'Top-Up Calculator')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('advisory')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'advisory'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <Headset className="w-4 h-4" />
            <span>{t('सल्लाहकार तथा फिल्ड डेस्क', 'Advisory & Field Support')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('warehouse')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'warehouse'
                ? 'bg-amber-500 text-white shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <Wheat className="w-4 h-4 text-amber-500" />
            <span>{t('अन्न गोदाम रसिद धितो (WHR)', 'Crop Warehouse Pledge')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agri-quota')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'agri-quota'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-500" />
            <span>{t('मल-बीउ कोटा तथा कृषि कर्जा', 'Agri-Input Quota & Credit')}</span>
          </button>
        </div>

        {/* Tab 1: Overview & Pay */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
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
        )}

        {/* Tab 2: Schedule Table */}
        {activeTab === 'schedule' && (
          <div className="animate-fade-in">
            <LoanAmortizationTable
              activeLoan={activeLoan}
              onPayNow={() => setShowEmiModal(true)}
            />
          </div>
        )}

        {/* Tab 3: Top-up Calculator */}
        {activeTab === 'topup' && (
          <div className="animate-fade-in">
            <LoanTopUpCalculator onApplyInstant={() => setShowApplyModal(true)} />
          </div>
        )}

        {/* Tab 4: Advisory Support */}
        {activeTab === 'advisory' && (
          <div className="animate-fade-in">
            <LoanAdvisoryFootplate />
          </div>
        )}

        {/* Tab 5: Crop Warehouse Pledge */}
        {activeTab === 'warehouse' && (
          <div className="animate-fade-in">
            <MemberWarehousePledgeSection />
          </div>
        )}

        {/* Tab 6: Agri-Input Quota & Seasonal Credit */}
        {activeTab === 'agri-quota' && (
          <div className="animate-fade-in">
            <MemberAgriQuotaSection />
          </div>
        )}
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
