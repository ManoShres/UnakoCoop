import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Member } from '../../types';
import {
  RemittanceTransaction,
  RemittanceBranchInfo,
  calculateRemittanceFee,
  createRemittanceOrder,
  verifyAndDisburseRemittance,
  computeInterBranchClearingLedger,
  exportRemittanceSettlementCsv,
} from '../../utils/remittanceClearing';
import {
  X,
  Printer,
  Copy,
  Download,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowLeftRight,
  ShieldCheck,
  Building,
  KeyRound,
  FileText,
  Search,
} from 'lucide-react';

interface RemittanceClearingModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: readonly Member[];
}

const AVAILABLE_BRANCHES: readonly RemittanceBranchInfo[] = [
  { id: 'br-gadhwa', name: 'गढवा मुख्य कार्यालय (Gadhwa Head Office)' },
  { id: 'br-lamahi', name: 'लमही सेवा केन्द्र (Lamahi Service Center)' },
  { id: 'br-bhalubang', name: 'भालुवाङ सेवा केन्द्र (Bhalubang Service Center)' },
  { id: 'br-gobardiha', name: 'गोबरडिहा सेवा केन्द्र (Gobardiha Service Center)' },
];

export const RemittanceClearingModal: React.FC<RemittanceClearingModalProps> = ({
  isOpen,
  onClose,
  members,
}) => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'SEND' | 'PAYOUT' | 'CLEARING' | 'RECORDS'>('SEND');

  // Transactions Database
  const [transactions, setTransactions] = useState<RemittanceTransaction[]>([
    {
      controlNo: 'UNAKO-8B41E2',
      sendingBranchId: 'br-gadhwa',
      sendingBranchName: 'गढवा मुख्य कार्यालय',
      receivingBranchId: 'br-lamahi',
      receivingBranchName: 'लमही सेवा केन्द्र',
      senderMemberNo: 'UK-M-0142',
      senderName: 'राम बहादुर चौधरी',
      senderPhone: '9844912345',
      receiverName: 'सीता देवी चौधरी',
      receiverPhone: '9844954321',
      receiverCitizenshipNo: '५२-०१-७५-०३४२१',
      remitAmount: 35000,
      serviceFee: 150,
      totalPaidBySender: 35150,
      sendingBranchCommission: 60,
      payingBranchCommission: 60,
      headOfficeCommission: 30,
      status: 'PAID_OUT',
      securityPinHash: 'pin_h_7829',
      sentTimestampBS: '2081/06/25 10:15',
      paidTimestampBS: '2081/06/25 11:40',
      paidByTellerId: 'TELLER-02',
    },
    {
      controlNo: 'UNAKO-9X77K4',
      sendingBranchId: 'br-lamahi',
      sendingBranchName: 'लमही सेवा केन्द्र',
      receivingBranchId: 'br-bhalubang',
      receivingBranchName: 'भालुवाङ सेवा केन्द्र',
      senderMemberNo: 'UK-M-0289',
      senderName: 'गोविन्द प्रसाद श्रेष्ठ',
      senderPhone: '9844988776',
      receiverName: 'माया कुमारी पुन',
      receiverPhone: '9844911223',
      receiverCitizenshipNo: '५२-०१-६९-०११२२',
      remitAmount: 20000,
      serviceFee: 100,
      totalPaidBySender: 20100,
      sendingBranchCommission: 40,
      payingBranchCommission: 40,
      headOfficeCommission: 20,
      status: 'SEND_PENDING_PAYOUT',
      securityPinHash: 'pin_h_3344',
      sentTimestampBS: '2081/06/25 12:30',
    },
  ]);

  // SEND Form State
  const [sendingBranchId, setSendingBranchId] = useState<string>('br-gadhwa');
  const [receivingBranchId, setReceivingBranchId] = useState<string>('br-lamahi');
  const [senderMemberNo, setSenderMemberNo] = useState<string>('UK-M-0142');
  const [senderName, setSenderName] = useState<string>('राम बहादुर चौधरी');
  const [senderPhone, setSenderPhone] = useState<string>('9844912345');
  const [receiverName, setReceiverName] = useState<string>('सीता देवी चौधरी');
  const [receiverPhone, setReceiverPhone] = useState<string>('9844954321');
  const [receiverCitizenshipNo, setReceiverCitizenshipNo] = useState<string>('५२-०१-७५-०३४२१');
  const [remitAmountInput, setRemitAmountInput] = useState<number>(25000);
  const [securityPinInput, setSecurityPinInput] = useState<string>('5588');

  // PAYOUT Form State
  const [searchControlNo, setSearchControlNo] = useState<string>('UNAKO-9X77K4');
  const [payoutEnteredPin, setPayoutEnteredPin] = useState<string>('');
  const [payoutCitizenship, setPayoutCitizenship] = useState<string>('५२-०१-६९-०११२२');
  const [payoutResultMsg, setPayoutResultMsg] = useState<{ success: boolean; msg: string } | null>(null);

  const [copiedText, setCopiedText] = useState(false);

  // Fee calculation for current Send form
  const feeBreakdown = useMemo(() => {
    return calculateRemittanceFee(remitAmountInput);
  }, [remitAmountInput]);

  // Selected Target Payout Transaction
  const targetPayoutTxn = useMemo(() => {
    return transactions.find(
      (t) => t.controlNo.trim().toUpperCase() === searchControlNo.trim().toUpperCase()
    );
  }, [transactions, searchControlNo]);

  // Clearing Ledger Matrix
  const clearingLedger = useMemo(() => {
    return computeInterBranchClearingLedger(transactions, AVAILABLE_BRANCHES);
  }, [transactions]);

  if (!isOpen) return null;

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sendingBranch = AVAILABLE_BRANCHES.find((b) => b.id === sendingBranchId);
    const receivingBranch = AVAILABLE_BRANCHES.find((b) => b.id === receivingBranchId);

    const newTxn = createRemittanceOrder({
      sendingBranchId,
      sendingBranchName: sendingBranch?.name.split(' (')[0] ?? 'Head Office',
      receivingBranchId,
      receivingBranchName: receivingBranch?.name.split(' (')[0] ?? 'Branch',
      senderMemberNo,
      senderName,
      senderPhone,
      receiverName,
      receiverPhone,
      receiverCitizenshipNo,
      remitAmount: remitAmountInput,
      securityPin: securityPinInput,
      sentTimestampBS: `2081/06/25 ${new Date().toLocaleTimeString('en-GB').slice(0, 5)}`,
    });

    setTransactions((prev) => [newTxn, ...prev]);
    setSearchControlNo(newTxn.controlNo);
    alert(
      `आन्तरिक विप्रेषण सफलतापूर्वक दर्ता भयो!\n\nControl No (MTCN): ${newTxn.controlNo}\nगोप्य PIN: ${securityPinInput}\nरकम: NPR ${newTxn.remitAmount.toLocaleString()}`
    );
    setActiveTab('RECORDS');
  };

  const handleDisburseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPayoutTxn) return;

    const res = verifyAndDisburseRemittance(
      targetPayoutTxn,
      payoutEnteredPin,
      payoutCitizenship,
      'TELLER-01',
      `2081/06/25 ${new Date().toLocaleTimeString('en-GB').slice(0, 5)}`
    );

    if (!res.success || !res.updatedTransaction) {
      setPayoutResultMsg({ success: false, msg: res.error || 'भुक्तानी असफल भयो।' });
    } else {
      const updated = res.updatedTransaction;
      setTransactions((prev) =>
        prev.map((t) => (t.controlNo === updated.controlNo ? updated : t))
      );
      setPayoutResultMsg({
        success: true,
        msg: `रकम रु. ${updated.remitAmount.toLocaleString()} प्रापक श्री ${updated.receiverName} लाई सफलतापूर्वक भुक्तानी गरियो!`,
      });
      setPayoutEnteredPin('');
    }
  };

  const handleDownloadCsv = () => {
    const csv = exportRemittanceSettlementCsv(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `unako_remittance_settlement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <ArrowLeftRight className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('शाखा तथा सेवा केन्द्र आन्तरिक विप्रेषण गेटवे', 'Inter-Branch Domestic Remittance Gateway')}
                </h2>
                <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                  NRB Remit Guideline
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'सुरक्षित PIN आधारित आन्तरिक रेमिट्यान्स पठाउने, भुक्तानी गर्ने तथा शाखा स्तरिय नेट क्लियरिङ हिसाब मिलान',
                  'PIN-protected domestic remittance sending, payout disbursement, and multi-branch net clearing settlement'
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

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('SEND')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'SEND'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Send className="size-4" />
            <span>{t('१. रकम पठाउने (Send Remittance)', '1. Send Remittance')}</span>
          </button>

          <button
            onClick={() => setActiveTab('PAYOUT')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'PAYOUT'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="size-4" />
            <span>{t('२. रकम भुक्तानी (Payout Disbursement)', '2. Payout Disbursement')}</span>
          </button>

          <button
            onClick={() => setActiveTab('CLEARING')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'CLEARING'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building className="size-4" />
            <span>{t('३. अन्तर-शाखा क्लियरिङ लेजर', '3. Inter-Branch Clearing')}</span>
          </button>

          <button
            onClick={() => setActiveTab('RECORDS')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'RECORDS'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="size-4" />
            <span>{t('४. सम्पूर्ण कारोबार अभिलेख', '4. All Remit Records')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto grow space-y-6">
          {/* TAB 1: SEND REMITTANCE */}
          {activeTab === 'SEND' && (
            <form onSubmit={handleSendSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Sending & Receiving Branches */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('उत्पत्ति तथा भुक्तानी शाखा', 'Origin & Destination Service Centers')}
                  </h4>

                  <div>
                    <label className="text-xs text-slate-500 block mb-1">
                      {t('पठाउने शाखा (Originating Branch)', 'Sending Branch')}
                    </label>
                    <select
                      value={sendingBranchId}
                      onChange={(e) => setSendingBranchId(e.target.value)}
                      className="w-full text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    >
                      {AVAILABLE_BRANCHES.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block mb-1">
                      {t('भुक्तानी लिने शाखा (Receiving Branch)', 'Receiving Branch')}
                    </label>
                    <select
                      value={receivingBranchId}
                      onChange={(e) => setReceivingBranchId(e.target.value)}
                      className="w-full text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    >
                      {AVAILABLE_BRANCHES.map((b) => (
                        <option key={b.id} value={b.id} disabled={b.id === sendingBranchId}>
                          {b.name} {b.id === sendingBranchId ? `(${t('पठाउने शाखा नै हो', 'Same branch')})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Amount and Secret PIN */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('विप्रेषण रकम तथा गोप्य सुरक्षा PIN', 'Amount & Security PIN')}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        {t('विप्रेषण रकम (Remit Amount NPR)', 'Remit Amount (NPR)')}
                      </label>
                      <input
                        type="number"
                        min="500"
                        step="100"
                        value={remitAmountInput}
                        onChange={(e) => setRemitAmountInput(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-teal-600 dark:text-teal-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        {t('गोप्य PIN (Secret 4-digit PIN)', 'Secret 4-digit PIN')}
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={securityPinInput}
                        onChange={(e) => setSecurityPinInput(e.target.value)}
                        placeholder="e.g. 5588"
                        className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {t(
                      'यो गोप्य PIN केवल प्रापकलाई मात्र उपलब्ध गराइनेछ। रकम भुक्तानी लिँदा PIN प्रमाणित गर्नुपर्नेछ।',
                      'This secret PIN must be presented by the beneficiary upon cash payout.'
                    )}
                  </p>
                </div>
              </div>

              {/* Sender & Receiver Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Sender Details */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('पठाउने सदस्य विवरण (Sender Info)', 'Sender Details')}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        {t('सदस्य नं.', 'Member No')}
                      </label>
                      <input
                        type="text"
                        value={senderMemberNo}
                        onChange={(e) => setSenderMemberNo(e.target.value)}
                        className="w-full text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        {t('सम्पर्क फोन', 'Phone')}
                      </label>
                      <input
                        type="text"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="w-full text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block mb-1">
                      {t('पठाउनेको पूरा नाम', 'Sender Full Name')}
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full text-xs font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Receiver Details */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('पाउने व्यक्तिको विवरण (Receiver/Beneficiary Info)', 'Receiver Details')}
                  </h4>

                  <div>
                    <label className="text-xs text-slate-500 block mb-1">
                      {t('प्रापकको पूरा नाम (Beneficiary Name)', 'Receiver Full Name')}
                    </label>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full text-xs font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        {t('प्रापकको फोन नं.', 'Receiver Phone')}
                      </label>
                      <input
                        type="text"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        className="w-full text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        {t('नागरिकता नं. (Citizenship)', 'Citizenship No')}
                      </label>
                      <input
                        type="text"
                        value={receiverCitizenshipNo}
                        onChange={(e) => setReceiverCitizenshipNo(e.target.value)}
                        className="w-full text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Commission Sharing Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    {t('सेवा शुल्क (Service Fee)', 'Service Fee')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-teal-600 dark:text-teal-400 mt-1">
                    {fmtCurrency(feeBreakdown.fee, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('कुल संकलन: रु.', 'Total collected:')} {fmtCurrency(remitAmountInput + feeBreakdown.fee, false)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t('पठाउने शाखा कमिसन (40%)', 'Sending Commission')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-white mt-1">
                    {fmtCurrency(feeBreakdown.senderCommission, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('उत्पत्ति शाखा आम्दानी', 'Origin branch share')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t('भुक्तानी शाखा कमिसन (40%)', 'Paying Commission')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-white mt-1">
                    {fmtCurrency(feeBreakdown.receiverCommission, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('भुक्तानी शाखा आम्दानी', 'Disbursement share')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    {t('केन्द्रीय कोष (HO 20%)', 'Head Office Pool')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                    {fmtCurrency(feeBreakdown.headOfficeReserve, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('संस्थागत जगेडा कोष', 'Central pool share')}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md cursor-pointer"
                >
                  <Send className="size-4" />
                  <span>{t('विप्रेषण अर्डर जारी गर्नुहोस् (Issue Remittance)', 'Issue Remittance Order')}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PAYOUT DISBURSEMENT */}
          {activeTab === 'PAYOUT' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center gap-3">
                <Search className="size-5 text-slate-400 shrink-0" />
                <div className="grow">
                  <label className="text-xs text-slate-500 block mb-1">
                    {t('विप्रेषण कन्ट्रोल नं. (Control No / MTCN)', 'Enter Control No (MTCN)')}
                  </label>
                  <input
                    type="text"
                    value={searchControlNo}
                    onChange={(e) => setSearchControlNo(e.target.value.toUpperCase())}
                    placeholder="e.g. UNAKO-9X77K4"
                    className="w-full text-sm font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Feedback Alert */}
              {payoutResultMsg && (
                <div
                  className={`p-4 rounded-2xl border flex items-center gap-3 ${
                    payoutResultMsg.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  {payoutResultMsg.success ? (
                    <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="size-5 text-rose-600 shrink-0" />
                  )}
                  <span className="text-xs font-semibold">{payoutResultMsg.msg}</span>
                </div>
              )}

              {/* Target Order Found */}
              {targetPayoutTxn ? (
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                        {targetPayoutTxn.controlNo}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {t('भुक्तानी योग्य रकम: रु.', 'Payout Amount:')}{' '}
                        <span className="font-mono text-xl text-teal-600 dark:text-teal-400">
                          {targetPayoutTxn.remitAmount.toLocaleString()}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        {targetPayoutTxn.sendingBranchName} → {targetPayoutTxn.receivingBranchName}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        targetPayoutTxn.status === 'PAID_OUT'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {targetPayoutTxn.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        {t('पठाउने व्यक्ति (Sender)', 'Sender')}
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">{targetPayoutTxn.senderName}</p>
                      <p className="font-mono text-slate-500">Phone: {targetPayoutTxn.senderPhone}</p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        {t('प्रापक व्यक्ति (Receiver)', 'Receiver')}
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">{targetPayoutTxn.receiverName}</p>
                      <p className="font-mono text-slate-500">ना.प्र.नं: {targetPayoutTxn.receiverCitizenshipNo}</p>
                    </div>
                  </div>

                  {/* Disburse Form */}
                  {targetPayoutTxn.status === 'SEND_PENDING_PAYOUT' && (
                    <form
                      onSubmit={handleDisburseSubmit}
                      className="p-4 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/30 dark:bg-teal-950/20 space-y-4"
                    >
                      <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-2">
                        <KeyRound className="size-4" />
                        <span>{t('सुरक्षा PIN प्रमाणीकरण तथा भुक्तानी', 'Security PIN Verification & Cash Payout')}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-500 block mb-1">
                            {t('प्रापकले बताएको गोप्य PIN', 'Enter Secret PIN')}
                          </label>
                          <input
                            type="password"
                            value={payoutEnteredPin}
                            onChange={(e) => setPayoutEnteredPin(e.target.value)}
                            placeholder="e.g. 3344"
                            className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs text-slate-500 block mb-1">
                            {t('नागरिकता नं. रुजु', 'Verify Citizenship No')}
                          </label>
                          <input
                            type="text"
                            value={payoutCitizenship}
                            onChange={(e) => setPayoutCitizenship(e.target.value)}
                            className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer"
                        >
                          <CheckCircle2 className="size-4" />
                          <span>{t('नगद भुक्तानी फछ्र्यौट गर्नुहोस् (Disburse Cash)', 'Disburse Cash Payout')}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed rounded-2xl">
                  {t('कुनै विप्रेषण फेला परेन। माथि कन्ट्रोल नं. प्रविष्ट गरी खोज्नुहोस्।', 'No remittance found. Enter Control No above to search.')}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INTER-BRANCH CLEARING MATRIX */}
          {activeTab === 'CLEARING' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('अन्तर-शाखा बहुपक्षीय नेट क्लियरिङ हिसाब (Multilateral Clearing Ledger)', 'Multilateral Inter-Branch Clearing Matrix')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t(
                      'दैनिक विप्रेषण आदान-प्रदान अनुसार शाखाहरू बीच भुक्तानी दिनुपर्ने (Net Payable) वा लिनुपर्ने (Net Receivable) हिसाब',
                      'Daily net inter-branch cash settlement across service centers and earned revenue'
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-xs cursor-pointer"
                >
                  <Download className="size-4" />
                  <span>{t('CSV डाउनलोड (Export CSV)', 'Export CSV')}</span>
                </button>
              </div>

              {/* Clearing Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">{t('शाखा / सेवा केन्द्र (Branch)', 'Branch')}</th>
                      <th className="px-4 py-3 text-center">{t('पठाएको संख्या', 'Sent Count')}</th>
                      <th className="px-4 py-3 text-right">{t('पठाएको रकम (Sent NPR)', 'Sent Total')}</th>
                      <th className="px-4 py-3 text-center">{t('भुक्तानी संख्या', 'Paid Count')}</th>
                      <th className="px-4 py-3 text-right">{t('भुक्तानी रकम (Paid NPR)', 'Paid Total')}</th>
                      <th className="px-4 py-3 text-right">{t('खुद स्थिति (Net Balance)', 'Net Clearing')}</th>
                      <th className="px-4 py-3 text-right">{t('आर्जित कमिसन', 'Commission Earned')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {clearingLedger.map((row) => (
                      <tr key={row.branchId} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="px-4 py-3 font-sans font-bold text-slate-900 dark:text-white">
                          {row.branchName}
                        </td>
                        <td className="px-4 py-3 text-center">{fmtDigits(row.totalSentCount)}</td>
                        <td className="px-4 py-3 text-right text-slate-900 dark:text-white">
                          {fmtCurrency(row.totalSentAmount, false)}
                        </td>
                        <td className="px-4 py-3 text-center">{fmtDigits(row.totalPaidCount)}</td>
                        <td className="px-4 py-3 text-right text-slate-900 dark:text-white">
                          {fmtCurrency(row.totalPaidAmount, false)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {row.netBalance > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400">
                              +{fmtCurrency(row.netBalance, false)} (Payable)
                            </span>
                          ) : row.netBalance < 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {fmtCurrency(row.netBalance, false)} (Receivable)
                            </span>
                          ) : (
                            <span className="text-slate-400">रु ०.००</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-teal-600 dark:text-teal-400">
                          {fmtCurrency(row.earnedCommission, false)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ALL TRANSACTIONS */}
          {activeTab === 'RECORDS' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('आन्तरिक विप्रेषण कारोबार सूची', 'Domestic Remittance Transactions')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('कुल दर्ता भएका कारोबारहरू', 'All domestic remittances registered')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-xs cursor-pointer"
                >
                  <Download className="size-4" />
                  <span>{t('CSV डाउनलोड', 'Export CSV')}</span>
                </button>
              </div>

              {/* Transactions Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2.5">MTCN</th>
                        <th className="px-3 py-2.5">{t('पठाउने शाखा → गन्तव्य', 'Route')}</th>
                        <th className="px-3 py-2.5">{t('पठाउने व्यक्ति', 'Sender')}</th>
                        <th className="px-3 py-2.5">{t('पाउने व्यक्ति', 'Receiver')}</th>
                        <th className="px-3 py-2.5 text-right">{t('रकम (NPR)', 'Amount')}</th>
                        <th className="px-3 py-2.5 text-right">{t('शुल्क', 'Fee')}</th>
                        <th className="px-3 py-2.5 text-center">{t('स्थिति', 'Status')}</th>
                        <th className="px-3 py-2.5">{t('मिति (BS)', 'Date')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {transactions.map((tx) => (
                        <tr key={tx.controlNo} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="px-3 py-2.5 font-mono text-[11px] font-bold text-teal-600 dark:text-teal-400">
                            {tx.controlNo}
                          </td>
                          <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">
                            {tx.sendingBranchName} → {tx.receivingBranchName}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="font-bold text-slate-900 dark:text-white">{tx.senderName}</span>
                            <p className="text-[10px] text-slate-400 font-mono">{tx.senderPhone}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="font-bold text-slate-900 dark:text-white">{tx.receiverName}</span>
                            <p className="text-[10px] text-slate-400 font-mono">{tx.receiverCitizenshipNo}</p>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {fmtCurrency(tx.remitAmount, true)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-500">
                            {fmtCurrency(tx.serviceFee, false)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                tx.status === 'PAID_OUT'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500">
                            {tx.sentTimestampBS}
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
