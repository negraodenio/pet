import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { formatEventType, formatConfidence } from "@/lib/utils";
import { Activity, AlertTriangle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const metadata = { title: "AI Event Log" };

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("pet_events")
    .select("*, pets(name, avatar_url, species)")
    .order("created_at", { ascending: false })
    .limit(50);

  const eventList = events ?? [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-400" /> Timeline Events
          </h1>
          <p className="text-sm text-text-secondary mt-1">Persisted household observations</p>
        </div>
        <Badge variant="primary">{eventList.length} Recorded Events</Badge>
      </div>

      {eventList.length === 0 ? (
        <EmptyState
          icon={<Activity className="h-8 w-8" />}
          title="No Timeline events"
          description="Events from registered devices will appear here after ingestion."
        />
      ) : (
        <div className="glass-panel overflow-hidden border-indigo-500/20 divide-y divide-border/60">
          {eventList.map((event) => {
            const pet = (event as typeof event & { pets: { name: string } | null }).pets;
            return (
              <div key={event.id} className="flex items-start gap-4 p-4">
                <AlertTriangle className="h-5 w-5 text-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white">{formatEventType(event.event_type)}</h3>
                    <Badge variant={event.severity === "critical" ? "danger" : event.severity === "warning" ? "warning" : "info"}>
                      {event.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted font-mono">
                    Subject: <b>{pet?.name ?? "Unassigned"}</b> - Confidence: {formatConfidence(event.confidence)}
                  </p>
                  {event.recommended_action && <p className="text-xs text-indigo-300 mt-1">{event.recommended_action}</p>}
                  <p className="flex items-center gap-1 mt-2 text-[10px] font-mono text-text-muted">
                    <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
