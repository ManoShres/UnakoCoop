import React from 'react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { IdCard, UserPlus } from 'lucide-react';

interface EmployeeHeaderBannerProps {
  onAddEmployee: () => void;
  employeeSync: { state: string; source: string; message?: string };
}

export const EmployeeHeaderBanner: React.FC<EmployeeHeaderBannerProps> = ({
  onAddEmployee,
  employeeSync,
}) => {
  const { t } = useLanguageStore();

  const syncBadge = (() => {
    if (employeeSync.source === 'local') {
      return {
        label: t('स्थानीय डेमो मोड (सुपाबेस जोडिएको छैन)', 'Local demo mode (Supabase not connected)'),
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
        dot: 'bg-slate-400',
      };
    }
    if (employeeSync.state === 'syncing') {
      return {
        label: t('सुपाबेससँग सिंक हुँदैछ...', 'Syncing with Supabase...'),
        className: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300',
        dot: 'bg-blue-500 animate-pulse',
      };
    }
    if (employeeSync.state === 'error') {
      return {
        label: t('सिंक त्रुटि — स्थानीय प्रतिलिपि देखाइँदै', 'Sync error - showing local copy'),
        className: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300',
        dot: 'bg-rose-500',
      };
    }
    return {
      label: t('सुपाबेस लाइभ जडान सक्रिय', 'Supabase live - connected'),
      className: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    };
  })();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
          <IdCard className="size-4" />
          <span>{t('कर्मचारी तथा एचआर केन्द्रीय अभिलेख', 'CENTRAL EMPLOYEE & HR REGISTER')}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('कर्मचारी व्यवस्थापन तथा एचआर कन्सोल', 'Employee Management Suite')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t(
            'नयाँ कर्मचारी दर्ता, पद तथा शाखा तोकिएको विवरण, पोर्टल पहुँच भूमिका र कार्यक्षेत्र व्यवस्थापन।',
            'Onboard cooperative staff, configure postings, branches, portal access roles and ward coverage.'
          )}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${syncBadge.className}`}
          >
            <span className={`size-2 rounded-full ${syncBadge.dot}`}></span>
            {syncBadge.label}
          </span>
          {employeeSync.state === 'error' && employeeSync.message && (
            <span className="text-[10px] text-rose-500 max-w-xs truncate">{employeeSync.message}</span>
          )}
        </div>
      </div>

      <button
        onClick={onAddEmployee}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
        type="button"
      >
        <UserPlus className="size-4" />
        <span>{t('+ नयाँ कर्मचारी दर्ता', '+ Add New Employee')}</span>
      </button>
    </div>
  );
};
