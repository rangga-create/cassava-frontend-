"use client";
import { useState } from "react";
import { useNotifications } from "@/features/notifications";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertTriangle, Info, CheckCheck, X, Mail, Phone, Building, MessageSquare } from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  INFO: <Info className="h-4 w-4 text-info" />,
  WARNING: <AlertTriangle className="h-4 w-4 text-warning" />,
  SUCCESS: <CheckCircle className="h-4 w-4 text-success" />,
  ERROR: <AlertTriangle className="h-4 w-4 text-danger" />,
};

function formatTime(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ContactData {
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  subject: string;
  message: string;
}

interface NotificationWithContact {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  contactData?: ContactData;
}

const SUBJECT_LABELS: Record<string, string> = {
  product_inquiry: "Product Inquiry",
  pricing: "Pricing Request",
  bulk_order: "Bulk Order",
  partnership: "Partnership",
  export_consultation: "Export Consultation",
  other: "Other",
};

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, markRead, markAllRead } = useNotifications();
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null);

  const handleNotificationClick = async (notification: NotificationWithContact) => {
    if (!notification.read) {
      await markRead(notification.id);
    }
    if (notification.contactData) {
      setSelectedContact(notification.contactData);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Notifications</h1>
          <p className="text-sm text-text-secondary">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" icon={<CheckCheck className="h-4 w-4" />} onClick={() => markAllRead()}>
            Mark All Read
          </Button>
        )}
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <Bell className="h-10 w-10 text-text-secondary/40 mx-auto mb-3" />
            <p className="text-text-secondary text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => {
              const n = notification as NotificationWithContact;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-5 py-3 hover:bg-background cursor-pointer transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="p-1.5 rounded-md bg-background shrink-0 mt-0.5">
                    {TYPE_ICONS[n.type] || <Info className="h-4 w-4 text-text-secondary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${!n.read ? "text-navy" : "text-text"}`}>{n.title}</p>
                      {!n.read && <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />}
                    </div>
                    <p className="text-sm text-text-secondary mt-0.5">{n.message}</p>
                    <p className="text-xs text-text-secondary mt-1">{formatTime(n.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedContact(null)}>
          <div className="bg-surface rounded-lg border border-border shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-navy">Contact Form Details</h2>
              <button onClick={() => setSelectedContact(null)} className="p-1 hover:bg-background rounded-md transition-colors">
                <X className="h-5 w-5 text-text-secondary" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-wide">Subject</p>
                  <p className="text-sm font-medium text-text">{SUBJECT_LABELS[selectedContact.subject] || selectedContact.subject}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-wide">From</p>
                  <p className="text-sm font-medium text-text">{selectedContact.name}</p>
                  <a href={`mailto:${selectedContact.email}`} className="text-sm text-primary hover:underline">{selectedContact.email}</a>
                </div>
              </div>

              {selectedContact.company && (
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                    <Building className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase tracking-wide">Company</p>
                    <p className="text-sm font-medium text-text">{selectedContact.company}</p>
                  </div>
                </div>
              )}

              {selectedContact.phone && (
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase tracking-wide">Phone</p>
                    <a href={`tel:${selectedContact.phone}`} className="text-sm font-medium text-text hover:text-primary">{selectedContact.phone}</a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-text-secondary uppercase tracking-wide">Message</p>
                  <p className="text-sm text-text mt-1 whitespace-pre-wrap leading-relaxed bg-background rounded-md p-3 border border-border">{selectedContact.message}</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end">
              <a
                href={`mailto:${selectedContact.email}?subject=Re: ${SUBJECT_LABELS[selectedContact.subject] || selectedContact.subject}`}
                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                <Mail className="h-4 w-4" /> Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
