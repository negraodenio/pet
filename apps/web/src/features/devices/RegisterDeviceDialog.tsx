"use client";

import { useState, useActionState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import {
  registerDeviceAction,
  type DeviceActionState,
} from "@/server/actions/devices";
import { Plus, X, Cpu } from "lucide-react";

/* =========================================================================
   RegisterDeviceDialog — Modal form for adding a new device
   WHY: Guardians need to register cameras, feeders, collars before
   the system can receive telemetry and build intelligence.
   ========================================================================= */

const deviceTypeOptions = [
  { value: "camera", label: "Camera (ONVIF / RTSP)" },
  { value: "tablet", label: "Tablet (AI Station)" },
  { value: "collar", label: "Smart Collar / BLE Tag" },
  { value: "feeder", label: "Smart Feeder" },
  { value: "water_station", label: "Smart Water Fountain" },
  { value: "scale", label: "Smart Scale" },
] as const;

export function RegisterDeviceDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<DeviceActionState, FormData>(
    registerDeviceAction,
    {},
  );

  // Close dialog on success
  if (state.success && open) {
    setOpen(false);
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        icon={<Plus className="h-4 w-4" />}
      >
        Add Device
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-bg-secondary border border-border rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10">
                    <Cpu className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Register Device
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form action={formAction} className="space-y-4">
                {/* Device Name */}
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                    Device Name
                  </label>
                  <Input
                    name="name"
                    placeholder="Living Room Camera"
                    required
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                    Serial Number / MAC Address
                  </label>
                  <Input
                    name="serialNumber"
                    placeholder="PO-CAM-001 or AA:BB:CC:DD:EE:FF"
                    required
                  />
                </div>

                {/* Device Type */}
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                    Device Type
                  </label>
                  <select
                    name="deviceType"
                    required
                    className="w-full px-4 py-3 bg-white/[0.04] border border-border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                  >
                    {deviceTypeOptions.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-bg-secondary"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                    Location (optional)
                  </label>
                  <Input
                    name="locationName"
                    placeholder="Living Room, Kitchen, Garden..."
                  />
                </div>

                {/* Error */}
                {state.error && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                    {state.error}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={pending} className="flex-1">
                    {pending ? "Registering..." : "Register Device"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
