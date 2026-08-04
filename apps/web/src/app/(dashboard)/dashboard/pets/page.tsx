import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { AddPetDialog } from "@/features/pets/components/AddPetDialog";
import { Dog, Plus, Calendar, Weight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Pets",
};

export default async function PetsPage() {
  const supabase = await createClient();

  const { data: pets } = await supabase
    .from("pets")
    .select("*, pet_profiles(*)")
    .order("name");

  const petList = pets ?? [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pets</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your pets and view their AI profiles
          </p>
        </div>
        <AddPetDialog />
      </div>

      {/* Pet grid */}
      {petList.length === 0 ? (
        <EmptyState
          icon={<Dog className="h-8 w-8" />}
          title="No pets yet"
          description="Add your first pet to start receiving AI-powered insights about their behavior, health, and daily routine."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {petList.map((pet) => (
            <Link key={pet.id} href={`/dashboard/pets/${pet.id}`}>
              <Card className="group cursor-pointer">
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={pet.avatar_url}
                      alt={pet.name}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors">
                          {pet.name}
                        </h3>
                        <span className="text-lg">
                          {pet.species === "dog" ? "🐕" : "🐈"}
                        </span>
                      </div>
                      {pet.breed && (
                        <p className="text-xs text-text-secondary mt-0.5">
                          {pet.breed}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                        {pet.birth_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(pet.birth_date), {
                              addSuffix: false,
                            })}{" "}
                            old
                          </span>
                        )}
                        {pet.weight_kg && (
                          <span className="flex items-center gap-1">
                            <Weight className="h-3 w-3" />
                            {pet.weight_kg} kg
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {pet.sex && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Badge variant="outline" className="capitalize">
                        {pet.sex.replace("_", " ")}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
