"use client";

import { useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';

/**
 * useFinanceRevalidation Hook (Task 10.22 / Faz 30.1)
 * Provides "Stale-while-revalidate" davranışı:
 * - Uygulama ilk yüklenince tek bir fetch (TTL guard kapatıçı çalıştirmaz)
 * - Pencere odaklandığında veya görünebilir olduğunda TTL'e göre yeniler
 * - Sayfa geçişlerinde aynı bileşenler doğrudan fetch çağırmaz,
 *   bu hook merkezi kaynağı yönetir.
 */
export const useFinanceRevalidation = () => {
  const { fetchFinanceData, loading } = useFinanceStore();

  useEffect(() => {
    // Faz 30.1: Uygulama ilk açılışında fetch (TTL geçerli değilse)
    fetchFinanceData();

    const handleFocus = () => {
      if (!loading) {
        fetchFinanceData();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !loading) {
        fetchFinanceData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 5 dakikada bir yenileme (TAB arka planda bile güncel kalması için)
    const interval = setInterval(() => {
      if (!loading) {
        fetchFinanceData(true); // force=true: poll bazlı refresh
      }
    }, 1000 * 60 * 5);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
