import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

interface ShgRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const ShgRegistrationModal: React.FC<ShgRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const { t } = useLanguageStore();
  const [shgName, setShgName] = useState('');
  const [ward, setWard] = useState('w1');
  const [category, setCategory] = useState('women');
  const [leaderName, setLeaderName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSuccess();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-card max-w-lg w-full rounded-2xl shadow-2xl border border-primary/20 overflow-hidden animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h3 className="font-headline-sm font-bold text-on-surface">
              {t('नयाँ स्वावलम्बी समूह दर्ता', 'Register New SHG Group')}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              {t('समूहको नाम', 'SHG Name')}
            </label>
            <input
              type="text"
              value={shgName}
              onChange={e => setShgName(e.target.value)}
              placeholder={t('उदा. गढवा सूर्यमुखी महिला स्वावलम्बी समूह', 'e.g. Gadhwa Suryamukhi Women SHG')}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm outline-none focus:border-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                {t('वडा नम्बर', 'Ward No.')}
              </label>
              <select
                value={ward}
                onChange={e => setWard(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm outline-none focus:border-primary"
              >
                <option value="w1">{t('वडा १ (गोबर्दिहा)', 'Ward 1 (Gobardiha)')}</option>
                <option value="w2">{t('वडा २ (गढवा)', 'Ward 2 (Gadhwa)')}</option>
                <option value="w3">{t('वडा ३ (गोबरडिहा दक्षिण)', 'Ward 3 (Gobardiha South)')}</option>
                <option value="w4">{t('वडा ४ (प्रतापपुर)', 'Ward 4 (Pratappur)')}</option>
                <option value="w5">{t('वडा ५ (चैनपुर मुख्य)', 'Ward 5 (Chainpur Main)')}</option>
                <option value="w6">{t('वडा ६ (गंगापरसपुर)', 'Ward 6 (Gangaparaspar)')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                {t('वर्ग', 'Category')}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm outline-none focus:border-primary"
              >
                <option value="women">{t('महिला स्वावलम्बी', 'Women Self-Help')}</option>
                <option value="dairy">{t('दुग्ध उत्पादक', 'Dairy Producers')}</option>
                <option value="agro">{t('कृषि तथा मौरी', 'Agro & Apiary')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              {t('संयोजक / अध्यक्षको नाम', 'Leader / Coordinator Name')}
            </label>
            <input
              type="text"
              value={leaderName}
              onChange={e => setLeaderName(e.target.value)}
              placeholder={t('अध्यक्षको पूरा नाम र सम्पर्क नम्बर...', 'Leader full name and contact number...')}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm outline-none focus:border-primary"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container-low transition cursor-pointer"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-md hover:bg-primary/95 transition cursor-pointer"
            >
              {t('दर्ता गर्नुहोस्', 'Register')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
