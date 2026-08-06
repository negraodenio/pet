import { createClient } from "@/lib/supabase/server";
import { CompanionCenter } from "@/features/companion/CompanionCenter";
import type { Tables } from "@/lib/supabase/database.types";

export const metadata = {
  title: "Companion Center",
};

type PetWithProfile = Tables<"pets"> & {
  pet_profiles: Tables<"pet_profiles"> | null;
};
type PetEvent = Tables<"pet_events">;
type LCMState = Tables<"living_companion_models">;

export default async function CompanionPage() {
  const supabase = await createClient();

  // Fetch pets with profiles
  const { data: pets } = await supabase
    .from("pets")
    .select("*, pet_profiles(*)")
    .order("name");

  const companionList = (pets ?? []) as PetWithProfile[];

  // Fetch recent events for all pets
  const eventsMap: Record<string, PetEvent[]> = {};
  const lcmMap: Record<string, LCMState> = {};

  if (companionList.length > 0) {
    const petIds = companionList.map((p) => p.id);
    const { data: events } = await supabase
      .from("pet_events")
      .select("*")
      .in("pet_id", petIds)
      .order("created_at", { ascending: false })
      .limit(50);

    if (events) {
      for (const evt of events) {
        if (evt.pet_id) {
          if (!eventsMap[evt.pet_id]) eventsMap[evt.pet_id] = [];
          eventsMap[evt.pet_id].push(evt);
        }
      }
    }

    const { data: lcmStates } = await supabase
      .from("living_companion_models")
      .select("*")
      .in("pet_id", petIds);

    for (const state of lcmStates ?? []) {
      lcmMap[state.pet_id] = state;
    }
  }

  return (
    <CompanionCenter
      initialPets={companionList}
      initialEventsMap={eventsMap}
      initialLcmMap={lcmMap}
    />
  );
}
