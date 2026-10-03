import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import { Employee } from '../../types';
import {
  StaffSalaryRecord,
  calculateMonthlyPfGratuity,
  checkPfLoanEligibility,
  calculateRetirementSettlement,
  calculateAnnualPfInterest,
  verifyFundSegregation,
  exportStaffRetirementRegisterCsv,
} from '../../utils/staffRetirementFund';
import {
  X,
  Printer,
  Copy,
  Download,
  Building,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  DollarSign,
  ShieldCheck,
  Calculator,
  Calendar,
  Users,
  Coins,
} from 'lucide-react';

interface StaffRetirementFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: readonly Employee[];
}

export const StaffRetirementFundModal: React.FC<StaffRetirementFundModalProps> = ({
  isOpen,
  onClose,
  employees,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtPercent } = useLanguageStore();
  const { coopSettings, addTransaction } = useCoopStore();

  const [activeTab, setActiveTab] = useState<'PAYROLL' | 'PF_LOAN' | 'RINGFENCE' | 'SETTLEMENT' | 'LEDGER'>('PAYROLL');

  // Staff Salary Records Initial Data
  const [staffRecords, setStaffRecords] = useState<StaffSalaryRecord[]>([
    {
      employeeId: 'emp-101',
      employeeNo: 'EMP-2078-001',
      employeeName: 'अर्जुन थापा मगर',
      designation: 'वरिष्ठ प्रबन्धक (Senior Manager)',
      basicSalary: 42000,
      joinedDateBS: '2075/04/01',
      tenureYears: 6.25,
      accumulatedEmployeePf: 315000,
      accumulatedEmployerPf: 315000,
      accumulatedPfInterest: 89000,
      totalAccumulatedPf: 719000,
      accumulatedGratuity: 218600,
      pfLoanBalance: 120000,
      accumulatedLeaveDays: 28,
    },
    {
      employeeId: 'emp-102',
      employeeNo: 'EMP-2079-014',
      employeeName: 'सुमन शर्मा',
      designation: 'ऋण अधिकृत (Loan Officer)',
      basicSalary: 32000,
      joinedDateBS: '2077/01/15',
      tenureYears: 4.5,
      accumulatedEmployeePf: 172800,
      accumulatedEmployerPf: 172800,
      accumulatedPfInterest: 38500,
      totalAccumulatedPf: 384100,
      accumulatedGratuity: 120000,
      pfLoanBalance: 0,
      accumulatedLeaveDays: 18,
    },
    {
      employeeId: 'emp-103',
      employeeNo: 'EMP-2080-029',
      employeeName: 'लक्ष्मी चौधरी',
      designation: 'वरिष्ठ क्यासियर (Senior Teller)',
      basicSalary: 28000,
      joinedDateBS: '2078/07/01',
      tenureYears: 3.0,
      accumulatedEmployeePf: 100800,
      accumulatedEmployerPf: 100800,
      accumulatedPfInterest: 16200,
      totalAccumulatedPf: 217800,
      accumulatedGratuity: 69900,
      pfLoanBalance: 40000,
      accumulatedLeaveDays: 14,
    },
  ]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(staffRecords[0]?.employeeId || '');

  // Payroll Simulator State
  const [simulatedBasicSalary, setSimulatedBasicSalary] = useState<number>(35000);

  // PF Loan Simulator State
  const [requestedLoanAmount, setRequestedLoanAmount] = useState<number>(100000);

  // Ringfence Assets State
  const [ringFencedBankAssets, setRingFencedBankAssets] = useState<number>(2000000);

  // Settlement Date State
  const [settlementDateBS, setSettlementDateBS] = useState<string>('2081/06/30');
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  // Current selected staff
  const selectedStaff = useMemo(() => {
    return staffRecords.find((s) => s.employeeId === selectedEmployeeId) || staffRecords[0];
  }, [staffRecords, selectedEmployeeId]);

  // Payroll Breakdown
  const payrollBreakdown = useMemo(() => {
    return calculateMonthlyPfGratuity(simulatedBasicSalary);
  }, [simulatedBasicSalary]);

  // PF Loan Eligibility
  const pfLoanEligibility = useMemo(() => {
    if (!selectedStaff) return null;
    return checkPfLoanEligibility(selectedStaff.totalAccumulatedPf, selectedStaff.pfLoanBalance);
  }, [selectedStaff]);

  // Total Liabilities & Ring-Fenced Audit
  const ringfenceAudit = useMemo(() => {
    const totalPf = staffRecords.reduce((sum, s) => sum + s.totalAccumulatedPf, 0);
    const totalGratuity = staffRecords.reduce((sum, s) => sum + s.accumulatedGratuity, 0);
    return verifyFundSegregation(totalPf, totalGratuity, ringFencedBankAssets);
  }, [staffRecords, ringFencedBankAssets]);

  // Final Settlement Voucher
  const settlementVoucher = useMemo(() => {
    if (!selectedStaff) return null;
    return calculateRetirementSettlement(selectedStaff, settlementDateBS);
  }, [selectedStaff, settlementDateBS]);

  const [isSettled, setIsSettled] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (!settlementVoucher || !selectedStaff) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>अवकाश फछ्र्यौट भौचर - ${settlementVoucher.voucherNo}</title>
        <style>
          body { font-family: 'Mukti', 'Kalimati', 'Arial', sans-serif; padding: 30px; line-height: 1.6; color: #111; }
          .header { text-align: center; border-bottom: 2px dashed #444; padding-bottom: 12px; margin-bottom: 20px; }
          .inst-name { font-size: 20px; font-weight: bold; margin: 0; }
          .inst-sub { font-size: 13px; margin: 2px 0; }
          .title { font-size: 14px; font-weight: bold; text-align: center; margin: 12px 0; }
          .meta { font-size: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; }
          .table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          .table th, .table td { border: 1px solid #444; padding: 6px 10px; text-align: left; }
          .table th { background: #f0f0f0; }
          .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; margin-top: 50px; font-size: 12px; }
          .sig-line { border-bottom: 1px dotted #555; height: 35px; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <p class="inst-name">${coopSettings.nameNepali}</p>
          <p class="inst-sub">${coopSettings.addressNepali} | दर्ता नं. ${coopSettings.regNo} | पान नं. ${coopSettings.panNo}</p>
          <div class="title">कर्मचारी सञ्चय कोष, उपदान तथा संचित बिदा फछ्र्यौट पत्र (Discharge Voucher)</div>
        </div>
        <div class="meta">
          <span>कर्मचारी: <b>${selectedStaff.employeeName} (${selectedStaff.employeeNo})</b></span>
          <span>भौचर नं: <b>${settlementVoucher.voucherNo}</b></span>
          <span>मिति: <b>${settlementVoucher.settlementDateBS}</b></span>
        </div>
        <table class="table">
          <thead>
            <tr><th>दाबी / हिसाब विवरण</th><th style="text-align: right;">रकम (रु.)</th></tr>
          </thead>
          <tbody>
            <tr><td>१. कुल संचित कर्मचारी सञ्चय कोष (PF Principal + Interest)</td><td style="text-align: right;">रु. ${settlementVoucher.totalPfPayable.toLocaleString()}</td></tr>
            <tr><td>२. संचित उपदान (Gratuity)</td><td style="text-align: right;">रु. ${settlementVoucher.gratuityPayable.toLocaleString()}</td></tr>
            <tr><td>३. संचित बिदा बापतको रकम (${selectedStaff.accumulatedLeaveDays} दिन)</td><td style="text-align: right;">रु. ${settlementVoucher.leaveEncashmentPayable.toLocaleString()}</td></tr>
            <tr style="font-weight: bold; background: #fafafa;"><td>कुल प्राप्त रकम (Gross Payable)</td><td style="text-align: right;">रु. ${settlementVoucher.grossSettlement.toLocaleString()}</td></tr>
            <tr style="color: #c00;"><td>कट्टा: सञ्चय कोष सापटी कर्जा बाँकी</td><td style="text-align: right;">- रु. ${settlementVoucher.staffLoanDeduction.toLocaleString()}</td></tr>
            <tr style="font-weight: bold; background: #e8f5e9; font-size: 13px;"><td>कर्मचारीलाई भुक्तानी हुने खुद रकम (Net Final Settlement)</td><td style="text-align: right;">रु. ${settlementVoucher.netPayableToEmployee.toLocaleString()}</td></tr>
          </tbody>
        </table>
        <div class="signatures">
          <div><div class="sig-line"></div><b>${selectedStaff.employeeName}</b><br><small>अवकाश प्राप्त कर्मचारी</small></div>
          <div><div class="sig-line"></div><b>लेखापाल / प्रशासन प्रमुख</b><br><small>${coopSettings.nameNepali}</small></div>
          <div><div class="sig-line"></div><b>व्यवस्थापक / अध्यक्ष</b><br><small>${coopSettings.nameNepali}</small></div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const handleExecuteSettlement = () => {
    if (!settlementVoucher || !selectedStaff) return;
    addTransaction({
      type: 'WITHDRAWAL',
      amount: settlementVoucher.netPayableToEmployee,
      description: `कर्मचारी अवकाश भुक्तानी - ${selectedStaff.employeeName} (${selectedStaff.employeeNo}) [Voucher: ${settlementVoucher.voucherNo}]`,
      referenceNo: settlementVoucher.voucherNo,
    });
    setIsSettled(true);
    alert(
      `कर्मचारी ${selectedStaff.employeeName} को अवकाश भुक्तानी (रु. ${settlementVoucher.netPayableToEmployee.toLocaleString()}) सफल भयो र लेखा बहिखातामा प्रविष्टि गरियो!`
    );
  };

  const handleCopyVoucher = () => {
    if (!settlementVoucher) return;
    const txt = `${settlementVoucher.narration}\n\nकुल सञ्चय कोष: रु. ${settlementVoucher.totalPfPayable.toLocaleString()}\nकुल उपदान: रु. ${settlementVoucher.gratuityPayable.toLocaleString()}\nसंचित बिदा रकम: रु. ${settlementVoucher.leaveEncashmentPayable.toLocaleString()}\nसापटी कट्टा: रु. ${settlementVoucher.staffLoanDeduction.toLocaleString()}\nखुद भुक्तानी: रु. ${settlementVoucher.netPayableToEmployee.toLocaleString()}`;
    navigator.clipboard.writeText(txt);
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2000);
  };

  const handleDownloadCsv = () => {
    const csv = exportStaffRetirementRegisterCsv(staffRecords);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `unako_staff_retirement_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Coins className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('कर्मचारी सञ्चय कोष तथा उपदान व्यवस्थापन', 'Staff Provident Fund & Gratuity Engine')}
                </h2>
                <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  श्रम ऐन २०७४
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  '१०% सञ्चय कोष कट्टी, १०% संस्थागत थप, ८.३३% उपदान तथा अवकाश फछ्र्यौट प्रणाली',
                  '10% PF deduction, 10% matching, 8.33% gratuity accrual, and ring-fenced segregation audit'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Staff Selector Bar */}
        <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('कर्मचारी छनोट:', 'Select Employee:')}
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {staffRecords.map((s) => (
                <option key={s.employeeId} value={s.employeeId}>
                  {s.employeeNo} - {s.employeeName} ({s.designation})
                </option>
              ))}
            </select>
          </div>

          {selectedStaff && (
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>
                {t('मासिक तलब:', 'Basic Salary:')} <strong className="text-slate-900 dark:text-white">{fmtCurrency(selectedStaff.basicSalary, true)}</strong>
              </span>
              <span>
                {t('कुल सञ्चय कोष:', 'Total PF:')} <strong className="text-emerald-600 dark:text-emerald-400">{fmtCurrency(selectedStaff.totalAccumulatedPf, true)}</strong>
              </span>
              <span>
                {t('उपदान:', 'Gratuity:')} <strong className="text-purple-600 dark:text-purple-400">{fmtCurrency(selectedStaff.accumulatedGratuity, true)}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('PAYROLL')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'PAYROLL'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="size-4" />
            <span>{t('१. तलब कट्टी तथा उपदान गणना', '1. Payroll & Gratuity Calculation')}</span>
          </button>

          <button
            onClick={() => setActiveTab('PF_LOAN')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'PF_LOAN'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="size-4" />
            <span>{t('२. सञ्चय कोष सापटी', '2. Staff PF Loan')}</span>
          </button>

          <button
            onClick={() => setActiveTab('RINGFENCE')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'RINGFENCE'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>{t('३. कोष पृथकीकरण अडिट', '3. Fund Ring-fencing Audit')}</span>
          </button>

          <button
            onClick={() => setActiveTab('SETTLEMENT')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'SETTLEMENT'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="size-4" />
            <span>{t('४. अन्तिम अवकाश फछ्र्यौट भौचर', '4. Final Settlement Voucher')}</span>
          </button>

          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'LEDGER'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="size-4" />
            <span>{t('५. कर्मचारी लेजर तथा CSV', '5. Register & CSV')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto grow space-y-6">
          {/* TAB 1: PAYROLL DEDUCTION & GRATUITY */}
          {activeTab === 'PAYROLL' && (
            <div className="space-y-6">
              {/* Simulator Input */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center gap-4">
                <div className="grow">
                  <label className="text-xs text-slate-500 block mb-1">
                    {t('मासिक आधारभूत तलब', 'Monthly Basic Pay (NPR)')}
                  </label>
                  <input
                    type="number"
                    min="15000"
                    step="1000"
                    value={simulatedBasicSalary}
                    onChange={(e) => setSimulatedBasicSalary(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* KPI Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {t('कर्मचारी कट्टी (10% PF)', 'Employee PF Deduction')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {fmtCurrency(payrollBreakdown.employeePfDeduction, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t('तलबबाट कट्टा हुने', 'From monthly pay')}</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {t('संस्थाको थप (10% PF Match)', 'Employer Matching')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {fmtCurrency(payrollBreakdown.employerPfContribution, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t('सहकारीले थप गर्ने', 'Cooperative match')}</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    {t('उपदान जगेडा (8.33% Gratuity)', 'Monthly Gratuity Accrual')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                    {fmtCurrency(payrollBreakdown.employerGratuityAccrual, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t('१ महिना/वर्ष बराबर', '1 mo basic per yr')}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t('संस्थागत मासिक दायित्व (18.33%)', 'Total Cooperative Burden')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-white mt-1">
                    {fmtCurrency(payrollBreakdown.totalMonthlyEmployerBurden, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t('सञ्चय कोष + उपदान', 'PF Match + Gratuity')}</p>
                </div>
              </div>

              {/* Total Trust Deposit */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-200">
                  {t('कर्मचारी सञ्चय कोष खातामा मासिक जम्मा हुने कुल रकम (२०%):', 'Total Monthly 20% Deposit to PF Trust:')}
                </span>
                <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-300 text-base">
                  {fmtCurrency(payrollBreakdown.totalMonthlyPfDeposit, true)}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: STAFF PF LOAN */}
          {activeTab === 'PF_LOAN' && pfLoanEligibility && selectedStaff && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t('संचित सञ्चय कोष मौज्दात', 'Accumulated PF Balance')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-white mt-1">
                    {fmtCurrency(pfLoanEligibility.totalAccumulatedPf, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedStaff.employeeName}</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {t('अधिकतम सापटी सीमा (90%)', 'Max Loan Ceiling (90%)')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {fmtCurrency(pfLoanEligibility.maxLoanLimit, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t('९०% सम्म सापटी पाउने', 'Up to 90% of PF')}</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {t('बाँकी सापटी सीमा', 'Available Headroom')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                    {fmtCurrency(pfLoanEligibility.availableLoanLimit, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('साविक सापटी: रु.', 'Existing debt:')} {fmtCurrency(pfLoanEligibility.existingLoanBalance, false)}
                  </p>
                </div>
              </div>

              {/* Loan Application Simulator */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t('कर्मचारी सञ्चय कोष सापटी सिमुलेटर', 'Staff PF Loan Simulator')}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">
                      {t('माग गरिएको सापटी रकम (NPR)', 'Requested Loan Amount')}
                    </label>
                    <input
                      type="number"
                      min="10000"
                      max={pfLoanEligibility.availableLoanLimit}
                      value={requestedLoanAmount}
                      onChange={(e) => setRequestedLoanAmount(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <span
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold ${
                        requestedLoanAmount <= pfLoanEligibility.availableLoanLimit
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {requestedLoanAmount <= pfLoanEligibility.availableLoanLimit
                        ? t('सापटी स्वीकृत हुन सक्ने (Within 90% Limit)', 'Eligible within 90% limit')
                        : t('सीमा नाघेको', 'Exceeds available ceiling')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RINGFENCE AUDIT */}
          {activeTab === 'RINGFENCE' && (
            <div className="space-y-6">
              {/* Solvency Status Alert */}
              <div
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  ringfenceAudit.isFullyProtected
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}
              >
                {ringfenceAudit.isFullyProtected ? (
                  <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="size-6 text-rose-600 shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-bold">
                    {ringfenceAudit.isFullyProtected
                      ? t('कर्मचारी कोष शतप्रतिशत सुरक्षित तथा अलग लगानीमा बाँधिएको', '100% Ring-Fenced and Legally Segregated')
                      : t('कोष अपुग / जोखिम', 'Ring-Fencing Deficit Alert')}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {t(
                      'कर्मचारीहरूको सञ्चय कोष र उपदान रकम संस्थाको नियमित कारोबारमा नमिसिने गरी छुट्टै बैंक मुद्दती तथा सुरक्षणमा सुरक्षित राखिएको छ।',
                      'Staff retirement liabilities are completely ring-fenced in dedicated liquid assets.'
                    )}
                  </p>
                </div>
              </div>

              {/* Segregated Balance KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t('कर्मचारी दायित्व', 'Total Staff Liability')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-white mt-1">
                    {fmtCurrency(ringfenceAudit.totalStaffLiability, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('PF: रु.', 'PF:')} {fmtCurrency(ringfenceAudit.totalPfLiability, false)} + {t('उपदान', 'Gratuity')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {t('अलग मुद्दती/बैंक मौज्दात', 'Segregated Bank Assets')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {fmtCurrency(ringFencedBankAssets, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t('समर्पित बैंक खाता', 'Dedicated trust FD')}</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    {t('बचत / अपुग', 'Surplus / Deficit')}
                  </p>
                  <p
                    className={`text-lg font-mono font-extrabold mt-1 ${
                      ringfenceAudit.surplusDeficit >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {fmtCurrency(ringfenceAudit.surplusDeficit, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t('सुरक्षा कुशन', 'Safety cushion')}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FINAL SETTLEMENT VOUCHER */}
          {activeTab === 'SETTLEMENT' && settlementVoucher && selectedStaff && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('कर्मचारी सेवा निवृत्ति / राजीनामा अन्तिम फछ्र्यौट भौचर', 'Retirement & Resignation Final Settlement Voucher')}
                  </h3>
                  <p className="text-xs font-mono text-slate-500">
                    {settlementVoucher.voucherNo} | {settlementVoucher.employeeName} ({settlementVoucher.employeeNo})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyVoucher}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <Copy className="size-3.5" />
                    <span>{copiedVoucher ? t('कपी गरियो!', 'Copied!') : t('भौचर कपी', 'Copy')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <Printer className="size-3.5" />
                    <span>{t('प्रिन्ट भौचर', 'Print Voucher')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExecuteSettlement}
                    disabled={isSettled}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                      isSettled
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>{isSettled ? t('फछ्र्यौट सम्पन्न', 'Settled') : t('फछ्र्यौट निकासा गर्नुहोस्', 'Execute Discharge')}</span>
                  </button>
                </div>
              </div>

              {/* Formal Discharge Voucher Sheet */}
              <div className="p-6 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-md space-y-6">
                {/* Letterhead */}
                <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {coopSettings.nameNepali}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {coopSettings.addressNepali} | {t('दर्ता नं.', 'Reg No.')} {coopSettings.regNo}
                  </p>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 pt-2 uppercase">
                    कर्मचारी सञ्चय कोष, उपदान तथा संचित बिदा फछ्र्यौट पत्र (Discharge Voucher)
                  </p>
                  <p className="text-[11px] font-mono text-slate-500">
                    भौचर नं: {settlementVoucher.voucherNo} | मिति: {fmtDigits(settlementVoucher.settlementDateBS)}
                  </p>
                </div>

                {/* Table of dues */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5">{t('दाबी / हिसाब विवरण', 'Particulars')}</th>
                        <th className="px-4 py-2.5 text-right">{t('प्राप्त हुने रकम', 'Amount (NPR)')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      <tr>
                        <td className="px-4 py-2.5 font-sans">
                          {t('१. कुल संचित कर्मचारी सञ्चय कोष (PF Principal + Interest)', 'Total Accumulated PF (10% + 10% + Interest)')}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                          {fmtCurrency(settlementVoucher.totalPfPayable, false)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-sans">
                          {t('२. नेपाल श्रम ऐन २०७४ अनुसार संचित उपदान', 'Accrued Statutory Gratuity')}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                          {fmtCurrency(settlementVoucher.gratuityPayable, false)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-sans">
                          {t('३. संचित बिदा बापतको रकम (Unutilized Leave Encashment:', 'Leave Encashment: ')}
                          {fmtDigits(selectedStaff.accumulatedLeaveDays)} {t('दिन)', 'days)')}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                          {fmtCurrency(settlementVoucher.leaveEncashmentPayable, false)}
                        </td>
                      </tr>
                      <tr className="bg-slate-50 dark:bg-slate-900/60 font-bold">
                        <td className="px-4 py-2.5 font-sans">{t('कुल प्राप्त रकम:', 'Gross Payable:')}</td>
                        <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400">
                          {fmtCurrency(settlementVoucher.grossSettlement, false)}
                        </td>
                      </tr>
                      <tr className="text-rose-600 dark:text-rose-400">
                        <td className="px-4 py-2.5 font-sans">
                          {t('कट्टा: सञ्चय कोष सापटी कर्जा बाँकी', 'Less: Outstanding Staff PF Loan')}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold">
                          - {fmtCurrency(settlementVoucher.staffLoanDeduction, false)}
                        </td>
                      </tr>
                      <tr className="bg-emerald-50 dark:bg-emerald-950/40 text-sm font-extrabold border-t-2 border-emerald-300 dark:border-emerald-700">
                        <td className="px-4 py-3 font-sans text-emerald-900 dark:text-emerald-200">
                          {t('कर्मचारीलाई भुक्तानी हुने खुद रकम:', 'Net Payable to Employee:')}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-300">
                          {fmtCurrency(settlementVoucher.netPayableToEmployee, true)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
                  <div className="space-y-6">
                    <div className="border-b border-dotted border-slate-400 h-8"></div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedStaff.employeeName}</p>
                      <p className="text-[10px] text-slate-500">अवकाश प्राप्त कर्मचारी</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="border-b border-dotted border-slate-400 h-8"></div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">लेखा प्रमुख / अधिकृत</p>
                      <p className="text-[10px] text-slate-500">आन्तरिक लेखापरीक्षण</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="border-b border-dotted border-slate-400 h-8"></div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">व्यवस्थापक / अध्यक्ष</p>
                      <p className="text-[10px] text-slate-500">उनको साकोस</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LEDGER & CSV */}
          {activeTab === 'LEDGER' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('कर्मचारी सञ्चय कोष तथा उपदान दर्ता किताब', 'Staff Provident Fund & Gratuity Register')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('सम्पूर्ण कर्मचारीहरूको सञ्चय कोष तथा उपदान मौज्दात अभिलेख', 'Full ledger records for all cooperative employees')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer"
                >
                  <Download className="size-4" />
                  <span>{t('CSV डाउनलोड', 'Export CSV')}</span>
                </button>
              </div>

              {/* Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2.5">EMP No</th>
                        <th className="px-3 py-2.5">{t('कर्मचारी नाम', 'Employee')}</th>
                        <th className="px-3 py-2.5">{t('पद', 'Designation')}</th>
                        <th className="px-3 py-2.5 text-right">{t('मासिक तलब', 'Basic Salary')}</th>
                        <th className="px-3 py-2.5 text-right">{t('कर्मचारी PF (१०%)', 'Employee PF')}</th>
                        <th className="px-3 py-2.5 text-right">{t('संस्था PF (१०%)', 'Employer PF')}</th>
                        <th className="px-3 py-2.5 text-right">{t('कुल सञ्चय कोष', 'Total PF')}</th>
                        <th className="px-3 py-2.5 text-right">{t('उपदान', 'Gratuity')}</th>
                        <th className="px-3 py-2.5 text-right">{t('सापटी बाँकी', 'PF Loan')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {staffRecords.map((r) => (
                        <tr key={r.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="px-3 py-2.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {r.employeeNo}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">
                            {r.employeeName}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500">{r.designation}</td>
                          <td className="px-3 py-2.5 text-right font-mono">{fmtCurrency(r.basicSalary, false)}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-600 dark:text-slate-300">
                            {fmtCurrency(r.accumulatedEmployeePf, false)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-600 dark:text-slate-300">
                            {fmtCurrency(r.accumulatedEmployerPf, false)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {fmtCurrency(r.totalAccumulatedPf, true)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                            {fmtCurrency(r.accumulatedGratuity, true)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                            {r.pfLoanBalance > 0 ? fmtCurrency(r.pfLoanBalance, false) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
