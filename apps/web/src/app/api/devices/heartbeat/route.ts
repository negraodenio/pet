import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { device_id, status, firmware_version } = await request.json();

    if (!device_id) {
      return NextResponse.json(
        { error: "device_id is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("devices")
      .update({
        last_heartbeat: new Date().toISOString(),
        status: status ?? "online",
        ...(firmware_version ? { firmware_version } : {}),
      })
      .eq("id", device_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
