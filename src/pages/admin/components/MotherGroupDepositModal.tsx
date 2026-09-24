import React, { useState } from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import type { MotherGroup, MotherGroupMember } from '../../../types';

interface MotherGroupDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  motherGroups: MotherGroup[];
  motherGroupMembers: MotherGroupMember[];
  onSave: (data: {
    groupId: string;
    rosterId: string;
    memberName: string;
    memberNo: string;
    amount: number;
    slipNo: string;
  }) => void;
}

export function MotherGroupDepositModal({
  isOpen,
  onClose,
  motherGroups,
  motherGroupMembers,
  onSave,
}: MotherGroupDepositModalProps) {
  const { t } = useLanguageStore();

  const [dGroupId, setDGroupId] = useState(motherGroups[0]?.id ?? '');
  const [dRosterId, setDRosterId] = useState('');
  const [dMemberName, setDMemberName] = useState('');
  const [dMemberNo, setDMemberNo] = useState('');
  const [dAmount, setDAmount] = useState(0);
  const [dSlipNo, setDSlipNo] = useState('');

  if (!isOpen) return null;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      groupId: dGroupId || (motherGroups[0]?.id ?? ''),
      rosterId: dRosterId,
      memberName: dMemberName.trim(),
      memberNo: dMemberNo.trim(),
      amount: dAmount,
      slipNo: dSlipNo.trim(),
    });
    setDRosterId('');
    setDMemberName('');
    setDMemberNo('');
    setDAmount(0);
    setDSlipNo('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
          {t('सदस्य जम्मा दर्ता', 'Record Member Deposit')}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
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
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              {t('पेन्डिङ रूपमा सुरक्षित गर्नुहोस्', 'Save as Pending')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
