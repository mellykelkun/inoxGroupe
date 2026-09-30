import "server-only";

import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole, type AdminIdentity } from "./types";

type AuthFailure =
  | "unauthenticated"
  | "mfa_required"
  | "enrollment_required"
  | "forbidden";

export type AdminAuthResult =
  | { ok: true; identity: AdminIdentity; user: User }
  | { ok: false; reason: AuthFailure };

export async function authenticateAdmin(): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const [{ data: userData }, { data: aalData }, { data: claimsData }] =
    await Promise.all([
      supabase.auth.getUser(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.getClaims(),
    ]);

  const user = userData.user;
  if (!user) return { ok: false, reason: "unauthenticated" };

  if (!aalData || aalData.nextLevel !== "aal2") {
    return { ok: false, reason: "enrollment_required" };
  }
  if (aalData.currentLevel !== "aal2") {
    return { ok: false, reason: "mfa_required" };
  }

  // On relit le profil avec la clé serveur afin qu'une désactivation soit
  // appliquée immédiatement, sans attendre l'expiration du JWT du navigateur.
  const admin = createAdminClient();
  const { data: freshData, error } = await admin.auth.admin.getUserById(user.id);
  if (error || !freshData.user) return { ok: false, reason: "forbidden" };

  const metadata = freshData.user.app_metadata;
  if (metadata.inox_admin_active !== true || !isAdminRole(metadata.inox_admin_role)) {
    return { ok: false, reason: "forbidden" };
  }

  const claims = claimsData?.claims as Record<string, unknown> | undefined;
  const sessionId = typeof claims?.session_id === "string" ? claims.session_id : "";
  if (!sessionId) return { ok: false, reason: "unauthenticated" };

  const displayName =
    typeof metadata.inox_admin_display_name === "string" &&
    metadata.inox_admin_display_name.trim()
      ? metadata.inox_admin_display_name.trim()
      : freshData.user.email?.split("@")[0] ?? "Membre INOX";

  return {
    ok: true,
    user: freshData.user,
    identity: {
      userId: freshData.user.id,
      sessionId,
      email: freshData.user.email ?? "",
      displayName,
      role: metadata.inox_admin_role,
    },
  };
}
