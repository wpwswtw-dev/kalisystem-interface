import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { offlineQueue } from '@/lib/offlineQueue';
import type { SyncState } from '@/types/sync';

interface SyncStatus {
  isOffline: boolean;
  lastSynced: Date | null;
  error: Error | null;
  hasPendingChanges: boolean;
  queueLength: number;
}

interface SyncContextType {
  status: SyncStatus;
  triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>({
    isOffline: !navigator.onLine,
    lastSynced: null,
    error: null,
    hasPendingChanges: false,
    queueLength: 0
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      setStatus(prev => ({
        ...prev,
        isOffline: !navigator.onLine
      }));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe((queue) => {
      setStatus(prev => ({
        ...prev,
        hasPendingChanges: queue.length > 0,
        queueLength: queue.length
      }));
    });

    return unsubscribe;
  }, []);

  const triggerSync = async () => {
    if (status.isOffline) return;

    try {
      await offlineQueue.processQueue();
      setStatus(prev => ({
        ...prev,
        lastSynced: new Date(),
        error: null
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error(String(error))
      }));
    }
  };

  return (
    <SyncContext.Provider value={{ status, triggerSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return context;
}