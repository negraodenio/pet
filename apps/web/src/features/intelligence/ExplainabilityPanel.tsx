"use client";

import { Sparkles, CheckCircle2, Lightbulb, AlertTriangle, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import type { ReasoningResult } from "@/lib/services/CognitiveReasoningEngine";

/* =========================================================================
   PR-013: Explainability Panel — Transparency & Deterministic Reasoning
   Exposes Evidence, Confidence, Predicted Outcomes, and Recommendations.
   ========================================================================= */

export function ExplainabilityPanel({
  insights,
}: {
  insights: ReasoningResult[];
}) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          AI Insights & Deterministic Reasoning Engine
        </h3>
        <span className="text-xs font-mono text-text-muted flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 100% Explainable
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((item) => {
          const evidenceList = Array.isArray(item.evidence)
            ? (item.evidence as string[])
            : [];
          const confidencePct = Math.round(item.confidence * 100);

          return (
            <div
              key={item.id}
              className="glass-panel p-5 border-indigo-500/20 relative overflow-hidden group hover:border-indigo-500/40 transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.priority === "high" || item.priority === "critical"
                        ? "danger"
                        : item.priority === "medium"
                          ? "warning"
                          : "info"
                    }
                  >
                    {item.priority.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-mono text-indigo-300 capitalize">
                    {item.reasoning_type.replace("_", " ")}
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {confidencePct}% Confidence
                </span>
              </div>

              {/* Title & Summary */}
              <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                {item.summary}
              </p>

              {/* Evidence Section (Explainability) */}
              {evidenceList.length > 0 && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-border/50 mb-3 space-y-1.5">
                  <div className="text-[11px] font-bold text-text-muted font-mono uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="h-3 w-3 text-indigo-400" />
                    Evidence & Sensor Observations:
                  </div>
                  <ul className="space-y-1">
                    {evidenceList.map((ev, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-text-secondary flex items-start gap-1.5 font-mono"
                      >
                        <span className="text-indigo-400 mt-0.5">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Predicted Outcome */}
              {item.predicted_outcome && (
                <div className="text-xs text-purple-300 bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20 mb-3 font-mono">
                  <span className="font-bold text-purple-400">Prediction: </span>
                  {item.predicted_outcome}
                </div>
              )}

              {/* Recommendation */}
              {item.recommendation && (
                <div className="flex items-center justify-between text-xs text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{item.recommendation}</span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
