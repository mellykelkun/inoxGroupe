import Image from "next/image";
import CarrouselLogos from "../../composants/CarrouselLogos";
import Entete from "../../composants/Entete";
import LienCinematique from "../../composants/LienCinematique";
import PiedDePage from "../../composants/PiedDePage";
import Revelation from "../../composants/Revelation";
import "./partenaires.css";

export const metadata = {
  title: "Références & partenaires technologiques | INOX Technologies",
  description: "Découvrez les organisations qui font confiance à INOX et les partenaires technologiques mobilisés pour sécuriser et accélérer chaque projet.",
};

const engagements = [
  {
    numero: "01",
    titre: "Un interlocuteur responsable",
    texte: "INOX coordonne les expertises et les intervenants pour vous éviter de gérer plusieurs prestataires sans vision commune.",
  },
  {
    numero: "02",
    titre: "Des choix adaptés au besoin",
    texte: "Les marques et les technologies sont sélectionnées selon vos usages, vos contraintes et la valeur attendue.",
  },
  {
    numero: "03",
    titre: "Une continuité après livraison",
    texte: "Nous restons présents pour accompagner l’adoption, suivre les solutions et faire évoluer votre environnement.",
  },
];

const clients = [
  { nom: "Carte Brune", logo: "/images/partenaires/logos/clients/carte-brune.png" },
  { nom: "Sanlam Allianz", logo: "/images/partenaires/logos/clients/sanlam-allianz.png" },
  { nom: "BSIC", logo: "/images/partenaires/logos/clients/bsic.png" },
  { nom: "Groupe Schiba", logo: "/images/partenaires/logos/clients/schiba-holding.webp" },
  { nom: "ASACI", logo: "/images/partenaires/logos/clients/asaci-technologies.png" },
  { nom: "SITL Transport & Logistique", logo: "/images/partenaires/logos/clients/sitl.svg" },
  { nom: "SMA BTP", logo: "/images/partenaires/logos/clients/sma-btp.jpg" },
  { nom: "SPCI", logo: "/images/partenaires/logos/clients/spci.png", classe: "partenaireLogo__visuel--spci" },
  { nom: "ASAC", logo: "/images/partenaires/logos/clients/asac.png" },
  { nom: "Pool TPV", logo: "/images/partenaires/logos/clients/pool-tpv.jpg" },
  { nom: "Corlay", logo: "/images/partenaires/logos/clients/corlay.png" },
];

const partenairesTechnologiques = [
  { nom: "Fortinet", logo: "/images/partenaires/logos/technologies/fortinet-wordmark.svg" },
  { nom: "Microsoft", logo: "/images/partenaires/logos/technologies/microsoft-wordmark.svg" },
  { nom: "Nutanix", logo: "/images/partenaires/logos/technologies/nutanix-wordmark.svg" },
  { nom: "Kaspersky", logo: "/images/partenaires/logos/technologies/kaspersky-wordmark.svg" },
  { nom: "Cisco", logo: "/images/partenaires/logos/technologies/cisco-wordmark.svg" },
  { nom: "Veeam", logo: "/images/partenaires/logos/technologies/veeam-wordmark.svg" },
  { nom: "VMware", logo: "/images/partenaires/logos/technologies/vmware-wordmark.svg" },
  { nom: "Hewlett Packard Enterprise", logo: "/images/partenaires/logos/technologies/hpe-wordmark.svg" },
  { nom: "Lenovo", logo: "/images/partenaires/logos/technologies/lenovo-wordmark.svg" },
  { nom: "Palo Alto Networks", logo: "/images/partenaires/logos/technologies/palo-alto-networks.svg" },
  { nom: "Wallix", logo: "/images/partenaires/logos/technologies/wallix.png" },
  { nom: "Oracle", logo: "/images/partenaires/logos/technologies/oracle-wordmark.svg" },
  { nom: "ManageEngine", logo: "/images/partenaires/logos/technologies/manageengine.png" },
  { nom: "AWS", logo: "/images/partenaires/logos/technologies/aws-wordmark.svg" },
  { nom: "Cloudmania", logo: "/images/partenaires/logos/technologies/cloudmania.svg" },
  { nom: "AITEK", logo: "/images/partenaires/logos/technologies/aitek.svg" },
  { nom: "Hiperdist", logo: "/images/partenaires/logos/technologies/hiperdist.png" },
  { nom: "Exclusive Networks", logo: "/images/partenaires/logos/technologies/exclusive-networks.svg" },
];

function CarteLogo({ partenaire }) {
  return (
    <article className="partenaireLogo">
      <Image
        className={`partenaireLogo__visuel ${partenaire.classe ?? ""}`}
        src={partenaire.logo}
        alt={`Logo ${partenaire.nom}`}
        width={420}
        height={160}
        sizes="(max-width: 520px) calc(100vw - 64px), (max-width: 850px) 45vw, 360px"
      />
      <span>{partenaire.nom}</span>
    </article>
  );
}

export default function Partenaires() {
  return (
    <>
      <Entete />
      <main className="pagePartenaires" id="accueil">
        <section className="partenairesHero">
          <div className="partenairesHero__trame" aria-hidden="true" />
          <div className="partenairesHero__orbite partenairesHero__orbite--une" aria-hidden="true" />
          <div className="partenairesHero__orbite partenairesHero__orbite--deux" aria-hidden="true" />
          <div className="conteneur partenairesHero__contenu">
            <LienCinematique className="partenairesRetour" href="/" direction="retour"><span aria-hidden="true">←</span> Retour à l’accueil</LienCinematique>
            <span className="eyebrow">La confiance se construit par les résultats</span>
            <h1>Des partenaires solides.<br /><em>Des projets mieux maîtrisés.</em></h1>
            <p>INOX réunit les compétences et les technologies adaptées pour réduire les risques, accélérer la mise en œuvre et garantir une réponse cohérente du conseil au support.</p>
            <LienCinematique className="bouton bouton--accent pageLienForum" href="/forum">Échanger avec la communauté <span aria-hidden="true">↗</span></LienCinematique>
            <div className="partenairesHero__reperes">
              <div><strong>360°</strong><span>du conseil aux opérations</span></div>
              <div><strong>4</strong><span>expertises complémentaires</span></div>
              <div><strong>1</strong><span>écosystème coordonné</span></div>
            </div>
          </div>
          <div className="partenairesHero__ligne" aria-hidden="true"><span>Confiance</span><i /><span>Expertise</span><i /><span>Technologies</span><i /><span>Continuité</span></div>
        </section>

        <section className="section partenairesIntroduction">
          <div className="conteneur partenairesIntroduction__grille">
            <Revelation classe="partenairesIntroduction__titre">
              <span className="eyebrow">Plus de compétences, moins de complexité</span>
              <h2>Les expertises nécessaires.<br /><em>Une responsabilité claire.</em></h2>
            </Revelation>
            <Revelation classe="partenairesIntroduction__texte">
              <p>Au lieu de vous laisser coordonner plusieurs intervenants, INOX rassemble les compétences autour d’un objectif commun : rendre votre informatique plus fiable, plus sûre et plus utile à l’activité.</p>
              <p>Chaque partenaire est mobilisé pour une raison précise — expertise, compatibilité, disponibilité ou continuité — afin que le projet reste lisible et maîtrisé.</p>
            </Revelation>
          </div>
        </section>

        <section className="partenairesReseau" aria-labelledby="schema-partenaires">
          <div className="conteneur">
            <Revelation classe="partenairesReseau__entete">
              <span className="eyebrow">Une coordination qui protège votre projet</span>
              <h2 id="schema-partenaires">Les bons spécialistes.<br /><em>Au bon moment.</em></h2>
              <p>INOX traduit vos priorités en décisions techniques, coordonne les responsabilités et veille à ce que chaque solution s’intègre correctement à l’ensemble.</p>
            </Revelation>
            <Revelation classe="partenairesSchema">
              <div className="partenairesSchema__branche partenairesSchema__branche--clients">
                <span>Organisations</span>
                <strong>11</strong>
                <small>entreprises & institutions</small>
              </div>
              <div className="partenairesSchema__liaison partenairesSchema__liaison--gauche" aria-hidden="true"><i /><i /><i /></div>
              <div className="partenairesSchema__coeur">
                <strong>INOX</strong>
                <span>Coordination</span>
              </div>
              <div className="partenairesSchema__liaison partenairesSchema__liaison--droite" aria-hidden="true"><i /><i /><i /></div>
              <div className="partenairesSchema__branche partenairesSchema__branche--technologies">
                <span>Écosystème</span>
                <strong>18</strong>
                <small>éditeurs & constructeurs</small>
              </div>
            </Revelation>
          </div>
        </section>

        <section className="partenairesAnnuaire" aria-labelledby="references-partenaires">
          <div className="conteneur">
            <div className="partenairesAnnuaire__entete">
              <span className="eyebrow">La confiance de ceux qui agissent</span>
              <h2 id="references-partenaires">Des références concrètes.<br /><em>Un réseau prêt à agir.</em></h2>
            </div>

            <section className="partenairesAnnuaire__groupe" aria-labelledby="clients-partenaires">
              <div className="partenairesAnnuaire__titre">
                <span>01</span>
                <div><h3 id="clients-partenaires">Ils choisissent INOX</h3><p>Des entreprises et institutions qui nous confient leurs enjeux d’infrastructure, de sécurité, de digitalisation et d’accompagnement.</p></div>
              </div>
              <div className="partenairesLogos partenairesLogos--clients partenairesLogos--grille">
                {clients.map((client) => <CarteLogo partenaire={client} key={client.nom} />)}
              </div>
              <CarrouselLogos partenaires={clients} libelle="Références clients, carrousel interactif" />
            </section>

            <section className="partenairesAnnuaire__groupe" aria-labelledby="technologies-partenaires">
              <div className="partenairesAnnuaire__titre">
                <span>02</span>
                <div><h3 id="technologies-partenaires">Des technologies éprouvées</h3><p>Des éditeurs, constructeurs et distributeurs reconnus, sélectionnés selon les exigences réelles de chaque projet.</p></div>
              </div>
              <div className="partenairesLogos partenairesLogos--technologies partenairesLogos--grille">
                {partenairesTechnologiques.map((partenaire) => <CarteLogo partenaire={partenaire} key={partenaire.nom} />)}
              </div>
              <CarrouselLogos partenaires={partenairesTechnologiques} libelle="Partenaires technologiques, carrousel interactif" />
            </section>
          </div>
        </section>

        <section className="section partenairesEngagements">
          <div className="conteneur">
            <Revelation classe="partenairesEngagements__entete">
              <span className="eyebrow">Ce qui change pour vous</span>
              <h2>Un réseau coordonné.<br /><em>Une exécution plus simple.</em></h2>
            </Revelation>
            <div className="partenairesEngagements__grille">
              {engagements.map((engagement) => (
                <Revelation classe="partenairesEngagement" key={engagement.numero}>
                  <span>{engagement.numero}</span>
                  <h3>{engagement.titre}</h3>
                  <p>{engagement.texte}</p>
                </Revelation>
              ))}
            </div>
          </div>
        </section>

        <section className="partenairesFinal">
          <div className="partenairesFinal__reseau" aria-hidden="true" />
          <div className="conteneur partenairesFinal__contenu">
            <Revelation>
              <span className="eyebrow">Votre enjeu mérite une réponse claire</span>
              <h2>Réunissons les expertises<br /><em>qui feront avancer votre projet.</em></h2>
              <p>Présentez-nous votre difficulté, vos contraintes et le résultat attendu. Nous construirons une réponse coordonnée, réaliste et adaptée à votre organisation.</p>
              <div className="partenairesFinal__actions">
                <LienCinematique className="bouton bouton--accent" href="/#contact" direction="retour">Présenter votre projet <span aria-hidden="true">↗</span></LienCinematique>
                <LienCinematique className="lienRetour" href="/ecosysteme">Explorer les technologies <span aria-hidden="true">→</span></LienCinematique>
              </div>
            </Revelation>
          </div>
        </section>
      </main>
      <PiedDePage />
    </>
  );
}
