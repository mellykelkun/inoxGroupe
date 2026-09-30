import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./config";

export function createAdminClient() {
  const publicConfig = getSupabasePublicConfig();
  const secretKey = (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.inoxstorage_SUPABASE_SECRET_KEY ||
    process.env.inoxstorage_SUPABASE_SERVICE_ROLE_KEY
  )?.trim();

  if (!publicConfig || !secretKey) {
    throw new Error("SUPABASE_SERVER_CONFIG_MISSING");
  }

  return createClient(publicConfig.url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
