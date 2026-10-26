// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { linkedParts } from "../../../packages/assistant-links";
import { intakeDraftFromMessage, safePublicAnswer } from "../lib/assistant/public-actions";

const STORAGE_KEY = "inox-assistant-expertise-v1";
const GREETING =
  "Bonjour, quel projet ou besoin souhaitez-vous explorer avec INOX ?";
const EXISTING_FORM_FIELDS = /(e[ -]?mail|courriel|t[ée]l[ée]phone|phone|nom complet|organisation|organization|entreprise|particulier|fonction|ville|pays|localisation|domaine du besoin|avancement|[ée]ch[ée]ance|cr[ée]neau|mode de contact)/i;
const usefulField = (field) => field?.key && !EXISTING_FORM_FIELDS.test(`${field.key} ${field.label || ""} ${field.question || ""}`.replace(/[‐‑‒–—]/g, "-"));
const friendlyError = (caught, fallback) => {
  const message = caught instanceof Error ? caught.message : "";
  return caught instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(message)
    ? "La connexion a été interrompue. Votre texte est conservé ; vérifiez le réseau et réessayez."
    : message || fallback;
};
const inferredProfile = (messages) => {
  const explicit = [...messages].reverse().find((item) => item.role === "user" && /\b(particulier|entreprise|organisation)\b/i.test(item.content));
  return explicit && /\bparticulier\b/i.test(explicit.content) ? "particulier" : "entreprise";
};
const storedMessage = (message) => message?.role === "assistant" ? { ...message, content: safePublicAnswer(message.content) } : message;
const suggestedPriority = (value) => {
  if (!/formulaire|fiche de contact/i.test(value)) return value;
  const detail = value.match(/\b(?:concernant|au sujet de)\s+(.+?)[?.!]?\s*$/i)?.[1]
    || value.match(/\bpour\s+(?:un |une )?(?:besoin|projet)(?: de| d')?\s+(.+?)[?.!]?\s*$/i)?.[1]
    || "";
  return detail && detail.length < 10 ? `Besoin : ${detail}` : detail;
};

function assistantMessageText(message, pending) {
  const content = message.content || (pending && message.role === "assistant" ? "Réflexion…" : "");
  if (message.role !== "assistant") return content;
  return linkedParts(content).map((part, index) => {
    if (!part.href) return part.text;
    const local = part.href.startsWith("https://inox-expertises.vercel.app/");
    return <a className="inox-assistant__page-link" key={index} href={local ? part.href.slice("https://inox-expertises.vercel.app".length) : part.href} target={local ? undefined : "_blank"} rel="noopener noreferrer">{part.text} ↗</a>;
  });
}
const emptyIntake = (profileType) => ({
  typeProfil: profileType,
  organisation: "",
  fonction: "",
  nomComplet: "",
  email: "",
  telephone: "",
  localisation: "",
  domaineBesoin: "",
  avancementProjet: "",
  echeanceSouhaitee: "",
  message: "",
  modeContact: "email",
  creneauContact: "",
  consentement: false,
});
function readStored() {
  try {
    const value = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "null",
    );
    if (!value || !Array.isArray(value.messages)) return null;
    return {
      conversationId:
        typeof value.conversationId === "string" ? value.conversationId : "",
      messages: value.messages.map((message) => message?.id?.startsWith("greeting") ? { ...message, content: GREETING } : storedMessage(message)),
      dynamicFields: Array.isArray(value.dynamicFields)
        ? value.dynamicFields.filter(usefulField).slice(0, 3)
        : [],
      dynamicValues:
        value.dynamicValues && typeof value.dynamicValues === "object"
          ? value.dynamicValues
          : {},
    };
  } catch {
    return null;
  }
}
function mergeTranscript(localMessages, serverMessages) {
  const restored = [{ id: "greeting", role: "assistant", content: GREETING }, ...serverMessages.map(storedMessage)];
  const positions = new Map();
  for (const [index, message] of restored.entries()) {
    const key = JSON.stringify([message.role, message.content]);
    positions.set(key, [...(positions.get(key) || []), index]);
  }
  for (const message of localMessages) {
    const key = JSON.stringify([message.role, message.content]);
    const index = positions.get(key)?.shift();
    if (index !== undefined) restored[index] = { ...restored[index], id: message.id };
    else if (message.content) restored.push(storedMessage(message));
  }
  return restored;
}
async function readStream(response, onEvent) {
  if (!response.body) throw new Error("Connexion au service impossible.");
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    let separator = buffer.indexOf("\n\n");
    while (separator >= 0) {
      const block = buffer.slice(0, separator);
      buffer = buffer.slice(separator + 2);
      const event = block.match(/^event: (.+)$/m)?.[1] || "message";
      const data = block.match(/^data: (.+)$/m)?.[1];
      if (data) onEvent(event, JSON.parse(data));
      separator = buffer.indexOf("\n\n");
    }
    if (done) break;
  }
}
async function ensureConversationId(conversationId) {
  if (conversationId) return conversationId;
  const response = await fetch("/api/assistant/conversations", { method: "POST" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.conversationId) throw new Error(result.error || "L’échange ne peut pas démarrer pour le moment. Réessayez.");
  return result.conversationId;
}

export function AssistantFlottant() {
  const [open, setOpen] = useState(false),
    [showWindow, setShowWindow] = useState(false),
    [hydrated, setHydrated] = useState(false),
    [conversationId, setConversationId] = useState(""),
    [messages, setMessages] = useState([
      { id: "greeting", role: "assistant", content: GREETING },
    ]),
    [input, setInput] = useState(""),
    [pending, setPending] = useState(false),
    [online, setOnline] = useState(true),
    [error, setError] = useState(""),
    [intakeProfile, setIntakeProfile] = useState(""),
    [intake, setIntake] = useState(null),
    [intakeError, setIntakeError] = useState(""),
    [confirmReset, setConfirmReset] = useState(false),
    [dynamicFields, setDynamicFields] = useState([]),
    [dynamicValues, setDynamicValues] = useState({});
  const intakeDraftRef = useRef(null);
  const endRef = useRef(null);
  const retryRef = useRef(null);
  const restoreRef = useRef(null);
  const closeTimerRef = useRef(null);
  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);
  function toggleAssistant() {
    window.clearTimeout(closeTimerRef.current);
    if (open) {
      setOpen(false);
      closeTimerRef.current = window.setTimeout(() => setShowWindow(false), 220);
    } else {
      setShowWindow(true);
      setOpen(true);
    }
  }
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readStored();
      if (stored?.messages?.length) setMessages(stored.messages);
      const lastMessage = stored?.messages?.at(-1);
      if (lastMessage?.role === "user" && /^user-[a-f0-9-]{36}$/i.test(lastMessage.id) && lastMessage.content) {
        retryRef.current = { draft: lastMessage.content, id: lastMessage.id.slice(5) };
        setInput(lastMessage.content);
      }
      if (stored?.conversationId) setConversationId(stored.conversationId);
      if (stored?.dynamicFields) setDynamicFields(stored.dynamicFields);
      if (stored?.dynamicValues) setDynamicValues(stored.dynamicValues);
      setOnline(navigator.onLine);
      setHydrated(true);
      if (stored?.conversationId && navigator.onLine) {
        const controller = new AbortController();
        restoreRef.current = controller;
        fetch(`/api/assistant/conversations?conversationId=${encodeURIComponent(stored.conversationId)}`, { cache: "no-store", signal: controller.signal })
          .then(async (response) => {
            if (!response.ok) throw new Error(response.status === 404 ? "Cet échange n’est plus accessible depuis ce navigateur. Vous pouvez ouvrir un nouvel échange." : "L’historique n’a pas pu être actualisé. Votre copie locale est conservée.");
            return response.json();
          })
          .then((result) => {
            if (controller.signal.aborted) return;
            setMessages((current) => mergeTranscript(current, Array.isArray(result.messages) ? result.messages : []));
            setDynamicFields((current) => current.length ? current : Array.isArray(result.dynamicFields) ? result.dynamicFields.filter(usefulField).slice(0, 3) : []);
          })
          .catch((caught) => { if (!controller.signal.aborted) setError(caught.message || "L’historique n’a pas pu être actualisé."); });
      }
    }, 0);
    const on = () => setOnline(true),
      off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      restoreRef.current?.abort();
      window.clearTimeout(timer);
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          conversationId,
          messages,
          dynamicFields,
          dynamicValues,
        }),
      );
    } catch {}
  }, [conversationId, hydrated, messages, dynamicFields, dynamicValues]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, open, dynamicFields]);
  useEffect(() => { if (intake) intakeDraftRef.current = intake; }, [intake]);
  const formTitle = useMemo(
    () =>
      intakeProfile === "entreprise"
        ? "Présenter un besoin d’entreprise"
        : "Présenter un besoin personnel",
    [intakeProfile],
  );
  function openIntake(profileType = null, offer = null) {
    const selectedProfile = profileType || intakeDraftRef.current?.typeProfil || inferredProfile(messages);
    const previousNeed = offer ? offer.summary || "" : [...messages].reverse().find((item) => item.role === "user" && item.content.length >= 10)?.content || "";
    const draft = intakeDraftFromMessage(previousNeed);
    const resumeDraft = intakeDraftRef.current && (!offer || !offer.summary && !offer.needArea && !offer.projectStage && !offer.desiredTimeline);
    const nextIntake = resumeDraft
      ? { ...intakeDraftRef.current, typeProfil: selectedProfile }
      : { ...emptyIntake(selectedProfile), domaineBesoin: offer?.needArea || draft.needArea, avancementProjet: offer?.projectStage || draft.projectStage, echeanceSouhaitee: offer?.desiredTimeline || draft.desiredTimeline, message: suggestedPriority(draft.summary).slice(0, 1000) };
    setIntakeProfile(selectedProfile);
    setIntake(nextIntake);
    setIntakeError("");
    setError("");
  }
  function changeIntakeProfile(profileType) {
    setIntakeProfile(profileType);
    setIntake((current) => ({ ...current, typeProfil: profileType }));
  }
  function updateIntake(name, value) {
    setIntake((current) => ({ ...current, [name]: value }));
  }
  async function sendMessage(event, forcedMessage) {
    event?.preventDefault();
    const draft =
      typeof forcedMessage === "string" ? forcedMessage : input.trim();
    if (!draft || pending) return;
    if (!navigator.onLine) {
      setOnline(false);
      setError(
        "Une connexion internet est nécessaire pour obtenir une réponse. Votre texte reste disponible.",
      );
      return;
    }
    restoreRef.current?.abort();
    setError("");
    setInput("");
    const clientMessageId =
      retryRef.current?.draft === draft
        ? retryRef.current.id
        : crypto.randomUUID();
    retryRef.current = { draft, id: clientMessageId };
    const userId = `user-${clientMessageId}`,
      assistantId = `assistant-${clientMessageId}`;
    setMessages((current) => [
      ...current,
      ...(current.some((item) => item.id === userId) ? [] : [{ id: userId, role: "user", content: draft }]),
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setPending(true);
    let autoOpenedForm = false;
    try {
      const activeConversationId = await ensureConversationId(conversationId);
      setConversationId(activeConversationId);
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: draft,
          clientMessageId,
        }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(
          result.error || "La réponse n’est pas disponible pour le moment.",
        );
      }
      let completed = false;
      await readStream(response, (eventName, data) => {
        if (eventName === "meta" && data.conversationId)
          setConversationId(data.conversationId);
        if (eventName === "delta")
          setMessages((current) =>
            current.map((item) =>
              item.id === assistantId
                ? { ...item, content: `${item.content}${data.text || ""}` }
                : item,
            ),
          );
        if (eventName === "intake_field" && usefulField(data))
          setDynamicFields((current) =>
            current.length >= 3 ||
            current.some((field) => field.key === data.key)
              ? current
              : [...current, data],
          );
        if (eventName === "intake_offer") {
          if (data.openNow) { autoOpenedForm = true; openIntake(data.profileType, data); }
          else setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, offer: data } : item));
        }
        if (eventName === "contact_details") setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, contacts: data } : item));
        if (eventName === "error")
          throw new Error(
            data.message || "La réponse n’est pas disponible pour le moment.",
          );
        if (eventName === "done") completed = true;
      });
      if (!completed)
        throw new Error(
          "La connexion a été interrompue avant la fin de la réponse. Réessayez.",
        );
      retryRef.current = null;
    } catch (caught) {
      setMessages((current) =>
        current.filter((item) => item.id !== assistantId),
      );
      if (autoOpenedForm) setIntake(null);
      setInput(draft);
      setError(friendlyError(caught, "La réponse n’est pas disponible pour le moment."));
    } finally {
      setPending(false);
    }
  }
  async function submitIntake(event) {
    event.preventDefault();
    if (!intake || pending) return;
    setIntakeError("");
    if (!navigator.onLine) {
      setOnline(false);
      setIntakeError(
        "Une connexion internet est nécessaire pour transmettre la demande.",
      );
      return;
    }
    restoreRef.current?.abort();
    setPending(true);
    try {
      const activeConversationId = await ensureConversationId(conversationId);
      setConversationId(activeConversationId);
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          intake,
          additionalFields: dynamicValues,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          result.error || "La demande n’a pas pu être transmise.",
        );
      setConversationId(result.conversationId || activeConversationId);
      setMessages((current) => [
        ...current,
        {
          id: `intake-${Date.now()}`,
          role: "user",
          content: "Je souhaite être recontacté au sujet de mon besoin.",
        },
        {
          id: `confirmation-${Date.now()}`,
          role: "assistant",
          content: result.message,
        },
      ]);
      intakeDraftRef.current = null;
      setIntake(null);
      setIntakeProfile("");
      setDynamicFields([]);
      setDynamicValues({});
    } catch (caught) {
      setIntakeError(friendlyError(caught, "La demande n’a pas pu être transmise."));
    } finally {
      setPending(false);
    }
  }
  async function newConversation() {
    if (pending) return;
    restoreRef.current?.abort();
    if (conversationId) {
      if (!navigator.onLine) {
        setIntakeError("Reconnectez-vous pour supprimer cet échange et en ouvrir un nouveau.");
        setError("Reconnectez-vous pour supprimer cet échange et en ouvrir un nouveau.");
        return;
      }
      setPending(true);
      try {
        const response = await fetch("/api/assistant/conversations", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.conversationId) throw new Error(result.error || "L’échange n’a pas pu être supprimé. Réessayez avant de recommencer.");
        try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
        retryRef.current = null;
        intakeDraftRef.current = null;
        setConversationId(result.conversationId);
        setMessages([{ id: "greeting", role: "assistant", content: GREETING }]);
        setInput(""); setError(""); setIntake(null); setIntakeProfile(""); setDynamicFields([]); setDynamicValues({}); setConfirmReset(false);
      } catch (caught) {
        setIntakeError(friendlyError(caught, "L’échange n’a pas pu être supprimé."));
        setError(friendlyError(caught, "L’échange n’a pas pu être supprimé."));
      } finally {
        setPending(false);
      }
      return;
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    retryRef.current = null;
    setConversationId("");
    setMessages([
      { id: `greeting-${Date.now()}`, role: "assistant", content: GREETING },
    ]);
    setInput("");
    setError("");
    intakeDraftRef.current = null;
    setIntake(null);
    setIntakeProfile("");
    setDynamicFields([]);
    setDynamicValues({});
    setConfirmReset(false);
  }
  return (
    <div className={`inox-assistant ${open ? "is-open" : ""} ${showWindow && !open ? "is-closing" : ""} ${intake ? "is-intake" : ""} ${!online ? "is-offline" : ""}`}>
      {showWindow ? (
        <section
          className="inox-assistant__window"
          data-state={open ? "open" : "closing"}
          role="dialog"
          aria-label="Assistant INOX Expertises"
          aria-modal="false"
          aria-hidden={!open}
          inert={!open}
        >
          <div className="inox-assistant__head">
            <div className="inox-assistant__brand"><Image src="/images/inox-assistant-ai.png" alt="" width={48} height={48} /><strong>INOX Assistant AI</strong></div>
            <button
              type="button"
              aria-label="Fermer l’assistant"
              onClick={toggleAssistant}
            >
              ×
            </button>
          </div>
          {!online ? <div className="inox-assistant__network is-offline" role="status"><i />Connexion internet requise pour échanger</div> : null}
          <div className="inox-assistant__messages" role="log" aria-label="Messages de l’assistant INOX" tabIndex={0}>
            {messages.map((message) => (
              <div
                className={`inox-assistant__message inox-assistant__message--${message.role}`}
                key={message.id}
              >
                {assistantMessageText(message, pending)}
                {message.contacts ? <div className="inox-assistant__actions"><a href={`mailto:${message.contacts.email}`}>Écrire</a><a href={message.contacts.phoneHref}>Appeler</a><a href={message.contacts.website} target="_blank" rel="noopener noreferrer">Site INOX</a></div> : null}
                {message.offer ? <div className="inox-assistant__actions"><button type="button" onClick={() => openIntake(message.offer.profileType, message.offer)}>Compléter ma demande</button></div> : null}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          {!intake && messages.length <= 1 ? (
            <div className="inox-assistant__choices">
              <div>
                <button type="button" onClick={() => openIntake("entreprise")}>
                  Demande entreprise
                </button>
                <button type="button" onClick={() => openIntake("particulier")}>
                  Demande particulier
                </button>
              </div>
            </div>
          ) : null}
          {intake ? (
            <form className="inox-assistant__form" onSubmit={submitIntake} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.target instanceof HTMLTextAreaElement) { event.preventDefault(); if (!pending) event.currentTarget.requestSubmit(); } }}>
              <div className="inox-assistant__form-head">
                <strong>{formTitle}</strong>
                <button
                  type="button"
                  onClick={() => setIntake(null)}
                  aria-label="Fermer le formulaire"
                >
                  ×
                </button>
              </div>
              <div className="inox-assistant__profile-switch" role="group" aria-label="Type de demande">
                <button type="button" aria-pressed={intakeProfile === "entreprise"} onClick={() => changeIntakeProfile("entreprise")}>Entreprise</button>
                <button type="button" aria-pressed={intakeProfile === "particulier"} onClick={() => changeIntakeProfile("particulier")}>Particulier</button>
              </div>
              {intakeProfile === "entreprise" ? (
                <label>
                  Organisation *
                  <input
                    required
                    value={intake.organisation}
                    onChange={(event) =>
                      updateIntake("organisation", event.target.value)
                    }
                    placeholder="Nom de votre organisation"
                  />
                </label>
              ) : null}
              {intakeProfile === "entreprise" ? (
                <label>
                  Fonction
                  <input
                    value={intake.fonction}
                    onChange={(event) =>
                      updateIntake("fonction", event.target.value)
                    }
                    placeholder="Votre rôle"
                  />
                </label>
              ) : null}
              <label>
                Nom complet *
                  <input
                    required
                    value={intake.nomComplet}
                    autoComplete="name"
                  onChange={(event) =>
                    updateIntake("nomComplet", event.target.value)
                  }
                />
              </label>
              <label>
                Adresse email *
                  <input
                    required
                    type="email"
                    value={intake.email}
                    autoComplete="email"
                  onChange={(event) =>
                    updateIntake("email", event.target.value)
                  }
                />
              </label>
              <label>
                Téléphone *
                  <input
                    required
                    value={intake.telephone}
                    autoComplete="tel"
                  onChange={(event) =>
                    updateIntake("telephone", event.target.value)
                  }
                />
              </label>
              <label>
                Ville et pays *
                <input
                  required
                  value={intake.localisation}
                  onChange={(event) =>
                    updateIntake("localisation", event.target.value)
                  }
                  placeholder="Ex. Abidjan, Côte d’Ivoire"
                />
              </label>
              <label>
                Domaine du besoin *
                <select
                  required
                  value={intake.domaineBesoin}
                  onChange={(event) =>
                    updateIntake("domaineBesoin", event.target.value)
                  }
                >
                  <option value="">Choisir</option>
                  <option>Datacenter, cloud & productivité</option>
                  <option>Réseaux & cybersécurité</option>
                  <option>Développement & intégration</option>
                  <option>Audit & conseil</option>
                  <option>Formation, assistance & support</option>
                  <option>Autre besoin</option>
                </select>
              </label>
              <div className="inox-assistant__form-grid">
                <label>
                  Avancement *
                  <select
                    required
                    value={intake.avancementProjet}
                    onChange={(event) =>
                      updateIntake("avancementProjet", event.target.value)
                    }
                  >
                    <option value="">Choisir</option>
                    <option value="idee">Idée à clarifier</option>
                    <option value="cadrage">Cadrage en cours</option>
                    <option value="prestataire">
                      Recherche de prestataire
                    </option>
                    <option value="deploiement">Projet lancé</option>
                    <option value="incident">Incident à résoudre</option>
                  </select>
                </label>
                <label>
                  Échéance *
                  <select
                    required
                    value={intake.echeanceSouhaitee}
                    onChange={(event) =>
                      updateIntake("echeanceSouhaitee", event.target.value)
                    }
                  >
                    <option value="">Choisir</option>
                    <option value="urgent">Dès que possible</option>
                    <option value="1-mois">Sous 1 mois</option>
                    <option value="1-3-mois">Dans 1 à 3 mois</option>
                    <option value="3-mois-plus">Dans plus de 3 mois</option>
                    <option value="a-definir">À définir</option>
                  </select>
                </label>
              </div>
              <label>
                Votre priorité *
                <textarea
                  required
                  minLength={10}
                  value={intake.message}
                  onChange={(event) =>
                    updateIntake("message", event.target.value)
                  }
                  rows="3"
                  placeholder="Le résultat attendu ou la difficulté à résoudre"
                />
              </label>
              {dynamicFields.length || Object.keys(dynamicValues).length ? (
                <fieldset className="inox-assistant__extra-review">
                  <legend>Précisions complémentaires facultatives</legend>
                  {[...dynamicFields, ...Object.keys(dynamicValues).filter((key) => !dynamicFields.some((field) => field.key === key)).map((key) => ({ key, label: key.replaceAll("_", " ") }))].map((field) => (
                    <label key={field.key}>{field.label}<input value={dynamicValues[field.key] || ""} onChange={(event) => setDynamicValues((current) => ({ ...current, [field.key]: event.target.value }))} placeholder="Laisser vide si non pertinent" /></label>
                  ))}
                </fieldset>
              ) : null}
              <label>
                Canal de recontact
                <select
                  value={intake.modeContact}
                  onChange={(event) =>
                    updateIntake("modeContact", event.target.value)
                  }
                >
                  <option value="email">Email</option>
                  <option value="telephone">Téléphone</option>
                  <option value="indifferent">Email ou téléphone</option>
                </select>
              </label>
              <label>
                Créneau de recontact souhaité
                <input
                  value={intake.creneauContact}
                  onChange={(event) =>
                    updateIntake("creneauContact", event.target.value)
                  }
                  placeholder="Facultatif"
                />
              </label>
              <label className="inox-assistant__check">
                <input
                  type="checkbox"
                  required
                  checked={intake.consentement}
                  onChange={(event) =>
                    updateIntake("consentement", event.target.checked)
                  }
                />
                <span>
                  J’accepte que mes informations soient utilisées pour répondre
                  à ma demande.
                </span>
              </label>
              {intakeError ? (
                <p className="inox-assistant__error" role="alert">
                  {intakeError}
                </p>
              ) : null}
              <button
                className="inox-assistant__submit"
                type="submit"
                disabled={pending}
              >
                {pending ? "Transmission…" : "Transmettre ma demande"}
              </button>
            </form>
          ) : null}
          {!intake ? (
            <form className="inox-assistant__composer" onSubmit={sendMessage}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!pending && online && input.trim()) event.currentTarget.form?.requestSubmit(); } }}
                disabled={pending}
                rows="2"
                placeholder="Écrivez votre question…"
                aria-label="Message à l’assistant"
                aria-describedby="inox-composer-hint"
              />
              {error ? (
                <p className="inox-assistant__error" role="alert">
                  {error} <button type="button" onClick={sendMessage} disabled={pending || !input.trim() || !online}>Réessayer</button>
                </p>
              ) : null}
              <div>
                <button type="button" onClick={() => openIntake()}>
                  Présenter un besoin
                </button>
                <span id="inox-composer-hint" className="inox-assistant__hint">Entrée pour envoyer</span>
                <button
                  type="submit"
                  disabled={pending || !input.trim() || !online}
                >
                  {pending ? "Réponse…" : "Envoyer ↗"}
                </button>
              </div>
            </form>
          ) : null}
          {conversationId || messages.length > 1 ? <div className={`inox-assistant__foot ${confirmReset ? "is-confirming" : ""}`}>
            {confirmReset ? <><span>Cet échange et ses messages seront supprimés. Les demandes déjà envoyées restent disponibles pour leur suivi.</span><div><button type="button" onClick={() => setConfirmReset(false)} disabled={pending}>Annuler</button><button type="button" onClick={newConversation} disabled={pending}>{pending ? "Suppression…" : "Supprimer et recommencer"}</button></div></> : <button className="inox-assistant__reset" type="button" onClick={() => setConfirmReset(true)} disabled={pending} aria-label="Ouvrir un nouvel échange">＋ <span>Nouvel échange</span></button>}
          </div> : null}
        </section>
      ) : null}
      <button
        className="inox-assistant__bubble"
        type="button"
        onClick={toggleAssistant}
        aria-expanded={open}
        aria-label={
          open ? "Fermer l’assistant INOX" : "Ouvrir l’assistant INOX"
        }
      >
        <Image src="/images/inox-assistant-ai.png" alt="" width={31} height={31} />
        <b>Parler à INOX</b>
      </button>
    </div>
  );
}
