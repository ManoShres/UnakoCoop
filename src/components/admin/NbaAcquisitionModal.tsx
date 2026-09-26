import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Loan, Member } from '../../types';
import {
  NbaCollateralInfo,
  NbaRecord,
  computeNbaAcquisition,
  generateNbaJournalVoucher,
  generateLandRevenueTransferLetter,
  calculateNbaDisposalSettlement,
  exportNbaRegisterCsv,
} from '../../utils/nonBankingAssets';
import {
  X,
  Printer,
  Copy,
  Download,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface NbaAcquisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: readonly Loan[];
  members: readonly Member[];
  initialLoanId?: string;
  onNbaAcquiredSuccess?: (record: NbaRecord) => void;
}

export const NbaAcquisitionModal: React.FC<NbaAcquisitionModalProps> = ({
  isOpen,
  onClose,
  loans,
  members,
  initialLoanId,
  onNbaAcquiredSuccess,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtPercent } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'ASSESSMENT' | 'VOUCHER' | 'MALPOT_LETTER' | 'REGISTER'>('ASSESSMENT');
  const [selectedLoanId, setSelectedLoanId] = useState<string>(initialLoanId || loans[0]?.id || '');

  // Form Inputs
  const [assessedDistressValue, setAssessedDistressValue] = useState<number>(750000);
  const [legalCostsInput, setLegalCostsInput] = useState<number>(25000);
  const [accruedInterestInput, setAccruedInterestInput] = useState<number>(85000);
  const [bodMinuteNo, setBodMinuteNo] = useState<string>('BOD-2081-125');
  const [voucherDateBS, setVoucherDateBS] = useState<string>('2081/06/20');

  // Collateral Details
  const [kittaNo, setKittaNo] = useState<string>('४१२');
  const [sheetNo, setSheetNo] = useState<string>('१२-ख');
  const [district, setDistrict] = useState<string>('दाङ');
  const [municipality, setMunicipality] = useState<string>('गढवा गाउँपालिका');
  const [wardNo, setWardNo] = useState<string>('५');
  const [areaDesc, setAreaDesc] = useState<string>('०-१०-०-० बिघा');
  const [boundaryNorth, setBoundaryNorth] = useState<string>('राम बहादुरको जग्गा');
  const [boundarySouth, setBoundarySouth] = useState<string>('मूल सडक (बाटो)');
  const [boundaryEast, setBoundaryEast] = useState<string>('श्याम थारुको कित्ता');
  const [boundaryWest, setBoundaryWest] = useState<string>('सिंचाई कुलो');

  // Disposal Simulator State
  const [saleProceedsInput, setSaleProceedsInput] = useState<number>(850000);
  const [disposalCostsInput, setDisposalCostsInput] = useState<number>(30000);

  const [copiedLetter, setCopiedLetter] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  // NBA Records Store
  const [nbaRecords, setNbaRecords] = useState<NbaRecord[]>([
    {
      assetId: 'NBA-2081-01',
      loanNo: 'LN-2079-089',
      borrowerName: 'कमल प्रसाद चौधरी',
      borrowerMemberNo: 'UK-M-0245',
      kittaNo: '४१२',
      areaDesc: '०-१०-०-० बिघा',
      district: 'दाङ',
      municipality: 'गढवा गाउँपालिका-५',
      acquisitionDateBS: '2081/06/20',
      acquisitionAmount: 705000,
      statutoryProvisionAmount: 705000,
      status: 'ACQUIRED_IN_POSSESSION',
      holdingExpiryDateBS: '2084/06/20',
    },
  ]);

  // Selected Loan & Member
  const selectedLoan = useMemo(() => {
    return loans.find((l) => l.id === selectedLoanId) || loans[0];
  }, [loans, selectedLoanId]);

  const selectedMember = useMemo(() => {
    if (!selectedLoan) return undefined;
    return members.find((m) => m.id === selectedLoan.memberId);
  }, [members, selectedLoan]);

  // Collateral Object
  const collateralInfo: NbaCollateralInfo = useMemo(() => {
    return {
      kittaNo,
      sheetNo,
      district,
      municipality,
      wardNo,
      areaDesc,
      originalOwnerName: selectedMember?.name ?? 'जग्गाधनी',
      originalOwnerCitizenship: selectedMember?.citizenshipNo ?? '५२-०१-७०-०८२३१',
      boundaries: {
        north: boundaryNorth,
        south: boundarySouth,
        east: boundaryEast,
        west: boundaryWest,
      },
    };
  }, [
    kittaNo,
    sheetNo,
    district,
    municipality,
    wardNo,
    areaDesc,
    selectedMember,
    boundaryNorth,
    boundarySouth,
    boundaryEast,
    boundaryWest,
  ]);

  // Assessment Calculation
  const assessment = useMemo(() => {
    if (!selectedLoan || !selectedMember) return null;
    return computeNbaAcquisition(
      selectedLoan,
      selectedMember,
      assessedDistressValue,
      legalCostsInput,
      accruedInterestInput
    );
  }, [selectedLoan, selectedMember, assessedDistressValue, legalCostsInput, accruedInterestInput]);

  // Accounting Voucher
  const voucher = useMemo(() => {
    if (!assessment) return null;
    return generateNbaJournalVoucher(assessment, voucherDateBS);
  }, [assessment, voucherDateBS]);

  // Malpot Transfer Letter
  const transferLetter = useMemo(() => {
    if (!assessment) return null;
    return generateLandRevenueTransferLetter(assessment, collateralInfo, bodMinuteNo, voucherDateBS);
  }, [assessment, collateralInfo, bodMinuteNo, voucherDateBS]);

  // Disposal Settlement Calculation
  const disposalSettlement = useMemo(() => {
    const bookVal = assessment?.acquisitionAmount ?? 705000;
    return calculateNbaDisposalSettlement(bookVal, saleProceedsInput, disposalCostsInput);
  }, [assessment, saleProceedsInput, disposalCostsInput]);

  if (!isOpen || !selectedLoan) return null;

  const handleCopyLetter = () => {
    if (!transferLetter) return;
    navigator.clipboard.writeText(`${transferLetter.subject}\n\n${transferLetter.bodyNepaliText}`);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handleCopyVoucher = () => {
    if (!voucher) return;
    const txt = `${voucher.narration}\n\n` +
      voucher.entries
        .map((e) => `${e.acName}: Dr रु. ${e.debit.toLocaleString()} | Cr रु. ${e.credit.toLocaleString()}`)
        .join('\n');
    navigator.clipboard.writeText(txt);
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleApproveAcquisition = () => {
    if (!assessment || !selectedMember) return;
    const newRecord: NbaRecord = {
      assetId: `NBA-2081-${String(nbaRecords.length + 1).padStart(2, '0')}`,
      loanNo: selectedLoan.loanNo,
      borrowerName: selectedMember.name,
      borrowerMemberNo: selectedMember.memberNo,
      kittaNo,
      areaDesc,
      district,
      municipality: `${municipality}-${wardNo}`,
      acquisitionDateBS: voucherDateBS,
      acquisitionAmount: assessment.acquisitionAmount,
      statutoryProvisionAmount: assessment.statutory100PercentProvision,
      status: 'ACQUIRED_IN_POSSESSION',
      holdingExpiryDateBS: '2084/06/20',
    };

    setNbaRecords((prev) => [newRecord, ...prev]);
    if (onNbaAcquiredSuccess) {
      onNbaAcquiredSuccess(newRecord);
    }
    setActiveTab('REGISTER');
  };

  const handleDownloadCsv = () => {
    const csv = exportNbaRegisterCsv(nbaRecords);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `unako_nba_register_${Date.now()}.csv`);
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
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Building2 className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('गैर-बैंकिङ्ग सम्पत्ति (NBA) सकार तथा लिलाम व्यवस्थापन', 'Non-Banking Assets (NBA) Acquisition & Management')}
                </h2>
                <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                  सहकारी ऐन दफा ८४
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'लिलाम हुन नसकेको धितो संस्था आफैंले सकार गरी १००% नोक्सानी जगेडा कायम गर्ने र मालपोत नामसारी गर्ने इन्जिन',
                  'Cooperative Act 2074 Sec 84 compliant asset possession, 100% statutory provisioning, and Land Revenue transfer'
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

        {/* Loan Account Bar */}
        <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('भाखा नाघेको कर्जा छनोट:', 'Select Defaulted Loan:')}
            </label>
            <select
              value={selectedLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
              className="text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {loans.map((l) => {
                const mem = members.find((m) => m.id === l.memberId);
                return (
                  <option key={l.id} value={l.id}>
                    {l.loanNo} - {mem?.name ?? 'Member'} ({fmtCurrency(l.remainingBalance, true)}) [{l.status}]
                  </option>
                );
              })}
            </select>
          </div>

          {selectedMember && (
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>
                {t('ऋणी सदस्य:', 'Borrower:')} <strong className="text-slate-900 dark:text-white">{selectedMember.name}</strong> ({fmtDigits(selectedMember.memberNo)})
              </span>
              <span>
                {t('बाँकी साँवा:', 'Balance:')} <strong className="text-indigo-600 dark:text-indigo-400">{fmtCurrency(selectedLoan.remainingBalance, true)}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('ASSESSMENT')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'ASSESSMENT'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="size-4" />
            <span>{t('१. धितो सकार मूल्यांकन', '1. Distress Valuation & Claim')}</span>
          </button>

          <button
            onClick={() => setActiveTab('VOUCHER')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'VOUCHER'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="size-4" />
            <span>{t('२. १००% जगेडा लेखा भौचर', '2. 100% Provision Voucher')}</span>
          </button>

          <button
            onClick={() => setActiveTab('MALPOT_LETTER')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'MALPOT_LETTER'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="size-4" />
            <span>{t('३. मालपोत नामसारी सिफारिस', '3. Malpot Transfer Letter')}</span>
          </button>

          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'REGISTER'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="size-4" />
            <span>{t('४. NBA दर्ता किताब तथा लिलाम', '4. NBA Register & Liquidation')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto grow space-y-6">
          {/* TAB 1: VALUATION & CLAIM ASSESSMENT */}
          {activeTab === 'ASSESSMENT' && assessment && (
            <div className="space-y-6">
              {/* Statutory Citation Card */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
                <ShieldAlert className="size-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                  <p className="font-bold">
                    {t(
                      'नेपाल सहकारी ऐन २०७४ दफा ८४: धितो सकार गरी गैर-बैंकिङ्ग सम्पत्ति (NBA) कायम गर्ने अधिकार',
                      'Nepal Cooperative Act 2074 Section 84: Non-Banking Asset Possession'
                    )}
                  </p>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    {t(
                      'सार्वजनिक लिलाममा कसैको बोलपत्र नपरेमा संस्थाले न्यूनतम मूल्यमा धितो सकार गर्न पाउनेछ र सो सम्पत्तिमा १००% नोक्सानी जगेडा बाँध्नुपर्नेछ।',
                      'If public auction yields no bids, cooperative may acquire collateral as NBA with mandatory 100% loss provision.'
                    )}
                  </p>
                </div>
              </div>

              {/* Assessment Form & Cadastral Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Financial Claim Input Panel */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('कर्जा दाबी तथा लिलाम मूल्यांकन', 'Loan Claim & Distress Valuation')}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        {t('बाँकी साँवा दायित्व (Principal)', 'Principal Balance')}
                      </label>
                      <input
                        type="text"
                        disabled
                        value={fmtCurrency(selectedLoan.remainingBalance, true)}
                        className="w-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        {t('पाकेको ब्याज (Accrued Interest)', 'Accrued Interest')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={accruedInterestInput}
                        onChange={(e) => setAccruedInterestInput(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        {t('कानूनी तथा लिलाम खर्च (NPR)', 'Legal & Auction Costs')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={legalCostsInput}
                        onChange={(e) => setLegalCostsInput(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        {t('सकार/लिलाम मूल्यांकन (Distress Value)', 'Assessed Distress Value')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={assessedDistressValue}
                        onChange={(e) => setAssessedDistressValue(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-indigo-600 dark:text-indigo-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      {t('कुल कर्जा दाबी रकम (Total Claim):', 'Total Debt Claim:')}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {fmtCurrency(assessment.totalClaimPayable, true)}
                    </span>
                  </div>
                </div>

                {/* Cadastral Land Boundary Inputs */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('सकार गरिने धितो जग्गाको विवरण', 'Cadastral Land Property Details')}
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">
                        {t('कित्ता नं.', 'Kitta No')}
                      </label>
                      <input
                        type="text"
                        value={kittaNo}
                        onChange={(e) => setKittaNo(e.target.value)}
                        className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">
                        {t('नक्सा सिट नं.', 'Sheet No')}
                      </label>
                      <input
                        type="text"
                        value={sheetNo}
                        onChange={(e) => setSheetNo(e.target.value)}
                        className="w-full text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">
                        {t('क्षेत्रफल', 'Area Desc')}
                      </label>
                      <input
                        type="text"
                        value={areaDesc}
                        onChange={(e) => setAreaDesc(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">
                        {t('पूर्व चारकिल्ला', 'East Boundary')}
                      </label>
                      <input
                        type="text"
                        value={boundaryEast}
                        onChange={(e) => setBoundaryEast(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">
                        {t('पश्चिम चारकिल्ला', 'West Boundary')}
                      </label>
                      <input
                        type="text"
                        value={boundaryWest}
                        onChange={(e) => setBoundaryWest(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">
                        {t('उत्तर चारकिल्ला', 'North Boundary')}
                      </label>
                      <input
                        type="text"
                        value={boundaryNorth}
                        onChange={(e) => setBoundaryNorth(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">
                        {t('दक्षिण चारकिल्ला', 'South Boundary')}
                      </label>
                      <input
                        type="text"
                        value={boundarySouth}
                        onChange={(e) => setBoundarySouth(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live KPI Settlement Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    {t('सकार मूल्य (NBA Book Value)', 'Acquisition Book Value')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                    {fmtCurrency(assessment.acquisitionAmount, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('सम्पत्ति खातामा डेबिट', 'Debited to NBA asset')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    {t('१००% अनिवार्य नोक्सानी जगेडा', '100% Statutory Provision')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                    {fmtCurrency(assessment.statutory100PercentProvision, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('सहकारी मापदण्ड अनुसार १००%', '100% booked to P&L')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t('जगेडा धरौटी (Surplus Escrow)', 'Surplus Escrow')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {fmtCurrency(assessment.surplusEscrowSuspense, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('लिलाम बिक्री पश्चात फिर्ता', 'Held for borrower')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t('अपुग व्यक्तिगत दायित्व (Shortfall)', 'Unrecovered Shortfall')}
                  </p>
                  <p className="text-lg font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                    {fmtCurrency(assessment.shortfallRemainingDebt, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t('ऋणी तथा रोहबरबाट असुली बाँकी', 'Personal claim remaining')}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('VOUCHER')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer"
                >
                  <span>{t('लेखा भौचर हेर्नुहोस् (View Journal Voucher)', 'Proceed to Accounting Voucher')}</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: JOURNAL VOUCHER */}
          {activeTab === 'VOUCHER' && voucher && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('गैर-बैंकिङ्ग सम्पत्ति सकार लेखा भौचर (Journal Voucher)', 'NBA Acquisition Accounting Voucher')}
                  </h3>
                  <p className="text-xs font-mono text-slate-500">
                    {voucher.voucherNo} | मिति: {voucher.voucherDateBS}
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
                </div>
              </div>

              {/* Double Entry Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">{t('खाता संकेत (A/C Code)', 'A/C Code')}</th>
                      <th className="px-4 py-3">{t('हिसाब शीर्षक तथा विवरण (Description)', 'Account Name & Narration')}</th>
                      <th className="px-4 py-3 text-right">{t('डेबिट (Debit NPR)', 'Debit (NPR)')}</th>
                      <th className="px-4 py-3 text-right">{t('क्रेडिट (Credit NPR)', 'Credit (NPR)')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {voucher.entries.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400">
                          {entry.acCode}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-sans font-bold text-slate-900 dark:text-white">{entry.acName}</p>
                          <p className="font-sans text-[11px] text-slate-400">{entry.narration}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                          {entry.debit > 0 ? fmtCurrency(entry.debit, false) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                          {entry.credit > 0 ? fmtCurrency(entry.credit, false) : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 dark:bg-slate-900 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                      <td colSpan={2} className="px-4 py-3 text-right font-sans">
                        {t('कुल जम्मा (Total):', 'Grand Total:')}
                      </td>
                      <td className="px-4 py-3 text-right text-indigo-600 dark:text-indigo-400">
                        {fmtCurrency(voucher.totalDebit, false)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-900 dark:text-white">
                        {fmtCurrency(voucher.totalCredit, false)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white">कैफियत (Narration): </span>
                {voucher.narration}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('ASSESSMENT')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  ← {t('पछाडि जानुहोस्', 'Back')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('MALPOT_LETTER')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer"
                >
                  <span>{t('मालपोत नामसारी सिफारिस पत्र हेर्नुहोस्', 'Proceed to Malpot Letter')}</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LAND REVENUE OFFICE LETTER */}
          {activeTab === 'MALPOT_LETTER' && transferLetter && (
            <div className="space-y-6">
              {/* BOD Resolution Settings */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center gap-4">
                <div className="grow">
                  <label className="text-xs text-slate-500 block mb-1">
                    {t('सञ्चालक समिति निर्णय नं. (BOD Minute No)', 'BOD Decision Minute No')}
                  </label>
                  <input
                    type="text"
                    value={bodMinuteNo}
                    onChange={(e) => setBodMinuteNo(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">
                    {t('पत्र जारी मिति (BS)', 'Issue Date (BS)')}
                  </label>
                  <input
                    type="text"
                    value={voucherDateBS}
                    onChange={(e) => setVoucherDateBS(e.target.value)}
                    className="w-36 text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Letter Preview Sheet */}
              <div className="p-6 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-md space-y-6">
                {/* Official Letterhead */}
                <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    उनको बचत तथा ऋण सहकारी संस्था लि.
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    गढवा गाउँपालिका वडा नं. ५, दाङ | दर्ता नं. १२३/०६८/०६९
                  </p>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-500 pt-3">
                    <span>पत्र संख्या: {transferLetter.referenceNo}</span>
                    <span>मिति: {fmtDigits(transferLetter.issueDateBS)}</span>
                  </div>
                </div>

                {/* Recipient */}
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 space-y-0.5">
                  <p className="font-bold">{transferLetter.officeName}</p>
                  <p>{transferLetter.officeAddress}</p>
                </div>

                {/* Subject */}
                <div className="text-xs font-bold text-slate-900 dark:text-white py-1 border-y border-slate-200 dark:border-slate-800">
                  {transferLetter.subject}
                </div>

                {/* Letter Body */}
                <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-serif">
                  {transferLetter.bodyNepaliText}
                </div>

                {/* Signature Block */}
                <div className="pt-8 flex justify-end">
                  <div className="text-center text-xs space-y-10 w-48">
                    <div className="border-b border-dotted border-slate-400 h-8"></div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">कार्यकारी प्रमुख / व्यवस्थापक</p>
                      <p className="text-[10px] text-slate-500">उनको बचत तथा ऋण सहकारी संस्था लि.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLetter}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <Copy className="size-3.5" />
                    <span>{copiedLetter ? t('कपी गरियो!', 'Copied!') : t('सिफारिस कपी', 'Copy')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <Printer className="size-3.5" />
                    <span>{t('सिफारिस पत्र प्रिन्ट', 'Print Letter')}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleApproveAcquisition}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="size-4" />
                  <span>{t('धितो सकार स्वीकृत गरी दर्ता गर्नुहोस्', 'Approve Possession & Register NBA')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: NBA REGISTER & LIQUIDATION DISPOSAL */}
          {activeTab === 'REGISTER' && (
            <div className="space-y-6">
              {/* Header and CSV Download */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('गैर-बैंकिङ्ग सम्पत्ति (NBA) दर्ता किताब', 'Non-Banking Assets Statutory Register')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t(
                      'सहकारी ऐन तथा कोपोमिस (COPOMIS) बमोजिम सकार गरिएका सम्पत्तिहरूको दर्ता तथा लिलाम व्यवस्थापन',
                      'Statutory register of acquired non-banking assets and tender disposal under Cooperative Act 2074'
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer"
                >
                  <Download className="size-4" />
                  <span>{t('CSV डाउनलोड (Export CSV)', 'Export CSV')}</span>
                </button>
              </div>

              {/* NBA Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2.5">Asset ID</th>
                        <th className="px-3 py-2.5">{t('कर्जा नं.', 'Loan No')}</th>
                        <th className="px-3 py-2.5">{t('साविक ऋणी', 'Borrower')}</th>
                        <th className="px-3 py-2.5">{t('कित्ता र क्षेत्रफल', 'Kitta & Area')}</th>
                        <th className="px-3 py-2.5">{t('ठेगाना', 'Location')}</th>
                        <th className="px-3 py-2.5 text-right">{t('सकार मूल्य', 'Acquired Value')}</th>
                        <th className="px-3 py-2.5 text-right">{t('१००% जगेडा', '100% Provision')}</th>
                        <th className="px-3 py-2.5 text-center">{t('स्थिति', 'Status')}</th>
                        <th className="px-3 py-2.5 text-center">{t('अधिकतम होल्डिङ', 'Max Holding')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {nbaRecords.map((rec) => (
                        <tr key={rec.assetId} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="px-3 py-2.5 font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            {rec.assetId}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[11px]">{rec.loanNo}</td>
                          <td className="px-3 py-2.5">
                            <span className="font-bold text-slate-900 dark:text-white">{rec.borrowerName}</span>
                            <p className="text-[10px] text-slate-400 font-mono">{rec.borrowerMemberNo}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="font-mono font-bold">कित्ता {rec.kittaNo}</span>
                            <p className="text-[10px] text-slate-500">{rec.areaDesc}</p>
                          </td>
                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                            {rec.municipality}, {rec.district}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {fmtCurrency(rec.acquisitionAmount, true)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                            {fmtCurrency(rec.statutoryProvisionAmount, true)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                              {rec.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono text-[11px] text-slate-500">
                            {fmtDigits(rec.holdingExpiryDateBS)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Disposal & Tender Liquidation Calculator Panel */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald-500" />
                  <span>{t('सम्पत्ति लिलाम बिक्री तथा जगेडा फिर्ता सिमुलेटर (Tender Disposal Simulator)', 'Tender Disposal & Provision Reversal Simulator')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">
                      {t('बोलपत्र लिलाम बिक्री रकम (Gross Sale)', 'Gross Tender Proceeds (NPR)')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={saleProceedsInput}
                      onChange={(e) => setSaleProceedsInput(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block mb-1">
                      {t('बिक्री तथा लिलाम खर्च (Disposal Costs)', 'Disposal & Auction Costs')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={disposalCostsInput}
                      onChange={(e) => setDisposalCostsInput(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block mb-1">
                      {t('खुद बिक्री प्रतिफल (Net Proceeds)', 'Net Cash Proceeds')}
                    </label>
                    <input
                      type="text"
                      disabled
                      value={fmtCurrency(disposalSettlement.netProceeds, true)}
                      className="w-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-800 dark:text-emerald-200">
                      {disposalSettlement.isGain
                        ? t('बिक्रीमा पूँजीगत मुनाफा (Capital Gain):', 'Gain on Disposal:')
                        : t('बिक्रीमा नोक्सानी (Capital Loss):', 'Loss on Disposal:')}
                    </span>
                    <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-300 ml-2">
                      {fmtCurrency(Math.abs(disposalSettlement.gainLossOnDisposal), true)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {t('फिर्ता हुने १००% नोक्सानी जगेडा:', '100% Provision Written Back:')}
                    </span>
                    <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 ml-2">
                      {fmtCurrency(disposalSettlement.provisionReversalAmount, true)}
                    </span>
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
