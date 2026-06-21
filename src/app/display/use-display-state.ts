"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { DisplayState } from "@/lib/types";

const emptyState: DisplayState = {
  generatedAt: new Date().toISOString(),
  totalParticipants: 0,
  rooms: []
};

type PublicConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function useDisplayState() {
  const [state, setState] = useState<DisplayState>(emptyState);
  const [connectionState, setConnectionState] = useState<"connecting" | "live" | "fallback">(
    "connecting"
  );

  const load = useCallback(async () => {
    const response = await fetch("/api/sessions", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch sessions");
    }

    setState((await response.json()) as DisplayState);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSafely() {
      try {
        await load();
        if (mounted) {
          setConnectionState((current) => (current === "connecting" ? "live" : current));
        }
      } catch {
        if (mounted) {
          setConnectionState("fallback");
        }
      }
    }

    loadSafely();

    let supabaseBrowser: ReturnType<typeof getSupabaseBrowser> | null = null;
    let channel: ReturnType<ReturnType<typeof getSupabaseBrowser>["channel"]> | null = null;

    async function subscribeRealtime() {
      try {
        const response = await fetch("/api/config", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to fetch public config");
        }

        const config = (await response.json()) as PublicConfig;
        supabaseBrowser = getSupabaseBrowser(config.supabaseUrl, config.supabaseAnonKey);
        channel = supabaseBrowser
          .channel("kiitos-work-room-display")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "active_sessions" },
            () => {
              loadSafely();
            }
          )
          .subscribe((status) => {
            if (!mounted) {
              return;
            }

            if (status === "SUBSCRIBED") {
              setConnectionState("live");
            }

            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              setConnectionState("fallback");
            }
          });
      } catch {
        if (mounted) {
          setConnectionState("fallback");
        }
      }
    }

    subscribeRealtime();

    const fallbackIntervalId = window.setInterval(loadSafely, 30000);

    return () => {
      mounted = false;
      window.clearInterval(fallbackIntervalId);

      if (supabaseBrowser && channel) {
        supabaseBrowser.removeChannel(channel);
      }
    };
  }, [load]);

  return { state, connectionState };
}
