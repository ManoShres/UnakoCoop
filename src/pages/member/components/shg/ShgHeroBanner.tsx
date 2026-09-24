import React from 'react';
import { Banknote, FileDown, Network, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface ShgHeroBannerProps {
  onDownloadPdf: () => void;
  onOpenNewModal: () => void;
}

export const ShgHeroBanner: React.FC<ShgHeroBannerProps> = ({
  onDownloadPdf,
  onOpenNewModal,
}) => {
  const { t } = useLanguageStore();

  return (
    <section className="relative overflow-hidden rounded-2xl bg-surface-dark text-on-primary p-space-xl shadow-xl">
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
      <div className="absolute right-1/3 -bottom-20 w-80 h-80 rounded-full bg-secondary-container/10 blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg">
        <div className="max-w-3xl space-y-space-sm">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-primary-container/40 text-secondary-fixed">
            <Network className="w-4.5 h-4.5" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              {t('देउखुरी सामुदायिक नेटवर्क • विकेन्द्रीकृत सहकारी सञ्जाल', 'Deukhuri Community Network • Decentralized Cooperative Grid')}
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-surface font-extrabold tracking-tight">
            {t('सामुदायिक उपसमूह तथा वडा सदस्य निर्देशिका', 'Community SHG & Ward Directory')}
          </h1>
          <p className="font-body-lg text-body-lg text-surface-variant font-normal leading-relaxed">
            {t(
              'गढवा, देउखुरी उपत्यका अन्तर्गतका टोल, वडा तथा महिला स्वावलम्बी समूहहरूको एकीकृत सञ्जाल।',
              'Community Self-Help Groups (SHG) & Ward Directory — integrated grassroot cooperative network across Deukhuri Valley.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-space-md flex-wrap">
          <button
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-dark-card hover:bg-surface-dark text-surface font-label-md text-label-md transition-all shadow-md cursor-pointer"
            id="downloadPdfBtn"
            onClick={onDownloadPdf}
          >
            <FileDown className="w-5 h-5" />
            <span>{t('निर्देशिका डाउनलोड', 'Download Directory (PDF)')}</span>
          </button>
          <button
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary-container hover:bg-secondary text-on-primary font-label-md text-label-md transition-all shadow-md cursor-pointer"
            id="openNewShgModal"
            onClick={onOpenNewModal}
          >
            <UserPlus className="w-5 h-5" />
            <span>{t('नयाँ उपसमूह दर्ता आवेदन', 'Register New SHG Group')}</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Strip */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-xl pt-space-lg">
        <div className="bg-surface-dark-card/90 rounded-xl p-space-md shadow-md flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-secondary-fixed">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-label-sm text-label-sm text-surface-variant uppercase tracking-wider">{t('कुल उपसमूह', 'Total SHGs')}</p>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-display-stat text-display-stat-mobile sm:text-display-stat text-surface font-extrabold">{t('३२', '32')}</span>
              <span className="font-label-md text-label-md text-secondary-fixed">{t('सक्रिय समूहहरू', 'Active Groups')}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-dark-card/90 rounded-xl p-space-md shadow-md flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-secondary-fixed">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-label-sm text-label-sm text-surface-variant uppercase tracking-wider">{t('आवद्ध सदस्य', 'Enrolled Members')}</p>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-display-stat text-display-stat-mobile sm:text-display-stat text-surface font-extrabold">{t('१,२८०+', '1,280+')}</span>
              <span className="font-label-md text-label-md text-surface-variant">{t('शेयर सदस्य', 'Shareholders')}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-dark-card/90 rounded-xl p-space-md shadow-md flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-secondary-fixed">
            <Banknote className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-label-sm text-label-sm text-surface-variant uppercase tracking-wider">{t('मासिक सामूहिक बचत', 'Monthly Group Savings')}</p>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-headline-lg text-headline-lg text-surface font-bold">{t('रु. १२.४०', 'NPR 12.40')}</span>
              <span className="font-label-md text-label-md text-secondary-fixed">{t('लाख / महिना', 'Lakh / Month')}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-dark-card/90 rounded-xl p-space-md shadow-md flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-brand-accent-lime">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-label-sm text-label-sm text-surface-variant uppercase tracking-wider">{t('सामूहिक ऋण असुली दर', 'Group Loan Recovery Rate')}</p>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-display-stat text-display-stat-mobile sm:text-display-stat text-brand-accent-lime font-extrabold">९९.४%</span>
              <span className="font-label-sm text-label-sm text-secondary-fixed-dim">PAR &lt; ०.६%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
