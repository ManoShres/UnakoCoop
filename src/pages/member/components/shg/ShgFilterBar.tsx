import React from 'react';
import { LayoutGridTableProperties SlidersHorizontal } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { ShgCategory, ShgWard } from './ShgTypes';

interface ShgFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  selectedWard: ShgWard;
  setSelectedWard: (ward: ShgWard) => void;
  selectedCategory: ShgCategory;
  setSelectedCategory: (cat: ShgCategory) => void;
  filteredCount: number;
}

export const ShgFilterBar: React.FC<ShgFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  selectedWard,
  setSelectedWard,
  selectedCategory,
  setSelectedCategory,
  filteredCount,
}) => {
  const { t } = useLanguageStore();

  const wards: { id: ShgWard; label: { ne: string; en: string } }[] = [
    { id: 'all', label: { ne: 'सबै वडाहरू', en: 'All Wards' } },
    { id: 'w1', label: { ne: 'वडा १ (गोबर्दिहा)', en: 'Ward 1 (Gobardiha)' } },
    { id: 'w2', label: { ne: 'वडा २', en: 'Ward 2' } },
    { id: 'w3', label: { ne: 'वडा ३', en: 'Ward 3' } },
    { id: 'w4', label: { ne: 'वडा ४', en: 'Ward 4' } },
    { id: 'w5', label: { ne: 'वडा ५ (चैनपुर)', en: 'Ward 5 (Chainpur)' } },
    { id: 'w6', label: { ne: 'वडा ६', en: 'Ward 6' } },
  ];

  const categories: { id: ShgCategory; label: { ne: string; en: string } }[] = [
    { id: 'all', label: { ne: 'सबै', en: 'All' } },
    { id: 'women', label: { ne: 'महिला स्वावलम्बी', en: 'Women Self-Help' } },
    { id: 'dairy', label: { ne: 'दुग्ध उत्पादक', en: 'Dairy Producers' } },
    { id: 'agro', label: { ne: 'कृषि तथा मौरी', en: 'Agro & Apiary' } },
  ];

  return (
    <section className="bg-surface-card rounded-2xl p-space-md lg:p-space-lg shadow-sm">
      <div className="flex flex-col gap-space-md">
        {/* Search and Views Top Strip */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              className="w-full h-12 pl-12 pr-space-md rounded-xl bg-surface-canvas text-on-surface font-body-md text-body-md focus:bg-surface-card focus:outline-none transition-all"
              id="shgSearchInput"
              placeholder={t('उपसमूहको नाम, टोल वा संयोजकको नाम खोज्नुहोस्...', 'Search by group, tole or coordinator...')}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* View switcher & quick sort */}
          <div className="flex items-center gap-space-sm justify-between md:justify-end">
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl">
              <button
                className={`flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-surface-card text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                onClick={() => setViewMode('grid')}
                id="viewGridBtn"
              >
                <LayoutGrid className="w-4.5 h-4.5" />
                <span className="hidden sm:inline">{t('ग्रिड दृश्य', 'Grid View')}</span>
              </button>
              <button
                className={`flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-surface-card text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                onClick={() => setViewMode('table')}
                id="viewTableBtn"
              >
                <TableProperties className="w-4.5 h-4.5" />
                <span className="hidden sm:inline">{t('तालिका दृश्य', 'Table View')}</span>
              </button>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant text-label-sm font-label-sm bg-surface-container-low px-space-sm py-space-xs rounded-xl">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-bold text-primary" id="filteredCounterBadge">
                {t(`${filteredCount} वटा उपसमूह देखाइयो`, `Showing ${filteredCount} SHG Groups`)}
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter Pills & Ward Selector Strip */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md pt-space-xs">
          {/* Ward Dropdown & Quick Selector */}
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant mr-space-xs">
              {t('वडा छान्नुहोस्:', 'Select Ward:')}
            </span>
            {wards.map(w => (
              <button
                key={w.id}
                onClick={() => setSelectedWard(w.id)}
                className={`px-space-sm py-1.5 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
                  selectedWard === w.id
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high font-medium'
                }`}
              >
                {t(w.label.ne, w.label.en)}
              </button>
            ))}
          </div>

          {/* Category Types */}
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant mr-space-xs">
              {t('प्रकार:', 'Type:')}
            </span>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-space-sm py-1 rounded-lg font-label-sm text-label-sm cursor-pointer transition-all ${
                  selectedCategory === c.id
                    ? 'bg-surface-container text-on-surface font-bold'
                    : 'bg-surface-canvas hover:bg-surface-container text-on-surface-variant'
                }`}
              >
                {t(c.label.ne, c.label.en)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
