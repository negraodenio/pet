"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Badge } from "@/shared/components/ui/Badge";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Camera,
  CreditCard,
  Users,
  Shield,
  Check,
  Zap,
  Globe,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* =========================================================================
   System Settings — Interactive configuration for all system parameters
   ========================================================================= */

type TabType = "profile" | "notifications" | "devices" | "family" | "billing" | "security";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: Array<{ id: TabType; label: string; icon: React.ElementType }> = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "devices", label: "Devices & Hardware", icon: Camera },
    { id: "family", label: "Family Access", icon: Users },
    { id: "billing", label: "Subscription Plan", icon: CreditCard },
    { id: "security", label: "Security & Keys", icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-indigo-400" />
          System Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Configure platform parameters, AI sensitivities, notifications, and hardware matrix
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                isActive
                  ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                  : "text-text-muted hover:text-white hover:bg-white/[0.03]",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="glass-panel p-6 border-indigo-500/20">
        {activeTab === "profile" && (
          <div className="space-y-6 max-w-xl">
            <h3 className="text-base font-bold text-white">Owner Account Details</h3>
            <Input label="Display Name" defaultValue="Admin Account" />
            <Input label="Primary Email" defaultValue="owner@compawion.com" type="email" />
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Timezone</label>
              <select className="w-full h-10 rounded-lg bg-bg-secondary border border-border text-xs text-white px-3 focus:border-accent-primary focus:outline-none">
                <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                <option>(UTC+00:00) UTC / Western European Time</option>
                <option>(UTC-03:00) Brasilia Time</option>
              </select>
            </div>
            <Button onClick={handleSave} icon={saved ? <Check className="h-4 w-4 text-emerald-400" /> : undefined}>
              {saved ? "Saved Successfully!" : "Save Profile Settings"}
            </Button>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6 max-w-xl">
            <h3 className="text-base font-bold text-white">Alert Rules & Sensitivity</h3>
            <div className="space-y-4">
              {[
                { label: "Vomiting & Distress Alerts", desc: "Immediate push notification for vomiting or seizure signals", default: true },
                { label: "Anxiety & Pacing Audio Resolution", desc: "Allow AI to play calming music before escalating", default: true },
                { label: "Door Barking Notifications", desc: "Notify when barking exceeds 5 continuous minutes", default: true },
                { label: "Daily Summary Push", desc: "Receive evening overview digest at 8:00 PM", default: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-border/50">
                  <div>
                    <p className="text-xs font-bold text-white">{item.label}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked={item.default} className="h-4 w-4 accent-indigo-500 rounded cursor-pointer" />
                </div>
              ))}
            </div>
            <Button onClick={handleSave}>Save Notification Rules</Button>
          </div>
        )}

        {activeTab === "devices" && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white">Hardware Ecosystem Matrix</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { name: "Living Room Cam", type: "AI Camera", status: "Online", serial: "CAM-8F42-PRO" },
                { name: "Kitchen Feeder Vision", type: "AI Camera", status: "Online", serial: "CAM-9A12-PRO" },
                { name: "Smart Water Feeder", type: "AI Water Station", status: "Paired", serial: "WTR-11B2" },
                { name: "Compawion Collar Tag", type: "AI Collar", status: "Paired", serial: "TAG-44C1" },
              ].map((dev) => (
                <div key={dev.serial} className="p-4 rounded-xl bg-white/[0.02] border border-border/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{dev.name}</p>
                    <p className="text-[10px] text-text-muted font-mono">{dev.type} • {dev.serial}</p>
                  </div>
                  <Badge variant={dev.status === "Online" ? "success" : "info"}>{dev.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "family" && (
          <div className="space-y-6 max-w-xl">
            <h3 className="text-base font-bold text-white">Family Access & Roles</h3>
            <p className="text-xs text-text-secondary">Invite family members to view camera feeds and receive pet notifications.</p>
            <div className="flex gap-2">
              <Input placeholder="family@example.com" className="flex-1" />
              <Button>Send Invite</Button>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white">Current Subscription Tier</h3>
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">COMPAWION PRO GUARDIAN</span>
                  <Badge variant="primary">ACTIVE</Badge>
                </div>
                <p className="text-xs text-text-muted mt-1">Unlimited Cameras • Unlimited Pets • Autonomous AI • Clinical Vet PDF</p>
              </div>
              <span className="text-xl font-bold font-mono text-white">$19.99 / mo</span>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6 max-w-xl">
            <h3 className="text-base font-bold text-white">Security & API Keys</h3>
            <Input label="New Password" type="password" placeholder="••••••••" />
            <Input label="Confirm New Password" type="password" placeholder="••••••••" />
            <Button onClick={handleSave}>Update Security</Button>
          </div>
        )}
      </div>
    </div>
  );
}
