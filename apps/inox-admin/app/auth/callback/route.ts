import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function redirectWithoutToken(url: URL) {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const successUrl = request.nextUrl.clone();
  successUrl.pathname = "/activation";
  successUrl.search = "";
  const errorUrl = request.nextUrl.clone();
  errorUrl.pathname = "/connexion";
  errorUrl.search = "";
  errorUrl.searchParams.set("erreur", "invitation");

  if (tokenHash && type === "invite") {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "invite" });
    return redirectWithoutToken(error ? errorUrl : successUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return redirectWithoutToken(error ? errorUrl : successUrl);
  }

  return redirectWithoutToken(errorUrl);
}
