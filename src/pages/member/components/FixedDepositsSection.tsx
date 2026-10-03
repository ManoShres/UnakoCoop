import React, { useState } from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import {
  Lock,
  Building2,
  PiggyBank,
  ArrowRight,
  ShieldCheck,
  Vote,
  CheckCircle2,
  CreditCard,
  Zap,
  HeartHandshake,
  Activity,
} from 'lucide-react';
import type { SavingsAccount } from '../../../types';

interface FixedDepositsSectionProps {
  onOpenFdLoanModal: () => void;
  onOpenMudhatiModal: () => void;
  fixedDeposit?: SavingsAccount;
  regularSavingsBalance?: number;
  viewMode?: 'fd' | 'calculator' | 'all';
}

export function FixedDepositsSection({
  onOpenFdLoanModal,
  onOpenMudhatiModal,
  fixedDeposit,
  regularSavingsBalance = 184500,
  viewMode = 'all',
}: FixedDepositsSectionProps) {
  const { t } = useLanguageStore();

  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [selectedTenor, setSelectedTenor] = useState<{ years: number; rate: number }>({ years: 2, rate: 10.0 });
  const [payoutFreq, setPayoutFreq] = useState<'monthly' | 'quarterly' | 'maturity'>('quarterly');

  // Dynamic values if fixedDeposit exists
  const fdBalance = fixedDeposit?.balance ?? 40350;
  const eligibleLoanLimit = Math.round(fdBalance * 0.9);

  // Calculations
  const annualInterest = (depositAmount * selectedTenor.rate) / 100;
  const totalInterest = Math.round(annualInterest * selectedTenor.years);
  const totalReturn = depositAmount + totalInterest;
  const periodicPayout = payoutFreq === 'monthly'
    ? Math.round(annualInterest / 12)
    : payoutFreq === 'quarterly'
      ? Math.round(annualInterest / 4)
      : totalInterest;

  return (
    <>
      {/* SECTION 2: FIXED DEPOSIT PORTFOLIO & NEW OPENING WIDGET */}
      <section className="space-y-space-md pt-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div>
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
              {t('खण्ड ०२ • मुद्दती निक्षेप', 'Part 02 • Fixed Term Deposit')}
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              {t('सक्रिय मुद्दती निक्षेप तथा बचत वृद्धि', 'Active Term Deposit & Growth Engine')}
            </h2>
          </div>
          <div className="flex items-center gap-space-xs text-body-sm font-body-sm text-on-surface-variant">
            <Lock className="w-4 h-4 text-status-success shrink-0" />
            <span>{t('निश्चित प्रतिफल • सहकारी ऐन अनुसार सुरक्षित', 'Guaranteed Returns • Regulated under Nepal Cooperative Act')}</span>
          </div>
        </div>

        {/* Mudhati Bento Grid: Left Active Certificate, Right Interactive Calculator */}
        <div className={viewMode === 'all' ? 'grid grid-cols-1 lg:grid-cols-12 gap-space-lg' : 'w-full'}>
          {/* Current Active FD Certificate */}
          {(viewMode === 'all' || viewMode === 'fd') && (
            <div className={`${viewMode === 'fd' ? 'max-w-2xl mx-auto w-full' : 'lg:col-span-5'} bg-surface-card rounded-xl p-space-lg shadow-sm flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between pb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <Building2 className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">{t('मुद्दती प्रमाणपत्र', 'Term Deposit Certificate')}</h3>
                    <span className="font-tabular-mono text-tabular-mono text-xs text-on-surface-variant font-bold">
                      {fixedDeposit?.accountNo ? `CERT: #${fixedDeposit.accountNo}` : t('प्रमाणपत्र: #FD-88219', 'CERT: #FD-88219')}
                    </span>
                  </div>
                </div>
                <span className="px-space-sm py-1 rounded-full bg-brand-accent-light text-status-success font-label-sm text-label-sm font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
                  {t('ब्याज आर्जन सक्रिय', 'Earning Active')}
                </span>
              </div>

              {/* Principal Figure */}
              <div className="my-space-md p-space-md bg-surface-container-low rounded-xl">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">
                  {t('मुद्दती साँवा रकम', 'Principal Locked Value')}
                </span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">NPR</span>
                  <span className="font-headline-2xl text-headline-2xl font-extrabold text-on-surface tracking-tight leading-none">
                    {fdBalance.toLocaleString()}
                  </span>
                </div>
                <div className="mt-space-sm flex items-center justify-between text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">{t('वार्षिक निश्चित ब्याजदर:', 'Annual Guaranteed Rate:')}</span>
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">{t('१०.०% वार्षिक', '10.0% p.a.')}</span>
                </div>
              </div>

              {/* Timeline & Maturity Countdown */}
              <div className="space-y-space-sm">
                <div className="flex justify-between items-center text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">{t('जम्मा मिति:', 'Start Date:')}</span>
                  <span className="font-semibold text-on-surface">{t('२०८० असोज १५', '2080 Ashoj 15')}</span>
                </div>
                <div className="flex justify-between items-center text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">{t('परिपक्वता मिति:', 'Maturity Date:')}</span>
                  <span className="font-semibold text-on-surface">{t('२०८२ असोज १४ (२ वर्ष)', '2082 Ashoj 14 (2 Years)')}</span>
                </div>
                <div className="flex justify-between items-center text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">{t('ब्याज भुक्तानी तालिका:', 'Payout Schedule:')}</span>
                  <span className="font-semibold text-primary">{t('त्रैमासिक ब्याज भुक्तानी', 'Quarterly Payout')}</span>
                </div>
                <div className="flex justify-between items-center text-body-sm font-body-sm">
                  <span className="text-on-surface-variant">{t('हालसम्म आर्जित ब्याज:', 'Accrued Interest to Date:')}</span>
                  <span className="font-semibold text-status-success">{t('रु. ५,७१६.२५', 'NPR 5,716.25')}</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="pt-space-xs">
                  <div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant mb-1">
                    <span>{t('व्यतीत अवधि: १७ महिना', 'Tenor Elapsed: 17 Months')}</span>
                    <span className="font-bold text-primary">{t('७ महिना बाँकी', '7 Months Remaining')}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loan Against FD action */}
            <div className="mt-space-lg pt-space-md bg-surface-canvas p-space-sm rounded-xl flex items-center justify-between">
              <div>
                <p className="font-label-sm text-label-sm font-bold text-on-surface">{t('तत्काल कर्जा सुविधा', 'Instant Credit Line')}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{t(`रु. ${eligibleLoanLimit.toLocaleString()} (९०%) सम्म ऋण योग्य`, `Eligible for NPR ${eligibleLoanLimit.toLocaleString()} loan (90%)`)}</p>
              </div>
              <button
                className="px-space-sm py-1.5 bg-surface-card hover:bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                onClick={onOpenFdLoanModal}
              >
                {t('ऋण लिनुहोस् →', 'Apply Loan →')}
              </button>
            </div>
            </div>
          )}

          {/* Interactive 'Open New Mudhati Fixed Deposit' Module */}
          {(viewMode === 'all' || viewMode === 'calculator') && (
            <div className={`${viewMode === 'calculator' ? 'max-w-3xl mx-auto w-full' : 'lg:col-span-7'} bg-surface-dark text-on-primary-container rounded-xl p-space-lg shadow-xl relative flex flex-col justify-between`}>
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-6 h-6 text-brand-accent-lime shrink-0" />
                    <h3 className="font-headline-md text-headline-md text-surface-canvas">{t('नयाँ मुद्दती निक्षेप खोल्नुहोस्', 'Open New Term Deposit')}</h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-surface-variant mt-0.5">
                    {t('तपाईंको नियमित बचत खाताबाट सिधै स्वचालित बुक गर्नुहोस्', 'Automated booking directly from your regular savings balance')}
                  </p>
                </div>
              </div>

              {/* Interactive Calculator Inputs */}
              <div className="space-y-space-md my-space-md">
                {/* Amount Slider Control */}
                <div className="bg-surface-dark-card p-space-md rounded-xl space-y-space-sm">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-surface-variant" htmlFor="depositSlider">
                      {t('मुद्दती रकम छान्नुहोस्', 'Select Deposit Amount')}
                    </label>
                    <div className="flex items-baseline gap-1 bg-surface-dark px-space-md py-1 rounded-lg">
                      <span className="font-label-sm text-label-sm text-brand-accent-lime">NPR</span>
                      <span className="font-headline-sm text-headline-sm font-extrabold text-surface-canvas" id="sliderValueText">
                        {depositAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <input
                    className="w-full h-2 bg-tertiary-container rounded-lg appearance-none cursor-pointer accent-brand-accent-lime focus:outline-none"
                    id="depositSlider"
                    max="500000"
                    min="25000"
                    step="5000"
                    type="range"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                  />
                  <div className="flex justify-between font-label-sm text-label-sm text-surface-variant">
                    <span>{t('रु. २५,००० (न्यूनतम)', 'NPR 25,000 (Min)')}</span>
                    <span>{t('रु. २,५०,०००', 'NPR 2,50,000')}</span>
                    <span>{t('रु. ५,००,००० (अधिकतम)', 'NPR 5,00,000 (Max)')}</span>
                  </div>
                </div>

                {/* Tenor & Rate Selector Chips */}
                <div className="space-y-space-xs">
                  <label className="font-label-md text-label-md text-surface-variant block">
                    {t('मुद्दती अवधि तथा निश्चित ब्याजदर', 'Deposit Tenor & Guaranteed Yield')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs" id="tenorGroup">
                    {[
                      { years: 1, rate: 9.5, desc: t('वार्षिक', 'p.a.') },
                      { years: 2, rate: 10.0, desc: t('वार्षिक • लोकप्रिय', 'p.a. Popular') },
                      { years: 3, rate: 10.5, desc: t('वार्षिक', 'p.a.') },
                      { years: 5, rate: 11.0, desc: t('वार्षिक • उच्चतम', 'p.a. Maximum') },
                    ].map((opt) => (
                      <button
                        key={opt.years}
                        onClick={() => setSelectedTenor({ years: opt.years, rate: opt.rate })}
                        className={`tenor-btn p-space-sm rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer ${
                          selectedTenor.years === opt.years
                            ? 'bg-primary-container text-on-primary-container ring-2 ring-brand-accent-lime'
                            : 'bg-surface-dark-card hover:bg-surface-dark-card/80 text-surface-variant'
                        }`}
                        type="button"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-label-sm">
                            {opt.years} {t('वर्ष', opt.years > 1 ? 'Years' : 'Year')}
                          </span>
                          {selectedTenor.years === opt.years && (
                            <span className="w-2 h-2 rounded-full bg-brand-accent-lime"></span>
                          )}
                        </div>
                        <div className="mt-1">
                          <span className="font-headline-sm text-headline-sm text-surface-canvas font-bold">
                            {opt.rate}%
                          </span>
                          <span className="font-label-sm text-label-sm text-surface-dim block">{opt.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interest Payout Frequency */}
                <div>
                  <label className="font-label-md text-label-md text-surface-variant block mb-space-xs">
                    {t('ब्याज भुक्तानी विकल्प', 'Interest Payout Frequency')}
                  </label>
                  <div className="grid grid-cols-3 gap-space-xs" id="frequencyGroup">
                    {(['monthly', 'quarterly', 'maturity'] as const).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setPayoutFreq(freq)}
                        className={`freq-btn py-2 px-space-sm rounded-lg font-label-sm text-label-sm text-center transition-all cursor-pointer ${
                          payoutFreq === freq
                            ? 'bg-surface-container-lowest text-surface-dark font-semibold'
                            : 'bg-surface-dark-card text-surface-variant hover:text-surface-canvas'
                        }`}
                        type="button"
                      >
                        {freq === 'monthly'
                          ? t('मासिक', 'Monthly')
                          : freq === 'quarterly'
                            ? t('त्रैमासिक', 'Quarterly')
                            : t('परिपक्वतामा एकमुष्ट', 'At Maturity')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Computation Hero Plate */}
              <div className="bg-surface-dark-card p-space-md rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div>
                  <span className="font-label-sm text-label-sm text-surface-variant uppercase tracking-wider block">
                    {t('परिपक्वतामा अनुमानित कुल प्रतिफल', 'Estimated Total Return at Maturity')}
                  </span>
                  <div className="flex items-baseline gap-space-xs mt-0.5">
                    <span className="font-headline-sm text-headline-sm text-brand-accent-lime font-bold">NPR</span>
                    <span className="font-display-stat text-display-stat font-extrabold text-surface-canvas tracking-tight" id="projectedTotalText">
                      {totalReturn.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-space-md text-body-sm font-body-sm mt-1">
                    <span className="text-surface-variant">
                      {t('आर्जित ब्याज:', 'Interest Earned:')}{' '}
                      <strong className="text-brand-accent-lime font-semibold" id="interestEarnedText">
                        NPR {totalInterest.toLocaleString()}
                      </strong>
                    </span>
                    <span className="text-surface-variant hidden sm:inline">•</span>
                    <span className="text-surface-variant hidden sm:inline">
                      {payoutFreq === 'monthly'
                        ? t('मासिक भुक्तानी:', 'Monthly Payout:')
                        : payoutFreq === 'quarterly'
                          ? t('त्रैमासिक भुक्तानी:', 'Quarterly Payout:')
                          : t('परिपक्वतामा भुक्तानी:', 'Maturity Payout:')}{' '}
                      <strong className="text-surface-canvas font-semibold" id="periodicPayoutText">
                        NPR {periodicPayout.toLocaleString()}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  className="px-space-lg py-space-md rounded-xl bg-brand-accent-lime hover:bg-status-success text-surface-dark font-bold font-label-md text-label-md flex items-center justify-center gap-space-xs whitespace-nowrap shadow-lg transition-all cursor-pointer"
                  id="btnOpenMudhatiConfirm"
                  onClick={onOpenMudhatiModal}
                >
                  <span>{t('मुद्दती निक्षेप खोल्नुहोस्', 'Create Fixed Deposit')}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>

            <div className="mt-space-md flex items-center justify-between text-xs text-surface-variant font-body-sm">
              <span>{t(`सदस्य बचत खाताबाट सिधै भुक्तानी (उपलब्ध: रु. ${regularSavingsBalance.toLocaleString()})`, `Funded directly from Member Savings (Available: NPR ${regularSavingsBalance.toLocaleString()})`)}</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-accent-lime shrink-0" />
                {t('बिमा तथा कोष सुरक्षित', 'Insurance Protected')}
              </span>
            </div>
          </div>
          )}
        </div>
      </section>

      {/* SECTION 3: COOPERATIVE CAPITAL BENEFIT & GOVERNANCE TILES */}
      {(viewMode === 'all' || viewMode === 'calculator') && (
        <section className="space-y-space-md pt-space-md">
        <div>
          <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
            {t('खण्ड ०३ • सदस्य सुविधा तथा अधिकार', 'Part 03 • Member Privileges & Rights')}
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
            {t('सहकारी पुँजीका सुविधाहरू तथा मूल्य मान्यता', 'Cooperative Capital Privileges & Value Metrics')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {/* Privilege 1 */}
          <div className="bg-surface-card rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                <Vote className="w-6 h-6" />
              </div>
              <span className="font-headline-xl text-headline-xl font-black text-primary/10 select-none">01</span>
            </div>
            <div className="my-space-md">
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                {t('प्रजातान्त्रिक मत तथा साधारण सभा अधिकार', 'Democratic Voice & AGM Rights')}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t(
                  'कम्तीमा १०० कित्ता सेयर स्वामित्वले वार्षिक साधारण सभामा मत दिने, प्रस्ताव राख्ने र लेखापरीक्षण समीक्षा गर्ने अधिकार दिन्छ।',
                  'Holding at least 100 shares entitles you to vote, table proposals, and audit fiscal statements in annual cooperative elections.'
                )}
              </p>
            </div>
            <div className="font-label-sm text-label-sm text-primary font-bold flex items-center gap-1">
              <span>{t('मतदान योग्यता: पूर्ण योग्य', 'Voting Status: Fully Eligible')}</span>
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
            </div>
          </div>

          {/* Privilege 2 */}
          <div className="bg-surface-card rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="font-headline-xl text-headline-xl font-black text-primary/10 select-none">02</span>
            </div>
            <div className="my-space-md">
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                {t('९०% द्रुत धितो कर्जा सुविधा', '90% Fast-Track Collateral Loan')}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t(
                  'मुद्दती निक्षेप प्रमाणपत्र धितो राखी १.५% प्रिमियममा बिना कुनै झन्झट तत्काल आकस्मिक कर्जा पाउन सकिन्छ।',
                  'Leverage Mudhati Fixed Deposit certificates as digital collateral for emergency liquidity at 1.5% over the deposit rate without paperwork.'
                )}
              </p>
            </div>
            <div className="font-label-sm text-label-sm text-primary font-bold flex items-center gap-1">
              <span>{t(`पूर्व-स्वीकृत सीमा: रु. ${eligibleLoanLimit.toLocaleString()}`, `Pre-approved Limit: NPR ${eligibleLoanLimit.toLocaleString()}`)}</span>
              <Zap className="w-4 h-4 text-primary shrink-0" />
            </div>
          </div>

          {/* Privilege 3 */}
          <div className="bg-surface-card rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="font-headline-xl text-headline-xl font-black text-primary/10 select-none">03</span>
            </div>
            <div className="my-space-md">
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                {t('सदस्य कल्याण तथा राहत कोष सुरक्षा', 'Member Welfare Fund Protection')}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t(
                  'सहकारी बचत तथा मुनाफाबाट आकस्मिक उपचार, प्रसूति खर्च र काजकिरिया सहयोग बापत रु. ५०,००० सम्म राहत उपलब्ध गराइन्छ।',
                  'Cooperative surplus allocation provides up to NPR 50,000 for critical medical support, child maternity grants, and bereavement condolences.'
                )}
              </p>
            </div>
            <div className="font-label-sm text-label-sm text-status-success font-bold flex items-center gap-1">
              <span>{t('सक्रिय सुविधा: उनको कल्याण कोष', 'Active Policy: Unako Kalyan Kosh')}</span>
              <Activity className="w-4 h-4 text-status-success shrink-0" />
            </div>
          </div>
        </div>
      </section>
      )}
    </>
  );
}
