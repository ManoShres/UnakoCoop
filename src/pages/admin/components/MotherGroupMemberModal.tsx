import React, { useState } from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import type { MotherGroup } from '../../../types';

interface MotherGroupMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  motherGroups: MotherGroup[];
  onSave: (data: {
    motherGroupId: string;
    memberName: string;
    memberNo: string;
    monthlyContribution: number;
  }) => void;
}

export function MotherGroupMemberModal({
  isOpen,
  onClose,
  motherGroups,
  onSave,
}: MotherGroupMemberModalProps) {
  const { t } = useLanguageStore();

  const [mGroupId, setMGroupId] = useState(motherGroups[0]?.id ?? '');
  const [mName, setMName] = useState('');
  const [mNo, setMNo] = useState('');
  const [mContribution, setMContribution] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      motherGroupId: mGroupId || (motherGroups[0]?.id ?? ''),
      memberName: mName.trim(),
      memberNo: mNo.trim(),
      monthlyContribution: mContribution,
    });
    setMName('');
    setMNo('');
    setMContribution(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
          {t('समूह सदस्य थप्नुहोस्', 'Add Group Member')}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
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
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              {t('थप्नुहोस्', 'Add Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
