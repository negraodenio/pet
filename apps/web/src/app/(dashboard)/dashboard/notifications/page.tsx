import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Bell, Check, CheckCheck, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MarkAllReadButton } from "@/features/notifications/components/MarkAllReadButton";

export const metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*, pet_events(event_type, severity)")
    .order("created_at", { ascending: false })
    .limit(50);

  const notificationList = notifications ?? [];
  const unreadCount = notificationList.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
          <p className="text-sm text-text-secondary mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {notificationList.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="No notifications"
          description="When your AI detects important events, you'll see notifications here with video clips and recommended actions."
        />
      ) : (
        <Card padding="none" hover={false}>
          <div className="divide-y divide-border">
            {notificationList.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 transition-colors ${
                  !notification.read ? "bg-accent-primary/5" : "hover:bg-glass-hover"
                }`}
              >
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${
                    notification.priority === "critical"
                      ? "bg-danger/15"
                      : notification.priority === "high"
                        ? "bg-warning/15"
                        : "bg-accent-primary/15"
                  }`}
                >
                  <Bell
                    className={`h-5 w-5 ${
                      notification.priority === "critical"
                        ? "text-danger"
                        : notification.priority === "high"
                          ? "text-warning"
                          : "text-accent-primary"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-accent-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-text-secondary">{notification.body}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <Badge
                  variant={
                    notification.priority === "critical"
                      ? "danger"
                      : notification.priority === "high"
                        ? "warning"
                        : notification.priority === "medium"
                          ? "primary"
                          : "default"
                  }
                >
                  {notification.priority}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
