"use client";

import { useState } from "react";
import ContactWorkspaceLive from "./contact-workspace";
import ForumWorkspace from "./forum-workspace";
import TeamAccessWorkspace from "./team-access-workspace";
import type { AdminIdentity } from "@/lib/auth/types";

type SectionId =
  | "overview"
  | "contacts"
  | "forum"
  | "journal"
  | "presence"
  | "team";

type IconName =
  | "grid"
  | "inbox"
  | "forum"
  | "journal"
  | "mail"
  | "pulse"
  | "users"
  | "search"
  | "bell"
  | "arrow"
  | "external"
  | "menu"
  | "close"
  | "spark"
  | "clock"
  | "check";

const navigation: Array<{ id: SectionId; label: string; icon: IconName; count?: number }> = [
  { id: "overview", label: "Vue d’ensemble", icon: "grid" },
  { id: "contacts", label: "Demandes", icon: "inbox" },
  { id: "forum", label: "Forum", icon: "forum" },
  { id: "journal", label: "Journal INOX", icon: "journal" },
  { id: "presence", label: "Présence web", icon: "pulse" },
  { id: "team", label: "Équipe & accès", icon: "users" },
];

const sectionMeta: Record<SectionId, { eyebrow: string; title: string; description: string }> = {
  overview: {
    eyebrow: "Centre de pilotage",
    title: "Bonjour, équipe INOX.",
    description: "Accédez aux demandes, aux échanges et aux accès de l’équipe.",
  },
  contacts: {
    eyebrow: "Relation commerciale",
    title: "Demandes de recontact",
    description: "Qualifiez les besoins reçus et organisez leur suivi.",
  },
  forum: {
    eyebrow: "Communauté",
    title: "Modération du Forum INOX",
    description: "Préservez la qualité des échanges et préparez les réponses officielles.",
  },
  journal: {
    eyebrow: "Futur contenu éditorial",
    title: "Journal INOX",
    description: "Préparez les futurs articles destinés au site INOX Expertises.",
  },
  presence: {
    eyebrow: "Écosystème numérique",
    title: "Présence web",
    description: "Suivez la disponibilité, l’indexation et les contenus des deux sites.",
  },
  team: {
    eyebrow: "Administration",
    title: "Équipe & accès",
    description: "Gérez les identités nominatives, les rôles et les invitations sécurisées.",
  },
};

const contactRequests = [
  {
    id: "REQ-2026-0018",
    initials: "AD",
    profileType: "Entreprise",
    name: "Awa Diarra",
    company: "Nova Distribution",
    jobTitle: "Responsable des systèmes d’information",
    email: "awa.diarra@nova-distribution.ci",
    phone: "+225 07 48 22 16 90",
    location: "Abidjan, Côte d’Ivoire",
    need: "Réseaux & cybersécurité",
    stage: "Cadrage en cours",
    timeline: "Sous 1 mois",
    channel: "Téléphone",
    availability: "Du lundi au vendredi, entre 09 h et 12 h",
    time: "Il y a 18 min",
    receivedAt: "29 septembre 2026 à 15:11",
    status: "Nouveau",
    tone: "orange",
    source: "Site principal INOX Technologies",
    consentedAt: "29 septembre 2026 à 15:11",
    message: "Nous ouvrons deux nouveaux points de vente et souhaitons relier les sites, sécuriser les accès distants et mettre en place une supervision centralisée. Nous avons besoin d’un diagnostic puis d’une proposition de déploiement.",
  },
  {
    id: "REQ-2026-0017",
    initials: "YM",
    profileType: "Entreprise",
    name: "Yao Mensah",
    company: "Groupe Baobab",
    jobTitle: "Directeur des opérations",
    email: "yao.mensah@groupe-baobab.com",
    phone: "+225 05 76 34 10 28",
    location: "Bouaké, Côte d’Ivoire",
    need: "Datacenter, cloud & productivité",
    stage: "Recherche de prestataire",
    timeline: "Dans 1 à 3 mois",
    channel: "E-mail",
    availability: "Après 14 h",
    time: "Il y a 1 h",
    receivedAt: "29 septembre 2026 à 14:26",
    status: "À qualifier",
    tone: "blue",
    source: "Site principal INOX Technologies",
    consentedAt: "29 septembre 2026 à 14:26",
    message: "Nous voulons consolider nos fichiers et nos outils de collaboration. L’équipe a besoin d’un accompagnement pour choisir une architecture cloud adaptée et planifier la migration sans interrompre l’activité.",
  },
  {
    id: "REQ-2026-0016",
    initials: "SK",
    profileType: "Particulier",
    name: "Salimata Koné",
    company: "Projet personnel",
    jobTitle: "Non applicable",
    email: "salimata.kone@example.com",
    phone: "+225 01 42 58 73 09",
    location: "Yamoussoukro, Côte d’Ivoire",
    need: "Développement & intégration",
    stage: "Idée ou besoin à clarifier",
    timeline: "À définir ensemble",
    channel: "E-mail",
    availability: "En semaine, après 17 h",
    time: "Hier, 16:42",
    receivedAt: "28 septembre 2026 à 16:42",
    status: "En cours",
    tone: "cyan",
    source: "Site principal INOX Technologies",
    consentedAt: "28 septembre 2026 à 16:42",
    message: "Je souhaite cadrer une application de suivi pour une petite activité. J’ai besoin de comprendre les premières étapes, les fonctions essentielles et la manière de lancer une première version.",
  },
];

const forumItems = [
  {
    category: "Projet numérique",
    title: "DevOps — système de monitoring",
    author: "Kevin L.",
    excerpt: "J’ai un projet de système qui permettra de monitorer…",
    replies: 1,
    status: "À revoir",
  },
  {
    category: "Conseil & expertise",
    title: "Cloud en Afrique de l’Ouest",
    author: "Communauté Korhogo",
    excerpt: "Comment garantir disponibilité et maîtrise des coûts ?",
    replies: 2,
    status: "Publié",
  },
  {
    category: "Support technique",
    title: "Plan de reprise après rançongiciel",
    author: "Community London",
    excerpt: "Quelles sauvegardes et quels rôles prévoir avant un incident ?",
    replies: 2,
    status: "Publié",
  },
];

const journalArticles = [
  {
    title: "Cloud hybride en Afrique de l’Ouest : les bons arbitrages",
    topic: "Infrastructure",
    status: "Brouillon",
    date: "Mis à jour aujourd’hui",
    progress: 72,
  },
  {
    title: "Cybersécurité des PME : les protections essentielles",
    topic: "Sécurité",
    status: "À relire",
    date: "Publication prévue le 4 oct.",
    progress: 91,
  },
  {
    title: "Digitaliser sans complexifier les opérations",
    topic: "Transformation",
    status: "Idée",
    date: "Proposé par l’équipe conseil",
    progress: 24,
  },
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    inbox: <><path d="M4 4h16v16H4z"/><path d="M4 14h4l2 3h4l2-3h4"/></>,
    forum: <><path d="M21 15a4 4 0 0 1-4 4H9l-5 3v-7a4 4 0 0 1-1-2.6V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/></>,
    journal: <><path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z"/><path d="M8 7h8M8 11h8M8 15h5"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    pulse: <><path d="M3 12h4l2.2-6 4.2 12 2.2-6H21"/><circle cx="12" cy="12" r="9"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    external: <><path d="M14 3h7v7M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    spark: <><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 52 52" role="img">
        <circle cx="26" cy="23" r="15" />
        <path d="M11 23h30M14 16h24M14 30h24M26 8c5 5 7 10 7 15s-2 10-7 15c-5-5-7-10-7-15s2-10 7-15Z" />
        <path className="brand-orbit" d="M7 40h38" />
      </svg>
    </div>
  );
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

type ContactRequest = (typeof contactRequests)[number];

function ContactList({
  compact = false,
  selectedId,
  onSelect,
}: {
  compact?: boolean;
  selectedId?: string;
  onSelect?: (contact: ContactRequest) => void;
}) {
  return (
    <div className="contact-list">
      {contactRequests.map((contact) => (
        <article className={`contact-row ${selectedId === contact.id ? "is-selected" : ""}`} key={contact.id}>
          <div className={`avatar avatar--${contact.tone}`}>{contact.initials}</div>
          <div className="contact-main">
            <strong>{contact.name}</strong>
            <span>{contact.profileType} · {contact.company} · {contact.need}</span>
          </div>
          {!compact && <span className="contact-channel">{contact.channel}</span>}
          <div className="contact-meta">
            <Pill tone={contact.status === "Nouveau" ? "orange" : contact.status === "En cours" ? "cyan" : "blue"}>{contact.status}</Pill>
            <small>{contact.time}</small>
          </div>
          <button className="icon-button icon-button--ghost" type="button" aria-label={`Ouvrir la demande de ${contact.name}`} onClick={() => onSelect?.(contact)}>
            <Icon name="arrow" />
          </button>
        </article>
      ))}
    </div>
  );
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="detail-field"><span>{label}</span><strong>{children}</strong></div>;
}

function ContactDetail({ contact }: { contact: ContactRequest }) {
  return (
    <article className="request-detail">
      <div className="request-detail__head">
        <div>
          <span className="card-label">{contact.id} · {contact.profileType}</span>
          <h2>{contact.name}</h2>
          <p>{contact.company}{contact.jobTitle !== "Non applicable" ? ` · ${contact.jobTitle}` : ""}</p>
        </div>
        <Pill tone={contact.status === "Nouveau" ? "orange" : contact.status === "En cours" ? "cyan" : "blue"}>{contact.status}</Pill>
      </div>

      <div className="contact-priority">
        <Icon name={contact.channel === "Téléphone" ? "clock" : "mail"} />
        <div><span>Canal de recontact choisi</span><strong>{contact.channel}</strong><small>{contact.availability}</small></div>
      </div>

      <div className="detail-actions">
        <a href={`mailto:${contact.email}`}><Icon name="mail" size={16} /> {contact.email}</a>
        <a href={`tel:${contact.phone.replace(/\s/g, "")}`}><Icon name="arrow" size={16} /> {contact.phone}</a>
      </div>

      <div className="detail-grid">
        <DetailField label="Localisation">{contact.location}</DetailField>
        <DetailField label="Domaine du besoin">{contact.need}</DetailField>
        <DetailField label="Avancement">{contact.stage}</DetailField>
        <DetailField label="Échéance souhaitée">{contact.timeline}</DetailField>
        <DetailField label="Reçue le">{contact.receivedAt}</DetailField>
        <DetailField label="Source">{contact.source}</DetailField>
      </div>

      <div className="request-message">
        <span>Besoin exprimé</span>
        <p>{contact.message}</p>
      </div>

      <div className="consent-proof">
        <Icon name="check" size={17} />
        <span>Consentement enregistré le {contact.consentedAt}, uniquement pour répondre à cette demande.</span>
      </div>
    </article>
  );
}

function ContactWorkspace() {
  const [selectedContact, setSelectedContact] = useState<ContactRequest>(contactRequests[0]);

  return (
    <div className="contact-workspace">
      <section className="panel request-queue">
        <div className="panel-heading">
          <div><span className="card-label">Boîte de réception</span><h2>3 demandes à suivre</h2></div>
          <Pill tone="orange">3 à traiter</Pill>
        </div>
        <ContactList selectedId={selectedContact.id} onSelect={setSelectedContact} />
      </section>
      <ContactDetail contact={selectedContact} />
    </div>
  );
}

function ForumList({ compact = false, onOpen }: { compact?: boolean; onOpen?: () => void }) {
  return (
    <div className="forum-list">
      {forumItems.slice(0, compact ? 2 : undefined).map((item) => (
        <article className="forum-row" key={item.title}>
          <div className="forum-copy">
            <div className="row-kicker"><span>{item.category}</span><i />{item.author}</div>
            <h3>{item.title}</h3>
            <p>{item.excerpt}</p>
          </div>
          <div className="forum-stats">
            <strong>{item.replies}</strong>
            <span>{item.replies > 1 ? "réponses" : "réponse"}</span>
          </div>
          <Pill tone={item.status === "À revoir" ? "orange" : "green"}>{item.status}</Pill>
          <button className="icon-button icon-button--ghost" type="button" aria-label={`Ouvrir ${item.title}`} onClick={onOpen}><Icon name="arrow" /></button>
        </article>
      ))}
    </div>
  );
}

function JournalList() {
  return (
    <div className="journal-list">
      {journalArticles.map((article, index) => (
        <article className="journal-row" key={article.title}>
          <span className="journal-number">0{index + 1}</span>
          <div className="journal-copy">
            <div className="row-kicker"><span>{article.topic}</span><i />{article.status}</div>
            <h3>{article.title}</h3>
            <small>{article.date}</small>
          </div>
          <div className="progress" aria-label={`Avancement ${article.progress}%`}>
            <span style={{ width: `${article.progress}%` }} />
          </div>
          <strong className="progress-value">{article.progress}%</strong>
          <button className="icon-button icon-button--ghost" type="button" aria-label={`Modifier ${article.title}`}><Icon name="arrow" /></button>
        </article>
      ))}
    </div>
  );
}

function JournalWorkspace() {
  return (
    <div className="journal-workspace">
      <aside className="journal-bridge">
        <div className="journal-bridge__icon"><Icon name="journal" size={23} /></div>
        <div>
          <span className="card-label">Branchement prévu</span>
          <h2>Admin INOX → Site Expertises</h2>
          <p>Le Journal INOX sera rédigé ici puis publié sur le site <strong>inox-expertises</strong> après validation.</p>
        </div>
        <div className="bridge-state"><i />Connexion non activée</div>
      </aside>
      <section className="panel section-panel">
        <div className="panel-heading">
          <div><span className="card-label">Aucune publication active</span><h2>Le Journal sera ouvert après validation éditoriale</h2></div>
          <Pill tone="blue">Non publié</Pill>
        </div>
        <p>La future rubrique utilisera uniquement les contenus rédigés et validés par l’équipe INOX avant leur publication.</p>
      </section>
    </div>
  );
}

function PresenceCards({ detailed = false }: { detailed?: boolean }) {
  const sites = [
    {
      label: "Site principal",
      name: "inox-groupe",
      url: "https://inox-groupe.vercel.app",
      status: "En ligne",
      detail: "5 pages · Forum actif · PWA",
      tone: "blue",
    },
    {
      label: "Site Expertises",
      name: "inox-expertises",
      url: "https://inox-expertises.vercel.app",
      status: "Préparation SEO",
      detail: "4 pôles · Indexation désactivée",
      tone: "cyan",
    },
  ];

  return (
    <div className={`presence-grid ${detailed ? "presence-grid--detailed" : ""}`}>
      {sites.map((site) => (
        <article className="presence-card" key={site.name}>
          <div className="presence-head">
            <div><span className="card-label">{site.label}</span><h3>{site.name}</h3></div>
            <span className={`live-dot live-dot--${site.tone}`}><i />{site.status}</span>
          </div>
          <p>{site.detail}</p>
          {detailed && (
            <div className="site-checks">
              <span><Icon name="external" size={16} /> Accès au site public</span>
              <span><Icon name="check" size={16} /> Projet Vercel distinct</span>
            </div>
          )}
          <a className="text-button" href={site.url} target="_blank" rel="noreferrer">Visiter le site <Icon name="external" size={15} /></a>
        </article>
      ))}
    </div>
  );
}

function Overview({ onNavigate }: { onNavigate: (section: SectionId) => void }) {
  return (
    <>
      <section className="metric-grid" aria-label="Indicateurs clés">
        <article className="metric-card metric-card--primary">
          <div className="metric-icon"><Icon name="inbox" /></div>
          <span>Demandes de recontact</span>
          <strong>Suivi</strong>
          <small>Données reçues depuis le formulaire du site principal</small>
          <button type="button" onClick={() => onNavigate("contacts")}>Ouvrir les demandes <Icon name="arrow" size={16} /></button>
        </article>
        <article className="metric-card">
          <div className="metric-icon metric-icon--blue"><Icon name="forum" /></div>
          <span>Forum INOX</span>
          <strong>Modération</strong>
          <small>Sujets, réponses, blocages et publications officielles</small>
          <button type="button" onClick={() => onNavigate("forum")}>Modérer le forum <Icon name="arrow" size={16} /></button>
        </article>
        <article className="metric-card">
          <div className="metric-icon metric-icon--cyan"><Icon name="clock" /></div>
          <span>Journal INOX</span>
          <strong>Préparation</strong>
          <small>La publication vers le site Expertises reste désactivée</small>
          <button type="button" onClick={() => onNavigate("journal")}>Préparer le Journal <Icon name="arrow" size={16} /></button>
        </article>
        <article className="metric-card">
          <div className="metric-icon metric-icon--navy"><Icon name="pulse" /></div>
          <span>Sites INOX</span>
          <strong>Accès direct</strong>
          <small>Site principal et site Expertises</small>
          <button type="button" onClick={() => onNavigate("presence")}>Ouvrir les liens <Icon name="arrow" size={16} /></button>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="panel panel--wide">
          <div className="panel-heading">
            <div><span className="card-label">Relation commerciale</span><h2>Demandes enregistrées</h2></div>
            <button className="text-button" type="button" onClick={() => onNavigate("contacts")}>Consulter les données <Icon name="arrow" size={16} /></button>
          </div>
          <p>Chaque demande conserve le besoin, l’échéance, le canal de recontact et le consentement du demandeur.</p>
        </div>
        <div className="panel panel--presence">
          <div className="panel-heading">
            <div><span className="card-label">État des canaux</span><h2>Présence web</h2></div>
          </div>
          <PresenceCards />
        </div>
      </section>

      <section className="dashboard-grid dashboard-grid--lower">
        <div className="panel panel--wide">
          <div className="panel-heading">
            <div><span className="card-label">Communauté</span><h2>Forum public</h2></div>
            <button className="text-button" type="button" onClick={() => onNavigate("forum")}>Ouvrir la modération <Icon name="arrow" size={16} /></button>
          </div>
          <p>La modération agit directement sur les sujets et les réponses du site principal. Les publications officielles portent le badge INOX.</p>
        </div>
        <aside className="editorial-card">
          <div className="editorial-orbit"><Icon name="spark" size={24} /></div>
          <span className="card-label">Futur canal éditorial</span>
          <h2>Journal INOX</h2>
          <p>Un espace de publication sera relié au site Expertises lorsque la rubrique sera prête.</p>
          <div className="editorial-date"><Icon name="clock" size={16} /> Branchement non activé</div>
          <button type="button" onClick={() => onNavigate("journal")}>Ouvrir l’espace Journal <Icon name="arrow" size={16} /></button>
        </aside>
      </section>
    </>
  );
}

function SectionContent({ section, currentMember }: { section: SectionId; currentMember: AdminIdentity }) {
  if (section === "contacts") return <ContactWorkspaceLive />;
  if (section === "forum") return <ForumWorkspace />;
  if (section === "journal") return <JournalWorkspace />;
  if (section === "presence") return <PresenceCards detailed />;
  if (section === "team") return <TeamAccessWorkspace current={currentMember} />;
  return null;
}

export default function AdminDashboard({ currentMember }: { currentMember: AdminIdentity }) {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = sectionMeta[activeSection];
  const today = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Abidjan",
  }).format(new Date()).toUpperCase().replace(".", "");

  const activeLabel = navigation.find((item) => item.id === activeSection)?.label.toLowerCase();
  const searchHint = activeSection === "overview" ? "Rechercher dans INOX Admin" : `Rechercher dans ${activeLabel}`;

  function navigate(section: SectionId) {
    setActiveSection(section);
    setMenuOpen(false);
    setQuery("");
  }

  return (
    <div className="admin-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-brand">
          <BrandMark />
          <div><strong>INOX</strong><span>ADMINISTRATION</span></div>
          <button className="sidebar-close" type="button" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)}><Icon name="close" /></button>
        </div>

        <div className="workspace-label"><span>Espace</span><strong>INOX Technologies</strong></div>
        <nav className="side-nav" aria-label="Navigation de l’administration">
          {navigation.map((item) => (
            <button
              type="button"
              className={activeSection === item.id ? "is-active" : ""}
              aria-current={activeSection === item.id ? "page" : undefined}
              onClick={() => navigate(item.id)}
              key={item.id}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.count ? <b>{item.count}</b> : null}
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="system-state"><span><i />Session sécurisée</span><small>Authentification 2FA active</small></div>
          <div className="profile-card"><div className="avatar avatar--blue">{currentMember.displayName.slice(0, 2).toUpperCase()}</div><div><strong>{currentMember.displayName}</strong><span>{currentMember.role}</span></div><form action="/api/auth/logout" method="post"><button type="submit" aria-label="Se déconnecter">↪</button></form></div>
        </div>
      </aside>

      {menuOpen ? <button className="sidebar-backdrop" type="button" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} /> : null}

      <main className="main-area">
        <header className="topbar">
          <button className="menu-button" type="button" aria-label="Ouvrir le menu" onClick={() => setMenuOpen(true)}><Icon name="menu" /></button>
          <label className="search-box">
            <Icon name="search" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchHint} aria-label={searchHint} />
            <kbd>⌘ K</kbd>
          </label>
          <div className="topbar-actions">
            <span className="demo-badge"><i /> Données sécurisées</span>
            <button className="icon-button" type="button" aria-label="Notifications"><Icon name="bell" /></button>
            <button className="primary-action" type="button" onClick={() => navigate("journal")}><Icon name="spark" size={17} /> Nouvelle publication</button>
          </div>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div>
              <span className="page-eyebrow"><i />{meta.eyebrow}</span>
              <h1>{meta.title}</h1>
              <p>{meta.description}</p>
            </div>
            <div className="heading-date"><span>{today}</span><strong>Session nominative sécurisée</strong></div>
          </div>

          {query ? (
            <div className="search-notice">
              <Icon name="search" />
              <span>Filtre saisi : <strong>“{query}”</strong>. Utilisez la recherche propre à la section pour filtrer les données.</span>
              <button type="button" onClick={() => setQuery("")}>Effacer</button>
            </div>
          ) : null}

          {activeSection === "overview" ? <Overview onNavigate={navigate} /> : <SectionContent section={activeSection} currentMember={currentMember} />}
        </div>
      </main>
    </div>
  );
}
