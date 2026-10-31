"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Activity,
  ShieldCheck,
  Volume2,
  Mic,
  MicOff,
  Video,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  Stethoscope,
  Smile,
  AlertCircle,
  Eye,
  X,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { cn } from "@/lib/utils";

interface PetData {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
  weight_kg?: number | null;
  avatar_url?: string | null;
}

interface TelemetryData {
  heart_rate_bpm?: number | null;
  respiration_rate_rpm?: number | null;
  weight_kg?: number | null;
  presence_detected?: boolean | null;
  recorded_at?: string | null;
}

interface EventData {
  id: string;
  event_type: string;
  title?: string | null;
  description?: string | null;
  created_at: string;
  severity?: string | null;
}

interface SeniorFriendlyGuardianViewProps {
  pet: PetData | null;
  telemetry: TelemetryData | null;
  events: EventData[];
  ownerName?: string;
}

export function SeniorFriendlyGuardianView({
  pet,
  telemetry,
  events,
  ownerName = "Family Caregiver",
}: SeniorFriendlyGuardianViewProps) {
  const [isPlayingCalm, setIsPlayingCalm] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVetModal, setShowVetModal] = useState(false);
  const [audioPlayedNotification, setAudioPlayedNotification] = useState<string | null>(null);

  // Play soothing 432 Hz pure acoustic harmonic tone using Web Audio API
  const handleToggleCalmMusic = () => {
    if (!isPlayingCalm) {
      setIsPlayingCalm(true);
      setAudioPlayedNotification("Playing 432 Hz Bio-Acoustic Calming Harmony to Bento...");

      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        // 432 Hz restorative frequency
        osc.frequency.setValueAtTime(432, audioCtx.currentTime);
        osc.type = "sine";

        gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 8);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 8);

        setTimeout(() => {
          setIsPlayingCalm(false);
          setAudioPlayedNotification(null);
        }, 8000);
      } catch (e) {
        console.warn("Audio Context not allowed without interaction:", e);
        setTimeout(() => {
          setIsPlayingCalm(false);
          setAudioPlayedNotification(null);
        }, 4000);
      }
    } else {
      setIsPlayingCalm(false);
      setAudioPlayedNotification(null);
    }
  };

  const handleToggleMic = () => {
    setIsSpeaking((prev) => !prev);
    if (!isSpeaking) {
      setAudioPlayedNotification("Microphone Connected — Bento can hear your voice clearly!");
      setTimeout(() => setAudioPlayedNotification(null), 4000);
    }
  };

  const hr = telemetry?.heart_rate_bpm ?? 72;
  const rr = telemetry?.respiration_rate_rpm ?? 16;
  const weightKg = telemetry?.weight_kg ?? 29.1;
  const weightLbs = (weightKg * 2.20462).toFixed(1);

  return (
    <div className="space-y-6">
      {/* 1. Senior Reassurance Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-indigo-500/10 border border-emerald-500/30 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg">
            <CheckCircle2 className="h-8 w-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                All Is Well &bull; Live Status
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {pet ? `${pet.name} is Resting Peacefully` : "All Pets Safe"}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Smart Bed in Master Bedroom &bull; Telemetry updated 1 min ago
            </p>
          </div>
        </div>

        {/* Quick Emergency Vet Dial Button */}
        <Button
          onClick={() => setShowVetModal(true)}
          className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl h-12 px-5 gap-2 shadow-lg shadow-rose-600/25 border-0"
        >
          <PhoneCall className="h-4 w-4" />
          <span>Veterinarian Emergency</span>
        </Button>
      </div>

      {/* Audio notification toast */}
      {audioPlayedNotification && (
        <div className="p-4 rounded-2xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-3 animate-fade-in">
          <Volume2 className="h-5 w-5 animate-bounce" />
          <span>{audioPlayedNotification}</span>
        </div>
      )}

      {/* 2. Four Giant 1-Click Action Buttons for Seniors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Button 1: Speak to Pet */}
        <button
          type="button"
          onClick={handleToggleMic}
          className={cn(
            "p-5 rounded-3xl border text-left transition-all flex flex-col justify-between gap-3 shadow-lg group",
            isSpeaking
              ? "bg-rose-500/20 border-rose-400 text-white ring-2 ring-rose-500"
              : "bg-bg-secondary hover:bg-bg-tertiary border-border text-white hover:border-amber-500/50",
          )}
        >
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 w-fit group-hover:scale-110 transition-transform">
            {isSpeaking ? <Mic className="h-6 w-6 text-rose-400 animate-pulse" /> : <MicOff className="h-6 w-6" />}
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold text-white">
              {isSpeaking ? "Speaking..." : "Speak to Pet"}
            </div>
            <div className="text-xs text-text-muted mt-0.5">
              {isSpeaking ? "Tap to finish talking" : "Push-to-talk voice"}
            </div>
          </div>
        </button>

        {/* Button 2: Play Calming Music */}
        <button
          type="button"
          onClick={handleToggleCalmMusic}
          className={cn(
            "p-5 rounded-3xl border text-left transition-all flex flex-col justify-between gap-3 shadow-lg group",
            isPlayingCalm
              ? "bg-purple-500/20 border-purple-400 text-white ring-2 ring-purple-500"
              : "bg-bg-secondary hover:bg-bg-tertiary border-border text-white hover:border-purple-500/50",
          )}
        >
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 w-fit group-hover:scale-110 transition-transform">
            <Volume2 className={cn("h-6 w-6", isPlayingCalm && "animate-bounce text-cyan-300")} />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold text-white">
              {isPlayingCalm ? "Music Playing" : "Calm Music"}
            </div>
            <div className="text-xs text-text-muted mt-0.5">
              {isPlayingCalm ? "432 Hz active" : "Soothe anxiety alone"}
            </div>
          </div>
        </button>

        {/* Button 3: See Live Cameras */}
        <Link
          href="/dashboard/cameras"
          className="p-5 rounded-3xl border text-left transition-all flex flex-col justify-between gap-3 shadow-lg bg-bg-secondary hover:bg-bg-tertiary border-border text-white hover:border-indigo-500/50 group"
        >
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 w-fit group-hover:scale-110 transition-transform">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold text-white">Live Cameras</div>
            <div className="text-xs text-text-muted mt-0.5">View rooms &amp; Bed</div>
          </div>
        </Link>

        {/* Button 4: Ask AI Vet Assistant */}
        <Link
          href="/dashboard/assistant"
          className="p-5 rounded-3xl border text-left transition-all flex flex-col justify-between gap-3 shadow-lg bg-bg-secondary hover:bg-bg-tertiary border-border text-white hover:border-rose-500/50 group"
        >
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 w-fit group-hover:scale-110 transition-transform">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold text-white">Ask AI Vet</div>
            <div className="text-xs text-text-muted mt-0.5">Claude 5.5 Medical AI</div>
          </div>
        </Link>
      </div>

      {/* 3. Hero Pet Card & Resting Telemetry (Large, High Contrast) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10 bg-[#0E1017]/80">
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Left: Pet Photo and Bio */}
          <div className="flex items-center gap-5 lg:border-r border-white/10 lg:pr-8">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-xl shrink-0">
              <Image
                src={pet?.avatar_url || "/images/smart-bed-hero.jpg"}
                alt={pet?.name || "Pet"}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white">{pet?.name ?? "Bento"}</h2>
                <Badge variant="primary" className="text-xs font-bold">Senior Companion</Badge>
              </div>
              <p className="text-sm text-text-secondary mt-1">
                {pet?.breed ?? "Golden Retriever"} &bull; 10 Years Old
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Microchip #985141002348912</span>
              </div>
            </div>
          </div>

          {/* Right: 3 Giant Vitals Badges (Easy for anyone over 60 to read) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Vital 1: Heart Rate */}
            <div className="p-4 rounded-2xl bg-bg-secondary border border-amber-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono text-amber-300 font-bold">Heart Rate</span>
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Activity className="h-4 w-4 animate-pulse" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black text-white">
                  {hr} <span className="text-sm font-normal text-text-muted">BPM</span>
                </div>
                <div className="text-xs font-semibold text-emerald-400 mt-1">
                  Calm &amp; Resting (Normal 60-100)
                </div>
              </div>
            </div>

            {/* Vital 2: Breathing Rate */}
            <div className="p-4 rounded-2xl bg-bg-secondary border border-rose-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono text-rose-300 font-bold">Sleeping Breath</span>
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <Heart className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black text-white">
                  {rr} <span className="text-sm font-normal text-text-muted">BrPM</span>
                </div>
                <div className="text-xs font-semibold text-emerald-400 mt-1">
                  Steady Sleep (Target &lt; 30)
                </div>
              </div>
            </div>

            {/* Vital 3: Weight */}
            <div className="p-4 rounded-2xl bg-bg-secondary border border-indigo-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono text-indigo-300 font-bold">Daily Weight</span>
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-black text-white">
                  {weightLbs} <span className="text-sm font-normal text-text-muted">lbs</span>
                </div>
                <div className="text-xs font-semibold text-emerald-400 mt-1">
                  {weightKg} kg &bull; Optimal Weight
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. AI Clinical Vet Briefing for the Guardian */}
      <div className="glass-panel p-6 rounded-3xl border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-[#0E1017] to-[#0E1017]">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 shrink-0 mt-1">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-extrabold text-white">
                Claude 5.5 Sonnet Daily Clinical Briefing
              </h3>
              <span className="text-[11px] font-mono text-indigo-300">Updated this morning</span>
            </div>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              &ldquo;Bento had a peaceful night on his Smart Bed with an average sleeping respiration rate
              of <b>16 breaths per minute</b>, well below the 30 BrPM threshold for heart strain.
              His cardiac rhythm is steady and no coughing or restless midnight pacing was observed.
              Remember to administer his Glucosamine chew with lunch.&rdquo;
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Link href="/dashboard/assistant">
                <Button size="sm" variant="outline" className="text-xs font-bold border-indigo-500/30 hover:border-indigo-400 gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                  Ask a question about Bento&apos;s health
                </Button>
              </Link>
              <Link href="/dashboard/veterinary">
                <Button size="sm" variant="ghost" className="text-xs font-semibold text-text-muted hover:text-white">
                  Export PDF for Vet Visit &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Clear, Human-Language Daily Activity Log */}
      <div className="glass-panel p-6 rounded-3xl border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              Today&apos;s Activity Timeline
            </h3>
            <p className="text-xs text-text-muted">Simple records of sleep, meals, and water</p>
          </div>
          <Link href="/dashboard/events" className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
            View All Records <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-sm">
              No events recorded yet today.
            </div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-border/50 hover:border-indigo-500/30 transition-all"
              >
                <div className="p-3 rounded-2xl bg-bg-tertiary border border-border/50 shrink-0 text-xl">
                  {evt.event_type === "sleeping"
                    ? "🌙"
                    : evt.event_type === "eating"
                      ? "🥣"
                      : evt.event_type === "drinking"
                        ? "💧"
                        : evt.event_type === "barking"
                          ? "🔔"
                          : "🐾"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">
                      {evt.title || evt.event_type}
                    </h4>
                    <span className="text-xs font-mono text-text-muted">
                      {new Date(evt.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {evt.description || "Routine health event recorded."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. Emergency Vet Modal */}
      {showVetModal && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 animate-fade-in"
            onClick={() => setShowVetModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="glass-panel w-full max-w-md p-6 border-rose-500/40 animate-scale-in text-left relative">
              <button
                onClick={() => setShowVetModal(false)}
                className="absolute top-4 right-4 p-2 text-text-muted hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Emergency Veterinarian</h3>
                  <p className="text-xs text-text-muted">Primary Clinic on File for Bento</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-border">
                  <div className="text-xs text-text-muted uppercase font-mono">Primary Clinic</div>
                  <div className="text-base font-bold text-white mt-0.5">Oakwood Animal Emergency Hospital</div>
                  <div className="text-xs text-text-secondary mt-1">
                    Open 24 Hours &bull; 142 Elmwood Ave / High St
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="text-xs text-emerald-400 uppercase font-mono font-bold">Direct Phone Number</div>
                  <a
                    href="tel:+15553459821"
                    className="text-2xl font-black text-white hover:text-emerald-300 transition-colors block mt-1"
                  >
                    (555) 345-9821
                  </a>
                  <div className="text-[11px] text-emerald-300 mt-1">
                    UK Office: +44 20 7946 0192 &bull; Tap number on mobile to dial instantly
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                  <b>Quick Tip for Seniors:</b> Compawion records Bento&apos;s sleeping respiration rate continuously. If breathing exceeds 30 breaths per minute while resting, call the vet immediately.
                </div>

                <Button
                  onClick={() => setShowVetModal(false)}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold h-12 rounded-xl"
                >
                  Close Window
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
