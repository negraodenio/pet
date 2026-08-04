import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Avatar } from "@/shared/components/ui/Avatar";
import { formatEventType, severityColor, formatConfidence } from "@/lib/utils";
import {
  Dog,
  Camera,
  Activity,
  Bell,
  TrendingUp,
  Clock,
  AlertTriangle,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch dashboard data in parallel
  const [petsResult, devicesResult, eventsResult, notificationsResult] =
    await Promise.all([
      supabase.from("pets").select("*").order("name"),
      supabase.from("devices").select("*").order("name"),
      supabase
        .from("pet_events")
        .select("*, pets(name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("notifications")
        .select("*")
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const pets = petsResult.data ?? [];
  const devices = devicesResult.data ?? [];
  const recentEvents = eventsResult.data ?? [];
  const unreadNotifications = notificationsResult.data ?? [];

  const onlineDevices = devices.filter((d) => d.status === "online").length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Your pet&apos;s AI guardian at a glance
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent-primary/15">
              <Dog className="h-5 w-5 text-accent-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{pets.length}</p>
              <p className="text-xs text-text-secondary">Pets</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-success/15">
              <Camera className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {onlineDevices}/{devices.length}
              </p>
              <p className="text-xs text-text-secondary">Cameras Online</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-warning/15">
              <Activity className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {recentEvents.length}
              </p>
              <p className="text-xs text-text-secondary">Recent Events</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-danger/15">
              <Bell className="h-5 w-5 text-danger" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {unreadNotifications.length}
              </p>
              <p className="text-xs text-text-secondary">Unread Alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Events */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <CardHeader className="px-4 pt-4">
              <CardTitle subtitle="AI-detected activity">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent-primary" />
                  Recent Events
                </div>
              </CardTitle>
              <Link
                href="/dashboard/events"
                className="text-xs text-accent-primary hover:text-accent-glow transition-colors"
              >
                View all →
              </Link>
            </CardHeader>
            <CardContent>
              {recentEvents.length === 0 ? (
                <div className="px-4 pb-4 text-center py-8">
                  <Activity className="h-8 w-8 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">
                    No events detected yet
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Events will appear here once your cameras are connected
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/dashboard/events`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-glass-hover transition-colors"
                    >
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-bg-tertiary shrink-0">
                        <AlertTriangle
                          className={`h-4 w-4 ${severityColor(event.severity)}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {formatEventType(event.event_type)}
                        </p>
                        <p className="text-xs text-text-muted">
                          {(event as Record<string, unknown>).pets &&
                          typeof (event as Record<string, unknown>).pets === "object"
                            ? ((event as Record<string, unknown>).pets as { name: string })?.name
                            : "Unknown pet"}{" "}
                          · Confidence: {formatConfidence(event.confidence)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          event.severity === "critical"
                            ? "danger"
                            : event.severity === "warning"
                              ? "warning"
                              : "info"
                        }
                        dot
                        pulse={event.severity === "critical"}
                      >
                        {event.severity}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pets overview */}
        <div>
          <Card padding="none">
            <CardHeader className="px-4 pt-4">
              <CardTitle subtitle="Quick access">
                <div className="flex items-center gap-2">
                  <Dog className="h-4 w-4 text-accent-primary" />
                  Your Pets
                </div>
              </CardTitle>
              <Link
                href="/dashboard/pets"
                className="text-xs text-accent-primary hover:text-accent-glow transition-colors"
              >
                Manage →
              </Link>
            </CardHeader>
            <CardContent>
              {pets.length === 0 ? (
                <div className="px-4 pb-4 text-center py-8">
                  <Dog className="h-8 w-8 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">No pets yet</p>
                  <Link
                    href="/dashboard/pets"
                    className="text-xs text-accent-primary hover:text-accent-glow mt-1 inline-block"
                  >
                    Add your first pet →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {pets.map((pet) => (
                    <Link
                      key={pet.id}
                      href={`/dashboard/pets/${pet.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-glass-hover transition-colors"
                    >
                      <Avatar src={pet.avatar_url} alt={pet.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">
                          {pet.name}
                        </p>
                        <p className="text-xs text-text-muted capitalize">
                          {pet.breed ?? pet.species}
                        </p>
                      </div>
                      <span className="text-base">
                        {pet.species === "dog" ? "🐕" : "🐈"}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insight card */}
          <Card className="mt-4">
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl gradient-primary shrink-0">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    AI Insight
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Connect your first camera to start receiving AI-powered
                    insights about your pet&apos;s behavior, health, and daily
                    routine.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
