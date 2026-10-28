import { NextResponse, type NextRequest } from "next/server";
import { updateActivationPassword } from "@/lib/auth/activation-password";
import { isAdminRole } from "@/lib/auth/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const size = Number(request.headers.get("content-length") || 0);
  if (size > 2_000) {
    return NextResponse.json({ error: "request_too_large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const password = typeof input.password === "string"
    ? input.password
    : "";
  if (password.length < 12 || password.length > 128) {
    return NextResponse.json({ error: "invalid_password" }, { status: 400 });
  }

  const supabase = await createClient();
  const [{ data: userData }, { data: aalData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  if (!userData.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  if (aalData?.currentLevel === "aal2" || aalData?.nextLevel === "aal2") {
    return NextResponse.json({ error: "activation_already_configured" }, { status: 409 });
  }

  const admin = createAdminClient();
  const { data: freshData, error: userError } = await admin.auth.admin.getUserById(userData.user.id);
  const metadata = freshData.user?.app_metadata;
  if (
    userError ||
    !freshData.user ||
    metadata?.inox_admin_active !== true ||
    !isAdminRole(metadata?.inox_admin_role)
  ) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { error: updateError } = await updateActivationPassword(supabase.auth, password);
  if (updateError) {
    return NextResponse.json({ error: "password_update_failed" }, { status: 400 });
  }

  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
