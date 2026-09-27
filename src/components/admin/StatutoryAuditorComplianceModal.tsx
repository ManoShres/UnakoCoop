import React, { useState, useMemo } from 'react';
import {
  AuditorProfile,
  StatutoryAuditCheckPoint,
  ManagementLetterItem,
  DEFAULT_AUDITOR_PROFILE,
  DEFAULT_STATUTORY_CHECKPOINTS,
  DEFAULT_MANAGEMENT_LETTER_ITEMS,
  AUDITOR_CATEGORY_LABELS,
  OPINION_LABELS,
  validateAuditorEligibility,
  calculateAuditEngagementSummary,
  generateAuditorAppointmentLetter,
  exportAuditComplianceToCSV,
} from '../../utils/auditorComplianceEngine';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  FileCheck2,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Users,
  Search,
  Scale,
  Award,
  Copy,
  Check,
  Building,
  ShieldCheck,
  Clock,
  Sparkles,
  FileText,
  BadgeAlert,
} from 'lucide-react';

interface StatutoryAuditorComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatutoryAuditorComplianceModal: React.FC<StatutoryAuditorComplianceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'CHECKPOINTS' | 'PROFILE' | 'MANAGEMENT_LETTER' | 'LETTER'>('CHECKPOINTS');
  const [auditor, setAuditor] = useState<AuditorProfile>(DEFAULT_AUDITOR_PROFILE);
  const [checkpoints, setCheckpoints] = useState<StatutoryAuditCheckPoint[]>(DEFAULT_STATUTORY_CHECKPOINTS);
  const [managementLetter, setManagementLetter] = useState<ManagementLetterItem[]>(DEFAULT_MANAGEMENT_LETTER_ITEMS);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [checkpointStatusFilter, setCheckpointStatusFilter] = useState<'ALL' | 'COMPLIANT' | 'MINOR_OBSERVATION' | 'MAJOR_DEFICIENCY'>('ALL');

  // Copied text state
  const [copiedText, setCopiedText] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const summary = useMemo(() => {
    return calculateAuditEngagementSummary({
      fiscalYear: auditor.fiscalYear,
      auditor,
      checkpoints,
      managementLetterItems: managementLetter,
    });
  }, [auditor, checkpoints, managementLetter]);

  const eligibility = useMemo(() => {
    return validateAuditorEligibility(auditor);
  }, [auditor]);

  const filteredCheckpoints = useMemo(() => {
    return checkpoints.filter((c) => {
      const matchSearch =
        c.titleNepali.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.legalReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.categoryNepali.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = checkpointStatusFilter === 'ALL' || c.status === checkpointStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [checkpoints, searchQuery, checkpointStatusFilter]);

  const handleUpdateCheckPointStatus = (id: string, newStatus: StatutoryAuditCheckPoint['status']) => {
    setCheckpoints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    showToastMsg(t('परीक्षण बुँदाको अवस्था अद्यावधिक गरियो!', 'Audit checkpoint status updated!'));
  };

  const handleUpdateMlStatus = (id: string, newStatus: ManagementLetterItem['status']) => {
    setManagementLetter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    showToastMsg(t('कैफियत समाधान अवस्था अद्यावधिक भयो!', 'Management letter resolution updated!'));
  };

  const handleExportCSV = () => {
    const csv = exportAuditComplianceToCSV(checkpoints, summary);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Unako_Statutory_Audit_Report_${auditor.fiscalYear.replace('/', '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastMsg(t('वैधानिक लेखापरीक्षण विवरण CSV डाउनलोड भयो!', 'Audit compliance report exported!'));
  };

  const appointmentLetterText = useMemo(() => {
    return generateAuditorAppointmentLetter(auditor);
  }, [auditor]);

  const handleCopyAppointmentLetter = () => {
    navigator.clipboard.writeText(appointmentLetterText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    showToastMsg(t('नियुक्ति पत्र क्लिपबोर्डमा प्रतिलिपि भयो!', 'Appointment letter copied!'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-blue-400 mb-1">
              <FileCheck2 className="size-4" />
              <span>{t('सहकारी ऐन २०७४, दफा ८७ र ८८ वैधानिक लेखापरीक्षण', 'Cooperative Act 2074 Sec 87 & 88 Statutory Audit')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t('बाह्य लेखापरीक्षक नियुक्ति, अनुपालन तथा व्यवस्थापन पत्र प्रणाली', 'Auditor Appointment & Audit Compliance')}
            </h2>
            <p className="text-xs text-blue-200/90 mt-0.5 max-w-2xl">
              {t(
                'साधारण सभाबाट लेखापरीक्षक नियुक्ति (अधिकतम ३ वर्ष रोटेसन), दफा ८८ का १० बाध्यात्मक परीक्षण क्षेत्र र व्यवस्थापन पत्र अनुगमन।',
                'Manage AGM auditor appointment (3-year rotation rule), Section 88 audit checklist, and management letter.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold transition shadow-sm cursor-pointer"
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
              {t('बहालवाला लेखापरीक्षक', 'Current Auditor')}
            </span>
            <div className="text-sm font-black text-slate-900 dark:text-white truncate" title={auditor.firmName}>
              {auditor.firmName.split(',')[0]}
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
              {auditor.leadAuditorName}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('कार्यकाल (३ वर्ष सीमा)', 'Tenure (Sec 87)')}
            </span>
            <div className="text-base font-black text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
              <span>{auditor.consecutiveYearsServed} / ३ वर्ष</span>
              {auditor.consecutiveYearsServed >= 3 ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  परिवर्तन अनिवार्य
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  योग्य
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500">
              लगातार कार्यकाल सीमा
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('लेखापरीक्षण राय (Opinion)', 'Audit Opinion')}
            </span>
            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 truncate">
              {OPINION_LABELS[summary.auditOpinion]?.ne.split('(')[0] || summary.auditOpinion}
            </div>
            <span className="text-[10px] text-slate-500">
              ICAN NAS मापदण्ड
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('वैधानिक अनुपालन अङ्क', 'Compliance Score')}
            </span>
            <div className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {summary.auditScorePercent}%
            </div>
            <span className="text-[10px] text-slate-500">
              १० बाध्यात्मक क्षेत्र परीक्षण
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('व्यवस्थापन पत्र कैफियत', 'Management Letter')}
            </span>
            <div className="text-base font-black text-slate-900 dark:text-white font-mono">
              {managementLetter.length} वटा
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              {summary.highRiskCount} High • {summary.mediumRiskCount} Med • {summary.lowRiskCount} Low
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
          <button
            onClick={() => setActiveTab('CHECKPOINTS')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CHECKPOINTS'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>{t('दफा ८८ बाध्यात्मक परीक्षण क्षेत्र (१० बुँदा)', 'Statutory Checklist (Sec 88)')}</span>
          </button>

          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PROFILE'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <RotateCw className="size-4" />
            <span>{t('दफा ८७ लेखापरीक्षक नियुक्ति तथा रोटेसन', 'Auditor Appointment & Rotation')}</span>
          </button>

          <button
            onClick={() => setActiveTab('MANAGEMENT_LETTER')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'MANAGEMENT_LETTER'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="size-4" />
            <span>{t('व्यवस्थापन पत्र तथा सुधारात्मक कार्ययोजना', 'Management Letter & Remediation')} ({managementLetter.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('LETTER')}
            className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'LETTER'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Award className="size-4" />
            <span>{t('औपचारिक नियुक्ति पत्र (Appointment Letter)', 'Appointment Letter')}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: STATUTORY CHECKLIST (SECTION 88) */}
          {activeTab === 'CHECKPOINTS' && (
            <div className="space-y-4">
              {/* Filter and Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('परीक्षण बुँदा वा कानुनी दफा खोज्नुहोस्...', 'Search checkpoint or legal ref...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={checkpointStatusFilter}
                    onChange={(e) => setCheckpointStatusFilter(e.target.value as any)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <option value="ALL">{t('सबै परीक्षण बुँदाहरू (All Points)', 'All Points')}</option>
                    <option value="COMPLIANT">{t('अनुकूल / दुरुस्त (Compliant)', 'Compliant')}</option>
                    <option value="MINOR_OBSERVATION">{t('सामान्य कैफियत (Minor Observation)', 'Minor Observation')}</option>
                    <option value="MAJOR_DEFICIENCY">{t('गम्भीर त्रुटि (Major Deficiency)', 'Major Deficiency')}</option>
                  </select>
                </div>
              </div>

              {/* Checkpoint Cards */}
              <div className="space-y-3">
                {filteredCheckpoints.map((chk) => (
                  <div
                    key={chk.id}
                    className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {chk.pointNumber}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                          {chk.categoryNepali}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {chk.legalReference}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {chk.titleNepali}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {chk.auditorRemarks}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={chk.status}
                        onChange={(e) => handleUpdateCheckPointStatus(chk.id, e.target.value as any)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                          chk.status === 'COMPLIANT'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                            : chk.status === 'MINOR_OBSERVATION'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300'
                        }`}
                      >
                        <option value="COMPLIANT">✓ पूर्ण अनुकूल (Compliant)</option>
                        <option value="MINOR_OBSERVATION">⚠️ सामान्य कैफियत (Minor)</option>
                        <option value="MAJOR_DEFICIENCY">❌ गम्भीर त्रुटि (Major)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: AUDITOR PROFILE & ROTATION (SECTION 87) */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Rotation & Eligibility Alerts */}
              {!eligibility.isEligible && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                    <BadgeAlert className="size-4 text-rose-500" />
                    <span>{t('दफा ८७ वैधानिक अयोग्यता चेतावनी (Statutory Disqualification)', 'Disqualification Alert')}</span>
                  </div>
                  <ul className="text-xs text-rose-700 dark:text-rose-400 space-y-1 pl-4 list-disc">
                    {eligibility.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {eligibility.warnings.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 space-y-1">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <AlertTriangle className="size-4 text-amber-500" />
                    <span>{t('रोटेसन पूर्व-सूचना (Tenure Warning)', 'Tenure Warning')}</span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {eligibility.warnings[0]}
                  </p>
                </div>
              )}

              {/* Form */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCw className="size-5 text-blue-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('लेखापरीक्षक प्रोफाइल तथा साधारण सभा नियुक्ति विवरण', 'Auditor Profile & Appointment Particulars')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('लेखापरीक्षण फर्मको नाम', 'Audit Firm Name')} *
                    </label>
                    <input
                      type="text"
                      value={auditor.firmName}
                      onChange={(e) => setAuditor({ ...auditor, firmName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('प्रमुख लेखापरीक्षकको नाम', 'Lead Auditor Name')} *
                    </label>
                    <input
                      type="text"
                      value={auditor.leadAuditorName}
                      onChange={(e) => setAuditor({ ...auditor, leadAuditorName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('ICAN प्रमाणपत्र नं (COP Registration)', 'ICAN COP Registration No')} *
                    </label>
                    <input
                      type="text"
                      value={auditor.icanRegistrationNo}
                      onChange={(e) => setAuditor({ ...auditor, icanRegistrationNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('लेखापरीक्षक वर्गीकरण (Category)', 'Auditor Category')}
                    </label>
                    <select
                      value={auditor.category}
                      onChange={(e) => setAuditor({ ...auditor, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    >
                      {Object.entries(AUDITOR_CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.ne}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('लगातार कार्यकाल संख्या (दफा ८७ - अधिकतम ३ वर्ष)', 'Consecutive Years Served')}
                    </label>
                    <select
                      value={auditor.consecutiveYearsServed}
                      onChange={(e) => setAuditor({ ...auditor, consecutiveYearsServed: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold font-mono"
                    >
                      <option value={1}>१ वर्ष (पहिलो कार्यकाल - First Year)</option>
                      <option value={2}>२ वर्ष (दोस्रो कार्यकाल - Second Year)</option>
                      <option value={3}>३ वर्ष (अन्तिम कार्यकाल - Third Final Year)</option>
                      <option value={4}>४ वर्ष (अयोग्य - उल्लङ्घन Disqualified)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('स्वीकृत लेखापरीक्षण पारिश्रमिक (रु)', 'Approved Audit Fee')}
                    </label>
                    <input
                      type="number"
                      value={auditor.auditFeeApproved}
                      onChange={(e) => setAuditor({ ...auditor, auditFeeApproved: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold font-mono text-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('साधारण सभा नियुक्ति मिति (वि.सं.)', 'AGM Appointment Date')}
                    </label>
                    <input
                      type="text"
                      value={auditor.agmAppointmentDateNepali}
                      onChange={(e) => setAuditor({ ...auditor, agmAppointmentDateNepali: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      {t('साधारण सभा निर्णय नं.', 'AGM Minute Resolution No')}
                    </label>
                    <input
                      type="text"
                      value={auditor.agmMinuteNo}
                      onChange={(e) => setAuditor({ ...auditor, agmMinuteNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => showToastMsg(t('लेखापरीक्षक नियुक्ति विवरण सुरक्षित गरियो!', 'Auditor profile updated!'))}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    विवरण सुरक्षित गर्नुहोस्
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGEMENT LETTER */}
          {activeTab === 'MANAGEMENT_LETTER' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('व्यवस्थापन पत्र तथा आन्तरिक नियन्त्रण सुधार कार्ययोजना', 'Management Letter Observations')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('लेखापरीक्षक द्वारा औंल्याइएका प्राविधिक कैफियत र संस्थागत समाधान प्रतिबद्धता।', 'Observations and management action plan.')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {managementLetter.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.severity === 'HIGH'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : item.severity === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {item.severity} RISK
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            लक्ष्य मिति: {item.targetResolutionDateNepali}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                      </div>

                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateMlStatus(item.id, e.target.value as any)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          item.status === 'RESOLVED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                            : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300'
                        }`}
                      >
                        <option value="OPEN">बाँकी (Open)</option>
                        <option value="IN_PROGRESS">सञ्चालनमा (In Progress)</option>
                        <option value="RESOLVED">✓ समाधान भयो (Resolved)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                      <div>
                        <span className="font-semibold text-slate-500 block mb-0.5">१. लेखापरीक्षकको कैफियत (Observation):</span>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">{item.auditorObservation}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500 block mb-0.5">२. सुझाव (Recommendation):</span>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">{item.auditorRecommendation}</p>
                      </div>
                    </div>

                    <div className="text-xs bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50">
                      <span className="font-semibold text-blue-900 dark:text-blue-200 block mb-0.5">
                        ३. व्यवस्थापनको जवाफ तथा कार्ययोजना ({item.responsibleOfficer}):
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">{item.managementResponse}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: APPOINTMENT LETTER */}
          {activeTab === 'LETTER' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="flex justify-end">
                <button
                  onClick={handleCopyAppointmentLetter}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  {copiedText ? <Check className="size-4" /> : <Copy className="size-4" />}
                  <span>{copiedText ? 'प्रतिलिपि भयो' : 'नियुक्ति पत्र कपी गर्नुहोस्'}</span>
                </button>
              </div>

              {/* Official Letter Canvas */}
              <div className="relative p-6 sm:p-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-200">
                {appointmentLetterText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
