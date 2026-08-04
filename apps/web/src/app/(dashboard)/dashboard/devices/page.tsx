import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import {
  Cpu,
  Camera,
  Moon,
  ShieldCheck,
  Plus,
  Wifi,
  Activity,
  Heart,
  Droplets,
  Utensils,
  Weight,
  Radio,
} from "lucide-react";

export const metadata = {
  title: "Device Hub",
};

const devicesList = [
  {
    id: "bed-1",
    name: "Compawion Smart Bed v1",
    type: "Smart Bed",
    location: "Living Room",
    status: "online",
    icon: Moon,
    telemetry: ["Heart Rate: 72 bpm", "Respiration: 18 bpm", "Pressure Map: Sleeping", "Temp: 24°C"],
  },
  {
    id: "cam-1",
    name: "Living Room Camera",
    type: "AI Camera",
    location: "Living Room",
    status: "online",
    icon: Camera,
    telemetry: ["1080p 60fps AI Vision", "YOLO Pose Active"],
  },
  {
    id: "feeder-1",
    name: "Smart Feeder Pro",
    type: "Smart Feeder",
    location: "Kitchen",
    status: "online",
    icon: Utensils,
    telemetry: ["Portion: 220g", "Schedule: 10:20 AM"],
  },
  {
    id: "water-1",
    name: "Smart Water Fountain",
    type: "Smart Water",
    location: "Kitchen",
    status: "online",
    icon: Droplets,
    telemetry: ["Filter Status: 94%", "Dispensed: 450ml Today"],
  },
  {
    id: "collar-1",
    name: "Smart Collar Tag",
    type: "Smart Collar",
    location: "On Lola",
    status: "online",
    icon: Activity,
    telemetry: ["GPS: Home", "Vitality Sync: Active"],
  },
  {
    id: "scale-1",
    name: "Smart Precision Scale",
    type: "Smart Scale",
    location: "Bathroom",
    status: "standby",
    icon: Weight,
    telemetry: ["Last Weight: 31.5 kg", "Battery: 98%"],
  },
];

export default function DeviceHubPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Cpu className="h-6 w-6 text-indigo-400" />
            Universal Device Hub
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Universal hardware platform connecting Smart Bed, AI Cameras, Collars, Feeders & Sensors
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />}>Pair New Hardware</Button>
      </div>

      {/* Hardware Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {devicesList.map((device) => {
          const Icon = device.icon;
          return (
            <div key={device.id} className="health-card p-6 border-indigo-500/20 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <Badge variant={device.status === "online" ? "success" : "default"} dot>
                  {device.status}
                </Badge>
              </div>

              <h3 className="text-base font-bold text-white mb-0.5">{device.name}</h3>
              <p className="text-xs text-text-muted font-mono">{device.type} • {device.location}</p>

              {/* Telemetry Stream Pills */}
              <div className="mt-4 pt-4 border-t border-border/50 space-y-1.5">
                {device.telemetry.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-mono text-text-secondary">
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
