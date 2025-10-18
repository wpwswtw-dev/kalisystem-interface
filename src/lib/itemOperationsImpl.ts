import { Item } from '@/types';
import { performOperation } from './syncHelpers';

// Implementation of the actual operations
export const addOne = async (item: Omit<Item, 'id'>): Promise<Item> => {
  const newItem = { ...item, id: crypto.randomUUID() } as Item;
  const result = await performOperation(
    'item',
    'create',
    newItem,
  );
  if (!result.success) throw result.error;
  return newItem;
};

export const updateOne = async (id: string, updates: Partial<Item>): Promise<Item> => {
  const result = await performOperation(
    'item',
    'update',
    { id, ...updates },
  );
  if (!result.success) throw result.error;
  return { id, ...updates } as Item;
};

export const deleteOne = async (id: string): Promise<void> => {
  const result = await performOperation(
    'item',
    'delete',
    { id },
  );
  if (!result.success) throw result.error;
};