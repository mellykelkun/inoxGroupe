import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "./config";

export async function createClient() {
  const config = getSupabasePublicConfig();
  if (!config) throw new Error("SUPABASE_PUBLIC_CONFIG_MISSING");

  const cookieStore = await cookies();

  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Un Server Component ne peut pas toujours écrire les cookies.
          // Le proxy rafraîchit la session avant le rendu.
        }
      },
    },
  });
}

