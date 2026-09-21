import React, { useState } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';

const MI = ({ n, cls = '' }: { n: string; cls?: string }) => (
  <span className={`material-symbols-outlined ${cls}`}>{n}</span>
);

interface Beneficiary {
  id: string;
  name: string;
  no: string;
  phone: string;
  loc: string;
  grade: string;
  job: string;
  group: string;
  lastDate: string;
  branch: string;
}

const BENEFICIARIES: Beneficiary[] = [
  { id: 'BT', name: 'Bhojraj Tharu', no: 'UKO-2072-04192', phone: '9898****', loc: 'Chainpur, Gadhwa-5', grade: 'A', job: 'Dairy Producer', group: 'Chauri Dairy #2', lastDate: 'Yesterday 5:15 AM', branch: 'Gadhwa' },
  { id: 'SS', name: 'Sita Devi Sharma', no: 'UKO-2076-03215', phone: '9841****', loc: 'Lamahi-3, Dang', grade: 'A', job: 'Micro-Retailer', group: 'Lamahi Bazaar #1', lastDate: '3 days ago', branch: 'Lamahi' },
  { id: 'RC', name: 'Ram Bahadur Chaudhary', no: 'UKO-2071-02381', phone: '9857****', loc: 'Chainpur, Gadhwa-3', grade: 'A+', job: 'Poultry Farm', group: 'Pragati Krishak', lastDate: '1 week ago', branch: 'Gadhwa' },
];

interface PaymentRecord {
  id: string;
  date: string;
  time: string;
  counterparty: string;
  sub: string;
  channel: 'Member Transfer' | 'Merchant QR' | 'Deposit Inward' | 'Share Allocation';
  account: string;
  amount: string;
  isCredit: boolean;
  status: 'Instant Cleared' | 'Settled' | 'Credited' | 'Allocated';
  ref: string;
}

const RECENT_PAYMENTS: PaymentRecord[] = [
  { id: 'TXN-8801', date: '2081-11-14', time: '10:42 AM', counterparty: 'Bhojraj Tharu (UKO-2072-04192)', sub: 'Organic Mustard Seeds Procurement - Chainpur Farm Hub', channel: 'Member Transfer', account: 'Regular Savings (104-0029-64)', amount: '10,000.00', isCredit: false, status: 'Instant Cleared', ref: 'CBS-TXN-90214' },
  { id: 'TXN-8802', date: '2081-11-12', time: '03:15 PM', counterparty: 'Gadhwa Krishi & Vet Suppliers', sub: 'Veterinary Medicines & Dairy Mineral Mix - NepalPay QR', channel: 'Merchant QR', account: 'Regular Savings (104-0029-64)', amount: '3,450.00', isCredit: false, status: 'Settled', ref: 'NP-QR-441829' },
  { id: 'TXN-8803', date: '2081-11-09', time: '09:30 AM', counterparty: 'eSewa Direct Wallet Inward', sub: 'Digital Deposit to Regular Savings - Gateway Ref S4487611', channel: 'Deposit Inward', account: 'Regular Savings (104-0029-64)', amount: '25,000.00', isCredit: true, status: 'Credited', ref: 'GW-ES-782190' },
  { id: 'TXN-8804', date: '2081-11-01', time: '11:00 AM', counterparty: 'Unako Member Share Pool', sub: 'Annual Member Capital Increment - 50 New Equity Shares Added', channel: 'Share Allocation', account: 'Share Capital (SHR-04192)', amount: '5,000.00', isCredit: false, status: 'Allocated', ref: 'CBS-SHR-10291' },
  { id: 'TXN-8805', date: '2081-10-27', time: '01:20 PM', counterparty: 'Sita Devi Sharma (UKO-2076-03215)', sub: 'Bio-Fertilizer Bulk Order - Lamahi Distribution Point', channel: 'Member Transfer', account: 'Regular Savings (104-0029-64)', amount: '15,000.00', isCredit: false, status: 'Instant Cleared', ref: 'CBS-TXN-89412' },
  { id: 'TXN-8806', date: '2081-10-20', time: '04:50 PM', counterparty: 'ConnectIPS Bank Inward', sub: 'Direct Bank-to-Passbook Topup via Agricultural Development Bank', channel: 'Deposit Inward', account: 'Regular Savings (104-0029-64)', amount: '50,000.00', isCredit: true, status: 'Credited', ref: 'CIPS-TXN-10928' },
];

export function TransfersPaymentsPage() {
  const { t } = useLanguageStore();
  const [mode, setMode] = useState<'transfer' | 'wallet'>('transfer');
  const [memberId, setMemberId] = useState('UKO-2072-04419');
  const [amount, setAmount] = useState('10000');
  const [verifiedMember, setVerifiedMember] = useState<{ name: string; grade: string; job: string; loc: string } | null>({
    name: 'Bhojraj Tharu', grade: 'A', job: 'Dairy Producer', loc: 'Chainpur, Gadhwa-5'
  });
  const [reviewModal, setReviewModal] = useState(false);
  const [addBeneficiaryModal, setAddBeneficiaryModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState<PaymentRecord | null>(null);
  const [purpose, setPurpose] = useState('Purchase of organic mustard seeds (Chainpur-Gadhwa)');
  const [acctType, setAcctType] = useState<'savings' | 'share'>('savings');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Wallet state
  const [selectedGateway, setSelectedGateway] = useState<'esewa' | 'khalti' | 'connectips' | 'bank'>('esewa');
  const [walletAmount, setWalletAmount] = useState('5000');

  const handleSelectBeneficiary = (b: Beneficiary) => {
    setMemberId(b.no);
    setVerifiedMember({
      name: b.name,
      grade: b.grade,
      job: b.job,
      loc: b.loc,
    });
  };

  const filteredPayments = RECENT_PAYMENTS.filter(p => {
    if (filterType === 'all') return true;
    if (filterType === 'member') return p.channel === 'Member Transfer';
    if (filterType === 'qr') return p.channel === 'Merchant QR';
    if (filterType === 'deposit') return p.channel === 'Deposit Inward';
    if (filterType === 'share') return p.channel === 'Share Allocation';
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-6 w-full max-w-[1280px] mx-auto pb-12">
      {/* HEADER SECTION */}
      <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-outline-variant/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
              <MI n="sync_alt" cls="text-[14px]" /> {t('सहकारी राफसाफ प्रणाली', 'COOPERATIVE CLEARING RAIL')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-success/10 text-status-success font-bold text-xs">
              <MI n="verified" cls="text-[14px]" /> {t('केन्द्रीय सीबीएस आरटीजीएस सक्रिय', 'Core CBS RTGS Active')}
            </span>
            <span className="text-xs text-on-surface-variant">• {t('०% अन्तर-सदस्य अधिभार', '0% Inter-member Surcharge')}</span>
          </div>
          <h1 className="font-headline text-headline-sm md:text-headline-md font-bold text-on-surface tracking-tight">
            {t('रकम स्थानान्तरण तथा भुक्तानी डेस्क', 'Transfers & Payments Desk')}
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            {t('दाङ उपत्यकाका सहकारी सदस्यहरूबीच निःशुल्क तत्काल रकम पठाउनुहोस् वा डिजिटल वालेटमार्फत बचत जम्मा गर्नुहोस्।', 'Send zero-fee instant funds to any registered cooperative member or load digital deposits securely via national payment rails.')}
          </p>
        </div>

        {/* Available Liquidity Stat Pill */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 min-w-[240px] text-left md:text-right shrink-0">
          <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t('उपलब्ध बचत मौज्दात', 'Available Liquidity')}</div>
          <div className="font-display-stat text-[22px] font-bold text-primary tracking-tight mt-0.5">NPR 1,84,500.00</div>
          <div className="font-label-sm text-xs text-on-surface-variant flex items-center md:justify-end gap-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-status-success inline-block"></span>
            {t('नियमित बचत (१०४-००२९-६४)', 'Regular Savings (104-0029-64)')}
          </div>
        </div>
      </div>

      {/* MODE SELECTOR TABS */}
      <div className="flex items-center gap-3 border-b border-outline-variant/15 pb-2">
        <button
          onClick={() => setMode('transfer')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-label-md text-label-md font-semibold transition-all ${
            mode === 'transfer'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
          type="button"
        >
          <MI n="swap_horiz" cls="text-[18px]" />
          <span>{t('सदस्य-देखि-सदस्य स्थानान्तरण', 'Member-to-Member Transfer')}</span>
        </button>
        <button
          onClick={() => setMode('wallet')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-label-md text-label-md font-semibold transition-all ${
            mode === 'wallet'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
          type="button"
        >
          <MI n="account_balance_wallet" cls="text-[18px]" />
          <span>{t('डिजिटल वालेट / बैंक लोड', 'Load Wallet & Deposit')}</span>
        </button>
      </div>

      {/* TOP SECTION BENTO GRID: BALANCED 2 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: TRANSFER OR WALLET FORM (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          {mode === 'transfer' ? (
            /* MEMBER TRANSFER CARD */
            <div className="bg-surface-card rounded-2xl shadow-sm border border-outline-variant/15 overflow-hidden flex flex-col justify-between h-full">
              <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-low/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <MI n="send_money" cls="text-[18px]" />
                  </div>
                  <div>
                    <h2 className="font-headline text-title-md font-bold text-on-surface">{t('सदस्य खातामा रकम स्थानान्तरण', 'Member Account Transfer')}</h2>
                    <p className="font-label-sm text-xs text-on-surface-variant">{t('सहकारी सदस्यहरूबीच तत्काल लेजर स्थानान्तरण', 'Instant Direct Ledger Transfer Between Members')}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-status-success/10 text-status-success font-bold text-xs">
                  <MI n="verified" cls="text-[14px]" /> 0% Surcharge
                </span>
              </div>

              <div className="p-6 space-y-4 flex-1">
                {/* Source Debit Account */}
                <div>
                  <label className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    {t('स्रोत बचत खाता', 'Debit Source Account')}
                  </label>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                        <MI n="account_balance" cls="text-[18px]" />
                      </div>
                      <div>
                        <div className="font-label-md text-xs sm:text-sm font-bold text-on-surface">Regular Member Savings - NPR 1,84,500.00</div>
                        <div className="font-label-sm text-[11px] text-on-surface-variant">A/C: 104-0029-64 · Unako Core CBS Ledger</div>
                      </div>
                    </div>
                    <MI n="lock" cls="text-[16px] text-on-surface-variant" />
                  </div>
                </div>

                {/* Beneficiary Member ID Lookup */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                      {t('प्राप्तकर्ता सदस्य नं.', 'Recipient Member ID')}
                    </label>
                    <span className="text-[11px] text-primary font-semibold">{t('सीबीएस प्रत्यक्ष प्रमाणीकरण सक्रिय', 'CBS Live Verification Active')}</span>
                  </div>
                  <div className="relative">
                    <input
                      value={memberId}
                      onChange={e => {
                        setMemberId(e.target.value);
                        if (e.target.value === 'UKO-2072-04192' || e.target.value === 'UKO-2072-04419') {
                          setVerifiedMember({ name: 'Bhojraj Tharu', grade: 'A', job: 'Dairy Producer', loc: 'Chainpur, Gadhwa-5' });
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/50 focus:border-primary bg-surface-container-low text-xs sm:text-sm font-mono font-bold text-on-surface outline-none transition-colors"
                      placeholder="UKO-YYYY-NNNNN"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-status-success font-bold flex items-center gap-1">
                      <MI n="check_circle" cls="text-[16px]" /> {t('प्रमाणित भयो', 'Verified')}
                    </span>
                  </div>

                  {/* Verified Member Details Card */}
                  {verifiedMember && (
                    <div className="mt-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {verifiedMember.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-headline text-xs font-bold text-on-surface flex items-center gap-1.5">
                            {verifiedMember.name}
                            <span className="px-1 py-0.2 rounded bg-status-success/15 text-status-success text-[10px] font-bold">{t('सक्रिय सदस्य', 'Good Standing')}</span>
                          </div>
                          <div className="font-label-sm text-[11px] text-on-surface-variant">
                            {verifiedMember.loc} · {verifiedMember.job} · {t('पहिलो तह सदस्य', 'Tier-1 Member')}
                          </div>
                        </div>
                      </div>
                      <span className="font-label-sm text-[11px] text-primary font-bold shrink-0">{t('संस्था प्रमाणित', 'UKO Verified')}</span>
                    </div>
                  )}
                </div>

                {/* Target Sub-Account */}
                <div>
                  <label className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    {t('गन्तव्य खाता प्रकार', 'Beneficiary Target Account')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      onClick={() => setAcctType('savings')}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                        acctType === 'savings' ? 'border-primary bg-primary/5 shadow-xs' : 'border-outline-variant/30 hover:border-outline-variant/60'
                      }`}
                    >
                      <input type="radio" name="acct-type" checked={acctType === 'savings'} onChange={() => setAcctType('savings')} className="accent-primary" />
                      <div>
                        <div className="font-label-md text-xs font-bold text-on-surface">{t('बचत खाता', 'Savings Account')}</div>
                        <div className="font-label-sm text-[10px] text-on-surface-variant">{t('मुख्य सदस्य पासबुक', 'Primary Member Passbook')}</div>
                      </div>
                    </label>
                    <label
                      onClick={() => setAcctType('share')}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                        acctType === 'share' ? 'border-primary bg-primary/5 shadow-xs' : 'border-outline-variant/30 hover:border-outline-variant/60'
                      }`}
                    >
                      <input type="radio" name="acct-type" checked={acctType === 'share'} onChange={() => setAcctType('share')} className="accent-primary" />
                      <div>
                        <div className="font-label-md text-xs font-bold text-on-surface">{t('शेयर पूँजी', 'Share Capital')}</div>
                        <div className="font-label-sm text-[10px] text-on-surface-variant">{t('शेयर हिस्सा कोष', 'Equity Allocation Pool')}</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Transfer Amount */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                      {t('स्थानान्तरण रकम (रु.)', 'Transfer Amount (NPR)')}
                    </label>
                    <span className="font-label-sm text-[11px] text-on-surface-variant">{t('प्रति कारोबार सीमा: रु. १,००,०००', 'Limit per txn: NPR 100,000')}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                    <div className="font-display-stat text-xl font-bold font-headline text-on-surface">
                      <span className="text-primary mr-1 text-base">NPR</span>
                      {parseInt(amount || '0').toLocaleString()}
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-28 px-2.5 py-1 rounded-lg border border-outline-variant/40 bg-surface-card text-right font-mono font-bold text-xs outline-none focus:border-primary"
                      placeholder={t('रकम', 'Custom')}
                    />
                  </div>
                  {/* Preset Amount Pills */}
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {['1000', '5000', '10000', '25000', '50000'].map(a => (
                      <button
                        key={a}
                        onClick={() => setAmount(a)}
                        className={`px-2.5 py-1 rounded-lg font-label-sm text-xs font-bold border transition-colors cursor-pointer ${
                          amount === a ? 'bg-primary text-white border-primary' : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                        }`}
                        type="button"
                      >
                        +{t('रु.', 'NPR')} {parseInt(a).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purpose / Remarks */}
                <div>
                  <label className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    {t('कारोबारको प्रयोजन', 'Remarks / Purpose')}
                  </label>
                  <input
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-outline-variant/30 bg-surface-container-low text-xs sm:text-sm text-on-surface outline-none focus:border-primary"
                    placeholder={t('जस्तै: तोरीको बीउ खरिद, दूध संकलन भुक्तानी', 'e.g. Purchase of organic seeds, dairy supply')}
                  />
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 pt-0 space-y-3">
                <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface-variant">
                  <MI n="verified_user" cls="text-[16px] text-primary shrink-0 mt-0.5" />
                  <div>
                    {t('शून्य शुल्कमा तत्काल सीबीएस लेजर दाखिला। पासबुक र एसएमएस सूचना तुरुन्तै पठाइन्छ।', 'Instant CBS ledger clearing with zero charges. Passbook and SMS alerts dispatch instantaneously.')}
                  </div>
                </div>

                <button
                  onClick={() => setReviewModal(true)}
                  className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  type="button"
                >
                  <span>{t('रकम स्थानान्तरण अघि बढाउनुहोस्', 'Review & Confirm Transfer')}</span>
                  <MI n="arrow_forward" cls="text-[18px]" />
                </button>
              </div>
            </div>
          ) : (
            /* DIGITAL WALLET / BANK LOAD CARD */
            <div className="bg-surface-card rounded-2xl shadow-sm border border-outline-variant/15 overflow-hidden flex flex-col justify-between h-full">
              <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-low/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <MI n="account_balance_wallet" cls="text-[18px]" />
                  </div>
                  <div>
                    <h2 className="font-headline text-title-md font-bold text-on-surface">{t('डिजिटल वालेट तथा बैंक लोड', 'Digital Wallet & Bank Deposit')}</h2>
                    <p className="font-label-sm text-xs text-on-surface-variant">{t('राष्ट्रिय गेटवेमार्फत उनको बचत पासबुकमा जम्मा गर्नुहोस्', 'Deposit to Unako Savings Passbook via National Gateways')}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-status-success/10 text-status-success font-bold text-xs">
                  {t('तत्काल गेटवे जम्मा', 'Instant Gateway Credit')}
                </span>
              </div>

              <div className="p-6 space-y-4 flex-1">
                {/* Gateway Selector */}
                <div>
                  <label className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                    {t('भुक्तानी गेटवे छान्नुहोस्', 'Select Payment Gateway Rail')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'esewa', label: 'eSewa', sub: 'Direct Inward', icon: 'payments' },
                      { id: 'khalti', label: 'Khalti', sub: 'Instant Load', icon: 'wallet' },
                      { id: 'connectips', label: 'ConnectIPS', sub: 'Inter-Bank', icon: 'account_balance' },
                      { id: 'bank', label: 'Mobile Banking', sub: 'Fonepay Rail', icon: 'smartphone' },
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGateway(g.id as any)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selectedGateway === g.id
                            ? 'border-primary bg-primary/5 shadow-xs'
                            : 'border-outline-variant/30 hover:border-outline-variant/60 bg-surface-container-low'
                        }`}
                      >
                        <MI n={g.icon} cls="text-[20px] text-primary mb-1" />
                        <div className="font-label-md text-xs font-bold text-on-surface">{g.label}</div>
                        <div className="font-label-sm text-[10px] text-on-surface-variant">{g.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Account */}
                <div>
                  <label className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    {t('जम्मा हुने सहकारी खाता', 'Target Deposit Account')}
                  </label>
                  <div className="p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
                    <div>
                      <div className="font-label-md text-xs sm:text-sm font-bold text-on-surface">{t('साधारण सदस्य बचत (१०४-००२९-६४)', 'Regular Member Savings (104-0029-64)')}</div>
                      <div className="font-label-sm text-[11px] text-on-surface-variant">Available balance: NPR 1,84,500.00</div>
                    </div>
                    <MI n="check_circle" cls="text-[18px] text-status-success" />
                  </div>
                </div>

                {/* Deposit Amount */}
                <div>
                  <label className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    {t('जम्मा गर्ने रकम (रु.)', 'Deposit Amount (NPR)')}
                  </label>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                    <div className="font-display-stat text-xl font-bold font-headline text-on-surface">
                      <span className="text-primary mr-1 text-base">{t('रु.', 'NPR')}</span>
                      {parseInt(walletAmount || '0').toLocaleString()}
                    </div>
                    <input
                      type="number"
                      value={walletAmount}
                      onChange={e => setWalletAmount(e.target.value)}
                      className="w-28 px-2.5 py-1 rounded-lg border border-outline-variant/40 bg-surface-card text-right font-mono font-bold text-xs outline-none focus:border-primary"
                      placeholder={t('रकम', 'Custom')}
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {['1000', '2500', '5000', '10000', '25000'].map(a => (
                      <button
                        key={a}
                        onClick={() => setWalletAmount(a)}
                        className={`px-2.5 py-1 rounded-lg font-label-sm text-xs font-bold border transition-colors ${
                          walletAmount === a ? 'bg-primary text-white border-primary' : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                        }`}
                        type="button"
                      >
                        +NPR {parseInt(a).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Supported Switch Micro Bar */}
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
                  <span className="font-semibold text-on-surface">{t('२४/७ स्वचालित समाधान:', '24/7 Automated Reconciliation:')}</span>
                  <span className="text-[11px] text-primary font-bold">{t('एनसिएचएल / नेपालपे / फोनपे प्रमाणित', 'NCHL / NepalPay / Fonepay Certified')}</span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => alert(`Redirecting to ${selectedGateway.toUpperCase()} secure payment gateway for NPR ${parseInt(walletAmount).toLocaleString()}...`)}
                  className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm"
                  type="button"
                >
                  <MI n="open_in_new" cls="text-[18px]" />
                  <span>{t(`गेटवे मार्फत जम्मा गर्नुहोस् (रु. ${parseInt(walletAmount || '0').toLocaleString()})`, `Load via Gateway (NPR ${parseInt(walletAmount || '0').toLocaleString()})`)}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: BENEFICIARIES + TRUST METRIC (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          {/* FREQUENT BENEFICIARIES CARD */}
          <div className="bg-surface-card rounded-2xl shadow-sm border border-outline-variant/15 p-5 flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-headline text-title-md font-bold text-on-surface">{t('नियमित लाभार्थीहरू', 'Frequent Beneficiaries')}</h3>
                  <p className="font-label-sm text-xs text-on-surface-variant">{t('दाङ उपत्यकाका नियमित सदस्यहरू', 'Cooperative Members (Dang Valley)')}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setAddBeneficiaryModal(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                    type="button"
                    title="Add Beneficiary"
                  >
                    <MI n="person_add" cls="text-[15px]" /> {t('+ थप्नुहोस्', '+ Add New')}
                  </button>
                  <button
                    onClick={() => alert('Cooperative QR Scanner activated. Align camera to NepalPay / Member QR.')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface text-xs font-bold hover:bg-surface-container transition-colors"
                    type="button"
                    title="Scan Member QR"
                  >
                    <MI n="qr_code_scanner" cls="text-[15px] text-primary" /> {t('स्क्यान', 'Scan QR')}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {BENEFICIARIES.map((b, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectBeneficiary(b)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-low/70 cursor-pointer transition-all group"
                    title="Click to fill transfer recipient"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        {b.id}
                      </div>
                      <div className="min-w-0">
                        <div className="font-label-md text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                          {b.name}
                        </div>
                        <div className="font-label-sm text-[11px] text-on-surface-variant truncate">
                          {b.no} · {b.job}
                        </div>
                        <div className="font-label-sm text-[10px] text-on-surface-variant/80">
                          {b.loc} ({b.branch})
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pl-1">
                      <span className="text-[10px] font-bold text-status-success bg-status-success/10 px-1.5 py-0.5 rounded">Tier {b.grade}</span>
                      <MI n="chevron_right" cls="text-[16px] text-on-surface-variant group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-outline-variant/15 flex items-center justify-between text-xs text-on-surface-variant">
              <span>{t('लाभार्थी छनोट गर्दा स्थानान्तरण विवरण स्वतः भरिन्छ', 'Clicking any beneficiary auto-populates transfer')}</span>
              <span className="text-primary font-bold">{t('३ सुरक्षित', '3 Saved')}</span>
            </div>
          </div>

          {/* ZERO-FEE COOPERATIVE TRUST & CLEARING METRIC */}
          <div className="bg-gradient-to-br from-surface-dark to-surface-dark-card rounded-2xl p-5 text-white shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-brand-accent-lime text-[10px] font-bold tracking-wider uppercase">
                <MI n="security" cls="text-[13px]" /> {t('सहकारी विश्वास सूचक', 'COOPERATIVE TRUST METRIC')}
              </span>
              <span className="text-xs text-white/70">{t('सीबीएस प्रमाणित', 'CBS Verified')}</span>
            </div>
            <h3 className="font-headline text-base font-bold text-white mb-1">
              {t('भरोसेमन्द शून्य-शुल्क सहकारी भुक्तानी', 'Reliable Zero-Fee Cooperative Payments')}
            </h3>
            <p className="text-xs text-white/70 mb-3 leading-relaxed">
              {t(
                'उनको प्रत्यक्ष सीबीएस राफसाफ प्रणालीमा सञ्चालित छ। प्रत्येक कारोबार बिना कुनै अतिरिक्त शुल्क तत्काल सदस्यको खातामा जम्मा हुन्छ।',
                'Unako operates on dedicated direct CBS clearing rails. Every rupee sent reaches member accounts instantly with zero transaction deductions.'
              )}
            </p>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="text-white/60 text-[10px] uppercase font-semibold">{t('इन्टर-सदस्य शुल्क', 'Inter-Member Fee')}</div>
                <div className="text-brand-accent-lime font-bold text-sm mt-0.5">{t('०% निःशुल्क', '0% Free')}</div>
                <div className="text-white/50 text-[10px]">{t('कुनै शुल्क छैन', 'Zero charges')}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="text-white/60 text-[10px] uppercase font-semibold">{t('राफसाफ गति', 'Clearing Speed')}</div>
                <div className="text-white font-bold text-sm mt-0.5">{t('तत्काल', 'Instant')}</div>
                <div className="text-white/50 text-[10px]">{t('सीबीएस प्रत्यक्ष आरटीजीएस', 'CBS Direct RTGS')}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="text-white/60 text-[10px] uppercase font-semibold">{t('दैनिक कारोबार सीमा', 'Daily Limit')}</div>
                <div className="text-white font-bold text-xs mt-0.5 font-mono">{t('रु. २,००,०००', 'NPR 2,00,000')}</div>
                <div className="text-white/50 text-[10px]">{t('प्रतिदिन रु. २,००,००० सम्म', 'NPR 2,00,000 / Day')}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="text-white/60 text-[10px] uppercase font-semibold">{t('२-चरण सुरक्षा', '2-Step Security')}</div>
                <div className="text-brand-accent-lime font-bold text-sm mt-0.5">MPIN + OTP</div>
                <div className="text-white/50 text-[10px]">{t('२-चरण सुरक्षित इन्क्रिप्सन', '2-Factor Encrypted')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: FULL-WIDTH RECENT PAYMENT ACTIVITY TABLE (MATCHING LOAN PORTFOLIO LEDGER) */}
      <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-outline-variant/15 space-y-4">
        {/* Table Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/15 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                {t('हालैका भुक्तानी तथा कारोबार विवरण', 'Payment & Transfer Ledger')}
              </h3>
              <span className="bg-surface-container px-2.5 py-0.5 rounded-full font-label-sm text-xs font-bold text-primary">
                {filteredPayments.length} Transactions
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              {t('प्रमाणित भुक्तानी, वालेट टपअप र अन्तर-सदस्य स्थानान्तरणको पूर्ण अभिलेख', 'Complete CBS-verified audit trail of settled payments, wallet topups, and remittances')}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
              {[
                { id: 'all', label: t('सबै', 'All') },
                { id: 'member', label: t('सदस्य स्थानान्तरण', 'Member Transfer') },
                { id: 'qr', label: t('मर्चेन्ट क्युआर', 'Merchant QR') },
                { id: 'deposit', label: t('डिजिटल जम्मा', 'Digital Deposit') },
                { id: 'share', label: t('शेयर जम्मा', 'Share Deposit') },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-label-sm text-xs font-semibold transition-all ${
                    filterType === tab.id
                      ? 'bg-surface-card text-on-surface shadow-xs font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-low text-xs font-bold transition-all"
              type="button"
              title="Export Full Statement"
            >
              <MI n="download" cls="text-[16px] text-primary" />
              <span>Export (.CSV / PDF)</span>
            </button>
          </div>
        </div>

        {/* Full Width Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-xs table-auto">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">
                <th className="py-3 px-3.5 rounded-l-xl w-[15%]">{t('मिति र सन्दर्भ', 'Date & Ref')}</th>
                <th className="py-3 px-3.5 w-[30%]">{t('कारोबार विवरण', 'Counterparty & Purpose')}</th>
                <th className="py-3 px-3.5 w-[15%]">{t('च्यानल', 'Channel')}</th>
                <th className="py-3 px-3.5 w-[16%]">{t('खाता', 'Account')}</th>
                <th className="py-3 px-3.5 text-right w-[11%]">{t('रकम (रु.)', 'Amount (NPR)')}</th>
                <th className="py-3 px-3.5 text-center w-[9%]">{t('स्थिति', 'Status')}</th>
                <th className="py-3 px-3.5 text-right rounded-r-xl w-[4%]">{t('रसिद', 'Receipt')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-tabular-mono">
              {filteredPayments.map((p, i) => (
                <tr key={i} className="hover:bg-surface-container-low/60 transition-colors">
                  {/* Date & Ref */}
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-on-surface">{p.date}</div>
                    <div className="text-[11px] text-on-surface-variant">{p.time}</div>
                    <div className="text-[10px] text-primary font-mono font-semibold">{p.ref}</div>
                  </td>

                  {/* Counterparty & Purpose */}
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-on-surface text-sm">{p.counterparty}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">{p.sub}</div>
                  </td>

                  {/* Channel Rail */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-semibold text-xs">
                      <MI
                        n={
                          p.channel === 'Member Transfer'
                            ? 'swap_horiz'
                            : p.channel === 'Merchant QR'
                            ? 'qr_code_2'
                            : p.channel === 'Deposit Inward'
                            ? 'south_west'
                            : 'pie_chart'
                        }
                        cls="text-[14px] text-primary"
                      />
                      {p.channel}
                    </span>
                  </td>

                  {/* Account */}
                  <td className="py-3 px-3.5 text-on-surface-variant text-xs">
                    {p.account}
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <span className={`font-bold text-sm ${p.isCredit ? 'text-status-success' : 'text-on-surface'}`}>
                      {p.isCredit ? '+' : '-'}NPR {p.amount}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.status === 'Instant Cleared' || p.status === 'Settled'
                        ? 'bg-status-success/10 text-status-success'
                        : p.status === 'Credited'
                        ? 'bg-status-info/10 text-status-info'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      <MI n="check_circle" cls="text-[14px]" />
                      {p.status}
                    </span>
                  </td>

                  {/* Receipt Action */}
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setReceiptModal(p)}
                      className="p-1.5 rounded-lg text-primary hover:text-primary-container hover:bg-surface-container transition-all"
                      title="View Official Stamped Receipt"
                    >
                      <MI n="receipt_long" cls="text-[18px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer Compliance Bar */}
        <div className="pt-3 border-t border-outline-variant/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <MI n="verified" cls="text-[16px] text-status-success" />
            <span>All records stamped by Department of Cooperatives &amp; Unako Central CBS Compliance Engine.</span>
          </div>
          <div className="flex gap-4">
            <span className="font-semibold text-on-surface">Total Cleared Volume (Past 30 Days): NPR 1,04,450.00</span>
          </div>
        </div>
      </div>

      {/* REVIEW & CONFIRM TRANSFER MODAL */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onClick={() => setReviewModal(false)}>
          <div className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal-in border border-outline-variant/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-outline-variant/15">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MI n="security" cls="text-[22px] text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">{t('रकम पठाउन प्रमाणीकरण गर्नुहोस्', 'Confirm & Authorize Transfer')}</h3>
                <p className="font-label-sm text-xs text-primary font-bold">{t('रकम स्थानान्तरण समीक्षा तथा एमपिन सुरक्षा प्रमाणीकरण', 'Transfer Review & MPIN Security Confirmation')}</p>
              </div>
              <button onClick={() => setReviewModal(false)} className="ml-auto p-1 rounded-lg hover:bg-surface-container cursor-pointer" type="button">
                <MI n="close" cls="text-[20px] text-on-surface-variant" />
              </button>
            </div>

            <div className="space-y-2 mb-5 text-xs">
              {[
                { l: t('स्थानान्तरण रकम', 'Transfer Amount'), v: `NPR ${parseInt(amount || '0').toLocaleString()}.00` },
                { l: t('निकासी शुल्क', 'Clearing Fee'), v: t('रु. ०.०० (०% अधिभार)', 'NPR 0.00 (0% Surcharge)'), green: true },
                { l: t('स्रोत खाता', 'Debit Account'), v: t('साधारण बचत - १०४-००२९-६४', 'Regular Savings - 104-0029-64') },
                { l: t('प्राप्तकर्ता', 'Recipient'), v: `${verifiedMember?.name || 'Cooperative Member'} (${memberId})` },
                { l: t('गन्तव्य खाता', 'Target Account'), v: acctType === 'savings' ? t('सदस्य बचत पासबुक', 'Member Savings (Passbook)') : t('शेयर पुँजी कोष', 'Share Capital Pool') },
                { l: t('प्रयोजन / कैफियत', 'Remarks / Purpose'), v: purpose || t('सहकारी स्थानान्तरण', 'Cooperative Transfer') },
              ].map((r, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant">{r.l}</span>
                  <span className={`font-bold text-right max-w-[60%] ${r.green ? 'text-status-success' : 'text-on-surface'}`}>{r.v}</span>
                </div>
              ))}
            </div>

            {/* MPIN Input */}
            <div className="mb-5">
              <label className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2 text-center">
                {t('४-अङ्कको गोप्य सुरक्षा पिन प्रविष्ट गर्नुहोस्', 'Enter 4-Digit Security PIN (MPIN)')}
              </label>
              <div className="flex gap-3 justify-center mb-2">
                {[0, 1, 2, 3].map(i => (
                  <input
                    key={i}
                    type="password"
                    maxLength={1}
                    defaultValue={i < 2 ? '•' : ''}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-outline-variant/40 rounded-xl focus:border-primary outline-none bg-surface-container-low"
                  />
                ))}
              </div>
              <div className="text-center font-label-sm text-xs text-on-surface-variant">
                {t('एसएमएस ओटिपी कोड:', 'SMS OTP:')} 9898****** → <strong className="font-mono text-on-surface">841-920</strong>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setReviewModal(false)}
                className="flex-1 py-3 rounded-xl bg-surface-container-low text-on-surface font-bold text-xs hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
              >
                {t('रद्द गर्नुहोस्', 'Cancel')}
              </button>
              <button
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                type="button"
                onClick={() => {
                  setReviewModal(false);
                  alert(`Transfer of NPR ${parseInt(amount).toLocaleString()} to ${verifiedMember?.name} successfully cleared on CBS ledger!`);
                }}
              >
                <span>{t('रकम पठाउनुहोस्', 'Send Funds')} ({t('रु.', 'NPR')} {parseInt(amount || '0').toLocaleString()})</span>
                <MI n="arrow_forward" cls="text-[16px]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD BENEFICIARY MODAL */}
      {addBeneficiaryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onClick={() => setAddBeneficiaryModal(false)}>
          <div className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-modal-in border border-outline-variant/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-outline-variant/15">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MI n="person_add" cls="text-[22px] text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">{t('नयाँ लाभार्थी थप्नुहोस्', 'Add New Beneficiary')}</h3>
                <p className="font-label-sm text-xs text-on-surface-variant">{t('सीबीएस प्रमाणित सहकारी सदस्य खोजी र सुरक्षित', 'CBS-verified cooperative member lookup & save')}</p>
              </div>
              <button onClick={() => setAddBeneficiaryModal(false)} className="ml-auto p-1 rounded-lg hover:bg-surface-container cursor-pointer" type="button">
                <MI n="close" cls="text-[20px] text-on-surface-variant" />
              </button>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                  {t('लाभार्थी सदस्य नम्बर', 'Beneficiary Member ID')}
                </label>
                <input
                  defaultValue="UKO-2072-04419"
                  className="w-full px-4 py-3 rounded-xl border-2 border-primary bg-surface-container-low text-sm font-mono font-bold outline-none"
                />
              </div>

              {/* CBS Preview */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base">
                    BT
                  </div>
                  <div>
                    <div className="font-headline text-sm font-bold text-on-surface">Bhojraj Tharu</div>
                    <div className="font-label-sm text-xs text-on-surface-variant">UKO-2072-04419 · Gadhwa-5, Deukhuri, Dang</div>
                    <div className="flex gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-success/10 text-status-success text-[11px] font-bold">
                        <MI n="check_circle" cls="text-[12px]" /> {t('सीबीएस प्रमाणित सदस्य', 'CBS Verified Member')}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                        Tier-1 Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                  {t('सम्बन्ध / उपनाम', 'Relationship / Nickname')}
                </label>
                <input
                  defaultValue="Bhojraj Dai - Dairy Supplier"
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAddBeneficiaryModal(false)}
                className="flex-1 py-3 rounded-xl bg-surface-container-low text-on-surface font-bold text-xs hover:bg-surface-container transition-colors"
                type="button"
              >
                {t('रद्द गर्नुहोस्', 'Cancel')}
              </button>
              <button
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container flex items-center justify-center gap-2 shadow-sm transition-colors"
                type="button"
                onClick={() => {
                  setAddBeneficiaryModal(false);
                  alert('Beneficiary added to frequent list!');
                }}
              >
                <MI n="verified_user" cls="text-[18px]" />
                <span>{t('लाभार्थी सुरक्षित गर्नुहोस्', 'Save Beneficiary')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION RECEIPT VOUCHER MODAL */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onClick={() => setReceiptModal(null)}>
          <div className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal-in border border-outline-variant/20" onClick={e => e.stopPropagation()}>
            <div className="text-center pb-4 border-b border-outline-variant/15">
              <div className="w-12 h-12 rounded-full bg-status-success/10 text-status-success mx-auto flex items-center justify-center mb-2">
                <MI n="check_circle" cls="text-[28px]" />
              </div>
              <h3 className="font-headline text-lg font-bold text-on-surface">उनको बचत तथा ऋण सहकारी संस्था लि.</h3>
              <p className="font-label-sm text-xs text-on-surface-variant">Unako SACCOS · Central CBS Transaction Advice</p>
              <div className="font-display-stat text-2xl font-bold text-primary mt-2 font-headline">
                {receiptModal.isCredit ? '+' : '-'}NPR {receiptModal.amount}
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-success/10 text-status-success text-xs font-bold mt-1">
                {receiptModal.status}
              </span>
            </div>

            <div className="py-4 space-y-2 text-xs border-b border-outline-variant/15">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Transaction Ref:</span>
                <span className="font-mono font-bold text-on-surface">{receiptModal.ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Date &amp; Time:</span>
                <span className="font-bold text-on-surface">{receiptModal.date} · {receiptModal.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Counterparty:</span>
                <span className="font-bold text-on-surface text-right">{receiptModal.counterparty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Channel:</span>
                <span className="font-bold text-on-surface">{receiptModal.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Account:</span>
                <span className="font-bold text-on-surface">{receiptModal.account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Purpose / Remarks:</span>
                <span className="font-bold text-on-surface text-right max-w-[60%]">{receiptModal.sub}</span>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setReceiptModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-bold text-xs hover:bg-surface-container"
                type="button"
              >
                {t('बन्द गर्नुहोस्', 'Close')}
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container flex items-center justify-center gap-1.5"
                type="button"
              >
                <MI n="print" cls="text-[16px]" />
                <span>{t('प्रिन्ट रसिद', 'Print Receipt')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
