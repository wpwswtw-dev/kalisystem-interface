import { Tag } from '@/types';
import { performOperation } from './syncHelpers';
import { nanoid } from 'nanoid';

export const addOne = async (tag: Omit<Tag, 'id'>) => {
  const id = nanoid();
  const newTag = { ...tag, id };
  
  const result = await performOperation(
    'tag',
    'create',
    newTag,
    // Optional state change handler can be added here
  );

  if (!result.success) {
    throw result.error;
  }

  return newTag;
};

export const updateOne = async (id: string, updates: Partial<Tag>) => {
  const result = await performOperation(
    'tag',
    'update',
    { id, ...updates },
    // Optional state change handler can be added here
  );

  if (!result.success) {
    throw result.error;
  }

  return { id, ...updates } as Tag;
};

export const deleteOne = async (id: string) => {
  const result = await performOperation(
    'tag',
    'delete',
    { id },
    // Optional state change handler can be added here
  );

  if (!result.success) {
    throw result.error;
  }
};