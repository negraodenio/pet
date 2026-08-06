import { createClient } from "@/lib/supabase/server";
import { CompanionCenter } from "@/features/companion/CompanionCenter";
import type { Tables } from "@/lib/supabase/database.types";

export const metadata = {
  title: "Companion Profile",
};

type PetWithProfile = Tables<"pets"> & {
  pet_profiles: Tables<"pet_profiles"> | null;
};
type PetEvent = Tables<"pet_events">;

interface CompanionPetDetailPageProps {
  params: Promise<{ petId: string }>;
}

export default async function CompanionPetDetailPage({
  params,
}: CompanionPetDetailPageProps) {
  const { petId } = await params;
  const supabase = await createClient();

  const { data: pets } = await supabase
    .from("pets")
    .select("*, pet_profiles(*)")
    .order("name");

  const companionList = (pets ?? []) as PetWithProfile[];

  const eventsMap: Record<string, PetEvent[]> = {};

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
  }

  return (
    <CompanionCenter
      initialPets={companionList}
      initialEventsMap={eventsMap}
      defaultSelectedId={petId}
    />
  );
}
