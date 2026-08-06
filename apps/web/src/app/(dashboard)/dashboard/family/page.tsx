import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export const metadata = { title: "Family & Caregivers" };

export default async function FamilyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").single();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Users className="h-6 w-6 text-indigo-400" /> Family & Caregivers
        </h1>
        <p className="text-sm text-text-secondary mt-1">Current household access records</p>
      </div>

      {profile && (
        <div className="glass-panel p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={profile.avatar_url} alt={profile.display_name} size="md" />
            <div>
              <p className="text-sm font-bold text-white">{profile.display_name}</p>
              <p className="text-xs text-text-muted">{user?.email}</p>
            </div>
          </div>
          <Badge variant="primary">{profile.role}</Badge>
        </div>
      )}

      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title="No additional household members"
        description="Additional household access records are not configured for this home."
      />
    </div>
  );
}
