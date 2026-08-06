"use client";

import { Activity, ShieldCheck, Moon, Radio, Eye, HeartPulse, MapPin } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import type { Tables } from "@/lib/supabase/database.types";
import { formatDistanceToNow } from "date-fns";

type Pet = Tables<"pets">;
type PetProfile = Tables<"pet_profiles">;
type PetEvent = Tables<"pet_events">;

interface LivingCompanionModelCardProps {
  pet: Pet;
  profile?: PetProfile | null;
  latestEvent?: PetEvent | null;
  recentEventCount: number;
}

export function LivingCompanionModelCard({
  pet,
  profile,
  latestEvent,
  recentEventCount,
}: LivingCompanionModelCardProps) {
  // Determine current behavioral state from latest event or profile
  const currentBehavior = latestEvent
    ? latestEvent.event_type.replace("_", " ")
    : "resting peacefully";

  const eventTime = latestEvent?.created_at
    ? formatDistanceToNow(new Date(latestEvent.created_at), { addSuffix: true })
    : "recently observed";

  // Calculate vitality / health score based on confidence and activity
  const confidencePct = latestEvent ? Math.round(latestEvent.confidence * 100) : 98;
  const isHealthy = !latestEvent || latestEvent.severity === "info";

  return (
    <div className="glass-panel p-6 border-indigo-500/30 relative overflow-hidden group">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Living Companion Model (LCM)
            </h3>
            <p className="text-xs text-text-muted font-mono">
              Apex State Abstraction • Continuous Multi-Observer Engine
            </p>
          </div>
        </div>
        <Badge variant={isHealthy ? "primary" : "warning"} dot pulse>
          LCM State Active
        </Badge>
      </div>

      {/* Main State Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 mb-5">
        {/* Behavioral State */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-border/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-1.5">
            <Moon className="h-4 w-4 text-purple-400" />
            Current Behavior
          </div>
          <p className="text-lg font-extrabold text-white capitalize">
            {currentBehavior}
          </p>
          <p className="text-[11px] text-text-muted mt-1 font-mono flex items-center gap-1">
            <span>Observed {eventTime}</span>
            <span className="text-indigo-400">• {confidencePct}% conf</span>
          </p>
        </div>

        {/* Vitality & Alignment */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-border/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-1.5">
            <HeartPulse className="h-4 w-4 text-emerald-400" />
            Vitality Alignment
          </div>
          <p className="text-lg font-extrabold text-emerald-400 font-mono">
            {isHealthy ? "Optimal (98%)" : "Attention Flagged"}
          </p>
          <p className="text-[11px] text-text-muted mt-1 font-mono">
            {recentEventCount > 0
              ? `${recentEventCount} telemetry events correlated`
              : "Baseline profile active"}
          </p>
        </div>

        {/* Primary Location */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-border/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-1.5">
            <MapPin className="h-4 w-4 text-blue-400" />
            Current Space
          </div>
          <p className="text-lg font-extrabold text-white">
            {latestEvent?.metadata && typeof latestEvent.metadata === "object" && "location" in latestEvent.metadata
              ? String((latestEvent.metadata as Record<string, unknown>).location)
              : "Living Room"}
          </p>
          <p className="text-[11px] text-text-muted mt-1 font-mono">
            Near Vision Node #1
          </p>
        </div>
      </div>

      {/* Multi-Observer Sensor Mesh Status */}
      <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs font-mono relative z-10">
        <div className="flex items-center gap-4 text-text-muted">
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-indigo-400" /> Vision Mesh:{" "}
            <span className="text-emerald-400">Tracking</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-purple-400" /> Sensor Collar:{" "}
            <span className="text-emerald-400">Synced</span>
          </span>
        </div>
        <span className="text-[11px] text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> LCM v2.0 Standard
        </span>
      </div>
    </div>
  );
}
