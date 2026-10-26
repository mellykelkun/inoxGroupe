"use client";

import { useRef, useState } from "react";
import type { AdminIdentity } from "@/lib/auth/types";
import AssistantText from "./assistant-text";

type Message = { id: string; role: "user" | "assistant"; content: string; tools?: string[] };
type Action = { actionToken: string; summary: string; invitationUrl?: string };

const GREETING = "Je peux synthétiser les données INOX présentes dans Supabase, comparer les demandes et préparer une action pour votre confirmation.";
const TOOL_LABELS: Record<string, string> = {
  get_contact_report: "Rapport des demandes",
  get_platform_report: "Activité des sites",
  get_visitor_questions: "Questions des visiteurs",
  search_contact_requests: "Recherche de demandes",
  update_contact_status: "Statut de demande",
  delete_contact_requests: "Suppression de demandes",
  invite_admin_member: "Invitation de membre",
  publish_forum_message: "Publication Forum",
  moderate_forum_email: "Modération Forum",
  delete_forum_message: "Suppression Forum",
  create_editorial_draft: "Brouillon Journal",
  update_editorial_status: "Statut Journal",
};

async function readStream(response: Response, onEvent: (name: string, data: any) => void) {
  if (!response.body) throw new Error("Connexion au service impossible.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    let separator = buffer.indexOf("\n\n");
    while (separator >= 0) {
      const block = buffer.slice(0, separator);
      buffer = buffer.slice(separator + 2);
      const name = block.match(/^event: (.+)$/m)?.[1] || "message";
      const raw = block.match(/^data: (.+)$/m)?.[1];
      if (raw) {
        onEvent(name, JSON.parse(raw));
        if (name === "done") completed = true;
      }
      separator = buffer.indexOf("\n\n");
    }
    if (done) break;
  }
  if (!completed) throw new Error("La connexion a été interrompue avant la fin de l’analyse. Réessayez.");
}

export default function AssistantWorkspace({ current }: { current: AdminIdentity }) {
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: "greeting", role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const [notice, setNotice] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef("");

  function appendAssistant(id: string, text: string) { setMessages((items) => items.map((item) => item.id === id ? { ...item, content: `${item.content}${text}` } : item)); }

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = input.trim();
    if (!draft || pending) return;
    setInput(""); setError(""); setNotice(""); setAction(null);
    const assistantId = `assistant-${Date.now()}`;
    const userId = `user-${Date.now()}`;
    setMessages((items) => [...items, { id: userId, role: "user", content: draft }, { id: assistantId, role: "assistant", content: "" }]);
    setPending(true);
    try {
      const response = await fetch("/api/admin/assistant/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: conversationIdRef.current || conversationId, message: draft }) });
      if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || "La réponse n’est pas disponible."); }
      await readStream(response, (name, data) => {
        if (name === "meta" && data.conversationId) { conversationIdRef.current = data.conversationId; setConversationId(data.conversationId); }
        if (name === "delta") appendAssistant(assistantId, data.text || "");
        if (name === "tool" && typeof data.name === "string" && data.ok && TOOL_LABELS[data.name]) {
          setMessages((items) => items.map((item) => item.id === assistantId ? { ...item, tools: [...new Set([...(item.tools || []), data.name])] } : item));
        }
        if (name === "action" && data.actionToken) setAction(data);
        if (name === "error") throw new Error(data.message || "La réponse n’est pas disponible.");
      });
    } catch (caught) {
      setMessages((items) => items.filter((item) => item.id !== assistantId));
      setAction(null);
      setInput(draft);
      setError(caught instanceof Error ? caught.message : "La réponse n’est pas disponible.");
    }
    finally { setPending(false); endRef.current?.scrollIntoView({ behavior: "smooth" }); }
  }

  async function confirm() {
    const activeConversationId = conversationIdRef.current || conversationId;
    if (!action || !activeConversationId || pending) return;
    setPending(true); setError("");
    try {
      const response = await fetch("/api/admin/assistant/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: activeConversationId, confirmAction: action.actionToken }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "L’action n’a pas pu être exécutée.");
      setMessages((items) => [...items, { id: `action-${Date.now()}`, role: "assistant", content: result.message || "Action exécutée." }]);
      setNotice(result.invitationUrl ? "Le lien d’invitation est prêt dans le panneau d’action." : "Action exécutée et journalisée.");
      setAction(result.invitationUrl ? { ...action, invitationUrl: result.invitationUrl } : null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "L’action n’a pas pu être exécutée."); }
    finally { setPending(false); }
  }

  async function copyInvitation() {
    if (!action?.invitationUrl) return;
    await navigator.clipboard.writeText(action.invitationUrl);
    setNotice("Lien d’invitation copié. Transmettez-le uniquement au membre concerné.");
  }

  async function newSession() {
    if (pending) return;
    setError("");
    const activeConversationId = conversationIdRef.current || conversationId;
    if (activeConversationId) {
      setPending(true);
      try {
        const response = await fetch("/api/admin/assistant/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: activeConversationId, closeSession: true }) });
        if (!response.ok) throw new Error("La session précédente n’a pas pu être clôturée. Réessayez.");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "La session précédente n’a pas pu être clôturée.");
        setPending(false);
        return;
      }
      setPending(false);
    }
    conversationIdRef.current = "";
    setConversationId(""); setMessages([{ id: `greeting-${Date.now()}`, role: "assistant", content: GREETING }]); setInput(""); setNotice(""); setAction(null);
  }

  return (
    <div className="admin-assistant-workspace">
      <section className="admin-assistant-panel">
        <div className="admin-assistant-panel__head"><div><span className="card-label">Pilotage assisté</span><h2>Les données utiles, au bon moment.</h2><p>Interrogez les demandes, le forum, le Journal INOX et les conversations déjà conservées dans Supabase.</p></div><span className="admin-assistant-identity">{current.displayName} · {current.role}</span></div>
        <div className="admin-assistant-messages" role="log" aria-label="Échange avec l’assistant admin" tabIndex={0}>{messages.map((message) => <article className={`admin-assistant-message admin-assistant-message--${message.role}`} key={message.id}><span>{message.role === "assistant" ? "Assistant INOX" : current.displayName}</span><AssistantText text={message.content || (pending && message.role === "assistant" ? "Analyse en cours…" : "")} />{message.tools?.length ? <small className="admin-assistant-tool-trace">Outils mobilisés : {message.tools.map((name) => TOOL_LABELS[name]).join(" · ")}</small> : null}</article>)}<div ref={endRef} /></div>
        {action ? <aside className="admin-assistant-action"><span className="card-label">Confirmation requise</span><strong>{action.summary}</strong>{action.invitationUrl ? <code>{action.invitationUrl}</code> : null}{action.invitationUrl ? <button type="button" onClick={copyInvitation}>Copier le lien sécurisé</button> : <button type="button" onClick={confirm} disabled={pending}>Confirmer et exécuter</button>}<small>Cette action sera contrôlée selon votre rôle et inscrite dans le journal de sécurité.</small></aside> : null}
        <form className="admin-assistant-composer" onSubmit={send}><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!pending && input.trim()) event.currentTarget.form?.requestSubmit(); } }} rows={3} disabled={pending} placeholder="Posez une question ou demandez une action…" aria-label="Demande à l’assistant admin" />{error ? <p className="admin-assistant-error" role="alert">{error}</p> : null}<div><span>{notice || "Entrée pour envoyer · Maj+Entrée pour une ligne"}</span><button type="submit" disabled={pending || !input.trim()}>{pending ? "Analyse…" : "Envoyer ↗"}</button></div></form>
      </section>
      <aside className="admin-assistant-side"><span className="card-label">Commandes rapides</span><h3>Accélérer le suivi</h3><p>Les rapports restent limités aux informations déjà présentes dans Supabase.</p><button type="button" onClick={() => setInput("Analyse les demandes de recontact des 30 derniers jours et indique les besoins les plus fréquents.")}>Rapport des demandes</button><button type="button" onClick={() => setInput("Compare l’activité du site principal et du site Expertises à partir des conversations enregistrées.")}>Comparer les deux sites</button><button type="button" onClick={() => setInput("Montre-moi les demandes nouvelles qui attendent une qualification.")}>Demandes à qualifier</button><button type="button" onClick={newSession} disabled={pending}>Ouvrir une nouvelle session</button><small>Les écritures sensibles demandent toujours votre confirmation explicite.</small></aside>
    </div>
  );
}
