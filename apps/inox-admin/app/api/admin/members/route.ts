import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { isAdminEmail, normalizeAdminEmail } from "@/lib/auth/admin-email";
import { authenticateAdmin } from "@/lib/auth/server";
import {
  canInviteMembers,
  canManageMember,
  isAdminRole,
  type AdminMemberSummary,
  type AdminRole,
} from "@/lib/auth/types";
import { readLimitedJsonObject, validateMutationRequest } from "@/lib/http/request-security";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const userIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ManagedTarget =
  | { ok: true; user: User; role: AdminRole }
  | { ok: false; error: "invalid_input" | "self_management_forbidden" | "member_not_found" | "insufficient_role"; status: 400 | 403 | 404 };

function isBanned(bannedUntil: string | undefined) {
  if (!bannedUntil) return false;
  const timestamp = Date.parse(bannedUntil);
  return Number.isFinite(timestamp) && timestamp > Date.now();
}

function mutationFailure(request: NextRequest) {
  const failure = validateMutationRequest(request);
  if (!failure) return null;
  return NextResponse.json(
    { error: failure },
    { status: failure === "request_too_large" ? 413 : 403 },
  );
}

async function getManagedTarget(
  actor: { userId: string; role: AdminRole },
  userId: string,
): Promise<ManagedTarget> {
  if (!userIdPattern.test(userId)) return { ok: false, error: "invalid_input", status: 400 };
  if (userId === actor.userId) return { ok: false, error: "self_management_forbidden", status: 403 };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  const user = data.user;
  const role = user?.app_metadata.inox_admin_role;
  if (error || !user || !isAdminRole(role)) {
    return { ok: false, error: "member_not_found", status: 404 };
  }
  if (!canManageMember(actor.role, role)) {
    return { ok: false, error: "insufficient_role", status: 403 };
  }
  return { ok: true, user, role };
}

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.reason === "unauthenticated" ? 401 : 403 });
  }

  const admin = createAdminClient();
  const members: AdminMemberSummary[] = [];
  let page = 1;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return NextResponse.json({ error: "members_unavailable" }, { status: 500 });

    const pageMembers = await Promise.all(data.users.map(async (user) => {
      const role = user.app_metadata.inox_admin_role;
      if (!isAdminRole(role)) return null;
      if (!canInviteMembers(auth.identity.role) && user.id !== auth.identity.userId) return null;

      const { data: factorData, error: factorError } =
        await admin.auth.admin.mfa.listFactors({ userId: user.id });
      if (factorError) throw factorError;

      const hasVerifiedMfa = factorData.factors.some((factor) => factor.status === "verified");
      const emailCompliant = isAdminEmail(user.email);
      const allowed = user.app_metadata.inox_admin_active === true;
      const blocked = !allowed || !emailCompliant || isBanned(user.banned_until);
      const issuedAt = user.app_metadata.inox_admin_invitation_issued_at;
      const rawGeneration = Number(user.app_metadata.inox_admin_invitation_generation);

      return {
        userId: user.id,
        email: user.email ?? "",
        displayName:
          typeof user.app_metadata.inox_admin_display_name === "string"
            ? user.app_metadata.inox_admin_display_name
            : user.email?.split("@")[0] ?? "Membre INOX",
        role,
        active: allowed && !blocked,
        status: blocked ? "blocked" : hasVerifiedMfa ? "active" : "pending",
        hasVerifiedMfa,
        emailCompliant,
        invitationIssuedAt: typeof issuedAt === "string" ? issuedAt : null,
        invitationGeneration: Number.isSafeInteger(rawGeneration) && rawGeneration > 0 ? rawGeneration : 0,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
      } satisfies AdminMemberSummary;
    }));
    members.push(...pageMembers.filter((member): member is AdminMemberSummary => member !== null));

    if (data.users.length < 200) break;
    page += 1;
  }

  members.sort((left, right) => left.displayName.localeCompare(right.displayName, "fr"));
  return NextResponse.json(
    { members },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

export async function PATCH(request: NextRequest) {
  const invalidRequest = mutationFailure(request);
  if (invalidRequest) return invalidRequest;

  const auth = await authenticateAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.reason === "unauthenticated" ? 401 : 403 });
  }

  const parsedBody = await readLimitedJsonObject(request);
  if (!parsedBody.ok) {
    return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.error === "request_too_large" ? 413 : 400 });
  }
  const input = parsedBody.value;
  const userId = typeof input.userId === "string" ? input.userId : "";
  const action = input.action === "block" || input.action === "unblock" ? input.action : null;
  const reason = typeof input.reason === "string" ? input.reason.trim() : "";
  if (!action || reason.length > 500) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const target = await getManagedTarget(auth.identity, userId);
  if (!target.ok) {
    return NextResponse.json({ error: target.error }, { status: target.status });
  }
  if (action === "unblock" && !isAdminEmail(target.user.email)) {
    return NextResponse.json({ error: "invalid_admin_email" }, { status: 409 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: action === "block" ? "876000h" : "none",
    app_metadata: {
      ...target.user.app_metadata,
      inox_admin_active: action === "unblock",
      inox_admin_blocked_at: action === "block" ? now : null,
      inox_admin_blocked_by: action === "block" ? auth.identity.userId : null,
      inox_admin_block_reason: action === "block" && reason ? reason : null,
    },
  });
  if (error || !data.user) {
    return NextResponse.json({ error: "member_update_failed" }, { status: 500 });
  }

  await admin.from("audit_logs").insert({
    admin_user_id: auth.identity.userId,
    action: action === "block" ? "admin_member_blocked" : "admin_member_unblocked",
    entity_type: "admin_member",
    entity_id: userId,
    metadata: { role: target.role, reason: reason || undefined, source: "team_access" },
  });

  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

export async function DELETE(request: NextRequest) {
  const invalidRequest = mutationFailure(request);
  if (invalidRequest) return invalidRequest;

  const auth = await authenticateAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.reason === "unauthenticated" ? 401 : 403 });
  }

  const parsedBody = await readLimitedJsonObject(request);
  if (!parsedBody.ok) {
    return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.error === "request_too_large" ? 413 : 400 });
  }
  const input = parsedBody.value;
  const userId = typeof input.userId === "string" ? input.userId : "";
  const confirmationEmail = normalizeAdminEmail(input.confirmationEmail);
  const target = await getManagedTarget(auth.identity, userId);
  if (!target.ok) {
    return NextResponse.json({ error: target.error }, { status: target.status });
  }
  if (!confirmationEmail || confirmationEmail !== normalizeAdminEmail(target.user.email)) {
    return NextResponse.json({ error: "confirmation_mismatch" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId, false);
  if (error) {
    return NextResponse.json({ error: "member_delete_failed" }, { status: 500 });
  }

  await admin.from("audit_logs").insert({
    admin_user_id: auth.identity.userId,
    action: "admin_member_deleted",
    entity_type: "admin_member",
    entity_id: userId,
    metadata: { role: target.role, source: "team_access" },
  });

  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
