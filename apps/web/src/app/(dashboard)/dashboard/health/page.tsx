import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Heart, Activity, Droplets, Utensils, Moon, TrendingUp, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export const metadata = {
  title: "Health Analytics",
};

export default async function HealthPage() {
  const supabase = await createClient();

  const [petsResult, metricsResult] = await Promise.all([
    supabase.from("pets").select("id, name, species, avatar_url").order("name"),
    supabase
      .from("health_metrics")
      .select("*, pets(name)")
      .order("measured_date", { ascending: false })
      .limit(30),
  ]);

  const pets = petsResult.data ?? [];
  const metrics = metricsResult.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-400" />
            Health Analytics & Veterinary Intelligence
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Automated health metric tracking, posture analysis, hydration & sleep telemetry
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />}>Log Metric</Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="glass-panel p-5 border-indigo-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Activity Score</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">98%</p>
          <p className="text-xs text-emerald-400 mt-1 font-mono">+4% vs last week</p>
        </div>

        <div className="glass-panel p-5 border-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Water Intake</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Droplets className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">450 ml</p>
          <p className="text-xs text-emerald-400 mt-1 font-mono">Optimal Hydration</p>
        </div>

        <div className="glass-panel p-5 border-warning/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Daily Meals</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Utensils className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">2 Meals</p>
          <p className="text-xs text-emerald-400 mt-1 font-mono">100% Caloric Target</p>
        </div>

        <div className="glass-panel p-5 border-purple-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Sleep Quality</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Moon className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">12.5 hrs</p>
          <p className="text-xs text-emerald-400 mt-1 font-mono">Deep REM Cycle</p>
        </div>
      </div>

      {/* Veterinary Report Card Generator */}
      <div className="glass-panel p-6 border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-bg-secondary to-purple-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono mb-2">
              <ShieldCheck className="h-3 w-3 text-indigo-400" /> CLINICAL GRADE REPORTING
            </div>
            <h3 className="text-lg font-bold text-white">Automated Veterinary Diagnostic Report</h3>
            <p className="text-xs text-text-secondary max-w-xl leading-relaxed">
              Generate an exportable PDF report combining weight trajectory, behavioral anomaly history, gait assessment, and sleep duration for your vet visit.
            </p>
          </div>
          <Button className="shrink-0 bg-indigo-600 hover:bg-indigo-500 font-bold">
            Generate Vet PDF Report
          </Button>
        </div>
      </div>
    </div>
  );
}
