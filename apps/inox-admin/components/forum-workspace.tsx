"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type ForumReply = {
  id: number;
  parentId: number;
  author: string;
  email: string;
  body: string;
  date: string;
  official: boolean;
};

type ForumThread = {
  id: number;
  title: string;
  category: string;
  author: string;
  email: string;
  body: string;
  date: string;
  official: boolean;
  status: "Publié" | "À revoir";
  replies: ForumReply[];
};

type DeleteTarget =
  | { kind: "thread"; id: number; label: string }
  | { kind: "reply"; id: number; label: string };

const categoryLabels: Record<string, string> = {
  general: "Discussion générale",
  conseil: "Conseil & expertise",
  support: "Support technique",
  projet: "Projet numérique",
};

const categories = Object.entries(categoryLabels);

type ForumApiMessage = {
  id: number;
  parent_id: number | null;
  thread_id: number | null;
  subject: string | null;
  category: string;
  body: string;
  display_name: string;
  author_kind: "visitor" | "inox";
  status: string;
  created_at: string;
  email: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Abidjan",
  }).format(new Date(value));
}

function buildThreads(messages: ForumApiMessage[]) {
  const roots = messages.filter((message) => message.parent_id === null);
  const repliesByThread = new Map<number, ForumApiMessage[]>();
  for (const message of messages) {
    if (message.parent_id === null || message.thread_id === null) continue;
    const replies = repliesByThread.get(message.thread_id) ?? [];
    replies.push(message);
    repliesByThread.set(message.thread_id, replies);
  }

  return roots.map<ForumThread>((message) => ({
    id: message.id,
    title: message.subject ?? "Sujet sans titre",
    category: categoryLabels[message.category] ?? message.category,
    author: message.display_name,
    email: message.email,
    body: message.body,
    date: formatDate(message.created_at),
    official: message.author_kind === "inox",
    status: message.status === "published" ? "Publié" : "À revoir",
    replies: (repliesByThread.get(message.id) ?? [])
      .map((reply) => ({
        id: reply.id,
        parentId: reply.parent_id ?? message.id,
        author: reply.display_name,
        email: reply.email,
        body: reply.body,
        date: formatDate(reply.created_at),
        official: reply.author_kind === "inox",
      })),
  })).reverse();
}

function OfficialBadge({ topic = false }: { topic?: boolean }) {
  return <span className="official-badge"><i />{topic ? "Sujet INOX" : "Réponse officielle INOX"}</span>;
}

function ReplyCard({
  reply,
  threadId,
  selected,
  blocked,
  canModerate,
  onSelect,
  onReply,
  onBlock,
  onDelete,
}: {
  reply: ForumReply;
  threadId: number;
  selected: boolean;
  blocked: boolean;
  canModerate: boolean;
  onSelect: () => void;
  onReply: () => void;
  onBlock: () => void;
  onDelete: () => void;
}) {
  return (
    <article className={`forum-message ${reply.official ? "forum-message--official" : ""} ${selected ? "is-selected" : ""}`}>
      <button className="forum-message__select" type="button" onClick={onSelect} aria-label={`Sélectionner la réponse de ${reply.author}`}>
        <span className={`forum-author-avatar ${reply.official ? "is-inox" : ""}`}>{reply.official ? "IX" : reply.author.slice(0, 1)}</span>
        <span>
          <strong>{reply.author}</strong>
          {reply.official ? <OfficialBadge /> : null}
          <small>{reply.date}{reply.parentId !== threadId ? " · Réponse imbriquée" : ""}</small>
        </span>
      </button>
      <p>{reply.body}</p>
      {canModerate ? <div className="forum-message__actions">
        <button type="button" onClick={onReply}>Répondre avec le badge INOX</button>
        {!reply.official ? <button type="button" onClick={onBlock}>{blocked ? "Débloquer l’e-mail" : "Bloquer l’e-mail"}</button> : null}
        <button className="is-danger" type="button" onClick={onDelete}>Supprimer la réponse</button>
      </div> : null}
      {blocked ? <span className="blocked-email">E-mail bloqué · {reply.email}</span> : null}
    </article>
  );
}

function OfficialComposer({
  mode,
  thread,
  replyTarget,
  onClose,
  onSubmit,
}: {
  mode: "topic" | "reply";
  thread?: ForumThread;
  replyTarget?: ForumReply;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="official-composer" aria-label={mode === "topic" ? "Créer un sujet officiel INOX" : "Répondre officiellement"}>
      <div className="official-composer__head">
        <div>
          <OfficialBadge topic={mode === "topic"} />
          <h2>{mode === "topic" ? "Créer un sujet en tant qu’INOX" : "Répondre en tant qu’INOX"}</h2>
          {mode === "reply" ? <p>{replyTarget ? `En réponse à ${replyTarget.author}` : `Dans le sujet « ${thread?.title} »`}</p> : null}
        </div>
        <button type="button" onClick={onClose} aria-label="Fermer le formulaire">×</button>
      </div>
      <form onSubmit={onSubmit}>
        {mode === "topic" ? (
          <>
            <label><span>Sujet</span><input name="subject" minLength={5} maxLength={140} required /></label>
            <label><span>Catégorie</span><select name="category" defaultValue={categories[0][0]}>{categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          </>
        ) : null}
        <label className="is-wide"><span>Message officiel</span><textarea name="body" minLength={10} maxLength={3000} rows={5} required /></label>
        <div className="official-composer__actions">
          <button className="forum-primary-action" type="submit">{mode === "topic" ? "Publier le sujet INOX" : "Publier la réponse officielle"}</button>
          <button className="forum-secondary-action" type="button" onClick={onClose}>Annuler</button>
        </div>
      </form>
    </section>
  );
}

export default function ForumWorkspace() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState(0);
  const [selectedReplyId, setSelectedReplyId] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [composer, setComposer] = useState<"topic" | "reply" | null>(null);
  const [blockedEmails, setBlockedEmails] = useState<Set<string>>(() => new Set());
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [notice, setNotice] = useState("Chargement des échanges du Forum INOX…");
  const [canModerate, setCanModerate] = useState(false);

  const refreshForum = useCallback(async () => {
    const response = await fetch("/api/admin/forum", { cache: "no-store" });
    if (!response.ok) throw new Error("La modération du forum est indisponible.");
    const data = await response.json() as {
      messages: ForumApiMessage[];
      blockedEmails: string[];
      canModerate: boolean;
    };
    const nextThreads = buildThreads(data.messages);
    setThreads(nextThreads);
    setBlockedEmails(new Set(data.blockedEmails));
    setCanModerate(data.canModerate);
    setSelectedThreadId((current) => nextThreads.some((thread) => thread.id === current)
      ? current
      : nextThreads[0]?.id ?? 0);
    setNotice(nextThreads.length
      ? `${nextThreads.length} sujet${nextThreads.length > 1 ? "s" : ""} chargé${nextThreads.length > 1 ? "s" : ""} depuis le forum public.`
      : "Aucun sujet public pour le moment.");
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      refreshForum().catch((error) => setNotice(error instanceof Error ? error.message : "Chargement impossible."));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [refreshForum]);

  const selectedThread = threads.find((thread) => thread.id === selectedThreadId) ?? threads[0];
  const selectedReply = selectedThread?.replies.find((reply) => reply.id === selectedReplyId);
  const visibleThreads = useMemo(() => {
    const query = filter.trim().toLocaleLowerCase("fr");
    if (!query) return threads;
    return threads.filter((thread) => `${thread.title} ${thread.author} ${thread.category}`.toLocaleLowerCase("fr").includes(query));
  }, [filter, threads]);

  function chooseThread(threadId: number) {
    setSelectedThreadId(threadId);
    setSelectedReplyId(null);
    setDeleteTarget(null);
  }

  async function toggleBlock(email: string) {
    if (!canModerate) return;
    const willBlock = !blockedEmails.has(email);
    const response = await fetch("/api/admin/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: willBlock ? "block" : "unblock", email }),
    });
    if (!response.ok) {
      setNotice("La liste de blocage n’a pas pu être mise à jour.");
      return;
    }
    await refreshForum();
    setNotice(willBlock
      ? `${email} est maintenant bloqué sur le forum public.`
      : `${email} peut de nouveau contribuer au forum public.`);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    const response = await fetch(`/api/admin/forum?id=${target.id}`, { method: "DELETE" });
    if (!response.ok) {
      setNotice("La suppression n’a pas pu être appliquée au forum public.");
      return;
    }
    setDeleteTarget(null);
    setSelectedReplyId(null);
    await refreshForum();
    setNotice(target.kind === "thread"
      ? "Le sujet et toutes ses réponses ont été retirés du forum public."
      : "La réponse a été retirée du forum public.");
  }

  async function submitOfficial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const body = String(data.get("body") ?? "").trim();
    const action = composer === "topic" ? "topic" : "reply";
    const payload = action === "topic"
      ? { action, subject: String(data.get("subject") ?? "").trim(), category: String(data.get("category") ?? "general"), body }
      : { action, parentId: selectedReply?.id ?? selectedThread?.id, body };
    const response = await fetch("/api/admin/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setNotice("La publication officielle n’a pas pu être enregistrée.");
      return;
    }
    form.reset();
    setComposer(null);
    await refreshForum();
    setNotice(action === "topic"
      ? "Le sujet officiel INOX est publié avec son badge bleu."
      : "La réponse officielle INOX est publiée avec son badge bleu.");
  }

  if (!selectedThread) {
    return (
      <div className="panel forum-empty-admin">
        <h2>Aucun sujet public pour le moment.</h2>
        <p>{notice}</p>
        {canModerate && composer === "topic"
          ? <OfficialComposer mode="topic" onClose={() => setComposer(null)} onSubmit={submitOfficial} />
          : canModerate ? <button type="button" onClick={() => setComposer("topic")}>Créer un sujet INOX</button> : null}
      </div>
    );
  }

  return (
    <div className="forum-admin-workspace">
      <div className="forum-simulation-note" role="status"><i />{notice}</div>

      <div className="forum-admin-toolbar">
        <div>
          <span className="card-label">Forum public analysé</span>
          <strong>{threads.length} sujet{threads.length > 1 ? "s" : ""} synchronisé{threads.length > 1 ? "s" : ""} avec le site public</strong>
        </div>
        <div>
          {canModerate ? <button className="forum-secondary-action" type="button" onClick={() => { setSelectedReplyId(null); setComposer("reply"); }}>Répondre en tant qu’INOX</button> : null}
          {canModerate ? <button className="forum-primary-action" type="button" onClick={() => setComposer("topic")}>Créer un sujet INOX</button> : null}
        </div>
      </div>

      {composer ? (
        <OfficialComposer
          mode={composer}
          thread={selectedThread}
          replyTarget={selectedReply}
          onClose={() => setComposer(null)}
          onSubmit={submitOfficial}
        />
      ) : null}

      <div className="forum-admin-console">
        <aside className="panel forum-thread-panel">
          <div className="forum-thread-panel__head">
            <div><span className="card-label">Navigation</span><h2>Sujets et branches</h2></div>
            <span>{visibleThreads.length}/{threads.length}</span>
          </div>
          <label className="forum-local-search"><span>Rechercher un sujet</span><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Sujet, auteur ou catégorie" /></label>
          <div className="forum-thread-list">
            {visibleThreads.map((thread) => (
              <button className={selectedThread.id === thread.id ? "is-active" : ""} type="button" onClick={() => chooseThread(thread.id)} key={thread.id}>
                <span className={`forum-author-avatar ${thread.official ? "is-inox" : ""}`}>{thread.official ? "IX" : thread.author.slice(0, 1)}</span>
                <span><small>{thread.category}</small><strong>{thread.title}</strong><em>{thread.author} · {thread.replies.length} {thread.replies.length > 1 ? "réponses" : "réponse"}</em></span>
                {thread.status === "À revoir" ? <i className="review-dot" title="À revoir" /> : null}
              </button>
            ))}
          </div>
        </aside>

        <section className="forum-thread-detail">
          <header className="forum-thread-detail__head">
            <div>
              <div className="forum-thread-kicker"><span>{selectedThread.category}</span><i />{selectedThread.status}</div>
              <h2>{selectedThread.title}</h2>
              <p className="forum-thread-author"><strong>{selectedThread.author}</strong>{selectedThread.official ? <OfficialBadge topic /> : null}<span>{selectedThread.date}</span></p>
            </div>
            <a href="https://inox-groupe.vercel.app/forum" target="_blank" rel="noreferrer">Voir le forum public ↗</a>
          </header>

          <p className="forum-thread-body">{selectedThread.body}</p>

          <div className="forum-moderation-actions">
            {canModerate ? <button className="forum-primary-action" type="button" onClick={() => { setSelectedReplyId(null); setComposer("reply"); }}>Réponse officielle INOX</button> : null}
            {canModerate && !selectedThread.official ? <button className="forum-secondary-action" type="button" onClick={() => toggleBlock(selectedThread.email)}>{blockedEmails.has(selectedThread.email) ? "Débloquer l’e-mail" : "Bloquer l’e-mail"}</button> : null}
            {canModerate ? <button className="forum-danger-action" type="button" onClick={() => setDeleteTarget({ kind: "thread", id: selectedThread.id, label: selectedThread.title })}>Supprimer le sujet</button> : null}
          </div>
          {blockedEmails.has(selectedThread.email) ? <span className="blocked-email">E-mail bloqué · {selectedThread.email}</span> : null}

          {deleteTarget ? (
            <div className="moderation-confirm" role="alert">
              <div><strong>Confirmer la suppression</strong><span>{deleteTarget.kind === "thread" ? "Le sujet, toutes ses réponses et sa branche publique seront retirés." : `La réponse de ${deleteTarget.label} sera retirée du fil.`}</span></div>
              <button type="button" onClick={confirmDelete}>Confirmer</button>
              <button type="button" onClick={() => setDeleteTarget(null)}>Annuler</button>
            </div>
          ) : null}

          <div className="forum-replies-head"><span className="card-label">Fil de discussion</span><strong>{selectedThread.replies.length} {selectedThread.replies.length > 1 ? "réponses" : "réponse"}</strong></div>
          <div className="forum-admin-replies">
            {selectedThread.replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                threadId={selectedThread.id}
                selected={selectedReplyId === reply.id}
                blocked={blockedEmails.has(reply.email)}
                canModerate={canModerate}
                onSelect={() => setSelectedReplyId(reply.id)}
                onReply={() => { setSelectedReplyId(reply.id); setComposer("reply"); }}
                onBlock={() => toggleBlock(reply.email)}
                onDelete={() => setDeleteTarget({ kind: "reply", id: reply.id, label: reply.author })}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
