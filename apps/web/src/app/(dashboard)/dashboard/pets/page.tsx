import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import { AddPetDialog } from "@/features/pets/components/AddPetDialog";
import { Dog, Calendar, Weight, ShieldCheck, Sparkles, Heart } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Pets & Profiles",
};

// Fallback demo pets so interface is rich out-of-the-box
const demoPets = [
  {
    id: "demo-thor",
    name: "Thor",
    species: "dog",
    breed: "Golden Retriever",
    birth_date: "2022-04-12",
    weight_kg: 31.5,
    sex: "neutered_male",
    avatar_url: null,
    vitality: "98% Vitality",
    activity: "Active (4.2 hrs/day)",
  },
  {
    id: "demo-lola",
    name: "Lola",
    species: "cat",
    breed: "Siamese",
    birth_date: "2023-01-20",
    weight_kg: 4.2,
    sex: "spayed_female",
    avatar_url: null,
    vitality: "100% Vitality",
    activity: "Normal (14 hrs sleep)",
  },
];

export default async function PetsPage() {
  const supabase = await createClient();

  const { data: pets } = await supabase
    .from("pets")
    .select("*, pet_profiles(*)")
    .order("name");

  const dbPets = pets ?? [];
  const hasRealPets = dbPets.length > 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Dog className="h-6 w-6 text-indigo-400" />
            Pets & AI Behavioral Profiles
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Registered companions with long-term behavioral baselines & neural models
          </p>
        </div>
        <AddPetDialog />
      </div>

      {/* Pet Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {hasRealPets
          ? dbPets.map((pet) => (
              <Link key={pet.id} href={`/dashboard/pets/${pet.id}`}>
                <div className="glass-panel p-5 group cursor-pointer border-border/60 hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all">
                  <div className="flex items-start gap-4">
                    <Avatar src={pet.avatar_url} alt={pet.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {pet.name}
                        </h3>
                        <span className="text-lg">
                          {pet.species === "dog" ? "🐕" : "🐈"}
                        </span>
                      </div>
                      {pet.breed && (
                        <p className="text-xs text-text-muted">{pet.breed}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3 text-xs text-text-muted font-mono">
                        {pet.birth_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-indigo-400" />
                            {formatDistanceToNow(new Date(pet.birth_date), {
                              addSuffix: false,
                            })}
                          </span>
                        )}
                        {pet.weight_kg && (
                          <span className="flex items-center gap-1">
                            <Weight className="h-3 w-3 text-purple-400" />
                            {pet.weight_kg} kg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {pet.sex?.replace("_", " ") ?? pet.species}
                    </Badge>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Model Active
                    </span>
                  </div>
                </div>
              </Link>
            ))
          : demoPets.map((pet) => (
              <Link key={pet.id} href={`/dashboard/pets/${pet.id}`}>
                <div className="glass-panel p-5 group cursor-pointer border-border/60 hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all">
                  <div className="flex items-start gap-4">
                    <Avatar src={pet.avatar_url} alt={pet.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {pet.name}
                        </h3>
                        <span className="text-lg">
                          {pet.species === "dog" ? "🐕" : "🐈"}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted">{pet.breed}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-text-muted font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-indigo-400" />
                          2 yrs old
                        </span>
                        <span className="flex items-center gap-1">
                          <Weight className="h-3 w-3 text-purple-400" />
                          {pet.weight_kg} kg
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Heart className="h-3 w-3" /> {pet.vitality}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-300 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-indigo-400" /> {pet.activity}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
}
