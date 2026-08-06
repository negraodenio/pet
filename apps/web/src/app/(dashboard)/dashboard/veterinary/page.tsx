import { createClient } from "@/lib/supabase/server";
import { Stethoscope, Calendar, FileText, Plus, ShieldCheck, Download, Activity, Heart, Clock } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/Card";

export const metadata = {
  title: "Veterinary Clinical Portal",
};

export default async function VeterinaryPage() {
  const supabase = await createClient();

  // Fetch real pets to display medical cards
  const { data: pets } = await supabase
    .from("pets")
    .select("id, name, species, breed, birth_date, weight_kg")
    .order("name");

  const companionList = pets ?? [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-emerald-400" />
            Veterinary Clinical Portal
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Clinical history, medical logs, vaccination records, and EMR export
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Download className="h-4 w-4" />}>
            Export FHIR / EMR PDF
          </Button>
          <Button icon={<Plus className="h-4 w-4" />}>Log Medical Record</Button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Clinical Compliance
          </div>
          <p className="text-xl font-bold font-mono text-white">100% Up to Date</p>
          <p className="text-[10px] text-emerald-400 mt-1 font-mono">
            Vaccines & Rabies active
          </p>
        </div>

        <div className="glass-panel p-5 border-indigo-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-2">
            <Calendar className="h-4 w-4 text-indigo-400" />
            Next Annual Checkup
          </div>
          <p className="text-xl font-bold font-mono text-white">Nov 14, 2026</p>
          <p className="text-[10px] text-text-muted mt-1 font-mono">
            Dr. Sarah Jenkins (VCA Clinic)
          </p>
        </div>

        <div className="glass-panel p-5 border-purple-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-2">
            <Activity className="h-4 w-4 text-purple-400" />
            Active Prescriptions
          </div>
          <p className="text-xl font-bold font-mono text-white">1 Active</p>
          <p className="text-[10px] text-purple-300 mt-1 font-mono">
            Heartgard Plus • Monthly
          </p>
        </div>
      </div>

      {/* Companion Medical Records Overview */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-400" />
          Companion Medical Profiles
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {companionList.map((pet) => (
            <div key={pet.id} className="glass-panel p-6 border-indigo-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {pet.species === "dog" ? "🐕" : "🐈"}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">{pet.name}</h3>
                    <p className="text-xs text-text-muted font-mono">
                      {pet.breed ?? "Companion"} • {pet.weight_kg ? `${pet.weight_kg} kg` : "N/A"}
                    </p>
                  </div>
                </div>
                <Badge variant="success">All Clear</Badge>
              </div>

              {/* Recent Clinical Logs */}
              <div className="space-y-2 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/[0.02]">
                  <span className="text-text-secondary font-medium">Annual Rabies Vaccine</span>
                  <span className="font-mono text-text-muted text-[11px]">Given Mar 2026</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/[0.02]">
                  <span className="text-text-secondary font-medium">Routine Dental Cleaning</span>
                  <span className="font-mono text-text-muted text-[11px]">Given Jan 2026</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
