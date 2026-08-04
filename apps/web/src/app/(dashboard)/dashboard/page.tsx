import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import {
  Heart,
  Moon,
  Droplets,
  Utensils,
  Activity,
  Wind,
  Smile,
  Clock,
  Video,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Home,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Home",
};

// Story-based timeline items for peace of mind
const sampleStoryTimeline = [
  {
    time: "17:10",
    title: "Sleeping peacefully",
    location: "Living Room",
    icon: Moon,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    video: false,
  },
  {
    time: "14:32",
    title: "Tried to eat garbage",
    location: "Kitchen",
    icon: Video,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    video: true,
    action: "Autonomous voice clip played — Lola stopped.",
  },
  {
    time: "11:15",
    title: "Playing with ball",
    location: "Garden",
    icon: Activity,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    video: false,
  },
  {
    time: "10:20",
    title: "Ate breakfast (220g)",
    location: "Kitchen Feeder",
    icon: Utensils,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    video: false,
  },
  {
    time: "09:40",
    title: "Drank water (180ml)",
    location: "Water Station",
    icon: Droplets,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    video: false,
  },
  {
    time: "08:15",
    title: "Woke up & stretched",
    location: "Smart Bed",
    icon: Moon,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    video: false,
  },
];

export default async function DashboardHomePage() {
  const supabase = await createClient();

  const [petsResult, devicesResult] = await Promise.all([
    supabase.from("pets").select("*").order("name"),
    supabase.from("devices").select("*").order("name"),
  ]);

  const dbPets = petsResult.data ?? [];
  const activePet = dbPets[0] ?? {
    id: "lola",
    name: "Lola",
    species: "dog",
    breed: "Golden Retriever",
    avatar_url: null,
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Mantra Quote */}
      <div className="text-center py-2">
        <p className="text-xs font-mono text-text-muted tracking-widest uppercase">
          &quot;We are not building a product. We are building peace of mind.&quot;
        </p>
      </div>

      {/* Hero Pet Status Card (Apple Health / Calm Style) */}
      <div className="health-card p-8 relative overflow-hidden bg-gradient-to-br from-indigo-950/30 via-bg-secondary to-emerald-950/20 border-emerald-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          {/* Pet Photo & Status */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar src={activePet.avatar_url} alt={activePet.name} size="xl" />
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-black shadow-lg">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  {activePet.name}
                </h1>
                <div className="status-pill-ok text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Everything is OK
                </div>
              </div>
              <p className="text-sm font-medium text-text-secondary mt-1">
                Sleeping peacefully in the Living Room
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted mt-3">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                Last activity: Sleeping • 18 minutes ago
              </div>
            </div>
          </div>

          {/* Health Score Ring (Oura / Whoop Style) */}
          <div className="flex items-center gap-5 p-4 rounded-3xl bg-black/40 border border-white/10 shrink-0">
            <div className="relative h-20 w-20 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray="97, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-extrabold font-mono text-white">97</span>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-text-muted block">
                Health Score
              </span>
              <span className="text-base font-bold text-emerald-400 block">Excellent</span>
              <span className="text-[11px] text-text-muted block mt-0.5">
                No critical alerts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vital Metrics Grid (Apple Health Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Sleep", value: "98", status: "12.5 hrs", icon: Moon, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
          { label: "Activity", value: "94", status: "4.2 hrs", icon: Activity, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
          { label: "Hydration", value: "100", status: "450 ml", icon: Droplets, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
          { label: "Food", value: "95", status: "2 Meals", icon: Utensils, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
          { label: "Respiration", value: "96", status: "18 bpm", icon: Wind, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { label: "Stress", value: "99", status: "Low", icon: Smile, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="health-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted">{item.label}</span>
                <div className={`p-1.5 rounded-lg border ${item.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-extrabold font-mono text-white">{item.value}</span>
                <span className="text-[10px] font-mono text-text-muted">{item.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Story Timeline (Main Feature) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="health-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-400" />
                  Today&apos;s Activities — Story Timeline
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Chronological story of Lola&apos;s day across all rooms
                </p>
              </div>
              <Link
                href="/dashboard/events"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                Full Timeline <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-[1px] before:bg-border/60">
              {sampleStoryTimeline.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-4 relative pl-8">
                    <div className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-bg-primary ${item.color.split(" ")[0]} bg-current`} />
                    <div className="flex-1 p-3.5 rounded-2xl bg-white/[0.02] border border-border/50 hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{item.title}</span>
                          <span className="text-[10px] font-mono text-text-muted px-2 py-0.5 rounded bg-white/[0.04]">
                            {item.location}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-text-muted">{item.time}</span>
                      </div>

                      {item.action && (
                        <p className="text-xs text-indigo-300 mt-1">
                          ✨ {item.action}
                        </p>
                      )}

                      {item.video && (
                        <button className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 hover:bg-indigo-500/30 transition-all">
                          <Video className="h-3.5 w-3.5" /> Watch Clip (12s)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* House Map & Quick Ask AI */}
        <div className="space-y-6">
          {/* House Map (Rooms) */}
          <div className="health-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Home className="h-5 w-5 text-emerald-400" />
                Rooms (House Map)
              </h3>
              <Link href="/dashboard/cameras" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                View Feeds
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { room: "Living Room", pet: "Lola (Sleeping)", status: "Optimal", active: true },
                { room: "Kitchen", pet: "No Pet Present", status: "Clear", active: false },
                { room: "Garden", pet: "No Pet Present", status: "Clear", active: false },
                { room: "Bedroom", pet: "No Pet Present", status: "Clear", active: false },
              ].map((r) => (
                <div key={r.room} className="p-3.5 rounded-2xl bg-white/[0.02] border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{r.room}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{r.pet}</p>
                  </div>
                  {r.active ? (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Pet Present
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-text-muted">Clear</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Assistant Card */}
          <div className="health-card p-6 bg-gradient-to-br from-indigo-950/30 via-bg-secondary to-purple-950/30 border-indigo-500/30">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Ask AI Guardian</h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  &quot;Did Lola eat breakfast?&quot; or &quot;Generate vet report&quot;
                </p>
              </div>
            </div>
            <Link href="/dashboard/assistant">
              <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
                <MessageSquare className="h-4 w-4" /> Start Conversation
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
