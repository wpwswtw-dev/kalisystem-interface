import type { SyncOperation, QueueStorage } from '@/types/sync';

const QUEUE_KEY = 'tc:sync_queue';

export class LocalStorageQueue implements QueueStorage {
  getQueue(): SyncOperation[] {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as SyncOperation[];
    } catch {
      return [];
    }
  }

  setQueue(queue: SyncOperation[]): void {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {
      // Ignore storage errors
    }
  }
}