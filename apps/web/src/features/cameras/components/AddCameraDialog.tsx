"use client";

import { useState } from "react";
import { Plus, QrCode, Bluetooth, Wifi, CheckCircle2, Camera } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { cn } from "@/lib/utils";

/* =========================================================================
   AddCameraDialog — 3-step zero-config onboarding modal
   ========================================================================= */

export function AddCameraDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cameraName, setCameraName] = useState("Living Room Cam");
  const [locationName, setLocationName] = useState("Living Room");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleStartPairing = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setStep(2);
    }, 1500);
  };

  const handleWiFiSetup = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setStep(3);
    }, 1800);
  };

  const handleFinish = () => {
    setOpen(false);
    setStep(1);
    window.location.reload();
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} icon={<Plus className="h-4 w-4" />}>
        Add Camera
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-fade-in"
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
                <h2 className="text-base font-bold text-white">Add Compawion Camera</h2>
                <p className="text-xs text-text-muted">Zero-configuration hardware setup</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className={cn("px-2 py-0.5 rounded-full border", step === 1 ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" : "text-text-muted border-border")}>1. QR</span>
              <span className={cn("px-2 py-0.5 rounded-full border", step === 2 ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" : "text-text-muted border-border")}>2. WiFi</span>
              <span className={cn("px-2 py-0.5 rounded-full border", step === 3 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "text-text-muted border-border")}>3. Done</span>
            </div>
          </div>

          {/* Step 1: Scan QR / BLE Pairing */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <div className="relative mx-auto h-44 w-44 rounded-2xl border-2 border-dashed border-indigo-500/40 bg-indigo-500/5 flex flex-col items-center justify-center p-4">
                <QrCode className="h-16 w-16 text-indigo-400 animate-pulse mb-2" />
                <span className="text-[11px] font-mono text-indigo-300">Scan QR Code on Camera Box</span>
              </div>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Point your camera at the QR code printed on the bottom of your Compawion Camera or box.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleStartPairing}
                  loading={isConnecting}
                  icon={<Bluetooth className="h-4 w-4" />}
                >
                  Pair via Bluetooth
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: WiFi Configuration & Naming */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
                <Bluetooth className="h-4 w-4 shrink-0 text-indigo-400" />
                <span>Bluetooth Paired: <b>Compawion Cam-8F42</b></span>
              </div>

              <Input
                label="Camera Name"
                value={cameraName}
                onChange={(e) => setCameraName(e.target.value)}
                placeholder="e.g. Living Room Cam"
              />

              <Input
                label="Location / Room"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Living Room, Garden, Kitchen"
              />

              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">WiFi Network</label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-secondary border border-border text-xs text-white">
                  <Wifi className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold">Home_WiFi_5G</span>
                  <span className="ml-auto font-mono text-[10px] text-emerald-400">Connected</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleWiFiSetup} loading={isConnecting}>
                  Connect Camera
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success Confirmation */}
          {step === 3 && (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 glow">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Camera Connected Successfully!</h3>
                <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                  <b>{cameraName}</b> is online and streaming live AI events for <b>{locationName}</b>.
                </p>
              </div>
              <Button onClick={handleFinish} className="w-full bg-emerald-600 hover:bg-emerald-500">
                Done & View Live Stream
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
