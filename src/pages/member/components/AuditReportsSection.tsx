import React from 'react';
import { ArrowRight, BarChart3, Download, Scale, Wallet } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

export function AuditReportsSection() {
  const { t } = useLanguageStore();

  return (
    <div className="space-y-space-md">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
            {t('पारदर्शिता र सुशासन', 'Transparency & Governance')}
          </span>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
            {t('संस्थागत पारदर्शिता तथा प्रतिवेदनहरू', 'Institutional Transparency & Audit Reports')}
          </h3>
        </div>
        <a
          className="hidden sm:flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:underline"
          href="javascript:void(0)"
          onClick={() => alert(t("१२औं साधारण सभाको पूर्ण कार्यसूची तयार हुँदैछ...", "AGM agenda and policy documentation in preparation..."))}
        >
          <span>{t('सबै वित्तीय प्रतिवेदन हेर्नुहोस्', 'View All Financial Reports')}</span>
          <ArrowRight className="w-4.5 h-4.5" />
        </a>
      </div>

      {/* Publications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
        {/* Report 1 */}
        <div className="bg-surface-card rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-brand-accent-light text-primary flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="bg-surface-container text-on-surface font-tabular-mono text-xs px-2.5 py-1 rounded-full font-bold">
                PDF (4.8 MB)
              </span>
            </div>
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-md group-hover:text-primary transition-colors">
              {t('आर्थिक वर्ष २०८०/८१ वार्षिक वैधानिक लेखापरीक्षण प्रतिवेदन', 'FY 2080/81 Annual Statutory Audit Report')}
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {t('भोजराज एण्ड एसोसिएट्स द्वारा सम्पादित स्वतन्त्र लेखापरीक्षण प्रतिवेदन।', 'Independent statutory audit report conducted by Bhojraj & Associates Chartered Accountants.')}
            </p>
            <div className="mt-space-md p-space-sm bg-surface-canvas rounded-xl space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">{t('कुल सेयर पुँजी:', 'Total Share Capital:')}</span>
                <span className="font-bold text-on-surface">{t('रु. १२,४५,८०,०००/-', 'NPR 124,580,000')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">{t('कुल बचत संकलन:', 'Total Savings Deposit:')}</span>
                <span className="font-bold text-on-surface">{t('रु. ८६,२१,४०,०००/-', 'NPR 862,140,000')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">{t('निष्कृय कर्जा:', 'Non-Performing Loans (NPL):')}</span>
                <span className="font-bold text-status-success">{t('१.२४% (न्यून)', '1.24% (Low)')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => alert(t("अडिट रिपोर्ट डाउनलोड हुँदैछ...", "Downloading Audit Report..."))}
            className="mt-space-md w-full bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md font-semibold py-space-sm rounded-xl transition-all flex items-center justify-center gap-space-xs"
            type="button"
          >
            <Download className="w-4.5 h-4.5" />
            <span>{t('अडिट रिपोर्ट डाउनलोड', 'Download Audit Report (PDF)')}</span>
          </button>
        </div>

        {/* Report 2 */}
        <div className="bg-surface-card rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="bg-surface-container text-on-surface font-tabular-mono text-xs px-2.5 py-1 rounded-full font-bold">
                PEARLS Q4
              </span>
            </div>
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-md group-hover:text-primary transition-colors">
              {t('पर्ल्स वित्तीय सुशासन प्रणाली तथा सूचकाङ्क', 'PEARLS Monitoring System & Financial Health')}
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {t('विश्व ऋण महासंघ र नेफ्स्कून मापदण्ड अनुसारको त्रैमासिक वित्तीय सूचक प्रतिवेदन।', 'Quarterly financial soundness report compliant with WOCCU & NEFSCUN benchmarks.')}
            </p>
            <div className="mt-space-md p-space-sm bg-surface-canvas rounded-xl space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">{t('संस्थागत पुँजी अनुपात:', 'Institutional Capital Ratio (E1):')}</span>
                <span className="font-bold text-status-success">{t('१०.८% (मापदण्ड > १०%)', '10.8% (Target > 10%)')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">{t('तरलता अनुपात:', 'Liquidity Ratio (L1):')}</span>
                <span className="font-bold text-status-success">{t('१८.४% (सुरक्षित)', '18.4% (Safe)')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">{t('कर्जा जोखिम कोष:', 'Loan Loss Provision (P1):')}</span>
                <span className="font-bold text-status-success">{t('१०५% कभरेज', '105% Coverage')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => alert(t("पर्ल्स प्रतिवेदन डाउनलोड हुँदैछ...", "Downloading PEARLS Report..."))}
            className="mt-space-md w-full bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md font-semibold py-space-sm rounded-xl transition-all flex items-center justify-center gap-space-xs"
            type="button"
          >
            <Download className="w-4.5 h-4.5" />
            <span>{t('पर्ल्स प्रतिवेदन डाउनलोड', 'Download PEARLS Report (PDF)')}</span>
          </button>
        </div>

        {/* Report 3 */}
        <div className="bg-surface-card rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low text-primary flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <span className="bg-surface-container text-on-surface font-tabular-mono text-xs px-2.5 py-1 rounded-full font-bold">
                {t('विनियम २०७०', 'By-Laws 2070')}
              </span>
            </div>
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-md group-hover:text-primary transition-colors">
              {t('सहकारी विनियम तथा आचारसंहिता', 'Cooperative By-Laws & Code of Conduct')}
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {t('उनको बचत तथा ऋण सहकारी संस्थाको मूल विनियम, सदस्य आचारसंहिता तथा कर्जा तथा बचत नीति २०८१ (परिमार्जित)।', 'Master by-laws, member code of conduct, and revised credit & savings policies 2081.')}
            </p>
            <div className="mt-space-md p-space-sm bg-surface-canvas rounded-xl space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">{t('दर्ता नम्बर:', 'Registration No.:')}</span>
                <span className="font-bold text-on-surface">{t('४२५/०७०/०७१ (दाङ)', '425/070/071 (Dang)')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">{t('कार्यक्षेत्र:', 'Operating Area:')}</span>
                <span className="font-bold text-on-surface">{t('गढवा, राजपुर, लमही', 'Gadhwa, Rajpur, Lamahi')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">{t('सञ्चालक समिति बैठक:', 'Board Meeting:')}</span>
                <span className="font-bold text-on-surface">{t('मासिक २४ गते नियमित', 'Every 24th of the Month')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => alert(t("विनियम तथा नीति संग्रह डाउनलोड हुँदैछ...", "Downloading By-Laws & Policies..."))}
            className="mt-space-md w-full bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-label-md text-label-md font-semibold py-space-sm rounded-xl transition-all flex items-center justify-center gap-space-xs"
            type="button"
          >
            <Download className="w-4.5 h-4.5" />
            <span>{t('विनियम तथा नीति संग्रह', 'Download By-Laws & Policies (PDF)')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
