import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  CheckCircle2, 
  Printer, 
  RotateCcw, 
  ArrowLeft, 
  AlertCircle, 
  UserCheck, 
  Receipt, 
  CreditCard 
} from 'lucide-react';
import { TerminalNode, FastTransactionSchema, FastTransactionReceipt } from './terminalTypes';
import { useCoopStore } from '../../../store/useCoopStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { printElement, PrintFormat } from '../../../utils/printHelper';

interface TerminalActionFormProps {
  node: TerminalNode;
  breadcrumbs: TerminalNode[];
  onBack: () => void;
  onSuccessTransaction?: (receipt: FastTransactionReceipt) => void;
}

export const TerminalActionForm: React.FC<TerminalActionFormProps> = ({
  node,
  breadcrumbs,
  onBack,
  onSuccessTransaction,
}) => {
  const { t } = useLanguageStore();
  const { coopSettings, members, savings, loans, adjustSavingsBalance, recordLoanRepayment, addTransaction } = useCoopStore();

  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<FastTransactionReceipt | null>(null);
  const [printFormat, setPrintFormat] = useState<PrintFormat>('thermal-80mm');

  const accountInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const remarksInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus account input on mount
  useEffect(() => {
    if (!receipt) {
      accountInputRef.current?.focus();
    }
  }, [receipt]);

  // Real-time lookup of member & account
  const matchedData = useMemo(() => {
    const q = accountNo.trim().toUpperCase();
    if (!q || q.length < 2) return null;

    // 1. Try matching savings account
    const matchedSav = savings.find(
      (s) => s.accountNo.toUpperCase() === q || s.memberId?.toUpperCase() === q
    );
    // 2. Try matching loan account
    const matchedLoan = loans.find(
      (l) => l.loanNo.toUpperCase() === q || l.memberId?.toUpperCase() === q
    );
    // 3. Try matching member profile
    const matchedMember = members.find(
      (m) =>
        m.id.toUpperCase() === q ||
        m.memberNo?.toUpperCase() === q ||
        (matchedSav?.memberId && m.id === matchedSav.memberId) ||
        (matchedLoan?.memberId && m.id === matchedLoan.memberId)
    );

    return {
      member: matchedMember,
      savings: matchedSav,
      loan: matchedLoan,
    };
  }, [accountNo, members, savings, loans]);

  // Form submission handler
  const handleExecuteTransaction = () => {
    setFormError(null);
    if (!node.operation) return;

    const numAmount = parseFloat(amount);
    const validation = FastTransactionSchema.safeParse({
      operation: node.operation,
      accountNo: accountNo.trim(),
      amount: numAmount,
      remarks: remarks.trim() || undefined,
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || 'Invalid transaction inputs.');
      return;
    }

    const { accountNo: validAcc, amount: validAmount, remarks: validRemarks } = validation.data;

    // Domain validation based on operation
    let newBal: number | undefined = undefined;
    const memberName = matchedData?.member?.nameNepali || matchedData?.member?.name || 'सहकारी सदस्य / Member';
    const memberId = matchedData?.member?.id || validAcc;

    if (node.operation === 'SAVINGS_WITHDRAWAL') {
      const currentBal = matchedData?.savings?.balance ?? 0;
      if (currentBal < validAmount) {
        setFormError(`अपर्याप्त मौज्दात! खातामा जम्मा रु. ${currentBal.toLocaleString()} मात्र उपलब्ध छ।`);
        return;
      }
      adjustSavingsBalance(validAcc, validAmount, 'WITHDRAWAL', validRemarks);
      newBal = currentBal - validAmount;
    } else if (node.operation === 'SAVINGS_DEPOSIT') {
      const currentBal = matchedData?.savings?.balance ?? 0;
      adjustSavingsBalance(validAcc, validAmount, 'DEPOSIT', validRemarks);
      newBal = currentBal + validAmount;
    } else if (node.operation === 'LOAN_EMI_PAYMENT' || node.operation === 'LOAN_FULL_SETTLEMENT') {
      const loanTarget = matchedData?.loan?.loanNo || validAcc;
      recordLoanRepayment(loanTarget, validAmount, validRemarks);
      const remaining = matchedData?.loan?.remainingBalance ?? 0;
      newBal = Math.max(0, remaining - validAmount);
    } else {
      // General ledger or share issuance transaction
      addTransaction({
        memberId,
        type: 'SHARE_PURCHASE',
        amount: validAmount,
        description: `${node.labelNe} - ${validRemarks}`,
        referenceNo: `FST-${Date.now().toString().slice(-6)}`,
      });
    }

    const newReceipt: FastTransactionReceipt = {
      referenceNo: `CBS-FST-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date().toLocaleDateString('ne-NP'),
      operation: node.operation,
      memberName,
      memberId,
      accountNo: validAcc,
      amount: validAmount,
      newBalance: newBal,
      remarks: validRemarks,
      tellerName: 'अधिकारी / Counter Teller #01',
    };

    setReceipt(newReceipt);
    if (onSuccessTransaction) {
      onSuccessTransaction(newReceipt);
    }
  };

  // Keyboard shortcut listener within form
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If receipt is showing, Enter or Space starts next transaction, Ctrl+P prints
      if (receipt) {
        if (e.key === 'Enter') {
          e.preventDefault();
          resetForNext();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
          e.preventDefault();
          printElement('cbs-fast-slip', { format: printFormat });
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onBack();
        }
        return;
      }

      // If in form:
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecuteTransaction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [receipt, accountNo, amount, remarks, matchedData, node.operation]);

  const resetForNext = () => {
    setReceipt(null);
    setAccountNo('');
    setAmount('');
    setRemarks('');
    setFormError(null);
  };

  // -------------------- RENDER RECEIPT --------------------
  if (receipt) {
    return (
      <div className="p-6 bg-slate-900 text-white rounded-xl flex flex-col items-center animate-fade-in">
        {/* On-screen success notification (hidden when printing) */}
        <div className="flex flex-col items-center print:hidden mb-1">
          <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
            <CheckCircle2 className="size-7" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-white text-center">
            {t('दाखिला सफल भयो!', 'Transaction Successfully Posted!')}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">भौचर नं: {receipt.referenceNo}</p>
        </div>

        {/* Official Printable CBS Voucher Slip */}
        <div
          id="cbs-fast-slip"
          data-printable="slip"
          className="w-full max-w-lg bg-white text-slate-900 rounded-xl p-6 my-3 shadow-xl border border-slate-300 font-sans text-xs"
        >
          {/* Cooperative Official Header */}
          <div className="text-center pb-3 border-b-2 border-slate-800">
            <h4 className="font-black text-base tracking-tight text-slate-900 uppercase">
              {coopSettings?.nameNepali || 'उनको बचत तथा ऋण सहकारी संस्था लि.'}
            </h4>
            <p className="text-[11px] font-bold text-slate-700">{coopSettings?.name || 'UNAKO SACCOS LIMITED'}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              {coopSettings?.addressNepali || 'गढवा-५, चैनपुर, दाङ, नेपाल'} • फोन: {coopSettings?.phone || '०८२-४१२०५५'}
            </p>
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 mt-0.5">
              <span>दर्ता नं: {coopSettings?.regNo || '१२९०/०६७/०६८'}</span>
              <span>•</span>
              <span>प्यान नं: {coopSettings?.panNo || '३००१२४८९०'}</span>
            </div>
            <div className="mt-2 inline-block px-3 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-bold text-slate-800 tracking-wide uppercase">
              केन्द्रीय सीबीएस काउन्टर भौचर (CBS Transaction Advice)
            </div>
          </div>

          {/* Voucher Metadata */}
          <div className="py-2.5 flex items-center justify-between border-b border-dashed border-slate-300 text-[11px]">
            <div>
              <span className="text-slate-500">भौचर नं (Voucher No): </span>
              <span className="font-mono font-bold text-slate-900">{receipt.referenceNo}</span>
            </div>
            <div>
              <span className="text-slate-500">कारोबार मिति: </span>
              <span className="font-bold text-slate-800">{receipt.timestamp}</span>
            </div>
          </div>

          {/* Transaction Core Details */}
          <div className="py-3 space-y-2 border-b-2 border-slate-800 text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600">सदस्यको नाम (Member Name):</span>
              <span className="font-bold text-slate-900">{receipt.memberName}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600">सदस्य नं / खाता नं (Member / Acc No):</span>
              <span className="font-mono font-bold text-slate-900">{receipt.accountNo}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600">कारोबार शीर्षक (Scheme / Type):</span>
              <span className="font-bold text-slate-800">{node.labelNe}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-700 text-xs">दाखिला/भुक्तानी रकम (Amount):</span>
              <span className="font-mono font-black text-base text-emerald-700">
                रु. {receipt.amount.toLocaleString('ne-NP', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {receipt.newBalance !== undefined && (
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-600">अद्यावधिक मौज्दात (Balance After Tx):</span>
                <span className="font-mono font-bold text-slate-900">
                  रु. {receipt.newBalance.toLocaleString('ne-NP', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600">कैफियत (Remarks):</span>
              <span className="text-slate-800 font-medium">{receipt.remarks}</span>
            </div>
          </div>

          {/* Dual Official Signature Blocks */}
          <div className="pt-8 pb-3 grid grid-cols-2 gap-8 text-[11px] text-center">
            <div>
              <div className="border-t border-slate-400 pt-1.5">
                <p className="font-bold text-slate-800">दाखिलाकर्ता / ग्राहकको दस्तखत</p>
                <p className="text-[10px] text-slate-500 font-sans">(Customer Signature)</p>
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5">
                <p className="font-bold text-slate-800">काउन्टर क्यासियरको दस्तखत तथा छाप</p>
                <p className="text-[10px] text-slate-500 font-sans">(Teller Signature & Stamp)</p>
              </div>
            </div>
          </div>

          {/* Slip Footer Watermark Note */}
          <div className="pt-2 border-t border-dashed border-slate-300 flex items-center justify-between text-[9px] text-slate-500">
            <span>प्रविष्टि: {receipt.tellerName}</span>
            <span className="font-mono">प्रणाली: CBS-FAST-CORE v2.4</span>
            <span>* आधिकारिक बैंक प्रतिलिपि</span>
          </div>
        </div>

        {/* Print Format Selector & Action Buttons (hidden in print) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-3 print:hidden">
          <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-lg border border-slate-700 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold px-1.5">ढाँचा:</span>
            {(
              [
                { id: 'thermal-80mm', label: '८०mm थर्मल' },
                { id: 'thermal-58mm', label: '५८mm थर्मल' },
                { id: 'a4', label: 'A4 स्लिप' },
              ] as const
            ).map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setPrintFormat(fmt.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  printFormat === fmt.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => printElement('cbs-fast-slip', { format: printFormat, title: `Unako-Slip-${receipt.referenceNo}` })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <Printer className="size-4" />
            <span>रसिद छाप्नुहोस् (Ctrl+P)</span>
          </button>
          <button
            type="button"
            onClick={resetForNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
          >
            <RotateCcw className="size-4" />
            <span>अर्को कारोबार (Enter)</span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>फर्कनुहोस् (Esc)</span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------- RENDER FORM --------------------
  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl flex flex-col space-y-5">
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-mono">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={b.id}>
                <span>{b.labelNe}</span>
                {idx < breadcrumbs.length - 1 && <span className="text-slate-600">&gt;</span>}
              </React.Fragment>
            ))}
          </div>
          <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
            <CreditCard className="size-4 text-emerald-400" />
            <span>{node.labelNe} ({node.labelEn})</span>
          </h3>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 cursor-pointer"
        >
          <ArrowLeft className="size-3.5" />
          <span>फर्कनुहोस् (Esc)</span>
        </button>
      </div>

      {formError && (
        <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0 text-rose-400" />
          <span>{formError}</span>
        </div>
      )}

      {/* 3-Input Speed Voucher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Account / Member Input */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            खाता / सदस्यता / ऋण नं <span className="text-rose-400">*</span>
          </label>
          <input
            ref={accountInputRef}
            type="text"
            value={accountNo}
            onChange={(e) => setAccountNo(e.target.value)}
            placeholder="उदा. SAV-001, MEM-001..."
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-600"
          />
        </div>

        {/* 2. Amount Input */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            कारोबार रकम (रु.) <span className="text-rose-400">*</span>
          </label>
          <input
            ref={amountInputRef}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="1"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-600 font-bold"
          />
        </div>

        {/* 3. Remarks Input */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            कैफियत / विवरण (Remarks)
          </label>
          <input
            ref={remarksInputRef}
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="काउन्टर नगद जम्मा / किस्ता"
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-600"
          />
        </div>
      </div>

      {/* Live Member Verification Strip */}
      {matchedData?.member ? (
        <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold text-xs">
              <UserCheck className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <span>{matchedData.member.nameNepali || matchedData.member.name}</span>
                {matchedData.member.nameNepali && matchedData.member.name && (
                  <span className="text-slate-400 font-normal">({matchedData.member.name})</span>
                )}
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700">
                  {matchedData.member.memberNo || matchedData.member.id}
                </span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                सम्पर्क: {matchedData.member.phone} | ठेगाना: {matchedData.member.address}
              </p>
            </div>
          </div>
          {matchedData.savings && (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">वर्तमान मौज्दात</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                रु. {matchedData.savings.balance.toLocaleString()}
              </span>
            </div>
          )}
          {matchedData.loan && (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">बाँकी कर्जा साँवा</span>
              <span className="text-xs font-mono font-bold text-amber-400">
                रु. {matchedData.loan.remainingBalance.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      ) : accountNo.length >= 2 ? (
        <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs">
          सूचना: दिइएको खाता/सदस्यता नम्बर फेला परेन। कृपया सही खाता नम्बर प्रविष्ट गर्नुहोस्।
        </div>
      ) : null}

      {/* Footer Controls & Hotkeys */}
      <div className="pt-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 text-[10px]">Ctrl+Enter</kbd>
            <span>दाखिला गर्नुहोस्</span>
          </span>
          <span className="flex items-center gap-1 font-mono">
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 text-[10px]">Esc</kbd>
            <span>रद्द / फिर्ता</span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleExecuteTransaction}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg cursor-pointer"
        >
          <Receipt className="size-4" />
          <span>कारोबार सम्पन्न गर्नुहोस् (Ctrl+Enter)</span>
        </button>
      </div>
    </div>
  );
};
