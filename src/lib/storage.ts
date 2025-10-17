import { Item, Category, Supplier, Store, Tag, AppSettings, CompletedOrder, PendingOrder, OrderItem, CurrentOrderMetadata } from '@/types';

export type StorageData = {
  items?: Item[];
  categories?: Category[];
  suppliers?: Supplier[];
  stores?: Store[];
  tags?: Tag[];
  settings?: AppSettings;
  completedOrders?: CompletedOrder[];
  pendingOrders?: PendingOrder[];
};

class StorageManager {
  private cache: Map<string, any> = new Map();

  getItems(): Item[] {
    return [];
  }

  setItems(items: Item[]): void {
  }

  getCategories(): Category[] {
    return [];
  }

  setCategories(categories: Category[]): void {
  }

  getSuppliers(): Supplier[] {
    return [];
  }

  setSuppliers(suppliers: Supplier[]): void {
  }

  getStores(): Store[] {
    return [];
  }

  setStores(stores: Store[]): void {
  }

  getTags(): Tag[] {
    return [];
  }

  setTags(tags: Tag[]): void {
  }

  getSettings(): AppSettings {
    return { posMode: true };
  }

  setSettings(settings: AppSettings): void {
  }

  getCompletedOrders(): CompletedOrder[] {
    return [];
  }

  setCompletedOrders(orders: CompletedOrder[]): void {
  }

  getPendingOrders(): PendingOrder[] {
    return [];
  }

  setPendingOrders(orders: PendingOrder[]): void {
  }

  getCurrentOrder(): OrderItem[] {
    return [];
  }

  setCurrentOrder(order: OrderItem[]): void {
  }

  getCurrentOrderMetadata(): CurrentOrderMetadata {
    return { orderType: 'Delivery' };
  }

  setCurrentOrderMetadata(metadata: CurrentOrderMetadata): void {
  }

  public exportData() {
    return {};
  }

  importData(data: StorageData): void {
    this.cache.clear();
  }

  clearAll(): void {
    this.cache.clear();
  }
}

export const storage = new StorageManager();
