import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  Lock,
  X,
  User,
  Search,
  CheckCircle2,
  Calendar,
  Percent,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import type { Member } from '../../types';

interface OpenFixedDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  preselectedTenure?: string;
}

interface FdScheme {
  id: string;
  name: string;
  nameNepali: string;
  years: number;
  rate: number;
  minAmount: number;
}

const FD_SCHEMES: FdScheme[] = [
  { id: 'fd-1y', name: 'Fixed Deposit (1 Year)', nameNepali: '१ वर्ष मुद्दती निक्षेप', years: 1, rate: 10.0, minAmount: 25000 },
  { id: 'fd-2y', name: 'Fixed Deposit (2 Years)', nameNepali: '२ वर्ष मुद्दती निक्षेप', years: 2, rate: 10.75, minAmount: 50000 },
  { id: 'fd-3y', name: 'Fixed Deposit (3 Years)', nameNepali: '३ वर्ष मुद्दती निक्षेप', years: 3, rate: 11.25, minAmount: 50000 },
  { id: 'fd-5y', name: 'Fixed Deposit (5 Years)', nameNepali: '५ वर्ष मुद्दती निक्षेप', years: 5, rate: 12.0, minAmount: 100000 },
];

export function OpenFixedDepositModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedTenure,
}: OpenFixedDepositModalProps) {
  const { members, addSavingsAccount, addTransaction } = useCoopStore();
  const { t, fmtCurrency, fmtPhone, fmtDigits, fmtPercent } = useLanguageStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(() => {
    return members.length > 0 ? members[0] : null;
  });

  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(() => {
    if (preselectedTenure) {
      const match = FD_SCHEMES.find((s) => s.name.includes(preselectedTenure) || s.nameNepali.includes(preselectedTenure));
      if (match) return match.id;
    }
    return FD_SCHEMES[0].id;
  });

  const currentScheme = FD_SCHEMES.find((s) => s.id === selectedSchemeId) || FD_SCHEMES[0];
  const [depositAmount, setDepositAmount] = useState<number>(currentScheme.minAmount);
  const [payoutFreq, setPayoutFreq] = useState<'MATURITY' | 'QUARTERLY' | 'MONTHLY'>('MATURITY');
  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  const [sourceOfFunds, setSourceOfFunds] = useState<string>('व्यापार / उद्यम (Business)');
  const [openDateBs] = useState<string>('2081-11-15');

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Maturity calculation
  const principal = Math.max(0, depositAmount);
  const rate = currentScheme.rate;
  const tenureYears = currentScheme.years;
  const grossInterest = Math.round((principal * rate * tenureYears) / 100);
  const tdsDeduction = Math.round(grossInterest * 0.05); // 5% statutory TDS in Nepal
  const netMaturityValue = principal + grossInterest - tdsDeduction;

  // Maturity date calculation (rough BS year increment)
  const [y, m, d] = openDateBs.split('-').map(Number);
  const maturityDateBs = `${y + tenureYears}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.memberNo.toLowerCase().includes(q) ||
      m.phone.includes(q)
    );
  });

  const handleSelectScheme = (scheme: FdScheme) => {
    setSelectedSchemeId(scheme.id);
    if (depositAmount < scheme.minAmount) {
      setDepositAmount(scheme.minAmount);
    }
  };

  const handleAddAmount = (add: number) => {
    setDepositAmount((prev) => prev + add);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      alert(t('कृपया सदस्य चयन गर्नुहोस्।', 'Please select a member.'));
      return;
    }
    if (depositAmount < currentScheme.minAmount) {
      alert(
        t(
          `न्यूनतम जम्मा रकम रु. ${fmtCurrency(currentScheme.minAmount, true)} हुनुपर्दछ।`,
          `Minimum deposit amount for this scheme is NPR ${fmtCurrency(currentScheme.minAmount, true)}.`
        )
      );
      return;
    }

    const newAccountNo = `UKO-FD-2081-${Math.floor(1000 + Math.random() * 9000)}`;

    addSavingsAccount({
      memberId: selectedMember.id,
      accountNo: newAccountNo,
      accountType: currentScheme.name,
      balance: depositAmount,
      interestRate: currentScheme.rate,
      openedDate: openDateBs,
      maturityDate: maturityDateBs,
      status: 'ACTIVE',
    });

    addTransaction({
      memberId: selectedMember.id,
      type: 'DEPOSIT',
      description: `Open Fixed Deposit (${currentScheme.nameNepali}) - Acct #${newAccountNo}`,
      amount: depositAmount,
      referenceNo: `VCH-FD-${Math.floor(10000 + Math.random() * 90000)}`,
    });

    onSuccess(
      t(
        `सदस्य ${selectedMember.name} को नाममा रु. ${fmtCurrency(depositAmount, true)} को मुद्दती खाता #${newAccountNo} (${currentScheme.nameNepali}) सफलतापूर्वक खोलियो!`,
        `Successfully opened Fixed Deposit Account #${newAccountNo} for ${selectedMember.name} with NPR ${fmtCurrency(depositAmount, true)}!`
      )
    );
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="open-fd-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <Lock className="size-5 text-emerald-300" />
            </div>
            <div>
              <h3 id="open-fd-title" className="font-black text-sm tracking-tight">
                {t('नयाँ मुद्दती निक्षेप (FD) खाता खोल्ने फारम', 'Open New Fixed Deposit (FD) Account')}
              </h3>
              <p className="text-[11px] text-emerald-100">
                {t('उच्च प्रतिफल सुनिश्चित मुद्दती बचत योजना', 'High Yield Term Deposit Guaranteed Scheme')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('बन्द गर्नुहोस्', 'Close')}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Member Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="size-3.5 text-emerald-600" />
              <span>{t('सदस्य चयन गर्नुहोस् *', 'Select Member *')}</span>
            </label>

            {selectedMember ? (
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{selectedMember.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold">
                        {fmtDigits(selectedMember.memberNo)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {t('फोन:', 'Phone:')} {fmtPhone(selectedMember.phone)} | {t('हकवाला:', 'Nominee:')}{' '}
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {selectedMember.nominee?.name || t('उल्लेख छैन', 'Not Listed')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-bold underline px-2 py-1"
                >
                  {t('परिवर्तन', 'Change')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="size-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('नाम, सदस्य नम्बर वा फोन नम्बर टाइप गर्नुहोस्...', 'Search by name, member no, or phone...')}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    autoFocus
                  />
                </div>

                <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMembers.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMember(m);
                        setSearchQuery('');
                      }}
                      className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white mr-2">{m.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({fmtDigits(m.memberNo)})</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{fmtPhone(m.phone)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scheme Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Percent className="size-3.5 text-emerald-600" />
              <span>{t('मुद्दती योजना तथा अवधि छनोट गर्नुहोस् *', 'Select Fixed Deposit Scheme & Term *')}</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {FD_SCHEMES.map((scheme) => (
                <div
                  key={scheme.id}
                  onClick={() => handleSelectScheme(scheme)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-center ${
                    selectedSchemeId === scheme.id
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-xs font-black text-slate-900 dark:text-white">{scheme.nameNepali}</div>
                  <div className="text-xl font-black font-mono text-emerald-600 mt-1">{fmtPercent(scheme.rate)}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {t('न्यूनतम:', 'Min: ')}{fmtCurrency(scheme.minAmount, true)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Principal Deposit Amount */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('मुद्दती जम्मा गर्ने रकम (NPR) *', 'Deposit Principal Amount (NPR) *')}
              </label>
              <span className="text-[11px] text-slate-400">
                {t('न्यूनतम सीमा:', 'Minimum required: ')}{fmtCurrency(currentScheme.minAmount, true)}
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="number"
                min={currentScheme.minAmount}
                step={5000}
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-mono font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />

              <div className="flex flex-wrap gap-1.5">
                {[25000, 50000, 100000, 500000, 1000000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => handleAddAmount(quick)}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                  >
                    +{fmtCurrency(quick, true)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Maturity Math Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-300 dark:border-emerald-800 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-emerald-200 dark:border-emerald-800/60">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="size-4 text-emerald-600" />
                <span>{t('परिपक्व हुने मिति:', 'Maturity Date:')}</span>
              </span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{fmtDigits(maturityDateBs)} B.S.</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">{t('मूलधन', 'Principal')}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">{fmtCurrency(principal, true)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{t('कुल ब्याज', 'Gross Interest')}</span>
                <span className="font-mono font-bold text-emerald-600">+{fmtCurrency(grossInterest, true)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{t('५% TDS कर कट्टी', '5% Govt TDS')}</span>
                <span className="font-mono font-bold text-rose-500">-{fmtCurrency(tdsDeduction, true)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{t('खुद प्रतिफल', 'Net Maturity Value')}</span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">{fmtCurrency(netMaturityValue, true)}</span>
              </div>
            </div>
          </div>

          {/* Options: Payout Frequency & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('ब्याज भुक्तानी तरिका', 'Payout Frequency')}
              </label>
              <select
                value={payoutFreq}
                onChange={(e) => setPayoutFreq(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              >
                <option value="MATURITY">{t('परिपक्वतामा एकमुष्ठ', 'Cumulative at Maturity')}</option>
                <option value="QUARTERLY">{t('त्रैमासिक ब्याज भुक्तानी', 'Quarterly Payout')}</option>
                <option value="MONTHLY">{t('मासिक ब्याज भुक्तानी', 'Monthly Payout')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('स्रोत खुलाउने', 'Source of Funds (AML)')}
              </label>
              <select
                value={sourceOfFunds}
                onChange={(e) => setSourceOfFunds(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              >
                <option value="व्यापार / उद्यम (Business)">{t('व्यापार / उद्यम', 'Business')}</option>
                <option value="तलब / ज्याला (Salary/Wages)">{t('तलब / ज्याला', 'Salary')}</option>
                <option value="वैदेशिक रोजगार (Remittance)">{t('वैदेशिक रोजगार', 'Remittance')}</option>
                <option value="कृषि तथा पशुपालन (Agriculture)">{t('कृषि तथा पशुपालन', 'Agriculture')}</option>
                <option value="उपदान / निवृत्तिभरण (Pension/Retirement)">{t('उपदान / निवृत्तिभरण', 'Pension')}</option>
              </select>
            </div>
          </div>

          {/* Auto Renewal Toggle */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="size-4 text-emerald-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('स्वचालित मुद्दती नवीकरण', 'Auto-Renewal on Maturity')}
                </div>
                <div className="text-[10px] text-slate-400">
                  {t('म्याद सकिएपछि स्वतः सोही अवधि र प्रचलित दरमा नवीकरण गर्ने', 'Roll over principal & interest at prevailing rate')}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoRenew(!autoRenew)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                autoRenew ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {autoRenew ? t('खुला', 'ON') : t('बन्द', 'OFF')}
            </button>
          </div>

          {/* Security & Statutory Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
            <span>
              {t(
                'मुद्दती निक्षेप प्रमाणपत्र सहकारी ऐन २०७४ बमोजिम संरक्षित तथा ऋण सुरक्षण कोषसँग आवद्ध छ।',
                'Fixed Deposit Certificate protected under Nepal Cooperative Act 2074 with statutory reserve backing.'
              )}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition"
            >
              <CheckCircle2 className="size-4" />
              <span>{t('मुद्दती खाता खोल्नुहोस्', 'Open FD Account')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
