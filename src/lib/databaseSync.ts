import type { DatabaseSync } from '@/types/sync';
import { SupabaseSync } from './supabaseSync';
import { storage } from './storage';
import type {
  Item,
  Category,
  Supplier,
  Tag,
  PendingOrder,
  AppSettings,
  OrderItem,
  CurrentOrderMetadata
} from '@/types';

// Retry helper with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  fallback: () => T,
  retries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (e) {
      lastError = e as Error;
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  console.error(`Operation failed after ${retries} retries:`, lastError);
  return fallback();
}

/**
 * databaseSync: cloud-first adapter.
 * - Tries SupabaseSync (cloud). If any call throws, falls back to local storage (storage).
 * - For read/load operations we try cloud then fallback to storage.
 * - For write/sync operations we try cloud then persist to storage on failure.
 */

const databaseSync: DatabaseSync = {
  // Core data sync operations
  syncItems: async (items: Item[]) => {
    await withRetry(
      () => SupabaseSync.syncItems(items),
      () => storage.setItems(items)
    );
  },

  syncCategories: async (categories: Category[]) => {
    await withRetry(
      () => SupabaseSync.syncCategories(categories),
      () => storage.setCategories(categories)
    );
  },

  syncSuppliers: async (suppliers: Supplier[]) => {
    await withRetry(
      () => SupabaseSync.syncSuppliers(suppliers),
      () => storage.setSuppliers(suppliers)
    );
  },

  syncTags: async (tags: Tag[]) => {
    await withRetry(
      () => SupabaseSync.syncTags(tags),
      () => storage.setTags(tags)
    );
  },

  syncPendingOrders: async (orders: PendingOrder[]) => {
    await withRetry(
      () => SupabaseSync.syncPendingOrders(orders),
      () => storage.setPendingOrders(orders)
    );
  },

  syncSettings: async (settings: AppSettings) => {
    await withRetry(
      () => SupabaseSync.syncSettings(settings),
      () => storage.setSettings(settings)
    );
  },

  // Current order operations
  syncCurrentOrder: async (items: OrderItem[], metadata: CurrentOrderMetadata) => {
    await withRetry(
      () => SupabaseSync.syncCurrentOrder(items, metadata),
      () => {
        storage.setCurrentOrder(items);
        storage.setCurrentOrderMetadata(metadata);
      }
    );
  },

  getCurrentOrder: async () => {
    return withRetry(
      () => SupabaseSync.getCurrentOrder(),
      () => ({
        items: storage.getCurrentOrder(),
        metadata: storage.getCurrentOrderMetadata()
      })
    );
  },

  // Core data getters
  getItems: async () => {
    return withRetry(
      () => SupabaseSync.getItems(),
      () => storage.getItems()
    );
  },

  getCategories: async () => {
    return withRetry(
      () => SupabaseSync.getCategories(),
      () => storage.getCategories()
    );
  },

  getSuppliers: async () => {
    return withRetry(
      () => SupabaseSync.getSuppliers(),
      () => storage.getSuppliers()
    );
  },

  getTags: async () => {
    return withRetry(
      () => SupabaseSync.getTags(),
      () => storage.getTags()
    );
  },

  getPendingOrders: async () => {
    return withRetry(
      () => SupabaseSync.getPendingOrders(),
      () => storage.getPendingOrders()
    );
  },

  getSettings: async () => {
    return withRetry(
      () => SupabaseSync.getSettings(),
      () => storage.getSettings()
    );
  },

  // Delete operations
  deleteItem: async (id: string) => {
    await withRetry(
      () => SupabaseSync.deleteItem(id),
      () => {
        const items = storage.getItems().filter(item => item.id !== id);
        storage.setItems(items);
      }
    );
  },

  deleteCategory: async (id: string) => {
    await withRetry(
      () => SupabaseSync.deleteCategory(id),
      () => {
        const categories = storage.getCategories().filter(cat => cat.id !== id);
        storage.setCategories(categories);
      }
    );
  },

  deleteSupplier: async (id: string) => {
    await withRetry(
      () => SupabaseSync.deleteSupplier(id),
      () => {
        const suppliers = storage.getSuppliers().filter(sup => sup.id !== id);
        storage.setSuppliers(suppliers);
      }
    );
  },

  deleteTag: async (id: string) => {
    await withRetry(
      () => SupabaseSync.deleteTag(id),
      () => {
        const tags = storage.getTags().filter(tag => tag.id !== id);
        storage.setTags(tags);
      }
    );
  },

  deletePendingOrder: async (id: string) => {
    await withRetry(
      () => SupabaseSync.deletePendingOrder(id),
      () => {
        const orders = storage.getPendingOrders().filter(order => order.id !== id);
        storage.setPendingOrders(orders);
      }
    );
  },

  // Legacy load operation (consider deprecating in favor of individual getters)
  loadFromDatabase: async () => {
    // Try cloud (SupabaseSync -> using Supabase `select` helpers)
    try {
      const [
        items,
        categories,
        suppliers,
        tags,
        pendingOrders,
        settings
      ] = await Promise.all([
        SupabaseSync.getItems(),
        SupabaseSync.getCategories(),
        SupabaseSync.getSuppliers(),
        SupabaseSync.getTags(),
        SupabaseSync.getPendingOrders(),
        SupabaseSync.getSettings()
      ] as const);

      // If Supabase returned items, use cloud result
      if (items && items.length > 0) {
        return {
          items,
          categories,
          suppliers,
          tags,
          pendingOrders,
          settings
        };
      }

      // No cloud items: fallthrough to local
      throw new Error('No cloud data');
    } catch (e) {
      console.warn('Loading from Supabase failed, using local storage fallback:', e);

      // Build return shape from storage
      return {
        items: storage.getItems(),
        categories: storage.getCategories(),
        suppliers: storage.getSuppliers(),
        tags: storage.getTags(),
        pendingOrders: storage.getPendingOrders(),
        settings: storage.getSettings()
      };
    }
  },

  // Helper operations
  saveDraft: async () => {
    const currentOrder = storage.getCurrentOrder();
    const metadata = storage.getCurrentOrderMetadata();
    await databaseSync.syncCurrentOrder(currentOrder, metadata);
  },

  discardDraft: async () => {
    await databaseSync.syncCurrentOrder([], {
      id: crypto.randomUUID(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orderType: 'Delivery'
    });
    storage.setCurrentOrder([]);
  },

  clearPendingOrders: async () => {
    await databaseSync.syncPendingOrders([]);
    storage.setPendingOrders([]);
  },

  archiveOrder: async (orderId: string) => {
    await databaseSync.deletePendingOrder(orderId);
    const pendingOrders = storage.getPendingOrders().filter(order => order.id !== orderId);
    storage.setPendingOrders(pendingOrders);
  }
};

export { databaseSync };
