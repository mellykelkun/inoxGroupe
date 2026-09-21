import Entete from "../composants/Entete";
import CarteCoteIvoire from "../composants/CarteCoteIvoire";
import FormulaireContact from "../composants/FormulaireContact";
import PiedDePage from "../composants/PiedDePage";
import Revelation from "../composants/Revelation";
import UniversNumerique from "../composants/UniversNumerique";

const expertises = [
  {
    numero: "01",
    titre: "Datacenter, cloud & productivité",
    texte: "Faire évoluer le socle qui héberge vos données, vos applications et les outils utilisés quotidiennement par vos équipes.",
    interventions: ["Environnements datacenter", "Solutions cloud computing", "Outils de productivité"],
    couleur: "bleu",
  },
  {
    numero: "02",
    titre: "Networking & security",
    texte: "Concevoir et implémenter des infrastructures réseaux et de sécurité adaptées à votre système d’information.",
    interventions: ["Architecture réseau", "Solutions de télécommunications", "Sécurité du système d’information"],
    couleur: "orange",
  },
  {
    numero: "03",
    titre: "Digitalisation & logiciels",
    texte: "Transformer les besoins métiers en solutions numériques capables de s’intégrer à votre environnement existant.",
    interventions: ["Digitalisation des activités", "Développement de logiciels", "Intégration de solutions"],
    couleur: "vert",
  },
  {
    numero: "04",
    titre: "Formation & support",
    texte: "Accompagner l’adoption des technologies et renforcer les compétences nécessaires à leur utilisation dans la durée.",
    interventions: ["Montée en compétence", "Accompagnement au déploiement", "Assistance et support"],
    couleur: "sable",
  },
];

const services = [
  {
    titre: "Audit & consulting",
    texte: "Étudier votre environnement, clarifier les besoins et vous conseiller avant d’engager les choix techniques.",
  },
  {
    titre: "Intégration",
    texte: "Mettre en œuvre les solutions retenues et les intégrer avec méthode dans votre système d’information.",
  },
  {
    titre: "Formation",
    texte: "Préparer les utilisateurs et les équipes techniques afin de faciliter l’adoption et développer leur autonomie.",
  },
  {
    titre: "Assistance & support",
    texte: "Assurer le suivi après déploiement, le service après-vente et une capacité d’intervention adaptée aux besoins.",
  },
];

const etapes = [
  {
    titre: "Analyser",
    texte: "Comprendre l’existant, les usages, les contraintes et les priorités de votre organisation.",
  },
  {
    titre: "Concevoir",
    texte: "Définir une architecture et un plan de mise en œuvre cohérents avec vos besoins réels.",
  },
  {
    titre: "Intégrer",
    texte: "Déployer les technologies et les connecter à votre environnement avec rigueur.",
  },
  {
    titre: "Accompagner",
    texte: "Suivre le projet, soutenir les équipes et contribuer à la maturité de votre système d’information.",
  },
];

const benefices = [
  {
    titre: "Des choix technologiques plus lisibles",
    texte: "Relier les décisions techniques aux priorités opérationnelles et à la trajectoire de l’organisation.",
  },
  {
    titre: "Des déploiements mieux maîtrisés",
    texte: "Préparer l’intégration, prendre en compte l’existant et accompagner la mise en service.",
  },
  {
    titre: "Des équipes mieux accompagnées",
    texte: "Associer formation, transfert de compétences, assistance et support à la solution technique.",
  },
  {
    titre: "Un système d’information capable d’évoluer",
    texte: "Construire une base qui aide l’organisation à gagner en agilité et à répondre plus rapidement aux évolutions de son activité.",
  },
];

export default function Home() {
  return (
    <>
      <Entete />
      <main id="accueil">
        <section className="hero sectionSombre">
          <div className="hero__trame" aria-hidden="true" />
          <div className="conteneur hero__contenu">
            <Revelation classe="hero__texte">
              <span className="eyebrow eyebrow--clair">Ingénierie informatique · Abidjan</span>
              <h1 className="hero__marque"><span>INOX</span><small>TECHNOLOGIES</small></h1>
              <p className="hero__promesse titreAnime titreAnime--hero">Faites évoluer votre système d’information avec <em>méthode et maîtrise.</em></p>
              <p className="hero__description">
                Société d’ingénierie informatique et intégrateur de solutions, INOX Technologies accompagne la mise en œuvre, l’évolution et la maturité des systèmes d’information.
              </p>
              <div className="hero__actions">
                <a className="bouton bouton--accent" href="#solutions">Explorer nos expertises <span aria-hidden="true">↗</span></a>
                <a className="lienClair" href="#contact">Présenter votre besoin <span aria-hidden="true">→</span></a>
              </div>
            </Revelation>
            <Revelation classe="hero__univers"><UniversNumerique /></Revelation>
          </div>
          <div className="hero__bas conteneur"><span>Scroll pour découvrir</span><span className="hero__fleche" aria-hidden="true">↓</span></div>
        </section>

        <section className="section section--intro" id="apropos">
          <div className="conteneur intro">
            <Revelation classe="intro__repere"><span>01</span><span>Qui sommes-nous ?</span></Revelation>
            <Revelation classe="intro__contenu">
              <span className="eyebrow">L’expérience au service de votre transformation</span>
              <h2 className="titreAnime titreAnime--intro">Faire de la technologie un <em>levier de performance.</em></h2>
              <div className="intro__details">
                <p>Créée en 2021 en Côte d’Ivoire, INOX Technologies est portée par une équipe dirigeante issue de l’ingénierie, du management et des sociétés de services informatiques.</p>
                <p>L’entreprise associe expertise technologique, agilité et capacité d’engagement pour accompagner les organisations dans la mise en œuvre et la maturité de leur système d’information.</p>
              </div>
              <div className="intro__reperes" aria-label="Repères sur INOX Technologies">
                <div><strong>2021</strong><span>Création en Côte d’Ivoire</span></div>
                <div><strong>Abidjan</strong><span>Implantation à Cocody</span></div>
                <div><strong>4 pôles</strong><span>Une approche complémentaire du SI</span></div>
              </div>
            </Revelation>
          </div>
        </section>

        <div className="bandeauMarque" aria-hidden="true"><div>INOX TECHNOLOGIES <span>●</span> INOX TECHNOLOGIES <span>●</span> INOX TECHNOLOGIES</div></div>

        <section className="section section--solutions" id="solutions">
          <div className="conteneur">
            <Revelation classe="sectionEntete">
              <div><span className="eyebrow">Quatre expertises complémentaires</span><h2 className="titreAnime titreAnime--solutions">Du socle technique<br /><em>aux usages métiers.</em></h2></div>
              <p>INOX intervient sur les différentes couches du système d’information pour éviter les réponses isolées et construire un environnement cohérent.</p>
            </Revelation>
            <div className="expertises">
              {expertises.map((expertise) => (
                <Revelation classe={`expertise expertise--${expertise.couleur}`} key={expertise.numero}>
                  <span className="expertise__numero">{expertise.numero}</span>
                  <div>
                    <h3>{expertise.titre}</h3>
                    <p>{expertise.texte}</p>
                    <ul className="expertise__liste">
                      {expertise.interventions.map((intervention) => <li key={intervention}>{intervention}</li>)}
                    </ul>
                  </div>
                  <span className="expertise__fleche" aria-hidden="true">↗</span>
                </Revelation>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--services" id="services">
          <div className="conteneur services">
            <Revelation classe="services__titre">
              <span className="eyebrow">Comment nous intervenons</span>
              <h2 className="titreAnime titreAnime--services">Du diagnostic<br />à la <em>continuité.</em></h2>
              <p>Une solution ne crée de valeur que si elle est comprise, correctement intégrée et accompagnée après sa mise en service.</p>
            </Revelation>
            <Revelation classe="services__liste">
              {services.map((service, index) => (
                <div className="service" key={service.titre}>
                  <span>0{index + 1}</span>
                  <div className="service__contenu"><strong>{service.titre}</strong><p>{service.texte}</p></div>
                  <span className="service__fleche" aria-hidden="true">↗</span>
                </div>
              ))}
            </Revelation>
            <Revelation classe="services__note">
              <span className="services__ligne" aria-hidden="true" />
              <p>Notre point de départ : comprendre votre environnement avant de recommander une technologie.</p>
            </Revelation>
          </div>
        </section>

        <section className="section section--valeur">
          <div className="conteneur valeur">
            <Revelation classe="valeur__intro">
              <span className="eyebrow">La valeur recherchée</span>
              <h2 className="titreAnime titreAnime--valeur">Ce que votre organisation doit <em>gagner.</em></h2>
              <p>La technologie est un moyen. L’objectif est de renforcer la capacité de votre organisation à travailler, décider et évoluer.</p>
            </Revelation>
            <div className="valeur__liste">
              {benefices.map((benefice, index) => (
                <Revelation classe="benefice" key={benefice.titre}>
                  <span>0{index + 1}</span><div><h3>{benefice.titre}</h3><p>{benefice.texte}</p></div>
                </Revelation>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--methode">
          <div className="conteneur methode">
            <Revelation classe="methode__intro">
              <span className="eyebrow eyebrow--clair">Une méthode lisible</span>
              <h2 className="titreAnime titreAnime--methode">Construire juste.<br /><em>Avancer ensemble.</em></h2>
              <p>De la compréhension de l’existant jusqu’au support, chaque étape doit réduire l’incertitude et préparer la suivante.</p>
            </Revelation>
            <div className="parcours">
              {etapes.map((etape, index) => (
                <Revelation classe="etape" key={etape.titre}>
                  <span className="etape__numero">0{index + 1}</span><h3>{etape.titre}</h3><p>{etape.texte}</p>
                </Revelation>
              ))}
            </div>
          </div>
        </section>

        <section className="section appel">
          <div className="conteneur appel__contenu">
            <Revelation>
              <span className="eyebrow">Un projet, une difficulté ou une évolution à préparer ?</span>
              <h2 className="titreAnime titreAnime--appel">Commençons par comprendre<br /><em>votre environnement.</em></h2>
              <p className="appel__texte">Présentez-nous votre contexte, vos contraintes et le résultat recherché. Notre équipe pourra vous orienter vers une démarche adaptée.</p>
              <a className="bouton bouton--sombre" href="#contact">Parlons de votre projet <span aria-hidden="true">↗</span></a>
            </Revelation>
            <div className="appel__marque" aria-hidden="true">INOX<span>.</span></div>
          </div>
        </section>

        <section className="section section--contact" id="contact">
          <div className="contact__carteFond"><CarteCoteIvoire /></div>
          <div className="conteneur contact">
            <Revelation classe="contact__presentation">
              <span className="eyebrow">Un échange commence ici</span>
              <h2 className="titreAnime titreAnime--contact">Parlons de votre<br /><em>prochain projet.</em></h2>
              <p className="contact__introduction">Expliquez-nous votre contexte. L’équipe INOX pourra mieux comprendre votre besoin et préparer un premier échange adapté.</p>

              <div className="contact__coordonnees">
                <div>
                  <span className="contact__legende">Téléphones</span>
                  <a href="tel:+2250708201515">+225 07 08 20 15 15</a>
                  <a href="tel:+2250707950441">+225 07 07 95 04 41</a>
                </div>
                <div>
                  <span className="contact__legende">Emails</span>
                  <a href="mailto:contact@inox-group.net">contact@inox-group.net</a>
                  <a href="mailto:fidelebo@inox-group.net">fidelebo@inox-group.net</a>
                </div>
                <div>
                  <span className="contact__legende">Adresse</span>
                  <address>Cocody, Angré 9e Tranche<br />Route CNPS · Abidjan, Côte d’Ivoire</address>
                </div>
              </div>

              <p className="contact__precision">Le repère cartographique situe le secteur d’Angré ; il ne constitue pas une coordonnée GPS précise.</p>
            </Revelation>
            <Revelation classe="contact__formulaire"><FormulaireContact /></Revelation>
          </div>
        </section>
      </main>
      <PiedDePage />
    </>
  );
}
