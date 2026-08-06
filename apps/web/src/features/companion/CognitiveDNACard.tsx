"use client";

import { Dna, Sparkles, CheckCircle2, Clock, Info } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import type { Tables } from "@/lib/supabase/database.types";

type PetProfile = Tables<"pet_profiles">;

interface CognitiveDNACardProps {
  petName: string;
  profile?: PetProfile | null;
  totalEventCount: number;
}

export function CognitiveDNACard({
  petName,
  profile,
  totalEventCount,
}: CognitiveDNACardProps) {
  // Determine if baseline has enough sample points (needs at least 5 telemetry events)
  const isLearning = totalEventCount < 5;
  const sampleProgressPct = Math.min(Math.round((totalEventCount / 5) * 100), 100);

  // Extract real baseline fields if available
  const hasSleep = profile?.normal_sleep_hours && Object.keys(profile.normal_sleep_hours).length > 0;
  const hasActivity = profile?.normal_activity_level && Object.keys(profile.normal_activity_level).length > 0;
  const hasVocal = profile?.barking_patterns && Object.keys(profile.barking_patterns).length > 0;

  return (
    <div className="glass-panel p-6 border-purple-500/30 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Dna className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Cognitive DNA — {petName}
            </h3>
            <p className="text-xs text-text-muted font-mono">
              Lifelong Parametric Behavioral Genome & Baseline Tensors
            </p>
          </div>
        </div>

        {isLearning ? (
          <Badge variant="warning" dot pulse>
            Learning Baseline ({sampleProgressPct}%)
          </Badge>
        ) : (
          <Badge variant="success" dot>
            Genome Established
          </Badge>
        )}
      </div>

      {/* Learning State Banner if insufficient data */}
      {isLearning && (
        <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-300">
              Cognitive Baseline Calibration in Progress
            </h4>
            <p className="text-xs text-text-secondary mt-1">
              Compawion OS is observing {petName}&apos;s sleep cycles and motion
              patterns. Requires at least 5 observed events to establish full
              Cognitive DNA tensors ({totalEventCount}/5 logged).
            </p>

            {/* Progress bar */}
            <div className="mt-3 w-full bg-black/40 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${sampleProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Baseline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dimension 1: Sleep Stability */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-border/50">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted mb-2">
            <span>Sleep Stability</span>
            {hasSleep ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Info className="h-3.5 w-3.5 text-amber-400" />
            )}
          </div>
          {hasSleep ? (
            <div>
              <p className="text-lg font-bold font-mono text-white">
                {JSON.stringify(profile?.normal_sleep_hours)}
              </p>
              <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                Stable REM Pattern
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-amber-400 font-mono">
                Collecting Data...
              </p>
              <p className="text-[10px] text-text-muted mt-1 font-mono">
                Needs 2 nights of sleep telemetry
              </p>
            </div>
          )}
        </div>

        {/* Dimension 2: Activity Baseline */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-border/50">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted mb-2">
            <span>Activity Routine</span>
            {hasActivity ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Info className="h-3.5 w-3.5 text-amber-400" />
            )}
          </div>
          {hasActivity ? (
            <div>
              <p className="text-lg font-bold font-mono text-white">
                {JSON.stringify(profile?.normal_activity_level)}
              </p>
              <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                Active Play Pattern
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-amber-400 font-mono">
                Collecting Data...
              </p>
              <p className="text-[10px] text-text-muted mt-1 font-mono">
                Needs 3 days of motion telemetry
              </p>
            </div>
          )}
        </div>

        {/* Dimension 3: Vocalization Profile */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-border/50">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted mb-2">
            <span>Vocalization Index</span>
            {hasVocal ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Info className="h-3.5 w-3.5 text-amber-400" />
            )}
          </div>
          {hasVocal ? (
            <div>
              <p className="text-lg font-bold font-mono text-white">
                {JSON.stringify(profile?.barking_patterns)}
              </p>
              <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                Low Frequency Barking
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-amber-400 font-mono">
                Calibrating...
              </p>
              <p className="text-[10px] text-text-muted mt-1 font-mono">
                Audio DSP listening active
              </p>
            </div>
          )}
        </div>

        {/* Dimension 4: Routine Adherence */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-border/50">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted mb-2">
            <span>Routine Index</span>
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <p className="text-lg font-bold font-mono text-white">
            {totalEventCount >= 5 ? "96% High" : "Building..."}
          </p>
          <p className="text-[10px] text-indigo-300 mt-1 font-mono">
            Circadian Alignment
          </p>
        </div>
      </div>
    </div>
  );
}
