"use client";

import { useState } from "react";
import {
  Plus,
  QrCode,
  Bluetooth,
  Wifi,
  CheckCircle2,
  Camera,
  Tablet,
  Video,
  Info,
  Server,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { cn } from "@/lib/utils";
import { registerDeviceAction } from "@/server/actions/devices";

type CameraBrandOption = "tapo" | "ipad_ambient" | "reolink" | "xiaomi" | "onvif";

export function AddCameraDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedBrand, setSelectedBrand] = useState<CameraBrandOption>("tapo");
  const [cameraName, setCameraName] = useState("Living Room Cam (Tapo C200)");
  const [locationName, setLocationName] = useState("Living Room");
  const [cameraIp, setCameraIp] = useState("192.168.1.120");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const brandPresets: Record<CameraBrandOption, { name: string; defaultName: string; hint: string }> = {
    tapo: {
      name: "TP-Link Tapo (C200 / C100)",
      defaultName: "Living Room (Tapo C200)",
      hint: "In Tapo App: Camera Settings -> Advanced -> Camera Account (creates RTSP user on Port 554).",
    },
    ipad_ambient: {
      name: "iPad AI Station (Built-in Camera)",
      defaultName: "iPad Ambient Camera (Kitchen)",
      hint: "Uses this device's front-facing camera with instant real-time vision AI.",
    },
    reolink: {
      name: "Reolink (E1 / Lumus)",
      defaultName: "Bedroom (Reolink E1)",
      hint: "In Reolink App: Network Settings -> Advanced -> Server Ports -> Enable RTSP / ONVIF.",
    },
    xiaomi: {
      name: "Xiaomi / Imilab / Yi",
      defaultName: "Backyard Patio (Xiaomi 360°)",
      hint: "Enable RTSP streaming via custom firmware or ONVIF gateway.",
    },
    onvif: {
      name: "Generic IP / CCTV Camera (ONVIF / RTSP)",
      defaultName: "Home Security Cam (RTSP)",
      hint: "Works with any standard IP security camera supporting H.264 RTSP feeds.",
    },
  };

  const handleSelectBrand = (brand: CameraBrandOption) => {
    setSelectedBrand(brand);
    setCameraName(brandPresets[brand].defaultName);
  };

  const handleStartPairing = () => {
    setStep(2);
  };

  const handleWiFiSetup = async () => {
    setIsConnecting(true);
    setSaveError(null);
    const fd = new FormData();
    fd.set("name", cameraName);
    fd.set("deviceType", "camera");
    fd.set("serialNumber", `${selectedBrand}-${selectedBrand === "ipad_ambient" ? crypto.randomUUID().slice(0, 8) : cameraIp}`);
    fd.set("locationName", locationName);
    // NOTE: camera password is intentionally NOT sent/stored on server.
    const res = await registerDeviceAction({}, fd);
    setIsConnecting(false);
    if (res.error) {
      setSaveError(res.error);
      return;
    }
    setStep(3);
  };

  const handleFinish = () => {
    setOpen(false);
    setStep(1);
    window.location.reload();
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        icon={<Plus className="h-4 w-4" />}
        className="bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 text-xs font-bold"
      >
        Add Camera
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 animate-fade-in"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="glass-panel w-full max-w-lg p-6 border-indigo-500/30 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Step Tracker */}
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">CCTV Guardian — Pair New Camera</h2>
                <p className="text-xs text-text-muted">Compatible with Wi-Fi IP Cameras or iPad Front Cam</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className={cn("px-2 py-0.5 rounded-full border", step === 1 ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" : "text-text-muted border-border")}>1. Model</span>
              <span className={cn("px-2 py-0.5 rounded-full border", step === 2 ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" : "text-text-muted border-border")}>2. Connect</span>
              <span className={cn("px-2 py-0.5 rounded-full border", step === 3 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "text-text-muted border-border")}>3. Ready</span>
            </div>
          </div>

          {/* Step 1: Select Brand / Type */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-text-secondary">Select camera model or stream type:</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(brandPresets) as CameraBrandOption[]).map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleSelectBrand(brand)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all flex items-start gap-2.5",
                      selectedBrand === brand
                        ? "bg-indigo-500/20 border-indigo-400 text-white shadow-sm"
                        : "bg-bg-secondary border-border text-text-secondary hover:border-indigo-500/40 hover:text-white",
                    )}
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                      {brand === "ipad_ambient" ? <Tablet className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">{brandPresets[brand].name}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">Plug &amp; Play</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Informative Hint Box */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs flex items-start gap-2">
                <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {brandPresets[selectedBrand].hint}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleStartPairing}
                  loading={isConnecting}
                  className="bg-indigo-600 hover:bg-indigo-500 font-bold"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Connection Details */}
          {step === 2 && (
            <div className="space-y-4">
              <Input
                label="Camera Name"
                value={cameraName}
                onChange={(e) => setCameraName(e.target.value)}
                placeholder="e.g. Living Room (Tapo C200)"
              />

              <Input
                label="Room / Location"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Living Room, Bedroom, Kitchen, Backyard"
              />

              {selectedBrand !== "ipad_ambient" ? (
                <div className="space-y-3 pt-1">
                  <Input
                    label="Camera Local IP Address (Wi-Fi)"
                    value={cameraIp}
                    onChange={(e) => setCameraIp(e.target.value)}
                    placeholder="192.168.1.xxx"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="RTSP Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                    />
                    <Input
                      label="Camera Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <p className="text-[10px] font-mono text-text-muted">
                    Generated RTSP endpoint: rtsp://{username}:***@{cameraIp}:554/stream1
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>This device&apos;s front camera (iPad/laptop) will be linked instantly with zero configuration!</span>
                </div>
              )}

              {saveError && (
                <p className="text-xs text-rose-400">{saveError}</p>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleWiFiSetup} loading={isConnecting} className="bg-indigo-600 hover:bg-indigo-500 font-bold">
                  Pair Camera
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success Confirmation */}
          {step === 3 && (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-scale-in">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Camera Successfully Paired!</h3>
                <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                  <b>{cameraName}</b> has been assigned to <b>{locationName}</b>.
                  {selectedBrand === "ipad_ambient"
                    ? " Your local camera feed can now be activated in the CCTV matrix."
                    : " Live WebRTC stream will be routed automatically via your home network."}
                </p>
              </div>
              <Button onClick={handleFinish} className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold shadow-lg">
                Done &amp; Open CCTV Matrix
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
