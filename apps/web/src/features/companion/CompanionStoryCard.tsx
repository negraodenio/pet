"use client";

import { Sparkles, Calendar, ArrowRight, Heart, Bookmark } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import { formatEventType, severityColor, formatConfidence } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/database.types";
import Link from "next/link";

type PetEvent = Tables<"pet_events">;

interface CompanionStoryCardProps {
  petName: string;
  events: PetEvent[];
}

export function CompanionStoryCard({ petName, events }: CompanionStoryCardProps) {
  // Generate daily story recap summary from recent events
  const totalEvents = events.length;
  const criticalEvents = events.filter((e) => e.severity === "critical").length;
  const warningEvents = events.filter((e) => e.severity === "warning").length;

  let summaryText = `${petName} is having a peaceful, balanced day with optimal activity and sleep rest cycles.`;
  if (criticalEvents > 0) {
    summaryText = `${petName} had ${criticalEvents} critical event flagged today requiring guardian attention.`;
  } else if (warningEvents > 0) {
    summaryText = `${petName} showed mild behavioral variation today. No emergency, but worth observing.`;
  }

  return (
    <div className="space-y-6">
      {/* Guardian Story Highlight Banner */}
      <div className="glass-panel p-6 border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-indigo-300 flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Today&apos;s Guardian Story — {petName}
          </span>
          <span className="text-[11px] font-mono text-text-muted">
            AI Digest Summary
          </span>
        </div>
        <p className="text-sm sm:text-base text-white leading-relaxed font-medium">
          &ldquo;{summaryText}&rdquo;
        </p>

        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-text-muted font-mono">
          <span>{totalEvents} observations recorded today</span>
          <Link
            href="/dashboard/events"
            className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-semibold"
          >
            Full Cognitive Timeline <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent AI Observations Grid */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-purple-400" />
            Recent AI Observations — {petName}
          </h3>
          <Badge variant="outline" className="text-[10px]">
            Live Event Stream
          </Badge>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            <Heart className="h-8 w-8 mx-auto mb-2 text-indigo-400/50" />
            <p className="text-sm">No events logged yet for {petName}.</p>
            <p className="text-xs mt-1">
              Events detected by connected cameras and sensors will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/[0.02] border border-border/50 hover:border-indigo-500/30 transition-all"
              >
                <div className="p-2.5 rounded-xl bg-bg-tertiary border border-border/50 shrink-0 mt-0.5">
                  <span className="text-lg">
                    {event.event_type === "sleeping"
                      ? "🌙"
                      : event.event_type === "eating"
                        ? "🥣"
                        : event.event_type === "drinking"
                          ? "💧"
                          : event.event_type === "barking"
                            ? "🗣️"
                            : "🐾"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white capitalize">
                        {formatEventType(event.event_type)}
                      </span>
                      <Badge variant={event.severity === "critical" ? "danger" : event.severity}>
                        {formatConfidence(event.confidence)} Confidence
                      </Badge>
                    </div>
                    <span className="text-[11px] font-mono text-text-muted">
                      {new Date(event.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {event.recommended_action && (
                    <p className="text-xs text-text-secondary">
                      {event.recommended_action}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
