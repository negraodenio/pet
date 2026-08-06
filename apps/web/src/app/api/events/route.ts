import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { InsertTables, Enums, Json } from "@/lib/supabase/database.types";

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

    // Insert all events with org_id — typed for Supabase strict mode
    const rows: InsertTables<"pet_events">[] = events.map((evt) => ({
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
    }));

    const { data, error } = await supabase
      .from("pet_events")
      .insert(rows)
      .select("id, event_type, severity, created_at");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        count: data.length,
        events: data,
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
