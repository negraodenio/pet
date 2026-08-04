import { create } from "zustand";
import type { Tables } from "@/lib/supabase/database.types";

/* =========================================================================
   Notification Store — Real-time notification state
   ========================================================================= */

interface NotificationState {
  notifications: Tables<"notifications">[];
  unreadCount: number;
  isLoading: boolean;

  setNotifications: (notifications: Tables<"notifications">[]) => void;
  addNotification: (notification: Tables<"notifications">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: true,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read: true,
        read_at: n.read_at || new Date().toISOString(),
      })),
      unreadCount: 0,
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
