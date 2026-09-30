import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function denied(reason: string) {
  return NextResponse.json(
    { error: reason },
    { status: reason === "unauthenticated" ? 401 : 403 },
  );
}

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);

  const admin = createAdminClient();
  const [
    contacts,
    newContacts,
    activeContacts,
    topics,
    replies,
    blockedEmails,
  ] = await Promise.all([
    admin.from("contact_requests").select("id", { count: "exact", head: true }),
    admin.from("contact_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    admin.from("contact_requests").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
    admin.from("forum_messages").select("id", { count: "exact", head: true }).is("parent_id", null),
    admin.from("forum_messages").select("id", { count: "exact", head: true }).not("parent_id", "is", null),
    admin.from("forum_blocked_emails").select("id", { count: "exact", head: true }),
  ]);

  const error = [contacts, newContacts, activeContacts, topics, replies, blockedEmails]
    .find((result) => result.error)?.error;
  if (error) {
    console.error("Chargement des indicateurs impossible", error);
    return NextResponse.json({ error: "overview_unavailable" }, { status: 500 });
  }

  return NextResponse.json(
    {
      contacts: {
        total: contacts.count ?? 0,
        new: newContacts.count ?? 0,
        inProgress: activeContacts.count ?? 0,
        source: "inox-groupe",
      },
      forum: {
        topics: topics.count ?? 0,
        replies: replies.count ?? 0,
        blockedEmails: blockedEmails.count ?? 0,
        source: "inox-groupe",
      },
      journal: {
        source: "inoxgroupe-v2",
        connection: "pending",
      },
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
