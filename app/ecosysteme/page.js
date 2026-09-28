import Image from "next/image";
import Entete from "../../composants/Entete";
import LienCinematique from "../../composants/LienCinematique";
import PiedDePage from "../../composants/PiedDePage";
import Revelation from "../../composants/Revelation";

export const metadata = {
  title: "Solutions informatiques pour entreprises | INOX Technologies",
  description: "Cloud, réseaux, cybersécurité, digitalisation et support réunis pour rendre votre informatique plus fiable, plus sûre et plus efficace.",
};

const domaines = [
  {
    numero: "01",
    id: "cloud-datacenter",
    titre: "Cloud & datacenter",
    accroche: "Gardez vos applications disponibles et vos données accessibles.",
    texte: "Nous adaptons l’hébergement, le stockage et la sauvegarde à votre activité afin de limiter les interruptions, maîtriser les coûts et accompagner votre croissance.",
    technologies: ["Microsoft Azure", "AWS", "Google Cloud", "VMware", "Hyper-V", "OpenStack", "Docker", "Kubernetes"],
    services: ["Architecture hybride et multicloud", "Migration et modernisation", "Virtualisation et conteneurs", "Sauvegarde, PRA et haute disponibilité"],
    illustration: "/images/expertises/datacenter-cloud-4k.webp",
    illustrationAlt: "Baies serveurs dans un datacenter moderne",
    outils: [
      { nom: "Azure", logo: "/logos/technologies/microsoftazure.svg" },
      { nom: "AWS", logo: "/logos/technologies/amazonwebservices.svg" },
      { nom: "VMware", logo: "/logos/technologies/vmware.svg" },
      { nom: "Kubernetes", logo: "/logos/technologies/kubernetes.svg" },
    ],
    couleur: "bleu",
  },
  {
    numero: "02",
    id: "deploiement-devops",
    titre: "Déploiement & DevOps",
    accroche: "Livrez les améliorations plus vite et avec moins de risques.",
    texte: "Nous automatisons les tests, les configurations et les mises en ligne pour réduire les erreurs manuelles et rendre chaque évolution plus prévisible.",
    technologies: ["GitHub Actions", "GitLab CI", "Jenkins", "Terraform", "Ansible", "Argo CD", "Nginx", "Prometheus"],
    services: ["Pipelines CI/CD", "Infrastructure as Code", "GitOps et automatisation", "Supervision et observabilité"],
    illustration: "/images/equipe/equipe-inox-pair-programming.webp",
    illustrationAlt: "Ingénieurs travaillant ensemble sur une chaîne de déploiement",
    outils: [
      { nom: "Terraform", logo: "/logos/technologies/terraform.svg" },
      { nom: "Ansible", logo: "/logos/technologies/ansible.svg" },
      { nom: "Docker", logo: "/logos/technologies/docker.svg" },
      { nom: "Prometheus", logo: "/logos/technologies/prometheus.svg" },
    ],
    couleur: "orange",
  },
  {
    numero: "03",
    id: "reseaux",
    titre: "Réseaux & télécoms",
    accroche: "Connectez vos sites et vos équipes sans ralentir l’activité.",
    texte: "Nous concevons des réseaux stables et sécurisés pour que les collaborateurs accèdent aux outils, à la voix et aux données avec la qualité de service attendue.",
    technologies: ["Cisco", "Aruba", "Fortinet", "MikroTik", "Ubiquiti", "Huawei Enterprise", "WireGuard", "OpenVPN"],
    services: ["LAN, WAN et Wi-Fi entreprise", "SD-WAN et interconnexion de sites", "VPN et accès distants", "Audit de couverture et qualité de service"],
    illustration: "/images/expertises/reseaux-cybersecurite-4k.webp",
    illustrationAlt: "Équipements réseau et connexions sécurisées en entreprise",
    outils: [
      { nom: "Cisco", logo: "/logos/technologies/cisco.svg" },
      { nom: "Fortinet", logo: "/logos/technologies/fortinet.svg" },
      { nom: "Ubiquiti", logo: "/logos/technologies/ubiquiti.svg" },
      { nom: "WireGuard", logo: "/logos/technologies/wireguard.svg" },
    ],
    couleur: "cyan",
  },
  {
    numero: "04",
    id: "cybersecurite",
    titre: "Cybersécurité",
    accroche: "Protégez l’activité avant que l’incident ne la bloque.",
    texte: "Nous sécurisons les identités, les équipements, le réseau, les données et les sauvegardes tout en améliorant la détection et la capacité de reprise.",
    technologies: ["Microsoft Defender", "Microsoft Sentinel", "Fortinet", "Sophos", "CrowdStrike", "Wazuh", "Veeam", "MFA & IAM"],
    services: ["Audit et durcissement", "Firewall, EDR et protection des accès", "SIEM, journalisation et supervision", "Sauvegarde immuable et reprise"],
    illustration: "/images/immersion/immersion-core-noc.webp",
    illustrationAlt: "Centre d’opérations supervisant la sécurité d’un système d’information",
    outils: [
      { nom: "Fortinet", logo: "/logos/technologies/fortinet.svg" },
      { nom: "Microsoft", logo: "/logos/technologies/microsoft.svg" },
      { nom: "Veeam", logo: "/images/partenaires/logos/technologies/veeam-wordmark.svg" },
      { nom: "Kaspersky", logo: "/images/partenaires/logos/technologies/kaspersky-wordmark.svg" },
    ],
    couleur: "rouge",
  },
  {
    numero: "05",
    id: "digitalisation",
    titre: "Digitalisation métiers",
    accroche: "Gagnez du temps sur les opérations qui se répètent.",
    texte: "Nous connectons les applications, les données et les outils métiers pour automatiser les tâches, réduire les doubles saisies et améliorer la visibilité des équipes.",
    technologies: ["Microsoft 365", "Power Platform", "SharePoint", "Odoo", "Next.js", "Node.js", "PostgreSQL", "API & Webhooks"],
    services: ["Applications web et mobiles", "ERP, CRM et gestion documentaire", "Automatisation des workflows", "Intégration, API et tableaux de bord"],
    illustration: "/images/expertises/digitalisation-metiers-4k.webp",
    illustrationAlt: "Équipe utilisant des applications métiers connectées",
    outils: [
      { nom: "Microsoft", logo: "/logos/technologies/microsoft.svg" },
      { nom: "Odoo", logo: "/logos/technologies/odoo.svg" },
      { nom: "Next.js", logo: "/logos/technologies/nextdotjs.svg" },
      { nom: "PostgreSQL", logo: "/logos/technologies/postgresql.svg" },
    ],
    couleur: "violet",
  },
  {
    numero: "06",
    id: "services-manages",
    titre: "Services managés & support",
    accroche: "Préservez la performance après la mise en service.",
    texte: "Nous suivons les solutions, traitons les incidents et accompagnons les utilisateurs pour maintenir la qualité de service et prolonger la valeur de votre investissement.",
    technologies: ["Zabbix", "Grafana", "Prometheus", "Veeam", "GLPI", "ITIL", "Ticketing", "Support distant"],
    services: ["Monitoring et alertes", "MCO et maintien en sécurité", "Helpdesk et assistance terrain", "Formation et transfert de compétences"],
    illustration: "/images/expertises/formation-support-4k.webp",
    illustrationAlt: "Techniciens assurant le support et le suivi des utilisateurs",
    outils: [
      { nom: "Grafana", logo: "/logos/technologies/grafana.svg" },
      { nom: "Prometheus", logo: "/logos/technologies/prometheus.svg" },
      { nom: "Ansible", logo: "/logos/technologies/ansible.svg" },
      { nom: "Veeam", logo: "/images/partenaires/logos/technologies/veeam-wordmark.svg" },
    ],
    couleur: "vert",
  },
];

export default function Ecosysteme() {
  return (
    <>
      <Entete />
      <main className="pageEcosysteme" id="accueil">
        <section className="ecosystemeHero">
          <Image
            className="ecosystemeHero__image"
            src="/images/expertises/datacenter-cloud-4k.webp"
            alt="Infrastructure de datacenter avec serveurs et liaisons réseau"
            fill
            sizes="100vw"
            preload
          />
          <div className="ecosystemeHero__voile" aria-hidden="true" />
          <div className="ecosystemeHero__grain" aria-hidden="true" />
          <div className="conteneur ecosystemeHero__contenu">
            <LienCinematique className="ecosystemeRetour" href="/" direction="retour"><span aria-hidden="true">←</span> Retour à l’accueil</LienCinematique>
            <span className="eyebrow">Une réponse complète à vos enjeux informatiques</span>
            <h1>Une informatique cohérente.<br /><em>Sans zone de faiblesse.</em></h1>
            <p>Infrastructure, réseaux, sécurité, logiciels et support réunis pour réduire les interruptions, protéger vos données et simplifier le travail de vos équipes.</p>
            <LienCinematique className="bouton bouton--accent pageLienForum" href="/forum">Poser une question au Forum <span aria-hidden="true">↗</span></LienCinematique>
            <div className="ecosystemeHero__reperes">
              <div><strong>06</strong><span>domaines complémentaires</span></div>
              <div><strong>360°</strong><span>des équipements aux utilisateurs</span></div>
              <div><strong>1</strong><span>interlocuteur de bout en bout</span></div>
            </div>
          </div>
          <div className="ecosystemeHero__defile" aria-hidden="true"><span>Cloud</span><i>●</i><span>DevOps</span><i>●</i><span>Réseaux</span><i>●</i><span>Cyber</span><i>●</i><span>Digital</span></div>
        </section>

        <section className="ecosystemeSommaire">
          <div className="conteneur">
            <span className="ecosystemeSommaire__titre">Explorer l’écosystème</span>
            <nav aria-label="Domaines technologiques">
              {domaines.map((domaine) => <a href={`#${domaine.id}`} key={domaine.id}><span>{domaine.numero}</span>{domaine.titre}</a>)}
            </nav>
          </div>
        </section>

        <section className="section ecosystemeIntroduction">
          <div className="conteneur ecosystemeIntroduction__grille">
            <Revelation classe="ecosystemeIntroduction__titre">
              <span className="eyebrow">Une solution pensée pour votre réalité</span>
              <h2>Le bon investissement.<br /><em>Pour le bon résultat.</em></h2>
            </Revelation>
            <Revelation classe="ecosystemeIntroduction__texte">
              <p>Nous partons de vos difficultés, de vos usages, de votre budget et de ce qui existe déjà. Vous investissez ainsi dans ce qui apporte une valeur concrète, sans ajouter de complexité inutile.</p>
              <p>Notre indépendance technologique nous permet de comparer plusieurs options et de retenir celles qui offrent le meilleur équilibre entre performance, sécurité, coût et simplicité d’exploitation.</p>
            </Revelation>
          </div>
        </section>

        <section className="ecosystemeDomaines">
          <div className="conteneur">
            {domaines.map((domaine) => (
              <Revelation classe={`ecosystemeDomaine ecosystemeDomaine--${domaine.couleur}`} key={domaine.id}>
                <article id={domaine.id}>
                  <div className="ecosystemeDomaine__numero">{domaine.numero}</div>
                  <div className="ecosystemeDomaine__corps">
                    <span className="ecosystemeDomaine__surTitre">{domaine.accroche}</span>
                    <h2>{domaine.titre}</h2>
                    <p>{domaine.texte}</p>
                    <div className="ecosystemeDomaine__technologies" role="list" aria-label={`Technologies pour ${domaine.titre}`}>
                      {domaine.technologies.map((technologie) => <span role="listitem" key={technologie}>{technologie}</span>)}
                    </div>
                  </div>
                  <div className="ecosystemeDomaine__lateral">
                    <div className="ecosystemeDomaine__illustration">
                      <Image
                        className="ecosystemeDomaine__image"
                        src={domaine.illustration}
                        alt={domaine.illustrationAlt}
                        fill
                        sizes="(max-width: 520px) calc(100vw - 40px), (max-width: 850px) calc(100vw - 135px), 390px"
                      />
                      <div className="ecosystemeDomaine__voile" aria-hidden="true" />
                      <span className="ecosystemeDomaine__legende">Outils mobilisables</span>
                      <div className="ecosystemeDomaine__outils" aria-hidden="true">
                        {domaine.outils.map((outil) => (
                          <span className="ecosystemeDomaine__outil" key={outil.nom} title={outil.nom}>
                            <Image src={outil.logo} alt="" width={76} height={38} />
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ecosystemeDomaine__services">
                      <span>Services associés</span>
                      <ul>{domaine.services.map((service) => <li key={service}>{service}</li>)}</ul>
                    </div>
                  </div>
                </article>
              </Revelation>
            ))}
          </div>
        </section>

        <section className="ecosystemeFinal">
          <div className="ecosystemeFinal__halo" aria-hidden="true" />
          <div className="conteneur ecosystemeFinal__contenu">
            <Revelation>
              <span className="eyebrow">Votre résultat, pas un catalogue</span>
              <h2>Construisons une informatique<br /><em>qui travaille pour vous.</em></h2>
              <p>Expliquez-nous ce qui freine votre activité. Nous identifierons les priorités, les solutions utiles et le niveau d’accompagnement nécessaire pour obtenir un résultat durable.</p>
              <div className="ecosystemeFinal__actions">
                <LienCinematique className="bouton bouton--accent" href="/#contact" direction="retour">Présenter votre projet <span aria-hidden="true">↗</span></LienCinematique>
                <LienCinematique className="lienRetour" href="/immersion-core">Vivre Immersion Core <span aria-hidden="true">→</span></LienCinematique>
                <LienCinematique className="lienRetour" href="/" direction="retour">Retour à l’accueil <span aria-hidden="true">←</span></LienCinematique>
              </div>
            </Revelation>
          </div>
        </section>
      </main>
      <PiedDePage />
    </>
  );
}
