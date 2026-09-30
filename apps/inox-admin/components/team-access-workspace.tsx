"use client";

import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminIdentity, AdminMemberSummary, AdminRole } from "@/lib/auth/types";
import { canInviteMembers } from "@/lib/auth/types";

const roleLabels: Record<AdminRole, string> = {
  owner: "Propriétaire",
  administrator: "Administrateur",
  moderator: "Modérateur",
  editor: "Éditeur",
  viewer: "Lecture seule",
};

type Invitation = {
  invitationUrl: string;
  member: { userId: string; email: string; displayName: string; role: AdminRole };
};

export default function TeamAccessWorkspace({ current }: { current: AdminIdentity }) {
  const [members, setMembers] = useState<AdminMemberSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("viewer");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const roles = useMemo<AdminRole[]>(
    () => current.role === "owner"
      ? ["administrator", "moderator", "editor", "viewer"]
      : ["moderator", "editor", "viewer"],
    [current.role],
  );

  const loadMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/members", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json() as { members: AdminMemberSummary[] };
      setMembers(data.members);
    } catch {
      setMessage("Impossible de charger les membres pour le moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/members", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<{ members: AdminMemberSummary[] }>;
      })
      .then((data) => {
        if (!cancelled) setMembers(data.members);
      })
      .catch(() => {
        if (!cancelled) setMessage("Impossible de charger les membres pour le moment.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setInvitation(null);

    try {
      const response = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, role }),
      });
      const data = await response.json() as Invitation & { error?: string };
      if (!response.ok) {
        if (data.error === "member_already_exists") throw new Error("Ce compte existe déjà.");
        if (data.error === "owner_required") throw new Error("Seul le propriétaire peut nommer un administrateur.");
        throw new Error("L’invitation n’a pas pu être créée.");
      }
      setInvitation(data);
      setDisplayName("");
      setEmail("");
      setRole("viewer");
      await loadMembers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "L’invitation n’a pas pu être créée.");
    } finally {
      setPending(false);
    }
  }

  async function copyInvitation() {
    if (!invitation) return;
    await navigator.clipboard.writeText(invitation.invitationUrl);
    setMessage("Lien d’invitation copié. Transmettez-le uniquement au membre concerné.");
  }

  return (
    <div className="access-workspace">
      <section className="access-identity">
        <div>
          <span className="card-label">Votre session</span>
          <h2>{current.displayName}</h2>
          <p>{current.email} · {roleLabels[current.role]}</p>
        </div>
        <dl>
          <div><dt>ID membre</dt><dd>{current.userId}</dd></div>
          <div><dt>ID de connexion</dt><dd>{current.sessionId}</dd></div>
          <div><dt>Niveau</dt><dd><span className="secure-level"><i /> AAL2 · 2FA vérifié</span></dd></div>
        </dl>
      </section>

      <div className="access-columns">
        <section className="member-panel">
          <div className="panel-heading"><div><span className="card-label">Accès actifs</span><h2>Membres INOX</h2></div><span className="member-count">{members.length}</span></div>
          {loading ? <p className="empty-state">Chargement des membres…</p> : null}
          {!loading && members.length === 0 ? <p className="empty-state">Aucun membre synchronisé.</p> : null}
          <div className="member-list">
            {members.map((member) => (
              <article className="member-row" key={member.userId}>
                <div className="avatar avatar--blue">{member.displayName.slice(0, 2).toUpperCase()}</div>
                <div><strong>{member.displayName}</strong><span>{member.email}</span><small>ID {member.userId}</small></div>
                <div className="member-state"><b>{roleLabels[member.role]}</b><span className={member.active ? "is-active" : "is-disabled"}><i />{member.active ? "Autorisé" : "Désactivé"}</span></div>
              </article>
            ))}
          </div>
        </section>

        {canInviteMembers(current.role) ? (
          <section className="invite-panel">
            <span className="card-label">Chaîne de confiance</span>
            <h2>Ajouter un membre</h2>
            <p>Créez un accès nominatif. Le nouveau membre activera lui-même son authentificateur.</p>
            <form className="invite-form" onSubmit={invite}>
              <label>Nom affiché<input required minLength={2} maxLength={100} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Prénom et nom" /></label>
              <label>Adresse e-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="membre@inox.ci" /></label>
              <label>Rôle<select value={role} onChange={(event) => setRole(event.target.value as AdminRole)}>{roles.map((item) => <option value={item} key={item}>{roleLabels[item]}</option>)}</select></label>
              <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Création…" : "Créer le QR d’invitation"}</button>
            </form>

            {invitation ? (
              <div className="invitation-result">
                <div className="invitation-qr"><QRCodeSVG value={invitation.invitationUrl} size={210} level="M" marginSize={2} /></div>
                <h3>Invitation prête pour {invitation.member.displayName}</h3>
                <p>Le membre scanne ce QR, crée son mot de passe, puis reçoit son propre QR 2FA sur son appareil.</p>
                <button className="secondary-action" type="button" onClick={copyInvitation}>Copier le lien sécurisé</button>
                <small>Ce QR est un moyen de transport de l’invitation. Il ne contient jamais le secret TOTP.</small>
              </div>
            ) : null}
          </section>
        ) : (
          <section className="invite-panel"><span className="card-label">Droits</span><h2>Ajout réservé</h2><p>Seuls le propriétaire et les administrateurs peuvent inviter un nouveau membre.</p></section>
        )}
      </div>
      {message ? <p className="workspace-message" role="status">{message}</p> : null}
    </div>
  );
}
