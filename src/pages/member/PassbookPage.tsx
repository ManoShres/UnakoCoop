import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Printer,
  Download,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  CalendarCheck,
  Coins,
  Lock,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Transaction } from '../../types';
import { printElement } from '../../utils/printHelper';
import { PassbookDeskModal } from '../../components/admin/PassbookDeskModal';

export function PassbookPage() {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const { currentMember } = useAuthStore();
  const { savings, transactions, members, coopSettings } = useCoopStore();

  const [activeAccountIdx, setActiveAccountIdx] = useState(0);
  const [filter, setFilter] = useState<'all' | 'credits' | 'debits' | 'loan_emi'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isPassbookDeskOpen, setIsPassbookDeskOpen] = useState(false);

  const activeMember = currentMember || members[0];

  // Live account calculations
  const memberSavings = savings.filter(
    (s) => s.memberId === activeMember.id || s.accountNo.includes('004-10294')
  );

  const regularSavingsAcct =
    memberSavings.find((s) => s.accountType.includes('Regular') || s.accountType.includes('साधारण')) ||
    savings[0];

  const regularBalance = regularSavingsAcct?.balance || 184500;
  const compulsoryBalance = 68000;
  const shareBalance = activeMember.shareCapital || 50000;
  const fdBalance = 40350;
  const totalBalance = regularBalance + compulsoryBalance + shareBalance + fdBalance;

  const accounts = [
    {
      id: 'all',
      label: t('कुल सदस्य मौज्दात', 'Consolidated Ledger'),
      sub: t('४ खाताहरू', '4 Active Accounts'),
      bal: totalBalance,
      no: t('एकीकृत केन्द्रीय विवरण', 'Unified Portfolio Overview'),
      badge: 'ALL',
      badgeColor: 'bg-slate-900 text-white dark:bg-emerald-600',
    },
    {
      id: 'reg',
      label: t('नियमित बचत खाता', 'Regular Savings'),
      sub: '001',
      bal: regularBalance,
      no: regularSavingsAcct?.accountNo || '004-10294-88-01',
      badge: '8.0%',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800',
    },
    {
      id: 'comp',
      label: t('अनिवार्य मासिक बचत', 'Compulsory Monthly'),
      sub: '002',
      bal: compulsoryBalance,
      no: '004-10294-88-02 (रु. २,०००/महिना)',
      badge: '8.5%',
      badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800',
    },
    {
      id: 'share',
      label: t('सदस्य शेयर पुँजी', 'Share Capital'),
      sub: 'SC',
      bal: shareBalance,
      no: `${fmtDigits(activeMember.shareKitta || 500)} ${t('कित्ता @ रु. १००', 'Units @ NPR 100')}`,
      badge: '12%',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800',
    },
    {
      id: 'fd',
      label: t('मुद्दती निक्षेप', 'Fixed Term Deposit'),
      sub: 'FD',
      bal: fdBalance,
      no: t('१ वर्षे मुद्दती • परिपक्वता २०८२', '1-Yr Term • Mat 2082'),
      badge: '10.5%',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800',
    },
  ];

  // Live member transactions
  const memberTransactions = transactions.filter(
    (tx) => tx.memberId === activeMember.id || tx.memberId === 'mem-1' || !tx.memberId
  );

  const filteredTransactions = memberTransactions.filter((tx) => {
    if (filter === 'credits') {
      const isCredit = tx.type === 'DEPOSIT' || tx.type === 'DIVIDEND';
      if (!isCredit) return false;
    } else if (filter === 'debits') {
      const isDebit = tx.type === 'WITHDRAWAL' || tx.type === 'SHARE_PURCHASE';
      if (!isDebit) return false;
    } else if (filter === 'loan_emi') {
      if (tx.type !== 'LOAN_EMI') return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchRef = (tx.referenceNo || '').toLowerCase().includes(q);
      if (!matchDesc && !matchRef) return false;
    }

    return true;
  });

  const totalCredits = memberTransactions
    .filter((tx) => tx.type === 'DEPOSIT' || tx.type === 'DIVIDEND')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebits = memberTransactions
    .filter((tx) => tx.type === 'WITHDRAWAL' || tx.type === 'LOAN_EMI' || tx.type === 'SHARE_PURCHASE')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handlePrint = () => {
    printElement('passbook-ledger-statement');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1">
            <ShieldCheck className="size-4" />
            <span>{t('केन्द्रीय बैंकिङ्ग प्रमाणीकृत डिजिटल पासबुक', 'CBS VERIFIED DIGITAL PASSBOOK')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('सदस्य पासबुक तथा खाता लेजर', 'Member Passbook & Transaction Ledger')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            {t('सदस्य:', 'Member:')} <strong className="text-slate-700 dark:text-slate-200">{activeMember.name}</strong> ({activeMember.memberNo}) • {coopSettings.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/member/annual-statement"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition shadow-2xs"
          >
            <FileText className="size-4 text-emerald-600" />
            <span>{t('वार्षिक कर विवरण', 'Annual Statement')}</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsPassbookDeskOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-bold shadow-2xs transition cursor-pointer"
            title={t('भौतिक पासबुक कभर, बारकोड तथा लाइन-प्रिन्टर मुद्रण', 'Physical Passbook Cover, Barcode & Print Desk')}
          >
            <QrCode className="size-4" />
            <span>{t('भौतिक पासबुक तथा QR', 'Passbook QR & Book')}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Printer className="size-4" />
            <span>{t('पासबुक छाप्नुहोस्', 'Print Passbook')}</span>
          </button>
        </div>
      </div>

      {/* Account Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 print:hidden">
        {accounts.map((acct, idx) => (
          <button
            key={acct.id}
            type="button"
            onClick={() => setActiveAccountIdx(idx)}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
              activeAccountIdx === idx
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm ring-1 ring-emerald-500/30'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {acct.label}
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${acct.badgeColor}`}>
                  {acct.badge}
                </span>
              </div>
              <div className="text-lg font-black font-mono tracking-tight text-slate-900 dark:text-white">
                रु. {fmtCurrency(acct.bal, false)}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 truncate font-mono">
              {acct.no}
            </div>
          </button>
        ))}
      </div>

      {/* Financial Health & Inflow/Outflow Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">{t('कुल दाखिला / आम्दानी', 'Total Inflows (Credits)')}</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              + रु. {fmtCurrency(totalCredits, false)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{t('दुग्ध संकलन, नगद तथा लाभांश', 'Dairy credit, deposit & yield')}</div>
          </div>
          <div className="size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="size-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">{t('कुल खर्च तथा किस्ता', 'Total Outflows (Debits & EMI)')}</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
              − रु. {fmtCurrency(totalDebits, false)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{t('ऋण किस्ता भुक्तानी तथा स्थानान्तरण', 'Loan EMI payments & transfers')}</div>
          </div>
          <div className="size-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
            <TrendingDown className="size-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">{t('वार्षिक लाभांश प्रतिफल', 'Coop Annual Yield')}</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
              १४.२% + १.५%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{t('नगद लाभांश + बोनस शेयर', 'Cash Dividend + Bonus Units')}</div>
          </div>
          <div className="size-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Sparkles className="size-5" />
          </div>
        </div>
      </div>

      {/* Passbook Ledger Table Card */}
      <div id="passbook-ledger-statement" data-printable="statement" className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Printable Official Cooperative Header */}
        <div className="hidden print:block p-6 border-b-2 border-slate-800 mb-4 bg-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <img alt="Unako SACCOS Logo" className="h-12 w-auto object-contain" src="/unako-logo.png" />
              <div>
                <h1 className="text-base font-extrabold text-slate-900">{coopSettings.name}</h1>
                <p className="text-xs text-slate-700 font-semibold">{coopSettings.nameNepali}</p>
                <p className="text-[11px] text-slate-600">{coopSettings.address} • दर्ता: {coopSettings.regNo} | PAN: {coopSettings.panNo}</p>
              </div>
            </div>
            <div className="text-right text-xs">
              <p className="font-extrabold text-slate-900 text-sm">पासबुक स्टेटमेन्ट (Passbook Statement)</p>
              <p className="font-mono text-slate-700 font-bold mt-1">{activeMember.name} [{activeMember.memberNo}]</p>
              <p className="text-slate-600 font-mono text-[11px]">{accounts[activeAccountIdx].label} ({accounts[activeAccountIdx].no})</p>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {accounts[activeAccountIdx].label} — {t('कारोबार लेजर', 'Transaction Ledger')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {accounts[activeAccountIdx].no}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={t('भौचर वा विवरणबाट खोज्नुहोस्...', 'Search narration or voucher...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold shrink-0">
              {[
                { id: 'all', label: t('सबै', 'All') },
                { id: 'credits', label: t('जम्मा (+)', 'Credits') },
                { id: 'debits', label: t('डेबिट (-)', 'Debits') },
                { id: 'loan_emi', label: t('किस्ता', 'EMI') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id as 'all' | 'credits' | 'debits' | 'loan_emi')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filter === tab.id
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{t('कारोबार मिति (Date)', 'Date')}</th>
                <th className="py-3 px-4">{t('भौचर / रेफरन्स (Ref)', 'Voucher Ref')}</th>
                <th className="py-3 px-4">{t('कारोबार विवरण (Narration)', 'Narration & Details')}</th>
                <th className="py-3 px-4 text-right">{t('डेबिट (खर्च)', 'Debit (NPR)')}</th>
                <th className="py-3 px-4 text-right">{t('क्रेडिट (जम्मा)', 'Credit (NPR)')}</th>
                <th className="py-3 px-4 text-right">{t('अन्तिम मौज्दात', 'Balance (NPR)')}</th>
                <th className="py-3 px-4 text-center print:hidden">{t('भौचर', 'Receipt')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map((tx, idx) => {
                const isCredit = tx.type === 'DEPOSIT' || tx.type === 'DIVIDEND';
                const isEmi = tx.type === 'LOAN_EMI';
                return (
                  <tr
                    key={tx.id || idx}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {tx.referenceNo || tx.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-xs">
                      <div className="truncate font-semibold">{tx.description}</div>
                      <div className="text-[10px] text-slate-400">{tx.type}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      {!isCredit ? `− ${fmtCurrency(tx.amount, false)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {isCredit ? `+ ${fmtCurrency(tx.amount, false)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                      {fmtCurrency(regularBalance, false)}
                    </td>
                    <td className="py-3 px-4 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => setSelectedTx(tx)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 transition"
                        title={t('भौचर हेर्नुहोस्', 'View Voucher')}
                      >
                        <ExternalLink className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Printable Signatures */}
        <div className="hidden print:flex justify-between items-end pt-12 pb-4 px-6 text-xs text-slate-900 font-medium">
          <div className="text-center">
            <div className="w-40 border-b border-slate-800 mb-1"></div>
            <span className="font-bold">सदस्यको हस्ताक्षर (Member Sign)</span>
          </div>
          <div className="text-center">
            <div className="w-40 border-b border-slate-800 mb-1"></div>
            <span className="font-bold">अधिकृत हस्ताक्षर तथा छाप (Authorized Sign & Stamp)</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>{t('नेपाल सहकारी ऐन २०७४ अनुसार नियमित लेखा परीक्षण गरिएको आधिकारिक विवरण', 'Audited SACCOS ledger certified under Cooperative Act 2074')}</span>
          <span className="font-mono font-bold">{filteredTransactions.length} {t('कारोबारहरू', 'Entries')}</span>
        </div>
      </div>

      {/* RECEIPT / VOUCHER MODAL */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedTx(null)}
        >
          <div
            id="passbook-tx-voucher"
            data-printable="slip"
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  {t('आधिकारिक डिजिटल भौचर प्रतिलिपि', 'Certified CBS Voucher Receipt')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Slip Official Header (Print Only) */}
              <div className="hidden print:block pb-3 border-b-2 border-slate-900 mb-3 text-center">
                <h4 className="font-black text-sm text-slate-900">{coopSettings.name}</h4>
                <p className="text-[10px] text-slate-600">{coopSettings.address} • PAN: {coopSettings.panNo}</p>
                <span className="inline-block px-2 py-0.5 mt-1 border border-slate-900 rounded text-[10px] font-bold">
                  कारोबार भौचर प्रतिलिपि (CBS Transaction Slip)
                </span>
              </div>

              <div className="text-center py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  {t('कारोबार रकम (Amount)', 'Amount')}
                </div>
                <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-1">
                  रु. {fmtCurrency(selectedTx.amount, false)}
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold mt-1">
                  {t('प्रमाणीकृत तथा फर्छ्यौट', 'SETTLED & ARCHIVED')}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">{t('विवरण (Narration)', 'Narration')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-right max-w-[220px]">
                    {selectedTx.description}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 font-mono">
                  <span className="text-slate-500 font-sans">{t('भौचर नम्बर (JV Ref)', 'Voucher No')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedTx.referenceNo || selectedTx.id}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 font-mono">
                  <span className="text-slate-500 font-sans">{t('कारोबार मिति (Date)', 'Date')}</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedTx.date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">{t('खाता प्रकार (Account)', 'Account Type')}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTx.type}</span>
                </div>
                <div className="flex justify-between py-1 font-mono">
                  <span className="text-slate-500 font-sans">{t('सदस्य नम्बर', 'Member ID')}</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeMember.memberNo}</span>
                </div>
              </div>

              {/* Slip Signatures (Print Only) */}
              <div className="hidden print:flex justify-between items-end pt-8 pb-2 text-[10px] font-semibold text-slate-900">
                <div className="text-center">
                  <div className="w-24 border-b border-slate-800 mb-1"></div>
                  <span>दाखिलाकर्ता</span>
                </div>
                <div className="text-center">
                  <div className="w-24 border-b border-slate-800 mb-1"></div>
                  <span>टेलर्स / क्यासियर</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => printElement('passbook-tx-voucher')}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="size-4" />
                  <span>{t('छाप्नुहोस्', 'Print Slip')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  {t('बन्द गर्नुहोस्', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Physical Passbook, Barcode Verification & Print Desk Modal */}
      <PassbookDeskModal
        isOpen={isPassbookDeskOpen}
        onClose={() => setIsPassbookDeskOpen(false)}
        initialAccountNo={accounts[activeAccountIdx]?.no}
        initialMemberId={activeMember.id}
      />
    </div>
  );
}
