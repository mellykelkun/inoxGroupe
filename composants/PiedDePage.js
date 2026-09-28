import LogoInox from "./LogoInox";
import LienCinematique from "./LienCinematique";
import CarteInstallation from "./CarteInstallation";

export default function PiedDePage() {
  return (
    <footer className="piedDePage">
      <div className="conteneur"><CarteInstallation /></div>
      <div className="conteneur piedDePage__principal">
        <div>
          <LienCinematique className="marque marque--pied" href="/" direction="retour" aria-label="Retour à l'accueil INOX Technologies">
            <LogoInox />
          </LienCinematique>
          <p className="piedDePage__intro">Des solutions informatiques fiables, sécurisées et adaptées à votre activité — de la conception au support.</p>
          <div className="piedDePage__experiences">
            <LienCinematique className="piedDePage__ecosysteme" href="/partenaires" variante="partenaires">Découvrir nos partenaires <span aria-hidden="true">↗</span></LienCinematique>
            <LienCinematique className="piedDePage__ecosysteme" href="/ecosysteme">Explorer notre écosystème <span aria-hidden="true">↗</span></LienCinematique>
            <LienCinematique className="piedDePage__ecosysteme" href="/immersion-core">Vivre Immersion Core <span aria-hidden="true">→</span></LienCinematique>
          </div>
        </div>
        <div className="piedDePage__contact">
          <span className="eyebrow eyebrow--clair">Parlons de votre projet</span>
          <a href="mailto:contact@inox-group.net">contact@inox-group.net</a>
          <a href="mailto:fidelebo@inox-group.net">fidelebo@inox-group.net</a>
          <a href="tel:+2250708201515">+225 07 08 20 15 15</a>
          <a href="tel:+2250707950441">+225 07 07 95 04 41</a>
          <span>Cocody, Angré 9e Tranche · Route CNPS<br />Abidjan, Côte d’Ivoire</span>
        </div>
      </div>
      <div className="conteneur piedDePage__bas"><span>© INOX Technologies</span><span>Fiabilité · Sécurité · Performance</span></div>
    </footer>
  );
}
