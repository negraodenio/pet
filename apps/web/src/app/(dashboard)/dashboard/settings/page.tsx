import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Camera,
  CreditCard,
  Users,
  Shield,
  Palette,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Settings",
};

const settingsSections = [
  {
    title: "Profile",
    description: "Manage your account details and preferences",
    icon: User,
    href: "/dashboard/settings",
    ready: false,
  },
  {
    title: "Notifications",
    description: "Configure alert preferences and quiet hours",
    icon: Bell,
    href: "/dashboard/settings",
    ready: false,
  },
  {
    title: "Devices",
    description: "Manage cameras, collars, and other hardware",
    icon: Camera,
    href: "/dashboard/settings",
    ready: false,
  },
  {
    title: "Family",
    description: "Invite family members and manage roles",
    icon: Users,
    href: "/dashboard/settings",
    ready: false,
  },
  {
    title: "Billing",
    description: "Subscription plans, invoices, and payment methods",
    icon: CreditCard,
    href: "/dashboard/settings",
    ready: false,
  },
  {
    title: "Security",
    description: "Password, two-factor authentication, sessions",
    icon: Shield,
    href: "/dashboard/settings",
    ready: false,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-text-secondary" />
          Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your account, devices, and preferences
        </p>
      </div>

      {/* Settings grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {settingsSections.map((section) => (
          <Card key={section.title} className="group cursor-pointer">
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-bg-tertiary group-hover:bg-accent-primary/15 transition-colors shrink-0">
                  <section.icon className="h-5 w-5 text-text-muted group-hover:text-accent-primary transition-colors" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {section.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
