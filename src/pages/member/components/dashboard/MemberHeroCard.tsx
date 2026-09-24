import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, ShieldCheck, Wifi, Sparkles, Building2 } from 'lucide-react';
import { Member } from '../../../../types';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface MemberHeroCardProps {
  member: Member;
  primaryAccountNo: string;
  totalNetWorth: number;
  regularSavings: number;
}

export function MemberHeroCard({
  member,
  primaryAccountNo,
  totalNetWorth,
  regularSavings,
}: MemberHeroCardProps) {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [copiedField, setCopiedField] = useState<'acct' | 'mem' | null>(null);

  const copyToClipboard = (text: string, field: 'acct' | 'mem') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-6 sm:p-8 text-white shadow-2xl border border-emerald-500/20 group transition-all duration-300">
      {/* Background Decorative Rings */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-emerald-500/10 blur-3xl transition-transform duration-700 group-hover:scale-110" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-1/4 size-32 rounded-full bg-amber-400/5 blur-2xl" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500/30 to-teal-400/10 border border-emerald-400/30 shadow-inner">
            <Building2 className="size-6 text-emerald-300" />
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-widest text-emerald-400/90 uppercase">
              {t('उनको बचत तथा ऋण सहकारी संस्था लि.', 'UNAKO SACCOS DIGITAL PASSBOOK')}
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
              <span>{t('गढवा मुख्य शाखा, दाङ', 'Gadhwa Central Branch, Dang')}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{t('कक्षा क-अनुमोदित', 'Grade-A Coop')}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
          <ShieldCheck className="size-3.5 text-emerald-400" />
          <span>{t('प्रधान सदस्य (KYC प्रमाणित)', 'Pradhan Sadashya (KYC Verified)')}</span>
        </div>
      </div>

      {/* Card Center: Chip & Balance */}
      <div className="relative z-10 my-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        {/* Balance Display */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              {t('कुल सदस्य सम्पत्ति (Total Net Worth)', 'Total Net Worth in Unako')}
            </span>
            <button
              type="button"
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title={balanceVisible ? t('मौज्दात लुकाउनुहोस्', 'Hide Balance') : t('मौज्दात देखाउनुहोस्', 'Show Balance')}
            >
              {balanceVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white">
              {balanceVisible ? `रु. ${fmtCurrency(totalNetWorth, false)}` : '••••••••••••'}
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
              NPR
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300 pt-1 font-mono">
            <span>
              {t('प्राथमिक साधारण बचत:', 'Primary Savings:')}{' '}
              <strong className="text-emerald-300">
                {balanceVisible ? fmtCurrency(regularSavings, true) : '••••••'}
              </strong>
            </span>
            <span>•</span>
            <span className="text-amber-300 flex items-center gap-1 font-sans">
              <Sparkles className="size-3" />
              {t('वार्षिक लाभांश दर: ~१२%', 'Est. Dividend: ~12%')}
            </span>
          </div>
        </div>

        {/* EMV Chip & Contactless Wave */}
        <div className="flex items-center gap-4 self-start md:self-end">
          {/* Gold Microchip Graphic */}
          <div className="relative w-12 h-9 rounded-lg bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 border border-amber-400/60 shadow-md overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 border border-amber-600/30 rounded-md m-0.5" />
            <div className="w-5 h-4 border-t border-b border-amber-700/40" />
            <div className="h-full w-0.5 bg-amber-700/30 absolute left-1/3" />
            <div className="h-full w-0.5 bg-amber-700/30 absolute right-1/3" />
          </div>

          {/* Contactless Waves */}
          <div className="text-white/60 -rotate-90">
            <Wifi className="size-6" />
          </div>
        </div>
      </div>

      {/* Card Footer: Member Name & Account Numbers */}
      <div className="relative z-10 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Member Name */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('सदस्यको नाम (Member Name)', 'Member Name')}
          </div>
          <div className="font-bold text-sm text-white tracking-wide uppercase mt-0.5">
            {member.name}
            {member.nameNepali && (
              <span className="text-xs font-normal text-slate-300 lowercase block capitalize">
                ({member.nameNepali})
              </span>
            )}
          </div>
        </div>

        {/* Member Number with Copy */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('सदस्य परिचयपत्र नं. (Member No.)', 'Member ID')}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono font-bold text-sm text-emerald-300">
              {fmtDigits(member.memberNo)}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(member.memberNo, 'mem')}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition"
              title={t('कपी गर्नुहोस्', 'Copy Member No')}
            >
              {copiedField === 'mem' ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            </button>
          </div>
        </div>

        {/* Primary Account Number with Copy */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('प्राथमिक बचत खाता (Primary A/C)', 'Primary Savings A/C')}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono font-bold text-sm text-white">
              {fmtDigits(primaryAccountNo)}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(primaryAccountNo, 'acct')}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition"
              title={t('खाता नं. कपी गर्नुहोस्', 'Copy Account No')}
            >
              {copiedField === 'acct' ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
