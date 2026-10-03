import React, { useState, useMemo } from 'react';
import {
  Award,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Coins,
  ArrowRight,
  Printer,
  Sparkles,
  TrendingUp,
  FileText,
  PiggyBank,
  Percent,
  Wheat,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useCoopStore } from '../../../store/useCoopStore';
import {
  getMemberPatronageDistribution,
  getMemberPatronageMetric,
  MemberPatronageDistribution,
} from '../../../utils/patronageRefundEngine';
import { printElement } from '../../../utils/printHelper';

interface MemberPatronageSectionProps {
  onSuccessToast?: (msg: string) => void;
}

export const MemberPatronageSection: React.FC<MemberPatronageSectionProps> = ({
  onSuccessToast,
}) => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const { members, savings, addTransaction, coopSettings } = useCoopStore();

  const currentMember = members[0];
  const memberSavings = currentMember
    ? savings.filter((s) => s.memberId === currentMember.id)
    : [];

  const [selectedSavingsAcc, setSelectedSavingsAcc] = useState<string>(
    memberSavings[0]?.accountNo || '004-10294-88-01'
  );
  const [claimMode, setClaimMode] = useState<'SAVINGS' | 'SHARES'>('SAVINGS');
  const [isClaimed, setIsClaimed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Compute this member's patronage data
  const metric = useMemo(() => {
    return getMemberPatronageMetric(currentMember?.id || 'mem-1');
  }, [currentMember?.id]);

  const distribution = useMemo<MemberPatronageDistribution>(() => {
    const dist = getMemberPatronageDistribution(currentMember?.id || 'mem-1');
    if (isClaimed) {
      return {
        ...dist,
        status: 'DISBURSED',
        payoutMode: claimMode === 'SAVINGS' ? 'SAVINGS_ACCOUNT' : 'SHARE_CAPITAL',
      };
    }
    return dist;
  }, [currentMember?.id, isClaimed, claimMode]);

  const eligibleKitta = Math.floor(distribution.netPatronageRefund / 100);

  const handleClaim = () => {
    if (distribution.netPatronageRefund <= 0 || isClaimed) return;
    setIsProcessing(true);

    try {
      if (claimMode === 'SAVINGS') {
        addTransaction({
          memberId: currentMember?.id || 'mem-1',
          type: 'DEPOSIT',
          amount: distribution.netPatronageRefund,
          description: `संरक्षित पूँजी फिर्ता कोष (Patronage Refund Warrant: ${distribution.warrantNumber})`,
          referenceNo: distribution.warrantNumber,
        });
      } else {
        addTransaction({
          memberId: currentMember?.id || 'mem-1',
          type: 'SHARE_PURCHASE',
          amount: eligibleKitta * 100,
          description: `संरक्षित पुँजी फिर्ताबाट थप सेयर पुँजीकरण (${eligibleKitta} कित्ता, Warrant: ${distribution.warrantNumber})`,
          referenceNo: distribution.warrantNumber,
        });
      }


      setIsClaimed(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      const msg =
        claimMode === 'SAVINGS'
          ? t(
              `रु. ${distribution.netPatronageRefund.toLocaleString()} संरक्षित पूँजी फिर्ता बचत खाता (${selectedSavingsAcc}) मा जम्मा भयो!`,
              `NPR ${distribution.netPatronageRefund.toLocaleString()} Patronage refund credited to savings account (${selectedSavingsAcc})!`
            )
          : t(
              `रु. ${(eligibleKitta * 100).toLocaleString()} बराबरको थप ${eligibleKitta} कित्ता सेयर पुँजीकरण सम्पन्न भयो!`,
              `NPR ${(eligibleKitta * 100).toLocaleString()} successfully capitalized into ${eligibleKitta} new shares!`
            );

      onSuccessToast?.(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = (format: 'a4' | 'thermal-80mm') => {
    printElement('patronage-warrant-printable', {
      format,
      title: `Patronage-Warrant-${distribution.warrantNumber}`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section 41 Statutory Explanation Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{t('सहकारी ऐन २०७४ दफा ४१ • वैधानिक अधिकार', 'Cooperative Act 2074 Sec 41 • Statutory Right')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('सदस्य संरक्षित पूँजी फिर्ता कोष (Patronage Refund)', 'Member Patronage Refund Fund')}
            </h2>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              {t(
                'सहकारी ऐन २०७४ को दफा ४१ अनुसार खुद बचत नाफाको कम्तीमा ४०% रकम सदस्यहरूले संस्थासँग वर्षभरि गरेको कारोबार (बचत ब्याज, ऋण ब्याज भुक्तानी, तथा कृषि/दुग्ध कारोबार) को अनुपातमा लाभांश स्वरूप फिर्ता पाउने व्यवस्था छ।',
                'Under Section 41 of the Nepal Cooperative Act 2074, at least 40% of net divisible surplus is returned to members proportionally based on annual business transaction volume.'
              )}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex flex-col items-center justify-center shrink-0 min-w-[220px]">
            <span className="text-xs uppercase font-bold text-emerald-200 tracking-wider">
              {t('तपाईंको कुल फिर्ता पुर्जी', 'Your Total Warrant Value')}
            </span>
            <span className="text-3xl sm:text-4xl font-black text-amber-300 mt-1 tabular-nums">
              {fmtCurrency(distribution.netPatronageRefund, true)}
            </span>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isClaimed ? t('दाबी भइसकेको', 'Already Claimed') : t('दाबी गर्न बाँकी', 'Available to Claim')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pillars of Member Patronage Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Savings Interest */}
        <div className="bg-surface-card rounded-2xl p-5 border border-outline-variant/20 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t('स्तम्भ ०१ • बचत ब्याज योगदान', 'Pillar 01 • Savings Interest')}
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <PiggyBank className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xs text-on-surface-variant">{t('वार्षिक आर्जित ब्याज:', 'Annual Earned Interest:')}</span>
              <div className="text-xl font-extrabold text-on-surface tabular-nums">
                {fmtCurrency(metric.annualSavingsInterestEarned, true)}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/15 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">{t('बचत लाभांश हिस्सा:', 'Savings Share:')}</span>
            <span className="text-sm font-bold text-primary tabular-nums">
              {fmtCurrency(distribution.savingsShareAmount, true)}
            </span>
          </div>
        </div>

        {/* Pillar 2: Loan Interest Paid */}
        <div className="bg-surface-card rounded-2xl p-5 border border-outline-variant/20 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t('स्तम्भ ०२ • ऋण ब्याज भुक्तानी', 'Pillar 02 • Loan Interest Paid')}
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xs text-on-surface-variant">{t('वार्षिक भुक्तान ब्याज:', 'Annual Interest Paid:')}</span>
              <div className="text-xl font-extrabold text-on-surface tabular-nums">
                {fmtCurrency(metric.annualLoanInterestPaid, true)}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/15 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">{t('ऋण लाभांश हिस्सा:', 'Loan Share:')}</span>
            <span className="text-sm font-bold text-primary tabular-nums">
              {fmtCurrency(distribution.loanShareAmount, true)}
            </span>
          </div>
        </div>

        {/* Pillar 3: Agro & Dairy Volume */}
        <div className="bg-surface-card rounded-2xl p-5 border border-outline-variant/20 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t('स्तम्भ ०३ • कृषि तथा उत्पादन', 'Pillar 03 • Agro & Dairy Volume')}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Wheat className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xs text-on-surface-variant">{t('वार्षिक कारोबार रकम:', 'Annual Business Volume:')}</span>
              <div className="text-xl font-extrabold text-on-surface tabular-nums">
                {fmtCurrency(metric.annualDairyBusinessVolume, true)}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/15 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">{t('कृषि लाभांश हिस्सा:', 'Agro Share:')}</span>
            <span className="text-sm font-bold text-primary tabular-nums">
              {fmtCurrency(distribution.dairyShareAmount, true)}
            </span>
          </div>
        </div>
      </div>

      {/* Warrant Detail & Claim Action Box */}
      <div className="bg-surface-card rounded-2xl border border-outline-variant/20 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-outline-variant/15">
          <div>
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-headline text-lg font-bold text-on-surface">
                {t('आधिकारिक संरक्षित पूँजी फिर्ता पुर्जी विवरण', 'Official Patronage Refund Warrant Details')}
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              {t('पुर्जी नम्बर (Warrant No):', 'Warrant Number:')}{' '}
              <span className="font-mono font-bold text-on-surface">{distribution.warrantNumber}</span>
              {' • '}{t('आर्थिक वर्ष:', 'Fiscal Year:')}{' '}
              <span className="font-bold text-on-surface">२०८०/०८१</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handlePrint('a4')}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/30 text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-primary" />
              <span>{t('A4 पुर्जी प्रिन्ट', 'Print A4 Warrant')}</span>
            </button>
            <button
              onClick={() => handlePrint('thermal-80mm')}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/30 text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>{t('८०mm थर्मल स्लिप', '80mm Thermal Slip')}</span>
            </button>
          </div>
        </div>

        {/* Claim Destination Selector */}
        {!isClaimed ? (
          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                {t('रकम भुक्तानी लिने माध्यम रोज्नुहोस्', 'Select Patronage Refund Payout Destination')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setClaimMode('SAVINGS')}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    claimMode === 'SAVINGS'
                      ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/30'
                      : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        claimMode === 'SAVINGS'
                          ? 'bg-primary text-white'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-on-surface">
                        {t('बचत खातामा जम्मा', 'Credit to Savings Passbook')}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {t('तत्काल नगद झिक्न वा कारोबार गर्न मिल्ने', 'Instant liquid cash available')}
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setClaimMode('SHARES')}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    claimMode === 'SHARES'
                      ? 'bg-emerald-500/5 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                      : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        claimMode === 'SHARES'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-on-surface">
                        {t('अतिरिक्त सेयर पुँजीकरण', 'Reinvest in Share Capital')}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {t(`रु. १००/कित्ताका दरले ${eligibleKitta} कित्ता सेयर खरिद`, `Acquire ${eligibleKitta} shares @ NPR 100`)}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {claimMode === 'SAVINGS' && memberSavings.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  {t('जम्मा हुने बचत खाता छनोट:', 'Select Destination Savings Account:')}
                </label>
                <select
                  value={selectedSavingsAcc}
                  onChange={(e) => setSelectedSavingsAcc(e.target.value)}
                  className="w-full sm:max-w-md px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-sm font-medium text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  {memberSavings.map((acc) => (
                    <option key={acc.id} value={acc.accountNo}>
                      {acc.accountNo} - {acc.accountType} (मौज्दात: {fmtCurrency(acc.balance, true)})
                    </option>
                  ))}

                </select>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {t(
                    'आयकर ऐन २०५८ अनुसार कारोबार फिर्ता (Patronage Rebate) मा ०% अग्रिम कर कट्टी हुन्छ।',
                    'As per Income Tax Act 2058, 0% withholding tax applies to transaction patronage rebates.'
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={handleClaim}
                disabled={isProcessing}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {claimMode === 'SAVINGS'
                    ? t(`रु. ${distribution.netPatronageRefund.toLocaleString()} दाबी गर्नुहोस्`, `Claim NPR ${distribution.netPatronageRefund.toLocaleString()}`)
                    : t(`थप ${eligibleKitta} कित्ता सेयर पुँजीकरण गर्नुहोस्`, `Capitalize ${eligibleKitta} Shares`)}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold text-emerald-700 dark:text-emerald-400">
                  {t('भुक्तानी सम्पन्न भयो', 'Patronage Refund Disbursed')}
                </span>
                <h4 className="text-base font-bold text-on-surface">
                  {claimMode === 'SAVINGS'
                    ? t(`रकम रु. ${distribution.netPatronageRefund.toLocaleString()} पासबुकमा सफलतापूर्वक जम्मा भयो।`, `NPR ${distribution.netPatronageRefund.toLocaleString()} successfully credited to your passbook.`)
                    : t(`रकमबाट ${eligibleKitta} कित्ता सेयर सफलतापूर्वक जारी भयो।`, `${eligibleKitta} new shares successfully issued to your share folio.`)}
                </h4>
              </div>
            </div>

            <button
              onClick={() => handlePrint('a4')}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>{t('पुर्जी निकाल्नुहोस्', 'Get Receipt')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden printable A4 / Thermal Warrant Slip */}
      <div id="patronage-warrant-printable" className="hidden print:block" data-printable="true">
        <div className="p-8 max-w-[210mm] mx-auto bg-white text-black font-sans border-2 border-emerald-900 rounded-xl space-y-6">
          <div className="text-center border-b-2 border-emerald-900 pb-4">
            <h1 className="text-2xl font-black uppercase text-emerald-900">
              {coopSettings?.name || 'उनाको सामाजिक बचत तथा ऋण सहकारी संस्था लिमिटेड'}
            </h1>
            <p className="text-xs font-medium text-gray-700">
              गढवा गाउँपालिका, दाङ, लुम्बिनी प्रदेश | दर्ता नं: २०२/०६५/०६६ | पान: ३००१२४८९०
            </p>
            <h2 className="text-lg font-bold text-emerald-800 mt-2 uppercase tracking-wide">
              संरक्षित पूँजी फिर्ता पुर्जी (Patronage Refund Warrant)
            </h2>
            <span className="text-xs font-bold text-gray-600">
              (सहकारी ऐन २०७४ को दफा ४१ बमोजिम आर्थिक वर्ष २०८०/०८१)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>पुर्जी नं:</strong> {distribution.warrantNumber}</p>
              <p><strong>सदस्य नं:</strong> {distribution.memberNo}</p>
              <p><strong>सदस्य नाम:</strong> {distribution.memberName}</p>
            </div>
            <div className="text-right">
              <p><strong>मिति:</strong> २०८१-०६-२५</p>
              <p><strong>खाता नं:</strong> {distribution.accountNo}</p>
              <p><strong>स्थिति:</strong> {distribution.status === 'DISBURSED' ? 'भुक्तानी सम्पन्न' : 'दाबी योग्य'}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse border border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400">
                <th className="p-2.5 border-r border-gray-400">कारोबार स्तम्भ</th>
                <th className="p-2.5 border-r border-gray-400 text-right">सदस्य वार्षिक कारोबार रकम</th>
                <th className="p-2.5 text-right">संरक्षित लाभांश हिस्सा (रु.)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="p-2.5 border-r border-gray-400">बचत खातामा आर्जित ब्याज</td>
                <td className="p-2.5 border-r border-gray-400 text-right">रु. {metric.annualSavingsInterestEarned.toLocaleString()}</td>
                <td className="p-2.5 text-right font-bold">रु. {distribution.savingsShareAmount.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="p-2.5 border-r border-gray-400">ऋण खातामा भुक्तान ब्याज</td>
                <td className="p-2.5 border-r border-gray-400 text-right">रु. {metric.annualLoanInterestPaid.toLocaleString()}</td>
                <td className="p-2.5 text-right font-bold">रु. {distribution.loanShareAmount.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="p-2.5 border-r border-gray-400">कृषि, भण्डारण तथा दुग्ध कारोबार</td>
                <td className="p-2.5 border-r border-gray-400 text-right">रु. {metric.annualDairyBusinessVolume.toLocaleString()}</td>
                <td className="p-2.5 text-right font-bold">रु. {distribution.dairyShareAmount.toLocaleString()}</td>
              </tr>
              <tr className="bg-gray-50 font-bold border-b border-gray-400">
                <td className="p-2.5 border-r border-gray-400" colSpan={2}>कुल संरक्षित पूँजी फिर्ता (Gross Patronage Refund)</td>
                <td className="p-2.5 text-right text-base text-emerald-900">रु. {distribution.grossPatronageRefund.toLocaleString()}</td>
              </tr>
              <tr className="text-xs text-gray-600 border-b border-gray-400">
                <td className="p-2 border-r border-gray-400" colSpan={2}>अग्रिम कर कट्टी (TDS/WHT ०% - कारोबार फिर्ता)</td>
                <td className="p-2 text-right">रु. ०</td>
              </tr>
              <tr className="bg-emerald-50 font-black text-base border-t-2 border-emerald-900">
                <td className="p-2.5 border-r border-gray-400" colSpan={2}>खुद भुक्तानी योग्य लाभांश रकम (Net Payable)</td>
                <td className="p-2.5 text-right text-emerald-900">रु. {distribution.netPatronageRefund.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="border-t border-gray-400 pt-2">
              <p className="font-bold">{distribution.memberName}</p>
              <p className="text-gray-600">सदस्यको हस्ताक्षर</p>
            </div>
            <div className="border-t border-gray-400 pt-2">
              <p className="font-bold">लेखा प्रमुख</p>
              <p className="text-gray-600">प्रमाणीकरण गर्ने</p>
            </div>
            <div className="border-t border-gray-400 pt-2">
              <p className="font-bold">कार्यकारी प्रमुख</p>
              <p className="text-gray-600">स्वीकृत गर्ने</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPatronageSection;
