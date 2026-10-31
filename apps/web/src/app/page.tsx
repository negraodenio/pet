import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Radio,
  CheckCircle2,
  Activity,
  Volume2,
  Stethoscope,
  Smile,
  BedDouble,
  Video,
  Tablet,
  Star,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Shield,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";

export const metadata = {
  title: "Compawion Care — Invisible Health & Wellness for Your Pet",
  description:
    "The world's first invisible pet health ecosystem. Smart Orthopedic Bed with continuous heart rate and sleep telemetry, AI CCTV cameras, and 24/7 veterinary intelligence.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0B10] text-[#E8ECF5] selection:bg-amber-500 selection:text-black font-sans antialiased">
      {/* 1. Global Navigation Bar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0A0B10]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 p-[1.5px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <div className="h-full w-full bg-[#0E1017] rounded-[14px] flex items-center justify-center">
                  <span className="text-xl">🐾</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-white">
                    COMPAWION
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    CARE
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-medium">
                  Invisible Pet Health Intelligence
                </span>
              </div>
            </Link>

            {/* Quick Anchor Links (Desktop) */}
            <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-text-secondary">
              <a href="#smart-bed" className="hover:text-amber-400 transition-colors">
                The Smart Bed
              </a>
              <a href="#cameras" className="hover:text-amber-400 transition-colors">
                AI Vision CCTV
              </a>
              <a href="#ipad-station" className="hover:text-amber-400 transition-colors">
                iPad Station
              </a>
              <a href="#pricing" className="hover:text-amber-400 transition-colors">
                Plans &amp; Pricing
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-text-secondary hover:text-white"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="text-xs font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-lg shadow-amber-500/20 border-0 rounded-xl px-4 py-2"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section (Warm, Loving, Ultra-Premium) */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Warm Ambient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-indigo-600/10 blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Heartwarming Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6 animate-fade-in shadow-sm">
            <Heart className="h-4 w-4 text-rose-400 fill-rose-400 animate-pulse" />
            <span>Pure peace of mind for pet parents who love their dogs and cats like family</span>
          </div>

          {/* Emotional Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            All they have to do is sleep.
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
              We watch over their heart, breath, and health.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-8">
            <b>Zero uncomfortable wearables. Zero daily stress.</b> Your dog or cat rests
            on an orthopedic smart bed with invisible medical-grade sensors that monitor heart rate,
            respiratory rate, weight, and sleep quality — warning you and your veterinarian before
            subtle symptoms turn into emergencies.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-sm font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-xl shadow-amber-500/25 border-0 rounded-2xl gap-2"
              >
                Claim Your Launch Offer <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-sm font-semibold border-white/15 bg-white/5 hover:bg-white/10 text-white rounded-2xl gap-2"
              >
                Explore Live Demo Hub
              </Button>
            </Link>
          </div>

          {/* Social Proof Strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted font-medium mb-16">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-white font-bold">4.9/5</span>
              <span>from US &amp; UK Pet Parents</span>
            </div>
            <span className="hidden sm:inline text-white/20">&bull;</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>100% Collar-Free &amp; Wearable-Free</span>
            </div>
            <span className="hidden sm:inline text-white/20">&bull;</span>
            <div className="flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-indigo-400" />
              <span>Vet-Ready Clinical Health Exports</span>
            </div>
          </div>

          {/* Hero Visual Showcase — Real Sleeping Dog on Smart Bed with Glassmorphic Telemetry HUD */}
          <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/80 max-w-5xl mx-auto group">
            {/* The Generated High-End Photo */}
            <div className="relative aspect-[16/9] w-full bg-slate-900">
              <Image
                src="/images/smart-bed-hero.jpg"
                alt="Golden retriever resting peacefully on Compawion orthopedic smart bed in a sunlit living room"
                fill
                priority
                className="object-cover group-hover:scale-[1.01] transition-transform duration-700"
              />
              {/* Subtle gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
            </div>

            {/* Floating Glassmorphic Telemetry Cards Over the Image */}
            <div className="absolute bottom-4 sm:bottom-8 inset-x-4 sm:inset-x-8 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
              {/* Card 1: Heart Rate */}
              <div className="glass-panel p-3.5 sm:p-4 border-amber-500/30 bg-[#0E1017]/80 backdrop-blur-xl flex items-center gap-3 w-full sm:w-auto text-left shadow-xl animate-fade-in">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Activity className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-amber-300 font-bold">
                    Heart Rate (BCG Ballistocardiogram)
                  </div>
                  <div className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                    74 <span className="text-xs font-normal text-text-muted">BPM</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-sans font-bold">
                      Calm &amp; Resting
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Respiration Rate */}
              <div className="glass-panel p-3.5 sm:p-4 border-rose-500/30 bg-[#0E1017]/80 backdrop-blur-xl flex items-center gap-3 w-full sm:w-auto text-left shadow-xl animate-fade-in">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-rose-300 font-bold">
                    Sleeping Respiration Rate (SRR)
                  </div>
                  <div className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                    18 <span className="text-xs font-normal text-text-muted">BrPM</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-sans font-bold">
                      Deep REM
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Continuous Weight Scale */}
              <div className="glass-panel p-3.5 sm:p-4 border-indigo-500/30 bg-[#0E1017]/80 backdrop-blur-xl flex items-center gap-3 w-full sm:w-auto text-left shadow-xl animate-fade-in">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-indigo-300 font-bold">
                    Automatic Daily Weigh-In
                  </div>
                  <div className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                    62.5 <span className="text-xs font-normal text-text-muted">lbs (28.4 kg)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-sans font-bold">
                      Optimal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 3 Core Pillars of Compawion (How the System Works) */}
      <section id="smart-bed" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#0E1017]/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="primary" className="mb-3">
              The 3-Pillar Ecosystem
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Invisible hardware in your home.
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
                Every vital sign in the palm of your hand.
              </span>
            </h2>
            <p className="text-sm text-text-secondary mt-3">
              We engineered three elegant layers that connect in seconds to build the world&apos;s
              most advanced, non-invasive health safety net for companion animals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pillar 1: Smart Mat */}
            <div className="glass-panel p-6 border-amber-500/20 hover:border-amber-500/40 transition-all rounded-3xl flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 w-fit mb-5">
                  <BedDouble className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  1. The Invisible Smart Bed
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Medical-grade orthopedic memory foam with a machine-washable cover and
                  <b> invisible piezoelectric BCG sensors</b>. Detects micro-cardiac contractions
                  and respiratory expansion without anything touching your pet&apos;s skin.
                </p>
                <ul className="space-y-2 text-xs text-text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                    Sleep heart rate &amp; breathing telemetry
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                    Four strain-gauge load cells for daily weigh-ins
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                    Chew-resistant magnetic breakaway power cable
                  </li>
                </ul>
              </div>
              <div className="pt-6 border-t border-white/5 mt-6">
                <span className="text-[11px] font-mono text-amber-300">
                  Zero wearables &bull; Orthopedic joint relief
                </span>
              </div>
            </div>

            {/* Pillar 2: CCTV Cameras with AI */}
            <div id="cameras" className="glass-panel p-6 border-indigo-500/20 hover:border-indigo-500/40 transition-all rounded-3xl flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 w-fit mb-5">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  2. Clinical AI Camera Matrix
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Works seamlessly with budget-friendly Wi-Fi cameras (like the <b>$25 TP-Link Tapo C200</b> or Reolink).
                  Our vision AI filters out shadows, wind, and robot vacuums to alert only on genuine health events:
                  retching, coughing, pacing, or limping.
                </p>
                <ul className="space-y-2 text-xs text-text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    Automated cough, retch, &amp; seizure flagging
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    Multi-room CCTV grid with real-time WebRTC
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    Motorized PTZ pan/tilt and two-way voice talk
                  </li>
                </ul>
              </div>
              <div className="pt-6 border-t border-white/5 mt-6">
                <span className="text-[11px] font-mono text-indigo-300">
                  Plug &amp; Play RTSP &bull; Zero false alarm fatigue
                </span>
              </div>
            </div>

            {/* Pillar 3: iPad Station & AI Vet */}
            <div id="ipad-station" className="glass-panel p-6 border-rose-500/20 hover:border-rose-500/40 transition-all rounded-3xl flex flex-col justify-between">
              <div>
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 w-fit mb-5">
                  <Tablet className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  3. iPad Station &amp; 24/7 AI Vet Assistant
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Repurpose any new or idle iPad on a kitchen stand as an interactive sentinel.
                  Plays 432 Hz bio-acoustic calming music when separation anxiety is sensed,
                  powered by <b>Claude 5.5 Sonnet</b> to interpret health questions anytime.
                </p>
                <ul className="space-y-2 text-xs text-text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-400" />
                    Automatic sound therapy for barking &amp; whining
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-400" />
                    24/7 clinical AI chat grounded in your pet&apos;s vitals
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-rose-400" />
                    1-click exportable PDF records for veterinary visits
                  </li>
                </ul>
              </div>
              <div className="pt-6 border-t border-white/5 mt-6">
                <span className="text-[11px] font-mono text-rose-300">
                  Calms anxiety alone &bull; Diagnostic support
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Lifestyle Feature Showcase — iPad Station on Counter with Happy Dog */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Dedicated Ambient Station</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Turn your countertop iPad into an always-on guardian for your pet.
            </h2>

            <p className="text-sm text-text-secondary leading-relaxed">
              Dock your iPad on a sleek wooden stand in the kitchen or living room. Compawion OS
              runs seamlessly as an ambient kiosk: displaying live resting vitals, offering 1-tap
              push-to-talk, and utilizing front-camera vision to notice when your pet drinks water
              or asks to go outside.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                  <Volume2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Bio-Acoustic Calming Protocol</h4>
                  <p className="text-[11px] text-text-muted">
                    If your pet barks at the door or shows signs of separation distress while you&apos;re away,
                    the station automatically initiates soothing 432 Hz psychoacoustic tracks or your recorded voice.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Longitudinal Clinical Dossier</h4>
                  <p className="text-[11px] text-text-muted">
                    No more guessing at the vet clinic: &ldquo;Did the limping start Tuesday or Wednesday?&rdquo;
                    The app creates a structured clinical timeline complete with heart rate trendlines and timestamped video clips.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Showcase */}
          <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/80 aspect-[4/3] bg-slate-900 group">
            <Image
              src="/images/tablet-station.jpg"
              alt="Kitchen island with iPad in wooden stand displaying Compawion OS and a happy golden retriever nearby"
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-[#0E1017]/80 backdrop-blur-md border border-white/10 text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                Kiosk Mode Active &bull; Kitchen Ambient Station
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                Ultra-low latency local stream &bull; All rooms protected.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Emotional Peace of Mind Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-white/10 bg-[#0E1017]/40">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/80 aspect-[4/3] bg-slate-900 group order-2 lg:order-1">
            <Image
              src="/images/peace-of-mind.jpg"
              alt="Smiling pet parent petting a peaceful dog and cat resting on a warm living room rug"
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-[#0E1017]/80 backdrop-blur-md border border-white/10 text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Heart className="h-3 w-3 text-rose-400 fill-rose-400" />
                More healthy years with the ones you love most
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                Early detection of heart failure &amp; kidney disease can add up to 3 joyful years to pet lifespans.
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-6 text-left order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              <Smile className="h-3.5 w-3.5 text-rose-400" />
              <span>Guilt-Free Pet Parenting</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Never leave the house with that knot in your stomach again.
            </h2>

            <p className="text-sm text-text-secondary leading-relaxed">
              Animals have a deep evolutionary instinct to mask weakness and pain. By the time
              a dog or cat visibly acts sick, their underlying condition is often already advanced.
            </p>

            <p className="text-sm text-text-secondary leading-relaxed">
              Compawion tracks the quiet, micro-physiological signals that the human eye cannot see:
              subtle elevations in sleeping respiratory rate, altered sleep continuity, and gradual
              weight loss. It is the gold standard of care your best friend deserves.
            </p>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
              &ldquo;As a pet parent to an 11-year-old rescue dog with early congestive heart failure,
              being able to glance at my phone and verify that his sleeping breath rate is steady at 16 BrPM
              has given me my nights of sleep back.&rdquo;
              <div className="text-[11px] font-bold text-white mt-1.5">
                — Sarah &amp; David M., London, UK &bull; Foster &amp; Senior Pet Advocates
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing & Pre-Order Kits */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <Badge variant="primary" className="mb-3">
          Transparent Pricing
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Choose how you want to protect your pet.
        </h2>
        <p className="text-sm text-text-secondary mt-2 max-w-xl mx-auto">
          No lock-in contracts. Cancel or upgrade anytime in 1 click.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-14 text-left">
          {/* Card 1: App Only */}
          <div className="glass-panel p-8 rounded-3xl border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Digital Plan &bull; Bring Your Own Devices
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Compawion Care</h3>
              <p className="text-xs text-text-secondary mb-6">
                Perfect if you already have an iPad, tablet, or compatible Wi-Fi cameras (Tapo, Reolink, etc.) at home.
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">$9.99</span>
                <span className="text-xs text-text-muted font-mono">/ month (£7.99 UK)</span>
              </div>

              <ul className="space-y-3 text-xs text-text-secondary mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Unlimited app access &amp; CCTV live dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Edge AI monitoring for up to 3 cameras simultaneously
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  24/7 Claude 5.5 Sonnet Veterinary AI Companion
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Printable &amp; exportable veterinary health records
                </li>
              </ul>
            </div>

            <Link href="/register" className="w-full">
              <Button variant="outline" className="w-full h-12 text-xs font-bold rounded-xl border-white/20 hover:border-white/40">
                Start 14-Day Free Trial
              </Button>
            </Link>
          </div>

          {/* Card 2: Complete Hardware Kit (Highlight) */}
          <div className="glass-panel p-8 rounded-3xl border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-[#0E1017] to-[#0E1017] shadow-2xl shadow-amber-500/10 relative flex flex-col justify-between">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
              Most Popular &bull; US &amp; UK Launch Kit
            </div>

            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                Full Physical Kit + 3 Months Included
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Smart Bed Guardian Kit</h3>
              <p className="text-xs text-text-secondary mb-6">
                Delivered right to your doorstep: Complete orthopedic smart bed with embedded telemetry + 1080p HD AI camera.
              </p>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black text-white">$99.00</span>
                <span className="text-xs text-text-muted font-mono">one-time (£79.00 UK)</span>
              </div>
              <p className="text-[11px] text-amber-300 font-medium mb-6">
                Includes 3 months of Compawion Care free (then $9.99/mo)
              </p>

              <ul className="space-y-3 text-xs text-text-secondary mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  <b>1x Orthopedic Smart Bed</b> (washable chew-resistant cover)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  <b>Medical-grade BCG sensors</b> (heart rate, breathing, &amp; weight)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  <b>Magnetic quick-release safety cord</b> (trip-proof)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" />
                  3-year replacement warranty &bull; Fast shipping to US &amp; UK
                </li>
              </ul>
            </div>

            <Link href="/register" className="w-full">
              <Button className="w-full h-12 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-lg shadow-amber-500/25 border-0">
                Reserve Your Guardian Kit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-white/10 py-12 px-4 bg-[#08090D] text-xs text-text-muted">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-lg">🐾</span>
            <span className="font-extrabold text-white tracking-wide">
              COMPAWION CARE
            </span>
            <span className="text-white/20">&bull;</span>
            <span>Invisible Intelligence Watching Over Your Pet</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#smart-bed" className="hover:text-white transition-colors">
              The Smart Bed
            </a>
            <a href="#cameras" className="hover:text-white transition-colors">
              CCTV Cameras
            </a>
            <a href="#ipad-station" className="hover:text-white transition-colors">
              iPad Station
            </a>
            <Link href="/login" className="hover:text-white transition-colors">
              Pet Parent Portal
            </Link>
          </div>

          <p className="font-mono text-[11px]">
            &copy; {new Date().getFullYear()} Compawion OS. Crafted with love for pets across the United States &amp; the United Kingdom.
          </p>
        </div>
      </footer>
    </div>
  );
}
