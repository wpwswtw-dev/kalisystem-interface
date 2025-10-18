import { Item } from '@/types';
import { supabase } from './supabase';
import { performOperation } from './syncHelpers';
import { ItemOperations } from '@/types/sync';

export const addOne = async (item: Omit<Item, 'id'>): Promise<Item> => {
  const newItem = { ...item, id: crypto.randomUUID() } as Item;
  const result = await performOperation(
    'item',
    'create',
    newItem,
    // Optional state change handler can be added here
  );
  if (!result.success) throw result.error;
  return newItem;
};

export const updateOne = async (id: string, updates: Partial<Item>): Promise<Item> => {
  const result = await performOperation(
    'item',
    'update',
    { id, ...updates },
    // Optional state change handler can be added here
  );
  if (!result.success) throw result.error;
  return { id, ...updates } as Item;
};

export const deleteOne = async (id: string): Promise<void> => {
  const result = await performOperation(
    'item',
    'delete',
    { id },
    // Optional state change handler can be added here
  );
  if (!result.success) throw result.error;
};