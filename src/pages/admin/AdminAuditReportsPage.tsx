import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import { generateCopomisXml, generateCopomisCsv, triggerBrowserDownload } from '../../utils/copomisExport';
import { generateReportsForPeriod, summariseReport, generateReportCsv } from '../../services/reportService';
import {
  ShieldCheck,
  FileText,
  Download,
  Upload,
  Search,
  CheckCircle2,
  History,
  Lock,
  FileCheck,
  Building,
  Layers,
} from 'lucide-react';

interface AuditReport {
  id: string;
  title: string;
  titleNepali: string;
  category: 'FINANCIAL' | 'REGULATORY' | 'GOVERNANCE' | 'SUPERVISORY' | 'OPERATIONAL';
  fiscalYear: string;
  period: string;
  auditor: string;
  rating: string;
  size: string;
  publishDate: string;
  status: 'PUBLISHED' | 'INTERNAL_REVIEW' | 'DRAFT';
  metrics: number;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminUser: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FLAGGED';
}

export const AdminAuditReportsPage: React.FC = () => {
  const {
    members,
    savings,
    loans,
    transactions,
    motherGroups,
    motherGroupMembers,
    motherGroupMeetings,
    motherGroupDeposits,
    tradingTransactions,
    bankStatements,
    reconciliationEntries,
    coopSettings,
  } = useCoopStore();
  const { t, lang, fmtCurrency, fmtCount, fmtPercent, fmtDigits } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'LOGS' | 'COMPLIANCE'>('REPORTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const handleExportCopomisXml = () => {
    const xml = generateCopomisXml({
      coopSettings,
      members,
      savings,
      loans,
      fiscalYear: '2081/82',
    });
    triggerBrowserDownload(
      xml,
      `COPOMIS_${coopSettings.regNo.replace(/[^0-9]/g, '')}_FY2081_82.xml`,
      'application/xml'
    );
  };

  const handleExportCopomisCsv = () => {
    const csv = generateCopomisCsv(members);
    triggerBrowserDownload(
      csv,
      `COPOMIS_Members_${coopSettings.regNo.replace(/[^0-9]/g, '')}.csv`,
      'text/csv'
    );
  };

  // ---------------------------------------------------------------------------
  // Dynamic report generation — computed live from cooperative store data
  // (members, savings, loans, mother groups, trading ledger, reconciliation).
  // ---------------------------------------------------------------------------
  const reports: AuditReport[] = useMemo(() => {
    const generated = generateReportsForPeriod({
      members,
      savings,
      loans,
      transactions,
      motherGroups,
      motherGroupMembers,
      motherGroupMeetings,
      motherGroupDeposits,
      tradingTransactions,
      bankStatements,
      reconciliationEntries,
      fiscalYear: '2082/83',
      period: 'FY 2082/83 (Live)',
      generatedBy: 'SYSTEM-AUTO',
      generatedByName: 'CBS Report Engine',
    });

    return generated.map((g) => ({
      id: g.id.toUpperCase(),
      title: g.title,
      titleNepali: g.titleNepali,
      category: g.category,
      fiscalYear: g.fiscalYear,
      period: g.period,
      auditor: g.generatedByName ?? 'CBS Report Engine (Auto)',
      rating: summariseReport(g, lang),
      size: `${(JSON.stringify(g.data).length / 1024).toFixed(1)} KB JSON`,
      publishDate: g.generatedAt.slice(0, 10),
      status: 'PUBLISHED' as const,
      metrics: Object.keys(g.data).length,
    }));
  }, [
    members,
    savings,
    loans,
    transactions,
    motherGroups,
    motherGroupMembers,
    motherGroupMeetings,
    motherGroupDeposits,
    tradingTransactions,
    bankStatements,
    reconciliationEntries,
    lang,
  ]);

  const handleDownloadReportCsv = (report: AuditReport) => {
    const generated = generateReportsForPeriod({
      members,
      savings,
      loans,
      transactions,
      motherGroups,
      motherGroupMembers,
      motherGroupMeetings,
      motherGroupDeposits,
      tradingTransactions,
      bankStatements,
      reconciliationEntries,
      fiscalYear: '2082/83',
      period: 'FY 2082/83 (Live)',
      generatedBy: 'SYSTEM-AUTO',
      generatedByName: 'CBS Report Engine',
    });
    const match = generated.find((g) => g.id.toUpperCase() === report.id);
    if (match) {
      triggerBrowserDownload(
        generateReportCsv(match),
        `${report.id}.csv`,
        'text/csv'
      );
    }
  };

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'LOG-98214',
      timestamp: '2026-03-17 18:42:10',
      adminUser: 'Admin Ram Shrestha (ID: AD-01)',
      action: 'APPROVE_KYC',
      module: 'Member Verification',
      details: 'Verified Citizenship and Land Deed for member UK-88219 (Ram Bahadur Shrestha).',
      ipAddress: '192.168.1.45 (CBS Lamahi Node)',
      status: 'SUCCESS',
    },
    {
      id: 'LOG-98213',
      timestamp: '2026-03-17 18:24:05',
      adminUser: 'Admin Ram Shrestha (ID: AD-01)',
      action: 'UPDATE_LIMIT',
      module: 'Transfers & Gateways',
      details: 'Adjusted eSewa & ConnectIPS daily cap to NPR 200,000.',
      ipAddress: '192.168.1.45 (CBS Lamahi Node)',
      status: 'SUCCESS',
    },
    {
      id: 'LOG-98212',
      timestamp: '2026-03-17 17:55:30',
      adminUser: 'Officer Sita Chaudhary (ID: FO-09)',
      action: 'INSPECT_COLLATERAL',
      module: 'Loans & Credit',
      details: 'Inspected Lalpurja Deed Plot 412 for Loan Application APP-2026-0901.',
      ipAddress: '192.168.1.88 (Gadhwa Counter 2)',
      status: 'SUCCESS',
    },
    {
      id: 'LOG-98211',
      timestamp: '2026-03-17 16:10:12',
      adminUser: 'System Scheduler',
      action: 'DIVIDEND_ACCRUAL_CALC',
      module: 'Shares Capital',
      details: 'Executed quarterly dividend accrual dry-run for 8,500 active shareholders.',
      ipAddress: 'CBS Core Daemon',
      status: 'SUCCESS',
    },
  ];

  const filteredReports = reports.filter((r) => {
    const matchesCat = categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.auditor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fiscalYear.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {t('लेखापरीक्षण तथा पारदर्शिता कन्सोल', 'Audit & Transparency Console')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              {t('सीबीएस अनुपालन प्रमाणित', 'CBS Compliance Verified')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'लेखापरीक्षण वित्तीय विवरण, कानुनी नियामक फाइलिङ तथा सुरक्षित प्रशासकीय अडिट ट्रेल निरीक्षण गर्नुहोस्।',
              'Supervise audited financial disclosures, statutory regulatory filings, and immutable administrative audit trails.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCopomisXml}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold shadow-xs transition cursor-pointer"
            title={t('मन्त्रालय कोपोमिस मानक XML डाटा डाउनलोड गर्नुहोस्', 'Download Ministry COPOMIS Standard XML Data')}
          >
            <Download className="size-4" />
            <span>{t('कोपोमिस XML', 'COPOMIS XML')}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCopomisCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-bold shadow-xs transition cursor-pointer"
            title={t('एक्सेलको लागि लेजर निर्यात गर्नुहोस्', 'Export Ledger for Excel')}
          >
            <Download className="size-4" />
            <span>{t('CSV निर्यात', 'Export CSV')}</span>
          </button>

          <button
            type="button"
            onClick={() => alert(t('नयाँ वैधानिक लेखापरीक्षण प्रतिवेदन अपलोड प्रणाली तयार छ।', 'New Statutory Audit Report Upload is ready for CBS dispatch.'))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Upload className="size-4" />
            <span>{t('+ लेखापरीक्षण प्रतिवेदन अपलोड', '+ Upload Audit Report')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('वैधानिक राय', 'Statutory Opinion')}</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{t('विवादरहित स्वच्छ राय', 'Unqualified Clean')}</div>
          <p className="text-[11px] text-emerald-600 font-medium">Regmi & Associates, CAs</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('पुँजी पर्याप्तता', 'Capital Adequacy (CAR)')}</span>
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">{fmtPercent('18.4')}</div>
          <p className="text-[11px] text-slate-500">{t('नियामक न्यूनतम: ', 'Regulatory Min: ')}{fmtPercent('10.0')}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('पर्ल्स तरलता अनुपात', 'PEARLS Liquidity Ratio')}</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <Layers className="size-4" />
            </span>
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{fmtPercent('24.1')}</div>
          <p className="text-[11px] text-slate-500">{t('मापदण्ड दायरा: ', 'Standard Band: ')}{fmtPercent(15)} - {fmtPercent(20)}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('सीबीएस सुरक्षा अडिट', 'CBS Security Audit')}</span>
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600">
              <Lock className="size-4" />
            </span>
          </div>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400">{fmtPercent(100)} {t('अपरिवर्तनीय', 'Immutable')}</div>
          <p className="text-[11px] text-slate-500">{t('शून्य हेरफेर प्रमाणीकरण', 'Zero Tampering Detected')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('REPORTS')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'REPORTS'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="size-4" />
          <span>{t('वैधानिक लेखापरीक्षण विवरणहरू', 'Statutory Audit Disclosures')} ({fmtCount(reports.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'LOGS'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <History className="size-4" />
          <span>{t('सीबीएस प्रशासकीय कार्य लग', 'CBS Admin Action Audit Log')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLIANCE')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'COMPLIANCE'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="size-4" />
          <span>{t('सहकारी ऐन तथा नियामक मापदण्ड', 'Cooperative Act & Regulatory Standards')}</span>
        </button>
      </div>

      {/* TAB 1: REPORTS */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('प्रतिवेदन, लेखापरीक्षक, आर्थिक वर्ष खोज्नुहोस्...', 'Search report name, auditor, fiscal year...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {([
                { key: 'ALL', label: t('सबै', 'ALL') },
                { key: 'FINANCIAL', label: t('वित्तीय', 'FINANCIAL') },
                { key: 'REGULATORY', label: t('नियामक', 'REGULATORY') },
                { key: 'GOVERNANCE', label: t('सुशासन', 'GOVERNANCE') },
                { key: 'SUPERVISORY', label: t('सुपरिवेक्षण', 'SUPERVISORY') },
                { key: 'OPERATIONAL', label: t('सञ्चालन', 'OPERATIONAL') },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    categoryFilter === key
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-4 font-semibold">{t('प्रतिवेदन विवरण', 'Report Dossier')}</th>
                    <th className="p-4 font-semibold">{t('वर्ग', 'Category')}</th>
                    <th className="p-4 font-semibold">{t('आर्थिक अवधि', 'Fiscal Period')}</th>
                    <th className="p-4 font-semibold">{t('स्वतन्त्र लेखापरीक्षक / निकाय', 'Independent Auditor / Authority')}</th>
                    <th className="p-4 font-semibold">{t('वैधानिक निष्कर्ष', 'Statutory Conclusion')}</th>
                    <th className="p-4 font-semibold text-right">{t('कार्य', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <FileCheck className="size-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white leading-snug">
                              {t(r.titleNepali, r.title)}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-serif mt-0.5">{r.titleNepali}</p>
                            <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                              {r.id} • {r.size} • {fmtCount(r.metrics)} {t('मापदण्डहरू', 'data metrics')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {r.category}
                        </span>
                      </td>

                      <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                        {fmtDigits(r.fiscalYear)}
                        <span className="text-[10px] text-slate-400 block">{fmtDigits(r.period)}</span>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        <span className="font-semibold block">{r.auditor}</span>
                        <span className="text-[10px] text-slate-400">{t('प्रकाशित:', 'Published:')} {fmtDigits(r.publishDate)}</span>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                          <CheckCircle2 className="size-3.5 shrink-0" />
                          <span>{r.rating}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDownloadReportCsv(r)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
                        >
                          <Download className="size-3.5" />
                          <span>{t('डाउनलोड', 'Download')}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="size-4 shrink-0" />
              <span>
                {t(
                  'सीबीएस सुरक्षित प्रशासकीय अडिट ट्रेल: हरेक मौज्दात समायोजन, केवाइसी प्रमाणीकरण र ऋण स्वीकृति डिजिटल हस्ताक्षरद्वारा सुरक्षित गरिएको छ।',
                  'CBS Immutable Administrative Audit Log: Every balance adjustment, KYC authorization, and loan sanction is signed cryptographically.'
                )}
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold">{t('अडिट विन्डो: पछिल्लो ३० दिन', 'Audit Window: Last 30 Days')}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-4 font-semibold">{t('समय', 'Timestamp')}</th>
                    <th className="p-4 font-semibold">{t('प्रशासक प्रयोगकर्ता', 'Admin User')}</th>
                    <th className="p-4 font-semibold">{t('मोड्युल', 'Module')}</th>
                    <th className="p-4 font-semibold">{t('कार्य', 'Action')}</th>
                    <th className="p-4 font-semibold">{t('विवरण तथा लक्षित सदस्य', 'Details & Target Member')}</th>
                    <th className="p-4 font-semibold">{t('टर्मिनल / आईपी', 'Terminal / IP')}</th>
                    <th className="p-4 font-semibold text-right">{t('स्थिति', 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                      <td className="p-4 font-mono text-slate-500 whitespace-nowrap">{fmtDigits(log.timestamp)}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{log.adminUser}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                          {log.module}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{log.action}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 max-w-sm leading-relaxed">{log.details}</td>
                      <td className="p-4 font-mono text-slate-400 text-[11px]">{fmtDigits(log.ipAddress)}</td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          <CheckCircle2 className="size-3" /> {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLIANCE */}
      {activeTab === 'COMPLIANCE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <Building className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('सहकारी ऐन २०७४ अनुपालन', 'Cooperative Act 2074 Compliance')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('नेपाल सरकार कानुनी नियामक मापदण्ड', 'Government of Nepal Regulatory Standards')}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span>{t('वार्षिक साधारण सभा विन्डो:', 'Annual General Meeting (AGM) Window:')}</span>
                <span className="font-bold text-emerald-600">{t('पौष महिनाभित्र सम्पन्न', 'Conducted within Poush')}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span>{t('जगेडा कोष विनियोजन:', 'Statutory Reserve Allocation:')}</span>
                <span className="font-bold text-emerald-600">{t('२५.०% खुद नाफा (न्यूनतम २०%)', '25.0% Net Profit (Min 20%)')}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span>{t('सहकारी शिक्षा कोष:', 'Cooperative Education Fund:')}</span>
                <span className="font-bold text-emerald-600">{t('५.०% खुद नाफा विनियोजित', '5.0% Net Profit Allocated')}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span>{t('एकल ऋणी सीमा:', 'Single Borrower Exposure Limit:')}</span>
                <span className="font-bold text-emerald-600">{t('कुल पुँजीको १०% भन्दा कम', 'Cap < 10% Total Capital')}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('नेपाल राष्ट्र बैंक तथा गोएएमएल सुपरिवेक्षण', 'Nepal Rastra Bank & GoAML Supervision')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('वित्तीय शुद्धता तथा सम्पत्ति शुद्धीकरण निवारण', 'Financial Integrity & Anti-Money Laundering')}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span>{t('सीमा कारोबार प्रतिवेदन:', 'Threshold Transaction Reporting (TTR):')}</span>
                <span className="font-bold text-emerald-600">{t('रु. १० लाख माथि स्वचालित', 'Automated > NPR 1,000,000')}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span>{t('शंकास्पद कारोबार प्रतिवेदन:', 'Suspicious Transaction Reporting (STR):')}</span>
                <span className="font-bold text-emerald-600">{t('FIU मा तत्काल प्रेषण', 'Real-time FIU Dispatch')}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span>{t('बायोमेट्रिक सदस्य प्रमाणीकरण:', 'Biometric Member Verification:')}</span>
                <span className="font-bold text-emerald-600">{t('१००% सक्रिय सेयरधनी', '100% Active Shareholders')}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span>{t('स्वतन्त्र आन्तरिक लेखापरीक्षक:', 'Independent Internal Auditor:')}</span>
                <span className="font-bold text-emerald-600">{t('मासिक सुपरिवेक्षण समीक्षा', 'Monthly Supervisory Reviews')}</span>
              </div>
            </div>
          </div>

          {/* COPOMIS Card */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-800/50 shadow-md text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                  <ShieldCheck className="size-3.5" />
                  <span>{t('नेपाल सरकार • सहकारी विभाग', 'Government of Nepal • Dept. of Cooperatives')}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {t(
                    'कोपोमिस (सहकारी व्यवस्थापन सूचना प्रणाली) नियामक निर्यात',
                    'COPOMIS (Cooperative Management Information System) Regulatory Export'
                  )}
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {t(
                    `सहकारी विभागको कोपोमिस XML संरचना v2.5 अनुसार ${coopSettings.nameNepali} (दर्ता नं: ${coopSettings.regNo}) को आधिकारिक वैधानिक प्रतिवेदन डाटा निर्यात गर्नुहोस्।`,
                    `Export standardized statutory reporting data for ${coopSettings.nameNepali} (Reg: ${coopSettings.regNo}) formatted in accordance with the Department of Cooperatives COPOMIS XML schema v2.5.`
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportCopomisXml}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <Download className="size-4" />
                  <span>{t('कोपोमिस XML डाउनलोड', 'Download COPOMIS XML')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCopomisCsv}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 shadow-md transition cursor-pointer"
                >
                  <Download className="size-4" />
                  <span>{t('सदस्य CSV निर्यात', 'Export Member CSV')}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">{t('दर्ता सदस्यहरू', 'Registered Members')}</span>
                <strong className="text-white text-sm">{members.length} {t('खाताहरू', 'Accounts')}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">{t('कुल सेयर पुँजी', 'Total Share Capital')}</span>
                <strong className="text-white text-sm">
                  {fmtCurrency(members.reduce((s, m) => s + m.shareCapital, 0), true)}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">{t('कुल सक्रिय बचत', 'Total Active Savings')}</span>
                <strong className="text-white text-sm">
                  {fmtCurrency(members.reduce((s, m) => s + m.totalSavings, 0), true)}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">{t('सक्रिय ऋण खाता', 'Active Loan Ledgers')}</span>
                <strong className="text-white text-sm">{loans.length} {t('प्रवाह', 'Disbursed')}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
