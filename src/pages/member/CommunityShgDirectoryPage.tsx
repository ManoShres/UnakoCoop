import React, { useState, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { SHG_GROUPS, ShgCategory, ShgWard } from './components/shg/ShgTypes';
import { ShgHeroBanner } from './components/shg/ShgHeroBanner';
import { ShgFilterBar } from './components/shg/ShgFilterBar';
import { ShgNoticeBanner } from './components/shg/ShgNoticeBanner';
import { ShgCardGrid } from './components/shg/ShgCardGrid';
import { ShgFieldOfficerSection } from './components/shg/ShgFieldOfficerSection';
import { ShgRegistrationModal } from './components/shg/ShgRegistrationModal';
import { ShgMemberListModal } from './components/shg/ShgMemberListModal';

export function CommunityShgDirectoryPage() {
  const { t } = useLanguageStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [activeShg, setActiveShg] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedWard, setSelectedWard] = useState<ShgWard>('all');
  const [selectedCategory, setSelectedCategory] = useState<ShgCategory>('all');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDownloadPdf = () => {
    showToast(t('सामुदायिक समूह निर्देशिका डाउनलोड सुरु भयो!', 'SHG Directory PDF download started!'));
  };

  const handleOpenMembers = (shgName: string) => {
    setActiveShg(shgName);
    setShowMembersModal(true);
  };

  const filteredGroups = useMemo(() => {
    return SHG_GROUPS.filter(g => {
      // Ward filter
      if (selectedWard !== 'all' && g.ward !== selectedWard) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'women' && g.category !== 'women' && g.category !== 'mixed') return false;
        if (selectedCategory !== 'women' && g.category !== selectedCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = g.name.toLowerCase().includes(query);
        const matchesAddress =
          g.location.address.ne.toLowerCase().includes(query) ||
          g.location.address.en.toLowerCase().includes(query);
        const matchesCoord =
          g.coordinator.name.ne.toLowerCase().includes(query) ||
          g.coordinator.name.en.toLowerCase().includes(query);
        if (!matchesName && !matchesAddress && !matchesCoord) return false;
      }

      return true;
    });
  }, [selectedWard, selectedCategory, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-surface-dark text-white px-5 py-3 rounded-xl shadow-2xl border border-primary/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-status-success text-xl" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Main Community SHG Directory */}
      <div className="flex flex-col w-full space-y-space-xl">
        {/* Top Header / Title Banner */}
        <ShgHeroBanner
          onDownloadPdf={handleDownloadPdf}
          onOpenNewModal={() => setShowNewModal(true)}
        />

        {/* Interactive Filter & Search Bar */}
        <ShgFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedWard={selectedWard}
          setSelectedWard={setSelectedWard}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          filteredCount={filteredGroups.length}
        />

        {/* Notice Highlight: Active User Notice Banner */}
        <ShgNoticeBanner
          onViewAgenda={() =>
            showToast(t('बैठकको एजेण्डा: बचत समीक्षा तथा नयाँ कृषि कर्जा छलफल।', 'Meeting Agenda: Savings review and new agro credit.'))
          }
        />

        {/* Group Cards Grid or Table */}
        <ShgCardGrid
          groups={filteredGroups}
          viewMode={viewMode}
          onOpenMembers={handleOpenMembers}
          onDepositSavings={() =>
            showToast(t('सामूहिक बचत जम्मा भौचर खोलियो!', 'Group savings deposit voucher opened!'))
          }
        />

        {/* Ward-level Cooperative Summary & Direct Contact Desk */}
        <ShgFieldOfficerSection />
      </div>

      {/* Modals */}
      <ShgRegistrationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSubmitSuccess={() => {
          setShowNewModal(false);
          showToast(t('नयाँ स्वावलम्बी समूह दर्ता आवेदन पेश भयो!', 'SHG Registration Application Submitted!'));
        }}
      />

      <ShgMemberListModal
        isOpen={showMembersModal}
        activeShg={activeShg}
        onClose={() => setShowMembersModal(false)}
      />
    </div>
  );
}
