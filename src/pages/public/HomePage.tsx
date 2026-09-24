import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';

export function HomePage() {
  const { coopSettings } = useCoopStore();
  const { t, fmtCurrency, fmtDigits, fmtPercent, fmtCount } = useLanguageStore();

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
    <div className="min-h-screen bg-surface-canvas text-on-surface">
      {/* Top Rates & Community Announcement Bar */}
      <div className="w-full bg-surface-dark text-on-tertiary">
        <div className="max-w-7xl mx-auto px-gutter flex items-center justify-between py-2 text-label-sm font-label-sm">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-brand-accent-lime"></span>
              <span className="text-surface-bright font-medium">
                {t('ब्याजदर: बचतमा १०% सम्म | कर्जा ८% बाट सुरु', 'Rates: Savings up to 10% p.a. | Loans from 8% p.a.')}
              </span>
            </div>
            <span className="hidden md:inline text-outline-variant">•</span>
            <span className="hidden md:inline text-surface-container-high">
              {t(`दर्ता नं. ${coopSettings.regNo} | सहकारी विभाग`, `Reg No. ${coopSettings.regNoEnglish || coopSettings.regNo} | Department of Cooperatives`)}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-space-lg">
            <span className="text-surface-container-high">{t(coopSettings.addressNepali || coopSettings.address, coopSettings.addressEnglish || coopSettings.address)}</span>
            <a href={`tel:${coopSettings.phone.split('/')[0].trim()}`} className="text-surface-bright font-medium hover:text-brand-accent-lime transition-colors">
              {t('सम्पर्क:', 'Call:')} {t(coopSettings.phone, coopSettings.phoneEnglish || coopSettings.phone)}
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="w-full bg-background">
        <div className="flex flex-col w-full">
          {/* Top Hero & Interactive Financial Calculator Section */}
          <section id="calculator-section" className="relative w-full bg-surface-dark overflow-hidden py-6 sm:py-8 lg:py-10 px-gutter">
            {/* Atmospheric glows */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-center relative z-10">
              {/* Left Column: Value Proposition */}
              <div className="lg:col-span-6 space-y-3.5 sm:space-y-4 lg:space-y-5">
                {/* Trust badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-dark-card shadow-sm text-xs">
                  <span className="material-symbols-outlined text-brand-accent-lime text-[18px]">verified_user</span>
                  <span className="font-label-sm text-label-sm text-surface-bright">
                    {t('दाङ र देउखुरी उपत्यकाका १,०००+ सक्रिय सदस्यहरूको विश्वास', 'Trusted by +1,000 active members in Dang & Deukhuri Valley')}
                  </span>
                </div>

                {/* Headline & Subtitle */}
                <div className="space-y-space-md">
                  <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-headline text-surface-bright tracking-tight font-extrabold leading-[1.12]">
                    {t('सँगै मिलेर समृद्धि बनाऔं।', 'Grow Wealth')} <span className="text-brand-accent-lime">{t('', 'Together.')}</span>
                  </h1>
                  <p className="text-sm sm:text-base text-tertiary-fixed-dim max-w-lg leading-relaxed font-normal">
                    {t(
                      'सामुदायिक विश्वास र आधुनिक वित्तीय प्रविधिको संगम। स्मार्ट बचत, सहज कर्जा र लुम्बिनी प्रदेशमा समुन्नत भविष्य निर्माण गर्नुहोस्।',
                      'Experience a cooperative that combines community trust with modern financial tools. Save smarter, borrow easier, and build a flourishing financial future in Lumbini Province.'
                    )}
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    to="/member/verification"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm text-surface-dark bg-surface-bright hover:bg-surface-container-high transition-all shadow-md font-bold"
                  >
                    <span>{t('नयाँ खाता खोल्नुहोस्', 'Open Member Account')}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>

                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-surface-bright bg-surface-dark-card hover:bg-surface-dark-card/80 border border-white/10 transition-all font-semibold"
                  >
                    <span>{t('सम्पर्क गर्नुहोस्', 'Contact Us')}</span>
                  </Link>
                </div>

                {/* Key micro trust props */}
                <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2 h-2 rounded-full bg-brand-accent-lime"></span>
                    <span className="font-label-sm text-label-sm text-tertiary-fixed-dim">
                      {t(`दर्ता नं. ${coopSettings.regNo}`, `Reg No. ${coopSettings.regNo}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2 h-2 rounded-full bg-brand-accent-lime"></span>
                    <span className="font-label-sm text-label-sm text-tertiary-fixed-dim">{t('अडिट प्रमाणित', 'Audit Compliant')}</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2 h-2 rounded-full bg-brand-accent-lime"></span>
                    <span className="font-label-sm text-label-sm text-tertiary-fixed-dim">{t('१००% लोकतान्त्रिक', '100% Democratic')}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Financial Estimator Card */}
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
                      <span className="material-symbols-outlined text-[18px]">savings</span>
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
                      <span className="material-symbols-outlined text-[18px]">payments</span>
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
                          <span className="material-symbols-outlined absolute right-3 top-2.5 sm:top-3 text-tertiary-fixed-dim pointer-events-none text-[20px]">expand_more</span>
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
                          <span className="material-symbols-outlined absolute right-3 top-3.5 text-tertiary-fixed-dim pointer-events-none text-[20px]">expand_more</span>
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
                      <span className="material-symbols-outlined text-[16px] text-brand-accent-lime">lock</span>
                      {t('सदस्य सुरक्षाको पूर्ण प्रत्याभूति', 'Member Security Assured')}
                    </span>
                    <Link to="/member/apply-loan" className="text-brand-accent-lime hover:underline flex items-center gap-0.5 font-semibold">
                      <span>{t('विस्तृत विवरण हेर्नुहोस् →', 'Detailed Schedule →')}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Community Impact & Vital Statistics Strip */}
          <section className="w-full bg-surface-canvas py-space-xl px-gutter">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
                {/* Stat Card 1 */}
                <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-2 hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 rounded-lg bg-brand-accent-light flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">percent</span>
                  </div>
                  <div>
                    <div className="font-display-stat text-display-stat text-primary font-bold">{fmtPercent(8)}</div>
                    <p className="font-headline-sm text-headline-sm text-on-surface">{t('सुरुवाती ब्याजदर', 'Starting Rate')}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {t('सहुलियतपूर्ण कृषि तथा लघु कर्जा दर', 'Concessional micro & agro loan rate p.a.')}
                    </p>
                  </div>
                </div>
                {/* Stat Card 2 */}
                <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-2 hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 rounded-lg bg-brand-accent-light flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">groups</span>
                  </div>
                  <div>
                    <div className="font-display-stat text-display-stat text-on-surface font-bold">{t('१२,०००+', '12K+')}</div>
                    <p className="font-headline-sm text-headline-sm text-on-surface">{t('सक्रिय सदस्यहरू', 'Members')}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {t('दाङ र देउखुरीका समुदाय साझेदारहरू', 'Active rural and town cooperative partners')}
                    </p>
                  </div>
                </div>
                {/* Stat Card 3 */}
                <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-2 hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 rounded-lg bg-brand-accent-light flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                  <div>
                    <div className="font-display-stat text-display-stat text-primary font-bold">{fmtPercent(100)}</div>
                    <p className="font-headline-sm text-headline-sm text-on-surface">{t('सुरक्षित निक्षेप', 'Secure')}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {t('सुरक्षित कोष र नियमनकारी तरलता', 'Insured deposits and statutory liquidity funds')}
                    </p>
                  </div>
                </div>
                {/* Stat Card 4 */}
                <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-2 hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 rounded-lg bg-brand-accent-light flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">account_balance</span>
                  </div>
                  <div>
                    <div className="font-display-stat text-display-stat text-on-surface font-bold">{t('रु. १५ करोड+', 'NPR 150M+')}</div>
                    <p className="font-headline-sm text-headline-sm text-on-surface">{t('कुल सम्पत्ति आधार', 'Total Assets')}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {t('स्थानीय उद्यमशीलतामा परिचालित पुँजी', 'Capital mobilized for regional entrepreneurship')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Effortless Membership - 3 Steps Strip */}
          <section className="w-full bg-surface-container-low py-space-2xl px-gutter">
            <div className="max-w-7xl mx-auto space-y-space-xl">
              <div className="text-center space-y-space-xs max-w-2xl mx-auto">
                <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                  {t('सहज सदस्यता प्रक्रिया', 'Effortless Membership')}
                </span>
                <h2 className="font-headline-2xl text-headline-2xl text-on-surface font-extrabold tracking-tight">
                  {t('यसरी जोडिनुहोस्', 'How It Works')}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {t('आर्थिक स्वतन्त्रता र सामुदायिक सहकार्यका तीन सरल चरण।', 'Three simple steps to financial freedom and community solidarity.')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                {/* Step 1 */}
                <div className="bg-surface-card p-space-xl rounded-2xl shadow-sm space-y-space-md flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="space-y-space-sm">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-brand-accent-light flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[28px]">person_add</span>
                      </div>
                      <span className="font-headline-2xl text-headline-2xl text-surface-container-highest font-black group-hover:text-primary-container/20 transition-colors">{fmtDigits('01')}</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      {t('सदस्य बन्नुहोस्', 'Become a Member')}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {t(
                        'अनलाइनबाटै वा हाम्रो गढवा चैनपुर कार्यालयमा आई दर्ता गर्नुहोस्। रु. १०० प्रवेश शुल्कमा आजिवन सदस्यता र मताधिकार प्राप्त गर्नुहोस्।',
                        'Register online or visit our Gadhwa Chainpur office. A small one-time entrance fee of NPR 100 gets you lifetime membership status and voting equity.'
                      )}
                    </p>
                  </div>
                  <div className="pt-space-md border-t-0 mt-space-md">
                    <Link to="/member/verification" className="inline-flex items-center text-primary font-label-md text-label-md hover:underline font-bold">
                      <span>{t('अनलाइन ई-केवाईसी उपलब्ध', 'Online e-KYC available')}</span>
                      <span className="material-symbols-outlined text-[18px] ml-1">verified</span>
                    </Link>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-surface-card p-space-xl rounded-2xl shadow-sm space-y-space-md flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="space-y-space-sm">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-brand-accent-light flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[28px]">schedule</span>
                      </div>
                      <span className="font-headline-2xl text-headline-2xl text-surface-container-highest font-black group-hover:text-primary-container/20 transition-colors">{fmtDigits('02')}</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      {t('मासिक बचत गर्नुहोस्', 'Save Monthly')}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {t(
                        'नियमित रूपमा बचत गर्नुहोस्। मासिक बचतले कर्जा योग्यता बढाउँछ, आकर्षक ब्याज (१०% सम्म) र वार्षिक लाभांश दिलाउँछ।',
                        'Contribute to your mandatory savings. Consistent monthly deposits build your creditworthiness, accumulate guaranteed interest (up to 10%), and earn annual dividends.'
                      )}
                    </p>
                  </div>
                  <div className="pt-space-md border-t-0 mt-space-md">
                    <Link to="/login" className="inline-flex items-center text-primary font-label-md text-label-md hover:underline font-bold">
                      <span>{t('डिजिटल तथा पासबुक सुविधा', 'Automated bank debits')}</span>
                      <span className="material-symbols-outlined text-[18px] ml-1">trending_up</span>
                    </Link>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-surface-card p-space-xl rounded-2xl shadow-sm space-y-space-md flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="space-y-space-sm">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-brand-accent-light flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[28px]">credit_card</span>
                      </div>
                      <span className="font-headline-2xl text-headline-2xl text-surface-container-highest font-black group-hover:text-primary-container/20 transition-colors">{fmtDigits('03')}</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      {t('सहज कर्जा पाउनुहोस्', 'Access Loans')}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {t(
                        '६ महिनाको नियमित बचतपछि जम्मा रकमको २ देखि ३ गुणासम्म सहुलियतपूर्ण उद्यम कर्जा ४८ घण्टाभित्र प्राप्त गर्नुहोस्।',
                        'Qualify for micro and enterprise loans up to 2x-3x your accumulated savings balance after just 6 months of active membership, approved within 48 hours.'
                      )}
                    </p>
                  </div>
                  <div className="pt-space-md border-t-0 mt-space-md">
                    <Link to="/member/apply-loan" className="inline-flex items-center text-primary font-label-md text-label-md hover:underline font-bold">
                      <span>{t('कुनै लुकेको सेवा शुल्क छैन', 'No hidden appraisal fees')}</span>
                      <span className="material-symbols-outlined text-[18px] ml-1">speed</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* "Why Choose Unako" / Banking, But Better Narrative */}
          <section className="w-full bg-surface-dark py-space-2xl px-gutter text-surface-bright">
            <div className="max-w-7xl mx-auto space-y-space-xl">
              {/* Section Header */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-end">
                <div className="lg:col-span-8 space-y-space-xs">
                  <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-dark-card text-brand-accent-lime font-label-sm text-label-sm">
                    <span>{t('किन उनको सहकारी ?', 'WHY CHOOSE UNAKO')}</span>
                  </div>
                  <h2 className="font-headline-2xl text-headline-2xl text-surface-bright leading-tight">
                    {t('बैंकिङ भन्दा उत्तम।', 'Banking, But Better.')}<br />
                    <span className="text-brand-accent-lime">{t('किनकि यसको मालिक तपाईं हुनुहुन्छ।', 'Because You Own It.')}</span>
                  </h2>
                  <p className="font-body-lg text-body-lg text-tertiary-fixed-dim max-w-2xl pt-2">
                    {t(
                      'वाणिज्य बैंकहरूले नाफा बाहिर लैजान्छन्, तर उनको बचत तथा ऋण सहकारी सदस्यहरूकै स्वामित्वमा सञ्चालित छ। हरेक रुपैयाँ नाफा उच्च प्रतिफल, सस्तो ब्याज र समुदायको विकासमा लगानी हुन्छ।',
                      'Unlike commercial banks that prioritize distant corporate shareholders, Unako Savings & Credit Cooperative is owned directly by members. We reinvest every single rupee of profit back into better returns, concessional rates, and regional development.'
                    )}
                  </p>
                </div>
                <div className="lg:col-span-4 flex lg:justify-end">
                  <div className="bg-surface-dark-card p-space-md rounded-xl space-y-2 max-w-xs">
                    <div className="flex items-center gap-2 text-brand-accent-lime">
                      <span className="material-symbols-outlined text-[20px]">handshake</span>
                      <span className="font-label-md text-label-md">{t('लोकतान्त्रिक नियन्त्रण', 'Democratic Control')}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-tertiary-fixed-dim">
                      {t(
                        'शेयर जति भए पनि हरेक सदस्यलाई बराबर १ भोटको अधिकार हुन्छ। नेतृत्व चयन साधारण सभामा लोकतान्त्रिक रूपमा गरिन्छ।',
                        'Every member holds equal voting rights regardless of share value. You elect leadership directly at the AGM.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-md">
                {/* Pillar 1 */}
                <div className="bg-surface-dark-card p-space-lg rounded-xl space-y-space-sm hover:bg-surface-dark-card/80 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 text-brand-accent-lime flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">price_check</span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-surface-bright">
                    {t('न्यून ब्याजदरको कर्जा', 'Low Interest Loans')}
                  </h4>
                  <p className="font-body-sm text-body-sm text-tertiary-fixed-dim">
                    {t(
                      '८% बाट सुरु हुने घट्दो किस्ता कर्जा, कुनै अनावश्यक जरिवाना बिना।',
                      'Rates starting as low as 8% p.a. on a diminishing balance method with no surprise penalty traps.'
                    )}
                  </p>
                </div>
                {/* Pillar 2 */}
                <div className="bg-surface-dark-card p-space-lg rounded-xl space-y-space-sm hover:bg-surface-dark-card/80 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 text-brand-accent-lime flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-surface-bright">
                    {t('वार्षिक लाभांश वितरण', 'Annual Dividends')}
                  </h4>
                  <p className="font-body-sm text-body-sm text-tertiary-fixed-dim">
                    {t(
                      'वार्षिक साधारण सभापछि सहकारीको बचत तथा शेयर लाभांश सिधै तपाईंको खातामा जम्मा हुन्छ।',
                      'Share in yearly institutional profits directly credited into your member savings account after AGM clearance.'
                    )}
                  </p>
                </div>
                {/* Pillar 3 */}
                <div className="bg-surface-dark-card p-space-lg rounded-xl space-y-space-sm hover:bg-surface-dark-card/80 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 text-brand-accent-lime flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">receipt_long</span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-surface-bright">
                    {t('पारदर्शी शुल्क प्रणाली', 'Zero Hidden Fees')}
                  </h4>
                  <p className="font-body-sm text-body-sm text-tertiary-fixed-dim">
                    {t(
                      '१००% पारदर्शी हिसाबकिताब, सार्वजनिक शुल्क सूची र कुनै लुकेको खाता नवीकरण शुल्क छैन।',
                      '100% transparent ledger, public tariff cards, and zero hidden statement or monthly maintenance charges.'
                    )}
                  </p>
                </div>
                {/* Pillar 4 */}
                <div className="bg-surface-dark-card p-space-lg rounded-xl space-y-space-sm hover:bg-surface-dark-card/80 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 text-brand-accent-lime flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">how_to_vote</span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-surface-bright">
                    {t('समुदायद्वारा सञ्चालित', 'Community Led')}
                  </h4>
                  <p className="font-body-sm text-body-sm text-tertiary-fixed-dim">
                    {t(
                      'एक सदस्य एक मत। हाम्रा सञ्चालक तथा ऋण उपसमितिका सदस्यहरू यहीँ देउखुरीमै बसोबास गर्नुहुन्छ।',
                      'One member, one vote. Our supervisory boards and lending committees live right here in Deukhuri.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Comprehensive Cooperative Product Comparison Matrix */}
          <section id="savings-schemes" className="w-full bg-surface-canvas py-space-2xl px-gutter scroll-mt-24">
            <div className="max-w-7xl mx-auto space-y-space-xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                <div className="space-y-space-xs">
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                    {t('विशिष्टीकृत वित्तीय सेवाहरू', 'Tailored Financial Portfolio')}
                  </span>
                  <h2 className="font-headline-xl text-headline-xl text-on-surface">
                    {t('बचत तथा कर्जा सुविधाहरू', 'Savings & Loan Solutions')}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                    {t(
                      'दाङका कृषक, साना व्यवसायी, विद्यार्थी र गृहिणीहरूका लागि उपयुक्त पारदर्शी ब्याजदर।',
                      'Transparent interest rates tailored to farmers, micro-traders, students, and household caregivers in Dang district.'
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-space-sm">
                  <Link to="/about" className="font-label-md text-label-md text-primary hover:text-secondary flex items-center gap-1 font-semibold">
                    <span>{t('हाम्रो बारेमा विस्तृत हेर्नुहोस्', 'View All 8 Savings Plans')}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Bento Grid of Schemes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                {/* Savings Scheme 1 */}
                <div className="bg-surface-card rounded-xl p-space-lg shadow-sm space-y-space-md flex flex-col justify-between">
                  <div className="space-y-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-brand-accent-light text-primary font-semibold">
                        {t('सर्वाधिक लोकप्रिय', 'Most Popular')}
                      </span>
                      <span className="font-headline-sm text-headline-sm text-primary">
                        {t('८.०% वार्षिक', '8.0% p.a.')}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      {t('साधारण सदस्य बचत', 'General Member Savings')}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {t(
                        'दैनिक कारोबारका लागि लचिलो बचत, कुनै न्यूनतम ब्यालेन्सको बाध्यता नभएको र दैनिक ब्याज गणना हुने।',
                        'Everyday flexible deposit plan for all registered members with no minimum balance penalty and daily interest calculation.'
                      )}
                    </p>
                    <ul className="space-y-2 pt-2 font-body-sm text-body-sm text-on-surface-variant">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                        {t('निःशुल्क पासबुक तथा एसएमएस अलर्ट', 'Free passbook & SMS balance alerts')}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                        {t('त्रैमासिक रूपमा खातामै ब्याज जम्मा', 'Interest credited quarterly')}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                        {t('काउन्टरबाट तत्काल भुक्तानी', 'Instant counter withdrawals')}
                      </li>
                    </ul>
                  </div>
                  <Link
                    to="/member/verification"
                    className="w-full text-center py-2.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors font-bold"
                  >
                    {t('खाता खोल्नुहोस्', 'Apply for Account')}
                  </Link>
                </div>

                {/* Savings Scheme 2 */}
                <div className="bg-surface-card rounded-xl p-space-lg shadow-sm space-y-space-md flex flex-col justify-between">
                  <div className="space-y-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-brand-accent-light text-primary font-semibold">
                        {t('उच्च प्रतिफल', 'High Yield')}
                      </span>
                      <span className="font-headline-sm text-headline-sm text-primary">
                        {t('१०.०% वार्षिक', '10.0% p.a.')}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      {t('मुद्दती निक्षेप योजना', 'Fixed Term Deposit')}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {t(
                        '१ देखि ५ वर्षका लागि रकम राखी सुरक्षित उच्च प्रतिफल र त्रैमासिक ब्याज भुक्तानी पाउनुहोस्।',
                        'Lock your funds for 1 to 5 years and lock in guaranteed elevated returns with quarterly compounding payout options.'
                      )}
                    </p>
                    <ul className="space-y-2 pt-2 font-body-sm text-body-sm text-on-surface-variant">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                        {t('मुद्दतीको ९०% सम्म कर्जा सुविधा', 'Loan against deposit up to 90%')}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                        {t('ज्येष्ठ नागरिकलाई थप ०.५% ब्याज', 'Senior citizen +0.5% incentive')}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                        {t('बजार जोखिमबाट पूर्ण सुरक्षित', 'Safe from market volatility')}
                      </li>
                    </ul>
                  </div>
                  <Link
                    to="/login"
                    className="w-full text-center py-2.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors font-bold"
                  >
                    {t('मुद्दती सुरु गर्नुहोस्', 'Start Fixed Term')}
                  </Link>
                </div>

                {/* Loan Scheme 3 */}
                <div id="loan-products" className="bg-surface-card rounded-xl p-space-lg shadow-sm space-y-space-md flex flex-col justify-between scroll-mt-24">
                  <div className="space-y-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-brand-accent-light text-primary font-semibold">
                        {t('सशक्तिकरण', 'Empowerment')}
                      </span>
                      <span className="font-headline-sm text-headline-sm text-primary">
                        {t('८.५% वार्षिक', '8.5% p.a.')}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      {t('कृषि तथा लघु उद्यम कर्जा', 'Krishi & Micro-Enterprise Loan')}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {t(
                        'देउखुरीका किसान, दुग्ध उत्पादक, कुखुरापालक र घरेलु उद्यमीहरूका लागि सहुलियतपूर्ण कर्जा।',
                        'Subsidized credit tailored for Deukhuri farmers, dairy producers, poultry farmers, and cottage business operators.'
                      )}
                    </p>
                    <ul className="space-y-2 pt-2 font-body-sm text-body-sm text-on-surface-variant">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                        {t('रु. ३,००,००० सम्म विना धितो समूह जमानी', 'No mortgage up to NPR 300,000')}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                        {t('बाली भित्र्याउने समय अनुसार लचिलो किस्ता', 'Flexible harvest seasonal repayment')}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                        {t('४८ घण्टाभित्र छिटो कर्जा स्वीकृति', 'Fast approval within 48 hours')}
                      </li>
                    </ul>
                  </div>
                  <Link
                    to="/member/apply-loan"
                    className="w-full text-center py-2.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors font-bold"
                  >
                    {t('ऋण आवेदन दिनुहोस्', 'Apply for Loan')}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Social Proof & Member Stories Carousel Strip */}
          <section className="w-full bg-surface-container-low py-space-2xl px-gutter">
            <div className="max-w-7xl mx-auto space-y-space-xl">
              <div className="text-center space-y-space-xs max-w-2xl mx-auto">
                <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                  {t('दाङ उपत्यकाका आवाजहरू', 'Voices of Dang Valley')}
                </span>
                <h2 className="font-headline-2xl text-headline-2xl text-on-surface">
                  {t('वास्तविक सदस्य, वास्तविक प्रगति', 'Real Members, Real Growth')}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {t(
                    'हाम्रो सहकारीले देउखुरीका परिवार र उद्यमीहरूलाई कसरी सशक्त बनाउँदैछ।',
                    'How our community cooperative empowers families and entrepreneurs across Deukhuri.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                {/* Story 1 */}
                <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md flex flex-col justify-between">
                  <div className="space-y-space-sm">
                    <div className="flex items-center text-status-warning">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface italic">
                      {t(
                        '"मैले आफ्नो तोरी तेल मिल २ जनाबाट बढाएर ८ जनालाई रोजगारी दिने बनाएँ। उनको सहकारीले झन्झट बिना मेरो व्यवसायको सम्भावना हेरेर कर्जा दियो।"',
                        '"I expanded my commercial mustard processing mill from a 2-person outfit to 8 employees. Unako evaluated my business feasibility with care, without bureaucratic delays."'
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-space-xs border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-brand-accent-light text-primary flex items-center justify-center font-bold">
                      RP
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm text-on-surface text-base">
                        {t('रामप्रसाद चौधरी', 'Ram Prasad Chaudhary')}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {t('गढवा-३, कृषि उद्यमी', 'Gadhwa-3, Agro Entrepreneur')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Story 2 */}
                <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md flex flex-col justify-between">
                  <div className="space-y-space-sm">
                    <div className="flex items-center text-status-warning">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface italic">
                      {t(
                        '"नारी उत्थान योजनामार्फत हाम्रो महिला समूहले नियमित बचत गरेर सिलाई मेसिन किन्यो। अहिले हामी आफ्ना छोराछोरीको पढाइ आफैं धान्न सक्छौं।"',
                        '"Through the Nari Utthan scheme, our women\'s handicraft group saved regularly and secured concessional capital to buy sewing machinery. We now support our kids\' schooling independently."'
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-space-xs border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-brand-accent-light text-primary flex items-center justify-center font-bold">
                      SM
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm text-on-surface text-base">
                        {t('शान्ता माया थापा', 'Shanta Maya Thapa')}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {t('चैनपुर, महिला समूह संयोजक', "Chainpur, Women's SHG Leader")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Story 3 */}
                <div className="bg-surface-card p-space-lg rounded-xl shadow-sm space-y-space-md flex flex-col justify-between">
                  <div className="space-y-space-sm">
                    <div className="flex items-center text-status-warning">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface italic">
                      {t(
                        '"अरू बैंकले झन्झटिलो धितो माग्दा उनको सहकारीले मेरी छोरीको नर्सिङ पढाइका लागि साथ दियो। आज उनी स्वास्थ्यकर्मी बनेर सेवा गर्दैछिन्।"',
                        '"When other banks demanded complex collateral, Unako stood beside my family to finance my daughter\'s nursing education. Today she is a registered healthcare professional."'
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-space-xs border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-brand-accent-light text-primary flex items-center justify-center font-bold">
                      KP
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm text-on-surface text-base">
                        {t('केशवराज पोखरेल', 'Keshav Raj Pokharel')}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {t('लमही, ज्येष्ठ सदस्य', 'Lamahi, Senior Citizen Member')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final High-Conversion Banner */}
          <section className="w-full py-space-xl px-gutter bg-surface">
            <div className="max-w-6xl mx-auto">
              <div className="bg-brand-accent-lime rounded-2xl p-space-xl sm:p-space-2xl text-center space-y-space-md shadow-xl text-surface-dark relative overflow-hidden">
                {/* Subtle concentric decorative pattern */}
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -left-20 -top-20 w-80 h-80 bg-surface-bright/20 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10 space-y-space-sm max-w-3xl mx-auto">
                  <h2 className="font-headline-2xl text-headline-2xl text-surface-dark font-black tracking-tight leading-tight">
                    {t('आजै आफ्नो समृद्धिको यात्रा सुरु गर्नुहोस्', 'Start Your Financial Journey Today')}
                  </h2>
                  <p className="font-body-lg text-body-lg text-surface-dark/90 font-medium">
                    {t(
                      'उनको सहकारीसँग सुरक्षित भविष्य निर्माण गरिरहेका १२,०००+ सदस्यहरूसँग जोडिनुहोस्। न्यूनतम शुल्क, उच्च प्रतिफल र सामुदायिक बैंकिङ।',
                      'Join over 12,000 members who are building a secure future with Unako Cooperative. Low fees, high returns, and community-first banking.'
                    )}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-space-md pt-space-md">
                    <Link
                      to="/member/verification"
                      className="inline-flex items-center gap-space-xs px-space-xl py-3.5 rounded-full font-label-md text-label-md text-surface-bright bg-surface-dark hover:bg-surface-dark/90 transition-all shadow-lg font-bold"
                    >
                      <span>{t('रु. १०० मा आजै सदस्यता लिनुहोस्', 'Join Now For NPR 100')}</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-space-xs px-space-xl py-3.5 rounded-full font-label-md text-label-md text-surface-dark bg-surface-bright/80 hover:bg-surface-bright transition-all font-bold"
                    >
                      <span>{t('सम्पर्क गर्नुहोस्', 'Contact Us')}</span>
                    </Link>
                  </div>
                  <p className="font-label-sm text-label-sm text-surface-dark/80 pt-space-xs font-semibold tracking-wide">
                    {t('झन्झटरहित प्रक्रिया • छिटो स्वीकृति • एक सदस्य एक मत', 'No credit check required • Instant Approval • One Member, One Vote')}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
