import React from 'react';
import { PieChart, HeartPulse, Vote, ShieldCheck } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

export function ProfileMetricStats() {
  const { t } = useLanguageStore();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Metric 1 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
          <PieChart className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{t('कुल सेयर पुँजी', 'Total Share Capital')}</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono">रु. ५०,०००</h3>
          <p className="text-[11px] text-emerald-600 font-semibold">{t('५०० कित्ता बाँडफाँड', '500 Units Allotted')}</p>
        </div>
      </div>

      {/* Metric 2 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
          <HeartPulse className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{t('सदस्य कल्याण कोष', 'Member Welfare Fund')}</p>
          <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono">
            {t('सक्रिय', 'Active')}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {t('प्रीमियम चुक्ता', 'Paid in Full')}
          </p>
        </div>
      </div>

      {/* Metric 3 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
          <Vote className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{t('साधारण सभा मताधिकार', 'AGM Voting Right')}</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('योग्य', 'Eligible')}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {t('१ सदस्य १ मत सुरक्षित', '1 Member 1 Vote Guaranteed')}
          </p>
        </div>
      </div>

      {/* Metric 4 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{t('केवाइसी प्रमाणीकरण स्कोर', 'KYC Verification Score')}</p>
          <h3 className="text-lg font-bold text-emerald-600 font-mono">
            {t('१००% पूर्ण', '100% Complete')}
          </h3>
          <p className="text-[11px] text-emerald-600 font-medium">
            {t('केन्द्रीय सीबीएस सिंक', 'Synced with Live CBS')}
          </p>
        </div>
      </div>
    </div>
  );
}
