"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const env = getSupabasePublicEnv();

  if (!env) {
    throw new Error("Supabase public environment variables are not set.");
  }

  browserClient = createBrowserClient(env.url, env.publishableKey);
  return browserClient;
}
