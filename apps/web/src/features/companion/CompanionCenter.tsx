"use client";

import { useState } from "react";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import { AddPetDialog } from "@/features/pets/components/AddPetDialog";
import { EditPetDialog } from "@/features/companion/EditPetDialog";
import { DeletePetDialog } from "@/features/companion/DeletePetDialog";
import { LivingCompanionModelCard } from "@/features/companion/LivingCompanionModelCard";
import { CognitiveDNACard } from "@/features/companion/CognitiveDNACard";
import { CompanionStoryCard } from "@/features/companion/CompanionStoryCard";
import {
  Dog,
  Calendar,
  Weight,
  ShieldCheck,
  Heart,
  Activity,
  Sparkles,
  ChevronRight,
  Plus,
  Users,
} from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";
import { formatDistanceToNow } from "date-fns";

type PetWithProfile = Tables<"pets"> & {
  pet_profiles: Tables<"pet_profiles"> | null;
};
type PetEvent = Tables<"pet_events">;

interface CompanionCenterProps {
  initialPets: PetWithProfile[];
  initialEventsMap: Record<string, PetEvent[]>;
  defaultSelectedId?: string;
}

export function CompanionCenter({
  initialPets,
  initialEventsMap,
  defaultSelectedId,
}: CompanionCenterProps) {
  const [pets, setPets] = useState(initialPets);
  const [selectedId, setSelectedId] = useState<string>(
    defaultSelectedId ?? (pets[0]?.id || ""),
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "lcm" | "dna" | "story"
  >("overview");

  // Fallback demo companion if no real pets registered yet
  const activePet =
    pets.find((p) => p.id === selectedId) ??
    pets[0] ?? {
      id: "demo-thor",
      org_id: "demo-org",
      name: "Thor",
      species: "dog" as const,
      breed: "Golden Retriever",
      birth_date: "2022-04-12",
      weight_kg: 31.5,
      sex: "neutered_male" as const,
      avatar_url: null,
      identity_embeddings: {},
      preferences: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pet_profiles: null,
    };

  const activeEvents = initialEventsMap[activePet.id] ?? [];
  const latestEvent = activeEvents[0] ?? null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Bar / Companion Selector Tabs (Tablet / AI Station & Mobile Optimized) */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-indigo-500/20">
        {/* Companion Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {pets.map((p) => {
            const isSelected = p.id === activePet.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-white/[0.04] text-text-secondary hover:bg-white/[0.08] hover:text-white border border-border/50"
                }`}
              >
                <Avatar src={p.avatar_url} alt={p.name} size="xs" />
                <span>{p.name}</span>
                <span className="text-xs opacity-75">
                  {p.species === "dog" ? "🐕" : "🐈"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 justify-end">
          <AddPetDialog />
        </div>
      </div>

      {/* Companion Identity Header Card */}
      <div className="glass-panel p-6 border-indigo-500/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & Main Bio Info */}
          <div className="flex items-center gap-5">
            <Avatar src={activePet.avatar_url} alt={activePet.name} size="xl" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {activePet.name}
                </h1>
                <span className="text-2xl">
                  {activePet.species === "dog" ? "🐕" : "🐈"}
                </span>
                <Badge variant="primary" dot pulse>
                  Model Active
                </Badge>
              </div>

              <p className="text-xs text-text-secondary mt-1 font-mono">
                {activePet.breed ?? "Companion"} •{" "}
                {activePet.sex?.replace("_", " ") ?? activePet.species}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-text-muted font-mono">
                {activePet.birth_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    Age:{" "}
                    {formatDistanceToNow(new Date(activePet.birth_date), {
                      addSuffix: false,
                    })}
                  </span>
                )}
                {activePet.weight_kg && (
                  <span className="flex items-center gap-1.5">
                    <Weight className="h-3.5 w-3.5 text-purple-400" />
                    {activePet.weight_kg} kg
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> 100% Identity Verified
                </span>
              </div>
            </div>
          </div>

          {/* Quick Edit / Delete Controls */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-border/50">
            <EditPetDialog pet={activePet} />
            <DeletePetDialog
              pet={activePet}
              onDeleted={() => {
                const remaining = pets.filter((p) => p.id !== activePet.id);
                setPets(remaining);
                if (remaining.length > 0) setSelectedId(remaining[0].id);
              }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Progressive Disclosure */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "overview"
              ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              : "text-text-muted hover:text-white"
          }`}
        >
          Overview & Status
        </button>
        <button
          onClick={() => setActiveTab("lcm")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "lcm"
              ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              : "text-text-muted hover:text-white"
          }`}
        >
          Living Companion Model (LCM)
        </button>
        <button
          onClick={() => setActiveTab("dna")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "dna"
              ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              : "text-text-muted hover:text-white"
          }`}
        >
          Cognitive DNA Baseline
        </button>
        <button
          onClick={() => setActiveTab("story")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "story"
              ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              : "text-text-muted hover:text-white"
          }`}
        >
          Guardian Story & Observations
        </button>
      </div>

      {/* Progressive Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <LivingCompanionModelCard
            pet={activePet}
            profile={activePet.pet_profiles}
            latestEvent={latestEvent}
            recentEventCount={activeEvents.length}
          />

          <CognitiveDNACard
            petName={activePet.name}
            profile={activePet.pet_profiles}
            totalEventCount={activeEvents.length}
          />

          <CompanionStoryCard
            petName={activePet.name}
            events={activeEvents}
          />
        </div>
      )}

      {activeTab === "lcm" && (
        <LivingCompanionModelCard
          pet={activePet}
          profile={activePet.pet_profiles}
          latestEvent={latestEvent}
          recentEventCount={activeEvents.length}
        />
      )}

      {activeTab === "dna" && (
        <CognitiveDNACard
          petName={activePet.name}
          profile={activePet.pet_profiles}
          totalEventCount={activeEvents.length}
        />
      )}

      {activeTab === "story" && (
        <CompanionStoryCard petName={activePet.name} events={activeEvents} />
      )}
    </div>
  );
}
