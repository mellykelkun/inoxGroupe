import { NextResponse } from "next/server";
import { groundedPublicAnswer } from "../../../../lib/assistant/answer-policy";
import { CAPABILITIES_ANSWER, classifyPublicAction, contactDetailsAnswer, inferredPublicProfile, OFFICIAL_CONTACT, OPEN_FORM_ANSWER, REQUEST_OFFER_ANSWER, wantsAdditionalField, wantsFormOpened } from "../../../../lib/assistant/public-actions";
import {
  assistantIsConfigured,
  assistantStorageIsConfigured,
  checkPublicRateLimit,
  clean,
  createConversation,
  executePublicTool,
  fingerprintFromRequest,
  getPublicConversation,
  getVisitorSession,
  isAllowedDynamicField,
  loadHistory,
  publicErrorMessage,
  publicSystemPrompt,
  publicTools,
  runGroqTurn,
  saveIntake,
  saveContactTranscript,
  saveMessage,
  savePublicUserMessage,
  sanitizePublicAnswer,
  suggestOptionalField,
  visitorCookieHeader,
} from "../../../../lib/assistant/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

function messageFromError(error) {
  const code = `${error?.message || ""}`;
  if (code.includes("ASSISTANT_INVALID_INTAKE")) return "Vérifiez les informations obligatoires avant la transmission.";
  if (code.includes("ASSISTANT_CONSENT_REQUIRED")) return "Votre accord est nécessaire pour transmettre la demande.";
  if (code.includes("ASSISTANT_REQUEST_ALREADY_SENT")) return "Une demande est déjà liée à cet échange. Pour transmettre un autre besoin, ouvrez un nouvel échange.";
  if (code.includes("CONTACT_RATE_LIMIT")) return "Plusieurs demandes ont déjà été reçues. Réessayez dans quinze minutes.";
  if (code.includes("ASSISTANT_RATE_LIMIT")) return "La limite d’échanges est atteinte. Réessayez dans quinze minutes ou utilisez le formulaire de contact.";
  return publicErrorMessage(error);
}

function streamResponse(work, cookie) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event, data) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      (async () => {
        try {
          await work(send);
        } catch (error) {
          console.error("Assistant public indisponible", error);
          send("error", { message: messageFromError(error), retryable: true });
        } finally {
          controller.close();
        }
      })();
    },
  });

  const response = new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-store, max-age=0",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
  response.headers.set("Set-Cookie", visitorCookieHeader(cookie));
  return response;
}

export async function POST(request) {
  const size = Number(request.headers.get("content-length") || 0);
  if (size > 30_000) return json({ error: "La demande est trop volumineuse." }, 413);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "La demande transmise est invalide." }, 400);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return json({ error: "La demande transmise est invalide." }, 400);
  if (!assistantStorageIsConfigured()) return json({ error: publicErrorMessage(new Error("ASSISTANT_DATABASE_NOT_CONFIGURED")) }, 503);
  const action = payload.intake ? null : classifyPublicAction(clean(payload.message));
  if (!payload.intake && !action && !assistantIsConfigured()) return json({ error: publicErrorMessage(new Error("ASSISTANT_AI_NOT_CONFIGURED")) }, 503);

  const visitor = getVisitorSession(request);
  let conversationId = typeof payload.conversationId === "string" ? payload.conversationId : "";
  let conversation;
  if (conversationId) {
    conversation = await getPublicConversation(conversationId, visitor.hash);
    if (!conversation || conversation.status !== "open") return json({ error: "Cette conversation n’est plus active. Ouvrez un nouvel échange." }, 409);
  } else {
    const fingerprintHash = fingerprintFromRequest(request);
    try { await checkPublicRateLimit(null, fingerprintHash, true); }
    catch (error) { if (`${error?.message || ""}`.includes("ASSISTANT_RATE_LIMIT")) return json({ error: messageFromError(error) }, 429); throw error; }
    conversationId = await createConversation({ visitorHash: visitor.hash, fingerprintHash });
    conversation = await getPublicConversation(conversationId, visitor.hash);
  }

  if (!payload.intake) {
    try {
      await checkPublicRateLimit(conversationId, fingerprintFromRequest(request), false);
    } catch (error) {
      if (`${error?.message || ""}`.includes("ASSISTANT_RATE_LIMIT")) return json({ error: messageFromError(error) }, 429);
      throw error;
    }
  }

  if (payload.intake) {
    try {
      const result = await saveIntake({
        intake: payload.intake,
        additionalFields: payload.additionalFields,
        conversationId,
        visitorHash: visitor.hash,
        fingerprintHash: fingerprintFromRequest(request),
      });
      const reference = `INOX-${String(result.id).padStart(6, "0")}`;
      const confirmation = `Votre demande ${reference} a bien été transmise. L’équipe INOX vous recontactera selon le canal choisi.`;
      await saveContactTranscript(conversationId, result.id, confirmation);
      const response = json({
        conversationId,
        reference,
        message: confirmation,
      }, 201);
      response.headers.set("Set-Cookie", visitorCookieHeader(visitor.token));
      return response;
    } catch (error) {
      console.error("Formulaire assistant invalide", error);
      return json({ error: messageFromError(error) }, error?.message === "CONTACT_RATE_LIMIT" ? 429 : 400);
    }
  }

  const message = clean(payload.message);
  if (message.length < 1 || message.length > 5000) return json({ error: "Écrivez une question ou une priorité en quelques mots." }, 400);

  if (!/^[a-f0-9-]{36}$/i.test(payload.clientMessageId || "")) return json({ error: "Le message transmis est invalide." }, 400);
  await savePublicUserMessage(conversationId, message, payload.clientMessageId);
  if (action) {
    return streamResponse(async (send) => {
      send("meta", { conversationId });
      let fieldNote = "";
      if (action === "prepare_contact_request") {
        const dynamicFields = Array.isArray(conversation?.metadata?.dynamicFields) ? conversation.metadata.dynamicFields.filter(isAllowedDynamicField).slice(0, 3) : [];
        const fieldAdded = await suggestOptionalField({ message, conversationId, metadata: conversation?.metadata || {}, dynamicFields, onField: (field) => send("intake_field", field), signal: request.signal });
        const result = await executePublicTool(action, { summary: message, profileType: inferredPublicProfile(message) }, {
          conversationId,
          latestUserMessage: message,
          onOffer: (offer) => send("intake_offer", { ...offer, openNow: wantsFormOpened(message) }),
        });
        if (!result.ok) throw new Error("ASSISTANT_ACTION_UNAVAILABLE");
        if (wantsAdditionalField(message) && !fieldAdded) fieldNote = " Vous pouvez aussi décrire cette précision dans « Votre priorité ».";
      }
      const answer = (action === "get_verified_contact" ? contactDetailsAnswer() : action === "describe_capabilities" ? CAPABILITIES_ANSWER : wantsFormOpened(message) ? OPEN_FORM_ANSWER : REQUEST_OFFER_ANSWER) + fieldNote;
      if (action === "get_verified_contact") send("contact_details", OFFICIAL_CONTACT);
      await saveMessage(conversationId, "assistant", answer);
      send("delta", { text: answer });
      send("done", { conversationId });
    }, visitor.token);
  }
  const history = await loadHistory(conversationId);
  const dynamicFields = Array.isArray(conversation?.metadata?.dynamicFields) ? conversation.metadata.dynamicFields.filter(isAllowedDynamicField).slice(0, 3) : [];

  return streamResponse(async (send) => {
    send("meta", { conversationId });
    const result = await runGroqTurn({
      history,
      system: publicSystemPrompt(),
      tools: publicTools,
      signal: request.signal,
      executeTool: (name, args) => executePublicTool(name, args, {
        conversationId,
        latestUserMessage: message,
        metadata: conversation?.metadata || {},
        dynamicFields,
        onField: (field) => send("intake_field", field),
        onOffer: (offer) => send("intake_offer", { ...offer, openNow: wantsFormOpened(message) }),
      }),
      onTool: ({ name, result: toolResult }) => {
        if (name === "get_verified_contact" && toolResult?.ok) send("contact_details", OFFICIAL_CONTACT);
      },
    });
    const answer = groundedPublicAnswer(sanitizePublicAnswer(result.text), message, "primary");
    if (!answer) throw new Error("ASSISTANT_EMPTY_ANSWER");
    await saveMessage(conversationId, "assistant", answer);
    send("delta", { text: answer });
    send("done", { conversationId });
  }, visitor.token);
}
