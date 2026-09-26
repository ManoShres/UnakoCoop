import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Member, Loan, SavingsAccount } from '../../types';
import {
  MembershipExitReason,
  verifyMembershipClearance,
  calculateMembershipExitSettlement,
  generateMembershipExitCertificate,
  generateMembershipExitCsv,
  MembershipExitCertificate,
} from '../../utils/membershipExit';
import {
  X,
  UserMinus,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Coins,
  ArrowRight,
  Scale,
  Receipt,
  UserCheck,
} from 'lucide-react';

interface MembershipExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  members: readonly Member[];
  loans: readonly Loan[];
  savings: readonly SavingsAccount[];
  preselectedMemberId?: string;
  onConfirmExit?: (memberId: string, netPaid: number) => void;
}

export const MembershipExitModal: React.FC<MembershipExitModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  members,
  loans,
  savings,
  preselectedMemberId,
  onConfirmExit,
}) => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    preselectedMemberId || members[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'CLEARANCE' | 'SETTLEMENT' | 'CERTIFICATE'>('CLEARANCE');

  // Form states
  const [exitReason, setExitReason] = useState<MembershipExitReason>('VOLUNTARY_RESIGNATION');
  const [payoutMethod, setPayoutMethod] = useState<'CASH_COUNTER' | 'ACCOUNT_TRANSFER' | 'CHEQUE'>('CASH_COUNTER');
  const [adminFee, setAdminFee] = useState<number>(200);
  const [nomineeName, setNomineeName] = useState<string>('');

  // Completed Certificate state
  const [completedCertificate, setCompletedCertificate] = useState<MembershipExitCertificate | null>(null);
  const [copiedCertificate, setCopiedCertificate] = useState(false);

  // Selected member
  const currentMember = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId) || members[0];
  }, [members, selectedMemberId]);

  // Clearance Check
  const clearanceCheck = useMemo(() => {
    if (!currentMember) return null;
    return verifyMembershipClearance(currentMember, loans, savings);
  }, [currentMember, loans, savings]);

  // Settlement Calculation
  const settlementCalc = useMemo(() => {
    if (!currentMember) return null;
    return calculateMembershipExitSettlement(currentMember, savings, adminFee);
  }, [currentMember, savings, adminFee]);

  if (!isOpen || !currentMember || !clearanceCheck || !settlementCalc) return null;

  const handleExecuteExit = () => {
    const cert = generateMembershipExitCertificate(
      currentMember,
      clearanceCheck,
      settlementCalc,
      exitReason,
      payoutMethod,
      nomineeName.trim() || undefined
    );

    setCompletedCertificate(cert);
    setActiveTab('CERTIFICATE');
    onConfirmExit?.(currentMember.id, settlementCalc.netPayableAmount);
    onSuccess(
      t(
        `सदस्य ${currentMember.name} (सदस्य नं. ${currentMember.memberNo}) को हिसाब फरफारक सम्पन्न। कुल भुक्तानी: रु. ${settlementCalc.netPayableAmount.toLocaleString()}`,
        `Membership exit completed for ${currentMember.name} (${currentMember.memberNo}). Total settlement payout: NPR ${settlementCalc.netPayableAmount.toLocaleString()}`
      )
    );
  };

  const handlePrintCertificate = () => {
    if (!completedCertificate) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>सहकारी सदस्यता त्याग तथा अन्तिम हिसाब फरफारक प्रमाणपत्र</title>
        <style>
          body { font-family: 'Mukti', 'Kalimati', 'Arial', sans-serif; padding: 25px; line-height: 1.5; color: #111; }
          .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 10px; margin-bottom: 16px; }
          .inst-name { font-size: 19px; font-weight: bold; margin: 0; }
          .inst-sub { font-size: 12px; margin: 2px 0; }
          .title { font-size: 14px; font-weight: bold; text-align: center; margin: 12px 0; text-decoration: underline; }
          .meta-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 12px; }
          .declaration { font-size: 12px; text-align: justify; margin-bottom: 14px; line-height: 1.6; }
          .table-box { width: 100%; border-collapse: collapse; font-size: 11px; margin: 10px 0; }
          .table-box th, .table-box td { border: 1px solid #444; padding: 5px 8px; text-align: left; }
          .table-box th { background: #f2f2f2; }
          .num { font-family: monospace; font-weight: bold; text-align: right; }
          .clearance-grid { display: flex; justify-content: space-between; margin-top: 25px; font-size: 11px; text-align: center; }
          .box { width: 22%; border-top: 1px dashed #444; padding-top: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <p class="inst-name">उनको बचत तथा ऋण सहकारी संस्था लि.</p>
          <p class="inst-sub">गढवा गाउँपालिका वडा नं. ५, दाङ, लुम्बिनी प्रदेश</p>
          <p class="inst-sub">दर्ता नं: २८३/०६५/०६६ | पान नं: ३०२९५८४८१</p>
        </div>
        <div class="meta-row">
          <span>प्रमाणपत्र नं: <b>${completedCertificate.certificateNo}</b></span>
          <span>भौचर नं: <b>${completedCertificate.voucherNo}</b></span>
          <span>फर्छ्यौट मिति: <b>${completedCertificate.issueDateNepali}</b></span>
        </div>
        <div class="title">सहकारी सदस्यता त्याग तथा अन्तिम हिसाब फरफारक प्रमाणपत्र</div>
        
        <p class="declaration">
          ${completedCertificate.declarationText}
        </p>

        <table class="table-box">
          <tr><th colspan="2">१. खातावाला तथा सदस्यता विवरण</th></tr>
          <tr><td width="35%">सदस्यको नाम / थर:</td><td><b>${completedCertificate.memberName}</b> (सदस्य नं: ${completedCertificate.memberNo})</td></tr>
          <tr><td>नागरिकता नं. / ठेगाना:</td><td>${completedCertificate.citizenshipNo} | ${completedCertificate.address}</td></tr>
          <tr><td>सदस्यता ग्रहण मिति:</td><td>${completedCertificate.joinedDateNepali}</td></tr>
          <tr><td>सदस्यता त्यागको कारण:</td><td>${completedCertificate.exitReason} ${completedCertificate.nomineeOrHeirName ? `(हकवाला: ${completedCertificate.nomineeOrHeirName})` : ''}</td></tr>
          <tr><td>भुक्तानी माध्यम:</td><td>${completedCertificate.payoutMethod}</td></tr>

          <tr><th colspan="2">२. अन्तिम हिसाब फर्छ्यौट विवरण (सहकारी ऐन २०७४ दफा ३२)</th></tr>
          <tr><td>फिर्ता हुने सेयर पूँजी रकम:</td><td class="num">रु. ${completedCertificate.settlement.shareCapitalRefund.toLocaleString()}</td></tr>
          <tr><td>साधारण तथा अनिवार्य बचत फिर्ता:</td><td class="num">रु. ${(completedCertificate.settlement.regularSavingsRefund + completedCertificate.settlement.compulsorySavingsRefund + completedCertificate.settlement.fixedDepositRefund).toLocaleString()}</td></tr>
          <tr><td>पाकेको खुद ब्याज (५% आयकर कट्टी पश्चात):</td><td class="num">रु. ${completedCertificate.settlement.netAccruedInterest.toLocaleString()}</td></tr>
          <tr><td>अवितरित लाभांश तथा बोनस रकम:</td><td class="num">रु. ${completedCertificate.settlement.unpaidDividendsAndPatronage.toLocaleString()}</td></tr>
          <tr><td>सदस्यता खारेजी प्रशासनिक शुल्क (कट्टी):</td><td class="num" style="color:#b91c1c;">- रु. ${completedCertificate.settlement.membershipExitAdminFee.toLocaleString()}</td></tr>
          <tr style="background:#f8f9fa;"><td><b>कुल खुद भुक्तानी रकम (Net Paid):</b></td><td class="num" style="font-size: 13px;"><b>रु. ${completedCertificate.settlement.netPayableAmount.toLocaleString()}</b></td></tr>
        </table>

        <div class="clearance-grid">
          <div class="box">सदस्य / हकवालाको दस्तखत</div>
          <div class="box">ऋण उपसमिति (दायित्व मुक्ति)</div>
          <div class="box">लेखा सुपरीवेक्षण समिति</div>
          <div class="box">संस्था प्रबन्धक</div>
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

  const handleCopyCertificate = () => {
    if (!completedCertificate) return;
    const text = `उनको बचत तथा ऋण सहकारी संस्था लि. - सदस्यता फरफारक प्रमाणपत्र\nप्रमाणपत्र नं: ${completedCertificate.certificateNo}\nसदस्य: ${completedCertificate.memberName} (${completedCertificate.memberNo})\nसेयर पूँजी फिर्ता: रु. ${completedCertificate.settlement.shareCapitalRefund.toLocaleString()}\nबचत मौज्दात फिर्ता: रु. ${(completedCertificate.settlement.regularSavingsRefund + completedCertificate.settlement.compulsorySavingsRefund).toLocaleString()}\nखुद भुक्तानी रकम: रु. ${completedCertificate.settlement.netPayableAmount.toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopiedCertificate(true);
    setTimeout(() => setCopiedCertificate(false), 2500);
  };

  const handleDownloadCsv = () => {
    if (!completedCertificate) return;
    const csv = generateMembershipExitCsv([completedCertificate]);
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Unako_Membership_Exit_${completedCertificate.memberNo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <UserMinus className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {t('सदस्यता त्याग तथा अन्तिम हिसाब फरफारक', 'Membership Exit & Clearance Workbench')}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {t('सहकारी ऐन दफा ३१, ३२', 'Sec 31/32')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t(
                  'कर्जा दायित्व, जमानी जाँच, सेयर पूँजी फिर्ता, ५% TDS सहित बचत हिसाब र अन्तिम फरफारक प्रमाणपत्र',
                  'Statutory 3-tier liability clearance, share/savings refund with 5% TDS, and official exit certificate.'
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

        {/* Member Selector Bar */}
        <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">{t('सदस्य छनोट:', 'Target Member:')}</span>
            <select
              value={selectedMemberId}
              onChange={(e) => {
                setSelectedMemberId(e.target.value);
                setCompletedCertificate(null);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.memberNo} - {m.name} ({fmtCurrency(m.totalSavings, true)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>{t('सेयर पूँजी:', 'Shares:')} <b className="text-slate-900 dark:text-white">{fmtCurrency(currentMember.shareCapital, true)}</b></span>
            <span>{t('कुल बचत:', 'Savings:')} <b className="text-emerald-600 dark:text-emerald-400">{fmtCurrency(currentMember.totalSavings, true)}</b></span>
            <span>{t('कर्जा दायित्व:', 'Loan Due:')} <b className={clearanceCheck.activeLoanBalance > 0 ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>{fmtCurrency(clearanceCheck.activeLoanBalance, true)}</b></span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 gap-2 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('CLEARANCE')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'CLEARANCE'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="size-4" />
            <span>{t('१. दायित्व तथा फरफारक जाँच', '1. Liability Clearance Gate')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SETTLEMENT')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'SETTLEMENT'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Coins className="size-4" />
            <span>{t('२. अन्तिम हिसाब फर्छ्यौट', '2. Final Settlement')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CERTIFICATE')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'CERTIFICATE'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <FileCheck className="size-4" />
            <span>{t('३. फरफारक प्रमाणपत्र', '3. Exit Certificate')}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Clearance Gates */}
          {activeTab === 'CLEARANCE' && (
            <div className="space-y-6">
              {/* Overall status banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  clearanceCheck.canExit
                    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                    : 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30'
                }`}
              >
                {clearanceCheck.canExit ? (
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="size-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1">
                  <h4 className={`font-bold ${clearanceCheck.canExit ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'}`}>
                    {clearanceCheck.canExit
                      ? t('सदस्यता त्याग तथा फरफारक योग्य (Clearance Approved)', 'Eligible for Membership Exit & Settlement')
                      : t('सदस्यता त्याग रोकिएको छ (Clearance Blocked)', 'Clearance Blocked by Outstanding Liabilities')}
                  </h4>
                  <p className={clearanceCheck.canExit ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>
                    {clearanceCheck.canExit
                      ? t('संस्थामा कुनै प्रत्यक्ष कर्जा बाँकी नरहेको र भाखा नाघेको कर्जाको जमानीकर्ता नरहेको प्रमाणित भयो।', 'Zero outstanding loans and clean guarantor status confirmed under Section 31/32.')
                      : clearanceCheck.blockingReasons.join(' ')}
                  </p>
                </div>
              </div>

              {/* 3-tier Gate Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Gate 1: Direct Loan */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('१. प्रत्यक्ष कर्जा दायित्व', '1. Direct Loan Debt')}
                    </span>
                    {clearanceCheck.activeLoanBalance === 0 ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="size-4 text-rose-500" />
                    )}
                  </div>
                  <div className={`text-lg font-black font-mono ${clearanceCheck.activeLoanBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {fmtCurrency(clearanceCheck.activeLoanBalance, true)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {clearanceCheck.activeLoanBalance === 0
                      ? t('कुनै कर्जा बाँकी नरहेको', 'Zero loan liability')
                      : `${fmtDigits(clearanceCheck.activeLoanCount)} ${t('वटा सक्रिय कर्जा', 'active loans')}`}
                  </p>
                </div>

                {/* Gate 2: Guarantor */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('२. जमानी दायित्व', '2. Guarantor Exposure')}
                    </span>
                    {clearanceCheck.blockingReasons.some((r) => r.includes('जमानी')) ? (
                      <AlertTriangle className="size-4 text-rose-500" />
                    ) : (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {fmtCurrency(clearanceCheck.guaranteedLoansBalance, true)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {clearanceCheck.guaranteedLoansCount === 0
                      ? t('कुनै जमानी जोखिम नरहेको', 'Zero guarantor exposure')
                      : `${fmtDigits(clearanceCheck.guaranteedLoansCount)} ${t('वटा कर्जामा जमानी', 'guaranteed loans')}`}
                  </p>
                </div>

                {/* Gate 3: Savings & Shares */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('३. फिर्ता योग्य मौज्दात', '3. Refundable Assets')}
                    </span>
                    <Coins className="size-4 text-emerald-500" />
                  </div>
                  <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {fmtCurrency(clearanceCheck.shareCapital + clearanceCheck.totalSavingsBalance, true)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {fmtDigits(clearanceCheck.shareUnitsCount)} {t('कित्ता सेयर + बचत', 'share kitta + savings')}
                  </p>
                </div>
              </div>

              {clearanceCheck.warnings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <span className="font-bold uppercase text-[10px] text-amber-600">सुझाव तथा चेतावनी (Advisory Notes):</span>
                  {clearanceCheck.warnings.map((w, idx) => (
                    <p key={idx}>• {w}</p>
                  ))}
                </div>
              )}

              {/* Next step button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('SETTLEMENT')}
                  disabled={!clearanceCheck.canExit}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    clearanceCheck.canExit
                      ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>{t('अन्तिम हिसाब फर्छ्यौट तर्फ जानुहोस्', 'Proceed to Final Settlement')}</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Settlement Calculator */}
          {activeTab === 'SETTLEMENT' && (
            <div className="space-y-6">
              {/* Form Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('सदस्यता त्यागको कारण:', 'Reason for Membership Exit:')}
                  </label>
                  <select
                    value={exitReason}
                    onChange={(e) => setExitReason(e.target.value as MembershipExitReason)}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="VOLUNTARY_RESIGNATION">{t('स्वेच्छिक राजीनामा (Voluntary Resignation)', 'Voluntary Resignation')}</option>
                    <option value="OUT_OF_DISTRICT_RELOCATION">{t('दाङ बाहिर स्थायी बसाईसराई (Relocation)', 'Permanent Relocation')}</option>
                    <option value="DECEASED_LEGAL_HEIR">{t('सदस्यको मृत्यु (Deceased - Legal Heir)', 'Deceased (Heir Settlement)')}</option>
                    <option value="STATUTORY_EXPULSION">{t('साधारण सभा निर्णयद्वारा निष्कासन (Expulsion)', 'Statutory Expulsion')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('रकम भुक्तानी माध्यम:', 'Settlement Payout Method:')}
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as 'CASH_COUNTER' | 'ACCOUNT_TRANSFER' | 'CHEQUE')}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="CASH_COUNTER">{t('नगद काउन्टर भुक्तानी (Cash Counter)', 'Cash Counter Desk')}</option>
                    <option value="ACCOUNT_TRANSFER">{t('बैंक खाता ट्रान्सफर (Bank Transfer)', 'Bank Account Transfer')}</option>
                    <option value="CHEQUE">{t('सहकारी चेक जारी (Cooperative Cheque)', 'Account Payee Cheque')}</option>
                  </select>
                </div>

                {exitReason === 'DECEASED_LEGAL_HEIR' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {t('इच्छाएको हकवालाको नाम:', 'Nominee / Legal Heir Full Name:')}
                    </label>
                    <input
                      type="text"
                      placeholder="हकवालाको नाम र सम्बन्ध"
                      value={nomineeName}
                      onChange={(e) => setNomineeName(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('सदस्यता खारेजी प्रशासनिक दस्तुर (रु.):', 'Exit Administrative Fee (NPR):')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={adminFee}
                    onChange={(e) => setAdminFee(Math.max(0, parseInt(e.target.value || '0', 10)))}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Settlement Calculation Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">{t('हिसाब शीर्षक (Headings)', 'Description')}</th>
                      <th className="px-4 py-3 text-right">{t('रकम (NPR)', 'Amount (NPR)')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                    <tr>
                      <td className="px-4 py-2.5 font-sans font-medium text-slate-700 dark:text-slate-300">
                        {t('१. सेयर पूँजी फिर्ता (Share Capital Refund)', 'Share Capital Refund')}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                        {fmtCurrency(settlementCalc.shareCapitalRefund, true)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-sans font-medium text-slate-700 dark:text-slate-300">
                        {t('२. साधारण तथा मुद्दती बचत मौज्दात (Savings Balance Refund)', 'Savings Balance Refund')}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                        {fmtCurrency(settlementCalc.regularSavingsRefund, true)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-sans font-medium text-slate-700 dark:text-slate-300">
                        {t('३. पाकेको कुल ब्याज (Gross Accrued Interest)', 'Gross Accrued Interest')}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-emerald-600">
                        + {fmtCurrency(settlementCalc.grossAccruedInterest, true)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-sans font-medium text-rose-500">
                        {t('४. ५% अग्रिम आयकर कट्टी (5% Statutory TDS under Sec 88)', '5% Statutory TDS (Sec 88)')}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-rose-600">
                        - {fmtCurrency(settlementCalc.statutoryTdsDeduction, true)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-sans font-medium text-slate-700 dark:text-slate-300">
                        {t('५. अवितरित लाभांश तथा बोनस (Unpaid Dividends & Bonus)', 'Unpaid Dividends & Bonus')}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-emerald-600">
                        + {fmtCurrency(settlementCalc.unpaidDividendsAndPatronage, true)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-sans font-medium text-slate-500">
                        {t('६. सदस्यता खारेजी प्रशासनिक दस्तुर (Exit Administrative Fee)', 'Exit Fee')}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-rose-600">
                        - {fmtCurrency(settlementCalc.membershipExitAdminFee, true)}
                      </td>
                    </tr>
                    <tr className="bg-rose-50/50 dark:bg-rose-950/20 text-sm">
                      <td className="px-4 py-3 font-sans font-black text-slate-900 dark:text-white">
                        {t('कुल खुद भुक्तानी फर्छ्यौट रकम (Net Payable Settlement NPR):', 'Net Payable Settlement (NPR):')}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-rose-600 dark:text-rose-400 font-mono">
                        {fmtCurrency(settlementCalc.netPayableAmount, true)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Execution Action */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleExecuteExit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <UserCheck className="size-4" />
                  <span>{t('हिसाब फर्छ्यौट तथा सदस्यता खारेज गर्नुहोस्', 'Execute Exit & Issue Certificate')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Certificate & Voucher */}
          {activeTab === 'CERTIFICATE' && (
            <div className="space-y-4">
              {completedCertificate ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      {t('आधिकारिक सदस्यता खारेजी तथा फरफारक भरपाई (Statutory Certificate)', 'Official Exit Certificate & Discharge Deed')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyCertificate}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                      >
                        {copiedCertificate ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                        <span>{copiedCertificate ? t('कपी भयो!', 'Copied!') : t('प्रतिलिपि (Copy)', 'Copy')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadCsv}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                      >
                        <Download className="size-3.5" />
                        <span>{t('CSV डाउनलोड', 'CSV')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintCertificate}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <Printer className="size-3.5" />
                        <span>{t('प्रमाणपत्र छाप्नुहोस् (Print Certificate)', 'Print Certificate')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Document View */}
                  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-serif space-y-4 shadow-sm">
                    <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">उनको बचत तथा ऋण सहकारी संस्था लि.</h3>
                      <p className="text-xs text-slate-500">गढवा गाउँपालिका वडा नं. ५, दाङ | फोन: ०८२-४०१०५०</p>
                      <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-2 underline">
                        सहकारी सदस्यता त्याग तथा अन्तिम हिसाब फरफारक प्रमाणपत्र
                      </h4>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>प्रमाणपत्र नं: {completedCertificate.certificateNo}</span>
                      <span>भौचर नं: {completedCertificate.voucherNo}</span>
                      <span>मिति: {completedCertificate.issueDateNepali}</span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                      {completedCertificate.declarationText}
                    </p>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                          <tr>
                            <td className="px-3 py-2 text-slate-500 font-sans">सदस्यको नाम / ठेगाना</td>
                            <td className="px-3 py-2 font-sans font-bold">{completedCertificate.memberName} ({completedCertificate.address})</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-slate-500 font-sans">नागरिकता नं. / सदस्य नं.</td>
                            <td className="px-3 py-2 font-bold">{completedCertificate.citizenshipNo} / {completedCertificate.memberNo}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-slate-500 font-sans">फिर्ता भएको सेयर पूँजी</td>
                            <td className="px-3 py-2 text-right font-bold">{fmtCurrency(completedCertificate.settlement.shareCapitalRefund, true)}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-slate-500 font-sans">फिर्ता भएको बचत मौज्दात</td>
                            <td className="px-3 py-2 text-right font-bold">{fmtCurrency(completedCertificate.settlement.regularSavingsRefund, true)}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 text-slate-500 font-sans">५% आयकर कट्टी रकम</td>
                            <td className="px-3 py-2 text-right font-bold text-rose-600">- {fmtCurrency(completedCertificate.settlement.statutoryTdsDeduction, true)}</td>
                          </tr>
                          <tr className="bg-rose-50/50 dark:bg-rose-950/20 font-bold">
                            <td className="px-3 py-2.5 font-sans text-slate-900 dark:text-white">कुल भुक्तानी भएको खुद रकम</td>
                            <td className="px-3 py-2.5 text-right text-rose-600 dark:text-rose-400 text-sm">{fmtCurrency(completedCertificate.settlement.netPayableAmount, true)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-4 text-center text-[10px] text-slate-500 font-sans">
                      <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-1 font-bold">
                        सदस्यको दस्तखत
                      </div>
                      <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-1 font-bold">
                        ऋण तथा लेखा समिति प्रमाणीकरण
                      </div>
                      <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-1 font-bold">
                        संस्था प्रबन्धक
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Receipt className="size-10 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs">
                    {t(
                      'कुनै प्रमाणपत्र तयार भएको छैन। कृपया "अन्तिम हिसाब फर्छ्यौट" ट्याबबाट हिसाब फर्छ्यौट सम्पन्न गर्नुहोस्।',
                      'No exit certificate generated yet. Please execute final settlement first.'
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
            {t('सहकारी ऐन २०७४ दफा ३१ र ३२ कानूनी मापदण्ड', 'Nepal Cooperative Act 2074 Sec 31/32 Compliant')}
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
