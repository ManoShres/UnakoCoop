import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { useCoopStore } from '../../../../store/useCoopStore';
import {
  ServiceCenter,
  CashTransitRecord,
  INITIAL_SERVICE_CENTERS,
  calculateNetworkLiquidity,
  createCashTransitRequest,
  evaluateBranchVaultStatus,
} from '../../../../utils/vaultLiquidity';
import { CashTransitVoucherModal } from './CashTransitVoucherModal';
import {
  Building2,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  ArrowRightLeft,
  Truck,
  PlusCircle,
  CheckCircle2,
  Phone,
  Lock,
  Clock,
  Send,
  X,
  TrendingUp,
  Percent,
  FileText,
} from 'lucide-react';

export const MultiBranchVaultMonitor: React.FC = () => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const { coopSettings } = useCoopStore();

  const [branches, setBranches] = useState<ServiceCenter[]>([...INITIAL_SERVICE_CENTERS]);
  const [commercialBankBalance, setCommercialBankBalance] = useState<number>(6500000);
  const totalMemberSavingsDeposit = 48000000; // NPR 48 Million savings base

  // Cash-in-Transit (CIT) state
  const [transitLogs, setTransitLogs] = useState<CashTransitRecord[]>([
    {
      id: 'CIT-208107-104',
      fromLocation: 'Gadhwa Central Vault (HQ-GDH)',
      toLocation: 'Gobardiha Rural Extension Desk (SC-GBD)',
      amount: 100000,
      initiatedAt: new Date(Date.now() - 3600000).toISOString(),
      custodianName: 'Anita Yadav',
      authorizedBy: 'Bishnu Prasad Sharma (Chief Cashier)',
      securityCarrier: 'Unako Rural CIT Armed Escort Team',
      status: 'IN_TRANSIT',
      verificationOtp: '748291',
      notes: 'Emergency cash replenishment for agricultural loan disbursements',
    },
  ]);

  const [showTransitModal, setShowTransitModal] = useState<boolean>(false);
  const [selectedVoucherRecord, setSelectedVoucherRecord] = useState<CashTransitRecord | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);
  const [transitFrom, setTransitFrom] = useState<string>('HQ-GDH');
  const [transitTo, setTransitTo] = useState<string>('SC-GBD');
  const [transitAmount, setTransitAmount] = useState<number>(150000);
  const [transitCarrier, setTransitCarrier] = useState<string>('Unako Rural CIT Patrol');
  const [transitNotes, setTransitNotes] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);

  const liquidityAnalysis = useMemo(() => {
    return calculateNetworkLiquidity(branches, commercialBankBalance, totalMemberSavingsDeposit);
  }, [branches, commercialBankBalance, totalMemberSavingsDeposit]);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleInitiateTransit = (e: React.FormEvent) => {
    e.preventDefault();
    const fromBranch = branches.find((b) => b.code === transitFrom);
    const toBranch = branches.find((b) => b.code === transitTo);

    if (!fromBranch || !toBranch) return;

    if (fromBranch.currentVaultCash < transitAmount) {
      showToastMsg(
        t(
          'स्रोत शाखाको तिजोरीमा पर्याप्त नगद छैन!',
          'Source branch vault does not have sufficient cash balance!'
        )
      );
      return;
    }

    const record = createCashTransitRequest(
      `${fromBranch.nameNepali} (${fromBranch.code})`,
      `${toBranch.nameNepali} (${toBranch.code})`,
      transitAmount,
      toBranch.custodianName,
      fromBranch.custodianName,
      transitCarrier,
      transitNotes
    );

    // Update branch balances
    setBranches((prev) =>
      prev.map((b) => {
        if (b.code === transitFrom) {
          const newCash = b.currentVaultCash - transitAmount;
          return {
            ...b,
            currentVaultCash: newCash,
            status: evaluateBranchVaultStatus(newCash, b.minReserveLimit, b.maxHoldingCeiling),
          };
        }
        return b;
      })
    );

    setTransitLogs((prev) => [record, ...prev]);
    setShowTransitModal(false);
    setSelectedVoucherRecord(record);
    setShowVoucherModal(true);
    showToastMsg(
      t(
        `नगद ओसारपसार (CIT) आदेश जारी भयो! सुरक्षा कोड: ${record.verificationOtp}`,
        `CIT transit order dispatched! Security OTP: ${record.verificationOtp}`
      )
    );
  };

  const handleConfirmVaulting = (recordId: string) => {
    const record = transitLogs.find((r) => r.id === recordId);
    if (!record || record.status === 'VAULTED') return;

    // Credit destination branch
    setBranches((prev) =>
      prev.map((b) => {
        if (record.toLocation.includes(b.code)) {
          const newCash = b.currentVaultCash + record.amount;
          return {
            ...b,
            currentVaultCash: newCash,
            status: evaluateBranchVaultStatus(newCash, b.minReserveLimit, b.maxHoldingCeiling),
          };
        }
        return b;
      })
    );

    setTransitLogs((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, status: 'VAULTED' } : r))
    );

    showToastMsg(t('नगद प्राप्त भई तिजोरीमा सुरक्षित दाखिला भयो!', 'Cash received and safely vaulted!'));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Top Liquidity Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Physical Vault Cash */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">
              {t('कुल शाखा भौतिक नगद', 'Total Physical Vault Cash')}
            </span>
            <Building2 className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            NPR {fmtCurrency(liquidityAnalysis.totalPhysicalVaultCash, true)}
          </p>
          <span className="text-[11px] text-slate-500 block">
            {branches.length} {t('सेवा केन्द्रहरूको केन्द्रीय तिजोरी', 'Service Center Vaults')}
          </span>
        </div>

        {/* Commercial Bank Current Accounts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">
              {t('वाणिज्य बैंक चल्ती खाता', 'Commercial Bank Accounts')}
            </span>
            <Landmark className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            NPR {fmtCurrency(commercialBankBalance, true)}
          </p>
          <span className="text-[11px] text-slate-500 block">RBB & NIC Asia Lamahi</span>
        </div>

        {/* Consolidated Liquid Assets */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">
              {t('कुल तत्काल तरल सम्पत्ति', 'Consolidated Liquid Assets')}
            </span>
            <TrendingUp className="size-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
            NPR {fmtCurrency(liquidityAnalysis.totalLiquidAssets, true)}
          </p>
          <span className="text-[11px] text-slate-500 block">
            {t('नगद + बैंक मौज्दात योग', 'Vault Cash + Bank Balances')}
          </span>
        </div>

        {/* PEARLS E9 Liquidity Benchmark */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">
              {t('PEARLS तरलता अनुपात (E9)', 'PEARLS Liquidity (E9)')}
            </span>
            <Percent className="size-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {liquidityAnalysis.liquidityRatioPercent}%
            </span>
            <span className="text-[10px] text-slate-400">/ 10% - 15%</span>
          </div>
          <div className="flex items-center gap-1.5">
            {liquidityAnalysis.isPearlsCompliant ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="size-3" />
                {t('वैधानिक मापदण्ड अनुकूल', 'Optimal PEARLS Range')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                <AlertTriangle className="size-3" />
                {liquidityAnalysis.benchmarkStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Table: Service Center Cash Desk Vaults */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              {t('सेवा केन्द्र अनुसार तिजोरी नगद मौज्दात', 'Branch & Service Center Vault Balances')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t(
                'बीमा सीमा तथा न्यूनतम सञ्चितिका आधारमा वास्तविक समयमा तिजोरी निगरानी',
                'Real-time cash vault monitoring against insurance ceilings and min reserve limits'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTransitModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition shrink-0"
          >
            <Truck className="size-4" />
            <span>{t('+ अन्तर-शाखा नगद ओसारपसार (CIT)', '+ Inter-Branch CIT Transfer')}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-400">
              <tr>
                <th className="p-4 font-semibold">{t('सेवा केन्द्र', 'Service Center')}</th>
                <th className="p-4 font-semibold">{t('तिजोरी प्रमुख (Custodian)', 'Vault Custodian')}</th>
                <th className="p-4 font-semibold text-right">{t('हालको मौज्दात', 'Current Vault Cash')}</th>
                <th className="p-4 font-semibold text-right">{t('न्यूनतम सीमा', 'Min Reserve')}</th>
                <th className="p-4 font-semibold text-right">{t('बीमा सीमा (Ceiling)', 'Holding Ceiling')}</th>
                <th className="p-4 font-semibold text-center">{t('अवस्था', 'Health Status')}</th>
                <th className="p-4 font-semibold text-center">{t('कार्य', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {branches.map((b) => {
                const ceilingPercent = Math.min(100, Math.round((b.currentVaultCash / b.maxHoldingCeiling) * 100));
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{b.nameNepali}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {b.code} • {b.address}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{b.custodianName}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Phone className="size-3" /> {b.custodianPhone}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-black text-slate-900 dark:text-white font-mono text-sm">
                        NPR {fmtCurrency(b.currentVaultCash, true)}
                      </div>
                      <div className="w-24 ml-auto mt-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            b.status === 'SURPLUS_WARNING'
                              ? 'bg-amber-500'
                              : b.status === 'DEFICIT_CRITICAL'
                              ? 'bg-rose-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${ceilingPercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono text-slate-500">
                      NPR {fmtCurrency(b.minReserveLimit, true)}
                    </td>
                    <td className="p-4 text-right font-mono text-slate-500">
                      NPR {fmtCurrency(b.maxHoldingCeiling, true)}
                    </td>
                    <td className="p-4 text-center">
                      {b.status === 'NORMAL' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" /> {t('सामान्य (Safe)', 'Normal')}
                        </span>
                      ) : b.status === 'SURPLUS_WARNING' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 animate-pulse">
                          <AlertTriangle className="size-3" /> {t('अत्यधिक मौज्दात', 'Excess Surplus')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 animate-pulse">
                          <AlertTriangle className="size-3" /> {t('न्यून मौज्दात', 'Deficit Critical')}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (b.status === 'SURPLUS_WARNING') {
                            setTransitFrom(b.code);
                            setTransitTo('HQ-GDH');
                            setTransitAmount(b.currentVaultCash - b.maxHoldingCeiling);
                          } else {
                            setTransitFrom('HQ-GDH');
                            setTransitTo(b.code);
                            setTransitAmount(b.minReserveLimit - b.currentVaultCash + 50000);
                          }
                          setShowTransitModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-[11px] transition"
                      >
                        {b.status === 'SURPLUS_WARNING'
                          ? t('बैंक/केन्द्र पठाउनुहोस्', 'Remit to HQ')
                          : t('नगद आपूर्ति (Replenish)', 'Replenish')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash-In-Transit (CIT) Active Movements */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="size-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('सक्रिय नगद ओसारपसार तथा ट्रान्जिट अभिलेख', 'Active Cash-in-Transit (CIT) Movements')}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {transitLogs.length} {t('ट्रान्जिट दर्ता', 'Orders Recorded')}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {transitLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600">{log.id}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    NPR {fmtCurrency(log.amount, true)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'VAULTED'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>{log.fromLocation}</span>
                  <ArrowRightLeft className="size-3 text-slate-400" />
                  <span>{log.toLocation}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {t('सुरक्षा दस्ता:', 'Carrier:')} {log.securityCarrier} • {t('स्वीकृतकर्ता:', 'Authorized:')}{' '}
                  {log.authorizedBy}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">{t('सुरक्षा OTP कोड', 'Security OTP')}</span>
                  <span className="font-mono font-bold text-emerald-600 tracking-widest text-xs">
                    {log.verificationOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVoucherRecord(log);
                    setShowVoucherModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 transition shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="size-3.5 text-blue-500" />
                  <span>{t('भौचर', 'Voucher')}</span>
                </button>
                {log.status === 'IN_TRANSIT' && (
                  <button
                    type="button"
                    onClick={() => handleConfirmVaulting(log.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                  >
                    {t('दाखिला प्रमाणित गर्नुहोस्', 'Verify & Vault')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inter-Branch CIT Dispatch Modal */}
      {showTransitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="size-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {t('नगद ओसारपसार (CIT) आदेश जारी', 'Issue Cash-in-Transit (CIT) Order')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTransitModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateTransit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('स्रोत सेवा केन्द्र (From)', 'Source Location')}
                  </label>
                  <select
                    value={transitFrom}
                    onChange={(e) => setTransitFrom(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    {branches.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.nameNepali} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {t('गन्तव्य केन्द्र (To)', 'Destination Location')}
                  </label>
                  <select
                    value={transitTo}
                    onChange={(e) => setTransitTo(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    {branches.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.nameNepali} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t('स्थानान्तरण रकम (NPR)', 'Transfer Amount (NPR)')}
                </label>
                <input
                  type="number"
                  value={transitAmount}
                  onChange={(e) => setTransitAmount(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t('सुरक्षा दस्ता / ओसारपसार टोली', 'Security Escort / Carrier')}
                </label>
                <input
                  type="text"
                  value={transitCarrier}
                  onChange={(e) => setTransitCarrier(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t('कैफियत / प्रयोजन', 'Notes / Purpose')}
                </label>
                <input
                  type="text"
                  value={transitNotes}
                  onChange={(e) => setTransitNotes(e.target.value)}
                  placeholder={t('जस्तै: कृषि कर्जा प्रवाहका लागि मौज्दात आपूर्ति', 'e.g. Agricultural loan disbursement replenishment')}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransitModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                >
                  {t('आदेश जारी गर्नुहोस्', 'Dispatch CIT Order')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cash-in-Transit Movement Security Voucher Modal */}
      <CashTransitVoucherModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        record={selectedVoucherRecord}
        coopSettings={coopSettings}
      />
    </div>
  );
};
