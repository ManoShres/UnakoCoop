import React from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import {
  ShieldCheck,
  X,
  Lock,
  User,
  PieChart,
  Calendar,
  BadgeCheck,
  Printer,
  Download,
} from 'lucide-react';
import { printElement } from '../../../utils/printHelper';

interface ShareCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoUrl: string;
}

export function ShareCertificateModal({ isOpen, onClose, logoUrl }: ShareCertificateModalProps) {
  const { t } = useLanguageStore();

  if (!isOpen) return null;

  return (
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto" id="shareCertModal">
          <div className="bg-surface-card w-full max-w-4xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col my-auto border border-emerald-900/20 animate-modal-in">
            {/* Modal Top Control Bar */}
            <div className="flex items-center justify-between px-space-lg py-space-sm bg-surface-container-low border-b border-outline-variant/30 print:hidden">
              <div className="flex items-center gap-space-sm">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    {t('डिजिटल सेयर दर्ता प्रमाणीकरण', 'Digital Share Registry Verification')}
                  </span>
                  <span className="sm:inline font-tabular-mono text-xs text-on-surface-variant ml-2 font-semibold">
                    CERT-UKO-2070-0419
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="sm:flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
                  {t('सीबीएस सिङ्क्रोनाइज्ड', 'CBS Synchronized')}
                </div>
                <button
                  className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
                  id="btnCloseCertModal"
                  onClick={onClose}
                  title={t('बन्द गर्नुहोस्', 'Close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Certificate Canvas Container */}
            <div className="p-4 sm:p-8 bg-slate-100 overflow-y-auto max-h-[78vh] print:p-0 print:overflow-visible">
              {/* Ornate Certificate Surface */}
              <div
                id="share-certificate-document"
                data-printable="certificate"
                className="relative bg-[#fffdf9] p-4 sm:p-7 rounded-xl shadow-md border-8 border-[#0c4a34]/15 overflow-hidden print:border-4 print:shadow-none"
              >
                {/* Decorative Guilloche/Pattern & Inner Border */}
                <div className="cert-guilloche-pattern p-4 sm:p-6 rounded-lg cert-border-double relative">
                  {/* Corner Cornerpiece Embellishments */}
                  <div className="absolute top-1 left-1 text-primary text-xs font-serif select-none pointer-events-none opacity-60">❖</div>
                  <div className="absolute top-1 right-1 text-primary text-xs font-serif select-none pointer-events-none opacity-60">❖</div>
                  <div className="absolute bottom-1 left-1 text-primary text-xs font-serif select-none pointer-events-none opacity-60">❖</div>
                  <div className="absolute bottom-1 right-1 text-primary text-xs font-serif select-none pointer-events-none opacity-60">❖</div>

                  {/* Watermark Background Logo */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.045] pointer-events-none">
                    <img alt="watermark" className="w-96 h-96 object-contain grayscale" src={logoUrl} />
                  </div>

                  {/* Header: Cooperative Identity & Registration */}
                  <div className="relative z-10 text-center pb-4 border-b border-emerald-800/20">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2">
                      <img alt="Unako SACCOS Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-sm" src={logoUrl} />
                      <div className="text-center sm:text-left">
                        <span className="text-xs font-semibold text-emerald-800 tracking-wider block uppercase">
                          {t('सहकारी ऐन तथा नियमावली अनुसार स्थापित', 'Established under Cooperative Act & Rules')}
                        </span>
                        <h2 className="text-xl sm:text-2xl md:text-[26px] font-bold text-[#005235] tracking-tight font-headline-lg">
                          {t('उनको बचत तथा ऋण सहकारी संस्था लि.', 'Unako Savings and Credit Co-operative Society Ltd.')}
                        </h2>
                        <p className="text-xs sm:text-sm font-semibold text-on-surface-variant font-label-md">
                          Unako Savings and Credit Co-operative Society Ltd.
                        </p>
                      </div>
                    </div>
                    <div className="inline-flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant mt-1 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-100">
                      <span className="font-semibold text-primary">{t('दर्ता नं. ४२१/०६४/०६९', 'Regd. No. 421/064/069')}</span>
                      <span>•</span>
                      <span>{t('कार्यक्षेत्र: गढवा गाउँपालिका, देउखुरी, दाङ', 'Work Area: Gadhwa Rural Municipality, Deukhuri, Dang')}</span>
                      <span>•</span>
                      <span className="font-tabular-mono text-emerald-900 font-bold">{t('प्यान नं: ३०२४८९१०२', 'PAN No: 302489102')}</span>
                    </div>

                    {/* Certificate Title Ribbon */}
                    <div className="mt-4 pt-1">
                      <div className="inline-block relative">
                        <span className="inline-block bg-[#006b47] text-white px-6 py-1.5 rounded-md font-headline-sm text-sm sm:text-base md:text-lg font-bold shadow-sm tracking-wide">
                          {t('सदस्यता तथा सेयर स्वामित्व प्रमाणपत्र', 'Membership & Share Ownership Certificate')}
                        </span>
                        <span className="block text-[11px] font-semibold text-emerald-900 mt-1 uppercase tracking-wider">
                          {t('सेयर स्वामित्व तथा सदस्यताको आधिकारिक प्रमाणपत्र', 'Official Certificate of Share Ownership & Membership')}
                        </span>
                      </div>
                    </div>

                    {/* Top Meta: Reg No and Barcode Hash */}
                    <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-tabular-mono bg-white/80 p-2 rounded-lg border border-emerald-900/10">
                      <div className="flex items-center gap-1.5">
                        <span className="text-on-surface-variant font-medium">{t('प्रमाणपत्र नं.:', 'Serial No:')}</span>
                        <span className="font-bold text-primary text-sm tracking-wider">CERT-UKO-2070-0419</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-950">
                        <Lock className="w-3.5 h-3.5 text-status-success" />
                        <span className="text-[11px] font-mono">CBS-SHA256: 9f8a42b10c...2081d4</span>
                      </div>
                    </div>
                  </div>

                  {/* Section: Member Dossier Information Grid */}
                  <div className="relative z-10 mt-4 p-3 sm:p-4 bg-white/90 rounded-xl border border-emerald-900/10 shadow-xs">
                    <h4 className="text-xs uppercase font-bold text-primary tracking-wider mb-2 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {t('सदस्य विवरण', 'Member Particulars')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-xs sm:text-sm">
                      <div className="bg-emerald-50/40 p-2 rounded-lg">
                        <span className="text-on-surface-variant block text-[11px]">{t('सदस्यको नाम:', 'Member Name:')}</span>
                        <span className="font-bold text-on-surface text-sm">{t('श्री हरि प्रसाद चौधरी', 'Hari Prasad Chaudhary')}</span>
                      </div>
                      <div className="bg-emerald-50/40 p-2 rounded-lg">
                        <span className="text-on-surface-variant block text-[11px]">{t('सदस्य नं.:', 'Member No.:')}</span>
                        <span className="font-bold font-tabular-mono text-primary text-sm">UKO-2070-08842</span>
                        <span className="block text-[11px] text-status-success font-semibold">{t('स्थिति: सक्रिय साधारण सदस्य', 'Status: Active Ordinary Member')}</span>
                      </div>
                      <div className="bg-emerald-50/40 p-2 rounded-lg">
                        <span className="text-on-surface-variant block text-[11px]">{t('नागरिकता नं.:', 'Citizenship No.:')}</span>
                        <span className="font-semibold text-on-surface font-tabular-mono">{t('५२-०१-६८-०४२९१ (दाङ)', '52-01-68-04291 (Dang)')}</span>
                        <span className="block text-[11px] text-on-surface-variant">{t('जारी मिति: २०६८/०३/१४', 'Issued: 2068/03/14')}</span>
                      </div>
                      <div className="bg-emerald-50/40 p-2 rounded-lg">
                        <span className="text-on-surface-variant block text-[11px]">{t('बाबु / पतिको नाम:', "Father's Name:")}</span>
                        <span className="font-semibold text-on-surface">{t('स्व. राम चरण चौधरी', 'Late Ram Charan Chaudhary')}</span>
                      </div>
                      <div className="bg-emerald-50/40 p-2 rounded-lg sm:col-span-2">
                        <span className="text-on-surface-variant block text-[11px]">{t('स्थायी ठेगाना:', 'Permanent Address:')}</span>
                        <span className="font-semibold text-on-surface">{t('गढवा गाउँपालिका वडा नं. ५, चैनपुर, देउखुरी, दाङ', 'Gadhwa-5, Chainpur, Deukhuri, Dang')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section: Certified Share Capital Allotment Breakdown Table */}
                  <div className="relative z-10 mt-4 rounded-xl border border-emerald-900/15 shadow-xs bg-white overflow-hidden">
                    <div className="bg-primary-container px-3 py-2 text-on-primary-container flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <PieChart className="w-4 h-4" />
                        {t('प्रमाणित सेयर स्वामित्व विवरण', 'Shareholding Allotment Particulars')}
                      </span>
                      <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded">{t('साधारण सेयर', 'Ordinary Shares')}</span>
                    </div>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-emerald-50/80 text-emerald-950 font-bold border-b border-emerald-100">
                        <tr>
                          <th className="p-2 sm:p-2.5">{t('जम्मा कित्ता', 'Total Shares')}</th>
                          <th className="p-2 sm:p-2.5">{t('कित्ता नम्बर दायरा', 'Share Number Range')}</th>
                          <th className="p-2 sm:p-2.5 text-right">{t('दर प्रति सेयर', 'Face Value per Share')}</th>
                          <th className="p-2 sm:p-2.5 text-right">{t('कुल सेयर पुँजी', 'Total Share Capital')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100/60 font-medium">
                        <tr className="hover:bg-emerald-50/30 transition-colors">
                          <td className="p-2.5 font-bold text-on-surface text-sm sm:text-base">
                            {t('५०० कित्ता', '500 Shares')}
                          </td>
                          <td className="p-2.5 font-tabular-mono text-primary font-semibold">
                            {t('०२४८५०१ देखि ०२४९००० सम्म', 'From 0248501 To 0249000')}
                          </td>
                          <td className="p-2.5 text-right font-tabular-mono text-on-surface font-semibold text-sm">
                            {t('रु. १००.००', 'NPR 100.00')}
                          </td>
                          <td className="p-2.5 text-right font-bold text-primary text-base sm:text-lg font-headline-sm">
                            {t('रु. ५०,०००/-', 'NPR 50,000/-')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {/* Amount In Words & Issue Date Banner */}
                    <div className="p-3 bg-emerald-50/60 border-t border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="text-on-surface-variant font-semibold">{t('अक्षरेपी:', 'In Words:')}</span>
                        <span className="font-bold text-emerald-900 ml-1">{t('पचास हजार रुपैयाँ मात्र', 'Fifty Thousand Rupees Only')}</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-on-surface">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{t('जारी मिति:', 'Issue Date:')}</span>
                        <span className="text-primary font-tabular-mono">{t('२०७० वैशाख १२', '2013 April 25 (2070 Baisakh 12)')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section: Signatures & Official Co-op Golden-Green Stamp Seal */}
                  <div className="relative z-10 mt-6 pt-2 grid grid-cols-3 gap-2 sm:gap-4 items-end text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-10 flex items-center justify-center italic text-xs font-serif text-slate-500 select-none">
                        Bhojraj Tharu
                      </div>
                      <div className="w-full max-w-[140px] h-[1.5px] bg-emerald-950/40 mb-1"></div>
                      <span className="text-[11px] sm:text-xs font-bold text-on-surface leading-tight">{t('भोजराज थारु', 'Bhojraj Tharu')}</span>
                      <span className="text-[10px] text-on-surface-variant block">{t('व्यवस्थापक / शाखा प्रमुख', 'Branch Manager')}</span>
                    </div>

                    <div className="flex flex-col items-center justify-center relative">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-emerald-800/80 p-1 flex items-center justify-center bg-emerald-50/40 shadow-inner relative group">
                        <div className="w-full h-full rounded-full border border-dashed border-emerald-700/60 flex flex-col items-center justify-center text-center p-1 text-emerald-900">
                          <span className="text-[9px] font-extrabold tracking-tighter uppercase leading-none">{t('उनको साकोस', 'UNAKO SACCOS')}</span>
                          <img alt="Seal Logo" className="h-7 w-7 object-contain my-0.5" src="/unako-logo.png"/>
                          <span className="text-[8px] font-extrabold uppercase tracking-tight text-emerald-800">{t('आधिकारिक छाप', 'OFFICIAL SEAL')}</span>
                          <span className="text-[8px] font-semibold text-emerald-700">{t('देउखुरी दाङ', 'Deukhuri Dang')}</span>
                        </div>
                        <div className="absolute -top-1 right-2 bg-emerald-700 text-white rounded-full p-0.5 text-[10px]" title="Cryptographically Verified">
                          <BadgeCheck className="w-3 h-3 block" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="h-10 flex items-center justify-center italic text-xs font-serif text-slate-500 select-none">
                        Ram Bahadur Tharu
                      </div>
                      <div className="w-full max-w-[140px] h-[1.5px] bg-emerald-950/40 mb-1"></div>
                      <span className="text-[11px] sm:text-xs font-bold text-on-surface leading-tight">{t('राम बहादुर थारु', 'Ram Bahadur Tharu')}</span>
                      <span className="text-[10px] text-on-surface-variant block">{t('संस्था अध्यक्ष', 'President')}</span>
                    </div>
                  </div>

                  {/* Statutory Note Footnote */}
                  <div className="relative z-10 mt-5 pt-3 border-t border-emerald-800/20 text-[10px] sm:text-[11px] text-on-surface-variant text-center flex flex-col sm:flex-row items-center justify-between gap-1">
                    <span>{t('* यो प्रमाणपत्र सहकारी नियमावली अनुसार सदस्य बाहेक अरुलाई हस्तान्तरण गर्न पाइने छैन।', '* This certificate is non-transferable to non-members pursuant to cooperative bylaws.')}</span>
                    <span className="font-tabular-mono text-emerald-900 font-semibold">Secure Token: #9901-2070-UKO-REG</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="px-space-lg py-space-md bg-surface-card border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="inline-flex items-center gap-1 text-primary bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 font-semibold cursor-help" title="Blockchain/CBS cryptographic hash verified">
                  <ShieldCheck className="w-4 h-4 text-status-success" />
                  {t('प्रतिलिपि प्रमाणित', 'Copy Verified')}
                </span>
                <span className="md:inline text-slate-400">|</span>
                <span className="md:inline">{t('सहकारी आधिकारिक अभिलेख अनुसार मान्य', 'Valid for Official Cooperative Disclosures')}</span>
              </div>
              <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                <button
                  className="px-space-md py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  onClick={() => printElement('share-certificate-document')}
                >
                  <Printer className="w-4 h-4" />
                  <span>{t('प्रिन्ट प्रमाणपत्र', 'Print Certificate')}</span>
                </button>
                <button
                  onClick={() => alert(t("प्रमाणपत्र PDF डाउनलोड हुँदैछ...", "Downloading Certificate PDF..."))}
                  className="px-space-md py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  id="btnDownloadCertPdf"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('डाउनलोड PDF', 'Download PDF')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
