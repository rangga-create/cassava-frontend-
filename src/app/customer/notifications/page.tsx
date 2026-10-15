"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Bell, CheckCheck, ShoppingCart, Truck, Info } from "lucide-react";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const NOTIFICATION_ICONS: Record<string, any> = {
  NEW_ORDER: ShoppingCart,
  ORDER_CREATED: ShoppingCart,
  ORDER_STATUS_UPDATE: Truck,
  INFO: Info,
  WARNING: Info,
  SUCCESS: CheckCheck,
};

export default function CustomerNotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["customer-notifications"],
    queryFn: async () => {
      const response = await api.get("/notifications", { limit: 50 });
      return response;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/notifications/${id}/read`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch("/notifications/read-all");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-notifications"] });
    },
  });

  const notifications = (notificationsData?.data as any[]) || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-500 text-sm">
            {unreadCount > 0 ? `${unreadCount} unread notification(s)` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium"
          >
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
          <Bell className="h-14 w-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification: any) => {
            const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border p-4 flex items-start gap-3 transition-colors ${
                  notification.read ? "border-gray-200" : "border-primary/20 bg-primary/5"
                }`}
              >
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
                  notification.read ? "bg-gray-100 text-gray-400" : "bg-primary/10 text-primary"
                }`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-medium ${
                      notification.read ? "text-gray-600" : "text-gray-900"
                    }`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markReadMutation.mutate(notification.id)}
                    className="text-xs text-primary hover:text-primary-dark whitespace-nowrap font-medium"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
