import { Item, Category, Supplier, Store, Tag, AppSettings, CompletedOrder, PendingOrder, OrderItem, CurrentOrderMetadata } from '@/types';

export interface StorageData {
  items?: Item[];
  categories?: Category[];
  suppliers?: Supplier[];
  tags?: Tag[];
  settings?: AppSettings;
  currentOrder?: OrderItem[];
  currentOrderMetadata?: CurrentOrderMetadata;
  completedOrders?: CompletedOrder[];
  pendingOrders?: PendingOrder[];
  stores?: Store[];
}
import { SupabaseSync } from '@/lib/supabaseSync'; // optional for future async integration

const KEY = {
  items: 'tc:items',
  categories: 'tc:categories',
  suppliers: 'tc:suppliers',
  stores: 'tc:stores',
  tags: 'tc:tags',
  settings: 'tc:settings',
  completedOrders: 'tc:completedOrders',
  pendingOrders: 'tc:pendingOrders',
  currentOrder: 'tc:currentOrder',
  currentOrderMetadata: 'tc:currentOrderMetadata'
};

class StorageManager {
  private cache: Map<string, any> = new Map();

  private read<T>(key: string, fallback: T): T {
    if (this.cache.has(key)) return this.cache.get(key);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as T;
      this.cache.set(key, parsed);
      return parsed;
    } catch {
      return fallback;
    }
  }

  private write<T>(key: string, value: T) {
    this.cache.set(key, value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }

  getItems(): Item[] {
    return this.read<Item[]>(KEY.items, []);
  }

  setItems(items: Item[]): void {
    this.write(KEY.items, items);
  }

  async getAll(): Promise<StorageData> {
    return {
      items: this.getItems(),
      categories: this.getCategories(),
      suppliers: this.getSuppliers(),
      tags: this.getTags(),
      settings: this.getSettings(),
      currentOrder: this.getCurrentOrder(),
      currentOrderMetadata: this.getCurrentOrderMetadata(),
      completedOrders: this.getCompletedOrders(),
      pendingOrders: this.getPendingOrders(),
    };
  }

  async setAll(data: StorageData): Promise<void> {
    if (data.items) this.setItems(data.items);
    if (data.categories) this.setCategories(data.categories);
    if (data.suppliers) this.setSuppliers(data.suppliers);
    if (data.tags) this.setTags(data.tags);
    if (data.settings) this.setSettings(data.settings);
    if (data.currentOrder) this.setCurrentOrder(data.currentOrder);
    if (data.currentOrderMetadata) this.setCurrentOrderMetadata(data.currentOrderMetadata);
    if (data.completedOrders) this.setCompletedOrders(data.completedOrders);
    if (data.pendingOrders) this.setPendingOrders(data.pendingOrders);
  }

  getCategories(): Category[] {
    return this.read<Category[]>(KEY.categories, []);
  }

  setCategories(categories: Category[]): void {
    this.write(KEY.categories, categories);
  }

  getSuppliers(): Supplier[] {
    return this.read<Supplier[]>(KEY.suppliers, []);
  }

  setSuppliers(suppliers: Supplier[]): void {
    this.write(KEY.suppliers, suppliers);
  }

  getStores(): Store[] {
    return this.read<Store[]>(KEY.stores, []);
  }

  setStores(stores: Store[]): void {
    this.write(KEY.stores, stores);
  }

  getTags(): Tag[] {
    return this.read<Tag[]>(KEY.tags, []);
  }

  setTags(tags: Tag[]): void {
    this.write(KEY.tags, tags);
  }

  getSettings(): AppSettings {
    return this.read<AppSettings>(KEY.settings, { posMode: true, autosave: true });
  }

  setSettings(settings: AppSettings): void {
    this.write(KEY.settings, settings);
  }

  getCompletedOrders(): CompletedOrder[] {
    return this.read<CompletedOrder[]>(KEY.completedOrders, []);
  }

  setCompletedOrders(orders: CompletedOrder[]): void {
    this.write(KEY.completedOrders, orders);
  }

  getPendingOrders(): PendingOrder[] {
    return this.read<PendingOrder[]>(KEY.pendingOrders, []);
  }

  setPendingOrders(orders: PendingOrder[]): void {
    this.write(KEY.pendingOrders, orders);
  }

  getCurrentOrder(): OrderItem[] {
    return this.read<OrderItem[]>(KEY.currentOrder, []);
  }

  setCurrentOrder(order: OrderItem[]): void {
    this.write(KEY.currentOrder, order);
  }

  getCurrentOrderMetadata(): CurrentOrderMetadata {
    return this.read<CurrentOrderMetadata>(KEY.currentOrderMetadata, {
      id: crypto.randomUUID(),
      status: 'draft',
      orderType: 'Delivery',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  setCurrentOrderMetadata(metadata: CurrentOrderMetadata): void {
    this.write(KEY.currentOrderMetadata, metadata);
  }

  public exportData(): StorageData {
    return {
      items: this.getItems(),
      categories: this.getCategories(),
      suppliers: this.getSuppliers(),
      stores: this.getStores(),
      tags: this.getTags(),
      settings: this.getSettings(),
      completedOrders: this.getCompletedOrders(),
      pendingOrders: this.getPendingOrders(),
    };
  }

  importData(data: StorageData): void {
    if (data.items) this.setItems(data.items);
    if (data.categories) this.setCategories(data.categories);
    if (data.suppliers) this.setSuppliers(data.suppliers);
    if (data.stores) this.setStores(data.stores);
    if (data.tags) this.setTags(data.tags);
    if (data.settings) this.setSettings(data.settings);
    if (data.completedOrders) this.setCompletedOrders(data.completedOrders);
    if (data.pendingOrders) this.setPendingOrders(data.pendingOrders);
  }

  clearAll(): void {
    this.cache.clear();
    Object.values(KEY).forEach(k => localStorage.removeItem(k));
  }
}

export const storage = new StorageManager();
