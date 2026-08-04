import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Heart, Activity, Droplets, Utensils, Moon, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Health",
};

const metricIcons: Record<string, React.ReactNode> = {
  activity_level: <Activity className="h-5 w-5 text-accent-primary" />,
  water_intake: <Droplets className="h-5 w-5 text-blue-400" />,
  food_intake: <Utensils className="h-5 w-5 text-warning" />,
  sleep_duration: <Moon className="h-5 w-5 text-accent-secondary" />,
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
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Heart className="h-6 w-6 text-danger" />
          Health
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          AI-tracked health metrics and trends for your pets
        </p>
      </div>

      {pets.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="No health data yet"
          description="Add pets and connect cameras to start tracking health metrics automatically with AI."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent-primary/15">
                <Activity className="h-5 w-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">--</p>
                <p className="text-xs text-text-secondary">Activity Score</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-500/15">
                <Droplets className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">--</p>
                <p className="text-xs text-text-secondary">Water Intake</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-warning/15">
                <Utensils className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">--</p>
                <p className="text-xs text-text-secondary">Meals Today</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent-secondary/15">
                <Moon className="h-5 w-5 text-accent-secondary" />
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">--</p>
                <p className="text-xs text-text-secondary">Sleep Hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Placeholder for charts */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Coming soon — AI-powered trend analysis">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent-primary" />
              Health Trends
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-16 text-center">
            <div>
              <TrendingUp className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary">
                Health trend charts will appear here once your cameras start
                tracking your pet&apos;s activity, eating, drinking, and sleeping
                patterns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
