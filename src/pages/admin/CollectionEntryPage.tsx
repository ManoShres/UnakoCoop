import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { buildCollectionSheet, isDuplicateCollection } from '../../utils/collectionPosting';
import { triggerBrowserDownload } from '../../utils/copomisExport';
import {
  CollectionHeaderBanner,
  CollectionControls,
  CollectionStatsStrip,
  CollectionSheetTable,
  CollectionRecentTable,
  CollectionVoidModal,
  MemberCollectionBreakdown,
} from './components/collection';

const today = () => new Date().toISOString().split('T')[0];

export function CollectionEntryPage() {
  const { t } = useLanguageStore();
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
    voidMotherGroupDeposit,
    updatePendingCollection,
  } = useCoopStore();

  const [groupId, setGroupId] = useState(motherGroups[0]?.id ?? '');
  const [meetingId, setMeetingId] = useState('NEW');
  const [conductorNo, setConductorNo] = useState(employees[0]?.employeeNo ?? '');
  const [slipNo, setSlipNo] = useState('');
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [breakdowns, setBreakdowns] = useState<Record<string, MemberCollectionBreakdown>>({});
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
    const nextBreakdowns: Record<string, MemberCollectionBreakdown> = {};

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
    field: keyof MemberCollectionBreakdown,
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
      <CollectionHeaderBanner onExportSheet={handleExportSheet} />

      {/* Meeting controls */}
      <CollectionControls
        motherGroups={motherGroups}
        groupId={groupId}
        onGroupIdChange={setGroupId}
        meetingId={meetingId}
        onMeetingIdChange={setMeetingId}
        groupMeetingsList={groupMeetingsList}
        conductorNo={conductorNo}
        onConductorNoChange={setConductorNo}
        employees={employees}
        slipNo={slipNo}
        onSlipNoChange={setSlipNo}
      />

      {/* Stats */}
      <CollectionStatsStrip
        entryTotal={entryTotal}
        activeMeeting={activeMeeting}
        pendingCount={pendingCount}
        postedCount={postedCount}
        unlinkedCount={unlinkedCount}
      />

      {/* Collection sheet */}
      <CollectionSheetTable
        sheet={sheet}
        group={group}
        members={members}
        amounts={amounts}
        breakdowns={breakdowns}
        onUpdateMemberBreakdown={updateMemberBreakdown}
        onSave={handleSave}
      />

      {/* Recent collections (view / void) */}
      <CollectionRecentTable
        groupRecent={groupRecent}
        members={members}
        voidingId={voidingId}
        onSetVoidingId={setVoidingId}
      />

      {/* Void modal */}
      <CollectionVoidModal
        voidingId={voidingId}
        voidReason={voidReason}
        onVoidReasonChange={setVoidReason}
        onClose={() => setVoidingId(null)}
        onConfirmVoid={handleVoid}
      />
    </div>
  );
}
