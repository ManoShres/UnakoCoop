import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { Notice } from '../../types';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  Megaphone,
  PlusCircle,
  Calendar,
  UserCheck,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Clock,
  Phone,
  Building,
  Smartphone,
  Users,
  Scale,
  GitMerge,
  Vote,
  BookOpen,
} from 'lucide-react';
import { SmsBroadcastModal } from '../../components/admin/SmsBroadcastModal';
import { AgmAttendanceRosterModal } from '../../components/admin/AgmAttendanceRosterModal';
import { SupervisoryAuditModal } from '../../components/admin/SupervisoryAuditModal';
import { CoopMergerConsolidationModal } from '../../components/admin/CoopMergerConsolidationModal';
import { AgmElectionPortalModal } from '../../components/admin/AgmElectionPortalModal';
import { BoardMinuteLedgerModal } from '../../components/admin/BoardMinuteLedgerModal';

export function AnnouncementsGovernancePage() {
  const { t } = useLanguageStore();
  const {
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    agmDetails,
    updateAgmDetails,
    fieldOfficers,
    updateFieldOfficer,
    members,
    coopSettings,
  } = useCoopStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [showAgmModal, setShowAgmModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showSupervisoryModal, setShowSupervisoryModal] = useState(false);
  const [showMergerModal, setShowMergerModal] = useState(false);
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [showMinuteModal, setShowMinuteModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // New Notice state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeTitleNepali, setNoticeTitleNepali] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'AGM' | 'FESTIVAL' | 'DIVIDEND' | 'POLICY' | 'GENERAL'>('AGM');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeUrgent, setNoticeUrgent] = useState(true);

  // AGM form state
  const [agmVenue, setAgmVenue] = useState(agmDetails.venue);
  const [agmDateNe, setAgmDateNe] = useState(agmDetails.dateNepali);
  const [agmTime, setAgmTime] = useState(agmDetails.time);
  const [agmDelegates, setAgmDelegates] = useState(agmDetails.totalDelegates);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle) return;
    addNotice({
      title: noticeTitle,
      titleNepali: noticeTitleNepali || noticeTitle,
      category: noticeCategory,
      content: noticeContent,
      isUrgent: noticeUrgent,
      isActive: true,
    });
    showToastMsg(t('आधिकारिक सूचना प्रकाशित भयो! सदस्य पोर्टलमा तुरुन्त देखिनेछ।', 'Official notice published! Visible on member portal ticker.'));
    setShowAddModal(false);
    setNoticeTitle('');
    setNoticeTitleNepali('');
    setNoticeContent('');
  };

  const handleUpdateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice) return;
    updateNotice(editingNotice.id, {
      title: editingNotice.title,
      titleNepali: editingNotice.titleNepali,
      category: editingNotice.category,
      content: editingNotice.content,
      isUrgent: editingNotice.isUrgent,
      isActive: editingNotice.isActive,
    });
    showToastMsg(t('सूचना सफलतापूर्वक अद्यावधिक भयो!', 'Notice updated successfully!'));
    setEditingNotice(null);
  };

  const handleSaveAgm = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgmDetails({
      venue: agmVenue,
      dateNepali: agmDateNe,
      time: agmTime,
      totalDelegates: agmDelegates,
    });
    showToastMsg(t('साधारण सभा विवरण सफलतापूर्वक सुरक्षित भयो!', 'AGM Governance details updated!'));
    setShowAgmModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
            <Megaphone className="size-4" />
            <span>{t('सञ्चार तथा संस्थागत सुशासन व्यवस्थापन', 'COMMUNICATIONS & GOVERNANCE CMS')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('सूचना तथा संस्थागत सुशासन मोड्युल', 'Announcements & Governance Module')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'सदस्य ड्यासबोर्डमा आधिकारिक सूचना प्रसारण, साधारण सभा कार्यतालिका र सहजकर्ता परिचालन व्यवस्थापन।',
              'Broadcast official notices to the member dashboard ticker, manage AGM schedule, and maintain field officer assignments.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowMinuteModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            type="button"
            title={t(
              'सहकारी ऐन २०७४ दफा ४१, ४२, ४३ बमोजिम सञ्चालक समिति निर्णय पुस्तिका तथा बैठक भत्ता लेजर',
              'Board of Directors Minute Book, Quorum & Meeting Allowance Ledger'
            )}
          >
            <BookOpen className="size-4" />
            <span>{t('सञ्चालक बैठक (Minute Book)', 'Board Minute Book')}</span>
          </button>
          <button
            onClick={() => setShowElectionModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            type="button"
          >
            <Vote className="size-4" />
            <span>{t('निर्वाचन आयोग तथा मतदान', 'Election Commission & Voting')}</span>
          </button>
          <button
            onClick={() => setShowMergerModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            type="button"
          >
            <GitMerge className="size-4" />
            <span>{t('सहकारी एकीकरण (Merger)', 'Coop Merger')}</span>
          </button>
          <button
            onClick={() => setShowSupervisoryModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            type="button"
          >
            <Scale className="size-4" />
            <span>{t('लेखा सुपरीवेक्षण समिति (Audit)', 'Supervisory Audit')}</span>
          </button>
          <button
            onClick={() => setShowSmsModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            type="button"
          >
            <Smartphone className="size-4" />
            <span>{t('SMS / WhatsApp प्रसारण', 'SMS & WhatsApp Broadcast')}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            type="button"
          >
            <PlusCircle className="size-4" />
            <span>{t('+ नयाँ सूचना प्रकाशन', '+ Publish New Notice')}</span>
          </button>
        </div>
      </div>

      {/* Official Notice Ticker Manager */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('सक्रिय सूचना पाटी (सदस्य टिकर)', 'Active Notice Board (Member Ticker)')}
            </h3>
            <p className="text-xs text-slate-400">
              {t(
                'सक्रिय सूचनाहरू सदस्य ड्यासबोर्डको शीर्ष ब्यानरमा तुरुन्तै प्रसारण हुन्छन्',
                'Notices marked Active appear in real-time across member dashboard announcement banners'
              )}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {notices.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                    {n.category}
                  </span>
                  {n.isUrgent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                      {t('अति जरुरी सूचना', 'URGENT NOTICE')}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">{t('प्रकाशित मिति:', 'Published:')} {n.publishedDate}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{n.content}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    updateNotice(n.id, { isActive: !n.isActive });
                    showToastMsg(
                      t(
                        `सूचना ${n.isActive ? 'निष्क्रिय' : 'सक्रिय'} गरियो!`,
                        `Notice ${n.isActive ? 'deactivated' : 'activated'}!`
                      )
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    n.isActive
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                  }`}
                >
                  {n.isActive ? t('लाइभ टिकर', 'LIVE TICKER') : t('निष्क्रिय', 'INACTIVE')}
                </button>
                <button
                  onClick={() => setEditingNotice(n)}
                  className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title={t('सूचना सम्पादन', 'Edit Notice')}
                >
                  <Edit className="size-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(t('के तपाईं यो आधिकारिक सूचना मेटाउन चाहनुहुन्छ?', 'Delete this official notice?'))) {
                      deleteNotice(n.id);
                      showToastMsg(t('सूचना हटाइयो।', 'Notice deleted.'));
                    }
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title={t('सूचना मेटाउनुहोस्', 'Delete Notice')}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AGM Details Card & Field Officers Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AGM Governance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="size-4 text-emerald-500" />
                <span>{t('साधारण सभा सुशासन तथा प्रतिनिधि व्यवस्थापन', 'AGM Governance & Delegate Settings')}</span>
              </h3>
              <p className="text-xs text-slate-400">{agmDetails.edition}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowRosterModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Users className="size-3.5" />
                <span>{t('उपस्थिति तथा गणपूरक', 'Roster & Quorum')}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAgmModal(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
              >
                {t('व्यवस्थापन', 'Configure')}
              </button>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span className="font-medium">{t('तोकिएको मिति:', 'Scheduled Date:')}</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">{agmDetails.dateNepali} ({agmDetails.dateEnglish})</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t('समय:', 'Time:')}</span>
              <span className="font-bold text-slate-900 dark:text-white">{agmDetails.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t('स्थान / सभा हल:', 'Venue:')}</span>
              <span className="font-bold text-slate-900 dark:text-white text-right max-w-[60%]">{agmDetails.venue}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{t('कुल सेयरधनी प्रतिनिधिहरू:', 'Total Shareholder Delegates:')}</span>
              <span className="font-bold text-emerald-600 font-mono">{agmDetails.totalDelegates} {t('योग्य मतदाता', 'Eligible Voters')}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="font-medium">{t('डिजिटल क्युआर गेट स्क्यानर:', 'Digital QR Pass Gate Scanner:')}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                {t('सक्रिय', 'ACTIVE')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="font-medium">{t('वैधानिक गणपूरक संख्या (दफा ३९):', 'Statutory Quorum (Sec 39):')}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] font-bold">
                {t('५१% गणपूरक पुगेको', '51% Quorum Achieved')}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Field Officers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="size-4 text-blue-500" />
                <span>{t('तोकिएका सहकारी सहजकर्ता निर्देशिका', 'Assigned Field Officers Directory')}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {t('सदस्य सेवा डेस्क तथा घरदैलो वित्तीय सहजकर्ताहरू', 'Cooperative desk and home visit facilitators')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {fieldOfficers.map((fo) => (
              <div key={fo.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl overflow-hidden bg-emerald-50 shrink-0 border border-emerald-500/20">
                    <img src={fo.avatarUrl} alt={fo.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{fo.name}</div>
                    <div className="text-[11px] text-slate-500">{fo.role}</div>
                    <div className="text-[10px] text-emerald-600 font-mono">{t('फोन:', 'Tel:')} {fo.phone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{t('कार्यक्षेत्र:', 'Assigned:')}</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{fo.assignedWards.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PUBLISH NOTICE MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">{t('नयाँ आधिकारिक सूचना प्रकाशन', 'Publish New Official Notice')}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('शीर्षक (अंग्रेजीमा) *', 'Headline (English) *')}
                </label>
                <input
                  type="text"
                  placeholder={t('जस्तै: ३१औं साधारण सभा मिति तथा स्थान', 'e.g. 31st AGM Scheduled - Venue Details')}
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('शीर्षक (नेपालीमा)', 'Headline (Nepali)')}
                </label>
                <input
                  type="text"
                  placeholder={t('जस्तै: ३१औं वार्षिक साधारण सभा सम्बन्धी सूचना', 'e.g. 31st AGM Notice')}
                  value={noticeTitleNepali}
                  onChange={(e) => setNoticeTitleNepali(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('श्रेणी', 'Category')}
                  </label>
                  <select
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="AGM">{t('साधारण सभा', 'AGM General Meeting')}</option>
                    <option value="POLICY">{t('नीति तथा अनुदान', 'Policy & Subsidy')}</option>
                    <option value="DIVIDEND">{t('लाभांश वितरण', 'Dividend Payout')}</option>
                    <option value="FESTIVAL">{t('चाडपर्व / बिदा', 'Festival / Holiday')}</option>
                    <option value="GENERAL">{t('सामान्य सूचना', 'General Notice')}</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noticeUrgent}
                      onChange={(e) => setNoticeUrgent(e.target.checked)}
                      className="size-4 rounded accent-rose-600"
                    />
                    <span className="text-xs font-bold text-rose-600">{t('अति जरुरी चिन्ह लगाउनुहोस्', 'Mark as Urgent')}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('सूचनाको विस्तृत व्यहोरा', 'Full Notice Content')}
                </label>
                <textarea
                  placeholder={t(
                    'सदस्यहरूका लागि विस्तृत विवरण, दिशानिर्देश वा निर्देशनहरू...',
                    'Detailed notice text, guidelines, or instructions for members...'
                  )}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs h-24"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('सूचना प्रकाशन गर्नुहोस्', 'Publish Notice')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT NOTICE MODAL */}
      {editingNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setEditingNotice(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">{t('सूचना सम्पादन', 'Edit Notice')}</h3>
              <button onClick={() => setEditingNotice(null)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateNotice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('शीर्षक (अंग्रेजीमा)', 'Headline (English)')}
                </label>
                <input
                  type="text"
                  value={editingNotice.title}
                  onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('सूचना व्यहोरा', 'Content')}
                </label>
                <textarea
                  value={editingNotice.content}
                  onChange={(e) => setEditingNotice({ ...editingNotice, content: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs h-24"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('अति जरुरी सूचना ब्याच', 'Urgent Notice Badge')}
                </span>
                <input
                  type="checkbox"
                  checked={editingNotice.isUrgent}
                  onChange={(e) => setEditingNotice({ ...editingNotice, isUrgent: e.target.checked })}
                  className="size-4 rounded accent-rose-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNotice(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('परिवर्तन सुरक्षित गर्नुहोस्', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AGM MODAL */}
      {showAgmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowAgmModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">
                {t('३१औं वार्षिक साधारण सभा कार्यतालिका निर्धारण', 'Configure 31st AGM Schedule')}
              </h3>
              <button onClick={() => setShowAgmModal(false)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAgm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('नेपाली मिति', 'Nepali Date')}
                </label>
                <input
                  type="text"
                  value={agmDateNe}
                  onChange={(e) => setAgmDateNe(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('समय', 'Time')}
                </label>
                <input
                  type="text"
                  value={agmTime}
                  onChange={(e) => setAgmTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('स्थान / सभा हल', 'Hall / Venue')}
                </label>
                <input
                  type="text"
                  value={agmVenue}
                  onChange={(e) => setAgmVenue(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('कुल प्रतिनिधि संख्या', 'Total Delegates')}
                </label>
                <input
                  type="number"
                  value={agmDelegates}
                  onChange={(e) => setAgmDelegates(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAgmModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('कार्यतालिका सुरक्षित गर्नुहोस्', 'Save Schedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMS & WhatsApp Broadcast Modal */}
      <SmsBroadcastModal
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
      />

      {/* AGM Attendance & Proxy Roster Modal */}
      <AgmAttendanceRosterModal
        isOpen={showRosterModal}
        onClose={() => setShowRosterModal(false)}
        agmDetails={agmDetails}
        members={members}
        coopSettings={coopSettings}
      />

      {/* Supervisory Committee Internal Audit Modal */}
      <SupervisoryAuditModal
        isOpen={showSupervisoryModal}
        onClose={() => setShowSupervisoryModal(false)}
      />

      {/* Cooperative Merger, Amalgamation & Balance Sheet Consolidation Modal */}
      <CoopMergerConsolidationModal
        isOpen={showMergerModal}
        onClose={() => setShowMergerModal(false)}
      />

      {/* AGM Digital Voting, Election Commission Portal & Quorum Ledger Modal */}
      <AgmElectionPortalModal
        isOpen={showElectionModal}
        onClose={() => setShowElectionModal(false)}
      />

      {/* Board of Directors & Supervisory Committee Minute Book & Allowance Modal */}
      <BoardMinuteLedgerModal
        isOpen={showMinuteModal}
        onClose={() => setShowMinuteModal(false)}
      />
    </div>
  );
}
