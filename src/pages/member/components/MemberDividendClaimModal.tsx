import React, { useState, useEffect } from 'react';
import { useCoopStore } from '../../../store/useCoopStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import {
  X,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Building,
  Award,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemberDividendClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  initialMode?: 'SAVINGS' | 'SHARES';
}

export const MemberDividendClaimModal: React.FC<MemberDividendClaimModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'SAVINGS',
}) => {
  const { t, fmtCurrency, fmtCount } = useLanguageStore();
  const { members, savings, claimMemberDividend } = useCoopStore();

  // Active member (logged in member is first verified member)
  const currentMember = members[0];
  const [claimMode, setClaimMode] = useState<'SAVINGS' | 'SHARES'>(initialMode);
  const [selectedSavingsAcc, setSelectedSavingsAcc] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const memberSavings = currentMember
    ? savings.filter((s) => s.memberId === currentMember.id)
    : [];

  useEffect(() => {
    setClaimMode(initialMode);
    if (memberSavings.length > 0) {
      setSelectedSavingsAcc(memberSavings[0].accountNo);
    }
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !currentMember) return null;

  const accruedAmount = currentMember.accruedDividend || 0;
  const eligibleKitta = Math.floor(accruedAmount / 100);
  const reinvestCapital = eligibleKitta * 100;
  const oddRemainder = accruedAmount - reinvestCapital;

  const handleConfirm = () => {
    if (accruedAmount <= 0) return;
    setIsProcessing(true);

    try {
      const result = claimMemberDividend({
        memberId: currentMember.id,
        destination: claimMode,
        savingsAccountNo: claimMode === 'SAVINGS' ? selectedSavingsAcc : undefined,
      });

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      if (claimMode === 'SAVINGS') {
        onSuccess(
          t(
            `लाभांश रकम रु. ${result.amountClaimed.toLocaleString()} सफलतापूर्वक बचत खातामा जम्मा भयो!`,
            `Dividend amount of NPR ${result.amountClaimed.toLocaleString()} transferred to savings passbook!`
          )
        );
      } else {
        onSuccess(
          t(
            `लाभांश रकमबाट थप ${result.newSharesCount} कित्ता सेयर (रु. ${result.amountClaimed.toLocaleString()}) सफलतापूर्वक पुँजीकरण गरियो!`,
            `${result.newSharesCount} new shares (NPR ${result.amountClaimed.toLocaleString()}) successfully issued via dividend reinvestment!`
          )
        );
      }
      onClose();
    } catch {
      // fallback
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dividend-claim-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-surface-card w-full max-w-lg rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden my-auto animate-modal-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-primary text-on-primary flex items-center justify-between border-b border-primary-container">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/10 text-white">
              <Coins className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="dividend-claim-title" className="font-bold text-sm sm:text-base">
                  {t('लाभांश दाबी तथा व्यवस्थापन', 'Dividend Claim & Reinvestment')}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
                  <ShieldCheck className="size-3" />
                  {t('प्रमाणित', 'Verified')}
                </span>
              </div>
              <p className="text-[11px] text-white/80">
                {currentMember.name} • {currentMember.memberNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('बन्द गर्नुहोस्', 'Close')}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Highlight Card */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider block">
                {t('प्राप्त हुन बाँकी लाभांश रकम', 'Unclaimed Accrued Dividend')}
              </span>
              <span className="font-headline text-2xl font-black text-primary mt-0.5 block tabular-nums">
                {fmtCurrency(accruedAmount, true)}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {t('वार्षिक साधारण सभाबाट स्वीकृत लाभांश', 'AGM approved dividend returns')}
              </span>
            </div>
            <Sparkles className="size-8 text-primary opacity-80" />
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface">
              {t('तपाईं कसरी लाभांश उपयोग गर्न चाहनुहुन्छ?', 'How would you like to use your dividend?')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setClaimMode('SAVINGS')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  claimMode === 'SAVINGS'
                    ? 'border-primary bg-primary/10 text-on-surface shadow-xs'
                    : 'border-outline-variant/20 hover:bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-on-surface">
                    <Building className="size-4 text-primary" />
                    <span>{t('बचत खातामा जम्मा', 'Transfer to Savings')}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    {t('तुरुन्त निकाल्न वा रकमान्तर गर्न मिल्ने।', 'Instant access in savings passbook.')}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-primary mt-2 block font-mono">
                  {fmtCurrency(accruedAmount, true)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setClaimMode('SHARES')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  claimMode === 'SHARES'
                    ? 'border-purple-600 bg-purple-500/10 text-on-surface shadow-xs'
                    : 'border-outline-variant/20 hover:bg-surface-container-low text-on-surface-variant'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-on-surface">
                    <Award className="size-4 text-purple-600" />
                    <span>{t('सेयरमा पुँजीकरण', 'Reinvest in Shares')}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    {t('लाभांशबाट थप कित्ता खरिद (प्रति कित्ता रु. १००)', 'Allot shares at NPR 100/kitta.')}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-purple-600 mt-2 block font-mono">
                  +{fmtCount(eligibleKitta)} {t('कित्ता', 'Shares')}
                </span>
              </button>
            </div>
          </div>

          {/* Mode-specific Details */}
          {claimMode === 'SAVINGS' ? (
            <div className="p-3.5 rounded-xl border border-outline-variant/15 bg-surface-container-low space-y-2">
              <label className="block text-xs font-bold text-on-surface">
                {t('जम्मा हुने लक्ष्य बचत खाता', 'Destination Savings Account')}
              </label>
              {memberSavings.length > 0 ? (
                <select
                  value={selectedSavingsAcc}
                  onChange={(e) => setSelectedSavingsAcc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant/25 bg-surface-card text-xs font-mono font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary"
                >
                  {memberSavings.map((s) => (
                    <option key={s.id} value={s.accountNo}>
                      {s.accountNo} - {s.accountType} ({fmtCurrency(s.balance, true)})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-on-surface-variant">
                  {t('नियमित बचत खाता (Regular Savings Passbook)', 'Primary Regular Savings Passbook')}
                </div>
              )}
              <span className="text-[11px] text-on-surface-variant block">
                {t('कुनै सेवा शुल्क लाग्दैन • तुरुन्तै पासबुकमा अद्यावधिक हुन्छ।', 'Zero transfer fee • Immediate passbook update.')}
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant">{t('थप हुने सेयर कित्ता:', 'New Share Units:')}</span>
                <span className="font-bold text-purple-700 dark:text-purple-300 font-mono text-sm">
                  +{fmtCount(eligibleKitta)} {t('कित्ता', 'Shares')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-purple-200/50 dark:border-purple-800/40">
                <span className="text-on-surface-variant">{t('पुँजीकृत रकम:', 'Capital Invested:')}</span>
                <span className="font-black text-on-surface font-mono">
                  {fmtCurrency(reinvestCapital, true)}
                </span>
              </div>
              {oddRemainder > 0 && (
                <div className="flex justify-between items-center py-1 border-t border-purple-200/50 dark:border-purple-800/40 text-[11px] text-on-surface-variant">
                  <span>{t('बाँकी बक्यौता मौज्दात:', 'Remaining Ledger Balance:')}</span>
                  <span className="font-mono font-bold">{fmtCurrency(oddRemainder, true)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/15 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-outline-variant/25 text-on-surface hover:bg-surface-container font-label-md text-xs font-bold transition cursor-pointer"
          >
            {t('रद्द गर्नुहोस्', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={accruedAmount <= 0 || isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-on-primary font-label-md text-xs font-bold shadow-md transition cursor-pointer"
          >
            <CheckCircle2 className="size-4" />
            <span>
              {isProcessing
                ? t('प्रक्रिया हुँदैछ...', 'Processing...')
                : claimMode === 'SAVINGS'
                ? t('बचतमा जम्मा गर्नुहोस्', 'Confirm Deposit to Savings')
                : t('सेयरमा पुँजीकरण गर्नुहोस्', 'Confirm Reinvestment')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
