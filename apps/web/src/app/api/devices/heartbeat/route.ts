import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

/* =========================================================================
   Device Heartbeat API
   WHY: Devices ping this endpoint to report they're alive and update status.
   POST /api/devices/heartbeat — Updates last_heartbeat + status.
   ========================================================================= */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = z.object({
      device_id: z.string().uuid(),
      status: z.enum(["online", "offline", "updating", "error"]).optional(),
      firmware_version: z.string().min(1).max(100).optional(),
    }).parse(await request.json());

    const { data, error } = await supabase
      .from("devices")
      .update({
        last_heartbeat: new Date().toISOString(),
        status: body.status ?? "online",
        ...(body.firmware_version ? { firmware_version: body.firmware_version } : {}),
      })
      .eq("id", body.device_id)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
