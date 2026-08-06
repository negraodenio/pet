"use client";

import { Activity, HeartPulse, MapPin, Moon } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import type { Tables } from "@/lib/supabase/database.types";
import { formatDistanceToNow } from "date-fns";

type Pet = Tables<"pets">;
type LCMState = Tables<"living_companion_models">;

interface LivingCompanionModelCardProps {
  pet: Pet;
  lcm: LCMState | null;
  recentEventCount: number;
}

export function LivingCompanionModelCard({
  pet,
  lcm,
  recentEventCount,
}: LivingCompanionModelCardProps) {
  if (!lcm) {
    return (
      <div className="glass-panel p-6 border-indigo-500/30">
        <h3 className="text-base font-bold text-white">Living Companion Model (LCM)</h3>
        <p className="mt-2 text-sm text-text-muted">
          No current LCM state is available for {pet.name} yet.
        </p>
      </div>
    );
  }

  const confidencePct = Math.round(lcm.confidence * 100);
  const updatedAt = formatDistanceToNow(new Date(lcm.updated_at), { addSuffix: true });

  return (
    <div className="glass-panel p-6 border-indigo-500/30">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Living Companion Model (LCM)</h3>
            <p className="text-xs text-text-muted font-mono">Current persisted companion state</p>
          </div>
        </div>
        <Badge variant={lcm.health_score >= 80 ? "primary" : "warning"}>
          {lcm.health_score >= 80 ? "Current" : "Attention"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-border/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-1.5">
            <Moon className="h-4 w-4 text-purple-400" /> Current Behavior
          </div>
          <p className="text-lg font-extrabold text-white capitalize">
            {lcm.current_behavior.replace("_", " ")}
          </p>
          <p className="text-[11px] text-text-muted mt-1 font-mono">
            Updated {updatedAt} - {confidencePct}% confidence
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-border/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-1.5">
            <HeartPulse className="h-4 w-4 text-emerald-400" /> Vitality
          </div>
          <p className="text-lg font-extrabold text-emerald-400 font-mono">
            {lcm.vitality_score}%
          </p>
          <p className="text-[11px] text-text-muted mt-1 font-mono">
            {recentEventCount} correlated Timeline event{recentEventCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-border/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-1.5">
            <MapPin className="h-4 w-4 text-blue-400" /> Current Space
          </div>
          <p className="text-lg font-extrabold text-white">{lcm.current_room}</p>
          <p className="text-[11px] text-text-muted mt-1 font-mono">Persisted LCM location</p>
        </div>
      </div>
    </div>
  );
}
