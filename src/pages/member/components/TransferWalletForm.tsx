import React from 'react';
import {
  Wallet,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

export type PaymentGateway = 'esewa' | 'khalti' | 'connectips' | 'bank';

interface TransferWalletFormProps {
  selectedGateway: PaymentGateway;
  setSelectedGateway: (gateway: PaymentGateway) => void;
  walletAmount: string;
  setWalletAmount: (amount: string) => void;
  sourceAccountNo?: string;
  sourceBalance?: number;
  onDepositSuccess?: (amount: number, gateway: PaymentGateway) => void;
}

export const TransferWalletForm: React.FC<TransferWalletFormProps> = ({
  selectedGateway,
  setSelectedGateway,
  walletAmount,
  setWalletAmount,
  sourceAccountNo = 'SAV-001-88219',
  sourceBalance = 285600,
  onDepositSuccess,
}) => {
  const { t, fmtCurrency } = useLanguageStore();

  const gateways: { id: PaymentGateway; label: string; sub: string; icon: React.ReactNode }[] = [
    { id: 'esewa', label: 'eSewa', sub: 'Direct Inward', icon: <CreditCard className="w-5 h-5 text-emerald-500" /> },
    { id: 'khalti', label: 'Khalti', sub: 'Instant Load', icon: <Wallet className="w-5 h-5 text-purple-500" /> },
    { id: 'connectips', label: 'ConnectIPS', sub: 'Inter-Bank', icon: <Building2 className="w-5 h-5 text-blue-500" /> },
    { id: 'bank', label: 'Mobile Banking', sub: 'Fonepay Rail', icon: <Smartphone className="w-5 h-5 text-amber-500" /> },
  ];

  const handleGatewaySubmit = () => {
    const num = parseInt(walletAmount || '0', 10);
    if (onDepositSuccess && num > 0) {
      onDepositSuccess(num, selectedGateway);
    } else {
      alert(
        `Redirecting to ${selectedGateway.toUpperCase()} secure payment gateway for ${fmtCurrency(
          num,
          true
        )}...`
      );
    }
  };

  return (
    <div className="bg-surface-card rounded-2xl shadow-sm border border-outline-variant/15 overflow-hidden flex flex-col justify-between h-full">
      <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-low/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-headline text-title-md font-bold text-on-surface">
              {t('डिजिटल वालेट तथा बैंक लोड', 'Digital Wallet & Bank Deposit')}
            </h2>
            <p className="font-label-sm text-xs text-on-surface-variant">
              {t(
                'राष्ट्रिय गेटवेमार्फत उनको बचत पासबुकमा जम्मा गर्नुहोस्',
                'Deposit to Unako Savings Passbook via National Gateways'
              )}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-success/10 text-status-success font-bold text-xs">
          <Zap className="w-3.5 h-3.5" />
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
            {gateways.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGateway(g.id)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  selectedGateway === g.id
                    ? 'border-primary bg-primary/5 shadow-xs'
                    : 'border-outline-variant/30 hover:border-outline-variant/60 bg-surface-container-low'
                }`}
              >
                <div className="mb-1.5">{g.icon}</div>
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
          <div className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
            <div>
              <div className="font-label-md text-xs sm:text-sm font-bold text-on-surface">
                {t('साधारण सदस्य बचत', 'Regular Member Savings')} ({sourceAccountNo})
              </div>
              <div className="font-label-sm text-[11px] text-on-surface-variant">
                Available balance: {fmtCurrency(sourceBalance, true)}.00
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-status-success" />
          </div>
        </div>

        {/* Deposit Amount */}
        <div>
          <label className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
            {t('जम्मा गर्ने रकम', 'Deposit Amount')}
          </label>
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
            <div className="font-display-stat text-xl font-bold font-headline text-on-surface tabular-nums">
              {fmtCurrency(parseInt(walletAmount || '0'), true)}
            </div>
            <input
              type="number"
              value={walletAmount}
              onChange={e => setWalletAmount(e.target.value)}
              className="w-28 px-2.5 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-card text-right font-mono font-bold text-xs outline-none focus:border-primary"
              placeholder={t('रकम', 'Custom')}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap mt-2">
            {['1000', '2500', '5000', '10000', '25000'].map(a => (
              <button
                key={a}
                onClick={() => setWalletAmount(a)}
                className={`px-2.5 py-1 rounded-lg font-label-sm text-xs font-bold border transition-colors cursor-pointer ${
                  walletAmount === a
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                }`}
                type="button"
              >
                +{fmtCurrency(parseInt(a), true)}
              </button>
            ))}
          </div>
        </div>

        {/* Supported Switch Micro Bar */}
        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-semibold text-on-surface">
              {t('२४/७ स्वचालित समाधान:', '24/7 Automated Reconciliation:')}
            </span>
          </div>
          <span className="text-[11px] text-primary font-bold">
            {t('एनसिएचएल / नेपालपे / फोनपे प्रमाणित', 'NCHL / NepalPay / Fonepay Certified')}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 pt-0">
        <button
          onClick={handleGatewaySubmit}
          className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          type="button"
        >
          <ExternalLink className="w-4 h-4" />
          <span>
            {t(
              `गेटवे मार्फत जम्मा गर्नुहोस् (${fmtCurrency(parseInt(walletAmount || '0'), true)})`,
              `Load via Gateway (${fmtCurrency(parseInt(walletAmount || '0'), true)})`
            )}
          </span>
        </button>
      </div>
    </div>
  );
};
