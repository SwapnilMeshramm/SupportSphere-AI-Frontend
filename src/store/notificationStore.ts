import { create } from "zustand";
import { getUserNotifications, markNotificationRead } from "../services/userService";
import { Notification } from "../types/user";

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (userId: number) => Promise<void>;
  markAsRead: (userId: number, notificationId: number) => Promise<void>;
  markAllAsRead: (userId: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetchNotifications: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await getUserNotifications(userId);
      set({ notifications, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || "Failed to load notifications", isLoading: false });
    }
  },

  markAsRead: async (userId, notificationId) => {
    await markNotificationRead(userId, notificationId);
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    }));
  },

  markAllAsRead: async (userId) => {
    const unread = get().notifications.filter((notification) => !notification.read);
    await Promise.all(unread.map((notification) => markNotificationRead(userId, notification.id)));
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
    }));
  },
}));
