import { useEffect, useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const syncOfflineTransactions = useFinanceStore((state) => state.syncOfflineTransactions);
  const offlineQueue = useFinanceStore((state) => state.offlineQueue);

  useEffect(() => {
    setIsMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineTransactions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine && offlineQueue.length > 0) {
      syncOfflineTransactions();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineTransactions, offlineQueue]);

  return { isOnline, isMounted, offlineCount: offlineQueue.length };
};
