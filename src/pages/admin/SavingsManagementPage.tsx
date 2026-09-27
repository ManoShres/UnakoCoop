import React, { useState, useEffect } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { SavingsAccount } from '../../types';
import { useLanguageStore } from '../../store/useLanguageStore';
import { CheckCircle2 } from 'lucide-react';
import { RateSchemeConfig } from './components/savings/SavingsTypes';
import { SavingsHeaderBanner } from './components/savings/SavingsHeaderBanner';
import { SavingsStatsMosaic } from './components/savings/SavingsStatsMosaic';
import { SavingsAccountsTable } from './components/savings/SavingsAccountsTable';
import { SavingsAdjustModal } from './components/savings/SavingsAdjustModal';
import { SavingsRatesModal } from './components/savings/SavingsRatesModal';
import { DepositCeilingModal } from '../../components/admin/DepositCeilingModal';

export function SavingsManagementPage() {
  const { savings, adjustSavingsBalance, updateSavingsRate, members } = useCoopStore();
  const { t, fmtCurrency } = useLanguageStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAcct, setSelectedAcct] = useState<SavingsAccount | null>(null);
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [showCeilingModal, setShowCeilingModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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

  useEffect(() => {
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

  const handleAdjustSubmit = (
    adjustAmount: number,
    adjustType: 'DEPOSIT' | 'WITHDRAWAL',
    voucherNo: string,
    reasonCategory: string,
    note: string
  ) => {
    if (!selectedAcct || adjustAmount <= 0) return;

    const fullAuditNote = `[${voucherNo}] [${reasonCategory}] ${note.trim()}`;
    adjustSavingsBalance(selectedAcct.accountNo, adjustAmount, adjustType, fullAuditNote);
    showToastMsg(
      t(
        `${adjustType === 'DEPOSIT' ? 'जम्मा' : 'डेबिट'} रु. ${fmtCurrency(adjustAmount, true)} खाता नं. ${selectedAcct.accountNo} मा सफलतापूर्वक प्रविष्टि भयो! (भौचर: ${voucherNo})`,
        `${adjustType === 'DEPOSIT' ? 'Deposit of' : 'Debit of'} NPR ${fmtCurrency(adjustAmount, true)} applied to ${selectedAcct.accountNo}! (Voucher: ${voucherNo})`
      )
    );
    setSelectedAcct(null);
  };

  const handleAddCustomScheme = (newScheme: RateSchemeConfig) => {
    setRateSchemes((prev) => [...prev, newScheme]);
    updateSavingsRate(newScheme.type, newScheme.rate);
    showToastMsg(t(`नयाँ बचत योजना "${newScheme.type}" थप भयो!`, `New savings product "${newScheme.type}" added!`));
  };

  const handleSaveRates = (updatedSchemes: RateSchemeConfig[]) => {
    setRateSchemes(updatedSchemes);
    updatedSchemes.forEach((r) => {
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
      <SavingsHeaderBanner
        onOpenRatesModal={() => setShowRatesModal(true)}
        onOpenDepositCeilingModal={() => setShowCeilingModal(true)}
      />

      {/* Stats Mosaic */}
      <SavingsStatsMosaic totalDeposits={totalDeposits} activeAccountsCount={savings.length} />

      {/* Accounts Table */}
      <SavingsAccountsTable
        accounts={filteredAccounts}
        members={members}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectAccount={setSelectedAcct}
      />

      {/* Adjust Balance Modal */}
      {selectedAcct && (
        <SavingsAdjustModal
          account={selectedAcct}
          members={members}
          onClose={() => setSelectedAcct(null)}
          onSubmit={handleAdjustSubmit}
        />
      )}

      {/* Rates Modal */}
      {showRatesModal && (
        <SavingsRatesModal
          rateSchemes={rateSchemes}
          onClose={() => setShowRatesModal(false)}
          onSaveRates={handleSaveRates}
          onAddCustomScheme={handleAddCustomScheme}
        />
      )}

      {/* Section 49 Deposit Ceiling (15x Core Capital) & Concentration Risk Modal */}
      <DepositCeilingModal
        isOpen={showCeilingModal}
        onClose={() => setShowCeilingModal(false)}
        savings={savings}
        members={members}
      />
    </div>
  );
}
