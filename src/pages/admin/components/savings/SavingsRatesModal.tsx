import React, { useState } from 'react';
import { X, Sliders, PlusCircle } from 'lucide-react';
import { RateSchemeConfig } from './SavingsTypes';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface SavingsRatesModalProps {
  rateSchemes: RateSchemeConfig[];
  onClose: () => void;
  onSaveRates: (schemes: RateSchemeConfig[]) => void;
  onAddCustomScheme: (scheme: RateSchemeConfig) => void;
}

export function SavingsRatesModal({
  rateSchemes: initialSchemes,
  onClose,
  onSaveRates,
  onAddCustomScheme,
}: SavingsRatesModalProps) {
  const { t, fmtCurrency } = useLanguageStore();
  const [rateSchemes, setRateSchemes] = useState<RateSchemeConfig[]>(initialSchemes);
  const [showNewSchemeForm, setShowNewSchemeForm] = useState(false);
  const [newSchemeName, setNewSchemeName] = useState('');
  const [newSchemeRate, setNewSchemeRate] = useState(9.5);
  const [newSchemeCompounding, setNewSchemeCompounding] = useState<'Daily' | 'Monthly' | 'Quarterly' | 'Half-Yearly'>('Quarterly');
  const [newSchemeMinBalance, setNewSchemeMinBalance] = useState(1000);

  const handleAddSubmit = (e: React.FormEvent) => {
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
    onAddCustomScheme(newScheme);
    setNewSchemeName('');
    setShowNewSchemeForm(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRates(rateSchemes);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
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
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
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
              onSubmit={handleAddSubmit}
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
                    onChange={(e) => setNewSchemeCompounding(e.target.value as 'Daily' | 'Monthly' | 'Quarterly' | 'Half-Yearly')}
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
                        next[idx] = { ...next[idx], rate: Number(e.target.value) };
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
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
          >
            {t('रद्द गर्नुहोस्', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
          >
            {t('लागु तथा प्रसारण गर्नुहोस्', 'Apply & Broadcast Rates')}
          </button>
        </div>
      </div>
    </div>
  );
}
