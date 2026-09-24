import React, { useState, useMemo } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LoanApplication, LoanType, CollateralType, LOAN_SCHEMES } from '../../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  LoanOriginationTab,
  LoanOriginationHeader,
  LoanOriginationTabsNav,
  LoanOriginationStep1Scheme,
  LoanOriginationStep2Guarantors,
  LoanOriginationStep3Collateral,
} from './loan-origination';

interface LoanOriginationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newApp: LoanApplication) => void;
}

export const LoanOriginationModal: React.FC<LoanOriginationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { members, addLoanApplication } = useCoopStore();
  const { t, fmtCurrency } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<LoanOriginationTab>('SCHEME');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Tab 1: Member & Scheme
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [loanType, setLoanType] = useState<LoanType>('Agricultural & Livestock');
  const [requestedAmount, setRequestedAmount] = useState<number>(150000);
  const [tenureMonths, setTenureMonths] = useState<number>(24);
  const [interestRate, setInterestRate] = useState<number>(11.5);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(45000);
  const [purpose, setPurpose] = useState('बाख्रा पालन तथा खोर विस्तार');

  // Tab 2: Guarantors
  const [guarantor1Id, setGuarantor1Id] = useState(members[1]?.id || '');
  const [guarantor2Id, setGuarantor2Id] = useState(members[2]?.id || '');

  // Tab 3: Collateral & Disbursement
  const [collateralType, setCollateralType] = useState<CollateralType>('LAND_LALPURJA');
  const [collateralPlotNo, setCollateralPlotNo] = useState('कित्ता नं. ३४२, सिट नं. ५/ग');
  const [collateralArea, setCollateralArea] = useState('२ कट्ठा ५ धुर');
  const [collateralMarketValue, setCollateralMarketValue] = useState<number>(500000);
  const [disbursementMethod, setDisbursementMethod] = useState<'SAVINGS_ACCOUNT' | 'CHEQUE' | 'CASH'>('SAVINGS_ACCOUNT');

  const selectedMember = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId);
  }, [members, selectedMemberId]);

  const guarantor1 = useMemo(() => {
    return members.find((m) => m.id === guarantor1Id);
  }, [members, guarantor1Id]);

  const guarantor2 = useMemo(() => {
    return members.find((m) => m.id === guarantor2Id);
  }, [members, guarantor2Id]);

  // Real-time EMI math (diminishing rate formula)
  const { monthlyEmi, totalInterest, totalPayable, serviceFee, ltvRatio } = useMemo(() => {
    const P = requestedAmount;
    const r = interestRate / 12 / 100;
    const n = tenureMonths;

    let emi = 0;
    if (P > 0 && n > 0) {
      if (r === 0) {
        emi = P / n;
      } else {
        emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      }
    }

    const totalPay = emi * n;
    const interest = totalPay - P;
    const sFee = P * 0.01; // 1% statutory cooperative processing fee
    const ltv = collateralMarketValue > 0 ? (P / collateralMarketValue) * 100 : 0;

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(interest),
      totalPayable: Math.round(totalPay),
      serviceFee: Math.round(sFee),
      ltvRatio: Math.round(ltv),
    };
  }, [requestedAmount, interestRate, tenureMonths, collateralMarketValue]);

  if (!isOpen) return null;

  const handleSchemeChange = (schemeType: LoanApplication['loanType']) => {
    setLoanType(schemeType);
    const found = LOAN_SCHEMES.find((s) => s.type === schemeType);
    if (found) {
      setInterestRate(found.defaultRate);
    }
  };

  const handleValidation = (): boolean => {
    setErrorMsg(null);
    if (!selectedMember) {
      setErrorMsg(t('कृपया ऋण माग गर्ने सदस्य चयन गर्नुहोस्।', 'Please select applicant member.'));
      return false;
    }
    if (requestedAmount <= 0) {
      setErrorMsg(t('ऋण रकम रु. ० भन्दा बढी हुनुपर्छ।', 'Loan principal must be greater than NPR 0.'));
      return false;
    }
    if (guarantor1Id && guarantor1Id === selectedMemberId) {
      setErrorMsg(t('ऋणी स्वयं जमानी बस्न मिल्दैन।', 'Applicant cannot be their own guarantor.'));
      return false;
    }
    if (guarantor1Id && guarantor2Id && guarantor1Id === guarantor2Id) {
      setErrorMsg(t('दुई फरक सदस्य जमानी बस्नुपर्छ।', 'Guarantor 1 and Guarantor 2 must be different members.'));
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidation()) return;
    if (!selectedMember) return;

    const fullCollateralDetails = `${collateralType}: ${collateralPlotNo} (${collateralArea}), बजार मूल्य: रु. ${fmtCurrency(collateralMarketValue, true)}`;

    const newApp = addLoanApplication({
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      memberNo: selectedMember.memberNo,
      loanType,
      requestedAmount,
      tenureMonths,
      monthlyIncome,
      existingDebt: selectedMember.activeLoanBalance || 0,
      purpose,
      collateralDetails: fullCollateralDetails,
      documents: {
        citizenshipUploaded: true,
        collateralProofUploaded: true,
        incomeProofUploaded: true,
      },
      interestRate,
      guarantor1Name: guarantor1?.name,
      guarantor1MemberNo: guarantor1?.memberNo,
      guarantor2Name: guarantor2?.name,
      guarantor2MemberNo: guarantor2?.memberNo,
      collateralType,
      collateralEstimatedValue: collateralMarketValue,
      disbursementMethod,
      committeeNotes: `Originated by Admin counter. Monthly EMI: NPR ${fmtCurrency(monthlyEmi, true)}. LTV: ${ltvRatio}%.`,
    });

    onSuccess(newApp);
  };

  const filteredMembers = members.filter((m) => {
    const q = memberSearchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.memberNo.toLowerCase().includes(q) ||
      m.phone.includes(q)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="loan-origination-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <LoanOriginationHeader onClose={onClose} />

        {/* Tab Selection */}
        <LoanOriginationTabsNav activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'SCHEME' && (
            <LoanOriginationStep1Scheme
              selectedMemberId={selectedMemberId}
              onSelectedMemberIdChange={setSelectedMemberId}
              selectedMember={selectedMember}
              memberSearchQuery={memberSearchQuery}
              onMemberSearchQueryChange={setMemberSearchQuery}
              filteredMembers={filteredMembers}
              loanType={loanType}
              onSchemeChange={handleSchemeChange}
              requestedAmount={requestedAmount}
              onRequestedAmountChange={setRequestedAmount}
              tenureMonths={tenureMonths}
              onTenureMonthsChange={setTenureMonths}
              interestRate={interestRate}
              onInterestRateChange={setInterestRate}
              monthlyIncome={monthlyIncome}
              onMonthlyIncomeChange={setMonthlyIncome}
              purpose={purpose}
              onPurposeChange={setPurpose}
              monthlyEmi={monthlyEmi}
              totalInterest={totalInterest}
              totalPayable={totalPayable}
              serviceFee={serviceFee}
            />
          )}

          {activeTab === 'GUARANTORS' && (
            <LoanOriginationStep2Guarantors
              members={members}
              guarantor1Id={guarantor1Id}
              onGuarantor1IdChange={setGuarantor1Id}
              guarantor1={guarantor1}
              guarantor2Id={guarantor2Id}
              onGuarantor2IdChange={setGuarantor2Id}
              guarantor2={guarantor2}
            />
          )}

          {activeTab === 'COLLATERAL' && (
            <LoanOriginationStep3Collateral
              collateralType={collateralType}
              onCollateralTypeChange={setCollateralType}
              collateralPlotNo={collateralPlotNo}
              onCollateralPlotNoChange={setCollateralPlotNo}
              collateralArea={collateralArea}
              onCollateralAreaChange={setCollateralArea}
              collateralMarketValue={collateralMarketValue}
              onCollateralMarketValueChange={setCollateralMarketValue}
              ltvRatio={ltvRatio}
              disbursementMethod={disbursementMethod}
              onDisbursementMethodChange={setDisbursementMethod}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab !== 'COLLATERAL' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'SCHEME') setActiveTab('GUARANTORS');
                  else if (activeTab === 'GUARANTORS') setActiveTab('COLLATERAL');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
              >
                {t('अर्को खण्ड (Next)', 'Next Section')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg transition"
              >
                <CheckCircle2 className="size-4" />
                <span>{t('कर्जा आवेदन दर्ता गर्नुहोस्', 'Originate Loan Application')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
