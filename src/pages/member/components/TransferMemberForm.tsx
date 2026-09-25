import React from 'react';
import {
  Send,
  ShieldCheck,
  Building2,
  Lock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { VerifiedMember } from './TransferTypes';

interface TransferMemberFormProps {
  memberId: string;
  setMemberId: (id: string) => void;
  verifiedMember: VerifiedMember | null;
  setVerifiedMember: (member: VerifiedMember | null) => void;
  acctType: 'savings' | 'share';
  setAcctType: (type: 'savings' | 'share') => void;
  amount: string;
  setAmount: (amt: string) => void;
  purpose: string;
  setPurpose: (p: string) => void;
  onReview: () => void;
  sourceAccountNo?: string;
  sourceBalance?: number;
}

export const TransferMemberForm: React.FC<TransferMemberFormProps> = ({
  memberId,
  setMemberId,
  verifiedMember,
  setVerifiedMember,
  acctType,
  setAcctType,
  amount,
  setAmount,
  purpose,
  setPurpose,
  onReview,
  sourceAccountNo = 'SAV-001-88219',
  sourceBalance = 285600,
}) => {
  const { t, fmtCurrency } = useLanguageStore();

  return (
    <div className="bg-surface-card rounded-2xl shadow-sm border border-outline-variant/15 overflow-hidden flex flex-col justify-between h-full">
      <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-low/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-headline text-title-md font-bold text-on-surface">
              {t('सदस्य खातामा रकम स्थानान्तरण', 'Member Account Transfer')}
            </h2>
            <p className="font-label-sm text-xs text-on-surface-variant">
              {t('सहकारी सदस्यहरूबीच तत्काल लेजर स्थानान्तरण', 'Instant Direct Ledger Transfer Between Members')}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-success/10 text-status-success font-bold text-xs">
          <Sparkles className="w-3.5 h-3.5" /> 0% Surcharge
        </span>
      </div>

      <div className="p-6 space-y-4 flex-1">
        {/* Source Debit Account */}
        <div>
          <label className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
            {t('स्रोत बचत खाता', 'Debit Source Account')}
          </label>
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-label-md text-xs sm:text-sm font-bold text-on-surface">
                  Regular Member Savings - {fmtCurrency(sourceBalance, true)}.00
                </div>
                <div className="font-label-sm text-[11px] text-on-surface-variant">
                  A/C: {sourceAccountNo} · Unako Core CBS Ledger
                </div>
              </div>
            </div>
            <Lock className="w-4 h-4 text-on-surface-variant" />
          </div>
        </div>

        {/* Beneficiary Member ID Lookup */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
              {t('प्राप्तकर्ता सदस्य नं.', 'Recipient Member ID')}
            </label>
            <span className="text-[11px] text-primary font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-status-success" />
              {t('सीबीएस प्रत्यक्ष प्रमाणीकरण सक्रिय', 'CBS Live Verification Active')}
            </span>
          </div>
          <div className="relative">
            <input
              value={memberId}
              onChange={e => {
                const val = e.target.value;
                setMemberId(val);
                if (val === 'UKO-2072-04192' || val === 'UKO-2072-04419') {
                  setVerifiedMember({
                    name: 'Bhojraj Tharu',
                    grade: 'A',
                    job: 'Dairy Producer',
                    loc: 'Chainpur, Gadhwa-5',
                  });
                }
              }}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/50 focus:border-primary bg-surface-container-low text-xs sm:text-sm font-mono font-bold text-on-surface outline-none transition-colors"
              placeholder="UKO-YYYY-NNNNN"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-status-success font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-status-success" />
              {t('प्रमाणित भयो', 'Verified')}
            </span>
          </div>

          {/* Verified Member Details Card */}
          {verifiedMember && (
            <div className="mt-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {verifiedMember.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-headline text-xs font-bold text-on-surface flex items-center gap-1.5">
                    {verifiedMember.name}
                    <span className="px-1.5 py-0.5 rounded bg-status-success/15 text-status-success text-[10px] font-bold">
                      {t('सक्रिय सदस्य', 'Good Standing')}
                    </span>
                  </div>
                  <div className="font-label-sm text-[11px] text-on-surface-variant">
                    {verifiedMember.loc} · {verifiedMember.job} · {t('पहिलो तह सदस्य', 'Tier-1 Member')}
                  </div>
                </div>
              </div>
              <span className="font-label-sm text-[11px] text-primary font-bold shrink-0 bg-primary/10 px-2 py-0.5 rounded-full">
                {t('संस्था प्रमाणित', 'UKO Verified')}
              </span>
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
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                acctType === 'savings' ? 'border-primary bg-primary/5 shadow-xs' : 'border-outline-variant/30 hover:border-outline-variant/60'
              }`}
            >
              <input
                type="radio"
                name="acct-type"
                checked={acctType === 'savings'}
                onChange={() => setAcctType('savings')}
                className="accent-primary"
              />
              <div>
                <div className="font-label-md text-xs font-bold text-on-surface">{t('बचत खाता', 'Savings Account')}</div>
                <div className="font-label-sm text-[10px] text-on-surface-variant">{t('मुख्य सदस्य पासबुक', 'Primary Member Passbook')}</div>
              </div>
            </label>
            <label
              onClick={() => setAcctType('share')}
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                acctType === 'share' ? 'border-primary bg-primary/5 shadow-xs' : 'border-outline-variant/30 hover:border-outline-variant/60'
              }`}
            >
              <input
                type="radio"
                name="acct-type"
                checked={acctType === 'share'}
                onChange={() => setAcctType('share')}
                className="accent-primary"
              />
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
              {t('स्थानान्तरण रकम', 'Transfer Amount')}
            </label>
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              {t('प्रति कारोबार सीमा: रु. १,००,०००', 'Limit per txn: NPR 100,000')}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
            <div className="font-display-stat text-xl font-bold font-headline text-on-surface tabular-nums">
              {fmtCurrency(parseInt(amount || '0'), true)}
            </div>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-28 px-2.5 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-card text-right font-mono font-bold text-xs outline-none focus:border-primary"
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
                  amount === a ? 'bg-primary text-white border-primary shadow-xs' : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                }`}
                type="button"
              >
                +{fmtCurrency(parseInt(a), true)}
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
            className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-xs sm:text-sm text-on-surface outline-none focus:border-primary"
            placeholder={t('जस्तै: तोरीको बीउ खरिद, दूध संकलन भुक्तानी', 'e.g. Purchase of organic seeds, dairy supply')}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 pt-0 space-y-3">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface-variant">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            {t(
              'शून्य शुल्कमा तत्काल सीबीएस लेजर दाखिला। पासबुक र एसएमएस सूचना तुरुन्तै पठाइन्छ।',
              'Instant CBS ledger clearing with zero charges. Passbook and SMS alerts dispatch instantaneously.'
            )}
          </div>
        </div>

        <button
          onClick={onReview}
          className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          type="button"
        >
          <span>{t('रकम स्थानान्तरण अघि बढाउनुहोस्', 'Review & Confirm Transfer')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
