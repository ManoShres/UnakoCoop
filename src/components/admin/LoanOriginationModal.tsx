import React, { useState, useMemo } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LoanApplication, LoanType, CollateralType, LOAN_SCHEMES } from '../../types';
import {
  Calculator,
  X,
  Users,
  ShieldCheck,
  AlertCircle,
  Search,
  CheckCircle2,
} from 'lucide-react';

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
  const { t, fmtCurrency, fmtDigits, fmtPhone, fmtPercent, fmtCount } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'SCHEME' | 'GUARANTORS' | 'COLLATERAL'>('SCHEME');
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
  const [collateralOwner, setCollateralOwner] = useState('');
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
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Calculator className="size-6 text-emerald-300" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                {t('सहकारी काउन्टर ऋण आवेदन तथा वित्तीय विश्लेषण', 'Counter Loan Origination & Credit Underwriting')}
              </div>
              <h2 id="loan-origination-title" className="text-lg font-black tracking-tight">
                {t('नयाँ कर्जा आवेदन तथा ईएमआई सिमुलेटर', 'New Loan Origination & Live EMI Simulator')}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('बन्द गर्नुहोस्', 'Close')}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('SCHEME')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'SCHEME'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Calculator className="size-4" />
            <span>{t('१. ऋणी, योजना तथा किस्ता', '1. Scheme & Live EMI')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('GUARANTORS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'GUARANTORS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Users className="size-4" />
            <span>{t('२. जमानी बस्ने सदस्यहरू', '2. Dual Co-Guarantors')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COLLATERAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'COLLATERAL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>{t('३. धितो विवरण तथा भुक्तानी', '3. Collateral & Payout')}</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: Scheme & Live EMI */}
          {activeTab === 'SCHEME' && (
            <div className="space-y-4 animate-fade-in">
              {/* Member Picker */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('आवेदक सदस्य चयन (Search Member) *', 'Select Applicant Member *')}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {fmtCount(filteredMembers.length)} {t('सदस्यहरू उपलब्ध', 'members available')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search className="size-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t('नाम, सदस्य नं. वा फोनबाट खोज्नुहोस्...', 'Search name, member no, phone...')}
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    {filteredMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {t(m.nameNepali || m.name, m.name)} ({fmtDigits(m.memberNo)}) • {t('मौज्दात: ', 'Balance: ')}{fmtCurrency(m.totalSavings, true)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMember && (
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">{t('बचत मौज्दात', 'Savings Balance')}</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {fmtCurrency(selectedMember.totalSavings, true)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">{t('शेयर पुँजी', 'Share Capital')}</div>
                      <div className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {fmtCurrency(selectedMember.shareCapital, true)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">{t('सक्रिय ऋण', 'Active Loan')}</div>
                      <div className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                        {fmtCurrency(selectedMember.activeLoanBalance, true)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">{t('क्रेडिट स्कोर', 'Credit Score')}</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {fmtDigits(selectedMember.creditScore)} / {fmtDigits(900)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Loan Scheme & Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('कर्जा योजना (Loan Scheme) *', 'Loan Scheme *')}
                  </label>
                  <select
                    value={loanType}
                    onChange={(e) => handleSchemeChange(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    {LOAN_SCHEMES.map((s) => (
                      <option key={s.type} value={s.type}>
                        {t(s.labelNe, s.labelEn)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('माग गरिएको सावाँ रकम (रु.) *', 'Principal Amount (NPR) *')}
                  </label>
                  <input
                    type="number"
                    step={10000}
                    min={10000}
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('भुक्तानी अवधि (महिना) *', 'Tenure (Months) *')}
                  </label>
                  <select
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value={6}>६ महिना (6 Months)</option>
                    <option value={12}>१२ महिना (1 Year)</option>
                    <option value={18}>१८ महिना (1.5 Years)</option>
                    <option value={24}>२४ महिना (2 Years)</option>
                    <option value={36}>३६ महिना (3 Years)</option>
                    <option value={48}>४८ महिना (4 Years)</option>
                    <option value={60}>६० महिना (5 Years)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('ब्याजदर (% p.a.) *', 'Annual Interest Rate (%) *')}
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    min={5}
                    max={20}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('आवेदकको मासिक आय (रु.)', 'Monthly Income (NPR)')}
                  </label>
                  <input
                    type="number"
                    step={5000}
                    min={10000}
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('कर्जाको मुख्य प्रयोजन', 'Loan Purpose')}
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="जस्तै: कृषि औजार खरिद"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* LIVE EMI & AMORTIZATION PREVIEW WIDGET */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Calculator className="size-4 text-emerald-600" />
                    <span>{t('घट्दो मौज्दात अनुसार किस्ता गणना (Live Diminishing EMI Calculator)', 'Live Diminishing EMI Calculation')}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">
                    {fmtPercent(interestRate)} p.a. • {fmtDigits(tenureMonths)} M
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40">
                    <div className="text-[10px] text-slate-500 font-medium">{t('मासिक किस्ता (EMI)', 'Monthly EMI')}</div>
                    <div className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                      {fmtCurrency(monthlyEmi, true)}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40">
                    <div className="text-[10px] text-slate-500 font-medium">{t('कुल ब्याज (Total Interest)', 'Total Interest')}</div>
                    <div className="text-base font-bold text-blue-700 dark:text-blue-400 font-mono mt-0.5">
                      {fmtCurrency(totalInterest, true)}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40">
                    <div className="text-[10px] text-slate-500 font-medium">{t('जम्मा फिर्ता रकम', 'Total Payable')}</div>
                    <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                      {fmtCurrency(totalPayable, true)}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40">
                    <div className="text-[10px] text-slate-500 font-medium">{t('सेवा शुल्क (१%)', 'Processing Fee (1%)')}</div>
                    <div className="text-base font-bold text-amber-700 dark:text-amber-400 font-mono mt-0.5">
                      {fmtCurrency(serviceFee, true)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Dual Co-Guarantors */}
          {activeTab === 'GUARANTORS' && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('२. जमानी बस्ने २ जना सक्रिय सहकारी सदस्यहरू', '2. Dual Member Co-Guarantors')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('सहकारी मापदण्ड अनुसार कर्जा सुरक्षणका लागि कम्तीमा २ जना राम्रो वित्तीय छवि भएका सदस्य जमानी अनिवार्य हुन्छ।', 'Cooperative standards mandate 2 active members with sound credit history as co-guarantors.')}
                </p>
              </div>

              {/* Guarantor 1 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>{t('पहिलो जमानीकर्ता सदस्य (Guarantor 1) *', 'First Co-Guarantor *')}</span>
                  {guarantor1 && (
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">
                      {fmtDigits(guarantor1.memberNo)}
                    </span>
                  )}
                </div>
                <select
                  value={guarantor1Id}
                  onChange={(e) => setGuarantor1Id(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="">{t('-- सदस्य छान्नुहोस् --', '-- Select Member --')}</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {t(m.nameNepali || m.name, m.name)} ({fmtDigits(m.memberNo)}) • {t('फोन: ', 'Phone: ')}{fmtPhone(m.phone)} • {t('बचत: ', 'Savings: ')}{fmtCurrency(m.totalSavings, true)}
                    </option>
                  ))}
                </select>
                {guarantor1 && (
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">{t('ठेगाना', 'Address')}</div>
                      <div className="font-medium text-slate-700 dark:text-slate-300 truncate">
                        {fmtDigits(t(guarantor1.addressNepali || guarantor1.address, guarantor1.address))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">{t('बचत रकम', 'Savings')}</div>
                      <div className="font-bold text-emerald-600 font-mono">{fmtCurrency(guarantor1.totalSavings, true)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">{t('क्रेडिट स्कोर', 'Score')}</div>
                      <div className="font-bold text-blue-600 font-mono">{fmtDigits(guarantor1.creditScore)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Guarantor 2 */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>{t('दोस्रो जमानीकर्ता सदस्य (Guarantor 2) *', 'Second Co-Guarantor *')}</span>
                  {guarantor2 && (
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">
                      {fmtDigits(guarantor2.memberNo)}
                    </span>
                  )}
                </div>
                <select
                  value={guarantor2Id}
                  onChange={(e) => setGuarantor2Id(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="">{t('-- सदस्य छान्नुहोस् --', '-- Select Member --')}</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {t(m.nameNepali || m.name, m.name)} ({fmtDigits(m.memberNo)}) • {t('फोन: ', 'Phone: ')}{fmtPhone(m.phone)} • {t('बचत: ', 'Savings: ')}{fmtCurrency(m.totalSavings, true)}
                    </option>
                  ))}
                </select>
                {guarantor2 && (
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">{t('ठेगाना', 'Address')}</div>
                      <div className="font-medium text-slate-700 dark:text-slate-300 truncate">
                        {fmtDigits(t(guarantor2.addressNepali || guarantor2.address, guarantor2.address))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">{t('बचत रकम', 'Savings')}</div>
                      <div className="font-bold text-emerald-600 font-mono">{fmtCurrency(guarantor2.totalSavings, true)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">{t('क्रेडिट स्कोर', 'Score')}</div>
                      <div className="font-bold text-blue-600 font-mono">{fmtDigits(guarantor2.creditScore)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Collateral & Payout */}
          {activeTab === 'COLLATERAL' && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('३. धितो मूल्याङ्कन तथा भुक्तानी माध्यम', '3. Collateral Appraisal & Disbursement Channel')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('लालपुर्जा/घर/मुद्दती धितोको मूल्याङ्कन र ऋण रकम भुक्तानी हुने माध्यम', 'Collateral register specifications, market valuation, and payout method.')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('धितो प्रकार (Collateral Type) *', 'Collateral Type *')}
                  </label>
                  <select
                    value={collateralType}
                    onChange={(e) => setCollateralType(e.target.value as CollateralType)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="LAND_LALPURJA">{t('जग्गा लालपुर्जा (Land Lalpurja)', 'Land Lalpurja')}</option>
                    <option value="BUILDING">{t('घर तथा जग्गा (House & Land)', 'House & Land')}</option>
                    <option value="CASH_FD_PLEDGE">{t('मुद्दती रसिद रोक्का (Fixed Deposit Pledge)', 'FD Pledge')}</option>
                    <option value="SHARE_PLEDGE">{t('सहकारी शेयर रोक्का (Share Pledge)', 'Share Pledge')}</option>
                    <option value="LIVESTOCK">{t('गाई/भैंसी पशुपालन (Livestock)', 'Livestock')}</option>
                    <option value="GOLD_JEWELLERY">{t('सुन/चाँदी गहना (Gold Jewellery)', 'Gold Jewellery')}</option>
                    <option value="VEHICLE">{t('सवारी साधन (Vehicle)', 'Vehicle')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('कित्ता नं. / सिट नं. / धितो पहिचान *', 'Plot No. / Sheet / Identifier *')}
                  </label>
                  <input
                    type="text"
                    value={collateralPlotNo}
                    onChange={(e) => setCollateralPlotNo(e.target.value)}
                    placeholder="जस्तै: कित्ता नं. २१५, सिट नं. ४/ख"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('क्षेत्रफल / विवरण', 'Area / Dimensions')}
                  </label>
                  <input
                    type="text"
                    value={collateralArea}
                    onChange={(e) => setCollateralArea(e.target.value)}
                    placeholder="जस्तै: २ कट्ठा वा ५ आना"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('धितोको बजार मूल्याङ्कन (रु.) *', 'Assessed Market Value (NPR) *')}
                  </label>
                  <input
                    type="number"
                    step={50000}
                    min={50000}
                    value={collateralMarketValue}
                    onChange={(e) => setCollateralMarketValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('कर्जा-धितो अनुपात (LTV Ratio)', 'Loan-to-Value (LTV)')}
                  </label>
                  <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold flex items-center justify-between">
                    <span>{fmtPercent(ltvRatio)}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        ltvRatio <= 60
                          ? 'bg-emerald-100 text-emerald-700'
                          : ltvRatio <= 80
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {ltvRatio <= 60 ? t('सुरक्षित', 'Safe') : ltvRatio <= 80 ? t('मध्यम', 'Moderate') : t('उच्च जोखिम', 'High Risk')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Disbursement Channel */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('कर्जा रकम भुक्तानी हुने माध्यम (Disbursement Method) *', 'Disbursement Channel *')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                      disbursementMethod === 'SAVINGS_ACCOUNT'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="disburseMethod"
                      checked={disbursementMethod === 'SAVINGS_ACCOUNT'}
                      onChange={() => setDisbursementMethod('SAVINGS_ACCOUNT')}
                      className="size-4 text-emerald-600"
                    />
                    <div className="text-xs">
                      <div>{t('बचत खातामा जम्मा', 'Member Savings')}</div>
                      <div className="text-[10px] opacity-75">{t('पासबुकमा सिधै जम्मा', 'Direct to Passbook')}</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                      disbursementMethod === 'CHEQUE'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="disburseMethod"
                      checked={disbursementMethod === 'CHEQUE'}
                      onChange={() => setDisbursementMethod('CHEQUE')}
                      className="size-4 text-emerald-600"
                    />
                    <div className="text-xs">
                      <div>{t('एकाउन्ट पेयी चेक', 'Account Payee Cheque')}</div>
                      <div className="text-[10px] opacity-75">{t('सहकारी चेक जारी', 'Crossed Cheque')}</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                      disbursementMethod === 'CASH'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="disburseMethod"
                      checked={disbursementMethod === 'CASH'}
                      onChange={() => setDisbursementMethod('CASH')}
                      className="size-4 text-emerald-600"
                    />
                    <div className="text-xs">
                      <div>{t('काउन्टर नगद भुक्तानी', 'Counter Cash')}</div>
                      <div className="text-[10px] opacity-75">{t('नगद भर्पाइ मार्फत', 'Cash Voucher')}</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
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
