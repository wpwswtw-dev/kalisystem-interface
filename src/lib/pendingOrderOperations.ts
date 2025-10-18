import { PendingOrder, PendingOrderItem } from '@/types';
import { nanoid } from 'nanoid';
import { performOperation } from './syncHelpers';
import { PendingOrderOperations } from '@/types/sync';

export const addOne = async (order: Omit<PendingOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PendingOrder> => {
  const newOrder = {
    ...order,
    id: nanoid(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PendingOrder;

  const result = await performOperation(
    'pendingOrder',
    'create',
    newOrder,
  );
  if (!result.success) throw result.error;
  return newOrder;
};

export const updateOne = async (id: string, updates: Partial<PendingOrder>): Promise<PendingOrder> => {
  const updatedOrder = {
    ...updates,
    id,
    updatedAt: new Date(),
  } as PendingOrder;

  const result = await performOperation(
    'pendingOrder',
    'update',
    updatedOrder,
  );
  if (!result.success) throw result.error;
  return updatedOrder;
};

export const deleteOne = async (id: string): Promise<void> => {
  const result = await performOperation(
    'pendingOrder',
    'delete',
    { id },
  );
  if (!result.success) throw result.error;
};