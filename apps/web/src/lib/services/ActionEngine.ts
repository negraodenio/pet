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
import { createEventContext, type EventContext } from "@/lib/identity/EventIdentity";
import {
  createExecutionHash,
  type ActionExecutionContext,
  type ActionId,
  type ClaimToken,
  type IdempotencyKey,
  type ExecutionResult,
  ClaimConflictError,
  createClaimToken,
  toIdempotencyKey,
  createExecutionWorker,
  IdempotencyViolationError,
  LeaseExpiredError,
  OwnershipViolationError,
} from "@/lib/services/ActionIdempotency";

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

const CLAIM_LEASE_MS = 5 * 60 * 1000;

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

  static async dispatch(action: CompanionAction): Promise<ExecutionResult & { pluginName: string }> {
    const plugin = this.findPlugin(action.action_type);
    const context: ActionExecutionContext = {
      action_id: action.id as ActionId,
      idempotency_key: action.idempotency_key as IdempotencyKey,
      execution_hash: action.execution_hash,
      correlation_id: action.correlation_id,
      causation_id: action.causation_id,
      trace_id: action.trace_id,
      request_id: action.request_id,
      actor_id: action.actor_id,
    };
    const result = await plugin.execute(action, context);

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
  context?: EventContext;
  causation_id?: string;
  idempotency_key: IdempotencyKey;
}

export class ActionEngine {
  /**
   * 1. Dispatch an action from Cognitive Reasoning Engine output.
   * If safety-critical, creates a pending action for approval.
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

    let context = input.context ?? createEventContext({
      actor_id: user ? "guardian" : "automation",
      causation_id: input.causation_id ?? null,
    });

    if (!input.context && input.reasoning_id) {
      const { data: reasoning } = await supabase
        .from("cognitive_reasoning_results")
        .select("originating_event_id, correlation_id, trace_id, request_id")
        .eq("id", input.reasoning_id)
        .maybeSingle();

      if (reasoning?.correlation_id && reasoning.trace_id && reasoning.request_id) {
        context = {
          correlation_id: reasoning.correlation_id,
          causation_id: reasoning.originating_event_id,
          trace_id: reasoning.trace_id,
          request_id: reasoning.request_id,
          actor_id: context.actor_id,
        };
      }
    }

    const requiresApproval = SAFETY_CRITICAL_ACTIONS.includes(input.action_type);
    const initialStatus = requiresApproval ? "pending" : "approved";
    const idempotencyKey = toIdempotencyKey(input.idempotency_key);
    const executionHash = createExecutionHash(
      pet.org_id,
      input.pet_id,
      input.action_type,
      idempotencyKey,
    );

    const insertRow: InsertTables<"companion_actions"> = {
      pet_id: input.pet_id,
      org_id: pet.org_id,
      reasoning_id: input.reasoning_id ?? null,
      action_type: input.action_type,
      priority: input.priority ?? "medium",
      status: initialStatus,
      requires_approval: requiresApproval,
      parameters: (input.parameters ?? {}) as Json,
      correlation_id: context.correlation_id,
      causation_id: context.causation_id,
      trace_id: context.trace_id,
      request_id: context.request_id,
      actor_id: context.actor_id,
      idempotency_key: idempotencyKey,
      execution_hash: executionHash,
      execution_status: "pending",
    };

    const { data: action, error } = await supabase
      .from("companion_actions")
      .insert(insertRow)
      .select()
      .single();

    if (error?.code === "23505") {
      const existing = await this.getActionByIdempotencyKey(pet.org_id, idempotencyKey);
      if (!existing) throw new Error("Action idempotency conflict could not be resolved.");
      if (existing.execution_hash !== executionHash) {
        throw new IdempotencyViolationError(idempotencyKey);
      }

      if (existing.status === "approved" && existing.execution_status === "pending") {
        return this.executeAction(existing);
      }

      return existing;
    }

    if (error || !action) throw new Error(`Action creation failed: ${error?.message}`);

    // Approval-gated actions remain pending until a guardian approves them.
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
    const claimToken = createClaimToken();
    const claimedAt = new Date();
    const claimExpiresAt = new Date(claimedAt.getTime() + CLAIM_LEASE_MS);

    const { data: claimed, error: claimError } = await supabase
      .from("companion_actions")
      .update({
        status: "executing",
        execution_status: "executing",
        executed_at: claimedAt.toISOString(),
        claimed_at: claimedAt.toISOString(),
        claimed_by: action.actor_id,
        claim_token: claimToken,
        claim_expires_at: claimExpiresAt.toISOString(),
        execution_worker: createExecutionWorker(),
      })
      .eq("id", action.id)
      .eq("status", "approved")
      .eq("execution_status", "pending")
      .is("claim_token", null)
      .select()
      .maybeSingle();

    if (claimError) throw new Error(`Action claim failed: ${claimError.message}`);
    if (!claimed) return this.getActionById(action.id);

    const claimedAction = claimed as CompanionAction;
    let dispatchResult: ExecutionResult & { pluginName: string };
    try {
      dispatchResult = await ActionDispatcher.dispatch(claimedAction);
    } catch (error) {
      dispatchResult = {
        pluginName: "unknown",
        success: false,
        executionTimeMs: 0,
        errorMessage: error instanceof Error ? error.message : "Plugin execution failed",
      };
    }

    // Create append-only Timeline Event to CLOSE THE COGNITIVE LOOP!
    let timelineEventId: string | null = null;
    try {
      const timelineEvt = await TimelineService.createEvent({
        pet_id: claimedAction.pet_id,
        event_type: "unusual",
        source: "automation",
        category: "reasoning",
        severity: action.priority as "info" | "warning" | "critical",
        confidence: 0.99,
        title: `CAE Action Executed: ${action.action_type}`,
        description: `Executed via ${dispatchResult.pluginName} (${dispatchResult.executionTimeMs}ms).`,
        recommended_action: `Action ${action.action_type} completed successfully.`,
        context: {
          correlation_id: claimedAction.correlation_id,
          causation_id: claimedAction.causation_id,
          trace_id: claimedAction.trace_id,
          request_id: claimedAction.request_id,
          actor_id: "automation",
        },
      });
      timelineEventId = timelineEvt.id;
    } catch {
      // Non-blocking if timeline log fails
    }

    // Log execution metrics
    await supabase.from("action_executions").insert({
      action_id: claimedAction.id,
      org_id: claimedAction.org_id,
      plugin_name: dispatchResult.pluginName,
      execution_time_ms: dispatchResult.executionTimeMs,
      success: dispatchResult.success,
      error_message: dispatchResult.errorMessage ?? null,
      timeline_event_id: timelineEventId,
      correlation_id: claimedAction.correlation_id,
      causation_id: claimedAction.causation_id,
      trace_id: claimedAction.trace_id,
      request_id: claimedAction.request_id,
      actor_id: claimedAction.actor_id,
    });

    return this.finalizeClaim(
      claimedAction.id,
      claimToken,
      dispatchResult.success ? "completed" : "failed",
    );
  }

  /**
   * 3. Approve a safety-critical action.
   */
  static async approveAction(actionId: string): Promise<CompanionAction> {
    const supabase = await createClient();

    const { data: approved, error } = await supabase
      .from("companion_actions")
      .update({ status: "approved" })
      .eq("id", actionId)
      .eq("status", "pending")
      .eq("execution_status", "pending")
      .select()
      .maybeSingle();

    if (error) throw new Error(`Action approval failed: ${error.message}`);
    if (!approved) return this.getActionById(actionId);

    return this.executeAction(approved as CompanionAction);
  }

  /**
   * 4. Reject a pending safety-critical action.
   */
  static async rejectAction(actionId: string): Promise<CompanionAction> {
    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from("companion_actions")
      .update({ status: "cancelled", execution_status: "cancelled", completed_at: new Date().toISOString() })
      .eq("id", actionId)
      .eq("status", "pending")
      .select()
      .maybeSingle();

    if (error) throw new Error("Rejection failed");
    if (!updated) return this.getActionById(actionId);
    return updated as CompanionAction;
  }

  /** Cancel a claimed execution only when the caller owns its live claim token. */
  static async cancelExecution(
    actionId: string,
    claimToken: ClaimToken,
  ): Promise<CompanionAction> {
    return this.finalizeClaim(actionId, claimToken, "cancelled");
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

  private static async getActionById(actionId: string): Promise<CompanionAction> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("companion_actions")
      .select()
      .eq("id", actionId)
      .single();

    if (error || !data) throw new Error("Action not found");
    return data as CompanionAction;
  }

  private static async getActionByIdempotencyKey(
    orgId: string,
    idempotencyKey: IdempotencyKey,
  ): Promise<CompanionAction | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("companion_actions")
      .select()
      .eq("org_id", orgId)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (error) throw new Error(`Action lookup failed: ${error.message}`);
    return data as CompanionAction | null;
  }

  private static async finalizeClaim(
    actionId: string,
    claimToken: ClaimToken,
    status: "completed" | "failed" | "cancelled",
  ): Promise<CompanionAction> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("companion_actions")
      .update({
        status,
        execution_status: status,
        completed_at: new Date().toISOString(),
        claimed_at: null,
        claimed_by: null,
        claim_expires_at: null,
        execution_worker: null,
      })
      .eq("id", actionId)
      .eq("status", "executing")
      .eq("claim_token", claimToken)
      .gt("claim_expires_at", new Date().toISOString())
      .select()
      .maybeSingle();

    if (error) throw new Error(`Action finalization failed: ${error.message}`);
    if (data) return data as CompanionAction;

    return this.throwClaimOwnershipError(actionId, claimToken);
  }

  private static async throwClaimOwnershipError(
    actionId: string,
    claimToken: ClaimToken,
  ): Promise<never> {
    const action = await this.getActionById(actionId);

    if (action.claim_token !== claimToken) {
      throw new OwnershipViolationError(actionId);
    }

    if (action.claim_expires_at && new Date(action.claim_expires_at).getTime() <= Date.now()) {
      throw new LeaseExpiredError(actionId);
    }

    throw new ClaimConflictError(actionId);
  }
}
