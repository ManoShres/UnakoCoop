import React, { useMemo, useState, useEffect } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  calculateTradingPL,
  generateTradingCsv,
  filterTradingTransactions,
  TRADING_TYPE_LABELS,
  TRADING_TYPE_GROUP,
} from '../../utils/tradingPL';
import { triggerBrowserDownload } from '../../utils/copomisExport';
import { TrendingUp, Download, X, Plus, Ban, CheckCircle2 } from 'lucide-react';
import type { TradingCategory, TradingType } from '../../types';

const CATEGORY_OPTIONS: { id: TradingCategory; ne: string; en: string }[] = [
  { id: 'INVESTMENT', ne: 'लगानी पोर्टफोलियो', en: 'Investment Portfolio' },
  { id: 'FOREIGN_EXCHANGE', ne: 'विदेशी मुद्रा डेस्क', en: 'Foreign Exchange Desk' },
  { id: 'COMMODITY', ne: 'जिन्सी वस्तु व्यापार', en: 'Commodity Trading' },
  { id: 'SERVICE_FEE', ne: 'सेवा शुल्क तथा कमिसन', en: 'Service Fee & Commission' },
  { id: 'OPERATING_EXPENSE', ne: 'सञ्चालन खर्च', en: 'Operating Expenses' },
];

const TRADING_TYPES: TradingType[] = [
  'PURCHASE',
  'SALE',
  'FX_GAIN',
  'FX_LOSS',
  'DIVIDEND_INCOME',
  'INTEREST_INCOME',
  'CAPITAL_GAIN',
  'CAPITAL_LOSS',
  'FEE_INCOME',
  'EXPENSE',
];

export const TradingPLPage: React.FC = () => {
  const { t, fmtCurrency, fmtCount, fmtPercent, fmtDigits } = useLanguageStore();
  const { tradingTransactions, addTradingTransaction, voidTradingTransaction, employees } =
    useCoopStore();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<TradingType | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<TradingCategory | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // Entry form state
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formType, setFormType] = useState<TradingType>('SALE');
  const [formCategory, setFormCategory] = useState<TradingCategory>('INVESTMENT');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState(0);
  const [formCurrency, setFormCurrency] = useState('NPR');
  const [formRate, setFormRate] = useState(1);
  const [formReference, setFormReference] = useState('');
  const [formRecordedBy, setFormRecordedBy] = useState(employees[0]?.employeeNo ?? '');

  const filters = useMemo(
    () => ({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      type: typeFilter,
      category: categoryFilter,
    }),
    [startDate, endDate, typeFilter, categoryFilter]
  );

  const summary = useMemo(
    () => calculateTradingPL(tradingTransactions, filters),
    [tradingTransactions, filters]
  );

  const rows = useMemo(
    () => filterTradingTransactions(tradingTransactions, filters),
    [tradingTransactions, filters]
  );

  const maxCategory = Math.max(...summary.breakdown.map((item) => item.income + item.cost), 1);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleExportCsv = () => {
    triggerBrowserDownload(
      generateTradingCsv(rows),
      `Trading_Ledger_${startDate || 'all'}_${endDate || 'all'}.csv`,
      'text/csv'
    );
    showToastMsg(t('ट्रेडिङ खाता CSV निकासा भयो।', 'Trading ledger CSV exported.'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountInNPR = Math.round(formAmount * formRate * 100) / 100;
    const officer = employees.find((emp) => emp.employeeNo === formRecordedBy);

    addTradingTransaction({
      date: formDate,
      type: formType,
      description: formDescription,
      category: formCategory,
      currency: formCurrency,
      exchangeRate: formRate,
      amountInNPR,
      referenceNo: formReference || undefined,
      recordedBy: formRecordedBy,
      recordedByName: officer?.name,
    });

    showToastMsg(
      t('नयाँ ट्रेडिङ प्रविष्टि सफलतापूर्वक दर्ता भयो!', 'New trading transaction recorded successfully!')
    );
    setShowModal(false);
    setFormDescription('');
    setFormAmount(0);
    setFormReference('');
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}


      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
            <TrendingUp className="size-4" />
            <span>{t('ट्रेडिङ तथा लगानी आय', 'TRADING & INVESTMENT INCOME')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('ट्रेडिङ नाफा नोक्सान खाता', 'Trading Profit & Loss Ledger')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'लगानी, विदेशी मुद्रा, जिन्सी व्यापार तथा सेवा शुल्कबाट हुने आय र खर्चको नाफा नोक्सान विवरण।',
              'Track purchase/sale turnover, FX gains, dividend and fee income against operating costs.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Download className="size-4" />
            {t('CSV निकासा', 'Export CSV')}
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
          >
            <Plus className="size-4" />
            {t('नयाँ प्रविष्टि', 'New Entry')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            {t('कुल आय', 'TOTAL INCOME')}
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {fmtCurrency(summary.totalIncome, true)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('नाफा, लाभांश, ब्याज तथा शुल्क', 'Gains, dividend, interest & fees')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            {t('कुल खर्च', 'TOTAL COST')}
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">
            {fmtCurrency(summary.totalCost, true)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('घाटा तथा सञ्चालन खर्च', 'Losses & operating expenses')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            {t('शुद्ध नाफा / नोक्सान', 'NET PROFIT / LOSS')}
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              summary.netPL >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'
            }`}
          >
            {fmtCurrency(summary.netPL, true)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('लागतमा प्रतिफल: ', 'Return on cost base: ')}{fmtPercent(summary.plPercent.toFixed(2))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            {t('कारोबार (खरिद + बिक्री)', 'TURNOVER (BUY + SELL)')}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {fmtCurrency(summary.totalPurchases + summary.totalSales, true)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {fmtCount(summary.transactionCount)} {t('प्रविष्टि', 'ledger entries')}
          </div>
        </div>
      </div>


      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('सुरु मिति', 'Start Date')}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('अन्त्य मिति', 'End Date')}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('प्रकार', 'Transaction Type')}
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TradingType | 'ALL')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
            >
              <option value="ALL">{t('सबै प्रकार', 'All Types')}</option>
              {TRADING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(TRADING_TYPE_LABELS[type].ne, TRADING_TYPE_LABELS[type].en)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('श्रेणी', 'Category')}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as TradingCategory | 'ALL')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
            >
              <option value="ALL">{t('सबै श्रेणी', 'All Categories')}</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {t(option.ne, option.en)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {summary.breakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 dark:text-white mb-4">
            {t('श्रेणीगत नाफा नोक्सान विश्लेषण', 'Category-wise P/L Breakdown')}
          </h2>
          <div className="space-y-3">
            {summary.breakdown.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {t(item.categoryNepali, item.category)}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      item.net >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {fmtCurrency(item.net, true)} · {fmtPercent(item.percentage.toFixed(1))}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    className="bg-emerald-500"
                    style={{ width: `${(item.income / maxCategory) * 100}%` }}
                    title={`${t('आय', 'Income')}: ${fmtCurrency(item.income, true)}`}
                  />
                  <div
                    className="bg-rose-500"
                    style={{ width: `${(item.cost / maxCategory) * 100}%` }}
                    title={`${t('खर्च', 'Cost')}: ${fmtCurrency(item.cost, true)}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white">
            {t('ट्रेडिङ खाता प्रविष्टिहरू', 'Trading Ledger Entries')}
          </h2>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {fmtCount(rows.length)} {t('प्रविष्टि', 'entries')}
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            {t('यो अवधिमा कुनै ट्रेडिङ प्रविष्टि फेला परेन।', 'No trading entries found for this period.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="text-left font-bold px-4 py-3">{t('मिति', 'Date')}</th>
                  <th className="text-left font-bold px-4 py-3">{t('प्रकार', 'Type')}</th>
                  <th className="text-left font-bold px-4 py-3">{t('श्रेणी', 'Category')}</th>
                  <th className="text-left font-bold px-4 py-3">{t('विवरण', 'Description')}</th>
                  <th className="text-right font-bold px-4 py-3">{t('रकम (NPR)', 'Amount (NPR)')}</th>
                  <th className="text-left font-bold px-4 py-3">{t('दर्ता गर्ने', 'Recorded By')}</th>
                  <th className="text-center font-bold px-4 py-3">{t('कार्य', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((tx) => {
                  const group = TRADING_TYPE_GROUP[tx.type];
                  const amountClass =
                    group === 'INCOME'
                      ? 'text-emerald-600'
                      : group === 'COST'
                        ? 'text-rose-600'
                        : 'text-slate-900 dark:text-white';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{fmtDigits(tx.date)}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {t(TRADING_TYPE_LABELS[tx.type].ne, TRADING_TYPE_LABELS[tx.type].en)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {CATEGORY_OPTIONS.find((c) => c.id === tx.category)?.en ?? tx.category}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[240px] truncate" title={tx.description}>
                        {tx.description}
                        {tx.currency && tx.currency !== 'NPR' && (
                          <span className="ml-2 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                            {tx.currency} @ {fmtDigits(tx.exchangeRate ?? 1)}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${amountClass}`}>
                        {fmtCurrency(tx.amountInNPR, true)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {tx.recordedByName ?? tx.recordedBy}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {tx.status === 'VOID' ? (
                          <span className="text-[10px] font-bold text-slate-400">
                            {t('रद्द', 'VOID')}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              voidTradingTransaction(tx.id);
                              showToastMsg(
                                t('प्रविष्टि रद्द गरियो।', 'Transaction voided.')
                              );
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title={t('प्रविष्टि रद्द गर्नुहोस्', 'Void this entry')}
                          >
                            <Ban className="size-3" />
                            {t('रद्द', 'Void')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* New Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                {t('नयाँ ट्रेडिङ प्रविष्टि', 'New Trading Entry')}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="size-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('मिति', 'Date')}
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('प्रकार', 'Type')}
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as TradingType)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    {TRADING_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {t(TRADING_TYPE_LABELS[type].ne, TRADING_TYPE_LABELS[type].en)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('श्रेणी', 'Category')}
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as TradingCategory)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {t(option.ne, option.en)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('विवरण', 'Description')}
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={t('जस्तै: सेयर बिक्री मुनाफा', 'e.g. Realised gain on share sale')}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  required
                />
              </div>


              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('रकम', 'Amount')}
                  </label>
                  <input
                    type="number"
                    step={0.01}
                    min={0}
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('मुद्रा', 'Currency')}
                  </label>
                  <input
                    type="text"
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('विनिमय दर', 'FX Rate')}
                  </label>
                  <input
                    type="number"
                    step={0.000001}
                    min={0}
                    value={formRate}
                    onChange={(e) => setFormRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {t('कुल रकम (NPR)', 'Total in NPR')}:{' '}
                {fmtCurrency(Math.round(formAmount * formRate * 100) / 100, true)}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('सन्दर्भ नं', 'Reference No')}
                  </label>
                  <input
                    type="text"
                    value={formReference}
                    onChange={(e) => setFormReference(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('दर्ता गर्ने कर्मचारी', 'Recorded By')}
                  </label>
                  <select
                    value={formRecordedBy}
                    onChange={(e) => setFormRecordedBy(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.employeeNo}>
                        {t(emp.nameNepali || emp.name, emp.name)} ({emp.accessRole})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('प्रविष्टि दर्ता गर्नुहोस्', 'Record Entry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

