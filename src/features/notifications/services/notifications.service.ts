import { api } from "@/services/api";

export interface Notification { id: string; type: string; title: string; message: string; read: boolean; createdAt: string; contactData?: { name: string; email: string; company?: string | null; phone?: string | null; subject: string; message: string; }; }

export const notificationsService = {
  getAll: async (params?: Record<string, unknown>): Promise<Notification[]> => {
    const response = await api.notifications.list(params);
    return (response as unknown as { data: Notification[] }).data || [];
  },
  markRead: async (id: string) => { await api.notifications.markRead(id); },
  markAllRead: async () => { await api.notifications.markAllRead(); },
};
