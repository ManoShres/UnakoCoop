import React from 'react';
import { MotherGroup, MotherGroupMeeting, Employee } from '../../../../types';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface CollectionControlsProps {
  motherGroups: MotherGroup[];
  groupId: string;
  onGroupIdChange: (id: string) => void;
  meetingId: string;
  onMeetingIdChange: (id: string) => void;
  groupMeetingsList: MotherGroupMeeting[];
  conductorNo: string;
  onConductorNoChange: (no: string) => void;
  employees: Employee[];
  slipNo: string;
  onSlipNoChange: (no: string) => void;
}

export const CollectionControls: React.FC<CollectionControlsProps> = ({
  motherGroups,
  groupId,
  onGroupIdChange,
  meetingId,
  onMeetingIdChange,
  groupMeetingsList,
  conductorNo,
  onConductorNoChange,
  employees,
  slipNo,
  onSlipNoChange,
}) => {
  const { t, fmtCurrency } = useLanguageStore();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          {t('समूह (नाम — स्थान)', 'Group (name — location)')}
        </label>
        <select
          value={groupId}
          onChange={(e) => onGroupIdChange(e.target.value)}
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
          onChange={(e) => onMeetingIdChange(e.target.value)}
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
          onChange={(e) => onConductorNoChange(e.target.value)}
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
          onChange={(e) => onSlipNoChange(e.target.value)}
          placeholder="SLIP-GDH-0000"
          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
        />
      </div>
    </div>
  );
};
