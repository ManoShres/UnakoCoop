import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import {
  ChequeTransactionRecord,
  ChequeBookRecord,
  ChequeLeafStatus,
  ChequeClearingType,
  StopPaymentReason,
  INITIAL_CHEQUE_BOOKS,
  INITIAL_CHEQUE_TRANSACTIONS,
  validateChequePresentation,
  issueChequeBook,
  processChequeBounce,
  generateChequeCopasVoucher,
  exportChequeClearingToCsv,
} from '../../utils/chequeClearingEngine';
import { printElement } from '../../utils/printHelper';
import {
  Receipt,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  PlusCircle,
  Printer,
  Download,
  Search,
  X,
  CreditCard,
  Ban,
  ArrowRightLeft,
  Building,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';

interface ChequeClearingDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChequeClearingDeskModal: React.FC<ChequeClearingDeskModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const { members, savings, adjustSavingsBalance } = useCoopStore();

  const [activeTab, setActiveTab] = useState<'CLEARING' | 'STOP_PAYMENT' | 'BOUNCE_LEDGER' | 'CHEQUE_BOOKS'>('CLEARING');
  const [transactions, setTransactions] = useState<ChequeTransactionRecord[]>(INITIAL_CHEQUE_TRANSACTIONS);
  const [chequeBooks, setChequeBooks] = useState<ChequeBookRecord[]>(INITIAL_CHEQUE_BOOKS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Present Cheque Form State
  const [presChequeNo, setPresChequeNo] = useState('042103');
  const [presMemberId, setPresMemberId] = useState(members[0]?.id || 'm-101');
  const [presAccountNo, setPresAccountNo] = useState(
    savings.find((s) => s.memberId === (members[0]?.id || 'm-101'))?.accountNo || 'SAV-00101-01'
  );
  const [presPayeeName, setPresPayeeName] = useState('शान्ति चौधरी');
  const [presAmount, setPresAmount] = useState<number>(45000);
  const [presChequeDateBs, setPresChequeDateBs] = useState('2081-06-02');
  const [presClearingType, setPresClearingType] = useState<ChequeClearingType>('COUNTER_WITHDRAWAL');
  const [presIsAccountPayee, setPresIsAccountPayee] = useState(false);
  const [selectedTxForVoucher, setSelectedTxForVoucher] = useState<ChequeTransactionRecord | null>(null);

  // Stop Payment Form State
  const [stopChequeNo, setStopChequeNo] = useState('');
  const [stopAccountNo, setStopAccountNo] = useState('SAV-00101-01');
  const [stopReason, setStopReason] = useState<StopPaymentReason>('LOST_OR_STOLEN');
  const [stopApplicantName, setStopApplicantName] = useState('');

  // New Cheque Book Form State
  const [newBookMemberId, setNewBookMemberId] = useState(members[0]?.id || 'm-101');
  const [newBookLeaves, setNewBookLeaves] = useState<10 | 25 | 50>(25);
  const [newBookStartLeaf, setNewBookStartLeaf] = useState<number>(75001);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedMember = members.find((m) => m.id === presMemberId);
  const accountBalance = selectedMember ? selectedMember.totalSavings : 85000;

  // Real-time validation
  const validation = useMemo(() => {
    const existingStopped = transactions.find((t) => t.chequeNo === presChequeNo && t.status === 'STOP_PAYMENT');
    const existingCleared = transactions.find((t) => t.chequeNo === presChequeNo && t.status === 'CLEARED');

    let chequeStatus: ChequeLeafStatus = 'UNUSED';
    if (existingStopped) chequeStatus = 'STOP_PAYMENT';
    else if (existingCleared) chequeStatus = 'CLEARED';

    return validateChequePresentation({
      chequeNo: presChequeNo,
      amount: presAmount,
      chequeDateBs: presChequeDateBs,
      presentedDateBs: '2081-06-05',
      accountBalance,
      chequeStatus,
      stopReason: existingStopped?.stopReason,
    });
  }, [presChequeNo, presAmount, presChequeDateBs, accountBalance, transactions]);

  if (!isOpen) return null;

  const handleClearCheque = () => {
    if (!validation.canClear) {
      showToast(t('चेक भुक्तानी गर्न अमान्य छ!', 'Cheque cannot be cleared due to validation errors!'));
      return;
    }

    const memberName = selectedMember ? (selectedMember.nameNepali || selectedMember.name) : 'सदस्य';
    const memberNo = selectedMember ? selectedMember.memberNo : 'MBR-001';

    const newTx: ChequeTransactionRecord = {
      id: `tx-cq-${Date.now()}`,
      chequeNo: presChequeNo,
      accountNo: presAccountNo,
      memberId: presMemberId,
      memberNo,
      memberName,
      payeeName: presPayeeName,
      amount: presAmount,
      chequeDateBs: presChequeDateBs,
      presentedDateBs: '2081-06-05',
      clearingType: presClearingType,
      status: 'CLEARED',
      isAccountPayee: presIsAccountPayee,
      bounceCount: 0,
      clearedByStaffName: 'सन्तोष यादव (Teller)',
      clearedAt: new Date().toISOString(),
      voucherNo: `CQ-VCH-${Date.now().toString().slice(-6)}`,
      remarks: 'काउन्टरबाट चेक भुक्तानी सम्पन्न।',
    };

    const targetMember = selectedMember;
    const targetAccount = savings.find(
      (s) => s.accountNo === presAccountNo || (targetMember && s.memberId === targetMember.id)
    );
    const effectiveAccNo = targetAccount?.accountNo || presAccountNo;

    // Execute actual ledger debit on savings account
    adjustSavingsBalance(
      effectiveAccNo,
      presAmount,
      'WITHDRAWAL',
      `काउन्टरबाट चेक नं. ${presChequeNo} भुक्तानी (Payee: ${presPayeeName})`
    );

    setTransactions((prev) => [newTx, ...prev]);
    showToast(t(`चेक नं. ${presChequeNo} भुक्तानी (CLEARED) भयो!`, `Cheque ${presChequeNo} successfully cleared!`));

    // Next cheque increment
    const nextNo = String(Number(presChequeNo) + 1).padStart(6, '0');
    setPresChequeNo(nextNo);
  };

  const handleBounceCheque = () => {
    const memberName = selectedMember ? (selectedMember.nameNepali || selectedMember.name) : 'सदस्य';
    const memberNo = selectedMember ? selectedMember.memberNo : 'MBR-001';

    const existingTx = transactions.find((t) => t.chequeNo === presChequeNo);
    const existingBounceCount = existingTx ? existingTx.bounceCount : 0;

    const baseTx: ChequeTransactionRecord = existingTx || {
      id: `tx-cq-${Date.now()}`,
      chequeNo: presChequeNo,
      accountNo: presAccountNo,
      memberId: presMemberId,
      memberNo,
      memberName,
      payeeName: presPayeeName,
      amount: presAmount,
      chequeDateBs: presChequeDateBs,
      presentedDateBs: '2081-06-05',
      clearingType: presClearingType,
      status: 'PRESENTED',
      isAccountPayee: presIsAccountPayee,
      bounceCount: existingBounceCount,
    };

    const bounceResult = processChequeBounce(baseTx, 'अपर्याप्त मौज्दात (Insufficient Funds)');

    setTransactions((prev) => {
      const filtered = prev.filter((t) => t.chequeNo !== presChequeNo);
      return [bounceResult.updatedCheque, ...filtered];
    });

    showToast(
      t(
        `चेक नं. ${presChequeNo} अनादर (BOUNCED) दर्ता भयो (पटक: ${bounceResult.updatedCheque.bounceCount})`,
        `Cheque ${presChequeNo} marked dishonoured (Strike: ${bounceResult.updatedCheque.bounceCount})`
      )
    );
  };

  const handleRegisterStopPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopChequeNo.trim()) {
      showToast(t('चेक नम्बर उल्लेख गर्नुहोस्', 'Enter cheque number'));
      return;
    }

    const memberName = selectedMember ? (selectedMember.nameNepali || selectedMember.name) : 'सदस्य';
    const memberNo = selectedMember ? selectedMember.memberNo : 'MBR-001';

    const stoppedTx: ChequeTransactionRecord = {
      id: `tx-stop-${Date.now()}`,
      chequeNo: stopChequeNo,
      accountNo: stopAccountNo,
      memberId: presMemberId,
      memberNo,
      memberName,
      payeeName: 'अज्ञात (Unknown/Bearer)',
      amount: 0,
      chequeDateBs: '2081-06-05',
      presentedDateBs: '2081-06-05',
      clearingType: 'COUNTER_WITHDRAWAL',
      status: 'STOP_PAYMENT',
      isAccountPayee: false,
      stopReason,
      bounceCount: 0,
      remarks: `निवेदक: ${stopApplicantName || memberName} द्वारा भुक्तानी रोक्का।`,
    };

    setTransactions((prev) => [stoppedTx, ...prev]);
    showToast(t(`चेक नं. ${stopChequeNo} भुक्तानी रोक्का (STOP-PAYMENT) गरियो!`, `Cheque ${stopChequeNo} stop payment applied!`));
    setStopChequeNo('');
    setStopApplicantName('');
  };

  const handleIssueChequeBook = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find((m) => m.id === newBookMemberId);
    const memberName = targetMember ? (targetMember.nameNepali || targetMember.name) : 'सदस्य';
    const memberNo = targetMember ? targetMember.memberNo : 'MBR-001';

    const newBook = issueChequeBook({
      accountNo: `SAV-${memberNo.slice(-5)}-01`,
      memberId: newBookMemberId,
      memberNo,
      memberName,
      startLeafNo: newBookStartLeaf,
      totalLeaves: newBookLeaves,
      issuedDateBs: '2081-06-05',
      issuedDateAd: new Date().toISOString().split('T')[0],
      issuedByStaffName: 'सन्तोष यादव (Teller)',
      branch: 'गढवा मुख्य शाखा',
    });

    setChequeBooks((prev) => [newBook, ...prev]);
    showToast(
      t(
        `नयाँ चेकबुक जारी भयो (पाना: ${newBook.startLeafNo} - ${newBook.endLeafNo})`,
        `Cheque book issued (Leaves: ${newBook.startLeafNo} - ${newBook.endLeafNo})`
      )
    );
    setNewBookStartLeaf((prev) => prev + newBookLeaves);
  };

  const handleExportCsv = () => {
    const csv = exportChequeClearingToCsv(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Unako_Cheque_Clearing_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t('चेक क्लियरिङ प्रतिवेदन डाउनलोड भयो', 'Cheque clearing log downloaded as CSV'));
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchQuery =
      t.chequeNo.includes(searchQuery) ||
      t.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.payeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.accountNo.includes(searchQuery);
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchQuery && matchStatus;
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
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-teal-900/10 via-indigo-900/10 to-blue-900/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-teal-600/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
              <CreditCard className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-wider uppercase text-teal-600 dark:text-teal-400">
                  {t('सहकारी चेक व्यवस्थापन तथा क्लियरिङ कन्सोल', 'COOPERATIVE CHEQUE CLEARING DESK')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 font-bold">
                  {t('विनिमय पत्र ऐन २०३४ बमोजिम', 'Negotiable Instruments Act 2034')}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {t('चेक भुक्तानी, इनवार्ड/आउटवार्ड क्लियरिङ तथा रोक्का प्रणाली', 'Cheque Clearing, Inward/Outward & Stop-Payment System')}
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
            onClick={() => setActiveTab('CLEARING')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CLEARING'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <CreditCard className="size-4" />
            <span>{t('काउन्टर भुक्तानी तथा क्लियरिङ', 'Counter Clearing')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STOP_PAYMENT')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'STOP_PAYMENT'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Ban className="size-4" />
            <span>{t('चेक भुक्तानी रोक्का', 'Stop-Payment Register')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BOUNCE_LEDGER')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'BOUNCE_LEDGER'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <AlertOctagon className="size-4" />
            <span>{t('चेक अनादर तथा कालोसूची अभिलेख', 'Dishonoured & Bounce Ledger')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHEQUE_BOOKS')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CHEQUE_BOOKS'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="size-4" />
            <span>{t('चेक बुक जारी तथा पाना स्थिति', 'Cheque Books Register')}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: COUNTER PRESENTATION & CLEARING */}
          {activeTab === 'CLEARING' && (
            <div className="space-y-6">
              {/* Cheque Presentation Terminal Panel */}
              <div className="p-5 rounded-2xl bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-800/20 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    <Sparkles className="size-4 text-teal-500" />
                    <span>{t('काउन्टर चेक भेरिफिकेसन तथा भुक्तानी टर्मिनल', 'Counter Cheque Verification & Authorize')}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    खाता मौज्दात: <strong className="text-emerald-600">{fmtCurrency(accountBalance, true)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      चेक नं. (Cheque No) *
                    </label>
                    <input
                      type="text"
                      value={presChequeNo}
                      onChange={(e) => setPresChequeNo(e.target.value)}
                      className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      खातावाला सदस्य *
                    </label>
                    <select
                      value={presMemberId}
                      onChange={(e) => {
                        const mId = e.target.value;
                        setPresMemberId(mId);
                        const m = members.find((x) => x.id === mId);
                        const mSavings = savings.find((s) => s.memberId === mId);
                        if (mSavings) {
                          setPresAccountNo(mSavings.accountNo);
                        } else if (m) {
                          setPresAccountNo(`SAV-${m.memberNo.slice(-5)}-01`);
                        }
                      }}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.memberNo} - {m.nameNepali || m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      भुक्तानी पाउने (Payee) *
                    </label>
                    <input
                      type="text"
                      value={presPayeeName}
                      onChange={(e) => setPresPayeeName(e.target.value)}
                      placeholder="वाहक वा संस्थाको नाम"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      चेक रकम (NPR) *
                    </label>
                    <input
                      type="number"
                      value={presAmount}
                      onChange={(e) => setPresAmount(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      चेक जारी मिति (BS)
                    </label>
                    <input
                      type="text"
                      value={presChequeDateBs}
                      onChange={(e) => setPresChequeDateBs(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      क्लियरिङ विधि
                    </label>
                    <select
                      value={presClearingType}
                      onChange={(e) => setPresClearingType(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="COUNTER_WITHDRAWAL">काउन्टर नगद भुक्तानी (Counter Cash)</option>
                      <option value="INWARD_CLEARING">इनवार्ड क्लियरिङ (Inward Clearing)</option>
                      <option value="OUTWARD_CLEARING">आउटवार्ड क्लियरिङ (Outward Bank)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="ac-payee"
                      checked={presIsAccountPayee}
                      onChange={(e) => setPresIsAccountPayee(e.target.checked)}
                      className="size-4 rounded text-teal-600"
                    />
                    <label htmlFor="ac-payee" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Account Payee Only (रेखाङ्कन)
                    </label>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 pt-4">
                    <button
                      type="button"
                      onClick={handleClearCheque}
                      disabled={!validation.canClear}
                      className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-md transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>{t('भुक्तानी गर्नुहोस्', 'Clear Cheque')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBounceCheque}
                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Mark Cheque Dishonoured / Bounced"
                    >
                      <AlertOctagon className="size-3.5" />
                      <span>{t('बाउन्स', 'Bounce')}</span>
                    </button>
                  </div>
                </div>

                {/* Live Validation Strip */}
                <div className="pt-2">
                  {validation.isValid ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span>चेक पूर्ण रूपमा मान्य छ: मौज्दात पर्याप्त, मिति वैध र भुक्तानी योग्य।</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block">भुक्तानी रोक्नुहोस् (Cannot Clear):</strong>
                        <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                          {validation.errors.map((e, idx) => (
                            <li key={idx}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-1 items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Search className="size-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('चेक नं, खाता वा पाउने व्यक्तिको नाम खोज्नुहोस्...', 'Search cheque no, payee, account...')}
                    className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold"
                  >
                    <option value="ALL">{t('सबै स्थिति', 'All Status')}</option>
                    <option value="CLEARED">{t('भुक्तानी भएको', 'Cleared')}</option>
                    <option value="BOUNCED">{t('चेक अनादर', 'Bounced')}</option>
                    <option value="STOP_PAYMENT">{t('रोक्का', 'Stopped')}</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition shrink-0"
                  >
                    <Download className="size-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3 font-semibold">{t('चेक नं. / मिति', 'Cheque No / Date')}</th>
                      <th className="p-3 font-semibold">{t('खाता / सदस्य', 'Account / Member')}</th>
                      <th className="p-3 font-semibold">{t('भुक्तानी पाउने', 'Payee Name')}</th>
                      <th className="p-3 font-semibold">{t('रकम (रु.)', 'Amount (NPR)')}</th>
                      <th className="p-3 font-semibold">{t('प्रकार', 'Clearing Type')}</th>
                      <th className="p-3 font-semibold">{t('स्थिति', 'Status')}</th>
                      <th className="p-3 font-semibold text-right">{t('भौचर / कार्य', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="p-3">
                          <span className="font-mono font-bold text-slate-900 dark:text-white block">
                            {tx.chequeNo}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {fmtDigits(tx.chequeDateBs)}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white">{tx.memberName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{tx.accountNo}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{tx.payeeName}</div>
                          {tx.isAccountPayee && (
                            <span className="text-[10px] text-teal-600 font-bold block">A/C Payee Only</span>
                          )}
                        </td>

                        <td className="p-3 font-black text-slate-900 dark:text-white font-mono">
                          {fmtCurrency(tx.amount, true)}
                        </td>

                        <td className="p-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {tx.clearingType === 'COUNTER_WITHDRAWAL' ? 'काउन्टर' : tx.clearingType === 'INWARD_CLEARING' ? 'इनवार्ड' : 'आउटवार्ड'}
                          </span>
                        </td>

                        <td className="p-3">
                          {tx.status === 'CLEARED' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                              भुक्तानी सम्पन्न
                            </span>
                          )}
                          {tx.status === 'BOUNCED' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
                              अनादर (स्ट्राइक {tx.bounceCount})
                            </span>
                          )}
                          {tx.status === 'STOP_PAYMENT' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                              भुक्तानी रोक्का
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          {tx.status === 'CLEARED' && (
                            <button
                              type="button"
                              onClick={() => setSelectedTxForVoucher(tx)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold transition"
                            >
                              {t('भौचर', 'Voucher')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* COPAS Voucher Drawer/Modal if selected */}
              {selectedTxForVoucher && (
                (() => {
                  const voucher = generateChequeCopasVoucher(selectedTxForVoucher);
                  return (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          COPAS लेखा भौचर: {voucher.voucherNo} • {voucher.narrationNe}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setSelectedTxForVoucher(null)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                        >
                          <X className="size-4" />
                        </button>
                      </div>

                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400">
                          <tr>
                            <th className="p-2">GL Code</th>
                            <th className="p-2">खाता शीर्षक</th>
                            <th className="p-2 text-right">डेबिट (Dr)</th>
                            <th className="p-2 text-right">क्रेडिट (Cr)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {voucher.entries.map((entry, idx) => (
                            <tr key={idx}>
                              <td className="p-2 font-mono font-bold text-indigo-600">{entry.glCode}</td>
                              <td className="p-2 font-medium">{entry.accountNameNe}</td>
                              <td className="p-2 text-right font-mono font-bold">
                                {entry.debitAmount > 0 ? fmtCurrency(entry.debitAmount, true) : '-'}
                              </td>
                              <td className="p-2 text-right font-mono font-bold">
                                {entry.creditAmount > 0 ? fmtCurrency(entry.creditAmount, true) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* TAB 2: STOP-PAYMENT REGISTER */}
          {activeTab === 'STOP_PAYMENT' && (
            <div className="space-y-6">
              <form onSubmit={handleRegisterStopPayment} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Ban className="size-4" />
                  <span>{t('नयाँ चेक भुक्तानी रोक्का दर्ता', 'Register Stop-Payment')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      चेक नम्बर *
                    </label>
                    <input
                      type="text"
                      value={stopChequeNo}
                      onChange={(e) => setStopChequeNo(e.target.value)}
                      placeholder="उदा. 042105"
                      className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      बचत खाता नं. *
                    </label>
                    <input
                      type="text"
                      value={stopAccountNo}
                      onChange={(e) => setStopAccountNo(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      रोक्का कारण (Stop Reason) *
                    </label>
                    <select
                      value={stopReason}
                      onChange={(e) => setStopReason(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="LOST_OR_STOLEN">चेक हराएको वा चोरी भएको (Lost or Stolen)</option>
                      <option value="FRAUD_PREVENTION">जालसाजी रोकथाम (Fraud Prevention)</option>
                      <option value="SIGNATURE_DISPUTE">हस्ताक्षर विवाद (Signature Dispute)</option>
                      <option value="LEGAL_FREEZE">अदालत वा सरकारी निकायको आदेश (Legal Freeze)</option>
                      <option value="MEMBER_REQUEST">सदस्यको लिखित अनुरोध (Member Request)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      निवेदकको नाम
                    </label>
                    <input
                      type="text"
                      value={stopApplicantName}
                      onChange={(e) => setStopApplicantName(e.target.value)}
                      placeholder="निवेदक सदस्यको नाम"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    रोक्का सेवा शुल्क: <strong>रु. १०० (Stop-Payment Fee)</strong>
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <Ban className="size-3.5" />
                    <span>{t('भुक्तानी रोक्का दर्ता गर्नुहोस्', 'Apply Stop Payment')}</span>
                  </button>
                </div>
              </form>

              {/* Active Stopped Cheques List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
                  {t('हाल रोक्का रहेका चेकहरूको सूची', 'Active Stop-Payment Register')}
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400">
                      <tr>
                        <th className="p-3">चेक नं.</th>
                        <th className="p-3">खाता नं.</th>
                        <th className="p-3">खातावाला सदस्य</th>
                        <th className="p-3">रोक्का कारण</th>
                        <th className="p-3">कैफियत</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {transactions
                        .filter((t) => t.status === 'STOP_PAYMENT')
                        .map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                            <td className="p-3 font-mono font-bold text-amber-600">{tx.chequeNo}</td>
                            <td className="p-3 font-mono">{tx.accountNo}</td>
                            <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{tx.memberName}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                {tx.stopReason || 'MEMBER_REQUEST'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 text-[11px]">{tx.remarks}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DISHONOURED & BOUNCE LEDGER */}
          {activeTab === 'BOUNCE_LEDGER' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
                <AlertOctagon className="size-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-rose-800 dark:text-rose-300">
                    {t('विनिमय पत्र ऐन २०३४ तथा बैंकिङ कसूर तथा सजाय ऐन २०६४ बमोजिम चेक अनादर व्यवस्था', 'Legal Framework for Dishonoured Cheques')}
                  </h4>
                  <p className="text-rose-700 dark:text-rose-400 mt-0.5 leading-relaxed">
                    खातामा अपर्याप्त मौज्दात भई ३ पटकसम्म चेक अनादर (Bounce) भएमा संस्थाले ७ दिने सूचना जारी गरी कर्जा सूचना केन्द्र (CIB) को कालोसूचीमा सिफारिस गर्ने कानुनी व्यवस्था छ।
                  </p>
                </div>
              </div>

              {/* Bounced Cheques Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3">चेक नं.</th>
                      <th className="p-3">खातावाला सदस्य</th>
                      <th className="p-3">पाउने पक्ष</th>
                      <th className="p-3">रकम (रु.)</th>
                      <th className="p-3">अनादर संख्या</th>
                      <th className="p-3">अनादर कारण</th>
                      <th className="p-3 text-right">अनादर पत्र</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions
                      .filter((t) => t.status === 'BOUNCED')
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-mono font-bold text-rose-600">{tx.chequeNo}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-white">{tx.memberName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{tx.accountNo}</div>
                          </td>
                          <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{tx.payeeName}</td>
                          <td className="p-3 font-mono font-black text-slate-900 dark:text-white">{fmtCurrency(tx.amount, true)}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.bounceCount >= 3
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}>
                              {tx.bounceCount} पटक (Strike {tx.bounceCount})
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 text-[11px]">{tx.bounceReason || 'अपर्याप्त मौज्दात'}</td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => printElement(`dishonour-notice-${tx.id}`)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                            >
                              <Printer className="size-3" />
                              <span>{t('अनादर पत्र प्रिन्ट', 'Print Notice')}</span>
                            </button>

                            {/* Hidden printable notice */}
                            <div id={`dishonour-notice-${tx.id}`} className="hidden print:block p-6 text-xs space-y-3">
                              <div className="text-center pb-2 border-b">
                                <h3 className="font-bold text-sm">उनको बचत तथा ऋण सहकारी संस्था लि.</h3>
                                <p className="text-[10px]">गढवा-५, दाङ • चेक अनादर (Bounce) सूचना पत्र</p>
                              </div>
                              <p>श्री {tx.memberName} (खाता नं. {tx.accountNo})</p>
                              <p>
                                यहाँले मिति {tx.chequeDateBs} मा {tx.payeeName} को नाममा जारी गर्नुभएको चेक नं. {tx.chequeNo} रकम रु. {tx.amount.toLocaleString()} खातामा अपर्याप्त मौज्दातका कारण अनादर भएको व्यहोरा जानकारी गराइन्छ। विनिमय पत्र ऐन २०३४ अनुसार तुरुन्त मौज्दात व्यवस्थापन गर्नुहुन सूचित गरिन्छ।
                              </p>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CHEQUE BOOKS REGISTER */}
          {activeTab === 'CHEQUE_BOOKS' && (
            <div className="space-y-6">
              {/* Issue Cheque Book Form */}
              <form onSubmit={handleIssueChequeBook} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs">
                  <PlusCircle className="size-4" />
                  <span>{t('नयाँ चेक बुक जारी गर्नुहोस्', 'Issue Cheque Book')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      सदस्य चयन *
                    </label>
                    <select
                      value={newBookMemberId}
                      onChange={(e) => setNewBookMemberId(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.memberNo} - {m.nameNepali || m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      चेक पाना संख्या (Leaves) *
                    </label>
                    <select
                      value={newBookLeaves}
                      onChange={(e) => setNewBookLeaves(Number(e.target.value) as any)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value={10}>१० पाना (10 Leaves Booklet)</option>
                      <option value={25}>२५ पाना (25 Leaves Booklet)</option>
                      <option value={50}>५० पाना (50 Leaves Booklet)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      सुरु चेक नम्बर (Starting Leaf No) *
                    </label>
                    <input
                      type="number"
                      value={newBookStartLeaf}
                      onChange={(e) => setNewBookStartLeaf(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    जारी हुने पाना रेन्ज: <strong className="font-mono text-teal-600">{newBookStartLeaf} - {newBookStartLeaf + newBookLeaves - 1}</strong>
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <PlusCircle className="size-3.5" />
                    <span>{t('चेक बुक जारी गर्नुहोस्', 'Issue Cheque Book')}</span>
                  </button>
                </div>
              </form>

              {/* Cheque Books List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3">खाता नं.</th>
                      <th className="p-3">सदस्यको नाम</th>
                      <th className="p-3">पाना रेन्ज</th>
                      <th className="p-3">कुल पाना</th>
                      <th className="p-3">जारी मिति (BS)</th>
                      <th className="p-3">जारी गर्ने कर्मचारी</th>
                      <th className="p-3 text-right">स्थिति</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {chequeBooks.map((cb) => (
                      <tr key={cb.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{cb.accountNo}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{cb.memberName}</td>
                        <td className="p-3 font-mono text-teal-600 font-bold">{cb.startLeafNo} - {cb.endLeafNo}</td>
                        <td className="p-3 font-bold">{cb.totalLeaves}</td>
                        <td className="p-3 font-mono text-slate-500">{cb.issuedDateBs}</td>
                        <td className="p-3 text-slate-500">{cb.issuedByStaffName}</td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {cb.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>{t('नेपाल सहकारी ऐन तथा बैंकिङ मापदण्ड अनुसार प्रमाणित चेक अभिलेख', 'Verified cheque records under Nepal Cooperative Standards')}</span>
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
