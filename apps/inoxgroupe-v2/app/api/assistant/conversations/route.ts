// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { assistantStorageIsConfigured, checkPublicRateLimit, createConversation, fingerprintFromRequest, getPublicConversation, getVisitorSession, isAllowedDynamicField, loadPublicTranscript, resetPublicConversation, visitorCookieHeader } from "../../../../lib/assistant/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!assistantStorageIsConfigured()) return NextResponse.json({ error: "L’assistant n’est pas disponible pour le moment." }, { status: 503 });
  const visitor = getVisitorSession(request);
  const fingerprintHash = fingerprintFromRequest(request);
  try {
    await checkPublicRateLimit(null, fingerprintHash, true);
    const conversationId = await createConversation({ visitorHash: visitor.hash, fingerprintHash });
    const response = NextResponse.json({ conversationId }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
    response.headers.set("Set-Cookie", visitorCookieHeader(visitor.token));
    return response;
  } catch (error) {
    if ((error as { message?: string })?.message === "ASSISTANT_RATE_LIMIT") return NextResponse.json({ error: "La limite d’échanges est atteinte. Réessayez dans quinze minutes." }, { status: 429 });
    console.error("Création de conversation Expertises indisponible", error);
    return NextResponse.json({ error: "L’échange ne peut pas démarrer pour le moment. Réessayez." }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  const conversationId = request.nextUrl.searchParams.get("conversationId") || "";
  const visitor = getVisitorSession(request);
  const conversation = await getPublicConversation(conversationId, visitor.hash);
  if (!conversation || conversation.status !== "open") {
    return NextResponse.json({ error: "Cette conversation n’est plus active." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  }
  const messages = await loadPublicTranscript(conversation.id);
  const dynamicFields = Array.isArray(conversation.metadata?.dynamicFields) ? conversation.metadata.dynamicFields.filter(isAllowedDynamicField).slice(0, 3) : [];
  return NextResponse.json({ conversationId, messages, dynamicFields }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(request: NextRequest) {
  let payload: any;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "La conversation transmise est invalide." }, { status: 400 }); }
  const visitor = getVisitorSession(request);
  const conversationId = typeof payload?.conversationId === "string" ? payload.conversationId : "";
  if (!/^[a-f0-9-]{36}$/i.test(conversationId)) return NextResponse.json({ error: "La conversation transmise est invalide." }, { status: 400 });
  if (!assistantStorageIsConfigured()) return NextResponse.json({ error: "L’assistant n’est pas disponible pour le moment." }, { status: 503 });
  try {
    const nextConversationId = await resetPublicConversation(conversationId, visitor.hash, fingerprintFromRequest(request));
    const response = NextResponse.json({ conversationId: nextConversationId }, { headers: { "Cache-Control": "private, no-store" } });
    response.headers.set("Set-Cookie", visitorCookieHeader(visitor.token));
    return response;
  } catch (error) {
    if ((error as { message?: string })?.message?.includes("ASSISTANT_RATE_LIMIT")) return NextResponse.json({ error: "La limite d’échanges est atteinte. Réessayez dans quinze minutes ; votre échange actuel reste disponible." }, { status: 429 });
    if ((error as { message?: string })?.message?.includes("ASSISTANT_CONVERSATION_UNAVAILABLE")) return NextResponse.json({ error: "Cet échange n’est plus accessible depuis ce navigateur. Actualisez la page pour recommencer." }, { status: 404 });
    console.error("Remplacement de conversation Expertises indisponible", error);
    return NextResponse.json({ error: "L’échange n’a pas pu être supprimé. Réessayez." }, { status: 503 });
  }
}
