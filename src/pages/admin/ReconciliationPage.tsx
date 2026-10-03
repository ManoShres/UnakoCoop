import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  reconcileStatementEntry,
  findUnmatchedLedgerEntries,
  detectDuplicateTransactions,
  countOpenMismatches,
} from '../../utils/reconciliation';
import {
  Landmark,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Upload,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { formatNPR } from '../../utils/nepaliDate';
import type {
  BankStatementEntry,
  MismatchType,
  ReconciliationEntry,
  ReconciliationStatus,
} from '../../types';

const STATUS_STYLES: Record<ReconciliationStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  MATCHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  MISMATCH: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  RESOLVED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
};

const MISMATCH_LABELS: Record<MismatchType, { ne: string; en: string }> = {
  AMOUNT_MISMATCH: { ne: 'रकम भिन्नता', en: 'Amount mismatch' },
  MISSING_ENTRY: { ne: 'प्रविष्टि छुटेको', en: 'Missing entry' },
  DUPLICATE_ENTRY: { ne: 'डुप्लिकेट प्रविष्टि', en: 'Duplicate entry' },
  WRONG_DATE: { ne: 'मिति गलत', en: 'Wrong date' },
  WRONG_REFERENCE: { ne: 'रेफरेन्स गलत', en: 'Wrong reference' },
};

export function ReconciliationPage() {
  const { t, fmtCurrency, fmtCount } = useLanguageStore();
  const {
    bankStatements,
    reconciliationEntries,
    transactions,
    addBankStatement,
    addReconciliationEntry,
    updateReconciliationStatus,
  } = useCoopStore();

  const [activeTab, setActiveTab] = useState<'STATEMENTS' | 'ENTRIES'>('ENTRIES');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReconciliationStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [resolving, setResolving] = useState<ReconciliationEntry | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Manual statement entry form
  const [stDate, setStDate] = useState(new Date().toISOString().slice(0, 10));
  const [stDesc, setStDesc] = useState('');
  const [stAmount, setStAmount] = useState('');
  const [stRef, setStRef] = useState('');
  const [stSide, setStSide] = useState<'DEBIT' | 'CREDIT'>('CREDIT');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const summary = {
    total: reconciliationEntries.length,
    matched: reconciliationEntries.filter((r) => r.status === 'MATCHED').length,
    mismatch: reconciliationEntries.filter((r) => r.status === 'MISMATCH').length,
    pending: reconciliationEntries.filter((r) => r.status === 'PENDING').length,
    resolved: reconciliationEntries.filter((r) => r.status === 'RESOLVED').length,
  };
  const openCount = countOpenMismatches(reconciliationEntries);



  // ---------------------------------------------------------------------------
  // Auto-reconciliation engine
  // ---------------------------------------------------------------------------
  const runAutoReconciliation = () => {
    setIsRunning(true);
    try {
      const created: ReconciliationEntry[] = [];
      const matchedLedgerIds: string[] = [];

      // 1. Match each bank statement line against the teller ledger.
      bankStatements.forEach((statement) => {
        const draft = reconcileStatementEntry(statement, transactions, matchedLedgerIds);
        if (draft.status === 'MATCHED' && draft.transactionId) {
          matchedLedgerIds.push(draft.transactionId);
        }
        created.push(
          addReconciliationEntry(draft as Omit<ReconciliationEntry, 'id' | 'flaggedAt' | 'createdAt'>)
        );
      });

      // 2. Flag teller entries that never appeared on any statement.
      findUnmatchedLedgerEntries(transactions, bankStatements, matchedLedgerIds).forEach((draft) => {
        created.push(
          addReconciliationEntry(draft as Omit<ReconciliationEntry, 'id' | 'flaggedAt' | 'createdAt'>)
        );
      });

      // 3. Flag duplicate teller entries (same date + amount + ref + type).
      detectDuplicateTransactions(transactions).forEach((groupIds) => {
        groupIds.slice(1).forEach((dupId) => {
          const dupTx = transactions.find((tx) => tx.id === dupId);
          if (!dupTx) return;
          created.push(
            addReconciliationEntry({
              transactionId: dupTx.id,
              transactionAmount: dupTx.amount,
              transactionDate: dupTx.date,
              transactionRef: dupTx.referenceNo,
              amount: dupTx.amount,
              date: dupTx.date,
              description: dupTx.description,
              referenceNo: dupTx.referenceNo,
              status: 'MISMATCH',
              mismatchType: 'DUPLICATE_ENTRY',
              mismatchDetails:
                'Same date, amount, reference and type as another teller entry.',
            } as Omit<ReconciliationEntry, 'id' | 'flaggedAt' | 'createdAt'>)
          );
        });
      });

      showToast(
        t(
          `स्वतः मिलान सम्पन्न — ${created.length} प्रविष्टि जाँच गरियो।`,
          `Auto-reconciliation complete — ${created.length} entries checked.`
        )
      );
    } finally {
      setIsRunning(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CSV statement upload (columns: date, description, amount, debit/credit, ref)
  // ---------------------------------------------------------------------------
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      let imported = 0;
      lines.slice(1).forEach((line) => {
        const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        if (cols.length < 3) return;
        const amount = Number(cols[2]);
        if (!Number.isFinite(amount) || amount === 0) return;
        addBankStatement({
          statementDate: cols[0] || new Date().toISOString().slice(0, 10),
          description: cols[1] || 'Bank statement line',
          amount: Math.abs(amount),
          referenceNo: cols[4] || undefined,
          debitOrCredit: (cols[3] || 'CREDIT').toUpperCase() === 'DEBIT' ? 'DEBIT' : 'CREDIT',
          uploadedBy: 'ADMIN',
          uploadedByName: 'Admin Upload',
        });
        imported += 1;
      });
      showToast(
        t(
          `${imported} बैंक प्रविष्टि अपलोड भयो।`,
          `${imported} bank statement lines imported.`
        )
      );
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleAddStatement = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(stAmount);
    if (!stDate || !stDesc || !Number.isFinite(amount) || amount <= 0) return;
    addBankStatement({
      statementDate: stDate,
      description: stDesc,
      amount,
      referenceNo: stRef || undefined,
      debitOrCredit: stSide,
      uploadedBy: 'ADMIN',
      uploadedByName: 'Manual Entry',
    });
    setStDesc('');
    setStAmount('');
    setStRef('');
    showToast(t('बैंक प्रविष्टि थपियो।', 'Bank statement entry added.'));
  };

  const handleResolve = () => {
    if (!resolving) return;
    updateReconciliationStatus(resolving.id, 'RESOLVED', resolveNotes);
    setResolving(null);
    setResolveNotes('');
    showToast(t('भिन्नता समाधान भयो।', 'Mismatch resolved.'));
  };



  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const filteredEntries = reconciliationEntries
    .filter((entry) => statusFilter === 'ALL' || entry.status === statusFilter)
    .filter(
      (entry) =>
        searchQuery.trim() === '' ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.referenceNo ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  const npr = (value: number) => formatNPR(value, useNepali);
  const useNepali = useLanguageStore.getState().lang === 'ne';

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center gap-3">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
            <Landmark className="size-4" />
            <span>{t('बैंक मिलान तथा प्रविष्टि भिन्नता', 'BANK RECONCILIATION & ENTRY MISMATCH')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('खाता मिलान तथा भिन्नता व्यवस्थापन', 'Reconciliation & Mismatch Suite')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'कर्मचारी प्रविष्टि र बैंक विवरण मिलान गर्नुहोस्, डुप्लिकेट/गलत प्रविष्टि पहिचान गर्नुहोस्।',
              'Reconcile teller entries against bank statements and detect duplicate or incorrect entries.'
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-2">
            <Upload className="size-4" />
            {t('CSV अपलोड', 'Upload CSV')}
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvUpload} />
          </label>
          <button
            onClick={runAutoReconciliation}
            disabled={isRunning}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
          >
            <RefreshCw className={`size-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning
              ? t('मिलान हुँदै...', 'Reconciling...')
              : t('स्वतः मिलान चलाउनुहोस्', 'Run Auto-Reconciliation')}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {(
          [
            { key: 'TOTAL', label: t('कुल प्रविष्टि', 'Total Entries'), value: summary.total, icon: Landmark, color: 'text-slate-500' },
            { key: 'MATCHED', label: t('मिलान भयो', 'Matched'), value: summary.matched, icon: CheckCircle2, color: 'text-emerald-500' },
            { key: 'MISMATCH', label: t('भिन्नता', 'Mismatches'), value: summary.mismatch, icon: AlertTriangle, color: 'text-rose-500' },
            { key: 'PENDING', label: t('पेन्डिङ', 'Pending'), value: summary.pending, icon: RefreshCw, color: 'text-amber-500' },
            { key: 'RESOLVED', label: t('समाधान भयो', 'Resolved'), value: summary.resolved, icon: ShieldCheck, color: 'text-sky-500' },
          ] as const
        ).map((card) => (
          <div
            key={card.key}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className={`flex items-center gap-1.5 text-[10px] font-bold mb-1.5 ${card.color}`}>
              <card.icon className="size-3.5" />
              <span>{card.label}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {fmtCount(card.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(
          [
            { key: 'ENTRIES', label: t('भिन्नता सूची', 'Mismatch Queue') },
            { key: 'STATEMENTS', label: t('बैंक विवरण', 'Bank Statements') },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* ENTRIES tab */}
      {activeTab === 'ENTRIES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('खोज्नुहोस्...', 'Search...')}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(['ALL', 'PENDING', 'MISMATCH', 'MATCHED', 'RESOLVED'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition ${
                    statusFilter === s
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {s === 'ALL' ? t('सबै', 'ALL') : s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-left text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-2.5 font-bold">{t('मिति', 'Date')}</th>
                  <th className="px-4 py-2.5 font-bold">{t('विवरण', 'Description')}</th>
                  <th className="px-4 py-2.5 font-bold text-right">{t('रकम', 'Amount')}</th>
                  <th className="px-4 py-2.5 font-bold">{t('स्थिति', 'Status')}</th>
                  <th className="px-4 py-2.5 font-bold">{t('भिन्नता प्रकार', 'Mismatch Type')}</th>
                  <th className="px-4 py-2.5 font-bold text-right">{t('कार्य', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                      {t('कुनै प्रविष्टि छैन। स्वतः मिलान चलाउनुहोस्।', 'No entries yet. Run auto-reconciliation.')}
                    </td>
                  </tr>
                )}
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                      {entry.description}
                      {entry.mismatchDetails && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{entry.mismatchDetails}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {fmtCurrency(entry.amount, true)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[entry.status]}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {entry.mismatchType
                        ? t(MISMATCH_LABELS[entry.mismatchType].ne, MISMATCH_LABELS[entry.mismatchType].en)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex gap-1.5 justify-end">
                        {entry.status !== 'MATCHED' && entry.status !== 'RESOLVED' && (
                          <button
                            onClick={() => updateReconciliationStatus(entry.id, 'MATCHED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-200 transition"
                          >
                            {t('मिलाउनुहोस्', 'Match')}
                          </button>
                        )}
                        {entry.status === 'MISMATCH' && (
                          <button
                            onClick={() => {
                              setResolving(entry);
                              setResolveNotes('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-200 transition"
                          >
                            {t('समाधान', 'Resolve')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* STATEMENTS tab */}
      {activeTab === 'STATEMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Manual entry form */}
          <form
            onSubmit={handleAddStatement}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {t('बैंक प्रविष्टि थप्नुहोस्', 'Add Bank Statement Entry')}
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('मिति', 'Date')}
              </label>
              <input
                type="date"
                value={stDate}
                onChange={(e) => setStDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('विवरण', 'Description')}
              </label>
              <input
                value={stDesc}
                onChange={(e) => setStDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                placeholder={t('उदा. नगद जम्मा', 'e.g. Cash deposit')}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('रकम (रु)', 'Amount (NPR)')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={stAmount}
                  onChange={(e) => setStAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('खाता/जम्मा', 'Debit / Credit')}
                </label>
                <select
                  value={stSide}
                  onChange={(e) => setStSide(e.target.value as 'DEBIT' | 'CREDIT')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <option value="CREDIT">{t('जम्मा', 'Credit')}</option>
                  <option value="DEBIT">{t('भुक्तानी', 'Debit')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('रेफरेन्स (वैकल्पिक)', 'Reference (optional)')}
              </label>
              <input
                value={stRef}
                onChange={(e) => setStRef(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
            >
              {t('प्रविष्टि थप्नुहोस्', 'Add Entry')}
            </button>
          </form>


          {/* Statement table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {t('अपलोड गरिएका विवरणहरू', 'Uploaded Statements')}
              </h3>
              <span className="text-[10px] font-bold text-slate-400">
                {bankStatements.length} {t('प्रविष्टि', 'lines')}
              </span>
            </div>
            <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80">
                  <tr className="text-left text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-2.5 font-bold">{t('मिति', 'Date')}</th>
                    <th className="px-4 py-2.5 font-bold">{t('विवरण', 'Description')}</th>
                    <th className="px-4 py-2.5 font-bold text-right">{t('रकम', 'Amount')}</th>
                    <th className="px-4 py-2.5 font-bold">{t('प्रकार', 'Side')}</th>
                  </tr>
                </thead>
                <tbody>
                  {bankStatements.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                        {t('कुनै बैंक विवरण अपलोड भएको छैन।', 'No bank statements uploaded yet.')}
                      </td>
                    </tr>
                  )}
                  {bankStatements.map((s: BankStatementEntry) => (
                    <tr
                      key={s.id}
                      className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {s.statementDate}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{s.description}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {fmtCurrency(s.amount, true)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.debitOrCredit === 'CREDIT'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                          }`}
                        >
                          {s.debitOrCredit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* Resolve modal */}
      {resolving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">
              {t('भिन्नता समाधान', 'Resolve Mismatch')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {resolving.description} · {fmtCurrency(resolving.amount, true)} · {resolving.date}
            </p>
            <textarea
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              rows={3}
              placeholder={t('समाधान नोट (वैकल्पिक)...', 'Resolution notes (optional)...')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setResolving(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
              >
                {t('रद्द गर्नुहोस्', 'Cancel')}
              </button>
              <button
                onClick={handleResolve}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
              >
                {t('समाधान गर्नुहोस्', 'Resolve')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
