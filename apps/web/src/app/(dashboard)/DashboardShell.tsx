"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar } from "@/shared/components/ui/Avatar";
import { logoutAction } from "@/server/actions/auth";
import {
  Home,
  Heart,
  Dog,
  Brain,
  LayoutGrid,
  Cpu,
  Stethoscope,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

/* =========================================================================
   PROJECT ONE (PO-0160) — Domain-Driven Experience (DDX) Navigation
   Nine Core Business Domains:
   1. 🏠 Home          (/dashboard)
   2. 🐾 Companion     (/dashboard/pets)
   3. 🧠 Intelligence  (/dashboard/assistant)
   4. ❤️ Health        (/dashboard/health)
   5. 🏡 Home Spaces   (/dashboard/cameras)
   6. 🔌 Devices       (/dashboard/devices)
   7. 👨‍⚕️ Veterinary    (/dashboard/veterinary)
   8. 👨‍👩‍👧 Family        (/dashboard/family)
   9. ⚙️ Platform      (/dashboard/settings)
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
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Companion", href: "/dashboard/pets", icon: Dog },
  { name: "Intelligence", href: "/dashboard/assistant", icon: Brain },
  { name: "Health", href: "/dashboard/health", icon: Heart },
  { name: "Home Spaces", href: "/dashboard/cameras", icon: LayoutGrid },
  { name: "Devices", href: "/dashboard/devices", icon: Cpu },
  { name: "Veterinary", href: "/dashboard/veterinary", icon: Stethoscope },
  { name: "Family", href: "/dashboard/family", icon: Users },
  { name: "Platform", href: "/dashboard/settings", icon: Settings },
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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Apple-style Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col",
          "bg-bg-secondary/80 backdrop-blur-2xl border-r border-border",
          "transition-transform duration-300 ease-out",
          "lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-border/50 shrink-0 justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-bg-primary rounded-[15px] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block leading-none">
                Project One
              </span>
              <span className="text-[10px] text-text-muted font-medium mt-1 block">
                Companion Intelligence OS
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-text-muted hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Status Banner */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-300">All Companions Safe</span>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
        </div>

        {/* Domain Driven Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-semibold tracking-wide",
                  "transition-all duration-200 ease-out",
                  active
                    ? "bg-white/[0.08] text-white border border-white/10 shadow-lg shadow-black/40"
                    : "text-text-secondary hover:text-white hover:bg-white/[0.04]",
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-indigo-400" : "text-text-muted")} />
                <span className="flex-1 truncate">{item.name}</span>
                {item.name === "Intelligence" && (
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Registered Companions Switcher */}
        {pets.length > 0 && (
          <div className="px-4 py-3 border-t border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Companions
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Everything OK</span>
            </div>
            <div className="space-y-1">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/dashboard/pets/${pet.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium",
                    "text-text-secondary hover:text-white hover:bg-white/[0.04] transition-all",
                  )}
                >
                  <Avatar src={pet.avatar_url} alt={pet.name} size="xs" />
                  <span className="truncate font-semibold text-white">{pet.name}</span>
                  <span className="ml-auto text-[10px] text-emerald-400 font-mono">98</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* User Account */}
        <div className="px-3 py-3 border-t border-border/50 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/[0.02] border border-border/50">
            <Avatar
              src={profile?.avatar_url}
              alt={profile?.display_name ?? "User"}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {profile?.display_name ?? "Family Home"}
              </p>
              <p className="text-[10px] text-text-muted truncate">{user.email}</p>
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
        <header className="flex items-center h-16 px-4 border-b border-border/50 lg:hidden shrink-0 bg-bg-secondary/80 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-text-secondary hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 mx-auto">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-extrabold tracking-tight text-white">
              Project One
            </span>
          </div>
          <div className="w-9" />
        </header>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
