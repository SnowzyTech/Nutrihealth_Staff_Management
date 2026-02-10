import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

export interface UIState {
  sidebarOpen: boolean;
  notifications: Notification[];
  loading: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  addNotification: (type: NotificationType, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  notifications: [],
  loading: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  addNotification: (type, message, duration = 5000) => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { id, type, message, duration }],
    }));
    
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),

  clearNotifications: () => set({ notifications: [] }),

  setLoading: (loading) => set({ loading }),
}));
