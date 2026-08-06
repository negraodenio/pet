import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Camera, Wifi, WifiOff } from "lucide-react";

export const metadata = { title: "Camera Matrix" };

export default async function CamerasPage() {
  const supabase = await createClient();
  const { data: cameras } = await supabase
    .from("devices")
    .select("*, device_locations(*)")
    .eq("device_type", "camera")
    .order("name");

  const cameraList = cameras ?? [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Camera className="h-6 w-6 text-indigo-400" /> Cameras
          </h1>
          <p className="text-sm text-text-secondary mt-1">Registered camera devices in this household</p>
        </div>
      </div>

      {cameraList.length === 0 ? (
        <EmptyState
          icon={<Camera className="h-8 w-8" />}
          title="No cameras registered"
          description="Register a camera to begin receiving Timeline observations."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameraList.map((camera) => {
            const locations = camera.device_locations as unknown as Array<{ location_name: string }>;
            const location = locations?.[0]?.location_name ?? "Location not assigned";
            return (
              <div key={camera.id} className="glass-panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{camera.name}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{location}</p>
                  </div>
                  {camera.status === "online" ? (
                    <Wifi className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-text-muted" />
                  )}
                </div>
                <Badge className="mt-4" variant={camera.status === "online" ? "success" : "default"}>
                  {camera.status}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
