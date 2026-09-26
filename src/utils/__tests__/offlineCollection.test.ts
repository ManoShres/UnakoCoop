import { describe, it, expect, beforeEach } from 'vitest';
import {
  enqueueOfflineCollection,
  getOfflineCollectionQueue,
  removeOfflineCollection,
  clearOfflineCollectionQueue,
  syncOfflineCollections,
  formatOfflineThermalReceipt,
  OfflineCollectionEntry,
} from '../offlineCollection';
import { CoopSettings } from '../../types';

describe('Offline-First Field Collection Engine', () => {
  beforeEach(() => {
    clearOfflineCollectionQueue();
  });

  const mockCoopSettings: CoopSettings = {
    name: 'Unako Saving and Credit Cooperative Ltd.',
    nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
    regNo: '234/065/066',
    panNo: '302847591',
    address: 'Gadhwa-5, Dang, Lumbini, Nepal',
    phone: '+977-82-540123',
    email: 'info@unako.org.np',
    openingHours: '10:00 AM - 4:00 PM',
    operatingStatus: 'NORMAL',
  };

  const sampleEntryInput = {
    motherGroupId: 'mg-01',
    groupMemberId: 'gm-101',
    memberId: 'm-1',
    memberName: 'Purnima Chaudhary',
    meetingDate: '2081-06-15',
    collectorNo: 'EMP-01',
    collectorName: 'Sita Sharma',
    totalAmount: 1500,
    breakdown: {
      mandatorySavings: 500,
      optionalSavings: 200,
      loanPrincipal: 700,
      loanInterest: 100,
      fine: 0,
    },
    attendance: 'PRESENT' as const,
    slipNo: 'SLIP-992',
  };

  it('enqueues a new offline collection and generates a valid reference ID', () => {
    const created = enqueueOfflineCollection(sampleEntryInput);

    expect(created.id).toMatch(/^OFF-20810615-\d{4}$/);
    expect(created.synced).toBe(false);
    expect(created.totalAmount).toBe(1500);

    const queue = getOfflineCollectionQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].id).toBe(created.id);
  });

  it('removes an offline collection entry by ID', () => {
    const item1 = enqueueOfflineCollection(sampleEntryInput);
    const item2 = enqueueOfflineCollection({
      ...sampleEntryInput,
      memberName: 'Kamala Gharti',
      groupMemberId: 'gm-102',
    });

    expect(getOfflineCollectionQueue().length).toBe(2);

    removeOfflineCollection(item1.id);

    const queueAfter = getOfflineCollectionQueue();
    expect(queueAfter.length).toBe(1);
    expect(queueAfter[0].id).toBe(item2.id);
  });

  it('synchronizes queued offline entries to the central core banking system', () => {
    const entry1 = enqueueOfflineCollection(sampleEntryInput);
    const entry2 = enqueueOfflineCollection({
      ...sampleEntryInput,
      memberName: 'Gita Dangi',
      totalAmount: 2000,
    });

    const queue = getOfflineCollectionQueue();

    const { updatedQueue, summary } = syncOfflineCollections(queue, (item) => {
      return { success: true, depositId: `DEP-${item.id}` };
    });

    expect(summary.totalProcessed).toBe(2);
    expect(summary.syncedCount).toBe(2);
    expect(summary.failedCount).toBe(0);
    expect(summary.totalAmountSynced).toBe(3500); // 1500 + 2000

    expect(updatedQueue.every((q) => q.synced)).toBe(true);
    expect(updatedQueue[0].cbsDepositId).toBeDefined();
  });

  it('handles partial sync failures without dropping unsynced entries', () => {
    enqueueOfflineCollection(sampleEntryInput);
    enqueueOfflineCollection({
      ...sampleEntryInput,
      memberName: 'Failing Member',
      totalAmount: 1000,
    });

    const queue = getOfflineCollectionQueue();

    const { updatedQueue, summary } = syncOfflineCollections(queue, (item) => {
      if (item.memberName === 'Failing Member') {
        return { success: false };
      }
      return { success: true, depositId: `DEP-${item.id}` };
    });

    expect(summary.syncedCount).toBe(1);
    expect(summary.failedCount).toBe(1);

    const failedItem = updatedQueue.find((q) => q.memberName === 'Failing Member');
    expect(failedItem?.synced).toBe(false);

    const successfulItem = updatedQueue.find((q) => q.memberName === 'Purnima Chaudhary');
    expect(successfulItem?.synced).toBe(true);
  });

  it('generates a formatted bilingual offline receipt for field thermal printers', () => {
    const entry: OfflineCollectionEntry = {
      ...sampleEntryInput,
      id: 'OFF-20810615-5421',
      createdAt: '2026-09-26T18:00:00Z',
      synced: false,
    };

    const receipt = formatOfflineThermalReceipt(entry, mockCoopSettings);

    expect(receipt).toContain('उनको बचत तथा ऋण सहकारी संस्था लि.');
    expect(receipt).toContain('OFF-20810615-5421');
    expect(receipt).toContain('Purnima Chaudhary');
    expect(receipt).toContain('अनिवार्य बचत (Mandatory):  रु. 500.00');
    expect(receipt).toContain('कुल जम्मा (TOTAL):         रु. 1500.00');
    expect(receipt).toContain('फिल्ड संकलन रसिद');
  });
});
