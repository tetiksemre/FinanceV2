"use client";

import { useCallback } from 'react';

export const useNotifications = () => {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Bu tarayıcı bildirimleri desteklemiyor.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    // 1. Check for browser notification support first
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        ...options
      });
    } else {
      // Fallback: request permission and send
      const hasPermission = await requestPermission();
      if (hasPermission) {
        new Notification(title, {
          icon: '/icons/icon-192x192.png',
          ...options
        });
      }
    }
  }, [requestPermission]);

  return { requestPermission, sendNotification };
};
