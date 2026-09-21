import React from 'react';
import { Landmark, Shield, Users, Award } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';

export const AboutPage: React.FC = () => {
  const { t } = useLanguageStore();
  const { coopSettings } = useCoopStore();

  const directors = [
    {
      name: t('पुष्पराज शर्मा', 'Puspa Raj Sharma'),
      role: t('सञ्चालक समिति अध्यक्ष', 'Chairman of the Board'),
      experience: t('सहकारी लघुवित्त र कृषि समुदाय विकासमा २४+ वर्षको अनुभव।', '24+ years in cooperative microfinance and agrarian community development.'),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
    {
      name: t('राधिका सुवेदी कार्की', 'Radhika Subedi Karki'),
      role: t('उपाध्यक्ष तथा महिला सशक्तीकरण प्रमुख', 'Vice Chairperson & Women Wing Lead'),
      experience: t('सामुदायिक बचत समूह र महिला सीप विकास तालिमको नेतृत्व।', 'Leading community savings groups and grassroots vocational training.'),
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
    {
      name: t('धर्मेन्द्र बहादुर केसी', 'Dharmendra Bahadur KC'),
      role: t('प्रबन्ध निर्देशक तथा ऋण उपसमिति संयोजक', 'Managing Director & Credit Committee Head'),
      experience: t('ग्रामीण उद्यम कर्जा मूल्याङ्कन र जोखिम व्यवस्थापनमा विज्ञता।', 'Former banking risk officer specializing in rural enterprise credit evaluation.'),
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },
    {
      name: t('सुशीला तामाङ', 'Sushila Tamang'),
      role: t('कोषाध्यक्ष तथा लेखा सुपरीवेक्षण समिति', 'Treasurer & Audit Committee Secretary'),
      experience: t('सहकारी हिसाबकिताब र चार्टर्ड वित्तीय लेखापरीक्षणमा दक्ष।', 'Chartered financial analyst and cooperative accounts auditor.'),
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  ];

  return (
    <div className="py-12 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-xs font-bold text-emerald-800 dark:text-[#13ec37]">
          <Award className="size-4" />
          <span>{t('स्थापना: २०६७ बि.सं. (२०१० ई.सं.)', 'Established 2067 B.S. (2010 A.D.)')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {t(`${coopSettings.nameNepali} को बारेमा`, `About ${coopSettings.name}`)}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          {t(
            'पारस्परिक स्वावलम्बन र सहकार्यको सिद्धान्तमा आधारित उनको बचत तथा ऋण सहकारी संस्था लि. दाङ उपत्यका र आसपासका विपन्न परिवार, साना किसान र उद्यमीहरूलाई स्थानीय साहु-महाजनको चर्को ब्याजबाट मुक्त गराई स्वाभिमानी आर्थिक उन्नति प्रदान गर्न समर्पित छ।',
            'Founded on the timeless principle of mutual self-reliance (Swabalamban), Unako Cooperative was built by community members to free families from exploitative local lenders and foster collective financial dignity.'
          )}
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#13ec37] flex items-center justify-center">
            <Landmark className="size-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('हाम्रो मुख्य उद्देश्य', 'Our Mission')}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t(
              'हरेक सदस्य परिवारलाई सुरक्षित, प्रतिस्पर्धी ब्याजदरको बचत र सहुलियतपूर्ण कृषि/उद्यम कर्जा प्रदान गरी दिगो आर्थिक आत्मनिर्भरता निर्माण गर्नु हाम्रो मुख्य ध्येय हो।',
              'To provide safe, accessible, and dignified financial inclusion for every family, farmer, and micro-entrepreneur through competitive savings rates, compassionate credit, and financial literacy.'
            )}
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="size-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="size-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('लोकतान्त्रिक स्वामित्व', 'Democratic Ownership')}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t(
              'शेयर संख्या जति भए पनि हरेक सदस्यलाई बराबर १ भोटको मताधिकार हुन्छ। नीतिगत निर्णय, ब्याजदर र लाभांश वितरण वार्षिक साधारण सभा (AGM) मा लोकतान्त्रिक तवरले तय गरिन्छ।',
              'Every member holds equal voting weight regardless of share volume. Key operational policies, interest rate ceilings, and dividend disbursements are decided democratically at our Annual General Meeting.'
            )}
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="size-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Shield className="size-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('सुरक्षा र कानूनी नियमन', 'Security & Regulation')}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t(
              'नेपाल सरकार सहकारी विभागमा विधिवत दर्ता (दर्ता नं: १२९०/०६७/६८) भई सहकारी ऐन २०७४ र सम्पत्ति शुद्धीकरण निवारण निर्देशिकाको पूर्ण परिपालनाका साथ सञ्चालित।',
              'Fully registered under the Department of Cooperatives, Government of Nepal (Reg: 1290/067/68), strictly adhering to Cooperative Act 2074 standards and Anti-Money Laundering directives.'
            )}
          </p>
        </div>
      </div>

      {/* Leadership Team */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t('सञ्चालक समिति तथा सुशासन नेतृत्व', 'Board of Directors & Governance')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('सदस्यहरूद्वारा लोकतान्त्रिक रूपमा निर्वाचित नेतृत्व मण्डल।', 'Elected by member representatives to uphold fiduciary integrity and community service.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {directors.map((dir, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl text-center space-y-4 hover:border-emerald-500/50 transition-all border border-slate-200 dark:border-slate-800">
              <img
                src={dir.avatar}
                alt={dir.name}
                className="size-20 rounded-full mx-auto object-cover ring-4 ring-emerald-500/20"
              />
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">{dir.name}</h4>
                <p className="text-xs font-semibold text-emerald-600 dark:text-[#13ec37]">{dir.role}</p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {dir.experience}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
