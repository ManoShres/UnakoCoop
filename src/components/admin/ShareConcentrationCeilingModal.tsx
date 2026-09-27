import React, { useState, useMemo } from 'react';
import {
  calculateShareConcentration,
  validateAndProcessShareTransfer,
  generateShareTransferDeed,
  generateCeilingComplianceNotice,
  exportShareConcentrationToCSV,
  ShareholderRecord,
  ShareTransferParams,
  ShareTransferResult,
} from '../../utils/shareConcentrationEngine';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import {
  ShieldAlert,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Users,
  Search,
  PieChart,
  Copy,
  Check,
  Building,
  Scale,
  Percent,
  Sliders,
  Receipt,
  FileText,
} from 'lucide-react';

interface ShareConcentrationCeilingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareConcentrationCeilingModal: React.FC<ShareConcentrationCeilingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency } = useLanguageStore();
  const { members, updateMemberDetails } = useCoopStore();

  const [activeTab, setActiveTab] = useState<'LEDGER' | 'TRANSFER' | 'NOTICE' | 'DISTRIBUTION'>('LEDGER');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'VIOLATIONS' | 'INTERNAL_LIMIT'>('ALL');
  const [internalLimitPercent, setInternalLimitPercent] = useState<number>(5.0);

  // Transfer Form State
  const [sourceMemberId, setSourceMemberId] = useState<string>('');
  const [targetMemberId, setTargetMemberId] = useState<string>('');
  const [transferKitta, setTransferKitta] = useState<number>(50);
  const [transferReason, setTransferReason] = useState<ShareTransferParams['transferReason']>('CEILING_COMPLIANCE');
  const [boardMinuteNo, setBoardMinuteNo] = useState('निर्णय नं. १७/२०८१');
  const [approvalDate, setApprovalDate] = useState('२०८१-०६-२५');
  const [transferFee, setTransferFee] = useState<number>(100);
  const [transferFeedback, setTransferFeedback] = useState<{ error?: string; warning?: string } | null>(null);
  const [lastTransferResult, setLastTransferResult] = useState<{ params: ShareTransferParams; result: ShareTransferResult } | null>(null);

  // Notice State
  const [selectedNoticeMemberId, setSelectedNoticeMemberId] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const { shareholders, metrics } = useMemo(() => {
    return calculateShareConcentration({
      members: members.map((m) => ({
        id: m.id,
        memberNo: m.memberNo,
        name: m.name,
        phone: m.phone,
        shareKitta: m.shareKitta,
        shareCapital: m.shareCapital,
      })),
      faceValue: 100,
      internalLimitPercent,
    });
  }, [members, internalLimitPercent]);

  // Set default notice member if none selected
  const noticeShareholder = useMemo(() => {
    if (selectedNoticeMemberId) {
      return shareholders.find((s) => s.memberId === selectedNoticeMemberId) || shareholders[0];
    }
    const violator = shareholders.find((s) => s.exceedsStatutoryLimit);
    return violator || shareholders[0];
  }, [shareholders, selectedNoticeMemberId]);

  const noticeText = useMemo(() => {
    if (!noticeShareholder) return '';
    return generateCeilingComplianceNotice(noticeShareholder, metrics);
  }, [noticeShareholder, metrics]);

  const filteredShareholders = useMemo(() => {
    return shareholders.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.memberNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery);

      if (!matchSearch) return false;
      if (filterType === 'VIOLATIONS') return s.exceedsStatutoryLimit;
      if (filterType === 'INTERNAL_LIMIT') return s.exceedsInternalLimit;
      return true;
    });
  }, [shareholders, searchQuery, filterType]);

  const sourceMember = useMemo(() => {
    return members.find((m) => m.id === sourceMemberId);
  }, [members, sourceMemberId]);

  const targetMember = useMemo(() => {
    return members.find((m) => m.id === targetMemberId);
  }, [members, targetMemberId]);

  const handleProcessTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceMember || !targetMember) {
      setTransferFeedback({ error: 'कृपया दुवै सेयर दाता र प्राप्तकर्ता सदस्य चयन गर्नुहोस्।' });
      return;
    }

    if (sourceMember.id === targetMember.id) {
      setTransferFeedback({ error: 'दाता र प्राप्तकर्ता एउटै सदस्य हुन सक्दैन।' });
      return;
    }

    const sourceKitta = sourceMember.shareKitta || Math.round(sourceMember.shareCapital / 100);
    const targetKitta = targetMember.shareKitta || Math.round(targetMember.shareCapital / 100);

    const params: ShareTransferParams = {
      sourceMemberId: sourceMember.id,
      sourceMemberName: sourceMember.name,
      sourceMemberNo: sourceMember.memberNo,
      sourceCurrentKitta: sourceKitta,
      targetMemberId: targetMember.id,
      targetMemberName: targetMember.name,
      targetMemberNo: targetMember.memberNo,
      targetCurrentKitta: targetKitta,
      transferKitta,
      shareFaceValue: 100,
      transferReason,
      boardMinuteNo,
      approvalDateNepali: approvalDate,
      transferFee,
    };

    const result = validateAndProcessShareTransfer(params, metrics.totalIssuedShares, metrics.statutoryLimitPercent);

    if (!result.isValid) {
      setTransferFeedback({ error: result.error });
      return;
    }

    // Execute transfer in store immutably
    updateMemberDetails(sourceMember.id, {
      shareKitta: result.sourceNewKitta,
      shareCapital: result.sourceNewKitta * 100,
    });

    updateMemberDetails(targetMember.id, {
      shareKitta: result.targetNewKitta,
      shareCapital: result.targetNewKitta * 100,
    });

    setLastTransferResult({ params, result });
    setTransferFeedback(result.warning ? { warning: result.warning } : null);
    showToastMsg(t('दफा ३८ बमोजिम सेयर नामसारी सफलतापूर्वक सम्पन्न भयो!', 'Share transfer recorded successfully!'));
  };

  const handleExportCSV = () => {
    const csv = exportShareConcentrationToCSV(shareholders, metrics);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Unako_Share_Concentration_Ceiling_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastMsg(t('सेयर केन्द्रीकरण तथा सीमा लेजर डाउनलोड भयो!', 'Share concentration ledger exported!'));
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    showToastMsg(t('क्लिपबोर्डमा प्रतिलिपि भयो!', 'Copied to clipboard!'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/50 flex items-center gap-2.5">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-indigo-400 mb-1">
              <Scale className="size-4" />
              <span>{t('सहकारी ऐन २०७४, दफा ३७ र ३८ वैधानिक अनुगमन', 'Cooperative Act 2074 Sec 37 & 38 Regulatory Portal')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t('सेयर पूँजी सीमा, केन्द्रीकरण जोखिम तथा नामसारी प्रणाली', 'Share Capital Ceiling & Divestment Suite')}
            </h2>
            <p className="text-xs text-indigo-200/90 mt-0.5 max-w-2xl">
              {t(
                'कुनै एक सदस्यलाई कुल सेयर पूँजीको २०% भन्दा बढी हुन नदिने वैधानिक सीमा अनुगमन, HHI केन्द्रीकरण विश्लेषण, र सेयर नामसारी अभिलेख।',
                'Enforce 20% single-member statutory holding ceiling, calculate HHI concentration risk, and process lawful transfers.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="size-4" />
              <span>{t('COPOMIS / CSV डाउनलोड', 'Export CSV')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Top KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('कुल जारी सेयर कित्ता', 'Total Issued Shares')}
            </span>
            <div className="text-base font-black text-slate-900 dark:text-white font-mono">
              {metrics.totalIssuedShares.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500">
              रु. {fmtCurrency(metrics.totalIssuedCapital, true)}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('दफा ३७ अधिकतम सीमा (२०%)', 'Max Allowed Limit (20%)')}
            </span>
            <div className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {metrics.maxAllowedKittaPerMember.toLocaleString('en-IN')} कित्ता
            </div>
            <span className="text-[10px] text-slate-500">
              प्रति सदस्य अधिकतम सीमा
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('शीर्ष १० सेयरधनी हिस्सा', 'Top 10 Holdings')}
            </span>
            <div className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">
              {metrics.top10ShareholdersPercent}%
            </div>
            <span className="text-[10px] text-slate-500">
              शीर्ष १: {metrics.top1ShareholderPercent}%
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('HHI केन्द्रीकरण सूचक', 'HHI Score & Risk')}
            </span>
            <div className="text-base font-black text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
              <span>{metrics.herfindahlIndex}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  metrics.concentrationRiskLevel === 'LOW'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : metrics.concentrationRiskLevel === 'MODERATE'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {metrics.concentrationRiskLevel}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              PEARLS E9 मापदण्ड
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('दफा ३७ उल्लङ्घन संख्या', 'Sec 37 Violations')}
            </span>
            <div
              className={`text-base font-black font-mono ${
                metrics.statutoryViolationsCount > 0 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-emerald-600'
              }`}
            >
              {metrics.statutoryViolationsCount} जना
            </div>
            <span className="text-[10px] text-slate-500">
              {metrics.statutoryViolationsCount > 0 ? '⚠️ लगत कट्टा/नामसारी आदेश' : '✓ पूर्ण वैधानिक अनुकूल'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'LEDGER'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Users className="size-4" />
            <span>{t('सेयरधनी स्वामित्व तथा केन्द्रीकरण लेजर', 'Shareholder Concentration Ledger')} ({shareholders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSFER')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TRANSFER'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ArrowRightLeft className="size-4" />
            <span>{t('दफा ३८ सेयर नामसारी तथा लगत कट्टा', 'Share Transfer & Divestment')}</span>
          </button>

          <button
            onClick={() => setActiveTab('NOTICE')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'NOTICE'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldAlert className="size-4" />
            <span>{t('दफा ३७ म्याद सूचना (Notice Generator)', 'Ceiling Rectification Notice')}</span>
          </button>

          <button
            onClick={() => setActiveTab('DISTRIBUTION')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'DISTRIBUTION'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <PieChart className="size-4" />
            <span>{t('स्वामित्व वितरण कोष्ठक तथा HHI', 'Ownership Brackets & HHI')}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: SHAREHOLDERS LEDGER */}
          {activeTab === 'LEDGER' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('सदस्यको नाम, सदस्य नं. वा फोन खोज्नुहोस्...', 'Search name, member no, phone...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterType('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      filterType === 'ALL'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t('सबै सेयरधनी', 'All Shareholders')}
                  </button>
                  <button
                    onClick={() => setFilterType('VIOLATIONS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      filterType === 'VIOLATIONS'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    <span>{t('>२०% उल्लङ्घन', '>20% Violations')}</span>
                    {metrics.statutoryViolationsCount > 0 && (
                      <span className="size-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </button>
                  <button
                    onClick={() => setFilterType('INTERNAL_LIMIT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      filterType === 'INTERNAL_LIMIT'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {t('>५% आन्तरिक सीमा', '>5% Internal Limit')}
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">{t('सदस्य विवरण', 'Member Details')}</th>
                        <th className="py-3 px-4 text-right">{t('सेयर कित्ता', 'Share Kitta')}</th>
                        <th className="py-3 px-4 text-right">{t('सेयर पूँजी (रु)', 'Share Capital')}</th>
                        <th className="py-3 px-4 text-right">{t('हिस्सा (% स्वामित्व)', 'Holding %')}</th>
                        <th className="py-3 px-4 text-center">{t('दफा ३७ स्थिति', 'Sec 37 Status')}</th>
                        <th className="py-3 px-4 text-right">{t('कार्य', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium">
                      {filteredShareholders.map((s, idx) => (
                        <tr
                          key={s.memberId}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${
                            s.exceedsStatutoryLimit ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{s.memberNo} • {s.phone}</div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {s.shareKitta.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                            {fmtCurrency(s.shareCapital, true)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-md ${
                                s.exceedsStatutoryLimit
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : s.exceedsInternalLimit
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {s.percentageOfTotal}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {s.exceedsStatutoryLimit ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                <AlertTriangle className="size-3" />
                                <span>{t('२०% उल्लङ्घन (लगत कट्टा)', '>20% Divestment Required')}</span>
                              </span>
                            ) : s.exceedsInternalLimit ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                <span>{t('आन्तरिक सीमा नाघेको', '>5% Threshold')}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <span>✓ कानुनसम्मत</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => {
                                setSourceMemberId(s.memberId);
                                setActiveTab('TRANSFER');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold transition cursor-pointer"
                            >
                              {t('नामसारी', 'Transfer')}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedNoticeMemberId(s.memberId);
                                setActiveTab('NOTICE');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition cursor-pointer"
                            >
                              {t('सूचना', 'Notice')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHARE TRANSFER & DIVESTMENT */}
          {activeTab === 'TRANSFER' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <form onSubmit={handleProcessTransfer} className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowRightLeft className="size-5 text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('सहकारी ऐन २०७४, दफा ३८ सेयर नामसारी तथा लगत कट्टा फारम', 'Share Transfer & Divestment Form')}
                  </h3>
                </div>

                {transferFeedback?.error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span>{transferFeedback.error}</span>
                  </div>
                )}

                {transferFeedback?.warning && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span>{transferFeedback.warning}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Source Member */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold">
                      १. सेयर दाता सदस्य (Transferor Member) *
                    </label>
                    <select
                      value={sourceMemberId}
                      onChange={(e) => setSourceMemberId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    >
                      <option value="">-- सेयर दाता सदस्य चयन गर्नुहोस् --</option>
                      {shareholders.map((s) => (
                        <option key={s.memberId} value={s.memberId}>
                          {s.name} ({s.memberNo}) - {s.shareKitta} कित्ता ({s.percentageOfTotal}%)
                        </option>
                      ))}
                    </select>
                    {sourceMember && (
                      <div className="text-[11px] text-slate-500 pt-1">
                        हालको सेयर: <b>{sourceMember.shareKitta || Math.round(sourceMember.shareCapital / 100)}</b> कित्ता (रु. {(sourceMember.shareCapital || 0).toLocaleString('en-IN')})
                      </div>
                    )}
                  </div>

                  {/* Target Member */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold">
                      २. सेयर प्राप्तकर्ता सदस्य (Transferee Member) *
                    </label>
                    <select
                      value={targetMemberId}
                      onChange={(e) => setTargetMemberId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    >
                      <option value="">-- प्राप्तकर्ता सदस्य चयन गर्नुहोस् --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.memberNo}) - हाल: {m.shareKitta || Math.round(m.shareCapital / 100)} कित्ता
                        </option>
                      ))}
                    </select>
                    {targetMember && (
                      <div className="text-[11px] text-slate-500 pt-1">
                        हालको सेयर: <b>{targetMember.shareKitta || Math.round(targetMember.shareCapital / 100)}</b> कित्ता (अधिकतम सीमा: {metrics.maxAllowedKittaPerMember} कित्ता)
                      </div>
                    )}
                  </div>

                  {/* Kitta and Amount */}
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      हस्तान्तरण कित्ता (Transfer Kitta) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={transferKitta}
                      onChange={(e) => setTransferKitta(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-indigo-600"
                    />
                    <span className="text-[11px] text-slate-400">
                      जम्मा मूल्य: रु. {(transferKitta * 100).toLocaleString('en-IN')} (@ रु. १०० प्रति कित्ता)
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      हस्तान्तरण प्रयोजन (Transfer Reason)
                    </label>
                    <select
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value as ShareTransferParams['transferReason'])}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                    >
                      <option value="CEILING_COMPLIANCE">दफा ३७ वैधानिक सेयर सीमा समायोजन (Ceiling Compliance)</option>
                      <option value="VOLUNTARY_PARTIAL">स्वेच्छिक आंशिक सेयर नामसारी (Voluntary Partial Transfer)</option>
                      <option value="FAMILY_TRANSFER">पारिवारिक हक हस्तान्तरण (Family Inheritance/Gift)</option>
                      <option value="MEMBERSHIP_EXIT">सदस्यता त्याग तथा सेयर लगत कट्टा (Membership Exit)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      सञ्चालक समिति निर्णय नं. / बैठक मिति *
                    </label>
                    <input
                      type="text"
                      required
                      value={boardMinuteNo}
                      onChange={(e) => setBoardMinuteNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      स्वीकृत मिति (वि.सं.)
                    </label>
                    <input
                      type="text"
                      value={approvalDate}
                      onChange={(e) => setApprovalDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowRightLeft className="size-4" />
                    <span>{t('सेयर नामसारी प्रमाणित गर्नुहोस्', 'Execute Share Transfer')}</span>
                  </button>
                </div>
              </form>

              {/* Transfer Deed Preview if executed */}
              {lastTransferResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileText className="size-4 text-emerald-500" />
                      <span>{t('उत्पन्न आधिकारिक सेयर नामसारी तमसुक', 'Generated Share Transfer Deed')}</span>
                    </span>
                    <button
                      onClick={() => handleCopyText(generateShareTransferDeed(lastTransferResult.params, lastTransferResult.result))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer"
                    >
                      {copiedText ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      <span>{copiedText ? 'प्रतिलिपि भयो' : 'तमसुक कपी गर्नुहोस्'}</span>
                    </button>
                  </div>
                  <pre className="p-6 bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {generateShareTransferDeed(lastTransferResult.params, lastTransferResult.result)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CEILING NOTICE */}
          {activeTab === 'NOTICE' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex-1 max-w-md">
                  <label className="block text-slate-500 font-semibold mb-1">
                    {t('म्याद सूचना जारी गर्ने सदस्य चयन:', 'Select Member for Rectification Notice:')}
                  </label>
                  <select
                    value={selectedNoticeMemberId}
                    onChange={(e) => setSelectedNoticeMemberId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  >
                    {shareholders.map((s) => (
                      <option key={s.memberId} value={s.memberId}>
                        {s.name} ({s.memberNo}) - {s.shareKitta} कित्ता ({s.percentageOfTotal}%) {s.exceedsStatutoryLimit ? '⚠️ >२०% उल्लङ्घन' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleCopyText(noticeText)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer self-end"
                >
                  {copiedText ? <Check className="size-4" /> : <Copy className="size-4" />}
                  <span>{copiedText ? 'प्रतिलिपि भयो' : 'पत्र प्रतिलिपि गर्नुहोस्'}</span>
                </button>
              </div>

              {/* Official Notice Canvas */}
              <div className="relative p-6 sm:p-8 bg-amber-50/40 dark:bg-slate-950 rounded-2xl border-2 border-amber-300 dark:border-amber-800/60 shadow-xl font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">
                {noticeText}
              </div>
            </div>
          )}

          {/* TAB 4: DISTRIBUTION & HHI */}
          {activeTab === 'DISTRIBUTION' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Bracket Distribution Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('सेयर कित्ता स्वामित्व समूह (Shareholding Brackets)', 'Shareholding Brackets')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">१-१० कित्ता</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                      {metrics.bracketDistribution.bracket1To10}
                    </span>
                    <span className="text-[10px] text-slate-500 block">न्यूनतम सेयरधनी</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">११-५० कित्ता</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                      {metrics.bracketDistribution.bracket11To50}
                    </span>
                    <span className="text-[10px] text-slate-500 block">मध्यम समूह</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">५१-२०० कित्ता</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                      {metrics.bracketDistribution.bracket51To200}
                    </span>
                    <span className="text-[10px] text-slate-500 block">उद्यमी सदस्य</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">२०१-५०० कित्ता</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {metrics.bracketDistribution.bracket201To500}
                    </span>
                    <span className="text-[10px] text-slate-500 block">उच्च लगानीकर्ता</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">५०१+ कित्ता</span>
                    <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                      {metrics.bracketDistribution.bracket501Plus}
                    </span>
                    <span className="text-[10px] text-slate-500 block">सीमा निगरानी</span>
                  </div>
                </div>
              </div>

              {/* HHI & Regulatory Compliance Checklist */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                <div className="flex items-center gap-2">
                  <Scale className="size-5 text-indigo-500" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('सहकारी सुशासन तथा HHI केन्द्रीकरण व्याख्या', 'HHI & Governance Insights')}
                  </h4>
                </div>

                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white mb-1">
                      १. Herfindahl-Hirschman Index (HHI): {metrics.herfindahlIndex}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      HHI ले पूँजी स्वामित्वको केन्द्रीकरण मापन गर्दछ। HHI १५०० भन्दा कम हुनु स्वस्थ विकेन्द्रीकरण मानिन्छ। १५०० देखि २५०० मध्यम र २५०० भन्दा माथि उच्च केन्द्रीकरण जोखिम मानिन्छ।
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white mb-1">
                      २. एक सदस्य, एक मत सिद्धान्त (Cooperative Act 2074 Sec 40)
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      सहकारी लोकतन्त्रमा जतिसुकै सेयर भएपनि प्रत्येक सदस्यको मताधिकार समान (१ मत) हुन्छ। यद्यपि, पूँजी फिर्ताको बेला संस्थाको तरलता जोगाउन दफा ३७ को २०% सीमा अनिवार्य गरिएको हो।
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white mb-1">
                      ३. PEARLS E9 (Net Worth) तथा पूँजी पर्याप्तता
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      सेयर पूँजी सहकारीको आधारभूत कोर पूँजी (Tier 1 Equity) हो। ठूला सेयरधनीहरूले एकैपटक सेयर फिर्ता माग्दा आउन सक्ने तरलता संकटबाट जोगिन सेयर नामसारी तथा लगत कट्टामा सञ्चालक समिति निर्णय अनिवार्य छ।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
