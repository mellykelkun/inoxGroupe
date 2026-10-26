import Image from "next/image";
import Link from "next/link";
import { EditorialFeed } from "@/components/editorial-feed";
import { Navigation } from "@/components/navigation";
import { getPublishedPosts } from "@/lib/editorial";
import { getPublicSupabaseConfig } from "@/lib/supabase-public";

const expertises = [
  {
    index: "01",
    title: "Datacenter, Cloud & Productivité",
    text: "Un socle disponible et évolutif pour porter vos applications et vos opérations critiques.",
    image: "/images/datacenter.webp",
    href: "/expertises/datacenter-cloud",
  },
  {
    index: "02",
    title: "Réseaux & Sécurité",
    text: "Des accès maîtrisés, des réseaux résilients et une protection adaptée à vos usages.",
    image: "/images/security.webp",
    href: "/expertises/reseaux-securite",
  },
  {
    index: "03",
    title: "Digitalisation & Logiciels",
    text: "Des outils connectés à vos processus pour simplifier le travail quotidien.",
    image: "/images/digital.webp",
    href: "/expertises/digitalisation-logiciels",
  },
  {
    index: "04",
    title: "Formation, Infogérance & Support",
    text: "Des équipes accompagnées et un système d’information suivi dans la durée.",
    image: "/images/team.webp",
    href: "/expertises/formation-infogerance",
  },
];

const solutions = [
  ["01", "Cadrer", "Clarifier vos priorités, vos contraintes et les risques qui doivent être maîtrisés."],
  ["02", "Construire", "Déployer une architecture compréhensible, sécurisée et adaptée à vos usages."],
  ["03", "Faire vivre", "Superviser, former et améliorer l’environnement au rythme de votre organisation."],
];

export default async function Home() {
  const posts = await getPublishedPosts().catch(() => []);
  const realtimeConfig = getPublicSupabaseConfig();

  return (
    <main className="network-home">
      <Navigation />

      <section className="network-hero" id="accueil">
        <div className="network-hero__media" aria-hidden="true">
          <Image src="/images/datacenter.webp" alt="" fill priority sizes="100vw" />
          <div />
        </div>
        <div className="network-hero__content page-shell">
          <p className="network-kicker network-kicker--light">Le réseau d’expertises INOX</p>
          <h1>Des idées utiles.<br /><span>Des systèmes plus solides.</span></h1>
          <p className="network-hero__lead">INOX partage ses pratiques, ses retours d’expérience et ses expertises pour aider les organisations à faire évoluer leur environnement numérique.</p>
          <div className="network-hero__actions">
            <a className="network-button network-button--accent" href="#journal">Suivre le fil INOX <span>↓</span></a>
            <a className="network-button network-button--quiet" href="#expertises">Explorer les expertises <span>↗</span></a>
          </div>
        </div>
        <div className="network-hero__rail" aria-hidden="true"><span>INOX / EXPERTISES</span><i /></div>
      </section>

      <EditorialFeed initialPosts={posts} realtimeConfig={realtimeConfig} />

      <section className="network-expertises" id="expertises">
        <div className="page-shell">
          <div className="network-section-heading">
            <div><p className="network-kicker">Les expertises derrière le fil</p><h2>Une lecture concrète des enjeux numériques.</h2></div>
            <p>Chaque publication s’appuie sur une réalité opérationnelle : infrastructure, sécurité, logiciel ou accompagnement.</p>
          </div>
          <div className="network-expertise-grid">
            {expertises.map((expertise) => (
              <Link className="network-expertise-card" href={expertise.href} key={expertise.index}>
                <div className="network-expertise-card__image"><Image src={expertise.image} alt="" fill sizes="(max-width: 760px) 100vw, 25vw" /></div>
                <div className="network-expertise-card__body"><span>{expertise.index}</span><h3>{expertise.title}</h3><p>{expertise.text}</p><b>Voir l’expertise ↗</b></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="network-solutions" id="solutions">
        <div className="page-shell">
          <div className="network-section-heading network-section-heading--light">
            <div><p className="network-kicker network-kicker--light">Notre manière de travailler</p><h2>Du signal faible à la décision opérationnelle.</h2></div>
            <p>Un même fil conducteur : rendre la technologie utile, lisible et durable pour les équipes.</p>
          </div>
          <div className="network-solution-grid">
            {solutions.map(([index, title, text]) => <article key={index}><span>{index}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="network-sister-site" aria-labelledby="inox-technologies-title">
        <div className="page-shell network-sister-site__inner">
          <div><p className="network-kicker">INOX Technologies</p><h2 id="inox-technologies-title">Un projet à concrétiser&nbsp;?</h2><p>Retrouvez nos solutions, notre approche et le formulaire de contact sur le site principal INOX.</p></div>
          <a className="network-button network-button--accent" href="https://inox-groupe.vercel.app/">Découvrir INOX Technologies <span>↗</span></a>
        </div>
      </section>

      <footer className="network-footer" id="contact">
        <div className="page-shell network-footer__main">
          <div><p className="network-kicker">Construisons la suite</p><h2>Une question, un projet ou un sujet à approfondir&nbsp;?</h2></div>
          <a className="network-button network-button--dark" href="https://inox-groupe.vercel.app/#contact">Parler à un expert <span>↗</span></a>
        </div>
        <div className="page-shell network-footer__bottom"><Image src="/images/inox-logo.png" alt="INOX Technologies" width={72} height={72} /><span>Abidjan, Côte d’Ivoire</span><a href="mailto:contact@inox-group.net">contact@inox-group.net</a><small>© 2026 INOX Technologies</small></div>
      </footer>
    </main>
  );
}
