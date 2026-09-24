import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  FileText,
  CreditCard,
  Download,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { Transaction } from '../../../../types';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { TransactionFilterType } from './MemberDashboardTypes';

interface MemberActivityFeedProps {
  transactions: Transaction[];
  memberNo: string;
}

export function MemberActivityFeed({ transactions, memberNo }: MemberActivityFeedProps) {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const [filter, setFilter] = useState<TransactionFilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filtered = transactions.filter((tx) => {
    // Type filtering
    if (filter === 'deposits') {
      const isDeposit = tx.type === 'DEPOSIT' || tx.type === 'DIVIDEND';
      if (!isDeposit) return false;
    } else if (filter === 'debits') {
      const isDebit = tx.type === 'WITHDRAWAL' || tx.type === 'SHARE_PURCHASE';
      if (!isDebit) return false;
    } else if (filter === 'loan_emi') {
      if (tx.type !== 'LOAN_EMI') return false;
    }

    // Search term filtering
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchRef = (tx.referenceNo || '').toLowerCase().includes(q);
      const matchId = tx.id.toLowerCase().includes(q);
      if (!matchDesc && !matchRef && !matchId) return false;
    }

    return true;
  });

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header with Title and Search */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('प्रमाणित कारोबार विवरण (Digital Passbook)', 'Verified Transaction Activity')}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
              CBS Live
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('सहकारी केन्द्रीय लेखा प्रणालीबाट तत्काल प्रमाणीकृत कारोबारहरू', 'Direct CBS real-time verified ledger transactions')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('कारोबार खोज्नुहोस्...', 'Search narration or ref...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <Link
            to="/member/my-accounts-passbook"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"
          >
            <FileText className="size-3.5 text-emerald-600" />
            <span className="hidden sm:inline">{t('पासबुक', 'Passbook')}</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'all', label: t('सबै कारोबार (All)', 'All Activity') },
          { id: 'deposits', label: t('जम्मा तथा आम्दानी (Deposits)', 'Deposits & Inflows') },
          { id: 'debits', label: t('खर्च तथा निकासी (Debits)', 'Withdrawals & Debits') },
          { id: 'loan_emi', label: t('ऋण किस्ता भुक्तानी (EMI)', 'Loan EMI Repayments') },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as TransactionFilterType)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              filter === tab.id
                ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {t('कुनै कारोबार फेला परेन।', 'No matching transactions found.')}
          </div>
        ) : (
          filtered.slice(0, 8).map((tx) => {
            const isCredit = tx.type === 'DEPOSIT' || tx.type === 'DIVIDEND';
            const isEmi = tx.type === 'LOAN_EMI';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition flex items-center justify-between gap-4 text-xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCredit
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : isEmi
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="size-5" />
                    ) : isEmi ? (
                      <CreditCard className="size-5" />
                    ) : (
                      <ArrowUpRight className="size-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {tx.description}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="truncate">{tx.referenceNo || tx.id}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-mono font-bold text-sm ${
                      isCredit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isEmi
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isCredit ? '+' : '−'} रु. {fmtCurrency(tx.amount, false)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {tx.status || 'COMPLETED'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Assurance */}
      <div className="p-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span>{t('सहकारी ऐन २०७४ अनुसार प्रमाणीकृत डिजिटल लेजर', 'SACCOS Act 2074 certified digital ledger')}</span>
        <Link
          to="/member/my-accounts-passbook"
          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>{t('सबै हेर्नुहोस्', 'View All')} ({transactions.length})</span>
          <ExternalLink className="size-3" />
        </Link>
      </div>

      {/* TRANSACTION RECEIPT MODAL */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  {t('कारोबार भौचर विवरण (CBS Receipt)', 'Transaction Voucher Receipt')}
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
              <div className="text-center py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  {t('कारोबार रकम', 'Transaction Amount')}
                </div>
                <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-1">
                  रु. {fmtCurrency(selectedTx.amount, false)}
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold mt-1">
                  {t('सफलतापूर्वक सम्पन्न', 'SETTLED & CONFIRMED')}
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
                  <span className="text-slate-500 font-sans">{t('भौचर / रेफरन्स नं.', 'Voucher Ref')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedTx.referenceNo || selectedTx.id}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 font-mono">
                  <span className="text-slate-500 font-sans">{t('मिति (Date)', 'Date')}</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedTx.date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">{t('प्रकार (Type)', 'Type')}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTx.type}</span>
                </div>
                <div className="flex justify-between py-1 font-mono">
                  <span className="text-slate-500 font-sans">{t('सदस्य नम्बर', 'Member ID')}</span>
                  <span className="text-slate-800 dark:text-slate-200">{memberNo}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
                >
                  {t('बन्द गर्नुहोस्', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
