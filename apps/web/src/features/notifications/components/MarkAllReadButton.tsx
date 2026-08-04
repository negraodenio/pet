"use client";

import { Button } from "@/shared/components/ui/Button";
import { CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkAllReadButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleMarkAllRead() {
    setLoading(true);
    const supabase = createClient();

    await supabase
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("read", false);

    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleMarkAllRead}
      loading={loading}
      icon={<CheckCheck className="h-3.5 w-3.5" />}
    >
      Mark all read
    </Button>
  );
}
