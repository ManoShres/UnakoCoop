import React, { useState } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';

export function LoanPortfolioPage() {
  const { t } = useLanguageStore();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // EMI Payment State
  const [paymentAmount, setPaymentAmount] = useState(14800);
  const [paymentSource, setPaymentSource] = useState('savings');

  // Application State
  const [loanCategory, setLoanCategory] = useState('कृषि तथा पशुपालन कर्जा (Agriculture Loan)');
  const [loanRequested, setLoanRequested] = useState(150000);
  const [loanTenure, setLoanTenure] = useState(24);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleEmiPayment = () => {
    setShowEmiModal(false);
    showToast(t(`किस्ता भुक्तानी सफल भयो! (रु. ${paymentAmount.toLocaleString('en-IN')})`, `EMI Payment of NPR ${paymentAmount.toLocaleString('en-IN')} Successful!`));
  };

  const handleApplySubmit = () => {
    setShowApplyModal(false);
    showToast(t('ऋण आवेदन सञ्चालक समिति समीक्षाका लागि पेश भयो!', 'Loan application submitted for board review!'));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-surface-dark text-white px-5 py-3 rounded-xl shadow-2xl border border-primary/40 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-status-success text-xl">check_circle</span>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Main Stitch Loan Portfolio View */}
      <div className="flex flex-col w-full">
<div className="flex flex-col gap-space-lg w-full max-w-[1280px] mx-auto pb-space-2xl">
{/*  Top Status Header & Cooperative Subsidy Banner  */}
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
<div>
<div className="flex items-center gap-space-xs mb-space-xs">
<span className="inline-flex items-center gap-1 bg-surface-container-high text-primary px-space-sm py-0.5 rounded-full font-label-sm text-label-sm">
<span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
            {t('सक्रिय ऋण खाता', 'Active Loan Account')}
          </span>
<span className="text-on-surface-variant font-label-sm text-label-sm">•</span>
<span className="font-tabular-mono text-label-sm text-on-surface-variant">LN-2080-0419</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">{t('कृषि तथा पशुपालन कर्जा पोर्टफोलियो', 'Krishi & Dairy Loan Portfolio')}</h1>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Krishi &amp; Dairy Entrepreneurship Loan • Chainpur-5, Gadhwa Dairy Cluster</p>
</div>
{/*  Quick Stats Pill Strip  */}
<div className="flex items-center flex-wrap gap-space-sm">
<div className="bg-surface-card px-space-md py-space-sm rounded-xl shadow-sm flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">verified_user</span>
</div>
<div>
<div className="font-label-sm text-label-sm text-on-surface-variant">{t('ब्याज छुट सुविधा', 'Rebate Eligibility')}</div>
<div className="text-sm sm:text-base font-bold text-status-success">{t('१.५% ब्याज अनुदान', '1.5% Subsidized')}</div>
</div>
</div>
<div className="bg-surface-card px-space-md py-space-sm rounded-xl shadow-sm flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">calendar_clock</span>
</div>
<div>
<div className="font-label-sm text-label-sm text-on-surface-variant">{t('अर्को किस्ता मिति', 'Next Due Date')}</div>
<div className="text-sm sm:text-base font-bold text-on-surface">Chaitra 15, 2081</div>
</div>
</div>
<button onClick={() => setShowApplyModal(true)} className="bg-primary hover:bg-primary-container text-on-primary px-space-md py-space-sm rounded-xl font-label-md text-label-md flex items-center gap-space-xs transition-all shadow-sm" >
<span className="material-symbols-outlined text-[18px]">add_circle</span>
<span>Apply Top-up</span>
</button>
</div>
</div>
{/*  Loan Overview Bento Grid: Active Progress + Interactive EMI Center  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
{/*  Left 7 Cols: Loan Progress & Collateral Overview  */}
<div className="lg:col-span-7 flex flex-col gap-space-lg">
{/*  Main Loan Hero Card with Circular Radial Gauge  */}
<div className="bg-surface-card rounded-2xl p-space-lg shadow-sm relative overflow-hidden">
<div className="absolute -right-12 -top-12 w-64 h-64 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md pb-space-md">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Approved Facility Details</span>
<h2 className="font-headline-md text-headline-md text-on-surface mt-0.5">Commercial Dairy Buffalo Expansion</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Sanctioned: Kartik 12, 2080 • Tenor: 36 Months Diminishing</p>
</div>
<span className="inline-flex items-center gap-1.5 px-space-sm py-1 bg-surface-container text-primary font-label-sm text-label-sm rounded-full font-semibold">
<span className="material-symbols-outlined text-[16px]">percent</span>
              8.50% p.a. (Diminishing)
            </span>
</div>
{/*  Progress Ring & Numbers Mosaic  */}
<div className="grid grid-cols-1 sm:grid-cols-12 gap-space-md items-center pt-space-sm">
{/*  SVG Progress Ring Gauge  */}
<div className="sm:col-span-5 flex flex-col items-center justify-center p-space-md bg-surface-container-low rounded-xl relative">
<div className="relative w-40 h-40 flex items-center justify-center">
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
<circle className="text-outline-variant/30" cx="60" cy="60" fill="transparent" r="50" stroke="currentColor" strokeWidth="12"></circle>
<circle className="text-primary transition-all duration-1000 ease-out" cx="60" cy="60" fill="transparent" r="50" stroke="currentColor" strokeDasharray="314.159" strokeDashoffset="124.09" strokeLinecap="round" strokeWidth="12"></circle>
</svg>
<div className="absolute flex flex-col items-center justify-center text-center">
<span className="font-display-stat text-display-stat text-on-surface font-extrabold leading-none">60.5<span className="text-primary font-headline-sm text-headline-sm">%</span></span>
<span className="font-label-sm text-label-sm text-on-surface-variant mt-1">Cleared</span>
</div>
</div>
<div className="flex items-center gap-2 mt-space-sm font-label-sm text-label-sm text-on-surface font-semibold">
<span className="w-2.5 h-2.5 rounded-full bg-primary"></span> 24 Paid
                <span className="text-on-surface-variant">•</span>
<span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span> 12 Left
              </div>
</div>
{/*  Financial Aggregates  */}
<div className="sm:col-span-7 flex flex-col justify-between gap-space-sm h-full">
<div className="bg-surface-canvas p-space-md rounded-xl">
<div className="flex justify-between items-center mb-1">
<span className="font-label-sm text-label-sm text-on-surface-variant">{t('बाँकी साँवा रकम', 'Remaining Balance')}</span>
<span className="font-label-sm text-label-sm font-bold text-primary">39.5% Left</span>
</div>
<div className="font-display-stat text-display-stat-mobile text-on-surface font-bold tracking-tight">
<span className="text-headline-sm font-normal text-on-surface-variant mr-1">NPR</span>1,18,420
                </div>
<div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-space-xs">
<div className="bg-primary h-full rounded-full" style={{"width":"60.5%"}}></div>
</div>
</div>
<div className="grid grid-cols-2 gap-space-sm">
<div className="bg-surface-canvas p-space-sm rounded-xl">
<span className="font-label-sm text-label-sm text-on-surface-variant">Sanctioned</span>
<p className="text-sm sm:text-base font-bold font-tabular-mono text-on-surface whitespace-nowrap mt-0.5">NPR 3,00,000</p>
<span className="font-label-sm text-label-sm text-on-surface-variant">Initial Principal</span>
</div>
<div className="bg-surface-canvas p-space-sm rounded-xl">
<span className="font-label-sm text-label-sm text-status-success font-semibold">Total Paid</span>
<p className="text-sm sm:text-base font-bold font-tabular-mono text-status-success whitespace-nowrap mt-0.5">NPR 1,81,580</p>
<span className="font-label-sm text-label-sm text-on-surface-variant">24 Installments</span>
</div>
</div>
</div>
</div>
{/*  Collateral & Project Micro Bar  */}
<div className="mt-space-md pt-space-md bg-surface-canvas rounded-xl p-space-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm">
<img className="w-12 h-12 rounded-lg object-cover shadow-sm" data-alt="Close-up of a Murrah dairy buffalo herd in a clean modern rural shed in Terai Nepal with green fodder and stainless milking cans under soft morning sunlight" src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=150&h=150&fit=crop&q=80"/>
<div>
<p className="font-label-md text-label-md text-on-surface font-bold">Asset Hypothecation: 6 Murrah Buffaloes</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">Gadhwa-5 Shed Inspection: Verified by Field Officer (Falgun 2081)</p>
</div>
</div>
<a className="text-primary hover:text-primary-container font-label-md text-label-md font-semibold flex items-center gap-1 transition-colors" href="#schedule">
              Schedule Details
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
</a>
</div>
</div>
{/*  Repayment Health & Agro Rebate Honor Banner  */}
<div className="bg-surface-card rounded-2xl p-space-lg shadow-sm relative overflow-hidden">
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
<div className="flex items-start gap-space-md">
<div className="w-12 h-12 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-primary flex-shrink-0">
<span className="material-symbols-outlined text-[28px]" style={{"fontVariationSettings":"'FILL' 1"}}>eco</span>
</div>
<div>
<div className="flex items-center gap-2">
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">100% On-Time Honor Score</h3>
<span className="bg-status-success/15 text-status-success font-label-sm text-label-sm px-2 py-0.5 rounded-md font-bold">Grade A+</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  You qualify for the Nepal Ministry of Agriculture 1.5% interest subsidy. Cumulative rebate earned to date: <strong className="text-on-surface font-semibold">NPR 4,120</strong>, credited to your Regular Savings.
                </p>
</div>
</div>
<div className="flex items-center gap-1 bg-surface-container-low px-space-md py-space-sm rounded-xl">
<span className="material-symbols-outlined text-status-success text-[20px]">workspace_premium</span>
<span className="font-label-md text-label-md font-bold text-on-surface">Subsidized Rate: 7.0%</span>
</div>
</div>
</div>
</div>
{/*  Right 5 Cols: Interactive Pay EMI Module  */}
<div className="lg:col-span-5 flex flex-col gap-space-md">
<div className="bg-surface-dark text-on-primary rounded-2xl p-space-lg shadow-xl relative overflow-hidden">
{/*  Subtle Glow  */}
<div className="absolute -right-16 -bottom-16 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
{/*  Header  */}
<div className="flex items-center justify-between pb-space-md">
<div className="flex items-center gap-space-xs">
<span className="w-2.5 h-2.5 rounded-full bg-brand-accent-lime animate-ping"></span>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-brand-accent-lime font-bold">Immediate Due</span>
</div>
<span className="font-tabular-mono text-label-sm bg-surface-dark-card px-2.5 py-1 rounded-full text-outline-variant">
              Installment #25 of 36
            </span>
</div>
{/*  Due Amount Display  */}
<div className="bg-surface-dark-card/90 rounded-xl p-space-md mb-space-md backdrop-blur">
<div className="flex items-baseline justify-between">
<span className="font-label-sm text-label-sm text-tertiary-fixed-dim">Installment Amount Due</span>
<span className="font-label-sm text-label-sm text-brand-accent-lime font-semibold">Zero Delay Fine</span>
</div>
<div className="font-display-stat text-display-stat text-on-primary font-bold my-1 tracking-tight">
<span className="text-headline-md font-normal text-tertiary-fixed-dim mr-1">NPR</span>8,640
            </div>
<div className="grid grid-cols-2 gap-2 pt-space-xs text-xs text-tertiary-fixed-dim">
<div className="flex justify-between bg-surface-dark/60 px-2.5 py-1.5 rounded-lg">
<span>Principal:</span>
<span className="text-on-primary font-tabular-mono font-semibold">NPR 7,120</span>
</div>
<div className="flex justify-between bg-surface-dark/60 px-2.5 py-1.5 rounded-lg">
<span>Interest:</span>
<span className="text-on-primary font-tabular-mono font-semibold">NPR 1,520</span>
</div>
</div>
</div>
{/*  Due Date Notification  */}
<div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-dark-card/60 mb-space-md text-xs text-outline-variant">
<span className="material-symbols-outlined text-[18px] text-brand-accent-lime">alarm</span>
<span>Due on <strong>Chaitra 15, 2081 (March 28, 2025)</strong> • 4 days remaining</span>
</div>
{/*  Payment Mode Selection  */}
<div className="mb-space-md">
<label className="block font-label-sm text-label-sm text-tertiary-fixed-dim uppercase tracking-wider mb-space-xs">
              Select Payment Source
            </label>
<div className="space-y-space-xs" id="payment-source-selector">
{/*  Regular Savings Option  */}
<label className="flex items-center justify-between p-space-sm rounded-xl bg-surface-dark-card cursor-pointer hover:bg-surface-dark-card/80 transition-all">
<div className="flex items-center gap-space-sm">
<input defaultChecked={true} className="accent-brand-accent-lime w-4 h-4 cursor-pointer" name="payment_source" type="radio" value="savings"/>
<div>
<p className="font-label-md text-label-md text-on-primary font-semibold">Regular Savings (नियमित बचत)</p>
<p className="font-tabular-mono text-label-sm text-brand-accent-lime">Available: NPR 1,84,500</p>
</div>
</div>
<span className="font-label-sm text-label-sm bg-primary/40 text-brand-accent-lime px-2 py-0.5 rounded">Fastest</span>
</label>
{/*  eSewa / Khalti Digital Wallets  */}
<label className="flex items-center justify-between p-space-sm rounded-xl bg-surface-dark-card/60 cursor-pointer hover:bg-surface-dark-card transition-all">
<div className="flex items-center gap-space-sm">
<input className="accent-brand-accent-lime w-4 h-4 cursor-pointer" name="payment_source" type="radio" value="esewa"/>
<div>
<p className="font-label-md text-label-md text-on-primary font-semibold">eSewa Mobile Wallet</p>
<p className="font-label-sm text-label-sm text-outline-variant">Direct wallet checkout</p>
</div>
</div>
<span className="material-symbols-outlined text-[20px] text-outline-variant">account_balance_wallet</span>
</label>
{/*  ConnectIPS Interbank Option  */}
<label className="flex items-center justify-between p-space-sm rounded-xl bg-surface-dark-card/60 cursor-pointer hover:bg-surface-dark-card transition-all">
<div className="flex items-center gap-space-sm">
<input className="accent-brand-accent-lime w-4 h-4 cursor-pointer" name="payment_source" type="radio" value="connectips"/>
<div>
<p className="font-label-md text-label-md text-on-primary font-semibold">NCHL / ConnectIPS</p>
<p className="font-label-sm text-label-sm text-outline-variant">Direct bank account debit</p>
</div>
</div>
<span className="material-symbols-outlined text-[20px] text-outline-variant">hub</span>
</label>
</div>
</div>
{/*  Action Button  */}
<button className="w-full bg-brand-accent-lime hover:bg-brand-accent-lime/90 text-surface-dark font-label-md text-label-md font-bold py-3.5 px-space-md rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg" id="pay-emi-button" >
<span className="material-symbols-outlined text-[20px]">check_circle</span>
<span>Pay NPR 8,640 Now</span>
</button>
<p className="font-label-sm text-label-sm text-center text-outline-variant mt-space-sm flex items-center justify-center gap-1">
<span className="material-symbols-outlined text-[14px]">lock</span>
            Encrypted cooperative ledger settlement • Zero transaction fee
          </p>
</div>
{/*  Quick Summary Mini-card  */}
<div className="bg-surface-card rounded-2xl p-space-md shadow-sm flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">receipt_long</span>
</div>
<div>
<p className="font-label-md text-label-md text-on-surface font-semibold">Latest Statement</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">Falgun 15, 2081 (Cleared)</p>
</div>
</div>
<button className="text-primary hover:text-primary-container p-space-xs rounded-lg hover:bg-surface-container transition-all flex items-center gap-1 font-label-sm text-label-sm font-semibold" >
<span className="material-symbols-outlined text-[18px]">download</span>
            PDF
          </button>
</div>
</div>
</div>
{/*  Interactive Pre-Approved Top-Up Loan Calculator Section  */}
<div className="bg-surface-card rounded-2xl p-space-lg shadow-sm" id="calculator-section">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
{/*  Left Banner Details  */}
<div className="lg:col-span-5 flex flex-col justify-between h-full">
<div>
<div className="inline-flex items-center gap-1.5 bg-brand-accent-light text-primary px-space-sm py-1 rounded-full font-label-sm text-label-sm font-bold mb-space-sm">
<span className="material-symbols-outlined text-[16px]">verified</span>
              1-Click Instant Pre-Approval
            </div>
<h3 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Need additional farm capital?</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Based on your pristine 100% on-time track record with Unako SACCOS, you are pre-qualified for an instant Top-Up Agro loan of up to <strong className="text-on-surface">NPR 1,50,000</strong> with no additional mortgage paperwork.
            </p>
<div className="space-y-space-xs mt-space-md">
<div className="flex items-center gap-space-xs text-sm text-on-surface">
<span className="material-symbols-outlined text-status-success text-[18px]">check</span>
<span>Diminishing subsidized rate at 8.5% p.a.</span>
</div>
<div className="flex items-center gap-space-xs text-sm text-on-surface">
<span className="material-symbols-outlined text-status-success text-[18px]">check</span>
<span>Immediate disbursement into Regular Savings</span>
</div>
<div className="flex items-center gap-space-xs text-sm text-on-surface">
<span className="material-symbols-outlined text-status-success text-[18px]">check</span>
<span>Covers feed purchase, milking units, or livestock</span>
</div>
</div>
</div>
<div className="pt-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-10 h-10 rounded-full object-cover shadow-sm" data-alt="Warm portrait of Nepali agricultural cooperative member smiling beside a healthy dairy cattle shed in rural Dang district" src="/assets/kyc/avatar_hari.png"/>
<p className="font-label-sm text-label-sm text-on-surface-variant">Approved under Nepal Agriculture Development Strategy 2081</p>
</div>
</div>
</div>
{/*  Right: Interactive Slider & EMI Estimator Module  */}
<div className="lg:col-span-7 bg-surface-canvas rounded-xl p-space-lg">
<div className="flex flex-col gap-space-md">
{/*  Loan Amount Slider  */}
<div>
<div className="flex justify-between items-center mb-space-xs">
<span className="font-label-md text-label-md text-on-surface font-semibold">Desired Top-Up Amount</span>
<span className="text-base sm:text-lg font-bold font-tabular-mono text-primary" id="topup-amount-display">NPR 1,00,000</span>
</div>
<input className="w-full accent-primary h-2 bg-surface-container-high rounded-lg cursor-pointer" id="topup-range" max="150000" min="30000"  step="5000" type="range" value="100000"/>
<div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mt-1">
<span>NPR 30,000 (Min)</span>
<span>NPR 1,50,000 (Max Limit)</span>
</div>
</div>
{/*  Tenor Selector Buttons  */}
<div>
<span className="font-label-md text-label-md text-on-surface font-semibold block mb-space-xs">Repayment Tenor (Months)</span>
<div className="grid grid-cols-3 gap-space-sm" id="tenor-selector">
<button className="tenor-btn py-2 px-space-sm rounded-xl font-label-md text-label-md font-semibold bg-surface-card hover:bg-surface-container text-on-surface text-center transition-all"  type="button">
                  12 Months
                </button>
<button className="tenor-btn py-2 px-space-sm rounded-xl font-label-md text-label-md font-semibold bg-primary text-on-primary text-center transition-all shadow-sm"  type="button">
                  18 Months
                </button>
<button className="tenor-btn py-2 px-space-sm rounded-xl font-label-md text-label-md font-semibold bg-surface-card hover:bg-surface-container text-on-surface text-center transition-all"  type="button">
                  24 Months
                </button>
</div>
</div>
{/*  Calculated Metrics Output Mosaic  */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm bg-surface-card p-space-md rounded-xl">
<div>
<span className="font-label-sm text-label-sm text-on-surface-variant">Estimated Monthly EMI</span>
<p className="text-base sm:text-lg font-bold font-tabular-mono text-primary mt-0.5" id="calc-emi">NPR 5,935</p>
<span className="font-label-sm text-label-sm text-on-surface-variant">Principal + Int.</span>
</div>
<div>
<span className="font-label-sm text-label-sm text-on-surface-variant">Effective Rate</span>
<p className="text-base sm:text-lg font-bold font-tabular-mono text-on-surface mt-0.5">8.50%</p>
<span className="font-label-sm text-label-sm text-status-success font-semibold">Subsidized</span>
</div>
<div>
<span className="font-label-sm text-label-sm text-on-surface-variant">Govt. Rebate Relief</span>
<p className="text-base sm:text-lg font-bold font-tabular-mono text-status-success mt-0.5" id="calc-rebate">NPR 1,120</p>
<span className="font-label-sm text-label-sm text-on-surface-variant">Annual savings</span>
</div>
</div>
{/*  Trigger Instant Apply Modal/Action  */}
<div className="flex flex-col sm:flex-row items-center gap-space-sm pt-space-xs">
<button className="w-full sm:w-auto flex-1 bg-primary hover:bg-primary-container text-on-primary py-3 px-space-lg rounded-xl font-label-md text-label-md font-bold transition-all flex items-center justify-center gap-2 shadow-sm" >
<span className="material-symbols-outlined text-[18px]">bolt</span>
<span>Apply with 1-Click Approval</span>
</button>
<button className="w-full sm:w-auto bg-surface-card hover:bg-surface-container px-space-md py-3 rounded-xl font-label-md text-label-md text-on-surface font-semibold transition-all flex items-center justify-center gap-1.5" >
<span className="material-symbols-outlined text-[18px]">calculate</span>
                Download Projection
              </button>
</div>
</div>
</div>
</div>
</div>
{/*  Complete Amortization & Repayment Schedule Table  */}
<div className="bg-surface-card rounded-2xl p-space-lg shadow-sm" id="schedule">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-lg">
<div>
<div className="flex items-center gap-2">
<h3 className="font-headline-md text-headline-md text-on-surface font-bold">Amortization &amp; Payment Ledger</h3>
<span className="bg-surface-container px-space-sm py-0.5 rounded-full font-label-sm text-label-sm font-semibold text-primary">36 Installments Total</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Complete record of cleared installments, immediate dues, and future forecasts</p>
</div>
{/*  Filter Controls  */}
<div className="flex items-center gap-space-xs">
<div className="inline-flex bg-surface-container-low p-1 rounded-xl">
<button className="schedule-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold bg-surface-card text-on-surface shadow-xs transition-all" >All</button>
<button className="schedule-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold text-on-surface-variant hover:text-on-surface transition-all" >Paid (24)</button>
<button className="schedule-filter px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-semibold text-on-surface-variant hover:text-on-surface transition-all" >Upcoming (12)</button>
</div>
<button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all"  title="Print Statement">
<span className="material-symbols-outlined text-[20px]">print</span>
</button>
</div>
</div>
{/*  Schedule Table  */}
<div className="overflow-x-auto">
<table className="w-full text-left font-body-sm text-body-sm">
<thead>
<tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
<th className="py-space-sm px-space-md rounded-l-xl">No.</th>
<th className="py-space-sm px-space-md">Due Date (B.S.)</th>
<th className="py-space-sm px-space-md">Principal (साँवा)</th>
<th className="py-space-sm px-space-md">Interest (ब्याज)</th>
<th className="py-space-sm px-space-md">Total Installment</th>
<th className="py-space-sm px-space-md">Remaining Principal</th>
<th className="py-space-sm px-space-md">Status</th>
<th className="py-space-sm px-space-md text-right rounded-r-xl">Receipt</th>
</tr>
</thead>
<tbody className="divide-y divide-transparent font-tabular-mono" id="amortization-table-body">
{/*  Installment #25 (Immediate Active Due)  */}
<tr className="bg-surface-container-high/40 hover:bg-surface-container-high transition-colors font-medium row-upcoming">
<td className="py-space-sm px-space-md font-bold text-on-surface">#25</td>
<td className="py-space-sm px-space-md text-on-surface font-semibold">Chaitra 15, 2081</td>
<td className="py-space-sm px-space-md text-on-surface">NPR 7,120</td>
<td className="py-space-sm px-space-md text-on-surface-variant">NPR 1,520</td>
<td className="py-space-sm px-space-md font-bold text-primary">NPR 8,640</td>
<td className="py-space-sm px-space-md text-on-surface">NPR 1,11,300</td>
<td className="py-space-sm px-space-md">
<span className="inline-flex items-center gap-1 bg-brand-accent-lime/20 text-primary px-2.5 py-1 rounded-full text-xs font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Action Due
                </span>
</td>
<td className="py-space-sm px-space-md text-right">
<button className="bg-primary hover:bg-primary-container text-on-primary text-xs font-label-sm px-3 py-1 rounded-lg transition-all font-semibold" >
                  Pay Now
                </button>
</td>
</tr>
{/*  Installment #24 (Paid)  */}
<tr className="hover:bg-surface-container-low transition-colors row-paid">
<td className="py-space-sm px-space-md text-on-surface-variant">#24</td>
<td className="py-space-sm px-space-md text-on-surface">Falgun 15, 2081</td>
<td className="py-space-sm px-space-md text-on-surface">NPR 7,040</td>
<td className="py-space-sm px-space-md text-on-surface-variant">NPR 1,600</td>
<td className="py-space-sm px-space-md text-on-surface">NPR 8,640</td>
<td className="py-space-sm px-space-md text-on-surface">NPR 1,18,420</td>
<td className="py-space-sm px-space-md">
<span className="inline-flex items-center gap-1 bg-status-success/10 text-status-success px-2.5 py-0.5 rounded-full text-xs font-semibold">
<span className="material-symbols-outlined text-[14px]">check</span>
                  Paid (On Time)
                </span>
</td>
<td className="py-space-sm px-space-md text-right">
<button className="text-primary hover:text-primary-container p-1 rounded hover:bg-surface-container-high transition-all"  title="Download Official Receipt">
<span className="material-symbols-outlined text-[18px]">download</span>
</button>
</td>
</tr>
{/*  Installment #23 (Paid)  */}
<tr className="hover:bg-surface-container-low transition-colors row-paid">
<td className="py-space-sm px-space-md text-on-surface-variant">#23</td>
<td className="py-space-sm px-space-md text-on-surface">Magh 15, 2081</td>
<td className="py-space-sm px-space-md text-on-surface">NPR 6,960</td>
<td className="py-space-sm px-space-md text-on-surface-variant">NPR 1,680</td>
<td className="py-space-sm px-space-md text-on-surface">NPR 8,640</td>
<td className="py-space-sm px-space-md text-on-surface">NPR 1,25,460</td>
<td className="py-space-sm px-space-md">
<span className="inline-flex items-center gap-1 bg-status-success/10 text-status-success px-2.5 py-0.5 rounded-full text-xs font-semibold">
<span className="material-symbols-outlined text-[14px]">check</span>
                  Paid (On Time)
                </span>
</td>
<td className="py-space-sm px-space-md text-right">
<button className="text-primary hover:text-primary-container p-1 rounded hover:bg-surface-container-high transition-all" >
<span className="material-symbols-outlined text-[18px]">download</span>
</button>
</td>
</tr>
{/*  Installment #22 (Paid)  */}
<tr className="hover:bg-surface-container-low transition-colors row-paid">
<td className="py-space-sm px-space-md text-on-surface-variant">#22</td>
<td className="py-space-sm px-space-md text-on-surface">Poush 15, 2081</td>
<td className="py-space-sm px-space-md text-on-surface">NPR 6,880</td>
<td className="py-space-sm px-space-md text-on-surface-variant">NPR 1,760</td>
<td className="py-space-sm px-space-md text-on-surface">NPR 8,640</td>
<td className="py-space-sm px-space-md text-on-surface">NPR 1,32,420</td>
<td className="py-space-sm px-space-md">
<span className="inline-flex items-center gap-1 bg-status-success/10 text-status-success px-2.5 py-0.5 rounded-full text-xs font-semibold">
<span className="material-symbols-outlined text-[14px]">check</span>
                  Paid (On Time)
                </span>
</td>
<td className="py-space-sm px-space-md text-right">
<button className="text-primary hover:text-primary-container p-1 rounded hover:bg-surface-container-high transition-all" >
<span className="material-symbols-outlined text-[18px]">download</span>
</button>
</td>
</tr>
{/*  Installment #26 (Future)  */}
<tr className="hover:bg-surface-container-low transition-colors text-on-surface-variant row-upcoming">
<td className="py-space-sm px-space-md">#26</td>
<td className="py-space-sm px-space-md">Baisakh 15, 2082</td>
<td className="py-space-sm px-space-md">NPR 7,200</td>
<td className="py-space-sm px-space-md">NPR 1,440</td>
<td className="py-space-sm px-space-md font-semibold text-on-surface">NPR 8,640</td>
<td className="py-space-sm px-space-md">NPR 1,04,100</td>
<td className="py-space-sm px-space-md">
<span className="inline-flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-full text-xs text-on-surface-variant">
                  Scheduled
                </span>
</td>
<td className="py-space-sm px-space-md text-right text-outline-variant text-xs">Pending</td>
</tr>
{/*  Installment #27 (Future)  */}
<tr className="hover:bg-surface-container-low transition-colors text-on-surface-variant row-upcoming">
<td className="py-space-sm px-space-md">#27</td>
<td className="py-space-sm px-space-md">Jestha 15, 2082</td>
<td className="py-space-sm px-space-md">NPR 7,280</td>
<td className="py-space-sm px-space-md">NPR 1,360</td>
<td className="py-space-sm px-space-md font-semibold text-on-surface">NPR 8,640</td>
<td className="py-space-sm px-space-md">NPR 96,820</td>
<td className="py-space-sm px-space-md">
<span className="inline-flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-full text-xs text-on-surface-variant">
                  Scheduled
                </span>
</td>
<td className="py-space-sm px-space-md text-right text-outline-variant text-xs">Pending</td>
</tr>
{/*  Installment #28 (Future)  */}
<tr className="hover:bg-surface-container-low transition-colors text-on-surface-variant row-upcoming">
<td className="py-space-sm px-space-md">#28</td>
<td className="py-space-sm px-space-md">Ashadh 15, 2082</td>
<td className="py-space-sm px-space-md">NPR 7,360</td>
<td className="py-space-sm px-space-md">NPR 1,280</td>
<td className="py-space-sm px-space-md font-semibold text-on-surface">NPR 8,640</td>
<td className="py-space-sm px-space-md">NPR 89,460</td>
<td className="py-space-sm px-space-md">
<span className="inline-flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-full text-xs text-on-surface-variant">
                  Scheduled
                </span>
</td>
<td className="py-space-sm px-space-md text-right text-outline-variant text-xs">Pending</td>
</tr>
</tbody>
</table>
</div>
<div className="flex items-center justify-between pt-space-md mt-space-sm text-xs text-on-surface-variant">
<span>Showing 7 of 36 installments for LN-2080-0419</span>
<button className="font-label-sm text-label-sm font-semibold text-primary hover:text-primary-container flex items-center gap-1" >
          Export Full Schedule (.CSV / PDF)
          <span className="material-symbols-outlined text-[16px]">file_download</span>
</button>
</div>
</div>
{/*  Cooperative Advisory & Field Officer Contact Footplate  */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div className="bg-surface-card rounded-2xl p-space-md shadow-sm flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
<span className="material-symbols-outlined text-[26px]">support_agent</span>
</div>
<div>
<h4 className="text-sm sm:text-base font-bold text-on-surface font-headline">Assigned Field Loan Officer</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Bikram Thapa (Chainpur Dairy Liaison Desk)</p>
<p className="font-label-sm text-label-sm text-primary font-semibold mt-1">Direct: +977 98578-23412 • Gadhwa Service Center</p>
</div>
</div>
<div className="bg-surface-card rounded-2xl p-space-md shadow-sm flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-status-success flex-shrink-0">
<span className="material-symbols-outlined text-[26px]">security</span>
</div>
<div>
<h4 className="text-sm sm:text-base font-bold text-on-surface font-headline">Cooperative Deposit &amp; Credit Guarantee</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant">Cattle Tagged: DCGF-GDH-2080-9941 with Livestock Insurance</p>
<span className="font-label-sm text-label-sm text-status-success font-semibold mt-1 inline-block">100% Insured under Nepal Agri Insurance Scheme</span>
</div>
</div>
</div>
</div>
</div>


      {/* EMI Pay Modal */}
      {showEmiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowEmiModal(false)}
        >
          <div
            className="bg-surface-card max-w-md w-full rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                <h3 className="font-headline-sm font-bold text-on-surface">{t('ऋण किस्ता भुक्तानी', 'Pay Loan EMI')}</h3>
              </div>
              <button
                onClick={() => setShowEmiModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex justify-between items-center">
                <div>
                  <div className="text-xs text-on-surface-variant font-medium">Monthly Installment (EMI #14)</div>
                  <div className="text-xl font-bold font-tabular-mono text-primary">NPR 14,800.00</div>
                </div>
                <span className="px-2.5 py-1 bg-status-success/15 text-status-success text-xs font-bold rounded-full">
                  Due in 3 Days
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">{t('भुक्तानी स्रोत खाता', 'Debit Source Account')}</label>
                <select
                  value={paymentSource}
                  onChange={(e) => setPaymentSource(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="savings">{t('ऐच्छिक बचत खाता - मौज्दात: रु. १,८४,३५०', 'Regular Savings - Balance: NPR 184,350')}</option>
                  <option value="monthly">{t('मासिक आवर्ती बचत - मौज्दात: रु. ४५,०००', 'Monthly Recurring Savings - Balance: NPR 45,000')}</option>
                  <option value="wallet">eSewa / Khalti Digital Direct</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">{t('भुक्तानी रकम (रु.)', 'Payment Amount (NPR)')}</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-tabular-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmiModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container-low transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleEmiPayment}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-md hover:bg-primary/95 transition flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">lock</span>
                  {t('पुष्टि गर्नुहोस्', 'Confirm Payment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Loan Modal */}
      {showApplyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowApplyModal(false)}
        >
          <div
            className="bg-surface-card max-w-lg w-full rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                <h3 className="font-headline-sm font-bold text-on-surface">{t('नयाँ ऋण आवेदन', 'New Loan Application')}</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">{t('ऋण योजना', 'Loan Scheme')}</label>
                <select
                  value={loanCategory}
                  onChange={(e) => setLoanCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option>कृषि तथा पशुपालन कर्जा (Agriculture & Dairy - 9.5%)</option>
                  <option>{t('महिला उद्यमशीलता कर्जा (७.०% अनुदान)', 'Women Entrepreneurship Loan (7.0% Subsidized)')}</option>
                  <option>{t('आकस्मिक तथा स्वास्थ्य कर्जा (१०.५%)', 'Emergency & Medical Loan (10.5%)')}</option>
                  <option>{t('शैक्षिक कर्जा (८.५%)', 'Education Loan (8.5%)')}</option>
                  <option>{t('साना व्यवसाय कर्जा (११.०%)', 'Micro Small Business Loan (11.0%)')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">{t('माग गरिएको रकम (रु.)', 'Requested Amount (NPR)')}</label>
                <input
                  type="number"
                  value={loanRequested}
                  step="10000"
                  onChange={(e) => setLoanRequested(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-tabular-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-[11px] text-on-surface-variant mt-1">अधिकतम सीमा: NPR 5,00,000 (Based on Shareholding & Collateral)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">{t('भुक्तानी अवधि (महिना)', 'Repayment Tenure (Months)')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {[12, 24, 36, 48].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLoanTenure(t)}
                      className={'py-2 rounded-xl text-xs font-bold border transition ' + (loanTenure === t ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant text-on-surface')}
                    >
                      {t} Months
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-2">
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>Estimated EMI</span>
                  <span className="font-bold text-on-surface font-tabular-mono">
                    NPR {Math.round((loanRequested * 1.095) / loanTenure).toLocaleString('en-IN')} / mo
                  </span>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>Subsidized Interest Rate</span>
                  <span className="font-bold text-status-success">9.5% p.a.</span>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>Coop Loan Insurance</span>
                  <span className="font-bold text-on-surface">Included (0.5%)</span>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container-low transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleApplySubmit}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-md hover:bg-primary/95 transition"
                >
                  {t('आवेदन पेश गर्नुहोस्', 'Submit Application')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
