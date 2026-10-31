import { createClient } from "@/lib/supabase/server";
import { SeniorFriendlyGuardianView } from "@/features/dashboard/SeniorFriendlyGuardianView";

export const metadata = {
  title: "Dashboard Overview — Compawion Care",
};

interface TelemetryRow {
  heart_rate_bpm?: number | null;
  respiration_rate_rpm?: number | null;
  weight_kg?: number | null;
  presence_detected?: boolean | null;
  recorded_at?: string | null;
}

interface EventRow {
  id: string;
  event_type: string;
  title?: string | null;
  description?: string | null;
  created_at: string;
  severity?: string | null;
}

export default async function DashboardHomePage() {
  const supabase = await createClient();

  // Fetch current user profile, pet, smart bed telemetry, and events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyClient = supabase as any;

  const [userRes, petsRes, telemetryRes, eventsRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("pets").select("*").order("name"),
    anyClient
      .from("smart_bed_telemetry")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("pet_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const profileName = userRes.data.user?.user_metadata?.display_name ?? "Family Guardian";
  const pets = petsRes.data ?? [];
  const activePet = pets[0] ?? null;
  const latestTelemetry = (telemetryRes.data as TelemetryRow | null) ?? null;
  const events = (eventsRes.data as unknown as EventRow[]) ?? [];

  return (
    <div className="animate-fade-in-up">
      <SeniorFriendlyGuardianView
        pet={activePet}
        telemetry={latestTelemetry}
        events={events}
        ownerName={profileName}
      />
    </div>
  );
}
