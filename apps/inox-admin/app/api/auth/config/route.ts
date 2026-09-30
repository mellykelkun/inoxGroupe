import { NextResponse } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export function GET() {
  const config = getSupabasePublicConfig();
  if (!config) {
    return NextResponse.json({ error: "configuration_missing" }, { status: 503 });
  }

  return NextResponse.json(config, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
