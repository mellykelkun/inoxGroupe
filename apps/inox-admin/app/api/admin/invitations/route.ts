import { NextResponse, type NextRequest } from "next/server";
import { AdminInvitationError, createAdminInvitation } from "@/lib/auth/admin-invitations";
import { isAdminEmail, normalizeAdminEmail } from "@/lib/auth/admin-email";
import { authenticateAdmin } from "@/lib/auth/server";
import { resolveAdminOrigin } from "@/lib/auth/invitation-links";
import { canInviteMembers, isAdminRole } from "@/lib/auth/types";

export async function POST(request: NextRequest) {
  const auth = await authenticateAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.reason === "unauthenticated" ? 401 : 403 });
  }
  if (!canInviteMembers(auth.identity.role)) {
    return NextResponse.json({ error: "insufficient_role" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const input = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const email = normalizeAdminEmail(input.email);
  const displayName = typeof input.displayName === "string" ? input.displayName.trim() : "";
  const role = input.role;

  if (!isAdminEmail(email)) {
    return NextResponse.json({ error: "invalid_admin_email" }, { status: 400 });
  }
  if (displayName.length < 2 || displayName.length > 100 || !isAdminRole(role) || role === "owner") {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  if (auth.identity.role !== "owner" && role === "administrator") {
    return NextResponse.json({ error: "owner_required" }, { status: 403 });
  }

  let origin: string;
  try {
    origin = resolveAdminOrigin({
      requestOrigin: request.nextUrl.origin,
      configuredOrigin: process.env.ADMIN_URL || process.env.NEXT_PUBLIC_ADMIN_URL,
      vercelProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
      vercelDeploymentUrl: process.env.VERCEL_URL,
      production: process.env.NODE_ENV === "production",
    });
  } catch {
    return NextResponse.json({ error: "admin_origin_missing" }, { status: 503 });
  }

  let invitation;
  try {
    invitation = await createAdminInvitation({
      email,
      displayName,
      role,
      invitedBy: auth.identity.userId,
      origin,
    });
  } catch (error) {
    const reason = error instanceof AdminInvitationError ? error.reason : "invitation_failed";
    return NextResponse.json(
      { error: reason },
      { status: reason === "member_already_exists" ? 409 : 500 },
    );
  }

  return NextResponse.json(
    invitation,
    {
      status: 201,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    },
  );
}
