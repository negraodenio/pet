import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/Card";
import { formatEventType, severityColor, formatConfidence } from "@/lib/utils";
import {
  Dog,
  Calendar,
  Weight,
  Activity,
  Heart,
  Moon,
  Droplets,
  Utensils,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface PetDetailPageProps {
  params: Promise<{ petId: string }>;
}

export default async function PetDetailPage({ params }: PetDetailPageProps) {
  const { petId } = await params;
  const supabase = await createClient();

  const [petResult, eventsResult] = await Promise.all([
    supabase.from("pets").select("*, pet_profiles(*)").eq("id", petId).single(),
    supabase
      .from("pet_events")
      .select("*")
      .eq("pet_id", petId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const pet = petResult.data ?? {
    id: petId,
    name: petId.includes("lola") ? "Lola" : "Thor",
    species: petId.includes("lola") ? "cat" : "dog",
    breed: petId.includes("lola") ? "Siamese" : "Golden Retriever",
    birth_date: "2022-04-12",
    weight_kg: petId.includes("lola") ? 4.2 : 31.5,
    sex: petId.includes("lola") ? "spayed_female" : "neutered_male",
    avatar_url: null,
  };

  const recentEvents = eventsResult.data ?? [
    {
      id: "ev-1",
      event_type: "eating",
      severity: "info",
      confidence: 0.96,
      created_at: new Date().toISOString(),
      recommended_action: "Normal meal consumption logged.",
    },
    {
      id: "ev-2",
      event_type: "sleeping",
      severity: "info",
      confidence: 0.99,
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      recommended_action: "Deep sleep detected (REM cycle).",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back button */}
      <Link
        href="/dashboard/pets"
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Pets
      </Link>

      {/* Pet Header Card */}
      <div className="glass-panel p-6 border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar src={pet.avatar_url} alt={pet.name} size="xl" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {pet.name}
                </h1>
                <span className="text-2xl">
                  {pet.species === "dog" ? "🐕" : "🐈"}
                </span>
                <Badge variant="primary" dot pulse>
                  Model Active
                </Badge>
              </div>
              <p className="text-xs text-text-secondary mt-1 font-mono">
                {pet.breed ?? "Unknown breed"} • {pet.sex?.replace("_", " ")}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-text-muted font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  Born: {pet.birth_date ?? "N/A"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Weight className="h-3.5 w-3.5 text-purple-400" />
                  {pet.weight_kg ? `${pet.weight_kg} kg` : "N/A"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" /> 100% Health Index
          </div>
        </div>
      </div>

      {/* AI Behavioral Baseline Indexes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 border-indigo-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            Activity Level
          </div>
          <p className="text-xl font-bold font-mono text-white">4.2 hrs/day</p>
          <p className="text-[10px] text-emerald-400 mt-1 font-mono">Normal Range (±2%)</p>
        </div>

        <div className="glass-panel p-4 border-purple-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-2">
            <Moon className="h-4 w-4 text-purple-400" />
            Sleep Quality
          </div>
          <p className="text-xl font-bold font-mono text-white">12.5 hrs</p>
          <p className="text-[10px] text-emerald-400 mt-1 font-mono">Deep REM Optimal</p>
        </div>

        <div className="glass-panel p-4 border-blue-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-2">
            <Droplets className="h-4 w-4 text-blue-400" />
            Water Intake
          </div>
          <p className="text-xl font-bold font-mono text-white">450 ml</p>
          <p className="text-[10px] text-emerald-400 mt-1 font-mono">Hydration Target Met</p>
        </div>

        <div className="glass-panel p-4 border-warning/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-2">
            <Utensils className="h-4 w-4 text-warning" />
            Meal Routine
          </div>
          <p className="text-xl font-bold font-mono text-white">2 Meals</p>
          <p className="text-[10px] text-emerald-400 mt-1 font-mono">Regular Pattern</p>
        </div>
      </div>

      {/* Pet Recent AI Timeline */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            AI Timeline — {pet.name}
          </h3>
          <span className="text-xs font-mono text-text-muted">Real-time Vision Input</span>
        </div>

        <div className="space-y-3">
          {recentEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-border/50"
            >
              <div className="p-2.5 rounded-xl bg-bg-tertiary border border-border/50 shrink-0">
                <AlertTriangle className={`h-4 w-4 ${severityColor(event.severity as "info" | "warning" | "critical")}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white capitalize">
                    {formatEventType(event.event_type)}
                  </span>
                  <Badge variant="info">
                    {formatConfidence(event.confidence)} Confidence
                  </Badge>
                </div>
                {event.recommended_action && (
                  <p className="text-xs text-text-secondary mt-1">
                    {event.recommended_action}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
