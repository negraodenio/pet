import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  }

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  // If Supabase is configured and user is not logged in, redirect to login
  if (isConfigured && !user) {
    redirect("/login");
  }

  // Default demo data for when Supabase is being initialized
  const demoUser = {
    id: user?.id ?? "demo-guardian-id",
    email: user?.email ?? "guardian@compawion.os",
  };

  let profile = null;
  let pets: Array<{ id: string; name: string; species: string; avatar_url: string | null }> = [];

  if (user && isConfigured) {
    try {
      const [profileResult, petsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*, organizations(*), subscriptions:organizations(subscriptions(*))")
          .eq("id", user.id)
          .single(),
        supabase.from("pets").select("id, name, species, avatar_url").order("name"),
      ]);

      profile = profileResult.data;
      pets = petsResult.data ?? [];
    } catch {
      // Fallback
    }
  }

  if (!isConfigured && pets.length === 0) {
    pets = [
      { id: "demo-lola", name: "Lola", species: "dog", avatar_url: null },
      { id: "demo-milo", name: "Milo", species: "cat", avatar_url: null },
    ];
  }

  return (
    <DashboardShell
      user={demoUser}
      profile={profile}
      pets={pets}
    >
      {children}
    </DashboardShell>
  );
}
