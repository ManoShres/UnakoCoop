import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Download,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Filter,
  FileSpreadsheet,
  FileJson,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  scanTransactionsForAml,
  generateAmlAuditSummary,
  downloadFiuGoAmlCsv,
  downloadFiuGoAmlJson,
  AmlAlert,
  AmlReportType,
  AmlStatus,
} from '../../utils/amlCompliance';
import { Member, Transaction, CoopSettings } from '../../types';

interface AmlComplianceCardProps {
  transactions: readonly Transaction[];
  members: readonly Member[];
  coopSettings: CoopSettings;
}

export const AmlComplianceCard: React.FC<AmlComplianceCardProps> = ({
  transactions,
  members,
  coopSettings,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtCount } = useLanguageStore();

  const [typeFilter, setTypeFilter] = useState<'ALL' | AmlReportType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AmlStatus>('ALL');
  const [showTable, setShowTable] = useState(true);

  // Transform transactions to AML input format
  const amlTxInputs = useMemo(() => {
    return transactions.map((tx) => ({
      id: tx.id,
      memberId: (tx as { memberId?: string }).memberId || 'MEM-001',
      amount: tx.amount,
      type: tx.type,
      channel: (tx as { channel?: string }).channel || 'CASH',
      date: tx.date,
      accountNo: (tx as { accountNo?: string }).accountNo || '004-10294-88-01',
    }));
  }, [transactions]);

  // Transform members to AML input format
  const amlMemberInputs = useMemo(() => {
    return members.map((m) => ({
      id: m.id,
      memberNo: m.memberNo,
      name: m.name,
      isPep: (m as { isPep?: boolean }).isPep || false,
      occupation: (m as { occupation?: string }).occupation || 'Agriculture',
      annualIncome: (m as { annualIncome?: number }).annualIncome || 500000,
    }));
  }, [members]);

  // Scan live alerts
  const [liveAlerts, setLiveAlerts] = useState<AmlAlert[]>(() =>
    scanTransactionsForAml(amlTxInputs, amlMemberInputs, 1000000)
  );

  const summary = useMemo(
    () => generateAmlAuditSummary(liveAlerts, amlTxInputs.length),
    [liveAlerts, amlTxInputs.length]
  );

  const filteredAlerts = useMemo(() => {
    return liveAlerts.filter((a) => {
      if (typeFilter !== 'ALL' && a.reportType !== typeFilter) return false;
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      return true;
    });
  }, [liveAlerts, typeFilter, statusFilter]);

  const handleStatusChange = (alertId: string, newStatus: AmlStatus) => {
    setLiveAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
    );
  };

  const handleExportCsv = () => {
    downloadFiuGoAmlCsv(liveAlerts, {
      name: coopSettings.name,
      nameNepali: coopSettings.nameNepali,
      regNo: coopSettings.regNo,
      panNo: '302918274',
    });
  };

  const handleExportJson = () => {
    downloadFiuGoAmlJson(liveAlerts, {
      name: coopSettings.name,
      nameNepali: coopSettings.nameNepali,
      regNo: coopSettings.regNo,
      panNo: '302918274',
    });
  };

  return (
    <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-rose-950/40 border border-slate-800 shadow-xl text-white space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30">
              <ShieldAlert className="size-3.5" />
              <span>{t('नेपाल राष्ट्र बैंक • FIU-Nepal goAML', 'NRB • FIU-Nepal goAML')}</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                summary.complianceStatus === 'COMPLIANT'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              {summary.complianceStatus === 'COMPLIANT' ? (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>{t('सम्पत्ति शुद्धीकरण अनुपालित', 'AML Compliant')}</span>
                </>
              ) : (
                <>
                  <AlertOctagon className="size-3.5 text-rose-400" />
                  <span>
                    {fmtCount(summary.ctrAlertsCount + summary.strAlertsCount)} {t('अलर्ट समीक्षा आवश्यक', 'Alerts Require Action')}
                  </span>
                </>
              )}
            </span>
          </div>

          <h3 className="text-base sm:text-xl font-black tracking-tight">
            {t(
              'सम्पत्ति शुद्धीकरण (AML/CFT) तथा वित्तीय जानकारी एकाइ (FIU) अनुगमन हब',
              'AML/CFT & Financial Information Unit (FIU-Nepal) goAML Hub'
            )}
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            {t(
              `सम्पत्ति शुद्धीकरण निवारण ऐन २०६४ बमोजिम रु १० लाख माथिका थ्रेसहोल्ड (CTR) तथा शंकास्पद खण्डीकरण (STR) कारोबारहरूको स्वचालित विश्लेषण र goAML ढाँचामा निर्यात।`,
              `Automated statutory screening of Cash Transactions >= NPR 1M (CTR), structuring patterns (STR), and Politically Exposed Persons (PEP) for FIU-Nepal reporting.`
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <FileSpreadsheet className="size-4" />
            <span>{t('FIU CSV निर्यात', 'Export FIU CSV')}</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs border border-rose-900/60 shadow-md transition cursor-pointer"
          >
            <FileJson className="size-4" />
            <span>{t('goAML JSON (API)', 'goAML JSON')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition cursor-pointer"
          >
            <span>{showTable ? t('तालिका लुकाउनुहोस्', 'Hide Table') : t('तालिका हेर्नुहोस्', 'View Table')}</span>
            {showTable ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
            {t('कुल स्क्यान कारोबार', 'Scanned Transactions')}
          </span>
          <strong className="text-white text-sm block mt-0.5">{fmtCount(summary.totalScannedTransactions)}</strong>
          <span className="text-[10px] text-slate-400">{t('१००% स्वचालित अडिट', '100% Automated')}</span>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-rose-900/40">
          <span className="text-rose-400 block text-[10px] uppercase font-semibold">
            {t('थ्रेसहोल्ड अलर्ट (CTR >= रु १० लाख)', 'CTR Alerts (>= 1M)')}
          </span>
          <strong className="text-rose-400 text-sm block mt-0.5">{fmtCount(summary.ctrAlertsCount)}</strong>
          <span className="text-[10px] text-slate-400">{t('दफा २१ प्रतिवेदन अनिवार्य', 'Sec 21 Mandatory')}</span>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-900/40">
          <span className="text-amber-400 block text-[10px] uppercase font-semibold">
            {t('शंकास्पद अलर्ट (STR / खण्डीकरण)', 'STR Structuring Alerts')}
          </span>
          <strong className="text-amber-400 text-sm block mt-0.5">{fmtCount(summary.strAlertsCount)}</strong>
          <span className="text-[10px] text-slate-400">{t('उच्च जोखिम ढाँचा', 'High Risk Patterns')}</span>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
            {t('कुल चिन्हित रकम', 'Flagged Exposure')}
          </span>
          <strong className="text-white text-sm block mt-0.5 font-mono">
            {fmtCurrency(summary.totalFlaggedAmount, true)}
          </strong>
          <span className="text-[10px] text-slate-400">
            {fmtCount(summary.highRiskMembersCount)} {t('सदस्यहरू संलग्न', 'Members Flagged')}
          </span>
        </div>
      </div>

      {/* Filterable Table */}
      {showTable && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <Filter className="size-3.5 text-slate-400" />
              <span className="text-slate-400 font-bold">{t('फिल्टर:', 'Filter:')}</span>
              {(['ALL', 'CTR', 'STR'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTypeFilter(mode)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    typeFilter === mode
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {(['ALL', 'PENDING_REVIEW', 'CLEARED', 'FIU_REPORTED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60 shadow-inner">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-8 text-center">#</th>
                    <th className="p-3">{t('अलर्ट प्रकार', 'Type')}</th>
                    <th className="p-3">{t('सदस्य विवरण', 'Member Details')}</th>
                    <th className="p-3 text-right">{t('कारोबार रकम', 'Amount')}</th>
                    <th className="p-3">{t('ट्रिगर कारण', 'Trigger Rule')}</th>
                    <th className="p-3 text-center">{t('गम्भीरता', 'Severity')}</th>
                    <th className="p-3 text-center">{t('अनुपालन स्थिति', 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAlerts.map((a, idx) => (
                    <tr key={a.id} className="hover:bg-slate-900/40 transition">
                      <td className="p-3 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                            a.reportType === 'CTR'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/80'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/80'
                          }`}
                        >
                          {a.reportType}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white">{a.memberName}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {a.memberNo} • {a.transactionDate}
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        {fmtCurrency(a.amount, true)}
                      </td>
                      <td className="p-3">
                        <div className="text-slate-200">{t(a.triggerReasonNepali, a.triggerReason)}</div>
                        <div className="text-[10px] font-mono text-slate-500">{a.ruleCode}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.severity === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-300'
                              : a.severity === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {a.severity}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <select
                          aria-label={t('अनुपालन स्थिति चयन गर्नुहोस्', 'Select AML compliance status')}
                          value={a.status}
                          onChange={(e) => handleStatusChange(a.id, e.target.value as AmlStatus)}
                          className="text-[11px] py-1 px-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 font-medium"
                        >
                          <option value="PENDING_REVIEW">{t('समीक्षा बाँकी (Pending)', 'Pending')}</option>
                          <option value="CLEARED">{t('प्रमाणीकरण सम्पन्न (Cleared)', 'Cleared')}</option>
                          <option value="FIU_REPORTED">{t('FIU मा प्रेषित (Reported)', 'Reported')}</option>
                          <option value="ESCALATED">{t('थप अनुसन्धान (Escalated)', 'Escalated')}</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filteredAlerts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        {t('कुनै AML/CFT अलर्ट फेला परेन।', 'No AML/CFT alerts found matching criteria.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
