import React, { useState, useMemo } from 'react';
import {
  X,
  Warehouse,
  Wheat,
  Coins,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Search,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Scale,
  Receipt,
  Calendar,
  DollarSign,
  TrendingUp,
  Layers,
  Sparkles,
  Droplets,
  Building2,
  BadgeCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import {
  CommodityType,
  CommodityGrade,
  WarehouseReceipt,
  WarehousePledgeLoan,
} from '../../types/warehouseReceipt';
import {
  COMMODITY_CATALOG,
  DEFAULT_STORAGE_FEE_PER_QUINTAL_MONTH,
  DEFAULT_PLEDGE_LOAN_INTEREST_RATE,
  STATUTORY_MAX_PLEDGE_LTV_PERCENT,
  inspectCommodityQuality,
  calculateWarehouseReceiptValuation,
  calculateHarvestLiquidationSettlement,
} from '../../utils/warehouseReceiptEngine';
import { printElement } from '../../utils/printHelper';

interface WarehouseReceiptFinancingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedReceiptId?: string;
}

export const WarehouseReceiptFinancingModal: React.FC<WarehouseReceiptFinancingModalProps> = ({
  isOpen,
  onClose,
  preselectedReceiptId,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtCount } = useLanguageStore();
  const {
    members,
    savings,
    coopSettings,
    warehouseReceipts,
    warehousePledgeLoans,
    issueWarehouseReceipt,
    disbursePledgeLoan,
    settleWarehouseReceipt,
  } = useCoopStore();

  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'NEW_INTAKE' | 'PLEDGE_LOAN' | 'LIQUIDATION' | 'CERTIFICATE'>(
    preselectedReceiptId ? 'PLEDGE_LOAN' : 'DIRECTORY'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [commodityFilter, setCommodityFilter] = useState<string>('ALL');
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>(
    preselectedReceiptId || (warehouseReceipts[0]?.id ?? '')
  );

  // --- New Intake Form State ---
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id ?? '');
  const [commodityType, setCommodityType] = useState<CommodityType>('PADDY_DHAN');
  const [varietyName, setVarietyName] = useState('सोना मन्सुली (Sona Mansuli)');
  const [bagCount, setBagCount] = useState<number>(50);
  const [netWeightQuintals, setNetWeightQuintals] = useState<number>(25);
  const [storageLocation, setStorageLocation] = useState('गढवा मुख्य अन्न गोदाम (Silo A-2)');
  const [moisturePercent, setMoisturePercent] = useState<number>(13.2);
  const [foreignMatterPercent, setForeignMatterPercent] = useState<number>(1.2);
  const [inspectorNotes, setInspectorNotes] = useState('');

  // --- Pledge Loan Form State ---
  const [loanPrincipalInput, setLoanPrincipalInput] = useState<number>(50000);
  const [loanTenureMonths, setLoanTenureMonths] = useState<number>(6);
  const [savingsAccountNo, setSavingsAccountNo] = useState<string>('');
  const [loanNotes, setLoanNotes] = useState('');

  // --- Liquidation Form State ---
  const [actualSaleRate, setActualSaleRate] = useState<number>(4100);
  const [buyerName, setBuyerName] = useState('गढवा कृषि थोक बजार समिति (Dang Agro Mart)');
  const [elapsedMonths, setElapsedMonths] = useState<number>(3);

  // Success message state
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Sync selected receipt
  const currentReceipt = useMemo(() => {
    return warehouseReceipts.find((r) => r.id === selectedReceiptId) || warehouseReceipts[0];
  }, [warehouseReceipts, selectedReceiptId]);

  const activePledgeLoan = useMemo(() => {
    return warehousePledgeLoans.find((l) => l.receiptId === currentReceipt?.id && l.status === 'ACTIVE');
  }, [warehousePledgeLoans, currentReceipt]);

  // Derived inspection for new intake
  const liveInspection = useMemo(() => {
    return inspectCommodityQuality(commodityType, moisturePercent, foreignMatterPercent, inspectorNotes);
  }, [commodityType, moisturePercent, foreignMatterPercent, inspectorNotes]);

  // Derived valuation for new intake
  const liveValuation = useMemo(() => {
    return calculateWarehouseReceiptValuation(commodityType, netWeightQuintals, liveInspection);
  }, [commodityType, netWeightQuintals, liveInspection]);

  // Derived liquidation preview
  const liquidationPreview = useMemo(() => {
    if (!currentReceipt) return null;
    return calculateHarvestLiquidationSettlement(
      {
        receipt: currentReceipt,
        pledgeLoan: activePledgeLoan,
        actualSaleRatePerQuintal: actualSaleRate,
        saleDate: new Date().toISOString().split('T')[0],
        buyerName,
      },
      elapsedMonths
    );
  }, [currentReceipt, activePledgeLoan, actualSaleRate, buyerName, elapsedMonths]);

  // Directory Stats
  const totalQuintals = useMemo(() => {
    return warehouseReceipts
      .filter((r) => r.status === 'STORED' || r.status === 'PLEDGED')
      .reduce((sum, r) => sum + r.netWeightQuintals, 0);
  }, [warehouseReceipts]);

  const totalValuation = useMemo(() => {
    return warehouseReceipts
      .filter((r) => r.status === 'STORED' || r.status === 'PLEDGED')
      .reduce((sum, r) => sum + r.totalMarketValuation, 0);
  }, [warehouseReceipts]);

  const totalActiveLoansDisbursed = useMemo(() => {
    return warehousePledgeLoans
      .filter((l) => l.status === 'ACTIVE')
      .reduce((sum, l) => sum + l.principalDisbursed, 0);
  }, [warehousePledgeLoans]);

  const filteredReceipts = useMemo(() => {
    return warehouseReceipts.filter((r) => {
      const matchQuery =
        r.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.varietyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCommodity = commodityFilter === 'ALL' || r.commodity === commodityFilter;
      return matchQuery && matchCommodity;
    });
  }, [warehouseReceipts, searchQuery, commodityFilter]);

  if (!isOpen) return null;

  // Handle bag count change with 50kg auto quintal conversion
  const handleBagCountChange = (bags: number) => {
    setBagCount(bags);
    setNetWeightQuintals(Math.round((bags * 50) / 100)); // 1 bag = 50kg, 1 quintal = 100kg
  };

  const handleIssueReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find((m) => m.id === selectedMemberId);
    if (!member) return;

    if (!liveInspection.isMoistureAcceptable) {
      alert(t('नमीको मात्रा अत्यधिक छ। अन्न स्वीकार गर्न सकिँदैन।', 'Moisture exceeds maximum threshold. Crop cannot be accepted.'));
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newReceipt = issueWarehouseReceipt({
      memberId: member.id,
      memberName: member.name,
      memberNo: member.memberNo,
      memberPhone: member.phone,
      commodity: commodityType,
      varietyName,
      bagCount,
      netWeightQuintals,
      storageLocation,
      qualityInspection: liveInspection,
      baseMarketRatePerQuintal: liveValuation.baseMarketRate,
      effectiveRatePerQuintal: liveValuation.effectiveRate,
      totalMarketValuation: liveValuation.totalMarketValuation,
      maxEligiblePledgeLoanAmount: liveValuation.maxEligiblePledgeLoanAmount,
      storageMonthlyChargePerQuintal: DEFAULT_STORAGE_FEE_PER_QUINTAL_MONTH,
      depositDate: today,
      expiryDate: expiry,
    });

    setSelectedReceiptId(newReceipt.id);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    setSuccessBanner(t(
      `नयाँ अन्न गोदाम रसिद ${newReceipt.receiptNo} सफलतापूर्वक जारी गरियो।`,
      `Electronic Warehouse Receipt ${newReceipt.receiptNo} issued successfully.`
    ));
    setActiveTab('DIRECTORY');
  };

  const handleDisburseLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReceipt) return;

    const memberSavings = savings.find((s) => s.memberId === currentReceipt.memberId);
    const targetAccountNo = savingsAccountNo || memberSavings?.accountNo || 'SAV-GEN-001';

    if (loanPrincipalInput > currentReceipt.maxEligiblePledgeLoanAmount) {
      alert(t(
        `ऋण रकम अधिकतम सीमा (रु. ${currentReceipt.maxEligiblePledgeLoanAmount.toLocaleString()}) भन्दा बढी हुन सक्दैन।`,
        `Loan amount cannot exceed 70% LTV ceiling of NPR ${currentReceipt.maxEligiblePledgeLoanAmount.toLocaleString()}`
      ));
      return;
    }

    const loan = disbursePledgeLoan({
      receiptId: currentReceipt.id,
      principalAmount: loanPrincipalInput,
      savingsAccountNo: targetAccountNo,
      tenureMonths: loanTenureMonths,
      notes: loanNotes,
    });

    confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
    setSuccessBanner(t(
      `कृषि उपज धितो कर्जा ${loan.loanNo} बापत रु. ${loan.principalDisbursed.toLocaleString()} बचत खाता (${targetAccountNo}) मा तुरुन्त भुक्तानी गरियो।`,
      `Crop Pledge Loan ${loan.loanNo} of NPR ${loan.principalDisbursed.toLocaleString()} disbursed to savings (${targetAccountNo}).`
    ));
    setActiveTab('DIRECTORY');
  };

  const handleLiquidationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReceipt || !liquidationPreview) return;

    settleWarehouseReceipt(
      {
        receipt: currentReceipt,
        pledgeLoan: activePledgeLoan,
        actualSaleRatePerQuintal: actualSaleRate,
        saleDate: new Date().toISOString().split('T')[0],
        buyerName,
      },
      elapsedMonths
    );

    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    setSuccessBanner(t(
      `बिक्री मिलान सम्पन्न भयो। किसानको बचत खातामा खुद नाफा रु. ${liquidationPreview.netSurplusPayableToMember.toLocaleString()} जम्मा गरियो।`,
      `Harvest liquidation completed! Net surplus of NPR ${liquidationPreview.netSurplusPayableToMember.toLocaleString()} credited to member passbook.`
    ));
    setActiveTab('DIRECTORY');
  };

  const handlePrintCertificate = () => {
    printElement('whr-certificate-print', {
      format: 'a4',
      title: `Warehouse-Receipt-${currentReceipt?.receiptNo || 'Certificate'}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-surface-canvas text-on-surface rounded-3xl border border-outline/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline/10 bg-surface-elevated/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shadow-xs">
              <Warehouse className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
                  {t('सहकारी अन्न भण्डार तथा मूल्य शृंखला', 'Cooperative Grain Silos & Agri-Value Chain')}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {t('७०% सुरक्षित LTV', '70% Safe LTV')}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('अन्न गोदाम रसिद तथा कृषि उपज धितो कर्जा प्रणाली', 'Warehouse Receipt Financing & Crop Pledge Suite')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Global Success Banner */}
        {successBanner && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-500 hover:text-emerald-700 text-xs underline"
            >
              {t('बन्द गर्नुहोस्', 'Dismiss')}
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="px-6 pt-3 border-b border-outline/10 bg-surface-elevated/20 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border ${
              activeTab === 'DIRECTORY'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="size-4" />
            {t('गोदाम मौज्दात तथा रसिद सूची', 'Silo Inventory & Receipts')}
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
              {fmtCount(warehouseReceipts.length)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('NEW_INTAKE')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border ${
              activeTab === 'NEW_INTAKE'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="size-4" />
            {t('नयाँ अन्न भण्डारण तथा गुणस्तर जाँच', 'New Crop Intake & Grading')}
          </button>

          <button
            onClick={() => setActiveTab('PLEDGE_LOAN')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border ${
              activeTab === 'PLEDGE_LOAN'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Coins className="size-4" />
            {t('धितो कर्जा प्रवाह (८.५%)', 'Disburse Pledge Loan')}
          </button>

          <button
            onClick={() => setActiveTab('LIQUIDATION')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border ${
              activeTab === 'LIQUIDATION'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="size-4" />
            {t('बजार बिक्री तथा नाफा मिलान', 'Harvest Sale Liquidation')}
          </button>

          <button
            onClick={() => setActiveTab('CERTIFICATE')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border ${
              activeTab === 'CERTIFICATE'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Printer className="size-4" />
            {t('ई-गोदाम रसिद प्रमाणपत्र', 'E-WHR Certificate')}
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DIRECTORY */}
          {activeTab === 'DIRECTORY' && (
            <div className="space-y-6">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {t('कुल भण्डारित अन्न मौज्दात', 'Total Stored Grain')}
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {fmtDigits(totalQuintals)} <span className="text-xs font-medium text-slate-500">क्विन्टल ({fmtDigits(Math.round(totalQuintals / 10))} मे.टन)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t('गढवा मुख्य गोदामका ३ वटा साइलोमा', 'Across 3 Silo Bays in Gadhwa')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {t('कुल बजार मूल्याङ्कन', 'Total Commodity Valuation')}
                  </span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {fmtCurrency(totalValuation)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t('७०% सुरक्षित धितो क्षमता: ', '70% Safe Pledge Capacity: ')}
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {fmtCurrency(Math.floor(totalValuation * 0.7))}
                    </span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {t('प्रवाहित कृषि धितो कर्जा', 'Active Pledge Loans Disbursed')}
                  </span>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {fmtCurrency(totalActiveLoansDisbursed)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t('सहुलियतपूर्ण ८.५% कृषि दरमा', 'At 8.5% Concessional Agro Rate')}
                  </p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('रसिद नं, सदस्य वा बालीको नाम खोज्नुहोस्...', 'Search receipt, member, crop variety...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                  {['ALL', 'PADDY_DHAN', 'MUSTARD_TORI', 'MAIZE_MAKAI', 'WHEAT_GAHU', 'LENTIL_DAAL'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCommodityFilter(cat)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                        commodityFilter === cat
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'ALL'
                        ? t('सबै बाली', 'All Crops')
                        : COMMODITY_CATALOG[cat as CommodityType]?.nameNepali.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Receipts Table */}
              <div className="rounded-2xl border border-outline/20 overflow-hidden bg-surface-canvas shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-outline/10">
                      <tr>
                        <th className="p-3.5">{t('रसिद नं', 'Receipt No')}</th>
                        <th className="p-3.5">{t('किसान सदस्य', 'Farmer Member')}</th>
                        <th className="p-3.5">{t('बाली तथा जात', 'Commodity & Variety')}</th>
                        <th className="p-3.5 text-right">{t('परिमाण (बोरा / क्विन्टल)', 'Bags / Quintals')}</th>
                        <th className="p-3.5">{t('गुणस्तर स्तर', 'Grade & Moisture')}</th>
                        <th className="p-3.5 text-right">{t('बजार मूल्याङ्कन', 'Market Valuation')}</th>
                        <th className="p-3.5 text-center">{t('अवस्था', 'Status')}</th>
                        <th className="p-3.5 text-right">{t('कार्य', 'Action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/10 font-medium">
                      {filteredReceipts.map((r) => {
                        const isPledged = r.status === 'PLEDGED';
                        const isStored = r.status === 'STORED';
                        return (
                          <tr
                            key={r.id}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors ${
                              r.id === selectedReceiptId ? 'bg-amber-500/5' : ''
                            }`}
                          >
                            <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                              {r.receiptNo}
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-900 dark:text-white">{r.memberName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{r.memberNo}</div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-800 dark:text-slate-200">{r.varietyName}</div>
                              <div className="text-[10px] text-slate-400">{r.storageLocation}</div>
                            </td>
                            <td className="p-3.5 text-right font-mono">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {fmtDigits(r.netWeightQuintals)} क्विन्टल
                              </div>
                              <div className="text-[10px] text-slate-400">({fmtDigits(r.bagCount)} बोरा)</div>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                  r.qualityInspection.grade === 'GRADE_A'
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-amber-500/10 text-amber-600'
                                }`}
                              >
                                {r.qualityInspection.grade}
                              </span>
                              <span className="ml-1.5 text-[10px] text-slate-400">
                                {r.qualityInspection.moisturePercent}% नमी
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                              {fmtCurrency(r.totalMarketValuation)}
                            </td>
                            <td className="p-3.5 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${
                                  r.status === 'STORED'
                                    ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                                    : r.status === 'PLEDGED'
                                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                    : r.status === 'LIQUIDATED_SOLD'
                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                    : 'bg-slate-500/10 text-slate-600'
                                }`}
                              >
                                {r.status === 'STORED'
                                  ? t('भण्डारित (कर्जा लिन बाँकी)', 'Stored')
                                  : r.status === 'PLEDGED'
                                  ? t('धितोमा (कर्जा चालू)', 'Pledged')
                                  : r.status === 'LIQUIDATED_SOLD'
                                  ? t('बिक्री मिलान भयो', 'Liquidated')
                                  : t('फिर्ता लगियो', 'Released')}
                              </span>
                            </td>
                            <td className="p-3.5 text-right space-x-1.5 shrink-0">
                              {isStored && (
                                <button
                                  onClick={() => {
                                    setSelectedReceiptId(r.id);
                                    setLoanPrincipalInput(r.maxEligiblePledgeLoanAmount);
                                    setActiveTab('PLEDGE_LOAN');
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
                                >
                                  {t('धितो कर्जा', 'Pledge Loan')}
                                </button>
                              )}
                              {(isPledged || isStored) && (
                                <button
                                  onClick={() => {
                                    setSelectedReceiptId(r.id);
                                    setActiveTab('LIQUIDATION');
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                                >
                                  {t('बजार बिक्री', 'Liquidate')}
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedReceiptId(r.id);
                                  setActiveTab('CERTIFICATE');
                                }}
                                className="px-2 py-1 text-[11px] font-bold rounded-lg border border-outline/20 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                              >
                                <Printer className="size-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEW INTAKE & QUALITY INSPECTION */}
          {activeTab === 'NEW_INTAKE' && (
            <form onSubmit={handleIssueReceiptSubmit} className="space-y-6 max-w-3xl mx-auto">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <Wheat className="size-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {t('कृषि उपज भण्डारण तथा ई-गोदाम रसिद जारी नियम', 'Commodity Inward & E-WHR Issuance Rules')}
                  </p>
                  <p>
                    {t(
                      'सहकारी ऐन २०७४ अनुसार भण्डारण गरिएको अन्नको गुणस्तर जाँच गरी नमी १४% भन्दा कम हुनु अनिवार्य छ। किसान सदस्यले ७०% सम्म सहुलियतपूर्ण धितो कर्जा तुरुन्तै प्राप्त गर्न सक्नेछन्।',
                      'Crop moisture must not exceed 14% for long-term silo storage. Member qualifies for an instant 70% pledge loan upon issuance.'
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Farmer Member Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('किसान सदस्य छनोट गर्नुहोस्', 'Select Farmer Member')}
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 focus:border-amber-500"
                    required
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.memberNo}) - {m.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Commodity Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('बालीको प्रकार (Commodity)', 'Commodity Type')}
                  </label>
                  <select
                    value={commodityType}
                    onChange={(e) => {
                      const type = e.target.value as CommodityType;
                      setCommodityType(type);
                      setVarietyName(COMMODITY_CATALOG[type].nameNepali);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 focus:border-amber-500"
                  >
                    {Object.values(COMMODITY_CATALOG).map((spec) => (
                      <option key={spec.type} value={spec.type}>
                        {spec.nameNepali} (रु. {spec.currentMarketRatePerQuintal.toLocaleString()}/क्विन्टल)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variety Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('बालीको स्थानीय जात / ब्रान्ड', 'Variety / Cultivar Name')}
                  </label>
                  <input
                    type="text"
                    value={varietyName}
                    onChange={(e) => setVarietyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 focus:border-amber-500"
                    placeholder="e.g. Sona Mansuli, Subarna, Deuti"
                    required
                  />
                </div>

                {/* Storage Bay */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('गोदाम कक्ष / साइलो नम्बर', 'Silo Bay / Bin Number')}
                  </label>
                  <select
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 focus:border-amber-500"
                  >
                    <option value="गढवा मुख्य अन्न गोदाम (Silo A-1)">गढवा मुख्य अन्न गोदाम (Silo A-1)</option>
                    <option value="गढवा मुख्य अन्न गोदाम (Silo A-2)">गढवा मुख्य अन्न गोदाम (Silo A-2)</option>
                    <option value="गढवा मुख्य अन्न गोदाम (Silo A-3)">गढवा मुख्य अन्न गोदाम (Silo A-3)</option>
                    <option value="चैनपुर कोल्ड स्ट्याक (Bay B-1)">चैनपुर कोल्ड स्ट्याक (Bay B-1)</option>
                    <option value="चैनपुर अन्न भण्डार (Bin C-1)">चैनपुर अन्न भण्डार (Bin C-1)</option>
                  </select>
                </div>

                {/* Bag Count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('कुल बोरा संख्या (Bags @ 50kg)', 'Total Bag Count')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={bagCount}
                    onChange={(e) => handleBagCountChange(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 focus:border-amber-500 font-mono font-bold"
                    required
                  />
                </div>

                {/* Net Weight in Quintals */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('खुद तौल (क्विन्टलमा)', 'Net Weight (Quintals)')}
                  </label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={netWeightQuintals}
                    onChange={(e) => setNetWeightQuintals(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 focus:border-amber-500 font-mono font-bold"
                    required
                  />
                </div>

                {/* Moisture % */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('नमीको मात्रा % (Moisture Meter)', 'Moisture Content %')}
                    </label>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                        liveInspection.isMoistureAcceptable
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {liveInspection.isMoistureAcceptable ? t('स्वीकृत', 'Acceptable') : t('अस्वीकृत', 'Too Wet')}
                    </span>
                  </div>
                  <input
                    type="number"
                    step={0.1}
                    min={5}
                    max={25}
                    value={moisturePercent}
                    onChange={(e) => setMoisturePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 focus:border-amber-500 font-mono font-bold"
                    required
                  />
                </div>

                {/* Foreign Matter % */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('धुलो तथा अखाद्य वस्तु % (Foreign Matter)', 'Foreign Matter %')}
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    max={15}
                    value={foreignMatterPercent}
                    onChange={(e) => setForeignMatterPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 focus:border-amber-500 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Inspector Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('गुणस्तर निरिक्षकको टिप्पणी (Quality Notes)', 'Quality Inspector Notes')}
                </label>
                <input
                  type="text"
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  placeholder={t('दानाको रङ्ग, सुकावट र कीरा-रोगमुक्त अवस्था...', 'Grain color, drying state, pest-free condition...')}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 focus:border-amber-500"
                />
              </div>

              {/* Live Computed Valuation Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {t('मूल्याङ्कन तथा धितो कर्जा सीमा (Live Computation)', 'Valuation & Pledge Limit')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400">
                    स्तर: {liveInspection.grade}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">{t('प्रचलित दर/क्विन्टल', 'Base Market Rate')}</span>
                    <span className="font-bold">{fmtCurrency(liveValuation.baseMarketRate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">{t('समायोजित दर', 'Effective Rate')}</span>
                    <span className="font-bold text-amber-400">{fmtCurrency(liveValuation.effectiveRate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">{t('कुल बजार मूल्याङ्कन', 'Total Valuation')}</span>
                    <span className="font-bold text-white text-sm">{fmtCurrency(liveValuation.totalMarketValuation)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">{t('७०% कर्जा योग्यता', 'Max 70% Loan')}</span>
                    <span className="font-bold text-emerald-400 text-sm">{fmtCurrency(liveValuation.maxEligiblePledgeLoanAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('DIRECTORY')}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl border border-outline/20 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!liveInspection.isMoistureAcceptable}
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white shadow-md transition-all flex items-center gap-2"
                >
                  <BadgeCheck className="size-4" />
                  {t('ई-गोदाम रसिद जारी गर्नुहोस्', 'Issue Electronic Warehouse Receipt')}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PLEDGE LOAN DISBURSAL */}
          {activeTab === 'PLEDGE_LOAN' && currentReceipt && (
            <form onSubmit={handleDisburseLoanSubmit} className="space-y-6 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                <Coins className="size-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {t('सहुलियतपूर्ण कृषि उपज धितो कर्जा (वार्षिक ८.५% दर)', 'Concessional Crop Pledge Loan (8.5% p.a.)')}
                  </p>
                  <p>
                    {t(
                      'गोदाममा भण्डारण गरिएको बालीको बजार मूल्याङ्कनको ७०% सम्म तत्काल सदस्यको बचत खातामा भुक्तानी गरिन्छ। यसले किसानलाई कटनीलगत्तै सस्तोमा बेच्नुपर्ने बाध्यताबाट बचाउँछ।',
                      'Instant disbursement into member passbook up to 70% LTV against stored grain, protecting farmers from seasonal distress selling.'
                    )}
                  </p>
                </div>
              </div>

              {/* Receipt Reference Card */}
              <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-outline/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-amber-500">{currentReceipt.receiptNo}</span>
                  <span className="text-slate-400">{currentReceipt.varietyName} ({currentReceipt.netWeightQuintals} क्विन्टल)</span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentReceipt.memberName} ({currentReceipt.memberNo})
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-outline/10">
                  <span className="text-slate-500">{t('कुल बजार मूल्याङ्कन:', 'Market Valuation:')}</span>
                  <span className="font-mono font-bold">{fmtCurrency(currentReceipt.totalMarketValuation)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t('अधिकतम ७०% कर्जा योग्यता:', 'Max 70% Loan Eligibility:')}</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {fmtCurrency(currentReceipt.maxEligiblePledgeLoanAmount)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Principal Amount */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('माग गरिएको कर्जा रकम (Loan Amount)', 'Requested Loan Amount')}
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-500">
                      {fmtCurrency(loanPrincipalInput)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={currentReceipt.maxEligiblePledgeLoanAmount}
                    step={1000}
                    value={loanPrincipalInput}
                    onChange={(e) => setLoanPrincipalInput(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <input
                    type="number"
                    min={1000}
                    max={currentReceipt.maxEligiblePledgeLoanAmount}
                    value={loanPrincipalInput}
                    onChange={(e) => setLoanPrincipalInput(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 font-mono font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>

                {/* Tenure Months */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('कर्जा अवधि (Tenure Months)', 'Loan Tenure')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 6, 9].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setLoanTenureMonths(m)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          loanTenureMonths === m
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'border-outline/20 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {m} {t('महिना', 'Months')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Savings Destination Account */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('रकम जम्मा हुने बचत खाता (Destination Savings Account)', 'Credit Savings Account')}
                  </label>
                  <select
                    value={savingsAccountNo}
                    onChange={(e) => setSavingsAccountNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 focus:border-amber-500"
                  >
                    {savings
                      .filter((s) => s.memberId === currentReceipt.memberId)
                      .map((s) => (
                        <option key={s.accountNo} value={s.accountNo}>
                          {s.accountNo} - {s.accountType} ({t('मौज्दात:', 'Bal:')} {fmtCurrency(s.balance)})
                        </option>
                      ))}
                    <option value="UKO-SB-DEFAULT">{t('सदस्यको मुख्य नियमित बचत खाता', 'Primary Regular Savings')}</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('कर्जा टिप्पणी / प्रयोजन', 'Loan Purpose / Notes')}
                  </label>
                  <input
                    type="text"
                    value={loanNotes}
                    onChange={(e) => setLoanNotes(e.target.value)}
                    placeholder={t('हिउँदे बाली बीउ, मल खरिद तथा घरायसी खर्च...', 'Winter crop seeds, fertilizer purchase, domestic needs...')}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('DIRECTORY')}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl border border-outline/20 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('फिर्ता', 'Back')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-2"
                >
                  <Coins className="size-4" />
                  {t('बचत खातामा ऋण निकासा गर्नुहोस्', 'Disburse Loan to Passbook')}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: HARVEST SALE LIQUIDATION */}
          {activeTab === 'LIQUIDATION' && currentReceipt && liquidationPreview && (
            <form onSubmit={handleLiquidationSubmit} className="space-y-6 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <TrendingUp className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {t('उच्च सिजन बजार बिक्री तथा किसान नाफा भुक्तानी', 'Peak Season Market Sale & Farmer Profit Settlement')}
                  </p>
                  <p>
                    {t(
                      'कटनीको केही महिनापछि बजार भाउ उच्च भएको बेला सहकारीले अन्न बिक्री गर्दछ। बिक्री रकमबाट धितो कर्जा र गोदाम शुल्क कट्टा गरी बाँकी सम्पूर्ण खुद नाफा किसानको बचत खातामा जम्मा गरिन्छ।',
                      'Crop is sold at off-season peak wholesale rates. Loan principal, interest, and storage charges are deducted, with all net surplus profit credited directly to the member passbook.'
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('वास्तविक बिक्री दर (रु. प्रति क्विन्टल)', 'Actual Sale Price (NPR/Quintal)')}
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={50}
                    value={actualSaleRate}
                    onChange={(e) => setActualSaleRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 font-mono font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('भण्डारण अवधि (महिना)', 'Elapsed Storage Months')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={elapsedMonths}
                    onChange={(e) => setElapsedMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20 font-mono font-bold"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('खरिदकर्ता / थोक व्यापारीको नाम', 'Buyer / Grain Merchant Name')}
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-outline/20"
                    required
                  />
                </div>
              </div>

              {/* Settlement Breakdown Ticket */}
              <div className="p-5 rounded-2xl bg-surface-elevated border border-outline/20 space-y-3 font-mono text-xs shadow-sm">
                <div className="flex items-center justify-between border-b border-outline/10 pb-2">
                  <span className="font-bold text-slate-900 dark:text-white uppercase font-sans">
                    {t('बिक्री मिलान हिसाब विवरण (Reconciliation Sheet)', 'Reconciliation Sheet')}
                  </span>
                  <span className="text-amber-500 font-bold">{currentReceipt.receiptNo}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">
                    {t('कुल बिक्री आम्दानी (+):', 'Gross Revenue (+):')} ({currentReceipt.netWeightQuintals} Qtl × {actualSaleRate})
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {fmtCurrency(liquidationPreview.grossSaleRevenue)}
                  </span>
                </div>

                <div className="flex justify-between py-1 text-rose-500">
                  <span>{t('कट्टा: कर्जा साँवा रकम (-):', 'Less: Loan Principal (-):')}</span>
                  <span>- {fmtCurrency(liquidationPreview.loanPrincipalDeducted)}</span>
                </div>

                <div className="flex justify-between py-1 text-rose-500">
                  <span>{t('कट्टा: सहुलियतपूर्ण ब्याज (-):', 'Less: Accrued Interest (-):')}</span>
                  <span>- {fmtCurrency(liquidationPreview.loanInterestDeducted)}</span>
                </div>

                <div className="flex justify-between py-1 text-rose-500">
                  <span>{t('कट्टा: गोदाम भण्डारण शुल्क (-):', 'Less: Storage Charge (-):')}</span>
                  <span>- {fmtCurrency(liquidationPreview.storageChargesDeducted)}</span>
                </div>

                <div className="border-t-2 border-dashed border-outline/20 pt-2 flex justify-between items-center text-sm font-black">
                  <span className="text-emerald-600 dark:text-emerald-400 font-sans">
                    {t('किसान बचतमा जम्मा हुने खुद नाफा (=):', 'Net Surplus to Member Passbook (=):')}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-base">
                    {fmtCurrency(liquidationPreview.netSurplusPayableToMember)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('DIRECTORY')}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl border border-outline/20 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('फिर्ता', 'Back')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  {t('बिक्री मिलान गरी नाफा जम्मा गर्नुहोस्', 'Execute Sale & Credit Passbook')}
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: PRINTABLE WHR CERTIFICATE */}
          {activeTab === 'CERTIFICATE' && currentReceipt && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex justify-end">
                <button
                  onClick={handlePrintCertificate}
                  className="px-5 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xs hover:opacity-90 flex items-center gap-2 transition-all"
                >
                  <Printer className="size-4" />
                  {t('प्रमाणपत्र प्रिन्ट गर्नुहोस् (Print A4)', 'Print Official Certificate')}
                </button>
              </div>

              {/* Printable Document Sheet */}
              <div
                id="whr-certificate-print"
                className="p-8 sm:p-10 rounded-3xl bg-white text-slate-950 border border-slate-300 shadow-xl space-y-6 print:border-none print:shadow-none"
              >
                {/* Certificate Header */}
                <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
                  <div className="text-xs font-black tracking-widest uppercase text-amber-700">
                    {coopSettings.nameNepali}
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    {coopSettings.name}
                  </h1>
                  <p className="text-[11px] text-slate-600">
                    {coopSettings.address} • {t('दर्ता नं:', 'Reg No:')} {coopSettings.regNo} • PAN: {coopSettings.panNo}
                  </p>
                  <div className="pt-2">
                    <span className="px-4 py-1 rounded-full bg-slate-950 text-white text-xs font-black tracking-widest uppercase">
                      ई-अन्न गोदाम रसिद प्रमाणपत्र (ELECTRONIC WAREHOUSE RECEIPT)
                    </span>
                  </div>
                </div>

                {/* Top Meta Strip */}
                <div className="grid grid-cols-2 text-xs font-mono border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">{t('रसिद नम्बर', 'RECEIPT NUMBER')}</span>
                    <span className="font-bold text-base text-amber-700">{currentReceipt.receiptNo}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px] uppercase">{t('भण्डारण मिति', 'STORAGE DATE')}</span>
                    <span className="font-bold">{currentReceipt.depositDate} B.S.</span>
                  </div>
                </div>

                {/* Member Identity & Warehouse Location */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{t('किसान सदस्य विवरण', 'DEPOSITOR DETAILS')}</span>
                    <p className="font-bold text-sm text-slate-900">{currentReceipt.memberName}</p>
                    <p className="font-mono text-slate-600">{t('सदस्य नं:', 'Member No:')} {currentReceipt.memberNo}</p>
                    <p className="font-mono text-slate-600">{t('सम्पर्क:', 'Contact:')} {currentReceipt.memberPhone}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{t('गोदाम तथा भण्डार स्थान', 'STORAGE FACILITY')}</span>
                    <p className="font-bold text-sm text-slate-900">{currentReceipt.storageLocation}</p>
                    <p className="text-slate-600">{t('सुरक्षण बिमा:', 'Lien Insurance:')} शिखर इन्स्योरेन्स (पब्लिक पोलिसी)</p>
                    <p className="text-slate-600">{t('म्याद समाप्त:', 'Valid Until:')} {currentReceipt.expiryDate}</p>
                  </div>
                </div>

                {/* Commodity Specification Grid */}
                <div className="rounded-xl border border-slate-300 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2.5">{t('बाली तथा जात', 'Commodity / Variety')}</th>
                        <th className="p-2.5 text-center">{t('बोरा संख्या', 'Bags')}</th>
                        <th className="p-2.5 text-right">{t('तौल (क्विन्टल)', 'Weight (Qtl)')}</th>
                        <th className="p-2.5 text-center">{t('नमी %', 'Moisture')}</th>
                        <th className="p-2.5 text-center">{t('स्तर', 'Grade')}</th>
                        <th className="p-2.5 text-right">{t('दर/क्विन्टल', 'Rate/Qtl')}</th>
                        <th className="p-2.5 text-right">{t('कुल मूल्याङ्कन', 'Valuation')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      <tr>
                        <td className="p-2.5 font-sans font-bold">{currentReceipt.varietyName}</td>
                        <td className="p-2.5 text-center">{currentReceipt.bagCount}</td>
                        <td className="p-2.5 text-right font-bold">{currentReceipt.netWeightQuintals}</td>
                        <td className="p-2.5 text-center">{currentReceipt.qualityInspection.moisturePercent}%</td>
                        <td className="p-2.5 text-center font-bold text-emerald-700">{currentReceipt.qualityInspection.grade}</td>
                        <td className="p-2.5 text-right">रु. {currentReceipt.effectiveRatePerQuintal.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">रु. {currentReceipt.totalMarketValuation.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Statutory Lien Declaration */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">
                    {t('वैधानिक धितो अधिकार तथा नियम (Statutory Lien Terms):', 'Statutory Lien Terms:')}
                  </p>
                  <p>
                    {t(
                      '१. यो रसिद सहकारी ऐन २०७४ अनुसार जारी गरिएको आधिकारिक कानुनी दस्तावेज हो। २. यस रसिदमा उल्लिखित अन्न सहकारीको नियन्त्रणमा सुरक्षित रहनेछ। ३. अधिकतम ७०% सम्म कृषि धितो कर्जा (रु. ' +
                        currentReceipt.maxEligiblePledgeLoanAmount.toLocaleString() +
                        ') प्रवाह गर्न सकिनेछ।',
                      '1. Issued under Nepal Cooperative Act 2074. 2. Stored grain remains in cooperative lien. 3. Eligible for pledge credit up to 70% LTV.'
                    )}
                  </p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 pt-10 text-center text-xs">
                  <div className="border-t border-slate-400 pt-2 mx-4">
                    <p className="font-bold text-slate-900">{currentReceipt.memberName}</p>
                    <p className="text-[10px] text-slate-500">{t('जम्माकर्ता किसान सदस्य', 'Depositor Member')}</p>
                  </div>
                  <div className="border-t border-slate-400 pt-2 mx-4">
                    <p className="font-bold text-slate-900">इन्स्पेकशन अधिकृत</p>
                    <p className="text-[10px] text-slate-500">{t('गुणस्तर निरिक्षक', 'Quality Inspector')}</p>
                  </div>
                  <div className="border-t border-slate-400 pt-2 mx-4">
                    <p className="font-bold text-slate-900">गोदाम प्रबन्धक</p>
                    <p className="text-[10px] text-slate-500">{t('सहकारी मुख्य प्रबन्धक', 'Warehouse Manager')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
