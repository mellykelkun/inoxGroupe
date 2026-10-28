import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/auth/server";
import { canUseAdminAssistant } from "@/lib/auth/types";
import { isAdminWriteRequest, parseContactDeleteCommand, parseContactStatusCommand } from "@/lib/assistant/commands";
import { sanitizePageLinks } from "../../../../../../../packages/assistant-links";
import {
  adminErrorMessage,
  adminSystemPrompt,
  adminTools,
  assistantIsConfigured,
  clean,
  closeAdminConversation,
  createAdminConversation,
  executeAdminTool,
  executePendingAction,
  getAdminConversation,
  loadHistory,
  runGroqTurn,
  saveMessage,
} from "@/lib/assistant/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function denied(reason: string) {
  return NextResponse.json({ error: reason }, { status: reason === "unauthenticated" ? 401 : 403 });
}

function streamResponse(work: (send: (event: string, data: unknown) => void) => Promise<void>) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      (async () => {
        try { await work(send); }
        catch (error) { console.error("Assistant admin indisponible", error); send("error", { message: adminErrorMessage(error), retryable: true }); }
        finally { controller.close(); }
      })();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-store, max-age=0", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);
  if (!canUseAdminAssistant(auth.identity.role)) return denied("insufficient_role");

  const size = Number(request.headers.get("content-length") || 0);
  if (size > 30_000) return NextResponse.json({ error: "La demande est trop volumineuse." }, { status: 413 });
  let payload: { conversationId?: unknown; message?: unknown; confirmAction?: unknown; closeSession?: unknown };
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "La demande transmise est invalide." }, { status: 400 }); }

  const conversationId = typeof payload.conversationId === "string" ? payload.conversationId : "";
  if (payload.closeSession === true) {
    if (!conversationId) return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    try {
      const closed = await closeAdminConversation(conversationId, auth.identity.userId);
      return NextResponse.json({ ok: closed }, { status: closed ? 200 : 404, headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      return NextResponse.json({ error: adminErrorMessage(error) }, { status: 500 });
    }
  }
  if (typeof payload.confirmAction === "string" && conversationId) {
    try {
      const result = await executePendingAction(conversationId, payload.confirmAction, auth.identity, request);
      await saveMessage(conversationId, "user", "Confirmation explicite d’une action préparée.", { confirmed: true, action: result.action });
      await saveMessage(conversationId, "assistant", result.message, { actionResult: result });
      return NextResponse.json({ ok: true, conversationId, ...result }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    } catch (error) {
      return NextResponse.json({ error: adminErrorMessage(error) }, { status: 400 });
    }
  }
  if (!assistantIsConfigured()) return NextResponse.json({ error: adminErrorMessage(new Error("ASSISTANT_AI_NOT_CONFIGURED")) }, { status: 503 });

  const message = clean(payload.message);
  if (message.length < 1 || message.length > 5000) return NextResponse.json({ error: "Écrivez la tâche ou le rapport à préparer." }, { status: 400 });
  let activeConversationId = conversationId;
  if (activeConversationId) {
    const conversation = await getAdminConversation(activeConversationId, auth.identity.userId);
    if (!conversation || conversation.status !== "open") return NextResponse.json({ error: "Cette session de pilotage n’est plus active." }, { status: 409 });
  } else activeConversationId = await createAdminConversation(auth.identity.userId);
  await saveMessage(activeConversationId, "user", message);
  const history = await loadHistory(activeConversationId);
  const statusCommand = parseContactStatusCommand(message);
  const deleteCommand = parseContactDeleteCommand(message);
  const writeRequest = isAdminWriteRequest(message);

  return streamResponse(async (send) => {
    send("meta", { conversationId: activeConversationId });
    if (deleteCommand) {
      const action = await executeAdminTool("delete_contact_requests", deleteCommand, { conversationId: activeConversationId, auth: auth.identity });
      send("tool", { name: "delete_contact_requests", ok: (action as { requiresConfirmation?: boolean }).requiresConfirmation === true });
      if ((action as { requiresConfirmation?: boolean }).requiresConfirmation) send("action", action);
      const text = (action as { requiresConfirmation?: boolean }).requiresConfirmation
        ? "La suppression est préparée. Vérifiez les références et confirmez avec le bouton uniquement si elles sont exactes."
        : "La suppression n’a pas été préparée. Vérifiez les références et vos droits.";
      await saveMessage(activeConversationId, "assistant", text);
      send("delta", { text }); send("done", { conversationId: activeConversationId });
      return;
    }
    if (statusCommand) {
      const action = await executeAdminTool("update_contact_status", statusCommand, { conversationId: activeConversationId, auth: auth.identity });
      send("tool", { name: "update_contact_status", ok: (action as { requiresConfirmation?: boolean }).requiresConfirmation === true });
      if ((action as { requiresConfirmation?: boolean }).requiresConfirmation) send("action", action);
      const text = (action as { requiresConfirmation?: boolean }).requiresConfirmation
        ? "La modification est préparée. Vérifiez la demande et le nouveau statut, puis confirmez avec le bouton si tout est exact."
        : "Je n’ai pas pu préparer cette modification. Vérifiez la référence et vos droits.";
      await saveMessage(activeConversationId, "assistant", text);
      send("delta", { text }); send("done", { conversationId: activeConversationId });
      return;
    }
    let preparedAction = false;
    const result = await runGroqTurn({
      history,
      system: adminSystemPrompt(auth.identity),
      requireTool: writeRequest,
      executeTool: (name, args) => executeAdminTool(name, args, { conversationId: activeConversationId, auth: auth.identity }),
      onDelta: () => {},
      onTool: ({ name, result: toolResult }) => {
        send("tool", { name, ok: (toolResult as { ok?: boolean; requiresConfirmation?: boolean })?.ok !== false || (toolResult as { requiresConfirmation?: boolean })?.requiresConfirmation === true });
        if ((toolResult as { requiresConfirmation?: boolean })?.requiresConfirmation) { preparedAction = true; send("action", toolResult); }
      },
      signal: request.signal,
    });
    if (writeRequest && !preparedAction) throw new Error("ASSISTANT_ACTION_NOT_PREPARED");
    const answer = sanitizePageLinks(result.text, true);
    if (answer) await saveMessage(activeConversationId, "assistant", answer);
    if (answer) send("delta", { text: answer });
    send("done", { conversationId: activeConversationId });
  });
}
