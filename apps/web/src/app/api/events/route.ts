import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { InsertTables, Enums, Json } from "@/lib/supabase/database.types";
import { createEventContext } from "@/lib/identity/EventIdentity";
import { LivingCompanionModelService } from "@/lib/services/LivingCompanionModelService";
import { CognitiveReasoningEngine, type ReasoningResult } from "@/lib/services/CognitiveReasoningEngine";
import { ActionEngine } from "@/lib/services/ActionEngine";
import { toIdempotencyKey } from "@/lib/services/ActionIdempotency";
import type { TimelineEvent } from "@/lib/services/TimelineService";

/* =========================================================================
   S1-02: Event Ingestion API
   WHY: Devices push detected events here. This is the primary data pipeline.
   POST /api/events — Authenticated. Inserts into pet_events.
   ========================================================================= */

const eventTypeValues = [
  "sleeping",
  "eating",
  "drinking",
  "barking",
  "whining",
  "vomiting",
  "garbage",
  "danger",
  "destroying",
  "scratching",
  "anxiety",
  "limping",
  "seizure",
  "inactivity",
  "unusual",
  "leaving_zone",
  "interaction_pet",
  "interaction_stranger",
] as const;

const severityValues = ["info", "warning", "critical"] as const;

const eventSchema = z.object({
  pet_id: z.string().uuid().optional(),
  device_id: z.string().uuid().optional(),
  event_type: z.enum(eventTypeValues),
  severity: z.enum(severityValues).default("info"),
  confidence: z.number().min(0).max(1).default(0),
  metadata: z.record(z.string(), z.unknown()).optional(),
  recommended_action: z.string().optional(),
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional(),
});

const batchEventSchema = z.object({
  events: z.array(eventSchema).min(1).max(50),
});

const ACTION_BY_REASONING_TYPE: Partial<Record<ReasoningResult["reasoning_type"], string>> = {
  hydration_risk: "ACTIVATE_WATER_ALERT",
  stress_detection: "PLAY_CALMING_SOUND",
};

async function processTimelineEvent(event: TimelineEvent): Promise<"processed" | "skipped"> {
  if (!event.pet_id) return "skipped";

  const lcmResult = await LivingCompanionModelService.computeStateFromEvent(event);
  if (lcmResult.status !== "updated") return "skipped";

  const reasoningResults = await CognitiveReasoningEngine.analyzeCompanion(event.pet_id);
  for (const reasoning of reasoningResults) {
    const actionType = ACTION_BY_REASONING_TYPE[reasoning.reasoning_type];
    if (!actionType) continue;

    await ActionEngine.dispatchAction({
      pet_id: event.pet_id,
      reasoning_id: reasoning.id,
      action_type: actionType,
      priority: reasoning.priority as "low" | "medium" | "high" | "critical",
      causation_id: reasoning.originating_event_id ?? event.id,
      context: {
        correlation_id: reasoning.correlation_id ?? event.correlation_id,
        causation_id: reasoning.originating_event_id ?? event.id,
        trace_id: reasoning.trace_id ?? event.trace_id,
        request_id: reasoning.request_id ?? event.request_id,
        actor_id: "automation",
      },
      idempotency_key: toIdempotencyKey(`reasoning:${reasoning.id}:${actionType}`),
    });
  }

  return "processed";
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get org_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Support single event or batch
    const isBatch = "events" in body;
    const events = isBatch
      ? batchEventSchema.parse(body).events
      : [eventSchema.parse(body)];

    const requestContext = createEventContext({ actor_id: "guardian" });

    // Events in one HTTP request share trace/request identity while retaining
    // independent correlation identity for their separate cognitive flows.
    const rows: InsertTables<"pet_events">[] = events.map((evt) => {
      const context = createEventContext({
        actor_id: "guardian",
        trace_id: requestContext.trace_id,
        request_id: requestContext.request_id,
      });

      return {
        org_id: profile.org_id,
        pet_id: evt.pet_id ?? null,
        device_id: evt.device_id ?? null,
        event_type: evt.event_type,
        severity: evt.severity,
        confidence: evt.confidence,
        metadata: (evt.metadata ?? {}) as Json,
        recommended_action: evt.recommended_action ?? null,
        started_at: evt.started_at ?? null,
        ended_at: evt.ended_at ?? null,
        created_by: user.id,
        correlation_id: context.correlation_id,
        causation_id: context.causation_id,
        trace_id: context.trace_id,
        request_id: context.request_id,
        actor_id: context.actor_id,
      };
    });

    const { data, error } = await supabase
      .from("pet_events")
      .insert(rows)
      .select("*, pets(name, species), devices(name, device_type)");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const pipeline = [] as Array<{
      event_id: string;
      status: "processed" | "skipped" | "failed";
    }>;

    for (const event of data ?? []) {
      try {
        pipeline.push({
          event_id: event.id,
          status: await processTimelineEvent(event as TimelineEvent),
        });
      } catch {
        // Timeline ingestion is durable even if its synchronous derived work fails.
        pipeline.push({ event_id: event.id, status: "failed" });
      }
    }

    return NextResponse.json(
      {
        success: true,
        count: data?.length ?? 0,
        events: data,
        pipeline,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/events — Fetch recent events for the authenticated user's org.
 * Supports ?limit=N&severity=critical&pet_id=uuid&event_type=sleeping
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
  const severity = searchParams.get("severity") as Enums<"event_severity"> | null;
  const petId = searchParams.get("pet_id");
  const eventType = searchParams.get("event_type") as Enums<"event_type"> | null;

  let query = supabase
    .from("pet_events")
    .select("*, pets(name, species), devices(name, device_type)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (severity) query = query.eq("severity", severity);
  if (petId) query = query.eq("pet_id", petId);
  if (eventType) query = query.eq("event_type", eventType);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data });
}
