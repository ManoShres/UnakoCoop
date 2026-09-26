import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Printer,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { useCoopStore } from '../../../../store/useCoopStore';
import { OfflineCollectionEntry, formatOfflineThermalReceipt } from '../../../../utils/offlineCollection';
import { printRawHtml } from '../../../../utils/printHelper';

interface OfflineSyncBannerProps {
  isOnline: boolean;
  isFieldMode: boolean;
  isEffectivelyOffline: boolean;
  pendingCount: number;
  queue: OfflineCollectionEntry[];
  onToggleFieldMode: () => void;
  onSyncAll: () => void;
  onRemoveEntry: (id: string) => void;
  onClearQueue: () => void;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({
  isOnline,
  isFieldMode,
  isEffectivelyOffline,
  pendingCount,
  queue,
  onToggleFieldMode,
  onSyncAll,
  onRemoveEntry,
  onClearQueue,
}) => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const { coopSettings } = useCoopStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const pendingEntries = queue.filter((q) => !q.synced);
  const totalPendingAmount = pendingEntries.reduce((sum, q) => sum + q.totalAmount, 0);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    try {
      await onSyncAll();
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  const handlePrintReceipt = (entry: OfflineCollectionEntry) => {
    const receiptText = formatOfflineThermalReceipt(entry, coopSettings);
    printRawHtml(
      `<pre style="font-family: monospace; font-size: 11px; white-space: pre-wrap; line-height: 1.25;">${receiptText}</pre>`,
      {
        title: `Offline-Receipt-${entry.id}`,
        format: 'thermal-58mm',
      }
    );
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
        isEffectivelyOffline
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
      }`}
    >
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isEffectivelyOffline
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isEffectivelyOffline ? <WifiOff className="size-5" /> : <Wifi className="size-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider">
                {isEffectivelyOffline
                  ? isFieldMode
                    ? t('फिल्ड अफलाइन मोड (सक्रिय)', 'Field Offline Mode (Active)')
                    : t('इन्टरनेट विच्छेद (अफलाइन)', 'Network Disconnected (Offline)')
                  : t('अनलाइन केन्द्रीय सीबीएस जडान', 'Online CBS Connected')}
              </span>

              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {fmtDigits(pendingCount)} {t('स्थानीय रसिद', 'offline receipts')}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              {isEffectivelyOffline
                ? t(
                    'दाङका दुर्गम क्षेत्रमा इन्टरनेट नभए पनि संकलन प्रविष्टि सुरक्षित हुन्छ र अस्थायी रसिद छापिन्छ।',
                    'Collection entries are stored locally and offline receipts can be printed in remote areas.'
                  )
                : t(
                    'केन्द्रीय सर्भरसँग प्रत्यक्ष जडान छ। सबै संकलन तुरुन्तै बचत खातामा पोस्ट हुनेछ।',
                    'Direct live connection to central CBS. Deposits post instantly to passbooks.'
                  )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Field Mode Toggle Button */}
          <button
            type="button"
            onClick={onToggleFieldMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isFieldMode
                ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {isFieldMode ? t('ग्रामीण फिल्ड मोड: अन', 'Field Mode: ON') : t('ग्रामीण फिल्ड मोड', 'Field Mode')}
          </button>

          {/* Sync Button */}
          {pendingCount > 0 && (
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleSyncClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {t('केन्द्रीय सीबीएसमा सिंक', 'Sync to CBS')} ({fmtCurrency(totalPendingAmount, true)})
              </span>
            </button>
          )}

          {/* Expand/Collapse details */}
          {queue.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition cursor-pointer"
              title={t('विवरण हेर्नुहोस्', 'View offline queue')}
            >
              {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Queue Table */}
      {isExpanded && queue.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <HardDrive className="size-4 text-slate-500" />
              <span>{t('स्थानीय फिल्ड संकलन सूची (Queue)', 'Local Offline Collection Queue')}</span>
            </span>

            {queue.some((q) => q.synced) && (
              <button
                type="button"
                onClick={onClearQueue}
                className="text-[11px] text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                {t('सिंक भएका हटाउनुहोस्', 'Clear Synced History')}
              </button>
            )}
          </div>

          <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {queue.map((item) => (
              <div key={item.id} className="py-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full shrink-0 ${
                      item.synced ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white">{item.memberName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{item.id}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {item.meetingDate} • {item.collectorName} • {item.attendance}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {fmtCurrency(item.totalAmount, true)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(item)}
                    className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                    title={t('अस्थायी रसिद छाप्नुहोस्', 'Print Field Receipt')}
                  >
                    <Printer className="size-3.5" />
                  </button>

                  {!item.synced && (
                    <button
                      type="button"
                      onClick={() => onRemoveEntry(item.id)}
                      className="p-1 rounded bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 transition cursor-pointer"
                      title={t('हटाउनुहोस्', 'Remove entry')}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}

                  {item.synced && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" />
                      <span>{t('सिंक भयो', 'Synced')}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
