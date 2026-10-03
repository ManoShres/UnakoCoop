import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Printer,
  Search,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Sparkles,
  Coins,
  Calculator,
  Receipt,
  ShieldCheck,
  QrCode,
  X,
  CreditCard,
  Banknote,
  PiggyBank,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import {
  calculateDenominationTotal,
  reconcileCashHandover,
  generateFieldReceiptNumber,
  formatFieldThermalEscPosReceipt,
  DANG_GADHWA_WARDS,
  EMPTY_DENOMINATION,
} from '../../utils/fieldCollectorEngine';
import type {
  CashDenominationCount,
  FieldCollectionRecord,
  FieldCollectionBreakdown,
  Member,
} from '../../types';
import { printElement } from '../../utils/printHelper';
import { NepalDynamicQrModal } from '../../components/common/NepalDynamicQrModal';

type CollectorTab = 'COLLECT' | 'LIST' | 'DENOMINATION';

export function FieldCollectorPage() {
  const navigate = useNavigate();
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const { members, savings, loans, employees, coopSettings, addTransaction } = useCoopStore();

  const {
    isOnline,
    isFieldMode,
    isEffectivelyOffline,
    pendingCount: offlinePendingCount,
    toggleFieldMode,
    addOfflineEntry,
    syncQueue,
  } = useOfflineSync();

  // Active Tab
  const [activeTab, setActiveTab] = useState<CollectorTab>('COLLECT');

  // Selected Field Officer (defaults to Sita Sharma)
  const [selectedCollectorNo, setSelectedCollectorNo] = useState<string>('EMP-01');
  const activeCollector = employees.find((e) => e.employeeNo === selectedCollectorNo) || {
    employeeNo: 'EMP-01',
    name: 'सीता शर्मा (Sita Sharma)',
  };

  // Selected Ward in Gadhwa
  const [selectedWardNumber, setSelectedWardNumber] = useState<number>(1);
  const activeWard = DANG_GADHWA_WARDS.find((w) => w.wardNumber === selectedWardNumber) || DANG_GADHWA_WARDS[0];

  // Member Search & Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Collection Amounts
  const [breakdown, setBreakdown] = useState<FieldCollectionBreakdown>({
    mandatorySavings: 500,
    optionalSavings: 0,
    loanPrincipal: 0,
    loanInterest: 0,
    whrStorageFee: 0,
    shareAmount: 0,
  });

  const [paymentMode, setPaymentMode] = useState<'CASH' | 'NEPAL_PAY_QR'>('CASH');
  const [remarks, setRemarks] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Dynamic QR Modal State
  const [showQrModal, setShowQrModal] = useState(false);

  // Thermal Slip Modal State
  const [printedRecord, setPrintedRecord] = useState<FieldCollectionRecord | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // In-session Collection History
  const [todayCollections, setTodayCollections] = useState<FieldCollectionRecord[]>([
    {
      id: 'FLD-20810625-0001',
      receiptNo: 'FLD-20810625-0001',
      memberId: 'mem-1',
      memberNo: 'M-00101',
      memberName: 'रामबहादुर चौधरी',
      ward: 'वार्ड नं. १ (गढवा बजार)',
      phone: '9847890123',
      collectorNo: 'EMP-01',
      collectorName: 'सीता शर्मा',
      dateBS: '2081-06-25',
      timestamp: '10:15 AM',
      breakdown: {
        mandatorySavings: 1000,
        optionalSavings: 500,
        loanPrincipal: 2000,
        loanInterest: 320,
        whrStorageFee: 100,
        shareAmount: 0,
      },
      totalAmount: 3920,
      paymentMode: 'CASH',
      synced: true,
      syncedAt: '2026-10-03T10:16:00Z',
    },
    {
      id: 'FLD-20810625-0002',
      receiptNo: 'FLD-20810625-0002',
      memberId: 'mem-2',
      memberNo: 'M-00088',
      memberName: 'सीता देवी यादव',
      ward: 'वार्ड नं. १ (गढवा बजार)',
      phone: '9857812345',
      collectorNo: 'EMP-01',
      collectorName: 'सीता शर्मा',
      dateBS: '2081-06-25',
      timestamp: '10:45 AM',
      breakdown: {
        mandatorySavings: 1000,
        optionalSavings: 0,
        loanPrincipal: 0,
        loanInterest: 0,
        whrStorageFee: 0,
        shareAmount: 500,
      },
      totalAmount: 1500,
      paymentMode: 'CASH',
      synced: true,
      syncedAt: '2026-10-03T10:46:00Z',
    },
  ]);

  // Denominations for Handover
  const [denominations, setDenominations] = useState<CashDenominationCount>({
    n1000: 4,
    n500: 2,
    n100: 4,
    n50: 0,
    n20: 1,
    n10: 0,
    n5: 0,
    n2_1: 0,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Filtered members for rapid search
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return members.slice(0, 6);
    }
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.memberNo.toLowerCase().includes(q) ||
        m.phone?.includes(q)
    );
  }, [members, searchQuery]);

  // Selected member's accounts
  const memberAccounts = useMemo(() => {
    if (!selectedMember) return { savings: [], loans: [] };
    const memberSavings = savings.filter((s) => s.memberId === selectedMember.id);
    const memberLoans = loans.filter((l) => l.memberId === selectedMember.id && l.status === 'ACTIVE');
    return { savings: memberSavings, loans: memberLoans };
  }, [selectedMember, savings, loans]);

  // Total amount of current collection
  const currentTotalAmount = useMemo(() => {
    return (
      (breakdown.mandatorySavings || 0) +
      (breakdown.optionalSavings || 0) +
      (breakdown.loanPrincipal || 0) +
      (breakdown.loanInterest || 0) +
      (breakdown.whrStorageFee || 0) +
      (breakdown.shareAmount || 0)
    );
  }, [breakdown]);

  // Quick preset add handler
  const handleAddPreset = (category: keyof FieldCollectionBreakdown, amt: number) => {
    setBreakdown((prev) => ({
      ...prev,
      [category]: (prev[category] || 0) + amt,
    }));
  };

  // Submit Collection
  const handleCollect = () => {
    if (!selectedMember) {
      showToast(t('कृपया पहिले सदस्य छनोट गर्नुहोस्।', 'Please select a member first.'));
      return;
    }
    if (currentTotalAmount <= 0) {
      showToast(t('कृपया संकलन रकम प्रविष्टि गर्नुहोस्।', 'Please enter a valid collection amount.'));
      return;
    }

    const receiptNo = generateFieldReceiptNumber('2081-06-25', todayCollections.length + 1);
    const newRecord: FieldCollectionRecord = {
      id: receiptNo,
      receiptNo,
      memberId: selectedMember.id,
      memberNo: selectedMember.memberNo,
      memberName: selectedMember.name,
      ward: `वार्ड नं. ${activeWard.wardNumber} (${activeWard.nameNepali})`,
      phone: selectedMember.phone || 'N/A',
      collectorNo: activeCollector.employeeNo,
      collectorName: activeCollector.name,
      dateBS: '2081-06-25',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      breakdown: { ...breakdown },
      totalAmount: currentTotalAmount,
      paymentMode,
      remarks,
      synced: isOnline && !isFieldMode,
      syncedAt: isOnline && !isFieldMode ? new Date().toISOString() : undefined,
    };

    // Save in session collections
    setTodayCollections((prev) => [newRecord, ...prev]);

    // Also enqueue in offline queue
    addOfflineEntry({
      motherGroupId: 'mg-field',
      groupMemberId: selectedMember.id,
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      meetingDate: '2081-06-25',
      collectorNo: activeCollector.employeeNo,
      collectorName: activeCollector.name,
      totalAmount: currentTotalAmount,
      breakdown: {
        mandatorySavings: breakdown.mandatorySavings,
        optionalSavings: breakdown.optionalSavings,
        loanPrincipal: breakdown.loanPrincipal,
        loanInterest: breakdown.loanInterest,
        fine: breakdown.whrStorageFee,
      },
      attendance: 'PRESENT',
      slipNo: receiptNo,
      notes: remarks || `Field Ward ${activeWard.wardNumber}`,
    });

    // If online, record passbook transaction in store
    if (isOnline && !isFieldMode) {
      addTransaction({
        memberId: selectedMember.id,
        type: 'DEPOSIT',
        amount: currentTotalAmount,
        description: `फिल्ड संकलन (Field Collection: ${receiptNo} by ${activeCollector.name})`,
        referenceNo: receiptNo,
      });
    }

    // Launch Confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    // Open Thermal Receipt Modal
    setPrintedRecord(newRecord);
    setShowReceiptModal(true);

    // Reset Form for next collection
    setBreakdown({
      mandatorySavings: 500,
      optionalSavings: 0,
      loanPrincipal: 0,
      loanInterest: 0,
      whrStorageFee: 0,
      shareAmount: 0,
    });
    setRemarks('');
    setSelectedMember(null);
    setSearchQuery('');

    showToast(t(`रसिद नं ${receiptNo} सफलतापूर्वक संकलन भयो!`, `Receipt ${receiptNo} recorded!`));
  };

  // Sync Handlers
  const handleSyncAll = () => {
    syncQueue((entry) => {
      addTransaction({
        memberId: entry.memberId || 'mem-1',
        type: 'DEPOSIT',
        amount: entry.totalAmount,
        description: `फिल्ड अफलाइन संकलन सीबीएस प्रविष्टि (${entry.slipNo || entry.id})`,
        referenceNo: entry.slipNo || entry.id,
      });
      return { success: true, depositId: `cbs-${Date.now()}` };
    });

    // Mark all local collections as synced
    setTodayCollections((prev) =>
      prev.map((c) => ({ ...c, synced: true, syncedAt: new Date().toISOString() }))
    );

    showToast(t('सबै फिल्ड संकलन केन्द्रीय सीबीएसमा मिलान भयो!', 'All offline records synced with CBS!'));
  };

  // Print Handover Voucher
  const handlePrintHandover = () => {
    printElement('field-handover-printable', {
      format: 'a4',
      title: `Field-Handover-${activeCollector.employeeNo}-2081-06-25`,
    });
  };

  // Print Thermal Slip
  const handlePrintThermal = (format: 'thermal-58mm' | 'thermal-80mm') => {
    printElement('field-thermal-receipt', {
      format,
      title: `Field-Receipt-${printedRecord?.receiptNo}`,
    });
  };

  // Summary Metrics
  const todayTotalCash = useMemo(() => {
    return todayCollections.reduce((sum, item) => sum + item.totalAmount, 0);
  }, [todayCollections]);

  const handoverReport = useMemo(() => {
    return reconcileCashHandover(
      todayTotalCash,
      denominations,
      activeCollector.employeeNo,
      activeCollector.name,
      '2081-06-25',
      todayCollections.length
    );
  }, [todayTotalCash, denominations, activeCollector, todayCollections.length]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Mobile Handheld Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/admin')}
              type="button"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              title={t('प्रशासक कन्सोल फर्कनुहोस्', 'Return to Admin')}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  उनाको फिल्ड मोबाइल
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                  v2.4
                </span>
              </div>
              <h1 className="text-sm font-bold text-white flex items-center gap-1.5 leading-tight">
                <span>{activeCollector.name}</span>
                <span className="text-xs text-slate-400">({activeCollector.employeeNo})</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online / Offline status badge */}
            <button
              onClick={toggleFieldMode}
              type="button"
              title={t('अफलाइन फिल्ड मोड टगल', 'Toggle Field Offline Mode')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                isEffectivelyOffline
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              }`}
            >
              {isEffectivelyOffline ? (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>{t('अफलाइन', 'Offline')}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>{t('अनलाइन', 'Online')}</span>
                </>
              )}
            </button>

            {offlinePendingCount > 0 && (
              <button
                onClick={handleSyncAll}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-white text-[11px] font-bold shadow-xs cursor-pointer hover:bg-primary/90"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>{offlinePendingCount}</span>
              </button>
            )}
          </div>
        </div>

        {/* Ward Selector Bar */}
        <div className="max-w-2xl mx-auto mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{t('संकलन क्षेत्र (Ward):', 'Ward:')}</span>
            <select
              value={selectedWardNumber}
              onChange={(e) => setSelectedWardNumber(Number(e.target.value))}
              className="bg-slate-800 text-white font-bold rounded-md px-2 py-0.5 border border-slate-700 text-xs focus:outline-hidden"
            >
              {DANG_GADHWA_WARDS.map((w) => (
                <option key={w.wardNumber} value={w.wardNumber}>
                  वार्ड नं. {w.wardNumber} ({w.nameNepali})
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {t('आजको संकलन:', "Today's Total:")}{' '}
            <strong className="text-emerald-400 font-bold">रु. {todayTotalCash.toLocaleString()}</strong>
          </div>
        </div>
      </header>

      {/* Main Handheld Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-4">
        {/* Calm Segmented Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('COLLECT')}
            type="button"
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'COLLECT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>{t('नयाँ संकलन', 'Collect')}</span>
          </button>

          <button
            onClick={() => setActiveTab('LIST')}
            type="button"
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === 'LIST'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{t('दैनिक सूची', 'Receipts')}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {todayCollections.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('DENOMINATION')}
            type="button"
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'DENOMINATION'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{t('नगद मिलान', 'Handover')}</span>
          </button>
        </div>

        {/* TAB 1: QUICK COLLECTION */}
        {activeTab === 'COLLECT' && (
          <div className="space-y-4 animate-fade-in">
            {/* Step 1: Rapid Member Search */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {t('१. सदस्य छनोट गर्नुहोस् (Search Member)', '1. Select Member')}
              </label>

              {!selectedMember ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t('नाम, सदस्य नं (M-...), वा फोन नम्बर टाइप गर्नुहोस्...', 'Search by Name, Member No, Phone...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/80 rounded-xl bg-slate-950 border border-slate-800/80">
                    {filteredMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMember(m)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/60 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                            {m.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">{m.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {m.memberNo} • {m.phone || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                          छनोट (Select)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {selectedMember.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                        <span>{selectedMember.name}</span>
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-xs text-slate-300">
                        {selectedMember.memberNo} • {selectedMember.phone}
                      </div>
                      {memberAccounts.savings.length > 0 && (
                        <div className="text-[11px] text-emerald-300 mt-0.5 font-medium">
                          बचत मौज्दात: रु. {memberAccounts.savings[0]?.balance.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedMember(null)}
                    type="button"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title={t('सदस्य परिवर्तन', 'Change Member')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Collection Breakdown Form */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {t('२. रकम प्रविष्टि (Collection Breakdown)', '2. Collection Breakdown')}
                </label>
                <span className="text-[11px] text-slate-400">
                  {t('फास्ट चिप्स प्रयोग गर्नुहोस्', 'Use quick chips')}
                </span>
              </div>

              {/* Mandatory Savings */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">
                    {t('अनिवार्य नियमित मासिक बचत', 'Mandatory Monthly Savings')}
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-400">रु.</span>
                    <input
                      type="number"
                      value={breakdown.mandatorySavings || ''}
                      onChange={(e) =>
                        setBreakdown((b) => ({ ...b, mandatorySavings: Number(e.target.value) || 0 }))
                      }
                      className="w-24 px-2 py-1 rounded bg-slate-800 text-right font-bold text-emerald-400 text-xs border border-slate-700 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[200, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAddPreset('mandatorySavings', amt)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 cursor-pointer"
                    >
                      +{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setBreakdown((b) => ({ ...b, mandatorySavings: 0 }))}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-rose-400 text-[10px] font-medium cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Optional / Daily Savings */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">
                    {t('ऐच्छिक / दैनिक पिग्मी बचत', 'Optional / Daily Savings')}
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-400">रु.</span>
                    <input
                      type="number"
                      value={breakdown.optionalSavings || ''}
                      onChange={(e) =>
                        setBreakdown((b) => ({ ...b, optionalSavings: Number(e.target.value) || 0 }))
                      }
                      className="w-24 px-2 py-1 rounded bg-slate-800 text-right font-bold text-emerald-400 text-xs border border-slate-700 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[100, 250, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAddPreset('optionalSavings', amt)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 cursor-pointer"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loan EMI & Interest */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">
                    {t('ऋण किस्ता (साँवा + ब्याज)', 'Loan Principal & Interest')}
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">साँवा:</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={breakdown.loanPrincipal || ''}
                        onChange={(e) =>
                          setBreakdown((b) => ({ ...b, loanPrincipal: Number(e.target.value) || 0 }))
                        }
                        className="w-20 px-2 py-1 rounded bg-slate-800 text-right font-bold text-purple-400 text-xs border border-slate-700 focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">ब्याज:</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={breakdown.loanInterest || ''}
                        onChange={(e) =>
                          setBreakdown((b) => ({ ...b, loanInterest: Number(e.target.value) || 0 }))
                        }
                        className="w-16 px-2 py-1 rounded bg-slate-800 text-right font-bold text-purple-400 text-xs border border-slate-700 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Warehouse Storage Fee / Share installment */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="block text-[11px] text-slate-400">
                    {t('गोदाम रसिद शुल्क (WHR Fee)', 'WHR Storage Fee')}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-slate-500">रु.</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={breakdown.whrStorageFee || ''}
                      onChange={(e) =>
                        setBreakdown((b) => ({ ...b, whrStorageFee: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-2 py-1 rounded bg-slate-800 text-right font-bold text-amber-400 text-xs border border-slate-700 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="block text-[11px] text-slate-400">
                    {t('सेयर किस्ता (Share)', 'Share Installment')}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-slate-500">रु.</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={breakdown.shareAmount || ''}
                      onChange={(e) =>
                        setBreakdown((b) => ({ ...b, shareAmount: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-2 py-1 rounded bg-slate-800 text-right font-bold text-blue-400 text-xs border border-slate-700 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  {t('भुक्तानी माध्यम:', 'Payment Mode:')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('CASH')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      paymentMode === 'CASH'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    नगद (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMode('NEPAL_PAY_QR');
                      if (currentTotalAmount > 0) setShowQrModal(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      paymentMode === 'NEPAL_PAY_QR'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>नेपालपे QR</span>
                  </button>
                </div>
              </div>

              {/* Total & Submit Button */}
              <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300">
                    {t('कुल संकलन रकम (Total):', 'Total Collection Amount:')}
                  </span>
                  <span className="text-2xl font-black text-amber-300 tabular-nums">
                    रु. {currentTotalAmount.toLocaleString('ne-NP')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCollect}
                  disabled={!selectedMember || currentTotalAmount <= 0}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-950/60 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Printer className="w-4 h-4" />
                  <span>
                    {t('नगद संकलन गर्नुहोस् र रसिद छाप्नुहोस्', 'Collect Cash & Print Slip')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TODAY'S COLLECTION LIST & SYNC */}
        {activeTab === 'LIST' && (
          <div className="space-y-4 animate-fade-in">
            {/* Summary card strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">आजको कुल रकम</span>
                <div className="text-lg font-extrabold text-amber-300 tabular-nums">
                  रु. {todayTotalCash.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">कुल रसिद संख्या</span>
                <div className="text-lg font-extrabold text-white tabular-nums">
                  {todayCollections.length} वटा
                </div>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">सीबीएस मिलान</span>
                <div className="text-lg font-extrabold text-emerald-400 tabular-nums">
                  {todayCollections.filter((c) => c.synced).length}
                </div>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">अफलाइन बाँकी</span>
                <div className="text-lg font-extrabold text-rose-400 tabular-nums">
                  {todayCollections.filter((c) => !c.synced).length}
                </div>
              </div>
            </div>

            {/* Sync All Action */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white">
                  केन्द्रीय सीबीएस सर्भर मिलान
                </span>
                <p className="text-[11px] text-slate-400">
                  {todayCollections.filter((c) => !c.synced).length} वटा नयाँ रसिद केन्द्रीय खातामा पठाउन बाँकी
                </p>
              </div>
              <button
                type="button"
                onClick={handleSyncAll}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>सबै सिंक गर्नुहोस्</span>
              </button>
            </div>

            {/* Receipts List */}
            <div className="space-y-2">
              {todayCollections.map((col) => (
                <div
                  key={col.id}
                  className="bg-slate-900 rounded-xl p-3.5 border border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-white">{col.memberName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{col.memberNo}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          col.synced
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {col.synced ? 'Synced' : 'Offline'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {col.receiptNo} • {col.timestamp} • {col.ward}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-emerald-400 tabular-nums">
                      रु. {col.totalAmount.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPrintedRecord(col);
                        setShowReceiptModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title={t('रसिद पुनः छाप्नुहोस्', 'Re-print receipt')}
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DENOMINATION COUNTER & CASH HANDOVER */}
        {activeTab === 'DENOMINATION' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {t('दैनिक नगद थैली मिलान (Bag Cash Denomination)', 'Cash Denomination Tally')}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {t('शाखा काउन्टरमा नगद बुझाउन अघि नोट गन्ती गर्नुहोस्', 'Tally physical notes before counter handover')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handlePrintHandover}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('भौचर प्रिन्ट', 'Print Voucher')}</span>
                </button>
              </div>

              {/* Denomination Rows */}
              <div className="space-y-2">
                {[
                  { key: 'n1000', label: 'रु. १०००', mult: 1000 },
                  { key: 'n500', label: 'रु. ५००', mult: 500 },
                  { key: 'n100', label: 'रु. १००', mult: 100 },
                  { key: 'n50', label: 'रु. ५०', mult: 50 },
                  { key: 'n20', label: 'रु. २०', mult: 20 },
                  { key: 'n10', label: 'रु. १०', mult: 10 },
                  { key: 'n5', label: 'रु. ५', mult: 5 },
                  { key: 'n2_1', label: 'रु. २ / १', mult: 2 },
                ].map(({ key, label, mult }) => {
                  const val = denominations[key as keyof CashDenominationCount] || 0;
                  return (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="font-extrabold text-slate-300 w-20">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">थान (pcs):</span>
                        <input
                          type="number"
                          value={val || ''}
                          onChange={(e) =>
                            setDenominations((d) => ({
                              ...d,
                              [key]: Number(e.target.value) || 0,
                            }))
                          }
                          className="w-20 px-2 py-1 rounded bg-slate-800 text-right font-bold text-white border border-slate-700 text-xs focus:outline-hidden"
                        />
                      </div>
                      <span className="w-24 text-right font-bold text-emerald-400 tabular-nums">
                        रु. {(val * mult).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Summary Balance Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t('थैलीमा गन्ती भएको नगद:', 'Physical Cash in Bag:')}</span>
                  <span className="font-bold text-white tabular-nums">
                    रु. {handoverReport.cashInBagAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t('प्रणाली अनुसार संकलन (रसिदहरू):', 'System Receipts Total:')}</span>
                  <span className="font-bold text-white tabular-nums">
                    रु. {handoverReport.systemTotalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-300">{t('फरक (Discrepancy):', 'Difference:')}</span>
                  <span
                    className={`font-black tabular-nums ${
                      handoverReport.status === 'BALANCED'
                        ? 'text-emerald-400'
                        : handoverReport.status === 'SHORTAGE'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {handoverReport.discrepancy === 0
                      ? 'रु. ० (बराबर)'
                      : `रु. ${handoverReport.discrepancy.toLocaleString()}`}
                  </span>
                </div>
                <div className="mt-1 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      handoverReport.status === 'BALANCED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        : 'bg-rose-950 text-rose-300 border border-rose-600'
                    }`}
                  >
                    {handoverReport.status === 'BALANCED'
                      ? '✓ हरहिसाब दुरुस्त (Balanced & Ready for Handover)'
                      : handoverReport.status === 'SHORTAGE'
                      ? '⚠️ नगद अपुग (Shortage Detected)'
                      : '⚠️ नगद बढी (Surplus Detected)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bluetooth ESC/POS 58mm / 80mm Thermal Receipt Modal */}
      {showReceiptModal && printedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">फिल्ड संकलन रसिद</h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                type="button"
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Monochrome Thermal Paper Slip */}
            <div
              id="field-thermal-receipt"
              data-printable="true"
              className="bg-white text-black p-4 rounded-lg font-mono text-[11px] leading-tight space-y-1.5 shadow-inner border border-gray-300"
            >
              <div className="text-center font-bold">
                <div className="text-xs uppercase">{coopSettings.nameNepali}</div>
                <div className="text-[10px] text-gray-700">{coopSettings.address}</div>
                <div className="text-[9px] text-gray-600">पान: {coopSettings.panNo} | दर्ता: {coopSettings.regNo}</div>
              </div>
              <div className="border-t border-dashed border-gray-400 my-1.5" />
              <div className="text-[10px] font-bold text-center">*** फिल्ड संकलन रसिद ***</div>
              <div>रसिद नं: {printedRecord.receiptNo}</div>
              <div>मिति: {printedRecord.dateBS} ({printedRecord.timestamp})</div>
              <div>स्थान: {printedRecord.ward}</div>
              <div>संकलक: {printedRecord.collectorName} ({printedRecord.collectorNo})</div>
              <div className="border-t border-dashed border-gray-400 my-1" />
              <div>सदस्य नं: {printedRecord.memberNo}</div>
              <div className="font-bold">सदस्य नाम: {printedRecord.memberName}</div>
              <div>सम्पर्क: {printedRecord.phone}</div>
              <div className="border-t border-dashed border-gray-400 my-1" />
              <div className="space-y-0.5">
                <div className="flex justify-between">
                  <span>अनिवार्य बचत:</span>
                  <span>रु. {printedRecord.breakdown.mandatorySavings.toLocaleString()}</span>
                </div>
                {printedRecord.breakdown.optionalSavings > 0 && (
                  <div className="flex justify-between">
                    <span>ऐच्छिक बचत:</span>
                    <span>रु. {printedRecord.breakdown.optionalSavings.toLocaleString()}</span>
                  </div>
                )}
                {printedRecord.breakdown.loanPrincipal > 0 && (
                  <div className="flex justify-between">
                    <span>ऋण साँवा:</span>
                    <span>रु. {printedRecord.breakdown.loanPrincipal.toLocaleString()}</span>
                  </div>
                )}
                {printedRecord.breakdown.loanInterest > 0 && (
                  <div className="flex justify-between">
                    <span>ऋण ब्याज:</span>
                    <span>रु. {printedRecord.breakdown.loanInterest.toLocaleString()}</span>
                  </div>
                )}
                {printedRecord.breakdown.whrStorageFee > 0 && (
                  <div className="flex justify-between">
                    <span>गोदाम रसिद शुल्क:</span>
                    <span>रु. {printedRecord.breakdown.whrStorageFee.toLocaleString()}</span>
                  </div>
                )}
                {printedRecord.breakdown.shareAmount > 0 && (
                  <div className="flex justify-between">
                    <span>सेयर किस्ता:</span>
                    <span>रु. {printedRecord.breakdown.shareAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="border-t-2 border-double border-gray-800 my-1.5" />
              <div className="flex justify-between font-extrabold text-xs">
                <span>कुल बुझाएको रकम:</span>
                <span>रु. {printedRecord.totalAmount.toLocaleString('ne-NP')}</span>
              </div>
              <div className="text-[10px] text-gray-700">
                माध्यम: {printedRecord.paymentMode === 'CASH' ? 'नगद (Cash)' : 'नेपालपे क्यूआर'}
              </div>
              <div className="border-t border-dashed border-gray-400 my-1.5" />
              <div className="text-[9px] text-center text-gray-600">
                * यो अस्थायी फिल्ड संकलन रसिद हो। केन्द्रीय प्रणालीमा प्रविष्टि भएपछि पासबुकमा प्रमाणित गरिनेछ।
              </div>
              <div className="pt-3 flex justify-between text-[9px]">
                <span>सदस्य दस्तखत: ......</span>
                <span>संकलक: {printedRecord.collectorName.slice(0, 8)}..</span>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handlePrintThermal('thermal-58mm')}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>५८mm ब्लुटुथ</span>
              </button>

              <button
                type="button"
                onClick={() => handlePrintThermal('thermal-80mm')}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>८०mm काउन्टर</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowReceiptModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
            >
              अर्को सदस्य संकलन गर्नुहोस् (Next)
            </button>
          </div>
        </div>
      )}

      {/* Hidden printable A4 Handover Report Voucher */}
      <div id="field-handover-printable" className="hidden print:block" data-printable="true">
        <div className="p-8 max-w-[210mm] mx-auto bg-white text-black font-sans border-2 border-slate-900 rounded-xl space-y-5">
          <div className="text-center border-b-2 border-slate-900 pb-3">
            <h1 className="text-xl font-black uppercase text-slate-900">{coopSettings.nameNepali}</h1>
            <p className="text-xs text-gray-700">{coopSettings.address} | फोन: {coopSettings.phone}</p>
            <h2 className="text-base font-bold text-slate-800 mt-1 uppercase">
              दैनिक फिल्ड संकलन तथा नगद बुझाएको भौचर (Daily Cash Handover Voucher)
            </h2>
            <p className="text-xs text-gray-600">मिति: {handoverReport.dateBS} (२०८१-०६-२५)</p>
          </div>

          <div className="grid grid-cols-2 text-xs">
            <div>
              <p><strong>संकलक कर्मचारी:</strong> {handoverReport.collectorName}</p>
              <p><strong>कर्मचारी नं:</strong> {handoverReport.collectorNo}</p>
              <p><strong>संकलन क्षेत्र:</strong> वार्ड नं. {activeWard.wardNumber} ({activeWard.nameNepali})</p>
            </div>
            <div className="text-right">
              <p><strong>कुल रसिद संख्या:</strong> {handoverReport.totalReceiptsCount} वटा</p>
              <p><strong>प्रणाली संकलन रकम:</strong> रु. {handoverReport.systemTotalAmount.toLocaleString()}</p>
              <p><strong>थैलीको नगद रकम:</strong> रु. {handoverReport.cashInBagAmount.toLocaleString()}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse border border-gray-400 text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400 font-bold">
                <th className="p-2 border-r border-gray-400">नोट दर (Denomination)</th>
                <th className="p-2 border-r border-gray-400 text-center">थान (Pcs)</th>
                <th className="p-2 text-right">जम्मा रकम (NPR)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'रु. १०००', count: denominations.n1000, mult: 1000 },
                { label: 'रु. ५००', count: denominations.n500, mult: 500 },
                { label: 'रु. १००', count: denominations.n100, mult: 100 },
                { label: 'रु. ५०', count: denominations.n50, mult: 50 },
                { label: 'रु. २०', count: denominations.n20, mult: 20 },
                { label: 'रु. १०', count: denominations.n10, mult: 10 },
                { label: 'रु. ५', count: denominations.n5, mult: 5 },
                { label: 'रु. २ / १', count: denominations.n2_1, mult: 2 },
              ].map(({ label, count, mult }) => (
                <tr key={label} className="border-b border-gray-300">
                  <td className="p-1.5 border-r border-gray-400 font-bold">{label}</td>
                  <td className="p-1.5 border-r border-gray-400 text-center">{count}</td>
                  <td className="p-1.5 text-right font-medium">रु. {(count * mult).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-black text-sm border-t-2 border-slate-900">
                <td className="p-2 border-r border-gray-400" colSpan={2}>कुल थैलीको भौतिक नगद (Total Cash in Bag)</td>
                <td className="p-2 text-right text-emerald-900">रु. {handoverReport.cashInBagAmount.toLocaleString()}</td>
              </tr>
              <tr className="text-xs">
                <td className="p-1.5 border-r border-gray-400" colSpan={2}>प्रणाली संकलन फरक (Discrepancy)</td>
                <td className="p-1.5 text-right font-bold">
                  {handoverReport.discrepancy === 0 ? 'रु. ० (दुरुस्त)' : `रु. ${handoverReport.discrepancy.toLocaleString()}`}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="border-t border-gray-400 pt-2">
              <p className="font-bold">{handoverReport.collectorName}</p>
              <p className="text-gray-600">नगद बुझाउने (फिल्ड संकलक)</p>
            </div>
            <div className="border-t border-gray-400 pt-2">
              <p className="font-bold">हेड टेलर / शाखा क्यासियर</p>
              <p className="text-gray-600">नगद बुझिलिने (प्रमाणीकरण)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic QR Modal for instant NepalPay / Fonepay collection */}
      <NepalDynamicQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        amount={currentTotalAmount}
        accountNo={selectedMember?.memberNo || '004-10294-88-01'}
        memberName={selectedMember?.name || 'Member'}
        onPaymentSuccess={(txId) => {
          setShowQrModal(false);
          setRemarks(`NepalPay QR Tx: ${txId}`);
          handleCollect();
        }}
      />

    </div>
  );
}

export default FieldCollectorPage;
