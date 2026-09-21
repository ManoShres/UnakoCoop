import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { GatewayRail } from '../../types';
import {
  ArrowLeftRight,
  Search,
  CheckCircle2,
  Zap,
  Building,
  QrCode,
  X,
  CreditCard,
  Wallet,
} from 'lucide-react';

export function TransfersManagementPage() {
  const { transactions, gatewayRails, toggleGatewayRail, updateGatewayLimit } = useCoopStore();
  const { t } = useLanguageStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<GatewayRail | null>(null);
  const [newLimit, setNewLimit] = useState<number>(100000);
  const [toast, setToast] = useState<string | null>(null);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filteredTx = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGateway) return;
    updateGatewayLimit(selectedGateway.id, newLimit);
    showToastMsg(
      t(
        `गेटवे ${selectedGateway.name} को दैनिक सीमा रु. ${newLimit.toLocaleString()} मा अद्यावधिक भयो!`,
        `Gateway ${selectedGateway.name} limit updated to NPR ${newLimit.toLocaleString()}!`
      )
    );
    setSelectedGateway(null);
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
            <ArrowLeftRight className="size-4" />
            <span>{t('भुक्तानी प्रणाली तथा फर्स्यौट इन्जिन', 'PAYMENT RAILS & SETTLEMENT ENGINE')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('अन्तर-खाता रकम ट्रान्सफर, भुक्तानी तथा गेटवे व्यवस्थापन', 'Transfers, Payments & Gateways Suite')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'वास्तविक समयको सीबीएस लेजर फर्स्यौट, राष्ट्रिय भुक्तानी स्विच र सदस्य कारोबार सीमा व्यवस्थापन।',
              'Monitor real-time CBS ledger settlement, configure national payment switches, and set inter-member transaction thresholds.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <Zap className="size-3.5" />
            <span>{t('आरटिजियस प्रणाली: ०% अतिरिक्त शुल्क', 'RTGS Rail: 0% Surcharge')}</span>
          </span>
        </div>
      </div>

      {/* Payment Gateway Rails Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="size-4 text-blue-500" />
            <span>{t('एकीकृत डिजिटल भुक्तानी गेटवे तथा वालेट स्विचहरू', 'Integrated Gateway Switches & Digital Rails')}</span>
          </h3>
          <span className="text-xs text-slate-400">{t('नेपालपे / फोनपे प्रमाणीकरण प्राप्त', 'NCHL / NepalPay / Fonepay Certified')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gatewayRails.map((gw) => (
            <div
              key={gw.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600">
                    {gw.type === 'WALLET' ? (
                      <Wallet className="size-5" />
                    ) : gw.type === 'QR' ? (
                      <QrCode className="size-5" />
                    ) : (
                      <Building className="size-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{gw.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{gw.reconciliationCycle}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextStatus = gw.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
                    toggleGatewayRail(gw.id, nextStatus);
                    showToastMsg(
                      t(
                        `${gw.name} लाई ${nextStatus === 'ACTIVE' ? 'सक्रिय' : 'मर्मतमा'} राखियो!`,
                        `${gw.name} set to ${nextStatus}!`
                      )
                    );
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                    gw.status === 'ACTIVE'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {gw.status === 'ACTIVE' ? t('सक्रिय', 'ACTIVE') : t('मर्मतमा', 'MAINTENANCE')}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">{t('दैनिक सीमा:', 'Daily Limit:')}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    रु. {gw.dailyLimit.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedGateway(gw);
                    setNewLimit(gw.dailyLimit);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition"
                >
                  {t('सीमा सम्पादन', 'Edit Limit')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Audit Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('प्रत्यक्ष कारोबार अडिट विवरण', 'Live Transactions Audit Trail')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('सबै अन्तर-सदस्य भुक्तानी तथा गेटवे लोड भौचरहरू', 'All inter-member RTGS settlements and gateway topup vouchers')}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('भौचर नं., विवरणबाट खोज्नुहोस्...', 'Search reference, description...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">{t('मिति र भौचर नं.', 'Date & Ref')}</th>
                <th className="py-2.5 px-3">{t('प्रकार', 'Type')}</th>
                <th className="py-2.5 px-3">{t('विवरण', 'Description')}</th>
                <th className="py-2.5 px-3 text-right">{t('रकम (रु.)', 'Amount (NPR)')}</th>
                <th className="py-2.5 px-3 text-center">{t('स्थिति', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-white">{tx.date}</div>
                    <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400">{tx.referenceNo}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                    {tx.description}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    रु. {tx.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      {tx.status === 'COMPLETED' ? t('सम्पन्न', 'COMPLETED') : tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT GATEWAY MODAL */}
      {selectedGateway && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedGateway(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">
                {t('गेटवे सीमा व्यवस्थापन', 'Configure')}: {selectedGateway.name}
              </h3>
              <button onClick={() => setSelectedGateway(null)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGateway} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('दैनिक कारोबार सीमा (रु.)', 'Daily Transfer Limit (NPR)')}
                </label>
                <input
                  type="number"
                  step={10000}
                  value={newLimit}
                  onChange={(e) => setNewLimit(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedGateway(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('सीमा सुरक्षित गर्नुहोस्', 'Save Limit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
