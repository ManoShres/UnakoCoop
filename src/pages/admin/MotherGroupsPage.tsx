import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Wallet,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { triggerBrowserDownload } from '../../utils/copomisExport';
import { isDuplicateCollection } from '../../utils/collectionPosting';
import { MotherGroupModal } from './components/MotherGroupModal';
import { MotherGroupMemberModal } from './components/MotherGroupMemberModal';
import { MotherGroupMeetingModal } from './components/MotherGroupMeetingModal';
import { MotherGroupDepositModal } from './components/MotherGroupDepositModal';
import { MotherGroupDirectoryTab } from './components/MotherGroupDirectoryTab';
import { MotherGroupMembersTab } from './components/MotherGroupMembersTab';
import { MotherGroupMeetingsTab } from './components/MotherGroupMeetingsTab';
import { MotherGroupDepositsTab } from './components/MotherGroupDepositsTab';

type Tab = 'DIRECTORY' | 'MEMBERS' | 'MEETINGS' | 'DEPOSITS';

const today = () => new Date().toISOString().split('T')[0];

export function MotherGroupsPage() {
  const { t, fmtCurrency, fmtCount } = useLanguageStore();
  const {
    motherGroups,
    motherGroupMembers,
    motherGroupMeetings,
    motherGroupDeposits,
    employees,
    members,
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

  // Modals state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  useEffect(() => {
    if (!showGroupModal && !showMemberModal && !showMeetingModal && !showDepositModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setShowGroupModal(false);
        setShowMemberModal(false);
        setShowMeetingModal(false);
        setShowDepositModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGroupModal, showMemberModal, showMeetingModal, showDepositModal]);

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
      g.location.toLowerCase().includes(query.toLowerCase()) ||
      (g.groupCode && g.groupCode.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSaveGroup = (groupData: {
    name: string;
    groupCode?: string;
    location: string;
    contactPerson: string;
    contactPhone: string;
    meetingDay: string;
    meetingTime?: string;
    monthlyTargetAmount: number;
    chairpersonName?: string;
    secretaryName?: string;
    treasurerName?: string;
    fieldStaffName?: string;
    mandatoryContributionPerMember: number;
  }) => {
    const duplicate = motherGroups.some(
      (g) =>
        g.name.trim().toLowerCase() === groupData.name.trim().toLowerCase() &&
        g.location.trim().toLowerCase() === groupData.location.trim().toLowerCase()
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
      ...groupData,
      totalMembers: 0,
      isActive: true,
    });
    setShowGroupModal(false);
    showToastMsg(t('आमा समूह सफलतापूर्वक दर्ता भयो!', 'Mother group registered successfully!'));
  };

  const handleSaveMember = (data: {
    motherGroupId: string;
    memberName: string;
    memberNo: string;
    monthlyContribution: number;
  }) => {
    addMotherGroupMember({
      ...data,
      isActive: true,
    });
    setShowMemberModal(false);
    showToastMsg(t('समूह सदस्य थपियो!', 'Group member added!'));
  };

  const handleRecordMeeting = (data: {
    motherGroupId: string;
    meetingDate: string;
    notes?: string;
  }) => {
    recordMeeting({
      motherGroupId: data.motherGroupId,
      meetingDate: data.meetingDate,
      conductedBy: employees[0]?.employeeNo ?? 'EMP-2080-0032',
      conductedByName: employees[0]?.name ?? 'Staff',
      totalCollected: 0,
      memberCount: groupMembers(data.motherGroupId).length,
      status: 'COMPLETED',
      notes: data.notes,
    });
    setShowMeetingModal(false);
    showToastMsg(t('सभा रेकर्ड भयो!', 'Meeting recorded!'));
  };

  const handleRecordDeposit = (data: {
    groupId: string;
    rosterId: string;
    memberName: string;
    memberNo: string;
    amount: number;
    slipNo: string;
  }) => {
    let meeting = groupMeetings(data.groupId)[0];
    if (!meeting) {
      meeting = recordMeeting({
        motherGroupId: data.groupId,
        meetingDate: today(),
        conductedBy: employees[0]?.employeeNo ?? 'EMP-2080-0032',
        conductedByName: employees[0]?.name ?? 'Staff',
        totalCollected: 0,
        memberCount: 0,
        status: 'IN_PROGRESS',
      });
    }

    const rosterMember = motherGroupMembers.find((m) => m.id === data.rosterId);
    if (
      isDuplicateCollection(
        {
          motherGroupId: data.groupId,
          meetingId: meeting.id,
          memberNo: data.memberNo.trim(),
          amount: data.amount,
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
      motherGroupId: data.groupId,
      memberId: rosterMember?.memberId,
      memberName: data.memberName.trim(),
      memberNo: data.memberNo.trim(),
      amount: data.amount,
      recordedBy: employees[0]?.employeeNo ?? 'EMP-2080-0032',
      recordedByName: employees[0]?.name ?? 'Staff',
      status: 'PENDING',
      bankDepositSlipNo: data.slipNo.trim() || undefined,
    });
    setShowDepositModal(false);
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
            type="button"
            onClick={() => setShowGroupModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
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
            {fmtCount(motherGroups.length)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            {t('समूह सदस्य', 'GROUP MEMBERS')}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {fmtCount(motherGroupMembers.length)}
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
            {fmtCount(motherGroupDeposits.filter((d) => d.status === 'PENDING').length)}
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
            type="button"
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
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
        <MotherGroupDirectoryTab
          query={query}
          setQuery={setQuery}
          filteredGroups={filteredGroups}
          groupMembers={groupMembers}
          groupDeposits={groupDeposits}
          onDeleteGroup={deleteMotherGroup}
        />
      )}

      {/* MEMBERS */}
      {activeTab === 'MEMBERS' && (
        <MotherGroupMembersTab
          motherGroupMembers={motherGroupMembers}
          motherGroups={motherGroups}
          members={members}
          onOpenMemberModal={() => setShowMemberModal(true)}
          onRemoveMember={removeMotherGroupMember}
        />
      )}

      {/* MEETINGS */}
      {activeTab === 'MEETINGS' && (
        <MotherGroupMeetingsTab
          motherGroupMeetings={motherGroupMeetings}
          motherGroups={motherGroups}
        />
      )}

      {/* DEPOSITS */}
      {activeTab === 'DEPOSITS' && (
        <MotherGroupDepositsTab
          motherGroupDeposits={motherGroupDeposits}
          motherGroups={motherGroups}
          members={members}
          onExportDeposits={handleExportDeposits}
          onPostDeposit={handlePostDeposit}
          onMarkReconciled={(id) => {
            updateDepositStatus(id, 'RECONCILED');
            showToastMsg(t('मिलान भयो।', 'Deposit reconciled.'));
          }}
        />
      )}

      {/* Modals */}
      <MotherGroupModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        employees={employees}
        onSave={handleSaveGroup}
      />

      <MotherGroupMemberModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        motherGroups={motherGroups}
        onSave={handleSaveMember}
      />

      <MotherGroupMeetingModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        motherGroups={motherGroups}
        onSave={handleRecordMeeting}
      />

      <MotherGroupDepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        motherGroups={motherGroups}
        motherGroupMembers={motherGroupMembers}
        onSave={handleRecordDeposit}
      />
    </div>
  );
}
