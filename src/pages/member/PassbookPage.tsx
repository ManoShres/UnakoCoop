import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../../store/useLanguageStore';

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

export function PassbookPage() {
  const { t } = useLanguageStore();
  const [activeAcct, setActiveAcct] = useState(0);
  const [filter, setFilter] = useState<'all' | 'credits' | 'debits' | 'dairy'>('all');
  const [voucherModal, setVoucherModal] = useState<typeof TRANSACTIONS[0] | null>(null);

  const accounts = [
    { label: t('कुल मौज्दात', 'All Holdings'), sub: '', bal: 'NPR 3,42,850', no: t('४ सक्रिय खाताहरू', '4 Active Ledgers'), badge: null },
    { label: t('नियमित बचत', 'Regular Savings'), sub: '001', bal: 'NPR 1,84,500', no: '004-10294-88-01 (8.0% p.a.)', badge: '001' },
    { label: t('अनिवार्य मासिक बचत', 'Compulsory Monthly'), sub: '002', bal: 'NPR 68,000', no: '004-10294-88-02 (Auto: 2k/mo)', badge: '002' },
    { label: t('शेयर पूँजी', 'Share Capital'), sub: 'SC', bal: 'NPR 50,000', no: t('५०० कित्ता @ रु १००', '500 Units @ NPR 100'), badge: 'SC' },
    { label: t('मुद्दती निक्षेप', 'Fixed Term Deposit'), sub: 'FD', bal: 'NPR 40,350', no: '10.0% p.a.', badge: 'FD' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-6 w-full max-w-[1280px] mx-auto pb-10">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-accent-lime animate-pulse" />
            {t('सदस्य खाता सक्रिय · LN-2099-0218', 'Member Account Active · LN-2099-0218')}
          </div>
          <h1 className="font-headline text-[28px] font-bold text-on-surface tracking-tight">{t('पासबुक तथा कारोबार लेजर', 'Passbook & Transaction Ledger')}</h1>
          <p className="text-[13px] text-on-surface-variant">
            {t('सदस्य: श्री हरि प्रसाद चौधरी (UKO-2070-08842) | शाखा: गढवा मुख्य कार्यालय', 'Member: Hari Prasad Chaudhary (UKO-2070-08842) | Branch: Gadhwa Main Office')}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/member/annual-statement" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-low text-on-surface text-[13px] font-semibold hover:bg-surface-container transition-colors">
            <MI n="receipt_long" cls="text-[18px] text-primary" />
            <span>{t('वार्षिक कर/वित्तीय विवरण', 'Annual Tax/Audit Statement')}</span>
          </Link>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary-container" type="button">
            <MI n="table_chart" cls="text-[18px]" /> Excel / CSV
          </button>
        </div>
      </div>

      {/* CBS SYNC STATUS */}
      <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
        <span className="w-2 h-2 rounded-full bg-brand-accent-lime" />
        <span className="text-status-success font-semibold">{t('डिजिटल सदस्य पासबुक', 'Digital Member Passbook')}</span>
        <span>· {t('सीबीएस अद्यावधिक: २ मिनेट अगाडि', 'CBS Synced: 2 mins ago')}</span>
      </div>

      {/* ACCOUNT TABS */}
      <div className="flex gap-2 overflow-x-auto">
        {accounts.map((acct, i) => (
          <button key={i} onClick={() => setActiveAcct(i)}
            className={`flex flex-col items-start px-4 py-3 rounded-xl border-2 text-left shrink-0 transition-colors ${activeAcct === i ? 'border-primary bg-primary/5' : 'border-outline-variant/20 bg-surface-card hover:bg-surface-container-low'}`}
            type="button">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase">{acct.label}</span>
            <span className="text-[20px] font-bold text-on-surface font-headline">{acct.bal}</span>
            <span className="text-[11px] text-on-surface-variant">{acct.no}</span>
          </button>
        ))}
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-card rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-on-surface-variant">{t('कुल आम्दानी / जम्मा (फागुन २०८१)', 'Total Inflow (Falgun 2081)')}</span>
            <MI n="trending_up" cls="text-[18px] text-status-success" />
          </div>
          <div className="text-[28px] font-bold text-status-success font-headline">+NPR 33,780</div>
          <div className="text-[12px] text-on-surface-variant">{t('३ दुग्ध संकलन तथा ब्याज जम्मा', '3 Dairy credit batches & interest')}</div>
          <div className="h-8 mt-2 flex items-end gap-0.5">
            {[30,60,40,80,50,100,70].map((h, i) => (
              <div key={i} className="flex-1 bg-status-success/20 rounded-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-surface-card rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-on-surface-variant">{t('कुल खर्च तथा कर्जा किस्ता', 'Total Outflow (Debits & EMI)')}</span>
            <MI n="trending_down" cls="text-[18px] text-status-danger" />
          </div>
          <div className="text-[28px] font-bold text-status-danger font-headline">-NPR 15,140</div>
          <div className="text-[12px] text-on-surface-variant">{t('कृषि कर्जा किस्ता + मलबीउ खरिद', 'Loan EMI + Agro QR supplies')}</div>
          <div className="h-8 mt-2 flex items-end gap-0.5">
            {[80,40,60,30,70,50,90].map((h, i) => (
              <div key={i} className="flex-1 bg-status-danger/20 rounded-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-surface-card rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-on-surface-variant">{t('मासिक खुद बचत प्रतिधारण', 'Net Monthly Retention')}</span>
            <MI n="savings" cls="text-[18px] text-primary" />
          </div>
          <div className="text-[28px] font-bold text-primary font-headline">+NPR 18,640</div>
          <div className="text-[12px] text-status-success font-semibold">{t('५५.२% प्रतिधारण अनुपात', '55.2% retention ratio')}</div>
        </div>
        <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-white/70">{t('तेस्रो त्रैमासिक ब्याज भुक्तानी', 'Q3 Yield Credited')}</span>
            <span className="px-2 py-0.5 rounded-full bg-brand-accent-lime/30 text-brand-accent-lime text-[11px] font-bold">{t('भुक्तान भएको', 'Paid')}</span>
          </div>
          <div className="text-[28px] font-bold font-headline">NPR 3,680</div>
          <div className="text-[12px] text-white/70">{t('त्रैमासिक बचत ब्याज र लाभांश बोनस', 'Quarterly interest + dividend bonus')}</div>
          <div className="text-[11px] text-white/50 mt-1">{t('अर्को भुक्तानी: चैत्र ३० - ८.०% आधार दर', 'Next: Chaitra 30 - 8.0% Base')}</div>
        </div>
      </div>

      {/* MAIN CONTENT: LEDGER + RIGHT SIDEBAR */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Ledger Table */}
        <div className="xl:col-span-2 bg-surface-card rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b border-outline-variant/20 flex items-center gap-2 flex-wrap">
            <div className="flex gap-2 mr-auto">
              <span className="text-[13px] text-on-surface-variant">{t('फागुन २०८१ (फेब्रुअरी-मार्च)', 'Falgun 2081 (Feb-Mar)')}</span>
              <span className="text-[13px] text-on-surface-variant">{t('सबै कारोबार प्रकार', 'All Trans Types')}</span>
            </div>
            <div className="flex gap-1">
              {[
                ['all', t('सबै कारोबार', 'All Entries')],
                ['credits', t('जम्मा मात्र', 'Credits Only')],
                ['debits', t('खर्च मात्र', 'Debits Only')],
                ['dairy', t('दुग्ध संकलन', 'Dairy Receipts')],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k as typeof filter)}
                  className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold ${
                    filter === k ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                  type="button"
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 overflow-x-auto">
            <div className="flex justify-between mb-3 text-[13px]">
              <span className="font-semibold text-on-surface">
                {t('प्रमाणित कारोबार इतिहास', 'Verified Transaction History')}{' '}
                <span className="text-primary text-[12px] font-normal">{t('सीबीएस ह्यास प्रमाणित', 'CBS Hash Verified')}</span>
              </span>
              <span className="text-on-surface-variant">
                {t(`जम्मा ${TRANSACTIONS.length} कारोबार`, `Showing ${TRANSACTIONS.length} entries`)}
              </span>
            </div>
            <table className="w-full text-[12px] min-w-[550px]">
              <thead>
                <tr className="border-b border-outline-variant/20 text-left">
                  {[
                    t('मिति', 'DATE'),
                    t('भौचर / सन्दर्भ', 'VOUCHER / REF'),
                    t('विवरण तथा कैफियत', 'NARRATION & DESCRIPTION'),
                    t('डेबिट (खर्च)', 'DEBIT (NPR)'),
                    t('क्रेडिट (जम्मा)', 'CREDIT'),
                    t('मौज्दात', 'BALANCE'),
                  ].map((h) => (
                    <th key={h} className="py-2 pr-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((tx, i) => (
                  <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-container-low/40 cursor-pointer" onClick={() => setVoucherModal(tx)}>
                    <td className="py-3 pr-3 align-top">
                      <div className="font-semibold">{tx.date}</div>
                      <div className="text-[10px] text-on-surface-variant">{tx.bs}</div>
                    </td>
                    <td className="py-3 pr-3 align-top">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-surface-container font-mono text-primary text-[10px]">{tx.txn}</span>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">{tx.type}</div>
                    </td>
                    <td className="py-3 pr-3 align-top max-w-[180px]">
                      <div className="font-semibold text-on-surface">{tx.desc}</div>
                      <div className="text-[10px] text-on-surface-variant line-clamp-1">{tx.sub}</div>
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
          {/* Digital Passbook Card */}
          <div className="bg-surface-dark rounded-2xl p-5 text-white">
            <div className="text-[9px] font-bold tracking-widest text-white/40 uppercase mb-2">DIGITAL PASSBOOK V4.2 - PRIMARY SAVINGS ACCOUNT</div>
            <div className="text-[11px] text-brand-accent-lime font-semibold mb-1">CBS LIVE</div>
            <div className="text-[34px] font-bold font-headline leading-none">NPR</div>
            <div className="text-[34px] font-bold font-headline">1,84,500</div>
            <div className="text-[11px] text-white/50 mt-1">A/C: 004-10294-88-01 (Hari Prasad Chaudhary)</div>
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10 text-[11px]">
              <div><span className="text-white/50 block">Interest Rate</span><strong>8.00% Per Annum</strong></div>
              <div className="text-right"><span className="text-white/50 block">Member Since</span><strong>2070 BS (12 Years)</strong></div>
            </div>
            <div className="text-[10px] text-white/40 mt-2">Reg: 2070/Dang/104</div>
            <button className="mt-3 text-[11px] font-semibold text-white/60 hover:text-white" type="button">Print Slip</button>
          </div>

          {/* Standing Deductions */}
          <div className="bg-surface-card rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-on-surface">Standing Deductions</h3>
              <span className="text-[11px] text-on-surface-variant">Mandatory auto-debit rules</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low">
                <MI n="savings" cls="text-[18px] text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="text-[12px] font-semibold text-on-surface">Compulsory Savings Rule</div>
                  <div className="text-[10px] text-on-surface-variant">Debits automatically on 1st of every BS month</div>
                  <div className="text-[12px] font-bold text-primary mt-0.5">NPR 2,000 / mo <span className="text-status-success">Active</span></div>
                </div>
                <span className="text-[10px] text-on-surface-variant">Next:<br />Chaitra 1</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low">
                <MI n="agriculture" cls="text-[18px] text-status-warning mt-0.5" />
                <div className="flex-1">
                  <div className="text-[12px] font-semibold text-on-surface">Agro Tractor EMI #25</div>
                  <div className="text-[10px] text-on-surface-variant">Auto deducted to Loan LN-AGRO-0941</div>
                  <div className="text-[12px] font-bold text-status-danger mt-0.5">NPR 8,640 / mo <span className="text-status-success">Active</span></div>
                </div>
                <span className="text-[10px] text-on-surface-variant">Next:<br />Chaitra 5</span>
              </div>
            </div>
            <button className="w-full mt-3 text-[12px] text-primary font-semibold py-2 rounded-lg hover:bg-surface-container-low" type="button">
              Manage Standing Instructions
            </button>
          </div>

          {/* Branch Advisory */}
          <div className="bg-surface-card rounded-2xl p-5 shadow-sm border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <MI n="info" cls="text-[18px] text-primary" />
              <span className="text-[13px] font-semibold">Gadhwa Branch Advisory</span>
            </div>
            <p className="text-[12px] text-on-surface-variant leading-relaxed">The 12th Annual General Meeting (AGM) approved a <strong>14.2% Cash Dividend</strong> and <strong>1.5% Bonus Share</strong> for active contributors. Total dividend for your 500 shares will be credited to Regular Savings on Chaitra 15, 2081.</p>
            <div className="mt-3 pt-3 border-t border-outline-variant/20 flex justify-between text-[11px] text-on-surface-variant">
              <span>Coop Code: UNK-402</span><span>TIN: 302914801</span>
            </div>
          </div>
        </div>
      </div>

      {/* VOUCHER MODAL */}
      {voucherModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setVoucherModal(null)}>
          <div className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-status-success/10 flex items-center justify-center">
                <MI n="receipt_long" cls="text-[22px] text-status-success" />
              </div>
              <div>
                <h3 className="font-headline text-[17px] font-semibold">
                  {t('विद्युतीय कारोबार भौचर', 'Electronic Transaction Voucher')}
                </h3>
                <p className="text-[12px] text-primary">
                  {t('सीबीएस विद्युतीय रसिद - उनाको साकोस', 'CBS Electronic Receipt - Unako SACCOS')}
                </p>
              </div>
              <button onClick={() => setVoucherModal(null)} className="ml-auto" type="button"><MI n="close" cls="text-[24px] text-on-surface-variant" /></button>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 text-center mb-4">
              <div className="text-[12px] text-on-surface-variant">{t('भौचर नं.', 'Voucher No.')} {voucherModal.txn}</div>
              <div className="text-[12px] text-on-surface-variant mb-2">{t('मिति:', 'Date:')} {voucherModal.date}</div>
              <div className="text-[14px] font-bold text-on-surface uppercase mb-2">{voucherModal.desc}</div>
              <div className={`text-[32px] font-bold font-headline ${voucherModal.credit ? 'text-status-success' : 'text-status-danger'}`}>
                {voucherModal.credit ? voucherModal.credit : '-' + voucherModal.debit}
              </div>
              <div className="text-[11px] text-on-surface-variant">{voucherModal.sub}</div>
            </div>

            <div className="space-y-2 text-[13px] mb-5">
              {[
                [t('जम्मा भएको खाता', 'Account Credited/Debited'), t('नियमित बचत खाता - ००४-१०२९४-८८-०१', 'Regular Savings A/C - 004-10294-88-01')],
                [t('सदस्य नाम', 'Member Name'), 'Hari Prasad Chaudhary - UKO-2070-08842'],
                [t('कारोबार पश्चात मौज्दात', 'Balance After Transaction'), `${t('रु.', 'NPR')} ${voucherModal.bal}`],
                [t('सेवा केन्द्र / शाखा', 'Branch / Counter'), t('गढवा मुख्य शाखा (काउन्टर ३)', 'Gadhwa Main Branch (Counter 3)')],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-on-surface-variant">{l}:</span>
                  <span className="font-semibold text-on-surface text-right max-w-[60%]">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setVoucherModal(null)} className="flex-1 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-semibold text-[13px]" type="button">
                {t('बन्द गर्नुहोस्', 'Close')}
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-[13px] flex items-center justify-center gap-1" type="button">
                <MI n="download" cls="text-[16px]" /> {t('पीडीएफ डाउनलोड', 'PDF Download')}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
