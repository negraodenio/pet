import { createClient } from "@/lib/supabase/server";
import type { Tables, InsertTables, Json } from "@/lib/supabase/database.types";
import {
  createDerivedEventContext,
  createEventContext,
  type EventContext,
  type EventIdentity,
} from "@/lib/identity/EventIdentity";

/* =========================================================================
   PR-011: Cognitive Timeline Engine — TimelineService
   The single event pipeline that feeds every domain in Compawion OS.
   Append-Only immutable event stream architecture.
   ========================================================================= */

export type TimelineEvent = Readonly<Tables<"pet_events">> & {
  readonly pets?: Readonly<{ name: string; species: string }> | null;
  readonly devices?: Readonly<{ name: string; device_type: string }> | null;
};

export type EventSource =
  | "vision"
  | "audio"
  | "collar"
  | "bed"
  | "water"
  | "feeder"
  | "guardian"
  | "veterinarian"
  | "ai"
  | "automation"
  | "external_api";

export type EventCategory =
  | "behavior"
  | "health"
  | "sleep"
  | "hydration"
  | "nutrition"
  | "movement"
  | "stress"
  | "anxiety"
  | "emergency"
  | "medication"
  | "training"
  | "observation"
  | "reasoning";

export interface CreateEventInput {
  pet_id?: string;
  device_id?: string;
  event_type: InsertTables<"pet_events">["event_type"];
  severity?: "info" | "warning" | "critical";
  confidence?: number;
  source?: EventSource;
  category?: EventCategory;
  title?: string;
  description?: string;
  location?: string;
  metadata?: Record<string, unknown>;
  observers?: Array<Record<string, unknown>>;
  related_events?: string[];
  recommended_action?: string;
  video_clip_url?: string;
  thumbnail_url?: string;
  /** Explicit identity for a root event or an already-propagated flow. */
  context?: EventContext;
  /** Parent Timeline event for automatic derived-event identity propagation. */
  caused_by?: EventIdentity;
}

export interface SearchFilters {
  pet_id?: string;
  category?: EventCategory;
  source?: EventSource;
  severity?: "info" | "warning" | "critical";
  query?: string;
  sinceDate?: string;
  limit?: number;
}

export class TimelineService {
  /**
   * 1. Append a new immutable event to the Cognitive Timeline.
   */
  static async createEvent(input: CreateEventInput): Promise<TimelineEvent> {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .single();

    if (!profile) throw new Error("Organization not found");

    const context = input.context
      ?? (input.caused_by
        ? createDerivedEventContext(input.caused_by, "automation")
        : createEventContext({ actor_id: "guardian" }));

    const row: InsertTables<"pet_events"> = {
      org_id: profile.org_id,
      pet_id: input.pet_id ?? null,
      device_id: input.device_id ?? null,
      event_type: input.event_type,
      severity: input.severity ?? "info",
      confidence: input.confidence ?? 0.9,
      source: input.source ?? "vision",
      category: input.category ?? "behavior",
      title: input.title ?? input.event_type.replace("_", " "),
      description: input.description ?? input.recommended_action ?? null,
      location: input.location ?? "Living Room",
      metadata: (input.metadata ?? {}) as Json,
      observers: (input.observers ?? []) as Json,
      related_events: (input.related_events ?? []) as Json,
      recommended_action: input.recommended_action ?? null,
      video_clip_url: input.video_clip_url ?? null,
      thumbnail_url: input.thumbnail_url ?? null,
      created_by: user.id,
      correlation_id: context.correlation_id,
      causation_id: context.causation_id,
      trace_id: context.trace_id,
      request_id: context.request_id,
      actor_id: context.actor_id,
    };

    const { data, error } = await supabase
      .from("pet_events")
      .insert(row)
      .select("*, pets(name, species), devices(name, device_type)")
      .single();

    if (error) throw new Error(`Timeline event insert failed: ${error.message}`);
    return data as TimelineEvent;
  }

  /**
   * 2. Search events using structured filters and query text.
   */
  static async searchEvents(filters: SearchFilters): Promise<TimelineEvent[]> {
    const supabase = await createClient();
    const limit = filters.limit ?? 50;

    let q = supabase
      .from("pet_events")
      .select("*, pets(name, species), devices(name, device_type)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filters.pet_id) q = q.eq("pet_id", filters.pet_id);
    if (filters.category) q = q.eq("category", filters.category);
    if (filters.source) q = q.eq("source", filters.source);
    if (filters.severity) q = q.eq("severity", filters.severity);
    if (filters.sinceDate) q = q.gte("created_at", filters.sinceDate);

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as TimelineEvent[];
  }

  /**
   * 3. Get main paginated timeline for the organization.
   */
  static async getTimeline(limit = 30): Promise<TimelineEvent[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pet_events")
      .select("*, pets(name, species), devices(name, device_type)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []) as TimelineEvent[];
  }

  /**
   * 4. Get events filtered by companion ID.
   */
  static async getEventsByPet(petId: string, limit = 20): Promise<TimelineEvent[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pet_events")
      .select("*, pets(name, species), devices(name, device_type)")
      .eq("pet_id", petId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []) as TimelineEvent[];
  }

  /**
   * 5. Get events by domain category (e.g. 'health', 'sleep', 'medication').
   */
  static async getEventsByCategory(
    category: EventCategory,
    petId?: string,
    limit = 20,
  ): Promise<TimelineEvent[]> {
    const supabase = await createClient();
    let q = supabase
      .from("pet_events")
      .select("*, pets(name, species), devices(name, device_type)")
      .eq("category", category)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (petId) q = q.eq("pet_id", petId);

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as TimelineEvent[];
  }

  /**
   * 6. Get events for a specific companion on a given date (YYYY-MM-DD).
   */
  static async getEventsByDay(petId: string, dateStr: string): Promise<TimelineEvent[]> {
    const supabase = await createClient();
    const startOfDay = `${dateStr}T00:00:00.000Z`;
    const endOfDay = `${dateStr}T23:59:59.999Z`;

    const { data, error } = await supabase
      .from("pet_events")
      .select("*, pets(name, species), devices(name, device_type)")
      .eq("pet_id", petId)
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as TimelineEvent[];
  }

  /**
   * 7. Get latest N events for live status dashboards.
   */
  static async getLatestEvents(limit = 10): Promise<TimelineEvent[]> {
    return this.getTimeline(limit);
  }

  /** Return an event and each of its causal ancestors. */
  static async getEventChain(eventId: string): Promise<TimelineEvent[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_pet_event_chain", {
      root_event_id: eventId,
    });

    if (error) throw new Error(error.message);
    return (data ?? []) as TimelineEvent[];
  }

  /** Return all Timeline events participating in one cognitive flow. */
  static async getCorrelation(
    correlationId: string,
    limit = 100,
  ): Promise<TimelineEvent[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pet_events")
      .select("*, pets(name, species), devices(name, device_type)")
      .eq("correlation_id", correlationId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []) as TimelineEvent[];
  }

  /** Return an event and all Timeline events that it directly or indirectly caused. */
  static async getCausalityTree(eventId: string): Promise<TimelineEvent[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_pet_event_causality_tree", {
      root_event_id: eventId,
    });

    if (error) throw new Error(error.message);
    return (data ?? []) as TimelineEvent[];
  }
}
