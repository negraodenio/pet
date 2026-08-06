"use client";

import { useRealtimeDevices } from "@/shared/hooks/useRealtime";
import { Badge } from "@/shared/components/ui/Badge";
import {
  Camera,
  Tablet,
  Activity,
  Utensils,
  Droplets,
  Weight,
  Cpu,
  Clock,
} from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";
import { formatDistanceToNow } from "date-fns";

/* =========================================================================
   DeviceGrid — Real-time device card grid
   WHY: Shows registered devices with live status updates via Supabase
   Realtime. No mock data.
   ========================================================================= */

type DeviceWithLocation = Tables<"devices"> & {
  device_locations: Array<{ location_name: string }> | null;
};

const deviceIcons: Record<string, typeof Camera> = {
  camera: Camera,
  tablet: Tablet,
  collar: Activity,
  feeder: Utensils,
  water_station: Droplets,
  scale: Weight,
};

function getStatusColor(status: string) {
  switch (status) {
    case "online":
      return "success" as const;
    case "offline":
      return "default" as const;
    case "updating":
      return "warning" as const;
    case "error":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

export function DeviceGrid({
  initialDevices,
}: {
  initialDevices: DeviceWithLocation[];
}) {
  const devices = useRealtimeDevices(
    initialDevices as Tables<"devices">[],
  ) as unknown as DeviceWithLocation[];

  if (devices.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
      {devices.map((device) => {
        const Icon = deviceIcons[device.device_type] ?? Cpu;
        const location =
          device.device_locations?.[0]?.location_name ?? "Unassigned";

        return (
          <div
            key={device.id}
            className="health-card p-6 border-indigo-500/20 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <Icon className="h-6 w-6" />
              </div>
              <Badge variant={getStatusColor(device.status)} dot>
                {device.status}
              </Badge>
            </div>

            <h3 className="text-base font-bold text-white mb-0.5">
              {device.name}
            </h3>
            <p className="text-xs text-text-muted font-mono">
              {device.device_type} • {location}
            </p>

            {/* Device Info */}
            <div className="mt-4 pt-4 border-t border-border/50 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-text-secondary">
                <span>Serial</span>
                <span className="text-text-muted">
                  {device.serial_number.slice(0, 12)}...
                </span>
              </div>
              {device.firmware_version && (
                <div className="flex items-center justify-between text-[11px] font-mono text-text-secondary">
                  <span>Firmware</span>
                  <span className="text-text-muted">
                    {device.firmware_version}
                  </span>
                </div>
              )}
              {device.last_heartbeat && (
                <div className="flex items-center gap-1 text-[11px] font-mono text-text-secondary">
                  <Clock className="h-3 w-3" />
                  <span>
                    Last seen{" "}
                    {formatDistanceToNow(new Date(device.last_heartbeat), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
