import { createClient } from "@/lib/supabase/server";
import type { Tables, InsertTables, Json, UpdateTables } from "@/lib/supabase/database.types";
import type { TimelineEvent } from "@/lib/services/TimelineService";
import {
  ConcurrencyConflictError,
  DuplicateEventError,
  OutOfOrderEventError,
  toLCMVersion,
  type ConcurrencyResult,
  type ProcessingResult,
} from "@/lib/services/LCMConcurrency";

/* =========================================================================
   PR-012: Living Companion Model (LCM) Runtime Service
   The real-time digital state engine ("NOW") of Project One.
   Computes and caches current behavioral, biometric, and spatial state.
   ========================================================================= */

export type LCMState = Tables<"living_companion_models"> & {
  pets?: { name: string; species: string } | null;
};

const MAX_CONCURRENCY_ATTEMPTS = 3;

export class LivingCompanionModelService {
  /**
   * 1. Get the current real-time Living Companion Model state for a companion.
   * If state doesn't exist yet, initializes default baseline.
   */
  static async getCurrentState(petId: string): Promise<LCMState | null> {
    const supabase = await createClient();

    const { data: existing, error: existingError } = await supabase
      .from("living_companion_models")
      .select("*, pets(name, species)")
      .eq("pet_id", petId)
      .maybeSingle();

    if (existingError) throw new Error(existingError.message);
    if (existing) {
      return existing as LCMState;
    }

    // Fetch pet info to create initial default state
    const { data: pet } = await supabase
      .from("pets")
      .select("id, org_id, name, species")
      .eq("id", petId)
      .maybeSingle();

    if (!pet) return null;

    // Create initial state
    const summary = `${pet.name} is currently resting peacefully in the Living Room. Hydration and vitality targets met. Confidence 95%.`;

    const initialInsert: InsertTables<"living_companion_models"> = {
      pet_id: pet.id,
      org_id: pet.org_id,
      current_behavior: "resting",
      current_activity: "normal",
      current_room: "Living Room",
      current_emotion: "calm",
      stress_score: 10,
      energy_score: 88,
      hydration_score: 95,
      nutrition_score: 90,
      sleep_stage: "awake",
      mobility_score: 98,
      vitality_score: 98,
      health_score: 98,
      safety_score: 100,
      confidence: 0.95,
      learning_progress: 50,
      observer_count: 2,
      active_observers: ["camera_vision", "smart_bed"] as Json,
      current_summary: summary,
      reasoning_summary: "Initial multi-observer cognitive baseline established.",
    };

    const { error: insertError } = await supabase
      .from("living_companion_models")
      .insert(initialInsert)
      .select("id");

    if (insertError && insertError.code !== "23505") {
      throw new Error(`LCM state init failed: ${insertError.message}`);
    }

    // A competing request may have initialized the state first. Read the
    // canonical row after either insert path to make initialization idempotent.
    const { data: created, error: createdError } = await supabase
      .from("living_companion_models")
      .select("*, pets(name, species)")
      .eq("pet_id", petId)
      .single();

    if (createdError) throw new Error(`LCM state read failed: ${createdError.message}`);
    return created as LCMState;
  }

  /**
   * 2. Incrementally recompute LCM state from a new Timeline event.
   * Only updates dimensions affected by the event source/type.
   */
  static async computeStateFromEvent(event: TimelineEvent): Promise<ProcessingResult<LCMState>> {
    if (!event.pet_id) return { status: "skipped", state: null, attempts: 0 };

    for (let attempt = 1; attempt <= MAX_CONCURRENCY_ATTEMPTS; attempt += 1) {
      const currentState = await this.getCurrentState(event.pet_id);
      if (!currentState) return { status: "skipped", state: null, attempts: attempt };

      if (currentState.last_processed_event_id === event.id) {
        return {
          status: "duplicate",
          state: currentState,
          attempts: attempt,
          error: new DuplicateEventError(event.id),
        };
      }

      if (this.isOutOfOrder(event, currentState)) {
        return {
          status: "out_of_order",
          state: currentState,
          attempts: attempt,
          error: new OutOfOrderEventError(event.id, currentState.last_processed_event_id),
        };
      }

      const updates = this.computeUpdates(currentState, event);
      const result = await this.compareAndSwapState(currentState, updates);

      if (result.status === "updated") {
        return { status: "updated", state: result.state, attempts: attempt };
      }
    }

    throw new ConcurrencyConflictError(event.pet_id, MAX_CONCURRENCY_ATTEMPTS);
  }

  private static isOutOfOrder(event: TimelineEvent, currentState: LCMState): boolean {
    if (!currentState.last_processed_event_created_at) return false;

    const eventTime = new Date(event.created_at).getTime();
    const processedTime = new Date(currentState.last_processed_event_created_at).getTime();

    if (eventTime !== processedTime) return eventTime < processedTime;
    if (!currentState.last_processed_event_id) return false;

    // Equal timestamps use canonical UUID ordering as a deterministic tie-breaker.
    return event.id.localeCompare(currentState.last_processed_event_id) < 0;
  }

  private static computeUpdates(
    currentState: LCMState,
    event: TimelineEvent,
  ): UpdateTables<"living_companion_models"> {

    const updates: UpdateTables<"living_companion_models"> = {
      last_event_id: event.id,
      last_processed_event_id: event.id,
      last_processed_event_created_at: event.created_at,
      correlation_id: event.correlation_id,
      trace_id: event.trace_id,
      request_id: event.request_id,
      processing_state: "idle",
      updated_by: event.actor_id,
    };

    // Incremental logic based on event type / category / source
    switch (event.event_type) {
      case "sleeping":
        updates.current_behavior = "sleeping";
        updates.sleep_stage = "REM sleep";
        updates.energy_score = Math.min(100, currentState.energy_score + 5);
        updates.stress_score = Math.max(0, currentState.stress_score - 2);
        updates.confidence = Math.max(currentState.confidence, event.confidence);
        break;

      case "eating":
        updates.current_behavior = "eating";
        updates.current_activity = "active";
        updates.nutrition_score = Math.min(100, currentState.nutrition_score + 10);
        updates.energy_score = Math.min(100, currentState.energy_score + 8);
        break;

      case "drinking":
        updates.current_behavior = "drinking";
        updates.hydration_score = Math.min(100, currentState.hydration_score + 15);
        updates.vitality_score = Math.min(100, currentState.vitality_score + 2);
        break;

      case "barking":
      case "whining":
      case "anxiety":
        updates.current_behavior = event.event_type;
        updates.current_emotion = "alert";
        updates.stress_score = Math.min(100, currentState.stress_score + 15);
        break;

      case "limping":
      case "seizure":
      case "vomiting":
      case "danger":
        updates.current_behavior = event.event_type;
        updates.health_score = Math.max(50, currentState.health_score - 20);
        updates.safety_score = Math.max(60, currentState.safety_score - 25);
        updates.current_emotion = "distressed";
        break;
    }

    if (event.location) {
      updates.current_room = event.location;
    }

    // Regenerate human-readable current summary
    const petName = currentState.pets?.name ?? "Companion";
    const behavior = updates.current_behavior ?? currentState.current_behavior;
    const room = updates.current_room ?? currentState.current_room;
    const confidencePct = Math.round((updates.confidence ?? currentState.confidence) * 100);

    updates.current_summary = `${petName} is currently ${behavior.replace("_", " ")} in the ${room}. Vitality index ${updates.vitality_score ?? currentState.vitality_score}%. Confidence ${confidencePct}%. Observed by multi-modal mesh.`;
    updates.reasoning_summary = event.recommended_action ?? `Updated from ${event.event_type} event observation.`;

    return updates;
  }

  /**
   * 3. Persist state only when the caller's version still matches.
   */
  static async compareAndSwapState(
    currentState: LCMState,
    updates: UpdateTables<"living_companion_models">,
  ): Promise<ConcurrencyResult<LCMState>> {
    const supabase = await createClient();
    const expectedVersion = toLCMVersion(currentState.version);
    const nextVersion = toLCMVersion(expectedVersion + 1);

    const { data, error } = await supabase
      .from("living_companion_models")
      .update({
        ...updates,
        version: nextVersion,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentState.id)
      .eq("version", expectedVersion)
      .select("*, pets(name, species)")
      .maybeSingle();

    if (error) {
      throw new Error(`LCM compare-and-swap failed: ${error.message}`);
    }

    if (!data) return { status: "conflict" };
    return { status: "updated", state: data as LCMState };
  }

  /**
   * 4. Get current LCM states for all companions in the household/organization.
   */
  static async getHouseholdStates(orgId: string): Promise<LCMState[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("living_companion_models")
      .select("*, pets(name, species)")
      .eq("org_id", orgId);

    if (error) throw new Error(error.message);
    return (data ?? []) as LCMState[];
  }
}
