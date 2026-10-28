import { NextResponse, type NextRequest } from "next/server";
import { AdminInvitationError, createAdminInvitation, renewAdminInvitation } from "@/lib/auth/admin-invitations";
import { isAdminEmail, normalizeAdminEmail } from "@/lib/auth/admin-email";
import { authenticateAdmin } from "@/lib/auth/server";
import { resolveAdminOrigin } from "@/lib/auth/invitation-links";
import { canInviteMembers, canManageMember, isAdminRole } from "@/lib/auth/types";
import { readLimitedJsonObject, validateMutationRequest } from "@/lib/http/request-security";
import { createAdminClient } from "@/lib/supabase/admin";

function invitationOrigin(request: NextRequest) {
  return resolveAdminOrigin({
    requestOrigin: request.nextUrl.origin,
    configuredOrigin: process.env.ADMIN_URL || process.env.NEXT_PUBLIC_ADMIN_URL,
    vercelProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    vercelDeploymentUrl: process.env.VERCEL_URL,
    production: process.env.NODE_ENV === "production",
  });
}

function mutationFailure(request: NextRequest) {
  const failure = validateMutationRequest(request);
  if (!failure) return null;
  return NextResponse.json(
    { error: failure },
    { status: failure === "request_too_large" ? 413 : 403 },
  );
}

export async function POST(request: NextRequest) {
  const invalidRequest = mutationFailure(request);
  if (invalidRequest) return invalidRequest;

  const auth = await authenticateAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.reason === "unauthenticated" ? 401 : 403 });
  }
  if (!canInviteMembers(auth.identity.role)) {
    return NextResponse.json({ error: "insufficient_role" }, { status: 403 });
  }

  const parsedBody = await readLimitedJsonObject(request);
  if (!parsedBody.ok) {
    return NextResponse.json(
      { error: parsedBody.error },
      { status: parsedBody.error === "request_too_large" ? 413 : 400 },
    );
  }
  const input = parsedBody.value;
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
    origin = invitationOrigin(request);
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

  const admin = createAdminClient();
  await admin.from("audit_logs").insert({
    admin_user_id: auth.identity.userId,
    action: invitation.reissued ? "admin_member_invitation_renewed" : "admin_member_invited",
    entity_type: "admin_member",
    entity_id: invitation.member.userId,
    metadata: { role: invitation.member.role, source: "team_access" },
  });

  return NextResponse.json(
    invitation,
    {
      status: 201,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    },
  );
}

export async function PATCH(request: NextRequest) {
  const invalidRequest = mutationFailure(request);
  if (invalidRequest) return invalidRequest;

  const auth = await authenticateAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.reason === "unauthenticated" ? 401 : 403 });
  }
  if (!canInviteMembers(auth.identity.role)) {
    return NextResponse.json({ error: "insufficient_role" }, { status: 403 });
  }

  const parsedBody = await readLimitedJsonObject(request);
  if (!parsedBody.ok) {
    return NextResponse.json(
      { error: parsedBody.error },
      { status: parsedBody.error === "request_too_large" ? 413 : 400 },
    );
  }
  const input = parsedBody.value;
  const userId = typeof input.userId === "string" ? input.userId : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  if (userId === auth.identity.userId) {
    return NextResponse.json({ error: "self_management_forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: targetData, error: targetError } = await admin.auth.admin.getUserById(userId);
  const targetRole = targetData.user?.app_metadata.inox_admin_role;
  if (targetError || !targetData.user || !isAdminRole(targetRole)) {
    return NextResponse.json({ error: "member_not_found" }, { status: 404 });
  }
  if (!canManageMember(auth.identity.role, targetRole)) {
    return NextResponse.json({ error: "insufficient_role" }, { status: 403 });
  }

  let origin: string;
  try {
    origin = invitationOrigin(request);
  } catch {
    return NextResponse.json({ error: "admin_origin_missing" }, { status: 503 });
  }

  try {
    const invitation = await renewAdminInvitation({
      userId,
      invitedBy: auth.identity.userId,
      origin,
    });
    await admin.from("audit_logs").insert({
      admin_user_id: auth.identity.userId,
      action: "admin_member_invitation_renewed",
      entity_type: "admin_member",
      entity_id: userId,
      metadata: { role: targetRole, source: "team_access" },
    });
    return NextResponse.json(invitation, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    const reason = error instanceof AdminInvitationError ? error.reason : "invitation_failed";
    const status = reason === "member_not_found" ? 404 : reason === "member_already_exists" ? 409 : 500;
    return NextResponse.json({ error: reason }, { status });
  }
}
