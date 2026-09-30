import "server-only";

export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

function available(value: string | undefined) {
  const cleanValue = value?.trim();
  return cleanValue && cleanValue !== "[SENSITIVE]" ? cleanValue : undefined;
}

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = available(
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.inoxstorage_SUPABASE_URL,
  );
  const publishableKey = available(
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.inoxstorage_SUPABASE_PUBLISHABLE_KEY ||
    process.env.inoxstorage_SUPABASE_ANON_KEY,
  );

  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

export function hasCompleteSupabaseConfig() {
  const secretKey = available(
    process.env.SUPABASE_SECRET_KEY ||
    process.env.inoxstorage_SUPABASE_SECRET_KEY ||
    process.env.inoxstorage_SUPABASE_SERVICE_ROLE_KEY,
  );
  return Boolean(
    getSupabasePublicConfig() && secretKey,
  );
}
