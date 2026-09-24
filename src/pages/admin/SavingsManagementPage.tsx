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
  AlertCircle,
} from 'lucide-react';

export function SavingsManagementPage() {
  const { savings, adjustSavingsBalance, updateSavingsRate, members } = useCoopStore();
  const { t, fmtCurrency, fmtCount, fmtDigits, fmtPercent } = useLanguageStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAcct, setSelectedAcct] = useState<SavingsAccount | null>(null);
  const [adjustType, setAdjustType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [adjustAmount, setAdjustAmount] = useState<number>(5000);
  const [adjustNote, setAdjustNote] = useState('');
  const [voucherNo, setVoucherNo] = useState('JV-2081-0142');
  const [adjustReasonCategory, setAdjustReasonCategory] = useState('CASH_COUNTER_RECON');
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedAcct && !showRatesModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setSelectedAcct(null);
        setShowRatesModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAcct, showRatesModal]);

  // New Scheme Form State
  const [showNewSchemeForm, setShowNewSchemeForm] = useState(false);
  const [newSchemeName, setNewSchemeName] = useState('');
  const [newSchemeRate, setNewSchemeRate] = useState(9.5);
  const [newSchemeCompounding, setNewSchemeCompounding] = useState<'Daily' | 'Monthly' | 'Quarterly' | 'Half-Yearly'>('Quarterly');
  const [newSchemeMinBalance, setNewSchemeMinBalance] = useState(1000);

  interface RateSchemeConfig {
    type: string;
    rate: number;
    desc: string;
    compounding: 'Daily' | 'Monthly' | 'Quarterly' | 'Half-Yearly';
    minBalance: number;
    tdsRate: number; // statutory 5% TDS
    prematurePenalty: number;
  }

  const [rateSchemes, setRateSchemes] = useState<RateSchemeConfig[]>([
    {
      type: 'Regular Savings',
      rate: 8.0,
      desc: 'दैनिक मौज्दात गणना, त्रैमासिक ब्याज भुक्तानी',
      compounding: 'Quarterly',
      minBalance: 500,
      tdsRate: 5.0,
      prematurePenalty: 0,
    },
    {
      type: 'Fixed Deposit (1 Year)',
      rate: 10.5,
      desc: '१ वर्षे आवधिक मुद्दती खाता',
      compounding: 'Monthly',
      minBalance: 25000,
      tdsRate: 5.0,
      prematurePenalty: 1.5,
    },
    {
      type: 'Women Empowerment Fund',
      rate: 9.0,
      desc: 'महिला सशक्तीकरण मासिक बचत',
      compounding: 'Quarterly',
      minBalance: 1000,
      tdsRate: 5.0,
      prematurePenalty: 0,
    },
    {
      type: 'Child Education Savings',
      rate: 8.5,
      desc: 'नाबालक उच्च शिक्षा दीर्घकालीन कोष',
      compounding: 'Half-Yearly',
      minBalance: 500,
      tdsRate: 5.0,
      prematurePenalty: 1.0,
    },
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

    const fullAuditNote = `[${voucherNo}] [${adjustReasonCategory}] ${adjustNote.trim()}`;
    adjustSavingsBalance(selectedAcct.accountNo, adjustAmount, adjustType, fullAuditNote);
    showToastMsg(
      t(
        `${adjustType === 'DEPOSIT' ? 'जम्मा' : 'डेबिट'} रु. ${fmtCurrency(adjustAmount, true)} खाता नं. ${selectedAcct.accountNo} मा सफलतापूर्वक प्रविष्टि भयो! (भौचर: ${voucherNo})`,
        `${adjustType === 'DEPOSIT' ? 'Deposit of' : 'Debit of'} NPR ${fmtCurrency(adjustAmount, true)} applied to ${selectedAcct.accountNo}! (Voucher: ${voucherNo})`
      )
    );
    setSelectedAcct(null);
    setAdjustAmount(5000);
    setAdjustNote('');
    setVoucherNo('JV-2081-' + Math.floor(1000 + Math.random() * 9000));
  };

  const handleAddCustomScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchemeName.trim()) return;
    const newScheme: RateSchemeConfig = {
      type: newSchemeName.trim(),
      rate: newSchemeRate,
      desc: `नयाँ बचत योजना • ${newSchemeCompounding} चक्र`,
      compounding: newSchemeCompounding,
      minBalance: newSchemeMinBalance,
      tdsRate: 5.0,
      prematurePenalty: 1.0,
    };
    setRateSchemes((prev) => [...prev, newScheme]);
    updateSavingsRate(newScheme.type, newScheme.rate);
    setNewSchemeName('');
    setShowNewSchemeForm(false);
    showToastMsg(t(`नयाँ बचत योजना "${newScheme.type}" थप भयो!`, `New savings product "${newScheme.type}" added!`));
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
            {fmtCurrency(totalDeposits, true)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{t('सबै सक्रिय पासबुक खाताहरूमा', 'Across all active passbook ledgers')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase">{t('साधारण बचत प्रतिफल', 'Regular Savings APY')}</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 mt-1">{fmtPercent('8.00')} p.a.</div>
          <div className="text-[11px] text-emerald-500 mt-0.5">{t('त्रैमासिक सीबीएस चक्र', 'Quarterly CBS Compound Cycle')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase">{t('सक्रिय खाता संख्या', 'Active Ledger Accounts')}</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {fmtCount(savings.length)} {t('खाताहरू', 'Accounts')}
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
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {fmtDigits(s.accountNo)}
                    </div>
                    {(() => {
                      const owner = members.find((m) => m.id === s.memberId);
                      return owner ? (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                          {t(owner.nameNepali || owner.name, owner.name)}
                        </div>
                      ) : null;
                    })()}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {s.accountType}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {fmtCurrency(s.balance, true)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                      <Percent className="size-3" />
                      {fmtPercent(s.interestRate)} p.a.
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

      {/* ADJUST BALANCE MODAL WITH LIVE MATH */}
      {selectedAcct && (() => {
        const newBalance =
          adjustType === 'DEPOSIT'
            ? selectedAcct.balance + adjustAmount
            : selectedAcct.balance - adjustAmount;
        const isNegative = newBalance < 0;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-fade-in"
            onClick={() => setSelectedAcct(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                    {t('सीबीएस लेजर अडिट समायोजन', 'CBS LEDGER AUDIT ADJUSTMENT')}
                  </div>
                  <h3 className="font-bold text-sm">
                    {t('खाता रकम समायोजन', 'Adjust Account')}: {selectedAcct.accountNo}
                    {(() => {
                      const owner = members.find((m) => m.id === selectedAcct.memberId);
                      return owner ? (
                        <span className="font-normal text-xs text-slate-300 ml-2">
                          ({t(owner.nameNepali || owner.name, owner.name)})
                        </span>
                      ) : null;
                    })()}
                  </h3>
                </div>
                <button onClick={() => setSelectedAcct(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
                {/* LIVE MATH EQUATION WIDGET */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t('मौज्दात हिसाब मिलान (Live Balance Equation)', 'Live Balance Reconciliation Equation')}
                  </div>
                  <div className="flex items-center justify-between gap-1 text-center font-mono">
                    <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400">{t('हालको मौज्दात', 'Initial')}</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        रु. {fmtCurrency(selectedAcct.balance, true)}
                      </div>
                    </div>

                    <div className="text-base font-black px-1 text-slate-400">
                      {adjustType === 'DEPOSIT' ? '+' : '−'}
                    </div>

                    <div className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400">{t('समायोजन रकम', 'Adjust')}</div>
                      <div
                        className={`text-xs font-bold truncate ${
                          adjustType === 'DEPOSIT' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        रु. {fmtCurrency(adjustAmount, true)}
                      </div>
                    </div>

                    <div className="text-base font-black px-1 text-slate-400">=</div>

                    <div
                      className={`flex-1 p-2 rounded-lg border ${
                        isNegative
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400'
                      }`}
                    >
                      <div className="text-[10px] text-slate-500">{t('अन्तिम मौज्दात', 'Result')}</div>
                      <div
                        className={`text-xs font-black truncate ${
                          isNegative ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        रु. {fmtCurrency(newBalance, true)}
                      </div>
                    </div>
                  </div>

                  {isNegative && (
                    <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 pt-1">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{t('चेतावनी: खातामा मौज्दात ऋणात्मक (Negative) हुँदैछ!', 'Warning: Resulting balance will be negative!')}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('समायोजन दिशा (Action Type)', 'Action Type')}
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
                      <span>{t('जम्मा / क्रेडिट (Deposit)', 'Credit / Deposit')}</span>
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
                      <span>{t('भुक्तानी / डेबिट (Withdrawal)', 'Debit / Withdrawal')}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('समायोजन रकम (रु.) *', 'Amount (NPR) *')}
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
                      {t('भौचर नम्बर (JV No.) *', 'Journal Voucher No. *')}
                    </label>
                    <input
                      type="text"
                      value={voucherNo}
                      onChange={(e) => setVoucherNo(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('समायोजनको कारण वर्ग (Reason Category) *', 'Reason Category *')}
                  </label>
                  <select
                    value={adjustReasonCategory}
                    onChange={(e) => setAdjustReasonCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="CASH_COUNTER_RECON">{t('काउन्टर नगद मिलान (Counter Cash Reconciliation)', 'Counter Cash Reconciliation')}</option>
                    <option value="DIVIDEND_CREDIT">{t('वार्षिक लाभांश समायोजन (Dividend Distribution)', 'Dividend Distribution')}</option>
                    <option value="LOAN_OFFSET">{t('ऋण किस्ता कट्टा (Loan Principal/Interest Offset)', 'Loan Repayment Offset')}</option>
                    <option value="ERROR_CORRECTION">{t('सीबीएस भुल सुधार प्रविष्टि (Ledger Error Correction)', 'Ledger Error Correction')}</option>
                    <option value="FEE_REVERSAL">{t('शुल्क फिर्ता / छुट (Fee Waiver/Reversal)', 'Fee Reversal')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('विस्तृत अडिट कैफियत / टिप्पणी *', 'Detailed Audit Note *')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('जस्तै: काउन्टर भौचर नं. ४४२ अनुसार नगद मिलान', 'e.g. Counter deposit mismatch correction as per slip #442')}
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
        );
      })()}

      {/* CONFIGURE RATES & SAVINGS SCHEME BUILDER MODAL */}
      {showRatesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-fade-in"
          onClick={() => setShowRatesModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Sliders className="size-5 text-emerald-400" />
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    {t('सीबीएस ब्याजदर तथा योजना म्याट्रिक्स', 'CBS INTEREST & PRODUCT MATRIX')}
                  </div>
                  <h3 className="font-bold text-sm">
                    {t('सहकारी बचत योजनाहरूको ब्याजदर तथा मापदण्ड निर्धारण', 'Configure Cooperative Savings Products & Rates')}
                  </h3>
                </div>
              </div>
              <button onClick={() => setShowRatesModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {t('सक्रिय बचत योजनाहरू (Active Savings Schemes)', 'Active Savings Schemes')}
                </span>
                <button
                  type="button"
                  onClick={() => setShowNewSchemeForm(!showNewSchemeForm)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition"
                >
                  <PlusCircle className="size-3.5" />
                  <span>{showNewSchemeForm ? t('फारम बन्द गर्नुहोस्', 'Close') : t('+ नयाँ योजना थप्नुहोस्', '+ Add Scheme')}</span>
                </button>
              </div>

              {/* INLINE NEW SCHEME BUILDER */}
              {showNewSchemeForm && (
                <form
                  onSubmit={handleAddCustomScheme}
                  className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3 animate-fade-in"
                >
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    {t('नयाँ बचत योजना सिर्जना फारम (New Savings Scheme)', 'Create New Savings Scheme')}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('योजनाको नाम *', 'Product Scheme Name *')}
                      </label>
                      <input
                        type="text"
                        placeholder="जस्तै: ज्येष्ठ नागरिक सम्मान बचत"
                        value={newSchemeName}
                        onChange={(e) => setNewSchemeName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('ब्याजदर (% p.a.) *', 'Annual Rate (% p.a.) *')}
                      </label>
                      <input
                        type="number"
                        step={0.1}
                        min={1}
                        max={20}
                        value={newSchemeRate}
                        onChange={(e) => setNewSchemeRate(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('ब्याज गणना चक्र *', 'Compounding Frequency *')}
                      </label>
                      <select
                        value={newSchemeCompounding}
                        onChange={(e) => setNewSchemeCompounding(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      >
                        <option value="Daily">{t('दैनिक (Daily)', 'Daily')}</option>
                        <option value="Monthly">{t('मासिक (Monthly)', 'Monthly')}</option>
                        <option value="Quarterly">{t('त्रैमासिक (Quarterly)', 'Quarterly')}</option>
                        <option value="Half-Yearly">{t('अर्धवार्षिक (Half-Yearly)', 'Half-Yearly')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('न्यूनतम मौज्दात (रु.)', 'Minimum Operating Balance')}
                      </label>
                      <input
                        type="number"
                        step={500}
                        min={0}
                        value={newSchemeMinBalance}
                        onChange={(e) => setNewSchemeMinBalance(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowNewSchemeForm(false)}
                      className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      {t('रद्द', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      {t('योजना सुरक्षित गर्नुहोस्', 'Save Scheme')}
                    </button>
                  </div>
                </form>
              )}

              {/* SCHEMES TABLE / CARDS */}
              <div className="space-y-3">
                {rateSchemes.map((r, idx) => {
                  const netYield = (r.rate * 0.95).toFixed(2);
                  return (
                    <div
                      key={r.type}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                          <span>{r.type}</span>
                          <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {r.compounding}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{r.desc}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-3 font-mono">
                          <span>
                            {t('न्यूनतम मौज्दात:', 'Min Bal:')} रु. {fmtCurrency(r.minBalance, true)}
                          </span>
                          <span>•</span>
                          <span>{t('कर कट्टा (TDS): ५%', 'TDS: 5%')}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">{netYield}% {t('करपछिको खुद', 'Net')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setShowRatesModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
              >
                {t('रद्द गर्नुहोस्', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveRates}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
              >
                {t('लागु तथा प्रसारण गर्नुहोस्', 'Apply & Broadcast Rates')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
