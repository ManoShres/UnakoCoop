import React from 'react';
import { BadgeCheck, Calendar, CalendarCheck, Lock, Medal, PieChart, Shield, ShieldCheck, Users, Wallet, X } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface MudhatiBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function MudhatiBookingModal({ isOpen, onClose, onSubmit }: MudhatiBookingModalProps) {
  const { t } = useLanguageStore();

  if (!isOpen) return null;

  return (
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto" id="mudhatiConfirmModal">
          <div className="bg-surface-card w-full max-w-3xl rounded-2xl shadow-2xl border border-emerald-900/20 my-auto overflow-hidden flex flex-col">
            <div className="px-space-lg py-space-md bg-emerald-50/80 border-b border-emerald-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm flex-shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-sm text-headline-sm text-emerald-950 font-bold">
                      {t('मुद्दती निक्षेप सम्झौता पुष्टि', 'Confirm Fixed Deposit Booking')}
                    </h3>
                    <span className="sm:inline-flex items-center gap-1 text-[11px] bg-brand-accent-light text-primary px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/60">
                      <BadgeCheck className="w-3.5 h-3.5 text-status-success" />
                      CBS Synchronized
                    </span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                    Fixed Deposit Booking Confirmation • Regulated under Nepal Cooperative Act 2074
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer" title={t('बन्द गर्नुहोस्', 'Close')}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-space-lg space-y-space-md overflow-y-auto max-h-[75vh]">
              <div className="bg-surface-container-low rounded-xl p-space-md border border-emerald-800/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">
                      {t('मुद्दती साँवा रकम', 'Principal Deposit Amount')}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-headline-md text-headline-md text-primary font-bold">NPR</span>
                      <span className="font-display-stat text-display-stat font-extrabold text-on-surface tracking-tight leading-none">
                        1,00,000.00
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-900 font-medium mt-1 block">
                      {t('अक्षरेपी: एक लाख रुपैयाँ मात्र', 'In Words: One Hundred Thousand Rupees Only')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-end gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold flex items-center gap-1.5 shadow-xs">
                    <Medal className="w-4 h-4" />
                    {t('१०.०% p.a. वार्षिक निश्चित दर', '10.0% p.a. Fixed Rate')}
                  </span>
                  <span className="text-xs font-semibold text-on-surface flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {t('अवधि: २ वर्ष (२४ महिना)', 'Tenor: 2 Years (24 Months)')}
                  </span>
                  <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                    <CalendarCheck className="w-3.5 h-3.5 text-status-success" />
                    {t('परिपक्वता: २०८३ फागुन २६', 'Maturity: 10 Mar 2027')}
                  </span>
                </div>
              </div>

              <div className="border border-outline-variant/30 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-surface-container-high px-space-md py-2 flex items-center justify-between border-b border-outline-variant/30">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-primary" />
                    {t('वित्तीय प्रतिफल तथा भुक्तानी विवरण', 'Financial Yield & Returns')}
                  </span>
                  <span className="text-[11px] font-tabular-mono text-primary font-bold">CERT-FD-PROP-2081</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-emerald-100/60 bg-surface-card text-xs sm:text-sm">
                  <div className="p-space-md space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">{t('ब्याज भुक्तानी तालिका:', 'Payout Schedule:')}</span>
                      <span className="font-bold text-on-surface">{t('त्रैमासिक भुक्तानी', 'Quarterly Payout')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">{t('त्रैमासिक प्राप्त ब्याज:', 'Quarterly Interest:')}</span>
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">NPR 2,500.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">{t('कुल आर्जित ब्याज:', 'Total Interest:')}</span>
                      <span className="font-bold text-on-surface">NPR 20,000.00</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-emerald-100/60">
                      <span className="font-semibold text-emerald-950">{t('परिपक्वतामा कुल भुक्तानी:', 'Total at Maturity:')}</span>
                      <span className="font-bold text-status-success font-headline-sm">NPR 1,20,000.00</span>
                    </div>
                  </div>
                  <div className="p-space-md space-y-2.5 bg-surface-container-low/30">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">{t('कर कट्टी:', 'Tax Deduction (TDS):')}</span>
                      <span className="font-medium text-on-surface">{t('५% अग्रिम कर', '5% Advance Tax')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">{t('तत्काल कर्जा सुविधा:', 'Instant Credit Line:')}</span>
                      <span className="font-bold text-primary">{t('९०% सम्म (रु. ९०,०००)', 'Up to 90% (NPR 90,000)')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">{t('कर्जा ब्याजदर अधिशेष:', 'Loan Interest Spread:')}</span>
                      <span className="font-medium text-on-surface">{t('मुद्दती दर + १.५% मात्र', 'FD Rate + 1.5% only')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-emerald-100/60">
                      <span className="text-on-surface-variant">{t('सुरक्षण स्थिति:', 'Security Status:')}</span>
                      <span className="text-status-success font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {t('संस्थागत कोष सुरक्षित', 'Institutional Fund Guaranteed')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-primary font-bold mb-1">
                    <Wallet className="w-4 h-4" />
                    <span>{t('भुक्तानीको स्रोत', 'Funding Account')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">{t('स्रोत खाता:', 'Debit Account:')}</span>
                    <span className="font-bold text-on-surface">{t('नियमित बचत खाता', 'Regular Savings')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">{t('खाता नम्बर:', 'Account No:')}</span>
                    <span className="font-tabular-mono text-on-surface">004-10294-88-01</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">{t('हालको मौज्दात:', 'Current Balance:')}</span>
                    <span className="font-tabular-mono text-on-surface">NPR १,८४,५००.००</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-outline-variant/20 font-semibold">
                    <span className="text-emerald-950">{t('कट्टी पछिको बाँकी बचत:', 'Post-Debit Balance:')}</span>
                    <span className="font-tabular-mono text-status-success font-bold">NPR ८४,५००.००</span>
                  </div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-primary font-bold mb-1">
                    <Users className="w-4 h-4" />
                    <span>{t('हकवाला तथा परिपक्वता निर्देशन', 'Nominee & Instructions')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">{t('इच्छाएको व्यक्ति:', 'Nominee:')}</span>
                    <span className="font-bold text-on-surface">{t('सुनिता कुमारी चौधरी', 'Sunita Kumari Chaudhary')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">{t('सम्बन्ध र नागरिकता:', 'Relation & ID:')}</span>
                    <span className="text-on-surface-variant">{t('श्रीमती (५२-०१-७२-०३१४५)', 'Spouse (52-01-72-03145)')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">{t('परिपक्वता निर्देशन:', 'Maturity Instruction:')}</span>
                    <span className="font-medium text-primary">{t('बचत खातामा स्वतः दाखिला', 'Auto-credit to Savings')}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-outline-variant/20">
                    <span className="text-on-surface-variant">{t('आकस्मिक फिर्ता:', 'Early Exit:')}</span>
                    <span className="text-on-surface-variant">{t('३ महिना पश्चात् नियमानुसार', 'After 3 months per bylaws')}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-emerald-800/20">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input defaultChecked={true} className="mt-0.5 h-4 w-4 rounded accent-primary text-primary focus:ring-0 cursor-pointer" id="mudhatiTermsAgree" type="checkbox"/>
                  <span className="text-xs text-on-surface leading-relaxed">
                    {t(
                      'म उनको बचत तथा ऋण सहकारी संस्था लि. को मुद्दती निक्षेप सर्त तथा नियमहरू मन्जुर गर्दछु र उल्लिखित रकम (रु. १,००,०००) मेरो बचत खाताबाट कट्टी गरी मुद्दती प्रमाणपत्र जारी गर्न स्वीकृति दिन्छु।',
                      'I accept the Unako SACCOS Term Deposit Terms & Conditions and authorize debit of NPR 100,000 from my savings account to issue this deposit certificate.'
                    )}
                  </span>
                </label>
              </div>
            </div>

            <div className="px-space-lg py-space-md bg-surface-card border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant w-full sm:w-auto">
                <Shield className="w-4 h-4 text-status-success" />
                <span>{t('सहकारी ऐन २०७४ अन्तर्गत निक्षेप सुरक्षण कोषबाट १००% सुरक्षित', '100% Protected under Cooperative Act 2074 Deposit Security')}</span>
              </div>
              <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                <button onClick={onClose} className="px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs sm:text-sm transition-colors cursor-pointer w-1/3 sm:w-auto text-center" type="button">
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  onClick={onSubmit}
                  className="px-space-lg py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer w-2/3 sm:w-auto"
                  id="btnConfirmMudhatiBooking"
                  type="button"
                >
                  <BadgeCheck className="w-4.5 h-4.5" />
                  <span>{t('मुद्दती निक्षेप पुष्टि गर्नुहोस् (रु. १,००,०००)', 'Confirm Mudhati Booking (NPR 100,000)')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
