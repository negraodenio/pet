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
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl gradient-primary">
                <span className="text-base">🐾</span>
              </div>
              <span className="text-lg font-bold gradient-text">Compawion</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-accent-primary/8 blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-accent-secondary/8 blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-medium mb-6 animate-fade-in-up">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Pet Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight mb-6 animate-fade-in-up">
            The AI Operating System
            <br />
            <span className="gradient-text">for Your Pets</span>
          </h1>

          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8 animate-fade-in-up">
            Compawion doesn&apos;t just detect motion — it understands events.
            It learns your pet&apos;s behavior, detects anomalies, and acts as
            their digital guardian. 24/7.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fade-in-up">
            <Link href="/register">
              <Button size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
                Start Free Trial
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                See Features
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-8 mt-12 text-xs text-text-muted animate-fade-in">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> End-to-end encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5" /> No app download needed
            </span>
            <span className="flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5" /> Setup in 2 minutes
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary mb-3">
              Not a pet camera.{" "}
              <span className="gradient-text">An AI platform.</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Current pet cameras detect motion. Compawion detects events,
              understands behavior, and acts autonomously.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {[
              {
                icon: Eye,
                title: "Event Detection",
                description:
                  "AI detects sleeping, eating, drinking, barking, vomiting, anxiety, and 12+ more behavioral events.",
              },
              {
                icon: Brain,
                title: "Behavioral Learning",
                description:
                  "Creates a long-term model of your pet's routines — sleep hours, activity levels, eating patterns.",
              },
              {
                icon: Activity,
                title: "Anomaly Detection",
                description:
                  '"Thor is 42% less active today." The AI detects deviations from normal behavior.',
              },
              {
                icon: Zap,
                title: "Autonomous AI",
                description:
                  "Detects anxiety → plays calming music → monitors response → only notifies you if needed.",
              },
              {
                icon: MessageSquare,
                title: "AI Assistant",
                description:
                  '"How was Lola today?" "Compare this week with last week." "Generate a vet report."',
              },
              {
                icon: Camera,
                title: "Multi-Camera Tracking",
                description:
                  "One timeline per pet, not per camera. AI tracks your pet across every room.",
              },
              {
                icon: Heart,
                title: "Health Monitoring",
                description:
                  "Track activity, water intake, eating patterns, sleep quality — all automatically.",
              },
              {
                icon: Bell,
                title: "Smart Notifications",
                description:
                  "Only meaningful alerts with video clips, confidence scores, and recommended actions.",
              },
              {
                icon: Shield,
                title: "Zero Configuration",
                description:
                  "Scan QR code → camera connects → meet your pet. Under 2 minutes, no technical setup.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-6 group"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-accent-primary/15 mb-4 group-hover:bg-accent-primary/25 transition-colors">
                  <feature.icon className="h-6 w-6 text-accent-primary" />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-10">
            <h2 className="text-3xl font-bold text-text-primary mb-3">
              Ready to protect your pet?
            </h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Join thousands of pet owners who trust Compawion as their
              pet&apos;s digital guardian. Start free, no credit card required.
            </p>
            <Link href="/register">
              <Button size="lg" className="glow" iconRight={<ArrowRight className="h-5 w-5" />}>
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🐾</span>
            <span className="text-sm font-semibold gradient-text">Compawion</span>
          </div>
          <p className="text-xs text-text-muted">
            © 2026 Compawion. The AI Operating System for Pets.
          </p>
        </div>
      </footer>
    </div>
  );
}
