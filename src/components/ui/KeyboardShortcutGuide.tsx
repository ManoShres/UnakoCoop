import React, { useEffect } from 'react';
import { Keyboard, X, Command, Globe, Search, Layers, Compass } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';

interface KeyboardShortcutGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  descNe: string;
  descEn: string;
}

export const KeyboardShortcutGuide: React.FC<KeyboardShortcutGuideProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguageStore();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const globalShortcuts: ShortcutItem[] = [
    {
      keys: ['F2'],
      descNe: 'द्रुत बैंकिङ कन्सोल खोल्नुहोस् / बन्द गर्नुहोस् (किबोर्ड-आधारित)',
      descEn: 'Toggle Fast Banking Terminal (Keyboard-First CBS)',
    },
    {
      keys: ['?'],
      descNe: 'किबोर्ड सर्टकट निर्देशिका खोल्नुहोस् / बन्द गर्नुहोस्',
      descEn: 'Toggle Keyboard Shortcut Guide',
    },
    {
      keys: ['Ctrl', 'Shift', 'L'],
      descNe: 'नेपाली / अंग्रेजी भाषा तुरुन्तै परिवर्तन गर्नुहोस्',
      descEn: 'Toggle Language (Nepali / English)',
    },
    {
      keys: ['Ctrl', 'K'],
      descNe: 'कुनै पनि पृष्ठको मुख्य खोज बाकसमा ध्यान केन्द्रित गर्नुहोस्',
      descEn: 'Focus search input on any directory or ledger page',
    },
    {
      keys: ['/'],
      descNe: 'द्रुत खोज (इनपुट बाहिर हुँदा)',
      descEn: 'Quick Search (when not in input)',
    },
    {
      keys: ['Esc'],
      descNe: 'कुनै पनि खुला मोडल वा विन्डो तत्काल बन्द गर्नुहोस्',
      descEn: 'Close any active modal dialogue or drawer',
    },
    {
      keys: ['Alt', 'H'],
      descNe: 'सार्वजनिक गृहपृष्ठमा जानुहोस्',
      descEn: 'Navigate to Public Homepage',
    },
  ];

  const adminShortcuts: ShortcutItem[] = [
    {
      keys: ['F2'],
      descNe: 'द्रुत बैंकिङ टर्मिनल (Fast CBS Action Terminal)',
      descEn: 'Fast Action CBS Banking Terminal (F2)',
    },
    {
      keys: ['Alt', 'D'],
      descNe: 'कार्यकारी ड्यासबोर्ड (Executive Dashboard)',
      descEn: 'Executive Dashboard (/admin)',
    },
    {
      keys: ['Alt', 'M'],
      descNe: 'सदस्य सूची तथा डिजिटल केवाईसी (Member Directory)',
      descEn: 'Member Directory & KYC (/admin/members)',
    },
    {
      keys: ['Alt', 'S'],
      descNe: 'बचत खाता तथा पासबुक व्यवस्थापन (Savings Ledgers)',
      descEn: 'Savings Accounts & Passbooks (/admin/savings)',
    },
    {
      keys: ['Alt', 'L'],
      descNe: 'ऋण उपसमिति कर्जा मूल्याङ्कन कतार (Loan Queue)',
      descEn: 'Loans & Credit Committee Queue (/admin/loans)',
    },
    {
      keys: ['Alt', 'T'],
      descNe: 'काउन्टर नगद तथा भल्ट व्यवस्थापन (Teller Counter)',
      descEn: 'Teller Cash & Vault Desk (/admin/teller-counter)',
    },
    {
      keys: ['Alt', 'G'],
      descNe: 'आमा समूह तथा केन्द्र व्यवस्थापन (Mother Groups)',
      descEn: 'Mother Groups & Centers (/admin/mother-groups)',
    },
  ];

  const memberShortcuts: ShortcutItem[] = [
    {
      keys: ['Alt', 'D'],
      descNe: 'सदस्य ड्यासबोर्ड (Member Dashboard)',
      descEn: 'Member Dashboard (/member)',
    },
    {
      keys: ['Alt', 'M'],
      descNe: 'मेरो खाता तथा डिजिटल पासबुक (Accounts & Passbook)',
      descEn: 'My Accounts & Passbook',
    },
    {
      keys: ['Alt', 'L'],
      descNe: 'ऋण पोर्टफोलियो तथा किस्ता भुक्तानी (Loan Portfolio)',
      descEn: 'Loan Portfolio & Repayments',
    },
    {
      keys: ['Alt', 'S'],
      descNe: 'शेयर तथा मुद्दती निक्षेप (Shares & Fixed Deposits)',
      descEn: 'Shares & Fixed Deposits',
    },
    {
      keys: ['Alt', 'T'],
      descNe: 'रकम स्थानान्तरण र भुक्तानी (Transfers & Payments)',
      descEn: 'Transfers & Payments',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcut-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Keyboard className="size-5" />
            </div>
            <div>
              <h2 id="shortcut-guide-title" className="text-base sm:text-lg font-black tracking-tight">
                {t('किबोर्ड सर्टकट निर्देशिका', 'Keyboard Shortcut Guide')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'प्रणालीमा द्रुत गतिमा नेभिगेसन र कार्य सम्पादनका लागि उपलब्ध सर्टकटहरू',
                  'Power-user keyboard shortcuts for instant navigation and actions'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('बन्द गर्नुहोस्', 'Close')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Global Shortcuts */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Globe className="size-3.5" />
              <span>{t('सार्वभौमिक सर्टकटहरू (Global Shortcuts)', 'Global Action Shortcuts')}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {globalShortcuts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {t(item.descNe, item.descEn)}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-2 py-1 text-[11px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs text-slate-800 dark:text-slate-200"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Administrative Console Navigation */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Compass className="size-3.5" />
              <span>{t('प्रशासक कन्सोल द्रुत नेभिगेसन (Admin Navigation)', 'Admin Console Navigation')}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {adminShortcuts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {t(item.descNe, item.descEn)}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-2 py-1 text-[11px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs text-slate-800 dark:text-slate-200"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Member Portal Navigation */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Layers className="size-3.5" />
              <span>{t('सदस्य पोर्टल द्रुत नेभिगेसन (Member Portal)', 'Member Portal Navigation')}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {memberShortcuts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {t(item.descNe, item.descEn)}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-2 py-1 text-[11px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs text-slate-800 dark:text-slate-200"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            {t(
              'कुनै पनि समयमा यो निर्देशिका खोल्न ? थिच्नुहोस् वा बन्द गर्न Esc थिच्नुहोस्।',
              'Press ? at any time to open this guide or Esc to close.'
            )}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition cursor-pointer"
          >
            {t('सकियो / बन्द', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
};
