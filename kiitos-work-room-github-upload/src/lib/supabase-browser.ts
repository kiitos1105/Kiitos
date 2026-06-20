"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let supabaseBrowserClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseBrowser(supabaseUrl: string, supabaseAnonKey: string) {
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  }

  return supabaseBrowserClient;
}
