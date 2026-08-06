import { createClient } from "@/lib/supabase/server";
import { TimelineService } from "@/lib/services/TimelineService";
import {
  DevicePlugin,
  TabletPlugin,
  NotificationPlugin,
  MockMatterPlugin,
  MockONVIFPlugin,
  MockFeederPlugin,
} from "@/lib/plugins/DevicePlugin";
import type { Tables, InsertTables, Json } from "@/lib/supabase/database.types";

/* =========================================================================
   PR-014: Companion Action Engine (CAE) & Action Dispatcher
   Autonomous action layer executing real-world actions and closing the loop
   by appending new Timeline events.
   ========================================================================= */

export type CompanionAction = Tables<"companion_actions">;
export type ActionExecution = Tables<"action_executions">;

/** Actions that require explicit Guardian approval */
const SAFETY_CRITICAL_ACTIONS = [
  "CALL_VETERINARY",
  "OPEN_FEEDER",
  "START_EMERGENCY_PROTOCOL",
  "CALL_GUARDIAN",
];

export class ActionDispatcher {
  private static plugins: DevicePlugin[] = [
    new TabletPlugin(),
    new NotificationPlugin(),
    new MockMatterPlugin(),
    new MockONVIFPlugin(),
    new MockFeederPlugin(),
  ];

  static findPlugin(actionType: string): DevicePlugin {
    const plugin = this.plugins.find((p) => p.supports(actionType));
    return plugin ?? this.plugins[0];
  }

  static async dispatch(action: CompanionAction) {
    const plugin = this.findPlugin(action.action_type);
    const result = await plugin.execute(action);

    return {
      pluginName: plugin.name,
      ...result,
    };
  }
}

export interface DispatchActionInput {
  pet_id: string;
  reasoning_id?: string;
  action_type: string;
  priority?: "low" | "medium" | "high" | "critical";
  parameters?: Record<string, unknown>;
}

export class ActionEngine {
  /**
   * 1. Dispatch an action from Cognitive Reasoning Engine output.
   * If safety-critical, puts into awaiting_approval state.
   */
  static async dispatchAction(input: DispatchActionInput): Promise<CompanionAction> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: pet } = await supabase
      .from("pets")
      .select("org_id, name")
      .eq("id", input.pet_id)
      .single();

    if (!pet) throw new Error("Pet not found");

    const requiresApproval = SAFETY_CRITICAL_ACTIONS.includes(input.action_type);
    const initialStatus = requiresApproval ? "awaiting_approval" : "executing";

    const insertRow: InsertTables<"companion_actions"> = {
      pet_id: input.pet_id,
      org_id: pet.org_id,
      reasoning_id: input.reasoning_id ?? null,
      action_type: input.action_type,
      priority: input.priority ?? "medium",
      status: initialStatus,
      requires_approval: requiresApproval,
      parameters: (input.parameters ?? {}) as Json,
    };

    const { data: action, error } = await supabase
      .from("companion_actions")
      .insert(insertRow)
      .select()
      .single();

    if (error || !action) throw new Error(`Action creation failed: ${error?.message}`);

    // If approval required, return immediately in awaiting_approval state
    if (requiresApproval) {
      return action as CompanionAction;
    }

    // Execute immediately via ActionDispatcher
    return this.executeAction(action as CompanionAction);
  }

  /**
   * 2. Execute an approved or auto-dispatched action via plugins & log execution.
   */
  static async executeAction(action: CompanionAction): Promise<CompanionAction> {
    const supabase = await createClient();

    const dispatchResult = await ActionDispatcher.dispatch(action);

    // Create append-only Timeline Event to CLOSE THE COGNITIVE LOOP!
    let timelineEventId: string | null = null;
    try {
      const timelineEvt = await TimelineService.createEvent({
        pet_id: action.pet_id,
        event_type: "unusual",
        source: "automation",
        category: "reasoning",
        severity: action.priority as "info" | "warning" | "critical",
        confidence: 0.99,
        title: `CAE Action Executed: ${action.action_type}`,
        description: `Executed via ${dispatchResult.pluginName} (${dispatchResult.executionTimeMs}ms).`,
        recommended_action: `Action ${action.action_type} completed successfully.`,
      });
      timelineEventId = timelineEvt.id;
    } catch {
      // Non-blocking if timeline log fails
    }

    // Log execution metrics
    await supabase.from("action_executions").insert({
      action_id: action.id,
      org_id: action.org_id,
      plugin_name: dispatchResult.pluginName,
      execution_time_ms: dispatchResult.executionTimeMs,
      success: dispatchResult.success,
      error_message: dispatchResult.errorMessage ?? null,
      timeline_event_id: timelineEventId,
    });

    // Update action status to completed
    const { data: updated } = await supabase
      .from("companion_actions")
      .update({
        status: dispatchResult.success ? "completed" : "failed",
      })
      .eq("id", action.id)
      .select()
      .single();

    return (updated ?? action) as CompanionAction;
  }

  /**
   * 3. Approve a safety-critical action.
   */
  static async approveAction(actionId: string): Promise<CompanionAction> {
    const supabase = await createClient();

    const { data: action } = await supabase
      .from("companion_actions")
      .select()
      .eq("id", actionId)
      .single();

    if (!action) throw new Error("Action not found");

    await supabase
      .from("companion_actions")
      .update({ status: "executing" })
      .eq("id", actionId);

    return this.executeAction(action as CompanionAction);
  }

  /**
   * 4. Reject a pending safety-critical action.
   */
  static async rejectAction(actionId: string): Promise<CompanionAction> {
    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from("companion_actions")
      .update({ status: "rejected" })
      .eq("id", actionId)
      .select()
      .single();

    if (error || !updated) throw new Error("Rejection failed");
    return updated as CompanionAction;
  }

  /**
   * 5. Get recent executed actions for Home / Companion dashboards.
   */
  static async getRecentExecutedActions(limit = 10): Promise<CompanionAction[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("companion_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data ?? []) as CompanionAction[];
  }
}
