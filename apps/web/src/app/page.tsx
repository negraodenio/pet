import Link from "next/link";
import {
  Camera,
  Brain,
  Shield,
  Activity,
  MessageSquare,
  Zap,
  ArrowRight,
  Smartphone,
  Wifi,
  Heart,
  Eye,
  Bell,
  ShieldCheck,
  Globe,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-indigo-500 selection:text-white">
      {/* Global Glass Header Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-bg-primary/70 backdrop-blur-2xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[1px]">
                <div className="h-full w-full bg-bg-primary rounded-[11px] flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-wider uppercase text-gradient">
                  COMPAWION
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  OS
                </span>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0 shadow-lg shadow-indigo-500/25">
                  Launch Platform
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-4 overflow-hidden">
        {/* Background glow meshes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-cyan-500/10 blur-[130px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-8 animate-fade-in-up">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            WORLD-CLASS AI OPERATING SYSTEM FOR PETS
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-8">
            The AI Guardian Layer
            <br />
            <span className="text-gradient">for Your Pets</span>
          </h1>

          <p className="text-base sm:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-10">
            This is not a pet camera. This is an autonomous AI platform for pet health, behavior, safety, and wellbeing. Built with Apple & Tesla-grade precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-13 px-8 text-sm font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/25 border-0">
                Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-8 text-sm font-semibold border-border hover:border-indigo-500/40">
                Live Interactive Demo
              </Button>
            </Link>
          </div>

          {/* Key Feature Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            {[
              { label: "Zero Setup", desc: "Scan QR → Connects in <2 min" },
              { label: "Event Detection", desc: "Vomiting, eating, barking, anxiety" },
              { label: "Autonomous AI", desc: "Acts to calm pet before alerting" },
              { label: "Multi-Camera", desc: "1 timeline across all rooms" },
            ].map((item) => (
              <div key={item.label} className="glass-panel p-4 border-indigo-500/20">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {item.label}
                </div>
                <p className="text-[11px] text-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Differentiator Section */}
      <section className="py-24 px-4 border-t border-border/50 bg-bg-secondary/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Motion Cameras Detect Motion.
              <br />
              <span className="text-gradient">COMPAWION Detects EVENTS.</span>
            </h2>
            <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto">
              Our neural network continuously evaluates temporal visual and audio streams to understand exact behavior patterns, health indicators, and emergency signals.
            </p>
          </div>

          {/* Matrix Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Eye,
                title: "20+ Behavior Event Recognitions",
                desc: "Detects sleeping, eating, drinking, barking, vomiting, garbage eating, door scratching, limping, seizure, and anxiety.",
              },
              {
                icon: Brain,
                title: "Long-Term Behavioral Models",
                desc: "Learns each pet's baseline: normal sleep hours, daily water intake, walking gait, and favorite spots to flag anomalies instantly.",
              },
              {
                icon: Zap,
                title: "Autonomous Action Protocol",
                desc: "When anxiety or distress is identified, the AI plays calming audio or recorded voice before escalating notifications to the owner.",
              },
              {
                icon: Camera,
                title: "Multi-Camera Unified Timeline",
                desc: "Kitchen, living room, bedroom, or garden. Your pet has ONE unified behavioral timeline across all hardware sensors.",
              },
              {
                icon: MessageSquare,
                title: "AI Pet Guardian Assistant",
                desc: 'Ask questions like "How was Lola today?", "Show vomiting events this week", or "Generate a full veterinary diagnostic report".',
              },
              {
                icon: Smartphone,
                title: "PWA First — Zero Friction",
                desc: "No native app store download required. Scan the camera QR code, Bluetooth pairs, WiFi configures, and firmware updates automatically.",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-panel p-6 border-border/60 hover:border-indigo-500/40 transition-all">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="border-t border-border py-12 px-4 bg-bg-secondary">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-extrabold tracking-wider uppercase text-gradient">
              COMPAWION OS
            </span>
          </div>
          <p className="text-xs text-text-muted">
            © 2026 COMPAWION OS Inc. All rights reserved. The AI Operating System for Pets.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-muted font-mono">
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" /> GLOBAL PLATFORM
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
