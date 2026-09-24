import React from 'react';
import { Link } from 'react-router-dom';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Badge } from '../../components/ui/Badge';

export const AdminDashboardPage: React.FC = () => {
  const { members, applications } = useCoopStore();
  const { t, fmtCurrency, fmtCount, fmtPhone } = useLanguageStore();

  const pendingMembers = members.filter((m) => m.status === 'PENDING' || m.status === 'ACTION_REQUIRED');
  const pendingLoans = applications.filter((a) => a.status === 'SUBMITTED' || a.status === 'UNDER_COMMITTEE_REVIEW');
  const totalSavings = members.reduce((acc, m) => acc + m.totalSavings, 0);
  const totalLoans = members.reduce((acc, m) => acc + m.activeLoanBalance, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
              {t('केन्द्रीय सञ्चालक तथा लेखा समिति', 'Supervisory Committee')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('कार्यकारी सुशासन तथा जोखिम व्यवस्थापन ड्यासबोर्ड', 'Executive Governance & Risk Dashboard')}
            </h1>
            <p className="text-xs text-slate-500">
              {t(
                'वास्तविक समयमा सहकारी तरलता, कर्जा मूल्याङ्कन र डिजिटल केवाईसी प्रमाणीकरण',
                'Real-time cooperative liquidity, loan assessment, and KYC clearance'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/verifications"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              {t('केवाईसी प्रमाणीकरण सूची', 'Verify KYC Queue')} ({fmtCount(pendingMembers.length)})
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-6 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold">
            {t('कुल सदस्य बचत मौज्दात', 'Total Member Savings')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {fmtCurrency(totalSavings, true)}
          </div>
          <p className="text-xs text-emerald-500 font-semibold">
            {t('४ वटा सेवा केन्द्रहरूमा परिचालन', 'Mobilized Across 4 Branches')}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold">
            {t('सक्रिय कर्जा लगानी', 'Active Loan Portfolio')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-blue-500">
            {fmtCurrency(totalLoans, true)}
          </div>
          <p className="text-xs text-slate-500">{t('जोखिममा रहेको कर्जा: ०.८२%', 'Portfolio at Risk (PAR): 0.82%')}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold">
            {t('बाँकी केवाईसी प्रमाणीकरण', 'Pending KYC Verifications')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500">
            {fmtCount(pendingMembers.length)}
          </div>
          <p className="text-xs text-slate-500">{t('कागजात प्रमाणीकरण पर्खाइमा', 'Awaiting document validation')}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold">
            {t('कर्जा समिति निर्णय सूची', 'Credit Committee Queue')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-purple-500">
            {fmtCount(pendingLoans.length)}
          </div>
          <p className="text-xs text-slate-500">{t('मूल्याङ्कनका लागि तयार', 'Ready for evaluation')}</p>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Verifications */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('केवाईसी प्रमाणीकरण आवेदनहरू', 'KYC Verification Applications')}
            </h3>
            <Link to="/admin/verifications" className="text-xs font-bold text-blue-500 hover:underline">
              {t('सबै हेर्नुहोस् ->', 'View Queue ->')}
            </Link>
          </div>

          <div className="space-y-3">
            {members.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img src={m.avatarUrl} alt={m.name} className="size-9 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{m.memberNo} • {fmtPhone(m.phone)}</p>
                  </div>
                </div>
                <Badge status={m.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Loan Queue */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('कर्जा आवेदन मूल्यांकन सूची', 'Loan Applications Queue')}
            </h3>
            <Link to="/admin/loans" className="text-xs font-bold text-blue-500 hover:underline">
              {t('सबै हेर्नुहोस् ->', 'View Queue ->')}
            </Link>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 4).map((app) => (
              <div
                key={app.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{app.memberName}</h4>
                  <p className="text-[10px] text-slate-400">
                    {app.loanType} • {fmtCurrency(app.requestedAmount, true)}
                  </p>
                </div>
                <Badge status={app.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
