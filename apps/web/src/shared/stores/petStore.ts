import { create } from "zustand";
import type { Tables } from "@/lib/supabase/database.types";

/* =========================================================================
   Pet Store — Pets list and selected pet state
   ========================================================================= */

interface PetState {
  pets: Tables<"pets">[];
  selectedPetId: string | null;
  isLoading: boolean;

  setPets: (pets: Tables<"pets">[]) => void;
  addPet: (pet: Tables<"pets">) => void;
  updatePet: (id: string, updates: Partial<Tables<"pets">>) => void;
  removePet: (id: string) => void;
  setSelectedPetId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const usePetStore = create<PetState>((set) => ({
  pets: [],
  selectedPetId: null,
  isLoading: true,

  setPets: (pets) => set({ pets }),

  addPet: (pet) =>
    set((state) => ({ pets: [...state.pets, pet] })),

  updatePet: (id, updates) =>
    set((state) => ({
      pets: state.pets.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
    })),

  removePet: (id) =>
    set((state) => ({
      pets: state.pets.filter((p) => p.id !== id),
      selectedPetId: state.selectedPetId === id ? null : state.selectedPetId,
    })),

  setSelectedPetId: (selectedPetId) => set({ selectedPetId }),
  setLoading: (isLoading) => set({ isLoading }),
}));
