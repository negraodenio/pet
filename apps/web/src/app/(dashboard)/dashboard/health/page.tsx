import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Heart } from "lucide-react";

export const metadata = { title: "Health Analytics" };

export default async function HealthPage() {
  const supabase = await createClient();
  const { data: metrics } = await supabase
    .from("health_metrics")
    .select("*, pets(name)")
    .order("measured_date", { ascending: false })
    .limit(30);

  const metricList = metrics ?? [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-400" /> Health Metrics
        </h1>
        <p className="text-sm text-text-secondary mt-1">Persisted health observations for registered companions</p>
      </div>

      {metricList.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="No health metrics recorded"
          description="Metrics from supported devices will appear here after ingestion."
        />
      ) : (
        <div className="glass-panel divide-y divide-border/60">
          {metricList.map((metric) => {
            const pet = (metric as typeof metric & { pets: { name: string } | null }).pets;
            return (
              <div key={metric.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{metric.metric_type}</p>
                  <p className="text-xs text-text-muted">{pet?.name ?? "Unassigned"} - {metric.measured_date}</p>
                </div>
                <p className="text-lg font-mono text-white">{metric.value} {metric.unit}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
