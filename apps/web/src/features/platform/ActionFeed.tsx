"use client";

import { useState } from "react";
import { Zap, CheckCircle2, XCircle, Clock, ShieldAlert, Play, Bell } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import type { CompanionAction } from "@/lib/services/ActionEngine";
import { approveActionServer, rejectActionServer } from "@/server/actions/cae";

/* =========================================================================
   PR-014: Action Feed Component — Executed Actions & Guardian Approvals
   ========================================================================= */

export function ActionFeed({ actions }: { actions: CompanionAction[] }) {
  const [actionList, setActionList] = useState(actions);

  const handleApprove = async (id: string) => {
    const res = await approveActionServer(id);
    if (res.success) {
      setActionList((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "completed" } : a)),
      );
    }
  };

  const handleReject = async (id: string) => {
    const res = await rejectActionServer(id);
    if (res.success) {
      setActionList((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)),
      );
    }
  };

  if (actionList.length === 0) return null;

  return (
    <div className="glass-panel p-6 border-emerald-500/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-400" />
            Companion Action Engine (CAE Executions)
          </h3>
          <p className="text-xs text-text-muted font-mono mt-0.5">
            Autonomous hardware & notification actions
          </p>
        </div>
        <Badge variant="success">Closed Loop Active</Badge>
      </div>

      <div className="space-y-3">
        {actionList.map((act) => {
          const isPendingApproval = act.status === "pending";
          const isCompleted = act.status === "completed";
          const isRejected = act.status === "cancelled";

          return (
            <div
              key={act.id}
              className={`p-4 rounded-2xl border transition-all ${
                isPendingApproval
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-white/[0.02] border-border/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-bg-tertiary border border-border/50 text-emerald-400">
                    {isPendingApproval ? (
                      <ShieldAlert className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Play className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">
                      {act.action_type}
                    </h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Priority: {act.priority.toUpperCase()} • Created{" "}
                      {new Date(act.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isPendingApproval && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReject(act.id)}
                        icon={<XCircle className="h-3.5 w-3.5 text-rose-400" />}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(act.id)}
                        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      >
                        Approve
                      </Button>
                    </div>
                  )}

                  {isCompleted && <Badge variant="success">Completed</Badge>}
                  {isRejected && <Badge variant="danger">Cancelled</Badge>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
