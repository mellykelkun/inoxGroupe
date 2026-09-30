"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LienCinematique from "./LienCinematique";

const missions = [
  {
    code: "BUILD_01",
    titre: "Créer un service numérique utile",
    description: "Transformer une idée métier en une plateforme simple à utiliser, fiable au quotidien et capable d’évoluer avec la demande.",
    objectif: "Mise en ligne maîtrisée",
    cible: "5 000 utilisateurs",
    priorite: "Expérience + vitesse",
  },
  {
    code: "LINK_04",
    titre: "Connecter les équipes et les sites",
    description: "Donner à chaque collaborateur un accès stable et sécurisé aux applications, à la voix et aux données, où qu’il travaille.",
    objectif: "Continuité multi-sites",
    cible: "4 implantations",
    priorite: "Réseau + disponibilité",
  },
  {
    code: "SHIELD_24",
    titre: "Sécuriser et superviser",
    description: "Détecter les risques plus tôt, protéger les données et préparer la réponse avant qu’un incident ne bloque l’activité.",
    objectif: "Risque sous contrôle",
    cible: "24/7 observabilité",
    priorite: "Cyber + reprise",
  },
];

const etapes = [
  {
    id: "conception",
    numero: "01",
    court: "DISCOVER",
    titre: "Conception",
    accroche: "Vos priorités deviennent un plan d’action clair.",
    description: "Nous alignons les utilisateurs, les parcours, les règles métier et les contraintes afin que chaque décision réponde à un usage et à un résultat attendu.",
    livrable: "Vision produit · parcours · backlog · architecture cible",
    technologies: ["Discovery", "UX flows", "Architecture", "Figma"],
    metriques: [["Parcours", "12"], ["Rôles", "04"], ["Backlog", "READY"]],
  },
  {
    id: "application",
    numero: "02",
    court: "BUILD",
    titre: "Site & application",
    accroche: "Une expérience simple pour l’utilisateur, solide en coulisses.",
    description: "Nous réunissons interfaces, règles métier et connexions aux autres outils pour créer un produit rapide, cohérent et facile à faire évoluer.",
    livrable: "Design system · frontend · backend · API documentée",
    technologies: ["Next.js", "React", "Node.js", "API"],
    metriques: [["Composants", "24"], ["Endpoints", "18"], ["Qualité", "92/100"]],
  },
  {
    id: "data",
    numero: "03",
    court: "STORE",
    titre: "Base de données",
    accroche: "Vos données restent fiables, protégées et disponibles.",
    description: "Organisation, droits d’accès, performance et sauvegardes sont pensés ensemble pour préserver l’information essentielle à vos opérations.",
    livrable: "Schéma · politiques d’accès · sauvegarde · réplication",
    technologies: ["PostgreSQL", "SQL", "Redis", "Backup"],
    metriques: [["Répliques", "03"], ["Requête p95", "18 ms"], ["RPO", "15 min"]],
  },
  {
    id: "reseau",
    numero: "04",
    court: "CONNECT",
    titre: "Réseaux",
    accroche: "Vos équipes accèdent aux bons outils sans friction.",
    description: "Réseaux locaux, Wi-Fi, accès distants et interconnexions sont organisés pour garantir fluidité, priorité des usages et continuité.",
    livrable: "Topologie · segmentation · SD-WAN · qualité de service",
    technologies: ["Cisco", "Fortinet", "SD-WAN", "VPN"],
    metriques: [["Sites", "04"], ["Liens actifs", "02"], ["RTT", "38 ms"]],
  },
  {
    id: "securite",
    numero: "05",
    court: "DEFEND",
    titre: "Cybersécurité",
    accroche: "Chaque accès est contrôlé, chaque signal peut être exploité.",
    description: "La sécurité protège les identités, les équipements et les échanges tout en préparant les équipes à détecter, contenir et reprendre après un incident.",
    livrable: "IAM · politiques · EDR · SIEM · plan de réponse",
    technologies: ["IAM", "EDR", "SIEM", "Zero Trust"],
    metriques: [["MFA", "100%"], ["Signaux", "1 284"], ["Critiques", "00"]],
  },
  {
    id: "cloud",
    numero: "06",
    court: "SCALE",
    titre: "Cloud & infrastructure",
    accroche: "La capacité évolue avec l’activité sans faire exploser la complexité.",
    description: "Nous dimensionnons l’hébergement, le stockage et la résilience pour absorber la croissance tout en gardant la maîtrise des coûts et des données.",
    livrable: "Environnements · conteneurs · PRA · capacité",
    technologies: ["Azure", "AWS", "Docker", "Kubernetes"],
    metriques: [["Pods", "12/12"], ["Charge", "62%"], ["Zones", "03"]],
  },
  {
    id: "deploiement",
    numero: "07",
    court: "SHIP",
    titre: "Déploiement",
    accroche: "Chaque évolution est testée, traçable et réversible.",
    description: "L’automatisation, les validations et le retour arrière réduisent les erreurs et permettent de mettre les améliorations en service avec davantage de confiance.",
    livrable: "CI/CD · IaC · GitOps · stratégie de rollback",
    technologies: ["GitHub Actions", "Terraform", "Argo CD", "GitOps"],
    metriques: [["Pipeline", "3m 42s"], ["Tests", "248 OK"], ["Rollback", "READY"]],
  },
  {
    id: "monitoring",
    numero: "08",
    court: "OBSERVE",
    titre: "Monitoring & opérations",
    accroche: "Les signaux révèlent les problèmes avant qu’ils ne deviennent des blocages.",
    description: "Indicateurs, journaux et alertes donnent une vue claire de la performance technique et de son impact sur les utilisateurs et l’activité.",
    livrable: "Dashboards · alertes · runbooks · amélioration continue",
    technologies: ["Grafana", "Prometheus", "Zabbix", "OpenTelemetry"],
    metriques: [["Disponibilité", "99,98%"], ["Latence p95", "142 ms"], ["Alertes P1", "00"]],
  },
];

const scenes = [
  {
    numero: "01",
    titre: "Atelier produit",
    texte: "Les besoins, les parcours et les priorités sont alignés avant d’engager le développement et le budget.",
    image: "/images/equipe/equipe-inox-collaboration.webp",
    alt: "Équipe africaine collaborant à la conception d’un produit numérique",
  },
  {
    numero: "02",
    titre: "Fabrique logicielle",
    texte: "Le développement, les tests et la documentation avancent ensemble pour livrer plus vite sans sacrifier la qualité.",
    image: "/images/equipe/equipe-inox-pair-programming.webp",
    alt: "Développeurs africains travaillant ensemble sur une application",
  },
  {
    numero: "03",
    titre: "Cœur d’infrastructure",
    texte: "Serveurs, stockage et cloud assurent la disponibilité et la capacité nécessaires aux services essentiels.",
    image: "/images/expertises/datacenter-cloud-4k.webp",
    alt: "Infrastructure physique de datacenter et serveurs",
  },
  {
    numero: "04",
    titre: "Bouclier opérationnel",
    texte: "Le réseau maintient les échanges pendant que la sécurité contrôle les accès, détecte les anomalies et prépare la réponse.",
    image: "/images/expertises/reseaux-cybersecurite-4k.webp",
    alt: "Équipements réseau et cybersécurité dans un environnement technique",
  },
];

const positionsNoeuds = [
  ["Conception", "50%", "3%"],
  ["Application", "83%", "18%"],
  ["Data", "94%", "49%"],
  ["Réseau", "82%", "80%"],
  ["Sécurité", "50%", "94%"],
  ["Cloud", "17%", "80%"],
  ["Déploiement", "6%", "49%"],
  ["Monitoring", "17%", "18%"],
];

export default function ImmersionCore() {
  const racine = useRef(null);
  const [missionActive, setMissionActive] = useState(0);
  const [etapeActive, setEtapeActive] = useState(0);
  const [telemetrie, setTelemetrie] = useState({ trafic: 842, latence: 138, menaces: 1284, cpu: 62 });

  useEffect(() => {
    let iteration = 0;
    const minuterie = window.setInterval(() => {
      iteration += 1;
      setTelemetrie({
        trafic: 842 + ((iteration * 37) % 119),
        latence: 126 + ((iteration * 11) % 29),
        menaces: 1284 + iteration * 3,
        cpu: 57 + ((iteration * 7) % 18),
      });
    }, 1800);
    return () => window.clearInterval(minuterie);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-core-step]"));
    const observateur = new IntersectionObserver(
      (entrees) => {
        const visible = entrees.filter((entree) => entree.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setEtapeActive(Number(visible.target.dataset.coreStep));
      },
      { rootMargin: "-26% 0px -42% 0px", threshold: [0.15, 0.35, 0.6] },
    );
    elements.forEach((element) => observateur.observe(element));
    return () => observateur.disconnect();
  }, []);

  useEffect(() => {
    let animation = null;
    function suivrePage() {
      if (animation) return;
      animation = window.requestAnimationFrame(() => {
        const hauteur = document.documentElement.scrollHeight - window.innerHeight;
        const progression = hauteur > 0 ? Math.min(100, (window.scrollY / hauteur) * 100) : 0;
        racine.current?.style.setProperty("--ic-progression", `${progression}%`);
        animation = null;
      });
    }
    suivrePage();
    window.addEventListener("scroll", suivrePage, { passive: true });
    return () => {
      window.removeEventListener("scroll", suivrePage);
      if (animation) window.cancelAnimationFrame(animation);
    };
  }, []);

  function deplacerLumiere(event) {
    const cadre = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--ic-x", `${((event.clientX - cadre.left) / cadre.width) * 100}%`);
    event.currentTarget.style.setProperty("--ic-y", `${((event.clientY - cadre.top) / cadre.height) * 100}%`);
  }

  function atteindreEtape(index) {
    document.querySelector(`[data-core-step="${index}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const etape = etapes[etapeActive];
  const mission = missions[missionActive];

  return (
    <main className="immersionCore" id="immersion-core" ref={racine}>
      <div className="icProgression" aria-hidden="true"><span /></div>

      <section className="icHero" onPointerMove={deplacerLumiere}>
        <Image
          className="icHero__image"
          src="/images/immersion/immersion-core-noc.webp"
          alt="Équipe africaine supervisant une infrastructure numérique dans un centre d’opérations"
          fill
          sizes="100vw"
          preload
        />
        <div className="icHero__voile" aria-hidden="true" />
        <div className="icHero__grille" aria-hidden="true" />
        <div className="icHero__scan" aria-hidden="true" />

        <div className="conteneur icHero__contenu">
          <div className="icHero__signal">SYSTEM ONLINE · ABIDJAN / 5.3600° N</div>
          <h1><span>IMMERSION</span><em>CORE</em></h1>
          <p className="icHero__promesse">Transformez un besoin en solution opérationnelle, puis maintenez-la <strong>rapide, disponible et protégée.</strong></p>
          <div className="icHero__actions">
            <a className="icBouton icBouton--primaire" href="#choisir-mission">Initialiser l’expérience <span aria-hidden="true">↓</span></a>
            <LienCinematique className="icBouton icBouton--fantome" href="/#contact" direction="retour">Parler de votre projet <span aria-hidden="true">↗</span></LienCinematique>
          </div>
          <div className="icHero__reperes" aria-label="Étendue de l’expérience">
            <div><strong>08</strong><span>couches connectées</span></div>
            <div><strong>360°</strong><span>du besoin aux opérations</span></div>
            <div><strong>LIVE</strong><span>signaux simulés</span></div>
          </div>
        </div>

        <div className="icHeroConsole" aria-hidden="true">
          <div className="icHeroConsole__bar"><span>CORE / BOOT_SEQUENCE</span><i>LIVE</i></div>
          <p><b>01</b> architecture.graph <span>loaded</span></p>
          <p><b>02</b> security.policy <span>enforced</span></p>
          <p><b>03</b> telemetry.stream <span>connected</span></p>
          <div className="icHeroConsole__onde"><i /><i /><i /><i /><i /><i /><i /><i /></div>
        </div>
        <a className="icHero__defile" href="#choisir-mission"><span>Commencer</span><i /></a>
      </section>

      <section className="icMission" id="choisir-mission">
        <div className="conteneur">
          <header className="icEnteteSection">
            <div><span className="icSurTitre">01 / Partir du besoin</span><h2>Votre objectif guide<br />tout le <em>Core.</em></h2></div>
            <p>Chaque scénario relie les décisions techniques au résultat recherché par l’entreprise.</p>
          </header>

          <div className="icMission__grille">
            <div className="icMission__choix" role="group" aria-label="Choisir un scénario de transformation">
              {missions.map((item, index) => (
                <button className={index === missionActive ? "est-actif" : ""} type="button" key={item.code} aria-pressed={index === missionActive} onClick={() => setMissionActive(index)}>
                  <span>{item.code}</span><strong>{item.titre}</strong><i aria-hidden="true">↗</i>
                </button>
              ))}
            </div>
            <div className="icMission__brief" aria-live="polite">
              <div className="icMission__statut">MISSION CHARGÉE</div>
              <span className="icMission__code">{mission.code}</span>
              <h3>{mission.titre}</h3>
              <p>{mission.description}</p>
              <div className="icMission__donnees">
                <div><span>Objectif</span><strong>{mission.objectif}</strong></div>
                <div><span>Cible</span><strong>{mission.cible}</strong></div>
                <div><span>Priorité</span><strong>{mission.priorite}</strong></div>
              </div>
              <a href="#parcours-core">Voir la solution prendre forme <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </div>
      </section>

      <section className="icParcours" id="parcours-core">
        <div className="conteneur icParcours__intro">
          <span className="icSurTitre">02 / Relier toutes les expertises</span>
          <h2>Huit disciplines.<br /><em>Un seul résultat.</em></h2>
          <p>Du cadrage au suivi quotidien, chaque étape renforce la suivante pour éviter les failles et les solutions isolées.</p>
        </div>

        <div className="conteneur icParcours__grille">
          <nav className="icRail" aria-label="Étapes de l’architecture Immersion Core">
            <span className="icRail__titre">SYSTEM PATH</span>
            {etapes.map((item, index) => (
              <button type="button" className={index === etapeActive ? "est-actif" : index < etapeActive ? "est-passe" : ""} onClick={() => atteindreEtape(index)} key={item.id}>
                <i>{item.numero}</i><span>{item.titre}</span>
              </button>
            ))}
          </nav>

          <div className="icEtapes">
            {etapes.map((item, index) => (
              <article className={index === etapeActive ? "icEtape est-active" : "icEtape"} data-core-step={index} id={`core-${item.id}`} key={item.id}>
                <div className="icEtape__ligne"><span>{item.numero}</span><i>{item.court}</i></div>
                <h3>{item.titre}</h3>
                <strong>{item.accroche}</strong>
                <p>{item.description}</p>
                <div className="icEtape__livrable"><span>OUTPUT</span>{item.livrable}</div>
                <div className="icEtape__technologies">{item.technologies.map((technologie) => <span key={technologie}>{technologie}</span>)}</div>
                <div className="icEtape__metriques">
                  {item.metriques.map(([label, valeur]) => <div key={label}><span>{label}</span><strong>{valeur}</strong></div>)}
                </div>
              </article>
            ))}
          </div>

          <aside className="icCarte" aria-live="polite">
            <div className="icCarte__barre"><span>ARCHITECTURE / LIVE</span><i>{etape.numero}</i></div>
            <div className="icCarte__orbite" aria-hidden="true">
              <svg viewBox="0 0 500 500" role="presentation">
                <circle cx="250" cy="250" r="176" />
                <circle cx="250" cy="250" r="112" />
                {[[250,42],[415,122],[458,250],[410,405],[250,458],[90,405],[42,250],[90,122]].map(([x,y], index) => <line className={index <= etapeActive ? "est-active" : ""} x1="250" y1="250" x2={x} y2={y} key={`${x}-${y}`} />)}
              </svg>
              <div className="icCarte__coeur"><span>INOX</span><strong>CORE</strong><i>{etape.court}</i></div>
              {positionsNoeuds.map(([nom, gauche, haut], index) => (
                <span className={`icCarte__noeud ${index === etapeActive ? "est-actif" : ""} ${index < etapeActive ? "est-passe" : ""}`} style={{ left: gauche, top: haut }} key={nom}>{index + 1}</span>
              ))}
            </div>
            <div className="icCarte__lecture">
              <span>Couche active</span><strong>{etape.titre}</strong><small>{positionsNoeuds[etapeActive][0]} → CORE_SYNC</small>
            </div>
          </aside>
        </div>
      </section>

      <section className="icObservatoire">
        <div className="conteneur">
          <header className="icEnteteSection icEnteteSection--clair">
            <div><span className="icSurTitre">03 / Garder la maîtrise</span><h2>Les indicateurs révèlent<br />ce qui mérite votre <em>attention.</em></h2></div>
          </header>

          <div className="icObservatoire__grille">
            <div className="icMetrique icMetrique--principale">
              <div className="icMetrique__barre"><span>TRAFIC / 15 MIN</span><i><b /> LIVE</i></div>
              <strong>{telemetrie.trafic.toLocaleString("fr-FR")}</strong><small>requêtes / seconde</small>
              <svg viewBox="0 0 720 220" preserveAspectRatio="none" aria-hidden="true">
                <defs><linearGradient id="surfaceCore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2d8dff" stopOpacity=".42"/><stop offset="1" stopColor="#2d8dff" stopOpacity="0"/></linearGradient></defs>
                <path className="icCourbe__surface" d="M0 180 C55 155 70 174 118 138 S188 72 235 118 S318 173 367 104 S435 38 485 92 S550 162 606 95 S672 55 720 28 L720 220 L0 220 Z" />
                <path className="icCourbe__ligne" d="M0 180 C55 155 70 174 118 138 S188 72 235 118 S318 173 367 104 S435 38 485 92 S550 162 606 95 S672 55 720 28" />
              </svg>
              <div className="icMetrique__axe"><span>-15 min</span><span>-10 min</span><span>-5 min</span><span>maintenant</span></div>
            </div>

            <div className="icMetrique"><div className="icMetrique__barre"><span>LATENCE API</span><i>p95</i></div><strong>{telemetrie.latence}</strong><small>millisecondes</small><div className="icJauge"><span style={{ width: `${Math.min(92, telemetrie.latence / 2)}%` }} /></div><p>Objectif de service <b>&lt; 180 ms</b></p></div>
            <div className="icMetrique"><div className="icMetrique__barre"><span>SÉCURITÉ</span><i>24 H</i></div><strong>{telemetrie.menaces.toLocaleString("fr-FR")}</strong><small>signaux analysés</small><div className="icSegments"><i/><i/><i/><i/><i/><i/></div><p>Incidents critiques <b>00</b></p></div>
            <div className="icMetrique"><div className="icMetrique__barre"><span>CAPACITÉ</span><i>AUTO</i></div><strong>{telemetrie.cpu}%</strong><small>charge agrégée</small><div className="icJauge icJauge--orange"><span style={{ width: `${telemetrie.cpu}%` }} /></div><p>Instances disponibles <b>12 / 12</b></p></div>

            <div className="icJournal">
              <div className="icMetrique__barre"><span>EVENT STREAM</span><i>UTC +00</i></div>
              <ul>
                <li><time>16:42:18</time><span className="est-ok">PASS</span><p>deployment/api-gateway #248</p></li>
                <li><time>16:42:07</time><span className="est-info">SYNC</span><p>database/replica-03 healthy</p></li>
                <li><time>16:41:51</time><span className="est-ok">BLOCK</span><p>security/policy anomalous-request</p></li>
                <li><time>16:41:32</time><span className="est-info">SCALE</span><p>cloud/workload +2 instances</p></li>
                <li><time>16:41:08</time><span className="est-ok">PASS</span><p>synthetic/checkout-abidjan 142ms</p></li>
              </ul>
            </div>
          </div>
          <p className="icObservatoire__note">Données simulées à des fins de démonstration. Les indicateurs réels sont définis selon vos services, vos risques et vos objectifs métier.</p>
        </div>
      </section>

      <section className="icTerrain">
        <div className="conteneur icTerrain__intro"><span className="icSurTitre">04 / Une expertise qui reste humaine</span><h2>Des spécialistes.<br />Des outils. <em>Une responsabilité commune.</em></h2><p>Une solution produit de la valeur lorsque les métiers se comprennent, que les responsabilités sont claires et que les équipes partagent le même objectif.</p></div>
        <div className="conteneur icScenes">
          {scenes.map((scene) => (
            <article className="icScene" key={scene.numero}>
              <Image src={scene.image} alt={scene.alt} fill sizes="(max-width: 850px) 100vw, 50vw" />
              <div className="icScene__voile" />
              <span>{scene.numero}</span><div><small>CORE / FIELD_NOTE</small><h3>{scene.titre}</h3><p>{scene.texte}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="icImpact">
        <div className="conteneur">
          <span className="icSurTitre">05 / Transformer la technique en valeur</span>
          <h2>Ce que votre entreprise doit gagner.<br /><em>Pas plus de complexité. Plus de maîtrise.</em></h2>
          <div className="icImpact__grille">
            <div><span>01</span><strong>Livrer avec confiance</strong><p>Mettre les améliorations en service plus vite, avec moins d’erreurs et de surprises.</p></div>
            <div><span>02</span><strong>Décider avec des données</strong><p>Comprendre la performance réelle et agir avant que l’utilisateur ne soit pénalisé.</p></div>
            <div><span>03</span><strong>Résister aux incidents</strong><p>Protéger, sauvegarder et préparer la reprise pour limiter l’arrêt de l’activité.</p></div>
            <div><span>04</span><strong>Évoluer sans tout recommencer</strong><p>Ajouter de nouveaux usages sur une base conçue pour grandir avec l’entreprise.</p></div>
          </div>
        </div>
      </section>

      <section className="icFinal">
        <div className="icFinal__halo" aria-hidden="true" />
        <div className="conteneur icFinal__contenu">
          <span className="icFinal__statut">IMMERSION COMPLETE</span>
          <h2>Votre informatique peut devenir<br />un véritable avantage opérationnel.</h2>
          <p>Partons de vos difficultés réelles pour construire une solution qui relie vos équipes, protège vos données et soutient durablement vos ambitions.</p>
          <div className="icFinal__actions">
            <LienCinematique className="icBouton icBouton--primaire" href="/#contact" direction="retour">Concevoir ma solution <span aria-hidden="true">↗</span></LienCinematique>
            <a className="icFinal__telephone" href="tel:+2250708201515"><span>Échange direct</span><strong>+225 07 08 20 15 15</strong></a>
          </div>
        </div>
        <div className="icFinal__mot" aria-hidden="true">CORE</div>
      </section>
    </main>
  );
}
