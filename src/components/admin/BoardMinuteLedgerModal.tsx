import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  PlusCircle,
  FileText,
  Percent,
  Clock,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  BoardMeetingRecord,
  BoardMemberItem,
  DEFAULT_UNAKO_BOARD,
  createBoardMeetingRecord,
  generateResolutionExtractHtml,
  downloadMeetingAllowanceCsv,
  STATUTORY_QUORUM_PERCENT,
  MEETING_ALLOWANCE_TDS_RATE,
} from '../../utils/boardMinuteEngine';

interface BoardMinuteLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BoardMinuteLedgerModal: React.FC<BoardMinuteLedgerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtCount, fmtPercent } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'AGENDAS' | 'ATTENDANCE' | 'ALLOWANCE' | 'EXTRACT'>('AGENDAS');

  // Baseline sample meetings
  const [meetings, setMeetings] = useState<BoardMeetingRecord[]>(() => {
    const initialMeeting = createBoardMeetingRecord({
      id: 'MTG-142',
      meetingNumber: 142,
      committeeType: 'BOARD_OF_DIRECTORS',
      dateNepali: '2081-06-11',
      dateGregorian: '2024-09-27',
      startTime: '11:00 AM',
      endTime: '02:30 PM',
      venue: 'उनको केन्द्रीय कार्यालय, सञ्चालक समिति सभाकक्ष, गढवा-५, दाङ',
      chairpersonName: 'मनोज कुमार शर्मा',
      secretaryName: 'भोजराज थापा',
      totalBoardSeats: 7,
      attendances: [
        {
          memberId: 'DIR-01',
          status: 'PRESENT',
          hasConflictOfInterest: false,
          grossAllowance: 2000,
          tdsAmount: 300,
          netAllowance: 1700,
        },
        {
          memberId: 'DIR-02',
          status: 'PRESENT',
          hasConflictOfInterest: false,
          grossAllowance: 1500,
          tdsAmount: 225,
          netAllowance: 1275,
        },
        {
          memberId: 'DIR-03',
          status: 'PRESENT',
          hasConflictOfInterest: false,
          grossAllowance: 1800,
          tdsAmount: 270,
          netAllowance: 1530,
        },
        {
          memberId: 'DIR-04',
          status: 'PRESENT',
          hasConflictOfInterest: true,
          conflictReason: 'ऋण प्रस्तावक आफन्त रहेकोले स्वघोषणा गरी छलफलमा भाग नलिएको',
          grossAllowance: 1800,
          tdsAmount: 270,
          netAllowance: 1530,
        },
        {
          memberId: 'DIR-05',
          status: 'PRESENT',
          hasConflictOfInterest: false,
          grossAllowance: 1500,
          tdsAmount: 225,
          netAllowance: 1275,
        },
        {
          memberId: 'DIR-06',
          status: 'ABSENT',
          hasConflictOfInterest: false,
          grossAllowance: 0,
          tdsAmount: 0,
          netAllowance: 0,
        },
        {
          memberId: 'DIR-07',
          status: 'ON_LEAVE',
          hasConflictOfInterest: false,
          grossAllowance: 0,
          tdsAmount: 0,
          netAllowance: 0,
        },
      ],
      agendas: [
        {
          agendaNumber: 1,
          title: 'Confirmation of Previous Meeting Minutes',
          titleNepali: 'गत बैठकको निर्णय कार्यान्वयन समीक्षा तथा प्रमाणीकरण',
          discussionSummary: 'गत बैठक नं. १४१ का सम्पूर्ण निर्णयहरूको कार्यान्वयन प्रगति सन्तोषजनक रहेको व्यहोरा सचिवद्वारा पेश भयो।',
          resolution: 'गत बैठक नं. १४१ को निर्णय पुस्तिका सर्वसम्मत रुपमा अनुमोदन गरी हस्ताक्षर गरियो।',
          decisionType: 'UNANIMOUS',
        },
        {
          agendaNumber: 2,
          title: 'Approval of Commercial Agriculture Loans Above NPR 25 Lakhs',
          titleNepali: 'रु २५ लाख माथिका व्यावसायिक कृषि तथा पशुपालन कर्जा प्रस्ताव स्वीकृति',
          discussionSummary: 'गढवा गाउँपालिका वडा नं. २, ३ र ५ का तीन जना सदस्यहरूको आधुनिक डेरी तथा कृषि फार्म कर्जा प्रस्ताव उपर छलफल भयो। सञ्चालक सुनिता पुन मगरले आफन्त सम्बन्धी स्वार्थ बाझिने स्वघोषणा गरी मतदान प्रक्रियाबाट अलग रहनुभयो।',
          resolution: 'तीनवटै कर्जा प्रस्तावहरू धितो मूल्याङ्कन र प्राविधिक विश्लेषणका आधारमा कुल रु ७५,००,००० (पचहत्तर लाख) कर्जा प्रवाह गर्न बहुमतबाट स्वीकृत गरियो।',
          decisionType: 'MAJORITY',
          conflictedMembers: ['सुनिता पुन मगर'],
        },
        {
          agendaNumber: 3,
          title: 'Quarterly Interest Rate Spread & Statutory 4.75% Review',
          titleNepali: 'त्रैमासिक ब्याजदर अन्तर (४.७५%) तथा निक्षेप संकलन सीमा समीक्षा',
          discussionSummary: 'सहकारी ऐन २०७४ को दफा ५० बमोजिम संस्थाको हालको ब्याजदर अन्तर ४.२५% कायम रहेको र दफा ४९ बमोजिमको १५ गुणा निक्षेप सीमा सुरक्षित रहेको प्रतिवेदन पेश भयो।',
          resolution: 'ब्याजदर अन्तर ४.२५% मा नै यथावत कायम राख्ने र नियमित अनुगमन जारी राख्ने सर्वसम्मत निर्णय गरियो।',
          decisionType: 'UNANIMOUS',
        },
      ],
      status: 'APPROVED',
    });

    return [initialMeeting];
  });

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');
  const [selectedAgendaNumber, setSelectedAgendaNumber] = useState<number>(1);

  const currentMeeting = useMemo(() => {
    return meetings.find((m) => m.id === selectedMeetingId) || meetings[0];
  }, [meetings, selectedMeetingId]);

  if (!isOpen || !currentMeeting) return null;

  const handlePrintExtract = (agendaNum: number) => {
    const html = generateResolutionExtractHtml(currentMeeting, agendaNum);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 250);
    }
  };

  const handleExportAllowanceCsv = () => {
    downloadMeetingAllowanceCsv(meetings);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950/60 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <BookOpen className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40">
                  {t('सहकारी ऐन २०७४ • दफा ४१, ४२, ४३', 'Coop Act 2074 • Sec 41, 42, 43')}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {t(`बैठक नं. ${currentMeeting.meetingNumber}`, `Meeting #${currentMeeting.meetingNumber}`)}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {t(
                  'सञ्चालक तथा उपसमिति निर्णय पुस्तिका (Minute Book) एवं भत्ता लेजर',
                  'Board of Directors Minute Book & Meeting Allowance Ledger'
                )}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Top KPI Banner */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {t('बैठक मिति तथा समय', 'Meeting Date & Time')}
            </span>
            <strong className="text-white text-sm block mt-0.5 font-mono">
              {currentMeeting.dateNepali} ({currentMeeting.dateGregorian})
            </strong>
            <span className="text-[10px] text-slate-400">
              {currentMeeting.startTime} - {currentMeeting.endTime}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl border ${
              currentMeeting.isQuorumMet
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            }`}
          >
            <span className="block text-[10px] uppercase font-semibold">
              {t('गणपूरक संख्या (Quorum)', 'Statutory Quorum')}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <strong className="text-base font-mono font-black">
                {currentMeeting.quorumPercentage}%
              </strong>
              <span className="text-[10px] font-bold">
                / {STATUTORY_QUORUM_PERCENT}%
              </span>
            </div>
            <span className="text-[10px] block">
              {currentMeeting.isQuorumMet
                ? t('गणपूरक संख्या पूरा (Valid)', 'Quorum Met')
                : t('गणपूरक संख्या अपुग (Invalid)', 'Quorum Failed')}
            </span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {t('छलफलका प्रस्तावहरू', 'Agenda Count')}
            </span>
            <strong className="text-white text-base block mt-0.5 font-mono">
              {fmtCount(currentMeeting.agendas.length)} {t('प्रस्तावहरू', 'Agendas')}
            </strong>
            <span className="text-[10px] text-slate-400">
              {t('सबै निर्णय प्रमाणित', 'All Certified')}
            </span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {t('कुल बैठक भत्ता (१५% TDS सहित)', 'Meeting Allowance')}
            </span>
            <strong className="text-teal-400 text-base block mt-0.5 font-mono">
              {fmtCurrency(currentMeeting.totalGrossAllowance, true)}
            </strong>
            <span className="text-[10px] text-slate-400">
              TDS: {fmtCurrency(currentMeeting.totalTdsDeducted, true)} | Net: {fmtCurrency(currentMeeting.totalNetAllowance, true)}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-5 pt-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('AGENDAS')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'AGENDAS'
                  ? 'border-teal-500 text-teal-400 bg-teal-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="size-4" />
              <span>{t('छलफलका प्रस्ताव तथा निर्णयहरू', 'Agendas & Resolutions')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ATTENDANCE')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'ATTENDANCE'
                  ? 'border-teal-500 text-teal-400 bg-teal-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="size-4" />
              <span>{t('उपस्थिति तथा गणपूरक लेजर', 'Attendance & Quorum')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ALLOWANCE')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'ALLOWANCE'
                  ? 'border-teal-500 text-teal-400 bg-teal-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Percent className="size-4" />
              <span>{t('बैठक भत्ता तथा १५% TDS भौचर', 'Allowance & 15% TDS')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              type="button"
              onClick={handleExportAllowanceCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold border border-teal-900/60 transition cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>{t('भत्ता लेजर CSV', 'Allowance CSV')}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: Agendas & Resolutions */}
          {activeTab === 'AGENDAS' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{t('बैठक स्थल:', 'Venue:')}</span>
                  <span>{currentMeeting.venue}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>
                    <strong>{t('अध्यक्षता:', 'Chair:')}</strong> {currentMeeting.chairpersonName}
                  </span>
                  <span>
                    <strong>{t('सचिव:', 'Secretary:')}</strong> {currentMeeting.secretaryName}
                  </span>
                </div>
              </div>

              {/* Agenda List */}
              <div className="space-y-3">
                {currentMeeting.agendas.map((agenda) => (
                  <div
                    key={agenda.agendaNumber}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center font-mono text-xs">
                          {agenda.agendaNumber}
                        </span>
                        <h4 className="font-bold text-white text-sm">
                          {agenda.titleNepali}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            agenda.decisionType === 'UNANIMOUS'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {agenda.decisionType === 'UNANIMOUS' ? t('सर्वसम्मत', 'Unanimous') : t('बहुमत', 'Majority')}
                        </span>

                        <button
                          type="button"
                          onClick={() => handlePrintExtract(agenda.agendaNumber)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800/80 font-bold text-[11px] transition cursor-pointer"
                        >
                          <Printer className="size-3.5" />
                          <span>{t('निर्णयको प्रतिलिपि (Extract)', 'Certified Extract')}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-slate-300">
                      <div>
                        <strong className="text-slate-400 block text-[11px]">
                          {t('छलफलको सारांश (Discussion Summary):', 'Discussion Summary:')}
                        </strong>
                        <p className="mt-0.5 leading-relaxed">{agenda.discussionSummary}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-teal-950/30 border border-teal-900/40 text-teal-100">
                        <strong className="text-teal-400 block text-[11px] font-bold">
                          {t('पारित निर्णय (Approved Resolution):', 'Approved Resolution:')}
                        </strong>
                        <p className="mt-1 font-medium leading-relaxed">{agenda.resolution}</p>
                      </div>

                      {agenda.conflictedMembers && agenda.conflictedMembers.length > 0 && (
                        <div className="flex items-center gap-2 text-amber-400 text-[11px] bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-900/40">
                          <AlertTriangle className="size-4 shrink-0" />
                          <span>
                            <strong>{t('दफा ४३ स्वार्थ बाझिने घोषणा:', 'Sec 43 Conflict of Interest:')}</strong>{' '}
                            {agenda.conflictedMembers.join(', ')} ({t('छलफल तथा मतदानबाट अलग रहनुभयो', 'recused from deliberation & vote')})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Attendance & Quorum */}
          {activeTab === 'ATTENDANCE' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-inner">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5 w-8 text-center">#</th>
                      <th className="p-2.5">{t('सञ्चालक / पदाधिकारी', 'Board Member')}</th>
                      <th className="p-2.5">{t('पद (Role)', 'Designation')}</th>
                      <th className="p-2.5 text-center">{t('उपस्थिति स्थिति', 'Attendance')}</th>
                      <th className="p-2.5">{t('स्वार्थ बाझिने कैफियत', 'Conflict of Interest')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {DEFAULT_UNAKO_BOARD.map((member, idx) => {
                      const att = currentMeeting.attendances.find((a) => a.memberId === member.id);
                      const status = att?.status || 'ABSENT';
                      return (
                        <tr key={member.id} className="hover:bg-slate-900/40">
                          <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-2.5">
                            <div className="font-bold text-white">{member.nameNepali}</div>
                            <div className="text-[10px] text-slate-400">{member.name}</div>
                          </td>
                          <td className="p-2.5 font-mono text-slate-300">{member.role}</td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                status === 'PRESENT'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : status === 'ON_LEAVE'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {status === 'PRESENT'
                                ? t('उपस्थित (Present)', 'Present')
                                : status === 'ON_LEAVE'
                                ? t('विदा (Leave)', 'Leave')
                                : t('अनुपस्थित (Absent)', 'Absent')}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-300">
                            {att?.hasConflictOfInterest ? (
                              <span className="text-amber-400 text-[11px] font-medium">
                                ⚠ {att.conflictReason || t('स्वार्थ बाझिने स्वघोषणा गरिएको', 'Disclosed conflict')}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px]">
                                {t('कुनै कैफियत नरहेको', 'None')}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Allowance & 15% TDS */}
          {activeTab === 'ALLOWANCE' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-800/60 flex items-center justify-between text-teal-300 text-xs">
                <div className="flex items-center gap-2">
                  <Percent className="size-4 text-teal-400" />
                  <span>
                    {t(
                      'आयकर ऐन २०५८ दफा ८८(१) बमोजिम बैठक भत्तामा १५% अग्रिम कर कट्टी (TDS) अनिवार्य छ।',
                      '15% Withholding Tax (TDS) is statutorily deducted on all sitting allowances per Sec 88(1).'
                    )}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-inner">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5 w-8 text-center">#</th>
                      <th className="p-2.5">{t('सञ्चालकको नाम', 'Director Name')}</th>
                      <th className="p-2.5">{t('पद', 'Role')}</th>
                      <th className="p-2.5 text-right">{t('कुल भत्ता (Gross)', 'Gross Allowance')}</th>
                      <th className="p-2.5 text-right">{t('१५% TDS कट्टी', '15% TDS')}</th>
                      <th className="p-2.5 text-right">{t('खुद भुक्तानी (Net)', 'Net Payable')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {DEFAULT_UNAKO_BOARD.map((member, idx) => {
                      const att = currentMeeting.attendances.find((a) => a.memberId === member.id);
                      if (att?.status !== 'PRESENT') return null;

                      return (
                        <tr key={member.id} className="hover:bg-slate-900/40">
                          <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-2.5">
                            <strong className="text-white">{member.nameNepali}</strong>
                          </td>
                          <td className="p-2.5 text-slate-300">{member.role}</td>
                          <td className="p-2.5 text-right font-mono text-slate-200">
                            {fmtCurrency(att.grossAllowance, true)}
                          </td>
                          <td className="p-2.5 text-right font-mono text-rose-400">
                            - {fmtCurrency(att.tdsAmount, true)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                            {fmtCurrency(att.netAllowance, true)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-900/80 font-bold border-t border-slate-700">
                      <td colSpan={3} className="p-2.5 text-right text-white">
                        {t('जम्मा (Total Allowance):', 'Total Allowance:')}
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-200">
                        {fmtCurrency(currentMeeting.totalGrossAllowance, true)}
                      </td>
                      <td className="p-2.5 text-right font-mono text-rose-400">
                        - {fmtCurrency(currentMeeting.totalTdsDeducted, true)}
                      </td>
                      <td className="p-2.5 text-right font-mono text-emerald-400 text-sm">
                        {fmtCurrency(currentMeeting.totalNetAllowance, true)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>{t('सहकारी ऐन २०७४ दफा ४१/४२ तथा आयकर ऐन २०५८ अनुपालित', 'Cooperative Act 2074 Sec 41/42 Compliant')}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
