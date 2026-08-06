import { createClient } from "@/lib/supabase/server";
import { Cpu, Plus } from "lucide-react";
import { DeviceGrid } from "@/features/devices/DeviceGrid";
import { RegisterDeviceDialog } from "@/features/devices/RegisterDeviceDialog";

export const metadata = {
  title: "Devices",
};

export default async function DevicesPage() {
  const supabase = await createClient();

  const { data: devices } = await supabase
    .from("devices")
    .select("*, device_locations(location_name)")
    .order("created_at", { ascending: false });

  const { data: pets } = await supabase
    .from("pets")
    .select("id, name")
    .order("name");

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Cpu className="h-6 w-6 text-indigo-400" />
            Devices
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Register and manage cameras, sensors, feeders, and smart devices
          </p>
        </div>
        <RegisterDeviceDialog />
      </div>

      {/* Device Grid */}
      <DeviceGrid initialDevices={devices ?? []} />

      {/* Empty State */}
      {(!devices || devices.length === 0) && (
        <div className="text-center py-16">
          <div className="p-4 rounded-full bg-indigo-500/10 inline-block mb-4">
            <Cpu className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No devices yet</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Connect your first camera, smart bed, or sensor to start building
            your companion&apos;s intelligence mesh.
          </p>
        </div>
      )}
    </div>
  );
}
