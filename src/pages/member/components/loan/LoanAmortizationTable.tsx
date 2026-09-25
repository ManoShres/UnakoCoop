import React, { useState } from 'react';
import { Printer, Check, Download, FileSpreadsheet } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { Loan } from '../../../../types';
import { printElement } from '../../../../utils/printHelper';

interface LoanAmortizationTableProps {
  onPayNow: () => void;
  activeLoan?: Loan;
}

export const LoanAmortizationTable: React.FC<LoanAmortizationTableProps> = ({ onPayNow, activeLoan }) => {
  const { t, fmtCurrency } = useLanguageStore();
  const [filter, setFilter] = useState<'all' | 'paid' | 'upcoming'>('all');

  const loanNo = activeLoan?.loanNo || 'LN-2025-0429';
  const emi = activeLoan?.monthlyEmi ?? 23650;
  const tenure = activeLoan?.tenureMonths ?? 24;

  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-outline-variant/15 print:border-none print:shadow-none" id="schedule" data-printable="statement">
      {/* Official Cooperative Header (Print Only) */}
      <div className="hidden print:block pb-4 mb-3 border-b-2 border-slate-900 bg-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <img src="/unako-logo.png" alt="Unako Logo" className="h-12 w-auto object-contain" />
            <div>
              <h2 className="font-headline-sm font-extrabold text-slate-900">उनको बचत तथा ऋण सहकारी संस्था लि.</h2>
              <p className="text-xs text-slate-700 font-semibold">Unako Savings & Credit Cooperative Society Ltd.</p>
              <p className="text-[11px] text-slate-600">गढवा-५, देउखुरी, दाङ • दर्ता नं: २०७०-०१ | PAN: ३००९१२८३७</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="inline-block px-2.5 py-0.5 rounded bg-slate-100 font-bold border border-slate-300">
              ऋण चुक्ता तथा किस्ता तालिका (Amortization Schedule)
            </span>
            <p className="font-mono text-slate-800 font-bold mt-1">खाता / ऋण नं: {loanNo}</p>
            <p className="text-[10px] text-slate-500 font-mono">मुद्रण मिति: {new Date().toLocaleDateString('ne-NP')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-headline text-lg sm:text-xl text-on-surface font-bold">
              {t('ऋण चुक्ता तथा किस्ता तालिका', 'Amortization & Payment Ledger')}
            </h3>
            <span className="bg-surface-container px-3 py-0.5 rounded-full font-label-sm text-xs font-bold text-primary">
              {tenure} Installments Total
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            {t(
              'चुक्ता भइसकेका, हाल तिर्नुपर्ने र आगामी किस्ताहरूको पूर्ण विवरण',
              'Complete record of cleared installments, immediate dues, and future forecasts'
            )}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-surface-card text-on-surface shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t('सबै', 'All')}
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-xs font-bold transition-all cursor-pointer ${
                filter === 'paid'
                  ? 'bg-surface-card text-on-surface shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t('तिरिएका', 'Paid')}
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-xs font-bold transition-all cursor-pointer ${
                filter === 'upcoming'
                  ? 'bg-surface-card text-on-surface shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t('आगामी', 'Upcoming')}
            </button>
          </div>
          <button
            onClick={() => printElement('schedule')}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all border border-outline-variant/20 cursor-pointer"
            title="Print Statement"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-body-sm text-xs">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">
              <th className="py-3 px-3.5 rounded-l-xl">No.</th>
              <th className="py-3 px-3.5">{t('भाखा मिति (वि.सं.)', 'Due Date (B.S.)')}</th>
              <th className="py-3 px-3.5">{t('साँवा रकम', 'Principal (साँवा)')}</th>
              <th className="py-3 px-3.5">{t('ब्याज रकम', 'Interest (ब्याज)')}</th>
              <th className="py-3 px-3.5">{t('कुल किस्ता', 'Total Installment')}</th>
              <th className="py-3 px-3.5">{t('बाँकी साँवा', 'Remaining Principal')}</th>
              <th className="py-3 px-3.5">{t('स्थिति', 'Status')}</th>
              <th className="py-3 px-3.5 text-right rounded-r-xl print:hidden">{t('रसिद', 'Receipt')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 font-tabular-mono" id="amortization-table-body">
            {/* Installment #25 (Immediate Active Due) */}
            {(filter === 'all' || filter === 'upcoming') && (
              <tr className="bg-primary/5 hover:bg-primary/10 transition-colors font-medium">
                <td className="py-3 px-3.5 font-bold text-on-surface">#25</td>
                <td className="py-3 px-3.5 text-on-surface font-semibold">Chaitra 15, 2081</td>
                <td className="py-3 px-3.5 text-on-surface">NPR {fmtCurrency(Math.round(emi * 0.8), true)}</td>
                <td className="py-3 px-3.5 text-on-surface-variant">NPR {fmtCurrency(Math.round(emi * 0.2), true)}</td>
                <td className="py-3 px-3.5 font-bold text-primary">NPR {fmtCurrency(emi, true)}</td>
                <td className="py-3 px-3.5 text-on-surface">NPR {fmtCurrency(activeLoan?.remainingBalance ?? 320000, true)}</td>
                <td className="py-3 px-3.5">
                  <span className="inline-flex items-center gap-1.5 bg-primary/15 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    {t('भुक्तानी गर्नुपर्ने', 'Action Due')}
                  </span>
                </td>
                <td className="py-3 px-3.5 text-right print:hidden">
                  <button
                    onClick={onPayNow}
                    className="bg-primary hover:bg-primary/90 text-on-primary text-xs font-label-sm px-3 py-1 rounded-lg transition-all font-bold shadow-2xs cursor-pointer"
                  >
                    {t('तिर्नुहोस्', 'Pay Now')}
                  </button>
                </td>
              </tr>
            )}

            {/* Installment #24 (Paid) */}
            {(filter === 'all' || filter === 'paid') && (
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-3 px-3.5 text-on-surface-variant">#24</td>
                <td className="py-3 px-3.5 text-on-surface">Falgun 15, 2081</td>
                <td className="py-3 px-3.5 text-on-surface">NPR {fmtCurrency(Math.round(emi * 0.79), true)}</td>
                <td className="py-3 px-3.5 text-on-surface-variant">NPR {fmtCurrency(Math.round(emi * 0.21), true)}</td>
                <td className="py-3 px-3.5 text-on-surface">NPR {fmtCurrency(emi, true)}</td>
                <td className="py-3 px-3.5 text-on-surface">NPR {fmtCurrency((activeLoan?.remainingBalance ?? 320000) + Math.round(emi * 0.79), true)}</td>
                <td className="py-3 px-3.5">
                  <span className="inline-flex items-center gap-1 bg-status-success/10 text-status-success px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <Check className="w-3.5 h-3.5" />
                    {t('चुक्ता (समयमै)', 'Paid (On Time)')}
                  </span>
                </td>
                <td className="py-3 px-3.5 text-right print:hidden">
                  <button
                    onClick={() => printElement('schedule')}
                    className="text-primary hover:text-primary/80 p-1.5 rounded hover:bg-surface-container transition-all cursor-pointer"
                    title="Print Statement"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            )}

            {/* Installment #23 (Paid) */}
            {(filter === 'all' || filter === 'paid') && (
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-3 px-3.5 text-on-surface-variant">#23</td>
                <td className="py-3 px-3.5 text-on-surface">Magh 15, 2081</td>
                <td className="py-3 px-3.5 text-on-surface">NPR {fmtCurrency(Math.round(emi * 0.78), true)}</td>
                <td className="py-3 px-3.5 text-on-surface-variant">NPR {fmtCurrency(Math.round(emi * 0.22), true)}</td>
                <td className="py-3 px-3.5 text-on-surface">NPR {fmtCurrency(emi, true)}</td>
                <td className="py-3 px-3.5 text-on-surface">NPR {fmtCurrency((activeLoan?.remainingBalance ?? 320000) + Math.round(emi * 1.57), true)}</td>
                <td className="py-3 px-3.5">
                  <span className="inline-flex items-center gap-1 bg-status-success/10 text-status-success px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <Check className="w-3.5 h-3.5" />
                    {t('चुक्ता (समयमै)', 'Paid (On Time)')}
                  </span>
                </td>
                <td className="py-3 px-3.5 text-right print:hidden">
                  <button
                    onClick={() => printElement('schedule')}
                    className="text-primary hover:text-primary/80 p-1.5 rounded hover:bg-surface-container transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            )}

            {/* Installment #26 (Future) */}
            {(filter === 'all' || filter === 'upcoming') && (
              <tr className="hover:bg-surface-container-low transition-colors text-on-surface-variant">
                <td className="py-3 px-3.5">#26</td>
                <td className="py-3 px-3.5">Baisakh 15, 2082</td>
                <td className="py-3 px-3.5">NPR {fmtCurrency(Math.round(emi * 0.81), true)}</td>
                <td className="py-3 px-3.5">NPR {fmtCurrency(Math.round(emi * 0.19), true)}</td>
                <td className="py-3 px-3.5 font-semibold text-on-surface">NPR {fmtCurrency(emi, true)}</td>
                <td className="py-3 px-3.5">NPR {fmtCurrency(Math.max(0, (activeLoan?.remainingBalance ?? 320000) - Math.round(emi * 0.8)), true)}</td>
                <td className="py-3 px-3.5">
                  <span className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-0.5 rounded-full text-xs text-on-surface-variant">
                    {t('आगामी तालिका', 'Scheduled')}
                  </span>
                </td>
                <td className="py-3 px-3.5 text-right text-on-surface-variant/60 text-xs print:hidden">Pending</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Signatures for Print */}
      <div className="hidden print:flex justify-between items-end pt-12 pb-4 px-4 text-xs text-slate-900 font-semibold">
        <div className="text-center">
          <div className="w-36 border-b border-slate-800 mb-1"></div>
          <span>ऋणीको दस्तखत (Borrower)</span>
        </div>
        <div className="text-center">
          <div className="w-36 border-b border-slate-800 mb-1"></div>
          <span>ऋण अधिकृत / छाप (Credit Officer)</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 mt-2 border-t border-outline-variant/15 text-xs text-on-surface-variant print:hidden">
        <span>Showing schedule for active facility {loanNo}</span>
        <button
          onClick={() => printElement('schedule')}
          className="font-label-sm text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer"
        >
          {t('तालिका निकासा (.CSV / PDF)', 'Export Full Schedule (.CSV / PDF)')}
          <FileSpreadsheet className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
