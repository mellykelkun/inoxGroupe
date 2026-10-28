import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/server";
import { canManageContacts, canModerateForum } from "@/lib/auth/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const sections = new Set(["contacts", "forum"]);
type NotificationSection = "contacts" | "forum";

function denied(reason: string) {
  return NextResponse.json(
    { error: reason },
    { status: reason === "unauthenticated" ? 401 : 403 },
  );
}

function isNotificationSection(value: unknown): value is NotificationSection {
  return typeof value === "string" && sections.has(value);
}

function canAccessNotificationSection(role: Parameters<typeof canManageContacts>[0], section: NotificationSection) {
  return section === "contacts" ? canManageContacts(role) : canModerateForum(role);
}

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);

  const admin = createAdminClient();
  const { data: reads, error: readsError } = await admin
    .from("admin_section_reads")
    .select("section,last_seen_at")
    .eq("admin_user_id", auth.identity.userId);

  if (readsError) {
    console.error("Lecture des notifications impossible", readsError);
    return NextResponse.json({ error: "notifications_unavailable" }, { status: 500 });
  }

  const lastSeenBySection = new Map(
    (reads ?? []).map((read) => [read.section, read.last_seen_at]),
  );
  const mayReadContacts = canAccessNotificationSection(auth.identity.role, "contacts");
  const mayReadForum = canAccessNotificationSection(auth.identity.role, "forum");
  const contactsQuery = mayReadContacts
    ? admin.from("contact_requests").select("id", { count: "exact", head: true }).eq("status", "new")
    : null;
  const forumQuery = mayReadForum
    ? admin.from("forum_messages").select("id", { count: "exact", head: true }).is("parent_id", null)
    : null;
  const contactsSince = lastSeenBySection.get("contacts");
  const forumSince = lastSeenBySection.get("forum");

  if (contactsSince && contactsQuery) contactsQuery.gt("created_at", contactsSince);
  if (forumSince && forumQuery) forumQuery.gt("created_at", forumSince);

  const [contacts, forum] = await Promise.all([
    contactsQuery ?? Promise.resolve({ count: 0, error: null }),
    forumQuery ?? Promise.resolve({ count: 0, error: null }),
  ]);
  const error = contacts.error ?? forum.error;
  if (error) {
    console.error("Comptage des notifications impossible", error);
    return NextResponse.json({ error: "notifications_unavailable" }, { status: 500 });
  }

  return NextResponse.json(
    {
      notifications: {
        contacts: contacts.count ?? 0,
        forum: forum.count ?? 0,
      },
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

export async function POST(request: Request) {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);

  let input: { section?: unknown };
  try {
    input = await request.json() as { section?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isNotificationSection(input.section)) {
    return NextResponse.json({ error: "invalid_section" }, { status: 400 });
  }
  if (!canAccessNotificationSection(auth.identity.role, input.section)) {
    return denied("insufficient_role");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("admin_section_reads")
    .upsert(
      {
        admin_user_id: auth.identity.userId,
        section: input.section,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "admin_user_id,section" },
    );

  if (error) {
    console.error("Marquage de la notification impossible", error);
    return NextResponse.json({ error: "notification_update_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
