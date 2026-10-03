import React, { useState } from 'react';
import { Users, X } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import type { Employee } from '../../../types';

interface MotherGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSave: (groupData: {
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
  }) => void;
}

export function MotherGroupModal({
  isOpen,
  onClose,
  employees,
  onSave,
}: MotherGroupModalProps) {
  const { t } = useLanguageStore();

  const [gName, setGName] = useState('');
  const [gGroupCode, setGGroupCode] = useState('MG-GAD-01');
  const [gLocation, setGLocation] = useState('गढवा-५, दाङ');
  const [gContact, setGContact] = useState('');
  const [gPhone, setGPhone] = useState('98578-');
  const [gMeetingDay, setGMeetingDay] = useState('हरेक शनिबार (Every Saturday)');
  const [gMeetingTime, setGMeetingTime] = useState('07:30 AM');
  const [gChairperson, setGChairperson] = useState('');
  const [gSecretary, setGSecretary] = useState('');
  const [gTreasurer, setGTreasurer] = useState('');
  const [gFieldStaff, setGFieldStaff] = useState('');
  const [gMandatoryContribution, setGMandatoryContribution] = useState(500);
  const [gTarget, setGTarget] = useState(25000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: gName.trim(),
      groupCode: gGroupCode.trim() || undefined,
      location: gLocation.trim(),
      contactPerson: gContact.trim() || gChairperson.trim(),
      contactPhone: gPhone.trim(),
      meetingDay: gMeetingDay.trim(),
      meetingTime: gMeetingTime.trim() || undefined,
      monthlyTargetAmount: gTarget,
      chairpersonName: gChairperson.trim() || undefined,
      secretaryName: gSecretary.trim() || undefined,
      treasurerName: gTreasurer.trim() || undefined,
      fieldStaffName: gFieldStaff.trim() || undefined,
      mandatoryContributionPerMember: gMandatoryContribution,
    });
    setGName('');
    setGLocation('');
    setGContact('');
    setGPhone('');
    setGMeetingDay('');
    setGChairperson('');
    setGSecretary('');
    setGTreasurer('');
    setGTarget(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="size-5" />
            <div>
              <div className="text-[10px] font-mono text-emerald-200 uppercase font-bold tracking-wider">
                {t('सहकारी आमा समूह / बचत केन्द्र दर्ता', 'MOTHER GROUP / SAVINGS CENTER')}
              </div>
              <h3 className="text-base font-black">
                {t('नयाँ आमा समूह तथा केन्द्र स्थापना फारम', 'Register New Mother Group & Center')}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* SECTION 1: Center Identity */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {t('१. समूहको नाम तथा केन्द्र कोड', '1. Group Identity & Center Code')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('आमा समूहको नाम *', 'Mother Group Name *')}
                </label>
                <input
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  placeholder={t('जस्तै: लालीगुराँस आमा समूह', 'e.g. Laliguras Mother Group')}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('केन्द्र कोड *', 'Center Code *')}
                </label>
                <input
                  value={gGroupCode}
                  onChange={(e) => setGGroupCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  placeholder="MG-GAD-01"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('कार्यक्षेत्र / स्थान *', 'Location / Village *')}
                </label>
                <input
                  value={gLocation}
                  onChange={(e) => setGLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  placeholder="गढवा-५, दाङ"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('सम्पर्क फोन नम्बर *', 'Contact Phone *')}
                </label>
                <input
                  value={gPhone}
                  onChange={(e) => setGPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  placeholder="98578-XXXXX"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Meeting Schedule */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {t('२. बैठक तालिका तथा समय', '2. Meeting Schedule & Time')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('बैठक बस्ने दिन *', 'Meeting Day *')}
                </label>
                <input
                  value={gMeetingDay}
                  onChange={(e) => setGMeetingDay(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  placeholder="हरेक शनिबार (Every Saturday)"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('बैठक समय *', 'Meeting Time *')}
                </label>
                <input
                  value={gMeetingTime}
                  onChange={(e) => setGMeetingTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  placeholder="07:30 AM"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Committee Leadership */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
            <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
              {t('३. समूह कार्यसमिति नेतृत्व', '3. Committee Leadership')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('समूह अध्यक्ष', 'Chairperson')}
                </label>
                <input
                  value={gChairperson}
                  onChange={(e) => setGChairperson(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  placeholder="जस्तै: सुनिता थारु"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('समूह सचिव', 'Secretary')}
                </label>
                <input
                  value={gSecretary}
                  onChange={(e) => setGSecretary(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  placeholder="जस्तै: रीता चौधरी"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('समूह कोषाध्यक्ष', 'Treasurer')}
                </label>
                <input
                  value={gTreasurer}
                  onChange={(e) => setGTreasurer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  placeholder="जस्तै: कमला शर्मा"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Financial Targets & Field Officer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('मासिक अनिवार्य बचत (रु.)', 'Monthly Mandatory Savings')}
              </label>
              <input
                type="number"
                value={gMandatoryContribution}
                onChange={(e) => setGMandatoryContribution(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                step={100}
                min={100}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('मासिक संकलन लक्ष्य (रु.)', 'Monthly Target Collection')}
              </label>
              <input
                type="number"
                value={gTarget}
                onChange={(e) => setGTarget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                step={1000}
                min={0}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('सम्बन्धित फिल्ड कर्मचारी', 'Assigned Field Officer')}
              </label>
              <select
                value={gFieldStaff}
                onChange={(e) => setGFieldStaff(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              >
                <option value="">{t('-- कर्मचारी छान्नुहोस् --', '-- Select Staff --')}</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition cursor-pointer"
            >
              {t('आमा समूह दर्ता गर्नुहोस्', 'Register Mother Group')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
