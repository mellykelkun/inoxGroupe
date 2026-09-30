import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/server";
import { isAdminRole, type AdminMemberSummary } from "@/lib/auth/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

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

    for (const user of data.users) {
      const role = user.app_metadata.inox_admin_role;
      if (!isAdminRole(role)) continue;

      members.push({
        userId: user.id,
        email: user.email ?? "",
        displayName:
          typeof user.app_metadata.inox_admin_display_name === "string"
            ? user.app_metadata.inox_admin_display_name
            : user.email?.split("@")[0] ?? "Membre INOX",
        role,
        active: user.app_metadata.inox_admin_active === true,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
      });
    }

    if (data.users.length < 200) break;
    page += 1;
  }

  members.sort((left, right) => left.displayName.localeCompare(right.displayName, "fr"));
  return NextResponse.json(
    { members },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

