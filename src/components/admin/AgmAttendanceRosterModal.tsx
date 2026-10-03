import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Users,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Award,
  Vote,
  Calendar,
  Building,
  UserCheck,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  calculateAgmQuorum,
  downloadAgmRosterCsv,
  AgmDelegateRow,
  AgmAttendanceType,
  ResolutionVote,
} from '../../utils/agmGovernance';
import { Member, CoopSettings, AgmDetails } from '../../types';

interface AgmAttendanceRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  agmDetails: AgmDetails;
  members: readonly Member[];
  coopSettings: CoopSettings;
}

export const AgmAttendanceRosterModal: React.FC<AgmAttendanceRosterModalProps> = ({
  isOpen,
  onClose,
  agmDetails,
  members,
  coopSettings,
}) => {
  const { t, fmtCount, fmtPercent } = useLanguageStore();

  const [filter, setFilter] = useState<'ALL' | AgmAttendanceType>('ALL');

  // Initialize roster from members
  const [roster, setRoster] = useState<AgmDelegateRow[]>(() => {
    return members.map((m, idx) => ({
      memberId: m.id,
      memberNo: m.memberNo,
      memberName: m.name,
      citizenshipNo: m.citizenshipNo || '38-01-72-04912',
      shareUnits: m.shareKitta || 100,
      // Seed first 75% as present/proxy for initial quorum simulation
      attendance:
        idx % 4 === 0
          ? 'PROXY_REPRESENTATIVE'
          : idx % 4 === 3
          ? 'ABSENT'
          : 'PRESENT_IN_PERSON',
      proxyName: idx % 4 === 0 ? 'Kamala Chaudhary (Family Delegate)' : undefined,
      vote: idx % 5 === 4 ? 'AGAINST' : 'IN_FAVOR',
      checkedInAt: idx % 4 !== 3 ? '10:30 AM' : undefined,
    }));
  });

  const summary = useMemo(
    () => calculateAgmQuorum(roster, agmDetails.totalDelegates || roster.length),
    [roster, agmDetails.totalDelegates]
  );

  const filteredRoster = useMemo(() => {
    if (filter === 'ALL') return roster;
    return roster.filter((r) => r.attendance === filter);
  }, [roster, filter]);

  if (!isOpen) return null;

  const handleAttendanceChange = (memberId: string, status: AgmAttendanceType) => {
    setRoster((prev) =>
      prev.map((r) =>
        r.memberId === memberId
          ? {
              ...r,
              attendance: status,
              checkedInAt: status !== 'ABSENT' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            }
          : r
      )
    );
  };

  const handleProxyNameChange = (memberId: string, name: string) => {
    setRoster((prev) =>
      prev.map((r) => (r.memberId === memberId ? { ...r, proxyName: name } : r))
    );
  };

  const handleVoteChange = (memberId: string, vote: ResolutionVote) => {
    setRoster((prev) =>
      prev.map((r) => (r.memberId === memberId ? { ...r, vote } : r))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    downloadAgmRosterCsv(
      roster,
      summary,
      {
        edition: agmDetails.edition,
        dateNepali: agmDetails.dateNepali,
        venue: agmDetails.venue,
      },
      {
        name: coopSettings.name,
        nameNepali: coopSettings.nameNepali,
        regNo: coopSettings.regNo,
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md">
              <Users className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                {t('साधारण सभा उपस्थिति तथा प्रतिनिधि पुस्तिका', 'AGM Attendance & Proxy Voting Roster')}
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {t('दफा ३९ अनुपालन', 'Sec 39 Quorum')}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {agmDetails.edition} • {agmDetails.dateNepali} • {agmDetails.venue}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer"
            >
              <Printer className="size-4 text-slate-500" />
              {t('पुस्तिका छाप्नुहोस्', 'Print Roster')}
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl hover:bg-emerald-100 transition shadow-sm cursor-pointer"
            >
              <Download className="size-4" />
              {t('CSV निर्यात', 'Export CSV')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Quorum Progress & Statutory Metrics Banner */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    summary.isQuorumAchieved
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300'
                  }`}
                >
                  {summary.isQuorumAchieved ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span>{t('वैधानिक गणपूरक संख्या पुगेको', 'Statutory Quorum Achieved')}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="size-3.5 text-rose-600" />
                      <span>{t('गणपूरक संख्या अपुग', 'Quorum Insufficient (< 51%)')}</span>
                    </>
                  )}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {summary.attendancePercent}% / आवश्यक ५१%
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                {t(
                  'सहकारी ऐन २०७४ को दफा ३९ बमोजिम कुल सेयरधनीको ५१% उपस्थिति आवश्यक',
                  'Cooperative Act Section 39 requires >= 51% attendance for AGM decisions to be legally binding'
                )}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">{t('प्रस्ताव पारित स्थिति:', 'Resolution Status:')}</span>
              <span
                className={`font-black px-2.5 py-1 rounded-lg ${
                  summary.resolutionStatus === 'PASSED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {summary.resolutionStatus === 'PASSED' ? t('बहुमतले पारित', 'PASSED') : t('प्रकृयामा', 'PENDING')}
              </span>
            </div>
          </div>

          {/* Quorum Progress Bar */}
          <div className="space-y-1">
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex relative">
              {/* 51% Quorum Marker Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                style={{ left: '51%' }}
                title={t('५१% गणपूरक सीमा', '51% Quorum Threshold')}
              />
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  summary.isQuorumAchieved ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, summary.attendancePercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>०%</span>
              <span className="font-bold text-rose-500">५१% (वैधानिक सीमा)</span>
              <span>१००%</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('कुल सेयरधनी प्रतिनिधि', 'Total Delegates')}</span>
              <strong className="text-slate-900 dark:text-white text-base block mt-0.5">{summary.totalEligibleDelegates}</strong>
              <span className="text-[10px] text-slate-400">{t('योग्य सेयरधनी मतदाता', 'Eligible voters')}</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('स्वयं उपस्थित', 'In-Person Present')}</span>
              <strong className="text-emerald-600 dark:text-emerald-400 text-base block mt-0.5">{summary.presentInPersonCount}</strong>
              <span className="text-[10px] text-slate-400">{t('प्रत्यक्ष सहभागी', 'Direct attendees')}</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('वारिस / प्रतिनिधि', 'Proxy Delegates')}</span>
              <strong className="text-blue-600 dark:text-blue-400 text-base block mt-0.5">{summary.proxyCount}</strong>
              <span className="text-[10px] text-slate-400">{t('प्रमाणित वारिसनामा', 'Authorized proxies')}</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('प्रस्ताव मत (पक्ष / विपक्ष)', 'Resolution Votes')}</span>
              <strong className="text-slate-900 dark:text-white text-base block mt-0.5 font-mono">
                {summary.votesInFavor} / {summary.votesAgainst}
              </strong>
              <span className="text-[10px] text-slate-400">{t('तटस्थ:', 'Abstain:')} {summary.votesAbstain}</span>
            </div>
          </div>
        </div>

        {/* Filter & Roster Table */}
        <div className="flex-1 overflow-auto p-6 space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold text-xs mr-1">{t('उपस्थिति फिल्टर:', 'Filter:')}</span>
            {(['ALL', 'PRESENT_IN_PERSON', 'PROXY_REPRESENTATIVE', 'ABSENT'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilter(st)}
                className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                  filter === st
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL'
                  ? t('सबै', 'ALL')
                  : st === 'PRESENT_IN_PERSON'
                  ? t('स्वयं उपस्थित', 'In Person')
                  : st === 'PROXY_REPRESENTATIVE'
                  ? t('वारिस / प्रतिनिधि', 'Proxy')
                  : t('अनुपस्थित', 'Absent')}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-3 w-8 text-center">#</th>
                  <th className="px-3 py-3">{t('सदस्यको विवरण', 'Member Details')}</th>
                  <th className="px-3 py-3 text-right">{t('सेयर कित्ता', 'Share Kitta')}</th>
                  <th className="px-3 py-3 text-center">{t('उपस्थिति प्रकार', 'Attendance Status')}</th>
                  <th className="px-3 py-3">{t('वारिस / प्रतिनिधि नाम', 'Proxy Representative')}</th>
                  <th className="px-3 py-3 text-center">{t('प्रस्ताव मत', 'Resolution Vote')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredRoster.map((r, idx) => (
                  <tr
                    key={r.memberId}
                    className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition ${
                      r.attendance === 'ABSENT' ? 'opacity-50 bg-slate-50/30' : ''
                    }`}
                  >
                    <td className="px-3 py-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{r.memberName}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {r.memberNo} • {r.citizenshipNo}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      {fmtCount(r.shareUnits)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <select
                        aria-label={t('उपस्थिति स्थिति चयन गर्नुहोस्', 'Select attendance status')}
                        value={r.attendance}
                        onChange={(e) =>
                          handleAttendanceChange(r.memberId, e.target.value as AgmAttendanceType)
                        }
                        className="text-[11px] py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                      >
                        <option value="PRESENT_IN_PERSON">{t('स्वयं उपस्थित', 'In Person')}</option>
                        <option value="PROXY_REPRESENTATIVE">{t('वारिस / प्रतिनिधि', 'Proxy Delegate')}</option>
                        <option value="ABSENT">{t('अनुपस्थित', 'Absent')}</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      {r.attendance === 'PROXY_REPRESENTATIVE' ? (
                        <input
                          type="text"
                          value={r.proxyName || ''}
                          onChange={(e) => handleProxyNameChange(r.memberId, e.target.value)}
                          placeholder={t('प्रतिनिधिको नाम र सम्बन्ध...', 'Proxy delegate name...')}
                          className="w-full text-[11px] py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        />
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <select
                        aria-label={t('प्रस्ताव मत चयन गर्नुहोस्', 'Select vote')}
                        value={r.vote}
                        disabled={r.attendance === 'ABSENT'}
                        onChange={(e) =>
                          handleVoteChange(r.memberId, e.target.value as ResolutionVote)
                        }
                        className="text-[11px] py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold disabled:opacity-40"
                      >
                        <option value="IN_FAVOR">{t('पक्षमा', 'In Favor')}</option>
                        <option value="AGAINST">{t('विपक्षमा', 'Against')}</option>
                        <option value="ABSTAIN">{t('तटस्थ', 'Abstain')}</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 print:hidden">
          <div className="text-xs text-slate-500">
            {t('सहकारी रजिस्ट्रार कार्यालय अभिलेख प्रणाली', 'Department of Cooperatives AGM Registry')}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-800 dark:bg-slate-700 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition shadow-sm cursor-pointer"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
