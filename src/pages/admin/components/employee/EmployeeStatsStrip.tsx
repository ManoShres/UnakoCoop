import React from 'react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { IdCard, CheckCircle2, Clock, Building } from 'lucide-react';

interface EmployeeStatsStripProps {
  totalEmployees: number;
  fieldOfficerCount: number;
  activeCount: number;
  onLeaveCount: number;
  branchCount: number;
}

export const EmployeeStatsStrip: React.FC<EmployeeStatsStripProps> = ({
  totalEmployees,
  fieldOfficerCount,
  activeCount,
  onLeaveCount,
  branchCount,
}) => {
  const { t, fmtCount } = useLanguageStore();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('कुल कर्मचारी', 'Total Employees')}
          </span>
          <IdCard className="size-4 text-blue-500" />
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          {fmtCount(totalEmployees)}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {t('क्षेत्र सहजकर्ता: ', 'Field officers: ')}
          {fmtCount(fieldOfficerCount)}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('कार्यरत', 'Active On Duty')}
          </span>
          <CheckCircle2 className="size-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
          {fmtCount(activeCount)}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('बिदामा', 'On Leave')}
          </span>
          <Clock className="size-4 text-amber-500" />
        </div>
        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
          {fmtCount(onLeaveCount)}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('शाखा कार्यस्थल', 'Branch Postings')}
          </span>
          <Building className="size-4 text-indigo-500" />
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          {fmtCount(branchCount)}
        </div>
      </div>
    </div>
  );
};
