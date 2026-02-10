'use client';

import { useEffect } from 'react';
import { useNotificationsStore } from '@/lib/stores/notifications-store';
import { Toaster, toast } from 'sonner';

export function NotificationsToast() {
  const notifications = useNotificationsStore((state) => state.notifications);
  const removeNotification = useNotificationsStore((state) => state.removeNotification);

  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.type === 'success') {
        toast.success(notification.title, { description: notification.message });
      } else if (notification.type === 'error') {
        toast.error(notification.title, { description: notification.message });
      } else if (notification.type === 'warning') {
        toast.warning(notification.title, { description: notification.message });
      } else {
        toast.info(notification.title, { description: notification.message });
      }

      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);

  return <Toaster position="top-right" richColors />;
}
