import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  MOCK_TELLER_SESSION,
  DENOMINATION_MULTIPLIERS,
  calculatePhysicalTotal,
  reconcileDrawerSession,
} from '../../utils/tellerOperations';
import { DenominationBreakdown, DrawerStatus } from '../../types';
import {
  Banknote,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Printer,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const TellerCounterPage: React.FC = () => {
  const { t, fmtCurrency, fmtCount, fmtDigits } = useLanguageStore();

  const [session, setSession] = useState(MOCK_TELLER_SESSION);
  const [denoms, setDenoms] = useState<DenominationBreakdown>(MOCK_TELLER_SESSION.denominations);
  const [openingFloat, setOpeningFloat] = useState(MOCK_TELLER_SESSION.openingFloat);
  const [cashReceived, setCashReceived] = useState(MOCK_TELLER_SESSION.cashReceived);
  const [cashDisbursed, setCashDisbursed] = useState(MOCK_TELLER_SESSION.cashDisbursed);
  const [witnessName, setWitnessName] = useState(MOCK_TELLER_SESSION.vaultHandoverWitness ?? '');
  const [isClosed, setIsClosed] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Recalculate drawer reconciliation dynamically
  const reconciliation = useMemo(() => {
    return reconcileDrawerSession(openingFloat, cashReceived, cashDisbursed, denoms);
  }, [openingFloat, cashReceived, cashDisbursed, denoms]);

  const handleDenomChange = (key: keyof DenominationBreakdown, count: number) => {
    if (isClosed) return;
    setDenoms((prev) => ({
      ...prev,
      [key]: Math.max(0, count || 0),
    }));
  };

  const handleQuickAdd = (key: keyof DenominationBreakdown, add: number) => {
    if (isClosed) return;
    setDenoms((prev) => ({
      ...prev,
      [key]: prev[key] + add,
    }));
  };

  const resetToZero = () => {
    if (isClosed) return;
    setDenoms({
      n1000: 0,
      n500: 0,
      n100: 0,
      n50: 0,
      n20: 0,
      n10: 0,
      n5: 0,
      n2: 0,
      n1: 0,
      coins: 0,
    });
  };

  const fillExactMatch = () => {
    if (isClosed) return;
    setDenoms(MOCK_TELLER_SESSION.denominations);
    setOpeningFloat(MOCK_TELLER_SESSION.openingFloat);
    setCashReceived(MOCK_TELLER_SESSION.cashReceived);
    setCashDisbursed(MOCK_TELLER_SESSION.cashDisbursed);
  };

  const handleCloseDrawer = () => {
    setIsClosed(true);
    setSession((prev) => ({
      ...prev,
      actualBalance: reconciliation.actualBalance,
      expectedBalance: reconciliation.expectedBalance,
      variance: reconciliation.variance,
      status: reconciliation.variance === 0 ? 'CLOSED_TO_VAULT' : 'DISCREPANCY',
      vaultHandoverWitness: witnessName,
      closedAt: new Date().toISOString(),
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                {t('काउन्टर तथा भल्ट नगद व्यवस्थापन', 'Teller & Vault Cash Desk')}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                <ShieldCheck className="size-3" />
                {t('दोहोरो नियन्त्रण (Dual Control)', 'Dual Control Verified')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('काउन्टर नगद मिलान तथा दैनिक बन्द (Day-End Balancing)', 'Teller Cash Drawer & Day-End Balancing')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {session.branch} • {session.tellerName} • {t('मिति:', 'Date:')}{' '}
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{fmtDigits(session.sessionDate)} B.S.</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fillExactMatch}
              disabled={isClosed}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all disabled:opacity-50"
              title={t('नमूना हिसाब भर्नुहोस्', 'Load verified demo balance')}
            >
              <Sparkles className="size-3.5 text-amber-500" />
              <span>{t('नमूना लोड', 'Load Demo')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="size-3.5" />
              <span>{t('भौचर छाप्नुहोस्', 'Print Slip')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Denominations on Left, Reconciliation Balance on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Denomination Calculator (8 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="size-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('भौतिक नोट गन्ती तालिका (Banknote Tally Sheet)', 'Banknote & Coin Denomination Tally')}
                </h3>
              </div>
              <button
                type="button"
                onClick={resetToZero}
                disabled={isClosed}
                className="text-xs font-bold text-rose-500 hover:underline inline-flex items-center gap-1 disabled:opacity-40"
              >
                <RotateCcw className="size-3" />
                <span>{t('सबै शून्य बनाउनुहोस्', 'Reset All')}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {(
                [
                  { key: 'n1000', label: 'रु. १०००', val: 1000, color: 'text-indigo-600 dark:text-indigo-400' },
                  { key: 'n500', label: 'रु. ५००', val: 500, color: 'text-amber-600 dark:text-amber-400' },
                  { key: 'n100', label: 'रु. १००', val: 100, color: 'text-emerald-600 dark:text-emerald-400' },
                  { key: 'n50', label: 'रु. ५०', val: 50, color: 'text-blue-600 dark:text-blue-400' },
                  { key: 'n20', label: 'रु. २०', val: 20, color: 'text-teal-600 dark:text-teal-400' },
                  { key: 'n10', label: 'रु. १०', val: 10, color: 'text-slate-600 dark:text-slate-300' },
                  { key: 'n5', label: 'रु. ५', val: 5, color: 'text-slate-600 dark:text-slate-300' },
                  { key: 'n2', label: 'रु. २', val: 2, color: 'text-slate-600 dark:text-slate-300' },
                  { key: 'n1', label: 'रु. १', val: 1, color: 'text-slate-600 dark:text-slate-300' },
                  { key: 'coins', label: 'सिक्का (Coins)', val: 1, color: 'text-slate-500' },
                ] as const
              ).map(({ key, label, val, color }) => {
                const count = denoms[key];
                const subtotal = count * val;
                return (
                  <div
                    key={key}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="w-24">
                      <span className={`text-xs font-black ${color}`}>{label}</span>
                      <p className="text-[10px] text-slate-400">× {t('रु.', 'NPR')} {fmtDigits(val)}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={count === 0 ? '' : count}
                        placeholder="0"
                        disabled={isClosed}
                        onChange={(e) => handleDenomChange(key, parseInt(e.target.value || '0', 10))}
                        className="w-24 px-3 py-1.5 text-center font-mono font-bold text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                      />
                      <span className="text-[10px] text-slate-400">{t('थान', 'pcs')}</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(key, 10)}
                        disabled={isClosed}
                        className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 disabled:opacity-30"
                      >
                        +{fmtDigits(10)}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(key, 50)}
                        disabled={isClosed}
                        className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 disabled:opacity-30"
                      >
                        +{fmtDigits(50)}
                      </button>
                    </div>

                    <div className="w-28 text-right font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {fmtCurrency(subtotal, true)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Counted Footnote */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">
                {t('गन्ती अनुसार कुल भौतिक नगद', 'Total Physical Cash Counted')}
              </span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {fmtCurrency(reconciliation.actualBalance, true)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Ledger Balancing & Day-End Vault Handover (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Balancing Audit Card */}
          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('दैनिक नगद मिलान हिसाब (Cash Ledger Balancing)', 'Cash Ledger Balancing')}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">{t('बिहानी भल्ट मौज्दात (Opening Float)', 'Opening Vault Float')}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {fmtCurrency(openingFloat, true)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-emerald-600 font-bold">{t('+ आजको नगद संकलन (Cash Receipts)', '+ Cash Received')}</span>
                <span className="font-mono font-bold text-emerald-600">
                  +{fmtCurrency(cashReceived, true)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-rose-600 font-bold">{t('- आजको नगद भुक्तानी (Cash Payments)', '- Cash Disbursed')}</span>
                <span className="font-mono font-bold text-rose-600">
                  -{fmtCurrency(cashDisbursed, true)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  {t('सफ्टवेयर अनुसार हुनुपर्ने मौज्दात', 'Expected Cash Balance')}
                </span>
                <span className="font-mono text-slate-900 dark:text-white text-sm">
                  {fmtCurrency(reconciliation.expectedBalance, true)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between font-bold">
                <span className="text-emerald-800 dark:text-emerald-300">
                  {t('भौतिक दराजमा गनेको नगद', 'Actual Physical Cash')}
                </span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                  {fmtCurrency(reconciliation.actualBalance, true)}
                </span>
              </div>

              {/* Discrepancy / Balanced Alert Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  reconciliation.variance === 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                    : reconciliation.variance > 0
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-800 dark:text-blue-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
                }`}
              >
                {reconciliation.variance === 0 ? (
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="size-5 shrink-0 text-rose-600 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-xs">
                    {reconciliation.variance === 0
                      ? t('नगद ठ्याक्कै मिलान भयो (Balanced)', 'Cash Drawer Perfectly Balanced')
                      : reconciliation.variance > 0
                      ? t('नगद बचत (Cash Surplus)', 'Cash Surplus Detected')
                      : t('नगद घाटा (Cash Shortage)', 'Cash Shortage Detected')}
                  </h4>
                  <p className="text-[11px] font-mono mt-0.5">
                    {t('फरक रकम (Variance):', 'Variance:')}{' '}
                    {reconciliation.variance === 0
                      ? 'NPR 0.00'
                      : fmtCurrency(reconciliation.variance, true)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dual Control Sign-off & Vault Handover */}
          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="size-4 text-amber-500" />
              <span>{t('दैनिक काउन्टर बन्द र भल्ट दाखिला', 'Day-End Closing & Vault Handover')}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">
                  {t('नगद जिम्मा लिने अधिकृत / साक्षी (Witness / Vault Custodian)', 'Witness / Vault Custodian')}
                </label>
                <input
                  type="text"
                  value={witnessName}
                  disabled={isClosed}
                  onChange={(e) => setWitnessName(e.target.value)}
                  placeholder="e.g. Shyam Sundar Shrestha (Branch Manager)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {isClosed ? (
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-center font-bold text-slate-500 text-xs">
                  {t('काउन्टर बन्द भइसकेको छ। भल्टमा रकम दाखिला सम्पन्न भयो।', 'Counter is officially closed for the day.')}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  disabled={!witnessName}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
                >
                  {t('काउन्टर बन्द गरी भल्टमा बुझाउनुहोस्', 'Close Counter & Transfer to Vault')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Slip Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                उनको बचत तथा ऋण सहकारी संस्था लि.
              </h3>
              <p className="text-xs text-slate-500">चाबहिल, काठमाडौं • दैनिक काउन्टर नगद मिलान भौचर</p>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">मिति (BS):</span>
                <span className="font-bold">{session.sessionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">क्यासियर (Teller):</span>
                <span className="font-bold">{session.tellerName.split('(')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">सफ्टवेयर मौज्दात:</span>
                <span className="font-bold">{fmtCurrency(reconciliation.expectedBalance, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">गनेको भौतिक नगद:</span>
                <span className="font-bold text-emerald-600">{fmtCurrency(reconciliation.actualBalance, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">फरक रकम (Variance):</span>
                <span className="font-bold">{reconciliation.variance === 0 ? 'NPR 0.00' : fmtCurrency(reconciliation.variance, true)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                {t('बन्द गर्नुहोस्', 'Close')}
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                {t('प्रिन्ट गर्नुहोस्', 'Print Now')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
