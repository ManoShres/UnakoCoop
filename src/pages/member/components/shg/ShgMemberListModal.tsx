import React from 'react';
import { Users, X } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { ShgMember } from './ShgTypes';

interface ShgMemberListModalProps {
  isOpen: boolean;
  activeShg: string;
  onClose: () => void;
}

export const ShgMemberListModal: React.FC<ShgMemberListModalProps> = ({
  isOpen,
  activeShg,
  onClose,
}) => {
  const { t } = useLanguageStore();

  if (!isOpen) return null;

  const members: ShgMember[] = [
    { name: t('सीता देवी चौधरी', 'Sita Devi Chaudhary'), role: t('अध्यक्ष', 'Chair'), id: 'UKO-2070-0112' },
    { name: t('माया कुमारी थारु', 'Maya Kumari Tharu'), role: t('सचिव', 'Secretary'), id: 'UKO-2071-0842' },
    { name: t('शान्ति पुन', 'Shanti Pun'), role: t('कोषाध्यक्ष', 'Treasurer'), id: 'UKO-2072-0491' },
    { name: t('हरि प्रसाद चौधरी', 'Hari Prasad Chaudhary'), role: t('सदस्य', 'Member'), id: 'UKO-2070-08842' },
    { name: t('अनिता चौधरी', 'Anita Chaudhary'), role: t('सदस्य', 'Member'), id: 'UKO-2073-1029' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-card max-w-md w-full rounded-2xl shadow-2xl border border-primary/20 overflow-hidden animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-headline-sm font-bold text-on-surface text-sm">
              {t('समूह सदस्य नामावली', 'SHG Member Roster')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant cursor-pointer"
          >
            <X className="w-5 h-5 text-lg" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-xs text-on-surface-variant font-medium">
            {t('समूह:', 'Group:')} <strong className="text-on-surface">{activeShg}</strong>
          </p>

          <div className="divide-y divide-outline-variant/20 border border-outline-variant/30 rounded-xl overflow-hidden text-xs">
            {members.map((m, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between hover:bg-surface-container-low transition">
                <div>
                  <p className="font-bold text-on-surface">{m.name}</p>
                  <p className="text-[11px] text-on-surface-variant font-tabular-mono">{m.id}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                  {m.role}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 mt-2 rounded-xl bg-primary text-on-primary text-xs font-bold transition cursor-pointer"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
