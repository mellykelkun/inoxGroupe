import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/auth/server";
import { canInviteMembers, isAdminRole } from "@/lib/auth/types";
import { createAdminClient } from "@/lib/supabase/admin";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const input = body as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const displayName = typeof input.displayName === "string" ? input.displayName.trim() : "";
  const role = input.role;

  if (!emailPattern.test(email) || email.length > 254 || displayName.length < 2 || displayName.length > 100 || !isAdminRole(role) || role === "owner") {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  if (auth.identity.role !== "owner" && role === "administrator") {
    return NextResponse.json({ error: "owner_required" }, { status: 403 });
  }

  const configuredOrigin = process.env.NEXT_PUBLIC_ADMIN_URL?.trim();
  const origin = configuredOrigin ? new URL(configuredOrigin).origin : request.nextUrl.origin;
  const admin = createAdminClient();
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      redirectTo: `${origin}/auth/callback`,
      data: { display_name: displayName },
    },
  });

  if (linkError || !linkData.properties?.action_link || !linkData.user) {
    const message = linkError?.message.toLowerCase() ?? "";
    const error = message.includes("registered") || message.includes("exists")
      ? "member_already_exists"
      : "invitation_failed";
    return NextResponse.json({ error }, { status: error === "member_already_exists" ? 409 : 500 });
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(linkData.user.id, {
    app_metadata: {
      ...linkData.user.app_metadata,
      inox_admin_active: true,
      inox_admin_role: role,
      inox_admin_display_name: displayName,
      inox_admin_invited_by: auth.identity.userId,
    },
  });

  if (updateError) {
    return NextResponse.json({ error: "member_profile_failed" }, { status: 500 });
  }

  return NextResponse.json(
    {
      invitationUrl: linkData.properties.action_link,
      member: { userId: linkData.user.id, email, displayName, role },
    },
    {
      status: 201,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    },
  );
}

