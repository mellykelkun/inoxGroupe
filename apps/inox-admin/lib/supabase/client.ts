"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export async function createClient() {
  if (browserClient) return browserClient;

  const response = await fetch("/api/auth/config", { cache: "no-store" });
  if (!response.ok) throw new Error("SUPABASE_PUBLIC_CONFIG_MISSING");
  const config = await response.json() as { url?: string; publishableKey?: string };
  if (!config.url || !config.publishableKey) {
    throw new Error("SUPABASE_PUBLIC_CONFIG_MISSING");
  }

  browserClient = createBrowserClient(config.url, config.publishableKey);
  return browserClient;
}
