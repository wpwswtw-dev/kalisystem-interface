import { Item, Category, Supplier, Tag, AppSettings, OrderItem, CompletedOrder, PendingOrder, CurrentOrderMetadata } from '@/types';
import { ItemOperations, CategoryOperations, SupplierOperations, TagOperations, OrderOperations, SettingsOperations, EntityOperations } from '@/types/sync';

export interface AppContextType {
  // Data
  items: Item[];
  categories: Category[];
  suppliers: Supplier[];
  tags: Tag[];
  settings: AppSettings;
  currentOrder: OrderItem[];
  currentOrderMetadata: CurrentOrderMetadata;
  completedOrders: CompletedOrder[];
  pendingOrders: PendingOrder[];
  
  // Operations
  itemOps: ItemOperations;
  categoryOps: CategoryOperations;
  supplierOps: SupplierOperations;
  tagOps: TagOperations;
  orderOps: OrderOperations;
  settingsOps: SettingsOperations;
  pendingOrderOps: EntityOperations<PendingOrder>;

  // Wrapper functions for convenience
  addItem: (item: Omit<Item, 'id'>) => Promise<Item>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<Item>;
  deleteItem: (id: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<Supplier>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id'>) => Promise<Tag>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<AppSettings>;

  // Data management
  exportData: () => any;
  importData: (data: any) => Promise<void>;
  loadDefaultData: () => Promise<void>;
  manualSync: () => Promise<{ success: boolean; error?: any }>;
}