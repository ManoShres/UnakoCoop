import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Users,
  Building,
  TrendingDown,
  Download,
  Printer,
  Sliders,
  CheckCircle2,
  GitBranch,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  calculateSingleObligorExposure,
  simulateNewLoanSolPreCheck,
  downloadSingleObligorCsv,
  STATUTORY_UNSECURED_SOL_PERCENT,
  STATUTORY_SECURED_SOL_PERCENT,
  DEFAULT_UNAKO_CORE_CAPITAL,
} from '../../utils/singleObligorEngine';
import { Loan, Member } from '../../types';

interface SingleObligorLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: readonly Loan[];
  members: readonly Member[];
}

export const SingleObligorLimitModal: React.FC<SingleObligorLimitModalProps> = ({
  isOpen,
  onClose,
  loans,
  members,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtCount, fmtPercent } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'BORROWERS' | 'FAMILY' | 'GUARANTEE' | 'PRECHECK'>('BORROWERS');
  const [coreCapital, setCoreCapital] = useState<number>(DEFAULT_UNAKO_CORE_CAPITAL);

  // Pre-check simulation state
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [proposedAmount, setProposedAmount] = useState<number>(1500000); // NPR 15 Lakhs
  const [isMortgageBacked, setIsMortgageBacked] = useState<boolean>(true);

  const baseline = useMemo(() => {
    return calculateSingleObligorExposure(loans, members, coreCapital);
  }, [loans, members, coreCapital]);

  const preCheckResult = useMemo(() => {
    return simulateNewLoanSolPreCheck(selectedMemberId, proposedAmount, isMortgageBacked, baseline);
  }, [selectedMemberId, proposedAmount, isMortgageBacked, baseline]);

  if (!isOpen) return null;

  const handleExportCsv = () => {
    downloadSingleObligorCsv(baseline);
  };

  const handlePrintMemo = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/60 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  {t('सहकारी ऐन २०७४ • दफा ५१', 'Coop Act 2074 • Sec 51')}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {t('एकल ग्राहक सीमा: विनाधितो १०% | धितोयुक्त १५%', 'SOL: Unsecured 10% | Secured 15%')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {t(
                  'एकल ग्राहक कर्जा सीमा (SOL) तथा एकाघर परिवार जोखिम अनुगमन',
                  'Single Obligor Limit (SOL) & Family Cross-Guarantee Portal'
                )}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Top KPI Banner */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {t('प्राथमिक पूँजी कोष (Core Capital)', 'Primary Core Capital')}
            </span>
            <strong className="text-white text-base block mt-0.5 font-mono">
              {fmtCurrency(baseline.coreCapital, true)}
            </strong>
            <span className="text-[10px] text-slate-400">
              {t('शेयर + जगेडा कोष', 'Share + Reserve')}
            </span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {t('विनाधितो १०% सीमा (Unsecured Cap)', 'Unsecured 10% Cap')}
            </span>
            <strong className="text-amber-400 text-base block mt-0.5 font-mono">
              {fmtCurrency(baseline.unsecuredSolLimit, true)}
            </strong>
            <span className="text-[10px] text-slate-400">
              {t('व्यक्तिगत/समूह कर्जा', 'Personal/Group Loan')}
            </span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {t('धितोयुक्त १५% सीमा (Secured Cap)', 'Secured 15% Cap')}
            </span>
            <strong className="text-emerald-400 text-base block mt-0.5 font-mono">
              {fmtCurrency(baseline.securedSolLimit, true)}
            </strong>
            <span className="text-[10px] text-slate-400">
              {t('घरजग्गा/धितो कर्जा', 'Mortgage/Collateral')}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl border ${
              baseline.portfolioComplianceStatus === 'COMPLIANT'
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                : baseline.portfolioComplianceStatus === 'WARNING'
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            }`}
          >
            <span className="block text-[10px] uppercase font-semibold">
              {t('सीमा उल्लंघन ऋणी संख्या', 'SOL Breaches')}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <strong className="text-base font-mono font-black">
                {fmtCount(baseline.breachedBorrowersCount)}
              </strong>
              <span className="text-[10px] font-bold">
                {t('जना ऋणी', 'Borrowers')}
              </span>
            </div>
            <span className="text-[10px] block">
              {baseline.portfolioComplianceStatus === 'COMPLIANT'
                ? t('सबै ऋणीहरू कानूनी सीमाभित्र', 'All Within SOL Limits')
                : t('दफा ५१ तत्काल कारबाही आवश्यक!', 'Immediate Remediation Req!')}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-5 pt-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('BORROWERS')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'BORROWERS'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="size-4" />
              <span>{t('शीर्ष ऋणी तथा SOL म्याट्रिक्स', 'Top Borrowers & SOL Matrix')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('FAMILY')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'FAMILY'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="size-4" />
              <span>{t('एकाघर परिवार संयुक्त कर्जा', 'Family Aggregate Exposure')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('GUARANTEE')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'GUARANTEE'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="size-4" />
              <span>{t('पारस्परिक जमानत जोखिम', 'Cross-Guarantee Tracker')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PRECHECK')}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'PRECHECK'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="size-4" />
              <span>{t('नयाँ कर्जा प्रवाह पूर्व-जाँच (Pre-Check)', 'New Loan Pre-Check')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-amber-900/60 transition cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>{t('CSV निर्यात', 'Export CSV')}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: Top Borrowers & SOL Matrix */}
          {activeTab === 'BORROWERS' && (
            <div className="space-y-4">
              {baseline.breachedBorrowersCount > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 flex items-center gap-3">
                  <AlertOctagon className="size-5 text-rose-400 shrink-0" />
                  <div>
                    <strong className="block text-white">
                      {t('दफा ५१ एकल ग्राहक कर्जा सीमा उल्लंघन अलर्ट!', 'Section 51 SOL Breach Warning!')}
                    </strong>
                    <span className="text-[11px]">
                      {fmtCount(baseline.breachedBorrowersCount)}{' '}
                      {t(
                        'जना ऋणीको कुल कर्जा प्राथमिक पूँजी कोषको १०% (विनाधितो) वा १५% (धितोयुक्त) सीमाभन्दा बढी छ।',
                        'borrower(s) exceed the statutory 10% unsecured or 15% secured core capital ceiling.'
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-inner">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5 w-8 text-center">#</th>
                      <th className="p-2.5">{t('ऋणी सदस्य', 'Borrower Details')}</th>
                      <th className="p-2.5 text-center">{t('कर्जा संख्या', 'Loans')}</th>
                      <th className="p-2.5 text-right">{t('विनाधितो मौज्दात', 'Unsecured')}</th>
                      <th className="p-2.5 text-right">{t('धितोयुक्त मौज्दात', 'Secured')}</th>
                      <th className="p-2.5 text-right">{t('कुल कर्जा (NPR)', 'Total Aggregate')}</th>
                      <th className="p-2.5 text-center">{t('पूँजी हिस्सा %', '% of Capital')}</th>
                      <th className="p-2.5 text-center">{t('SOL स्थिति', 'SOL Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {baseline.topBorrowers.map((b, idx) => (
                      <tr key={b.memberId} className="hover:bg-slate-900/40">
                        <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-2.5">
                          <div className="font-bold text-white">{b.memberName}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {b.memberNo} • {b.phone}
                          </div>
                        </td>
                        <td className="p-2.5 text-center font-mono">{b.totalLoansCount}</td>
                        <td className="p-2.5 text-right font-mono text-slate-300">
                          {fmtCurrency(b.totalUnsecuredBalance, true)}
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-300">
                          {fmtCurrency(b.totalSecuredBalance, true)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-white">
                          {fmtCurrency(b.totalAggregateBalance, true)}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-amber-400">
                          {b.totalExposurePercent}%
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                              b.complianceStatus === 'BREACH'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : b.complianceStatus === 'WARNING'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {b.complianceStatus === 'BREACH'
                              ? t('उल्लंघन (> १५%)', 'Breach (> 15%)')
                              : b.complianceStatus === 'WARNING'
                              ? t('जोखिम नजिक', 'Near Limit')
                              : t('कानूनी सीमाभित्र', 'Compliant')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Family Aggregate Exposure */}
          {activeTab === 'FAMILY' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <GitBranch className="size-4 text-amber-400" />
                  <span>
                    {t(
                      'दफा ५१ बमोजिम एकाघर परिवारका सदस्यहरूको संयुक्त कर्जा प्राथमिक पूँजी कोषको १५% भन्दा बढी हुन पाउँदैन।',
                      'Pursuant to Sec 51, combined exposure of undivided family members cannot exceed 15% of Core Capital.'
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {baseline.familyClusters.map((fam) => (
                  <div
                    key={fam.familyKey}
                    className={`p-4 rounded-xl border ${
                      fam.isBreached
                        ? 'bg-rose-950/30 border-rose-800/80'
                        : 'bg-slate-950 border-slate-800'
                    } space-y-2`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{fam.familyName}</h4>
                        <span className="text-[11px] text-slate-400">
                          {t('संलग्न सदस्यहरू:', 'Members:')} {fam.memberNames.join(', ')} ({fmtCount(fam.membersCount)} {t('जना', 'members')})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">{t('संयुक्त कर्जा मौज्दात', 'Aggregate Loan')}</span>
                          <strong className="text-white font-mono text-sm">{fmtCurrency(fam.totalFamilyBalance, true)}</strong>
                        </div>

                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                            fam.isBreached
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {fam.exposurePercentOfCapital}% (Max 15%)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Cross-Guarantee Tracker */}
          {activeTab === 'GUARANTEE' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-1">
                  <ShieldAlert className="size-4 text-amber-400" />
                  <span>{t('पारस्परिक क्रस-जमानत जोखिम अनुगमन', 'Mutual Cross-Guarantee Risk Tracker')}</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  {t(
                    'एक ऋणीले अर्को ऋणीको कर्जामा पारस्परिक जमानत बस्दा उत्पन्न हुने चक्रीय जोखिमको स्वचालित विश्लेषण।',
                    'Automated detection of reciprocal guarantee arrangements between borrowers.'
                  )}
                </p>
              </div>

              <div className="space-y-3">
                {baseline.crossGuaranteeAlerts.map((cg, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{cg.borrowerName}</span>
                        <span className="text-slate-500">↔</span>
                        <span className="font-bold text-amber-300">{cg.guarantorName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        कर्जा नं: {cg.loanId} • रकम: {fmtCurrency(cg.amount, true)} • द्विपक्षीय पारस्परिक जमानत (Mutual Guarantor)
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[10px]">
                      {t('समीक्षा आवश्यक', 'Action Req')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Pre-Check Simulator */}
          {activeTab === 'PRECHECK' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sliders className="size-4 text-amber-400" />
                  <span>{t('नयाँ कर्जा प्रवाह पूर्व-जाँच सिमुलेटर (SOL Pre-Check)', 'New Loan Pre-Check Simulator')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold mb-1">
                      {t('ऋणी सदस्य चयन गर्नुहोस्:', 'Select Borrower:')}
                    </label>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.memberNo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold mb-1">
                      {t('प्रस्तावित नयाँ कर्जा रकम (NPR):', 'Proposed Loan Amount:')}
                    </label>
                    <input
                      type="number"
                      value={proposedAmount}
                      onChange={(e) => setProposedAmount(Number(e.target.value) || 0)}
                      step="100000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold mb-1">
                      {t('कर्जाको धितो प्रकार:', 'Security Type:')}
                    </label>
                    <select
                      value={isMortgageBacked ? 'SECURED' : 'UNSECURED'}
                      onChange={(e) => setIsMortgageBacked(e.target.value === 'SECURED')}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                    >
                      <option value="SECURED">{t('धितोयुक्त कर्जा (१५% सीमा)', 'Mortgage Secured (15% Cap)')}</option>
                      <option value="UNSECURED">{t('विनाधितो/समूह कर्जा (१०% सीमा)', 'Unsecured/Group (10% Cap)')}</option>
                    </select>
                  </div>
                </div>

                {/* Pre-Check Outcome Card */}
                <div
                  className={`p-4 rounded-xl border ${
                    preCheckResult.isCompliant
                      ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-800/80 text-rose-300'
                  } space-y-2 mt-3`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {preCheckResult.isCompliant ? (
                        <CheckCircle2 className="size-5 text-emerald-400" />
                      ) : (
                        <AlertOctagon className="size-5 text-rose-400" />
                      )}
                      <strong className="text-white text-sm">
                        {preCheckResult.isCompliant
                          ? t('कर्जा प्रवाह कानूनसम्मत (SOL Compliant - Approved)', 'SOL Compliant - Permitted to Disburse')
                          : t('कर्जा प्रवाह अस्वीकृत! दफा ५१ सीमा उल्लंघन (SOL Breached - Rejected)', 'SOL Breached - Rejection Mandatory')}
                      </strong>
                    </div>

                    <span className="font-mono font-bold text-xs">
                      {t('अधिकतम सीमा:', 'Max Limit:')} {fmtCurrency(preCheckResult.maxAllowedLimit, true)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{t('हालको मौज्दात:', 'Current Balance:')}</span>
                      <strong className="font-mono">{fmtCurrency(preCheckResult.currentExposure, true)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{t('प्रस्तावित रकम:', 'Proposed Loan:')}</span>
                      <strong className="font-mono text-amber-300">{fmtCurrency(proposedAmount, true)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{t('प्रक्षेपित कुल कर्जा:', 'Projected Total:')}</span>
                      <strong className="font-mono">{fmtCurrency(preCheckResult.projectedExposure, true)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        {preCheckResult.isCompliant ? t('बाँकी हेडरुम:', 'Remaining Headroom:') : t('सीमा नाघेको रकम:', 'Breach Excess:')}
                      </span>
                      <strong
                        className={`font-mono ${
                          preCheckResult.isCompliant ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {preCheckResult.isCompliant
                          ? fmtCurrency(preCheckResult.headroomRemaining, true)
                          : fmtCurrency(preCheckResult.breachAmount, true)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintMemo}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
                >
                  <Printer className="size-4 text-amber-400" />
                  <span>{t('SOL प्रतिवेदन प्रिन्ट गर्नुहोस्', 'Print SOL Report')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>{t('सहकारी ऐन २०७४ दफा ५१ तथा जोखिम व्यवस्थापन निर्देशिका', 'Cooperative Act 2074 Sec 51 Compliant')}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
