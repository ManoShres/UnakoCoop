import React from 'react';
import { BadgeCheck, BookOpen, CalendarDays, CircleUser, CreditCard, MapPin, Phone, TrendingUp, Users } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { ShgGroup } from './ShgTypes';

interface ShgCardGridProps {
  groups: ShgGroup[];
  viewMode: 'grid' | 'table';
  onOpenMembers: (groupName: string) => void;
  onDepositSavings: () => void;
}

export const ShgCardGrid: React.FC<ShgCardGridProps> = ({
  groups,
  viewMode,
  onOpenMembers,
  onDepositSavings,
}) => {
  const { t } = useLanguageStore();

  if (viewMode === 'table') {
    return (
      <div className="bg-surface-card rounded-2xl p-space-md shadow-md overflow-x-auto">
        <table className="w-full text-left font-body-sm text-xs">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider">
              <th className="py-3 px-4 rounded-l-xl">{t('उपसमूह / कोड', 'SHG Name & Code')}</th>
              <th className="py-3 px-4">{t('वर्ग', 'Category')}</th>
              <th className="py-3 px-4">{t('ठेगाना', 'Location')}</th>
              <th className="py-3 px-4">{t('संयोजक', 'Coordinator')}</th>
              <th className="py-3 px-4">{t('सदस्य', 'Members')}</th>
              <th className="py-3 px-4">{t('सामूहिक कोष', 'Group Fund')}</th>
              <th className="py-3 px-4 rounded-r-xl text-right">{t('कार्य', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {groups.map(g => (
              <tr key={g.id} className="hover:bg-surface-container-low/60 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-bold text-on-surface">{t(g.name, g.name)}</div>
                  <div className="text-[11px] font-mono text-primary">{g.code}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[11px] font-semibold">
                    {t(g.categoryLabel.ne, g.categoryLabel.en)}
                  </span>
                </td>
                <td className="py-3 px-4 text-on-surface-variant">
                  {t(g.location.address.ne, g.location.address.en)}
                </td>
                <td className="py-3 px-4 font-medium text-on-surface">
                  {t(g.coordinator.name.ne, g.coordinator.name.en)}
                </td>
                <td className="py-3 px-4 font-bold text-on-surface">
                  {g.demographics.total} {t('जना', 'Members')}
                </td>
                <td className="py-3 px-4 font-bold text-primary">
                  {t(g.fund.totalSavings.ne, g.fund.totalSavings.en)}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onOpenMembers(g.name)}
                    className="px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t('सदस्य हेर्नुहोस्', 'View')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg" id="gridContainer">
      {groups.map(g => (
        <div
          key={g.id}
          className="shg-card bg-surface-card rounded-2xl p-space-lg shadow-md hover:shadow-xl transition-all duration-200 relative flex flex-col justify-between"
        >
          {/* Decorative Top Accent for Featured Group */}
          {g.isUserGroup && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-brand-accent-lime rounded-t-2xl"></div>
          )}

          <div>
            {/* Header Badges & Title */}
            <div className={`flex flex-wrap items-center justify-between gap-space-xs mb-space-sm ${g.isUserGroup ? 'pt-space-xs' : ''}`}>
              <div className="flex items-center gap-space-xs flex-wrap">
                {g.isUserGroup ? (
                  <>
                    <span className="px-space-sm py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-bold flex items-center gap-1">
                      <CircleUser className="w-3.5 h-3.5" />
                      {t('तपाईंको उपसमूह', 'Your Group')}
                    </span>
                    <span className="px-space-sm py-0.5 rounded-full bg-brand-accent-light text-primary font-label-sm text-label-sm font-bold flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      {t('उत्कृष्ट', 'Grade-A Outstanding')}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">{g.categoryIcon}</span>
                      {t(g.categoryLabel.ne, g.categoryLabel.en)}
                    </span>
                    <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">
                      {g.grade}
                    </span>
                  </>
                )}
              </div>
              <span className="font-tabular-mono text-tabular-mono text-xs text-on-surface-variant font-semibold">
                {g.code}
              </span>
            </div>

            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">
              {t(g.name, g.name)}
            </h3>

            {/* Location & Meeting Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm bg-surface-container-low rounded-xl p-space-md mb-space-md">
              <div className="flex items-start gap-space-xs">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{t('स्थान / ठेगाना', 'Location / Address')}</p>
                  <p className="font-label-md text-label-md font-semibold text-on-surface">{t(g.location.address.ne, g.location.address.en)}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t(g.location.venue.ne, g.location.venue.en)}</p>
                </div>
              </div>
              <div className="flex items-start gap-space-xs">
                <CalendarDays className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{t('नियमित बैठक तालिका', 'Regular Meeting Schedule')}</p>
                  <p className="font-label-md text-label-md font-semibold text-on-surface">{t(g.meeting.schedule.ne, g.meeting.schedule.en)}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t(g.meeting.time.ne, g.meeting.time.en)}</p>
                </div>
              </div>
            </div>

            {/* Coordinator & Demographics */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md p-space-md bg-surface-canvas rounded-xl mb-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-headline-sm">
                  {t(g.coordinator.initials.ne, g.coordinator.initials.en)}
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">{t('संयोजक', 'Coordinator')}</span>
                  <p className="font-label-md text-label-md font-bold text-on-surface">{t(g.coordinator.name.ne, g.coordinator.name.en)}</p>
                  {g.coordinator.phone ? (
                    <p className="font-tabular-mono text-body-sm text-on-surface-variant flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {t(g.coordinator.phone, g.coordinator.phone)}
                    </p>
                  ) : (
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {t(g.coordinator.occupation.ne, g.coordinator.occupation.en)}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-left sm:text-right bg-surface-card sm:bg-transparent p-space-sm sm:p-0 rounded-lg">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">{t('कुल सदस्य संख्या', 'Total Members')}</span>
                <div className="flex items-center sm:justify-end gap-space-xs mt-0.5">
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {t(`${g.demographics.total} जना`, `${g.demographics.total} Members`)}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {t(g.demographics.breakdown.ne, g.demographics.breakdown.en)}
                </p>
              </div>
            </div>

            {/* Fund & Performance Metrics */}
            <div className="grid grid-cols-2 gap-space-md bg-surface-container-low/50 p-space-md rounded-xl mb-space-md">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{t('सामूहिक बचत कोष', 'Group Fund')}</p>
                <p className="font-headline-sm text-headline-sm font-extrabold text-primary mt-1">
                  {t(g.fund.totalSavings.ne, g.fund.totalSavings.en)}
                </p>
                <p className="font-label-sm text-label-sm text-status-success font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> {t(g.fund.savingsNote.ne, g.fund.savingsNote.en)}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{t(g.fund.metricTitle.ne, g.fund.metricTitle.en)}</p>
                <p className="font-headline-sm text-headline-sm font-extrabold text-on-surface mt-1">
                  {t(g.fund.metricValue.ne, g.fund.metricValue.en)}
                </p>
                {g.fund.mobilizationPercent !== undefined ? (
                  <>
                    <div className="w-full bg-surface-container rounded-full h-2 mt-2 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${g.fund.mobilizationPercent}%` }}></div>
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                      {t(g.fund.metricSub.ne, g.fund.metricSub.en)}
                    </p>
                  </>
                ) : (
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                    {t(g.fund.metricSub.ne, g.fund.metricSub.en)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-space-sm pt-space-sm">
            <button
              className={`flex-1 min-w-[140px] px-space-md py-space-sm rounded-xl font-label-md text-label-md font-semibold text-center transition-all shadow-sm flex items-center justify-center gap-space-xs cursor-pointer ${
                g.isUserGroup
                  ? 'bg-primary hover:bg-primary-container text-on-primary'
                  : 'bg-surface-dark hover:bg-surface-dark-card text-surface'
              }`}
              onClick={() => onOpenMembers(g.name)}
            >
              <Users className="w-4.5 h-4.5" />
              <span>{t(`सदस्य सूची (${g.demographics.total} जना)`, `View ${g.demographics.total} Members`)}</span>
            </button>
            <button
              className="px-space-md py-space-sm rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center gap-space-xs cursor-pointer"
            >
              <BookOpen className="w-4.5 h-4.5" />
              <span>{t('बैठक माइन्युट', 'Meeting Minutes')}</span>
            </button>
            {g.isUserGroup && (
              <button
                className="px-space-md py-space-sm rounded-xl bg-brand-accent-lime text-surface-dark hover:bg-secondary-fixed font-label-md text-label-md font-bold transition-all flex items-center gap-space-xs shadow-sm cursor-pointer"
                onClick={onDepositSavings}
              >
                <CreditCard className="w-4.5 h-4.5" />
                <span>{t('बचत जम्मा', 'Deposit Savings')}</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
