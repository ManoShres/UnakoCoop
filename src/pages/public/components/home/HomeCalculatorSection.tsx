import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Coins, Lock, PiggyBank } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

export const HomeCalculatorSection: React.FC = () => {
  const { t, fmtCurrency, fmtDigits, fmtPercent } = useLanguageStore();

  // Interactive Calculator State
  const [activeTab, setActiveTab] = useState<'savings' | 'loans'>('savings');

  // Savings Calculator
  const [savingRate, setSavingRate] = useState(8.0);
  const [savingAmount, setSavingAmount] = useState(5000);
  const [savingYears, setSavingYears] = useState(5);

  // Loan Calculator
  const [loanRate, setLoanRate] = useState(10.0);
  const [loanPrincipal, setLoanPrincipal] = useState(500000);
  const [loanYears, setLoanYears] = useState(3);

  // Calculations
  // Compound monthly savings: FV = P * [((1 + r/12)^(n*12) - 1) / (r/12)] * (1 + r/12)
  const monthlyRate = (savingRate / 100) / 12;
  const totalMonths = savingYears * 12;
  const totalPrincipal = savingAmount * totalMonths;
  const maturityTotal = Math.round(
    monthlyRate > 0
      ? (savingAmount * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
      : totalPrincipal
  );
  const earnedInterest = maturityTotal - totalPrincipal;

  // Loan EMI: [P * r * (1 + r)^n] / [(1 + r)^n - 1]
  const loanMonthlyRate = (loanRate / 100) / 12;
  const loanMonths = loanYears * 12;
  const emi = Math.round(
    (loanPrincipal * loanMonthlyRate * Math.pow(1 + loanMonthlyRate, loanMonths)) /
    (Math.pow(1 + loanMonthlyRate, loanMonths) - 1)
  );
  const grossPayment = emi * loanMonths;
  const totalLoanInterest = grossPayment - loanPrincipal;

  return (
    <div className="lg:col-span-6 w-full">
      <div className="bg-surface-dark-card rounded-2xl p-4 sm:p-5 lg:p-6 shadow-2xl relative border border-white/5">
        {/* Segmented Controller Toggle */}
        <div className="bg-surface-dark p-1 rounded-full flex items-center mb-3 sm:mb-4">
          <button
            onClick={() => setActiveTab('savings')}
            className={`flex-1 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'savings'
                ? 'text-surface-bright bg-primary-container shadow-sm'
                : 'text-tertiary-fixed-dim hover:text-surface-bright'
            }`}
            id="tab-savings"
          >
            <PiggyBank className="w-4.5 h-4.5" />
            <span>{t('बचत योजना', 'Savings Plan')}</span>
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex-1 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'loans'
                ? 'text-surface-bright bg-primary-container shadow-sm'
                : 'text-tertiary-fixed-dim hover:text-surface-bright'
            }`}
            id="tab-loans"
          >
            <Coins className="w-4.5 h-4.5" />
            <span>{t('कर्जा क्यालकुलेटर', 'Loan Estimator')}</span>
          </button>
        </div>

        {/* Savings Calculator Module */}
        {activeTab === 'savings' && (
          <div className="space-y-2.5 sm:space-y-3" id="calculator-savings">
            <div>
              <label className="block text-xs font-semibold text-surface-bright mb-1.5">
                {t('बचत योजना छान्नुहोस्', 'SAVING SCHEME')}
              </label>
              <div className="relative">
                <select
                  value={savingRate}
                  onChange={(e) => setSavingRate(Number(e.target.value))}
                  className="w-full bg-surface-dark text-surface-bright text-xs sm:text-sm rounded-lg px-3 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim appearance-none pr-10"
                  id="saving-type"
                >
                  <option value="8">{t('साधारण बचत (८.०% वार्षिक)', 'General Saving (8.0% p.a.)')}</option>
                  <option value="6">{t('ऐच्छिक दैनिक बचत (६.०% वार्षिक)', 'Optional Daily Saving (6.0% p.a.)')}</option>
                  <option value="10">{t('मुद्दती निक्षेप (१०.०% वार्षिक)', 'Fixed Term Deposit (10.0% p.a.)')}</option>
                  <option value="9">{t('बाल भविष्य बचत योजना (९.०% वार्षिक)', 'Child Future Growth Scheme (9.0% p.a.)')}</option>
                  <option value="8.5">{t('नारी उत्थान महिला बचत (८.५% वार्षिक)', 'Nari Utthan Mahila Bachat (8.5% p.a.)')}</option>
                </select>
                <ChevronDown className="w-5 h-5 absolute right-3 top-2.5 sm:top-3 text-tertiary-fixed-dim pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-surface-bright">
                  {t('मासिक बचत रकम', 'Monthly Deposit Amount')}
                </span>
                <span className="text-base sm:text-lg font-bold text-brand-accent-lime tabular-nums" id="savings-amount-label">
                  {fmtCurrency(savingAmount, true)}
                </span>
              </div>
              <input
                className="w-full h-1.5 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-brand-accent-lime"
                id="savings-range"
                max="50000"
                min="500"
                step="500"
                type="range"
                value={savingAmount}
                onChange={(e) => setSavingAmount(Number(e.target.value))}
              />
              <div className="flex justify-between text-[11px] text-tertiary-fixed-dim mt-0.5">
                <span>{fmtCurrency(500, true)}</span>
                <span>{fmtCurrency(25000, true)}</span>
                <span>{fmtCurrency(50000, true)}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-surface-bright">
                  {t('बचत अवधि', 'Saving Duration')}
                </span>
                <span className="text-base sm:text-lg font-bold text-surface-bright tabular-nums" id="duration-label">
                  {t(`${fmtDigits(savingYears)} वर्ष`, `${fmtDigits(savingYears)} ${savingYears === 1 ? 'Year' : 'Years'}`)}
                </span>
              </div>
              <input
                className="w-full h-1.5 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-brand-accent-lime"
                id="duration-range"
                max="10"
                min="1"
                step="1"
                type="range"
                value={savingYears}
                onChange={(e) => setSavingYears(Number(e.target.value))}
              />
              <div className="flex justify-between text-[11px] text-tertiary-fixed-dim mt-0.5">
                <span>{t('१ वर्ष', '1 Year')}</span>
                <span>{t('५ वर्ष', '5 Years')}</span>
                <span>{t('१० वर्ष', '10 Years')}</span>
              </div>
            </div>

            {/* Projected Maturity Display Plate */}
            <div className="bg-surface-dark rounded-xl p-3 sm:p-3.5 text-center space-y-1 mt-2.5">
              <span className="text-[11px] font-semibold text-tertiary-fixed-dim uppercase tracking-wider">
                {t('अनुमानित परिपक्वता रकम', 'PROJECTED MATURITY')}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-surface-bright tracking-tight" id="savings-maturity-total">
                {fmtCurrency(maturityTotal, true)}
              </div>
              <p className="text-[11px] text-brand-accent-lime" id="savings-rate-sub">
                {t(`*${fmtPercent(savingRate)} वार्षिक चक्रवृद्धिका आधारमा`, `*Based on ${fmtPercent(savingRate)} annual compounded return`)}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1.5 text-left text-xs">
                <div className="bg-surface-dark-card/60 p-2 rounded">
                  <span className="text-tertiary-fixed-dim block">{t('कुल जम्मा साँवा:', 'Total Principal:')}</span>
                  <span className="text-surface-bright font-semibold" id="savings-principal">{fmtCurrency(totalPrincipal, true)}</span>
                </div>
                <div className="bg-surface-dark-card/60 p-2 rounded">
                  <span className="text-brand-accent-lime block">{t('आर्जित ब्याज:', 'Earned Interest:')}</span>
                  <span className="text-brand-accent-lime font-semibold" id="savings-interest">{fmtCurrency(earnedInterest, true)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loan Estimator Module */}
        {activeTab === 'loans' && (
          <div className="space-y-2.5 sm:space-y-3" id="calculator-loans">
            <div>
              <label className="block text-xs font-semibold text-surface-bright mb-1.5">
                {t('कर्जाको उद्देश्य', 'LOAN PURPOSE')}
              </label>
              <div className="relative">
                <select
                  value={loanRate}
                  onChange={(e) => setLoanRate(Number(e.target.value))}
                  className="w-full bg-surface-dark text-surface-bright text-xs sm:text-sm rounded-lg px-3 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim appearance-none pr-10"
                  id="loan-purpose"
                >
                  <option value="10">{t('घर निर्माण तथा मर्मत कर्जा (१०.०%)', 'House Construction / Renovation (10.0%)')}</option>
                  <option value="9">{t('कृषि, पशुपालन तथा सिंचाइ कर्जा (९.०%)', 'Agriculture, Livestock & Irrigation (9.0%)')}</option>
                  <option value="11">{t('लघु व्यवसाय तथा व्यापार कर्जा (११.०%)', 'Micro Enterprise & Trade (11.0%)')}</option>
                  <option value="8">{t('उच्च प्राविधिक शिक्षा कर्जा (८.०%)', 'Higher Technical Education (8.0%)')}</option>
                  <option value="12">{t('सामाजिक तथा आकस्मिक कर्जा (१२.०%)', 'Social & Personal Emergency (12.0%)')}</option>
                </select>
                <ChevronDown className="w-5 h-5 absolute right-3 top-3.5 text-tertiary-fixed-dim pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-surface-bright">
                  {t('आवश्यक कर्जा रकम', 'Loan Needed')}
                </span>
                <span className="text-base sm:text-lg font-bold text-brand-accent-lime tabular-nums" id="loan-amount-label">
                  {fmtCurrency(loanPrincipal, true)}
                </span>
              </div>
              <input
                className="w-full h-1.5 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-brand-accent-lime"
                id="loan-range"
                max="2500000"
                min="50000"
                step="25000"
                type="range"
                value={loanPrincipal}
                onChange={(e) => setLoanPrincipal(Number(e.target.value))}
              />
              <div className="flex justify-between text-[11px] text-tertiary-fixed-dim mt-0.5">
                <span>{fmtCurrency(50000, true)}</span>
                <span>{fmtCurrency(1250000, true)}</span>
                <span>{fmtCurrency(2500000, true)}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-surface-bright">
                  {t('भुक्तानी अवधि', 'Repayment Period')}
                </span>
                <span className="text-base sm:text-lg font-bold text-surface-bright tabular-nums" id="loan-duration-label">
                  {t(`${fmtDigits(loanYears)} वर्ष`, `${fmtDigits(loanYears)} ${loanYears === 1 ? 'Year' : 'Years'}`)}
                </span>
              </div>
              <input
                className="w-full h-1.5 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-brand-accent-lime"
                id="loan-duration-range"
                max="7"
                min="1"
                step="1"
                type="range"
                value={loanYears}
                onChange={(e) => setLoanYears(Number(e.target.value))}
              />
              <div className="flex justify-between text-[11px] text-tertiary-fixed-dim mt-0.5">
                <span>{t('१ वर्ष', '1 Year')}</span>
                <span>{t('४ वर्ष', '4 Years')}</span>
                <span>{t('७ वर्ष', '7 Years')}</span>
              </div>
            </div>

            {/* Loan Output Plate */}
            <div className="bg-surface-dark rounded-xl p-3 sm:p-3.5 text-center space-y-1 mt-2.5">
              <span className="text-[11px] font-semibold text-tertiary-fixed-dim uppercase tracking-wider">
                {t('अनुमानित मासिक किस्ता', 'ESTIMATED MONTHLY EMI')}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-accent-lime tracking-tight" id="loan-emi-total">
                {fmtCurrency(emi, true)}
              </div>
              <p className="text-[11px] text-surface-bright" id="loan-rate-sub">
                {t(`*${fmtPercent(loanRate)} घट्दो ब्याजदर प्रणालीमा आधारित`, `*Based on ${fmtPercent(loanRate)} reducing balance rate`)}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1.5 text-left text-xs">
                <div className="bg-surface-dark-card/60 p-2 rounded">
                  <span className="text-tertiary-fixed-dim block">{t('कुल ब्याज:', 'Total Interest:')}</span>
                  <span className="text-surface-bright font-semibold" id="loan-total-interest">{fmtCurrency(totalLoanInterest, true)}</span>
                </div>
                <div className="bg-surface-dark-card/60 p-2 rounded">
                  <span className="text-tertiary-fixed-dim block">{t('कुल भुक्तानी:', 'Gross Payment:')}</span>
                  <span className="text-surface-bright font-semibold" id="loan-total-payment">{fmtCurrency(grossPayment, true)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between text-xs text-tertiary-fixed-dim">
          <span className="flex items-center gap-1">
            <Lock className="w-4 h-4 text-brand-accent-lime" />
            {t('सदस्य सुरक्षाको पूर्ण प्रत्याभूति', 'Member Security Assured')}
          </span>
          <Link to="/member/apply-loan" className="text-brand-accent-lime hover:underline flex items-center gap-0.5 font-semibold">
            <span>{t('विस्तृत विवरण हेर्नुहोस् →', 'Detailed Schedule →')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
