import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/auth/server";
import { canManageContacts } from "@/lib/auth/types";
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
  if (!canManageContacts(auth.identity.role)) return denied("insufficient_role");

  const admin = createAdminClient();
  const pageSize = 500;
  const contacts = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await admin
      .from("contact_requests")
      .select("id,source,profile_type,organization,job_title,full_name,email,phone,location,need_area,project_stage,desired_timeline,preferred_contact,preferred_time,message,consented_at,status,created_at,updated_at,assistant_conversation_id,ai_intake_fields")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("Lecture des demandes impossible", error);
      return NextResponse.json({ error: "contacts_unavailable" }, { status: 500 });
    }
    contacts.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }

  return NextResponse.json(
    { contacts },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);
  if (!canManageContacts(auth.identity.role)) return denied("insufficient_role");

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

export async function DELETE(request: NextRequest) {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);
  if (!canManageContacts(auth.identity.role)) return denied("insufficient_role");

  let input: { ids?: unknown; confirm?: unknown };
  try { input = await request.json(); }
  catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }

  if (input.confirm !== "DELETE_CONTACT_REQUESTS" || !Array.isArray(input.ids)
    || input.ids.length < 1 || input.ids.length > 50
    || !input.ids.every((id) => Number.isSafeInteger(id) && id > 0)
    || new Set(input.ids).size !== input.ids.length) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { data, error } = await createAdminClient().rpc("delete_contact_requests_admin", {
    p_ids: input.ids,
    p_admin_user_id: auth.identity.userId,
    p_source: "admin_ui",
    p_conversation_id: null,
  });
  if (error) return NextResponse.json({ error: error.message.includes("CONTACT_DELETE_NOT_FOUND") ? "contact_not_found" : "contact_delete_failed" }, { status: error.message.includes("CONTACT_DELETE_NOT_FOUND") ? 409 : 500 });
  return NextResponse.json({ ok: true, deleted: data }, { headers: { "Cache-Control": "no-store" } });
}
