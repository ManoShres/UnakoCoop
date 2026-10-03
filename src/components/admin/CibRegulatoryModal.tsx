import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Member, Loan } from '../../types';
import {
  CibRiskGrade,
  BlacklistStatutoryStatus,
  CibBlacklistRecord,
  CibInquiryResult,
  checkBlacklistEligibility,
  evaluateCibInquiry,
  generateBlacklistNoticeText,
  generateDelistingClearanceCertificate,
  exportCibBatchCsv,
} from '../../utils/cibRegulatoryEngine';
import {
  X,
  Printer,
  Download,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Layers,
  Coins,
  Receipt,
  FileCheck,
  Users,
  Copy,
  Check,
  Gavel,
} from 'lucide-react';

interface CibRegulatoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: readonly Member[];
  loans: readonly Loan[];
}

export const CibRegulatoryModal: React.FC<CibRegulatoryModalProps> = ({
  isOpen,
  onClose,
  members,
  loans,
}) => {
  const { t, fmtCurrency, fmtCount, fmtDigits, fmtPercent } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'INQUIRY' | 'BLACKLIST' | 'EXPORTER' | 'DELISTING'>('INQUIRY');
  const [inquiryMemberId, setInquiryMemberId] = useState(members[0]?.id || 'm-101');
  const [inquiryExternalOverdue, setInquiryExternalOverdue] = useState<number>(0);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [selectedNoticeRecord, setSelectedNoticeRecord] = useState<CibBlacklistRecord | null>(null);
  const [noticeType, setNoticeType] = useState<'35_DAYS' | '15_DAYS'>('35_DAYS');

  // Blacklist Records State
  const [blacklistRecords, setBlacklistRecords] = useState<CibBlacklistRecord[]>([
    {
      id: 'BL-2081-001',
      blacklistNo: 'CIB-BL-2081-01',
      memberId: 'm-99',
      memberNo: 'M-099',
      memberName: 'गोपाल खड्का',
      citizenshipNo: '52-01-74-0099',
      panNo: '601998822',
      loanId: 'L-2080-044',
      loanNo: 'LN-2080-044',
      loanType: 'Small Business Enterprise',
      defaultedPrincipal: 280000,
      accruedInterest: 48500,
      totalOverdueAmount: 328500,
      daysOverdue: 195,
      status: 'BLACKLISTED_ACTIVE',
      boardDecisionNo: 'BOD-RES-88/2081',
      noticePublishedDateBS: '2081/05/15',
      cibReportingDateBS: '2081/06/30',
      guarantorName: 'हरि शरण खड्का',
      guarantorCitizenship: '52-01-70-0011',
      guarantorPhone: '9847112233',
    },
    {
      id: 'BL-2081-002',
      blacklistNo: 'CIB-BL-2081-02',
      memberId: 'm-105',
      memberNo: 'M-105',
      memberName: 'दिनेश कुमार चौधरी',
      citizenshipNo: '52-01-68-0112',
      panNo: '603445511',
      loanId: 'L-2080-098',
      loanNo: 'LN-2080-098',
      loanType: 'Agricultural & Livestock',
      defaultedPrincipal: 150000,
      accruedInterest: 21000,
      totalOverdueAmount: 171000,
      daysOverdue: 125,
      status: 'NOTICE_ISSUED_35_DAYS',
      boardDecisionNo: 'BOD-RES-91/2081',
      noticePublishedDateBS: '2081/08/01',
      guarantorName: 'सुरेश चौधरी',
      guarantorCitizenship: '52-01-72-0449',
      guarantorPhone: '9857888111',
    },
    {
      id: 'BL-2081-003',
      blacklistNo: 'CIB-BL-2081-03',
      memberId: 'm-108',
      memberNo: 'M-108',
      memberName: 'शान्ति पुन मगर',
      citizenshipNo: '52-01-75-0812',
      loanId: 'L-2080-112',
      loanNo: 'LN-2080-112',
      loanType: 'Emergency Relieve',
      defaultedPrincipal: 75000,
      accruedInterest: 8500,
      totalOverdueAmount: 83500,
      daysOverdue: 95,
      status: 'RECOMMENDED',
      boardDecisionNo: 'BOD-RES-93/2081',
      guarantorName: 'टेक बहादुर पुन',
      guarantorCitizenship: '52-01-65-0012',
      guarantorPhone: '9867554433',
    },
  ]);

  // Delisting Search State
  const [delistingSearchQuery, setDelistingSearchQuery] = useState('CIB-BL-2081-01');

  // Target member for live CIB Inquiry
  const inquiryMember = useMemo(() => {
    return (
      members.find((m) => m.id === inquiryMemberId) || {
        id: inquiryMemberId,
        name: 'राम बहादुर चौधरी',
        citizenshipNo: '52-01-72-00192',
      }
    );
  }, [members, inquiryMemberId]);

  // Associated loans of the inquiry member
  const memberLoans = useMemo(() => {
    return loans.filter((l) => l.memberId === inquiryMember.id);
  }, [loans, inquiryMember]);

  // Live Inquiry Result
  const inquiryResult = useMemo(() => {
    return evaluateCibInquiry(
      {
        id: inquiryMember.id,
        name: inquiryMember.name,
        citizenshipNo: inquiryMember.citizenshipNo || '52-01-72-00192',
      },
      memberLoans,
      inquiryExternalOverdue
    );
  }, [inquiryMember, memberLoans, inquiryExternalOverdue]);

  // Delisting Certificate Data
  const delistingRecord = useMemo(() => {
    return blacklistRecords.find(
      (r) => r.blacklistNo === delistingSearchQuery || r.memberNo === delistingSearchQuery
    );
  }, [blacklistRecords, delistingSearchQuery]);

  const delistingCertificate = useMemo(() => {
    if (!delistingRecord) return null;
    return generateDelistingClearanceCertificate(
      delistingRecord,
      delistingRecord.totalOverdueAmount
    );
  }, [delistingRecord]);

  // Total Metrics
  const totalBlacklistedOverdue = useMemo(() => {
    return blacklistRecords
      .filter((r) => r.status !== 'DELISTED_CLEARED')
      .reduce((sum, r) => sum + r.totalOverdueAmount, 0);
  }, [blacklistRecords]);

  const activeBlacklistCount = useMemo(() => {
    return blacklistRecords.filter((r) => r.status === 'BLACKLISTED_ACTIVE').length;
  }, [blacklistRecords]);

  // Actions
  const handleIssueNotice = (recordId: string, type: '35_DAYS' | '15_DAYS') => {
    setBlacklistRecords((prev) =>
      prev.map((r) => {
        if (r.id === recordId) {
          const newStatus: BlacklistStatutoryStatus =
            type === '35_DAYS' ? 'NOTICE_ISSUED_35_DAYS' : 'FINAL_NOTICE_15_DAYS';
          return {
            ...r,
            status: newStatus,
            noticePublishedDateBS: '2081/08/28',
          };
        }
        return r;
      })
    );
    const target = blacklistRecords.find((r) => r.id === recordId);
    if (target) {
      setSelectedNoticeRecord(target);
      setNoticeType(type);
    }
  };

  const handleReportToCib = (recordId: string) => {
    setBlacklistRecords((prev) =>
      prev.map((r) => {
        if (r.id === recordId) {
          return {
            ...r,
            status: 'BLACKLISTED_ACTIVE' as const,
            cibReportingDateBS: '2081/08/28',
          };
        }
        return r;
      })
    );
    alert(
      t(
        'ऋणी तथा जमानतकर्तालाई कर्जा सूचना केन्द्र (CIB) को कालोसूचीमा सिफारिस गरियो।',
        'Borrower and Guarantor officially reported to Credit Information Bureau (CIB) Blacklist.'
      )
    );
  };

  const handleExecuteDelisting = (recordId: string) => {
    setBlacklistRecords((prev) =>
      prev.map((r) => {
        if (r.id === recordId) {
          return {
            ...r,
            status: 'DELISTED_CLEARED' as const,
            delistingDateBS: '2081/08/28',
            delistingVoucherNo: `VCH-RCV-${Math.floor(8800 + Math.random() * 99)}`,
            recoveredAmount: r.totalOverdueAmount,
          };
        }
        return r;
      })
    );
    setDelistingSearchQuery(recordId);
    setActiveTab('DELISTING');
  };

  const handleDownloadCibCsv = () => {
    const csv = exportCibBatchCsv(blacklistRecords);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CIB_Nepal_Blacklist_Batch_2081.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyNotice = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-950/20 via-slate-900/10 to-rose-950/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-amber-600 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase">
                  {t('कर्जा सूचना केन्द्र लि. (CREDIT INFORMATION BUREAU NEPAL)', 'CREDIT INFORMATION BUREAU NEPAL (CIB)')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/40">
                  {t('सहकारी ऐन २०७४ दफा ८०, ८१ र ८२ अनुरूप', 'Nepal Cooperative Act 2074 Sec 80, 81 & 82')}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {t('कर्जा सूचना तथा कालोसूची व्यवस्थापन प्रणाली', 'Cooperative CIB Credit Inquiry & Blacklist Gateway')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t(
                  'कर्जा पूर्व क्रेडिट स्कोर सोधपुछ, ९० दिने भाखा नाघेको कालोसूची सूचना, धितो रोक्का तथा ऋण फुकुवा प्रमाणीकरण।',
                  'Pre-disbursement credit rating inquiry, 90-day overdue blacklist notices, asset confiscation, and delisting clearance.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Global Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {t('कालोसूचीमा सिफारिस', 'Recommended / In Process')}
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block font-mono">
              {fmtCount(blacklistRecords.length)} {t('ऋणी', 'Borrowers')}
            </span>
            <span className="text-[10px] text-slate-400">{t('९० दिन भाखा नाघेका कर्जा', '90+ Days Overdue')}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-950/60 shadow-sm">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
              {t('सक्रिय कालोसूची', 'Active CIB Blacklisted')}
            </span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5 block font-mono">
              {fmtCount(activeBlacklistCount)} {t('जना', 'Defaulters')}
            </span>
            <span className="text-[10px] text-rose-500">{t('बैंकिङ्ग कारोबार तथा राहदानी रोक्का', 'Banking & Travel Debarred')}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-950/60 shadow-sm">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              {t('कुल कालोसूची बक्यौता रकम', 'Total Blacklist Overdue Exposure')}
            </span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 block font-mono">
              {fmtCurrency(totalBlacklistedOverdue)}
            </span>
            <span className="text-[10px] text-amber-600">{t('सावाँ तथा ब्याज असुली बाँकी', 'Principal + Interest')}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-950/60 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              {t('फुकुवा सम्पन्न', 'Delisted & Cleared')}
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">
              {fmtCount(blacklistRecords.filter((r) => r.status === 'DELISTED_CLEARED').length)}
            </span>
            <span className="text-[10px] text-emerald-600">{t('शतप्रतिशत असुली सम्पन्न', '100% Fully Recovered')}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('INQUIRY')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'INQUIRY'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Search className="size-4" />
            <span>{t('कर्जा पूर्व CIB सोधपुछ', 'Pre-Loan CIB Inquiry')}</span>
          </button>

          <button
            onClick={() => setActiveTab('BLACKLIST')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'BLACKLIST'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="size-4" />
            <span>{t('कालोसूची व्यवस्थापन तथा म्याद', 'Blacklist Register & Notices')}</span>
          </button>

          <button
            onClick={() => setActiveTab('EXPORTER')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'EXPORTER'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="size-4" />
            <span>{t('CIB ब्याच डाटा निर्यात', 'CIB Nepal Batch Exporter')}</span>
          </button>

          <button
            onClick={() => setActiveTab('DELISTING')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'DELISTING'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileCheck className="size-4" />
            <span>{t('कालोसूची फुकुवा प्रमाणपत्र', 'Delisting Certificate Form 82')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: Pre-Loan Inquiry */}
          {activeTab === 'INQUIRY' && (
            <div className="space-y-6">
              {/* Inquiry Toolbar */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="w-full sm:w-80">
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      {t('कर्जा माग गर्ने सदस्य चयन गर्नुहोस्', 'Select Loan Applicant Member')}
                    </label>
                    <select
                      value={inquiryMemberId}
                      onChange={(e) => setInquiryMemberId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.memberNo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-64">
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      {t('अन्य बैंक/सहकारीको भाखा नाघेको बक्यौता (सिमुलेसन रु.)', 'External BFI Overdue (NPR)')}
                    </label>
                    <input
                      type="number"
                      step="10000"
                      value={inquiryExternalOverdue}
                      onChange={(e) => setInquiryExternalOverdue(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Inquiry Report Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">{inquiryResult.queryId}</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      {inquiryResult.memberName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('नागरिकता नं:', 'Citizenship No:')} <strong className="font-mono text-slate-800 dark:text-slate-200">{inquiryResult.citizenshipNo}</strong> | {t('सोधपुछ मिति:', 'Date:')} {inquiryResult.inquiryDateBS}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-400 uppercase block">{t('क्रेडिट स्कोर', 'Credit Score')}</span>
                      <span className={`text-2xl font-black font-mono ${
                        inquiryResult.creditScore >= 750
                          ? 'text-emerald-600'
                          : inquiryResult.creditScore >= 650
                          ? 'text-blue-600'
                          : inquiryResult.creditScore >= 550
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}>
                        {inquiryResult.creditScore} / 900
                      </span>
                    </div>

                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      inquiryResult.riskGrade === 'LOW_RISK'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : inquiryResult.riskGrade === 'MODERATE_RISK'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        : inquiryResult.riskGrade === 'HIGH_RISK'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {inquiryResult.riskGrade}
                    </span>
                  </div>
                </div>

                {/* Exposure Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">
                      {t('सक्रिय कर्जा संख्या', 'Active Credit Facilities')}
                    </span>
                    <strong className="text-base font-black text-slate-900 dark:text-white block mt-1">
                      {inquiryResult.totalActiveLoansCount} {t('वटा खाताहरू', 'Accounts')}
                    </strong>
                    <span className="text-[10px] text-slate-500">{t('संस्था भित्र उपभोग भइरहेका', 'Internal Cooperative Loans')}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">
                      {t('कुल कर्जा भार', 'Total Debt Exposure')}
                    </span>
                    <strong className="text-base font-black text-slate-900 dark:text-white block mt-1 font-mono">
                      {fmtCurrency(inquiryResult.totalExposureAmount)}
                    </strong>
                    <span className="text-[10px] text-slate-500">{t('हाल बाँकी सावाँ कर्जा', 'Remaining Principal Balance')}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-rose-600 block uppercase">
                      {t('भाखा नाघेको बक्यौता', 'Total Overdue Debt')}
                    </span>
                    <strong className="text-base font-black text-rose-600 block mt-1 font-mono">
                      {fmtCurrency(inquiryResult.totalOverdueAmount)}
                    </strong>
                    <span className="text-[10px] text-rose-500 font-bold">
                      {inquiryResult.hasActiveDefault ? t('डिफल्ट सक्रिय', 'Active Default') : t('शून्य बक्यौता', 'No Overdue')}
                    </span>
                  </div>
                </div>

                {/* Legal Recommendation Alert */}
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  inquiryResult.isBlacklisted
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                }`}>
                  {inquiryResult.isBlacklisted ? (
                    <ShieldAlert className="size-5 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-xs">
                      {inquiryResult.isBlacklisted
                        ? t('कर्जा अस्वीकृति तथा कालोसूची चेतावनी', 'Statutory Credit Debarment Alert')
                        : t('कर्जा स्वीकृति योग्यता प्रमाणित', 'CIB Credit Clearance Verified')}
                    </h4>
                    <p className="text-xs mt-1">
                      {inquiryResult.inquirySummaryNepali}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Blacklist Management & Notices */}
          {activeTab === 'BLACKLIST' && (
            <div className="space-y-6">
              
              {/* Notice Preview Modal / Drawer */}
              {selectedNoticeRecord && (
                <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4 shadow-xl animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <Gavel className="size-4" />
                      <span>{t('कानूनी सूचना मस्यौदा', 'Statutory Legal Notice Draft')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyNotice(generateBlacklistNoticeText(selectedNoticeRecord, noticeType))}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedNotice ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                        <span>{copiedNotice ? t('कपी भयो', 'Copied') : t('सूचना प्रतिलिपि कपी', 'Copy Notice')}</span>
                      </button>
                      <button
                        onClick={() => setSelectedNoticeRecord(null)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono whitespace-pre-wrap text-slate-300 max-h-72 overflow-y-auto leading-relaxed">
                    {generateBlacklistNoticeText(selectedNoticeRecord, noticeType)}
                  </pre>
                </div>
              )}

              {/* Blacklist Register Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-3.5">{t('दर्ता नं.', 'Blacklist No')}</th>
                        <th className="py-3 px-3.5">{t('ऋणी सदस्यको विवरण', 'Borrower Details')}</th>
                        <th className="py-3 px-3.5">{t('कर्जा नं. र प्रकार', 'Loan No & Type')}</th>
                        <th className="py-3 px-3.5 text-right">{t('बाँकी सावाँ रु.', 'Default Principal')}</th>
                        <th className="py-3 px-3.5 text-right">{t('ब्याज रु.', 'Accrued Interest')}</th>
                        <th className="py-3 px-3.5 text-right">{t('कुल बक्यौता रु.', 'Total Overdue')}</th>
                        <th className="py-3 px-3.5 text-center">{t('भाखा नाघेको दिन', 'Days Overdue')}</th>
                        <th className="py-3 px-3.5">{t('जमानतकर्ता', 'Guarantor')}</th>
                        <th className="py-3 px-3.5 text-center">{t('स्थिति', 'Status')}</th>
                        <th className="py-3 px-3.5 text-right">{t('कार्य', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {blacklistRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3.5 font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                            {r.blacklistNo}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{r.memberName}</div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              No: {r.memberNo} | {r.citizenshipNo}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{r.loanNo}</div>
                            <span className="text-[10px] text-slate-500">{r.loanType}</span>
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-medium">
                            {fmtCurrency(r.defaultedPrincipal)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono text-slate-600 dark:text-slate-300">
                            {fmtCurrency(r.accruedInterest)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-black text-rose-600 whitespace-nowrap">
                            {fmtCurrency(r.totalOverdueAmount)}
                          </td>
                          <td className="py-3 px-3.5 text-center font-mono font-bold text-rose-600 whitespace-nowrap">
                            {r.daysOverdue} {t('दिन', 'days')}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="font-medium text-slate-800 dark:text-slate-200">{r.guarantorName}</div>
                            <span className="text-[10px] text-slate-400">{r.guarantorPhone}</span>
                          </td>
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'BLACKLISTED_ACTIVE'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                : r.status === 'DELISTED_CLEARED'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {r.status === 'RECOMMENDED' && (
                                <button
                                  onClick={() => handleIssueNotice(r.id, '35_DAYS')}
                                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
                                >
                                  {t('३५ दिने सूचना', '35-Day Notice')}
                                </button>
                              )}

                              {r.status === 'NOTICE_ISSUED_35_DAYS' && (
                                <>
                                  <button
                                    onClick={() => handleIssueNotice(r.id, '15_DAYS')}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
                                  >
                                    {t('१५ दिने म्याद', '15-Day Final')}
                                  </button>
                                  <button
                                    onClick={() => handleReportToCib(r.id)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
                                  >
                                    {t('CIB मा सिफारिस', 'Report CIB')}
                                  </button>
                                </>
                              )}

                              {r.status === 'BLACKLISTED_ACTIVE' && (
                                <button
                                  onClick={() => handleExecuteDelisting(r.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
                                >
                                  {t('असुली भई फुकुवा', 'Delist & Clear')}
                                </button>
                              )}

                              {r.status === 'DELISTED_CLEARED' && (
                                <span className="text-[11px] font-bold text-emerald-600">
                                  ✓ {t('फुकुवा सम्पन्न', 'Cleared')}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CIB Batch Exporter */}
          {activeTab === 'EXPORTER' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
                    <Download className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {t('कर्जा सूचना केन्द्र (CIB) ब्याच डाटा डाउनलोड', 'Download Credit Information Bureau Batch File')}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t(
                        'सहकारी ऐन २०७४ को दफा ८० बमोजिम कर्जा सूचना केन्द्र लि. लाई नियमित बुझाउनुपर्ने डिफल्टर तथा कालोसूची विवरण।',
                        'Standard statutory batch reporting data for submission to Credit Information Bureau (CIB) Nepal.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-slate-800 dark:text-slate-200 block">
                      {blacklistRecords.length} {t('जना ऋणीहरूको कालोसूची अभिलेख तयार छ।', 'delinquent borrower records ready for CIB dispatch.')}
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      {t('फर्म्याट: CIB Nepal Standard Comma-Separated Values (.csv)', 'Format: CIB Nepal Standard CSV')}
                    </span>
                  </div>

                  <button
                    onClick={handleDownloadCibCsv}
                    className="py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="size-4" />
                    <span>{t('CIB ब्याच फाइल डाउनलोड (.csv)', 'Download CIB CSV File')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Delisting Clearance Certificate */}
          {activeTab === 'DELISTING' && (
            <div className="space-y-6">
              {/* Search Toolbar */}
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('कालोसूची नं. वा सदस्य नं. प्रविष्ट गर्नुहोस्...', 'Enter Blacklist No or Member ID...')}
                    value={delistingSearchQuery}
                    onChange={(e) => setDelistingSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>
                {delistingCertificate && (
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Printer className="size-4" />
                    <span>{t('फुकुवा पत्र प्रिन्ट', 'Print Clearance Certificate')}</span>
                  </button>
                )}
              </div>

              {/* Certificate Sheet Display */}
              {!delistingCertificate ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  {t('कुनै फुकुवा अभिलेख फेला परेन। कृपया मान्य कालोसूची नं. खोज्नुहोस्।', 'No matching delisting record found. Please enter a valid Blacklist No or Member ID.')}
                </div>
              ) : (
                <div className="bg-white text-slate-950 p-8 rounded-3xl border border-slate-300 shadow-xl max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none">
                  {/* Official Header */}
                  <div className="text-center border-b pb-4 space-y-1">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block">
                      सहकारी ऐन २०७४ को दफा ८२ बमोजिम जारी गरिएको
                    </span>
                    <h1 className="text-xl font-black text-slate-900">
                      उनको बचत तथा ऋण सहकारी संस्था लि.
                    </h1>
                    <p className="text-xs text-slate-600 font-medium">
                      गढवा गाउँपालिका वडा नं. ५, दाङ, लुम्बिनी प्रदेश | फोन: ०८२-५४०१२३
                    </p>
                    <h2 className="text-base font-bold text-slate-800 pt-2 underline decoration-emerald-600 underline-offset-4">
                      कालोसूची फुकुवा सिफारिस तथा कर्जा चुक्ता प्रमाणपत्र (फाराम नं. ८२)
                    </h2>
                  </div>

                  {/* Salutation & Subject */}
                  <div className="text-xs space-y-2 text-slate-800">
                    <div>
                      <strong>श्रीमान् प्रमुख कार्यकारी अधिकृत ज्यू,</strong>
                      <br />
                      कर्जा सूचना केन्द्र लि., काठमाडौँ नेपाल।
                    </div>
                    <div className="font-bold underline pt-1">
                      विषय: कर्जाको सम्पूर्ण सावाँ, ब्याज असुली भई कालोसूचीबाट फुकुवा सिफारिस गरिएको सम्बन्धमा।
                    </div>
                  </div>

                  {/* Body Paragraph */}
                  <div className="text-xs leading-relaxed text-slate-700 space-y-3">
                    <p>
                      प्रस्तुत विषयमा यस <strong>उनको बचत तथा ऋण सहकारी संस्था लि.</strong> बाट कर्जा खाता नं.{' '}
                      <strong className="font-mono text-slate-950">{delistingCertificate.loanNo}</strong> अन्तर्गत कर्जा उपभोग गर्नुभएका ऋणी सदस्य{' '}
                      <strong className="text-slate-950">{delistingCertificate.memberName}</strong> (नागरिकता नं.{' '}
                      <strong className="font-mono text-slate-950">{delistingCertificate.citizenshipNo}</strong>) ले लामो समय भाखा नाघी कर्जा नबुझाएकोले सहकारी ऐन २०७४ को दफा ८१ बमोजिम कर्जा सूचना केन्द्रको कालोसूचीमा समावेश गरिएकोमा हाल निजले संस्थालाई बुझाउनुपर्ने सम्पूर्ण बक्यौता रकम रु.{' '}
                      <strong className="font-mono text-slate-950 text-sm">{fmtCurrency(delistingCertificate.totalClearedAmount)}</strong> चुक्ता गरी संस्थाको कर्जा हिसाब पूर्ण रूपमा फरफारक गरिसक्नुभएको छ।
                    </p>

                    <p>
                      अतः सहकारी ऐन २०७४ को दफा ८२ तथा कर्जा सूचना केन्द्रको नियमावली बमोजिम निज ऋणी तथा निजको व्यक्तिगत जमानतकर्तालाई कर्जा सूचना केन्द्रको कालोसूची (Blacklist) बाट फुकुवा (Delist) गरी अभिलेख अद्यावधिक गरिदिनुहुन यो सिफारिस पत्र जारी गरिएको छ।
                    </p>
                  </div>

                  {/* Verification Token */}
                  <div className="pt-6 border-t border-slate-300 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono text-[10px] text-slate-500">
                        प्रमाणीकरण कोड: <strong className="text-slate-900">{delistingCertificate.verificationHash}</strong>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        निर्णय नं: {delistingCertificate.boardResolutionNo} | मिति: {delistingCertificate.issueDateBS}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="w-48 border-b border-dashed border-slate-400 mb-1"></div>
                      <span className="text-xs font-bold text-slate-900 block">प्रमुख कार्यकारी अधिकृत / व्यवस्थापक</span>
                      <span className="text-[10px] text-slate-500">उनको बचत तथा ऋण सहकारी संस्था लि.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {t('सहकारी कर्जा अनुशासन तथा जोखिम नियन्त्रण प्रणाली', 'Cooperative Credit Discipline & Risk Mitigation')}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition cursor-pointer"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>

      </div>
    </div>
  );
};
