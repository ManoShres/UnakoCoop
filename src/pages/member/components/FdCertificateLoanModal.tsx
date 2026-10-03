import React from 'react';
import { BadgeCheck, Banknote, Landmark, Printer, QrCode, ShieldCheck, X, Zap } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { printElement } from '../../../utils/printHelper';

interface FdCertificateLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FdCertificateLoanModal({ isOpen, onClose }: FdCertificateLoanModalProps) {
  const { t } = useLanguageStore();

  if (!isOpen) return null;

  return (
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/70 backdrop-blur-sm p-space-md overflow-y-auto" id="fdCertificateLoanModal">
          <div className="bg-surface-card w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border-2 border-primary/20">
            <div className="bg-surface-dark text-surface-canvas p-space-md flex items-center justify-between border-b border-primary/30 print:hidden">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-brand-accent-lime">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-sm text-headline-sm font-bold text-surface-canvas">
                      {t('मुद्दती निक्षेप प्रमाणपत्र तथा कर्जा सुविधा', 'Term Deposit Certificate & Credit Line')}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-brand-accent-light text-status-success font-label-sm text-xs font-bold">
                      CBS Verified
                    </span>
                  </div>
                  <p className="font-label-sm text-label-sm text-surface-variant">
                    Fixed Deposit Certificate of Deposit &amp; 90% Credit Line
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-full text-surface-variant hover:text-surface-canvas hover:bg-surface-dark-card transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-surface-container-low px-space-md pt-space-xs border-b border-surface-container flex items-center gap-2 print:hidden">
              <button className="px-space-md py-2.5 font-label-md text-label-md font-bold text-primary border-b-2 border-primary flex items-center gap-1.5 bg-surface-card rounded-t-lg cursor-pointer">
                <BadgeCheck className="w-4.5 h-4.5" />
                <span>{t('मुद्दती प्रमाणपत्र', 'E-Certificate View')}</span>
              </button>
              <button
                onClick={() => alert(t("तत्काल ९०% कर्जा आवेदन फारम खुल्दैछ...", "Opening 90% Instant Loan Form..."))}
                className="px-space-md py-2.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-4.5 h-4.5" />
                <span>{t('९०% तत्काल ऋण लिनुहोस्', 'Avail 90% Instant Loan')}</span>
              </button>
            </div>

            <div className="p-space-lg overflow-y-auto max-h-[72vh] space-y-space-md bg-surface-canvas">
              <div id="fd-certificate-document" data-printable="certificate" className="bg-[#FBFDF9] p-space-lg rounded-xl border-4 border-double border-primary/40 shadow-sm relative print:border-4">
                <div className="flex items-start justify-between border-b-2 border-primary/20 pb-space-sm mb-space-md">
                  <div className="flex items-center gap-space-sm">
                    <img alt="Unako SACCOS Logo" className="h-12 w-auto object-contain" src="/unako-logo.png" />
                    <div>
                      <h2 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
                        उनको बचत तथा ऋण सहकारी संस्था लिमिटेड
                      </h2>
                      <p className="font-label-sm text-xs text-on-surface-variant font-semibold">
                        Unako Savings and Credit Co-operative Society Ltd.
                      </p>
                      <p className="font-label-sm text-xs text-on-surface-variant">
                        गढवा-५, चैनपुर, देउखुरी, दाङ • दर्ता नं: २०७०-०१ (सहकारी विभाग)
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="w-16 h-16 border-2 border-primary/30 rounded-lg p-1 bg-surface-card flex flex-col items-center justify-center">
                      <QrCode className="w-5 h-5 text-primary" />
                      <span className="text-[9px] font-tabular-mono text-on-surface-variant font-bold">SCAN VERIFY</span>
                    </div>
                    <span className="text-[11px] font-tabular-mono text-primary font-bold mt-1">UKO-FD-2080-88219</span>
                  </div>
                </div>

                <div className="text-center mb-space-md">
                  <span className="inline-block px-space-md py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold uppercase tracking-wider mb-1">
                    Official Certificate of Term Deposit
                  </span>
                  <h3 className="font-headline-md text-headline-md font-extrabold text-on-surface tracking-tight">
                    {t('मुद्दती निक्षेप प्रमाणपत्र', 'Certificate of Fixed Deposit')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm text-body-sm font-body-sm mb-space-md">
                  <div className="bg-surface-card p-space-sm rounded-lg border border-primary/10">
                    <span className="text-on-surface-variant block text-xs">{t('सदस्यको नाम', 'Member Name')}:</span>
                    <span className="font-headline-sm text-[16px] font-bold text-on-surface">{t('श्री हरि प्रसाद चौधरी', 'Hari Prasad Chaudhary')}</span>
                    <span className="text-xs text-on-surface-variant block font-tabular-mono">UKO-2070-08842</span>
                  </div>
                  <div className="bg-surface-card p-space-sm rounded-lg border border-primary/10">
                    <span className="text-on-surface-variant block text-xs">{t('ठेगाना', 'Registered Address')}:</span>
                    <span className="font-bold text-on-surface">{t('गढवा-५, चैनपुर, दाङ', 'Gadhwa-5, Chainpur, Dang')}</span>
                    <span className="text-xs text-on-surface-variant block">९८४७८०००००</span>
                  </div>
                  <div className="bg-surface-card p-space-sm rounded-lg border border-primary/10 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                    <div className="flex-1">
                      <span className="text-on-surface-variant block text-xs">{t('निक्षेप मूल रकम', 'Principal Locked Deposit')}:</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-headline-sm text-primary font-bold">NPR</span>
                        <span className="font-headline-lg text-headline-lg font-extrabold text-primary">४०,३५०.००</span>
                        <span className="text-xs text-on-surface-variant ml-1">({t('रु. चालीस हजार तीन सय पचास मात्र', 'Forty Thousand Three Hundred Fifty Only')})</span>
                      </div>
                    </div>
                    <div className="bg-primary/10 px-space-sm py-1.5 rounded-lg text-right">
                      <span className="text-xs text-primary font-bold block">{t('वार्षिक ब्याजदर', 'Annual Yield')}:</span>
                      <span className="font-headline-sm font-extrabold text-primary">{t('१०.०% वार्षिक', '10.0% p.a.')}</span>
                    </div>
                  </div>
                  <div className="bg-surface-card p-space-sm rounded-lg border border-primary/10">
                    <span className="text-on-surface-variant block text-xs">{t('जम्मा मिति', 'Deposit Date')}:</span>
                    <span className="font-semibold text-on-surface">{t('२०८० असोज १५', '2023 Oct 01')}</span>
                  </div>
                  <div className="bg-surface-card p-space-sm rounded-lg border border-primary/10">
                    <span className="text-on-surface-variant block text-xs">{t('भुक्तानी मिति', 'Maturity Date')}:</span>
                    <span className="font-semibold text-on-surface">{t('२०८२ असोज १४ (२ वर्ष)', '2025 Oct 01 (2 Years)')}</span>
                  </div>
                  <div className="bg-surface-card p-space-sm rounded-lg border border-primary/10">
                    <span className="text-on-surface-variant block text-xs">{t('ब्याज भुक्तानी चक्र', 'Payout Mode')}:</span>
                    <span className="font-semibold text-primary">{t('त्रैमासिक (बचत खातामा)', 'Quarterly (To Savings A/C)')}</span>
                  </div>
                  <div className="bg-surface-card p-space-sm rounded-lg border border-primary/10">
                    <span className="text-on-surface-variant block text-xs">{t('इच्छाएको व्यक्ति', 'Nominee')}:</span>
                    <span className="font-semibold text-on-surface">{t('सुनिता कुमारी चौधरी (श्रीमती)', 'Sunita Kumari Chaudhary (Spouse)')}</span>
                  </div>
                </div>

                <div className="pt-space-md border-t-2 border-primary/20 flex items-end justify-between">
                  <div className="text-center">
                    <div className="w-28 h-10 mx-auto flex items-center justify-center font-tabular-mono text-xs text-on-surface-variant italic">[Sign]</div>
                    <div className="h-0.5 w-32 bg-on-surface-variant/40 mx-auto my-1"></div>
                    <span className="font-label-sm text-xs font-bold text-on-surface block">{t('कोषाध्यक्ष', 'Treasurer')}</span>
                  </div>
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary bg-primary/10 flex items-center justify-center text-primary text-center p-2 shadow-xs">
                    <span className="font-label-sm text-[11px] font-extrabold uppercase leading-tight">
                      उनको साकोस<br/>मुद्दती छाप<br/>OFFICIAL SEAL
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="w-28 h-10 mx-auto flex items-center justify-center font-tabular-mono text-xs text-on-surface-variant italic">[Sign]</div>
                    <div className="h-0.5 w-32 bg-on-surface-variant/40 mx-auto my-1"></div>
                    <span className="font-label-sm text-xs font-bold text-on-surface block">{t('कार्यकारी व्यवस्थापक', 'Manager')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-dark text-surface-canvas p-space-md rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md shadow-lg print:hidden">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-brand-accent-lime font-label-sm text-label-sm font-bold">
                    <Zap className="w-5 h-5" />
                    <span>{t('९०% तत्काल मुद्दती कर्जा सुविधा', '90% Instant Loan Against FD')}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-surface-variant">
                    {t(
                      'तपाईंको यस मुद्दती प्रमाणपत्र धितोमा रु. ३६,३१५ (९०%) सम्म तत्काल कर्जा उपलब्ध छ। ब्याजदर: मुद्दती दर + १.५% मात्र (वार्षिक ११.५%) | बिना धितो मूल्याङ्कन शुल्क।',
                      'Available credit up to NPR 36,315 (90%) against this FD at FD rate + 1.5% (11.5% p.a.) with zero appraisal fees.'
                    )}
                  </p>
                </div>
                <button
                  onClick={() => alert(t("तत्काल कर्जा आवेदन स्वीकार भयो!", "Instant Loan Application Initiated!"))}
                  className="px-space-md py-2.5 rounded-xl bg-brand-accent-lime hover:bg-status-success text-surface-dark font-bold font-label-md text-label-md whitespace-nowrap flex items-center gap-1.5 shadow-md transition-all flex-shrink-0 cursor-pointer"
                >
                  <Banknote className="w-4.5 h-4.5" />
                  <span>{t('तत्काल कर्जा निकाल्नुहोस्', 'Avail Instant Loan')}</span>
                </button>
              </div>
            </div>

            <div className="p-space-md bg-surface-card border-t border-surface-container flex flex-wrap items-center justify-between gap-space-sm print:hidden">
              <div className="flex items-center gap-space-xs text-xs text-on-surface-variant">
                <ShieldCheck className="w-4 h-4 text-status-success" />
                <span>Nepal Cooperative Act 2074 Recognized Digital Security</span>
              </div>
              <div className="flex items-center gap-space-sm">
                <button className="px-space-md py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors cursor-pointer" onClick={() => printElement('fd-certificate-document')}>
                  <Printer className="w-4.5 h-4.5" />
                  <span>{t('प्रिन्ट', 'Print')}</span>
                </button>
                <button
                  onClick={() => alert(t("प्रमाणपत्र PDF डाउनलोड हुँदैछ...", "Downloading Certificate PDF..."))}
                  className="px-space-md py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold font-label-md text-label-md flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span>{t('प्रमाणपत्र डाउनलोड PDF', 'Download PDF')}</span>
                </button>
                <button onClick={onClose} className="px-space-md py-2 rounded-xl bg-surface-card border border-outline-variant hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md transition-colors cursor-pointer">
                  <span>{t('बन्द गर्नुहोस्', 'Close')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
