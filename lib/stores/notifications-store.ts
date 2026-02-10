import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
  read?: boolean;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  subscribeWithSelector((set) => ({
    notifications: [],
    unreadCount: 0,

    addNotification: (notification) =>
      set((state) => {
        const newNotification: Notification = {
          ...notification,
          id: `${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          read: false,
        };
        return {
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        };
      }),

    removeNotification: (id) =>
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: notification?.read === false ? state.unreadCount - 1 : state.unreadCount,
        };
      }),

    markAsRead: (id) =>
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        if (!notification || notification.read) return state;

        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: state.unreadCount - 1,
        };
      }),

    clearAll: () =>
      set({
        notifications: [],
        unreadCount: 0,
      }),
  }))
);
