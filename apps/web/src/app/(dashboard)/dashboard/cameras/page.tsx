import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Camera, Wifi, WifiOff, Plus, Video } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export const metadata = {
  title: "Cameras",
};

export default async function CamerasPage() {
  const supabase = await createClient();

  const { data: devices } = await supabase
    .from("devices")
    .select("*, device_locations(*)")
    .eq("device_type", "camera")
    .order("name");

  const cameras = devices ?? [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Cameras</h1>
          <p className="text-sm text-text-secondary mt-1">
            Live view and manage your Compawion cameras
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />}>Add Camera</Button>
      </div>

      {cameras.length === 0 ? (
        <EmptyState
          icon={<Camera className="h-8 w-8" />}
          title="No cameras connected"
          description="Scan the QR code on your Compawion camera to get started. Setup takes less than 2 minutes."
          action={{
            label: "Set up camera",
            onClick: () => {},
          }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {cameras.map((camera) => {
            const locations = camera.device_locations as unknown as Array<{ location_name: string }>;
            const location = locations?.[0];
            return (
              <Card key={camera.id} padding="none" className="overflow-hidden">
                {/* Camera feed placeholder */}
                <div className="relative aspect-video bg-bg-tertiary flex items-center justify-center">
                  <Video className="h-8 w-8 text-text-muted" />
                  {camera.status === "online" && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="danger" dot pulse>
                        LIVE
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={camera.status === "online" ? "success" : "default"}
                      dot
                    >
                      {camera.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        {camera.name}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        {location?.location_name ?? "No location set"}
                      </p>
                    </div>
                    {camera.status === "online" ? (
                      <Wifi className="h-4 w-4 text-success" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-text-muted" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
