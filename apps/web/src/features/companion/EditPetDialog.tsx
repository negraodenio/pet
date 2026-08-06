"use client";

import { useActionState, useState } from "react";
import { Edit3, Dog, Cat, Save } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { updatePetAction, type PetActionState } from "@/server/actions/pets";
import { cn } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/database.types";

/* =========================================================================
   EditPetDialog — Modal to edit an existing companion profile
   ========================================================================= */

type Pet = Tables<"pets">;

export function EditPetDialog({ pet }: { pet: Pet }) {
  const [open, setOpen] = useState(false);
  const [species, setSpecies] = useState<"dog" | "cat">(pet.species);
  const [state, formAction, isPending] = useActionState<PetActionState, FormData>(
    async (prevState, formData) => {
      const result = await updatePetAction(prevState, formData);
      if (result.success) {
        setOpen(false);
      }
      return result;
    },
    {},
  );

  if (!open) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        icon={<Edit3 className="h-3.5 w-3.5" />}
      >
        Edit Profile
      </Button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={() => setOpen(false)}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="glass-card w-full max-w-md p-6 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Edit Profile — {pet.name}
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Update biological and identity parameters
          </p>

          {state.error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20">
              <span className="text-sm text-danger">{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={pet.id} />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Species
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSpecies("dog")}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border transition-all",
                    species === "dog"
                      ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                      : "border-border text-text-secondary hover:border-border-active",
                  )}
                >
                  <Dog className="h-5 w-5" />
                  <span className="text-sm font-medium">Dog</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpecies("cat")}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border transition-all",
                    species === "cat"
                      ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                      : "border-border text-text-secondary hover:border-border-active",
                  )}
                >
                  <Cat className="h-5 w-5" />
                  <span className="text-sm font-medium">Cat</span>
                </button>
              </div>
              <input type="hidden" name="species" value={species} />
            </div>

            <Input
              name="name"
              label="Companion Name"
              defaultValue={pet.name}
              required
            />

            <Input
              name="breed"
              label="Breed"
              defaultValue={pet.breed ?? ""}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                name="birthDate"
                label="Birth Date"
                type="date"
                defaultValue={pet.birth_date ?? ""}
              />
              <Input
                name="weightKg"
                label="Weight (kg)"
                type="number"
                step="0.1"
                defaultValue={pet.weight_kg ? String(pet.weight_kg) : ""}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Sex
              </label>
              <select
                name="sex"
                defaultValue={pet.sex ?? ""}
                className="w-full h-10 rounded-lg bg-bg-secondary border border-border text-sm text-text-primary px-3 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 focus:outline-none"
              >
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="neutered_male">Neutered Male</option>
                <option value="spayed_female">Spayed Female</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isPending}
                icon={<Save className="h-4 w-4" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
