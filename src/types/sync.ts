import { Item, Category, Supplier, Tag, AppSettings, OrderItem, CompletedOrder, PendingOrder } from './index';

export enum SyncState {
  Idle = 'idle',
  Syncing = 'syncing',
  Error = 'error'
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'item' | 'category' | 'supplier' | 'tag' | 'order' | 'settings';
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface AsyncOperationResult {
  success: boolean;
  error?: Error;
  data?: any;
}

export interface QueueStorage {
  getQueue(): SyncOperation[];
  setQueue(queue: SyncOperation[]): void;
}

export interface DatabaseSync {
  // Core sync operations
  syncItems(items: Item[]): Promise<void>;
  syncCategories(categories: Category[]): Promise<void>;
  syncSuppliers(suppliers: Supplier[]): Promise<void>;
  syncTags(tags: Tag[]): Promise<void>;
  syncSettings(settings: AppSettings): Promise<void>;
  syncCurrentOrder(items: OrderItem[], metadata: CurrentOrderMetadata): Promise<void>;
  syncPendingOrders(orders: PendingOrder[]): Promise<void>;
  
  // Individual data getters
  getItems(): Promise<Item[]>;
  getCategories(): Promise<Category[]>;
  getSuppliers(): Promise<Supplier[]>;
  getTags(): Promise<Tag[]>;
  getSettings(): Promise<AppSettings>;
  getPendingOrders(): Promise<PendingOrder[]>;
  
  // Bulk data loading
  loadFromDatabase(): Promise<{
    items: Item[];
    categories: Category[];
    suppliers: Supplier[];
    tags: Tag[];
    settings: AppSettings;
    pendingOrders: PendingOrder[];
  }>;
  getCurrentOrder(): Promise<{
    items: OrderItem[];
    metadata: CurrentOrderMetadata;
  }>;

  // Delete operations
  deleteItem(id: string): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  deleteSupplier(id: string): Promise<void>;
  deleteTag(id: string): Promise<void>;
  deletePendingOrder(id: string): Promise<void>;

  // Helper operations
  saveDraft(): Promise<void>;
  discardDraft(): Promise<void>;
  clearPendingOrders(): Promise<void>;
  archiveOrder(orderId: string): Promise<void>;
}

export interface OfflineQueueEvents {
  onQueueChange?: (queue: SyncOperation[]) => void;
  onSyncStart?: () => void;
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
}

export interface QueueEvents {
  subscribe(callback: (queue: SyncOperation[]) => void): () => void;
  notify(queue: SyncOperation[]): void;
}

// Core type definitions for operations
export interface EntityOperations<T> {
  addOne: (data: Omit<T, 'id'>) => Promise<T>;
  updateOne: (id: string, data: Partial<T>) => Promise<T>;
  deleteOne: (id: string) => Promise<void>;
  onStateChange?: (state: T[]) => void;
  onError?: (error: Error) => void;
}

// Specialized operation types
export interface ItemOperations extends EntityOperations<Item> {}
export interface CategoryOperations extends EntityOperations<Category> {}
export interface SupplierOperations extends EntityOperations<Supplier> {}
export interface TagOperations extends EntityOperations<Tag> {}
// Import types for sync operations
import { CurrentOrderMetadata } from './index';

export interface DatabaseSync {
  // Core sync operations
  syncItems(items: Item[]): Promise<void>;
  syncCategories(categories: Category[]): Promise<void>;
  syncSuppliers(suppliers: Supplier[]): Promise<void>;
  syncTags(tags: Tag[]): Promise<void>;
  syncSettings(settings: AppSettings): Promise<void>;
  syncCurrentOrder(items: OrderItem[], metadata: CurrentOrderMetadata): Promise<void>;
  syncPendingOrders(orders: PendingOrder[]): Promise<void>;

  // Data loading
  loadFromDatabase(): Promise<{
    items: Item[];
    categories: Category[];
    suppliers: Supplier[];
    tags: Tag[];
    settings: AppSettings;
    pendingOrders: PendingOrder[];
  }>;
  getCurrentOrder(): Promise<{
    items: OrderItem[];
    metadata: CurrentOrderMetadata;
  }>;

  // Individual operations
  deleteItem(id: string): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  deleteSupplier(id: string): Promise<void>;
  deleteTag(id: string): Promise<void>;
  deletePendingOrder(id: string): Promise<void>;
  
  // Helpers
  saveDraft(): Promise<void>;
  discardDraft(): Promise<void>;
  clearPendingOrders(): Promise<void>;
  archiveOrder(orderId: string): Promise<void>;
}

export interface OrderState {
  currentOrder?: OrderItem[];
  completedOrders?: CompletedOrder[];
  pendingOrders?: PendingOrder[];
  metadata?: CurrentOrderMetadata;
}

export interface OrderOperations {
  addOne: (data: Omit<OrderItem, 'id'>) => Promise<OrderItem>;
  updateOne: (id: string, data: Partial<OrderItem>) => Promise<OrderItem>;
  deleteOne: (id: string) => Promise<void>;
  onStateChange?: (state: OrderState) => void;
  onError?: (error: Error) => void;
  addToOrder: (item: Item, quantity: number) => void;
  updateOrderItem: (itemId: string, quantity: number) => void;
  removeFromOrder: (itemId: string) => void;
  completeOrder: () => Promise<void>;
}
export interface SettingsOperations {
  updateSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  onStateChange?: (state: AppSettings) => void;
  onError?: (error: Error) => void;
}