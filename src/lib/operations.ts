import { Item, Category, Supplier, Tag, AppSettings, OrderItem, CurrentOrderMetadata } from '@/types';
import { performOperation } from './syncHelpers';
import { nanoid } from 'nanoid';

// Items
export const itemOperations = {
  addOne: async (item: Omit<Item, 'id'>): Promise<Item> => {
    const newItem = { ...item, id: nanoid() };
    const result = await performOperation('item', 'create', newItem);
    if (!result.success) throw result.error;
    return newItem;
  },

  updateOne: async (id: string, updates: Partial<Item>): Promise<Item> => {
    const result = await performOperation('item', 'update', { id, ...updates });
    if (!result.success) throw result.error;
    return { id, ...updates } as Item;
  },

  deleteOne: async (id: string): Promise<void> => {
    const result = await performOperation('item', 'delete', { id });
    if (!result.success) throw result.error;
  }
};

// Categories
export const categoryOperations = {
  addOne: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const newCategory = { ...category, id: nanoid() };
    const result = await performOperation('category', 'create', newCategory);
    if (!result.success) throw result.error;
    return newCategory;
  },

  updateOne: async (id: string, updates: Partial<Category>): Promise<Category> => {
    const result = await performOperation('category', 'update', { id, ...updates });
    if (!result.success) throw result.error;
    return { id, ...updates } as Category;
  },

  deleteOne: async (id: string): Promise<void> => {
    const result = await performOperation('category', 'delete', { id });
    if (!result.success) throw result.error;
  }
};

// Suppliers
export const supplierOperations = {
  addOne: async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
    const newSupplier = { ...supplier, id: nanoid() };
    const result = await performOperation('supplier', 'create', newSupplier);
    if (!result.success) throw result.error;
    return newSupplier;
  },

  updateOne: async (id: string, updates: Partial<Supplier>): Promise<Supplier> => {
    const result = await performOperation('supplier', 'update', { id, ...updates });
    if (!result.success) throw result.error;
    return { id, ...updates } as Supplier;
  },

  deleteOne: async (id: string): Promise<void> => {
    const result = await performOperation('supplier', 'delete', { id });
    if (!result.success) throw result.error;
  }
};

// Tags
export const tagOperations = {
  addOne: async (tag: Omit<Tag, 'id'>): Promise<Tag> => {
    const newTag = { ...tag, id: nanoid() };
    const result = await performOperation('tag', 'create', newTag);
    if (!result.success) throw result.error;
    return newTag;
  },

  updateOne: async (id: string, updates: Partial<Tag>): Promise<Tag> => {
    const result = await performOperation('tag', 'update', { id, ...updates });
    if (!result.success) throw result.error;
    return { id, ...updates } as Tag;
  },

  deleteOne: async (id: string): Promise<void> => {
    const result = await performOperation('tag', 'delete', { id });
    if (!result.success) throw result.error;
  }
};

// Orders
export const orderOperations = {
  addOne: async (orderItem: OrderItem): Promise<OrderItem> => {
    const result = await performOperation('order', 'create', orderItem);
    if (!result.success) throw result.error;
    return orderItem;
  },

  updateOne: async (id: string, updates: Partial<OrderItem>): Promise<OrderItem> => {
    const result = await performOperation('order', 'update', { id, ...updates });
    if (!result.success) throw result.error;
    return { id, ...updates } as OrderItem;
  },

  deleteOne: async (id: string): Promise<void> => {
    const result = await performOperation('order', 'delete', { id });
    if (!result.success) throw result.error;
  },

  // Additional order operations
  addToOrder: async (item: Item, quantity: number): Promise<void> => {
    const orderItem = { item, quantity };
    await orderOperations.addOne(orderItem);
  },

  updateOrderItem: async (itemId: string, quantity: number): Promise<void> => {
    await orderOperations.updateOne(itemId, { quantity });
  },

  removeFromOrder: async (itemId: string): Promise<void> => {
    await orderOperations.deleteOne(itemId);
  },

  completeOrder: async (): Promise<void> => {
    const result = await performOperation('order', 'update', { status: 'completed' });
    if (!result.success) throw result.error;
  }
};

// Settings
export const settingsOperations = {
  updateSettings: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
    const result = await performOperation('settings', 'update', settings);
    if (!result.success) throw result.error;
    return settings as AppSettings;
  }
};