"use client";

import { useEffect, useMemo, useState } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import ContactWorkspaceLive from "./contact-workspace";
import EditorialWorkspace from "./editorial-workspace";
import ForumWorkspace from "./forum-workspace";
import TeamAccessWorkspace from "./team-access-workspace";
import AssistantWorkspace from "./assistant-workspace";
import {
  canAccessAdminWorkspace,
  canManageEditorial,
  type AdminIdentity,
  type AdminWorkspace,
} from "@/lib/auth/types";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";

type SectionId = AdminWorkspace;

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
  { id: "assistant", label: "Pilotage IA", icon: "spark" },
  { id: "contacts", label: "Demandes", icon: "inbox" },
  { id: "forum", label: "Forum", icon: "forum" },
  { id: "journal", label: "Journal INOX", icon: "journal" },
  { id: "presence", label: "Présence web", icon: "pulse" },
  { id: "team", label: "Équipe & accès", icon: "users" },
];

function availableNavigation(role: AdminIdentity["role"]) {
  return navigation.filter((item) => canAccessAdminWorkspace(role, item.id));
}

function firstAccessibleSection(role: AdminIdentity["role"]) {
  return availableNavigation(role)[0]?.id ?? "team";
}

const sectionMeta: Record<SectionId, { eyebrow: string; title: string; description: string }> = {
  overview: {
    eyebrow: "Centre de pilotage",
    title: "Bonjour, équipe INOX.",
    description: "Accédez aux demandes, aux échanges et aux accès de l’équipe.",
  },
  assistant: {
    eyebrow: "Pilotage assisté",
    title: "Des décisions plus lisibles, à partir de vos données.",
    description: "Interrogez les informations INOX, préparez des actions et gardez la main sur chaque écriture.",
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
    eyebrow: "Publication éditoriale",
    title: "Journal INOX",
    description: "Rédigez, publiez et synchronisez les informations du réseau INOX.",
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

type OverviewStats = {
  contacts: {
    total: number;
    new: number;
    inProgress: number;
    source: "inox-groupe";
  };
  forum: {
    topics: number;
    replies: number;
    blockedEmails: number;
    source: "inox-groupe";
  };
  journal: {
    source: "inoxgroupe-v2";
    connection: "live";
  };
};

type NotificationCounts = {
  contacts: number;
  forum: number;
};

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
      status: "En ligne",
      detail: "4 pôles · Fil éditorial SSE actif",
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

function Overview({
  onNavigate,
  stats,
  loading,
}: {
  onNavigate: (section: SectionId) => void;
  stats: OverviewStats | null;
  loading: boolean;
}) {
  const value = (number: number | undefined) => loading ? "…" : number === undefined ? "—" : String(number);

  return (
    <>
      <section className="metric-grid" aria-label="Indicateurs clés">
        <article className="metric-card metric-card--primary">
          <div className="metric-icon"><Icon name="inbox" /></div>
          <span>Demandes de recontact</span>
          <strong>{value(stats?.contacts.total)}</strong>
          <small>{value(stats?.contacts.new)} nouvelle{stats?.contacts.new === 1 ? "" : "s"} · {value(stats?.contacts.inProgress)} en cours · site principal</small>
          <button type="button" onClick={() => onNavigate("contacts")}>Ouvrir les demandes <Icon name="arrow" size={16} /></button>
        </article>
        <article className="metric-card">
          <div className="metric-icon metric-icon--blue"><Icon name="forum" /></div>
          <span>Forum INOX</span>
          <strong>{value(stats?.forum.topics)} sujet{stats?.forum.topics === 1 ? "" : "s"}</strong>
          <small>{value(stats?.forum.replies)} réponse{stats?.forum.replies === 1 ? "" : "s"} · {value(stats?.forum.blockedEmails)} adresse{stats?.forum.blockedEmails === 1 ? "" : "s"} bloquée{stats?.forum.blockedEmails === 1 ? "" : "s"}</small>
          <button type="button" onClick={() => onNavigate("forum")}>Modérer le forum <Icon name="arrow" size={16} /></button>
        </article>
        <article className="metric-card">
          <div className="metric-icon metric-icon--cyan"><Icon name="clock" /></div>
          <span>Journal INOX</span>
          <strong>Actif</strong>
          <small>Publication admin → site Expertises · synchronisation SSE</small>
          <button type="button" onClick={() => onNavigate("journal")}>Publier dans le Journal <Icon name="arrow" size={16} /></button>
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
          <span className="card-label">Canal éditorial partagé</span>
          <h2>Journal INOX</h2>
          <p>Publiez les informations qui alimentent en temps réel le fil éditorial du site Expertises.</p>
          <div className="editorial-date"><Icon name="check" size={16} /> Publication synchronisée</div>
          <button type="button" onClick={() => onNavigate("journal")}>Ouvrir l’espace Journal <Icon name="arrow" size={16} /></button>
        </aside>
      </section>
    </>
  );
}

function SectionContent({
  section,
  currentMember,
  refreshKey,
}: {
  section: SectionId;
  currentMember: AdminIdentity;
  refreshKey: number;
}) {
  if (section === "contacts") return <ContactWorkspaceLive current={currentMember} refreshKey={refreshKey} />;
  if (section === "assistant") return <AssistantWorkspace current={currentMember} />;
  if (section === "forum") return <ForumWorkspace refreshKey={refreshKey} />;
  if (section === "journal") return <EditorialWorkspace refreshKey={refreshKey} />;
  if (section === "presence") return <PresenceCards detailed />;
  if (section === "team") return <TeamAccessWorkspace current={currentMember} refreshKey={refreshKey} />;
  return null;
}

type LiveStatus = "connecting" | "live" | "reconnecting";

export default function AdminDashboard({ currentMember }: { currentMember: AdminIdentity }) {
  const [activeSection, setActiveSection] = useState<SectionId>(() => firstAccessibleSection(currentMember.role));
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({ contacts: 0, forum: 0 });
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [liveRevision, setLiveRevision] = useState(0);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>("connecting");
  const meta = sectionMeta[activeSection];
  const permittedNavigation = useMemo(
    () => availableNavigation(currentMember.role),
    [currentMember.role],
  );
  const today = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Abidjan",
  }).format(new Date()).toUpperCase().replace(".", "");

  const activeLabel = navigation.find((item) => item.id === activeSection)?.label.toLowerCase();
  const searchHint = activeSection === "overview" ? "Rechercher dans INOX Admin" : `Rechercher dans ${activeLabel}`;

  useEffect(() => {
    const followLinkedSection = () => {
      const section = window.location.hash.slice(1) as SectionId;
      if (permittedNavigation.some((item) => item.id === section)) {
        setActiveSection(section);
        setMenuOpen(false);
        setQuery("");
      }
    };
    followLinkedSection();
    window.addEventListener("hashchange", followLinkedSection);
    window.addEventListener("popstate", followLinkedSection);
    return () => {
      window.removeEventListener("hashchange", followLinkedSection);
      window.removeEventListener("popstate", followLinkedSection);
    };
  }, [permittedNavigation]);

  useEffect(() => {
    let disposed = false;
    let client: SupabaseClient | undefined;
    let channel: RealtimeChannel | undefined;
    let hasSubscribed = false;

    void createBrowserSupabaseClient()
      .then((supabase) => {
        if (disposed) return;
        client = supabase;
        channel = supabase
          .channel("inox-admin-sync")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "admin_sync_state",
              filter: "scope=eq.all",
            },
            (payload) => {
              const revision = Number(payload.new.revision);
              setLiveStatus("live");
              setLiveRevision((current) => Number.isSafeInteger(revision) && revision > current
                ? revision
                : current + 1);
            },
          )
          .subscribe((status) => {
            if (disposed) return;
            if (status === "SUBSCRIBED") {
              setLiveStatus("live");
              if (hasSubscribed) setLiveRevision((current) => current + 1);
              hasSubscribed = true;
              return;
            }
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
              setLiveStatus("reconnecting");
            }
          });
      })
      .catch(() => {
        if (!disposed) setLiveStatus("reconnecting");
      });

    return () => {
      disposed = true;
      if (client && channel) void client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (activeSection !== "overview" || !canAccessAdminWorkspace(currentMember.role, "overview")) return;

    const controller = new AbortController();
    let active = true;
    fetch("/api/admin/overview", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("overview_unavailable");
        return response.json() as Promise<OverviewStats>;
      })
      .then((stats) => {
        if (active) setOverviewStats(stats);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (active) setOverviewStats(null);
      })
      .finally(() => {
        if (active) setOverviewLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [activeSection, currentMember.role, liveRevision]);

  useEffect(() => {
    const section = activeSection === "contacts" || activeSection === "forum"
      ? activeSection
      : null;
    const controller = new AbortController();
    let active = true;

    async function syncNotifications() {
      if (section) {
        const readResponse = await fetch("/api/admin/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section }),
          signal: controller.signal,
        });
        if (!readResponse.ok) {
          console.error("Marquage de la section comme lue impossible");
        }
      }

      const response = await fetch("/api/admin/notifications", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("notifications_unavailable");
      const payload = await response.json() as {
        notifications?: Partial<NotificationCounts>;
      };
      const count = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : 0;

      if (active) {
        setNotificationCounts({
          contacts: count(payload.notifications?.contacts),
          forum: count(payload.notifications?.forum),
        });
      }
    }

    syncNotifications().catch((error) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (active) console.error("Synchronisation des notifications impossible", error);
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [activeSection, liveRevision]);

  function navigate(section: SectionId) {
    if (!canAccessAdminWorkspace(currentMember.role, section)) return;
    if (section === "overview" && activeSection !== "overview") setOverviewLoading(true);
    if (section === "contacts" || section === "forum") {
      setNotificationCounts((current) => ({ ...current, [section]: 0 }));
    }
    setActiveSection(section);
    if (window.location.hash !== `#${section}`) window.history.pushState(null, "", `#${section}`);
    setMenuOpen(false);
    setQuery("");
  }

  return (
    <div className={`admin-shell ${sidebarCollapsed ? "admin-shell--sidebar-collapsed" : ""}`}>
      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-brand">
          <BrandMark />
          <div><strong>INOX</strong><span>ADMINISTRATION</span></div>
          <button className="sidebar-close" type="button" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)}><Icon name="close" /></button>
        </div>

        <div className="workspace-label"><span>Espace</span><strong>INOX Technologies</strong></div>
        <nav id="admin-navigation" className="side-nav" aria-label="Navigation de l’administration">
          <button
            className={`sidebar-toggle ${sidebarCollapsed ? "is-collapsed" : ""}`}
            type="button"
            aria-controls="admin-navigation"
            aria-expanded={!sidebarCollapsed}
            aria-label={sidebarCollapsed ? "Déplier la navigation" : "Replier la navigation"}
            title={sidebarCollapsed ? "Déplier la navigation" : "Replier la navigation"}
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
          >
            <Icon name="arrow" />
            <span className="side-nav__label">{sidebarCollapsed ? "Déplier la navigation" : "Replier la navigation"}</span>
          </button>
          {permittedNavigation.map((item) => {
            const count = item.id === "contacts"
              ? notificationCounts.contacts
              : item.id === "forum"
                ? notificationCounts.forum
                : undefined;
            return (
            <button
              type="button"
              className={activeSection === item.id ? "is-active" : ""}
              aria-current={activeSection === item.id ? "page" : undefined}
              title={sidebarCollapsed ? item.label : undefined}
              onClick={() => navigate(item.id)}
              key={item.id}
            >
              <Icon name={item.icon} />
              <span className="side-nav__label">{item.label}</span>
              {typeof count === "number" && count > 0 ? (
                <span
                  className="nav-badge"
                  aria-label={`${count} ${item.id === "contacts" ? "nouvelles demandes" : "nouveaux sujets"}`}
                >
                  {count}
                </span>
              ) : null}
              </button>
            );
          })}
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
            <span className={`live-sync live-sync--${liveStatus}`} aria-live="polite">
              <i />
              {liveStatus === "live" ? "Mise à jour en direct" : liveStatus === "connecting" ? "Connexion en direct…" : "Reconnexion en cours…"}
            </span>
            {permittedNavigation.some((item) => item.id === "contacts" || item.id === "forum") ? <button className="icon-button" type="button" aria-label="Notifications"><Icon name="bell" /></button> : null}
            {canManageEditorial(currentMember.role) ? <button className="primary-action" type="button" onClick={() => navigate("journal")}><Icon name="spark" size={17} /> Nouvelle publication</button> : null}
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

          {activeSection === "overview"
            ? <Overview onNavigate={navigate} stats={overviewStats} loading={overviewLoading} />
            : <SectionContent section={activeSection} currentMember={currentMember} refreshKey={liveRevision} />}
        </div>
      </main>
    </div>
  );
}
