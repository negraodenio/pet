"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import { logoutAction } from "@/server/actions/auth";
import {
  LayoutDashboard,
  Dog,
  Camera,
  Activity,
  MessageSquare,
  Bell,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  ShieldCheck,
  Radio,
  Globe,
} from "lucide-react";
import { useState } from "react";

/* =========================================================================
   Dashboard Shell — World-Class Global Navigation (Apple / Tesla Style)
   ========================================================================= */

interface DashboardShellProps {
  user: { id: string; email: string };
  profile: {
    display_name: string;
    avatar_url: string | null;
    role: string;
  } | null;
  pets: Array<{
    id: string;
    name: string;
    species: string;
    avatar_url: string | null;
  }>;
  children: React.ReactNode;
}

const navigation = [
  { name: "Live Telemetry", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pets & Profiles", href: "/dashboard/pets", icon: Dog },
  { name: "Camera Matrix", href: "/dashboard/cameras", icon: Camera },
  { name: "AI Event Log", href: "/dashboard/events", icon: Activity },
  { name: "Health Analytics", href: "/dashboard/health", icon: Heart },
  { name: "AI Guardian Chat", href: "/dashboard/assistant", icon: MessageSquare },
  { name: "Alert Center", href: "/dashboard/notifications", icon: Bell },
  { name: "System Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardShell({
  user,
  profile,
  pets,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary text-text-primary">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col",
          "bg-bg-secondary/70 backdrop-blur-2xl border-r border-border",
          "transition-transform duration-300 ease-[var(--ease-smooth)]",
          "lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-border shrink-0 justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[1px]">
              <div className="h-full w-full bg-bg-primary rounded-[11px] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-wider uppercase text-gradient">
                  COMPAWION
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  OS
                </span>
              </div>
              <p className="text-[10px] text-text-muted font-medium tracking-tight">
                AI PET GUARDIAN v1.0
              </p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-text-muted hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global System Status Pill */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-text-primary">AI Core Active</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              99.9%
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide",
                  "transition-all duration-200 ease-out",
                  active
                    ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]",
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-indigo-400" : "text-text-muted")} />
                <span className="flex-1 truncate">{item.name}</span>
                {item.name === "AI Guardian Chat" && (
                  <Badge variant="primary" className="text-[9px] px-1.5 py-0 font-mono">
                    PRO
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Registered Pets Quick Switcher */}
        {pets.length > 0 && (
          <div className="px-3 py-3 border-t border-border/60">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Monitored Companions
              </span>
              <span className="text-[10px] font-mono text-indigo-400">{pets.length} active</span>
            </div>
            <div className="space-y-1">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/dashboard/pets/${pet.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium",
                    "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]",
                    "transition-all duration-150",
                  )}
                >
                  <Avatar src={pet.avatar_url} alt={pet.name} size="xs" />
                  <span className="truncate font-semibold text-text-primary">{pet.name}</span>
                  <span className="ml-auto text-[10px] font-mono text-text-muted capitalize">
                    {pet.species}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* User Footer */}
        <div className="px-3 py-3 border-t border-border shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-border/50">
            <Avatar
              src={profile?.avatar_url}
              alt={profile?.display_name ?? "User"}
              size="sm"
              status="online"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">
                {profile?.display_name ?? "Account"}
              </p>
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-text-muted" />
                <span className="text-[10px] text-text-muted font-mono uppercase">Global Org</span>
              </div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center h-14 px-4 border-b border-border lg:hidden shrink-0 bg-bg-secondary/80 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-text-secondary hover:text-text-primary"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 mx-auto">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-extrabold tracking-wider uppercase text-gradient">
              COMPAWION OS
            </span>
          </div>
          <div className="w-9" />
        </header>

        {/* Scrollable Dashboard Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
