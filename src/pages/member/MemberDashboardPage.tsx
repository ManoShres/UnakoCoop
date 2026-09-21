import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAuthStore } from '../../store/useAuthStore';

const MI = ({ n, cls = '' }: { n: string; cls?: string }) => (
  <span className={`material-symbols-outlined ${cls}`}>{n}</span>
);

const TRANSACTIONS = [
  { date: '2081-11-14', bs: '26 Feb 2025', txn: 'TXN-99482', type: 'Direct Credit', desc: 'Gadhwa Dairy Chilling Center', sub: 'Fortnight 1 Milk Settlement (142 Liters @ 110)', debit: '', credit: '+15,620', bal: '1,84,500' },
  { date: '2081-11-10', bs: '22 Feb 2025', txn: 'TXN-98210', type: 'Fonepay QR', desc: 'Chainpur Agro Seeds & Fertilizer', sub: 'Urea & Mustard Seed Bag Purchase', debit: '4,500.00', credit: '', bal: '1,68,880' },
  { date: '2081-11-05', bs: '17 Feb 2025', txn: 'TXN-97103', type: 'Auto Standing', desc: 'Krishi Agro Loan EMI #24', sub: 'Prin: NPR 6,240 | Int (11.5%): NPR 2,400', debit: '8,640.00', credit: '', bal: '1,64,380' },
  { date: '2081-11-01', bs: '13 Feb 2025', txn: 'TXN-96500', type: 'Internal Transfer', desc: 'Compulsory Savings Monthly Allocation', sub: 'To Compulsory A/C 004-10294-88-02', debit: '2,000.00', credit: '', bal: '1,73,020' },
  { date: '2081-10-29', bs: '12 Feb 2025', txn: 'TXN-94312', type: 'Interest Payout', desc: 'Q3 Savings Interest Credit (8.0% p.a.)', sub: 'Daily product balance calculation (90 days)', debit: '', credit: '+3,680', bal: '1,75,020' },
  { date: '2081-10-15', bs: '28 Jan 2025', txn: 'TXN-93021', type: 'Bulk Credit', desc: 'Gadhwa Dairy Chilling Center', sub: 'Magh Fortnight 2 Milk Sales (131 Liters)', debit: '', credit: '+14,480', bal: '1,71,340' },
  { date: '2081-10-02', bs: '15 Jan 2025', txn: 'TXN-91840', type: 'Counter Slip', desc: 'Cash Deposit - Chainpur Service Center', sub: 'Seasonal Vegetable Harvest Market proceeds', debit: '', credit: '+3,680', bal: '1,56,860' },
];

export function MemberDashboardPage() {
  const { notices } = useCoopStore();
  const { t } = useLanguageStore();
  const { currentMember } = useAuthStore();
  const activeNotice = notices.find((n) => n.isActive) || notices[0];
  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'debits' | 'interest'>('all');
  const [emiModal, setEmiModal] = useState(false);
  const [depositModal, setDepositModal] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-6 w-full max-w-[1280px] mx-auto pb-10">
      {/* ANNOUNCEMENT TICKER */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold tracking-wide shrink-0">
          <MI n="campaign" cls="text-[14px]" /> OFFICIAL NOTICE
        </span>
        <p className="text-[13px] text-on-surface font-medium truncate">
          {activeNotice ? t(activeNotice.titleNepali, activeNotice.title) : 'Unako SACCOS Member Portal Operational'}
          <Link to="/member/cooperative-governance-support" className="text-primary font-semibold ml-2 hover:underline">
            {t('विवरण हेर्नुहोस् ->', 'View Details ->')}
          </Link>
        </p>
        <span className="ml-auto text-[12px] text-on-surface-variant shrink-0 flex items-center gap-1">
          <MI n="verified" cls="text-[14px] text-status-success" /> KYC Verified
        </span>
      </div>

      {/* WELCOME HERO */}
      <section className="bg-surface-card rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-accent-lime/15 text-[12px] font-semibold text-status-success">
                <span className="w-2 h-2 rounded-full bg-brand-accent-lime animate-pulse" />
                Pradhan Sadashya (GRADE-A VERIFIED) Active Member
              </span>
              <span className="text-[12px] text-on-surface-variant">KYC Verified: 2080-04-12</span>
            </div>
            <h1 className="font-headline text-[28px] font-bold tracking-tight text-on-surface leading-tight">
              {t('नमस्ते', 'Namaste')}, {currentMember?.name || 'Hari Prasad Chaudhary'}
              {currentMember?.nameNepali && currentMember.nameNepali !== currentMember.name && (
                <span className="text-[18px] font-normal text-on-surface-variant ml-2 font-body">
                  ({currentMember.nameNepali})
                </span>
              )}
            </h1>
            <div className="flex items-center gap-4 flex-wrap mt-1.5 text-[13px] text-on-surface-variant">
              <span className="flex items-center gap-1"><MI n="badge" cls="text-[16px] text-primary" /> <strong className="text-on-surface font-mono">{currentMember?.memberNo || "UKO-2070-08842"}</strong></span>
              <span>|</span>
              <span className="flex items-center gap-1"><MI n="account_balance" cls="text-[16px] text-primary" /> Primary A/C: <strong className="text-on-surface font-mono">004-10294-88-01</strong></span>
              <span>|</span>
              <span>Branch: <strong className="text-on-surface">Gadhwa Main Branch</strong></span>
              <span>|</span>
              <span>Type: <strong className="text-on-surface">Regular Share Member</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setDepositModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold shadow hover:bg-primary-container transition-colors" type="button">
              <MI n="add_circle" cls="text-[18px]" /> {t("रकम जम्मा (eSewa / Khalti)", "Deposit (eSewa / Khalti)")}
            </button>
            <Link to="/member/transfers-payments" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-[13px] font-semibold hover:bg-surface-container transition-colors">
              <MI n="swap_horiz" cls="text-[18px] text-primary" /> {t("रकम पठाउनुहोस्", "Transfer to Member")}
            </Link>
            <button onClick={() => setEmiModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-[13px] font-semibold hover:bg-surface-container transition-colors" type="button">
              <MI n="payments" cls="text-[18px] text-status-warning" /> {t("किस्ता भुक्तानी", "Pay Loan EMI")}
            </button>
          </div>
        </div>
      </section>

      {/* NET WORTH + 4 ACCOUNT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-surface-dark to-surface-dark-card rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full" />
          <div className="text-[11px] font-semibold tracking-widest text-white/50 uppercase mb-1">Total Net Worth in Unako SACCOS</div>
          <div className="text-[38px] font-bold font-headline leading-none">NPR 3,42,850</div>
          <div className="text-[12px] text-white/50 mt-1 mb-4">All active ledgers combined</div>
          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
            {[['Regular', '1,84,500'], ['Compulsory', '68,000'], ['Shares', '50,000'], ['Mudhati', '40,350']].map(([label, val]) => (
              <div key={label}>
                <div className="text-white/50">{label}: NPR</div>
                <div className="font-bold text-[13px]">{val}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
            <span className="text-[11px] text-white/50">Annual Dividend Anticipated</span>
            <span className="text-brand-accent-lime font-bold">~12.0%</span>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Niyamit Bachat Khata', sub: 'Regular Member Savings', no: '004-10294-88-01', bal: 'NPR 1,84,500', meta: '8.0% p.a.', meta2: 'Interest Q3: +NPR 3,680', badge: '001', badgeColor: 'bg-primary' },
            { label: 'Anivaarya Masik', sub: 'Compulsory Monthly', no: '004-10294-88-02 (Auto: 2k/mo)', bal: 'NPR 68,000', meta: 'Next Due: Chaitra 30, 2081', meta2: 'Pay NPR 2,000', badge: '002', badgeColor: 'bg-secondary' },
            { label: 'Share Punji', sub: 'Share Capital', no: '500 Units @ NPR 100', bal: 'NPR 50,000', meta: 'Last Dividend: 11.2%', meta2: 'SC-2070-0419', badge: 'SC', badgeColor: 'bg-surface-dark' },
            { label: 'Muddati Niksep', sub: 'Mudhati (Fixed Deposit)', no: '10.0% p.a. | Cert #FD-88219', bal: 'NPR 40,350', meta: 'Maturity: 2082 Ashad 14', meta2: 'View Certificate', badge: 'FD', badgeColor: 'bg-on-surface-variant' },
          ].map((acct, i) => (
            <div key={i} className="bg-surface-card rounded-xl p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">{acct.label}</span>
                <span className={`text-[11px] text-white ${acct.badgeColor} rounded px-1.5 py-0.5 font-bold`}>{acct.badge}</span>
              </div>
              <div className="text-[11px] text-on-surface-variant">{acct.sub}</div>
              <div className="text-[24px] font-bold text-on-surface font-headline">{acct.bal}</div>
              <div className="text-[11px] text-on-surface-variant font-mono">{acct.no}</div>
              <div className="text-[12px] text-status-success font-semibold">{acct.meta}</div>
              <div className="text-[11px] text-on-surface-variant">{acct.meta2}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE LOAN WIDGET */}
      <section className="bg-surface-card rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-low text-primary text-[12px] font-semibold">
            <MI n="check_circle" cls="text-[14px]" /> Active Loan Account
          </span>
          <span className="text-[12px] text-on-surface-variant">LN-2099-0418</span>
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[12px] font-semibold">
            <MI n="star" cls="text-[14px]" /> 1.5% Subsidized
          </span>
          <span className="text-[12px] text-on-surface-variant">Next Due: <strong className="text-status-danger">Chaitra 15, 2081</strong></span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loan info + gauge */}
          <div>
            <h3 className="font-headline text-[17px] font-semibold text-on-surface mb-1">Krishi & Dairy Entrepreneurship Loan</h3>
            <p className="text-[12px] text-on-surface-variant mb-5">Chainpur-5, Gadhwa Dairy Cluster</p>
            <div className="flex items-center gap-5">
              <div className="relative w-28 h-28 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5eeff" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#006b47" strokeWidth="3.5"
                    strokeDasharray="60.5 39.5" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[18px] font-bold text-primary leading-none">60.5%</span>
                  <span className="text-[10px] text-on-surface-variant">Cleared</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] text-on-surface-variant uppercase tracking-wider">Sanctioned</div>
                  <div className="text-[20px] font-bold text-on-surface">NPR 3,00,000</div>
                </div>
                <div>
                  <div className="text-[11px] text-on-surface-variant uppercase tracking-wider">Balance</div>
                  <div className="text-[18px] font-bold text-primary">NPR 1,18,420</div>
                  <div className="text-[11px] text-status-success">59.5% paid, 24 done</div>
                </div>
              </div>
            </div>
          </div>

          {/* EMI Payment */}
          <div className="bg-surface-container-low rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-status-danger uppercase tracking-wider">IMMEDIATE DUE</span>
              <span className="text-[11px] text-on-surface-variant">Installment #25 of 36</span>
            </div>
            <div className="text-[34px] font-bold text-on-surface font-headline leading-none mb-1">NPR 8,640</div>
            <div className="text-[11px] text-on-surface-variant mb-1">Principal: NPR 7,120 | Interest: NPR 1,520</div>
            <div className="text-[12px] text-status-danger mb-4">Due on Chaitra 15, 2081 (March 28, 2025) - 0 days remaining</div>
            <div className="space-y-2 mb-4">
              {[
                { label: 'Regular Savings (Niyamit bachat)', sub: 'Fastest - Available: NPR 1,84,500', active: true },
                { label: 'eSewa Mobile Wallet', sub: 'Direct wallet checkout', active: false },
                { label: 'NCHL / ConnectIPS', sub: 'Direct bank account debit', active: false },
              ].map((s, i) => (
                <label key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border-2 cursor-pointer ${s.active ? 'border-primary bg-white' : 'border-outline-variant/30 bg-white'}`}>
                  <input type="radio" name="emi-src" defaultChecked={s.active} className="mt-0.5 accent-primary" readOnly />
                  <div>
                    <div className="text-[12px] font-semibold text-on-surface">{s.label}</div>
                    <div className="text-[11px] text-on-surface-variant">{s.sub}</div>
                  </div>
                </label>
              ))}
            </div>
            <button onClick={() => setEmiModal(true)} className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-[14px] hover:bg-primary-container transition-colors flex items-center justify-center gap-2" type="button">
              <MI n="payments" cls="text-[20px]" /> Pay NPR 8,640 Now
            </button>
            <p className="text-[11px] text-center text-on-surface-variant mt-2">Encrypted cooperative ledger settlement - Zero transaction fee</p>
          </div>

          {/* Honor Score + Pre-approval */}
          <div className="space-y-4">
            <div className="bg-surface-card border border-outline-variant/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold text-on-surface">100% On-Time Honor Score</span>
                <span className="px-2 py-0.5 rounded bg-status-success text-white text-[11px] font-bold">Grade A+</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2 mb-2">
                <div className="bg-status-success h-2 rounded-full" style={{ width: '100%' }} />
              </div>
              <p className="text-[11px] text-on-surface-variant">Qualifies for Nepal Agriculture 1.5% interest subsidy. Cumulative rebate: <strong className="text-primary">NPR 4,120</strong></p>
              <div className="mt-2 text-[11px] flex items-center gap-2">
                <span className="text-on-surface-variant">Subsidized Rate: 7.0%</span>
              </div>
            </div>
            <div className="bg-brand-accent-lime/10 border border-brand-accent-lime/20 rounded-xl p-4">
              <div className="flex items-center gap-1 mb-1">
                <MI n="bolt" cls="text-[16px] text-brand-accent-lime" />
                <span className="text-[12px] font-bold text-on-surface">1-Click Instant Pre-Approval</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-3">100% on-time record qualifies you for an Instant Top-Up Agro loan up to <strong>NPR 1,50,000</strong> with no additional paperwork.</p>
              <Link to="/member/loan-portfolio-repayments" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary-container transition-colors">
                Apply with 1-Click Approval
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DIGITAL PASSBOOK + TRANSACTION LEDGER */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-surface-card rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-headline text-[17px] font-semibold text-on-surface">Digital Passbook & Transaction Ledger</h2>
              <p className="text-[12px] text-on-surface-variant">Real-time cooperative accounts for your member savings</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface text-[12px] font-semibold" type="button">Export Statement (PDF)</button>
              <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold" type="button">Excel / CSV</button>
            </div>
          </div>
          <div className="px-6 pt-3 flex gap-2 overflow-x-auto border-b border-outline-variant/20 pb-0">
            {([['all','All Holdings (7)'],['deposits','Deposits & Rates'],['debits','Loan Repayments'],['interest','Interest & Dividends']] as const).map(([k,l]) => (
              <button key={k} onClick={() => setActiveTab(k)} className={`pb-2 px-1 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === k ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`} type="button">{l}</button>
            ))}
          </div>
          <div className="px-6 py-4 overflow-x-auto">
            <div className="flex items-center justify-between mb-3 text-[13px]">
              <span className="font-semibold text-on-surface">Verified Transaction History <span className="text-primary font-normal text-[12px]">CBS Hash Verified</span></span>
              <span className="text-on-surface-variant">Showing {TRANSACTIONS.length} entries</span>
            </div>
            <table className="w-full text-[12px] min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant/20 text-left">
                  {['DATE (BS / AD)', 'VOUCHER / REF', 'NARRATION & DESCRIPTION', 'DEBIT (NPR)', 'CREDIT', 'BALANCE'].map(h => (
                    <th key={h} className="py-2 pr-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((tx, i) => (
                  <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-container-low/40">
                    <td className="py-3 pr-3 align-top">
                      <div className="font-semibold">{tx.date}</div>
                      <div className="text-on-surface-variant text-[11px]">{tx.bs}</div>
                    </td>
                    <td className="py-3 pr-3 align-top">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-surface-container font-mono text-primary text-[11px]">{tx.txn}</span>
                      <div className="text-on-surface-variant text-[11px] mt-0.5">{tx.type}</div>
                    </td>
                    <td className="py-3 pr-3 align-top max-w-[200px]">
                      <div className="font-semibold text-on-surface">{tx.desc}</div>
                      <div className="text-on-surface-variant text-[11px] line-clamp-1">{tx.sub}</div>
                    </td>
                    <td className="py-3 pr-3 text-right text-status-danger font-semibold align-top">{tx.debit || '-'}</td>
                    <td className="py-3 pr-3 text-right text-status-success font-semibold align-top">{tx.credit || '-'}</td>
                    <td className="py-3 text-right font-bold text-on-surface align-top">{tx.bal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20">
              <p className="text-[11px] text-on-surface-variant">Ledger certified under SACCOS Act 2074 & Department of Cooperatives, Nepal</p>
              <div className="flex gap-1">
                {['Previous', '1', '2', 'Next'].map((p, i) => (
                  <button key={p} className={`px-2 py-0.5 rounded text-[12px] ${i === 1 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface'}`} type="button">{p}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-white/60">Q3 Yield Credited</span>
              <span className="px-2 py-0.5 rounded-full bg-brand-accent-lime/30 text-brand-accent-lime text-[11px] font-bold">Paid</span>
            </div>
            <div className="text-[34px] font-bold font-headline">NPR 3,680</div>
            <div className="text-[12px] text-white/70">Quarterly interest + dividend bonus</div>
            <div className="text-[11px] text-white/50 mt-1">Next payout: Chaitra 30 - 8.0% Base</div>
          </div>

          <div className="bg-surface-dark rounded-2xl p-5 text-white">
            <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase mb-2">DIGITAL PASSBOOK V4.2 - PRIMARY SAVINGS ACCOUNT</div>
            <div className="text-[30px] font-bold font-headline leading-tight">NPR<br />1,84,500</div>
            <div className="text-[11px] text-white/50 mt-1">A/C: 004-10294-88-01 (Hari Prasad Chaudhary)</div>
            <div className="flex justify-between mt-3 pt-3 border-t border-white/10 text-[11px]">
              <div><span className="text-white/50">Interest Rate</span><br /><strong>8.00% Per Annum</strong></div>
              <div className="text-right"><span className="text-white/50">Member Since</span><br /><strong>2070 BS (12 Years)</strong></div>
            </div>
            <div className="text-[11px] text-white/40 mt-2">Reg: 2070/Dang/104 - Print Slip</div>
          </div>

          <div className="bg-surface-card rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-on-surface">Standing Deductions</h3>
              <span className="text-[11px] text-on-surface-variant">Mandatory auto-debit rules</span>
            </div>
            <div className="space-y-2">
              {[
                { icon: 'savings', label: 'Compulsory Savings Rule', sub: 'Debits automatically on 1st of every BS month', amt: 'NPR 2,000 / mo', next: 'Next: Chaitra 1' },
                { icon: 'agriculture', label: 'Agro Tractor EMI #25', sub: 'Auto deducted to Loan LN-AGRO-0941', amt: 'NPR 8,640 / mo', next: 'Next: Chaitra 5', danger: true },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low">
                  <MI n={item.icon} cls="text-[18px] text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold text-on-surface">{item.label}</div>
                    <div className="text-[11px] text-on-surface-variant">{item.sub}</div>
                    <div className={`text-[12px] font-bold mt-0.5 ${item.danger ? 'text-status-danger' : 'text-primary'}`}>{item.amt} <span className="text-status-success font-semibold">Active</span></div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant text-right">{item.next}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 text-[12px] text-primary font-semibold py-2 rounded-lg hover:bg-surface-container-low" type="button">
              Manage Standing Instructions
            </button>
          </div>

          <div className="bg-surface-card rounded-2xl p-5 shadow-sm border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <MI n="info" cls="text-[18px] text-primary" />
              <span className="text-[13px] font-semibold text-on-surface">Gadhwa Branch Advisory</span>
            </div>
            <p className="text-[12px] text-on-surface-variant leading-relaxed">The 12th Annual General Meeting (AGM) approved a <strong>14.2% Cash Dividend</strong> and <strong>1.5% Bonus Share</strong> for active contributors. Total dividend for your 500 shares will be credited to Regular Savings on Chaitra 15, 2081.</p>
            <div className="mt-3 pt-3 border-t border-outline-variant/20 flex justify-between text-[11px] text-on-surface-variant">
              <span>Coop Code: UNK-402</span><span>TIN: 302914801</span>
            </div>
          </div>
        </div>
      </section>

      {/* EMI MODAL */}
      {emiModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEmiModal(false)}>
          <div className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MI n="security" cls="text-[22px] text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-[17px] font-semibold text-on-surface">Rakam Pathaaun Pramanikaran Garnuhos</h3>
                <p className="text-[12px] text-primary font-semibold">INTER-MEMBER CLEARING - CBS Live</p>
              </div>
              <button onClick={() => setEmiModal(false)} className="ml-auto" type="button"><MI n="close" cls="text-[24px] text-on-surface-variant" /></button>
            </div>
            <div className="space-y-3 mb-5 text-[13px]">
              {[
                { l: 'Transfer Amount', v: 'NPR 8,640.00' },
                { l: 'Clearing Fee (shunyashulk)', v: 'NPR 0.00', green: true },
                { l: 'Debit Account', v: 'Regular Savings - 004-10294-88-01' },
                { l: 'Recipient (Loan)', v: 'LN-2099-0418 Krishi Agro' },
                { l: 'Purpose', v: 'EMI Installment #25 - Auto Standing' },
              ].map((r, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant">{r.l}</span>
                  <span className={`font-semibold ${r.green ? 'text-status-success' : 'text-on-surface'}`}>{r.v}</span>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-3">Security PIN (MPIN) - sujit 4-digit MPIN halnus</label>
              <div className="flex gap-3 justify-center mb-3">
                {[0,1,2,3].map(i => (
                  <input key={i} type="password" maxLength={1} className="w-12 h-12 text-center text-[24px] border-2 border-outline-variant rounded-xl focus:border-primary outline-none font-bold" />
                ))}
              </div>
              <div className="text-center text-[12px] text-on-surface-variant">
                OTP Code: <strong className="font-mono">841-920</strong>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEmiModal(false)} className="flex-1 py-3 rounded-xl bg-surface-container-low text-on-surface font-semibold text-[14px]" type="button">Pharkaaun (Cancel)</button>
              <button className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-[14px] hover:bg-primary-container" type="button" onClick={() => setEmiModal(false)}>
                Rakam Pathaaun (NPR 8,640)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEPOSIT MODAL */}
      {depositModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDepositModal(false)}>
          <div className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-modal-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-[17px] font-semibold">Deposit to Savings</h3>
              <button onClick={() => setDepositModal(false)} type="button"><MI n="close" cls="text-[24px] text-on-surface-variant" /></button>
            </div>
            <div className="space-y-2">
              {['eSewa', 'Khalti', 'ConnectIPS / NCHL', 'Bank Transfer', 'Counter Deposit'].map(m => (
                <button key={m} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-[13px] font-semibold transition-colors" type="button">
                  {m} <MI n="arrow_forward" cls="text-[18px] text-primary" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
