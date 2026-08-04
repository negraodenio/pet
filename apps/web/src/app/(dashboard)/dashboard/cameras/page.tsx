import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { AddCameraDialog } from "@/features/cameras/components/AddCameraDialog";
import { Camera, Wifi, WifiOff, Video, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Camera Matrix",
};

// Fallback demo cameras when database has no cameras yet
const demoCameras = [
  {
    id: "cam-1",
    name: "Living Room Matrix",
    location: "Living Room",
    status: "online",
    fps: 30,
    resolution: "1080p 60fps AI",
    ai_vision: "Pose + Object Active",
  },
  {
    id: "cam-2",
    name: "Kitchen Feeder Vision",
    location: "Kitchen",
    status: "online",
    fps: 30,
    resolution: "1080p 30fps AI",
    ai_vision: "Eating & Water Active",
  },
  {
    id: "cam-3",
    name: "Garden & Patio Guard",
    location: "Garden",
    status: "offline",
    fps: 0,
    resolution: "4K 30fps",
    ai_vision: "Standby",
  },
];

export default async function CamerasPage() {
  const supabase = await createClient();

  const { data: devices } = await supabase
    .from("devices")
    .select("*, device_locations(*)")
    .eq("device_type", "camera")
    .order("name");

  const dbCameras = devices ?? [];
  const hasRealCameras = dbCameras.length > 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Camera className="h-6 w-6 text-indigo-400" />
            Rooms (House Map)
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Live vision feeds and pet presence across all house rooms
          </p>
        </div>
        <AddCameraDialog />
      </div>

      {/* Grid of Cameras */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {hasRealCameras
          ? dbCameras.map((camera) => {
              const locations = camera.device_locations as unknown as Array<{ location_name: string }>;
              const location = locations?.[0]?.location_name ?? "General";
              return (
                <div key={camera.id} className="glass-panel overflow-hidden group">
                  <div className="relative aspect-video bg-bg-tertiary flex items-center justify-center border-b border-border">
                    <Video className="h-10 w-10 text-indigo-400/40 group-hover:scale-110 transition-transform" />
                    {camera.status === "online" ? (
                      <div className="absolute top-3 left-3">
                        <Badge variant="danger" dot pulse>
                          LIVE AI VISION
                        </Badge>
                      </div>
                    ) : (
                      <div className="absolute top-3 left-3">
                        <Badge variant="default">OFFLINE</Badge>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/80 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                      <span>1080p • 30 FPS</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> YOLO11 Active
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
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
                  </div>
                </div>
              );
            })
          : demoCameras.map((camera) => (
              <div key={camera.id} className="glass-panel overflow-hidden group">
                <div className="relative aspect-video bg-gradient-to-br from-indigo-950/40 via-bg-tertiary to-purple-950/30 flex items-center justify-center border-b border-border">
                  <Video className="h-10 w-10 text-indigo-400/50 group-hover:scale-110 transition-transform" />
                  {camera.status === "online" ? (
                    <div className="absolute top-3 left-3">
                      <Badge variant="danger" dot pulse>
                        LIVE AI STREAM
                      </Badge>
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3">
                      <Badge variant="default">STANDBY</Badge>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/80 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    <span>{camera.resolution}</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> {camera.ai_vision}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{camera.name}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{camera.location}</p>
                    </div>
                    {camera.status === "online" ? (
                      <Wifi className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-text-muted" />
                    )}
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
