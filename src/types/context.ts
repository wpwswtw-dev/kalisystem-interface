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

  // Data management
  exportData: () => any;
  importData: (data: any) => Promise<void>;
  loadDefaultData: () => Promise<void>;
}