import type { SyncOperation, AsyncOperationResult } from '@/types/sync';
import { offlineQueue } from './offlineQueue';

export async function performSync<T>(
  operation: Pick<SyncOperation, 'type' | 'entity' | 'data'>,
  onStateChange?: (loading: boolean, error: string | null) => void
): Promise<AsyncOperationResult> {
  try {
    onStateChange?.(true, null);
    await offlineQueue.enqueue(operation);
    onStateChange?.(false, null);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    onStateChange?.(false, errorMessage);
    return { success: false, error: new Error(errorMessage) };
  }
}

export async function performOperation<T>(
  entityType: SyncOperation['entity'],
  operationType: SyncOperation['type'],
  data: T,
  onStateChange?: (loading: boolean, error: string | null) => void
): Promise<AsyncOperationResult> {
  return performSync(
    { type: operationType, entity: entityType, data },
    onStateChange
  );
}

// Convenience functions for state updates
export const setLocalData = <T extends { id: string }>(
  data: T[],
  setData: (fn: (prev: T[]) => T[]) => void,
  onSuccess: () => void,
  onError: (error: Error) => void
) => ({
  addOne: (newItem: T) => {
    try {
      setData(prev => [...prev, newItem]);
      onSuccess();
    } catch (error) {
      onError(error as Error);
      setData(prev => prev.filter(item => item.id !== newItem.id));
      throw error;
    }
  },
  updateOne: (id: string, updates: Partial<T>) => {
    const currentItem = data.find(item => item.id === id);
    if (!currentItem) throw new Error('Item not found');

    try {
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      onSuccess();
    } catch (error) {
      onError(error as Error);
      setData(prev => prev.map(item =>
        item.id === id ? currentItem : item
      ));
      throw error;
    }
  },
  deleteOne: (id: string) => {
    const deletedItem = data.find(item => item.id === id);
    if (!deletedItem) throw new Error('Item not found');

    try {
      setData(prev => prev.filter(item => item.id !== id));
      onSuccess();
    } catch (error) {
      onError(error as Error);
      setData(prev => [...prev, deletedItem]);
      throw error;
    }
  }
});