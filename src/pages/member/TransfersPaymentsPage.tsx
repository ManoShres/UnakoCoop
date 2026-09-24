import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCoopStore } from '../../store/useCoopStore';
import { Beneficiary, PaymentRecord, VerifiedMember } from './components/TransferTypes';
import { TransferMemberForm } from './components/TransferMemberForm';
import { TransferWalletForm, PaymentGateway } from './components/TransferWalletForm';
import { TransferBeneficiariesSection } from './components/TransferBeneficiariesSection';
import { TransferHistorySection } from './components/TransferHistorySection';
import { TransferReviewModal } from './components/TransferReviewModal';
import { TransferAddBeneficiaryModal } from './components/TransferAddBeneficiaryModal';
import { TransferReceiptModal } from './components/TransferReceiptModal';

export function TransfersPaymentsPage() {
  const { t, fmtCurrency } = useLanguageStore();
  const currentMember = useAuthStore(s => s.currentMember);
  const savings = useCoopStore(s => s.savings);
  const adjustSavingsBalance = useCoopStore(s => s.adjustSavingsBalance);
  const addTransaction = useCoopStore(s => s.addTransaction);

  const [mode, setMode] = useState<'transfer' | 'wallet'>('transfer');
  const [memberId, setMemberId] = useState('UKO-2072-04419');
  const [amount, setAmount] = useState('10000');
  const [verifiedMember, setVerifiedMember] = useState<VerifiedMember | null>({
    name: 'Bhojraj Tharu',
    grade: 'A',
    job: 'Dairy Producer',
    loc: 'Chainpur, Gadhwa-5',
  });
  const [reviewModal, setReviewModal] = useState(false);
  const [addBeneficiaryModal, setAddBeneficiaryModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState<PaymentRecord | null>(null);
  const [purpose, setPurpose] = useState('Purchase of organic mustard seeds (Chainpur-Gadhwa)');
  const [acctType, setAcctType] = useState<'savings' | 'share'>('savings');
  const [customRecords, setCustomRecords] = useState<PaymentRecord[]>([]);

  // Wallet state
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('esewa');
  const [walletAmount, setWalletAmount] = useState('5000');

  // Member source account lookup from store
  const effectiveMemberId = currentMember?.id || 'm1';
  const regularSavings =
    savings.find(s => s.memberId === effectiveMemberId && s.accountType === 'Regular Savings') ||
    savings.find(s => s.accountType === 'Regular Savings') || {
      id: 's1',
      accountNo: 'SAV-001-88219',
      balance: 285600,
      accountType: 'Regular Savings',
    };

  const handleSelectBeneficiary = (b: Beneficiary) => {
    setMemberId(b.no);
    setVerifiedMember({
      name: b.name,
      grade: b.grade,
      job: b.job,
      loc: b.loc,
    });
  };

  const handleConfirmTransfer = () => {
    const numericAmount = parseInt(amount || '0', 10);
    if (numericAmount <= 0) return;

    adjustSavingsBalance(
      regularSavings.accountNo,
      numericAmount,
      'WITHDRAWAL',
      `Transfer to ${verifiedMember?.name || memberId}`
    );

    const newRef = `CBS-TRF-${Date.now().toString().slice(-5)}`;
    const newRecord: PaymentRecord = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      counterparty: `${verifiedMember?.name || 'Cooperative Member'} (${memberId})`,
      sub: purpose || 'Cooperative Member Transfer',
      channel: 'Member Transfer',
      account: `Regular Savings (${regularSavings.accountNo})`,
      amount: fmtCurrency(numericAmount, true) + '.00',
      isCredit: false,
      status: 'Instant Cleared',
      ref: newRef,
    };

    setCustomRecords(prev => [newRecord, ...prev]);

    addTransaction({
      memberId: effectiveMemberId,
      type: 'WITHDRAWAL',
      amount: numericAmount,
      description: `Transfer to ${verifiedMember?.name || memberId} - ${purpose || 'Inter-member transfer'}`,
      referenceNo: newRef,
    });

    setReviewModal(false);
    setReceiptModal(newRecord);
  };

  const handleDepositSuccess = (loadAmount: number, gateway: PaymentGateway) => {
    adjustSavingsBalance(
      regularSavings.accountNo,
      loadAmount,
      'DEPOSIT',
      `Digital Deposit via ${gateway.toUpperCase()}`
    );

    const newRef = `GW-${gateway.toUpperCase()}-${Date.now().toString().slice(-5)}`;
    const newRecord: PaymentRecord = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      counterparty: `${gateway.toUpperCase()} Gateway Deposit`,
      sub: `Digital Deposit via ${gateway.toUpperCase()} to ${regularSavings.accountNo}`,
      channel: 'Deposit Inward',
      account: `Regular Savings (${regularSavings.accountNo})`,
      amount: fmtCurrency(loadAmount, true) + '.00',
      isCredit: true,
      status: 'Credited',
      ref: newRef,
    };

    setCustomRecords(prev => [newRecord, ...prev]);

    addTransaction({
      memberId: effectiveMemberId,
      type: 'DEPOSIT',
      amount: loadAmount,
      description: `Digital Deposit via ${gateway.toUpperCase()}`,
      referenceNo: newRef,
    });

    setReceiptModal(newRecord);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-6 w-full max-w-[1280px] mx-auto pb-12">
        {/* HEADER SECTION */}
        <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-outline-variant/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-on-surface-variant mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                {t('सहकारी राफसाफ प्रणाली', 'COOPERATIVE CLEARING RAIL')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-status-success/10 text-status-success font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('केन्द्रीय सीबीएस आरटीजीएस सक्रिय', 'Core CBS RTGS Active')}
              </span>
              <span className="text-xs text-on-surface-variant">
                • {t('०% अन्तर-सदस्य अधिभार', '0% Inter-member Surcharge')}
              </span>
            </div>
            <h1 className="font-headline text-headline-sm md:text-headline-md font-bold text-on-surface tracking-tight">
              {t('रकम स्थानान्तरण तथा भुक्तानी डेस्क', 'Transfers & Payments Desk')}
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {t(
                'दाङ उपत्यकाका सहकारी सदस्यहरूबीच निःशुल्क तत्काल रकम पठाउनुहोस् वा डिजिटल वालेटमार्फत बचत जम्मा गर्नुहोस्।',
                'Send zero-fee instant funds to any registered cooperative member or load digital deposits securely via national payment rails.'
              )}
            </p>
          </div>

          {/* Available Liquidity Stat Pill */}
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 min-w-[240px] text-left md:text-right shrink-0">
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              {t('उपलब्ध बचत मौज्दात', 'Available Liquidity')}
            </div>
            <div className="font-display-stat text-[22px] font-bold text-primary tracking-tight mt-0.5">
              NPR {fmtCurrency(regularSavings.balance, true)}.00
            </div>
            <div className="font-label-sm text-xs text-on-surface-variant flex items-center md:justify-end gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-status-success inline-block"></span>
              {t('नियमित बचत', 'Regular Savings')} ({regularSavings.accountNo})
            </div>
          </div>
        </div>

        {/* MODE SELECTOR TABS */}
        <div className="flex items-center gap-3 border-b border-outline-variant/15 pb-2">
          <button
            onClick={() => setMode('transfer')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer ${
              mode === 'transfer'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
            type="button"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{t('सदस्य-देखि-सदस्य स्थानान्तरण', 'Member-to-Member Transfer')}</span>
          </button>
          <button
            onClick={() => setMode('wallet')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer ${
              mode === 'wallet'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
            type="button"
          >
            <Wallet className="w-4 h-4" />
            <span>{t('डिजिटल वालेट / बैंक लोड', 'Load Wallet & Deposit')}</span>
          </button>
        </div>

        {/* BENTO GRID: TRANSFER/WALLET FORM (7 COLS) & BENEFICIARIES (5 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            {mode === 'transfer' ? (
              <TransferMemberForm
                memberId={memberId}
                setMemberId={setMemberId}
                verifiedMember={verifiedMember}
                setVerifiedMember={setVerifiedMember}
                acctType={acctType}
                setAcctType={setAcctType}
                amount={amount}
                setAmount={setAmount}
                purpose={purpose}
                setPurpose={setPurpose}
                onReview={() => setReviewModal(true)}
                sourceAccountNo={regularSavings.accountNo}
                sourceBalance={regularSavings.balance}
              />
            ) : (
              <TransferWalletForm
                selectedGateway={selectedGateway}
                setSelectedGateway={setSelectedGateway}
                walletAmount={walletAmount}
                setWalletAmount={setWalletAmount}
                sourceAccountNo={regularSavings.accountNo}
                sourceBalance={regularSavings.balance}
                onDepositSuccess={handleDepositSuccess}
              />
            )}
          </div>

          <TransferBeneficiariesSection
            onSelectBeneficiary={handleSelectBeneficiary}
            onAddBeneficiary={() => setAddBeneficiaryModal(true)}
          />
        </div>

        {/* BOTTOM SECTION: TRANSACTION LEDGER */}
        <TransferHistorySection
          onViewReceipt={record => setReceiptModal(record)}
          customRecords={customRecords}
        />

        {/* MODALS */}
        <TransferReviewModal
          isOpen={reviewModal}
          onClose={() => setReviewModal(false)}
          amount={amount}
          memberId={memberId}
          verifiedMember={verifiedMember}
          acctType={acctType}
          purpose={purpose}
          onConfirmSuccess={handleConfirmTransfer}
          sourceAccountNo={regularSavings.accountNo}
        />

        <TransferAddBeneficiaryModal
          isOpen={addBeneficiaryModal}
          onClose={() => setAddBeneficiaryModal(false)}
          onSave={() => {
            setAddBeneficiaryModal(false);
          }}
        />

        <TransferReceiptModal record={receiptModal} onClose={() => setReceiptModal(null)} />
      </div>
    </div>
  );
}

export default TransfersPaymentsPage;
