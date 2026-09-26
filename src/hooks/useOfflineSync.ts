import { useState, useEffect, useCallback } from 'react';
import {
  OfflineCollectionEntry,
  OfflineSyncSummary,
  getOfflineCollectionQueue,
  enqueueOfflineCollection,
  removeOfflineCollection,
  syncOfflineCollections,
  clearOfflineCollectionQueue,
} from '../utils/offlineCollection';

const FIELD_MODE_KEY = 'unako_force_field_mode';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [isFieldMode, setIsFieldMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(FIELD_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [queue, setQueue] = useState<OfflineCollectionEntry[]>(() => getOfflineCollectionQueue());

  // Listen to browser network connectivity events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleFieldMode = useCallback(() => {
    setIsFieldMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(FIELD_MODE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const refreshQueue = useCallback(() => {
    setQueue(getOfflineCollectionQueue());
  }, []);

  const addOfflineEntry = useCallback(
    (input: Omit<OfflineCollectionEntry, 'id' | 'createdAt' | 'synced' | 'syncedAt' | 'cbsDepositId'>) => {
      const created = enqueueOfflineCollection(input);
      refreshQueue();
      return created;
    },
    [refreshQueue]
  );

  const removeEntry = useCallback(
    (id: string) => {
      removeOfflineCollection(id);
      refreshQueue();
    },
    [refreshQueue]
  );

  const clearQueue = useCallback(() => {
    clearOfflineCollectionQueue();
    refreshQueue();
  }, [refreshQueue]);

  const syncQueue = useCallback(
    (postCallback: (entry: OfflineCollectionEntry) => { success: boolean; depositId?: string }): OfflineSyncSummary => {
      const currentQueue = getOfflineCollectionQueue();
      const { updatedQueue, summary } = syncOfflineCollections(currentQueue, postCallback);
      setQueue(updatedQueue);
      return summary;
    },
    []
  );

  const pendingCount = queue.filter((q) => !q.synced).length;
  const isEffectivelyOffline = !isOnline || isFieldMode;

  return {
    isOnline,
    isFieldMode,
    isEffectivelyOffline,
    queue,
    pendingCount,
    toggleFieldMode,
    addOfflineEntry,
    removeEntry,
    clearQueue,
    syncQueue,
    refreshQueue,
  };
}
