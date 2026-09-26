/**
 * Offline-First PWA Collection Engine for Rural SACCOS Field Operations
 * Supports Gadhwa & Dang remote wards where cellular connectivity is intermittent.
 */

import { CoopSettings } from '../types';

export interface OfflineCollectionBreakdown {
  mandatorySavings: number;
  optionalSavings: number;
  loanPrincipal: number;
  loanInterest: number;
  fine: number;
}

export type OfflineAttendance = 'PRESENT' | 'ABSENT' | 'LATE' | 'REPRESENTATIVE' | 'LEAVE' | (string & {});

export interface OfflineCollectionEntry {
  id: string; // e.g. OFF-208106-0001
  motherGroupId: string;
  groupMemberId: string;
  memberId?: string;
  memberName: string;
  meetingDate: string; // YYYY-MM-DD
  collectorNo: string;
  collectorName: string;
  totalAmount: number;
  breakdown: OfflineCollectionBreakdown;
  attendance: OfflineAttendance;
  slipNo?: string;
  notes?: string;
  createdAt: string; // ISO
  synced: boolean;
  syncedAt?: string;
  cbsDepositId?: string;
}

export interface OfflineSyncSummary {
  totalProcessed: number;
  syncedCount: number;
  failedCount: number;
  totalAmountSynced: number;
  timestamp: string;
}

const STORAGE_KEY = 'unako_offline_field_collections_v1';

/**
 * Generate a unique offline receipt reference with date and counter
 */
export function generateOfflineReceiptId(meetingDate: string): string {
  const dateStr = meetingDate.replace(/[^0-9]/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `OFF-${dateStr}-${rand}`;
}

let memoryQueueFallback: OfflineCollectionEntry[] = [];

/**
 * Read the current offline collection queue from local storage (or in-memory fallback)
 */
export function getOfflineCollectionQueue(): OfflineCollectionEntry[] {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fall back to memory
  }
  return [...memoryQueueFallback];
}

/**
 * Persist queue to local storage (and in-memory fallback)
 */
export function saveOfflineCollectionQueue(queue: OfflineCollectionEntry[]): void {
  memoryQueueFallback = [...queue];
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }
  } catch {
    // In-memory queue preserves state
  }
}

/**
 * Enqueue a new offline collection entry
 */
export function enqueueOfflineCollection(
  input: Omit<OfflineCollectionEntry, 'id' | 'createdAt' | 'synced' | 'syncedAt' | 'cbsDepositId'>
): OfflineCollectionEntry {
  const queue = getOfflineCollectionQueue();
  const entry: OfflineCollectionEntry = {
    ...input,
    id: generateOfflineReceiptId(input.meetingDate),
    createdAt: new Date().toISOString(),
    synced: false,
  };

  const updatedQueue = [entry, ...queue];
  saveOfflineCollectionQueue(updatedQueue);
  return entry;
}

/**
 * Remove an offline collection entry by ID
 */
export function removeOfflineCollection(id: string): void {
  const queue = getOfflineCollectionQueue();
  const updatedQueue = queue.filter((item) => item.id !== id);
  saveOfflineCollectionQueue(updatedQueue);
}

/**
 * Clear the entire offline queue (e.g., after complete sync or testing reset)
 */
export function clearOfflineCollectionQueue(): void {
  memoryQueueFallback = [];
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // In-memory cleared
  }
}

/**
 * Synchronize all pending offline collections into central cooperative store
 */
export function syncOfflineCollections(
  queue: OfflineCollectionEntry[],
  postCallback: (entry: OfflineCollectionEntry) => { success: boolean; depositId?: string }
): { updatedQueue: OfflineCollectionEntry[]; summary: OfflineSyncSummary } {
  let syncedCount = 0;
  let failedCount = 0;
  let totalAmountSynced = 0;

  const updatedQueue = queue.map((item) => {
    if (item.synced) return item;

    try {
      const res = postCallback(item);
      if (res.success) {
        syncedCount++;
        totalAmountSynced += item.totalAmount;
        return {
          ...item,
          synced: true,
          syncedAt: new Date().toISOString(),
          cbsDepositId: res.depositId,
        };
      } else {
        failedCount++;
        return item;
      }
    } catch (err) {
      console.error(`Sync failed for item ${item.id}:`, err);
      failedCount++;
      return item;
    }
  });

  saveOfflineCollectionQueue(updatedQueue);

  return {
    updatedQueue,
    summary: {
      totalProcessed: syncedCount + failedCount,
      syncedCount,
      failedCount,
      totalAmountSynced,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Generate formatted ASCII receipt for field thermal printers (58mm / 80mm)
 */
export function formatOfflineThermalReceipt(
  entry: OfflineCollectionEntry,
  coopSettings: CoopSettings
): string {
  const divider = '--------------------------------';
  const lines = [
    coopSettings.nameNepali,
    coopSettings.name,
    `${coopSettings.address}`,
    `PAN: ${coopSettings.panNo} | Reg: ${coopSettings.regNo}`,
    divider,
    `*** फिल्ड संकलन रसिद (OFFLINE RECEIPT) ***`,
    `रसिद नं (Ref): ${entry.id}`,
    `मिति (Date): ${entry.meetingDate}`,
    `संकलक (Collector): ${entry.collectorName} (${entry.collectorNo})`,
    divider,
    `सदस्य (Member): ${entry.memberName}`,
    `उपस्थिति (Attendance): ${entry.attendance}`,
    divider,
    `अनिवार्य बचत (Mandatory):  रु. ${entry.breakdown.mandatorySavings.toFixed(2)}`,
    `ऐच्छिक बचत (Optional):     रु. ${entry.breakdown.optionalSavings.toFixed(2)}`,
    `ऋण साँवा (Loan Principal): रु. ${entry.breakdown.loanPrincipal.toFixed(2)}`,
    `ऋण ब्याज (Loan Interest):  रु. ${entry.breakdown.loanInterest.toFixed(2)}`,
    `हर्जाना/शुल्क (Fine/Fee):    रु. ${entry.breakdown.fine.toFixed(2)}`,
    divider,
    `कुल जम्मा (TOTAL):         रु. ${entry.totalAmount.toFixed(2)}`,
    divider,
    `* यो अस्थायी फिल्ड संकलन रसिद हो।`,
    `  केन्द्रीय सीबीएसमा प्रविष्टि भएपछि`,
    `  पासबुकमा प्रमाणित गरिनेछ।`,
    divider,
    `धन्यवाद! (Thank you!)`,
  ];

  return lines.join('\n');
}
