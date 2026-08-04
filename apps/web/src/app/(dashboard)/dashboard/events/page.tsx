import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { formatEventType, severityColor, formatConfidence } from "@/lib/utils";
import { Activity, AlertTriangle, Clock, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Events",
};

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Events</h1>
          <p className="text-sm text-text-secondary mt-1">
            AI-detected events across all cameras
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" dot pulse>
            {eventList.length} events
          </Badge>
        </div>
      </div>

      {/* Event List */}
      {eventList.length === 0 ? (
        <EmptyState
          icon={<Activity className="h-8 w-8" />}
          title="No events detected"
          description="Once your cameras are connected, AI-detected events will appear here with video clips, confidence scores, and recommended actions."
        />
      ) : (
        <Card padding="none" hover={false}>
          <div className="divide-y divide-border">
            {eventList.map((event) => {
              const pet = (event as Record<string, unknown>).pets as { name: string; avatar_url: string | null; species: string } | null;
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 hover:bg-glass-hover transition-colors"
                >
                  {/* Severity icon */}
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${
                      event.severity === "critical"
                        ? "bg-danger/15"
                        : event.severity === "warning"
                          ? "bg-warning/15"
                          : "bg-blue-500/15"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-5 w-5 ${severityColor(event.severity)}`}
                    />
                  </div>

                  {/* Event details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-text-primary">
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
                        pulse={event.severity === "critical"}
                      >
                        {event.severity}
                      </Badge>
                      {event.ai_resolved && (
                        <Badge variant="success">AI Resolved</Badge>
                      )}
                    </div>

                    <p className="text-xs text-text-secondary">
                      {pet?.name ?? "Unknown pet"} ·{" "}
                      Confidence: {formatConfidence(event.confidence)}
                    </p>

                    {event.recommended_action && (
                      <p className="text-xs text-accent-primary mt-1">
                        💡 {event.recommended_action}
                      </p>
                    )}

                    <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(event.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>

                  {/* Thumbnail */}
                  {event.thumbnail_url && (
                    <div className="h-16 w-24 rounded-lg bg-bg-tertiary overflow-hidden shrink-0">
                      <img
                        src={event.thumbnail_url}
                        alt={formatEventType(event.event_type)}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
