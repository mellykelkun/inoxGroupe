import "server-only";

import { createClient } from "@supabase/supabase-js";

let clientForum;

function configurationForum() {
  return {
    url: process.env.SUPABASE_URL || process.env.inoxstorage_SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY || process.env.inoxstorage_SUPABASE_SECRET_KEY,
    hashSecret: process.env.FORUM_HASH_SECRET,
  };
}

function valeurDisponible(value) {
  return Boolean(value && value !== "[SENSITIVE]");
}

export function forumEstConfigure() {
  const configuration = configurationForum();
  return Boolean(
    valeurDisponible(configuration.url) &&
      valeurDisponible(configuration.secretKey) &&
      valeurDisponible(configuration.hashSecret),
  );
}

function obtenirClientForum() {
  const configuration = configurationForum();
  if (!valeurDisponible(configuration.url) || !valeurDisponible(configuration.secretKey)) {
    throw new Error("FORUM_NOT_CONFIGURED");
  }

  if (!clientForum) {
    clientForum = createClient(
      configuration.url,
      configuration.secretKey,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
  }

  return clientForum;
}

export async function lireMessagesForum() {
  const client = obtenirClientForum();
  const taillePage = 500;
  const messages = [];

  for (let debut = 0; ; debut += taillePage) {
    const { data, error } = await client
      .from("forum_messages")
      .select(
        "id,parent_id,thread_id,subject,category,body,display_name,author_kind,created_at,updated_at",
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(debut, debut + taillePage - 1);

    if (error) throw error;
    messages.push(...(data ?? []));
    if (!data || data.length < taillePage) break;
  }

  return messages;
}

export async function publierMessageForum(message, empreinte) {
  const { data, error } = await obtenirClientForum().rpc(
    "forum_create_message",
    {
      p_first_name: message.firstName,
      p_last_name: message.lastName,
      p_email: message.email,
      p_fingerprint_hash: empreinte,
      p_subject: message.subject || null,
      p_category: message.category || "general",
      p_body: message.body,
      p_parent_id: message.parentId,
    },
  );

  if (error) throw error;
  return data;
}
