import { create } from "zustand";
import type { Tables } from "@/lib/supabase/database.types";

/* =========================================================================
   Auth Store — Current user, profile, and organization state
   ========================================================================= */

interface AuthState {
  user: { id: string; email: string } | null;
  profile: Tables<"profiles"> | null;
  organization: Tables<"organizations"> | null;
  subscription: Tables<"subscriptions"> | null;
  isLoading: boolean;

  setUser: (user: AuthState["user"]) => void;
  setProfile: (profile: Tables<"profiles"> | null) => void;
  setOrganization: (org: Tables<"organizations"> | null) => void;
  setSubscription: (sub: Tables<"subscriptions"> | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  profile: null,
  organization: null,
  subscription: null,
  isLoading: true,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setOrganization: (organization) => set({ organization }),
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialState),
}));
