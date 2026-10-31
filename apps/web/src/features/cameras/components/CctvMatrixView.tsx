"use client";

import { useState } from "react";
import {
  Grid2X2,
  Square,
  LayoutGrid,
  Camera,
  Plus,
  Shield,
  Activity,
  Radio,
  SlidersHorizontal,
  Info,
  Clock,
  Sparkles,
  Wifi,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { LiveCameraPlayer, type CameraDevice } from "./LiveCameraPlayer";
import { AddCameraDialog } from "./AddCameraDialog";
import { cn } from "@/lib/utils";

interface CctvMatrixViewProps {
  initialCameras: CameraDevice[];
}

// Reference presets for docs/demo only — never rendered to real users.
export const referenceCameraPresets: CameraDevice[] = [
  {
    id: "cam-tapo-living",
    name: "Living Room (Tapo C200)",
    location: "Living Room",
    status: "online",
    brand: "tapo",
    resolution: "1080p FHD",
    fps: 30,
    hasPtz: true,
    streamType: "demo_ai",
  },
  {
    id: "cam-ipad-station",
    name: "iPad AI Station Camera",
    location: "Kitchen & Feeding Area",
    status: "online",
    brand: "ipad_ambient",
    resolution: "1080p Ultra-Wide",
    fps: 30,
    hasPtz: false,
    streamType: "local_webcam",
  },
  {
    id: "cam-smart-bed-mat",
    name: "Smart Bed AI Optical Node",
    location: "Bedroom Sleeping Mat",
    status: "online",
    brand: "reolink",
    resolution: "2K QHD",
    fps: 25,
    hasPtz: false,
    streamType: "demo_ai",
  },
  {
    id: "cam-garden-patio",
    name: "Garden & Patio Cam",
    location: "Garden / Backdoor",
    status: "online",
    brand: "xiaomi",
    resolution: "1080p",
    fps: 20,
    hasPtz: true,
    streamType: "demo_ai",
  },
];

export function CctvMatrixView({ initialCameras }: CctvMatrixViewProps) {
  const [cameras] = useState<CameraDevice[]>(initialCameras);
  const [gridLayout, setGridLayout] = useState<"1x1" | "2x2" | "3x3">("2x2");
  const [selectedCameraId, setSelectedCameraId] = useState<string>(
    cameras[0]?.id ?? "",
  );
  const [filterLocation, setFilterLocation] = useState<string>("all");

  const locations = ["all", ...Array.from(new Set(cameras.map((c) => c.location || "General")))];

  const filteredCameras = filterLocation === "all"
    ? cameras
    : cameras.filter((c) => (c.location || "General") === filterLocation);

  const focusedCamera = cameras.find((c) => c.id === selectedCameraId) ?? cameras[0];

  return (
    <div className="space-y-6">
      {/* Central CCTV Header & Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-bg-secondary border border-border shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">CCTV &amp; AI Guardian Matrix</h2>
                <Badge variant="success" className="font-mono text-[10px]">
                  {cameras.filter((c) => c.status === "online").length} CAMERAS ONLINE
                </Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Multi-Room Video Stream &bull; Compatible with Tapo, Reolink, RTSP &amp; iPad Ambient Cam
              </p>
            </div>
          </div>
        </div>

        {/* View Layout Controls & Add Camera Dialog */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Matrix Grid Selector */}
          <div className="flex items-center bg-bg-primary p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setGridLayout("1x1")}
              title="1x1 Single Focus"
              className={cn(
                "p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1",
                gridLayout === "1x1"
                  ? "bg-indigo-600 text-white"
                  : "text-text-muted hover:text-white",
              )}
            >
              <Square className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setGridLayout("2x2")}
              title="2x2 Quad Matrix"
              className={cn(
                "p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1",
                gridLayout === "2x2"
                  ? "bg-indigo-600 text-white"
                  : "text-text-muted hover:text-white",
              )}
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setGridLayout("3x3")}
              title="3x3 Multi-Cam Matrix"
              className={cn(
                "p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1",
                gridLayout === "3x3"
                  ? "bg-indigo-600 text-white"
                  : "text-text-muted hover:text-white",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <AddCameraDialog />
        </div>
      </div>

      {/* Room Filters & Quick Status */}
      <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2">
        <div className="flex items-center gap-2">
          {locations.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setFilterLocation(loc)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border",
                filterLocation === loc
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm"
                  : "bg-bg-secondary/60 text-text-muted border-border hover:border-indigo-500/30 hover:text-white",
              )}
            >
              {loc === "all" ? "All Rooms" : loc}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-text-muted">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-400" /> YOLO11 Pose Detection
          </span>
          <span className="flex items-center gap-1">
            <Radio className="h-3 w-3 text-emerald-400" /> WebRTC Ultra-Low Latency
          </span>
        </div>
      </div>

      {/* Video Matrix Grid Layout */}
      {cameras.length === 0 ? (
        <div className="glass-panel p-10 text-center space-y-3">
          <Camera className="h-8 w-8 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Cameras Connected Yet</h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Pair your first camera (TP-Link Tapo, Reolink, generic ONVIF/RTSP, or this iPad&apos;s camera) to begin live monitoring.
          </p>
        </div>
      ) : gridLayout === "1x1" && focusedCamera ? (
        <div className="max-w-4xl mx-auto">
          <LiveCameraPlayer
            camera={focusedCamera}
            isFocused={true}
          />
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 sm:gap-6",
            gridLayout === "2x2" && "grid-cols-1 md:grid-cols-2",
            gridLayout === "3x3" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {filteredCameras.map((camera) => (
            <LiveCameraPlayer
              key={camera.id}
              camera={camera}
              isFocused={selectedCameraId === camera.id}
              onFocus={() => setSelectedCameraId(camera.id)}
            />
          ))}
        </div>
      )}

      {/* CCTV Telemetry & Intelligence Side Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="glass-panel p-4 border-indigo-500/20 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Event Detection Protocol</div>
            <div className="text-[11px] text-text-muted">
              Monitoring vomiting, pacing, limping, sleep restlessness.
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 border-emerald-500/20 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Plug &amp; Play Protocol (RTSP / ONVIF)</div>
            <div className="text-[11px] text-text-muted">
              Supports TP-Link Tapo C200, Reolink, Xiaomi, or iPad front camera.
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 border-purple-500/20 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">24/7 Unified Timeline</div>
            <div className="text-[11px] text-text-muted">
              All room observations merged into one chronological pet timeline.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
