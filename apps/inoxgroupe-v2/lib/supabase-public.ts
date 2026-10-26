import "server-only";

export type PublicSupabaseConfig = {
  url: string;
  publishableKey: string;
};

export function getPublicSupabaseConfig(): PublicSupabaseConfig | null {
  const url = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.inoxstorage_SUPABASE_URL
  )?.trim();
  const publishableKey = (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.inoxstorage_SUPABASE_PUBLISHABLE_KEY ||
    process.env.inoxstorage_SUPABASE_ANON_KEY
  )?.trim();

  if (
    !url ||
    !publishableKey ||
    url === "[SENSITIVE]" ||
    publishableKey === "[SENSITIVE]"
  ) {
    return null;
  }

  return { url, publishableKey };
}
