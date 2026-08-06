import { createClient } from "@/lib/supabase/server";
import { Users, UserPlus, Shield, Heart, Mail, CheckCircle2, Key, Bell } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { Avatar } from "@/shared/components/ui/Avatar";

export const metadata = {
  title: "Family & Caregivers",
};

export default async function FamilyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(*)")
    .single();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            Family & Caregivers Domain
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Household access control, pet sitters, dog walkers, and emergency roles
          </p>
        </div>
        <Button icon={<UserPlus className="h-4 w-4" />}>
          Invite Household Member
        </Button>
      </div>

      {/* Household Caregiver List */}
      <div className="glass-panel p-6 border-indigo-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            Active Household Members
          </h3>
          <Badge variant="primary">Owner Management</Badge>
        </div>

        <div className="space-y-3">
          {/* Current User */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-indigo-500/30">
            <div className="flex items-center gap-4">
              <Avatar
                src={profile?.avatar_url ?? null}
                alt={profile?.display_name ?? user?.email ?? "User"}
                size="md"
              />
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {profile?.display_name ?? user?.email}
                  <span className="text-xs text-indigo-400 font-mono">(You)</span>
                </h4>
                <p className="text-xs text-text-muted font-mono">{user?.email}</p>
              </div>
            </div>
            <Badge variant="success">Primary Owner</Badge>
          </div>
        </div>
      </div>

      {/* Access Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 border-indigo-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            Family Member Role
          </div>
          <p className="text-sm text-white font-semibold mb-1">Full Companion Control</p>
          <p className="text-xs text-text-muted">
            Can view live feeds, change settings, receive alerts, and log metrics.
          </p>
        </div>

        <div className="glass-panel p-5 border-purple-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-2">
            <Heart className="h-4 w-4 text-purple-400" />
            Pet Sitter / Walker Role
          </div>
          <p className="text-sm text-white font-semibold mb-1">Temporary Access Pass</p>
          <p className="text-xs text-text-muted">
            Time-limited access to timeline, feeding instructions, and emergency contacts.
          </p>
        </div>

        <div className="glass-panel p-5 border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-2">
            <Bell className="h-4 w-4 text-emerald-400" />
            Emergency Contacts
          </div>
          <p className="text-sm text-white font-semibold mb-1">Escalation Protocol</p>
          <p className="text-xs text-text-muted">
            Automated SMS/Call escalation if critical safety events are unacknowledged.
          </p>
        </div>
      </div>
    </div>
  );
}
