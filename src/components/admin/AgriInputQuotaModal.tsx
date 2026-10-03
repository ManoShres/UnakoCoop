import React, { useState, useMemo } from 'react';
import {
  X,
  Wheat,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Plus,
  Coins,
  Warehouse,
  Receipt,
  FileText,
  Calendar,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import {
  MOCK_MEMBER_AGRI_QUOTAS,
  MOCK_FERTILIZER_STOCK,
  CROP_QUOTA_RATES,
  INPUT_PRICING_CATALOG,
  calculateItemPricing,
  calculateRequisitionTotals,
  generateAgriVoucherNumber,
  formatAgriDeliveryChallan,
  toBighaKatthaDhurString,
} from '../../utils/agriInputEngine';
import type {
  MemberAgriQuota,
  AgriInputRequisition,
  AgriCropType,
  AgriInputItemType,
  RequisitionItem,
} from '../../types';
import { printElement } from '../../utils/printHelper';

interface AgriInputQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

type ModalTab = 'REGISTRY' | 'REQUISITION' | 'STOCK' | 'CHALLAN';

export const AgriInputQuotaModal: React.FC<AgriInputQuotaModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const { coopSettings, addTransaction, members } = useCoopStore();

  const [activeTab, setActiveTab] = useState<ModalTab>('REGISTRY');
  const [quotas, setQuotas] = useState<MemberAgriQuota[]>(MOCK_MEMBER_AGRI_QUOTAS);
  const [stocks, setStocks] = useState(MOCK_FERTILIZER_STOCK);
  const [searchQuery, setSearchQuery] = useState('');

  // Requisition Form State
  const [selectedMemberId, setSelectedMemberId] = useState<string>('mem-1');
  const [selectedCrop, setSelectedCrop] = useState<AgriCropType>('PADDY');
  const [itemQuantities, setItemQuantities] = useState<Record<AgriInputItemType, number>>({
    UREA: 50,
    DAP: 50,
    POTASH: 25,
    SEED: 25,
    BIO_FERTILIZER: 0,
    MICRONUTRIENT: 0,
  });

  const [paymentType, setPaymentType] = useState<'CASH' | 'SEASONAL_CROP_CREDIT'>('SEASONAL_CROP_CREDIT');
  const [creditDueDate, setCreditDueDate] = useState('2081-09-30');
  const [selectedChallan, setSelectedChallan] = useState<AgriInputRequisition | null>(null);

  // Filtered Quota List
  const filteredQuotas = useMemo(() => {
    if (!searchQuery.trim()) return quotas;
    const q = searchQuery.toLowerCase();
    return quotas.filter(
      (quota) =>
        quota.memberName.toLowerCase().includes(q) ||
        quota.memberNo.toLowerCase().includes(q) ||
        quota.ward.toLowerCase().includes(q)
    );
  }, [quotas, searchQuery]);

  // Selected Member Quota Record
  const activeMemberQuota = useMemo(() => {
    return quotas.find((q) => q.memberId === selectedMemberId) || quotas[0];
  }, [quotas, selectedMemberId]);

  // Calculated Requisition Items
  const requisitionItems = useMemo<RequisitionItem[]>(() => {
    const items: RequisitionItem[] = [];
    (Object.keys(itemQuantities) as AgriInputItemType[]).forEach((type) => {
      const qty = itemQuantities[type] || 0;
      if (qty > 0) {
        items.push(calculateItemPricing(type, qty));
      }
    });
    return items;
  }, [itemQuantities]);

  const requisitionTotals = useMemo(() => {
    return calculateRequisitionTotals(requisitionItems);
  }, [requisitionItems]);

  if (!isOpen) return null;

  const handleIssueChallan = () => {
    if (requisitionItems.length === 0 || requisitionTotals.netPayableAmount <= 0) {
      return;
    }

    const voucherNo = generateAgriVoucherNumber('2081-06-25', 101);
    const challan: AgriInputRequisition = {
      id: voucherNo,
      requisitionNo: voucherNo,
      memberId: activeMemberQuota.memberId,
      memberNo: activeMemberQuota.memberNo,
      memberName: activeMemberQuota.memberName,
      ward: activeMemberQuota.ward,
      cropType: selectedCrop,
      items: requisitionItems,
      ...requisitionTotals,
      paymentType,
      creditDueDate: paymentType === 'SEASONAL_CROP_CREDIT' ? creditDueDate : undefined,
      creditInterestRatePercent: 4.5,
      status: 'PENDING_PICKUP',
      dateBS: '2081-06-25',
      issuedBy: 'EMP-01',
      warehouseLocation: 'गढवा मुख्य कृषि गोदाम (Main Silo)',
    };

    // Update Quota balances immutably
    setQuotas((prev) =>
      prev.map((q) => {
        if (q.memberId === activeMemberQuota.memberId) {
          const ureaAdded = itemQuantities.UREA || 0;
          const dapAdded = itemQuantities.DAP || 0;
          const potashAdded = itemQuantities.POTASH || 0;
          const seedAdded = itemQuantities.SEED || 0;

          return {
            ...q,
            consumed: {
              ureaKg: q.consumed.ureaKg + ureaAdded,
              dapKg: q.consumed.dapKg + dapAdded,
              potashKg: q.consumed.potashKg + potashAdded,
              seedKg: q.consumed.seedKg + seedAdded,
            },
            remaining: {
              ureaKg: Math.max(0, q.remaining.ureaKg - ureaAdded),
              dapKg: Math.max(0, q.remaining.dapKg - dapAdded),
              potashKg: Math.max(0, q.remaining.potashKg - potashAdded),
              seedKg: Math.max(0, q.remaining.seedKg - seedAdded),
            },
            outstandingCredit:
              paymentType === 'SEASONAL_CROP_CREDIT'
                ? q.outstandingCredit + requisitionTotals.netPayableAmount
                : q.outstandingCredit,
          };
        }
        return q;
      })
    );

    // If seasonal credit, register loan disbursement / passbook record
    if (paymentType === 'SEASONAL_CROP_CREDIT') {
      addTransaction({
        memberId: activeMemberQuota.memberId,
        type: 'LOAN_EMI',
        amount: requisitionTotals.netPayableAmount,
        description: `मौसमी रासायनिक मल/बीउ सापटी जारी (${voucherNo})`,
        referenceNo: voucherNo,
      });
    }

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setSelectedChallan(challan);
    setActiveTab('CHALLAN');
    onSuccessToast?.(
      t(
        `चलानी नं ${voucherNo} जारी भयो! किसानलाई मल लिन अनुमति दिइयो।`,
        `Delivery Challan ${voucherNo} issued for pickup!`
      )
    );
  };

  const handlePrintChallan = () => {
    printElement('agri-delivery-challan-printable', {
      format: 'a4',
      title: `Agri-Delivery-Challan-${selectedChallan?.requisitionNo || 'Voucher'}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  {t('सहकारी कृषि विकास तथा वितरण सेवा', 'Cooperative Agri-Input & Distribution Desk')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-700/50">
                  {t('सरकारी अनुदान प्राप्त', 'Govt Subsidized')}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t('रासायनिक मल, बीउबिजन कोटा तथा मौसमी कृषि कर्जा', 'Agri-Input Quota & Seasonal Credit Suite')}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 bg-slate-950 border-b border-slate-800 flex gap-2 overflow-x-auto text-xs font-bold">
          {[
            { id: 'REGISTRY', label: '१. सदस्य कोटा सूची (Quota Registry)', icon: Layers },
            { id: 'REQUISITION', label: '२. नयाँ वितरण तथा सापटी (Issue Requisition)', icon: ShoppingBag },
            { id: 'STOCK', label: '३. गोदाम मौज्दात (Godown Stock)', icon: Warehouse },
            { id: 'CHALLAN', label: '४. वितरण चलानी रसिद (Print Challan)', icon: Receipt },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as ModalTab)}
              type="button"
              className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: MEMBER QUOTA REGISTRY */}
          {activeTab === 'REGISTRY' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('किसानको नाम वा सदस्य नं खोज्नुहोस्...', 'Search by Farmer Name or Member No...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="text-xs text-slate-400">
                  {t('जम्मा किसान:', 'Total Farmers:')}{' '}
                  <strong className="text-white">{filteredQuotas.length} जना</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuotas.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-extrabold text-white flex items-center gap-2">
                          <span>{q.memberName}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-md bg-slate-700 text-slate-300 font-mono">
                            {q.memberNo}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{q.ward} • {q.phone}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMemberId(q.memberId);
                          setSelectedCrop(q.cropType);
                          setActiveTab('REQUISITION');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        कोटा वितरण (Issue)
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">जमिन क्षेत्रफल:</span>
                        <div className="font-bold text-white">
                          {toBighaKatthaDhurString(q.landArea)} ({q.totalKattha} कठ्ठा)
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">खेती बाली:</span>
                        <div className="font-bold text-amber-300">
                          {CROP_QUOTA_RATES[q.cropType]?.nepaliName || q.cropType}
                        </div>
                      </div>
                    </div>

                    {/* Nutrient Quota Progress */}
                    <div className="space-y-1.5 text-[11px] pt-1">
                      <div className="flex justify-between text-slate-300">
                        <span>युरिया (Urea):</span>
                        <span className="font-bold">
                          {q.consumed.ureaKg} / {q.entitlement.ureaKg} केजी{' '}
                          <strong className="text-emerald-400 font-bold">(बाँकी {q.remaining.ureaKg} kg)</strong>
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>डीएपी (DAP):</span>
                        <span className="font-bold">
                          {q.consumed.dapKg} / {q.entitlement.dapKg} केजी{' '}
                          <strong className="text-emerald-400 font-bold">(बाँकी {q.remaining.dapKg} kg)</strong>
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>पोटास (Potash):</span>
                        <span className="font-bold">
                          {q.consumed.potashKg} / {q.entitlement.potashKg} केजी{' '}
                          <strong className="text-emerald-400 font-bold">(बाँकी {q.remaining.potashKg} kg)</strong>
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>उन्नत बीउ (Seed):</span>
                        <span className="font-bold">
                          {q.consumed.seedKg} / {q.entitlement.seedKg} केजी{' '}
                          <strong className="text-emerald-400 font-bold">(बाँकी {q.remaining.seedKg} kg)</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: REQUISITION & SEASONAL CREDIT ISSUE */}
          {activeTab === 'REQUISITION' && (
            <div className="space-y-5 animate-fade-in">
              {/* Member & Crop Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    किसान छनोट (Select Farmer Member):
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-hidden"
                  >
                    {quotas.map((q) => (
                      <option key={q.memberId} value={q.memberId}>
                        {q.memberName} ({q.memberNo}) - {q.ward} ({q.totalKattha} कठ्ठा)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    बाली सिजन (Crop Season):
                  </label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value as AgriCropType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-hidden"
                  >
                    <option value="PADDY">वर्खे धान (Main Paddy)</option>
                    <option value="MUSTARD">हिउँदे तोरी (Winter Mustard)</option>
                    <option value="MAIZE">बसन्ते / हिउँदे मकै (Maize)</option>
                    <option value="WHEAT">गहुँ (Wheat)</option>
                    <option value="LENTILS">दाल / मसुरो (Lentils)</option>
                  </select>
                </div>
              </div>

              {/* Items Quantity Inputs */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  वितरण गरिने सामग्री परिमाण (Distribute Quantities):
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { type: 'UREA', label: 'युरिया मल (Urea 46% N)', rate: 'रु. १८/के.जी.', bag: '५० के.जी. बोरा' },
                    { type: 'DAP', label: 'डीएपी मल (DAP 18:46:0)', rate: 'रु. ४८/के.जी.', bag: '५० के.जी. बोरा' },
                    { type: 'POTASH', label: 'पोटास मल (MOP)', rate: 'रु. ३४/के.जी.', bag: '५० के.जी. बोरा' },
                    { type: 'SEED', label: 'उन्नत बीउबिजन (Foundation Seed)', rate: 'रु. ७५/के.जी.', bag: '२५ के.जी. बोरा' },
                  ].map(({ type, label, rate, bag }) => {
                    const itemType = type as AgriInputItemType;
                    const val = itemQuantities[itemType] || 0;
                    return (
                      <div
                        key={type}
                        className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{label}</div>
                          <div className="text-[11px] text-slate-400">{rate} • {bag}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            step="5"
                            value={val || ''}
                            onChange={(e) =>
                              setItemQuantities((prev) => ({
                                ...prev,
                                [itemType]: Number(e.target.value) || 0,
                              }))
                            }
                            className="w-20 px-2 py-1 rounded bg-slate-900 text-right font-bold text-emerald-400 text-xs border border-slate-700 focus:outline-hidden"
                          />
                          <span className="text-xs text-slate-400">kg</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment & Seasonal Credit Options */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    भुक्तानी विधि रोज्नुहोस् (Payment Mode):
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentType('CASH')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        paymentType === 'CASH'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      नगद भुक्तानी (Cash)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentType('SEASONAL_CROP_CREDIT')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        paymentType === 'SEASONAL_CROP_CREDIT'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      मौसमी कृषि सापटी (Crop Credit)
                    </button>
                  </div>
                </div>

                {paymentType === 'SEASONAL_CROP_CREDIT' && (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-purple-300">
                        मौसमी फसल कर्जा सुविधा (Harvest Repayment):
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        बाली भित्रिएपछि अन्न गोदाम रसिदबाट स्वतः कट्टी हुने वा नगद बुझाउने (ब्याजदर ४.५%)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px]">चुक्ता म्याद:</span>
                      <div className="font-mono font-bold text-white">{creditDueDate}</div>
                    </div>
                  </div>
                )}

                {/* Pricing Summary */}
                <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>खुला बजार सामान्य मूल्य (Market Price):</span>
                    <span className="line-through tabular-nums">
                      रु. {requisitionTotals.totalMarketValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>नेपाल सरकार अनुदान छुट (Subsidy Savings):</span>
                    <span className="tabular-nums">
                      - रु. {requisitionTotals.totalSubsidySavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-black text-amber-300">
                    <span>खुद भुक्तानी योग्य रकम (Net Payable):</span>
                    <span className="tabular-nums">
                      रु. {requisitionTotals.netPayableAmount.toLocaleString('ne-NP')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleIssueChallan}
                  disabled={requisitionTotals.netPayableAmount <= 0}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    रु. {requisitionTotals.netPayableAmount.toLocaleString()} को वितरण चलानी जारी गर्नुहोस् (Issue Challan)
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: GODOWN FERTILIZER STOCK */}
          {activeTab === 'STOCK' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stocks.map((s) => (
                  <div
                    key={s.itemType}
                    className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{s.nameNepali}</h4>
                        <span className="text-[11px] text-slate-400">{s.nameEnglish}</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800">
                        रु. {s.subsidizedPricePerBag} / बोरा
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-700/80">
                      <div className="p-2 rounded-xl bg-slate-900">
                        <span className="text-[10px] text-slate-400">कुल मौज्दात</span>
                        <div className="font-extrabold text-white mt-0.5">{s.totalBagsInStock} बोरा</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900">
                        <span className="text-[10px] text-slate-400">कोटा विनियोजन</span>
                        <div className="font-extrabold text-amber-300 mt-0.5">{s.quotaAllocatedBags} बोरा</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900">
                        <span className="text-[10px] text-slate-400">तुरुन्त उपलब्ध</span>
                        <div className="font-extrabold text-emerald-400 mt-0.5">{s.availableBags} बोरा</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL DELIVERY CHALLAN & PRINT PREVIEW */}
          {activeTab === 'CHALLAN' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    आधिकारिक वितरण चलानी रसिद (Delivery Challan Preview)
                  </h3>
                  <span className="text-xs text-slate-400">
                    किसानलाई मल वितरण गर्दा दुवै पक्षको हस्ताक्षरसहित १ प्रति किसान र १ प्रति गोदाममा राखिनेछ।
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handlePrintChallan}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>चलानी प्रिन्ट (Print Challan)</span>
                </button>
              </div>

              {selectedChallan ? (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs leading-relaxed space-y-2 text-slate-200">
                  <div className="text-center font-bold text-sm text-white">
                    {coopSettings.nameNepali}
                  </div>
                  <div className="text-center text-[11px] text-slate-400">
                    {coopSettings.address} | दर्ता: {coopSettings.regNo}
                  </div>
                  <div className="border-t border-dashed border-slate-700 my-2" />
                  <div className="flex justify-between">
                    <span>चलानी नं: <strong>{selectedChallan.requisitionNo}</strong></span>
                    <span>मिति: {selectedChallan.dateBS}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>किसान: <strong>{selectedChallan.memberName}</strong> ({selectedChallan.memberNo})</span>
                    <span>ठेगाना: {selectedChallan.ward}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-700 my-2" />
                  <div className="space-y-1">
                    {selectedChallan.items.map((it) => (
                      <div key={it.itemType} className="flex justify-between">
                        <span>{it.itemNameNepali} ({it.quantityKg} kg / {it.bagCount} बोरा):</span>
                        <span className="font-bold text-emerald-400">रु. {it.totalAmount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t-2 border-slate-700 my-2 pt-1 flex justify-between font-extrabold text-sm text-white">
                    <span>खुद बुझाएको / कर्जा रकम:</span>
                    <span className="text-amber-300">रु. {selectedChallan.netPayableAmount.toLocaleString('ne-NP')}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    भुक्तानी विधि: {selectedChallan.paymentType === 'CASH' ? 'नगद' : 'मौसमी कृषि सापटी (Crop Credit)'}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  कुनै चलानी हाल जारी गरिएको छैन। पहिले 'नयाँ वितरण' ट्याबबाट चलानी जारी गर्नुहोस्।
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden Printable A4 Delivery Challan */}
        <div id="agri-delivery-challan-printable" className="hidden print:block" data-printable="true">
          {selectedChallan && (
            <div className="p-8 max-w-[210mm] mx-auto bg-white text-black font-sans border-2 border-emerald-950 rounded-xl space-y-6">
              <div className="text-center border-b-2 border-emerald-950 pb-4">
                <h1 className="text-2xl font-black uppercase text-emerald-950">
                  {coopSettings.nameNepali}
                </h1>
                <p className="text-xs text-gray-700">
                  {coopSettings.address} | दर्ता नं: {coopSettings.regNo} | पान नं: {coopSettings.panNo}
                </p>
                <h2 className="text-lg font-bold text-emerald-800 mt-2 uppercase">
                  रासायनिक मल तथा बीउबिजन वितरण चलानी (Agri-Input Delivery Challan)
                </h2>
                <span className="text-xs font-bold text-gray-600">
                  (नेपाल सरकार अनुदानित रासायनिक मल वितरण निर्देशिका बमोजिम)
                </span>
              </div>

              <div className="grid grid-cols-2 text-sm">
                <div>
                  <p><strong>चलानी नं:</strong> {selectedChallan.requisitionNo}</p>
                  <p><strong>किसान सदस्य:</strong> {selectedChallan.memberName} ({selectedChallan.memberNo})</p>
                  <p><strong>स्थान/वार्ड:</strong> {selectedChallan.ward}</p>
                  <p><strong>बाली प्रकार:</strong> {selectedChallan.cropType}</p>
                </div>
                <div className="text-right">
                  <p><strong>मिति:</strong> {selectedChallan.dateBS}</p>
                  <p><strong>गोदाम स्थान:</strong> {selectedChallan.warehouseLocation}</p>
                  <p><strong>भुक्तानी:</strong> {selectedChallan.paymentType === 'CASH' ? 'नगद' : 'मौसमी कृषि कर्जा'}</p>
                  {selectedChallan.creditDueDate && <p><strong>चुक्ता म्याद:</strong> {selectedChallan.creditDueDate}</p>}
                </div>
              </div>

              <table className="w-full text-left border-collapse border border-gray-400 text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-400">
                    <th className="p-2.5 border-r border-gray-400">सामग्री विवरण (Item)</th>
                    <th className="p-2.5 border-r border-gray-400 text-center">परिमाण (kg)</th>
                    <th className="p-2.5 border-r border-gray-400 text-center">बोरा (Bags)</th>
                    <th className="p-2.5 border-r border-gray-400 text-right">अनुदान दर (रु.)</th>
                    <th className="p-2.5 text-right">जम्मा रकम (रु.)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedChallan.items.map((it) => (
                    <tr key={it.itemType} className="border-b border-gray-300">
                      <td className="p-2.5 border-r border-gray-400 font-bold">{it.itemNameNepali}</td>
                      <td className="p-2.5 border-r border-gray-400 text-center">{it.quantityKg} kg</td>
                      <td className="p-2.5 border-r border-gray-400 text-center">{it.bagCount}</td>
                      <td className="p-2.5 border-r border-gray-400 text-right">रु. {it.subsidizedRatePerKg}</td>
                      <td className="p-2.5 text-right font-bold">रु. {it.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold border-t-2 border-emerald-950">
                    <td className="p-2.5 border-r border-gray-400" colSpan={4}>
                      सरकारी अनुदान बचत (Government Subsidy Savings)
                    </td>
                    <td className="p-2.5 text-right text-emerald-800">
                      - रु. {selectedChallan.totalSubsidySavings.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50 font-black text-base border-t-2 border-emerald-950">
                    <td className="p-2.5 border-r border-gray-400" colSpan={4}>
                      खुद बुझाएको / कर्जा रकम (Net Amount)
                    </td>
                    <td className="p-2.5 text-right text-emerald-900">
                      रु. {selectedChallan.netPayableAmount.toLocaleString('ne-NP')}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="border-t border-gray-400 pt-2">
                  <p className="font-bold">{selectedChallan.memberName}</p>
                  <p className="text-gray-600">प्राप्तकर्ता किसानको दस्तखत</p>
                </div>
                <div className="border-t border-gray-400 pt-2">
                  <p className="font-bold">{selectedChallan.issuedBy} (गोदाम प्रमुख)</p>
                  <p className="text-gray-600">वितरण गर्ने कर्मचारीको दस्तखत</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgriInputQuotaModal;
