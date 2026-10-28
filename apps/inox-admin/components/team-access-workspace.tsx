"use client";

import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ADMIN_EMAIL_EXAMPLE, ADMIN_EMAIL_INPUT_PATTERN } from "@/lib/auth/admin-email";
import type { AdminIdentity, AdminMemberSummary, AdminRole } from "@/lib/auth/types";
import { canInviteMembers, canManageMember } from "@/lib/auth/types";

const roleLabels: Record<AdminRole, string> = {
  owner: "Propriétaire",
  administrator: "Administrateur",
  moderator: "Modérateur",
  editor: "Éditeur",
  viewer: "Lecteur",
};

const statusLabels: Record<AdminMemberSummary["status"], string> = {
  active: "Actif · 2FA vérifié",
  pending: "Activation en attente",
  blocked: "Bloqué",
};

const rolePermissions: Record<AdminRole, readonly string[]> = {
  owner: [
    "Piloter les indicateurs, les demandes et les espaces d’administration.",
    "Préparer des actions avec le pilotage IA, avec confirmation explicite.",
    "Modérer le Forum INOX et gérer les adresses bloquées.",
    "Créer, modifier, publier et archiver les publications du Journal INOX.",
    "Créer des invitations et gérer les comptes administratifs non propriétaires.",
    "Consulter la présence web des sites INOX.",
  ],
  administrator: [
    "Piloter les indicateurs et suivre les demandes de recontact.",
    "Préparer des actions avec le pilotage IA, avec confirmation explicite.",
    "Modérer le Forum INOX et gérer les adresses bloquées.",
    "Créer, modifier, publier et archiver les publications du Journal INOX.",
    "Créer des invitations et gérer les comptes Modérateur, Éditeur et Lecteur.",
    "Consulter la présence web des sites INOX.",
  ],
  moderator: [
    "Modérer le Forum INOX, publier des réponses officielles et gérer les adresses bloquées.",
    "Consulter la présence web des sites INOX.",
  ],
  editor: [
    "Créer, modifier, publier et archiver les publications du Journal INOX.",
    "Consulter la présence web des sites INOX.",
  ],
  viewer: [
    "Consulter la présence web des sites INOX.",
  ],
};

type Invitation = {
  invitationUrl: string;
  member: { userId: string; email: string; displayName: string; role: AdminRole };
  reissued: boolean;
};

type MemberAction = {
  kind: "block" | "unblock" | "delete";
  member: AdminMemberSummary;
};

function invitationErrorMessage(error: string | undefined) {
  if (error === "invalid_admin_email") return "Utilisez une adresse nominative se terminant par @inox-group.net.";
  if (error === "member_already_exists") return "Ce compte est déjà actif, bloqué ou ne peut pas recevoir un nouveau lien.";
  if (error === "owner_required") return "Seul le propriétaire peut nommer un administrateur.";
  if (error === "insufficient_role") return "Votre rôle ne permet pas de gérer ce membre.";
  return "Le lien d’invitation n’a pas pu être créé.";
}

export default function TeamAccessWorkspace({ current, refreshKey = 0 }: { current: AdminIdentity; refreshKey?: number }) {
  const [members, setMembers] = useState<AdminMemberSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("viewer");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [memberAction, setMemberAction] = useState<MemberAction | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [mutatingUserId, setMutatingUserId] = useState<string | null>(null);

  const roles = useMemo<AdminRole[]>(
    () => current.role === "owner"
      ? ["administrator", "moderator", "editor", "viewer"]
      : ["moderator", "editor", "viewer"],
    [current.role],
  );

  const loadMembers = useCallback(async (pendingInvitation?: Invitation | null) => {
    try {
      const response = await fetch("/api/admin/members", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json() as { members: AdminMemberSummary[] };
      setMembers(data.members);
      if (pendingInvitation) {
        const activated = data.members.find((member) =>
          member.userId === pendingInvitation.member.userId && member.status === "active"
        );
        if (activated) {
          setInvitation(null);
          setMessage(`${activated.displayName} est maintenant inscrit avec un 2FA vérifié.`);
        }
      }
    } catch {
      setMessage("Impossible de charger les membres pour le moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadMembers();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadMembers, refreshKey]);

  useEffect(() => {
    if (!invitation) return;
    const interval = window.setInterval(() => void loadMembers(invitation), 12_000);
    return () => window.clearInterval(interval);
  }, [invitation, loadMembers]);

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
      if (!response.ok) throw new Error(invitationErrorMessage(data.error));
      setInvitation(data);
      setDisplayName("");
      setEmail("");
      setRole("viewer");
      await loadMembers(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "L’invitation n’a pas pu être créée.");
    } finally {
      setPending(false);
    }
  }

  async function renewInvitation(member: AdminMemberSummary) {
    setMutatingUserId(member.userId);
    setMessage("");
    try {
      const response = await fetch("/api/admin/invitations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member.userId }),
      });
      const data = await response.json() as Invitation & { error?: string };
      if (!response.ok) throw new Error(invitationErrorMessage(data.error));
      setInvitation(data);
      setMessage(`Un nouveau lien a remplacé le lien précédent pour ${member.displayName}.`);
      await loadMembers(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Le lien n’a pas pu être renouvelé.");
    } finally {
      setMutatingUserId(null);
    }
  }

  function openMemberAction(kind: MemberAction["kind"], member: AdminMemberSummary) {
    setMemberAction({ kind, member });
    setActionReason("");
    setConfirmationEmail("");
    setMessage("");
  }

  function closeMemberAction() {
    if (mutatingUserId) return;
    setMemberAction(null);
    setActionReason("");
    setConfirmationEmail("");
  }

  async function confirmMemberAction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!memberAction) return;
    const { kind, member } = memberAction;
    setMutatingUserId(member.userId);
    setMessage("");

    try {
      const response = await fetch("/api/admin/members", {
        method: kind === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kind === "delete"
          ? { userId: member.userId, confirmationEmail }
          : { userId: member.userId, action: kind, reason: actionReason }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        if (result.error === "confirmation_mismatch") throw new Error("L’adresse saisie ne correspond pas au membre.");
        if (result.error === "invalid_admin_email") throw new Error("Corrigez d’abord l’adresse du membre avant de réactiver son accès.");
        if (result.error === "self_management_forbidden") throw new Error("Vous ne pouvez pas modifier votre propre accès.");
        if (result.error === "insufficient_role") throw new Error("Votre rôle ne permet pas cette action.");
        throw new Error(kind === "delete" ? "Le membre n’a pas pu être supprimé." : "Le statut du membre n’a pas pu être modifié.");
      }

      if (invitation?.member.userId === member.userId) setInvitation(null);
      setMemberAction(null);
      setActionReason("");
      setConfirmationEmail("");
      setMessage(
        kind === "delete"
          ? `${member.displayName} a été supprimé. Ses sessions et son 2FA ont été révoqués.`
          : kind === "block"
            ? `${member.displayName} est bloqué et ne peut plus utiliser l’administration.`
            : `${member.displayName} est débloqué.`,
      );
      await loadMembers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "L’action n’a pas pu être effectuée.");
    } finally {
      setMutatingUserId(null);
    }
  }

  async function copyInvitation() {
    if (!invitation) return;
    try {
      await navigator.clipboard.writeText(invitation.invitationUrl);
      setMessage("Lien d’invitation copié. Transmettez-le uniquement au membre concerné.");
    } catch {
      setMessage("Le lien n’a pas pu être copié. Utilisez le QR d’invitation ou réessayez depuis un navigateur autorisant le presse-papiers.");
    }
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

      <section className="access-permissions" aria-labelledby="access-permissions-title">
        <div>
          <span className="card-label">Vos autorisations</span>
          <h2 id="access-permissions-title">{roleLabels[current.role]}</h2>
          <p>Les actions disponibles pour votre compte sont listées ci-dessous.</p>
        </div>
        <ul>
          {rolePermissions[current.role].map((permission) => <li key={permission}><i />{permission}</li>)}
        </ul>
      </section>

      {canInviteMembers(current.role) ? <div className="access-columns">
        <section className="member-panel">
          <div className="panel-heading"><div><span className="card-label">Gestion des accès</span><h2>Membres INOX</h2></div><span className="member-count">{members.length}</span></div>
          {loading ? <p className="empty-state">Chargement des membres…</p> : null}
          {!loading && members.length === 0 ? <p className="empty-state">Aucun membre synchronisé.</p> : null}
          <div className="member-list">
            {members.map((member) => {
              const manageable = member.userId !== current.userId && canManageMember(current.role, member.role);
              const actionPending = mutatingUserId === member.userId;
              return (
                <article className="member-row" key={member.userId}>
                  <div className="avatar avatar--blue">{member.displayName.slice(0, 2).toUpperCase()}</div>
                  <div className="member-details">
                    <strong>{member.displayName}</strong>
                    <span>{member.email}</span>
                    <small>ID {member.userId}</small>
                    {!member.emailCompliant ? <em>Adresse non conforme au domaine @inox-group.net</em> : null}
                  </div>
                  <div className="member-state">
                    <b>{roleLabels[member.role]}</b>
                    <span className={`member-status member-status--${member.status}`}><i />{statusLabels[member.status]}</span>
                    {manageable ? (
                      <div className="member-actions">
                        {member.status === "pending" ? <button type="button" onClick={() => void renewInvitation(member)} disabled={actionPending}>Renouveler le lien</button> : null}
                        {member.status === "blocked"
                          ? <button type="button" onClick={() => openMemberAction("unblock", member)} disabled={actionPending || !member.emailCompliant}>Débloquer</button>
                          : <button type="button" onClick={() => openMemberAction("block", member)} disabled={actionPending}>Bloquer</button>}
                        <button className="member-action--danger" type="button" onClick={() => openMemberAction("delete", member)} disabled={actionPending}>Supprimer</button>
                      </div>
                    ) : member.userId === current.userId ? <small>Session actuelle</small> : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="invite-panel">
            <span className="card-label">Chaîne de confiance</span>
            <h2>Ajouter un membre</h2>
            <p>Créez un accès nominatif. Le nouveau membre choisit son mot de passe puis active lui-même son authentificateur.</p>
            <form className="invite-form" onSubmit={invite}>
              <label>Nom affiché<input required minLength={2} maxLength={100} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Prénom et nom" /></label>
              <label>Adresse e-mail INOX<input required type="email" autoComplete="off" maxLength={80} pattern={ADMIN_EMAIL_INPUT_PATTERN} title="Utilisez une adresse nominative se terminant par @inox-group.net." value={email} onChange={(event) => setEmail(event.target.value)} placeholder={ADMIN_EMAIL_EXAMPLE} aria-describedby="admin-email-help" /><small id="admin-email-help" className="field-help">Adresse nominative obligatoire au format {ADMIN_EMAIL_EXAMPLE}.</small></label>
              <label>Rôle<select value={role} onChange={(event) => setRole(event.target.value as AdminRole)}>{roles.map((item) => <option value={item} key={item}>{roleLabels[item]}</option>)}</select></label>
              <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Création…" : "Créer le QR d’invitation"}</button>
            </form>

            {invitation ? (
              <div className="invitation-result">
                <div className="invitation-qr"><QRCodeSVG value={invitation.invitationUrl} size={210} level="M" marginSize={2} /></div>
                <h3>{invitation.reissued ? "Invitation renouvelée" : "Invitation prête"} pour {invitation.member.displayName}</h3>
                <p>Le membre scanne ce QR, crée son mot de passe, puis reçoit son propre QR 2FA sur son appareil.</p>
                <button className="secondary-action" type="button" onClick={copyInvitation}>Copier le lien sécurisé</button>
                <small>Le lien n’est pas enregistré en clair. S’il est perdu ou expiré, utilisez « Renouveler le lien » sur le membre en attente.</small>
              </div>
            ) : null}
        </section>
      </div> : null}

      {memberAction ? (
        <div className="member-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeMemberAction(); }}>
          <section className="member-dialog" role="dialog" aria-modal="true" aria-labelledby="member-dialog-title">
            <span className="card-label">Action sensible</span>
            <h2 id="member-dialog-title">
              {memberAction.kind === "delete" ? "Supprimer le membre" : memberAction.kind === "block" ? "Bloquer le membre" : "Débloquer le membre"}
            </h2>
            <p>
              {memberAction.kind === "delete"
                ? `Le compte de ${memberAction.member.displayName}, ses sessions et ses facteurs 2FA seront supprimés. La trace d’audit sera conservée.`
                : memberAction.kind === "block"
                  ? `${memberAction.member.displayName} perdra immédiatement l’accès aux routes d’administration.`
                  : `${memberAction.member.displayName} pourra de nouveau se connecter avec son mot de passe et son 2FA existant.`}
            </p>
            <form onSubmit={confirmMemberAction}>
              {memberAction.kind === "block" ? (
                <label>Motif interne (facultatif)<textarea maxLength={500} value={actionReason} onChange={(event) => setActionReason(event.target.value)} /></label>
              ) : null}
              {memberAction.kind === "delete" ? (
                <label>Confirmez avec l’adresse {memberAction.member.email}<input required type="email" autoComplete="off" value={confirmationEmail} onChange={(event) => setConfirmationEmail(event.target.value)} /></label>
              ) : null}
              <div className="member-dialog-actions">
                <button type="button" onClick={closeMemberAction} disabled={Boolean(mutatingUserId)}>Annuler</button>
                <button className={memberAction.kind === "delete" ? "danger-action" : "auth-submit"} type="submit" disabled={Boolean(mutatingUserId) || (memberAction.kind === "delete" && confirmationEmail.trim().toLowerCase() !== memberAction.member.email.trim().toLowerCase())}>
                  {mutatingUserId ? "Traitement…" : memberAction.kind === "delete" ? "Supprimer définitivement" : memberAction.kind === "block" ? "Confirmer le blocage" : "Confirmer le déblocage"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {message ? <p className="workspace-message" role="status">{message}</p> : null}
    </div>
  );
}
