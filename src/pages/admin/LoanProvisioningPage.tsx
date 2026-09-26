import React, { useState, useMemo } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  STATUTORY_PROVISION_RULES,
  classifyLoanItem,
  buildProvisionSummaries,
  computePortfolioRiskRatios,
} from '../../utils/loanProvisioning';
import { LoanProvisionCategory, ClassifiedLoan } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Filter,
  FileSpreadsheet,
  Download,
  Gavel,
} from 'lucide-react';
import { BadDebtRecoveryModal } from '../../components/admin/BadDebtRecoveryModal';

export const LoanProvisioningPage: React.FC = () => {
  const { loans, members } = useCoopStore();
  const { t, fmtCurrency, fmtCount, fmtDigits, fmtPercent } = useLanguageStore();

  const [selectedFilter, setSelectedFilter] = useState<LoanProvisionCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [simulatedOverdueDays, setSimulatedOverdueDays] = useState<Record<string, number>>({});
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [selectedRecoveryLoanId, setSelectedRecoveryLoanId] = useState<string | undefined>(undefined);

  // Build classified loans list with member linkages and interactive overdue days
  const classifiedLoans: ClassifiedLoan[] = useMemo(() => {
    return loans.map((loan, idx) => {
      const member = members.find((m) => m.id === loan.memberId);
      // Give simulated demo days if not manually modified
      const defaultDays =
        loan.status === 'OVERDUE'
          ? 45 + (idx % 3) * 60
          : (idx % 5 === 0 ? 15 : 0);
      const days = simulatedOverdueDays[loan.id] ?? defaultDays;
      return classifyLoanItem(loan, member, days);
    });
  }, [loans, members, simulatedOverdueDays]);

  const summaries = useMemo(
    () => buildProvisionSummaries(classifiedLoans),
    [classifiedLoans]
  );
  const riskMetrics = useMemo(
    () => computePortfolioRiskRatios(classifiedLoans),
    [classifiedLoans]
  );

  const filteredLoans = useMemo(() => {
    return classifiedLoans.filter((l) => {
      const matchesCategory =
        selectedFilter === 'ALL' || l.category === selectedFilter;
      const matchesSearch =
        l.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.loanNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.memberNo.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [classifiedLoans, selectedFilter, searchTerm]);

  const handleUpdateDays = (loanId: string, days: number) => {
    setSimulatedOverdueDays((prev) => ({
      ...prev,
      [loanId]: Math.max(0, days),
    }));
  };

  const exportCsv = () => {
    const headers = [
      'Loan No',
      'Member No',
      'Member Name',
      'Loan Type',
      'Principal',
      'Balance',
      'Overdue Days',
      'Category',
      'Provision %',
      'Required Provision (NPR)',
    ];
    const rows = classifiedLoans.map((l) => [
      l.loanNo,
      l.memberNo,
      `"${l.memberName}"`,
      `"${l.loanType}"`,
      l.principalAmount,
      l.remainingBalance,
      l.overdueDays,
      l.category,
      l.provisionPercent,
      l.requiredProvisionAmount,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Unako_Loan_Loss_Provisioning_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                {t('सहकारी ऐन २०७४ र नियमनकारी मापदण्ड', 'Cooperative Act 2074 & Regulatory Norms')}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                {t('अनिवार्य लेखा परीक्षण', 'Statutory Audit')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('कर्जा नोक्सानी व्यवस्थापन (Loan Loss Provisioning)', 'Loan Loss Provisioning Register')}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              {t(
                'भाखा नाघेको अवधिका आधारमा कर्जाको वर्गीकरण (असल, सूक्ष्म निगरानी, कमसल, शंकास्पद, खराब) र आवश्यक सुरक्षण जगेडा कोष गणना',
                'Classification of credit assets by days overdue (Good, Watchlist, Substandard, Doubtful, Bad) and statutory provisioning reserve calculations.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedRecoveryLoanId(undefined);
                setIsRecoveryModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Gavel className="size-4" />
              <span>{t('कानूनी असुली तथा अपलेखन', 'Legal Recovery & Write-off')}</span>
            </button>

            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm"
            >
              <Download className="size-4" />
              <span>{t('सी.एस.भी. डाउनलोड', 'Export CSV')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">
            {t('कुल सक्रिय कर्जा लगानी', 'Total Loan Portfolio')}
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {fmtCurrency(riskMetrics.totalPortfolioBalance, true)}
          </div>
          <p className="text-xs text-slate-500">
            {fmtCount(riskMetrics.totalLoansCount)} {t('वटा चालु कर्जा खाताहरू', 'active loan accounts')}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs text-rose-500 font-bold uppercase">
            {t('अनिवार्य नोक्सानी जगेडा रकम', 'Total Provision Required')}
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {fmtCurrency(riskMetrics.totalRequiredProvision, true)}
          </div>
          <p className="text-xs text-slate-500">
            {t('नाफा नोक्सान हिसाबमा खर्च लेखिनुपर्ने', 'Direct charge against surplus')}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">
              {t('निष्क्रिय कर्जा अनुपात (NPL)', 'Non-Performing Loan (NPL)')}
            </span>
            {riskMetrics.nplRatioPercent > 5 ? (
              <AlertTriangle className="size-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="size-4 text-emerald-500" />
            )}
          </div>
          <div
            className={`text-2xl font-black ${
              riskMetrics.nplRatioPercent > 5 ? 'text-amber-500' : 'text-emerald-500'
            }`}
          >
            {fmtPercent(riskMetrics.nplRatioPercent)}
          </div>
          <p className="text-xs text-slate-500">
            {t('नियामक सीमा: ५% भन्दा कम हुनुपर्ने', 'Regulatory limit: < 5.0%')}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">
            {t('जोखिम सुरक्षण कभरेज', 'Provision Coverage Ratio')}
          </span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {fmtPercent(riskMetrics.coverageRatioPercent)}
          </div>
          <p className="text-xs text-slate-500">
            {t('NPL कर्जा विरूद्ध जगेडा सुरक्षा', 'Coverage against delinquent loans')}
          </p>
        </div>
      </div>

      {/* Statutory Buckets Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('नेपाल सरकार तोकेको कर्जा वर्गीकरण तथा नोक्सानी तालिका', 'Statutory Classification & Provisioning Table')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('सहकारी नियमावली तथा निर्देशन अनुसार प्रत्येक वर्गका लागि तोकिएको जगेडा प्रतिशत', 'Regulatory reserve rates by aging category')}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {t('५ वटा वैधानिक वर्गहरू', '5 Statutory Buckets')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">{t('कर्जा वर्ग (Category)', 'Category')}</th>
                <th className="px-4 py-3">{t('भाखा नाघेको अवधि', 'Overdue Days')}</th>
                <th className="px-4 py-3">{t('कर्जा संख्या', 'Loan Count')}</th>
                <th className="px-4 py-3">{t('कुल बाँकी साँवा रकम', 'Outstanding Balance')}</th>
                <th className="px-4 py-3 text-center">{t('तोकिएको दर (%)', 'Rate (%)')}</th>
                <th className="px-4 py-3 text-right">{t('आवश्यक जगेडा (रु.)', 'Required Provision')}</th>
                <th className="px-4 py-3 rounded-r-lg text-center">{t('अवस्था', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {summaries.map((summary) => {
                const rule = STATUTORY_PROVISION_RULES.find((r) => r.category === summary.category);
                return (
                  <tr
                    key={summary.category}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      selectedFilter === summary.category ? 'bg-slate-100/80 dark:bg-slate-800/70 font-semibold' : ''
                    }`}
                    onClick={() =>
                      setSelectedFilter((prev) => (prev === summary.category ? 'ALL' : summary.category))
                    }
                  >
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {t(summary.nameNepali, summary.nameEnglish)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono">
                      {rule?.maxOverdueDays !== null
                        ? `${fmtDigits(rule?.minOverdueDays)} - ${fmtDigits(rule?.maxOverdueDays)} ${t('दिन', 'Days')}`
                        : `> ${fmtDigits(rule?.minOverdueDays)} ${t('दिन (१ वर्ष भन्दा बढी)', 'Days (> 1 Year)')}`}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {fmtCount(summary.loanCount)}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {fmtCurrency(summary.totalOutstanding, true)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {fmtPercent(summary.provisionPercent)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      {fmtCurrency(summary.provisionAmount, true)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          summary.isNpl
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        {summary.isNpl ? t('निष्क्रिय (NPL)', 'NPL') : t('सक्रिय (Performing)', 'Performing')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Loans Classification & Interactive Simulator */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('ऋणीगत कर्जा वर्गीकरण अभिलेख', 'Individual Loan Provisioning Records')}
            </h3>
            <p className="text-xs text-slate-400">
              {t(
                'प्रत्येक ऋणीको भाखा नाघेको दिन र आवश्यक जगेडा रकम (दिन परिवर्तन गरी परीक्षण गर्न सकिन्छ)',
                'Audit loan-by-loan aging. You can test aging adjustments to inspect real-time provisioning impacts.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder={t('ऋणी वा कर्जा नं. खोज्नुहोस्...', 'Search borrower or loan no...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3.5 py-1.5 pl-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
              />
              <Filter className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setSelectedFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedFilter === 'ALL'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('सबै', 'All')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('GOOD')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedFilter === 'GOOD'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('असल (1%)', 'Good')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('BAD')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedFilter === 'BAD'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('खराब (100%)', 'Bad')}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">{t('कर्जा नं. / प्रकार', 'Loan No & Type')}</th>
                <th className="px-4 py-3">{t('ऋणी सदस्य', 'Borrower Member')}</th>
                <th className="px-4 py-3">{t('बाँकी साँवा', 'Balance')}</th>
                <th className="px-4 py-3">{t('भाखा नाघेको दिन (Days)', 'Overdue Days')}</th>
                <th className="px-4 py-3">{t('वर्ग (Category)', 'Category')}</th>
                <th className="px-4 py-3 text-right">{t('नोक्सानी जगेडा', 'Provision (NPR)')}</th>
                <th className="px-4 py-3 text-center rounded-r-lg">{t('कानूनी कार्य', 'Legal Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLoans.map((l) => (
                <tr key={l.loanId} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{fmtDigits(l.loanNo)}</span>
                    <p className="text-[10px] text-slate-400">{l.loanType}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 dark:text-white">{l.memberName}</span>
                    <p className="text-[10px] font-mono text-slate-400">{fmtDigits(l.memberNo)}</p>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {fmtCurrency(l.remainingBalance, true)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={l.overdueDays}
                        onChange={(e) => handleUpdateDays(l.loanId, parseInt(e.target.value || '0', 10))}
                        className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                        title={t('भाखा नाघेको दिन परिमार्जन गरी तत्काल प्रभाव हेर्नुहोस्', 'Adjust days overdue to simulate provision')}
                      />
                      <span className="text-[10px] text-slate-400">{t('दिन', 'days')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        l.category === 'GOOD'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : l.category === 'WATCHLIST'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : l.category === 'SUBSTAND'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300'
                          : l.category === 'DOUBTFUL'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      }`}
                    >
                      {l.category} ({fmtPercent(l.provisionPercent)})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    {fmtCurrency(l.requiredProvisionAmount, true)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecoveryLoanId(l.loanId);
                        setIsRecoveryModalOpen(true);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-xs ${
                        l.category === 'BAD' || l.category === 'DOUBTFUL'
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      title={t('३५ दिने लिलाम सूचना वा अपलेखन प्रक्रिया', '35-day auction notice or write-off process')}
                    >
                      <Gavel className="size-3" />
                      <span>{t('असुली / लिलाम', 'Recovery')}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bad Debt Legal Recovery & Write-off Modal */}
      <BadDebtRecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        loans={loans}
        members={members}
        initialLoanId={selectedRecoveryLoanId}
      />
    </div>
  );
};
