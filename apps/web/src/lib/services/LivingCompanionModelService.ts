import { createClient } from "@/lib/supabase/server";
import type { Tables, InsertTables, Json } from "@/lib/supabase/database.types";
import type { TimelineEvent } from "@/lib/services/TimelineService";

/* =========================================================================
   PR-012: Living Companion Model (LCM) Runtime Service
   The real-time digital state engine ("NOW") of Project One.
   Computes and caches current behavioral, biometric, and spatial state.
   ========================================================================= */

export type LCMState = Tables<"living_companion_models"> & {
  pets?: { name: string; species: string } | null;
};

export class LivingCompanionModelService {
  /**
   * 1. Get the current real-time Living Companion Model state for a companion.
   * If state doesn't exist yet, initializes default baseline.
   */
  static async getCurrentState(petId: string): Promise<LCMState | null> {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("living_companion_models")
      .select("*, pets(name, species)")
      .eq("pet_id", petId)
      .maybeSingle();

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

    const { data: created, error } = await supabase
      .from("living_companion_models")
      .insert(initialInsert)
      .select("*, pets(name, species)")
      .single();

    if (error) {
      console.error("LCM state init error:", error);
      return null;
    }

    return created as LCMState;
  }

  /**
   * 2. Incrementally recompute LCM state from a new Timeline event.
   * Only updates dimensions affected by the event source/type.
   */
  static async computeStateFromEvent(event: TimelineEvent): Promise<LCMState | null> {
    if (!event.pet_id) return null;

    const currentState = await this.getCurrentState(event.pet_id);
    if (!currentState) return null;

    const updates: Partial<InsertTables<"living_companion_models">> = {
      last_event_id: event.id,
      generated_at: new Date().toISOString(),
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

    // Persist updated state
    return this.upsertState(event.pet_id, currentState.org_id, updates);
  }

  /**
   * 3. Upsert LCM state for a companion.
   */
  static async upsertState(
    petId: string,
    orgId: string,
    updates: Partial<InsertTables<"living_companion_models">>,
  ): Promise<LCMState | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("living_companion_models")
      .upsert({
        pet_id: petId,
        org_id: orgId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select("*, pets(name, species)")
      .single();

    if (error) {
      console.error("LCM upsert error:", error);
      return null;
    }

    return data as LCMState;
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
