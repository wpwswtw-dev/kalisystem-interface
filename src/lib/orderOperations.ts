import { Item, OrderItem, OrderState } from '@/types';
import { performOperation } from './syncHelpers';

export const addOne = async (orderItem: Omit<OrderItem, 'id'>): Promise<OrderItem> => {
  const newOrderItem = { ...orderItem, id: crypto.randomUUID() } as OrderItem;
  const result = await performOperation(
    'order',
    'create',
    newOrderItem,
  );
  if (!result.success) throw result.error;
  return newOrderItem;
};

export const updateOne = async (id: string, updates: Partial<OrderItem>): Promise<OrderItem> => {
  const result = await performOperation(
    'order',
    'update',
    { id, ...updates },
  );
  if (!result.success) throw result.error;
  return { id, ...updates } as OrderItem;
};

export const deleteOne = async (id: string): Promise<void> => {
  const result = await performOperation(
    'order',
    'delete',
    { id },
  );
  if (!result.success) throw result.error;
};

export const addToOrder = async (item: Item, quantity: number): Promise<void> => {
  const orderItem = { item, quantity };
  await addOne(orderItem);
};

export const updateOrderItem = async (itemId: string, quantity: number): Promise<void> => {
  await updateOne(itemId, { quantity });
};

export const removeFromOrder = async (itemId: string): Promise<void> => {
  await deleteOne(itemId);
};

export const completeOrder = async (): Promise<void> => {
  const result = await performOperation(
    'order',
    'complete',
    {},
  );
  if (!result.success) throw result.error;
};