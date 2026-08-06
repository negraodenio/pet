import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

/* =========================================================================
   S1-03: Health Metrics API
   WHY: Continuous health data (sleep, hydration, activity) feeds the
   Living Companion Model and Health Domain dashboard.
   ========================================================================= */

const healthMetricSchema = z.object({
  pet_id: z.string().uuid(),
  metric_type: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  measured_date: z.string().optional(),
});

const batchMetricSchema = z.object({
  metrics: z.array(healthMetricSchema).min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const isBatch = "metrics" in body;
    const metrics = isBatch
      ? batchMetricSchema.parse(body).metrics
      : [healthMetricSchema.parse(body)];

    const rows = metrics.map((m) => ({
      pet_id: m.pet_id,
      metric_type: m.metric_type,
      value: m.value,
      unit: m.unit,
      measured_date: m.measured_date ?? new Date().toISOString().split("T")[0],
    }));

    const { data, error } = await supabase
      .from("health_metrics")
      .insert(rows)
      .select("id, metric_type, value, unit, measured_date");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, count: data.length, metrics: data },
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
 * GET /api/health — Fetch health metrics for a specific pet.
 * Supports ?pet_id=uuid&metric_type=sleep_hours&days=30
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
  const petId = searchParams.get("pet_id");
  const metricType = searchParams.get("metric_type");
  const days = parseInt(searchParams.get("days") ?? "30");

  if (!petId) {
    return NextResponse.json(
      { error: "pet_id is required" },
      { status: 400 },
    );
  }

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);

  let query = supabase
    .from("health_metrics")
    .select("*")
    .eq("pet_id", petId)
    .gte("measured_date", sinceDate.toISOString().split("T")[0])
    .order("measured_date", { ascending: true });

  if (metricType) query = query.eq("metric_type", metricType);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ metrics: data });
}
