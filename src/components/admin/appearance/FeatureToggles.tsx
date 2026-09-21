import React from 'react';
import { useDesignStore } from '../../../store/useDesignStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { FeatureFlags } from '../../../types';
import {
  Vote,
  QrCode,
  LifeBuoy,
  BadgePercent,
  FileSpreadsheet,
  Coins,
  Send,
  MessageSquare,
  Compass,
  CheckCircle,
  XCircle,
  ToggleLeft,
} from 'lucide-react';

interface FeatureGroup {
  groupTitle: string;
  groupTitleNepali: string;
  items: {
    key: keyof FeatureFlags;
    name: string;
    nameNepali: string;
    description: string;
    descriptionNepali: string;
    icon: React.ElementType;
  }[];
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    groupTitle: 'Governance & Democratic Exercise',
    groupTitleNepali: 'संस्थागत सुशासन तथा लोकतान्त्रिक अभ्यास',
    items: [
      {
        key: 'enableEBallot',
        name: 'E-Ballot & Cryptographic Voting',
        nameNepali: 'विद्युतीय गोप्य मतदान (ई-मतपत्र)',
        description: 'Enables members to cast secure end-to-end encrypted votes during cooperative elections.',
        descriptionNepali: 'सहकारी निर्वाचनमा सदस्यहरूलाई गोप्य र इन्क्रिप्टेड डिजिटल मतदान गर्न दिने सुविधा।',
        icon: Vote,
      },
      {
        key: 'enableAgmPass',
        name: 'AGM Digital Entry Pass & QR Token',
        nameNepali: 'साधारण सभा डिजिटल प्रवेश पास तथा QR',
        description: 'Provides digital entry vouchers, meal coupons, and attendance QR tokens for the AGM.',
        descriptionNepali: 'वार्षिक साधारण सभाको लागि डिजिटल प्रवेश पास, खाजा कुपन र गेट स्क्यानर टोकन।',
        icon: QrCode,
      },
      {
        key: 'enableGrievance',
        name: 'Member Grievance & Helpdesk Tracker',
        nameNepali: 'सदस्य गुनासो तथा सुनुवाइ ट्र्याकर',
        description: 'Permits members to submit formal complaints, ticket queries, and track officer SLAs.',
        descriptionNepali: 'सदस्यहरूले शाखा प्रबन्धक वा ऋण समितिलाई सिधा गुनासो पठाउन र स्थिति हेर्न सक्ने।',
        icon: LifeBuoy,
      },
    ],
  },
  {
    groupTitle: 'Financial Operations & Transactions',
    groupTitleNepali: 'वित्तीय कारोबार तथा सदस्य सेवाहरू',
    items: [
      {
        key: 'enableDividendClaim',
        name: 'Online Dividend Claim & Statement',
        nameNepali: 'अनलाइन लाभांश दाबी तथा हिसाब',
        description: 'Allows members to review dividend distributions and withdraw to savings accounts.',
        descriptionNepali: 'वार्षिक सेयर लाभांश रकम हेर्न र सिधै बचत खातामा स्थानान्तरण गर्न दिने।',
        icon: BadgePercent,
      },
      {
        key: 'enableLoanApplication',
        name: 'Online Loan Application & Calculator',
        nameNepali: 'अनलाइन कर्जा आवेदन तथा ईएमआई क्याल्कुलेटर',
        description: 'Permits members to apply for business, agro, and emergency loans with document upload.',
        descriptionNepali: 'सदस्यहरूले घरमै बसेर कागजात सहित अनलाइन कर्जा आवेदन दिन सक्ने सुविधा।',
        icon: FileSpreadsheet,
      },
      {
        key: 'enableSharePurchase',
        name: 'Share Capital Online Top-Up',
        nameNepali: 'सेयर पुँजी अनलाइन खरिद तथा थप',
        description: 'Enables active members to purchase additional shares and expand cooperative equity.',
        descriptionNepali: 'सदस्यहरूले आफ्नो सेयर हिस्सा बढाउन अनलाइन भुक्तानी गरी सेयर कित्ता थप्न सक्ने।',
        icon: Coins,
      },
      {
        key: 'enableSavingsTransfer',
        name: 'Internal Savings Account Transfers',
        nameNepali: 'आन्तरिक बचत खाता रकमान्तर',
        description: 'Enables peer-to-peer transfers between cooperative member passbooks and loans.',
        descriptionNepali: 'सहकारीका बचत खाताहरू बीच र किस्ता भुक्तानीको लागि आन्तरिक रकम स्थानान्तरण।',
        icon: Send,
      },
    ],
  },
  {
    groupTitle: 'Assistance & User Experience',
    groupTitleNepali: 'सहायता तथा प्रयोगकर्ता अनुभव',
    items: [
      {
        key: 'enableSupportChat',
        name: 'Floating AI & Helpdesk Chat Assistant',
        nameNepali: 'सहकारी च्याट तथा एआई सहायक',
        description: 'Displays the bottom-right interactive support chat widget for instant guidance.',
        descriptionNepali: 'स्क्रिनको तल्लो दायाँ भागमा देखिने २४/७ प्रत्यक्ष सोधपुछ च्याट सहायक पपअप।',
        icon: MessageSquare,
      },
      {
        key: 'enableSystemTour',
        name: 'Interactive System Walkthrough Tour',
        nameNepali: 'अन्तरक्रियात्मक प्रणाली प्रयोग गाइड',
        description: 'Launches guided onboarding tours for new members explaining all portal tabs.',
        descriptionNepali: 'नयाँ सदस्यहरूलाई पोर्टलका सम्पूर्ण सेवाहरू बुझाउने अन्तरक्रियात्मक टुर गाइड।',
        icon: Compass,
      },
    ],
  },
];

export const FeatureToggles: React.FC = () => {
  const { settings, toggleFeature } = useDesignStore();
  const { lang, t } = useLanguageStore();

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ToggleLeft className="size-4 text-primary" />
          <span>{t('प्रणाली सुविधा समावेश/बहिष्कार नियन्त्रण (Feature Switches)', 'Feature Inclusion & Exclusion Controls')}</span>
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t(
            'कुन–कुन खण्ड वा सुविधाहरू सदस्य पोर्टलमा देखाउने वा लुकाउने भन्ने निर्णय गर्नुहोस्। बन्द गरिएका सुविधाहरू मेनु र पृष्ठहरूबाट तुरुन्तै हटाइनेछन्।',
            'Toggle which member modules are visible or hidden. Disabled features are instantly hidden from navigation and routes.'
          )}
        </p>
      </div>

      <div className="space-y-6">
        {FEATURE_GROUPS.map((group, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
          >
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              {lang === 'ne' ? group.groupTitleNepali : group.groupTitle}
            </h5>

            <div className="space-y-2.5 pt-1">
              {group.items.map((item) => {
                const isEnabled = settings.features[item.key];
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.key}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                      isEnabled
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                        : 'border-slate-100 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-900/30 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`size-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isEnabled
                            ? 'bg-primary/10 text-primary'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        <IconComponent className="size-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {lang === 'ne' ? item.nameNepali : item.name}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                              isEnabled
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {isEnabled ? (
                              <>
                                <CheckCircle className="size-3" />
                                <span>{t('सक्रिय', 'Included')}</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="size-3" />
                                <span>{t('बहिष्कार', 'Excluded')}</span>
                              </>
                            )}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {lang === 'ne' ? item.descriptionNepali : item.description}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      onClick={() => toggleFeature(item.key)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        isEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
