import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import { Loan, Member, LoanProvisionCategory } from '../../types';
import {
  DISTRESS_REASONS,
  DistressReasonCategory,
  checkReschedulingEligibility,
  calculateRescheduledAmortization,
  generateReschedulingDeed,
  calculateRestructuredProvision,
  exportRescheduledLoansCsv,
  RescheduledLoanRecord,
  ReschedulingTerms,
} from '../../utils/loanRescheduling';
import {
  X,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  ShieldCheck,
  Calculator,
  Calendar,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface LoanReschedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: readonly Loan[];
  members: readonly Member[];
  initialLoanId?: string;
  onRescheduleSuccess?: (record: RescheduledLoanRecord) => void;
}

export const LoanReschedulingModal: React.FC<LoanReschedulingModalProps> = ({
  isOpen,
  onClose,
  loans,
  members,
  initialLoanId,
  onRescheduleSuccess,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtPercent } = useLanguageStore();
  const { coopSettings, rescheduleLoan } = useCoopStore();

  const [activeTab, setActiveTab] = useState<'ELIGIBILITY' | 'AMORTIZATION' | 'DEED' | 'REGISTER'>('ELIGIBILITY');
  const [selectedLoanId, setSelectedLoanId] = useState<string>(initialLoanId || loans[0]?.id || '');

  // Form Inputs
  const [accruedInterestInput, setAccruedInterestInput] = useState<number>(35000);
  const [interestPaidInput, setInterestPaidInput] = useState<number>(10000);
  const [distressReason, setDistressReason] = useState<DistressReasonCategory>('FLOOD_NATURAL_DISASTER');
  const [distressDescription, setDistressDescription] = useState('राप्ती नदीको बाढीले धानबाली र बाख्रा गोठमा क्षति पुगेको।');
  const [revivalPlanSummary, setRevivalPlanSummary] = useState('तरकारी खेती र स्थानीय कुखुरा पालनबाट मासिक आम्दानी पुनः सुरु गर्ने योजना।');

  // Terms Configuration
  const [extendedTenureMonths, setExtendedTenureMonths] = useState<number>(24);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(2);
  const [moratoriumHandling, setMoratoriumHandling] = useState<'PAY_INTEREST_MONTHLY' | 'CAPITALIZE_TO_PRINCIPAL'>('PAY_INTEREST_MONTHLY');
  const [customInterestRate, setCustomInterestRate] = useState<number>(11.5);
  const [lumpSumDownPayment, setLumpSumDownPayment] = useState<number>(0);
  const [startDateBS, setStartDateBS] = useState<string>('2081/07/01');

  // Governance Inputs
  const [creditCommitteeMinuteNo, setCreditCommitteeMinuteNo] = useState<string>('CC-2081-34');
  const [bodDecisionMinuteNo, setBodDecisionMinuteNo] = useState<string>('BOD-2081-112');
  const [officerName, setOfficerName] = useState<string>('ऋण अधिकृत - सुमन शर्मा');

  const [copiedDeed, setCopiedDeed] = useState(false);
  const [rescheduledRecords, setRescheduledRecords] = useState<RescheduledLoanRecord[]>([
    {
      deedNo: 'TAMASSUK-RESTRUCT-20810515-0042',
      loanNo: 'LN-2079-012',
      memberNo: 'M-10004',
      memberName: 'सीता देवी थारु',
      distressReason: 'AGRICULTURAL_LIVESTOCK_LOSS',
      oldPrincipal: 280000,
      newPrincipal: 280000,
      newRate: 11.5,
      extendedTenure: 24,
      moratoriumMonths: 3,
      revisedEmi: 13200,
      bodMinuteNo: 'BOD-2081-089',
      restructuredDate: '2081/05/15',
      status: 'ACTIVE_PROBATION',
    },
  ]);

  // Selected Loan & Member
  const selectedLoan = useMemo(() => {
    return loans.find((l) => l.id === selectedLoanId) || loans[0];
  }, [loans, selectedLoanId]);

  const selectedMember = useMemo(() => {
    if (!selectedLoan) return undefined;
    return members.find((m) => m.id === selectedLoan.memberId);
  }, [members, selectedLoan]);

  // Eligibility Evaluation
  const eligibility = useMemo(() => {
    if (!selectedLoan) {
      return {
        isEligible: false,
        reasons: ['No loan selected'],
        minRequiredInterestPayment: 0,
        actualInterestPaid: 0,
        interestPaymentRatio: 0,
        shortfallAmount: 0,
      };
    }
    const balance = Math.max(0, selectedLoan.remainingBalance - lumpSumDownPayment);
    return checkReschedulingEligibility(
      balance,
      accruedInterestInput,
      interestPaidInput,
      distressReason,
      Boolean(revivalPlanSummary.trim())
    );
  }, [selectedLoan, lumpSumDownPayment, accruedInterestInput, interestPaidInput, distressReason, revivalPlanSummary]);

  // Restructured Principal
  const restructuredPrincipal = useMemo(() => {
    if (!selectedLoan) return 0;
    return Math.max(0, selectedLoan.remainingBalance - lumpSumDownPayment);
  }, [selectedLoan, lumpSumDownPayment]);

  // Amortization Schedule
  const amortizationSchedule = useMemo(() => {
    if (restructuredPrincipal <= 0) return [];
    return calculateRescheduledAmortization(
      restructuredPrincipal,
      customInterestRate,
      extendedTenureMonths,
      moratoriumMonths,
      startDateBS,
      moratoriumHandling
    );
  }, [
    restructuredPrincipal,
    customInterestRate,
    extendedTenureMonths,
    moratoriumMonths,
    startDateBS,
    moratoriumHandling,
  ]);

  // KPIs
  const totalInterestPayable = useMemo(() => {
    return amortizationSchedule.reduce((sum, item) => sum + item.interestPayment, 0);
  }, [amortizationSchedule]);

  const revisedEmi = useMemo(() => {
    const regularItem = amortizationSchedule.find((s) => !s.isMoratorium) ?? amortizationSchedule[0];
    return regularItem ? regularItem.totalEmi : 0;
  }, [amortizationSchedule]);

  // Statutory Provisioning Check
  const statutoryProvision = useMemo(() => {
    const prevCat: LoanProvisionCategory =
      selectedLoan?.status === 'OVERDUE' ? 'SUBSTAND' : 'WATCHLIST';
    return calculateRestructuredProvision(restructuredPrincipal, prevCat);
  }, [selectedLoan, restructuredPrincipal]);

  // Legal Deed
  const terms: ReschedulingTerms = useMemo(() => {
    return {
      restructuredDate: startDateBS,
      restructuredPrincipal,
      annualInterestRate: customInterestRate,
      extendedTenureMonths,
      moratoriumMonths,
      moratoriumInterestHandling: moratoriumHandling,
      distressReason,
      distressDescription,
      revivalPlanSummary,
      creditCommitteeMinuteNo,
      bodDecisionMinuteNo,
      officerName,
    };
  }, [
    startDateBS,
    restructuredPrincipal,
    customInterestRate,
    extendedTenureMonths,
    moratoriumMonths,
    moratoriumHandling,
    distressReason,
    distressDescription,
    revivalPlanSummary,
    creditCommitteeMinuteNo,
    bodDecisionMinuteNo,
    officerName,
  ]);

  const deed = useMemo(() => {
    if (!selectedLoan || !selectedMember) return null;
    return generateReschedulingDeed(selectedLoan, selectedMember, terms, amortizationSchedule);
  }, [selectedLoan, selectedMember, terms, amortizationSchedule]);

  if (!isOpen || !selectedLoan) return null;

  const handleCopyDeed = () => {
    if (!deed) return;
    navigator.clipboard.writeText(`${deed.statutoryCitation}\n\n${deed.bodyNepaliText}`);
    setCopiedDeed(true);
    setTimeout(() => setCopiedDeed(false), 2000);
  };

  const handlePrint = () => {
    if (!deed) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>तमसुक - ${deed.deedNo}</title>
        <style>
          body { font-family: 'Mukti', 'Kalimati', 'Arial', sans-serif; padding: 30px; line-height: 1.6; color: #111; }
          .header { text-align: center; border-bottom: 2px dashed #444; padding-bottom: 12px; margin-bottom: 20px; }
          .inst-name { font-size: 20px; font-weight: bold; margin: 0; }
          .inst-sub { font-size: 13px; margin: 2px 0; }
          .title-box { display: inline-block; padding: 4px 14px; background: #eee; font-weight: bold; font-size: 14px; margin-top: 10px; border: 1px solid #ccc; }
          .meta { font-size: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; }
          .deed-text { font-size: 13px; text-align: justify; white-space: pre-line; margin-bottom: 30px; }
          .signatures { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center; margin-top: 40px; font-size: 12px; }
          .sig-line { border-bottom: 1px dotted #555; height: 35px; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <p class="inst-name">${coopSettings.nameNepali}</p>
          <p class="inst-sub">${coopSettings.addressNepali} | दर्ता नं. ${coopSettings.regNo} | पान नं. ${coopSettings.panNo}</p>
          <div class="title-box">कर्जा पुनर्तालिकीकरण तथा पुनर्संरचना सम्झौता पत्र (तमसुक)</div>
        </div>
        <div class="meta">
          <span>तमसुक नं: <b>${deed.deedNo}</b></span>
          <span>मिति: <b>${deed.executionDateNepali}</b></span>
        </div>
        <div class="deed-text">${deed.bodyNepaliText}</div>
        <div class="signatures">
          <div><div class="sig-line"></div><b>${deed.borrowerName}</b><br><small>ऋणी सदस्य</small></div>
          <div><div class="sig-line"></div><b>........................</b><br><small>जमानतदार / रोहबर</small></div>
          <div><div class="sig-line"></div><b>${officerName}</b><br><small>ऋण उपसमिति / अधिकृत</small></div>
          <div><div class="sig-line"></div><b>संस्थाको छाप / व्यवस्थापक</b><br><small>${coopSettings.nameNepali}</small></div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const handleSaveAndExecute = () => {
    if (!selectedMember || !deed) return;
    const newRecord: RescheduledLoanRecord = {
      deedNo: deed.deedNo,
      loanNo: selectedLoan.loanNo,
      memberNo: selectedMember.memberNo,
      memberName: selectedMember.name,
      distressReason,
      oldPrincipal: selectedLoan.remainingBalance,
      newPrincipal: restructuredPrincipal,
      newRate: customInterestRate,
      extendedTenure: extendedTenureMonths,
      moratoriumMonths,
      revisedEmi,
      bodMinuteNo: bodDecisionMinuteNo,
      restructuredDate: startDateBS,
      status: 'ACTIVE_PROBATION',
    };

    // Wire to store: update loan and ledger
    rescheduleLoan(selectedLoan.loanNo, {
      newPrincipal: restructuredPrincipal,
      newRate: customInterestRate,
      extendedTenure: extendedTenureMonths,
      revisedEmi,
      downPayment: lumpSumDownPayment,
      note: deed.deedNo,
    });

    setRescheduledRecords((prev) => [newRecord, ...prev]);
    if (onRescheduleSuccess) {
      onRescheduleSuccess(newRecord);
    }
    setActiveTab('REGISTER');
  };

  const handleDownloadCsv = () => {
    const csv = exportRescheduledLoansCsv(rescheduledRecords);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `unako_loan_rescheduling_register_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Scale className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('कर्जा पुनर्तालिकीकरण तथा पुनर्संरचना व्यवस्थापन', 'Statutory Loan Rescheduling & Restructuring')}
                </h2>
                <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                  सहकारी ऐन २०७४
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'प्राकृतिक प्रकोप, रोग वा मन्दीबाट पीडित सदस्यको कर्जा पुनर्संरचना तथा २५% ब्याज असुली गेटवे',
                  'Cooperative Act 2074 compliant distress loan restructuring with 25% overdue interest recovery'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Loan Selector Bar */}
        <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('ऋणी कर्जा छनोट:', 'Select Loan Account:')}
            </label>
            <select
              value={selectedLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
              className="text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {loans.map((l) => {
                const mem = members.find((m) => m.id === l.memberId);
                return (
                  <option key={l.id} value={l.id}>
                    {l.loanNo} - {mem?.name ?? 'Member'} ({fmtCurrency(l.remainingBalance, true)}) [{l.status}]
                  </option>
                );
              })}
            </select>
          </div>

          {selectedMember && (
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>
                {t('सदस्य:', 'Member:')} <strong className="text-slate-900 dark:text-white">{selectedMember.name}</strong> ({fmtDigits(selectedMember.memberNo)})
              </span>
              <span>
                {t('बाँकी साँवा:', 'Balance:')} <strong className="text-amber-600 dark:text-amber-400">{fmtCurrency(selectedLoan.remainingBalance, true)}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('ELIGIBILITY')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'ELIGIBILITY'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>{t('१. योग्यता तथा २५% ब्याज असुली', '1. Eligibility & 25% Interest Gate')}</span>
          </button>

          <button
            onClick={() => setActiveTab('AMORTIZATION')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'AMORTIZATION'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="size-4" />
            <span>{t('२. किस्ता तालिका सिमुलेटर (EMI)', '2. Amortization Simulator')}</span>
          </button>

          <button
            onClick={() => setActiveTab('DEED')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'DEED'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="size-4" />
            <span>{t('३. पुनर्संरचना तमसुक सम्झौता', '3. Restructuring Legal Deed')}</span>
          </button>

          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'REGISTER'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="size-4" />
            <span>{t('४. दर्ता किताब तथा CSV', '4. Register & CSV')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto grow space-y-6">
          {/* TAB 1: ELIGIBILITY & 25% INTEREST GATE */}
          {activeTab === 'ELIGIBILITY' && (
            <div className="space-y-6">
              {/* Eligibility Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-4 ${
                  eligibility.isEligible
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                {eligibility.isEligible ? (
                  <CheckCircle2 className="size-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="size-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 grow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">
                      {eligibility.isEligible
                        ? t('पुनर्तालिकीकरणका लागि योग्य', 'Eligible for Restructuring')
                        : t('सर्त अपुग', 'Conditions Unmet for Restructuring')}
                    </h3>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 shadow-xs">
                      {t('असुली दर:', 'Paid Ratio:')} {fmtPercent(eligibility.interestPaymentRatio * 100)}
                    </span>
                  </div>
                  {!eligibility.isEligible && (
                    <ul className="text-xs list-disc pl-4 space-y-0.5 text-rose-700 dark:text-rose-300">
                      {eligibility.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                  {eligibility.isEligible && (
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      {t(
                        'कम्तीमा २५% ब्याज असुली, उचित विपद् कारण र व्यवसाय पुनरुत्थान योजना प्रमाणित भएको छ।',
                        'Minimum 25% overdue interest cleared, distress reason verified, and revival plan attached.'
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 25% Overdue Interest Gate Card */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Calculator className="size-4 text-amber-500" />
                    <span>{t('पाकेको ब्याज तथा २५% न्यूनतम असुली', 'Accrued Overdue Interest & 25% Gate')}</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                        {t('कुल पाकेको/भाखा नाघेको ब्याज (NPR)', 'Total Accrued Overdue Interest (NPR)')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={accruedInterestInput}
                        onChange={(e) => setAccruedInterestInput(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-800 dark:text-amber-300">
                        {t('२५% अनिवार्य न्यूनतम असुली रकम:', '25% Mandatory Threshold:')}
                      </span>
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-200 text-sm">
                        {fmtCurrency(eligibility.minRequiredInterestPayment, true)}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                        {t('ऋणीले दाखिला गरेको/चुक्ता ब्याज रकम (NPR)', 'Interest Actually Paid in Cash (NPR)')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={interestPaidInput}
                        onChange={(e) => setInterestPaidInput(parseFloat(e.target.value) || 0)}
                        className={`w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                          interestPaidInput >= eligibility.minRequiredInterestPayment
                            ? 'border-emerald-500 focus:ring-emerald-500'
                            : 'border-rose-500 focus:ring-rose-500'
                        }`}
                      />
                    </div>

                    {eligibility.shortfallAmount > 0 && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                        {t('अपुग रकम:', 'Shortfall:')} {fmtCurrency(eligibility.shortfallAmount, true)} {t('थप दाखिला गर्नुपर्नेछ।', 'more needed.')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Distress Reason & Revival Plan */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <AlertTriangle className="size-4 text-amber-500" />
                    <span>{t('मनासिब विपद् कारण तथा कार्ययोजना', 'Distress Cause & Revival Plan')}</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                        {t('विपद् वर्ग', 'Distress Category')}
                      </label>
                      <select
                        value={distressReason}
                        onChange={(e) => setDistressReason(e.target.value as DistressReasonCategory)}
                        className="w-full text-xs font-medium bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {Object.entries(DISTRESS_REASONS).map(([key, item]) => (
                          <option key={key} value={key}>
                            {item.labelNepali} ({item.labelEnglish})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                        {t('विपद् / समस्याको संक्षिप्त विवरण', 'Specific Damage / Incident Description')}
                      </label>
                      <textarea
                        rows={2}
                        value={distressDescription}
                        onChange={(e) => setDistressDescription(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="बाढी, आगलागी वा रोगले भएको क्षतिको विवरण..."
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                        {t('व्यवसाय पुनरुत्थान कार्ययोजना', 'Business Revival & Income Plan')}
                      </label>
                      <textarea
                        rows={2}
                        value={revivalPlanSummary}
                        onChange={(e) => setRevivalPlanSummary(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="ऋणीले आगामी दिनमा कसरी आम्दानी गरी किस्ता तिर्नेछ..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('AMORTIZATION')}
                  disabled={!eligibility.isEligible}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    eligibility.isEligible
                      ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>{t('किस्ता तालिका सिमुलेटरमा जानुहोस्', 'Proceed to Amortization Simulator')}</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AMORTIZATION SIMULATOR */}
          {activeTab === 'AMORTIZATION' && (
            <div className="space-y-6">
              {/* Term Configuration Panel */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calculator className="size-4 text-amber-500" />
                    {t('पुनर्तालिकीकरण सर्तहरू', 'Restructuring Terms')}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                    घट्दो साँवा विधि (Reducing Balance EMI)
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      {t('एकमूष्ठ साँवा भुक्तानी', 'Lump-sum Principal Paid')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={lumpSumDownPayment}
                      onChange={(e) => setLumpSumDownPayment(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      {t('संशोधित ब्याजदर (% p.a.)', 'Revised Annual Rate (%)')}
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="1"
                      max="20"
                      value={customInterestRate}
                      onChange={(e) => setCustomInterestRate(parseFloat(e.target.value) || 12)}
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      {t('थपिएको नयाँ अवधि (महिना)', 'Extended Tenure (Months)')}
                    </label>
                    <input
                      type="number"
                      min="6"
                      max="60"
                      value={extendedTenureMonths}
                      onChange={(e) => setExtendedTenureMonths(parseInt(e.target.value, 10) || 12)}
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      {t('ग्रेस / किस्ता स्थगन (महिना)', 'Moratorium / Grace (Months)')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={moratoriumMonths}
                      onChange={(e) => setMoratoriumMonths(parseInt(e.target.value, 10) || 0)}
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      {t('ग्रेस अवधिमा ब्याज व्यवस्थापन', 'Interest Handling During Moratorium')}
                    </label>
                    <select
                      value={moratoriumHandling}
                      onChange={(e) => setMoratoriumHandling(e.target.value as any)}
                      className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    >
                      <option value="PAY_INTEREST_MONTHLY">
                        {t('मासिक रूपमा ब्याज मात्र चुक्ता गर्ने', 'Pay Interest Monthly')}
                      </option>
                      <option value="CAPITALIZE_TO_PRINCIPAL">
                        {t('साँवामा पुँजीकरण गर्ने', 'Capitalize into Principal')}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      {t('लागू हुने मिति (BS)', 'Effective Date (BS)')}
                    </label>
                    <input
                      type="text"
                      value={startDateBS}
                      onChange={(e) => setStartDateBS(e.target.value)}
                      placeholder="2081/07/01"
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {t('संशोधित नयाँ किस्ता', 'Revised EMI')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                    {fmtCurrency(revisedEmi, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('मासिक किस्ता भुक्तानी', 'per month')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t('नयाँ साँवा आधार', 'Principal Base')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-white mt-1">
                    {fmtCurrency(restructuredPrincipal, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('बाँकी साँवा दायित्व', 'restructured debt')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t('कुल ब्याज दायित्व', 'Total Interest')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-white mt-1">
                    {fmtCurrency(totalInterestPayable, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {fmtDigits(extendedTenureMonths)} {t('महिनाभरिको कुल', 'over entire tenure')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    {t('नोक्सानी जगेडा', 'Statutory Provision')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-purple-600 dark:text-purple-300 mt-1">
                    {fmtPercent(statutoryProvision.statutoryProvisionPercent)}
                  </p>
                  <p className="text-[10px] text-purple-600/80 dark:text-purple-400 mt-0.5">
                    {fmtCurrency(statutoryProvision.provisionAmount, true)} ({statutoryProvision.probationMonths} {t('महिना प्रोबेसन', 'mo probation')})
                  </p>
                </div>
              </div>

              {/* Amortization Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-4 py-3 bg-slate-100/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="size-4 text-amber-500" />
                    {t('संशोधित किस्ता भुक्तानी तालिका', 'Revised Amortization Schedule')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {amortizationSchedule.length} {t('किस्ताहरू', 'installments')}
                  </span>
                </div>

                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">{t('भाखा मिति', 'Due Date')}</th>
                        <th className="px-3 py-2 text-right">{t('सुरुवाती साँवा', 'Opening Balance')}</th>
                        <th className="px-3 py-2 text-right">{t('साँवा किस्ता', 'Principal Part')}</th>
                        <th className="px-3 py-2 text-right">{t('ब्याज किस्ता', 'Interest Part')}</th>
                        <th className="px-3 py-2 text-right">{t('जम्मा EMI', 'Total EMI')}</th>
                        <th className="px-3 py-2 text-right">{t('अन्तिम बाँकी', 'Closing Balance')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      {amortizationSchedule.map((row) => (
                        <tr
                          key={row.installmentNo}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 ${
                            row.isMoratorium ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <td className="px-3 py-2 font-bold text-slate-600 dark:text-slate-400">
                            {fmtDigits(row.installmentNo)}
                            {row.isMoratorium && (
                              <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-sans">
                                {t('ग्रेस', 'Grace')}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                            {fmtDigits(row.dueDate)}
                          </td>
                          <td className="px-3 py-2 text-right">{fmtCurrency(row.openingBalance, false)}</td>
                          <td className="px-3 py-2 text-right text-emerald-600 dark:text-emerald-400">
                            {fmtCurrency(row.principalPayment, false)}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">
                            {fmtCurrency(row.interestPayment, false)}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-amber-600 dark:text-amber-400">
                            {fmtCurrency(row.totalEmi, false)}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                            {fmtCurrency(row.closingBalance, false)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Navigation button */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('ELIGIBILITY')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  ← {t('पछाडि जानुहोस्', 'Back')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('DEED')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md cursor-pointer"
                >
                  <span>{t('तमसुक सम्झौता तयार गर्नुहोस्', 'Generate Restructuring Deed')}</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LEGAL RESTRUCTURING DEED */}
          {activeTab === 'DEED' && deed && (
            <div className="space-y-6">
              {/* Governance Minute Inputs */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    {t('ऋण उपसमिति सिफारिस निर्णय नं.', 'Credit Committee Minute No')}
                  </label>
                  <input
                    type="text"
                    value={creditCommitteeMinuteNo}
                    onChange={(e) => setCreditCommitteeMinuteNo(e.target.value)}
                    className="w-full text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    {t('सञ्चालक समिति निर्णय नं.', 'BOD Decision Minute No')}
                  </label>
                  <input
                    type="text"
                    value={bodDecisionMinuteNo}
                    onChange={(e) => setBodDecisionMinuteNo(e.target.value)}
                    className="w-full text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    {t('जिम्मेवार अधिकृतको नाम', 'Officer In-Charge')}
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Legal Deed Paper */}
              <div className="p-6 rounded-2xl border border-slate-300 dark:border-slate-700 bg-amber-50/10 dark:bg-slate-950/80 shadow-md space-y-6">
                {/* Letterhead */}
                <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {coopSettings.nameNepali}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {coopSettings.addressNepali} | {t('दर्ता नं.', 'Reg No.')} {coopSettings.regNo}
                  </p>
                  <div className="pt-2">
                    <span className="inline-block px-3 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                      कर्जा पुनर्तालिकीकरण तथा पुनर्संरचना सम्झौता पत्र (तमसुक)
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 pt-1">
                    तमसुक नं: <strong className="text-slate-800 dark:text-slate-200">{deed.deedNo}</strong> | मिति: {fmtDigits(deed.executionDateNepali)}
                  </p>
                </div>

                {/* Deed Text */}
                <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-serif bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {deed.bodyNepaliText}
                </div>

                {/* Signature Blocks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-300 dark:border-slate-700 text-center text-xs">
                  <div className="space-y-8">
                    <div className="border-b border-dotted border-slate-400 dark:border-slate-600 h-8"></div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {deed.borrowerName}
                      <br />
                      <span className="text-[10px] text-slate-500">ऋणी सदस्य</span>
                    </p>
                  </div>

                  <div className="space-y-8">
                    <div className="border-b border-dotted border-slate-400 dark:border-slate-600 h-8"></div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      ........................
                      <br />
                      <span className="text-[10px] text-slate-500">जमानतदार / रोहबर</span>
                    </p>
                  </div>

                  <div className="space-y-8">
                    <div className="border-b border-dotted border-slate-400 dark:border-slate-600 h-8"></div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {officerName}
                      <br />
                      <span className="text-[10px] text-slate-500">ऋण उपसमिति / अधिकृत</span>
                    </p>
                  </div>

                  <div className="space-y-8">
                    <div className="border-b border-dotted border-slate-400 dark:border-slate-600 h-8"></div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      संस्थाको छाप / व्यवस्थापक
                      <br />
                      <span className="text-[10px] text-slate-500">{coopSettings.nameNepali}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyDeed}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <Copy className="size-3.5" />
                    <span>{copiedDeed ? t('कपी गरियो!', 'Copied!') : t('पाठ कपी गर्नुहोस्', 'Copy Text')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <Printer className="size-3.5" />
                    <span>{t('प्रिन्ट गर्नुहोस्', 'Print Deed')}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAndExecute}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="size-4" />
                  <span>{t('पुनर्तालिकीकरण प्रमाणीकरण गरी दर्ता गर्नुहोस्', 'Approve & Register Restructuring')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: RESTRUCTURED REGISTER & CSV */}
          {activeTab === 'REGISTER' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('पुनर्तालिकीकरण ऋण दर्ता किताब', 'Rescheduled Loans Statutory Register')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t(
                      'सहकारी ऐन तथा कोपोमिस (COPOMIS) प्रतिवेदन प्रयोजनार्थ दर्ता किताब',
                      'Statutory register for internal audit and regulatory COPOMIS reporting'
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-xs cursor-pointer"
                >
                  <Download className="size-4" />
                  <span>{t('CSV डाउनलोड', 'Export CSV')}</span>
                </button>
              </div>

              {/* Register Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2.5">Deed No</th>
                        <th className="px-3 py-2.5">{t('कर्जा नं.', 'Loan No')}</th>
                        <th className="px-3 py-2.5">{t('सदस्य विवरण', 'Member')}</th>
                        <th className="px-3 py-2.5">{t('विपद् कारण', 'Distress Cause')}</th>
                        <th className="px-3 py-2.5 text-right">{t('नयाँ साँवा', 'Restructured Principal')}</th>
                        <th className="px-3 py-2.5 text-center">{t('अवधि', 'Tenure')}</th>
                        <th className="px-3 py-2.5 text-right">{t('नयाँ EMI', 'Revised EMI')}</th>
                        <th className="px-3 py-2.5">{t('निर्णय नं.', 'Minute No')}</th>
                        <th className="px-3 py-2.5 text-center">{t('स्थिति', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {rescheduledRecords.map((rec) => (
                        <tr key={rec.deedNo} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="px-3 py-2.5 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            {rec.deedNo}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[11px]">{rec.loanNo}</td>
                          <td className="px-3 py-2.5">
                            <span className="font-bold text-slate-900 dark:text-white">{rec.memberName}</span>
                            <p className="text-[10px] text-slate-400 font-mono">{rec.memberNo}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {DISTRESS_REASONS[rec.distressReason]?.labelNepali ?? rec.distressReason}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold">
                            {fmtCurrency(rec.newPrincipal, true)}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono text-[11px]">
                            {fmtDigits(rec.extendedTenure)} mo
                            {rec.moratoriumMonths > 0 && ` (${fmtDigits(rec.moratoriumMonths)} g)`}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {fmtCurrency(rec.revisedEmi, true)}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500">{rec.bodMinuteNo}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
