import React, { useState } from 'react';
import {
  FixedAsset,
  AssetPoolCategory,
  AdditionTiming,
  DEFAULT_FIXED_ASSETS,
  POOL_METADATA,
  calculateComprehensiveDepreciation,
  addFixedAsset,
  disposeFixedAsset,
  generateCopasJournalVoucher,
  exportFixedAssetsToCSV,
} from '../../utils/fixedAssetEngine';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  Building2,
  X,
  FileSpreadsheet,
  PlusCircle,
  Calculator,
  Printer,
  Copy,
  Check,
  Search,
  BookOpen,
  DollarSign,
  QrCode,
  Tag,
  Warehouse,
  Laptop,
  Car,
  Armchair,
  Sparkles,
} from 'lucide-react';

interface FixedAssetDepreciationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FixedAssetDepreciationModal: React.FC<FixedAssetDepreciationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguageStore();

  const [assets, setAssets] = useState<FixedAsset[]>(DEFAULT_FIXED_ASSETS);
  const [activeTab, setActiveTab] = useState<'schedule' | 'register' | 'voucher' | 'guide'>('schedule');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');

  // New Asset Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState<AssetPoolCategory>('POOL_D');
  const [newDate, setNewDate] = useState('2080-11-01');
  const [newCost, setNewCost] = useState<number>(50000);
  const [newTiming, setNewTiming] = useState<AdditionTiming>('SHRAWAN_TO_POUSH');
  const [newBranch, setNewBranch] = useState('गढवा मुख्य शाखा');
  const [newLocation, setNewLocation] = useState('शाखा कार्यालय');
  const [newAssigned, setNewAssigned] = useState('');

  // Disposal Modal State
  const [isDisposalModalOpen, setIsDisposalModalOpen] = useState(false);
  const [targetDisposalAsset, setTargetDisposalAsset] = useState<FixedAsset | null>(null);
  const [saleProceeds, setSaleProceeds] = useState<number>(0);
  const [disposalDate, setDisposalDate] = useState('2080-12-25');

  // Copy state
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const summary = calculateComprehensiveDepreciation(assets, '२०८०/०८१');

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
    const matchesBranch = branchFilter === 'ALL' || a.branchName === branchFilter;
    return matchesSearch && matchesCategory && matchesBranch;
  });

  const handleExportCSV = () => {
    const csv = exportFixedAssetsToCSV(assets);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Unako_Fixed_Assets_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newCost <= 0) return;

    const generatedCode = newCode.trim() || `FA-${newCategory.split('_')[1]}-${String(assets.length + 1).padStart(3, '0')}`;

    const updated = addFixedAsset(assets, {
      assetCode: generatedCode,
      name: newName.trim(),
      category: newCategory,
      purchaseDate: newDate,
      purchaseCost: Number(newCost),
      additionTiming: newTiming,
      branchName: newBranch,
      location: newLocation.trim() || 'शाखा कार्यालय',
      assignedEmployee: newAssigned.trim() || undefined,
      status: 'ACTIVE',
    });

    setAssets(updated);
    setIsAddModalOpen(false);

    // Reset fields
    setNewName('');
    setNewCode('');
    setNewCost(50000);
    setNewAssigned('');
  };

  const handleConfirmDisposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDisposalAsset) return;

    const updated = disposeFixedAsset(assets, targetDisposalAsset.id, Number(saleProceeds), disposalDate);
    setAssets(updated);
    setIsDisposalModalOpen(false);
    setTargetDisposalAsset(null);
  };

  const voucherText = generateCopasJournalVoucher(summary);

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText(voucherText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPoolIcon = (pool: AssetPoolCategory) => {
    switch (pool) {
      case 'POOL_A':
        return <Warehouse className="size-4 text-emerald-600" />;
      case 'POOL_B':
        return <Armchair className="size-4 text-amber-600" />;
      case 'POOL_C':
        return <Car className="size-4 text-blue-600" />;
      case 'POOL_D':
        return <Laptop className="size-4 text-purple-600" />;
      case 'POOL_E':
        return <Sparkles className="size-4 text-rose-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Building2 className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {t(
                    'स्थिर सम्पत्ति तथा आयकर ऐन अनुसूची २ ह्रासकट्टी प्रणाली',
                    'Fixed Asset Management & IRD Schedule 2 Depreciation Schedule'
                  )}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                  COPAS 108 / IRD Pool A-E
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t(
                  'नेपाल सहकारी लेखामान (COPAS) तथा आयकर ऐन २०५८ अनुसूची २ बमोजिम घट्दो मूल्य ह्रास गणना र पूँजीकरण',
                  'COPAS-compliant fixed asset capitalization, diminishing balance depreciation pools, and statutory journal vouchers'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
            >
              <PlusCircle className="size-4" />
              <span>{t('नयाँ सम्पत्ति दर्ता', 'Add Asset')}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              <span>{t('CSV निर्यात', 'Export CSV')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Financial KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-slate-400 font-semibold block">{t('कुल स्थिर सम्पत्ति', 'Total Assets')}</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{summary.totalAssetsCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('दर्ता भएका उपकरण/भवन', 'Registered Items')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-blue-500 font-semibold block">{t('प्रारम्भिक WDV (शुरु मूल्य)', 'Opening WDV')}</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400">
              रु. {Math.round(summary.totalOpeningWdv / 100000).toLocaleString()} लाख
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">रु. {summary.totalOpeningWdv.toLocaleString('en-IN')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-amber-500 font-semibold block">{t('चालु आ.व. कुल थप खरिद', 'Current Additions')}</span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">
              रु. {summary.totalAdditions.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">योग्य: रु. {summary.totalAbsorbedAdditions.toLocaleString('en-IN')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-rose-500 font-semibold block">{t('वार्षिक ह्रासकट्टी खर्च', 'Depreciation Expense')}</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400">
              रु. {summary.totalDepreciationExpense.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('नाफा नोक्सान खर्च', 'P&L Dr. Expense')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-purple-500 font-semibold block">{t('आगामी वर्ष सर्ने पूँजी', 'Deferred to Next Year')}</span>
            <span className="text-base font-black text-purple-600 dark:text-purple-400">
              रु. {summary.totalUnabsorbedAdditions.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('२/३ र १/३ भाग नियम', 'Unabsorbed Slab')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-emerald-500 font-semibold block">{t('अन्तिम WDV (असार मसान्त)', 'Closing WDV')}</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              रु. {Math.round(summary.totalClosingWdv / 100000).toLocaleString()} लाख
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">रु. {summary.totalClosingWdv.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'schedule'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Calculator className="size-4" />
            <span>{t('आयकर ऐन अनुसूची २ ह्रासकट्टी तालिका', 'IRD Schedule 2 Tax Pool Matrix')}</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Tag className="size-4" />
            <span>{t('स्थिर सम्पत्ति दर्ता किताब', 'Fixed Asset Register & Inventory')} ({assets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('voucher')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'voucher'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Printer className="size-4" />
            <span>{t('COPAS गोश्वारा भौचर (JV)', 'COPAS Depreciation JV')}</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="size-4" />
            <span>{t('कानुनी नियम तथा दरहरू', 'Statutory Rates & Guide')}</span>
          </button>
        </div>

        {/* Tab 1: Schedule 2 Matrix */}
        {activeTab === 'schedule' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="py-3 px-3">{t('ह्रासकट्टी वर्ग', 'Pool Category')}</th>
                    <th className="py-3 px-2 text-center">{t('दर %', 'Rate')}</th>
                    <th className="py-3 px-3 text-right">{t('प्रारम्भिक WDV', 'Opening WDV')}</th>
                    <th className="py-3 px-3 text-right">{t('श्रावण-पौष (१००%)', 'Shrawan-Poush')}</th>
                    <th className="py-3 px-3 text-right">{t('माघ-चैत्र (६६.७%)', 'Magh-Chaitra')}</th>
                    <th className="py-3 px-3 text-right">{t('वैशाख-असार (३३.३%)', 'Baisakh-Ashadh')}</th>
                    <th className="py-3 px-3 text-right">{t('ह्रास आधार', 'Dep Base')}</th>
                    <th className="py-3 px-3 text-right text-rose-600">{t('ह्रासकट्टी खर्च', 'Depreciation')}</th>
                    <th className="py-3 px-3 text-right text-purple-600">{t('आगामी वर्ष सर्ने', 'Deferred')}</th>
                    <th className="py-3 px-4 text-right text-emerald-600 font-black">{t('अन्तिम WDV', 'Closing WDV')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.values(summary.poolSchedules).map((sch) => (
                    <tr key={sch.pool} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {getPoolIcon(sch.pool)}
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{sch.poolNameNp}</span>
                            <span className="text-[10px] text-slate-400">{sch.poolNameEn}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-2 text-center font-bold text-slate-700 dark:text-slate-300">
                        {Math.round(sch.depreciationRate * 100)}%
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                        {sch.openingWdv.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                        {sch.additionsFull > 0 ? sch.additionsFull.toLocaleString('en-IN') : '-'}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                        {sch.additionsTwoThirds > 0 ? sch.additionsTwoThirds.toLocaleString('en-IN') : '-'}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                        {sch.additionsOneThird > 0 ? sch.additionsOneThird.toLocaleString('en-IN') : '-'}
                      </td>

                      <td className="py-3 px-3 text-right font-semibold text-slate-900 dark:text-white">
                        {sch.depreciationBase.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                        {sch.depreciationAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-purple-600 dark:text-purple-400">
                        {sch.unabsorbedAdditions.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {sch.closingWdv.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <tr>
                    <td className="py-3 px-3">{t('कुल जम्मा', 'Total Summary')}</td>
                    <td className="py-3 px-2 text-center">-</td>
                    <td className="py-3 px-3 text-right">{summary.totalOpeningWdv.toLocaleString('en-IN')}</td>
                    <td colSpan={3} className="py-3 px-3 text-center text-amber-600">
                      थप: रु. {summary.totalAdditions.toLocaleString('en-IN')} (योग्य: रु. {summary.totalAbsorbedAdditions.toLocaleString('en-IN')})
                    </td>
                    <td className="py-3 px-3 text-right">-</td>
                    <td className="py-3 px-3 text-right text-rose-600">{summary.totalDepreciationExpense.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right text-purple-600">{summary.totalUnabsorbedAdditions.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-emerald-600">{summary.totalClosingWdv.toLocaleString('en-IN')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Fixed Asset Register */}
        {activeTab === 'register' && (
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('सम्पत्ति कोड वा नाम खोज्नुहोस्...', 'Search asset code or name...')}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ALL">{t('सबै वर्ग', 'All Pools')}</option>
                {Object.entries(POOL_METADATA).map(([k, v]) => (
                  <option key={k} value={k}>{v.nameNp}</option>
                ))}
              </select>

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ALL">{t('सबै शाखा', 'All Branches')}</option>
                <option value="गढवा मुख्य शाखा">गढवा मुख्य शाखा</option>
                <option value="लमही सेवा केन्द्र">लमही सेवा केन्द्र</option>
                <option value="भालुवाङ सेवा केन्द्र">भालुवाङ सेवा केन्द्र</option>
              </select>
            </div>

            {/* Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3 px-4">{t('कोड तथा विवरण', 'Asset Code & Name')}</th>
                    <th className="py-3 px-3">{t('ह्रास वर्ग', 'Pool')}</th>
                    <th className="py-3 px-3">{t('शाखा तथा स्थान', 'Branch & Location')}</th>
                    <th className="py-3 px-3 text-right">{t('खरिद लागत', 'Cost')}</th>
                    <th className="py-3 px-3 text-right">{t('हालको खुद मूल्य (WDV)', 'Current WDV')}</th>
                    <th className="py-3 px-3 text-center">{t('अवस्था', 'Status')}</th>
                    <th className="py-3 px-4 text-right">{t('कार्यवाही', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md text-[11px]">
                            {asset.assetCode}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white block max-w-xs truncate">
                            {asset.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          खरिद मिति: {asset.purchaseDate} {asset.assignedEmployee ? `• जिम्मेवार: ${asset.assignedEmployee}` : ''}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {getPoolIcon(asset.category)}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {asset.category.replace('POOL_', 'वर्ग ')}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <span className="font-medium block">{asset.branchName}</span>
                        <span className="text-[10px] text-slate-400">{asset.location}</span>
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                        रु. {asset.purchaseCost.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        रु. {asset.currentWdv.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          asset.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : asset.status === 'DISPOSED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {asset.status === 'ACTIVE' ? 'सक्रिय (Active)' : asset.status === 'DISPOSED' ? 'लिलाम/बिक्री' : 'मर्मतमा'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {asset.status === 'ACTIVE' && (
                          <button
                            onClick={() => {
                              setTargetDisposalAsset(asset);
                              setSaleProceeds(asset.currentWdv);
                              setIsDisposalModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 rounded-lg transition-colors"
                          >
                            {t('लिलाम / बिक्री', 'Dispose')}
                          </button>
                        )}
                        {asset.status === 'DISPOSED' && asset.disposalDetails && (
                          <span className="text-[10px] text-slate-400">
                            बिक्री: रु. {asset.disposalDetails.saleProceeds.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: COPAS Journal Voucher */}
        {activeTab === 'voucher' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {t('COPAS स्थिर सम्पत्ति ह्रासकट्टी गोश्वारा भौचर', 'COPAS Fixed Asset Depreciation Journal Voucher')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t(
                    'नेपाल सहकारी लेखामान (COPAS) बमोजिम साधारण खातामा खर्च र ह्रास सञ्चिति प्रविष्टि भौचर',
                    'Official statutory double-entry voucher debiting depreciation expense and crediting accumulated reserves'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyVoucher}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  <span>{copied ? t('कपी भयो', 'Copied') : t('कपी गर्नुहोस्', 'Copy')}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                >
                  <Printer className="size-3.5" />
                  <span>{t('प्रिन्ट गर्नुहोस्', 'Print Voucher')}</span>
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
              {voucherText}
            </div>
          </div>
        )}

        {/* Tab 4: Guidelines */}
        {activeTab === 'guide' && (
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-2">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <Calculator className="size-4" />
                  <span>आयकर ऐन २०५८ अनुसूची २ ह्रासकट्टी दर प्रणाली</span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  नेपालको आयकर कानून अनुसार सहकारी संस्थाहरूले स्थिर सम्पत्तिलाई ५ वटा समूहमा वर्गीकरण गरी घट्दो मूल्य प्रणाली (Diminishing Value Method) बाट ह्रासकट्टी गर्नुपर्दछ।
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li><strong>वर्ग क (५%):</strong> भवन, गोदाम तथा सिभिल पूर्वाधार।</li>
                  <li><strong>वर्ग ख (२५%):</strong> फर्निचर, फिक्चर्स, सेफ तिजोरी र कार्यालय उपकरण।</li>
                  <li><strong>वर्ग ग (२०%):</strong> मोटरसाइकल, भ्यान, जिप र सवारी साधन।</li>
                  <li><strong>वर्ग घ (२५%):</strong> कम्प्युटर, मुख्य सर्भर, प्रिन्टर र सफ्टवेयर।</li>
                  <li><strong>वर्ग ङ (२०%):</strong> लिजहोल्ड सुधार तथा अमूर्त सम्पत्ति।</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-2">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <BookOpen className="size-4" />
                  <span>थप खरिदमा ह्रासकट्टी गणनाको त्रैमासिक नियम</span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  चालु आर्थिक वर्षमा खरिद भएका नयाँ सम्पत्तिहरू कुन महिनामा दाखिला भए सोही आधारमा ह्रासकट्टी आधार गणना गरिन्छ:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li><strong>श्रावणदेखि पौषसम्म (३/३ भाग):</strong> लागतको १००% रकम चालु वर्षको ह्रास आधारमा जोडिन्छ।</li>
                  <li><strong>माघदेखि चैत्रसम्म (२/३ भाग):</strong> लागतको ६६.६७% चालु वर्षमा ह्रासकट्टी हुन्छ, बाँकी १/३ आगामी आ.व.मा सर्दछ।</li>
                  <li><strong>वैशाखदेखि असारसम्म (१/३ भाग):</strong> लागतको ३३.३३% चालु वर्षमा ह्रासकट्टी हुन्छ, बाँकी २/३ आगामी आ.व.मा सर्दछ।</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add New Asset */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <PlusCircle className="size-4 text-emerald-600" />
                  <span>{t('नयाँ स्थिर सम्पत्ति पूँजीकरण दर्ता फारम', 'Capitalize New Fixed Asset')}</span>
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{t('सम्पत्तिको नाम तथा विवरण', 'Asset Name')}</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="उदा: काउन्टर कम्प्युटर तथा क्युआर स्क्यानर सेट"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t('ह्रासकट्टी वर्ग', 'Pool Category')}</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as AssetPoolCategory)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {Object.entries(POOL_METADATA).map(([k, v]) => (
                        <option key={k} value={k}>{v.nameNp}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t('सम्पत्ति कोड (स्वेच्छिक)', 'Asset Code')}</label>
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="FA-D-010"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t('खरिद मिति', 'Purchase Date')}</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t('खरिद लागत मूल्य (रु.)', 'Purchase Cost (NPR)')}</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newCost}
                      onChange={(e) => setNewCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{t('खरिद समय स्ल्याब', 'Timing Slab')}</label>
                  <select
                    value={newTiming}
                    onChange={(e) => setNewTiming(e.target.value as AdditionTiming)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="SHRAWAN_TO_POUSH">श्रावण देखि पौष (३/३ भाग - १००% ह्रास योग्य)</option>
                    <option value="MAGH_TO_CHAITRA">माघ देखि चैत्र (२/३ भाग - ६६.६७% ह्रास योग्य)</option>
                    <option value="BAISAKH_TO_ASHADH">वैशाख देखि असार (१/३ भाग - ३३.३३% ह्रास योग्य)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t('शाखा कार्यालय', 'Branch')}</label>
                    <select
                      value={newBranch}
                      onChange={(e) => setNewBranch(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="गढवा मुख्य शाखा">गढवा मुख्य शाखा</option>
                      <option value="लमही सेवा केन्द्र">लमही सेवा केन्द्र</option>
                      <option value="भालुवाङ सेवा केन्द्र">भालुवाङ सेवा केन्द्र</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">{t('जिम्मेवार कर्मचारी (स्वेच्छिक)', 'Assigned Staff')}</label>
                    <input
                      type="text"
                      value={newAssigned}
                      onChange={(e) => setNewAssigned(e.target.value)}
                      placeholder="उदा: सुमन केसी"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                  >
                    {t('रद्द', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                  >
                    {t('पूँजीकरण सुरक्षित गर्नुहोस्', 'Save & Capitalize')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Dispose Asset */}
        {isDisposalModalOpen && targetDisposalAsset && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <Tag className="size-4" />
                  <span>{t('स्थिर सम्पत्ति लिलाम / बिक्री प्रविष्टि', 'Dispose Fixed Asset')}</span>
                </h3>
                <button onClick={() => setIsDisposalModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">{targetDisposalAsset.name}</span>
                <div className="flex items-center justify-between text-slate-500">
                  <span>{t('सम्पत्ति कोड:', 'Asset Code:')} <strong>{targetDisposalAsset.assetCode}</strong></span>
                  <span>{t('हालको खुद मूल्य (WDV):', 'Current WDV:')} <strong>रु. {targetDisposalAsset.currentWdv.toLocaleString('en-IN')}</strong></span>
                </div>
              </div>

              <form onSubmit={handleConfirmDisposal} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{t('लिलाम / बिक्री प्राप्त रकम (रु.)', 'Sale Proceeds (NPR)')}</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={saleProceeds}
                    onChange={(e) => setSaleProceeds(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">{t('लिलाम मिति', 'Disposal Date')}</label>
                  <input
                    type="date"
                    required
                    value={disposalDate}
                    onChange={(e) => setDisposalDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-900 dark:text-amber-200">
                  {saleProceeds >= targetDisposalAsset.currentWdv ? (
                    <span>सम्पत्ति बिक्री नाफा: रु. {(saleProceeds - targetDisposalAsset.currentWdv).toLocaleString('en-IN')} (सञ्चालन आम्दानीमा क्रेडिट हुनेछ)</span>
                  ) : (
                    <span>सम्पत्ति बिक्री नोक्सान: रु. {(targetDisposalAsset.currentWdv - saleProceeds).toLocaleString('en-IN')} (सञ्चालन खर्चमा डेबिट हुनेछ)</span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDisposalModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                  >
                    {t('रद्द', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
                  >
                    {t('लिलाम प्रमाणीकरण गर्नुहोस्', 'Authorize Disposal')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
