import "server-only";

import { createClient } from "@supabase/supabase-js";

let contactClient;

function available(value) {
  return Boolean(value && value !== "[SENSITIVE]");
}

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.inoxstorage_SUPABASE_URL,
    secretKey:
      process.env.SUPABASE_SECRET_KEY ||
      process.env.inoxstorage_SUPABASE_SECRET_KEY ||
      process.env.inoxstorage_SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function contactIsConfigured() {
  const values = config();
  return available(values.url) && available(values.secretKey);
}

function getClient() {
  const values = config();
  if (!available(values.url) || !available(values.secretKey)) {
    throw new Error("CONTACT_NOT_CONFIGURED");
  }

  if (!contactClient) {
    contactClient = createClient(values.url, values.secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return contactClient;
}

export async function createContactRequest(request, fingerprintHash) {
  const client = getClient();
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count, error: countError } = await client
    .from("contact_requests")
    .select("id", { count: "exact", head: true })
    .eq("fingerprint_hash", fingerprintHash)
    .gte("created_at", since);

  if (countError) throw countError;
  if ((count ?? 0) >= 3) throw new Error("CONTACT_RATE_LIMIT");

  const { data, error } = await client
    .from("contact_requests")
    .insert({
      source: "site-inox-technologies",
      profile_type: request.profileType,
      organization: request.organization || null,
      job_title: request.jobTitle || null,
      full_name: request.fullName,
      email: request.email,
      phone: request.phone,
      location: request.location,
      need_area: request.needArea,
      project_stage: request.projectStage,
      desired_timeline: request.desiredTimeline,
      preferred_contact: request.preferredContact,
      preferred_time: request.preferredTime || null,
      message: request.message,
      consented_at: new Date().toISOString(),
      fingerprint_hash: fingerprintHash,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}
