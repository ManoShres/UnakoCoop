import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  QrCode,
  Barcode,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  PlusCircle,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Calendar,
  CreditCard,
  User,
  Sparkles,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import {
  PassbookRecord,
  PassbookStatus,
  PassbookVerificationResult,
  MOCK_PASSBOOK_REGISTRY,
  parseAndVerifyBarcode,
  generateBarcodeSvg,
  generateQrCodeSvg,
  preparePassbookPrintBatch,
  issueNewPassbook,
  reissuePassbook,
  updateLastPrintedState,
  exportPassbookRegistryCsv,
} from '../../utils/passbookEngine';
import { printElement } from '../../utils/printHelper';

interface PassbookDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAccountNo?: string;
  initialMemberId?: string;
}

export const PassbookDeskModal: React.FC<PassbookDeskModalProps> = ({
  isOpen,
  onClose,
  initialAccountNo,
  initialMemberId,
}) => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const { coopSettings, members, savings, transactions } = useCoopStore();

  const [activeTab, setActiveTab] = useState<'SCANNER' | 'PRINT_DESK' | 'COVER' | 'REGISTRY'>('SCANNER');
  const [records, setRecords] = useState<PassbookRecord[]>(MOCK_PASSBOOK_REGISTRY);

  // Scanner state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<PassbookVerificationResult | null>(null);

  // Print Desk state
  const [selectedAccountNo, setSelectedAccountNo] = useState<string>(
    initialAccountNo || '004-10294-88-01'
  );
  const [startLine, setStartLine] = useState<number>(1);
  const [linesPerPage, setLinesPerPage] = useState<number>(20);
  const [isMarkedAsPrinted, setIsMarkedAsPrinted] = useState(false);

  // New/Reissue modal sub-state
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueMode, setIssueMode] = useState<'NEW' | 'REISSUE'>('NEW');
  const [selectedRecordForReissue, setSelectedRecordForReissue] = useState<PassbookRecord | null>(null);
  const [reissueReason, setReissueReason] = useState<'LOST_STOLEN' | 'REPLACED_FULL' | 'DAMAGED'>('LOST_STOLEN');
  const [selectedMemberForNew, setSelectedMemberForNew] = useState<string>(
    initialMemberId || members[0]?.id || ''
  );
  const [newAccountType, setNewAccountType] = useState('नियमित बचत (Regular Savings)');
  const [registryFilter, setRegistryFilter] = useState<'ALL' | PassbookStatus>('ALL');
  const [registrySearch, setRegistrySearch] = useState('');

  // Find active passbook for selected account
  const activePassbook = useMemo(() => {
    return records.find((r) => r.accountNo === selectedAccountNo && r.status === 'ACTIVE') || records[0];
  }, [records, selectedAccountNo]);

  // Member and account data for cover & print desk
  const currentMember = useMemo(() => {
    return members.find((m) => m.id === activePassbook.memberId || m.memberNo === activePassbook.memberNo) || members[0];
  }, [members, activePassbook]);

  const currentSavings = useMemo(() => {
    return savings.find((s) => s.accountNo === selectedAccountNo) || savings[0];
  }, [savings, selectedAccountNo]);

  // Member transactions for the selected account
  const accountTransactions = useMemo(() => {
    return transactions.filter(
      (tx) => tx.memberId === currentMember.id || tx.referenceNo.includes('REC') || tx.referenceNo.includes('CHQ')
    );
  }, [transactions, currentMember]);

  // Prepare passbook batch
  const printBatch = useMemo(() => {
    const openingBal = currentSavings ? Math.max(0, currentSavings.balance - 50000) : 50000;
    return preparePassbookPrintBatch(accountTransactions, startLine, linesPerPage, openingBal);
  }, [accountTransactions, startLine, linesPerPage, currentSavings]);

  if (!isOpen) return null;

  // Scanner actions
  const handleVerify = (codeToVerify?: string) => {
    const code = codeToVerify || barcodeInput;
    if (!code.trim()) return;
    const result = parseAndVerifyBarcode(code, records);
    setVerificationResult(result);
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerify();
    }
  };

  const loadSample = (sampleType: 'ACTIVE' | 'LOST' | 'TAMPERED') => {
    if (sampleType === 'ACTIVE') {
      const rec = records.find((r) => r.status === 'ACTIVE') || records[0];
      setBarcodeInput(rec.barcodePayload);
      handleVerify(rec.barcodePayload);
    } else if (sampleType === 'LOST') {
      const rec = records.find((r) => r.status === 'LOST_STOLEN') || records[2];
      setBarcodeInput(rec.barcodePayload);
      handleVerify(rec.barcodePayload);
    } else {
      const tampered = 'PB:PB-UNAKO-2081-00101|MEM:M-00101|ACC:004-10294-88-01|CRC:BAD12345';
      setBarcodeInput(tampered);
      handleVerify(tampered);
    }
  };

  // Line-printer print
  const handlePrintPassbookLines = () => {
    printElement('physical-passbook-print-sheet', {
      format: 'passbook',
      title: `Passbook-Print-${activePassbook.passbookNo}-Line${startLine}`,
    });
  };

  const handleMarkAsPrinted = () => {
    const nonSpacers = printBatch.lines.filter((l) => !l.isSpacer);
    const lastLineUsed = nonSpacers.length > 0 ? nonSpacers[nonSpacers.length - 1].lineNo : startLine;
    const updated = updateLastPrintedState(records, activePassbook.id, lastLineUsed, activePassbook.lastPrintedPage, '2081-06-25');
    setRecords(updated);
    setIsMarkedAsPrinted(true);
    setTimeout(() => setIsMarkedAsPrinted(false), 3000);
  };

  // Cover print
  const handlePrintCover = () => {
    printElement('passbook-official-cover-page', {
      format: 'passbook',
      title: `Passbook-Cover-${activePassbook.passbookNo}`,
    });
  };

  // Issue new passbook
  const handleIssueNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mem = members.find((m) => m.id === selectedMemberForNew) || members[0];
    const acctNo = `004-${mem.memberNo.replace('M-', '')}-88-01`;
    const res = issueNewPassbook(
      records,
      {
        memberId: mem.id,
        memberNo: mem.memberNo,
        memberName: mem.name,
        accountNo: acctNo,
        accountType: newAccountType,
        issuedBy: 'हेमन्त श्रेष्ठ (Senior Teller)',
        notes: 'Issued via Passbook Desk',
      },
      '2081-06-25',
      '2024-10-10'
    );
    setRecords(res.records);
    setShowIssueForm(false);
  };

  // Reissue passbook
  const handleReissueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForReissue) return;
    const res = reissuePassbook(
      records,
      selectedRecordForReissue.id,
      reissueReason,
      'हेमन्त श्रेष्ठ (Senior Teller)',
      '2081-06-25',
      '2024-10-10',
      `Reissue requested at teller counter: ${reissueReason}`
    );
    setRecords(res.records);
    setShowIssueForm(false);
    setSelectedRecordForReissue(null);
  };

  // Export CSV
  const handleExportCsv = () => {
    const csv = exportPassbookRegistryCsv(records);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Unako_Passbook_Registry_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredRecords = records.filter((r) => {
    if (registryFilter !== 'ALL' && r.status !== registryFilter) return false;
    if (registrySearch.trim()) {
      const q = registrySearch.toLowerCase();
      return (
        r.passbookNo.toLowerCase().includes(q) ||
        r.memberName.toLowerCase().includes(q) ||
        r.memberNo.toLowerCase().includes(q) ||
        r.accountNo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <BookOpen className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {t('पासबुक प्रमाणीकरण, बारकोड तथा मुद्रण व्यवस्थापन', 'Passbook Verification, Barcode & Print Desk')}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  CBS SECURE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {coopSettings.name} • {t('काउन्टर तथा टेलर व्यवस्थापन', 'Teller Counter Desk')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('SCANNER')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SCANNER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Barcode className="size-4" />
            <span>{t('बारकोड/QR स्क्यानर', 'Verification Scanner')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PRINT_DESK')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'PRINT_DESK'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Printer className="size-4" />
            <span>{t('पासबुक मुद्रण डेस्क', 'Line-Printer Desk')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COVER')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'COVER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <QrCode className="size-4" />
            <span>{t('आधिकारिक कभर मुद्रण', 'Official Cover Print')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REGISTRY')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'REGISTRY'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="size-4" />
            <span>{t('पासबुक दर्ता किताब', 'Passbook Registry')}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px]">
              {records.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: SCANNER */}
          {activeTab === 'SCANNER' && (
            <div className="space-y-6">
              {/* Input Card */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Barcode className="size-4 text-emerald-600" />
                      <span>{t('बारकोड वा QR कोड स्क्यान गर्नुहोस्', 'Scan Barcode or 2D QR Code')}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('बारकोड रिडर गनबाट सिधै इनपुट गर्नुहोस् वा पासबुक नम्बर राख्नुहोस्', 'Scan via USB/Bluetooth barcode gun or input passbook number')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">{t('नमूना:', 'Samples:')}</span>
                    <button
                      type="button"
                      onClick={() => loadSample('ACTIVE')}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200"
                    >
                      {t('सक्रिय', 'Active')}
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSample('LOST')}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200"
                    >
                      {t('हराएको', 'Lost')}
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSample('TAMPERED')}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200"
                    >
                      {t('नक्कली/खराब CRC', 'Tampered')}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={handleBarcodeKeyDown}
                      placeholder={t('स्क्यान गर्नुहोस् वा पासबुक कोड टाँस्नुहोस्...', 'Scan or paste barcode string (e.g. PB:PB-UNAKO-2081-00101|...)...')}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleVerify()}
                    className="px-5 py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Search className="size-4" />
                    <span>{t('प्रमाणीकरण गर्नुहोस्', 'Verify Now')}</span>
                  </button>
                </div>
              </div>

              {/* Verification Result Display */}
              {verificationResult && (
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    verificationResult.isValid
                      ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30 dark:border-emerald-800'
                      : verificationResult.status === 'LOST_STOLEN'
                      ? 'border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 dark:border-rose-800'
                      : 'border-amber-300 bg-amber-50/60 dark:bg-amber-950/30 dark:border-amber-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          verificationResult.isValid
                            ? 'bg-emerald-600 text-white'
                            : verificationResult.status === 'LOST_STOLEN'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {verificationResult.isValid ? (
                          <ShieldCheck className="size-7" />
                        ) : (
                          <ShieldAlert className="size-7" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-slate-900 dark:text-white">
                            {verificationResult.message}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${
                              verificationResult.isValid
                                ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100'
                                : 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100'
                            }`}
                          >
                            {verificationResult.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {t('प्रमाणीकरण मिति:', 'Verified at:')}{' '}
                          <span className="font-mono">{new Date(verificationResult.verifiedAt).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    {verificationResult.isValid && verificationResult.matchedRecord && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAccountNo(verificationResult.matchedRecord!.accountNo);
                          setActiveTab('PRINT_DESK');
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 shrink-0 shadow-sm"
                      >
                        <span>{t('मुद्रण डेस्कमा जानुहोस्', 'Go to Print Desk')}</span>
                        <ArrowRight className="size-4" />
                      </button>
                    )}
                  </div>

                  {verificationResult.matchedRecord && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                      <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{t('सदस्यको नाम', 'Member Name')}</div>
                        <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                          {verificationResult.matchedRecord.memberName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {verificationResult.matchedRecord.memberNo}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{t('खाता नम्बर', 'Account No')}</div>
                        <div className="text-xs font-mono font-black text-slate-900 dark:text-white mt-0.5">
                          {verificationResult.matchedRecord.accountNo}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {verificationResult.matchedRecord.accountType}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{t('पासबुक नं. / चेकसम', 'Passbook / CRC')}</div>
                        <div className="text-xs font-mono font-black text-slate-900 dark:text-white mt-0.5">
                          {verificationResult.matchedRecord.passbookNo}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          CRC: {verificationResult.matchedRecord.securityChecksum}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{t('अन्तिम मुद्रण स्थिति', 'Last Printed')}</div>
                        <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                          {t('पाना', 'Page')} {fmtDigits(verificationResult.matchedRecord.lastPrintedPage)} • {t('लाइन', 'Line')} {fmtDigits(verificationResult.matchedRecord.lastPrintedLine)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {verificationResult.matchedRecord.lastPrintedDate || t('हालसम्म मुद्रण नभएको', 'Not printed yet')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRINT DESK */}
          {activeTab === 'PRINT_DESK' && (
            <div className="space-y-6">
              {/* Controls Bar */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      {t('खाता छान्नुहोस्', 'Select Account')}
                    </label>
                    <select
                      value={selectedAccountNo}
                      onChange={(e) => setSelectedAccountNo(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {savings.map((s) => (
                        <option key={s.id} value={s.accountNo}>
                          {s.accountNo} - {s.accountType} ({fmtCurrency(s.balance, false)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      {t('सुरुवात लाइन', 'Start Line (1-20)')}
                    </label>
                    <select
                      value={startLine}
                      onChange={(e) => setStartLine(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {t('लाइन', 'Line')} {fmtDigits(n)} {n === 1 ? `(${t('नयाँ पाना', 'Fresh Page')})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      {t('प्रति पाना लाइन क्षमता', 'Lines Per Page')}
                    </label>
                    <select
                      value={linesPerPage}
                      onChange={(e) => setLinesPerPage(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value={20}>{t('२० लाइन (मानक पासबुक)', '20 Lines (Standard Passbook)')}</option>
                      <option value={22}>{t('२२ लाइन (ओलिभेटी/एप्सन)', '22 Lines (Olivetti/Epson)')}</option>
                      <option value={18}>{t('१८ लाइन (छोटो आकार)', '18 Lines (Compact)')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintPassbookLines}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer className="size-4" />
                    <span>{t('पासबुकमा छाप्नुहोस्', 'Print on Passbook')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkAsPrinted}
                    disabled={isMarkedAsPrinted}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                      isMarkedAsPrinted
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>{isMarkedAsPrinted ? t('रेकर्ड अद्यावधिक भयो!', 'CBS Updated!') : t('मुद्रण सम्पन्न चिन्ह लगाउनुहोस्', 'Mark Printed')}</span>
                  </button>
                </div>
              </div>

              {/* Printable Physical Passbook Sheet (and On-Screen Preview) */}
              <div
                id="physical-passbook-print-sheet"
                data-printable="passbook"
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-[11px] shadow-sm"
              >
                {/* Physical passbook header summary */}
                <div className="flex justify-between items-center pb-3 border-b-2 border-slate-800 dark:border-slate-600 mb-3 text-xs">
                  <div>
                    <strong className="text-slate-900 dark:text-white uppercase">UNAKO SACCOS • PASSBOOK LEDGER</strong>
                    <div className="text-[10px] text-slate-500">
                      A/C: {activePassbook.accountNo} • {activePassbook.memberName} ({activePassbook.memberNo})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500">
                      PB NO: {activePassbook.passbookNo} • PAGE {fmtDigits(activePassbook.lastPrintedPage)}
                    </span>
                    <div className="text-[10px] text-emerald-600 font-bold">
                      START LINE: {fmtDigits(startLine)} / {fmtDigits(linesPerPage)}
                    </div>
                  </div>
                </div>

                {/* Printable Continuous Transaction Table */}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-400 dark:border-slate-700 text-[10px] text-slate-500 font-bold uppercase">
                      <th className="py-1 px-1.5 w-10 text-center">{t('लाइन', 'LN')}</th>
                      <th className="py-1 px-2 w-24">{t('मिति (BS)', 'DATE')}</th>
                      <th className="py-1 px-2">{t('विवरण (PARTICULARS)', 'PARTICULARS')}</th>
                      <th className="py-1 px-2 w-24">{t('भौचर नं.', 'VCH/REF')}</th>
                      <th className="py-1 px-2 w-24 text-right">{t('डेबिट (रु)', 'DEBIT')}</th>
                      <th className="py-1 px-2 w-24 text-right">{t('क्रेडिट (रु)', 'CREDIT')}</th>
                      <th className="py-1 px-2 w-28 text-right">{t('मौज्दात (रु)', 'BALANCE')}</th>
                      <th className="py-1 px-1.5 w-12 text-center">{t('दस्तखत', 'SIG')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printBatch.lines.map((line) => (
                      <tr
                        key={line.lineNo}
                        className={`border-b border-slate-100 dark:border-slate-900 ${
                          line.isSpacer
                            ? 'bg-slate-50/50 dark:bg-slate-900/30 text-slate-300 dark:text-slate-700'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <td className="py-1 px-1.5 text-center font-bold text-[10px] text-slate-400">
                          {line.lineNo.toString().padStart(2, '0')}
                        </td>
                        <td className="py-1 px-2">{line.isSpacer ? '---' : line.dateBS}</td>
                        <td className="py-1 px-2 truncate max-w-xs">
                          {line.isSpacer ? `[${t('पहिले नै मुद्रण भएको खाली लाइन', 'Skipped / Already printed line')}]` : line.particulars}
                        </td>
                        <td className="py-1 px-2 text-[10px]">{line.isSpacer ? '---' : line.chequeOrVoucherNo}</td>
                        <td className="py-1 px-2 text-right text-rose-600 font-bold">
                          {line.isSpacer || line.debit === null ? '' : fmtCurrency(line.debit, false)}
                        </td>
                        <td className="py-1 px-2 text-right text-emerald-600 font-bold">
                          {line.isSpacer || line.credit === null ? '' : fmtCurrency(line.credit, false)}
                        </td>
                        <td className="py-1 px-2 text-right font-black">
                          {line.isSpacer ? '' : fmtCurrency(line.balance, false)}
                        </td>
                        <td className="py-1 px-1.5 text-center text-[10px] text-slate-400">
                          {line.isSpacer ? '' : line.initials}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Print Sheet Footer */}
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500">
                  <div>
                    {t('मुद्रण समय:', 'Printed at:')} {new Date().toLocaleDateString()} • {coopSettings.name}
                  </div>
                  <div className="font-bold text-slate-700 dark:text-slate-300">
                    {t('अन्तिम मौज्दात:', 'Closing Balance:')} {fmtCurrency(printBatch.closingBalance, false)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL PASSBOOK COVER PRINT */}
          {activeTab === 'COVER' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {t('आधिकारिक सदस्य पासबुक पहिचान कभर', 'Official Member Passbook Front / ID Cover')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('पासबुकको भित्री पहिलो पानामा मुद्रण गरिने आधिकारिक पहिचान र बारकोड', 'Prints official identity, photo frame, barcode & QR for passbook inner front page')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrintCover}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="size-4" />
                  <span>{t('कभर छाप्नुहोस्', 'Print Cover Page')}</span>
                </button>
              </div>

              {/* Printable Official Passbook Booklet Inside Cover */}
              <div
                id="passbook-official-cover-page"
                data-printable="passbook"
                className="p-6 rounded-3xl border-2 border-emerald-900/30 dark:border-emerald-600/30 bg-radial from-white to-emerald-50/20 dark:from-slate-900 dark:to-emerald-950/20 shadow-md max-w-3xl mx-auto space-y-5"
              >
                {/* Header */}
                <div className="text-center border-b-2 border-emerald-800 pb-3">
                  <div className="flex justify-center items-center gap-3 mb-1">
                    <img alt="Unako SACCOS Logo" className="h-10 w-auto object-contain" src="/unako-logo.png" />
                    <div>
                      <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        {coopSettings.name}
                      </h1>
                      <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                        {coopSettings.address} • {t('दर्ता नं.', 'Reg No.')} {coopSettings.regNo}
                      </div>
                    </div>
                  </div>
                  <div className="inline-block px-4 py-0.5 mt-1 rounded-full bg-emerald-800 text-white text-[11px] font-black uppercase tracking-widest">
                    {t('सदस्य बचत तथा ऋण पासबुक (MEMBER CBS PASSBOOK)', 'MEMBER CBS PASSBOOK')}
                  </div>
                </div>

                {/* Member Info & Photo Layout */}
                <div className="grid grid-cols-4 gap-4 items-start">
                  <div className="col-span-3 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{t('सदस्यको नाम', 'Member Name')}</span>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{currentMember.name}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{t('सदस्य नम्बर', 'Member ID')}</span>
                        <div className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{currentMember.memberNo}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{t('बचत खाता नम्बर', 'Account Number')}</span>
                        <div className="text-xs font-mono font-black text-slate-900 dark:text-white mt-0.5">{activePassbook.accountNo}</div>
                        <div className="text-[10px] text-slate-500">{activePassbook.accountType}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{t('नागरिकता / फोन', 'Citizenship / Phone')}</span>
                        <div className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                          {currentMember.citizenshipNo || '५२-०१-७२-०३८४२'} • {currentMember.phone}
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{t('हकवाला (इच्छाएको व्यक्ति)', 'Nominee')}</span>
                      <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                        {currentMember.nominee?.name || 'अनिता चौधरी'} ({t('नाता:', 'Rel:')} {currentMember.nominee?.relation || 'श्रीमती'})
                      </div>
                    </div>
                  </div>

                  {/* Photo Frame & Passbook Serial */}
                  <div className="col-span-1 flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 aspect-3/4 text-center">
                    <User className="size-10 text-slate-300 dark:text-slate-600 mb-1" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase leading-tight">
                      {t('सदस्यको फोटो टाँस्ने ठाउँ', 'Member Photo')}
                    </span>
                  </div>
                </div>

                {/* Barcode & 2D QR Code Section */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex-1 flex flex-col items-center sm:items-start">
                    <span className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                      {t('आधिकारिक बारकोड', 'Machine-Readable Barcode')}
                    </span>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: generateBarcodeSvg(activePassbook.passbookNo, 40, true),
                      }}
                      className="overflow-x-auto"
                    />
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: generateQrCodeSvg(activePassbook.barcodePayload, 75),
                      }}
                      className="size-18 p-1 bg-white rounded-lg border border-slate-200 shrink-0"
                    />
                    <div className="text-[10px] text-slate-500">
                      <div className="font-bold text-slate-700 dark:text-slate-300">
                        CRC: {activePassbook.securityChecksum}
                      </div>
                      <div>{t('जारी मिति:', 'Issued:')} {activePassbook.issueDateBS}</div>
                      <div>{activePassbook.issuedBy}</div>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 dark:border-slate-700 text-center text-xs">
                  <div>
                    <div className="h-8"></div>
                    <div className="border-t border-slate-400 dark:border-slate-600 pt-1 font-bold text-slate-700 dark:text-slate-300">
                      {t('खातावाला सदस्यको दस्तखत', 'Member Signature')}
                    </div>
                  </div>
                  <div>
                    <div className="h-8"></div>
                    <div className="border-t border-slate-400 dark:border-slate-600 pt-1 font-bold text-slate-700 dark:text-slate-300">
                      {t('प्रबन्धक / अधिकृतको छाप र दस्तखत', 'Authorized Officer & Seal')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PASSBOOK REGISTRY */}
          {activeTab === 'REGISTRY' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="size-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      placeholder={t('पासबुक नं, सदस्य वा खाता खोज्नुहोस्...', 'Search passbook, member or account...')}
                      className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <select
                    value={registryFilter}
                    onChange={(e) => setRegistryFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    <option value="ALL">{t('सबै स्थिति', 'All Status')}</option>
                    <option value="ACTIVE">{t('सक्रिय', 'Active')}</option>
                    <option value="LOST_STOLEN">{t('हराएको', 'Lost/Stolen')}</option>
                    <option value="REPLACED_FULL">{t('पाना भरिएको', 'Pages Full')}</option>
                    <option value="DAMAGED">{t('क्षति भएको', 'Damaged')}</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIssueMode('NEW');
                      setShowIssueForm(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <PlusCircle className="size-4" />
                    <span>{t('नयाँ पासबुक जारी', 'Issue New Passbook')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="size-4 text-emerald-600" />
                    <span>{t('CSV निर्यात', 'Export CSV')}</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">{t('पासबुक नम्बर', 'Passbook No')}</th>
                      <th className="py-2.5 px-3">{t('सदस्य', 'Member')}</th>
                      <th className="py-2.5 px-3">{t('खाता नम्बर', 'Account No')}</th>
                      <th className="py-2.5 px-3">{t('जारी मिति', 'Issue Date')}</th>
                      <th className="py-2.5 px-3 text-center">{t('पाना / लाइन', 'Page/Line')}</th>
                      <th className="py-2.5 px-3 text-center">{t('शुल्क (रु)', 'Fee')}</th>
                      <th className="py-2.5 px-3 text-center">{t('स्थिति', 'Status')}</th>
                      <th className="py-2.5 px-3 text-right">{t('कार्य', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {filteredRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          {r.passbookNo}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{r.memberName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{r.memberNo}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-700 dark:text-slate-300">{r.accountNo}</div>
                          <div className="text-[10px] font-sans text-slate-400 truncate max-w-xs">{r.accountType}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {r.issueDateBS}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {fmtDigits(r.lastPrintedPage)} / {fmtDigits(r.lastPrintedLine)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {r.replacementFee ? `रु. ${fmtCurrency(r.replacementFee, false)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              r.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : r.status === 'LOST_STOLEN'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {r.status === 'ACTIVE' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRecordForReissue(r);
                                setIssueMode('REISSUE');
                                setShowIssueForm(true);
                              }}
                              className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-100 transition"
                            >
                              {t('प्रतिलिपि / बदल्नुहोस्', 'Reissue')}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">{t('बन्द', 'Closed')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Issue / Reissue Modal Sub-dialog */}
        {showIssueForm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {issueMode === 'NEW'
                    ? t('नयाँ पासबुक जारी फारम', 'Issue New Passbook')
                    : t('पासबुक प्रतिलिपि / प्रतिस्थापन', 'Reissue Duplicate / Replacement')}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowIssueForm(false)}
                  className="size-7 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="size-4" />
                </button>
              </div>

              {issueMode === 'NEW' ? (
                <form onSubmit={handleIssueNewSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      {t('सदस्य छान्नुहोस्', 'Select Member')}
                    </label>
                    <select
                      value={selectedMemberForNew}
                      onChange={(e) => setSelectedMemberForNew(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.memberNo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      {t('खाता प्रकार', 'Account Type')}
                    </label>
                    <select
                      value={newAccountType}
                      onChange={(e) => setNewAccountType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="नियमित बचत (Regular Savings)">नियमित बचत (Regular Savings)</option>
                      <option value="अनिवार्य बचत (Compulsory Monthly)">अनिवार्य बचत (Compulsory Monthly)</option>
                      <option value="महिला स्वावलम्बन बचत">महिला स्वावलम्बन बचत</option>
                      <option value="मुद्दती निक्षेप (Fixed Term)">मुद्दती निक्षेप (Fixed Term)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowIssueForm(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600"
                    >
                      {t('रद्द', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold"
                    >
                      {t('जारी गर्नुहोस्', 'Issue Now')}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleReissueSubmit} className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{t('पुरानो पासबुक', 'Old Passbook')}</div>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {selectedRecordForReissue?.passbookNo}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {selectedRecordForReissue?.memberName} ({selectedRecordForReissue?.accountNo})
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      {t('प्रतिलिपि कारण', 'Reissue Reason')}
                    </label>
                    <select
                      value={reissueReason}
                      onChange={(e) => setReissueReason(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="LOST_STOLEN">{t('हराएको / चोरी भएको (शुल्क रु. १००)', 'Lost / Stolen (Fee NPR 100)')}</option>
                      <option value="REPLACED_FULL">{t('पाना भरिएको (नि:शुल्क)', 'Pages Full (Free)')}</option>
                      <option value="DAMAGED">{t('च्यातिएको वा क्षति भएको (शुल्क रु. १००)', 'Damaged (Fee NPR 100)')}</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowIssueForm(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600"
                    >
                      {t('रद्द', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold"
                    >
                      {t('नयाँ पासबुक बनाउनुहोस्', 'Reissue Now')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
