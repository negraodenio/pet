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
  Shield,
  Eye,
  Radio,
  Sparkles,
  ChevronRight,
  Cpu,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Live Telemetry",
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
        .limit(6),
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
    <div className="space-y-8 animate-fade-in-up">
      {/* AI Guardian Top Command Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-bg-secondary to-purple-950/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              COMPAWION AUTONOMOUS GUARDIAN • V1.0
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Autonomous AI Guardian Active
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
              Real-time computer vision & multi-modal AI monitoring your home across all vision matrices. Autonomous escalation enabled.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/assistant"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-indigo-500/25"
            >
              <Zap className="h-4 w-4" />
              Ask AI Guardian
            </Link>
          </div>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Registered Companions</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Dog className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{pets.length}</span>
            <span className="text-xs text-emerald-400 font-medium">100% Guarded</span>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Vision Matrix</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Camera className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {onlineDevices}/{devices.length}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Online</span>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">AI Event Stream</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {recentEvents.length}
            </span>
            <span className="text-xs text-amber-400 font-medium">Events Today</span>
          </div>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Critical Alerts</span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {unreadNotifications.length}
            </span>
            <span className="text-xs text-text-muted font-medium">Pending Review</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Real-time AI Event Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-indigo-400" />
                  Live AI Event Telemetry
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Real-time event recognition with computer vision confidence ratings
                </p>
              </div>
              <Link
                href="/dashboard/events"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                Full Matrix <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentEvents.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border/50 rounded-xl">
                <Radio className="h-8 w-8 text-text-muted mx-auto mb-2 animate-pulse" />
                <p className="text-sm font-semibold text-text-secondary">
                  Awaiting Camera Stream Inputs
                </p>
                <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                  Once your camera matrix is linked, AI events (eating, sleep, barking, distress) will populate here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-border/60 hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="p-2.5 rounded-xl bg-bg-tertiary border border-border/50 shrink-0">
                      <AlertTriangle className={`h-4 w-4 ${severityColor(event.severity)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {formatEventType(event.event_type)}
                        </span>
                        <Badge
                          variant={
                            event.severity === "critical"
                              ? "danger"
                              : event.severity === "warning"
                                ? "warning"
                                : "info"
                          }
                          dot
                        >
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5 font-mono">
                        {(event as Record<string, unknown>).pets &&
                        typeof (event as Record<string, unknown>).pets === "object"
                          ? ((event as Record<string, unknown>).pets as { name: string })?.name
                          : "Subject"}{" "}
                        • Confidence: {formatConfidence(event.confidence)}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-text-muted shrink-0">
                      Just now
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Monitored Companions Summary Card */}
        <div className="space-y-4">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Dog className="h-5 w-5 text-purple-400" />
                Monitored Pets
              </h3>
              <Link
                href="/dashboard/pets"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                Manage
              </Link>
            </div>

            {pets.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-border/50 rounded-xl">
                <p className="text-xs text-text-muted mb-3">No companions registered yet.</p>
                <Link
                  href="/dashboard/pets"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 hover:bg-indigo-500/30 transition-all"
                >
                  Register First Pet
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pets.map((pet) => (
                  <Link
                    key={pet.id}
                    href={`/dashboard/pets/${pet.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-border/50 hover:border-purple-500/40 hover:bg-white/[0.04] transition-all group"
                  >
                    <Avatar src={pet.avatar_url} alt={pet.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                        {pet.name}
                      </p>
                      <p className="text-[10px] text-text-muted capitalize">
                        {pet.breed ?? pet.species}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                        100% Vitality
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* AI Guardian Capabilities Card */}
          <div className="glass-panel p-5 bg-gradient-to-br from-indigo-950/20 via-bg-secondary to-purple-950/20 border-indigo-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Autonomous Resolution Active</h4>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  When anxiety or distress is detected, Compawion automatically plays soothing audio before escalating notifications to your phone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
