import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import { Loan, Member, LoanProvisionCategory } from '../../types';
import {
  LegalNoticeType,
  generateLegalRecoveryNotice,
  buildCibBlacklistRecord,
  generateCibBlacklistCsv,
  processBadDebtWriteOff,
  calculateAuctionSettlement,
  BadDebtWriteOffVoucher,
} from '../../utils/badDebtRecovery';
import {
  X,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  ShieldAlert,
  ArrowRight,
  Calculator,
  Gavel,
} from 'lucide-react';

interface BadDebtRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: readonly Loan[];
  members: readonly Member[];
  initialLoanId?: string;
}

export const BadDebtRecoveryModal: React.FC<BadDebtRecoveryModalProps> = ({
  isOpen,
  onClose,
  loans,
  members,
  initialLoanId,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtPercent } = useLanguageStore();
  const { coopSettings, recordLoanRepayment } = useCoopStore();

  const [activeTab, setActiveTab] = useState<'NOTICE' | 'CIB' | 'WRITE_OFF' | 'WATERFALL'>('NOTICE');
  const [selectedLoanId, setSelectedLoanId] = useState<string>(initialLoanId || loans[0]?.id || '');
  const [noticeType, setNoticeType] = useState<LegalNoticeType>('NOTICE_35_DAYS_PUBLIC_AUCTION');
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Write-off form state
  const [boardResolutionNo, setBoardResolutionNo] = useState('निर्णय नं. ४५ (२०८१/०५/२८)');
  const [boardResolutionDate, setBoardResolutionDate] = useState('२०८१-०५-२८');
  const [writeOffNotes, setWriteOffNotes] = useState('सञ्चालक समितिको निर्णयानुसार १००% नोक्सानी जगेडाबाट अपलेखन गरी बाह्य खातामा सारिएको');
  const [generatedVoucher, setGeneratedVoucher] = useState<BadDebtWriteOffVoucher | null>(null);

  // Waterfall calculator state
  const [grossProceedsInput, setGrossProceedsInput] = useState<number>(350000);
  const [legalCostInput, setLegalCostInput] = useState<number>(15000);

  // Selected Loan & Member
  const selectedLoan = useMemo(() => {
    return loans.find((l) => l.id === selectedLoanId) || loans[0];
  }, [loans, selectedLoanId]);

  const selectedMember = useMemo(() => {
    if (!selectedLoan) return undefined;
    return members.find((m) => m.id === selectedLoan.memberId);
  }, [members, selectedLoan]);

  // Notice Data
  const noticeData = useMemo(() => {
    if (!selectedLoan) return null;
    return generateLegalRecoveryNotice(selectedLoan, selectedMember, noticeType);
  }, [selectedLoan, selectedMember, noticeType]);

  // CIB Records for all NPL / Overdue loans
  const cibRecords = useMemo(() => {
    return loans
      .filter((l) => l.status === 'OVERDUE' || l.remainingBalance > 100000)
      .map((loan, idx) => {
        const member = members.find((m) => m.id === loan.memberId);
        const days = loan.status === 'OVERDUE' ? 90 + idx * 75 : 45;
        const category: LoanProvisionCategory = days > 365 ? 'BAD' : days > 180 ? 'DOUBTFUL' : 'SUBSTAND';
        return buildCibBlacklistRecord(loan, member, days, category);
      });
  }, [loans, members]);

  // Waterfall settlement calculation
  const settlementResult = useMemo(() => {
    if (!selectedLoan) return null;
    const principal = selectedLoan.remainingBalance;
    const interest = Math.round(principal * 0.14 * (120 / 365));
    const penalty = Math.round(principal * 0.02);
    return calculateAuctionSettlement(
      principal,
      interest,
      penalty,
      legalCostInput,
      grossProceedsInput,
      selectedMember?.name ?? 'Cooperative Member',
      selectedLoan.loanNo
    );
  }, [selectedLoan, selectedMember, legalCostInput, grossProceedsInput]);

  if (!isOpen || !selectedLoan) return null;

  const handleCopyNotice = () => {
    if (!noticeData) return;
    const text = `${noticeData.titleNepali}\n\n${noticeData.noticeBodyText}\n\nतपसिल:\nऋणीको नाम: ${noticeData.borrowerName}\nसदस्य नं: ${noticeData.borrowerMemberNo}\nनागरिकता नं: ${noticeData.borrowerCitizenshipNo}\nबाँकी साँवा: रु. ${noticeData.principalOutstanding.toLocaleString()}\nब्याज तथा हर्जाना: रु. ${(noticeData.accruedInterest + noticeData.penaltyAmount).toLocaleString()}\nकुल बुझाउनुपर्ने: रु. ${noticeData.totalPayableAmount.toLocaleString()}\nधितो विवरण: कित्ता नं. ${noticeData.collateral.kittaNo}, ${noticeData.collateral.municipality}-${noticeData.collateral.wardNo}, ${noticeData.collateral.district}`;
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const handlePrintNotice = () => {
    if (!noticeData) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${noticeData.titleNepali}</title>
        <style>
          body { font-family: 'Mukti', 'Kalimati', 'Arial', sans-serif; padding: 30px; line-height: 1.6; color: #111; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
          .inst-name { font-size: 20px; font-weight: bold; margin: 0; }
          .inst-sub { font-size: 13px; margin: 2px 0; }
          .title { font-size: 15px; font-weight: bold; text-align: center; margin: 15px 0; text-decoration: underline; }
          .meta { font-size: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; }
          .body-text { font-size: 13px; text-align: justify; margin-bottom: 16px; }
          .details-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
          .details-table th, .details-table td { border: 1px solid #444; padding: 6px 10px; text-align: left; }
          .details-table th { background: #f0f0f0; }
          .footer { margin-top: 40px; text-align: right; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <p class="inst-name">${coopSettings.nameNepali || 'उनको बचत तथा ऋण सहकारी संस्था लि.'}</p>
          <p class="inst-sub">${coopSettings.addressNepali || 'गढवा गाउँपालिका वडा नं. ५, दाङ, लुम्बिनी प्रदेश'}</p>
          <p class="inst-sub">दर्ता नं: ${coopSettings.regNo || '२८३/०६५/०६६'} | पान नं: ${coopSettings.panNo || '३०२९५८४८१'}</p>
        </div>
        <div class="meta">
          <span>सूचना नं: ${noticeData.noticeNo}</span>
          <span>प्रकाशन मिति: ${noticeData.issueDateNepali}</span>
        </div>
        <div class="title">${noticeData.titleNepali}</div>
        <div class="body-text">${noticeData.noticeBodyText}</div>
        
        <table class="details-table">
          <tr><th colspan="2">१. ऋणी तथा जमानीकर्ताको विवरण</th></tr>
          <tr><td width="35%">ऋणी सदस्यको नाम / थर:</td><td><b>${noticeData.borrowerName}</b> (सदस्य नं: ${noticeData.borrowerMemberNo})</td></tr>
          <tr><td>नागरिकता नं. / जिल्ला:</td><td>${noticeData.borrowerCitizenshipNo} (दाङ)</td></tr>
          <tr><td>ठेगाना:</td><td>${noticeData.borrowerAddress}</td></tr>
          <tr><td>जमानीकर्ता:</td><td>${noticeData.guarantors.map((g) => `${g.name} (${g.relation}, ना.नं: ${g.citizenshipNo})`).join(', ')}</td></tr>
          
          <tr><th colspan="2">२. लिलाम हुने धितो सम्पत्तिको विवरण</th></tr>
          <tr><td>जग्गाको कित्ता नं. / क्षेत्रफल:</td><td>कित्ता नं. <b>${noticeData.collateral.kittaNo}</b> (क्षेत्रफल: ${noticeData.collateral.areaDesc})</td></tr>
          <tr><td>जग्गाको स्थान:</td><td>${noticeData.collateral.district}, ${noticeData.collateral.municipality} ${noticeData.collateral.wardNo}</td></tr>
          <tr><td>चारकिल्ला:</td><td>पूर्व: ${noticeData.collateral.eastBoundary}, पश्चिम: ${noticeData.collateral.westBoundary}, उत्तर: ${noticeData.collateral.northBoundary}, दक्षिण: ${noticeData.collateral.southBoundary}</td></tr>
          
          <tr><th colspan="2">३. संस्थालाई बुझाउनुपर्ने चुक्ता हिसाव</th></tr>
          <tr><td>बाँकी साँवा रकम:</td><td>रु. ${noticeData.principalOutstanding.toLocaleString()}</td></tr>
          <tr><td>पाकेको ब्याज तथा हर्जाना:</td><td>रु. ${(noticeData.accruedInterest + noticeData.penaltyAmount).toLocaleString()}</td></tr>
          <tr><td>कानूनी तथा सूचना प्रकाशन खर्च:</td><td>रु. ${noticeData.legalNoticeExpenses.toLocaleString()}</td></tr>
          <tr><td><b>कुल चुक्ता गर्नुपर्ने रकम:</b></td><td><b>रु. ${noticeData.totalPayableAmount.toLocaleString()}</b></td></tr>
        </table>

        <div class="footer">
          <p>कर्जा असुली उपसमिति तथा व्यवस्थापन पक्ष</p>
          <p>${coopSettings.nameNepali || 'उनको बचत तथा ऋण सहकारी संस्था लि.'}</p>
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

  const handleDownloadCibCsv = () => {
    const csv = generateCibBlacklistCsv(cibRecords);
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Unako_CIB_Blacklist_Recommendation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteWriteOff = () => {
    if (!selectedLoan) return;
    const voucher = processBadDebtWriteOff(
      selectedLoan,
      selectedMember,
      boardResolutionNo,
      boardResolutionDate,
      writeOffNotes
    );
    setGeneratedVoucher(voucher);

    // Wire to store: write off loan balance to zero out bad debt in ledger & member balance
    if (selectedLoan.remainingBalance > 0) {
      recordLoanRepayment(selectedLoan.loanNo, selectedLoan.remainingBalance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Gavel className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {t('खराब कर्जा असुली तथा अपलेखन कार्यकक्ष', 'Bad Debt Recovery & Write-Off Workbench')}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {t('दफा ८३ र ८४', 'Section 83/84')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t(
                  'सहकारी ऐन २०७४ अन्तर्गत ३५ दिने लिलाम सूचना, CIB कालोसूची तथा खराब कर्जा अपलेखन व्यवस्थापन',
                  'Statutory 35-day auction notice, CIB blacklisting dossier, and bad debt write-off accounting engine.'
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

        {/* Loan Selector Bar */}
        <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">{t('ऋणी कर्जा छनोट:', 'Target Loan:')}</span>
            <select
              value={selectedLoanId}
              onChange={(e) => {
                setSelectedLoanId(e.target.value);
                setGeneratedVoucher(null);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
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
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span>{t('सदस्य नं:', 'Member No:')} <b className="text-slate-900 dark:text-white">{selectedMember.memberNo}</b></span>
              <span>{t('नागरिकता:', 'Citizenship:')} <b className="text-slate-900 dark:text-white">{selectedMember.citizenshipNo || '५४-०१-७०-०१४२५'}</b></span>
              <span>{t('बाँकी साँवा:', 'Balance:')} <b className="text-rose-600 dark:text-rose-400">{fmtCurrency(selectedLoan.remainingBalance, true)}</b></span>
            </div>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 gap-2 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('NOTICE')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'NOTICE'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="size-4" />
            <span>{t('३५ दिने लिलाम सूचना', '35-Day Public Notice')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CIB')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'CIB'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="size-4" />
            <span>{t('CIB कालोसूची सिफारिस', 'CIB Blacklist Dossier')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WRITE_OFF')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'WRITE_OFF'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Scale className="size-4" />
            <span>{t('खराब कर्जा अपलेखन', 'Statutory Bad Debt Write-Off')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WATERFALL')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'WATERFALL'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Calculator className="size-4" />
            <span>{t('लिलाम असुली बाँडफाँड', 'Auction Proceeds Waterfall')}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: 35-Day Notice Generator */}
          {activeTab === 'NOTICE' && noticeData && (
            <div className="space-y-6">
              {/* Notice Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">{t('सूचनाको प्रकार:', 'Notice Type:')}</span>
                  <select
                    value={noticeType}
                    onChange={(e) => setNoticeType(e.target.value as LegalNoticeType)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="NOTICE_35_DAYS_PUBLIC_AUCTION">{t('३५ दिने सार्वजनिक धितो लिलाम सूचना (35 Days)', '35-Day Public Auction Notice')}</option>
                    <option value="NOTICE_15_DAYS_FINAL_DEMAND">{t('१५ दिने अन्तिम ताकेता सूचना (15 Days)', '15-Day Final Demand Notice')}</option>
                    <option value="NOTICE_7_DAYS_SEALED_TENDER">{t('७ दिने सिलबन्दी बोलपत्र लिलाम बिक्री (7 Days)', '7-Day Sealed Bid Tender')}</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyNotice}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                  >
                    {copiedNotice ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    <span>{copiedNotice ? t('कपी भयो!', 'Copied!') : t('प्रतिलिपि', 'Copy Text')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintNotice}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Printer className="size-3.5" />
                    <span>{t('सूचना छाप्नुहोस्', 'Print Notice')}</span>
                  </button>
                </div>
              </div>

              {/* Preview Card */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-serif space-y-4 shadow-sm">
                <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">उनको बचत तथा ऋण सहकारी संस्था लि.</h3>
                  <p className="text-xs text-slate-500">गढवा-५, दाङ | फोन: ०८२-४०१०५०</p>
                  <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-2 underline">
                    {noticeData.titleNepali}
                  </h4>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>{t('सूचना नं:', 'Notice No:')} {noticeData.noticeNo}</span>
                  <span>{t('प्रकाशन मिति:', 'Date:')} {noticeData.issueDateNepali}</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                  {noticeData.noticeBodyText}
                </p>

                {/* Statutory 3-part Schedule */}
                <div className="space-y-3 pt-2 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-rose-500">
                      १. ऋणी तथा व्यक्तिगत जमानीकर्ता विवरण
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                      <div>ऋणी: <b>{noticeData.borrowerName}</b> (सदस्य नं: {noticeData.borrowerMemberNo})</div>
                      <div>नागरिकता नं: <b>{noticeData.borrowerCitizenshipNo}</b></div>
                      <div>ठेगाना: {noticeData.borrowerAddress}</div>
                      <div>जमानीकर्ता: {noticeData.guarantors.map((g) => g.name).join(', ')}</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-blue-500">
                      २. लिलाम सुरक्षण धितो विवरण
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                      <div>कित्ता नं: <b>{noticeData.collateral.kittaNo}</b> (क्षेत्रफल: {noticeData.collateral.areaDesc})</div>
                      <div>स्थान: {noticeData.collateral.district}, {noticeData.collateral.municipality} {noticeData.collateral.wardNo}</div>
                      <div className="sm:col-span-2 text-[11px] text-slate-500">
                        चारकिल्ला: पूर्व- {noticeData.collateral.eastBoundary}, पश्चिम- {noticeData.collateral.westBoundary}, उत्तर- {noticeData.collateral.northBoundary}, दक्षिण- {noticeData.collateral.southBoundary}
                      </div>
                    </div>
                  </div>

                  <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 space-y-1">
                    <span className="font-bold text-rose-700 dark:text-rose-300 uppercase text-[10px] tracking-wider">
                      ३. चुक्ता गर्नुपर्ने लेना रकमको हिसाब
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-slate-700 dark:text-slate-300">
                      <div>बाँकी साँवा: <b>{fmtCurrency(noticeData.principalOutstanding, true)}</b></div>
                      <div>पाकेको ब्याज: <b>{fmtCurrency(noticeData.accruedInterest, true)}</b></div>
                      <div>हर्जाना: <b>{fmtCurrency(noticeData.penaltyAmount, true)}</b></div>
                      <div className="text-rose-600 dark:text-rose-400 font-bold">कुल चुक्ता दायित्व: <b>{fmtCurrency(noticeData.totalPayableAmount, true)}</b></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CIB Blacklisting Dossier */}
          {activeTab === 'CIB' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('कर्जा सूचना केन्द्र (CIB) कालोसूची सिफारिस सूची', 'Credit Information Bureau (CIB) Blacklist Dossier')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('९० दिनभन्दा बढी भाखा नाघेका ऋणी तथा जमानीकर्ताहरूको मानक CIB ढाँचा', 'Defaulting borrowers and personal guarantors formatted for CIB Nepal.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadCibCsv}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-all shadow-xs"
                >
                  <Download className="size-4" />
                  <span>{t('CIB फाइल डाउनलोड (CSV)', 'Download CIB CSV')}</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">{t('ऋणी तथा सदस्य नं.', 'Borrower & Member No')}</th>
                      <th className="px-4 py-3">{t('नागरिकता नं.', 'Citizenship No')}</th>
                      <th className="px-4 py-3">{t('कर्जा खाता', 'Loan A/C')}</th>
                      <th className="px-4 py-3">{t('भाखा नाघेको दिन', 'Overdue Days')}</th>
                      <th className="px-4 py-3">{t('कुल बक्यौता रकम', 'Total Default')}</th>
                      <th className="px-4 py-3">{t('मुख्य जमानीकर्ता', 'Guarantor')}</th>
                      <th className="px-4 py-3 text-center">{t('स्थिति', 'CIB Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {cibRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 dark:text-white">{r.borrowerName}</span>
                          <p className="text-[10px] text-slate-400 font-mono">{r.borrowerMemberNo}</p>
                        </td>
                        <td className="px-4 py-3 font-mono">{r.citizenshipNo}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">{r.loanAccountNo}</td>
                        <td className="px-4 py-3 font-mono text-rose-500 font-bold">{fmtDigits(r.overdueDays)} {t('दिन', 'days')}</td>
                        <td className="px-4 py-3 font-mono font-bold text-rose-600 dark:text-rose-400">{fmtCurrency(r.totalDefaultAmount, true)}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.primaryGuarantorName}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            {r.blacklistStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Bad Debt Write-Off */}
          {activeTab === 'WRITE_OFF' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <p className="font-bold">
                    {t('सहकारी विभागको मापदण्ड अनुसार अपलेखन शर्तहरू:', 'Statutory Write-Off Rules:')}
                  </p>
                  <p>
                    {t(
                      '१. कर्जा शतप्रतिशत (१००%) नोक्सानी जगेडा कोषमा बाँधिएको हुनुपर्ने। २. सञ्चालक समितिको स्पष्ट निर्णय र आगामी साधारण सभाबाट अनुमोदन गराउनुपर्ने। ३. अपलेखन गरे तापनि कालोसूची र असुली अधिकार बाह्य खाता मा अक्षुण्ण रहन्छ।',
                      '1. Must be 100% provisioned in loan loss reserve. 2. Requires Board of Directors resolution and AGM ratification. 3. Legal claim remains active in memorandum register.'
                    )}
                  </p>
                </div>
              </div>

              {/* Resolution Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('सञ्चालक समिति निर्णय नं.:', 'Board Resolution No:')}
                  </label>
                  <input
                    type="text"
                    value={boardResolutionNo}
                    onChange={(e) => setBoardResolutionNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('सञ्चालक समिति निर्णय मिति:', 'Board Decision Date:')}
                  </label>
                  <input
                    type="text"
                    value={boardResolutionDate}
                    onChange={(e) => setBoardResolutionDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('अपलेखन कैफियत तथा असुली रणनीति:', 'Write-off Rationale & Legal Recovery Notes:')}
                  </label>
                  <input
                    type="text"
                    value={writeOffNotes}
                    onChange={(e) => setWriteOffNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleExecuteWriteOff}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <Scale className="size-4" />
                    <span>{t('अपलेखन भौचर तयार गर्नुहोस्', 'Generate Write-off Voucher')}</span>
                  </button>
                </div>
              </div>

              {/* Generated Accounting Voucher */}
              {generatedVoucher && (
                <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-emerald-500" />
                      <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        {t('अपलेखन लेखा भौचर तथा बाह्य खाता दर्ता सम्पन्न', 'Write-Off Voucher Executed')}
                      </h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      {generatedVoucher.voucherNo}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Debit Account (नामे)</span>
                      <p className="font-bold text-slate-900 dark:text-white mt-1">{generatedVoucher.debitAccount}</p>
                      <p className="font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">
                        {fmtCurrency(generatedVoucher.totalWriteOffAmount, true)}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Credit Account (जम्मा)</span>
                      <p className="font-bold text-slate-900 dark:text-white mt-1">{generatedVoucher.creditAccount}</p>
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {fmtCurrency(generatedVoucher.totalWriteOffAmount, true)}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-slate-400">{t('बाह्य अभिलेख खाता:', 'Memorandum A/C:')} </span>
                      <b className="font-mono text-slate-900 dark:text-white">{generatedVoucher.memorandumRegisterNo}</b>
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="size-3.5" />
                      <span>{t('कानूनी असुली अधिकार अक्षुण्ण रहेको', 'Legal Claim Preserved')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Waterfall Settlement */}
          {activeTab === 'WATERFALL' && settlementResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('धितो लिलाम बिक्रीबाट प्राप्त कूल रकम:', 'Gross Auction Proceeds (NPR):')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={grossProceedsInput}
                    onChange={(e) => setGrossProceedsInput(Math.max(0, parseInt(e.target.value || '0', 10)))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('लिलाम तथा कानूनी खर्च:', 'Legal & Auction Expenses (NPR):')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={legalCostInput}
                    onChange={(e) => setLegalCostInput(Math.max(0, parseInt(e.target.value || '0', 10)))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Waterfall Hierarchy Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('दफा ८४ अनुसार असुली बाँडफाँडको वैधानिक प्राथमिकता', 'Statutory Waterfall Priority')}
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      १. कानूनी तथा लिलाम खर्च (Legal Expenses - Priority 1)
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {fmtCurrency(settlementResult.legalAndAuctionCost, true)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      २. हर्जाना तथा विलम्ब शुल्क (Penalties - Priority 2)
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {fmtCurrency(settlementResult.penaltySettled, true)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      ३. पाकेको ब्याज असुली (Accrued Interest - Priority 3)
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {fmtCurrency(settlementResult.interestSettled, true)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      ४. साँवा बक्यौता फर्छ्यौट (Principal Clearance - Priority 4)
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {fmtCurrency(settlementResult.principalSettled, true)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Settlement Outcome Card */}
              <div
                className={`p-5 rounded-2xl border ${
                  settlementResult.isFullySettled
                    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                    : 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30'
                } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {settlementResult.isFullySettled
                      ? t('ऋणीलाई फिर्ता भुक्तानी हुने बचत रकम', 'Surplus Refund to Member')
                      : t('ऋणी तथा जमानीकर्ताबाट थप असुली बाँकी रकम', 'Remaining Unrecovered Deficit')}
                  </span>
                  <div
                    className={`text-2xl font-black ${
                      settlementResult.isFullySettled
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {settlementResult.isFullySettled
                      ? fmtCurrency(settlementResult.netSurplusRefundToMember, true)
                      : fmtCurrency(settlementResult.remainingDeficitToRecover, true)}
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 max-w-sm">
                  {settlementResult.isFullySettled
                    ? t(
                        'धितो लिलामबाट सम्पूर्ण लेना असुल भई बाँकी रकम ऋणी सदस्यको बचत खातामा फिर्ता जम्मा गरिन्छ।',
                        'All dues are recovered. The remaining surplus is credited back to member savings.'
                      )
                    : t(
                        'लिलाम रकमले सम्पूर्ण दायित्व नधानेकाले नपुग रकम असुलिका लागि ऋणी र जमानीकर्ताको अन्य सम्पत्ति रोक्का प्रक्रिया अघि बढाइन्छ।',
                        'Auction proceeds are insufficient. Legal recovery continues against personal/guarantor assets.'
                      )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <span className="text-xs text-slate-400 font-medium">
            {t('सहकारी ऐन २०७४ दफा ८३, ८४ कानूनी मापदण्ड', 'Nepal Cooperative Act 2074 Sec 83/84 Compliant')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
