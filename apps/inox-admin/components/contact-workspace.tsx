"use client";

import { useEffect, useMemo, useState } from "react";

type ContactRequest = {
  id: number;
  source: string;
  profile_type: "entreprise" | "particulier";
  organization: string | null;
  job_title: string | null;
  full_name: string;
  email: string;
  phone: string;
  location: string | null;
  need_area: string;
  project_stage: string | null;
  desired_timeline: string | null;
  preferred_contact: string;
  preferred_time: string | null;
  message: string;
  consented_at: string;
  status: "new" | "in_progress" | "completed" | "archived" | "spam";
  created_at: string;
};

const statusLabels: Record<ContactRequest["status"], string> = {
  new: "Nouveau",
  in_progress: "En cours",
  completed: "Traité",
  archived: "Archivé",
  spam: "Indésirable",
};

const stageLabels: Record<string, string> = {
  idee: "Idée ou besoin à clarifier",
  cadrage: "Cadrage en cours",
  prestataire: "Recherche de prestataire",
  deploiement: "Projet déjà lancé",
  incident: "Problème ou incident à résoudre",
};

const timelineLabels: Record<string, string> = {
  urgent: "Dès que possible",
  "1-mois": "Sous 1 mois",
  "1-3-mois": "Dans 1 à 3 mois",
  "3-mois-plus": "Dans plus de 3 mois",
  "a-definir": "À définir ensemble",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Abidjan",
  }).format(new Date(value));
}

export default function ContactWorkspace() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notice, setNotice] = useState("Chargement des demandes…");

  async function loadContacts() {
    const response = await fetch("/api/admin/contacts", { cache: "no-store" });
    if (!response.ok) throw new Error("Les demandes ne sont pas disponibles.");
    const data = await response.json() as { contacts: ContactRequest[] };
    setContacts(data.contacts);
    setSelectedId((current) => data.contacts.some((contact) => contact.id === current)
      ? current
      : data.contacts[0]?.id ?? null);
    setNotice(data.contacts.length ? "" : "Aucune demande reçue pour le moment.");
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadContacts().catch((error) => setNotice(error instanceof Error ? error.message : "Chargement impossible."));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const selected = useMemo(
    () => contacts.find((contact) => contact.id === selectedId) ?? null,
    [contacts, selectedId],
  );

  async function updateStatus(status: ContactRequest["status"]) {
    if (!selected) return;
    const response = await fetch("/api/admin/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, status }),
    });
    if (!response.ok) {
      setNotice("Le statut n’a pas pu être enregistré.");
      return;
    }
    setContacts((current) => current.map((contact) => contact.id === selected.id
      ? { ...contact, status }
      : contact));
    setNotice("Statut enregistré.");
  }

  if (!selected) {
    return <section className="panel section-panel"><h2>Demandes de recontact</h2><p>{notice}</p></section>;
  }

  return (
    <div className="contact-workspace">
      <section className="panel request-queue">
        <div className="panel-heading">
          <div><span className="card-label">Boîte de réception</span><h2>{contacts.length} demande{contacts.length > 1 ? "s" : ""}</h2></div>
          <span className="pill pill--orange">{contacts.filter((contact) => contact.status === "new").length} nouvelle{contacts.filter((contact) => contact.status === "new").length > 1 ? "s" : ""}</span>
        </div>
        <div className="contact-list">
          {contacts.map((contact) => (
            <article className={`contact-row ${selected.id === contact.id ? "is-selected" : ""}`} key={contact.id}>
              <div className="avatar avatar--blue">{contact.full_name.slice(0, 2).toUpperCase()}</div>
              <div className="contact-main"><strong>{contact.full_name}</strong><span>{contact.organization || "Particulier"} · {contact.need_area}</span></div>
              <div className="contact-meta"><span className="pill pill--orange">{statusLabels[contact.status]}</span><small>{formatDate(contact.created_at)}</small></div>
              <button className="icon-button icon-button--ghost" type="button" aria-label={`Ouvrir la demande de ${contact.full_name}`} onClick={() => setSelectedId(contact.id)}>→</button>
            </article>
          ))}
        </div>
      </section>

      <article className="request-detail">
        <div className="request-detail__head">
          <div><span className="card-label">INOX-{String(selected.id).padStart(6, "0")} · {selected.profile_type}</span><h2>{selected.full_name}</h2><p>{selected.organization || "Particulier"}{selected.job_title ? ` · ${selected.job_title}` : ""}</p></div>
          <select aria-label="Statut de la demande" value={selected.status} onChange={(event) => updateStatus(event.target.value as ContactRequest["status"])}>
            {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </div>
        <div className="contact-priority"><div><span>Canal de recontact choisi</span><strong>{selected.preferred_contact}</strong><small>{selected.preferred_time || "Aucun créneau précisé"}</small></div></div>
        <div className="detail-actions"><a href={`mailto:${selected.email}`}>{selected.email}</a><a href={`tel:${selected.phone.replace(/\s/g, "")}`}>{selected.phone}</a></div>
        <div className="detail-grid">
          <div className="detail-field"><span>Localisation</span><strong>{selected.location || "Non précisée"}</strong></div>
          <div className="detail-field"><span>Domaine du besoin</span><strong>{selected.need_area}</strong></div>
          <div className="detail-field"><span>Avancement</span><strong>{selected.project_stage ? stageLabels[selected.project_stage] : "Non précisé"}</strong></div>
          <div className="detail-field"><span>Échéance souhaitée</span><strong>{selected.desired_timeline ? timelineLabels[selected.desired_timeline] : "Non précisée"}</strong></div>
          <div className="detail-field"><span>Reçue le</span><strong>{formatDate(selected.created_at)}</strong></div>
          <div className="detail-field"><span>Source</span><strong>{selected.source}</strong></div>
        </div>
        <div className="request-message"><span>Besoin exprimé</span><p>{selected.message}</p></div>
        <div className="consent-proof"><span>Consentement enregistré le {formatDate(selected.consented_at)}, uniquement pour répondre à cette demande.</span></div>
        {notice ? <p role="status">{notice}</p> : null}
      </article>
    </div>
  );
}
