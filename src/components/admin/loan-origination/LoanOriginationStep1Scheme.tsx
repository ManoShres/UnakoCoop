import React from 'react';
import { Calculator, Search } from 'lucide-react';
import { Member, LoanType, LOAN_SCHEMES, LoanApplication } from '../../../types';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface LoanOriginationStep1SchemeProps {
  selectedMemberId: string;
  onSelectedMemberIdChange: (id: string) => void;
  selectedMember?: Member;
  memberSearchQuery: string;
  onMemberSearchQueryChange: (q: string) => void;
  filteredMembers: Member[];
  loanType: LoanType;
  onSchemeChange: (scheme: LoanApplication['loanType']) => void;
  requestedAmount: number;
  onRequestedAmountChange: (amount: number) => void;
  tenureMonths: number;
  onTenureMonthsChange: (months: number) => void;
  interestRate: number;
  onInterestRateChange: (rate: number) => void;
  monthlyIncome: number;
  onMonthlyIncomeChange: (income: number) => void;
  purpose: string;
  onPurposeChange: (purpose: string) => void;
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  serviceFee: number;
}

export const LoanOriginationStep1Scheme: React.FC<LoanOriginationStep1SchemeProps> = ({
  selectedMemberId,
  onSelectedMemberIdChange,
  selectedMember,
  memberSearchQuery,
  onMemberSearchQueryChange,
  filteredMembers,
  loanType,
  onSchemeChange,
  requestedAmount,
  onRequestedAmountChange,
  tenureMonths,
  onTenureMonthsChange,
  interestRate,
  onInterestRateChange,
  monthlyIncome,
  onMonthlyIncomeChange,
  purpose,
  onPurposeChange,
  monthlyEmi,
  totalInterest,
  totalPayable,
  serviceFee,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtPercent, fmtCount } = useLanguageStore();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Member Picker */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {t('आवेदक सदस्य चयन *', 'Select Applicant Member *')}
          </label>
          <span className="text-[11px] text-slate-400">
            {fmtCount(filteredMembers.length)} {t('सदस्यहरू उपलब्ध', 'members available')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={t('नाम, सदस्य नं. वा फोनबाट खोज्नुहोस्...', 'Search name, member no, phone...')}
              value={memberSearchQuery}
              onChange={(e) => onMemberSearchQueryChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <select
            value={selectedMemberId}
            onChange={(e) => onSelectedMemberIdChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          >
            {filteredMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {t(m.nameNepali || m.name, m.name)} ({fmtDigits(m.memberNo)}) • {t('मौज्दात:', 'Balance: ')}{fmtCurrency(m.totalSavings, true)}
              </option>
            ))}
          </select>
        </div>

        {selectedMember && (
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-400">{t('बचत मौज्दात', 'Savings Balance')}</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {fmtCurrency(selectedMember.totalSavings, true)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">{t('शेयर पुँजी', 'Share Capital')}</div>
              <div className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                {fmtCurrency(selectedMember.shareCapital, true)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">{t('सक्रिय ऋण', 'Active Loan')}</div>
              <div className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                {fmtCurrency(selectedMember.activeLoanBalance, true)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">{t('क्रेडिट स्कोर', 'Credit Score')}</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                {fmtDigits(selectedMember.creditScore)} / {fmtDigits(900)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loan Scheme & Terms */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('कर्जा योजना *', 'Loan Scheme *')}
          </label>
          <select
            value={loanType}
            onChange={(e) => onSchemeChange(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          >
            {LOAN_SCHEMES.map((s) => (
              <option key={s.type} value={s.type}>
                {t(s.labelNe, s.labelEn)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('माग गरिएको सावाँ रकम (रु.) *', 'Principal Amount (NPR) *')}
          </label>
          <input
            type="number"
            step={10000}
            min={10000}
            value={requestedAmount}
            onChange={(e) => onRequestedAmountChange(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('भुक्तानी अवधि (महिना) *', 'Tenure (Months) *')}
          </label>
          <select
            value={tenureMonths}
            onChange={(e) => onTenureMonthsChange(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          >
            <option value={6}>६ महिना (6 Months)</option>
            <option value={12}>१२ महिना (1 Year)</option>
            <option value={18}>१८ महिना (1.5 Years)</option>
            <option value={24}>२४ महिना (2 Years)</option>
            <option value={36}>३६ महिना (3 Years)</option>
            <option value={48}>४८ महिना (4 Years)</option>
            <option value={60}>६० महिना (5 Years)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('ब्याजदर (% p.a.) *', 'Annual Interest Rate (%) *')}
          </label>
          <input
            type="number"
            step={0.1}
            min={5}
            max={20}
            value={interestRate}
            onChange={(e) => onInterestRateChange(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('आवेदकको मासिक आय (रु.)', 'Monthly Income (NPR)')}
          </label>
          <input
            type="number"
            step={5000}
            min={10000}
            value={monthlyIncome}
            onChange={(e) => onMonthlyIncomeChange(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('कर्जाको मुख्य प्रयोजन', 'Loan Purpose')}
          </label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => onPurposeChange(e.target.value)}
            placeholder="जस्तै: कृषि औजार खरिद"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
        </div>
      </div>

      {/* LIVE EMI & AMORTIZATION PREVIEW WIDGET */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
            <Calculator className="size-4 text-emerald-600" />
            <span>
              {t(
                'घट्दो मौज्दात अनुसार किस्ता गणना',
                'Live Diminishing EMI Calculation'
              )}
            </span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">
            {fmtPercent(interestRate)} p.a. • {fmtDigits(tenureMonths)} M
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40">
            <div className="text-[10px] text-slate-500 font-medium">{t('मासिक किस्ता (EMI)', 'Monthly EMI')}</div>
            <div className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
              {fmtCurrency(monthlyEmi, true)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40">
            <div className="text-[10px] text-slate-500 font-medium">{t('कुल ब्याज', 'Total Interest')}</div>
            <div className="text-base font-bold text-blue-700 dark:text-blue-400 font-mono mt-0.5">
              {fmtCurrency(totalInterest, true)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40">
            <div className="text-[10px] text-slate-500 font-medium">{t('जम्मा फिर्ता रकम', 'Total Payable')}</div>
            <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {fmtCurrency(totalPayable, true)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40">
            <div className="text-[10px] text-slate-500 font-medium">{t('सेवा शुल्क (१%)', 'Processing Fee (1%)')}</div>
            <div className="text-base font-bold text-amber-700 dark:text-amber-400 font-mono mt-0.5">
              {fmtCurrency(serviceFee, true)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
