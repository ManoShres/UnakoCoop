import React from 'react';
import { UserPlus, QrCode, ChevronRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { Beneficiary, BENEFICIARIES } from './TransferTypes';

interface TransferBeneficiariesSectionProps {
  onSelectBeneficiary: (b: Beneficiary) => void;
  onAddBeneficiary: () => void;
}

export const TransferBeneficiariesSection: React.FC<TransferBeneficiariesSectionProps> = ({
  onSelectBeneficiary,
  onAddBeneficiary,
}) => {
  const { t } = useLanguageStore();

  const handleScanQr = () => {
    alert('Cooperative QR Scanner activated. Align camera to NepalPay / Member QR.');
  };

  return (
    <div className="lg:col-span-5 flex flex-col justify-between gap-6">
      {/* FREQUENT BENEFICIARIES CARD */}
      <div className="bg-surface-card rounded-2xl shadow-sm border border-outline-variant/15 p-5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-headline text-title-md font-bold text-on-surface">
                {t('नियमित लाभार्थीहरू', 'Frequent Beneficiaries')}
              </h3>
              <p className="font-label-sm text-xs text-on-surface-variant">
                {t('दाङ उपत्यकाका नियमित सदस्यहरू', 'Cooperative Members (Dang Valley)')}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onAddBeneficiary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors cursor-pointer"
                type="button"
                title="Add Beneficiary"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('+ थप्नुहोस्', '+ Add New')}</span>
              </button>
              <button
                onClick={handleScanQr}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface text-xs font-bold hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
                title="Scan Member QR"
              >
                <QrCode className="w-3.5 h-3.5 text-primary" />
                <span>{t('स्क्यान', 'Scan QR')}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {BENEFICIARIES.map((b, i) => (
              <div
                key={i}
                onClick={() => onSelectBeneficiary(b)}
                className="flex items-center justify-between p-2.5 rounded-xl border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-low/70 cursor-pointer transition-all group"
                title="Click to fill transfer recipient"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    {b.id}
                  </div>
                  <div className="min-w-0">
                    <div className="font-label-md text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {b.name}
                    </div>
                    <div className="font-label-sm text-[11px] text-on-surface-variant truncate">
                      {b.no} · {b.job}
                    </div>
                    <div className="font-label-sm text-[10px] text-on-surface-variant/80">
                      {b.loc} ({b.branch})
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 pl-1">
                  <span className="text-[10px] font-bold text-status-success bg-status-success/10 px-1.5 py-0.5 rounded">
                    Tier {b.grade}
                  </span>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-outline-variant/15 flex items-center justify-between text-xs text-on-surface-variant">
          <span>{t('लाभार्थी छनोट गर्दा स्थानान्तरण विवरण स्वतः भरिन्छ', 'Clicking any beneficiary auto-populates transfer')}</span>
          <span className="text-primary font-bold">{t('३ सुरक्षित', '3 Saved')}</span>
        </div>
      </div>

      {/* ZERO-FEE COOPERATIVE TRUST & CLEARING METRIC */}
      <div className="bg-gradient-to-br from-surface-dark to-surface-dark-card rounded-2xl p-5 text-white shadow-sm border border-outline-variant/20">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-brand-accent-lime text-[10px] font-bold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t('सहकारी विश्वास सूचक', 'COOPERATIVE TRUST METRIC')}
          </span>
          <span className="text-xs text-white/70 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
            {t('सीबीएस प्रमाणित', 'CBS Verified')}
          </span>
        </div>
        <h3 className="font-headline text-base font-bold text-white mb-1">
          {t('भरोसेमन्द शून्य-शुल्क सहकारी भुक्तानी', 'Reliable Zero-Fee Cooperative Payments')}
        </h3>
        <p className="text-xs text-white/70 mb-3 leading-relaxed">
          {t(
            'उनको प्रत्यक्ष सीबीएस राफसाफ प्रणालीमा सञ्चालित छ। प्रत्येक कारोबार बिना कुनै अतिरिक्त शुल्क तत्काल सदस्यको खातामा जम्मा हुन्छ।',
            'Unako operates on dedicated direct CBS clearing rails. Every rupee sent reaches member accounts instantly with zero transaction deductions.'
          )}
        </p>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
            <div className="text-white/60 text-[10px] uppercase font-semibold">{t('इन्टर-सदस्य शुल्क', 'Inter-Member Fee')}</div>
            <div className="text-brand-accent-lime font-bold text-sm mt-0.5">{t('०% निःशुल्क', '0% Free')}</div>
            <div className="text-white/50 text-[10px]">{t('कुनै शुल्क छैन', 'Zero charges')}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
            <div className="text-white/60 text-[10px] uppercase font-semibold">{t('राफसाफ गति', 'Clearing Speed')}</div>
            <div className="text-white font-bold text-sm mt-0.5">{t('तत्काल', 'Instant')}</div>
            <div className="text-white/50 text-[10px]">{t('सीबीएस प्रत्यक्ष आरटीजीएस', 'CBS Direct RTGS')}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
            <div className="text-white/60 text-[10px] uppercase font-semibold">{t('दैनिक कारोबार सीमा', 'Daily Limit')}</div>
            <div className="text-white font-bold text-xs mt-0.5 font-mono">{t('रु. २,००,०००', 'NPR 2,00,000')}</div>
            <div className="text-white/50 text-[10px]">{t('प्रतिदिन रु. २,००,००० सम्म', 'NPR 2,00,000 / Day')}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
            <div className="text-white/60 text-[10px] uppercase font-semibold">{t('२-चरण सुरक्षा', '2-Step Security')}</div>
            <div className="text-brand-accent-lime font-bold text-sm mt-0.5">MPIN + OTP</div>
            <div className="text-white/50 text-[10px]">{t('२-चरण सुरक्षित इन्क्रिप्सन', '2-Factor Encrypted')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
