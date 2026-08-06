"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

/* =========================================================================
   S1-05: Supabase Realtime Hooks
   WHY: Live event streaming so guardians see events appear in real time
   without refreshing the page. Core to the "peace of mind" experience.
   ========================================================================= */

type PetEvent = Tables<"pet_events">;

/**
 * Subscribe to real-time pet events for the current organization.
 * Returns the latest events and a live-updating array.
 */
export function useRealtimeEvents(initialEvents: PetEvent[] = []) {
  const [events, setEvents] = useState<PetEvent[]>(initialEvents);

  useEffect(() => {
    const supabase = createClient();
    const reload = async () => {
      const { data } = await supabase
        .from("pet_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) setEvents(data as PetEvent[]);
    };

    const channel = supabase
      .channel("pet-events-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pet_events",
        },
        (payload) => {
          const newEvent = payload.new as PetEvent;
          setEvents((prev) => [newEvent, ...prev.filter((event) => event.id !== newEvent.id)].slice(0, 100));
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void reload();
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return events;
}

type LCMState = Tables<"living_companion_models">;

/** Reloads durable LCM state whenever the Realtime channel reconnects. */
export function useRealtimeLcm(
  petId: string | null,
  initialState: LCMState | null,
) {
  const [state, setState] = useState<LCMState | null>(initialState);

  useEffect(() => {
    if (!petId) return;

    const supabase = createClient();
    const reload = async () => {
      const { data } = await supabase
        .from("living_companion_models")
        .select("*")
        .eq("pet_id", petId)
        .maybeSingle();

      setState(data as LCMState | null);
    };

    const channel = supabase
      .channel(`lcm-realtime-${petId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "living_companion_models", filter: `pet_id=eq.${petId}` },
        () => {
          void reload();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void reload();
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petId]);

  return state;
}

type Device = Tables<"devices">;

/**
 * Subscribe to real-time device status updates.
 * Shows devices going online/offline in real time.
 */
export function useRealtimeDevices(initialDevices: Device[] = []) {
  const [devices, setDevices] = useState<Device[]>(initialDevices);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("devices-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "devices",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setDevices((prev) => [payload.new as Device, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setDevices((prev) =>
              prev.map((d) =>
                d.id === (payload.new as Device).id
                  ? (payload.new as Device)
                  : d,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setDevices((prev) =>
              prev.filter((d) => d.id !== (payload.old as { id: string }).id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return devices;
}

/**
 * Subscribe to notification count for the current user.
 */
export function useUnreadNotificationCount() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { count: c } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("read", false);
    setCount(c ?? 0);
  }, []);

  useEffect(() => {
    refresh();

    const supabase = createClient();
    const channel = supabase
      .channel("notifications-count")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        () => {
          refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return count;
}
