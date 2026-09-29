import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpertiseMotion } from "@/components/expertise-motion";
import { Navigation } from "@/components/navigation";
import { expertisePages, getExpertise } from "@/lib/expertise-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return expertisePages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const expertise = getExpertise(slug);

  if (!expertise) return {};

  return {
    title: `${expertise.title} | INOX Technologies`,
    description: expertise.summary,
  };
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export default async function ExpertisePage({ params }: Props) {
  const { slug } = await params;
  const expertise = getExpertise(slug);
  if (!expertise) notFound();

  const nextExpertise = getExpertise(expertise.nextSlug);
  if (!nextExpertise) notFound();

  return (
    <main className={`expertise-page expertise-theme--${expertise.theme}`} data-expertise-page={expertise.theme}>
      <ExpertiseMotion theme={expertise.theme} />
      <Navigation internal />

      <section className="xp-hero" id="accueil">
        <div className="xp-hero-media" aria-hidden="true">
          <Image src={expertise.image} alt="" fill priority sizes="100vw" />
          <div className="xp-hero-shade" />
        </div>
        <div className="xp-hero-art" aria-hidden="true"><i /><i /><i /></div>

        <div className="page-shell xp-hero-inner">
          <div className="xp-hero-top" data-x-reveal="fade">
            <Link href="/#expertises" className="xp-back"><span>←</span> Explorer tous les pôles</Link>
            <p>Pôle {expertise.index} / 04</p>
          </div>
          <div className="xp-hero-heading">
            <p className="eyebrow" data-x-reveal="rise">{expertise.title}</p>
            <h1 data-x-reveal="title">
              {expertise.heroLines[0]}<br />
              <span>{expertise.heroLines[1]}</span>
            </h1>
          </div>
          <div className="xp-hero-bottom" data-x-reveal="rise">
            <p>{expertise.lead}</p>
            <a href="#contenu" className="xp-scroll-link"><span>Découvrir les solutions</span><i /></a>
          </div>
        </div>
      </section>

      <section className="xp-intro xp-section" id="contenu">
        <div className="page-shell xp-intro-grid">
          <div data-x-reveal="rise">
            <p className="section-kicker">Approche INOX</p>
            <div className="xp-tags">{expertise.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </div>
          <div>
            <h2 data-x-reveal="title">{expertise.overviewTitle}</h2>
            <p className="xp-intro-copy" data-x-reveal="rise">{expertise.overviewBody}</p>
          </div>
        </div>
      </section>

      <section className="xp-services xp-section">
        <div className="page-shell">
          <header className="xp-section-heading" data-x-reveal="rise">
            <p className="section-kicker">Expertises mobilisées</p>
            <h2>Des expertises coordonnées,<br />du diagnostic au pilotage.</h2>
          </header>
          <div className="xp-service-list">
            {expertise.services.map((service) => (
              <article className="xp-service" key={service.index} data-x-reveal="rise">
                <span className="xp-service-index">{service.index}</span>
                <div className="xp-service-main">
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
                <ul>
                  {service.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <p className="xp-service-result">
                  <span>Bénéfice pour vos opérations</span>
                  {service.result}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="xp-focus xp-section" id="mise-en-avant">
        <div className="page-shell xp-focus-grid">
          <figure className="xp-focus-media" data-x-reveal="image">
            <Image
              src={expertise.illustration}
              alt={expertise.illustrationAlt}
              fill
              sizes="(max-width: 820px) 100vw, 54vw"
            />
            <figcaption>Au plus près de vos opérations · INOX {expertise.index}</figcaption>
          </figure>
          <div className="xp-focus-content">
            <p className="section-kicker light" data-x-reveal="rise">Priorités opérationnelles</p>
            <h2 data-x-reveal="title">{expertise.focus.title}</h2>
            <p className="xp-focus-lead" data-x-reveal="rise">{expertise.focus.body}</p>
            <div className="xp-focus-points">
              {expertise.focus.points.map((point, index) => (
                <article key={point.title} data-x-reveal="rise">
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{point.title}</h3>
                    <p>{point.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="xp-statement">
        <div className="xp-statement-art" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="page-shell xp-statement-inner">
          <span data-x-reveal="fade">INOX / {expertise.index}</span>
          <blockquote data-x-reveal="title">{expertise.statement}</blockquote>
        </div>
      </section>

      <section className="xp-outcomes xp-section">
        <div className="page-shell">
          <header className="xp-section-heading xp-section-heading--split">
            <div>
              <p className="section-kicker" data-x-reveal="rise">Bénéfices opérationnels</p>
              <h2 data-x-reveal="title">Des choix techniques<br />qui renforcent votre activité.</h2>
            </div>
            <p data-x-reveal="rise">Chaque choix technique doit produire un bénéfice compréhensible pour les équipes et pour l’activité.</p>
          </header>
          <div className="xp-outcome-grid">
            {expertise.outcomes.map((outcome, index) => (
              <article key={outcome.title} data-x-reveal="rise">
                <span>0{index + 1}</span>
                <h3>{outcome.title}</h3>
                <p>{outcome.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="xp-process xp-section">
        <div className="page-shell">
          <header className="xp-section-heading" data-x-reveal="rise">
            <p className="section-kicker light">Notre méthode</p>
            <h2>Un parcours maîtrisé,<br />du diagnostic au suivi.</h2>
          </header>
          <div className="xp-process-track">
            {expertise.process.map((step) => (
              <article key={step.index} data-x-reveal="rise">
                <span>{step.index}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="xp-next">
        <Link href={`/expertises/${nextExpertise.slug}`} className="page-shell xp-next-link">
          <span data-x-reveal="fade">Explorer le pôle {nextExpertise.index}</span>
          <strong data-x-reveal="title">{nextExpertise.navTitle}</strong>
          <i><ArrowIcon /></i>
        </Link>
      </section>

      <footer className="xp-footer">
        <div className="page-shell xp-footer-inner">
          <Image src="/images/inox-logo.png" alt="INOX Technologies" width={84} height={84} />
          <div className="xp-footer-primary">
            <p>Un enjeu lié à ce pôle&nbsp;?</p>
            <a href="mailto:contact@inox-group.net">Présenter votre projet <ArrowIcon /></a>
          </div>
          <div className="xp-footer-contacts">
            <a href="mailto:contact@inox-group.net">contact@inox-group.net</a>
            <a href="mailto:fidelebo@inox-group.net">fidelebo@inox-group.net</a>
            <a href="tel:+2250708201515">+225 07 08 20 15 15</a>
            <a href="tel:+2250707950441">+225 07 07 95 04 41</a>
          </div>
          <div className="xp-footer-location">
            <span>Cocody, Angré 9e Tranche · Route CNPS<br />Abidjan, Côte d’Ivoire</span>
            <a href="https://inox-groupe.vercel.app/">inox-groupe.vercel.app</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
