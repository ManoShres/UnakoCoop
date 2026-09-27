import React, { useState } from 'react';
import {
  GrievanceRecord,
  GrievanceCategory,
  GrievanceSeverity,
  GrievanceStatus,
  EscalationTier,
  CorrectiveActionType,
  PrivacyMode,
  DEFAULT_GRIEVANCE_RECORDS,
  calculateGrievanceMetrics,
  checkSlaBreach,
  daysRemainingForSla,
  addInvestigationNote,
  escalateGrievance,
  resolveGrievance,
  generateHearingResolutionMinutes,
  exportGrievancesToCSV,
  CATEGORY_LABELS,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
  TIER_CONFIG,
} from '../../utils/grievanceRedressalEngine';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  ShieldAlert,
  X,
  FileSpreadsheet,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Send,
  Printer,
  Copy,
  Check,
  Search,
  BookOpen,
  ArrowUpRight,
  UserCheck,
  EyeOff,
  Building,
} from 'lucide-react';

interface GrievanceRedressalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrievanceRedressalModal: React.FC<GrievanceRedressalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguageStore();

  const [records, setRecords] = useState<GrievanceRecord[]>(DEFAULT_GRIEVANCE_RECORDS);
  const [selectedRecordId, setSelectedRecordId] = useState<string>(DEFAULT_GRIEVANCE_RECORDS[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'queue' | 'inquiry' | 'minutes' | 'guidelines'>('queue');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Investigation Note Form
  const [noteInvestigator, setNoteInvestigator] = useState('');
  const [noteAction, setNoteAction] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Escalation Form
  const [escalateTier, setEscalateTier] = useState<EscalationTier>('TIER_2_AUDIT_COMMITTEE');
  const [escalateReason, setEscalateReason] = useState('');
  const [escalatedBy, setEscalatedBy] = useState('');

  // Resolution Form
  const [decisionSummary, setDecisionSummary] = useState('');
  const [correctiveActionType, setCorrectiveActionType] = useState<CorrectiveActionType>('SYSTEM_CORRECTION');
  const [compensationAmount, setCompensationAmount] = useState<number>(0);
  const [hearingChairedBy, setHearingChairedBy] = useState('');
  const [complainantAccepted, setComplainantAccepted] = useState(true);

  // New Ticket Form Modal
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newComplainant, setNewComplainant] = useState('');
  const [newMemberNo, setNewMemberNo] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState<GrievanceCategory>('TELLER_SERVICE');
  const [newSeverity, setNewSeverity] = useState<GrievanceSeverity>('MEDIUM');
  const [newPrivacy, setNewPrivacy] = useState<PrivacyMode>('PUBLIC');
  const [newBranch, setNewBranch] = useState('गढवा मुख्य शाखा');

  // Copied state
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const metrics = calculateGrievanceMetrics(records);
  const selectedRecord = records.find((r) => r.id === selectedRecordId) || records[0];

  // Filtering records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.complainantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.branchName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExportCSV = () => {
    const csv = exportGrievancesToCSV(records);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Unako_Grievance_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddInvestigationNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !noteContent.trim() || !noteInvestigator.trim()) return;

    const updated = addInvestigationNote(selectedRecord, {
      date: new Date().toISOString().split('T')[0],
      investigator: noteInvestigator,
      action: noteAction.trim() || 'स्थलगत / स्रेस्ता छानबिन',
      notes: noteContent.trim(),
    });

    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setNoteContent('');
    setNoteAction('');
  };

  const handleEscalate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !escalateReason.trim() || !escalatedBy.trim()) return;

    const updated = escalateGrievance(selectedRecord, escalateTier, escalateReason.trim(), escalatedBy.trim());
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEscalateReason('');
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !decisionSummary.trim() || !hearingChairedBy.trim()) return;

    const updated = resolveGrievance(selectedRecord, {
      resolvedDate: new Date().toISOString().split('T')[0],
      decisionSummary: decisionSummary.trim(),
      correctiveActionType,
      compensationAmount: correctiveActionType === 'FINANCIAL_COMPENSATION' ? compensationAmount : 0,
      hearingChairedBy: hearingChairedBy.trim(),
      complainantAccepted,
    });

    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setActiveTab('minutes');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const isAnon = newPrivacy === 'ANONYMOUS_WHISTLEBLOWER';
    const newRecord: GrievanceRecord = {
      id: `grv-${Date.now()}`,
      ticketNumber: `GRV-2080-${String(records.length + 1).padStart(3, '0')}`,
      submissionDate: new Date().toISOString().split('T')[0],
      complainantName: isAnon ? 'गोप्य उजुरीकर्ता (सुरक्षित व्हिसलब्लोअर)' : (newComplainant.trim() || 'अज्ञात सदस्य'),
      memberNumber: isAnon ? undefined : (newMemberNo.trim() || undefined),
      phone: isAnon ? undefined : (newPhone.trim() || undefined),
      category: newCategory,
      severity: newSeverity,
      privacy: newPrivacy,
      title: newTitle.trim(),
      description: newDescription.trim(),
      branchName: newBranch,
      slaDeadlineDays: newSeverity === 'CRITICAL' ? 7 : 15,
      status: 'SUBMITTED',
      currentTier: 'TIER_1_OFFICER',
      investigationLogs: [
        {
          id: `log-init-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          investigator: 'दर्ता डेस्क अधिकृत',
          action: 'उजुरी दर्ता तथा प्रारम्भिक रुजु',
          notes: 'प्रणालीमा उजुरी विधिवत दर्ता भएको र सम्बन्धित अधिकारीलाई सूचित गरिएको।',
        },
      ],
    };

    setRecords((prev) => [newRecord, ...prev]);
    setSelectedRecordId(newRecord.id);
    setIsNewTicketOpen(false);
    setActiveTab('inquiry');

    // Reset fields
    setNewTitle('');
    setNewDescription('');
    setNewComplainant('');
    setNewMemberNo('');
    setNewPhone('');
  };

  const minutesText = selectedRecord ? generateHearingResolutionMinutes(selectedRecord) : '';

  const handleCopyMinutes = () => {
    navigator.clipboard.writeText(minutesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl">
              <Scale className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {t(
                    'संस्थागत गुनासो सुनुवाइ, लोकपाल तथा उजुरी छानबिन प्रणाली',
                    'Institutional Grievance Redressal, Ombudsman & Whistleblower Registry'
                  )}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  सहकारी ऐन २०७४ दफा ४९/५०
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t(
                  'लेखा सुपरिवेक्षण समिति, आन्तरिक लोकपाल तथा व्हिसलब्लोअर संरक्षण कार्यविधि अन्तर्गत आधिकारिक उजुरी व्यवस्थापन',
                  'Statutory member dispute resolution, supervisory ombudsman hearings, and anonymous whistleblower registry'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
            >
              <PlusCircle className="size-4" />
              <span>{t('नयाँ उजुरी दर्ता', 'Register Ticket')}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              <span>{t('CSV निर्यात', 'Export CSV')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Institutional Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-slate-400 font-semibold block">{t('कुल उजुरी दर्ता', 'Total Registered')}</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{metrics.totalCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('संस्था स्थापना देखि', 'All Time')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-amber-500 font-semibold block">{t('छानबिन प्रक्रियामा', 'In Inquiry / Hearing')}</span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">
              {metrics.inquiryCount + metrics.hearingScheduledCount}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('सक्रिय सुनुवाइ', 'Active Hearings')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-emerald-500 font-semibold block">{t('फर्छ्यौट दर (सफलता)', 'Resolution Rate')}</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {metrics.resolutionRatePercent}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{metrics.resolvedCount} {t('फर्छ्यौट सम्पन्न', 'Resolved')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-rose-500 font-semibold block">{t('लेखा समितिमा सिफारिस', 'Escalated Tier 2')}</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400">{metrics.escalatedCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('उच्च लोकपाल तह', 'Ombudsman')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-purple-500 font-semibold block">{t('SLA म्याद नाघेको', 'SLA Breached')}</span>
            <span className={`text-base font-black ${metrics.slaBreachCount > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
              {metrics.slaBreachCount}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('७/१५ दिन समयावधि', 'Beyond Statutory')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-blue-500 font-semibold block">{t('क्षतिपूर्ति / फिर्ता रकम', 'Total Compensation')}</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400">
              रु. {metrics.totalCompensationAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('हिसाब मिलान', 'Reconciled/Refunded')}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'queue'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="size-4" />
            <span>{t('उजुरी कार्यसूची तथा SLA ट्र्याकिङ', 'Grievance Queue & SLA')} ({records.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiry')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'inquiry'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <ShieldAlert className="size-4" />
            <span>{t('छानबिन डेस्क तथा सुनुवाइ', 'Inquiry & Hearing Desk')}</span>
          </button>

          <button
            onClick={() => setActiveTab('minutes')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'minutes'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Printer className="size-4" />
            <span>{t('आधिकारिक निर्णय पर्चा', 'Hearing Order & Minutes')}</span>
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'guidelines'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="size-4" />
            <span>{t('कानुनी व्यवस्था तथा कार्यविधि', 'Statutory Guidelines')}</span>
          </button>
        </div>

        {/* Tab 1: Queue & SLA */}
        {activeTab === 'queue' && (
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('टिकट नं, उजुरीकर्ता वा शीर्षक खोज्नुहोस्...', 'Search ticket no, complainant, subject...')}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ALL">{t('सबै श्रेणीहरू (All Categories)', 'All Categories')}</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.np}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ALL">{t('सबै अवस्था (All Statuses)', 'All Statuses')}</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.np}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3 px-4">{t('टिकट नं र मिति', 'Ticket & Date')}</th>
                    <th className="py-3 px-4">{t('उजुरीकर्ता / शाखा', 'Complainant / Branch')}</th>
                    <th className="py-3 px-4">{t('विषय तथा श्रेणी', 'Subject & Category')}</th>
                    <th className="py-3 px-3 text-center">{t('संवेदनशीलता', 'Severity')}</th>
                    <th className="py-3 px-3 text-center">{t('अवस्था', 'Status')}</th>
                    <th className="py-3 px-3 text-center">{t('SLA म्याद', 'SLA Timeline')}</th>
                    <th className="py-3 px-4 text-right">{t('कार्यवाही', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecords.map((r) => {
                    const breached = checkSlaBreach(r);
                    const remainingDays = daysRemainingForSla(r);
                    const isAnon = r.privacy === 'ANONYMOUS_WHISTLEBLOWER';

                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                          selectedRecordId === r.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-medium">
                          <span className="font-bold text-slate-900 dark:text-white block">{r.ticketNumber}</span>
                          <span className="text-[10px] text-slate-400">{r.submissionDate}</span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {isAnon ? (
                              <EyeOff className="size-3.5 text-rose-500" />
                            ) : (
                              <UserCheck className="size-3.5 text-blue-500" />
                            )}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {r.complainantName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{r.branchName}</span>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{r.title}</p>
                          <span className="text-[10px] text-slate-400 block">
                            {CATEGORY_LABELS[r.category]?.np}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${SEVERITY_CONFIG[r.severity].color}`}>
                            {SEVERITY_CONFIG[r.severity].np}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_CONFIG[r.status].badgeClass}`}>
                            {STATUS_CONFIG[r.status].np}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {r.status === 'RESOLVED' || r.status === 'DISMISSED' ? (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                              <CheckCircle2 className="size-3" />
                              {t('फर्छ्यौट सम्पन्न', 'Done')}
                            </span>
                          ) : breached ? (
                            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
                              <AlertTriangle className="size-3" />
                              {Math.abs(remainingDays)} {t('दिन नाघेको', 'd overdue')}
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                              {remainingDays} {t('दिन बाँकी', 'days left')}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedRecordId(r.id);
                              setActiveTab('inquiry');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-xl transition-colors"
                          >
                            <span>{t('छानबिन', 'Inquire')}</span>
                            <ArrowUpRight className="size-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Inquiry & Hearing Desk */}
        {activeTab === 'inquiry' && selectedRecord && (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Top Details Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedRecord.ticketNumber}: {selectedRecord.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${SEVERITY_CONFIG[selectedRecord.severity].color}`}>
                    {SEVERITY_CONFIG[selectedRecord.severity].np}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_CONFIG[selectedRecord.status].badgeClass}`}>
                    {STATUS_CONFIG[selectedRecord.status].np}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-4">
                  <span>{t('दर्ता मिति:', 'Date:')} <strong>{selectedRecord.submissionDate}</strong></span>
                  <span>{t('शाखा:', 'Branch:')} <strong>{selectedRecord.branchName}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('उजुरीकर्ता विवरण', 'Complainant Info')}</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    {selectedRecord.privacy === 'ANONYMOUS_WHISTLEBLOWER' ? (
                      <span className="text-rose-600 font-bold">{selectedRecord.complainantName}</span>
                    ) : (
                      <>
                        {selectedRecord.complainantName}
                        {selectedRecord.memberNumber && <span className="text-slate-500">({selectedRecord.memberNumber})</span>}
                      </>
                    )}
                  </span>
                  {selectedRecord.phone && <span className="text-slate-500 text-[11px] block">{selectedRecord.phone}</span>}
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">{t('उजुरीको श्रेणी', 'Category')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {CATEGORY_LABELS[selectedRecord.category]?.np}
                  </span>
                  <span className="text-slate-400 text-[10px]">{CATEGORY_LABELS[selectedRecord.category]?.en}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">{t('हालको सुनुवाइ तह', 'Current Escalation Tier')}</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 mt-0.5 block">
                    {TIER_CONFIG[selectedRecord.currentTier]?.np}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    SLA: {selectedRecord.slaDeadlineDays} {t('दिन (days)', 'days')}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                  {t('उजुरीको पूर्ण व्यहोरा (Grievance Description):', 'Full Description:')}
                </span>
                {selectedRecord.description}
              </div>
            </div>

            {/* Chronological Investigation Trail */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="size-4 text-blue-600" />
                <span>{t('छानबिन तथा अनुसन्धान अभिलेख (Investigation Log Trail)', 'Investigation Log Trail')}</span>
              </h3>

              <div className="space-y-2.5">
                {selectedRecord.investigationLogs.map((log, index) => (
                  <div
                    key={log.id || index}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{log.investigator}</span>
                      </div>
                      <span>{log.date}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-2 border-l-2 border-blue-500">
                      {log.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Inquiry Action Panels (Grid 3 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              {/* Form 1: Add Investigation Note */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Send className="size-3.5 text-blue-500" />
                  <span>{t('१. नयाँ छानबिन कैफियत थप्नुहोस्', '1. Add Inquiry Note')}</span>
                </h4>

                <form onSubmit={handleAddInvestigationNote} className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t('जाँचकर्ता / अधिकृतको नाम', 'Investigator Name')}</label>
                    <input
                      type="text"
                      required
                      value={noteInvestigator}
                      onChange={(e) => setNoteInvestigator(e.target.value)}
                      placeholder="उदा: सुमन केसी (ऋण अधिकृत)"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t('कार्यवाहीको शीर्षक', 'Action Title')}</label>
                    <input
                      type="text"
                      value={noteAction}
                      onChange={(e) => setNoteAction(e.target.value)}
                      placeholder="उदा: स्थलगत स्रेस्ता रुजु"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t('छानबिन निष्कर्ष / प्रगति विवरण', 'Inquiry Findings')}</label>
                    <textarea
                      rows={3}
                      required
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="छानबिनको संक्षिप्त निष्कर्ष लेख्नुहोस्..."
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                  >
                    {t('कैफियत सुरक्षित गर्नुहोस्', 'Save Inquiry Note')}
                  </button>
                </form>
              </div>

              {/* Form 2: Escalate Tier */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-3">
                <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <ArrowUpRight className="size-3.5 text-purple-600" />
                  <span>{t('२. उच्च तहमा सिफारिस / लोकपाल', '2. Escalate Tier')}</span>
                </h4>

                <form onSubmit={handleEscalate} className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-[10px] text-purple-800/70 dark:text-purple-300/70 block mb-1">{t('सिफारिस गरिने तह', 'Target Tier')}</label>
                    <select
                      value={escalateTier}
                      onChange={(e) => setEscalateTier(e.target.value as EscalationTier)}
                      className="w-full px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="TIER_2_AUDIT_COMMITTEE">{TIER_CONFIG.TIER_2_AUDIT_COMMITTEE.np}</option>
                      <option value="TIER_3_BOARD_REGISTRAR">{TIER_CONFIG.TIER_3_BOARD_REGISTRAR.np}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-purple-800/70 dark:text-purple-300/70 block mb-1">{t('सिफारिसकर्ता अधिकृत', 'Escalated By')}</label>
                    <input
                      type="text"
                      required
                      value={escalatedBy}
                      onChange={(e) => setEscalatedBy(e.target.value)}
                      placeholder="उदा: शाखा प्रबन्धक / अधिकृत"
                      className="w-full px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-purple-800/70 dark:text-purple-300/70 block mb-1">{t('सिफारिसको कारण तथा पृष्ठभूमि', 'Reason for Escalation')}</label>
                    <textarea
                      rows={3}
                      required
                      value={escalateReason}
                      onChange={(e) => setEscalateReason(e.target.value)}
                      placeholder="आन्तरिक लोकपाल वा लेखा समितिमा पठाउनुपर्ने कारण..."
                      className="w-full px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                  >
                    {t('लेखा समितिमा सिफारिस गर्नुहोस्', 'Escalate to Committee')}
                  </button>
                </form>
              </div>

              {/* Form 3: Official Resolution & Order */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>{t('३. औपचारिक फर्छ्यौट तथा निर्णय', '3. Resolve Grievance')}</span>
                </h4>

                <form onSubmit={handleResolve} className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-[10px] text-emerald-800/70 dark:text-emerald-300/70 block mb-1">{t('सुनुवाइ समिति संयोजक / अधिकृत', 'Hearing Chaired By')}</label>
                    <input
                      type="text"
                      required
                      value={hearingChairedBy}
                      onChange={(e) => setHearingChairedBy(e.target.value)}
                      placeholder="उदा: प्रमुख कार्यकारी अधिकृत / संयोजक"
                      className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-emerald-800/70 dark:text-emerald-300/70 block mb-1">{t('सुधारात्मक कदमको प्रकृति', 'Action Type')}</label>
                    <select
                      value={correctiveActionType}
                      onChange={(e) => setCorrectiveActionType(e.target.value as CorrectiveActionType)}
                      className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="SYSTEM_CORRECTION">प्रणाली तथा स्रेस्ता संशोधन (System Correction)</option>
                      <option value="FINANCIAL_COMPENSATION">आर्थिक क्षतिपूर्ति / रकम फिर्ता (Financial Compensation)</option>
                      <option value="ADMINISTRATIVE_WARNING">कर्मचारीलाई सचेत / कारवाही (Disciplinary Warning)</option>
                      <option value="APOLOGY_EXPLANATION">स्पष्टीकरण तथा क्षमायाचना (Formal Apology)</option>
                      <option value="NO_ACTION_REQUIRED">दाबी खारेज (Dismissed / No Action)</option>
                    </select>
                  </div>

                  {correctiveActionType === 'FINANCIAL_COMPENSATION' && (
                    <div>
                      <label className="text-[10px] text-emerald-800/70 dark:text-emerald-300/70 block mb-1">{t('स्वीकृत क्षतिपूर्ति / फिर्ता रकम (रु.)', 'Compensation Amount (NPR)')}</label>
                      <input
                        type="number"
                        min="0"
                        value={compensationAmount}
                        onChange={(e) => setCompensationAmount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-emerald-800/70 dark:text-emerald-300/70 block mb-1">{t('निर्णयको पूर्ण व्यहोरा', 'Decision Summary')}</label>
                    <textarea
                      rows={2}
                      required
                      value={decisionSummary}
                      onChange={(e) => setDecisionSummary(e.target.value)}
                      placeholder="अन्तिम सुनुवाइ निर्णय तथा आदेशको व्यहोरा..."
                      className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="acceptedCheck"
                      checked={complainantAccepted}
                      onChange={(e) => setComplainantAccepted(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="acceptedCheck" className="text-[11px] text-slate-700 dark:text-slate-300">
                      {t('उजुरीकर्ताद्वारा निर्णय स्वीकार (सहमत पत्र प्राप्त)', 'Complainant consented to order')}
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                  >
                    {t('निर्णय प्रमाणीकरण गरी फर्छ्यौट गर्नुहोस्', 'Authorize & Finalize Resolution')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Official Hearing Order & Minutes */}
        {activeTab === 'minutes' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {t('आधिकारिक लोकपाल तथा सुनुवाइ निर्णय पर्चा', 'Official Ombudsman Hearing Resolution Minutes')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t(
                    'सहकारी विभाग, लेखा समिति तथा पुनरावेदनका लागि कानुनी मान्यता प्राप्त ढाँचा',
                    'Legally binding statutory minutes format for audit committee & regulatory submission'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMinutes}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  <span>{copied ? t('कपी भयो', 'Copied') : t('कपी गर्नुहोस्', 'Copy')}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                >
                  <Printer className="size-3.5" />
                  <span>{t('प्रिन्ट गर्नुहोस्', 'Print Minutes')}</span>
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
              {minutesText}
            </div>
          </div>
        )}

        {/* Tab 4: Statutory Guidelines & Ombudsman Framework */}
        {activeTab === 'guidelines' && (
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold">
                  <Clock className="size-4" />
                  <span>तह १: गुनासो अधिकृत (SLA: ७–१५ दिन)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  काउन्टर सेवा, ब्याज हिसाब विवाद, र सामान्य कर्जा सम्बन्धी उजुरीहरू अधिकृत वा शाखा प्रमुखद्वारा १५ दिनभित्र प्रारम्भिक फर्छ्यौट गरिनुपर्दछ।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 space-y-2">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                  <Scale className="size-4" />
                  <span>तह २: लेखा सुपरिवेक्षण समिति (SLA: ३० दिन)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  तह १ बाट समाधान हुन नसकेको वा कर्मचारी/सञ्चालक विरुद्ध परेका गम्भीर उजुरीहरूको सुनुवाइ स्वायत्त आन्तरिक लोकपालका रूपमा लेखा समितिले गर्दछ।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
                  <ShieldAlert className="size-4" />
                  <span>तह ३: सञ्चालक समिति वा रजिष्ट्रार</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  सहकारी ऐन २०७४ बमोजिम आन्तरिक तहमा सहमति हुन नसकेमा सदस्यलाई जिल्ला सहकारी संघ, रजिष्ट्रार कार्यालय वा कानुनी अदालतमा जाने पूर्ण अधिकार छ।
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <EyeOff className="size-4 text-emerald-600" />
                <span>सुरक्षित व्हिसलब्लोअर तथा उजुरीकर्ता संरक्षण नीति (Whistleblower Protection)</span>
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                सहकारी संस्थामा आर्थिक अनियमितता, भ्रष्टाचार वा आचारसंहिता उल्लंघन सम्बन्धी जानकारी दिने सदस्य वा कर्मचारीको पहिचान पूर्णतः गोप्य राखिनेछ। व्हिसलब्लोअर विरुद्ध कुनै पनि किसिमको पूर्वाग्रहपूर्ण वा प्रतिशोधात्मक कारवाही गर्न कानुनी रूपमा निषेध गरिएको छ।
              </p>
            </div>
          </div>
        )}

        {/* Modal: New Ticket Registration */}
        {isNewTicketOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <PlusCircle className="size-4 text-blue-600" />
                  <span>{t('नयाँ उजुरी / गुनासो दर्ता फारम', 'Register Grievance Ticket')}</span>
                </h3>
                <button
                  onClick={() => setIsNewTicketOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">{t('गोपनीयता स्तर (Privacy Mode)', 'Privacy Mode')}</label>
                  <select
                    value={newPrivacy}
                    onChange={(e) => setNewPrivacy(e.target.value as PrivacyMode)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="PUBLIC">सार्वजनिक (Public - सामान्य उजुरीकर्ता)</option>
                    <option value="CONFIDENTIAL">गोप्य (Confidential - सीमित अधिकृतलाई मात्र)</option>
                    <option value="ANONYMOUS_WHISTLEBLOWER">व्हिसलब्लोअर (Anonymous Whistleblower - पहिचान पूर्ण गोप्य)</option>
                  </select>
                </div>

                {newPrivacy !== 'ANONYMOUS_WHISTLEBLOWER' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">{t('उजुरीकर्ताको नाम', 'Name')}</label>
                      <input
                        type="text"
                        required
                        value={newComplainant}
                        onChange={(e) => setNewComplainant(e.target.value)}
                        placeholder="सदस्यको नाम"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">{t('सदस्य नम्बर', 'Member No')}</label>
                      <input
                        type="text"
                        value={newMemberNo}
                        onChange={(e) => setNewMemberNo(e.target.value)}
                        placeholder="M-XXXX"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t('गुनासोको श्रेणी', 'Category')}</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as GrievanceCategory)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v.np}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t('संवेदनशीलता', 'Severity')}</label>
                    <select
                      value={newSeverity}
                      onChange={(e) => setNewSeverity(e.target.value as GrievanceSeverity)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="LOW">न्यून (Low)</option>
                      <option value="MEDIUM">मध्यम (Medium)</option>
                      <option value="HIGH">उच्च (High)</option>
                      <option value="CRITICAL">अति-गम्भीर (Critical)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{t('सम्बन्धित शाखा / सेवा केन्द्र', 'Branch')}</label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="गढवा मुख्य शाखा">गढवा मुख्य शाखा</option>
                    <option value="लमही सेवा केन्द्र">लमही सेवा केन्द्र</option>
                    <option value="भालुवाङ सेवा केन्द्र">भालुवाङ सेवा केन्द्र</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{t('विषय (Subject)', 'Subject')}</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="उजुरीको छोटो विषय..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{t('विस्तृत व्यहोरा तथा माग', 'Description')}</label>
                  <textarea
                    rows={4}
                    required
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="घटना, मिति, रकम तथा मागको पूर्ण विवरण..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewTicketOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    {t('रद्द गर्नुहोस्', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                  >
                    {t('दर्ता गर्नुहोस्', 'Register Ticket')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
