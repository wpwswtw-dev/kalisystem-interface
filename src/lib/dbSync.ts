import { Item, Category, Supplier, Tag, AppSettings, PendingOrder, OrderItem, CurrentOrderMetadata } from '@/types';
import { DatabaseSync } from '@/types/sync';
import { SupabaseSync } from './supabaseSync';

// Sync Core Data
const syncItems = async (items: Item[]): Promise<void> => {
  await SupabaseSync.syncItems(items);
};

const syncCategories = async (categories: Category[]): Promise<void> => {
  await SupabaseSync.syncCategories(categories);
};

const syncSuppliers = async (suppliers: Supplier[]): Promise<void> => {
  await SupabaseSync.syncSuppliers(suppliers);
};

const syncTags = async (tags: Tag[]): Promise<void> => {
  await SupabaseSync.syncTags(tags);
};

const syncSettings = async (settings: AppSettings): Promise<void> => {
  await SupabaseSync.syncSettings(settings);
};

const syncCurrentOrder = async (items: OrderItem[], metadata: CurrentOrderMetadata): Promise<void> => {
  await SupabaseSync.syncCurrentOrder(items, metadata);
};

const syncPendingOrders = async (orders: PendingOrder[]): Promise<void> => {
  await SupabaseSync.syncPendingOrders(orders);
};

// Individual data getters
const getItems = async (): Promise<Item[]> => {
  return await SupabaseSync.getItems();
};

const getCategories = async (): Promise<Category[]> => {
  return await SupabaseSync.getCategories();
};

const getSuppliers = async (): Promise<Supplier[]> => {
  return await SupabaseSync.getSuppliers();
};

const getTags = async (): Promise<Tag[]> => {
  return await SupabaseSync.getTags();
};

const getSettings = async (): Promise<AppSettings> => {
  return await SupabaseSync.getSettings();
};

const getPendingOrders = async (): Promise<PendingOrder[]> => {
  return await SupabaseSync.getPendingOrders();
};

// Load Data
const loadFromDatabase = async (): Promise<{
  items: Item[];
  categories: Category[];
  suppliers: Supplier[];
  tags: Tag[];
  settings: AppSettings;
  pendingOrders: PendingOrder[];
}> => {
  const [items, categories, suppliers, tags, settings, pendingOrders] = await Promise.all([
    SupabaseSync.getItems(),
    SupabaseSync.getCategories(),
    SupabaseSync.getSuppliers(),
    SupabaseSync.getTags(),
    SupabaseSync.getSettings(),
    SupabaseSync.getPendingOrders()
  ]);

  return { items, categories, suppliers, tags, settings, pendingOrders };
};

const getCurrentOrder = async (): Promise<{
  items: OrderItem[];
  metadata: CurrentOrderMetadata;
}> => {
  return await SupabaseSync.getCurrentOrder();
};

// Delete Operations
const deleteItem = async (id: string): Promise<void> => {
  await SupabaseSync.deleteItem(id);
};

const deleteCategory = async (id: string): Promise<void> => {
  await SupabaseSync.deleteCategory(id);
};

const deleteSupplier = async (id: string): Promise<void> => {
  await SupabaseSync.deleteSupplier(id);
};

const deleteTag = async (id: string): Promise<void> => {
  await SupabaseSync.deleteTag(id);
};

const deletePendingOrder = async (id: string): Promise<void> => {
  await SupabaseSync.deletePendingOrder(id);
};

// Helper Operations
const saveDraft = async (): Promise<void> => {
  // Currently a no-op since draft saving is handled by syncCurrentOrder
};

const discardDraft = async (): Promise<void> => {
  // Discard by syncing an empty order
  await SupabaseSync.syncCurrentOrder([], {
    id: crypto.randomUUID(),
    status: 'draft',
    orderType: 'Delivery',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

const clearPendingOrders = async (): Promise<void> => {
  // We'll implement this by syncing an empty array
  await SupabaseSync.syncPendingOrders([]);
};

const archiveOrder = async (orderId: string): Promise<void> => {
  // For now, archiving just means deleting the pending order
  await SupabaseSync.deletePendingOrder(orderId);
};

export const databaseSync: DatabaseSync = {
  // Core sync operations
  syncItems,
  syncCategories,
  syncSuppliers,
  syncTags,
  syncSettings,
  syncCurrentOrder,
  syncPendingOrders,
  
  // Individual data getters
  getItems,
  getCategories,
  getSuppliers,
  getTags,
  getSettings,
  getPendingOrders,

  // Data loading
  loadFromDatabase,
  getCurrentOrder,

  // Delete operations
  deleteItem,
  deleteCategory,
  deleteSupplier,
  deleteTag,
  deletePendingOrder,

  // Helper operations
  saveDraft,
  discardDraft,
  clearPendingOrders,
  archiveOrder,
};