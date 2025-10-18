import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, Category, Supplier, Tag, AppSettings, OrderItem, CompletedOrder, PendingOrder, CurrentOrderMetadata } from '@/types';
import type { AppContextType } from '@/types/context';
import type { StorageData } from '@/types/storage';
import { storage } from '@/lib/storage';
import { parseDefaultData } from '@/lib/dataParser';
import { nanoid } from 'nanoid';
import defaultDataJson from '@/default-data-new.json';
import { databaseSync } from '@/lib/databaseSync';

// Import operation types
import { 
  ItemOperations, 
  CategoryOperations,
  SupplierOperations,
  TagOperations, 
  OrderOperations,
  OrderState,
  SettingsOperations,
  SyncState
} from '@/types/sync';

// Import operation modules
import * as itemModule from '@/lib/itemOperations';
import * as categoryModule from '@/lib/categoryOperations';
import * as supplierModule from '@/lib/supplierOperations';
import * as tagModule from '@/lib/tagOperations';
import * as orderModule from '@/lib/orderOperations';
import * as settingsModule from '@/lib/settingsOperations';

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

interface AppState {
  state: SyncState;
  error: string | null;
  lastSynced: Date | null;
  queueLength: number;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Initialize state
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ autosave: true });
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [currentOrderMetadata, setCurrentOrderMetadata] = useState<CurrentOrderMetadata>({
    id: nanoid(),
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);

  // Initialize operations with state management
  const itemOps: ItemOperations = {
    addOne: itemModule.addOne,
    updateOne: itemModule.updateOne,
    deleteOne: itemModule.deleteOne,
    onStateChange: setItems,
    onError: (error: Error) => console.error('Item operation failed:', error)
  };

  const categoryOps: CategoryOperations = {
    addOne: categoryModule.addOne,
    updateOne: categoryModule.updateOne,
    deleteOne: categoryModule.deleteOne,
    onStateChange: setCategories,
    onError: (error: Error) => console.error('Category operation failed:', error)
  };

  const supplierOps: SupplierOperations = {
    ...supplierModule,
    onStateChange: setSuppliers,
    onError: (error: Error) => console.error('Supplier operation failed:', error)
  };

  const tagOps: TagOperations = {
    ...tagModule,
    onStateChange: setTags,
    onError: (error: Error) => console.error('Tag operation failed:', error)
  };

  const orderOps: OrderOperations = {
    addOne: orderModule.addOne,
    updateOne: orderModule.updateOne,
    deleteOne: orderModule.deleteOne,
    addToOrder: orderModule.addToOrder,
    updateOrderItem: orderModule.updateOrderItem,
    removeFromOrder: orderModule.removeFromOrder,
    completeOrder: orderModule.completeOrder,
    onStateChange: (state: OrderState) => {
      if (state.currentOrder) setCurrentOrder(state.currentOrder);
      if (state.completedOrders) setCompletedOrders(state.completedOrders);
      if (state.pendingOrders) setPendingOrders(state.pendingOrders);
      if (state.metadata) setCurrentOrderMetadata(state.metadata);
    },
    onError: (error: Error) => console.error('Order operation failed:', error)
  };

  const settingsOps: SettingsOperations = {
    ...settingsModule,
    onStateChange: setSettings,
    onError: (error: Error) => console.error('Settings operation failed:', error)
  };

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // First try to load from database
        const dbData = await databaseSync.loadFromDatabase();
        const currentOrderData = await databaseSync.getCurrentOrder();

        // Set state from database
        setItems(dbData.items);
        setCategories(dbData.categories);
        setSuppliers(dbData.suppliers);
        setTags(dbData.tags);
        setSettings(dbData.settings);
        setPendingOrders(dbData.pendingOrders);
        setCurrentOrder(currentOrderData.items);
        setCurrentOrderMetadata(currentOrderData.metadata);

        // Update local storage
        await storage.setAll({
          items: dbData.items,
          categories: dbData.categories,
          suppliers: dbData.suppliers,
          tags: dbData.tags,
          settings: dbData.settings,
          pendingOrders: dbData.pendingOrders,
          currentOrder: currentOrderData.items,
          currentOrderMetadata: currentOrderData.metadata
        });
      } catch (error) {
        console.error('Failed to initialize app from database:', error);
        
        // Fallback to local storage if database fails
        try {
          const storedData = await storage.getAll() as StorageData;
          
          if (storedData.items) setItems(storedData.items);
          if (storedData.categories) setCategories(storedData.categories);
          if (storedData.suppliers) setSuppliers(storedData.suppliers);
          if (storedData.tags) setTags(storedData.tags);
          if (storedData.settings) setSettings(storedData.settings);
          if (storedData.currentOrder) setCurrentOrder(storedData.currentOrder);
          if (storedData.currentOrderMetadata) setCurrentOrderMetadata(storedData.currentOrderMetadata);
          if (storedData.completedOrders) setCompletedOrders(storedData.completedOrders);
          if (storedData.pendingOrders) setPendingOrders(storedData.pendingOrders);
        } catch (storageError) {
          console.error('Failed to initialize app from storage:', storageError);
        }
      }
    };

    initializeApp();
  }, []);

  // Data management
  const exportData = () => ({
    items,
    categories,
    suppliers,
    tags,
    settings,
    currentOrder,
    currentOrderMetadata,
    completedOrders,
    pendingOrders,
  });

  const importData = async (data: any) => {
    try {
      setItems(data.items || []);
      setCategories(data.categories || []);
      setSuppliers(data.suppliers || []);
      setTags(data.tags || []);
      setSettings(data.settings || { theme: 'light' });
      setCurrentOrder(data.currentOrder || []);
      setCurrentOrderMetadata(data.currentOrderMetadata || {
        id: nanoid(),
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setCompletedOrders(data.completedOrders || []);
      setPendingOrders(data.pendingOrders || []);

      await storage.setAll(data);
      await Promise.all([
        databaseSync.syncItems(items),
        databaseSync.syncCategories(categories),
        databaseSync.syncSuppliers(suppliers),
        databaseSync.syncTags(tags),
        databaseSync.syncSettings(settings),
        databaseSync.syncPendingOrders(pendingOrders),
        databaseSync.syncCurrentOrder(currentOrder, currentOrderMetadata)
      ]);
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  };

  const loadDefaultData = async () => {
    const defaultData = parseDefaultData(defaultDataJson);
    await importData(defaultData);
  };

  return (
    <AppContext.Provider
      value={{
        // State
        items,
        categories,
        suppliers,
        tags,
        settings,
        currentOrder,
        currentOrderMetadata,
        completedOrders,
        pendingOrders,
        
        // Operations
        itemOps,
        categoryOps,
        supplierOps,
        tagOps,
        orderOps,
        settingsOps,
        
        // Data management
        exportData,
        importData,
        loadDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}