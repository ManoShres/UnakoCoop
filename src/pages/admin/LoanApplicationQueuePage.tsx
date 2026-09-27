import React, { useState, useEffect } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { LoanApplication, LOAN_SCHEMES } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LoanOriginationModal } from '../../components/admin/LoanOriginationModal';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  DollarSign,
  ShieldCheck,
  X,
  Check,
  FileText,
  Landmark,
  User,
  Building,
  PlusCircle,
  Scale,
  AlertTriangle,
  ShieldAlert,
  Award,
} from 'lucide-react';
import { CreditRiskRatingModal } from '../../components/admin/CreditRiskRatingModal';
import { evaluateLoanSafetyGate } from '../../utils/loanLtvCalculator';

export const LoanApplicationQueuePage: React.FC = () => {
  const { applications, updateApplicationStatus, members } = useCoopStore();
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [previewDoc, setPreviewDoc] = useState<{ title: string; image: string; meta: string } | null>(null);
  const [showOriginateModal, setShowOriginateModal] = useState(false);
  const [showCreditScoringModal, setShowCreditScoringModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedApp && !previewDoc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (previewDoc) {
          setPreviewDoc(null);
        } else if (selectedApp) {
          setSelectedApp(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedApp, previewDoc]);

  const safetyEval = React.useMemo(() => {
    if (!selectedApp) return null;
    const colVal = selectedApp.collateralEstimatedValue || 1200000;
    const colType = selectedApp.collateralType || 'LAND_LALPURJA';
    const rate = selectedApp.interestRate || 11.5;
    return evaluateLoanSafetyGate({
      requestedAmount: selectedApp.requestedAmount,
      tenureMonths: selectedApp.tenureMonths || 36,
      annualInterestRate: rate,
      monthlyIncome: selectedApp.monthlyIncome,
      existingDebtMonthlyEmi: selectedApp.existingDebt ? Math.round(selectedApp.existingDebt * 0.03) : 0,
      collateralType: colType,
      collateralEstimatedValue: colVal,
      hasInsurancePolicy: true,
    });
  }, [selectedApp]);

  const handleDecision = (status: LoanApplication['status']) => {
    if (!selectedApp) return;
    updateApplicationStatus(selectedApp.id, status, decisionNotes);
    setSelectedApp(null);
    setDecisionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1">
            <Landmark className="size-4" />
            <span>{t('कर्जा विभाग तथा उपसमिति मूल्याङ्कन', 'CREDIT DEPARTMENT & UNDERWRITING')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('ऋण उपसमिति कर्जा मूल्याङ्कन कतार', 'Credit Committee Loan Queue')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'कर्जा जोखिम मूल्याङ्कन, धितो निरीक्षण, नयाँ आवेदन प्रविष्टि र ऋण स्वीकृति तथा वितरण व्यवस्थापन।',
              'Originate counter credit, review creditworthiness, inspect collateral, and authorize disbursements.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowCreditScoringModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition"
          >
            <Award className="size-4" />
            <span>{t('क्रेडिट स्कोरिङ (5 Cs)', '5 Cs Credit Scoring')}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowOriginateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition"
          >
            <PlusCircle className="size-4" />
            <span>{t('+ नयाँ कर्जा आवेदन', '+ Originate Loan')}</span>
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400">
              <tr>
                <th className="p-4 font-semibold">{t('आवेदन नं.', 'App Number')}</th>
                <th className="p-4 font-semibold">{t('आवेदक सदस्य', 'Applicant')}</th>
                <th className="p-4 font-semibold">{t('कर्जा योजना', 'Loan Scheme')}</th>
                <th className="p-4 font-semibold">{t('माग गरिएको रकम', 'Requested Principal')}</th>
                <th className="p-4 font-semibold">{t('मासिक आय', 'Monthly Income')}</th>
                <th className="p-4 font-semibold">{t('स्थिति', 'Status')}</th>
                <th className="p-4 font-semibold text-right">{t('समिति मूल्याङ्कन', 'Committee Review')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {applications.map((app) => {
                const member = members.find((m) => m.id === app.memberId || m.memberNo === app.memberNo);
                const memberDisplayName = member ? t(member.nameNepali || member.name, member.name) : app.memberName;
                const scheme = LOAN_SCHEMES.find((s) => s.type === app.loanType);
                const loanTypeLabel = scheme ? t(scheme.labelNe, scheme.labelEn) : app.loanType;

                return (
                  <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{fmtDigits(app.applicationNo)}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{memberDisplayName}</div>
                      <span className="font-mono text-slate-400 text-[10px]">{fmtDigits(app.memberNo)}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{loanTypeLabel}</td>
                  <td className="p-4 font-bold text-emerald-600 dark:text-[#13ec37]">{fmtCurrency(app.requestedAmount, true)}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{fmtCurrency(app.monthlyIncome, true)}</td>
                  <td className="p-4">
                    <Badge status={app.status} size="sm" />
                  </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setDecisionNotes(app.committeeNotes || '');
                        }}
                        className="flex items-center gap-1.5 ml-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                      >
                        <Eye className="size-3.5" />
                        <span>{t('जोखिम जाँच', 'Assess Risk')}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Loan Risk Assessment Modal */}
      {selectedApp && (() => {
        const selMember = members.find((m) => m.id === selectedApp.memberId || m.memberNo === selectedApp.memberNo);
        const selMemberDisplayName = selMember ? t(selMember.nameNepali || selMember.name, selMember.name) : selectedApp.memberName;
        const scheme = LOAN_SCHEMES.find((s) => s.type === selectedApp.loanType);
        const loanTypeLabel = scheme ? t(scheme.labelNe, scheme.labelEn) : selectedApp.loanType;

        return (
          <div 
            role="dialog"
            aria-modal="true"
            aria-label={t('ऋण जोखिम मूल्याङ्कन', 'Loan Risk Assessment')}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedApp(null)}
          >
            <div 
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50">
                      {fmtDigits(selectedApp.applicationNo)}
                    </span>
                    <Badge status={selectedApp.status} size="sm" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {selMemberDisplayName} <span className="text-xs font-mono text-slate-400 font-normal">({fmtDigits(selectedApp.memberNo)})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {loanTypeLabel} • {fmtDigits(selectedApp.tenureMonths)} {t('महिना अवधि', 'Months Tenure')}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedApp(null)}
                  aria-label={t('बन्द गर्नुहोस्', 'Close')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  type="button"
                >
                  <X className="size-5" />
                </button>
              </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Financial Metrics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Requested Principal</span>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {fmtCurrency(selectedApp.requestedAmount, true)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Monthly Net Income</span>
                  <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {fmtCurrency(selectedApp.monthlyIncome, true)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Existing Debt</span>
                  <p className="text-base font-black text-slate-700 dark:text-slate-300 mt-0.5">
                    {selectedApp.existingDebt ? fmtCurrency(selectedApp.existingDebt, true) : fmtCurrency(0, true)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Applied Date</span>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                    {fmtDigits(selectedApp.appliedDate || '2026-03-15')}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-4 pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">Stated Loan Purpose</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{selectedApp.purpose}</p>
                </div>

                <div className="col-span-2 sm:col-span-4 pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">Collateral / Security Pledge</span>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5 leading-relaxed">{selectedApp.collateralDetails}</p>
                </div>
              </div>

              {/* ─── STATUTORY LTV & REPAYMENT CAPACITY AUDIT GATE (सहकारी ऐन २०७४) ─── */}
              {safetyEval && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Scale className="size-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        {t('धितो सुरक्षण तथा LTV सुरक्षा गेटवे (सहकारी ऐन २०७४)', 'Collateral Valuation & LTV Safety Gate')}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {safetyEval.overallRiskRating === 'LOW_RISK' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="size-3" />
                          {t('वैधानिक सीमा भित्र (कम जोखिम)', 'LTV & DSTI Compliant (Low Risk)')}
                        </span>
                      ) : safetyEval.overallRiskRating === 'MODERATE_RISK' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                          <AlertTriangle className="size-3" />
                          {t('मध्यम जोखिम (थप परीक्षण आवश्यक)', 'Moderate Risk (Review Required)')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 animate-pulse">
                          <ShieldAlert className="size-3" />
                          {t('मापदण्ड उल्लंघन (उच्च जोखिम)', 'Regulatory Cap Breach (High Risk)')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metric gauges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">{t('धितो सुरक्षा अनुपात (LTV)', 'Actual LTV Ratio')}</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={`text-sm font-black font-mono ${safetyEval.isLtvCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {safetyEval.actualLtvPercent}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">/ {safetyEval.statutoryMaxLtvPercent}% Max</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">{t('अनुमानित मासिक किस्ता (EMI)', 'Calculated Monthly EMI')}</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                        NPR {fmtCurrency(safetyEval.monthlyEmi, true)}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">{t('आम्दानी-किस्ता अनुपात (DSTI)', 'Debt-to-Income (DSTI)')}</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className={`text-sm font-black font-mono ${safetyEval.isDstiCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {safetyEval.dstiPercent}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">/ 50% Max</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">{t('धितो अनुसार अधिकतम सीमा', 'Collateral Loan Cap')}</span>
                      <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5 font-mono">
                        NPR {fmtCurrency(safetyEval.suggestedMaxLoanAmount, true)}
                      </p>
                    </div>
                  </div>

                  {/* Breach Warnings if any */}
                  {safetyEval.breachReasons.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1">
                      {safetyEval.breachReasons.map((b, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                          <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                          <span>{t(b.messageNepali, b.messageEnglish)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── MANDATORY LOAN VERIFICATION DOCUMENTS ─── */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Mandatory Collateral & Verification Documents</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">Click to inspect official deed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Land Ownership (Lalpurja) Deed */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition group flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                          <Landmark className="size-4" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          <Check className="size-3" /> Attached
                        </span>
                      </div>

                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">Lalpurja Deed</h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Plot 412 • 4 Kattha Land</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewDoc({
                        title: 'जग्गाधनी प्रमाणपुर्जा (Land Ownership Deed - Lalpurja)',
                        image: '/assets/kyc/doc_lalpurja.svg',
                        meta: 'Malpot Karyalaya Lamahi, Dang • Plot No: 412 • Valuation: NPR 1,200,000'
                      })}
                      className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="size-3.5" />
                      <span>Inspect Deed</span>
                    </button>
                  </div>

                  {/* 2. Citizenship Identity Proof */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition group flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                          <User className="size-4" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          <Check className="size-3" /> Verified
                        </span>
                      </div>

                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">Citizenship Proof</h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">DAO Dang • 52-01-72</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewDoc({
                        title: 'नेपाली नागरिकता प्रमाणपत्र (Citizenship Certificate)',
                        image: '/assets/kyc/doc_citizenship.svg',
                        meta: 'District Administration Office Dang • Descent • Member: Ram Bahadur Shrestha'
                      })}
                      className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="size-3.5" />
                      <span>Inspect Card</span>
                    </button>
                  </div>

                  {/* 3. Ward Recommendation & Utility Slip */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition group flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="size-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                          <Building className="size-4" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          <Check className="size-3" /> Validated
                        </span>
                      </div>

                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">Ward Sifaris & Bill</h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">NEA Meter Slip & Sifaris</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewDoc({
                        title: 'वडा कार्यालय सिफारिस तथा विद्युत् महसुल (Ward Recommendation & NEA Bill)',
                        image: '/assets/kyc/doc_ward_utility.svg',
                        meta: 'Gadhwa Rural Municipality Ward-5 • NEA Consumer ID: 052-19821'
                      })}
                      className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="size-3.5" />
                      <span>Inspect Bill</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Committee Resolution & Sanction Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {t('ऋण उपसमिति निर्णय तथा टिप्पणी', 'Credit Committee Sanction & Resolution Notes')}
                </label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder={t(
                    'धितो मूल्याङ्कन, ब्याज अनुदान वा कर्जा प्रवाह सर्तहरू सम्बन्धी समितिको टिप्पणी...',
                    'Enter committee comments regarding collateral valuation, interest subsidy, or disbursement conditions...'
                  )}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                {t('रद्द गर्नुहोस्', 'Cancel')}
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDecision('DOCUMENT_REQUIRED')}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-800 text-xs font-bold transition"
                >
                  {t('कागजात माग गर्नुहोस्', 'Request Documents')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreditScoringModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-300 dark:border-purple-800 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Award className="size-4" />
                  <span>{t('५ Cs स्कोरिङ', '5 Cs Scoring')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision('REJECTED')}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-300 dark:border-rose-800 text-xs font-bold transition"
                >
                  {t('कर्जा अस्वीकृत गर्नुहोस्', 'Decline Loan')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision('APPROVED')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow transition flex items-center gap-1.5"
                >
                  <Check className="size-4" />
                  <span>{t('कर्जा स्वीकृत गर्नुहोस्', 'Sanction & Approve Loan')}</span>
                </button>
              </div>
            </div>
            </div>
          </div>
        );
      })()}

      {/* ─── FULL DOCUMENT INSPECTION SUB-MODAL ─── */}
      {previewDoc && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label={previewDoc.title}
          className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{previewDoc.title}</h4>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{previewDoc.meta}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Document Image Container */}
            <div className="p-6 bg-slate-100 dark:bg-slate-950 flex items-center justify-center min-h-[360px] max-h-[65vh] overflow-auto">
              <img 
                src={previewDoc.image} 
                alt={previewDoc.title} 
                className="max-h-[500px] w-auto object-contain rounded-lg shadow-md border border-slate-200/80 dark:border-slate-800 bg-white" 
              />
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>{t('मालपोत तथा सम्बन्धित कार्यालयबाट आधिकारिक प्रमाणित', 'Verified against official Land Revenue & District Registry')}</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                {t('सकियो / बन्द गर्नुहोस्', 'Done Inspecting')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loan Origination Modal */}
      <LoanOriginationModal
        isOpen={showOriginateModal}
        onClose={() => setShowOriginateModal(false)}
        onSuccess={(newApp) => {
          setShowOriginateModal(false);
          setToast(
            t(
              `नयाँ कर्जा आवेदन ${newApp.applicationNo} (${newApp.memberName}) दर्ता भयो!`,
              `New loan application ${newApp.applicationNo} for ${newApp.memberName} originated!`
            )
          );
          setTimeout(() => setToast(null), 3500);
        }}
      />

      {/* Credit Risk Rating & Basel/PEARLS Scoring Modal */}
      <CreditRiskRatingModal
        isOpen={showCreditScoringModal}
        onClose={() => setShowCreditScoringModal(false)}
      />
    </div>
  );
};
