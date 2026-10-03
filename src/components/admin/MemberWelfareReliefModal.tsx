import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import {
  WelfareClaimRecord,
  WelfareClaimType,
  WelfareClaimStatus,
  WELFARE_STANDARD_BENEFITS,
  INITIAL_WELFARE_CLAIMS,
  validateWelfareClaim,
  calculateNomineeSettlement,
  generateWelfareCopasVoucher,
  exportWelfareClaimsToCsv,
} from '../../utils/memberWelfareEngine';
import { printElement } from '../../utils/printHelper';
import {
  HeartHandshake,
  ShieldCheck,
  FileText,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  Download,
  User,
  Calendar,
  DollarSign,
  X,
  Search,
  Award,
  Building,
  Receipt,
  Scale,
  Sparkles,
} from 'lucide-react';

interface MemberWelfareReliefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFundBalanceChange?: (newBalance: number) => void;
}

export const MemberWelfareReliefModal: React.FC<MemberWelfareReliefModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const {
    members,
    savings,
    loans,
    adjustSavingsBalance,
    recordLoanRepayment,
    addTransaction,
    coopSettings,
  } = useCoopStore();

  const [activeTab, setActiveTab] = useState<'REGISTER' | 'CLAIMS_LIST' | 'NOMINEE_SETTLEMENT' | 'COPAS_VOUCHERS'>('CLAIMS_LIST');
  const [claims, setClaims] = useState<WelfareClaimRecord[]>(INITIAL_WELFARE_CLAIMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedClaimForVoucher, setSelectedClaimForVoucher] = useState<WelfareClaimRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for new claim registration
  const [formMemberId, setFormMemberId] = useState('');
  const [formClaimType, setFormClaimType] = useState<WelfareClaimType>('MEMBER_DEATH');
  const [formAmount, setFormAmount] = useState<number>(WELFARE_STANDARD_BENEFITS.MEMBER_DEATH.defaultAmount);
  const [formEventDate, setFormEventDate] = useState('2081-06-05');
  const [formNomineeName, setFormNomineeName] = useState('');
  const [formNomineeRelation, setFormNomineeRelation] = useState('श्रीमती (Wife)');
  const [formNomineeCitizenship, setFormNomineeCitizenship] = useState('');
  const [formNomineeContact, setFormNomineeContact] = useState('');
  const [formWardCertNo, setFormWardCertNo] = useState('');
  const [formHospitalName, setFormHospitalName] = useState('');
  const [formLoanAccountNo, setFormLoanAccountNo] = useState('');
  const [formOutstandingLoan, setFormOutstandingLoan] = useState<number>(0);
  const [formWaivedLoan, setFormWaivedLoan] = useState<number>(0);
  const [formDisbursementMethod, setFormDisbursementMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'SAVINGS_ACCOUNT'>('BANK_TRANSFER');
  const [formRemarks, setFormRemarks] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Deceased Member Nominee Settlement Calculator State
  const [calcMemberNo, setCalcMemberNo] = useState('MBR-00104');
  const [calcMemberName, setCalcMemberName] = useState('कमल प्रसाद शर्मा');
  const [calcNomineeName, setCalcNomineeName] = useState('राधा शर्मा');
  const [calcNomineeRelation, setCalcNomineeRelation] = useState('श्रीमती (Wife)');
  const [calcShareBalance, setCalcShareBalance] = useState<number>(50000);
  const [calcSavingsBalance, setCalcSavingsBalance] = useState<number>(120000);
  const [calcAccruedInterest, setCalcAccruedInterest] = useState<number>(4500);
  const [calcAccruedDividend, setCalcAccruedDividend] = useState<number>(6000);
  const [calcDeathRelief, setCalcDeathRelief] = useState<number>(35000);
  const [calcFuneralAllowance, setCalcFuneralAllowance] = useState<number>(10000);
  const [calcLoanPrincipal, setCalcLoanPrincipal] = useState<number>(60000);
  const [calcLoanInterest, setCalcLoanInterest] = useState<number>(5000);
  const [calcLoanWaiver, setCalcLoanWaiver] = useState<number>(65000);

  const settlementSummary = useMemo(() => {
    return calculateNomineeSettlement({
      memberId: 'calc-target',
      memberNo: calcMemberNo,
      memberName: calcMemberName,
      nomineeName: calcNomineeName,
      nomineeRelation: calcNomineeRelation,
      shareBalance: calcShareBalance,
      savingsBalance: calcSavingsBalance,
      accruedInterest: calcAccruedInterest,
      accruedDividend: calcAccruedDividend,
      deathReliefAmount: calcDeathRelief,
      funeralAllowance: calcFuneralAllowance,
      outstandingLoanPrincipal: calcLoanPrincipal,
      outstandingLoanInterest: calcLoanInterest,
      loanWaiverAmount: calcLoanWaiver,
    });
  }, [
    calcMemberNo,
    calcMemberName,
    calcNomineeName,
    calcNomineeRelation,
    calcShareBalance,
    calcSavingsBalance,
    calcAccruedInterest,
    calcAccruedDividend,
    calcDeathRelief,
    calcFuneralAllowance,
    calcLoanPrincipal,
    calcLoanInterest,
    calcLoanWaiver,
  ]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setFormMemberId(selectedId);
    const found = members.find((m) => m.id === selectedId);
    if (found && found.nominee?.name) {
      setFormNomineeName(found.nominee.name);
      setFormNomineeRelation(found.nominee.relation || 'हकवाला (Nominee)');
      if (found.nominee.citizenshipNo) {
        setFormNomineeCitizenship(found.nominee.citizenshipNo);
      }
      if (found.nominee.phone) {
        setFormNomineeContact(found.nominee.phone);
      }
    }
  };

  const handleClaimTypeChange = (type: WelfareClaimType) => {
    setFormClaimType(type);
    setFormAmount(WELFARE_STANDARD_BENEFITS[type].defaultAmount);
  };

  const handleRegisterClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find((m) => m.id === formMemberId);
    const memberName = targetMember ? (targetMember.nameNepali || targetMember.name) : 'सदस्य (Member)';
    const memberNo = targetMember ? targetMember.memberNo : 'MBR-999';

    const newClaim: Partial<WelfareClaimRecord> = {
      memberNo,
      memberName,
      claimType: formClaimType,
      claimAmount: formAmount,
      nomineeName: formNomineeName,
      nomineeRelation: formNomineeRelation,
      wardDeathCertNo: formWardCertNo,
      medicalHospitalName: formHospitalName,
    };

    const validation = validateWelfareClaim(newClaim);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    setFormErrors([]);

    const record: WelfareClaimRecord = {
      id: `claim-${Date.now()}`,
      claimNo: `MW-2081/82-00${claims.length + 1}`,
      memberId: formMemberId || 'm-custom',
      memberNo,
      memberName,
      claimType: formClaimType,
      claimAmount: formAmount,
      eventDate: formEventDate,
      nomineeName: formNomineeName,
      nomineeRelation: formNomineeRelation,
      nomineeCitizenshipNo: formNomineeCitizenship || '52-01-XX-XXXX',
      nomineeContact: formNomineeContact || '98XXXXXXXX',
      wardDeathCertNo: formWardCertNo,
      medicalHospitalName: formHospitalName,
      loanAccountNo: formLoanAccountNo || undefined,
      outstandingLoanBalance: formOutstandingLoan || undefined,
      waivedLoanAmount: formWaivedLoan || undefined,
      status: 'SUBMITTED',
      disbursementMethod: formDisbursementMethod,
      remarks: formRemarks || undefined,
      createdAt: new Date().toISOString(),
    };

    setClaims((prev) => [record, ...prev]);
    showToast(t(`राहत दाबी ${record.claimNo} दर्ता भयो!`, `Welfare claim ${record.claimNo} successfully submitted!`));
    setActiveTab('CLAIMS_LIST');

    // Reset fields
    setFormNomineeName('');
    setFormWardCertNo('');
    setFormHospitalName('');
    setFormRemarks('');
  };

  const handleUpdateStatus = (claimId: string, newStatus: WelfareClaimStatus) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        const now = new Date().toISOString().split('T')[0];
        return {
          ...c,
          status: newStatus,
          approvalDate: newStatus === 'APPROVED' ? now : c.approvalDate,
          disbursedDate: newStatus === 'DISBURSED' ? now : c.disbursedDate,
          voucherNo: newStatus === 'DISBURSED' ? `VCH-WLF-${Date.now().toString().slice(-6)}` : c.voucherNo,
          committeeMinuteNo: newStatus === 'APPROVED' ? 'सञ्चालक समिति बैठक नं. ५०, निर्णय नं. २' : c.committeeMinuteNo,
        };
      })
    );

    // Wire to store on disbursement
    if (newStatus === 'DISBURSED') {
      const targetClaim = claims.find((c) => c.id === claimId);
      if (targetClaim) {
        if (targetClaim.disbursementMethod === 'SAVINGS_ACCOUNT') {
          const savingsAcc = savings.find((s) => s.memberId === targetClaim.memberId);
          if (savingsAcc) {
            adjustSavingsBalance(
              savingsAcc.accountNo,
              targetClaim.claimAmount,
              'DEPOSIT',
              `कल्याणकारी राहत निकासा - ${targetClaim.claimNo} (${targetClaim.claimType})`
            );
          } else {
            addTransaction({
              memberId: targetClaim.memberId,
              type: 'DEPOSIT',
              amount: targetClaim.claimAmount,
              description: `कल्याणकारी राहत निकासा - ${targetClaim.claimNo}`,
              referenceNo: targetClaim.claimNo,
            });
          }
        } else {
          addTransaction({
            memberId: targetClaim.memberId,
            type: 'DEPOSIT',
            amount: targetClaim.claimAmount,
            description: `कल्याणकारी राहत निकासा (${targetClaim.disbursementMethod}) - ${targetClaim.claimNo}`,
            referenceNo: targetClaim.claimNo,
          });
        }

        if (targetClaim.waivedLoanAmount && targetClaim.waivedLoanAmount > 0) {
          const targetLoan = loans.find(
            (l) => l.loanNo === targetClaim.loanAccountNo || l.memberId === targetClaim.memberId
          );
          if (targetLoan) {
            recordLoanRepayment(
              targetLoan.loanNo,
              targetClaim.waivedLoanAmount,
              `राहत कोषबाट कर्जा मिनाहा - ${targetClaim.claimNo}`
            );
          }
        }
      }
    }

    showToast(t(`दाबी स्थिति ${newStatus} मा अद्यावधिक भयो`, `Claim status updated to ${newStatus}`));
  };

  const handleExportCsv = () => {
    const csvData = exportWelfareClaimsToCsv(claims);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Unako_Member_Welfare_Claims_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t('कल्याणकारी दाबी प्रतिवेदन CSV डाउनलोड भयो', 'Welfare claims report downloaded as CSV'));
  };

  // Metrics
  const totalClaimsCount = claims.length;
  const totalDisbursedAmount = claims
    .filter((c) => c.status === 'DISBURSED')
    .reduce((sum, c) => sum + c.claimAmount, 0);
  const pendingApprovalsCount = claims.filter((c) => c.status === 'SUBMITTED' || c.status === 'VERIFIED').length;
  const totalWaivedLoans = claims
    .filter((c) => c.status === 'APPROVED' || c.status === 'DISBURSED')
    .reduce((sum, c) => sum + (c.waivedLoanAmount || 0), 0);

  const filteredClaims = claims.filter((c) => {
    const matchQuery =
      c.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.memberNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.claimNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nomineeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'ALL' || c.claimType === filterType;
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchQuery && matchType && matchStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-emerald-500 animate-slide-in">
          <CheckCircle2 className="size-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-rose-900/10 via-indigo-900/10 to-teal-900/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-rose-600/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <HeartHandshake className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-wider uppercase text-rose-600 dark:text-rose-400">
                  {t('सहकारी ऐन २०७४ दफा ६७/६८ तथा विनियम', 'Cooperative Act 2074 Sec 67/68')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 font-bold">
                  {t('सामुदायिक तथा सदस्य कल्याण कोष', 'Community & Member Welfare Fund')}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {t('सदस्य मृत्यु राहत तथा आकस्मिक परिवार कल्याण प्रणाली', 'Member Demise Relief & Family Welfare System')}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-900/50 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('CLAIMS_LIST')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CLAIMS_LIST'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="size-4" />
            <span>{t('दाबी अभिलेख तथा स्वीकृति', 'Claims Register & Queue')}</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800">
              {claims.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REGISTER')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'REGISTER'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <PlusCircle className="size-4" />
            <span>{t('+ नयाँ राहत दाबी दर्ता', '+ Register New Claim')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('NOMINEE_SETTLEMENT')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'NOMINEE_SETTLEMENT'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Scale className="size-4" />
            <span>{t('हकवाला अन्तिम वित्तीय हिसाब', 'Nominee Final Settlement')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COPAS_VOUCHERS')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'COPAS_VOUCHERS'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Receipt className="size-4" />
            <span>{t('COPAS लेखा भौचर तथा मापदण्ड', 'COPAS Journal & Guidelines')}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CLAIMS REGISTER & QUEUE */}
          {activeTab === 'CLAIMS_LIST' && (
            <div className="space-y-6">
              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                    {t('कुल दर्ता दाबीहरू', 'Total Claims Registered')}
                  </span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {fmtDigits(totalClaimsCount)} {t('वटा', '')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                    {t('राहत भुक्तानी सम्पन्न रकम', 'Total Relief Disbursed')}
                  </span>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {fmtCurrency(totalDisbursedAmount, true)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                    {t('अनुमोदन पर्खिरहेका दाबी', 'Pending Sub-Committee Review')}
                  </span>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    {fmtDigits(pendingApprovalsCount)} {t('वटा', '')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block">
                    {t('कोषबाट मिनाहा कर्जा रकम', 'Relief Loan Waivers Approved')}
                  </span>
                  <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                    {fmtCurrency(totalWaivedLoans, true)}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-1 items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Search className="size-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('दाबी नं, सदस्य नाम वा हकवाला खोज्नुहोस्...', 'Search claim no, member, nominee...')}
                    className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold"
                  >
                    <option value="ALL">{t('सबै प्रकार', 'All Types')}</option>
                    <option value="MEMBER_DEATH">{t('सदस्य मृत्यु राहत', 'Member Death')}</option>
                    <option value="FUNERAL_EXPENSE">{t('काजकिरिया खर्च', 'Funeral Expense')}</option>
                    <option value="MATERNITY_ALLOWANCE">{t('सुत्केरी पोषण भत्ता', 'Maternity')}</option>
                    <option value="CRITICAL_ILLNESS">{t('दीर्घरोग उपचार', 'Critical Illness')}</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold"
                  >
                    <option value="ALL">{t('सबै स्थिति', 'All Status')}</option>
                    <option value="SUBMITTED">{t('दर्ता भएको', 'Submitted')}</option>
                    <option value="VERIFIED">{t('कागजात प्रमाणित', 'Verified')}</option>
                    <option value="APPROVED">{t('स्वीकृत', 'Approved')}</option>
                    <option value="DISBURSED">{t('निकासा सम्पन्न', 'Disbursed')}</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition shrink-0"
                  >
                    <Download className="size-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Claims Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3.5 font-semibold">{t('दाबी नं. / मिति', 'Claim No / Date')}</th>
                      <th className="p-3.5 font-semibold">{t('सदस्य / नम्बर', 'Member / No')}</th>
                      <th className="p-3.5 font-semibold">{t('राहत प्रकार', 'Benefit Type')}</th>
                      <th className="p-3.5 font-semibold">{t('रकम (रु.)', 'Amount (NPR)')}</th>
                      <th className="p-3.5 font-semibold">{t('हकवाला तथा सम्बन्ध', 'Nominee & Relation')}</th>
                      <th className="p-3.5 font-semibold">{t('स्थिति', 'Status')}</th>
                      <th className="p-3.5 font-semibold text-right">{t('कार्य / निर्णय', 'Action / Decision')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredClaims.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          {t('कुनै दाबी फेला परेन।', 'No matching welfare claims found.')}
                        </td>
                      </tr>
                    ) : (
                      filteredClaims.map((claim) => (
                        <tr key={claim.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white block">
                              {claim.claimNo}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {fmtDigits(claim.eventDate)}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{claim.memberName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{claim.memberNo}</div>
                          </td>

                          <td className="p-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {WELFARE_STANDARD_BENEFITS[claim.claimType]?.labelNe || claim.claimType}
                            </span>
                            {claim.wardDeathCertNo && (
                              <span className="block text-[10px] text-slate-400 mt-0.5">
                                दर्ता: {claim.wardDeathCertNo}
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 font-black text-rose-600 dark:text-rose-400">
                            {fmtCurrency(claim.claimAmount, true)}
                            {claim.waivedLoanAmount && (
                              <span className="block text-[10px] text-purple-600 dark:text-purple-400 font-normal">
                                + मिनाहा: {fmtCurrency(claim.waivedLoanAmount, true)}
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-800 dark:text-slate-200">{claim.nomineeName}</div>
                            <div className="text-[10px] text-slate-400">
                              {claim.nomineeRelation} • {claim.nomineeContact}
                            </div>
                          </td>

                          <td className="p-3.5">
                            {claim.status === 'SUBMITTED' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                                दर्ता भएको
                              </span>
                            )}
                            {claim.status === 'VERIFIED' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
                                प्रमाणित
                              </span>
                            )}
                            {claim.status === 'APPROVED' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
                                समिति स्वीकृत
                              </span>
                            )}
                            {claim.status === 'DISBURSED' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                                निकासा सम्पन्न
                              </span>
                            )}
                            {claim.status === 'REJECTED' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
                                अस्वीकृत
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {claim.status === 'SUBMITTED' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(claim.id, 'VERIFIED')}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold transition"
                                >
                                  {t('कागजात प्रमाणित', 'Verify')}
                                </button>
                              )}
                              {claim.status === 'VERIFIED' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(claim.id, 'APPROVED')}
                                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-xs transition"
                                >
                                  {t('समिति स्वीकृति', 'Approve')}
                                </button>
                              )}
                              {claim.status === 'APPROVED' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(claim.id, 'DISBURSED')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition"
                                >
                                  {t('रकम निकासा', 'Disburse')}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedClaimForVoucher(claim);
                                  setActiveTab('COPAS_VOUCHERS');
                                }}
                                title="View Accounting Voucher"
                                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                              >
                                <Receipt className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER NEW CLAIM FORM */}
          {activeTab === 'REGISTER' && (
            <form onSubmit={handleRegisterClaim} className="space-y-6">
              {formErrors.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                    <AlertCircle className="size-4" />
                    <span>{t('कृपया निम्न त्रुटिहरू सच्याउनुहोस्:', 'Please correct the following errors:')}</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-rose-700 dark:text-rose-300 space-y-0.5">
                    {formErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefit Standards Guideline Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <Sparkles className="size-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {WELFARE_STANDARD_BENEFITS[formClaimType].labelNe} ({WELFARE_STANDARD_BENEFITS[formClaimType].labelEn})
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    नियमित अनुदान सीमा: रु. {WELFARE_STANDARD_BENEFITS[formClaimType].defaultAmount.toLocaleString()} • अधिकतम सीमा: रु. {WELFARE_STANDARD_BENEFITS[formClaimType].maxLimit.toLocaleString()}
                  </p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    आवश्यक प्रमाण: {WELFARE_STANDARD_BENEFITS[formClaimType].documentReqNe}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('दाबीको प्रकार', 'Claim Type')} *
                  </label>
                  <select
                    value={formClaimType}
                    onChange={(e) => handleClaimTypeChange(e.target.value as WelfareClaimType)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  >
                    <option value="MEMBER_DEATH">सदस्य मृत्यु राहत (Member Demise Relief)</option>
                    <option value="FUNERAL_EXPENSE">काजकिरिया खर्च (Funeral Allowance)</option>
                    <option value="SPOUSE_DEATH">पति/पत्नी मृत्यु राहत (Spouse Demise)</option>
                    <option value="MATERNITY_ALLOWANCE">महिला सदस्य सुत्केरी पोषण भत्ता (Maternity Allowance)</option>
                    <option value="CRITICAL_ILLNESS">दीर्घरोग तथा गम्भीर स्वास्थ्य उपचार (Critical Illness)</option>
                    <option value="LOAN_WAIVER">मृतक ऋणी कर्जा मिनाहा (Loan Waiver Relief)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('सदस्य चयन गर्नुहोस्', 'Select Member')} *
                  </label>
                  <select
                    value={formMemberId}
                    onChange={handleMemberSelect}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  >
                    <option value="">{t('-- सदस्य छान्नुहोस् --', '-- Choose Member --')}</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.memberNo} - {m.nameNepali || m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('राहत दाबी रकम (NPR)', 'Claim Amount (NPR)')} *
                  </label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    max={WELFARE_STANDARD_BENEFITS[formClaimType].maxLimit}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-rose-600 dark:text-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('घटना / मृत्यु / डिस्चार्ज मिति (BS)', 'Event / Demise Date')} *
                  </label>
                  <input
                    type="text"
                    value={formEventDate}
                    onChange={(e) => setFormEventDate(e.target.value)}
                    placeholder="2081-06-05"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('हकवाला वा प्राप्तकर्ताको नाम', 'Nominee Name')} *
                  </label>
                  <input
                    type="text"
                    value={formNomineeName}
                    onChange={(e) => setFormNomineeName(e.target.value)}
                    placeholder="हकवालाको पूरा नाम"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('नाता सम्बन्ध', 'Relation')} *
                  </label>
                  <input
                    type="text"
                    value={formNomineeRelation}
                    onChange={(e) => setFormNomineeRelation(e.target.value)}
                    placeholder="श्रीमती / श्रीमान् / छोरा / छोरी"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('हकवाला नागरिकता नं.', 'Nominee Citizenship No')}
                  </label>
                  <input
                    type="text"
                    value={formNomineeCitizenship}
                    onChange={(e) => setFormNomineeCitizenship(e.target.value)}
                    placeholder="52-01-72-XXXXX"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('हकवाला फोन / मोबाइल', 'Nominee Contact No')}
                  </label>
                  <input
                    type="text"
                    value={formNomineeContact}
                    onChange={(e) => setFormNomineeContact(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                {(formClaimType === 'MEMBER_DEATH' || formClaimType === 'FUNERAL_EXPENSE' || formClaimType === 'SPOUSE_DEATH') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('वडा कार्यालयको मृत्यु दर्ता प्रमाणपत्र नं.', 'Ward Death Registration Cert No')} *
                    </label>
                    <input
                      type="text"
                      value={formWardCertNo}
                      onChange={(e) => setFormWardCertNo(e.target.value)}
                      placeholder="ग.गा.पा.-५-दर्ता-२२९"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                )}

                {formClaimType === 'CRITICAL_ILLNESS' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('अस्पताल वा स्वास्थ्य संस्थाको नाम', 'Hospital Name')} *
                    </label>
                    <input
                      type="text"
                      value={formHospitalName}
                      onChange={(e) => setFormHospitalName(e.target.value)}
                      placeholder="राप्ती प्रादेशिक अस्पताल / त्रिवि शिक्षण अस्पताल"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('निकासा भुक्तानी विधि', 'Disbursement Method')}
                  </label>
                  <select
                    value={formDisbursementMethod}
                    onChange={(e) => setFormDisbursementMethod(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  >
                    <option value="BANK_TRANSFER">वाणिज्य बैंक खाता ट्रान्सफर (Bank Transfer)</option>
                    <option value="SAVINGS_ACCOUNT">सहकारी बचत खाता दाखिला (Member Savings)</option>
                    <option value="CASH">ढुकुटी नगद भुक्तानी (Cash from Vault)</option>
                  </select>
                </div>
              </div>

              {/* Optional Loan Waiver Integration */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 space-y-3">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs">
                  <Building className="size-4" />
                  <span>{t('मृतक ऋणी सदस्य कर्जा मिनाहा समायोजन (ऐच्छिक)', 'Deceased Borrower Loan Waiver Settlement (Optional)')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      कर्जा खाता नं.
                    </label>
                    <input
                      type="text"
                      value={formLoanAccountNo}
                      onChange={(e) => setFormLoanAccountNo(e.target.value)}
                      placeholder="LN-2080-XXX"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      बाँकी ऋण रकम (रु.)
                    </label>
                    <input
                      type="number"
                      value={formOutstandingLoan}
                      onChange={(e) => setFormOutstandingLoan(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      राहत कोषबाट मिनाहा हुने रकम (रु.)
                    </label>
                    <input
                      type="number"
                      value={formWaivedLoan}
                      onChange={(e) => setFormWaivedLoan(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 font-bold text-purple-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('विशेष कैफियत / निर्णय टिपोट', 'Remarks')}
                </label>
                <textarea
                  rows={2}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="राहत उपसमितिको सिफारिस तथा कागजात सत्यापन टिपोट..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('CLAIMS_LIST')}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md transition flex items-center gap-2"
                >
                  <PlusCircle className="size-4" />
                  <span>{t('दाबी दर्ता गर्नुहोस्', 'Submit Relief Claim')}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: NOMINEE FINAL SETTLEMENT CALCULATOR */}
          {activeTab === 'NOMINEE_SETTLEMENT' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('मृतक सदस्यको सम्पूर्ण वित्तीय दायित्व तथा हकवाला भुक्तानी हिसाब', 'Deceased Member Complete Financial Discharge')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t(
                        'सेयर, बचत, लाभांश, मृत्यु राहत जोडी बाँकी कर्जा दायित्व कट्टा गरेर हकवालालाई भुक्तानी हुने अन्तिम रकम।',
                        'Total shares, savings, dividends, and demise relief minus outstanding loans settled to legal nominee.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => printElement('nominee-settlement-print')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-xs hover:opacity-90 transition"
                  >
                    <Printer className="size-3.5" />
                    <span>{t('भरपाई पत्र प्रिन्ट', 'Print Statement')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                  <div>
                    <label className="text-[11px] text-slate-400 block font-medium">सदस्य नं.</label>
                    <input
                      type="text"
                      value={calcMemberNo}
                      onChange={(e) => setCalcMemberNo(e.target.value)}
                      className="w-full text-xs font-mono font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block font-medium">मृतक सदस्यको नाम</label>
                    <input
                      type="text"
                      value={calcMemberName}
                      onChange={(e) => setCalcMemberName(e.target.value)}
                      className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block font-medium">हकवालाको नाम</label>
                    <input
                      type="text"
                      value={calcNomineeName}
                      onChange={(e) => setCalcNomineeName(e.target.value)}
                      className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block font-medium">नाता सम्बन्ध</label>
                    <input
                      type="text"
                      value={calcNomineeRelation}
                      onChange={(e) => setCalcNomineeRelation(e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                {/* Values Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block">सेयर पूँजी (NPR)</label>
                    <input
                      type="number"
                      value={calcShareBalance}
                      onChange={(e) => setCalcShareBalance(Number(e.target.value))}
                      className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">बचत खाता मौज्दात (NPR)</label>
                    <input
                      type="number"
                      value={calcSavingsBalance}
                      onChange={(e) => setCalcSavingsBalance(Number(e.target.value))}
                      className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">मृत्यु राहत अनुदान (NPR)</label>
                    <input
                      type="number"
                      value={calcDeathRelief}
                      onChange={(e) => setCalcDeathRelief(Number(e.target.value))}
                      className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">काजकिरिया खर्च (NPR)</label>
                    <input
                      type="number"
                      value={calcFuneralAllowance}
                      onChange={(e) => setCalcFuneralAllowance(Number(e.target.value))}
                      className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">बाँकी कर्जा साँवा (NPR)</label>
                    <input
                      type="number"
                      value={calcLoanPrincipal}
                      onChange={(e) => setCalcLoanPrincipal(Number(e.target.value))}
                      className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">बाँकी कर्जा ब्याज (NPR)</label>
                    <input
                      type="number"
                      value={calcLoanInterest}
                      onChange={(e) => setCalcLoanInterest(Number(e.target.value))}
                      className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block">कोषबाट कर्जा मिनाहा (NPR)</label>
                    <input
                      type="number"
                      value={calcLoanWaiver}
                      onChange={(e) => setCalcLoanWaiver(Number(e.target.value))}
                      className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-600"
                    />
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-bold">हकवाला खुद भुक्तानी</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {fmtCurrency(settlementSummary.netNomineePayable, true)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Printable Settlement Statement Container */}
              <div
                id="nominee-settlement-print"
                className="p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {coopSettings.nameNepali}
                  </h4>
                  <p className="text-xs text-slate-500">{coopSettings.addressNepali} • {t('दर्ता नं.', 'Reg No.')} {coopSettings.regNo}</p>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mt-2">
                    मृतक सदस्य वित्तीय दायित्व फरफारक तथा हकवाला भरपाई पत्र
                  </h5>
                </div>

                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span><strong>सदस्य:</strong> {settlementSummary.memberName} ({settlementSummary.memberNo})</span>
                  <span><strong>हकवाला:</strong> {settlementSummary.nomineeName} ({settlementSummary.nomineeRelation})</span>
                  <span><strong>मिती:</strong> २०८१/०६/०५</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-2 font-bold">क्र.सं.</th>
                        <th className="p-2 font-bold">विवरण</th>
                        <th className="p-2 font-bold text-center">प्रकार</th>
                        <th className="p-2 font-bold text-right">रकम (रु.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {settlementSummary.lineItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 text-slate-400">{idx + 1}</td>
                          <td className="p-2 font-medium">{item.descriptionNe}</td>
                          <td className="p-2 text-center">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono font-bold">
                            {fmtCurrency(item.amount, true)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 font-bold">
                      <tr>
                        <td colSpan={3} className="p-2.5 text-right font-black">
                          हकवालालाई भुक्तानी हुने कुल खुद रकम (Net Disbursed to Nominee):
                        </td>
                        <td className="p-2.5 text-right text-emerald-600 dark:text-emerald-400 text-sm font-black font-mono">
                          {fmtCurrency(settlementSummary.netNomineePayable, true)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                  {settlementSummary.legalNoticeNe}
                </p>

                <div className="grid grid-cols-3 gap-6 pt-6 text-center text-[11px] text-slate-500">
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                    हकवालाको सहिछाप
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                    व्यवस्थापक / लेखापाल
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                    अध्यक्ष / राहत उपसमिति
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COPAS JOURNAL VOUCHERS & GUIDELINES */}
          {activeTab === 'COPAS_VOUCHERS' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  <Receipt className="size-4" />
                  <span>{t('COPAS दोहोरो लेखा प्रविष्टि', 'COPAS Accounting Journal')}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  सहकारी लेखा मापदण्ड (COPAS) अनुसार सदस्य राहत तथा सामुदायिक विकास कोषबाट निकासा हुने रकमको डेबिट/क्रेडिट प्रविष्टि।
                </p>
              </div>

              {selectedClaimForVoucher ? (
                (() => {
                  const voucher = generateWelfareCopasVoucher(selectedClaimForVoucher);
                  return (
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">भौचर नं.: {voucher.voucherNo}</span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                            {voucher.narrationNe}
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                          {voucher.fiscalYear} • मिति: {voucher.date}
                        </span>
                      </div>

                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400">
                          <tr>
                            <th className="p-2.5 font-semibold">GL Code</th>
                            <th className="p-2.5 font-semibold">खाताको नाम (Account Head)</th>
                            <th className="p-2.5 font-semibold text-right">डेबिट (Dr)</th>
                            <th className="p-2.5 font-semibold text-right">क्रेडिट (Cr)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {voucher.entries.map((entry, idx) => (
                            <tr key={idx}>
                              <td className="p-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">{entry.glCode}</td>
                              <td className="p-2.5">
                                <div className="font-bold text-slate-800 dark:text-slate-200">{entry.accountNameNe}</div>
                                <div className="text-[10px] text-slate-400">{entry.accountNameEn}</div>
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold">
                                {entry.debitAmount > 0 ? fmtCurrency(entry.debitAmount, true) : '-'}
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold">
                                {entry.creditAmount > 0 ? fmtCurrency(entry.creditAmount, true) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                          <tr>
                            <td colSpan={2} className="p-2.5 text-right">कुल रकम (Total Balanced):</td>
                            <td className="p-2.5 text-right font-mono text-emerald-600">{fmtCurrency(voucher.totalDebit, true)}</td>
                            <td className="p-2.5 text-right font-mono text-emerald-600">{fmtCurrency(voucher.totalCredit, true)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  );
                })()
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                  {t('सूचीबाट कुनै दाबी छान्नुहोस् भौचर हेर्नका लागि।', 'Select any claim from the claims list to view its COPAS voucher.')}
                </div>
              )}

              {/* By-Law Norms Reference Table */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {t('संस्थागत राहत मापदण्ड निर्देशिका', 'Institutional Welfare Policy Norms')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {Object.entries(WELFARE_STANDARD_BENEFITS).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{val.labelNe}</span>
                        <span className="text-rose-600">रु. {val.defaultAmount.toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        अधिकतम सीमा: रु. {val.maxLimit.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        प्रमाण: {val.documentReqNe}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>{t('सहकारी ऐन २०७४ दफा ६७ तथा राहत कोष नियमावली अनुसार संरक्षित', 'Protected under Cooperative Act 2074 Sec 67 & By-laws')}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-bold transition shadow-xs"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
