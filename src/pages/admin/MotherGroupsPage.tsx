import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarDays,
  Wallet,
  Plus,
  Search,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Trash2,
  Download,
} from 'lucide-react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { triggerBrowserDownload } from '../../utils/copomisExport';
import { isDuplicateCollection } from '../../utils/collectionPosting';
import type { MotherGroup } from '../../types';

type Tab = 'DIRECTORY' | 'MEMBERS' | 'MEETINGS' | 'DEPOSITS';

const today = () => new Date().toISOString().split('T')[0];

export function MotherGroupsPage() {
  const { t } = useLanguageStore();
  const {
    motherGroups,
    motherGroupMembers,
    motherGroupMeetings,
    motherGroupDeposits,
    employees,
    addMotherGroup,
    deleteMotherGroup,
    addMotherGroupMember,
    removeMotherGroupMember,
    recordMeeting,
    recordDeposit,
    updateDepositStatus,
    postDepositToMemberAccount,
  } = useCoopStore();

  const [activeTab, setActiveTab] = useState<Tab>('DIRECTORY');
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Group form
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [gName, setGName] = useState('');
  const [gLocation, setGLocation] = useState('');
  const [gContact, setGContact] = useState('');
  const [gPhone, setGPhone] = useState('');
  const [gMeetingDay, setGMeetingDay] = useState('');
  const [gTarget, setGTarget] = useState(0);

  // Member form
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [mGroupId, setMGroupId] = useState(motherGroups[0]?.id ?? '');
  const [mName, setMName] = useState('');
  const [mNo, setMNo] = useState('');
  const [mContribution, setMContribution] = useState(0);

  // Meeting form
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [mtGroupId, setMtGroupId] = useState(motherGroups[0]?.id ?? '');
  const [mtDate, setMtDate] = useState(today());
  const [mtNotes, setMtNotes] = useState('');

  // Deposit form
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [dGroupId, setDGroupId] = useState(motherGroups[0]?.id ?? '');
  const [dRosterId, setDRosterId] = useState('');
  const [dMemberName, setDMemberName] = useState('');
  const [dMemberNo, setDMemberNo] = useState('');
  const [dAmount, setDAmount] = useState(0);
  const [dSlipNo, setDSlipNo] = useState('');

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const groupMembers = (groupId: string) =>
    motherGroupMembers.filter((m) => m.motherGroupId === groupId);
  const groupMeetings = (groupId: string) =>
    motherGroupMeetings.filter((m) => m.motherGroupId === groupId);
  const groupDeposits = (groupId: string) =>
    motherGroupDeposits.filter((d) => d.motherGroupId === groupId);

  const filteredGroups = motherGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(query.toLowerCase()) ||
      g.location.toLowerCase().includes(query.toLowerCase())
  );

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const duplicate = motherGroups.some(
      (g) =>
        g.name.trim().toLowerCase() === gName.trim().toLowerCase() &&
        g.location.trim().toLowerCase() === gLocation.trim().toLowerCase()
    );
    if (duplicate) {
      showToastMsg(
        t(
          'यो स्थानमा सोही नामको समूह पहिले नै छ।',
          'A group with this name already exists at this location.'
        )
      );
      return;
    }
    addMotherGroup({
      name: gName.trim(),
      location: gLocation.trim(),
      contactPerson: gContact.trim(),
      contactPhone: gPhone.trim(),
      meetingDay: gMeetingDay.trim(),
      monthlyTargetAmount: gTarget,
      totalMembers: 0,
      isActive: true,
    });
    setShowGroupModal(false);
    setGName(''); setGLocation(''); setGContact(''); setGPhone(''); setGMeetingDay(''); setGTarget(0);
    showToastMsg(t('आमा समूह सफलतापूर्वक दर्ता भयो!', 'Mother group registered successfully!'));
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    addMotherGroupMember({
      motherGroupId: mGroupId,
      memberName: mName.trim(),
      memberNo: mNo.trim(),
      monthlyContribution: mContribution,
      isActive: true,
    });
    setShowMemberModal(false);
    setMName(''); setMNo(''); setMContribution(0);
    showToastMsg(t('समूह सदस्य थपियो!', 'Group member added!'));
  };

  const handleRecordMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    recordMeeting({
      motherGroupId: mtGroupId,
      meetingDate: mtDate,
      conductedBy: employees[0]?.employeeNo ?? 'EMP-2080-0032',
      conductedByName: employees[0]?.name ?? 'Staff',
      totalCollected: 0,
      memberCount: groupMembers(mtGroupId).length,
      status: 'COMPLETED',
      notes: mtNotes.trim() || undefined,
    });
    setShowMeetingModal(false);
    setMtNotes('');
    showToastMsg(t('सभा रेकर्ड भयो!', 'Meeting recorded!'));
  };

  const handleSelectRosterMember = (rosterId: string) => {
    setDRosterId(rosterId);
    if (!rosterId) {
      setDMemberName('');
      setDMemberNo('');
      return;
    }
    const rosterMember = motherGroupMembers.find((m) => m.id === rosterId);
    if (rosterMember) {
      setDMemberName(rosterMember.memberName);
      setDMemberNo(rosterMember.memberNo);
      if (rosterMember.monthlyContribution > 0) setDAmount(rosterMember.monthlyContribution);
    }
  };

  const handleRecordDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure the group has a meeting to hold this collection.
    let meeting = groupMeetings(dGroupId)[0];
    if (!meeting) {
      meeting = recordMeeting({
        motherGroupId: dGroupId,
        meetingDate: today(),
        conductedBy: employees[0]?.employeeNo ?? 'EMP-2080-0032',
        conductedByName: employees[0]?.name ?? 'Staff',
        totalCollected: 0,
        memberCount: 0,
        status: 'IN_PROGRESS',
      });
    }

    const rosterMember = motherGroupMembers.find((m) => m.id === dRosterId);
    if (
      isDuplicateCollection(
        {
          motherGroupId: dGroupId,
          meetingId: meeting.id,
          memberNo: dMemberNo.trim(),
          amount: dAmount,
        },
        motherGroupDeposits
      )
    ) {
      showToastMsg(
        t(
          'यही सदस्यको यही रकम पहिले नै दर्ता भइसकेको छ।',
          'This member already has a collection of the same amount for this meeting.'
        )
      );
      return;
    }

    recordDeposit({
      meetingId: meeting.id,
      motherGroupId: dGroupId,
      memberId: rosterMember?.memberId,
      memberName: dMemberName.trim(),
      memberNo: dMemberNo.trim(),
      amount: dAmount,
      recordedBy: employees[0]?.employeeNo ?? 'EMP-2080-0032',
      recordedByName: employees[0]?.name ?? 'Staff',
      status: 'PENDING',
      bankDepositSlipNo: dSlipNo.trim() || undefined,
    });
    setShowDepositModal(false);
    setDRosterId(''); setDMemberName(''); setDMemberNo(''); setDAmount(0); setDSlipNo('');
    showToastMsg(
      t(
        'किश्ती पेन्डिङका रूपमा दर्ता भयो — टेलर कलेक्सन कन्सोलबाट सदस्य खातामा पोस्ट गर्नुहोस्।',
        'Collection saved as PENDING — post it to the member passbook from the Teller Collection Console.'
      )
    );
  };

  const handlePostDeposit = (depositId: string) => {
    const result = postDepositToMemberAccount(depositId);
    if (result.ok) {
      showToastMsg(
        t(
          `सदस्य खातामा पोस्ट भयो (${result.transactionRef})।`,
          `Posted to member passbook (${result.transactionRef}).`
        )
      );
    } else {
      showToastMsg(t(`पोस्ट गर्न सकिएन: ${result.error}`, `Could not post: ${result.error}`));
    }
  };

  const handleExportDeposits = () => {
    const header = 'Group,Member No,Member Name,Amount (NPR),Date,Status,Reference';
    const rows = motherGroupDeposits.map((d) => {
      const group = motherGroups.find((g) => g.id === d.motherGroupId);
      return [
        `"${group?.name ?? d.motherGroupId}"`,
        `"${d.memberNo}"`,
        `"${d.memberName}"`,
        d.amount,
        d.depositDate,
        d.status,
        `"${d.referenceNo ?? ''}"`,
      ].join(',');
    });
    triggerBrowserDownload([header, ...rows].join('\n'), 'mother_group_deposits.csv', 'text/csv');
    showToastMsg(t('CSV निर्यात भयो!', 'CSV exported!'));
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
      COMPLETED: {
        cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        icon: <CheckCircle2 className="size-3" />,
        label: t('सम्पन्न', 'COMPLETED'),
      },
      PENDING: {
        cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        icon: <Clock className="size-3" />,
        label: t('पेन्डिङ', 'PENDING'),
      },
      RECONCILED: {
        cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        icon: <CheckCircle2 className="size-3" />,
        label: t('मिलान', 'RECONCILED'),
      },
      VOID: {
        cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
        icon: <XCircle className="size-3" />,
        label: t('रद्द', 'VOID'),
      },
    };
    const s = map[status] ?? map.PENDING;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>
        {s.icon}
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1">
            <Users className="size-4" />
            <span>{t('क्षेत्रीय आमा समूह व्यवस्थापन', 'MOTHER GROUP OPERATIONS')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('आमा समूह व्यवस्थापन', 'Mother Groups Management')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'स्थानीय आमा समूह दर्ता, सदस्य, मासिक सभा तथा बचत संकलन व्यवस्थापन।',
              'Register local mother groups, manage members, monthly meetings and savings collection.'
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/collection-entry"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
          >
            <Wallet className="size-4" />
            {t('टेलर कलेक्सन कन्सोल', 'Teller Collection Console')}
          </Link>
          <button
            onClick={() => setShowGroupModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
          >
            <Plus className="size-4" />
            {t('नयाँ समूह', 'New Group')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            {t('कुल समूह', 'TOTAL GROUPS')}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {motherGroups.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            {t('समूह सदस्य', 'GROUP MEMBERS')}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {motherGroupMembers.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            {t('यस महिनाको संकलन', 'COLLECTED THIS MONTH')}
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {fmtCurrency(
              motherGroupDeposits
                .filter((d) => d.status !== 'VOID' && d.depositDate.startsWith(today().slice(0, 7)))
                .reduce((sum, d) => sum + d.amount, 0)
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            {t('पेन्डिङ किश्ती', 'PENDING DEPOSITS')}
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {motherGroupDeposits.filter((d) => d.status === 'PENDING').length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          ['DIRECTORY', 'समूह गतिविधि', 'Groups'],
          ['MEMBERS', 'समूह सदस्य', 'Members'],
          ['MEETINGS', 'मासिक सभा', 'Meetings'],
          ['DEPOSITS', 'बचत किश्ती', 'Deposits'],
        ] as [Tab, string, string][]).map(([key, ne, en]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === key
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {t(ne, en)}
          </button>
        ))}
      </div>

      {/* DIRECTORY */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('समूह वा स्थान खोज्नुहोस्...', 'Search group or location...')}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredGroups.map((g) => (
              <div
                key={g.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">{g.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <MapPin className="size-3" />
                      {g.location}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMotherGroup(g.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
                    title={t('मेट्नुहोस्', 'Delete')}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5 text-slate-400" />
                    {groupMembers(g.id).length} {t('सदस्य', 'members')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 text-slate-400" />
                    {g.meetingDay || t('निर्धारित छैन', 'Not scheduled')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-slate-400" />
                    {g.contactPerson} · {g.contactPhone}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400">
                      {t('मासिक लक्ष्य', 'MONTHLY TARGET')}
                    </div>
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {fmtCurrency(g.monthlyTargetAmount, true)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400">
                      {t('संकलित', 'COLLECTED')}
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {fmtCurrency(groupDeposits(g.id, true).reduce((s, d) => s + d.amount, 0))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEMBERS */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              {t('समूह सदस्यहरू', 'Group Members')} ({motherGroupMembers.length})
            </h2>
            <button
              onClick={() => setShowMemberModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold"
            >
              <Plus className="size-3.5" />
              {t('सदस्य थप्नुहोस्', 'Add Member')}
            </button>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60">
                <tr>
                  {[
                    t('समूह', 'Group'),
                    t('सदस्य नं.', 'Member No'),
                    t('नाम', 'Name'),
                    t('मासिक चन्दा', 'Monthly Contribution'),
                    '',
                  ].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {motherGroupMembers.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {motherGroups.find((g) => g.id === m.motherGroupId)?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{m.memberNo}</td>
                    <td className="px-4 py-3">{m.memberName}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{fmtCurrency(m.monthlyContribution, true)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeMotherGroupMember(m.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {motherGroupMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      {t('कुनै समूह सदस्य छैन।', 'No group members yet.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'MEETINGS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              {t('समूह बैठक इतिहास', 'Meeting History')}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">{t('समूह', 'Group')}</th>
                  <th className="px-4 py-3 text-left font-bold">{t('मिति', 'Date')}</th>
                  <th className="px-4 py-3 text-left font-bold">{t('सञ्चालक', 'Conducted By')}</th>
                  <th className="px-4 py-3 text-right font-bold">{t('संकलित रकम', 'Collected')}</th>
                  <th className="px-4 py-3 text-right font-bold">{t('सहभागी', 'Attendees')}</th>
                  <th className="px-4 py-3 text-center font-bold">{t('स्थिति', 'Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {motherGroupMeetings.map((mt) => {
                  const grp = motherGroups.find((g) => g.id === mt.motherGroupId);
                  return (
                    <tr key={mt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{grp?.name ?? '—'}</div>
                        <div className="text-xs text-slate-500">{grp?.location ?? ''}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{mt.meetingDate}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{mt.conductedByName ?? mt.conductedBy}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {fmtCurrency(mt.totalCollected, true)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{mt.memberCount}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          <CheckCircle2 className="size-3" />
                          {mt.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {motherGroupMeetings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      {t('कुनै बैठक रेकर्ड छैन।', 'No meetings recorded yet.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'DEPOSITS' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => handleExportDeposits()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Download className="size-4" />
              {t('CSV निकासा', 'Export CSV')}
            </button>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">{t('सदस्य', 'Member')}</th>
                    <th className="px-4 py-3 text-left font-bold">{t('समूह', 'Group')}</th>
                    <th className="px-4 py-3 text-right font-bold">{t('रकम', 'Amount')}</th>
                    <th className="px-4 py-3 text-left font-bold">{t('मिति', 'Date')}</th>
                    <th className="px-4 py-3 text-left font-bold">{t('दर्ता गर्ने', 'Recorded By')}</th>
                    <th className="px-4 py-3 text-center font-bold">{t('स्थिति', 'Status')}</th>
                    <th className="px-4 py-3 text-right font-bold">{t('कार्य', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {motherGroupDeposits.map((d) => {
                    const grp = motherGroups.find((g) => g.id === d.motherGroupId);
                    return (
                      <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white">{d.memberName}</div>
                          <div className="text-xs text-slate-500">{d.memberNo}</div>
                          {d.transactionRef && (
                            <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {d.transactionRef} · {d.savingsAccountNo}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{grp?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {fmtCurrency(d.amount, true)}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{d.depositDate}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{d.recordedByName ?? d.recordedBy}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                              d.status === 'RECONCILED'
                                ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                                : d.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}
                          >
                            {d.status === 'PENDING' ? <Clock className="size-3" /> : <CheckCircle2 className="size-3" />}
                            {d.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            {d.status === 'PENDING' && (
                              <button
                                onClick={() => handlePostDeposit(d.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 transition"
                                title={t('सदस्य खातामा पोस्ट गर्नुहोस्', 'Post to member passbook')}
                              >
                                <CheckCircle2 className="size-4" />
                              </button>
                            )}
                            {d.status === 'COMPLETED' && (
                              <button
                                onClick={() => {
                                  updateDepositStatus(d.id, 'RECONCILED');
                                  showToastMsg(t('मिलान भयो।', 'Deposit reconciled.'));
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 transition"
                                title={t('मिलान गर्नुहोस्', 'Mark reconciled')}
                              >
                                <Wallet className="size-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {motherGroupDeposits.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        {t('कुनै जम्मा रेकर्ड छैन।', 'No deposits recorded yet.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              {t('नयाँ आमा समूह दर्ता', 'Register New Mother Group')}
            </h3>
            <form onSubmit={handleSaveGroup} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('समूहको नाम', 'Group Name')}
                </label>
                <input
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  placeholder={t('जस्तै: लालीगुराँस आमा समूह', 'e.g. Laliguras Mother Group')}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('ठेगाना / स्थान', 'Location / Place')}
                </label>
                <input
                  value={gLocation}
                  onChange={(e) => setGLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  placeholder={t('गढवा-५, दाङ', 'Gadhwa-5, Dang')}
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {t('एउटै नाम फरक स्थानमा प्रयोग गर्न मिल्छ।', 'The same name may be reused at a different location.')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('सम्पर्क व्यक्ति', 'Contact Person')}
                  </label>
                  <input
                    value={gContact}
                    onChange={(e) => setGContact(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('फोन', 'Phone')}
                  </label>
                  <input
                    value={gPhone}
                    onChange={(e) => setGPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('बैठक दिन', 'Meeting Day')}
                  </label>
                  <input
                    value={gMeetingDay}
                    onChange={(e) => setGMeetingDay(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                    placeholder={t('हरेक शनिबार', 'Every Saturday')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('मासिक लक्ष्य (रु)', 'Monthly Target (NPR)')}
                  </label>
                  <input
                    type="number"
                    value={gTarget}
                    onChange={(e) => setGTarget(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold"
                    min={0}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('दर्ता गर्नुहोस्', 'Register Group')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              {t('समूह सदस्य थप्नुहोस्', 'Add Group Member')}
            </h3>
            <form onSubmit={handleSaveMember} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('समूह', 'Group')}
                </label>
                <select
                  value={mGroupId}
                  onChange={(e) => setMGroupId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  required
                >
                  {motherGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} — {g.location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('सदस्यको नाम', 'Member Name')}
                  </label>
                  <input
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('सदस्य नम्बर', 'Member No')}
                  </label>
                  <input
                    value={mNo}
                    onChange={(e) => setMNo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                    placeholder="UK-00000"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('मासिक चन्दा (रु)', 'Monthly Contribution (NPR)')}
                </label>
                <input
                  type="number"
                  value={mContribution}
                  onChange={(e) => setMContribution(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold"
                  min={0}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('थप्नुहोस्', 'Add Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              {t('बैठक रेकर्ड गर्नुहोस्', 'Record Meeting')}
            </h3>
            <form onSubmit={handleRecordMeeting} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('समूह', 'Group')}
                </label>
                <select
                  value={mtGroupId}
                  onChange={(e) => setMtGroupId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  required
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
                  {t('बैठक मिति', 'Meeting Date')}
                </label>
                <input
                  type="date"
                  value={mtDate}
                  onChange={(e) => setMtDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('कैफियत', 'Notes')}
                </label>
                <textarea
                  value={mtNotes}
                  onChange={(e) => setMtNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  rows={3}
                  placeholder={t('उपस्थिति, छलफलका विषयवस्तु...', 'Attendance, discussion topics...')}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('रेकर्ड गर्नुहोस्', 'Record Meeting')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
              {t('सदस्य जम्मा दर्ता', 'Record Member Deposit')}
            </h3>
            <form onSubmit={handleRecordDeposit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('समूह', 'Group')}
                </label>
                <select
                  value={dGroupId}
                  onChange={(e) => setDGroupId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                  required
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
                  {t('समूह सदस्य छान्नुहोस्', 'Select Group Member')}
                </label>
                <select
                  value={dRosterId}
                  onChange={(e) => handleSelectRosterMember(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                >
                  <option value="">{t('— दर्ता नभएको बचतकर्ता (म्यानुअल) —', '— Unregistered saver (manual entry) —')}</option>
                  {motherGroupMembers
                    .filter((m) => m.motherGroupId === dGroupId && m.isActive)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.memberName} ({m.memberNo}){m.memberId ? '' : ' — no passbook'}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('सदस्यको नाम', 'Member Name')}
                  </label>
                  <input
                    value={dMemberName}
                    onChange={(e) => setDMemberName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('सदस्य नम्बर', 'Member No')}
                  </label>
                  <input
                    value={dMemberNo}
                    onChange={(e) => setDMemberNo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                    placeholder="UK-00000"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('जम्मा रकम (रु)', 'Deposit Amount (NPR)')}
                </label>
                <input
                  type="number"
                  value={dAmount}
                  onChange={(e) => setDAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold"
                  min={1}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('बैंक जम्मा स्लिप नं.', 'Bank Deposit Slip No.')}
                </label>
                <input
                  value={dSlipNo}
                  onChange={(e) => setDSlipNo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                  placeholder="SLIP-GDH-0000"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {t(
                    'पेन्डिङ रूपमा सुरक्षित हुन्छ; सदस्य खातामा पोस्ट गरेपछि मात्र पासबुकमा देखिन्छ।',
                    'Saved as PENDING — it appears in the passbook only after posting to the member account.'
                  )}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('पेन्डिङ रूपमा सुरक्षित गर्नुहोस्', 'Save as Pending')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}







