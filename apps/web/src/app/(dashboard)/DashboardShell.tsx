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
} from "lucide-react";
import { useState } from "react";

/* =========================================================================
   Dashboard Shell — Sidebar navigation + header + content area
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
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pets", href: "/dashboard/pets", icon: Dog },
  { name: "Cameras", href: "/dashboard/cameras", icon: Camera },
  { name: "Events", href: "/dashboard/events", icon: Activity },
  { name: "Health", href: "/dashboard/health", icon: Heart },
  { name: "AI Assistant", href: "/dashboard/assistant", icon: MessageSquare },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
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
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col",
          "bg-bg-secondary/80 backdrop-blur-xl border-r border-border",
          "transition-transform duration-300 ease-[var(--ease-smooth)]",
          "lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-border shrink-0">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl gradient-primary">
            <span className="text-base">🐾</span>
          </div>
          <div>
            <h1 className="text-base font-bold gradient-text">Compawion</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-text-muted hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-smooth)]",
                  active
                    ? "bg-accent-primary/15 text-accent-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-glass-hover",
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-accent-primary")} />
                {item.name}
                {item.name === "AI Assistant" && (
                  <Badge variant="primary" className="ml-auto text-[10px] px-1.5 py-0">
                    <Zap className="h-2.5 w-2.5" />
                    AI
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pets quick access */}
        {pets.length > 0 && (
          <div className="px-3 py-3 border-t border-border">
            <p className="text-xs font-medium text-text-muted px-3 mb-2 uppercase tracking-wider">
              Your Pets
            </p>
            <div className="space-y-1">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/dashboard/pets/${pet.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm",
                    "text-text-secondary hover:text-text-primary hover:bg-glass-hover",
                    "transition-all duration-[var(--duration-fast)]",
                  )}
                >
                  <Avatar src={pet.avatar_url} alt={pet.name} size="xs" />
                  <span className="truncate">{pet.name}</span>
                  <span className="text-xs text-text-muted capitalize ml-auto">
                    {pet.species === "dog" ? "🐕" : "🐈"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* User section */}
        <div className="px-3 py-3 border-t border-border shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar
              src={profile?.avatar_url}
              alt={profile?.display_name ?? "User"}
              size="sm"
              status="online"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {profile?.display_name ?? "User"}
              </p>
              <p className="text-xs text-text-muted truncate">{user.email}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center h-14 px-4 border-b border-border lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-text-secondary hover:text-text-primary"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 mx-auto">
            <span className="text-base">🐾</span>
            <span className="text-sm font-bold gradient-text">Compawion</span>
          </div>
          <div className="w-9" /> {/* Spacer for centering */}
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
