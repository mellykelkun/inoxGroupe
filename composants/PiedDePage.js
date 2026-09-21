import LogoInox from "./LogoInox";

export default function PiedDePage() {
  return (
    <footer className="piedDePage">
      <div className="conteneur piedDePage__principal">
        <div>
          <a className="marque marque--pied" href="#accueil" aria-label="Retour à l'accueil INOX Technologies">
            <LogoInox />
          </a>
          <p className="piedDePage__intro">L’ingénierie numérique au service d’organisations plus performantes, plus sécurisées et plus durables.</p>
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
      <div className="conteneur piedDePage__bas"><span>© INOX Technologies</span><span>Ingénierie · Intégration · Accompagnement</span></div>
    </footer>
  );
}
