import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const statuses = new Set(["new", "in_progress", "completed", "archived", "spam"]);

function denied(reason: string) {
  return NextResponse.json(
    { error: reason },
    { status: reason === "unauthenticated" ? 401 : 403 },
  );
}

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);

  const { data, error } = await createAdminClient()
    .from("contact_requests")
    .select("id,source,profile_type,organization,job_title,full_name,email,phone,location,need_area,project_stage,desired_timeline,preferred_contact,preferred_time,message,consented_at,status,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) {
    console.error("Lecture des demandes impossible", error);
    return NextResponse.json({ error: "contacts_unavailable" }, { status: 500 });
  }

  return NextResponse.json(
    { contacts: data ?? [] },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);

  let input: { id?: unknown; status?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const id = Number(input.id);
  const status = typeof input.status === "string" ? input.status : "";
  if (!Number.isSafeInteger(id) || id <= 0 || !statuses.has(status)) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("contact_requests")
    .update({ status, assigned_admin_user_id: auth.identity.userId })
    .eq("id", id);
  if (error) return NextResponse.json({ error: "contact_update_failed" }, { status: 500 });

  await admin.from("audit_logs").insert({
    admin_user_id: auth.identity.userId,
    action: "contact_status_updated",
    entity_type: "contact_request",
    entity_id: String(id),
    metadata: { status },
  });

  return NextResponse.json({ ok: true });
}
