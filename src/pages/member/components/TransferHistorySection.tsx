import React, { useState } from 'react';
import {
  Download,
  ArrowLeftRight,
  QrCode,
  ArrowDownLeft,
  PieChart,
  CheckCircle2,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { PaymentRecord, RECENT_PAYMENTS } from './TransferTypes';

interface TransferHistorySectionProps {
  onViewReceipt: (record: PaymentRecord) => void;
  customRecords?: PaymentRecord[];
}

export const TransferHistorySection: React.FC<TransferHistorySectionProps> = ({
  onViewReceipt,
  customRecords,
}) => {
  const { t } = useLanguageStore();
  const [filterType, setFilterType] = useState<string>('all');

  const allPayments = customRecords && customRecords.length > 0
    ? [...customRecords, ...RECENT_PAYMENTS]
    : RECENT_PAYMENTS;

  const filteredPayments = allPayments.filter(p => {
    if (filterType === 'all') return true;
    if (filterType === 'member') return p.channel === 'Member Transfer';
    if (filterType === 'qr') return p.channel === 'Merchant QR';
    if (filterType === 'deposit') return p.channel === 'Deposit Inward';
    if (filterType === 'share') return p.channel === 'Share Allocation';
    return true;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Member Transfer':
        return <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />;
      case 'Merchant QR':
        return <QrCode className="w-3.5 h-3.5 text-secondary" />;
      case 'Deposit Inward':
        return <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Share Allocation':
      default:
        return <PieChart className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
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
            {t(
              'प्रमाणित भुक्तानी, वालेट टपअप र अन्तर-सदस्य स्थानान्तरणको पूर्ण अभिलेख',
              'Complete CBS-verified audit trail of settled payments, wallet topups, and remittances'
            )}
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
                className={`px-3 py-1.5 rounded-lg font-label-sm text-xs font-semibold transition-all cursor-pointer ${
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-low text-xs font-bold transition-all cursor-pointer"
            type="button"
            title="Export Full Statement"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-semibold text-xs">
                    {getChannelIcon(p.channel)}
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
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.status === 'Instant Cleared' || p.status === 'Settled'
                        ? 'bg-status-success/10 text-status-success'
                        : p.status === 'Credited'
                        ? 'bg-status-info/10 text-status-info'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {p.status}
                  </span>
                </td>

                {/* Receipt Action */}
                <td className="py-3 px-3.5 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onViewReceipt(p)}
                    className="p-1.5 rounded-lg text-primary hover:text-primary-container hover:bg-surface-container transition-all cursor-pointer"
                    title="View Official Stamped Receipt"
                  >
                    <Receipt className="w-4 h-4" />
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
          <ShieldCheck className="w-4 h-4 text-status-success" />
          <span>All records stamped by Department of Cooperatives &amp; Unako Central CBS Compliance Engine.</span>
        </div>
        <div className="flex gap-4">
          <span className="font-semibold text-on-surface">Total Cleared Volume (Past 30 Days): NPR 1,04,450.00</span>
        </div>
      </div>
    </div>
  );
};
