"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { UpdateTables } from "@/lib/supabase/database.types";

/* =========================================================================
   Pet Server Actions — CRUD operations for pets
   ========================================================================= */

const createPetSchema = z.object({
  name: z.string().min(1, "Pet name is required").max(50),
  species: z.enum(["dog", "cat"]),
  breed: z.string().optional(),
  birthDate: z.string().optional(),
  weightKg: z.coerce.number().positive().optional(),
  sex: z.enum(["male", "female", "neutered_male", "spayed_female"]).optional(),
});

const updatePetSchema = createPetSchema.partial().extend({
  id: z.string().uuid(),
});

export type PetActionState = {
  error?: string;
  success?: boolean;
  petId?: string;
};

export async function createPetAction(
  _prevState: PetActionState,
  formData: FormData,
): Promise<PetActionState> {
  const parsed = createPetSchema.safeParse({
    name: formData.get("name"),
    species: formData.get("species"),
    breed: formData.get("breed") || undefined,
    birthDate: formData.get("birthDate") || undefined,
    weightKg: formData.get("weightKg") || undefined,
    sex: formData.get("sex") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // Get user's org_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .single();

  if (!profile) {
    return { error: "Unable to find your organization" };
  }

  const { data, error } = await supabase
    .from("pets")
    .insert({
      org_id: profile.org_id,
      name: parsed.data.name,
      species: parsed.data.species,
      breed: parsed.data.breed ?? null,
      birth_date: parsed.data.birthDate ?? null,
      weight_kg: parsed.data.weightKg ?? null,
      sex: parsed.data.sex ?? null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Create the pet profile (AI behavioral baseline placeholder)
  await supabase.from("pet_profiles").insert({ pet_id: data.id });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pets");

  return { success: true, petId: data.id };
}

export async function updatePetAction(
  _prevState: PetActionState,
  formData: FormData,
): Promise<PetActionState> {
  const parsed = updatePetSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    species: formData.get("species") || undefined,
    breed: formData.get("breed") || undefined,
    birthDate: formData.get("birthDate") || undefined,
    weightKg: formData.get("weightKg") || undefined,
    sex: formData.get("sex") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { id, ...updates } = parsed.data;

  const supabase = await createClient();

  const updatePayload: UpdateTables<"pets"> = {};
  if (updates.name !== undefined) updatePayload.name = updates.name;
  if (updates.species !== undefined) updatePayload.species = updates.species;
  if (updates.breed !== undefined) updatePayload.breed = updates.breed;
  if (updates.birthDate !== undefined) updatePayload.birth_date = updates.birthDate;
  if (updates.weightKg !== undefined) updatePayload.weight_kg = updates.weightKg;
  if (updates.sex !== undefined) updatePayload.sex = updates.sex;

  const { error } = await supabase
    .from("pets")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pets/${id}`);

  return { success: true, petId: id };
}

export async function deletePetAction(petId: string): Promise<PetActionState> {
  const supabase = await createClient();

  const { error } = await supabase.from("pets").delete().eq("id", petId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pets");

  return { success: true };
}
