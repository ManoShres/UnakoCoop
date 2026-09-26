import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  TdsTransactionRecord,
  TdsSectionCode,
  RevenueHeadCode,
  DEFAULT_UNAKO_TAX_INFO,
  aggregateTdsBySection,
  generateIrdETdsTextFile,
  generateIrdETdsCsv,
  calculateFilingCompliance,
  generateTdsCertificate,
  calculateTds,
  getStandardTdsRate,
  getRevenueHeadForSection,
} from '../../utils/irdTdsEngine';
import {
  X,
  Printer,
  Download,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Plus,
  Coins,
  ShieldCheck,
  Calendar,
  Check,
  Copy,
} from 'lucide-react';

interface IrdETdsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IrdETdsManagerModal: React.FC<IrdETdsManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtPercent } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'REGISTER' | 'EXPORTER' | 'VOUCHERS' | 'CERTIFICATE'>('REGISTER');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('2081/82');
  const [selectedMonthBS, setSelectedMonthBS] = useState('मंसिर');
  const [sectionFilter, setSectionFilter] = useState<'ALL' | TdsSectionCode>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  // Certificate search
  const [certSearchQuery, setCertSearchQuery] = useState('601234567');

  // Initial Representative TDS Records for Unako SACCOS
  const [records, setRecords] = useState<TdsTransactionRecord[]>([
    {
      id: 'TDS-2081-001',
      transactionDateBS: '2081/08/10',
      fiscalYear: '2081/82',
      monthBS: 'मंसिर',
      sectionCode: 'SEC_87',
      sectionLabel: 'Sec 87 - Staff Employment Income TDS',
      sectionLabelNepali: 'दफा ८७ - कर्मचारी पारिश्रमिक कर कट्टी',
      revenueHead: '11111',
      deducteeType: 'INDIVIDUAL',
      deducteePan: '109823412',
      deducteeName: 'अर्जुन थापा मगर',
      deducteeMemberId: 'EMP-2078-001',
      grossPaymentAmount: 42000,
      tdsRatePercent: 1.0,
      tdsAmount: 420,
      netPaidAmount: 41580,
      bankDepositVoucherNo: 'VCH-RBB-9921',
      treasuryBankName: 'राष्ट्रिय वाणिज्य बैंक, गढवा',
      depositDateBS: '2081/08/20',
      status: 'DEPOSITED',
    },
    {
      id: 'TDS-2081-002',
      transactionDateBS: '2081/08/12',
      fiscalYear: '2081/82',
      monthBS: 'मंसिर',
      sectionCode: 'SEC_88_INTEREST',
      sectionLabel: 'Sec 88(1) - Savings & FD Interest TDS',
      sectionLabelNepali: 'दफा ८८(१) - निक्षेप तथा मुद्दती ब्याज कर कट्टी',
      revenueHead: '11112',
      deducteeType: 'INDIVIDUAL',
      deducteePan: '601234567',
      deducteeName: 'राम बहादुर चौधरी',
      deducteeMemberId: 'M-102',
      grossPaymentAmount: 65000,
      tdsRatePercent: 5.0,
      tdsAmount: 3250,
      netPaidAmount: 61750,
      bankDepositVoucherNo: 'VCH-RBB-9922',
      treasuryBankName: 'राष्ट्रिय वाणिज्य बैंक, गढवा',
      depositDateBS: '2081/08/20',
      status: 'DEPOSITED',
    },
    {
      id: 'TDS-2081-003',
      transactionDateBS: '2081/08/15',
      fiscalYear: '2081/82',
      monthBS: 'मंसिर',
      sectionCode: 'SEC_88_INTEREST',
      sectionLabel: 'Sec 88(1) - Corporate FD Interest TDS',
      sectionLabelNepali: 'दफा ८८(१) - संस्थागत मुद्दती ब्याज कर कट्टी',
      revenueHead: '11112',
      deducteeType: 'ENTITY',
      deducteePan: '609876543',
      deducteeName: 'दाङ एग्रो भेट प्राइभेट लिमिटेड',
      grossPaymentAmount: 120000,
      tdsRatePercent: 15.0,
      tdsAmount: 18000,
      netPaidAmount: 102000,
      bankDepositVoucherNo: 'VCH-RBB-9922',
      treasuryBankName: 'राष्ट्रिय वाणिज्य बैंक, गढवा',
      depositDateBS: '2081/08/20',
      status: 'DEPOSITED',
    },
    {
      id: 'TDS-2081-004',
      transactionDateBS: '2081/08/18',
      fiscalYear: '2081/82',
      monthBS: 'मंसिर',
      sectionCode: 'SEC_88_DIVIDEND',
      sectionLabel: 'Sec 88(2) - Member Share Dividend TDS',
      sectionLabelNepali: 'दफा ८८(२) - सेयर लाभांश कर कट्टी',
      revenueHead: '11112',
      deducteeType: 'INDIVIDUAL',
      deducteePan: '601234567',
      deducteeName: 'राम बहादुर चौधरी',
      deducteeMemberId: 'M-102',
      grossPaymentAmount: 25000,
      tdsRatePercent: 5.0,
      tdsAmount: 1250,
      netPaidAmount: 23750,
      bankDepositVoucherNo: 'VCH-RBB-9922',
      treasuryBankName: 'राष्ट्रिय वाणिज्य बैंक, गढवा',
      depositDateBS: '2081/08/20',
      status: 'DEPOSITED',
    },
    {
      id: 'TDS-2081-005',
      transactionDateBS: '2081/08/22',
      fiscalYear: '2081/82',
      monthBS: 'मंसिर',
      sectionCode: 'SEC_88_RENT',
      sectionLabel: 'Sec 88(1) - Branch Office Rent TDS',
      sectionLabelNepali: 'दफा ८८(१) - शाखा कार्यालय घरभाडा कर कट्टी',
      revenueHead: '11113',
      deducteeType: 'INDIVIDUAL',
      deducteePan: '300998877',
      deducteeName: 'हरि प्रसाद यादव (घरधनी)',
      grossPaymentAmount: 35000,
      tdsRatePercent: 10.0,
      tdsAmount: 3500,
      netPaidAmount: 31500,
      status: 'WITHHELD',
    },
    {
      id: 'TDS-2081-006',
      transactionDateBS: '2081/08/25',
      fiscalYear: '2081/82',
      monthBS: 'मंसिर',
      sectionCode: 'SEC_88_SERVICE',
      sectionLabel: 'Sec 88(1) - Statutory Audit Fee TDS',
      sectionLabelNepali: 'दफा ८८(१) - वैधानिक लेखापरीक्षण शुल्क कर कट्टी',
      revenueHead: '11113',
      deducteeType: 'ENTITY',
      deducteePan: '301122334',
      deducteeName: 'के.सी. एण्ड एसोसिएट्स चार्टर्ड एकाउन्टेन्ट्स',
      grossPaymentAmount: 80000,
      tdsRatePercent: 1.5,
      tdsAmount: 1200,
      netPaidAmount: 78800,
      status: 'WITHHELD',
    },
    {
      id: 'TDS-2081-007',
      transactionDateBS: '2081/08/27',
      fiscalYear: '2081/82',
      monthBS: 'मंसिर',
      sectionCode: 'SEC_89_CONTRACT',
      sectionLabel: 'Sec 89 - Core Banking Hardware Supply TDS',
      sectionLabelNepali: 'दफा ८९ - कम्प्युटर तथा नेटवर्क हार्डवेयर आपूर्ति कर कट्टी',
      revenueHead: '11113',
      deducteeType: 'ENTITY',
      deducteePan: '603344556',
      deducteeName: 'दाङ कम्प्युटर एण्ड आईटी सोलुसन्स',
      grossPaymentAmount: 145000,
      tdsRatePercent: 1.5,
      tdsAmount: 2175,
      netPaidAmount: 142825,
      status: 'WITHHELD',
    },
  ]);

  // Form states for manual TDS record addition
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeducteeName, setNewDeducteeName] = useState('');
  const [newDeducteePan, setNewDeducteePan] = useState('');
  const [newMemberId, setNewMemberId] = useState('');
  const [newSection, setNewSection] = useState<TdsSectionCode>('SEC_88_INTEREST');
  const [newDeducteeType, setNewDeducteeType] = useState<'INDIVIDUAL' | 'ENTITY'>('INDIVIDUAL');
  const [newGrossAmount, setNewGrossAmount] = useState<number>(10000);
  const [newCustomRate, setNewCustomRate] = useState<number>(5.0);

  // Vouchers form state
  const [reconcileVoucherNo, setReconcileVoucherNo] = useState('');
  const [reconcileBank, setReconcileBank] = useState('राष्ट्रिय वाणिज्य बैंक, गढवा');
  const [reconcileDateBS, setReconcileDateBS] = useState('2081/08/29');
  const [reconcileHead, setReconcileHead] = useState<RevenueHeadCode>('11113');

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchFy = r.fiscalYear === selectedFiscalYear;
      const matchMonth = selectedMonthBS === 'ALL' || r.monthBS === selectedMonthBS;
      const matchSection = sectionFilter === 'ALL' || r.sectionCode === sectionFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        r.deducteeName.toLowerCase().includes(query) ||
        r.deducteePan.toLowerCase().includes(query) ||
        (r.deducteeMemberId || '').toLowerCase().includes(query) ||
        (r.bankDepositVoucherNo || '').toLowerCase().includes(query);
      return matchFy && matchMonth && matchSection && matchSearch;
    });
  }, [records, selectedFiscalYear, selectedMonthBS, sectionFilter, searchQuery]);

  // Summaries
  const sectionSummaries = useMemo(() => aggregateTdsBySection(records), [records]);

  const totalGrossWithheld = useMemo(() => {
    return records.reduce((sum, r) => sum + r.grossPaymentAmount, 0);
  }, [records]);

  const totalTdsWithheld = useMemo(() => {
    return records.reduce((sum, r) => sum + r.tdsAmount, 0);
  }, [records]);

  const totalDeposited = useMemo(() => {
    return records
      .filter((r) => r.status === 'DEPOSITED' || r.status === 'FILED_IRD')
      .reduce((sum, r) => sum + r.tdsAmount, 0);
  }, [records]);

  const totalPending = totalTdsWithheld - totalDeposited;

  // Monthly filing compliance
  const filingCompliance = useMemo(() => {
    return calculateFilingCompliance(selectedMonthBS === 'ALL' ? 'मंसिर' : selectedMonthBS, selectedFiscalYear, records);
  }, [selectedMonthBS, selectedFiscalYear, records]);

  // Certificate lookup
  const certificateData = useMemo(() => {
    if (!certSearchQuery.trim()) return null;
    return generateTdsCertificate(certSearchQuery.trim(), selectedFiscalYear, records);
  }, [certSearchQuery, selectedFiscalYear, records]);

  // Handlers
  const handleAddNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeducteeName.trim() || newGrossAmount <= 0) {
      alert(t('कृपया कर कट्टी हुनेको नाम र रकम प्रविष्ट गर्नुहोस्।', 'Please provide deductee name and gross amount.'));
      return;
    }

    const { grossAmount, tdsRate, tdsAmount, netAmount } = calculateTds(newGrossAmount, newCustomRate);
    const revHead = getRevenueHeadForSection(newSection);

    const newRecord: TdsTransactionRecord = {
      id: `TDS-2081-${String(records.length + 1).padStart(3, '0')}`,
      transactionDateBS: '2081/08/28',
      fiscalYear: selectedFiscalYear,
      monthBS: selectedMonthBS === 'ALL' ? 'मंसिर' : selectedMonthBS,
      sectionCode: newSection,
      sectionLabel: `Sec ${newSection}`,
      sectionLabelNepali: `दफा ${newSection}`,
      revenueHead: revHead,
      deducteeType: newDeducteeType,
      deducteePan: newDeducteePan.trim() || 'N/A',
      deducteeName: newDeducteeName.trim(),
      deducteeMemberId: newMemberId.trim() || undefined,
      grossPaymentAmount: grossAmount,
      tdsRatePercent: tdsRate,
      tdsAmount,
      netPaidAmount: netAmount,
      status: 'WITHHELD',
    };

    setRecords((prev) => [newRecord, ...prev]);
    setNewDeducteeName('');
    setNewDeducteePan('');
    setNewMemberId('');
    setShowAddForm(false);
  };

  const handleDepositVoucherReconcile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcileVoucherNo.trim()) {
      alert(t('कृपया बैंक दाखिला भौचर नं. अनिवार्य भर्नुहोस्।', 'Please enter bank deposit voucher number.'));
      return;
    }

    setRecords((prev) =>
      prev.map((r) => {
        if (r.revenueHead === reconcileHead && r.status === 'WITHHELD') {
          return {
            ...r,
            bankDepositVoucherNo: reconcileVoucherNo.trim(),
            treasuryBankName: reconcileBank.trim(),
            depositDateBS: reconcileDateBS.trim(),
            status: 'DEPOSITED' as const,
          };
        }
        return r;
      })
    );

    alert(
      t(
        `राजस्व शीर्षक ${reconcileHead} अन्तर्गतका कर कट्टीहरू भौचर नं. ${reconcileVoucherNo} मा दाखिला सम्पन्न भयो!`,
        `TDS records under Revenue Head ${reconcileHead} successfully updated with Voucher ${reconcileVoucherNo}!`
      )
    );
    setReconcileVoucherNo('');
  };

  const handleDownloadTextFile = () => {
    const textData = generateIrdETdsTextFile(filteredRecords, DEFAULT_UNAKO_TAX_INFO.panNumber);
    const blob = new Blob([textData], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `IRD_eTDS_Unako_${selectedFiscalYear.replace('/', '_')}_${selectedMonthBS}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csvData = generateIrdETdsCsv(filteredRecords, DEFAULT_UNAKO_TAX_INFO.panNumber);
    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TDS_Annexure88_Unako_${selectedFiscalYear.replace('/', '_')}_${selectedMonthBS}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-red-950/20 via-slate-900/10 to-red-900/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Building className="size-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 tracking-wider uppercase">
                  {t('नेपाल सरकार आन्तरिक राजस्व विभाग (Inland Revenue Department)', 'Government of Nepal Inland Revenue Department')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300/40">
                  {t('आयकर ऐन २०५८ दफा ८७, ८८, ८९ अनुरूप', 'Compliant with Income Tax Act 2058')}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {t('ई-टिडीएस विवरण तथा कर कट्टी दाखिला प्रणाली', 'IRD e-TDS Return & Withholding Gateway')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {DEFAULT_UNAKO_TAX_INFO.cooperativeNameNepali} | {t('स्थायी लेखा नं (PAN):', 'PAN:')} <strong className="text-slate-900 dark:text-slate-200 font-mono">{DEFAULT_UNAKO_TAX_INFO.panNumber}</strong> | {DEFAULT_UNAKO_TAX_INFO.irdOfficeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Global Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {t('कुल करयोग्य भुक्तानी (Gross)', 'Total Gross Payment')}
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block font-mono">
              {fmtCurrency(totalGrossWithheld)}
            </span>
            <span className="text-[10px] text-slate-400">{records.length} {t('कारोबारहरू', 'transactions')}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-red-200 dark:border-red-950/60 shadow-sm">
            <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
              {t('कुल कट्टी कर (Total TDS)', 'Total TDS Withheld')}
            </span>
            <span className="text-lg font-black text-red-600 dark:text-red-400 mt-0.5 block font-mono">
              {fmtCurrency(totalTdsWithheld)}
            </span>
            <span className="text-[10px] text-slate-400">{t('सरकारी राजस्व दायित्व', 'Govt Treasury Liability')}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-950/60 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              {t('दाखिला भएको कर (Deposited)', 'Deposited to Treasury')}
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">
              {fmtCurrency(totalDeposited)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              {fmtPercent(totalTdsWithheld > 0 ? (totalDeposited / totalTdsWithheld) * 100 : 100)} {t('दाखिला', 'Deposited')}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-950/60 shadow-sm">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              {t('दाखिला बाँकी कर (Pending)', 'Pending Deposit')}
            </span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 block font-mono">
              {fmtCurrency(totalPending)}
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
              {totalPending > 0 ? t('महिनाको २५ गतेभित्र बुझाउनु पर्ने', 'Due by 25th of month') : t('सबै दाखिला भइसकेको', 'Fully cleared')}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'REGISTER'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="size-4" />
            <span>{t('e-TDS अभिलेख तथा अनुसूची (Register)', 'e-TDS Register & Schedule')}</span>
          </button>

          <button
            onClick={() => setActiveTab('EXPORTER')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'EXPORTER'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="size-4" />
            <span>{t('IRD अपलोड फाइल जेनेरेटर (Portal Exporter)', 'IRD Portal File Exporter')}</span>
          </button>

          <button
            onClick={() => setActiveTab('VOUCHERS')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'VOUCHERS'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Coins className="size-4" />
            <span>{t('राजस्व दाखिला भौचर मिलान (Treasury Vouchers)', 'Treasury Deposit Vouchers')}</span>
          </button>

          <button
            onClick={() => setActiveTab('CERTIFICATE')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'CERTIFICATE'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>{t('कर कट्टी प्रमाणपत्र फाराम नं. ८८ (TDS Certificate)', 'TDS Deduction Certificate Form 88')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: e-TDS Register */}
          {activeTab === 'REGISTER' && (
            <div className="space-y-6">
              
              {/* Compliance Warning Banner */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                filingCompliance.isFullyDeposited
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}>
                <div className="flex items-center gap-3">
                  {filingCompliance.isFullyDeposited ? (
                    <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="size-6 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {filingCompliance.isFullyDeposited
                        ? t('महिनाको कर कट्टी दाखिला शतप्रतिशत सम्पन्न (Fully Complied)', 'Monthly TDS fully deposited into Nepal Treasury')
                        : t('कर कट्टी रकम समयमै दाखिला गर्नुपर्ने कानूनी सूचना', 'Statutory TDS Deposit & Filing Notice')}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {t(
                        `आर्थिक वर्ष ${selectedFiscalYear} ${selectedMonthBS} महिनाको कर कट्टी दाखिला म्याद: अर्को महिनाको २५ गते (अन्दाजी विलम्ब शुल्क रु. ${filingCompliance.estimatedLateFee.toFixed(2)})`,
                        `FY ${selectedFiscalYear} ${selectedMonthBS} deadline: 25th of next month (Estimated delay interest: NPR ${filingCompliance.estimatedLateFee.toFixed(2)})`
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="size-4" />
                    <span>{t('+ नयाँ कर कट्टी दर्ता', '+ Add New TDS Entry')}</span>
                  </button>
                </div>
              </div>

              {/* Add New TDS Form Modal/Drawer */}
              {showAddForm && (
                <form onSubmit={handleAddNewRecord} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Plus className="size-4 text-red-600" />
                    <span>{t('नयाँ कर कट्टी दाखिला प्रविष्टि (New TDS Deduction Entry)', 'New TDS Deduction Entry')}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('कानूनी दफा (Section)', 'TDS Section')}</label>
                      <select
                        value={newSection}
                        onChange={(e) => {
                          const s = e.target.value as TdsSectionCode;
                          setNewSection(s);
                          setNewCustomRate(getStandardTdsRate(s, newDeducteeType));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                      >
                        <option value="SEC_87">दफा ८७ - कर्मचारी पारिश्रमिक (Sec 87 Payroll)</option>
                        <option value="SEC_88_INTEREST">दफा ८८(१) - निक्षेप/बचत ब्याज (Sec 88(1) Interest 5%/15%)</option>
                        <option value="SEC_88_DIVIDEND">दफा ८८(२) - सेयर लाभांश (Sec 88(2) Dividend 5%)</option>
                        <option value="SEC_88_RENT">दफा ८८(१) - घरभाडा (Sec 88(1) Rent 10%)</option>
                        <option value="SEC_88_SERVICE">दफा ८८(१) - लेखापरीक्षण/परामर्श सेवा (Sec 88(1) Service Fee)</option>
                        <option value="SEC_89_CONTRACT">दफा ८९ - ठेक्का तथा आपूर्ति (Sec 89 Contract 1.5%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('भुक्तानी पाउनेको वर्ग', 'Deductee Type')}</label>
                      <select
                        value={newDeducteeType}
                        onChange={(e) => {
                          const dt = e.target.value as 'INDIVIDUAL' | 'ENTITY';
                          setNewDeducteeType(dt);
                          setNewCustomRate(getStandardTdsRate(newSection, dt));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                      >
                        <option value="INDIVIDUAL">व्यक्तिगत सदस्य/कर्मचारी (Individual)</option>
                        <option value="ENTITY">संस्थागत/कम्पनी/फर्म (Corporate Entity)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('स्थायी लेखा नं. (PAN No)', 'PAN No')}</label>
                      <input
                        type="text"
                        placeholder="9-digit PAN e.g. 601234567"
                        value={newDeducteePan}
                        onChange={(e) => setNewDeducteePan(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('भुक्तानी पाउनेको नाम', 'Deductee Full Name')}</label>
                      <input
                        type="text"
                        placeholder="e.g. राम बहादुर चौधरी"
                        value={newDeducteeName}
                        onChange={(e) => setNewDeducteeName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('सदस्य / कर्मचारी नं.', 'Member / Staff ID')}</label>
                      <input
                        type="text"
                        placeholder="e.g. M-102 or EMP-2078-001"
                        value={newMemberId}
                        onChange={(e) => setNewMemberId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('कुल भुक्तानी रकम (Gross NPR)', 'Gross Amount NPR')}</label>
                      <input
                        type="number"
                        min="1"
                        value={newGrossAmount}
                        onChange={(e) => setNewGrossAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-500">
                      {t('कर दर:', 'TDS Rate:')} <strong className="text-red-600">{fmtPercent(newCustomRate)}</strong> | {t('कट्टी कर:', 'TDS Amount:')} <strong className="text-red-600 font-mono">{fmtCurrency((newGrossAmount * newCustomRate) / 100)}</strong> | {t('खुद भुक्तानी:', 'Net Paid:')} <strong className="text-slate-900 dark:text-white font-mono">{fmtCurrency(newGrossAmount - ((newGrossAmount * newCustomRate) / 100))}</strong>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                      >
                        {t('रद्द गर्नुहोस्', 'Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                      >
                        {t('सुरक्षित गर्नुहोस्', 'Save TDS Record')}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Filters toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedFiscalYear}
                    onChange={(e) => setSelectedFiscalYear(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="2081/82">आ.व. २०८१/८२ (FY 2081/82)</option>
                    <option value="2080/81">आ.व. २०८०/८१ (FY 2080/81)</option>
                  </select>

                  <select
                    value={selectedMonthBS}
                    onChange={(e) => setSelectedMonthBS(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="ALL">{t('सबै महिना (All Months)', 'All Months')}</option>
                    <option value="श्रावण">श्रावण (Shrawan)</option>
                    <option value="भाद्र">भाद्र (Bhadra)</option>
                    <option value="आश्विन">आश्विन (Ashwin)</option>
                    <option value="कार्तिक">कार्तिक (Kartik)</option>
                    <option value="मंसिर">मंसिर (Mangsir)</option>
                    <option value="पौष">पौष (Poush)</option>
                    <option value="माघ">माघ (Magh)</option>
                    <option value="फाल्गुन">फाल्गुन (Falgun)</option>
                    <option value="चैत्र">चैत्र (Chaitra)</option>
                    <option value="वैशाख">वैशाख (Baishakh)</option>
                    <option value="ज्येष्ठ">ज्येष्ठ (Jestha)</option>
                    <option value="असार">असार (Ashad)</option>
                  </select>

                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value as 'ALL' | TdsSectionCode)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="ALL">{t('सबै कानूनी दफाहरू (All Sections)', 'All Sections')}</option>
                    <option value="SEC_87">दफा ८७ - पारिश्रमिक (Payroll)</option>
                    <option value="SEC_88_INTEREST">दफा ८८(१) - ब्याज (Interest)</option>
                    <option value="SEC_88_DIVIDEND">दफा ८८(२) - लाभांश (Dividend)</option>
                    <option value="SEC_88_RENT">दफा ८८(१) - घरभाडा (Rent)</option>
                    <option value="SEC_88_SERVICE">दफा ८८(१) - सेवा शुल्क (Service)</option>
                    <option value="SEC_89_CONTRACT">दफा ८९ - ठेक्का (Contract)</option>
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('नाम, प्यान, भौचर खोजी...', 'Search name, PAN, voucher...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-3.5">{t('मिति वि.सं.', 'Date BS')}</th>
                        <th className="py-3 px-3.5">{t('कानूनी दफा', 'Section')}</th>
                        <th className="py-3 px-3.5">{t('भुक्तानी पाउने व्यक्ति / संस्था', 'Deductee Name')}</th>
                        <th className="py-3 px-3.5">{t('प्यान नं. (PAN)', 'PAN')}</th>
                        <th className="py-3 px-3.5 text-right">{t('कुल रकम (Gross)', 'Gross Amount')}</th>
                        <th className="py-3 px-3.5 text-center">{t('कर दर', 'Rate')}</th>
                        <th className="py-3 px-3.5 text-right">{t('कट्टी कर (TDS)', 'TDS Amount')}</th>
                        <th className="py-3 px-3.5 text-right">{t('खुद भुक्तानी (Net)', 'Net Paid')}</th>
                        <th className="py-3 px-3.5">{t('दाखिला भौचर', 'Voucher')}</th>
                        <th className="py-3 px-3.5 text-center">{t('स्थिति', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                            {t('कुनै कर कट्टी कारोबार फेला परेन।', 'No TDS transactions found.')}
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <td className="py-3 px-3.5 font-mono whitespace-nowrap">{r.transactionDateBS}</td>
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {r.sectionCode}
                              </span>
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="font-bold text-slate-900 dark:text-white">{r.deducteeName}</div>
                              {r.deducteeMemberId && (
                                <span className="text-[10px] text-slate-400">ID: {r.deducteeMemberId}</span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 font-mono font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                              {r.deducteePan}
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono font-medium">
                              {fmtCurrency(r.grossPaymentAmount)}
                            </td>
                            <td className="py-3 px-3.5 text-center font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                              {fmtPercent(r.tdsRatePercent)}
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                              {fmtCurrency(r.tdsAmount)}
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {fmtCurrency(r.netPaidAmount)}
                            </td>
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              {r.bankDepositVoucherNo ? (
                                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                  {r.bankDepositVoucherNo}
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-500 font-bold">{t('दाखिला बाँकी', 'Pending')}</span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-center whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'DEPOSITED' || r.status === 'FILED_IRD'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IRD Portal Exporter */}
          {activeTab === 'EXPORTER' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600">
                    <Download className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {t('आन्तरिक राजस्व विभाग e-TDS पोर्टल फाइल डाउनलोड', 'Download Official IRD e-TDS Upload Files')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t(
                        'taxpayerportal.ird.gov.np मा "e-TDS Return Submission" मेनुबाट सिधै अपलोड गर्न मिल्ने मानक ट्याब-डिलिमिटेड टेक्स्ट तथा एक्सेल विवरण फाइल।',
                        'Official tab-delimited text & Excel CSV files ready for direct submission to taxpayerportal.ird.gov.np.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {t('१. IRD पोर्टल अपलोड टेक्स्ट फाइल (.txt)', '1. IRD Portal Upload Text File (.txt)')}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {t(
                        'आन्तरिक राजस्व विभागको सफ्टवेयरले स्वीकार गर्ने १०-स्तम्भीय ट्याब डिलिमिटेड e-TDS फाइल।',
                        'Standard 10-column tab-delimited e-TDS text file verified for IRD web parser.'
                      )}
                    </p>
                    <button
                      onClick={handleDownloadTextFile}
                      className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="size-4" />
                      <span>{t('IRD e-TDS टेक्स्ट फाइल डाउनलोड (.txt)', 'Download IRD e-TDS .txt File')}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {t('२. अनुसूची फाराम ८८ एक्सेल/सीएसभी (.csv)', '2. Annexure Schedule Form 88 (.csv)')}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {t(
                        'लेखापरीक्षण, आन्तरिक नियन्त्रण तथा संचालक समिति समिक्षाको लागि पूर्ण विस्तृत अनुसूची।',
                        'Comprehensive CSV schedule including Nepali headers for external auditor and board review.'
                      )}
                    </p>
                    <button
                      onClick={handleDownloadCsv}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="size-4" />
                      <span>{t('अनुसूची फाराम ८८ डाउनलोड (.csv)', 'Download Annexure Form 88 .csv')}</span>
                    </button>
                  </div>
                </div>

                {/* File Preview */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {t('IRD e-TDS टेक्स्ट फाइल पूर्वावलोकन (Live Text Preview)', 'IRD e-TDS Text Output Preview')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {filteredRecords.length} records ready
                    </span>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-56 border border-slate-800">
                    {generateIrdETdsTextFile(filteredRecords, DEFAULT_UNAKO_TAX_INFO.panNumber)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Treasury Vouchers */}
          {activeTab === 'VOUCHERS' && (
            <div className="space-y-6">
              {/* Summary by Revenue Head */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {sectionSummaries.map((s) => (
                  <div key={s.sectionCode} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        शीर्षक: {s.revenueHead}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{s.transactionCount} {t('दाखिला', 'entries')}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{s.sectionLabelNepali}</h4>
                    <div className="text-xs space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-slate-500">
                        <span>{t('कुल कर:', 'Total TDS:')}</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{fmtCurrency(s.totalTdsAmount)}</strong>
                      </div>
                      <div className="flex justify-between text-emerald-600">
                        <span>{t('दाखिला भइसकेको:', 'Deposited:')}</span>
                        <strong className="font-mono">{fmtCurrency(s.depositedAmount)}</strong>
                      </div>
                      <div className="flex justify-between text-amber-600">
                        <span>{t('दाखिला बाँकी:', 'Pending:')}</span>
                        <strong className="font-mono">{fmtCurrency(s.pendingDepositAmount)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Voucher Reconciliation Form */}
              <form onSubmit={handleDepositVoucherReconcile} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Coins className="size-5 text-red-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('नेपाल सरकार राजस्व खातामा बैंक दाखिला भौचर प्रविष्टि', 'Record Government Treasury Bank Deposit Voucher')}
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  {t(
                    'राष्ट्रिय वाणिज्य बैंक वा नेपाल बैंक लिमिटेडको खजाना खातामा रकम जम्मा गरी प्राप्त भएको भौचर नं. प्रविष्ट गर्नुहोस्। यसले सम्बन्धित शीर्षकका सबै कर कट्टीहरूलाई "DEPOSITED" स्थितिमा अद्यावधिक गर्दछ।',
                    'Enter official Treasury deposit voucher from Rastriya Banijya Bank / Nepal Bank Ltd. This marks all matching pending withholding records as DEPOSITED.'
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{t('राजस्व शीर्षक (Revenue Head)', 'Revenue Head')}</label>
                    <select
                      value={reconcileHead}
                      onChange={(e) => setReconcileHead(e.target.value as RevenueHeadCode)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
                    >
                      <option value="11111">11111 - पारिश्रमिक कर (Employment Income)</option>
                      <option value="11112">11112 - ब्याज तथा लाभांश कर (Interest & Dividend)</option>
                      <option value="11113">11113 - ठेक्का, सेवा तथा घरभाडा कर (Contract/Service/Rent)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{t('बैंक दाखिला भौचर नं.', 'Bank Deposit Voucher No.')}</label>
                    <input
                      type="text"
                      placeholder="e.g. VCH-RBB-9923"
                      value={reconcileVoucherNo}
                      onChange={(e) => setReconcileVoucherNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{t('दाखिला भएको बैंक तथा शाखा', 'Treasury Bank & Branch')}</label>
                    <input
                      type="text"
                      value={reconcileBank}
                      onChange={(e) => setReconcileBank(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">{t('दाखिला मिति वि.सं.', 'Deposit Date BS')}</label>
                    <input
                      type="text"
                      value={reconcileDateBS}
                      onChange={(e) => setReconcileDateBS(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>{t('भौचर दाखिला मिलान गर्नुहोस्', 'Confirm & Reconcile Voucher')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: Form 88 Certificate */}
          {activeTab === 'CERTIFICATE' && (
            <div className="space-y-6">
              {/* Search Toolbar */}
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('सदस्य नं. वा प्यान नम्बर प्रविष्ट गर्नुहोस् (e.g. 601234567 or M-102)...', 'Enter Member ID or PAN...')}
                    value={certSearchQuery}
                    onChange={(e) => setCertSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>
                {certificateData && (
                  <button
                    onClick={handlePrintCertificate}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Printer className="size-4" />
                    <span>{t('प्रमाणपत्र प्रिन्ट (Print Certificate)', 'Print Certificate')}</span>
                  </button>
                )}
              </div>

              {/* Certificate Sheet Display */}
              {!certificateData ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  {t('कुनै सदस्य वा कर कट्टी अभिलेख फेला परेन। कृपया मान्य प्यान वा सदस्य नं. खोज्नुहोस्।', 'No matching tax deduction record found. Please enter a valid PAN or Member ID.')}
                </div>
              ) : (
                <div className="bg-white text-slate-950 p-8 rounded-3xl border border-slate-300 shadow-xl max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none">
                  {/* Official Header */}
                  <div className="text-center border-b pb-4 space-y-1">
                    <span className="text-xs font-bold text-red-700 uppercase tracking-widest block">
                      नेपाल सरकार | आन्तरिक राजस्व विभाग
                    </span>
                    <h1 className="text-xl font-black text-slate-900">
                      {DEFAULT_UNAKO_TAX_INFO.cooperativeNameNepali}
                    </h1>
                    <p className="text-xs text-slate-600 font-medium">
                      {DEFAULT_UNAKO_TAX_INFO.addressNepali} | {t('सम्पर्क:', 'Tel:')} ०८२-५४०१२३
                    </p>
                    <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold font-mono">
                      स्थायी लेखा नं (Withholder PAN): {DEFAULT_UNAKO_TAX_INFO.panNumber}
                    </div>
                    <h2 className="text-base font-bold text-slate-800 pt-2 underline decoration-red-600 underline-offset-4">
                      कर कट्टी प्रमाणपत्र (Tax Deduction Certificate - फाराम नं. ८८)
                    </h2>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 font-bold block">कर कट्टी हुने व्यक्तिको नाम:</span>
                      <strong className="text-sm font-black text-slate-900">{certificateData.deductee.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">स्थायी लेखा नं. (Deductee PAN):</span>
                      <strong className="text-sm font-mono font-black text-slate-900">{certificateData.deductee.pan}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">प्रमाणपत्र नं. (Certificate No):</span>
                      <strong className="font-mono text-slate-800">{certificateData.certificateNo}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">आर्थिक वर्ष (Fiscal Year):</span>
                      <strong className="font-mono text-slate-800">{certificateData.fiscalYear}</strong>
                    </div>
                  </div>

                  {/* Deduction Details Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                          <th className="p-2 border-r border-slate-300">क्र.सं.</th>
                          <th className="p-2 border-r border-slate-300">मिति वि.सं.</th>
                          <th className="p-2 border-r border-slate-300">आयको प्रकार / दफा</th>
                          <th className="p-2 border-r border-slate-300 text-right">करयोग्य रकम रु.</th>
                          <th className="p-2 border-r border-slate-300 text-center">कर दर %</th>
                          <th className="p-2 border-r border-slate-300 text-right">कट्टी भएको कर रु.</th>
                          <th className="p-2 text-center">दाखिला भौचर नं.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {certificateData.records.map((r, idx) => (
                          <tr key={r.id}>
                            <td className="p-2 border-r border-slate-200 text-center">{idx + 1}</td>
                            <td className="p-2 border-r border-slate-200 font-mono">{r.transactionDateBS}</td>
                            <td className="p-2 border-r border-slate-200 font-medium">{r.sectionLabelNepali}</td>
                            <td className="p-2 border-r border-slate-200 text-right font-mono">{fmtCurrency(r.grossPaymentAmount)}</td>
                            <td className="p-2 border-r border-slate-200 text-center font-bold text-red-600">{fmtPercent(r.tdsRatePercent)}</td>
                            <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-red-700">{fmtCurrency(r.tdsAmount)}</td>
                            <td className="p-2 text-center font-mono font-bold text-emerald-700">{r.bankDepositVoucherNo || 'दाखिला विचाराधीन'}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                          <td colSpan={3} className="p-2 border-r border-slate-300 text-right">कुल जम्मा (Total):</td>
                          <td className="p-2 border-r border-slate-300 text-right font-mono">{fmtCurrency(certificateData.totalGrossAmount)}</td>
                          <td className="p-2 border-r border-slate-300 text-center">-</td>
                          <td className="p-2 border-r border-slate-300 text-right font-mono text-red-700">{fmtCurrency(certificateData.totalTdsDeducted)}</td>
                          <td className="p-2 text-center font-mono text-emerald-700">{fmtCurrency(certificateData.totalTdsDeposited)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Verification & Signatures */}
                  <div className="pt-4 border-t border-slate-300 space-y-4">
                    <p className="text-[11px] text-slate-600 italic">
                      प्रमाणित गरिन्छ कि माथि उल्लेखित रकमबाट कट्टी गरिएको कर नेपाल सरकार आन्तरिक राजस्व कार्यालय तुलसीपुर दाङको राजस्व खातामा जम्मा गरी ई-टिडीएस प्रणालीमा समेत प्रविष्टि गरिएको छ।
                    </p>

                    <div className="flex items-center justify-between pt-6">
                      <div className="text-left space-y-1">
                        <div className="font-mono text-[10px] text-slate-500">
                          प्रमाणीकरण कोड: <strong className="text-slate-800">{certificateData.verificationHash}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          जारी मिति: २०८१/१२/३० वि.सं. | गढवा दाङ
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="w-48 border-b border-dashed border-slate-400 mb-1"></div>
                        <span className="text-xs font-bold text-slate-800 block">अधिकृत हस्ताक्षर / संस्थाको छाप</span>
                        <span className="text-[10px] text-slate-500">व्यवस्थापक / प्रमुख कार्यकारी अधिकृत</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {t('सहकारी आन्तरिक राजस्व अनुपालन प्रणाली', 'Cooperative IRD Statutory Compliance Gateway')}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition cursor-pointer"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>

      </div>
    </div>
  );
};
