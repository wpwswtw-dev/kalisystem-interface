import type { DatabaseSync } from '@/types/sync';
import { databaseSync } from './dbSync';
import { LocalStorageQueue } from './queueStorage';
import type { 
  SyncOperation,
  QueueStorage,
  QueueEvents,
  AsyncOperationResult
} from '@/types/sync';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds

class OfflineQueue implements QueueEvents {
  private queue: SyncOperation[] = [];
  private isProcessing = false;
  private storage: QueueStorage;
  private db: DatabaseSync;
  private listeners: ((queue: SyncOperation[]) => void)[] = [];

  constructor(db: DatabaseSync, storage: QueueStorage) {
    this.db = db;
    this.storage = storage;
    this.queue = storage.getQueue();
    this.notify(this.queue);
  }

  subscribe(callback: (queue: SyncOperation[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  notify(queue: SyncOperation[]): void {
    this.listeners.forEach(listener => listener(queue));
  }

  hasQueuedOperations(): boolean {
    return this.queue.length > 0;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  async enqueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>) {
    const queueOperation: SyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0
    };

    this.queue.push(queueOperation);
    this.storage.setQueue(this.queue);
    this.notify(this.queue);
    
    await this.processQueue();
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const operation = this.queue[0];

    try {
      await this.processOperation(operation);
      this.queue = this.queue.slice(1);
      this.storage.setQueue(this.queue);
      this.notify(this.queue);

      this.isProcessing = false;
      if (this.queue.length > 0) {
        await this.processQueue();
      }
    } catch (error) {
      const updatedOperation = { ...operation, retryCount: operation.retryCount + 1 };
      
      if (updatedOperation.retryCount >= MAX_RETRIES) {
        this.queue = this.queue.slice(1);
      } else {
        this.queue[0] = updatedOperation;
        const retryDelay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, updatedOperation.retryCount), MAX_RETRY_DELAY);
        setTimeout(() => this.processQueue(), retryDelay);
      }
      
      this.storage.setQueue(this.queue);
      this.notify(this.queue);
      this.isProcessing = false;
    }
  }

  private async processOperation(operation: SyncOperation): Promise<AsyncOperationResult> {
    const { type, entity, data } = operation;

    try {
      switch (entity) {
        case 'item': {
          if (type === 'delete') {
            await this.db.deleteItem(data.id);
          } else {
            await this.db.syncItems([data]);
          }
          break;
        }
        case 'category': {
          if (type === 'delete') {
            await this.db.deleteCategory(data.id);
          } else {
            await this.db.syncCategories([data]);
          }
          break;
        }
        case 'supplier': {
          if (type === 'delete') {
            await this.db.deleteSupplier(data.id);
          } else {
            await this.db.syncSuppliers([data]);
          }
          break;
        }
        case 'tag': {
          if (type === 'delete') {
            await this.db.deleteTag(data.id);
          } else {
            await this.db.syncTags([data]);
          }
          break;
        }
        case 'order': {
          if (type === 'delete') {
            await this.db.deletePendingOrder(data.id);
          } else {
            await this.db.syncPendingOrders([data]);
          }
          break;
        }
        case 'settings': {
          await this.db.syncSettings(data);
          break;
        }
        default: {
          throw new Error(`Unknown entity type: ${entity}`);
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}

export const offlineQueue = new OfflineQueue(databaseSync, new LocalStorageQueue());