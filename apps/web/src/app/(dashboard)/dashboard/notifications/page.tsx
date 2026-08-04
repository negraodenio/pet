import { createClient } from "@/lib/supabase/server";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Bell, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MarkAllReadButton } from "@/features/notifications/components/MarkAllReadButton";

export const metadata = {
  title: "Alert Center",
};

// Fallback demo notifications when database is empty
const demoNotifications = [
  {
    id: "notif-1",
    title: "Possible Anxiety Event — Action Executed",
    body: "Lola was pacing near the front door. AI played recorded voice clip. Behavioral response: Calmed within 2 mins.",
    priority: "medium",
    read: false,
    created_at: new Date(Date.now() - 60000 * 20).toISOString(),
  },
  {
    id: "notif-2",
    title: "Barking Resolution",
    body: "Thor barked 4 times at front door. AI played soothing ambient music track. Barking stopped.",
    priority: "medium",
    read: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "notif-3",
    title: "Hydration Milestone Reached",
    body: "Thor reached 100% of his daily recommended water intake (450ml).",
    priority: "low",
    read: true,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

export default async function NotificationsPage() {
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*, pet_events(event_type, severity)")
    .order("created_at", { ascending: false })
    .limit(50);

  const dbNotifications = notifications ?? [];
  const hasRealNotifications = dbNotifications.length > 0;
  const notificationList = hasRealNotifications ? dbNotifications : demoNotifications;
  const unreadCount = notificationList.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Bell className="h-6 w-6 text-indigo-400" />
            Alert Center
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""} pending review`
              : "All system alerts clear!"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {/* Notifications List */}
      <div className="glass-panel overflow-hidden border-indigo-500/20">
        <div className="divide-y divide-border/60">
          {notificationList.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 transition-colors ${
                !notification.read
                  ? "bg-indigo-500/[0.06] hover:bg-indigo-500/[0.1]"
                  : "hover:bg-white/[0.02]"
              }`}
            >
              <div
                className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${
                  notification.priority === "critical"
                    ? "bg-rose-500/15 text-rose-400"
                    : notification.priority === "high"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-indigo-500/15 text-indigo-400"
                }`}
              >
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white">
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-indigo-400 shrink-0 animate-ping" />
                  )}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {notification.body}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-text-muted">
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
      </div>
    </div>
  );
}
