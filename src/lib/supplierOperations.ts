import { Supplier } from '@/types';
import { performOperation } from './syncHelpers';
import { nanoid } from 'nanoid';

export const addOne = async (supplier: Omit<Supplier, 'id'>) => {
  const id = nanoid();
  const newSupplier: Supplier = {
    ...supplier,
    id,
    defaultOrderType: supplier.defaultOrderType || 'Delivery',
    defaultPaymentMethod: supplier.defaultPaymentMethod || 'COD',
  };
  
  const result = await performOperation(
    'supplier',
    'create',
    newSupplier,
    // Optional state change handler can be added here
  );

  if (!result.success) {
    throw result.error;
  }

  return newSupplier;
};

export const updateOne = async (id: string, updates: Partial<Supplier>) => {
  const result = await performOperation(
    'supplier',
    'update',
    { id, ...updates },
    // Optional state change handler can be added here
  );

  if (!result.success) {
    throw result.error;
  }

  return { id, ...updates } as Supplier;
};

export const deleteOne = async (id: string) => {
  const result = await performOperation(
    'supplier',
    'delete',
    { id },
    // Optional state change handler can be added here
  );

  if (!result.success) {
    throw result.error;
  }
};