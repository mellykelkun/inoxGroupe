import Image from "next/image";
import BandeauTechnologies from "../composants/BandeauTechnologies";
import Entete from "../composants/Entete";
import CarteCoteIvoire from "../composants/CarteCoteIvoire";
import FormulaireContact from "../composants/FormulaireContact";
import LienCinematique from "../composants/LienCinematique";
import PiedDePage from "../composants/PiedDePage";
import Revelation from "../composants/Revelation";
import UniversNumerique from "../composants/UniversNumerique";
import InstallationAccueil from "../composants/InstallationAccueil";
import ForumAccueil from "../composants/ForumAccueil";
import "./forum-accueil.css";

const expertises = [
  {
    numero: "01",
    titre: "Cloud, datacenter & productivité",
    texte: "Gardez vos applications disponibles, vos données protégées et vos équipes productives, même lorsque votre activité évolue.",
    interventions: ["Cloud & hébergement", "Sauvegarde & continuité", "Outils collaboratifs"],
    image: "/images/expertises/datacenter-cloud-4k.webp",
    alt: "Ingénieur intervenant sur des serveurs, switches et fibres optiques dans un datacenter",
    materiel: "Serveurs · Stockage · Fibre",
    couleur: "bleu",
  },
  {
    numero: "02",
    titre: "Réseaux & cybersécurité",
    texte: "Reliez vos sites et vos collaborateurs tout en protégeant les accès, les équipements et les données essentielles à votre activité.",
    interventions: ["Réseaux performants", "Interconnexion & télécoms", "Protection des accès et des données"],
    image: "/images/expertises/reseaux-cybersecurite-4k.webp",
    alt: "Spécialiste réseau contrôlant des switches et des liaisons avec un analyseur professionnel",
    materiel: "Switches · Firewall · Analyseur",
    couleur: "orange",
  },
  {
    numero: "03",
    titre: "Digitalisation & logiciels",
    texte: "Réduisez les tâches répétitives, centralisez l’information et transformez vos processus en outils simples pour vos équipes et vos clients.",
    interventions: ["Automatisation des activités", "Applications sur mesure", "Connexion de vos outils"],
    image: "/images/expertises/digitalisation-metiers-4k.webp",
    alt: "Opérateur utilisant un terminal RFID, une tablette et une imprimante d’étiquettes dans un espace logistique",
    materiel: "RFID · IoT · Terminaux métiers",
    couleur: "vert",
  },
  {
    numero: "04",
    titre: "Formation & support",
    texte: "Donnez à vos équipes les moyens d’adopter les solutions, de gagner en autonomie et d’obtenir de l’aide lorsqu’elles en ont besoin.",
    interventions: ["Formation pratique", "Accompagnement au changement", "Assistance & support"],
    image: "/images/expertises/formation-support-4k.webp",
    alt: "Formateur accompagnant deux techniciens sur du matériel réseau et des outils de raccordement fibre",
    materiel: "Fibre · Diagnostic · Support",
    couleur: "sable",
  },
];

const services = [
  {
    titre: "Audit & conseil",
    texte: "Identifier ce qui ralentit, fragilise ou coûte inutilement afin de prioriser les améliorations qui auront un impact réel.",
  },
  {
    titre: "Intégration",
    texte: "Déployer et connecter les solutions à votre environnement existant sans créer de nouvelle complexité pour vos équipes.",
  },
  {
    titre: "Formation",
    texte: "Préparer les utilisateurs et les équipes techniques pour accélérer l’adoption et rendre chacun plus autonome.",
  },
  {
    titre: "Assistance & support",
    texte: "Réduire les interruptions grâce à un suivi après déploiement et une assistance adaptée à vos priorités.",
  },
];

const etapes = [
  {
    titre: "Analyser",
    texte: "Repérer les difficultés, les risques et les opportunités avant d’engager votre budget.",
  },
  {
    titre: "Concevoir",
    texte: "Transformer vos objectifs en une solution claire, réaliste et adaptée à votre fonctionnement.",
  },
  {
    titre: "Intégrer",
    texte: "Mettre en service les outils avec méthode, en limitant l’impact sur votre activité.",
  },
  {
    titre: "Accompagner",
    texte: "Former, assister et améliorer dans la durée pour préserver la valeur de votre investissement.",
  },
];

const benefices = [
  {
    titre: "Une activité plus disponible",
    texte: "Réduire les interruptions et maintenir l’accès aux applications, aux données et aux services essentiels.",
  },
  {
    titre: "Des risques mieux maîtrisés",
    texte: "Protéger les accès et les données, anticiper les incidents et préparer la reprise de l’activité.",
  },
  {
    titre: "Des équipes plus efficaces",
    texte: "Simplifier les outils, automatiser les tâches répétitives et donner aux collaborateurs les moyens d’avancer.",
  },
  {
    titre: "Un partenaire qui reste présent",
    texte: "Bénéficier d’un interlocuteur qui comprend votre environnement, accompagne vos équipes et suit les solutions dans le temps.",
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
              <span className="eyebrow eyebrow--clair">Infrastructure · Cybersécurité · Solutions métiers</span>
              <h1 className="hero__marque"><span>INOX</span><small>TECHNOLOGIES</small></h1>
              <p className="hero__promesse titreAnime titreAnime--hero">Une informatique fiable, sécurisée et prête à <em>faire avancer votre activité.</em></p>
              <p className="hero__description">
                INOX Technologies conçoit, déploie et maintient les infrastructures, les réseaux et les solutions numériques dont vos équipes ont besoin pour travailler efficacement et sans interruption.
              </p>
              <div className="hero__actions">
                <a className="bouton bouton--accent" href="#solutions">Découvrir nos solutions <span aria-hidden="true">↗</span></a>
                <a className="bouton bouton--sombre" href="#forum">Explorer l’arbre INOX <span aria-hidden="true">↓</span></a>
                <a className="lienClair" href="#contact">Échanger avec un expert <span aria-hidden="true">→</span></a>
                <LienCinematique className="lienClair" href="/forum">Rejoindre le Forum <span aria-hidden="true">→</span></LienCinematique>
              </div>
            </Revelation>
            <Revelation classe="hero__univers"><UniversNumerique /></Revelation>
          </div>
          <div className="hero__bas conteneur"><span>Des solutions conçues autour de vos priorités</span><span className="hero__fleche" aria-hidden="true">↓</span></div>
        </section>

        <section className="section section--intro" id="apropos">
          <div className="conteneur intro">
            <Revelation classe="intro__repere"><span>01</span><span>Qui sommes-nous ?</span></Revelation>
            <Revelation classe="intro__contenu">
              <span className="eyebrow">Un partenaire engagé à vos côtés</span>
              <h2 className="titreAnime titreAnime--intro">Moins de complexité.<br /><em>Plus de performance.</em></h2>
              <div className="intro__details">
                <p>Depuis 2021, INOX Technologies aide les entreprises et institutions à éliminer les freins informatiques qui ralentissent leurs équipes, exposent leurs données ou limitent leur croissance.</p>
                <p>Notre différence : un seul partenaire pour comprendre vos enjeux, coordonner les expertises, intégrer les bonnes solutions et rester présent après leur mise en service.</p>
              </div>
              <div className="intro__reperes" aria-label="Repères sur INOX Technologies">
                <div><strong>2021</strong><span>Création en Côte d’Ivoire</span></div>
                <div><strong>Abidjan</strong><span>Implantation à Cocody</span></div>
                <div><strong>4 pôles</strong><span>Une réponse coordonnée de bout en bout</span></div>
              </div>
            </Revelation>
          </div>
        </section>

        <InstallationAccueil />

        <section className="section section--equipe" id="equipe">
          <div className="equipe__lueur equipe__lueur--une" aria-hidden="true" />
          <div className="equipe__lueur equipe__lueur--deux" aria-hidden="true" />
          <div className="equipe__grille" aria-hidden="true" />
          <div className="conteneur equipe">
            <Revelation classe="equipe__entete">
              <div>
                <span className="eyebrow">La proximité qui fait la différence</span>
                <h2 className="titreAnime titreAnime--equipe">Des experts qui écoutent.<br /><em>Des solutions qui servent vraiment.</em></h2>
              </div>
              <div className="equipe__introduction">
                <p>Nos équipes associent expertise technique, compréhension métier et connaissance des réalités locales pour proposer des réponses applicables, adoptées et durables.</p>
                <div className="equipe__principes" aria-label="Nos principes de collaboration">
                  <span>Écouter</span><span>Concevoir</span><span>Transmettre</span>
                </div>
              </div>
            </Revelation>

            <div className="equipe__galerie">
              <Revelation classe="equipe__photo equipe__photo--principale">
                <Image
                  src="/images/equipe/equipe-inox-collaboration.webp"
                  alt="Illustration de spécialistes du numérique collaborant autour d’un projet"
                  fill
                  sizes="(max-width: 850px) 100vw, 72vw"
                />
                <span className="equipe__etiquette">Collaboration · Expertise · Proximité</span>
              </Revelation>
              <Revelation classe="equipe__photo equipe__photo--secondaire">
                <Image
                  src="/images/equipe/equipe-inox-pair-programming.webp"
                  alt="Illustration de deux développeurs travaillant ensemble sur une application"
                  fill
                  sizes="(max-width: 520px) 76vw, (max-width: 850px) 42vw, 28vw"
                />
                <span className="equipe__numero" aria-hidden="true">01 — 02</span>
              </Revelation>
              <p className="equipe__legende">Une collaboration fondée sur l’écoute, la maîtrise technique et la transmission.</p>
            </div>
          </div>
        </section>

        <div className="bandeauMarque" aria-hidden="true">
          <div className="bandeauMarque__piste">
            <span className="bandeauMarque__groupe">INOX TECHNOLOGIES <span className="bandeauMarque__separateur">●</span> INOX TECHNOLOGIES <span className="bandeauMarque__separateur">●</span> INOX TECHNOLOGIES <span className="bandeauMarque__separateur">●</span></span>
            <span className="bandeauMarque__groupe">INOX TECHNOLOGIES <span className="bandeauMarque__separateur">●</span> INOX TECHNOLOGIES <span className="bandeauMarque__separateur">●</span> INOX TECHNOLOGIES <span className="bandeauMarque__separateur">●</span></span>
          </div>
        </div>

        <section className="section section--solutions" id="solutions">
          <div className="conteneur">
            <Revelation classe="sectionEntete">
              <div><span className="eyebrow">Quatre expertises, un même objectif</span><h2 className="titreAnime titreAnime--solutions">Une informatique qui protège,<br /><em>connecte et accélère.</em></h2></div>
              <p>Nous traitons l’infrastructure, la sécurité, les logiciels et l’accompagnement ensemble afin d’éviter les outils isolés, les responsabilités dispersées et les problèmes qui se répètent.</p>
            </Revelation>
            <div className="expertises">
              {expertises.map((expertise) => (
                <Revelation classe={`expertise expertise--${expertise.couleur}`} key={expertise.numero}>
                  <div className="expertise__visuel" style={{ position: "relative" }}>
                    <Image
                      src={expertise.image}
                      alt={expertise.alt}
                      fill
                      sizes="(max-width: 850px) 100vw, 50vw"
                    />
                    <span>{expertise.materiel}</span>
                  </div>
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

        <section className="section ecosystemeApercu">
          <div className="ecosystemeApercu__trame" aria-hidden="true" />
          <div className="conteneur ecosystemeApercu__contenu">
            <Revelation classe="ecosystemeApercu__texte">
              <span className="eyebrow">Les bonnes technologies, sans choix inutile</span>
              <h2>Des solutions compatibles.<br /><em>Un résultat cohérent.</em></h2>
              <p>Cloud, réseaux, cybersécurité, automatisation et support sont sélectionnés selon vos usages, votre environnement et vos priorités — jamais pour imposer une marque.</p>
              <div className="ecosystemeApercu__actions">
                <LienCinematique className="bouton bouton--accent" href="/ecosysteme">Explorer l’écosystème <span aria-hidden="true">↗</span></LienCinematique>
                <LienCinematique className="ecosystemeApercu__immersion" href="/immersion-core">Vivre Immersion Core <span aria-hidden="true">→</span></LienCinematique>
              </div>
            </Revelation>
            <Revelation classe="ecosystemeApercu__orbite">
              <div className="ecosystemeApercu__centre"><strong>INOX</strong><span>ÉCOSYSTÈME</span></div>
              <span className="ecosystemeApercu__satellite ecosystemeApercu__satellite--cloud">Cloud</span>
              <span className="ecosystemeApercu__satellite ecosystemeApercu__satellite--devops">DevOps</span>
              <span className="ecosystemeApercu__satellite ecosystemeApercu__satellite--reseau">Réseaux</span>
              <span className="ecosystemeApercu__satellite ecosystemeApercu__satellite--cyber">Cyber</span>
              <span className="ecosystemeApercu__satellite ecosystemeApercu__satellite--digital">Digital</span>
            </Revelation>
          </div>
        </section>

        <BandeauTechnologies />

        <ForumAccueil />

        <section className="section partenairesApercu" id="partenaires">
          <div className="conteneur">
            <Revelation classe="partenairesApercu__entete">
              <div>
                <span className="eyebrow">La force d’un réseau maîtrisé</span>
                <h2>Plus d’expertise.<br /><em>Moins de risques pour votre projet.</em></h2>
              </div>
              <div>
                <p>Nous réunissons des compétences complémentaires et des technologies reconnues pour sécuriser vos choix, accélérer l’intégration et assurer la continuité.</p>
                <LienCinematique className="partenairesApercu__lien" href="/partenaires" variante="partenaires">Découvrir nos partenaires <span aria-hidden="true">→</span></LienCinematique>
              </div>
            </Revelation>
            <Revelation classe="partenairesApercu__schema">
              <div className="partenairesApercu__noeud partenairesApercu__noeud--clients"><strong>11</strong><span>Entreprises<br />& institutions</span></div>
              <div className="partenairesApercu__trait partenairesApercu__trait--gauche" aria-hidden="true"><i /><i /></div>
              <div className="partenairesApercu__centre"><strong>INOX</strong><span>Réseau de confiance</span></div>
              <div className="partenairesApercu__trait partenairesApercu__trait--droite" aria-hidden="true"><i /><i /></div>
              <div className="partenairesApercu__noeud partenairesApercu__noeud--technologies"><strong>18</strong><span>Partenaires<br />technologiques</span></div>
            </Revelation>
          </div>
        </section>

        <section className="section section--services" id="services">
          <div className="conteneur services">
            <Revelation classe="services__titre">
              <span className="eyebrow">Un accompagnement de bout en bout</span>
              <h2 className="titreAnime titreAnime--services">Du problème identifié<br />au <em>résultat durable.</em></h2>
              <p>Nous ne nous arrêtons pas à la livraison : nous préparons l’adoption, suivons la mise en service et restons disponibles lorsque vos besoins évoluent.</p>
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
              <p>Votre besoin guide la solution. La technologie vient ensuite.</p>
            </Revelation>
          </div>
        </section>

        <section className="section section--valeur">
          <div className="conteneur valeur">
            <Revelation classe="valeur__intro">
              <span className="eyebrow">Des bénéfices visibles au quotidien</span>
              <h2 className="titreAnime titreAnime--valeur">Ce que vous devez réellement <em>gagner.</em></h2>
              <p>Moins d’interruptions, moins de risques et moins de temps perdu — pour des équipes plus efficaces et une activité capable d’évoluer.</p>
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
              <span className="eyebrow eyebrow--clair">Une méthode qui protège votre investissement</span>
              <h2 className="titreAnime titreAnime--methode">Comprendre d’abord.<br /><em>Déployer avec maîtrise.</em></h2>
              <p>Chaque étape réduit les mauvaises surprises, protège la continuité de votre activité et permet à vos équipes d’adopter la solution.</p>
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
              <span className="eyebrow">Une difficulté ralentit votre activité ?</span>
              <h2 className="titreAnime titreAnime--appel">Transformons-la en<br /><em>solution concrète.</em></h2>
              <p className="appel__texte">Parlez-nous de ce qui bloque, du résultat attendu et de vos contraintes. Nous vous aiderons à identifier une prochaine étape claire et réaliste.</p>
              <a className="bouton bouton--sombre" href="#contact">Échanger avec un expert <span aria-hidden="true">↗</span></a>
            </Revelation>
            <div className="appel__marque" aria-hidden="true">INOX<span>.</span></div>
          </div>
        </section>

        <section className="section section--contact" id="contact">
          <div className="contact__carteFond"><CarteCoteIvoire /></div>
          <div className="conteneur contact">
            <Revelation classe="contact__presentation">
              <span className="eyebrow">Votre prochaine avancée commence ici</span>
              <h2 className="titreAnime titreAnime--contact">Parlons de ce que vous voulez<br /><em>améliorer.</em></h2>
              <p className="contact__introduction">Expliquez-nous votre difficulté ou votre objectif. L’équipe INOX préparera un échange ciblé sur vos priorités et les résultats recherchés.</p>

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

            </Revelation>
            <Revelation classe="contact__formulaire"><FormulaireContact /></Revelation>
          </div>
        </section>
      </main>
      <PiedDePage />
    </>
  );
}
