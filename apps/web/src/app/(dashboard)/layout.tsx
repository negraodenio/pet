import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile + org + subscription in parallel
  const [profileResult, petsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, organizations(*), subscriptions:organizations(subscriptions(*))")
      .eq("id", user.id)
      .single(),
    supabase.from("pets").select("id, name, species, avatar_url").order("name"),
  ]);

  const profile = profileResult.data;
  const pets = petsResult.data ?? [];

  return (
    <DashboardShell
      user={{ id: user.id, email: user.email ?? "" }}
      profile={profile}
      pets={pets}
    >
      {children}
    </DashboardShell>
  );
}
