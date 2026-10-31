"use client";

import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Video,
  Mic,
  MicOff,
  Volume2,
  Maximize2,
  RotateCcw,
  Shield,
  Radio,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Wifi,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/lib/utils";

export interface CameraDevice {
  id: string;
  name: string;
  location?: string;
  status: "online" | "offline" | "updating" | "error";
  streamUrl?: string;
  streamType?: "webrtc" | "hls" | "local_webcam" | "demo_ai";
  model?: string;
  brand?: "tapo" | "reolink" | "xiaomi" | "ipad_ambient" | "onvif" | "generic";
  resolution?: string;
  fps?: number;
  hasPtz?: boolean;
}

interface LiveCameraPlayerProps {
  camera: CameraDevice;
  isFocused?: boolean;
  onFocus?: () => void;
}

export function LiveCameraPlayer({
  camera,
  isFocused = false,
  onFocus,
}: LiveCameraPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCalmingActive, setIsCalmingActive] = useState(false);
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [ptzMessage, setPtzMessage] = useState<string | null>(null);
  const [localStreamActive, setLocalStreamActive] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // If camera is local_webcam (like iPad front camera), request getUserMedia
  useEffect(() => {
    let activeMediaStream: MediaStream | null = null;

    if (camera.streamType === "local_webcam" && isPlaying) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
        .then((stream) => {
          activeMediaStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
            setLocalStreamActive(true);
          }
        })
        .catch((err) => {
          console.warn("Could not access local camera:", err);
          setLocalStreamActive(false);
        });
    }

    return () => {
      if (activeMediaStream) {
        activeMediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [camera.streamType, isPlaying]);

  const handlePtz = (direction: string) => {
    setPtzMessage(`PTZ: ${direction}`);
    setTimeout(() => setPtzMessage(null), 1200);
  };

  const handleSnapshot = () => {
    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 2000);
  };

  const toggleCalmingMusic = () => {
    setIsCalmingActive((prev) => !prev);
  };

  const isOnline = camera.status === "online";

  return (
    <div
      onClick={onFocus}
      className={cn(
        "group relative rounded-2xl overflow-hidden bg-bg-secondary border transition-all duration-300 flex flex-col",
        isFocused
          ? "border-indigo-500 shadow-2xl shadow-indigo-500/20 ring-1 ring-indigo-500"
          : "border-border hover:border-indigo-500/50",
      )}
    >
      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              {camera.name}
              {camera.brand && (
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  {camera.brand}
                </span>
              )}
            </span>
            <span className="text-[10px] text-text-muted">{camera.location ?? "Living Area"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
              <Radio className="h-3 w-3 animate-pulse" /> LIVE
            </div>
          ) : (
            <Badge variant="default">OFFLINE</Badge>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAiOverlay((prev) => !prev);
            }}
            title="Toggle AI Detection Overlay"
            className={cn(
              "p-1.5 rounded-lg border transition-colors",
              showAiOverlay
                ? "bg-indigo-500/30 border-indigo-400 text-indigo-200"
                : "bg-black/40 border-white/10 text-text-muted hover:text-white",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video Screen Area */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Background Grid Pattern (CCTV aesthetic) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Video Element or Live Simulation */}
        {camera.streamType === "local_webcam" && (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={cn("w-full h-full object-cover", !localStreamActive && "hidden")}
          />
        )}
        {!(camera.streamType === "local_webcam" && localStreamActive) && (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40">
            {/* Ambient Lighting representation */}
            <div className="absolute h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            {/* Simulated Live Scene */}
            <div className="relative flex flex-col items-center text-center p-6 space-y-2">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Video className="h-7 w-7" />
              </div>
              <p className="text-xs font-semibold text-white">Stream Ready: {camera.resolution ?? "1080p FHD"}</p>
              <p className="text-[11px] text-text-muted font-mono">
                {camera.streamUrl ? `RTSP -> WebRTC (${camera.fps ?? 30} FPS)` : "Autonomous Vision Cortex Connected"}
              </p>
            </div>
          </div>
        )}

        {/* AI Bounding Box & Keypoints HUD Overlay */}
        {showAiOverlay && isOnline && (
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-10">
            {/* Top Info HUD */}
            <div className="flex justify-between items-start pt-8">
              <div className="text-[10px] font-mono text-emerald-400/90 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-emerald-500/30">
                CAMERA REGISTADA &bull; STREAM: {camera.streamType === "local_webcam" && localStreamActive ? "LOCAL" : "PENDENTE"}
              </div>
            </div>

            {/* Dynamic AI Detection Box */}
            <div className="relative self-center my-auto w-3/5 h-3/5 border-2 border-dashed border-indigo-400/70 rounded-xl bg-indigo-500/5 animate-pulse flex flex-col justify-between p-2">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-indigo-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-indigo-300" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-indigo-300" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-indigo-300" />

              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-600/80 text-white font-mono text-[9px] font-bold w-fit shadow">
                <Shield className="h-2.5 w-2.5 text-cyan-300" />
                {camera.streamType === "local_webcam" && localStreamActive
                  ? "CÂMERA LOCAL ATIVA"
                  : "AGUARDANDO STREAM (gateway RTSP→WebRTC)"}
              </div>

              <div className="flex items-center justify-between font-mono text-[9px] text-cyan-200 bg-black/50 px-2 py-0.5 rounded">
                <span>Análise de IA: ainda não conectada</span>
              </div>
            </div>

            {/* Bottom Timestamp & Room Status */}
            <div className="flex justify-between items-end font-mono text-[9px] text-white/60 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
              <span>CAM-ID: {camera.id.slice(0, 8)}</span>
              <span>TIME: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        {/* PTZ Action Notification */}
        {ptzMessage && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-3 py-1.5 rounded-lg bg-indigo-600/90 text-white font-mono text-xs font-bold shadow-lg animate-fade-in">
            {ptzMessage}
          </div>
        )}

        {/* Snapshot Notification */}
        {snapshotSuccess && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xl animate-fade-in flex items-center gap-2">
            <Camera className="h-4 w-4" /> Snapshot Saved to Pet Timeline!
          </div>
        )}
      </div>

      {/* CCTV Control & Interactive Action Bar */}
      <div className="p-3 bg-bg-secondary/90 border-t border-border flex items-center justify-between gap-2">
        {/* Left: Two-way Audio & Calming Music */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={isMicActive ? "primary" : "ghost"}
            onClick={(e) => {
              e.stopPropagation();
              setIsMicActive(!isMicActive);
            }}
            title={isMicActive ? "Microphone Active (Speaking)" : "Push to Talk"}
            className={cn("h-8 px-2.5 text-xs font-semibold gap-1", isMicActive && "bg-rose-600 hover:bg-rose-500")}
          >
            {isMicActive ? <Mic className="h-3.5 w-3.5 animate-pulse text-white" /> : <MicOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isMicActive ? "Mute" : "Speak"}</span>
          </Button>

          <Button
            size="sm"
            variant={isCalmingActive ? "primary" : "ghost"}
            onClick={(e) => {
              e.stopPropagation();
              toggleCalmingMusic();
            }}
            title="Play 432Hz Calming Audio"
            className={cn("h-8 px-2.5 text-xs font-semibold gap-1", isCalmingActive && "bg-purple-600 hover:bg-purple-500")}
          >
            <Volume2 className={cn("h-3.5 w-3.5", isCalmingActive && "text-cyan-300 animate-bounce")} />
            <span className="hidden sm:inline">{isCalmingActive ? "Playing" : "Calm"}</span>
          </Button>
        </div>

        {/* Center: PTZ Controller (Pan / Tilt / Zoom) for Tapo C200 style cameras */}
        {camera.hasPtz && (
          <div
            className="flex items-center gap-1 p-1 rounded-lg bg-bg-primary border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => handlePtz("Pan Left")}
              title="Pan Left"
              className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-white transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => handlePtz("Tilt Up")}
                title="Tilt Up"
                className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-white transition-colors"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handlePtz("Tilt Down")}
                title="Tilt Down"
                className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-white transition-colors"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => handlePtz("Pan Right")}
              title="Pan Right"
              className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-white transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Right: Snapshot & Fullscreen */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleSnapshot();
            }}
            title="Take Snapshot"
            className="h-8 px-2.5 text-xs text-text-muted hover:text-white"
          >
            <Camera className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (onFocus) onFocus();
            }}
            title="Focus Camera"
            className="h-8 px-2.5 text-xs text-text-muted hover:text-white"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
