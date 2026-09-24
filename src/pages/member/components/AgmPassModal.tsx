import React from 'react';
import { BadgeCheck, Banknote, CheckCircle2, Coffee, Gift, IdCard, Printer, Ticket, Wallet, X } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface AgmPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoUrl: string;
}

export function AgmPassModal({ isOpen, onClose, logoUrl }: AgmPassModalProps) {
  const { t } = useLanguageStore();

  if (!isOpen) return null;

  return (
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-surface-dark/80 backdrop-blur-sm overflow-y-auto" id="agm-pass-modal" role="dialog">
          <div className="relative w-full max-w-2xl bg-surface-card rounded-2xl shadow-xl overflow-hidden my-auto border border-outline-variant/30 flex flex-col">
            <div className="bg-gradient-to-r from-primary to-primary-container p-space-md md:p-space-lg text-on-primary flex items-start justify-between relative overflow-hidden">
              <div className="absolute -right-6 -bottom-10 opacity-15 pointer-events-none">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-space-sm z-10">
                <img alt="Unako SACCOS Logo" className="h-10 w-auto object-contain bg-surface-card p-1 rounded-lg" src={logoUrl}/>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="bg-brand-accent-lime/20 text-brand-accent-lime font-label-sm text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">{t('आधिकारिक प्रवेश पास', 'Official Entry Pass')}</span>
                    <span className="text-xs text-on-primary/80 font-tabular-mono">{t('सुरक्षित टोकन #AGM31-8842', 'Secure Token #AGM31-8842')}</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-primary mt-0.5">{t('३१औं वार्षिक साधारण सभा प्रवेश पास तथा डिजिटल टोकन', '31st AGM Digital Entry Pass & QR Token')}</h3>
                  <p className="font-body-sm text-xs text-on-primary/90">{t('आधिकारिक साधारण सभा प्रवेश पास र गेट स्क्यानर भौचर', 'Official 31st AGM Digital Entry Pass & Gate Scanner Voucher')}</p>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close modal" className="text-on-primary/80 hover:text-on-primary p-1 rounded-full hover:bg-surface-card/20 transition-colors z-10">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-space-md md:p-space-lg space-y-space-md max-h-[75vh] overflow-y-auto">
              <div className="bg-surface-canvas p-space-md rounded-xl border border-outline-variant/40 flex flex-col md:flex-row items-center justify-between gap-space-md">
                <div className="space-y-space-xs flex-1">
                  <div className="flex items-center gap-space-xs">
                    <IdCard className="w-5 h-5 text-primary" />
                    <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t('श्री हरि प्रसाद चौधरी', 'Hari Prasad Chaudhary')}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-x-space-md gap-y-1 text-xs text-on-surface-variant pt-1">
                    <p><span className="font-medium text-on-surface">{t('सदस्यता नं:', 'Member ID:')}</span> <span className="font-tabular-mono font-bold text-primary">UKO-2070-08842</span></p>
                    <p><span className="font-medium text-on-surface">{t('नागरिकता नं:', 'Citizenship No.:')}</span> <span className="font-tabular-mono">५२-०१-६८-०४२९१</span></p>
                    <p><span className="font-medium text-on-surface">{t('तोकिएको सिट/ब्लक:', 'Seat / Block:')}</span> <span className="font-bold text-on-surface">{t('टाउन हल, ब्लक "ख" (पङ्क्ति B-14)', 'Town Hall, Block "B" (Row B-14)')}</span></p>
                    <p><span className="font-medium text-on-surface">{t('मतदान अधिकार:', 'Voting Rights:')}</span> <span className="font-bold text-status-success">{t('१ मत (योग्य सेयरधनी सदस्य)', '1 Vote (Eligible Shareholder)')}</span></p>
                  </div>
                </div>
                <div className="flex flex-col items-center bg-surface-card p-space-sm rounded-xl border border-outline-variant/30 shadow-sm flex-shrink-0 text-center">
                  <div className="w-28 h-28 bg-surface-container-low rounded-lg p-1.5 flex items-center justify-center relative">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <rect fill="white" height="100" rx="6" width="100"></rect>
                      <path clipRule="evenodd" d="M10 10h30v30H10V10zm6 6h18v18H16V16zm4 4h10v10H20V20zm40-10h30v30H60V10zm6 6h18v18H66V16zm4 4h10v10H70V20zM10 60h30v30H10V60zm6 6h18v18H16V66zm4 4h10v10H20V70zm45-10h10v5H65v-5zm15 0h10v10H80V60zm-15 15h5v15h-5V75zm10 5h15v10H75V80zm-25-30h10v10H50V50zm10 0h10v10H60V50zm-10-15h10v10H50V35zm-20 5h10v10H30V40z" fill="#006b47" fillRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="font-label-sm text-[11px] font-bold text-primary mt-1">{t('प्रवेशद्वार स्क्यानर १ मा देखाउनुहोस्', 'Show at Gate Scanner 1')}</span>
                  <span className="font-tabular-mono text-[10px] text-on-surface-variant">AGM31-PASS-UKO-8842-SEC99</span>
                  <span className="text-[10px] text-status-success font-semibold mt-0.5">{t('वैध: २०८१ चैत्र २५, ०९:०० बजे', 'Valid: Apr 07, 2025, 09:00 AM')}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-sm text-label-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Ticket className="w-4 h-4" />
                    {t('संलग्न डिजिटल कुपन तथा सुविधाहरू', 'Attached Digital Coupons & Benefits')}
                  </span>
                  <span className="text-xs text-on-surface-variant">{t('सभास्थलमा स्वतः मान्य', 'Auto-valid at AGM Venue')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                  <div className="bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/30 flex flex-col justify-between space-y-1">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Coffee className="w-5 h-5" />
                      <span className="font-label-sm text-label-sm font-bold">{t('खाजा तथा दिवा भोजन', 'Refreshment & Lunch')}</span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-tight">{t('बिहानी चिया, खाजा र दिवा भोजन कुपन', 'Morning tea, snacks and buffet lunch voucher')}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-tabular-mono text-[11px] font-bold text-primary bg-surface-card px-2 py-0.5 rounded">#RN-491</span>
                      <span className="text-[11px] text-status-success font-semibold">{t('सक्रिय', 'Active')}</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/30 flex flex-col justify-between space-y-1">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Gift className="w-5 h-5" />
                      <span className="font-label-sm text-label-sm font-bold">{t('उपहार तथा झोला किट', 'Gift & Bag Kit')}</span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-tight">{t('वार्षिक प्रतिवेदन, डायरी र उपहार प्याकेज', 'Annual report booklet, diary and gift package')}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-tabular-mono text-[11px] font-bold text-primary bg-surface-card px-2 py-0.5 rounded">#GFT-884</span>
                      <span className="text-[11px] text-status-success font-semibold">{t('सक्रिय', 'Active')}</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/30 flex flex-col justify-between space-y-1">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Banknote className="w-5 h-5" />
                      <span className="font-label-sm text-label-sm font-bold">{t('बैठक यातायात भत्ता', 'Meeting Travel Allowance')}</span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-tight">{t('रु. ५०० नगद काउन्टर टोकन', 'NPR 500 cash counter token')}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-tabular-mono text-[11px] font-bold text-primary bg-surface-card px-2 py-0.5 rounded">#TRV-500</span>
                      <span className="text-[11px] text-status-success font-semibold">{t('सक्रिय', 'Active')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-brand-accent-light p-space-sm rounded-xl flex items-center gap-space-sm text-primary text-xs">
                <CheckCircle2 className="w-5 h-5 text-status-success flex-shrink-0" />
                <p><strong>{t('सुरक्षा जाँच:', 'Security Notice:')}</strong> {t('यो डिजिटल पास स्क्रिनसट वा मोबाइलमै देखाएर प्रवेश गर्न सकिनेछ। पासको दुरुपयोग कानुनतः दण्डनीय हुनेछ।', 'Present this digital pass on your mobile screen at the entrance gate.')}</p>
              </div>
            </div>
            <div className="bg-surface-canvas p-space-md flex flex-wrap items-center justify-between gap-space-sm border-t border-outline-variant/20">
              <div className="flex flex-wrap items-center gap-space-xs">
                <button onClick={() => alert(t("मोबाइल वालेटमा पास सेभ गरियो!", "Pass saved to mobile wallet!"))} className="bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold px-space-md py-space-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5">
                  <Wallet className="w-4.5 h-4.5" />
                  <span>{t('मोबाइल वालेटमा सेभ गर्नुहोस्', 'Save to Mobile Wallet')}</span>
                </button>
                <button className="bg-surface-card hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold px-space-md py-space-sm rounded-xl transition-all border border-outline-variant/40 flex items-center gap-1.5" onClick={() => window.print()}>
                  <Printer className="w-4.5 h-4.5" />
                  <span>{t('प्रवेश पास प्रिन्ट गर्नुहोस्', 'Print Entry Pass')}</span>
                </button>
              </div>
              <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-semibold px-space-md py-space-sm rounded-xl transition-all">
                {t('बन्द गर्नुहोस्', 'Close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
