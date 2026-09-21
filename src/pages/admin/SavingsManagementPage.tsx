import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { SavingsAccount } from '../../types';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  PiggyBank,
  Search,
  PlusCircle,
  Percent,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  X,
  Sliders,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export function SavingsManagementPage() {
  const { savings, adjustSavingsBalance, updateSavingsRate } = useCoopStore();
  const { t } = useLanguageStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAcct, setSelectedAcct] = useState<SavingsAccount | null>(null);
  const [adjustType, setAdjustType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [adjustAmount, setAdjustAmount] = useState<number>(5000);
  const [adjustNote, setAdjustNote] = useState('');
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [rateSchemes, setRateSchemes] = useState([
    { type: 'Regular Savings', rate: 8.0, desc: 'Calculated daily, credited quarterly' },
    { type: 'Fixed Deposit (1 Year)', rate: 10.5, desc: 'Annual maturity tenure lock' },
    { type: 'Women Empowerment Fund', rate: 9.0, desc: 'Subsidized community micro-fund' },
    { type: 'Child Education Savings', rate: 8.5, desc: 'Long-term minor higher study fund' },
  ]);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filteredAccounts = savings.filter(
    (s) =>
      s.accountNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.accountType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDeposits = savings.reduce((acc, curr) => acc + curr.balance, 0);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAcct || adjustAmount <= 0) return;

    adjustSavingsBalance(selectedAcct.accountNo, adjustAmount, adjustType, adjustNote);
    showToastMsg(
      t(
        `${adjustType === 'DEPOSIT' ? 'जम्मा' : 'डेबिट'} रु. ${adjustAmount.toLocaleString()} खाता नं. ${selectedAcct.accountNo} मा सफलतापूर्वक प्रविष्टि भयो!`,
        `${adjustType === 'DEPOSIT' ? 'Deposit of' : 'Debit of'} NPR ${adjustAmount.toLocaleString()} applied to ${selectedAcct.accountNo}!`
      )
    );
    setSelectedAcct(null);
    setAdjustAmount(5000);
    setAdjustNote('');
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    rateSchemes.forEach((r) => {
      updateSavingsRate(r.type, r.rate);
    });
    showToastMsg(t('सहकारी बचत ब्याजदर सीबीएसमा सफलतापूर्वक अद्यावधिक भयो!', 'Cooperative Savings Interest Rates updated across CBS!'));
    setShowRatesModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
            <PiggyBank className="size-4" />
            <span>{t('केन्द्रीय बैंकिङ्ग बचत लेजर', 'CORE BANKING SAVINGS LEDGER')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('बचत तथा पासबुक खाता व्यवस्थापन मोड्युल', 'Savings & Passbook Accounts Module')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'सदस्य बचत मौज्दात अडिट, सीबीएसमा रकम समायोजन र वार्षिक ब्याजदर निर्धारण।',
              'Audit member deposit balances, execute manual CBS adjustments, and configure cooperative annual interest rates.'
            )}
          </p>
        </div>

        <button
          onClick={() => setShowRatesModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
          type="button"
        >
          <Sliders className="size-4 text-emerald-400" />
          <span>{t('ब्याजदर निर्धारण', 'Configure Interest Rates')}</span>
        </button>
      </div>

      {/* Stats Mosaic */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase">{t('कुल सदस्य तरलता', 'Total Member Liquidity')}</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
            रु. {totalDeposits.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{t('सबै सक्रिय पासबुक खाताहरूमा', 'Across all active passbook ledgers')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase">{t('साधारण बचत प्रतिफल', 'Regular Savings APY')}</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 mt-1">८.००% p.a.</div>
          <div className="text-[11px] text-emerald-500 mt-0.5">{t('त्रैमासिक सीबीएस चक्र', 'Quarterly CBS Compound Cycle')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase">{t('सक्रिय खाता संख्या', 'Active Ledger Accounts')}</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {savings.length} {t('खाताहरू', 'Accounts')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{t('शून्य निष्क्रिय दायित्व', 'Zero non-performing liabilities')}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          type="text"
          placeholder={t('खाता नं. वा प्रकारबाट खोज्नुहोस्...', 'Search by account no or type...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Accounts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{t('खाता नम्बर', 'Account Number')}</th>
                <th className="py-3 px-4">{t('योजनाको प्रकार', 'Scheme Type')}</th>
                <th className="py-3 px-4">{t('हालको मौज्दात', 'Current Balance')}</th>
                <th className="py-3 px-4">{t('ब्याजदर', 'Interest Rate')}</th>
                <th className="py-3 px-4">{t('स्थिति', 'Status')}</th>
                <th className="py-3 px-4 text-right">{t('मौज्दात समायोजन', 'Adjust Balance')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAccounts.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {s.accountNo}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {s.accountType}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    रु. {s.balance.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                      <Percent className="size-3" />
                      {s.interestRate}% p.a.
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      {s.status === 'ACTIVE' ? t('सक्रिय', 'ACTIVE') : s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedAcct(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold transition"
                    >
                      <span>{t('समायोजन', 'Adjust')}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUST BALANCE MODAL */}
      {selectedAcct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedAcct(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">
                {t('खाता रकम समायोजन', 'Adjust Account')}: {selectedAcct.accountNo}
              </h3>
              <button onClick={() => setSelectedAcct(null)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-500">{t('हालको मौज्दात:', 'Current Balance:')}</div>
                <div className="text-base font-black font-mono text-slate-900 dark:text-white">
                  रु. {selectedAcct.balance.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('कार्य प्रकार', 'Action Type')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('DEPOSIT')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      adjustType === 'DEPOSIT'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    <ArrowDownLeft className="size-4" />
                    <span>{t('जम्मा / क्रेडिट', 'Credit / Deposit')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('WITHDRAWAL')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      adjustType === 'WITHDRAWAL'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    <ArrowUpRight className="size-4" />
                    <span>{t('भुक्तानी / डेबिट', 'Debit / Withdrawal')}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('समायोजन रकम (रु.)', 'Adjustment Amount (NPR)')}
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  step={100}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  min={1}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('लेजर अडिट कैफियत / कारण', 'Audit Ledger Note / Reason')}
                </label>
                <input
                  type="text"
                  placeholder={t(
                    'जस्तै: काउन्टर नगद मिलान, लाभांश समायोजन...',
                    'e.g. Counter cash deposit correction, dividend reconciliation'
                  )}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAcct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('समायोजन प्रविष्टि गर्नुहोस्', 'Post Adjustment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIGURE RATES MODAL */}
      {showRatesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowRatesModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  {t('सहकारी बचत योजनाहरूको ब्याजदर निर्धारण', 'Configure Cooperative Savings Interest Rates')}
                </h3>
              </div>
              <button onClick={() => setShowRatesModal(false)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRates} className="p-6 space-y-4">
              {rateSchemes.map((r, idx) => (
                <div key={r.type} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{r.type}</div>
                    <div className="text-[11px] text-slate-400">{r.desc}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      max={25}
                      value={r.rate}
                      onChange={(e) => {
                        const next = [...rateSchemes];
                        next[idx].rate = Number(e.target.value);
                        setRateSchemes(next);
                      }}
                      className="w-20 px-2 py-1 text-right font-mono font-bold text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                    <span className="text-xs font-bold text-slate-500">% p.a.</span>
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRatesModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('लागु तथा प्रसारण गर्नुहोस्', 'Apply & Broadcast Rates')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
