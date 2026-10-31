import { createClient } from "@/lib/supabase/server";
import { CctvMatrixView } from "@/features/cameras/components/CctvMatrixView";
import type { CameraDevice } from "@/features/cameras/components/LiveCameraPlayer";

export const metadata = { title: "Central de CFTV & Câmeras com IA" };

export default async function CamerasPage() {
  let dbCameras: Array<Record<string, unknown>> = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("devices")
      .select("*, device_locations(*)")
      .eq("device_type", "camera")
      .order("name");

    dbCameras = (data as unknown as Array<Record<string, unknown>>) ?? [];
  } catch {
    dbCameras = [];
  }

  // Map database cameras to CameraDevice objects
  const cameras: CameraDevice[] = dbCameras.map((cam) => {
    const locations = cam.device_locations as unknown as Array<{ location_name: string }>;
    const location = locations?.[0]?.location_name ?? "General Room";
    const hw = (cam.hardware_info as Record<string, unknown>) ?? {};

    const serial = String(cam.serial_number ?? "");
    const brandFromSerial = serial.split("-")[0];
    const isIpad = brandFromSerial === "ipad_ambient";

    return {
      id: String(cam.id),
      name: String(cam.name),
      location,
      status: (cam.status as "online" | "offline" | "updating" | "error") ?? "offline",
      streamUrl: undefined,
      brand: (["tapo", "reolink", "xiaomi", "ipad_ambient", "onvif"].includes(brandFromSerial)
        ? brandFromSerial
        : "generic") as CameraDevice["brand"],
      resolution: typeof hw.resolution === "string" ? hw.resolution : undefined,
      fps: typeof hw.fps === "number" ? hw.fps : undefined,
      hasPtz: brandFromSerial === "tapo" || Boolean(hw.has_ptz),
      streamType: isIpad ? "local_webcam" : "webrtc",
    };
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <CctvMatrixView initialCameras={cameras} />
    </div>
  );
}
