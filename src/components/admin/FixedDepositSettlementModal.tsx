import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { SavingsAccount, Member } from '../../types';
import {
  FdSettlementType,
  FdRolloverMode,
  calculateFdSettlement,
  calculateFdAutoRenewal,
  generateFdDischargeVoucher,
  generateFdSettlementsCsv,
  FdDischargeVoucher,
} from '../../utils/fixedDepositSettlement';
import {
  X,
  Lock,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Receipt,
  Coins,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface FixedDepositSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  accounts: readonly SavingsAccount[];
  members: readonly Member[];
  preselectedAccountNo?: string;
  onConfirmSettlement?: (accountNo: string, amount: number, isRenewal: boolean) => void;
}

export const FixedDepositSettlementModal: React.FC<FixedDepositSettlementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accounts,
  members,
  preselectedAccountNo,
  onConfirmSettlement,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtPercent } = useLanguageStore();

  const fdAccounts = useMemo(() => {
    return accounts.filter((a) => a.accountType.includes('Fixed Deposit') || a.accountType.includes('मुद्दती'));
  }, [accounts]);

  const [selectedAccNo, setSelectedAccNo] = useState<string>(
    preselectedAccountNo || fdAccounts[0]?.accountNo || ''
  );
  const [activeTab, setActiveTab] = useState<'SETTLE' | 'RENEW' | 'VOUCHER'>('SETTLE');

  // Settle form state
  const [settlementType, setSettlementType] = useState<FdSettlementType>('MATURITY');
  const [actualDaysHeld, setActualDaysHeld] = useState<number>(365);
  const [penaltyRate, setPenaltyRate] = useState<number>(2.0);
  const [payoutDestination, setPayoutDestination] = useState<'REGULAR_SAVINGS' | 'CASH_COUNTER'>('REGULAR_SAVINGS');

  // Renewal form state
  const [rolloverMode, setRolloverMode] = useState<FdRolloverMode>('COMPOUND_PRINCIPAL_AND_NET_INTEREST');
  const [renewalYears, setRenewalYears] = useState<number>(1);
  const [renewalRate, setRenewalRate] = useState<number>(10.0);

  // Completed Voucher State
  const [completedVoucher, setCompletedVoucher] = useState<FdDischargeVoucher | null>(null);
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  // Selected account and owner
  const currentAccount = useMemo(() => {
    return fdAccounts.find((a) => a.accountNo === selectedAccNo) || fdAccounts[0];
  }, [fdAccounts, selectedAccNo]);

  const currentMember = useMemo(() => {
    if (!currentAccount) return undefined;
    return members.find((m) => m.id === currentAccount.memberId);
  }, [members, currentAccount]);

  // Settlement Calculation
  const settlementCalc = useMemo(() => {
    if (!currentAccount) return null;
    return calculateFdSettlement(
      currentAccount.balance,
      currentAccount.interestRate,
      12, // default 12m
      settlementType,
      actualDaysHeld,
      penaltyRate,
      5.0, // 5% TDS
      currentMember?.name ?? 'Cooperative Member',
      currentMember?.memberNo ?? 'UK-MEMBER',
      currentAccount.accountNo
    );
  }, [currentAccount, currentMember, settlementType, actualDaysHeld, penaltyRate]);

  // Renewal Calculation
  const renewalCalc = useMemo(() => {
    if (!currentAccount) return null;
    return calculateFdAutoRenewal(
      currentAccount,
      currentMember,
      rolloverMode,
      renewalYears,
      renewalRate,
      5.0
    );
  }, [currentAccount, currentMember, rolloverMode, renewalYears, renewalRate]);

  if (!isOpen || !currentAccount) return null;

  const handleExecuteSettlement = () => {
    if (!settlementCalc) return;
    const voucher = generateFdDischargeVoucher(
      settlementCalc,
      currentMember,
      currentAccount.accountType,
      payoutDestination
    );
    setCompletedVoucher(voucher);
    setActiveTab('VOUCHER');
    onConfirmSettlement?.(currentAccount.accountNo, settlementCalc.totalPayoutAmount, false);
    onSuccess(
      t(
        `मुद्दती खाता ${currentAccount.accountNo} फरफारक सम्पन्न। कुल भुक्तानी: रु. ${settlementCalc.totalPayoutAmount.toLocaleString()}`,
        `Fixed deposit account ${currentAccount.accountNo} settled. Total payout: NPR ${settlementCalc.totalPayoutAmount.toLocaleString()}`
      )
    );
  };

  const handleExecuteRenewal = () => {
    if (!renewalCalc || !settlementCalc) return;
    const voucher = generateFdDischargeVoucher(
      settlementCalc,
      currentMember,
      `${currentAccount.accountType} (नविकरण)`,
      'REGULAR_SAVINGS'
    );
    setCompletedVoucher(voucher);
    setActiveTab('VOUCHER');
    onConfirmSettlement?.(currentAccount.accountNo, renewalCalc.newPrincipalAmount, true);
    onSuccess(
      t(
        `मुद्दती खाता नविकरण सम्पन्न! नयाँ साँवा: रु. ${renewalCalc.newPrincipalAmount.toLocaleString()}, नयाँ परिपक्वता: ${renewalCalc.newMaturityDateNepali}`,
        `FD renewed successfully! New principal: NPR ${renewalCalc.newPrincipalAmount.toLocaleString()}, maturity: ${renewalCalc.newMaturityDateNepali}`
      )
    );
  };

  const handlePrintVoucher = () => {
    if (!completedVoucher) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>मुद्दती बचत फरफारक भरपाई तथा कर कट्टी प्रमाणपत्र</title>
        <style>
          body { font-family: 'Mukti', 'Kalimati', 'Arial', sans-serif; padding: 25px; line-height: 1.5; color: #111; }
          .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 10px; margin-bottom: 16px; }
          .inst-name { font-size: 19px; font-weight: bold; margin: 0; }
          .inst-sub { font-size: 12px; margin: 2px 0; }
          .voucher-title { font-size: 14px; font-weight: bold; text-align: center; margin: 12px 0; text-decoration: underline; }
          .meta-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 12px; }
          .info-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
          .info-table th, .info-table td { border: 1px solid #444; padding: 6px 10px; text-align: left; }
          .info-table th { background: #f2f2f2; }
          .num { font-family: monospace; font-weight: bold; text-align: right; }
          .signature-section { display: flex; justify-content: space-between; margin-top: 45px; font-size: 12px; }
          .sig-box { text-align: center; width: 180px; border-top: 1px dashed #444; padding-top: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <p class="inst-name">उनको बचत तथा ऋण सहकारी संस्था लि.</p>
          <p class="inst-sub">गढवा गाउँपालिका वडा नं. ५, दाङ, लुम्बिनी प्रदेश</p>
          <p class="inst-sub">दर्ता नं: २८३/०६५/०६६ | पान नं: ३०२९५८४८१</p>
        </div>
        <div class="meta-row">
          <span>भौचर नं: <b>${completedVoucher.voucherNo}</b></span>
          <span>कर प्रमाणपत्र नं: <b>${completedVoucher.certificateNo}</b></span>
          <span>मिति: <b>${completedVoucher.issueDateNepali}</b></span>
        </div>
        <div class="voucher-title">मुद्दती बचत परिपक्वता / पूर्व भुक्तानी फरफारक भरपाई तथा कर कट्टी विवरण</div>
        
        <table class="info-table">
          <tr><th colspan="2">१. खातावाला सदस्य विवरण</th></tr>
          <tr><td width="35%">सदस्यको नाम / थर:</td><td><b>${completedVoucher.memberName}</b> (सदस्य नं: ${completedVoucher.memberNo})</td></tr>
          <tr><td>नागरिकता नं. / पान नं:</td><td>${completedVoucher.citizenshipNo} ${completedVoucher.panNumber ? `(PAN: ${completedVoucher.panNumber})` : ''}</td></tr>
          <tr><td>मुद्दती खाता नं. / योजना:</td><td>${completedVoucher.accountNo} (${completedVoucher.schemeName})</td></tr>
          <tr><td>भुक्तानी गन्तव्य:</td><td>${completedVoucher.payoutDestination === 'REGULAR_SAVINGS' ? 'साधारण बचत खातामा जम्मा' : 'नगद काउन्टर भुक्तानी'}</td></tr>

          <tr><th colspan="2">२. हिसाब किताब तथा कर कट्टी विवरण (आयकर ऐन २०५८ दफा ८८)</th></tr>
          <tr><td>जम्मा मूल साँवा रकम:</td><td class="num">रु. ${completedVoucher.principalAmount.toLocaleString()}</td></tr>
          <tr><td>पाकेको कुल ब्याज:</td><td class="num">रु. ${completedVoucher.grossInterest.toLocaleString()}</td></tr>
          <tr><td>समयपूर्व फिर्ता जरिवाना (Penalty):</td><td class="num">रु. ${completedVoucher.penaltyDeduction.toLocaleString()}</td></tr>
          <tr><td>करयोग्य खुद ब्याज:</td><td class="num">रु. ${completedVoucher.netTaxableInterest.toLocaleString()}</td></tr>
          <tr><td><b>५% अग्रिम आयकर कट्टी (5% Statutory TDS):</b></td><td class="num" style="color: #b91c1c;">रु. ${completedVoucher.statutoryTds5Percent.toLocaleString()}</td></tr>
          <tr><td>भुक्तानी हुने खुद ब्याज:</td><td class="num">रु. ${completedVoucher.netInterestPayable.toLocaleString()}</td></tr>
          <tr style="background:#f8f9fa;"><td><b>कुल भुक्तानी / फरफारक रकम (साँवा + खुद ब्याज):</b></td><td class="num" style="font-size: 14px;"><b>रु. ${completedVoucher.totalDischargedAmount.toLocaleString()}</b></td></tr>
        </table>

        <p style="font-size: 11px; margin-top: 12px; color: #444;">
          कैफियत: ${completedVoucher.remarks}। माथि उल्लेखित रकम पूर्ण रुपमा बुझिलिएँ/जम्मा भयो।
        </p>

        <div class="signature-section">
          <div class="sig-box">खातावाला सदस्यको दस्तखत</div>
          <div class="sig-box">तयार गर्ने (क्यासियर)</div>
          <div class="sig-box">जाँच तथा स्वीकृत गर्ने (प्रबन्धक)</div>
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

  const handleCopyVoucher = () => {
    if (!completedVoucher) return;
    const text = `उनको बचत तथा ऋण सहकारी संस्था लि. - मुद्दती बचत फरफारक भौचर\nभौचर नं: ${completedVoucher.voucherNo}\nसदस्य: ${completedVoucher.memberName} (${completedVoucher.memberNo})\nखाता नं: ${completedVoucher.accountNo}\nमूल साँवा: रु. ${completedVoucher.principalAmount.toLocaleString()}\nखुद ब्याज: रु. ${completedVoucher.netInterestPayable.toLocaleString()}\n५% TDS कर: रु. ${completedVoucher.statutoryTds5Percent.toLocaleString()}\nकुल भुक्तानी रकम: रु. ${completedVoucher.totalDischargedAmount.toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Lock className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {t('मुद्दती बचत परिपक्वता तथा पूर्व भुक्तानी फर्छ्यौट', 'Fixed Deposit Settlement & Renewal')}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {t('५% TDS सहित', '5% TDS')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t(
                  'आयकर ऐन २०५८ दफा ८८ अनुसार ५% कर कट्टी, समयपूर्व भुक्तानी जरिवाना तथा मुद्दती नविकरण इन्जिन',
                  'Maturity settlement with 5% TDS withholding, pre-break penalty, and auto-renewal rollover.'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Account Selector Bar */}
        <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">{t('मुद्दती खाता छनोट:', 'Target FD A/C:')}</span>
            <select
              value={selectedAccNo}
              onChange={(e) => {
                setSelectedAccNo(e.target.value);
                setCompletedVoucher(null);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {fdAccounts.map((acc) => {
                const mem = members.find((m) => m.id === acc.memberId);
                return (
                  <option key={acc.id} value={acc.accountNo}>
                    {acc.accountNo} - {mem?.name ?? 'Member'} ({fmtCurrency(acc.balance, true)}) [{fmtPercent(acc.interestRate)}]
                  </option>
                );
              })}
            </select>
          </div>

          {currentMember && (
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span>{t('सदस्य:', 'Member:')} <b className="text-slate-900 dark:text-white">{currentMember.name}</b></span>
              <span>{t('साँवा:', 'Principal:')} <b className="text-emerald-600 dark:text-emerald-400">{fmtCurrency(currentAccount.balance, true)}</b></span>
              <span>{t('दर:', 'Rate:')} <b className="text-slate-900 dark:text-white">{fmtPercent(currentAccount.interestRate)}</b></span>
            </div>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 gap-2 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('SETTLE')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'SETTLE'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Coins className="size-4" />
            <span>{t('परिपक्वता / पूर्व भुक्तानी फर्छ्यौट', 'Maturity / Liquidation')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RENEW')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'RENEW'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <RotateCcw className="size-4" />
            <span>{t('मुद्दती नविकरण (Auto-Renewal)', 'Auto-Renewal Rollover')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('VOUCHER')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'VOUCHER'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Receipt className="size-4" />
            <span>{t('फरफारक भरपाई तथा कर कट्टी रसिद', 'Discharge Voucher & TDS')}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Settle & Liquidate */}
          {activeTab === 'SETTLE' && settlementCalc && (
            <div className="space-y-6">
              {/* Type selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSettlementType('MATURITY')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    settlementType === 'MATURITY'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('नियमित परिपक्वता फर्छ्यौट', 'Full Maturity Settlement')}
                    </span>
                    <CheckCircle2 className={`size-4 ${settlementType === 'MATURITY' ? 'text-emerald-500' : 'text-slate-300'}`} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {t('सम्झौता अनुसार पूरा अवधि व्यतित भई पूरा ब्याज पाउने।', 'Normal completion of deposit contract with full contracted rate.')}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSettlementType('PREMATURE_BREAK')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    settlementType === 'PREMATURE_BREAK'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('समयपूर्व भुक्तानी (Premature Liquidation)', 'Premature Break / Liquidation')}
                    </span>
                    <AlertTriangle className={`size-4 ${settlementType === 'PREMATURE_BREAK' ? 'text-amber-500' : 'text-slate-300'}`} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {t('म्याद पुग्नु अगावै सदस्यको अनुरोधमा २% जरिवाना कट्टी गरी भुक्तानी।', 'Pre-encashment subject to 2% penalty markdown on interest.')}
                  </p>
                </button>
              </div>

              {/* Premature Adjustment Controls */}
              {settlementType === 'PREMATURE_BREAK' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('वास्तविक जम्मा दिन (Days Held):', 'Actual Days Held:')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1825"
                      value={actualDaysHeld}
                      onChange={(e) => setActualDaysHeld(Math.max(1, parseInt(e.target.value || '1', 10)))}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('पूर्व भुक्तानी कटौती जरिवाना दर (%):', 'Penalty Markdown Rate (%):')}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="5"
                      value={penaltyRate}
                      onChange={(e) => setPenaltyRate(Math.max(0, parseFloat(e.target.value || '0')))}
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Live Calculation Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('मूल साँवा रकम', 'Principal')}</span>
                  <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-1">
                    {fmtCurrency(settlementCalc.principalAmount, true)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('पाकेको ब्याज', 'Gross Interest')}</span>
                  <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {fmtCurrency(settlementCalc.grossInterest, true)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
                  <span className="text-[10px] font-bold text-rose-500 uppercase">{t('५% TDS कर कट्टी', '5% TDS')}</span>
                  <div className="text-base font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
                    - {fmtCurrency(settlementCalc.tdsAmount, true)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">{t('कुल भुक्तानी', 'Total Payout')}</span>
                  <div className="text-base font-black font-mono text-emerald-700 dark:text-emerald-300 mt-1">
                    {fmtCurrency(settlementCalc.totalPayoutAmount, true)}
                  </div>
                </div>
              </div>

              {/* Destination selector & confirmation */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('रकम भुक्तानी विधि:', 'Payout Destination:')}
                  </label>
                  <select
                    value={payoutDestination}
                    onChange={(e) => setPayoutDestination(e.target.value as 'REGULAR_SAVINGS' | 'CASH_COUNTER')}
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="REGULAR_SAVINGS">{t('सदस्यको साधारण बचत खातामा जम्मा (Regular Savings)', 'Credit Member Regular Savings A/C')}</option>
                    <option value="CASH_COUNTER">{t('काउन्टरबाट नगदै भुक्तानी (Cash Counter)', 'Cash Counter Payout')}</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteSettlement}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md self-end sm:self-center"
                >
                  <Coins className="size-4" />
                  <span>{t('मुद्दती फर्छ्यौट सम्पन्न गर्नुहोस्', 'Execute FD Settlement')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Auto-Renewal */}
          {activeTab === 'RENEW' && renewalCalc && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRolloverMode('COMPOUND_PRINCIPAL_AND_NET_INTEREST')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    rolloverMode === 'COMPOUND_PRINCIPAL_AND_NET_INTEREST'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('चक्रवृद्धि नविकरण (साँवा + खुद ब्याज दुवै थप)', 'Compound Rollover (Principal + Net Interest)')}
                    </span>
                    <CheckCircle2 className={`size-4 ${rolloverMode === 'COMPOUND_PRINCIPAL_AND_NET_INTEREST' ? 'text-emerald-500' : 'text-slate-300'}`} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {t('अघिल्लो अवधिको खुद ब्याज समेत साँवामा थप गरी नयाँ मुद्दती खाता खोल्ने।', 'Reinvest both principal and net after-tax interest for maximum yield.')}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRolloverMode('PRINCIPAL_ONLY')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    rolloverMode === 'PRINCIPAL_ONLY'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('साँवा मात्र नविकरण (ब्याज बचत खातामा)', 'Principal Only (Interest to Savings)')}
                    </span>
                    <RotateCcw className={`size-4 ${rolloverMode === 'PRINCIPAL_ONLY' ? 'text-emerald-500' : 'text-slate-300'}`} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {t('साँवा मात्र अर्को अवधिका लागि नवीकरण गर्ने र खुद ब्याज बचत खातामा भुक्तानी।', 'Roll over original principal; pay net interest into savings account.')}
                  </p>
                </button>
              </div>

              {/* Tenure Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('नयाँ मुद्दती अवधि (Tenure):', 'New Deposit Tenure:')}
                  </label>
                  <select
                    value={renewalYears}
                    onChange={(e) => {
                      const yrs = parseInt(e.target.value, 10);
                      setRenewalYears(yrs);
                      setRenewalRate(yrs === 1 ? 10.0 : yrs === 2 ? 10.75 : yrs === 3 ? 11.25 : 12.0);
                    }}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value={1}>{t('१ वर्ष मुद्दती (1 Year - 10.0%)', '1 Year (10.0%)')}</option>
                    <option value={2}>{t('२ वर्ष मुद्दती (2 Years - 10.75%)', '2 Years (10.75%)')}</option>
                    <option value={3}>{t('३ वर्ष मुद्दती (3 Years - 11.25%)', '3 Years (11.25%)')}</option>
                    <option value={5}>{t('५ वर्ष मुद्दती (5 Years - 12.0%)', '5 Years (12.0%)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('नयाँ लागू हुने ब्याजदर (% p.a.):', 'Applied Interest Rate (%):')}
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={renewalRate}
                    onChange={(e) => setRenewalRate(parseFloat(e.target.value || '10'))}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Renewal Projected Summary */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/50 pb-2">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                    {t('नविकरण पश्चातको प्रक्षेपित विवरण', 'Projected Renewal Details')}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-600">
                    {renewalCalc.newAccountNo}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">{t('नयाँ मुद्दती साँवा:', 'New Principal:')}</span>
                    <p className="font-black text-slate-900 dark:text-white font-mono text-sm mt-0.5">
                      {fmtCurrency(renewalCalc.newPrincipalAmount, true)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">{t('बचत खातामा जाने ब्याज:', 'Interest to Savings:')}</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm mt-0.5">
                      {fmtCurrency(renewalCalc.interestPayoutToSavings, true)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">{t('नयाँ परिपक्व मिति:', 'New Maturity:')}</span>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm mt-0.5">
                      {fmtDigits(renewalCalc.newMaturityDateNepali)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleExecuteRenewal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <RotateCcw className="size-4" />
                    <span>{t('नविकरण सम्पन्न गर्नुहोस् (Confirm Renewal)', 'Confirm Renewal')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Voucher / Receipt */}
          {activeTab === 'VOUCHER' && (
            <div className="space-y-4">
              {completedVoucher ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      {t('आधिकारिक फरफारक भरपाई तथा कर कट्टी विवरण (TDS Certificate)', 'Official Discharge Voucher & TDS Slip')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyVoucher}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                      >
                        {copiedVoucher ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                        <span>{copiedVoucher ? t('कपी भयो!', 'Copied!') : t('प्रतिलिपि (Copy)', 'Copy')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintVoucher}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <Printer className="size-3.5" />
                        <span>{t('भरपाई छाप्नुहोस् (Print Voucher)', 'Print Voucher')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Printable View Card */}
                  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-serif space-y-4 shadow-sm">
                    <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">उनको बचत तथा ऋण सहकारी संस्था लि.</h3>
                      <p className="text-xs text-slate-500">गढवा गाउँपालिका वडा नं. ५, दाङ | फोन: ०८२-४०१०५०</p>
                      <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-2 underline">
                        मुद्दती बचत परिपक्वता / पूर्व भुक्तानी फरफारक भरपाई तथा कर कट्टी विवरण
                      </h4>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>भौचर नं: {completedVoucher.voucherNo}</span>
                      <span>कर कट्टी दर्ता: {completedVoucher.certificateNo}</span>
                      <span>मिति: {completedVoucher.issueDateNepali}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <div>सदस्यको नाम: <b>{completedVoucher.memberName}</b> ({completedVoucher.memberNo})</div>
                      <div>नागरिकता नं: <b>{completedVoucher.citizenshipNo}</b></div>
                      <div>मुद्दती खाता नं: <b>{completedVoucher.accountNo}</b></div>
                      <div>भुक्तानी माध्यम: <b>{completedVoucher.payoutDestination === 'REGULAR_SAVINGS' ? 'बचत खाता' : 'नगद'}</b></div>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                          <tr><td className="px-3 py-2 text-slate-500 font-sans">मूल साँवा रकम</td><td className="px-3 py-2 text-right font-bold">{fmtCurrency(completedVoucher.principalAmount, true)}</td></tr>
                          <tr><td className="px-3 py-2 text-slate-500 font-sans">पाकेको कुल ब्याज</td><td className="px-3 py-2 text-right font-bold text-emerald-600">{fmtCurrency(completedVoucher.grossInterest, true)}</td></tr>
                          {completedVoucher.penaltyDeduction > 0 && (
                            <tr><td className="px-3 py-2 text-slate-500 font-sans">समयपूर्व फिर्ता जरिवाना</td><td className="px-3 py-2 text-right font-bold text-amber-600">- {fmtCurrency(completedVoucher.penaltyDeduction, true)}</td></tr>
                          )}
                          <tr><td className="px-3 py-2 text-slate-500 font-sans">५% अग्रिम कर कट्टी (TDS)</td><td className="px-3 py-2 text-right font-bold text-rose-600">- {fmtCurrency(completedVoucher.statutoryTds5Percent, true)}</td></tr>
                          <tr><td className="px-3 py-2 text-slate-500 font-sans">भुक्तानी हुने खुद ब्याज</td><td className="px-3 py-2 text-right font-bold text-emerald-600">{fmtCurrency(completedVoucher.netInterestPayable, true)}</td></tr>
                          <tr className="bg-emerald-50/50 dark:bg-emerald-950/20 font-bold"><td className="px-3 py-2.5 font-sans text-slate-900 dark:text-white">कुल भुक्तानी रकम (साँवा + खुद ब्याज)</td><td className="px-3 py-2.5 text-right text-emerald-700 dark:text-emerald-300 text-sm">{fmtCurrency(completedVoucher.totalDischargedAmount, true)}</td></tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-[11px] text-slate-400 font-sans">
                      {completedVoucher.remarks}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Receipt className="size-10 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs">
                    {t(
                      'कुनै भौचर तयार भएको छैन। कृपया "परिपक्वता / पूर्व भुक्तानी फर्छ्यौट" वा "मुद्दती नविकरण" ट्याबबाट प्रक्रिया पूरा गर्नुहोस्।',
                      'No voucher generated yet. Please complete a settlement or renewal first.'
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <span className="text-xs text-slate-400 font-medium">
            {t('आयकर ऐन २०५८ दफा ८८ कानूनी मापदण्ड', 'Nepal Income Tax Act 2058 Sec 88 Compliant')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs"
          >
            {t('बन्द गर्नुहोस् (Close)', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
