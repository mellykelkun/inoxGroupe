import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/auth/server";
import { canModerateForum } from "@/lib/auth/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const categories = new Set(["general", "conseil", "support", "projet"]);

function denied(reason: string) {
  return NextResponse.json(
    { error: reason },
    { status: reason === "unauthenticated" ? 401 : 403 },
  );
}

function clean(value: unknown) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim()
    : "";
}

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);

  const admin = createAdminClient();
  const [{ data: messages, error }, { data: blocked, error: blockedError }] = await Promise.all([
    admin
      .from("forum_messages")
      .select("id,parent_id,thread_id,contact_id,subject,category,body,display_name,author_kind,status,created_at")
      .order("created_at", { ascending: true })
      .limit(500),
    admin.from("forum_blocked_emails").select("email_normalized").limit(500),
  ]);

  if (error || blockedError) {
    console.error("Lecture de la modération impossible", error || blockedError);
    return NextResponse.json({ error: "forum_unavailable" }, { status: 500 });
  }

  const contactIds = [...new Set((messages ?? [])
    .map((message) => message.contact_id)
    .filter((id): id is number => typeof id === "number"))];
  const contactsById = new Map<number, string>();
  if (contactIds.length) {
    const { data: contacts, error: contactsError } = await admin
      .from("forum_contacts")
      .select("id,email")
      .in("id", contactIds);
    if (contactsError) return NextResponse.json({ error: "forum_contacts_unavailable" }, { status: 500 });
    for (const contact of contacts ?? []) contactsById.set(contact.id, contact.email);
  }

  return NextResponse.json(
    {
      messages: (messages ?? []).map((message) => ({
        ...message,
        email: message.contact_id ? contactsById.get(message.contact_id) ?? "" : "forum@inox-group.net",
      })),
      blockedEmails: (blocked ?? []).map((item) => item.email_normalized),
      canModerate: canModerateForum(auth.identity.role),
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

export async function POST(request: NextRequest) {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);
  if (!canModerateForum(auth.identity.role)) return denied("insufficient_role");

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const action = clean(input.action);
  const admin = createAdminClient();

  if (action === "block" || action === "unblock") {
    const email = clean(input.email).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const operation = action === "block"
      ? admin.from("forum_blocked_emails").upsert({ email, reason: clean(input.reason) || "Modération INOX", blocked_by: auth.identity.userId }, { onConflict: "email_normalized" })
      : admin.from("forum_blocked_emails").delete().eq("email_normalized", email);
    const { error } = await operation;
    if (error) return NextResponse.json({ error: "block_update_failed" }, { status: 500 });

    await admin.from("audit_logs").insert({
      admin_user_id: auth.identity.userId,
      action: action === "block" ? "forum_email_blocked" : "forum_email_unblocked",
      entity_type: "forum_contact",
      entity_id: email,
    });
    return NextResponse.json({ ok: true });
  }

  if (action !== "topic" && action !== "reply") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  const body = clean(input.body);
  if (body.length < 10 || body.length > 3000) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  let insert: Record<string, unknown> = {
    body,
    display_name: "Équipe INOX",
    author_kind: "inox",
    admin_author_id: auth.identity.userId,
    status: "published",
  };

  if (action === "topic") {
    const subject = clean(input.subject);
    const category = clean(input.category);
    if (subject.length < 5 || subject.length > 140 || !categories.has(category)) {
      return NextResponse.json({ error: "invalid_topic" }, { status: 400 });
    }
    insert = { ...insert, subject, category, parent_id: null, thread_id: null };
  } else {
    const parentId = Number(input.parentId);
    if (!Number.isSafeInteger(parentId) || parentId <= 0) {
      return NextResponse.json({ error: "invalid_parent" }, { status: 400 });
    }
    const { data: parent, error: parentError } = await admin
      .from("forum_messages")
      .select("id,thread_id,category,status")
      .eq("id", parentId)
      .single();
    if (parentError || !parent || parent.status !== "published") {
      return NextResponse.json({ error: "parent_not_found" }, { status: 404 });
    }
    insert = {
      ...insert,
      subject: null,
      category: parent.category,
      parent_id: parent.id,
      thread_id: parent.thread_id ?? parent.id,
    };
  }

  const { data: message, error } = await admin
    .from("forum_messages")
    .insert(insert)
    .select("id")
    .single();
  if (error) {
    console.error("Publication officielle impossible", error);
    return NextResponse.json({ error: "official_message_failed" }, { status: 500 });
  }

  await admin.from("audit_logs").insert({
    admin_user_id: auth.identity.userId,
    action: action === "topic" ? "forum_official_topic" : "forum_official_reply",
    entity_type: "forum_message",
    entity_id: String(message.id),
  });
  return NextResponse.json({ id: message.id }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);
  if (!canModerateForum(auth.identity.role)) return denied("insufficient_role");

  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing, error: lookupError } = await admin
    .from("forum_messages")
    .select("id,parent_id,subject")
    .eq("id", id)
    .single();
  if (lookupError || !existing) return NextResponse.json({ error: "message_not_found" }, { status: 404 });

  const { error } = await admin.from("forum_messages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "delete_failed" }, { status: 500 });

  await admin.from("audit_logs").insert({
    admin_user_id: auth.identity.userId,
    action: existing.parent_id ? "forum_reply_deleted" : "forum_thread_deleted",
    entity_type: "forum_message",
    entity_id: String(id),
    metadata: { subject: existing.subject },
  });
  return NextResponse.json({ ok: true });
}
