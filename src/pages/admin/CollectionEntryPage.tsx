import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Landmark,
  UsersRound,
  Wallet,
  XCircle,
} from 'lucide-react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { buildCollectionSheet, isDuplicateCollection } from '../../utils/collectionPosting';
import { triggerBrowserDownload } from '../../utils/copomisExport';

const today = () => new Date().toISOString().split('T')[0];

export function CollectionEntryPage() {
  const { t, fmtCurrency, fmtCount, fmtDigits } = useLanguageStore();
  const {
    motherGroups,
    motherGroupMembers,
    motherGroupMeetings,
    motherGroupDeposits,
    members,
    savings,
    employees,
    recordMeeting,
    recordDeposit,
    postMeetingCollections,
    postDepositToMemberAccount,
    voidMotherGroupDeposit,
    updatePendingCollection,
  } = useCoopStore();

  const [groupId, setGroupId] = useState(motherGroups[0]?.id ?? '');
  const [meetingId, setMeetingId] = useState('NEW');
  const [conductorNo, setConductorNo] = useState(employees[0]?.employeeNo ?? '');
  const [slipNo, setSlipNo] = useState('');
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [breakdowns, setBreakdowns] = useState<
    Record<
      string,
      {
        attendance: 'PRESENT' | 'ABSENT' | 'LATE' | 'REPRESENTATIVE';
        mandatorySavings: number;
        optionalSavings: number;
        loanPrincipal: number;
        loanInterest: number;
        fine: number;
      }
    >
  >({});
  const [toast, setToast] = useState<string | null>(null);
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');

  useEffect(() => {
    if (!voidingId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setVoidingId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voidingId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const group = motherGroups.find((g) => g.id === groupId);
  const groupMeetingsList = useMemo(
    () =>
      motherGroupMeetings
        .filter((m) => m.motherGroupId === groupId)
        .sort((a, b) => (a.meetingDate < b.meetingDate ? 1 : -1)),
    [motherGroupMeetings, groupId]
  );

  // Default to the latest meeting of the selected group (or a fresh one).
  useEffect(() => {
    setMeetingId(groupMeetingsList[0]?.id ?? 'NEW');
  }, [groupId, groupMeetingsList.length]);

  const activeMeetingId = meetingId === 'NEW' ? '' : meetingId;
  const activeMeeting = groupMeetingsList.find((m) => m.id === activeMeetingId);

  const sheet = useMemo(
    () =>
      buildCollectionSheet(
        groupId,
        motherGroupMembers,
        motherGroupDeposits,
        activeMeetingId,
        members,
        savings
      ),
    [groupId, motherGroupMembers, motherGroupDeposits, activeMeetingId, members, savings]
  );

  // Seed editable amounts and breakdowns whenever the group / meeting selection changes.
  useEffect(() => {
    const nextAmounts: Record<string, string> = {};
    const nextBreakdowns: Record<
      string,
      {
        attendance: 'PRESENT' | 'ABSENT' | 'LATE' | 'REPRESENTATIVE';
        mandatorySavings: number;
        optionalSavings: number;
        loanPrincipal: number;
        loanInterest: number;
        fine: number;
      }
    > = {};

    sheet.forEach((row) => {
      const initMandatory = row.amount > 0 ? row.amount : row.monthlyContribution || 500;
      nextBreakdowns[row.groupMemberId] = {
        attendance: 'PRESENT',
        mandatorySavings: initMandatory,
        optionalSavings: 0,
        loanPrincipal: 0,
        loanInterest: 0,
        fine: 0,
      };
      nextAmounts[row.groupMemberId] = String(initMandatory);
    });

    setBreakdowns(nextBreakdowns);
    setAmounts(nextAmounts);
  }, [groupId, activeMeetingId, sheet.length]);

  const updateMemberBreakdown = (
    memberId: string,
    field: 'attendance' | 'mandatorySavings' | 'optionalSavings' | 'loanPrincipal' | 'loanInterest' | 'fine',
    value: any
  ) => {
    setBreakdowns((prev) => {
      const current = prev[memberId] || {
        attendance: 'PRESENT',
        mandatorySavings: 500,
        optionalSavings: 0,
        loanPrincipal: 0,
        loanInterest: 0,
        fine: 0,
      };
      const updated = { ...current, [field]: value };
      const rowSum =
        (updated.mandatorySavings || 0) +
        (updated.optionalSavings || 0) +
        (updated.loanPrincipal || 0) +
        (updated.loanInterest || 0) +
        (updated.fine || 0);

      setAmounts((prevAmts) => ({
        ...prevAmts,
        [memberId]: String(rowSum),
      }));

      return {
        ...prev,
        [memberId]: updated,
      };
    });
  };

  const entryTotal = sheet.reduce(
    (sum, row) => sum + (Number(amounts[row.groupMemberId]) || 0),
    0
  );
  const postedCount = sheet.filter(
    (r) => r.status === 'COMPLETED' || r.status === 'RECONCILED'
  ).length;
  const pendingCount = sheet.filter((r) => r.status === 'PENDING').length;
  const unlinkedCount = sheet.filter((r) => !r.canPost).length;

  const groupRecent = motherGroupDeposits
    .filter((d) => d.motherGroupId === groupId)
    .slice(0, 12);

  const ensureMeeting = (): string => {
    if (meetingId !== 'NEW') return meetingId;
    const conductor = employees.find((e) => e.employeeNo === conductorNo) ?? employees[0];
    const created = recordMeeting({
      motherGroupId: groupId,
      meetingDate: today(),
      conductedBy: conductor?.employeeNo ?? 'STAFF',
      conductedByName: conductor?.name ?? 'Staff',
      totalCollected: 0,
      memberCount: 0,
      status: 'IN_PROGRESS',
    });
    setMeetingId(created.id);
    return created.id;
  };

  const handleSave = (postAfter: boolean) => {
    const targetMeetingId = ensureMeeting();
    let saved = 0;
    let skipped = 0;

    sheet.forEach((row) => {
      const raw = amounts[row.groupMemberId];
      const amount = Number(raw);
      if (!raw || !Number.isFinite(amount) || amount <= 0) return;

      if (row.depositId) {
        if (row.status === 'PENDING') {
          updatePendingCollection(row.depositId, {
            amount,
            bankDepositSlipNo: slipNo.trim() || undefined,
          });
          saved += 1;
        } else {
          skipped += 1;
        }
        return;
      }

      if (
        isDuplicateCollection(
          { motherGroupId: groupId, meetingId: targetMeetingId, memberNo: row.memberNo, amount },
          motherGroupDeposits
        )
      ) {
        skipped += 1;
        return;
      }

      recordDeposit({
        meetingId: targetMeetingId,
        motherGroupId: groupId,
        memberId: row.memberId,
        memberName: row.memberName,
        memberNo: row.memberNo,
        amount,
        recordedBy: conductorNo || 'STAFF',
        recordedByName: employees.find((e) => e.employeeNo === conductorNo)?.name ?? 'Staff',
        status: 'PENDING',
        bankDepositSlipNo: slipNo.trim() || undefined,
      });
      saved += 1;
    });

    if (postAfter) {
      const result = postMeetingCollections(targetMeetingId);
      showToast(
        t(
          `सुरक्षित: ${saved} · पोस्ट: ${result.posted} · असफल: ${result.failed}${skipped ? ` · छोडिए: ${skipped}` : ''}`,
          `Saved: ${saved} · Posted: ${result.posted} · Failed: ${result.failed}${skipped ? ` · Skipped: ${skipped}` : ''}`
        )
      );
    } else {
      showToast(
        t(
          `पेन्डिङ सुरक्षित: ${saved}${skipped ? ` · छोडिए: ${skipped}` : ''}`,
          `Saved as pending: ${saved}${skipped ? ` · Skipped: ${skipped}` : ''}`
        )
      );
    }
  };

  const handleExportSheet = () => {
    const header = 'Group,Member No,Member Name,Linked Account,Amount (NPR),Status,Transaction Ref';
    const rows = sheet.map((row) =>
      [
        `"${group?.name ?? groupId} — ${group?.location ?? ''}"`,
        `"${row.memberNo}"`,
        `"${row.memberName}"`,
        `"${row.linkedAccountNo ?? ''}"`,
        Number(amounts[row.groupMemberId]) || 0,
        `"${row.status ?? 'DRAFT'}"`,
        `"${row.transactionRef ?? ''}"`,
      ].join(',')
    );
    triggerBrowserDownload(
      [header, ...rows].join('\n'),
      'mother_group_collection_sheet.csv',
      'text/csv'
    );
    showToast(t('कलेक्सन शीट CSV निकासा भयो।', 'Collection sheet exported as CSV.'));
  };

  const handleVoid = () => {
    if (!voidingId || !voidReason.trim()) return;
    voidMotherGroupDeposit(voidingId, voidReason.trim());
    setVoidingId(null);
    setVoidReason('');
    showToast(t('किश्ती रद्द गरियो।', 'Collection voided.'));
  };

  const statusBadge = (status?: string) => {
    if (status === 'COMPLETED' || status === 'RECONCILED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <CheckCircle2 className="size-3" />
          {status}
        </span>
      );
    }
    if (status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          <Clock className="size-3" />
          PENDING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {t('खाली', 'DRAFT')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center gap-3">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
            <Wallet className="size-4" />
            <span>{t('टेलर कलेक्सन कन्सोल', 'TELLER COLLECTION CONSOLE')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('आमा समूह मासिक कलेक्सन प्रविष्टि', 'Mother Group Meeting Collection Entry')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'सभामा उठेको रकम प्रविष्ट गरी सदस्यको व्यक्तिगत बचत खातामा पोस्ट गर्नुहोस्।',
              'Enter the amounts collected in the meeting and post them into each member’s personal savings account.'
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportSheet}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
          >
            <Download className="size-4" />
            {t('शीट CSV', 'Sheet CSV')}
          </button>
        </div>
      </div>

      {/* Meeting controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('समूह (नाम — स्थान)', 'Group (name — location)')}
          </label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
          >
            {motherGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} — {g.location}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('बैठक', 'Meeting')}
          </label>
          <select
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
          >
            <option value="NEW">
              {t('आजको नयाँ सभा (सुरक्षित गर्दा सिर्जना हुन्छ)', 'New meeting today (created on save)')}
            </option>
            {groupMeetingsList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.meetingDate} — {m.status} ({fmtCurrency(m.totalCollected, true)})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('सभा सञ्चालक (कर्मचारी)', 'Conducted By (staff)')}
          </label>
          <select
            value={conductorNo}
            onChange={(e) => setConductorNo(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.employeeNo}>
                {emp.name} ({emp.employeeNo})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('बैंक स्लिप नं.', 'Bank Slip No.')}
          </label>
          <input
            value={slipNo}
            onChange={(e) => setSlipNo(e.target.value)}
            placeholder="SLIP-GDH-0000"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Landmark className="size-3.5" /> {t('यो सीटको जम्मा', 'SHEET TOTAL')}
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{fmtCurrency(entryTotal, true)}</div>
          {activeMeeting && (
            <div className="text-[10px] text-slate-400 mt-1">
              {t('बैठकमा दर्ता: ', 'Meeting total: ')}
              {fmtCurrency(activeMeeting.totalCollected, true)}
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Clock className="size-3.5" /> {t('पेन्डिङ', 'PENDING')}
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{fmtCount(pendingCount)}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5" /> {t('पोस्ट भइसकेका', 'POSTED')}
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{fmtCount(postedCount)}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="size-3.5" /> {t('खाता नजोडिएका', 'NO PASSBOOK')}
          </div>
          <div className="text-2xl font-black text-rose-500 dark:text-rose-400">{fmtCount(unlinkedCount)}</div>
        </div>
      </div>

      {/* Collection sheet */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UsersRound className="size-4 text-blue-600" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              {t('सदस्य-वार कलेक्सन शीट', 'Member-wise Collection Sheet')}
              {group ? ` — ${group.name}` : ''}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSave(false)}
              className="px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition"
            >
              {t('पेन्डिङका रूपमा सुरक्षित', 'Save as Pending')}
            </button>
            <button
              onClick={() => handleSave(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
            >
              {t('सुरक्षित गरी सदस्य खातामा पोस्ट गर्नुहोस्', 'Save & Post to Member Accounts')}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3 py-3 text-left font-bold">{t('सदस्य विवरण', 'Member Details')}</th>
                <th className="px-2 py-3 text-center font-bold">{t('उपस्थिति', 'Attendance')}</th>
                <th className="px-2 py-3 text-right font-bold">{t('अनिवार्य बचत', 'Mandatory')}</th>
                <th className="px-2 py-3 text-right font-bold">{t('ऐच्छिक बचत', 'Optional')}</th>
                <th className="px-2 py-3 text-right font-bold">{t('कर्जा साँवा', 'Loan Prin.')}</th>
                <th className="px-2 py-3 text-right font-bold">{t('कर्जा ब्याज', 'Interest')}</th>
                <th className="px-2 py-3 text-right font-bold">{t('हर्जाना', 'Fine')}</th>
                <th className="px-3 py-3 text-right font-bold text-slate-900 dark:text-white">{t('जम्मा (Total)', 'Total (NPR)')}</th>
                <th className="px-3 py-3 text-center font-bold">{t('स्थिति', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sheet.map((row) => {
                const posted = row.status === 'COMPLETED' || row.status === 'RECONCILED';
                const b = breakdowns[row.groupMemberId] || {
                  attendance: 'PRESENT',
                  mandatorySavings: row.amount > 0 ? row.amount : row.monthlyContribution || 500,
                  optionalSavings: 0,
                  loanPrincipal: 0,
                  loanInterest: 0,
                  fine: 0,
                };
                const rowTotal =
                  (b.mandatorySavings || 0) +
                  (b.optionalSavings || 0) +
                  (b.loanPrincipal || 0) +
                  (b.loanInterest || 0) +
                  (b.fine || 0);

                return (
                  <tr
                    key={row.groupMemberId}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                      b.attendance === 'ABSENT' ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/40' : ''
                    }`}
                  >
                    {/* Member */}
                    <td className="px-3 py-3">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {(() => {
                          const m = members.find((mem) => mem.id === row.memberId || mem.memberNo === row.memberNo);
                          return m ? t(m.nameNepali || m.name, m.name) : row.memberName;
                        })()}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{fmtDigits(row.memberNo)}</div>
                      {row.canPost ? (
                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          {fmtDigits(row.linkedAccountNo)}
                        </div>
                      ) : (
                        <div className="text-[10px] text-rose-500 font-bold">
                          {t('खाता नजोडिएको', 'No Passbook')}
                        </div>
                      )}
                    </td>

                    {/* Attendance */}
                    <td className="px-2 py-3 text-center">
                      <select
                        value={b.attendance}
                        onChange={(e) =>
                          updateMemberBreakdown(row.groupMemberId, 'attendance', e.target.value)
                        }
                        disabled={posted}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${
                          b.attendance === 'PRESENT'
                            ? 'text-emerald-600'
                            : b.attendance === 'ABSENT'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      >
                        <option value="PRESENT">{t('उपस्थित (P)', 'Present')}</option>
                        <option value="ABSENT">{t('अनुपस्थित (A)', 'Absent')}</option>
                        <option value="LATE">{t('ढिलो (L)', 'Late')}</option>
                        <option value="REPRESENTATIVE">{t('प्रतिनिधि (R)', 'Proxy')}</option>
                      </select>
                    </td>

                    {/* Mandatory Savings */}
                    <td className="px-2 py-3 text-right">
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={b.mandatorySavings || ''}
                        onChange={(e) =>
                          updateMemberBreakdown(
                            row.groupMemberId,
                            'mandatorySavings',
                            Number(e.target.value)
                          )
                        }
                        disabled={posted || b.attendance === 'ABSENT'}
                        className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-right text-xs"
                      />
                    </td>

                    {/* Optional Savings */}
                    <td className="px-2 py-3 text-right">
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={b.optionalSavings || ''}
                        onChange={(e) =>
                          updateMemberBreakdown(
                            row.groupMemberId,
                            'optionalSavings',
                            Number(e.target.value)
                          )
                        }
                        disabled={posted || b.attendance === 'ABSENT'}
                        placeholder="0"
                        className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-right text-xs"
                      />
                    </td>

                    {/* Loan Principal */}
                    <td className="px-2 py-3 text-right">
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={b.loanPrincipal || ''}
                        onChange={(e) =>
                          updateMemberBreakdown(
                            row.groupMemberId,
                            'loanPrincipal',
                            Number(e.target.value)
                          )
                        }
                        disabled={posted || b.attendance === 'ABSENT'}
                        placeholder="0"
                        className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-right text-xs"
                      />
                    </td>

                    {/* Loan Interest */}
                    <td className="px-2 py-3 text-right">
                      <input
                        type="number"
                        min={0}
                        step={50}
                        value={b.loanInterest || ''}
                        onChange={(e) =>
                          updateMemberBreakdown(
                            row.groupMemberId,
                            'loanInterest',
                            Number(e.target.value)
                          )
                        }
                        disabled={posted || b.attendance === 'ABSENT'}
                        placeholder="0"
                        className="w-18 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-right text-xs"
                      />
                    </td>

                    {/* Fine */}
                    <td className="px-2 py-3 text-right">
                      <input
                        type="number"
                        min={0}
                        step={25}
                        value={b.fine || ''}
                        onChange={(e) =>
                          updateMemberBreakdown(row.groupMemberId, 'fine', Number(e.target.value))
                        }
                        disabled={posted}
                        placeholder="0"
                        className="w-16 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-right text-xs"
                      />
                    </td>

                    {/* Row Total */}
                    <td className="px-3 py-3 text-right font-mono font-black text-slate-900 dark:text-white">
                      रु. {fmtCurrency(rowTotal, true)}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3 text-center">{statusBadge(row.status)}</td>
                  </tr>
                );
              })}

              {sheet.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                    {t('यो समूहमा सक्रिय सदस्य छैनन्।', 'No active members in this group yet.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          {t(
            'रकम पोस्ट गर्दा सदस्यको नियमित बचत खातामा DEPOSIT कारोबार सिर्जना हुन्छ (रेफ: MGCOL-…) र बैठकको कुल संकलन स्वतः अद्यावधिक हुन्छ।',
            'Posting creates a DEPOSIT transaction on the member\'s regular savings account (ref: MGCOL-…) and updates the meeting total automatically.'
          )}
        </div>
      </div>

      {/* Void section */}
      {groupRecent.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <XCircle className="size-4 text-rose-600" />
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                {t('हालका कलेक्सनहरू (हेर्नु वा रद्द गर्नु', 'Recent Collections (view / void)')}
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">{t('सदस्य', 'Member')}</th>
                  <th className="px-4 py-3 text-left font-bold">{t('बैंक स्लिप', 'Bank Slip')}</th>
                  <th className="px-4 py-3 text-right font-bold">{t('रकम (रु)', 'Amount (NPR)')}</th>
                  <th className="px-4 py-3 text-center font-bold">{t('स्थिति', 'Status')}</th>
                  <th className="px-4 py-3 text-center font-bold">{t('कारोबार रेफ', 'Transaction Ref')}</th>
                  <th className="px-4 py-3 text-center font-bold">{t('अctions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {groupRecent.map((dep) => {
                  const canVoid = dep.status === 'PENDING' && !voidingId;
                  return (
                    <tr key={dep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {(() => {
                          const m = members.find((mem) => mem.id === dep.memberId || mem.memberNo === dep.memberNo);
                          return m ? t(m.nameNepali || m.name, m.name) : dep.memberName;
                        })()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{dep.bankDepositSlipNo ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">{fmtCurrency(dep.amount, true)}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(dep.status)}</td>
                      <td className="px-4 py-3 text-center font-mono text-[11px]">
                        {dep.transactionRef ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {canVoid ? (
                          <button
                            onClick={() => setVoidingId(dep.id)}
                            className="px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-700 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition"
                          >
                            {t('रद्द गर्नुहोस्', 'Void')}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
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

      {/* Void drawer */}
      {voidingId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('कलेक्सन रद्द गर्नुहोस्', 'Void Collection')}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setVoidingId(null)}
        >
          <div className="absolute inset-0 flex items-center justify-center p-6" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <XCircle className="size-4 text-rose-600" />
                  {t('कलेक्सन रद्द गर्नुहोस्', 'Void Collection')}
                </h3>
                <button
                  onClick={() => setVoidingId(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <XCircle className="size-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                {t(
                  'यो कार्यले यो कलेक्सनको रकमलाई सदस्य खाताबाट वापस लिन्छ (WITHDRAWAL)। यो वाट तपाईंको सहरहस्तलिखित कारण प्रयास गर्नुहोस्।',
                  'This will reverse the collection amount from the member account (WITHDRAWAL). Enter a reason below.'
                )}
              </p>
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder={t('रद्द गर्ने कारण (अनिवार्य):', 'Reason for voiding (required):')}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm mb-4 resize-none"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setVoidingId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t('झरिए', 'Cancel')}
                </button>
                <button
                  onClick={handleVoid}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
                >
                  {t('रद्द गर्नुहोस्', 'Void')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}


