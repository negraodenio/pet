import { Settings as SettingsIcon } from "lucide-react";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export const metadata = { title: "System Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-indigo-400" /> System Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">Household configuration</p>
      </div>
      <EmptyState
        icon={<SettingsIcon className="h-8 w-8" />}
        title="No configurable settings available"
        description="This first-home installation shows only persisted household data."
      />
    </div>
  );
}
