import { createClient } from "@/lib/supabase/server";
import { TimelineService } from "@/lib/services/TimelineService";
import { CognitiveReasoningEngine } from "@/lib/services/CognitiveReasoningEngine";
import { ExplainabilityPanel } from "@/features/intelligence/ExplainabilityPanel";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import {
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatEventType, formatConfidence } from "@/lib/utils";

export const metadata = {
  title: "Home",
};

export default async function DashboardHomePage() {
  const supabase = await createClient();

  const [petsResult, devicesResult, timelineEvents, topInsights] = await Promise.all([
    supabase.from("pets").select("*").order("name"),
    supabase.from("devices").select("*").order("name"),
    TimelineService.getTimeline(15).catch(() => []),
    CognitiveReasoningEngine.getTopHouseholdInsights(3).catch(() => []),
  ]);

  const dbPets = petsResult.data ?? [];
  const activePet = dbPets[0] ?? {
    id: "lola",
    name: "Lola",
    species: "dog",
    breed: "Golden Retriever",
    avatar_url: null,
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Mantra Quote */}
      <div className="text-center py-2">
        <p className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold mb-1">
          Compawion OS Core
        </p>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white">
          &ldquo;We are not building cameras or IoT devices. We are building
          companion intelligence.&rdquo;
        </h1>
      </div>

      {/* Hero Guardian Status Overview */}
      <div className="glass-panel p-6 sm:p-8 border-indigo-500/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <Avatar src={activePet.avatar_url} alt={activePet.name} size="xl" />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-white">
                  {activePet.name} is safe and resting
                </h2>
                <Badge variant="success" dot pulse>
                  Optimal Health Index
                </Badge>
              </div>
              <p className="text-xs text-text-secondary mt-1 font-mono">
                {activePet.breed ?? "Companion"} • Multi-Observer Cognitive Engine
                Active
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-text-muted font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" /> 100% Peace of Mind
                </span>
                <span>•</span>
                <span>Living Room Node Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Link
              href="/dashboard/companion"
              className="flex-1 lg:flex-initial"
            >
              <button className="w-full px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" /> View Companion Center
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* CRE Top Household Live Insights */}
      {topInsights.length > 0 && <ExplainabilityPanel insights={topInsights} />}

      {/* Real Cognitive Timeline Feed */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Cognitive Event Stream
            </h3>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              Real-time multi-observer event timeline
            </p>
          </div>
          <Link
            href="/dashboard/events"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 font-bold"
          >
            View All Events <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {timelineEvents.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <Clock className="h-8 w-8 mx-auto mb-2 text-indigo-400/50" />
            <p className="text-sm font-semibold text-white">
              No timeline events logged yet today
            </p>
            <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
              Events detected by connected cameras, sensors, and hardware will
              automatically stream into this timeline in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {timelineEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-border/50 hover:border-indigo-500/30 transition-all"
              >
                <div className="p-3 rounded-xl bg-bg-tertiary border border-border/50 shrink-0">
                  <span className="text-xl">
                    {evt.event_type === "sleeping"
                      ? "🌙"
                      : evt.event_type === "eating"
                        ? "🥣"
                        : evt.event_type === "drinking"
                          ? "💧"
                          : evt.event_type === "barking"
                            ? "🗣️"
                            : "🐾"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white capitalize">
                        {evt.title ?? formatEventType(evt.event_type)}
                      </h4>
                      <Badge
                        variant={
                          evt.severity === "critical"
                            ? "danger"
                            : evt.severity === "warning"
                              ? "warning"
                              : "info"
                        }
                      >
                        {formatConfidence(evt.confidence)} Confidence
                      </Badge>
                      <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 capitalize">
                        {evt.source}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-text-muted">
                      {new Date(evt.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {evt.description ?? evt.recommended_action ?? "Event logged by Cognitive Timeline Engine."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
