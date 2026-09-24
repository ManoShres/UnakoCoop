import React from 'react';
import { CalendarClock } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface ShgNoticeBannerProps {
  onViewAgenda?: () => void;
}

export const ShgNoticeBanner: React.FC<ShgNoticeBannerProps> = ({ onViewAgenda }) => {
  const { t } = useLanguageStore();

  return (
    <div className="rounded-xl bg-surface-container-high/60 p-space-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-md">
        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
          <CalendarClock className="w-5 h-5" />
        </div>
        <div>
          <p className="font-label-md text-label-md text-on-surface font-semibold">
            {t('आसन्न मासिक उपसमूह बैठक सूचना: चैनपुर उपसमूह #०३', 'Upcoming Monthly SHG Meeting: Chainpur SHG #03')}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {t(
              'मिति २०८१ फागुन १५ गते, दिनको २:०० बजे चैनपुर सामुदायिक भवनमा बैठक बस्दैछ। उपस्थितिका लागि सम्पूर्ण २८ जना सदस्यहरूलाई सूचित गरिन्छ।',
              'Meeting scheduled on Feb 27, 2025 at 2:00 PM at Chainpur Community Hall. All 28 members are requested to attend.'
            )}
          </p>
        </div>
      </div>
      <button
        onClick={onViewAgenda}
        className="shrink-0 px-space-md py-space-xs rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-all cursor-pointer"
      >
        {t('एजेण्डा हेर्नुहोस्', 'View Agenda')}
      </button>
    </div>
  );
};
