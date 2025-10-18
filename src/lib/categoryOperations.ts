import { Category } from '@/types';
import { performOperation } from './syncHelpers';
import { nanoid } from 'nanoid';

export const addOne = async (category: Omit<Category, 'id'>) => {
  const id = nanoid();
  const newCategory = { ...category, id };
  
  const result = await performOperation(
    'category',
    'create',
    newCategory,
    // Optional state change handler can be added here
  );

  if (!result.success) {
    throw result.error;
  }

  return newCategory;
};

export const updateOne = async (id: string, updates: Partial<Category>) => {
  const result = await performOperation(
    'category',
    'update',
    { id, ...updates },
    // Optional state change handler can be added here
  );

  if (!result.success) {
    throw result.error;
  }

  return { id, ...updates } as Category;
};

export const deleteOne = async (id: string) => {
  const result = await performOperation(
    'category',
    'delete',
    { id },
    // Optional state change handler can be added here
  );

  if (!result.success) {
    throw result.error;
  }
};