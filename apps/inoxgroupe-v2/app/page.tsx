import Image from "next/image";
import Link from "next/link";
import { MotionLayer } from "@/components/motion-layer";
import { Navigation } from "@/components/navigation";

const expertises = [
  {
    index: "01",
    title: "Datacenter, Cloud & Productivité",
    text: "Des infrastructures performantes, sécurisées et dimensionnées pour vos enjeux actuels comme pour votre croissance.",
    tags: ["Datacenter", "Cloud hybride", "Supervision"],
    image: "/images/datacenter.webp",
    href: "/expertises/datacenter-cloud",
  },
  {
    index: "02",
    title: "Réseaux & Sécurité",
    text: "Des réseaux résilients et une sécurité multicouche pour protéger vos données, vos accès et la continuité de vos services.",
    tags: ["Cybersécurité", "Réseaux", "Continuité"],
    image: "/images/security.webp",
    href: "/expertises/reseaux-securite",
  },
  {
    index: "03",
    title: "Digitalisation & Logiciels",
    text: "Des applications web, desktop et mobiles conçues pour simplifier vos processus et connecter vos systèmes existants.",
    tags: ["Sur mesure", "Intégration", "Interopérabilité"],
    image: "/images/digital.webp",
    href: "/expertises/digitalisation-logiciels",
  },
  {
    index: "04",
    title: "Formation, Infogérance & Support",
    text: "Nos experts renforcent vos équipes, maintiennent votre SI et prennent en charge les opérations qui vous éloignent de votre cœur de métier.",
    tags: ["Formation", "Support", "Infogérance"],
    image: "/images/team.webp",
    href: "/expertises/formation-infogerance",
  },
];

const plans = [
  {
    name: "Foundation",
    intro: "Les fondamentaux pour garder un système fiable au quotidien.",
    features: ["Gestion des licences et actifs", "Gestion des systèmes", "Support technique niveau 2", "Protection antivirus", "Mises à jour et patching"],
  },
  {
    name: "Advanced",
    intro: "Une supervision proactive et une protection renforcée.",
    features: ["Services cloud", "Maintenance préventive et curative", "Protection EDR / XDR", "Sécurité réseau", "Audit annuel de vulnérabilité"],
  },
  {
    name: "Premium",
    intro: "Un pilotage complet pour les environnements les plus critiques.",
    features: ["Accompagnement stratégique", "Supervision et alerting", "Gestion des identités privilégiées", "Sauvegarde et restauration", "Continuité et reprise d’activité"],
  },
];

const clientLogos = [
  ["/logos/clients/carte-brune.webp", "Carte Brune"],
  ["/logos/clients/sanlam-allianz.webp", "Sanlam Allianz"],
  ["/logos/clients/bsic.webp", "BSIC"],
  ["/logos/clients/asaci.webp", "ASACI"],
  ["/logos/clients/corlay.webp", "Corlay"],
  ["/logos/clients/asac.webp", "ASAC"],
  ["/logos/clients/sma.webp", "SMA BTP"],
  ["/logos/clients/pool-tpv.webp", "Pool TPV"],
  ["/logos/clients/schiba.webp", "Schiba Holding"],
  ["/logos/clients/silo.webp", "SILO"],
  ["/logos/clients/spci.webp", "SPCI"],
];

const partnerLogos = [
  ["/logos/partners/microsoft.webp", "Microsoft"],
  ["/logos/partners/veeam.webp", "Veeam"],
  ["/logos/partners/cisco.webp", "Cisco"],
  ["/logos/partners/wallix.webp", "Wallix"],
  ["/logos/partners/vmware.webp", "VMware"],
  ["/logos/partners/hpe.webp", "HPE"],
  ["/logos/partners/oracle.webp", "Oracle"],
  ["/logos/partners/nutanix.webp", "Nutanix"],
  ["/logos/partners/kaspersky.webp", "Kaspersky"],
  ["/logos/partners/lenovo.webp", "Lenovo"],
  ["/logos/partners/paloalto.webp", "Palo Alto Networks"],
  ["/logos/partners/aws.webp", "AWS"],
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4 10 4 4 8-8" />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <MotionLayer />
      <Navigation />

      <section className="hero" id="accueil">
        <div className="hero-media" aria-hidden="true">
          <Image src="/images/datacenter.webp" alt="" fill priority sizes="100vw" />
          <div className="hero-shade" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content page-shell">
          <p className="eyebrow hero-eyebrow" data-reveal="up">Intégrateur de solutions informatiques</p>
          <h1 className="hero-title" data-reveal="clip">
            L’infrastructure<br />
            <span>qui fait avancer</span><br />
            vos ambitions.
          </h1>
          <div className="hero-bottom" data-reveal="up">
            <p>
              Nous concevons, sécurisons et faisons évoluer les systèmes d’information des organisations qui veulent aller plus loin.
            </p>
            <a className="round-link" href="#expertises" aria-label="Découvrir nos expertises">
              <ArrowIcon />
            </a>
          </div>
        </div>

        <div className="hero-index" aria-hidden="true">
          <span>01</span><i /><span>05</span>
        </div>
      </section>

      <section className="manifesto section-pad" id="groupe">
        <div className="page-shell manifesto-grid">
          <div data-reveal="up">
            <p className="section-kicker">INOX Technologies</p>
            <p className="since">Depuis 2021<br />à Abidjan</p>
          </div>
          <div className="manifesto-copy">
            <h2 data-reveal="lines">La technologie prend toute sa valeur quand elle simplifie les opérations et renforce la performance.</h2>
            <div className="manifesto-notes" data-reveal="up">
              <p>Nous réunissons conseil, intégration et support au sein d’une même équipe.</p>
              <a className="text-link" href="#contact">Présenter votre projet <ArrowIcon /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="expertises section-pad" id="expertises">
        <div className="page-shell section-heading">
          <div>
            <p className="section-kicker">Nos pôles de compétences</p>
            <h2 data-reveal="lines">Un environnement numérique cohérent,<br />du socle aux usages.</h2>
          </div>
          <p data-reveal="up">Nos quatre pôles réunissent infrastructure, sécurité, logiciels et accompagnement pour réduire les ruptures entre vos outils, vos équipes et vos priorités.</p>
        </div>

        <div className="expertise-list page-shell">
          {expertises.map((item) => (
            <Link className="expertise-item" href={item.href} key={item.index} data-reveal="up" aria-label={`Découvrir le pôle ${item.title}`}>
              <div className="expertise-number">{item.index}</div>
              <div className="expertise-visual">
                <Image src={item.image} alt="" fill sizes="(max-width: 900px) 100vw, 34vw" />
              </div>
              <div className="expertise-copy">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <div className="tag-row">
                  {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
              <span className="expertise-arrow" aria-hidden="true"><ArrowIcon /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="signal-section" aria-label="Notre méthode">
        <div className="signal-glow" />
        <div className="page-shell signal-content">
          <p className="section-kicker light" data-reveal="up">Notre engagement</p>
          <h2 data-reveal="clip">Anticiper.<br />Protéger.<br /><span>Faire évoluer.</span></h2>
          <p className="signal-copy" data-reveal="up">Un pilotage attentif, des choix technologiques solides et une équipe disponible quand votre activité l’exige.</p>
        </div>
      </section>

      <section className="services section-pad" id="services">
        <div className="page-shell section-heading services-heading">
          <div>
            <p className="section-kicker">Services managés</p>
            <h2 data-reveal="lines">Un accompagnement ajusté<br />à vos priorités.</h2>
          </div>
          <p data-reveal="up">Trois cadres d’intervention, à ajuster selon votre infrastructure, votre maturité et vos contraintes.</p>
        </div>

        <div className="plan-grid page-shell">
          {plans.map((plan, index) => (
            <article className={`plan ${index === 1 ? "plan-featured" : ""}`} key={plan.name} data-reveal="up">
              <div className="plan-top">
                <span>0{index + 1}</span>
                {index === 1 ? <em>Couverture renforcée</em> : null}
              </div>
              <h3>{plan.name}</h3>
              <p className="plan-intro">{plan.intro}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}><CheckIcon />{feature}</li>
                ))}
              </ul>
              <a href="#contact" className="plan-link">Étudier cette formule <ArrowIcon /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="team section-pad" id="equipe">
        <div className="page-shell team-grid">
          <div className="team-image" data-reveal="image">
            <Image src="/images/team.webp" alt="Illustration d’experts travaillant dans un centre de supervision" fill sizes="(max-width: 900px) 100vw, 56vw" />
            <div className="team-image-label"><span>Une équipe locale</span><strong>Des expertises complémentaires</strong></div>
          </div>
          <div className="team-copy">
            <p className="section-kicker" data-reveal="up">Notre équipe</p>
            <h2 data-reveal="lines">Des spécialistes qui parlent votre langage métier.</h2>
            <p className="team-lead" data-reveal="up">Vous bénéficiez d’interlocuteurs capables d’aligner architecture, sécurité et transformation sur les réalités de votre organisation.</p>
            <div className="role-list">
              <div data-reveal="up"><span>01</span><p>Ingénieurs cybersécurité</p></div>
              <div data-reveal="up"><span>02</span><p>Architectes système & cloud</p></div>
              <div data-reveal="up"><span>03</span><p>Experts gouvernance IT & transformation digitale</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="references section-pad" id="references">
        <div className="page-shell references-title">
          <p className="section-kicker">Références clients</p>
          <h2 data-reveal="lines">Des organisations nous confient<br />leurs enjeux numériques.</h2>
          <p className="references-lead" data-reveal="up">Ces collaborations illustrent notre capacité à accompagner des environnements, des usages et des niveaux d’exigence variés.</p>
        </div>
        <div className="logo-wall page-shell" data-reveal="up">
          {clientLogos.map(([src, alt]) => (
            <div className="logo-cell" key={src}><Image src={src} alt={alt} width={190} height={90} /></div>
          ))}
        </div>
      </section>

      <section className="partners" id="partenaires">
        <div className="page-shell partners-heading">
          <p>Des alliances technologiques au service de votre performance.</p>
          <span>Nous mobilisons des technologies reconnues pour construire des solutions fiables, compatibles avec votre environnement et prêtes à évoluer.</span>
        </div>
        <div className="marquee" aria-label="Partenaires technologiques">
          <div className="marquee-track">
            {[...partnerLogos, ...partnerLogos].map(([src, alt], index) => (
              <div className="partner-logo" key={`${src}-${index}`} aria-hidden={index >= partnerLogos.length}>
                <Image src={src} alt={index < partnerLogos.length ? alt : ""} width={170} height={70} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="footer-orbit" aria-hidden="true" />
        <div className="page-shell footer-main">
          <p className="section-kicker light" data-reveal="up">Votre prochain projet</p>
          <h2 data-reveal="clip">Transformons vos priorités<br />en solution opérationnelle.</h2>
          <a className="footer-cta" href="mailto:contact@inox-group.net" data-reveal="up">
            Présenter votre projet <ArrowIcon />
          </a>
        </div>
        <div className="page-shell footer-bottom">
          <Image src="/images/inox-logo.png" alt="INOX Technologies" width={115} height={115} />
          <div>
            <span>Adresse</span>
            <p>Cocody, Angré 9e Tranche · Route CNPS<br />Abidjan, Côte d’Ivoire</p>
          </div>
          <div className="footer-contact-list">
            <span>E-mails</span>
            <a href="mailto:contact@inox-group.net">contact@inox-group.net</a>
            <a href="mailto:fidelebo@inox-group.net">fidelebo@inox-group.net</a>
          </div>
          <div className="footer-contact-list">
            <span>Téléphones</span>
            <a href="tel:+2250708201515">+225 07 08 20 15 15</a>
            <a href="tel:+2250707950441">+225 07 07 95 04 41</a>
          </div>
          <div>
            <span>Site web</span>
            <a href="https://inox-groupe.vercel.app/">inox-groupe.vercel.app</a>
          </div>
          <p className="copyright">© 2026 INOX Technologies</p>
        </div>
      </footer>
    </main>
  );
}
