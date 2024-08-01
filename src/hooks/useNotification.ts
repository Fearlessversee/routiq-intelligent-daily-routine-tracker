import { useState, useEffect, useCallback } from 'react';

export const useNotification = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'routine-reminder',
        requireInteraction: true
      });
    }
  }, [permission]);

  return {
    permission,
    requestPermission,
    sendNotification
  };
};
