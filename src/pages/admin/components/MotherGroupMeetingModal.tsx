import React, { useState } from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import type { MotherGroup } from '../../../types';

interface MotherGroupMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  motherGroups: MotherGroup[];
  onSave: (data: {
    motherGroupId: string;
    meetingDate: string;
    notes?: string;
  }) => void;
}

export function MotherGroupMeetingModal({
  isOpen,
  onClose,
  motherGroups,
  onSave,
}: MotherGroupMeetingModalProps) {
  const { t } = useLanguageStore();

  const [mtGroupId, setMtGroupId] = useState(motherGroups[0]?.id ?? '');
  const [mtDate, setMtDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mtNotes, setMtNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      motherGroupId: mtGroupId || (motherGroups[0]?.id ?? ''),
      meetingDate: mtDate,
      notes: mtNotes.trim() || undefined,
    });
    setMtNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">
          {t('बैठक रेकर्ड गर्नुहोस्', 'Record Meeting')}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
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
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              {t('रेकर्ड गर्नुहोस्', 'Record Meeting')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
