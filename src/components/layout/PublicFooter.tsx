import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Phone, Mail, MapPin, ShieldCheck, Award } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import { useDesignStore } from '../../store/useDesignStore';

export const PublicFooter: React.FC = () => {
  const { t } = useLanguageStore();
  const { coopSettings } = useCoopStore();
  const customLogoUrl = useDesignStore((s) => s.settings.customLogoUrl);
  const logoUrl = customLogoUrl || '/unako-logo.png';

  return (
    <footer className="bg-[#08140a] text-slate-300 border-t border-emerald-950 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt={`${coopSettings.name} Logo`}
                className="h-12 w-auto object-contain shrink-0"
              />
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight block leading-tight">
                  {t(coopSettings.nameNepali, coopSettings.name)}
                </span>
                <p className="text-xs text-emerald-400 font-medium">
                  {t(coopSettings.addressNepali || coopSettings.address, coopSettings.addressEnglish || coopSettings.address)}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-6">
              {t(
                'नेपालका विपन्न परिवार, महिला उद्यमी, कृषक र स्थानीय साना व्यवसायीहरूलाई सुरक्षित बचत, सहुलियतपूर्ण कर्जा र पारदर्शी वित्तीय सेवा प्रदान गर्दै सशक्तिकरण गर्दै।',
                'Empowering grassroots families, women entrepreneurs, farmers, and local small enterprises across Nepal with secure, high-yield savings, compassionate loans, and transparent governance.'
              )}
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-400 font-semibold bg-emerald-950/40 p-3 rounded-lg border border-emerald-900/50 w-fit">
              <Award className="size-4 text-[#13ec37]" />
              <span>{t(`दर्ता नं: ${coopSettings.regNo} • सहकारी विभाग, नेपाल सरकार`, `Reg. No: ${coopSettings.regNoEnglish || coopSettings.regNo} • Department of Cooperatives, Nepal`)}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">{t('द्रुत नेभिगेसन', 'Quick Navigation')}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-[#13ec37] transition-colors">{t('गृहपृष्ठ', 'Cooperative Homepage')}</Link></li>
              <li><Link to="/about" className="hover:text-[#13ec37] transition-colors">{t('हाम्रो कथा र उद्देश्य', 'About Our Story')}</Link></li>
              <li><Link to="/reports" className="hover:text-[#13ec37] transition-colors">{t('लेखा परीक्षण तथा वित्तीय प्रतिवेदन', 'Audit & Financial Reports')}</Link></li>
              <li><Link to="/contact" className="hover:text-[#13ec37] transition-colors">{t('शाखा कार्यालय र सम्पर्क', 'Branch Locations & Contact')}</Link></li>
              <li><Link to="/apply" className="hover:text-[#13ec37] transition-colors font-bold text-emerald-400">{t('नयाँ सदस्यता आवेदन', 'Apply for Membership')}</Link></li>
              <li><Link to="/member/verification" className="hover:text-[#13ec37] transition-colors">{t('सदस्यता स्थिति प्रमाणीकरण', 'Verify Member KYC Status')}</Link></li>
            </ul>
          </div>

          {/* Member Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">{t('सहकारी सेवाहरू', 'Cooperative Schemes')}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/member/savings" className="hover:text-[#13ec37] transition-colors">{t('नियमित तथा मुद्दती बचत', 'Regular & Fixed Deposit Schemes')}</Link></li>
              <li><Link to="/member/loans" className="hover:text-[#13ec37] transition-colors">{t('कृषि तथा पशुपालन कर्जा', 'Agro & Livestock Loans')}</Link></li>
              <li><Link to="/member/apply-loan" className="hover:text-[#13ec37] transition-colors">{t('लघु व्यवसाय कर्जा', 'Small Business Credit')}</Link></li>
              <li><Link to="/member/annual-statement" className="hover:text-[#13ec37] transition-colors">{t('वार्षिक लाभांश तथा कर विवरण', 'Annual Dividend & Statements')}</Link></li>
              <li><Link to="/login" className="hover:text-[#13ec37] transition-colors font-semibold text-[#13ec37]">{t('सदस्य / कर्मचारी लगइन', 'Member / Staff Portal Login')}</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">{t('केन्द्रीय कार्यालय', 'Central Office')}</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 text-[#13ec37] shrink-0 mt-1" />
                <span>{t(coopSettings.addressNepali || coopSettings.address, coopSettings.addressEnglish || coopSettings.address)}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 text-[#13ec37] shrink-0" />
                <a href={`tel:${coopSettings.phone.split('/')[0].trim()}`} className="hover:text-white transition-colors">{t(coopSettings.phone, coopSettings.phoneEnglish || coopSettings.phone)}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-[#13ec37] shrink-0" />
                <a href={`mailto:${coopSettings.email}`} className="hover:text-white transition-colors">{coopSettings.email}</a>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-slate-500">
                <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                <span>{t('२५६-बिट एसएसएल सुरक्षित वित्तीय प्रणाली', '256-Bit SSL Encrypted Financial Core')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {t(`${coopSettings.nameNepali} सर्वाधिकार सुरक्षित।`, `${coopSettings.name} All rights reserved.`)}</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">{t('गोपनीयता नीति', 'Privacy Policy')}</span>
            <span className="hover:text-slate-400 cursor-pointer">{t('सेवाका सर्तहरू', 'Terms of Service')}</span>
            <span className="hover:text-slate-400 cursor-pointer">{t('सम्पत्ति शुद्धीकरण निवारण', 'Anti-Money Laundering (AML) Compliance')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
