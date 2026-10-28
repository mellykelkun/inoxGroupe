import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth/admin-email";
import { isAdminRole } from "@/lib/auth/types";
import { validateMutationRequest } from "@/lib/http/request-security";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestFailure = validateMutationRequest(request, 1_000);
  if (requestFailure) {
    return NextResponse.json(
      { error: requestFailure },
      { status: requestFailure === "request_too_large" ? 413 : 403 },
    );
  }

  const supabase = await createClient();
  const [{ data: userData }, { data: aalData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  if (!userData.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  if (aalData?.currentLevel !== "aal2") {
    return NextResponse.json({ error: "mfa_required" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: freshData, error: userError } =
    await admin.auth.admin.getUserById(userData.user.id);
  const user = freshData.user;
  const role = user?.app_metadata.inox_admin_role;
  if (
    userError ||
    !user ||
    user.app_metadata.inox_admin_active !== true ||
    !isAdminRole(role) ||
    !isAdminEmail(user.email)
  ) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const activatedAt = new Date().toISOString();
  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...user.app_metadata,
      inox_admin_activated_at: activatedAt,
      inox_admin_invitation_completed_at: activatedAt,
    },
  });
  if (updateError) {
    return NextResponse.json({ error: "activation_completion_failed" }, { status: 500 });
  }

  await admin.from("audit_logs").insert({
    admin_user_id: user.id,
    action: "admin_member_activated",
    entity_type: "admin_member",
    entity_id: user.id,
    metadata: { role, source: "activation" },
  });

  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
