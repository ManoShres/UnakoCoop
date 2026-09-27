import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  SewaKendraCode,
  SewaKendraDayBookEntry,
  DenominationCounts,
  DENOMINATION_VALUES,
  calculateDenominationSum,
  reconcileSewaKendraDayBook,
  generateInterBranchClearingVoucher,
  exportSewaKendraClearingCsv,
  createDefaultSewaKendraRecords,
} from '../../utils/sewaKendraClearingEngine';
import {
  X,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Truck,
  Check,
  FileText,
  Search,
  Plus,
  Coins,
  Receipt,
  Scale,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface SewaKendraClearingModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const SewaKendraClearingModal: React.FC<SewaKendraClearingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency, fmtCount, fmtDigits } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'DAYBOOK' | 'VOUCHER' | 'NETWORK_SUMMARY' | 'EXPORT'>('DAYBOOK');
  const [selectedBranchCode, setSelectedBranchCode] = useState<SewaKendraCode>('SC-GBD');
  const [dateBS, setDateBS] = useState('२०८०/०९/२५');

  // Branch day-book records
  const [records, setRecords] = useState<readonly SewaKendraDayBookEntry[]>(() =>
    createDefaultSewaKendraRecords()
  );

  // Selected Branch Entry
  const selectedRecord = useMemo(() => {
    return (
      records.find((r) => r.sewaKendraCode === selectedBranchCode) ||
      records[0]
    );
  }, [records, selectedBranchCode]);

  // Network Level Totals
  const networkMetrics = useMemo(() => {
    const totalOpening = records.reduce((sum, r) => sum + r.openingCash, 0);
    const totalReceipts = records.reduce(
      (sum, r) =>
        sum +
        r.receipts.savingsDeposit +
        r.receipts.loanRepayment +
        r.receipts.shareAndFees +
        r.receipts.remittanceReceived +
        r.receipts.otherReceipts,
      0
    );
    const totalDisbursements = records.reduce(
      (sum, r) =>
        sum +
        r.disbursements.savingsWithdrawal +
        r.disbursements.loanDisbursement +
        r.disbursements.remittancePayout +
        r.disbursements.pettyExpenses,
      0
    );
    const totalTransit = records.reduce((sum, r) => sum + r.transitToCentralVault, 0);
    const totalPhysical = records.reduce((sum, r) => sum + r.physicalCashCount, 0);
    const totalDiscrepancy = records.reduce((sum, r) => sum + r.discrepancyAmount, 0);

    return {
      totalOpening,
      totalReceipts,
      totalDisbursements,
      totalTransit,
      totalPhysical,
      totalDiscrepancy,
      isNetworkBalanced: totalDiscrepancy === 0,
    };
  }, [records]);

  // Clearing Voucher for Selected Branch
  const currentVoucher = useMemo(() => {
    return generateInterBranchClearingVoucher(selectedRecord);
  }, [selectedRecord]);

  if (!isOpen) return null;

  // Handlers for Denominations
  const handleDenomChange = (key: keyof DenominationCounts, count: number) => {
    const safeCount = Math.max(0, count || 0);
    const updatedDenoms = {
      ...selectedRecord.denominations,
      [key]: safeCount,
    };

    const updated = reconcileSewaKendraDayBook({
      ...selectedRecord,
      denominations: updatedDenoms,
    });

    setRecords((prev) => prev.map((r) => (r.id === selectedRecord.id ? updated : r)));
  };

  const handleTransitAmountChange = (amount: number) => {
    const safeAmt = Math.max(0, amount || 0);
    const updated = reconcileSewaKendraDayBook({
      ...selectedRecord,
      transitToCentralVault: safeAmt,
    });
    setRecords((prev) => prev.map((r) => (r.id === selectedRecord.id ? updated : r)));
  };

  const handleApproveBranch = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isHeadOfficeApproved: true } : r))
    );
  };

  const handleExportCsv = () => {
    const csv = exportSewaKendraClearingCsv(records);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sewa_Kendra_Clearing_${dateBS.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-800 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
              <Building2 className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  {t('सहकारी ऐन २०७४ दफा ४९ र ५०', 'Coop Act 2074 Sec 49 & 50')}
                </span>
                <span className="text-xs text-white/80 font-mono">
                  {t('दैनिक क्लियरिङ', 'Daily Clearing')}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {t(
                  'सहकारी सेवा केन्द्र तथा अन्तर-शाखा दैनिक हिसाब मिलान',
                  'Sewa Kendra & Inter-Branch Daily Cash Reconciliation'
                )}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            title={t('बन्द गर्नुहोस्', 'Close')}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Global Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 shrink-0 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">{t('शाखा सुरु मौज्दात:', 'Total Opening:')}</span>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
              {fmtCurrency(networkMetrics.totalOpening)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">{t('कुल दैनिक सङ्कलन:', 'Total Receipts:')}</span>
            <span className="text-sm font-black text-emerald-600 font-mono">
              {fmtCurrency(networkMetrics.totalReceipts)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">{t('कुल दैनिक भुक्तानी:', 'Total Disbursements:')}</span>
            <span className="text-sm font-black text-rose-600 font-mono">
              {fmtCurrency(networkMetrics.totalDisbursements)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">{t('केन्द्रीय ढुकुटी दाखिला:', 'Transit to HQ Vault:')}</span>
            <span className="text-sm font-black text-blue-600 font-mono">
              {fmtCurrency(networkMetrics.totalTransit)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">{t('समग्र मिलान अवस्था:', 'Network Status:')}</span>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                networkMetrics.isNetworkBalanced
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {networkMetrics.isNetworkBalanced
                ? t('✓ पूर्ण मिलान भएको', 'Balanced')
                : t('⚠️ फरक देखिएको', 'Discrepancy')}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('DAYBOOK')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'DAYBOOK'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Coins className="size-4" />
            <span>{t('१. सेवा केन्द्र दैनिक हिसाब तथा नगद गन्ती', '1. Branch Day-Book & Cash Count')}</span>
          </button>
          <button
            onClick={() => setActiveTab('VOUCHER')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'VOUCHER'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Receipt className="size-4" />
            <span>{t('२. अन्तर-शाखा क्लियरिङ भौचर', '2. Inter-Branch Voucher')}</span>
          </button>
          <button
            onClick={() => setActiveTab('NETWORK_SUMMARY')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'NETWORK_SUMMARY'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Scale className="size-4" />
            <span>{t('३. शाखागत तुलनात्मक स्थिति', '3. Cross-Branch Comparison')}</span>
          </button>
          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'EXPORT'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Download className="size-4" />
            <span>{t('४. दैनिक अभिलेख तथा CSV निर्यात', '4. Report & CSV Export')}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: DAYBOOK & CASH COUNT */}
          {activeTab === 'DAYBOOK' && (
            <div className="space-y-4">
              {/* Branch Selector & Date Picker */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <span className="font-bold text-slate-500 block mb-1">{t('सेवा केन्द्र छान्नुहोस्:', 'Select Service Center:')}</span>
                    <select
                      value={selectedBranchCode}
                      onChange={(e) => setSelectedBranchCode(e.target.value as SewaKendraCode)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
                    >
                      {records.map((r) => (
                        <option key={r.sewaKendraCode} value={r.sewaKendraCode}>
                          {r.sewaKendraNameNe} ({r.sewaKendraCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block mb-1">{t('कारोबार मिति:', 'Date BS:')}</span>
                    <input
                      type="text"
                      value={dateBS}
                      onChange={(e) => setDateBS(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block">{t('शाखा इन्चार्ज:', 'In-Charge:')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedRecord.inchargeName}</span>
                </div>
              </div>

              {/* Day-Book Financials Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column: Receipts & Disbursements */}
                <div className="space-y-4">
                  {/* Receipts Box */}
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs space-y-2">
                    <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                      <span>{t('दैनिक संकलन तथा आम्दानी (Receipts)', 'Receipts')}</span>
                      <span className="font-mono">
                        {fmtCurrency(
                          selectedRecord.receipts.savingsDeposit +
                            selectedRecord.receipts.loanRepayment +
                            selectedRecord.receipts.shareAndFees +
                            selectedRecord.receipts.remittanceReceived +
                            selectedRecord.receipts.otherReceipts
                        )}
                      </span>
                    </div>
                    <div className="divide-y divide-emerald-200/50 dark:divide-emerald-900/40 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between py-1">
                        <span>{t('सदस्य बचत जम्मा (Savings Deposit):', 'Savings Deposit:')}</span>
                        <span className="font-mono font-bold">{fmtCurrency(selectedRecord.receipts.savingsDeposit)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>{t('कर्जा साँवा/ब्याज असुली (Loan Recovery):', 'Loan Recovery:')}</span>
                        <span className="font-mono font-bold">{fmtCurrency(selectedRecord.receipts.loanRepayment)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>{t('सेयर तथा सदस्यता शुल्क (Share & Fees):', 'Share & Fees:')}</span>
                        <span className="font-mono">{fmtCurrency(selectedRecord.receipts.shareAndFees)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>{t('रेमिट्यान्स संकलन कोष (Remittance Inflow):', 'Remittance:')}</span>
                        <span className="font-mono">{fmtCurrency(selectedRecord.receipts.remittanceReceived)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>{t('अन्य विविध आम्दानी (Other Receipts):', 'Other:')}</span>
                        <span className="font-mono">{fmtCurrency(selectedRecord.receipts.otherReceipts)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Disbursements Box */}
                  <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs space-y-2">
                    <div className="font-bold text-rose-900 dark:text-rose-300 flex items-center justify-between">
                      <span>{t('दैनिक भुक्तानी तथा खर्च (Disbursements)', 'Disbursements')}</span>
                      <span className="font-mono">
                        {fmtCurrency(
                          selectedRecord.disbursements.savingsWithdrawal +
                            selectedRecord.disbursements.loanDisbursement +
                            selectedRecord.disbursements.remittancePayout +
                            selectedRecord.disbursements.pettyExpenses
                        )}
                      </span>
                    </div>
                    <div className="divide-y divide-rose-200/50 dark:divide-rose-900/40 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between py-1">
                        <span>{t('बचत फिर्ता भुक्तानी (Savings Withdrawal):', 'Savings Withdrawal:')}</span>
                        <span className="font-mono font-bold">{fmtCurrency(selectedRecord.disbursements.savingsWithdrawal)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>{t('कर्जा प्रवाह (Loan Disbursement):', 'Loan Disbursement:')}</span>
                        <span className="font-mono font-bold">{fmtCurrency(selectedRecord.disbursements.loanDisbursement)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>{t('रेमिट्यान्स सेवाग्राही भुक्तानी (Remittance Payout):', 'Remittance Payout:')}</span>
                        <span className="font-mono">{fmtCurrency(selectedRecord.disbursements.remittancePayout)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>{t('कार्यालय सञ्चालन विविध खर्च (Petty Expenses):', 'Petty Expenses:')}</span>
                        <span className="font-mono">{fmtCurrency(selectedRecord.disbursements.pettyExpenses)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Physical Cash Denominations Count */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Coins className="size-4 text-amber-500" />
                      <span>{t('भौतिक नगद दरबन्दी गन्ती (Physical Cash Count)', 'Denominations')}</span>
                    </span>
                    <span className="font-mono font-bold text-blue-600 text-sm">
                      {fmtCurrency(selectedRecord.physicalCashCount)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {(
                      [
                        'n1000',
                        'n500',
                        'n100',
                        'n50',
                        'n20',
                        'n10',
                        'n5',
                        'coins',
                      ] as (keyof DenominationCounts)[]
                    ).map((denomKey) => {
                      const count = selectedRecord.denominations[denomKey];
                      const val = DENOMINATION_VALUES[denomKey];
                      const rowTotal = count * val;

                      return (
                        <div
                          key={denomKey}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        >
                          <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                            रु. {val} ×
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={count}
                            onChange={(e) => handleDenomChange(denomKey, parseInt(e.target.value) || 0)}
                            className="w-16 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-mono font-bold text-xs"
                          />
                          <span className="w-16 text-right font-mono text-slate-500">{rowTotal}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reconciliation Discrepancy Box */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('कम्प्युटर लेखा अनुसार मौज्दात:', 'Calculated System Closing:')}</span>
                      <span className="font-mono font-bold">{fmtCurrency(selectedRecord.calculatedClosingBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('भौतिक नगद गन्ती (Physical Count):', 'Physical Cash Count:')}</span>
                      <span className="font-mono font-bold">{fmtCurrency(selectedRecord.physicalCashCount)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800 items-center">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{t('नगद फरक (Discrepancy):', 'Discrepancy:')}</span>
                      <span
                        className={`font-mono font-black ${
                          selectedRecord.discrepancyAmount === 0
                            ? 'text-emerald-600'
                            : selectedRecord.discrepancyAmount > 0
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {selectedRecord.discrepancyAmount > 0 ? '+' : ''}
                        {fmtCurrency(selectedRecord.discrepancyAmount)} (
                        {selectedRecord.reconciliationStatus === 'BALANCED'
                          ? t('पूर्ण मिलान', 'Balanced')
                          : selectedRecord.reconciliationStatus === 'SURPLUS'
                          ? t('बढी नगद', 'Surplus')
                          : t('नगद अपुग', 'Deficit')}
                        )
                      </span>
                    </div>
                  </div>

                  {/* Cash Transit Setting */}
                  <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                        <Truck className="size-4 text-blue-600" />
                        <span>{t('केन्द्रीय कार्यालयमा नगद चलान/दाखिला:', 'Transit to HQ Vault:')}</span>
                      </span>
                      <input
                        type="number"
                        step={10000}
                        value={selectedRecord.transitToCentralVault}
                        onChange={(e) => handleTransitAmountChange(Number(e.target.value))}
                        className="w-32 px-2 py-1 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 font-mono font-bold text-right"
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>{t('भोलिपल्ट सेवा केन्द्रमा बाँकी रहने मौज्दात:', 'Retained Branch Float:')}</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {fmtCurrency(selectedRecord.retainedBranchFloat)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VOUCHER */}
          {activeTab === 'VOUCHER' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 shadow-md space-y-6 print:border-none print:shadow-none text-xs">
                {/* Header */}
                <div className="text-center space-y-1 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    {t('नेपाल सहकारी ऐन २०७४ अन्तर्गत अन्तर-शाखा हिसाब नियन्त्रण', 'Under Nepal Cooperative Act 2074')}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {t('उनको बचत तथा ऋण सहकारी संस्था लिमिटेड', 'UNAKO SAVING & CREDIT COOPERATIVE SOCIETY LTD.')}
                  </h3>
                  <div className="text-slate-500">
                    {t('अन्तर-शाखा नगद चलान तथा क्लियरिङ भौचर', 'Inter-Branch Cash Transit & Clearing Voucher')}
                  </div>
                  <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {currentVoucher.voucherNo} | {currentVoucher.dateBS}
                  </div>
                </div>

                {/* Double Entry Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="p-3">{t('कारोबार शीर्षक (Account Head)', 'Account Head')}</th>
                        <th className="p-3">{t('शाखा/कार्यालय (Branch)', 'Branch')}</th>
                        <th className="p-3 text-right">{t('डेबिट (Debit NPR)', 'Debit')}</th>
                        <th className="p-3 text-right">{t('क्रेडिट (Credit NPR)', 'Credit')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      <tr>
                        <td className="p-3 font-medium text-slate-900 dark:text-white">
                          {currentVoucher.debitAccountTitle}
                        </td>
                        <td className="p-3 font-mono">{currentVoucher.toBranchNameNe}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600">
                          {fmtCurrency(currentVoucher.transferAmount)}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-400">-</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-slate-900 dark:text-white">
                          {currentVoucher.creditAccountTitle}
                        </td>
                        <td className="p-3 font-mono">{currentVoucher.fromBranchNameNe}</td>
                        <td className="p-3 text-right font-mono text-slate-400">-</td>
                        <td className="p-3 text-right font-mono font-bold text-blue-600">
                          {fmtCurrency(currentVoucher.transferAmount)}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border-t border-slate-300 dark:border-slate-700">
                      <tr>
                        <td colSpan={2} className="p-3 text-slate-900 dark:text-white">
                          {t('कुल जम्मा (Total Balancing Amount)', 'Total')}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-emerald-600">
                          {fmtCurrency(currentVoucher.transferAmount)}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-blue-600">
                          {fmtCurrency(currentVoucher.transferAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Voucher Meta details */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">{t('नगद ओसारपसार/क्युरियर टोली:', 'Courier / Carrier Escort:')}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{currentVoucher.courierCustodian}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('सोधभर्ना/दाखिला प्रयोजन:', 'Purpose:')}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedRecord.sewaKendraNameNe} दैनिक बचत तथा असुली रकम केन्द्रीय ढुकुटी दाखिला
                    </span>
                  </div>
                </div>

                {/* Sign-off */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 font-bold">
                      {selectedRecord.inchargeName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{t('सेवा केन्द्र इन्चार्ज (Branch Incharge)', 'Branch Incharge')}</div>
                  </div>
                  <div>
                    <div className="border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 font-bold">
                      {t('सीता कुमारी चौधरी', 'Sita Kumari Chaudhary')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{t('केन्द्रीय क्यासियर (Head Cashier)', 'Head Cashier')}</div>
                  </div>
                  <div>
                    <div className="border-b border-slate-300 dark:border-slate-700 pb-1 mb-1 font-bold">
                      {t('अर्जुन प्रसाद शर्मा', 'Arjun Prasad Sharma')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{t('व्यवस्थापक (General Manager)', 'General Manager')}</div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow hover:bg-slate-800 transition"
                  >
                    <Printer className="size-4" />
                    <span>{t('भौचर प्रिन्ट गर्नुहोस्', 'Print Voucher')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NETWORK COMPARISON */}
          {activeTab === 'NETWORK_SUMMARY' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3">{t('सेवा केन्द्र (Branch)', 'Branch')}</th>
                      <th className="p-3 text-right">{t('सुरु मौज्दात', 'Opening')}</th>
                      <th className="p-3 text-right">{t('दैनिक सङ्कलन', 'Receipts')}</th>
                      <th className="p-3 text-right">{t('दैनिक भुक्तानी', 'Disbursements')}</th>
                      <th className="p-3 text-right">{t('भौतिक मौज्दात', 'Physical Cash')}</th>
                      <th className="p-3 text-right">{t('केन्द्रीय दाखिला', 'Transit to HQ')}</th>
                      <th className="p-3 text-right">{t('शाखामा बाँकी', 'Branch Float')}</th>
                      <th className="p-3 text-center">{t('मिलान अवस्था', 'Status')}</th>
                      <th className="p-3 text-center">{t('प्रमाणीकरण', 'HQ Approval')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {records.map((r) => {
                      const recTotal =
                        r.receipts.savingsDeposit +
                        r.receipts.loanRepayment +
                        r.receipts.shareAndFees +
                        r.receipts.remittanceReceived +
                        r.receipts.otherReceipts;

                      const disbTotal =
                        r.disbursements.savingsWithdrawal +
                        r.disbursements.loanDisbursement +
                        r.disbursements.remittancePayout +
                        r.disbursements.pettyExpenses;

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-white">{r.sewaKendraNameNe}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {r.sewaKendraCode} | {r.inchargeName.split(' ')[0]}
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono">{fmtCurrency(r.openingCash)}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-600">{fmtCurrency(recTotal)}</td>
                          <td className="p-3 text-right font-mono font-bold text-rose-600">{fmtCurrency(disbTotal)}</td>
                          <td className="p-3 text-right font-mono font-black text-slate-900 dark:text-white">
                            {fmtCurrency(r.physicalCashCount)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-blue-600">
                            {fmtCurrency(r.transitToCentralVault)}
                          </td>
                          <td className="p-3 text-right font-mono">{fmtCurrency(r.retainedBranchFloat)}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.reconciliationStatus === 'BALANCED'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {r.reconciliationStatus === 'BALANCED'
                                ? t('मिलान', 'Balanced')
                                : t('बेमेल', 'Mismatch')}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {r.isHeadOfficeApproved ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {t('✓ प्रमाणित', 'Approved')}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleApproveBranch(r.id)}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition shadow-xs"
                              >
                                {t('प्रमाणित गर्नुहोस्', 'Approve')}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT & NORMS */}
          {activeTab === 'EXPORT' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-400/30">
                    <Download className="size-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      {t('अन्तर-शाखा दैनिक हिसाब मिलान CSV निर्यात', 'Export Inter-Branch Clearing Schedule CSV')}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {t(
                        'सबै सेवा केन्द्रहरूको दैनिक हिसाब-किताब, भौतिक नगद मौज्दात, र केन्द्रीय ढुकुटी दाखिला विवरण डाउनलोड गर्नुहोस्।',
                        'Download the end-of-day reconciliation data across all field service centers.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg transition"
                  >
                    <Download className="size-4" />
                    <span>{t('दैनिक क्लियरिङ CSV डाउनलोड (.csv)', 'Download Clearing CSV (.csv)')}</span>
                  </button>
                </div>
              </div>

              {/* Regulatory Directives */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>{t('सहकारी सेवा केन्द्र हिसाब व्यवस्थापन सम्बन्धी मुख्य कानुनी व्यवस्थाहरू:', 'Statutory Directives for Service Center Accounting:')}</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-400 pl-1 leading-relaxed">
                  <li>
                    <strong>{t('दैनिक बन्द तथा हिसाब मिलान:', 'Daily Day-End Balancing:')}</strong>{' '}
                    {t(
                      'प्रत्येक सेवा केन्द्रले दिनको अन्त्यमा भौतिक नगद र कम्प्युटर खाताको हिसाब मिलान गरी अनिवार्य दैनिक भौचर तयार गर्नुपर्नेछ।',
                      'Each service center must reconcile physical cash against computer ledger before day close.'
                    )}
                  </li>
                  <li>
                    <strong>{t('अन्तर-शाखा क्लियरिङ हिसाब (Inter-Branch Clearing):', 'Inter-Branch Clearing:')}</strong>{' '}
                    {t(
                      'सेवा केन्द्रबाट केन्द्रीय कार्यालय वा एक सेवा केन्द्रबाट अर्कोमा रकम रकमान्तर गर्दा अन्तर-शाखा क्लियरिङ खातामार्फत मात्र गर्नुपर्नेछ।',
                      'Fund transfers between branches and Central Vault must route through Inter-Branch Clearing ledger.'
                    )}
                  </li>
                  <li>
                    <strong>{t('ढुकुटी सुरक्षा सीमा (Vault Holding Limit):', 'Vault Ceiling Limit:')}</strong>{' '}
                    {t(
                      'सेवा केन्द्रमा तोकिएको अधिकतम् नगद मौज्दात सीमा (Holding Ceiling) भन्दा बढी भएको रकम अनिवार्य केन्द्रीय ढुकुटी वा नजिकको बैंक खातामा सोही दिन दाखिला गर्नुपर्नेछ।',
                      'Cash exceeding branch insurance ceiling must be dispatched to the Central Vault on the same day.'
                    )}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('उनको साकोस अन्तर-शाखा क्लियरिङ प्रणाली सक्रिय', 'Unako SACCOS Inter-Branch Clearing Engine Active')}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
