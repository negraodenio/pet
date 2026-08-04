import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { formatEventType, severityColor, formatConfidence } from "@/lib/utils";
import { Activity, AlertTriangle, Clock, Filter, Sparkles, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "AI Event Log",
};

// Fallback demo events when database is empty
const demoEvents = [
  {
    id: "demo-ev-1",
    event_type: "eating",
    severity: "info",
    confidence: 0.98,
    pet_name: "Thor",
    recommended_action: "Thor consumed 220g meal (Normal speed).",
    ai_resolved: true,
    created_at: new Date(Date.now() - 60000 * 15).toISOString(),
  },
  {
    id: "demo-ev-2",
    event_type: "barking",
    severity: "warning",
    confidence: 0.94,
    pet_name: "Thor",
    recommended_action: "Barking at delivery door. Autonomous calming audio played.",
    ai_resolved: true,
    created_at: new Date(Date.now() - 60000 * 45).toISOString(),
  },
  {
    id: "demo-ev-3",
    event_type: "anxiety",
    severity: "warning",
    confidence: 0.89,
    pet_name: "Lola",
    recommended_action: "Pacing near door. Played owner recorded voice clip.",
    ai_resolved: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "demo-ev-4",
    event_type: "sleeping",
    severity: "info",
    confidence: 0.99,
    pet_name: "Thor",
    recommended_action: "Continuous sleep (REM) detected in Living Room.",
    ai_resolved: false,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("pet_events")
    .select("*, pets(name, avatar_url, species)")
    .order("created_at", { ascending: false })
    .limit(50);

  const dbEvents = events ?? [];
  const hasRealEvents = dbEvents.length > 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-400" />
            AI Event Log & Telemetry
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time event recognition, posture estimation & autonomous AI resolution history
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <Badge variant="primary" dot pulse>
            {hasRealEvents ? dbEvents.length : demoEvents.length} Recorded Events
          </Badge>
        </div>
      </div>

      {/* Event List */}
      <div className="glass-panel overflow-hidden border-indigo-500/20">
        <div className="divide-y divide-border/60">
          {hasRealEvents
            ? dbEvents.map((event) => {
                const pet = (event as Record<string, unknown>).pets as { name: string } | null;
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 hover:bg-white/[0.03] transition-colors"
                  >
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${
                        event.severity === "critical"
                          ? "bg-rose-500/15 text-rose-400"
                          : event.severity === "warning"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-indigo-500/15 text-indigo-400"
                      }`}
                    >
                      <AlertTriangle className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white">
                          {formatEventType(event.event_type)}
                        </h3>
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
                        {event.ai_resolved && (
                          <Badge variant="success" className="text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Autonomous Resolved
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-text-muted font-mono">
                        Subject: <b>{pet?.name ?? "Unknown"}</b> • Confidence:{" "}
                        {formatConfidence(event.confidence)}
                      </p>

                      {event.recommended_action && (
                        <p className="text-xs text-indigo-300 mt-1">
                          💡 {event.recommended_action}
                        </p>
                      )}

                      <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-text-muted">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(event.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            : demoEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${
                      event.severity === "critical"
                        ? "bg-rose-500/15 text-rose-400"
                        : event.severity === "warning"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-indigo-500/15 text-indigo-400"
                    }`}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white capitalize">
                        {formatEventType(event.event_type)}
                      </h3>
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
                      {event.ai_resolved && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Autonomous Resolved
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-text-muted font-mono">
                      Subject: <b>{event.pet_name}</b> • Confidence:{" "}
                      {formatConfidence(event.confidence)}
                    </p>

                    <p className="text-xs text-indigo-300 mt-1">
                      💡 {event.recommended_action}
                    </p>

                    <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-text-muted">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(event.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
